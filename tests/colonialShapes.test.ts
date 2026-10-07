import { test } from "node:test";
import assert from "node:assert/strict";
import fixture from "./fixtures/place-shapes-part1.json";
import { generatePlaceShapesDetailed, PLACE_SHAPE_DATA } from "../src/placeShapes";
import {
  COLONIAL_DATA,
  COLONIAL_TRADITIONS,
  type ColonialPart,
  type ColonialShape,
  deriveRenamingType,
  generateColonialShapesDetailed,
  isTraditionAvailable,
  resolveColonialProfile,
  sampleColonialShapes,
} from "../src/colonialShapes";

const data = COLONIAL_DATA;
const PARTS: ColonialPart[] = ["2", "2a"];
const part1Generics = new Set(PLACE_SHAPE_DATA.groups.flatMap((g) => g.generics.map((x) => x.id)));
const part1Categories = new Set(PLACE_SHAPE_DATA.categories.map((c) => c.id));
const categoryIds = new Set([...data.inheritedCategories.map((c) => c.id), ...data.categories.map((c) => c.id)]);
const groupIds = new Set(data.groups.map((g) => g.id));
const genericParts = new Map<string, ColonialPart[]>();
for (const g of data.groups) {
  for (const entry of g.generics) {
    if (typeof entry === "string") genericParts.set(entry, ["2", "2a"]);
    else genericParts.set(entry.id, entry.parts);
  }
}
const categoryParts = new Map<string, ColonialPart[]>([
  ...data.inheritedCategories.map((c) => [c.id, c.parts] as const),
  ...data.categories.map((c) => [c.id, c.parts] as const),
]);
const groupsById = new Map(data.groups.map((g) => [g.id, g]));
const sumTo = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

test("integrity: every id resolves, inherited ids are part 1 ids", () => {
  for (const c of data.inheritedCategories) assert.ok(part1Categories.has(c.id), c.id);
  for (const id of data.excludedCategories) assert.ok(part1Categories.has(id) && !categoryIds.has(id), id);
  for (const g of data.groups) {
    for (const entry of g.generics) if (typeof entry === "string") assert.ok(part1Generics.has(entry), `${g.id}: ${entry}`);
    const referenced = [
      ...Object.keys(g.set ?? {}),
      ...(g.profile ? [...g.profile.common, ...g.profile.occasional, ...g.profile.rare] : []),
      ...g.overrides.flatMap((o) => Object.keys(o.set)),
    ];
    for (const id of referenced) assert.ok(categoryIds.has(id), `${g.id}: category ${id}`);
    for (const o of g.overrides) for (const id of o.generics) assert.ok(genericParts.has(id), `${g.id}: generic ${id}`);
  }
  for (const id of Object.keys(data.prefixOrders)) assert.ok(genericParts.has(id), `prefix ${id}`);
  const profiles = [...COLONIAL_TRADITIONS, ...data.contexts["2"], ...data.contexts["2a"]];
  for (const p of profiles) {
    for (const id of Object.keys(p.categoryMultipliers)) assert.ok(categoryIds.has(id), `${p.id}: category ${id}`);
    for (const id of Object.keys(p.groupMultipliers)) assert.ok(groupIds.has(id), `${p.id}: group ${id}`);
    for (const id of Object.keys("genericMultipliers" in p ? p.genericMultipliers : {})) assert.ok(genericParts.has(id), `${p.id}: generic ${id}`);
  }
});

test("integrity: word-order rows sum to 100 and native splits to 1", () => {
  for (const t of COLONIAL_TRADITIONS) {
    assert.equal(sumTo(t.wordOrder), 100, t.id);
    assert.ok(Math.abs(sumTo(t.nativeTreatment) - 1) < 1e-9, t.id);
  }
  for (const [id, row] of Object.entries(data.prefixOrders)) {
    const { prefix: _prefix, ...orders } = row;
    assert.equal(sumTo(orders), 100, id);
  }
  for (const c of [...data.contexts["2"], ...data.contexts["2a"]]) {
    if (c.nativeTreatment) assert.ok(Math.abs(sumTo(c.nativeTreatment) - 1) < 1e-9, c.id);
  }
});

test("part 1 unchanged: All Britain still reproduces the captured output", () => {
  for (const { seed, count, names } of fixture.cases) {
    assert.deepEqual(generatePlaceShapesDetailed({ count, seed }).names, names);
  }
});

test("part filtering: nothing marked for the other part appears", () => {
  for (const part of PARTS) {
    for (const shape of sampleColonialShapes({ count: 10_000, seed: 11, part })) {
      for (const g of [shape.genericId, shape.stackedGenericId]) {
        if (g) assert.ok(genericParts.get(g)!.includes(part), `${part}: generic ${g}`);
      }
      for (const c of [shape.categoryId, shape.secondCategoryId]) {
        if (c) assert.ok(categoryParts.get(c)!.includes(part), `${part}: category ${c}`);
      }
    }
  }
});

test("availability: unavailable traditions cannot be used in the wrong part", () => {
  for (const t of COLONIAL_TRADITIONS) {
    for (const part of PARTS) {
      const available = isTraditionAvailable(t.id, part);
      assert.equal(available, t.parts.includes(part));
      const run = () => generateColonialShapesDetailed({ count: 5, seed: 1, part, tradition: t.id === "general" ? undefined : t.id });
      if (available) assert.doesNotThrow(run);
      else assert.throws(run, /not available/);
    }
  }
});

test("zero respected: no Unlikely or × 0 item, and Islamic only for Arab and Ottoman", () => {
  for (const t of COLONIAL_TRADITIONS) {
    for (const part of t.parts) {
      const tradition = t.id === "general" ? undefined : t.id;
      for (const shape of sampleColonialShapes({ count: 10_000, seed: 13, part, tradition })) {
        const tier = resolveColonialProfile(groupsById.get(shape.groupId)!, shape.genericId).get(shape.categoryId);
        assert.notEqual(tier, "unlikely", `${t.id}: ${shape.genericId} + ${shape.categoryId}`);
        assert.notEqual(t.categoryMultipliers[shape.categoryId], 0, `${t.id}: ${shape.categoryId}`);
        assert.notEqual(t.groupMultipliers[shape.groupId], 0, `${t.id}: ${shape.groupId}`);
        assert.notEqual(t.genericMultipliers[shape.genericId], 0, `${t.id}: ${shape.genericId}`);
        if (shape.groupId === "religious-islamic") assert.ok(["arab", "ottoman"].includes(t.id), `${t.id} drew Islamic`);
      }
    }
  }
});

function wordOrderShares(tradition: string, part: ColonialPart, filter: (s: ColonialShape) => boolean) {
  const compounds = sampleColonialShapes({ count: 60_000, seed: 17, part, tradition }).filter(
    (s) => s.structure === "two-part-compound" && filter(s),
  );
  const share = (o: string) => (100 * compounds.filter((s) => s.wordOrder === o).length) / compounds.length;
  return { n: compounds.length, share };
}

test("word order: Spanish, Danish and Arab within ±3 points on non-prefix generics", () => {
  for (const tradition of ["spanish", "danish", "arab"]) {
    const t = COLONIAL_TRADITIONS.find((x) => x.id === tradition)!;
    const { n, share } = wordOrderShares(tradition, "2", (s) => !(s.genericId in data.prefixOrders));
    assert.ok(n >= 10_000, `${tradition}: only ${n} compounds`);
    for (const [order, percent] of Object.entries(t.wordOrder)) {
      assert.ok(Math.abs(share(order) - percent) <= 3, `${tradition} ${order}: ${share(order).toFixed(1)} vs ${percent}`);
    }
  }
});

test("prefix override: fort is generic-first direct 80% ±3", () => {
  const forts = sampleColonialShapes({ count: 200_000, seed: 19, part: "2", groupIds: ["defensive"] }).filter(
    (s) => s.genericId === "fort" && s.structure === "two-part-compound",
  );
  assert.ok(forts.length >= 5_000, `only ${forts.length} fort compounds`);
  const share = (100 * forts.filter((s) => s.wordOrder === "generic-first-direct").length) / forts.length;
  assert.ok(Math.abs(share - 80) <= 3, `${share.toFixed(1)}%`);
});

test("renaming types: one unit test per §6.5 rule", () => {
  const base: ColonialShape = { part: "2a", groupId: "valleys", genericId: "dale", categoryId: "colour", structure: "two-part-compound", treatments: {} };
  assert.equal(deriveRenamingType({ ...base, groupId: "colonial-settlement", genericId: "town", categoryId: "native-place-name", structure: "twin", twin: "new" }), "twin");
  assert.equal(deriveRenamingType({ ...base, translated: true }), "translated");
  assert.equal(
    deriveRenamingType({ ...base, categoryId: "monarch-ruler-or-dynasty", structure: "double-specific", secondCategoryId: "native-place-name", treatments: { second: "adapted" } }),
    "honorific-overlay",
  );
  assert.equal(deriveRenamingType({ ...base, groupId: "local-generics", genericId: "local-settlement-word", categoryId: "official-patron-or-sponsor" }), "hybrid");
  assert.equal(deriveRenamingType({ ...base, groupId: "colonial-settlement", genericId: "town", categoryId: "native-place-name", treatments: { specific: "adopted" } }), "hybrid");
  assert.equal(deriveRenamingType({ ...base, categoryId: "native-place-name", treatments: { specific: "adapted" } }), "adapted");
  assert.equal(deriveRenamingType({ ...base, categoryId: "explorer-or-founder" }), "replacement");
});

test("renaming types: stored on every 2a shape, never on part 2, never output", () => {
  const a = generateColonialShapesDetailed({ count: 200, seed: 23, part: "2a" });
  assert.ok(a.shapes.every((s) => s.renamingType));
  for (const name of a.names) assert.doesNotMatch(name, /overlay|replacement|hybrid/);
  assert.ok(generateColonialShapesDetailed({ count: 200, seed: 23, part: "2" }).shapes.every((s) => !s.renamingType));
});

test("determinism: same seed, part, tradition and context give an identical batch", () => {
  const settings = [
    { part: "2" as const, tradition: "english-speaking-settler", context: "wild-and-unsettled" },
    { part: "2a" as const, tradition: "spanish", context: "accommodation" },
    { part: "2a" as const },
  ];
  for (const s of settings) {
    const a = generateColonialShapesDetailed({ count: 100, seed: 2026, ...s });
    const b = generateColonialShapesDetailed({ count: 100, seed: 2026, ...s });
    assert.deepEqual(a.names, b.names);
    assert.deepEqual(a.shapes, b.shapes);
  }
});
