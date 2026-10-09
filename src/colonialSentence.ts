// The place name wizard's colonial sentences as plain data (Tribal brief §19.2), so they can be
// tested. No Obsidian imports: recipeEditor.ts draws the same wording as links.

import { BIOMES, findBiome } from "./biomes";
import { CONTEXT_PHRASES } from "./colonialWording";
import { COLONIAL_TRADITIONS } from "./colonialShapes";
import { PLACE_SHAPE_DATA } from "./placeShapes";

/** "General incomers", "Roman-themed incomers"; brackets and a trailing "Imperial" are dropped ("British-themed incomers"). */
export function incomersPhrase(id: string, label: string): string {
  if (id === "general") return "General incomers";
  return `${label.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+Imperial$/, "").trim()}-themed incomers`;
}

/** "Roman-themed explorers"; a bracketed note in the label is dropped ("Hellenistic-themed explorers"). */
export function explorersPhrase(id: string, label: string): string {
  if (id === "general") return "General explorers";
  return `${label.replace(/\s*\(.*?\)\s*/g, " ").trim()}-themed explorers`;
}

/** The feature choices: any, the two sides, then each group. */
export const FEATURES: { id: string; label: string }[] = [
  { id: "any", label: "Any feature" },
  { id: "settlement", label: "Settlement" },
  { id: "landscape", label: "Landscape" },
  ...PLACE_SHAPE_DATA.groups.map((g) => ({ id: g.id, label: g.label })),
];

/** The feature phrase within a sentence: "any feature", "settlement". */
export function featurePhrase(feature: string): string {
  const f = FEATURES.find((x) => x.id === feature) ?? FEATURES[0];
  return f.label.charAt(0).toLowerCase() + f.label.slice(1);
}

export const UNKNOWN_COUNTRY = "unknown country";

/** The biome link's menu (§19.2): "unknown country", then the 11 sentence phrases. */
export const BIOME_CHOICES: { id: string; label: string }[] = [
  { id: "unknown", label: UNKNOWN_COUNTRY },
  ...BIOMES.map((b) => ({ id: b.id, label: b.phrase })),
];

/** "unknown country", or the biome's sentence phrase ("the savannah"). */
export function biomePhrase(biome: string | undefined): string {
  return findBiome(biome)?.phrase ?? UNKNOWN_COUNTRY;
}

/** A colonial sentence as plain text, e.g. "General explorers in wild and unsettled lands across
 * unknown country, naming any feature". */
export function colonialSentenceText(
  part: "new-land" | "established",
  tradition: string,
  context: string,
  biome: string | undefined,
  feature: string,
): string {
  const colonialPart = part === "new-land" ? "2" : "2a";
  const t = COLONIAL_TRADITIONS.find((x) => x.id === tradition) ?? COLONIAL_TRADITIONS[0];
  const contexts = CONTEXT_PHRASES[colonialPart];
  const c = (contexts.find(([id]) => id === context) ?? contexts[0])[1];
  const lead = part === "new-land" ? `${explorersPhrase(t.id, t.label)} in ${c}` : `${incomersPhrase(t.id, t.label)} who are ${c}`;
  return `${lead} across ${biomePhrase(biome)}, naming ${featurePhrase(feature)}`;
}
