// Biomes for explorers and incomers (Tribal brief §19, §22.3).
import { test } from "node:test";
import assert from "node:assert/strict";
import snapshots from "./fixtures/biome-snapshots.json";
import { BIOMES, biomeEntries } from "../src/biomes";
import { colonialHistoryLabel } from "../src/colonialShapes";
import { colonialSentenceText } from "../src/colonialSentence";
import { generatePlaceNames, type NameWordEntry, type ResolvedSlot } from "../src/names/engine";
import { colonialPlaceNamesRecipe, readRecipe, recipeToFrontmatter, withDefaults } from "../src/names/recipe";

const SEEDS = [1, 4242, 987654321];
const RECIPES: [string, "new-land" | "established", string | undefined, string | undefined][] = [
  ["new-land general", "new-land", undefined, undefined],
  ["new-land spanish contested", "new-land", "spanish", "contested-frontier"],
  ["established general", "established", undefined, undefined],
  ["established roman imposition", "established", "roman", "imposition"],
];
const SNAPSHOTS = snapshots as Record<string, unknown>;
const NATIVE_IDS = ["bird", "wild-animal", "fish-and-other-creatures", "tree", "wild-plant"];
/** The five flora and fauna placeholders a biome replaces. [native place] and [native people] are
 * filled by a native pack, not a biome, so they can still appear. */
export const NATIVE_FLORA_FAUNA = /\[native (bird|wild animal|fish or creature|tree|plant)\]/;

test("colonial biomes: recipes without a biome match the recorded output exactly", () => {
  for (const [key, part, tradition, context] of RECIPES) {
    for (const seed of SEEDS) {
      const names = generatePlaceNames({ recipe: colonialPlaceNamesRecipe(part, tradition, context), slots: {}, count: 20, seed }).names;
      assert.deepEqual(JSON.parse(JSON.stringify(names)), SNAPSHOTS[`${key} ${seed}`], `${key} ${seed}`);
    }
  }
});

test("colonial biomes: every biome fills native wildlife and plants with its own words", () => {
  for (const part of ["new-land", "established"] as const) {
    for (const biome of BIOMES) {
      const names = generatePlaceNames({ recipe: colonialPlaceNamesRecipe(part, undefined, undefined, biome.id), slots: {}, count: 2000, seed: 7 }).names;
      const words = NATIVE_IDS.flatMap((id) => biomeEntries(biome, id)!.map(([e]) => e.forms[0].toLowerCase()));
      assert.ok(!names.some((n) => NATIVE_FLORA_FAUNA.test(n.text)), `${part} ${biome.id} left a native placeholder`);
      assert.ok(
        names.some((n) => words.some((w) => n.text.toLowerCase().includes(w))),
        `${part} ${biome.id} used none of its native words`,
      );
    }
  }
});

const listSlot = (...modern: string[]): ResolvedSlot => ({
  kind: "sources",
  sources: [{ weight: 1, entries: modern.map((m): NameWordEntry => ({ modern: m, forms: [], fuses: "no" })) }],
});

test("colonial biomes: an explicit slot setting still wins", () => {
  const savannah = colonialPlaceNamesRecipe("new-land", undefined, undefined, "savannah");
  const withList = generatePlaceNames({ recipe: savannah, slots: { bird: listSlot("Testbird", "Otherbird") }, count: 2000, seed: 3 }).names;
  assert.ok(withList.some((n) => /Testbird|Otherbird/.test(n.text)), "the fixture birds appear");
  // Savannah birds found in no other savannah list never appear: bird fills come only from the fixture.
  const birdsOnly = ["Hornbill", "Guineafowl", "Ostrich", "Secretary Bird", "Crowned Crane", "Weaver Bird"];
  assert.ok(!withList.some((n) => birdsOnly.some((b) => n.text.includes(b))));
  const without = generatePlaceNames({ recipe: savannah, slots: {}, count: 2000, seed: 3 }).names;
  assert.ok(without.some((n) => birdsOnly.some((b) => n.text.includes(b))), "the same check finds them without the fixture");
  const builtIn = generatePlaceNames({ recipe: savannah, slots: { tree: { kind: "built-in" } }, count: 2000, seed: 3 }).names;
  assert.ok(builtIn.some((n) => /\bOak/.test(n.text)), "the British tree list is drawn");
  assert.ok(!builtIn.some((n) => /Baobab/.test(n.text)), "the savannah trees are not");
});

test("colonial biomes: the organic part ignores a biome", () => {
  const plain = withDefaults({ shape: { part: "organic" } });
  const desert = withDefaults({ shape: { part: "organic", biome: "desert" } });
  for (const seed of SEEDS) {
    assert.deepEqual(
      generatePlaceNames({ recipe: desert, slots: {}, count: 50, seed }).names,
      generatePlaceNames({ recipe: plain, slots: {}, count: 50, seed }).names,
    );
  }
});

test("colonial biomes: YAML round trip", () => {
  const { recipe, problems } = readRecipe({ shape: { part: "new-land", biome: "rainforest" } });
  assert.deepEqual(problems, []);
  assert.equal(recipe.shape?.biome, "rainforest");
  assert.equal((recipeToFrontmatter(recipe).shape as Record<string, unknown>).biome, "rainforest");
  const unknown = recipeToFrontmatter({ shape: { part: "new-land", biome: "unknown" } });
  assert.ok(!("biome" in (unknown.shape as Record<string, unknown>)));
  assert.deepEqual(readRecipe({ shape: { biome: "tundra" } }).problems, ["Unknown biome “tundra”."]);
});

test("colonial biomes: the wizard sentences", () => {
  const cases: [Parameters<typeof colonialSentenceText>, string][] = [
    [["new-land", "general", "wild-and-unsettled", "unknown", "any"], "General explorers in wild and unsettled lands across unknown country, naming any feature"],
    [["new-land", "spanish", "contested-frontier", "rainforest", "any"], "Spanish-themed explorers in a contested frontier across tropical rainforest, naming any feature"],
    [["new-land", "dutch", "sparse-or-weak-native-presence", "savannah", "any"], "Dutch-themed explorers in lands with a sparse, or weak, native presence across the savannah, naming any feature"],
    [["established", "roman", "imposition", "mediterranean", "any"], "Roman-themed incomers who are ruling over the locals across Mediterranean hills, naming any feature"],
    [["established", "british-imperial", "accommodation", "monsoon", "settlement"], "British-themed incomers who are living alongside the locals across the monsoon lands, naming settlement"],
    [["established", "japanese", "adoption", "cool-rainforest", "any"], "Japanese-themed incomers who are settling in amongst the locals across cool rainforest, naming any feature"],
  ];
  for (const [args, sentence] of cases) assert.equal(colonialSentenceText(...args), sentence);
});

test("colonial biomes: history labels", () => {
  const label = colonialHistoryLabel("exploration place names", "2", "spanish", "contested-frontier", "rainforest");
  assert.ok(label.endsWith(" · tropical rainforest"), label);
  assert.equal(
    colonialHistoryLabel("exploration place names", "2", "spanish", "contested-frontier"),
    colonialHistoryLabel("exploration place names", "2", "spanish", "contested-frontier", undefined),
  );
  assert.ok(!colonialHistoryLabel("exploration place names", "2", "spanish", "contested-frontier").includes("rainforest"));
});
