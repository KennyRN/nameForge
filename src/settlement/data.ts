// Settlement names data and size filter (urban brief §4, §5). No Obsidian imports.
// The data is fixed in settlement-names.json: anything it leaves out is never drawn by the
// settlement names module; the source engines only consult it when given a `settlement` option.

import raw from "../data/settlement-names.json";

export type SizeKey = "any" | "hamlet" | "village" | "town" | "city" | "great";

export interface SettlementSize {
  key: SizeKey;
  /** One letter in the data's size code strings; absent for "any". */
  code?: string;
  label: string;
}

interface SettlementData {
  sizes: SettlementSize[];
  fallbackOrder: SizeKey[];
  generics: Record<string, string>;
  spaceSiteGroups: { groups: string[]; sizes: string };
  affixes: Record<string, Record<string, string>>;
  world: Record<string, { eras: Record<string, Record<string, string>>; lists: Record<string, Record<string, string>> }>;
}

export const SETTLEMENT_DATA = raw as unknown as SettlementData;
export const SETTLEMENT_SIZES: readonly SettlementSize[] = SETTLEMENT_DATA.sizes;
/** Size fallback, largest first (§4). */
export const SIZE_FALLBACK_ORDER: readonly SizeKey[] = SETTLEMENT_DATA.fallbackOrder;

export const sizeLabel = (size: SizeKey): string => SETTLEMENT_SIZES.find((s) => s.key === size)!.label;

/** The sizes to try for a chosen size: itself, then each smaller one (none for "any"). */
export function sizesToTry(size: SizeKey): SizeKey[] {
  if (size === "any") return ["any"];
  return SIZE_FALLBACK_ORDER.slice(SIZE_FALLBACK_ORDER.indexOf(size));
}

/** Whether a size code string allows the size; "any" allows everything the file lists. */
export function sizeAllows(codes: string | undefined, size: SizeKey): boolean {
  if (codes === undefined) return false;
  if (size === "any") return true;
  const code = SETTLEMENT_SIZES.find((s) => s.key === size)?.code;
  return !!code && codes.includes(code);
}

export const genericAllowed = (genericId: string, size: SizeKey): boolean => sizeAllows(SETTLEMENT_DATA.generics[genericId], size);

/** Under a space biome, every generic of these colonial landscape groups is a site (hamlet or village). */
export const spaceSiteAllowed = (groupId: string, size: SizeKey): boolean =>
  SETTLEMENT_DATA.spaceSiteGroups.groups.includes(groupId) && sizeAllows(SETTLEMENT_DATA.spaceSiteGroups.sizes, size);

/** An affix form (matched by its text); "*" covers every form of a slot-filled type. */
export function affixFormAllowed(typeId: string, text: string, size: SizeKey): boolean {
  const forms = SETTLEMENT_DATA.affixes[typeId];
  return !!forms && sizeAllows(forms[text] ?? forms["*"], size);
}

export const worldTemplateAllowed = (cultureId: string, eraId: string, template: string, size: SizeKey): boolean =>
  sizeAllows(SETTLEMENT_DATA.world[cultureId]?.eras[eraId]?.[template], size);

/** A list entry's word, without its "|plural" or trailing "~". */
export function entryWord(raw: string): string {
  const body = raw.endsWith("~") ? raw.slice(0, -1) : raw;
  return body.split("|")[0];
}

/**
 * A culture's list filtered to the size (§5). Undefined when the file doesn't filter that list.
 * With no word at the size, any word of the filtered list stands in, never an unfiltered one.
 */
export function filterWorldList(cultureId: string, key: string, entries: readonly string[], size: SizeKey): string[] | undefined {
  const words = SETTLEMENT_DATA.world[cultureId]?.lists[key];
  if (!words) return undefined;
  const listed = entries.filter((e) => words[entryWord(e)] !== undefined);
  const atSize = listed.filter((e) => sizeAllows(words[entryWord(e)], size));
  return atSize.length > 0 ? atSize : listed;
}

/** Whether a culture's era has templates in the file at all. */
export const worldHasEra = (cultureId: string, eraId: string): boolean => !!SETTLEMENT_DATA.world[cultureId]?.eras[eraId];
