// Seas and coasts (docs/seas-and-coasts-brief.md): seas and lakes, coasts and islands, sea charts and
// hyperspace charts, one engine for all four. Follows route names' conventions (shapes with weight,
// era, culture, region and tone tags; shared pools in settlement-vocab.json; culture shapes; series)
// and reuses its places, peoples, kingdoms and capitals, the group engine's weighted draws and tone
// factor, the river and vessel engines, the star draw and the space safeguards. No Obsidian imports.

import watersData from "../data/waters.json";
import { pluralOf, biomeTitleCase, BIOMES } from "../biomes";
import { deityHooks } from "../deities/hook";
import {
  type GroupPeople,
  type GroupSafeguards,
  type GroupSetting,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  groupListWords,
  groupPerson,
  groupPossessive,
  groupSaint,
  hasBannedWord,
  ordinalText,
  pickWeighted,
  repeatsContent,
  toneFactor,
  wordTones,
} from "../groups/engine";
import { mulberry32 } from "../markov";
import { riverFill, type RiverSetting } from "../rivers/engine";
import { ROUTE_CULTURES, ROUTE_ERAS, routePlace, routeFolk, routeKingdom, routeSetting, personNames, godNames, countedWords, routeCapitals, routeNorm, breaksRouteWords, BRITISH_CULTURES, type RouteCulture, type RouteEra } from "../routes/engine";
import { hasSpaceBlock } from "../space/safeguards";
import { SPACE_DATA, type ScaleChoice, type SpaceScale } from "../space/scale";
import { dropStarWord, drawStarOfKind, type StarKind } from "../space/stars";
import { BUILT_IN_VOCAB, cultureAllowed, poolEntries, type VocabEntry, type Vocabulary } from "../settlement/vocab";
import { generateVesselNames } from "../vessels/engine";

// ── Data ────────────────────────────────────────────────────────────────────

export type WatersEarthly = "seasLakes" | "coastsIslands" | "seaCharts";
export type WatersModule = WatersEarthly | "hyperspaceCharts";
export const EARTHLY_MODULES: WatersEarthly[] = ["seasLakes", "coastsIslands", "seaCharts"];
export type WatersEra = RouteEra;
export type WatersWhere = "home" | "new";
export type HyperMedium = "sea" | "wind" | "both";
export type HyperRegister = "any" | "spacers" | "chart" | "survey";
/** §12.2: the scales hyperspace charts are drawn at (no planetary system). */
export type HyperScale = Exclude<SpaceScale, "Pl">;

export interface WatersShape {
  p: string;
  w: number;
  /** Family (§3.5). */
  f: string;
  of?: boolean;
  e?: WatersEra[];
  c?: string[];
  rt?: string;
  bt?: string;
  t?: GroupTone[];
  /** true: fantastic only; false: realistic only. */
  h?: boolean;
  /** Culture multipliers on the shape ("‹norse› ×5"). */
  cx?: Record<string, number>;
  /** §9.5: weight 0 on British home shores. */
  nb?: boolean;
  /** §9.6: a multiplier on new shores. */
  nx?: number;
}

export interface WatersKind {
  key: string;
  menu: string;
  plural: string;
  weight: number;
}

export interface HyperShape {
  p: string;
  w: number;
  /** Register: s spacers' words, c chart words, v survey words. */
  reg: "s" | "c" | "v";
  m?: "sea" | "wind";
  sc?: HyperScale[];
  t?: GroupTone[];
}

export interface HyperKind {
  key: string;
  menu: string;
  plural: string;
  scales: HyperScale[];
  weight: number;
}

interface WatersData {
  where: Record<string, { home: number; new: number }>;
  regions: string[];
  regionTags: Record<string, Record<string, number>>;
  biomeTags: Record<string, Record<string, number>>;
  cultureMult: Record<string, Record<string, number>>;
  eraMult: Record<string, Record<string, number>>;
  kindMult: { oceanHome: number; lakeHome: number };
  modules: Record<WatersEarthly, { any: string; eras: WatersEra[]; kinds: WatersKind[] }>;
  shapes: Record<WatersEarthly, Record<string, WatersShape[]>>;
  cultureShapes: (WatersShape & { culture: string; module: WatersEarthly; kind: string })[];
  hyper: {
    any: string;
    scaleWeights: Record<HyperScale, number>;
    register: Record<HyperRegister, Record<"s" | "c" | "v", number>>;
    kinds: HyperKind[];
    shapes: Record<string, HyperShape[]>;
  };
  safeguards: { earthly: string[]; hyper: string[] };
  cap: number;
}

export const WATERS_DATA = watersData as unknown as WatersData;
export const WATERS_CULTURES: RouteCulture[] = ROUTE_CULTURES;
export const findWatersCulture = (key: string | undefined) => WATERS_CULTURES.find((c) => c.key === key);
export const HYPER_ANY = WATERS_DATA.hyper.any;
export const HYPER_KINDS = WATERS_DATA.hyper.kinds;
export const HYPER_SCALES: HyperScale[] = ["Sy", "Nb", "Se", "Ga"];
export const WATERS_REGISTERS: { id: HyperRegister; text: string; label: string }[] = [
  { id: "any", text: "in any words", label: "any words" },
  { id: "spacers", text: "in spacers' words", label: "spacers' words" },
  { id: "chart", text: "in chart words", label: "chart words" },
  { id: "survey", text: "in survey words", label: "survey words" },
];
export const WATERS_MEDIA: { id: HyperMedium; text: string; label: string }[] = [
  { id: "sea", text: "like the sea", label: "like the sea" },
  { id: "wind", text: "like the wind", label: "like the wind" },
  { id: "both", text: "like the sea or the wind", label: "sea or wind" },
];

/** Whether a culture is one of the three British cultures. */
export const isBritishCulture = (culture: string) => BRITISH_CULTURES.includes(culture);

export const waterKinds = (module: WatersEarthly): WatersKind[] => WATERS_DATA.modules[module].kinds;
export const findWaterKind = (module: WatersEarthly, key: string | undefined) => waterKinds(module).find((k) => k.key === key);
export const waterEras = (module: WatersEarthly): WatersEra[] => WATERS_DATA.modules[module].eras;
export const waterAny = (module: WatersEarthly) => WATERS_DATA.modules[module].any;
export const findHyperKind = (key: string | undefined) => HYPER_KINDS.find((k) => k.key === key);
/** §12.5: the kinds offered at a scale (all of them at scale any). */
export const hyperKindsAt = (scale: ScaleChoice | undefined): HyperKind[] => (!scale || scale === "any" ? HYPER_KINDS : HYPER_KINDS.filter((k) => k.scales.includes(scale as HyperScale)));
export const watersEraLabel = (code: string) => ROUTE_ERAS.find((e) => e.code === code)?.label ?? code;

/** §2.2: the region link shows for the three British cultures on home shores. */
export const showsWatersRegion = (culture: string, where: WatersWhere) => isBritishCulture(culture) && where === "home";

/** §0: the module's fixed-name pool. */
export const FIXED_POOLS: Record<WatersModule, string> = {
  seasLakes: "watersFixed:seas",
  coastsIslands: "watersFixed:coasts",
  seaCharts: "watersFixed:charts",
  hyperspaceCharts: "watersFixed:hyperspace",
};
/** Fixed whole names are drawn as one more kind, at this weight against the kinds' 100. */
const FIXED_WEIGHT = 3;
/** §4: the pools that are plural nouns, for possessives ("Smugglers' Cove"). */
const PLURAL_POOLS = new Set(["coveFolk"]);
/** Hyperspace never reads the realspace space pools (§12.6). */
export const HYPER_FORBIDDEN_POOLS = ["spaceLand", "spacePrefix", "spaceHazard"];

// ── Options and results ─────────────────────────────────────────────────────

export interface WatersOptions {
  module: WatersModule;
  culture?: string;
  /** A kind key; undefined is Any. */
  kind?: string;
  era?: WatersEra;
  where?: WatersWhere;
  fantastic?: boolean;
  /** A place-shape region code; undefined is all of Britain. */
  region?: string;
  /** A biome id; undefined is any land. */
  biome?: string;
  tone?: GroupToneChoice;
  people?: GroupPeople;
  series?: boolean;
  /** Hyperspace only. */
  scale?: ScaleChoice;
  medium?: HyperMedium;
  register?: HyperRegister;
  count: number;
  seed?: number;
  /** Merged safeguard lists (blocks added to the module's own). */
  safeguards?: GroupSafeguards;
  vocab?: Vocabulary;
  /** Tests: only this shape (its pattern). */
  shape?: string;
}

export interface WatersName {
  text: string;
  kind: string;
  shape: string;
  era: WatersEra;
  tones: GroupTone[];
  /** Hyperspace: the scale the name was drawn at. */
  scale?: HyperScale;
  /** Every pool or source word drawn, with its pool (tests). */
  words: { pool: string; word: string }[];
  /** §13: whether the name holds one of the series' anchors. */
  anchored?: boolean;
}

export interface WatersBatch {
  names: WatersName[];
  seed: number;
  notices: string[];
}

// ── Drawing ─────────────────────────────────────────────────────────────────

interface Ctx {
  rng: () => number;
  module: WatersModule;
  hyper: boolean;
  culture: RouteCulture;
  era: WatersEra;
  setting: GroupSetting;
  fantastic: boolean;
  where: WatersWhere;
  /** A British culture on home shores: the region tags apply. */
  homeBritish: boolean;
  region?: string;
  biome?: string;
  mode: GroupPeople;
  tone: GroupToneChoice;
  vocab: Vocabulary;
  scale?: HyperScale;
  shape?: { p: string };
  drawn: Set<GroupTone>;
  words: { pool: string; word: string }[];
  stars: string[];
  /** §13: the series' anchors, and whether this name has taken (or declined) one yet. */
  anchors?: string[];
  anchorDecided: boolean;
  anchored: boolean;
}

const LIGHT_OR_GRIM = (t: readonly string[] | undefined) => !!t && (t.includes("light") || t.includes("grim"));
const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
const MEAN_CACHE = new Map<string, number>();

/** §3.3: a region tag's multiplier; the mean of its 12 values with no region chosen. */
function regionMult(ctx: Ctx, tag: string | undefined): number {
  if (!tag || !ctx.homeBritish) return 1;
  const row = WATERS_DATA.regionTags[tag];
  if (!row) return 1;
  if (ctx.region) return row[ctx.region] ?? 1;
  let mean = MEAN_CACHE.get(tag);
  if (mean === undefined) {
    mean = WATERS_DATA.regions.reduce((n, code) => n + (row[code] ?? 1), 0) / WATERS_DATA.regions.length;
    MEAN_CACHE.set(tag, mean);
  }
  return mean;
}

/** §3.4: a biome tag's multiplier, wherever the biome link shows and a biome is chosen. */
function biomeMult(ctx: Ctx, tag: string | undefined): number {
  if (!tag || ctx.homeBritish || !ctx.biome) return 1;
  return WATERS_DATA.biomeTags[tag]?.[ctx.biome] ?? 1;
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

/** §4: `{river}`: a bare river from the river engine, set by the shore. */
function riverName(ctx: Ctx): string | undefined {
  if (ctx.mode === "placeholders") return "[river]";
  const setting: RiverSetting = ctx.homeBritish ? "british" : ctx.where === "home" ? "established" : "new-land";
  const text = riverFill({ setting, region: ctx.homeBritish ? ctx.region : undefined }, ctx.rng)
    .replace(/\bRiver\b/gi, "")
    .replace(/^the /i, "")
    .replace(/\s+/g, " ")
    .trim();
  return text || undefined;
}

/** §4: the nearest vessel culture for a waters culture. */
const VESSEL_CULTURE: Record<string, string> = { polynesian: "hawaiian" };
/** The ships module's technology for an era. */
const SHIP_TECH: Record<WatersEra, string> = { AN: "T2", MD: "T3", EM: "T4", ST: "T5", MO: "T7", NF: "T7", IS: "T7" };
const SHIP_POOLS = new Map<string, string[]>();

/** §4: `{ship}`: one name from the vessel engine (explore vessels), without a prefix. */
function shipName(ctx: Ctx): string | undefined {
  if (ctx.mode === "placeholders") return "[ship]";
  const key = `${ctx.culture.key}|${ctx.era}|${ctx.fantastic}`;
  let pool = SHIP_POOLS.get(key);
  if (!pool) {
    const genre = ctx.era === "ST" || ctx.era === "MO" ? "modern" : ctx.era === "NF" || ctx.era === "IS" ? "scifi" : "fantasy";
    pool = generateVesselNames({
      module: "ships",
      culture: VESSEL_CULTURE[ctx.culture.key] ?? ctx.culture.key,
      function: "explore",
      technology: SHIP_TECH[ctx.era],
      genre,
      fantastic: ctx.fantastic,
      prefixes: false,
      people: "invented",
      count: 60,
      seed: 1789,
    })
      .names.map((n) => n.name.replace(/^(the )/i, ""))
      .filter((n) => !n.includes("["));
    SHIP_POOLS.set(key, pool);
  }
  return pool.length > 0 ? pickOne(pool, ctx.rng) : undefined;
}

/** §4: a star name at the chosen scale, proper and possessive kinds only, possessives without "Star". */
function starName(ctx: Ctx): string {
  const scale = ctx.scale ?? "Nb";
  const row = SPACE_DATA.stars.kindWeights[scale] ?? SPACE_DATA.stars.kindWeights.any;
  const kinds = (["proper", "possessive"] as StarKind[]).map((k): [StarKind, number] => [k, row[k] ?? 0]).filter(([, w]) => w > 0);
  const draw = (): string => {
    const kind = pickWeighted(kinds, ctx.rng) ?? "proper";
    const proper = () => {
      const words = groupListWords("star", "SF", scale).map(([w, n]): [string, number] => [w, n * toneFactor(wordTones("star", w), ctx.tone)]).filter(([, n]) => n > 0);
      return pickWeighted(words, ctx.rng) ?? "Vega";
    };
    return dropStarWord(drawStarOfKind(kind, ctx.rng, proper, { person: () => groupPerson("SF", false, ctx.rng) }));
  };
  let star = draw();
  for (let i = 0; i < 5 && ctx.stars.includes(star); i++) star = draw();
  return star;
}

/** §13: the first `{town}` or `{star}` of a name takes an anchor 60% of the time. */
function anchored(ctx: Ctx, free: () => string | undefined): string | undefined {
  if (ctx.anchors && !ctx.anchorDecided) {
    ctx.anchorDecided = true;
    if (ctx.rng() < 0.6) {
      ctx.anchored = true;
      return pickOne(ctx.anchors, ctx.rng);
    }
  }
  return free();
}

/** A group-names list word (numbers, space directions), tone-weighted. */
function listWord(ctx: Ctx, list: string): string | undefined {
  const items = groupListWords(list, ctx.setting, ctx.scale ?? "any")
    .filter(([w]) => !(ctx.culture.sensitive && LIGHT_OR_GRIM(wordTones(list, w))))
    .map(([w, n]): [string, number] => [w, n * toneFactor(wordTones(list, w), ctx.tone)])
    .filter(([, n]) => n > 0);
  const w = pickWeighted(items, ctx.rng);
  if (w === undefined) return undefined;
  for (const t of wordTones(list, w)) ctx.drawn.add(t);
  ctx.words.push({ pool: list, word: w });
  return w;
}

const PLACEHOLDER = (name: string) => `[${name}]`;

/** One token's text, before its modifier (§4). */
function token(ctx: Ctx, name: string): VocabEntry | string | undefined {
  const rng = ctx.rng;
  const placeholders = ctx.mode === "placeholders";
  switch (name) {
    case "town": {
      const free = () => (placeholders ? "[place]" : routePlace(ctx.culture.key, ctx.setting, rng));
      const t = anchored(ctx, free);
      if (t) ctx.words.push({ pool: "town", word: t });
      return t;
    }
    case "star": {
      const t = anchored(ctx, () => starName(ctx));
      if (t) {
        ctx.stars.push(t);
        ctx.words.push({ pool: "star", word: t });
      }
      return t;
    }
    case "spaceDirection":
      return listWord(ctx, "spaceDirection");
    case "number":
      return listWord(ctx, "number");
    case "folk":
      return placeholders ? PLACEHOLDER("folk") : routeFolk(ctx.culture.key, rng);
    case "person": {
      if (placeholders) return PLACEHOLDER("person");
      const names = personNames(ctx.culture.key);
      return names.length > 0 ? pickOne(names, rng) : undefined;
    }
    case "kingdom":
      return placeholders ? PLACEHOLDER("kingdom") : routeKingdom(ctx.culture.key, ctx.era, rng);
    case "holy":
      return placeholders ? "[holy person]" : groupSaint(ctx.setting, rng);
    case "god":
      return placeholders ? "[deity]" : godName(ctx);
    case "river":
      return riverName(ctx);
    case "ship":
      return shipName(ctx);
    case "ordinal": {
      const choices: [number, number][] = [];
      for (let n = 1; n <= 99; n++) choices.push([n, n <= 12 ? 3 : n <= 30 ? 1 : 0.2]);
      return ordinalText(pickWeighted(choices, rng)!);
    }
  }
  return drawEntry(ctx, name);
}

/** The special sources a shape's tokens may name; everything else is a pool. */
const SOURCES = new Set(["town", "star", "spaceDirection", "number", "folk", "person", "kingdom", "holy", "god", "river", "ship", "ordinal"]);

/** The title-cased plural of a pool word. */
const plural = (e: VocabEntry) => e.pl ?? biomeTitleCase(pluralOf(e.w.toLowerCase()));

/** Renders a pattern's tokens; undefined when one has nothing to offer. */
function renderPattern(ctx: Ctx, pattern: string): string | undefined {
  ctx.anchorDecided = false;
  ctx.anchored = false;
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
  return failed ? undefined : out;
}

// ── Safeguards (§14) ────────────────────────────────────────────────────────

const stripThe = (s: string) => s.replace(/^the /, "");

/** §14: exact phrases, with and without a leading "The". */
function blockSet(hyper: boolean, guards?: GroupSafeguards): Set<string> {
  const phrases = [...(hyper ? WATERS_DATA.safeguards.hyper : WATERS_DATA.safeguards.earthly), ...(guards?.block ?? []), ...(guards?.flagListBlocks ? guards.flag : [])];
  const set = new Set<string>();
  for (const p of phrases) {
    const n = routeNorm(p);
    set.add(n);
    set.add(stripThe(n));
  }
  return set;
}

export function watersBlocked(text: string, hyper: boolean, guards?: GroupSafeguards): boolean {
  const set = blockSet(hyper, guards);
  const n = routeNorm(text);
  return set.has(n) || set.has(stripThe(n));
}

/** A pack word the safeguards drop (blocked whole, or holding a banned word). */
export const watersWordBlocked = (word: string, guards?: GroupSafeguards) => watersBlocked(word, false, guards) || breaksRouteWords(word);

export function defaultWatersSafeguards(): GroupSafeguards {
  return { block: WATERS_DATA.safeguards.earthly, flag: [], flagListBlocks: false };
}

// ── Plans (shapes with their weights) ───────────────────────────────────────

interface Plan {
  kind: string;
  shape: WatersShape | HyperShape;
  /** Fixed whole names from the module's pool. */
  fixed?: boolean;
}

const tokensOf = (p: string) => [...p.matchAll(/\{([^}:]+)/g)].map((m) => m[1]);

/** Whether every token of a shape has something to offer here. */
function tokensLive(ctx: Ctx, p: string): boolean {
  for (const t of tokensOf(p)) {
    if (SOURCES.has(t)) {
      if (t === "god" && ctx.mode === "invented" && !godAvailable(ctx)) return false;
      if (t === "god" && ctx.mode === "placeholders" && ctx.culture.sensitive) return false;
      if (t === "god" && ctx.mode === "placeholders" && godNames(ctx.culture.key).length === 0 && !deityHooks()?.cultureOffered(ctx.culture.key)) return false;
      if (t === "person" && ctx.mode === "invented" && personNames(ctx.culture.key).length === 0) return false;
      if (t === "holy" && !cultureAllowed(["christian"], ctx.culture.key, ctx.era)) return false;
      continue;
    }
    if (vocabPool(ctx, t).length === 0) return false;
  }
  return true;
}

/** §3.3, §3.5: an earthly shape's weight here (0 when it can't be drawn). */
function earthlyWeight(ctx: Ctx, s: WatersShape, hardOnly = false): number {
  const c = ctx.culture;
  if (s.e && !s.e.includes(ctx.era)) return 0;
  if (!cultureAllowed(s.c, c.key, ctx.era)) return 0;
  if (s.h !== undefined && s.h !== ctx.fantastic) return 0;
  const british = isBritishCulture(c.key);
  // §3.3: home-British shapes are live for the British cultures on home shores only.
  if (s.c?.includes("british") && s.rt && british && ctx.where !== "home") return 0;
  if (s.nb && ctx.homeBritish) return 0;
  if (c.sensitive && (s.h || LIGHT_OR_GRIM(s.t))) return 0;
  if (!tokensLive(ctx, s.p)) return 0;
  if (hardOnly) return s.w;
  const cm = WATERS_DATA.cultureMult[c.key] ?? {};
  const family = (cm[s.f] ?? 1) * (s.of ? cm.of ?? 1 : 1);
  const where = WATERS_DATA.where[s.f]?.[ctx.where] ?? 1;
  const era = WATERS_DATA.eraMult[s.f]?.[ctx.era] ?? 1;
  const extra = (s.cx?.[c.key] ?? 1) * (ctx.where === "new" ? s.nx ?? 1 : 1);
  return s.w * family * where * era * extra * regionMult(ctx, s.rt) * biomeMult(ctx, s.bt) * toneFactor(s.t ?? [], ctx.tone);
}

/** §12.3: a hyperspace shape's weight here. */
function hyperWeight(ctx: Ctx, s: HyperShape, register: HyperRegister, medium: HyperMedium): number {
  const c = ctx.culture;
  if (s.sc && ctx.scale && !s.sc.includes(ctx.scale)) return 0;
  if (s.m && medium !== "both" && s.m !== medium) return 0;
  if (c.sensitive && LIGHT_OR_GRIM(s.t)) return 0;
  if (!tokensLive(ctx, s.p)) return 0;
  const cm = WATERS_DATA.cultureMult[c.key] ?? {};
  let family = 1;
  if (s.p.includes("{person")) family *= cm.per ?? 1;
  if (s.p.includes("{god")) family *= cm.god ?? 1;
  if (s.p.includes("{folk")) family *= cm.ppl ?? 1;
  if (s.p.includes("{holy")) family *= cm.sai ?? 1;
  return s.w * WATERS_DATA.hyper.register[register][s.reg] * family * toneFactor(s.t ?? [], ctx.tone);
}

// ── Batches ─────────────────────────────────────────────────────────────────

const SERIES_MODULES = new Set<WatersModule>(["coastsIslands", "seaCharts", "hyperspaceCharts"]);
/** Whether a module offers the series link (§0). */
export const watersHasSeries = (module: WatersModule) => SERIES_MODULES.has(module);

/** §7: a batch of unique names for one of the four modules. */
export function generateWatersNames(options: WatersOptions): WatersBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const notices: string[] = [];
  const module = options.module;
  const hyper = module === "hyperspaceCharts";
  const culture = findWatersCulture(options.culture) ?? findWatersCulture(hyper ? "general" : "norman-british")!;
  const earthlyModule = hyper ? undefined : (module);
  const eras = earthlyModule ? waterEras(earthlyModule) : (["IS"] as WatersEra[]);
  const era: WatersEra = eras.includes(options.era as WatersEra) ? options.era! : hyper ? "IS" : "MD";
  const where: WatersWhere = !hyper && options.where === "new" ? "new" : "home";
  const fantastic = !hyper && !!options.fantastic;
  const homeBritish = !hyper && isBritishCulture(culture.key) && where === "home";
  const region = homeBritish && options.region && options.region !== "all" ? options.region : undefined;
  const biome = !homeBritish && !hyper && options.biome && BIOMES.some((b) => b.id === options.biome) ? options.biome : undefined;
  const medium: HyperMedium = options.medium === "wind" || options.medium === "both" ? options.medium : "sea";
  const register: HyperRegister = WATERS_REGISTERS.some((r) => r.id === options.register) ? options.register! : "any";
  const mode: GroupPeople = options.people ?? "placeholders";
  const count = Math.max(0, Math.floor(options.count));
  const block = blockSet(hyper, options.safeguards);
  const chosenScale: HyperScale | undefined = hyper && HYPER_SCALES.includes(options.scale as HyperScale) ? (options.scale as HyperScale) : undefined;

  const newCtx = (scale?: HyperScale): Ctx => ({
    rng,
    module,
    hyper,
    culture,
    era,
    setting: hyper ? "SF" : routeSetting(era, fantastic),
    fantastic,
    where,
    homeBritish,
    region,
    biome,
    mode,
    tone: options.tone ?? "any",
    vocab: options.vocab ?? BUILT_IN_VOCAB,
    scale,
    drawn: new Set(),
    words: [],
    stars: [],
    anchorDecided: false,
    anchored: false,
  });

  /** The live plans of each kind (per scale in hyperspace), made once. */
  const planCache = new Map<string, Map<string, [Plan, number][]>>();
  const plansAt = (scale: HyperScale | undefined): Map<string, [Plan, number][]> => {
    const key = scale ?? "-";
    let plans = planCache.get(key);
    if (plans) return plans;
    plans = new Map();
    const ctx = newCtx(scale);
    if (earthlyModule) {
      for (const kind of waterKinds(earthlyModule)) {
        const shapes = [...(WATERS_DATA.shapes[earthlyModule][kind.key] ?? []), ...WATERS_DATA.cultureShapes.filter((s) => s.module === earthlyModule && s.kind === kind.key && s.culture === culture.key)];
        const live = shapes
          .filter((s) => !options.shape || s.p === options.shape)
          .map((s): [Plan, number] => [{ kind: kind.key, shape: s }, earthlyWeight(ctx, s)])
          .filter(([, w]) => w > 0);
        if (live.length > 0) plans.set(kind.key, live);
      }
    } else {
      for (const kind of hyperKindsAt(scale)) {
        const live = (WATERS_DATA.hyper.shapes[kind.key] ?? [])
          .filter((s) => !options.shape || s.p === options.shape)
          .map((s): [Plan, number] => [{ kind: kind.key, shape: s }, hyperWeight(ctx, s, register, medium)])
          .filter(([, w]) => w > 0);
        if (live.length > 0) plans.set(kind.key, live);
      }
    }
    planCache.set(key, plans);
    return plans;
  };

  const fixedLive = (): boolean => {
    if (options.shape) return false;
    return vocabPool(newCtx(chosenScale), FIXED_POOLS[module]).length > 0;
  };
  const chosenKind = options.kind ? (hyper ? findHyperKind(options.kind) : findWaterKind(earthlyModule!, options.kind)) : undefined;
  if (options.kind && !chosenKind) notices.push(`Kind “${options.kind}” isn't offered here.`);
  const withFixed = fixedLive();

  /** §3.3: kind weights with kind Any, before the home-British multipliers. */
  const kindWeights = (plans: Map<string, [Plan, number][]>, scale?: HyperScale): [string, number][] => {
    const base: [string, number][] = [];
    const kinds = earthlyModule ? waterKinds(earthlyModule) : hyperKindsAt(scale);
    for (const k of kinds) {
      if (!plans.has(k.key)) continue;
      let w = k.weight;
      if (homeBritish && earthlyModule === "seasLakes") {
        if (k.key === "ocean") w *= WATERS_DATA.kindMult.oceanHome;
        if (k.key === "lake") w *= WATERS_DATA.kindMult.lakeHome;
      }
      base.push([k.key, w]);
    }
    return base;
  };

  /** §7: when no kind is live, the module's untagged shapes. */
  const fallbackPlans = (): [Plan, number][] => {
    if (!earthlyModule) return [];
    const ctx = newCtx();
    return Object.entries(WATERS_DATA.shapes[earthlyModule]).flatMap(([kind, shapes]) =>
      shapes.filter((s) => !s.rt && !s.bt).map((s): [Plan, number] => [{ kind, shape: s }, earthlyWeight(ctx, s, true)]).filter(([, w]) => w > 0),
    );
  };

  // §13: two anchors, from places or stars.
  let anchors: string[] | undefined;
  if (options.series && watersHasSeries(module)) {
    const ctx = newCtx(chosenScale);
    const found: string[] = [];
    for (let i = 0; i < 40 && found.length < 2; i++) {
      const value = hyper ? starName({ ...ctx, scale: chosenScale ?? drawHyperScale() }) : mode === "placeholders" ? undefined : routePlace(culture.key, ctx.setting, rng);
      if (value && !found.includes(value)) found.push(value);
      if (!hyper && mode === "placeholders") break;
    }
    if (found.length === 2) anchors = found;
    else if (!hyper && mode === "placeholders") notices.push("A series needs invented places to share.");
  }

  function drawHyperScale(): HyperScale {
    const items = HYPER_SCALES.map((s): [HyperScale, number] => [s, WATERS_DATA.hyper.scaleWeights[s]]);
    return pickWeighted(items, rng)!;
  }

  const acceptable = (text: string): boolean => {
    const counted = countedWords(text);
    if (counted.length === 0 || counted.length > WATERS_DATA.cap) return false;
    if (repeatsContent(counted)) return false;
    const n = routeNorm(text);
    if (block.has(n) || block.has(stripThe(n))) return false;
    if (breaksRouteWords(text) || hasBannedWord(text)) return false;
    if (hyper && hasSpaceBlock(text)) return false;
    return true;
  };

  const oneName = (): WatersName | undefined => {
    // Hyperspace: a scale for the name, from the chosen kind's scales when a kind is chosen.
    let scale: HyperScale | undefined;
    if (hyper) {
      if (chosenScale) scale = chosenScale;
      else if (chosenKind) {
        const allowed = (chosenKind as HyperKind).scales;
        const items = allowed.map((s): [HyperScale, number] => [s, WATERS_DATA.hyper.scaleWeights[s]]);
        scale = pickWeighted(items, rng);
      } else scale = drawHyperScale();
    }
    const plans = plansAt(scale);
    for (let round = 0; round < 2; round++) {
      let kindKey: string | undefined;
      let fixed = false;
      if (chosenKind) kindKey = chosenKind.key;
      else {
        const weights = kindWeights(plans, scale);
        if (withFixed) weights.push(["fixed", FIXED_WEIGHT]);
        kindKey = pickWeighted(weights, rng);
        fixed = kindKey === "fixed";
      }
      let list: [Plan, number][] | undefined = fixed ? [] : kindKey ? plans.get(kindKey) : undefined;
      if (!fixed && (!list || list.length === 0)) {
        if (chosenKind) return undefined;
        const fallback = fallbackPlans();
        if (fallback.length === 0) return undefined;
        list = fallback;
        kindKey = undefined;
      }
      for (let i = 0; i < 20; i++) {
        const ctx = newCtx(scale);
        ctx.anchors = anchors;
        ctx.drawn = new Set();
        ctx.words = [];
        ctx.stars = [];
        let raw: string | undefined;
        let plan: Plan | undefined;
        if (fixed) {
          const e = drawEntry(ctx, FIXED_POOLS[module]);
          raw = e?.w;
          plan = { kind: "fixed", shape: { p: "fixed", w: 0, f: "fixed" }, fixed: true };
        } else {
          plan = pickWeighted(list!, rng);
          if (!plan) break;
          ctx.shape = plan.shape;
          raw = renderPattern(ctx, plan.shape.p);
        }
        if (!raw || !plan) continue;
        const text = routeCapitals(raw);
        if (!acceptable(text)) continue;
        const tones = new Set<GroupTone>([...(plan.shape.t ?? []), ...ctx.drawn]);
        return {
          text,
          kind: plan.kind,
          shape: plan.shape.p,
          era,
          tones: GROUP_TONES.filter((t) => tones.has(t)),
          ...(scale ? { scale } : {}),
          words: ctx.words,
          ...(anchors ? { anchored: ctx.anchored } : {}),
        };
      }
    }
    return undefined;
  };

  const seen = new Set<string>();
  const names: WatersName[] = [];
  for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
    const name = oneName();
    if (!name) {
      // Nothing live at all: stop rather than spin.
      if (attempt > 200 && names.length === 0) break;
      continue;
    }
    const key = name.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
  return { names, seed, notices };
}
