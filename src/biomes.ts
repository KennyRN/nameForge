// Biomes (Tribal brief §3). No Obsidian imports.
//
// A biome is a kit of nature words for one kind of country: land and water by terrain, wildlife,
// plants, crops, livestock, lifeways, sacred features and materials. It never decides grammar or
// weighting; that is a naming tradition's job. Shared by tribal names, the colonial recipes and
// the river names module's colonial settings.

import biomeData from "./data/biomes.json";
import type { NameWordEntry } from "./names/engine";

export type BiomeId =
  | "temperate"
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
export type TerrainId = "open" | "mountains" | "coast" | "rivers" | "wetland" | "islands";
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
  | "materials";

/** A word and its bracketed weight (1 unless the brief gives one). */
export type Weighted = [string, number];

export interface Biome extends Record<BiomeList, Weighted[]> {
  id: BiomeId;
  /** The menu label, e.g. "Temperate woodland". */
  label: string;
  /** The wizard sentence phrase, e.g. "the savannah" (§19.2). */
  phrase: string;
  /** The tooltip and guide text. */
  guide: string;
  terrainWeights: Record<TerrainId, number>;
  land: Partial<Record<TerrainId, Weighted[]>>;
  water: Partial<Record<TerrainId, Weighted[]>>;
}

interface BiomeData {
  terrains: TerrainId[];
  universal: Record<TerrainId, { land: string[]; water: string[] }>;
  biomes: Biome[];
  irregularPlurals: Record<string, string>;
}

const BIOME_DATA = biomeData as unknown as BiomeData;

export const TERRAINS: readonly TerrainId[] = BIOME_DATA.terrains;

/** The 11 biomes in menu order (§3.2). */
export const BIOMES: readonly Biome[] = BIOME_DATA.biomes;

export function findBiome(id: string | undefined): Biome | undefined {
  return id ? BIOMES.find((b) => b.id === id) : undefined;
}

export function biomeWords(biome: Biome, list: BiomeList): Weighted[] {
  return biome[list];
}

/** Tribal brief §3.6: universal terrain words weigh 1, biome words 2 (times any bracketed weight). */
export function terrainWords(biome: Biome, kind: "land" | "water", terrain: TerrainId): Weighted[] {
  const universal: Weighted[] = BIOME_DATA.universal[terrain][kind].map((w) => [w, 1]);
  const own: Weighted[] = (biome[kind][terrain] ?? []).map(([w, n]) => [w, 2 * n]);
  return [...universal, ...own];
}

/** Title case for a lowercase common noun: "monkey-puzzle" → "Monkey-Puzzle". */
export const biomeTitleCase = (word: string) => word.replace(/(^|[\s-])([a-z])/g, (_, sep: string, c: string) => sep + c.toUpperCase());

/** Plural of a lowercase common noun: the irregular table, else ordinary English rules (§3.6).
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

/** Colonial native slot ids → the biome list that fills them (§3.9, §19.3). */
const COLONIAL_LISTS: Record<string, BiomeList> = {
  bird: "birds",
  "wild-animal": "wildAnimals",
  "fish-and-other-creatures": "creatures",
  tree: "trees",
  "wild-plant": "plants",
};

/** Colonial use (§19.3): a biome list as weighted name-word entries; undefined for other slots. */
export function biomeEntries(biome: Biome, categoryId: string): [NameWordEntry, number][] | undefined {
  const list = COLONIAL_LISTS[categoryId];
  if (!list) return undefined;
  return biome[list].map(([word, weight]) => [
    { modern: word, plural: pluralOf(word), forms: [biomeTitleCase(word)], fuses: "no" },
    weight,
  ]);
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
