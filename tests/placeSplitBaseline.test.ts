// Place modules split brief §10.1 (M0): recorded before anything changes, seeds 1, 42 and 2024, 12 names
// each. Run with CAPTURE_PLACE_SPLIT_BASELINE=1 to record. Never edit the fixture to fit new code.
//
// Three parts, kept as separate top-level keys of tests/fixtures/place-split-baseline.json:
//   presets      FROZEN. The retired modules' presets (native place names, exploration, expansion) run
//                through the real preset helpers: save → parse → state → the module's own run.
//   settlement   FROZEN. Settlement names in all three settings and the settlement kit.
//   wildsWaters  The six wild lands and three seas and coasts modules at where home and new. This is
//                the "before" for §8: M7 replaces this part only, and its commit lists the changed states.
//
// Retired-module recipe packs are covered by tests/fixtures/recipe-regression.json (recipeRegression
// test), which must keep matching.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { TFile } from "obsidian";
import { findBiome } from "../src/biomes";
import { createNamesFileContent } from "../src/nameParser";
import { COLONIAL_TRADITIONS, colonialContexts, isTraditionAvailable, type ColonialPart } from "../src/colonialShapes";
import { kitNoteContent } from "../src/settlement/kitFormat";
import { generateKit } from "../src/settlement/kit";
import { DEFAULT_KIT_STATE } from "../src/settlement/kitSentence";
import { generateSettlementNames } from "../src/settlement/names";
import {
  type BritishPlaceState,
  britishPresetOf,
  type ColonialPlaceState,
  colonialPresetOf,
  colonialPresetState,
  generateBritishPlace,
  generateColonialPlace,
  generateWorldPlace,
  nativePresetState,
  type WorldPlaceState,
  worldPresetOf,
  britishRecipe,
  colonialRecipe,
} from "../src/names/placeRun";
import { chooseNames, chooseSlotSource, freshSlotSources } from "../src/names/slotSentence";
import { modulePresetContent, parseModulePreset } from "../src/presets";
import { PLACE_SHAPE_REGIONS } from "../src/placeShapes";
import { RecipeHost } from "../src/recipeHost";
import { ROUTE_CULTURES } from "../src/routes/engine";
import { generateWatersNames, WATERS_CULTURES, WATERS_DATA, type WatersModule } from "../src/waters/engine";
import { defaultWatersState } from "../src/waters/sentence";
import { generateWildsNames, WILDS_CULTURES, WILDS_DATA, WILDS_MODULES } from "../src/wilds/engine";
import { defaultWildsState } from "../src/wilds/sentence";
import { generateWorldPlaceNames, WORLD_CULTURES } from "../src/world/engine";

const FIXTURE = "tests/fixtures/place-split-baseline.json";
const SEEDS = [1, 42, 2024];
const COUNT = 12;
const faith = { faithfulness: 2, strictness: 3 };

type Snapshot = Record<string, string[] | string>;
interface Baseline {
  presets: Snapshot;
  settlement: Snapshot;
  wildsWaters: Snapshot;
}

const textsOf = (result: unknown): string[] => {
  const r = result as { names?: unknown[]; rows?: unknown[] };
  return ((r.names ?? r.rows ?? []) as (string | { text?: string; name?: string })[]).map((n) => (typeof n === "string" ? n : n.text ?? n.name ?? ""));
};

/** One case per seed; a thrown error (no eligible names, say) is itself recorded. */
function record(out: Snapshot, key: string, run: (seed: number) => string[]) {
  for (const seed of SEEDS) {
    try {
      out[`${key} ${seed}`] = run(seed);
    } catch (error) {
      out[`${key} ${seed}`] = `error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}

const keysOf = (list: readonly { key?: string; id?: string }[]) => list.map((c) => (c.key ?? c.id)!);

// ── Part 1: presets ─────────────────────────────────────────────────────────

const meta = (packName: string, biome = "") => ({ packName, description: "A sentence.", biome });

/** The slot sources a run resolves: a name pack from a fixture note, and tribes and kin groups (which need no notes). */
const PACK = createNamesFileContent("Anglo-Saxon", ["Alfred", "Beowulf", "Cuthbert", "Dunstan", "Edmund", "Godwin", "Harold", "Oswald"], "listPack");

async function slotsFor(part: "organic" | "new-land" | "established", state: BritishPlaceState | ColonialPlaceState, recipe: Parameters<RecipeHost["resolveSlotSources"]>[0]) {
  // A name pack in the folder (fixture note), as the slot sentence's Pack choice names it.
  const file = Object.assign(new TFile("Names/Anglo-Saxon.md"), { content: PACK, basename: "Anglo-Saxon" });
  const app = { vault: { cachedRead: async (f: TFile) => f.content }, metadataCache: { getFirstLinkpathDest: (n: string) => (n === "Anglo-Saxon" ? file : null) } } as never;
  const host = new RecipeHost(app, {}, []);
  return host.resolveSlotSources(recipe, part, state.sources, "Names/");
}

const perSlot = (part: "organic" | "new-land" | "established", picks: Record<string, string>) =>
  Object.entries(picks).reduce((s, [id, choice]) => chooseSlotSource(s, part, id, choice), chooseNames(freshSlotSources(), "perSlot"));

const LAND_PRESETS = [
  { name: "default land", land: { biome: undefined, terrain: "any" } },
  { name: "desert hills", land: { biome: "desert", terrain: "hills" } },
];

async function presetsPart(): Promise<Snapshot> {
  const out: Snapshot = {};
  const run = { faithfulness: 2, strictness: 3 };

  // Native place names, British: all of Britain and every region, at each land.
  for (const { name: landName, land } of LAND_PRESETS) {
    for (const region of [undefined, ...PLACE_SHAPE_REGIONS.map((r) => r.code)]) {
      const state: BritishPlaceState = { region, land, sources: freshSlotSources() };
      const parsed = parseModulePreset(modulePresetContent(britishPresetOf(state, meta("P", land.biome ?? ""))), "P");
      out[`preset nativePlace british ${region ?? "all"} ${landName} problems`] = parsed.problems.join(" | ");
      const back = nativePresetState(parsed.nativePlace!) as { british: BritishPlaceState };
      const biome = back.british.land.biome ? findBiome(back.british.land.biome) : undefined;
      for (const seed of SEEDS) out[`preset nativePlace british ${region ?? "all"} ${landName} ${seed}`] = textsOf(generateBritishPlace(back.british, biome, {}, { count: COUNT, seed, ...run }));
    }
  }
  // British with names chosen per slot (a name pack, and tribes and kin groups).
  {
    const sources = perSlot("organic", { "personal-name": "pack:Anglo-Saxon", "folk-group": "tribal" });
    const state: BritishPlaceState = { region: "NTH", land: { biome: undefined, terrain: "any" }, sources };
    const parsed = parseModulePreset(modulePresetContent(britishPresetOf(state, meta("P"))), "P");
    out["preset nativePlace british NTH perSlot problems"] = parsed.problems.join(" | ");
    const back = (nativePresetState(parsed.nativePlace!) as { british: BritishPlaceState }).british;
    const slots = await slotsFor("organic", back, britishRecipe(back, undefined));
    for (const seed of SEEDS) out[`preset nativePlace british NTH perSlot ${seed}`] = textsOf(generateBritishPlace(back, undefined, slots, { count: COUNT, seed, ...run }));
  }
  // Native place names, world: every culture and each of its eras.
  for (const culture of WORLD_CULTURES) {
    for (const era of culture.eras) {
      for (const { name: landName, land } of LAND_PRESETS) {
        const state: WorldPlaceState = { culture: culture.id, era: era.id, land };
        const parsed = parseModulePreset(modulePresetContent(worldPresetOf(state, era.id, meta("P", land.biome ?? ""))), "P");
        const key = `preset nativePlace world ${culture.id} ${era.id} ${landName}`;
        out[`${key} problems`] = parsed.problems.join(" | ");
        const back = (nativePresetState(parsed.nativePlace!) as { world: WorldPlaceState }).world;
        const biome = back.land.biome ? findBiome(back.land.biome) : undefined;
        for (const seed of SEEDS) {
          try {
            out[`${key} ${seed}`] = textsOf(generateWorldPlace(back, biome, { count: COUNT, seed, ...run }));
          } catch (error) {
            out[`${key} ${seed}`] = `error: ${error instanceof Error ? error.message : String(error)}`;
          }
        }
      }
    }
  }
  // Exploration (part 2) and expansion (part 2a): each tradition, each context, at each land.
  for (const [part, name] of [["2", "exploration"], ["2a", "expansion"]] as [ColonialPart, string][]) {
    for (const tradition of COLONIAL_TRADITIONS.filter((t) => isTraditionAvailable(t.id, part))) {
      for (const context of colonialContexts(part)) {
        for (const { name: landName, land } of LAND_PRESETS) {
          const state: ColonialPlaceState = { tradition: tradition.id === "general" ? undefined : tradition.id, context: context.id, aliens: false, land, sources: freshSlotSources() };
          const parsed = parseModulePreset(modulePresetContent(colonialPresetOf(part, state, context.id, meta("P", land.biome ?? ""))), "P");
          const key = `preset ${name} ${tradition.id} ${context.id} ${landName}`;
          out[`${key} problems`] = parsed.problems.join(" | ");
          const back = colonialPresetState((parsed.exploration ?? parsed.expansion)!);
          const found = back.land.biome ? findBiome(back.land.biome) : undefined;
          for (const seed of SEEDS) {
            try {
              out[`${key} ${seed}`] = textsOf(generateColonialPlace(part, back, found, undefined, {}, { count: COUNT, seed, ...run }));
            } catch (error) {
              out[`${key} ${seed}`] = `error: ${error instanceof Error ? error.message : String(error)}`;
            }
          }
        }
      }
    }
  }
  // Exploration and expansion with names chosen per slot (a name pack and tribes and kin groups).
  for (const [part, name, slotPart] of [["2", "exploration", "new-land"], ["2a", "expansion", "established"]] as [ColonialPart, string, "new-land" | "established"][]) {
    const state: ColonialPlaceState = { tradition: "spanish", context: undefined, aliens: false, land: { biome: undefined, terrain: "any" }, sources: perSlot(slotPart, slotPart === "new-land" ? { "personal-name": "pack:Anglo-Saxon", "native-people-or-tribe": "tribal" } : { "explorer-or-founder": "pack:Anglo-Saxon", "native-people-or-tribe": "tribal" }) };
    const contextId = colonialContexts(part)[0].id;
    const parsed = parseModulePreset(modulePresetContent(colonialPresetOf(part, { ...state, context: contextId }, contextId, meta("P"))), "P");
    out[`preset ${name} spanish perSlot problems`] = parsed.problems.join(" | ");
    const back = colonialPresetState((parsed.exploration ?? parsed.expansion)!);
    const slots = await slotsFor(slotPart, back, colonialRecipe(part, back, undefined, undefined));
    for (const seed of SEEDS) {
      try {
        out[`preset ${name} spanish perSlot ${seed}`] = textsOf(generateColonialPlace(part, back, undefined, undefined, slots, { count: COUNT, seed, ...run }));
      } catch (error) {
        out[`preset ${name} spanish perSlot ${seed}`] = `error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
  }
  // The world engine directly, as a preset-less run, for the retired native module's default state.
  record(out, "native world engine default anglo-saxon", (seed) => textsOf(generateWorldPlaceNames({ culture: "anglo-saxon", count: COUNT, seed, ...faith })));
  return out;
}

// ── Part 2: settlement names and the kit ────────────────────────────────────

function settlementPart(): Snapshot {
  const out: Snapshot = {};
  // The native setting: British and every world culture at two sizes.
  for (const culture of ["britain", ...WORLD_CULTURES.map((c) => c.id)]) {
    for (const size of ["any", "city"] as const) {
      record(out, `settlementNames native ${culture} ${size}`, (seed) => textsOf(generateSettlementNames({ setting: "native", culture, size, count: COUNT, seed, ...faith })));
    }
  }
  // New lands (part 2) and settled lands (part 2a): every available tradition at two sizes.
  for (const [setting, code] of [["new-lands", "2"], ["settled-lands", "2a"]] as const) {
    for (const tradition of COLONIAL_TRADITIONS.filter((t) => isTraditionAvailable(t.id, code))) {
      for (const size of ["any", "village", "city"] as const) {
        record(out, `settlementNames ${setting} ${tradition.id} ${size}`, (seed) =>
          textsOf(generateSettlementNames({ setting, tradition: tradition.id === "general" ? undefined : tradition.id, size, count: COUNT, seed, ...faith })),
        );
      }
    }
  }
  // The settlement kit at default, at MO city, and with the steam age and a town.
  for (const culture of keysOf(ROUTE_CULTURES)) {
    record(out, `settlementKit ${culture} default`, (seed) => kitNoteContent(generateKit({ ...DEFAULT_KIT_STATE, culture, seed })).split("\n"));
    record(out, `settlementKit ${culture} MO city`, (seed) => kitNoteContent(generateKit({ ...DEFAULT_KIT_STATE, culture, era: "MO", size: "city", seed })).split("\n"));
    record(out, `settlementKit ${culture} ST town`, (seed) => kitNoteContent(generateKit({ ...DEFAULT_KIT_STATE, culture, era: "ST", size: "town", seed })).split("\n"));
  }
  return out;
}

// ── Part 3: wild lands and seas and coasts at home and new ──────────────────

function wildsWatersPart(): Snapshot {
  const out: Snapshot = {};
  const wildsKinds = (module: (typeof WILDS_MODULES)[number]) => WILDS_DATA.modules[module].kinds.map((k) => k.key);
  const watersKinds = (module: WatersModule) => WATERS_DATA.modules[module].kinds.map((k) => k.key);
  for (const where of ["home", "new"] as const) {
    for (const module of WILDS_MODULES) {
      const base = defaultWildsState(module);
      for (const culture of keysOf(WILDS_CULTURES)) {
        record(out, `${module} ${where} ${culture} default`, (seed) => textsOf(generateWildsNames({ ...base, module, culture, where, count: COUNT, seed })));
      }
      // Each kind, for the module's default culture: the "before" for the sources of §8.1.
      for (const kind of wildsKinds(module)) {
        record(out, `${module} ${where} kind ${kind}`, (seed) => textsOf(generateWildsNames({ ...base, module, kind, where, count: COUNT, seed })));
      }
      if (where === "new") {
        record(out, `${module} ${where} biome temperate`, (seed) => textsOf(generateWildsNames({ ...base, module, where, biome: "temperate", count: COUNT, seed })));
      }
    }
    for (const module of ["seasLakes", "coastsIslands", "seaCharts"] as WatersModule[]) {
      const base = defaultWatersState(module);
      for (const culture of keysOf(WATERS_CULTURES)) {
        record(out, `${module} ${where} ${culture} default`, (seed) => textsOf(generateWatersNames({ ...base, module, culture, where, count: COUNT, seed })));
      }
      for (const kind of watersKinds(module)) {
        record(out, `${module} ${where} kind ${kind}`, (seed) => textsOf(generateWatersNames({ ...base, module, kind, where, count: COUNT, seed })));
      }
      if (where === "new") {
        record(out, `${module} ${where} biome temperate`, (seed) => textsOf(generateWatersNames({ ...base, module, where, biome: "temperate", count: COUNT, seed })));
      }
    }
  }
  return out;
}

export async function buildBaseline(): Promise<Baseline> {
  return { presets: await presetsPart(), settlement: settlementPart(), wildsWaters: wildsWatersPart() };
}

if (process.env.CAPTURE_PLACE_SPLIT_BASELINE) {
  writeFileSync(FIXTURE, JSON.stringify(await buildBaseline()));
}

const expected = () => JSON.parse(readFileSync(FIXTURE, "utf8")) as Baseline;

test("place split baseline: the retired modules' presets run exactly as recorded (frozen)", async () => {
  const want = expected().presets;
  const got = (await buildBaseline()).presets;
  assert.ok(Object.keys(want).length > 1000, "fixture covers many presets");
  assert.deepEqual(Object.keys(got), Object.keys(want));
  for (const key of Object.keys(want)) assert.deepEqual(got[key], want[key], key);
});

test("place split baseline: settlement names and the kit run exactly as recorded (frozen)", () => {
  const want = expected().settlement;
  const got = settlementPart();
  assert.ok(Object.keys(want).length > 500, "fixture covers many states");
  assert.deepEqual(Object.keys(got), Object.keys(want));
  for (const key of Object.keys(want)) assert.deepEqual(got[key], want[key], key);
});

test("place split baseline: wild lands and seas and coasts at home and new match the 'before' (replaced at M7)", () => {
  const want = expected().wildsWaters;
  const got = wildsWatersPart();
  assert.ok(Object.keys(want).length > 500, "fixture covers many states");
  assert.deepEqual(Object.keys(got), Object.keys(want));
  for (const key of Object.keys(want)) assert.deepEqual(got[key], want[key], key);
});

test("place split baseline: the three parts cover the retired modules, settlement, and nine place modules", () => {
  const b = expected();
  const names = (s: Snapshot, i: number) => new Set(Object.keys(s).map((k) => k.split(" ")[i]));
  const presets = names(b.presets, 1);
  for (const m of ["nativePlace", "exploration", "expansion"]) assert.ok(presets.has(m), `${m} presets`);
  assert.ok(names(b.settlement, 0).has("settlementNames") && names(b.settlement, 0).has("settlementKit"));
  const modules = names(b.wildsWaters, 0);
  for (const m of [...WILDS_MODULES, "seasLakes", "coastsIslands", "seaCharts"]) assert.ok(modules.has(m), `${m} in wildsWaters`);
});
