// The streets and districts sentence (Streets brief §2): "‹Norman & British› ‹streets and lanes› of
// the ‹medieval› era, in a ‹realistic› world, ‹across all of Britain›, for a ‹town›, ‹with dialect
// words as variants›, ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›".
// Built as segments like the route sentence. No Obsidian imports.

import { regionPhrase } from "../colonialSentence";
import { type GroupPeople, type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { PLACE_SHAPE_REGIONS } from "../placeShapes";
import { findRouteCulture, ROUTE_CULTURES, ROUTE_ERAS, routeEraLabel, type RouteEra } from "../routes/engine";
import { fantasticWords, routeRegionText, showsRegion } from "../routes/sentence";
import { functionsForSize, kindsForSize, sizeLabel, STREET_ANY, STREET_FUNCTIONS, STREET_KINDS, STREET_SIZES, type StreetDialect, type StreetKind, type StreetSize } from "./engine";

export interface StreetSentenceState {
  culture: string;
  /** A kind key; undefined is Any. */
  kind?: StreetKind;
  /** A district function key; undefined is any. */
  function?: string;
  era: RouteEra;
  fantastic: boolean;
  region?: string;
  size: StreetSize;
  dialect: StreetDialect;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: boolean;
}

export const DEFAULT_STREET_STATE: StreetSentenceState = {
  culture: "norman-british",
  era: "MD",
  fantastic: false,
  size: "town",
  dialect: "variants",
  tone: "any",
  people: "placeholders",
  series: false,
};

export type StreetField = "culture" | "kind" | "function" | "era" | "fantastic" | "region" | "size" | "dialect" | "tone" | "people" | "series";

export interface StreetChoice {
  id: string | undefined;
  label: string;
  title?: string;
  group?: string;
}

export type StreetSegment = string | { field: StreetField; text: string; title: string; choices: StreetChoice[]; current: string | undefined };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const SERIES_TEXT = { off: "each one separate", on: "as one town" };
export const DIALECT_TEXT: Record<StreetDialect, string> = {
  plain: "with plain words only",
  variants: "with dialect words as variants",
  instead: "with dialect words instead",
};
const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");

/** §2.2: the kind segment's text ("districts" before its function link). */
const kindText = (kind: StreetKind | undefined) => (!kind ? STREET_ANY : kind === "districts" ? "districts" : STREET_KINDS.find((k) => k.key === kind)!.plural);

export function streetSentence(state: StreetSentenceState): StreetSegment[] {
  const out: StreetSegment[] = [];
  const culture = findRouteCulture(state.culture) ?? ROUTE_CULTURES[0];
  out.push({
    field: "culture",
    text: culture.label,
    title: "Naming culture: whose customs the streets follow",
    choices: ROUTE_CULTURES.map((c, i) => ({ id: c.key, label: c.label, ...(c.group && c.group !== ROUTE_CULTURES[i - 1]?.group ? { group: c.group } : {}) })),
    current: culture.key,
  });
  out.push(" ");
  const kinds = kindsForSize(state.size);
  const kind = kinds.find((k) => k.key === state.kind);
  out.push({
    field: "kind",
    text: kindText(kind?.key),
    title: kind ? kind.description : STREET_ANY.charAt(0).toUpperCase() + STREET_ANY.slice(1),
    choices: [{ id: undefined, label: "Any" }, ...kinds.map((k) => ({ id: k.key, label: k.menu, title: k.description }))],
    current: kind?.key,
  });
  if (kind?.key === "districts") {
    out.push(" ");
    const fns = functionsForSize(state.size);
    const fn = fns.find((f) => f.key === state.function);
    out.push({
      field: "function",
      text: fn ? `for ${fn.menu.toLowerCase()}` : "of any function",
      title: "What the quarter is for",
      choices: [{ id: undefined, label: "of any function" }, ...fns.map((f) => ({ id: f.key, label: f.menu }))],
      current: fn?.key,
    });
  }
  out.push(" of the ");
  out.push({
    field: "era",
    text: routeEraLabel(state.era),
    title: "The age: decides which streets, squares and districts exist",
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
  const size = sizeLabel(state.size, state.era);
  out.push(`for ${article(size)} `);
  out.push({
    field: "size",
    text: size,
    title: "How big the settlement is: decides which streets, squares and districts it has",
    choices: STREET_SIZES.map((s) => ({ id: s.key, label: sizeLabel(s.key, state.era) })),
    current: state.size,
  });
  out.push(", ");
  if (showsRegion(state)) {
    out.push({
      field: "dialect",
      text: DIALECT_TEXT[state.dialect],
      title: "Regional words such as wynd, chare or twitten, beside or instead of the plain word",
      choices: (["plain", "variants", "instead"] as StreetDialect[]).map((d) => ({ id: d, label: DIALECT_TEXT[d] })),
      current: state.dialect,
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
    title: "One town's streets: a main street first, then no repeats",
    choices: [
      { id: "off", label: SERIES_TEXT.off },
      { id: "on", label: SERIES_TEXT.on },
    ],
    current: state.series ? "on" : "off",
  });
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function streetSentenceText(segments: StreetSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.3: a state after one choice, with the resets that follow from it. */
export function chooseStreet(state: StreetSentenceState, field: StreetField, id: string | undefined): StreetSentenceState {
  const next: StreetSentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? DEFAULT_STREET_STATE.culture;
      break;
    case "kind":
      next.kind = id as StreetKind | undefined;
      break;
    case "function":
      next.function = id;
      break;
    case "era":
      next.era = ROUTE_ERAS.some((e) => e.code === id) ? (id as RouteEra) : DEFAULT_STREET_STATE.era;
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "region":
      next.region = id;
      break;
    case "size":
      next.size = STREET_SIZES.some((s) => s.key === id) ? (id as StreetSize) : DEFAULT_STREET_STATE.size;
      break;
    case "dialect":
      next.dialect = (id as StreetDialect) ?? DEFAULT_STREET_STATE.dialect;
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
  // §2.3: a kind the size lacks resets to Any; a function only with districts, and only one the size offers.
  if (next.kind && !kindsForSize(next.size).some((k) => k.key === next.kind)) next.kind = undefined;
  if (next.kind !== "districts" || !functionsForSize(next.size).some((f) => f.key === next.function)) next.function = undefined;
  if (!showsRegion(next)) next.region = undefined;
  return next;
}

/** §1.2: "streets and districts · {era} · {culture}", then kind, size, region, steampunk or fantastic, tone and one town. */
export function streetHistoryLabel(state: StreetSentenceState): string {
  const culture = findRouteCulture(state.culture)?.label ?? "General";
  const kind = STREET_KINDS.find((k) => k.key === state.kind);
  return [
    "streets and districts",
    routeEraLabel(state.era),
    culture,
    ...(kind ? [kind.plural] : []),
    sizeLabel(state.size, state.era),
    ...(state.region && showsRegion(state) ? [regionPhrase(state.region)] : []),
    ...(state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(state.series ? ["one town"] : []),
  ].join(" · ");
}

/** §14: the function menu's key list (presets). */
export const STREET_FUNCTION_KEYS = STREET_FUNCTIONS.map((f) => f.key);
