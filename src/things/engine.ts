// Named things (docs/named-things-brief.md): the arms and armour, treasures and regalia, and books and
// writings of a world, in modern English. Words come from the shared settlement pools (with vocabulary
// packs); people, places, realms, folk, gods and saints from the groups, routes, bynames and deities
// engines. One seeded stream a batch. No Obsidian imports.

import { hasSpaceBlock } from "../space/safeguards";
import { biomeTitleCase } from "../biomes";
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
  pickWeighted,
  repeatsContent,
  toneFactor,
  wordTones,
} from "../groups/engine";
import { mulberry32 } from "../markov";
import { BYNAME_CULTURES, cultureAnimals, generateBynames, townSource, worldAnimals } from "../bynames/engine";
import { breaksDeityWords, deityTitle, hasRealDivineName, isChristianCulture } from "../deities/engine";
import { MONEY_DATA } from "../money/engine";
import { countedWords, routeCapitals, routeFigure, routeFolk, routeKingdom, routeNorm, routeSetting, ROUTE_ERAS, type RouteEra } from "../routes/engine";
import { BUILT_IN_VOCAB, entryAllowed, poolEntries, type VocabEntry, type Vocabulary } from "../settlement/vocab";
import thingsData from "../data/named-things.json";

// ── Data ────────────────────────────────────────────────────────────────────

export type ThingModule = "arms" | "treasure" | "book";
export type ThingOwner = "anyone" | "pack" | "none";

export interface ThingKindInfo {
  module: ThingModule;
  key: string;
  menu: string;
  plural: string;
  description: string;
  era: number[];
}

interface ShapePattern {
  p: string;
  k?: string[];
  e?: string;
  fam?: string;
  ch?: boolean;
}

interface ThingShape {
  m: ThingModule;
  fam: string;
  w: number;
  p: (string | ShapePattern)[];
  k: string[] | "*";
  e: string;
  t?: GroupTone[];
  c?: string[];
  cx?: Record<string, number>;
  others?: number;
  kx?: Record<string, number>;
  h?: boolean;
  ch?: boolean;
  nch?: boolean;
  fixed?: boolean;
}

interface ThingsData {
  modules: { key: ThingModule; section: string; label: string; any: string; ownerText: string; person: string; describeBy: string; icon: string }[];
  kinds: ThingKindInfo[];
  kindMult: { c?: string[]; ch?: boolean; e?: string; k: Record<string, number> }[];
  kindSet: { k: string; c?: string[]; e?: string; h?: boolean; w: number }[];
  families: string[];
  leanings: Record<string, Record<string, number>>;
  surnames: string[];
  nicknameOthers: number;
  shapes: ThingShape[];
  lists: Record<string, { w: string; x?: number; t?: GroupTone[]; c?: string[] }[]>;
  describe: Record<string, string>;
  describeKinds: string[];
  cap: number;
  safeguards: { block: string[]; flag: string[]; flagListBlocks: boolean; banned: string[]; bannedFromMoney: boolean; gunBrands: string[] };
}

export const THINGS_DATA = thingsData as unknown as ThingsData;
export const THING_MODULES = THINGS_DATA.modules;
export const THING_KINDS = THINGS_DATA.kinds;
export const THING_CULTURES = BYNAME_CULTURES;
export const findThingCulture = (key: string | undefined) => THING_CULTURES.find((c) => c.key === key);
export const findThingKind = (key: string | undefined) => THING_KINDS.find((k) => k.key === key);
export const thingModuleInfo = (module: ThingModule) => THINGS_DATA.modules.find((m) => m.key === module)!;
export const thingModuleOfSection = (section: string) => THINGS_DATA.modules.find((m) => m.section === section)?.key;

// ── Eras ────────────────────────────────────────────────────────────────────

const ERA_ORDER: RouteEra[] = ROUTE_ERAS.map((e) => e.code);
function eraSpan(spec: string | undefined): RouteEra[] {
  if (!spec || spec === "all") return ERA_ORDER;
  if (spec.includes(",")) return spec.split(",").flatMap(eraSpan);
  if (spec.endsWith("+")) return ERA_ORDER.slice(ERA_ORDER.indexOf(spec.slice(0, -1) as RouteEra));
  const [a, b] = spec.split("-");
  const from = ERA_ORDER.indexOf(a as RouteEra);
  return ERA_ORDER.slice(from, (b ? ERA_ORDER.indexOf(b as RouteEra) : from) + 1);
}
const inEras = (spec: string | undefined, era: RouteEra) => eraSpan(spec).includes(era);

// ── Kinds (§4) ──────────────────────────────────────────────────────────────

/** §4: a kind's final weight for a culture, era and the fantastic switch. */
export function thingKindWeight(kind: ThingKindInfo, culture: string, era: RouteEra, fantastic: boolean): number {
  let w = kind.era[ERA_ORDER.indexOf(era)] ?? 0;
  const christian = isChristianCulture(culture, era);
  for (const r of THINGS_DATA.kindMult) {
    if (r.c && !r.c.includes(culture)) continue;
    if (r.ch && !christian) continue;
    if (r.e && !inEras(r.e, era)) continue;
    w *= r.k[kind.key] ?? 1;
  }
  for (const r of THINGS_DATA.kindSet) {
    if (r.k !== kind.key) continue;
    if (r.c && !r.c.includes(culture)) continue;
    if (r.e && !inEras(r.e, era)) continue;
    if (r.h !== undefined && r.h !== fantastic) continue;
    w = Math.max(w, r.w);
  }
  return w;
}

/** §4: the kinds offered for a module, culture, era and fantastic switch (a final weight of 0 is not offered). */
export const thingKindsOffered = (module: ThingModule, culture: string, era: RouteEra, fantastic: boolean) =>
  THING_KINDS.filter((k) => k.module === module && thingKindWeight(k, culture, era, fantastic) > 0);

// ── Options and results ─────────────────────────────────────────────────────

export interface ThingsOptions {
  module: ThingModule;
  culture?: string;
  /** A kind key; undefined is Any. */
  kind?: string;
  era?: RouteEra;
  fantastic?: boolean;
  tone?: GroupToneChoice;
  people?: GroupPeople;
  owner?: ThingOwner;
  /** §2.3: draws a person from the owner pack, or null. */
  draw?: (rng: () => number) => string | null;
  packName?: string;
  describe?: boolean;
  count: number;
  seed?: number;
  safeguards?: GroupSafeguards;
  vocab?: Vocabulary;
  /** Tests: only this pattern. */
  shape?: string;
}

export interface ThingName {
  /** The finished line: the name, then its description when that is on. */
  text: string;
  /** The name alone. */
  name: string;
  kind: string;
  shape: string;
  family: string;
  tones: GroupTone[];
  words: { pool: string; word: string }[];
  description?: string;
}

export interface ThingsBatch {
  names: ThingName[];
  seed: number;
  notices: string[];
}

// ── Safeguards (§13) ────────────────────────────────────────────────────────

export const defaultThingSafeguards = (): GroupSafeguards => ({ block: THINGS_DATA.safeguards.block, flag: THINGS_DATA.safeguards.flag, flagListBlocks: THINGS_DATA.safeguards.flagListBlocks });

/** Whole names compare with case, spaces, hyphens and apostrophes ignored (Leg-Biter meets Legbiter), and a leading "the". */
const squash = (s: string) => routeNorm(s).replace(/^the /, "").replace(/[\s\-'’]/g, "");
const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const BANNED = [...THINGS_DATA.safeguards.banned, ...(THINGS_DATA.safeguards.bannedFromMoney ? MONEY_DATA.safeguards.banned : [])].map(wordRe);
const GUN_BRANDS = THINGS_DATA.safeguards.gunBrands.map(wordRe);

/** §13.3: banned words; the gun brands only in gun and great-gun names. */
export const breaksThingWords = (text: string, kind?: string) =>
  hasBannedWord(text) || BANNED.some((re) => re.test(text)) || ((kind === undefined || kind === "gun" || kind === "cannon") && GUN_BRANDS.some((re) => re.test(text)));

export function thingBlockSet(guards: GroupSafeguards = defaultThingSafeguards()): Set<string> {
  return new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(squash));
}

/** RN §3.3: a pack word the safeguards drop. */
export const thingWordBlocked = (word: string, guards?: GroupSafeguards) => thingBlockSet(guards).has(squash(word)) || breaksThingWords(word);

// ── Context ─────────────────────────────────────────────────────────────────

interface Plan {
  shape: ThingShape;
  p: string;
  k: string[];
  e: string;
  fam: string;
  ch: boolean;
  tones: GroupTone[];
  /** The row's weight shared among the patterns that serve each kind. */
  patternsFor: Record<string, number>;
}

interface Ctx {
  rng: () => number;
  module: ThingModule;
  culture: string;
  era: RouteEra;
  setting: GroupSetting;
  fantastic: boolean;
  mode: GroupPeople;
  tone: GroupToneChoice;
  vocab: Vocabulary;
  owner: ThingOwner;
  draw?: (rng: () => number) => string | null;
  notices: Set<string>;
  packName?: string;
  kind: string;
  christian: boolean;
  drawn: Set<GroupTone>;
  log: { pool: string; word: string }[];
  /** Per name: the values of shared tokens, the words drawn from each pool, the object word and whether a person token was used. */
  values: Map<string, string>;
  picked: Map<string, Set<string>>;
  object?: string;
  person: boolean;
  female: boolean;
}

const pickOne = <T>(items: readonly T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
const PERSON_TOKENS = ["hero", "ruler", "author", "smith"];

// ── Pools ───────────────────────────────────────────────────────────────────

const POOL_CACHE = new WeakMap<Vocabulary, Map<string, [VocabEntry, number][]>>();

/** A pool's words here, not merged by word (a word may serve several kinds), for the kind when the entries carry one. */
function poolWords(ctx: Ctx, pool: string, kind?: string): [VocabEntry, number][] {
  const key = `${pool}|${ctx.culture}|${ctx.era}|${ctx.fantastic}`;
  let cache = POOL_CACHE.get(ctx.vocab);
  if (!cache) {
    cache = new Map();
    POOL_CACHE.set(ctx.vocab, cache);
  }
  let all = cache.get(key);
  if (!all) {
    const source = ctx.vocab.pools[pool];
    const where = { culture: ctx.culture, era: ctx.era, fantastic: ctx.fantastic };
    all = [];
    for (const e of source?.entries ?? []) if (entryAllowed(e, where)) all.push([e, e.x ?? 1]);
    for (const e of source?.cultureExtra?.[ctx.culture] ?? []) if (entryAllowed(e, where)) all.push([e, (e.x ?? 1) * 3]);
    cache.set(key, all);
  }
  return kind ? all.filter(([e]) => !e.k || e.k.includes(kind)) : all.filter(([e]) => !e.k || e.k.length > 0);
}

/** Draws a word from a pool, tone-weighted; a pool word is not drawn twice in one name. */
function drawPool(ctx: Ctx, pool: string, opts: { kind?: string; keep?: (e: VocabEntry) => boolean } = {}): VocabEntry | undefined {
  const used = ctx.picked.get(pool);
  const items = poolWords(ctx, pool, opts.kind)
    .filter(([e]) => (!opts.keep || opts.keep(e)) && !used?.has(e.w))
    .map(([e, w]): [VocabEntry, number] => [e, w * toneFactor(e.t ?? [], ctx.tone)])
    .filter(([, w]) => w > 0);
  const e = pickWeighted(items, ctx.rng);
  if (!e) return undefined;
  for (const t of e.t ?? []) ctx.drawn.add(t);
  ctx.log.push({ pool, word: e.w });
  if (!used) ctx.picked.set(pool, new Set([e.w]));
  else used.add(e.w);
  return e;
}

/** An inline list of the data (water, fieldWord…): weights, tones and culture groups. */
function drawList(ctx: Ctx, name: string, extra: { w: string; x?: number; t?: GroupTone[]; c?: string[] }[] = []): string | undefined {
  const used = ctx.picked.get(name);
  const items = [...(THINGS_DATA.lists[name] ?? []), ...extra]
    .filter((e) => (!e.c || e.c.some((c) => c === ctx.culture || (c === "christian" && ctx.christian))) && !used?.has(e.w))
    .map((e): [{ w: string; t?: GroupTone[] }, number] => [e, (e.x ?? 1) * toneFactor(e.t ?? [], ctx.tone)])
    .filter(([, w]) => w > 0);
  const e = pickWeighted(items, ctx.rng);
  if (!e) return undefined;
  for (const t of e.t ?? []) ctx.drawn.add(t);
  ctx.log.push({ pool: name, word: e.w });
  if (!used) ctx.picked.set(name, new Set([e.w]));
  else used.add(e.w);
  return e.w;
}

function gnWord(ctx: Ctx, list: string, setting: GroupSetting = ctx.setting): string | undefined {
  const used = ctx.picked.get(list);
  const items = groupListWords(list, setting)
    .map(([w, n]): [string, number] => [w, n * toneFactor(wordTones(list, w), ctx.tone)])
    .filter(([w, n]) => n > 0 && !used?.has(w));
  const w = pickWeighted(items, ctx.rng);
  if (w === undefined) return undefined;
  for (const t of wordTones(list, w)) ctx.drawn.add(t);
  ctx.log.push({ pool: list, word: w });
  if (!used) ctx.picked.set(list, new Set([w]));
  else used.add(w);
  return w;
}

// ── People, places and the like ─────────────────────────────────────────────

const GENRE_OF: Record<GroupSetting, ["fantasy" | "modern" | "scifi", boolean]> = { FL: ["fantasy", false], FH: ["fantasy", true], MR: ["modern", false], MF: ["modern", true], SF: ["scifi", false] };
const HOUSES = new Map<string, string[]>();

/** §3.2: `{house}`: one BT family name for the culture and setting, from a pool made once with a fixed seed. */
function housePool(ctx: Ctx): string[] {
  const key = `${ctx.culture}|${ctx.setting}`;
  let pool = HOUSES.get(key);
  if (!pool) {
    const [genre, fantastic] = GENRE_OF[ctx.setting];
    const batch = generateBynames({ module: "familyNames", culture: ctx.culture, genre, fantastic, language: "english", source: "placeholder", count: 80, seed: 1789 });
    pool = [...new Set(batch.names.map((n) => n.text.replace(/^the /i, "")).filter((t) => t && !t.includes("[")))];
    HOUSES.set(key, pool);
  }
  return pool;
}

/** §3.2: `{beast}`: the culture's animals ×3, then the world culture's ×1. */
function beastItems(ctx: Ctx): [string, number][] {
  const merged = new Map<string, number>();
  for (const w of cultureAnimals(ctx.culture)) if (!w.includes("{")) merged.set(biomeTitleCase(w), (merged.get(biomeTitleCase(w)) ?? 0) + 3);
  for (const w of worldAnimals(ctx.culture)) if (!w.includes("{")) merged.set(biomeTitleCase(w), (merged.get(biomeTitleCase(w)) ?? 0) + 1);
  return [...merged.entries()];
}

const PLACEHOLDER: Record<string, string> = { hero: "[hero]", ruler: "[ruler]", author: "[author]", smith: "[smith]" };

/** §2.3: a person token, by the owner link; the same person each time a name mentions it. */
function personToken(ctx: Ctx, role: string): string | undefined {
  if (ctx.owner === "none") return undefined;
  const have = ctx.values.get(`person:${role}`);
  if (have !== undefined) return have;
  let name: string | undefined;
  if (ctx.owner === "pack") {
    name = ctx.draw?.(ctx.rng) ?? undefined;
    if (!name) {
      ctx.notices.add(ctx.packName ? `The pack “${ctx.packName}” gave no names; placeholders used.` : "The owner pack gave no names; placeholders used.");
      name = PLACEHOLDER[role];
    }
  } else if (ctx.mode === "placeholders") name = PLACEHOLDER[role];
  else name = groupPerson(ctx.setting, THINGS_DATA.surnames.includes(ctx.culture), ctx.rng, cultureAnimals(ctx.culture).filter((w) => !w.includes("{"))) ?? PLACEHOLDER[role];
  ctx.values.set(`person:${role}`, name);
  ctx.person = true;
  return name;
}

function shared(ctx: Ctx, key: string, make: () => string | undefined): string | undefined {
  const have = ctx.values.get(key);
  if (have !== undefined) return have;
  const made = make();
  if (made !== undefined) ctx.values.set(key, made);
  return made;
}

const fantasticTargets = (ctx: Ctx) => poolWords(ctx, "deedTarget", ctx.kind).filter(([e]) => e.h === true);

function token(ctx: Ctx, name: string, mod?: string): string | undefined {
  const placeholders = ctx.mode === "placeholders";
  switch (name) {
    case "hero":
    case "ruler":
    case "author":
    case "smith": {
      const p = personToken(ctx, name);
      return p && mod === "poss" ? groupPossessive(p, false) : p;
    }
    case "house":
      return shared(ctx, "house", () => (placeholders ? "[house]" : pickOne(housePool(ctx), ctx.rng)));
    case "holy": {
      const h = shared(ctx, "holy", () => (placeholders ? "[holy person]" : groupSaint(ctx.setting, ctx.rng)));
      return h === undefined ? undefined : withPoss(h, mod);
    }
    case "god": {
      const g = shared(ctx, "god", () => {
        if (placeholders) return "[god]";
        for (let i = 0; i < 6; i++) {
          const t = deityTitle({ culture: ctx.culture, era: ctx.era, fantastic: ctx.fantastic, tone: ctx.tone, rng: ctx.rng });
          if (t) return t;
        }
        return undefined;
      });
      if (g === undefined) return undefined;
      return mod === "poss" ? groupPossessive(g.replace(/^the /i, ""), /^the .+s$/i.test(g)) : g;
    }
    case "town":
      return shared(ctx, "town", () => (placeholders ? "[place]" : groupTown(ctx.setting, ctx.setting === "SF" ? undefined : townSource(ctx.culture), ctx.rng).replace(/^The /, "")));
    case "realm":
      return shared(ctx, "realm", () => (placeholders ? "[realm]" : routeKingdom(ctx.culture, ctx.era, ctx.rng)));
    case "folk":
      return shared(ctx, "folk", () => (placeholders ? "[folk]" : routeFolk(ctx.culture, ctx.rng)));
    case "dynasty":
      return "[dynasty]";
    case "figure": {
      const f = shared(ctx, "figure", () => routeFigure(ctx.culture, ctx.setting, ctx.rng));
      return f && mod === "poss" ? groupPossessive(f, false) : f;
    }
    case "beast": {
      const w = shared(ctx, "beast", () => pickWeighted(beastItems(ctx), ctx.rng));
      if (w === undefined) return undefined;
      return mod === "poss" ? groupPossessive(w, false) : w;
    }
    case "colour":
      return shared(ctx, "colour", () => gnWord(ctx, "colour"));
    case "number":
    case "numberWord":
      return gnWord(ctx, "number");
    case "compass":
      return gnWord(ctx, "compass");
    case "star":
      return shared(ctx, "star", () => groupStarIn("any", ctx.mode, ctx.rng));
    case "spaceLand":
      return ctx.setting === "SF" ? gnWord(ctx, "spaceLand", "SF") : undefined;
    case "metal": {
      const items = poolEntries(ctx.vocab, "coinMetal", { culture: ctx.culture, era: ctx.era, fantastic: ctx.fantastic }).map(([e, w]): [string, number] => [e.w, w]);
      return pickWeighted(items, ctx.rng);
    }
    case "object": {
      const e = drawPool(ctx, "thingObject", { kind: ctx.kind });
      if (!e) return undefined;
      ctx.object ??= e.w;
      return e.w;
    }
    case "thingGiven": {
      const g = mod === "f" ? "f" : mod === "m" ? "m" : undefined;
      return drawPool(ctx, "thingGiven", { keep: (e) => !g || e.g === g })?.w;
    }
    case "thingTemper":
      return drawPool(ctx, "thingTemper", { keep: (e) => !(ctx.female && e.g === "m") })?.w;
    case "fanTarget": {
      const items = fantasticTargets(ctx).map(([e, w]): [string, number] => [e.w, w]);
      return ctx.fantastic ? pickWeighted(items, ctx.rng) : undefined;
    }
    case "baneTarget": {
      const own = drawList(ctx, "baneTarget");
      const fan = ctx.fantastic ? fantasticTargets(ctx).map(([e]) => e.w) : [];
      return fan.length > 0 && ctx.rng() < fan.length / (fan.length + 3) ? pickOne(fan, ctx.rng) : own;
    }
    case "deedTarget":
    case "deedVerb":
    case "thingAgent":
    case "kenningSecond":
    case "thingBodyPart":
      return drawPool(ctx, name, { kind: ctx.kind, keep: name === "deedTarget" ? (e) => e.h === undefined || ctx.fantastic : undefined })?.w;
    default:
      if (THINGS_DATA.lists[name]) return drawList(ctx, name);
      // The remaining naming pools have no kind.
      if (ctx.vocab.pools[name]) return drawPool(ctx, name)?.w;
  }
  return undefined;
}

const withPoss = (text: string, mod?: string) => (mod === "poss" ? groupPossessive(text, false) : text);

/** A pattern rendered; undefined when a token has nothing to offer. */
function renderPattern(ctx: Ctx, pattern: string): string | undefined {
  let failed = false;
  const out = pattern.replace(/(of )?\{([^}]+)\}/g, (_m, of: string | undefined, raw: string) => {
    if (failed) return "";
    const [name, mod] = raw.split(":");
    const piece = token(ctx, name, mod);
    if (piece === undefined || piece === "") {
      failed = true;
      return "";
    }
    // "Cup of {figure}" reads "Cup of the Earl".
    return `${of ?? ""}${of && name === "figure" && !mod ? "the " : ""}${piece}`;
  });
  return failed ? undefined : out;
}

// ── Shapes ──────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [];
for (const shape of THINGS_DATA.shapes) {
  const kindsOfModule = THINGS_DATA.kinds.filter((k) => k.module === shape.m).map((k) => k.key);
  const patterns = shape.p.map((raw) => (typeof raw === "string" ? { p: raw } : raw));
  const kindsOf = (pat: ShapePattern) => pat.k ?? (shape.k === "*" ? kindsOfModule : shape.k);
  for (const pat of patterns) {
    const k = kindsOf(pat);
    const patternsFor: Record<string, number> = {};
    for (const kind of k) patternsFor[kind] = patterns.filter((q) => kindsOf(q).includes(kind)).length;
    PLANS.push({ shape, p: pat.p, k, e: pat.e ?? shape.e, fam: pat.fam ?? shape.fam, ch: pat.ch ?? shape.ch ?? false, tones: shape.t ?? [], patternsFor });
  }
}
export const thingPatterns = () => PLANS.map((p) => p.p);

const TOKEN_RE = /\{([^}:]+)(?::[^}]*)?\}/g;

function viable(ctx: Ctx, plan: Plan): boolean {
  const p = plan.p;
  for (const m of p.matchAll(TOKEN_RE)) {
    const name = m[1];
    if (PERSON_TOKENS.includes(name) && ctx.owner === "none") return false;
    switch (name) {
      case "beast":
        if (beastItems(ctx).length === 0) return false;
        break;
      case "object":
        if (poolWords(ctx, "thingObject", ctx.kind).length === 0) return false;
        break;
      case "house":
        if (ctx.mode === "invented" && housePool(ctx).length === 0) return false;
        break;
      case "holy":
        if (!ctx.christian) return false;
        break;
      case "fanTarget":
        if (!ctx.fantastic) return false;
        break;
      case "spaceLand":
        if (ctx.setting !== "SF") return false;
        break;
    }
  }
  // {hero}iad: a one-word hero only, never a placeholder.
  if (p === "{hero}iad" && ctx.mode === "placeholders" && ctx.owner !== "pack") return false;
  return true;
}

/** §7, §8: a plan's weight for a kind: the row's weight shared among its patterns, × the kind's multiplier, the culture leaning and notes, the tone. */
function planWeight(ctx: Ctx, plan: Plan): number {
  const s = plan.shape;
  if (s.m !== ctx.module || !plan.k.includes(ctx.kind)) return 0;
  if (!inEras(plan.e, ctx.era)) return 0;
  if (s.h !== undefined && s.h !== ctx.fantastic) return 0;
  if (plan.ch && !ctx.christian) return 0;
  if (s.nch && ctx.christian) return 0;
  let mult = 1;
  if (s.c) {
    if (s.c.includes(ctx.culture)) mult *= s.cx?.[ctx.culture] ?? 1;
    else if (s.others !== undefined) mult *= s.others;
    else return 0;
  }
  mult *= s.kx?.[ctx.kind] ?? 1;
  mult *= THINGS_DATA.leanings[ctx.culture]?.[plan.fam] ?? 1;
  if (plan.fam === "nickname" && !["general", "norman-british", "anglo-saxon"].includes(ctx.culture)) mult *= THINGS_DATA.nicknameOthers;
  if (!viable(ctx, plan)) return 0;
  return (s.w / (plan.patternsFor[ctx.kind] || 1)) * mult * toneFactor(plan.tones, ctx.tone);
}

function plansFor(ctx: Ctx, only?: string): [Plan, number][] {
  return PLANS.filter((p) => !only || p.p === only)
    .map((p): [Plan, number] => [p, planWeight(ctx, p)])
    .filter(([, w]) => w > 0);
}

// ── Rendering (§11) ─────────────────────────────────────────────────────────

/** Capitals and OUP possessives; a leading "the" lower case. */
export const thingCapitals = (text: string) => routeCapitals(text).replace(/^The /, "the ");

/** §11: `{hero}iad`: the hero's name plus iad, a final vowel dropped, -ow turned to -ov. */
function iad(hero: string): string | undefined {
  if (/[\s[]/.test(hero)) return undefined;
  const stem = /ow$/i.test(hero) ? hero.replace(/ow$/i, "ov") : hero.replace(/[aeiouy]$/i, "");
  return `${stem}iad`;
}

// ── Acceptance ──────────────────────────────────────────────────────────────

interface Rules {
  block: Set<string>;
}
let RULES: Rules = { block: thingBlockSet() };

function acceptable(ctx: Ctx, name: string): boolean {
  const counted = countedWords(name);
  if (counted.length === 0 || counted.length > THINGS_DATA.cap) return false;
  if (repeatsContent(counted)) return false;
  if (RULES.block.has(squash(name))) return false;
  if (breaksThingWords(name, ctx.kind)) return false;
  if (breaksDeityWords(name) || hasRealDivineName(name)) return false;
  if ((ctx.era === "NF" || ctx.era === "IS") && hasSpaceBlock(name)) return false;
  return true;
}

// ── Description (§10) ───────────────────────────────────────────────────────

const an = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");

function describe(ctx: Ctx, name: string): string {
  const info = thingModuleInfo(ctx.module);
  let object = ctx.object ? ctx.object.toLowerCase() : THINGS_DATA.describe[ctx.kind];
  if (object && new RegExp(`(^|[^\\p{L}])${object.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?($|[^\\p{L}])`, "iu").test(name)) object = "";
  let owner: string | undefined;
  const wants = ctx.module !== "book" || THINGS_DATA.describeKinds.includes(ctx.kind);
  if (wants && ctx.owner !== "none" && !ctx.person) owner = personToken({ ...ctx, values: new Map() }, info.person);
  if (ctx.module === "book") {
    if (object && owner) return `${name}, ${an(object)} ${object} by ${owner}`;
    if (object) return `${name}, ${an(object)} ${object}`;
    if (owner) return `${name}, by ${owner}`;
    return name;
  }
  if (object && owner) return `${name}, ${object} of ${owner}`;
  if (object) return `${name}, ${an(object)} ${object}`;
  if (owner) return `${name}, ${info.describeBy} ${owner}`;
  return name;
}

// ── Batches ─────────────────────────────────────────────────────────────────

export function generateThingNames(options: ThingsOptions): ThingsBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const module = options.module;
  const culture = findThingCulture(options.culture)?.key ?? "norman-british";
  const era: RouteEra = ERA_ORDER.includes(options.era as RouteEra) ? options.era! : "MD";
  const fantastic = !!options.fantastic;
  const count = Math.max(0, Math.floor(options.count));
  const offered = thingKindsOffered(module, culture, era, fantastic);
  const chosen = options.kind && offered.some((k) => k.key === options.kind) ? options.kind : undefined;
  RULES = { block: thingBlockSet(options.safeguards) };
  const notices = new Set<string>();
  const base: Ctx = {
    rng,
    module,
    culture,
    era,
    setting: routeSetting(era, fantastic),
    fantastic,
    mode: options.people ?? "placeholders",
    tone: options.tone ?? "any",
    vocab: options.vocab ?? BUILT_IN_VOCAB,
    owner: options.owner ?? "anyone",
    draw: options.draw,
    notices,
    packName: options.packName,
    kind: chosen ?? offered[0]?.key ?? "",
    christian: isChristianCulture(culture, era),
    drawn: new Set(),
    log: [],
    values: new Map(),
    picked: new Map(),
    person: false,
    female: false,
  };
  const kindWeights = offered.map((k): [string, number] => [k.key, thingKindWeight(k, culture, era, fantastic)]);

  const build = (kind: string): ThingName | undefined => {
    for (let i = 0; i < 40; i++) {
      const ctx: Ctx = { ...base, kind, drawn: new Set(), log: [], values: new Map(), picked: new Map(), object: undefined, person: false, female: false };
      const plan = pickWeighted(plansFor(ctx, options.shape), rng);
      if (!plan) return undefined;
      ctx.female = plan.p.includes(":f}");
      let raw = renderPattern(ctx, plan.p);
      if (!raw) continue;
      if (plan.p === "{hero}iad") {
        const hero = ctx.values.get("person:hero");
        const made = hero ? iad(hero) : undefined;
        if (!made) continue;
        raw = made;
      }
      const name = thingCapitals(raw);
      if (!acceptable(ctx, name)) continue;
      const tones = new Set<GroupTone>([...plan.tones, ...ctx.drawn]);
      const description = options.describe ? describe(ctx, name) : undefined;
      return { text: description ?? name, name, kind, shape: plan.p, family: plan.fam, tones: GROUP_TONES.filter((t) => tones.has(t)), words: ctx.log, ...(description && description !== name ? { description: description.slice(name.length + 2) } : {}) };
    }
    return undefined;
  };

  const names: ThingName[] = [];
  const seen = new Set<string>();
  for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
    const kind = chosen ?? pickWeighted(kindWeights, rng);
    if (!kind) break;
    const n = build(kind);
    if (!n || seen.has(n.name.toLowerCase())) continue;
    seen.add(n.name.toLowerCase());
    names.push(n);
  }
  const out = [...notices];
  if (names.length < count) {
    const info = findThingKind(chosen);
    out.push(names.length === 0 && info ? `There are no ${info.plural} names for this culture and era yet: a vocabulary pack can add some.` : `Only ${names.length} names could be generated.`);
  }
  return { names, seed, notices: out };
}
