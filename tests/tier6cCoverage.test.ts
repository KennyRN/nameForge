// Brief 6c §B4: every core cell of the four cultures of batch 6c, in every module the batch has content for, meets its target or is excluded.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCoverage } from "../src/coverage";
const CULTURES = ["indian", "chinese", "japanese", "korean"];
/** The settlement names are delegated to the world engine (their cells are not held to the kind target, as for every culture), and the styles brief owns the four modules marked `deferred`. */
const NOT_COUNTED = new Set(["settlementNames", "settlementKit"]);
const DEFERRED = new Set(["starsSpace", "hyperspaceCharts", "spacecraft", "riverNames"]);

test("6c: the four cultures of batch 6c meet their cells in every module that offers them, or are excluded", () => {
  const report = buildCoverage();
  const short: string[] = [];
  for (const m of report.modules) {
    if (NOT_COUNTED.has(m.module)) continue;
    for (const c of CULTURES) {
      const cell = m.cultures[c] as { below?: boolean; words: number; shapes: number } | undefined;
      if ((cell as { deferred?: string } | undefined)?.deferred) assert.ok(DEFERRED.has(m.module), `${m.module} ${c} is deferred but is not a styles module`);
      if (cell?.below) short.push(`${m.module} ${c} ${cell.words}/${cell.shapes}`);
    }
  }
  assert.ok(short.length === 0, `${short.length} cells below target: ${short.slice(0, 30).join("; ")}`);
});

test("6c: deserts are exempt for Japanese and Korean (marked in lens.json) and written at target for Indian and Chinese", () => {
  const report = buildCoverage();
  const m = report.modules.find((x) => x.module === "desertNames");
  assert.ok(m);
  for (const c of ["japanese", "korean"]) {
    const cell = m.cultures[c] as { excluded?: boolean; below?: boolean; words: number } | undefined;
    assert.ok(cell?.excluded && !cell.below, `desertNames ${c} should be excluded`);
  }
  for (const c of ["indian", "chinese"]) {
    const cell = m.cultures[c] as { excluded?: boolean; below?: boolean } | undefined;
    assert.ok(cell && !cell.excluded && !cell.below, `desertNames ${c}`);
  }
});

test("6c: family names count the native surnames for Chinese, Japanese and Korean, and Indian is exempt by design (not excluded)", () => {
  const report = buildCoverage();
  const m = report.modules.find((x) => x.module === "familyNames");
  assert.ok(m);
  for (const c of ["chinese", "japanese", "korean"]) {
    const cell = m.cultures[c] as { excluded?: boolean; exempt?: string; below?: boolean; words: number } | undefined;
    assert.ok(cell && !cell.excluded && !cell.exempt && !cell.below, `familyNames ${c}`);
  }
  for (const c of ["japanese", "korean"]) assert.ok((m.cultures[c] as { words: number }).words >= 30, `${c} has 30 or more surnames`);
  const indian = m.cultures.indian as { excluded?: boolean; exempt?: string };
  assert.ok(!indian.excluded && indian.exempt === "by design");
});
