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
export const TIER6A_KEYS: readonly string[] = [...TIER6A_CULTURES, ...TIER6B_OWN, ...TIER6A_MIXES];

/** Labels as the rosters read them. */
export const TIER6A_LABELS: Readonly<Record<string, string>> = {
  french: "French", dutch: "Dutch", italian: "Italian", spanish: "Spanish", portuguese: "Portuguese", roman: "Roman", greek: "Greek", byzantine: "Byzantine", slavic: "Slavic",
  turkic: "Turkic", mongol: "Mongol", arabic: "Arabic", persian: "Persian", egyptian: "Egyptian", ethiopian: "Ethiopian", bantu: "Bantu", "west-african": "West African",
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
