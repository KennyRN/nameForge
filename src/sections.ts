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
  // The titles label before the British spelling.
  titles: ["titles and honorifics"],
  // Line-up brief §2.4: the deities module before the split; place rows go to sacred places.
  deityNames: ["deities and sacred places"],
} as const;

export type NameForgeSection =
  | "markov"
  | "placeShapes"
  // Route names brief §1.1: in place names, after native place names.
  | "routeNames"
  // Urban brief §1.1: the urban group's first module, settlement names.
  | "settlementNames"
  // Streets brief §1.1; the urban brief moves it to the urban group, after settlement names.
  | "streetNames"
  // Inns brief §1.1; urban group, after streets and districts.
  | "innNames"
  // Buildings brief §1.1; urban group, after inns and taverns.
  | "buildingNames"
  // Settlement kit §1.1; the urban brief moves it to the end of the urban group, after buildings and landmarks.
  | "settlementKit"
  // Events brief §1.1; the line-up brief moves it to the end of advanced.
  | "eventNames"
  // Money brief §1.1: last in advanced, after events and eras.
  | "moneyNames"
  // Time and sky brief §1.1: after money and coins.
  | "calendarNames"
  | "skyNames"
  // Named things brief §1.1: the named things group, after vehicles.
  | "armsNames"
  | "treasureNames"
  | "bookNames"
  // Deities brief §1.1; the line-up brief moves it to the end of group names.
  | "deityNames"
  // Line-up brief §2.1: the deities engine's places, last in place names.
  | "sacredPlaces"
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
  // Peoples and tongues brief §1.1: in group names, directly after realms and polities.
  | "peoplesTongues"
  // Ships brief §1.1: ships and boats, spacecraft and stations (in the advanced group).
  | "ships"
  | "spacecraft"
  // Aircraft and land vehicles brief §1.1: after spacecraft and stations.
  | "aircraft"
  | "landVehicles"
  // Seas and coasts brief §1.1: the seas and coasts group, after place names.
  | "seasLakes"
  | "coastsIslands"
  | "seaCharts"
  | "hyperspaceCharts";

/** Seas and coasts brief §1.1: the four waters modules, in order. */
export const WATERS_SECTIONS: NameForgeSection[] = ["seasLakes", "coastsIslands", "seaCharts", "hyperspaceCharts"];

/** Ships brief §1.1: the vessel modules, in order (aircraft and land vehicles added by their brief). */
export const VESSEL_SECTIONS: NameForgeSection[] = ["ships", "spacecraft", "aircraft", "landVehicles"];

/** Named things brief §1.1: the three named things modules, in order. */
export const THING_SECTIONS: NameForgeSection[] = ["armsNames", "treasureNames", "bookNames"];

/** Bynames brief §1.1: the three bynames modules, in order. */
export const BYNAME_SECTIONS: NameForgeSection[] = ["epithets", "familyNames", "titles"];

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
export const GROUP_NAMES_ORDER: NameForgeSection[] = ["powerFactions", "realms", "peoplesTongues", "tribalNames", "tradeGuilds", "martialOrders", "adventureCompanies", "mysticOrders", "underworldGroups", "supernaturalCourts"];

/** Urban brief §1.1: the five urban modules, in order. */
export const URBAN_SECTIONS: NameForgeSection[] = ["settlementNames", "streetNames", "innNames", "buildingNames", "settlementKit"];

export const SECTION_ORDER: NameForgeSection[] = [
  "markov",
  "placeShapes",
  "explorationPlaceShapes",
  "empireExpansionPlaceShapes",
  "routeNames",
  "sacredPlaces",
  ...URBAN_SECTIONS,
  ...WATERS_SECTIONS,
  ...GROUP_NAMES_ORDER,
  "deityNames",
  ...BYNAME_SECTIONS,
  ...VESSEL_SECTIONS,
  ...THING_SECTIONS,
  "nameAgeing",
  "nameTakeover",
  "eventNames",
  "moneyNames",
  "calendarNames",
  "skyNames",
];

/** Groups in the section switcher: picking one opens its last-used module, and the box beside the
 * trigger then chooses between the group's modules. */
export type SectionGroup = "placeNames" | "urban" | "seasCoasts" | "groupNames" | "bynames" | "vehicles" | "namedThings" | "advanced";

export const SECTION_GROUPS: Record<SectionGroup, NameForgeSection[]> = {
  placeNames: ["placeShapes", "explorationPlaceShapes", "empireExpansionPlaceShapes", "routeNames", "sacredPlaces"],
  // Urban brief §1.1: straight after place names.
  urban: URBAN_SECTIONS,
  seasCoasts: WATERS_SECTIONS,
  groupNames: [...GROUP_NAMES_ORDER, "deityNames"],
  bynames: BYNAME_SECTIONS,
  // Line-up brief §1: ships and spacecraft get a group of their own.
  vehicles: VESSEL_SECTIONS,
  // Named things brief §1.1.
  namedThings: THING_SECTIONS,
  advanced: ["nameAgeing", "nameTakeover", "eventNames", "moneyNames", "calendarNames", "skyNames"],
};

export const GROUP_LABELS: Record<SectionGroup, string> = {
  placeNames: "place names",
  urban: "urban",
  seasCoasts: "seas and coasts",
  groupNames: "group names",
  bynames: "bynames and titles",
  vehicles: "vehicles",
  namedThings: "named things",
  advanced: "advanced",
};

/** The switcher's line-up: modules and groups. */
export const SWITCHER_ORDER: (NameForgeSection | SectionGroup)[] = ["markov", "placeNames", "urban", "seasCoasts", "groupNames", "bynames", "vehicles", "namedThings", "advanced"];

/** The group a module belongs to, if any. */
export function sectionGroup(section: NameForgeSection): SectionGroup | undefined {
  return (Object.keys(SECTION_GROUPS) as SectionGroup[]).find((g) => SECTION_GROUPS[g].includes(section));
}

// Section names are deliberately lowercase, matching titleForge's section-switcher menu.
export const SECTION_LABELS: Record<NameForgeSection, string> = {
  markov: "markov generator",
  placeShapes: "native place names",
  settlementNames: "settlement names",
  routeNames: "route names",
  streetNames: "streets and districts",
  innNames: "inns and taverns",
  buildingNames: "buildings and landmarks",
  settlementKit: "settlement kit",
  eventNames: "events and eras",
  moneyNames: "money and coins",
  calendarNames: "calendars and festivals",
  skyNames: "sky lore",
  armsNames: "arms and armour",
  treasureNames: "treasures and regalia",
  bookNames: "books and writings",
  deityNames: "deities",
  sacredPlaces: "sacred places",
  riverNames: "river names",
  explorationPlaceShapes: "exploration into new lands",
  empireExpansionPlaceShapes: "expansion into settled lands",
  nameAgeing: "name ageing",
  nameTakeover: "name takeover",
  tribalNames: "tribes and kin groups",
  realms: "realms and polities",
  peoplesTongues: "peoples and tongues",
  mysticOrders: "faiths and mystic orders",
  martialOrders: "armies and martial orders",
  underworldGroups: "thieves and the underworld",
  tradeGuilds: "guilds, companies, and trade",
  adventureCompanies: "adventurers and explorers",
  powerFactions: "powers and factions",
  supernaturalCourts: "supernatural courts and hosts",
  epithets: "epithets and bynames",
  titles: "titles and honourifics",
  familyNames: "family names",
  ships: "ships and boats",
  spacecraft: "spacecraft and stations",
  aircraft: "aircraft and airships",
  landVehicles: "land vehicles",
  seasLakes: "seas and lakes",
  coastsIslands: "coasts and islands",
  seaCharts: "sea charts",
  hyperspaceCharts: "hyperspace charts",
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
  // Money brief §1.2: "money and coins · {era} · {culture}…".
  if (starts(SECTION_LABELS.moneyNames)) return "moneyNames";
  // Time and sky brief §1.1: "calendars and festivals · …" and "sky lore · …".
  if (starts(SECTION_LABELS.calendarNames)) return "calendarNames";
  if (starts(SECTION_LABELS.skyNames)) return "skyNames";
  // Named things brief §1.1: "arms and armour · …", "treasures and regalia · …", "books and writings · …".
  for (const section of THING_SECTIONS) if (starts(SECTION_LABELS[section])) return section;
  // Line-up brief §2.4: old "deities and sacred places" rows first, since they also start "deities".
  if (OLD_HISTORY_PREFIXES.deityNames.some(starts)) return packName.includes("· sacred places") ? "sacredPlaces" : "deityNames";
  // "deities · {era} · {culture}…" and "sacred places · {era} · {culture}…".
  if (starts(SECTION_LABELS.deityNames)) return "deityNames";
  if (starts(SECTION_LABELS.sacredPlaces)) return "sacredPlaces";
  // Realms brief §1.2: "realms and polities · {setting} · {culture} · {era}…".
  if (starts(SECTION_LABELS.realms)) return "realms";
  // Peoples and tongues brief §1.1: "peoples and tongues · {era} · {culture}…".
  if (starts(SECTION_LABELS.peoplesTongues)) return "peoplesTongues";
  // Group brief §1.2: each group-name module's label starts its history rows.
  for (const section of GROUP_NAME_SECTIONS) if (starts(SECTION_LABELS[section])) return section;
  // Bynames brief §1.2: "{module label} · {setting} · {culture}…".
  for (const section of BYNAME_SECTIONS) if (starts(SECTION_LABELS[section])) return section;
  // Ships brief §1.2: "{module label} · {setting} · {culture} · {technology}…".
  for (const section of VESSEL_SECTIONS) if (starts(SECTION_LABELS[section])) return section;
  // Seas and coasts brief §1.3: "{module} · {era} · {culture}…".
  for (const section of WATERS_SECTIONS) if (starts(SECTION_LABELS[section])) return section;
  if (OLD_HISTORY_PREFIXES.tradeGuilds.some(starts)) return "tradeGuilds";
  if (OLD_HISTORY_PREFIXES.titles.some(starts)) return "titles";
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
