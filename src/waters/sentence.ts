// The seas and coasts sentences (docs/seas-and-coasts-brief.md §2): "‹Norman & British› ‹waters of
// any kind› of the ‹medieval› era, ‹on home shores›, in a ‹realistic› world, ‹across all of
// Britain›, ‹of any tone›, with ‹placeholders for› people and places", and for hyperspace "‹General›
// ‹hyperspace features of any kind› across ‹any scale›, where hyperspace flows ‹like the sea›,
// ‹in any words›, ‹of any tone›, with ‹placeholders for› people". Built as segments like the route
// sentence. No Obsidian imports.

import { findColonialCulture } from "../places/colonialCultures";
import { lensCultureLabel } from "../lens";
import { registerRoster } from "../lensRosters";
import { asSegment, chooseLens } from "../lensSentence";
import { lensClause } from "../lensView";
import { type BiomeCatalogue, biomeMatches, biomesRootedIn, BUILT_IN_BIOMES } from "../biomes";
import { biomeClashes, biomeLinkTitle, biomeMenuItems } from "../biomeMenus";
import { regionPhrase } from "../colonialSentence";
import { type GroupPeople, type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { PLACE_SHAPE_REGIONS } from "../placeShapes";
import { classSegment, isPlaceClass, kindInClass, type PlaceClass } from "../places/classes";
import { fantasticWords } from "../routes/sentence";
import { scaleInfo, scaleLabel, scalePhrase, type ScaleChoice } from "../space/scale";
import {
  findHyperKind,
  findWatersCulture,
  findWaterKind,
  HYPER_ANY,
  HYPER_SCALES,
  hyperKindsAt,
  showsWatersRegion,
  waterAny,
  waterEras,
  waterKinds,
  watersEraLabel,
  watersHasSeries,
  WATERS_CULTURES,
  WATERS_MEDIA,
  WATERS_REGISTERS,
  type HyperMedium,
  type HyperRegister,
  type WatersEra,
  type WatersModule,
  type WatersWhere,
} from "./engine";

registerRoster("waters", WATERS_CULTURES);

export interface WatersSentenceState {
  culture: string;
  /** A kind key; undefined is Any. */
  kind?: string;
  /** Place modules split brief §6: the class link; undefined is all. Only set when a class is chosen, so old states and presets are unchanged. */
  kindClass?: PlaceClass;
  era: WatersEra;
  where: WatersWhere;
  fantastic: boolean;
  /** A place-shape region code; undefined is all of Britain. */
  region?: string;
  /** A biome id; undefined is any land. */
  biome?: string;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: boolean;
  /** Hyperspace only; absent means any. */
  scale?: ScaleChoice;
  medium: HyperMedium;
  register: HyperRegister;
}

export function defaultWatersState(module: WatersModule): WatersSentenceState {
  return {
    culture: module === "hyperspaceCharts" ? "general" : "norman-british",
    era: "MD",
    where: "home",
    fantastic: false,
    tone: "any",
    people: "placeholders",
    series: false,
    scale: "any",
    medium: "sea",
    register: "any",
  };
}

export type WatersField = "culture" | "kindClass" | "kind" | "era" | "where" | "fantastic" | "region" | "biome" | "tone" | "people" | "series" | "scale" | "medium" | "register";

export interface WatersChoice {
  id: string | undefined;
  label: string;
  title?: string;
  /** The tooltip of a pack's entry ("Your version: …", "Your biome: …"). */
  tip?: string;
  /** A disabled menu heading shown before this choice ("Your biomes"). */
  heading?: string;
  /** A menu heading shown before this choice. */
  group?: string;
}

export type WatersSegment = string | { field: WatersField; text: string; title: string; choices: WatersChoice[]; current: string | undefined; fixed?: boolean };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const WHERE_TEXT: Record<WatersWhere, string> = { home: "on home shores", new: "on newly explored shores", settled: "on settled shores" };
const SERIES_TEXT: Record<WatersModule, { off: string; on: string }> = {
  seasLakes: { off: "each one separate", on: "each one separate" },
  coastsIslands: { off: "each one separate", on: "along one stretch of coast" },
  seaCharts: { off: "each one separate", on: "on one chart" },
  hyperspaceCharts: { off: "each one separate", on: "on one chart" },
};
const NOUN: Record<WatersModule, string> = { seasLakes: "waters", coastsIslands: "coast features", seaCharts: "chart features", hyperspaceCharts: "hyperspace features" };

/** §2.2: "across all of Britain", or "in the North". */
export const watersRegionText = (region: string | undefined) => (region ? `in ${regionPhrase(region)}` : "across all of Britain");
/** §2.2: "in any land", or "in the highlands". */
export const watersBiomeText = (biome: string | undefined, catalogue: BiomeCatalogue = BUILT_IN_BIOMES) => {
  const found = biomesRootedIn(catalogue).find((b) => biomeMatches(b, biome));
  return found ? `in ${found.phrase}` : "in any land";
};

const hyperScales = (): ScaleChoice[] => ["any", ...HYPER_SCALES];

export function watersSentence(state: WatersSentenceState, module: WatersModule, catalogue: BiomeCatalogue = BUILT_IN_BIOMES): WatersSegment[] {
  const out: WatersSegment[] = [];
  const hyper = module === "hyperspaceCharts";
  // Hyperspace charts have no era or world and keep their own culture link; the others share the lens clause.
  const lens = hyper ? undefined : lensClause(module, state, { cultureTitle: `Naming culture: whose customs the ${NOUN[module]} follow` });
  const culture = findWatersCulture(state.culture) ?? WATERS_CULTURES[0];
  out.push(
    lens
      ? asSegment(lens.culture!, "culture")
      : {
          field: "culture",
          text: culture.label,
          title: `Naming culture: whose customs the ${NOUN[module]} follow`,
          choices: WATERS_CULTURES.map((c, i) => ({ id: c.key, label: c.label, ...(c.group && c.group !== WATERS_CULTURES[i - 1]?.group ? { group: c.group } : {}) })),
          current: culture.key,
        },
  );
  out.push(" ");
  const kinds = hyper ? hyperKindsAt(state.scale) : waterKinds(module);
  const kind = kinds.find((k) => k.key === state.kind);
  const any = hyper ? HYPER_ANY : waterAny(module);
  const classLink = hyper ? undefined : classSegment(module, state.kindClass);
  if (classLink) out.push(classLink, " ");
  // §6: the menu keeps the kinds of the chosen class; a stored kind outside it is shown and kept.
  // Place modules split brief §5.4: lakes moved to rivers and inland waters, so seas and bays no longer offers the kind; a stored lake is still shown and kept, and still runs.
  const offered = (hyper ? kinds : kinds.filter((k) => kindInClass(k as { class?: string }, state.kindClass) || k.key === kind?.key)).filter((k) => module !== "seasLakes" || k.key !== "lake" || k.key === kind?.key);
  out.push({
    field: "kind",
    text: kind ? kind.plural : any,
    title: kind ? kind.menu : any.charAt(0).toUpperCase() + any.slice(1),
    choices: [{ id: undefined, label: "Any" }, ...offered.map((k) => ({ id: k.key, label: k.menu }))],
    current: kind?.key,
  });
  if (hyper) {
    const scale = state.scale && hyperScales().includes(state.scale) ? state.scale : "any";
    out.push(" across ");
    out.push({
      field: "scale",
      text: scalePhrase(scale),
      title: scaleInfo(scale).tooltip,
      choices: hyperScales().map((c) => ({ id: c, label: scaleInfo(c).label })),
      current: scale,
    });
    out.push(", where hyperspace flows ");
    const medium = WATERS_MEDIA.find((m) => m.id === state.medium) ?? WATERS_MEDIA[0];
    out.push({
      field: "medium",
      text: medium.text,
      title: "Like the sea: bores, spills and dead water. Like the wind: shocks, rarefactions and squalls",
      choices: WATERS_MEDIA.map((m) => ({ id: m.id, label: m.text })),
      current: medium.id,
    });
    out.push(", ");
    const register = WATERS_REGISTERS.find((r) => r.id === state.register) ?? WATERS_REGISTERS[0];
    out.push({
      field: "register",
      text: register.text,
      title: "Who is speaking: spacers, the chart, or the survey office",
      choices: WATERS_REGISTERS.map((r) => ({ id: r.id, label: r.text })),
      current: register.id,
    });
    out.push(", ");
  } else {
    if (lens!.era) out.push(" of the ", asSegment(lens!.era, "era"), " era, ");
    else out.push(" ");
    out.push({
      field: "where",
      text: WHERE_TEXT[state.where],
      title: "Home shores: a people naming its own coast. New shores: explorers naming a coast they have just reached. Settled shores: a dominant culture naming a coast within a peopled land",
      choices: (["home", "new", "settled"] as WatersWhere[]).map((w) => ({ id: w, label: WHERE_TEXT[w] })),
      current: state.where,
    });
    if (lens!.world) out.push(", in a ", asSegment(lens!.world, "fantastic"), " world, ");
    else out.push(", ");
    if (lens!.region) {
      out.push(asSegment(lens!.region, "region"));
    } else {
      out.push({
        field: "biome",
        text: watersBiomeText(state.biome, catalogue),
        title: biomeLinkTitle(biomesRootedIn(catalogue).find((b) => biomeMatches(b, state.biome)), "Weights the names towards a land's waters and wildlife"),
        choices: [{ id: undefined, label: watersBiomeText(undefined, catalogue) }, ...biomeMenuItems(biomesRootedIn(catalogue), (b) => `in ${b.phrase}`, biomeClashes([...catalogue.all, ...catalogue.space]))],
        current: state.biome,
      });
    }
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
    title: "Placeholders like [place], or invented names",
    choices: (["placeholders", "invented"] as GroupPeople[]).map((p) => ({ id: p, label: PEOPLE_TEXT[p] })),
    current: state.people,
  });
  out.push(hyper ? " people" : " people and places");
  if (watersHasSeries(module)) {
    out.push(", ");
    const text = SERIES_TEXT[module];
    out.push({
      field: "series",
      text: state.series ? text.on : text.off,
      title: "Names that share one place or person, like the features of one stretch of coast",
      choices: [
        { id: "off", label: text.off },
        { id: "on", label: text.on },
      ],
      current: state.series ? "on" : "off",
    });
  }
  return out;
}

/** GN §2.6: the sentence as plain text. */
export function watersSentenceText(segments: WatersSegment[]): string {
  const text = segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** §2.4: a state after one choice, with the resets that follow from it. */
export function chooseWaters(state: WatersSentenceState, field: WatersField, id: string | undefined, module: WatersModule): WatersSentenceState {
  let next: WatersSentenceState = { ...state };
  const hyper = module === "hyperspaceCharts";
  const regionShown = showsWatersRegion(state.culture, state.where);
  switch (field) {
    case "culture":
      next = hyper ? { ...next, culture: id ?? defaultWatersState(module).culture } : chooseLens(module, next, "culture", id ?? defaultWatersState(module).culture);
      break;
    case "kindClass":
      // §6: choosing a class resets a kind outside it to Any; all (no class) leaves the kind alone.
      if (!hyper && isPlaceClass(id)) next.kindClass = id;
      else delete next.kindClass;
      if (next.kind && !hyper && !kindInClass(findWaterKind(module, next.kind) ?? {}, next.kindClass)) next.kind = undefined;
      break;
    case "kind":
      next.kind = id;
      break;
    case "era":
      next = hyper ? { ...next, era: defaultWatersState(module).era } : chooseLens(module, next, "era", id, defaultWatersState(module).era);
      break;
    case "where":
      next.where = id === "new" || id === "settled" ? id : "home";
      // Place modules split brief §7: back to home shores, a colonial tradition offered as a culture goes back to the module's default.
      if (next.where === "home" && findColonialCulture(next.culture)) next.culture = "norman-british";
      break;
    case "fantastic":
      next = hyper ? { ...next, fantastic: id === "on" } : chooseLens(module, next, "fantastic", id);
      break;
    case "region":
      next = hyper ? { ...next, region: id } : chooseLens(module, next, "region", id);
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
    case "scale":
      next.scale = hyperScales().includes(id as ScaleChoice) ? (id as ScaleChoice) : "any";
      break;
    case "medium":
      next.medium = WATERS_MEDIA.some((m) => m.id === id) ? (id as HyperMedium) : "sea";
      break;
    case "register":
      next.register = WATERS_REGISTERS.some((r) => r.id === id) ? (id as HyperRegister) : "any";
      break;
  }
  // §2.4: a kind not offered after an era or scale change resets to Any.
  const offered = hyper ? hyperKindsAt(next.scale) : waterKinds(module);
  if (next.kind && !offered.some((k) => k.key === next.kind)) next.kind = undefined;
  // §2.4: region resets away from the British cultures and new shores; biome resets when region shows again.
  const shown = !hyper && showsWatersRegion(next.culture, next.where);
  if (!shown) next.region = undefined;
  if (shown && !regionShown) next.biome = undefined;
  if (hyper) {
    next.region = undefined;
    next.biome = undefined;
  }
  return next;
}

/** §1.3: "{module} · {era} · {culture}…", and for hyperspace "{module} · {scale} · {culture}…". */
export function watersHistoryLabel(module: WatersModule, state: WatersSentenceState, moduleLabel: string, catalogue: BiomeCatalogue = BUILT_IN_BIOMES): string {
  const own = findWatersCulture(state.culture)?.label ?? "General";
  // Hyperspace charts keep their own culture link, so their rows keep its labels.
  const culture = module === "hyperspaceCharts" ? own : lensCultureLabel(state.culture, own);
  if (module === "hyperspaceCharts") {
    const kind = findHyperKind(state.kind);
    const register = WATERS_REGISTERS.find((r) => r.id === state.register);
    return [
      moduleLabel,
      scaleLabel(state.scale ?? "any"),
      culture,
      ...(state.register !== "any" && register ? [register.label] : []),
      ...(state.medium === "wind" ? ["like the wind"] : state.medium === "both" ? ["sea or wind"] : []),
      ...(kind ? [kind.plural] : []),
      ...(state.tone !== "any" ? [state.tone] : []),
      ...(state.series ? ["series"] : []),
    ].join(" · ");
  }
  const kind = findWaterKind(module, state.kind);
  const regionShown = showsWatersRegion(state.culture, state.where);
  const biome = biomesRootedIn(catalogue).find((b) => biomeMatches(b, state.biome));
  return [
    moduleLabel,
    watersEraLabel(state.era),
    culture,
    ...(state.where === "new" ? ["new shores"] : state.where === "settled" ? ["settled shores"] : []),
    ...(regionShown && state.region ? [regionPhrase(state.region)] : []),
    ...(!regionShown && biome ? [biome.label] : []),
    ...(kind ? [kind.plural] : state.kindClass ? [state.kindClass] : []),
    ...(state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(state.series && watersHasSeries(module) ? ["series"] : []),
  ].join(" · ");
}
