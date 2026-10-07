// Place-name shape generator (part 1, plus regional weighting).
//
// Produces the semantic *shape* of a place name — e.g. "[domestic animal] + [river crossing]" —
// never a name. All data lives in ./data/place-shapes.json (a portable transcription of the
// reference document) and ./data/place-shape-regions.json (regional multipliers); this module
// holds only the weights and the generation rules. It has no Obsidian dependency, so it runs
// (and is tested) under plain Node.

import data from "./data/place-shapes.json";
import regionData from "./data/place-shape-regions.json";
import wordData from "./data/place-shape-words.json";
import { mulberry32 } from "./markov";

// ── Weights and probabilities ───────────────────────────────────────────────

export const PLACE_SHAPE_WEIGHTS = {
  /** Relative weight of each affinity tier when picking a slot category for a generic. */
  tier: {
    dominant: 25,
    common: 10,
    occasional: 4,
    rare: 1,
    unlikely: 0,
  },
  /** Chance a simplex (Empty slot) shape is the plural simplex. */
  pluralSimplexChance: 0.15,
  /** Chance a personal-name shape becomes the folk or associative connective. */
  connectiveChance: 0.15,
  /** Share of connectives that are folk rather than associative. */
  folkConnectiveShare: 0.5,
  /** Chance a landscape shape gains a stacked Farms-and-estates generic. */
  stackedGenericChance: 0.05,
  /** Chance any shape gains an affix. */
  affixChance: 0.15,
  /** Feature filter "Settlement": share of landscape groups drawn (transferred feature names, §2.4). */
  landscapeShareSettlement: 0.35,
  /** Relative weight of each word order for two-part compounds. */
  wordOrder: {
    germanic: 1,
    "celtic-direct": 1,
    "celtic-linked": 1,
  },
} as const;

/** Generics that already mean "the people of X", so a connective or stacking would repeat it. */
const FOLK_GROUP_GENERICS = new Set(["folk-group-territory", "folk-group-homestead"]);
const STACK_SOURCE_GROUP = "settlement-farms-and-estates";
const EMPTY_SLOT = "empty-slot";
const PERSONAL_NAME = "personal-name";

/** How generics are written: their bracketed Meaning (part 1) or a plain English word (part 1a). */
export type ShapeWording = "meaning" | "plain";

/** The labels recorded in generation history, one per generator. */
export const PLACE_SHAPES_HISTORY_NAME = "place name shapes";
export const GENERIC_PLACE_NAMES_HISTORY_NAME = "generic place name generator";

/** History label for a batch: the region is part of what reproduces it, so it travels with the seed. */
export function placeShapesHistoryLabel(regionCode?: string, wording: ShapeWording = "meaning"): string {
  const name = wording === "plain" ? GENERIC_PLACE_NAMES_HISTORY_NAME : PLACE_SHAPES_HISTORY_NAME;
  const region = regionCode ? findRegion(regionCode) : undefined;
  return region ? `${name} · ${region.label}` : name;
}

/** Salt for the secondary RNG used only by plain-word choices, so the main stream is never touched. */
const PLAIN_WORDING_SALT = 0x1a1a1a1a;

// ── Data types ──────────────────────────────────────────────────────────────

export type Tier = keyof typeof PLACE_SHAPE_WEIGHTS.tier;
export type WordOrder = keyof typeof PLACE_SHAPE_WEIGHTS.wordOrder;
export type ShapeStructure =
  | "two-part-compound"
  | "simplex"
  | "plural-simplex"
  | "folk-connective"
  | "associative-connective"
  | "stacked-generic";

export interface ShapeProfile {
  dominant?: string[];
  common: string[];
  occasional: string[];
  rare: string[];
  unlikely: string[];
  examples?: Record<string, string>;
}

export interface ShapeOverride {
  generics: string[];
  note: string;
  /** Moves the named categories to a tier, leaving the rest of the profile alone. */
  set?: Record<string, Tier>;
  /** Replaces the whole profile for these generics. */
  replace?: ShapeProfile;
}

export interface ShapeGeneric {
  id: string;
  meaning: string;
  sense: string;
  sourceElements: string[];
}

export interface ShapeGroup {
  id: string;
  section: string;
  side: "settlement" | "landscape";
  label: string;
  generics: ShapeGeneric[];
  profile: ShapeProfile | null;
  overrides: ShapeOverride[];
  notes: string[];
}

export interface ShapeCategory {
  id: string;
  label: string;
  family: string;
  covers: string;
  examples: string[];
}

export interface AffixForm {
  text: string;
  position: "before" | "after";
  /** Rendered in brackets after the affix word, e.g. "upon [river or stream name]". */
  slotCategory?: string;
}

export interface AffixType {
  id: string;
  label: string;
  slotCategories: string[];
  examples: string[];
  forms: AffixForm[];
  formsPending?: boolean;
}

export interface PlaceShapeData {
  version: number;
  tiers: Tier[];
  categories: ShapeCategory[];
  groups: ShapeGroup[];
  affixes: AffixType[];
}

export const PLACE_SHAPE_DATA = data as unknown as PlaceShapeData;

// ── Profiles ────────────────────────────────────────────────────────────────

const TIER_ORDER: Tier[] = ["dominant", "common", "occasional", "rare", "unlikely"];

/** Category → tier for one generic: the group profile, then its overrides. Unlisted = unlikely. */
export function resolveProfile(
  group: ShapeGroup,
  genericId: string,
  source: PlaceShapeData = PLACE_SHAPE_DATA,
): Map<string, Tier> {
  const tiers = new Map<string, Tier>(source.categories.map((c) => [c.id, "unlikely" as Tier]));
  const apply = (profile: ShapeProfile) => {
    for (const tier of TIER_ORDER) {
      for (const id of profile[tier] ?? []) tiers.set(id, tier);
    }
  };

  if (group.profile) apply(group.profile);
  for (const override of group.overrides) {
    if (!override.generics.includes(genericId)) continue;
    if (override.replace) {
      for (const id of tiers.keys()) tiers.set(id, "unlikely");
      apply(override.replace);
    }
    for (const [id, tier] of Object.entries(override.set ?? {})) tiers.set(id, tier);
  }
  return tiers;
}

// ── Regions ─────────────────────────────────────────────────────────────────

export interface PlaceShapeRegion {
  code: string;
  label: string;
  /** Historic counties — documentation and tooltips only. */
  counties: string;
}

export interface PlaceShapeRegionData {
  version: number;
  regions: PlaceShapeRegion[];
  groupMultipliers: Record<string, Record<string, number>>;
  tiedMultipliers: { home: number; present: number; other: number };
  tiedGenerics: { generic: string; home: string[]; present: string[] }[];
  categoryMultipliers: Record<string, Record<string, number>>;
  wordOrder: Record<string, Record<WordOrder, number>>;
  structure: Record<
    string,
    { connectiveChance: number; stackedGenericChance: number; affixChance: number; landscapeShareSettlement: number }
  >;
  connectiveSplit: { folk: number; associative: number };
  affixBaseline: Record<string, number>;
  affixMultipliers: Record<string, Record<string, number>>;
}

export const PLACE_SHAPE_REGION_DATA = regionData as unknown as PlaceShapeRegionData;

/** The regions in display order; "All Britain" (no region) is implied and comes first. */
export const PLACE_SHAPE_REGIONS: readonly PlaceShapeRegion[] = PLACE_SHAPE_REGION_DATA.regions;

function findRegion(code: string): PlaceShapeRegion | undefined {
  return PLACE_SHAPE_REGIONS.find((r) => r.code === code);
}

/** Everything a region changes, resolved once per batch. */
interface RegionWeighting {
  groupMultiplier: Record<string, number>;
  genericMultiplier: Map<string, number>;
  categoryMultiplier: Record<string, number>;
  wordOrder: [WordOrder, number][];
  connectiveChance: number;
  folkConnectiveShare: number;
  stackedGenericChance: number;
  affixChance: number;
  affixMultiplier: Record<string, number>;
  landscapeShareSettlement: number;
}

function resolveRegion(code: string, regions: PlaceShapeRegionData): RegionWeighting {
  if (!regions.regions.some((r) => r.code === code)) throw new Error(`Unknown place-shape region: ${code}`);
  const genericMultiplier = new Map<string, number>();
  for (const tied of regions.tiedGenerics) {
    const m = tied.home.includes(code)
      ? regions.tiedMultipliers.home
      : tied.present.includes(code)
        ? regions.tiedMultipliers.present
        : regions.tiedMultipliers.other;
    genericMultiplier.set(tied.generic, m);
  }
  const structure = regions.structure[code];
  return {
    groupMultiplier: regions.groupMultipliers[code] ?? {},
    genericMultiplier,
    categoryMultiplier: regions.categoryMultipliers[code] ?? {},
    wordOrder: (Object.entries(regions.wordOrder[code]) as [WordOrder, number][]).filter(([, w]) => w > 0),
    connectiveChance: structure.connectiveChance,
    folkConnectiveShare: regions.connectiveSplit.folk,
    stackedGenericChance: structure.stackedGenericChance,
    affixChance: structure.affixChance,
    affixMultiplier: regions.affixMultipliers[code] ?? {},
    landscapeShareSettlement: structure.landscapeShareSettlement,
  };
}

// ── Generation ──────────────────────────────────────────────────────────────

export interface PlaceShape {
  groupId: string;
  genericId: string;
  categoryId: string;
  structure: ShapeStructure;
  /** Only meaningful for two-part compounds; other structures are always Germanic. */
  wordOrder: WordOrder;
  stackedGenericId?: string;
  affix?: { typeId: string; form: AffixForm };
}

export interface PlaceShapeGenerateOptions {
  count: number;
  /** Same seed = identical batch. Omit for a random seed; the seed used is always returned. */
  seed?: number;
  /** Region code (e.g. "NTH"). Omit for All Britain, which is exactly the part 1 behaviour. */
  region?: string;
  /** Restricts which generic groups are eligible. Not exposed in the UI; used by tests. */
  groupIds?: string[];
  /**
   * Feature filter (recipes): "any" (default), "settlement" (settlement groups, with landscape
   * groups drawn at the landscape share), "landscape", or a single group id.
   */
  feature?: string;
  /** Categories set to `ignore` by a recipe: weight 0 at the shape stage. */
  excludedCategories?: string[];
  /** Output wording; shapes are chosen identically either way. Defaults to "meaning". */
  wording?: ShapeWording;
}

export interface PlaceShapeGenerateResult {
  shapes: PlaceShape[];
  names: string[];
  seed: number;
  /** The main RNG's next draw after the batch — lets tests confirm wording never touches it. */
  mainRngNext: number;
}

export function pickUniform<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

export function pickWeighted<T>(entries: readonly [T, number][], rng: () => number): T {
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = rng() * total;
  for (const [item, weight] of entries) {
    r -= weight;
    if (r < 0) return item;
  }
  return entries[entries.length - 1][0];
}

/**
 * One shape per `next()` call. Without a region every choice makes exactly the part 1 RNG calls
 * (uniform group and generic, the part 1 constants), so All Britain reproduces part 1 batches.
 */
class PlaceShapeGenerator {
  private readonly profiles = new Map<string, [string, number][]>();
  private readonly groups: ShapeGroup[];
  private readonly groupWeights: [ShapeGroup, number][] = [];
  private readonly genericWeights = new Map<string, [ShapeGeneric, number][]>();
  private readonly stackGenerics: string[];
  private readonly affixWeights: [AffixType, number][];
  private readonly excluded: Set<string>;
  /** Feature filter "settlement": the two sides and the landscape share. */
  private readonly sides: { settlement: ShapeGroup[]; landscape: ShapeGroup[]; landscapeShare: number } | null = null;

  constructor(
    private readonly source: PlaceShapeData,
    private readonly region: RegionWeighting | null,
    filters: { groupIds?: string[]; feature?: string; excludedCategories?: string[] } = {},
    regions: PlaceShapeRegionData = PLACE_SHAPE_REGION_DATA,
  ) {
    this.excluded = new Set(filters.excludedCategories ?? []);
    let groups = filters.groupIds ? source.groups.filter((g) => filters.groupIds!.includes(g.id)) : source.groups;
    const feature = filters.feature && filters.feature !== "any" ? filters.feature : undefined;
    if (feature === "landscape") groups = groups.filter((g) => g.side === "landscape");
    else if (feature && feature !== "settlement") groups = groups.filter((g) => g.id === feature);
    if (this.excluded.size > 0) {
      // Generics whose every pairing is ignored drop out, and so do groups left empty.
      groups = groups
        .map((g) => ({ ...g, generics: g.generics.filter((x) => this.categoryWeights(g, x.id).length > 0) }))
        .filter((g) => g.generics.length > 0);
    }
    this.groups = groups;
    if (this.groups.length === 0) throw new Error("No eligible place-shape groups");
    if (feature === "settlement") {
      this.sides = {
        settlement: groups.filter((g) => g.side === "settlement"),
        landscape: groups.filter((g) => g.side === "landscape"),
        landscapeShare: region?.landscapeShareSettlement ?? PLACE_SHAPE_WEIGHTS.landscapeShareSettlement,
      };
    }
    if (region) {
      for (const group of this.groups) {
        this.groupWeights.push([group, region.groupMultiplier[group.id] ?? 1]);
        this.genericWeights.set(
          group.id,
          group.generics.map((g): [ShapeGeneric, number] => [g, region.genericMultiplier.get(g.id) ?? 1]),
        );
      }
    }
    const stackGroup = source.groups.find((g) => g.id === STACK_SOURCE_GROUP);
    this.stackGenerics = (stackGroup?.generics ?? []).map((g) => g.id).filter((id) => !FOLK_GROUP_GENERICS.has(id));
    this.affixWeights = source.affixes
      .filter((a) => a.forms.length > 0)
      .map((a): [AffixType, number] => [a, (regions.affixBaseline[a.id] ?? 0) * (region?.affixMultiplier[a.id] ?? 1)])
      .filter(([, w]) => w > 0);
  }

  /** Tier weight × regional category multiplier. Unlikely is 0 and stays 0. */
  private categoryWeights(group: ShapeGroup, genericId: string): [string, number][] {
    const key = `${group.id}/${genericId}`;
    let weights = this.profiles.get(key);
    if (!weights) {
      weights = [...resolveProfile(group, genericId, this.source)]
        .map(([id, tier]): [string, number] => [
          id,
          this.excluded.has(id) ? 0 : PLACE_SHAPE_WEIGHTS.tier[tier] * (this.region?.categoryMultiplier[id] ?? 1),
        ])
        .filter(([, w]) => w > 0);
      this.profiles.set(key, weights);
    }
    return weights;
  }

  private pickGroup(rng: () => number): ShapeGroup {
    const region = this.region;
    if (this.sides) {
      const { settlement, landscape, landscapeShare } = this.sides;
      let pool = rng() < landscapeShare ? landscape : settlement;
      if (pool.length === 0) pool = pool === landscape ? settlement : landscape;
      return region
        ? pickWeighted(pool.map((g): [ShapeGroup, number] => [g, region.groupMultiplier[g.id] ?? 1]), rng)
        : pickUniform(pool, rng);
    }
    return region ? pickWeighted(this.groupWeights, rng) : pickUniform(this.groups, rng);
  }

  next(rng: () => number): PlaceShape {
    const region = this.region;
    const group = this.pickGroup(rng);
    const generic = region ? pickWeighted(this.genericWeights.get(group.id)!, rng) : pickUniform(group.generics, rng);
    const categoryId = pickWeighted(this.categoryWeights(group, generic.id), rng);
    const shape: PlaceShape = {
      groupId: group.id,
      genericId: generic.id,
      categoryId,
      structure: "two-part-compound",
      wordOrder: "germanic",
    };

    const connectiveChance = region?.connectiveChance ?? PLACE_SHAPE_WEIGHTS.connectiveChance;
    const stackedGenericChance = region?.stackedGenericChance ?? PLACE_SHAPE_WEIGHTS.stackedGenericChance;
    const affixChance = region?.affixChance ?? PLACE_SHAPE_WEIGHTS.affixChance;

    if (categoryId === EMPTY_SLOT) {
      shape.structure = rng() < PLACE_SHAPE_WEIGHTS.pluralSimplexChance ? "plural-simplex" : "simplex";
    } else if (
      categoryId === PERSONAL_NAME &&
      !FOLK_GROUP_GENERICS.has(generic.id) &&
      rng() < connectiveChance
    ) {
      const folkShare = region?.folkConnectiveShare ?? PLACE_SHAPE_WEIGHTS.folkConnectiveShare;
      shape.structure = rng() < folkShare ? "folk-connective" : "associative-connective";
    } else if (
      group.side === "landscape" &&
      this.stackGenerics.length > 0 &&
      rng() < stackedGenericChance
    ) {
      shape.structure = "stacked-generic";
      shape.stackedGenericId = pickUniform(this.stackGenerics, rng);
    } else {
      shape.wordOrder = pickWeighted(
        region?.wordOrder ?? (Object.entries(PLACE_SHAPE_WEIGHTS.wordOrder) as [WordOrder, number][]),
        rng,
      );
    }

    if (this.affixWeights.length > 0 && rng() < affixChance) {
      const type = pickWeighted(this.affixWeights, rng);
      shape.affix = { typeId: type.id, form: pickUniform(type.forms, rng) };
    }

    return shape;
  }
}

function resolveSeed(seed?: number): number {
  return seed !== undefined && Number.isFinite(seed) ? seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
}

function createGenerator(options: PlaceShapeGenerateOptions, source: PlaceShapeData): PlaceShapeGenerator {
  const region = options.region ? resolveRegion(options.region, PLACE_SHAPE_REGION_DATA) : null;
  return new PlaceShapeGenerator(source, region, {
    groupIds: options.groupIds,
    feature: options.feature,
    excludedCategories: options.excludedCategories,
  });
}

/**
 * Generates `count` distinct shapes. All randomness comes from one mulberry32 stream, so the
 * same seed and region reproduce the same batch.
 */
export function generatePlaceShapesDetailed(
  options: PlaceShapeGenerateOptions,
  source: PlaceShapeData = PLACE_SHAPE_DATA,
): PlaceShapeGenerateResult {
  const seed = resolveSeed(options.seed);
  const rng = mulberry32(seed);
  const generator = createGenerator(options, source);
  const formatter = new PlaceShapeFormatter(source);

  // Duplicates are judged on the Meaning text in every wording, so a plain-word batch is the
  // same batch of shapes, position by position (plain words can therefore repeat a line).
  const count = Math.max(0, Math.floor(options.count));
  const shapes: PlaceShape[] = [];
  const seen = new Set<string>();
  for (let attempt = 0; shapes.length < count && attempt < count * 50; attempt++) {
    const shape = generator.next(rng);
    const text = formatter.format(shape);
    if (seen.has(text)) continue;
    seen.add(text);
    shapes.push(shape);
  }

  let names: string[];
  if (options.wording === "plain") {
    const pick = mulberry32((seed ^ PLAIN_WORDING_SALT) >>> 0);
    names = shapes.map((shape) => formatter.formatPlain(shape, options.region, pick));
  } else {
    names = shapes.map((shape) => formatter.format(shape));
  }
  return { shapes, names, seed, mainRngNext: rng() };
}

/** `count` raw shapes, duplicates kept — for measuring the distribution itself. */
export function samplePlaceShapes(
  options: PlaceShapeGenerateOptions,
  source: PlaceShapeData = PLACE_SHAPE_DATA,
): PlaceShape[] {
  const rng = mulberry32(resolveSeed(options.seed));
  const generator = createGenerator(options, source);
  return Array.from({ length: Math.max(0, Math.floor(options.count)) }, () => generator.next(rng));
}

// ── Output ──────────────────────────────────────────────────────────────────

export interface PlaceShapeWordData {
  version: number;
  /** Per generic: alternative words (picked evenly) and their plurals ("" = no usable plural). */
  words: Record<string, { words: string[]; plurals: string[] }>;
  /** Generics with no plain word: the drawn category is replaced and a fixed word used. */
  rewrites: { generic: string; structure?: ShapeStructure; category: string; word: string; plural: string }[];
  /** Dialect word shown in brackets after the plain word, in the listed regions only. */
  variants: { generic: string; variant: string; plural: string; regions: string[] }[];
}

export const PLACE_SHAPE_WORD_DATA = wordData as unknown as PlaceShapeWordData;

const bracket = (label: string | undefined) => `[${(label ?? "?").toLowerCase()}]`;

export class PlaceShapeFormatter {
  private readonly generics = new Map<string, string>();
  private readonly categories = new Map<string, string>();

  constructor(
    source: PlaceShapeData = PLACE_SHAPE_DATA,
    private readonly words: PlaceShapeWordData = PLACE_SHAPE_WORD_DATA,
  ) {
    for (const group of source.groups) {
      for (const generic of group.generics) this.generics.set(generic.id, generic.meaning);
    }
    for (const category of source.categories) this.categories.set(category.id, category.label);
  }

  /** Part 1 wording: every generic as its bracketed Meaning. */
  format(shape: PlaceShape): string {
    return this.layout(shape, (id, plural) => `${bracket(this.generics.get(id))}${plural ? " (plural)" : ""}`);
  }

  /**
   * Part 1a wording: generics as plain words, with dropped generics rewritten and regional
   * variants added. `pick` is the secondary RNG; it is only drawn when a generic has two words.
   */
  formatPlain(shape: PlaceShape, region: string | undefined, pick: () => number): string {
    const rewrite = this.words.rewrites.find((r) => r.generic === shape.genericId);
    const effective: PlaceShape = rewrite
      ? {
          ...shape,
          categoryId: rewrite.category,
          structure:
            rewrite.structure ??
            (shape.structure === "folk-connective" || shape.structure === "associative-connective"
              ? "two-part-compound"
              : shape.structure),
        }
      : shape;

    return this.layout(effective, (id, plural) => {
      if (rewrite && id === shape.genericId) return plural ? rewrite.plural || rewrite.word : rewrite.word;
      const entry = this.words.words[id];
      if (!entry) return bracket(this.generics.get(id));
      const i = entry.words.length > 1 ? Math.floor(pick() * entry.words.length) : 0;
      const usePlural = plural && entry.plurals[i] !== "";
      const word = usePlural ? entry.plurals[i] : entry.words[i];
      const variant = region
        ? this.words.variants.find((v) => v.generic === id && v.regions.includes(region))
        : undefined;
      return variant ? `${word} (${usePlural ? variant.plural : variant.variant})` : word;
    });
  }

  /**
   * Etymology view (names-reference §4.9): the Meaning shape with each fill shown after a colon
   * inside its brackets, e.g. "[domestic animal: ox] + [river crossing]".
   */
  formatEtymology(shape: PlaceShape, specificFill?: string, affixFill?: string): string {
    const withFill = (id: string, fill?: string) =>
      fill ? `[${(this.categories.get(id) ?? "?").toLowerCase()}: ${fill}]` : bracket(this.categories.get(id));
    return this.layout(
      shape,
      (id, plural) => `${bracket(this.generics.get(id))}${plural ? " (plural)" : ""}`,
      withFill(shape.categoryId, specificFill),
      shape.affix?.form.slotCategory ? withFill(shape.affix.form.slotCategory, affixFill) : undefined,
    );
  }

  private layout(
    shape: PlaceShape,
    genericText: (id: string, plural: boolean) => string,
    specificOverride?: string,
    affixCategoryOverride?: string,
  ): string {
    const specific = specificOverride ?? bracket(this.categories.get(shape.categoryId));

    let text: string;
    switch (shape.structure) {
      case "simplex":
        text = genericText(shape.genericId, false);
        break;
      case "plural-simplex":
        text = genericText(shape.genericId, true);
        break;
      case "folk-connective":
        text = `${specific} + [people of] + ${genericText(shape.genericId, false)}`;
        break;
      case "associative-connective":
        text = `${specific} + [associated with] + ${genericText(shape.genericId, false)}`;
        break;
      case "stacked-generic": {
        const generic = genericText(shape.genericId, false);
        text = `${specific} + ${generic} + ${genericText(shape.stackedGenericId ?? "", false)}`;
        break;
      }
      default: {
        const generic = genericText(shape.genericId, false);
        text =
          shape.wordOrder === "celtic-direct"
            ? `${generic} + ${specific}`
            : shape.wordOrder === "celtic-linked"
              ? `${generic} of the ${specific}`
              : `${specific} + ${generic}`;
      }
    }

    if (shape.affix) {
      const { form } = shape.affix;
      const affix = [form.text, form.slotCategory ? affixCategoryOverride ?? bracket(this.categories.get(form.slotCategory)) : ""]
        .filter((part) => part.length > 0)
        .join(" ");
      text = form.position === "after" ? `${text} ${affix}` : `${affix} ${text}`;
    }
    return text;
  }
}
