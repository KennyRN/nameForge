// Word list packs (names-reference §9). No Obsidian imports.
//
// The body holds `##` sections, each with any mix of:
// - markdown tables: | Modern | Traditional | Plural | Combining forms | Fuses |
// - `-` lines of plain words, comma-separated: `- Knight, Earl, Baron`
// - `//` lines naming a name pack to draw from: `// Saxon Saints` or `// [[Saxon Saints]]`
// `-` and `//` lines may end in tags: `(female)`, `(3)`, `(male, 2)` — a gender and/or a weight.

export type Fuses = "yes" | "no" | "traditional-only";

export type WordGender = "male" | "female";

export interface WordEntry {
  modern: string;
  traditional?: string;
  plural: string;
  /** Without the trailing hyphen; one is chosen with equal chance. */
  combiningForms: string[];
  fuses: Fuses;
  /** From a `-` line's tags; absent means weight 1 and no gender. */
  weight?: number;
  gender?: WordGender;
}

/** A `//` line: a name pack drawn from when this item is picked. */
export interface PackLine {
  pack: string;
  weight: number;
  gender?: WordGender;
}

export interface WordListSection {
  name: string;
  entries: WordEntry[];
  packs: PackLine[];
}

export interface WordList {
  /** Entries in tables and `-` lines before the first heading. */
  unsectioned: WordEntry[];
  /** `//` lines before the first heading. */
  unsectionedPacks: PackLine[];
  sections: WordListSection[];
}

const BLANK = new Set(["", "—", "–", "-"]);
const blank = (v: string | undefined) => v === undefined || BLANK.has(v.trim());
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function cells(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

function parseFuses(value: string | undefined): Fuses {
  if (blank(value)) return "yes";
  const v = value!.trim().toLowerCase();
  if (v.startsWith("no")) return "no";
  if (v.startsWith("traditional")) return "traditional-only";
  return "yes";
}

/** One table row → entry, applying the §9.1 defaults for blank columns. */
function toEntry(header: string[], row: string[]): WordEntry | null {
  const col = (name: string) => {
    const i = header.findIndex((h) => same(h, name));
    return i >= 0 ? row[i] : undefined;
  };
  const modern = col("modern");
  if (blank(modern)) return null;
  const traditional = blank(col("traditional")) ? undefined : col("traditional")!;
  const plural = blank(col("plural")) ? `${modern}s` : col("plural")!;
  const forms = blank(col("combining forms"))
    ? [modern!]
    : col("combining forms")!.split(",").map((f) => f.trim().replace(/-$/, "")).filter((f) => f.length > 0);
  return { modern: modern!, ...(traditional ? { traditional } : {}), plural, combiningForms: forms, fuses: parseFuses(col("fuses")) };
}

/** A final "(…)" group of tags, if every item in it is one; otherwise the line has no tags. */
function splitTags(text: string): { text: string; weight: number; gender?: WordGender } {
  const match = text.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
  if (!match) return { text, weight: 1 };
  let weight = 1;
  let gender: WordGender | undefined;
  for (const raw of match[2].split(",")) {
    const tag = raw.trim().toLowerCase();
    if (tag === "male" || tag === "female") gender = tag;
    else if (/^\d+(\.\d+)?$/.test(tag) && Number(tag) > 0) weight = Number(tag);
    else return { text, weight: 1 };
  }
  return { text: match[1], weight, ...(gender ? { gender } : {}) };
}

/** A `-` line's words: Modern-only entries, with the line's tags on each. */
function bulletEntries(text: string): WordEntry[] {
  const tags = splitTags(text);
  return tags.text
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0)
    .map((modern) => ({
      modern,
      plural: `${modern}s`,
      combiningForms: [modern],
      fuses: "yes" as const,
      ...(tags.weight !== 1 ? { weight: tags.weight } : {}),
      ...(tags.gender ? { gender: tags.gender } : {}),
    }));
}

/** A `//` line's pack: a bare name or a wikilink (the part before any "|"). */
function packLine(text: string): PackLine | null {
  const tags = splitTags(text);
  const link = tags.text.match(/^\[\[([^\]|]+)(?:\|[^\]]*)?\]\]$/);
  const pack = (link ? link[1] : tags.text).trim();
  if (!pack) return null;
  return { pack, weight: tags.weight, ...(tags.gender ? { gender: tags.gender } : {}) };
}

export function parseWordList(body: string): WordList {
  const list: WordList = { unsectioned: [], unsectionedPacks: [], sections: [] };
  let target = list.unsectioned;
  let packs = list.unsectionedPacks;
  let header: string[] | null = null;

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    const heading = line.match(/^##\s+(.+?)\s*#*$/);
    if (heading) {
      const section: WordListSection = { name: heading[1], entries: [], packs: [] };
      list.sections.push(section);
      target = section.entries;
      packs = section.packs;
      header = null;
      continue;
    }
    const bullet = line.match(/^[-*+]\s+(.+)$/);
    if (bullet) {
      target.push(...bulletEntries(bullet[1]));
      header = null;
      continue;
    }
    const pack = line.match(/^\/\/\s*(.+)$/);
    if (pack) {
      const ref = packLine(pack[1]);
      if (ref) packs.push(ref);
      header = null;
      continue;
    }
    if (!line.startsWith("|")) {
      if (line === "") header = null;
      continue;
    }
    const row = cells(line);
    if (row.every((c) => /^:?-{2,}:?$/.test(c))) continue; // separator
    if (!header) {
      header = row;
      continue;
    }
    const entry = toEntry(header, row);
    if (entry) target.push(entry);
  }
  return list;
}

/**
 * The entries for a slot category (§9.2): the section whose heading matches the category label;
 * the whole list if it has no sections; otherwise null, so the caller falls back to its built-in
 * list with a notice.
 */
export function wordListEntries(list: WordList, categoryLabel: string): WordEntry[] | null {
  return wordListSection(list, categoryLabel)?.entries ?? null;
}

/** As wordListEntries, with the section's `//` pack lines too. */
export function wordListSection(list: WordList, categoryLabel: string): { name: string; entries: WordEntry[]; packs: PackLine[] } | null {
  const section = list.sections.find((s) => same(s.name, categoryLabel));
  if (section) return section;
  if (list.sections.length === 0) return { name: categoryLabel, entries: list.unsectioned, packs: list.unsectionedPacks };
  return null;
}

/** Template inheritance (§7): each list and section is inherited or replaced whole. */
export function mergeWordLists(derived: WordList, template: WordList): WordList {
  const sections = template.sections.map((t) => derived.sections.find((d) => same(d.name, t.name)) ?? t);
  for (const d of derived.sections) if (!template.sections.some((t) => same(t.name, d.name))) sections.push(d);
  const ownUnsectioned = derived.unsectioned.length > 0 || derived.unsectionedPacks.length > 0;
  return {
    unsectioned: ownUnsectioned ? derived.unsectioned : template.unsectioned,
    unsectionedPacks: ownUnsectioned ? derived.unsectionedPacks : template.unsectionedPacks,
    sections,
  };
}
