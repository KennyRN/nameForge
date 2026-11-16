// Northern Europe brief 5c §13.1 (Part A): real-world and generated names in the settlement names sentence.
import { test } from "node:test";
import assert from "node:assert/strict";
import { fillPlan, freshSlotSources, namesClosing, chooseNames, slotChoiceMenu, slotInventory, usesOwnNames, activeSlots, chooseSlotSource, slotSegmentsText, NO_SLOT_OPTIONS } from "../src/names/slotSentence";
import { sourcesOfRecipeSlots } from "../src/names/placeRun";
import { readRecipe, recipeToFrontmatter, britishPlaceNamesRecipe } from "../src/names/recipe";
import { generateSettlementNames, fillSettlementNames } from "../src/settlement/names";
import { generateWildsNames } from "../src/wilds/engine";
// The deity, folk and place sources register their resolvers when their engines load (the modal loads them all).
import "../src/deities/engine";
import "../src/tribes/engine";

const choices = (segments: ReturnType<typeof namesClosing>) => segments.flatMap((s) => (typeof s === "string" ? [] : s.choices.map((c) => c.id)));

test("the closing link offers real-world and generated names only where asked (settlement names)", () => {
  assert.deepEqual(choices(namesClosing(freshSlotSources(), true)), ["real", "generated", "placeholders", "perSlot"]);
  assert.deepEqual(choices(namesClosing(freshSlotSources())), ["placeholders", "perSlot"]);
  assert.equal(slotSegmentsText(namesClosing(freshSlotSources("real"), true)), ", with real-world names");
  assert.equal(slotSegmentsText(namesClosing(freshSlotSources("generated"), true)), ", with generated names");
  assert.equal(slotSegmentsText(namesClosing(freshSlotSources(), true)), ", with placeholders for names");
  assert.equal(chooseNames(freshSlotSources(), "real").names, "real");
});

test("a slot menu gains real-world and generated names for the slots the filler knows, and only when asked", () => {
  const ids = (people: boolean) => slotChoiceMenu("organic", "personal-name", { ...NO_SLOT_OPTIONS, people }).map((c) => c.id);
  assert.ok(ids(true).includes("real") && ids(true).includes("generated"));
  assert.ok(!ids(false).includes("real"));
  // A native flora slot stays bracketed in the filler, so it is never offered.
  const flora = slotInventory("new-land").find((s) => s.id === "tree");
  if (flora) assert.ok(!slotChoiceMenu("new-land", "tree", { ...NO_SLOT_OPTIONS, people: true }).some((c) => c.id === "real"));
});

test("the whole-sentence modes fill everything; a per-slot run fills only the labels of its slots", () => {
  assert.deepEqual(fillPlan("organic", freshSlotSources("real")), [{ mode: "real" }]);
  assert.deepEqual(fillPlan("organic", freshSlotSources("placeholders")), []);
  let state = chooseNames(freshSlotSources(), "perSlot");
  state = chooseSlotSource(state, "organic", "personal-name", "real");
  state = chooseSlotSource(state, "organic", "saint-or-holy-person", "generated");
  const plan = fillPlan("organic", state);
  assert.deepEqual(plan.map((p) => p.mode).sort(), ["generated", "real"]);
  assert.ok(plan.find((p) => p.mode === "real")!.labels!.has("personal name"));
  assert.ok(plan.find((p) => p.mode === "generated")!.labels!.has("holy person"));
  // People choices are not "own names": no pack or list is resolved for them.
  assert.equal(usesOwnNames("organic", state), false);
  assert.equal(Object.keys(activeSlots("organic", state)).length, 2);
});

test("a stored preset runs as saved: no slots is placeholders; all slots real-world is the whole-sentence mode", () => {
  assert.equal(sourcesOfRecipeSlots(undefined, "organic").sources.names, "placeholders");
  const real = activeSlots("organic", freshSlotSources("real"));
  assert.ok(Object.keys(real).length > 0);
  assert.equal(sourcesOfRecipeSlots(real, "organic").sources.names, "real");
  const one = { "personal-name": { kind: "people" as const, mode: "real" as const } };
  assert.equal(sourcesOfRecipeSlots(one, "organic").sources.names, "perSlot");
});

test("a people slot survives a recipe note's round trip", () => {
  const recipe = { ...britishPlaceNamesRecipe(undefined), slots: { "personal-name": { kind: "people" as const, mode: "generated" as const } } };
  const read = readRecipe(recipeToFrontmatter(recipe));
  assert.deepEqual(read.problems, []);
  assert.deepEqual(read.recipe.slots?.["personal-name"], { kind: "people", mode: "generated" });
});

test("British settlement names in real-world mode carry no bracket the filler knows; placeholders still do", () => {
  const base = { setting: "native" as const, culture: "britain", size: "village" as const, count: 200, seed: 11 };
  const plain = generateSettlementNames(base);
  assert.ok(plain.names.some((n) => /\[(personal name|folk group)\]/.test(n.text)));
  const filled = fillSettlementNames(plain, base, fillPlan("organic", freshSlotSources("real")));
  assert.ok(!filled.names.some((n) => /\[(personal name|folk group|holy person|deity)\]/.test(n.text)), filled.names.find((n) => /\[/.test(n.text))?.text);
  // The same batch with only the folk group slot set to real-world names leaves personal names bracketed.
  let state = chooseNames(freshSlotSources(), "perSlot");
  state = chooseSlotSource(state, "organic", "folk-group", "real");
  const partial = fillSettlementNames(plain, base, fillPlan("organic", state));
  assert.ok(!partial.names.some((n) => /\[folk group\]/.test(n.text)));
  assert.ok(partial.names.some((n) => /\[personal name\]/.test(n.text)));
});

test("no bracket from a [place] fill reaches another module's real or generated output", () => {
  for (const people of ["real", "generated"] as const) {
    for (const culture of ["norman-british", "welsh", "german", "scottish"]) {
      const names = generateWildsNames({ module: "mountainNames", culture, era: "MD", where: "home", people, fantastic: false, tone: "any", series: false, count: 150, seed: 5 } as never).names;
      const bad = names.find((n) => /\[(place|folk group|personal name|town|homeland place name)\]/.test(n.text));
      assert.equal(bad, undefined, `${culture} ${people}: ${bad?.text}`);
    }
  }
});
