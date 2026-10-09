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
