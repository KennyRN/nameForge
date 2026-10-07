import { test } from "node:test";
import assert from "node:assert/strict";
import { type ColonialShape, generateColonialShapesDetailed } from "../src/colonialShapes";
import { generatePlaceNames, NAME_WORDS, NameRenderer, type NameWordEntry, type ResolvedSlot } from "../src/names/engine";
import { type RecipePartial, withDefaults } from "../src/names/recipe";

const recipe = (partial: RecipePartial = {}) => withDefaults({ shape: { part: "new-land" }, ...partial });
const constant = (v: number) => () => v;
const words = (...entries: NameWordEntry[]): ResolvedSlot => ({ kind: "sources", sources: [{ weight: 1, entries }] });
const name = (text: string): ResolvedSlot => ({ kind: "sources", sources: [{ weight: 1, draw: () => text }] });
const shape = (s: Partial<ColonialShape>): ColonialShape => ({
  part: "2",
  groupId: "x",
  genericId: "town",
  categoryId: "personal-name",
  structure: "two-part-compound",
  wordOrder: "specific-first",
  treatments: {},
  ...s,
});
const render = (s: Partial<ColonialShape>, slots: Record<string, ResolvedSlot>, rng = constant(0), partial: RecipePartial = {}) =>
  new NameRenderer(recipe(partial), slots, undefined).renderColonial(shape(s), rng).text;

test("colonial generic words §3.2 and fusion classes §3.3", () => {
  assert.deepEqual(NAME_WORDS.colonialGenerics["land-territory"], ["land", "territory"]);
  // Queensland fuses (land is usually fused); a territory stays spaced (rng 0.99 → no fuse at 0.15).
  assert.equal(render({ genericId: "land-territory", categoryId: "royal-woman" }, { "royal-woman": name("Queens") }, constant(0)), "Queensland");
  assert.equal(render({ genericId: "province-kingdom", categoryId: "explorer-or-founder" }, { "explorer-or-founder": name("Brannic") }, constant(0.99)), "Brannic Kingdom");
  assert.equal(render({ genericId: "civil-lines", structure: "simplex", categoryId: "empty-slot" }, {}), "Civil Lines");
  assert.equal(render({ genericId: "cantonment", categoryId: "native-place-name" }, { "native-place-name": name("Mhow") }), "Mhow Cantonment");
});

test("local generics §9.3: always fused; placeholder when unmapped", () => {
  const abad: NameWordEntry = { modern: "abad", forms: [], fuses: "yes" };
  const slots = { "official-patron-or-sponsor": name("Abbott"), "local-settlement-word": words(abad) };
  assert.equal(render({ genericId: "local-settlement-word", categoryId: "official-patron-or-sponsor" }, slots, constant(0.99)), "Abbottabad");
  assert.equal(
    render({ genericId: "local-market-word", categoryId: "official-patron-or-sponsor" }, { "official-patron-or-sponsor": name("Daltan") }, constant(0.99)),
    "Daltan [local market word]",
  );
});

test("colonial structures render as names", () => {
  const hobson = { "official-patron-or-sponsor": name("Hobson") };
  assert.equal(render({ structure: "possessive", categoryId: "official-patron-or-sponsor", genericId: "bay" }, hobson), "Hobson's Bay");
  assert.equal(render({ structure: "new-transfer", categoryId: "homeland-place-name" }, { "homeland-place-name": name("York") }), "New York");
  assert.equal(render({ structure: "twin", twin: "old", categoryId: "native-place-name" }, { "native-place-name": name("Delhi") }), "Old Delhi");
  assert.equal(
    render(
      { structure: "double-specific", categoryId: "saint-or-holy-person", secondCategoryId: "native-place-name" },
      { "saint-or-holy-person": name("Saint James"), "native-place-name": name("Queretaro") },
    ),
    "Saint James of Queretaro",
  );
  const north: NameWordEntry = { modern: "north", forms: ["North"], fuses: "yes" };
  assert.equal(
    render(
      { structure: "position-of-landmark", categoryId: "position-or-direction", secondCategoryId: "river-or-stream-name" },
      { "position-or-direction": words(north), "river-or-stream-name": name("Liao") },
    ),
    "North of the Liao",
  );
  assert.equal(render({ structure: "locative", genericId: "bridge", categoryId: "empty-slot" }, {}), "At the Bridge");
  assert.equal(render({ structure: "bare-specific", definite: true, categoryId: "imperial-claim" }, { "imperial-claim": words({ modern: "victorious", forms: [], fuses: "no" }) }), "The Victorious");
});

test("numbers, settlers and affixes in colonial names", () => {
  const twelve: NameWordEntry = { modern: "Twelve", forms: [], fuses: "mile" };
  assert.equal(render({ genericId: "creek", categoryId: "distance-or-survey-mark" }, { "distance-or-survey-mark": words(twelve) }), "Twelve Mile Creek");
  const german: NameWordEntry = { modern: "German", forms: [], fuses: "town-only" };
  assert.equal(render({ genericId: "town", categoryId: "settler-group" }, { "settler-group": words(german) }), "Germantown");
  assert.equal(render({ genericId: "creek", categoryId: "settler-group" }, { "settler-group": words(german) }), "German Creek");
  const salt: NameWordEntry = { modern: "salt", forms: ["Salt"], fuses: "yes" };
  const city = { typeId: "city", form: { text: "City", position: "after" as const } };
  assert.equal(
    render({ structure: "stacked-generic", genericId: "lake", stackedGenericId: "city", categoryId: "produce", affix: undefined }, { produce: words(salt) }, constant(0.99)),
    "Salt Lake City",
  );
  assert.equal(render({ genericId: "creek", categoryId: "produce", affix: city }, { produce: words(salt) }, constant(0.99)), "Salt Creek City");
  assert.equal(render({ genericId: "fort", categoryId: "commander-or-conqueror", wordOrder: "generic-first-direct" }, { "commander-or-conqueror": name("William") }), "Fort William");
  assert.equal(render({ genericId: "bay", categoryId: "explorer-or-founder", wordOrder: "generic-first-linked" }, { "explorer-or-founder": name("Kessing") }), "Bay of Kessing");
});

test("colonial recipes: determinism, shapes match the colonial generator, ignore respected", () => {
  const r = withDefaults({ shape: { part: "established", tradition: "british-imperial", context: "imposition" } });
  const a = generatePlaceNames({ recipe: r, slots: {}, count: 40, seed: 2026 });
  const b = generatePlaceNames({ recipe: r, slots: {}, count: 40, seed: 2026 });
  assert.deepEqual(a.names.map((n) => n.text), b.names.map((n) => n.text));
  const shapes = generateColonialShapesDetailed({ count: 40, seed: 2026, part: "2a", tradition: "british-imperial", context: "imposition", feature: "any", excludedCategories: [] }).shapes;
  assert.deepEqual(a.names.map((n) => n.shape), shapes);
  const ignored = generatePlaceNames({ recipe: r, slots: { "native-place-name": { kind: "ignore" } }, count: 200, seed: 5 });
  for (const n of ignored.names) assert.notEqual((n.shape as ColonialShape).categoryId, "native-place-name");
  assert.equal(new Set(a.names.map((n) => n.text.toLowerCase())).size, a.names.length);
});
