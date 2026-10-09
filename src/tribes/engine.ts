// Tribal names (Tribal brief §4–§17). No Obsidian imports.
//
// Modern-English names for fictional peoples, kin groups, confederations, dynasties and war-bands.
// A naming tradition decides how a name is built and what it favours; a biome decides which nature
// words exist (§3.1). Every draw comes from one seeded stream; the pipeline runs tradition → biome →
// group type → perspective and tone → theme → template → words → rendering → safeguards (§4).

import tribalData from "../data/tribal-names.json";
import { type Biome, biomeTitleCase, biomeWords, findBiome, pluralOf, TERRAIN_CHOICES, type TerrainId, TERRAINS, terrainWords } from "../biomes";
import { mulberry32 } from "../markov";

export type TribalRegister = "plain" | "historical" | "legendary" | "administrative";
export type BiomeMode = "homeland" | "chosen";

interface Suppression {
  word: string;
  mult: number;
  kind: "homeland" | "culture";
}

interface Orientation {
  system: string;
  mult: number;
  words?: string[];
}

export interface TribalTradition {
  key: string;
  label: string;
  group: "General" | "First release" | "Second release" | "Expansion";
  drawsOn: string;
  homeland: Record<string, number>;
  terrainMultipliers: Partial<Record<TerrainId, number>>;
  flavour: Partial<Record<"animals" | "plants" | "land" | "water" | "lifeways", string[]>>;
  favouredLifeways: string[];
  orientation: Orientation[];
  lineage: Partial<Record<"patrilineal" | "matrilineal" | "bilateral", number>>;
  lineageMultipliers: Record<string, number>;
  signatureCollectives: string[];
  themes: Record<string, number>;
  templates: Record<string, number>;
  groupTypes: Record<string, number>;
  numbers: string[];
  suppress: Suppression[];
  special: {
    longship?: boolean;
    colourCollectives?: string[];
    paintedMoccasin?: boolean;
    clanAnimal?: boolean;
    ancestorAnimal?: number;
    dragon?: number;
    waterHill?: number;
    longhouse?: boolean;
    migrationGuide?: number;
    clanTaboo?: number;
    lineageSacred?: string[];
    sacredOnly?: string[];
  };
}

interface CollectiveRow {
  word: string;
  groupTypes: string[];
  registers: string[] | "all";
  person?: boolean;
  traditions?: string[];
  traditionMult?: Record<string, number>;
  perspectives?: string[];
  mult?: number;
  groupMult?: Record<string, number>;
  lineage?: boolean;
  descent?: "patrilineal" | "matrilineal";
  singular?: boolean;
  role?: boolean;
  gate?: "mounts" | "arrows" | "tents";
  horse?: boolean;
}

interface TribalData {
  traditions: TribalTradition[];
  groupTypes: { key: string; label: string; weight: number }[];
  groupTypeThemes: Record<string, Record<string, number>>;
  perspectives: Record<string, number>;
  perspectiveLabels: Record<string, string>;
  perspectiveByGroupType: Record<string, Record<string, number>>;
  tones: { toned: Record<string, number>; plain: Record<string, number> };
  themes: Record<string, number>;
  parityCap: number;
  vocabulary: {
    warfareUniversal: string[];
    warfareRestricted: Record<string, Record<string, number>>;
    warfareObjects: string[];
    sacredUniversal: string[];
    mythic: Record<string, Record<string, number>>;
    directions: Record<string, string[]>;
    colourDirections: Record<string, string>;
    qualities: string[];
    interpretiveQualities: string[];
    nominalQualities: string[];
    colours: string[];
    numbers: string[];
    countedNouns: string[];
    countedFeatures: string[];
    speech: { whole: string[]; tongues: string[]; descriptor: string; hostile: string[] };
    dress: string[];
    ancestors: string[];
    canoes: string[];
    voyages: string[];
    relationship: string[];
    hostile: Record<string, string>;
    origins: string[];
    kPhrases: { theme: string; verb: string; slot: string; gate?: string }[];
  };
  collectives: CollectiveRow[];
  lineageCollectives: string[];
  templates: {
    weights: Record<string, number[]>;
    themes: Record<string, string[]>;
    groupTypes: Record<string, string[]>;
    perspectives: Record<string, string[]>;
    traditions: Record<string, Record<string, number>>;
    tail: string[];
  };
  registers: TribalRegister[];
  registerLabels: Record<TribalRegister, string>;
  lengthCaps: Record<TribalRegister, number>;
  personCollectives: string[];
  history: {
    coinage: Record<string, string[]>;
    meaning: Record<string, string>;
    qualityGloss: Record<string, string>;
    directionGloss: Record<string, string>;
    dressGloss: Record<string, string>;
    acceptance: Record<string, string>;
    acceptanceWeights: Record<string, Record<string, number>>;
    drift: Record<string, string>;
    driftWeights: Record<string, number>;
    interpretations: { key: string; weight: number; text: string }[];
    transplanted: string;
    echo: string;
  };
  safeguards: { blockList: string[]; flagList: string[]; flagListBlocks: boolean; banned: string[] };
}

export const TRIBAL_DATA = tribalData as unknown as TribalData;
const V = TRIBAL_DATA.vocabulary;

/** The 17 traditions in menu order (§5.1). */
export const TRIBAL_TRADITIONS: readonly TribalTradition[] = TRIBAL_DATA.traditions;
export const TRIBAL_REGISTERS: readonly TribalRegister[] = TRIBAL_DATA.registers;
export const TRIBAL_GROUP_TYPES = TRIBAL_DATA.groupTypes;
export const TRIBAL_PERSPECTIVES = Object.keys(TRIBAL_DATA.perspectives);
/** §14.6: words a colour may not directly modify. */
export const PERSON_COLLECTIVES: readonly string[] = TRIBAL_DATA.personCollectives;

export function findTradition(key: string | undefined): TribalTradition | undefined {
  return TRIBAL_TRADITIONS.find((t) => t.key === key);
}

// ── Options and output (§16) ────────────────────────────────────────────────

/** Narrowing used when tribal names fill a recipe slot (§20.2). */
export interface TribalConstraints {
  /** Template weights replacing the register's (missing templates are excluded). */
  templates?: Record<string, number>;
  /** Registers drawn per name, replacing `register`. */
  registers?: Partial<Record<TribalRegister, number>>;
  groupTypes?: string[];
  perspectiveMultipliers?: Record<string, number>;
  maxWords?: number;
  noTail?: boolean;
  /** Template J's first form only ("Twelve Arrows"). */
  jFirstFormOnly?: boolean;
  /** Skip alternatives and histories (slot fills only need the headword). */
  headwordOnly?: boolean;
}

export interface TribalOptions {
  tradition: string;
  /** A biome id; undefined is Homeland (§3.7). */
  biome?: string;
  register?: TribalRegister;
  /** A group type key; undefined is Any. */
  groupType?: string;
  /** A perspective key; undefined is Any. */
  perspective?: string;
  hostile?: boolean;
  constraints?: TribalConstraints;
  /** Land brief §11: a terrain id (custom terrains too) or "any". */
  terrain?: string;
  /** Land brief §11: a resolved biome (a user pack), used in place of `biome`. */
  biomeData?: Biome;
  /** Land brief §10: the merged safeguard lists; the built-in lists when absent. */
  safeguards?: { block: string[]; flag: string[]; flagBlocks: boolean };
}

export interface TribalName {
  name: string;
  inText: string;
  tradition: string;
  biome: string;
  biomeMode: BiomeMode;
  terrain: string | null;
  groupType: string;
  perspective: string;
  tone: "respectful" | "neutral" | "hostile";
  register: TribalRegister;
  theme: string;
  template: string;
  /** The word carrying the theme ("Heron", "Sun", "Reef Fishers"). */
  keyword: string;
  literalMeaning: string;
  interpretation: string | null;
  acceptance: string;
  drift: string;
  origin: string;
  alternativeNames: string[];
  slots: string[];
  echoesReal: boolean;
  historicity: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

type Rng = () => number;
type Pool = Map<string, number>;

function pick<T>(items: readonly [T, number][], rng: Rng): T | undefined {
  const live = items.filter(([, w]) => w > 0);
  if (live.length === 0) return undefined;
  const total = live.reduce((n, [, w]) => n + w, 0);
  let r = rng() * total;
  for (const [item, w] of live) {
    r -= w;
    if (r < 0) return item;
  }
  return live[live.length - 1][0];
}
const pickRecord = (weights: Record<string, number>, rng: Rng) => pick(Object.entries(weights), rng);
const pickPool = (pool: Pool, rng: Rng) => pick([...pool.entries()], rng);
const pickUniform = <T>(items: readonly T[], rng: Rng): T => items[Math.floor(rng() * items.length)];
const add = (pool: Pool, word: string, weight: number) => {
  if (weight > 0) pool.set(word, (pool.get(word) ?? 0) + weight);
};
const lower = (s: string) => s.toLowerCase();
const wordRe = (w: string) => new RegExp(`(^|[^A-Za-z])${w.replace(/[-']/g, "\\$&")}s?($|[^A-Za-z])`, "i");

/** §14.2: title case; a, an, and, at, by, in, of, on, the, to stay lower unless first. */
const SMALL = new Set(["a", "an", "and", "at", "by", "in", "of", "on", "the", "to"]);
function tribalTitleCase(text: string): string {
  return text
    .split(" ")
    .map((word, i) => {
      if (i > 0 && SMALL.has(word.toLowerCase())) return word.toLowerCase();
      return word
        .split("-")
        .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
        .join("-");
    })
    .join(" ");
}

// ── Context ─────────────────────────────────────────────────────────────────

interface Ctx {
  trad: TribalTradition;
  biome: Biome;
  mode: BiomeMode;
  terrainWeights: Record<string, number>;
  register: TribalRegister;
  groupType: string;
  perspective: string;
  tone: "respectful" | "neutral" | "hostile";
  theme: string;
  lineage: string;
  rng: Rng;
  opts: TribalOptions;
  /** The terrain of the last landscape or water word drawn. */
  terrain: string | null;
  /** Words to reuse when building alternatives (§16). */
  pin: Map<string, string>;
}

interface Parts {
  keyword: string;
  feature?: string;
  emblem?: string;
  animal?: string;
  plant?: string;
  sacred?: string;
  direction?: string;
  quality?: string;
  number?: string;
  lifeway?: string;
  dress?: string;
  ancestor?: string;
  vessel?: string;
  collective?: string;
  /** Where the optional tail starts, so an over-long name can drop it (§14.5). */
  tailAt?: number;
}

/** A terrain's share after the tradition's multipliers, in percent (§3.8). */
const share = (ctx: Ctx, ...terrains: TerrainId[]) => terrains.reduce((n, t) => n + (ctx.terrainWeights[t] ?? 0), 0);

/**
 * Terrain shares in percent after the tradition's multipliers (§3.8). Land brief §11: a chosen
 * terrain the biome has is the only one; custom terrains count as plains for gating.
 */
function effectiveTerrains(trad: TribalTradition, biome: Biome, terrain?: string): Record<string, number> {
  const zero = Object.fromEntries(TERRAINS.map((t) => [t, 0])) as Record<string, number>;
  if (terrain && terrain !== "any" && (biome.terrainWeights[terrain] ?? 0) > 0) return { ...zero, [terrain]: 100 };
  const keys = Object.keys(biome.terrainWeights);
  const raw = Object.fromEntries(keys.map((t) => [t, biome.terrainWeights[t] * (trad.terrainMultipliers[t as TerrainId] ?? 1)]));
  const total = Object.values(raw).reduce((n, w) => n + w, 0) || 1;
  return { ...zero, ...Object.fromEntries(keys.map((t) => [t, (raw[t] * 100) / total])) };
}

/** §5.4: a suppression multiplier for a word (homeland suppressions only in Homeland mode). */
function suppression(ctx: Ctx, word: string): number {
  let m = 1;
  for (const s of ctx.trad.suppress) {
    if (s.kind === "homeland" && ctx.mode === "chosen") continue;
    const hit = s.word === "Horse" ? isHorseWord(word) : wordRe(s.word).test(word);
    if (hit) m *= s.mult;
  }
  return m;
}
const isHorseWord = (word: string) => /(^|[^a-z])(horse|horses|mare)($|[^a-z])/i.test(word);

/** Mounts a people could ride (§3.8): horse, camel, reindeer, yak or llama at weight ≥ 1. */
function mounts(ctx: Ctx): string[] {
  return biomeWords(ctx.biome, "livestock")
    .filter(([w, n]) => ["horse", "camel", "reindeer", "yak", "llama"].includes(w) && n >= 1)
    .map(([w]) => w)
    .filter((w) => w !== "horse" || suppression(ctx, "Horse") > 0);
}
const hasLivestock = (ctx: Ctx, animal: string) => biomeWords(ctx.biome, "livestock").some(([w, n]) => w === animal && n >= 1);

// ── Vocabulary pools (§8.1, §9) ─────────────────────────────────────────────

/** §13: suppressions, banned words; returns the word's surviving weight. */
function filtered(ctx: Ctx, word: string, weight: number): number {
  if (weight <= 0) return 0;
  if (TRIBAL_DATA.safeguards.banned.some((b) => wordRe(b).test(word))) return 0;
  return weight * suppression(ctx, word);
}

function landPool(ctx: Ctx, kind: "land" | "water", terrain: string): Pool {
  const pool: Pool = new Map();
  for (const [w, n] of terrainWords(ctx.biome, kind, terrain)) add(pool, w, filtered(ctx, w, n));
  if (ctx.mode === "homeland") for (const w of ctx.trad.flavour[kind] ?? []) add(pool, w, filtered(ctx, w, 3));
  return pool;
}

/** A landscape or water word, its terrain drawn by weight among those with words (§3.3). */
function featureWord(ctx: Ctx, kind: "land" | "water" | "any"): string | undefined {
  const pinned = ctx.pin.get(kind === "any" ? "feature" : kind) ?? ctx.pin.get("feature");
  if (pinned) return pinned;
  const k = kind === "any" ? (ctx.rng() < 0.5 ? "land" : "water") : kind;
  const terrains = Object.keys(ctx.terrainWeights).map((t): [string, number] => [t, landPool(ctx, k, t).size > 0 ? ctx.terrainWeights[t] : 0]);
  const terrain = pick(terrains, ctx.rng);
  if (!terrain) return kind === "any" ? featureWord(ctx, k === "land" ? "water" : "land") : undefined;
  ctx.terrain = terrain;
  return pickPool(landPool(ctx, k, terrain), ctx.rng);
}

const hasColour = (word: string) => V.colours.some((c) => word.toLowerCase().includes(c.toLowerCase())) || /yellow/i.test(word);

/** §11.1: a feature or emblem takes a colour with probability 0.2, never on one that has one. */
function withColour(ctx: Ctx, word: string): string {
  if (ctx.rng() >= 0.2 || hasColour(word)) return word;
  return `${pickUniform(V.colours, ctx.rng)} ${word}`;
}

function animalPool(ctx: Ctx, wild = false): Pool {
  const pool: Pool = new Map();
  const b = ctx.biome;
  const lists: [Parameters<typeof biomeWords>[1], number][] = wild
    ? [["wildAnimals", 1], ["birds", 1]]
    : [["wildAnimals", 1], ["birds", 1], ["creatures", 0.7], ["livestock", 0.5]];
  for (const [list, factor] of lists) {
    for (const [w, n] of biomeWords(b, list)) {
      const word = biomeTitleCase(w);
      add(pool, word, filtered(ctx, word, 2 * factor * n));
    }
  }
  if (ctx.mode === "homeland") for (const w of ctx.trad.flavour.animals ?? []) add(pool, w, filtered(ctx, w, 3));
  if (!wild && ctx.register === "legendary") {
    for (const [w, mults] of Object.entries(V.mythic)) add(pool, w, filtered(ctx, w, 0.5 * (mults[ctx.trad.key] ?? 1)));
  }
  return pool;
}

function plantPool(ctx: Ctx): Pool {
  const pool: Pool = new Map();
  for (const [list, factor] of [["trees", 1], ["plants", 1], ["crops", 0.5]] as const) {
    for (const [w, n] of biomeWords(ctx.biome, list)) {
      const word = biomeTitleCase(w);
      add(pool, word, filtered(ctx, word, 2 * factor * n));
    }
  }
  if (ctx.mode === "homeland") for (const w of ctx.trad.flavour.plants ?? []) add(pool, w, filtered(ctx, w, 3));
  return pool;
}

function sacredPool(ctx: Ctx): Pool {
  const pool: Pool = new Map();
  // §17.2: Australia & New Guinea uses Sun, Moon, Rain and Springs only, in every biome.
  const only = ctx.trad.special.sacredOnly;
  if (only) {
    for (const w of only) add(pool, w, 1);
    return pool;
  }
  for (const w of V.sacredUniversal) add(pool, w, filtered(ctx, w, 1));
  for (const [w, n] of biomeWords(ctx.biome, "sacred")) add(pool, w, filtered(ctx, w, 2 * n));
  return pool;
}

function lifewayPool(ctx: Ctx): Pool {
  const pool: Pool = new Map();
  const canRide = mounts(ctx).length > 0;
  const fav = new Set(ctx.trad.favouredLifeways);
  const gate = (w: string) => (w === "Riders" && !canRide ? 0 : 1);
  for (const [w, n] of biomeWords(ctx.biome, "lifeways")) add(pool, w, filtered(ctx, w, n * (fav.has(w) ? 2 : 1) * gate(w)));
  if (ctx.mode === "homeland") for (const w of ctx.trad.flavour.lifeways ?? []) add(pool, w, filtered(ctx, w, 10 * gate(w)));
  return pool;
}

const materials = (ctx: Ctx): Pool => {
  const pool: Pool = new Map();
  for (const [w, n] of biomeWords(ctx.biome, "materials")) add(pool, w, filtered(ctx, w, n));
  return pool;
};

/** §9.1: universal warfare words plus the restricted ones this tradition allows. */
function warfarePool(ctx: Ctx, objectsOnly = false): Pool {
  const pool: Pool = new Map();
  const restricted = (w: string) => {
    const allowed = V.warfareRestricted[w];
    if (!allowed) return 1;
    const m = allowed[ctx.trad.key] ?? allowed["*"] ?? 0;
    if (w === "War Canoe" && share(ctx, "coast", "rivers", "islands") < 20) return m * 0.2;
    return m;
  };
  const words = objectsOnly ? V.warfareObjects : [...V.warfareUniversal, ...Object.keys(V.warfareRestricted)];
  for (const w of words) add(pool, w, filtered(ctx, w, restricted(w)));
  return pool;
}

/** §9.3: the tradition's direction systems, each sharing its weight among its words; §3.8 gating. */
function directionPool(ctx: Ctx, { halves = false, colours = true } = {}): Pool {
  const pool: Pool = new Map();
  for (const o of ctx.trad.orientation) {
    let words = o.words ?? V.directions[o.system] ?? [];
    if (!halves) words = words.filter((w) => !w.endsWith(" Half"));
    if (!colours && o.system === "colourDirection") continue;
    let m = o.mult;
    if (o.system === "seaAxis" && share(ctx, "coast", "islands") < 10) m *= 0.2;
    if (o.system === "riverAxis" && share(ctx, "rivers") < 15) m *= 0.2;
    for (const w of words) add(pool, w, filtered(ctx, w, m));
  }
  return pool;
}

function qualityPool(ctx: Ctx): Pool {
  const pool: Pool = new Map();
  for (const w of V.qualities) add(pool, w, 1);
  if (["self", "dynastic", "ceremonial"].includes(ctx.perspective)) for (const w of V.interpretiveQualities) add(pool, w, 1);
  return pool;
}

function dressPool(ctx: Ctx): Pool {
  const pool: Pool = new Map();
  const id = ctx.biome.id;
  const gate: Record<string, boolean> = {
    "Bear-Cloak": biomeWords(ctx.biome, "wildAnimals").some(([w]) => w === "bear"),
    "Fur-Cloak": id === "boreal" || id === "highland",
    "Feather-Cloak": id === "rainforest" || id === "tropical-islands",
    Veiled: id === "desert",
    "Painted-Moccasin": !!ctx.trad.special.paintedMoccasin,
  };
  for (const w of V.dress) add(pool, w, filtered(ctx, w, gate[w] === false ? 0 : 1));
  return pool;
}

function numberWord(ctx: Ctx): string {
  const preferred = new Set(ctx.trad.numbers);
  return pick(V.numbers.map((n): [string, number] => [n, preferred.has(n) ? 3 : 0.3]), ctx.rng)!;
}

/** §3.8 gating for counted nouns; Arrows follows the Bow rule. */
function countedOk(ctx: Ctx, noun: string): number {
  const id = ctx.biome.id;
  switch (noun) {
    case "Islands":
      return share(ctx, "islands") >= 5 ? 1 : 0;
    case "Canoes":
      return share(ctx, "coast", "rivers") >= 20 ? 1 : 0;
    case "Rivers":
    case "Streams":
    case "Lakes":
      return share(ctx, "rivers") >= 15 ? 1 : 0;
    case "Wells":
      return id === "desert" || id === "steppe" ? 1 : 0;
    case "Tents":
      return id === "steppe" || id === "desert" || id === "boreal" ? 1 : 0;
    case "Arrows": {
      const allowed = V.warfareRestricted.Arrow;
      return allowed[ctx.trad.key] ?? allowed["*"] ?? 0;
    }
    case "Fires":
      return ctx.trad.key === "northAmerican" ? 3 : 1;
    default:
      return 1;
  }
}

function vesselWord(ctx: Ctx): string | undefined {
  const pinned = ctx.pin.get("vessel");
  if (pinned) return pinned;
  const rng = ctx.rng;
  // §9.10: in a chosen biome, one canoe name in three is built from its birds and creatures.
  if (ctx.mode === "chosen" && rng() < 1 / 3) {
    const pool: Pool = new Map();
    for (const list of ["birds", "creatures"] as const) for (const [w, n] of biomeWords(ctx.biome, list)) add(pool, biomeTitleCase(w), filtered(ctx, w, n));
    const animal = pickPool(pool, rng);
    if (animal) return `the ${pickUniform(V.colours, rng)} ${animal} Canoe`;
  }
  const pool: Pool = new Map();
  for (const c of V.canoes) add(pool, c, 2);
  for (const v of V.voyages) add(pool, v, 1);
  if (ctx.trad.special.longship) add(pool, "the Longship", 2);
  if (share(ctx, "rivers") >= 25) add(pool, "the Raft", 1);
  return pickPool(pool, rng);
}

// ── Collectives (§10) ───────────────────────────────────────────────────────

interface CollectiveFilter {
  lineageOnly?: boolean;
  roleOnly?: boolean;
  personOnly?: boolean;
  only?: string[];
}

function collectivePool(ctx: Ctx, filter: CollectiveFilter = {}): Pool {
  const pool: Pool = new Map();
  const lineageSet = new Set(TRIBAL_DATA.lineageCollectives);
  const signature = new Set(ctx.trad.signatureCollectives);
  for (const row of TRIBAL_DATA.collectives) {
    if (!row.groupTypes.includes(ctx.groupType)) continue;
    if (row.registers !== "all" && !row.registers.includes(ctx.register)) continue;
    if (row.perspectives && !row.perspectives.includes(ctx.perspective)) continue;
    if (row.descent && row.descent !== ctx.lineage) continue;
    if (filter.lineageOnly && !lineageSet.has(row.word)) continue;
    if (filter.roleOnly && !row.role) continue;
    if (filter.personOnly && !row.person) continue;
    if (filter.only && !filter.only.includes(row.word)) continue;
    let w = row.groupMult?.[ctx.groupType] ?? row.mult ?? 1;
    // §10: a collective restricted to named traditions is ×0 elsewhere, except General (×0.3).
    if (row.traditions && !row.traditions.includes(ctx.trad.key)) w *= ctx.trad.key === "general" ? 0.3 : 0;
    w *= row.traditionMult?.[ctx.trad.key] ?? 1;
    if (signature.has(row.word)) w *= 2;
    w *= ctx.trad.lineageMultipliers[row.word] ?? 1;
    if (row.gate === "mounts" && mounts(ctx).length === 0) w = 0;
    if (row.gate === "arrows" || row.gate === "tents") w *= countedOk(ctx, row.gate === "arrows" ? "Arrows" : "Tents");
    add(pool, row.word, filtered(ctx, row.word, w));
  }
  return pool;
}
const collective = (ctx: Ctx, filter?: CollectiveFilter) => pickPool(collectivePool(ctx, filter), ctx.rng);

// ── Weights for the pipeline (§6–§8, §11) ───────────────────────────────────

/** §8.1 and §17.4: theme weights after the tradition's multipliers, animals + sacred capped at 40%. */
export function traditionThemeWeights(trad: TribalTradition): Record<string, number> {
  const raw = Object.fromEntries(Object.entries(TRIBAL_DATA.themes).map(([k, w]) => [k, w * (trad.themes[k] ?? 1)]));
  const total = Object.values(raw).reduce((n, w) => n + w, 0);
  const pct = Object.fromEntries(Object.entries(raw).map(([k, w]) => [k, (w * 100) / total]));
  const capped = pct.animals + pct.sacred;
  const cap = TRIBAL_DATA.parityCap;
  if (capped <= cap) return pct;
  const scale = cap / capped;
  const others = 100 - capped;
  const lift = (100 - cap) / others;
  return Object.fromEntries(Object.entries(pct).map(([k, w]) => [k, k === "animals" || k === "sacred" ? w * scale : w * lift]));
}

/** Group types a tradition can name (multiplier > 0), with their weights. */
export function traditionGroupTypeWeights(trad: TribalTradition): Record<string, number> {
  return Object.fromEntries(TRIBAL_DATA.groupTypes.map((g) => [g.key, g.weight * (trad.groupTypes[g.key] ?? 1)]));
}

function themeWeights(ctx: Ctx): Record<string, number> {
  const base = traditionThemeWeights(ctx.trad);
  const matrix = TRIBAL_DATA.groupTypeThemes[ctx.groupType];
  const out: Record<string, number> = {};
  for (const [theme, w] of Object.entries(base)) {
    let m = w * (matrix[theme] ?? 0);
    if (theme === "vessel" && share(ctx, "coast", "rivers", "islands") < 20) m *= 0.2;
    out[theme] = m;
  }
  return out;
}

function templateWeights(ctx: Ctx): Record<string, number> {
  const T = TRIBAL_DATA.templates;
  const ri = TRIBAL_REGISTERS.indexOf(ctx.register);
  const fixed = ctx.opts.constraints?.templates;
  const out: Record<string, number> = {};
  for (const [key, weights] of Object.entries(T.weights)) {
    let w = fixed ? fixed[key] ?? 0 : weights[ri] * (ctx.trad.templates[key] ?? 1);
    if (!T.themes[key].includes(ctx.theme)) w = 0;
    if (T.groupTypes[key] && !T.groupTypes[key].includes(ctx.groupType)) w = 0;
    if (T.perspectives[key] && !T.perspectives[key].includes(ctx.perspective)) w = 0;
    if (T.traditions[key]) w *= T.traditions[key][ctx.trad.key] ?? 0;
    out[key] = w;
  }
  return out;
}

// ── Templates (§11) ─────────────────────────────────────────────────────────

type Built = { text: string; parts: Parts } | null;

function animal(ctx: Ctx, wild = false): string | undefined {
  return ctx.pin.get("animal") ?? pickPool(animalPool(ctx, wild), ctx.rng);
}
function plant(ctx: Ctx): string | undefined {
  return ctx.pin.get("plant") ?? pickPool(plantPool(ctx), ctx.rng);
}
function sacred(ctx: Ctx): string | undefined {
  return ctx.pin.get("sacred") ?? pickPool(sacredPool(ctx), ctx.rng);
}

const LEADING_DIRECTION = /^(Upper|Lower|Outer|Inner|Far|Near|North|South|East|West|Northern|Southern|Eastern|Western|Central|Middle)\b/;

/** A feature for a tail or place, sometimes led by a direction ("Western Ridge"). */
function place(ctx: Ctx, kind: "land" | "water" | "any" = "any", directionChance = 0.25): string | undefined {
  const f = featureWord(ctx, kind);
  if (!f) return undefined;
  if (ctx.rng() < directionChance && !LEADING_DIRECTION.test(f) && !/^(Twin|Three|Seven|Thousand|Hundred)\b/.test(f)) {
    const d = pickPool(directionPool(ctx, { colours: false }), ctx.rng);
    if (d && !/[ -]/.test(d) && !["Beyond", "Across", "Between", "Around"].includes(d)) return `${d} ${f}`;
  }
  return f;
}

/** The themed word for templates that take one word before a collective (A, B). */
function themedWord(ctx: Ctx, parts: Parts): string | undefined {
  switch (ctx.theme) {
    case "landscape":
      return (parts.feature = featureWord(ctx, "land"));
    case "water":
      return (parts.feature = featureWord(ctx, "water"));
    case "animals":
      return (parts.animal = animal(ctx));
    case "plants":
      return (parts.plant = plant(ctx));
    case "sacred":
      return (parts.sacred = sacred(ctx));
    default:
      return undefined;
  }
}

function templateA(ctx: Ctx, parts: Parts): string | undefined {
  const rng = ctx.rng;
  switch (ctx.theme) {
    case "relationship": {
      const pool: Pool = new Map();
      for (const w of V.relationship) add(pool, w, w === "Tributaries" && !["imposed", "later"].includes(ctx.perspective) ? 0 : 1);
      return (parts.keyword = pickPool(pool, rng) ?? "");
    }
    case "qualities":
      parts.quality = pickPool(qualityPool(ctx), rng);
      break;
    case "warfare":
      parts.emblem = pickPool(warfarePool(ctx), rng);
      break;
    case "dress":
      parts.dress = pickPool(dressPool(ctx), rng);
      break;
    case "direction": {
      const d = pickPool(directionPool(ctx, { halves: ctx.groupType === "moiety" }), rng);
      parts.direction = d;
      // A moiety's half is a whole name ("Upper Half").
      if (d?.endsWith(" Half")) return d;
      break;
    }
    default:
      themedWord(ctx, parts);
  }
  const lead = parts.quality ?? parts.emblem ?? parts.dress ?? parts.direction ?? parts.feature ?? parts.animal ?? parts.plant ?? parts.sacred;
  const c = collective(ctx);
  if (!lead || !c) return undefined;
  parts.collective = c;
  return `${lead} ${c}`;
}

function templateB(ctx: Ctx, parts: Parts): string | undefined {
  const w = themedWord(ctx, parts);
  const c = collective(ctx);
  if (!w || !c) return undefined;
  parts.collective = c;
  return `${withColour(ctx, w)} ${c}`;
}

function ofTarget(ctx: Ctx, parts: Parts): string | undefined {
  if (ctx.theme === "vessel") {
    const v = (parts.vessel = vesselWord(ctx));
    return v;
  }
  const w = themedWord(ctx, parts);
  return w ? `the ${withColour(ctx, w)}` : undefined;
}

function templateC(ctx: Ctx, parts: Parts): string | undefined {
  const target = ofTarget(ctx, parts);
  const c = collective(ctx);
  if (!target || !c) return undefined;
  parts.collective = c;
  return `${c} of ${target}`;
}

function templateDH(ctx: Ctx, parts: Parts, linker: string): string | undefined {
  const w = themedWord(ctx, parts);
  const c = collective(ctx);
  if (!w || !c) return undefined;
  parts.collective = c;
  return `${c} ${linker} the ${w}`;
}

function templateE(ctx: Ctx, parts: Parts): string | undefined {
  const d = pickPool(directionPool(ctx), ctx.rng);
  const f = ctx.theme === "water" ? featureWord(ctx, "water") : ctx.theme === "landscape" ? featureWord(ctx, "land") : featureWord(ctx, "any");
  const c = collective(ctx);
  // A feature that already leads with a direction ("Lower River") takes no second one.
  if (!d || !f || !c || /^(Beyond|Across|Between|Around)$/.test(d) || LEADING_DIRECTION.test(f)) return undefined;
  parts.direction = d;
  parts.feature = f;
  parts.collective = c;
  return `${d} ${f} ${c}`;
}

function templateF(ctx: Ctx, parts: Parts): string | undefined {
  let emblem: string | undefined;
  if (ctx.theme === "warfare") {
    emblem = ctx.rng() < 0.8 ? pickPool(warfarePool(ctx, true), ctx.rng) : pickPool(materials(ctx), ctx.rng);
    parts.emblem = emblem;
  } else if (ctx.theme === "animals") emblem = parts.animal = animal(ctx);
  else emblem = parts.plant = plant(ctx);
  const c = collective(ctx);
  if (!emblem || !c || hasColour(emblem)) return undefined;
  parts.collective = c;
  return `${pickUniform(V.colours, ctx.rng)} ${emblem} ${c}`;
}

function templateG(ctx: Ctx, parts: Parts): string | undefined {
  let target: string | undefined;
  if (ctx.theme === "ancestor") target = parts.ancestor = ctx.pin.get("ancestor") ?? pickUniform(V.ancestors, ctx.rng);
  else target = ofTarget(ctx, parts);
  const c = collective(ctx, { lineageOnly: true });
  if (!target || !c) return undefined;
  parts.collective = c;
  return `${c} of ${target}`;
}

function templateI(ctx: Ctx, parts: Parts): string | undefined {
  const c = collective(ctx, { roleOnly: true });
  if (!c) return undefined;
  let p: string | undefined;
  if (ctx.theme === "sacred") p = parts.sacred = sacred(ctx);
  else if (ctx.theme === "warfare") p = parts.emblem = pickUniform(["Fort", "Stronghold", "Frontier", "March"], ctx.rng);
  else p = parts.feature = place(ctx, ctx.theme === "water" ? "water" : "land", 0.3);
  if (!p) return undefined;
  parts.collective = c;
  return `${c} of the ${p}`;
}

function templateJ(ctx: Ctx, parts: Parts): string | undefined {
  const n = (parts.number = numberWord(ctx));
  if (ctx.opts.constraints?.jFirstFormOnly || ctx.rng() < 0.5) {
    const noun = pick(V.countedNouns.map((w): [string, number] => [w, countedOk(ctx, w)]), ctx.rng);
    if (!noun) return undefined;
    return `${n} ${noun}`;
  }
  const noun = pick(V.countedFeatures.map((w): [string, number] => [w, countedOk(ctx, w)]), ctx.rng);
  const c = collective(ctx);
  if (!noun || !c) return undefined;
  parts.collective = c;
  parts.feature = `${n} ${noun}`;
  return `${c} of the ${n} ${noun}`;
}

function templateK(ctx: Ctx, parts: Parts): string | undefined {
  const phrases = V.kPhrases.filter((p) => p.theme === ctx.theme && (p.gate !== "mounts" || mounts(ctx).length > 0));
  const phrase = pickUniform(phrases, ctx.rng);
  if (!phrase) return undefined;
  let w: string | undefined;
  switch (phrase.slot) {
    case "land":
      w = parts.feature = featureWord(ctx, "land");
      break;
    case "water":
      w = parts.feature = featureWord(ctx, "water");
      break;
    case "origin": {
      const land = featureWord(ctx, "land");
      w = ctx.rng() < 0.5 || !land ? pickUniform(V.origins, ctx.rng) : `${pickUniform(V.colours, ctx.rng)} ${land}`;
      if (hasColour(land ?? "") && !V.origins.includes(w)) w = land;
      parts.feature = w;
      break;
    }
    case "animal":
      w = parts.animal = animal(ctx);
      break;
    case "sacred":
      w = parts.sacred = sacred(ctx);
      break;
    case "emblem":
      w = ctx.theme === "animals" ? (parts.animal = animal(ctx)) : (parts.emblem = pickPool(warfarePool(ctx, true), ctx.rng));
      break;
    default:
      w = parts.feature = place(ctx, ctx.theme === "water" ? "water" : "land", 0.3);
  }
  if (!w) return undefined;
  return `Those Who ${phrase.verb} ${w}`;
}

function templateL(ctx: Ctx, parts: Parts): string | undefined {
  const agent = (parts.lifeway = ctx.pin.get("lifeway") ?? pickPool(lifewayPool(ctx), ctx.rng));
  if (!agent) return undefined;
  if (!agent.includes(" ") && ctx.rng() < 0.6) {
    const f = featureWord(ctx, "any");
    if (f && !f.includes(" ")) {
      parts.feature = f;
      return `${f} ${agent}`;
    }
  }
  return agent;
}

function templateM(ctx: Ctx, parts: Parts): string | undefined {
  const s = V.speech;
  const r = ctx.rng();
  if (r < 0.3) return pickUniform(s.whole, ctx.rng);
  if (r < 0.65) return `Speakers of the ${pickUniform(s.tongues, ctx.rng)} Tongue`;
  const c = collective(ctx);
  if (!c) return undefined;
  parts.collective = c;
  return `${s.descriptor} ${c}`;
}

function templateN(ctx: Ctx, parts: Parts): string | undefined {
  const epithets = V.ancestors.filter((a) => !a.includes("'"));
  const a = (parts.ancestor = ctx.pin.get("ancestor") ?? pickUniform(epithets, ctx.rng));
  const c = collective(ctx, { personOnly: true });
  if (!a || !c || a.includes("'")) return undefined;
  parts.collective = c;
  const bare = a.replace(/^the /, "");
  return `${bare}${bare.endsWith("s") ? "'" : "'s"} ${c}`;
}

function templateO(ctx: Ctx, parts: Parts): string | undefined {
  const r = ctx.rng();
  if (ctx.theme === "relationship" || r >= 0.8) {
    parts.keyword = "True People";
    return "The True People";
  }
  if (r < 0.5) {
    const q = (parts.quality = pickPool(qualityPool(ctx), ctx.rng));
    return q ? `The ${q} Ones` : undefined;
  }
  const pool: Pool = new Map();
  for (const w of V.nominalQualities) add(pool, w, ["Free", "Proud", "Unconquered"].includes(w) && !["self", "dynastic", "ceremonial"].includes(ctx.perspective) ? 0 : 1);
  const q = (parts.quality = pickPool(pool, ctx.rng));
  return q ? `The ${q}` : undefined;
}

function templateP(ctx: Ctx, parts: Parts): string | undefined {
  let emblem: string | undefined;
  if (ctx.theme === "lifeway") {
    const agent = (parts.lifeway = pickPool(lifewayPool(ctx), ctx.rng));
    emblem = agent ? `${agent}'` : undefined;
  } else if (ctx.theme === "animals") emblem = parts.animal = animal(ctx);
  else emblem = parts.plant = plant(ctx);
  const house = collective(ctx, { only: ["House", "Clan"] }) ?? (ctx.groupType === "occupational" ? "Clan" : undefined);
  const p = place(ctx, "any", 0.5);
  if (!emblem || !house || !p) return undefined;
  parts.collective = house;
  parts.feature = p;
  return `${emblem} ${house} of the ${p}`;
}

function templateQ(ctx: Ctx, parts: Parts): string | undefined {
  let noun: string | undefined;
  if (ctx.theme === "animals") {
    const a = (parts.animal = animal(ctx));
    noun = a ? biomeTitleCase(pluralOf(a.toLowerCase())) : undefined;
  } else if (ctx.theme === "plants") {
    const p = (parts.plant = plant(ctx));
    noun = p ? biomeTitleCase(pluralOf(p.toLowerCase())) : undefined;
  } else noun = parts.feature = pickPool(materials(ctx), ctx.rng);
  const c = collective(ctx);
  if (!noun || !c) return undefined;
  parts.collective = c;
  // §5.3 Mesoamerican: in the legendary register a city-state may be a "Water-Hill".
  const wh = ctx.trad.special.waterHill;
  if (wh && ctx.register === "legendary" && ["settlement", "dynasty"].includes(ctx.groupType) && ctx.rng() < wh) {
    return `${c} of the Water-Hill of ${noun}`;
  }
  return `${c} of the Place of ${noun}`;
}

function templateR(ctx: Ctx, parts: Parts): string | undefined {
  const a = (parts.animal = animal(ctx, true));
  return a ? `Followers of the ${a}` : undefined;
}

function buildTemplate(ctx: Ctx, template: string, parts: Parts): string | undefined {
  switch (template) {
    case "A":
      return templateA(ctx, parts);
    case "B":
      return templateB(ctx, parts);
    case "C":
      return templateC(ctx, parts);
    case "D":
      return templateDH(ctx, parts, "by");
    case "E":
      return templateE(ctx, parts);
    case "F":
      return templateF(ctx, parts);
    case "G":
      return templateG(ctx, parts);
    case "H":
      return templateDH(ctx, parts, pickUniform(["Beyond", "Across", "Between"], ctx.rng));
    case "I":
      return templateI(ctx, parts);
    case "J":
      return templateJ(ctx, parts);
    case "K":
      return templateK(ctx, parts);
    case "L":
      return templateL(ctx, parts);
    case "M":
      return templateM(ctx, parts);
    case "N":
      return templateN(ctx, parts);
    case "O":
      return templateO(ctx, parts);
    case "P":
      return templateP(ctx, parts);
    case "Q":
      return templateQ(ctx, parts);
    case "R":
      return templateR(ctx, parts);
  }
  return undefined;
}

/** §9.12, §3.8: hostile names for the theme, gated by the biome. */
function hostileWord(ctx: Ctx): string | undefined {
  const pool: Pool = new Map();
  for (const [w, theme] of Object.entries(V.hostile)) {
    if (theme !== ctx.theme) continue;
    let ok = true;
    if (w === "Horse Stealers") ok = hasLivestock(ctx, "horse") && suppression(ctx, "Horse") > 0;
    if (w === "Goat Folk") ok = hasLivestock(ctx, "goat");
    if (w === "Fish-Eaters") ok = share(ctx, "coast", "rivers") >= 15;
    if (w === "Mud Folk" || w === "Marsh Crawlers") ok = share(ctx, "wetland") >= 5;
    add(pool, w, ok ? filtered(ctx, w, 1) : 0);
  }
  return pickPool(pool, ctx.rng);
}

// ── Rendering and safeguards (§14, §17) ─────────────────────────────────────

const norm = (s: string) => s.toLowerCase().replace(/^the /, "").trim();
const BUILT_IN_GUARDS = {
  block: new Set(TRIBAL_DATA.safeguards.blockList.map(norm)),
  flag: new Set(TRIBAL_DATA.safeguards.flagList.map(norm)),
  flagBlocks: TRIBAL_DATA.safeguards.flagListBlocks,
};
const guardCache = new WeakMap<object, typeof BUILT_IN_GUARDS>();
/** Land brief §10: the run's safeguard lists as sets (the built-in lists unless packs merged others). */
function safeguardSets(opts: TribalOptions): typeof BUILT_IN_GUARDS {
  const s = opts.safeguards;
  if (!s) return BUILT_IN_GUARDS;
  let sets = guardCache.get(s);
  if (!sets) {
    sets = { block: new Set(s.block.map(norm)), flag: new Set(s.flag.map(norm)), flagBlocks: s.flagBlocks };
    guardCache.set(s, sets);
  }
  return sets;
}

/** §14.6: a colour directly before a person-collective reads as a racial label. */
export function breaksColourRule(name: string, traditionKey: string): boolean {
  const words = name.split(" ");
  const colours = new Set([...V.colours, "Yellow"]);
  const exceptions = new Set(findTradition(traditionKey)?.special.colourCollectives ?? []);
  const persons = new Set(PERSON_COLLECTIVES);
  for (let i = 0; i < words.length - 1; i++) {
    if (colours.has(words[i]) && persons.has(words[i + 1]) && !exceptions.has(words[i + 1])) return true;
  }
  return false;
}

const ENGLISH = /^[A-Za-z' -]+$/;

function render(ctx: Ctx, template: string, text: string, parts: Parts): { headword: string; tail: boolean } | null {
  let base = text;
  let tail = false;
  // §11.1: the optional "of the [FEATURE]" tail.
  if (
    TRIBAL_DATA.templates.tail.includes(template) &&
    // P already ends "of the [PLACE]".
    template !== "P" &&
    !ctx.opts.constraints?.noTail &&
    !/ (of|by|beyond|across|between) /i.test(base) &&
    ctx.rng() < (ctx.register === "plain" ? 0.15 : 0.25)
  ) {
    const f = place(ctx, "any", 0.25);
    if (f && !base.includes(f)) {
      parts.tailAt = base.length;
      parts.feature = parts.feature ?? f;
      base = `${base} of the ${f}`;
      tail = true;
    }
  }
  let headword = tribalTitleCase(base);
  if (ctx.register === "historical" && !/^(The|Those) /.test(headword)) headword = `The ${headword}`;
  const cap = Math.min(TRIBAL_DATA.lengthCaps[ctx.register], ctx.opts.constraints?.maxWords ?? Infinity);
  if (headword.split(" ").length > cap) {
    if (!tail || parts.tailAt === undefined) return null;
    // §14.5: redraw without the tail first.
    headword = tribalTitleCase(base.slice(0, parts.tailAt));
    if (ctx.register === "historical" && !/^(The|Those) /.test(headword)) headword = `The ${headword}`;
    tail = false;
    if (headword.split(" ").length > cap) return null;
  }
  if (!ENGLISH.test(headword)) return null;
  if (breaksColourRule(headword, ctx.trad.key)) return null;
  if (TRIBAL_DATA.safeguards.banned.some((b) => wordRe(b).test(headword))) return null;
  const guards = safeguardSets(ctx.opts);
  if (guards.block.has(norm(headword))) return null;
  if (guards.flagBlocks && guards.flag.has(norm(headword))) return null;
  return { headword, tail };
}

// ── Histories (§15) ─────────────────────────────────────────────────────────

function historyPerspectiveKey(ctx: Ctx): string {
  return ctx.perspective === "neighbour" ? `neighbour.${ctx.tone}` : ctx.perspective === "imposed" ? "imposed" : ctx.perspective;
}

function directionGloss(ctx: Ctx, d: string): string {
  const colour = V.colourDirections[d];
  if (colour && ctx.trad.orientation.some((o) => o.system === "colourDirection")) return `in the ${colour}, whose colour is ${d.toLowerCase()}`;
  return TRIBAL_DATA.history.directionGloss[d] ?? "apart from their neighbours";
}

function interpretationFor(ctx: Ctx, template: string): string {
  const special = ctx.trad.special;
  const items: [string, number][] = TRIBAL_DATA.history.interpretations.map((i) => {
    let w = i.weight;
    let text = i.text;
    if (i.key === "taboo" && special.clanTaboo) w *= special.clanTaboo;
    if (i.key === "ancestor" && special.ancestorAnimal) w *= special.ancestorAnimal;
    if (i.key === "regional" && special.clanAnimal) {
      w *= 1.5;
      text = "clan animal";
    }
    return [text, w];
  });
  if (template === "R" && special.migrationGuide) items.push(["guide on the long migration", special.migrationGuide]);
  return pick(items, ctx.rng)!;
}

function sentence(text: string, fills: Record<string, string | undefined>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => fills[k] ?? k);
}

function history(ctx: Ctx, template: string, parts: Parts): { origin: string; meaning: string; interpretation: string | null; acceptance: string; drift: string } {
  const H = TRIBAL_DATA.history;
  const rng = ctx.rng;
  const feature = parts.feature ?? featureWord(ctx, "land") ?? "hills";
  const lifeway = parts.lifeway ? lower(parts.lifeway) : undefined;
  const custom =
    ctx.theme === "lifeway" && lifeway
      ? `their work as ${lifeway}`
      : ctx.theme === "dress" && parts.dress
        ? `their ${H.dressGloss[parts.dress]}`
        : ctx.theme === "speech"
          ? "the way they spoke"
          : ctx.theme === "warfare"
            ? "their skill in war"
            : ctx.theme === "animals" && parts.animal
              ? `their ${lower(parts.animal)} emblem`
              : "their ways";
  const ancestor = parts.ancestor ?? "a founding ancestor";
  const interpretation = ctx.theme === "animals" ? interpretationFor(ctx, template) : null;
  const fills: Record<string, string | undefined> = {
    feature,
    custom,
    ancestor,
    emblem: parts.emblem ? `the ${lower(parts.emblem)}` : "their weapons",
    animal: parts.animal ? lower(parts.animal) : "animal",
    plant: parts.plant ? lower(parts.plant) : "great tree",
    sacred: parts.sacred ?? "sacred places",
    direction: parts.direction ? directionGloss(ctx, parts.direction) : "apart from their neighbours",
    quality: parts.quality ? H.qualityGloss[parts.quality] : "a people apart",
    number: parts.number ? lower(parts.number) : "several",
    lifeway: lifeway ?? "farmers",
    dress: parts.dress ? H.dressGloss[parts.dress] : "their dress",
    vessel: parts.vessel ?? "the canoe",
    interpretation: interpretation ?? undefined,
  };
  const pkey = historyPerspectiveKey(ctx);
  const coinage = sentence(pickUniform(H.coinage[pkey], rng), fills);
  let meaning = sentence(H.meaning[ctx.theme], fills);
  // §15.2: a chosen biome outside the homeland may replace the meaning.
  if (ctx.mode === "chosen" && !(ctx.trad.homeland[ctx.biome.id] > 0) && rng() < 0.3) {
    meaning = sentence(H.transplanted, { biome: ctx.biome.phrase });
  }
  const acceptance = pickRecord(H.acceptanceWeights[pkey], rng)!;
  const drift = pickRecord(H.driftWeights, rng)!;
  return {
    origin: `${coinage} ${meaning} ${H.acceptance[acceptance]} ${H.drift[drift]}`.replace(/ {2,}/g, " "),
    meaning,
    interpretation,
    acceptance,
    drift,
  };
}

function literalMeaning(ctx: Ctx, parts: Parts): string {
  const H = TRIBAL_DATA.history;
  switch (ctx.theme) {
    case "landscape":
    case "water":
      return `The people associated with the ${parts.feature ?? "land"}`;
    case "animals":
      return `The people of the ${lower(parts.animal ?? "animal")}`;
    case "plants":
      return `The people of the ${lower(parts.plant ?? "tree")}`;
    case "sacred":
      return `Those who hold the ${parts.sacred ?? "sacred places"} holy`;
    case "direction":
      return `The people living ${parts.direction ? directionGloss(ctx, parts.direction) : "apart"}`;
    case "qualities": {
      const g = parts.quality ? H.qualityGloss[parts.quality] : "a people apart";
      return g.charAt(0).toUpperCase() + g.slice(1);
    }
    case "number":
      return `${parts.number ?? "Several"} groups bound together`;
    case "lifeway":
      return `The ${lower(parts.lifeway ?? "workers")}`;
    case "speech":
      return "A people known by their speech";
    case "dress":
      return `The people with ${parts.dress ? H.dressGloss[parts.dress] : "distinctive dress"}`;
    case "ancestor":
      return `Descendants of ${parts.ancestor ?? "a founding ancestor"}`;
    case "vessel":
      return `Descendants of those who arrived on ${parts.vessel ?? "the canoe"}`;
    case "relationship":
      return "A people defined by their place in the wider world";
    case "warfare":
      return `The people known for ${parts.emblem ? `the ${lower(parts.emblem)}` : "war"}`;
  }
  return "A people";
}

// ── Pipeline (§4) ───────────────────────────────────────────────────────────

const HOSTILE_PERSPECTIVES = new Set(["neighbour", "imposed"]);

interface Attempt {
  headword: string;
  template: string;
  parts: Parts;
}

/** One pass through perspective → theme → template → words → rendering, or null. */
function attempt(ctx: Ctx, fixed?: { perspective?: string; theme?: string; avoidTemplates?: Set<string> }): Attempt | null {
  const rng = ctx.rng;
  const opts = ctx.opts;
  // Perspective (§7.1, §6.3), honouring the user's choice and slot multipliers.
  const perspectiveWeights: Record<string, number> = {};
  for (const [p, w] of Object.entries(TRIBAL_DATA.perspectives)) {
    perspectiveWeights[p] = w * (TRIBAL_DATA.perspectiveByGroupType[ctx.groupType]?.[p] ?? 1) * (opts.constraints?.perspectiveMultipliers?.[p] ?? 1);
  }
  const wanted = fixed?.perspective ?? opts.perspective;
  ctx.perspective = wanted ?? pickRecord(perspectiveWeights, rng)!;
  // Tone (§7.2): hostile only with the toggle on; otherwise it becomes neutral.
  const toned = HOSTILE_PERSPECTIVES.has(ctx.perspective);
  let tone = pickRecord(toned ? TRIBAL_DATA.tones.toned : TRIBAL_DATA.tones.plain, rng) as Ctx["tone"];
  if (tone === "hostile" && !opts.hostile) tone = "neutral";
  ctx.tone = tone;
  // Lineage (§5.2).
  ctx.lineage = pickRecord(ctx.trad.lineage as Record<string, number>, rng)!;
  // Theme (§8).
  ctx.theme = fixed?.theme ?? pickRecord(themeWeights(ctx), rng) ?? "";
  if (!ctx.theme) return null;

  const parts: Parts = { keyword: "" };
  let template: string | undefined;
  let text: string | undefined;
  if (ctx.tone === "hostile") {
    const h = hostileWord(ctx);
    if (h) {
      template = ctx.theme === "speech" ? "M" : "A";
      text = h;
      parts.keyword = h;
    } else ctx.tone = "neutral";
  }
  if (!text) {
    const weights = templateWeights(ctx);
    for (const t of fixed?.avoidTemplates ?? []) weights[t] = 0;
    template = pickRecord(weights, rng);
    if (!template) return null;
    text = buildTemplate(ctx, template, parts);
  }
  if (!text || !template) return null;
  parts.keyword =
    parts.keyword ||
    parts.lifeway ||
    parts.animal ||
    parts.plant ||
    parts.sacred ||
    parts.ancestor ||
    parts.vessel ||
    parts.quality ||
    parts.dress ||
    parts.direction ||
    parts.number ||
    parts.emblem ||
    parts.feature ||
    text;
  const rendered = render(ctx, template, text, parts);
  if (!rendered) return null;
  return { headword: rendered.headword, template, parts };
}

function makeCtx(trad: TribalTradition, biome: Biome, mode: BiomeMode, groupType: string, register: TribalRegister, options: TribalOptions, rng: Rng): Ctx {
  return {
    trad,
    biome,
    mode,
    terrainWeights: effectiveTerrains(trad, biome, options.terrain),
    register,
    groupType,
    perspective: "self",
    tone: "neutral",
    theme: "",
    lineage: "bilateral",
    rng,
    opts: options,
    terrain: null,
    pin: new Map(),
  };
}

function inTextOf(headword: string): string {
  return headword.startsWith("The ") ? `the ${headword.slice(4)}` : headword.startsWith("Those ") ? headword : `the ${headword}`;
}

/** Group types open to a run: the tradition's (multiplier > 0), narrowed by the options. */
function groupTypeChoices(trad: TribalTradition, options: TribalOptions): Record<string, number> {
  const weights = traditionGroupTypeWeights(trad);
  const allowed = options.constraints?.groupTypes;
  for (const key of Object.keys(weights)) {
    if (options.groupType && key !== options.groupType) weights[key] = 0;
    if (allowed && !allowed.includes(key)) weights[key] = 0;
  }
  return weights;
}

/**
 * One tribal name, or null when none could be made (§4 failure handling): 20 attempts in the
 * tradition, then 20 in General with the same group type and biome.
 */
export function tribalName(options: TribalOptions, rng: Rng): TribalName | null {
  const trad = findTradition(options.tradition) ?? TRIBAL_TRADITIONS[0];
  const chosen = options.biomeData ?? findBiome(options.biome);
  const mode: BiomeMode = chosen ? "chosen" : "homeland";
  const biome = chosen ?? findBiome(pickRecord(trad.homeland, rng))!;
  const groupType = pickRecord(groupTypeChoices(trad, options), rng);
  if (!groupType) return null;
  const registerWeights = options.constraints?.registers;
  const register = (registerWeights ? pickRecord(registerWeights as Record<string, number>, rng) : options.register) as TribalRegister | undefined;
  const reg = register ?? "plain";
  const general = TRIBAL_TRADITIONS[0];
  for (const t of trad === general ? [trad] : [trad, general]) {
    const ctx = makeCtx(t, biome, mode, groupType, reg, options, rng);
    for (let i = 0; i < 20; i++) {
      const a = attempt(ctx);
      if (a) return finish(ctx, a, trad, options);
    }
  }
  return null;
}

function finish(ctx: Ctx, a: Attempt, requested: TribalTradition, options: TribalOptions): TribalName {
  const parts = a.parts;
  const headwordOnly = options.constraints?.headwordOnly;
  const echoesReal = safeguardSets(options).flag.has(norm(a.headword));
  const base = {
    name: a.headword,
    inText: inTextOf(a.headword),
    tradition: requested.key,
    biome: ctx.biome.id,
    biomeMode: ctx.mode,
    terrain: ctx.terrain,
    groupType: ctx.groupType,
    perspective: ctx.perspective,
    tone: ctx.tone,
    register: ctx.register,
    theme: ctx.theme,
    template: a.template,
    keyword: parts.keyword,
    slots: [] as string[],
    echoesReal,
    historicity:
      `Fictional modern-English name inspired by ${requested.label} naming patterns` +
      (ctx.mode === "chosen" && !(requested.homeland[ctx.biome.id] > 0) ? `, set in ${ctx.biome.phrase}` : ""),
  };
  if (headwordOnly) {
    return { ...base, literalMeaning: "", interpretation: null, acceptance: "", drift: "", origin: "", alternativeNames: [] };
  }
  const h = history(ctx, a.template, parts);
  let origin = h.origin;
  if (echoesReal) origin += ` ${TRIBAL_DATA.history.echo}`;
  const alternatives = alternativeNames(ctx, a);
  if (alternatives.other) origin += ` ${alternatives.other}`;
  return {
    ...base,
    literalMeaning: literalMeaning(ctx, parts),
    interpretation: h.interpretation,
    acceptance: h.acceptance,
    drift: h.drift,
    origin,
    alternativeNames: alternatives.names,
  };
}

/** §16: two to four alternatives from the same semantic core with different templates; with
 * probability 0.3 one comes from a different perspective, and the history says so. */
function alternativeNames(ctx: Ctx, a: Attempt): { names: string[]; other?: string } {
  const rng = ctx.rng;
  const want = 2 + Math.floor(rng() * 3);
  const saved = { perspective: ctx.perspective, tone: ctx.tone, theme: ctx.theme, terrain: ctx.terrain, lineage: ctx.lineage };
  const pinKinds: (keyof Parts)[] = ["feature", "animal", "plant", "sacred", "lifeway", "ancestor", "vessel"];
  ctx.pin = new Map(pinKinds.filter((k) => a.parts[k]).map((k) => [k, a.parts[k] as string]));
  const names: string[] = [];
  const seen = new Set([a.headword.toLowerCase()]);
  const used = new Set([a.template]);
  let other: string | undefined;
  const otherPerspective = rng() < 0.3 ? (saved.perspective === "self" ? "neighbour" : "self") : undefined;
  for (let i = 0; i < want * 4 && names.length < want; i++) {
    const flip = otherPerspective && !other && names.length === want - 1;
    const alt = attempt(ctx, { perspective: flip ? otherPerspective : saved.perspective, theme: saved.theme, avoidTemplates: used });
    if (!alt || seen.has(alt.headword.toLowerCase()) || alt.parts.keyword === "") continue;
    seen.add(alt.headword.toLowerCase());
    used.add(alt.template);
    if (used.size >= Object.keys(TRIBAL_DATA.templates.weights).length) used.clear();
    names.push(alt.headword);
    if (flip) other = otherPerspective === "self" ? `They called themselves ${inTextOf(alt.headword)}.` : `Their neighbours called them ${inTextOf(alt.headword)}.`;
  }
  ctx.pin = new Map();
  Object.assign(ctx, saved);
  return { names, other };
}

export interface TribalBatchResult {
  names: TribalName[];
  seed: number;
  notices: string[];
}

/** §4: `count` names, unique case-insensitively, at most count × 50 attempts. */
export function generateTribalNames(options: TribalOptions & { count: number; seed?: number }): TribalBatchResult {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const count = Math.max(0, Math.floor(options.count));
  const seen = new Set<string>();
  const names: TribalName[] = [];
  let skipped = 0;
  for (let i = 0; i < count * 50 && names.length < count; i++) {
    const name = tribalName(options, rng);
    if (!name) {
      skipped++;
      if (skipped >= count * 5) break;
      continue;
    }
    const key = name.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  const notices: string[] = [];
  if (names.length < count) {
    notices.push(
      names.length === 0
        ? "No names could be made with these choices."
        : `Only ${names.length} different names could be made with these choices${skipped ? ` (${skipped} skipped)` : ""}.`,
    );
  }
  return { names, seed, notices };
}

/** "tribal names · Polynesian · Temperate woodland · plain" (§18.3). */
export function tribalHistoryLabel(
  sectionLabel: string,
  tradition: string,
  biome: string | undefined,
  register: TribalRegister,
  terrain = "any",
  custom: readonly Biome[] = [],
): string {
  const t = findTradition(tradition) ?? TRIBAL_TRADITIONS[0];
  const b = findBiome(biome, custom);
  // Land brief §6.4: "tribal names · Polynesian · britain · coasts · plain".
  const land = [...TERRAIN_CHOICES, ...(b?.customTerrains ?? [])].find((x) => x.id === terrain && x.id !== "any");
  return [sectionLabel, t.label, b ? b.label.toLowerCase() : "homeland", ...(land ? [land.label.toLowerCase()] : []), register].join(" · ");
}

/** "Homeland: tropical islands 80%, cool rainforest 20%" (§18.2). */
export function homelandSummary(tradition: string): string {
  const t = findTradition(tradition) ?? TRIBAL_TRADITIONS[0];
  const parts = Object.entries(t.homeland)
    .sort((a, b) => b[1] - a[1])
    .map(([id, w]) => `${(findBiome(id)?.label ?? id).toLowerCase()} ${w}%`);
  return `Homeland: ${parts.join(", ")}`;
}

/** §18.3 details line 1: "Kin group · self-name · Tropical islands (homeland)". */
export function tribalDetailsLine(name: TribalName): string {
  const g = TRIBAL_GROUP_TYPES.find((x) => x.key === name.groupType)!;
  const short = g.label.replace(/ or .*$/, "");
  const persp = TRIBAL_DATA.perspectiveLabels[name.perspective] + (HOSTILE_PERSPECTIVES.has(name.perspective) ? ` (${name.tone})` : "");
  const biome = findBiome(name.biome)!;
  return `${short} · ${persp} · ${biome.label}${name.biomeMode === "homeland" ? " (homeland)" : ""}`;
}

