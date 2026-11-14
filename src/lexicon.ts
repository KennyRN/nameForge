// Shared tables brief §7: the core lexicon, one list per kind. Obsidian-free; reads its own JSON.
import lexicon from "./data/lexicon.json";

export interface LexiconWord {
  w: string;
  x?: number;
  t?: string[];
  s?: string[];
}
export type LexiconKind = keyof typeof lexicon.kinds;
export const LEXICON_KINDS = Object.keys(lexicon.kinds) as LexiconKind[];
/** A kind's words, optionally only those allowed in a setting code (words with no setting tag are allowed everywhere). */
export function lexiconWords(kind: LexiconKind, setting?: string): LexiconWord[] {
  return (lexicon.kinds[kind] as LexiconWord[]).filter((e) => !setting || !e.s || e.s.includes(setting));
}

/** Adds the shared lexicon's words of a kind to a module's pool (words already in the pool, in any case, are left as they are). */
export function mergeLexicon<T extends { w: string }>(pool: T[], kind: LexiconKind): void {
  const have = new Set(pool.map((e) => e.w.toLowerCase()));
  for (const e of lexiconWords(kind)) if (!have.has(e.w.toLowerCase())) pool.push({ w: e.w, ...(e.x ? { x: e.x } : {}), ...(e.t ? { t: e.t } : {}), ...(e.s ? { s: e.s } : {}) } as unknown as T);
}
