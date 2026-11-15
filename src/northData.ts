// Northern Europe tables brief, batch 5a: the batch's own data (src/data/north5a.json, written by
// scripts/make-north5a.mjs) and the merges the engines and coverage adapters share. No Obsidian imports.

import north from "./data/north5a.json";

type Row = Record<string, number>;
type Rows = Record<string, Row>;

export interface NorthSection {
  /** Culture shapes and fixed whole names of the batch's cultures, in the module's own shape format. */
  cultureShapes: Record<string, unknown>[];
  /** Region columns added to the existing region tags (the nine new codes, 0 unless the word fits). */
  regionColumns: Rows;
  /** New region tags: a word's weight in each of the 21 regions. */
  regionTags: Rows;
  /** A region tag drawn only for these module cultures (the British dialect words keep the rule they had). */
  regionTagFor: Record<string, string[]>;
  /** Weight rows for the batch's cultures (`of`, `dir`, `col`…). */
  cultureMult: Record<string, Record<string, number>>;
  homeland: Record<string, string>;
}

interface NorthData {
  vocab: { pools: Record<string, { entries?: Record<string, unknown>[]; cultureExtra?: Record<string, Record<string, unknown>[]> }> };
  wilds: NorthSection;
  waters: NorthSection;
  routes: { cultureShapes: Record<string, unknown>[]; regionColumns: Rows; regions: Rows };
  deities: { styles: Record<string, Record<string, unknown>> };
}

export const NORTH = north as unknown as NorthData;

/** A region table with the batch's columns added to its rows and its own rows added. */
export function mergeRegionColumns(base: Rows, columns: Rows | undefined, extra: Rows | undefined): Rows {
  const out: Rows = {};
  for (const [tag, row] of Object.entries(base)) out[tag] = { ...row, ...(columns?.[tag] ?? {}) };
  for (const [tag, row] of Object.entries(extra ?? {})) out[tag] = { ...(out[tag] ?? {}), ...row };
  return out;
}

/** Celtic is a mix (§3.2): each nation's signature entries at a quarter weight. */
export const CELTIC_MIX = ["welsh", "scottish", "irish", "cornish"];
export const CELTIC_MIX_WEIGHT = 0.25;

/** The culture shapes a culture draws: its own (`culture`, or a `c` list of its keys), and for Celtic each nation's at a quarter weight. */
export function shapesOf<T extends { culture?: string; c?: string[]; w: number }>(list: readonly T[], key: string): T[] {
  const out: T[] = [];
  for (const s of list) {
    if (s.culture === key || (!s.culture && s.c?.includes(key))) out.push(s);
    else if (key === "celtic" && s.culture && CELTIC_MIX.includes(s.culture)) out.push({ ...s, w: s.w * CELTIC_MIX_WEIGHT });
  }
  return out;
}
