// The named things sentence (Named things brief §2), for all three modules: "‹Norse› ‹arms and armour of
// any kind› of the ‹medieval› era, in a ‹realistic› world, ‹of any tone›, belonging to ‹anyone›, with
// ‹placeholders for› people and places, ‹names only›". Built as segments like the money sentence.
// No Obsidian imports.

import type { BynamePackInfo } from "../bynames/sentence";
import { type GroupPeople, type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { ROUTE_ERAS, routeEraLabel, type RouteEra } from "../routes/engine";
import { fantasticWords } from "../routes/sentence";
import { findThingCulture, findThingKind, THING_CULTURES, thingKindsOffered, thingModuleInfo, type ThingModule, type ThingOwner } from "./engine";

export interface ThingSentenceState {
  culture: string;
  /** A kind key; undefined is Any. */
  kind?: string;
  era: RouteEra;
  fantastic: boolean;
  tone: GroupToneChoice;
  people: GroupPeople;
  owner: ThingOwner;
  /** The owner pack and its `##` section ("whole" for all of it); kept for next time when the owner moves away from pack. */
  pack?: string;
  section?: string;
  describe: boolean;
}

export const DEFAULT_THING_STATE: ThingSentenceState = {
  culture: "norman-british",
  era: "MD",
  fantastic: false,
  tone: "any",
  people: "placeholders",
  owner: "anyone",
  describe: false,
};

export type ThingField = "culture" | "kind" | "era" | "fantastic" | "tone" | "owner" | "pack" | "section" | "people" | "describe";

export interface ThingChoice {
  id: string | undefined;
  label: string;
  title?: string;
  group?: string;
}

export type ThingSegment = string | { field: ThingField; text: string; title: string; choices: ThingChoice[]; current: string | undefined };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const DESCRIBE_TEXT = { off: "names only", on: "with what they are" };

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The `##` section a pack draw uses: the chosen heading, "whole", or the pack's first heading. */
export function ownerSectionRequest(state: Pick<ThingSentenceState, "section">, headings: string[]): { section?: string } {
  if (state.section === "whole" || headings.length === 0) return {};
  const wanted = state.section && headings.some((h) => same(h, state.section!)) ? headings.find((h) => same(h, state.section!))! : headings[0];
  return { section: wanted };
}

const sectionText = (state: ThingSentenceState, headings: string[]) => (state.section === "whole" ? "the whole pack" : `its ${ownerSectionRequest(state, headings).section} section`);

export function thingSentence(module: ThingModule, state: ThingSentenceState, packs: BynamePackInfo[] = []): ThingSegment[] {
  const out: ThingSegment[] = [];
  const info = thingModuleInfo(module);
  const culture = findThingCulture(state.culture) ?? THING_CULTURES[0];
  out.push({
    field: "culture",
    text: culture.label,
    title: "Naming culture: whose habits of naming things the names follow",
    choices: THING_CULTURES.map((c) => ({ id: c.key, label: c.label })),
    current: culture.key,
  });
  out.push(" ");
  const offered = thingKindsOffered(module, state.culture, state.era, state.fantastic);
  const kind = offered.find((k) => k.key === state.kind);
  out.push({
    field: "kind",
    text: kind ? kind.plural : info.any,
    title: kind ? kind.description : info.any.charAt(0).toUpperCase() + info.any.slice(1),
    choices: [{ id: undefined, label: "Any" }, ...offered.map((k) => ({ id: k.key, label: k.menu, title: k.description }))],
    current: kind?.key,
  });
  out.push(" of the ");
  out.push({
    field: "era",
    text: routeEraLabel(state.era),
    title: "The age: decides which things exist",
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
  out.push(" world, ");
  out.push({
    field: "tone",
    text: TONE_PHRASES[state.tone],
    title: "Tone: weights names towards a mood; it never rules any out",
    choices: (["any", ...GROUP_TONES] as GroupToneChoice[]).map((t) => ({ id: t, label: TONE_PHRASES[t] })),
    current: state.tone,
  });
  out.push(`, ${info.ownerText} `);
  const ownerText = { anyone: "anyone", pack: "people from", none: "no one" } as const;
  out.push({
    field: "owner",
    text: ownerText[state.owner],
    title: "Who the things belong to, or who wrote and is written about. Anyone follows the people link; a pack gives its names; no one leaves people out of the names.",
    choices: [
      { id: "anyone", label: "anyone" },
      { id: "pack", label: "people from a pack" },
      { id: "none", label: "no one" },
    ],
    current: state.owner,
  });
  if (state.owner === "pack") {
    const pack = packs.find((p) => p.name === state.pack) ?? packs[0];
    out.push(" ");
    out.push({
      field: "pack",
      text: pack?.name ?? "a pack",
      title: "The name pack the people come from",
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
    field: "describe",
    text: DESCRIBE_TEXT[state.describe ? "on" : "off"],
    title: "Add what each thing is, and whose (Wolf's Tooth, sword of [hero]).",
    choices: [{ id: "off", label: DESCRIBE_TEXT.off }, { id: "on", label: DESCRIBE_TEXT.on }],
    current: state.describe ? "on" : "off",
  });
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function thingSentenceText(segments: ThingSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.4: a state made consistent: a kind the culture, era and genre don't offer goes back to Any. */
export function normaliseThings(module: ThingModule, state: ThingSentenceState): ThingSentenceState {
  const next: ThingSentenceState = { ...state };
  if (!findThingCulture(next.culture)) next.culture = DEFAULT_THING_STATE.culture;
  if (next.kind && !thingKindsOffered(module, next.culture, next.era, next.fantastic).some((k) => k.key === next.kind)) next.kind = undefined;
  return next;
}

/** §2.4: a state after one choice, with the resets that follow from it. */
export function chooseThings(module: ThingModule, state: ThingSentenceState, field: ThingField, id: string | undefined, packs: BynamePackInfo[] = []): ThingSentenceState {
  const next: ThingSentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? DEFAULT_THING_STATE.culture;
      break;
    case "kind":
      next.kind = findThingKind(id)?.module === module ? id : undefined;
      break;
    case "era":
      next.era = ROUTE_ERAS.some((e) => e.code === id) ? (id as RouteEra) : DEFAULT_THING_STATE.era;
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "tone":
      next.tone = (id as GroupToneChoice) ?? "any";
      break;
    case "owner":
      next.owner = id === "pack" || id === "none" ? id : "anyone";
      // The pack defaults to the first, and is remembered once the owner is a pack.
      if (next.owner === "pack" && !next.pack) next.pack = packs[0]?.name;
      break;
    case "pack":
      next.pack = id;
      next.section = undefined;
      break;
    case "section":
      next.section = id;
      break;
    case "people":
      next.people = (id as GroupPeople) ?? "placeholders";
      break;
    case "describe":
      next.describe = id === "on";
      break;
  }
  return normaliseThings(module, next);
}

/** §2.4: changing module resets the kind to Any and keeps every other field. */
export const switchThingModule = (state: ThingSentenceState): ThingSentenceState => ({ ...state, kind: undefined });

/** §1.2: "{module label} · {era} · {culture}", then kind, steampunk or fantastic, tone, owner and described. */
export function thingHistoryLabel(module: ThingModule, state: ThingSentenceState): string {
  const info = thingModuleInfo(module);
  return [
    info.label,
    routeEraLabel(state.era),
    findThingCulture(state.culture)?.label ?? "General",
    ...(state.kind ? [findThingKind(state.kind)?.plural ?? state.kind] : []),
    ...(state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(state.owner === "pack" ? ["owner: pack"] : state.owner === "none" ? ["owner: none"] : []),
    ...(state.describe ? ["described"] : []),
  ].join(" · ");
}
