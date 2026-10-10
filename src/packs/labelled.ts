// Whole pack with labels (Compound brief §1.3): each name first picks one of the pack's lists,
// weighted by its number of names, then comes from that list alone, so its tag is true.
// No Obsidian imports.

import { ListGenerator, MarkovModel, mulberry32 } from "../markov";
import { breakdownSettingsFor } from "./sections";

export interface LabelledName {
  name: string;
  /** The list's `##` heading; none for names before the first heading. */
  tag?: string;
}

export interface LabelledList {
  tag?: string;
  names: string[];
}

export interface LabelledOptions {
  generator: "breakdown" | "list";
  count: number;
  faithfulness?: number;
  strictness?: number;
  seed?: number;
}

/**
 * Each list gets its own pool (a shuffle for List, a Markov batch for Breakdown) from a sub-seed
 * drawn in list order; names are then taken from the pools in weighted turn, deduped across the batch.
 */
export function generateLabelledNames(
  lists: LabelledList[],
  options: LabelledOptions,
): { names: LabelledName[]; seed: number; small: { tag?: string; count: number }[] } {
  const count = Math.max(0, Math.floor(options.count));
  const seed =
    options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const viable = lists.filter((l) => l.names.length > 0);
  const small: { tag?: string; count: number }[] = [];
  if (count === 0 || viable.length === 0) return { names: [], seed, small };

  const masterRng = mulberry32(seed);
  const subSeeds = viable.map(() => Math.floor(masterRng() * 0xffffffff) >>> 0);
  const pools: (string[] | undefined)[] = viable.map(() => undefined);
  const cursors = viable.map(() => 0);
  const pool = (i: number): string[] => {
    if (pools[i]) return pools[i]!;
    const list = viable[i];
    if (options.generator === "list") {
      const generator = new ListGenerator();
      generator.train(list.names);
      pools[i] = generator.generateMultiple(count, mulberry32(subSeeds[i]));
    } else {
      // §2.3: a list under the Breakdown minimum is loosened.
      const loosened = breakdownSettingsFor(list.names.length, options.strictness ?? 3);
      if (loosened.allowSourceCopies) small.push({ tag: list.tag, count: list.names.length });
      pools[i] = MarkovModel.build(list.names).generateDetailed({
        count,
        faithfulness: options.faithfulness ?? 2,
        ...loosened,
        seed: subSeeds[i],
      }).names;
    }
    return pools[i]!;
  };

  const result: LabelledName[] = [];
  const seen = new Set<string>();
  const live = viable.map((_, i) => i);
  while (result.length < count && live.length > 0) {
    const total = live.reduce((sum, i) => sum + viable[i].names.length, 0);
    let roll = masterRng() * total;
    let pick = live[live.length - 1];
    for (const i of live) {
      roll -= viable[i].names.length;
      if (roll < 0) {
        pick = i;
        break;
      }
    }
    const names = pool(pick);
    if (cursors[pick] >= names.length) {
      live.splice(live.indexOf(pick), 1);
      continue;
    }
    const name = names[cursors[pick]++];
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ name, ...(viable[pick].tag !== undefined ? { tag: viable[pick].tag } : {}) });
  }
  return { names: result, seed, small };
}
