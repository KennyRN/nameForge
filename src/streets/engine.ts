// Streets and districts (docs/streets-and-districts-brief.md): streets and lanes, squares and
// markets, and districts and quarters inside a settlement, for route names' 22 cultures and seven
// eras. Words come from the shared settlement pools (settlement/vocab.ts, with vocabulary packs);
// places, peoples, people's names, gods and route names come from the route engine, which in turn
// reuses the group, bynames, tribal and realms engines. No Obsidian imports.

import streetData from "../data/street-names.json";
import {
  type GroupPeople,
  type GroupSafeguards,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  groupListWords,
  groupPossessive,
  groupSaint,
  ordinalText,
  pickWeighted,
  repeatsContent,
  toneFactor,
  wordTones,
  type GroupSetting,
} from "../groups/engine";
import { mulberry32 } from "../markov";
import {
  BRITISH_CULTURES,
  breaksRouteWords,
  countedWords,
  findRouteCulture,
  generateRouteNames,
  godNames,
  personNames,
  ROUTE_ERAS,
  routeCapitals,
  routeFolk,
  routeNorm,
  routePlace,
  routeSetting,
  type RouteCulture,
  type RouteEra,
} from "../routes/engine";
import { buildingName, type BuildingKind } from "../buildings/engine";
import { boostPool, contextLandmark, contextSaint, contextTown, type SettlementContext } from "../settlement/contextShared";
import { BUILT_IN_VOCAB, cultureAllowed, poolEntries, type VocabEntry, type Vocabulary } from "../settlement/vocab";

// ── Data ────────────────────────────────────────────────────────────────────

export type StreetKind = "streets" | "squares" | "districts";
export type StreetSize = "village" | "town" | "city" | "great";
export type StreetDialect = "plain" | "variants" | "instead";

export interface StreetShape {
  p: string;
  w: number;
  e?: RouteEra[];
  c?: string[];
  t?: GroupTone[];
  h?: boolean;
  /** §6.3: the shape groups the size multiplies (mainStreet, trade, planned, alley). */
  g?: string[];
  /** Region multipliers for the British cultures (Westgate: NTH EMD ×3). */
  rx?: Record<string, number>;
  /** Culture multipliers (Saturday Market: west-african ×3). */
  cx?: Record<string, number>;
  /** Culture shapes: the culture, and for districts the function ("any": every one). */
  culture?: string;
  fn?: string;
}

interface StreetData {
  any: string;
  kinds: { key: StreetKind; menu: string; plural: string; description: string; size: Record<StreetSize, number> }[];
  sizes: { key: StreetSize; label: string; sf: string }[];
  sizeEffects: Record<string, Record<StreetSize, number>>;
  functions: { key: string; menu: string; w: number; from: StreetSize; eraX?: Partial<Record<RouteEra, number>> }[];
  components: Record<string, number>;
  steampunkComponents: Record<string, number>;
  scifiComponents: { keep: string[]; compSciFi: number };
  streets: StreetShape[];
  cultureStreets: StreetShape[];
  scifiStreets: { share: number; shapes: StreetShape[] };
  squares: StreetShape[];
  districts: Record<string, StreetShape[]>;
  districtFixedWeight: number;
  cultureDistricts: StreetShape[];
  steampunkDistricts: StreetShape[];
  scifiDistricts: { share: number; shapes: StreetShape[] };
  lists: { hill: string[]; weekday: [string, number][]; dayOrdinals: string[] };
  route: { kinds: Record<string, number>; modern: Record<string, number> };
  surnameCultures: string[];
  dialect: { laneRegions: string[]; laneWords: string[]; laneShare: number; variantShare: number };
  series: { mainMarket: Record<string, string>; firstDistrict: Record<string, string>; scifiMainStreet: string; towns: number; routeFrom: number; landmarkOnceFrom: number };
  cap: number;
  safeguards: { block: string[]; flag: string[]; flagListBlocks: boolean; banned: string[]; religious: string[]; christian: string[] };
}

export const STREET_DATA = streetData as unknown as StreetData;
export const STREET_KINDS = STREET_DATA.kinds;
export const STREET_SIZES = STREET_DATA.sizes;
export const STREET_FUNCTIONS = STREET_DATA.functions;
export const STREET_ANY = STREET_DATA.any;

const SIZE_ORDER: StreetSize[] = ["village", "town", "city", "great"];
const isFuture = (era: RouteEra) => era === "NF" || era === "IS";

/** §6.1: a size's label in an era (outpost … megacity in the near future and beyond). */
export function sizeLabel(size: StreetSize, era: RouteEra): string {
  const s = STREET_SIZES.find((x) => x.key === size) ?? STREET_SIZES[1];
  return isFuture(era) ? s.sf : s.label;
}

/** §6.2: the kinds offered for a size. */
export const kindsForSize = (size: StreetSize) => STREET_KINDS.filter((k) => k.size[size] > 0);

/** §7.1: the functions offered for a size. */
export const functionsForSize = (size: StreetSize) => STREET_FUNCTIONS.filter((f) => SIZE_ORDER.indexOf(size) >= SIZE_ORDER.indexOf(f.from));

export const defaultStreetSafeguards = (): GroupSafeguards => ({
  block: STREET_DATA.safeguards.block,
  flag: STREET_DATA.safeguards.flag,
  flagListBlocks: STREET_DATA.safeguards.flagListBlocks,
});

// ── Options and results ─────────────────────────────────────────────────────

export interface StreetOptions {
  culture?: string;
  /** A kind key; undefined is Any. */
  kind?: StreetKind;
  /** A district function key; undefined is any. */
  function?: string;
  era?: RouteEra;
  fantastic?: boolean;
  region?: string;
  size?: StreetSize;
  dialect?: StreetDialect;
  tone?: GroupToneChoice;
  people?: GroupPeople;
  /** §10: as one town. */
  series?: boolean;
  count: number;
  seed?: number;
  /** RN §12.6: merged settlement safeguard lists; the built-in lists when absent. */
  safeguards?: GroupSafeguards;
  /** RN §12: the merged route safeguard lists, for `{route}`. */
  routeSafeguards?: GroupSafeguards;
  /** Buildings brief §11: merged building safeguard lists, for `{landmark}`. */
  landmarkSafeguards?: GroupSafeguards;
  /** Settlement kit §4: the settlement's neighbours, founder, saint, trades, goods, road and landmarks. */
  context?: SettlementContext;
  /** RN §3.3: the pools merged with vocabulary packs. */
  vocab?: Vocabulary;
  /** Tests: only this shape. */
  shape?: string;
}

export interface StreetName {
  text: string;
  /** The name with plain words. */
  plain: string;
  /** §9: the name with dialect words, where it has one. */
  dialect?: string;
  kind: StreetKind;
  shape: string;
  function?: string;
  tones: GroupTone[];
  /** Every pool word drawn, with its pool (tests). */
  words: { pool: string; word: string }[];
  /** §10: what the name uses (component, trade, good, direction, destination). */
  uses: string[];
  route: boolean;
}

export interface StreetBatch {
  names: StreetName[];
  seed: number;
  notices: string[];
}

// ── Drawing ─────────────────────────────────────────────────────────────────

interface Ctx {
  rng: () => number;
  culture: RouteCulture;
  era: RouteEra;
  setting: GroupSetting;
  fantastic: boolean;
  mode: GroupPeople;
  tone: GroupToneChoice;
  vocab: Vocabulary;
  /** The region for the British cultures. */
  region?: string;
  size: StreetSize;
  fn?: string;
  /** §9: dialect words drawn (not plain), and the region they keep to in a series. */
  dialect: boolean;
  dialectRegion?: string;
  /** §10: the town's neighbours. */
  towns?: string[];
  options: StreetOptions;
  drawn: Set<GroupTone>;
  words: { pool: string; word: string }[];
  uses: string[];
  isRoute: boolean;
}

const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
const LIGHT_OR_GRIM = (t: readonly string[] | undefined) => !!t && (t.includes("light") || t.includes("grim"));
const CASTE = new Set(["indian", "west-african"]);
const TRADE_TOKENS = /\{(trade|tradeSg)[}:]/;
/** Tokens that name a pool of their own under another name. */
const POOL_OF: Record<string, string> = { sw: "streetWord", aw: "alleyWord", dw: "districtWord" };
const SF_LISTS = new Set(["star", "greek"]);

const where = (ctx: Ctx, region = ctx.region) => ({ culture: ctx.culture.key, era: ctx.era, fantastic: ctx.fantastic, region });

/** A pool's words here, tone-weighted; never light or grim for the sensitive cultures. */
function vocabPool(ctx: Ctx, pool: string, region = ctx.region): [VocabEntry, number][] {
  return boostPool(ctx.options.context, pool, poolEntries(ctx.vocab, pool, where(ctx, region)))
    .filter(([e]) => !(ctx.culture.sensitive && LIGHT_OR_GRIM(e.t)))
    .map(([e, w]): [VocabEntry, number] => [e, w * toneFactor(e.t ?? [], ctx.tone)])
    .filter(([, w]) => w > 0);
}

function fromPool(ctx: Ctx, pool: string, items: [VocabEntry, number][]): string | undefined {
  const e = pickWeighted(items, ctx.rng);
  if (!e) return undefined;
  for (const t of e.t ?? []) ctx.drawn.add(t);
  ctx.words.push({ pool, word: e.w });
  return e.w;
}

const vocabWord = (ctx: Ctx, pool: string, keep?: (e: VocabEntry) => boolean) => fromPool(ctx, pool, vocabPool(ctx, pool).filter(([e]) => !keep || keep(e)));

/** A group-names list word, tone-weighted. */
function gnWord(ctx: Ctx, list: string, keep?: (w: string) => boolean): string | undefined {
  const items = groupListWords(list, SF_LISTS.has(list) ? "SF" : ctx.setting)
    .filter(([w]) => (!keep || keep(w)) && !(ctx.culture.sensitive && LIGHT_OR_GRIM(wordTones(list, w))))
    .map(([w, n]): [string, number] => [w, n * toneFactor(wordTones(list, w), ctx.tone)])
    .filter(([, n]) => n > 0);
  const w = pickWeighted(items, ctx.rng);
  if (w !== undefined) {
    for (const t of wordTones(list, w)) ctx.drawn.add(t);
    ctx.words.push({ pool: list, word: w });
  }
  return w;
}

/** §5.1: `component`: a function pool by its weight, then a word from it. */
function componentPools(ctx: Ctx): [string, number][] {
  const d = STREET_DATA;
  let weights: Record<string, number> = { ...d.components };
  if (ctx.era === "ST" && ctx.fantastic) weights = { ...weights, ...d.steampunkComponents };
  if (isFuture(ctx.era)) {
    weights = Object.fromEntries(Object.entries(weights).filter(([p]) => d.scifiComponents.keep.includes(p)));
    weights.compSciFi = d.scifiComponents.compSciFi;
  }
  // Settlement kit §7.1: the position's component multipliers.
  const x = ctx.options.context?.effects?.componentX;
  return Object.entries(weights)
    .map(([p, w]): [string, number] => [p, w * (x?.[p] ?? 1)])
    .filter(([p]) => vocabPool(ctx, p).length > 0);
}

function component(ctx: Ctx): string | undefined {
  const pool = pickWeighted(componentPools(ctx), ctx.rng);
  const w = pool && vocabWord(ctx, pool);
  if (w) ctx.uses.push(`component:${w}`);
  return w;
}

/** §5.2: street goods, with route goods' culture extras ×2. */
function streetGoods(ctx: Ctx): string | undefined {
  const items = vocabPool(ctx, "streetGoods");
  for (const e of ctx.vocab.pools.routeGoods?.cultureExtra?.[ctx.culture.key] ?? []) {
    const found = items.find(([x]) => x.w === e.w);
    if (found) found[1] *= 2;
    else items.push([e, 2]);
  }
  const w = fromPool(ctx, "streetGoods", items);
  if (w) ctx.uses.push(`good:${w}`);
  return w;
}

/** §9: a dialect alley word for the region (all of Britain: weighted by how many regions it has). */
function dialectWord(ctx: Ctx, keep?: (w: string) => boolean): string | undefined {
  const region = ctx.dialectRegion ?? ctx.region;
  const items = vocabPool(ctx, "alleyDialect", region)
    .filter(([e]) => !keep || keep(e.w))
    .map(([e, w]): [VocabEntry, number] => [e, region ? w : w * (e.r?.length ?? 1)]);
  return fromPool(ctx, "alleyDialect", items);
}

/** §4: `{route}`: one route name for the same culture, era, fantastic, region and people. */
function route(ctx: Ctx): string | undefined {
  // Settlement kit §4: the road through town.
  const through = ctx.options.context?.throughRoute;
  if (through) {
    ctx.isRoute = true;
    return through;
  }
  const kinds = ROUTE_ERAS.findIndex((e) => e.code === ctx.era) >= ROUTE_ERAS.findIndex((e) => e.code === "MO") ? STREET_DATA.route.modern : STREET_DATA.route.kinds;
  const kind = pickWeighted(Object.entries(kinds), ctx.rng);
  const o = ctx.options;
  const r = generateRouteNames({
    culture: ctx.culture.key,
    era: ctx.era,
    fantastic: ctx.fantastic,
    region: ctx.region,
    people: ctx.mode,
    kind,
    count: 1,
    seed: Math.floor(ctx.rng() * 0xffffffff),
    safeguards: o.routeSafeguards,
    vocab: o.vocab,
  }).names[0];
  if (r) ctx.isRoute = true;
  return r?.text;
}

/** §10: a destination: one of the town's neighbours in a series. */
function destination(ctx: Ctx): string | undefined {
  const context = ctx.options.context;
  if (context) {
    const t = contextTown(context, false, ctx.rng);
    ctx.uses.push(`destination:${t}`);
    return t;
  }
  if (ctx.mode === "placeholders") return "[place]";
  const t = ctx.towns ? pickOne(ctx.towns, ctx.rng) : routePlace(ctx.culture.key, ctx.setting, ctx.rng);
  if (t) ctx.uses.push(`destination:${t}`);
  return t;
}

/** Buildings brief §11.1: the landmark kinds a street is named after. */
export const STREET_LANDMARK_KINDS: BuildingKind[] = ["defence", "faith", "crossing", "water", "monument"];

/** Buildings brief §11.1: `{landmark}`: one building of 3 words or fewer, without "the"; in a series of 8
 * or more, once. */
function landmark(ctx: Ctx): string | undefined {
  const o = ctx.options;
  // Settlement kit §4: one of the settlement's own landmarks, never a fresh building.
  const w = o.context
    ? contextLandmark(o.context, ctx.rng)
    : buildingName({
    culture: ctx.culture.key,
    era: ctx.era,
    fantastic: ctx.fantastic,
    region: ctx.region,
    people: ctx.mode,
    kinds: STREET_LANDMARK_KINDS,
    rng: ctx.rng,
    safeguards: o.landmarkSafeguards,
    vocab: o.vocab,
  });
  if (!w) return undefined;
  ctx.words.push({ pool: "landmark", word: w });
  if (o.series && o.count >= STREET_DATA.series.landmarkOnceFrom) ctx.uses.push("landmark");
  return w;
}

const directionKey = (w: string) => w.replace(/ern$/, "");

/** One token (§4, §5); `{sw}` and `{aw}` also give their dialect form, through `alt`. */
function token(ctx: Ctx, name: string, alt: (dialect: string) => void, pattern: string): string | undefined {
  const rng = ctx.rng;
  const placeholders = ctx.mode === "placeholders";
  switch (name) {
    case "component":
      return component(ctx);
    case "streetGoods":
      return streetGoods(ctx);
    case "trade":
    case "tradeSg": {
      const w = vocabWord(ctx, "streetTrades");
      if (!w) return undefined;
      ctx.uses.push(`trade:${w}`);
      return name === "tradeSg" ? w.replace(/s$/, "") : w;
    }
    case "direction":
    case "directionAdj": {
      // {direction}gate is one word: never a diagonal.
      const w = vocabWord(ctx, name, (e) => !(pattern === "{direction}gate" && e.w.includes("-")));
      if (w) ctx.uses.push(`direction:${directionKey(w)}`);
      return w;
    }
    case "destination":
      return destination(ctx);
    case "route":
      return route(ctx);
    case "people":
      return placeholders ? "[people]" : routeFolk(ctx.culture.key, rng);
    case "royal":
      return "[royal]";
    case "holy": {
      const other = () => (placeholders ? "[holy person]" : groupSaint(ctx.setting, rng));
      return ctx.options.context ? contextSaint(ctx.options.context, other, rng) : other();
    }
    case "founder": {
      if (ctx.options.context) return ctx.options.context.founder;
      if (placeholders) return "[founder]";
      const names = personNames(ctx.culture.key);
      return names.length > 0 ? pickOne(names, rng) : undefined;
    }
    case "surname":
      return placeholders || !STREET_DATA.surnameCultures.includes(ctx.culture.key) ? "[surname]" : gnWord(ctx, "surname");
    case "god": {
      const gods = godNames(ctx.culture.key);
      return gods.length > 0 ? pickOne(gods, rng) : undefined;
    }
    case "weekday":
      return pickWeighted(STREET_DATA.lists.weekday, rng);
    case "hill":
      return pickOne(STREET_DATA.lists.hill, rng);
    case "ordinal": {
      const choices: [number, number][] = [];
      for (let n = 1; n <= 99; n++) choices.push([n, n <= 12 ? 3 : n <= 30 ? 1 : 0.2]);
      return ordinalText(pickWeighted(choices, rng)!);
    }
    case "ordinalWord":
      // §8.3: "-Day" markets use First–Ninth only.
      return gnWord(ctx, "ordinalWord", pattern.includes("-Day") ? (w) => STREET_DATA.lists.dayOrdinals.includes(w) : undefined);
    case "n":
      return String(1 + Math.floor(rng() * 40));
    case "greek":
    case "star":
      return gnWord(ctx, name);
    case "landmark":
      return landmark(ctx);
    case "mainStreet": {
      // §10: a town has one main street.
      const w = vocabWord(ctx, name);
      if (w) ctx.uses.push("mainStreet");
      return w;
    }
    case "districtFixed":
      return vocabWord(ctx, name, (e) => !e.fn || e.fn.includes("any") || (!!ctx.fn && e.fn.includes(ctx.fn)));
    case "aw": {
      const w = vocabWord(ctx, "alleyWord");
      if (w && ctx.dialect) {
        const d = dialectWord(ctx);
        if (d) alt(d);
      }
      return w;
    }
    case "sw": {
      const w = vocabWord(ctx, "streetWord");
      // §9: in the north, Wynd, Vennel, Chare or Close can stand for Lane in {component} Lane at 20%.
      const region = ctx.dialectRegion ?? ctx.region;
      const d = STREET_DATA.dialect;
      if (w === "Lane" && ctx.dialect && pattern === "{component} {sw}" && region && d.laneRegions.includes(region) && rng() < d.laneShare) {
        const lane = dialectWord(ctx, (x) => d.laneWords.includes(x));
        if (lane) alt(lane);
      }
      return w;
    }
  }
  return vocabWord(ctx, POOL_OF[name] ?? name);
}

/** Renders a pattern into its plain and dialect forms; undefined when a token has nothing to offer. */
function renderPattern(ctx: Ctx, pattern: string): { plain: string; dialect?: string } | undefined {
  let failed = false;
  let hasDialect = false;
  const dialectParts: string[] = [];
  const plainParts: string[] = [];
  let last = 0;
  for (const m of pattern.matchAll(/\{([^}]+)\}/g)) {
    const literal = pattern.slice(last, m.index);
    plainParts.push(literal);
    dialectParts.push(literal);
    last = m.index! + m[0].length;
    const [name, mod] = m[1].split(":");
    let alt: string | undefined;
    const piece = token(ctx, name, (d) => (alt = d), pattern);
    if (!piece) {
      failed = true;
      break;
    }
    const form = (text: string) => (mod === "poss" ? groupPossessive(text, name === "trade") : text);
    plainParts.push(form(piece));
    dialectParts.push(form(alt ?? piece));
    if (alt) hasDialect = true;
  }
  if (failed) return undefined;
  plainParts.push(pattern.slice(last));
  dialectParts.push(pattern.slice(last));
  const plain = routeCapitals(plainParts.join(""));
  return { plain, ...(hasDialect ? { dialect: routeCapitals(dialectParts.join("")) } : {}) };
}

// ── Safeguards (§13) ────────────────────────────────────────────────────────

const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const BANNED = [...STREET_DATA.safeguards.banned, ...STREET_DATA.safeguards.religious].map(wordRe);
const CHRISTIAN_WORDS = STREET_DATA.safeguards.christian.map(wordRe);

/** §13.3, §13.5: banned words (GN, RN and the street list) and living religions' buildings. */
export function breaksStreetWords(text: string): boolean {
  return breaksRouteWords(text) || BANNED.some((re) => re.test(text));
}

/** §13.3: christian words in a name. */
export const hasChristianWord = (text: string) => CHRISTIAN_WORDS.some((re) => re.test(text));

/** §13.1–§13.2: the block set for merged safeguard lists (the flag list too when it blocks). */
export function streetBlockSet(guards: GroupSafeguards = defaultStreetSafeguards()): Set<string> {
  return new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(routeNorm));
}

/** RN §3.3: a pack word the street safeguards drop. */
export function streetWordBlocked(word: string, guards?: GroupSafeguards): boolean {
  return streetBlockSet(guards).has(routeNorm(word)) || breaksStreetWords(word);
}

// ── Shapes (§7, §8) ─────────────────────────────────────────────────────────

/** A shape's weight here (0 when it can't be drawn). */
function shapeWeight(ctx: Ctx, s: StreetShape): number {
  const c = ctx.culture;
  if (s.e && !s.e.includes(ctx.era)) return 0;
  if (!cultureAllowed(s.c, c.key, ctx.era)) return 0;
  if (s.h !== undefined && s.h !== ctx.fantastic) return 0;
  // RN §12.4: no fantastic, light or grim shapes for the sensitive cultures.
  if (c.sensitive && (s.h || LIGHT_OR_GRIM(s.t))) return 0;
  // §13.4: no trades for indian and west-african.
  if (CASTE.has(c.key) && TRADE_TOKENS.test(s.p)) return 0;
  if (ctx.mode === "invented" && s.p.includes("{founder}") && personNames(c.key).length === 0) return 0;
  if (s.p.includes("{god") && godNames(c.key).length === 0) return 0;
  if (s.p.includes("{holy:") && !cultureAllowed(["christian"], c.key, ctx.era)) return 0;
  if (s.p === "{districtFixed}" && !vocabPool(ctx, "districtFixed").some(([e]) => !e.fn || e.fn.includes("any") || (!!ctx.fn && e.fn.includes(ctx.fn)))) return 0;
  const pool = s.p.match(/^\{(\w+)\}$/)?.[1];
  if (pool && ctx.vocab.pools[pool] && vocabPool(ctx, pool).length === 0) return 0;
  let w = s.w * (s.cx?.[c.key] ?? 1) * toneFactor(s.t ?? [], ctx.tone);
  for (const g of s.g ?? []) w *= STREET_DATA.sizeEffects[g]?.[ctx.size] ?? 1;
  if (ctx.region && s.rx) w *= s.rx[ctx.region] ?? 1;
  return w;
}

const live = (ctx: Ctx, shapes: StreetShape[], only?: string): [StreetShape, number][] =>
  shapes
    .filter((s) => !only || s.p === only)
    .map((s): [StreetShape, number] => [s, shapeWeight(ctx, s)])
    .filter(([, w]) => w > 0);

/** §8.1–§8.2: street shapes; in the near future and beyond, sci-fi shapes 70% of the time. */
function streetShapes(ctx: Ctx, only?: string): [StreetShape, number][] {
  const d = STREET_DATA;
  if (isFuture(ctx.era) && !only && ctx.rng() < d.scifiStreets.share) return live(ctx, d.scifiStreets.shapes);
  return live(ctx, [...d.streets, ...d.cultureStreets.filter((s) => s.culture === ctx.culture.key), ...(only ? d.scifiStreets.shapes : [])], only);
}

/** §7.2–§7.3: a function's district shapes; in the near future and beyond, sci-fi shapes 60% of the time. */
function districtShapes(ctx: Ctx, only?: string): [StreetShape, number][] {
  const d = STREET_DATA;
  if (isFuture(ctx.era) && !only && ctx.rng() < d.scifiDistricts.share) return live(ctx, d.scifiDistricts.shapes);
  const fn = ctx.fn!;
  return live(
    ctx,
    [
      ...(d.districts[fn] ?? []),
      ...d.cultureDistricts.filter((s) => s.culture === ctx.culture.key && (s.fn === fn || s.fn === "any")),
      ...d.steampunkDistricts,
      { p: "{districtFixed}", w: d.districtFixedWeight },
      ...(only ? d.scifiDistricts.shapes : []),
    ],
    only,
  );
}

/** §7.1: the functions for a size, weighted (industrial ×3 in the steam age and modern era). */
function functionWeights(size: StreetSize, era: RouteEra): [string, number][] {
  return functionsForSize(size).map((f): [string, number] => [f.key, f.w * (f.eraX?.[era] ?? 1)]);
}

// ── Batches ─────────────────────────────────────────────────────────────────

interface Built {
  plain: string;
  dialect?: string;
  shape: StreetShape;
  tones: GroupTone[];
  words: { pool: string; word: string }[];
  uses: string[];
  isRoute: boolean;
}

/** §8: a batch of unique street, square and district names. */
export function generateStreetNames(options: StreetOptions): StreetBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const notices: string[] = [];
  const culture = findRouteCulture(options.culture) ?? findRouteCulture("norman-british")!;
  const era: RouteEra = ROUTE_ERAS.some((e) => e.code === options.era) ? options.era! : "MD";
  const fantastic = !!options.fantastic;
  const setting = routeSetting(era, fantastic);
  const size: StreetSize = SIZE_ORDER.includes(options.size as StreetSize) ? options.size! : "town";
  const british = BRITISH_CULTURES.includes(culture.key);
  const region = british && options.region && options.region !== "all" ? options.region : undefined;
  const dialectSetting: StreetDialect = british ? options.dialect ?? "variants" : "plain";
  const mode = options.people ?? "placeholders";
  const tone = options.tone ?? "any";
  const count = Math.max(0, Math.floor(options.count));

  let kind = options.kind;
  if (kind === "districts" && size === "village") {
    notices.push("A village has no districts.");
    kind = "streets";
  } else if (kind && !kindsForSize(size).some((k) => k.key === kind)) kind = undefined;
  const fns = functionsForSize(size);
  let chosenFn = kind === "districts" || !kind ? options.function : undefined;
  if (chosenFn && !fns.some((f) => f.key === chosenFn)) {
    notices.push(`“${STREET_FUNCTIONS.find((f) => f.key === chosenFn)?.menu ?? chosenFn}” districts aren't offered for a ${sizeLabel(size, era)}.`);
    chosenFn = undefined;
  }
  const kindWeights = kindsForSize(size).map((k): [StreetKind, number] => [k.key, k.size[size]]);
  const block = streetBlockSet(options.safeguards);
  const series = !!options.series;

  // §10: the town's neighbours, and the one region its dialect words keep to.
  const towns =
    series && mode === "invented"
      ? [...new Set(Array.from({ length: 30 }, () => routePlace(culture.key, setting, rng)).filter((t): t is string => !!t))].slice(0, STREET_DATA.series.towns)
      : undefined;
  let dialectRegion = region;
  if (series && !region && dialectSetting !== "plain") {
    const regions = [...new Set((options.vocab ?? BUILT_IN_VOCAB).pools.alleyDialect.entries.flatMap((e) => e.r ?? []))];
    dialectRegion = regions.length > 0 ? pickOne(regions, rng) : undefined;
  }

  const newCtx = (fn?: string): Ctx => ({
    rng,
    culture,
    era,
    setting,
    fantastic,
    mode,
    tone,
    vocab: options.vocab ?? BUILT_IN_VOCAB,
    region,
    size,
    fn,
    dialect: dialectSetting !== "plain",
    dialectRegion,
    towns,
    options,
    drawn: new Set(),
    words: [],
    uses: [],
    isRoute: false,
  });

  /** §4: `{royal}` in invented mode is drawn as `{streetFigure} {sw}`. */
  const patternOf = (s: StreetShape) => (mode === "invented" && s.p.includes("{royal}") ? "{streetFigure} {sw}" : s.p);

  const render = (ctx: Ctx, s: StreetShape): Built | undefined => {
    const out = renderPattern(ctx, patternOf(s));
    if (!out) return undefined;
    const tones = new Set<GroupTone>([...(s.t ?? []), ...ctx.drawn]);
    return { ...out, shape: s, tones: GROUP_TONES.filter((t) => tones.has(t)), words: ctx.words, uses: ctx.uses, isRoute: ctx.isRoute };
  };

  /** §11, §13: the cap, repetition and safeguards, for both forms. */
  const acceptable = (b: Built): boolean => {
    for (const text of [b.plain, ...(b.dialect ? [b.dialect] : [])]) {
      const counted = countedWords(text);
      // A route through town keeps its own length and words (RN's cap and checks).
      if (!b.isRoute && (counted.length === 0 || counted.length > STREET_DATA.cap || repeatsContent(counted))) return false;
      if (block.has(routeNorm(text)) || breaksStreetWords(text)) return false;
      if (hasChristianWord(text) && !cultureAllowed(["christian"], culture.key, era)) return false;
    }
    return true;
  };

  const shapesFor = (ctx: Ctx, k: StreetKind) =>
    k === "streets" ? streetShapes(ctx, options.shape) : k === "squares" ? live(ctx, STREET_DATA.squares, options.shape) : districtShapes(ctx, options.shape);

  /** GN §4: one name of a kind, 40 tries; `ok` adds the series' checks. */
  const draw = (k: StreetKind, fnFor: () => string | undefined, ok: (b: Built) => boolean = () => true, shape?: StreetShape): { built: Built; fn?: string } | undefined => {
    for (let i = 0; i < 40; i++) {
      const fn = k === "districts" ? fnFor() : undefined;
      if (k === "districts" && !fn) return undefined;
      const ctx = newCtx(fn);
      const s = shape ?? pickWeighted(shapesFor(ctx, k), rng);
      if (!s) continue;
      const built = render(ctx, s);
      if (built && acceptable(built) && ok(built)) return { built, fn };
    }
    return undefined;
  };

  const seen = new Set<string>();
  const names: StreetName[] = [];
  const variantCap = Math.floor(STREET_DATA.dialect.variantShare * count);
  let variants = 0;
  const toName = (k: StreetKind, b: Built, fn?: string): StreetName => {
    let text = b.plain;
    if (b.dialect && dialectSetting === "instead") text = b.dialect;
    else if (b.dialect && dialectSetting === "variants" && variants < variantCap) {
      text = `${b.plain} (${b.dialect})`;
      variants++;
    }
    return { text, plain: b.plain, ...(b.dialect ? { dialect: b.dialect } : {}), kind: k, shape: b.shape.p, ...(fn ? { function: fn } : {}), tones: b.tones, words: b.words, uses: b.uses, route: b.isRoute };
  };
  const add = (k: StreetKind, found: { built: Built; fn?: string } | undefined): boolean => {
    if (!found) return false;
    const key = (dialectSetting === "instead" && found.built.dialect ? found.built.dialect : found.built.plain).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    names.push(toName(k, found.built, found.fn));
    return true;
  };

  const drawKind = (): StreetKind | undefined => kind ?? pickWeighted(kindWeights, rng);
  const anyFn = () => chosenFn ?? pickWeighted(functionWeights(size, era), rng);

  if (series) drawTown();
  else {
    for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
      const k = drawKind();
      if (!k) break;
      add(k, draw(k, anyFn));
    }
  }
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
  return { names, seed, notices };

  /** §10: one town: each kind's first name, then no repeats; one route; functions in turn. */
  function drawTown() {
    const used = new Set<string>();
    let routeUsed = false;
    const firsts = new Set<StreetKind>();
    let fnLeft: string[] = functionWeights(size, era).map(([f]) => f);
    const nextFn = () => {
      if (chosenFn) return chosenFn;
      if (fnLeft.length === 0) fnLeft = functionWeights(size, era).map(([f]) => f);
      const weights = functionWeights(size, era).filter(([f]) => fnLeft.includes(f));
      return pickWeighted(weights, rng);
    };
    const fresh = (b: Built) => !b.uses.some((u) => used.has(u)) && !(b.isRoute && routeUsed);
    const keep = (k: StreetKind, found: { built: Built; fn?: string } | undefined) => {
      if (!add(k, found)) return false;
      for (const u of found!.built.uses) used.add(u);
      if (found!.built.isRoute) routeUsed = true;
      if (found!.fn) fnLeft = fnLeft.filter((f) => f !== found!.fn);
      return true;
    };
    /** Each kind's first name (§10): the main street, the main market, Old Town. */
    const first = (k: StreetKind): { built: Built; fn?: string } | undefined => {
      const s = STREET_DATA.series;
      const future = isFuture(era);
      if (k === "streets") {
        const shape: StreetShape = future ? { p: s.scifiMainStreet, w: 1 } : { p: "{mainStreet}", w: 1 };
        return draw(k, () => undefined, fresh, shape);
      }
      if (k === "squares") {
        const p = future ? s.mainMarket.scifi : s.mainMarket[culture.key] ?? s.mainMarket.default;
        return draw(k, () => undefined, fresh, { p, w: 1 });
      }
      if (chosenFn || size === "village") return undefined;
      const p = future ? s.firstDistrict.scifi : s.firstDistrict[culture.key] ?? s.firstDistrict.default;
      return draw(k, () => "commercial", fresh, { p, w: 1 });
    };
    for (let idle = 0; idle < 60 && names.length < count; ) {
      const k = drawKind();
      if (!k) break;
      if (!firsts.has(k)) {
        firsts.add(k);
        if (keep(k, first(k))) {
          idle = 0;
          continue;
        }
      }
      idle = keep(k, draw(k, nextFn, fresh)) ? 0 : idle + 1;
    }
    // §10.4: with 8 or more names, exactly one route through town.
    if (!routeUsed && count >= STREET_DATA.series.routeFrom && names.length > 1 && (kind ?? "streets") === "streets") {
      const found = draw("streets", () => undefined, (b) => b.isRoute && fresh(b), { p: "{route}", w: 1 });
      if (found && !seen.has(found.built.plain.toLowerCase())) {
        const at = 1 + Math.floor(rng() * (names.length - 1));
        seen.delete(names[at].text.toLowerCase());
        seen.add(found.built.plain.toLowerCase());
        names[at] = toName("streets", found.built);
      }
    }
  }
}
