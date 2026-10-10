// The ships and spacecraft sentences (Ships brief §2): "‹General›-themed ‹ships and boats of any kind›
// with ‹any› technology, for a ‹fantasy› world ‹of historic or low fantasy›, in ‹no particular› style,
// ‹of any tone›, ‹without prefixes›, with ‹placeholders for› people and places, ‹each one separate›".
// Built as segments like the group sentence. No Obsidian imports.

import { type GroupGenre, type GroupPeople, type GroupToneChoice, GROUP_TONES, groupSetting, SETTING_PHRASES, TONE_PHRASES } from "../groups/engine";
import { FANTASTIC_TEXT, GENRE_TEXT } from "../groups/sentence";
import {
  availableFunctions,
  availableStyles,
  functionAny,
  prefixSetting,
  techChoices,
  techLabel,
  VESSEL_CULTURES,
  type VesselModule,
} from "./engine";

export interface VesselSentenceState {
  culture: string;
  /** A function key; undefined is Any. */
  function?: string;
  technology: string;
  genre: GroupGenre;
  fantastic: boolean;
  /** A style key, or "none". */
  style: string;
  tone: GroupToneChoice;
  prefixes: boolean;
  people: GroupPeople;
  series: boolean;
}

export function defaultVesselState(module: VesselModule): VesselSentenceState {
  return {
    culture: "general",
    technology: "any",
    genre: module === "spacecraft" ? "scifi" : "fantasy",
    fantastic: false,
    style: "none",
    tone: "any",
    prefixes: false,
    people: "placeholders",
    series: false,
  };
}

export type VesselField = "culture" | "function" | "technology" | "genre" | "fantastic" | "style" | "tone" | "prefixes" | "people" | "series";

export interface VesselChoice {
  id: string | undefined;
  label: string;
  /** A menu heading shown before this choice (§3.1's groups). */
  group?: string;
}

export type VesselSegment = string | { field: VesselField; text: string; title: string; choices: VesselChoice[]; current: string | undefined };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const SERIES_TEXT = { off: "each one separate", on: "as one class" };
const PREFIX_TEXT = { off: "without prefixes", on: "with prefixes" };
const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");

export function vesselSetting(state: Pick<VesselSentenceState, "genre" | "fantastic">) {
  return groupSetting(state.genre, state.genre === "scifi" ? false : state.fantastic);
}

/** §2.2: whether the prefix link shows (MR, MF and SF). */
export const showsPrefixes = (state: VesselSentenceState) => prefixSetting(vesselSetting(state));

export function vesselSentence(state: VesselSentenceState, module: VesselModule): VesselSegment[] {
  const out: VesselSegment[] = [];
  const culture = VESSEL_CULTURES.find((c) => c.key === state.culture) ?? VESSEL_CULTURES[0];
  const setting = vesselSetting(state);
  out.push({
    field: "culture",
    text: culture.label,
    title: "Naming culture: what its people name vessels after",
    choices: VESSEL_CULTURES.map((c, i) => ({ id: c.key, label: c.label, ...(c.group && c.group !== VESSEL_CULTURES[i - 1]?.group ? { group: c.group } : {}) })),
    current: culture.key,
  });
  out.push("-themed ");
  const fns = availableFunctions(module, culture.key, state.technology, setting);
  const fn = fns.find((f) => f.key === state.function);
  out.push({
    field: "function",
    text: fn ? fn.plural : functionAny(module),
    title: fn ? fn.description : functionAny(module),
    choices: [{ id: undefined, label: "Any" }, ...fns.map((f) => ({ id: f.key, label: f.menu }))],
    current: fn?.key,
  });
  out.push(" with ");
  out.push({
    field: "technology",
    text: state.technology === "any" ? "any" : techLabel(module, state.technology),
    title: "What the vessel is: adds its own words; any culture can have any technology",
    choices: [{ id: "any", label: "any" }, ...techChoices(module, setting).map((c) => ({ id: c, label: techLabel(module, c) }))],
    current: state.technology,
  });
  out.push(" technology, for a ");
  const genres: GroupGenre[] = module === "spacecraft" ? ["modern", "scifi"] : ["fantasy", "modern", "scifi"];
  out.push({
    field: "genre",
    text: GENRE_TEXT[state.genre],
    title: "Genre: the kind of world",
    choices: genres.map((g) => ({ id: g, label: GENRE_TEXT[g] })),
    current: state.genre,
  });
  out.push(" world");
  if (state.genre !== "scifi") {
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
  out.push(", in ");
  const styles = availableStyles(module, setting);
  const style = styles.find((s) => s.key === state.style);
  out.push({
    field: "style",
    text: style ? `${article(style.label)} ${style.label}` : "no particular",
    title: style ? style.description : "Style: genre flavour",
    choices: [{ id: "none", label: "no particular" }, ...styles.map((s) => ({ id: s.key, label: s.label }))],
    current: style?.key ?? "none",
  });
  out.push(" style, ");
  out.push({
    field: "tone",
    text: TONE_PHRASES[state.tone],
    title: "Tone: weights names towards a mood; it never rules any out",
    choices: (["any", ...GROUP_TONES] as GroupToneChoice[]).map((t) => ({ id: t, label: TONE_PHRASES[t] })),
    current: state.tone,
  });
  if (showsPrefixes(state)) {
    out.push(", ");
    out.push({
      field: "prefixes",
      text: PREFIX_TEXT[state.prefixes ? "on" : "off"],
      title: "Prefixes such as HMS or SS, where the culture and period used them",
      choices: [
        { id: "off", label: PREFIX_TEXT.off },
        { id: "on", label: PREFIX_TEXT.on },
      ],
      current: state.prefixes ? "on" : "off",
    });
  }
  out.push(", with ");
  out.push({
    field: "people",
    text: PEOPLE_TEXT[state.people],
    title: "Placeholders like [admiral], or invented names",
    choices: (["placeholders", "invented"] as GroupPeople[]).map((p) => ({ id: p, label: PEOPLE_TEXT[p] })),
    current: state.people,
  });
  out.push(" people and places, ");
  // §2.2: the class link shows only with a function; the text still ends "each one separate" (§16.8).
  if (fn) {
    out.push({
      field: "series",
      text: SERIES_TEXT[state.series ? "on" : "off"],
      title: "A class: one shape, sharing a word, an owner or a number sequence",
      choices: [
        { id: "off", label: SERIES_TEXT.off },
        { id: "on", label: SERIES_TEXT.on },
      ],
      current: state.series ? "on" : "off",
    });
  } else out.push(SERIES_TEXT.off);
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function vesselSentenceText(segments: VesselSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.3: a state after one choice, with the resets that follow from it. */
export function chooseVessel(state: VesselSentenceState, field: VesselField, id: string | undefined, module: VesselModule): VesselSentenceState {
  const next: VesselSentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? "general";
      break;
    case "function":
      next.function = id;
      break;
    case "technology":
      next.technology = id ?? "any";
      break;
    case "genre":
      next.genre = (id as GroupGenre) ?? "fantasy";
      if (module === "spacecraft" && next.genre === "modern") next.technology = "S1";
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "style":
      next.style = id ?? "none";
      break;
    case "tone":
      next.tone = (id as GroupToneChoice) ?? "any";
      break;
    case "prefixes":
      next.prefixes = id === "on";
      break;
    case "people":
      next.people = (id as GroupPeople) ?? "placeholders";
      break;
    case "series":
      next.series = id === "on";
      break;
  }
  const setting = vesselSetting(next);
  if (!techChoices(module, setting).includes(next.technology) && next.technology !== "any") next.technology = "any";
  if (next.function && !availableFunctions(module, next.culture, next.technology, setting).some((f) => f.key === next.function)) next.function = undefined;
  if (!next.function) next.series = false;
  if (next.style !== "none" && !availableStyles(module, setting).some((s) => s.key === next.style)) next.style = "none";
  return next;
}

/** §1.2: "{module} · {setting} · {culture} · {technology}", then style, tone and class. */
export function vesselHistory(module: VesselModule, state: VesselSentenceState, label: string): string {
  const setting = vesselSetting(state);
  const culture = VESSEL_CULTURES.find((c) => c.key === state.culture)?.label ?? "General";
  const style = availableStyles(module, setting).find((s) => s.key === state.style);
  return [
    label,
    SETTING_PHRASES[setting],
    culture,
    state.technology === "any" ? "any technology" : techLabel(module, state.technology),
    ...(style ? [style.label] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(state.series && state.function ? ["class"] : []),
  ].join(" · ");
}
