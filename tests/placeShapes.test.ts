import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generatePlaceShapesDetailed,
  PLACE_SHAPE_DATA,
  resolveProfile,
  type ShapeProfile,
} from "../src/placeShapes";

const data = PLACE_SHAPE_DATA;
const categoryIds = new Set(data.categories.map((c) => c.id));
const groupsById = new Map(data.groups.map((g) => [g.id, g]));
const TIERS = ["dominant", "common", "occasional", "rare", "unlikely"] as const;

function profileCategories(profile: ShapeProfile): string[] {
  return TIERS.flatMap((tier) => profile[tier] ?? []);
}

test("data: ids are unique and kebab-case", () => {
  const groups = data.groups.map((g) => g.id);
  const generics = data.groups.flatMap((g) => g.generics.map((x) => x.id));
  const categories = data.categories.map((c) => c.id);
  const affixes = data.affixes.map((a) => a.id);
  for (const ids of [groups, generics, categories, affixes]) {
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  }
});

test("data: every generic belongs to exactly one group", () => {
  const owners = new Map<string, number>();
  for (const group of data.groups) {
    for (const generic of group.generics) owners.set(generic.id, (owners.get(generic.id) ?? 0) + 1);
  }
  for (const [id, n] of owners) assert.equal(n, 1, `${id} appears in ${n} groups`);
});

test("data: every referenced category exists", () => {
  for (const group of data.groups) {
    const referenced = [
      ...(group.profile ? profileCategories(group.profile) : []),
      ...group.overrides.flatMap((o) => [
        ...Object.keys(o.set ?? {}),
        ...(o.replace ? profileCategories(o.replace) : []),
      ]),
    ];
    for (const id of referenced) assert.ok(categoryIds.has(id), `${group.id} references unknown category ${id}`);
  }
  for (const affix of data.affixes) {
    for (const id of affix.slotCategories) assert.ok(categoryIds.has(id), `${affix.id} references unknown category ${id}`);
    for (const form of affix.forms) {
      if (form.slotCategory) assert.ok(categoryIds.has(form.slotCategory), `${affix.id} form references ${form.slotCategory}`);
    }
  }
});

test("data: overrides name generics of their own group, and every generic has a usable profile", () => {
  for (const group of data.groups) {
    const own = new Set(group.generics.map((g) => g.id));
    for (const override of group.overrides) {
      for (const id of override.generics) assert.ok(own.has(id), `${group.id} override names foreign generic ${id}`);
    }
    for (const generic of group.generics) {
      const usable = [...resolveProfile(group, generic.id).values()].some((tier) => tier !== "unlikely");
      assert.ok(usable, `${generic.id} has no non-Unlikely category`);
    }
  }
});

test("determinism: same seed and count give an identical batch", () => {
  const a = generatePlaceShapesDetailed({ count: 100, seed: 12345 });
  const b = generatePlaceShapesDetailed({ count: 100, seed: 12345 });
  assert.equal(a.seed, 12345);
  assert.deepEqual(a.names, b.names);
  assert.deepEqual(a.shapes, b.shapes);
  assert.notDeepEqual(generatePlaceShapesDetailed({ count: 100, seed: 54321 }).names, a.names);
});

test("profiles: a large sample never contains an Unlikely pairing", () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    const { shapes } = generatePlaceShapesDetailed({ count: 2000, seed });
    assert.ok(shapes.length > 1000);
    for (const shape of shapes) {
      const group = groupsById.get(shape.groupId)!;
      const tier = resolveProfile(group, shape.genericId).get(shape.categoryId);
      assert.notEqual(tier, "unlikely", `${shape.genericId} paired with ${shape.categoryId}`);
      if (shape.categoryId === "empty-slot") {
        assert.ok(shape.structure === "simplex" || shape.structure === "plural-simplex");
      } else {
        assert.ok(shape.structure !== "simplex" && shape.structure !== "plural-simplex");
      }
    }
  }
});

test("profiles: Empty slot only appears for generics whose profile allows it", () => {
  const { shapes } = generatePlaceShapesDetailed({ count: 5000, seed: 99 });
  const simplex = shapes.filter((s) => s.categoryId === "empty-slot");
  assert.ok(simplex.length > 0);
  for (const shape of simplex) {
    const tier = resolveProfile(groupsById.get(shape.groupId)!, shape.genericId).get("empty-slot");
    assert.ok(tier && tier !== "unlikely", `${shape.genericId} produced a simplex`);
  }
});

test("output: brackets, joins and lower case", () => {
  const { names } = generatePlaceShapesDetailed({ count: 500, seed: 7 });
  for (const name of names) {
    for (const [, label] of name.matchAll(/\[([^\]]+)\]/g)) assert.equal(label, label.toLowerCase());
    assert.match(name, /^(\S+ )?\[/);
  }
  assert.ok(names.some((n) => n.includes(" of the ")));
  assert.ok(names.some((n) => n.includes(" + ")));
});
