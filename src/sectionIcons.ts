// Each section's and switcher group's icon (shown on the section trigger and in the switcher menu).
// Kept apart from the modal so the line-up can be tested.

import {
  ICON_ADVANCED,
  ICON_ADVENTURERS,
  ICON_BIOME,
  ICON_BOOK,
  ICON_BUILDINGS,
  ICON_BYNAMES,
  ICON_CALENDAR_DAYS,
  ICON_COASTS_ISLANDS,
  ICON_COINS,
  ICON_DEITIES,
  ICON_DESERTS,
  ICON_EMPIRE_EXPANSION_PLACE_SHAPES,
  ICON_EPITHETS,
  ICON_EXPLORATION_PLACE_SHAPES,
  ICON_FAMILY_NAMES,
  ICON_FORESTS,
  ICON_GEM,
  ICON_GRASSLANDS,
  ICON_GROUP_NAMES,
  ICON_HISTORY,
  ICON_HYPERSPACE_CHARTS,
  ICON_INNS,
  ICON_JET_PLANE,
  ICON_LANGUAGES,
  ICON_MARTIAL,
  ICON_MONSTER_TRUCK,
  ICON_MONUMENTS,
  ICON_MOON_STARS,
  ICON_MOORS,
  ICON_MOUNTAINS,
  ICON_MYSTIC,
  ICON_NAME_AGEING,
  ICON_NAME_TAKEOVER,
  ICON_NATIVE_PLACE_NAMES,
  ICON_PACKS,
  ICON_PLACE_SHAPES,
  ICON_REALMS,
  ICON_RIVER_NAMES,
  ICON_ROUTES,
  ICON_SEAS_COASTS,
  ICON_SEAS_LAKES,
  ICON_SEA_CHARTS,
  ICON_SETTLEMENT_KIT,
  ICON_SHIPS,
  ICON_SPACECRAFT,
  ICON_STREETS,
  ICON_SWORD,
  ICON_TRADE,
  ICON_TRIBAL_NAMES,
  ICON_UNDERWORLD,
  ICON_URBAN,
  ICON_VEHICLES,
  ICON_WETLANDS,
} from "./icons";
import type { NameForgeSection, SectionGroup } from "./sections";

// Each section's icon, shown on the section trigger and in the switcher menu.
export const SECTION_ICONS: Record<NameForgeSection, string> = {
  markov: ICON_PACKS,
  placeShapes: ICON_NATIVE_PLACE_NAMES,
  // Wild lands brief §1.2: the biome icon for the group, one icon each for the modules.
  mountainNames: ICON_MOUNTAINS,
  forestNames: ICON_FORESTS,
  desertNames: ICON_DESERTS,
  moorNames: ICON_MOORS,
  wetlandNames: ICON_WETLANDS,
  grasslandNames: ICON_GRASSLANDS,
  // Urban brief §1.3: settlement names wears the urban group icon.
  settlementNames: ICON_URBAN,
  // Route names brief §1.1.
  routeNames: ICON_ROUTES,
  // Seas and coasts brief §1.2.
  seasLakes: ICON_SEAS_LAKES,
  coastsIslands: ICON_COASTS_ISLANDS,
  seaCharts: ICON_SEA_CHARTS,
  hyperspaceCharts: ICON_HYPERSPACE_CHARTS,
  // Streets brief §1.1.
  streetNames: ICON_STREETS,
  // Inns brief §1.1.
  innNames: ICON_INNS,
  // Buildings brief §1.1.
  buildingNames: ICON_BUILDINGS,
  // Monuments brief §1.2: the icon buildings and landmarks wore before the split.
  monumentNames: ICON_MONUMENTS,
  // Settlement kit §1.1.
  settlementKit: ICON_SETTLEMENT_KIT,
  // Events brief §1.1.
  eventNames: ICON_HISTORY,
  // Money brief §1.1: the custom icons.
  moneyNames: ICON_COINS,
  // Time and sky brief §1.1: custom icons.
  calendarNames: ICON_CALENDAR_DAYS,
  skyNames: ICON_MOON_STARS,
  // Named things brief §1.1: custom icons.
  armsNames: ICON_SWORD,
  treasureNames: "crown",
  bookNames: ICON_BOOK,
  // Deities brief §1.1.
  deityNames: ICON_DEITIES,
  sacredPlaces: ICON_DEITIES,
  riverNames: ICON_RIVER_NAMES,
  explorationPlaceShapes: ICON_EXPLORATION_PLACE_SHAPES,
  empireExpansionPlaceShapes: ICON_EMPIRE_EXPANSION_PLACE_SHAPES,
  nameAgeing: ICON_NAME_AGEING,
  nameTakeover: ICON_NAME_TAKEOVER,
  tribalNames: ICON_TRIBAL_NAMES,
  // Realms brief §1.1.
  realms: ICON_REALMS,
  // Peoples and tongues brief §1.1: the custom icons.
  peoplesTongues: ICON_LANGUAGES,
  // Bynames brief §1.1: Lucide icons.
  epithets: ICON_EPITHETS,
  titles: "crown",
  familyNames: ICON_FAMILY_NAMES,
  // Ships brief §1.1, with the supplied ship icon for ships and boats.
  ships: ICON_SHIPS,
  spacecraft: ICON_SPACECRAFT,
  // Aircraft and land vehicles brief §1.1: custom icons.
  aircraft: ICON_JET_PLANE,
  landVehicles: ICON_MONSTER_TRUCK,
  // Group brief §1.1: Lucide icons.
  mysticOrders: ICON_MYSTIC,
  martialOrders: ICON_MARTIAL,
  underworldGroups: ICON_UNDERWORLD,
  tradeGuilds: ICON_TRADE,
  adventureCompanies: ICON_ADVENTURERS,
  powerFactions: "crown",
  supernaturalCourts: "crown",
};

// Each switcher group's icon in the switcher menu; the trigger wears the open module's own icon.
export const GROUP_ICONS: Record<SectionGroup, string> = {
  placeNames: ICON_PLACE_SHAPES,
  urban: ICON_URBAN,
  seasCoasts: ICON_SEAS_COASTS,
  wildLands: ICON_BIOME,
  groupNames: ICON_GROUP_NAMES,
  bynames: ICON_BYNAMES,
  vehicles: ICON_VEHICLES,
  // Named things brief §1.1: custom icons.
  namedThings: ICON_GEM,
  advanced: ICON_ADVANCED,
};
