// The lens clause as a module's sentence segments (one sentence brief §4): every family A and B
// sentence places the culture, era, world and region links `lensClause` builds, under its own field
// names (the world link is the module's `fantastic` field, so stored state and the modal's choose
// calls stay as they are). No Obsidian imports.

import { applyLensChoice, eraOffered, type LensField, type LensSegment } from "./lensView";

/** A lens link as one of a module's segments; `fixed` ones are drawn as plain text, not links. */
export interface LensedSegment<F extends string = string> {
  field: F;
  text: string;
  title: string;
  choices: { id: string; label: string; title?: string; group?: string; heading?: string }[];
  current: string;
  fixed?: boolean;
}

/** The lens segment under the module's own field name; a culture menu's headings are drawn as headings. */
export function asSegment<F extends string>(segment: LensSegment, field: F): LensedSegment<F> {
  return {
    field,
    text: segment.text,
    title: segment.title,
    choices: segment.choices.map((c) => ({ id: c.id, label: c.label, ...(c.title ? { title: c.title } : {}), ...(c.group ? { group: c.group, heading: c.group } : {}) })),
    current: segment.current,
    ...(segment.fixed ? { fixed: true } : {}),
  };
}

/**
 * "of the ‹medieval› era, in a ‹realistic› world": the era and world links with their words, leaving
 * out whichever the module can't tell apart. Empty when neither shows; the caller adds its separator
 * only when something came back.
 */
export function eraWorldSegments<E extends string, W extends string>(
  clause: Partial<Record<LensField, LensSegment>>,
  eraField: E,
  worldField: W,
): (string | LensedSegment<E> | LensedSegment<W>)[] {
  const out: (string | LensedSegment<E> | LensedSegment<W>)[] = [];
  if (clause.era) out.push(" of the ", asSegment(clause.era, eraField), " era");
  if (clause.world) out.push(clause.era ? ", in a " : " in a ", asSegment(clause.world, worldField), " world");
  return out;
}

export type ModuleLensField = "culture" | "era" | "fantastic" | "region";

/**
 * The state after a culture, era, world or region choice, read from the lens. The module's own
 * knock-ons (kinds, scales, biomes, the region on a non-British culture) follow in its choose function.
 * Accepts the module's own ids too: "on" and "off" for the world, a single era code for a run. An era the module
 * doesn't offer becomes `fallback`.
 */
export function chooseLens<S extends object>(moduleKey: string, state: S, field: ModuleLensField, id: string | undefined, fallback?: string): S {
  if (field === "region") return applyLensChoice(moduleKey, state, "region", id ?? "all");
  if (id === undefined) {
    if (field !== "era" || fallback === undefined) return state;
    id = fallback;
  }
  // An era the module doesn't have falls back to the module's default, as its own choose function always did.
  if (field === "era" && !eraOffered(moduleKey, id) && fallback !== undefined) id = fallback;
  if (field === "fantastic") return applyLensChoice(moduleKey, state, "world", id === "on" ? "fantastic" : id === "off" ? "plain" : id);
  return applyLensChoice(moduleKey, state, field, id);
}
