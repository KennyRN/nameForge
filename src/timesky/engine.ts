// Time and sky (docs/time-and-sky-brief.md): the months, days, festivals and full moons of a world,
// and its constellations, star signs and wanderers, in modern English. Words come from the shared
// settlement pools (with vocabulary packs); gods, saints, places, realms and events from the deities,
// groups, routes and events engines; lands from biomes. One seeded stream a batch. No Obsidian imports.

import { hasSpaceBlock } from "../space/safeguards";
import { type Biome, BRITAIN, biomeTitleCase, biomeWords, findBiome } from "../biomes";
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
  groupStarIn,
  groupTown,
  hasBannedWord,
  ordinalText,
  pickWeighted,
  repeatsContent,
  toneFactor,
  wordTones,
} from "../groups/engine";
import { mulberry32 } from "../markov";
import { cultureAnimals, townSource } from "../bynames/engine";
import { deityTitle, hasRealDivineName, isChristianCulture } from "../deities/engine";
import { generateEventNames } from "../events/engine";
import { MONEY_DATA, pluralName } from "../money/engine";
import { countedWords, routeCapitals, routeFigure, routeKingdom, routeNorm, routeSetting, ROUTE_ERAS, type RouteEra } from "../routes/engine";
import { BUILT_IN_VOCAB, entryAllowed, type VocabEntry, type Vocabulary } from "../settlement/vocab";
import { breaksDeityWords } from "../deities/engine";
import {
  type Cycle,
  type CycleBiome,
  type CultureRow,
  type LandKind,
  type Slot,
  type TimeKind,
  type TimeShape,
  type TimeWords,
  cultureRows,
  festivalCycles,
  findTimeCulture,
  homelandOf,
  inEras,
  isFutureEra,
  isSensitive,
  kindsOffered,
  landKind,
  layoutRing,
  monthSystems,
  ownPosition,
  ownYearStart,
  seasonCycle,
  seasonPhrase,
  seasonNoun,
  seriesOffered,
  signSystems,
  TIME_SKY,
  weekSystems,
  findTimeKind,
} from "./data";

export * from "./data";

// ── Options and results ─────────────────────────────────────────────────────

export interface TimeSkyOptions {
  culture?: string;
  kind?: TimeKind;
  era?: RouteEra;
  fantastic?: boolean;
  /** A resolved biome; undefined is the culture's homeland. */
  biome?: CycleBiome;
  /** "own" (their own new year) or a season key. */
  start?: string;
  words?: TimeWords;
  tone?: GroupToneChoice;
  people?: GroupPeople;
  series?: boolean;
  count: number;
  seed?: number;
  safeguards?: GroupSafeguards;
  vocab?: Vocabulary;
  /** Tests: only this pattern. */
  shape?: string;
  /** Tests: the share of a series' lines that try a real name. */
  realShare?: number;
  /** Tests (sky): draw the neutral sky series the days planets theme reads. */
  neutral?: boolean;
}

export interface TimeName {
  /** The name alone: what is inserted. */
  text: string;
  kind: TimeKind;
  shape: string;
  tones: GroupTone[];
  words: { pool: string; word: string }[];
  /** §10.8: display only: the season, "leap month" or "extra days, 5". */
  tag?: string;
  season?: string;
  /** A culture name. */
  real?: boolean;
  loan?: boolean;
  leap?: boolean;
  extra?: boolean;
  /** A numbered culture name's own position. */
  position?: number;
  /** A sign or day's place in its system (1-based). */
  slot?: number;
}

export interface TimeBatch {
  names: TimeName[];
  seed: number;
  /** The shortfall notice and a series' system line (§10.8): neither is a name. */
  notices: string[];
  system?: string;
  theme?: string;
  /** The neutral sky names a days planets theme used (slots 1–7). */
  sky?: string[];
  /** The ring's own new year, as an index into the series (tests). */
  year?: { months: number; start: number; ownStart: number };
}

// ── Safeguards (§13) ────────────────────────────────────────────────────────

export const defaultTimeSafeguards = (): GroupSafeguards => ({ block: TIME_SKY.safeguards.block, flag: TIME_SKY.safeguards.flag, flagListBlocks: TIME_SKY.safeguards.flagListBlocks });
const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const BANNED = [...TIME_SKY.safeguards.banned, ...(TIME_SKY.safeguards.bannedFromMoney ? MONEY_DATA.safeguards.banned : [])].map(wordRe);
const bare = (text: string) => routeNorm(text).replace(/^the /, "");

/** §13.3–§13.4: banned words (GN's, the money list and this module's) and DS's deity words, on every name. */
export const breaksTimeWords = (text: string) => hasBannedWord(text) || BANNED.some((re) => re.test(text)) || breaksDeityWords(text);

export function timeBlockSet(guards: GroupSafeguards = defaultTimeSafeguards(), kind?: TimeKind): Set<string> {
  return new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : []), ...(kind ? TIME_SKY.safeguards.kindBlock[kind] ?? [] : [])].map(bare));
}

/** RN §3.3: a pack word the safeguards drop. */
export const timeWordBlocked = (word: string, guards?: GroupSafeguards) => timeBlockSet(guards).has(bare(word)) || breaksTimeWords(word);

// ── Context ─────────────────────────────────────────────────────────────────

interface Plan {
  shape: TimeShape;
  p: string;
  tones: GroupTone[];
  w: number;
}

interface Ctx {
  rng: () => number;
  culture: string;
  era: RouteEra;
  setting: GroupSetting;
  fantastic: boolean;
  mode: GroupPeople;
  tone: GroupToneChoice;
  vocab: Vocabulary;
  words: TimeWords;
  biome: CycleBiome | undefined;
  atHome: boolean;
  land: LandKind;
  cycle: Cycle | null;
  sensitive: boolean;
  kind: TimeKind;
  /** The system in force (week, year, sky), for shapes tied to one. */
  system?: string;
  /** The slot's season, position, previous name and own position in a series. */
  season: string | null;
  position?: string;
  previous?: string;
  ownPos?: number;
  /** A series: no word twice. */
  distinct: boolean;
  used: Set<string>;
  drawn: Set<GroupTone>;
  log: { pool: string; word: string }[];
  /** Pairs: a pre-drawn value for {turning} and {pairFeast}. */
  fixed: Record<string, string>;
  /** Days: {light} draws neutral sky names. */
  neutral: boolean;
  depth: number;
}

const pickOne = <T>(items: readonly T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const ARTICLE_KINDS: TimeKind[] = ["constellation", "sign", "light"];
const NO_LIGHT_GRIM: GroupTone[] = ["light", "grim"];
const blockedTone = (ctx: Ctx, tones: readonly string[] | undefined) => ctx.sensitive && (tones ?? []).some((t) => NO_LIGHT_GRIM.includes(t as GroupTone));

// ── Pool and list words ─────────────────────────────────────────────────────

const POOL_CACHE = new WeakMap<Vocabulary, Map<string, [VocabEntry, number][]>>();

/** A pool's words for a culture and era, tone-weighted; with `season`, only words for it (or untagged);
 * without one, words that fit some season of the land. Duplicates in different seasons stay separate. */
function poolWords(ctx: Ctx, pool: string, season?: string | null): [VocabEntry, number][] {
  const seasons = ctx.cycle ? ctx.cycle.map(([s]) => s) : [];
  const key = `${pool}|${ctx.culture}|${ctx.era}|${ctx.fantastic}|${season ?? "*"}|${seasons.join()}|${ctx.tone}|${ctx.sensitive}`;
  let cache = POOL_CACHE.get(ctx.vocab);
  if (!cache) {
    cache = new Map();
    POOL_CACHE.set(ctx.vocab, cache);
  }
  const hit = cache.get(key);
  if (hit) return hit;
  const where = { culture: ctx.culture, era: ctx.era, fantastic: ctx.fantastic };
  const source = ctx.vocab.pools[pool];
  const out: [VocabEntry, number][] = [];
  if (source) {
    const all: [VocabEntry, number][] = [...source.entries.map((e): [VocabEntry, number] => [e, 1]), ...(source.cultureExtra?.[ctx.culture] ?? []).map((e): [VocabEntry, number] => [e, 3])];
    for (const [e, mult] of all) {
      if (!entryAllowed(e, where) || blockedTone(ctx, e.t)) continue;
      if (e.s) {
        const fits = season ? e.s.includes(season) : e.s.some((s) => seasons.includes(s));
        if (!fits) continue;
      }
      const w = (e.x ?? 1) * mult * toneFactor(e.t ?? [], ctx.tone);
      if (w > 0) out.push([e, w]);
    }
  }
  cache.set(key, out);
  return out;
}

/** Draws a word, noting its tones; `cls` is the class a series keeps distinct. */
function drawWord(ctx: Ctx, cls: string, pool: string, opts: { season?: string | null; keep?: (e: VocabEntry) => boolean } = {}): VocabEntry | undefined {
  const items = poolWords(ctx, pool, opts.season === undefined ? ctx.season : opts.season).filter(([e]) => (!opts.keep || opts.keep(e)) && !(ctx.distinct && ctx.used.has(`${cls}:${e.w}`)));
  const e = pickWeighted(items, ctx.rng);
  if (!e) return undefined;
  for (const t of e.t ?? []) ctx.drawn.add(t);
  ctx.log.push({ pool, word: e.w });
  if (ctx.distinct) ctx.used.add(`${cls}:${e.w}`);
  return e;
}

/** Draws from plain weighted words (inline lists, biome lists, group-names lists), keeping a series distinct. */
function drawFrom(ctx: Ctx, cls: string, pool: string, items: [string, number][], tones?: (w: string) => GroupTone[]): string | undefined {
  const ok = items.filter(([w, n]) => n > 0 && !(ctx.distinct && ctx.used.has(`${cls}:${w}`)) && !blockedTone(ctx, tones?.(w)));
  const w = pickWeighted(ok, ctx.rng);
  if (w === undefined) return undefined;
  for (const t of tones?.(w) ?? []) ctx.drawn.add(t);
  ctx.log.push({ pool, word: w });
  if (ctx.distinct) ctx.used.add(`${cls}:${w}`);
  return w;
}

const plainList = (words: readonly string[]): [string, number][] => words.map((w) => [w, 1]);

function gnWord(ctx: Ctx, list: string, setting: GroupSetting = ctx.setting): string | undefined {
  const items = groupListWords(list, setting)
    .map(([w, n]): [string, number] => [w, n * toneFactor(wordTones(list, w), ctx.tone)]);
  return drawFrom(ctx, list, list, items, (w) => wordTones(list, w));
}

const BIOME_LISTS = { wildAnimal: "wildAnimals", bird: "birds", creature: "creatures", tree: "trees", plant: "plants", crop: "crops", livestock: "livestock" } as const;
type BiomeToken = keyof typeof BIOME_LISTS;

function landBiome(ctx: Ctx): Biome | undefined {
  return ctx.biome ?? findBiome(homelandOf(ctx.culture)) ?? BRITAIN;
}

function biomeItems(ctx: Ctx, token: BiomeToken | "beast"): [string, number][] {
  const biome = landBiome(ctx);
  if (!biome || ctx.land.space) return [];
  const lists = token === "beast" ? (["wildAnimal", "bird", "creature", "livestock"] as BiomeToken[]) : [token];
  return lists.flatMap((t) => biomeWords(biome, BIOME_LISTS[t]).filter(([w]) => !w.includes("{")).map(([w, n]): [string, number] => [biomeTitleCase(w), n]));
}

function biomeWord(ctx: Ctx, token: BiomeToken | "beast"): string | undefined {
  return drawFrom(ctx, token === "beast" ? "beast" : token === "wildAnimal" || token === "bird" || token === "creature" || token === "livestock" ? "beast" : token, token, biomeItems(ctx, token));
}

// ── People, places and the like ─────────────────────────────────────────────

const EVENT_POOLS = new Map<string, string[]>();
/** §3.4: `{event}`: a treaty, battle or rebellion of the culture and era, bare ("Saltgate"). */
function eventName(ctx: Ctx): string | undefined {
  if (ctx.mode === "placeholders") return "[event]";
  const kind = pickOne(["treaty", "battle", "rebellion"] as const, ctx.rng);
  const key = `${ctx.culture}|${ctx.era}|${kind}`;
  let pool = EVENT_POOLS.get(key);
  if (!pool) {
    const batch = generateEventNames({ culture: ctx.culture, era: ctx.era, kind, count: 40, seed: 1789, people: "invented" });
    pool = batch.names.map((n) => n.text.replace(/^the /i, "").replace(/^(Battle|Treaty) of /i, "")).filter((n) => n && !n.includes("[") && !n.includes(" of the ") && countedWords(n).length <= 2);
    EVENT_POOLS.set(key, pool);
  }
  return pool.length > 0 ? pickOne(pool, ctx.rng) : undefined;
}

function godTitle(ctx: Ctx): string | undefined {
  if (ctx.sensitive) return undefined;
  if (ctx.mode === "placeholders") return "[god]";
  for (let i = 0; i < 6; i++) {
    const g = deityTitle({ culture: ctx.culture, era: ctx.era, fantastic: ctx.fantastic, tone: ctx.tone, rng: ctx.rng });
    if (g && !(ctx.distinct && ctx.used.has(`god:${g}`))) {
      if (ctx.distinct) ctx.used.add(`god:${g}`);
      ctx.log.push({ pool: "god", word: g });
      return g;
    }
  }
  return undefined;
}

function town(ctx: Ctx): string | undefined {
  if (ctx.mode === "placeholders") return "[place]";
  return groupTown(ctx.setting, ctx.setting === "SF" ? undefined : findTimeCulture(ctx.culture)?.sensitive ? undefined : townSource(ctx.culture), ctx.rng).replace(/^The /, "");
}

const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth", "Thirteenth"];
export const ordinalWord = (n: number) => ORDINALS[n - 1] ?? ordinalText(n);

function token(ctx: Ctx, name: string, mod?: string): string | undefined {
  const placeholders = ctx.mode === "placeholders";
  const pl = (w: string) => (mod === "pl" ? pluralName(w) : w);
  switch (name) {
    case "seasonWord": {
      const e = drawWord(ctx, "season", "seasonWord");
      return e?.w;
    }
    case "workWord":
      return drawWord(ctx, "season", "workWord")?.w;
    case "season": {
      const s = ctx.season ?? (ctx.cycle ? pickOne(ctx.cycle, ctx.rng)[0] : undefined);
      return s ? seasonNoun(s) : undefined;
    }
    case "seasonPhrase": {
      const s = ctx.season ?? (ctx.cycle ? pickOne(ctx.cycle, ctx.rng)[0] : undefined);
      return s ? seasonPhrase(s) : undefined;
    }
    case "position":
      return ctx.season === null && ctx.cycle === null ? undefined : cap(ctx.position ?? pickOne(TIME_SKY.lists.position, ctx.rng).toLowerCase());
    case "dayWork":
      return drawWord(ctx, "day", "dayWork")?.w;
    case "dayElement":
      return drawWord(ctx, "day", "dayElement")?.w;
    case "extraDays":
      return drawWord(ctx, "extra", "extraDays")?.w;
    case "skyFigure": {
      const e = drawWord(ctx, "figure", "skyFigure", { season: null });
      if (!e) return undefined;
      return mod === "poss" ? groupPossessive(e.w, /s$/.test(e.w)) : pl(e.w);
    }
    case "skyObject":
      return drawWord(ctx, "object", "skyObject", { season: null })?.w;
    case "skyBodyPart":
      return drawWord(ctx, "part", "skyBodyPart", { season: null })?.w;
    case "skyQuality":
      return drawWord(ctx, "quality", "skyQuality", { season: null })?.w;
    case "skyKin":
      return drawWord(ctx, "kin", "skyKin", { season: null })?.w;
    case "skyRiver":
      return drawWord(ctx, "river", "skyRiver", { season: null })?.w;
    case "skyHeaven":
      return drawWord(ctx, "heaven", "skyHeaven", { season: null })?.w;
    case "festNoun":
      return drawWord(ctx, "noun", "festNoun", { season: null })?.w;
    case "festBlessing":
      return drawWord(ctx, "noun", "festBlessing", { season: null })?.w;
    case "wildAnimal":
    case "bird":
    case "creature":
    case "tree":
    case "plant":
    case "crop":
    case "livestock": {
      const w = biomeWord(ctx, name);
      return w === undefined ? undefined : pl(w);
    }
    case "beast": {
      const w = biomeWord(ctx, "beast");
      if (w === undefined) return undefined;
      return mod === "poss" ? groupPossessive(w, false) : w;
    }
    case "god": {
      const g = godTitle(ctx);
      if (g === undefined) return undefined;
      if (mod !== "poss") return g;
      const plural = /^the .+s$/i.test(g);
      return groupPossessive(g.replace(/^the /i, ""), plural);
    }
    case "holy": {
      const h = placeholders ? "[holy person]" : groupSaint(ctx.setting, ctx.rng);
      return mod === "poss" ? groupPossessive(h, false) : h;
    }
    case "figure": {
      const f = routeFigure(ctx.culture, ctx.setting, ctx.rng);
      return f && mod === "poss" ? groupPossessive(f, false) : f;
    }
    case "founder":
      return placeholders ? "[founder]" : groupPerson(ctx.setting, true, ctx.rng);
    case "town":
      return town(ctx);
    case "realm":
      return placeholders ? "[realm]" : routeKingdom(ctx.culture, ctx.era, ctx.rng);
    case "event":
      return eventName(ctx);
    case "star":
      return groupStarIn("any", ctx.mode, ctx.rng);
    case "spaceLand":
      return ctx.setting === "SF" ? gnWord(ctx, "spaceLand", "SF") : undefined;
    case "colour":
      return gnWord(ctx, "colour");
    case "number":
      return gnWord(ctx, "number");
    case "ordinal": {
      if (ctx.ownPos !== undefined) return ordinalWord(ctx.ownPos);
      return gnWord(ctx, "ordinalWord");
    }
    case "numberWord":
      return pickOne(TIME_SKY.lists.numberWord, ctx.rng);
    case "group":
      return pickOne(TIME_SKY.lists.group, ctx.rng);
    case "kin":
      return pickOne(TIME_SKY.lists.kin, ctx.rng);
    case "thing":
      return pickOne(TIME_SKY.lists.thing, ctx.rng);
    case "herald":
      return pickOne(TIME_SKY.lists.herald, ctx.rng);
    case "weather":
      return pickOne(TIME_SKY.lists.weather, ctx.rng);
    case "turning":
      return ctx.fixed.turning ?? pickOne(TIME_SKY.lists.turning, ctx.rng);
    case "pairFeast": {
      const raw = ctx.fixed.pairFeast ?? pickOne(TIME_SKY.lists.pairFeast, ctx.rng);
      return raw.includes("{") ? renderPattern(ctx, raw) : raw;
    }
    case "daySign": {
      const w = drawFrom(ctx, "daySign", "daySign", plainList(TIME_SKY.lists.daySign), (x) => TIME_SKY.lists.daySignTone[x] ?? []);
      return w;
    }
    case "moonPhase":
      return pickOne(TIME_SKY.lists.moonPhase, ctx.rng);
    case "goods":
      return gnWord(ctx, "goods");
    case "previous":
      return ctx.previous;
    case "festival": {
      if (ctx.depth > 0) return undefined;
      const inner: Ctx = { ...ctx, kind: "festival", depth: 1, season: ctx.season, drawn: new Set(), log: [], distinct: false };
      const n = buildName(inner, "festival", (pl) => !pl.shape.cn);
      return n?.text.replace(/^(Feast|Festival) of /, "").replace(/^the /, "") ?? undefined;
    }
    case "light": {
      const n = neutralLightName(ctx);
      if (!n) return undefined;
      const text = n.replace(/^the /, "");
      const last = text.split(" ").pop() ?? "";
      const kin = (BUILT_IN_VOCAB.pools.skyKin?.entries ?? []).some((e) => e.w === last);
      return kin ? groupPossessive(text, false) : text;
    }
  }
  return undefined;
}

/** A pattern rendered; undefined when a token has nothing to offer. */
function renderPattern(ctx: Ctx, pattern: string): string | undefined {
  let failed = false;
  const out = pattern.replace(/\{([^}]+)\}/g, (_m, raw: string) => {
    if (failed) return "";
    const [name, mod] = raw.split(":");
    const piece = token(ctx, name, mod);
    if (piece === undefined || piece === "") {
      failed = true;
      return "";
    }
    return piece;
  });
  return failed ? undefined : out;
}

// ── Rendering (§11) ─────────────────────────────────────────────────────────

/** Capitals and OUP possessives; a leading "the" stays lower case. */
export const timeCapitals = (text: string) => routeCapitals(text).replace(/^The /, "the ");

// ── Shapes ──────────────────────────────────────────────────────────────────

const PLANS: Record<string, Plan[]> = {};
for (const shape of TIME_SKY.shapes) {
  const patterns = Array.isArray(shape.p) ? shape.p : [shape.p];
  for (const raw of patterns) {
    const [p, tones] = typeof raw === "string" ? [raw, shape.t ?? []] : [raw[0], raw[1] ?? shape.t ?? []];
    (PLANS[shape.k] ??= []).push({ shape, p, tones, w: shape.w / patterns.length });
  }
}
export const shapePatterns = (kind: string) => (PLANS[kind] ?? []).map((p) => p.p);

const TOKEN_RE = /\{([^}:]+)(?::[^}]*)?\}/g;

/** Whether every token of a pattern has something to draw here. */
function viable(ctx: Ctx, p: string): boolean {
  for (const m of p.matchAll(TOKEN_RE)) {
    const name = m[1];
    switch (name) {
      case "seasonWord":
      case "workWord":
        if (ctx.land.space || poolWords(ctx, name, ctx.season).length === 0) return false;
        break;
      case "season":
      case "seasonPhrase":
      case "position":
        if (ctx.land.space || !ctx.cycle) return false;
        break;
      case "wildAnimal":
      case "bird":
      case "creature":
      case "tree":
      case "plant":
      case "crop":
      case "livestock":
      case "beast":
        if (biomeItems(ctx, name).length === 0) return false;
        break;
      case "god":
        if (ctx.sensitive) return false;
        break;
      case "previous":
        if (!ctx.previous) return false;
        break;
      case "spaceLand":
        if (ctx.setting !== "SF") return false;
        break;
      case "dayWork":
      case "dayElement":
      case "extraDays":
      case "skyFigure":
      case "skyObject":
      case "skyBodyPart":
      case "skyQuality":
      case "skyKin":
      case "skyRiver":
      case "skyHeaven":
      case "festNoun":
      case "festBlessing":
        if (poolWords(ctx, name, null).length === 0) return false;
        break;
    }
  }
  return true;
}

/** §9: a plan's weight here: eras, genre, cultures and their multipliers, the system, tone, and whether its tokens can draw. */
function planWeight(ctx: Ctx, plan: Plan): number {
  const s = plan.shape;
  if (s.e && !inEras(s.e, ctx.era)) return 0;
  if (s.h !== undefined && s.h !== ctx.fantastic) return 0;
  if (s.sp && !ctx.land.space) return 0;
  if (s.sys && (!ctx.system || !s.sys.includes(ctx.system))) return 0;
  if (s.ns && ctx.sensitive) return 0;
  if (s.ch && !isChristianCulture(ctx.culture, ctx.era)) return 0;
  if (blockedTone(ctx, plan.tones)) return 0;
  let mult = 1;
  if (s.c) {
    if (!s.c.includes(ctx.culture) && !s.all) return 0;
  }
  if (s.cx) mult *= s.cx[ctx.culture] ?? 1;
  if (s.cm) mult *= isChristianCulture(ctx.culture, ctx.era) ? s.cm.christian : s.cm.other;
  if (ctx.sensitive && /\{(god|holy)/.test(plan.p)) return 0;
  if (!viable(ctx, plan.p)) return 0;
  return plan.w * mult * toneFactor(plan.tones, ctx.tone);
}

function plansFor(ctx: Ctx, kind: string, filter?: (p: Plan) => boolean): [Plan, number][] {
  return (PLANS[kind] ?? [])
    .filter((p) => !p.shape.cn && !p.p.startsWith("@") && (!filter || filter(p)))
    .map((p): [Plan, number] => [p, planWeight(ctx, p)])
    .filter(([, w]) => w > 0);
}

// ── Acceptance ──────────────────────────────────────────────────────────────

interface Rules {
  block: Set<string>;
}

let RULES: Rules = { block: timeBlockSet() };

function acceptable(ctx: Ctx, text: string, kind: TimeKind, culture = false): boolean {
  const counted = countedWords(text);
  if (counted.length === 0 || counted.length > TIME_SKY.cap) return false;
  if (repeatsContent(counted)) return false;
  if (RULES.block.has(bare(text)) || TIME_SKY.safeguards.kindBlock[kind]?.some((b) => bare(b) === bare(text))) return false;
  if (breaksTimeWords(text)) return false;
  if (!culture && hasRealDivineName(text)) return false;
  if (isFutureEra(ctx.era) && hasSpaceBlock(text)) return false;
  return true;
}

function finish(ctx: Ctx, kind: TimeKind, raw: string): string {
  let text = raw;
  if (ARTICLE_KINDS.includes(kind) && !/^(the |\[)/i.test(text)) text = `the ${text}`;
  return timeCapitals(text);
}

/** One generated name from the kind's plans (30 tries). */
function buildName(ctx: Ctx, kind: TimeKind, filter?: (p: Plan) => boolean, only?: string): TimeName | undefined {
  for (let i = 0; i < 30; i++) {
    ctx.drawn = new Set();
    ctx.log = [];
    const plans = plansFor(ctx, kind, only ? (p) => p.p === only : filter);
    const plan = pickWeighted(plans, ctx.rng);
    if (!plan) return undefined;
    const raw = renderPattern(ctx, plan.p);
    if (!raw) continue;
    const text = finish(ctx, kind, raw);
    if (!acceptable(ctx, text, kind)) continue;
    const tones = new Set<GroupTone>([...plan.tones, ...ctx.drawn]);
    return { text, kind, shape: plan.p, tones: GROUP_TONES.filter((t) => tones.has(t)), words: ctx.log, ...(ctx.season ? { season: ctx.season } : {}) };
  }
  return undefined;
}

// ── Culture names (§8) ──────────────────────────────────────────────────────

interface Candidate {
  text: string;
  row?: CultureRow;
  loan?: string;
  position?: number;
}

/** The rows of a culture and kind for an era in a system (or any of `systems`). */
function rowsFor(ctx: Ctx, kind: TimeKind, systems: string[]): CultureRow[] {
  return cultureRows(ctx.culture, kind).filter((r) => inEras(r.e, ctx.era) && (!r.sys || r.sys.some((s) => systems.includes(s))));
}

/** §8.4 (and §9.1): the seasonal form "First Month of Spring" counts as a culture name for steppe, chinese and korean. */
function seasonalForms(ctx: Ctx, systems: string[]): string[] {
  const allowed = TIME_SKY.seasonalMonths[ctx.culture];
  if (!allowed || !allowed.some((s) => systems.includes(s)) || !ctx.cycle) return [];
  const months = TIME_SKY.years[systems[0]]?.months ?? 12;
  const ring = layoutRing(months, ctx.cycle);
  return [...new Set(ring.map((slot) => `${cap(TIME_SKY.lists.position[slot.pos === "first" ? 0 : slot.pos === "middle" ? 1 : 2].toLowerCase())} Month of ${seasonPhrase(slot.season!)}`))];
}

/** §8.1: a separate culture name: any position for months and days, any eligible row. */
function cultureNameCandidates(ctx: Ctx, kind: TimeKind, systems: string[]): Candidate[] {
  const rows = rowsFor(ctx, kind, systems).filter((r) => r.p !== "leap" && r.p !== "extra");
  const out: Candidate[] = rows.map((row) => ({ text: row.n, row, ...(row.loan ? { loan: row.loan } : {}) }));
  if (kind === "month") for (const text of seasonalForms(ctx, systems)) out.push({ text });
  return out;
}

function cultureName(ctx: Ctx, kind: TimeKind, systems: string[]): TimeName | undefined {
  const items = cultureNameCandidates(ctx, kind, systems).filter((c) => !blockedTone(ctx, undefined));
  for (let i = 0; i < 20 && items.length > 0; i++) {
    const c = pickOne(items, ctx.rng);
    const useLoan = !!c.loan && ctx.words === "loanwords" && ctx.rng() < TIME_SKY.loanShare;
    const text = c.row ? (useLoan ? c.loan! : c.text) : timeCapitals(c.text);
    if (!acceptable(ctx, text, kind, true)) continue;
    return { text, kind, shape: "culture names", tones: [], words: [], real: true, ...(useLoan ? { loan: true } : {}) };
  }
  return undefined;
}

// ── Systems ─────────────────────────────────────────────────────────────────

function drawSystem(ctx: Ctx, cell: [string, number][]): string | undefined {
  if (cell.length === 0) return undefined;
  return cell.length === 1 ? cell[0][0] : pickWeighted(cell, ctx.rng);
}

// ── Separate names ──────────────────────────────────────────────────────────

/** The systems a kind's culture names may use, from the table. */
function kindSystems(ctx: Ctx, kind: TimeKind): string[] {
  switch (kind) {
    case "month":
    case "moon":
      return monthSystems(ctx.culture, ctx.era, ctx.land).map(([k]) => k);
    case "day":
      return weekSystems(ctx.culture, ctx.era).map(([k]) => k);
    case "festival":
      return festivalCycles(ctx.culture, ctx.era, ctx.land).map(([k]) => k);
    case "sign":
      return signSystems(ctx.culture, ctx.era).map(([k]) => k);
    default:
      return [];
  }
}

const SKY_CULTURE_NAMES = new Set<TimeKind>(["constellation", "sign", "light"]);

function separateName(ctx: Ctx, kind: TimeKind, only?: string): TimeName | undefined {
  const systems = kindSystems(ctx, kind);
  const sys = kind === "day" || kind === "month" ? drawSystem(ctx, kind === "day" ? weekSystems(ctx.culture, ctx.era) : monthSystems(ctx.culture, ctx.era, ctx.land)) : undefined;
  const c = { ...ctx, kind, system: sys, season: null, position: undefined, ownPos: undefined, distinct: false, fixed: {} };
  if (SKY_CULTURE_NAMES.has(kind)) {
    const cnPlan = (PLANS[kind] ?? []).find((p) => p.shape.cn);
    const others = plansFor(c, kind, only ? (p) => p.p === only : undefined).reduce((n, [, w]) => n + w, 0);
    const cnW = !only && cnPlan ? (kind === "sign" ? 30 : cnPlan.w) : 0;
    if (cnW > 0 && skyNamesFor(c, kind).length > 0 && c.rng() * (cnW + others) < cnW) {
      const n = skyCultureName(c, kind);
      if (n) return n;
    }
    return kind === "sign" ? buildSign(c, only) : buildName(c, kind, undefined, only);
  }
  if (kind !== "moon" && !only) {
    const cnPlan = (PLANS[kind] ?? []).find((p) => p.shape.cn);
    const others = plansFor(c, kind).reduce((n, [, w]) => n + w, 0);
    if (cnPlan && cultureNameCandidates(c, kind, systems).length > 0 && c.rng() * (cnPlan.w + others) < cnPlan.w) {
      const n = cultureName(c, kind, systems);
      if (n) return n;
    }
  }
  return buildName(c, kind, undefined, only);
}

/** §9.7: star signs draw from the constellation shapes with changed weights, and no possessive or numbered shapes. */
const SIGN_WEIGHT: Record<string, number> = { "the {wildAnimal}": 0, "the {beast}": 25, "the {skyFigure}": 15, "the {skyObject}": 15 };
function signPlans(ctx: Ctx): [Plan, number][] {
  const base = plansFor(ctx, "constellation", (p) => !p.shape.poss && !p.shape.numbered && !/:poss|'s /.test(p.p) && !p.p.startsWith("the {wildAnimal}"));
  const beast: Plan = { shape: { k: "sign", p: "the {beast}", w: 25 }, p: "the {beast}", tones: [], w: 25 };
  const out = base.map(([p, w]): [Plan, number] => [p.p in SIGN_WEIGHT ? { ...p, w: SIGN_WEIGHT[p.p] } : p, p.p in SIGN_WEIGHT ? (w / p.w) * SIGN_WEIGHT[p.p] : w]);
  if (planWeight(ctx, beast) > 0) out.push([beast, planWeight(ctx, beast)]);
  return out.filter(([, w]) => w > 0);
}

function buildSign(ctx: Ctx, only?: string): TimeName | undefined {
  for (let i = 0; i < 30; i++) {
    ctx.drawn = new Set();
    ctx.log = [];
    const plans = signPlans(ctx).filter(([p]) => !only || p.p === only);
    const plan = pickWeighted(plans, ctx.rng);
    if (!plan) return undefined;
    const raw = renderPattern(ctx, plan.p);
    if (!raw) continue;
    const text = finish(ctx, "sign", raw);
    if (!acceptable(ctx, text, "sign")) continue;
    const tones = new Set<GroupTone>([...plan.tones, ...ctx.drawn]);
    return { text, kind: "sign", shape: plan.p, tones: GROUP_TONES.filter((t) => tones.has(t)), words: ctx.log };
  }
  return undefined;
}

// ── Series: the year (§6.2, §10) ────────────────────────────────────────────

/** A line of a series before it is named. */
interface Line {
  type: "month" | "leap" | "extra";
  slot?: Slot;
  /** The ring index, and the 1-based place in the culture's own year. */
  idx?: number;
  own?: number;
  name?: TimeName;
  /** For leap lines: the own position it follows. */
  after?: number;
  /** For extra lines: the number of days. */
  days?: number | null;
}

interface Series {
  seed: number;
  ctx: Ctx;
  options: TimeSkyOptions;
  seen: Set<string>;
  notices: string[];
  realShare: number;
  /** The neutral sky names a days planets theme read. */
  sky?: string[];
}

const shuffle = <T>(items: T[], rng: () => number): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const isLeapYear = (rng: () => number) => rng() < TIME_SKY.leapShare[0] / TIME_SKY.leapShare[1];

/** §10.1: real names are tried slot by slot in a random order, each at 25%, until half the lines are real. */
function applyReal(S: Series, lines: { candidates: () => TimeName[]; set: (n: TimeName) => void }[]) {
  const cap = Math.floor(lines.length / 2);
  let real = 0;
  for (const i of shuffle(lines.map((_, k) => k), S.ctx.rng)) {
    if (real >= cap) break;
    const options = lines[i].candidates().filter((n) => !S.seen.has(n.text.toLowerCase()));
    if (options.length === 0 || S.ctx.rng() >= S.realShare) continue;
    const n = pickOne(options, S.ctx.rng);
    S.seen.add(n.text.toLowerCase());
    lines[i].set(n);
    real++;
  }
}

/** A real month name for an own position (and season) in a system: culture rows, with loans never (festivals only). */
function monthCandidates(S: Series, system: string, line: Line, kind: "month" | "moon" = "month"): TimeName[] {
  const ctx = S.ctx;
  const rows = rowsFor(ctx, "month", [system]);
  const months = TIME_SKY.years[system].months;
  const out: CultureRow[] = rows.filter((r) => {
    if (line.type === "leap") return r.p === "leap";
    if (line.type === "extra") return r.p === "extra";
    if (r.p === "leap" || r.p === "extra") return false;
    if (typeof r.p === "number") return ownPosition(r, ctx.culture, ctx.era, months) === line.own;
    return !!r.s && r.s === line.slot?.season;
  });
  const names = out.filter((r) => !r.n.includes("{ordinal}") || !!line.after).map((r) => ({ text: r.n.replace("{ordinal}", ordinalWord(line.after ?? 1)), row: r }));
  if (line.type === "month" && kind === "month") {
    for (const text of seasonalForms(ctx, [system])) {
      const slotText = line.slot ? `${cap(TIME_SKY.lists.position[line.slot.pos === "first" ? 0 : line.slot.pos === "middle" ? 1 : 2].toLowerCase())} Month of ${seasonPhrase(line.slot.season!)}` : "";
      if (text === slotText) names.push({ text: timeCapitals(text), row: undefined as unknown as CultureRow });
    }
  }
  const seenText = new Set<string>();
  return names
    .filter((n) => !seenText.has(n.text) && acceptable(ctx, n.text, "month", true))
    .map((n) => {
      seenText.add(n.text);
      return { text: n.text, kind: "month" as const, shape: "culture names", tones: [], words: [], real: true, ...(typeof n.row?.p === "number" ? { position: line.own } : {}) };
    });
}

const NUMBER_START = /^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|one|two|three|four|five|six|seven|eight|nine|ten|\d)/i;

function monthTheme(S: Series, lines: Line[]): string {
  const ctx = S.ctx;
  const mult = TIME_SKY.themes.monthMult;
  const options = TIME_SKY.themes.month
    .filter(([t]) => {
      if (ctx.land.space) return t === "ordinal" || t === "gods" || t === "festivals";
      return true;
    })
    .filter(([t]) => {
      if (t === "gods") return !ctx.sensitive && ctx.mode === "invented";
      if (t === "festivals") return ctx.era === "AN" && ["greek-byzantine", "roman"].includes(ctx.culture);
      if (t === "nature") return biomeItems(ctx, "tree").length + biomeItems(ctx, "wildAnimal").length > 0;
      if (t === "seasons" || t === "work" || t === "positions") return !ctx.land.space && !!ctx.cycle;
      return true;
    })
    .map(([t, w]): [string, number] => [t, w * (mult[t]?.[ctx.culture] ?? 1)]);
  void lines;
  return pickWeighted(options, ctx.rng) ?? "ordinal";
}

const THEME_PATTERNS: Record<string, string[]> = {
  seasons: ["{seasonWord} Month", "Month of {seasonWord}", "{seasonWord}"],
  work: ["{workWord} Month"],
  nature: ["{tree} Month", "{wildAnimal} Month", "{bird} Month", "{crop}-Sowing", "{crop} Harvest"],
  gods: ["{god:poss} Month"],
  ordinal: ["{ordinal} Month", "{ordinal} Cycle"],
  positions: ["{position} Month of {season}"],
  festivals: ["Month of the {festival}"],
};

/** Names a generated line with the theme's patterns, then (after 20 tries) any shape of the kind. */
function themedLine(S: Series, kind: TimeKind, line: { season: string | null; position?: string; ownPos?: number; previous?: string; system?: string }, patterns: string[] | undefined, extraFilter?: (p: Plan) => boolean): TimeName | undefined {
  for (let attempt = 0; attempt < 60; attempt++) {
    const relaxed = attempt >= 20;
    const ctx: Ctx = { ...S.ctx, kind, season: line.season, position: line.position, ownPos: line.ownPos, previous: line.previous, system: line.system ?? S.ctx.system, distinct: !relaxed, drawn: new Set(), log: [], fixed: {} };
    const filter = (p: Plan) => !p.shape.pairs && (relaxed || !patterns || patterns.includes(p.p)) && (!extraFilter || extraFilter(p));
    const n = buildName(ctx, kind, filter);
    if (!n) continue;
    if (S.seen.has(n.text.toLowerCase())) continue;
    if (ctx.distinct) for (const k of ctx.used) S.ctx.used.add(k);
    S.seen.add(n.text.toLowerCase());
    return line.season && !n.season ? { ...n, season: line.season } : n;
  }
  return undefined;
}

function monthSeries(S: Series, systemKey: string, forMoons: boolean): TimeName[] | undefined {
  const ctx = S.ctx;
  const sys = TIME_SKY.years[systemKey];
  const months = forMoons ? 12 : sys.months;
  const ring = layoutRing(months, ctx.cycle);
  const own = ownYearStart(ctx.culture, ctx.era, ring);
  let start = own;
  if (S.options.start && S.options.start !== "own" && ctx.cycle) {
    const i = ring.findIndex((s) => s.season === S.options.start);
    if (i >= 0) start = i;
  }
  const lines: Line[] = [];
  const leap = isLeapYear(ctx.rng);
  let after: number | undefined;
  if (forMoons) {
    const lunar = !["julian-12", "egyptian-civil", "ethiopian-13", "persian-solar", "aztec-18", "maya-haab", "fixed-13", "icelandic-12", "darian-24"].includes(systemKey);
    if (leap && (!lunar || sys.leap || !lunar)) {
      if (sys.leap?.after) after = pickOne(sys.leap.after, ctx.rng);
      else if (sys.leap?.uniform) after = 1 + Math.floor(ctx.rng() * months);
      else after = months;
    }
  } else if (sys.leap && leap) {
    after = sys.leap.after ? pickOne(sys.leap.after, ctx.rng) : 1 + Math.floor(ctx.rng() * months);
  }
  const extraSys = forMoons ? undefined : sys.extra;
  for (let k = 0; k < months; k++) {
    const idx = (start + k) % months;
    const q = ((idx - own + months) % months) + 1;
    if (after === 0 && q === 1) lines.push({ type: "leap", slot: ring[idx], after: 0, idx });
    lines.push({ type: "month", slot: ring[idx], idx, own: q });
    if (after === q && after > 0) lines.push({ type: "leap", slot: ring[idx], after: q, idx });
    if (extraSys && q === months) lines.push({ type: "extra", slot: ring[idx], idx, days: extraSys.count });
  }
  if (forMoons) return moonSeries(S, lines, ring);
  // Real names.
  applyReal(
    S,
    lines.map((line) => ({ candidates: () => monthCandidates(S, systemKey, line), set: (n) => (line.name = { ...n, ...(line.slot?.season ? { season: line.slot.season } : {}) }) })),
  );
  const theme = monthTheme(S, lines);
  S.ctx.fixed = {};
  // Pairs (§10.2).
  const monthLines = lines.filter((l) => l.type === "month");
  const pairShare = TIME_SKY.themes.pairShare;
  const wantsPair = (theme === "seasons" && ["anglo-saxon", "celtic", "norse"].includes(ctx.culture) && inEras("AN-MD", ctx.era)) || (["aztec", "maya"].includes(ctx.culture) && inEras("AN-EM", ctx.era));
  if (wantsPair && ctx.rng() < pairShare) {
    const spots: number[] = [];
    for (let i = 0; i + 1 < lines.length; i++) if (lines[i].type === "month" && lines[i + 1].type === "month" && !lines[i].name && !lines[i + 1].name) spots.push(i);
    if (spots.length > 0) {
      const i = pickOne(spots, ctx.rng);
      const aztec = ["aztec", "maya"].includes(ctx.culture);
      let a: string, b: string;
      if (aztec) {
        const pf = token({ ...ctx, fixed: {}, season: null, distinct: false, drawn: new Set(), log: [] }, "pairFeast") ?? "Vigil";
        [a, b] = [`Little ${pf}`, `Great ${pf}`];
      } else {
        const season = lines[i].slot?.season ?? "winter";
        const turning = pickOne(TIME_SKY.lists.turningOf[season] ?? TIME_SKY.lists.turning, ctx.rng);
        [a, b] = [`Before ${turning}`, `After ${turning}`];
      }
      const texts = [timeCapitals(a), timeCapitals(b)];
      if (texts.every((t) => acceptable(ctx, t, "month") && !S.seen.has(t.toLowerCase()))) {
        texts.forEach((t, k) => {
          S.seen.add(t.toLowerCase());
          lines[i + k].name = { text: t, kind: "month", shape: k === 0 ? (aztec ? "Little {pairFeast}" : "Before {turning}") : aztec ? "Great {pairFeast}" : "After {turning}", tones: [], words: [], season: lines[i + k].slot?.season ?? undefined };
        });
      }
    }
  }
  void monthLines;
  // Generated month lines, in order.
  for (const line of lines) {
    if (line.name || line.type !== "month") continue;
    const patterns = THEME_PATTERNS[theme];
    const n = themedLine(S, "month", { season: line.slot?.season ?? null, position: cap(TIME_SKY.lists.position[line.slot!.pos === "first" ? 0 : line.slot!.pos === "middle" ? 1 : 2].toLowerCase()), ownPos: line.own }, patterns, themePlanFilter("month", theme, ctx));
    line.name = n ?? { text: timeCapitals(`${ordinalWord(line.own!)} Month`), kind: "month", shape: "{ordinal} Month", tones: [], words: [] };
    if (!n) S.seen.add(line.name.text.toLowerCase());
  }
  // Leap and extra days lines (§9.2), named last: they read the month before.
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.name || line.type === "month") continue;
    const prev = i > 0 ? lines[i - 1].name?.text : undefined;
    const real = lines.filter((l) => l.name?.real).length;
    line.name = nameSpecial(S, line, systemKey, prev, real < Math.floor(lines.length / 2));
  }
  S.ctx.fixed = {};
  return lines.map((line) => {
    const n = line.name!;
    const season = line.slot?.season ?? undefined;
    const tag = line.type === "leap" ? "leap month" : line.type === "extra" ? (line.days ? `extra days, ${line.days}` : "extra days") : season ? seasonPhrase(season) : undefined;
    return { ...n, ...(season ? { season } : {}), ...(line.type === "leap" ? { leap: true } : {}), ...(line.type === "extra" ? { extra: true } : {}), ...(tag ? { tag } : {}) };
  });
}

/** A theme's own filter: gods in christian cultures read saints in the festival themes (§10.4). */
function themePlanFilter(_kind: string, _theme: string, _ctx: Ctx): ((p: Plan) => boolean) | undefined {
  return undefined;
}

/** §9.2: a leap month or extra days line. */
function nameSpecial(S: Series, line: Line, systemKey: string, previous: string | undefined, allowReal: boolean): TimeName {
  const ctx = S.ctx;
  const fixed = (text: string, shape: string): TimeName => {
    S.seen.add(text.toLowerCase());
    return { text: timeCapitals(text), kind: "month", shape, tones: [], words: [] };
  };
  if (line.type === "extra") {
    if (systemKey === "fixed-13") return fixed("Year Day", "Year Day");
    if (systemKey === "romulus-10") return fixed("the Winter Days", "the Winter Days");
  }
  const rows = monthCandidates(S, systemKey, line).filter((n) => !S.seen.has(n.text.toLowerCase()));
  const weights = line.type === "leap" ? { cn: 50, kinds: [["Second {previous}", 20], ["Leap {previous}", 10], ["@fixed", 20]] as [string, number][] } : { cn: 50, kinds: [["the {extraDays} Days", 30], ["{seasonWord} Days", 10]] as [string, number][] };
  const options: [string, number][] = [];
  if (rows.length > 0 && allowReal) options.push(["@cn", weights.cn]);
  for (const [p, w] of weights.kinds) {
    if (p.includes("{previous}") && (!previous || NUMBER_START.test(previous) || /^(second|leap)\b/i.test(previous))) continue;
    options.push([p, w]);
  }
  for (let attempt = 0; attempt < 30; attempt++) {
    const choice = pickWeighted(options, ctx.rng);
    if (choice === "@cn") {
      const n = pickOne(rows, ctx.rng);
      S.seen.add(n.text.toLowerCase());
      return n;
    }
    if (choice === "@fixed") {
      const text = timeCapitals(pickOne(["Extra Month", "Added Month", "Thirteenth Month"], ctx.rng));
      if (!S.seen.has(text.toLowerCase())) return fixed(text, "Extra Month");
      continue;
    }
    if (!choice) break;
    const c: Ctx = { ...ctx, season: line.slot?.season ?? null, previous, distinct: false, drawn: new Set(), log: [], fixed: {} };
    const raw = renderPattern(c, choice);
    if (!raw) continue;
    const text = timeCapitals(raw);
    if (acceptable(ctx, text, "month") && !S.seen.has(text.toLowerCase())) {
      S.seen.add(text.toLowerCase());
      return { text, kind: "month", shape: choice, tones: [], words: c.log };
    }
  }
  const text = line.type === "leap" ? "Extra Month" : "Extra Days";
  return fixed(S.seen.has(text.toLowerCase()) ? `${text} Again` : text, text);
}

/** §10.5: one moon per month of the year, plus a 13th at 7 in 19 (or the lunar year's leap month). */
function moonSeries(S: Series, lines: Line[], _ring: Slot[]): TimeName[] {
  const ctx = S.ctx;
  const theme = pickWeighted(TIME_SKY.themes.moon.map(([t, w]): [string, number] => [t, ctx.cycle ? w : t === "mixed" ? w : 0]), ctx.rng) ?? "mixed";
  const patterns: Record<string, string[] | undefined> = {
    seasons: ["{seasonWord} Moon", "Moon of {seasonWord}"],
    nature: ["{wildAnimal} Moon", "{bird} Moon", "{tree} Moon", "{crop} Moon"],
    mixed: undefined,
  };
  void _ring;
  const out: TimeName[] = [];
  for (const line of lines) {
    if (line.type === "leap") {
      const options = (PLANS.moonleap ?? []).filter((p) => !blockedTone(ctx, p.tones));
      const p = pickWeighted(options.map((x): [Plan, number] => [x, toneFactor(x.tones, ctx.tone)]), ctx.rng);
      let text = p ? timeCapitals(p.p) : "Lone Moon";
      if (S.seen.has(text.toLowerCase())) text = "Lone Moon";
      S.seen.add(text.toLowerCase());
      out.push({ text, kind: "moon", shape: p?.p ?? "Lone Moon", tones: p?.tones ?? [], words: [], leap: true, tag: "leap moon" });
      continue;
    }
    const n = themedLine(S, "moon", { season: line.slot?.season ?? null }, patterns[theme]);
    const name = n ?? { text: timeCapitals(`${ordinalWord(line.own!)} Moon`), kind: "moon" as const, shape: "{ordinal} Moon", tones: [], words: [] };
    out.push({ ...name, kind: "moon", ...(line.slot?.season ? { tag: seasonPhrase(line.slot.season) } : {}) });
  }
  return out;
}

// ── Series: days (§10.3) ────────────────────────────────────────────────────

const PLANET_SLOT: Record<string, number> = { Sun: 4, Moon: 7, Mars: 3, Mercury: 6, Jupiter: 2, Venus: 5, Saturn: 1 };
const ELEMENT_OF: Record<string, string> = { Mars: "Fire", Mercury: "Water", Jupiter: "Wood", Venus: "Metal", Saturn: "Earth" };

export type { Series as TimeSeriesState };

const kinPossessive = (name: string) => {
  const text = name.replace(/^the /, "");
  const last = text.split(" ").pop() ?? "";
  return (BUILT_IN_VOCAB.pools.skyKin?.entries ?? []).some((e) => e.w === last) ? groupPossessive(text, false) : text;
};

function dayRows(S: Series, system: string, n: number): CultureRow[][] {
  const out: CultureRow[][] = Array.from({ length: n }, () => []);
  for (const r of rowsFor(S.ctx, "day", [system])) if (typeof r.p === "number" && r.p <= n) out[r.p - 1].push(r);
  return out;
}

function daySeries(S: Series, systemKey: string): TimeName[] {
  const ctx = S.ctx;
  const sys = TIME_SKY.weeks[systemKey];
  const n = sys.days;
  const rowsBySlot = dayRows(S, systemKey, n);
  const lines: (TimeName | undefined)[] = Array.from({ length: n }, () => undefined);
  const set = (i: number, name: TimeName) => (lines[i] = name);
  const plain = (text: string, shape: string, extra: Partial<TimeName> = {}): TimeName => ({ text: timeCapitals(text), kind: "day", shape, tones: [], words: [], slot: 0, ...extra });
  // Real names.
  applyReal(
    S,
    lines.map((_, i) => ({
      candidates: () => rowsBySlot[i].map((r) => ({ ...{ ...plain(r.n, "culture names", { real: true }), text: r.n }, slot: i + 1 })).filter((c) => acceptable(ctx, c.text, "day", true)),
      set: (nm) => set(i, nm),
    })),
  );
  const open = () => lines.map((l, i) => (l ? -1 : i)).filter((i) => i >= 0);
  const fill = (i: number, text: string, shape: string, tones: GroupTone[] = []) => {
    const t = timeCapitals(text);
    if (!acceptable(ctx, t, "day") || S.seen.has(t.toLowerCase())) return false;
    S.seen.add(t.toLowerCase());
    set(i, { ...plain(t, shape), tones, slot: i + 1 });
    return true;
  };
  const themed = (i: number, patterns: string[] | undefined, extra: Partial<Ctx> = {}) => {
    const nm = themedLine(S, "day", { season: null, ownPos: i + 1, system: systemKey }, patterns);
    if (nm) set(i, { ...nm, slot: i + 1 });
    return !!nm;
  };
  // The theme.
  let theme: string;
  let themeOpts: [string, number][];
  if (systemKey === "market-4" || systemKey === "nundinal-8") themeOpts = TIME_SKY.themes.market;
  else if (systemKey === "day-signs-20") themeOpts = [["signs", 1]];
  else if (systemKey === "moon-nights-30") themeOpts = [["moon", 1]];
  else if (systemKey === "rokuyo-6" || systemKey === "soviet-5") themeOpts = [["ordinal", 1], ["colour", 1]];
  else themeOpts = TIME_SKY.themes.day;
  themeOpts = themeOpts.filter(([t]) => {
    if (t === "planets") return systemKey === "week-7";
    if (t === "elements") return systemKey === "week-7" && ["chinese", "japanese", "korean", "steppe"].includes(ctx.culture);
    if (t === "gods") return !ctx.sensitive && ctx.mode === "invented";
    if (t === "towns" || t === "goods") return true;
    return true;
  });
  theme = pickWeighted(themeOpts, ctx.rng) ?? "ordinal";
  let skyNames: string[] | undefined;
  const planetsFor = (slotList: number[]) => {
    skyNames ??= (S.sky = lightSeries(neutralCtx(S), S, true).map((x) => x.text));
    if (!skyNames) return;
    for (const i of slotList) {
      if (lines[i]) continue;
      const planet = sys.planets![i];
      const light = skyNames[PLANET_SLOT[planet] - 1];
      if (light) fill(i, `${kinPossessive(light)} Day`, "{light} Day");
    }
  };
  const restDay = sys.rest ? sys.rest - 1 : -1;
  switch (theme) {
    case "planets":
      planetsFor(open());
      break;
    case "elements": {
      planetsFor(open().filter((i) => ["Sun", "Moon"].includes(sys.planets![i])));
      for (const i of open()) {
        const el = ELEMENT_OF[sys.planets![i]];
        if (el) fill(i, `${el} Day`, "{dayElement} Day");
      }
      break;
    }
    case "gods":
      for (const i of open()) themed(i, ["{god:poss} Day"]);
      break;
    case "work": {
      let rest = 0;
      let market = 0;
      for (const i of open()) {
        for (let k = 0; k < 40 && !lines[i]; k++) {
          const nm = themedLine(S, "day", { season: null, ownPos: i + 1, system: systemKey }, ["{dayWork} Day"]);
          if (!nm) break;
          if (/^Rest Day$/.test(nm.text) && rest++ > 0) { S.seen.delete(nm.text.toLowerCase()); continue; }
          if (/^Market Day$/.test(nm.text) && market++ > 0) { S.seen.delete(nm.text.toLowerCase()); continue; }
          set(i, { ...nm, slot: i + 1 });
        }
      }
      break;
    }
    case "towns":
    case "goods": {
      const pattern = theme === "towns" ? "{town} Market Day" : "{goods} Market Day";
      const market = systemKey === "market-4" ? open() : open().filter((i) => i === 0);
      for (const i of market) themed(i, [pattern]);
      break;
    }
    case "signs":
      for (const i of open()) themed(i, ["{wildAnimal}", "{bird}", "{daySign}"]);
      break;
    case "moon": {
      const used = new Map<string, number>();
      for (const i of open()) {
        const night = i + 1;
        const list = night < 15 ? TIME_SKY.lists.moonWaxing : night === 15 ? TIME_SKY.lists.moonFull : TIME_SKY.lists.moonFading;
        const at = night < 15 ? Math.floor(((night - 1) * list.length) / 14) : night === 15 ? Math.floor(ctx.rng() * list.length) : Math.floor(((night - 16) * list.length) / 15);
        const word = list[at];
        const seen = (used.get(word) ?? 0) + 1;
        used.set(word, seen);
        const text = seen > 1 ? `${ordinalWord(seen)} ${word}` : word;
        const t = timeCapitals(text);
        if (acceptable(ctx, t, "day")) { S.seen.add(t.toLowerCase()); set(i, { ...plain(t, "{moonPhase}"), slot: night }); }
      }
      break;
    }
    case "colour":
      for (const i of open()) themed(i, ["{colour} Day"]);
      break;
    default: {
      // Ordinal: "{ordinal} Day"; the week's last day Rest Day at 50%; market weeks name their market days.
      const marketWeek = systemKey === "market-4";
      for (const i of open()) {
        if (i === n - 1 && (restDay === i || (sys.rest === undefined && ctx.rng() < 0.5)) && fill(i, "Rest Day", "Rest Day")) continue;
        if (systemKey === "nundinal-8" && i === 0 && fill(i, "Market Day", "Market Day")) continue;
        fill(i, `${ordinalWord(i + 1)} ${marketWeek ? "Market Day" : "Day"}`, "{ordinal} Day");
      }
    }
  }
  // Slots a theme could not fill: the nundinal rest of the week as ordinals, and anything left.
  for (const i of open()) {
    if (systemKey === "nundinal-8" && i > 0 && (theme === "towns" || theme === "goods")) fill(i, `${ordinalWord(i + 1)} Day`, "{ordinal} Day");
    if (!lines[i]) {
      const nm = themedLine(S, "day", { season: null, ownPos: i + 1, system: systemKey }, undefined);
      if (nm) set(i, { ...nm, slot: i + 1 });
    }
    if (!lines[i]) fill(i, `${ordinalWord(i + 1)} Day`, "{ordinal} Day") || fill(i, `${ordinalWord(i + 1)} Day of the Week`, "{ordinal} Day");
  }
  S.ctx.fixed = {};
  void kinPossessive;
  return lines.map((l, i) => ({ ...l!, slot: i + 1 }));
}

// ── Series: festivals (§10.4) ───────────────────────────────────────────────

interface FestSlot {
  /** Ring index, the item's place in its cycle (1-based), and the season of the slot. */
  idx: number;
  item: number;
  season: string | null;
}

function festivalSlots(S: Series, cycleKey: string): { slots: FestSlot[]; ringSize: number; own: number; start: number } {
  const ctx = S.ctx;
  const cyc = TIME_SKY.festivals[cycleKey];
  let ringSize = 12;
  if (cyc.count === "months") {
    const sys = drawSystem(ctx, monthSystems(ctx.culture, ctx.era, ctx.land)) ?? "julian-12";
    ringSize = TIME_SKY.years[sys].months;
    ctx.system = sys;
  }
  const ring = layoutRing(ringSize, ctx.cycle);
  const own = ownYearStart(ctx.culture, ctx.era, ring);
  const slots: FestSlot[] = [];
  const at = (idx: number, item: number) => slots.push({ idx: idx % ringSize, item, season: ring[idx % ringSize].season });
  const starts = (count: number) => {
    const firsts = ring.map((s, i) => (i === 0 || ring[i - 1].season !== s.season ? i : -1)).filter((i) => i >= 0);
    return firsts.length === count ? firsts : Array.from({ length: count }, (_, k) => Math.round((k * ringSize) / count));
  };
  switch (cyc.placed) {
    case "quarters":
      for (let k = 0; k < 4; k++) at(own + Math.round((k * ringSize) / 4), k + 1);
      break;
    case "season-starts": {
      const count = cyc.count === "seasons" ? new Set(ring.map((s) => s.season)).size : (cyc.count as number);
      starts(count).forEach((i, k) => at(i, k + 1));
      break;
    }
    case "months": {
      const ms = cyc.months ?? Array.from({ length: ringSize }, (_, k) => k + 1);
      ms.forEach((m, k) => at(own + m - 1, k + 1));
      break;
    }
    case "pairs":
      for (let t = 0; t < 24; t++) at(own + Math.floor(t / 2), t + 1);
      break;
  }
  let start = own;
  if (S.options.start && S.options.start !== "own" && ctx.cycle) {
    const i = ring.findIndex((s) => s.season === S.options.start);
    if (i >= 0) start = i;
  }
  slots.sort((a, b) => ((a.idx - start + ringSize) % ringSize) - ((b.idx - start + ringSize) % ringSize) || a.item - b.item);
  return { slots, ringSize, own, start };
}

const FESTIVAL_THEME_PATTERNS: Record<string, string[]> = {
  seasons: ["Feast of {seasonWord}", "{seasonWord} Home", "{season} Fire", "{seasonWord} Fires"],
  gods: ["Feast of {god}", "{god:poss} Day"],
  holy: ["Feast of {holy}", "{holy:poss} Day", "{holy:poss} Eve"],
  work: ["Feast of {workWord}", "{crop} Festival", "Blessing of {festBlessing}", "Running of the {livestock:pl}"],
};

function festivalSeries(S: Series, cycleKey: string): TimeName[] {
  const ctx = S.ctx;
  const { slots } = festivalSlots(S, cycleKey);
  const space = ctx.land.space;
  const christian = isChristianCulture(ctx.culture, ctx.era) && inEras("MD+", ctx.era);
  const themes = TIME_SKY.themes.festival.filter(([t]) => {
    if (t === "seasons" || t === "work") return !space && !!ctx.cycle;
    if (t === "gods") return (!ctx.sensitive && ctx.mode === "invented") || (christian && ctx.mode === "invented");
    if (t === "commemorations") return inEras("ST+", ctx.era);
    return true;
  });
  const theme = pickWeighted(themes, ctx.rng) ?? "seasons";
  const rows = rowsFor(ctx, "festival", [cycleKey]);
  const used = new Set<CultureRow>();
  const names: (TimeName | undefined)[] = slots.map(() => undefined);
  const candidatesFor = (slot: FestSlot): CultureRow[] =>
    rows.filter((r) => !used.has(r) && (r.cyc ? r.cyc === cycleKey && r.p === slot.item : !r.cyc && r.s !== undefined && r.s === slot.season));
  applyReal(
    S,
    slots.map((slot, i) => ({
      candidates: () =>
        candidatesFor(slot)
          .map((r): TimeName & { _row: CultureRow } => {
            const loan = !!r.loan && ctx.words === "loanwords" && ctx.rng() < TIME_SKY.loanShare;
            return { text: loan ? r.loan! : r.n, kind: "festival", shape: "culture names", tones: [], words: [], real: true, ...(loan ? { loan: true } : {}), _row: r };
          })
          .filter((n) => acceptable(ctx, n.text, "festival", true)),
      set: (n) => {
        used.add((n as TimeName & { _row: CultureRow })._row);
        const { _row, ...rest } = n as TimeName & { _row: CultureRow };
        void _row;
        names[i] = rest;
      },
    })),
  );
  const patternsFor = (): string[] | undefined => {
    if (theme === "gods") return christian ? FESTIVAL_THEME_PATTERNS.holy : FESTIVAL_THEME_PATTERNS.gods;
    if (theme === "commemorations") return undefined;
    return FESTIVAL_THEME_PATTERNS[theme];
  };
  const patterns = patternsFor();
  const filterFor = theme === "commemorations" ? (p: Plan) => !!p.shape.commem || (isFutureEra(ctx.era) && p.shape.e === "NF-IS") : undefined;
  const solar = cycleKey === "solar-terms-24";
  const sekku = cycleKey === "sekku-5";
  slots.forEach((slot, i) => {
    if (names[i]) return;
    let nm: TimeName | undefined;
    if (solar) {
      const w = TIME_SKY.lists.weather;
      const seasonKey = slot.season;
      const options = [`Start of ${seasonKey ? seasonNoun(seasonKey) : "Season"}`, `${pickOne(w, ctx.rng)} ${seasonKey ? seasonNoun(seasonKey) : "Season"}`];
      for (const text of shuffle(options, ctx.rng)) {
        const t = timeCapitals(text);
        if (acceptable(ctx, t, "festival") && !S.seen.has(t.toLowerCase())) {
          S.seen.add(t.toLowerCase());
          nm = { text: t, kind: "festival", shape: text.startsWith("Start") ? "Start of {season}" : "{weather} {season}", tones: [], words: [] };
          break;
        }
      }
      nm ??= themedLine(S, "festival", { season: slot.season }, ["Feast of {seasonWord}"]);
    } else if (sekku) {
      nm = themedLine(S, "festival", { season: slot.season }, ["{tree} Festival", "{bird} Day", "Festival of {festNoun}"].filter(() => true));
      // The pattern set above is the brief's: {tree} Festival, {bird} Day, {festNoun} Festival.
    } else {
      nm = themedLine(S, "festival", { season: slot.season }, patterns, filterFor);
    }
    nm ??= themedLine(S, "festival", { season: slot.season }, undefined);
    names[i] = nm ?? { text: timeCapitals(`${ordinalWord(i + 1)} Feast`), kind: "festival", shape: "{ordinal} Feast", tones: [], words: [] };
    S.seen.add(names[i].text.toLowerCase());
  });
  return names.map((n, i) => ({ ...n!, ...(slots[i].season ? { season: slots[i].season, tag: seasonPhrase(slots[i].season) } : {}) }));
}

// ── Batches ─────────────────────────────────────────────────────────────────

export const timeKindDefault = (module: "calendar" | "sky"): TimeKind => (module === "calendar" ? "month" : "constellation");

export function generateTimeSkyNames(options: TimeSkyOptions): TimeBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const notices: string[] = [];
  const culture = findTimeCulture(options.culture)?.key ?? "norman-british";
  const era: RouteEra = ROUTE_ERAS.some((e) => e.code === options.era) ? options.era! : "MD";
  const sensitive = isSensitive(culture);
  const fantastic = !sensitive && !!options.fantastic;
  const biome = options.biome;
  const home = homelandOf(culture);
  const atHome = !biome || biome.id === home;
  const land = landKind(biome);
  const resolved = biome ?? (findBiome(home));
  const kinds = kindsOffered(options.kind && findTimeKind(options.kind)?.module === "sky" ? "sky" : "calendar", culture, era, land);
  const kind: TimeKind = options.kind && kinds.some((k) => k.key === options.kind) ? options.kind : kinds[0].key;
  const guards = options.safeguards ?? defaultTimeSafeguards();
  RULES = { block: timeBlockSet(guards, kind) };
  const tone = sensitive && (options.tone === "light" || options.tone === "grim") ? "any" : options.tone ?? "any";
  const count = Math.max(0, Math.floor(options.count));
  const ctx: Ctx = {
    rng,
    culture,
    era,
    setting: routeSetting(era, fantastic),
    fantastic,
    mode: options.people ?? "placeholders",
    tone,
    vocab: options.vocab ?? BUILT_IN_VOCAB,
    words: kind === "festival" ? options.words ?? "translated" : "translated",
    biome: resolved,
    atHome,
    land,
    cycle: seasonCycle(resolved, culture, atHome),
    sensitive,
    kind,
    season: null,
    distinct: false,
    used: new Set(),
    drawn: new Set(),
    log: [],
    fixed: {},
    neutral: false,
    depth: 0,
  };
  const series = !!options.series && seriesOffered(kind, culture, era, land);
  if (series) {
    const S: Series = { seed, ctx, options, seen: new Set(), notices, realShare: options.realShare ?? TIME_SKY.realShare };
    const batch = runSeries(S, kind, seed);
    return batch;
  }
  const names: TimeName[] = [];
  const seen = new Set<string>();
  for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
    const n = kind === "moon" ? separateMoon(ctx) : separateName(ctx, kind, options.shape);
    if (!n || seen.has(n.text.toLowerCase())) continue;
    seen.add(n.text.toLowerCase());
    names.push(n);
  }
  if (names.length < count) {
    const info = findTimeKind(kind);
    notices.push(names.length === 0 && info ? `There are no ${info.plural} names for this culture and era yet: a vocabulary pack can add some.` : `Only ${names.length} names could be generated.`);
  }
  return { names, seed, notices };
}

function separateMoon(ctx: Ctx): TimeName | undefined {
  return separateName({ ...ctx, kind: "moon" }, "moon");
}

function runSeries(S: Series, kind: TimeKind, seed: number): TimeBatch {
  const ctx = S.ctx;
  const notices = S.notices;
  const line = (key: string, source: string) => notices.push(`${TIME_SKY.series[key].line}: ${source}.`);
  if (kind === "month" || kind === "moon") {
    const sys = drawSystem(ctx, monthSystems(ctx.culture, ctx.era, ctx.land))!;
    const names = monthSeries(S, sys, kind === "moon")!;
    line(kind, TIME_SKY.years[sys].source);
    return { names, seed, notices, system: sys };
  }
  if (kind === "day") {
    const sys = drawSystem(ctx, weekSystems(ctx.culture, ctx.era))!;
    const names = daySeries(S, sys);
    line("day", TIME_SKY.weeks[sys].source);
    return { names, seed, notices, system: sys, ...(S.sky ? { sky: S.sky } : {}) };
  }
  if (kind === "festival") {
    const cyc = drawSystem(ctx, festivalCycles(ctx.culture, ctx.era, ctx.land))!;
    const names = festivalSeries(S, cyc);
    line("festival", TIME_SKY.festivals[cyc].source);
    return { names, seed, notices, system: cyc };
  }
  if (kind === "light") {
    const names = lightSeries(ctx, S, !!S.options.neutral);
    line("light", TIME_SKY.skies["classical-7"].source);
    return { names, seed, notices, system: "classical-7" };
  }
  if (kind === "sign") {
    const sys = drawSystem(ctx, signSystems(ctx.culture, ctx.era))!;
    const names = signSeries(S, sys);
    line("sign", TIME_SKY.skies[sys].source);
    return { names, seed, notices, system: sys };
  }
  return { names: [], seed, notices: [...notices, "No series could be made for this culture and era."] };
}

// ── Sky lore (§8.10–§8.12, §9.6–§9.8, §10.6–§10.7) ──────────────────────────

/** A culture's sign names in a system, as written; undefined where the names are generated only. */
function signSystemNames(system: string, culture: string): string[] | undefined {
  const names = TIME_SKY.signNames;
  switch (system) {
    case "zodiac-12":
      return names["zodiac-12"] as string[];
    case "animals-12": {
      const t = names["animals-12"] as Record<string, string[]>;
      return t[culture] ?? t["*"];
    }
    case "mansions-28":
      return (names["mansions-28"] as Record<string, string[]>)[culture];
    case "day-signs-20":
      return TIME_SKY.daySigns[culture];
  }
  return undefined;
}

const bareSystem = (system: string) => system === "animals-12" || system === "day-signs-20";
const signText = (system: string, name: string) => (bareSystem(system) || /^the /i.test(name) ? name : `the ${name}`);

/** §8.10–§8.12: every culture name of a sky kind for the culture and era. */
function skyNamesFor(ctx: Ctx, kind: TimeKind): string[] {
  switch (kind) {
    case "constellation":
      return TIME_SKY.constellations[ctx.culture] ?? [];
    case "sign":
      return signSystems(ctx.culture, ctx.era).flatMap(([sys]) => (signSystemNames(sys, ctx.culture) ?? []).map((n) => signText(sys, n)));
    case "light": {
      const l = TIME_SKY.lights[ctx.culture];
      if (!l) return [];
      const all = [...Object.values(l.planets ?? {}).flat(), l.milky, l.comet, l.nova].filter((x): x is string => !!x);
      return all.map((n) => (l.bare?.includes(n) || /^the /i.test(n) ? n : `the ${n}`));
    }
  }
  return [];
}

function skyCultureName(ctx: Ctx, kind: TimeKind): TimeName | undefined {
  const names = skyNamesFor(ctx, kind);
  for (let i = 0; i < 20 && names.length > 0; i++) {
    const text = pickOne(names, ctx.rng);
    if (acceptable(ctx, text, kind, true)) return { text, kind, shape: "culture names", tones: [], words: [], real: true };
  }
  return undefined;
}

/** §10.7: the neutral light names for `{light} Day` in separate days: gods left out. */
function neutralLightName(ctx: Ctx): string | undefined {
  if (ctx.depth > 1) return undefined;
  const c: Ctx = { ...ctx, kind: "light", depth: ctx.depth + 1, distinct: false, season: null, drawn: new Set(), log: [], fixed: {} };
  const names = skyNamesFor(c, "light");
  const others = plansFor(c, "light", (p) => !p.shape.god).reduce((n, [, w]) => n + w, 0);
  if (names.length > 0 && c.rng() * (20 + others) < 20) return pickOne(names, c.rng);
  return buildName(c, "light", (p) => !p.shape.god && !p.shape.cn)?.text;
}

/** The context a neutral sky series is drawn in: a fresh stream from the batch seed, so a days batch and a sky series of the same seed agree. */
function neutralCtx(S: Series): Ctx {
  return { ...S.ctx, kind: "light", rng: mulberry32(S.seed), season: null, distinct: false, used: new Set(), drawn: new Set(), log: [], fixed: {}, system: "classical-7" };
}

const LIGHT_SLOT_ORDER = TIME_SKY.skies["classical-7"].order!;

/** §10.7: the seven lights, in the Chaldean order. */
function lightSeries(base: Ctx, S: Series, neutral: boolean): TimeName[] {
  const ctx: Ctx = { ...base, kind: "light", distinct: true, used: new Set(), season: null };
  const gods = !neutral && !ctx.sensitive && ctx.mode === "invented";
  const theme = pickWeighted(TIME_SKY.themes.light.map(([t, w]): [string, number] => [t, t === "gods" && !gods ? 0 : w]), ctx.rng)!;
  const seen = new Set<string>();
  const out: (TimeName | undefined)[] = Array.from({ length: 7 }, () => undefined);
  const culture = TIME_SKY.lights[ctx.culture];
  // Real names (capped at half of seven, rounded down).
  const cap3 = Math.floor(7 / 2);
  let real = 0;
  for (const i of shuffle([0, 1, 2, 3, 4, 5, 6], ctx.rng)) {
    if (real >= cap3) break;
    const options = ([] as string[]).concat(culture?.planets?.[String(i + 1)] ?? []).map((n) => (culture?.bare?.includes(n) || /^the /i.test(n) ? n : `the ${n}`)).filter((t) => acceptable(ctx, t, "light", true) && !seen.has(t.toLowerCase()));
    if (options.length === 0 || ctx.rng() >= S.realShare) continue;
    const text = pickOne(options, ctx.rng);
    seen.add(text.toLowerCase());
    out[i] = { text, kind: "light", shape: "culture names", tones: [], words: [], real: true, slot: i + 1 };
    real++;
  }
  const accept = (i: number, raw: string | undefined, shape: string, c: Ctx): boolean => {
    if (!raw) return false;
    const text = finish(c, "light", raw);
    if (!acceptable(c, text, "light") || seen.has(text.toLowerCase())) return false;
    seen.add(text.toLowerCase());
    const tones = new Set<GroupTone>(c.drawn);
    out[i] = { text, kind: "light", shape, tones: GROUP_TONES.filter((t) => tones.has(t)), words: c.log, slot: i + 1 };
    return true;
  };
  const quality = (c: Ctx, slot: number) => {
    const list = TIME_SKY.lists.lightQualities[String(slot)];
    return list ? drawFrom(c, "quality", "skyQuality", plainList(list)) : token(c, "skyQuality");
  };
  for (let i = 0; i < 7; i++) {
    if (out[i]) continue;
    const slot = i + 1;
    for (let attempt = 0; attempt < 40 && !out[i]; attempt++) {
      const c: Ctx = { ...ctx, distinct: attempt < 20, drawn: new Set(), log: [] };
      let raw: string | undefined;
      let shape: string;
      if (slot === 4 && theme !== "gods") {
        raw = pickOne(["the Day Eye", "the Great Lamp"], c.rng);
        shape = "the Day Eye";
      } else if (slot === 4) {
        raw = `${token(c, "god", "poss") ?? ""} Lamp`;
        shape = "{god:poss} Lamp";
      } else if (slot === 5) {
        const herald = token(c, "herald");
        raw = herald ? `the ${c.rng() < 0.5 ? "Morning" : "Evening"} ${herald}` : undefined;
        shape = "the Morning {herald}";
      } else if (slot === 7 && c.rng() < 0.5) {
        raw = "the Night Eye";
        shape = "the Night Eye";
      } else if (slot === 7) {
        const q = theme === "kin" ? token(c, "skyKin") : token(c, "skyQuality");
        raw = q ? `the ${q} Moon` : undefined;
        shape = theme === "kin" ? "the {skyKin} Moon" : "the {skyQuality} Moon";
      } else if (theme === "gods") {
        raw = `${token(c, "god", "poss") ?? ""} Star`;
        shape = "{god:poss} Star";
      } else if (theme === "kin") {
        const q = quality(c, slot);
        const k = token(c, "skyKin");
        raw = q && k ? `the ${q} ${k}` : undefined;
        shape = "the {skyQuality} {skyKin}";
      } else {
        const q = quality(c, slot);
        raw = q ? `the ${q} Wanderer` : undefined;
        shape = "the {skyQuality} Wanderer";
      }
      if (raw?.startsWith(" ") || raw?.startsWith("undefined")) raw = undefined;
      if (accept(i, raw, shape, c) && attempt < 20) for (const k of c.used) ctx.used.add(k);
    }
    if (!out[i]) accept(i, `the ${ordinalWord(slot)} Light`, "the {ordinal} Light", { ...ctx, drawn: new Set(), log: [] });
  }
  return out.map((n, i) => ({ ...n!, slot: i + 1, tag: LIGHT_SLOT_ORDER[i] }));
}

/** §5.4: the zodiac sets of §13.1. */
const breaksZodiacSet = (names: string[]) => names.filter((n) => TIME_SKY.safeguards.zodiacSet.some((z) => bare(z) === bare(n))).length >= TIME_SKY.safeguards.zodiacSetLimit;

/** §10.6: a sign series: the signs of the system in its order. */
function signSeries(S: Series, system: string): TimeName[] {
  const ctx0: Ctx = { ...S.ctx, kind: "sign", system };
  const count = TIME_SKY.skies[system].count;
  const real = signSystemNames(system, ctx0.culture);
  for (let redraw = 0; redraw < 20; redraw++) {
    const ctx: Ctx = { ...ctx0, distinct: true, used: new Set(), drawn: new Set(), log: [], season: null };
    const seen = new Set<string>();
    const lines: (TimeName | undefined)[] = Array.from({ length: count }, () => undefined);
    // Real names.
    const cap2 = Math.floor(count / 2);
    let realCount = 0;
    for (const i of shuffle(Array.from({ length: count }, (_, k) => k), ctx.rng)) {
      if (realCount >= cap2) break;
      const base = real?.[i];
      if (!base || ctx.rng() >= S.realShare) continue;
      const text = signText(system, base);
      if (!acceptable(ctx, text, "sign", true) || seen.has(text.toLowerCase())) continue;
      seen.add(text.toLowerCase());
      lines[i] = { text, kind: "sign", shape: "culture names", tones: [], words: [], real: true, slot: i + 1 };
      realCount++;
    }
    // The theme.
    let theme: string;
    if (system === "animals-12") theme = "animals";
    else if (system === "day-signs-20") theme = "daysigns";
    else if (system === "mansions-28") theme = pickWeighted(TIME_SKY.themes.mansions, ctx.rng)!;
    else {
      theme = pickWeighted(TIME_SKY.themes.sign, ctx.rng)!;
      if (system === "zodiac-12" && ctx.rng() < TIME_SKY.themes.mixedZodiac) theme = "mixed";
    }
    const flavour = [...new Set(cultureAnimals(ctx.culture))].filter((w) => !w.includes("{")).map((w) => biomeTitleCase(w));
    const patternsFor = (): string[] => {
      switch (theme) {
        case "beasts": return ["the {beast}"];
        case "figures": return ["the {skyFigure}"];
        case "objects": return ["the {skyObject}"];
        case "mixed": return ["the {beast}", "the {skyFigure}"];
        case "bodyParts": return ["the {skyBodyPart}", "the {beast:poss} {skyBodyPart}"];
        case "daysigns": return ["{wildAnimal}", "{bird}", "{daySign}"];
      }
      return [];
    };
    for (let i = 0; i < count; i++) {
      if (lines[i]) continue;
      for (let attempt = 0; attempt < 60 && !lines[i]; attempt++) {
        const c: Ctx = { ...ctx, distinct: attempt < 30, drawn: new Set(), log: [] };
        let raw: string | undefined;
        let shape: string;
        if (theme === "animals") {
          const items: [string, number][] = [...biomeItems(c, "wildAnimal"), ...biomeItems(c, "livestock"), ...flavour.map((w): [string, number] => [w, 3])];
          raw = drawFrom(c, "beast", "animals", items);
          shape = "{beast}";
        } else {
          shape = pickOne(patternsFor(), c.rng);
          raw = renderPattern(c, shape);
        }
        if (!raw) continue;
        const text = bareSystem(system) ? timeCapitals(raw) : finish(c, "sign", raw);
        if (!acceptable(c, text, "sign") || seen.has(text.toLowerCase())) continue;
        seen.add(text.toLowerCase());
        if (c.distinct) for (const k of c.used) ctx.used.add(k);
        const tones = new Set<GroupTone>(c.drawn);
        lines[i] = { text, kind: "sign", shape, tones: GROUP_TONES.filter((t) => tones.has(t)), words: c.log, slot: i + 1 };
      }
      if (!lines[i]) {
        const text = timeCapitals(`${bareSystem(system) ? "" : "the "}${ordinalText(i + 1)} Sign`);
        seen.add(text.toLowerCase());
        lines[i] = { text, kind: "sign", shape: "{ordinal} Sign", tones: [], words: [], slot: i + 1 };
      }
    }
    const final = lines.map((l) => l!);
    if (system === "zodiac-12" || system === "nakshatras-27" || system === "decans-36") if (breaksZodiacSet(final.map((n) => n.text))) continue;
    return final;
  }
  return [];
}
