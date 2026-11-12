// Archived with the place name wizard: the slot tier tests, from tests/slotOptions.test.ts.
import { test } from "node:test";
import assert from "node:assert/strict";
import { type SlotPart, slotCategories } from "../../src/names/slotOptions";
import { slotTier, type SlotTier, tierIncludes, tierTableIds } from "./slotTiers";

const PARTS: SlotPart[] = ["organic", "new-land", "established"];
const ids = (part: SlotPart) => slotCategories(part).map((c) => c.id);
const count = (part: SlotPart, tier: SlotTier) => ids(part).filter((id) => tierIncludes(tier, slotTier(part, id))).length;

test("tiers: Simple, Detailed and Complete counts per part", () => {
  const expected: Record<SlotPart, [number, number, number]> = {
    organic: [3, 9, 32],
    "new-land": [8, 24, 46],
    established: [7, 23, 43],
  };
  for (const part of PARTS) {
    assert.ok(!ids(part).includes("empty-slot"), `${part} excludes empty-slot`);
    assert.deepEqual([count(part, "simple"), count(part, "detailed"), count(part, "complete")], expected[part], part);
  }
});

test("tiers: every id in the Simple and Detailed tables is a real category of its part", () => {
  for (const part of PARTS) {
    const real = new Set(ids(part));
    for (const tier of ["simple", "detailed"] as const) {
      for (const id of tierTableIds(part, tier)) assert.ok(real.has(id), `${part} ${tier}: ${id}`);
    }
  }
});

test("tiers: unlisted slots fall back to Complete", () => {
  assert.equal(slotTier("organic", "bird"), "complete");
  assert.equal(slotTier("new-land", "bird"), "simple");
  assert.equal(slotTier("organic", "a-future-category"), "complete");
});

