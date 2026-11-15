// Northern Europe tables brief, batch 5b: the batch's own data (src/data/north5b.json, written by scripts/make-north5b.mjs): settlement
// names as world-engine cultures with their size tables and regions, and the culture shapes and words of the other five modules. No Obsidian imports.

import north from "./data/north5b.json";
import { CELTIC_MIX, CELTIC_MIX_WEIGHT } from "./northData";

export interface RegionTemplates {
  templates: [string, number][];
  lists: Record<string, string[]>;
}

export interface NorthWorldCulture {
  id: string;
  homelandBiome: string;
  label: string;
  guide: string;
  fuseChance: number;
  lists: Record<string, string[]>;
  eras: { id: string; label: string; guide?: string; templates: [string, number][]; lists?: Record<string, string[]> }[];
  regions?: Record<string, RegionTemplates>;
}

interface ShapeMap<T> {
  cultureShapes: Record<string, T[]>;
}

interface North5b {
  /** The noun pools (one per module kind) of the batch's modules, for "no noun twice in a batch". */
  nounPools: string[];
  vocab: { pools: Record<string, { entries?: Record<string, unknown>[]; cultureExtra?: Record<string, Record<string, unknown>[]> }> };
  streets: { cultureStreets: Record<string, unknown>[]; cultureSquares: Record<string, unknown>[]; cultureDistricts: Record<string, unknown>[] };
  inns: ShapeMap<Record<string, unknown>> & { tradition: Record<string, [number, string]> };
  buildings: ShapeMap<Record<string, unknown>>;
  monuments: ShapeMap<Record<string, unknown>>;
  settlement: {
    cultures: NorthWorldCulture[];
    /** Template size codes per new culture, in the shape of settlement-names.json's `world`. */
    sizes: Record<string, { eras: Record<string, Record<string, string>>; lists: Record<string, Record<string, string>> }>;
    /** The Norse culture's regions, and the size codes of their templates (era "viking"). */
    norseRegions: Record<string, RegionTemplates>;
    norseSizes: Record<string, string>;
    /** Labels for the list keys the batch adds. */
    labels: Record<string, string>;
  };
}

export const NORTH5B = north as unknown as North5b;

/** The own shapes of a culture in a map keyed by culture: its own, and for Celtic each nation's at a quarter weight. */
export function mapShapes<T extends { w: number }>(map: Record<string, T[]> | undefined, key: string): T[] {
  if (!map) return [];
  const own = map[key] ?? [];
  if (key !== "celtic") return own;
  return [...own, ...CELTIC_MIX.flatMap((k) => (map[k] ?? []).map((s) => ({ ...s, w: s.w * CELTIC_MIX_WEIGHT })))];
}
