// Second-tier tables brief, batch 6a: the batch's own data (src/data/tier6a.json, written by scripts/make-tier6a.mjs) and the merges the engines and
// coverage adapters share. No Obsidian imports.

import tier6a from "./data/tier6a.json";
import tier6b from "./data/tier6b.json";
import tier6c from "./data/tier6c.json";
import type { NorthWorldCulture } from "./northData5b";

interface NewEra {
  id: string;
  label: string;
  guide?: string;
  lists: Record<string, string[]>;
  templates: [string, number][];
}

interface Tier6a {
  settlement: {
    /** The batch's cultures that are new world cultures (French, Dutch, Italian, Spanish, Portuguese, Greek, Byzantine). */
    cultures: NorthWorldCulture[];
    sizes: Record<string, { eras: Record<string, Record<string, string>>; lists: Record<string, Record<string, string>> }>;
    /** The eras added to the existing world cultures (Roman, Slavic), before Interstellar, and their size codes. */
    newEras: Record<string, NewEra[]>;
    augmentSizes: Record<string, { eras: Record<string, Record<string, string>>; lists: Record<string, Record<string, string>> }>;
    labels: Record<string, string>;
    eraMap: Record<string, Record<string, string[]>>;
  };
}

const A = tier6a as unknown as Tier6a;
const B = tier6b as unknown as Tier6a;
const C = tier6c as unknown as Tier6a;
type SizeTables = { eras: Record<string, Record<string, string>>; lists: Record<string, Record<string, string>> };
const mergeAugment = (a: Record<string, SizeTables>, b: Record<string, SizeTables>): Record<string, SizeTables> => {
  const out: Record<string, SizeTables> = { ...a };
  for (const [id, add] of Object.entries(b)) out[id] = { eras: { ...(out[id]?.eras ?? {}), ...add.eras }, lists: { ...(out[id]?.lists ?? {}), ...add.lists } };
  return out;
};
const mergeEras = (a: Record<string, NewEra[]>, b: Record<string, NewEra[]>): Record<string, NewEra[]> => {
  const out: Record<string, NewEra[]> = { ...a };
  for (const [id, eras] of Object.entries(b)) out[id] = [...(out[id] ?? []), ...eras];
  return out;
};
/** Batches 6a and 6b together: the settlement names of both. */
/** Second pass (brief §12 §3): the 6b cultures' own fills, by culture and kind (trees, plants, birds, beasts, water). */
export const TIER6B_FILLS = (tier6b as unknown as { fills: Record<string, Record<string, string[]>> }).fills;
export const TIER6A_DATA: Tier6a = {
  settlement: {
    cultures: [...A.settlement.cultures, ...B.settlement.cultures, ...C.settlement.cultures],
    sizes: { ...A.settlement.sizes, ...B.settlement.sizes, ...C.settlement.sizes },
    newEras: mergeEras(mergeEras(A.settlement.newEras, B.settlement.newEras), C.settlement.newEras),
    augmentSizes: mergeAugment(mergeAugment(A.settlement.augmentSizes, B.settlement.augmentSizes), C.settlement.augmentSizes),
    labels: { ...A.settlement.labels, ...B.settlement.labels, ...C.settlement.labels },
    eraMap: { ...A.settlement.eraMap, ...B.settlement.eraMap },
  },
};
