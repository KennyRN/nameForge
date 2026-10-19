// Monuments and statues (docs/monuments-and-statues-brief.md): the monumental structures and statues of
// a settlement and its country – crosses, columns, obelisks, arches, statues, standing stones, tombs
// and mounds, memorials, follies and hill figures – for route names' 22 cultures and seven eras. Built
// on the buildings engine's shared machinery (buildings/shared.ts); words come from the shared
// settlement pools (settlement/vocab.ts, with vocabulary packs). Every monument carries a site name,
// the name the places around it take (§8), and streets, squares, districts, inns and the settlement
// kit draw monuments back from here (§11–§12). No Obsidian imports.

import { hasSpaceBlock } from "../space/safeguards";
import monumentData from "../data/monument-names.json";
import { BUILDING_DATA, breaksBuildingWords, hasChristianBuilding } from "../buildings/engine";
import {
  type BaseCtx,
  commonToken,
  fillBatch,
  fromPool,
  gnWord,
  pickOne,
  renderPattern as renderShared,
  shapeAllowed,
  town,
  vocabPool,
  type Renderer,
} from "../buildings/shared";
import {
  type GroupPeople,
  type GroupSafeguards,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  pickWeighted,
  repeatsContent,
  toneFactor,
  type GroupSetting,
} from "../groups/engine";
import { INN_DATA, INN_SETTINGS, innCapitals, type InnSetting } from "../inns/engine";
import { mulberry32 } from "../markov";
import {
  BRITISH_CULTURES,
  countedWords,
  findRouteCulture,
  personNames,
  ROUTE_ERAS,
  routeFigure,
  routeNorm,
  routePlace,
  routeSetting,
  type RouteCulture,
  type RouteEra,
} from "../routes/engine";
import { contextTown, selfPatterns, type SettlementContext } from "../settlement/contextShared";
import { BUILT_IN_VOCAB, cultureAllowed, type Vocabulary } from "../settlement/vocab";
import { monumentNeighbours, STREET_DATA, type NeighbourOptions } from "../streets/engine";

/** §9.1: what's named after a monument lives in the streets engine, which streets, inns and the kit share. */
export { monumentNeighbours };
import { deityHooks } from "../deities/hook";

/** Deities brief §10.1: the christian cultures' deity weight, with fantastic on. */
const DEITY_CHRISTIAN_WEIGHT = 3;

// ── Data ────────────────────────────────────────────────────────────────────

export type MonumentKind = "cross" | "column" | "obelisk" | "arch" | "statue" | "stone" | "tomb" | "memorial" | "folly" | "figure";
export type MonumentSource = "shared" | "kind" | "culture" | "era" | "scifi" | "fixed";

export interface MonumentShape {
  p: string;
  w: number;
  e?: RouteEra[];
  c?: string[];
  t?: GroupTone[];
  h?: boolean;
  /** §7.1, §7.4: the kinds a shared or era shape serves (all when absent). */
  kinds?: MonumentKind[];
  /** §7.3: a culture shape's kind. */
  kind?: MonumentKind;
  /** §7.2: the monument words `{mw}` is limited to (Grave, Cairn, Barrow, Quoit). */
  mw?: string[];
  /** Setting multipliers (Mile Stone by the road ×3). */
  sx?: Partial<Record<InnSetting, number>>;
  /** §8: the site pattern, rendered with the values the name drew. */
  s?: string;
  deity?: boolean;
}

interface MonumentData {
  any: string;
  kinds: { key: MonumentKind; menu: string; plural: string; description: string; era: Record<RouteEra, number> }[];
  settingX: Record<InnSetting, Partial<Record<MonumentKind, number>>>;
  regionX: Partial<Record<MonumentKind, Record<string, number>>>;
  kindCultures: Partial<Record<MonumentKind, string[]>>;
  shared: MonumentShape[];
  kindShapes: Record<MonumentKind, MonumentShape[]>;
  cultureShapes: Record<string, MonumentShape[]>;
  eraShapes: MonumentShape[];
  scifi: { share: number; shapes: MonumentShape[] };
  sensitive: { noKinds: MonumentKind[]; noKindEras: Record<string, Partial<Record<MonumentKind, RouteEra[]>>> };
  series: { founderUses: number };
  cap: number;
  safeguards: { block: string[]; flag: string[]; flagListBlocks: boolean; banned: string[]; honourees: string[] };
}

export const MONUMENT_DATA = monumentData as unknown as MonumentData;
/** Settlement kit §4: the shapes whose first `{town}` is the settlement. */
const MONUMENT_SELF = selfPatterns(monumentData);
export const MONUMENT_KINDS = MONUMENT_DATA.kinds;
export const MONUMENT_ANY = MONUMENT_DATA.any;

const isFuture = (era: RouteEra) => era === "NF" || era === "IS";

/** §5.1: the kinds offered in an era. */
export const monumentKindsOffered = (era: RouteEra) => MONUMENT_KINDS.filter((k) => k.era[era] > 0);

/** §13.1–§13.2: the built-in lists: the monument block list plus buildings' (BL §12.1). */
export const defaultMonumentSafeguards = (): GroupSafeguards => ({
  block: [...MONUMENT_DATA.safeguards.block, ...BUILDING_DATA.safeguards.block],
  flag: MONUMENT_DATA.safeguards.flag,
  flagListBlocks: MONUMENT_DATA.safeguards.flagListBlocks,
});

// ── Options and results ─────────────────────────────────────────────────────

export interface MonumentOptions {
  culture?: string;
  /** A kind key; undefined is Any. */
  kind?: MonumentKind;
  /** §11: Any limited to these kinds (back-links). */
  kinds?: MonumentKind[];
  era?: RouteEra;
  fantastic?: boolean;
  region?: string;
  setting?: InnSetting;
  tone?: GroupToneChoice;
  people?: GroupPeople;
  /** §9: add what's named after each monument. */
  nearby?: boolean;
  /** §14.2: as one town. */
  series?: boolean;
  count: number;
  seed?: number;
  /** RN §12.6: merged settlement safeguard lists; the built-in monument lists when absent. */
  safeguards?: GroupSafeguards;
  /** §13.3, §13.6: honourees a safeguard pack adds to the built-in list. */
  honourees?: string[];
  /** §9: the street and inn safeguards the nearby names pass. */
  streetSafeguards?: GroupSafeguards;
  innSafeguards?: GroupSafeguards;
  /** §9: no bare district for a village. */
  village?: boolean;
  vocab?: Vocabulary;
  /** Tests: only this shape. */
  shape?: string;
  /** Settlement kit §4: the settlement's town, neighbours, founder, saint, trades and goods. */
  context?: SettlementContext;
}

export interface MonumentName {
  text: string;
  kind: MonumentKind;
  shape: string;
  source: MonumentSource;
  tones: GroupTone[];
  words: { pool: string; word: string }[];
  /** §14.2: qualifiers, colours, creatures, events and honourees used, "founder" and "town:{name}". */
  uses: string[];
  /** §8: the name the places around the monument take. */
  site: string;
  /** §8: whether the site can stand alone as a district or an inn. */
  districtWorthy: boolean;
  /** §9: what's named after it (empty unless asked for). */
  nearby: string[];
}

export interface MonumentBatch {
  names: MonumentName[];
  seed: number;
  notices: string[];
}

// ── Drawing ─────────────────────────────────────────────────────────────────

interface Ctx extends BaseCtx {
  kind: MonumentKind;
  shape?: MonumentShape;
  honourees: RegExp[];
  /** §8: each token's plain value, for the site pattern. */
  values: Record<string, string>;
}

/** The tokens that are one pool each (§6). */
const TOKEN_POOLS: Record<string, string> = {
  event: "monumentEvent",
  fallen: "monumentFallen",
  virtue: "monumentVirtue",
  material: "statueMaterial",
  stoneFolk: "stoneFolk",
  figureColour: "figureColour",
  figureBeast: "figureBeast",
  sfmw: "sfMonumentWord",
};

/** §6: `{mw}`: the kind's monument words, limited by the shape. */
function mwItems(ctx: Ctx) {
  const pool = `monumentWord:${ctx.kind}`;
  if (!ctx.vocab.pools[pool]) return [];
  return vocabPool(ctx, pool).filter(([e]) => !ctx.shape?.mw || ctx.shape.mw.includes(e.w));
}

const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const hasHonouree = (res: RegExp[], text: string) => res.some((re) => re.test(text));

/** §6: an honouree (`{monarch}`, `{hero}`, `{benefactor}`): redrawn when it is a real one (§13.3). */
function honouree(ctx: Ctx, name: string): string | undefined {
  if (ctx.mode === "placeholders") return `[${name}]`;
  const culture = ctx.culture.key;
  const names = personNames(culture);
  for (let i = 0; i < 10; i++) {
    let v: string | undefined;
    if (name === "monarch") {
      const rank = routeFigure(culture, ctx.setting, ctx.rng)?.replace(/^the /i, "");
      if (!rank || names.length === 0) return undefined;
      v = `${rank} ${pickOne(names, ctx.rng)}`;
    } else if (STREET_DATA.surnameCultures.includes(culture)) v = gnWord(ctx, "surname");
    else if (names.length > 0) v = pickOne(names, ctx.rng);
    if (!v) return undefined;
    if (hasHonouree(ctx.honourees, v)) continue;
    // §14.2: no honouree twice in a series.
    ctx.uses.push(`h:${v}`);
    return v;
  }
  return undefined;
}

/** One token (§6); pool words with tokens of their own (Sir {surname}) are rendered in turn. */
function token(ctx: Ctx, name: string): string | undefined {
  switch (name) {
    case "mw":
      return fromPool(ctx, `monumentWord:${ctx.kind}`, mwItems(ctx));
    case "fixed":
      return ctx.vocab.pools[`monumentFixed:${ctx.kind}`] ? fromPool(ctx, `monumentFixed:${ctx.kind}`, vocabPool(ctx, `monumentFixed:${ctx.kind}`)) : undefined;
    case "monumentQual":
      return fromPool(ctx, name, vocabPool(ctx, name), true);
    case "event":
      return fromPool(ctx, TOKEN_POOLS.event, vocabPool(ctx, TOKEN_POOLS.event), true);
    case "monarch":
    case "hero":
    case "benefactor":
      return honouree(ctx, name);
    case "battle": {
      if (ctx.mode === "placeholders") return "[battle]";
      // Settlement kit §4: a battle fought at one of the neighbours.
      return ctx.context ? contextTown(ctx.context, false, ctx.rng) : routePlace(ctx.culture.key, ctx.setting, ctx.rng);
    }
    case "bird":
      return gnWord(ctx, "bird");
  }
  const pool = TOKEN_POOLS[name];
  if (pool) return fromPool(ctx, pool, vocabPool(ctx, pool));
  return commonToken(RENDERER, ctx, name);
}

const RENDERER: Renderer<Ctx> = { token, self: MONUMENT_SELF };

// ── Safeguards (§13) ────────────────────────────────────────────────────────

let bannedRes: RegExp[] | undefined;
const banned = () => (bannedRes ??= MONUMENT_DATA.safeguards.banned.map(wordRe));
let honoureeRes: RegExp[] | undefined;
const builtInHonourees = () => (honoureeRes ??= MONUMENT_DATA.safeguards.honourees.map(wordRe));

/** §13.3: the real honourees an invented one is redrawn against: the built-in list and a pack's. */
export const monumentHonourees = (extra: readonly string[] = []): RegExp[] => (extra.length === 0 ? builtInHonourees() : [...builtInHonourees(), ...extra.map(wordRe)]);

/** §13.5: banned words (buildings', so GN, SD, IT and the religious list too, and the monument list). */
export function breaksMonumentWords(text: string): boolean {
  return breaksBuildingWords(text) || banned().some((re) => re.test(text));
}

/** §13.6: the honourees a settlement safeguard pack adds: its "## Honourees" section's bullets. */
export function honoureesFromPack(content: string): string[] {
  const out: string[] = [];
  let inSection = false;
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    const heading = line.match(/^##\s+(.+?)\s*#*$/);
    if (heading) {
      inSection = heading[1].toLowerCase() === "honourees";
      continue;
    }
    const bullet = line.match(/^[-*+]\s+(.+)$/);
    if (bullet && inSection) out.push(...bullet[1].split(",").map((w) => w.trim()).filter(Boolean));
  }
  return out;
}

/** §13.1: names as the block list compares them, without a leading "the". */
const bare = (text: string) => routeNorm(text).replace(/^the /, "");

export function monumentBlockSet(guards: GroupSafeguards = defaultMonumentSafeguards()): Set<string> {
  return new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(bare));
}

/** RN §3.3: a pack word the monument safeguards drop. */
export function monumentWordBlocked(word: string, guards?: GroupSafeguards): boolean {
  return monumentBlockSet(guards).has(bare(word)) || breaksMonumentWords(word);
}

// ── Shapes (§7) ─────────────────────────────────────────────────────────────

/** A shape's weight here (0 when it can't be drawn). */
function shapeWeight(ctx: Ctx, s: MonumentShape): number {
  const c = ctx.culture;
  if (!shapeAllowed(ctx, s)) return 0;
  if (s.kinds && !s.kinds.includes(ctx.kind)) return 0;
  // §6: an invented honouree needs the culture's names (or surnames, for `{hero}` and `{benefactor}`).
  if (ctx.mode === "invented") {
    if (/\{monarch[}:]/.test(s.p) && personNames(c.key).length === 0) return 0;
    if (/\{(hero|benefactor)[}:]/.test(s.p) && personNames(c.key).length === 0 && !STREET_DATA.surnameCultures.includes(c.key)) return 0;
  }
  if (s.p.includes("{mw}") && mwItems({ ...ctx, shape: s }).length === 0) return 0;
  // Deities brief §10.1: never for the sensitive cultures; christian cultures only with fantastic, at 3.
  if (s.deity) {
    const hooks = deityHooks();
    if (!hooks || c.sensitive || !hooks.cultureOffered(c.key)) return 0;
    if (ctx.context && !ctx.context.deity) return 0;
    if (hooks.isChristianCulture(c.key, ctx.era)) return ctx.fantastic ? DEITY_CHRISTIAN_WEIGHT * toneFactor(s.t ?? [], ctx.tone) : 0;
  }
  let w = s.w;
  if (s.p === "{fixed}") w = ctx.vocab.pools[`monumentFixed:${ctx.kind}`] ? vocabPool(ctx, `monumentFixed:${ctx.kind}`).reduce((n, [, x]) => n + x, 0) : 0;
  return w * (s.sx?.[ctx.settingKey] ?? 1) * toneFactor(s.t ?? [], ctx.tone);
}

interface Plan {
  shape: MonumentShape;
  source: MonumentSource;
}

function live(ctx: Ctx, shapes: MonumentShape[], source: MonumentSource, only?: string): [Plan, number][] {
  const out: [Plan, number][] = [];
  for (const s of shapes) {
    if (only && s.p !== only) continue;
    const w = shapeWeight(ctx, s);
    if (w > 0) out.push([{ shape: s, source: s.p === "{fixed}" ? "fixed" : source }, w]);
  }
  return out;
}

/** §7.1–§7.4: the kind's shapes here. */
function plans(ctx: Ctx, only?: string): [Plan, number][] {
  const d = MONUMENT_DATA;
  const k = ctx.kind;
  const culture = (d.cultureShapes[ctx.culture.key] ?? []).filter((s) => s.kind === k);
  return [...live(ctx, d.shared, "shared", only), ...live(ctx, d.kindShapes[k] ?? [], "kind", only), ...live(ctx, culture, "culture", only), ...live(ctx, d.eraShapes, "era", only)];
}

/** §5.1: in the near future and beyond, 50% of names in any kind that has sci-fi shapes are sci-fi shapes. */
function choosePlan(ctx: Ctx, only?: string): Plan | undefined {
  const sf = isFuture(ctx.era) ? live(ctx, MONUMENT_DATA.scifi.shapes, "scifi", only) : [];
  const rest = plans(ctx, only);
  if (sf.length > 0 && (rest.length === 0 || ctx.rng() < MONUMENT_DATA.scifi.share)) return pickWeighted(sf, ctx.rng);
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
  honourees: RegExp[];
  options: MonumentOptions;
}

const newCtx = (s: Setup, kind: MonumentKind, extra: Partial<Ctx> = {}): Ctx => ({
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
  honourees: s.honourees,
  values: {},
  drawn: new Set(),
  words: [],
  uses: [],
  ...extra,
});

/** §5: a kind's weight here: era × setting × region, 0 where the culture has no shapes for it. */
function kindWeight(s: Setup, kind: MonumentKind): number {
  const d = MONUMENT_DATA;
  const k = MONUMENT_KINDS.find((x) => x.key === kind)!;
  const key = s.culture.key;
  const cultures = d.kindCultures[kind];
  if (cultures && !cultureAllowed(cultures, key, s.era)) return 0;
  // §13.4: the sensitive cultures have no stone, tomb or figure; Arabic and Persian no statue in MD–ST.
  if (s.culture.sensitive && d.sensitive.noKinds.includes(kind)) return 0;
  if (d.sensitive.noKindEras[key]?.[kind]?.includes(s.era)) return 0;
  // Settlement kit §7.1: the position's multipliers.
  const w = k.era[s.era] * (d.settingX[s.settingKey][kind] ?? 1) * (s.region ? d.regionX[kind]?.[s.region] ?? 1 : 1) * (s.options.context?.effects?.monumentKindX?.[kind] ?? 1);
  return w > 0 && plans(newCtx(s, kind)).length + (isFuture(s.era) ? live(newCtx(s, kind), d.scifi.shapes, "scifi").length : 0) > 0 ? w : 0;
}

/** §5.1–§5.3: the kinds offered for a culture, era and setting, with their weights. */
export function monumentKindWeights(o: Pick<MonumentOptions, "culture" | "era" | "fantastic" | "setting" | "people" | "region">): [MonumentKind, number][] {
  const s = setup({ ...o, count: 0, seed: 1 });
  return MONUMENT_KINDS.map((k): [MonumentKind, number] => [k.key, kindWeight(s, k.key)]).filter(([, w]) => w > 0);
}

function setup(options: MonumentOptions, seed = 0): Setup {
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
    // Buildings brief §3: the inn settings' themes, magical ×2 when fantastic.
    themes: { ...settingInfo.themes, ...(fantastic ? INN_DATA.fantasticThemes : {}) },
    honourees: monumentHonourees(options.honourees),
    options,
  };
}

/** §8: the site pattern rendered with the values the name drew; a shape without `s` gives the name itself. */
function siteOf(shape: MonumentShape, text: string, values: Record<string, string>): string {
  let site: string | undefined;
  if (shape.s) {
    let missing = false;
    site = shape.s.replace(/\{([^}]+)\}/g, (_m, name: string) => {
      if (values[name] === undefined) missing = true;
      return values[name] ?? "";
    });
    if (missing) site = undefined;
  }
  return innCapitals(site ?? text).replace(/^the /, "");
}

/** §4–§9: a batch of unique monument and statue names. */
export function generateMonumentNames(options: MonumentOptions): MonumentBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const s = setup(options, seed);
  const { rng, culture, era } = s;
  const notices: string[] = [];
  const count = Math.max(0, Math.floor(options.count));
  const allowed = options.kinds ?? MONUMENT_KINDS.map((k) => k.key);
  const weights = MONUMENT_KINDS.filter((k) => allowed.includes(k.key))
    .map((k): [MonumentKind, number] => [k.key, kindWeight(s, k.key)])
    .filter(([, w]) => w > 0);
  const chosen = options.kind;
  if (chosen && !monumentKindsOffered(era).some((k) => k.key === chosen)) notices.push(`Kind “${chosen}” isn't offered in the ${ROUTE_ERAS.find((e) => e.code === era)!.label} era.`);
  const block = monumentBlockSet(options.safeguards);

  // §14.2: one town and one founder for the whole series.
  const series = !!options.series;
  const base: Partial<Ctx> = {};
  // Settlement kit §4: the context's founder for every `{founder}`.
  if (options.context) base.founder = options.context.founder;
  if (series && options.context) base.town = options.context.town;
  else if (series) {
    base.town = town(newCtx(s, "cross"));
    base.founder = s.mode === "placeholders" ? "[founder]" : personNames(culture.key).length > 0 ? pickOne(personNames(culture.key), rng) : undefined;
  }

  const acceptable = (text: string): boolean => {
    const counted = countedWords(text);
    if (counted.length === 0 || counted.length > MONUMENT_DATA.cap) return false;
    if (repeatsContent(counted)) return false;
    if (block.has(bare(text))) return false;
    if (breaksMonumentWords(text)) return false;
    // §13.3: no real honouree, whichever token it came through.
    if (hasHonouree(s.honourees, text)) return false;
    if (isFuture(era) && hasSpaceBlock(text)) return false;
    if (hasChristianBuilding(text) && !cultureAllowed(["christian"], culture.key, era)) return false;
    return true;
  };

  const build = (kind: MonumentKind): MonumentName | undefined => {
    for (let i = 0; i < 20; i++) {
      const ctx = newCtx(s, kind, base);
      const plan = choosePlan(ctx, options.shape);
      if (!plan) return undefined;
      ctx.shape = plan.shape;
      const raw = renderShared(RENDERER, ctx, plan.shape.p, ctx.values);
      if (!raw) continue;
      const text = innCapitals(raw);
      if (!acceptable(text)) continue;
      const site = siteOf(plan.shape, text, ctx.values);
      const tones = new Set<GroupTone>([...(plan.shape.t ?? []), ...ctx.drawn]);
      return {
        text,
        kind,
        shape: plan.shape.p,
        source: plan.source,
        tones: GROUP_TONES.filter((t) => tones.has(t)),
        words: ctx.words,
        uses: ctx.uses,
        site,
        // §8: only a site made from the monument's own name can stand alone.
        districtWorthy: !plan.shape.s && !/ of /.test(text) && site.split(" ").length <= 3,
        nearby: [],
      };
    }
    return undefined;
  };

  const names = fillBatch<MonumentKind, MonumentName>({
    rng,
    count,
    series,
    chosen,
    weights,
    build,
    founderUses: MONUMENT_DATA.series.founderUses,
    keyed: ["q:", "h:"],
  });
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);

  // §9: what's named after each, drawn on a stream of its own so the names stay the same with it on or off.
  if (options.nearby) {
    const nrng = mulberry32((seed ^ 0x9e3779b9) >>> 0);
    for (const n of names) n.nearby = monumentNeighbours(n.site, n.districtWorthy, neighbourOptions(options, s, nrng));
  }
  return { names, seed, notices };
}

function neighbourOptions(o: MonumentOptions, s: Setup, rng: () => number): NeighbourOptions {
  return {
    culture: s.culture.key,
    era: s.era,
    fantastic: s.fantastic,
    region: s.region,
    setting: s.settingKey,
    people: s.mode,
    village: o.village,
    rng,
    safeguards: o.streetSafeguards,
    innSafeguards: o.innSafeguards,
    monumentSafeguards: o.safeguards,
    vocab: o.vocab,
  };
}

/** §11: one monument for streets, squares, districts and inns: its text (with any leading "the") of 3
 * words or fewer without it, and its site; undefined when none fits. */
export function monumentName(o: {
  culture?: string;
  era?: RouteEra;
  fantastic?: boolean;
  region?: string;
  people?: GroupPeople;
  kinds?: MonumentKind[];
  rng: () => number;
  safeguards?: GroupSafeguards;
  honourees?: string[];
  vocab?: Vocabulary;
}): { text: string; site: string; districtWorthy: boolean } | undefined {
  const batch = generateMonumentNames({ ...o, count: 8, seed: Math.floor(o.rng() * 0xffffffff) });
  for (const n of batch.names) {
    if (n.text.replace(/^the /, "").split(" ").length <= 3) return { text: n.text, site: n.site, districtWorthy: n.districtWorthy };
  }
  return undefined;
}

/** §14.2 tests: the uses that the series keeps apart. */
export const monumentUses = (n: MonumentName) => n.uses.filter((u) => u.startsWith("q:") || u.startsWith("h:"));
