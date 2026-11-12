// The shared lens (docs/shared-lens-and-coverage-brief.md §3–§5): cultures, regions, eras, styles and
// tones defined once in data/lens.json, and the mappings from each module's own rosters to them.
// No Obsidian imports. Nothing here changes a module's output: it only says how a module's own
// culture, era, setting and style values read in lens terms (for the coverage report) and which
// lens cultures are live. Cultures marked `planned` are declared and never offered.

import lensData from "./data/lens.json";

export type LensTier = "baseline" | "core" | "second" | "local";
export type LensEra = "AN" | "MD" | "EM" | "ST" | "MO" | "NF" | "IS";

export interface LensCulture {
  key: string;
  label: string;
  tier: LensTier;
  family: string | null;
  /** `live`: offered today under one or more existing keys. `planned`: declared, never offered. */
  status: "live" | "planned";
  /** The keys the modules read today that feed this culture. */
  keys: string[];
  /** Local cultures: the roster they belong to. */
  module?: string;
}

export interface LensEraInfo {
  code: LensEra;
  label: string;
  span: string | null;
}

export interface LensStyle {
  key: string;
  label: string;
  /** The eras the style can sit on. */
  eras: string[];
}

export interface LensRegion {
  code: string;
  label: string;
  cultures: string[];
  status: "live" | "planned";
}

export interface LensTargets {
  cultures: Record<"core" | "second" | "local", { words: number; shapes: number }>;
  era: number;
  style: { words: number; shapes: number };
  tone: number;
  toneKeys: string[];
  region: number;
  kindOpenShapes: number;
  pool: number;
}

/** One reading of a module's own style or setting value: a lens style, on some eras (absent: its own). */
export interface LensStyleReading {
  style: string;
  eras?: string[];
}

interface CultureMapEntry {
  lens: string[];
  /** A culture only its own module has (§3.1 local tier): it feeds `lens` as well, if any. */
  local?: boolean;
  /** The group engine's draws for a tribal tradition: [lens culture, weight] pairs (traditions.cultureMap today). */
  weights?: [string, number][];
}

interface CultureMapping {
  extends?: string;
  entries?: Record<string, CultureMapEntry>;
}

interface LensModule {
  /** The culture mapping this module's roster uses (`shared`, `tribal`, `colonial`, `vehicle`, `world`) or `none`. */
  cultures: string;
  /** The era mapping its eras use (`codes`, `realms`, `world`, `ships`, …) or `none`. */
  eras: string;
  settings?: string;
  styles?: string;
  britishEras?: string;
  colonialCultures?: string;
  land: boolean;
}

interface LensData {
  cultures: LensCulture[];
  legacy: Record<string, string[]>;
  cultureGroups: Record<string, { cultures: string[]; from?: Record<string, LensEra> }>;
  regions: LensRegion[];
  eras: LensEraInfo[];
  landBand: LensEra[];
  styles: LensStyle[];
  tones: { key: string }[];
  targets: LensTargets;
  poolExemptions: { forPacks: string[]; closed: string[] };
  landModules: string[];
  mappings: {
    cultures: Record<string, CultureMapping | Record<string, CultureMapEntry>>;
    eras: Record<string, Record<string, string[]> | string[] | Record<string, string>>;
    styles: {
      genreSettings: Record<string, { eras: string[]; style: string }>;
      vessel: Record<string, LensStyleReading[]>;
      vocabulary: { fantastic: { steampunkWhenEras: string[]; otherwise: LensStyleReading[] }; notFantastic: LensStyleReading[] };
      steampunkNames: { pools: string[]; shapeLists: string[] };
      default: LensStyleReading[];
    };
  };
  modules: Record<string, LensModule>;
}

const LENS = lensData as unknown as LensData;

export const LENS_CULTURES: readonly LensCulture[] = LENS.cultures;
export const LENS_ERAS: readonly LensEraInfo[] = LENS.eras;
export const LENS_STYLES: readonly LensStyle[] = LENS.styles;
export const LENS_TONES: readonly string[] = LENS.tones.map((t) => t.key);
export const LENS_REGIONS: readonly LensRegion[] = LENS.regions;
/** §3.1: the legacy keys (`anglo-saxon`, `celtic`…) and the lens cultures each feeds. */
export const LENS_LEGACY: Readonly<Record<string, string[]>> = LENS.legacy;
/** §3.3: the three eras that read as one band in land-naming modules. */
export const LENS_LAND_BAND: readonly LensEra[] = LENS.landBand;
export const LENS_TARGETS: LensTargets = LENS.targets;
/** Every module the lens maps, by section id. */
export const LENS_MODULES: readonly string[] = Object.keys(LENS.modules);

const CULTURE_BY_KEY = new Map(LENS.cultures.map((c) => [c.key, c]));
export const lensCulture = (key: string): LensCulture | undefined => CULTURE_BY_KEY.get(key);

/** The lens cultures that may be offered: live ones. Planned cultures are never offered (§3.1). */
export const offeredLensCultures = (): LensCulture[] => LENS.cultures.filter((c) => c.status === "live");

// ── Cultures ────────────────────────────────────────────────────────────────

/** A culture mapping's entries, with the mapping it extends merged in. */
export function cultureMapping(name: string): Record<string, CultureMapEntry> {
  const raw = LENS.mappings.cultures[name] as CultureMapping | Record<string, CultureMapEntry> | undefined;
  if (!raw) return {};
  if ("entries" in raw || "extends" in raw) {
    const m = raw as CultureMapping;
    return { ...(m.extends ? cultureMapping(m.extends) : {}), ...(m.entries ?? {}) };
  }
  return raw as Record<string, CultureMapEntry>;
}

/** §4.1: the lens cultures a module's own culture (or tradition) key counts towards. Local cultures with no lens culture give []. */
export function lensCulturesFor(moduleKey: string, moduleCultureKey: string): string[] {
  const mod = LENS.modules[moduleKey];
  if (!mod) return [];
  const key = moduleCultureKey;
  const maps = [mod.cultures, ...(mod.colonialCultures ? [mod.colonialCultures] : [])];
  for (const name of maps) {
    const entry = cultureMapping(name)[key];
    if (entry) return [...entry.lens];
  }
  return [];
}

/** Whether a module's own culture key is one only its module has (the local tier). */
export function isLocalCulture(moduleKey: string, moduleCultureKey: string): boolean {
  const mod = LENS.modules[moduleKey];
  if (!mod) return false;
  const maps = [mod.cultures, ...(mod.colonialCultures ? [mod.colonialCultures] : [])];
  return maps.some((name) => !!cultureMapping(name)[moduleCultureKey]?.local);
}

/** Whether the module's roster mapping names this culture key at all. */
export function moduleKnowsCulture(moduleKey: string, moduleCultureKey: string): boolean {
  const mod = LENS.modules[moduleKey];
  if (!mod) return false;
  return [mod.cultures, ...(mod.colonialCultures ? [mod.colonialCultures] : [])].some((name) => !!cultureMapping(name)[moduleCultureKey]);
}

/** The live lens cultures a module's roster reaches, in lens order: what the coverage report counts it as offering. Never a planned culture. */
export function offeredLensCulturesFor(moduleKey: string, moduleKeys: readonly string[]): string[] {
  const reached = new Set(moduleKeys.flatMap((k) => lensCulturesFor(moduleKey, k)));
  return LENS.cultures.filter((c) => c.status === "live" && reached.has(c.key)).map((c) => c.key);
}

/** §4.1: the draws of a tribal tradition (the group engine's `traditions.cultureMap` as it is today), if it has any. */
export function tribalCultureWeights(tradition: string): [string, number][] | undefined {
  return cultureMapping("tribal")[tradition]?.weights;
}

// ── Eras ────────────────────────────────────────────────────────────────────

const ERA_CODES = LENS.eras.map((e) => e.code);

/** §4.2: the lens eras a module's own era value covers. Era codes read as themselves; `world` values are keyed "{culture}:{era}". */
export function lensErasFor(moduleKey: string, moduleEraKey: string, culture?: string): string[] {
  const mod = LENS.modules[moduleKey];
  if (!mod) return [];
  if (mod.eras === "none") return [];
  if (mod.eras === "codes") return ERA_CODES.includes(moduleEraKey as LensEra) ? [moduleEraKey] : [];
  const table = LENS.mappings.eras[mod.eras] as Record<string, string[]> | undefined;
  if (!table) return [];
  if (mod.eras === "world") return table[`${culture ?? ""}:${moduleEraKey}`] ?? [];
  return table[moduleEraKey] ? [...table[moduleEraKey]] : [];
}

/** §4.2: every eras table by name (`codes`, `realms`, `world`, `ships`…), for the integrity tests and the coverage adapters. */
export function eraTable(name: string): Record<string, string[]> {
  return (LENS.mappings.eras[name] as Record<string, string[]>) ?? {};
}

/** §4.2: british place names and river names have no era of their own: all seven. */
export const lensErasForBritish = (): string[] => [...ERA_CODES];

// ── Styles ──────────────────────────────────────────────────────────────────

/**
 * §4.3: the lens style (and era) a module's own style or setting value reads as. A group or vehicle
 * setting (`FL`…`SF`) and a vessel style (`heroic`…`outlaw`) are both looked up; anything else is realistic.
 */
export function lensStyleFor(moduleKey: string, value: string): LensStyleReading[] {
  const styles = LENS.mappings.styles;
  const mod = LENS.modules[moduleKey];
  if (mod?.styles === "vessel" && styles.vessel[value]) return styles.vessel[value].map((r) => ({ ...r }));
  if (mod?.settings === "genreSettings" && styles.genreSettings[value]) {
    const s = styles.genreSettings[value];
    return [{ style: s.style, eras: [...s.eras] }];
  }
  return styles.default.map((r) => ({ ...r }));
}

/** §4.3: the lens style of a shared-vocabulary entry, from its fantastic flag and eras. */
export function lensStyleForVocabulary(entry: { h?: boolean; e?: readonly string[] }): LensStyleReading[] {
  const rules = LENS.mappings.styles.vocabulary;
  if (entry.h !== true) return rules.notFantastic.map((r) => ({ ...r }));
  const eras = entry.e ?? [];
  if (eras.length > 0 && eras.every((e) => rules.fantastic.steampunkWhenEras.includes(e))) return [{ style: "steampunk", eras: [...eras] }];
  return rules.fantastic.otherwise.map((r) => ({ style: r.style, eras: [...(r.eras ?? [])] }));
}

/** §4.3: the pools and shape lists named for steampunk, which read as the steampunk style. */
export const STEAMPUNK_NAMES = LENS.mappings.styles.steampunkNames;

// ── Groups, land, targets, exemptions ───────────────────────────────────────

/** §3.1: whether a culture belongs to a named group in an era (christian: greek-byzantine and roman from MD). */
export function inCultureGroup(group: string, culture: string, era: LensEra): boolean {
  const g = LENS.cultureGroups[group];
  if (!g) return false;
  if (g.cultures.includes(culture)) return true;
  const from = g.from?.[culture];
  return !!from && ERA_CODES.indexOf(era) >= ERA_CODES.indexOf(from);
}

/** The lens's culture groups, as the vocabulary has them: `{ cultures, from? }` by name. */
export const LENS_CULTURE_GROUPS: Readonly<Record<string, { cultures: string[]; from?: Record<string, LensEra> }>> = LENS.cultureGroups;

/** §3.3: whether the coverage report reads a module's era tags through the land band. */
export const isLandModule = (moduleKey: string): boolean => LENS.modules[moduleKey]?.land === true;

/** Whether an era counts as covered by a tag on `era`, for a module: the whole land band for a land module. */
export function eraCovers(moduleKey: string, tagged: LensEra, wanted: LensEra): boolean {
  if (tagged === wanted) return true;
  return isLandModule(moduleKey) && LENS.landBand.includes(tagged) && LENS.landBand.includes(wanted);
}

/** §6.3: a pool's exemption from the minimum, if it has one. */
export function poolExemption(pool: string): "forPacks" | "closed" | undefined {
  if (LENS.poolExemptions.forPacks.includes(pool)) return "forPacks";
  if (LENS.poolExemptions.closed.includes(pool)) return "closed";
  return undefined;
}
