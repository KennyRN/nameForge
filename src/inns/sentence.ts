// The inns and taverns sentence (Inns brief §2): "‹Norman & British› ‹houses of any kind› of the
// ‹medieval› era, in a ‹realistic› world, ‹across all of Britain›, ‹anywhere›, ‹as signs or with a
// house word›, ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›".
// Built as segments like the route and street sentences. No Obsidian imports.

import { regionPhrase } from "../colonialSentence";
import { type GroupPeople, type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { PLACE_SHAPE_REGIONS } from "../placeShapes";
import { findRouteCulture, ROUTE_CULTURES, ROUTE_ERAS, routeEraLabel, type RouteEra } from "../routes/engine";
import { fantasticWords, routeRegionText, showsRegion } from "../routes/sentence";
import { hasSignTradition, INN_ANY, INN_FORMS, INN_KINDS, INN_SETTINGS, innKindsOffered, type InnForm, type InnKind, type InnSetting } from "./engine";

export interface InnSentenceState {
  culture: string;
  /** A kind key; undefined is Any. */
  kind?: InnKind;
  era: RouteEra;
  fantastic: boolean;
  region?: string;
  setting: InnSetting;
  form: InnForm;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: boolean;
}

export const DEFAULT_INN_STATE: InnSentenceState = {
  culture: "norman-british",
  era: "MD",
  fantastic: false,
  setting: "anywhere",
  form: "either",
  tone: "any",
  people: "placeholders",
  series: false,
};

export type InnField = "culture" | "kind" | "era" | "fantastic" | "region" | "setting" | "form" | "tone" | "people" | "series";

export interface InnChoice {
  id: string | undefined;
  label: string;
  title?: string;
  group?: string;
}

export type InnSegment = string | { field: InnField; text: string; title: string; choices: InnChoice[]; current: string | undefined };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const SERIES_TEXT = { off: "each one separate", on: "as one town" };
const settingText = (key: InnSetting) => INN_SETTINGS.find((s) => s.key === key)!.text;

/** §2.2: the form link shows for cultures with an English sign tradition. */
export const showsForm = (state: Pick<InnSentenceState, "culture">) => hasSignTradition(state.culture);

export function innSentence(state: InnSentenceState): InnSegment[] {
  const out: InnSegment[] = [];
  const culture = findRouteCulture(state.culture) ?? ROUTE_CULTURES[0];
  out.push({
    field: "culture",
    text: culture.label,
    title: "Naming culture: whose customs the houses follow",
    choices: ROUTE_CULTURES.map((c, i) => ({ id: c.key, label: c.label, ...(c.group && c.group !== ROUTE_CULTURES[i - 1]?.group ? { group: c.group } : {}) })),
    current: culture.key,
  });
  out.push(" ");
  const offered = innKindsOffered(state.era);
  const kind = offered.find((k) => k.key === state.kind);
  out.push({
    field: "kind",
    text: kind ? kind.plural : INN_ANY,
    title: kind ? kind.description : INN_ANY.charAt(0).toUpperCase() + INN_ANY.slice(1),
    choices: [{ id: undefined, label: "Any" }, ...offered.map((k) => ({ id: k.key, label: k.menu, title: k.description }))],
    current: kind?.key,
  });
  out.push(" of the ");
  out.push({
    field: "era",
    text: routeEraLabel(state.era),
    title: "The age: decides which kinds of house exist",
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
    title: "Where the house stands: weights country, town, harbour or roadside signs",
    choices: INN_SETTINGS.map((s) => ({ id: s.key, label: s.text })),
    current: state.setting,
  });
  out.push(", ");
  if (showsForm(state)) {
    out.push({
      field: "form",
      text: INN_FORMS[state.form],
      title: "A bare sign name, or the sign with Inn, Tavern and so on",
      choices: (["signs", "house", "either"] as InnForm[]).map((f) => ({ id: f, label: INN_FORMS[f] })),
      current: state.form,
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
    title: "Placeholders like [owner], or invented names",
    choices: (["placeholders", "invented"] as GroupPeople[]).map((p) => ({ id: p, label: PEOPLE_TEXT[p] })),
    current: state.people,
  });
  out.push(" people and places, ");
  out.push({
    field: "series",
    text: SERIES_TEXT[state.series ? "on" : "off"],
    title: "One town's houses: no sign word twice, one roadside house and one landmark",
    choices: [
      { id: "off", label: SERIES_TEXT.off },
      { id: "on", label: SERIES_TEXT.on },
    ],
    current: state.series ? "on" : "off",
  });
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function innSentenceText(segments: InnSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.3: a state after one choice, with the resets that follow from it. */
export function chooseInn(state: InnSentenceState, field: InnField, id: string | undefined): InnSentenceState {
  const next: InnSentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? DEFAULT_INN_STATE.culture;
      break;
    case "kind":
      next.kind = id as InnKind | undefined;
      break;
    case "era":
      next.era = ROUTE_ERAS.some((e) => e.code === id) ? (id as RouteEra) : DEFAULT_INN_STATE.era;
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
    case "form":
      next.form = (id as InnForm) ?? "either";
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
  // §2.3: a kind the era lacks resets to Any; region resets away from the British cultures.
  if (next.kind && !innKindsOffered(next.era).some((k) => k.key === next.kind)) next.kind = undefined;
  if (!showsRegion(next)) next.region = undefined;
  return next;
}

/** The form the engine uses: hidden reads as either (§2.2). */
export const innFormFor = (state: InnSentenceState): InnForm => (showsForm(state) ? state.form : "either");

/** §1.2: "inns and taverns · {era} · {culture}", then kind, setting, region, steampunk or fantastic, tone and one town. */
export function innHistoryLabel(state: InnSentenceState): string {
  const culture = findRouteCulture(state.culture)?.label ?? "General";
  const kind = INN_KINDS.find((k) => k.key === state.kind);
  return [
    "inns and taverns",
    routeEraLabel(state.era),
    culture,
    ...(kind ? [kind.plural] : []),
    ...(state.setting !== "anywhere" ? [settingText(state.setting)] : []),
    ...(state.region && showsRegion(state) ? [regionPhrase(state.region)] : []),
    ...(state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(state.series ? ["one town"] : []),
  ].join(" · ");
}
