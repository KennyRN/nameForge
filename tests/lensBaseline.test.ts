// Shared lens and coverage brief §7.1 (M0): every non-Markov module, each culture it offers, at its
// default settings and at one non-default era or setting, seeds 1, 42 and 2024, 12 names each, recorded
// before any change. Run with CAPTURE_LENS_BASELINE=1 to record. Never edit the fixture to fit new code.
//
// Each module is driven through its engine with the options the modal passes today: the module's
// default sentence state spread onto the engine's options, with the module's own culture roster. The
// built-in safeguard lists and vocabulary are in use (no notes), as with an empty names folder.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { COLONIAL_TRADITIONS, colonialContexts, isTraditionAvailable } from "../src/colonialShapes";
import { colonialPlaceNamesRecipe, britishPlaceNamesRecipe } from "../src/names/recipe";
import { generatePlaceNames } from "../src/names/engine";
import { PLACE_SHAPE_REGIONS } from "../src/placeShapes";
import { generateRiverNames } from "../src/rivers/engine";
import { generateWorldPlaceNames, WORLD_CULTURES } from "../src/world/engine";
import { generateSettlementNames } from "../src/settlement/names";
import { generateRouteNames, ROUTE_CULTURES } from "../src/routes/engine";
import { generateDeityNames, DEITY_CULTURES } from "../src/deities/engine";
import { DEFAULT_DEITY_STATE, DEFAULT_SACRED_PLACE_STATE, DEITIES_MODULE_KINDS, sacredPlaceAsDeityState } from "../src/deities/sentence";
import { generateStreetNames } from "../src/streets/engine";
import { generateInnNames } from "../src/inns/engine";
import { generateBuildingNames } from "../src/buildings/engine";
import { generateMonumentNames } from "../src/monuments/engine";
import { generateKit } from "../src/settlement/kit";
import { kitNoteContent } from "../src/settlement/kitFormat";
import { generateWatersNames, WATERS_CULTURES, type WatersModule } from "../src/waters/engine";
import { generateWildsNames, WILDS_CULTURES, WILDS_MODULES } from "../src/wilds/engine";
import { generateGroupNames, GROUP_DATA } from "../src/groups/engine";
import { generateRealmNames, REALM_CULTURES } from "../src/realms/engine";
import { generatePeopleRows, PEOPLE_CULTURES } from "../src/peoples/engine";
import { generateTribalNames, TRIBAL_TRADITIONS } from "../src/tribes/engine";
import { BYNAME_CULTURES, generateBynames, type BynameModule } from "../src/bynames/engine";
import { generateVesselNames, VESSEL_CULTURES, AIR_LAND, VESSEL_DATA, isAirLand, type VesselModule } from "../src/vessels/engine";
import { generateThingNames, THING_CULTURES, type ThingModule } from "../src/things/engine";
import { generateEventNames } from "../src/events/engine";
import { generateMoneyNames, MONEY_CULTURES } from "../src/money/engine";
import { generateTimeSkyNames, TIME_CULTURES } from "../src/timesky/engine";
import { DEFAULT_ROUTE_STATE } from "../src/routes/sentence";
import { DEFAULT_STREET_STATE } from "../src/streets/sentence";
import { DEFAULT_INN_STATE, innFormFor } from "../src/inns/sentence";
import { DEFAULT_BUILDING_STATE } from "../src/buildings/sentence";
import { DEFAULT_MONUMENT_STATE } from "../src/monuments/sentence";
import { DEFAULT_KIT_STATE } from "../src/settlement/kitSentence";
import { defaultWatersState } from "../src/waters/sentence";
import { defaultWildsState } from "../src/wilds/sentence";
import { DEFAULT_GROUP_STATE } from "../src/groups/sentence";
import { DEFAULT_REALM_STATE } from "../src/realms/sentence";
import { DEFAULT_PEOPLE_STATE } from "../src/peoples/sentence";
import { DEFAULT_BYNAME_STATE } from "../src/bynames/sentence";
import { defaultVesselState } from "../src/vessels/sentence";
import { DEFAULT_THING_STATE } from "../src/things/sentence";
import { DEFAULT_EVENT_STATE } from "../src/events/sentence";
import { DEFAULT_MONEY_STATE } from "../src/money/sentence";
import { DEFAULT_CALENDAR_STATE, DEFAULT_SKY_STATE } from "../src/timesky/calendarSentence";
import { GROUP_NAME_SECTIONS } from "../src/sections";
import { familyForSection } from "../src/groups/engine";

const FIXTURE = "tests/fixtures/lens-baseline.json";
const SEEDS = [1, 42, 2024];
const COUNT = 12;
const faith = { faithfulness: 2, strictness: 3 };

type Snapshot = Record<string, string[] | string>;

/** Pulls the finished strings out of any engine's batch. */
function textsOf(result: unknown): string[] {
  const r = result as { names?: unknown[]; rows?: unknown[] };
  const list = (r.names ?? r.rows ?? []) as (string | { text?: string; name?: string })[];
  return list.map((n) => (typeof n === "string" ? n : n.text ?? n.name ?? ""));
}

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
const PEOPLE_INPUT = ["Aldwin", "Brenna of the Vale", "Cassius", "Dagmar", "Eskil Thorne", "Fenwick", "Gaela", "Hrolf", "Isolde", "Jorund", "Kestrel", "Lysander"];

export function buildSnapshot(): Snapshot {
  const out: Snapshot = {};

  // ── Place names ──────────────────────────────────────────────────────────
  // Native place names: British (all of Britain, and one region), British river names, and every world
  // culture at its first era and at its second.
  for (const region of [undefined, "NTH", ...PLACE_SHAPE_REGIONS.slice(0, 2).map((r) => r.code)]) {
    record(out, `placeShapes british ${region ?? "all"}`, (seed) => textsOf(generatePlaceNames({ recipe: britishPlaceNamesRecipe(region), slots: {}, count: COUNT, seed, ...faith })));
  }
  for (const setting of ["british", "new-land", "established"] as const) {
    record(out, `riverNames ${setting} default`, (seed) => textsOf(generateRiverNames({ setting, count: COUNT, seed, ...faith })));
  }
  record(out, "riverNames british NTH", (seed) => textsOf(generateRiverNames({ setting: "british", region: "NTH", count: COUNT, seed, ...faith })));
  for (const culture of WORLD_CULTURES) {
    culture.eras.forEach((era, i) => {
      if (i > 1 && i < culture.eras.length - 1) return;
      record(out, `placeShapes world ${culture.id} ${era.id}`, (seed) => textsOf(generateWorldPlaceNames({ culture: culture.id, era: era.id, count: COUNT, seed, ...faith })));
    });
  }
  // Exploration (part 2, new-land) and expansion (part 2a, established): every tradition, default context and the first named one.
  for (const [part, code, name] of [["new-land", "2", "explorationPlaceShapes"], ["established", "2a", "empireExpansionPlaceShapes"]] as const) {
    for (const tradition of COLONIAL_TRADITIONS.filter((t) => isTraditionAvailable(t.id, code))) {
      const contexts = colonialContexts(code).map((c) => c.id);
      for (const context of [undefined, contexts[contexts.length - 1]]) {
        record(out, `${name} ${tradition.id} ${context ?? "default"}`, (seed) =>
          textsOf(generatePlaceNames({ recipe: colonialPlaceNamesRecipe(part, tradition.id === "general" ? undefined : tradition.id, context), slots: {}, count: COUNT, seed, ...faith })),
        );
      }
    }
  }
  // Route names.
  for (const culture of keysOf(ROUTE_CULTURES)) {
    record(out, `routeNames ${culture} default`, (seed) => textsOf(generateRouteNames({ ...DEFAULT_ROUTE_STATE, culture, count: COUNT, seed })));
    record(out, `routeNames ${culture} MO series`, (seed) => textsOf(generateRouteNames({ ...DEFAULT_ROUTE_STATE, culture, era: "MO", series: true, count: COUNT, seed })));
  }
  // Sacred places (the deities engine, kind place).
  for (const culture of keysOf(DEITY_CULTURES)) {
    const base = sacredPlaceAsDeityState({ ...DEFAULT_SACRED_PLACE_STATE, culture });
    record(out, `sacredPlaces ${culture} default`, (seed) => textsOf(generateDeityNames({ ...base, count: COUNT, seed })));
    record(out, `sacredPlaces ${culture} AN`, (seed) => textsOf(generateDeityNames({ ...base, era: "AN", count: COUNT, seed })));
  }

  // ── Urban ────────────────────────────────────────────────────────────────
  // Settlement names: British and every world culture at two sizes; new and settled lands by tradition.
  for (const culture of ["britain", ...WORLD_CULTURES.map((c) => c.id)]) {
    for (const size of ["any", "city"] as const) {
      record(out, `settlementNames ${culture} ${size}`, (seed) => textsOf(generateSettlementNames({ setting: "native", culture, size, count: COUNT, seed, ...faith })));
    }
  }
  for (const [setting, code] of [["new-lands", "2"], ["settled-lands", "2a"]] as const) {
    for (const tradition of COLONIAL_TRADITIONS.filter((t) => isTraditionAvailable(t.id, code))) {
      for (const size of ["any", "village"] as const) {
        record(out, `settlementNames ${setting} ${tradition.id} ${size}`, (seed) =>
          textsOf(generateSettlementNames({ setting, tradition: tradition.id === "general" ? undefined : tradition.id, size, count: COUNT, seed, ...faith })),
        );
      }
    }
  }
  const settlementCultures = keysOf(ROUTE_CULTURES);
  for (const culture of settlementCultures) {
    const form = (state: typeof DEFAULT_INN_STATE) => innFormFor(state);
    record(out, `streetNames ${culture} default`, (seed) => textsOf(generateStreetNames({ ...DEFAULT_STREET_STATE, culture, count: COUNT, seed })));
    record(out, `streetNames ${culture} MO city`, (seed) => textsOf(generateStreetNames({ ...DEFAULT_STREET_STATE, culture, era: "MO", size: "city", count: COUNT, seed })));
    const inn = { ...DEFAULT_INN_STATE, culture };
    record(out, `innNames ${culture} default`, (seed) => textsOf(generateInnNames({ ...inn, form: form(inn), count: COUNT, seed })));
    const innMo = { ...inn, era: "MO" as const };
    record(out, `innNames ${culture} MO`, (seed) => textsOf(generateInnNames({ ...innMo, form: form(innMo), count: COUNT, seed })));
    record(out, `buildingNames ${culture} default`, (seed) => textsOf(generateBuildingNames({ ...DEFAULT_BUILDING_STATE, culture, count: COUNT, seed })));
    record(out, `buildingNames ${culture} MO`, (seed) => textsOf(generateBuildingNames({ ...DEFAULT_BUILDING_STATE, culture, era: "MO", count: COUNT, seed })));
    record(out, `monumentNames ${culture} default`, (seed) => textsOf(generateMonumentNames({ ...DEFAULT_MONUMENT_STATE, culture, count: COUNT, seed })));
    record(out, `monumentNames ${culture} MO`, (seed) => textsOf(generateMonumentNames({ ...DEFAULT_MONUMENT_STATE, culture, era: "MO", count: COUNT, seed })));
    record(out, `settlementKit ${culture} default`, (seed) => kitNoteContent(generateKit({ ...DEFAULT_KIT_STATE, culture, seed })).split("\n"));
    record(out, `settlementKit ${culture} MO city`, (seed) => kitNoteContent(generateKit({ ...DEFAULT_KIT_STATE, culture, era: "MO", size: "city", seed })).split("\n"));
  }

  // ── Seas and coasts, wild lands ──────────────────────────────────────────
  for (const module of ["seasLakes", "coastsIslands", "seaCharts"] as WatersModule[]) {
    for (const culture of keysOf(WATERS_CULTURES)) {
      const base = defaultWatersState(module);
      record(out, `${module} ${culture} default`, (seed) => textsOf(generateWatersNames({ ...base, module, culture, count: COUNT, seed })));
      record(out, `${module} ${culture} MO`, (seed) => textsOf(generateWatersNames({ ...base, module, culture, era: "MO", count: COUNT, seed })));
    }
  }
  const hyper = defaultWatersState("hyperspaceCharts");
  record(out, "hyperspaceCharts default", (seed) => textsOf(generateWatersNames({ ...hyper, module: "hyperspaceCharts", count: COUNT, seed })));
  record(out, "hyperspaceCharts series", (seed) => textsOf(generateWatersNames({ ...hyper, module: "hyperspaceCharts", series: true, count: COUNT, seed })));
  for (const module of WILDS_MODULES) {
    for (const culture of keysOf(WILDS_CULTURES)) {
      const base = defaultWildsState(module);
      record(out, `${module} ${culture} default`, (seed) => textsOf(generateWildsNames({ ...base, module, culture, count: COUNT, seed })));
      record(out, `${module} ${culture} MO`, (seed) => textsOf(generateWildsNames({ ...base, module, culture, era: "MO", count: COUNT, seed })));
    }
  }

  // ── Group names ──────────────────────────────────────────────────────────
  const traditions = keysOf(TRIBAL_TRADITIONS);
  for (const section of GROUP_NAME_SECTIONS) {
    const family = familyForSection(section);
    if (!family) continue;
    for (const tradition of traditions) {
      const base = { ...DEFAULT_GROUP_STATE, family: family.key, tradition };
      record(out, `${section} ${tradition} fantasy`, (seed) => textsOf(generateGroupNames({ ...base, count: COUNT, seed })));
      // Supernatural courts aren't offered in science fiction or the real modern world, so theirs is the modern world with the fantastic on.
      const genre = section === "supernaturalCourts" ? "modern" : "scifi";
      record(out, `${section} ${tradition} ${genre}`, (seed) => textsOf(generateGroupNames({ ...base, genre, fantastic: section === "supernaturalCourts", count: COUNT, seed })));
    }
  }
  void GROUP_DATA;
  for (const culture of keysOf(REALM_CULTURES)) {
    record(out, `realms ${culture} medieval`, (seed) => textsOf(generateRealmNames({ ...DEFAULT_REALM_STATE, culture, count: COUNT, seed })));
    record(out, `realms ${culture} modern`, (seed) => textsOf(generateRealmNames({ ...DEFAULT_REALM_STATE, culture, era: "modern", count: COUNT, seed })));
  }
  for (const culture of keysOf(PEOPLE_CULTURES)) {
    const base = { names: PEOPLE_INPUT, giving: DEFAULT_PEOPLE_STATE.giving, detail: DEFAULT_PEOPLE_STATE.detail, tone: DEFAULT_PEOPLE_STATE.tone };
    record(out, `peoplesTongues ${culture} MD`, (seed) => textsOf(generatePeopleRows({ ...base, culture, era: "MD", seed })));
    record(out, `peoplesTongues ${culture} AN`, (seed) => textsOf(generatePeopleRows({ ...base, culture, era: "AN", seed })));
  }
  for (const tradition of traditions) {
    const base = { tradition, register: "plain" as const, hostile: false };
    record(out, `tribalNames ${tradition} default`, (seed) => textsOf(generateTribalNames({ ...base, count: COUNT, seed })));
    record(out, `tribalNames ${tradition} legendary hostile`, (seed) => textsOf(generateTribalNames({ ...base, register: "legendary", hostile: true, count: COUNT, seed })));
  }
  for (const culture of keysOf(DEITY_CULTURES)) {
    const base = { ...DEFAULT_DEITY_STATE, culture, kinds: DEITIES_MODULE_KINDS };
    record(out, `deityNames ${culture} default`, (seed) => textsOf(generateDeityNames({ ...base, count: COUNT, seed })));
    record(out, `deityNames ${culture} AN`, (seed) => textsOf(generateDeityNames({ ...base, era: "AN", count: COUNT, seed })));
  }

  // ── Bynames, vehicles, named things ──────────────────────────────────────
  for (const module of ["epithets", "familyNames", "titles"] as BynameModule[]) {
    for (const culture of keysOf(BYNAME_CULTURES)) {
      record(out, `${module} ${culture} fantasy`, (seed) => textsOf(generateBynames({ ...DEFAULT_BYNAME_STATE, module, culture, count: COUNT, seed })));
      record(out, `${module} ${culture} modern`, (seed) => textsOf(generateBynames({ ...DEFAULT_BYNAME_STATE, module, culture, genre: "modern", count: COUNT, seed })));
    }
  }
  for (const module of ["ships", "spacecraft", "aircraft", "landVehicles"] as VesselModule[]) {
    const techs = (isAirLand(module) ? AIR_LAND.technology[module as "aircraft" | "landVehicles"] : VESSEL_DATA.technology[module as "ships" | "spacecraft"]).map((t: { code: string }) => t.code);
    const variant = techs[Math.min(2, techs.length - 1)];
    for (const culture of keysOf(VESSEL_CULTURES)) {
      const base = { ...defaultVesselState(module), module, culture };
      record(out, `${module} ${culture} default`, (seed) => textsOf(generateVesselNames({ ...base, count: COUNT, seed })));
      record(out, `${module} ${culture} ${variant}`, (seed) => textsOf(generateVesselNames({ ...base, technology: variant, count: COUNT, seed })));
    }
  }
  for (const module of ["armsNames", "treasureNames", "bookNames"] as const) {
    const key = (module === "armsNames" ? "arms" : module === "treasureNames" ? "treasure" : "book") as string;
    void key;
    const thingModule = ({ armsNames: "arms", treasureNames: "treasure", bookNames: "book" } as Record<string, string>)[module] as ThingModule;
    for (const culture of keysOf(THING_CULTURES)) {
      record(out, `${module} ${culture} MD`, (seed) => textsOf(generateThingNames({ ...DEFAULT_THING_STATE, module: thingModule, culture, count: COUNT, seed })));
      record(out, `${module} ${culture} MO`, (seed) => textsOf(generateThingNames({ ...DEFAULT_THING_STATE, module: thingModule, culture, era: "MO", count: COUNT, seed })));
    }
  }

  // ── Events, money, calendars and sky ─────────────────────────────────────
  for (const culture of keysOf(ROUTE_CULTURES)) {
    record(out, `eventNames ${culture} MD`, (seed) => textsOf(generateEventNames({ ...DEFAULT_EVENT_STATE, culture, count: COUNT, seed })));
    record(out, `eventNames ${culture} MO`, (seed) => textsOf(generateEventNames({ ...DEFAULT_EVENT_STATE, culture, era: "MO", count: COUNT, seed })));
  }
  for (const culture of keysOf(MONEY_CULTURES)) {
    record(out, `moneyNames ${culture} MD`, (seed) => textsOf(generateMoneyNames({ ...DEFAULT_MONEY_STATE, culture, count: COUNT, seed })));
    record(out, `moneyNames ${culture} MO`, (seed) => textsOf(generateMoneyNames({ ...DEFAULT_MONEY_STATE, culture, era: "MO", count: COUNT, seed })));
  }
  for (const culture of keysOf(TIME_CULTURES)) {
    record(out, `calendarNames ${culture} MD`, (seed) => textsOf(generateTimeSkyNames({ ...DEFAULT_CALENDAR_STATE, culture, count: COUNT, seed })));
    record(out, `calendarNames ${culture} AN`, (seed) => textsOf(generateTimeSkyNames({ ...DEFAULT_CALENDAR_STATE, culture, era: "AN", count: COUNT, seed })));
    record(out, `skyNames ${culture} MD`, (seed) => textsOf(generateTimeSkyNames({ ...DEFAULT_SKY_STATE, culture, count: COUNT, seed })));
    record(out, `skyNames ${culture} AN`, (seed) => textsOf(generateTimeSkyNames({ ...DEFAULT_SKY_STATE, culture, era: "AN", count: COUNT, seed })));
  }
  return out;
}

if (process.env.CAPTURE_LENS_BASELINE) {
  writeFileSync(FIXTURE, JSON.stringify(buildSnapshot()));
}

test("lens baseline: every module, culture and seed matches what was recorded before the lens", () => {
  const expected = JSON.parse(readFileSync(FIXTURE, "utf8")) as Snapshot;
  const actual = buildSnapshot();
  assert.ok(Object.keys(expected).length > 5000, "fixture covers many states");
  assert.deepEqual(Object.keys(actual), Object.keys(expected));
  for (const key of Object.keys(expected)) assert.deepEqual(actual[key], expected[key], key);
});

test("lens baseline: the fixture covers every non-Markov module", () => {
  const expected = JSON.parse(readFileSync(FIXTURE, "utf8")) as Snapshot;
  const modules = new Set(Object.keys(expected).map((k) => k.split(" ")[0]));
  for (const module of [
    "placeShapes", "explorationPlaceShapes", "empireExpansionPlaceShapes", "routeNames", "sacredPlaces", "settlementNames", "streetNames", "innNames", "buildingNames", "monumentNames", "settlementKit",
    "seasLakes", "coastsIslands", "seaCharts", "hyperspaceCharts", "mountainNames", "forestNames", "desertNames", "moorNames", "wetlandNames", "grasslandNames",
    "powerFactions", "realms", "peoplesTongues", "tribalNames", "tradeGuilds", "martialOrders", "adventureCompanies", "mysticOrders", "underworldGroups", "supernaturalCourts", "deityNames",
    "epithets", "familyNames", "titles", "ships", "spacecraft", "aircraft", "landVehicles", "armsNames", "treasureNames", "bookNames", "eventNames", "moneyNames", "calendarNames", "skyNames", "riverNames",
  ]) {
    assert.ok(modules.has(module), `${module} is in the fixture`);
  }
});
