// The calendars and festivals sentence (Time and sky brief §2.1) and the logic both time and sky
// sentences share (§2.3–§2.4): "‹Anglo-Saxon› ‹months› of the ‹medieval› era, in a ‹realistic› world,
// set in ‹their homeland›, starting in ‹their own new year›, ‹of any tone›, with ‹placeholders for›
// gods and people, ‹as one calendar›". Built as segments like the money sentence. No Obsidian imports.

import { type Biome, isSpaceBiome, SPACE_BIOMES } from "../biomes";
import { type GroupPeople, type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { ROUTE_ERAS, routeEraLabel, type RouteEra } from "../routes/engine";
import { fantasticWords } from "../routes/sentence";
import {
  homelandOf,
  isFutureEra,
  isSensitive,
  kindsOffered,
  landKind,
  seasonCycle,
  seasonPhrase,
  seriesOffered,
  TIME_CULTURES,
  TIME_SKY,
  findTimeCulture,
  findTimeKind,
  type CycleBiome,
  type TimeKind,
  type TimeModule,
  type TimeWords,
  timeKindDefaultOf,
} from "./data";

export interface TimeSentenceState {
  culture: string;
  kind: TimeKind;
  era: RouteEra;
  fantastic: boolean;
  /** A biome id or pack path; undefined is their homeland. */
  biome?: string;
  /** "own" (their own new year) or a season key. */
  start: string;
  words: TimeWords;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: boolean;
}

export const DEFAULT_CALENDAR_STATE: TimeSentenceState = {
  culture: "norman-british",
  kind: "month",
  era: "MD",
  fantastic: false,
  start: "own",
  words: "translated",
  tone: "any",
  people: "placeholders",
  series: false,
};
export const DEFAULT_SKY_STATE: TimeSentenceState = { ...DEFAULT_CALENDAR_STATE, kind: "constellation" };

export type TimeField = "culture" | "kind" | "era" | "fantastic" | "biome" | "start" | "words" | "tone" | "people" | "series";

export interface TimeChoice {
  id: string | undefined;
  label: string;
  /** A disabled menu heading shown before this choice (the Space heading). */
  heading?: string;
  title?: string;
  group?: string;
}

export type TimeSegment = string | { field: TimeField; text: string; title: string; choices: TimeChoice[]; current: string | undefined };

export interface TimeSentenceLimits {
  /** Every biome on offer (built-ins and packs), in menu order. */
  biomes: Biome[];
  findBiome: (id: string | undefined) => Biome | undefined;
}

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const WORDS_TEXT: Record<TimeWords, string> = { translated: "in translated names", loanwords: "with familiar loanwords" };

/** §2.3: whether a culture has at least one loan form (so the words link shows). */
export function timeHasLoans(culture: string): boolean {
  return (TIME_SKY.cultureNames[culture]?.festival ?? []).some((r) => !!r.loan);
}

/** The resolved land of a state. */
const biomeOf = (state: TimeSentenceState, limits: TimeSentenceLimits) => (state.biome ? limits.findBiome(state.biome) : undefined);
export const timeLandOf = (state: TimeSentenceState, limits: TimeSentenceLimits) => landKind(biomeOf(state, limits));

/** §2.3: the start link: a series of months, festivals or full moons outside space biomes. */
export function showsTimeStart(state: TimeSentenceState, limits: TimeSentenceLimits): boolean {
  return state.series && ["month", "festival", "moon"].includes(state.kind) && !timeLandOf(state, limits).space;
}
/** §2.3: the words link: festivals, for cultures with a loan form. */
export const showsTimeWords = (state: TimeSentenceState) => state.kind === "festival" && timeHasLoans(state.culture);

/** The seasons of the land in cycle order (the start menu). */
export function startSeasons(state: TimeSentenceState, limits: TimeSentenceLimits): string[] {
  const biome = biomeOf(state, limits);
  const atHome = !state.biome || state.biome === homelandOf(state.culture);
  return (seasonCycle(biome as CycleBiome | undefined, state.culture, atHome) ?? []).map(([s]) => s);
}

export function timeSentence(module: TimeModule, state: TimeSentenceState, limits: TimeSentenceLimits): TimeSegment[] {
  const out: TimeSegment[] = [];
  const culture = findTimeCulture(state.culture) ?? TIME_CULTURES[0];
  out.push({
    field: "culture",
    text: culture.label,
    title: "Naming culture: whose calendar and sky, and whose customs, the names follow",
    choices: TIME_CULTURES.map((c, i) => ({ id: c.key, label: c.label, ...(c.group && c.group !== TIME_CULTURES[i - 1]?.group ? { group: c.group } : {}) })),
    current: culture.key,
  });
  out.push(" ");
  const land = timeLandOf(state, limits);
  const offered = kindsOffered(module, state.culture, state.era, land);
  const kind = offered.find((k) => k.key === state.kind) ?? offered[0];
  out.push({
    field: "kind",
    text: kind.plural,
    title: kind.description,
    choices: offered.map((k) => ({ id: k.key, label: k.menu, title: k.description })),
    current: kind.key,
  });
  out.push(" of the ");
  out.push({
    field: "era",
    text: routeEraLabel(state.era),
    title: "The age: decides which calendars and skies exist",
    choices: ROUTE_ERAS.map((e) => ({ id: e.code, label: e.label })),
    current: state.era,
  });
  out.push(" era, in a ");
  const sensitive = isSensitive(state.culture);
  const worlds = fantasticWords(state.era);
  if (sensitive) out.push(worlds[0]);
  else {
    out.push({
      field: "fantastic",
      text: worlds[state.fantastic ? 1 : 0],
      title: "Open magic and monsters; in the steam age, steampunk",
      choices: [false, true].map((on) => ({ id: on ? "on" : "off", label: worlds[on ? 1 : 0] })),
      current: state.fantastic ? "on" : "off",
    });
  }
  out.push(module === "calendar" ? " world, set in " : " world, seen from ");
  const biome = biomeOf(state, limits);
  out.push({
    field: "biome",
    text: biome ? biome.phrase : "their homeland",
    title: biome?.guide ?? "Their homeland: the culture's own land",
    choices: [
      { id: undefined, label: "Their homeland" },
      ...limits.biomes.map((b) => ({ id: b.custom?.path ?? b.id, label: b.label })),
      ...(isFutureEra(state.era) ? SPACE_BIOMES.filter((b) => state.era === "IS" || b.scale === "Pl" || b.scale === "Sy") : []).map((b, i): TimeChoice => ({ id: b.id, label: b.label, title: b.guide, ...(i === 0 ? { heading: "Space" } : {}) })),
    ],
    current: state.biome,
  });
  if (showsTimeStart(state, limits)) {
    out.push(", starting in ");
    const seasons = startSeasons(state, limits);
    const current = state.start !== "own" && seasons.includes(state.start) ? state.start : "own";
    out.push({
      field: "start",
      text: current === "own" ? "their own new year" : seasonPhrase(current),
      title: "Which season the list starts in. Their own new year starts where the culture's year began (midwinter for the Anglo-Saxons, spring for the Romans).",
      choices: [{ id: "own", label: "Their own new year" }, ...seasons.map((s) => ({ id: s, label: seasonPhrase(s) }))],
      current,
    });
  }
  if (showsTimeWords(state)) {
    out.push(", ");
    out.push({
      field: "words",
      text: WORDS_TEXT[state.words],
      title: "Real festival names are given in English by meaning (Samhain: Summer's End). Loanwords keep the familiar English borrowing where there is one.",
      choices: (["translated", "loanwords"] as TimeWords[]).map((w) => ({ id: w, label: WORDS_TEXT[w] })),
      current: state.words,
    });
  }
  out.push(", ");
  out.push({
    field: "tone",
    text: TONE_PHRASES[state.tone],
    title: "Tone: weights names towards a mood; it never rules any out",
    choices: (["any", ...GROUP_TONES] as GroupToneChoice[]).filter((t) => !sensitive || (t !== "light" && t !== "grim")).map((t) => ({ id: t, label: TONE_PHRASES[t] })),
    current: state.tone,
  });
  out.push(", with ");
  out.push({
    field: "people",
    text: PEOPLE_TEXT[state.people],
    title: "Placeholders like [god], or invented names",
    choices: (["placeholders", "invented"] as GroupPeople[]).map((p) => ({ id: p, label: PEOPLE_TEXT[p] })),
    current: state.people,
  });
  out.push(" gods and people, ");
  const seriesText = TIME_SKY.series[kind.key]?.text;
  const canSeries = seriesOffered(kind.key, state.culture, state.era, land);
  out.push({
    field: "series",
    text: state.series && canSeries ? seriesText : "each one separate",
    title: "A whole set in order. The number of months, days or signs always comes from a real system, named under the batch.",
    choices: [{ id: "off", label: "each one separate" }, ...(canSeries ? [{ id: "on", label: seriesText }] : [])],
    current: state.series && canSeries ? "on" : "off",
  });
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function timeSentenceText(segments: TimeSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.4: a state made consistent: a kind, series, start, words, space biome or tone the culture and era can't have goes back. */
export function normaliseTime(module: TimeModule, state: TimeSentenceState, limits: TimeSentenceLimits): TimeSentenceState {
  const next: TimeSentenceState = { ...state };
  if (!findTimeCulture(next.culture)) next.culture = DEFAULT_CALENDAR_STATE.culture;
  const sensitive = isSensitive(next.culture);
  if (sensitive) {
    next.fantastic = false;
    if (next.tone === "light" || next.tone === "grim") next.tone = "any";
  }
  if (next.biome && !limits.findBiome(next.biome)) next.biome = undefined;
  if (next.biome && !isFutureEra(next.era) && isSpaceBiome(limits.findBiome(next.biome))) next.biome = undefined;
  const land = timeLandOf(next, limits);
  const offered = kindsOffered(module, next.culture, next.era, land);
  if (!offered.some((k) => k.key === next.kind)) next.kind = offered.some((k) => k.key === timeKindDefaultOf(module)) ? timeKindDefaultOf(module) : offered[0].key;
  if (next.series && !seriesOffered(next.kind, next.culture, next.era, land)) next.series = false;
  if (next.start !== "own" && !startSeasons(next, limits).includes(next.start)) next.start = "own";
  if (!showsTimeWords(next)) next.words = "translated";
  return next;
}

/** §2.4: a state after one choice, with the resets that follow from it. */
export function chooseTime(module: TimeModule, state: TimeSentenceState, field: TimeField, id: string | undefined, limits: TimeSentenceLimits): TimeSentenceState {
  const next: TimeSentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? DEFAULT_CALENDAR_STATE.culture;
      break;
    case "kind":
      next.kind = (findTimeKind(id)?.key ?? next.kind) as TimeKind;
      break;
    case "era":
      next.era = ROUTE_ERAS.some((e) => e.code === id) ? (id as RouteEra) : DEFAULT_CALENDAR_STATE.era;
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "biome":
      next.biome = id;
      break;
    case "start":
      next.start = id ?? "own";
      break;
    case "words":
      next.words = id === "loanwords" ? "loanwords" : "translated";
      break;
    case "tone":
      next.tone = (id as GroupToneChoice) ?? "any";
      break;
    case "people":
      next.people = (id as GroupPeople) ?? "placeholders";
      break;
    case "series":
      next.series = id === "on";
      break;
  }
  return normaliseTime(module, next, limits);
}

/** §2.4: the notice for a space biome reset when the era moved away from the future. */
export const timeBiomeResetNotice = (before: TimeSentenceState, after: TimeSentenceState) =>
  before.biome && !after.biome && isFutureEra(before.era) !== isFutureEra(after.era) ? "The space biome was reset to their homeland." : "";

/** §1.2: "{module} · {era} · {culture} · {kind}", then the land, start, loanwords, genre, tone and series. */
export function timeHistoryLabel(module: TimeModule, state: TimeSentenceState, limits: TimeSentenceLimits): string {
  const culture = findTimeCulture(state.culture)?.label ?? "General";
  const kind = findTimeKind(state.kind);
  const biome = biomeOf(state, limits);
  return [
    module === "calendar" ? "calendars and festivals" : "sky lore",
    routeEraLabel(state.era),
    culture,
    kind?.plural ?? state.kind,
    ...(biome ? [biome.label] : []),
    ...(module === "calendar" && showsTimeStart(state, limits) && state.start !== "own" ? [`from ${seasonPhrase(state.start)}`] : []),
    ...(showsTimeWords(state) && state.words === "loanwords" ? ["loanwords"] : []),
    ...(!isSensitive(state.culture) && state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(state.series && seriesOffered(state.kind, state.culture, state.era, landKind(biome)) ? [TIME_SKY.series[state.kind].text] : []),
  ].join(" · ");
}

export function calendarSentence(state: TimeSentenceState, limits: TimeSentenceLimits): TimeSegment[] {
  return timeSentence("calendar", state, limits);
}
