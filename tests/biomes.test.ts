// Biomes (Tribal brief §3, §22.1).
import { test } from "node:test";
import assert from "node:assert/strict";
import { BIOMES, type BiomeList, biomeEntries, biomeWords, pluralOf, TERRAINS, terrainWords } from "../src/biomes";

/** Tribal brief §17.3. */
export const BANNED = [
  "savages", "barbarians", "primitives", "heathens", "redskins", "squaw", "bushmen", "hottentots",
  "eskimos", "head-hunters", "cannibals", "natives",
];

test("biomes: the 12 ids in menu order", () => {
  assert.deepEqual(
    BIOMES.map((b) => b.id),
    ["temperate", "moorland", "boreal", "cool-rainforest", "mediterranean", "steppe", "desert", "savannah", "rainforest", "monsoon", "tropical-islands", "highland"],
  );
});

test("biomes: terrain weights sum to 100, and every live terrain has words", () => {
  for (const b of BIOMES) {
    assert.equal(Object.values(b.terrainWeights).reduce((n, w) => n + w, 0), 100, b.id);
    for (const t of TERRAINS) {
      if (b.terrainWeights[t] === 0) continue;
      const land = terrainWords(b, "land", t).length;
      const water = terrainWords(b, "water", t).length;
      assert.ok(land >= 2 || water >= 2, `${b.id} ${t}`);
    }
  }
});

const MINIMUMS: Record<BiomeList, number> = {
  wildAnimals: 5, birds: 8, creatures: 6, trees: 5, plants: 5, crops: 2, livestock: 1, lifeways: 10, sacred: 5, materials: 5,
};

test("biomes: list sizes, lifeway weights, no duplicates, no banned words", () => {
  for (const b of BIOMES) {
    for (const [list, min] of Object.entries(MINIMUMS) as [BiomeList, number][]) {
      const words = biomeWords(b, list).map(([w]) => w);
      assert.ok(words.length >= min, `${b.id} ${list}: ${words.length}`);
      assert.equal(new Set(words).size, words.length, `${b.id} ${list} has a duplicate`);
    }
    assert.equal(biomeWords(b, "lifeways").reduce((n, [, w]) => n + w, 0), 100, b.id);
    const every = [
      ...(Object.keys(MINIMUMS) as BiomeList[]).flatMap((l) => biomeWords(b, l).map(([w]) => w)),
      ...TERRAINS.flatMap((t) => [...terrainWords(b, "land", t), ...terrainWords(b, "water", t)].map(([w]) => w)),
    ];
    for (const w of every) {
      for (const banned of BANNED) assert.ok(!new RegExp(`\\b${banned}\\b`, "i").test(w), `${b.id}: ${w}`);
    }
    for (const t of TERRAINS) {
      for (const kind of ["land", "water"] as const) {
        const words = (b[kind][t] ?? []).map(([w]) => w);
        assert.equal(new Set(words).size, words.length, `${b.id} ${kind} ${t} has a duplicate`);
      }
    }
  }
});

test("biomes: plurals", () => {
  const cases: [string, string][] = [
    ["wolf", "wolves"], ["deer", "deer"], ["ox", "oxen"], ["cactus", "cacti"], ["lynx", "lynxes"],
    ["flying fox", "flying foxes"], ["bird of paradise", "birds of paradise"], ["thorn bush", "thorn bushes"],
    ["monkey-puzzle", "monkey-puzzles"],
  ];
  for (const [word, plural] of cases) assert.equal(pluralOf(word), plural, word);
});

test("biomes: slot entries for the nature slots", () => {
  for (const b of BIOMES) {
    for (const id of ["bird", "wild-animal", "fish-and-other-creatures", "tree", "wild-plant"]) {
      const entries = biomeEntries(b, id);
      assert.ok(entries && entries.length > 0, `${b.id} ${id}`);
      for (const [entry, weight] of entries) {
        assert.equal(entry.fuses, "no");
        assert.ok(weight > 0);
      }
    }
    // Land brief §2.6: livestock and crops are biome lists too; other slots are not.
    assert.ok(biomeEntries(b, "domestic-animal")!.length > 0);
    assert.equal(biomeEntries(b, "personal-name"), undefined);
  }
  const monkeyPuzzle = biomeEntries(BIOMES.find((b) => b.id === "highland")!, "tree")!.find(([e]) => e.modern === "monkey-puzzle")!;
  assert.deepEqual(monkeyPuzzle[0].forms, ["Monkey-Puzzle"]);
});
