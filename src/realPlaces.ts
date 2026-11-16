// Northern Europe brief 5b §12.3: the well-known real places and towns (src/data/real-places.json).
import data from "./data/real-places.json";
import { isLiveryNearMatch } from "./guildForms";

const FEATURES = new Set((data as { places: string[] }).places.map((n) => n.toLowerCase()));
const TOWNS = new Set((data as { towns: string[] }).towns.map((n) => n.toLowerCase()));
/** Words that qualify a name without changing what it names ("South Bath", "Old York", "The York"). */
const QUALIFIERS = new Set(["the", "north", "south", "east", "west", "northern", "southern", "eastern", "western", "upper", "lower", "inner", "outer", "old", "new", "great", "little", "greater", "lesser", "far", "near"]);

/** Whether a whole fill is a well-known real place or town ("Bath", "York", "Snowdon"). */
export const isRealPlace = (name: string): boolean => {
  const n = name.trim().toLowerCase();
  return FEATURES.has(n) || TOWNS.has(n);
};

/**
 * Whether a generated name is a real town, alone or after qualifiers ("Bath", "South Bath", "The Old York"). Real features
 * ("The Black Mountains", "Fair Isle") are not caught: a generated compound that matches one is allowed (brief rule 5).
 */
export function isRealTownName(name: string): boolean {
  const words = name.trim().toLowerCase().split(/\s+/);
  let i = 0;
  while (i < words.length - 1 && QUALIFIERS.has(words[i])) i++;
  return TOWNS.has(words.slice(i).join(" "));
}

// Northern Europe brief 5c §13.4: the well-known real groups, realms, craft and objects (the Hanseatic League, the Black Watch, the Mary Rose…).
const GROUPS = new Set(((data as unknown as { groups: string[] }).groups).map((n) => n.toLowerCase().replace(/^the\s+/, "")));
const REAL_PHRASE = new RegExp(
  `(?:^|[^a-z])(?:${[...GROUPS].filter((g) => g.split(" ").length >= 2).map((g) => g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?:$|[^a-z])`,
);
/** 5d §14.1 item 6: whether a name holds a well-known real group, realm or craft as a whole phrase ("Black Watch of the Eagle", "Kingdom of the Isles and the Tinners"). */
export const containsRealGroup = (name: string): boolean => REAL_PHRASE.test(name.toLowerCase().replace(/^the\s+/, "").replace(/[’]/g, "'"));
/** Whether a name is a well-known real group, realm, craft or object ("the Black Watch", "Mary Rose"); a fixed name never is. */
export const isRealGroup = (name: string): boolean => GROUPS.has(name.trim().toLowerCase().replace(/^the\s+/, "").replace(/[’]/g, "'")) || isLiveryNearMatch(name);
