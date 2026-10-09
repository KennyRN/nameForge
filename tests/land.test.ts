// Land: biomes, Britain and terrains (Land brief §2, §13.1).
import { test } from "node:test";
import assert from "node:assert/strict";
import biomeJson from "../src/data/biomes.json";
import {
  availableTerrains,
  BIOMES,
  biomeWords,
  BRITAIN,
  environmentMultipliers,
  findBiome,
  shortWords,
  TERRAIN_CHOICES,
  TERRAINS,
  terrainWeights,
} from "../src/biomes";
import { NAME_WORDS } from "../src/names/engine";

const b = (id: string) => findBiome(id)!;
const TABLE: Record<string, number[]> = {
  temperate: [20, 15, 5, 20, 15, 15, 7, 3],
  moorland: [15, 35, 15, 2, 15, 8, 8, 2],
  boreal: [10, 10, 10, 30, 15, 15, 7, 3],
  "cool-rainforest": [5, 10, 20, 25, 25, 10, 2, 3],
  mediterranean: [15, 25, 10, 5, 25, 5, 5, 10],
  steppe: [50, 15, 8, 2, 0, 20, 5, 0],
  desert: [45, 15, 15, 0, 10, 15, 0, 0],
  savannah: [40, 15, 5, 5, 5, 20, 10, 0],
  rainforest: [10, 10, 5, 40, 5, 25, 5, 0],
  monsoon: [30, 15, 10, 10, 10, 15, 10, 0],
  "tropical-islands": [5, 10, 15, 5, 35, 3, 2, 25],
  highland: [15, 15, 45, 5, 0, 15, 5, 0],
};

test("land: Britain's lists are the built-in category arrays", () => {
  const pairs: [string, string][] = [
    ["wildAnimals", "wild-animal"], ["birds", "bird"], ["creatures", "fish-and-other-creatures"], ["trees", "tree"],
    ["plants", "wild-plant"], ["crops", "crop"], ["livestock", "domestic-animal"], ["shortLand", "landform"],
    ["shortWater", "water-or-wetland-feature"], ["ground", "soil-or-ground"], ["resources", "resource"], ["seasons", "season"],
  ];
  for (const [list, category] of pairs) assert.equal(BRITAIN.entries![list], NAME_WORDS.categories[category], list);
});

test("land: Britain's terrain tags cover every landform and water word, and every terrain", () => {
  const tags = BRITAIN.terrainTags!;
  for (const id of ["landform", "water-or-wetland-feature"]) {
    for (const e of NAME_WORDS.categories[id]) assert.ok(tags[e.modern]?.length, `${e.modern} has no terrain`);
  }
  for (const t of TERRAINS) {
    assert.ok(shortWords(BRITAIN, "land", t).length > 0, `${t} land`);
    assert.ok(shortWords(BRITAIN, "water", t).length > 0, `${t} water`);
  }
});

test("land: the terrain table, short words, ground, resources and seasons", () => {
  assert.deepEqual(BIOMES.map((x) => x.id), Object.keys(TABLE));
  for (const biome of BIOMES) {
    assert.deepEqual(TERRAINS.map((t) => biome.terrainWeights[t]), TABLE[biome.id], biome.id);
    assert.ok(!("open" in biome.terrainWeights) && !("open" in biome.land), biome.id);
    for (const t of TERRAINS) {
      if (biome.terrainWeights[t] === 0) continue;
      const n = shortWords(biome, "land", t).length + shortWords(biome, "water", t).length;
      assert.ok(n >= 2, `${biome.id} ${t}`);
    }
    assert.ok(biome.ground.length >= 4 && biome.resources.length >= 4 && biome.seasons.length >= 2, biome.id);
    assert.equal(Object.values(terrainWeights(biome, "any")).reduce((n, w) => n + w, 0), 100, biome.id);
  }
  assert.ok(!(biomeJson as { biomes: { terrainWeights: object }[] }).biomes.some((x) => "open" in x.terrainWeights));
});

test("land: terrain choices and availability", () => {
  assert.deepEqual(terrainWeights(b("steppe"), "mountains"), { mountains: 100 });
  const steppe = availableTerrains(b("steppe")).map((t) => t.id);
  assert.ok(!steppe.includes("coast") && !steppe.includes("islands"));
  assert.ok(!availableTerrains(b("desert")).some((t) => t.id === "forest"));
  assert.equal(availableTerrains(b("temperate")).length, 8);
  assert.deepEqual(TERRAIN_CHOICES.map((t) => t.id), ["any", "plains", "hills", "mountains", "forest", "coast", "rivers", "wetland", "islands"]);
});

test("land: environment multipliers", () => {
  assert.equal(environmentMultipliers(undefined, "any"), undefined);
  assert.equal(environmentMultipliers(BRITAIN, "any"), undefined);
  const desert = environmentMultipliers(b("desert"), "mountains")!;
  assert.equal(desert.groups["mountains-and-rock"], 4.5);
  assert.equal(desert.generics.desert, 5);
  assert.equal(environmentMultipliers(b("moorland"), "any")!.groups.woodland, 0.15);
  const forest = environmentMultipliers(b("temperate"), "forest")!;
  assert.equal(forest.groups.woodland, 4);
  assert.equal(forest.groups.clearings, 3);
});

test("land: renames and Moorland", () => {
  const labels: Record<string, string> = {
    temperate: "Temperate lands", steppe: "Steppe and grassland", mediterranean: "Mediterranean lands", highland: "Highlands", moorland: "Moorland",
  };
  for (const [id, label] of Object.entries(labels)) assert.equal(b(id).label, label);
  const moor = b("moorland");
  const minimums: [Parameters<typeof biomeWords>[1], number][] = [
    ["wildAnimals", 5], ["birds", 8], ["creatures", 6], ["trees", 5], ["plants", 5], ["crops", 2], ["livestock", 1], ["lifeways", 10], ["sacred", 5], ["materials", 5],
  ];
  for (const [list, n] of minimums) assert.ok(biomeWords(moor, list).length >= n, list);
  assert.equal(biomeWords(moor, "lifeways").reduce((n, [, w]) => n + w, 0), 100);
});
