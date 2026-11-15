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

/**
 * Adds the shared lexicon's words of a kind to a module's pool; words already in the pool, in any case, are
 * left as they are (they are the module's extras). A pool of plain strings gets strings. `single`: one-word entries only,
 * for a list a pattern glues to another word ("Sky{weather}").
 */
export function mergeLexicon<T extends { w: string } | string>(pool: T[], kind: LexiconKind, opts: { single?: boolean } = {}): void {
  const word = (e: T) => (typeof e === "string" ? e : e.w).toLowerCase();
  const have = new Set(pool.map(word));
  const plain = pool.length > 0 && typeof pool[0] === "string";
  for (const e of lexiconWords(kind)) {
    if (have.has(e.w.toLowerCase()) || (opts.single && /[ -]/.test(e.w))) continue;
    pool.push((plain ? e.w : { w: e.w, ...(e.x ? { x: e.x } : {}), ...(e.t ? { t: e.t } : {}), ...(e.s ? { s: e.s } : {}) }) as unknown as T);
  }
}
