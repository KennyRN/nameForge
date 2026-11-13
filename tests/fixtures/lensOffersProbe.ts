// One sentence brief §5.2: the probe behind `npm run offers`. For each family A and B module it runs the
// engines (seeds 1, 42 and 2024, 12 names) and records which eras, worlds and region views can change
// that module's names. `scripts/make-lens-offers.mjs` writes the result to src/data/lens-offers.json and
// tests/lensOffers.test.ts regenerates it in memory to check the file is current. Nothing here changes an
// engine: each module is driven as tests/lensBaseline.test.ts drives it.
import { createHash } from "node:crypto";
import { BUILT_IN_BIOMES } from "../../src/biomes";
import { generateRouteNames } from "../../src/routes/engine";
import { DEFAULT_ROUTE_STATE, routeSentence } from "../../src/routes/sentence";
import { generateStreetNames } from "../../src/streets/engine";
import { DEFAULT_STREET_STATE, streetSentence } from "../../src/streets/sentence";
import { generateInnNames } from "../../src/inns/engine";
import { DEFAULT_INN_STATE, innFormFor, innSentence } from "../../src/inns/sentence";
import { generateBuildingNames } from "../../src/buildings/engine";
import { DEFAULT_BUILDING_STATE, buildingSentence } from "../../src/buildings/sentence";
import { generateMonumentNames } from "../../src/monuments/engine";
import { DEFAULT_MONUMENT_STATE, monumentSentence } from "../../src/monuments/sentence";
import { generateKit } from "../../src/settlement/kit";
import { kitNoteContent } from "../../src/settlement/kitFormat";
import { DEFAULT_KIT_STATE, kitSentence } from "../../src/settlement/kitSentence";
import { generateWatersNames, type WatersModule } from "../../src/waters/engine";
import { defaultWatersState, watersSentence } from "../../src/waters/sentence";
import { generateWildsNames, WILDS_MODULES } from "../../src/wilds/engine";
import { defaultWildsState, wildsSentence } from "../../src/wilds/sentence";
import { generateEventNames } from "../../src/events/engine";
import { DEFAULT_EVENT_STATE, eventSentence } from "../../src/events/sentence";
import { generateMoneyNames } from "../../src/money/engine";
import { DEFAULT_MONEY_STATE, moneySentence } from "../../src/money/sentence";
import { generateThingNames, type ThingModule } from "../../src/things/engine";
import { DEFAULT_THING_STATE, thingSentence } from "../../src/things/sentence";
import { generateDeityNames } from "../../src/deities/engine";
import { DEFAULT_DEITY_STATE, DEFAULT_SACRED_PLACE_STATE, DEITIES_MODULE_KINDS, deitySentence, sacredPlaceAsDeityState, sacredPlaceSentence } from "../../src/deities/sentence";
import { generateTimeSkyNames } from "../../src/timesky/engine";
import { DEFAULT_CALENDAR_STATE, DEFAULT_SKY_STATE, timeSentence } from "../../src/timesky/calendarSentence";
import { generatePeopleRows } from "../../src/peoples/engine";
import { DEFAULT_PEOPLE_STATE, peopleSentence } from "../../src/peoples/sentence";
import { familyForSection, generateGroupNames } from "../../src/groups/engine";
import { DEFAULT_GROUP_STATE, groupSentence } from "../../src/groups/sentence";
import { GROUP_NAME_SECTIONS } from "../../src/sections";
import { generateBynames, type BynameModule } from "../../src/bynames/engine";
import { DEFAULT_BYNAME_STATE, bynameSentence } from "../../src/bynames/sentence";
import { generateVesselNames, type VesselModule } from "../../src/vessels/engine";
import { defaultVesselState, vesselSentence } from "../../src/vessels/sentence";
import { generateRealmNames } from "../../src/realms/engine";
import { DEFAULT_REALM_STATE, realmSentence } from "../../src/realms/sentence";
import { LENS_ERAS } from "../../src/lens";
import lensData from "../../src/data/lens.json";
import { rosterCultures } from "../../src/lensRosters";
import "../../src/lensRosterSources";
import { ROUTE_ERAS } from "../../src/routes/engine";
import { waterEras } from "../../src/waters/engine";
import { wildsEras } from "../../src/wilds/engine";

const SEEDS = [1, 42, 2024];
const COUNT = 12;
const PEOPLE_INPUT = ["Aldwin", "Brenna of the Vale", "Cassius", "Dagmar", "Eskil Thorne", "Fenwick", "Gaela", "Hrolf", "Isolde", "Jorund", "Kestrel", "Lysander"];
const limits = { biomes: BUILT_IN_BIOMES.all, findBiome: (id: string | undefined) => BUILT_IN_BIOMES.find(id), spaceBiomes: BUILT_IN_BIOMES.space };

type State = Record<string, unknown>;
type Segment = string | { field: string; choices: { id?: string }[] };

interface Spec {
  key: string;
  family: "A" | "B";
  /** The sentence state's default. */
  state: () => State;
  /** The module's sentence for a state: its menus say which cultures and kinds it offers. */
  sentence: (state: State) => Segment[];
  /** Finished strings (or lines) for a state and seed. */
  run: (state: State, seed: number) => string[];
  /** The state field that holds the culture. */
  culture: string;
  /** The links whose choices are the module's kinds. */
  kinds: string[];
}

const textsOf = (result: unknown): string[] => {
  const r = result as { names?: unknown[]; rows?: unknown[] };
  return ((r.names ?? r.rows ?? []) as (string | { text?: string; name?: string })[]).map((n) => (typeof n === "string" ? n : n.text ?? n.name ?? ""));
};

const THING_KEY: Record<string, ThingModule> = { armsNames: "arms", treasureNames: "treasure", bookNames: "book" };

function specs(): Spec[] {
  const out: Spec[] = [];
  const add = (s: Spec) => out.push(s);
  // ── Family A ────────────────────────────────────────────────────────────
  add({ key: "routeNames", family: "A", culture: "culture", kinds: ["kind"], state: () => ({ ...DEFAULT_ROUTE_STATE }), sentence: (s) => routeSentence(s as never), run: (s, seed) => textsOf(generateRouteNames({ ...(s as never), count: COUNT, seed })) });
  add({ key: "sacredPlaces", family: "A", culture: "culture", kinds: ["domain"], state: () => ({ ...DEFAULT_SACRED_PLACE_STATE }), sentence: (s) => sacredPlaceSentence(s as never), run: (s, seed) => textsOf(generateDeityNames({ ...sacredPlaceAsDeityState(s as never), count: COUNT, seed })) });
  add({ key: "streetNames", family: "A", culture: "culture", kinds: ["kind"], state: () => ({ ...DEFAULT_STREET_STATE }), sentence: (s) => streetSentence(s as never), run: (s, seed) => textsOf(generateStreetNames({ ...(s as never), count: COUNT, seed })) });
  add({
    key: "innNames", family: "A", culture: "culture", kinds: ["kind"], state: () => ({ ...DEFAULT_INN_STATE }), sentence: (s) => innSentence(s as never),
    run: (s, seed) => textsOf(generateInnNames({ ...(s as never), form: innFormFor(s as never), count: COUNT, seed })),
  });
  add({ key: "buildingNames", family: "A", culture: "culture", kinds: ["kind"], state: () => ({ ...DEFAULT_BUILDING_STATE }), sentence: (s) => buildingSentence(s as never), run: (s, seed) => textsOf(generateBuildingNames({ ...(s as never), count: COUNT, seed })) });
  add({ key: "monumentNames", family: "A", culture: "culture", kinds: ["kind"], state: () => ({ ...DEFAULT_MONUMENT_STATE }), sentence: (s) => monumentSentence(s as never), run: (s, seed) => textsOf(generateMonumentNames({ ...(s as never), count: COUNT, seed })) });
  add({ key: "settlementKit", family: "A", culture: "culture", kinds: ["size"], state: () => ({ ...DEFAULT_KIT_STATE }), sentence: (s) => kitSentence(s as never), run: (s, seed) => kitNoteContent(generateKit({ ...(s as never), seed })).split("\n") });
  for (const module of ["seasLakes", "coastsIslands", "seaCharts"] as WatersModule[]) {
    add({ key: module, family: "A", culture: "culture", kinds: ["kind"], state: () => ({ ...defaultWatersState(module) }), sentence: (s) => watersSentence(s as never, module), run: (s, seed) => textsOf(generateWatersNames({ ...(s as never), module, count: COUNT, seed })) });
  }
  for (const module of WILDS_MODULES) {
    add({ key: module, family: "A", culture: "culture", kinds: ["kind"], state: () => ({ ...defaultWildsState(module) }), sentence: (s) => wildsSentence(s as never, module), run: (s, seed) => textsOf(generateWildsNames({ ...(s as never), module, count: COUNT, seed })) });
  }
  add({ key: "eventNames", family: "A", culture: "culture", kinds: ["kind"], state: () => ({ ...DEFAULT_EVENT_STATE }), sentence: (s) => eventSentence(s as never), run: (s, seed) => textsOf(generateEventNames({ ...(s as never), count: COUNT, seed })) });
  add({ key: "moneyNames", family: "A", culture: "culture", kinds: ["kind"], state: () => ({ ...DEFAULT_MONEY_STATE }), sentence: (s) => moneySentence(s as never), run: (s, seed) => textsOf(generateMoneyNames({ ...(s as never), count: COUNT, seed })) });
  for (const [key, thingModule] of Object.entries(THING_KEY)) {
    add({
      key, family: "A", culture: "culture", kinds: ["kind"], state: () => ({ ...DEFAULT_THING_STATE }), sentence: (s) => thingSentence(thingModule, s as never),
      run: (s, seed) => textsOf(generateThingNames({ ...(s as never), module: thingModule, count: COUNT, seed })),
    });
  }
  add({
    key: "deityNames", family: "A", culture: "culture", kinds: ["kind", "domain"], state: () => ({ ...DEFAULT_DEITY_STATE }), sentence: (s) => deitySentence(s as never),
    run: (s, seed) => textsOf(generateDeityNames({ ...(s as never), kinds: DEITIES_MODULE_KINDS, count: COUNT, seed })),
  });
  for (const [key, module, base] of [["calendarNames", "calendar", DEFAULT_CALENDAR_STATE], ["skyNames", "sky", DEFAULT_SKY_STATE]] as const) {
    add({ key, family: "A", culture: "culture", kinds: ["kind"], state: () => ({ ...base }), sentence: (s) => timeSentence(module, s as never, limits), run: (s, seed) => textsOf(generateTimeSkyNames({ ...(s as never), count: COUNT, seed })) });
  }
  add({
    key: "peoplesTongues", family: "A", culture: "culture", kinds: [], state: () => ({ ...DEFAULT_PEOPLE_STATE }), sentence: (s) => peopleSentence(s as never),
    run: (s, seed) => {
      const st = s as { culture: string; era: string; giving: never; detail: never; tone: never };
      return textsOf(generatePeopleRows({ names: PEOPLE_INPUT, giving: DEFAULT_PEOPLE_STATE.giving, detail: DEFAULT_PEOPLE_STATE.detail, tone: DEFAULT_PEOPLE_STATE.tone, culture: st.culture, era: st.era as never, seed }));
    },
  });
  // ── Family B ────────────────────────────────────────────────────────────
  for (const section of GROUP_NAME_SECTIONS) {
    const family = familyForSection(section);
    if (!family) continue;
    add({
      key: section, family: "B", culture: "tradition", kinds: ["type"], state: () => ({ ...DEFAULT_GROUP_STATE }), sentence: (s) => groupSentence(s as never, family),
      run: (s, seed) => textsOf(generateGroupNames({ ...(s as never), family: family.key, count: COUNT, seed })),
    });
  }
  for (const module of ["epithets", "familyNames", "titles"] as BynameModule[]) {
    add({ key: module, family: "B", culture: "culture", kinds: ["kind"], state: () => ({ ...DEFAULT_BYNAME_STATE }), sentence: (s) => bynameSentence(s as never, module), run: (s, seed) => textsOf(generateBynames({ ...(s as never), module, count: COUNT, seed })) });
  }
  for (const module of ["ships", "spacecraft", "aircraft", "landVehicles"] as VesselModule[]) {
    add({ key: module, family: "B", culture: "culture", kinds: ["function"], state: () => ({ ...defaultVesselState(module) }), sentence: (s) => vesselSentence(s as never, module), run: (s, seed) => textsOf(generateVesselNames({ ...(s as never), module, count: COUNT, seed })) });
  }
  add({ key: "realms", family: "B", culture: "culture", kinds: ["character"], state: () => ({ ...DEFAULT_REALM_STATE }), sentence: (s) => realmSentence(s as never, limits), run: (s, seed) => textsOf(generateRealmNames({ ...(s as never), count: COUNT, seed })) });
  return out;
}

// ── The probe ──────────────────────────────────────────────────────────────

const link = (segments: Segment[], field: string) => segments.find((s): s is Exclude<Segment, string> => typeof s !== "string" && s.field === field);
const ids = (segments: Segment[], field: string): string[] => (link(segments, field)?.choices ?? []).map((c) => c.id).filter((id): id is string => id !== undefined);

// The probe finds what a module offers from its own engine and roster, never from its sentence: the sentence's
// culture, era, world and region links are built from the file this probe writes.
const LENS_MODULES = (lensData as unknown as { modules: Record<string, { sentence: { fields?: { fantastic: string | null; region: string | null }; roster?: string | null } }> }).modules;
/** The era codes a family A module offers (its own list). */
function offeredEras(key: string): string[] {
  if ((WILDS_MODULES as readonly string[]).includes(key)) return [...wildsEras(key as never)] as string[];
  if (["seasLakes", "coastsIslands", "seaCharts"].includes(key)) return [...waterEras(key as WatersModule)] as string[];
  return ROUTE_ERAS.map((e) => e.code);
}
/** The culture keys a module offers today (its roster). */
const offeredCultures = (spec: Spec): string[] => (spec.family === "A" ? rosterCultures(LENS_MODULES[spec.key].sentence.roster!).map((c) => c.key) : ids(spec.sentence(spec.state()), spec.culture));

/** One run's finished strings, or the error it threw, as its own output. */
function attempt(spec: Spec, state: State, seed: number): string {
  try {
    return JSON.stringify(spec.run(state, seed));
  } catch (error) {
    return `error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

/** The fixed inputs of §5.2: the defaults, then each kind, then each culture, each at the three seeds. */
function variants(spec: Spec): State[] {
  const base = spec.state();
  const segments = spec.sentence(base);
  const list: State[] = [{}];
  for (const field of spec.kinds) for (const id of ids(segments, field)) list.push({ [field]: id });
  for (const id of offeredCultures(spec)) list.push({ [spec.culture]: id });
  return list;
}

/** A digest of every run of the module in a state (the variants applied over it). */
function signature(spec: Spec, variantList: State[], state: State): string {
  const hash = createHash("sha1");
  for (const v of variantList) for (const seed of SEEDS) hash.update(attempt(spec, { ...state, ...v }, seed)).update("\n");
  return hash.digest("hex");
}

const BAND_LABEL: Record<string, string> = { fantasy: "pre-industrial", modern: "industrial and modern", scifi: "future" };
/** The era a family B module is probed at in each band (realms store an era of their own; the rest store none). */
const BAND_ERA: Record<string, string> = { fantasy: "medieval", modern: "modern", scifi: "interstellar" };

export interface ModuleOffers {
  family: "A" | "B";
  /** Family A: runs of adjacent eras that never differ. Family B: the bands offered. */
  eras: string[][] | string[];
  /** Per era (family A) or band (family B): "plain" always, "fantastic" where switching it changes the names. */
  worlds: Record<string, string[]>;
  /** Only for modules with a region field: the views of Celtic that change the names. */
  views?: string[];
  /** Realms only: their own six eras, in runs of adjacent eras that never differ (the genre follows the era). */
  eraRuns?: string[][];
}

export function probeModule(spec: Spec): ModuleOffers {
  const base = spec.state();
  const segments = spec.sentence(base);
  const variantList = variants(spec);
  const fields = LENS_MODULES[spec.key].sentence.fields;
  const hasFantastic = spec.family === "A" ? !!fields?.fantastic : !!link(segments, "fantastic");
  const regionLink = spec.family === "A" ? !!fields?.region : link(segments, "region");
  const worlds: Record<string, string[]> = {};
  let eras: string[][] | string[];
  let eraRuns: string[][] | undefined;

  if (spec.family === "A") {
    const offered = offeredEras(spec.key);
    const codes = LENS_ERAS.map((e) => e.code).filter((c) => offered.includes(c));
    const plain = new Map<string, string>();
    const fantastic = new Map<string, string>();
    for (const era of codes) {
      plain.set(era, signature(spec, variantList, { ...base, era, fantastic: false }));
      if (hasFantastic) fantastic.set(era, signature(spec, variantList, { ...base, era, fantastic: true }));
      worlds[era] = hasFantastic && fantastic.get(era) !== plain.get(era) ? ["plain", "fantastic"] : ["plain"];
    }
    const runs: string[][] = [];
    for (const era of codes) {
      const last = runs[runs.length - 1];
      const previous = last?.[last.length - 1];
      // Adjacent eras merge when neither world ever differs between them.
      if (previous && plain.get(previous) === plain.get(era) && fantastic.get(previous) === fantastic.get(era)) last.push(era);
      else runs.push([era]);
    }
    eras = runs;
  } else {
    const offered = ids(segments, "genre");
    const bands = ["fantasy", "modern", "scifi"].filter((g) => offered.includes(g));
    for (const genre of bands) {
      const state = { ...base, genre, ...("era" in base ? { era: BAND_ERA[genre] } : {}) };
      const off = signature(spec, variantList, { ...state, fantastic: false });
      const on = hasFantastic ? signature(spec, variantList, { ...state, fantastic: true }) : off;
      worlds[BAND_LABEL[genre]] = on !== off ? ["plain", "fantastic"] : ["plain"];
    }
    eras = bands.map((g) => BAND_LABEL[g]);
    if (spec.key === "realms") {
      const realmEras = ids(segments, "era");
      const GENRE_OF: Record<string, string> = { ancient: "fantasy", medieval: "fantasy", earlyModern: "fantasy", modern: "modern", nearFuture: "scifi", interstellar: "scifi" };
      const sigs = realmEras.map((era) => ({
        era,
        sig: signature(spec, variantList, { ...base, era, genre: GENRE_OF[era], fantastic: false }) + signature(spec, variantList, { ...base, era, genre: GENRE_OF[era], fantastic: true }),
      }));
      eraRuns = [];
      for (const { era, sig } of sigs) {
        const prev = sigs[sigs.findIndex((s) => s.era === era) - 1];
        const last = eraRuns[eraRuns.length - 1];
        if (prev && prev.sig === sig) last.push(era);
        else eraRuns.push([era]);
      }
    }
  }

  let views: string[] | undefined;
  if (regionLink && offeredCultures(spec).includes("celtic")) {
    views = [];
    // Kinds vary the runs; the culture is Celtic, so only the kinds (and the defaults) apply.
    const kindsOnly = [{} as State, ...spec.kinds.flatMap((field) => ids(segments, field).map((id): State => ({ [field]: id })))];
    const celtic = (region: string | undefined): string => signature(spec, kindsOnly, { ...base, culture: "celtic", region });
    const none = celtic(undefined);
    if (celtic("WAL") !== none) views.push("welsh");
    if (["SBL", "SLO", "SHH", "NSI"].some((r) => celtic(r) !== none)) views.push("scottish");
    if (celtic("COR") !== none) views.push("cornish");
  }
  return { family: spec.family, eras, worlds, ...(views ? { views } : {}), ...(eraRuns ? { eraRuns } : {}) };
}

export function buildOffers(): { _about: string; modules: Record<string, ModuleOffers> } {
  const modules: Record<string, ModuleOffers> = {};
  for (const spec of specs()) modules[spec.key] = probeModule(spec);
  return {
    _about:
      "Generated by `npm run offers` (scripts/make-lens-offers.mjs), never edited by hand. For each family A and B module: which eras, worlds and region views can change its names (one sentence brief §5.2).",
    modules,
  };
}

export const probeSpecs = specs;
