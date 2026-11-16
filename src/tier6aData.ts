// Second-tier tables brief, batch 6a: the batch's own data (src/data/tier6a.json, written by scripts/make-tier6a.mjs) and the merges the engines and
// coverage adapters share. No Obsidian imports.

import tier6a from "./data/tier6a.json";
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

export const TIER6A_DATA = tier6a as unknown as Tier6a;
