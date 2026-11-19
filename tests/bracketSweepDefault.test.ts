// Second pass (brief §12 §5): the bracket sweep covers every module's default state, not only `people: real` or the placeholder runs: no name at the default state of any module, for
// every culture of the distinctness list, holds a bracket label ("Sun Lord of [place]" and "Spring Maiden of [holy person]" were found, and now take a settlement name and a holy person).
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import lens from "../src/data/lens.json";
import { measureStates } from "./helpers/probeStates";

const D = (lens as unknown as { distinctness: { general: string[]; excludedModules: string[] } }).distinctness;

test("default state: no module gives a bracket label for any culture (seeds 1 to 3)", () => {
  const m = measureStates([...new Set(D.general)], [1, 2, 3], D.excludedModules, "default");
  const found: string[] = [];
  for (const [module, byCulture] of Object.entries(m.names)) for (const [culture, bySeed] of Object.entries(byCulture)) for (const names of Object.values(bySeed)) for (const n of names) if (n.includes("[")) found.push(`${module} ${culture}: ${n}`);
  assert.deepEqual([...new Set(found)].slice(0, 20), []);
});
