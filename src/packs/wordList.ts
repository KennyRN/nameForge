// Word list packs (names-reference §9). No Obsidian imports.
//
// The body holds `##` sections, each with a markdown table:
// | Modern | Traditional | Plural | Combining forms | Fuses |

export type Fuses = "yes" | "no" | "traditional-only";

export interface WordEntry {
  modern: string;
  traditional?: string;
  plural: string;
  /** Without the trailing hyphen; one is chosen with equal chance. */
  combiningForms: string[];
  fuses: Fuses;
}

export interface WordListSection {
  name: string;
  entries: WordEntry[];
}

export interface WordList {
  /** Entries in tables before the first heading. */
  unsectioned: WordEntry[];
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

export function parseWordList(body: string): WordList {
  const list: WordList = { unsectioned: [], sections: [] };
  let target = list.unsectioned;
  let header: string[] | null = null;

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    const heading = line.match(/^##\s+(.+?)\s*#*$/);
    if (heading) {
      const section = { name: heading[1], entries: [] as WordEntry[] };
      list.sections.push(section);
      target = section.entries;
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
  const section = list.sections.find((s) => same(s.name, categoryLabel));
  if (section) return section.entries;
  if (list.sections.length === 0) return list.unsectioned;
  return null;
}

/** Template inheritance (§7): each list and section is inherited or replaced whole. */
export function mergeWordLists(derived: WordList, template: WordList): WordList {
  const sections = template.sections.map((t) => derived.sections.find((d) => same(d.name, t.name)) ?? t);
  for (const d of derived.sections) if (!template.sections.some((t) => same(t.name, d.name))) sections.push(d);
  return { unsectioned: derived.unsectioned.length > 0 ? derived.unsectioned : template.unsectioned, sections };
}
