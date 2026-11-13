// One sentence brief §8.1 (M0): the sentences and presets of every family A and B module, recorded
// before any change. Run with CAPTURE_SENTENCE_BASELINE=1 to record.
//
// Two parts, two top-level keys in tests/fixtures/sentence-baseline.json:
//  - `sentences`: each module's default sentence as text, and every choice of its culture, era, fantastic,
//    genre, world and region links, as the builders return them today. This is the "before" for the summary:
//    milestones M3 to M5 replace it with the new sentences and say so in their commits.
//  - `presetOptions`: for each module, presets written as notes (the bare note, one saved with
//    `culture: celtic`, `region: WAL` and `fantastic: true`, and one at other settings), read by the real
//    parser and the module's preset-to-state mapping (the modal's `…PresetState`, mirrored here because
//    those methods are private), with the options the engine receives. **THIS PART IS FROZEN.** It must
//    never change: stored state and its meaning are the same after the brief as before.
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
import { WILDS_MODULES } from "../src/wilds/engine";
import { THING_MODULES } from "../src/things/engine";
import { parseModulePreset } from "../src/presets";

const FIXTURE = "tests/fixtures/sentence-baseline.json";

// ── The sentence limits the modal passes ────────────────────────────────────
const limits = { biomes: BUILT_IN_BIOMES.all, findBiome: (id: string | undefined) => BUILT_IN_BIOMES.find(id), spaceBiomes: BUILT_IN_BIOMES.space };

/** The links the brief gathers into the lens clause. */
const LENS_FIELDS = new Set(["culture", "era", "fantastic", "genre", "region", "world"]);

type Segment = string | { field: string; text: string; title: string; choices: { id?: string; label: string; heading?: string; group?: string }[]; current?: string | boolean };

/** One module's default sentence as text, and every choice of its lens-clause links. */
function record(segments: Segment[], text: (s: Segment[]) => string) {
  return {
    text: text(segments),
    links: segments
      .filter((s): s is Exclude<Segment, string> => typeof s !== "string" && LENS_FIELDS.has(s.field))
      .map((s) => ({
        field: s.field,
        text: s.text,
        title: s.title,
        current: s.current ?? null,
        choices: s.choices.map((c) => ({ id: c.id ?? null, label: c.label, ...(c.heading ? { heading: c.heading } : {}), ...(c.group ? { group: c.group } : {}) })),
      })),
  };
}

const THING_KEY: Record<string, string> = { armsNames: "arms", treasureNames: "treasure", bookNames: "book" };

/** Every family A and B module, in the line-up's order, with its default sentence built as the modal builds it. */
function sentences(): Record<string, ReturnType<typeof record>> {
  const out: Record<string, ReturnType<typeof record>> = {};
  // Family A
  out.routeNames = record(routeSentence({ ...DEFAULT_ROUTE_STATE }), routeSentenceText);
  out.sacredPlaces = record(sacredPlaceSentence({ ...DEFAULT_SACRED_PLACE_STATE }), deitySentenceText);
  out.streetNames = record(streetSentence({ ...DEFAULT_STREET_STATE }), streetSentenceText);
  out.innNames = record(innSentence({ ...DEFAULT_INN_STATE }), innSentenceText);
  out.buildingNames = record(buildingSentence({ ...DEFAULT_BUILDING_STATE }), buildingSentenceText);
  out.monumentNames = record(monumentSentence({ ...DEFAULT_MONUMENT_STATE }), monumentSentenceText);
  out.settlementKit = record(kitSentence({ ...DEFAULT_KIT_STATE }), kitSentenceText);
  out.seasLakes = record(watersSentence(defaultWatersState("seasLakes"), "seasLakes"), watersSentenceText);
  out.coastsIslands = record(watersSentence(defaultWatersState("coastsIslands"), "coastsIslands"), watersSentenceText);
  out.seaCharts = record(watersSentence(defaultWatersState("seaCharts"), "seaCharts"), watersSentenceText);
  for (const m of WILDS_MODULES) out[m] = record(wildsSentence(defaultWildsState(m), m), wildsSentenceText);
  out.eventNames = record(eventSentence({ ...DEFAULT_EVENT_STATE }), eventSentenceText);
  out.moneyNames = record(moneySentence({ ...DEFAULT_MONEY_STATE }), moneySentenceText);
  for (const m of THING_MODULES) {
    const key = Object.entries(THING_KEY).find(([, v]) => v === m.key)?.[0] ?? m.key;
    out[key] = record(thingSentence(m.key as never, { ...DEFAULT_THING_STATE }), thingSentenceText);
  }
  out.deityNames = record(deitySentence({ ...DEFAULT_DEITY_STATE }), deitySentenceText);
  out.calendarNames = record(timeSentence("calendar", { ...DEFAULT_CALENDAR_STATE }, limits), timeSentenceText);
  out.skyNames = record(timeSentence("sky", { ...DEFAULT_SKY_STATE }, limits), timeSentenceText);
  out.peoplesTongues = record(peopleSentence({ ...DEFAULT_PEOPLE_STATE }), peopleSentenceText);
  // Family B
  for (const section of GROUP_NAME_SECTIONS) {
    const family = familyForSection(section);
    if (family) out[section] = record(groupSentence({ ...DEFAULT_GROUP_STATE }, family), groupSentenceText);
  }
  for (const m of ["epithets", "familyNames", "titles"] as const) out[m] = record(bynameSentence({ ...DEFAULT_BYNAME_STATE }, m), bynameSentenceText);
  for (const m of ["ships", "spacecraft", "aircraft", "landVehicles"] as const) out[m] = record(vesselSentence(defaultVesselState(m), m), vesselSentenceText);
  out.realms = record(realmSentence({ ...DEFAULT_REALM_STATE }, limits), realmSentenceText);
  return out;
}

// ── Presets ────────────────────────────────────────────────────────────────
// A preset is a flat note: `type: module-preset`, `module: …`, then `key: value` lines. Three per module.
type Spec = {
  key: string;
  /** The note's module lines. */
  head: string[];
  /** The preset field names this module's note uses for its culture and its region. */
  culture?: "culture" | "tradition";
  /** A culture (or tradition) other than Celtic for the third note, where the module's own roster lacks `norse`. */
  other?: string;
  /** The era values this module's note uses, where it isn't a two-letter code (realms). */
  eras?: { old: string; other: string };
  region?: boolean;
  genre?: boolean;
  /** The parsed preset, then the sentence state the modal builds from it. */
  read: (r: ReturnType<typeof parseModulePreset>) => unknown;
  state: (p: any) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** The options the engine receives, beyond the state itself. */
  options?: (state: any, p: any) => Record<string, unknown>; // eslint-disable-line @typescript-eslint/no-explicit-any
};

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

/** The three notes saved for a module: bare; as saved before the lens (Celtic, Wales, fantastic on); and at other settings. */
function notes(spec: Spec): Record<string, string> {
  const cultureField = spec.culture ?? "culture";
  const note = (lines: string[]) => `---\ntype: module-preset\n${spec.head.join("\n")}\npackName: Fixture\nsetting: \n${lines.join("\n")}\n---\n\nA preset.\n`;
  return {
    bare: note([]),
    "celtic WAL fantastic": note([`${cultureField}: celtic`, ...(spec.region ? ["region: WAL"] : []), "fantastic: true", ...(spec.genre ? ["genre: fantasy"] : []), ...(spec.eras ? [`era: ${spec.eras.old}`] : spec.genre ? [] : ["era: MD"])]),
    "other settings": note([`${cultureField}: ${spec.other ?? "norse"}`, ...(spec.region ? ["region: NTH"] : []), "fantastic: true", "tone: grim", ...(spec.genre ? ["genre: modern"] : []), ...(spec.eras ? [`era: ${spec.eras.other}`] : spec.genre ? [] : ["era: MO"])]),
  };
}

/** The same value with keys in sorted order, so the fixture is stable. */
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => [k, stable(v)]));
  return value === undefined ? null : value;
}

function presetOptions(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const spec of SPECS) {
    for (const [name, text] of Object.entries(notes(spec))) {
      const parsed = parseModulePreset(text, "Fixture");
      const preset = spec.read(parsed);
      if (!preset) {
        out[`${spec.key} · ${name}`] = { problems: parsed.problems };
        continue;
      }
      const state = spec.state(preset);
      out[`${spec.key} · ${name}`] = stable({ problems: parsed.problems, state, options: { ...state, ...(spec.options?.(state, preset) ?? {}) } });
    }
  }
  return out;
}

export function buildSnapshot() {
  return { sentences: sentences(), presetOptions: presetOptions() };
}

if (process.env.CAPTURE_SENTENCE_BASELINE) {
  writeFileSync(FIXTURE, JSON.stringify(buildSnapshot()));
}

test("sentence baseline: every family A and B module's default sentence and lens links match what was recorded before the lens clause", () => {
  const expected = JSON.parse(readFileSync(FIXTURE, "utf8"));
  const actual = JSON.parse(JSON.stringify(buildSnapshot()));
  assert.deepEqual(Object.keys(actual.sentences), Object.keys(expected.sentences));
  for (const key of Object.keys(expected.sentences)) assert.deepEqual(actual.sentences[key], expected.sentences[key], key);
});

test("sentence baseline: presets resolve to the same engine options (frozen)", () => {
  const expected = JSON.parse(readFileSync(FIXTURE, "utf8"));
  const actual = JSON.parse(JSON.stringify(buildSnapshot()));
  assert.deepEqual(Object.keys(actual.presetOptions), Object.keys(expected.presetOptions));
  for (const key of Object.keys(expected.presetOptions)) assert.deepEqual(actual.presetOptions[key], expected.presetOptions[key], key);
});

test("sentence baseline: the fixture covers every family A and B module and every preset resolved", () => {
  const expected = JSON.parse(readFileSync(FIXTURE, "utf8"));
  const modules = Object.keys(expected.sentences);
  for (const m of [
    "routeNames", "sacredPlaces", "streetNames", "innNames", "buildingNames", "monumentNames", "settlementKit", "seasLakes", "coastsIslands", "seaCharts",
    "mountainNames", "forestNames", "desertNames", "moorNames", "wetlandNames", "grasslandNames", "eventNames", "moneyNames", "armsNames", "treasureNames", "bookNames",
    "deityNames", "calendarNames", "skyNames", "peoplesTongues", "epithets", "familyNames", "titles", "ships", "spacecraft", "aircraft", "landVehicles", "realms",
    "powerFactions", "tradeGuilds", "martialOrders", "adventureCompanies", "mysticOrders", "underworldGroups", "supernaturalCourts",
  ]) assert.ok(modules.includes(m), `${m} has a sentence`);
  for (const [key, value] of Object.entries(expected.presetOptions as Record<string, { state?: unknown }>)) {
    assert.ok(value.state, `${key} resolves to a state: ${JSON.stringify(value)}`);
  }
});
