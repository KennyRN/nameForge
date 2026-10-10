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
 * takeover pack's language (the engine's takeover profile, via takeoverView.ts); "tribalNames"
 * names peoples, kin groups and confederations (tribes/engine.ts, Tribal brief). */
/** History rows from before the renames start with these; they keep their icons (river brief §1). */
export const OLD_HISTORY_PREFIXES = {
  explorationPlaceShapes: ["exploration place name shapes", "exploration place names", "exploration in new lands"],
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
  | "tribalNames"
  // Group brief §1.1: orders, companies and factions.
  | "mysticOrders"
  | "martialOrders"
  | "underworldGroups"
  | "tradeGuilds"
  | "adventureCompanies"
  | "powerFactions"
  | "supernaturalCourts"
  // Bynames brief §1.1: epithets, titles and family names.
  | "epithets"
  | "titles"
  | "familyNames"
  // Realms brief §1.1: realms and polities, after tribes and kin groups.
  | "realms"
  // Ships brief §1.1: ships and boats, spacecraft and stations (in the advanced group).
  | "ships"
  | "spacecraft";

/** Ships brief §1.1: the two vessel modules, in order. */
export const VESSEL_SECTIONS: NameForgeSection[] = ["ships", "spacecraft"];

/** Bynames brief §1.1: the three bynames modules, in order. */
export const BYNAME_SECTIONS: NameForgeSection[] = ["epithets", "titles", "familyNames"];

/** Group brief §1.1: the seven group-name modules, in order. */
export const GROUP_NAME_SECTIONS: NameForgeSection[] = [
  "mysticOrders",
  "martialOrders",
  "underworldGroups",
  "tradeGuilds",
  "adventureCompanies",
  "powerFactions",
  "supernaturalCourts",
];

export const SECTION_ORDER: NameForgeSection[] = [
  "markov",
  "placeShapes",
  "explorationPlaceShapes",
  "empireExpansionPlaceShapes",
  "tribalNames",
  "realms",
  ...GROUP_NAME_SECTIONS,
  ...BYNAME_SECTIONS,
  "nameAgeing",
  "nameTakeover",
  ...VESSEL_SECTIONS,
];

/** Groups in the section switcher: picking one opens its last-used module, and the box beside the
 * trigger then chooses between the group's modules. */
export type SectionGroup = "placeNames" | "groupNames" | "bynames" | "advanced";

export const SECTION_GROUPS: Record<SectionGroup, NameForgeSection[]> = {
  placeNames: ["placeShapes", "explorationPlaceShapes", "empireExpansionPlaceShapes"],
  groupNames: ["tribalNames", "realms", ...GROUP_NAME_SECTIONS],
  bynames: BYNAME_SECTIONS,
  advanced: ["nameAgeing", "nameTakeover", ...VESSEL_SECTIONS],
};

export const GROUP_LABELS: Record<SectionGroup, string> = {
  placeNames: "place names",
  groupNames: "group names",
  bynames: "bynames and titles",
  advanced: "advanced",
};

/** The switcher's line-up: modules and groups. */
export const SWITCHER_ORDER: (NameForgeSection | SectionGroup)[] = ["markov", "placeNames", "groupNames", "bynames", "advanced"];

/** The group a module belongs to, if any. */
export function sectionGroup(section: NameForgeSection): SectionGroup | undefined {
  return (Object.keys(SECTION_GROUPS) as SectionGroup[]).find((g) => SECTION_GROUPS[g].includes(section));
}

// Section names are deliberately lowercase, matching titleForge's section-switcher menu.
export const SECTION_LABELS: Record<NameForgeSection, string> = {
  markov: "markov generator",
  placeShapes: "native place names",
  riverNames: "river names",
  explorationPlaceShapes: "exploration into new lands",
  empireExpansionPlaceShapes: "expansion into settled lands",
  nameAgeing: "name ageing",
  nameTakeover: "name takeover",
  tribalNames: "tribes and kin groups",
  realms: "realms and polities",
  mysticOrders: "faiths and mystic orders",
  martialOrders: "armies and martial orders",
  underworldGroups: "thieves and the underworld",
  tradeGuilds: "guilds and trading houses",
  adventureCompanies: "adventurers and explorers",
  powerFactions: "powers and factions",
  supernaturalCourts: "supernatural courts and hosts",
  epithets: "epithets and bynames",
  titles: "titles and honorifics",
  familyNames: "family names",
  ships: "ships and boats",
  spacecraft: "spacecraft and stations",
};

/** History labels for new runs of the place-name and river modules. */
export const BRITISH_PLACE_NAMES_HISTORY_NAME = "british place names";
export const RIVER_NAMES_HISTORY_NAME = "river names";
export const WORLD_PLACE_NAMES_HISTORY_NAME = "world place names";
export const TRIBAL_NAMES_HISTORY_NAME = "tribes and kin groups";
/** History rows from before the rename to tribes and kin groups. */
export const OLD_TRIBAL_NAMES_HISTORY_NAME = "tribal names";

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
  // Tribal brief §18.1.
  if (starts(TRIBAL_NAMES_HISTORY_NAME) || starts(OLD_TRIBAL_NAMES_HISTORY_NAME)) return "tribalNames";
  // Realms brief §1.2: "realms and polities · {setting} · {culture} · {era}…".
  if (starts(SECTION_LABELS.realms)) return "realms";
  // Group brief §1.2: each group-name module's label starts its history rows.
  for (const section of GROUP_NAME_SECTIONS) if (starts(SECTION_LABELS[section])) return section;
  // Bynames brief §1.2: "{module label} · {setting} · {culture}…".
  for (const section of BYNAME_SECTIONS) if (starts(SECTION_LABELS[section])) return section;
  // Ships brief §1.2: "{module label} · {setting} · {culture} · {technology}…".
  for (const section of VESSEL_SECTIONS) if (starts(SECTION_LABELS[section])) return section;
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
