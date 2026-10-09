// The section switcher's line-up (river brief §1). No Obsidian imports, so it can be tested.

import { GENERIC_PLACE_NAMES_HISTORY_NAME, PLACE_SHAPES_HISTORY_NAME } from "./placeShapes";

/** The sections reachable from the binder icon's switcher menu (renderSectionMenu) — mirrors
 * titleForge's own section switcher. "markov" is today's whole pack-driven generator and the
 * default on every open; "placeShapes" (place names) renders part 1 shapes into British names
 * through the names engine, or a world culture's names through the world engine (world/engine.ts);
 * "riverNames" (the river engine, rivers/engine.ts) is no longer in the line-up: British river names
 * are a choice within place names; "explorationPlaceShapes" and "empireExpansionPlaceShapes"
 * run the colonial generator (colonialShapes.ts) for parts 2 and 2a; "nameAgeing" ages a name
 * towards a target pack (ageing/engine.ts); "nameTakeover" adopts generated native names into a
 * takeover pack's language (the engine's takeover profile, via takeoverView.ts); "groups" is a
 * placeholder for now and shows the "no packs yet" stub. */
/** History rows from before the renames start with these; they keep their icons (river brief §1). */
export const OLD_HISTORY_PREFIXES = {
  explorationPlaceShapes: ["exploration place name shapes", "exploration place names"],
  empireExpansionPlaceShapes: ["empire expansion place name shapes", "empire expansion place names"],
} as const;

export type NameForgeSection =
  | "markov"
  | "placeShapes"
  | "riverNames"
  | "explorationPlaceShapes"
  | "empireExpansionPlaceShapes"
  | "nameAgeing"
  | "nameTakeover"
  | "groups";

export const SECTION_ORDER: NameForgeSection[] = [
  "markov",
  "placeShapes",
  "explorationPlaceShapes",
  "empireExpansionPlaceShapes",
  "nameAgeing",
  "nameTakeover",
  "groups",
];

// Section names are deliberately lowercase, matching titleForge's section-switcher menu.
export const SECTION_LABELS: Record<NameForgeSection, string> = {
  markov: "markov generator",
  placeShapes: "place names",
  riverNames: "river names",
  explorationPlaceShapes: "exploration in new lands",
  empireExpansionPlaceShapes: "expansion into settled lands",
  nameAgeing: "name ageing",
  nameTakeover: "name takeover",
  groups: "groups",
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
  // River names now live in place names (British river names); old entries go with them.
  if (starts(RIVER_NAMES_HISTORY_NAME)) return "placeShapes";
  if (starts(WORLD_PLACE_NAMES_HISTORY_NAME)) return "placeShapes";
  if (starts(SECTION_LABELS.explorationPlaceShapes) || OLD_HISTORY_PREFIXES.explorationPlaceShapes.some(starts)) {
    return "explorationPlaceShapes";
  }
  if (starts(SECTION_LABELS.empireExpansionPlaceShapes) || OLD_HISTORY_PREFIXES.empireExpansionPlaceShapes.some(starts)) {
    return "empireExpansionPlaceShapes";
  }
  if (starts(BRITISH_PLACE_NAMES_HISTORY_NAME) || starts(PLACE_SHAPES_HISTORY_NAME) || starts(GENERIC_PLACE_NAMES_HISTORY_NAME)) {
    return "placeShapes";
  }
  return "markov";
}
