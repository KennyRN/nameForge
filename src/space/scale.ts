// Stellar brief §2: the five scales and the filter that every scale-tagged space list shares.
// Obsidian-free.

import spaceData from "../data/space.json";

export type SpaceScale = "Pl" | "Sy" | "Nb" | "Se" | "Ga";
export type ScaleChoice = "any" | SpaceScale;
/** The eras a scale can be gated by: the two future eras, or none (group names). */
export type ScaleEra = "NF" | "IS" | undefined;

export interface ScaleInfo {
  label: string;
  phrase: string;
  tooltip: string;
}

export const SPACE_DATA = spaceData as unknown as {
  scales: {
    order: SpaceScale[];
    any: ScaleInfo;
    list: Record<SpaceScale, ScaleInfo>;
    byEra: Record<string, ScaleChoice[]>;
    anyWeights: Record<string, Record<SpaceScale, number>>;
  };
  stars: {
    properExtra: string[];
    possessiveReal: string[];
    possessiveRealShare: number;
    greekHeavy: { letters: string[]; weight: number; other: number };
    genitives: string[];
    catalogue: { prefix: string; joiner: string; min: number; max: number; w: number }[];
    planetLetters: Record<string, number>;
    planetLetterChance: number;
    letterWords: Record<string, string>;
    kindWeights: Record<string, Record<string, number>>;
  };
  directions: {
    spaceDirection: { w: string; sc: SpaceScale[] }[];
    compass: Record<string, string[]>;
    stationDirection: string[];
    orbitAdj: string[];
    spaceHazard: { w: string; sc: SpaceScale[] }[];
  };
  lagrangeWord: [string, number][];
  worldHab: [string, number][];
  worldHabGate: [string, number];
  spaceBuilt: string[];
  spaceActivity: string[];
  safeguards: { block: string[] };
};

export const SCALES: SpaceScale[] = SPACE_DATA.scales.order;

export function scaleInfo(choice: ScaleChoice): ScaleInfo {
  return choice === "any" ? SPACE_DATA.scales.any : SPACE_DATA.scales.list[choice];
}

export const scaleLabel = (choice: ScaleChoice) => scaleInfo(choice).label;
export const scalePhrase = (choice: ScaleChoice) => scaleInfo(choice).phrase;

/** §2.2: the choices an era offers, "any scale" first. */
export function scalesFor(era: ScaleEra): ScaleChoice[] {
  return [...SPACE_DATA.scales.byEra[era ?? "none"]];
}

/** §2.2: a chosen scale the era no longer offers resets to any, without a notice. */
export function validScale(choice: ScaleChoice | undefined, era: ScaleEra): ScaleChoice {
  return choice && scalesFor(era).includes(choice) ? choice : "any";
}

/** §2.4: no `sc` allows every scale; any allows every entry; otherwise the tag must include the scale. */
export function scaleAllows(entry: { sc?: readonly string[] }, scale: ScaleChoice): boolean {
  if (scale === "any" || !entry.sc) return true;
  return entry.sc.includes(scale);
}

/** §2.4: the entries a scale allows; an empty result falls back to all of them (never a crash). */
export function scaleFilter<T extends { sc?: readonly string[] }>(entries: T[], scale: ScaleChoice): T[] {
  if (scale === "any") return entries;
  const kept = entries.filter((e) => scaleAllows(e, scale));
  return kept.length > 0 ? kept : entries;
}

/** §2.3: the weights for drawing a scale per name under "any scale". */
export function anyScaleWeights(era: ScaleEra): [SpaceScale, number][] {
  const row = SPACE_DATA.scales.anyWeights[era ?? "none"];
  return SCALES.map((s): [SpaceScale, number] => [s, row[s]]);
}

/** §2.3: one scale for a name. */
export function drawScale(era: ScaleEra, rng: () => number): SpaceScale {
  const items = anyScaleWeights(era);
  const total = items.reduce((n, [, w]) => n + w, 0);
  let r = rng() * total;
  for (const [s, w] of items) {
    r -= w;
    if (r < 0) return s;
  }
  return items[items.length - 1][0];
}

/** §3.3: the scale-filtered direction words. */
export function spaceDirections(scale: ScaleChoice): string[] {
  return scaleFilter(SPACE_DATA.directions.spaceDirection, scale).map((e) => e.w);
}
