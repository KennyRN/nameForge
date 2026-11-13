// The ships and spacecraft sentences (Ships brief §2): "‹General›-themed ‹ships and boats of any kind›
// with ‹any› technology, of the ‹pre-industrial› era, in a ‹historic or low fantasy› world, in ‹no
// particular› style, ‹of any tone›, ‹without prefixes›, with ‹placeholders for› people and places, ‹each
// one separate›". The culture, era and world links are the lens clause's (one sentence brief §4, §7.4);
// technology and style stay the module's own. Built as segments like the group sentence. No Obsidian imports.

import { type GroupGenre, type GroupPeople, type GroupToneChoice, GROUP_TONES, groupSetting, SETTING_PHRASES, TONE_PHRASES } from "../groups/engine";
import { asSegment, chooseLens, eraWorldSegments, type LensedSegment } from "../lensSentence";
import { lensClause } from "../lensView";
import { registerRoster } from "../lensRosters";
import {
  AIR_LAND,
  availableFunctions,
  availableStyles,
  functionAny,
  isAirLand,
  prefixSetting,
  techChoices,
  techLabel,
  VESSEL_CULTURES,
  type VesselModule,
  type VesselNaming,
} from "./engine";

registerRoster("vessel", VESSEL_CULTURES);

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
  /** Aircraft and land brief §2.2: individual craft, or types and models (the new modules only). */
  naming?: VesselNaming;
}

export function defaultVesselState(module: VesselModule): VesselSentenceState {
  return {
    // Aircraft and land brief §2.2: aircraft default to General, land vehicles to Norman & British, in a modern world.
    culture: module === "landVehicles" ? "norman-british" : "general",
    technology: "any",
    genre: module === "spacecraft" ? "scifi" : isAirLand(module) ? "modern" : "fantasy",
    fantastic: false,
    style: "none",
    tone: "any",
    prefixes: false,
    people: "placeholders",
    series: false,
    ...(isAirLand(module) ? { naming: "craft" } : {}),
  };
}

export type VesselField = "naming" | "culture" | "function" | "technology" | "era" | "genre" | "fantastic" | "style" | "tone" | "prefixes" | "people" | "series";

export interface VesselChoice {
  id: string | undefined;
  label: string;
  /** A menu heading shown before this choice (§3.1's groups). */
  group?: string;
  heading?: string;
}

export type VesselSegment = string | { field: VesselField; text: string; title: string; choices: VesselChoice[]; current: string | undefined; fixed?: boolean };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const SERIES_TEXT = { off: "each one separate", on: "as one class" };
const PREFIX_TEXT = { off: "without prefixes", on: "with prefixes" };
const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");

export function vesselSetting(state: Pick<VesselSentenceState, "genre" | "fantastic">) {
  return groupSetting(state.genre, state.genre === "scifi" ? false : state.fantastic);
}

/** §2.2: whether the prefix link shows (MR, MF and SF). */
export const showsPrefixes = (state: VesselSentenceState) => prefixSetting(vesselSetting(state));

/** Aircraft and land brief §2.2: the codes link shows only in MR, MF and SF, and only naming each craft. */
export const showsCodes = (state: VesselSentenceState, module: VesselModule) => isAirLand(module) && showsPrefixes(state) && (state.naming ?? "craft") === "craft";

/** Aircraft and land brief §5.1: at AF the private function reads "sky yachts". */
const airLandFunction = (f: { menu: string; plural: string; afMenu?: string; afPlural?: string }, technology: string) =>
  technology === "AF" && f.afMenu ? { menu: f.afMenu, plural: f.afPlural ?? f.plural } : { menu: f.menu, plural: f.plural };

export function vesselSentence(state: VesselSentenceState, module: VesselModule): VesselSegment[] {
  const out: VesselSegment[] = [];
  const culture = VESSEL_CULTURES.find((c) => c.key === state.culture) ?? VESSEL_CULTURES[0];
  const setting = vesselSetting(state);
  const lens = lensClause(module, state, { cultureTitle: "Naming culture: what its people name vessels after" });
  out.push(asSegment(lens.culture!, "culture"));
  out.push("-themed ");
  const airLand = isAirLand(module);
  const naming = state.naming ?? "craft";
  const fns = availableFunctions(module, culture.key, state.technology, setting, naming);
  const fn = fns.find((f) => f.key === state.function);
  out.push({
    field: "function",
    text: fn ? (airLand ? airLandFunction(fn, state.technology).plural : fn.plural) : functionAny(module),
    title: fn ? fn.description : functionAny(module),
    choices: [{ id: undefined, label: "Any" }, ...fns.map((f) => ({ id: f.key, label: airLand ? airLandFunction(f, state.technology).menu : f.menu }))],
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
  out.push(" technology,");
  // Aircraft and land brief §2.1: a modern world reads "realistic" (not "of the real world") from the lens clause.
  out.push(...(eraWorldSegments(lens, "era", "fantastic") as (string | LensedSegment<"era" | "fantastic">)[]));
  if (airLand) {
    // Aircraft and land brief §2.1: "naming ‹each craft›".
    out.push(", naming ");
    out.push({
      field: "naming",
      text: AIR_LAND.naming[module][naming],
      title: "Name single craft (Lucky Kate, Ashby Castle), or the types and models they belong to (Kestrel, the Castle class).",
      choices: (["craft", "types"] as VesselNaming[]).map((n) => ({ id: n, label: AIR_LAND.naming[module][n] })),
      current: naming,
    });
  }
  out.push(", in ");
  const styles = availableStyles(module, setting, state.technology);
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
  if (airLand ? showsCodes(state, module) : showsPrefixes(state)) {
    // Aircraft and land brief §2.2: the prefix link becomes the codes link, with its own words.
    const words = airLand ? AIR_LAND.codes.words[module] : PREFIX_TEXT;
    out.push(", ");
    out.push({
      field: "prefixes",
      text: words[state.prefixes ? "on" : "off"],
      title: airLand ? "Registrations, serials and running numbers where the culture and period used them." : "Prefixes such as HMS or SS, where the culture and period used them",
      choices: [
        { id: "off", label: words.off },
        { id: "on", label: words.on },
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
  // §2.2: the class link shows only with a function (types: always, as one family); the text still ends "each one separate" (§16.8).
  if (fn || naming === "types") {
    const words = naming === "types" ? { off: SERIES_TEXT.off, on: "as one family" } : SERIES_TEXT;
    out.push({
      field: "series",
      text: words[state.series ? "on" : "off"],
      title: naming === "types" ? "A family: one maker's line of types, all on one pattern, with no word twice" : "A class: one shape, sharing a word, an owner or a number sequence",
      choices: [
        { id: "off", label: words.off },
        { id: "on", label: words.on },
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
  let next: VesselSentenceState = { ...state };
  switch (field) {
    case "culture":
      next = chooseLens(module, next, "culture", id ?? "general");
      break;
    case "function":
      next.function = id;
      break;
    case "technology":
      next.technology = id ?? "any";
      break;
    case "era":
      next = chooseLens(module, next, "era", id);
      if (module === "spacecraft" && next.genre === "modern") next.technology = "S1";
      break;
    case "genre":
      next.genre = (id as GroupGenre) ?? "fantasy";
      if (module === "spacecraft" && next.genre === "modern") next.technology = "S1";
      break;
    case "fantastic":
      next = chooseLens(module, next, "fantastic", id);
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
    case "naming":
      // Aircraft and land brief §2.3: a change of naming resets the series; a function not offered for it resets to Any.
      next.naming = id === "types" ? "types" : "craft";
      next.series = false;
      break;
  }
  const setting = vesselSetting(next);
  if (!techChoices(module, setting).includes(next.technology) && next.technology !== "any") next.technology = "any";
  if (next.function && !availableFunctions(module, next.culture, next.technology, setting, next.naming ?? "craft").some((f) => f.key === next.function)) next.function = undefined;
  if (!next.function && (next.naming ?? "craft") !== "types") next.series = false;
  if (next.style !== "none" && !availableStyles(module, setting, next.technology).some((s) => s.key === next.style)) next.style = "none";
  return next;
}

/** §1.2: "{module} · {setting} · {culture} · {technology}", then style, tone and class. */
export function vesselHistory(module: VesselModule, state: VesselSentenceState, label: string): string {
  const setting = vesselSetting(state);
  const culture = VESSEL_CULTURES.find((c) => c.key === state.culture)?.label ?? "General";
  const style = availableStyles(module, setting, state.technology).find((s) => s.key === state.style);
  const airLand = isAirLand(module);
  const types = airLand && state.naming === "types";
  return [
    label,
    SETTING_PHRASES[setting],
    culture,
    state.technology === "any" ? "any technology" : techLabel(module, state.technology),
    ...(style ? [style.label] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    // Aircraft and land brief §1.2: types, codes, then class or family.
    ...(types ? ["types"] : []),
    ...(airLand && state.prefixes && showsCodes(state, module) ? ["codes"] : []),
    ...(types ? (state.series ? ["family"] : []) : state.series && state.function ? ["class"] : []),
  ].join(" · ");
}
