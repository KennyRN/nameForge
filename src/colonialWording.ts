// The place name wizard's wording for the two colonial parts, shared with the exploration and
// expansion modules so both read the same. No Obsidian imports.

import { type ColonialPart } from "./colonialShapes";

/** Each part's contexts in order, as they read in the wizard's sentence; the first is the default. */
export const CONTEXT_PHRASES: Record<ColonialPart, [string, string][]> = {
  "2": [
    ["wild-and-unsettled", "wild and unsettled lands"],
    ["sparse-or-weak-native-presence", "lands with a sparse, or weak, native presence"],
    ["contested-frontier", "a contested frontier"],
  ],
  "2a": [
    ["imposition", "ruling over the locals"],
    ["accommodation", "living alongside the locals"],
    ["adoption", "settling in amongst the locals"],
  ],
};

/** The General tradition's name in each part. */
export function generalTraditionLabel(part: ColonialPart): string {
  return part === "2" ? "General explorers" : "General incomers";
}

/** A tradition's label for menus: the part's General name, otherwise the tradition's own label. */
export function traditionLabel(part: ColonialPart, id: string, label: string): string {
  return id === "general" ? generalTraditionLabel(part) : label;
}

/** Which parts a tradition belongs to, in the wizard's terms: "exploration and expansion", "exploration only". */
export function partsNote(parts: ColonialPart[]): string {
  if (parts.length === 2) return "exploration and expansion";
  return parts[0] === "2" ? "exploration only" : "expansion only";
}
