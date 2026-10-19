// Urban brief §9: the settlement data, the engines' `settlement` option, and the regression of the source modules.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { COLONIAL_DATA, generateColonialShapesDetailed } from "../src/colonialShapes";
import { generatePlaceNames } from "../src/names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe } from "../src/names/recipe";
import { generatePlaceShapesDetailed, PLACE_SHAPE_DATA } from "../src/placeShapes";
import {
  affixFormAllowed,
  entryWord,
  filterWorldList,
  genericAllowed,
  SETTLEMENT_DATA,
  SETTLEMENT_SIZES,
  sizeAllows,
  type SizeKey,
  worldTemplateAllowed,
} from "../src/settlement/data";
import { generateSettlementNames } from "../src/settlement/names";
import { findCulture, generateWorldPlaceNames, WORLD_CULTURES } from "../src/world/engine";

const SIZES = SETTLEMENT_SIZES.map((s) => s.key);
const SIZE_KEYS = SIZES.filter((s) => s !== "any");
const codeOf = (size: SizeKey) => SETTLEMENT_SIZES.find((s) => s.key === size)!.code!;

// ── 1. Data check ──────────────────────────────────────────────────────────

test("data: every size string uses only h v t c g", () => {
  const strings: string[] = [
    ...Object.values(SETTLEMENT_DATA.generics),
    SETTLEMENT_DATA.spaceSiteGroups.sizes,
    ...Object.values(SETTLEMENT_DATA.affixes).flatMap((f) => Object.values(f)),
    ...Object.values(SETTLEMENT_DATA.world).flatMap((c) => [
      ...Object.values(c.eras).flatMap((e) => Object.values(e)),
      ...Object.values(c.lists).flatMap((l) => Object.values(l)),
    ]),
  ];
  assert.ok(strings.length > 500);
  for (const s of strings) assert.match(s, /^[hvtcg]+$/, s);
});

test("data: every generic, space group and affix form exists", () => {
  const generics = new Set<string>();
  for (const g of PLACE_SHAPE_DATA.groups) for (const x of g.generics) generics.add(x.id);
  for (const g of COLONIAL_DATA.groups) for (const x of g.generics) generics.add(typeof x === "string" ? x : x.id);
  for (const id of Object.keys(SETTLEMENT_DATA.generics)) assert.ok(generics.has(id), `generic ${id}`);
  const groups = new Set(COLONIAL_DATA.groups.map((g) => g.id));
  for (const id of SETTLEMENT_DATA.spaceSiteGroups.groups) assert.ok(groups.has(id), `group ${id}`);
  const types = new Map<string, Set<string>>();
  for (const a of PLACE_SHAPE_DATA.affixes) types.set(a.id, new Set(a.forms.map((f) => f.text)));
  for (const [id, a] of Object.entries(COLONIAL_DATA.affixTypes)) types.set(id, new Set(a.forms.map((f) => f.text)));
  for (const [type, forms] of Object.entries(SETTLEMENT_DATA.affixes)) {
    assert.ok(types.has(type), `affix type ${type}`);
    for (const text of Object.keys(forms)) assert.ok(text === "*" || types.get(type)!.has(text), `${type}: ${text}`);
  }
});

test("data: every culture, era, template and list word exists", () => {
  for (const [cultureId, entry] of Object.entries(SETTLEMENT_DATA.world)) {
    const culture = WORLD_CULTURES.find((c) => c.id === cultureId);
    assert.ok(culture, cultureId);
    for (const [eraId, templates] of Object.entries(entry.eras)) {
      const era = culture!.eras.find((e) => e.id === eraId);
      assert.ok(era, `${cultureId}/${eraId}`);
      const have = new Set(era!.templates.map(([t]) => t));
      for (const t of Object.keys(templates)) assert.ok(have.has(t), `${cultureId}/${eraId}: ${t}`);
    }
    for (const [key, words] of Object.entries(entry.lists)) {
      const have = new Set([culture!.lists[key] ?? [], ...culture!.eras.map((e) => e.lists?.[key] ?? [])].flat().map(entryWord));
      assert.ok(have.size > 0, `${cultureId}: list ${key}`);
      for (const w of Object.keys(words)) assert.ok(have.has(w), `${cultureId}.${key}: ${w}`);
    }
  }
});

// ── 2. Regression ──────────────────────────────────────────────────────────

test("regression: native, exploration and expansion names are unchanged for fixed seeds", () => {
  const saved = JSON.parse(readFileSync("tests/fixtures/settlement-regression.json", "utf8")) as Record<string, string[]>;
  const texts = (r: { names: { text: string }[] }) => r.names.map((n) => n.text);
  let checked = 0;
  for (const seed of [1, 42, 2024]) {
    const base = { slots: {}, count: 30, seed, faithfulness: 2, strictness: 3 };
    const now: Record<string, string[]> = {
      [`british ${seed}`]: texts(generatePlaceNames({ ...base, recipe: britishPlaceNamesRecipe(undefined) })),
      [`british NTH ${seed}`]: texts(generatePlaceNames({ ...base, recipe: britishPlaceNamesRecipe("NTH") })),
      [`exploration ${seed}`]: texts(generatePlaceNames({ ...base, recipe: colonialPlaceNamesRecipe("new-land", undefined, undefined) })),
      [`expansion ${seed}`]: texts(generatePlaceNames({ ...base, recipe: colonialPlaceNamesRecipe("established", undefined, undefined) })),
    };
    for (const [culture, era] of [["norse", "viking"], ["chinese", "imperial"], ["roman", "medieval"]]) {
      now[`${culture} ${era} ${seed}`] = generateWorldPlaceNames({ culture, era, count: 30, seed }).names.map((n) => n.text);
    }
    for (const [key, names] of Object.entries(now)) {
      assert.deepEqual(names, saved[key], key);
      checked++;
    }
  }
  assert.equal(checked, Object.keys(saved).length);
});

// ── 3. Filter at "any" ─────────────────────────────────────────────────────

test("filter: at any, no British or colonial shape uses a generic or affix form outside the data", () => {
  const shapes = [
    ...generatePlaceShapesDetailed({ count: 400, seed: 3, settlement: { size: "any" } }).shapes,
    ...generatePlaceShapesDetailed({ count: 200, seed: 4, region: "NTH", settlement: { size: "any" } }).shapes,
  ];
  for (const part of ["2", "2a"] as const)
    shapes.push(...(generateColonialShapesDetailed({ count: 400, seed: 5, part, settlement: { size: "any" } }).shapes as never[]));
  assert.ok(shapes.length > 800);
  for (const s of shapes) {
    assert.ok(genericAllowed(s.genericId, "any"), s.genericId);
    if (s.stackedGenericId) assert.ok(genericAllowed(s.stackedGenericId, "any"), s.stackedGenericId);
    if (s.affix) assert.ok(affixFormAllowed(s.affix.typeId, s.affix.form.text, "any"), `${s.affix.typeId}: ${s.affix.form.text}`);
  }
});

test("filter: at any, no world name uses a template outside the data", () => {
  for (const culture of WORLD_CULTURES)
    for (const era of culture.eras) {
      if (!SETTLEMENT_DATA.world[culture.id]?.eras[era.id]) continue;
      const { names } = generateWorldPlaceNames({ culture: culture.id, era: era.id, count: 40, seed: 11, settlement: { size: "any" } });
      assert.ok(names.length > 0, `${culture.id}/${era.id}`);
      for (const n of names) assert.ok(worldTemplateAllowed(culture.id, era.id, n.template, "any"), `${culture.id}/${era.id}: ${n.template}`);
    }
});

// ── 4. Size ────────────────────────────────────────────────────────────────

test("size: at each size, every drawn generic, affix form and template carries the size's letter", () => {
  for (const size of SIZE_KEYS) {
    const shapes: { genericId: string; stackedGenericId?: string; affix?: { typeId: string; form: { text: string } } }[] = [];
    shapes.push(...generatePlaceShapesDetailed({ count: 300, seed: 7, settlement: { size } }).shapes);
    for (const part of ["2", "2a"] as const) {
      try {
        shapes.push(...generateColonialShapesDetailed({ count: 300, seed: 8, part, settlement: { size } }).shapes);
      } catch (e) {
        assert.match((e as Error).message, /^No eligible/);
      }
    }
    for (const s of shapes) {
      assert.ok(SETTLEMENT_DATA.generics[s.genericId].includes(codeOf(size)), `${size}: ${s.genericId}`);
      if (s.stackedGenericId) assert.ok(SETTLEMENT_DATA.generics[s.stackedGenericId].includes(codeOf(size)), `${size}: stacked ${s.stackedGenericId}`);
      if (s.affix) assert.ok(affixFormAllowed(s.affix.typeId, s.affix.form.text, size), `${size}: ${s.affix.form.text}`);
    }
    for (const culture of WORLD_CULTURES)
      for (const era of culture.eras) {
        if (!SETTLEMENT_DATA.world[culture.id]?.eras[era.id]) continue;
        let names;
        try {
          names = generateWorldPlaceNames({ culture: culture.id, era: era.id, count: 20, seed: 9, settlement: { size } }).names;
        } catch (e) {
          assert.match((e as Error).message, /^No eligible/);
          continue;
        }
        for (const n of names) assert.ok(worldTemplateAllowed(culture.id, era.id, n.template, size), `${size} ${culture.id}/${era.id}: ${n.template}`);
      }
  }
});

test("size: a filtered list keeps the size's words, or any listed word when it has none", () => {
  for (const [cultureId, entry] of Object.entries(SETTLEMENT_DATA.world)) {
    const culture = findCulture(cultureId);
    for (const [key, words] of Object.entries(entry.lists)) {
      const entries = [culture.lists[key] ?? [], ...culture.eras.map((e) => e.lists?.[key] ?? [])].flat();
      const listed = entries.filter((e) => words[entryWord(e)] !== undefined);
      for (const size of SIZE_KEYS) {
        const got = filterWorldList(cultureId, key, entries, size)!;
        const atSize = listed.filter((e) => words[entryWord(e)].includes(codeOf(size)));
        assert.deepEqual(got, atSize.length > 0 ? atSize : listed, `${cultureId}.${key} @ ${size}`);
      }
    }
  }
  assert.equal(filterWorldList("norse", "nothing-listed", ["Ox"], "town"), undefined);
});

test("size: Norse Viking at great city falls back to city, with a notice", () => {
  const result = generateSettlementNames({ setting: "native", culture: "norse", era: "viking", size: "great", count: 10, seed: 5 });
  assert.equal(result.size, "city");
  assert.ok(result.names.length > 0);
  assert.ok(result.notices.includes("Norse names don't run to a great city; these are city names."), result.notices.join("|"));
});

test("size: the eight great-city fallbacks, and no others", () => {
  const found: string[] = [];
  const check = (label: string, run: () => { size: SizeKey }) => {
    if (run().size !== "great") found.push(label);
  };
  for (const culture of WORLD_CULTURES)
    for (const era of culture.eras)
      if (SETTLEMENT_DATA.world[culture.id]?.eras[era.id]) check(`${culture.id}/${era.id}`, () => generateSettlementNames({ setting: "native", culture: culture.id, era: era.id, size: "great", count: 5, seed: 2 }));
  check("british", () => generateSettlementNames({ setting: "native", size: "great", count: 5, seed: 2 }));
  check("new-lands", () => generateSettlementNames({ setting: "new-lands", size: "great", count: 5, seed: 2 }));
  check("settled-lands", () => generateSettlementNames({ setting: "settled-lands", size: "great", count: 5, seed: 2 }));
  assert.deepEqual(found.sort(), [
    "anglo-saxon/modern",
    "korean/interstellar",
    "korean/joseon",
    "maya/interstellar",
    "norse/interstellar",
    "norse/viking",
    "roman/medieval",
    "west-african/interstellar",
  ]);
});

test("size: any never falls back, and a hamlet with nothing to draw throws", () => {
  const any = generateSettlementNames({ setting: "native", size: "any", count: 10, seed: 1 });
  assert.equal(any.size, "any");
  assert.deepEqual(any.notices.filter((n) => n.includes("don't run")), []);
  assert.ok(sizeAllows("h", "any") && !sizeAllows(undefined, "any"));
});
