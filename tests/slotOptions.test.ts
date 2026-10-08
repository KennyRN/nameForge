// The place name wizard's slot tiers and per-slot options (slot tiers brief §D).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  allowsLists,
  allowsPacks,
  allowsPlaceholderChoice,
  showsGender,
  type SlotPart,
  slotCategories,
  slotTier,
  type SlotTier,
  tierIncludes,
  tierTableIds,
  usesNativeDefault,
} from "../src/names/slotOptions";

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

const WORD_ONLY = [
  "status-or-role", "ethnic-or-cultural-group", "settler-group", "supernatural-being", "domestic-animal", "crop",
  "landform", "water-or-wetland-feature", "soil-or-ground", "built-feature",
  "colour", "size", "age", "position-or-direction", "shape", "quality-or-condition", "number",
  "activity", "produce", "religious-association", "assembly-or-law", "season", "honorific-title",
  "emotion-or-aspiration", "event-or-incident", "imperial-claim", "resource", "distance-or-survey-mark", "calendar-date-or-feast",
];
const FLORA_AND_FAUNA = ["wild-animal", "bird", "fish-and-other-creatures", "tree", "wild-plant"];
const NAMES_ONLY = [
  "personal-name", "folk-group", "monarch-ruler-or-dynasty", "royal-woman", "official-patron-or-sponsor",
  "commander-or-conqueror", "explorer-or-founder", "saint-or-holy-person", "deity", "colonial-deity", "local-deity",
  "native-place-name", "native-people-or-tribe", "homeland-place-name", "earlier-or-district-name", "river-or-stream-name",
];
const BOTH = ["classical-biblical-or-legendary-name", "ship", "local-settlement-word", "local-market-word"];

test("options: Name packs and Word lists per slot", () => {
  for (const part of PARTS) {
    for (const id of WORD_ONLY) assert.equal(allowsPacks(part, id), false, `${part} ${id} packs`);
    for (const id of FLORA_AND_FAUNA) assert.equal(allowsPacks(part, id), part !== "organic", `${part} ${id} packs`);
    for (const id of NAMES_ONLY) {
      assert.equal(allowsLists(part, id), false, `${part} ${id} lists`);
      assert.equal(allowsPacks(part, id), true, `${part} ${id} packs`);
    }
    for (const id of BOTH) {
      assert.equal(allowsPacks(part, id), true, `${part} ${id} packs`);
      assert.equal(allowsLists(part, id), true, `${part} ${id} lists`);
    }
    for (const id of WORD_ONLY) assert.equal(allowsLists(part, id), true, `${part} ${id} lists`);
  }
});

test("options: no Placeholder choice for bare descriptive slots", () => {
  const none = ["colour", "size", "age", "position-or-direction", "shape", "quality-or-condition", "number", "season"];
  for (const part of PARTS) {
    for (const id of ids(part)) assert.equal(allowsPlaceholderChoice(part, id), !none.includes(id), `${part} ${id}`);
  }
});

test("options: Male % only for slots with a default ratio, never royal woman", () => {
  const gendered = [
    "personal-name", "saint-or-holy-person", "deity", "colonial-deity", "local-deity",
    "monarch-ruler-or-dynasty", "official-patron-or-sponsor", "commander-or-conqueror", "explorer-or-founder",
  ];
  const all = new Set(PARTS.flatMap(ids));
  for (const id of all) assert.equal(showsGender(id), gendered.includes(id), id);
  assert.equal(showsGender("royal-woman"), false);
});

test("options: the native placeholder default covers exactly colonial flora and fauna", () => {
  for (const part of PARTS) {
    for (const id of ids(part)) {
      assert.equal(usesNativeDefault(part, id), part !== "organic" && FLORA_AND_FAUNA.includes(id), `${part} ${id}`);
    }
  }
});
