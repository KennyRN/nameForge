// The seas and coasts sentences (docs/seas-and-coasts-brief.md §2): "‹Norman & British› ‹waters of
// any kind› of the ‹medieval› era, ‹on home shores›, in a ‹realistic› world, ‹across all of
// Britain›, ‹of any tone›, with ‹placeholders for› people and places", and for hyperspace "‹General›
// ‹hyperspace features of any kind› across ‹any scale›, where hyperspace flows ‹like the sea›,
// ‹in any words›, ‹of any tone›, with ‹placeholders for› people". Built as segments like the route
// sentence. No Obsidian imports.

import { BIOMES } from "../biomes";
import { regionPhrase } from "../colonialSentence";
import { type GroupPeople, type GroupToneChoice, GROUP_TONES, TONE_PHRASES } from "../groups/engine";
import { PLACE_SHAPE_REGIONS } from "../placeShapes";
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

export interface WatersSentenceState {
  culture: string;
  /** A kind key; undefined is Any. */
  kind?: string;
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

export type WatersField = "culture" | "kind" | "era" | "where" | "fantastic" | "region" | "biome" | "tone" | "people" | "series" | "scale" | "medium" | "register";

export interface WatersChoice {
  id: string | undefined;
  label: string;
  title?: string;
  /** A menu heading shown before this choice. */
  group?: string;
}

export type WatersSegment = string | { field: WatersField; text: string; title: string; choices: WatersChoice[]; current: string | undefined };

const PEOPLE_TEXT: Record<GroupPeople, string> = { placeholders: "placeholders for", invented: "invented" };
const WHERE_TEXT: Record<WatersWhere, string> = { home: "on home shores", new: "on newly charted shores" };
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
export const watersBiomeText = (biome: string | undefined) => {
  const found = BIOMES.find((b) => b.id === biome);
  return found ? `in ${found.phrase}` : "in any land";
};

const hyperScales = (): ScaleChoice[] => ["any", ...HYPER_SCALES];

export function watersSentence(state: WatersSentenceState, module: WatersModule): WatersSegment[] {
  const out: WatersSegment[] = [];
  const hyper = module === "hyperspaceCharts";
  const culture = findWatersCulture(state.culture) ?? WATERS_CULTURES[0];
  out.push({
    field: "culture",
    text: culture.label,
    title: `Naming culture: whose customs the ${NOUN[module]} follow`,
    choices: WATERS_CULTURES.map((c, i) => ({ id: c.key, label: c.label, ...(c.group && c.group !== WATERS_CULTURES[i - 1]?.group ? { group: c.group } : {}) })),
    current: culture.key,
  });
  out.push(" ");
  const kinds = hyper ? hyperKindsAt(state.scale) : waterKinds(module);
  const kind = kinds.find((k) => k.key === state.kind);
  const any = hyper ? HYPER_ANY : waterAny(module);
  out.push({
    field: "kind",
    text: kind ? kind.plural : any,
    title: kind ? kind.menu : any.charAt(0).toUpperCase() + any.slice(1),
    choices: [{ id: undefined, label: "Any" }, ...kinds.map((k) => ({ id: k.key, label: k.menu }))],
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
    const eras = waterEras(module);
    out.push(" of the ");
    out.push({
      field: "era",
      text: watersEraLabel(state.era),
      title: "The age: decides which names exist",
      choices: eras.map((e) => ({ id: e, label: watersEraLabel(e) })),
      current: state.era,
    });
    out.push(" era, ");
    out.push({
      field: "where",
      text: WHERE_TEXT[state.where],
      title: "Home shores: a people naming its own coast. New shores: explorers naming a coast they have just reached",
      choices: (["home", "new"] as WatersWhere[]).map((w) => ({ id: w, label: WHERE_TEXT[w] })),
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
    if (showsWatersRegion(state.culture, state.where)) {
      out.push({
        field: "region",
        text: watersRegionText(state.region),
        title: "Weights the names towards a region's customs",
        choices: [
          { id: undefined, label: watersRegionText(undefined) },
          ...PLACE_SHAPE_REGIONS.map((r) => ({ id: r.code, label: watersRegionText(r.code), title: r.counties })),
        ],
        current: state.region,
      });
    } else {
      out.push({
        field: "biome",
        text: watersBiomeText(state.biome),
        title: "Weights the names towards a land's waters and wildlife",
        choices: [{ id: undefined, label: watersBiomeText(undefined) }, ...BIOMES.map((b) => ({ id: b.id, label: watersBiomeText(b.id) }))],
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
  const next: WatersSentenceState = { ...state };
  const hyper = module === "hyperspaceCharts";
  const regionShown = showsWatersRegion(state.culture, state.where);
  switch (field) {
    case "culture":
      next.culture = id ?? defaultWatersState(module).culture;
      break;
    case "kind":
      next.kind = id;
      break;
    case "era":
      next.era = !hyper && waterEras(module).includes(id as WatersEra) ? (id as WatersEra) : defaultWatersState(module).era;
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
export function watersHistoryLabel(module: WatersModule, state: WatersSentenceState, moduleLabel: string): string {
  const culture = findWatersCulture(state.culture)?.label ?? "General";
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
  const biome = BIOMES.find((b) => b.id === state.biome);
  return [
    moduleLabel,
    watersEraLabel(state.era),
    culture,
    ...(state.where === "new" ? ["new shores"] : []),
    ...(regionShown && state.region ? [regionPhrase(state.region)] : []),
    ...(!regionShown && biome ? [biome.label] : []),
    ...(kind ? [kind.plural] : []),
    ...(state.fantastic ? [fantasticWords(state.era)[1]] : []),
    ...(state.tone !== "any" ? [state.tone] : []),
    ...(state.series && watersHasSeries(module) ? ["series"] : []),
  ].join(" · ");
}
