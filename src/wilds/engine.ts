// Wild lands (docs/wild-lands-brief.md): mountains, forests and woods, deserts, moors and heaths,
// wetlands and grasslands, one engine for all six. Follows the waters engine's conventions (shapes with
// weight, era, culture, region and biome tags; shared pools in settlement-vocab.json; culture shapes;
// series) and reuses route names' places, peoples and kingdoms, the group engine's weighted draws and
// tone factor, and the river engine. The helpers are mirrored from the waters engine so that its
// fixtures can't move. No Obsidian imports.

import wildsData from "../data/wilds.json";
import placesData from "../data/places.json";
import { BRITAIN, biomesRootedIn, biomeTitleCase, biomeWords, biomeMatches, BUILT_IN_BIOMES, pluralOf, type Biome, type BiomeCatalogue, type BiomeList } from "../biomes";
import { INTERSTELLAR_ERA, WORLD_CULTURES } from "../world/engine";
import { deityHooks } from "../deities/hook";
import {
  type GroupPeople,
  type GroupSafeguards,
  type GroupSetting,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  groupListWords,
  groupPossessive,
  groupSaint,
  hasBannedWord,
  pickWeighted,
  repeatsContent,
  toneFactor,
  wordTones,
} from "../groups/engine";
import { mulberry32 } from "../markov";
import { riverFill, type RiverSetting } from "../rivers/engine";
import { townSource } from "../bynames/engine";
import { BRITISH_CULTURES, breaksRouteWords, countedWords, godNames, personNames, ROUTE_CULTURES, ROUTE_ERAS, routeCapitals, routeFolk, routeKingdom, routeNorm, routePlace, routeSetting, type RouteCulture, type RouteEra } from "../routes/engine";
import { BUILT_IN_VOCAB, cultureAllowed, poolEntries, type VocabEntry, type Vocabulary } from "../settlement/vocab";
import { generateSettlementNames, type SettlementNamesOptions } from "../settlement/names";
import { kindInClass, type PlaceClass } from "../places/classes";
import { drawKind, type KindSources } from "../places/sources";

// ── Data ────────────────────────────────────────────────────────────────────

export type WildsModule = "mountainNames" | "forestNames" | "desertNames" | "moorNames" | "wetlandNames" | "grasslandNames";
export const WILDS_MODULES: WildsModule[] = ["mountainNames", "forestNames", "desertNames", "moorNames", "wetlandNames", "grasslandNames"];
/** Place modules split brief §5: the focused place modules that run on this engine, with their own table (places.json). */
export type PlaceModule = "riversInland";
export const PLACE_MODULES: PlaceModule[] = ["riversInland"];
export const isPlaceModule = (module: string): module is PlaceModule => (PLACE_MODULES as string[]).includes(module);
/** A module this engine runs: one of the six wild lands modules or a focused place module. */
export type WildsLikeModule = WildsModule | PlaceModule;
export type WildsEra = RouteEra;
/** Place modules split brief §3.1: home country, newly explored country, or settled lands. */
export type WildsWhere = "home" | "new" | "settled";

export interface WildsShape {
  p: string;
  w: number;
  /** Family (§3.6). */
  f: string;
  of?: boolean;
  e?: WildsEra[];
  c?: string[];
  rt?: string;
  bt?: string;
  t?: GroupTone[];
  /** true: fantastic only; false: realistic only. */
  h?: boolean;
  cx?: Record<string, number>;
  /** §3.2: a multiplier in new country. */
  nx?: number;
  /** Settlement kind: the sizes the settlement suits (h v t c g). */
  sz?: string;
  /** A feature shape that also works as a settlement name, with its sizes (§9.2). */
  st?: string;
}

export interface WildsKind {
  key: string;
  menu: string;
  plural: string;
  weight: number;
  /** Place modules split brief §6: natural, managed or constructed. */
  class?: PlaceClass;
  /** Place modules split brief §4: the engines this kind borrows names from, or delegates to (focused place modules only). */
  sources?: KindSources;
}

interface WildsModuleData {
  label: string;
  any: string;
  seriesText: string;
  terrain: string;
  defaultBiome: string;
  biomes: string[];
  region: boolean;
  eras: WildsEra[];
  kinds: WildsKind[];
  /** Focused place modules: the kind a series' first name is drawn from (the wild lands' is PARENT_KIND). */
  parentKind?: string;
}

interface WildsData {
  regions: string[];
  where: Record<string, { home: number; new: number; settled?: number }>;
  regionTags: Record<string, Record<string, number>>;
  biomeTags: Record<string, Record<string, number>>;
  cultureMult: Record<string, Record<string, number>>;
  eraMult: Record<string, Record<string, number>>;
  kindMult: { britishHome: Record<string, number>; biome: Record<string, string> };
  homeland: Record<string, string>;
  modules: Record<string, WildsModuleData>;
  shapes: Record<string, Record<string, WildsShape[]>>;
  cultureShapes: (WildsShape & { culture: string; module: string; kind: string })[];
  settlementLink: {
    purposeBuiltShare: number;
    terrainToModule: { terrain: string; module: WildsModule; byBiome?: Record<string, WildsModule>; split?: Record<string, Record<string, number>> }[];
    nativeLand: Record<string, { terrain: string; biomeIfUnset?: string }>;
    worldEraToRoute: Record<string, Record<string, WildsEra>>;
    colonialToCulture: Record<string, { culture: string; era: WildsEra }>;
    cultureToColonial: Record<string, string>;
    /** Place modules split brief §3.2: more cultures' colonial traditions; a list is drawn from per name, by weight. Read by the place sources only. */
    cultureToColonialAdded?: Record<string, string | { tradition: string; weight: number }[]>;
  };
  sources: { beast: { pool: number; biome: number; biomeLists: Record<string, number> }; tree: { pool: number; biome: number; biomeLists: Record<string, number> }; stock: { biome: number; biomeLists: Record<string, number> } };
  beastPools: Record<string, string>;
  safeguards: Record<string, string[]> & { bannedWords: string[] };
  cap: number;
}

export const WILDS_DATA = wildsData as unknown as WildsData;
const PLACES = placesData as unknown as Partial<WildsData> & { eraMult?: Record<string, Record<string, number>> };

/**
 * The table a module reads: wilds.json for the six wild lands modules; for a focused place module the
 * same, with the module's own kinds, shapes, culture shapes, tags and safeguards from places.json.
 * Shared multipliers (culture, era, where), the homeland map and the vocabulary stay wilds.json's.
 */
const PLACES_DATA: WildsData = {
  ...WILDS_DATA,
  modules: PLACES.modules!,
  shapes: PLACES.shapes!,
  cultureShapes: PLACES.cultureShapes ?? [],
  regionTags: { ...WILDS_DATA.regionTags, ...PLACES.regionTags },
  biomeTags: { ...WILDS_DATA.biomeTags, ...PLACES.biomeTags },
  eraMult: { ...WILDS_DATA.eraMult, ...PLACES.eraMult },
  kindMult: { britishHome: { ...WILDS_DATA.kindMult.britishHome, ...PLACES.kindMult?.britishHome }, biome: { ...WILDS_DATA.kindMult.biome, ...PLACES.kindMult?.biome } },
  beastPools: PLACES.beastPools!,
  safeguards: { ...PLACES.safeguards!, bannedWords: WILDS_DATA.safeguards.bannedWords },
};
/** The table a module reads. */
export const wildsDataOf = (module: WildsLikeModule): WildsData => (isPlaceModule(module) ? PLACES_DATA : WILDS_DATA);
export const WILDS_CULTURES: RouteCulture[] = ROUTE_CULTURES;
export const findWildsCulture = (key: string | undefined) => WILDS_CULTURES.find((c) => c.key === key);
export const isBritishCulture = (culture: string) => BRITISH_CULTURES.includes(culture);

export const wildsModuleData = (module: WildsLikeModule): WildsModuleData => wildsDataOf(module).modules[module];
export const wildsKinds = (module: WildsLikeModule): WildsKind[] => wildsDataOf(module).modules[module].kinds;
export const findWildsKind = (module: WildsLikeModule, key: string | undefined) => wildsKinds(module).find((k) => k.key === key);
export const wildsAny = (module: WildsLikeModule) => wildsDataOf(module).modules[module].any;
export const wildsEras = (module: WildsLikeModule): WildsEra[] => wildsDataOf(module).modules[module].eras;
export const wildsEraLabel = (code: string) => ROUTE_ERAS.find((e) => e.code === code)?.label ?? code;
export const wildsDefaultCulture = (module: WildsLikeModule) => (module === "desertNames" ? "general" : "norman-british");

/** §2.2: the region link shows for the three British cultures in home country, never in deserts. */
export const showsWildsRegion = (module: WildsLikeModule, culture: string, where: WildsWhere) =>
  wildsDataOf(module).modules[module].region && isBritishCulture(culture) && where === "home";

/**
 * The biomes a module offers (§3.4), in menu order. A biome pack shows where its root built-in does
 * (wizard retirement brief §5.1); one that replaces a built-in shows where that built-in does.
 */
export const wildsBiomes = (module: WildsLikeModule, catalogue: BiomeCatalogue = BUILT_IN_BIOMES): Biome[] =>
  biomesRootedIn(catalogue, wildsDataOf(module).modules[module].biomes);

/** §6: the module's parent kind, for a series' first name (§12). */
export const PARENT_KIND: Record<WildsModule, string> = { mountainNames: "range", forestNames: "forest", desertNames: "desert", moorNames: "moor", wetlandNames: "marsh", grasslandNames: "plain" };
/** A module's parent kind: the wild lands' fixed table, or a focused place module's own `parentKind`. */
export const parentKindOf = (module: WildsLikeModule): string => (isPlaceModule(module) ? PLACES_DATA.modules[module].parentKind ?? PLACES_DATA.modules[module].kinds[0].key : PARENT_KIND[module]);

/** §6: whether a kind has a shape live in an era (culture and fantastic ignored, as the kind menu shows it). */
export function wildsKindLive(module: WildsLikeModule, kind: string, era: WildsEra): boolean {
  const data = wildsDataOf(module);
  const shapes = [...(data.shapes[module][kind] ?? []), ...data.cultureShapes.filter((s) => s.module === module && s.kind === kind)];
  if (kind === "settlement") return true;
  // Place modules split brief §4: a kind with sources can always draw from them, whatever the era.
  if (findWildsKind(module, kind)?.sources) return true;
  return shapes.some((s) => !s.e || s.e.includes(era));
}
/** The kinds offered in an era. */
export const wildsKindsAt = (module: WildsLikeModule, era: WildsEra): WildsKind[] => wildsKinds(module).filter((k) => wildsKindLive(module, k.key, era));

const PLURAL_POOLS = new Set<string>();

// ── Options and results ─────────────────────────────────────────────────────

export interface WildsOptions {
  module: WildsLikeModule;
  culture?: string;
  /** A kind key; undefined is Any. */
  kind?: string;
  /** Place modules split brief §6: with kind Any, only kinds of this class are drawn; absent is every class. */
  kindClass?: PlaceClass;
  era?: WildsEra;
  where?: WildsWhere;
  fantastic?: boolean;
  /** A place-shape region code; undefined is all of Britain. */
  region?: string;
  /** A biome id; undefined is any land. */
  biome?: string;
  tone?: GroupToneChoice;
  people?: GroupPeople;
  series?: boolean;
  count: number;
  seed?: number;
  safeguards?: GroupSafeguards;
  vocab?: Vocabulary;
  /** Tests: only this shape (its pattern). */
  shape?: string;
  /** §10.4: settlement names asks for purpose-built settlements only (no native branch). */
  purposeBuiltOnly?: boolean;
  /** §10.2: the settlement names size (a letter of `h v t c g`); only shapes suiting it are drawn. Kind is forced to settlement. */
  settlementSize?: string;
  /** Wizard retirement brief §5: the biome lists and lookups (a pack can replace a built-in); the built-ins when absent. */
  catalogue?: BiomeCatalogue;
}

// ── Town stems (§4.1) ───────────────────────────────────────────────────────

const FEATURE_STOP = "Hill Hills Ridge Edge Island Isle Isles Marsh Marshes Fen Fens Moor Moors Lake Mere Pool Pond Water Waters River Brook Beck Burn Dale Valley Vale Wood Woods Forest Heath Down Downs Pass Gap Bank Bay Shore Cape Point Head Ness Cliff Cliffs Crag Rock Rocks Stone Stones Holm Spring Springs Well Wells Mound Knoll Slope Spur Top Moss Mount Mountain Mountains Peak Glen Combe Fell Tor Gorge Field Fields Meadow Meadows Plain Plains Common Wash Creek Sands Dune Dunes Oasis Grove Copse Clearing Glade Lawn Hollow Cove Sound Bottom Bottoms Barrow Cave Caves Fjord Waterfall Falls Paddy Mouth Source";
const HABITATION_STOP = "Village Town City Market Manor Farm Cottages Cottage Enclosure County District Prefecture Fort Fortress Camp Homestead Estate Court Hall House Houses Temple Church Chapel Minster Abbey Priory Castle Palace Mansion Seat Station Post Harbour Port Haven Landing";
const STOP_WORDS = new Set(`${FEATURE_STOP} ${HABITATION_STOP}`.toLowerCase().split(" "));
const isStopWord = (w: string) => STOP_WORDS.has(w.toLowerCase());
const letters = (w: string) => Array.from(w.replace(/[^\p{L}]/gu, "")).length;
const capitalised = (w: string) => /^\p{Lu}/u.test(w);

/** §4.1: a stem's weight (one word ×3, two words ×1, for non-British sources only), or 0 when it isn't a stem. */
export function stemWeight(name: string, british: boolean): number {
  if (name.includes("[") || name.includes("'") || name.includes("’")) return 0;
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    const w = words[0];
    const l = w.toLowerCase();
    if (!capitalised(w) || letters(w) > 10) return 0;
    if (isStopWord(w) || (l.endsWith("s") && STOP_WORDS.has(l.slice(0, -1)))) return 0;
    if (/(village|hamlet|homestead|headland|pasture)$/.test(l) || ["moot", "bath", "isthmus"].some((x) => l === x || l === `${x}s`)) return 0;
    return 3;
  }
  if (words.length === 2 && !british) {
    if (!words.every(capitalised) || words[0].toLowerCase() === "the" || isStopWord(words[1])) return 0;
    return 1;
  }
  return 0;
}

// Cached per catalogue: the British stems come from British place names, which a pack replacing Britain changes.
const STEM_POOLS = new WeakMap<BiomeCatalogue, Map<string, [string, number][]>>();

/** §4.1: the cached stem pool for a stem source ("britain" or a world culture) and, for Britain, a region. */
export function wildsStemPool(source: string, region?: string, catalogue: BiomeCatalogue = BUILT_IN_BIOMES): [string, number][] {
  const key = `${source}|${region ?? ""}`;
  let pools = STEM_POOLS.get(catalogue);
  if (!pools) STEM_POOLS.set(catalogue, (pools = new Map()));
  let pool = pools.get(key);
  if (!pool) {
    const names = generateSettlementNames({ setting: "native", culture: source, size: "village", count: 2000, seed: 1789, region: source === "britain" ? region : undefined, wilds: false, catalogue }).names.map((n) => n.text);
    const seen = new Set<string>();
    pool = [];
    for (const name of names) {
      const w = stemWeight(name, source === "britain");
      if (w > 0 && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        pool.push([name, w]);
      }
    }
    pools.set(key, pool);
  }
  return pool;
}

/** §4.1: a culture's stem source, or undefined for Greek & Byzantine, steppe, Polynesian and Andean. */
export const stemSourceOf = (culture: RouteCulture): string | undefined => (culture.sensitive ? undefined : townSource(culture.key));

/** §4.1: the resolved biome's one-word wild animals and trees, title case: the fallback stems. */
export function biomeStems(biome: Biome): string[] {
  const out: string[] = [];
  for (const list of ["wildAnimals", "trees"] as BiomeList[])
    for (const [word] of biomeWords(biome, list)) {
      const title = biomeTitleCase(word.toLowerCase());
      if (!/\s/.test(title) && !title.includes("'") && !isStopWord(title) && !out.includes(title)) out.push(title);
    }
  return out;
}

/** The literal words of a pattern (what the `{town}` stem stands beside), lower case. */
const literalWords = (pattern: string): string[] => pattern.replace(/\{[^}]*\}/g, " ").toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);

/** §4.1 clash guard: the stem's last word, or its fused ending, repeats the shape's generic. */
function clashes(stem: string, generics: string[]): boolean {
  const words = stem.toLowerCase().split(/\s+/);
  const last = words[words.length - 1];
  return generics.some((g) => words.includes(g) || (g.length >= 3 && last.endsWith(g)));
}

/** Test seam (§16.5): called with the settlement names options each time the native branch asks for a batch. */
export const wildsHooks: { onNativeCall?: (options: SettlementNamesOptions) => void } = {};

/**
 * §10.1: the terrain modules a settlement names terrain and biome send names to, with weights; undefined for
 * any other terrain. `biome` is the biome id, "britain" for the British default, or undefined for none.
 */
export function wildsModulesForTerrain(terrain: string | undefined, biome: string | undefined): [WildsModule, number][] | undefined {
  const row = WILDS_DATA.settlementLink.terrainToModule.find((t) => t.terrain === terrain);
  if (!row) return undefined;
  const split = biome ? row.split?.[biome] : undefined;
  if (split) return Object.entries(split).map(([m, w]): [WildsModule, number] => [m as WildsModule, w]);
  return [[(biome && row.byBiome?.[biome]) || row.module, 1]];
}

/** The settlement names size keys as the data's size letters. */
export const SIZE_LETTER: Record<string, string> = { any: "any", hamlet: "h", village: "v", town: "t", city: "c", great: "g" };

/** §9.4: what the native branch asks settlement names for, or undefined where it isn't available. */
export function nativeSettlementRequest(
  module: WildsLikeModule,
  culture: string,
  era: WildsEra,
  where: WildsWhere,
  region: string | undefined,
  chosenBiome: string | undefined,
  mode: GroupPeople,
  catalogue: BiomeCatalogue = BUILT_IN_BIOMES,
): SettlementNamesOptions | undefined {
  const link = WILDS_DATA.settlementLink;
  if (mode === "placeholders" || era === "NF" || era === "IS") return undefined;
  // Focused place modules delegate their settlements through the sources instead.
  if (isPlaceModule(module)) return undefined;
  const land = link.nativeLand[module];
  const biome = chosenBiome ?? land.biomeIfUnset;
  const base = { size: "any" as const, count: 0, terrain: land.terrain, biome, wilds: false };
  if (where === "new" || where === "settled") {
    const tradition = link.cultureToColonial[culture];
    return tradition ? { ...base, setting: where === "new" ? "new-lands" : "settled-lands", tradition: tradition === "general" ? undefined : tradition } : undefined;
  }
  if (isBritishCulture(culture) || culture === "general") return { ...base, setting: "native", culture: "britain", region: isBritishCulture(culture) ? region : undefined };
  const worldCulture = WORLD_CULTURES.find((c) => c.id === culture);
  if (!worldCulture) return undefined;
  const eras = worldCulture.eras.filter((e) => e.id !== INTERSTELLAR_ERA);
  const match = eras.find((e) => link.worldEraToRoute[culture]?.[e.id] === era) ?? eras[0];
  return { ...base, setting: "native", culture, era: match?.id, biome: undefined, customBiome: biome ? catalogue.find(biome) : undefined };
}

export interface WildsName {
  text: string;
  kind: string;
  shape: string;
  era: WildsEra;
  tones: GroupTone[];
  words: { pool: string; word: string }[];
  anchored?: boolean;
  /** §9.1: where a settlement name came from. */
  source?: "purpose-built" | "native";
}

export interface WildsBatch {
  names: WildsName[];
  seed: number;
  notices: string[];
}

// ── Drawing ─────────────────────────────────────────────────────────────────

interface Ctx {
  rng: () => number;
  module: WildsLikeModule;
  culture: RouteCulture;
  era: WildsEra;
  setting: GroupSetting;
  fantastic: boolean;
  where: WildsWhere;
  /** A British culture in home country, not deserts: the region tags apply and the Britain biome is used. */
  homeBritish: boolean;
  region?: string;
  /** The resolved biome (§3.4). */
  biome: Biome;
  /** Whether the biome tags apply (every case but the Britain rule). */
  biomeTags: boolean;
  mode: GroupPeople;
  tone: GroupToneChoice;
  catalogue: BiomeCatalogue;
  vocab: Vocabulary;
  shape?: { p: string };
  drawn: Set<GroupTone>;
  words: { pool: string; word: string }[];
  /** §12: the series' anchor, and whether this name has taken (or declined) one yet. */
  anchor?: string;
  anchorDecided: boolean;
  anchored: boolean;
  forceAnchor: boolean;
  /** §4.1: the batch's town stems. */
  stems: Stems;
  /** The literal words of the pattern being rendered, for the clash guard. */
  generics: string[];
}

/** §4.1: where `{town}` stems come from in this batch. */
interface Stems {
  pool: [string, number][];
  extras: string[];
  /** Fewer than 20 stems: biome animals and trees join, and `twn` shapes are ×0.5. */
  thin: boolean;
  /** No stem source: the filtered `routePlace` draw. */
  route: boolean;
}

const LIGHT_OR_GRIM = (t: readonly string[] | undefined) => !!t && (t.includes("light") || t.includes("grim"));
const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
const MEAN_CACHE = new Map<string, number>();

/** §3.3: a region tag's multiplier; the mean of its 12 values with no region chosen. */
function regionMult(ctx: Ctx, tag: string | undefined): number {
  if (!tag || !ctx.homeBritish) return 1;
  const row = wildsDataOf(ctx.module).regionTags[tag];
  if (!row) return 1;
  if (ctx.region) return row[ctx.region] ?? 1;
  let mean = MEAN_CACHE.get(tag);
  if (mean === undefined) {
    mean = WILDS_DATA.regions.reduce((n, code) => n + (row[code] ?? 1), 0) / WILDS_DATA.regions.length;
    MEAN_CACHE.set(tag, mean);
  }
  return mean;
}

/** §3.4: a biome tag's multiplier for the resolved biome; 1 under the Britain rule. */
function biomeMult(ctx: Ctx, tag: string | undefined): number {
  if (!tag || !ctx.biomeTags) return 1;
  return wildsDataOf(ctx.module).biomeTags[tag]?.[ctx.biome.id] ?? 1;
}

/** A pool's words here: culture, era, fantastic, tone, region and biome; never light or grim for the sensitive cultures. */
function vocabPool(ctx: Ctx, pool: string): [VocabEntry, number][] {
  return poolEntries(ctx.vocab, pool, { culture: ctx.culture.key, era: ctx.era, fantastic: ctx.fantastic })
    .filter(([e]) => !(ctx.culture.sensitive && LIGHT_OR_GRIM(e.t)))
    .map(([e, w]): [VocabEntry, number] => [e, w * toneFactor(e.t ?? [], ctx.tone) * regionMult(ctx, e.rt) * biomeMult(ctx, e.bt)])
    .filter(([, n]) => n > 0);
}

function drawEntry(ctx: Ctx, pool: string): VocabEntry | undefined {
  const e = pickWeighted(vocabPool(ctx, pool), ctx.rng);
  if (!e) return undefined;
  for (const t of e.t ?? []) ctx.drawn.add(t);
  ctx.words.push({ pool, word: e.w });
  return e;
}

/** §3.4: the resolved biome, and whether its tags apply. */
export function resolveWildsBiome(
  module: WildsLikeModule,
  culture: string,
  where: WildsWhere,
  chosen: string | undefined,
  catalogue: BiomeCatalogue = BUILT_IN_BIOMES,
): { biome: Biome; tags: boolean; homeBritish: boolean } {
  const data = wildsDataOf(module).modules[module];
  // A pack that replaces Britain is the home country's land, as it is British place names' (wizard retirement brief §5.2).
  if (showsWildsRegion(module, culture, where)) return { biome: catalogue.find("britain") ?? BRITAIN, tags: false, homeBritish: true };
  const offered = wildsBiomes(module, catalogue);
  const pick = (id: string | undefined) => (id ? offered.find((b) => biomeMatches(b, id)) : undefined);
  const biome = pick(chosen) ?? pick(WILDS_DATA.homeland[culture]) ?? pick(data.defaultBiome)!;
  return { biome, tags: true, homeBritish: false };
}

/** §4: `{god}`: the culture's world gods, else the deities module's titles (never the sensitive cultures). */
function godName(ctx: Ctx): string | undefined {
  if (ctx.culture.sensitive) return undefined;
  const world = godNames(ctx.culture.key);
  if (world.length > 0) return pickOne(world, ctx.rng);
  const hooks = deityHooks();
  if (!hooks || !hooks.cultureOffered(ctx.culture.key)) return undefined;
  return hooks.deityTitle({ culture: ctx.culture.key, era: ctx.era, fantastic: ctx.fantastic, tone: ctx.tone, rng: ctx.rng, vocab: ctx.vocab });
}

const godAvailable = (ctx: Ctx) => !ctx.culture.sensitive && (godNames(ctx.culture.key).length > 0 || !!deityHooks()?.cultureOffered(ctx.culture.key));

/** §4: `{river}`: a bare river from the river engine, set by the country. */
function riverName(ctx: Ctx): string | undefined {
  if (ctx.mode === "placeholders") return "[river]";
  const setting: RiverSetting = ctx.homeBritish ? "british" : ctx.where === "new" ? "new-land" : "established";
  const text = riverFill({ setting, region: ctx.homeBritish ? ctx.region : undefined }, ctx.rng)
    .replace(/\bRiver\b/gi, "")
    .replace(/^the /i, "")
    .replace(/\s+/g, " ")
    .trim();
  return text || undefined;
}

/** §12: the first `{town}` of a name takes the series' anchor 60% of the time (always for the parent name). */
function anchored(ctx: Ctx, free: () => string | undefined): string | undefined {
  if (ctx.anchor !== undefined && !ctx.anchorDecided) {
    ctx.anchorDecided = true;
    if (ctx.forceAnchor || ctx.rng() < 0.6) {
      ctx.anchored = true;
      return ctx.anchor;
    }
  }
  return free();
}

/** §4.1: one `{town}` stem; the biome fallback when nothing fits. */
function drawStem(ctx: Ctx, guard: boolean): string | undefined {
  const st = ctx.stems;
  for (let i = 0; i < 10; i++) {
    let stem: string | undefined;
    if (st.route) {
      const t = routePlace(ctx.culture.key, ctx.setting, ctx.rng, ctx.catalogue);
      stem = t && stemWeight(t, false) > 0 ? t : undefined;
    } else {
      const entries: [string, number][] = st.thin ? [...st.pool, ...st.extras.map((e): [string, number] => [e, 1])] : st.pool;
      stem = pickWeighted(entries, ctx.rng);
    }
    if (stem && !(guard && clashes(stem, ctx.generics))) return stem;
  }
  return st.extras.length > 0 ? pickOne(st.extras, ctx.rng) : undefined;
}

function listWord(ctx: Ctx, list: string): string | undefined {
  const items = groupListWords(list, ctx.setting, "any")
    .filter(([w]) => !(ctx.culture.sensitive && LIGHT_OR_GRIM(wordTones(list, w))))
    .map(([w, n]): [string, number] => [w, n * toneFactor(wordTones(list, w), ctx.tone)])
    .filter(([, n]) => n > 0);
  const w = pickWeighted(items, ctx.rng);
  if (w === undefined) return undefined;
  for (const t of wordTones(list, w)) ctx.drawn.add(t);
  ctx.words.push({ pool: list, word: w });
  return w;
}

/** §4: a word from the resolved biome's lists (weighted across the lists), title case with its plural. */
function biomeWord(ctx: Ctx, lists: Record<string, number>): VocabEntry | undefined {
  const entries: [VocabEntry, number][] = [];
  for (const [list, share] of Object.entries(lists)) {
    const words = biomeWords(ctx.biome, list as BiomeList);
    const total = words.reduce((n, [, w]) => n + w, 0);
    if (total === 0) continue;
    for (const [word, w] of words) {
      const lowered = word.toLowerCase();
      entries.push([{ w: biomeTitleCase(lowered), pl: biomeTitleCase(pluralOf(lowered)) }, (share * w) / total]);
    }
  }
  const e = pickWeighted(entries, ctx.rng);
  if (e) ctx.words.push({ pool: "biome", word: e.w });
  return e;
}

const biomeHas = (ctx: Ctx, lists: Record<string, number>) => Object.keys(lists).some((l) => biomeWords(ctx.biome, l as BiomeList).length > 0);

/** §4: `{beast}` 60% from the module's creature pool, 40% from the biome; `{tree}` 50/50; `{stock}` the biome's livestock. */
function creature(ctx: Ctx, name: "beast" | "tree" | "stock"): VocabEntry | undefined {
  const src = WILDS_DATA.sources[name];
  const pool = name === "beast" ? wildsDataOf(ctx.module).beastPools[ctx.module] : name === "tree" ? "wildTree" : undefined;
  const poolLive = !!pool && vocabPool(ctx, pool).length > 0;
  const biomeLive = biomeHas(ctx, src.biomeLists);
  if (!pool) return biomeLive ? biomeWord(ctx, src.biomeLists) : undefined;
  const fromPool = (src as { pool: number }).pool;
  if (poolLive && (!biomeLive || ctx.rng() < fromPool)) return drawEntry(ctx, pool);
  return biomeLive ? biomeWord(ctx, src.biomeLists) : undefined;
}

const PLACEHOLDER = (name: string) => `[${name}]`;

/** The special sources a shape's tokens may name; everything else is a pool. */
const SOURCES = new Set(["town", "number", "folk", "person", "kingdom", "holy", "god", "river", "beast", "tree", "stock"]);

/** One token's text, before its modifier (§4). */
function token(ctx: Ctx, name: string): VocabEntry | string | undefined {
  const rng = ctx.rng;
  const placeholders = ctx.mode === "placeholders";
  if (name.startsWith("@")) return featureRef(ctx, name.slice(1));
  switch (name) {
    case "town": {
      const free = () => (placeholders ? "[place]" : drawStem(ctx, true));
      const t = anchored(ctx, free);
      if (t) ctx.words.push({ pool: "town", word: t });
      return t;
    }
    case "number":
      return listWord(ctx, "number");
    case "folk":
      return placeholders ? PLACEHOLDER("folk") : routeFolk(ctx.culture.key, rng, ctx.catalogue);
    case "person": {
      if (placeholders) return PLACEHOLDER("person");
      const names = personNames(ctx.culture.key);
      return names.length > 0 ? pickOne(names, rng) : undefined;
    }
    case "kingdom":
      return placeholders ? PLACEHOLDER("kingdom") : routeKingdom(ctx.culture.key, ctx.era, rng, ctx.catalogue);
    case "holy":
      return placeholders ? "[holy person]" : groupSaint(ctx.setting, rng);
    case "god":
      return placeholders ? "[deity]" : godName(ctx);
    case "river":
      return riverName(ctx);
    case "beast":
    case "tree":
    case "stock":
      return creature(ctx, name);
  }
  return drawEntry(ctx, name);
}

const plural = (e: VocabEntry) => e.pl ?? biomeTitleCase(pluralOf(e.w.toLowerCase()));

/** Renders a pattern's tokens; undefined when one has nothing to offer. A nested pattern (a `{@kind}`) shares its name's anchor. */
function renderPattern(ctx: Ctx, pattern: string, nested = false): string | undefined {
  if (!nested) {
    ctx.anchorDecided = false;
    ctx.anchored = false;
  }
  const outer = ctx.generics;
  ctx.generics = literalWords(pattern);
  let failed = false;
  const out = pattern.replace(/\{([^}]+)\}/g, (_m, raw: string) => {
    if (failed) return "";
    const [name, mod] = raw.split(":");
    const piece = token(ctx, name);
    if (piece === undefined || piece === "") {
      failed = true;
      return "";
    }
    const entry = typeof piece === "string" ? undefined : piece;
    const text = typeof piece === "string" ? piece : piece.w;
    if (mod === "pl") return entry ? plural(entry) : text;
    if (mod === "poss") return groupPossessive(text, PLURAL_POOLS.has(name));
    return text;
  });
  ctx.generics = outer;
  return failed ? undefined : out;
}

// ── Safeguards (§13) ────────────────────────────────────────────────────────

const stripThe = (s: string) => s.replace(/^the /, "");

function blockSet(module: WildsLikeModule, guards?: GroupSafeguards): Set<string> {
  const phrases = [...wildsDataOf(module).safeguards[module], ...(guards?.block ?? []), ...(guards?.flagListBlocks ? guards.flag : [])];
  const set = new Set<string>();
  for (const p of phrases) {
    const n = routeNorm(p);
    set.add(n);
    set.add(stripThe(n));
  }
  return set;
}

export function wildsBlocked(module: WildsLikeModule, text: string, guards?: GroupSafeguards): boolean {
  const set = blockSet(module, guards);
  const n = routeNorm(text);
  return set.has(n) || set.has(stripThe(n));
}

const BANNED = new Set(WILDS_DATA.safeguards.bannedWords.map((w) => w.toLowerCase()));
const hasWildsBanned = (text: string) => text.toLowerCase().split(/[^\p{L}']+/u).some((w) => BANNED.has(w));

/** A pack word the safeguards drop (blocked whole, or holding a banned word). */
export const wildsWordBlocked = (word: string, guards?: GroupSafeguards) => breaksRouteWords(word) || hasWildsBanned(word) || WILDS_MODULES.some((m) => wildsBlocked(m, word, guards));

export function defaultWildsSafeguards(module: WildsLikeModule): GroupSafeguards {
  return { block: wildsDataOf(module).safeguards[module], flag: [], flagListBlocks: false };
}

// ── Plans (shapes with their weights) ───────────────────────────────────────

interface Plan {
  kind: string;
  shape: WildsShape;
}

const tokensOf = (p: string) => [...p.matchAll(/\{([^}:]+)/g)].map((m) => m[1]);

/** Whether every token of a shape has something to offer here. */
function tokensLive(ctx: Ctx, p: string): boolean {
  for (const t of tokensOf(p)) {
    if (t.startsWith("@")) continue;
    if (SOURCES.has(t)) {
      if (t === "god" && ctx.mode === "invented" && !godAvailable(ctx)) return false;
      if (t === "god" && ctx.mode === "placeholders" && ctx.culture.sensitive) return false;
      if (t === "god" && ctx.mode === "placeholders" && godNames(ctx.culture.key).length === 0 && !deityHooks()?.cultureOffered(ctx.culture.key)) return false;
      if (t === "person" && ctx.mode === "invented" && personNames(ctx.culture.key).length === 0) return false;
      if (t === "holy" && !cultureAllowed(["christian"], ctx.culture.key, ctx.era)) return false;
      if (t === "beast" || t === "tree" || t === "stock") {
        const src = WILDS_DATA.sources[t];
        const pool = t === "beast" ? wildsDataOf(ctx.module).beastPools[ctx.module] : t === "tree" ? "wildTree" : undefined;
        if (!(pool && vocabPool(ctx, pool).length > 0) && !biomeHas(ctx, src.biomeLists)) return false;
      }
      continue;
    }
    if (vocabPool(ctx, t).length === 0) return false;
  }
  return true;
}

/** §3: a shape's weight here (0 when it can't be drawn). */
function shapeWeight(ctx: Ctx, s: WildsShape, hardOnly = false): number {
  const c = ctx.culture;
  if (s.e && !s.e.includes(ctx.era)) return 0;
  if (!cultureAllowed(s.c, c.key, ctx.era)) return 0;
  if (s.h !== undefined && s.h !== ctx.fantastic) return 0;
  if (c.sensitive && (s.h || LIGHT_OR_GRIM(s.t))) return 0;
  if (!tokensLive(ctx, s.p)) return 0;
  if (hardOnly) return s.w;
  const D = wildsDataOf(ctx.module);
  const cm = D.cultureMult[c.key] ?? {};
  const family = (cm[s.f] ?? 1) * (s.of ? cm.of ?? 1 : 1);
  const where = (D.where[s.f]?.[ctx.where] ?? 1) * (s.f === "twn" && ctx.stems.thin ? 0.5 : 1);
  const era = D.eraMult[s.f]?.[ctx.era] ?? 1;
  const extra = (s.cx?.[c.key] ?? 1) * (ctx.where !== "home" ? s.nx ?? 1 : 1);
  return s.w * family * where * era * extra * regionMult(ctx, s.rt) * biomeMult(ctx, s.bt) * toneFactor(s.t ?? [], ctx.tone);
}

// ── Feature references (§9.3) ───────────────────────────────────────────────

/** Plans of the module's kinds, made lazily for the context in use. */
const REF_CACHE = new WeakMap<Ctx, Map<string, [Plan, number][]>>();

function refPlans(ctx: Ctx, kind: string): [Plan, number][] {
  let byKind = REF_CACHE.get(ctx);
  if (!byKind) {
    byKind = new Map();
    REF_CACHE.set(ctx, byKind);
  }
  let found = byKind.get(kind);
  if (!found) {
    found = kindShapes(ctx, kind)
      .filter((s) => !s.of && !s.p.startsWith("The ") && !s.p.includes("{river}") && !s.p.includes("{@") && s.f !== "set")
      .map((s): [Plan, number] => [{ kind, shape: s }, shapeWeight(ctx, s)])
      .filter(([, w]) => w > 0);
    byKind.set(kind, found);
  }
  return found;
}

/** `{@kind}`: a feature name of another kind of the same module, at most two words (§9.3). */
function featureRef(ctx: Ctx, kind: string): string | undefined {
  const plans = refPlans(ctx, kind);
  if (plans.length === 0) return undefined;
  for (let i = 0; i < 10; i++) {
    const plan = pickWeighted(plans, ctx.rng);
    if (!plan) return undefined;
    const raw = renderPattern(ctx, plan.shape.p, true);
    if (!raw) continue;
    const text = routeCapitals(raw);
    if (text.split(" ").length <= 2) {
      ctx.words.push({ pool: `@${kind}`, word: text });
      return text;
    }
  }
  return undefined;
}

/** A kind's shapes: its own, the culture's, and (settlement) the module's dual-use shapes at half weight (§9.2). */
function kindShapes(ctx: Ctx, kind: string): WildsShape[] {
  const module = ctx.module;
  const D = wildsDataOf(module);
  const own = [...(D.shapes[module][kind] ?? []), ...D.cultureShapes.filter((s) => s.module === module && s.kind === kind && s.culture === ctx.culture.key)];
  if (kind !== "settlement") return own;
  const dual: WildsShape[] = [];
  for (const [k, shapes] of Object.entries(D.shapes[module])) {
    if (k === "settlement") continue;
    for (const s of shapes) if (s.st) dual.push({ ...s, w: s.w / 2, sz: s.st });
  }
  return [...own, ...dual];
}

// ── Batches ─────────────────────────────────────────────────────────────────

/** §7: a batch of unique names for one of the six modules. */
export function generateWildsNames(options: WildsOptions): WildsBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const notices: string[] = [];
  const module = options.module;
  const D = wildsDataOf(module);
  const data = D.modules[module];
  const culture = findWildsCulture(options.culture) ?? findWildsCulture(wildsDefaultCulture(module))!;
  const era: WildsEra = data.eras.includes(options.era as WildsEra) ? options.era! : "MD";
  const where: WildsWhere = options.where === "new" || options.where === "settled" ? options.where : "home";
  const fantastic = !!options.fantastic;
  const resolved = resolveWildsBiome(module, culture.key, where, options.biome, options.catalogue);
  const homeBritish = resolved.homeBritish;
  const region = homeBritish && options.region && options.region !== "all" ? options.region : undefined;
  const mode: GroupPeople = options.people ?? "placeholders";
  const count = Math.max(0, Math.floor(options.count));
  const block = blockSet(module, options.safeguards);
  const forcedKind = options.settlementSize ? "settlement" : options.kind;
  // §4.1: the batch's town stems.
  const source = stemSourceOf(culture);
  const pool = source ? wildsStemPool(source, homeBritish ? region : undefined, options.catalogue) : [];
  const stems: Stems = { pool, extras: biomeStems(resolved.biome), thin: !!source && pool.length < 20, route: !source };

  const newCtx = (): Ctx => ({
    rng,
    module,
    culture,
    era,
    setting: routeSetting(era, fantastic),
    fantastic,
    where,
    homeBritish,
    region,
    biome: resolved.biome,
    biomeTags: resolved.tags,
    mode,
    tone: options.tone ?? "any",
    vocab: options.vocab ?? BUILT_IN_VOCAB,
    catalogue: options.catalogue ?? BUILT_IN_BIOMES,
    drawn: new Set(),
    words: [],
    anchorDecided: false,
    anchored: false,
    forceAnchor: false,
    stems,
    generics: [],
  });

  /** §10.2: a settlement size filter keeps only the shapes suiting it. */
  const sizeOk = (s: WildsShape) => !options.settlementSize || options.settlementSize === "any" || (s.sz ?? "").includes(options.settlementSize);

  /** The live plans of each kind, made once. */
  let planCache: Map<string, [Plan, number][]> | undefined;
  const plans = (): Map<string, [Plan, number][]> => {
    if (planCache) return planCache;
    planCache = new Map();
    const ctx = newCtx();
    for (const kind of data.kinds) {
      const live = kindShapes(ctx, kind.key)
        .filter((s) => !options.shape || s.p === options.shape)
        .filter((s) => kind.key !== "settlement" || sizeOk(s))
        .map((s): [Plan, number] => [{ kind: kind.key, shape: s }, shapeWeight(ctx, s)])
        .filter(([, w]) => w > 0);
      if (live.length > 0) planCache.set(kind.key, live);
    }
    return planCache;
  };

  const chosenKind = forcedKind ? findWildsKind(module, forcedKind) : undefined;
  if (forcedKind && !chosenKind) notices.push(`Kind “${forcedKind}” isn't offered here.`);

  /** §3.5: kind weights with kind Any. */
  const kindWeights = (): [string, number][] => {
    const base: [string, number][] = [];
    for (const k of data.kinds) {
      // A kind with sources (a delegated river kind has no shapes of its own) needs no live shape.
      if (!plans().has(k.key) && !k.sources) continue;
      if (!kindInClass(k, options.kindClass)) continue;
      let w = k.weight;
      const id = `${module}.${k.key}`;
      if (homeBritish) w *= D.kindMult.britishHome[id] ?? 1;
      else {
        const tag = D.kindMult.biome[id];
        if (tag) w *= D.biomeTags[tag]?.[resolved.biome.id] ?? 1;
      }
      if (w > 0) base.push([k.key, w]);
    }
    return base;
  };

  /** §7: when no kind is live, the module's untagged shapes. */
  const fallbackPlans = (): [Plan, number][] => {
    const ctx = newCtx();
    return Object.entries(D.shapes[module]).filter(([kind]) => kindInClass(findWildsKind(module, kind) ?? {}, options.kindClass)).flatMap(([kind, shapes]) =>
      shapes.filter((s) => !s.rt && !s.bt && kind !== "settlement").map((s): [Plan, number] => [{ kind, shape: s }, shapeWeight(ctx, s, true)]).filter(([, w]) => w > 0),
    );
  };

  // §12: one anchor, a `{town}` value.
  let anchor: string | undefined;
  if (options.series) {
    if (mode === "placeholders") anchor = "[place]";
    else {
      const ctx = newCtx();
      for (let i = 0; i < 40 && !anchor; i++) anchor = drawStem(ctx, false);
    }
  }

  const acceptable = (text: string): boolean => {
    const counted = countedWords(text);
    if (counted.length === 0 || counted.length > WILDS_DATA.cap) return false;
    if (repeatsContent(counted)) return false;
    const n = routeNorm(text);
    if (block.has(n) || block.has(stripThe(n))) return false;
    if (breaksRouteWords(text) || hasBannedWord(text) || hasWildsBanned(text)) return false;
    return true;
  };

  // §9.4: the native branch, asked for once per batch, the first time it is needed.
  const nativeRequest = options.purposeBuiltOnly ? undefined : nativeSettlementRequest(module, culture.key, era, where, region, homeBritish ? undefined : options.biome, mode, options.catalogue);
  let nativeQueue: string[] | undefined;
  const nextNative = (): string | undefined => {
    if (!nativeRequest) return undefined;
    if (!nativeQueue) {
      const request: SettlementNamesOptions = { ...nativeRequest, count, seed: Math.floor(rng() * 0x100000000) >>> 0 };
      wildsHooks.onNativeCall?.(request);
      try {
        nativeQueue = generateSettlementNames(request).names.map((n) => n.text);
      } catch {
        nativeQueue = [];
      }
    }
    while (nativeQueue.length > 0) {
      const text = nativeQueue.shift()!;
      if (acceptable(text)) return text;
    }
    return undefined;
  };

  let first = true;

  /** One name from a kind's own live plans (the 20 tries the wild lands have always made), or undefined. */
  const drawFromList = (list: [Plan, number][], parent: boolean): WildsName | undefined => {
    for (let i = 0; i < 20; i++) {
      const ctx = newCtx();
      ctx.anchor = anchor;
      ctx.forceAnchor = parent;
      const plan = pickWeighted(list, rng);
      if (!plan) break;
      ctx.shape = plan.shape;
      const raw = renderPattern(ctx, plan.shape.p);
      if (!raw) continue;
      const text = routeCapitals(raw);
      if (!acceptable(text)) continue;
      const tones = new Set<GroupTone>([...(plan.shape.t ?? []), ...ctx.drawn]);
      return {
        text,
        kind: plan.kind,
        shape: plan.shape.p,
        era,
        tones: GROUP_TONES.filter((t) => tones.has(t)),
        words: ctx.words,
        ...(anchor !== undefined ? { anchored: ctx.anchored } : {}),
        ...(plan.kind === "settlement" ? { source: "purpose-built" as const } : {}),
      };
    }
    return undefined;
  };

  /** A kind's live plans; for the parent name of a series, the `{town}` shapes of its own. */
  const listFor = (kindKey: string | undefined, parent: boolean): [Plan, number][] | undefined => {
    let list: [Plan, number][] | undefined = kindKey ? plans().get(kindKey) : undefined;
    if (parent && list) {
      const twn = list.filter(([p]) => p.shape.f === "twn" && p.shape.p.includes("{town}"));
      if (twn.length > 0) list = twn;
    }
    return list;
  };

  const oneName = (): WildsName | undefined => {
    const parent = !!options.series && first && !chosenKind;
    for (let round = 0; round < 2; round++) {
      let kindKey: string | undefined;
      if (chosenKind) kindKey = chosenKind.key;
      else if (parent) kindKey = parentKindOf(module);
      else kindKey = pickWeighted(kindWeights(), rng);
      // Place modules split brief §4: a kind with sources first picks where the name comes from (src/places/sources.ts).
      const sourced = kindKey ? findWildsKind(module, kindKey)?.sources : undefined;
      if (kindKey && sourced) {
        let own: WildsName | undefined;
        const text = drawKind(sourced, { where, culture: culture.key, region, people: mode, series: !!options.series, rng }, () => {
          const list = listFor(kindKey, parent);
          own = list && list.length > 0 ? drawFromList(list, parent) : undefined;
          return own?.text;
        });
        if (text !== undefined) {
          if (own && (own as WildsName).text === text) return own;
          if (acceptable(text)) return { text, kind: kindKey, shape: "source", era, tones: [], words: [] };
        }
        if (chosenKind) return undefined;
        continue;
      }
      // §9.1: a settlement is native 40% of the time (the 0.6 draw is made before anything else for the name).
      if (kindKey === "settlement" && nativeRequest && rng() >= WILDS_DATA.settlementLink.purposeBuiltShare) {
        const text = nextNative();
        if (text) return { text, kind: "settlement", shape: "native", era, tones: [], words: [], source: "native" };
      }
      let list = listFor(kindKey, parent);
      if (!list || list.length === 0) {
        if (chosenKind) return undefined;
        const fallback = fallbackPlans();
        if (fallback.length === 0) return undefined;
        list = fallback;
        kindKey = undefined;
      }
      const name = drawFromList(list, parent);
      if (name) return name;
    }
    return undefined;
  };

  const seen = new Set<string>();
  const names: WildsName[] = [];
  for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
    const name = oneName();
    if (!name) {
      if (attempt > 200 && names.length === 0) break;
      continue;
    }
    const key = name.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
    first = false;
  }
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
  return { names, seed, notices };
}
