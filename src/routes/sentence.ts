// The route names sentence (Route names brief §2): "‹Norman & British› ‹routes of any kind› of the
// ‹medieval› era, in a ‹realistic› world, ‹across all of Britain›, ‹of any tone›, with ‹placeholders
// for› people and places, ‹each one separate›". Built as segments like the group sentence.
// No Obsidian imports.

import { regionPhrase } from "../colonialSentence";
import { type GroupPeople, type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { PLACE_SHAPE_REGIONS } from "../placeShapes";
import { scaleInfo, scaleLabel, scalePhrase, scalesFor, validScale, type ScaleChoice } from "../space/scale";
import {
  BRITISH_CULTURES,
  findRouteCulture,
  findRouteKind,
  kindsOffered,
  ROUTE_ANY,
  ROUTE_CULTURES,
  ROUTE_ERAS,
  ROUTE_FTL,
  routeEraLabel,
  showsFtl,
  showsScale,
  type RouteEra,
  type RouteFtl,
} from "./engine";

export interface RouteSentenceState {
  culture: string;
  /** A kind key; undefined is Any. */
  kind?: string;
  era: RouteEra;
  fantastic: boolean;
  /** A place-shape region code; undefined is all of Britain. */
  region?: string;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: boolean;
  /** Stellar brief §6.1: the scale of space lanes; absent means any. */
  scale?: ScaleChoice;
  /** Stellar brief §6.2: the faster-than-light travel; absent means any. */
  ftl?: RouteFtl;
}

export const DEFAULT_ROUTE_STATE: RouteSentenceState = {
  culture: "norman-british",
  era: "MD",
  fantastic: false,
  tone: "any",
  people: "placeholders",
  series: false,
};

export type RouteField = "scale" | "ftl" | "culture" | "kind" | "era" | "fantastic" | "region" | "tone" | "people" | "series";

export interface RouteChoice {
  id: string | undefined;
  label: string;
  title?: string;
  /** A menu heading shown before this choice (§4.1's groups). */
  group?: string;
}

export type RouteSegment = string | { field: RouteField; text: string; title: string; choices: RouteChoice[]; current: string | undefined };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const SERIES_TEXT = { off: "each one separate", on: "as one network" };

/** §2.2: the fantastic link's words: steampunk in the steam age. */
export const fantasticWords = (era: RouteEra): [string, string] => ["realistic", era === "ST" ? "steampunk" : "fantastic"];

/** §2.2: the region link shows for the three British cultures only. */
export const showsRegion = (state: Pick<RouteSentenceState, "culture">) => BRITISH_CULTURES.includes(state.culture);

/** §2.2: "across all of Britain", or "in the North". */
export const routeRegionText = (region: string | undefined) => (region ? `in ${regionPhrase(region)}` : "across all of Britain");

export function routeSentence(state: RouteSentenceState): RouteSegment[] {
  const out: RouteSegment[] = [];
  const culture = findRouteCulture(state.culture) ?? ROUTE_CULTURES[0];
  out.push({
    field: "culture",
    text: culture.label,
    title: "Naming culture: whose customs the routes follow",
    choices: ROUTE_CULTURES.map((c, i) => ({ id: c.key, label: c.label, ...(c.group && c.group !== ROUTE_CULTURES[i - 1]?.group ? { group: c.group } : {}) })),
    current: culture.key,
  });
  out.push(" ");
  const offered = kindsOffered(state.era, state.fantastic);
  const kind = offered.find((k) => k.key === state.kind);
  out.push({
    field: "kind",
    text: kind ? kind.plural : ROUTE_ANY,
    title: kind ? kind.description : ROUTE_ANY.charAt(0).toUpperCase() + ROUTE_ANY.slice(1),
    choices: [{ id: undefined, label: "Any" }, ...offered.map((k) => ({ id: k.key, label: k.menu, title: k.description }))],
    current: kind?.key,
  });
  // Stellar brief §6.1: space lanes are drawn at a scale.
  if (showsScale(state.era, state.kind)) {
    const scale = validScale(state.scale, state.era === "NF" || state.era === "IS" ? state.era : undefined);
    out.push(" across ");
    out.push({
      field: "scale",
      text: scalePhrase(scale),
      title: scaleInfo(scale).tooltip,
      choices: scalesFor(state.era === "NF" || state.era === "IS" ? state.era : undefined).map((c) => ({ id: c, label: scaleInfo(c).label })),
      current: scale,
    });
  }
  out.push(" of the ");
  out.push({
    field: "era",
    text: routeEraLabel(state.era),
    title: "The age: decides which kinds of route exist",
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
  // Stellar brief §6.2: faster-than-light travel, in the interstellar era.
  if (showsFtl(state.era, state.kind, state.scale ?? "any")) {
    const ftl = ROUTE_FTL.find((f) => f.id === (state.ftl ?? "any")) ?? ROUTE_FTL[0];
    out.push({
      field: "ftl",
      text: ftl.text,
      title: "Which faster-than-light travel the lanes allow; sub-light scales have none",
      choices: ROUTE_FTL.map((f) => ({ id: f.id, label: f.text })),
      current: ftl.id,
    });
    out.push(", ");
  }
  if (showsRegion(state)) {
    out.push({
      field: "region",
      text: routeRegionText(state.region),
      title: "Weights the routes towards a region's customs",
      choices: [
        { id: undefined, label: routeRegionText(undefined) },
        ...PLACE_SHAPE_REGIONS.map((r) => ({ id: r.code, label: routeRegionText(r.code), title: r.counties })),
      ],
      current: state.region,
    });
    out.push(", ");
  }
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
    title: "Placeholders like [place], or invented names",
    choices: (["placeholders", "invented"] as GroupPeople[]).map((p) => ({ id: p, label: PEOPLE_TEXT[p] })),
    current: state.people,
  });
  out.push(" people and places, ");
  out.push({
    field: "series",
    text: SERIES_TEXT[state.series ? "on" : "off"],
    title: "A network: roads out of one place in each direction, or to different places",
    choices: [
      { id: "off", label: SERIES_TEXT.off },
      { id: "on", label: SERIES_TEXT.on },
    ],
    current: state.series ? "on" : "off",
  });
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function routeSentenceText(segments: RouteSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.3: a state after one choice, with the resets that follow from it. */
export function chooseRoute(state: RouteSentenceState, field: RouteField, id: string | undefined): RouteSentenceState {
  const next: RouteSentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? DEFAULT_ROUTE_STATE.culture;
      break;
    case "kind":
      next.kind = id;
      break;
    case "era":
      next.era = ROUTE_ERAS.some((e) => e.code === id) ? (id as RouteEra) : DEFAULT_ROUTE_STATE.era;
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "region":
      next.region = id;
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
    case "scale":
      next.scale = (id as ScaleChoice) ?? "any";
      break;
    case "ftl":
      next.ftl = (id as RouteFtl) ?? "any";
      break;
  }
  // Stellar brief §6.1: a scale the era lacks resets to any; §6.2: FTL resets away from where it shows.
  if (next.scale && next.scale !== "any") next.scale = validScale(next.scale, next.era === "NF" || next.era === "IS" ? next.era : undefined);
  // §2.3: a kind not offered in the era resets to Any; region resets away from the British cultures.
  if (next.kind && !kindsOffered(next.era, next.fantastic).some((k) => k.key === next.kind)) next.kind = undefined;
  if (!showsRegion(next)) next.region = undefined;
  if (next.ftl && next.ftl !== "any" && !showsFtl(next.era, next.kind, next.scale ?? "any")) next.ftl = "any";
  return next;
}

/** §1.2: "route names · {era} · {culture}", then region, kind, steampunk or fantastic, tone and network. */
export function routeHistoryLabel(state: RouteSentenceState): string {
  const culture = findRouteCulture(state.culture)?.label ?? "General";
  const kind = findRouteKind(state.kind);
  return [
    "route names",
    routeEraLabel(state.era),
    culture,
    ...(state.region && showsRegion(state) ? [regionPhrase(state.region)] : []),
    ...(kind ? [kind.plural] : []),
    ...(state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(state.series ? ["network"] : []),
    ...(showsScale(state.era, state.kind) && state.scale && state.scale !== "any" ? [scaleLabel(state.scale).toLowerCase()] : []),
    ...(showsFtl(state.era, state.kind, state.scale ?? "any") && state.ftl && state.ftl !== "any" ? [ROUTE_FTL.find((f) => f.id === state.ftl)!.text] : []),
  ].join(" · ");
}
