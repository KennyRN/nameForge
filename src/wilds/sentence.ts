// The wild lands sentence (docs/wild-lands-brief.md §2): "‹Norman & British› ‹mountain features of any
// kind› of the ‹medieval› era, ‹in home country›, in a ‹realistic› world, ‹across all of Britain›,
// ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›." One builder for all
// six modules, as segments like the waters sentence. No Obsidian imports.

import { regionPhrase } from "../colonialSentence";
import { type GroupPeople, type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { PLACE_SHAPE_REGIONS } from "../placeShapes";
import { fantasticWords } from "../routes/sentence";
import {
  findWildsCulture,
  findWildsKind,
  showsWildsRegion,
  WILDS_CULTURES,
  WILDS_DATA,
  wildsAny,
  wildsBiomes,
  wildsDefaultCulture,
  wildsEraLabel,
  wildsEras,
  wildsKindsAt,
  type WildsEra,
  type WildsModule,
  type WildsWhere,
} from "./engine";

export interface WildsSentenceState {
  culture: string;
  /** A kind key; undefined is Any. */
  kind?: string;
  era: WildsEra;
  where: WildsWhere;
  fantastic: boolean;
  /** A place-shape region code; undefined is all of Britain. */
  region?: string;
  /** A biome id; undefined is any land. */
  biome?: string;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: boolean;
}

export function defaultWildsState(module: WildsModule): WildsSentenceState {
  return { culture: wildsDefaultCulture(module), era: "MD", where: "home", fantastic: false, tone: "any", people: "placeholders", series: false };
}

export type WildsField = "culture" | "kind" | "era" | "where" | "fantastic" | "region" | "biome" | "tone" | "people" | "series";

export interface WildsChoice {
  id: string | undefined;
  label: string;
  title?: string;
  group?: string;
}

export type WildsSegment = string | { field: WildsField; text: string; title: string; choices: WildsChoice[]; current: string | undefined };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const WHERE_TEXT: Record<WildsWhere, string> = { home: "in home country", new: "in newly explored country" };

/** §2.2: "across all of Britain", or "in the North". */
export const wildsRegionText = (region: string | undefined) => (region ? `in ${regionPhrase(region)}` : "across all of Britain");

/** §2.2: "in any land", or "in " + the biome's phrase. */
export function wildsBiomeText(module: WildsModule, biome: string | undefined): string {
  const found = wildsBiomes(module).find((b) => b.id === biome);
  return found ? `in ${found.phrase}` : "in any land";
}

export function wildsSentence(state: WildsSentenceState, module: WildsModule): WildsSegment[] {
  const out: WildsSegment[] = [];
  const culture = findWildsCulture(state.culture) ?? WILDS_CULTURES[0];
  const label = WILDS_DATA.modules[module].label;
  out.push({
    field: "culture",
    text: culture.label,
    title: `Naming culture: whose customs the ${label} names follow`,
    choices: WILDS_CULTURES.map((c, i) => ({ id: c.key, label: c.label, ...(c.group && c.group !== WILDS_CULTURES[i - 1]?.group ? { group: c.group } : {}) })),
    current: culture.key,
  });
  out.push(" ");
  const kinds = wildsKindsAt(module, state.era);
  const kind = kinds.find((k) => k.key === state.kind);
  const any = wildsAny(module);
  out.push({
    field: "kind",
    text: kind ? kind.plural : any,
    title: kind ? kind.menu : any.charAt(0).toUpperCase() + any.slice(1),
    choices: [{ id: undefined, label: "Any" }, ...kinds.map((k) => ({ id: k.key, label: k.menu }))],
    current: kind?.key,
  });
  out.push(" of the ");
  out.push({
    field: "era",
    text: wildsEraLabel(state.era),
    title: "The age: decides which names exist",
    choices: wildsEras(module).map((e) => ({ id: e, label: wildsEraLabel(e) })),
    current: state.era,
  });
  out.push(" era, ");
  out.push({
    field: "where",
    text: WHERE_TEXT[state.where],
    title: "Home country: a people naming its own land. New country: explorers naming land they have just reached",
    choices: (["home", "new"] as WildsWhere[]).map((w) => ({ id: w, label: WHERE_TEXT[w] })),
    current: state.where,
  });
  out.push(", in a ");
  const words = fantasticWords(state.era);
  out.push({
    field: "fantastic",
    text: words[state.fantastic ? 1 : 0],
    title: "Open magic and monsters; in the steam age, steampunk",
    choices: [false, true].map((on) => ({ id: on ? "on" : "off", label: words[on ? 1 : 0] })),
    current: state.fantastic ? "on" : "off",
  });
  out.push(" world, ");
  if (showsWildsRegion(module, state.culture, state.where)) {
    out.push({
      field: "region",
      text: wildsRegionText(state.region),
      title: "Weights the names towards a region's customs",
      choices: [{ id: undefined, label: wildsRegionText(undefined) }, ...PLACE_SHAPE_REGIONS.map((r) => ({ id: r.code, label: wildsRegionText(r.code), title: r.counties }))],
      current: state.region,
    });
  } else {
    out.push({
      field: "biome",
      text: wildsBiomeText(module, state.biome),
      title: "Weights the names towards a land's wildlife, plants and words",
      choices: [{ id: undefined, label: wildsBiomeText(module, undefined) }, ...wildsBiomes(module).map((b) => ({ id: b.id, label: wildsBiomeText(module, b.id) }))],
      current: state.biome,
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
  out.push(" people and places, ");
  const seriesText = WILDS_DATA.modules[module].seriesText;
  out.push({
    field: "series",
    text: state.series ? seriesText : "each one separate",
    title: "Names that share one place, like the peaks and passes of one range",
    choices: [
      { id: "off", label: "each one separate" },
      { id: "on", label: seriesText },
    ],
    current: state.series ? "on" : "off",
  });
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function wildsSentenceText(segments: WildsSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.3: a state after one choice, with the resets that follow from it. */
export function chooseWilds(state: WildsSentenceState, field: WildsField, id: string | undefined, module: WildsModule): WildsSentenceState {
  const next: WildsSentenceState = { ...state };
  switch (field) {
    case "culture":
      next.culture = id ?? wildsDefaultCulture(module);
      break;
    case "kind":
      next.kind = id;
      break;
    case "era":
      next.era = wildsEras(module).includes(id as WildsEra) ? (id as WildsEra) : defaultWildsState(module).era;
      break;
    case "where":
      next.where = id === "new" ? "new" : "home";
      break;
    case "fantastic":
      next.fantastic = id === "on";
      break;
    case "region":
      next.region = id;
      break;
    case "biome":
      next.biome = id;
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
  // §2.3: a kind not live in the era resets to Any; a biome the module doesn't offer resets to any land.
  if (next.kind && !findWildsKind(module, next.kind)) next.kind = undefined;
  if (next.kind && !wildsKindsAt(module, next.era).some((k) => k.key === next.kind)) next.kind = undefined;
  if (next.biome && !wildsBiomes(module).some((b) => b.id === next.biome)) next.biome = undefined;
  return next;
}

/** §1.3: "{module} · {era} · {culture}", then new country, region or biome, kind, fantastic, tone, series. */
export function wildsHistoryLabel(module: WildsModule, state: WildsSentenceState, moduleLabel: string): string {
  const culture = findWildsCulture(state.culture)?.label ?? "General";
  const kind = findWildsKind(module, state.kind);
  const regionShown = showsWildsRegion(module, state.culture, state.where);
  const biome = wildsBiomes(module).find((b) => b.id === state.biome);
  return [
    moduleLabel,
    wildsEraLabel(state.era),
    culture,
    ...(state.where === "new" ? ["new country"] : []),
    ...(regionShown && state.region ? [regionPhrase(state.region)] : []),
    ...(!regionShown && biome ? [biome.label] : []),
    ...(kind ? [kind.plural] : []),
    ...(state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(state.series ? ["series"] : []),
  ].join(" · ");
}
