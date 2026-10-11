// The settlement kit sentence (docs/settlement-kit-brief.md §2): "A ‹Norman & British› ‹town› of the
// ‹medieval› era, in a ‹realistic› world, ‹across all of Britain›, ‹on a river›, ‹of any tone›, giving
// ‹the whole settlement› in ‹standard› detail, with ‹placeholders for› people and places".
// Built as segments like the route, street, inn and building sentences. No Obsidian imports.

import { type GroupPeople, type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { PLACE_SHAPE_REGIONS } from "../placeShapes";
import { findRouteCulture, ROUTE_CULTURES, ROUTE_ERAS, routeEraLabel, type RouteEra } from "../routes/engine";
import { fantasticWords, routeRegionText, showsRegion } from "../routes/sentence";
import { sizeLabel } from "../streets/engine";
import { KIT_CONTENTS, KIT_DETAILS, KIT_POSITIONS, KIT_SIZES, positionText, type KitContents, type KitDetail, type KitPosition, type KitSize } from "./kit";

export interface KitSentenceState {
  culture: string;
  era: RouteEra;
  fantastic: boolean;
  region?: string;
  size: KitSize;
  position: KitPosition;
  tone: GroupToneChoice;
  contents: KitContents;
  detail: KitDetail;
  people: GroupPeople;
}

export const DEFAULT_KIT_STATE: KitSentenceState = {
  culture: "norman-british",
  era: "MD",
  fantastic: false,
  size: "town",
  position: "inland",
  tone: "any",
  contents: "whole",
  detail: "standard",
  people: "placeholders",
};

export type KitField = "culture" | "era" | "fantastic" | "region" | "size" | "position" | "tone" | "contents" | "detail" | "people";

export interface KitChoice {
  id: string | undefined;
  label: string;
  title?: string;
  group?: string;
}

export type KitSegment = string | { field: KitField; text: string; title: string; choices: KitChoice[]; current: string | undefined };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };

export function kitSentence(state: KitSentenceState): KitSegment[] {
  const out: KitSegment[] = [];
  const culture = findRouteCulture(state.culture) ?? ROUTE_CULTURES[0];
  // §2.2: "A" becomes "An" before a vowel.
  out.push(/^[aeiou]/i.test(culture.label) ? "an " : "a ");
  out.push({
    field: "culture",
    text: culture.label,
    title: "Naming culture: whose customs the settlement follows",
    choices: ROUTE_CULTURES.map((c, i) => ({ id: c.key, label: c.label, ...(c.group && c.group !== ROUTE_CULTURES[i - 1]?.group ? { group: c.group } : {}) })),
    current: culture.key,
  });
  out.push(" ");
  out.push({
    field: "size",
    text: sizeLabel(state.size, state.era),
    title: "How big the settlement is",
    choices: KIT_SIZES.map((s) => ({ id: s, label: sizeLabel(s, state.era) })),
    current: state.size,
  });
  out.push(" of the ");
  out.push({
    field: "era",
    text: routeEraLabel(state.era),
    title: "The age: decides which roads, buildings, houses and ships exist",
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
  out.push(" world, ");
  if (showsRegion(state)) {
    out.push({
      field: "region",
      text: routeRegionText(state.region),
      title: "Weights the names towards a region's customs",
      choices: [
        { id: undefined, label: routeRegionText(undefined) },
        ...PLACE_SHAPE_REGIONS.map((r) => ({ id: r.code, label: routeRegionText(r.code), title: r.counties })),
      ],
      current: state.region,
    });
    out.push(", ");
  }
  out.push({
    field: "position",
    text: positionText(state.position, state.era),
    title: "Where it stands: decides harbours, bridges, ships and roadside inns",
    choices: KIT_POSITIONS.map((p) => ({ id: p.key, label: positionText(p.key, state.era) })),
    current: state.position,
  });
  out.push(", ");
  out.push({
    field: "tone",
    text: TONE_PHRASES[state.tone],
    title: "Tone: weights names towards a mood; it never rules any out",
    choices: (["any", ...GROUP_TONES] as GroupToneChoice[]).map((t) => ({ id: t, label: TONE_PHRASES[t] })),
    current: state.tone,
  });
  out.push(", giving ");
  out.push({
    field: "contents",
    text: KIT_CONTENTS[state.contents],
    title: "Everything, just the places, or just the people and groups",
    choices: (Object.keys(KIT_CONTENTS) as KitContents[]).map((c) => ({ id: c, label: KIT_CONTENTS[c] })),
    current: state.contents,
  });
  out.push(" in ");
  out.push({
    field: "detail",
    text: state.detail,
    title: "How many names in each section",
    choices: KIT_DETAILS.map((d) => ({ id: d, label: d })),
    current: state.detail,
  });
  out.push(" detail, with ");
  out.push({
    field: "people",
    text: PEOPLE_TEXT[state.people],
    title: "Placeholders like [founder], or invented names",
    choices: (["placeholders", "invented"] as GroupPeople[]).map((p) => ({ id: p, label: PEOPLE_TEXT[p] })),
    current: state.people,
  });
  out.push(" people and places");
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function kitSentenceText(segments: KitSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2: a state after one choice, with the resets that follow from it. */
export function chooseKit(state: KitSentenceState, field: KitField, id: string | undefined): KitSentenceState {
  const next: KitSentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? DEFAULT_KIT_STATE.culture;
      break;
    case "era":
      next.era = ROUTE_ERAS.some((e) => e.code === id) ? (id as RouteEra) : DEFAULT_KIT_STATE.era;
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "region":
      next.region = id;
      break;
    case "size":
      next.size = KIT_SIZES.includes(id as KitSize) ? (id as KitSize) : DEFAULT_KIT_STATE.size;
      break;
    case "position":
      next.position = KIT_POSITIONS.some((p) => p.key === id) ? (id as KitPosition) : DEFAULT_KIT_STATE.position;
      break;
    case "tone":
      next.tone = (id as GroupToneChoice) ?? "any";
      break;
    case "contents":
      next.contents = id && id in KIT_CONTENTS ? (id as KitContents) : "whole";
      break;
    case "detail":
      next.detail = KIT_DETAILS.includes(id as KitDetail) ? (id as KitDetail) : "standard";
      break;
    case "people":
      next.people = (id as GroupPeople) ?? "placeholders";
      break;
  }
  if (!showsRegion(next)) next.region = undefined;
  return next;
}

/** §1.2: "settlement kit · {settlement name} · {size} · {era label} · {culture label}". */
export function kitHistoryLabel(town: string, state: Pick<KitSentenceState, "size" | "era" | "culture">): string {
  return ["settlement kit", town, sizeLabel(state.size, state.era), routeEraLabel(state.era), findRouteCulture(state.culture)?.label ?? "General"].join(" · ");
}
