// The drawing machinery buildings and landmarks and monuments and statues share (monuments brief §1.3):
// the vocabulary pool filter, group-names and route-engine words, towns and founders, the pattern
// renderer and the batch loop. Moved out of buildings/engine.ts unchanged, so buildings draws the same
// names for the same seed. No Obsidian imports.

import buildingData from "../data/building-names.json";
import {
  type GroupPeople,
  type GroupSetting,
  type GroupTone,
  type GroupToneChoice,
  groupListWords,
  groupPlural,
  groupPossessive,
  groupSaint,
  groupStarIn,
  pickWeighted,
  toneFactor,
  wordTones,
} from "../groups/engine";
import type { InnSetting } from "../inns/engine";
import { DYNASTY_CULTURES } from "../realms/engine";
import { godNames, personNames, routeFigure, routePlace, type RouteCulture, type RouteEra } from "../routes/engine";
import { boostPool, contextSaint, TownTurn, type SettlementContext } from "../settlement/contextShared";
import { cultureAllowed, poolEntries, type VocabEntry, type Vocabulary } from "../settlement/vocab";
import { deityHooks } from "../deities/hook";
import { STREET_DATA } from "../streets/engine";

/** The lists both modules read (buildings brief §6, §8.3): discoveries, headlands, creature lists and god cultures. */
const SHARED_LISTS = buildingData.lists as { discovery: string[]; event: string[]; headland: string[]; creatureLists: string[]; godCultures: string[] };

/** What a draw needs, in either module. */
export interface BaseCtx {
  rng: () => number;
  culture: RouteCulture;
  era: RouteEra;
  setting: GroupSetting;
  settingKey: InnSetting;
  fantastic: boolean;
  mode: GroupPeople;
  tone: GroupToneChoice;
  vocab: Vocabulary;
  region?: string;
  themes: Record<string, number>;
  /** The series' town and founder. */
  town?: string;
  founder?: string;
  /** Settlement kit §4. */
  context?: SettlementContext;
  turn?: TownTurn;
  drawn: Set<GroupTone>;
  words: { pool: string; word: string }[];
  uses: string[];
}

export const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
export const LIGHT_OR_GRIM = (t: readonly string[] | undefined) => !!t && (t.includes("light") || t.includes("grim"));
export const CASTE = new Set(["indian", "west-african"]);
const SF_LISTS = new Set(["star", "greek"]);

/** A shared pool's entries here (region, setting themes, tone; never light or grim for the sensitive cultures). */
export function vocabPool(ctx: BaseCtx, pool: string): [VocabEntry, number][] {
  return boostPool(ctx.context, pool, poolEntries(ctx.vocab, pool, { culture: ctx.culture.key, era: ctx.era, fantastic: ctx.fantastic, region: ctx.region, themes: ctx.themes }))
    .filter(([e]) => !(ctx.culture.sensitive && LIGHT_OR_GRIM(e.t)))
    .map(([e, w]): [VocabEntry, number] => [e, w * toneFactor(e.t ?? [], ctx.tone)])
    .filter(([, w]) => w > 0);
}

export function fromPool(ctx: BaseCtx, pool: string, items: [VocabEntry, number][], use = false): string | undefined {
  const e = pickWeighted(items, ctx.rng);
  if (!e) return undefined;
  for (const t of e.t ?? []) ctx.drawn.add(t);
  ctx.words.push({ pool, word: e.w });
  if (use) ctx.uses.push(`q:${e.w}`);
  return e.w;
}

/** A group-names list word, tone-weighted (sci-fi lists in their space setting). */
export function gnWord(ctx: BaseCtx, list: string, use = false): string | undefined {
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
  if (use) ctx.uses.push(`q:${w}`);
  return w;
}

/** Buildings brief §8.3: `{creature}`: GN beasts, birds and heraldic beasts. */
export function creature(ctx: BaseCtx): string | undefined {
  const items = SHARED_LISTS.creatureLists.flatMap((l) =>
    groupListWords(l, ctx.setting)
      .filter(([w]) => !(ctx.culture.sensitive && LIGHT_OR_GRIM(wordTones(l, w))))
      .map(([w, n]): [string, number] => [w, n * toneFactor(wordTones(l, w), ctx.tone)]),
  );
  const w = pickWeighted(items, ctx.rng);
  if (w) {
    ctx.words.push({ pool: "creature", word: w });
    ctx.uses.push(`q:${w}`);
  }
  return w;
}

/** IT §6.2: `{owner}`: the culture's names or GN surnames. */
export const ownerNames = (ctx: BaseCtx) => [...personNames(ctx.culture.key), ...(STREET_DATA.surnameCultures.includes(ctx.culture.key) ? groupListWords("surname", ctx.setting).map(([w]) => w) : [])];

export function town(ctx: BaseCtx): string | undefined {
  // Settlement kit §4: this place, or one of its neighbours.
  const t = ctx.turn ? ctx.turn.next(ctx.rng) : ctx.town ?? (ctx.mode === "placeholders" ? "[place]" : routePlace(ctx.culture.key, ctx.setting, ctx.rng));
  if (t) ctx.uses.push(`town:${t}`);
  return t;
}

export function founder(ctx: BaseCtx): string | undefined {
  ctx.uses.push("founder");
  if (ctx.founder) return ctx.founder;
  if (ctx.mode === "placeholders") return "[founder]";
  const names = personNames(ctx.culture.key);
  return names.length > 0 ? pickOne(names, ctx.rng) : undefined;
}

// ── Rendering ───────────────────────────────────────────────────────────────

/** A module's token function and the patterns that name their own settlement (`self`). */
export interface Renderer<C extends BaseCtx> {
  token: (ctx: C, name: string) => string | undefined;
  self: Set<string>;
}

/** The tokens both modules read the same way; undefined tokens fall to the caller's own cases first. */
export function commonToken<C extends BaseCtx>(r: Renderer<C>, ctx: C, name: string): string | undefined {
  const rng = ctx.rng;
  const placeholders = ctx.mode === "placeholders";
  switch (name) {
    case "town":
      return town(ctx);
    case "founder":
      return founder(ctx);
    case "owner":
    case "patron": {
      if (placeholders) return `[${name}]`;
      const names = name === "owner" ? ownerNames(ctx) : personNames(ctx.culture.key);
      return names.length > 0 ? pickOne(names, rng) : undefined;
    }
    case "surname":
      return placeholders || !STREET_DATA.surnameCultures.includes(ctx.culture.key) ? "[surname]" : gnWord(ctx, "surname");
    case "dynasty":
      return placeholders || !DYNASTY_CULTURES.includes(ctx.culture.key) ? "[dynasty]" : gnWord(ctx, "house");
    case "holy": {
      const other = () => (placeholders ? "[holy person]" : groupSaint(ctx.setting, rng));
      return ctx.context ? contextSaint(ctx.context, other, rng) : other();
    }
    case "deity": {
      // Deities brief §10.1, §10.4: the settlement's deity, or an invented one; without its own "the".
      const t = ctx.context ? ctx.context.deity ?? undefined : deityHooks()?.deityTitle({ culture: ctx.culture.key, era: ctx.era, fantastic: ctx.fantastic, tone: ctx.tone, rng, vocab: ctx.vocab });
      if (t) ctx.words.push({ pool: "deity", word: t });
      return t?.replace(/^the /, "");
    }
    case "figure":
      return routeFigure(ctx.culture.key, ctx.setting, rng);
    case "god": {
      const gods = godNames(ctx.culture.key);
      return gods.length > 0 ? pickOne(gods, rng) : undefined;
    }
    case "creature":
      return creature(ctx);
    case "colour":
      return gnWord(ctx, name, true);
    case "number":
    case "quality":
    case "brandRoot":
    case "star":
    case "greek":
    case "ordinalWord":
      return gnWord(ctx, name);
    case "ordinal":
      return gnWord(ctx, "ordinalWord");
    case "trade":
      return fromPool(ctx, "streetTrades", vocabPool(ctx, "streetTrades"));
    case "goods":
      return fromPool(ctx, "streetGoods", vocabPool(ctx, "streetGoods"));
    case "weekday":
      return pickWeighted(STREET_DATA.lists.weekday, rng);
    case "discovery":
    case "headland":
      return pickOne(SHARED_LISTS[name], rng);
    case "n":
      return String(1 + Math.floor(rng() * 40));
  }
  const w = fromPool(ctx, name, vocabPool(ctx, name));
  return w?.includes("{") ? renderPattern(r, ctx, w) : w;
}

/** Renders a shape's pattern (possessives, plurals); undefined when a token has nothing to offer.
 * `values` collects each token's plain value, for the monuments' site names (§8). */
export function renderPattern<C extends BaseCtx>(r: Renderer<C>, ctx: C, pattern: string, values?: Record<string, string>): string | undefined {
  const outer = ctx.turn;
  if (ctx.context) ctx.turn = new TownTurn(ctx.context, r.self.has(pattern));
  try {
    return renderTokens(r, ctx, pattern, values);
  } finally {
    ctx.turn = outer;
  }
}

function renderTokens<C extends BaseCtx>(r: Renderer<C>, ctx: C, pattern: string, values?: Record<string, string>): string | undefined {
  let failed = false;
  const out = pattern.replace(/\{([^}]+)\}/g, (_m, raw: string) => {
    if (failed) return "";
    const [name, mod] = raw.split(":");
    const piece = r.token(ctx, name);
    if (!piece) {
      failed = true;
      return "";
    }
    if (values && !(name in values)) values[name] = piece;
    if (mod === "poss") return groupPossessive(piece, name === "trade");
    if (mod === "pl") return groupPlural(piece);
    return piece;
  });
  if (failed) return undefined;
  // §8.1: "the {buildingQual} {bw}" drops "the" before a possessive (King's Bridge).
  return out.replace(/^the (\S+'s )/, "$1");
}

// ── Shapes ──────────────────────────────────────────────────────────────────

export interface ShapeLike {
  p: string;
  w: number;
  e?: RouteEra[];
  c?: string[];
  t?: GroupTone[];
  h?: boolean;
}

/** The checks both modules make of a shape before their own: era, culture, fantastic, the sensitive and caste
 * rules, and the people the pattern needs. */
export function shapeAllowed(ctx: BaseCtx, s: ShapeLike): boolean {
  const c = ctx.culture;
  if (s.e && !s.e.includes(ctx.era)) return false;
  if (!cultureAllowed(s.c, c.key, ctx.era)) return false;
  if (s.h !== undefined && s.h !== ctx.fantastic) return false;
  if (c.sensitive && (s.h || LIGHT_OR_GRIM(s.t))) return false;
  if (CASTE.has(c.key) && s.p.includes("{trade")) return false;
  if (ctx.mode === "invented" && !ctx.founder && s.p.includes("{founder") && personNames(c.key).length === 0) return false;
  if (ctx.mode === "invented" && s.p.includes("{patron") && personNames(c.key).length === 0) return false;
  if (ctx.mode === "invented" && s.p.includes("{owner") && ownerNames(ctx).length === 0) return false;
  if (s.p.includes("{god") && (godNames(c.key).length === 0 || !SHARED_LISTS.godCultures.includes(c.key))) return false;
  if (/\{holy[}:]/.test(s.p) && !cultureAllowed(["christian"], c.key, ctx.era)) return false;
  return true;
}

// ── Batches ─────────────────────────────────────────────────────────────────

export interface BatchItem {
  text: string;
  uses: string[];
}

/** Buildings brief §7, §9: a batch of unique names. A series draws one of each kind before any repeats,
 * keeps `keyed` uses (qualifiers, honourees) from repeating and the founder to `founderUses`. */
export function fillBatch<K extends string, N extends BatchItem>(o: {
  rng: () => number;
  count: number;
  series: boolean;
  chosen?: K;
  weights: [K, number][];
  build: (kind: K) => N | undefined;
  founderUses: number;
  keyed: string[];
}): N[] {
  const { rng, count, weights, chosen } = o;
  const seen = new Set<string>();
  const names: N[] = [];
  const add = (n: N | undefined): boolean => {
    if (!n || seen.has(n.text.toLowerCase())) return false;
    seen.add(n.text.toLowerCase());
    names.push(n);
    return true;
  };
  const drawKind = (): K | undefined => (chosen ? (weights.some(([k]) => k === chosen) ? chosen : undefined) : pickWeighted(weights, rng));

  if (o.series) {
    const used = new Set<string>();
    let founders = 0;
    // §9: one of each kind offered before any repeats.
    let round: [K, number][] = [];
    const nextKind = (): K | undefined => {
      if (chosen) return drawKind();
      if (round.length === 0) round = [...weights];
      const k = pickWeighted(round, rng);
      return k;
    };
    for (let idle = 0; idle < 80 && names.length < count; ) {
      const k = nextKind();
      if (!k) break;
      const n = o.build(k);
      const fresh = !!n && !n.uses.some((u) => o.keyed.some((p) => u.startsWith(p)) && used.has(u)) && (!n.uses.includes("founder") || founders < o.founderUses);
      if (fresh && add(n)) {
        for (const u of n!.uses) used.add(u);
        if (n!.uses.includes("founder")) founders++;
        round = round.filter(([x]) => x !== k);
        idle = 0;
      } else idle++;
    }
  } else {
    for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
      const k = drawKind();
      if (!k) break;
      add(o.build(k));
    }
  }
  return names;
}
