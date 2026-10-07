// A recipe's takeover pack (recipe takeover brief §A2). No Obsidian imports: the host finds the
// pack's index entry and supplies the takeover module's own target rules; this module prepares the
// target once per run and hands the names engine an adopter.

import { adoptName, prepareTakeoverTarget } from "../ageing/engine";
import { MarkovModel } from "../markov";
import { type MixPackIndexEntry } from "../nameParser";
import { type NativeAdapter } from "../names/engine";

/** The scorer the takeover section builds for a takeover pack, at the given faithfulness. */
export function takeoverScorer(faithfulness: number): (names: string[]) => (word: string) => number {
  return (names) => {
    const model = MarkovModel.build(names);
    return (word) => model.scoreWord(word, faithfulness);
  };
}

export interface RecipeTakeoverInput {
  /** The pack as the recipe names it, for the notice. */
  name: string;
  /** The pack's index entry; undefined when the link didn't resolve. */
  entry: MixPackIndexEntry | undefined;
  index: MixPackIndexEntry[];
  /** The takeover module's eligibility rules (ageing §1): why a pack can't be used, or undefined. */
  targetReason: (entry: MixPackIndexEntry, index: MixPackIndexEntry[]) => string | undefined;
  /** The takeover module's target resolution: the names a pack contributes, or why it can't. */
  targetNames: (
    entry: MixPackIndexEntry,
    index: MixPackIndexEntry[],
  ) => { names: string[]; corpus: string[]; endings: string[] } | string;
  faithfulness: number;
}

/** The notice for a takeover pack that can't be used (§A2). */
export function takeoverPackNotice(name: string, reason: string): string {
  return `Takeover pack “${name}” can't be used: ${reason}. Native names were left unchanged.`;
}

/**
 * Prepares a recipe's takeover pack once, returning the adopter for the names engine, or the notice
 * to show when the pack is missing or ineligible (the recipe then generates as if none were set).
 */
export function resolveRecipeTakeover(input: RecipeTakeoverInput): { adapt: NativeAdapter } | { notice: string } {
  const { entry, index } = input;
  const reason = entry ? input.targetReason(entry, index) : "it wasn't found";
  const target = entry && !reason ? input.targetNames(entry, index) : reason;
  if (typeof target === "string" || target === undefined) {
    return { notice: takeoverPackNotice(input.name, target ?? "it isn't eligible") };
  }
  const prepared = prepareTakeoverTarget(target.corpus, takeoverScorer(input.faithfulness), target.endings);
  return { adapt: (native, rng) => adoptName({ native, target: prepared, rng })?.adopted ?? null };
}
