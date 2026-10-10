// The group names sentence (Group brief §2): "‹General›-themed ‹orders and faiths of any kind› for a
// ‹fantasy› world ‹of historic or low fantasy›, using ‹formal or everyday› names ‹that say what they
// are›, with ‹placeholders for› people and places". Built as segments like the tribal sentence.
// No Obsidian imports.

import { TRIBAL_TRADITIONS } from "../tribes/engine";
import {
  canFront,
  type GroupFamily,
  type GroupForm,
  type GroupFront,
  type GroupGenre,
  type GroupPeople,
  groupSetting,
  SETTING_PHRASES,
  typesInSetting,
} from "./engine";

export interface GroupSentenceState {
  tradition: string;
  /** A type key; undefined is Any. */
  type?: string;
  genre: GroupGenre;
  fantastic: boolean;
  form: GroupForm;
  front: GroupFront;
  people: GroupPeople;
}

export type GroupField = "tradition" | "type" | "genre" | "fantastic" | "form" | "front" | "people";

export interface GroupChoice {
  id: string | undefined;
  label: string;
}

export type GroupSegment = string | { field: GroupField; text: string; title: string; choices: GroupChoice[]; current: string | undefined };

export const DEFAULT_GROUP_STATE: GroupSentenceState = {
  tradition: "general",
  genre: "fantasy",
  fantastic: false,
  form: "any",
  front: "say",
  people: "placeholders",
};

const GENRE_TEXT: Record<GroupGenre, string> = { fantasy: "fantasy", modern: "modern", scifi: "science fiction" };
const FANTASTIC_TEXT: Record<"fantasy" | "modern", [string, string]> = {
  fantasy: ["of historic or low fantasy", "of high or epic fantasy"],
  modern: ["as it really is", "of contemporary fantasy"],
};
const FORM_TEXT: Record<GroupForm, string> = { any: "formal or everyday", formal: "formal", everyday: "everyday" };
const FRONT_TEXT: Record<GroupFront, string> = { say: "that say what they are", hide: "that hide what they are", may: "that may hide what they are" };
const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };

/** §2.2: whether the front link shows: the type can take a front, or Any with one available type that can. */
export function showsFront(state: GroupSentenceState, family: GroupFamily): boolean {
  const available = typesInSetting(family, groupSetting(state.genre, state.fantastic));
  const type = available.find((t) => t.key === state.type);
  return type ? canFront(type) : available.some(canFront);
}

/** §2.2: the front the engine uses: "say" whenever the front link is hidden. */
export function effectiveFront(state: GroupSentenceState, family: GroupFamily): GroupFront {
  return showsFront(state, family) ? state.front : "say";
}

/** §2.4: supernatural courts offer fantasy and modern only. */
const genresFor = (family: GroupFamily): GroupGenre[] => (family.key === "supernatural" ? ["fantasy", "modern"] : ["fantasy", "modern", "scifi"]);

export function groupSentence(state: GroupSentenceState, family: GroupFamily): GroupSegment[] {
  const out: GroupSegment[] = [];
  const tradition = TRIBAL_TRADITIONS.find((t) => t.key === state.tradition) ?? TRIBAL_TRADITIONS[0];
  out.push({
    field: "tradition",
    text: tradition.label,
    title: tradition.key === "general" ? "No cultural flavour" : tradition.drawsOn,
    choices: TRIBAL_TRADITIONS.map((t) => ({ id: t.key, label: t.label })),
    current: tradition.key,
  });
  out.push("-themed ");
  const setting = groupSetting(state.genre, state.fantastic);
  const available = typesInSetting(family, setting);
  const type = available.find((t) => t.key === state.type);
  out.push({
    field: "type",
    text: type ? type.sentence : family.any,
    title: type ? type.description : `Any of the ${family.label}`,
    choices: [{ id: undefined, label: "Any" }, ...available.map((t) => ({ id: t.key, label: t.menu }))],
    current: type?.key,
  });
  out.push(" for a ");
  out.push({
    field: "genre",
    text: GENRE_TEXT[state.genre],
    title: "Genre: the kind of world",
    choices: genresFor(family).map((g) => ({ id: g, label: GENRE_TEXT[g] })),
    current: state.genre,
  });
  out.push(" world");
  if (state.genre !== "scifi") {
    const phrases = FANTASTIC_TEXT[state.genre];
    // §2.4: supernatural modern is always contemporary fantasy.
    const offered = family.key === "supernatural" && state.genre === "modern" ? [true] : [false, true];
    out.push(" ");
    out.push({
      field: "fantastic",
      text: phrases[state.fantastic ? 1 : 0],
      title: SETTING_PHRASES[setting].charAt(0).toUpperCase() + SETTING_PHRASES[setting].slice(1),
      choices: offered.map((on) => ({ id: on ? "on" : "off", label: phrases[on ? 1 : 0] })),
      current: state.fantastic ? "on" : "off",
    });
  }
  out.push(", using ");
  out.push({
    field: "form",
    text: FORM_TEXT[state.form],
    title: "Formal titles, everyday names, or both",
    choices: (["any", "formal", "everyday"] as GroupForm[]).map((f) => ({ id: f, label: FORM_TEXT[f] })),
    current: state.form,
  });
  out.push(" names");
  if (showsFront(state, family)) {
    out.push(" ");
    out.push({
      field: "front",
      text: FRONT_TEXT[state.front],
      title: "Front names: respectable names that hide what a group really is",
      choices: (["say", "hide", "may"] as GroupFront[]).map((f) => ({ id: f, label: FRONT_TEXT[f] })),
      current: state.front,
    });
  }
  out.push(", with ");
  out.push({
    field: "people",
    text: PEOPLE_TEXT[state.people],
    title: "Placeholders like [commander], or invented names",
    choices: (["placeholders", "invented"] as GroupPeople[]).map((p) => ({ id: p, label: PEOPLE_TEXT[p] })),
    current: state.people,
  });
  out.push(" people and places");
  return out;
}

/** §2.6: the sentence as plain text, for preset descriptions. */
export function groupSentenceText(segments: GroupSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.4: a state after one choice, with the resets that follow from it. */
export function chooseGroup(state: GroupSentenceState, field: GroupField, id: string | undefined, family: GroupFamily): GroupSentenceState {
  let next: GroupSentenceState = { ...state };
  switch (field) {
    case "tradition":
      next.tradition = id ?? "general";
      break;
    case "type":
      next.type = id;
      break;
    case "genre":
      next.genre = (id as GroupGenre) ?? "fantasy";
      if (family.key === "supernatural" && next.genre === "modern") next.fantastic = true;
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "form":
      next.form = (id as GroupForm) ?? "any";
      break;
    case "front":
      next.front = (id as GroupFront) ?? "say";
      break;
    case "people":
      next.people = (id as GroupPeople) ?? "placeholders";
      break;
  }
  // Genre or fantastic changed: a type the new setting lacks resets to Any.
  const available = typesInSetting(family, groupSetting(next.genre, next.fantastic));
  if (next.type && !available.some((t) => t.key === next.type)) next = { ...next, type: undefined };
  // Type changed: a type that can't take a front resets the front to "say".
  if (field === "type" && next.type && !showsFront(next, family)) next = { ...next, front: "say" };
  return next;
}

/** Group brief §13: a preset's values as a sentence state. */
export function groupPresetState(preset: {
  tradition: string;
  groupType: string;
  genre: GroupGenre;
  fantastic: boolean;
  form: GroupForm;
  front: GroupFront;
  people: GroupPeople;
}): GroupSentenceState {
  return {
    tradition: preset.tradition,
    type: preset.groupType === "any" ? undefined : preset.groupType,
    genre: preset.genre,
    fantastic: preset.fantastic,
    form: preset.form,
    front: preset.front,
    people: preset.people,
  };
}
