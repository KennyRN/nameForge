// Shared tables brief §5 and §6: how an engine's batch is filled. Each module's generate function runs
// its engine with `people: placeholders` when the link is `real` or `generated`, then passes the batch here.
// The filler draws from a stream seeded from the batch's seed, so a seed still gives one batch.

import { mulberry32 } from "../markov";
import { fillSlots, type FillMode } from "./index";
import { registerPeopleResolvers } from "./people";

registerPeopleResolvers();

/** `real` or `generated` when the link asks for the filler; undefined for placeholders and invented. */
export const fillModeOf = (people: string | undefined): FillMode | undefined => (people === "real" || people === "generated" ? people : undefined);

export interface FillWhere {
  /** The state's lens culture (or a module's own key). */
  culture: string | undefined;
  /** An era code, or a band's genre. */
  era: string | undefined;
  region?: string;
  /** Shared tables brief §14.3: the state's biome id, for folk fills. */
  biome?: string;
  series?: boolean;
  /** Shared tables brief §13.2 item 6: a place module from the steam age on, or stars and space: [person] reads the founder forms. */
  personAsFounder?: boolean;
  /** Northern Europe brief 5c §13.1: fill only these labels (a per-slot run). */
  onlyLabels?: ReadonlySet<string>;
  /** Brief 5d §14.1 item 3: a `[place]` is filled from settlement names only (never a person's name). */
  settlementPlaces?: boolean;
}

const sexOf = (n: object): "male" | "female" | undefined => {
  const g = (n as { gender?: unknown }).gender;
  return g === "male" || g === "female" ? g : undefined;
};

/** A batch's names with the brackets of the slots the filler knows filled. */
export function fillPeopleBatch<T extends { names: { text: string }[]; seed: number }>(batch: T, mode: FillMode, where: FillWhere): T {
  const rng = mulberry32((batch.seed ^ 0x5eed5eed) >>> 0);
  const series = where.series ? new Map<string, string>() : undefined;
  // Shared tables brief §14.1: outside series mode a fill isn't reused within the batch while its list has others.
  const batchSeen = series ? undefined : new Map<string, Set<string>>();
  return {
    ...batch,
    names: batch.names.map((n) => ({ ...n, text: fillSlots(n.text, { culture: where.culture ?? "general", era: where.era ?? "MD", region: where.region, biome: where.biome, mode, rng, series, batchSeen, sex: sexOf(n), personAsFounder: where.personAsFounder, onlyLabels: where.onlyLabels, settlementPlaces: where.settlementPlaces }) })),
  };
}

/** One text, for the modules whose batch isn't a list of named results (the kit's lines, the peoples rows). */
export function fillText(text: string, mode: FillMode, where: FillWhere, rng: () => number, series?: Map<string, string>): string {
  return fillSlots(text, { culture: where.culture ?? "general", era: where.era ?? "MD", region: where.region, mode, rng, series });
}
