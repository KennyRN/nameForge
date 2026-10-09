// The tribal names sentence (Tribal brief §18, Presets brief §5.1): "‹Polynesian›-themed ‹kin
// groups› in ‹their original› environment ‹in any terrain› using ‹plain› names ‹given to or used
// by them›, ‹no insults›". Built as segments so the module, the wizard's page 4 and preset
// descriptions all read the same. No Obsidian imports.

import { availableTerrains, type Biome, biomeInline, TERRAIN_CHOICES } from "../biomes";
import { findTradition, homelandSummary, TRIBAL_DATA, TRIBAL_GROUP_TYPES, TRIBAL_PERSPECTIVES, TRIBAL_REGISTERS, TRIBAL_TRADITIONS } from "./engine";

export interface TribalSentenceState {
  /** A tradition key, or "auto" in an organic recipe slot. */
  tradition: string;
  groupType?: string;
  /** A biome id or pack path; undefined is the default (their original, or the recipe's land). */
  biome?: string;
  terrain: string;
  register: string;
  perspective?: string;
  hostile?: boolean;
}

export type TribalField = "tradition" | "groupType" | "biome" | "terrain" | "register" | "perspective" | "hostile";

export interface TribalChoice {
  id: string | undefined;
  label: string;
}

export type TribalSegment = string | { field: TribalField; text: string; title: string; choices: TribalChoice[]; current: string | undefined };

export interface TribalSentenceLimits {
  /** Every biome on offer (built-ins and packs), in menu order. */
  biomes: Biome[];
  /** Looks a biome setting up (an id or a pack path). */
  findBiome: (id: string | undefined) => Biome | undefined;
  /** The default biome's phrase: "their original", or "the recipe's" in a slot. */
  defaultBiome?: string;
  /** Extra tradition choices before the traditions ("auto" in an organic slot). */
  extraTraditions?: TribalChoice[];
  /** Group types and registers a slot can use; all when absent. */
  groupTypes?: string[];
  registers?: string[];
  /** Whether the insults clause shows (never in a slot). */
  hostile?: boolean;
}

/** Terrain phrases; a pack's own terrains read "in salt pans". */
const TERRAIN_PHRASES: Record<string, string> = {
  any: "in any terrain",
  plains: "on the plains",
  hills: "in hilly terrain",
  mountains: "in mountainous terrain",
  forest: "in a forest",
  coast: "on the coast",
  rivers: "by rivers and lakes",
  wetland: "in wetlands",
  islands: "on islands",
};

/** The sentence's ending, one phrase per perspective. */
const PERSPECTIVE_PHRASES: Record<string, string> = {
  any: "given to or used by them",
  self: "used by them as their self-name",
  neighbour: "given to them by their neighbours",
  geographical: "given to them for where they live",
  dynastic: "used by them for their line of descent",
  ceremonial: "used by them as a ceremonial title",
  later: "given to them by later writers and officials",
  imposed: "imposed on them by outsiders",
};

const perspectivePhrase = (id: string | undefined) => PERSPECTIVE_PHRASES[id ?? "any"] ?? TRIBAL_DATA.perspectiveLabels[id!] ?? id ?? "";

/** The sentence as segments: plain text and clickable choices. */
export function tribalSentence(state: TribalSentenceState, limits: TribalSentenceLimits): TribalSegment[] {
  const out: TribalSegment[] = [];
  const extra = limits.extraTraditions ?? [];
  const tradition = findTradition(state.tradition);
  out.push({
    field: "tradition",
    text: tradition?.label ?? extra.find((t) => t.id === state.tradition)?.label ?? state.tradition,
    title: tradition?.drawsOn ?? "The tradition follows the recipe's region",
    choices: [...extra, ...TRIBAL_TRADITIONS.map((t) => ({ id: t.key, label: t.label }))],
    current: state.tradition,
  });
  out.push("-themed ");
  const groupTypes = TRIBAL_GROUP_TYPES.filter((g) => !limits.groupTypes || limits.groupTypes.includes(g.key));
  const group = groupTypes.find((g) => g.key === state.groupType);
  out.push({
    field: "groupType",
    text: group ? group.label.toLowerCase() : "groups of any kind",
    title: "Group type: what kind of group is being named",
    choices: [{ id: undefined, label: "Any group type" }, ...groupTypes.map((g) => ({ id: g.key, label: g.label }))],
    current: group?.key,
  });
  out.push(" in ");
  const biome = limits.findBiome(state.biome);
  const inline = biome && biomeInline(biome);
  const fallback = limits.defaultBiome ?? "their original";
  out.push({
    field: "biome",
    text: inline ? `${/^[aeiou]/i.test(inline) ? "an" : "a"} ${inline}` : fallback,
    title: biome?.guide ?? (tradition ? homelandSummary(tradition.key) : "Biome"),
    choices: [
      { id: undefined, label: fallback.charAt(0).toUpperCase() + fallback.slice(1) },
      ...limits.biomes.map((b) => ({ id: b.custom?.path ?? b.id, label: b.label })),
    ],
    current: state.biome,
  });
  out.push(" environment ");
  const terrains = biome ? availableTerrains(biome) : TERRAIN_CHOICES.filter((t) => t.id !== "any");
  const terrainText = (id: string) =>
    TERRAIN_PHRASES[id] ?? `in ${[...terrains, ...TERRAIN_CHOICES].find((t) => t.id === id)?.label.toLowerCase() ?? "any terrain"}`;
  out.push({
    field: "terrain",
    text: terrainText(state.terrain || "any"),
    title: "Terrain: the kind of land they live in",
    choices: [{ id: "any", label: terrainText("any") }, ...terrains.map((t) => ({ id: t.id, label: terrainText(t.id) }))],
    current: state.terrain || "any",
  });
  out.push(" using ");
  const registers = TRIBAL_REGISTERS.filter((r) => !limits.registers || limits.registers.includes(r));
  const register = registers.includes(state.register as (typeof registers)[number]) ? state.register : registers[0];
  out.push({
    field: "register",
    text: register,
    title: TRIBAL_DATA.registerLabels[register as (typeof registers)[number]] ?? register,
    choices: registers.map((r) => ({ id: r, label: TRIBAL_DATA.registerLabels[r] })),
    current: register,
  });
  out.push(" names ");
  out.push({
    field: "perspective",
    text: perspectivePhrase(state.perspective),
    title: "Perspective: who uses the name",
    choices: [undefined, ...TRIBAL_PERSPECTIVES].map((p) => ({ id: p, label: perspectivePhrase(p) })),
    current: state.perspective,
  });
  if (limits.hostile) {
    out.push(", ");
    out.push({
      field: "hostile",
      text: state.hostile ? "insults and all" : "no insults",
      title: "Hostile names: insults one people used for another",
      choices: [
        { id: undefined, label: "no insults" },
        { id: "hostile", label: "insults and all" },
      ],
      current: state.hostile ? "hostile" : undefined,
    });
  }
  return out;
}

/** The sentence as plain text, for a preset's description (Presets brief §8.2). */
export function tribalSentenceText(segments: TribalSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** A state after one choice; a biome without the current terrain resets it to Any (Land brief §2.7). */
export function chooseTribal(state: TribalSentenceState, field: TribalField, id: string | undefined, findBiome: (id: string | undefined) => Biome | undefined): TribalSentenceState {
  switch (field) {
    case "tradition":
      return { ...state, tradition: id ?? "general" };
    case "groupType":
      return { ...state, groupType: id };
    case "biome": {
      const next = findBiome(id);
      const keep = !next || state.terrain === "any" || availableTerrains(next).some((t) => t.id === state.terrain);
      return { ...state, biome: id, terrain: keep ? state.terrain : "any" };
    }
    case "terrain":
      return { ...state, terrain: id ?? "any" };
    case "register":
      return { ...state, register: id ?? "plain" };
    case "perspective":
      return { ...state, perspective: id };
    case "hostile":
      return { ...state, hostile: id === "hostile" };
  }
}
