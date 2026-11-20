// Second-tier tables brief, batch 6a (docs/second-tier-tables-brief.md): French, Dutch, Italian, Spanish, Portuguese, Roman, Greek, Byzantine
// and Slavic at core depth, with the Iberian and Greek-and-Byzantine mixes. The batch's culture keys and the helpers that add them to a roster
// a module already has. No Obsidian imports.

/** The cultures of the batch that are cultures of their own. */
export const TIER6A_CULTURES = ["french", "dutch", "italian", "spanish", "portuguese", "roman", "greek", "byzantine", "slavic", "turkic", "mongol", "arabic", "persian"] as const;
/** Brief 6b: the second-tier cultures whose batch gave them core depth with the keys they already had. */
export const TIER6B_OWN = ["egyptian", "ethiopian", "bantu", "west-african"] as const;
/** The legacy mixes of the batch: each draws its own legacy entries and both halves' signature entries at half weight (§2). */
export const TIER6A_MIXES = ["iberian", "greek-byzantine", "steppe", "arabic-persian"] as const;
/** The halves of each mix. */
export const MIX_HALVES: Readonly<Record<string, readonly string[]>> = { iberian: ["spanish", "portuguese"], "greek-byzantine": ["greek", "byzantine"], steppe: ["turkic", "mongol"], "arabic-persian": ["arabic", "persian"] };
export const MIX_HALF_WEIGHT = 0.5;
/** Every module culture key the batch adds to a roster (the ones a roster already has are kept as they are). */
/** Batch 6c: the four East and South Asian cultures (Indian, Chinese, Japanese, Korean), whose group modules read their own content like any other batch culture. */
export const TIER6C_OWN = ["indian", "chinese", "japanese", "korean"] as const;
export const TIER6A_KEYS: readonly string[] = [...TIER6A_CULTURES, ...TIER6B_OWN, ...TIER6C_OWN, ...TIER6A_MIXES];

/** Second pass (brief §12 §3): the cultures whose plant, tree, bird and beast fills come from their own lists alone (the pools below hold entries for them). */
export const OWN_FILL_CULTURES: readonly string[] = ["turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african", "steppe", "arabic-persian", "indian", "chinese", "japanese", "korean"];
/** The kind of fill each shared pool holds, for the 6b cultures' own lists. */
export const FILL_KIND: Readonly<Record<string, string>> = { wildTree: "trees", streetTree: "trees", wildFuse: "trees", lakeFuse: "trees", wetFlora: "plants", thingFlower: "plants", castleBird: "birds", mtBeast: "beasts", dsrBeast: "beasts", mrBeast: "beasts", wetBeast: "beasts", grsBeast: "beasts", fordBeast: "beasts", figureBeast: "beasts", warAnimal: "beasts", mythBeast: "beasts", fstBeast: "beasts", cultureDivineAnimal: "beasts", seaCreature: "water", lakeCreature: "water" };
/** Brief 6d A1: the biome code of each land and water module (d desert, f forest, g grassland, w wetland, m moor, t mountain, c coast, s sea, a farmland); the others have none and read every fill. */
export const MODULE_BIOME: Readonly<Record<string, string>> = { mountainNames: "t", forestNames: "f", desertNames: "d", moorNames: "m", wetlandNames: "w", grasslandNames: "g", farmland: "a", seasLakes: "s", coastsIslands: "c", seaCharts: "s" };
/** A fill word with its biome tags: "Saxaul@d" is drawn only in a desert module; an untagged word is generic. */
export const splitFill = (entry: string): { w: string; biomes?: string } => { const i = entry.lastIndexOf("@"); return i < 0 ? { w: entry } : { w: entry.slice(0, i), biomes: entry.slice(i + 1) }; };
export const FILL_POOLS: readonly string[] = ["wildTree", "streetTree", "wildFuse", "lakeFuse", "wetFlora", "thingFlower", "castleBird", "mtBeast", "dsrBeast", "mrBeast", "wetBeast", "grsBeast", "fordBeast", "figureBeast", "warAnimal", "mythBeast", "fstBeast", "cultureDivineAnimal", "seaCreature", "lakeCreature"];

/** Second pass (brief §12 §3): a 6b culture's names take no English rank or administrative word (a duke, a bishop, a shire, a hundred, a parish). */
const ENGLISH_RANKS = /(^|[^A-Za-z])(Duke|Duchess|Dukes|Bishop|Abbot|Abbess|Earl|Baron|Knight|Shire|[A-Za-z]*shire|Hundred(?! [A-Z])|Parish|Manor|Abbey|Priory|Vicar|Squire|Reeve|Thane|Rector|Dean|Prince|Princess|Duchy|Dukedom|County|Barony|Wapentake)('s|s)?($|[^A-Za-z])/;
export const hasEnglishRank = (text: string): boolean => ENGLISH_RANKS.test(text);

/** Labels as the rosters read them. */
export const TIER6A_LABELS: Readonly<Record<string, string>> = {
  french: "French", dutch: "Dutch", italian: "Italian", spanish: "Spanish", portuguese: "Portuguese", roman: "Roman", greek: "Greek", byzantine: "Byzantine", slavic: "Slavic",
  turkic: "Turkic", mongol: "Mongol", arabic: "Arabic", persian: "Persian", egyptian: "Egyptian", ethiopian: "Ethiopian", bantu: "Bantu", "west-african": "West African", indian: "Indian", chinese: "Chinese", japanese: "Japanese", korean: "Korean",
  iberian: "Iberian", "greek-byzantine": "Greek and Byzantine", steppe: "Turkic and Mongol steppe", "arabic-persian": "Arabic and Persian",
};
/** The roster group each is filed under in the modules that still group (the culture menu itself reads the lens). */
export const TIER6A_GROUPS: Readonly<Record<string, string>> = {
  french: "Western and southern Europe", dutch: "British Isles and northern Europe", italian: "Western and southern Europe", spanish: "Western and southern Europe", portuguese: "Western and southern Europe",
  roman: "Western and southern Europe", greek: "Western and southern Europe", byzantine: "Western and southern Europe", slavic: "Eastern Europe and the steppe",
  iberian: "Western and southern Europe", "greek-byzantine": "Western and southern Europe",
  turkic: "Eastern Europe and the steppe", mongol: "Eastern Europe and the steppe", steppe: "Eastern Europe and the steppe",
  arabic: "Middle East and Africa", persian: "Middle East and Africa", "arabic-persian": "Middle East and Africa", egyptian: "Middle East and Africa", ethiopian: "Middle East and Africa", bantu: "Middle East and Africa", "west-african": "Middle East and Africa",
};

/** A roster with the batch's keys it lacks added at the end (`make` builds an entry from a key). */
export function withTier6a<T extends { key: string }>(roster: readonly T[], make: (key: string) => T): T[] {
  return [...roster, ...TIER6A_KEYS.filter((k) => !roster.some((r) => r.key === k)).map(make)];
}
/** The same for a list of plain keys. */
export const withTier6aKeys = (keys: readonly string[]): string[] => [...keys, ...TIER6A_KEYS.filter((k) => !keys.includes(k))];
