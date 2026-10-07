// Insert formats for adopted names (takeover brief §6.1). No Obsidian imports.

export type TakeoverInsertFormat = "adopted" | "origin" | "pair";

export const TAKEOVER_INSERT_FORMATS: { id: TakeoverInsertFormat; label: string }[] = [
  { id: "adopted", label: "Adopted only" },
  { id: "origin", label: "Adopted with origin" },
  { id: "pair", label: "Pair" },
];

export const DEFAULT_TAKEOVER_INSERT_FORMAT: TakeoverInsertFormat = "origin";

export const PAIR_SEPARATOR = " → ";

export function formatAdoptedName(native: string, adopted: string, format: TakeoverInsertFormat): string {
  if (format === "adopted") return adopted;
  if (format === "pair") return `${native}${PAIR_SEPARATOR}${adopted}`;
  return `${adopted} (from ${native})`;
}
