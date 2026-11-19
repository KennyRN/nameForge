// Second pass (brief §12 §3): each 6b culture's plant, tree, bird and beast fills come from lists of its own (at least twelve in each), and its land and water names take no word from the
// shared English lists that is not in its own, and no English rank or administrative word.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { FILLS as FILLS_6B } from "../scripts/tier6b/fills.mjs";
import { FILLS as FILLS_6C } from "../scripts/tier6c/fills.mjs";
import { hasEnglishRank, OWN_FILL_CULTURES } from "../src/tier6a";
import { measureStates } from "./helpers/probeStates";

const FILLS = { ...FILLS_6B, ...FILLS_6C };
/** The cultures whose land and water modules are written (6b); the 6c cultures join this list with their land and sea group. */
const CULTURES = Object.keys(FILLS_6B);
const MODULES = ["mountainNames", "forestNames", "desertNames", "moorNames", "wetlandNames", "grasslandNames", "seasLakes", "coastsIslands", "seaCharts", "riversInland", "hillsValleys", "farmland", "lands"];

test("fills: every 6b culture has at least twelve own words in each list of plants, trees, birds, beasts and water creatures", () => {
  for (const c of Object.keys(FILLS)) for (const [kind, text] of Object.entries(FILLS[c as keyof typeof FILLS])) assert.ok((text as string).split("|").length >= 12, `${c} ${kind}`);
  for (const c of OWN_FILL_CULTURES) assert.ok(c in FILLS || ["steppe", "arabic-persian"].includes(c), c);
});

test("fills: no fill in a 6b culture's land and water names comes from the shared English lists, and none is an English rank or shire", () => {
  // The English-only plants and animals of the shared lists: none may be a fill of a 6b culture unless its own lists hold it.
  const ENGLISH = ["Rowan", "Oak", "Yew", "Maple", "Beech", "Ash", "Alder", "Holly", "Hawthorn", "Lime", "Vicuna", "Llama", "Puffin", "Hedgehog", "Badger", "Squirrel", "Wren", "Robin", "Thrush", "Blackbird", "Magpie", "Dormouse", "Stoat", "Weasel", "Adder", "Newt", "Bluebell", "Foxglove", "Otter", "Seal", "Cod", "Herring"];
  const shared = new Set(ENGLISH);
  const m = measureStates(CULTURES, [1, 2, 3, 4, 5], [], "default");
  const bad: string[] = [];
  for (const module of MODULES) {
    for (const c of CULTURES) {
      const own = new Set(Object.values(FILLS[c as keyof typeof FILLS]).flatMap((t) => (t as string).split("|")));
      for (const names of Object.values(m.names[module]?.[c] ?? {})) for (const n of names) {
        if (hasEnglishRank(n)) bad.push(`${module} ${c}: ${n} (English word)`);
        for (const w of shared) if (!own.has(w) && new RegExp(`(^|[^A-Za-z])${w}(s|'s)?($|[^A-Za-z])`).test(n)) bad.push(`${module} ${c}: ${n} (${w})`);
      }
    }
  }
  assert.deepEqual([...new Set(bad)].slice(0, 25), []);
});
