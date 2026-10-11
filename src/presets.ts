// Module presets (Presets brief §7.2, Group brief §13): a module's setup saved as a note that runs
// as-is. Tribes and kin groups and the group-name modules have their own preset type; place-name
// presets are recipes (Presets brief §7.1).
// No Obsidian imports: the frontmatter is flat `key: value` lines.

import { findBiome, TERRAIN_CHOICES } from "./biomes";
import { findTradition, TRIBAL_GROUP_TYPES, TRIBAL_PERSPECTIVES, TRIBAL_REGISTERS } from "./tribes/engine";
import { type TribalSlotFields, tribalSlotFill } from "./tribes/slotFill";
import {
  BYNAME_CULTURES,
  type BynameGender,
  type BynameLanguage,
  type BynameLength,
  type BynameModule,
  type BynameSource,
  moduleKinds,
} from "./bynames/engine";
import { namedForOffered, REALM_CHARACTERS, REALM_CULTURES, REALM_ERAS, type RealmLength, type RealmNamedFor, type RealmOutput } from "./realms/engine";
import { findRouteCulture, findRouteKind, kindsOffered, ROUTE_ERAS, routeEraLabel, type RouteEra } from "./routes/engine";
import { PLACE_SHAPE_REGIONS } from "./placeShapes";
import { INN_KINDS, INN_SETTINGS, type InnForm, type InnKind, type InnSetting } from "./inns/engine";
import { BUILDING_KINDS, type BuildingKind } from "./buildings/engine";
import { EVENT_KINDS, EVENT_SCALES, type EventKind, type EventScale } from "./events/engine";
import { KIT_CONTENTS, KIT_DETAILS, KIT_POSITIONS, KIT_SIZES, type KitContents, type KitDetail, type KitPosition, type KitSize } from "./settlement/kit";
import { STREET_FUNCTIONS, STREET_KINDS, STREET_SIZES, type StreetDialect, type StreetKind, type StreetSize } from "./streets/engine";
import { availableStyles, findVesselCulture, VESSEL_DATA, moduleFunctions, techChoices, type VesselModule } from "./vessels/engine";
import { findCommodity, findFamily, GROUP_TONES, groupSetting, type GroupForm, type GroupFront, type GroupGenre, type GroupPeople, type GroupToneChoice } from "./groups/engine";

export const TRIBAL_PRESET_MODULE = "tribal-names";

export interface TribalPreset {
  packName: string;
  setting: string;
  description: string;
  tradition: string;
  /** "homeland", a built-in biome id, or a biome pack link "[[Salt Marshes]]". */
  biome: string;
  /** The local tribal sentence's terrain choice (§7.2: "store them too"). */
  terrain: string;
  register: string;
  groupType: string;
  perspective: string;
  hostile: boolean;
}

export const TRIBAL_PRESET_DEFAULTS: Omit<TribalPreset, "packName" | "setting" | "description"> = {
  tradition: "general",
  biome: "homeland",
  terrain: "any",
  register: "plain",
  groupType: "any",
  perspective: "any",
  hostile: false,
};

const FRONTMATTER = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

/** The frontmatter's flat fields, unquoted. */
function fields(content: string): { values: Record<string, string>; body: string } | undefined {
  const fm = content.match(FRONTMATTER);
  if (!fm) return undefined;
  const values: Record<string, string> = {};
  for (const line of fm[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (m) values[m[1]] = m[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
  return { values, body: content.slice(fm[0].length) };
}

export function isModulePresetContent(content: string): boolean {
  return fields(content)?.values.type === "module-preset";
}

/** §7.2: a preset's values; unknown values are reported and take their defaults. */
export function parseModulePreset(
  content: string,
  fileName: string,
): { preset?: TribalPreset; group?: GroupPreset; byname?: BynamePreset; vessel?: VesselPreset; realm?: RealmPreset; route?: RoutePreset; street?: StreetPreset; inn?: InnPreset; building?: BuildingPreset; kit?: KitPreset; event?: EventPreset; problems: string[] } {
  const parsed = fields(content);
  const problems: string[] = [];
  if (!parsed || parsed.values.type !== "module-preset") return { problems: ["This note isn't a module preset."] };
  const { values, body } = parsed;
  // Group brief §13: group-name presets sit beside tribal ones.
  if (values.module === GROUP_PRESET_MODULE) return parseGroupPreset(values, body, fileName);
  // Bynames brief §12: byname presets too.
  if (values.module === BYNAME_PRESET_MODULE) return parseBynamePreset(values, body, fileName);
  // Ships brief §15: vessel presets too.
  if (values.module === VESSEL_PRESET_MODULE) return parseVesselPreset(values, body, fileName);
  // Realms brief §13: realm presets too.
  if (values.module === REALM_PRESET_MODULE) return parseRealmPreset(values, body, fileName);
  // Route names brief §13: route presets too.
  if (values.module === ROUTE_PRESET_MODULE) return parseRoutePreset(values, body, fileName);
  // Streets brief §14: street presets too.
  if (values.module === STREET_PRESET_MODULE) return parseStreetPreset(values, body, fileName);
  // Inns brief §13: inn presets too.
  if (values.module === INN_PRESET_MODULE) return parseInnPreset(values, body, fileName);
  // Buildings brief §13: building presets too.
  if (values.module === BUILDING_PRESET_MODULE) return parseBuildingPreset(values, body, fileName);
  // Settlement kit §11: kit presets too.
  if (values.module === KIT_PRESET_MODULE) return parseKitPreset(values, body, fileName);
  // Events brief §12: event presets too.
  if (values.module === EVENT_PRESET_MODULE) return parseEventPreset(values, body, fileName);
  if (values.module !== TRIBAL_PRESET_MODULE) {
    problems.push(`Unknown module “${values.module ?? ""}”.`);
    return { problems };
  }
  const d = TRIBAL_PRESET_DEFAULTS;
  const pick = (key: string, fallback: string, ok: (v: string) => boolean): string => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const hostileRaw = values.hostile;
  let hostile = d.hostile;
  if (hostileRaw === "true" || hostileRaw === "false") hostile = hostileRaw === "true";
  else if (hostileRaw) problems.push(`Unknown hostile “${hostileRaw}”.`);
  return {
    preset: {
      packName: values.packName || fileName,
      setting: values.setting ?? "",
      description: body.trim(),
      tradition: pick("tradition", d.tradition, (v) => !!findTradition(v)),
      biome: pick("biome", d.biome, (v) => v === "homeland" || !!findBiome(v) || /^\[\[.+\]\]$/.test(v)),
      terrain: pick("terrain", d.terrain, (v) => TERRAIN_CHOICES.some((t) => t.id === v) || /^[a-z0-9-]+$/.test(v)),
      register: pick("register", d.register, (v) => (TRIBAL_REGISTERS as readonly string[]).includes(v)),
      groupType: pick("groupType", d.groupType, (v) => v === "any" || TRIBAL_GROUP_TYPES.some((g) => g.key === v)),
      perspective: pick("perspective", d.perspective, (v) => v === "any" || TRIBAL_PERSPECTIVES.includes(v)),
      hostile,
    },
    problems,
  };
}

/** §7.2: the note for a preset, every key written. */
export function modulePresetContent(preset: TribalPreset | GroupPreset | BynamePreset | VesselPreset | RealmPreset | RoutePreset | StreetPreset | InnPreset | BuildingPreset | KitPreset | EventPreset): string {
  if ("eventKind" in preset) return eventPresetContent(preset);
  if ("contents" in preset) return kitPresetContent(preset);
  if ("buildingKind" in preset) return buildingPresetContent(preset);
  if ("innKind" in preset) return innPresetContent(preset);
  if ("streetKind" in preset) return streetPresetContent(preset);
  if ("routeKind" in preset) return routePresetContent(preset);
  if ("namedFor" in preset) return realmPresetContent(preset);
  if ("vesselModule" in preset) return vesselPresetContent(preset);
  if ("bynameModule" in preset) return bynamePresetContent(preset);
  if ("family" in preset) return groupPresetContent(preset);
  const quote = (v: string) => (/^\[\[|[:#]/.test(v) ? `"${v}"` : v);
  return [
    "---",
    "type: module-preset",
    `module: ${TRIBAL_PRESET_MODULE}`,
    `packName: ${preset.packName}`,
    `setting: ${preset.setting}`,
    `tradition: ${preset.tradition}`,
    `biome: ${quote(preset.biome)}`,
    `terrain: ${preset.terrain}`,
    `register: ${preset.register}`,
    `groupType: ${preset.groupType}`,
    `perspective: ${preset.perspective}`,
    `hostile: ${preset.hostile}`,
    "---",
    "",
    preset.description.trim(),
    "",
  ].join("\n");
}

// ── Group-name presets (Group brief §13) ────────────────────────────────────

export const GROUP_PRESET_MODULE = "group-names";

export interface GroupPreset {
  packName: string;
  setting: string;
  description: string;
  family: string;
  tradition: string;
  /** "any" or a type key of the family. */
  groupType: string;
  genre: GroupGenre;
  fantastic: boolean;
  form: GroupForm;
  front: GroupFront;
  people: GroupPeople;
  /** Tone brief §6.2: older presets without these keys load as "any" and false. */
  tone: GroupToneChoice;
  series: boolean;
  /** Companies brief §10: trade family only; older presets without the key load as "any". */
  commodity?: string;
}

function parseGroupPreset(values: Record<string, string>, body: string, fileName: string): { group?: GroupPreset; problems: string[] } {
  const problems: string[] = [];
  const family = findFamily(values.family ?? "");
  if (!family) {
    problems.push(`Unknown family “${values.family ?? ""}”.`);
    return { problems };
  }
  const pick = <T extends string>(key: string, fallback: T, ok: (v: string) => boolean): T => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v as T;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const flag = (key: string): boolean => {
    const v = values[key];
    if (v === "true" || v === "false") return v === "true";
    if (v) problems.push(`Unknown ${key} “${v}”.`);
    return false;
  };
  const groupType = pick("groupType", "any", (v) => v === "any" || family.types.some((t) => t.key === v));
  let series = flag("series");
  // Tone brief §6.2: a series needs a type; with Any the preset runs as separate names.
  if (series && groupType === "any") {
    problems.push("Series needs a type.");
    series = false;
  }
  const genre = pick<GroupGenre>("genre", "fantasy", (v) => ["fantasy", "modern", "scifi"].includes(v));
  const fantastic = flag("fantastic");
  // Companies brief §10: a commodity the preset's setting lacks runs as "any".
  let commodity: string | undefined;
  if (family.key === "trade") {
    commodity = pick("commodity", "any", (v) => v === "any" || !!findCommodity(v));
    if (commodity !== "any" && !findCommodity(commodity)!.settings.includes(groupSetting(genre, genre === "scifi" ? false : fantastic))) {
      problems.push(`Commodity “${commodity}” isn't available here.`);
      commodity = "any";
    }
  }
  return {
    group: {
      packName: values.packName || fileName,
      setting: values.setting ?? "",
      description: body.trim(),
      family: family.key,
      tradition: pick("tradition", "general", (v) => !!findTradition(v)),
      groupType,
      genre,
      fantastic,
      form: pick<GroupForm>("form", "any", (v) => ["any", "formal", "everyday"].includes(v)),
      front: pick<GroupFront>("front", "say", (v) => ["say", "hide", "may"].includes(v)),
      people: pick<GroupPeople>("people", "placeholders", (v) => ["placeholders", "invented"].includes(v)),
      tone: pick<GroupToneChoice>("tone", "any", (v) => v === "any" || (GROUP_TONES as string[]).includes(v)),
      series,
      ...(commodity !== undefined ? { commodity } : {}),
    },
    problems,
  };
}

function groupPresetContent(preset: GroupPreset): string {
  return [
    "---",
    "type: module-preset",
    `module: ${GROUP_PRESET_MODULE}`,
    `family: ${preset.family}`,
    `packName: ${preset.packName}`,
    `setting: ${preset.setting}`,
    `tradition: ${preset.tradition}`,
    `groupType: ${preset.groupType}`,
    `genre: ${preset.genre}`,
    `fantastic: ${preset.fantastic}`,
    `form: ${preset.form}`,
    `front: ${preset.front}`,
    `people: ${preset.people}`,
    `tone: ${preset.tone}`,
    `series: ${preset.series}`,
    ...(preset.family === "trade" ? [`commodity: ${preset.commodity ?? "any"}`] : []),
    "---",
    "",
    preset.description.trim(),
    "",
  ].join("\n");
}

// ── Byname presets (Bynames brief §12) ──────────────────────────────────────

export const BYNAME_PRESET_MODULE = "bynames";

export interface BynamePreset {
  packName: string;
  setting: string;
  description: string;
  bynameModule: BynameModule;
  culture: string;
  kind: string;
  genre: GroupGenre;
  fantastic: boolean;
  tone: GroupToneChoice;
  language: BynameLanguage;
  gender: BynameGender;
  length: BynameLength;
  source: BynameSource;
  /** The pack's name, with source "pack". */
  pack?: string;
  /** A heading, "gender" or "whole". */
  section: string;
}

function parseBynamePreset(values: Record<string, string>, body: string, fileName: string): { byname?: BynamePreset; problems: string[] } {
  const problems: string[] = [];
  const module = values.bynameModule as BynameModule;
  if (!["epithets", "titles", "familyNames"].includes(module)) {
    problems.push(`Unknown bynameModule “${values.bynameModule ?? ""}”.`);
    return { problems };
  }
  const pick = <T extends string>(key: string, fallback: T, ok: (v: string) => boolean): T => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v as T;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const fantasticRaw = values.fantastic;
  if (fantasticRaw && fantasticRaw !== "true" && fantasticRaw !== "false") problems.push(`Unknown fantastic “${fantasticRaw}”.`);
  const culture = pick("culture", "general", (v) => BYNAME_CULTURES.some((c) => c.key === v));
  return {
    byname: {
      packName: values.packName || fileName,
      setting: values.setting ?? "",
      description: body.trim(),
      bynameModule: module,
      culture,
      kind: pick("kind", "any", (v) => v === "any" || moduleKinds(module).some((k) => k.key === v)),
      genre: pick<GroupGenre>("genre", "fantasy", (v) => ["fantasy", "modern", "scifi"].includes(v)),
      fantastic: fantasticRaw === "true",
      tone: pick<GroupToneChoice>("tone", "any", (v) => v === "any" || (GROUP_TONES as string[]).includes(v)),
      language: pick<BynameLanguage>("language", "english", (v) => ["english", "native", "mixed"].includes(v)),
      gender: pick<BynameGender>("gender", "anyone", (v) => ["men", "women", "anyone"].includes(v)),
      length: pick<BynameLength>("length", "single", (v) => ["single", "full"].includes(v)),
      source: pick<BynameSource>("source", "placeholder", (v) => ["placeholder", "pack", "none"].includes(v)),
      ...(values.pack ? { pack: values.pack.replace(/^\[\[|\]\]$/g, "") } : {}),
      section: values.section || "gender",
    },
    problems,
  };
}

function bynamePresetContent(preset: BynamePreset): string {
  return [
    "---",
    "type: module-preset",
    `module: ${BYNAME_PRESET_MODULE}`,
    `bynameModule: ${preset.bynameModule}`,
    `packName: ${preset.packName}`,
    `setting: ${preset.setting}`,
    `culture: ${preset.culture}`,
    `kind: ${preset.kind}`,
    `genre: ${preset.genre}`,
    `fantastic: ${preset.fantastic}`,
    `tone: ${preset.tone}`,
    `language: ${preset.language}`,
    `gender: ${preset.gender}`,
    `length: ${preset.length}`,
    `source: ${preset.source}`,
    ...(preset.pack ? [`pack: ${preset.pack}`] : []),
    `section: ${preset.section}`,
    "---",
    "",
    preset.description.trim(),
    "",
  ].join("\n");
}

// ── Realm presets (Realms brief §13) ────────────────────────────────────────

export const REALM_PRESET_MODULE = "realms";

export interface RealmPreset {
  packName: string;
  setting: string;
  description: string;
  culture: string;
  /** "any" or a character key. */
  character: string;
  era: string;
  genre: GroupGenre;
  fantastic: boolean;
  namedFor: RealmNamedFor;
  /** "homeland" or a biome id. */
  biome: string;
  terrain: string;
  tone: GroupToneChoice;
  length: RealmLength;
  output: RealmOutput;
  people: GroupPeople;
}

function parseRealmPreset(values: Record<string, string>, body: string, fileName: string): { realm?: RealmPreset; problems: string[] } {
  const problems: string[] = [];
  const pick = <T extends string>(key: string, fallback: T, ok: (v: string) => boolean): T => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v as T;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const flag = (key: string): boolean => {
    const v = values[key];
    if (v === "true" || v === "false") return v === "true";
    if (v) problems.push(`Unknown ${key} “${v}”.`);
    return false;
  };
  const era = pick("era", "medieval", (v) => REALM_ERAS.some((e) => e.key === v));
  let namedFor = pick<RealmNamedFor>("namedFor", "anything", (v) => ["anything", "land", "place", "dynasty", "people", "stars"].includes(v));
  // §13: the stars need a future era; the preset runs as anything.
  if (namedFor === "stars" && !namedForOffered("stars", era)) {
    problems.push("“The stars” needs the near-future or interstellar era.");
    namedFor = "anything";
  }
  return {
    realm: {
      packName: values.packName || fileName,
      setting: values.setting ?? "",
      description: body.trim(),
      culture: pick("culture", "general", (v) => REALM_CULTURES.some((c) => c.key === v)),
      character: pick("character", "any", (v) => v === "any" || REALM_CHARACTERS.some((c) => c.key === v)),
      era,
      genre: pick<GroupGenre>("genre", "fantasy", (v) => ["fantasy", "modern", "scifi"].includes(v)),
      fantastic: flag("fantastic"),
      namedFor,
      biome: pick("biome", "homeland", (v) => v === "homeland" || !!findBiome(v) || /^\[\[.+\]\]$/.test(v)),
      terrain: pick("terrain", "any", (v) => TERRAIN_CHOICES.some((t) => t.id === v) || /^[a-z0-9-]+$/.test(v)),
      tone: pick<GroupToneChoice>("tone", "any", (v) => v === "any" || (GROUP_TONES as string[]).includes(v)),
      length: pick<RealmLength>("length", "plain", (v) => ["plain", "ceremonial"].includes(v)),
      output: pick<RealmOutput>("output", "official", (v) => ["official", "short", "both"].includes(v)),
      people: pick<GroupPeople>("people", "placeholders", (v) => ["placeholders", "invented"].includes(v)),
    },
    problems,
  };
}

function realmPresetContent(preset: RealmPreset): string {
  const quote = (v: string) => (/^\[\[|[:#]/.test(v) ? `"${v}"` : v);
  return [
    "---",
    "type: module-preset",
    `module: ${REALM_PRESET_MODULE}`,
    `packName: ${preset.packName}`,
    `setting: ${preset.setting}`,
    `culture: ${preset.culture}`,
    `character: ${preset.character}`,
    `era: ${preset.era}`,
    `genre: ${preset.genre}`,
    `fantastic: ${preset.fantastic}`,
    `namedFor: ${preset.namedFor}`,
    `biome: ${quote(preset.biome)}`,
    `terrain: ${preset.terrain}`,
    `tone: ${preset.tone}`,
    `length: ${preset.length}`,
    `output: ${preset.output}`,
    `people: ${preset.people}`,
    "---",
    "",
    preset.description.trim(),
    "",
  ].join("\n");
}

// ── Route presets (Route names brief §13) ──────────────────────────────────

export const ROUTE_PRESET_MODULE = "route-names";

export interface RoutePreset {
  packName: string;
  setting: string;
  description: string;
  culture: string;
  /** "all" or a place-shape region code. */
  region: string;
  /** "any" or a kind key (the note's `kind`). */
  routeKind: string;
  era: RouteEra;
  fantastic: boolean;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: boolean;
}

function parseRoutePreset(values: Record<string, string>, body: string, fileName: string): { route?: RoutePreset; problems: string[] } {
  const problems: string[] = [];
  const pick = <T extends string>(key: string, fallback: T, ok: (v: string) => boolean): T => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v as T;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const flag = (key: string): boolean => {
    const v = values[key];
    if (v === "true" || v === "false") return v === "true";
    if (v) problems.push(`Unknown ${key} “${v}”.`);
    return false;
  };
  const era = pick<RouteEra>("era", "MD", (v) => ROUTE_ERAS.some((e) => e.code === v));
  const fantastic = flag("fantastic");
  let kind = pick<string>("kind", "any", (v) => v === "any" || !!findRouteKind(v));
  // §13: a kind not offered in the era runs as any.
  if (kind !== "any" && !kindsOffered(era, fantastic).some((k) => k.key === kind)) {
    problems.push(`Kind “${kind}” isn't offered in the ${routeEraLabel(era)} era.`);
    kind = "any";
  }
  return {
    route: {
      packName: values.packName || fileName,
      setting: values.setting ?? "",
      description: body.trim(),
      culture: pick("culture", "norman-british", (v) => !!findRouteCulture(v)),
      region: pick("region", "all", (v) => v === "all" || PLACE_SHAPE_REGIONS.some((r) => r.code === v)),
      routeKind: kind,
      era,
      fantastic,
      tone: pick<GroupToneChoice>("tone", "any", (v) => v === "any" || (GROUP_TONES as string[]).includes(v)),
      people: pick<GroupPeople>("people", "placeholders", (v) => ["placeholders", "invented"].includes(v)),
      series: flag("series"),
    },
    problems,
  };
}

function routePresetContent(preset: RoutePreset): string {
  return [
    "---",
    "type: module-preset",
    `module: ${ROUTE_PRESET_MODULE}`,
    `packName: ${preset.packName}`,
    `setting: ${preset.setting}`,
    `culture: ${preset.culture}`,
    `region: ${preset.region}`,
    `kind: ${preset.routeKind}`,
    `era: ${preset.era}`,
    `fantastic: ${preset.fantastic}`,
    `tone: ${preset.tone}`,
    `people: ${preset.people}`,
    `series: ${preset.series}`,
    "---",
    "",
    preset.description.trim(),
    "",
  ].join("\n");
}

// ── Street presets (Streets brief §14) ─────────────────────────────────────

export const STREET_PRESET_MODULE = "street-names";

export interface StreetPreset {
  packName: string;
  setting: string;
  description: string;
  culture: string;
  /** "all" or a place-shape region code. */
  region: string;
  /** "any" or a kind key (the note's `kind`). */
  streetKind: "any" | StreetKind;
  /** "any" or a function key. */
  function: string;
  era: RouteEra;
  fantastic: boolean;
  size: StreetSize;
  dialect: StreetDialect;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: boolean;
}

function parseStreetPreset(values: Record<string, string>, body: string, fileName: string): { street?: StreetPreset; problems: string[] } {
  const problems: string[] = [];
  const pick = <T extends string>(key: string, fallback: T, ok: (v: string) => boolean): T => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v as T;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const flag = (key: string): boolean => {
    const v = values[key];
    if (v === "true" || v === "false") return v === "true";
    if (v) problems.push(`Unknown ${key} “${v}”.`);
    return false;
  };
  const size = pick<StreetSize>("size", "town", (v) => STREET_SIZES.some((s) => s.key === v));
  let kind = pick<"any" | StreetKind>("kind", "any", (v) => v === "any" || STREET_KINDS.some((k) => k.key === v));
  // §14: districts with a village run as streets.
  if (kind === "districts" && size === "village") {
    problems.push("A village has no districts.");
    kind = "streets";
  }
  return {
    street: {
      packName: values.packName || fileName,
      setting: values.setting ?? "",
      description: body.trim(),
      culture: pick("culture", "norman-british", (v) => !!findRouteCulture(v)),
      region: pick("region", "all", (v) => v === "all" || PLACE_SHAPE_REGIONS.some((r) => r.code === v)),
      streetKind: kind,
      function: pick("function", "any", (v) => v === "any" || STREET_FUNCTIONS.some((f) => f.key === v)),
      era: pick<RouteEra>("era", "MD", (v) => ROUTE_ERAS.some((e) => e.code === v)),
      fantastic: flag("fantastic"),
      size,
      dialect: pick<StreetDialect>("dialect", "variants", (v) => ["plain", "variants", "instead"].includes(v)),
      tone: pick<GroupToneChoice>("tone", "any", (v) => v === "any" || (GROUP_TONES as string[]).includes(v)),
      people: pick<GroupPeople>("people", "placeholders", (v) => ["placeholders", "invented"].includes(v)),
      series: flag("series"),
    },
    problems,
  };
}

function streetPresetContent(preset: StreetPreset): string {
  return [
    "---",
    "type: module-preset",
    `module: ${STREET_PRESET_MODULE}`,
    `packName: ${preset.packName}`,
    `setting: ${preset.setting}`,
    `culture: ${preset.culture}`,
    `region: ${preset.region}`,
    `kind: ${preset.streetKind}`,
    `function: ${preset.function}`,
    `era: ${preset.era}`,
    `fantastic: ${preset.fantastic}`,
    `size: ${preset.size}`,
    `dialect: ${preset.dialect}`,
    `tone: ${preset.tone}`,
    `people: ${preset.people}`,
    `series: ${preset.series}`,
    "---",
    "",
    preset.description.trim(),
    "",
  ].join("\n");
}

// ── Inn presets (Inns brief §13) ────────────────────────────────────────────

export const INN_PRESET_MODULE = "inn-names";

export interface InnPreset {
  packName: string;
  setting: string;
  description: string;
  culture: string;
  /** "all" or a place-shape region code. */
  region: string;
  /** "any" or a kind key (the note's `kind`). */
  innKind: "any" | InnKind;
  era: RouteEra;
  fantastic: boolean;
  /** Where the house stands (the note's `setting` is the preset's own setting line). */
  innSetting: InnSetting;
  form: InnForm;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: boolean;
}

function parseInnPreset(values: Record<string, string>, body: string, fileName: string): { inn?: InnPreset; problems: string[] } {
  const problems: string[] = [];
  const pick = <T extends string>(key: string, fallback: T, ok: (v: string) => boolean): T => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v as T;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const flag = (key: string): boolean => {
    const v = values[key];
    if (v === "true" || v === "false") return v === "true";
    if (v) problems.push(`Unknown ${key} “${v}”.`);
    return false;
  };
  const era = pick<RouteEra>("era", "MD", (v) => ROUTE_ERAS.some((e) => e.code === v));
  let kind = pick<"any" | InnKind>("kind", "any", (v) => v === "any" || INN_KINDS.some((k) => k.key === v));
  if (kind !== "any" && !(INN_KINDS.find((k) => k.key === kind)!.era[era] > 0)) {
    problems.push(`Kind “${kind}” isn't offered in the ${routeEraLabel(era)} era.`);
    kind = "any";
  }
  return {
    inn: {
      packName: values.packName || fileName,
      setting: "",
      description: body.trim(),
      culture: pick("culture", "norman-british", (v) => !!findRouteCulture(v)),
      region: pick("region", "all", (v) => v === "all" || PLACE_SHAPE_REGIONS.some((r) => r.code === v)),
      innKind: kind,
      era,
      fantastic: flag("fantastic"),
      innSetting: pick<InnSetting>("setting", "anywhere", (v) => INN_SETTINGS.some((s) => s.key === v)),
      form: pick<InnForm>("form", "either", (v) => ["signs", "house", "either"].includes(v)),
      tone: pick<GroupToneChoice>("tone", "any", (v) => v === "any" || (GROUP_TONES as string[]).includes(v)),
      people: pick<GroupPeople>("people", "placeholders", (v) => ["placeholders", "invented"].includes(v)),
      series: flag("series"),
    },
    problems,
  };
}

function innPresetContent(preset: InnPreset): string {
  return [
    "---",
    "type: module-preset",
    `module: ${INN_PRESET_MODULE}`,
    `packName: ${preset.packName}`,
    `culture: ${preset.culture}`,
    `region: ${preset.region}`,
    `kind: ${preset.innKind}`,
    `era: ${preset.era}`,
    `fantastic: ${preset.fantastic}`,
    `setting: ${preset.innSetting}`,
    `form: ${preset.form}`,
    `tone: ${preset.tone}`,
    `people: ${preset.people}`,
    `series: ${preset.series}`,
    "---",
    "",
    preset.description.trim(),
    "",
  ].join("\n");
}

// ── Building presets (Buildings brief §13) ──────────────────────────────────

export const BUILDING_PRESET_MODULE = "building-names";

export interface BuildingPreset {
  packName: string;
  setting: string;
  description: string;
  culture: string;
  /** "all" or a place-shape region code. */
  region: string;
  /** "any" or a kind key (the note's `kind`). */
  buildingKind: "any" | BuildingKind;
  era: RouteEra;
  fantastic: boolean;
  /** Where the buildings stand (the note's `setting`, as for inns). */
  buildingSetting: InnSetting;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: boolean;
}

function parseBuildingPreset(values: Record<string, string>, body: string, fileName: string): { building?: BuildingPreset; problems: string[] } {
  const problems: string[] = [];
  const pick = <T extends string>(key: string, fallback: T, ok: (v: string) => boolean): T => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v as T;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const flag = (key: string): boolean => {
    const v = values[key];
    if (v === "true" || v === "false") return v === "true";
    if (v) problems.push(`Unknown ${key} “${v}”.`);
    return false;
  };
  const era = pick<RouteEra>("era", "MD", (v) => ROUTE_ERAS.some((e) => e.code === v));
  let kind = pick<"any" | BuildingKind>("kind", "any", (v) => v === "any" || BUILDING_KINDS.some((k) => k.key === v));
  if (kind !== "any" && !(BUILDING_KINDS.find((k) => k.key === kind)!.era[era] > 0)) {
    problems.push(`Kind “${kind}” isn't offered in the ${routeEraLabel(era)} era.`);
    kind = "any";
  }
  return {
    building: {
      packName: values.packName || fileName,
      setting: "",
      description: body.trim(),
      culture: pick("culture", "norman-british", (v) => !!findRouteCulture(v)),
      region: pick("region", "all", (v) => v === "all" || PLACE_SHAPE_REGIONS.some((r) => r.code === v)),
      buildingKind: kind,
      era,
      fantastic: flag("fantastic"),
      buildingSetting: pick<InnSetting>("setting", "anywhere", (v) => INN_SETTINGS.some((s) => s.key === v)),
      tone: pick<GroupToneChoice>("tone", "any", (v) => v === "any" || (GROUP_TONES as string[]).includes(v)),
      people: pick<GroupPeople>("people", "placeholders", (v) => ["placeholders", "invented"].includes(v)),
      series: flag("series"),
    },
    problems,
  };
}

function buildingPresetContent(preset: BuildingPreset): string {
  return [
    "---",
    "type: module-preset",
    `module: ${BUILDING_PRESET_MODULE}`,
    `packName: ${preset.packName}`,
    `culture: ${preset.culture}`,
    `region: ${preset.region}`,
    `kind: ${preset.buildingKind}`,
    `era: ${preset.era}`,
    `fantastic: ${preset.fantastic}`,
    `setting: ${preset.buildingSetting}`,
    `tone: ${preset.tone}`,
    `people: ${preset.people}`,
    `series: ${preset.series}`,
    "---",
    "",
    preset.description.trim(),
    "",
  ].join("\n");
}

// ── Settlement kit presets (Settlement kit brief §11) ───────────────────────

export const KIT_PRESET_MODULE = "settlement-kit";

export interface KitPreset {
  packName: string;
  setting: string;
  description: string;
  culture: string;
  /** "all" or a place-shape region code. */
  region: string;
  era: RouteEra;
  fantastic: boolean;
  size: KitSize;
  position: KitPosition;
  tone: GroupToneChoice;
  contents: KitContents;
  detail: KitDetail;
  people: GroupPeople;
}

function parseKitPreset(values: Record<string, string>, body: string, fileName: string): { kit?: KitPreset; problems: string[] } {
  const problems: string[] = [];
  const pick = <T extends string>(key: string, fallback: T, ok: (v: string) => boolean): T => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v as T;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const fantastic = values.fantastic === "true";
  if (values.fantastic && values.fantastic !== "true" && values.fantastic !== "false") problems.push(`Unknown fantastic “${values.fantastic}”.`);
  return {
    kit: {
      packName: values.packName || fileName,
      setting: "",
      description: body.trim(),
      culture: pick("culture", "norman-british", (v) => !!findRouteCulture(v)),
      region: pick("region", "all", (v) => v === "all" || PLACE_SHAPE_REGIONS.some((r) => r.code === v)),
      era: pick<RouteEra>("era", "MD", (v) => ROUTE_ERAS.some((e) => e.code === v)),
      fantastic,
      size: pick<KitSize>("size", "town", (v) => KIT_SIZES.includes(v as KitSize)),
      position: pick<KitPosition>("position", "inland", (v) => KIT_POSITIONS.some((p) => p.key === v)),
      tone: pick<GroupToneChoice>("tone", "any", (v) => v === "any" || (GROUP_TONES as string[]).includes(v)),
      contents: pick<KitContents>("contents", "whole", (v) => v in KIT_CONTENTS),
      detail: pick<KitDetail>("detail", "standard", (v) => KIT_DETAILS.includes(v as KitDetail)),
      people: pick<GroupPeople>("people", "placeholders", (v) => ["placeholders", "invented"].includes(v)),
    },
    problems,
  };
}

function kitPresetContent(preset: KitPreset): string {
  return [
    "---",
    "type: module-preset",
    `module: ${KIT_PRESET_MODULE}`,
    `packName: ${preset.packName}`,
    `culture: ${preset.culture}`,
    `region: ${preset.region}`,
    `era: ${preset.era}`,
    `fantastic: ${preset.fantastic}`,
    `size: ${preset.size}`,
    `position: ${preset.position}`,
    `tone: ${preset.tone}`,
    `contents: ${preset.contents}`,
    `detail: ${preset.detail}`,
    `people: ${preset.people}`,
    "---",
    "",
    preset.description.trim(),
    "",
  ].join("\n");
}

// ── Event presets (Events brief §12) ────────────────────────────────────────

export const EVENT_PRESET_MODULE = "event-names";

export interface EventPreset {
  packName: string;
  setting: string;
  description: string;
  culture: string;
  /** "any" or a kind key (the note's `kind`). */
  eventKind: "any" | EventKind;
  era: RouteEra;
  fantastic: boolean;
  scale: EventScale;
  tone: GroupToneChoice;
  people: GroupPeople;
  series: boolean;
}

function parseEventPreset(values: Record<string, string>, body: string, fileName: string): { event?: EventPreset; problems: string[] } {
  const problems: string[] = [];
  const pick = <T extends string>(key: string, fallback: T, ok: (v: string) => boolean): T => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v as T;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const flag = (key: string): boolean => {
    const v = values[key];
    if (v === "true" || v === "false") return v === "true";
    if (v) problems.push(`Unknown ${key} “${v}”.`);
    return false;
  };
  const era = pick<RouteEra>("era", "MD", (v) => ROUTE_ERAS.some((e) => e.code === v));
  let kind = pick<"any" | EventKind>("kind", "any", (v) => v === "any" || EVENT_KINDS.some((k) => k.key === v));
  if (kind !== "any" && !(EVENT_KINDS.find((k) => k.key === kind)!.era[era] > 0)) {
    problems.push(`Kind “${kind}” isn't offered in the ${routeEraLabel(era)} era.`);
    kind = "any";
  }
  return {
    event: {
      packName: values.packName || fileName,
      setting: "",
      description: body.trim(),
      culture: pick("culture", "norman-british", (v) => !!findRouteCulture(v)),
      eventKind: kind,
      era,
      fantastic: flag("fantastic"),
      scale: pick<EventScale>("scale", "realm", (v) => EVENT_SCALES.some((s) => s.key === v)),
      tone: pick<GroupToneChoice>("tone", "any", (v) => v === "any" || (GROUP_TONES as string[]).includes(v)),
      people: pick<GroupPeople>("people", "placeholders", (v) => ["placeholders", "invented"].includes(v)),
      series: flag("series"),
    },
    problems,
  };
}

function eventPresetContent(preset: EventPreset): string {
  return [
    "---",
    "type: module-preset",
    `module: ${EVENT_PRESET_MODULE}`,
    `packName: ${preset.packName}`,
    `culture: ${preset.culture}`,
    `kind: ${preset.eventKind}`,
    `era: ${preset.era}`,
    `fantastic: ${preset.fantastic}`,
    `scale: ${preset.scale}`,
    `tone: ${preset.tone}`,
    `people: ${preset.people}`,
    `series: ${preset.series}`,
    "---",
    "",
    preset.description.trim(),
    "",
  ].join("\n");
}

// ── Vessel presets (Ships brief §15) ────────────────────────────────────────

export const VESSEL_PRESET_MODULE = "vessels";

export interface VesselPreset {
  packName: string;
  setting: string;
  description: string;
  vesselModule: VesselModule;
  culture: string;
  /** "any" or a function key. */
  function: string;
  technology: string;
  genre: GroupGenre;
  fantastic: boolean;
  style: string;
  tone: GroupToneChoice;
  prefixes: boolean;
  people: GroupPeople;
  series: boolean;
}

function parseVesselPreset(values: Record<string, string>, body: string, fileName: string): { vessel?: VesselPreset; problems: string[] } {
  const problems: string[] = [];
  const module = values.vesselModule as VesselModule;
  if (module !== "ships" && module !== "spacecraft") {
    problems.push(`Unknown vesselModule “${values.vesselModule ?? ""}”.`);
    return { problems };
  }
  const pick = <T extends string>(key: string, fallback: T, ok: (v: string) => boolean): T => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v as T;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const flag = (key: string): boolean => {
    const v = values[key];
    if (v === "true" || v === "false") return v === "true";
    if (v) problems.push(`Unknown ${key} “${v}”.`);
    return false;
  };
  const genre = pick<GroupGenre>("genre", module === "spacecraft" ? "scifi" : "fantasy", (v) => ["fantasy", "modern", "scifi"].includes(v));
  const fantastic = flag("fantastic");
  const setting = groupSetting(genre, genre === "scifi" ? false : fantastic);
  const fn = pick("function", "any", (v) => v === "any" || moduleFunctions(module).some((f) => f.key === v));
  let style = pick("style", "none", (v) => v === "none" || VESSEL_DATA.styles.some((st) => st.key === v));
  // §15: a style not offered in the preset's setting runs as none.
  if (style !== "none" && !availableStyles(module, setting).some((s) => s.key === style)) {
    problems.push(`Style “${style}” isn't available here.`);
    style = "none";
  }
  let series = flag("series");
  if (series && fn === "any") {
    problems.push("Series needs a type.");
    series = false;
  }
  return {
    vessel: {
      packName: values.packName || fileName,
      setting: values.setting ?? "",
      description: body.trim(),
      vesselModule: module,
      culture: pick("culture", "general", (v) => !!findVesselCulture(v)),
      function: fn,
      technology: pick("technology", "any", (v) => v === "any" || techChoices(module, "SF").includes(v)),
      genre,
      fantastic,
      style,
      tone: pick<GroupToneChoice>("tone", "any", (v) => v === "any" || (GROUP_TONES as string[]).includes(v)),
      prefixes: flag("prefixes"),
      people: pick<GroupPeople>("people", "placeholders", (v) => ["placeholders", "invented"].includes(v)),
      series,
    },
    problems,
  };
}

function vesselPresetContent(preset: VesselPreset): string {
  return [
    "---",
    "type: module-preset",
    `module: ${VESSEL_PRESET_MODULE}`,
    `vesselModule: ${preset.vesselModule}`,
    `packName: ${preset.packName}`,
    `setting: ${preset.setting}`,
    `culture: ${preset.culture}`,
    `function: ${preset.function}`,
    `technology: ${preset.technology}`,
    `genre: ${preset.genre}`,
    `fantastic: ${preset.fantastic}`,
    `style: ${preset.style}`,
    `tone: ${preset.tone}`,
    `prefixes: ${preset.prefixes}`,
    `people: ${preset.people}`,
    `series: ${preset.series}`,
    "---",
    "",
    preset.description.trim(),
    "",
  ].join("\n");
}

// ── Presets as sources (§10) ─────────────────────────────────────────────────

/**
 * §10.1: what a tribal preset gives a recipe slot. The slot keeps its templates, length and
 * article (Tribal brief §20.2); the preset's group type and register apply only where the slot
 * allows them (slotFill checks), and hostile names are always off. A biome pack link can't be
 * used in a slot, so it falls back to the recipe's biome, as homeland does.
 */
export function tribalPresetSlot(preset: TribalPreset): { tradition: string } & TribalSlotFields {
  return {
    tradition: preset.tradition,
    ...(preset.biome !== "homeland" && findBiome(preset.biome) ? { biome: preset.biome } : {}),
    ...(preset.terrain !== "any" ? { terrain: preset.terrain } : {}),
    ...(preset.groupType !== "any" ? { groupType: preset.groupType } : {}),
    ...(preset.perspective !== "any" ? { perspective: preset.perspective } : {}),
    ...(preset.register === "plain" || preset.register === "administrative" ? { register: preset.register } : {}),
  };
}

/** §10.1: a linked preset's note, or why it can't be used (the slot then renders its placeholder). */
export function readTribalPresetSource(name: string, content: string | null): { preset: TribalPreset } | { notice: string } {
  if (content === null) return { notice: `Preset “${name}” is missing.` };
  const parsed = isModulePresetContent(content) ? parseModulePreset(content, name).preset : undefined;
  if (!parsed) return { notice: `“${name}” isn't a tribes and kin groups preset.` };
  return { preset: parsed };
}

/** §10.2: a `//` line's draw from a preset: the colonial column of §20.2, with the preset's settings. */
export function tribalPresetDraw(preset: TribalPreset): (rng: () => number) => string {
  const { tradition, ...fields } = tribalPresetSlot(preset);
  return (rng) => tribalSlotFill({ tradition, part: "new-land", fields }, rng).text;
}
