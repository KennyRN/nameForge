// Route names (docs/route-names-brief.md): long-distance roads, trade routes, pilgrim ways,
// military roads, droves, sea routes, railways and canals, modern roads and space lanes, for 22
// cultures from the ancient world to the interstellar. Words come from the shared settlement pools
// (settlement/vocab.ts, with vocabulary packs); reuses the group engine's weighted draws, tone
// factor, places, saints and safeguards, bynames' ranks, the tribal engine's peoples and realms'
// short names. No Obsidian imports.

import { hasSpaceBlock } from "../space/safeguards";
import routeData from "../data/route-names.json";
import { BYNAMES_DATA, entryForm, holyNamesIn, stripPlural, townSource } from "../bynames/engine";
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
  groupPossessive,
  groupSaint,
  groupTown,
  hasBannedWord,
  ordinalText,
  pickWeighted,
  repeatsContent,
  seriesTokenKind,
  toneFactor,
  wordTones,
} from "../groups/engine";
import { deityHooks } from "../deities/hook";
import { mulberry32 } from "../markov";
import { generateRealmNames, REALM_DATA, REALM_ERAS } from "../realms/engine";
import { boostPool, contextSaint, selfPatterns, TownTurn, type SettlementContext } from "../settlement/contextShared";
import { BUILT_IN_VOCAB, cultureAllowed, poolEntries, type SettlementEra, type VocabEntry, type Vocabulary } from "../settlement/vocab";
import { generateTribalNames } from "../tribes/engine";
import { WORLD_CULTURES } from "../world/engine";

// ── Data ────────────────────────────────────────────────────────────────────

export type RouteEra = SettlementEra;
export type RouteKind = "road" | "trade" | "pilgrim" | "military" | "drove" | "sea" | "rail" | "motor" | "space";

export interface RouteShape {
  p: string;
  w: number;
  /** Eras (all). */
  e?: RouteEra[];
  /** Cultures (all): keys, "british", "christian", or `!key`. */
  c?: string[];
  t?: GroupTone[];
  /** §4.4: the region tag; `rEra` limits it to some eras (Military Road shapes in EM). */
  r?: string;
  rEra?: RouteEra[];
  /** §4.4: a region tag on one word of a token ("salt (Salt only)"). */
  rw?: { token: string; word: string; r: string };
  /** true: fantastic only; false: realistic only. */
  h?: boolean;
  /** The words a token may take here (the travellers a shape names). */
  only?: Record<string, string[]>;
  /** Culture multipliers on the shape ("japanese ×3"). */
  cx?: Record<string, number>;
  /** Culture word multipliers (Roman "{goods} Road" with Salt ×5). */
  cw?: Record<string, Record<string, Record<string, number>>>;
  /** §8.8: road letters and their weights. */
  letters?: Record<string, number>;
  /** The shape repeats a word on purpose (Road from the Reed Folk to the High Folk). */
  repeats?: boolean;
}

export interface RouteCulture {
  key: string;
  label: string;
  group: string;
  sensitive?: boolean;
  kindMult?: Partial<Record<RouteKind, number>>;
  /** §4.2: the tribal tradition for `{folk}` where realms' map has none. */
  folk?: string;
  /** §4.2: `{figure}` where the culture has no byname ranks. */
  figure?: string[];
}

export interface RouteKindInfo {
  key: RouteKind;
  menu: string;
  plural: string;
  description: string;
  era: Record<RouteEra, number>;
  fantasticEra?: Partial<Record<RouteEra, number>>;
}

interface RouteData {
  any: string;
  eras: { code: RouteEra; label: string; settings: [GroupSetting, GroupSetting] }[];
  cultures: RouteCulture[];
  kinds: RouteKindInfo[];
  regions: Record<string, Record<string, number>>;
  shapes: Record<RouteKind, RouteShape[]>;
  cultureShapes: (RouteShape & { culture: string; kind: RouteKind })[];
  spaceBorrow: { share: number; kinds: RouteKind[] };
  roadNumbers: Record<string, [number, number, number][]>;
  cap: number;
  safeguards: { block: string[]; flag: string[]; flagListBlocks: boolean; banned: string[] };
}

export const ROUTE_DATA = routeData as unknown as RouteData;
export const ROUTE_ERAS = ROUTE_DATA.eras;
export const ROUTE_CULTURES = ROUTE_DATA.cultures;
export const ROUTE_KINDS = ROUTE_DATA.kinds;
export const ROUTE_ANY = ROUTE_DATA.any;
/** §4.1: the cultures the region link is offered for. */
export const BRITISH_CULTURES = ["anglo-saxon", "celtic", "norman-british"];

export const findRouteCulture = (key: string | undefined) => ROUTE_CULTURES.find((c) => c.key === key);
export const findRouteKind = (key: string | undefined) => ROUTE_KINDS.find((k) => k.key === key);
export const routeEraLabel = (code: string) => ROUTE_ERAS.find((e) => e.code === code)?.label ?? code;

/** §4.3: the group setting for an era and the fantastic switch. */
export function routeSetting(era: RouteEra, fantastic: boolean): GroupSetting {
  const e = ROUTE_ERAS.find((x) => x.code === era) ?? ROUTE_ERAS[1];
  return e.settings[fantastic ? 1 : 0];
}

/** §5.2: a kind's weight in an era (pilgrim in the near future and beyond only when fantastic). */
export function kindEraWeight(kind: RouteKindInfo, era: RouteEra, fantastic: boolean): number {
  return (fantastic ? kind.fantasticEra?.[era] : undefined) ?? kind.era[era] ?? 0;
}

/** §2.2, §5.2: the kinds offered in an era. */
export function kindsOffered(era: RouteEra, fantastic: boolean): RouteKindInfo[] {
  return ROUTE_KINDS.filter((k) => kindEraWeight(k, era, fantastic) > 0);
}

// ── Options and results ─────────────────────────────────────────────────────

export interface RouteOptions {
  culture?: string;
  /** A kind key; undefined is Any. */
  kind?: string;
  era?: RouteEra;
  fantastic?: boolean;
  /** A place-shape region code; undefined is all of Britain. British cultures only. */
  region?: string;
  tone?: GroupToneChoice;
  people?: GroupPeople;
  /** §9: as one network. */
  series?: boolean;
  count: number;
  seed?: number;
  /** §12.6: merged safeguard lists; the built-in lists when absent. */
  safeguards?: GroupSafeguards;
  /** §3.3: the pools merged with vocabulary packs; the built-in pools when absent. */
  vocab?: Vocabulary;
  /** Tests: only this shape (its pattern; "fixed" for a fixed name). */
  shape?: string;
  /** Settlement kit §4: the settlement's town, neighbours, founder, saint and goods. */
  context?: SettlementContext;
}

export interface RouteName {
  text: string;
  kind: RouteKind;
  shape: string;
  era: RouteEra;
  tones: GroupTone[];
  /** §7: a space lane on one of the culture's road, trade, pilgrim or sea shapes. */
  borrowed: boolean;
  /** Every pool or list word drawn, with its pool (tests). */
  words: { pool: string; word: string }[];
  series?: { counter: string | null; varies: string | null; anchor: string | null };
}

export interface RouteBatch {
  names: RouteName[];
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
  /** §4.4: the region code, for British cultures only. */
  region?: string;
  shape?: RouteShape;
  /** §7: `{destination}` and `{town}` read as `{star}`. */
  borrowed: boolean;
  letter?: string;
  drawn: Set<GroupTone>;
  words: { pool: string; word: string }[];
  /** Settlement kit §4. */
  context?: SettlementContext;
  /** Settlement kit §4: the `{town}` tokens of the pattern being rendered. */
  turn?: TownTurn;
}

const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
const LIGHT_OR_GRIM = (t: readonly string[] | undefined) => !!t && (t.includes("light") || t.includes("grim"));

/** Settlement kit §4: the shapes whose first `{town}` is the settlement. */
const ROUTE_SELF = selfPatterns(routeData);

/** Token names that read a shared pool under another name. */
const POOL_OF: Record<string, string> = { goods: "routeGoods" };
/** §4.2: group-names lists, read through their setting tags (space words always in sci-fi). */
const GN_LISTS: Record<string, string> = { number: "number", numberWord: "number", colour: "colour", heraldicBeast: "heraldicBeast", star: "star", greek: "greek", spaceLand: "spaceLand" };
const SF_LISTS = new Set(["star", "greek", "spaceLand"]);
/** §4.2: the cultures `{god}` is drawn for (§12.3). */
const GOD_CULTURES = new Set(["egyptian", "norse", "anglo-saxon", "aztec", "maya"]);

/** §4.4: a region tag's multiplier here (×1 outside the British cultures or with no region). */
function regionMult(ctx: Ctx, tag: string | undefined, eras?: RouteEra[]): number {
  if (!tag || !ctx.region) return 1;
  if (eras && !eras.includes(ctx.era)) return 1;
  return ROUTE_DATA.regions[tag]?.[ctx.region] ?? 1;
}

/** A pool's words here: culture, era, fantastic, region, tone; never light or grim for the sensitive cultures. */
function vocabPool(ctx: Ctx, pool: string, token: string): [VocabEntry, number][] {
  const shape = ctx.shape;
  const only = shape?.only?.[token];
  const cw = shape?.cw?.[ctx.culture.key]?.[token];
  return poolEntries(ctx.vocab, pool, { culture: ctx.culture.key, era: ctx.era, fantastic: ctx.fantastic, region: ctx.region })
    .filter(([e]) => (!only || only.includes(e.w)) && !(ctx.culture.sensitive && LIGHT_OR_GRIM(e.t)))
    .map(([e, w]): [VocabEntry, number] => {
      let n = w * toneFactor(e.t ?? [], ctx.tone) * regionMult(ctx, e.rt) * (cw?.[e.w] ?? 1);
      if (shape?.rw && shape.rw.token === token && shape.rw.word === e.w) n *= regionMult(ctx, shape.rw.r);
      return [e, n];
    })
    .filter(([, n]) => n > 0);
}

function vocabWord(ctx: Ctx, pool: string, token: string, keep?: (w: string) => boolean): string | undefined {
  const items = boostPool(ctx.context, pool, vocabPool(ctx, pool, token)).filter(([e]) => !keep || keep(e.w));
  const e = pickWeighted(items, ctx.rng);
  if (!e) return undefined;
  for (const t of e.t ?? []) ctx.drawn.add(t);
  ctx.words.push({ pool, word: e.w });
  return e.w;
}

/** A group-names list word, tone-weighted; never light or grim for the sensitive cultures. */
function gnWord(ctx: Ctx, token: string): string | undefined {
  if (token === "star") {
    const star = groupStarIn("any", ctx.mode, ctx.rng);
    ctx.words.push({ pool: "star", word: star });
    return star;
  }
  const list = GN_LISTS[token];
  const setting = SF_LISTS.has(token) ? "SF" : ctx.setting;
  const items = groupListWords(list, setting)
    .filter(([w]) => !(ctx.culture.sensitive && LIGHT_OR_GRIM(wordTones(list, w))))
    .map(([w, n]): [string, number] => [w, n * toneFactor(wordTones(list, w), ctx.tone)])
    .filter(([, n]) => n > 0);
  const w = pickWeighted(items, ctx.rng);
  if (w === undefined) return undefined;
  for (const t of wordTones(list, w)) ctx.drawn.add(t);
  ctx.words.push({ pool: list, word: w });
  return w;
}

/** §4.2: an invented place: the culture's places (a land compound for Polynesian and Andean). */
export function routePlace(cultureKey: string, setting: GroupSetting, rng: () => number): string | undefined {
  const culture = findRouteCulture(cultureKey);
  const source = culture?.sensitive ? undefined : townSource(cultureKey);
  // §12.3 / BT §11.4: no deity or saint names in the no-gods cultures' places.
  const holy = holyNamesIn(cultureKey);
  for (let i = 0; i < 20; i++) {
    const t = groupTown(setting, source, rng).replace(/^The /, "");
    if (!holy || !holy.test(t)) return t;
  }
  return undefined;
}

/** §4.2: invented people: the world culture's `name` list (anglo-saxon, norse). */
export const personNames = (culture: string): string[] =>
  (WORLD_CULTURES.find((c) => c.id === culture)?.lists.name ?? []).filter((w) => !w.includes("{")).map(stripPlural);

/** §4.2: `{god}`: the world culture's gods, for the five cultures of §12.3 only. */
export const godNames = (culture: string): string[] =>
  GOD_CULTURES.has(culture) ? (WORLD_CULTURES.find((c) => c.id === culture)?.lists.god ?? []).filter((w) => !w.includes("{")).map(stripPlural) : [];

/** §4.2: `{figure}`: the culture's byname ranks, English men's form, at their weights. */
export function routeFigure(cultureKey: string, setting: GroupSetting, rng: () => number): string | undefined {
  const culture = findRouteCulture(cultureKey);
  if (culture?.figure) return pickOne(culture.figure, rng);
  const ranks = BYNAMES_DATA.ranks[cultureKey] ?? BYNAMES_DATA.ranks.general;
  const items: [string, number][] = [];
  for (const r of ranks) {
    if (r.s && !r.s.includes(setting)) continue;
    const form = entryForm(r, "male", false);
    if (form) items.push([form.text, (r.x ?? 1) * (r.cx?.[cultureKey] ?? 1)]);
  }
  return pickWeighted(items, rng);
}
const figure = (ctx: Ctx) => routeFigure(ctx.culture.key, ctx.setting, ctx.rng);

/** §4.2: one tribes and kin groups name per culture, from a pool made once with a fixed seed. */
const FOLK = new Map<string, string[]>();
export function routeFolk(cultureKey: string, rng: () => number): string | undefined {
  const tradition = findRouteCulture(cultureKey)?.folk ?? REALM_DATA.tribal[cultureKey] ?? "general";
  let pool = FOLK.get(tradition);
  if (!pool) {
    pool = generateTribalNames({ tradition, count: 120, seed: 1789 })
      .names.map((n) => n.name.replace(/^the /i, ""))
      .filter((n) => !n.includes("["));
    FOLK.set(tradition, pool);
  }
  return pool.length > 0 ? pickOne(pool, rng) : undefined;
}

/** §4.2: `{kingdom}`: a realm's short name (territorial, named for land), from a pool per culture and era. */
const KINGDOMS = new Map<string, string[]>();
/** Also events and eras' `{realm}` (Events brief §3). */
export function routeKingdom(cultureKey: string, routeEra: RouteEra, rng: () => number): string | undefined {
  const era = REALM_ERAS.find((e) => e.code === routeEra)?.key ?? "medieval";
  const key = `${cultureKey}|${era}`;
  let pool = KINGDOMS.get(key);
  if (!pool) {
    pool = generateRealmNames({ culture: cultureKey, era, character: "territorial", namedFor: "land", output: "short", people: "invented", count: 80, seed: 1789 })
      .names.map((n) => n.text.replace(/^the /i, ""))
      .filter((n) => !n.includes("["));
    KINGDOMS.set(key, pool);
  }
  return pool.length > 0 ? pickOne(pool, rng) : undefined;
}
const kingdom = (ctx: Ctx) => routeKingdom(ctx.culture.key, ctx.era, ctx.rng);

/** §8.8: a road number from weighted ranges. */
function roadNumber(ctx: Ctx, which: string): string {
  const range = pickWeighted(ROUTE_DATA.roadNumbers[which].map((r): [[number, number, number], number] => [r, r[2] * (r[1] - r[0] + 1)]), ctx.rng)!;
  return String(range[0] + Math.floor(ctx.rng() * (range[1] - range[0] + 1)));
}

/** One token (§4.2, §6). */
function token(ctx: Ctx, name: string): string | undefined {
  const rng = ctx.rng;
  const placeholders = ctx.mode === "placeholders";
  switch (name) {
    case "destination":
    case "town":
      // §7: a borrowed shape's places are stars.
      if (ctx.borrowed) return gnWord(ctx, "star");
      // Settlement kit §4: this place, or one of its neighbours.
      if (ctx.turn) return name === "town" ? ctx.turn.next(rng) : ctx.turn.other(rng);
      return placeholders ? "[place]" : routePlace(ctx.culture.key, ctx.setting, ctx.rng);
    case "folk":
      return placeholders ? "[folk]" : routeFolk(ctx.culture.key, ctx.rng);
    case "person":
    case "founder":
    case "patron": {
      if (name === "founder" && ctx.context) return ctx.context.founder;
      if (placeholders) return `[${name}]`;
      const names = personNames(ctx.culture.key);
      return names.length > 0 ? pickOne(names, rng) : undefined;
    }
    case "figure":
      return figure(ctx);
    case "kingdom":
      return placeholders ? "[kingdom]" : kingdom(ctx);
    case "holy": {
      const other = () => (placeholders ? "[holy person]" : groupSaint(ctx.setting, rng));
      return ctx.context ? contextSaint(ctx.context, other, rng) : other();
    }
    case "god": {
      const gods = godNames(ctx.culture.key);
      return gods.length > 0 ? pickOne(gods, rng) : undefined;
    }
    case "sacredPlace": {
      // Deities brief §10.2: an invented sacred place, without its own "the".
      const w = deityHooks()?.sacredPlace({ culture: ctx.culture.key, era: ctx.era, fantastic: ctx.fantastic, tone: ctx.tone, rng, vocab: ctx.vocab });
      if (w) ctx.words.push({ pool: "sacredPlace", word: w });
      return w;
    }
    case "holySite": {
      const w = vocabWord(ctx, "holySite", name);
      return w && `the ${w}`;
    }
    case "roadLetter": {
      const letters = Object.entries(ctx.shape?.letters ?? { A: 1 });
      return (ctx.letter = pickWeighted(letters, rng));
    }
    case "n":
      return roadNumber(ctx, ctx.letter ?? "route");
    case "ordinal": {
      const choices: [number, number][] = [];
      for (let n = 1; n <= 99; n++) choices.push([n, n <= 12 ? 3 : n <= 30 ? 1 : 0.2]);
      return ordinalText(pickWeighted(choices, rng)!);
    }
    case "spaceLand": {
      // RP §6.1: a space region, sometimes with a prefix ("Outer Belt").
      const w = gnWord(ctx, "spaceLand");
      if (!w || rng() >= 0.3) return w;
      return groupSpacePrefix(w, rng);
    }
  }
  if (GN_LISTS[name]) return gnWord(ctx, name);
  return vocabWord(ctx, POOL_OF[name] ?? name, name);
}

/** TS §3: a top-level token as drawn. */
interface Drawn {
  name: string;
  text: string;
}

/** TS §3: values held fixed (by token position, or for one token by name), and the record. */
interface Hooks {
  byIndex?: Map<number, Drawn>;
  byName?: Drawn;
  record?: Drawn[];
}

const withMod = (name: string, text: string, mod: string | undefined) => (mod === "poss" ? groupPossessive(text, name === "travellers") : text);

/** Renders a pattern's tokens; undefined when one has nothing to offer. */
function renderPattern(ctx: Ctx, pattern: string, hooks?: Hooks): string | undefined {
  if (ctx.context) ctx.turn = new TownTurn(ctx.context, ROUTE_SELF.has(pattern));
  let failed = false;
  let index = -1;
  let nameUsed = false;
  const out = pattern.replace(/\{([^}]+)\}/g, (_m, raw: string) => {
    if (failed) return "";
    index++;
    const [name, mod] = raw.split(":");
    let piece: string | undefined;
    const fixed = hooks?.byIndex?.get(index);
    if (fixed) piece = fixed.text;
    else if (hooks?.byName && !nameUsed && hooks.byName.name === name) {
      piece = hooks.byName.text;
      nameUsed = true;
    } else piece = token(ctx, name);
    if (piece === undefined || piece === "") {
      failed = true;
      return "";
    }
    hooks?.record?.push({ name, text: piece });
    return withMod(name, piece, mod);
  });
  return failed ? undefined : out;
}

// ── Rendering (§10) ─────────────────────────────────────────────────────────

const SMALL = new Set(["of", "the", "and", "to", "from", "in", "at", "by", "on", "for"]);

/** §10: capitals (after hyphens and dashes too), small words lower case after the first word, so a
 * leading "The" (fixed space names) keeps its capital. */
export function routeCapitals(text: string): string {
  let bracket = false;
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word, i) => {
      // Placeholders ([holy person]) as written.
      const inside = bracket || word.startsWith("[");
      bracket = inside && !word.includes("]");
      if (!word || inside) return word;
      if (i > 0 && SMALL.has(word.toLowerCase())) return word.toLowerCase();
      return word.replace(/(^|[-–])([a-z])/g, (_m, sep: string, c: string) => sep + c.toUpperCase());
    })
    .join(" ");
}

/** GN §11.2: content words, a leading "The" and the small words not counted. */
export const countedWords = (text: string) => text.split(" ").filter((w, i) => w && !(i === 0 && w === "The") && !SMALL.has(w.toLowerCase()));

// ── Safeguards (§12) ────────────────────────────────────────────────────────

/** §12.1: whole names, case-insensitive; "The Ridgeway" and "The Corpse Road" keep their "The". */
export const routeNorm = (s: string) => s.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const BANNED = ROUTE_DATA.safeguards.banned.map(wordRe);

/** §12.5: GN's banned words and the route list. */
export function breaksRouteWords(text: string): boolean {
  return hasBannedWord(text) || BANNED.some((re) => re.test(text));
}

/** §12.1–§12.2: the block set for merged safeguard lists (the flag list too when it blocks). */
export function routeBlockSet(guards: GroupSafeguards = defaultRouteSafeguards()): Set<string> {
  return new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(routeNorm));
}

export const defaultRouteSafeguards = (): GroupSafeguards => ({
  block: ROUTE_DATA.safeguards.block,
  flag: ROUTE_DATA.safeguards.flag,
  flagListBlocks: ROUTE_DATA.safeguards.flagListBlocks,
});

/** §3.3: a pack word the safeguards drop (blocked whole, or holding a banned word). */
export function routeWordBlocked(word: string, guards?: GroupSafeguards): boolean {
  return routeBlockSet(guards).has(routeNorm(word)) || breaksRouteWords(word);
}

// ── Shapes (§7, §8) ─────────────────────────────────────────────────────────

/** A shape as drawn: its kind and whether it's a borrowed space lane. */
interface Plan {
  kind: RouteKind;
  shape: RouteShape;
  borrowed: boolean;
}

const PERSON_TOKENS = /\{(person|founder|patron)[}:]/;
const PLACE_TOKENS = /\{(destination|town)[}:]/;

/** §8: the kind's shared shapes and the culture's own, for a culture. */
function shapesFor(kind: RouteKind, culture: string): RouteShape[] {
  return [...ROUTE_DATA.shapes[kind], ...ROUTE_DATA.cultureShapes.filter((s) => s.kind === kind && s.culture === culture)];
}

/** §7, §8: a shape's weight here (0 when it can't be drawn). `anyEra` for borrowed shapes. */
function shapeWeight(ctx: Ctx, kind: RouteKind, s: RouteShape, anyEra = false): number {
  const c = ctx.culture;
  if (!anyEra && s.e && !s.e.includes(ctx.era)) return 0;
  if (!cultureAllowed(s.c, c.key, ctx.era)) return 0;
  if (s.h !== undefined && s.h !== ctx.fantastic) return 0;
  // Deities brief §10.2: invented sacred places only with the deities engine loaded, never for the sensitive cultures.
  if (s.p.includes("{sacredPlace}") && (c.sensitive || !deityHooks()?.cultureOffered(c.key))) return 0;
  // §12.4: no fantastic shapes, no light or grim shapes, no fixed pilgrim names for the sensitive cultures.
  if (c.sensitive && (s.h || LIGHT_OR_GRIM(s.t) || (s.p === "fixed" && kind === "pilgrim"))) return 0;
  // §4.2: invented people only where the culture has a name list.
  if (ctx.mode === "invented" && PERSON_TOKENS.test(s.p) && personNames(c.key).length === 0) return 0;
  if (s.p.includes("{god}") && godNames(c.key).length === 0) return 0;
  if (s.p.includes("{holy}") && !cultureAllowed(["christian"], c.key, ctx.era)) return 0;
  if (s.p === "fixed") {
    const prev = ctx.shape;
    ctx.shape = s;
    const live = vocabPool(ctx, `routeFixed:${kind}`, "fixed").length > 0;
    ctx.shape = prev;
    if (!live) return 0;
  }
  return s.w * (s.cx?.[c.key] ?? 1) * regionMult(ctx, s.r, s.rEra) * toneFactor(s.t ?? [], ctx.tone);
}

function kindPlans(ctx: Ctx, kind: RouteKind, only?: string): [Plan, number][] {
  return shapesFor(kind, ctx.culture.key)
    .filter((s) => !only || s.p === only)
    .map((s): [Plan, number] => [{ kind, shape: s, borrowed: false }, shapeWeight(ctx, kind, s)])
    .filter(([, w]) => w > 0);
}

/** §7: the culture's road, trade, pilgrim and sea shapes with a place, as space lanes. */
function borrowedPlans(ctx: Ctx): [Plan, number][] {
  return ROUTE_DATA.spaceBorrow.kinds.flatMap((kind) =>
    shapesFor(kind, ctx.culture.key)
      .filter((s) => PLACE_TOKENS.test(s.p))
      .map((s): [Plan, number] => [{ kind: "space", shape: s, borrowed: true }, shapeWeight(ctx, kind, s, true)])
      .filter(([, w]) => w > 0),
  );
}

interface Built {
  text: string;
  plan: Plan;
  tones: GroupTone[];
  record: Drawn[];
  words: { pool: string; word: string }[];
}

/** Renders a plan: a fixed name from its pool, or the shape's tokens. */
function renderPlan(ctx: Ctx, plan: Plan, hooks: Hooks = {}): Built | undefined {
  ctx.drawn = new Set(plan.shape.t ?? []);
  ctx.words = [];
  ctx.shape = plan.shape;
  ctx.borrowed = plan.borrowed;
  ctx.letter = undefined;
  const record: Drawn[] = [];
  let raw: string | undefined;
  if (plan.shape.p === "fixed") {
    raw = hooks.byIndex?.get(0)?.text ?? vocabWord(ctx, `routeFixed:${plan.kind}`, "fixed");
    if (raw) record.push({ name: "fixed", text: raw });
  } else raw = renderPattern(ctx, plan.shape.p, { ...hooks, record });
  if (!raw) return undefined;
  const tones = new Set<GroupTone>(ctx.drawn);
  return { text: routeCapitals(raw), plan, record, tones: GROUP_TONES.filter((t) => tones.has(t)), words: ctx.words };
}

/** §7, §12: the cap, repetition and safeguards. */
function acceptable(built: Built, block: Set<string>, future = false): boolean {
  const counted = countedWords(built.text);
  if (counted.length === 0 || counted.length > ROUTE_DATA.cap) return false;
  if (built.plan.shape.repeats) {
    // The shape repeats its own word; its tokens still differ.
    const values = built.record.map((d) => d.text.toLowerCase());
    if (new Set(values).size < values.length) return false;
  } else if (repeatsContent(counted)) return false;
  if (block.has(routeNorm(built.text))) return false;
  if (breaksRouteWords(built.text)) return false;
  if (future && hasSpaceBlock(built.text)) return false;
  return true;
}

// ── Series (§9) ─────────────────────────────────────────────────────────────

/** §9: the compass order the direction counters step through. */
const COMPASS: Record<string, string[]> = {
  direction: ["North", "East", "South", "West", "North-East", "South-East", "South-West", "North-West"],
  directionAdj: ["Northern", "Eastern", "Southern", "Western"],
};
const DIRECTION_TOKENS = new Set(Object.keys(COMPASS));
/** TS §3: route tokens that render as placeholders in placeholder mode, and tokens that are never anchors. */
const PLACEHOLDER_TOKENS = new Set(["destination", "town", "folk", "person", "founder", "patron", "kingdom", "holy"]);
const NEVER_ANCHORS = new Set(["person", "founder", "patron", "holy", "n"]);
const kindOf = (name: string) => (NEVER_ANCHORS.has(name) ? "never" : name === "destination" ? "owner" : seriesTokenKind(name));

/** §9: the counter's values: the compass order (then any words packs add), in the pool here. */
function compassValues(ctx: Ctx, token: string): string[] {
  const live = poolEntries(ctx.vocab, token, { culture: ctx.culture.key, era: ctx.era, fantastic: ctx.fantastic }).map(([e]) => e.w);
  return [...COMPASS[token].filter((w) => live.includes(w)), ...live.filter((w) => !COMPASS[token].includes(w))];
}

// ── Batches ─────────────────────────────────────────────────────────────────

/** §7: a batch of unique route names. */
export function generateRouteNames(options: RouteOptions): RouteBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const notices: string[] = [];
  const culture = findRouteCulture(options.culture) ?? findRouteCulture("norman-british")!;
  const era: RouteEra = ROUTE_ERAS.some((e) => e.code === options.era) ? options.era! : "MD";
  const fantastic = !!options.fantastic;
  const setting = routeSetting(era, fantastic);
  const offered = kindsOffered(era, fantastic);
  const chosen = options.kind ? offered.find((k) => k.key === options.kind) : undefined;
  if (options.kind && !chosen) notices.push(`Kind “${options.kind}” isn't offered in the ${routeEraLabel(era)} era.`);
  const kindWeights = offered
    .map((k): [RouteKindInfo, number] => [k, kindEraWeight(k, era, fantastic) * (culture.kindMult?.[k.key] ?? 1)])
    .filter(([, w]) => w > 0);
  const block = routeBlockSet(options.safeguards);
  const count = Math.max(0, Math.floor(options.count));

  const newCtx = (): Ctx => ({
    rng,
    culture,
    era,
    setting,
    fantastic,
    mode: options.people ?? "placeholders",
    tone: options.tone ?? "any",
    vocab: options.vocab ?? BUILT_IN_VOCAB,
    region: BRITISH_CULTURES.includes(culture.key) && options.region && options.region !== "all" ? options.region : undefined,
    borrowed: false,
    drawn: new Set(),
    words: [],
    context: options.context,
  });

  /** §7: a shape for a kind: 25% of space lanes borrow one of the culture's shapes. */
  const choosePlan = (ctx: Ctx, kind: RouteKind): Plan | undefined => {
    if (kind === "space" && !options.shape && rng() < ROUTE_DATA.spaceBorrow.share) {
      const plan = pickWeighted(borrowedPlans(ctx), rng);
      if (plan) return plan;
    }
    return pickWeighted(kindPlans(ctx, kind, options.shape), rng);
  };

  const toName = (built: Built, series?: RouteName["series"]): RouteName => ({
    text: built.text,
    kind: built.plan.kind,
    shape: built.plan.shape.p,
    era,
    tones: built.tones,
    borrowed: built.plan.borrowed,
    words: built.words,
    ...(series ? { series } : {}),
  });

  const drawKind = () => chosen?.key ?? pickWeighted(kindWeights, rng)?.key;

  /** GN §4: 20 tries a kind, then a second kind (or the chosen kind again). */
  const oneBuilt = (kindFor?: RouteKind): Built | undefined => {
    for (let round = 0; round < 2; round++) {
      const kind = kindFor ?? drawKind();
      if (!kind) return undefined;
      for (let i = 0; i < 20; i++) {
        const ctx = newCtx();
        const plan = choosePlan(ctx, kind);
        if (!plan) break;
        const built = renderPlan(ctx, plan);
        if (built && acceptable(built, block, era === "NF" || era === "IS")) return built;
      }
    }
    return undefined;
  };

  const seen = new Set<string>();
  const names: RouteName[] = [];
  const add = (name: RouteName | undefined): boolean => {
    if (!name) return false;
    const key = name.text.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    names.push(name);
    return true;
  };

  if (options.series && kindWeights.length + (chosen ? 1 : 0) > 0) drawNetwork();
  else for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
    const built = oneBuilt();
    if (built) add(toName(built));
  }
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
  return { names, seed, notices };

  /** §9: one network: one kind and shape; directions turn, destinations change, else TS §3. */
  function drawNetwork() {
    const placeholders = (options.people ?? "placeholders") === "placeholders";
    const isPlaceholder = (d: Drawn) => placeholders && PLACEHOLDER_TOKENS.has(d.name);
    const canVary = (d: Drawn) => DIRECTION_TOKENS.has(d.name) || (kindOf(d.name) !== "never" && d.name !== "fixed" && !isPlaceholder(d));
    let first: Built | undefined;
    for (let i = 0; i < 40 && !first; i++) {
      const built = oneBuilt();
      // TS §3.3 step 3: redraw a shape where nothing could vary.
      if (built && built.record.some(canVary)) first = built;
    }
    if (!first) return;
    const plan = first.plan;
    const rec = first.record;
    const draw = (hooks: Hooks, p = plan) => {
      const ctx = newCtx();
      const built = renderPlan(ctx, p, hooks);
      return built && acceptable(built, block, era === "NF" || era === "IS") ? built : undefined;
    };
    const fill = (next: () => RouteName | undefined) => {
      for (let idle = 0; idle < 30 && names.length < count; ) idle = add(next()) ? 0 : idle + 1;
    };

    // §9: directions turn round the compass, the rest locked; returned in compass order.
    const counterAt = rec.findIndex((d) => DIRECTION_TOKENS.has(d.name));
    if (counterAt >= 0) {
      const name = rec[counterAt].name;
      const series = { counter: name, varies: null, anchor: null };
      const values = compassValues(newCtx(), name);
      const start = Math.max(0, values.indexOf(rec[counterAt].text));
      const found: { at: number; name: RouteName }[] = [];
      const locked = new Map(rec.map((d, i) => [i, d] as const));
      for (let step = 0; step < values.length && found.length < count; step++) {
        const at = (start + step) % values.length;
        locked.set(counterAt, { name, text: values[at] });
        const built = step === 0 ? first : draw({ byIndex: new Map(locked) });
        if (!built || seen.has(built.text.toLowerCase())) continue;
        seen.add(built.text.toLowerCase());
        found.push({ at, name: toName(built, series) });
      }
      names.push(...found.sort((a, b) => a.at - b.at).map((f) => f.name));
      return;
    }

    // §9: destinations change, the rest locked.
    const destAt = rec.findIndex((d) => d.name === "destination" && !isPlaceholder(d));
    if (destAt >= 0) {
      const series = { counter: null, varies: "destination", anchor: null };
      add(toName(first, series));
      const hold = new Map(rec.map((d, i) => [i, d] as const).filter(([i]) => i !== destAt));
      fill(() => {
        const b = draw({ byIndex: hold });
        return b && toName(b, series);
      });
      return;
    }

    // TS §3.3 step 4: an anchor (the first owner that isn't a placeholder, else the first of two or
    // more list tokens) holds while the rest vary; with one list token, it varies and the rest hold.
    let anchorAt = rec.findIndex((d) => kindOf(d.name) === "owner" && !isPlaceholder(d));
    const listAt = rec.map((d, i) => (kindOf(d.name) === "list" && !isPlaceholder(d) && d.name !== "fixed" ? i : -1)).filter((i) => i >= 0);
    if (anchorAt < 0 && listAt.length >= 2) anchorAt = listAt[0];
    const anchor = anchorAt >= 0 ? rec[anchorAt] : undefined;
    const series = { counter: null, varies: null, anchor: anchor?.name ?? null };
    add(toName(first, series));
    const hold = new Map<number, Drawn>();
    if (anchor) hold.set(anchorAt, anchor);
    else if (listAt.length === 1) rec.forEach((d, i) => i !== listAt[0] && hold.set(i, d));
    else if (plan.shape.p === "fixed") {
      // A fixed name: the network is the kind's other fixed names.
      fill(() => {
        const b = draw({});
        return b && toName(b, series);
      });
      return;
    }
    fill(() => {
      const b = draw({ byIndex: hold });
      return b && toName(b, series);
    });
    if (!anchor || names.length >= count) return;
    // TS §3.5: top up from the kind's other shapes with the anchor's token.
    const ctx = newCtx();
    const others = (plan.borrowed ? borrowedPlans(ctx) : kindPlans(ctx, plan.kind)).filter(
      ([p]) => p.shape.p !== plan.shape.p && [...p.shape.p.matchAll(/\{([^}:]+)/g)].some((m) => m[1] === anchor.name),
    );
    if (others.length === 0) return;
    fill(() => {
      const b = draw({ byName: anchor }, pickWeighted(others, rng)!);
      return b && toName(b, series);
    });
  }
}
