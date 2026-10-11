// The events and eras sentence (Events brief §2): "‹Norman & British› ‹events of any kind› of the
// ‹medieval› era, in a ‹realistic› world, on ‹a realm's› scale, ‹of any tone›, with ‹placeholders for›
// people and places, ‹each one separate›". Built as segments like the building sentence. No Obsidian imports.

import { type GroupPeople, type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { findRouteCulture, ROUTE_CULTURES, ROUTE_ERAS, routeEraLabel, type RouteEra } from "../routes/engine";
import { fantasticWords } from "../routes/sentence";
import { EVENT_ANY, EVENT_KINDS, EVENT_SCALES, eventKindsOffered, type EventKind, type EventScale } from "./engine";

export interface EventSentenceState {
  culture: string;
  /** A kind key; undefined is Any. */
  kind?: EventKind;
  era: RouteEra;
  fantastic: boolean;
  scale: EventScale;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: boolean;
}

export const DEFAULT_EVENT_STATE: EventSentenceState = {
  culture: "norman-british",
  era: "MD",
  fantastic: false,
  scale: "realm",
  tone: "any",
  people: "placeholders",
  series: false,
};

export type EventField = "culture" | "kind" | "era" | "fantastic" | "scale" | "tone" | "people" | "series";

export interface EventChoice {
  id: string | undefined;
  label: string;
  title?: string;
  group?: string;
}

export type EventSegment = string | { field: EventField; text: string; title: string; choices: EventChoice[]; current: string | undefined };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const SERIES_TEXT = { off: "each one separate", on: "as one history" };
const scaleText = (key: EventScale) => EVENT_SCALES.find((s) => s.key === key)!.text;

export function eventSentence(state: EventSentenceState): EventSegment[] {
  const out: EventSegment[] = [];
  const culture = findRouteCulture(state.culture) ?? ROUTE_CULTURES[0];
  out.push({
    field: "culture",
    text: culture.label,
    title: "Naming culture: whose customs the history follows",
    choices: ROUTE_CULTURES.map((c, i) => ({ id: c.key, label: c.label, ...(c.group && c.group !== ROUTE_CULTURES[i - 1]?.group ? { group: c.group } : {}) })),
    current: culture.key,
  });
  out.push(" ");
  const offered = eventKindsOffered(state.era);
  const kind = offered.find((k) => k.key === state.kind);
  out.push({
    field: "kind",
    text: kind ? kind.plural : EVENT_ANY,
    title: kind ? kind.description : EVENT_ANY.charAt(0).toUpperCase() + EVENT_ANY.slice(1),
    choices: [{ id: undefined, label: "Any" }, ...offered.map((k) => ({ id: k.key, label: k.menu, title: k.description }))],
    current: kind?.key,
  });
  out.push(" of the ");
  out.push({
    field: "era",
    text: routeEraLabel(state.era),
    title: "The age: decides which events and eras exist",
    choices: ROUTE_ERAS.map((e) => ({ id: e.code, label: e.label })),
    current: state.era,
  });
  out.push(" era, in a ");
  const words = fantasticWords(state.era);
  out.push({
    field: "fantastic",
    text: words[state.fantastic ? 1 : 0],
    title: "Open magic and monsters; in the steam age, steampunk",
    choices: [false, true].map((on) => ({ id: on ? "on" : "off", label: words[on ? 1 : 0] })),
    current: state.fantastic ? "on" : "off",
  });
  out.push(" world, on ");
  out.push({
    field: "scale",
    text: scaleText(state.scale),
    title: "How far the event reached: a town, a realm, or the whole world",
    choices: EVENT_SCALES.map((s) => ({ id: s.key, label: s.text })),
    current: state.scale,
  });
  out.push(" scale, ");
  out.push({
    field: "tone",
    text: TONE_PHRASES[state.tone],
    title: "Tone: weights names towards a mood; it never rules any out",
    choices: (["any", ...GROUP_TONES] as GroupToneChoice[]).map((t) => ({ id: t, label: TONE_PHRASES[t] })),
    current: state.tone,
  });
  out.push(", with ");
  out.push({
    field: "people",
    text: PEOPLE_TEXT[state.people],
    title: "Placeholders like [leader], or invented names",
    choices: (["placeholders", "invented"] as GroupPeople[]).map((p) => ({ id: p, label: PEOPLE_TEXT[p] })),
    current: state.people,
  });
  out.push(" people and places, ");
  out.push({
    field: "series",
    text: SERIES_TEXT[state.series ? "on" : "off"],
    title: "A short chronicle in order, with eras framing the events",
    choices: [
      { id: "off", label: SERIES_TEXT.off },
      { id: "on", label: SERIES_TEXT.on },
    ],
    current: state.series ? "on" : "off",
  });
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function eventSentenceText(segments: EventSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.3: a state after one choice, with the resets that follow from it. */
export function chooseEvent(state: EventSentenceState, field: EventField, id: string | undefined): EventSentenceState {
  const next: EventSentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? DEFAULT_EVENT_STATE.culture;
      break;
    case "kind":
      next.kind = id as EventKind | undefined;
      break;
    case "era":
      next.era = ROUTE_ERAS.some((e) => e.code === id) ? (id as RouteEra) : DEFAULT_EVENT_STATE.era;
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "scale":
      next.scale = EVENT_SCALES.some((s) => s.key === id) ? (id as EventScale) : "realm";
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
  if (next.kind && !eventKindsOffered(next.era).some((k) => k.key === next.kind)) next.kind = undefined;
  return next;
}

/** §1.2: "events and eras · {era} · {culture}", then kind, scale, steampunk or fantastic, tone and one history. */
export function eventHistoryLabel(state: EventSentenceState): string {
  const culture = findRouteCulture(state.culture)?.label ?? "General";
  const kind = EVENT_KINDS.find((k) => k.key === state.kind);
  return [
    "events and eras",
    routeEraLabel(state.era),
    culture,
    ...(kind ? [kind.plural] : []),
    ...(state.scale !== "realm" ? [state.scale] : []),
    ...(state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(state.series ? ["one history"] : []),
  ].join(" · ");
}
