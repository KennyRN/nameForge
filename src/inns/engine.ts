// Inns and taverns (docs/inns-and-taverns-brief.md): houses of hospitality for route names' 22
// cultures and seven eras – English inn signs from the Book of Names' table, the world's other
// traditions, and steam-age, modern and sci-fi houses. Creatures and items come from the group
// names emblem lists plus the shared settlement pools (settlement/vocab.ts, with vocabulary packs);
// places, people, gods, figures and routes come from the route engine, trades and goods from the
// street pools. No Obsidian imports.

import { hasSpaceBlock } from "../space/safeguards";
import innData from "../data/inn-names.json";
import {
  type GroupPeople,
  type GroupSafeguards,
  type GroupSetting,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  groupListWords,
  groupSpacePrefix,
  groupStarIn,
  groupPlural,
  groupPossessive,
  groupSaint,
  pickWeighted,
  repeatsContent,
  toneFactor,
  wordTones,
} from "../groups/engine";
import { mulberry32 } from "../markov";
import {
  BRITISH_CULTURES,
  countedWords,
  findRouteCulture,
  generateRouteNames,
  godNames,
  personNames,
  ROUTE_ERAS,
  routeCapitals,
  routeFigure,
  routeNorm,
  routePlace,
  routeSetting,
  type RouteCulture,
  type RouteEra,
} from "../routes/engine";
import { BUILT_IN_VOCAB, cultureAllowed, poolEntries, type VocabEntry, type Vocabulary } from "../settlement/vocab";
import { buildingName, type BuildingKind } from "../buildings/engine";
import { boostPool, contextLandmark, contextSaint, selfPatterns, TownTurn, type SettlementContext } from "../settlement/contextShared";
import { breaksStreetWords, STREET_DATA } from "../streets/engine";

// ── Data ────────────────────────────────────────────────────────────────────

export type InnKind = "inn" | "tavern" | "eating" | "wayhouse" | "rest" | "club" | "bar";
export type InnSetting = "anywhere" | "town" | "country" | "port" | "road";
export type InnForm = "signs" | "house" | "either";

export interface InnShape {
  p: string;
  w: number;
  e?: RouteEra[];
  c?: string[];
  t?: GroupTone[];
  h?: boolean;
  /** §8.1: the kinds a shape serves (culture shapes: inn, tavern and rest when unmarked). */
  kinds?: InnKind[];
  /** §6.4: false where the shape never takes a house word (Arms, owner, roadside houses). */
  house?: boolean;
}

interface SignAnchor {
  key: string;
  w: number;
  /** In AN, arms and owner are 0 (from MD). */
  from?: RouteEra;
  shapes: InnShape[];
}

interface InnData {
  any: string;
  kinds: { key: InnKind; menu: string; plural: string; description: string; era: Record<RouteEra, number> }[];
  settings: { key: InnSetting; text: string; kindX: Partial<Record<InnKind, number>>; themes: Record<string, number>; armsX?: number; roadside: number }[];
  fantasticThemes: Record<string, number>;
  forms: Record<InnForm, string>;
  formShare: { either: number; innOf: number };
  tradition: { full: string[]; fullFrom: Record<string, RouteEra>; partial: Record<string, [number, RouteEra]> };
  signs: SignAnchor[];
  fantastic: InnShape[];
  cultureShapes: Record<string, InnShape[]>;
  cultureKinds: InnKind[];
  fallback: InnShape[];
  eraShapes: InnShape[];
  eraShare: { default: number; futureBar: number };
  lists: {
    grandAdj: string[];
    virtue: string[];
    drink: string[];
    pairs: [string, string][];
    creatureLists: string[];
    itemLists: string[];
    abWeights: Record<string, number>;
    mateShare: number;
    braceShare: number;
    componentShare: number;
    routeKinds: Record<string, number>;
  };
  regionRules: { armsHalf: string[]; dragonDouble: string[] };
  series: { from: number };
  cap: number;
  safeguards: { block: string[]; flag: string[]; flagListBlocks: boolean; banned: string[]; racialSigns: string[]; christian: string[] };
}

export const INN_DATA = innData as unknown as InnData;
/** Settlement kit §4: the shapes whose first `{town}` is the settlement. */
const INN_SELF = selfPatterns(innData);
export const INN_KINDS = INN_DATA.kinds;
export const INN_SETTINGS = INN_DATA.settings;
export const INN_ANY = INN_DATA.any;
export const INN_FORMS = INN_DATA.forms;

const eraIndex = (era: RouteEra) => ROUTE_ERAS.findIndex((e) => e.code === era);
const isFuture = (era: RouteEra) => era === "NF" || era === "IS";

/** §5.1: the kinds offered in an era. */
export const innKindsOffered = (era: RouteEra) => INN_KINDS.filter((k) => k.era[era] > 0);

/** §6.1: the share of a culture's names that are English signs in an era. */
export function englishShare(culture: string, era: RouteEra): number {
  const t = INN_DATA.tradition;
  if (t.full.includes(culture)) return 1;
  const from = t.fullFrom[culture];
  if (from) return eraIndex(era) >= eraIndex(from) ? 1 : 0;
  const part = t.partial[culture];
  return part && eraIndex(era) >= eraIndex(part[1]) ? part[0] : 0;
}

/** §2.2: the form link shows for cultures with an English sign tradition. */
export const hasSignTradition = (culture: string) => ROUTE_ERAS.some((e) => englishShare(culture, e.code) > 0);

export const defaultInnSafeguards = (): GroupSafeguards => ({ block: INN_DATA.safeguards.block, flag: INN_DATA.safeguards.flag, flagListBlocks: INN_DATA.safeguards.flagListBlocks });

// ── Options and results ─────────────────────────────────────────────────────

export interface InnOptions {
  culture?: string;
  kind?: InnKind;
  era?: RouteEra;
  fantastic?: boolean;
  region?: string;
  setting?: InnSetting;
  form?: InnForm;
  tone?: GroupToneChoice;
  people?: GroupPeople;
  /** §9: as one town. */
  series?: boolean;
  count: number;
  seed?: number;
  /** RN §12.6: merged settlement safeguard lists; the built-in inn lists when absent. */
  safeguards?: GroupSafeguards;
  /** RN §12: merged route safeguard lists, for `{route}`. */
  routeSafeguards?: GroupSafeguards;
  /** Buildings brief §11: merged building safeguard lists, for `{landmark}`. */
  landmarkSafeguards?: GroupSafeguards;
  /** Settlement kit §4: the settlement's town, neighbours, founder, saint, trades, goods, road and landmarks. */
  context?: SettlementContext;
  vocab?: Vocabulary;
  /** Tests: only this shape. */
  shape?: string;
}

export type InnTradition = "english" | "culture" | "era";

export interface InnName {
  text: string;
  /** The name without a house word. */
  sign: string;
  kind: InnKind;
  shape: string;
  tradition: InnTradition;
  /** §6.2: the sign anchor (English), or "culture", "fallback", "fantastic", "era". */
  anchor: string;
  /** §6.4: a house word was added. */
  house: boolean;
  tones: GroupTone[];
  words: { pool: string; word: string }[];
  /** §9: creature, item, person, colour and anchor words used. */
  uses: string[];
  route: boolean;
}

export interface InnBatch {
  names: InnName[];
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
  region?: string;
  kind: InnKind;
  themes: Record<string, number>;
  options: InnOptions;
  drawn: Set<GroupTone>;
  words: { pool: string; word: string }[];
  uses: string[];
  isRoute: boolean;
  /** Settlement kit §4: the `{town}` tokens of the pattern being rendered. */
  turn?: TownTurn;
}

type Word = { w: string; t: GroupTone[] };
const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
const LIGHT_OR_GRIM = (t: readonly string[] | undefined) => !!t && (t.includes("light") || t.includes("grim"));
const COLOURS = new Set([...groupListWords("colour", "FL").map(([w]) => w), "Black", "White", "Red", "Blue", "Green", "Golden", "Grey", "Silver", "Pied", "Copper"]);
const BIRDS = new Set(groupListWords("bird", "FL").map(([w]) => w));

/** A shared pool's words here (region, setting themes, tone; never light or grim for the sensitive cultures). */
function vocabItems(ctx: Ctx, pool: string, mult = 1): [Word, number][] {
  return boostPool(ctx.options.context, pool, poolEntries(ctx.vocab, pool, { culture: ctx.culture.key, era: ctx.era, fantastic: ctx.fantastic, region: ctx.region, themes: ctx.themes }))
    .filter(([e]) => !(ctx.culture.sensitive && LIGHT_OR_GRIM(e.t)))
    .map(([e, w]): [Word, number] => [{ w: e.w, t: e.t ?? [] }, w * mult]);
}

/** Group-names lists through their setting tags (space words in sci-fi). */
function gnItems(ctx: Ctx, list: string): [Word, number][] {
  const setting = list === "star" || list === "spaceLand" || list === "tech" ? "SF" : ctx.setting;
  return groupListWords(list, setting)
    .filter(([w]) => !(ctx.culture.sensitive && LIGHT_OR_GRIM(wordTones(list, w))))
    .map(([w, n]): [Word, number] => [{ w, t: wordTones(list, w) }, n]);
}

/** Merges word lists, summing a word's weight, then weighs by tone. */
function merged(ctx: Ctx, parts: [Word, number][][]): [Word, number][] {
  const out = new Map<string, [Word, number]>();
  for (const part of parts) {
    for (const [word, n] of part) {
      const prev = out.get(word.w);
      if (prev) prev[1] += n;
      else out.set(word.w, [word, n]);
    }
  }
  return [...out.values()].map(([word, n]): [Word, number] => [word, n * toneFactor(word.t, ctx.tone)]).filter(([, n]) => n > 0);
}

function draw(ctx: Ctx, pool: string, items: [Word, number][], use?: string): string | undefined {
  const word = pickWeighted(items, ctx.rng);
  if (!word) return undefined;
  for (const t of word.t) ctx.drawn.add(t);
  ctx.words.push({ pool, word: word.w });
  if (use) ctx.uses.push(`${use}:${word.w}`);
  if (COLOURS.has(word.w)) ctx.uses.push(`colour:${word.w}`);
  return word.w;
}

/** §4.1: creatures: GN beast, bird, fish and heraldic beasts with innCreature (WAL doubles Dragon). */
function creatureItems(ctx: Ctx): [Word, number][] {
  const items = merged(ctx, [...INN_DATA.lists.creatureLists.map((l) => gnItems(ctx, l)), vocabItems(ctx, "innCreature")]);
  if (ctx.region && INN_DATA.regionRules.dragonDouble.includes(ctx.region)) for (const it of items) if (it[0].w === "Dragon") it[1] *= 2;
  return items;
}

/** §4.1: items: GN emblem items with innItem. */
const itemItems = (ctx: Ctx) => merged(ctx, [...INN_DATA.lists.itemLists.map((l) => gnItems(ctx, l)), vocabItems(ctx, "innItem")]);

/** §4.1: locations, with SD's components at ×0.3. */
function locationItems(ctx: Ctx): [Word, number][] {
  const comps = Object.keys(STREET_DATA.components).map((p) => vocabItems(ctx, p, INN_DATA.lists.componentShare));
  return merged(ctx, [vocabItems(ctx, "innLocation"), ...comps]);
}

const creature = (ctx: Ctx, keep?: (w: string) => boolean) => draw(ctx, "creature", creatureItems(ctx).filter(([w]) => !keep || keep(w.w)), "creature");
const item = (ctx: Ctx, keep?: (w: string) => boolean) => draw(ctx, "item", itemItems(ctx).filter(([w]) => !keep || keep(w.w)), "item");
const person = (ctx: Ctx, keep?: (w: string) => boolean) => draw(ctx, "innPerson", merged(ctx, [vocabItems(ctx, "innPerson")]).filter(([w]) => !keep || keep(w.w)), "person");

/** §6.2: `{owner}`: invented from the culture's names or GN surnames; undefined where neither exists. */
function ownerNames(ctx: Ctx): string[] {
  return [...personNames(ctx.culture.key), ...(STREET_DATA.surnameCultures.includes(ctx.culture.key) ? groupListWords("surname", ctx.setting).map(([w]) => w) : [])];
}

/** §6.3: `{route}`: one route name, kind road, drove or trade, without "the". */
function route(ctx: Ctx): string | undefined {
  // Settlement kit §4: the road through town.
  const context = ctx.options.context;
  if (context) {
    if (!context.throughRoute) return undefined;
    ctx.isRoute = true;
    return context.throughRoute.replace(/^the /i, "");
  }
  const kind = pickWeighted(Object.entries(INN_DATA.lists.routeKinds), ctx.rng);
  const r = generateRouteNames({
    culture: ctx.culture.key,
    era: ctx.era,
    fantastic: ctx.fantastic,
    region: ctx.region,
    people: ctx.mode,
    kind,
    count: 1,
    seed: Math.floor(ctx.rng() * 0xffffffff),
    safeguards: ctx.options.routeSafeguards,
    vocab: ctx.options.vocab,
  }).names[0];
  if (r) ctx.isRoute = true;
  return r?.text.replace(/^the /i, "");
}

/** Buildings brief §11.2: the landmark kinds for the location anchor, and for roadside houses. */
export const INN_LANDMARK_KINDS: BuildingKind[] = ["defence", "crossing", "water", "monument"];
export const INN_ROAD_LANDMARK_KINDS: BuildingKind[] = ["crossing", "monument"];

/** Buildings brief §11.2: `{landmark}`: one building of 3 words or fewer, without "the". */
function landmark(ctx: Ctx, kinds: BuildingKind[]): string | undefined {
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
    kinds,
    rng: ctx.rng,
    safeguards: o.landmarkSafeguards,
    vocab: o.vocab,
  });
  if (!w) return undefined;
  ctx.words.push({ pool: "landmark", word: w });
  ctx.uses.push(`landmark:${w}`);
  return w;
}

/** One token; `pl` asks for the plural (§10: "Two" birds may be "Brace of"). */
function token(ctx: Ctx, name: string): string | undefined {
  const rng = ctx.rng;
  const placeholders = ctx.mode === "placeholders";
  switch (name) {
    case "creature":
      return creature(ctx);
    case "item":
      return item(ctx);
    case "innPerson":
      return person(ctx);
    case "creatureOrItem":
      return rng() < 0.5 ? creature(ctx) : item(ctx);
    case "creatureOrPerson":
      return rng() < 0.5 ? creature(ctx) : person(ctx);
    case "innLocation":
      return draw(ctx, "innLocation", locationItems(ctx));
    case "trade":
      return draw(ctx, "streetTrades", merged(ctx, [vocabItems(ctx, "streetTrades")]));
    case "owner":
    case "patron":
    case "founder": {
      if (name === "founder" && ctx.options.context) return ctx.options.context.founder;
      if (placeholders) return `[${name}]`;
      const names = name === "owner" ? ownerNames(ctx) : personNames(ctx.culture.key);
      return names.length > 0 ? pickOne(names, rng) : undefined;
    }
    case "surname":
      return placeholders || !STREET_DATA.surnameCultures.includes(ctx.culture.key) ? "[surname]" : draw(ctx, "surname", gnItems(ctx, "surname"));
    case "hw":
      return draw(ctx, `houseWord:${ctx.kind}`, merged(ctx, [vocabItems(ctx, `houseWord:${ctx.kind}`)]));
    case "route":
      return route(ctx);
    case "landmark":
      return landmark(ctx, INN_LANDMARK_KINDS);
    case "roadLandmark":
      return landmark(ctx, INN_ROAD_LANDMARK_KINDS);
    case "destination":
    case "town":
      // Settlement kit §4: this place, or one of its neighbours.
      if (ctx.turn) return name === "town" ? ctx.turn.next(rng) : ctx.turn.other(rng);
      return placeholders ? "[place]" : routePlace(ctx.culture.key, ctx.setting, rng);
    case "holy": {
      const other = () => (placeholders ? "[holy person]" : groupSaint(ctx.setting, rng));
      return ctx.options.context ? contextSaint(ctx.options.context, other, rng) : other();
    }
    case "figure":
      return routeFigure(ctx.culture.key, ctx.setting, rng);
    case "god": {
      const gods = godNames(ctx.culture.key);
      return gods.length > 0 ? pickOne(gods, rng) : undefined;
    }
    case "ordinal":
      return draw(ctx, "ordinalWord", gnItems(ctx, "ordinalWord"));
    case "number":
    case "colour":
    case "quality":
    case "tech":
    case "brandRoot":
    case "heraldicBeast":
      return draw(ctx, name, merged(ctx, [gnItems(ctx, name)]), name === "heraldicBeast" ? "creature" : undefined);
    case "star":
      return groupStarIn("any", ctx.mode, rng);
    case "spaceLand": {
      const w = draw(ctx, "spaceLand", gnItems(ctx, "spaceLand"));
      if (!w || rng() >= 0.3) return w;
      return groupSpacePrefix(w, rng);
    }
    case "weekday":
      return pickWeighted(STREET_DATA.lists.weekday, rng);
    case "grandAdj":
    case "virtue":
    case "drink":
      return pickOne(INN_DATA.lists[name], rng);
    case "n":
      return String(1 + Math.floor(rng() * 40));
    case "auspicious":
    case "welcomePhrase":
    case "eastNature":
    case "oasisAnchor":
    case "indianAnchor":
    case "innFable":
      return draw(ctx, name, merged(ctx, [vocabItems(ctx, name)]), "anchor");
  }
  return draw(ctx, name, merged(ctx, [vocabItems(ctx, name)]));
}

/** §6.2: `{a} and {b}`: creature 45, item 40, person 15, never the same; a mate at 10% where a pair exists. */
function pairTokens(ctx: Ctx): [string, string] | undefined {
  const l = INN_DATA.lists;
  const kinds = Object.entries(l.abWeights);
  const one = (k: string, keep?: (w: string) => boolean) => (k === "creature" ? creature(ctx, keep) : k === "item" ? item(ctx, keep) : person(ctx, keep));
  const ka = pickWeighted(kinds, ctx.rng)!;
  const a = one(ka);
  if (!a) return undefined;
  if (ka === "creature") {
    const mate = l.pairs.find(([x]) => x === a)?.[1];
    if (mate && ctx.rng() < l.mateShare) {
      ctx.uses.push(`creature:${mate}`);
      return [a, mate];
    }
  }
  const b = one(pickWeighted(kinds, ctx.rng)!, (w) => w !== a);
  return b ? [a, b] : undefined;
}

/** Renders a shape's pattern (possessives, plurals, Brace of). */
function renderPattern(ctx: Ctx, pattern: string): string | undefined {
  if (ctx.options.context) ctx.turn = new TownTurn(ctx.options.context, INN_SELF.has(pattern));
  let failed = false;
  let pair: [string, string] | undefined;
  let number: string | undefined;
  const out = pattern.replace(/\{([^}]+)\}/g, (_m, raw: string) => {
    if (failed) return "";
    const [name, mod] = raw.split(":");
    let piece: string | undefined;
    if (name === "a" || name === "b") {
      pair ??= pairTokens(ctx);
      piece = pair?.[name === "a" ? 0 : 1];
    } else piece = token(ctx, name);
    if (!piece) {
      failed = true;
      return "";
    }
    if (name === "innNumber") number = piece;
    if (mod === "poss") return groupPossessive(piece, name === "travellers" || name === "trade");
    if (mod === "pl") {
      // §10: "Two" birds may render as "Brace of" at 20%.
      if (number === "Two" && BIRDS.has(piece) && ctx.rng() < INN_DATA.lists.braceShare) return `\u0000${groupPlural(piece)}`;
      return groupPlural(piece);
    }
    return piece;
  });
  return failed ? undefined : out.replace(/Two \u0000/, "Brace of ").replace(/\u0000/g, "");
}

// ── Rendering and safeguards (§10, §12) ─────────────────────────────────────

/** §10: capitals, with a leading "the" and "a" (in a Hat) lower case. */
export function innCapitals(text: string): string {
  return routeCapitals(text)
    .replace(/^The /, "the ")
    .replace(/ A /g, " a ");
}

const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const BANNED = INN_DATA.safeguards.banned.map(wordRe);
const RACIAL = INN_DATA.safeguards.racialSigns.map(wordRe);
const CHRISTIAN = INN_DATA.safeguards.christian.map(wordRe);
const HOUSE_WORDS = [...new Set(Object.entries(BUILT_IN_VOCAB.pools).filter(([k]) => k.startsWith("houseWord:")).flatMap(([, p]) => p.entries.map((e) => e.w)))].sort(
  (a, b) => b.length - a.length,
);

/** §12.4: banned words (GN, RN, SD and the inn list) and the racial signs, in any sign built on them. */
export function breaksInnWords(text: string): boolean {
  return breaksStreetWords(text) || BANNED.some((re) => re.test(text)) || RACIAL.some((re) => re.test(text));
}

/** §12.3: christian signs and words. */
export const hasChristianSign = (text: string) => CHRISTIAN.some((re) => re.test(text));

/** §12.1: a name as the block list compares it: without "the", without a house word or "Inn of the". */
export function innBlockForms(text: string): string[] {
  const bare = routeNorm(text).replace(/^the /, "");
  const out = new Set([bare]);
  const inner = bare.replace(/^(inn|sign) of the /, "");
  out.add(inner);
  for (const hw of HOUSE_WORDS) {
    const suffix = ` ${hw.toLowerCase()}`;
    if (inner.endsWith(suffix)) out.add(inner.slice(0, -suffix.length));
  }
  return [...out];
}

export function innBlockSet(guards: GroupSafeguards = defaultInnSafeguards()): Set<string> {
  return new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map((w) => routeNorm(w).replace(/^the /, "")));
}

/** RN §3.3: a pack word the inn safeguards drop. */
export function innWordBlocked(word: string, guards?: GroupSafeguards): boolean {
  const block = innBlockSet(guards);
  return innBlockForms(word).some((f) => block.has(f)) || breaksInnWords(word);
}

// ── Plans (§6–§8) ───────────────────────────────────────────────────────────

interface Plan {
  tradition: InnTradition;
  anchor: string;
  shape: InnShape;
}

/** Whether a shape can be drawn here, and its weight (era, culture, fantastic, sensitive, tone, people). */
function shapeWeight(ctx: Ctx, s: InnShape): number {
  const c = ctx.culture;
  if (s.e && !s.e.includes(ctx.era)) return 0;
  if (!cultureAllowed(s.c, c.key, ctx.era)) return 0;
  if (s.h !== undefined && s.h !== ctx.fantastic) return 0;
  if (c.sensitive && (s.h || LIGHT_OR_GRIM(s.t))) return 0;
  if (ctx.mode === "invented" && s.p.includes("{owner") && ownerNames(ctx).length === 0) return 0;
  if (ctx.mode === "invented" && /\{(patron|founder)/.test(s.p) && personNames(c.key).length === 0) return 0;
  if (s.p.includes("{god") && godNames(c.key).length === 0) return 0;
  if (/\{holy[}:]/.test(s.p) && !cultureAllowed(["christian"], c.key, ctx.era)) return 0;
  if (s.p.includes("{trade") && (c.key === "indian" || c.key === "west-african")) return 0;
  return s.w * toneFactor(s.t ?? [], ctx.tone);
}

const live = (ctx: Ctx, shapes: InnShape[], only?: string) =>
  shapes
    .filter((s) => !only || s.p === only)
    .map((s): [InnShape, number] => [s, shapeWeight(ctx, s)])
    .filter(([, w]) => w > 0);

/** §6.2–§6.3, §8.2: an English sign: an anchor by the table (and the setting), then a shape. */
function englishPlans(ctx: Ctx, settingKey: InnSetting, only?: string): [Plan, number][] {
  const setting = INN_SETTINGS.find((s) => s.key === settingKey)!;
  const out: [Plan, number][] = [];
  for (const a of INN_DATA.signs) {
    // Settlement kit §7.1: at a crossroads, roadside houses ×2.
    let w = a.key === "roadside" ? setting.roadside * (ctx.options.context?.effects?.roadsideX ?? 1) : a.w;
    if (a.from && eraIndex(ctx.era) < eraIndex(a.from)) w = 0;
    if (a.key === "arms") {
      w *= setting.armsX ?? 1;
      if (ctx.region && INN_DATA.regionRules.armsHalf.includes(ctx.region)) w *= 0.5;
    }
    if (w <= 0) continue;
    const shapes = live(ctx, a.shapes, only);
    const total = shapes.reduce((n, [, x]) => n + x, 0);
    for (const [s, x] of shapes) out.push([{ tradition: "english", anchor: a.key, shape: s }, (w * x) / total]);
  }
  for (const [s, x] of live(ctx, INN_DATA.fantastic, only)) out.push([{ tradition: "english", anchor: "fantastic", shape: s }, x]);
  return out;
}

/** §8.1–§8.2: the culture's own shapes for the kind, else the fallback. */
function culturePlans(ctx: Ctx, only?: string): [Plan, number][] {
  const own = (INN_DATA.cultureShapes[ctx.culture.key] ?? []).filter((s) => (s.kinds ?? INN_DATA.cultureKinds).includes(ctx.kind));
  const plans = live(ctx, own, only).map(([s, w]): [Plan, number] => [{ tradition: "culture", anchor: "culture", shape: s }, w]);
  const base = plans.length > 0 ? plans : live(ctx, INN_DATA.fallback, only).map(([s, w]): [Plan, number] => [{ tradition: "culture", anchor: "fallback", shape: s }, w]);
  return [...base, ...live(ctx, INN_DATA.fantastic, only).map(([s, w]): [Plan, number] => [{ tradition: "culture", anchor: "fantastic", shape: s }, w])];
}

/** §8.3: the era's shapes for the kind ("any" kind for the steampunk shapes). */
function eraPlans(ctx: Ctx, only?: string): [Plan, number][] {
  const shapes = INN_DATA.eraShapes.filter((s) => !s.kinds || s.kinds.includes(ctx.kind));
  return live(ctx, shapes, only).map(([s, w]): [Plan, number] => [{ tradition: "era", anchor: "era", shape: s }, w]);
}

// ── Batches ─────────────────────────────────────────────────────────────────

interface Built {
  name: InnName;
}

/** §7: a batch of unique inn names. */
export function generateInnNames(options: InnOptions): InnBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const notices: string[] = [];
  const culture = findRouteCulture(options.culture) ?? findRouteCulture("norman-british")!;
  const era: RouteEra = ROUTE_ERAS.some((e) => e.code === options.era) ? options.era! : "MD";
  const fantastic = !!options.fantastic;
  const setting = routeSetting(era, fantastic);
  const settingKey: InnSetting = INN_SETTINGS.some((s) => s.key === options.setting) ? options.setting! : "anywhere";
  const settingInfo = INN_SETTINGS.find((s) => s.key === settingKey)!;
  const form: InnForm = options.form ?? "either";
  const mode = options.people ?? "placeholders";
  const region = BRITISH_CULTURES.includes(culture.key) && options.region && options.region !== "all" ? options.region : undefined;
  const count = Math.max(0, Math.floor(options.count));
  const english = englishShare(culture.key, era);
  const offered = innKindsOffered(era);
  const chosen = options.kind ? offered.find((k) => k.key === options.kind)?.key : undefined;
  if (options.kind && !chosen) notices.push(`Kind “${options.kind}” isn't offered in the ${ROUTE_ERAS.find((e) => e.code === era)!.label} era.`);
  const kindWeights = offered.map((k): [InnKind, number] => [k.key, k.era[era] * (settingInfo.kindX[k.key] ?? 1)]).filter(([, w]) => w > 0);
  const themes = { ...settingInfo.themes, ...(fantastic ? INN_DATA.fantasticThemes : {}) };
  const block = innBlockSet(options.safeguards);

  const newCtx = (kind: InnKind): Ctx => ({
    rng,
    culture,
    era,
    setting,
    fantastic,
    mode,
    tone: options.tone ?? "any",
    vocab: options.vocab ?? BUILT_IN_VOCAB,
    region,
    kind,
    themes,
    options,
    drawn: new Set(),
    words: [],
    uses: [],
    isRoute: false,
  });

  /** §7: era shapes 40% of names where there are some (60% for bars in the future); else the tradition. */
  const choosePlan = (ctx: Ctx, anchor?: string): Plan | undefined => {
    if (anchor) return pickWeighted(englishPlans(ctx, settingKey, options.shape).filter(([p]) => p.anchor === anchor), rng);
    const era = eraPlans(ctx, options.shape);
    const share = isFuture(ctx.era) && ctx.kind === "bar" ? INN_DATA.eraShare.futureBar : INN_DATA.eraShare.default;
    if (era.length > 0 && (eraIndex(ctx.era) >= eraIndex("ST") || options.shape) && rng() < share) return pickWeighted(era, rng);
    if (english > 0 && rng() < english) {
      const plan = pickWeighted(englishPlans(ctx, settingKey, options.shape), rng);
      if (plan) return plan;
    }
    return pickWeighted(culturePlans(ctx, options.shape), rng) ?? pickWeighted(era, rng);
  };

  /** §6.4: a sign with its house word, by the form. */
  const withHouse = (ctx: Ctx, sign: string): { text: string; house: boolean } | undefined => {
    const share = form === "signs" ? 0 : form === "house" ? 1 : INN_DATA.formShare.either;
    if (rng() >= share) return { text: sign, house: false };
    if (rng() < INN_DATA.formShare.innOf) return { text: `the ${rng() < 0.5 ? "Inn" : "Sign"} of ${sign}`, house: true };
    const hw = token(ctx, "hw");
    return hw ? { text: `${sign} ${hw}`, house: true } : undefined;
  };

  const build = (kind: InnKind, anchor?: string): InnName | undefined => {
    for (let i = 0; i < 20; i++) {
      const ctx = newCtx(kind);
      const plan = choosePlan(ctx, anchor);
      if (!plan) return undefined;
      const raw = renderPattern(ctx, plan.shape.p);
      if (!raw) continue;
      const sign = innCapitals(raw);
      let text = sign;
      let house = false;
      if (plan.tradition === "english" && plan.shape.house !== false && sign.startsWith("the ")) {
        const h = withHouse(ctx, sign);
        if (!h) continue;
        text = innCapitals(h.text);
        house = h.house;
      }
      if (!acceptable(text, ctx.isRoute)) continue;
      const tones = new Set<GroupTone>([...(plan.shape.t ?? []), ...ctx.drawn]);
      return {
        text,
        sign,
        kind,
        shape: plan.shape.p,
        tradition: plan.tradition,
        anchor: plan.anchor,
        house,
        tones: GROUP_TONES.filter((t) => tones.has(t)),
        words: ctx.words,
        uses: ctx.uses,
        route: ctx.isRoute,
      };
    }
    return undefined;
  };

  /** §7, §12: the cap, repetition and safeguards. */
  function acceptable(text: string, isRoute: boolean): boolean {
    const counted = countedWords(text);
    if (counted.length === 0 || counted.length > INN_DATA.cap) return false;
    if (!isRoute && repeatsContent(counted)) return false;
    if (innBlockForms(text).some((f) => block.has(f))) return false;
    if (breaksInnWords(text)) return false;
    if (isFuture(era) && hasSpaceBlock(text)) return false;
    if (hasChristianSign(text) && !cultureAllowed(["christian"], culture.key, era)) return false;
    return true;
  }

  const seen = new Set<string>();
  const names: InnName[] = [];
  const add = (n: InnName | undefined): boolean => {
    if (!n) return false;
    const key = n.text.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    names.push(n);
    return true;
  };
  const drawKind = () => chosen ?? pickWeighted(kindWeights, rng);

  if (options.series) drawTown();
  else {
    for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
      const k = drawKind();
      if (!k) break;
      add(build(k));
    }
  }
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
  return { names, seed, notices };

  /** §9: one town: no word twice; at most one Arms and one owner; one roadside and one location house. */
  function drawTown() {
    const used = new Set<string>();
    const once = new Set(["arms", "owner", "roadside", "location"]);
    const anchorsUsed = new Set<string>();
    const fresh = (n: InnName | undefined) => !!n && !n.uses.some((u) => used.has(u)) && !(once.has(n.anchor) && anchorsUsed.has(n.anchor));
    const keep = (n: InnName | undefined) => {
      if (!fresh(n) || !add(n)) return false;
      for (const u of n!.uses) used.add(u);
      anchorsUsed.add(n!.anchor);
      return true;
    };
    for (let idle = 0; idle < 60 && names.length < count; ) {
      const k = drawKind();
      if (!k) break;
      idle = keep(build(k)) ? 0 : idle + 1;
    }
    // §9: in batches of 6 or more, exactly one roadside and one location house (English signs).
    if (english <= 0 || count < INN_DATA.series.from || names.length < 2) return;
    const taken = new Set<number>([0]);
    for (const anchor of ["roadside", "location"]) {
      if (anchorsUsed.has(anchor)) {
        taken.add(names.findIndex((n) => n.anchor === anchor));
        continue;
      }
      const kind = (anchor === "roadside" ? (offered.some((k) => k.key === "inn") ? "inn" : chosen) : chosen) ?? drawKind()!;
      for (let i = 0; i < 20; i++) {
        const n = build(chosen ?? kind, anchor);
        if (!n || !fresh(n) || seen.has(n.text.toLowerCase())) continue;
        const free = names.map((_, j) => j).filter((j) => !taken.has(j) && !once.has(names[j].anchor));
        if (free.length === 0) break;
        const at = pickOne(free, rng);
        seen.delete(names[at].text.toLowerCase());
        for (const u of names[at].uses) used.delete(u);
        seen.add(n.text.toLowerCase());
        for (const u of n.uses) used.add(u);
        anchorsUsed.add(anchor);
        names[at] = n;
        taken.add(at);
        break;
      }
    }
  }
}
