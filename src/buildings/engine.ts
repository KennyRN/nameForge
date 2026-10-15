// Buildings and landmarks (docs/buildings-and-landmarks-brief.md): the named buildings and
// landmarks of a settlement and its country – defences, halls, houses of faith, civic buildings,
// crossings, wells, works, monuments, schools, gaols and lights – for route names' 22 cultures and
// seven eras. Words come from the shared settlement pools (settlement/vocab.ts, with vocabulary
// packs); places, people, gods and figures come from the route engine, creatures and colours from
// group names, dynasties from realms, and the settings and rendering from inns. No Obsidian imports.

import buildingData from "../data/building-names.json";
import {
  type GroupPeople,
  type GroupSafeguards,
  type GroupSetting,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  groupListWords,
  groupPlural,
  groupPossessive,
  groupSaint,
  pickWeighted,
  repeatsContent,
  toneFactor,
  wordTones,
} from "../groups/engine";
import { breaksInnWords, INN_DATA, INN_SETTINGS, innCapitals, type InnSetting } from "../inns/engine";
import { mulberry32 } from "../markov";
import { DYNASTY_CULTURES } from "../realms/engine";
import {
  BRITISH_CULTURES,
  countedWords,
  findRouteCulture,
  godNames,
  personNames,
  ROUTE_ERAS,
  routeFigure,
  routeNorm,
  routePlace,
  routeSetting,
  type RouteCulture,
  type RouteEra,
} from "../routes/engine";
import { boostPool, contextSaint, selfPatterns, TownTurn, type SettlementContext } from "../settlement/contextShared";
import { deityHooks } from "../deities/hook";

/** Deities brief §10.1: the christian cultures' temple weight, with fantastic on. */
const DEITY_CHRISTIAN_WEIGHT = 3;
import { BUILT_IN_VOCAB, cultureAllowed, poolEntries, type VocabEntry, type Vocabulary } from "../settlement/vocab";
import { STREET_DATA } from "../streets/engine";

// ── Data ────────────────────────────────────────────────────────────────────

export type BuildingKind = "defence" | "residence" | "faith" | "civic" | "crossing" | "water" | "works" | "monument" | "learning" | "confinement" | "maritime";
export type BuildingSource = "shared" | "kind" | "culture" | "era" | "scifi" | "fixed";

export interface BuildingShape {
  p: string;
  w: number;
  e?: RouteEra[];
  c?: string[];
  t?: GroupTone[];
  h?: boolean;
  /** §8.1, §8.4: the kinds a shared or era shape serves (all when absent). */
  kinds?: BuildingKind[];
  /** §8.3: a culture shape's kind. */
  kind?: BuildingKind;
  /** §8.2: the building words `{bw}` is limited to (Minster, Abbey, Priory). */
  bw?: string[];
  /** §8.2: setting multipliers (Mile Stone by the road ×3). */
  sx?: Partial<Record<InnSetting, number>>;
  /** Deities brief §10.1: an invented deity's temple or shrine. */
  deity?: boolean;
}

interface BuildingData {
  any: string;
  kinds: { key: BuildingKind; menu: string; plural: string; description: string; era: Record<RouteEra, number> }[];
  settingX: Record<InnSetting, Partial<Record<BuildingKind, number>>>;
  shared: BuildingShape[];
  kindShapes: Record<BuildingKind, BuildingShape[]>;
  cultureShapes: Record<string, BuildingShape[]>;
  eraShapes: BuildingShape[];
  scifi: { share: number; shapes: BuildingShape[] };
  lists: { discovery: string[]; event: string[]; headland: string[]; creatureLists: string[]; godCultures: string[] };
  sensitive: { noFaith: string[]; faithOnly: Record<string, string[]> };
  series: { founderUses: number };
  cap: number;
  safeguards: { block: string[]; flag: string[]; flagListBlocks: boolean; banned: string[]; religious: string[]; christian: string[] };
}

export const BUILDING_DATA = buildingData as unknown as BuildingData;
/** Settlement kit §4: the shapes whose first `{town}` is the settlement. */
const BUILDING_SELF = selfPatterns(buildingData);
export const BUILDING_KINDS = BUILDING_DATA.kinds;
export const BUILDING_ANY = BUILDING_DATA.any;

const isFuture = (era: RouteEra) => era === "NF" || era === "IS";

/** §5.1: the kinds offered in an era. */
export const buildingKindsOffered = (era: RouteEra) => BUILDING_KINDS.filter((k) => k.era[era] > 0);

export const defaultBuildingSafeguards = (): GroupSafeguards => ({
  block: BUILDING_DATA.safeguards.block,
  flag: BUILDING_DATA.safeguards.flag,
  flagListBlocks: BUILDING_DATA.safeguards.flagListBlocks,
});

// ── Options and results ─────────────────────────────────────────────────────

export interface BuildingOptions {
  culture?: string;
  /** A kind key; undefined is Any. */
  kind?: BuildingKind;
  /** §11: Any limited to these kinds (back-links). */
  kinds?: BuildingKind[];
  era?: RouteEra;
  fantastic?: boolean;
  region?: string;
  setting?: InnSetting;
  tone?: GroupToneChoice;
  people?: GroupPeople;
  /** §9: as one town. */
  series?: boolean;
  count: number;
  seed?: number;
  /** RN §12.6: merged settlement safeguard lists; the built-in building lists when absent. */
  safeguards?: GroupSafeguards;
  vocab?: Vocabulary;
  /** Tests: only this shape. */
  shape?: string;
  /** Settlement kit §4: the settlement's town, neighbours, founder, saint, trades and goods. */
  context?: SettlementContext;
}

export interface BuildingName {
  text: string;
  kind: BuildingKind;
  shape: string;
  source: BuildingSource;
  tones: GroupTone[];
  words: { pool: string; word: string }[];
  /** §9: qualifiers, colours and creatures used, "founder" and "town:{name}". */
  uses: string[];
}

export interface BuildingBatch {
  names: BuildingName[];
  seed: number;
  notices: string[];
}

// ── Drawing ─────────────────────────────────────────────────────────────────

interface Ctx {
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
  kind: BuildingKind;
  themes: Record<string, number>;
  /** §9: the series' town and founder. */
  town?: string;
  founder?: string;
  shape?: BuildingShape;
  /** Settlement kit §4. */
  context?: SettlementContext;
  turn?: TownTurn;
  drawn: Set<GroupTone>;
  words: { pool: string; word: string }[];
  uses: string[];
}

const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
const LIGHT_OR_GRIM = (t: readonly string[] | undefined) => !!t && (t.includes("light") || t.includes("grim"));
const CASTE = new Set(["indian", "west-african"]);
const SF_LISTS = new Set(["star", "greek"]);

/** A shared pool's entries here (region, setting themes, tone; never light or grim for the sensitive cultures). */
function vocabPool(ctx: Ctx, pool: string): [VocabEntry, number][] {
  return boostPool(ctx.context, pool, poolEntries(ctx.vocab, pool, { culture: ctx.culture.key, era: ctx.era, fantastic: ctx.fantastic, region: ctx.region, themes: ctx.themes }))
    .filter(([e]) => !(ctx.culture.sensitive && LIGHT_OR_GRIM(e.t)))
    .map(([e, w]): [VocabEntry, number] => [e, w * toneFactor(e.t ?? [], ctx.tone)])
    .filter(([, w]) => w > 0);
}

function fromPool(ctx: Ctx, pool: string, items: [VocabEntry, number][], use = false): string | undefined {
  const e = pickWeighted(items, ctx.rng);
  if (!e) return undefined;
  for (const t of e.t ?? []) ctx.drawn.add(t);
  ctx.words.push({ pool, word: e.w });
  if (use) ctx.uses.push(`q:${e.w}`);
  return e.w;
}

/** A group-names list word, tone-weighted (sci-fi lists in their space setting). */
function gnWord(ctx: Ctx, list: string, use = false): string | undefined {
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

/** §6: `{bw}`: the kind's building words, limited by the shape. */
const bwItems = (ctx: Ctx) => vocabPool(ctx, `buildingWord:${ctx.kind}`).filter(([e]) => !ctx.shape?.bw || ctx.shape.bw.includes(e.w));

/** §8.3: `{creature}`: GN beasts, birds and heraldic beasts. */
function creature(ctx: Ctx): string | undefined {
  const items = BUILDING_DATA.lists.creatureLists.flatMap((l) =>
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
const ownerNames = (ctx: Ctx) => [...personNames(ctx.culture.key), ...(STREET_DATA.surnameCultures.includes(ctx.culture.key) ? groupListWords("surname", ctx.setting).map(([w]) => w) : [])];

function town(ctx: Ctx): string | undefined {
  // Settlement kit §4: this place, or one of its neighbours.
  const t = ctx.turn ? ctx.turn.next(ctx.rng) : ctx.town ?? (ctx.mode === "placeholders" ? "[place]" : routePlace(ctx.culture.key, ctx.setting, ctx.rng));
  if (t) ctx.uses.push(`town:${t}`);
  return t;
}

function founder(ctx: Ctx): string | undefined {
  ctx.uses.push("founder");
  if (ctx.founder) return ctx.founder;
  if (ctx.mode === "placeholders") return "[founder]";
  const names = personNames(ctx.culture.key);
  return names.length > 0 ? pickOne(names, ctx.rng) : undefined;
}

/** One token (§6); pool words with tokens of their own (Sir {surname}) are rendered in turn. */
function token(ctx: Ctx, name: string): string | undefined {
  const rng = ctx.rng;
  const placeholders = ctx.mode === "placeholders";
  switch (name) {
    case "bw":
      return fromPool(ctx, `buildingWord:${ctx.kind}`, bwItems(ctx));
    case "fixed":
      return fromPool(ctx, `buildingFixed:${ctx.kind}`, vocabPool(ctx, `buildingFixed:${ctx.kind}`));
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
    case "buildingQual":
      return fromPool(ctx, name, vocabPool(ctx, name), true);
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
    case "event":
    case "headland":
      return pickOne(BUILDING_DATA.lists[name], rng);
    case "n":
      return String(1 + Math.floor(rng() * 40));
  }
  const w = fromPool(ctx, name, vocabPool(ctx, name));
  return w?.includes("{") ? renderPattern(ctx, w) : w;
}

/** Renders a shape's pattern (possessives, plurals); undefined when a token has nothing to offer. */
function renderPattern(ctx: Ctx, pattern: string): string | undefined {
  const outer = ctx.turn;
  if (ctx.context) ctx.turn = new TownTurn(ctx.context, BUILDING_SELF.has(pattern));
  try {
    return renderTokens(ctx, pattern);
  } finally {
    ctx.turn = outer;
  }
}

function renderTokens(ctx: Ctx, pattern: string): string | undefined {
  let failed = false;
  const out = pattern.replace(/\{([^}]+)\}/g, (_m, raw: string) => {
    if (failed) return "";
    const [name, mod] = raw.split(":");
    const piece = token(ctx, name);
    if (!piece) {
      failed = true;
      return "";
    }
    if (mod === "poss") return groupPossessive(piece, name === "trade");
    if (mod === "pl") return groupPlural(piece);
    return piece;
  });
  if (failed) return undefined;
  // §8.1: "the {buildingQual} {bw}" drops "the" before a possessive (King's Bridge).
  return out.replace(/^the (\S+'s )/, "$1");
}

// ── Safeguards (§12) ────────────────────────────────────────────────────────

const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
// Streets and inns read buildingName() (§11), so nothing here reads their data before a call.
const BANNED = [...BUILDING_DATA.safeguards.banned, ...BUILDING_DATA.safeguards.religious].map(wordRe);
const CHRISTIAN = BUILDING_DATA.safeguards.christian.map(wordRe);

/** §12.3, §12.5: banned words (GN, SD, IT and the building list) and living religions' buildings. */
export function breaksBuildingWords(text: string): boolean {
  return breaksInnWords(text) || BANNED.some((re) => re.test(text));
}

/** §12.3: christian faith words in a name. */
export const hasChristianBuilding = (text: string) => CHRISTIAN.some((re) => re.test(text));

/** §12.1: names as the block list compares them, without a leading "the". */
const bare = (text: string) => routeNorm(text).replace(/^the /, "");

export function buildingBlockSet(guards: GroupSafeguards = defaultBuildingSafeguards()): Set<string> {
  return new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(bare));
}

/** RN §3.3: a pack word the building safeguards drop. */
export function buildingWordBlocked(word: string, guards?: GroupSafeguards): boolean {
  return buildingBlockSet(guards).has(bare(word)) || breaksBuildingWords(word);
}

// ── Shapes (§8) ─────────────────────────────────────────────────────────────

/** A shape's weight here (0 when it can't be drawn). */
function shapeWeight(ctx: Ctx, s: BuildingShape): number {
  const c = ctx.culture;
  if (s.e && !s.e.includes(ctx.era)) return 0;
  if (!cultureAllowed(s.c, c.key, ctx.era)) return 0;
  if (s.h !== undefined && s.h !== ctx.fantastic) return 0;
  if (c.sensitive && (s.h || LIGHT_OR_GRIM(s.t))) return 0;
  if (s.kinds && !s.kinds.includes(ctx.kind)) return 0;
  if (CASTE.has(c.key) && s.p.includes("{trade")) return 0;
  if (ctx.mode === "invented" && !ctx.founder && s.p.includes("{founder") && personNames(c.key).length === 0) return 0;
  if (ctx.mode === "invented" && s.p.includes("{patron") && personNames(c.key).length === 0) return 0;
  if (ctx.mode === "invented" && s.p.includes("{owner") && ownerNames(ctx).length === 0) return 0;
  if (s.p.includes("{god") && (godNames(c.key).length === 0 || !BUILDING_DATA.lists.godCultures.includes(c.key))) return 0;
  if (/\{holy[}:]/.test(s.p) && !cultureAllowed(["christian"], c.key, ctx.era)) return 0;
  if (s.p.includes("{bw}") && bwItems({ ...ctx, shape: s }).length === 0) return 0;
  // Deities brief §10.1: never for the sensitive cultures; christian cultures only with fantastic, at 3.
  if (s.deity) {
    const hooks = deityHooks();
    if (!hooks || c.sensitive || !hooks.cultureOffered(c.key)) return 0;
    if (ctx.context && !ctx.context.deity) return 0;
    if (hooks.isChristianCulture(c.key, ctx.era)) return ctx.fantastic && s.p.startsWith("Temple") ? DEITY_CHRISTIAN_WEIGHT * toneFactor(s.t ?? [], ctx.tone) : 0;
  }
  let w = s.w;
  if (s.p === "{fixed}") w = vocabPool(ctx, `buildingFixed:${ctx.kind}`).reduce((n, [, x]) => n + x, 0);
  const pool = s.p.match(/^(?:\{\w+\} )?\{(\w+Landmark)\}$/)?.[1];
  if (pool && vocabPool(ctx, pool).length === 0) return 0;
  return w * (s.sx?.[ctx.settingKey] ?? 1) * toneFactor(s.t ?? [], ctx.tone);
}

interface Plan {
  shape: BuildingShape;
  source: BuildingSource;
}

function live(ctx: Ctx, shapes: BuildingShape[], source: BuildingSource, only?: string): [Plan, number][] {
  const out: [Plan, number][] = [];
  for (const s of shapes) {
    if (only && s.p !== only) continue;
    const w = shapeWeight(ctx, s);
    if (w > 0) out.push([{ shape: s, source: s.p === "{fixed}" ? "fixed" : source }, w]);
  }
  return out;
}

/** §8.1–§8.4: the kind's shapes here (§12.4: the sensitive cultures' faith rules). */
function plans(ctx: Ctx, only?: string): [Plan, number][] {
  const d = BUILDING_DATA;
  const k = ctx.kind;
  const culture = (d.cultureShapes[ctx.culture.key] ?? []).filter((s) => s.kind === k);
  if (k === "faith" && d.sensitive.noFaith.includes(ctx.culture.key)) return [];
  const faithOnly = d.sensitive.faithOnly[ctx.culture.key];
  if (k === "faith" && faithOnly) return live(ctx, culture.filter((s) => faithOnly.includes(s.p)), "culture", only);
  return [
    ...live(ctx, d.shared, "shared", only),
    ...live(ctx, d.kindShapes[k], "kind", only),
    ...live(ctx, culture, "culture", only),
    ...live(ctx, d.eraShapes, "era", only),
  ];
}

/** §5.1: in the near future and beyond, 60% of names in every kind are sci-fi shapes. */
function choosePlan(ctx: Ctx, only?: string): Plan | undefined {
  const sf = isFuture(ctx.era) ? live(ctx, BUILDING_DATA.scifi.shapes, "scifi", only) : [];
  const rest = plans(ctx, only);
  if (sf.length > 0 && (rest.length === 0 || ctx.rng() < BUILDING_DATA.scifi.share)) return pickWeighted(sf, ctx.rng);
  return pickWeighted(rest, ctx.rng);
}

// ── Batches ─────────────────────────────────────────────────────────────────

interface Setup {
  rng: () => number;
  culture: RouteCulture;
  era: RouteEra;
  fantastic: boolean;
  setting: GroupSetting;
  settingKey: InnSetting;
  mode: GroupPeople;
  region?: string;
  themes: Record<string, number>;
  options: BuildingOptions;
}

const newCtx = (s: Setup, kind: BuildingKind, extra: Partial<Ctx> = {}): Ctx => ({
  rng: s.rng,
  culture: s.culture,
  era: s.era,
  setting: s.setting,
  settingKey: s.settingKey,
  fantastic: s.fantastic,
  mode: s.mode,
  tone: s.options.tone ?? "any",
  vocab: s.options.vocab ?? BUILT_IN_VOCAB,
  region: s.region,
  kind,
  themes: s.themes,
  context: s.options.context,
  drawn: new Set(),
  words: [],
  uses: [],
  ...extra,
});

/** §5: a kind's weight here: era × setting, 0 where the culture has no shapes for it. */
function kindWeight(s: Setup, kind: BuildingKind): number {
  const k = BUILDING_KINDS.find((x) => x.key === kind)!;
  // Settlement kit §7.1: the position's multipliers.
  const w = k.era[s.era] * (BUILDING_DATA.settingX[s.settingKey][kind] ?? 1) * (s.options.context?.effects?.buildingKindX?.[kind] ?? 1);
  return w > 0 && plans(newCtx(s, kind)).length + (isFuture(s.era) ? 1 : 0) > 0 ? w : 0;
}

/** §5.1–§5.2: the kinds offered for a culture, era and setting, with their weights. */
export function buildingKindWeights(o: Pick<BuildingOptions, "culture" | "era" | "fantastic" | "setting" | "people" | "region">): [BuildingKind, number][] {
  const s = setup({ ...o, count: 0, seed: 1 });
  return BUILDING_KINDS.map((k): [BuildingKind, number] => [k.key, kindWeight(s, k.key)]).filter(([, w]) => w > 0);
}

function setup(options: BuildingOptions, seed = 0): Setup {
  const culture = findRouteCulture(options.culture) ?? findRouteCulture("norman-british")!;
  const era: RouteEra = ROUTE_ERAS.some((e) => e.code === options.era) ? options.era! : "MD";
  const fantastic = !!options.fantastic;
  const settingKey: InnSetting = INN_SETTINGS.some((s) => s.key === options.setting) ? options.setting! : "anywhere";
  const settingInfo = INN_SETTINGS.find((s) => s.key === settingKey)!;
  return {
    rng: mulberry32(seed),
    culture,
    era,
    fantastic,
    setting: routeSetting(era, fantastic),
    settingKey,
    mode: options.people ?? "placeholders",
    region: BRITISH_CULTURES.includes(culture.key) && options.region && options.region !== "all" ? options.region : undefined,
    // §3: the inn settings' themes, magical ×2 when fantastic.
    themes: { ...settingInfo.themes, ...(fantastic ? INN_DATA.fantasticThemes : {}) },
    options,
  };
}

/** §7: a batch of unique building and landmark names. */
export function generateBuildingNames(options: BuildingOptions): BuildingBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const s = setup(options, seed);
  const { rng, culture, era } = s;
  const notices: string[] = [];
  const count = Math.max(0, Math.floor(options.count));
  const allowed = options.kinds ?? BUILDING_KINDS.map((k) => k.key);
  const weights = BUILDING_KINDS.filter((k) => allowed.includes(k.key))
    .map((k): [BuildingKind, number] => [k.key, kindWeight(s, k.key)])
    .filter(([, w]) => w > 0);
  const chosen = options.kind;
  if (chosen && !buildingKindsOffered(era).some((k) => k.key === chosen)) notices.push(`Kind “${chosen}” isn't offered in the ${ROUTE_ERAS.find((e) => e.code === era)!.label} era.`);
  const block = buildingBlockSet(options.safeguards);

  // §9: one town and one founder for the whole series.
  const series = !!options.series;
  const base: Partial<Ctx> = {};
  // Settlement kit §4: the context's founder for every `{founder}`.
  if (options.context) base.founder = options.context.founder;
  if (series && options.context) base.town = options.context.town;
  else if (series) {
    base.town = town(newCtx(s, "defence"));
    base.founder = s.mode === "placeholders" ? "[founder]" : personNames(culture.key).length > 0 ? pickOne(personNames(culture.key), rng) : undefined;
  }

  const acceptable = (text: string): boolean => {
    const counted = countedWords(text);
    if (counted.length === 0 || counted.length > BUILDING_DATA.cap) return false;
    if (repeatsContent(counted)) return false;
    if (block.has(bare(text))) return false;
    if (breaksBuildingWords(text)) return false;
    if (hasChristianBuilding(text) && !cultureAllowed(["christian"], culture.key, era)) return false;
    return true;
  };

  const build = (kind: BuildingKind): BuildingName | undefined => {
    for (let i = 0; i < 20; i++) {
      const ctx = newCtx(s, kind, base);
      const plan = choosePlan(ctx, options.shape);
      if (!plan) return undefined;
      ctx.shape = plan.shape;
      const raw = renderPattern(ctx, plan.shape.p);
      if (!raw) continue;
      const text = innCapitals(raw);
      if (!acceptable(text)) continue;
      const tones = new Set<GroupTone>([...(plan.shape.t ?? []), ...ctx.drawn]);
      return {
        text,
        kind,
        shape: plan.shape.p,
        source: plan.source,
        tones: GROUP_TONES.filter((t) => tones.has(t)),
        words: ctx.words,
        uses: ctx.uses,
      };
    }
    return undefined;
  };

  const seen = new Set<string>();
  const names: BuildingName[] = [];
  const add = (n: BuildingName | undefined): boolean => {
    if (!n || seen.has(n.text.toLowerCase())) return false;
    seen.add(n.text.toLowerCase());
    names.push(n);
    return true;
  };
  const drawKind = (): BuildingKind | undefined => (chosen ? (weights.some(([k]) => k === chosen) ? chosen : undefined) : pickWeighted(weights, rng));

  if (series) {
    const used = new Set<string>();
    let founders = 0;
    // §9: one of each kind offered before any repeats.
    let round: [BuildingKind, number][] = [];
    const nextKind = (): BuildingKind | undefined => {
      if (chosen) return drawKind();
      if (round.length === 0) round = [...weights];
      const k = pickWeighted(round, rng);
      return k;
    };
    for (let idle = 0; idle < 80 && names.length < count; ) {
      const k = nextKind();
      if (!k) break;
      const n = build(k);
      const fresh =
        !!n && !n.uses.some((u) => u.startsWith("q:") && used.has(u)) && (!n.uses.includes("founder") || founders < BUILDING_DATA.series.founderUses);
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
      add(build(k));
    }
  }
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
  return { names, seed, notices };
}

/** §11: one landmark for streets and inns: a building of the given kinds, without a leading "the",
 * of 3 words or fewer; undefined when none fits. */
export function buildingName(o: {
  culture?: string;
  era?: RouteEra;
  fantastic?: boolean;
  region?: string;
  people?: GroupPeople;
  kinds: BuildingKind[];
  rng: () => number;
  safeguards?: GroupSafeguards;
  vocab?: Vocabulary;
}): string | undefined {
  const batch = generateBuildingNames({ ...o, count: 8, seed: Math.floor(o.rng() * 0xffffffff), safeguards: o.safeguards });
  for (const n of batch.names) {
    const text = n.text.replace(/^the /, "");
    if (text.split(" ").length <= 3) return text;
  }
  return undefined;
}

/** §9 tests: the uses that the series keeps apart. */
export const qualifierUses = (n: BuildingName) => n.uses.filter((u) => u.startsWith("q:"));
