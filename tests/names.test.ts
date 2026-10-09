import { test } from "node:test";
import assert from "node:assert/strict";
import { mulberry32 } from "../src/markov";
import { generatePlaceShapesDetailed, type PlaceShape } from "../src/placeShapes";
import {
  generatePlaceNames,
  NAME_WORDS,
  NameRenderer,
  type NameWordEntry,
  type ResolvedSlot,
  resolveRegionSetting,
  smoothJoin,
} from "../src/names/engine";
import { applyRecipeTemplate, mergeRecipe, readRecipe, type RecipePartial, withDefaults } from "../src/names/recipe";

const recipe = (partial: RecipePartial = {}) => withDefaults(partial);
const constant = (v: number) => () => v;
const words = (...entries: NameWordEntry[]): ResolvedSlot => ({ kind: "sources", sources: [{ weight: 1, entries }] });
const name = (text: string): ResolvedSlot => ({ kind: "sources", sources: [{ weight: 1, draw: () => text }] });
const shape = (s: Partial<PlaceShape>): PlaceShape => ({
  groupId: "x",
  genericId: "river-crossing",
  categoryId: "tree",
  structure: "two-part-compound",
  wordOrder: "germanic",
  ...s,
});
const render = (s: Partial<PlaceShape>, slots: Record<string, ResolvedSlot>, rng = constant(0.99), partial: RecipePartial = {}) =>
  new NameRenderer(recipe(partial), slots, undefined).render(shape(s), rng).text;

const RED: NameWordEntry = { modern: "red", forms: ["Red"], fuses: "yes" };
const ASH: NameWordEntry = { modern: "ash", plural: "ashes", forms: ["Ash"], fuses: "yes" };

test("smoothing §4.3: matching letters, final e, consonant clusters, triple letters", () => {
  assert.equal(smoothJoin("Ash", "hill"), "Ashill");
  assert.equal(smoothJoin("Wolf", "ford"), "Wolford");
  assert.equal(smoothJoin("Grane", "able"), "Granable");
  assert.equal(smoothJoin("Hirst", "ford"), null); // r-s-t-f: four consonants meet
  assert.equal(smoothJoin("Bel", "llow"), "Bellow");
});

test("generic-first §4.4: words flip; names keep prefix or link with 'of'", () => {
  assert.equal(render({ genericId: "narrow-valley-glen", categoryId: "colour", wordOrder: "celtic-direct" }, { colour: words(RED) }), "Red Glen");
  assert.equal(render({ genericId: "narrow-valley-glen", categoryId: "personal-name", wordOrder: "celtic-direct" }, { "personal-name": name("Affric") }), "Glen Affric");
  assert.equal(render({ genericId: "hill", categoryId: "personal-name", wordOrder: "celtic-linked" }, { "personal-name": name("Alfric") }), "Mount Alfric");
  assert.equal(render({ genericId: "church", categoryId: "saint-or-holy-person", wordOrder: "celtic-linked" }, { "saint-or-holy-person": name("Petroc") }), "Church of Petroc");
  assert.equal(render({ genericId: "sea-inlet-firth", categoryId: "river-or-stream-name", wordOrder: "celtic-direct" }, { "river-or-stream-name": name("Forth") }), "Firth of Forth");
  assert.equal(render({ genericId: "river", categoryId: "river-or-stream-name", wordOrder: "celtic-direct" }, { "river-or-stream-name": name("Kessing") }), "River Kessing");
});

test("connectives §4.5: -ing- fused to the name; the generic joins if its class allows", () => {
  const grim = { "personal-name": name("Grim") };
  assert.equal(render({ structure: "folk-connective", categoryId: "personal-name", genericId: "river-crossing" }, grim), "Grimingford");
  assert.equal(render({ structure: "associative-connective", categoryId: "personal-name", genericId: "long-valley" }, { "personal-name": name("Brannic") }), "Brannicing Valley");
  assert.equal(render({ categoryId: "personal-name", genericId: "folk-group-territory" }, grim), "Grimings");
});

test("numbers §4.6: two and three fuse with the singular; five, seven, nine space with the plural", () => {
  const two: NameWordEntry = { modern: "two", forms: ["Twy"], fuses: "number-fused" };
  const seven: NameWordEntry = { modern: "seven", forms: [], fuses: "number-spaced" };
  assert.equal(render({ categoryId: "number" }, { number: words(two) }), "Twyford");
  assert.equal(render({ categoryId: "number", genericId: "spring-well" }, { number: words(seven) }, constant(0)), "Seven Springs");
});

test("capitalisation and linking hyphens §4.7", () => {
  const location = { typeId: "location", form: { text: "upon", position: "after" as const, slotCategory: "river-or-stream-name" } };
  const slots = { tree: words(ASH), "river-or-stream-name": name("Severn") };
  assert.equal(render({ affix: location }, slots, constant(0)), "Ashford-upon-Severn");
  assert.equal(render({ affix: location }, slots, constant(0), { render: { linkingHyphens: false } }), "Ashford upon Severn");
  assert.equal(render({ categoryId: "colour", genericId: "bridge" }, { colour: words(RED) }), "Red Bridge");
});

test("placeholders are never fused and keep single brackets", () => {
  const text = render({ categoryId: "personal-name" }, {}, constant(0));
  assert.equal(text, "[personal name] Ford");
  assert.doesNotMatch(text, /\[\[/);
});

test("fusion rate §4.1: ford with balanced joining and built-in fills matches the expected rate ±3", () => {
  const renderer = new NameRenderer(recipe(), {}, undefined);
  const rng = mulberry32(7);
  const categories = ["domestic-animal", "tree", "shape", "quality-or-condition", "wild-animal", "bird", "wild-plant", "colour"];
  let fused = 0;
  let expected = 0;
  const n = 10_000;
  for (let i = 0; i < n; i++) {
    const cat = categories[i % categories.length];
    const fill = renderer.fill(cat, rng);
    if (fill.kind !== "word") throw new Error("expected a word fill");
    const f = fill.entry.fuses;
    const never = f === "no" || (f === "traditional-only" && !fill.traditional);
    expected += never ? 0 : Math.min(0.95, 0.85 * (fill.traditional ? 1.5 : 0.6));
    if (renderer.join(fill, cat, "river-crossing", rng).fused) fused++;
  }
  assert.ok(Math.abs((100 * fused) / n - (100 * expected) / n) <= 3, `${(100 * fused) / n} vs ${(100 * expected) / n}`);
});

test("ignore: no name uses an ignored category; an ignored location affix is redrawn", () => {
  const slots: Record<string, ResolvedSlot> = {
    tree: { kind: "ignore" },
    "river-or-stream-name": { kind: "ignore" },
    landform: { kind: "ignore" },
    "earlier-or-district-name": { kind: "ignore" },
  };
  for (const seed of [1, 2, 3]) {
    const { names } = generatePlaceNames({ recipe: recipe(), slots, count: 300, seed });
    for (const n of names) {
      assert.notEqual(n.shape.categoryId, "tree");
      assert.doesNotMatch(n.etymology, /\[(tree|river or stream name|landform|earlier or district name)/);
    }
  }
});

test("register: modern never uses a traditional word; traditional always does where one exists", () => {
  const rng = mulberry32(3);
  const modern = new NameRenderer(recipe({ register: "modern" }), {}, undefined);
  const traditional = new NameRenderer(recipe({ register: "traditional" }), {}, undefined);
  for (let i = 0; i < 2000; i++) {
    const m = modern.fill("wild-animal", rng);
    const t = traditional.fill("wild-animal", rng);
    if (m.kind === "word") assert.equal(m.traditional, false);
    if (t.kind === "word") assert.equal(t.traditional, !!t.entry.traditional);
  }
});

test("determinism: same seed and recipe, same names; shapes match the shape generator", () => {
  const r = recipe({ shape: { region: "north" } });
  const a = generatePlaceNames({ recipe: r, slots: {}, count: 50, seed: 2026 });
  const b = generatePlaceNames({ recipe: r, slots: {}, count: 50, seed: 2026 });
  assert.deepEqual(a.names.map((n) => n.text), b.names.map((n) => n.text));
  const shapes = generatePlaceShapesDetailed({ count: 50, seed: 2026, region: "NTH", feature: "any", excludedCategories: [] }).shapes;
  assert.deepEqual(
    a.names.map((n) => n.shape.genericId),
    shapes.map((s) => s.genericId),
  );
  assert.equal(resolveRegionSetting("east-midlands"), "EMD");
  assert.equal(resolveRegionSetting("all-britain"), undefined);
});

test("no duplicates within a batch", () => {
  const { names } = generatePlaceNames({ recipe: recipe(), slots: {}, count: 100, seed: 11 });
  assert.equal(new Set(names.map((n) => n.text.toLowerCase())).size, names.length);
});

test("built-in lists cover §11 categories with the §9.1 shape", () => {
  for (const id of ["domestic-animal", "wild-animal", "bird", "tree", "colour", "number", "landform", "status-or-role", "supernatural-being"]) {
    assert.ok((NAME_WORDS.categories[id]?.length ?? 0) > 0, id);
  }
  const badger = NAME_WORDS.categories["wild-animal"].find((e) => e.modern === "badger")!;
  assert.deepEqual(badger, { modern: "badger", plural: "brocks", forms: ["Brock"], fuses: "traditional-only", traditional: "brock" });
});

test("recipes: the §6.6 example reads; templates merge per setting", () => {
  const { recipe: r, problems } = readRecipe({
    type: "recipe",
    "template-of": "[[Danelaw]]",
    shape: { part: "organic", region: "east-midlands", feature: "any" },
    slots: {
      "personal-name": {
        sources: [{ pack: "[[Saxon names]]", weight: 70 }, { pack: "[[Norse names]]", weight: 30 }],
        mode: "stem",
        section: "Common",
        gender: { male: 80, female: 20 },
      },
      "wild-animal": { sources: [{ list: "[[Northern fauna]]" }] },
      "native-place-name": "ignore",
    },
    generics: { church: "kirk" },
    register: "traditional",
    render: { joining: "balanced", "linking-hyphens": true, etymology: true },
  });
  assert.deepEqual(problems, []);
  assert.equal(r.templateOf, "Danelaw");
  assert.deepEqual(r.slots!["personal-name"], {
    kind: "sources",
    sources: [{ pack: "Saxon names", weight: 70 }, { pack: "Norse names", weight: 30 }],
    mode: "stem",
    section: "Common",
    gender: { male: 80, female: 20 },
  });
  assert.deepEqual(r.slots!["native-place-name"], { kind: "ignore" });

  const template: RecipePartial = { shape: { region: "north", feature: "landscape" }, register: "modern", render: { joining: "fused" }, slots: { tree: { kind: "placeholder" } } };
  const merged = withDefaults(mergeRecipe({ shape: { region: "wales" }, slots: { bird: { kind: "ignore" } } }, template));
  assert.deepEqual(merged.shape, { part: "organic", region: "wales", tradition: "general", context: "none", biome: "unknown", feature: "landscape" });
  assert.equal(merged.register, "modern");
  assert.equal(merged.render.joining, "fused");
  assert.deepEqual(Object.keys(merged.slots).sort(), ["bird", "tree"]);

  assert.match(applyRecipeTemplate({ templateOf: "T" }, undefined, "D").error!, /missing/);
  assert.match(applyRecipeTemplate({ templateOf: "T" }, { templateOf: "U" }, "D").error!, /one level/);
  assert.match(applyRecipeTemplate({ templateOf: "T", template: true }, {}, "D").error!, /is a template/);
});
