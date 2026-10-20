// Money and coins (docs/money-and-coins-brief.md): the money of a world in every culture and era –
// coins, early and shaped money, goods money, paper and credit, scrip and tokens, currencies and
// nicknames – in modern English. Words come from the shared settlement pools (settlement/vocab.ts, with
// vocabulary packs); places, realms and figures from the route engine, saints and companies from group
// names, animals from bynames. No Obsidian imports.

import { hasSpaceBlock } from "../space/safeguards";
import moneyData from "../data/money-names.json";
import { cultureAnimals } from "../bynames/engine";
import {
  type GroupGenre,
  type GroupPeople,
  type GroupSafeguards,
  type GroupSetting,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  findFamily,
  generateGroupNames,
  groupListWords,
  groupPossessive,
  groupSaint,
  groupStarIn,
  groupTown,
  hasBannedWord,
  pickWeighted,
  repeatsContent,
  toneFactor,
  wordTones,
  typesInSetting,
} from "../groups/engine";
import { mulberry32 } from "../markov";
import { pluralOf } from "../biomes";
import { REALM_DATA } from "../realms/engine";
import {
  countedWords,
  ROUTE_CULTURES,
  ROUTE_ERAS,
  routeCapitals,
  routeFigure,
  routeKingdom,
  routeNorm,
  routePlace,
  routeSetting,
  type RouteCulture,
  type RouteEra,
} from "../routes/engine";
import { BUILT_IN_VOCAB, cultureAllowed, poolEntries, VALUE_TIERS, type ValueTier, type VocabEntry, type Vocabulary } from "../settlement/vocab";
import { findVesselCulture } from "../vessels/engine";

// ── Data ────────────────────────────────────────────────────────────────────

export type MoneyKind = "coin" | "early" | "goods" | "paper" | "scrip" | "currency" | "nickname";
export type MoneyValue = "any" | "high" | "middle" | "low";
export type MoneyWords = "translated" | "loanwords";
export type MoneySeries = "separate" | "coinage" | "values";

export interface MoneyShape {
  p: string;
  w: number;
  kind: MoneyKind;
  e?: RouteEra[];
  c?: string[];
  t?: GroupTone[];
  h?: boolean;
  /** The fixed row this shape draws (the pool entries with this `fx`); a `{fixed}` shape without it draws the culture's own names. */
  fx?: string;
  /** A pool token limited to these words; with `rest`, words a vocabulary pack added join too. */
  only?: Record<string, string[]>;
  rest?: boolean;
  /** A fixed tier: the shape names its metal (`Iron {coinWord}`, `{figure:poss} Gold`). */
  tier?: ValueTier;
}

interface MoneyKindInfo {
  key: MoneyKind;
  menu: string;
  plural: string;
  description: string;
  series: boolean;
  era: Record<RouteEra, number>;
}

export interface LadderStep {
  n: string;
  loan?: string;
  tier: ValueTier;
  metal?: "Gold" | "Silver" | "low";
  v: number;
  pl?: string;
}

export interface MoneyLadder {
  key: string;
  source: string;
  serves: ("any" | "coin" | "early" | "goods")[];
  decimal?: boolean;
  steps: LadderStep[];
}

interface MoneyCultureData {
  key: string;
  label: string;
  group: string;
  town: string;
  figure: string[];
  after: string;
  moneyOnly: true;
}

interface MoneyData {
  any: string;
  cultures: MoneyCultureData[];
  notOffered: string[];
  kinds: MoneyKindInfo[];
  values: { key: MoneyValue; text: string }[];
  words: { key: MoneyWords; text: string }[];
  cultureMult: Record<string, Partial<Record<MoneyKind, number | Partial<Record<RouteEra, number>>>>>;
  paperMiddleAges: string[];
  shapes: MoneyShape[];
  lists: {
    numberWord: string[];
    colourShort: string[];
    gearWord: string[];
    cryptoRoot: string[];
    sfMetal: string[];
    cloth: { w: string; c?: string[] }[];
    grain: { w: string; c?: string[] }[];
    goodsAnimal: { w: string; c?: string[] }[];
    animalEmblems: string[];
    holyEmblems: string[];
    metalPlurals: Record<string, string>;
    sacredAnimals: Record<string, string[]>;
  };
  companyTypes: { key: string; w: number }[];
  companyDrop: string[];
  nicknameTone: { grand: number; other: number };
  loanShare: number;
  series: {
    steps: [number, number][];
    tiers: Record<string, ValueTier[]>;
    themes: { key: string; w: number }[];
    realShare: number;
    realShareValues: number;
    currencyFrom: number;
  };
  ladders: MoneyLadder[];
  ladderCells: Record<string, Record<RouteEra, string[]>>;
  cap: number;
  safeguards: { block: string[]; flag: string[]; flagListBlocks: boolean; banned: string[]; neverGoods: string[] };
}

export const MONEY_DATA = moneyData as unknown as MoneyData;
export const MONEY_KINDS = MONEY_DATA.kinds;
export const MONEY_ANY = MONEY_DATA.any;
export const MONEY_VALUES = MONEY_DATA.values;
export const MONEY_WORDS = MONEY_DATA.words;
export const MONEY_LADDERS = MONEY_DATA.ladders;

/** §3.1: a culture of the money menu: route names' cultures bar Polynesian and Andean, with the four money-only ones. */
export interface MoneyCulture {
  key: string;
  label: string;
  group: string;
  moneyOnly?: boolean;
  town?: string;
  figure?: string[];
}

function buildCultures(): MoneyCulture[] {
  const out: MoneyCulture[] = [];
  const add = (c: RouteCulture | MoneyCultureData) => out.push({ key: c.key, label: c.label, group: c.group, ...("moneyOnly" in c ? { moneyOnly: true, town: c.town, figure: c.figure } : {}) });
  for (const c of ROUTE_CULTURES) {
    if (MONEY_DATA.notOffered.includes(c.key)) continue;
    add(c);
    for (const m of MONEY_DATA.cultures) if (m.after === c.key) add(m);
  }
  return out;
}

export const MONEY_CULTURES: MoneyCulture[] = buildCultures();
export const findMoneyCulture = (key: string | undefined) => MONEY_CULTURES.find((c) => c.key === key);
const DEFAULT_CULTURE = "norman-british";

const ALL_SHAPES = MONEY_DATA.shapes;

export const defaultMoneySafeguards = (): GroupSafeguards => ({ block: MONEY_DATA.safeguards.block, flag: MONEY_DATA.safeguards.flag, flagListBlocks: MONEY_DATA.safeguards.flagListBlocks });

// ── Kinds (§4) ──────────────────────────────────────────────────────────────

export const findMoneyKind = (key: string | undefined) => MONEY_KINDS.find((k) => k.key === key);

/** §4.2–§4.3: a kind's weight for kind Any: the era weight × the culture's multiplier (paper in the Middle Ages only where it was used). */
export function moneyKindWeight(kind: MoneyKind, culture: string, era: RouteEra): number {
  const info = findMoneyKind(kind)!;
  let w = info.era[era];
  if (kind === "paper" && era === "MD" && !MONEY_DATA.paperMiddleAges.includes(culture)) return 0;
  const mult = MONEY_DATA.cultureMult[culture]?.[kind];
  if (typeof mult === "number") w *= mult;
  else if (mult) w *= mult[era] ?? 1;
  return w;
}

/** §4.3: the kinds offered in the menu for a culture and era (a final weight of 0 is not offered). */
export const moneyKindsOffered = (culture: string, era: RouteEra) => MONEY_KINDS.filter((k) => moneyKindWeight(k.key, culture, era) > 0);

/** §8.7: nicknames are light; a grand tone draws them at ×0.2 and any other set tone at ×0.5. */
const nicknameToneFactor = (tone: GroupToneChoice) =>
  tone === "any" ? 1 : tone === "light" ? toneFactor(["light"], tone) : tone === "grand" ? MONEY_DATA.nicknameTone.grand : MONEY_DATA.nicknameTone.other;

// ── Loans (§2.2) ────────────────────────────────────────────────────────────

const LOAN_CULTURES = new Map<Vocabulary, Set<string>>();

/** §2.2: whether the culture has at least one loan form (so the words link shows). */
export function moneyHasLoans(culture: string, vocab: Vocabulary = BUILT_IN_VOCAB): boolean {
  let set = LOAN_CULTURES.get(vocab);
  if (!set) {
    set = new Set();
    for (const [name, pool] of Object.entries(vocab.pools)) {
      if (!name.startsWith("moneyFixed:")) continue;
      for (const e of pool.entries) if (e.loan) for (const c of e.c ?? []) if (!c.startsWith("!")) set.add(c);
    }
    LOAN_CULTURES.set(vocab, set);
  }
  return set.has(culture);
}

// ── Tiers (§6.1) ────────────────────────────────────────────────────────────

const tierIndex = (t: ValueTier) => VALUE_TIERS.indexOf(t);
const shiftTier = (t: ValueTier, shift: number): ValueTier => VALUE_TIERS[Math.max(0, Math.min(2, tierIndex(t) + shift))];
export const VALUE_TIER: Record<Exclude<MoneyValue, "any">, ValueTier> = { high: "h", middle: "m", low: "l" };

/** §6.1: the tiers of an entry (untagged: all three) that land on `want` once a fraction moves them by `shift`. */
export function tiersReaching(tiers: readonly ValueTier[] | undefined, shift: number, want: ValueTier): ValueTier[] {
  return (tiers && tiers.length > 0 ? [...tiers] : [...VALUE_TIERS]).filter((t) => shiftTier(t, shift) === want);
}

// ── Options and results ─────────────────────────────────────────────────────

export interface MoneyOptions {
  culture?: string;
  kind?: MoneyKind;
  era?: RouteEra;
  fantastic?: boolean;
  value?: MoneyValue;
  words?: MoneyWords;
  tone?: GroupToneChoice;
  people?: GroupPeople;
  series?: MoneySeries;
  count: number;
  seed?: number;
  safeguards?: GroupSafeguards;
  vocab?: Vocabulary;
  /** Tests: only this shape. */
  shape?: string;
  /** Tests: the share of a coinage's steps that take their real name (§9, §10.4). */
  realShare?: number;
  /** Tests: the ladder a valued coinage uses. */
  ladder?: string;
}

export interface MoneyName {
  /** The finished line: the name, then its value in brackets in a valued coinage. */
  text: string;
  /** The name alone. */
  name: string;
  kind: MoneyKind;
  shape: string;
  tones: GroupTone[];
  words: { pool: string; word: string }[];
  tier?: ValueTier;
  /** The loan form printed instead of the translated name. */
  loan?: boolean;
  /** §10.5: the step's value in the step below, in a valued coinage. */
  value?: string;
  /** §10: the step's place in a valued coinage's ladder (0 is the highest). */
  step?: number;
  /** §10: a step that took its real name, and its plural where the ladder gives one. */
  real?: boolean;
  pl?: string;
}

export interface MoneyBatch {
  names: MoneyName[];
  seed: number;
  /** The shortfall notice, and a valued coinage's source line (§10.5): neither is a name. */
  notices: string[];
  /** The ladder a valued coinage used. */
  ladder?: string;
  /** The theme a coinage drew (§9). */
  theme?: string;
}

// ── Drawing ─────────────────────────────────────────────────────────────────

interface Ctx {
  rng: () => number;
  culture: MoneyCulture;
  era: RouteEra;
  setting: GroupSetting;
  fantastic: boolean;
  mode: GroupPeople;
  tone: GroupToneChoice;
  vocab: Vocabulary;
  words: MoneyWords;
  kind: MoneyKind;
  shape?: MoneyShape;
  /** §6.1: the tier asked for. */
  want?: ValueTier;
  /** §10.4: a valued coinage's metal for this step ("Gold", "Silver", or "low" for any low metal). */
  exactMetal?: string;
  /** §6.1: the fraction's move along the tiers. */
  shift: number;
  /** The tier the name landed on, when its words say. */
  tier?: ValueTier;
  drawn: Set<GroupTone>;
  log: { pool: string; word: string }[];
  /** The emblems of the name, and of the coins drawn so far in the batch (for nicknames). */
  emblems: string[];
  batchEmblems: string[];
  loan?: boolean;
  /** §9: the coinage's one place, its words already used, and its emblem and god limits. */
  town?: string;
  used?: Set<string>;
  emblemFilter?: (w: string) => boolean;
  coinWordFilter?: (w: string) => boolean;
  /** §9: a fraction in a coinage lowers the coin above it (Half-Crown below Crown). */
  lowerOnly?: boolean;
}

const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
const GENRE_OF: Record<GroupSetting, [GroupGenre, boolean]> = { FL: ["fantasy", false], FH: ["fantasy", true], MR: ["modern", false], MF: ["modern", true], SF: ["scifi", false] };
const CASTE = new Set(["indian", "west-african"]);
const DUTCH_AMERICAN = new Set(["dutch", "american"]);
const HYPHEN_FRACTIONS = new Set(["Half", "Quarter"]);

// Pools are filtered by culture, era and fantastic once per vocabulary.
const POOL_CACHE = new WeakMap<Vocabulary, Map<string, [VocabEntry, number][]>>();
function cachedPool(ctx: Ctx, pool: string): [VocabEntry, number][] {
  let cache = POOL_CACHE.get(ctx.vocab);
  if (!cache) {
    cache = new Map();
    POOL_CACHE.set(ctx.vocab, cache);
  }
  const key = `${pool}|${ctx.culture.key}|${ctx.era}|${ctx.fantastic}`;
  let items = cache.get(key);
  if (!items) cache.set(key, (items = poolEntries(ctx.vocab, pool, { culture: ctx.culture.key, era: ctx.era, fantastic: ctx.fantastic })));
  return items;
}

const builtInWords = (pool: string) => new Set((BUILT_IN_VOCAB.pools[pool]?.entries ?? []).map((e) => e.w));

/** The entries a shape's token can draw: tone-weighted, narrowed by `only`, the tier asked for and the series' limits. */
function drawable(ctx: Ctx, pool: string, keep?: (e: VocabEntry) => boolean): [VocabEntry, number][] {
  const only = ctx.shape?.only?.[pool];
  const own = only && ctx.shape?.rest ? builtInWords(pool) : undefined;
  return cachedPool(ctx, pool)
    .filter(([e]) => (!only || only.includes(e.w) || (own && !own.has(e.w))) && (!keep || keep(e)))
    .map(([e, w]): [VocabEntry, number] => [e, ctx.kind === "nickname" ? w : w * toneFactor(e.t ?? [], ctx.tone)])
    .filter(([, w]) => w > 0);
}

function note(ctx: Ctx, pool: string, e: VocabEntry) {
  for (const t of e.t ?? []) ctx.drawn.add(t);
  ctx.log.push({ pool, word: e.w });
}

/** §6.1: draws from a pool; with a tier asked for, only entries that can reach it, and the tier recorded. */
function fromPool(ctx: Ctx, pool: string, opts: { tiered?: boolean; keep?: (e: VocabEntry) => boolean } = {}): VocabEntry | undefined {
  const tiered = !!opts.tiered && !!ctx.want;
  const items = drawable(ctx, pool, (e) => (!opts.keep || opts.keep(e)) && (!tiered || tiersReaching(e.v, ctx.shift, ctx.want!).length > 0));
  const e = pickWeighted(items, ctx.rng);
  if (!e) return undefined;
  note(ctx, pool, e);
  if (opts.tiered) {
    const options = ctx.want ? tiersReaching(e.v, ctx.shift, ctx.want) : e.v && e.v.length > 0 ? e.v : undefined;
    if (options) ctx.tier = ctx.want ? ctx.want : shiftTier(options.length === 1 ? options[0] : pickOne(options, ctx.rng), ctx.shift);
  }
  return e.w === "" ? undefined : e;
}


/** §11: a plural for a printed name: the entry's own, or the head word's (Piece of Eight → Pieces of Eight). */
export function pluralName(name: string, pl?: string): string {
  if (pl) return pl;
  const of = name.indexOf(" of ");
  if (of > 0) return pluralName(name.slice(0, of)) + name.slice(of);
  const space = name.lastIndexOf(" ");
  const head = name.slice(0, space + 1);
  const last = name.slice(space + 1);
  const dash = last.lastIndexOf("-");
  const pre = last.slice(0, dash + 1);
  const word = last.slice(dash + 1);
  if (word === "Half") return head + pre + "Halves";
  if (/[a-z]man$/.test(word)) return head + pre + word.slice(0, -3) + "men";
  return head + pre + word.charAt(0) + pluralOf(word.toLowerCase()).slice(1);
}

// ── Companies (§8.5) ────────────────────────────────────────────────────────

const COMPANIES = new Map<string, string[]>();

/** §8.5: the trade family's company names for a culture, setting and tone, forms B and E only, without the last word "Company". */
function companyPool(ctx: Ctx, type: string): string[] {
  const tradition = (REALM_DATA.tribal)[ctx.culture.key] ?? "general";
  const key = `${ctx.setting}|${tradition}|${ctx.tone}|${type}`;
  let pool = COMPANIES.get(key);
  if (!pool) {
    pool = [];
    const family = findFamily("trade")!;
    if (typesInSetting(family, ctx.setting).some((t) => t.key === type)) {
      const [genre, fantastic] = GENRE_OF[ctx.setting];
      const drop = new Set(MONEY_DATA.companyDrop);
      const batch = generateGroupNames({ family: "trade", type, tradition, genre, fantastic, form: "everyday", people: "invented", tone: ctx.tone, count: 40, seed: 1789 });
      for (const n of batch.names) {
        const words = n.text.replace(/^the /i, "").split(" ");
        if (words.length > 1 && drop.has(words[words.length - 1])) words.pop();
        const text = words.join(" ");
        if (text && !text.includes("[")) pool.push(text);
      }
    }
    COMPANIES.set(key, pool);
  }
  return pool;
}

function company(ctx: Ctx): string | undefined {
  if (ctx.mode === "placeholders") return "[company]";
  const family = findFamily("trade")!;
  const offered = new Set(typesInSetting(family, ctx.setting).map((t) => t.key));
  const type = pickWeighted(
    MONEY_DATA.companyTypes.filter((t) => offered.has(t.key) && companyPool(ctx, t.key).length > 0).map((t): [string, number] => [t.key, t.w]),
    ctx.rng,
  );
  return type ? pickOne(companyPool(ctx, type), ctx.rng) : undefined;
}

// ── Tokens ──────────────────────────────────────────────────────────────────

function listWord(ctx: Ctx, list: { w: string; c?: string[] }[]): string | undefined {
  return pickWeighted(
    list.filter((e) => cultureAllowed(e.c, ctx.culture.key, ctx.era)).map((e): [string, number] => [e.w, 1]),
    ctx.rng,
  );
}

function gnWord(ctx: Ctx, list: string, setting: GroupSetting = ctx.setting): string | undefined {
  const items = groupListWords(list, setting)
    .map(([w, n]): [string, number] => [w, n * toneFactor(wordTones(list, w), ctx.tone)])
    .filter(([, n]) => n > 0);
  const w = pickWeighted(items, ctx.rng);
  if (w === undefined) return undefined;
  for (const t of wordTones(list, w)) ctx.drawn.add(t);
  ctx.log.push({ pool: list, word: w });
  return w;
}

/** §3.3: `{town}`: the culture's own places; the money-only cultures use their ships-and-spacecraft town source (§3.2). */
function town(ctx: Ctx): string | undefined {
  if (ctx.mode === "placeholders") return "[place]";
  if (ctx.town) return ctx.town;
  const found = ctx.culture.moneyOnly ? groupTown(ctx.setting, ctx.culture.town === "compound" ? undefined : ctx.culture.town, ctx.rng).replace(/^The /, "") : routePlace(ctx.culture.key, ctx.setting, ctx.rng);
  return found;
}

function metalPool(ctx: Ctx): VocabEntry | undefined {
  const sf = ctx.shape?.p.includes("{sfMetal}");
  const keep = (e: VocabEntry) => {
    if (sf) return MONEY_DATA.lists.sfMetal.includes(e.w);
    if (ctx.exactMetal === "low") return !!e.v && e.v.includes("l");
    if (ctx.exactMetal) return e.w === ctx.exactMetal;
    return true;
  };
  const tiered = !ctx.exactMetal && !!ctx.want;
  const items = drawable(ctx, "coinMetal", (e) => keep(e) && (!tiered || tiersReaching(e.v, ctx.shift, ctx.want!).length > 0));
  const e = pickWeighted(items, ctx.rng);
  if (!e) return undefined;
  note(ctx, "coinMetal", e);
  const tiers = e.v && e.v.length > 0 ? e.v : undefined;
  if (ctx.exactMetal) ctx.tier = ctx.exactMetal === "low" ? "l" : ctx.want ?? (tiers ? tiers[0] : undefined);
  else if (tiered) ctx.tier = ctx.want;
  else if (tiers) ctx.tier = tiers.length === 1 ? tiers[0] : pickOne(tiers, ctx.rng);
  return e;
}

/** §3.3: `{emblem}`: the coin emblems plus the culture's animals from bynames at ×1 each. */
function emblem(ctx: Ctx): string | undefined {
  // A nickname for a coin of the batch names that coin's emblem.
  if (ctx.kind === "nickname" && ctx.batchEmblems.length > 0 && ctx.shape?.p.includes("{emblem")) {
    const w = pickOne(ctx.batchEmblems, ctx.rng);
    ctx.emblems.push(w);
    ctx.log.push({ pool: "coinEmblem", word: w });
    return w;
  }
  // §13.4: no sacred animals of a living religion.
  const sacred = new Set(MONEY_DATA.lists.sacredAnimals[ctx.culture.key] ?? []);
  const ok = (w: string) => !sacred.has(w) && (!ctx.emblemFilter || ctx.emblemFilter(w));
  const items = drawable(ctx, "coinEmblem", (e) => ok(e.w));
  const animals: [string, number][] = [...new Set(cultureAnimals(ctx.culture.key))].filter((w) => !w.includes("{") && ok(w)).map((w) => [w, 1]);
  const merged = new Map<string, [VocabEntry | undefined, number]>();
  for (const [e, w] of items) merged.set(e.w, [e, w]);
  for (const [w, n] of animals) {
    const have = merged.get(w);
    merged.set(w, [have?.[0], (have?.[1] ?? 0) + n]);
  }
  const used = ctx.used;
  const w = pickWeighted(
    [...merged.entries()].filter(([word]) => !used?.has(`emblem:${word}`)).map(([word, [, n]]): [string, number] => [word, n]),
    ctx.rng,
  );
  if (w === undefined) return undefined;
  const e = merged.get(w)![0];
  if (e) note(ctx, "coinEmblem", e);
  else ctx.log.push({ pool: "coinEmblem", word: w });
  ctx.emblems.push(w);
  return w;
}

function coinWord(ctx: Ctx): string | undefined {
  const byMetal = !!ctx.shape && (ctx.shape.p.includes("{metal}") || !!ctx.shape.tier);
  const used = ctx.used;
  const e = fromPool(ctx, "coinWord", {
    tiered: !byMetal,
    keep: (x) => !(used?.has(`coin:${x.w}`) && !ctx.shift) && (!ctx.coinWordFilter || ctx.coinWordFilter(x.w)),
  });
  return e?.w;
}

/** §6.1: `{fraction}`: Half- and Quarter- take a hyphen, Double and Third a space; the tier asked for must be reachable. */
function fraction(ctx: Ctx): string | undefined {
  const coins = cachedPool(ctx, "coinWord");
  const e = pickWeighted(
    drawable(ctx, "coinFraction", (f) => (!ctx.lowerOnly || f.ts === 1) && (!ctx.want || coins.some(([c]) => tiersReaching(c.v, f.ts ?? 0, ctx.want!).length > 0))),
    ctx.rng,
  );
  if (!e) return undefined;
  note(ctx, "coinFraction", e);
  ctx.shift = e.ts ?? 0;
  return HYPHEN_FRACTIONS.has(e.w) ? `${e.w}-` : `${e.w} `;
}

function godName(ctx: Ctx): string | undefined {
  const list = findVesselCulture(ctx.culture.key)?.gods?.list ?? [];
  return list.length > 0 ? pickOne(list, ctx.rng).w : undefined;
}

function fixedWord(ctx: Ctx): string | undefined {
  const shape = ctx.shape!;
  const tiered = !!ctx.want && ctx.kind !== "currency";
  const items = drawable(ctx, `moneyFixed:${shape.kind}`, (e) => e.fx === shape.fx && (!tiered || tiersReaching(e.v, 0, ctx.want!).length > 0));
  const e = pickWeighted(items, ctx.rng);
  if (!e) return undefined;
  note(ctx, `moneyFixed:${shape.kind}`, e);
  if (ctx.want && e.v && e.v.length > 0) ctx.tier = ctx.want;
  else if (e.v && e.v.length === 1) ctx.tier = e.v[0];
  // §7.1: with loanwords, a name that has a loan form prints it 70% of the time.
  if (ctx.words === "loanwords" && e.loan && ctx.rng() < MONEY_DATA.loanShare) {
    ctx.loan = true;
    return e.loan;
  }
  return e.w;
}

function token(ctx: Ctx, name: string, mod?: string): string | undefined {
  const rng = ctx.rng;
  const placeholders = ctx.mode === "placeholders";
  switch (name) {
    case "fixed": {
      const w = fixedWord(ctx);
      // Fixed names may hold tokens of their own ({town} Copper, {company} Credit).
      return w && w.includes("{") ? renderPattern(ctx, w) : w;
    }
    case "metal": {
      const e = metalPool(ctx);
      if (!e) return undefined;
      return mod === "pl" ? MONEY_DATA.lists.metalPlurals[e.w] ?? pluralName(e.w) : e.w;
    }
    case "sfMetal": {
      const e = metalPool(ctx);
      return e?.w;
    }
    case "emblem": {
      const w = emblem(ctx);
      return w && mod === "pl" ? pluralName(w) : w;
    }
    case "coinWord":
      return coinWord(ctx);
    case "fraction":
      return fraction(ctx);
    case "shapeWord":
      return fromPool(ctx, "coinShapeWord")?.w;
    case "earlyMoney":
    case "goodsMoney":
    case "paperWord":
    case "tokenWord":
    case "unitWord":
      return fromPool(ctx, name)?.w;
    case "moneyNickname":
      return fromPool(ctx, "moneyNickname")?.w;
    case "sfMoney":
      return fromPool(ctx, "sfMoney")?.w;
    case "sfMoneyLower":
      return fromPool(ctx, "sfMoney")?.w.toLowerCase();
    case "town":
      return town(ctx);
    case "realm":
      return placeholders ? "[realm]" : routeKingdom(ctx.culture.key, ctx.era, rng);
    case "figure": {
      const f = ctx.culture.moneyOnly ? (ctx.culture.figure ?? []).length > 0 ? pickOne(ctx.culture.figure!, rng) : undefined : routeFigure(ctx.culture.key, ctx.setting, rng);
      if (!f) return undefined;
      return mod === "poss" ? groupPossessive(f, false) : f;
    }
    case "dynasty":
      return "[dynasty]";
    case "holy":
      return placeholders ? "[holy person]" : groupSaint(ctx.setting, rng);
    case "god": {
      const g = godName(ctx);
      // "the Twins" is plural: the Twins' Bull (OUP).
      return g && mod === "poss" ? groupPossessive(g, /^the .+s$/i.test(g)) : g;
    }
    case "company":
      return company(ctx);
    case "trade": {
      const e = fromPool(ctx, "streetTrades");
      return e && mod === "poss" ? groupPossessive(e.w, true) : e?.w;
    }
    case "star":
      return groupStarIn("any", ctx.mode, rng);
    case "spaceLand":
      return gnWord(ctx, "spaceLand", "SF");
    case "compass":
      return gnWord(ctx, "compass");
    case "numberWord":
      return pickOne(MONEY_DATA.lists.numberWord, rng);
    case "colourShort":
      return pickOne(MONEY_DATA.lists.colourShort, rng);
    case "gearWord":
      return pickOne(MONEY_DATA.lists.gearWord, rng);
    case "cryptoRoot":
      return pickOne(MONEY_DATA.lists.cryptoRoot, rng);
    case "cloth":
      return listWord(ctx, MONEY_DATA.lists.cloth);
    case "grain":
      return listWord(ctx, MONEY_DATA.lists.grain);
    case "goodsAnimal":
      return listWord(ctx, MONEY_DATA.lists.goodsAnimal);
  }
  return undefined;
}

/** A shape's pattern rendered; undefined when a token has nothing to offer. */
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

/** §11: capitals and OUP possessives; a leading "the" lower case; "e-" kept for the e-money shape. */
export function moneyCapitals(text: string): string {
  return routeCapitals(text)
    .replace(/^The /, "the ")
    .replace(/^E-(?=[A-Z])/, "e-");
}

// ── Safeguards (§13) ────────────────────────────────────────────────────────

const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const BANNED = MONEY_DATA.safeguards.banned.map(wordRe);
const NEVER_GOODS = MONEY_DATA.safeguards.neverGoods.map(wordRe);
const bare = (text: string) => routeNorm(text).replace(/^the /, "");

/** §13.3: banned words (group names' and the module's); goods money also never names tobacco, opium or ivory (§8.3). */
export function breaksMoneyWords(text: string, goods = false): boolean {
  return hasBannedWord(text) || BANNED.some((re) => re.test(text)) || (goods && NEVER_GOODS.some((re) => re.test(text)));
}

export function moneyBlockSet(guards: GroupSafeguards = defaultMoneySafeguards()): Set<string> {
  return new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(bare));
}

/** RN §3.3: a pack word the money safeguards drop (blocked whole, a banned word, or tobacco and the like in goods money). */
export function moneyWordBlocked(word: string, guards?: GroupSafeguards, pool?: string): boolean {
  return moneyBlockSet(guards).has(bare(word)) || breaksMoneyWords(word, pool === "moneyFixed:goods" || pool === "goodsMoney");
}

// ── Shapes (§8) ─────────────────────────────────────────────────────────────

/** §3.1: whether a shape's cultures allow this one; dutch and american count as christian at ×0.3 for `{holy}` shapes. */
function cultureFactor(ctx: Ctx, s: MoneyShape): number {
  if (s.p.includes("{holy}") && DUTCH_AMERICAN.has(ctx.culture.key)) return 0.3;
  return cultureAllowed(s.c, ctx.culture.key, ctx.era) ? 1 : 0;
}

function shapeWeight(ctx: Ctx, s: MoneyShape): number {
  if (s.e && !s.e.includes(ctx.era)) return 0;
  const cf = cultureFactor(ctx, s);
  if (cf === 0) return 0;
  if (s.h !== undefined && s.h !== ctx.fantastic) return 0;
  const c = ctx.culture;
  // §3.2: the money-only cultures draw no {realm} or {folk} shapes; the Americans no {figure} shapes.
  if (c.moneyOnly && s.p.includes("{realm")) return 0;
  if (s.p.includes("{figure") && c.moneyOnly && (c.figure ?? []).length === 0) return 0;
  if (s.p.includes("{god")) {
    if ((findVesselCulture(c.key)?.gods?.list ?? []).length === 0) return 0;
  }
  // Trades are not tied to caste cultures (as events and eras).
  if (CASTE.has(c.key) && s.p.includes("{trade")) return 0;
  if (s.tier && ctx.want && s.tier !== ctx.want) return 0;
  if (s.p === "{fixed}" || s.p === "the {fixed}") {
    const items = drawable({ ...ctx, kind: s.kind, shape: s }, `moneyFixed:${s.kind}`, (e) => e.fx === s.fx && (!ctx.want || s.kind === "currency" || tiersReaching(e.v, 0, ctx.want) .length > 0));
    if (items.length === 0) return 0;
  } else {
    const single = s.p.match(/^\{(\w+)\}$/)?.[1];
    if (single && ctx.vocab.pools[single] && drawable({ ...ctx, shape: s }, single).length === 0) return 0;
  }
  return s.w * cf * (s.kind === "nickname" ? 1 : toneFactor(s.t ?? [], ctx.tone));
}

function plans(ctx: Ctx, kind: MoneyKind, only?: string): [MoneyShape, number][] {
  return ALL_SHAPES.filter((s) => s.kind === kind && (!only || s.p === only))
    .map((s): [MoneyShape, number] => [s, shapeWeight({ ...ctx, kind, shape: s }, s)])
    .filter(([, w]) => w > 0);
}

// ── Ladders (§10.3) ─────────────────────────────────────────────────────────

const LADDER_BY_KEY = new Map(MONEY_LADDERS.map((l) => [l.key, l]));
export const findMoneyLadder = (key: string | undefined) => (key ? LADDER_BY_KEY.get(key) : undefined);

/** §10.3: the kinds a coinage can be made for (the others are each one separate). */
export const SERIES_KINDS: (MoneyKind | undefined)[] = [undefined, "coin", "early", "goods"];
export const kindHasSeries = (kind: MoneyKind | undefined) => SERIES_KINDS.includes(kind);

/** §10.3: the ladders the table offers for a culture, era and kind; none means "with values" is not offered. */
export function moneyLaddersFor(culture: string, era: RouteEra, kind?: MoneyKind): MoneyLadder[] {
  if (!kindHasSeries(kind)) return [];
  const serve = kind ?? "any";
  return (MONEY_DATA.ladderCells[culture]?.[era] ?? []).map((k) => LADDER_BY_KEY.get(k)!).filter((l) => l.serves.includes(serve as "any"));
}
export const moneyHasLadder = (culture: string, era: RouteEra, kind?: MoneyKind) => moneyLaddersFor(culture, era, kind).length > 0;

/** §10.4: the shapes a ladder's generated steps draw from: goods ladders goods shapes, ingot ladders early shapes, the rest coins. */
const ladderKind = (l: MoneyLadder): MoneyKind => (l.serves.includes("goods") ? "goods" : l.serves.includes("early") ? "early" : "coin");

/** §10.5: figures with a comma for thousands. */
export const countText = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// ── Batches ─────────────────────────────────────────────────────────────────

interface Session {
  rng: () => number;
  options: MoneyOptions;
  culture: MoneyCulture;
  era: RouteEra;
  count: number;
  chosen?: MoneyKind;
  want?: ValueTier;
  tone: GroupToneChoice;
  base: Ctx;
  newCtx: (kind: MoneyKind, extra?: Partial<Ctx>) => Ctx;
  acceptable: (text: string, kind: MoneyKind) => boolean;
  build: (kind: MoneyKind) => MoneyName | undefined;
  /** Names already used in the batch, lower case. */
  seen: Set<string>;
  /** The theme the coinage drew. */
  theme?: string;
}

const animalEmblem = (culture: string) => {
  const animals = new Set([...MONEY_DATA.lists.animalEmblems, ...cultureAnimals(culture)]);
  return (w: string) => animals.has(w);
};

/** §9 themes → the coin shapes their steps use (all from §8.1). */
const THEME_SHAPES: Record<string, string[]> = {
  beasts: ["{metal} {emblem}", "{emblem} {coinWord}"],
  emblems: ["{metal} {emblem}", "{emblem} {coinWord}"],
  rulers: ["{figure:poss} {coinWord}", "{figure:poss} Gold", "{metal} {coinWord}"],
  place: ["{town} {coinWord}"],
  holy: ["{holy} {coinWord}", "{metal} {emblem}", "{emblem} {coinWord}"],
  gods: ["{god:poss} {emblem}"],
};
const FRACTION_SHAPE = "{fraction}{coinWord}";

/** §9: the theme a coinage draws: only those the culture and era can make. */
function drawTheme(S: Session): string {
  const ctx = S.newCtx("coin");
  const christian = cultureAllowed(["christian"], S.culture.key, S.era);
  const names = cachedPool(ctx, "moneyFixed:coin").some(([e]) => !e.fx);
  const options = MONEY_DATA.series.themes.filter((t) => {
    if (t.key === "holy") return christian;
    if (t.key === "gods") return S.era === "AN" && (findVesselCulture(S.culture.key)?.gods?.list ?? []).length > 0 && THEME_SHAPES.gods.some((p) => ALL_SHAPES.some((s) => s.p === p && shapeWeight(ctx, s) > 0));
    if (t.key === "rulers") return !S.culture.moneyOnly || (S.culture.figure ?? []).length > 0;
    if (t.key === "names") return names;
    return true;
  });
  return pickWeighted(options.map((t): [string, number] => [t.key, t.w]), S.rng)!;
}

interface Layout {
  theme?: string;
  town?: string;
  used: Set<string>;
  prev?: { coinWord?: string; tier?: ValueTier };
  fractionUsed: boolean;
}

/** §9: one generated step at a tier (and a metal): the theme's shapes, a fraction directly below its coin, no word twice. */
function generatedStep(S: Session, kind: MoneyKind, tier: ValueTier, lay: Layout, exactMetal?: string): MoneyName | undefined {
  for (let attempt = 0; attempt < 40; attempt++) {
    const extra: Partial<Ctx> = { want: tier, exactMetal, used: lay.used, town: lay.town, batchEmblems: S.base.batchEmblems };
    const animal = animalEmblem(S.culture.key);
    if (kind === "coin") {
      if (lay.theme === "beasts") extra.emblemFilter = animal;
      else if (lay.theme === "emblems") extra.emblemFilter = (w) => !animal(w);
      else if (lay.theme === "holy") extra.emblemFilter = (w) => MONEY_DATA.lists.holyEmblems.includes(w);
    }
    // When a theme runs out of words (a culture with three coin words can't name five steps from them), the step falls back to beasts.
    const relaxed = attempt >= 20;
    if (relaxed && kind === "coin" && lay.theme) {
      extra.emblemFilter = undefined;
      extra.town = undefined;
    }
    const ctx = S.newCtx(kind, extra);
    const theme = relaxed ? (kind === "coin" ? "beasts" : undefined) : lay.theme;
    const wanted = kind === "coin" && theme && theme !== "names" ? THEME_SHAPES[theme] ?? [] : undefined;
    const pool = ALL_SHAPES.filter((x) => x.kind === kind && (wanted ? wanted.includes(x.p) : theme === "names" ? x.p === "{fixed}" && !x.fx : true));
    const shapes: [MoneyShape, number][] = pool.map((x): [MoneyShape, number] => [x, stepShapeWeight(ctx, x, exactMetal)]).filter(([, w]) => w > 0);
    // A fraction lowers the coin of the step directly above it by one tier, once per coinage.
    if (kind === "coin" && lay.theme !== "names" && !lay.fractionUsed && lay.prev?.coinWord && lay.prev.tier && shiftTier(lay.prev.tier, 1) === tier && !exactMetal) {
      const f = ALL_SHAPES.find((x) => x.kind === "coin" && x.p === FRACTION_SHAPE)!;
      const w = shapeWeight(ctx, f);
      if (w > 0) shapes.push([f, w]);
    }
    const s = pickWeighted(shapes, S.rng);
    if (!s) {
      // Nothing in the theme fits this tier: this step goes to the fallback.
      if (!relaxed && kind === "coin" && lay.theme) {
        attempt = 19;
        continue;
      }
      return undefined;
    }
    ctx.shape = s;
    if (s.p === FRACTION_SHAPE) {
      ctx.coinWordFilter = (w) => w === lay.prev!.coinWord;
      ctx.lowerOnly = true;
    }
    const raw = renderPattern(ctx, s.p);
    if (!raw) continue;
    const text = moneyCapitals(raw);
    if (!S.acceptable(text, kind) || S.seen.has(text.toLowerCase())) continue;
    for (const w of ctx.log) {
      if (w.pool === "coinEmblem") lay.used.add(`emblem:${w.word}`);
      if (w.pool === "coinWord" && !ctx.shift) lay.used.add(`coin:${w.word}`);
    }
    if (s.p === FRACTION_SHAPE) lay.fractionUsed = true;
    lay.prev = { coinWord: ctx.log.find((w) => w.pool === "coinWord")?.word, tier };
    for (const e of ctx.emblems) if (kind === "coin" && !S.base.batchEmblems.includes(e)) S.base.batchEmblems.push(e);
    const tones = new Set<GroupTone>([...(s.t ?? []), ...ctx.drawn]);
    return { text, name: text, kind, shape: s.p, tones: GROUP_TONES.filter((t) => tones.has(t)), words: ctx.log, tier, ...(ctx.loan ? { loan: true } : {}) };
  }
  return undefined;
}

/** A step's shape weight: a valued ladder's metal rules out shapes that name another metal. */
function stepShapeWeight(ctx: Ctx, s: MoneyShape, exactMetal?: string): number {
  if (exactMetal && s.tier) {
    const gold = /Gold/.test(s.p);
    if (!((exactMetal === "Gold" && gold) || (exactMetal === "low" && !gold))) return 0;
  }
  return shapeWeight(ctx, s);
}

/** §9: a step that takes the culture's real name for its tier. */
function realStep(S: Session, kind: MoneyKind, tier: ValueTier, lay: Layout): MoneyName | undefined {
  const shape = ALL_SHAPES.find((x) => x.kind === kind && x.p === "{fixed}" && !x.fx);
  if (!shape) return undefined;
  for (let attempt = 0; attempt < 10; attempt++) {
    const ctx = S.newCtx(kind, { want: tier, used: lay.used, town: lay.town });
    ctx.shape = shape;
    if (shapeWeight(ctx, shape) <= 0) return undefined;
    const raw = renderPattern(ctx, shape.p);
    if (!raw) continue;
    const text = moneyCapitals(raw);
    if (!S.acceptable(text, kind) || S.seen.has(text.toLowerCase())) continue;
    return { text, name: text, kind, shape: shape.p, tones: [], words: ctx.log, tier, ...(ctx.loan ? { loan: true } : {}) };
  }
  return undefined;
}

/** §9 rule: "Double" above the coin it names, as a fraction below. Not drawn here: it needs the step below. */

/** §9: the extras after the coins in a kind-Any coinage: one paper or scrip name (early modern on), then one nickname. */
function coinageExtras(S: Session, room: number): MoneyName[] {
  const out: MoneyName[] = [];
  const take = (n: MoneyName | undefined) => {
    if (!n || S.seen.has(n.text.toLowerCase())) return false;
    S.seen.add(n.text.toLowerCase());
    out.push(n);
    return true;
  };
  if (room > 0 && ROUTE_ERAS.findIndex((e) => e.code === S.era) >= 2) {
    const kinds = (["paper", "scrip"] as MoneyKind[]).map((k): [MoneyKind, number] => [k, moneyKindWeight(k, S.culture.key, S.era)]).filter(([, w]) => w > 0);
    for (let i = 0; i < 6 && out.length === 0 && kinds.length > 0; i++) take(S.build(pickWeighted(kinds, S.rng)!));
    if (out.length > 0) room--;
  }
  if (room > 0 && moneyKindWeight("nickname", S.culture.key, S.era) > 0) for (let i = 0; i < 6; i++) if (take(S.build("nickname"))) break;
  return out;
}

/** §9, §10: one money system: the currency first, the coins from highest to lowest, then a note or token and a nickname. */
function coinage(S: Session, ladder: MoneyLadder | undefined, notices: string[]): MoneyName[] {
  const names: MoneyName[] = [];
  let room = S.count;
  const any = S.chosen === undefined;
  const add = (n: MoneyName) => {
    S.seen.add(n.text.toLowerCase());
    names.push(n);
  };
  if (any && S.count >= MONEY_DATA.series.currencyFrom) {
    const c = S.build("currency");
    if (c && !S.seen.has(c.text.toLowerCase())) {
      add(c);
      room--;
    }
  }
  const kind: MoneyKind = ladder ? ladderKind(ladder) : S.chosen ?? "coin";
  const lay: Layout = { used: new Set(), fractionUsed: false };
  const ctx0 = S.newCtx(kind);
  if (kind === "coin") {
    lay.theme = S.theme = drawTheme(S);
    if (lay.theme === "place") lay.town = town(ctx0);
  }
  const steps = ladder
    ? ladder.steps.slice(0, Math.max(0, room))
    : (() => {
        const n = Math.min(pickWeighted(MONEY_DATA.series.steps.map(([k, w]): [number, number] => [k, w]), S.rng)!, Math.max(0, room));
        return MONEY_DATA.series.tiers[String(n)]?.map((tier) => ({ tier })) ?? [];
      })();
  const share = S.options.realShare ?? (ladder ? MONEY_DATA.series.realShareValues : MONEY_DATA.series.realShare);
  const coins: MoneyName[] = [];
  steps.forEach((step, i) => {
    let n: MoneyName | undefined;
    const lad = step as LadderStep;
    if (ladder) {
      if (S.rng() < share) n = ladderRealStep(S, ladder, lad, kind, lay);
    } else if (S.rng() < share) n = realStep(S, kind, lad.tier, lay);
    if (n) lay.prev = { tier: lad.tier };
    n ??= generatedStep(S, kind, lad.tier, lay, ladder ? lad.metal : undefined);
    if (!n) return;
    if (ladder) n = { ...n, step: i };
    for (const e of n.words) if (e.pool === "coinEmblem") lay.used.add(`emblem:${e.word}`);
    S.seen.add(n.text.toLowerCase());
    coins.push(n);
  });
  names.push(...coins);
  room -= coins.length;
  if (ladder) applyValues(ladder, coins);
  if (any) names.push(...coinageExtras(S, room));
  if (ladder) notices.unshift(`Values: ${ladder.source}.`);
  return names;
}

/** §10.4: a ladder step's real name (its loan form 70% of the time with loanwords). Decimal ladders take the culture's own names. */
function ladderRealStep(S: Session, ladder: MoneyLadder, step: LadderStep, kind: MoneyKind, lay: Layout): MoneyName | undefined {
  let text = step.n;
  let loan = false;
  let pl = step.pl;
  const words: { pool: string; word: string }[] = [];
  if (ladder.decimal) {
    const own = decimalName(S, ladder, step);
    if (own) {
      text = own.text;
      loan = own.loan;
      pl = undefined;
      words.push(...own.words);
    } else if (S.options.realShare !== 1) return undefined;
  } else if (S.options.words === "loanwords" && step.loan && S.rng() < MONEY_DATA.loanShare) {
    text = step.loan;
    loan = true;
    pl = undefined;
  }
  if (S.seen.has(text.toLowerCase())) return undefined;
  return { text, name: text, kind, shape: "ladder", tones: [], words, tier: step.tier, real: true, ...(loan ? { loan: true } : {}), ...(pl ? { pl } : {}) };
}

/** §10.3: a decimal ladder's unit from the culture's currency or middle-tier coin name, its hundredth from a "Hundredth"-type name. */
function decimalName(S: Session, ladder: MoneyLadder, step: LadderStep): { text: string; loan: boolean; words: { pool: string; word: string }[] } | undefined {
  const index = ladder.steps.indexOf(step);
  if (index === 1 || (S.era === "NF" || S.era === "IS")) return undefined;
  const ctx = S.newCtx("coin");
  const entries: VocabEntry[] = [];
  const pools = index === 0 ? ["moneyFixed:currency", "moneyFixed:coin"] : ["moneyFixed:coin"];
  for (const pool of pools) {
    for (const [e] of cachedPool(ctx, pool)) {
      if (e.fx || e.w.includes("{")) continue;
      if (index === 0 ? pool === "moneyFixed:currency" || (e.v ?? []).includes("m") : e.w === "Hundredth") entries.push(e);
    }
  }
  if (entries.length === 0) return undefined;
  const e = pickOne(entries, S.rng);
  const loan = S.options.words === "loanwords" && !!e.loan && S.rng() < MONEY_DATA.loanShare;
  return { text: loan ? e.loan! : e.w, loan, words: [{ pool: "moneyFixed:coin", word: e.w }] };
}

/** §10.5: each step but the lowest gets its worth in the next step down when the ratio is whole, else in the largest lower step that divides it. */
function applyValues(ladder: MoneyLadder, coins: MoneyName[]) {
  const steps = ladder.steps;
  coins.forEach((n) => {
    const i = n.step!;
    if (i >= steps.length - 1) return;
    let j = i + 1;
    while (steps[i].v % steps[j].v !== 0) j++;
    const lower = coins.find((c) => c.step === j);
    const unit = lower ? pluralName(lower.name, lower.pl) : pluralName(steps[j].n, steps[j].pl);
    n.value = `${countText(steps[i].v / steps[j].v)} ${unit}`;
    n.text = `${n.name} (${n.value})`;
  });
}

/** §6: a batch of unique money names; a coinage when the series says so (§9, §10). */
export function generateMoneyNames(options: MoneyOptions): MoneyBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const notices: string[] = [];
  const culture = findMoneyCulture(options.culture) ?? findMoneyCulture(DEFAULT_CULTURE)!;
  const era: RouteEra = ROUTE_ERAS.some((e) => e.code === options.era) ? options.era! : "MD";
  const fantastic = !!options.fantastic;
  const count = Math.max(0, Math.floor(options.count));
  const offered = moneyKindsOffered(culture.key, era);
  const chosen = options.kind && offered.some((k) => k.key === options.kind) ? options.kind : undefined;
  const want = options.value && options.value !== "any" ? VALUE_TIER[options.value] : undefined;
  const block = moneyBlockSet(options.safeguards);
  const tone = options.tone ?? "any";

  const base: Ctx = {
    rng,
    culture,
    era,
    setting: routeSetting(era, fantastic),
    fantastic,
    mode: options.people ?? "placeholders",
    tone,
    vocab: options.vocab ?? BUILT_IN_VOCAB,
    words: options.words ?? "translated",
    kind: chosen ?? "coin",
    shift: 0,
    drawn: new Set(),
    log: [],
    emblems: [],
    batchEmblems: [],
  };
  // A coinage spans every tier, so the value choice only applies to separate names.
  let activeWant = want;
  const newCtx = (kind: MoneyKind, extra: Partial<Ctx> = {}): Ctx => ({ ...base, kind, want: kind === "currency" ? undefined : activeWant, shift: 0, drawn: new Set(), log: [], emblems: [], ...extra });

  const planCache = new Map<string, [MoneyShape, number][]>();
  const plansFor = (kind: MoneyKind): [MoneyShape, number][] => {
    const key = `${kind}|${options.shape ?? ""}`;
    let p = planCache.get(key);
    if (!p) planCache.set(key, (p = plans(newCtx(kind), kind, options.shape)));
    return p;
  };

  const kindWeights = offered
    .map((k): [MoneyKind, number] => [k.key, moneyKindWeight(k.key, culture.key, era) * (k.key === "nickname" ? nicknameToneFactor(tone) : 1)])
    .filter(([k]) => plansFor(k).length > 0);

  const acceptable = (text: string, kind: MoneyKind): boolean => {
    const counted = countedWords(text);
    if (counted.length === 0 || counted.length > MONEY_DATA.cap) return false;
    if (repeatsContent(counted)) return false;
    if (block.has(bare(text))) return false;
    if (breaksMoneyWords(text, kind === "goods")) return false;
    if ((era === "NF" || era === "IS") && hasSpaceBlock(text)) return false;
    return true;
  };

  const build = (kind: MoneyKind): MoneyName | undefined => {
    for (let i = 0; i < 30; i++) {
      const ctx = newCtx(kind, { batchEmblems: base.batchEmblems });
      const s = pickWeighted(plansFor(kind), rng);
      if (!s) return undefined;
      ctx.shape = s;
      const raw = renderPattern(ctx, s.p);
      if (!raw) continue;
      const text = moneyCapitals(raw);
      if (!acceptable(text, kind)) continue;
      for (const e of ctx.emblems) if (kind === "coin" && !base.batchEmblems.includes(e)) base.batchEmblems.push(e);
      const tones = new Set<GroupTone>([...(s.t ?? []), ...ctx.drawn]);
      const tier = ctx.tier ?? s.tier;
      return {
        text,
        name: text,
        kind,
        shape: s.p,
        tones: GROUP_TONES.filter((t) => tones.has(t)),
        words: ctx.log,
        ...(tier ? { tier } : {}),
        ...(ctx.loan ? { loan: true } : {}),
      };
    }
    return undefined;
  };

  const seen = new Set<string>();
  const S: Session = { rng, options, culture, era, count, chosen, want, tone, base, newCtx, acceptable, build, seen };

  // §9, §10: a coinage is one money system; "with values" needs a ladder, else it runs as a coinage.
  let series: MoneySeries = options.series ?? "separate";
  if (!kindHasSeries(chosen)) series = "separate";
  let ladder: MoneyLadder | undefined;
  if (series === "values") {
    const candidates = moneyLaddersFor(culture.key, era, chosen);
    ladder = findMoneyLadder(options.ladder) && candidates.some((l) => l.key === options.ladder) ? findMoneyLadder(options.ladder) : candidates.length > 0 ? pickOne(candidates, rng) : undefined;
    if (!ladder) series = "coinage";
  }
  if (series !== "separate") {
    activeWant = undefined;
    planCache.clear();
    const names = coinage(S, ladder, notices);
    if (names.length === 0) notices.push("No money system could be made for this culture and era.");
    return { names, seed, notices, ...(ladder ? { ladder: ladder.key } : {}), ...(S.theme ? { theme: S.theme } : {}) };
  }

  const names: MoneyName[] = [];
  const add = (n: MoneyName | undefined): boolean => {
    if (!n || seen.has(n.text.toLowerCase())) return false;
    seen.add(n.text.toLowerCase());
    names.push(n);
    return true;
  };
  for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
    const k = chosen ?? pickWeighted(kindWeights, rng);
    if (!k || (chosen && plansFor(chosen).length === 0)) break;
    add(build(k));
  }
  if (names.length < count) {
    const kind = findMoneyKind(chosen);
    notices.push(
      names.length === 0 && kind
        ? `There are no ${kind.plural} names for this culture and era yet: a vocabulary pack can add some.`
        : `Only ${names.length} names could be generated.`,
    );
  }
  return { names, seed, notices };
}
