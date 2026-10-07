// Colonial place-name shape generator (parts 2 and 2a).
//
// Same idea as part 1 (placeShapes.ts): outputs the semantic *shape* of a colonial place name,
// never a name. Data lives in ./data/colonial-shapes.json, which references part 1 generics and
// categories by id rather than copying them. Every weight is tier × tradition × context (§2.2).
// No Obsidian dependency, so it runs (and is tested) under plain Node.

import colonialData from "./data/colonial-shapes.json";
import { mulberry32 } from "./markov";
import {
  type AffixForm,
  PLACE_SHAPE_DATA,
  PLACE_SHAPE_REGION_DATA,
  PLACE_SHAPE_WEIGHTS,
  pickUniform,
  pickWeighted,
  resolveProfile,
  type ShapeGroup,
  type Tier,
} from "./placeShapes";

// ── Data types ──────────────────────────────────────────────────────────────

export type ColonialPart = "2" | "2a";
type WordOrder = "specific-first" | "generic-first-direct" | "generic-first-linked";
type StructureKey =
  | "bareSpecific"
  | "definiteForm"
  | "possessive"
  | "newTransfer"
  | "twin"
  | "doubleSpecific"
  | "positionOfLandmark"
  | "translationTag"
  | "affix";

interface TierLists {
  common: string[];
  occasional: string[];
  rare: string[];
}

interface ColonialOverride {
  generics: string[];
  set: Record<string, Tier>;
  /** "All other categories → tier": applied to the profile's other listed categories. */
  others?: Tier;
}

interface ColonialGroup {
  id: string;
  inherited: boolean;
  label?: string;
  side?: "settlement" | "landscape";
  /** Inherited groups: part 1 generic ids. New groups: full generic records. */
  generics: (string | { id: string; meaning: string; sense: string; parts: ColonialPart[] })[];
  /** Inherited groups: colonial additions and ↑ raises over the part 1 profile. */
  set?: Record<string, Tier>;
  raised?: string[];
  /** New groups: their full profile. */
  profile?: TierLists;
  overrides: ColonialOverride[];
}

interface ColonialCategory {
  id: string;
  label: string;
  family: string;
  covers: string;
  parts: ColonialPart[];
}

interface MultiplierProfile {
  categoryMultipliers: Record<string, number>;
  groupMultipliers: Record<string, number>;
  genericMultipliers: Record<string, number>;
  structureMultipliers: Partial<Record<StructureKey, number>>;
  affixTypeMultipliers: Record<string, number>;
  locative: number;
  nativeTreatment: { adopted: number; adapted: number };
  wordOrder: Record<WordOrder, number>;
}

export interface ColonialTradition extends MultiplierProfile {
  id: string;
  label: string;
  parts: ColonialPart[];
  guide: string;
}

export interface ColonialContext {
  id: string;
  label: string;
  groupMultipliers: Record<string, number>;
  categoryMultipliers: Record<string, number>;
  structureMultipliers: Partial<Record<StructureKey, number>>;
  nativeTreatment?: { adopted: number; adapted: number };
}

interface StructureValues {
  bareSpecific: { categories: string[]; chanceInGroups: { groups: string[]; chance: number }; chance: number };
  definiteForm: { chance: number };
  possessive: { categories: string[]; chance: number };
  newTransfer: { categories: string[]; chance: number };
  twin: { categories: string[]; groups: string[]; parts: ColonialPart[]; chance: number };
  doubleSpecific: { categories: string[]; chance: number; secondSpecifics: string[]; fallback: string };
  positionOfLandmark: { categories: string[]; chance: number; landmarks: string[]; fallback: string };
  locative: { parts: ColonialPart[]; chance: number };
  translationTag: { categoryFamilies: string[]; chanceByPart: Record<ColonialPart, number> };
  nativeTreatment: { categories: string[]; split: { adopted: number; adapted: number } };
  affix: { chance: number };
  pluralSimplex: { chance: number };
  stackedGeneric: { chance: number; sourceGroup: string };
}

export interface ColonialData {
  version: number;
  excludedCategories: string[];
  inheritedCategories: { id: string; parts: ColonialPart[] }[];
  categories: ColonialCategory[];
  groups: ColonialGroup[];
  structures: StructureValues;
  prefixOrders: Record<string, { prefix: string } & Record<WordOrder, number>>;
  affixTypes: Record<string, { label: string; weight: number; forms: AffixForm[] }>;
  contexts: Record<ColonialPart, ColonialContext[]>;
  general: ColonialTradition;
  traditions: ColonialTradition[];
}

export const COLONIAL_DATA = colonialData as unknown as ColonialData;

/** General first, then the traditions in reference order. */
export const COLONIAL_TRADITIONS: readonly ColonialTradition[] = [COLONIAL_DATA.general, ...COLONIAL_DATA.traditions];

export function colonialContexts(part: ColonialPart): readonly ColonialContext[] {
  return COLONIAL_DATA.contexts[part];
}

export function isTraditionAvailable(traditionId: string, part: ColonialPart): boolean {
  return COLONIAL_TRADITIONS.find((t) => t.id === traditionId)?.parts.includes(part) ?? false;
}

// ── Profiles ────────────────────────────────────────────────────────────────

const NEW_GROUP_SIDES = new Map(
  COLONIAL_DATA.groups.filter((g) => !g.inherited).map((g) => [g.id, g.side ?? "settlement"]),
);
const PART1_GROUPS = new Map(PLACE_SHAPE_DATA.groups.map((g) => [g.id, g]));

function genericIdOf(entry: ColonialGroup["generics"][number]): string {
  return typeof entry === "string" ? entry : entry.id;
}

function groupSide(group: ColonialGroup): "settlement" | "landscape" {
  return group.inherited ? PART1_GROUPS.get(group.id)!.side : NEW_GROUP_SIDES.get(group.id)!;
}

/** Category → tier for one colonial generic (§5). Unlisted categories are Unlikely. */
export function resolveColonialProfile(group: ColonialGroup, genericId: string, data: ColonialData = COLONIAL_DATA): Map<string, Tier> {
  const tiers = new Map<string, Tier>();
  for (const c of data.inheritedCategories) tiers.set(c.id, "unlikely");
  for (const c of data.categories) tiers.set(c.id, "unlikely");

  if (group.inherited) {
    // Part 1 tiers (with part 1's per-generic exceptions), minus excluded categories.
    const part1 = resolveProfile(PART1_GROUPS.get(group.id) as ShapeGroup, genericId);
    for (const [id, tier] of part1) if (tiers.has(id)) tiers.set(id, tier);
    for (const [id, tier] of Object.entries(group.set ?? {})) tiers.set(id, tier);
  } else if (group.profile) {
    for (const tier of ["common", "occasional", "rare"] as const) {
      for (const id of group.profile[tier]) tiers.set(id, tier);
    }
  }

  for (const override of group.overrides) {
    if (!override.generics.includes(genericId)) continue;
    if (override.others) {
      for (const [id, tier] of tiers) {
        if (id in override.set) continue;
        // "All other categories → Rare" never revives an Unlikely pairing (§2.2).
        if (tier !== "unlikely" || override.others === "unlikely") tiers.set(id, override.others);
      }
    }
    for (const [id, tier] of Object.entries(override.set)) tiers.set(id, tier);
  }
  return tiers;
}

// ── Shapes ──────────────────────────────────────────────────────────────────

export type ColonialStructure =
  | "two-part-compound"
  | "stacked-generic"
  | "simplex"
  | "bare-specific"
  | "possessive"
  | "new-transfer"
  | "twin"
  | "double-specific"
  | "position-of-landmark"
  | "locative";

export type NativeTreatment = "adopted" | "adapted";
export type RenamingType = "adapted" | "translated" | "honorific-overlay" | "hybrid" | "twin" | "replacement";

export interface ColonialShape {
  part: ColonialPart;
  groupId: string;
  genericId: string;
  categoryId: string;
  structure: ColonialStructure;
  wordOrder?: WordOrder;
  stackedGenericId?: string;
  /** Double specific: the linked second specific. Position of a landmark: the landmark. */
  secondCategoryId?: string;
  twin?: "new" | "old";
  plural?: boolean;
  definite?: boolean;
  /** Treatment of each native category used, keyed by category slot ("specific" or "second"). */
  treatments: { specific?: NativeTreatment; second?: NativeTreatment };
  translated?: boolean;
  affix?: { typeId: string; form: AffixForm };
  /** Part 2a only. Derived from the shape and never output (§6.5). */
  renamingType?: RenamingType;
}

export interface ColonialGenerateOptions {
  count: number;
  part: ColonialPart;
  /** Tradition id; omit for General. Must be available in `part`. */
  tradition?: string;
  /** Context id for the part; omit for None. */
  context?: string;
  /** Same seed and settings = identical batch. Omit for a random seed. */
  seed?: number;
  /** Restricts eligible groups. Not exposed in the UI; used by tests. */
  groupIds?: string[];
  /** Feature filter (recipes): "any", "settlement" (landscape groups drawn at 0.35), "landscape" or a group id. */
  feature?: string;
  /** Categories set to `ignore` by a recipe: weight 0 at the shape stage. */
  excludedCategories?: string[];
}

/** Feature filter "Settlement": share of landscape groups drawn (as in part 1). */
const LANDSCAPE_SHARE_SETTLEMENT = 0.35;

export interface ColonialGenerateResult {
  shapes: ColonialShape[];
  names: string[];
  seed: number;
}

const PERSON_CATEGORIES = new Set([
  "monarch-ruler-or-dynasty",
  "royal-woman",
  "honorific-title",
  "official-patron-or-sponsor",
  "commander-or-conqueror",
  "explorer-or-founder",
]);
const OVERLAY_CATEGORIES = new Set(["monarch-ruler-or-dynasty", "royal-woman", "honorific-title"]);
const COLONIAL_SPECIFIC_FAMILIES = new Set(["colonisers", "transfer-and-memory", "experience-and-claim"]);
const COLONIAL_GENERIC_GROUPS = new Set(["colonial-settlement", "military-and-administrative", "territories"]);
const LOCAL_GENERIC_GROUP = "local-generics";
const EMPTY_SLOT = "empty-slot";

const categoryFamily = new Map<string, string>([
  ...PLACE_SHAPE_DATA.categories.map((c) => [c.id, c.family] as const),
  ...COLONIAL_DATA.categories.map((c) => [c.id, c.family] as const),
]);
const colonialCategoryIds = new Set(COLONIAL_DATA.categories.map((c) => c.id));

/** Derives the renaming type of a part 2a shape (§6.5). Exported for tests; never output. */
export function deriveRenamingType(shape: ColonialShape, data: ColonialData = COLONIAL_DATA): RenamingType {
  const used = [shape.categoryId, shape.secondCategoryId].filter((c): c is string => !!c && c !== EMPTY_SLOT);
  const native = new Set(data.structures.nativeTreatment.categories);
  const hasNative = used.some((c) => native.has(c));
  const colonialSpecific = used.some(
    (c) => (colonialCategoryIds.has(c) && COLONIAL_SPECIFIC_FAMILIES.has(categoryFamily.get(c) ?? "")) || c === "colonial-deity",
  );
  const colonialGeneric = COLONIAL_GENERIC_GROUPS.has(shape.groupId);
  const localGeneric = shape.groupId === LOCAL_GENERIC_GROUP;

  if (shape.structure === "twin") return "twin";
  if (shape.translated) return "translated";
  if (hasNative && used.some((c) => OVERLAY_CATEGORIES.has(c))) return "honorific-overlay";
  if ((colonialSpecific && localGeneric) || (hasNative && colonialGeneric)) return "hybrid";
  if (!hasNative) return "replacement";
  if (!colonialSpecific) return "adapted";
  // A native name alongside a colonial specific on an inherited generic: §6.5 lists no rule,
  // so it is treated as a hybrid of the two.
  return "hybrid";
}

// ── Generator ───────────────────────────────────────────────────────────────

interface EligibleGeneric {
  id: string;
  categories: [string, number][];
  categoryWeight: Map<string, number>;
}

interface EligibleGroup {
  group: ColonialGroup;
  side: "settlement" | "landscape";
  generics: [EligibleGeneric, number][];
}

const cap = (x: number) => Math.min(1, x);

class ColonialShapeGenerator {
  private readonly profile: ColonialTradition;
  private readonly context: ColonialContext | undefined;
  private readonly groups: [EligibleGroup, number][] = [];
  private readonly sides: { settlement: [EligibleGroup, number][]; landscape: [EligibleGroup, number][] } | null = null;
  private readonly stackSource: [string, number][];
  private readonly affixWeights: [{ id: string; forms: AffixForm[] }, number][];

  constructor(
    private readonly options: ColonialGenerateOptions,
    private readonly data: ColonialData = COLONIAL_DATA,
  ) {
    const { part } = options;
    const tradition = options.tradition ? data.traditions.find((t) => t.id === options.tradition) : data.general;
    if (!tradition) throw new Error(`Unknown colonial tradition: ${options.tradition}`);
    if (!tradition.parts.includes(part)) throw new Error(`${tradition.label} is not available in part ${part}`);
    this.profile = tradition;
    this.context = options.context ? data.contexts[part].find((c) => c.id === options.context) : undefined;
    if (options.context && !this.context) throw new Error(`Unknown context for part ${part}: ${options.context}`);

    const categoryParts = new Map<string, ColonialPart[]>([
      ...data.inheritedCategories.map((c) => [c.id, c.parts] as const),
      ...data.categories.map((c) => [c.id, c.parts] as const),
    ]);
    const inPart = (parts: ColonialPart[] | undefined) => (parts ?? ["2", "2a"]).includes(part);

    const excluded = new Set(options.excludedCategories ?? []);
    const feature = options.feature && options.feature !== "any" ? options.feature : undefined;
    const eligibleByGroup = new Map<string, EligibleGroup>();
    for (const group of data.groups) {
      if (options.groupIds && !options.groupIds.includes(group.id)) continue;
      if (feature === "landscape" && groupSide(group) !== "landscape") continue;
      if (feature && feature !== "landscape" && feature !== "settlement" && group.id !== feature) continue;
      const groupWeight = this.groupMultiplier(group.id);
      const generics: [EligibleGeneric, number][] = [];
      for (const entry of group.generics) {
        const id = genericIdOf(entry);
        if (typeof entry !== "string" && !inPart(entry.parts)) continue;
        const genericWeight = this.profile.genericMultipliers[id] ?? 1;
        if (genericWeight <= 0) continue;
        const categories = [...resolveColonialProfile(group, id, data)]
          .filter(([c]) => inPart(categoryParts.get(c)) && !excluded.has(c))
          .map(([c, tier]): [string, number] => [c, PLACE_SHAPE_WEIGHTS.tier[tier] * this.categoryMultiplier(c)])
          .filter(([, w]) => w > 0);
        if (categories.length === 0) continue;
        generics.push([{ id, categories, categoryWeight: new Map(categories) }, genericWeight]);
      }
      const eligible = { group, side: groupSide(group), generics };
      eligibleByGroup.set(group.id, eligible);
      if (groupWeight > 0 && generics.length > 0) this.groups.push([eligible, groupWeight]);
    }
    if (this.groups.length === 0) throw new Error("No eligible colonial groups for these settings");
    if (feature === "settlement") {
      this.sides = {
        settlement: this.groups.filter(([g]) => g.side === "settlement"),
        landscape: this.groups.filter(([g]) => g.side === "landscape"),
      };
    }

    // Stacked generics come from colonial settlement, weighted as in step 3 (by generic weight).
    const source = data.groups.find((g) => g.id === data.structures.stackedGeneric.sourceGroup)!;
    this.stackSource = source.generics
      .filter((entry) => typeof entry === "string" || inPart(entry.parts))
      .map((entry): [string, number] => [genericIdOf(entry), this.profile.genericMultipliers[genericIdOf(entry)] ?? 1])
      .filter(([, w]) => w > 0);

    // Affix types: part 1 baseline types plus City, × the tradition's affix-type multipliers.
    // Forms that output a slot category keep only categories available in this part.
    const formFits = (f: AffixForm) => !f.slotCategory || inPart(categoryParts.get(f.slotCategory) ?? []);
    const types = [
      ...PLACE_SHAPE_DATA.affixes.map((a) => ({
        id: a.id,
        forms: a.forms.filter(formFits),
        weight: PLACE_SHAPE_REGION_DATA.affixBaseline[a.id] ?? 0,
      })),
      ...Object.entries(data.affixTypes).map(([id, a]) => ({ id, forms: a.forms, weight: a.weight })),
    ];
    this.affixWeights = types
      .filter((t) => t.forms.length > 0)
      .map((t): [{ id: string; forms: AffixForm[] }, number] => [t, t.weight * (this.profile.affixTypeMultipliers[t.id] ?? 1)])
      .filter(([, w]) => w > 0);
  }

  private groupMultiplier(id: string): number {
    return (this.profile.groupMultipliers[id] ?? 1) * (this.context?.groupMultipliers[id] ?? 1);
  }

  private categoryMultiplier(id: string): number {
    return (this.profile.categoryMultipliers[id] ?? 1) * (this.context?.categoryMultipliers[id] ?? 1);
  }

  /** §7 base chance × tradition × context structure multipliers, capped at 1.0. */
  private chance(key: StructureKey, base: number): number {
    return cap(base * (this.profile.structureMultipliers[key] ?? 1) * (this.context?.structureMultipliers[key] ?? 1));
  }

  next(rng: () => number): ColonialShape {
    const s = this.data.structures;
    const { part } = this.options;
    let pool = this.groups;
    if (this.sides) {
      pool = rng() < LANDSCAPE_SHARE_SETTLEMENT ? this.sides.landscape : this.sides.settlement;
      if (pool.length === 0) pool = this.groups;
    }
    const eligible = pickWeighted(pool, rng);
    const generic = pickWeighted(eligible.generics, rng);
    const categoryId = pickWeighted(generic.categories, rng);
    const shape: ColonialShape = {
      part,
      groupId: eligible.group.id,
      genericId: generic.id,
      categoryId,
      structure: "two-part-compound",
      treatments: {},
    };
    const pickFrom = (candidates: string[], fallback: string) => {
      const weighted = candidates
        .map((c): [string, number] => [c, generic.categoryWeight.get(c) ?? 0])
        .filter(([, w]) => w > 0);
      return weighted.length > 0 ? pickWeighted(weighted, rng) : fallback;
    };

    // Step 5: the first check that succeeds sets the structure.
    if (categoryId === EMPTY_SLOT) {
      shape.structure = "simplex";
      shape.plural = rng() < s.pluralSimplex.chance;
      shape.definite = rng() < this.chance("definiteForm", s.definiteForm.chance);
    } else if (s.newTransfer.categories.includes(categoryId) && rng() < this.chance("newTransfer", s.newTransfer.chance)) {
      shape.structure = "new-transfer";
    } else if (
      s.bareSpecific.categories.includes(categoryId) &&
      rng() <
        this.chance(
          "bareSpecific",
          s.bareSpecific.chanceInGroups.groups.includes(eligible.group.id) ? s.bareSpecific.chanceInGroups.chance : s.bareSpecific.chance,
        )
    ) {
      shape.structure = "bare-specific";
      shape.definite = rng() < this.chance("definiteForm", s.definiteForm.chance);
    } else if (s.possessive.categories.includes(categoryId) && rng() < this.chance("possessive", s.possessive.chance)) {
      shape.structure = "possessive";
    } else if (s.doubleSpecific.categories.includes(categoryId) && rng() < this.chance("doubleSpecific", s.doubleSpecific.chance)) {
      shape.structure = "double-specific";
      shape.secondCategoryId = pickFrom(s.doubleSpecific.secondSpecifics, s.doubleSpecific.fallback);
    } else if (
      s.positionOfLandmark.categories.includes(categoryId) &&
      rng() < this.chance("positionOfLandmark", s.positionOfLandmark.chance)
    ) {
      shape.structure = "position-of-landmark";
      shape.secondCategoryId = pickFrom(s.positionOfLandmark.landmarks, s.positionOfLandmark.fallback);
    } else if (
      s.twin.parts.includes(part) &&
      s.twin.categories.includes(categoryId) &&
      s.twin.groups.includes(eligible.group.id) &&
      rng() < this.chance("twin", s.twin.chance)
    ) {
      shape.structure = "twin";
      shape.twin = rng() < 0.5 ? "new" : "old";
    } else if (s.locative.parts.includes(part) && this.profile.locative > 0 && rng() < this.profile.locative) {
      shape.structure = "locative";
    } else if (eligible.side === "landscape" && this.stackSource.length > 0 && rng() < s.stackedGeneric.chance) {
      shape.structure = "stacked-generic";
      shape.stackedGenericId = pickWeighted(this.stackSource, rng);
    }

    // Step 6: word order for compounds and stacked generics.
    if (shape.structure === "two-part-compound" || shape.structure === "stacked-generic") {
      const prefix = this.data.prefixOrders[shape.genericId];
      const distribution = prefix ?? this.profile.wordOrder;
      const orders = (["specific-first", "generic-first-direct", "generic-first-linked"] as WordOrder[])
        .map((o): [WordOrder, number] => [o, distribution[o]])
        .filter(([, w]) => w > 0);
      shape.wordOrder = pickWeighted(orders, rng);
    }

    // Step 7: native treatment for each native category in the shape.
    const split = this.context?.nativeTreatment ?? this.profile.nativeTreatment;
    const native = s.nativeTreatment.categories;
    const usesSpecific = shape.structure !== "locative" && shape.structure !== "simplex";
    if (usesSpecific && native.includes(shape.categoryId)) shape.treatments.specific = rng() < split.adopted ? "adopted" : "adapted";
    if (shape.secondCategoryId && native.includes(shape.secondCategoryId)) {
      shape.treatments.second = rng() < split.adopted ? "adopted" : "adapted";
    }

    // Step 8: translation tag on a descriptive or living-thing specific.
    if (usesSpecific && s.translationTag.categoryFamilies.includes(categoryFamily.get(shape.categoryId) ?? "")) {
      shape.translated = rng() < this.chance("translationTag", s.translationTag.chanceByPart[part]);
    }

    // Step 9: affix.
    if (this.affixWeights.length > 0 && rng() < this.chance("affix", s.affix.chance)) {
      const type = pickWeighted(this.affixWeights, rng);
      shape.affix = { typeId: type.id, form: pickUniform(type.forms, rng) };
    }

    // Step 10: renaming type (2a only), stored but never output.
    if (part === "2a") shape.renamingType = deriveRenamingType(shape, this.data);
    return shape;
  }
}

// ── Output ──────────────────────────────────────────────────────────────────

const labels = new Map<string, string>([
  ...PLACE_SHAPE_DATA.categories.map((c) => [c.id, c.label] as const),
  ...COLONIAL_DATA.categories.map((c) => [c.id, c.label] as const),
]);
const genericLabels = new Map<string, string>([
  ...PLACE_SHAPE_DATA.groups.flatMap((g) => g.generics.map((x) => [x.id, x.meaning] as const)),
  ...COLONIAL_DATA.groups.flatMap((g) =>
    g.generics.filter((x): x is Exclude<typeof x, string> => typeof x !== "string").map((x) => [x.id, x.meaning] as const),
  ),
]);

/**
 * The shape as text. With `fills` (names etymology, names-reference §4.9), each filled slot shows
 * its fill after a colon inside the brackets.
 */
export function formatColonialShape(
  shape: ColonialShape,
  fills: { specific?: string; second?: string; affix?: string } = {},
): string {
  const fillFor = (id: string) =>
    id === shape.categoryId ? fills.specific : id === shape.secondCategoryId ? fills.second : undefined;
  const category = (id: string, treatment?: NativeTreatment, fill = fillFor(id)) =>
    `[${(labels.get(id) ?? "?").toLowerCase()}${treatment ? `, ${treatment}` : ""}${fill ? `: ${fill}` : ""}]`;
  const generic = (id: string) => `[${(genericLabels.get(id) ?? "?").toLowerCase()}]`;
  const specific = category(shape.categoryId, shape.treatments.specific);
  const the = (text: string) => (shape.definite ? `The ${text}` : text);

  let text: string;
  switch (shape.structure) {
    case "simplex":
      text = the(`${generic(shape.genericId)}${shape.plural ? " (plural)" : ""}`);
      break;
    case "bare-specific":
      text = the(specific);
      break;
    case "possessive":
      text = `${specific}'s + ${generic(shape.genericId)}`;
      break;
    case "new-transfer":
      text = `New ${specific}`;
      break;
    case "twin":
      text = `${shape.twin === "old" ? "Old" : "New"} ${specific}`;
      break;
    case "double-specific":
      text = `${specific} of ${category(shape.secondCategoryId!, shape.treatments.second)}`;
      break;
    case "position-of-landmark":
      text = `${specific} of the ${category(shape.secondCategoryId!, shape.treatments.second)}`;
      break;
    case "locative":
      text = `At the ${generic(shape.genericId)}`;
      break;
    default: {
      const generics =
        shape.structure === "stacked-generic"
          ? `${generic(shape.genericId)} + ${generic(shape.stackedGenericId!)}`
          : generic(shape.genericId);
      text =
        shape.wordOrder === "generic-first-direct"
          ? `${generics} + ${specific}`
          : shape.wordOrder === "generic-first-linked"
            ? `${generics} of ${specific}`
            : `${specific} + ${generics}`;
    }
  }

  if (shape.affix) {
    const { form } = shape.affix;
    const affix = [form.text, form.slotCategory ? category(form.slotCategory, undefined, fills.affix) : ""]
      .filter((p) => p.length > 0)
      .join(" ");
    text = form.position === "after" ? `${text} ${affix}` : `${affix} ${text}`;
  }
  if (shape.translated) text = `${text} (translated native name)`;
  return text;
}

// ── Entry points ────────────────────────────────────────────────────────────

function resolveSeed(seed?: number): number {
  return seed !== undefined && Number.isFinite(seed) ? seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
}

/** `count` distinct shapes from one mulberry32 stream: same seed and settings, same batch. */
export function generateColonialShapesDetailed(options: ColonialGenerateOptions): ColonialGenerateResult {
  const seed = resolveSeed(options.seed);
  const rng = mulberry32(seed);
  const generator = new ColonialShapeGenerator(options);
  const count = Math.max(0, Math.floor(options.count));
  const shapes: ColonialShape[] = [];
  const names: string[] = [];
  const seen = new Set<string>();
  for (let attempt = 0; names.length < count && attempt < count * 50; attempt++) {
    const shape = generator.next(rng);
    const text = formatColonialShape(shape);
    if (seen.has(text)) continue;
    seen.add(text);
    shapes.push(shape);
    names.push(text);
  }
  return { shapes, names, seed };
}

/** `count` raw shapes, duplicates kept — for measuring the distribution itself. */
export function sampleColonialShapes(options: ColonialGenerateOptions): ColonialShape[] {
  const rng = mulberry32(resolveSeed(options.seed));
  const generator = new ColonialShapeGenerator(options);
  return Array.from({ length: Math.max(0, Math.floor(options.count)) }, () => generator.next(rng));
}

/** History label: the section name plus any non-default tradition and context. */
export function colonialHistoryLabel(sectionLabel: string, part: ColonialPart, tradition?: string, context?: string): string {
  const parts = [sectionLabel];
  const t = tradition ? COLONIAL_DATA.traditions.find((x) => x.id === tradition) : undefined;
  if (t) parts.push(t.label);
  const c = context ? COLONIAL_DATA.contexts[part].find((x) => x.id === context) : undefined;
  if (c) parts.push(c.label.toLowerCase());
  return parts.join(" · ");
}
