// Urban brief §3, §8: the settlement names sentence, history lookup and presets.
import { test } from "node:test";
import assert from "node:assert/strict";
import { generatePlaceNames } from "../src/names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe, readRecipe, recipeToFrontmatter } from "../src/names/recipe";
import { historySection, SECTION_LABELS, SETTLEMENT_NAMES_HISTORY_NAME } from "../src/sections";
import { generateSettlementNames } from "../src/settlement/names";
import { settlementSentenceText, sizeChoices } from "../src/settlement/sentence";

test("sentence: size and setting lead, the source module's own clauses follow the colon", () => {
  assert.equal(
    settlementSentenceText({ size: "any", setting: "native" }),
    "Settlement names, native: British from all of Britain, set in any part of Britain",
  );
  assert.equal(
    settlementSentenceText({ size: "town", setting: "native", region: "NTH" }),
    "Town names, native: British from the North, set in any part of Britain",
  );
  assert.equal(
    settlementSentenceText({ size: "village", setting: "new-lands" }),
    "Village names, in new lands: General explorers in wild and unsettled lands across any part of unknown country",
  );
  assert.equal(
    settlementSentenceText({ size: "city", setting: "settled-lands" }),
    "City names, in settled lands: General incomers who are ruling over the locals across any part of unknown country",
  );
});

test("sentence: the size choices are capitalised and start on settlement", () => {
  assert.deepEqual(sizeChoices().map((c) => c.label), ["Settlement", "Hamlet", "Village", "Town", "City", "Great city"]);
});

test("history: settlement names and settlement kit can't be mistaken for one another", () => {
  assert.equal(SETTLEMENT_NAMES_HISTORY_NAME, "settlement names");
  assert.equal(historySection("settlement names · town · British · North"), "settlementNames");
  assert.equal(historySection("settlement names · settlement · Chinese · Imperial"), "settlementNames");
  assert.equal(historySection("settlement kit · Fenwick · town · medieval · Norman & British"), "settlementKit");
  assert.equal(SECTION_LABELS.settlementNames, "settlement names");
});

test("presets: a recipe keeps the size, and running it draws the same names as the module", () => {
  const recipe = britishPlaceNamesRecipe("NTH");
  recipe.shape.settlement = "town";
  const read = readRecipe(recipeToFrontmatter(recipe));
  assert.deepEqual(read.problems, []);
  assert.equal(read.recipe.shape?.settlement, "town");
  const viaRecipe = generatePlaceNames({ recipe, slots: {}, count: 20, seed: 9 }).names.map((n) => n.text);
  const viaModule = generateSettlementNames({ setting: "native", size: "town", region: "NTH", count: 20, seed: 9 }).names.map((n) => n.text);
  assert.deepEqual(viaRecipe, viaModule);
  for (const part of ["new-land", "established"] as const) {
    const colonial = colonialPlaceNamesRecipe(part, undefined, undefined);
    colonial.shape.settlement = "village";
    const setting = part === "new-land" ? "new-lands" : "settled-lands";
    assert.deepEqual(
      generatePlaceNames({ recipe: colonial, slots: {}, count: 20, seed: 4 }).names.map((n) => n.text),
      generateSettlementNames({ setting, size: "village", count: 20, seed: 4 }).names.map((n) => n.text),
    );
  }
  assert.ok(readRecipe({ shape: { part: "organic", settlement: "metropolis" } }).problems.length > 0);
});
