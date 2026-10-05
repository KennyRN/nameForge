import { test } from "node:test";
import assert from "node:assert/strict";
import fixture from "./fixtures/place-shapes-part1.json";
import {
  generatePlaceShapesDetailed,
  PLACE_SHAPE_DATA,
  PLACE_SHAPE_REGION_DATA,
  PLACE_SHAPE_REGIONS,
  resolveProfile,
  samplePlaceShapes,
} from "../src/placeShapes";

const data = PLACE_SHAPE_DATA;
const regions = PLACE_SHAPE_REGION_DATA;
const CODES = PLACE_SHAPE_REGIONS.map((r) => r.code);
const groupsById = new Map(data.groups.map((g) => [g.id, g]));
const groupOfGeneric = new Map(data.groups.flatMap((g) => g.generics.map((x) => [x.id, g.id] as const)));
const categoryIds = new Set(data.categories.map((c) => c.id));
const affixIds = new Set(data.affixes.map((a) => a.id));

test("neutral: All Britain reproduces the captured part 1 output exactly", () => {
  for (const { seed, count, names } of fixture.cases) {
    assert.deepEqual(generatePlaceShapesDetailed({ count, seed }).names, names, `seed ${seed}, count ${count}`);
  }
});

test("integrity: every id in the regional data exists in part 1", () => {
  assert.equal(new Set(CODES).size, 12);
  for (const code of CODES) {
    const groups = regions.groupMultipliers[code];
    assert.deepEqual(Object.keys(groups).sort(), data.groups.map((g) => g.id).sort(), `${code} group multipliers`);
    for (const id of Object.keys(regions.categoryMultipliers[code] ?? {})) assert.ok(categoryIds.has(id), `${code}: ${id}`);
    for (const id of Object.keys(regions.affixMultipliers[code] ?? {})) assert.ok(affixIds.has(id), `${code}: ${id}`);
    assert.ok(regions.structure[code], `${code} structure`);
  }
  for (const tied of regions.tiedGenerics) {
    assert.ok(groupOfGeneric.has(tied.generic), tied.generic);
    for (const code of [...tied.home, ...tied.present]) assert.ok(CODES.includes(code), `${tied.generic}: ${code}`);
  }
  for (const id of Object.keys(regions.affixBaseline)) assert.ok(affixIds.has(id), id);
  for (const key of [
    ...Object.keys(regions.groupMultipliers),
    ...Object.keys(regions.categoryMultipliers),
    ...Object.keys(regions.wordOrder),
    ...Object.keys(regions.structure),
    ...Object.keys(regions.affixMultipliers),
  ]) {
    assert.ok(CODES.includes(key), `unknown region code ${key}`);
  }
});

test("integrity: every word order row sums to 100", () => {
  for (const code of CODES) {
    const sum = Object.values(regions.wordOrder[code]).reduce((a, b) => a + b, 0);
    assert.equal(sum, 100, code);
  }
});

test("regions: no Unlikely pairing in 10,000 shapes per region", () => {
  for (const code of CODES) {
    for (const shape of samplePlaceShapes({ count: 10_000, seed: 17, region: code })) {
      const tier = resolveProfile(groupsById.get(shape.groupId)!, shape.genericId).get(shape.categoryId);
      assert.notEqual(tier, "unlikely", `${code}: ${shape.genericId} + ${shape.categoryId}`);
    }
  }
});

test("regions: word order shares within ±3 points of the regional table", () => {
  for (const code of CODES) {
    const compounds = samplePlaceShapes({ count: 10_000, seed: 23, region: code }).filter(
      (s) => s.structure === "two-part-compound",
    );
    for (const [order, percent] of Object.entries(regions.wordOrder[code])) {
      const share = (100 * compounds.filter((s) => s.wordOrder === order).length) / compounds.length;
      assert.ok(Math.abs(share - percent) <= 3, `${code} ${order}: ${share.toFixed(1)}% vs ${percent}%`);
    }
  }
});

// Frequency of each generic within its own group (the "filter set to the generic's group" of §10).
const SAMPLE = 50_000;
const tallies = new Map<string, Map<string, number>>(); // `${code}/${group}` → generic → count
function frequency(code: string, genericId: string): number {
  const groupId = groupOfGeneric.get(genericId)!;
  const key = `${code}/${groupId}`;
  let tally = tallies.get(key);
  if (!tally) {
    tally = new Map();
    for (const s of samplePlaceShapes({ count: SAMPLE, seed: 31, region: code, groupIds: [groupId] })) {
      tally.set(s.genericId, (tally.get(s.genericId) ?? 0) + 1);
    }
    tallies.set(key, tally);
  }
  return (tally.get(genericId) ?? 0) / SAMPLE;
}

function tiedMultiplier(code: string, genericId: string): number {
  const tied = regions.tiedGenerics.find((t) => t.generic === genericId);
  if (!tied) return 1;
  if (tied.home.includes(code)) return regions.tiedMultipliers.home;
  if (tied.present.includes(code)) return regions.tiedMultipliers.present;
  return regions.tiedMultipliers.other;
}

test("regions: region-tied generics are drawn at exactly their weighted share", () => {
  for (const tied of regions.tiedGenerics) {
    const group = groupsById.get(groupOfGeneric.get(tied.generic)!)!;
    for (const code of CODES) {
      const total = group.generics.reduce((sum, g) => sum + tiedMultiplier(code, g.id), 0);
      const expected = tiedMultiplier(code, tied.generic) / total;
      const sigma = Math.sqrt((expected * (1 - expected)) / SAMPLE);
      const actual = frequency(code, tied.generic);
      assert.ok(
        Math.abs(actual - expected) <= 5 * sigma + 1e-4,
        `${tied.generic} in ${code}: ${actual.toFixed(4)} vs expected ${expected.toFixed(4)}`,
      );
    }
  }
});

// The brief's §10 rule. With the §4 multipliers it is unattainable for 20 of 60 generics: frequency
// is normalised within the group, so when siblings are also region-tied (e.g. all four seasonal
// generics) the Home/other ratio falls well short of 10×. Kept as a todo pending a decision.
test(
  "regions: Home frequency ≥ 10× frequency where absent (brief §10)",
  { todo: "unattainable for 20 generics with the given multipliers — see summary" },
  (t) => {
    const shortfalls: string[] = [];
    for (const tied of regions.tiedGenerics) {
      const others = CODES.filter((c) => !tied.home.includes(c) && !tied.present.includes(c));
      // Generics with no Home region are checked Present vs other at 5×: the expected ratio is only ~10×.
      const [favoured, minRatio] = tied.home.length > 0 ? [tied.home, 10] : [tied.present, 5];
      for (const fav of favoured) {
        for (const other of others) {
          const ratio = frequency(fav, tied.generic) / frequency(other, tied.generic);
          if (ratio < minRatio) shortfalls.push(`${tied.generic}: ${fav} vs ${other} = ${ratio.toFixed(1)}×`);
        }
      }
    }
    for (const line of shortfalls) t.diagnostic(line);
    assert.equal(shortfalls.length, 0, `${shortfalls.length} Home/other pairs below the threshold`);
  },
);

test("regions: same seed and region give an identical batch", () => {
  for (const code of CODES) {
    const a = generatePlaceShapesDetailed({ count: 50, seed: 2026, region: code });
    const b = generatePlaceShapesDetailed({ count: 50, seed: 2026, region: code });
    assert.deepEqual(a.names, b.names, code);
  }
  assert.notDeepEqual(
    generatePlaceShapesDetailed({ count: 50, seed: 2026, region: "WAL" }).names,
    generatePlaceShapesDetailed({ count: 50, seed: 2026 }).names,
  );
});
