// Recipe regression (recipe takeover brief §A7): place names from recipes must stay byte-identical
// to the fixtures. First captured before takeover was added to colonial recipes; re-captured after
// the rendering overlay (river brief), which changes recipe output on purpose. Run with
// CAPTURE_RECIPES=1 to record.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { MarkovModel } from "../src/markov";
import { generatePlaceNames, generatePlaceNamesSteps, type NameGenerateResult, type ResolvedSlot } from "../src/names/engine";
import { type RecipePartial, withDefaults } from "../src/names/recipe";

const FIXTURE = "tests/fixtures/recipe-regression.json";
const pack = (file: string) =>
  readFileSync(`tests/fixtures/packs/${file}.txt`, "utf8").split("\n").map((l) => l.trim()).filter((l) => l);
const PACKS: Record<string, string[]> = {
  english: pack("english-towns"),
  latin: pack("latin-towns"),
  native: pack("native-places"),
};

/** A List-style source: one name picked at random. */
const listSlot = (names: string[]): ResolvedSlot => ({
  kind: "sources",
  sources: [{ weight: 1, draw: (_request, _mode, rng) => names[Math.floor(rng() * names.length)] ?? null }],
});
/** A Breakdown-style source: one Markov name, seeded from the stream (as RecipeHost does). */
const markovSlot = (names: string[]): ResolvedSlot => {
  const model = MarkovModel.build(names);
  return {
    kind: "sources",
    sources: [
      {
        weight: 1,
        draw: (_request, _mode, rng) =>
          model.generateDetailed({ count: 1, faithfulness: 2, strictness: 3, seed: Math.floor(rng() * 0x100000000) >>> 0 }).names[0] ?? null,
      },
    ],
  };
};

/** Native categories mapped to the native pack; a couple of colonial categories to the others. */
const colonialSlots = (): Record<string, ResolvedSlot> => ({
  "native-place-name": markovSlot(PACKS.native),
  "native-people-or-tribe": listSlot(PACKS.native),
  "river-or-stream-name": markovSlot(PACKS.native),
  "homeland-place-name": listSlot(PACKS.english),
  "personal-name": markovSlot(PACKS.latin),
});

export interface RecipeCase {
  seed: number;
  count: number;
  recipe: RecipePartial;
  slots: "none" | "organic" | "organic-ignore" | "colonial";
}

export const RECIPE_CASES: RecipeCase[] = [
  { seed: 1, count: 25, recipe: { shape: { part: "organic" } }, slots: "none" },
  { seed: 2, count: 25, recipe: { shape: { part: "organic", region: "east-midlands", feature: "settlement" } }, slots: "organic" },
  { seed: 3, count: 25, recipe: { shape: { part: "organic", feature: "landscape" }, register: "traditional" }, slots: "organic" },
  { seed: 4, count: 25, recipe: { shape: { part: "organic" }, render: { joining: "fused" } }, slots: "organic-ignore" },
  { seed: 5, count: 25, recipe: { shape: { part: "new-land" } }, slots: "colonial" },
  { seed: 6, count: 25, recipe: { shape: { part: "new-land", tradition: "british-imperial" } }, slots: "colonial" },
  { seed: 7, count: 25, recipe: { shape: { part: "new-land", tradition: "spanish", context: "contested-frontier" } }, slots: "colonial" },
  { seed: 8, count: 25, recipe: { shape: { part: "new-land", tradition: "english-speaking-settler", context: "wild-and-unsettled" } }, slots: "colonial" },
  { seed: 9, count: 25, recipe: { shape: { part: "new-land", tradition: "french", context: "sparse-or-weak-native-presence" } }, slots: "none" },
  { seed: 10, count: 25, recipe: { shape: { part: "established" } }, slots: "colonial" },
  { seed: 11, count: 25, recipe: { shape: { part: "established", tradition: "british-imperial", context: "adoption" } }, slots: "colonial" },
  { seed: 12, count: 25, recipe: { shape: { part: "established", tradition: "dutch", context: "accommodation" } }, slots: "colonial" },
  { seed: 13, count: 25, recipe: { shape: { part: "established", tradition: "russian", context: "imposition" } }, slots: "colonial" },
  { seed: 2026, count: 25, recipe: { shape: { part: "established", tradition: "arab" }, register: "modern" }, slots: "colonial" },
];

export function slotsFor(c: RecipeCase): Record<string, ResolvedSlot> {
  switch (c.slots) {
    case "none":
      return {};
    case "organic":
      return { "personal-name": markovSlot(PACKS.english) };
    case "organic-ignore":
      return { "personal-name": listSlot(PACKS.english), "domestic-animal": { kind: "ignore" } };
    case "colonial":
      return colonialSlots();
  }
}

const shapeOf = (n: { text: string; etymology: string }) => ({ text: n.text, etymology: n.etymology });

const summarise = (result: NameGenerateResult) => ({ seed: result.seed, names: result.names.map(shapeOf), notices: result.notices });

export const runCase = (c: RecipeCase) =>
  summarise(generatePlaceNames({ recipe: withDefaults(c.recipe), slots: slotsFor(c), count: c.count, seed: c.seed }));

/** The stepped generator, run to completion; also checks it yields once per name, counting up. */
const runCaseStepped = (c: RecipeCase) => {
  const steps = generatePlaceNamesSteps({ recipe: withDefaults(c.recipe), slots: slotsFor(c), count: c.count, seed: c.seed });
  const yielded: number[] = [];
  for (;;) {
    const next = steps.next();
    if (next.done) {
      assert.deepEqual(yielded, next.value.names.map((_, i) => i + 1));
      return summarise(next.value);
    }
    yielded.push(next.value);
  }
};

test("recipe regression: output matches the fixtures exactly", () => {
  const actual = RECIPE_CASES.map((c) => ({ case: c, result: runCase(c) }));
  if (process.env.CAPTURE_RECIPES) {
    writeFileSync(FIXTURE, JSON.stringify(actual, null, 2) + "\n");
    return;
  }
  const expected = JSON.parse(readFileSync(FIXTURE, "utf8"));
  assert.deepEqual(JSON.parse(JSON.stringify(actual)), expected);
});

test("recipe regression: the stepped generator reproduces the fixtures exactly", () => {
  const expected = JSON.parse(readFileSync(FIXTURE, "utf8"));
  const actual = RECIPE_CASES.map((c) => ({ case: c, result: runCaseStepped(c) }));
  assert.deepEqual(JSON.parse(JSON.stringify(actual)), expected);
});
