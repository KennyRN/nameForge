// The realms sentence (Realms brief §2): "‹General›-themed ‹realms of any kind› of the ‹medieval› era,
// for a ‹fantasy› world ‹of historic or low fantasy›, named for ‹anything›, in ‹their homeland› ‹of any
// terrain›, ‹of any tone›, as ‹plain› names, giving ‹official names›, with ‹placeholders for› people and
// places". Built as segments like the group sentence. No Obsidian imports.

import { availableTerrains, type Biome, TERRAIN_CHOICES } from "../biomes";
import { type GroupGenre, type GroupPeople, type GroupToneChoice, GROUP_TONES, groupSetting, SETTING_PHRASES, TONE_PHRASES } from "../groups/engine";
import { FANTASTIC_TEXT, GENRE_TEXT } from "../groups/sentence";
import { namedForOffered, REALM_CHARACTERS, REALM_CULTURES, REALM_ERAS, REALM_NAMED_FOR, type RealmLength, type RealmNamedFor, type RealmOutput } from "./engine";

export interface RealmSentenceState {
  culture: string;
  /** A character key; undefined is Any. */
  character?: string;
  era: string;
  genre: GroupGenre;
  fantastic: boolean;
  namedFor: RealmNamedFor;
  /** A biome id or pack path; undefined is their homeland. */
  biome?: string;
  terrain: string;
  tone: GroupToneChoice;
  length: RealmLength;
  output: RealmOutput;
  people: GroupPeople;
}

export const DEFAULT_REALM_STATE: RealmSentenceState = {
  culture: "general",
  era: "medieval",
  genre: "fantasy",
  fantastic: false,
  namedFor: "anything",
  terrain: "any",
  tone: "any",
  length: "plain",
  output: "official",
  people: "placeholders",
};

export type RealmField = "culture" | "character" | "era" | "genre" | "fantastic" | "namedFor" | "biome" | "terrain" | "tone" | "length" | "output" | "people";

export interface RealmChoice {
  id: string | undefined;
  label: string;
}

export type RealmSegment = string | { field: RealmField; text: string; title: string; choices: RealmChoice[]; current: string | undefined };

export interface RealmSentenceLimits {
  /** Every biome on offer (built-ins and packs), in menu order. */
  biomes: Biome[];
  findBiome: (id: string | undefined) => Biome | undefined;
}

const OUTPUT_TEXT: Record<RealmOutput, string> = { official: "official names", short: "short names", both: "official and short names" };
const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };

/** §2.2: the biome and terrain links show only for anything and their land. */
export const showsLand = (state: RealmSentenceState) => state.namedFor === "anything" || state.namedFor === "land";

export function realmSentence(state: RealmSentenceState, limits: RealmSentenceLimits): RealmSegment[] {
  const out: RealmSegment[] = [];
  const culture = REALM_CULTURES.find((c) => c.key === state.culture) ?? REALM_CULTURES[0];
  out.push({
    field: "culture",
    text: culture.label,
    title: "Which customs and forms of government",
    choices: REALM_CULTURES.map((c) => ({ id: c.key, label: c.label })),
    current: culture.key,
  });
  out.push("-themed ");
  const character = REALM_CHARACTERS.find((c) => c.key === state.character);
  out.push({
    field: "character",
    text: character ? character.plural : "realms of any kind",
    title: character ? character.description : "Realms of any kind",
    choices: [{ id: undefined, label: "Any" }, ...REALM_CHARACTERS.map((c) => ({ id: c.key, label: c.menu }))],
    current: character?.key,
  });
  out.push(" of the ");
  const era = REALM_ERAS.find((e) => e.key === state.era) ?? REALM_ERAS[1];
  out.push({
    field: "era",
    text: era.label,
    title: "Which forms of government are common: any culture can have any era",
    choices: REALM_ERAS.map((e) => ({ id: e.key, label: e.label })),
    current: era.key,
  });
  out.push(" era, for a ");
  out.push({
    field: "genre",
    text: GENRE_TEXT[state.genre],
    title: "Genre: the kind of world",
    choices: (["fantasy", "modern", "scifi"] as GroupGenre[]).map((g) => ({ id: g, label: GENRE_TEXT[g] })),
    current: state.genre,
  });
  out.push(" world");
  if (state.genre !== "scifi") {
    const setting = groupSetting(state.genre, state.fantastic);
    const phrases = FANTASTIC_TEXT[state.genre];
    out.push(" ");
    out.push({
      field: "fantastic",
      text: phrases[state.fantastic ? 1 : 0],
      title: SETTING_PHRASES[setting].charAt(0).toUpperCase() + SETTING_PHRASES[setting].slice(1),
      choices: [false, true].map((on) => ({ id: on ? "on" : "off", label: phrases[on ? 1 : 0] })),
      current: state.fantastic ? "on" : "off",
    });
  }
  out.push(", named for ");
  const nf = REALM_NAMED_FOR.find((n) => n.key === state.namedFor) ?? REALM_NAMED_FOR[0];
  out.push({
    field: "namedFor",
    text: nf.label,
    title: "Where the state's identity comes from",
    choices: REALM_NAMED_FOR.filter((n) => namedForOffered(n.key, state.era)).map((n) => ({ id: n.key, label: n.label })),
    current: nf.key,
  });
  if (showsLand(state)) {
    out.push(", in ");
    const biome = limits.findBiome(state.biome);
    out.push({
      field: "biome",
      text: biome ? biome.phrase : "their homeland",
      title: biome?.guide ?? "Their homeland: the culture's own land",
      choices: [{ id: undefined, label: "Their homeland" }, ...limits.biomes.map((b) => ({ id: b.custom?.path ?? b.id, label: b.label }))],
      current: state.biome,
    });
    out.push(" ");
    const terrains = biome ? availableTerrains(biome) : TERRAIN_CHOICES.filter((t) => t.id !== "any");
    const terrainText = (id: string) => `of ${id === "any" ? "any terrain" : ([...terrains, ...TERRAIN_CHOICES].find((t) => t.id === id)?.label.toLowerCase() ?? id)}`;
    out.push({
      field: "terrain",
      text: terrainText(state.terrain || "any"),
      title: "Terrain: the kind of land they hold",
      choices: [{ id: "any", label: terrainText("any") }, ...terrains.map((t) => ({ id: t.id, label: terrainText(t.id) }))],
      current: state.terrain || "any",
    });
  }
  out.push(", ");
  out.push({
    field: "tone",
    text: TONE_PHRASES[state.tone],
    title: "Tone: weights names towards a mood; it never rules any out",
    choices: (["any", ...GROUP_TONES] as GroupToneChoice[]).map((t) => ({ id: t, label: TONE_PHRASES[t] })),
    current: state.tone,
  });
  out.push(", as ");
  out.push({
    field: "length",
    text: state.length,
    title: "Plain names, or ceremonial ones with honorifics",
    choices: (["plain", "ceremonial"] as RealmLength[]).map((l) => ({ id: l, label: l })),
    current: state.length,
  });
  out.push(" names, giving ");
  out.push({
    field: "output",
    text: OUTPUT_TEXT[state.output],
    title: "The full official name, the everyday short name, or both",
    choices: (["official", "short", "both"] as RealmOutput[]).map((o) => ({ id: o, label: OUTPUT_TEXT[o] })),
    current: state.output,
  });
  out.push(", with ");
  out.push({
    field: "people",
    text: PEOPLE_TEXT[state.people],
    title: "Placeholders like [place], or invented names",
    choices: (["placeholders", "invented"] as GroupPeople[]).map((p) => ({ id: p, label: PEOPLE_TEXT[p] })),
    current: state.people,
  });
  out.push(" people and places");
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function realmSentenceText(segments: RealmSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.3: a state after one choice; leaving the future eras resets "the stars". */
export function chooseRealm(state: RealmSentenceState, field: RealmField, id: string | undefined, findBiome: (id: string | undefined) => Biome | undefined): RealmSentenceState {
  const next: RealmSentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? "general";
      break;
    case "character":
      next.character = id;
      break;
    case "era":
      next.era = id ?? "medieval";
      if (next.namedFor === "stars" && !namedForOffered("stars", next.era)) next.namedFor = "anything";
      break;
    case "genre":
      next.genre = (id as GroupGenre) ?? "fantasy";
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "namedFor":
      next.namedFor = (id as RealmNamedFor) ?? "anything";
      break;
    case "biome": {
      const biome = findBiome(id);
      const keep = !biome || state.terrain === "any" || availableTerrains(biome).some((t) => t.id === state.terrain);
      next.biome = id;
      next.terrain = keep ? state.terrain : "any";
      break;
    }
    case "terrain":
      next.terrain = id ?? "any";
      break;
    case "tone":
      next.tone = (id as GroupToneChoice) ?? "any";
      break;
    case "length":
      next.length = (id as RealmLength) ?? "plain";
      break;
    case "output":
      next.output = (id as RealmOutput) ?? "official";
      break;
    case "people":
      next.people = (id as GroupPeople) ?? "placeholders";
      break;
  }
  return next;
}
