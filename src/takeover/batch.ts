// Name takeover batch filling (takeover brief §2). No Obsidian imports: the host supplies a native
// name drawer and an adopter; this module owns the seed streams, duplicates and the cap.

import { mulberry32 } from "../markov";
import { type Adoption, TAKEOVER } from "../ageing/engine";

export interface TakeoverBatchInput {
  /** Draws one native name from the native pack using the native stream; null if it produced none. */
  drawNative: (rng: () => number) => string | null;
  /** Adopts one native name using its own adoption RNG; null if no candidate passes the filters. */
  adopt: (native: string, rng: () => number) => Adoption | null;
  batchSize: number;
  seed?: number;
}

export interface TakeoverBatchResult {
  rows: Adoption[];
  seed: number;
  notice?: string;
}

/** Salt separating the adoption stream from the native stream (§2.2). */
const ADOPTION_SALT = 0x7a6e0f31;

/** FNV-1a over the lower-cased native name. */
function hashName(name: string): number {
  let h = 0x811c9dc5;
  for (const ch of name.toLowerCase()) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * The adoption RNG for one native name: it depends only on the seed and the name, so discarding a
 * native name can't disturb the adoptions that follow it (§2.2).
 */
export function adoptionRng(seed: number, native: string): () => number {
  return mulberry32(((seed ^ ADOPTION_SALT) ^ hashName(native)) >>> 0);
}

/** §1: the native and takeover packs must differ. */
export function samePackNotice(nativePath: string | undefined, takeoverPath: string | undefined): string | null {
  return nativePath && nativePath === takeoverPath ? "Choose a different takeover pack." : null;
}

export function takeOver(input: TakeoverBatchInput): TakeoverBatchResult {
  const seed = (input.seed ?? Math.floor(Math.random() * 0x100000000)) >>> 0;
  const batchSize = Math.max(0, Math.floor(input.batchSize));
  const nativeRng = mulberry32(seed);
  const cap = TAKEOVER.nativeCapFactor * batchSize;
  const seen = new Set<string>();
  const rows: Adoption[] = [];
  let generated = 0;
  while (rows.length < batchSize && generated < cap) {
    const native = input.drawNative(nativeRng);
    generated++;
    if (!native) continue;
    const key = native.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const adoption = input.adopt(native, adoptionRng(seed, native));
    if (adoption) rows.push(adoption);
  }
  const notice =
    rows.length < batchSize ? `Only ${rows.length} names could be adopted. Try a different takeover pack.` : undefined;
  return { rows, seed, notice };
}
