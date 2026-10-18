// The peoples and tongues sentence (Peoples and tongues brief §2): "‹Norman & British› peoples and tongues
// for ‹names I type›, of the ‹medieval› era, giving ‹peoples and languages›, ‹of any tone›, ‹one language
// name each›". Built as segments like the named things sentence. No Obsidian imports.

import type { BynamePackInfo } from "../bynames/sentence";
import { type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { ROUTE_ERAS, routeEraLabel, type RouteEra } from "../routes/engine";
import { ownerSectionRequest } from "../things/sentence";
import { type PeopleDetail, type PeopleGiving, PEOPLE_CULTURES, peoplesHistoryLabel } from "./engine";

export type PeopleSource = "typed" | "pack" | "realms" | "places";

export interface PeopleSentenceState {
  culture: string;
  source: PeopleSource;
  /** The pack and its `##` section ("whole" for all of it); kept for next time when the source moves away from pack. */
  pack?: string;
  section?: string;
  era: RouteEra;
  giving: PeopleGiving;
  tone: GroupToneChoice;
  detail: PeopleDetail;
  /** The typed names (§2.1), saved with the module's state. */
  names: string;
}

export const DEFAULT_PEOPLE_STATE: PeopleSentenceState = {
  culture: "norman-british",
  source: "typed",
  era: "MD",
  giving: "both",
  tone: "any",
  detail: "one",
  names: "",
};

export type PeopleField = "culture" | "source" | "pack" | "section" | "era" | "giving" | "tone" | "detail";

export interface PeopleChoice {
  id: string | undefined;
  label: string;
  title?: string;
}

export type PeopleSegment = string | { field: PeopleField; text: string; title: string; choices: PeopleChoice[]; current: string | undefined };

/** §2.3: new place names isn't offered for greek-byzantine and steppe. */
export const PEOPLE_NO_PLACES = ["greek-byzantine", "steppe"];
export const placesOffered = (culture: string) => !PEOPLE_NO_PLACES.includes(culture);

const SOURCE_TEXT: Record<PeopleSource, string> = { typed: "names I type", pack: "names from a pack", realms: "new realms", places: "new place names" };
const GIVING_TEXT: Record<PeopleGiving, string> = { both: "peoples and languages", peoples: "peoples", languages: "languages" };
const DETAIL_TEXT: Record<PeopleDetail, string> = { one: "one language name each", older: "with older forms", dialects: "with dialects" };

export { ownerSectionRequest as peopleSectionRequest };

const sectionText = (state: PeopleSentenceState, headings: string[]) => (state.section === "whole" ? "the whole pack" : `its ${ownerSectionRequest(state, headings).section} section`);

export function peopleSentence(state: PeopleSentenceState, packs: BynamePackInfo[] = []): PeopleSegment[] {
  const out: PeopleSegment[] = [];
  const culture = PEOPLE_CULTURES.find((c) => c.key === state.culture) ?? PEOPLE_CULTURES[0];
  out.push({
    field: "culture",
    text: culture.label,
    title: "The culture the names come from. It decides which endings English would use: -er and -ish for English places, -ian and -an for Latin ones, -i for Arabic and Indian ones, -ese for East Asian ones.",
    choices: PEOPLE_CULTURES.map((c) => ({ id: c.key, label: c.label })),
    current: culture.key,
  });
  out.push(" peoples and tongues for ");
  const sources = (["typed", "pack", "realms", "places"] as PeopleSource[]).filter((s) => s !== "places" || placesOffered(state.culture));
  out.push({
    field: "source",
    text: state.source === "pack" ? "names from" : SOURCE_TEXT[state.source],
    title: "Names to work from: typed, drawn from one of your packs, or new names from realms and polities or the place names modules.",
    choices: sources.map((s) => ({ id: s, label: SOURCE_TEXT[s] })),
    current: state.source,
  });
  if (state.source === "pack") {
    const pack = packs.find((p) => p.name === state.pack) ?? packs[0];
    out.push(" ");
    out.push({
      field: "pack",
      text: pack?.name ?? "a pack",
      title: "The name pack the names come from",
      choices: packs.map((p) => ({ id: p.name, label: p.name })),
      current: pack?.name,
    });
    if (pack && pack.headings.length > 0) {
      out.push(", ");
      out.push({
        field: "section",
        text: sectionText(state, pack.headings),
        title: "The pack's section the names come from",
        choices: [...pack.headings.map((h) => ({ id: h, label: `its ${h} section` })), { id: "whole", label: "the whole pack" }],
        current: state.section ?? pack.headings[0],
      });
    }
  }
  out.push(", of the ");
  out.push({
    field: "era",
    text: routeEraLabel(state.era),
    title: "The age: decides which language shapes are used",
    choices: ROUTE_ERAS.map((e) => ({ id: e.code, label: e.label })),
    current: state.era,
  });
  out.push(" era, giving ");
  out.push({
    field: "giving",
    text: GIVING_TEXT[state.giving],
    title: "The person, adjective and people; the language; or both",
    choices: (["both", "peoples", "languages"] as PeopleGiving[]).map((g) => ({ id: g, label: GIVING_TEXT[g] })),
    current: state.giving,
  });
  out.push(", ");
  out.push({
    field: "tone",
    text: TONE_PHRASES[state.tone],
    title: "Tone: weights names towards a mood; it never rules any out",
    choices: (["any", ...GROUP_TONES] as GroupToneChoice[]).map((t) => ({ id: t, label: TONE_PHRASES[t] })),
    current: state.tone,
  });
  if (state.giving !== "peoples") {
    out.push(", ");
    out.push({
      field: "detail",
      text: DETAIL_TEXT[state.detail],
      title: "Older forms give a language's history (Old and Middle Saltgatish). Dialects give three local forms.",
      choices: (["one", "older", "dialects"] as PeopleDetail[]).map((d) => ({ id: d, label: DETAIL_TEXT[d] })),
      current: state.detail,
    });
  }
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function peopleSentenceText(segments: PeopleSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.4: a state made consistent: a culture with no place names module can't use that source. */
export function normalisePeoples(state: PeopleSentenceState): PeopleSentenceState {
  const next: PeopleSentenceState = { ...state };
  if (!PEOPLE_CULTURES.some((c) => c.key === next.culture)) next.culture = DEFAULT_PEOPLE_STATE.culture;
  if (next.source === "places" && !placesOffered(next.culture)) next.source = "realms";
  if (next.giving === "peoples") next.detail = "one";
  return next;
}

/** §2.4: a state after one choice, with the resets that follow from it. */
export function choosePeoples(state: PeopleSentenceState, field: PeopleField, id: string | undefined, packs: BynamePackInfo[] = []): PeopleSentenceState {
  const next: PeopleSentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? DEFAULT_PEOPLE_STATE.culture;
      break;
    case "source":
      next.source = id === "pack" || id === "realms" || id === "places" ? id : "typed";
      // The pack defaults to the first, and is remembered once the source is a pack.
      if (next.source === "pack" && !next.pack) next.pack = packs[0]?.name;
      break;
    case "pack":
      next.pack = id;
      next.section = undefined;
      break;
    case "section":
      next.section = id;
      break;
    case "era":
      next.era = ROUTE_ERAS.some((e) => e.code === id) ? (id as RouteEra) : DEFAULT_PEOPLE_STATE.era;
      break;
    case "giving":
      next.giving = id === "peoples" || id === "languages" ? id : "both";
      break;
    case "tone":
      next.tone = (id as GroupToneChoice) ?? "any";
      break;
    case "detail":
      next.detail = id === "older" || id === "dialects" ? id : "one";
      break;
  }
  return normalisePeoples(next);
}

/** §2.3: the label for a source in the history row. */
export function peopleSourceLabel(state: PeopleSentenceState): string {
  return state.source === "pack" ? `names from ${state.pack ?? "a pack"}` : SOURCE_TEXT[state.source];
}

/** §1.2: the history label for a run. */
export function peopleHistory(state: PeopleSentenceState): string {
  return peoplesHistoryLabel(state.era, state.culture, peopleSourceLabel(state), state.giving, state.detail, state.tone);
}
