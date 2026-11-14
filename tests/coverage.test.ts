// The coverage ratchet (shared lens brief §6.4): no cell of the report may fall below the baseline in
// tests/fixtures/coverage-baseline.json, and a cell that has met its target must keep meeting it.
// Cells under target don't fail: they are the report's job. Re-record the baseline deliberately with
// CAPTURE_COVERAGE_BASELINE=1, and say so in the commit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { buildCoverage } from "../src/coverage";
import { type CoverageBaseline, coverageBaseline, coverageCells, ratchetFailures } from "../src/coverageCells";

const FIXTURE = "tests/fixtures/coverage-baseline.json";
const report = buildCoverage();

if (process.env.CAPTURE_COVERAGE_BASELINE) {
  writeFileSync(FIXTURE, `${JSON.stringify(coverageBaseline(report), null, 1)}\n`);
}
const baseline: CoverageBaseline = JSON.parse(readFileSync(FIXTURE, "utf8"));

test("coverage ratchet: no cell falls below the baseline, and no met target is lost", () => {
  assert.deepEqual(ratchetFailures(baseline, report), []);
});

test("coverage ratchet: the baseline covers every module and every kind of cell", () => {
  const keys = Object.keys(baseline.cells);
  for (const kind of ["culture", "era", "style", "tone", "region", "kind", "total"]) assert.ok(keys.some((k) => k.startsWith(`${kind}|`)), kind);
  // Modules added since the baseline was recorded have no cells in it until the final re-record (place modules split brief §10.2).
  const NEW_SINCE_BASELINE = ["riversInland", "hillsValleys", "farmland", "lands"];
  assert.equal(new Set(keys.filter((k) => k.startsWith("era|")).map((k) => k.split("|")[1])).size, report.modules.filter((m) => !NEW_SINCE_BASELINE.includes(m.module)).length, "an era cell for every module");
  assert.equal(report.withoutAdapter.length, 0);
  assert.ok(baseline.thinPools.count > 0);
});

test("coverage ratchet: it fails when a cell falls, and passes when it rises", () => {
  const cells = coverageCells(report);
  const some = (prefix: string, min: number) => Object.entries(cells).find(([k, c]) => k.startsWith(prefix) && c.v >= min)!;

  // A cell that falls fails.
  const [fallKey, fallCell] = some("culture|", 2);
  const fallen: CoverageBaseline = { ...baseline, cells: { ...baseline.cells, [fallKey]: { ...fallCell, v: fallCell.v + 1 } } };
  const failures = ratchetFailures(fallen, report);
  assert.equal(failures.length, 1);
  assert.match(failures[0], new RegExp(`^${fallKey.replace(/[|]/g, "\\|")}: fell from ${fallCell.v + 1} to ${fallCell.v}`));

  // A cell that rises passes: the baseline is lower than the report.
  const risen: CoverageBaseline = { ...baseline, cells: { ...baseline.cells, [fallKey]: { ...fallCell, v: fallCell.v - 1 } } };
  assert.deepEqual(ratchetFailures(risen, report), []);

  // A cell that had met its target and no longer does fails, even though its number hasn't fallen
  // (here: the same report with that cell's target raised above its value).
  const metModule = report.modules.find((m) => Object.values(m.cultures).some((c) => c.target && !c.excluded && !c.notOffered && c.words >= c.target.words && c.words > 0))!;
  const metCulture = Object.entries(metModule.cultures).find(([, c]) => c.target && !c.excluded && !c.notOffered && c.words >= c.target.words && c.words > 0)![0];
  const harder = structuredClone(report);
  const cell = harder.modules.find((m) => m.module === metModule.module)!.cultures[metCulture];
  cell.target = { ...cell.target!, words: cell.words + 1 };
  const lost = ratchetFailures(baseline, harder);
  assert.equal(lost.length, 1);
  assert.match(lost[0], /met its target before .* and no longer does/);
  assert.deepEqual(ratchetFailures(baseline, report), [], "and the real report still passes");

  // A cell that disappears fails.
  const gone = { ...baseline, cells: { ...baseline.cells, "culture|noSuchModule|english|words": { v: 1 } } };
  assert.match(ratchetFailures(gone, report)[0], /the cell is gone/);

  // A thin pool that loses entries, or a thin pool that appears, fails.
  const [poolKey, entries] = Object.entries(baseline.thinPools.entries).find(([, n]) => n > 0)!;
  const richer: CoverageBaseline = { ...baseline, thinPools: { ...baseline.thinPools, entries: { ...baseline.thinPools.entries, [poolKey]: entries + 1 } } };
  assert.match(ratchetFailures(richer, report)[0], /^pool .*: fell from/);
  const fewer: CoverageBaseline = { ...baseline, thinPools: { ...baseline.thinPools, count: baseline.thinPools.count - 1 } };
  assert.match(ratchetFailures(fewer, report)[0], /^thin pools: /);
});

test("coverage ratchet: a profile that disappears fails, and a delegated or closed kind has no target to lose", () => {
  const fresh = coverageBaseline(report);
  const [profileKey] = Object.entries(fresh.cells).find(([k, c]) => k.endsWith("|profile") && c.v === 1)!;
  assert.deepEqual(ratchetFailures(fresh, report), []);
  const [, module, culture] = profileKey.split("|");
  const lost = structuredClone(report);
  lost.modules.find((m) => m.module === module)!.cultures[culture].profile = false;
  assert.match(ratchetFailures(fresh, lost)[0], new RegExp(`^${profileKey.replace(/[|]/g, "\\|")}: fell from 1 to 0`));
  // The settlement names sizes are delegated: counted, with no target.
  assert.equal(fresh.cells["kind|settlementNames|hamlet"].t, undefined);
  assert.equal(fresh.cells["kind|skyNames|sign"].t, undefined);
  assert.equal(fresh.cells["kind|innNames|tavern"].t, 6, "an ordinary kind keeps the target");
});
