// The bynames sentences (Bynames brief §2): "‹General›-themed ‹epithets of any kind› for a ‹fantasy›
// world ‹of historic or low fantasy›, ‹of any tone›, for ‹anyone›, ‹after a placeholder name›".
// Built as segments like the group sentence. No Obsidian imports.

import { type GroupGenre, type GroupToneChoice, GROUP_TONES, groupSetting, SETTING_PHRASES, TONE_PHRASES } from "../groups/engine";
import { FANTASTIC_TEXT, GENRE_TEXT } from "../groups/sentence";
import type { SectionRequest } from "../packs/sections";
import {
  availableKinds,
  BYNAME_CULTURES,
  type BynameGender,
  type BynameLanguage,
  type BynameLength,
  type BynameModule,
  type BynameSource,
  moduleAny,
  type NameRole,
  showsLanguage,
} from "./engine";

export interface BynameSentenceState {
  culture: string;
  /** A kind key; undefined is Any. */
  kind?: string;
  genre: GroupGenre;
  fantastic: boolean;
  tone: GroupToneChoice;
  language: BynameLanguage;
  gender: BynameGender;
  length: BynameLength;
  source: BynameSource;
  /** §2.3: kept for next time when the source moves away from pack. */
  pack?: string;
  /** A heading, "whole", or undefined for the default (§2.4). */
  section?: string;
}

export const DEFAULT_BYNAME_STATE: BynameSentenceState = {
  culture: "general",
  genre: "fantasy",
  fantastic: false,
  tone: "any",
  language: "english",
  gender: "anyone",
  length: "single",
  source: "placeholder",
};

export type BynameField = "culture" | "kind" | "genre" | "fantastic" | "tone" | "language" | "gender" | "length" | "source" | "pack" | "section";

export interface BynameChoice {
  id: string | undefined;
  label: string;
}

export type BynameSegment = string | { field: BynameField; text: string; title: string; choices: BynameChoice[]; current: string | undefined };

/** A pack the sentence can offer: its name and `##` headings. */
export interface BynamePackInfo {
  name: string;
  headings: string[];
}

const LANGUAGE_TEXT: Record<BynameLanguage, string> = { english: "in English", native: "in native forms", mixed: "in English or native forms" };
const LENGTH_TEXT: Record<BynameLength, string> = { single: "as single titles", full: "as full styles" };
const SOURCE_TEXT = (module: BynameModule): Record<BynameSource, string> =>
  module === "familyNames"
    ? { placeholder: "with a placeholder name", pack: "with names from", none: "on their own" }
    : { placeholder: "after a placeholder name", pack: "after names from", none: "on their own" };
const SOURCE_MENU = (module: BynameModule): Record<BynameSource, string> => {
  const t = SOURCE_TEXT(module);
  return { ...t, pack: `${t.pack} a pack` };
};

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** §2.4: whether a pack's headings include Male and Female. */
export function hasGenderSections(headings: string[]): boolean {
  return headings.some((h) => same(h, "male")) && headings.some((h) => same(h, "female"));
}

/** §2.4: the section a name is drawn from: a hand-picked heading wins; else Male/Female for the
 * sex when the pack has them; else the first heading; "whole" (or no headings) is the whole pack. */
export function sectionRequest(state: Pick<BynameSentenceState, "section">, headings: string[], role: NameRole, sex: "male" | "female"): SectionRequest {
  if (state.section === "whole" || headings.length === 0) return {};
  if (state.section && state.section !== "gender") return { section: state.section };
  const wanted = role === "father" ? "male" : role === "mother" ? "female" : sex;
  if (hasGenderSections(headings)) return { section: headings.find((h) => same(h, wanted))! };
  return { section: headings[0] };
}

const sectionText = (state: BynameSentenceState, headings: string[]) => {
  if (state.section === "whole") return "the whole pack";
  if (state.section && state.section !== "gender") return `its ${state.section} section`;
  return hasGenderSections(headings) ? "its section for the gender" : `its ${headings[0]} section`;
};

export function bynameSentence(state: BynameSentenceState, module: BynameModule, packs: BynamePackInfo[] = []): BynameSegment[] {
  const out: BynameSegment[] = [];
  const culture = BYNAME_CULTURES.find((c) => c.key === state.culture) ?? BYNAME_CULTURES[0];
  out.push({
    field: "culture",
    text: culture.label,
    title: "Naming culture: which customs the names follow",
    choices: BYNAME_CULTURES.map((c) => ({ id: c.key, label: c.label })),
    current: culture.key,
  });
  out.push("-themed ");
  const setting = groupSetting(state.genre, state.fantastic);
  const kinds = availableKinds(module, culture.key, setting);
  const kind = kinds.find((k) => k.kind.key === state.kind)?.kind;
  out.push({
    field: "kind",
    text: kind ? kind.plural : moduleAny(module),
    title: kind ? kind.menu : moduleAny(module),
    choices: [{ id: undefined, label: "Any" }, ...kinds.map((k) => ({ id: k.kind.key, label: k.kind.menu }))],
    current: kind?.key,
  });
  out.push(" for a ");
  out.push({
    field: "genre",
    text: GENRE_TEXT[state.genre],
    title: "Genre: the kind of world",
    choices: (["fantasy", "modern", "scifi"] as GroupGenre[]).map((g) => ({ id: g, label: GENRE_TEXT[g] })),
    current: state.genre,
  });
  out.push(" world");
  if (state.genre !== "scifi") {
    const phrases = FANTASTIC_TEXT[state.genre];
    out.push(" ");
    out.push({
      field: "fantastic",
      text: phrases[state.fantastic ? 1 : 0],
      title: SETTING_PHRASES[setting].charAt(0).toUpperCase() + SETTING_PHRASES[setting].slice(1),
      choices: [false, true].map((on) => ({ id: on ? "on" : "off", label: phrases[on ? 1 : 0] })),
      current: state.fantastic ? "on" : "off",
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
  if (showsLanguage(module, culture.key)) {
    out.push(", ");
    out.push({
      field: "language",
      text: LANGUAGE_TEXT[state.language],
      title: "English translations, the culture's own words, or a mix",
      choices: (["english", "native", "mixed"] as BynameLanguage[]).map((l) => ({ id: l, label: LANGUAGE_TEXT[l] })),
      current: state.language,
    });
  }
  out.push(", for ");
  out.push({
    field: "gender",
    text: state.gender,
    title: "Decides forms such as King or Queen, -son or -dóttir",
    choices: (["men", "women", "anyone"] as BynameGender[]).map((g) => ({ id: g, label: g })),
    current: state.gender,
  });
  if (module === "titles") {
    out.push(", ");
    out.push({
      field: "length",
      text: LENGTH_TEXT[state.length],
      title: "One title, or a full royal style of two to four",
      choices: (["single", "full"] as BynameLength[]).map((l) => ({ id: l, label: LENGTH_TEXT[l] })),
      current: state.length,
    });
  }
  out.push(", ");
  out.push({
    field: "source",
    text: SOURCE_TEXT(module)[state.source],
    title: "Who the byname belongs to",
    choices: (["placeholder", "pack", "none"] as BynameSource[]).map((s) => ({ id: s, label: SOURCE_MENU(module)[s] })),
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
        choices: [
          ...(hasGenderSections(pack.headings) ? [{ id: "gender", label: "its section for the gender" }] : []),
          ...pack.headings.map((h) => ({ id: h, label: `its ${h} section` })),
          { id: "whole", label: "the whole pack" },
        ],
        current: state.section ?? (hasGenderSections(pack.headings) ? "gender" : pack.headings[0]),
      });
    }
  }
  return out;
}

/** §2.5: the sentence as plain text. */
export function bynameSentenceText(segments: BynameSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.3: a state after one choice, with the resets that follow from it. */
export function chooseByname(state: BynameSentenceState, field: BynameField, id: string | undefined, module: BynameModule): BynameSentenceState {
  let next: BynameSentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? "general";
      if (next.culture === "general") next.language = "english";
      break;
    case "kind":
      next.kind = id;
      break;
    case "genre":
      next.genre = (id as GroupGenre) ?? "fantasy";
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "tone":
      next.tone = (id as GroupToneChoice) ?? "any";
      break;
    case "language":
      next.language = (id as BynameLanguage) ?? "english";
      break;
    case "gender":
      next.gender = (id as BynameGender) ?? "anyone";
      break;
    case "length":
      next.length = (id as BynameLength) ?? "single";
      break;
    case "source":
      next.source = (id as BynameSource) ?? "placeholder";
      break;
    case "pack":
      next.pack = id;
      next.section = undefined;
      break;
    case "section":
      next.section = id;
      break;
  }
  // Culture, genre or fantastic changed: a kind that isn't available resets to Any.
  const kinds = availableKinds(module, next.culture, groupSetting(next.genre, next.fantastic));
  if (next.kind && !kinds.some((k) => k.kind.key === next.kind)) next = { ...next, kind: undefined };
  return next;
}

/** The language the engine uses: English whenever the link is hidden (§2.2). */
export function effectiveLanguage(state: BynameSentenceState, module: BynameModule): BynameLanguage {
  return showsLanguage(module, state.culture) ? state.language : "english";
}

/** §12: a preset's values as a sentence state. */
export function bynamePresetState(preset: {
  culture: string;
  kind: string;
  genre: GroupGenre;
  fantastic: boolean;
  tone: GroupToneChoice;
  language: BynameLanguage;
  gender: BynameGender;
  length: BynameLength;
  source: BynameSource;
  pack?: string;
  section: string;
}): BynameSentenceState {
  return {
    culture: preset.culture,
    kind: preset.kind === "any" ? undefined : preset.kind,
    genre: preset.genre,
    fantastic: preset.fantastic,
    tone: preset.tone,
    language: preset.language,
    gender: preset.gender,
    length: preset.length,
    source: preset.source,
    pack: preset.pack,
    section: preset.section === "gender" ? undefined : preset.section,
  };
}
