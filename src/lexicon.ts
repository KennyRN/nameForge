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
