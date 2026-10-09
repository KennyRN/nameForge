// Biomes and terrains (Tribal brief §3, Land brief §2). No Obsidian imports.
//
// A biome is a kit of nature words for one kind of country: land and water by terrain, wildlife,
// plants, crops, livestock, lifeways, sacred features, materials, ground, resources and seasons,
// plus multipliers for which kinds of place get named. It never decides grammar or weighting;
// that is a naming tradition's job. Britain is a biome too, made from the built-in lists.

import biomeData from "./data/biomes.json";
import nameWordData from "./data/name-words.json";
import terrainData from "./data/terrains.json";
import type { NameWordEntry } from "./names/engine";

export type BiomeId =
  | "temperate"
  | "moorland"
  | "boreal"
  | "cool-rainforest"
  | "mediterranean"
  | "steppe"
  | "desert"
  | "savannah"
  | "rainforest"
  | "monsoon"
  | "tropical-islands"
  | "highland";
/** Land brief §2.0: the eight built-in terrains. */
export type TerrainId = "plains" | "hills" | "mountains" | "forest" | "coast" | "rivers" | "wetland" | "islands";
/** A TerrainId, a custom terrain id, or "any". */
export type TerrainChoice = string;
export type BiomeList =
  | "wildAnimals"
  | "birds"
  | "creatures"
  | "trees"
  | "plants"
  | "crops"
  | "livestock"
  | "lifeways"
  | "sacred"
  | "materials"
  | "ground"
  | "resources"
  | "seasons";

/** A word and its weight (1 unless the data gives one). */
export type Weighted = [string, number];

export interface ShapeMultipliers {
  groups: Record<string, number>;
  generics: Record<string, number>;
}

export interface Terrain {
  id: string;
  label: string;
  phrase: string;
  shapeMultipliers: ShapeMultipliers;
}

export interface Biome extends Record<BiomeList, Weighted[]> {
  id: string;
  /** The menu label, e.g. "Temperate lands". */
  label: string;
  /** The sentence phrase, e.g. "the savannah". */
  phrase: string;
  /** The tooltip and guide text. */
  guide: string;
  /** Terrain id (built-in or custom) → weight; 0 or missing means not offered. */
  terrainWeights: Record<string, number>;
  /** Tribal-names phrases by terrain. */
  land: Record<string, Weighted[]>;
  water: Record<string, Weighted[]>;
  /** Land brief §2.3: single words for place-name slots, by terrain. */
  short: { land: Record<string, Weighted[]>; water: Record<string, Weighted[]> };
  shapeMultipliers: ShapeMultipliers;
  /** Full word entries for a list, where they carry more than a word (Britain, pack tables). */
  entries?: Partial<Record<string, NameWordEntry[]>>;
  /** Britain: its landform and water entries' terrains (Land brief §2.2). */
  terrainTags?: Record<string, string[]>;
  /** Custom terrains from a biome pack (Land brief §2.7). */
  customTerrains?: Terrain[];
  /** False drops the universal terrain words (biome packs). */
  universalWords?: boolean;
  /** A user biome pack (Land brief §9). */
  custom?: { path: string; base: string };
  /** Biome-pack `//` lines by list: a whole name from that pack when picked (Land brief §9.3). */
  packLines?: Partial<Record<string, { pack: string; weight: number }[]>>;
  /** Pack lines resolved by the host to draw functions (engines never read the vault). */
  packDraws?: Partial<Record<string, { weight: number; draw: (rng: () => number) => string | null }[]>>;
}

interface RawBiome {
  id: string;
  label: string;
  phrase: string;
  guide: string;
  terrainWeights: Record<string, number>;
  land: Record<string, Weighted[]>;
  water: Record<string, Weighted[]>;
  short: { land: Record<string, string[]>; water: Record<string, string[]> };
  shapeMultipliers: ShapeMultipliers;
  ground: string[];
  resources: string[];
  seasons: string[];
  [list: string]: unknown;
}

interface BiomeData {
  terrains: TerrainId[];
  universal: Record<TerrainId, { land: string[]; water: string[] }>;
  universalShort: Record<TerrainId, { land: string[]; water: string[] }>;
  biomes: RawBiome[];
  irregularPlurals: Record<string, string>;
  britain: {
    id: string;
    label: string;
    phrase: string;
    guide: string;
    inherits: string;
    builtInLists: Record<string, string>;
    terrainTags: Record<string, string[]>;
  };
}

const BIOME_DATA = biomeData as unknown as BiomeData;
const NAME_WORD_LISTS = (nameWordData as unknown as { categories: Record<string, NameWordEntry[]> }).categories;

/** The eight built-in terrains in order (Land brief §2.0). */
export const TERRAINS: readonly TerrainId[] = BIOME_DATA.terrains;
/** Any terrain, then the eight, with labels, phrases and shape multipliers (Land brief §2.7). */
export const TERRAIN_CHOICES: readonly Terrain[] = (terrainData as unknown as { terrains: Terrain[] }).terrains;

const weighted = (words: string[]): Weighted[] => words.map((w) => [w, 1]);

function normalise(raw: RawBiome): Biome {
  const short = (side: Record<string, string[]>) => Object.fromEntries(Object.entries(side).map(([t, ws]) => [t, weighted(ws)]));
  return {
    ...(raw as unknown as Biome),
    ground: weighted(raw.ground),
    resources: weighted(raw.resources),
    seasons: weighted(raw.seasons),
    short: { land: short(raw.short.land), water: short(raw.short.water) },
  };
}

/** The 12 natural biomes in menu order (Land brief §2.0). */
export const BIOMES: readonly Biome[] = BIOME_DATA.biomes.map(normalise);

/** Land brief §2.1: Britain, from the built-in lists, inheriting the rest from temperate. */
export const BRITAIN: Biome = (() => {
  const b = BIOME_DATA.britain;
  const base = BIOMES.find((x) => x.id === b.inherits)!;
  const entries: Record<string, NameWordEntry[]> = {};
  const lists: Partial<Record<BiomeList, Weighted[]>> = {};
  for (const [list, category] of Object.entries(b.builtInLists)) {
    const items = NAME_WORD_LISTS[category] ?? [];
    entries[list] = items;
    if (list !== "shortLand" && list !== "shortWater") lists[list as BiomeList] = items.map((e): Weighted => [e.modern, 1]);
  }
  return {
    ...base,
    ...lists,
    id: b.id,
    label: b.label,
    phrase: b.phrase,
    guide: b.guide,
    shapeMultipliers: { groups: {}, generics: {} },
    entries,
    terrainTags: b.terrainTags,
  };
})();

/** Britain, the 12 biomes, then any user biomes. */
export function allBiomes(custom: readonly Biome[] = []): Biome[] {
  return [BRITAIN, ...BIOMES, ...custom];
}

export function findBiome(id: string | undefined, custom: readonly Biome[] = []): Biome | undefined {
  if (!id) return undefined;
  return allBiomes(custom).find((b) => b.id === id || b.custom?.path === id);
}

export function biomeWords(biome: Biome, list: BiomeList): Weighted[] {
  return biome[list] ?? [];
}

/** Tribal brief §3.6: universal terrain phrases weigh 1, biome phrases 2 (times any bracketed weight). */
export function terrainWords(biome: Biome, kind: "land" | "water", terrain: string): Weighted[] {
  const universal: Weighted[] =
    biome.universalWords === false ? [] : (BIOME_DATA.universal[terrain as TerrainId]?.[kind] ?? []).map((w) => [w, 1]);
  const own: Weighted[] = (biome[kind][terrain] ?? []).map(([w, n]) => [w, 2 * n]);
  return [...universal, ...own];
}

/** Land brief §2.7: the terrains a biome offers, in order, then its custom terrains. */
export function availableTerrains(biome: Biome): Terrain[] {
  const builtIn = TERRAIN_CHOICES.filter((t) => t.id !== "any" && (biome.terrainWeights[t.id] ?? 0) > 0);
  return [...builtIn, ...(biome.customTerrains ?? []).filter((t) => (biome.terrainWeights[t.id] ?? 0) > 0)];
}

/** Land brief §2.8: a chosen terrain alone, or the biome's weights × the multipliers for Any. */
export function terrainWeights(biome: Biome, choice: TerrainChoice, multipliers: Partial<Record<string, number>> = {}): Record<string, number> {
  if (choice && choice !== "any") return { [choice]: 100 };
  return Object.fromEntries(Object.entries(biome.terrainWeights).map(([t, w]) => [t, w * (multipliers[t] ?? 1)]));
}

export const biomeTitleCase = (word: string) => word.replace(/(^|[\s-])([a-z])/g, (_, sep: string, c: string) => sep + c.toUpperCase());

/** Plural of a lowercase common noun: the irregular table, else ordinary English rules (Tribal brief §3.6).
 * Only the head of a phrase is pluralised: "bird of paradise" → "birds of paradise". */
export function pluralOf(word: string): string {
  const irregular = BIOME_DATA.irregularPlurals[word];
  if (irregular) return irregular;
  const of = word.indexOf(" of ");
  if (of > 0) return pluralOf(word.slice(0, of)) + word.slice(of);
  const space = word.lastIndexOf(" ");
  if (space > 0) {
    const head = word.slice(space + 1);
    const headPlural = BIOME_DATA.irregularPlurals[head];
    if (headPlural) return word.slice(0, space + 1) + headPlural;
  }
  if (/(s|x|z|ch|sh)$/.test(word)) return `${word}es`;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
}

const wordEntry = (word: string): NameWordEntry => ({ modern: word, plural: pluralOf(word), forms: [biomeTitleCase(word)], fuses: "no" });

/** Land brief §2.3, §5.4: short words for a terrain (universal ×1, biome ×2); Britain's are its tagged built-ins. */
export function shortWords(biome: Biome, kind: "land" | "water", terrain: string): [NameWordEntry, number][] {
  if (biome.terrainTags) {
    const list = biome.entries?.[kind === "land" ? "shortLand" : "shortWater"] ?? [];
    return list.filter((e) => biome.terrainTags![e.modern]?.includes(terrain)).map((e): [NameWordEntry, number] => [e, 1]);
  }
  const out = new Map<string, number>();
  if (biome.universalWords !== false) for (const w of BIOME_DATA.universalShort[terrain as TerrainId]?.[kind] ?? []) out.set(w, (out.get(w) ?? 0) + 1);
  for (const [w, n] of biome.short[kind][terrain] ?? []) out.set(w, (out.get(w) ?? 0) + 2 * n);
  return [...out.entries()].map(([w, n]): [NameWordEntry, number] => [wordEntry(w), n]);
}

/** Land brief §2.6: slot category → biome list. */
export const SLOT_LISTS: Record<string, BiomeList> = {
  bird: "birds",
  "wild-animal": "wildAnimals",
  "fish-and-other-creatures": "creatures",
  tree: "trees",
  "wild-plant": "plants",
  "domestic-animal": "livestock",
  crop: "crops",
  "soil-or-ground": "ground",
  resource: "resources",
  season: "seasons",
};
/** The colonial native flora and fauna slots (Tribal brief §19.3). */
export const NATIVE_SLOT_IDS = ["bird", "wild-animal", "fish-and-other-creatures", "tree", "wild-plant"];

/**
 * A biome list as weighted name-word entries for a slot (Land brief §2.6); undefined for slots a
 * biome doesn't fill. Landform and water take a terrain. Britain returns its built-in entries
 * unchanged, weight 1 each, so fusion and traditional forms work as before.
 */
export function biomeEntries(biome: Biome, categoryId: string, terrain?: string): [NameWordEntry, number][] | undefined {
  if (categoryId === "landform" || categoryId === "water-or-wetland-feature") {
    if (!terrain) return undefined;
    return shortWords(biome, categoryId === "landform" ? "land" : "water", terrain);
  }
  const list = SLOT_LISTS[categoryId];
  if (!list) return undefined;
  const full = biome.entries?.[list];
  if (full) return full.map((e): [NameWordEntry, number] => [e, 1]);
  return biome[list].map(([word, weight]) => [wordEntry(word), weight]);
}

/**
 * Land brief §2.8: the biome's and terrain's shape multipliers, key by key; undefined when there
 * is no biome (or Britain) and the terrain is Any, so callers keep their unchanged path.
 */
export function environmentMultipliers(biome: Biome | undefined, terrain: TerrainChoice | undefined): ShapeMultipliers | undefined {
  const t = terrain && terrain !== "any" ? terrain : undefined;
  const plainBiome = !biome || biome.id === "britain";
  if (plainBiome && !t) return undefined;
  const terrainEntry = t ? (TERRAIN_CHOICES.find((x) => x.id === t) ?? biome?.customTerrains?.find((x) => x.id === t)) : undefined;
  const merge = (a: Record<string, number> = {}, b: Record<string, number> = {}) => {
    const out: Record<string, number> = { ...a };
    for (const [k, v] of Object.entries(b)) out[k] = (out[k] ?? 1) * v;
    return out;
  };
  const own = plainBiome ? undefined : biome!.shapeMultipliers;
  return {
    groups: merge(own?.groups, terrainEntry?.shapeMultipliers.groups),
    generics: merge(own?.generics, terrainEntry?.shapeMultipliers.generics),
  };
}

/** A weighted draw (one rng call), as the other engines' pickWeighted. */
export function pickWeightedPair<T>(items: readonly [T, number][], rng: () => number): T {
  const total = items.reduce((sum, [, w]) => sum + w, 0);
  let roll = rng() * total;
  for (const [item, w] of items) {
    roll -= w;
    if (roll < 0) return item;
  }
  return items[items.length - 1][0];
}
