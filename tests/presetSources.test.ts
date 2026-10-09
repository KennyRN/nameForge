// Tribal presets as sources (Presets brief §10, §12.3).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mulberry32 } from "../src/markov";
import { generatePlaceNames, type GeneratedName, type ResolvedSlot } from "../src/names/engine";
import { colonialPlaceNamesRecipe, readRecipe, recipeToFrontmatter } from "../src/names/recipe";
import { resolveWordListItems } from "../src/names/wordListSource";
import { parseWordList, wordListSection } from "../src/packs/wordList";
import { modulePresetContent, readTribalPresetSource, tribalPresetDraw, tribalPresetSlot, type TribalPreset } from "../src/presets";

const FIXTURE: TribalPreset = {
  packName: "Fixture",
  setting: "",
  description: "",
  tradition: "bantu",
  biome: "savannah",
  terrain: "any",
  register: "historical",
  groupType: "any",
  perspective: "any",
  hostile: true,
};
const fixtureNote = modulePresetContent(FIXTURE);

/** As the recipe host resolves a slot: the preset's settings, or a placeholder with a notice. */
function resolve(name: string, content: string | null): { slot: ResolvedSlot; notice?: string } {
  const found = readTribalPresetSource(name, content);
  if ("notice" in found) return { slot: { kind: "placeholder" }, notice: found.notice };
  return { slot: { kind: "tribal", ...tribalPresetSlot(found.preset) } };
}

const fillsOf = (n: GeneratedName) => [...(n.etymology ?? "").matchAll(/\[native people or tribe[^:\]]*: ([^\]]+)\]/g)].map((m) => m[1]);

test("preset sources: a recipe slot linked to a preset reads as a link and round-trips", () => {
  const { recipe, problems } = readRecipe({ type: "recipe", slots: { "native-people-or-tribe": { tribal: "[[Fixture]]" } } });
  assert.deepEqual(problems, []);
  assert.deepEqual(recipe.slots!["native-people-or-tribe"], { kind: "tribal", tradition: "general", preset: "Fixture" });
  assert.deepEqual(recipeToFrontmatter(recipe).slots, { "native-people-or-tribe": { tribal: "[[Fixture]]" } });
});

test("preset sources: fills are short, never start with The, and keep the slot's register", () => {
  const { slot } = resolve("Fixture", fixtureNote);
  // Historical isn't a register the colonial slot uses, so its own weights stay; hostile is off.
  assert.equal((slot as { register?: string }).register, undefined);
  assert.equal((slot as { biome?: string }).biome, "savannah");
  const recipe = colonialPlaceNamesRecipe("new-land", undefined, undefined, "savannah");
  recipe.render.etymology = true;
  const names = generatePlaceNames({ recipe, slots: { "native-people-or-tribe": slot }, count: 2000, seed: 5 }).names;
  const fills = names.flatMap(fillsOf);
  assert.ok(fills.length > 20, `${fills.length} tribal fills`);
  for (const f of fills) {
    assert.ok(f.split(" ").length <= 3, f);
    assert.ok(!/^The /.test(f), f);
  }
});

test("preset sources: a missing preset or another note gives a notice and a placeholder", () => {
  const missing = resolve("Fixture", null);
  assert.equal(missing.notice, "Preset “Fixture” is missing.");
  assert.deepEqual(missing.slot, { kind: "placeholder" });
  const recipe = colonialPlaceNamesRecipe("new-land", undefined, undefined);
  recipe.render.etymology = true;
  const names = generatePlaceNames({ recipe, slots: { "native-people-or-tribe": missing.slot }, count: 300, seed: 2 }).names;
  assert.ok(names.some((n) => /\[native people/.test(n.text)), "placeholder output");
  const pack = resolve("X", "---\ntype: namePack\npackName: X\npackType: listPack\n---\nAelfric\n");
  assert.equal(pack.notice, "“X” isn't a tribes and kin groups preset.");
});

test("preset sources: a word list's // line draws from a preset", async () => {
  const list = parseWordList("## Native people\n\n// Fixture\n");
  const section = wordListSection(list, "Native people")!;
  const { items, notices } = await resolveWordListItems(section, "Peoples", async () => {
    const draw = tribalPresetDraw(FIXTURE);
    return { draw: (_request, _mode, rng) => draw(rng) };
  });
  assert.deepEqual(notices, []);
  assert.equal(items.length, 1);
  const rng = mulberry32(4);
  for (let i = 0; i < 300; i++) {
    const text = items[0].draw!({}, "whole", rng)!;
    assert.ok(text.split(" ").length <= 3 && !/^The /.test(text), text);
  }
});
