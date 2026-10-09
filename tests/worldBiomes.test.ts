// World place names in other biomes (Land brief §7, §13.3).
import { test } from "node:test";
import assert from "node:assert/strict";
import snapshots from "./fixtures/land-snapshots.json";
import { allBiomes, BIOMES, biomeWords, findBiome } from "../src/biomes";
import { biomeListEntry, cultureUsesBiomes, generateWorldPlaceNames, WORLD_CULTURES, WORLD_DATA } from "../src/world/engine";

const SNAP = snapshots as Record<string, unknown>;
const plain = (v: unknown) => JSON.parse(JSON.stringify(v));
const has = (text: string, word: string) => new RegExp(`(^|[^A-Za-z])${word}($|[^A-Za-z])`, "i").test(text);

test("world biomes: Homeland with Any terrain matches the snapshots", () => {
  for (const culture of WORLD_CULTURES) {
    for (const era of culture.eras) {
      const names = generateWorldPlaceNames({ culture: culture.id, era: era.id, count: 20, seed: 1, terrain: "any" }).names;
      assert.deepEqual(plain(names), SNAP[`world ${culture.id} ${era.id}`], `${culture.id} ${era.id}`);
    }
  }
});

test("world biomes: every swapping culture in every biome makes whole names", () => {
  for (const culture of WORLD_CULTURES.filter((c) => cultureUsesBiomes(c.id))) {
    for (const biome of allBiomes()) {
      for (const era of culture.eras) {
        const names = generateWorldPlaceNames({ culture: culture.id, era: era.id, biome, count: 500, seed: 2 }).names;
        for (const n of names) {
          assert.ok(n.text.length > 0 && !n.text.includes("{"), `${culture.id} ${biome.id}: ${n.text}`);
        }
      }
    }
  }
});

test("world biomes: kept entries survive and swapped lists change", () => {
  const chinese = generateWorldPlaceNames({ culture: "chinese", biome: findBiome("rainforest"), count: 5000, seed: 3 }).names;
  assert.ok(chinese.some((n) => /Dragon/.test(n.text)));
  const wild = WORLD_DATA.cultures.find((c) => c.id === "anglo-saxon")!.lists.wild.map((e) => e.split("|")[0].replace("~", ""));
  const desert = new Set(biomeWords(findBiome("desert")!, "wildAnimals").map(([w]) => w.toLowerCase()));
  const names = generateWorldPlaceNames({ culture: "anglo-saxon", biome: findBiome("desert"), count: 2000, seed: 4 }).names;
  for (const w of wild.filter((x) => !desert.has(x.toLowerCase()))) {
    // A word from the original wild list appears only through another list that still has it.
    for (const n of names) assert.ok(!(has(n.etymology, `wild animal: ${w}`)), `${w} in ${n.text}`);
  }
});

test("world biomes: Egyptian has nothing to swap", () => {
  assert.equal(cultureUsesBiomes("egyptian"), false);
  const home = generateWorldPlaceNames({ culture: "egyptian", count: 20, seed: 5 }).names;
  for (const biome of BIOMES) assert.deepEqual(generateWorldPlaceNames({ culture: "egyptian", biome, terrain: "mountains", count: 20, seed: 5 }).names, home);
});

test("world biomes: Norse at home in the mountains changes only land and water names", () => {
  const before = generateWorldPlaceNames({ culture: "norse", count: 20, seed: 1 }).names;
  const after = generateWorldPlaceNames({ culture: "norse", terrain: "mountains", count: 20, seed: 1 }).names;
  after.forEach((n, i) => {
    if (n.text !== before[i].text) assert.ok(/\{(feature|water|peak)/.test(n.template), n.template);
  });
});

test("world biomes: plurals of biome words", () => {
  assert.equal(biomeListEntry("deer"), "Deer|Deer");
  assert.equal(biomeListEntry("hornbill"), "Hornbill|Hornbills");
});
