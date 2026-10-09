// Place names from shapes (names-reference §2–§5, §8, §13). No Obsidian imports.
//
// Stage 1 (shape) runs the existing shape generator on the main seeded RNG. Stages 2 and 3 (fill
// and render) use a second stream derived from the seed, so the shapes behind a batch of names are
// the shape generator's own batch for the same seed and settings.

import nameWordData from "../data/name-words.json";
import { availableTerrains, type Biome, biomeEntries, BRITAIN, environmentMultipliers, findBiome, shortWords, terrainWeights } from "../biomes";
import { mulberry32 } from "../markov";
import { type SectionRequest } from "../packs/sections";
import {
  type AffixForm,
  generatePlaceShapesDetailed,
  PLACE_SHAPE_DATA,
  PLACE_SHAPE_REGION_DATA,
  PLACE_SHAPE_REGIONS,
  PLACE_SHAPE_WORD_DATA,
  type PlaceShape,
  PlaceShapeFormatter,
} from "../placeShapes";
import { type NameMode, type RecipeSettings } from "./recipe";
import {
  COLONIAL_DATA,
  type ColonialShape,
  formatColonialShape,
  generateColonialShapesDetailed,
  type NativeTreatment,
} from "../colonialShapes";
import { adoptionRng } from "../takeover/batch";
import { riverFill, type RiverSetting } from "../rivers/engine";
import { tribalSlotFill } from "../tribes/slotFill";

// ── Fixed values (names-reference) ──────────────────────────────────────────

export const NAMES = {
  /** Land brief §8.2: share of colonial river fills drawn from the native pack, when one is set. */
  nativeRiverShare: 0.4,
  /** §4.1 fuse-chance modifiers and cap. */
  traditionalWord: 1.5,
  modernWord: 0.6,
  packStem: 1.0,
  joining: { fused: 1.5, balanced: 1.0, spaced: 0.5 },
  fuseCap: 0.95,
  maxFusedLetters: 13,
  /** §4.2 linking -s- for person names. */
  linkingS: 0.5,
  /** §4.3 rule 3: this many consonants at the join falls back to spaced. */
  maxJoinConsonants: 4,
  /** §6.5 mixed register. */
  mixedTraditional: 0.5,
  /** §13 attempts to avoid a duplicate name before allowing it. */
  duplicateAttempts: 20,
  /** Default fusion class for a generic word §3.3 doesn't list (usually spaced). */
  unlistedFusion: 0.15,
} as const;

/** Salt for the fill-and-render stream (§13). */
const FILL_SALT = 0x5a3e9b17;
/** Salt for the redraw stream used when an adapted native name can't be adopted (recipe takeover §A4). */
const REDRAW_SALT = 0x3c91d2a5;
/** Recipe takeover §A3.2: draws per adapted slot, the first draw included. */
const ADAPT_ATTEMPTS = 5;
/** Salt for the "of the" stream (river brief §3.3); consumed only by that decision. */
const OF_THE_SALT = 0x51f0c3e7;
/** River brief §3.2: chance of keeping "{Generic} of the {Word}". */
const OF_THE_KEEP = 0.65;
/** River brief §3.1: word categories that may keep the "of the" order. */
const OF_THE_KEEP_SET = new Set([
  "bird",
  "wild-animal",
  "domestic-animal",
  "fish-and-other-creatures",
  "tree",
  "wild-plant",
  "supernatural-being",
  "status-or-role",
  "activity",
]);
/** River brief §6.9: unmapped river slots are filled by the river engine. */
const RIVER_CATEGORY = "river-or-stream-name";
/** River brief §4: placeholder wording in rendered names only (shape data and etymology keep theirs). */
const RENDER_LABELS: Record<string, string> = {
  "saint-or-holy-person": "holy person",
  "native-people-or-tribe": "native people",
  "native-place-name": "native place",
};
/** River brief §5.2: these placeholders render as one component label, chosen with equal chance. */
const SPLIT_LABELS: Record<string, string[]> = {
  "monarch-ruler-or-dynasty": ["monarch", "ruler", "dynasty"],
  "official-patron-or-sponsor": ["official", "patron", "sponsor"],
  "explorer-or-founder": ["explorer", "founder"],
  "commander-or-conqueror": ["commander", "conqueror"],
};
/** Salt for the split-label stream (river brief §5.2); consumed only by those choices. */
const SPLIT_SALT = 0x2b7d94c1;
/** Land brief §5.3: slots a biome fills (the five nature slots are handled with the native labels). */
const LAND_BIOME_SLOTS = new Set(["wild-animal", "bird", "fish-and-other-creatures", "tree", "wild-plant", "soil-or-ground", "resource", "season", "domestic-animal", "crop"]);
/** River brief §6: unmapped native flora and fauna in colonial rendering. */
const NATIVE_LABELS: Record<string, string> = {
  bird: "native bird",
  "wild-animal": "native wild animal",
  "fish-and-other-creatures": "native fish or creature",
  tree: "native tree",
  "wild-plant": "native plant",
};

/** The native categories a takeover pack can adapt (recipe takeover §A1). */
const NATIVE_CATEGORIES = new Set(["native-place-name", "native-people-or-tribe", "river-or-stream-name"]);

/** §5.2: default mode per category for pack sources; anything else defaults to stem. */
const WHOLE_BY_DEFAULT = new Set(["native-place-name", "native-people-or-tribe", "homeland-place-name"]);

/** The mode a sources slot uses when the recipe leaves it unset. */
export function defaultNameMode(categoryId: string): NameMode {
  return WHOLE_BY_DEFAULT.has(categoryId) ? "whole" : "stem";
}
/** §4.2: person categories take a linking -s- when fused. */
const PERSON_CATEGORIES = new Set([
  "personal-name",
  "monarch-ruler-or-dynasty",
  "royal-woman",
  "official-patron-or-sponsor",
  "commander-or-conqueror",
  "explorer-or-founder",
]);
/** §6.4 default gender ratios. */
const DEFAULT_GENDER: Record<string, { male: number; female: number }> = {
  "royal-woman": { male: 0, female: 100 },
  "monarch-ruler-or-dynasty": { male: 85, female: 15 },
  "personal-name": { male: 75, female: 25 },
  "saint-or-holy-person": { male: 70, female: 30 },
  deity: { male: 50, female: 50 },
  "colonial-deity": { male: 50, female: 50 },
  "local-deity": { male: 50, female: 50 },
  "official-patron-or-sponsor": { male: 95, female: 5 },
  "commander-or-conqueror": { male: 95, female: 5 },
  "explorer-or-founder": { male: 95, female: 5 },
};

/**
 * Slots that take proper names. A word-list word picked in one of these becomes a name fill (spaced
 * in whole mode, fusing with the linking -s- in stem mode, adapted by a takeover pack where native).
 */
export const NAME_SLOTS = new Set([
  "personal-name",
  "folk-group",
  "monarch-ruler-or-dynasty",
  "royal-woman",
  "official-patron-or-sponsor",
  "commander-or-conqueror",
  "explorer-or-founder",
  "saint-or-holy-person",
  "deity",
  "colonial-deity",
  "local-deity",
  "native-place-name",
  "native-people-or-tribe",
  "homeland-place-name",
  "earlier-or-district-name",
  "river-or-stream-name",
]);

/** Whether a slot has a default gender ratio (and so a meaningful Male % setting). */
export function hasGenderDefault(categoryId: string): boolean {
  return categoryId in DEFAULT_GENDER;
}

// ── Word data ───────────────────────────────────────────────────────────────

/**
 * "town-only": settler groups fuse only with a town generic (§11.13). "mile": distance marks render
 * "[Number] Mile" (§4.6). Both are used by colonial names (milestone 4).
 */
export type WordFuses = "yes" | "no" | "traditional-only" | "number-fused" | "number-spaced" | "town-only" | "mile";

export interface NameWordEntry {
  modern: string;
  traditional?: string;
  plural?: string;
  /** Combining forms (no trailing hyphen); empty means the word itself. */
  forms: string[];
  /** Combining forms belonging to the traditional word, where the reference separates them. */
  traditionalForms?: string[];
  fuses: WordFuses;
}

interface NameWordData {
  categories: Record<string, NameWordEntry[]>;
  fusion: Record<string, number>;
  /** Per-generic fusion classes where a word means something else elsewhere (colonial "hope"). */
  genericFusion: Record<string, number>;
  /** §3.2: colonial generic id → its words (one chosen with equal chance). */
  colonialGenerics: Record<string, string[]>;
  prefixForms: Record<string, string>;
  prefixVariantForms: Record<string, { variant: string; prefix: string }>;
  linkingWords: string[];
}

export const NAME_WORDS = nameWordData as unknown as NameWordData;

export function hasBuiltInList(categoryId: string): boolean {
  return (NAME_WORDS.categories[categoryId]?.length ?? 0) > 0;
}

// ── Resolved slots (from the host) ──────────────────────────────────────────

/** Draws one name from a name pack, or null if none could be drawn. */
export type PackDraw = (request: SectionRequest, mode: NameMode, rng: () => number) => string | null;

/** One weighted item in a word list section: a word (table row or `-` line) or a `//` pack draw. */
export interface ResolvedListItem {
  weight: number;
  gender?: "male" | "female";
  entry?: NameWordEntry;
  draw?: PackDraw;
}

export interface ResolvedSource {
  weight: number;
  /** Name pack: draws one name, or null if none could be drawn. */
  draw?: PackDraw;
  /** Word list (or built-in): entries for this category. */
  entries?: NameWordEntry[];
  /** Word list section with `-`/`//` lines or tags: weighted items, picked after any gender draw. */
  items?: ResolvedListItem[];
  /** "“List” › “Section”", for notices about the items. */
  itemsLabel?: string;
}

export type ResolvedSlot =
  | { kind: "built-in" }
  | { kind: "placeholder" }
  | { kind: "ignore" }
  | { kind: "tribal"; tradition: string }
  /** Land brief §5.1: "From the biome" (colonial livestock and crops). */
  | { kind: "biome" }
  | { kind: "sources"; sources: ResolvedSource[]; mode?: NameMode; gender?: { male: number; female: number }; section?: string };

/** Adopts one native name into the takeover pack's language; null when the adoption fails. */
export type NativeAdapter = (native: string, rng: () => number) => string | null;

export interface NameGenerateOptions {
  recipe: RecipeSettings;
  /** Slot settings resolved to sources; categories not present use §6.3. */
  slots: Record<string, ResolvedSlot>;
  count: number;
  seed?: number;
  /** Markov settings for river fills (river brief §6.9); defaults 2 and 3. */
  faithfulness?: number;
  strictness?: number;
  /** The recipe's takeover pack, as an adopter (recipe takeover §A6). Colonial recipes only. */
  adapt?: NativeAdapter;
  /** Land brief §4.1: the recipe's biome, resolved by the host (biome packs); built-ins resolve here. */
  biome?: Biome;
}

/** Optional renderer streams and settings; a renderer built without them behaves as before. */
export interface NameRendererOptions {
  adaptation?: NameAdaptation;
  /** The batch's "of the" stream (river brief §4.3); without it the order always flips. */
  ofTheRng?: () => number;
  /** The batch's split-label stream (river brief §5.2); a renderer without one makes its own. */
  labelRng?: () => number;
  /** Land brief §5.3: the resolved biome (undefined: Britain for organic, unknown country for colonial) and terrain. */
  biome?: Biome;
  terrain?: string;
  /** Markov settings for river fills (river brief §6.9). */
  faithfulness?: number;
  strictness?: number;
}

/** What the renderer needs to adapt native slots (recipe takeover §A3–§A4). */
export interface NameAdaptation {
  adapt: NativeAdapter;
  /** The batch seed, for each name's adoption RNG. */
  seed: number;
  /** The batch's redraw stream; consumed only by redraws. */
  redrawRng: () => number;
}

export interface GeneratedName {
  text: string;
  /** True where the text contains a placeholder (shown muted). */
  hasPlaceholder: boolean;
  /** §4.9: the shape with fills, e.g. "[domestic animal: ox] + [river crossing]". */
  etymology: string;
  shape: PlaceShape | ColonialShape;
}

export interface NameGenerateResult {
  names: GeneratedName[];
  seed: number;
  notices: string[];
}

// ── Fills ───────────────────────────────────────────────────────────────────

type Fill =
  | { kind: "word"; entry: NameWordEntry; traditional: boolean }
  /** `native`: the native name as drawn, where `text` is its adapted form (recipe takeover §A5). */
  | { kind: "name"; text: string; mode: NameMode; native?: string }
  /** `label`: the rendered placeholder text, chosen once (§5); `native`: a native flora or fauna placeholder (§6). */
  | { kind: "placeholder"; categoryId: string; label: string; native?: boolean };

const categoryLabels = new Map([
  ...PLACE_SHAPE_DATA.categories.map((c) => [c.id, c.label.toLowerCase()] as const),
  ...COLONIAL_DATA.categories.map((c) => [c.id, c.label.toLowerCase()] as const),
  ["local-settlement-word", "local settlement word"],
  ["local-market-word", "local market word"],
]);
/** §9.3 local generics: words come from a linked word list; always fused to the specific. */
const LOCAL_GENERICS = new Set(["local-settlement-word", "local-market-word"]);
const DIRECTIONS = ["north", "south", "east", "west"];

/** Plural of a colonial generic word (§3.2 gives none): words ending in s stay; y → ies; else + s. */
function pluralise(word: string): string {
  const parts = word.split(" ");
  const last = parts.pop()!;
  const plural = /s$/i.test(last) ? last : /[^aeiou]y$/i.test(last) ? `${last.slice(0, -1)}ies` : `${last}s`;
  return [...parts, plural].join(" ");
}
/** A placeholder's rendered text for categories that are never split (local generics, §5.1 renames). */
const placeholderText = (categoryId: string) => `[${RENDER_LABELS[categoryId] ?? categoryLabels.get(categoryId) ?? categoryId}]`;

function pickWeighted<T>(items: [T, number][], rng: () => number): T {
  const total = items.reduce((n, [, w]) => n + w, 0);
  let r = rng() * total;
  for (const [item, w] of items) {
    r -= w;
    if (r < 0) return item;
  }
  return items[items.length - 1][0];
}
const pickUniform = <T>(items: readonly T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
/** Weighted list items; equal weights pick exactly as pickUniform does (one draw, same index). */
function pickItem(items: ResolvedListItem[], rng: () => number): ResolvedListItem {
  return items.every((i) => i.weight === items[0].weight) ? pickUniform(items, rng) : pickWeighted(items.map((i): [ResolvedListItem, number] => [i, i.weight]), rng);
}

/** The spaced form of a filled specific: the word (or name) as written. */
function fillWord(fill: Fill): string {
  if (fill.kind === "placeholder") return fill.label;
  if (fill.kind === "name") return fill.text;
  return fill.traditional && fill.entry.traditional ? fill.entry.traditional : fill.entry.modern;
}

/** §4.9: etymology shows names as drawn (native names before adaptation) and words as their paired modern word. */
function fillEtymology(fill: Fill): string | undefined {
  if (fill.kind === "placeholder") return undefined;
  return fill.kind === "name" ? fill.native ?? fill.text : fill.entry.modern;
}

// ── Rendering helpers ───────────────────────────────────────────────────────

const VOWELS = /[aeiouy]/i;
const isConsonant = (ch: string) => /[a-z]/i.test(ch) && !VOWELS.test(ch);
const titleWord = (w: string) => (w.startsWith("[") ? w : w.charAt(0).toUpperCase() + w.slice(1));

/** §4.7: spaced names capitalise every word except linking words (the first word always). */
export function capitaliseSpaced(text: string): string {
  const linking = new Set(NAME_WORDS.linkingWords);
  let inPlaceholder = false;
  return text
    .split(" ")
    .map((word, i) => {
      if (word.startsWith("[")) inPlaceholder = true;
      const out = inPlaceholder ? word : i > 0 && linking.has(word.toLowerCase()) ? word.toLowerCase() : titleWord(word);
      if (word.includes("]")) inPlaceholder = false;
      return out;
    })
    .join(" ");
}

/**
 * §4.3 boundary smoothing for a fused join; null means "fall back to spaced" (rule 3).
 */
export function smoothJoin(specific: string, generic: string): string | null {
  let a = specific;
  let b = generic.toLowerCase();
  // Rule 1: matching letters at the join — drop one (Ash + hill → Ashill).
  if (a.length > 0 && b.length > 0 && a.slice(-1).toLowerCase() === b.charAt(0)) b = b.slice(1);
  // Rule 2: a final e before a vowel goes.
  if (/e$/i.test(a) && VOWELS.test(b.charAt(0))) a = a.slice(0, -1);
  // Rule 3: four or more consonants meeting at the join.
  const tail = a.match(/[^aeiouy]*$/i)?.[0] ?? "";
  const head = b.match(/^[^aeiouy]*/i)?.[0] ?? "";
  if (Array.from(tail + head).filter(isConsonant).length >= NAMES.maxJoinConsonants) return null;
  // Rule 4: never three identical letters in a row.
  return (a + b).replace(/(.)\1{2,}/gi, "$1$1");
}

/** Capital on the first letter only (§4.7). */
const fusedCase = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
const letterCount = (w: string) => Array.from(w.replace(/[^\p{L}]/gu, "")).length;

// ── The renderer ────────────────────────────────────────────────────────────

/** Renders shapes into names. Exported for tests; use `generatePlaceNames` otherwise. */
export class NameRenderer {
  private readonly formatter = new PlaceShapeFormatter();
  private readonly region: string | undefined;
  private readonly notices = new Set<string>();

  constructor(
    private readonly recipe: RecipeSettings,
    private readonly slots: Record<string, ResolvedSlot>,
    regionCode: string | undefined,
    private readonly options: NameRendererOptions = {},
  ) {
    this.region = regionCode;
  }

  private get adaptation(): NameAdaptation | undefined {
    return this.options.adaptation;
  }

  /** Split-label choices (§5.2) never touch the fill stream. */
  private readonly labelRng: () => number = this.options.labelRng ?? mulberry32(SPLIT_SALT);
  /** True while a colonial shape renders: unmapped flora and fauna become native placeholders (§6). */
  private colonial = false;

  /** A placeholder fill with its rendered label: one component for split categories (§5.2). */
  private placeholder(categoryId: string): Fill {
    const split = SPLIT_LABELS[categoryId];
    const label = split ? `[${split[Math.floor(this.labelRng() * split.length)]}]` : placeholderText(categoryId);
    return { kind: "placeholder", categoryId, label };
  }

  getNotices(): string[] {
    return [...this.notices];
  }

  /** §6.3: unmapped categories use their built-in list, else a placeholder. */
  private slotFor(categoryId: string): ResolvedSlot {
    const slot = this.slots[categoryId];
    if (slot) return slot;
    return hasBuiltInList(categoryId) ? { kind: "built-in" } : { kind: "placeholder" };
  }

  private chooseRegister(entry: NameWordEntry, rng: () => number): boolean {
    if (!entry.traditional) return false;
    if (this.recipe.register === "modern") return false;
    if (this.recipe.register === "traditional") return true;
    return rng() < NAMES.mixedTraditional;
  }

  /**
   * River brief §6.9: an unmapped (or built-in) river slot is a bare river from the river engine,
   * drawn on the fill stream as a spaced word fill — British (with the region) for organic shapes,
   * New Land or Established for colonial ones.
   */
  private riverWordFill(rng: () => number): Fill {
    const part = this.recipe.shape.part;
    const setting: RiverSetting = part === "new-land" ? "new-land" : part === "established" ? "established" : "british";
    const text = riverFill(
      {
        setting,
        region: setting === "british" ? this.region : undefined,
        // Tribal brief §19.5: colonial parts pass the recipe's biome.
        biome: setting === "british" ? undefined : this.recipe.shape.biome,
        faithfulness: this.options.faithfulness,
        strictness: this.options.strictness,
      },
      rng,
    );
    return { kind: "word", entry: { modern: text, forms: [], fuses: "no" }, traditional: false };
  }

  /**
   * Land brief §5.3–§5.4: a fill from the biome and terrain, or undefined to take today's path
   * (Britain with Any terrain draws today's built-ins uniformly, so seeds are unchanged).
   */
  private landFill(categoryId: string, rng: () => number, chosenBiome: boolean): Fill | undefined {
    const biome = this.options.biome?.id === "britain" ? undefined : this.options.biome;
    const terrain = this.options.terrain && this.options.terrain !== "any" ? this.options.terrain : undefined;
    const word = (entry: NameWordEntry): Fill => ({ kind: "word", entry, traditional: this.chooseRegister(entry, rng) });
    if (categoryId === "landform" || categoryId === "water-or-wetland-feature") {
      const kind = categoryId === "landform" ? "land" : "water";
      if (!biome) {
        if (!terrain) return undefined;
        const tagged = shortWords(BRITAIN, kind, terrain).map(([e]) => e);
        if (tagged.length > 0) return word(pickUniform(tagged, rng));
        return word(pickUniform(shortWords(BRITAIN, kind, "plains").map(([e]) => e), rng));
      }
      let t = terrain;
      if (!t) {
        const weights = Object.entries(terrainWeights(biome, "any")).filter(([id, w]) => w > 0 && shortWords(biome, kind, id).length > 0);
        t = pickWeighted(weights, rng);
      }
      let entries = shortWords(biome, kind, t);
      if (entries.length === 0) {
        this.notices.add(`“${t}” has no short ${kind} words; using the plains.`);
        entries = shortWords(biome, kind, "plains");
      }
      return entries.length > 0 ? word(pickWeighted(entries, rng)) : undefined;
    }
    if (!LAND_BIOME_SLOTS.has(categoryId)) return undefined;
    // Colonial livestock and crops are the incomers' own unless "From the biome" is chosen.
    if (this.colonial && (categoryId === "domestic-animal" || categoryId === "crop") && !chosenBiome) return undefined;
    if (!biome) return undefined;
    const entries = biomeEntries(biome, categoryId);
    return entries && entries.length > 0 ? word(pickWeighted(entries, rng)) : undefined;
  }

  /** Tribal brief §20.2: a short tribal name on the fill stream, as riverWordFill. */
  private tribalWordFill(tradition: string, rng: () => number): Fill {
    const part = this.recipe.shape.part;
    const { text } = tribalSlotFill(
      { tradition, part, region: this.region, biome: part === "organic" ? undefined : this.recipe.shape.biome },
      rng,
    );
    return { kind: "word", entry: { modern: text, forms: [], fuses: "no" }, traditional: false };
  }

  /**
   * River brief §3: a keep-set word in a linked generic-first order keeps "{Generic} of the {Word}"
   * with probability 0.65 on its own stream; null means flip and join as before.
   */
  private ofThe(fill: Fill, categoryId: string, genericId: string, rng: () => number): string | null {
    const ofTheRng = this.options.ofTheRng;
    const eligible = (fill.kind === "word" && OF_THE_KEEP_SET.has(categoryId)) || (fill.kind === "placeholder" && fill.native);
    if (!ofTheRng || !eligible) return null;
    if (!(ofTheRng() < OF_THE_KEEP)) return null;
    return capitaliseSpaced(`${this.genericWord(genericId, false, rng)} of the ${fillWord(fill)}`);
  }

  /** Stage 2: fill one slot. `whole` forces whole names for pack sources (§5.3). */
  fill(categoryId: string, rng: () => number, whole = false): Fill {
    const mapped = this.slots[categoryId];
    if (categoryId === RIVER_CATEGORY && (!mapped || mapped.kind === "built-in")) {
      // Land brief §8.2: with a native pack, some colonial rivers are native names, adapted by a
      // takeover pack like native place names. The draw is only made when a native pack is set.
      const native = this.slots["native-place-name"];
      if (this.colonial && !mapped && this.recipe.native && native?.kind === "sources" && rng() < NAMES.nativeRiverShare) {
        const fill = this.fill("native-place-name", rng, true);
        if (fill.kind === "name") return fill;
      }
      return this.riverWordFill(rng);
    }
    // §6.1: in colonial rendering, unmapped native flora and fauna never draw the British lists.
    // An explicit built-in mapping still does; domestic animals and crops are not in the set.
    if (this.colonial && !mapped && NATIVE_LABELS[categoryId]) {
      // Tribal brief §19.3: a recipe biome fills them with its own words. The fill stream is only
      // drawn when a biome is set, so recipes without one are unchanged for a given seed.
      const biome = this.options.biome;
      const entries = biome ? biomeEntries(biome, categoryId) : undefined;
      if (entries) return { kind: "word", entry: pickWeighted(entries, rng), traditional: false };
      return { kind: "placeholder", categoryId, label: `[${NATIVE_LABELS[categoryId]}]`, native: true };
    }
    const slot = this.slotFor(categoryId);
    // Land brief §5.3: unset land slots (and "From the biome" where offered) follow the biome and terrain.
    if (!mapped || mapped.kind === "biome") {
      const land = this.landFill(categoryId, rng, mapped?.kind === "biome");
      if (land) return land;
    }
    // Tribal brief §20.2: a tribal slot is a spaced word fill, never fused or adapted.
    if (slot.kind === "tribal") return this.tribalWordFill(slot.tradition, rng);
    const wordFill = (entries: NameWordEntry[] | undefined): Fill => {
      if (!entries || entries.length === 0) return this.placeholder(categoryId);
      return entryFill(pickUniform(entries, rng));
    };
    const entryFill = (picked: NameWordEntry): Fill => {
      let entry = picked;
      // §11.13: "ruler of the [direction]" takes its direction from the position list.
      if (entry.modern.includes("[direction]")) entry = { ...entry, modern: entry.modern.replace("[direction]", pickUniform(DIRECTIONS, rng)) };
      return { kind: "word", entry, traditional: this.chooseRegister(entry, rng) };
    };
    // Land brief §5.1: Placeholder on a colonial nature slot reads as the native label.
    if (slot.kind === "placeholder" && this.colonial && NATIVE_LABELS[categoryId]) {
      return { kind: "placeholder", categoryId, label: `[${NATIVE_LABELS[categoryId]}]`, native: true };
    }
    if (slot.kind === "placeholder" || slot.kind === "ignore") return this.placeholder(categoryId);
    if (slot.kind === "built-in" || slot.kind === "biome") return wordFill(NAME_WORDS.categories[categoryId]);

    const source = pickWeighted(slot.sources.map((s): [ResolvedSource, number] => [s, s.weight]), rng);
    if (source.items) return this.itemFill(source, slot, categoryId, rng, whole, entryFill);
    if (source.entries) return wordFill(source.entries);
    if (!source.draw) return this.placeholder(categoryId);
    const mode: NameMode = whole ? "whole" : slot.mode ?? defaultNameMode(categoryId);
    const ratio = slot.gender ?? DEFAULT_GENDER[categoryId];
    const request: SectionRequest = {};
    if (slot.section) request.section = slot.section;
    if (ratio) request.gender = rng() * (ratio.male + ratio.female) < ratio.male ? "male" : "female";
    const text = source.draw(request, mode, rng);
    return text ? { kind: "name", text, mode } : this.placeholder(categoryId);
  }

  /**
   * A word list section's weighted items: the gender (slot ratio, else the category default) is
   * drawn first and filters tagged items; a pack item draws a name, a word is a name in a name slot
   * and a word fill elsewhere.
   */
  private itemFill(
    source: ResolvedSource,
    slot: Extract<ResolvedSlot, { kind: "sources" }>,
    categoryId: string,
    rng: () => number,
    whole: boolean,
    entryFill: (entry: NameWordEntry) => Fill,
  ): Fill {
    const all = source.items!;
    if (all.length === 0) return this.placeholder(categoryId);
    const ratio = slot.gender ?? DEFAULT_GENDER[categoryId];
    const gender = ratio ? (rng() * (ratio.male + ratio.female) < ratio.male ? "male" : "female") : undefined;
    let items = gender ? all.filter((i) => !i.gender || i.gender === gender) : all;
    if (items.length === 0) {
      this.notices.add(`${source.itemsLabel ?? "Word list"} has no ${gender} entries; ignoring gender.`);
      items = all;
    }
    const item = pickItem(items, rng);
    const mode: NameMode = whole ? "whole" : slot.mode ?? defaultNameMode(categoryId);
    if (item.draw) {
      const text = item.draw(gender ? { gender } : {}, mode, rng);
      return text ? { kind: "name", text, mode } : this.placeholder(categoryId);
    }
    if (NAME_SLOTS.has(categoryId)) return { kind: "name", text: item.entry!.modern, mode };
    return entryFill(item.entry!);
  }

  /**
   * Recipe takeover §A3: an adapted native name fill is adopted into the takeover pack's language.
   * A failed adoption redraws the slot on the redraw stream, up to five draws in all; after that the
   * last native name is used unchanged. Word fills and placeholders pass through untouched.
   */
  private adaptFill(
    fill: Fill,
    categoryId: string,
    treatment: NativeTreatment | undefined,
    whole: boolean,
    shape: ColonialShape,
  ): Fill {
    const adaptation = this.adaptation;
    if (!adaptation || treatment !== "adapted" || shape.translated || !NATIVE_CATEGORIES.has(categoryId)) return fill;
    let current = fill;
    for (let draw = 1; ; draw++) {
      if (current.kind !== "name") return current;
      const adopted = adaptation.adapt(current.text, adoptionRng(adaptation.seed, current.text));
      if (adopted !== null) return { ...current, text: adopted, native: current.text };
      if (draw >= ADAPT_ATTEMPTS) return current;
      current = this.fill(categoryId, adaptation.redrawRng, whole);
    }
  }

  /** The generic's word (§3.1): variant replaces the plain word in its regions; recipe overrides last. */
  genericWord(genericId: string, plural: boolean, rng: () => number): string {
    if (LOCAL_GENERICS.has(genericId)) return this.localGeneric(genericId, rng);
    const colonial = NAME_WORDS.colonialGenerics[genericId];
    if (colonial) {
      const word = pickUniform(colonial, rng);
      const chosen = plural ? pluralise(word) : word;
      return this.recipe.generics[chosen.toLowerCase()] ?? chosen;
    }
    const rewrite = PLACE_SHAPE_WORD_DATA.rewrites.find((r) => r.generic === genericId);
    let word: string;
    if (rewrite) {
      word = plural ? rewrite.plural || rewrite.word : rewrite.word;
    } else {
      const entry = PLACE_SHAPE_WORD_DATA.words[genericId];
      const i = entry && entry.words.length > 1 ? Math.floor(rng() * entry.words.length) : 0;
      word = entry ? (plural && entry.plurals[i] ? entry.plurals[i] : entry.words[i]) : genericId;
      const variant = this.region
        ? PLACE_SHAPE_WORD_DATA.variants.find((v) => v.generic === genericId && v.regions.includes(this.region!))
        : undefined;
      if (variant) word = plural && (entry?.plurals[i] ?? "") !== "" ? variant.plural : variant.variant;
    }
    return this.recipe.generics[word.toLowerCase()] ?? word;
  }

  /** §9.3: the local word from the recipe's linked word list (Modern column only), or a placeholder. */
  private localGeneric(genericId: string, rng: () => number): string {
    const slot = this.slots[genericId];
    // Local generics take words only (weighted); a `//` pack line in their section is skipped.
    const wordsOf = (s: ResolvedSource): ResolvedListItem[] =>
      s.entries ? s.entries.map((entry) => ({ weight: 1, entry })) : (s.items ?? []).filter((i) => i.entry);
    const sources = slot?.kind === "sources" ? slot.sources.filter((s) => wordsOf(s).length > 0) : [];
    if (sources.length === 0) return placeholderText(genericId);
    const source = pickWeighted(sources.map((s): [ResolvedSource, number] => [s, s.weight]), rng);
    return pickItem(wordsOf(source), rng).entry!.modern;
  }

  private fusionClass(word: string, genericId?: string): number {
    if (genericId && NAME_WORDS.genericFusion[genericId] !== undefined && NAME_WORDS.colonialGenerics[genericId]) {
      return NAME_WORDS.genericFusion[genericId];
    }
    if (word.includes(" ")) return 0; // multi-word forms never fuse
    const known = NAME_WORDS.fusion[word.toLowerCase()];
    if (known !== undefined) return known;
    this.notices.add(`“${word}” has no fusion class; it is treated as usually spaced.`);
    return NAMES.unlistedFusion;
  }

  /** The combining form used when a word fill fuses. */
  private combiningForm(fill: Extract<Fill, { kind: "word" }>, rng: () => number): string {
    const forms = fill.traditional && fill.entry.traditionalForms ? fill.entry.traditionalForms : fill.entry.forms;
    return forms.length > 0 ? pickUniform(forms, rng) : fillWord(fill);
  }

  /**
   * §4.1–§4.3, §4.6: specific + generic, fused or spaced. Returns the joined text and whether it
   * fused (stacked generics only fuse onto an already fused name).
   */
  join(fill: Fill, categoryId: string, genericId: string, rng: () => number): { text: string; fused: boolean } {
    let plural = false;
    let forceFuse = false;
    let neverFuse = false;
    let modifier: number = NAMES.packStem;
    if (fill.kind === "placeholder") neverFuse = true;
    else if (fill.kind === "name") neverFuse = fill.mode === "whole";
    else {
      const f = fill.entry.fuses;
      if (f === "no" || (f === "traditional-only" && !fill.traditional)) neverFuse = true;
      // §4.6 numbers follow their word, whichever list they come from.
      const word = fill.entry.modern.toLowerCase();
      const fusedNumber = f === "number-fused" || (categoryId === "number" && ["two", "three"].includes(word));
      const spacedNumber = f === "number-spaced" || (categoryId === "number" && ["five", "seven", "nine"].includes(word));
      if (fusedNumber) {
        forceFuse = true;
        neverFuse = false;
      }
      if (spacedNumber) {
        neverFuse = true;
        plural = true;
      }
      // §4.6: distance marks read "[Number] Mile" + generic, always spaced.
      if (f === "mile") {
        const generic = this.genericWord(genericId, false, rng);
        return { text: capitaliseSpaced(`${fillWord(fill)} Mile ${generic}`), fused: false };
      }
      modifier = fill.traditional ? NAMES.traditionalWord : NAMES.modernWord;
    }
    const generic = this.genericWord(genericId, plural, rng);
    const spaced = { text: capitaliseSpaced(`${fillWord(fill)} ${generic}`), fused: false };
    // §9.3: local generics are always fused to their specific.
    if (LOCAL_GENERICS.has(genericId) && fill.kind !== "placeholder" && !generic.startsWith("[")) {
      const specific = fill.kind === "word" ? this.combiningForm(fill, rng) : fillWord(fill);
      return { text: fusedCase(smoothJoin(specific, generic) ?? `${specific}${generic.toLowerCase()}`), fused: true };
    }
    // §11.13: settler groups fuse only with a town generic.
    if (fill.kind === "word" && fill.entry.fuses === "town-only" && generic.toLowerCase() !== "town") return spaced;
    if (neverFuse && !forceFuse) return spaced;

    if (!forceFuse) {
      const chance = Math.min(NAMES.fuseCap, this.fusionClass(generic, genericId) * modifier * NAMES.joining[this.recipe.render.joining]);
      if (!(rng() < chance)) return spaced;
    }
    if (generic.includes(" ")) return spaced;
    let specific = fill.kind === "word" ? this.combiningForm(fill, rng) : fillWord(fill);
    if (fill.kind === "name" && PERSON_CATEGORIES.has(categoryId) && rng() < NAMES.linkingS && !/s$/i.test(specific)) {
      specific += "s";
    }
    const joined = smoothJoin(specific, generic);
    if (joined === null || letterCount(joined) > NAMES.maxFusedLetters) return spaced;
    return { text: fusedCase(joined), fused: true };
  }

  /** §4.4: a name or placeholder with a generic-first order stays generic first. */
  private genericFirst(fill: Fill, genericId: string, linked: boolean, rng: () => number): string {
    const generic = this.genericWord(genericId, false, rng);
    const variantPrefix = NAME_WORDS.prefixVariantForms[genericId];
    const prefix =
      NAME_WORDS.prefixForms[genericId] ?? (variantPrefix && generic.toLowerCase() === variantPrefix.variant ? variantPrefix.prefix : undefined);
    const name = fillWord(fill);
    if (prefix) return `${prefix} ${titleWord(name)}`;
    return capitaliseSpaced(`${generic} of ${name}`);
  }

  /** §4.5: -ing- connectives, fused to the name; the generic joins if its class allows. */
  private connective(fill: Fill, genericId: string, rng: () => number): string {
    const generic = this.genericWord(genericId, false, rng);
    const base = fill.kind === "placeholder" ? `${fill.label}ing` : `${fusedCase(fillWord(fill))}ing`;
    if (fill.kind !== "placeholder" && this.fusionClass(generic) >= 0.5 && !generic.includes(" ")) {
      const joined = smoothJoin(base, generic);
      if (joined && letterCount(joined) <= NAMES.maxFusedLetters) return fusedCase(joined);
    }
    return `${base} ${titleWord(generic)}`;
  }

  /** §4.8: the shape's affix, with its slot filled; an ignored category redraws the affix type. */
  private affix(shape: PlaceShape, rng: () => number): { typeId: string; form: AffixForm; fill?: Fill } | undefined {
    if (!shape.affix) return undefined;
    const ignored = (form: AffixForm) => !!form.slotCategory && this.slotFor(form.slotCategory).kind === "ignore";
    let { typeId, form } = shape.affix;
    if (ignored(form)) {
      const options = PLACE_SHAPE_DATA.affixes
        .map((a): [{ id: string; forms: AffixForm[] }, number] => [
          { id: a.id, forms: a.forms.filter((f) => !ignored(f)) },
          PLACE_SHAPE_REGION_DATA.affixBaseline[a.id] ?? 0,
        ])
        .filter(([a, w]) => a.forms.length > 0 && w > 0);
      if (options.length === 0) return undefined;
      const type = pickWeighted(options, rng);
      typeId = type.id;
      form = pickUniform(type.forms, rng);
    }
    const fill = form.slotCategory ? this.fill(form.slotCategory, rng, true) : undefined;
    return { typeId, form, fill };
  }

  /** Colonial shapes (parts 2 and 2a): the structures of colonial-shapes §6, rendered by §4. */
  renderColonial(shape: ColonialShape, rng: () => number): GeneratedName {
    this.colonial = true;
    try {
      return this.renderColonialShape(shape, rng);
    } finally {
      this.colonial = false;
    }
  }

  private renderColonialShape(shape: ColonialShape, rng: () => number): GeneratedName {
    const whole = (categoryId: string) => this.fill(categoryId, rng, true);
    // Native slots are adapted straight after drawing, before any join, possessive or linking word.
    const specific = (f: Fill, isWhole: boolean) => this.adaptFill(f, shape.categoryId, shape.treatments.specific, isWhole, shape);
    const secondOf = (f: Fill) => this.adaptFill(f, shape.secondCategoryId!, shape.treatments.second, true, shape);
    const named = (fill: Fill) => titleWord(fillWord(fill));
    const the = (text: string) => (shape.definite ? `The ${text}` : text);
    let fill: Fill | undefined;
    let second: Fill | undefined;
    let text: string;
    switch (shape.structure) {
      case "simplex":
        text = the(capitaliseSpaced(this.genericWord(shape.genericId, !!shape.plural, rng)));
        break;
      case "bare-specific":
        fill = specific(whole(shape.categoryId), true);
        text = the(capitaliseSpaced(fillWord(fill)));
        break;
      case "possessive":
        fill = specific(whole(shape.categoryId), true);
        text = capitaliseSpaced(`${fillWord(fill)}'s ${this.genericWord(shape.genericId, false, rng)}`);
        break;
      case "new-transfer":
        fill = specific(whole(shape.categoryId), true);
        text = `New ${named(fill)}`;
        break;
      case "twin":
        fill = specific(whole(shape.categoryId), true);
        text = `${shape.twin === "old" ? "Old" : "New"} ${named(fill)}`;
        break;
      case "double-specific":
        fill = specific(whole(shape.categoryId), true);
        second = secondOf(whole(shape.secondCategoryId!));
        text = capitaliseSpaced(`${fillWord(fill)} of ${fillWord(second)}`);
        break;
      case "position-of-landmark":
        fill = specific(this.fill(shape.categoryId, rng), false);
        second = secondOf(whole(shape.secondCategoryId!));
        text = capitaliseSpaced(`${fillWord(fill)} of the ${fillWord(second)}`);
        break;
      case "locative":
        text = capitaliseSpaced(`at the ${this.genericWord(shape.genericId, false, rng)}`);
        break;
      default: {
        const genericFirst = shape.wordOrder === "generic-first-direct" || shape.wordOrder === "generic-first-linked";
        const slot = this.slotFor(shape.categoryId);
        const mayBeName = slot.kind === "sources" && slot.sources.some((s) => s.draw);
        const drawWhole = genericFirst && mayBeName;
        fill = specific(this.fill(shape.categoryId, rng, drawWhole), drawWhole);
        // §6.3: a native placeholder never takes the name-style generic-first form.
        const native = fill.kind === "placeholder" && !!fill.native;
        if (genericFirst && fill.kind !== "word" && !native && !LOCAL_GENERICS.has(shape.genericId)) {
          text = this.genericFirst(fill, shape.genericId, shape.wordOrder === "generic-first-linked", rng);
          break;
        }
        // River brief §3: a keep-set word may keep its linked order (two-part compounds only).
        const kept =
          shape.wordOrder === "generic-first-linked" && shape.structure === "two-part-compound"
            ? this.ofThe(fill, shape.categoryId, shape.genericId, rng)
            : null;
        if (kept) {
          text = kept;
          break;
        }
        const first = this.join(fill, shape.categoryId, shape.genericId, rng);
        text = first.text;
        if (shape.structure === "stacked-generic" && shape.stackedGenericId) {
          const nextWord = this.genericWord(shape.stackedGenericId, false, rng);
          const chance = Math.min(
            NAMES.fuseCap,
            this.fusionClass(nextWord, shape.stackedGenericId) * NAMES.joining[this.recipe.render.joining],
          );
          const fused = first.fused && rng() < chance ? smoothJoin(text, nextWord) : null;
          text = fused && letterCount(fused) <= NAMES.maxFusedLetters ? fusedCase(fused) : capitaliseSpaced(`${text} ${nextWord}`);
        }
      }
    }

    // §4.8: an affix needing an ignored category is redrawn from the remaining types.
    const affix = this.affix(shape as unknown as PlaceShape, rng);
    let affixFill: string | undefined;
    if (affix) {
      const { form } = affix;
      const filledText = affix.fill ? titleWord(fillWord(affix.fill)) : "";
      affixFill = affix.fill ? fillEtymology(affix.fill) : undefined;
      const words = [form.text, filledText].filter((w) => w.length > 0).join(" ");
      if (form.position === "before") text = `${titleWord(words)} ${text}`;
      else if (form.text && form.slotCategory && this.recipe.render.linkingHyphens) text = `${text}-${form.text.replace(/ /g, "-")}-${filledText}`;
      else text = `${text} ${words}`;
    }

    const shown: ColonialShape = { ...shape, affix: affix ? { typeId: affix.typeId, form: affix.form } : undefined };
    if (!affix) delete shown.affix;
    return {
      text,
      hasPlaceholder: /\[[^\]]+\]/.test(text),
      etymology: formatColonialShape(shown, {
        specific: fill ? fillEtymology(fill) : undefined,
        second: second ? fillEtymology(second) : undefined,
        affix: affixFill,
      }),
      shape,
    };
  }

  /** Stage 3: one shape → one name. */
  render(shape: PlaceShape, rng: () => number): GeneratedName {
    // 1a §4 rewrite rules for dropped generics apply first.
    const rewrite = PLACE_SHAPE_WORD_DATA.rewrites.find((r) => r.generic === shape.genericId);
    const effective: PlaceShape = rewrite
      ? {
          ...shape,
          categoryId: rewrite.category,
          structure:
            (rewrite.structure as PlaceShape["structure"] | undefined) ??
            (shape.structure === "folk-connective" || shape.structure === "associative-connective" ? "two-part-compound" : shape.structure),
        }
      : shape;
    const { categoryId, genericId } = effective;

    let text: string;
    let fill: Fill | undefined;
    switch (effective.structure) {
      case "simplex":
        text = titleWord(this.genericWord(genericId, false, rng));
        text = capitaliseSpaced(text);
        break;
      case "plural-simplex":
        text = capitaliseSpaced(this.genericWord(genericId, true, rng));
        break;
      case "folk-connective":
      case "associative-connective":
        fill = this.fill(categoryId, rng);
        text = this.connective(fill, genericId, rng);
        break;
      default: {
        if (genericId === "folk-group-territory") {
          // §4.5: [personal name] + people → Grimings.
          fill = this.fill(categoryId, rng);
          text = fill.kind === "placeholder" ? `${fill.label}ings` : `${fusedCase(fillWord(fill))}ings`;
          break;
        }
        const genericFirst = effective.wordOrder !== "germanic" && effective.structure === "two-part-compound";
        // Names and placeholders keep a generic-first order, so they are drawn whole (§5.3).
        const slot = this.slotFor(categoryId);
        const mayBeName = slot.kind === "sources" && slot.sources.some((s) => s.draw);
        fill = this.fill(categoryId, rng, genericFirst && mayBeName);
        if (genericFirst && fill.kind !== "word") {
          text = this.genericFirst(fill, genericId, effective.wordOrder === "celtic-linked", rng);
          break;
        }
        // River brief §3: a keep-set word may keep its linked order; otherwise it flips as before.
        const kept =
          effective.wordOrder === "celtic-linked" && effective.structure === "two-part-compound"
            ? this.ofThe(fill, categoryId, genericId, rng)
            : null;
        if (kept) {
          text = kept;
          break;
        }
        // Words flip to English order and join normally.
        const first = this.join(fill, categoryId, genericId, rng);
        text = first.text;
        if (effective.structure === "stacked-generic" && effective.stackedGenericId) {
          const second = this.genericWord(effective.stackedGenericId, false, rng);
          const chance = Math.min(NAMES.fuseCap, this.fusionClass(second) * NAMES.joining[this.recipe.render.joining]);
          const fused = first.fused && rng() < chance ? smoothJoin(text, second) : null;
          text = fused && letterCount(fused) <= NAMES.maxFusedLetters ? fusedCase(fused) : capitaliseSpaced(`${text} ${second}`);
        }
      }
    }

    const affix = this.affix(effective, rng);
    let affixFill: string | undefined;
    if (affix) {
      const { form } = affix;
      const filled = affix.fill ? titleWord(fillWord(affix.fill)) : "";
      affixFill = affix.fill ? fillEtymology(affix.fill) : undefined;
      const words = [form.text, filled].filter((w) => w.length > 0).join(" ");
      if (form.position === "before") text = `${titleWord(words)} ${text}`;
      else if (form.text && form.slotCategory && this.recipe.render.linkingHyphens) {
        // Linking affixes (§4.7): Ashford-upon-Severn. Only the linking words are hyphenated.
        text = `${text}-${form.text.replace(/ /g, "-")}-${filled}`;
      }
      else text = `${text} ${words}`;
    }

    // The etymology shows the affix actually rendered (it may have been redrawn).
    const shown: PlaceShape = { ...effective, affix: affix ? { typeId: affix.typeId, form: affix.form } : undefined };
    if (!affix) delete shown.affix;
    return {
      text,
      hasPlaceholder: /\[[^\]]+\]/.test(text),
      etymology: this.formatter.formatEtymology(shown, fill ? fillEtymology(fill) : undefined, affixFill),
      shape: effective,
    };
  }
}

/** "all-britain", a region code ("NTH") or a kebab label ("east-midlands") → a region code. */
export function resolveRegionSetting(value: string | undefined): string | undefined {
  if (!value || value === "all-britain") return undefined;
  const kebab = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const region = PLACE_SHAPE_REGIONS.find((r) => r.code === value.toUpperCase() || kebab(r.label) === kebab(value));
  return region?.code;
}

/**
 * Generates `count` names. Shapes come from the shape generator on the main stream (with ignored
 * categories at weight 0); fills and rendering use the second stream. A duplicate name refills the
 * same shape, up to 20 attempts, after which it is allowed (§13).
 */
export function generatePlaceNames(options: NameGenerateOptions): NameGenerateResult {
  const steps = generatePlaceNamesSteps(options);
  for (;;) {
    const next = steps.next();
    if (next.done) return next.value;
  }
}

/**
 * Generates names one at a time, pausing after each with the number done so far, so a host can let
 * the page repaint while adoptions run (recipe takeover §A6). Same result as `generatePlaceNames`.
 */
export function* generatePlaceNamesSteps(options: NameGenerateOptions): Generator<number, NameGenerateResult> {
  const { recipe } = options;
  const seed =
    options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const organic = recipe.shape.part === "organic";
  const region = organic ? resolveRegionSetting(recipe.shape.region) : undefined;
  const notices: string[] = [];
  if (organic && recipe.shape.region !== "all-britain" && !region) {
    notices.push(`Unknown region “${recipe.shape.region}”; using all Britain.`);
  }
  const excludedCategories = Object.entries(options.slots)
    .filter(([, slot]) => slot.kind === "ignore")
    .map(([id]) => id);

  // Stage 1: shapes on the main stream, exactly as the shape generator makes them.
  const rng = mulberry32((seed ^ FILL_SALT) >>> 0);
  // Recipe takeover §A4: a takeover pack only adapts colonial recipes; organic ones ignore it.
  const adaptation: NameAdaptation | undefined =
    options.adapt && !organic ? { adapt: options.adapt, seed, redrawRng: mulberry32((seed ^ REDRAW_SALT) >>> 0) } : undefined;
  // Land brief §4.1: the biome (resolved by the host, or built in) and terrain.
  const biomeSetting = recipe.shape.biome;
  let biome = options.biome ?? (biomeSetting?.startsWith("[[") ? undefined : findBiome(biomeSetting));
  if (!biome && biomeSetting?.startsWith("[[")) {
    notices.push(`Biome pack “${biomeSetting.slice(2, -2)}” wasn't found; using ${organic ? "Britain" : "unknown country"}.`);
  }
  if (organic && biome?.id === "britain") biome = undefined;
  let terrain = recipe.shape.terrain ?? "any";
  if (terrain !== "any" && biome && !availableTerrains(biome).some((t) => t.id === terrain) && biome.customTerrains) {
    notices.push(`${biome.label} has no “${terrain}” terrain.`);
    terrain = "any";
  }
  const environment = environmentMultipliers(biome, terrain);
  const renderer = new NameRenderer(recipe, options.slots, region, {
    biome,
    terrain,
    adaptation,
    ofTheRng: mulberry32((seed ^ OF_THE_SALT) >>> 0),
    labelRng: mulberry32((seed ^ SPLIT_SALT) >>> 0),
    faithfulness: options.faithfulness,
    strictness: options.strictness,
  });
  let renderOne: (i: number) => GeneratedName;
  let shapeCount: number;
  if (organic) {
    const { shapes } = generatePlaceShapesDetailed({ count: options.count, seed, region, feature: recipe.shape.feature, excludedCategories, environment });
    renderOne = (i) => renderer.render(shapes[i], rng);
    shapeCount = shapes.length;
  } else {
    const { shapes } = generateColonialShapesDetailed({
      count: options.count,
      seed,
      part: recipe.shape.part === "new-land" ? "2" : "2a",
      tradition: recipe.shape.tradition === "general" ? undefined : recipe.shape.tradition,
      context: recipe.shape.context === "none" ? undefined : recipe.shape.context,
      feature: recipe.shape.feature,
      excludedCategories,
      environment,
    });
    renderOne = (i) => renderer.renderColonial(shapes[i], rng);
    shapeCount = shapes.length;
  }

  // Stages 2 and 3 on the second stream; a duplicate name refills the same shape (§13).
  const seen = new Set<string>();
  const names: GeneratedName[] = [];
  for (let i = 0; i < shapeCount; i++) {
    let name = renderOne(i);
    for (let attempt = 1; seen.has(name.text.toLowerCase()) && attempt < NAMES.duplicateAttempts; attempt++) {
      name = renderOne(i);
    }
    seen.add(name.text.toLowerCase());
    names.push(name);
    yield names.length;
  }
  return { names, seed, notices: [...notices, ...renderer.getNotices()] };
}
