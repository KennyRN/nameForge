// The place name wizard's sentences as plain data (Tribal brief §19.2, Land brief §4.2), so they
// can be tested. No Obsidian imports: recipeEditor.ts draws the same wording as links.

import { type Biome, BIOMES, BRITAIN, findBiome, SPACE_BIOMES, TERRAIN_CHOICES } from "./biomes";
import { contextPhrasesFor } from "./colonialWording";
import { COLONIAL_DATA, COLONIAL_TRADITIONS } from "./colonialShapes";
import { PLACE_SHAPE_DATA, PLACE_SHAPE_REGIONS } from "./placeShapes";

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

/**
 * Stellar brief §5.5: the feature choices under a space biome: any, the two sides, then each live group
 * (that scale's space groups, space settlement and the three colonial groups space keeps).
 */
export function featuresForBiome(biome: Biome | undefined): { id: string; label: string }[] {
  if (!biome?.space) return FEATURES;
  const rules = COLONIAL_DATA.space;
  const live = COLONIAL_DATA.groups
    .filter((g) => (g.space ? !g.scale || g.scale === biome.scale : (rules.groups[g.id] ?? 0) > 0 && (!rules.groupScales[g.id] || rules.groupScales[g.id].includes(biome.scale!))))
    .map((g) => ({ id: g.id, label: g.label ?? g.id }));
  return [FEATURES[0], FEATURES[1], FEATURES[2], ...live];
}

/** The feature phrase within a sentence, for a biome's choices. */
export function featurePhraseFor(feature: string, biome?: Biome): string {
  const f = featuresForBiome(biome).find((x) => x.id === feature) ?? FEATURES[0];
  return f.label.charAt(0).toLowerCase() + f.label.slice(1);
}

export const UNKNOWN_COUNTRY = "unknown country";

/** Stellar brief §5.1: the Space heading's biomes, as the biome link offers them. */
export const spaceBiomeChoices = (): { id: string; label: string; title: string }[] => SPACE_BIOMES.map((b) => ({ id: b.id, label: b.phrase, title: b.guide }));

/** Stellar brief §5.10: the tooltip on the Space heading. */
export const SPACE_HEADING_TIP = "Traditions name space as they named new lands: rulers, founders, sponsors, ships and homeland names.";

/** Stellar brief §5.8: the alien life link's choices. */
export const ALIEN_CHOICES = [
  { id: "off", label: "no alien life" },
  { id: "on", label: "alien life" },
];

/** The biome link's built-in choices (Land brief §4.2): the part's default, then Britain (colonial
 * only, since it is organic's default) and the 12 biomes. User packs are added by the editor. */
export function biomeChoices(part: "organic" | "new-land" | "established"): { id: string; label: string }[] {
  const lead = part === "organic" ? [{ id: "unknown", label: "Britain" }] : [{ id: "unknown", label: UNKNOWN_COUNTRY }, { id: BRITAIN.id, label: BRITAIN.phrase }];
  return [...lead, ...BIOMES.map((b) => ({ id: b.id, label: b.phrase }))];
}

/** A biome setting's phrase: the part's default, a built-in's phrase, or a pack's. */
export function biomePhrase(biome: string | undefined, part: "organic" | "new-land" | "established" = "new-land", custom: readonly Biome[] = []): string {
  if (biome?.startsWith("[[")) {
    const name = biome.slice(2, -2);
    const pack = custom.find((b) => b.label === name || b.custom?.path === name);
    return pack?.phrase ?? name;
  }
  const found = findBiome(biome, custom);
  if (found) return found.phrase;
  return part === "organic" ? BRITAIN.phrase : UNKNOWN_COUNTRY;
}

/** "any part", or a terrain's phrase ("the rivers and lakes"); custom terrains from the pack. */
export function terrainPhrase(terrain: string | undefined, custom: readonly Biome[] = []): string {
  const all = [...TERRAIN_CHOICES, ...custom.flatMap((b) => b.customTerrains ?? []), ...SPACE_BIOMES.flatMap((b) => b.customTerrains ?? [])];
  return all.find((t) => t.id === (terrain || "any"))?.phrase ?? "any part";
}

/** Regions that read without "the" ("from Wales", but "from the North"). */
const NO_THE_REGIONS = new Set(["Cornwall", "East Anglia", "Wales"]);
const kebab = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** "all of Britain", "Wales", "the North". */
export function regionPhrase(region: string | undefined): string {
  const r = PLACE_SHAPE_REGIONS.find((x) => x.code === (region ?? "").toUpperCase() || kebab(x.label) === kebab(region ?? ""));
  if (!r) return "all of Britain";
  return NO_THE_REGIONS.has(r.label) ? r.label : `the ${r.label}`;
}

export interface SentenceSettings {
  /** Stellar brief §5.8: alien life under a space biome. */
  aliens?: boolean;
  region?: string;
  tradition?: string;
  context?: string;
  biome?: string;
  terrain?: string;
  feature?: string;
}

/**
 * Land brief §4.2: a wizard sentence as plain text.
 * - Place names: "Any feature from all of Britain, set in any part of Britain"
 * - Exploration: "General explorers in wild and unsettled lands across any part of unknown country, naming any feature"
 * - Expansion: "General incomers who are ruling over the locals across any part of unknown country, naming any feature"
 */
export function wizardSentenceText(part: "organic" | "new-land" | "established", settings: SentenceSettings, custom: readonly Biome[] = []): string {
  const biome = findBiome(settings.biome, custom);
  const space = !!biome?.space && part !== "organic";
  // Stellar brief §5.2: Any terrain under a space biome reads "all of a sector".
  const land = space && (!settings.terrain || settings.terrain === "any") ? `all of ${biomePhrase(settings.biome, part, custom)}` : `${terrainPhrase(settings.terrain, custom)} of ${biomePhrase(settings.biome, part, custom)}`;
  if (part === "organic") {
    const f = FEATURES.find((x) => x.id === settings.feature) ?? FEATURES[0];
    return `${f.label} from ${regionPhrase(settings.region)}, set in ${land}`;
  }
  const colonialPart = part === "new-land" ? "2" : "2a";
  const t = COLONIAL_TRADITIONS.find((x) => x.id === settings.tradition) ?? COLONIAL_TRADITIONS[0];
  const contexts = contextPhrasesFor(colonialPart, space);
  const c = (contexts.find(([id]) => id === settings.context) ?? contexts[0])[1];
  const lead = part === "new-land" ? `${explorersPhrase(t.id, t.label)} in ${c}` : `${incomersPhrase(t.id, t.label)} who are ${c}`;
  const life = space ? `, with ${settings.aliens ? "alien life" : "no alien life"}` : "";
  return `${lead} across ${land}${life}, naming ${space ? featurePhraseFor(settings.feature ?? "any", biome) : featurePhrase(settings.feature ?? "any")}`;
}
