// Land in recipes: environment layer, schema, two-choice slots and sentences (Land brief §3–§5, §13.2).
import { test } from "node:test";
import assert from "node:assert/strict";
import snapshots from "./fixtures/land-snapshots.json";
import { generatePlaceNames } from "../src/names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe, readRecipe, recipeToFrontmatter } from "../src/names/recipe";
import { generateRiverNames } from "../src/rivers/engine";

const SNAP = snapshots as Record<string, unknown>;
const plain = (v: unknown) => JSON.parse(JSON.stringify(v));

test("land slots: no biome and Any terrain reproduce the M0 snapshots", () => {
  for (const seed of [1, 2, 3]) {
    for (const region of [undefined, "NTH", "WAL"]) {
      const names = generatePlaceNames({ recipe: britishPlaceNamesRecipe(region), slots: {}, count: 20, seed }).names;
      assert.deepEqual(plain(names), SNAP[`british ${region ?? "all"} ${seed}`], `british ${region} ${seed}`);
      const britain = generatePlaceNames({ recipe: britishPlaceNamesRecipe(region, "britain", "any"), slots: {}, count: 20, seed }).names;
      assert.deepEqual(plain(britain), SNAP[`british ${region ?? "all"} ${seed}`], `britain ${region} ${seed}`);
    }
    for (const part of ["new-land", "established"] as const) {
      const names = generatePlaceNames({ recipe: colonialPlaceNamesRecipe(part, undefined, undefined), slots: {}, count: 20, seed }).names;
      assert.deepEqual(plain(names), SNAP[`colonial ${part} ${seed}`], `${part} ${seed}`);
    }
    for (const setting of ["british", "new-land", "established"] as const) {
      assert.deepEqual(plain(generateRiverNames({ setting, count: 20, seed }).names), SNAP[`river ${setting} ${seed}`], `river ${setting} ${seed}`);
    }
  }
});

test("land slots: YAML for terrain and biome links", () => {
  const { recipe, problems } = readRecipe({ shape: { part: "organic", biome: "[[Salt Marshes]]", terrain: "salt-pans" } });
  assert.deepEqual(problems, []);
  assert.equal(recipe.shape?.biome, "[[Salt Marshes]]");
  const fm = recipeToFrontmatter(recipe).shape as Record<string, unknown>;
  assert.equal(fm.biome, "[[Salt Marshes]]");
  assert.equal(fm.terrain, "salt-pans");
  const any = recipeToFrontmatter({ shape: { part: "organic", terrain: "any" } }).shape as Record<string, unknown>;
  assert.ok(!("terrain" in any));
  assert.deepEqual(readRecipe({ shape: { terrain: "tundra" } }).problems, ["Unknown terrain “tundra”."]);
});

test("land slots: settlement in the desert never throws", () => {
  const recipe = britishPlaceNamesRecipe(undefined, "desert", "any");
  recipe.shape.feature = "settlement";
  assert.doesNotThrow(() => generatePlaceNames({ recipe, slots: {}, count: 200, seed: 4 }));
});

// ── Behaviour (Land brief §13.2) ────────────────────────────────────────────

import { BRITAIN, biomeWords, environmentMultipliers, findBiome, shortWords } from "../src/biomes";
import { wizardSentenceText } from "../src/colonialSentence";
import { generatePlaceShapesDetailed, PLACE_SHAPE_DATA } from "../src/placeShapes";
import type { GeneratedName } from "../src/names/engine";

/** Every "[label: word]" fill in an etymology, by label. */
const fills = (n: GeneratedName) => [...(n.etymology ?? "").matchAll(/\[([^:\]]+): ([^\]]+)\]/g)].map((m) => ({ label: m[1].trim().toLowerCase(), word: m[2].trim().toLowerCase() }));
const labelOf = (id: string) => (PLACE_SHAPE_DATA.categories.find((c) => c.id === id)?.label ?? id).toLowerCase();
const organic = (biome?: string, terrain?: string) => {
  const r = britishPlaceNamesRecipe(undefined, biome, terrain);
  r.render.etymology = true;
  return r;
};
/** A group share over 2,000 shapes, in batches of 50 so a batch's duplicate redraws don't skew it. */
const share = (biome: string | undefined, terrain: string, groups: string[]) => {
  const environment = environmentMultipliers(biome ? findBiome(biome) : undefined, terrain);
  const shapes = Array.from({ length: 40 }, (_, i) => generatePlaceShapesDetailed({ count: 50, seed: 100 + i, environment }).shapes).flat();
  return shapes.filter((s) => groups.includes(s.groupId)).length / shapes.length;
};

test("land slots: an organic recipe in the desert uses desert nature words", () => {
  const desert = findBiome("desert")!;
  const names = generatePlaceNames({ recipe: organic("desert"), slots: {}, count: 2000, seed: 8 }).names;
  const lists: [string, Parameters<typeof biomeWords>[1]][] = [["wild-animal", "wildAnimals"], ["bird", "birds"], ["tree", "trees"], ["wild-plant", "plants"]];
  let seen = 0;
  for (const [id, list] of lists) {
    const ok = new Set(biomeWords(desert, list).map(([w]) => w.toLowerCase()));
    const british = new Set(biomeWords(BRITAIN, list).map(([w]) => w.toLowerCase()));
    for (const f of names.flatMap(fills).filter((x) => x.label === labelOf(id))) {
      assert.ok(ok.has(f.word) || !british.has(f.word), `${id}: ${f.word}`);
      if (ok.has(f.word)) seen++;
    }
  }
  assert.ok(seen > 0, "at least one desert nature word");
  assert.ok(names.filter((n) => n.shape.groupId === "woodland").length / names.length < 0.01);
});

test("land slots: terrain and Moorland re-weight which places are named", () => {
  assert.ok(share(undefined, "coast", ["coast-and-sea"]) >= 3 * share(undefined, "any", ["coast-and-sea"]));
  const moorUpland = share("moorland", "any", ["upland-and-open-ground"]);
  assert.ok(moorUpland >= 2 * share(undefined, "any", ["upland-and-open-ground"]));
  assert.ok(share("moorland", "any", ["woodland"]) <= share(undefined, "any", ["woodland"]) / 4);
  assert.ok(share(undefined, "forest", ["woodland", "clearings"]) >= 3 * share(undefined, "any", ["woodland", "clearings"]));
  assert.ok(share(undefined, "hills", ["hills-and-slopes"]) >= 2 * share(undefined, "any", ["hills-and-slopes"]));
});

test("land slots: landform, livestock and season follow the land", () => {
  const desert = findBiome("desert")!;
  const allowed = new Set(shortWords(desert, "land", "mountains").map(([e]) => e.modern));
  const names = generatePlaceNames({ recipe: organic("desert", "mountains"), slots: {}, count: 2000, seed: 9 }).names;
  const landforms = names.flatMap(fills).filter((f) => f.label === labelOf("landform"));
  assert.ok(landforms.length > 0);
  for (const f of landforms) assert.ok(allowed.has(f.word), f.word);

  const colonial = (slots = {}) => {
    const r = colonialPlaceNamesRecipe("new-land", undefined, undefined, "savannah");
    r.render.etymology = true;
    return generatePlaceNames({ recipe: r, slots, count: 2000, seed: 10 }).names.flatMap(fills).filter((f) => f.label === labelOf("domestic-animal"));
  };
  const british = new Set(biomeWords(BRITAIN, "livestock").map(([w]) => w.toLowerCase()));
  const savannah = new Set(biomeWords(findBiome("savannah")!, "livestock").map(([w]) => w.toLowerCase()));
  const own = colonial();
  assert.ok(own.length > 0 && own.every((f) => british.has(f.word)), "incomers' own");
  const fromBiome = colonial({ "domestic-animal": { kind: "biome" } });
  assert.ok(fromBiome.length > 0 && fromBiome.every((f) => savannah.has(f.word)), "from the biome");

  const islands = generatePlaceNames({ recipe: organic("tropical-islands"), slots: {}, count: 2000, seed: 11 }).names;
  assert.ok(!islands.flatMap(fills).some((f) => f.label === labelOf("season") && f.word === "winter"));
});

test("land slots: the wizard sentences", () => {
  const cases: [Parameters<typeof wizardSentenceText>[0], Parameters<typeof wizardSentenceText>[1], string][] = [
    ["organic", { region: "all-britain", biome: "britain", terrain: "any", feature: "any" }, "Any feature from all of Britain, set in any part of Britain"],
    ["organic", { region: "north", biome: "desert", terrain: "mountains", feature: "any" }, "Any feature from the North, set in the mountains of the desert"],
    ["organic", { region: "wales", biome: "tropical-islands", terrain: "coast", feature: "landscape" }, "Landscape from Wales, set in the coasts of tropical islands"],
    ["organic", { region: "all-britain", biome: "britain", terrain: "forest", feature: "any" }, "Any feature from all of Britain, set in the forests of Britain"],
    ["new-land", { tradition: "roman", context: "contested-frontier", biome: "highland", terrain: "hills", feature: "any" }, "Roman-themed explorers in a contested frontier across the hills of the highlands, naming any feature"],
    ["new-land", { tradition: "general", context: "wild-and-unsettled", biome: "unknown", terrain: "any", feature: "any" }, "General explorers in wild and unsettled lands across any part of unknown country, naming any feature"],
    ["new-land", { tradition: "spanish", context: "contested-frontier", biome: "rainforest", terrain: "rivers", feature: "any" }, "Spanish-themed explorers in a contested frontier across the rivers and lakes of tropical rainforest, naming any feature"],
    ["established", { tradition: "roman", context: "imposition", biome: "britain", terrain: "any", feature: "any" }, "Roman-themed incomers who are ruling over the locals across any part of Britain, naming any feature"],
    ["established", { tradition: "british-imperial", context: "accommodation", biome: "monsoon", terrain: "wetland", feature: "settlement" }, "British-themed incomers who are living alongside the locals across the wetlands of the monsoon lands, naming settlement"],
    ["new-land", { tradition: "dutch", context: "sparse-or-weak-native-presence", biome: "unknown", terrain: "islands", feature: "any" }, "Dutch-themed explorers in lands with a sparse, or weak, native presence across the islands of unknown country, naming any feature"],
  ];
  for (const [part, settings, sentence] of cases) assert.equal(wizardSentenceText(part, settings), sentence);
});
