// The section switcher's line-up (river brief §1). No Obsidian imports, so it can be tested.

import { GENERIC_PLACE_NAMES_HISTORY_NAME, PLACE_SHAPES_HISTORY_NAME } from "./placeShapes";

/** The sections reachable from the binder icon's switcher menu (renderSectionMenu) — mirrors
 * titleForge's own section switcher. "markov" is today's whole pack-driven generator and the
 * default on every open; "placeShapes" (british place names) renders part 1 shapes into names
 * through the names engine; "riverNames" runs the river engine (rivers/engine.ts); "worldPlaceNames" runs the world place names engine (world/engine.ts); "explorationPlaceShapes" and "empireExpansionPlaceShapes"
 * run the colonial generator (colonialShapes.ts) for parts 2 and 2a; "nameAgeing" ages a name
 * towards a target pack (ageing/engine.ts); "nameTakeover" adopts generated native names into a
 * takeover pack's language (the engine's takeover profile, via takeoverView.ts). */
/** History rows from before the renames start with these; they keep their icons (river brief §1). */
export const OLD_HISTORY_PREFIXES = {
  explorationPlaceShapes: "exploration place name shapes",
  empireExpansionPlaceShapes: "empire expansion place name shapes",
} as const;

export type NameForgeSection =
  | "markov"
  | "placeShapes"
  | "riverNames"
  | "worldPlaceNames"
  | "explorationPlaceShapes"
  | "empireExpansionPlaceShapes"
  | "nameAgeing"
  | "nameTakeover";

export const SECTION_ORDER: NameForgeSection[] = [
  "markov",
  "placeShapes",
  "riverNames",
  "worldPlaceNames",
  "explorationPlaceShapes",
  "empireExpansionPlaceShapes",
  "nameAgeing",
  "nameTakeover",
];

// Section names are deliberately lowercase, matching titleForge's section-switcher menu.
export const SECTION_LABELS: Record<NameForgeSection, string> = {
  markov: "markov generator",
  placeShapes: "british place names",
  riverNames: "river names",
  worldPlaceNames: "world place names",
  explorationPlaceShapes: "exploration place names",
  empireExpansionPlaceShapes: "empire expansion place names",
  nameAgeing: "name ageing",
  nameTakeover: "name takeover",
};

/** History labels for new runs of the place-name and river modules. */
export const BRITISH_PLACE_NAMES_HISTORY_NAME = "british place names";
export const RIVER_NAMES_HISTORY_NAME = "river names";
export const WORLD_PLACE_NAMES_HISTORY_NAME = "world place names";

/**
 * Which module a history entry belongs to, read from its label, so each module shows only its own
 * history. Old entries are matched by the labels they were written with: "place name shapes" and
 * "generic place name generator" belong to british place names (the generic module's fallback).
 * Anything else is a pack run in the markov generator.
 */
export function historySection(packName: string): NameForgeSection {
  const starts = (prefix: string) => packName.startsWith(prefix);
  if (starts(RIVER_NAMES_HISTORY_NAME)) return "riverNames";
  if (starts(WORLD_PLACE_NAMES_HISTORY_NAME)) return "worldPlaceNames";
  if (starts(SECTION_LABELS.explorationPlaceShapes) || starts(OLD_HISTORY_PREFIXES.explorationPlaceShapes)) {
    return "explorationPlaceShapes";
  }
  if (starts(SECTION_LABELS.empireExpansionPlaceShapes) || starts(OLD_HISTORY_PREFIXES.empireExpansionPlaceShapes)) {
    return "empireExpansionPlaceShapes";
  }
  if (starts(BRITISH_PLACE_NAMES_HISTORY_NAME) || starts(PLACE_SHAPES_HISTORY_NAME) || starts(GENERIC_PLACE_NAMES_HISTORY_NAME)) {
    return "placeShapes";
  }
  return "markov";
}
