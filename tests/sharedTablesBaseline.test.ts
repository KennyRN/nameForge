// Shared tables brief §9.1 (M0): the names every module with a people link gives from saved presets with
// `people: placeholders` and `people: invented`, recorded before anything changes. Run with
// CAPTURE_SHARED_TABLES_BASELINE=1 to record.
//
// For every module with a people link: the three notes the sentence baseline saves (bare; saved before the
// lens with Celtic, Wales and the fantastic on; and at other settings), each written with `people: placeholders`
// and with `people: invented`, read by the real parser and the module's preset-to-state mapping (the modal's
// `…PresetState`, mirrored), then run through the engine at seeds 1, 42 and 2024, 12 names (the kit: its
// note, line by line). Brief 4 §1.1 rule 1: a saved `placeholders` or `invented` preset gives the same names
// after as before. **This fixture changes only at M7 and M8, for the lexicon and the creatures**, and each
// commit that changes it lists every changed state.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { BUILT_IN_BIOMES } from "../src/biomes";
import { DEFAULT_ROUTE_STATE, chooseRoute, routeSentence, routeSentenceText } from "../src/routes/sentence";
import { DEFAULT_STREET_STATE, chooseStreet, streetSentence, streetSentenceText } from "../src/streets/sentence";
import { DEFAULT_INN_STATE, chooseInn, innFormFor, innSentence, innSentenceText } from "../src/inns/sentence";
import { DEFAULT_BUILDING_STATE, buildingSentence, buildingSentenceText, chooseBuilding } from "../src/buildings/sentence";
import { DEFAULT_MONUMENT_STATE, chooseMonument, monumentSentence, monumentSentenceText } from "../src/monuments/sentence";
import { DEFAULT_KIT_STATE, chooseKit, kitSentence, kitSentenceText } from "../src/settlement/kitSentence";
import { DEFAULT_EVENT_STATE, chooseEvent, eventSentence, eventSentenceText } from "../src/events/sentence";
import { DEFAULT_MONEY_STATE, moneySentence, moneySentenceText, normaliseMoney } from "../src/money/sentence";
import { DEFAULT_THING_STATE, normaliseThings, thingSentence, thingSentenceText } from "../src/things/sentence";
import { DEFAULT_DEITY_STATE, DEFAULT_SACRED_PLACE_STATE, chooseDeity, chooseSacredPlace, deitySentence, deitySentenceText, sacredPlaceAsDeityState, sacredPlaceSentence } from "../src/deities/sentence";
import { DEFAULT_CALENDAR_STATE, DEFAULT_SKY_STATE, normaliseTime, timeSentence, timeSentenceText } from "../src/timesky/calendarSentence";
import { DEFAULT_PEOPLE_STATE, normalisePeoples, peopleSentence, peopleSentenceText } from "../src/peoples/sentence";
import { defaultWildsState, chooseWilds, wildsSentence, wildsSentenceText } from "../src/wilds/sentence";
import { chooseWaters, defaultWatersState, watersSentence, watersSentenceText } from "../src/waters/sentence";
import { DEFAULT_GROUP_STATE, groupPresetState, groupSentence, groupSentenceText } from "../src/groups/sentence";
import { DEFAULT_BYNAME_STATE, bynamePresetState, bynameSentence, bynameSentenceText } from "../src/bynames/sentence";
import { defaultVesselState, vesselSentence, vesselSentenceText } from "../src/vessels/sentence";
import { DEFAULT_REALM_STATE, realmSentence, realmSentenceText } from "../src/realms/sentence";
import { familyForSection } from "../src/groups/engine";
import { GROUP_NAME_SECTIONS } from "../src/sections";
import { PLACE_MODULES, WILDS_MODULES } from "../src/wilds/engine";
import { THING_MODULES } from "../src/things/engine";
import { parseModulePreset } from "../src/presets";

import { generateRouteNames } from "../src/routes/engine";
import { generateStreetNames } from "../src/streets/engine";
import { generateInnNames } from "../src/inns/engine";
import { generateBuildingNames } from "../src/buildings/engine";
import { generateMonumentNames } from "../src/monuments/engine";
import { generateKit } from "../src/settlement/kit";
import { kitNoteContent } from "../src/settlement/kitFormat";
import { generateEventNames } from "../src/events/engine";
import { generateMoneyNames } from "../src/money/engine";
import { generateThingNames } from "../src/things/engine";
import { generateTimeSkyNames } from "../src/timesky/engine";
import { generateWildsNames } from "../src/wilds/engine";
import { generateWatersNames } from "../src/waters/engine";
import { generateGroupNames } from "../src/groups/engine";
import { generateVesselNames } from "../src/vessels/engine";
import { generateRealmNames } from "../src/realms/engine";

const FIXTURE = "tests/fixtures/shared-tables-baseline.json";
const SEEDS = [1, 42, 2024];
const COUNT = 12;

const limits = { biomes: BUILT_IN_BIOMES.all, findBiome: (id: string | undefined) => BUILT_IN_BIOMES.find(id), spaceBiomes: BUILT_IN_BIOMES.space };

const none = <T>(v: T | "any" | "all" | "homeland") => (v === "any" || v === "all" || v === "homeland" ? undefined : v);

/** The modal's `…PresetState` methods, mirrored line for line. */
const SPECS: Spec[] = [
  {
    key: "routeNames", head: ["module: route-names"], region: true,
    read: (r) => r.route,
    state: (p) => chooseRoute({ culture: p.culture, kind: none(p.routeKind), era: p.era, fantastic: p.fantastic, region: none(p.region), tone: p.tone, people: p.people, series: p.series, scale: p.scale ?? "any", ftl: p.ftl ?? "any" }, "culture", p.culture),
  },
  {
    key: "sacredPlaces", head: ["module: deity-names", "deityKind: place"], region: false,
    read: (r) => r.deity,
    state: (p) => chooseSacredPlace({ culture: p.culture, domain: none(p.domain), era: p.era, fantastic: p.fantastic, tone: p.tone }, "domain", none(p.domain)),
    options: (s) => ({ ...sacredPlaceAsDeityState(s) }),
  },
  {
    key: "deityNames", head: ["module: deity-names"], region: false,
    read: (r) => r.deity,
    state: (p) => chooseDeity({ culture: p.culture, kind: none(p.deityKind), domain: none(p.domain), gender: p.gender, era: p.era, fantastic: p.fantastic, tone: p.tone, names: p.names, ...(p.pack ? { pack: p.pack } : {}), series: p.series }, "domain", none(p.domain)),
  },
  {
    key: "streetNames", head: ["module: street-names"], region: true,
    read: (r) => r.street,
    state: (p) => chooseStreet({ culture: p.culture, kind: none(p.streetKind), function: none(p.function), era: p.era, fantastic: p.fantastic, region: none(p.region), size: p.size, dialect: p.dialect, tone: p.tone, people: p.people, series: p.series }, "function", none(p.function)),
  },
  {
    key: "innNames", head: ["module: inn-names"], region: true,
    read: (r) => r.inn,
    state: (p) => chooseInn({ culture: p.culture, kind: none(p.innKind), era: p.era, fantastic: p.fantastic, region: none(p.region), setting: p.innSetting, form: p.form, tone: p.tone, people: p.people, series: p.series }, "kind", none(p.innKind)),
    options: (s) => ({ form: innFormFor(s) }),
  },
  {
    key: "buildingNames", head: ["module: building-names"], region: true,
    read: (r) => r.building,
    state: (p) => chooseBuilding({ culture: p.culture, kind: none(p.buildingKind), era: p.era, fantastic: p.fantastic, region: none(p.region), setting: p.buildingSetting, tone: p.tone, people: p.people, series: p.series }, "kind", none(p.buildingKind)),
  },
  {
    key: "monumentNames", head: ["module: monument-names"], region: true,
    read: (r) => r.monument,
    state: (p) => chooseMonument({ culture: p.culture, kind: none(p.monumentKind), era: p.era, fantastic: p.fantastic, region: none(p.region), setting: p.monumentSetting, tone: p.tone, people: p.people, nearby: p.nearby, series: p.series }, "kind", none(p.monumentKind)),
  },
  {
    key: "settlementKit", head: ["module: settlement-kit"], region: true,
    read: (r) => r.kit,
    state: (p) => chooseKit({ culture: p.culture, era: p.era, fantastic: p.fantastic, region: none(p.region), size: p.size, position: p.position, tone: p.tone, contents: p.contents, detail: p.detail, people: p.people }, "culture", p.culture),
  },
  {
    key: "eventNames", head: ["module: event-names"],
    read: (r) => r.event,
    state: (p) => chooseEvent({ culture: p.culture, kind: none(p.eventKind), era: p.era, fantastic: p.fantastic, scale: p.scale, tone: p.tone, people: p.people, series: p.series }, "kind", none(p.eventKind)),
  },
  {
    key: "moneyNames", head: ["module: money-names"],
    read: (r) => r.money,
    state: (p) => normaliseMoney({ culture: p.culture, kind: none(p.moneyKind), era: p.era, fantastic: p.fantastic, value: p.value, words: p.words, tone: p.tone, people: p.people, series: p.series }),
  },
  ...THING_MODULES.map((m): Spec => ({
    key: `things ${m.key}`, head: [`module: ${m.key}-names`],
    read: (r) => r.thing,
    state: (p) => {
      const pack = p.owner !== "anyone" && p.owner !== "none";
      return normaliseThings(p.thingModule, { culture: p.culture, kind: none(p.kind), era: p.era, fantastic: p.fantastic, tone: p.tone, people: p.people, owner: pack ? "pack" : p.owner, pack: pack ? p.owner : undefined, section: pack ? p.ownerSection || undefined : undefined, describe: p.describe });
    },
  })),
  ...(["calendar", "sky"] as const).map((m): Spec => ({
    key: `${m}Names`, head: [`module: ${m}-names`],
    read: (r) => r.time,
    state: (p) => normaliseTime(p.timeModule, { culture: p.culture, kind: p.kind, era: p.era, fantastic: p.fantastic, biome: none(p.biome), start: p.start, words: p.words, tone: p.tone, people: p.people, series: p.series }, limits),
  })),
  {
    key: "peoplesTongues", head: ["module: peoples-tongues"],
    read: (r) => r.peoples,
    state: (p) => normalisePeoples({ culture: p.culture, source: p.peopleSource, pack: p.pack, section: p.section || undefined, era: p.era, giving: p.giving, tone: p.tone, detail: p.detail, names: p.names.join("\n") }),
  },
  ...WILDS_MODULES.map((m): Spec => ({
    key: m, head: [`module: ${m === "mountainNames" ? "mountain-names" : m.replace(/Names$/, "-names")}`], region: true,
    read: (r) => r.wilds,
    state: (p) => chooseWilds({ culture: p.culture, kind: none(p.wildsKind), era: p.era, where: p.where, fantastic: p.fantastic, region: none(p.region), biome: none(p.biome), tone: p.tone, people: p.people, series: p.series }, "culture", p.culture, p.wildsModule),
  })),
  ...(["seasLakes", "coastsIslands", "seaCharts"] as const).map((m): Spec => ({
    key: m, head: ["module: waters", `watersModule: ${m}`], region: true,
    read: (r) => r.waters,
    state: (p) => chooseWaters({ culture: p.culture, kind: none(p.waterKind), era: p.era, where: p.where, fantastic: p.fantastic, region: none(p.region), biome: none(p.biome), tone: p.tone, people: p.people, series: p.series, scale: p.scale, medium: p.medium, register: p.register }, "culture", p.culture, p.watersModule),
  })),
  ...GROUP_NAME_SECTIONS.map((section) => familyForSection(section)!).map((f): Spec => ({
    key: f.key, head: ["module: group-names", `family: ${f.key}`], culture: "tradition", other: "germanic", genre: true,
    read: (r) => r.group,
    state: (p) => groupPresetState(p),
  })),
  ...(["epithets", "familyNames", "titles"] as const).map((m): Spec => ({
    key: m, head: ["module: bynames", `bynameModule: ${m}`], genre: true,
    read: (r) => r.byname,
    state: (p) => bynamePresetState(p),
  })),
  ...(["ships", "spacecraft", "aircraft", "landVehicles"] as const).map((m): Spec => ({
    key: m, head: ["module: vessels", `vesselModule: ${m}`], genre: true,
    read: (r) => r.vessel,
    state: (p) => ({ culture: p.culture, function: none(p.function), technology: p.technology, genre: p.genre, fantastic: p.fantastic, style: p.style, tone: p.tone, prefixes: p.prefixes, people: p.people, series: p.series, ...(p.naming ? { naming: p.naming } : {}) }),
  })),
  {
    key: "realms", head: ["module: realms"], genre: true, eras: { old: "medieval", other: "modern" },
    read: (r) => r.realm,
    state: (p) => ({ culture: p.culture, character: none(p.character), era: p.era, genre: p.genre, fantastic: p.fantastic, namedFor: p.namedFor, biome: none(p.biome), terrain: p.terrain, tone: p.tone, length: p.length, output: p.output, people: p.people, ...(p.peoples ? { peoples: true } : {}) }),
  },
];


const PLACE_HEADS: Record<string, string> = { lands: "land-names", farmland: "farmland-names", hillsValleys: "hills-valleys-names", riversInland: "inland-water-names", starsSpace: "stars-space-names" };
SPECS.push(
  ...PLACE_MODULES.map((m): Spec => ({
    key: m, head: [`module: ${PLACE_HEADS[m]}`], region: true,
    read: (r) => r.wilds,
    state: (p) => chooseWilds({ culture: p.culture, kind: none(p.wildsKind), era: p.era, where: p.where, fantastic: p.fantastic, region: none(p.region), biome: none(p.biome), tone: p.tone, people: p.people, series: p.series }, "culture", p.culture, p.wildsModule),
  })),
);

/** The three notes per module and per people value. */
function notes(spec: Spec, people: string): Record<string, string> {
  const cultureField = spec.culture ?? "culture";
  const note = (lines: string[]) => `---\ntype: module-preset\n${spec.head.join("\n")}\npackName: Fixture\nsetting: \n${[...lines, `people: ${people}`].join("\n")}\n---\n\nA preset.\n`;
  return {
    bare: note([]),
    "celtic WAL fantastic": note([`${cultureField}: celtic`, ...(spec.region ? ["region: WAL"] : []), "fantastic: true", ...(spec.genre ? ["genre: fantasy"] : []), ...(spec.eras ? [`era: ${spec.eras.old}`] : spec.genre ? [] : ["era: MD"])]),
    "other settings": note([`${cultureField}: ${spec.other ?? "norse"}`, ...(spec.region ? ["region: NTH"] : []), "fantastic: true", "tone: grim", ...(spec.genre ? ["genre: modern"] : []), ...(spec.eras ? [`era: ${spec.eras.other}`] : spec.genre ? [] : ["era: MO"])]),
  };
}

/** The finished names for one state at one seed: the engine the module's run method calls. */
function run(spec: Spec, state: any, preset: any, seed: number): string[] { // eslint-disable-line @typescript-eslint/no-explicit-any
  const o = { ...state, count: COUNT, seed };
  const texts = (r: unknown) => ((r as { names: { text?: string }[] }).names ?? []).map((n) => n.text ?? "");
  const k = spec.key;
  if (k === "routeNames") return texts(generateRouteNames(o));
  if (k === "streetNames") return texts(generateStreetNames(o));
  if (k === "innNames") return texts(generateInnNames({ ...o, form: innFormFor(state) }));
  if (k === "buildingNames") return texts(generateBuildingNames(o));
  if (k === "monumentNames") return texts(generateMonumentNames(o));
  if (k === "settlementKit") return kitNoteContent(generateKit({ ...state, seed })).split("\n");
  if (k === "eventNames") return texts(generateEventNames(o));
  if (k === "moneyNames") return texts(generateMoneyNames(o));
  if (k.startsWith("things ")) return texts(generateThingNames({ ...o, module: preset.thingModule }));
  if (k === "calendarNames" || k === "skyNames") return texts(generateTimeSkyNames(o));
  if ((WILDS_MODULES as string[]).includes(k) || (PLACE_MODULES as string[]).includes(k)) return texts(generateWildsNames({ ...o, module: k }));
  if (k === "seasLakes" || k === "coastsIslands" || k === "seaCharts") return texts(generateWatersNames({ ...o, module: k }));
  if (["ships", "spacecraft", "aircraft", "landVehicles"].includes(k)) return texts(generateVesselNames({ ...o, module: k }));
  if (k === "realms") return texts(generateRealmNames(o));
  return texts(generateGroupNames({ ...o, family: k }));
}

export function buildSnapshot(): Record<string, string[] | string> {
  const out: Record<string, string[] | string> = {};
  void limits;
  for (const spec of SPECS) {
    for (const people of ["placeholders", "invented"]) {
      for (const [name, text] of Object.entries(notes(spec, people))) {
        const parsed = parseModulePreset(text, "Fixture");
        const preset = spec.read(parsed);
        if (!preset) continue;
        const state = spec.state(preset);
        // Only modules with a people link belong here.
        if (!("people" in state)) continue;
        for (const seed of SEEDS) {
          const key = `${spec.key} · ${name} · ${people} ${seed}`;
          try {
            out[key] = run(spec, state, preset, seed);
          } catch (error) {
            out[key] = `error: ${error instanceof Error ? error.message : String(error)}`;
          }
        }
      }
    }
  }
  return out;
}

if (process.env.CAPTURE_SHARED_TABLES_BASELINE) {
  writeFileSync(FIXTURE, JSON.stringify(buildSnapshot()));
}

test("shared tables baseline: saved presets with people placeholders and invented give the names recorded before the shared tables", () => {
  const expected = JSON.parse(readFileSync(FIXTURE, "utf8")) as Record<string, string[] | string>;
  const actual = JSON.parse(JSON.stringify(buildSnapshot())) as Record<string, string[] | string>;
  assert.deepEqual(Object.keys(actual), Object.keys(expected));
  for (const key of Object.keys(expected)) assert.deepEqual(actual[key], expected[key], key);
});

test("shared tables baseline: the fixture covers every module with a people link, with both people values", () => {
  const expected = JSON.parse(readFileSync(FIXTURE, "utf8")) as Record<string, unknown>;
  const modules = new Set(Object.keys(expected).map((k) => k.split(" · ")[0]));
  for (const m of [
    "routeNames", "streetNames", "innNames", "buildingNames", "monumentNames", "settlementKit", "eventNames", "moneyNames", "things arms", "things treasure", "things book", "calendarNames", "skyNames",
    "mountainNames", "forestNames", "desertNames", "moorNames", "wetlandNames", "grasslandNames", "lands", "farmland", "hillsValleys", "riversInland", "starsSpace",
    "seasLakes", "coastsIslands", "seaCharts", "power", "trade", "martial", "adventure", "mystic", "underworld", "supernatural",
    "ships", "spacecraft", "aircraft", "landVehicles", "realms",
  ] ) assert.ok(modules.has(m), `${m} is in the fixture`);
  for (const people of ["placeholders", "invented"]) assert.ok(Object.keys(expected).some((k) => k.includes(` · ${people} `)), people);
  const errors = Object.values(expected).filter((v) => typeof v === "string");
  assert.ok(errors.length < Object.keys(expected).length / 10, `few states error: ${errors.length}`);
});
