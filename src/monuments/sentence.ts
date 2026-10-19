// The monuments and statues sentence (Monuments brief §2): "‹Norman & British› ‹monuments and statues of
// any kind› of the ‹medieval› era, in a ‹realistic› world, ‹across all of Britain›, ‹anywhere›, ‹of any
// tone›, with ‹placeholders for› people and places, ‹on their own›, ‹each one separate›". Built as
// segments like the buildings sentence. No Obsidian imports.

import { regionPhrase } from "../colonialSentence";
import { type GroupPeople, type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { INN_SETTINGS, type InnSetting } from "../inns/engine";
import { PLACE_SHAPE_REGIONS } from "../placeShapes";
import { findRouteCulture, ROUTE_CULTURES, ROUTE_ERAS, routeEraLabel, type RouteEra } from "../routes/engine";
import { fantasticWords, routeRegionText, showsRegion } from "../routes/sentence";
import { MONUMENT_ANY, MONUMENT_KINDS, monumentKindsOffered, type MonumentKind } from "./engine";
import { MONUMENT_NAMES_HISTORY_NAME } from "../sections";

export interface MonumentSentenceState {
  culture: string;
  /** A kind key; undefined is Any. */
  kind?: MonumentKind;
  era: RouteEra;
  fantastic: boolean;
  region?: string;
  setting: InnSetting;
  tone: GroupToneChoice;
  people: GroupPeople;
  /** §9: add what's named after each monument. */
  nearby: boolean;
  series: boolean;
}

export const DEFAULT_MONUMENT_STATE: MonumentSentenceState = {
  culture: "norman-british",
  era: "MD",
  fantastic: false,
  setting: "anywhere",
  tone: "any",
  people: "placeholders",
  nearby: false,
  series: false,
};

export type MonumentField = "culture" | "kind" | "era" | "fantastic" | "region" | "setting" | "tone" | "people" | "nearby" | "series";

export interface MonumentChoice {
  id: string | undefined;
  label: string;
  title?: string;
  group?: string;
}

export type MonumentSegment = string | { field: MonumentField; text: string; title: string; choices: MonumentChoice[]; current: string | undefined };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const NEARBY_TEXT = { off: "on their own", on: "with what's named after them" };
const SERIES_TEXT = { off: "each one separate", on: "as one town" };
const settingText = (key: InnSetting) => INN_SETTINGS.find((s) => s.key === key)!.text;

export function monumentSentence(state: MonumentSentenceState): MonumentSegment[] {
  const out: MonumentSegment[] = [];
  const culture = findRouteCulture(state.culture) ?? ROUTE_CULTURES[0];
  out.push({
    field: "culture",
    text: culture.label,
    title: "Naming culture: whose customs the monuments follow",
    choices: ROUTE_CULTURES.map((c, i) => ({ id: c.key, label: c.label, ...(c.group && c.group !== ROUTE_CULTURES[i - 1]?.group ? { group: c.group } : {}) })),
    current: culture.key,
  });
  out.push(" ");
  const offered = monumentKindsOffered(state.era);
  const kind = offered.find((k) => k.key === state.kind);
  out.push({
    field: "kind",
    text: kind ? kind.plural : MONUMENT_ANY,
    title: kind ? kind.description : MONUMENT_ANY.charAt(0).toUpperCase() + MONUMENT_ANY.slice(1),
    choices: [{ id: undefined, label: "Any" }, ...offered.map((k) => ({ id: k.key, label: k.menu, title: k.description }))],
    current: kind?.key,
  });
  out.push(" of the ");
  out.push({
    field: "era",
    text: routeEraLabel(state.era),
    title: "The age: decides which kinds of monument exist",
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
    field: "setting",
    text: settingText(state.setting),
    title: "Where the monuments stand: weights town, country, harbour or roadside kinds",
    choices: INN_SETTINGS.map((s) => ({ id: s.key, label: s.text })),
    current: state.setting,
  });
  out.push(", ");
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
    title: "Placeholders like [founder] and [hero], or invented names",
    choices: (["placeholders", "invented"] as GroupPeople[]).map((p) => ({ id: p, label: PEOPLE_TEXT[p] })),
    current: state.people,
  });
  out.push(" people and places, ");
  out.push({
    field: "nearby",
    text: NEARBY_TEXT[state.nearby ? "on" : "off"],
    title: "What's named after each monument: two nearby names, such as a roundabout, a street, a district or an inn",
    choices: [
      { id: "off", label: NEARBY_TEXT.off },
      { id: "on", label: NEARBY_TEXT.on },
    ],
    current: state.nearby ? "on" : "off",
  });
  out.push(", ");
  out.push({
    field: "series",
    text: SERIES_TEXT[state.series ? "on" : "off"],
    title: "One town's monuments: one of each kind, one town and one founder, no honouree or qualifier twice",
    choices: [
      { id: "off", label: SERIES_TEXT.off },
      { id: "on", label: SERIES_TEXT.on },
    ],
    current: state.series ? "on" : "off",
  });
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function monumentSentenceText(segments: MonumentSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.3: a state after one choice, with the resets that follow from it. */
export function chooseMonument(state: MonumentSentenceState, field: MonumentField, id: string | undefined): MonumentSentenceState {
  const next: MonumentSentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? DEFAULT_MONUMENT_STATE.culture;
      break;
    case "kind":
      next.kind = id as MonumentKind | undefined;
      break;
    case "era":
      next.era = ROUTE_ERAS.some((e) => e.code === id) ? (id as RouteEra) : DEFAULT_MONUMENT_STATE.era;
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "region":
      next.region = id;
      break;
    case "setting":
      next.setting = INN_SETTINGS.some((s) => s.key === id) ? (id as InnSetting) : "anywhere";
      break;
    case "tone":
      next.tone = (id as GroupToneChoice) ?? "any";
      break;
    case "people":
      next.people = (id as GroupPeople) ?? "placeholders";
      break;
    case "nearby":
      next.nearby = id === "on";
      break;
    case "series":
      next.series = id === "on";
      break;
  }
  // A kind the era lacks resets to Any; region resets away from the British cultures.
  if (next.kind && !monumentKindsOffered(next.era).some((k) => k.key === next.kind)) next.kind = undefined;
  if (!showsRegion(next)) next.region = undefined;
  return next;
}

/** §14.4: "monuments and statues · {era} · {culture}", then kind, setting, region, steampunk or fantastic, tone,
 * "one town" and "named after". */
export function monumentHistoryLabel(state: MonumentSentenceState): string {
  const culture = findRouteCulture(state.culture)?.label ?? "General";
  const kind = MONUMENT_KINDS.find((k) => k.key === state.kind);
  return [
    MONUMENT_NAMES_HISTORY_NAME,
    routeEraLabel(state.era),
    culture,
    ...(kind ? [kind.plural] : []),
    ...(state.setting !== "anywhere" ? [settingText(state.setting)] : []),
    ...(state.region && showsRegion(state) ? [regionPhrase(state.region)] : []),
    ...(state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(state.series ? ["one town"] : []),
    ...(state.nearby ? ["named after"] : []),
  ].join(" · ");
}
