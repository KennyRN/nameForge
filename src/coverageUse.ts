// Helpers shared by the coverage adapters that read a module's own tables (shared lens brief §6.1).
// Pure: they walk plain JSON and never run a generator.

import { type CoverageRow, type EntryTags, listRows, makeRow, type RowOptions } from "./coverageRows";

/** Every `{name}` and `{name:form}` token in any string inside a JSON node: the lists a set of patterns draws on. */
export function tokensOf(node: unknown, found: Set<string> = new Set()): Set<string> {
  if (typeof node === "string") {
    for (const m of node.matchAll(/\{([A-Za-z0-9_]+)(?::[^}]*)?\}/g)) found.add(m[1]);
  } else if (Array.isArray(node)) {
    for (const x of node) tokensOf(x, found);
  } else if (node && typeof node === "object") {
    for (const x of Object.values(node as Record<string, unknown>)) tokensOf(x, found);
  }
  return found;
}

/** The lists (by name) a module's patterns use. */
export function listsUsed(lists: Record<string, unknown>, ...nodes: unknown[]): string[] {
  const tokens = new Set<string>();
  for (const n of nodes) tokensOf(n, tokens);
  return Object.keys(lists).filter((k) => tokens.has(k));
}

/** The word rows of a module's lists, by name. A list entry is `{ w, x?, t?, c?, e? }` or a bare string. */
export function wordListRows(lists: Record<string, unknown>, names: readonly string[], o: Omit<RowOptions, "source" | "type">, sourcePrefix = "lists"): CoverageRow[] {
  const out: CoverageRow[] = [];
  for (const name of names) {
    const list = lists[name];
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      const tags = (typeof entry === "object" && entry !== null ? entry : {}) as EntryTags;
      out.push(makeRow(tags, { ...o, source: `${sourcePrefix}/${name}`, type: "word" }));
    }
  }
  return out;
}

/** A plain array of strings (or `[string, …]` pairs), each a word, with the given tags. */
export function plainWordRows(list: unknown, tags: EntryTags, o: Omit<RowOptions, "type">): CoverageRow[] {
  if (!Array.isArray(list)) return [];
  return list.map(() => makeRow(tags, { ...o, type: "word" }));
}

export { listRows, makeRow };

/**
 * A row read through the module's genre settings or styles (§4.3): the eras and non-realistic styles
 * of its lens readings. A row available in every reading is open and gets neither.
 */
export function withReadings(row: CoverageRow, readings: readonly { style: string; eras?: readonly string[] }[], total: number, count: number): CoverageRow {
  if (count >= total) return row;
  const eras = [...new Set(readings.flatMap((r) => r.eras ?? []))];
  const styles = [...new Set(readings.map((r) => r.style).filter((s) => s !== "realistic"))];
  return { ...row, ...(eras.length > 0 && eras.length < 5 ? { eras } : {}), ...(styles.length > 0 ? { styles } : {}) };
}
