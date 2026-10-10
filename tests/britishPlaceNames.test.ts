// British place names, "of the", [holy person] and the expanded lists (river brief §2–§5, §6.9, §7).
import { test } from "node:test";
import assert from "node:assert/strict";
import { type ColonialShape } from "../src/colonialShapes";
import { mulberry32 } from "../src/markov";
import { generatePlaceNames, NAME_WORDS, NameRenderer, type ResolvedSlot } from "../src/names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe, type RecipePartial, withDefaults } from "../src/names/recipe";
import { COLONIAL_TRADITIONS, colonialContexts, isTraditionAvailable } from "../src/colonialShapes";
import { generatePlaceShapesDetailed, PLACE_SHAPE_REGIONS, type PlaceShape } from "../src/placeShapes";
import riverData from "../src/data/river-names.json";
import { historySection, SECTION_LABELS, SECTION_ORDER } from "../src/sections";

const REGIONS = [undefined, ...PLACE_SHAPE_REGIONS.map((r) => r.code)];
const PLACEHOLDERS = new Set(["[personal name]", "[earlier or district name]", "[holy person]", "[folk group]", "[deity]"]);
const REAL_RIVERS = new Set(Object.values(riverData.corpora).flat().map((n) => n.toLowerCase()));

/** The river fill in an etymology: "[river or stream name: Blackwater]". */
const riverFills = (etymology: string) =>
  [...etymology.matchAll(/\[river or stream name(?:, (?:adopted|adapted))?: ([^\]]+)\]/g)].map((m) => m[1]);
const checkRiverFill = (fill: string) => {
  assert.ok(!/[[\]]/.test(fill), `bracket: ${fill}`);
  assert.ok(!/\bRiver\b/.test(fill) && !/\bWater of\b/i.test(fill) && !/\bthe\b/i.test(fill), fill);
  assert.ok(!REAL_RIVERS.has(fill.toLowerCase()), `real river: ${fill}`);
};

test("british place names: placeholders, no + signs, rivers filled, deterministic (13 regions × 4 seeds × 500)", () => {
  let rivers = 0;
  for (const region of REGIONS) {
    for (const seed of [1, 2, 3, 42]) {
      const run = () => generatePlaceNames({ recipe: britishPlaceNamesRecipe(region), slots: {}, count: 500, seed });
      const result = run();
      assert.equal(result.names.length, 500);
      for (const name of result.names) {
        for (const [bracket] of name.text.matchAll(/\[[^\]]*\]/g)) assert.ok(PLACEHOLDERS.has(bracket), `${region}: ${name.text}`);
        assert.ok(!name.text.includes(" + "), name.text);
        assert.equal(name.hasPlaceholder, /\[/.test(name.text));
        for (const fill of riverFills(name.etymology)) {
          rivers++;
          checkRiverFill(fill);
        }
      }
      assert.deepEqual(run().names.map((n) => [n.text, n.etymology]), result.names.map((n) => [n.text, n.etymology]));
    }
  }
  assert.ok(rivers > 0, "river slots are filled by the river engine");
});

test("[holy person]: rendered names use it; etymology keeps saint or holy person", () => {
  const renderer = new NameRenderer(britishPlaceNamesRecipe(undefined), {}, undefined);
  const shape: PlaceShape = {
    groupId: "x",
    genericId: "church",
    categoryId: "saint-or-holy-person",
    structure: "two-part-compound",
    wordOrder: "germanic",
  } as PlaceShape;
  const name = renderer.render(shape, mulberry32(1));
  assert.match(name.text, /\[holy person\]/);
  assert.ok(!name.text.includes("saint"));
  assert.match(name.etymology, /saint or holy person/);
});

// ── "Of the" ────────────────────────────────────────────────────────────────

const KEEP = ["bird", "wild-animal", "domestic-animal", "fish-and-other-creatures", "tree", "wild-plant", "supernatural-being", "status-or-role", "activity"];
const OF_THE = / of the /;

/** Renders one organic shape with a fixed word slot and its own "of the" stream. */
const organicShape = (categoryId: string, wordOrder: PlaceShape["wordOrder"], structure: PlaceShape["structure"] = "two-part-compound"): PlaceShape =>
  ({ groupId: "x", genericId: "hill", categoryId, structure, wordOrder }) as PlaceShape;

test("of the: keep-set words keep the order 60–70% of the time over 2,000 slots", () => {
  const ofTheRng = mulberry32(99);
  const fillRng = mulberry32(98);
  let kept = 0;
  let total = 0;
  for (let i = 0; i < 2400; i++) {
    const categoryId = KEEP[i % KEEP.length];
    const renderer = new NameRenderer(britishPlaceNamesRecipe(undefined), {}, undefined, { ofTheRng });
    const name = renderer.render(organicShape(categoryId, "celtic-linked"), fillRng);
    total++;
    if (OF_THE.test(name.text)) kept++;
  }
  const share = kept / total;
  assert.ok(share >= 0.6 && share <= 0.7, share.toFixed(3));
});

test("of the: a kept form is spaced, singular, with lowercase of the", () => {
  const renderer = new NameRenderer(britishPlaceNamesRecipe(undefined), {}, undefined, { ofTheRng: () => 0 });
  const name = renderer.render(organicShape("wild-animal", "celtic-linked"), mulberry32(4));
  assert.match(name.text, /^\S+ of the \S+/);
  const word = name.text.split(" of the ")[1].split(" ")[0].toLowerCase();
  assert.ok(NAME_WORDS.categories["wild-animal"].some((e) => e.modern.toLowerCase() === word || e.modern.toLowerCase().endsWith(word)), word);
});

test("of the: never outside the keep set, other orders, or for name and placeholder fills", () => {
  const always = () => 0;
  for (const categoryId of ["colour", "quality-or-condition", "soil-or-ground", "number"]) {
    const renderer = new NameRenderer(britishPlaceNamesRecipe(undefined), {}, undefined, { ofTheRng: always });
    for (let i = 0; i < 50; i++) assert.ok(!OF_THE.test(renderer.render(organicShape(categoryId, "celtic-linked"), mulberry32(i)).text));
  }
  for (const order of ["celtic-direct", "germanic"] as const) {
    const renderer = new NameRenderer(britishPlaceNamesRecipe(undefined), {}, undefined, { ofTheRng: always });
    for (let i = 0; i < 50; i++) assert.ok(!OF_THE.test(renderer.render(organicShape("bird", order), mulberry32(i)).text));
  }
  // A name fill renders exactly as before, with or without the stream.
  const slots: Record<string, ResolvedSlot> = { "personal-name": { kind: "sources", sources: [{ weight: 1, draw: () => "Bran" }] } };
  const shape = organicShape("personal-name", "celtic-linked");
  const before = new NameRenderer(britishPlaceNamesRecipe(undefined), slots, undefined).render(shape, mulberry32(3));
  const after = new NameRenderer(britishPlaceNamesRecipe(undefined), slots, undefined, { ofTheRng: always }).render(shape, mulberry32(3));
  assert.deepEqual(after, before);
  // A placeholder fill too.
  const ph = organicShape("deity", "celtic-linked");
  assert.deepEqual(
    new NameRenderer(britishPlaceNamesRecipe(undefined), {}, undefined, { ofTheRng: always }).render(ph, mulberry32(3)),
    new NameRenderer(britishPlaceNamesRecipe(undefined), {}, undefined).render(ph, mulberry32(3)),
  );
});

test("of the: colonial generic-first-linked keep-set words take the same decision", () => {
  const renderer = new NameRenderer(withDefaults({ shape: { part: "new-land" } }), {}, undefined, { ofTheRng: () => 0 });
  const shape: ColonialShape = {
    part: "2",
    groupId: "x",
    genericId: "bay",
    categoryId: "bird",
    structure: "two-part-compound",
    wordOrder: "generic-first-linked",
    treatments: {},
  };
  assert.match(renderer.renderColonial(shape, mulberry32(2)).text, /^Bay of the /);
  const direct = { ...shape, wordOrder: "generic-first-direct" as const };
  assert.ok(!OF_THE.test(renderer.renderColonial(direct, mulberry32(2)).text));
});

test("of the: changing only the keep decision leaves shapes, and names before the first changed slot, alone", () => {
  // Same batch with the decision forced off: shapes identical; names identical up to the first kept form.
  const recipe = britishPlaceNamesRecipe(undefined);
  const shapes = generatePlaceShapesDetailed({ count: 300, seed: 8 }).shapes;
  const fillA = mulberry32(5);
  const fillB = mulberry32(5);
  const on = new NameRenderer(recipe, {}, undefined, { ofTheRng: mulberry32(1) });
  const off = new NameRenderer(recipe, {}, undefined, { ofTheRng: () => 1 });
  let diverged = false;
  let eligible = 0;
  for (const shape of shapes) {
    const a = on.render(shape, fillA);
    const b = off.render(shape, fillB);
    assert.deepEqual(a.shape, b.shape);
    assert.equal(a.etymology === b.etymology || diverged || OF_THE.test(a.text), true);
    if (OF_THE.test(a.text)) {
      eligible++;
      diverged = true;
    }
    if (!diverged) assert.equal(a.text, b.text);
  }
  assert.ok(eligible > 0);
});

// ── River fills in recipes (§6.9) ───────────────────────────────────────────

test("river fills: unmapped and built-in use the river engine; mappings win", () => {
  const recipeFor = (part: RecipePartial["shape"]) => withDefaults({ shape: part });
  for (const part of [{ part: "organic" as const }, { part: "new-land" as const }, { part: "established" as const }]) {
    for (const slots of [{}, { "river-or-stream-name": { kind: "built-in" } as ResolvedSlot }]) {
      const { names } = generatePlaceNames({ recipe: recipeFor(part), slots, count: 400, seed: 3 });
      const fills = names.flatMap((n) => riverFills(n.etymology));
      assert.ok(fills.length > 0, `${part.part}: river fills appear`);
      fills.forEach(checkRiverFill);
      assert.ok(!names.some((n) => n.text.includes("[river or stream name]")));
    }
    const mapped: Record<string, ResolvedSlot> = {
      "river-or-stream-name": { kind: "sources", sources: [{ weight: 1, draw: () => "Mapped" }] },
    };
    const { names } = generatePlaceNames({ recipe: recipeFor(part), slots: mapped, count: 400, seed: 3 });
    const fills = names.flatMap((n) => riverFills(n.etymology));
    assert.ok(fills.length > 0 && fills.every((f) => f === "Mapped"), `${part.part}: mapping wins`);
    const placeholder = generatePlaceNames({
      recipe: recipeFor(part),
      slots: { "river-or-stream-name": { kind: "placeholder" } },
      count: 400,
      seed: 3,
    });
    assert.ok(placeholder.names.some((n) => n.text.includes("[river or stream name]")), `${part.part}: placeholder mapping stays`);
  }
});

test("river fills: spaced, never fused", () => {
  const { names } = generatePlaceNames({ recipe: britishPlaceNamesRecipe(undefined), slots: {}, count: 500, seed: 42 });
  for (const name of names) {
    for (const fill of riverFills(name.etymology)) {
      assert.ok(name.text.includes(fill), `${fill} appears whole in ${name.text}`);
    }
  }
});

// ── Expanded lists (§5) ─────────────────────────────────────────────────────

const NEW_ENTRIES: Record<string, number> = { bird: 18, "wild-animal": 10, "wild-plant": 14, tree: 14, "fish-and-other-creatures": 18 };

test("lists: §5 entries exist with the §5.1 fields", () => {
  for (const [category, n] of Object.entries(NEW_ENTRIES)) {
    const added = NAME_WORDS.categories[category].slice(-n);
    assert.equal(new Set(added.map((e) => e.modern)).size, n, `${category}: no duplicate modern values`);
    for (const e of added) {
      const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
      assert.deepEqual(e.forms, [cap(e.modern)]);
      if (e.traditional) assert.deepEqual(e.traditionalForms, [cap(e.traditional)]);
      else assert.equal(e.traditionalForms, undefined);
      assert.ok(e.plural);
      assert.equal(e.fuses, !e.modern.includes(" ") && e.modern.length <= 6 ? "yes" : "no", e.modern);
    }
  }
  assert.equal(NAME_WORDS.categories.bird.at(-1)!.modern, "goose");
  assert.equal(NAME_WORDS.categories.bird.at(-1)!.plural, "geese");
  assert.equal(NAME_WORDS.categories.tree.find((e) => e.modern === "elder")!.traditional, "bourtree");
});

// ── Module line-up (§1) ─────────────────────────────────────────────────────


test("line-up: the modules in order, with their labels; river names live in place names", () => {
  assert.deepEqual(
    SECTION_ORDER.map((s) => SECTION_LABELS[s]),
    [
      "markov generator",
      "native place names",
      "exploration into new lands",
      "expansion into settled lands",
      "tribes and kin groups",
      "realms and polities",
      "faiths and mystic orders",
      "armies and martial orders",
      "thieves and the underworld",
      "guilds and trading houses",
      "adventurers and explorers",
      "powers and factions",
      "supernatural courts and hosts",
      "epithets and bynames",
      "titles and honorifics",
      "family names",
      "name ageing",
      "name takeover",
      "ships and boats",
      "spacecraft and stations",
    ],
  );
  assert.ok(!Object.values(SECTION_LABELS).includes("generic place name generator"));
});

// ── Exploration and empire expansion place names (§3, §5, §6) ──────────────

const SPLITS: Record<string, string[]> = {
  "monarch-ruler-or-dynasty": ["monarch", "ruler", "dynasty"],
  "official-patron-or-sponsor": ["official", "patron", "sponsor"],
  "explorer-or-founder": ["explorer", "founder"],
  "commander-or-conqueror": ["commander", "conqueror"],
};
const NATIVE = ["[native bird]", "[native wild animal]", "[native fish or creature]", "[native tree]", "[native plant]"];
const COLONIAL_ALLOWED = new Set([
  "[personal name]",
  "[royal woman]",
  "[homeland place name]",
  "[colonial deity]",
  "[holy person]",
  "[native people]",
  "[native place]",
  ...Object.values(SPLITS).flat().map((l) => `[${l}]`),
  ...NATIVE,
]);
const ESTABLISHED_ONLY = ["[local deity]", "[local settlement word]", "[local market word]"];
/** Etymology labels of the five native categories, as the shape data words them, with a filled word. */
const NATIVE_WORD_FILL = /\[(bird|wild animal|fish and other creatures|tree|wild plant): /i;

const colonialRun = (part: "new-land" | "established", tradition: string | undefined, context: string | undefined, seed: number) =>
  generatePlaceNames({ recipe: colonialPlaceNamesRecipe(part, tradition, context), slots: {}, count: 200, seed });

test("colonial place names: allowed brackets, no + signs, natives never British words, deterministic", () => {
  let domestic = 0;
  let crop = 0;
  for (const [part, code] of [["new-land", "2"], ["established", "2a"]] as const) {
    const allowed = new Set([...COLONIAL_ALLOWED, ...(part === "established" ? ESTABLISHED_ONLY : [])]);
    const traditions = COLONIAL_TRADITIONS.filter((t) => isTraditionAvailable(t.id, code)).map((t) => (t.id === "general" ? undefined : t.id));
    const contexts = [undefined, ...colonialContexts(code).map((c) => c.id)];
    for (const tradition of traditions) {
      for (const context of contexts) {
        for (const seed of [1, 42]) {
          const result = colonialRun(part, tradition, context, seed);
          assert.equal(result.names.length, 200);
          for (const name of result.names) {
            for (const [bracket] of name.text.matchAll(/\[[^\]]*\]/g)) assert.ok(allowed.has(bracket), `${part} ${tradition} ${context}: ${name.text}`);
            assert.ok(!name.text.includes(" + "), name.text);
            assert.ok(!NATIVE_WORD_FILL.test(name.etymology), `British flora/fauna word: ${name.etymology}`);
            assert.ok(!/ of \[native (bird|wild animal|fish or creature|tree|plant)\]/.test(name.text), `name-style native: ${name.text}`);
            if (/\[domestic animal: /.test(name.etymology)) domestic++;
            if (/\[crop: /.test(name.etymology)) crop++;
            for (const fill of riverFills(name.etymology)) checkRiverFill(fill);
          }
          assert.deepEqual(
            colonialRun(part, tradition, context, seed).names.map((n) => [n.text, n.etymology]),
            result.names.map((n) => [n.text, n.etymology]),
          );
        }
      }
    }
  }
  assert.ok(domestic > 0 && crop > 0, "domestic animals and crops still fill with words");
});

const colonialShape = (s: Partial<ColonialShape>): ColonialShape => ({
  part: "2",
  groupId: "x",
  genericId: "bay",
  categoryId: "bird",
  structure: "two-part-compound",
  wordOrder: "generic-first-linked",
  treatments: {},
  ...s,
});
const colonialRenderer = (slots: Record<string, ResolvedSlot> = {}, ofTheRng?: () => number) =>
  new NameRenderer(withDefaults({ shape: { part: "new-land" } }), slots, undefined, { ofTheRng });

test("native placeholders: of the, or English order spaced; never Bay of [native …]", () => {
  assert.equal(colonialRenderer({}, () => 0).renderColonial(colonialShape({}), mulberry32(1)).text, "Bay of the [native bird]");
  assert.equal(colonialRenderer({}, () => 1).renderColonial(colonialShape({}), mulberry32(1)).text, "[native bird] Bay");
  assert.equal(
    colonialRenderer({}, () => 0).renderColonial(colonialShape({ categoryId: "tree", genericId: "creek", wordOrder: "specific-first" }), mulberry32(1)).text,
    "[native tree] Creek",
  );
  assert.equal(
    colonialRenderer({}, () => 0).renderColonial(colonialShape({ categoryId: "tree", genericId: "creek", wordOrder: "generic-first-direct" }), mulberry32(1)).text,
    "[native tree] Creek",
  );
  // Organic rendering is unaffected: a bird there still draws its list.
  const organic = new NameRenderer(britishPlaceNamesRecipe(undefined), {}, undefined).render(organicShape("bird", "germanic"), mulberry32(1));
  assert.ok(!organic.text.includes("[native"), organic.text);
});

test("native placeholders: a recipe mapping wins; explicit built-in draws the British list", () => {
  const kookaburra = { modern: "kookaburra", forms: [], fuses: "no" as const };
  const mapped = colonialRenderer({ bird: { kind: "sources", sources: [{ weight: 1, entries: [kookaburra] }] } }, () => 1)
    .renderColonial(colonialShape({}), mulberry32(1));
  assert.equal(mapped.text, "Kookaburra Bay");
  const builtIn = colonialRenderer({ bird: { kind: "built-in" } }, () => 1).renderColonial(colonialShape({}), mulberry32(1));
  assert.ok(!builtIn.text.includes("[native"), builtIn.text);
  assert.match(builtIn.etymology, /\[bird: /);
});

test("placeholder labels: renamed in names, shape-data labels in etymology", () => {
  const r = colonialRenderer();
  const people = r.renderColonial(colonialShape({ categoryId: "native-people-or-tribe", genericId: "town", wordOrder: "specific-first" }), mulberry32(1));
  assert.match(people.text, /\[native people\]/);
  assert.match(people.etymology, /native people or tribe/);
  const place = r.renderColonial(colonialShape({ categoryId: "native-place-name", structure: "bare-specific" }), mulberry32(1));
  assert.equal(place.text, "[native place]");
  assert.match(place.etymology, /native place name/);
});

test("placeholder labels: split components each within ±4 points over 3,000+, combined labels never shown", () => {
  for (const [categoryId, parts] of Object.entries(SPLITS)) {
    const counts = new Map(parts.map((p) => [p, 0]));
    const renderer = new NameRenderer(withDefaults({ shape: { part: "new-land" } }), {}, undefined, { labelRng: mulberry32(7) });
    const n = 3000;
    for (let i = 0; i < n; i++) {
      const text = renderer.renderColonial(colonialShape({ categoryId, genericId: "town", wordOrder: "specific-first" }), mulberry32(i)).text;
      const label = text.match(/\[([^\]]+)\]/)![1];
      assert.ok(counts.has(label), `combined or unknown label: ${text}`);
      counts.set(label, counts.get(label)! + 1);
    }
    for (const [label, c] of counts) assert.ok(Math.abs(c / n - 1 / parts.length) <= 0.04, `${label}: ${(c / n).toFixed(3)}`);
  }
});

test("placeholder labels: split choices never touch the fill stream", () => {
  let fillCalls = 0;
  const base = mulberry32(3);
  const fill = () => {
    fillCalls++;
    return base();
  };
  const shape = colonialShape({ categoryId: "monarch-ruler-or-dynasty", genericId: "town", wordOrder: "specific-first" });
  new NameRenderer(withDefaults({ shape: { part: "new-land" } }), {}, undefined, { labelRng: mulberry32(1) }).renderColonial(shape, fill);
  const withSplit = fillCalls;
  fillCalls = 0;
  new NameRenderer(withDefaults({ shape: { part: "new-land" } }), {}, undefined, { labelRng: mulberry32(2) }).renderColonial(shape, fill);
  assert.equal(fillCalls, withSplit);
});

test("history: each entry belongs to one module, old labels included", () => {
  const cases: [string, string][] = [
    ["river names · British", "placeShapes"],
    ["river names · New Land", "placeShapes"],
    ["world place names · Egyptian · Pharaonic", "placeShapes"],
    ["world place names · Norse", "placeShapes"],
    ["british place names · North", "placeShapes"],
    ["place name shapes · Wales", "placeShapes"],
    ["generic place name generator", "placeShapes"],
    ["exploration into new lands · Spanish", "explorationPlaceShapes"],
    ["exploration in new lands · Spanish", "explorationPlaceShapes"],
    ["exploration place names · Spanish", "explorationPlaceShapes"],
    ["exploration place name shapes", "explorationPlaceShapes"],
    ["expansion into settled lands · Roman", "empireExpansionPlaceShapes"],
    ["empire expansion place names", "empireExpansionPlaceShapes"],
    ["empire expansion place name shapes · Dutch", "empireExpansionPlaceShapes"],
    ["tribes and kin groups · Celtic Britain & Gaul · homeland · plain", "tribalNames"],
    ["tribal names · Polynesian · temperate · plain", "tribalNames"],
    ["armies and martial orders · high or epic fantasy · Germanic & Norse", "martialOrders"],
    ["supernatural courts and hosts · contemporary fantasy · General", "supernaturalCourts"],
    ["Saxon names", "markov"],
    ["nameForge", "markov"],
  ];
  for (const [label, section] of cases) assert.equal(historySection(label), section, label);
});
