// Sibling-distinctness brief (docs/second-tier-tables-brief.md §10): related cultures read as themselves. Every module at the plugin's own default state (the states behind
// lens-offers.json: tests/fixtures/lensOffersProbe.ts `probeSpecs`), only the culture changed, seeds 1 to 5, twelve names each, for every culture the module offers; a pair's
// overlap is the share of A's names that B also gives at the same seed. Pairs, limits and exclusions are in lens.json (`distinctness`); a later batch adds its own and must pass.
// A pair, or a culture offered in a module, that is not measured fails the test, and a failure lists every pair and module with its overlap.
import { test } from "node:test";
import assert from "node:assert/strict";
import lens from "../src/data/lens.json";
import offers from "../src/data/lens-offers.json";
import { measureStates, overlap, type Measured } from "./helpers/probeStates";

interface Distinctness {
  seeds: number[];
  siblingLimit: number;
  generalLimit: number;
  /** The most inn names (percent) two core-depth cultures may share at the same seed: every pair, not only siblings (second-tier 6b Part A). */
  innLimit: number;
  /** Every pair of distinct cultures in `general`, siblings or not (second pass, brief §12). */
  pairLimit: number;
  excludedModules: string[];
  excludedCells: string[];
  siblings: [string, string][];
  general: string[];
}
const D = (lens as unknown as { distinctness: Distinctness }).distinctness;

const cultures = ["general", ...new Set([...D.general, ...D.siblings.flat()])];
let measured: Measured | undefined;
const states = () => (measured ??= measureStates(cultures, D.seeds, D.excludedModules, "default"));
const excluded = (module: string, culture: string) => D.excludedCells.includes(`${module} ${culture}`);
const modules = () => Object.keys(states().offered);

interface Row {
  module: string;
  pair: string;
  limit: number;
  overlap: number | undefined;
}
/** Every pair in every module: the siblings against each other, each core-depth culture against General. */
function rows(): Row[] {
  const out: Row[] = [];
  const pairs: [string, string, number][] = [...D.siblings.map(([a, b]): [string, string, number] => [a, b, D.siblingLimit]), ...D.general.map((c): [string, string, number] => [c, "general", D.generalLimit])];
  for (const module of modules()) {
    for (const [a, b, limit] of pairs) {
      if (excluded(module, a) || excluded(module, b)) continue;
      const offered = states().offered[module];
      if (!offered.includes(a) || !offered.includes(b)) continue;
      out.push({ module, pair: `${a}/${b}`, limit, overlap: overlap(states(), module, a, b, D.seeds) });
    }
  }
  return out;
}
const table = (list: Row[]) => list.map((r) => `${r.pair} ${r.module} ${r.overlap === undefined ? "not measured" : `${r.overlap}%`} (limit ${r.limit}%)`).join("\n");

test("distinctness: every module in lens-offers.json is measured, and every culture a module offers (of those held to a limit) has a state in it", () => {
  const offered = Object.keys((offers as unknown as { modules: Record<string, unknown> }).modules).filter((m) => !D.excludedModules.includes(m));
  const missingModules = offered.filter((m) => !modules().includes(m));
  assert.deepEqual(missingModules, [], "modules in lens-offers.json that the test does not measure");
  const missing: string[] = [];
  for (const module of modules()) {
    for (const culture of cultures) {
      if (!states().offered[module].includes(culture) || excluded(module, culture)) continue;
      const seeds = Object.keys(states().names[module]?.[culture] ?? {}).length;
      if (seeds !== D.seeds.length) missing.push(`${module} ${culture}: ${states().errors[module]?.[culture] ?? "no state"}`);
    }
  }
  assert.deepEqual(missing, [], "offered module x culture pairs the test did not measure");
  const unmeasured = rows().filter((r) => r.overlap === undefined);
  assert.deepEqual(unmeasured.map((r) => `${r.pair} ${r.module}`), [], "pairs not measured");
});

test("distinctness: sibling cultures keep within the limit of each other in every module", () => {
  const over = rows().filter((r) => r.pair.split("/")[1] !== "general" && r.overlap !== undefined && r.overlap > r.limit);
  if (over.length > 0) console.log(`siblings, every pair and module:\n${table(rows().filter((r) => r.pair.split("/")[1] !== "general"))}`);
  assert.deepEqual(over.map((r) => `${r.pair} ${r.module} ${r.overlap}%`), [], `over ${D.siblingLimit}%`);
});

test("distinctness: each core-depth culture keeps within the limit of General in every module", () => {
  const over = rows().filter((r) => r.pair.endsWith("/general") && r.overlap !== undefined && r.overlap > r.limit);
  if (over.length > 0) console.log(`against General, every culture and module:\n${table(rows().filter((r) => r.pair.endsWith("/general")))}`);
  assert.deepEqual(over.map((r) => `${r.pair} ${r.module} ${r.overlap}%`), [], `over ${D.generalLimit}%`);
});

test("distinctness: the pairs name cultures the lens knows, and the limits are set", () => {
  assert.ok(D.siblingLimit > 0 && D.siblingLimit <= 25 && D.generalLimit > 0 && D.generalLimit <= 30);
  for (const [a, b] of D.siblings) assert.notEqual(a, b);
  assert.ok(D.general.length >= 18);
});

test("distinctness: no two core-depth cultures share more than the inn limit of their inn names (every pair)", () => {
  const list = D.general.filter((c) => states().offered.innNames?.includes(c));
  assert.ok(list.length >= 18, "the core-depth cultures all offer inns");
  const over: string[] = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const o = overlap(states(), "innNames", list[i], list[j], D.seeds);
      if (o === undefined) over.push(`${list[i]}/${list[j]} not measured`);
      else if (o > D.innLimit) over.push(`${list[i]}/${list[j]} ${o}%`);
    }
  }
  assert.deepEqual(over, [], `inn names over ${D.innLimit}%`);
});

test("distinctness: no two cultures share more than the pair limit in any module (every pair, not only listed siblings)", () => {
  const over: string[] = [];
  const cs = [...new Set(D.general)];
  for (const module of modules()) {
    const offered = states().offered[module];
    for (let i = 0; i < cs.length; i++) {
      for (let j = i + 1; j < cs.length; j++) {
        const a = cs[i];
        const b = cs[j];
        if (!offered.includes(a) || !offered.includes(b) || excluded(module, a) || excluded(module, b)) continue;
        const ab = overlap(states(), module, a, b, D.seeds);
        const ba = overlap(states(), module, b, a, D.seeds);
        if (ab === undefined || ba === undefined) over.push(`${a}/${b} ${module} not measured`);
        else if (Math.max(ab, ba) > D.pairLimit) over.push(`${a}/${b} ${module} ${Math.max(ab, ba)}%`);
      }
    }
  }
  assert.deepEqual(over, [], `over ${D.pairLimit}% or not measured`);
});
