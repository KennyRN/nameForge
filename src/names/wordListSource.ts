// Turns a word list section into the engine's weighted items (word lists brief §B). No Obsidian
// imports: the host supplies `resolvePack`, which looks a `//` line's pack up relative to the word list.

import { type PackLine, type WordEntry } from "../packs/wordList";
import { type NameWordEntry, type PackDraw, type ResolvedListItem } from "./engine";

/** What a `//` line's pack resolved to. */
export type PackLookup = { draw: PackDraw } | { missing: true } | { notPack: true };

/** A word list entry in the engine's shape. */
export function toNameWordEntry(e: WordEntry): NameWordEntry {
  return {
    modern: e.modern,
    ...(e.traditional ? { traditional: e.traditional } : {}),
    plural: e.plural,
    forms: e.combiningForms,
    fuses: e.fuses,
  };
}

/** Whether a section needs the item path: any `//` line, weight or gender tag. Plain tables keep the old path. */
export function needsItems(section: { entries: WordEntry[]; packs: PackLine[] }): boolean {
  return section.packs.length > 0 || section.entries.some((e) => e.weight !== undefined || e.gender !== undefined);
}

/**
 * The section's items: its words, then its `//` packs. A pack that's missing, or isn't a name pack
 * (a word list or a recipe — word lists never nest), is dropped with a notice.
 */
export async function resolveWordListItems(
  section: { entries: WordEntry[]; packs: PackLine[] },
  listName: string,
  resolvePack: (pack: string) => Promise<PackLookup>,
): Promise<{ items: ResolvedListItem[]; notices: string[] }> {
  const notices: string[] = [];
  const items: ResolvedListItem[] = section.entries.map((e) => ({
    weight: e.weight ?? 1,
    ...(e.gender ? { gender: e.gender } : {}),
    entry: toNameWordEntry(e),
  }));
  for (const line of section.packs) {
    const found = await resolvePack(line.pack);
    if ("missing" in found) {
      notices.push(`Pack “${line.pack}” in word list “${listName}” wasn't found.`);
      continue;
    }
    if ("notPack" in found) {
      notices.push(`“${line.pack}” in word list “${listName}” isn't a name pack.`);
      continue;
    }
    items.push({ weight: line.weight, ...(line.gender ? { gender: line.gender } : {}), draw: found.draw });
  }
  return { items, notices };
}
