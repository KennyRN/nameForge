// The money and coins sentence (Money brief §2): "‹Norman & British› ‹money of any kind› of the
// ‹medieval› era, in a ‹realistic› world, ‹of any value›, ‹of any tone›, with ‹placeholders for› people
// and places, ‹each one separate›". The words link shows for cultures with loan forms. Built as segments
// like the events sentence. No Obsidian imports.

import { type GroupPeople, type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { ROUTE_ERAS, routeEraLabel, type RouteEra } from "../routes/engine";
import { fantasticWords } from "../routes/sentence";
import {
  findMoneyCulture,
  findMoneyKind,
  kindHasSeries,
  MONEY_ANY,
  MONEY_CULTURES,
  MONEY_VALUES,
  MONEY_WORDS,
  moneyHasLadder,
  moneyHasLoans,
  moneyKindsOffered,
  type MoneyKind,
  type MoneySeries,
  type MoneyValue,
  type MoneyWords,
} from "./engine";

export interface MoneySentenceState {
  culture: string;
  /** A kind key; undefined is Any. */
  kind?: MoneyKind;
  era: RouteEra;
  fantastic: boolean;
  value: MoneyValue;
  words: MoneyWords;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: MoneySeries;
}

export const DEFAULT_MONEY_STATE: MoneySentenceState = {
  culture: "norman-british",
  era: "MD",
  fantastic: false,
  value: "any",
  words: "translated",
  tone: "any",
  people: "placeholders",
  series: "separate",
};

export type MoneyField = "culture" | "kind" | "era" | "fantastic" | "value" | "words" | "tone" | "people" | "series";

export interface MoneyChoice {
  id: string | undefined;
  label: string;
  title?: string;
  group?: string;
}

export type MoneySegment = string | { field: MoneyField; text: string; title: string; choices: MoneyChoice[]; current: string | undefined };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const SERIES_TEXT: Record<MoneySeries, string> = { separate: "each one separate", coinage: "as one coinage", values: "as one coinage, with values" };

/** §2.2: the series choices: a valued coinage only where a real ladder exists for the culture, era and kind. */
export function moneySeriesChoices(state: MoneySentenceState): MoneySeries[] {
  return moneyHasLadder(state.culture, state.era, state.kind) ? ["separate", "coinage", "values"] : ["separate", "coinage"];
}

/** §2.2: whether a link shows. */
export const showsMoneyValue = (state: MoneySentenceState) => state.kind !== "currency";
export const showsMoneyWords = (state: MoneySentenceState) => moneyHasLoans(state.culture);
export const showsMoneySeries = (state: MoneySentenceState) => kindHasSeries(state.kind);

export function moneySentence(state: MoneySentenceState): MoneySegment[] {
  const out: MoneySegment[] = [];
  const culture = findMoneyCulture(state.culture) ?? MONEY_CULTURES[0];
  out.push({
    field: "culture",
    text: culture.label,
    title: "Naming culture: whose money, and whose customs, the names follow",
    choices: MONEY_CULTURES.map((c, i) => ({ id: c.key, label: c.label, ...(c.group && c.group !== MONEY_CULTURES[i - 1]?.group ? { group: c.group } : {}) })),
    current: culture.key,
  });
  out.push(" ");
  const offered = moneyKindsOffered(state.culture, state.era);
  const kind = offered.find((k) => k.key === state.kind);
  out.push({
    field: "kind",
    text: kind ? kind.plural : MONEY_ANY,
    title: kind ? kind.description : MONEY_ANY.charAt(0).toUpperCase() + MONEY_ANY.slice(1),
    choices: [{ id: undefined, label: "Any" }, ...offered.map((k) => ({ id: k.key, label: k.menu, title: k.description }))],
    current: kind?.key,
  });
  out.push(" of the ");
  out.push({
    field: "era",
    text: routeEraLabel(state.era),
    title: "The age: decides which money exists",
    choices: ROUTE_ERAS.map((e) => ({ id: e.code, label: e.label })),
    current: state.era,
  });
  out.push(" era, in a ");
  const worlds = fantasticWords(state.era);
  out.push({
    field: "fantastic",
    text: worlds[state.fantastic ? 1 : 0],
    title: "Open magic and monsters; in the steam age, steampunk",
    choices: [false, true].map((on) => ({ id: on ? "on" : "off", label: worlds[on ? 1 : 0] })),
    current: state.fantastic ? "on" : "off",
  });
  out.push(" world");
  if (showsMoneyValue(state)) {
    out.push(", ");
    out.push({
      field: "value",
      text: MONEY_VALUES.find((v) => v.key === state.value)!.text,
      title: "Gold and other high coins, silver and middle coins, or copper and small change",
      choices: MONEY_VALUES.map((v) => ({ id: v.key, label: v.text })),
      current: state.value,
    });
  }
  if (showsMoneyWords(state)) {
    out.push(", ");
    out.push({
      field: "words",
      text: MONEY_WORDS.find((w) => w.key === state.words)!.text,
      title: "Real coin names are given in English by meaning (rupee: Wrought Silver). Loanwords keep the familiar English borrowing (Rupee) where there is one.",
      choices: MONEY_WORDS.map((w) => ({ id: w.key, label: w.text })),
      current: state.words,
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
  out.push(", with ");
  out.push({
    field: "people",
    text: PEOPLE_TEXT[state.people],
    title: "Placeholders like [place], or invented names",
    choices: (["placeholders", "invented"] as GroupPeople[]).map((p) => ({ id: p, label: PEOPLE_TEXT[p] })),
    current: state.people,
  });
  out.push(" people and places");
  if (showsMoneySeries(state)) {
    out.push(", ");
    out.push({
      field: "series",
      text: SERIES_TEXT[state.series],
      title: "One money system from the highest coin to the lowest. With values, the ratios come from a real historical system, named under the batch.",
      choices: moneySeriesChoices(state).map((s) => ({ id: s, label: SERIES_TEXT[s] })),
      current: state.series,
    });
  }
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function moneySentenceText(segments: MoneySegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.3: a state made consistent: a kind the culture and era don't offer goes back to Any, words go back to translated where the culture has no loan forms, and a series the kind or ladders can't have steps down. */
export function normaliseMoney(state: MoneySentenceState): MoneySentenceState {
  const next: MoneySentenceState = { ...state };
  if (!findMoneyCulture(next.culture)) next.culture = DEFAULT_MONEY_STATE.culture;
  if (next.kind && !moneyKindsOffered(next.culture, next.era).some((k) => k.key === next.kind)) next.kind = undefined;
  if (!moneyHasLoans(next.culture)) next.words = "translated";
  if (!kindHasSeries(next.kind)) next.series = "separate";
  else if (next.series === "values" && !moneyHasLadder(next.culture, next.era, next.kind)) next.series = "coinage";
  return next;
}

/** §2.3: a state after one choice, with the resets that follow from it. */
export function chooseMoney(state: MoneySentenceState, field: MoneyField, id: string | undefined): MoneySentenceState {
  const next: MoneySentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? DEFAULT_MONEY_STATE.culture;
      break;
    case "kind":
      next.kind = id as MoneyKind | undefined;
      break;
    case "era":
      next.era = ROUTE_ERAS.some((e) => e.code === id) ? (id as RouteEra) : DEFAULT_MONEY_STATE.era;
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "value":
      next.value = MONEY_VALUES.some((v) => v.key === id) ? (id as MoneyValue) : "any";
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
      next.series = id === "coinage" || id === "values" ? id : "separate";
      break;
  }
  return normaliseMoney(next);
}

const VALUE_LABEL: Record<Exclude<MoneyValue, "any">, string> = { high: "high", middle: "middle", low: "low" };

/** §1.2: "money and coins · {era} · {culture}", then kind, value, loanwords, steampunk or fantastic, tone and the coinage. */
export function moneyHistoryLabel(state: MoneySentenceState): string {
  const culture = findMoneyCulture(state.culture)?.label ?? "General";
  const kind = findMoneyKind(state.kind);
  return [
    "money and coins",
    routeEraLabel(state.era),
    culture,
    ...(kind ? [kind.plural] : []),
    ...(showsMoneyValue(state) && state.value !== "any" ? [VALUE_LABEL[state.value]] : []),
    ...(showsMoneyWords(state) && state.words === "loanwords" ? ["loanwords"] : []),
    ...(state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(showsMoneySeries(state) && state.series === "coinage" ? ["one coinage"] : []),
    ...(showsMoneySeries(state) && state.series === "values" ? ["one coinage with values"] : []),
  ].join(" · ");
}
