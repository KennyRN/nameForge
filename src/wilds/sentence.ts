// The wild lands sentence (docs/wild-lands-brief.md §2): "‹Norman & British› ‹mountain features of any
// kind› of the ‹medieval› era, ‹in home country›, in a ‹realistic› world, ‹across all of Britain›,
// ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›." One builder for all
// six modules, as segments like the waters sentence. No Obsidian imports.

import { lensCultureLabel } from "../lens";
import { registerRoster } from "../lensRosters";
import { asSegment, chooseLens } from "../lensSentence";
import { lensClause } from "../lensView";
import { type BiomeCatalogue, biomeMatches, BUILT_IN_BIOMES } from "../biomes";
import { biomeClashes, biomeLinkTitle, biomeMenuItems } from "../biomeMenus";
import { regionPhrase } from "../colonialSentence";
import { type GroupPeople, type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { PLACE_SHAPE_REGIONS } from "../placeShapes";
import { findColonialCulture } from "../places/colonialCultures";
import { classSegment, isPlaceClass, kindInClass, type PlaceClass } from "../places/classes";
import { isSpaceModule, kindScalesAt, scaleOf } from "../places/space";
import { scaleInfo, scaleLabel, scalePhrase, scalesFor, type ScaleChoice } from "../space/scale";
import { fantasticWords } from "../routes/sentence";
import {
  findWildsCulture,
  findWildsKind,
  showsWildsRegion,
  WILDS_CULTURES,
  wildsAny,
  wildsBiomes,
  wildsDefaultCulture,
  wildsDefaultEra,
  wildsDefaultWhere,
  wildsEraLabel,
  wildsEras,
  wildsKindsAt,
  wildsModuleData,
  type WildsEra,
  type WildsLikeModule,
  type WildsWhere,
} from "./engine";

registerRoster("wilds", WILDS_CULTURES);

export interface WildsSentenceState {
  culture: string;
  /** A kind key; undefined is Any. */
  kind?: string;
  /** Place modules split brief §6: the class link; undefined is all. Only set when a class is chosen, so old states and presets are unchanged. */
  kindClass?: PlaceClass;
  era: WildsEra;
  where: WildsWhere;
  /** Stars and space (§5.5): the scale link; undefined is any scale, and nothing is stored for it. */
  scale?: ScaleChoice;
  fantastic: boolean;
  /** A place-shape region code; undefined is all of Britain. */
  region?: string;
  /** A biome id; undefined is any land. */
  biome?: string;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: boolean;
}

export function defaultWildsState(module: WildsLikeModule): WildsSentenceState {
  return { culture: wildsDefaultCulture(module), era: wildsDefaultEra(module), where: wildsDefaultWhere(module), fantastic: false, tone: "any", people: "placeholders", series: false };
}

export type WildsField = "culture" | "kindClass" | "kind" | "era" | "where" | "scale" | "fantastic" | "region" | "biome" | "tone" | "people" | "series";

export interface WildsChoice {
  id: string | undefined;
  label: string;
  title?: string;
  group?: string;
  /** The tooltip of a pack's entry ("Your version: …", "Your biome: …"). */
  tip?: string;
  /** A disabled menu heading shown before this choice ("Your biomes"). */
  heading?: string;
}

export type WildsSegment = string | { field: WildsField; text: string; title: string; choices: WildsChoice[]; current: string | undefined; fixed?: boolean };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const WHERE_TEXT: Record<WildsWhere, string> = { home: "in home country", new: "in newly explored country", settled: "in settled lands" };
/** Stars and space (§3.1, §5.5): no home country, and the words are space's. */
const SPACE_WHERE_TEXT: Record<WildsWhere, string> = { home: "in newly explored space", new: "in newly explored space", settled: "in settled space" };
const SPACE_WHERE_TITLE = "Newly explored space: explorers naming what they have just reached. Settled space: a dominant culture naming and renaming within a peopled region";

/** §2.2: "across all of Britain", or "in the North". */
export const wildsRegionText = (region: string | undefined) => (region ? `in ${regionPhrase(region)}` : "across all of Britain");

/** §2.2: "in any land", or "in " + the biome's phrase. */
export function wildsBiomeText(module: WildsLikeModule, biome: string | undefined, catalogue: BiomeCatalogue = BUILT_IN_BIOMES): string {
  const found = wildsBiomes(module, catalogue).find((b) => biomeMatches(b, biome));
  return found ? `in ${found.phrase}` : "in any land";
}

export function wildsSentence(state: WildsSentenceState, module: WildsLikeModule, catalogue: BiomeCatalogue = BUILT_IN_BIOMES): WildsSegment[] {
  const out: WildsSegment[] = [];
  const space = isSpaceModule(module);
  const label = wildsModuleData(module).label;
  const lens = lensClause(module, state, { cultureTitle: `Naming culture: whose customs the ${label} names follow` });
  out.push(asSegment(lens.culture!, "culture"));
  out.push(" ");
  const kinds = wildsKindsAt(module, state.era);
  const kind = kinds.find((k) => k.key === state.kind);
  const any = wildsAny(module);
  const classLink = classSegment(module, state.kindClass);
  if (classLink) out.push(classLink, " ");
  // §6: the menu keeps the kinds of the chosen class; a stored kind outside it is shown and kept.
  // Stars and space: with a scale chosen, the menu keeps the kinds that have groups there.
  const atScale = (k: (typeof kinds)[number]) => !space || !state.scale || state.scale === "any" || kindScalesAt(k.sources, state.era).includes(state.scale as never);
  const offered = kinds.filter((k) => (kindInClass(k, state.kindClass) && atScale(k)) || k.key === kind?.key);
  out.push({
    field: "kind",
    text: kind ? kind.plural : any,
    title: kind ? kind.menu : any.charAt(0).toUpperCase() + any.slice(1),
    choices: [{ id: undefined, label: "Any" }, ...offered.map((k) => ({ id: k.key, label: k.menu }))],
    current: kind?.key,
  });
  if (lens.era) out.push(" of the ", asSegment(lens.era, "era"), " era, ");
  else out.push(" ");
  if (space) {
    out.push({
      field: "where",
      text: SPACE_WHERE_TEXT[state.where],
      title: SPACE_WHERE_TITLE,
      choices: (["new", "settled"] as WildsWhere[]).map((w) => ({ id: w, label: SPACE_WHERE_TEXT[w] })),
      current: state.where === "settled" ? "settled" : "new",
    });
  } else {
    out.push({
      field: "where",
      text: WHERE_TEXT[state.where],
      title: "Home country: a people naming its own land. New country: explorers naming land they have just reached. Settled lands: a dominant culture naming land within a peopled country",
      choices: (["home", "new", "settled"] as WildsWhere[]).map((w) => ({ id: w, label: WHERE_TEXT[w] })),
      current: state.where,
    });
  }
  if (lens.world) out.push(", in a ", asSegment(lens.world, "fantastic"), " world, ");
  else out.push(", ");
  if (space) {
    // §5.5: the scale link is route names' ScaleChoice, drawn as there ("across ‹any scale›").
    const scale = scaleOf(state.scale, state.era);
    out.push("across ");
    out.push({
      field: "scale",
      text: scalePhrase(scale as ScaleChoice),
      title: scaleInfo(scale as ScaleChoice).tooltip,
      choices: scalesFor(state.era === "NF" || state.era === "IS" ? state.era : undefined).map((c) => ({ id: c, label: scaleInfo(c).label })),
      current: scale,
    });
  } else if (lens.region) {
    out.push(asSegment(lens.region, "region"));
  } else {
    out.push({
      field: "biome",
      text: wildsBiomeText(module, state.biome, catalogue),
      title: biomeLinkTitle(wildsBiomes(module, catalogue).find((b) => biomeMatches(b, state.biome)), "Weights the names towards a land's wildlife, plants and words"),
      choices: [{ id: undefined, label: wildsBiomeText(module, undefined, catalogue) }, ...biomeMenuItems(wildsBiomes(module, catalogue), (b) => `in ${b.phrase}`, biomeClashes([...catalogue.all, ...catalogue.space]))],
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
  const seriesText = wildsModuleData(module).seriesText;
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
export function chooseWilds(state: WildsSentenceState, field: WildsField, id: string | undefined, module: WildsLikeModule, catalogue: BiomeCatalogue = BUILT_IN_BIOMES): WildsSentenceState {
  let next: WildsSentenceState = { ...state };
  switch (field) {
    case "culture":
      next = chooseLens(module, next, "culture", id ?? wildsDefaultCulture(module));
      break;
    case "kindClass":
      // §6: choosing a class resets a kind outside it to Any; all (no class) leaves the kind alone.
      if (isPlaceClass(id)) next.kindClass = id;
      else delete next.kindClass;
      if (next.kind && !kindInClass(findWildsKind(module, next.kind) ?? {}, next.kindClass)) next.kind = undefined;
      break;
    case "kind":
      next.kind = id;
      break;
    case "era":
      next = chooseLens(module, next, "era", id, defaultWildsState(module).era);
      break;
    case "where":
      next.where = id === "new" || id === "settled" ? id : wildsDefaultWhere(module);
      // Place modules split brief §7: back to home country, a colonial tradition offered as a culture goes back to the module's default.
      if (next.where === "home" && findColonialCulture(next.culture)) next.culture = wildsDefaultCulture(module);
      break;
    case "scale":
      if (id && id !== "any") next.scale = id as ScaleChoice;
      else delete next.scale;
      break;
    case "fantastic":
      next = chooseLens(module, next, "fantastic", id);
      break;
    case "region":
      next = chooseLens(module, next, "region", id);
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
  if (next.biome && !wildsBiomes(module, catalogue).some((b) => biomeMatches(b, next.biome))) next.biome = undefined;
  // Stars and space (§5.5): a scale the era lacks resets to any; a kind with no group at the chosen scale resets to Any.
  if (isSpaceModule(module)) {
    if (next.scale && scaleOf(next.scale, next.era) === "any") delete next.scale;
    if (next.where !== "settled") next.where = "new";
    if (next.kind && next.scale && !kindScalesAt(findWildsKind(module, next.kind)?.sources, next.era).includes(next.scale as never)) next.kind = undefined;
  }
  return next;
}

/** §1.3: "{module} · {era} · {culture}", then new country, region or biome, kind, fantastic, tone, series. */
export function wildsHistoryLabel(module: WildsLikeModule, state: WildsSentenceState, moduleLabel: string, catalogue: BiomeCatalogue = BUILT_IN_BIOMES): string {
  const culture = lensCultureLabel(state.culture, findWildsCulture(state.culture)?.label ?? "General");
  const kind = findWildsKind(module, state.kind);
  const regionShown = showsWildsRegion(module, state.culture, state.where);
  const biome = wildsBiomes(module, catalogue).find((b) => biomeMatches(b, state.biome));
  return [
    moduleLabel,
    wildsEraLabel(state.era),
    culture,
    ...(isSpaceModule(module) ? (state.where === "settled" ? ["settled space"] : ["new space"]) : state.where === "new" ? ["new country"] : state.where === "settled" ? ["settled lands"] : []),
    ...(isSpaceModule(module) && state.scale && state.scale !== "any" ? [scaleLabel(state.scale).toLowerCase()] : []),
    ...(regionShown && state.region ? [regionPhrase(state.region)] : []),
    ...(!regionShown && biome ? [biome.label] : []),
    ...(kind ? [kind.plural] : state.kindClass ? [state.kindClass] : []),
    ...(state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(state.series ? ["series"] : []),
  ].join(" · ");
}
