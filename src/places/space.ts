// Place modules split brief §5.5: stars and space. The module has no home country, runs only in the two
// future eras, and every kind draws from the colonial space groups (part 2 for newly explored space,
// part 2a for settled space) at a scale. This is the one place that maps a kind to the scales its groups
// live at, and a scale to the groups a draw may use. Obsidian-free; no engine is imported.

import { COLONIAL_DATA } from "../colonialShapes";
import { anyScaleWeights, SCALES, scalesFor, validScale, type ScaleChoice, type ScaleEra, type SpaceScale } from "../space/scale";
import type { KindSources } from "./sources";

export const SPACE_MODULE = "starsSpace";
export const isSpaceModule = (module: string): boolean => module === SPACE_MODULE;

/** The era a scale is gated by: the two future eras only. */
export const scaleEraOf = (era: string): ScaleEra => (era === "NF" || era === "IS" ? era : undefined);

/** The scales an era offers, without "any". */
export const scalesAtEra = (era: string): SpaceScale[] => scalesFor(scaleEraOf(era)).filter((s): s is SpaceScale => s !== "any");

/** The scale a colonial space group lives at; undefined for a group without one. */
export function groupScale(id: string): SpaceScale | undefined {
  return (COLONIAL_DATA.groups as { id: string; space?: boolean; scale?: SpaceScale }[]).find((g) => g.id === id)?.scale;
}

/** A kind's own scales: those of the colonial groups it names; a delegated kind (stations) is at every scale. */
export function kindScales(sources: KindSources | undefined): SpaceScale[] {
  if (!sources) return [];
  if (sources.delegate) return [...SCALES];
  const found = new Set<SpaceScale>();
  for (const id of sources.colonial?.groups ?? []) {
    const scale = groupScale(id);
    if (scale) found.add(scale);
  }
  return SCALES.filter((s) => found.has(s));
}

/** The scales a kind can be drawn at in an era: its own, among the era's. */
export function kindScalesAt(sources: KindSources | undefined, era: string): SpaceScale[] {
  const offered = scalesAtEra(era);
  return kindScales(sources).filter((s) => offered.includes(s));
}

/** The colonial groups a kind draws from at a scale (empty where it has none there). */
export function groupsAtScale(sources: KindSources | undefined, scale: SpaceScale): string[] {
  return (sources?.colonial?.groups ?? []).filter((id) => groupScale(id) === scale);
}

/** A chosen scale the era no longer offers reads as any (the route names' rule). */
export const scaleOf = (choice: ScaleChoice | undefined, era: string): ScaleChoice => validScale(choice, scaleEraOf(era));

/**
 * One scale for a name of a kind: the chosen one where the kind has it, otherwise (any scale, or a
 * scale the kind lacks) one of the kind's scales by the era's "any scale" weights. Undefined when the
 * kind has no scale in this era.
 */
export function scaleForDraw(sources: KindSources | undefined, era: string, choice: ScaleChoice | undefined, rng: () => number): SpaceScale | undefined {
  const own = kindScalesAt(sources, era);
  if (own.length === 0) return undefined;
  const chosen = scaleOf(choice, era);
  if (chosen !== "any" && own.includes(chosen)) return chosen;
  const weights = anyScaleWeights(scaleEraOf(era)).filter(([s]) => own.includes(s));
  const total = weights.reduce((n, [, w]) => n + w, 0);
  if (total <= 0) return own[Math.floor(rng() * own.length)];
  let r = rng() * total;
  for (const [s, w] of weights) {
    r -= w;
    if (r < 0) return s;
  }
  return weights[weights.length - 1][0];
}
