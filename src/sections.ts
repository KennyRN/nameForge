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
  // Companies brief §1: the trade family's label before "guilds, companies and trade".
  tradeGuilds: ["guilds and trading houses", "guilds, companies and trade"],
} as const;

export type NameForgeSection =
  | "markov"
  | "placeShapes"
  // Route names brief §1.1: in place names, after native place names.
  | "routeNames"
  // Streets brief §1.1: after route names.
  | "streetNames"
  // Inns brief §1.1: after streets and districts.
  | "innNames"
  // Buildings brief §1.1: after inns and taverns.
  | "buildingNames"
  // Settlement kit §1.1: after buildings and landmarks.
  | "settlementKit"
  // Events brief §1.1: the history and faith group.
  | "eventNames"
  // Deities brief §1.1: after events and eras.
  | "deityNames"
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

/** The group names group's line-up in the switcher and menus. */
export const GROUP_NAMES_ORDER: NameForgeSection[] = ["powerFactions", "realms", "tribalNames", "tradeGuilds", "martialOrders", "adventureCompanies", "mysticOrders", "underworldGroups", "supernaturalCourts"];

export const SECTION_ORDER: NameForgeSection[] = [
  "markov",
  "placeShapes",
  "explorationPlaceShapes",
  "empireExpansionPlaceShapes",
  "routeNames",
  "streetNames",
  "innNames",
  "buildingNames",
  ...GROUP_NAMES_ORDER,
  ...BYNAME_SECTIONS,
  "eventNames",
  "deityNames",
  "nameAgeing",
  "nameTakeover",
  ...VESSEL_SECTIONS,
  "settlementKit",
];

/** Groups in the section switcher: picking one opens its last-used module, and the box beside the
 * trigger then chooses between the group's modules. */
export type SectionGroup = "placeNames" | "groupNames" | "bynames" | "lore" | "advanced";

export const SECTION_GROUPS: Record<SectionGroup, NameForgeSection[]> = {
  placeNames: ["placeShapes", "explorationPlaceShapes", "empireExpansionPlaceShapes", "routeNames", "streetNames", "innNames", "buildingNames"],
  groupNames: GROUP_NAMES_ORDER,
  bynames: BYNAME_SECTIONS,
  // Events brief §1.1 (the deities brief adds its module here).
  lore: ["eventNames", "deityNames"],
  advanced: ["nameAgeing", "nameTakeover", ...VESSEL_SECTIONS, "settlementKit"],
};

export const GROUP_LABELS: Record<SectionGroup, string> = {
  placeNames: "place names",
  groupNames: "group names",
  bynames: "bynames and titles",
  lore: "history and faith",
  advanced: "advanced",
};

/** The switcher's line-up: modules and groups. */
export const SWITCHER_ORDER: (NameForgeSection | SectionGroup)[] = ["markov", "placeNames", "groupNames", "bynames", "lore", "advanced"];

/** The group a module belongs to, if any. */
export function sectionGroup(section: NameForgeSection): SectionGroup | undefined {
  return (Object.keys(SECTION_GROUPS) as SectionGroup[]).find((g) => SECTION_GROUPS[g].includes(section));
}

// Section names are deliberately lowercase, matching titleForge's section-switcher menu.
export const SECTION_LABELS: Record<NameForgeSection, string> = {
  markov: "markov generator",
  placeShapes: "native place names",
  routeNames: "route names",
  streetNames: "streets and districts",
  innNames: "inns and taverns",
  buildingNames: "buildings and landmarks",
  settlementKit: "settlement kit",
  eventNames: "events and eras",
  deityNames: "deities and sacred places",
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
  tradeGuilds: "guilds, companies, and trade",
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
  // Route names brief §1.2: "route names · {era} · {culture}…".
  if (starts(SECTION_LABELS.routeNames)) return "routeNames";
  // Streets brief §1.2: "streets and districts · {era} · {culture}…".
  if (starts(SECTION_LABELS.streetNames)) return "streetNames";
  // Inns brief §1.2: "inns and taverns · {era} · {culture}…".
  if (starts(SECTION_LABELS.innNames)) return "innNames";
  // Buildings brief §1.2: "buildings and landmarks · {era} · {culture}…".
  if (starts(SECTION_LABELS.buildingNames)) return "buildingNames";
  // Settlement kit §1.2: "settlement kit · {settlement name} · {size}…".
  if (starts(SECTION_LABELS.settlementKit)) return "settlementKit";
  // Events brief §1.2: "events and eras · {era} · {culture}…".
  if (starts(SECTION_LABELS.eventNames)) return "eventNames";
  // Deities brief §1.2: "deities and sacred places · {era} · {culture}…".
  if (starts(SECTION_LABELS.deityNames)) return "deityNames";
  // Realms brief §1.2: "realms and polities · {setting} · {culture} · {era}…".
  if (starts(SECTION_LABELS.realms)) return "realms";
  // Group brief §1.2: each group-name module's label starts its history rows.
  for (const section of GROUP_NAME_SECTIONS) if (starts(SECTION_LABELS[section])) return section;
  // Bynames brief §1.2: "{module label} · {setting} · {culture}…".
  for (const section of BYNAME_SECTIONS) if (starts(SECTION_LABELS[section])) return section;
  // Ships brief §1.2: "{module label} · {setting} · {culture} · {technology}…".
  for (const section of VESSEL_SECTIONS) if (starts(SECTION_LABELS[section])) return section;
  if (OLD_HISTORY_PREFIXES.tradeGuilds.some(starts)) return "tradeGuilds";
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
