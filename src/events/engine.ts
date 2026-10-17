// Events and eras (docs/events-and-eras-brief.md): the past of a world – wars, battles, rebellions,
// treaties, crises, migrations, disasters, collapses and the eras that frame them – for route names'
// 22 cultures and seven eras. Words come from the shared settlement pools (settlement/vocab.ts, with
// vocabulary packs); places, peoples, realms, people and figures come from the route engine, dynasties
// from realms, epithets from bynames, colours and numbers from group names. No Obsidian imports.

import { hasSpaceBlock } from "../space/safeguards";
import eventData from "../data/event-names.json";
import { BYNAMES_DATA, entryForm } from "../bynames/engine";
import {
  type GroupPeople,
  type GroupSafeguards,
  type GroupSetting,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  groupListWords,
  groupStarIn,
  groupPlural,
  groupPossessive,
  hasBannedWord,
  ordinalText,
  pickWeighted,
  repeatsContent,
  toneFactor,
  wordTones,
} from "../groups/engine";
import { mulberry32 } from "../markov";
import { DYNASTY_CULTURES } from "../realms/engine";
import {
  countedWords,
  findRouteCulture,
  personNames,
  ROUTE_ERAS,
  routeCapitals,
  routeFigure,
  routeFolk,
  routeKingdom,
  routeNorm,
  routePlace,
  routeSetting,
  type RouteCulture,
  type RouteEra,
} from "../routes/engine";
import { selfPatterns, TownTurn, type SettlementContext } from "../settlement/contextShared";
import { BUILT_IN_VOCAB, cultureAllowed, poolEntries, type VocabEntry, type Vocabulary } from "../settlement/vocab";

// ── Data ────────────────────────────────────────────────────────────────────

export type EventKind = "war" | "battle" | "rebellion" | "treaty" | "crisis" | "migration" | "disaster" | "collapse" | "era";
export type EventScale = "local" | "realm" | "world";

export interface EventShape {
  p: string;
  w: number;
  kind: EventKind;
  e?: RouteEra[];
  c?: string[];
  t?: GroupTone[];
  h?: boolean;
  /** §5.2: only at these scales. */
  sc?: EventScale[];
  /** A token limited to these words (the Anarchy, the Interregnum, the Regency). */
  only?: Record<string, string[]>;
  /** §10: `{place}` is the settlement with a context. */
  self?: boolean;
  /** §11.3: the Korean purge, the one shape that may say "Purge" (never with tone light). */
  purge?: boolean;
}

interface EventData {
  any: string;
  kinds: { key: EventKind; menu: string; plural: string; description: string; era: Record<RouteEra, number> }[];
  scales: { key: EventScale; text: string }[];
  scaleRules: { local: { place: number; riotShare: number }; world: { great: number; realm: number } };
  shapes: EventShape[];
  cultureShapes: EventShape[];
  steampunk: EventShape[];
  lists: { crisisFeeling: string[]; year: [number, number] };
  series: { recurring: number; disasterShare: number; carryPlace: number; secondEraFrom: number; warShare: number; againShare: number };
  cap: number;
  safeguards: { block: string[]; flag: string[]; flagListBlocks: boolean; banned: string[] };
}

export const EVENT_DATA = eventData as unknown as EventData;
export const EVENT_KINDS = EVENT_DATA.kinds;
export const EVENT_SCALES = EVENT_DATA.scales;
export const EVENT_ANY = EVENT_DATA.any;
const EVENT_SELF = selfPatterns(eventData);
const ALL_SHAPES = [...EVENT_DATA.shapes, ...EVENT_DATA.cultureShapes, ...EVENT_DATA.steampunk];

/** §5.1: the kinds offered in an era. */
export const eventKindsOffered = (era: RouteEra) => EVENT_KINDS.filter((k) => k.era[era] > 0);

export const defaultEventSafeguards = (): GroupSafeguards => ({ block: EVENT_DATA.safeguards.block, flag: EVENT_DATA.safeguards.flag, flagListBlocks: EVENT_DATA.safeguards.flagListBlocks });

// ── Options and results ─────────────────────────────────────────────────────

export interface EventOptions {
  culture?: string;
  kind?: EventKind;
  era?: RouteEra;
  fantastic?: boolean;
  scale?: EventScale;
  tone?: GroupToneChoice;
  people?: GroupPeople;
  /** §8: as one history. */
  series?: boolean;
  count: number;
  seed?: number;
  safeguards?: GroupSafeguards;
  vocab?: Vocabulary;
  /** Tests: only this shape. */
  shape?: string;
  /** Settlement kit (§10): the settlement's town, neighbours and founder. */
  context?: SettlementContext;
}

export interface EventName {
  text: string;
  kind: EventKind;
  shape: string;
  tones: GroupTone[];
  words: { pool: string; word: string }[];
  /** §8: the place, people and realm drawn. */
  place?: string;
  people?: string;
  realm?: string;
}

export interface EventBatch {
  names: EventName[];
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
  scale: EventScale;
  shape?: EventShape;
  /** §8: the series' recurring people and realm, and a place to carry over. */
  seriesPeople?: string;
  seriesRealm?: string;
  carryPlace?: string;
  context?: SettlementContext;
  turn?: TownTurn;
  /** Settlement kit §10: `{leader}` is the founder (the first founding). */
  founderLeader?: boolean;
  /** §8: the series' own people and realm shapes ×4, and the recurring people's weight. */
  boost?: (s: EventShape) => number;
  recurring?: number;
  drawn: Set<GroupTone>;
  words: { pool: string; word: string }[];
  place?: string;
  people?: string;
  realm?: string;
}

const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
const LIGHT_OR_GRIM = (t: readonly string[] | undefined) => !!t && (t.includes("light") || t.includes("grim"));
const CASTE = new Set(["indian", "west-african"]);
const SF_LISTS = new Set(["star", "spaceLand"]);

function vocabPool(ctx: Ctx, pool: string): [VocabEntry, number][] {
  const only = ctx.shape?.only?.[pool];
  return poolEntries(ctx.vocab, pool, { culture: ctx.culture.key, era: ctx.era, fantastic: ctx.fantastic })
    .filter(([e]) => (!only || only.includes(e.w)) && !(ctx.culture.sensitive && LIGHT_OR_GRIM(e.t)))
    .map(([e, w]): [VocabEntry, number] => [e, w * toneFactor(e.t ?? [], ctx.tone)])
    .filter(([, w]) => w > 0);
}

function fromPool(ctx: Ctx, pool: string): string | undefined {
  const e = pickWeighted(vocabPool(ctx, pool), ctx.rng);
  if (!e) return undefined;
  for (const t of e.t ?? []) ctx.drawn.add(t);
  ctx.words.push({ pool, word: e.w });
  return e.w;
}

function gnWord(ctx: Ctx, list: string): string | undefined {
  if (list === "star") {
    const star = groupStarIn("any", ctx.mode, ctx.rng);
    ctx.words.push({ pool: "star", word: star });
    return star;
  }
  const items = groupListWords(list, SF_LISTS.has(list) ? "SF" : ctx.setting)
    .filter(([w]) => !(ctx.culture.sensitive && LIGHT_OR_GRIM(wordTones(list, w))))
    .map(([w, n]): [string, number] => [w, n * toneFactor(wordTones(list, w), ctx.tone)])
    .filter(([, n]) => n > 0);
  const w = pickWeighted(items, ctx.rng);
  if (w === undefined) return undefined;
  for (const t of wordTones(list, w)) ctx.drawn.add(t);
  ctx.words.push({ pool: list, word: w });
  return w;
}

/** §3: `{place}`: an invented place (never a placeholder); with a context, this place or a neighbour. */
function place(ctx: Ctx): string | undefined {
  const p = ctx.turn ? ctx.turn.next(ctx.rng) : ctx.carryPlace && ctx.shape?.kind === "treaty" && ctx.rng() < EVENT_DATA.series.carryPlace ? ctx.carryPlace : routePlace(ctx.culture.key, ctx.setting, ctx.rng);
  if (p) ctx.place ??= p;
  return p;
}

/** §3: `{people}`: a tribes and kin groups name without "the"; the series' own at ×4. */
function people(ctx: Ctx): string | undefined {
  const fresh = () => (ctx.mode === "placeholders" ? "[people]" : routeFolk(ctx.culture.key, ctx.rng));
  const r = ctx.recurring ?? EVENT_DATA.series.recurring;
  const p = ctx.seriesPeople && (r === Infinity || ctx.rng() < r / (r + 1)) ? ctx.seriesPeople : fresh();
  if (p) ctx.people ??= p;
  return p;
}

function realm(ctx: Ctx): string | undefined {
  const fresh = () => (ctx.mode === "placeholders" ? "[realm]" : routeKingdom(ctx.culture.key, ctx.era, ctx.rng));
  const r = EVENT_DATA.series.recurring;
  const p = ctx.seriesRealm && !ctx.realm && ctx.rng() < r / (r + 1) ? ctx.seriesRealm : fresh();
  if (p) ctx.realm ??= p;
  return p;
}

/** BT `epCharacter`, English men's form. */
function epithet(ctx: Ctx): string | undefined {
  const items: [string, number][] = [];
  for (const e of BYNAMES_DATA.lists.epCharacter ?? []) {
    if (e.s && !e.s.includes(ctx.setting)) continue;
    const form = entryForm(e, "male", false);
    if (form) items.push([form.text, (e.x ?? 1) * toneFactor(e.t ?? [], ctx.tone)]);
  }
  return pickWeighted(items.filter(([, w]) => w > 0), ctx.rng);
}

function token(ctx: Ctx, name: string): string | undefined {
  const rng = ctx.rng;
  const placeholders = ctx.mode === "placeholders";
  switch (name) {
    case "place":
      return place(ctx);
    case "people":
      return people(ctx);
    case "realm":
      return realm(ctx);
    case "leader": {
      if (ctx.founderLeader && ctx.context) return ctx.context.founder;
      if (placeholders) return "[leader]";
      const names = personNames(ctx.culture.key);
      return names.length > 0 ? pickOne(names, rng) : undefined;
    }
    case "figure":
      return routeFigure(ctx.culture.key, ctx.setting, rng);
    case "dynasty":
      return placeholders || !DYNASTY_CULTURES.includes(ctx.culture.key) ? "[dynasty]" : gnWord(ctx, "house");
    case "epithet":
      return epithet(ctx);
    case "fixed":
      return fromPool(ctx, `eventFixed:${ctx.shape!.kind}`);
    case "trade":
      return fromPool(ctx, "streetTrades");
    case "goods":
      return fromPool(ctx, "streetGoods");
    case "realmForm":
      return pickOne(ctx.shape?.only?.realmForm ?? ["Kingdom"], rng);
    case "crisisFeeling":
      return pickOne(EVENT_DATA.lists.crisisFeeling, rng);
    case "year": {
      const [a, b] = EVENT_DATA.lists.year;
      return String(a + Math.floor(rng() * (b - a + 1)));
    }
    case "ordinal": {
      const choices: [number, number][] = [];
      for (let n = 1; n <= 30; n++) choices.push([n, n <= 12 ? 3 : 1]);
      return ordinalText(pickWeighted(choices, rng)!);
    }
    case "number":
    case "colour":
    case "ordinalWord":
    case "star":
    case "spaceLand":
      return gnWord(ctx, name);
  }
  return fromPool(ctx, name);
}

/** §9: a shape's pattern rendered (possessives, plurals, the en dash kept). */
function renderPattern(ctx: Ctx, pattern: string): string | undefined {
  if (ctx.context) ctx.turn = new TownTurn(ctx.context, EVENT_SELF.has(pattern));
  let failed = false;
  let colours: string[] = [];
  const out = pattern.replace(/\{([^}]+)\}/g, (_m, raw: string) => {
    if (failed) return "";
    const [name, mod] = raw.split(":");
    let piece = token(ctx, name);
    // "War of the {colour} and the {colour}": two colours.
    if (name === "colour" && piece && colours.includes(piece)) piece = token(ctx, name);
    if (!piece || (name === "colour" && colours.includes(piece))) {
      failed = true;
      return "";
    }
    if (name === "colour") colours = [...colours, piece];
    if (mod === "poss") return groupPossessive(piece, name === "trade");
    if (mod === "pl") return groupPlural(piece);
    return piece;
  });
  ctx.turn = undefined;
  return failed ? undefined : out;
}

/** §9: capitals; a leading "the" lower case. */
export const eventCapitals = (text: string) => routeCapitals(text).replace(/^The /, "the ");

// ── Safeguards (§11) ────────────────────────────────────────────────────────

const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const BANNED = EVENT_DATA.safeguards.banned.map((w) => [w, wordRe(w)] as const);
const bare = (text: string) => routeNorm(text).replace(/^the /, "");

/** §11.3: banned words (GN's and the module's); "Purge" only in the Korean purge shape. */
export function breaksEventWords(text: string, purgeAllowed = false): boolean {
  return hasBannedWord(text) || BANNED.some(([w, re]) => !(purgeAllowed && w === "Purge") && re.test(text));
}

export function eventBlockSet(guards: GroupSafeguards = defaultEventSafeguards()): Set<string> {
  return new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(bare));
}

/** RN §3.3: a pack word the event safeguards drop. */
export function eventWordBlocked(word: string, guards?: GroupSafeguards): boolean {
  return eventBlockSet(guards).has(bare(word)) || breaksEventWords(word);
}

// ── Shapes (§5.2, §7) ───────────────────────────────────────────────────────

/** §8 rule 3: the shapes that retell the recurring people (their war first). */
const PEOPLE_SHAPES: [EventKind, string][] = [
  ["war", "{people} War"],
  ["rebellion", "Rising of the {people}"],
  ["migration", "{people} Crossing"],
];

const GREAT = /(^|\s)(Great|World)(\s|$)/;

function shapeWeight(ctx: Ctx, s: EventShape): number {
  const c = ctx.culture;
  if (s.e && !s.e.includes(ctx.era)) return 0;
  if (!cultureAllowed(s.c, c.key, ctx.era)) return 0;
  if (s.h !== undefined && s.h !== ctx.fantastic) return 0;
  if (c.sensitive && (s.h || LIGHT_OR_GRIM(s.t))) return 0;
  if (s.sc && !s.sc.includes(ctx.scale)) return 0;
  if (s.purge && ctx.tone === "light") return 0;
  if (CASTE.has(c.key) && s.p.includes("{trade")) return 0;
  if (ctx.mode === "invented" && s.p.includes("{leader") && personNames(c.key).length === 0 && !(ctx.founderLeader && ctx.context)) return 0;
  let w = s.w;
  if (s.p === "{fixed}") {
    if (vocabPool({ ...ctx, shape: s }, `eventFixed:${s.kind}`).length === 0) return 0;
  } else {
    const single = s.p.match(/^(?:the )?\{(\w+)\}$/)?.[1];
    if (single && ctx.vocab.pools[single] && vocabPool({ ...ctx, shape: s }, single).length === 0) return 0;
  }
  // §5.2: scale.
  const r = EVENT_DATA.scaleRules;
  if (ctx.scale === "local") {
    if (GREAT.test(s.p) || s.p.includes("{realm")) return 0;
    if (s.p.includes("{place")) w *= r.local.place;
  } else if (ctx.scale === "world") {
    if (GREAT.test(s.p)) w *= r.world.great;
    if (s.p.includes("{realm")) w *= r.world.realm;
  }
  return w * toneFactor(s.t ?? [], ctx.tone) * (ctx.boost?.(s) ?? 1);
}

function plans(ctx: Ctx, kind: EventKind, only?: string): [EventShape, number][] {
  return ALL_SHAPES.filter((s) => s.kind === kind && (!only || s.p === only))
    .map((s): [EventShape, number] => [s, shapeWeight({ ...ctx, shape: s }, s)])
    .filter(([, w]) => w > 0);
}

// ── Batches ─────────────────────────────────────────────────────────────────

/** §6: a batch of unique event names; with series on, a chronicle in order (§8). */
export function generateEventNames(options: EventOptions): EventBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const notices: string[] = [];
  const culture = findRouteCulture(options.culture) ?? findRouteCulture("norman-british")!;
  const era: RouteEra = ROUTE_ERAS.some((e) => e.code === options.era) ? options.era! : "MD";
  const fantastic = !!options.fantastic;
  const scale: EventScale = EVENT_SCALES.some((s) => s.key === options.scale) ? options.scale! : "realm";
  const mode = options.people ?? "placeholders";
  const count = Math.max(0, Math.floor(options.count));
  const offered = eventKindsOffered(era);
  const chosen = options.kind && offered.some((k) => k.key === options.kind) ? options.kind : undefined;
  const block = eventBlockSet(options.safeguards);

  const base: Ctx = {
    rng,
    culture,
    era,
    setting: routeSetting(era, fantastic),
    fantastic,
    mode,
    tone: options.tone ?? "any",
    vocab: options.vocab ?? BUILT_IN_VOCAB,
    scale,
    context: options.context,
    drawn: new Set(),
    words: [],
  };
  const newCtx = (extra: Partial<Ctx> = {}): Ctx => ({ ...base, drawn: new Set(), words: [], ...extra });
  const kindWeights = offered.map((k): [EventKind, number] => [k.key, k.era[era]]).filter(([k]) => plans(newCtx(), k).length > 0);

  const acceptable = (text: string, s: EventShape): boolean => {
    const counted = countedWords(text);
    if (counted.length === 0 || counted.length > EVENT_DATA.cap) return false;
    if (repeatsContent(counted) && !s.p.includes("{colour} and the {colour}")) return false;
    if (block.has(bare(text))) return false;
    if (breaksEventWords(text, !!s.purge)) return false;
    if ((era === "NF" || era === "IS") && hasSpaceBlock(text)) return false;
    return true;
  };

  const build = (kind: EventKind, extra: Partial<Ctx> = {}, only?: string): EventName | undefined => {
    for (let i = 0; i < 20; i++) {
      const ctx = newCtx(extra);
      const s = pickWeighted(plans(ctx, kind, only ?? options.shape), rng);
      if (!s) return undefined;
      ctx.shape = s;
      let raw = renderPattern(ctx, s.p);
      if (!raw) continue;
      // §5.2: at a local scale, "{place} War" is a riot 40% of the time.
      if (scale === "local" && s.p === "{place} War" && rng() < EVENT_DATA.scaleRules.local.riotShare) raw = raw.replace(/ War$/, " Riot");
      const text = eventCapitals(raw);
      if (!acceptable(text, s)) continue;
      const tones = new Set<GroupTone>([...(s.t ?? []), ...ctx.drawn]);
      return {
        text,
        kind,
        shape: s.p,
        tones: GROUP_TONES.filter((t) => tones.has(t)),
        words: ctx.words,
        ...(ctx.place ? { place: ctx.place } : {}),
        ...(ctx.people ? { people: ctx.people } : {}),
        ...(ctx.realm ? { realm: ctx.realm } : {}),
      };
    }
    return undefined;
  };

  const seen = new Set<string>();
  const names: EventName[] = [];
  const add = (n: EventName | undefined): boolean => {
    if (!n || seen.has(n.text.toLowerCase())) return false;
    seen.add(n.text.toLowerCase());
    names.push(n);
    return true;
  };
  const drawKind = () => chosen ?? pickWeighted(kindWeights, rng);

  if (options.series) chronicle();
  else {
    for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
      const k = drawKind();
      if (!k) break;
      add(build(k));
    }
  }
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
  return { names, seed, notices };

  /** §8: one history: eras framing a rhythm of crisis or war, battle, treaty, then a collapse or migration. */
  function chronicle() {
    const s = EVENT_DATA.series;
    const seriesPeople = mode === "placeholders" ? "[people]" : routeFolk(culture.key, rng);
    const seriesRealm = mode === "placeholders" ? "[realm]" : routeKingdom(culture.key, era, rng);
    const recurs = (sh: EventShape) => (sh.p.includes("{people") || sh.p.includes("{realm") ? s.recurring : 1);
    let carryPlace: string | undefined;
    let founded = false;
    const second = count >= s.secondEraFrom ? Math.floor(count / 2) : -1;
    const rhythm: (EventKind | "cw" | "cm")[] = ["cw", "battle", "treaty"];
    for (let i = 0, beat = 0; i < count; i++) {
      let kind: EventKind;
      if (chosen) kind = chosen;
      else if (i === 0 || i === second) kind = "era";
      else if (i === count - 1 && count >= 4) kind = rng() < 0.5 ? "collapse" : "migration";
      else if (rng() < s.disasterShare) kind = "disaster";
      else {
        const slot = rhythm[beat++ % rhythm.length];
        kind = slot === "cw" ? (rng() < s.warShare ? "war" : "crisis") : (slot as EventKind);
      }
      if (!kindWeights.some(([k]) => k === kind)) kind = drawKind()!;
      const extra: Partial<Ctx> = { seriesPeople, seriesRealm, boost: recurs, carryPlace };
      // Settlement kit §10: the first founding names the town, led by its founder.
      if (options.context && !founded && kind === "migration") extra.founderLeader = true;
      let n: EventName | undefined;
      // §8 rules 3–4: a later war is fought again against an earlier war's enemy half the time (it is
      // numbered at the end); the series data names the share.
      const earlier = kind === "war" ? names.find((x) => x.kind === "war") : undefined;
      if (earlier && !chosen && rng() < s.againShare) n = { ...earlier, words: [...earlier.words] };
      for (let t = 0; t < 10 && !n; t++) {
        const b = build(kind, extra);
        if (b && !seen.has(b.text.toLowerCase())) n = b;
      }
      if (!n) continue;
      if (n.kind === "war" && earlier && n.text === earlier.text) {
        names.push(n);
        continue;
      }
      if (n.shape.startsWith("Founding of")) founded = true;
      if (kind === "battle" && n.place) carryPlace = n.place;
      add(n);
    }
    if (seriesPeople) ensurePeople(seriesPeople, { seriesPeople, seriesRealm, boost: recurs });
    numberWars();
  }

  /** §8 rule 4: a war that repeats takes the next ordinal, in the chronicle's order ("First" for the first). */
  function numberWars() {
    const ORD = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
    const strip = (t: string) => t.replace(new RegExp(`^(${ORD.join("|")}) `), "");
    const wars = names.filter((n) => n.kind === "war");
    for (const base of new Set(wars.map((n) => strip(n.text)))) {
      const same = wars.filter((n) => strip(n.text) === base);
      if (same.length < 2) continue;
      same.forEach((n, i) => (n.text = `${ORD[Math.min(i, ORD.length - 1)]} ${base}`));
    }
    seen.clear();
    for (const n of names) seen.add(n.text.toLowerCase());
  }

  /** §8 rule 3: the recurring people at least twice (a crisis or war slot retold as their war). */
  function ensurePeople(p: string, extra: Partial<Ctx>) {
    if (chosen && chosen !== "war") return;
    const has = () => names.filter((n) => n.people === p).length;
    // A crisis or war slot first; failing those, a disaster, battle or treaty (never an era or the close).
    const order = [...names.keys()].filter((i) => i > 0 && i < names.length - 1 && names[i].kind !== "era");
    const slots = [...order.filter((i) => ["war", "crisis"].includes(names[i].kind)), ...order.filter((i) => !["war", "crisis"].includes(names[i].kind))].reverse();
    for (const i of slots) {
      if (has() >= 2 || names.length < 4) break;
      const at = names[i];
      if (at.people === p) continue;
      let war: EventName | undefined;
      for (const [kind, shape] of PEOPLE_SHAPES) {
        war = build(kind, { ...extra, recurring: Infinity }, shape);
        if (war && !seen.has(war.text.toLowerCase())) break;
      }
      // A war already told is retold numbered (§8 rule 4), so a repeat is welcome here.
      if (!war || war.people !== p) continue;
      seen.delete(at.text.toLowerCase());
      names[i] = war;
      seen.add(war.text.toLowerCase());
    }
  }

}
