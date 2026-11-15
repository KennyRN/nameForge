// Northern Europe tables brief, batch 5a: the batch's own data (src/data/north5a.json, written by
// scripts/make-north5a.mjs) and the merges the engines and coverage adapters share. No Obsidian imports.

import lensData from "./data/lens.json";
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

export const NORTH = north as unknown as NorthData & { nounPools: string[] };

// ── Brief 5a §11.3: the culture shows ───────────────────────────────────────

/** The share of a kind's draws the signature frames of a core culture (or Celtic) take. */
export const SIGNATURE_SHARE = (lensData as unknown as { shares: { signature: number; region: number } }).shares.signature;
/** Brief 5b §12.1: the share of a module's own-shape draws that region-weighted shapes take when a region is chosen. */
export const REGION_SHARE = (lensData as unknown as { shares: { signature: number; region: number } }).shares.region;

/**
 * §11.3: scale the signature plans (the batch's own, `sig`) so they hold `SIGNATURE_SHARE` of the total weight, as the weights stand
 * once era, fantastic, region and tone are applied, against the plain (non-regional) shapes. Nothing changes when a culture has none or when only they are left.
 */
export function balanceSignature<T>(plans: [T, number][], isSig: (p: T) => boolean, isRegional: (p: T) => boolean = () => false): [T, number][] {
  let sig = 0;
  let rest = 0;
  // A shape that belongs to a region (fell and dale words, the Corpse Road) keeps its own weight on top: the share is of the plain shapes.
  for (const [p, w] of plans) if (isSig(p)) sig += w; else if (!isRegional(p)) rest += w;
  if (sig <= 0 || rest <= 0) return plans;
  const k = (SIGNATURE_SHARE / (1 - SIGNATURE_SHARE)) * (rest / sig);
  return plans.map(([p, w]): [T, number] => [p, isSig(p) ? w * k : w]);
}

/** Tests: called with each region balance made (module, culture, region, the live regional plans, all live plans). */
let regionProbe: ((info: { regional: number; total: number }) => void) | undefined;
export const setRegionProbe = (fn: typeof regionProbe): void => { regionProbe = fn; };

/**
 * Brief 5b §12.1: when a region is chosen, the plans weighted for it (`isRegional`) hold `REGION_SHARE` of the total weight, as the weights stand.
 * Nothing changes when none are live or when only they are.
 */
export function balanceRegion<T>(plans: [T, number][], isRegional: (p: T) => boolean): [T, number][] {
  let reg = 0;
  let rest = 0;
  let n = 0;
  for (const [p, w] of plans) if (isRegional(p)) { reg += w; n++; } else rest += w;
  regionProbe?.({ regional: n, total: plans.length });
  if (reg <= 0 || rest <= 0) return plans;
  const k = (REGION_SHARE / (1 - REGION_SHARE)) * (rest / reg);
  return plans.map(([p, w]): [T, number] => [p, isRegional(p) ? w * k : w]);
}

/** Whether a region tag is weighted for the chosen region: its row gives the region a weight of 1 or more. */
export const regionWeighted = (rows: Record<string, Record<string, number>>, tag: string | undefined, region: string | undefined): boolean => !!tag && !!region && (rows[tag]?.[region] ?? 0) >= 1;

// ── §11.3: no noun twice in a batch ─────────────────────────────────────────

const NOUN_POOLS = new Set<string>(NORTH.nounPools);
const NOUN_USE = new WeakMap<object, Map<string, number>>();
const NOUN_LIMIT = 2;

/** Whether the pool is one of a culture's own noun lists. */
export const isNounPool = (pool: string): boolean => NOUN_POOLS.has(pool);

/** §11.3: a pool's entries without the nouns already used twice in this batch (the stream is the batch's); all of them when none would be left. */
export function freshNouns<E extends { w: string }>(batch: object, pool: string, items: [E, number][]): [E, number][] {
  if (!NOUN_POOLS.has(pool)) return items;
  const used = NOUN_USE.get(batch);
  if (!used) return items;
  const kept = items.filter(([e]) => (used.get(e.w.toLowerCase()) ?? 0) < NOUN_LIMIT);
  return kept.length > 0 ? kept : items;
}

/** §11.3: note a noun drawn from a pool in this batch. */
export function noteNoun(batch: object, pool: string, word: string): void {
  if (!NOUN_POOLS.has(pool)) return;
  let used = NOUN_USE.get(batch);
  if (!used) NOUN_USE.set(batch, (used = new Map()));
  used.set(word.toLowerCase(), (used.get(word.toLowerCase()) ?? 0) + 1);
}

/** A region table with the batch's columns added to its rows and its own rows added. */
export function mergeRegionColumns(base: Rows, columns: Rows | undefined, extra: Rows | undefined): Rows {
  const out: Rows = {};
  for (const [tag, row] of Object.entries(base)) out[tag] = { ...row, ...(columns?.[tag] ?? {}) };
  for (const [tag, row] of Object.entries(extra ?? {})) out[tag] = { ...(out[tag] ?? {}), ...row };
  return out;
}

/** Northern Europe brief 5a §11.6: the plain word for a narrow valley reads "Combe" for Welsh and Cornish (wherever chosen) and in WAL and COR; "Glen" stays for Scottish, Irish and the north. */
export function combeFor(text: string, culture: string, region?: string): string {
  return culture === "welsh" || culture === "cornish" || region === "WAL" || region === "COR" ? text.replace(/\bGlen\b/g, "Combe") : text;
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
