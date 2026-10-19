// Urban brief §7, §9.5: the kit's town and neighbours come from settlement names at the kit's size.
import { test } from "node:test";
import assert from "node:assert/strict";
import { settlementTownPool } from "../src/settlement/context";
import { generateKit } from "../src/settlement/kit";
import { generateSettlementNames } from "../src/settlement/names";

const places = (kit: ReturnType<typeof generateKit>) => [kit.context.town, ...kit.context.neighbours];

test("kit: a British town kit draws its town and neighbours from the town pool", () => {
  const pool = new Set(settlementTownPool("norman-british", "town"));
  assert.equal(pool.size > 200, true);
  for (const seed of [1, 2, 3, 4]) {
    const kit = generateKit({ culture: "norman-british", size: "town", seed });
    for (const place of places(kit)) assert.ok(pool.has(place), `${seed}: ${place}`);
  }
});

test("kit: a Chinese city kit draws from the Chinese city pool, and each size has its own pool", () => {
  const pool = new Set(settlementTownPool("chinese", "city"));
  assert.ok(pool.size > 50);
  for (const seed of [1, 2, 3]) {
    const kit = generateKit({ culture: "chinese", era: "MD", size: "city", seed });
    for (const place of places(kit)) assert.ok(pool.has(place), `${seed}: ${place}`);
  }
  assert.notDeepEqual(settlementTownPool("chinese", "city"), settlementTownPool("chinese", "village"));
});

test("kit: the pool is 300 settlement names at seed 1789, by culture, size and place-shape region", () => {
  const direct = generateSettlementNames({ setting: "native", culture: "britain", size: "village", count: 300, seed: 1789 }).names.map((n) => n.text);
  assert.deepEqual(settlementTownPool("norman-british", "village"), direct.filter((n) => !n.includes("[")));
  assert.notDeepEqual(settlementTownPool("norman-british", "village", "NTH"), settlementTownPool("norman-british", "village"));
  // Not a place-shape region code: all of Britain.
  assert.deepEqual(settlementTownPool("norman-british", "village", "nonsense"), settlementTownPool("norman-british", "village"));
  // Region is for British only.
  assert.deepEqual(settlementTownPool("chinese", "town", "NTH"), settlementTownPool("chinese", "town"));
});

test("kit: Greek & Byzantine, steppe and the sensitive cultures keep their old path", () => {
  for (const culture of ["greek-byzantine", "steppe", "polynesian", "andean"]) assert.deepEqual(settlementTownPool(culture, "town"), [], culture);
  const kit = generateKit({ culture: "greek-byzantine", size: "town", seed: 3 });
  assert.equal(places(kit).length, 7);
});

test("kit: a future-era kit keeps its station and colony names", () => {
  const pool = new Set(settlementTownPool("norman-british", "town"));
  const towns = [1, 2, 3, 4, 5].flatMap((seed) => places(generateKit({ culture: "norman-british", era: "NF", size: "town", seed })));
  assert.ok(towns.length > 0);
  assert.ok(towns.filter((t) => pool.has(t)).length < towns.length / 4);
});
