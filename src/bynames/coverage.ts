// Coverage adapters for epithets and bynames, titles and honourifics, and family names (shared lens brief §6.1).
import bynameData from "../data/bynames.json";
import { type CoverageAdapter, type CoverageRow, listRows, makeRow, vocabularyRows } from "../coverageRows";
import { listsUsed, plainWordRows, wordListRows } from "../coverageUse";

type Entry = Record<string, unknown>;
const LISTS = bynameData.lists as unknown as Record<string, unknown[]>;
const ROSTER = (bynameData.cultures as { key: string }[]).map((c) => c.key);
const kindsOf = (node: { kinds: { key: string }[] }) => node.kinds.map((k) => k.key);

/** A table keyed by culture whose entries are plain entries (`{ w }`, `{ m, f … }`): each a word for that culture. */
function cultureWords(module: string, table: unknown, source: string): CoverageRow[] {
  const out: CoverageRow[] = [];
  for (const [culture, list] of Object.entries((table ?? {}) as Record<string, unknown>)) {
    if (!Array.isArray(list)) continue;
    for (const entry of list) out.push(makeRow(typeof entry === "object" && entry ? (entry as Entry) : {}, { module, source: `${source}/${culture}`, type: "word", culture }));
  }
  return out;
}

function epithetRows(): CoverageRow[] {
  const module = "epithets";
  const out = listRows(bynameData.epithets.shapes, { module, source: "epithets/shapes" });
  out.push(...wordListRows(LISTS, listsUsed(LISTS, bynameData.epithets), { module }));
  out.push(...cultureWords(module, bynameData.styles, "styles"));
  for (const [culture, words] of Object.entries(bynameData.cultureAnimals as Record<string, unknown[]>)) out.push(...plainWordRows(words, { culture }, { module, source: `cultureAnimals/${culture}` }));
  out.push(...vocabularyRows(module));
  return out;
}

function titleRows(): CoverageRow[] {
  const module = "titles";
  const out = listRows(bynameData.titles.shapes, { module, source: "titles/shapes" });
  out.push(...wordListRows(LISTS, listsUsed(LISTS, bynameData.titles), { module }));
  out.push(...cultureWords(module, bynameData.ranks, "ranks"));
  out.push(...vocabularyRows(module));
  return out;
}

function familyRows(): CoverageRow[] {
  const module = "familyNames";
  const out: CoverageRow[] = [];
  // Each culture's forms, by kind: patterns for that culture.
  for (const [culture, data] of Object.entries(bynameData.family.cultures as unknown as Record<string, { forms?: Record<string, unknown[]> }>)) {
    for (const [kind, forms] of Object.entries(data.forms ?? {})) {
      out.push(...listRows(forms, { module, source: `family/cultures/${culture}`, kind, culture }));
    }
  }
  out.push(...wordListRows(LISTS, listsUsed(LISTS, bynameData.family), { module }));
  out.push(...vocabularyRows(module));
  return out;
}

export const bynameCoverage: CoverageAdapter[] = [
  { module: "epithets", kinds: kindsOf(bynameData.epithets), roster: ROSTER, rows: epithetRows },
  { module: "titles", kinds: kindsOf(bynameData.titles), roster: ROSTER, rows: titleRows },
  { module: "familyNames", kinds: kindsOf(bynameData.family), roster: ROSTER, rows: familyRows },
];
