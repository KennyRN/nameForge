// Brief 6d A1: fills true to the biome. Each land and water module draws only the fills tagged for its own biome, plus the untagged generic ones.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUILT_IN_VOCAB, poolEntries } from "../src/settlement/vocab";
import { FILL_KIND, FILL_POOLS, MODULE_BIOME, OWN_FILL_CULTURES, splitFill } from "../src/tier6a";
import { TIER6B_FILLS } from "../src/tier6aData";
import { generateWildsNames } from "../src/wilds/engine";
import { FILLS as FILLS_6B } from "../scripts/tier6b/fills.mjs";
import { FILLS as FILLS_6C } from "../scripts/tier6c/fills.mjs";
import { withDesert } from "../scripts/tier6d/biomes.mjs";

const CODES = [...new Set(Object.values(MODULE_BIOME))];
const OWN = Object.keys(TIER6B_FILLS).filter((c) => OWN_FILL_CULTURES.includes(c));

test("biome fills: no module draws a fill tagged only for another biome", () => {
  const bad: string[] = [];
  for (const culture of OWN) for (const pool of FILL_POOLS) {
    if (BUILT_IN_VOCAB.pools[pool]?.entries.some((e) => e.h === true)) continue;
    for (const code of CODES) {
      const live = poolEntries(BUILT_IN_VOCAB, pool, { culture, era: "MD", fantastic: false, biome: code } as never).map(([e]) => e.w);
      const tagged = new Map((TIER6B_FILLS[culture]?.[FILL_KIND[pool]] ?? []).map((raw) => { const s = splitFill(raw); return [s.w, s.biomes] as const; }));
      const all = (TIER6B_FILLS[culture]?.[FILL_KIND[pool]] ?? []).map((r) => splitFill(r));
      const anyFits = all.some((s) => !s.biomes || s.biomes.includes(code));
      if (!anyFits) continue; // a culture with nothing for the biome reads them all
      for (const w of live) { const b = tagged.get(w); if (b && !b.includes(code)) bad.push(`${culture} ${pool} ${code}: ${w}`); }
    }
  }
  assert.deepEqual(bad.slice(0, 10), []);
});

test("biome fills: each desert-offering culture has at least eight desert plants and eight desert animals", () => {
  const short: string[] = [];
  for (const culture of ["turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african", "indian", "chinese"]) {
    const d = (kinds: string[]) => kinds.flatMap((k) => TIER6B_FILLS[culture][k]).filter((raw) => splitFill(raw).biomes?.includes("d")).length;
    if (d(["trees", "plants"]) < 8 || d(["birds", "beasts"]) < 8) short.push(`${culture} ${d(["trees", "plants"])}/${d(["birds", "beasts"])}`);
  }
  assert.deepEqual(short, []);
});

test("biome fills: no plant or animal of a wet or forest land stands in a Chinese or Indian desert", () => {
  const WRONG = /Bamboo|Maple|Pine|Plum|Banyan|Lotus|Granary|Lantern|Jade|Temple|Elephant|Leopard|Tiger|Peacock|Rhinoceros|Pilgrim/;
  for (const culture of ["chinese", "indian"]) for (let seed = 1; seed <= 20; seed++) {
    for (const n of generateWildsNames({ module: "desertNames", culture, era: "MD", where: "home", people: "placeholders", count: 30, seed } as never).names as { text: string }[]) {
      assert.ok(!WRONG.test(n.text), `${culture} desert: ${n.text}`);
    }
  }
});

test("biome fills: the 6b and 6c lists in the scripts keep at least twelve words in each kind", () => {
  for (const [c, l] of Object.entries({ ...FILLS_6B, ...FILLS_6C }) as [string, Record<string, string>][]) for (const [k, v] of Object.entries(withDesert(c, l))) assert.ok(v.split("|").length >= 12, `${c} ${k}`);
});
