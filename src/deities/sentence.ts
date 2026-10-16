// The deities sentence (Deities brief §2): "‹General›-themed ‹deities of any kind› of ‹any domain›,
// ‹of any gender›, of the ‹medieval› era, in a ‹realistic› world, ‹of any tone›, as ‹titles only›,
// ‹each one separate›"; and, since the line-up brief's split (§2.3), the sacred places sentence on the
// same engine. Built as segments like the event sentence. No Obsidian imports.

import { type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { ROUTE_ERAS, routeEraLabel, type RouteEra } from "../routes/engine";
import { fantasticWords } from "../routes/sentence";
import { DEITY_ANY, DEITY_CULTURES, DEITY_DOMAINS, DEITY_KINDS, domainsOffered, type DeityGender, type DeityKind, type DeityNames } from "./engine";

export interface DeitySentenceState {
  culture: string;
  /** A kind key; undefined is Any. */
  kind?: DeityKind;
  /** A domain key; undefined is any. */
  domain?: string;
  gender: DeityGender;
  era: RouteEra;
  fantastic: boolean;
  tone: GroupToneChoice;
  names: DeityNames;
  /** §2.2: the name pack, when names come from a pack. */
  pack?: string;
  series: boolean;
}

export const DEFAULT_DEITY_STATE: DeitySentenceState = {
  culture: "general",
  gender: "any",
  era: "MD",
  fantastic: false,
  tone: "any",
  names: "titles",
  series: false,
};

export type DeityField = "culture" | "kind" | "domain" | "gender" | "era" | "fantastic" | "tone" | "names" | "pack" | "series";

export interface DeityChoice {
  id: string | undefined;
  label: string;
  title?: string;
}

export type DeitySegment = string | { field: DeityField; text: string; title: string; choices: DeityChoice[]; current: string | undefined };

export const GENDER_TEXT: Record<DeityGender, string> = { any: "of any gender", male: "male", female: "female", neither: "neither male nor female" };
export const NAMES_TEXT: Record<DeityNames, string> = { titles: "as titles only", placeholder: "with placeholder names", pack: "with names from" };
const SERIES_TEXT = { off: "each one separate", on: "as one pantheon" };

/** §2.2: the gender and names links are hidden for sacred places. */
/** Line-up brief §2.2: the kinds the deities module draws (kind Any means these). */
export const DEITIES_MODULE_KINDS: DeityKind[] = ["deity", "pantheon"];

export const showsPersonLinks = (state: Pick<DeitySentenceState, "kind">) => state.kind !== "place";

export function deitySentence(state: DeitySentenceState, packs: string[] = []): DeitySegment[] {
  const out: DeitySegment[] = [];
  const culture = DEITY_CULTURES.find((c) => c.key === state.culture) ?? DEITY_CULTURES[0];
  out.push({
    field: "culture",
    text: culture.label,
    title: "Naming culture: whose customs shape the faith (never its real gods)",
    choices: DEITY_CULTURES.map((c) => ({ id: c.key, label: c.label })),
    current: culture.key,
  });
  out.push("-themed ");
  const kind = DEITY_KINDS.find((k) => k.key === state.kind);
  out.push({
    field: "kind",
    text: kind ? kind.plural : DEITY_ANY,
    title: kind ? kind.description : DEITY_ANY.charAt(0).toUpperCase() + DEITY_ANY.slice(1),
    // Line-up brief §2.2: sacred places have a module of their own.
    choices: [{ id: undefined, label: "Any" }, ...DEITY_KINDS.filter((k) => DEITIES_MODULE_KINDS.includes(k.key)).map((k) => ({ id: k.key, label: k.menu, title: k.description }))],
    current: kind?.key,
  });
  out.push(" of ");
  const offered = domainsOffered(state.era, state.fantastic);
  const domain = offered.find((d) => d.key === state.domain);
  out.push({
    field: "domain",
    text: domain ? domain.label : "any domain",
    title: "What the deity rules over",
    choices: [{ id: undefined, label: "any domain" }, ...offered.map((d) => ({ id: d.key, label: d.label }))],
    current: domain?.key,
  });
  out.push(", ");
  if (showsPersonLinks(state)) {
    out.push({
      field: "gender",
      text: GENDER_TEXT[state.gender],
      title: "Decides Lord or Lady, He Who or She Who, Father or Mother; neither gives They Who and The One",
      choices: (["any", "male", "female", "neither"] as DeityGender[]).map((g) => ({ id: g, label: GENDER_TEXT[g] })),
      current: state.gender,
    });
    out.push(", ");
  }
  out.push("of the ");
  out.push({
    field: "era",
    text: routeEraLabel(state.era),
    title: "The age: decides which domains exist (engines in the steam age, machines in the future)",
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
  out.push({
    field: "tone",
    text: TONE_PHRASES[state.tone],
    title: "Tone: weights names towards a mood; it never rules any out",
    choices: (["any", ...GROUP_TONES] as GroupToneChoice[]).map((t) => ({ id: t, label: TONE_PHRASES[t] })),
    current: state.tone,
  });
  out.push(", ");
  if (showsPersonLinks(state)) {
    out.push({
      field: "names",
      text: NAMES_TEXT[state.names],
      title: "Titles alone, a placeholder before the title, or a name from one of your packs",
      choices: (["titles", "placeholder", "pack"] as DeityNames[]).map((n) => ({ id: n, label: n === "pack" ? "with names from a pack" : NAMES_TEXT[n] })),
      current: state.names,
    });
    if (state.names === "pack") {
      out.push(" ");
      out.push({
        field: "pack",
        text: state.pack ?? packs[0] ?? "a pack",
        title: "The name pack the names come from (its section for the gender)",
        choices: packs.map((p) => ({ id: p, label: p })),
        current: state.pack,
      });
    }
    out.push(", ");
  }
  out.push({
    field: "series",
    text: SERIES_TEXT[state.series ? "on" : "off"],
    title: "A pantheon: one court name, then deities of different domains",
    choices: [
      { id: "off", label: SERIES_TEXT.off },
      { id: "on", label: SERIES_TEXT.on },
    ],
    current: state.series ? "on" : "off",
  });
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function deitySentenceText(segments: DeitySegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.3: a state after one choice, with the resets that follow from it. */
export function chooseDeity(state: DeitySentenceState, field: DeityField, id: string | undefined): DeitySentenceState {
  const next: DeitySentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = DEITY_CULTURES.some((c) => c.key === id) ? id! : "general";
      break;
    case "kind":
      next.kind = id as DeityKind | undefined;
      break;
    case "domain":
      next.domain = id;
      break;
    case "gender":
      next.gender = (id as DeityGender) ?? "any";
      break;
    case "era":
      next.era = ROUTE_ERAS.some((e) => e.code === id) ? (id as RouteEra) : DEFAULT_DEITY_STATE.era;
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "tone":
      next.tone = (id as GroupToneChoice) ?? "any";
      break;
    case "names":
      next.names = (id as DeityNames) ?? "titles";
      break;
    case "pack":
      next.pack = id;
      break;
    case "series":
      next.series = id === "on";
      break;
  }
  // §2.3: a domain the era and fantastic lack resets to any.
  if (next.domain && !domainsOffered(next.era, next.fantastic).some((d) => d.key === next.domain)) next.domain = undefined;
  return next;
}

/** §2.3: the gender and names the engine uses (sacred places read as any and titles only). */
export const effectiveDeityState = (state: DeitySentenceState): DeitySentenceState =>
  showsPersonLinks(state) ? state : { ...state, gender: "any", names: "titles" };

/** §1.2 (line-up brief §2.4): "deities · {era} · {culture}", then kind, domain, gender, steampunk or fantastic, tone and one pantheon. */
export function deityHistoryLabel(state: DeitySentenceState): string {
  const culture = DEITY_CULTURES.find((c) => c.key === state.culture)?.label ?? "General";
  const kind = DEITY_KINDS.find((k) => k.key === state.kind);
  const domain = DEITY_DOMAINS.find((d) => d.key === state.domain);
  const s = effectiveDeityState(state);
  return [
    "deities",
    routeEraLabel(state.era),
    culture,
    ...(kind ? [kind.plural] : []),
    ...(domain ? [domain.label] : []),
    ...(s.gender !== "any" ? [s.gender] : []),
    ...(state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(state.series ? ["one pantheon"] : []),
  ].join(" · ");
}

// ── Sacred places (line-up brief §2.3) ─────────────────────────────────────

/** "‹General›-themed sacred places of ‹any domain›, of the ‹medieval› era, in a ‹realistic› world, ‹of any tone›." */
export interface SacredPlaceSentenceState {
  culture: string;
  /** A domain key; undefined is any. */
  domain?: string;
  era: RouteEra;
  fantastic: boolean;
  tone: GroupToneChoice;
}

export const DEFAULT_SACRED_PLACE_STATE: SacredPlaceSentenceState = { culture: "general", era: "MD", fantastic: false, tone: "any" };

export type SacredPlaceField = "culture" | "domain" | "era" | "fantastic" | "tone";

/** The deity state the engine runs for sacred places: always places, any gender, titles, no series. */
export const sacredPlaceAsDeityState = (state: SacredPlaceSentenceState): DeitySentenceState => ({
  ...state,
  kind: "place",
  gender: "any",
  names: "titles",
  series: false,
});

const SACRED_PLACE_FIELDS: SacredPlaceField[] = ["culture", "domain", "era", "fantastic", "tone"];

export function sacredPlaceSentence(state: SacredPlaceSentenceState): DeitySegment[] {
  // The deity sentence for places already hides gender and names; drop its kind and series links too.
  const out: DeitySegment[] = [];
  for (const seg of deitySentence(sacredPlaceAsDeityState(state))) {
    if (typeof seg !== "string" && !SACRED_PLACE_FIELDS.includes(seg.field as SacredPlaceField)) {
      if (seg.field === "kind") out.push("sacred places");
      continue;
    }
    out.push(seg);
  }
  // The series link went last; drop the ", " left before it.
  while (typeof out[out.length - 1] === "string" && (out[out.length - 1] as string).trim() === ",") out.pop();
  return out;
}

/** A sacred places state after one choice, with the deity sentence's resets. */
export function chooseSacredPlace(state: SacredPlaceSentenceState, field: SacredPlaceField, id: string | undefined): SacredPlaceSentenceState {
  const next = chooseDeity(sacredPlaceAsDeityState(state), field, id);
  return { culture: next.culture, ...(next.domain ? { domain: next.domain } : {}), era: next.era, fantastic: next.fantastic, tone: next.tone };
}

/** "sacred places · {era} · {culture}", then domain, steampunk or fantastic and tone. */
export function sacredPlaceHistoryLabel(state: SacredPlaceSentenceState): string {
  const culture = DEITY_CULTURES.find((c) => c.key === state.culture)?.label ?? "General";
  const domain = DEITY_DOMAINS.find((d) => d.key === state.domain);
  return [
    "sacred places",
    routeEraLabel(state.era),
    culture,
    ...(domain ? [domain.label] : []),
    ...(state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
  ].join(" · ");
}

/** Line-up brief §2.5: the module a deity preset opens in, from its kind (place → sacred places). */
export const deityPresetModule = (kind: DeityKind | "any"): "sacredPlaces" | "deityNames" => (kind === "place" ? "sacredPlaces" : "deityNames");
