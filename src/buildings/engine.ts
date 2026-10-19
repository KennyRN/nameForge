// Buildings and landmarks (docs/buildings-and-landmarks-brief.md): the named buildings and
// landmarks of a settlement and its country – defences, halls, houses of faith, civic buildings,
// crossings, wells, works, schools, gaols and lights – for route names' 22 cultures and
// seven eras. Words come from the shared settlement pools (settlement/vocab.ts, with vocabulary
// packs); places, people, gods and figures come from the route engine, creatures and colours from
// group names, dynasties from realms, and the settings and rendering from inns. No Obsidian imports.

import { hasSpaceBlock } from "../space/safeguards";
import buildingData from "../data/building-names.json";
import {
  type GroupPeople,
  type GroupSafeguards,
  type GroupSetting,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  pickWeighted,
  repeatsContent,
  toneFactor,
} from "../groups/engine";
import { breaksInnWords, INN_DATA, INN_SETTINGS, innCapitals, type InnSetting } from "../inns/engine";
import { mulberry32 } from "../markov";
import {
  BRITISH_CULTURES,
  countedWords,
  findRouteCulture,
  personNames,
  ROUTE_ERAS,
  routeNorm,
  routeSetting,
  type RouteCulture,
  type RouteEra,
} from "../routes/engine";
import { selfPatterns, type SettlementContext } from "../settlement/contextShared";
import { type BaseCtx, commonToken, fillBatch, fromPool, pickOne, renderPattern as renderShared, shapeAllowed, town, vocabPool, type Renderer } from "./shared";
import { deityHooks } from "../deities/hook";

/** Deities brief §10.1: the christian cultures' temple weight, with fantastic on. */
const DEITY_CHRISTIAN_WEIGHT = 3;
import { BUILT_IN_VOCAB, cultureAllowed, type Vocabulary } from "../settlement/vocab";

// ── Data ────────────────────────────────────────────────────────────────────

export type BuildingKind = "defence" | "residence" | "faith" | "civic" | "crossing" | "water" | "works" | "learning" | "confinement" | "maritime";
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

interface Ctx extends BaseCtx {
  kind: BuildingKind;
  shape?: BuildingShape;
}

/** §6: `{bw}`: the kind's building words, limited by the shape. */
const bwItems = (ctx: Ctx) => vocabPool(ctx, `buildingWord:${ctx.kind}`).filter(([e]) => !ctx.shape?.bw || ctx.shape.bw.includes(e.w));

/** One token (§6); pool words with tokens of their own (Sir {surname}) are rendered in turn. */
function token(ctx: Ctx, name: string): string | undefined {
  switch (name) {
    case "bw":
      return fromPool(ctx, `buildingWord:${ctx.kind}`, bwItems(ctx));
    case "fixed":
      return fromPool(ctx, `buildingFixed:${ctx.kind}`, vocabPool(ctx, `buildingFixed:${ctx.kind}`));
    case "buildingQual":
      return fromPool(ctx, name, vocabPool(ctx, name), true);
    case "event":
      return pickOne(BUILDING_DATA.lists.event, ctx.rng);
  }
  return commonToken(RENDERER, ctx, name);
}

const RENDERER: Renderer<Ctx> = { token, self: BUILDING_SELF };
const renderPattern = (ctx: Ctx, pattern: string) => renderShared(RENDERER, ctx, pattern);

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
  if (!shapeAllowed(ctx, s)) return 0;
  if (s.kinds && !s.kinds.includes(ctx.kind)) return 0;
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
    if (isFuture(era) && hasSpaceBlock(text)) return false;
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

  const names = fillBatch<BuildingKind, BuildingName>({
    rng,
    count,
    series,
    chosen,
    weights,
    build,
    founderUses: BUILDING_DATA.series.founderUses,
    keyed: ["q:"],
  });
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
