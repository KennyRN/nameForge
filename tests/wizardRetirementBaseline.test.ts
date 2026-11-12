// Wizard retirement brief §6.1 (M0): placeholder-slot output of the place-name modules, recipe packs
// (including a linked recipe and a settlement names preset) and the biome-driven modules, recorded
// before any change. Run with CAPTURE_WIZARD_BASELINE=1 to record. Never edit the fixture to fit new code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { BIOMES, BRITAIN } from "../src/biomes";
import { COLONIAL_TRADITIONS, colonialContexts, isTraditionAvailable } from "../src/colonialShapes";
import { generatePlaceNames } from "../src/names/engine";
import { applyRecipeTemplate, britishPlaceNamesRecipe, colonialPlaceNamesRecipe, withDefaults, type RecipePartial } from "../src/names/recipe";
import { PLACE_SHAPE_REGIONS } from "../src/placeShapes";
import { generateSettlementNames } from "../src/settlement/names";
import { generateWatersNames } from "../src/waters/engine";
import { generateWildsNames, WILDS_DATA, WILDS_MODULES } from "../src/wilds/engine";

const FIXTURE = "tests/fixtures/wizard-retirement-baseline.json";
const SEEDS = [1, 42, 2024];
const COUNT = 12;
const faith = { faithfulness: 2, strictness: 3 };

type Snapshot = Record<string, string[] | string>;

/** Runs one case; a thrown error (no eligible names, say) is itself recorded. */
function record(out: Snapshot, key: string, run: () => string[]) {
  try {
    out[key] = run();
  } catch (error) {
    out[key] = `error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

const texts = (r: { names: { text: string }[] }) => r.names.map((n) => n.text);

export function buildSnapshot(): Snapshot {
  const out: Snapshot = {};
  const biomeIds = [undefined, ...BIOMES.map((b) => b.id)];

  // Native British place names.
  for (const seed of SEEDS) {
    const base = { slots: {}, count: COUNT, seed, ...faith };
    for (const region of [undefined, "NTH", ...PLACE_SHAPE_REGIONS.slice(0, 3).map((r) => r.code)]) {
      record(out, `british region ${region ?? "all"} ${seed}`, () => texts(generatePlaceNames({ ...base, recipe: britishPlaceNamesRecipe(region) })));
    }
    for (const biome of biomeIds) {
      for (const terrain of ["any", "coast", "hills"]) {
        record(out, `british biome ${biome ?? "default"} ${terrain} ${seed}`, () => texts(generatePlaceNames({ ...base, recipe: britishPlaceNamesRecipe(undefined, biome, terrain) })));
      }
    }
    void BRITAIN;
    // Exploration (part 2 / new-land) and expansion (part 2a / established).
    for (const [part, code] of [["new-land", "2"], ["established", "2a"]] as const) {
      const name = part === "new-land" ? "exploration" : "expansion";
      for (const tradition of COLONIAL_TRADITIONS.filter((t) => isTraditionAvailable(t.id, code))) {
        for (const context of [undefined, ...colonialContexts(code).map((c) => c.id)]) {
          record(out, `${name} ${tradition.id} ${context ?? "default"} ${seed}`, () =>
            texts(generatePlaceNames({ ...base, recipe: colonialPlaceNamesRecipe(part, tradition.id === "general" ? undefined : tradition.id, context) })),
          );
        }
      }
      for (const biome of biomeIds) {
        record(out, `${name} biome ${biome ?? "default"} ${seed}`, () => texts(generatePlaceNames({ ...base, recipe: colonialPlaceNamesRecipe(part, undefined, undefined, biome) })));
      }
    }

    // Settlement names: British, new lands and settled lands.
    const settle = { count: COUNT, seed, ...faith };
    for (const size of ["any", "hamlet", "city"] as const) {
      record(out, `settlement british ${size} ${seed}`, () => texts(generateSettlementNames({ ...settle, setting: "native", culture: "britain", size })));
      record(out, `settlement british NTH ${size} ${seed}`, () => texts(generateSettlementNames({ ...settle, setting: "native", culture: "britain", region: "NTH", size })));
      for (const setting of ["new-lands", "settled-lands"] as const) {
        record(out, `settlement ${setting} ${size} ${seed}`, () => texts(generateSettlementNames({ ...settle, setting, size })));
        record(out, `settlement ${setting} norse-ish ${size} ${seed}`, () => texts(generateSettlementNames({ ...settle, setting, size, tradition: COLONIAL_TRADITIONS[1].id })));
      }
    }

    // Recipe packs: a plain colonial recipe, a linked recipe and a settlement names preset.
    const slots = { slots: {}, count: COUNT, seed, ...faith };
    const template: RecipePartial = { template: true, shape: { part: "organic", region: "NTH" }, register: "traditional" };
    const linked = applyRecipeTemplate({ templateOf: "Template", shape: { feature: "settlement" } }, template, "Linked").recipe;
    record(out, `recipe linked ${seed}`, () => texts(generatePlaceNames({ ...slots, recipe: withDefaults(linked) })));
    const preset = britishPlaceNamesRecipe("NTH");
    preset.shape.settlement = "village";
    record(out, `recipe settlement preset british ${seed}`, () => texts(generatePlaceNames({ ...slots, recipe: preset })));
    const colonialPreset = colonialPlaceNamesRecipe("established", undefined, undefined);
    colonialPreset.shape.settlement = "town";
    record(out, `recipe settlement preset settled ${seed}`, () => texts(generatePlaceNames({ ...slots, recipe: colonialPreset })));

    // Seas and coasts and wild lands at each built-in biome.
    for (const module of ["seasLakes", "coastsIslands", "seaCharts"] as const) {
      for (const biome of biomeIds) {
        record(out, `waters ${module} ${biome ?? "default"} ${seed}`, () => texts(generateWatersNames({ module, culture: "general", where: "new", biome, count: COUNT, seed })));
      }
    }
    for (const module of WILDS_MODULES) {
      for (const biome of [undefined, ...WILDS_DATA.modules[module].biomes]) {
        record(out, `wilds ${module} ${biome ?? "default"} ${seed}`, () => texts(generateWildsNames({ module, culture: "general", where: "new", biome, count: COUNT, seed })));
      }
    }
  }
  return out;
}

if (process.env.CAPTURE_WIZARD_BASELINE) {
  writeFileSync(FIXTURE, JSON.stringify(buildSnapshot(), null, 1));
}

test("wizard retirement baseline: place names, recipes, waters and wilds are unchanged", () => {
  const expected = JSON.parse(readFileSync(FIXTURE, "utf8")) as Snapshot;
  const actual = buildSnapshot();
  assert.ok(Object.keys(expected).length > 800, "fixture covers many states");
  assert.deepEqual(Object.keys(actual), Object.keys(expected));
  for (const key of Object.keys(expected)) assert.deepEqual(actual[key], expected[key], key);
});
