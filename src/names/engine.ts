// Place names from shapes (names-reference §2–§5, §8, §13). No Obsidian imports.
//
// Stage 1 (shape) runs the existing shape generator on the main seeded RNG. Stages 2 and 3 (fill
// and render) use a second stream derived from the seed, so the shapes behind a batch of names are
// the shape generator's own batch for the same seed and settings.

import nameWordData from "../data/name-words.json";
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
} from "../colonialShapes";

// ── Fixed values (names-reference) ──────────────────────────────────────────

export const NAMES = {
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

/** §5.2: default mode per category for pack sources; anything else defaults to stem. */
const WHOLE_BY_DEFAULT = new Set(["native-place-name", "native-people-or-tribe", "homeland-place-name"]);
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

export interface ResolvedSource {
  weight: number;
  /** Name pack: draws one name, or null if none could be drawn. */
  draw?: (request: SectionRequest, mode: NameMode, rng: () => number) => string | null;
  /** Word list (or built-in): entries for this category. */
  entries?: NameWordEntry[];
}

export type ResolvedSlot =
  | { kind: "built-in" }
  | { kind: "placeholder" }
  | { kind: "ignore" }
  | { kind: "sources"; sources: ResolvedSource[]; mode?: NameMode; gender?: { male: number; female: number }; section?: string };

export interface NameGenerateOptions {
  recipe: RecipeSettings;
  /** Slot settings resolved to sources; categories not present use §6.3. */
  slots: Record<string, ResolvedSlot>;
  count: number;
  seed?: number;
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
  | { kind: "name"; text: string; mode: NameMode }
  | { kind: "placeholder"; categoryId: string };

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
const placeholderText = (categoryId: string) => `[${categoryLabels.get(categoryId) ?? categoryId}]`;

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

/** The spaced form of a filled specific: the word (or name) as written. */
function fillWord(fill: Fill): string {
  if (fill.kind === "placeholder") return placeholderText(fill.categoryId);
  if (fill.kind === "name") return fill.text;
  return fill.traditional && fill.entry.traditional ? fill.entry.traditional : fill.entry.modern;
}

/** §4.9: etymology shows names as drawn and words as their paired modern word. */
function fillEtymology(fill: Fill): string | undefined {
  if (fill.kind === "placeholder") return undefined;
  return fill.kind === "name" ? fill.text : fill.entry.modern;
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
  ) {
    this.region = regionCode;
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

  /** Stage 2: fill one slot. `whole` forces whole names for pack sources (§5.3). */
  fill(categoryId: string, rng: () => number, whole = false): Fill {
    const slot = this.slotFor(categoryId);
    const wordFill = (entries: NameWordEntry[] | undefined): Fill => {
      if (!entries || entries.length === 0) return { kind: "placeholder", categoryId };
      let entry = pickUniform(entries, rng);
      // §11.13: "ruler of the [direction]" takes its direction from the position list.
      if (entry.modern.includes("[direction]")) entry = { ...entry, modern: entry.modern.replace("[direction]", pickUniform(DIRECTIONS, rng)) };
      return { kind: "word", entry, traditional: this.chooseRegister(entry, rng) };
    };
    if (slot.kind === "placeholder" || slot.kind === "ignore") return { kind: "placeholder", categoryId };
    if (slot.kind === "built-in") return wordFill(NAME_WORDS.categories[categoryId]);

    const source = pickWeighted(slot.sources.map((s): [ResolvedSource, number] => [s, s.weight]), rng);
    if (source.entries) return wordFill(source.entries);
    if (!source.draw) return { kind: "placeholder", categoryId };
    const mode: NameMode = whole ? "whole" : slot.mode ?? (WHOLE_BY_DEFAULT.has(categoryId) ? "whole" : "stem");
    const ratio = slot.gender ?? DEFAULT_GENDER[categoryId];
    const request: SectionRequest = {};
    if (slot.section) request.section = slot.section;
    if (ratio) request.gender = rng() * (ratio.male + ratio.female) < ratio.male ? "male" : "female";
    const text = source.draw(request, mode, rng);
    return text ? { kind: "name", text, mode } : { kind: "placeholder", categoryId };
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
    const sources = slot?.kind === "sources" ? slot.sources.filter((s) => s.entries && s.entries.length > 0) : [];
    if (sources.length === 0) return placeholderText(genericId);
    const source = pickWeighted(sources.map((s): [ResolvedSource, number] => [s, s.weight]), rng);
    return pickUniform(source.entries!, rng).modern;
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
    const base = fill.kind === "placeholder" ? `${placeholderText(fill.categoryId)}ing` : `${fusedCase(fillWord(fill))}ing`;
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
    const whole = (categoryId: string) => this.fill(categoryId, rng, true);
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
        fill = whole(shape.categoryId);
        text = the(capitaliseSpaced(fillWord(fill)));
        break;
      case "possessive":
        fill = whole(shape.categoryId);
        text = capitaliseSpaced(`${fillWord(fill)}'s ${this.genericWord(shape.genericId, false, rng)}`);
        break;
      case "new-transfer":
        fill = whole(shape.categoryId);
        text = `New ${named(fill)}`;
        break;
      case "twin":
        fill = whole(shape.categoryId);
        text = `${shape.twin === "old" ? "Old" : "New"} ${named(fill)}`;
        break;
      case "double-specific":
        fill = whole(shape.categoryId);
        second = whole(shape.secondCategoryId!);
        text = capitaliseSpaced(`${fillWord(fill)} of ${fillWord(second)}`);
        break;
      case "position-of-landmark":
        fill = this.fill(shape.categoryId, rng);
        second = whole(shape.secondCategoryId!);
        text = capitaliseSpaced(`${fillWord(fill)} of the ${fillWord(second)}`);
        break;
      case "locative":
        text = capitaliseSpaced(`at the ${this.genericWord(shape.genericId, false, rng)}`);
        break;
      default: {
        const genericFirst = shape.wordOrder === "generic-first-direct" || shape.wordOrder === "generic-first-linked";
        const slot = this.slotFor(shape.categoryId);
        const mayBeName = slot.kind === "sources" && slot.sources.some((s) => s.draw);
        fill = this.fill(shape.categoryId, rng, genericFirst && mayBeName);
        if (genericFirst && fill.kind !== "word" && !LOCAL_GENERICS.has(shape.genericId)) {
          text = this.genericFirst(fill, shape.genericId, shape.wordOrder === "generic-first-linked", rng);
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
          text = fill.kind === "placeholder" ? `${placeholderText(categoryId)}ings` : `${fusedCase(fillWord(fill))}ings`;
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
  const renderer = new NameRenderer(recipe, options.slots, region);
  let renderOne: (i: number) => GeneratedName;
  let shapeCount: number;
  if (organic) {
    const { shapes } = generatePlaceShapesDetailed({ count: options.count, seed, region, feature: recipe.shape.feature, excludedCategories });
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
  }
  return { names, seed, notices: [...notices, ...renderer.getNotices()] };
}
