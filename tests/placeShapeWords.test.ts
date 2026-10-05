import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generatePlaceShapesDetailed,
  PLACE_SHAPE_DATA,
  PLACE_SHAPE_REGIONS,
  PLACE_SHAPE_WORD_DATA,
  resolveProfile,
  samplePlaceShapes,
} from "../src/placeShapes";

const words = PLACE_SHAPE_WORD_DATA;
const CODES = PLACE_SHAPE_REGIONS.map((r) => r.code);
const generics = PLACE_SHAPE_DATA.groups.flatMap((g) => g.generics.map((x) => x.id));
const valleys = PLACE_SHAPE_DATA.groups.find((g) => g.id === "valleys")!;
const REGION_CASES: (string | undefined)[] = [undefined, "NTH", "WCY", "WAL", "SHH"];
const SEEDS = [1, 42, 2026, 12345];

test("coverage: every generic has exactly one plain word entry or rewrite", () => {
  assert.ok(generics.includes("river-cut-gorge"));
  for (const id of generics) {
    const n = (id in words.words ? 1 : 0) + words.rewrites.filter((r) => r.generic === id).length;
    assert.equal(n, 1, `${id} has ${n} entries`);
  }
  for (const [id, entry] of Object.entries(words.words)) {
    assert.ok(generics.includes(id), `unknown generic ${id}`);
    assert.equal(entry.plurals.length, entry.words.length, id);
  }
  for (const v of words.variants) {
    assert.ok(generics.includes(v.generic), `variant for unknown generic ${v.generic}`);
    for (const code of v.regions) assert.ok(CODES.includes(code), `${v.generic}: ${code}`);
  }
});

test("equivalence: plain words re-render the same shapes, position by position", () => {
  for (const region of REGION_CASES) {
    for (const seed of SEEDS) {
      const meaning = generatePlaceShapesDetailed({ count: 100, seed, region });
      const plain = generatePlaceShapesDetailed({ count: 100, seed, region, wording: "plain" });
      assert.deepEqual(plain.shapes, meaning.shapes, `seed ${seed}, region ${region ?? "All Britain"}`);
      assert.equal(plain.names.length, meaning.names.length);
      for (const name of plain.names) assert.doesNotMatch(name, /\(plural\)/);
    }
  }
});

test("main RNG: plain wording leaves it exactly where meaning wording does", () => {
  for (const region of REGION_CASES) {
    for (const seed of SEEDS) {
      const a = generatePlaceShapesDetailed({ count: 50, seed, region });
      const b = generatePlaceShapesDetailed({ count: 50, seed, region, wording: "plain" });
      assert.equal(b.mainRngNext, a.mainRngNext, `seed ${seed}`);
    }
  }
});

test("variants: none with All Britain; always shown for a listed generic in a listed region", () => {
  const variantWords = new Set(words.variants.flatMap((v) => [v.variant, v.plural]));
  for (const seed of SEEDS) {
    for (const name of generatePlaceShapesDetailed({ count: 100, seed, wording: "plain" }).names) {
      for (const [, inner] of name.matchAll(/\(([^)]+)\)/g)) assert.ok(!variantWords.has(inner), name);
    }
  }
  for (const v of words.variants) {
    for (const region of v.regions) {
      const { shapes, names } = generatePlaceShapesDetailed({ count: 200, seed: 7, region, wording: "plain" });
      shapes.forEach((shape, i) => {
        if (shape.genericId === v.generic || shape.stackedGenericId === v.generic) {
          assert.match(names[i], new RegExp(`\\((${v.variant}|${v.plural})\\)`), `${region}: ${names[i]}`);
        }
      });
    }
  }
});

test("determinism: same seed and settings give the same plain batch, word choices included", () => {
  for (const region of REGION_CASES) {
    const a = generatePlaceShapesDetailed({ count: 100, seed: 99, region, wording: "plain" });
    const b = generatePlaceShapesDetailed({ count: 100, seed: 99, region, wording: "plain" });
    assert.deepEqual(a.names, b.names);
  }
});

test("rewrites: dropped generics never show their Meaning in plain words", () => {
  const { shapes, names } = generatePlaceShapesDetailed({ count: 5000, seed: 3, wording: "plain" });
  assert.ok(names.every((n) => !/\[(folk-group homestead|settlement by a roman site|island of irish monks)\]/.test(n)));
  shapes.forEach((shape, i) => {
    if (shape.genericId === "folk-group-homestead") assert.match(names[i], /\[personal name\] \+ \[people of\] \+ homestead/);
  });
});

test("gorge: only its own profile's categories, and commoner in WCY than EAN", () => {
  const allowed = resolveProfile(valleys, "river-cut-gorge");
  const count = (region: string) => {
    const sample = samplePlaceShapes({ count: 50_000, seed: 5, region, groupIds: ["valleys"] });
    const gorges = sample.filter((s) => s.genericId === "river-cut-gorge");
    for (const s of gorges) assert.notEqual(allowed.get(s.categoryId), "unlikely", s.categoryId);
    return gorges.length;
  };
  assert.ok(count("WCY") > count("EAN"));
});
