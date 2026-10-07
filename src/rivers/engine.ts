// River names (river brief §6). No Obsidian imports.
//
// Three kinds of river name: ancient (new names from a Markov model trained on real British river
// names, British only), descriptive (a built-in word plus a water word) and pattern (templates with
// placeholders, this module only). Everything is drawn from one seeded stream; Markov models take
// sub-seeds from it, as the takeover module's native drawer does.

import riverData from "../data/river-names.json";
import { MarkovModel, mulberry32 } from "../markov";
import { NAME_WORDS, NAMES, type NameWordEntry, smoothJoin } from "../names/engine";

export type RiverSetting = "british" | "new-land" | "established";
export type RiverKind = "ancient" | "descriptive" | "pattern";

export const RIVER_SETTINGS: { id: RiverSetting; label: string }[] = [
  { id: "british", label: "British River Names" },
  { id: "new-land", label: "New Land" },
  { id: "established", label: "Established" },
];

type Weights = Record<string, number>;

interface RiverData {
  corpora: Record<string, string[]>;
  regionCorpora: Record<string, string[]>;
  ancient: { minLetters: number; maxLetters: number; draws: number };
  kindWeights: Record<RiverSetting, Record<RiverKind, number>>;
  waterWords: { british: Record<string, Weights>; "new-land": Weights; established: Weights };
  descriptiveCategories: { british: Weights; colonial: Weights };
  britishFuseChance: number;
  forms: {
    ancient: { scottishRegions: string[]; scottish: Weights; other: Weights };
    britishDescriptive: Weights;
    colonialDescriptive: Weights;
  };
  patterns: Record<RiverSetting, { pattern: string; weight: number }[]>;
}

export const RIVER_DATA = riverData as unknown as RiverData;

/** Every real river name in the corpora, lower-cased: a generated ancient name may match none. */
const REAL_NAMES = new Set(Object.values(RIVER_DATA.corpora).flat().map((n) => n.toLowerCase()));

export interface RiverOptions {
  setting: RiverSetting;
  /** British only: a region code, or undefined for All Britain. */
  region?: string;
  faithfulness?: number;
  strictness?: number;
}

export interface RiverName {
  text: string;
  /** True where the text contains a placeholder (patterns only; shown muted). */
  hasPlaceholder: boolean;
  /** The kind chosen by the setting's weights (an ancient name may fall back to descriptive words). */
  kind: RiverKind;
  /** The water word used, if any. */
  water?: string;
  /** The generated ancient name, before its form, when one was accepted. */
  ancient?: string;
  /** The name form drawn (§6.7). */
  form?: string;
}

interface Built {
  text: string;
  water?: string;
  form?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function pickWeighted(weights: Weights, rng: () => number): string {
  const items = Object.entries(weights).filter(([, w]) => w > 0);
  const total = items.reduce((n, [, w]) => n + w, 0);
  let r = rng() * total;
  for (const [item, w] of items) {
    r -= w;
    if (r < 0) return item;
  }
  return items[items.length - 1][0];
}
const pickUniform = <T>(items: readonly T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
const titleCase = (text: string) => text.replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
const letterCount = (w: string) => Array.from(w.replace(/[^\p{L}]/gu, "")).length;
const regionKey = (region: string | undefined) => (region && RIVER_DATA.regionCorpora[region] ? region : "all");

/** The water words for a setting (and, for British, a region). */
export function waterWordWeights(setting: RiverSetting, region?: string): Weights {
  return setting === "british" ? RIVER_DATA.waterWords.british[regionKey(region)] : RIVER_DATA.waterWords[setting];
}

// ── Ancient names ───────────────────────────────────────────────────────────

/** One model per corpus union, built once and reused (§6.3). */
const modelCache = new Map<string, MarkovModel>();
function ancientModel(region: string | undefined): MarkovModel {
  const corpora = RIVER_DATA.regionCorpora[regionKey(region)];
  const key = corpora.join("+");
  let model = modelCache.get(key);
  if (!model) {
    model = MarkovModel.build(corpora.flatMap((c) => RIVER_DATA.corpora[c]));
    modelCache.set(key, model);
  }
  return model;
}

/** §6.3: a new 3–8 letter name matching no real river, or null after 20 draws. */
function ancientName(options: RiverOptions, rng: () => number): string | null {
  const model = ancientModel(options.region);
  const { minLetters, maxLetters, draws } = RIVER_DATA.ancient;
  for (let i = 0; i < draws; i++) {
    const seed = Math.floor(rng() * 0x100000000) >>> 0;
    const name = model.generateDetailed({
      count: 1,
      faithfulness: options.faithfulness ?? 2,
      strictness: options.strictness ?? 3,
      seed,
    }).names[0];
    if (!name) continue;
    const letters = letterCount(name);
    if (letters < minLetters || letters > maxLetters || REAL_NAMES.has(name.trim().toLowerCase())) continue;
    return titleCase(name.trim().toLowerCase());
  }
  return null;
}

function ancientForm(name: string, region: string | undefined, rng: () => number): Built {
  const { scottishRegions, scottish, other } = RIVER_DATA.forms.ancient;
  const form = pickWeighted(region && scottishRegions.includes(region) ? scottish : other, rng);
  if (form === "river-x") return { text: `River ${name}`, form };
  if (form === "x-water") return { text: `${name} Water`, form };
  if (form === "water-of-x") return { text: `Water of ${name}`, form };
  return { text: name, form };
}

// ── Descriptive names ───────────────────────────────────────────────────────

/** A word from a built-in list (modern register) and a water word, joined; `bare` never adds River. */
function descriptiveName(options: RiverOptions, rng: () => number, bare: boolean): Built {
  const british = options.setting === "british";
  const category = pickWeighted(RIVER_DATA.descriptiveCategories[british ? "british" : "colonial"], rng);
  const entry: NameWordEntry = pickUniform(NAME_WORDS.categories[category], rng);
  const word = entry.modern;
  const water = pickWeighted(waterWordWeights(options.setting, options.region), rng);

  if (british) {
    // §6.5: fuse a fusing word when the join is clean and short enough, three times in four.
    const joined = entry.fuses === "yes" ? smoothJoin(word, water) : null;
    const fuses = joined !== null && letterCount(joined) <= NAMES.maxFusedLetters && rng() < RIVER_DATA.britishFuseChance;
    const name = fuses ? titleCase(joined!.toLowerCase()) : titleCase(`${word} ${water}`);
    if (bare) return { text: name, water, form: "bare" };
    const form = pickWeighted(RIVER_DATA.forms.britishDescriptive, rng);
    return { text: form === "river-x" ? `River ${name}` : name, water, form };
  }
  // §6.5, §6.7: colonial names are always spaced; the word alone only with "river". A fill (§6.9)
  // may never contain River, so with "river" it is always the word alone; it takes no form roll.
  if (bare) return water === "river" ? { text: titleCase(word), water, form: "bare" } : { text: titleCase(`${word} ${water}`), water, form: "x-water" };
  const form = pickWeighted(RIVER_DATA.forms.colonialDescriptive, rng);
  return form === "bare" && water === "river"
    ? { text: titleCase(word), water, form: "bare" }
    : { text: titleCase(`${word} ${water}`), water, form: "x-water" };
}

// ── Patterns ────────────────────────────────────────────────────────────────

function patternName(options: RiverOptions, rng: () => number): Built {
  const items = RIVER_DATA.patterns[options.setting];
  const pattern = pickWeighted(Object.fromEntries(items.map((p) => [p.pattern, p.weight])), rng);
  if (!pattern.includes("{water}")) return { text: pattern, form: pattern };
  const water = pickWeighted(waterWordWeights(options.setting, options.region), rng);
  return { text: pattern.replace("{water}", titleCase(water)), water, form: pattern };
}

// ── Public ──────────────────────────────────────────────────────────────────

/** One river name for this module: kind by the setting's weights, then that kind's forms. */
export function riverName(options: RiverOptions, rng: () => number): RiverName {
  const kind = pickWeighted(RIVER_DATA.kindWeights[options.setting], rng) as RiverKind;
  if (kind === "pattern") {
    const built = patternName(options, rng);
    return { ...built, hasPlaceholder: /\[[^\]]+\]/.test(built.text), kind };
  }
  if (kind === "ancient") {
    const name = ancientName(options, rng);
    // §6.3 step 4: no acceptable ancient name — a descriptive name takes its place.
    if (name) return { ...ancientForm(name, options.region, rng), hasPlaceholder: false, kind, ancient: name };
  }
  return { ...descriptiveName(options, rng, false), hasPlaceholder: false, kind };
}

/**
 * §6.9: a river for an unmapped river slot in another module — ancient or descriptive (never a
 * pattern), always bare: no brackets, no River, no Water of, no the.
 */
export function riverFill(options: RiverOptions, rng: () => number): string {
  const { pattern: _pattern, ...weights } = RIVER_DATA.kindWeights[options.setting];
  const kind = pickWeighted(weights, rng);
  if (kind === "ancient") {
    const name = ancientName(options, rng);
    if (name) return name;
  }
  return descriptiveName(options, rng, true).text;
}

export interface RiverBatchResult {
  names: RiverName[];
  seed: number;
  notice?: string;
}

/** §6.8: `count` distinct river names (case-insensitive), at most count × 50 attempts. */
export function generateRiverNames(options: RiverOptions & { count: number; seed?: number }): RiverBatchResult {
  const seed =
    options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const count = Math.max(0, Math.floor(options.count));
  const seen = new Set<string>();
  const names: RiverName[] = [];
  for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
    const name = riverName(options, rng);
    const key = name.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  const notice = names.length < count ? `Only ${names.length} river names could be generated.` : undefined;
  return { names, seed, notice };
}
