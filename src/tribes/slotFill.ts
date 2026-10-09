// Tribal names as a recipe slot source (Tribal brief §20). No Obsidian imports.
//
// Short tribal names for the colonial `native-people-or-tribe` slot and the organic `folk-group`
// slot: plain, article-free and never fused, drawn on the recipe's fill stream.

import type { Biome } from "../biomes";
import { findTradition, tribalName, type TribalConstraints } from "./engine";

export interface TribalSlotOptions {
  /** A tradition key, or "auto" (organic folk-group only; elsewhere General). */
  tradition: string;
  /** A recipe part, or a river names setting (Land brief §8.1). */
  part: "organic" | "new-land" | "established" | "river-british" | "river-colonial";
  /** The recipe's region (organic) for "auto". */
  region?: string;
  /** The recipe's biome (colonial parts), as an id or resolved; otherwise the tradition's homeland. */
  biome?: string | Biome;
  /** Land brief §11: the recipe's terrain. */
  terrain?: string;
}

/** §20.2: the fill settings for each side. */
const COLONIAL: TribalConstraints = {
  templates: { A: 35, B: 35, F: 10, L: 10, J: 10 },
  jFirstFormOnly: true,
  noTail: true,
  maxWords: 3,
  registers: { plain: 70, administrative: 30 },
  perspectiveMultipliers: { imposed: 3, neighbour: 2 },
  groupTypes: ["regional", "settlement", "kin", "confederation"],
  headwordOnly: true,
};
const ORGANIC: TribalConstraints = {
  templates: { A: 50, B: 50 },
  noTail: true,
  maxWords: 2,
  registers: { plain: 100 },
  groupTypes: ["regional", "settlement", "kin"],
  headwordOnly: true,
};

/** Land brief §8.1: peoples in river names. */
const RIVER_BRITISH: TribalConstraints = {
  templates: { A: 50, B: 50 },
  noTail: true,
  maxWords: 2,
  registers: { plain: 100 },
  groupTypes: ["regional", "settlement", "kin"],
  headwordOnly: true,
};
const RIVER_COLONIAL: TribalConstraints = {
  templates: { A: 40, B: 40, F: 20 },
  noTail: true,
  maxWords: 2,
  registers: { plain: 70, administrative: 30 },
  perspectiveMultipliers: { imposed: 3, neighbour: 2 },
  groupTypes: ["regional", "settlement", "kin", "confederation"],
  headwordOnly: true,
};

/** §20.2 "auto": the tradition for a region code (or all of Britain). */
export function autoTradition(region: string | undefined, rng: () => number): string {
  const code = (region ?? "").toUpperCase();
  if (["COR", "WAL", "SHH", "SLO"].includes(code)) return "celtic";
  if (code === "SBL") return rng() < 0.5 ? "celtic" : "germanic";
  if (!region || code === "ALL-BRITAIN" || code === "ALL") return rng() < 0.7 ? "germanic" : "celtic";
  return "germanic";
}

/** A short tribal name for a slot, and the tradition it came from. */
export function tribalSlotFill(options: TribalSlotOptions, rng: () => number): { text: string; tradition: string } {
  const organic = options.part === "organic";
  let tradition = options.tradition;
  if (tradition === "auto") tradition = organic ? autoTradition(options.region, rng) : "general";
  if (!findTradition(tradition)) tradition = "general";
  const constraints =
    options.part === "river-british" ? RIVER_BRITISH : options.part === "river-colonial" ? RIVER_COLONIAL : organic ? ORGANIC : COLONIAL;
  const biome = organic ? undefined : options.biome;
  const name = tribalName(
    {
      tradition,
      ...(typeof biome === "string" ? { biome } : biome ? { biomeData: biome } : {}),
      terrain: options.terrain,
      hostile: false,
      constraints,
    },
    rng,
  );
  // §20.2: a leading "The" is removed.
  const text = (name?.name ?? "People").replace(/^The /, "");
  return { text, tradition };
}
