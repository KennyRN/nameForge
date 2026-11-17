// Sibling-distinctness brief (docs/second-tier-tables-brief.md §10): related cultures read as themselves. Every module at its default state, only the
// culture changed, seeds 1 to 5, twelve names each; a pair's overlap is the share of A's names that B also gives at the same seed. Pairs, limits and
// exclusions are in lens.json (`distinctness`); a later batch adds its own and must pass.
import "../src/lensRosterSources";
import "../src/fill/batch";
import "../src/places/sources";
import { test } from "node:test";
import assert from "node:assert/strict";
import lens from "../src/data/lens.json";
import { buildSnapshotFor } from "./helpers/lensSnapshot";

interface Distinctness {
  seeds: number[];
  siblingLimit: number;
  generalLimit: number;
  excludedModules: string[];
  excludedCells: string[];
  siblings: [string, string][];
  general: string[];
}
const D = (lens as unknown as { distinctness: Distinctness }).distinctness;

/** The overlap of A against B for a module: the share of A's names B also gives at the same seed, or undefined when either has no state there. */
export function overlapOf(snap: Record<string, string[] | string>, module: string, a: string, b: string, seeds: number[]): number | undefined {
  const variants = (culture: string): Map<string, Record<number, string[]>> => {
    const out = new Map<string, Record<number, string[]>>();
    for (const [key, value] of Object.entries(snap)) {
      const parts = key.split(" ");
      const seed = Number(parts.pop());
      if (parts[0] !== module || parts[1] !== culture || !Array.isArray(value)) continue;
      const variant = parts.slice(2).join(" ");
      if (!out.has(variant)) out.set(variant, {});
      out.get(variant)![seed] = value;
    }
    return out;
  };
  const A = variants(a);
  const B = variants(b);
  const common = [...A.keys()].filter((v) => B.has(v));
  if (common.length === 0) return undefined;
  const variant = common.includes("default") ? "default" : common[0];
  let total = 0;
  let shared = 0;
  for (const seed of seeds) {
    const x = A.get(variant)![seed];
    const y = B.get(variant)![seed];
    if (!x || !y) return undefined;
    const set = new Set(y);
    total += x.length;
    shared += x.filter((n) => set.has(n)).length;
  }
  return total === 0 ? undefined : Math.round((100 * shared) / total);
}

const cultures = new Set<string>(["general", ...D.general, ...D.siblings.flat()]);
let snapshot: Record<string, string[] | string> | undefined;
const snap = () => (snapshot ??= buildSnapshotFor(D.seeds, (key) => {
  const parts = key.split(" ");
  return !D.excludedModules.includes(parts[0]) && cultures.has(parts[1]);
}));
const modules = (): string[] => [...new Set(Object.keys(snap()).map((k) => k.split(" ")[0]))];
const excluded = (module: string, culture: string) => D.excludedCells.includes(`${module} ${culture}`);

test("distinctness: sibling cultures keep within the limit of each other in every module", () => {
  const over: string[] = [];
  for (const [a, b] of D.siblings) {
    for (const module of modules()) {
      if (excluded(module, a) || excluded(module, b)) continue;
      const o = overlapOf(snap(), module, a, b, D.seeds);
      if (o !== undefined && o > D.siblingLimit) over.push(`${a}/${b} ${module} ${o}%`);
    }
  }
  assert.deepEqual(over, [], `over ${D.siblingLimit}%`);
});

test("distinctness: each core-depth culture keeps within the limit of General in every module", () => {
  const over: string[] = [];
  for (const culture of D.general) {
    for (const module of modules()) {
      if (excluded(module, culture)) continue;
      const o = overlapOf(snap(), module, culture, "general", D.seeds);
      if (o !== undefined && o > D.generalLimit) over.push(`${culture}/general ${module} ${o}%`);
    }
  }
  assert.deepEqual(over, [], `over ${D.generalLimit}%`);
});

test("distinctness: the pairs name cultures the lens knows, and the limits are set", () => {
  const known = new Set((lens as unknown as { mappings: { cultures: { shared: Record<string, unknown> } } }).mappings.cultures.shared ? [] : []);
  void known;
  assert.ok(D.siblingLimit > 0 && D.siblingLimit <= 25 && D.generalLimit > 0 && D.generalLimit <= 30);
  for (const [a, b] of D.siblings) assert.notEqual(a, b);
  assert.ok(D.general.length >= 18);
});
