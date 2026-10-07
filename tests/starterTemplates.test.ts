import { test } from "node:test";
import assert from "node:assert/strict";
import { COLONIAL_DATA } from "../src/colonialShapes";
import { createWordListFileContent, parseWordListFileContent } from "../src/nameParser";
import { wordListEntries } from "../src/packs/wordList";
import { generatePlaceNames, NAME_WORDS, resolveRegionSetting } from "../src/names/engine";
import { readRecipe, recipeToFrontmatter, withDefaults } from "../src/names/recipe";
import { STARTER_RECIPES, STARTER_WORD_LISTS, starterWordListBody } from "../src/names/starterTemplates";
import { PLACE_SHAPE_DATA } from "../src/placeShapes";

const LABELS = new Map([...PLACE_SHAPE_DATA.categories, ...COLONIAL_DATA.categories].map((c) => [c.id, c.label]));

test("starter recipes: all twelve read back as templates with valid settings", () => {
  assert.equal(STARTER_RECIPES.length, 12);
  for (const t of STARTER_RECIPES) {
    const { recipe, problems } = readRecipe(recipeToFrontmatter({ ...t.recipe, template: true }));
    assert.deepEqual(problems, [], t.name);
    assert.equal(recipe.template, true, t.name);
    assert.ok(t.description.length > 0, t.name);
    const r = withDefaults(recipe);
    if (r.shape.part === "organic") {
      if (r.shape.region !== "all-britain") assert.ok(resolveRegionSetting(r.shape.region), `${t.name}: ${r.shape.region}`);
      const { names } = generatePlaceNames({ recipe: r, slots: {}, count: 10, seed: 1 });
      assert.equal(names.length, 10, t.name);
    } else {
      const part = r.shape.part === "new-land" ? "2" : "2a";
      const tradition = COLONIAL_DATA.traditions.find((x) => x.id === r.shape.tradition);
      assert.ok(tradition?.parts.includes(part), `${t.name}: ${r.shape.tradition}`);
      assert.ok(COLONIAL_DATA.contexts[part].some((c) => c.id === r.shape.context), `${t.name}: ${r.shape.context}`);
    }
  }
});

test("starter word lists: five, each mirroring the built-in lists section by section", () => {
  assert.equal(STARTER_WORD_LISTS.length, 5);
  for (const t of STARTER_WORD_LISTS) {
    const file = parseWordListFileContent(createWordListFileContent(t.name, starterWordListBody(t), undefined, true));
    assert.equal(file.template, true);
    for (const id of t.categories) {
      const entries = wordListEntries(file.list, LABELS.get(id)!);
      assert.ok(entries, `${t.name}: no section for ${id}`);
      const builtIn = NAME_WORDS.categories[id];
      assert.deepEqual(entries!.map((e) => e.modern), builtIn.map((e) => e.modern), `${t.name}: ${id}`);
      entries!.forEach((e, i) => assert.equal(e.traditional, builtIn[i].traditional, `${t.name}: ${id} ${e.modern}`));
    }
  }
});
