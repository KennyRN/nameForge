// Tribal names as a slot source (Tribal brief §20, §22.5).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mulberry32 } from "../src/markov";
import { generatePlaceNames, type GeneratedName, type ResolvedSlot } from "../src/names/engine";
import { colonialPlaceNamesRecipe, readRecipe, recipeToFrontmatter, withDefaults } from "../src/names/recipe";
import { allowsTribal } from "../src/names/slotOptions";
import { tribalSlotFill } from "../src/tribes/slotFill";

const bantu: Record<string, ResolvedSlot> = { "native-people-or-tribe": { kind: "tribal", tradition: "bantu" } };
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** The tribal fills in a name, as its etymology records them. */
const fillsOf = (n: GeneratedName) => [...(n.etymology ?? "").matchAll(/\[native people or tribe[^:\]]*: ([^\]]+)\]/g)].map((m) => m[1]);

function savannahNames(adapt?: (s: string) => string | null): GeneratedName[] {
  const recipe = colonialPlaceNamesRecipe("new-land", undefined, undefined, "savannah");
  recipe.render.etymology = true;
  return generatePlaceNames({ recipe, slots: bantu, count: 2000, seed: 5, adapt }).names;
}

test("tribal slots: colonial fills are short, article-free and never fused", () => {
  const names = savannahNames();
  const fills = names.flatMap((n) => fillsOf(n).map((f) => [n, f] as const));
  assert.ok(fills.length > 20, `${fills.length} tribal fills`);
  for (const [n, f] of fills) {
    assert.ok(f.split(" ").length <= 3, f);
    assert.ok(!/^The /.test(f), f);
    // Spaced, never fused: the fill stands as whole words in the name.
    assert.ok(new RegExp(`(^| )${escape(f)}('s)?( |$)`).test(n.text), `${n.text} fuses ${f}`);
  }
  const rng = mulberry32(8);
  for (let i = 0; i < 2000; i++) {
    const { text } = tribalSlotFill({ tradition: "bantu", part: "new-land", biome: "savannah" }, rng);
    assert.ok(text.split(" ").length <= 3 && !/^The /.test(text), text);
  }
});

test("tribal slots: a takeover pack leaves tribal fills unchanged", () => {
  const adapt = (s: string) => `${s.toUpperCase()}ZZ`;
  const names = savannahNames(adapt);
  const fills = names.flatMap((n) => fillsOf(n).map((f) => [n, f] as const));
  assert.ok(fills.length > 0);
  for (const [n, f] of fills) {
    assert.ok(!f.includes("ZZ"), f);
    assert.ok(n.text.includes(f), `${n.text} lacks ${f}`);
  }
});

test("tribal slots: auto follows the organic recipe's region", () => {
  const traditions = (region: string) => {
    const rng = mulberry32(21);
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) seen.add(tribalSlotFill({ tradition: "auto", part: "organic", region }, rng).tradition);
    return seen;
  };
  assert.deepEqual([...traditions("WAL")], ["celtic"]);
  assert.deepEqual([...traditions("EAN")], ["germanic"]);
  assert.deepEqual([...traditions("SBL")].sort(), ["celtic", "germanic"]);
  // Organic fills: at most two words.
  const rng = mulberry32(22);
  for (let i = 0; i < 500; i++) assert.ok(tribalSlotFill({ tradition: "auto", part: "organic", region: "WAL" }, rng).text.split(" ").length <= 2);
  // Through a recipe: a Welsh organic recipe fills folk-group from the tribal engine.
  const recipe = withDefaults({ shape: { part: "organic", region: "wales" }, render: { etymology: true } });
  const names = generatePlaceNames({ recipe, slots: { "folk-group": { kind: "tribal", tradition: "auto" } }, count: 400, seed: 2 }).names;
  assert.ok(names.every((n) => !n.text.includes("[folk")), "no folk-group placeholder");
});

test("tribal slots: YAML round trip and problems", () => {
  const { recipe, problems } = readRecipe({ slots: { "native-people-or-tribe": { tribal: "bantu" }, "folk-group": { tribal: "auto" } } });
  assert.deepEqual(problems, []);
  assert.deepEqual(recipe.slots?.["native-people-or-tribe"], { kind: "tribal", tradition: "bantu" });
  const fm = recipeToFrontmatter(recipe);
  assert.deepEqual(fm.slots, { "native-people-or-tribe": { tribal: "bantu" }, "folk-group": { tribal: "auto" } });
  assert.deepEqual(readRecipe({ slots: { "folk-group": { tribal: "vikings" } } }).problems, ["Slot “folk-group” names an unknown tradition “vikings”."]);
});

test("tribal slots: offered on folk-group (organic) and native-people-or-tribe (colonial) only", () => {
  assert.ok(allowsTribal("organic", "folk-group"));
  assert.ok(allowsTribal("new-land", "native-people-or-tribe"));
  assert.ok(allowsTribal("established", "native-people-or-tribe"));
  assert.ok(!allowsTribal("organic", "native-people-or-tribe"));
  assert.ok(!allowsTribal("new-land", "folk-group"));
  assert.ok(!allowsTribal("new-land", "bird"));
});

test("tribal slots: the sentence's own choices round-trip and only differences are written (Presets brief §5.1)", () => {
  const { recipe, problems } = readRecipe({
    type: "recipe",
    slots: { "folk-group": { tribal: "celtic", biome: "highland", groupType: "kin", perspective: "self", register: "plain", terrain: "any" } },
  });
  assert.deepEqual(problems, []);
  assert.deepEqual(recipe.slots!["folk-group"], { kind: "tribal", tradition: "celtic", biome: "highland", groupType: "kin", perspective: "self", register: "plain", terrain: "any" });
  const written = recipeToFrontmatter(recipe).slots as Record<string, unknown>;
  assert.deepEqual(written["folk-group"], { tribal: "celtic", biome: "highland", groupType: "kin", perspective: "self", register: "plain" });
  assert.deepEqual(recipeToFrontmatter({ slots: { "folk-group": { kind: "tribal", tradition: "auto" } } }).slots, { "folk-group": { tribal: "auto" } });
  const bad = readRecipe({ type: "recipe", slots: { "folk-group": { tribal: "celtic", biome: "moon" } } });
  assert.deepEqual(bad.problems, ["Slot “folk-group” has an unknown biome “moon”."]);
});

test("tribal slots: a slot's group type is used when the slot allows it", () => {
  const rng = mulberry32(31);
  for (let i = 0; i < 200; i++) {
    const { text } = tribalSlotFill({ tradition: "bantu", part: "new-land", fields: { groupType: "confederation", register: "administrative" } }, rng);
    assert.ok(text.split(" ").length <= 3 && !/^The /.test(text), text);
  }
});
