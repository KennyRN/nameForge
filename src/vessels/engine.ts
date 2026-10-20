// Ships and spacecraft (docs/ships-and-spacecraft-brief.md): vessel names from a culture, a
// technology, a function, a style and a tone. Reuses the group engine's weighted draws, setting
// tags, tone factor, invented people and places, possessives, repetition check and safeguards.
// No Obsidian imports.

import { hasSpaceBlock } from "../space/safeguards";
import vesselData from "../data/vessels.json";
import airLandData from "../data/vehicles-air-land.json";
import { BIOMES, findBiome } from "../biomes";
import { cultureAnimals, cultureLand, holyNamesIn, stripPlural, worldAnimals } from "../bynames/engine";
import {
  type GroupGenre,
  type GroupPeople,
  type GroupSafeguards,
  type GroupSetting,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  groupListWords,
  groupStarIn,
  groupPerson,
  groupPossessive,
  groupSaint,
  groupSetting,
  groupTown,
  hasBannedWord,
  normForBlock,
  ordinalText,
  counterGap,
  seriesTokenKind,
  pickWeighted,
  repeatsContent,
  SETTING_PHRASES,
  toneFactor,
  wordTones,
} from "../groups/engine";
import { mulberry32 } from "../markov";
import moneyData from "../data/money-names.json";
import { selfPatterns, TownTurn, type SettlementContext } from "../settlement/contextShared";
import { findTradition } from "../tribes/engine";
import { WORLD_CULTURES } from "../world/engine";

// ── Data ────────────────────────────────────────────────────────────────────

export type VesselModule = "ships" | "spacecraft" | "aircraft" | "landVehicles";
/** Aircraft and land vehicles brief §1: the two modules added on this engine. */
export const AIR_LAND_MODULES = ["aircraft", "landVehicles"] as const;
export const isAirLand = (module: VesselModule): module is "aircraft" | "landVehicles" => module === "aircraft" || module === "landVehicles";
export type VesselNaming = "craft" | "types";
type HolyType = "christian" | "gods" | "blessing" | "none";

export interface VesselEntry {
  w: string;
  x?: number;
  t?: GroupTone[];
  /** §4.1: the technology levels the word belongs to, e.g. "T5-T7". */
  k?: string;
  /** Aircraft and land brief §9.1: only these cultures draw the word. */
  only?: string[];
}

export interface VesselShape {
  role: string;
  p: string;
  w: number;
  k?: string;
  s?: GroupSetting[];
  fn?: string[];
  t?: GroupTone[];
  /** §8.4: which holy types draw the shape. */
  holy?: "saint" | "blessing" | "marian" | "blessingOnly";
  /** Aircraft and land brief §7: the new modules a shape belongs to (shared ships shapes have none). */
  mod?: VesselModule[];
  /** Culture multipliers, and the cultures a shape is limited to. */
  cx?: Record<string, number>;
  cult?: string[];
  /** Multipliers at a level (the war-engine shapes at LF). */
  atx?: Record<string, number>;
  /** The locomotive class theme a shape belongs to (§7.4). */
  theme?: string;
}

export interface VesselCulture {
  key: string;
  label: string;
  group: string;
  span: string;
  roles?: Record<string, number>;
  techRoles?: Record<string, Record<string, number>>;
  flavour?: string[] | { world: string } | { tribal: string };
  town: string;
  holy: HolyType;
  /** The saint shape's multiplier ("christian ×0.3"). */
  holyX?: number;
  /** `Our Lady of {marian}`: only where a culture says so, at this multiplier. */
  marian?: number;
  noSaints?: boolean;
  gods?: { world?: string; list?: VesselEntry[]; k?: string; shapes: { p: string; w: number }[] };
  shapes?: VesselShape[];
  lists?: Record<string, VesselEntry[]>;
  sensitive?: boolean;
  surnames?: boolean;
  womanNames?: boolean;
}

export interface VesselFunction {
  key: string;
  menu: string;
  plural: string;
  w: number;
  description: string;
  min?: string;
  noSensitive?: boolean;
  /** Aircraft and land brief §4.3: the level ranges a function needs ("A3-A7", "AF"). */
  needs?: string[];
  afMenu?: string;
  afPlural?: string;
  /** Not offered for types and models (§5.3). */
  noTypes?: boolean;
}

export interface VesselStyle {
  key: string;
  label: string;
  settings: GroupSetting[];
  modules: VesselModule[];
  description: string;
  tone?: GroupTone;
  name: VesselEntry[];
  pools: Record<string, VesselEntry[]>;
  shapes: string[];
}

interface VesselData {
  modules: Record<VesselModule, string>;
  cultures: VesselCulture[];
  technology: Record<VesselModule, { code: string; label: string }[]>;
  techWords: Record<string, { techAdj: VesselEntry[]; techNoun: VesselEntry[] }>;
  hybrids: { share: { inSpan: number; outOfSpan: number }; shapes: { p: string; w: number }[] };
  functions: Record<VesselModule, { any: string; list: VesselFunction[] }>;
  roles: string[];
  roleWeights: Record<VesselModule, Record<string, Record<string, number>>>;
  roleExtras: { module: VesselModule; function: string; role: string; w: number; k: string }[];
  lists: Record<string, VesselEntry[]>;
  listTones: Record<string, GroupTone[]>;
  shapes: VesselShape[];
  styles: VesselStyle[];
  styleShare: { default: number; general: number; poolMultiplier: number };
  space: Record<"station" | "colony", { p: string; w: number }[]>;
  personLabels: Record<string, string>;
  prefixes: {
    real: { p: string; cultures?: string[]; fn: string[]; k: string; x?: number }[];
    sf: Record<string, string[]>;
  };
  safeguards: {
    block: string[];
    blockSpacecraft: string[];
    blockUnless: { w: string; culture: string; k: string }[];
    blockPrefixed: string[];
    blockPrefixes: string[];
    flag: string[];
    flagListBlocks: boolean;
    banned: string[];
    divine: string[];
    divinePhrases: string[];
    sensitiveLists: string[];
  };
}

export const VESSEL_DATA = vesselData as unknown as VesselData;
/** Settlement kit §4: the patterns and words whose `{town}` is the home port. */
const VESSEL_SELF = selfPatterns(vesselData);
export const VESSEL_CULTURES = VESSEL_DATA.cultures;
interface AirLandData {
  modules: Record<string, string>;
  technology: Record<string, { code: string; label: string; fantastic?: boolean }[]>;
  settings: Record<string, Record<string, string[]>>;
  spans: Record<string, { airSpan: string; landSpan: string }>;
  techWords: VesselData["techWords"];
  functions: Record<string, { any: string; list: VesselFunction[] }>;
  roles: string[];
  roleWeights: Record<string, Record<string, Record<string, number>>>;
  roleRules: Record<string, { zeroOutside?: Record<string, string[]>; zeroAt?: Record<string, string[]>; multAt?: Record<string, Record<string, number>>; zeroInFn?: Record<string, Record<string, string[]>> }>;
  cultureRoles: Record<string, Record<string, Record<string, number>>>;
  sensitiveRoles: Record<string, string[]>;
  lists: Record<string, VesselEntry[]>;
  moduleLists: Record<string, Record<string, VesselEntry[]>>;
  listTones: Record<string, GroupTone[]>;
  phonetic: string[];
  manNameCultures: string[];
  shapes: VesselShape[];
  cultureAdds: { culture: string; module: string; fn: string[]; list: string; words: VesselEntry[] }[];
  types: {
    families: Record<string, (string | { p: string; w?: number; t?: GroupTone[] })[]>;
    designation: Record<string, Record<string, string | { p: string; k?: string; fn?: string[] }>>;
    weights: Record<string, Record<string, Record<string, number>>>;
    levelRules: Record<string, Record<string, { keep?: string[]; add?: Record<string, number>; replace?: Record<string, number> }>>;
    leanings: Record<string, Record<string, number>>;
    designationLean: Record<string, string[]>;
    mark: { share: number; numerals: string[]; never: string[] };
    rankInitial: { culture: string; fn: string; share: number; letter: string };
  };
  codes: {
    aircraft: { civil: string[]; military: string[]; rows: { cultures: string[]; kind: string; k: string; patterns: string[] }[]; sf: string[] };
    landVehicles: { rows: { fn: string[]; k: string; cultures?: string[]; notCultures?: string[]; patterns: string[] }[] };
    words: Record<string, { off: string; on: string }>;
  };
  naming: Record<string, Record<VesselNaming, string>>;
  /** Culture shapes that name a boat, kept to ships. */
  shipOnlyShapes: string[];
  styles: Record<string, Record<string, boolean | string | string[]>>;
  styleLabels: Record<string, Record<string, string>>;
  safeguards: { block: string[]; blockTypesOnly: string[]; flag: string[]; flagListBlocks: boolean; bannedWords: string[]; bannedNames: string[] };
}
export const AIR_LAND = airLandData as unknown as AirLandData;
export const VESSEL_MODULE_LABELS: Record<VesselModule, string> = { ...VESSEL_DATA.modules, ...AIR_LAND.modules };

export function findVesselCulture(key: string | undefined): VesselCulture | undefined {
  return VESSEL_CULTURES.find((c) => c.key === key);
}

// ── Technology (§4) ─────────────────────────────────────────────────────────

/** AF and LF (the fantastic levels) have no number; they sit above every other level of their module. */
const levelNumber = (code: string) => (/^[AL]F$/.test(code) ? NaN : parseInt(code.slice(1), 10));

/** A "T2-T5" or "T7" range as numbers. */
function range(k: string): [number, number] {
  const [lo, hi] = k.split("-");
  return [levelNumber(lo), levelNumber(hi ?? lo)];
}

/** Whether a level falls in a `k` range (untagged is every level). */
export function inRange(k: string | undefined, level: string): boolean {
  if (!k) return true;
  if (k === level) return true;
  if (k.charAt(0) !== level.charAt(0)) return false;
  const [lo, hi] = range(k);
  const n = levelNumber(level);
  return n >= lo && n <= hi;
}

/** §4.2: a culture's native ship levels. */
export function spanLevels(culture: VesselCulture): string[] {
  const [lo, hi] = range(culture.span);
  const out: string[] = [];
  for (let n = lo; n <= hi; n++) out.push(`T${n}`);
  return out;
}

/** Aircraft and land brief §3.2: a culture's native levels in an air or land module (empty: none). */
export function moduleSpanLevels(module: VesselModule, culture: VesselCulture): string[] {
  if (!isAirLand(module)) return spanLevels(culture);
  const row = AIR_LAND.spans[culture.key];
  const span = row ? (module === "aircraft" ? row.airSpan : row.landSpan) : "";
  if (!span) return [];
  const [lo, hi] = range(span);
  const letter = module === "aircraft" ? "A" : "L";
  const out: string[] = [];
  for (let n = lo; n <= hi; n++) out.push(`${letter}${n}`);
  return out;
}

/** §4.3: the level whose customs a culture follows at L: its nearest span level; for spacecraft, its highest. */
export function customsLevel(culture: VesselCulture, level: string, module?: VesselModule): string {
  if (module && isAirLand(module)) {
    // Aircraft and land brief §3.3: the nearest native level in the module (ties to the higher; AF, A7 and the like
    // lie above the span); a culture with none follows the chosen level itself.
    const span = moduleSpanLevels(module, culture);
    if (span.length === 0) return level;
    const n = Number.isNaN(levelNumber(level)) ? Infinity : levelNumber(level);
    const nums = span.map(levelNumber);
    const nearest = nums.reduce((best, m) => (Math.abs(m - n) < Math.abs(best - n) || (Math.abs(m - n) === Math.abs(best - n) && m > best) ? m : best));
    return `${level.charAt(0)}${nearest}`;
  }
  const [lo, hi] = range(culture.span);
  if (level.startsWith("S")) return `T${hi}`;
  return `T${Math.min(hi, Math.max(lo, levelNumber(level)))}`;
}

export function inSpan(culture: VesselCulture, level: string, module?: VesselModule): boolean {
  if (module && isAirLand(module)) return moduleSpanLevels(module, culture).includes(level);
  return level.startsWith("T") && inRange(culture.span, level);
}

const technologyList = (module: VesselModule) => (isAirLand(module) ? AIR_LAND.technology[module] : VESSEL_DATA.technology[module]);

export function techLabel(module: VesselModule, code: string): string {
  return technologyList(module).find((t) => t.code === code)?.label ?? code;
}

/** §2.2: the levels the technology link offers: spacecraft in modern settings have rocket age only. */
export function techChoices(module: VesselModule, setting: GroupSetting): string[] {
  // Aircraft and land brief §4.3: the levels each setting offers.
  if (isAirLand(module)) return AIR_LAND.settings[module][setting] ?? [];
  const all = VESSEL_DATA.technology[module].map((t) => t.code);
  return module === "spacecraft" && setting !== "SF" ? ["S1"] : all;
}

/** §2.2: the levels "any" draws from: the culture's span for ships; the setting's levels for spacecraft. */
export function anyLevels(module: VesselModule, culture: VesselCulture, setting: GroupSetting): string[] {
  if (isAirLand(module)) {
    // §4.3: the culture's native span within the setting's levels; where that is empty, the setting's levels.
    const offered = techChoices(module, setting);
    const native = moduleSpanLevels(module, culture).filter((l) => offered.includes(l));
    return native.length > 0 ? native : offered;
  }
  return module === "ships" ? spanLevels(culture) : techChoices(module, setting);
}

// ── Functions (§6) ──────────────────────────────────────────────────────────

export function moduleFunctions(module: VesselModule): VesselFunction[] {
  return isAirLand(module) ? AIR_LAND.functions[module].list : VESSEL_DATA.functions[module].list;
}

export function functionAny(module: VesselModule): string {
  return isAirLand(module) ? AIR_LAND.functions[module].any : VESSEL_DATA.functions[module].any;
}

/** §6.2: whether a function can be drawn at a level for a culture. */
export function functionAvailableAt(fn: VesselFunction, culture: VesselCulture, level: string): boolean {
  if (fn.noSensitive && culture.sensitive) return false;
  // Aircraft and land brief §5: the level ranges a function needs; none means every level.
  if (fn.needs) return fn.needs.some((r) => inRange(r, level));
  if (!fn.min) return true;
  return level.charAt(0) === fn.min.charAt(0) && levelNumber(level) >= levelNumber(fn.min);
}

/** §2.2: the functions offered for a culture and technology ("any": at some level it draws from). */
export function availableFunctions(module: VesselModule, cultureKey: string, technology: string, setting: GroupSetting, naming: VesselNaming = "craft"): VesselFunction[] {
  const culture = findVesselCulture(cultureKey) ?? VESSEL_CULTURES[0];
  const levels = technology === "any" ? anyLevels(module, culture, setting) : [technology];
  return moduleFunctions(module).filter((f) => !(naming === "types" && f.noTypes) && levels.some((l) => functionAvailableAt(f, culture, l)));
}

// ── Options and results ─────────────────────────────────────────────────────

export interface VesselOptions {
  module: VesselModule;
  culture?: string;
  /** A function key; undefined is Any. */
  function?: string;
  /** A level code, or "any" (the default). */
  technology?: string;
  genre?: GroupGenre;
  fantastic?: boolean;
  /** A style key; undefined or "none" is no style. */
  style?: string;
  tone?: GroupToneChoice;
  prefixes?: boolean;
  people?: GroupPeople;
  /** TS §3: one class instead of separate names; needs a function. */
  series?: boolean;
  count: number;
  seed?: number;
  /** §14.5: merged safeguard lists; the built-in lists when absent. */
  safeguards?: GroupSafeguards;
  /** Tests: only this role shape (its pattern) on the role route. */
  shape?: string;
  /** Settlement kit §4, §7.2: the home port and its neighbours. */
  context?: SettlementContext;
  /** Aircraft and land brief §9: individual craft, or the types and models they belong to. */
  naming?: VesselNaming;
}

export type VesselRoute = "style" | "hybrid" | "role" | "type";

export interface VesselName {
  /** The name with its prefix. */
  text: string;
  /** The name without its prefix (or code). */
  name: string;
  prefix?: string;
  /** Aircraft and land brief §12: the registration or running number shown with the name. */
  code?: string;
  route: VesselRoute;
  /** The role (role route), "hybrid", the style key, or the type family. */
  role: string;
  shape: string;
  function: string;
  level: string;
  customs: string;
  tones: GroupTone[];
  /** Every list word drawn, with its list (tests). */
  words: { list: string; word: string }[];
  series?: { anchor: string | null; value: string | null; counter: string | null };
}

export interface VesselBatch {
  names: VesselName[];
  seed: number;
  notices: string[];
  seriesTone?: GroupToneChoice;
}

// ── Drawing ─────────────────────────────────────────────────────────────────

interface Ctx {
  rng: () => number;
  module: VesselModule;
  setting: GroupSetting;
  culture: VesselCulture;
  mode: GroupPeople;
  tone: GroupToneChoice;
  /** The chosen technology level and the level its customs come from (§4.3). */
  level: string;
  customs: string;
  fn: string;
  style?: VesselStyle;
  /** §10.2: on the culture routes with a style, its pools join the shared lists. */
  boost: boolean;
  /** §14.4: sensitive cultures' poetic names are kept from styles and light or grim hybrids. */
  poeticAllowed: boolean;
  drawn: Set<GroupTone>;
  words: { list: string; word: string }[];
  pools: Map<string, [{ w: string; t: GroupTone[] }, number][]>;
  /** Settlement kit §4. */
  context?: SettlementContext;
  turn?: TownTurn;
  /** Aircraft and land brief §3.3: the highest native ship level, which the ships lists' tags read. */
  shipCustoms: string;
  naming: VesselNaming;
  /** §9.4: a rank draws only words with this initial. */
  rankInitial?: string;
}

/** Whether a tag `k` holds here. In the air and land modules a ship-level tag (T) reads the highest native ship level (Aircraft and land brief §3.3), AF and LF read the chosen level, and the rest the customs level. */
function tagOk(ctx: Ctx, k: string | undefined): boolean {
  if (!k) return true;
  if (!isAirLand(ctx.module)) return inRange(k, ctx.customs);
  if (k === "AF" || k === "LF") return ctx.level === k;
  if (k.charAt(0) === "T") return inRange(k, ctx.shipCustoms);
  return inRange(k, ctx.customs);
}

/** A shared ships shape's tag in the new modules: ship levels are ship-only, so such shapes stay in ships and spacecraft. */
function shapeTagOk(ctx: Ctx, k: string | undefined): boolean {
  if (isAirLand(ctx.module) && k && (k.charAt(0) === "T" || k.charAt(0) === "S")) return false;
  return tagOk(ctx, k);
}

const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];

/** Lists that come from group-names.json (§8.1), with their setting tags and tones. */
const GN_LISTS = new Set(["colour", "number", "ordinalWord", "greek", "land", "spaceLand", "sfBody", "compass", "star", "brandRoot", "surname", "weapon", "tech", "beast"]);
/** §10.3: every style's pools by name (the colony shapes of §11.2 draw on the colony style's). */
const STYLE_POOLS = new Map(VESSEL_DATA.styles.flatMap((st) => Object.entries(st.pools)));
/** Lists only some cultures have (§8.3); empty elsewhere. */
const CULTURE_ONLY = new Set(["poetic", "menaceExtra"]);
/** GN §8.2 / TS §2.5: never tone-weighted. */
const UNTONED = new Set(["surname"]);

/** §3.3: a culture's flavour animals. */
const ANIMALS = new Map<string, string[]>();
export function flavourAnimals(culture: VesselCulture): string[] {
  let found = ANIMALS.get(culture.key);
  if (found) return found;
  const f = culture.flavour;
  if (!f) found = [];
  else if (Array.isArray(f)) found = f;
  else if ("world" in f) found = worldAnimals(f.world);
  else found = [...(findTradition(f.tribal)?.flavour.animals ?? [])];
  ANIMALS.set(culture.key, found);
  return found;
}

/** §8.1 `seaLand`: the tradition's land and water words. */
function landWords(culture: VesselCulture): string[] {
  const f = culture.flavour;
  if (f && !Array.isArray(f) && "tribal" in f) {
    const t = findTradition(f.tribal);
    return [...(t?.flavour.land ?? []), ...(t?.flavour.water ?? [])];
  }
  if (f && !Array.isArray(f) && "world" in f) return cultureLand(f.world);
  return [];
}

/** §8.4: the god names for a culture's god shapes. */
function godWords(culture: VesselCulture): VesselEntry[] {
  const gods = culture.gods;
  if (!gods) return [];
  if (gods.list) return gods.list;
  const world = WORLD_CULTURES.find((c) => c.id === gods.world);
  return (world?.lists.god ?? []).map((w) => ({ w: stripPlural(w) }));
}

/** §8.4: the holy type at the customs level (Roman and Greek gods at T2, christian after). */
function holyType(ctx: Ctx): HolyType {
  const c = ctx.culture;
  if (c.gods?.k) return tagOk(ctx, c.gods.k) ? "gods" : c.holy;
  return c.holy;
}

/** The words a list offers here: §8.1 shared, a culture's own (§8.3), GN lists, style pools; `k`, tone. */
function pool(ctx: Ctx, name: string): [{ w: string; t: GroupTone[] }, number][] {
  const key = `${name}|${ctx.customs}|${ctx.level}|${ctx.boost}|${ctx.tone}${isAirLand(ctx.module) ? `|${ctx.fn}` : ""}`;
  const cached = ctx.pools.get(key);
  if (cached) return cached;
  const weights = new Map<string, { w: number; t: GroupTone[] }>();
  const add = (word: string, w: number, t: GroupTone[]) => {
    const prev = weights.get(word);
    if (prev) prev.w += w;
    else weights.set(word, { w, t });
  };
  const addEntries = (list: string, entries: VesselEntry[] | undefined, mult = 1) => {
    for (const e of entries ?? []) {
      if (!tagOk(ctx, e.k)) continue;
      if (e.only && !e.only.includes(ctx.culture.key)) continue;
      add(e.w, (e.x ?? 1) * mult, e.t ?? VESSEL_DATA.listTones[list] ?? AIR_LAND.listTones[list] ?? []);
    }
  };
  const own = ctx.culture.lists ?? {};
  const space = ctx.module === "spacecraft";
  const airLand = isAirLand(ctx.module);
  if (name === "techAdj" || name === "techNoun") {
    // §9: hybrids use the chosen level's words, not the customs level's.
    for (const e of (airLand ? AIR_LAND.techWords : VESSEL_DATA.techWords)[ctx.level]?.[name] ?? []) add(e.w, e.x ?? 1, e.t ?? []);
  } else if (airLand && AIR_LAND.moduleLists[ctx.module]?.[name]) {
    // Aircraft and land brief §4.5: the sea words read per module.
    addEntries(name, AIR_LAND.moduleLists[ctx.module][name]);
  } else if (airLand && AIR_LAND.lists[name]) {
    addEntries(name, AIR_LAND.lists[name]);
  } else if (name === "god") {
    addEntries(name, godWords(ctx.culture));
  } else if (name === "beast") {
    for (const [w, n] of groupListWords("beast", ctx.setting)) add(w, n, wordTones("beast", w));
    for (const w of flavourAnimals(ctx.culture)) {
      const prev = weights.get(w);
      if (prev) prev.w *= 3;
      else add(w, 3, []);
    }
    addEntries("beast", own.beastExtra);
  } else if (name === "seaLand" && space) {
    // §11.3: spacecraft read spaceLand.
    for (const [w, n] of groupListWords("spaceLand", "SF")) add(w, n, wordTones("spaceLand", w));
  } else if (name === "seaLand") {
    addEntries(name, VESSEL_DATA.lists.seaLand);
    for (const w of landWords(ctx.culture)) add(stripPlural(w), 2, []);
  } else if (name === "seaAdj" && space) {
    addEntries(name, VESSEL_DATA.lists.spaceSeaAdj);
  } else if (name === "designationWord" && space) {
    addEntries(name, VESSEL_DATA.lists.spaceDesignationWord);
  } else if (name === "numberWord") {
    for (const [w, n] of groupListWords("number", ctx.setting)) add(w, n, wordTones("number", w));
  } else if (own[name]) {
    addEntries(name, own[name]);
  } else if (VESSEL_DATA.lists[name]) {
    addEntries(name, VESSEL_DATA.lists[name]);
  } else if (GN_LISTS.has(name)) {
    for (const [w, n] of groupListWords(name, ctx.setting)) add(w, n, wordTones(name, w));
  } else if (name === "name" && ctx.style) {
    addEntries(name, ctx.style.name);
  } else if (name === "colonyName") {
    // §11.2: the colony style's whole names.
    addEntries(name, VESSEL_DATA.styles.find((st) => st.key === "colony")?.name);
  } else if (STYLE_POOLS.has(name)) {
    addEntries(name, (ctx.style?.pools[name] ?? STYLE_POOLS.get(name)));
  } else if (!CULTURE_ONLY.has(name)) {
    throw new Error(`Vessels: no list “${name}”.`);
  }
  if (airLand) {
    // Aircraft and land brief §8: a culture's additions for a module and function.
    for (const a of AIR_LAND.cultureAdds) {
      if (a.culture === ctx.culture.key && a.module === ctx.module && a.list === name && a.fn.includes(ctx.fn)) addEntries(name, a.words);
    }
    // §7.12: at LF the dwarven style's pools join virtue and beast at ×2.
    if (ctx.level === "LF" && (name === "virtue" || name === "beast")) {
      const dwarven = VESSEL_DATA.styles.find((st) => st.key === "dwarven")!;
      for (const entries of Object.values(dwarven.pools)) for (const e of entries) add(e.w, (e.x ?? 1) * 2, e.t ?? []);
    }
  }
  // §10.2: the style's *Adj pools join virtueAdj and skyAdj, its *Noun pools virtue and sky, at ×3.
  if (ctx.boost && ctx.style) {
    const suffix = name === "virtueAdj" || name === "skyAdj" ? "Adj" : name === "virtue" || name === "sky" ? "Noun" : undefined;
    if (suffix) {
      for (const [pool, entries] of Object.entries(ctx.style.pools)) {
        if (!new RegExp(`${suffix}\\d*$`).test(pool)) continue;
        for (const e of entries) add(e.w, VESSEL_DATA.styleShare.poolMultiplier, ctx.style.tone ? [ctx.style.tone] : []);
      }
    }
  }
  const tone = !UNTONED.has(name) && ctx.tone !== "any";
  const out = [...weights]
    .map(([w, { w: n, t }]): [{ w: string; t: GroupTone[] }, number] => [{ w, t }, tone ? n * toneFactor(t, ctx.tone) : n])
    .filter(([, n]) => n > 0);
  ctx.pools.set(key, out);
  return out;
}

/** A word from a list, its tones noted; words holding tokens (`Pearl of {town}`) are rendered. */
function listWord(ctx: Ctx, name: string, filter?: (w: string) => boolean): string | undefined {
  const items = filter ? pool(ctx, name).filter(([e]) => filter(e.w)) : pool(ctx, name);
  const pick = pickWeighted(items, ctx.rng);
  if (!pick) return undefined;
  for (const t of pick.t) ctx.drawn.add(t);
  ctx.words.push({ list: name, word: pick.w });
  return pick.w.includes("{") ? renderPattern(ctx, pick.w) : pick.w;
}

/** §12.2: an invented place; spacecraft in SF use the GN §8.4 SF row. */
function town(ctx: Ctx): string | undefined {
  const rng = ctx.rng;
  if (ctx.module === "spacecraft" && ctx.setting === "SF") return groupTown("SF", undefined, rng);
  const source = ctx.culture.town === "compound" ? undefined : ctx.culture.town;
  // Ships in sci-fi keep their culture's places.
  const setting = ctx.setting === "SF" ? "MR" : ctx.setting;
  // §14.3: no deity or saint names in the no-gods cultures' places (bynames' rule).
  const holy = holyNamesIn(ctx.culture.key);
  for (let i = 0; i < 20; i++) {
    const t = groupTown(setting, source, rng);
    if (!holy || !holy.test(t)) return t;
  }
  return undefined;
}

/** §8.2: `{person}`'s label by function. */
const personLabel = (ctx: Ctx) => VESSEL_DATA.personLabels[ctx.fn] ?? "owner";

function inventedPerson(ctx: Ctx): string | undefined {
  return groupPerson(ctx.setting, !!ctx.culture.surnames, ctx.rng, flavourAnimals(ctx.culture));
}

const POETIC_SHORT = (w: string) => w.split(" ").length <= 5 && !/^(The|We|Where) /.test(w);

/** One token (§8, §9, §12). */
function token(ctx: Ctx, name: string): string | undefined {
  if (name.includes("+")) {
    // §13: closed compounds, the second part lower case ({wAdj+wake}: Stonewake).
    const [a, b] = name.split("+");
    const first = token(ctx, a);
    const second = VESSEL_DATA.lists[b] || STYLE_POOLS.has(b) ? token(ctx, b) : b;
    return first && second ? first + second.toLowerCase() : undefined;
  }
  return baseToken(ctx, name);
}

const withMod = (text: string, mod: string | undefined) => (mod === "poss" ? groupPossessive(text, false) : mod === "lower" ? text.toLowerCase() : text);

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
/** Aircraft and land brief §9.2: the birds a culture knows (BT's culture animals that are birds), else the temperate biome's. */
const BIRD_SET = new Set(BIOMES.flatMap((b) => b.birds.map(([w]) => w.toLowerCase())));
const BIRDS = new Map<string, string[]>();
function birdWords(culture: VesselCulture): string[] {
  let found = BIRDS.get(culture.key);
  if (!found) {
    const own = [...cultureAnimals(culture.key), ...flavourAnimals(culture)].filter((w) => BIRD_SET.has(w.toLowerCase()));
    found = [...new Set(own.length > 0 ? own : (findBiome("temperate")?.birds ?? []).map(([w]) => w))];
    BIRDS.set(culture.key, found);
  }
  return found;
}

function baseToken(ctx: Ctx, name: string): string | undefined {
  const rng = ctx.rng;
  const placeholders = ctx.mode === "placeholders";
  switch (name) {
    case "star":
      return groupStarIn("any", ctx.mode, rng);
    case "town":
      // Settlement kit §7.2: the home port, or one of its neighbours.
      if (ctx.turn) return ctx.turn.next(rng);
      return placeholders ? "[place]" : town(ctx);
    case "surname":
      return placeholders ? "[surname]" : listWord(ctx, "surname");
    case "womanName":
      return placeholders ? "[woman's name]" : listWord(ctx, "womanName");
    case "person":
      return placeholders ? `[${personLabel(ctx)}]` : inventedPerson(ctx);
    case "president":
      return placeholders ? "[president]" : inventedPerson(ctx);
    case "scientist":
      return placeholders ? "[scientist]" : inventedPerson(ctx);
    case "holy":
      return placeholders ? "[holy person]" : groupSaint(ctx.setting, rng);
    case "n":
      return String(1 + Math.floor(rng() * 99));
    case "ordinal": {
      const choices: [number, number][] = [];
      for (let n = 1; n <= 99; n++) choices.push([n, n <= 12 ? 3 : n <= 30 ? 1 : 0.2]);
      return ordinalText(pickWeighted(choices, rng)!);
    }
    case "poetic":
      return ctx.poeticAllowed ? listWord(ctx, "poetic") : undefined;
    case "poeticShort":
      return ctx.poeticAllowed ? listWord(ctx, "poetic", POETIC_SHORT) : undefined;
    case "bird": {
      const birds = birdWords(ctx.culture);
      return birds.length > 0 ? pickOne(birds, rng) : undefined;
    }
    case "manName":
      return placeholders ? "[man's name]" : AIR_LAND.manNameCultures.includes(ctx.culture.key) ? listWord(ctx, "manName") : undefined;
    case "realm": {
      if (placeholders) return "[realm]";
      // A realm's short form (Realms brief §11), for the setting's age.
      const seed = Math.floor(rng() * 0x100000000);
      const era = ctx.setting === "SF" ? "interstellar" : ctx.setting === "MR" || ctx.setting === "MF" ? "modern" : "medieval";
      const genre = ctx.setting === "SF" ? "scifi" : ctx.setting === "MR" || ctx.setting === "MF" ? "modern" : "fantasy";
      const realmCulture = ["general", "anglo-saxon", "norse", "celtic", "norman-british", "roman", "greek-byzantine", "slavic", "steppe", "arabic-persian", "indian", "chinese", "japanese", "korean", "egyptian", "ethiopian", "bantu", "west-african", "aztec", "maya"].includes(ctx.culture.key) ? ctx.culture.key : "general";
      return realmSource?.({ culture: realmCulture, era, genre, seed });
    }
    case "exoticTown":
      // §9.2: a town from the roman world culture's pool (cars named for warm resorts).
      return placeholders ? "[place]" : groupTown(ctx.setting === "SF" ? "MR" : ctx.setting, "roman", rng);
    case "call": {
      // §7.3: a letter and its wartime word, "K for King" or "D-Dog".
      const word = pickOne(AIR_LAND.phonetic, rng);
      return `${word.charAt(0)}${rng() < 0.5 ? " for " : "-"}${word}`;
    }
    case "A":
    case "AA": {
      // §9.2 designations: capital letters ("SS" is never drawn).
      for (let i = 0; i < 20; i++) {
        const text = Array.from({ length: name.length }, () => LETTERS[Math.floor(rng() * 26)]).join("");
        if (text !== "SS") return text;
      }
      return "KA";
    }
    case "n23":
      return String(10 + Math.floor(rng() * 990));
    case "n100":
      return String(1 + Math.floor(rng() * 100));
    case "rank":
      return listWord(ctx, "rank", ctx.rankInitial ? (w) => w.startsWith(ctx.rankInitial!) : undefined);
    case "cultureNoun": {
      // §9.3: a word from the culture's beast, sky or virtue list, or a whole poetic name.
      const sources = ["beast", "sky", "virtue", ...(ctx.poeticAllowed && pool(ctx, "poetic").length > 0 ? ["poetic"] : [])];
      return listWord(ctx, pickOne(sources, rng));
    }
  }
  return listWord(ctx, name);
}

/** TS §3: a top-level token as drawn. */
interface Drawn {
  name: string;
  text: string;
}

/** The words a name drew, lower case: a class or family draws no word twice (Aircraft and land brief §9.5, §11.1). */
const drawnWords = (record: Drawn[]) => record.flatMap((d) => d.text.toLowerCase().split(/[\s-]+/)).filter((w) => w && !SMALL.has(w));

/** TS §3: values held fixed in a class (by token position, or for the anchor's token), and the record. */
interface Hooks {
  byIndex?: Map<number, Drawn>;
  byName?: Drawn;
  record?: Drawn[];
}

/** Renders a pattern's tokens; undefined when one has nothing to offer. */
function renderPattern(ctx: Ctx, pattern: string, hooks?: Hooks): string | undefined {
  const outer = ctx.turn;
  if (ctx.context) ctx.turn = new TownTurn(ctx.context, VESSEL_SELF.has(pattern));
  try {
    return renderTokens(ctx, pattern, hooks);
  } finally {
    ctx.turn = outer;
  }
}

function renderTokens(ctx: Ctx, pattern: string, hooks?: Hooks): string | undefined {
  let failed = false;
  let index = -1;
  let nameUsed = false;
  const out = pattern.replace(/\{([^}]+)\}/g, (_m, raw: string, at: number) => {
    if (failed) return "";
    index++;
    const [name, mod] = raw.split(":");
    let piece: string | undefined;
    const fixed = hooks?.byIndex?.get(index);
    if (fixed) piece = fixed.text;
    else if (hooks?.byName && !nameUsed && hooks.byName.name === name) {
      piece = hooks.byName.text;
      nameUsed = true;
    } else piece = token(ctx, name);
    // Stellar brief §11.1: "Kapteyn's Star" + Haven reads "Kapteyn's Haven".
    if (piece && name === "star" && pattern === "{star} Haven") piece = piece.replace(/('s) Star$/, "$1");
    // "Star of the West", as §8.2's example has it: the compass word's noun after "of the".
    if (piece && name === "compass" && pattern.slice(0, at).endsWith("of the ")) piece = piece.replace(/ern$/, "");
    if (piece === undefined || piece === "") {
      failed = true;
      return "";
    }
    hooks?.record?.push({ name, text: piece });
    return withMod(piece, mod);
  });
  return failed ? undefined : out;
}

// ── Rendering (§13) ─────────────────────────────────────────────────────────

const SMALL = new Set([
  "of", "the", "and", "for", "in", "at", "by", "on", "to", "from", "over", "upon", "beyond", "beneath", "among", "across", "through",
  "between", "above", "into", "with", "before",
]);

/** §13: every word capitalised but the small words; a leading "The" is capitalised (ship names stand alone). */
export function vesselCapitals(text: string): string {
  return text
    .split(" ")
    .map((word, i) => {
      if (!word || word.startsWith("[")) return word;
      const lower = word.toLowerCase();
      if (SMALL.has(lower) && i > 0) return lower;
      return word.replace(/(^|[-–])([a-z])/g, (_m, sep: string, c: string) => sep + c.toUpperCase());
    })
    .join(" ");
}

/** §5, GN §11.2: content words, a leading "The" and the small words not counted. */
const countedWords = (text: string) => text.split(" ").filter((w, i) => w && !(i === 0 && w === "The") && !SMALL.has(w.toLowerCase()));

// ── Safeguards (§14) ────────────────────────────────────────────────────────

const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const BANNED = VESSEL_DATA.safeguards.banned.map(wordRe);
const DIVINE = new RegExp(`(^|[^\\p{L}])(${VESSEL_DATA.safeguards.divine.join("|")})(?=$|[^\\p{L}])`, "giu");

/** §14.3: a living religion's divine name becomes the placeholder [deity] ("of God" → "of [deity]"). */
export function withDeityPlaceholders(text: string): string {
  return text.replace(DIVINE, (_m, before: string) => `${before}[deity]`);
}

/** §14.3: banned words (GN and vessel lists); divine names are replaced, not redrawn. */
export function breaksVesselWords(text: string, module?: VesselModule): boolean {
  if (hasBannedWord(text) || BANNED.some((re) => re.test(text))) return true;
  // Aircraft and land brief §14.3: the money module's list, and the names of real peoples and nations.
  if (module && isAirLand(module)) return MONEY_BANNED.some((re) => re.test(text)) || AL_BANNED.some((re) => re.test(text)) || AL_BANNED_NAMES.has(normForBlock(text));
  return false;
}

/** The money module's banned words (MC §13.3), read from its data (the money engine imports this one). */
const MONEY_BANNED = (moneyData as unknown as { safeguards: { banned: string[] } }).safeguards.banned.map(wordRe);

/** A realm's short form (Realms brief §11) for the `{realm}` token: set by the realms engine when it loads. */
type RealmSource = (options: { culture: string; era: string; genre: "fantasy" | "modern" | "scifi"; seed: number }) => string | undefined;
let realmSource: RealmSource | undefined;
export function registerRealmSource(source: RealmSource): void {
  realmSource = source;
}

const AL_BANNED = AIR_LAND.safeguards.bannedWords.map(wordRe);
const AL_BANNED_NAMES = new Set(AIR_LAND.safeguards.bannedNames.map(normForBlock));

interface Guard {
  block: Set<string>;
  prefixed: Set<string>;
  /** Aircraft and land brief §14.1: the common single words that only types and models block. */
  typesOnly: Set<string>;
}

/** §14.1: the block lists for a module, merged with the safeguard packs' lists. */
function guardFor(module: VesselModule, guards: GroupSafeguards): Guard {
  const s = VESSEL_DATA.safeguards;
  const block = new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(normForBlock));
  if (module === "spacecraft") for (const w of s.blockSpacecraft) block.add(normForBlock(w));
  if (isAirLand(module)) for (const w of AIR_LAND.safeguards.block) block.add(normForBlock(w));
  return { block, prefixed: new Set(s.blockPrefixed.map(normForBlock)), typesOnly: new Set(isAirLand(module) ? AIR_LAND.safeguards.blockTypesOnly.map(normForBlock) : []) };
}

function blocked(ctx: Ctx, guard: Guard, name: string, prefix?: string): boolean {
  const n = normForBlock(name);
  if (guard.block.has(n)) return true;
  if (ctx.naming === "types" && guard.typesOnly.has(n)) return true;
  for (const u of VESSEL_DATA.safeguards.blockUnless) {
    if (n === normForBlock(u.w) && !(ctx.culture.key === u.culture && tagOk(ctx, u.k))) return true;
  }
  if (prefix && (guard.prefixed.has(normForBlock(`${prefix} ${name}`)) || VESSEL_DATA.safeguards.blockPrefixes.includes(prefix))) return true;
  return false;
}

/** §5, §13, §14: length, repetition and safeguards. */
function acceptable(ctx: Ctx, guard: Guard, name: string): boolean {
  const counted = countedWords(name);
  if (counted.length === 0 || counted.length > 8) return false;
  if (repeatsContent(counted)) return false;
  if (blocked(ctx, guard, name)) return false;
  if (breaksVesselWords(name, ctx.module)) return false;
  if (ctx.module === "spacecraft" && hasSpaceBlock(name)) return false;
  return true;
}

// ── Roles and shapes (§7, §8) ───────────────────────────────────────────────

const SENSITIVE_TOKENS = new RegExp(`\\{(${VESSEL_DATA.safeguards.sensitiveLists.join("|")})[}:]`);

/** TS §2.4: a shape's own tones plus the list tones of every list its tokens name. */
export function vesselShapeTones(p: string, own: GroupTone[] = []): GroupTone[] {
  const out = new Set<GroupTone>(own);
  for (const m of p.matchAll(/\{([^}:+]+)/g)) for (const t of VESSEL_DATA.listTones[m[1]] ?? []) out.add(t);
  return GROUP_TONES.filter((t) => out.has(t));
}

/** §7: the role weights for a function here; base × culture × techRoles at the customs level. */
function roleWeights(ctx: Ctx): [string, number][] {
  const c = ctx.culture;
  const airLand = isAirLand(ctx.module);
  const base = airLand ? { ...AIR_LAND.roleWeights[ctx.module][ctx.fn] } : { ...VESSEL_DATA.roleWeights[ctx.module][ctx.fn] };
  if (airLand) {
    // Aircraft and land brief §6.2–§6.3: the level rules on the roles.
    const rules = AIR_LAND.roleRules[ctx.module];
    for (const [role, levels] of Object.entries(rules.zeroOutside ?? {})) if (!levels.includes(ctx.level)) delete base[role];
    for (const role of rules.zeroAt?.[ctx.level] ?? []) delete base[role];
    for (const [role, m] of Object.entries(rules.multAt?.[ctx.level] ?? {})) if (base[role] !== undefined) base[role] *= m;
    for (const [role, fns] of Object.entries(rules.zeroInFn ?? {})) if (fns[ctx.fn]?.includes(ctx.level)) delete base[role];
  }
  for (const e of airLand ? [] : VESSEL_DATA.roleExtras) {
    if (e.module === ctx.module && e.function === ctx.fn && tagOk(ctx, e.k)) base[e.role] = (base[e.role] ?? 0) + e.w;
  }
  // §11: stations and colony ships also draw on their own shapes, as a role beside the others.
  if (ctx.module === "spacecraft" && (ctx.fn === "station" || ctx.fn === "colony")) base[ctx.fn] = 100;
  const out: [string, number][] = [];
  for (const [role, w] of Object.entries(base)) {
    let n = w * (c.roles?.[role] ?? 1);
    if (airLand) n *= AIR_LAND.cultureRoles[ctx.module]?.[c.key]?.[role] ?? 1;
    for (const [k, mults] of Object.entries(c.techRoles ?? {})) if (tagOk(ctx, k)) n *= mults[role] ?? 1;
    if (role === "holy" && holyType(ctx) === "none") n = 0;
    // §14.4: no affection, menace or leisure names for the sensitive cultures; no poetic with a style.
    if (c.sensitive && ["affection", "menace", "leisure", ...(airLand ? AIR_LAND.sensitiveRoles[ctx.module] : [])].includes(role)) n = 0;
    if (role === "poetic" && !ctx.poeticAllowed) n = 0;
    if (n > 0) out.push([role, n]);
  }
  return out;
}

/** §8.2–§8.4: the live shapes for a role, weighted (k, setting, function, holy type, people, tone). */
function roleShapes(ctx: Ctx, role: string, only?: string): [VesselShape, number][] {
  const c = ctx.culture;
  const holy = holyType(ctx);
  const shapes: VesselShape[] = [...VESSEL_DATA.shapes.filter((s) => s.role === role), ...(c.shapes ?? []).filter((s) => s.role === role)];
  const airLand = isAirLand(ctx.module);
  // Aircraft and land brief §7: the new modules' shapes, limited by module, culture and level.
  if (airLand) for (const sh of AIR_LAND.shapes) if (sh.role === role && sh.mod?.includes(ctx.module)) shapes.push(sh);
  if (role === "station" || role === "colony") for (const sh of VESSEL_DATA.space[role]) shapes.push({ role, p: sh.p, w: sh.w });
  if (role === "holy" && holy === "gods") for (const g of c.gods?.shapes ?? []) if (!(isAirLand(ctx.module) && AIR_LAND.shipOnlyShapes.includes(g.p))) shapes.push({ role, p: g.p, w: g.w });
  const out: [VesselShape, number][] = [];
  for (const shape of shapes) {
    if (only && shape.p !== only) continue;
    if (shape.cult && !shape.cult.includes(c.key)) continue;
    if (!(shape.mod ? tagOk(ctx, shape.k) : shapeTagOk(ctx, shape.k))) continue;
    if (shape.s && !shape.s.includes(ctx.setting)) continue;
    if (shape.fn && !shape.fn.includes(ctx.fn)) continue;
    let w = shape.w * (shape.cx?.[c.key] ?? 1) * (shape.atx?.[ctx.level] ?? 1);
    if (shape.holy) {
      const saints = holy === "christian" && !c.noSaints;
      const ok =
        shape.holy === "saint" ? saints : shape.holy === "marian" ? saints && !!c.marian : shape.holy === "blessing" ? holy !== "none" : holy === "christian" || holy === "blessing";
      if (!ok) continue;
      if (shape.holy === "saint") w *= c.holyX ?? 1;
      if (shape.holy === "marian") w *= c.marian ?? 1;
    }
    if (shape.p.includes("{poetic}") && (!ctx.poeticAllowed || !(c.lists?.poetic?.length))) continue;
    // GN §8.3: invented women's names and surnames only where the culture has them.
    if (ctx.mode === "invented" && shape.p.includes("{womanName}") && !c.womanNames) continue;
    if (ctx.mode === "invented" && shape.p.includes("{surname}") && !c.surnames) continue;
    if (ctx.mode === "invented" && shape.p.includes("{manName}") && !AIR_LAND.manNameCultures.includes(c.key)) continue;
    if (c.sensitive && SENSITIVE_TOKENS.test(shape.p)) continue;
    w *= toneFactor(vesselShapeTones(shape.p, shape.t), ctx.tone);
    if (w > 0) out.push([shape, w]);
  }
  return out;
}

/** §11.3: spacecraft name cities with "Pride of". */
const spacePattern = (ctx: Ctx, p: string) => (ctx.module === "spacecraft" ? p.replace(/^City of /, "Pride of ") : p);

/** A name's route, role and pattern: what a class holds fixed (TS §3). */
interface Plan {
  route: VesselRoute;
  role: string;
  p: string;
  tones: GroupTone[];
  /** Aircraft and land brief §7.4: the locomotive class theme the shape belongs to. */
  theme?: string;
}

interface Built {
  name: string;
  plan: Plan;
  tones: GroupTone[];
  record: Drawn[];
}

function renderPlan(ctx: Ctx, plan: Plan, hooks: Hooks = {}): Built | undefined {
  ctx.drawn = new Set();
  ctx.words = [];
  const record: Drawn[] = [];
  const raw = renderPattern(ctx, plan.p, { ...hooks, record });
  if (!raw) return undefined;
  const name = vesselCapitals(withDeityPlaceholders(raw).replace(/\s+/g, " ").trim());
  const tones = new Set<GroupTone>([...plan.tones, ...ctx.drawn]);
  return { name, plan, record, tones: GROUP_TONES.filter((t) => tones.has(t)) };
}

/** The role route's patterns (§7, §8; §11.3 in spacecraft). */
function rolePlans(ctx: Ctx, role: string, only?: string): [Plan, number][] {
  return roleShapes(ctx, role, only).map(([s, w]): [Plan, number] => [{ route: "role", role, p: spacePattern(ctx, s.p), tones: vesselShapeTones(s.p, s.t), ...(s.theme ? { theme: s.theme } : {}) }, w]);
}

/** §9.3: the hybrid patterns; `{techAdj} {poetic}` only with a short poetic name. */
function hybridPlans(ctx: Ctx): [Plan, number][] {
  const poetic = ctx.poeticAllowed && pool(ctx, "poetic").some(([e]) => POETIC_SHORT(e.w));
  return VESSEL_DATA.hybrids.shapes
    .filter((s) => poetic || !s.p.includes("{poetic}"))
    .map((s): [Plan, number] => [{ route: "hybrid", role: "hybrid", p: s.p.replace("{poetic}", "{poeticShort}"), tones: [] }, s.w]);
}

/** §10.3: the style's shapes, equal weights, its tone on each (§10.4); never a sensitive culture's light or grim lists. */
function stylePlans(ctx: Ctx): [Plan, number][] {
  const st = ctx.style!;
  const tones = st.tone ? [st.tone] : [];
  return st.shapes
    .filter((p) => !(ctx.culture.sensitive && SENSITIVE_TOKENS.test(p)))
    .map((p): [Plan, number] => [{ route: "style", role: st.key, p, tones: vesselShapeTones(p, tones) }, toneFactor(vesselShapeTones(p, tones), ctx.tone)])
    .filter(([, w]) => w > 0);
}

/** §10.1: the styles a module offers in a setting. */
export function availableStyles(module: VesselModule, setting: GroupSetting, technology?: string): VesselStyle[] {
  if (isAirLand(module)) {
    // Aircraft and land brief §13: the styles each module offers, some only with a fantastic level chosen.
    return VESSEL_DATA.styles
      .filter((st) => {
        const rule = AIR_LAND.styles[st.key]?.[module];
        if (!rule || !st.settings.includes(setting)) return false;
        if (rule === true) return true;
        return (Array.isArray(rule) ? rule : [rule]).includes(technology ?? "");
      })
      .map((st) => (AIR_LAND.styleLabels[module]?.[st.key] ? { ...st, label: AIR_LAND.styleLabels[module][st.key] } : st));
  }
  return VESSEL_DATA.styles.filter((st) => st.modules.includes(module) && st.settings.includes(setting));
}

/** §12.3: whether prefixes can show: the link is on in MR, MF and SF. */
export const prefixSetting = (setting: GroupSetting) => setting === "MR" || setting === "MF" || setting === "SF";

/** §12.3: the real-world prefix rows that apply to a name. */
function realPrefix(ctx: Ctx): string | undefined {
  const rows = VESSEL_DATA.prefixes.real.filter(
    (r) => (!r.cultures || r.cultures.includes(ctx.culture.key)) && r.fn.includes(ctx.fn) && inRange(r.k, ctx.level),
  );
  return pickWeighted(rows.map((r): [string, number] => [r.p, r.x ?? 1]), ctx.rng);
}

// ── Classes (TS §3) ─────────────────────────────────────────────────────────

/** Tokens that render as placeholders in placeholder mode, and tokens that are never anchors. */
const PLACEHOLDER_TOKENS = new Set(["town", "surname", "womanName", "person", "president", "scientist", "holy", "manName", "realm"]);
const NEVER_ANCHORS = new Set(["person", "president", "scientist", "holy"]);
const kindOf = (name: string) => (NEVER_ANCHORS.has(name) ? "never" : seriesTokenKind(name));

/** TS §3.4: a counter's values from its first, ascending. */
function* counterValues(ctx: Ctx, name: string, first: string): Generator<string> {
  if (name === "ordinal") {
    for (let n = parseInt(first, 10); n <= 99; n += counterGap(ctx.rng)) yield ordinalText(n);
    return;
  }
  const words = [...new Set(groupListWords(name, ctx.setting).map(([w]) => w))];
  for (let i = words.indexOf(first); i >= 0 && i < words.length; i += counterGap(ctx.rng)) yield words[i];
}

const lightOrGrim = (tone: GroupToneChoice) => tone === "light" || tone === "grim";

// ── Codes (Aircraft and land brief §12) ─────────────────────────────────────

/** Fills a code pattern: `{A}` a capital, `{d}` a digit (the first never 0), `{n999}` a number to 999, `{L}` a letter. */
function fillCode(pattern: string, rng: () => number): string {
  return pattern
    .replace(/\{(A+)\}/g, (_m, a: string) => Array.from({ length: a.length }, () => LETTERS[Math.floor(rng() * 26)]).join(""))
    .replace(/\{(d+)\}/g, (_m, d: string) => Array.from({ length: d.length }, (_x, i) => String(i === 0 ? 1 + Math.floor(rng() * 9) : Math.floor(rng() * 10))).join(""))
    .replace("{n999}", () => String(1 + Math.floor(rng() * 999)))
    .replace("{L}", () => LETTERS[Math.floor(rng() * 26)]);
}

/** §12: the code a craft shows, or undefined where no row applies. `before` goes in front of the name; `after` in brackets behind it. */
function makeCode(ctx: Ctx, rng: () => number, classLetter?: string): { before?: string; after?: string } | undefined {
  const level = ctx.level;
  const clean = (code: string) => !breaksVesselWords(code, ctx.module) && !/SS|KKK/.test(code);
  const draw = (patterns: string[], letter?: string): string | undefined => {
    for (let i = 0; i < 12; i++) {
      const code = fillCode(pickOne(patterns, rng), rng);
      const lettered = letter ? code.replace(/^[A-Z]/, letter) : code;
      if (clean(lettered)) return lettered;
    }
    return undefined;
  };
  if (ctx.module === "aircraft") {
    const codes = AIR_LAND.codes.aircraft;
    if (level === "A1" || level === "AF") return undefined;
    if (ctx.setting === "SF") {
      const code = draw(codes.sf);
      return code ? { after: code } : undefined;
    }
    const military = codes.military.includes(ctx.fn);
    const row = codes.rows.find((r) => r.cultures.includes(ctx.culture.key) && inRange(r.k, level) && (r.kind === "any" ? level === "A2" : r.kind === (military ? "military" : "civil")));
    const code = row ? draw(row.patterns) : undefined;
    return code ? { after: code } : undefined;
  }
  const row = AIR_LAND.codes.landVehicles.rows.find(
    (r) => r.fn.includes(ctx.fn) && inRange(r.k, level) && (!r.cultures || r.cultures.includes(ctx.culture.key)) && !r.notCultures?.includes(ctx.culture.key),
  );
  if (!row) return undefined;
  const code = draw(row.patterns, row.patterns[0].startsWith("{L}") ? classLetter : undefined);
  return code ? { before: code } : undefined;
}

// ── Types and models (Aircraft and land brief §9) ───────────────────────────

/** §9.3: the family weights for a function at a level, with the level rules and the culture's leanings. */
function typeFamilyPool(ctx: Ctx): [string, number][] {
  const T = AIR_LAND.types;
  const rules = T.levelRules[ctx.module] ?? {};
  let w: Record<string, number> = { ...(T.weights[ctx.module][ctx.fn] ?? {}) };
  const replace = rules[`${ctx.level}:${ctx.fn}`];
  if (replace?.replace) w = { ...replace.replace };
  else {
    const rule = rules[ctx.level];
    if (rule?.keep) w = Object.fromEntries(Object.entries(w).filter(([f]) => rule.keep!.includes(f)));
    for (const [f, n] of Object.entries(rule?.add ?? {})) w[f] = (w[f] ?? 0) + n;
  }
  const lean = T.leanings[ctx.culture.key] ?? {};
  return Object.entries(w)
    .map(([f, n]): [string, number] => [f, n * (lean[f] ?? 1)])
    .filter(([, n]) => n > 0);
}

interface TypeShape {
  p: string;
  w: number;
  t: GroupTone[];
  key?: string;
}

/** §9.2: a family's shapes here (designations by module, level and function). */
function typeShapes(ctx: Ctx, family: string): TypeShape[] {
  const T = AIR_LAND.types;
  if (family === "designation") {
    const lean = T.designationLean[ctx.culture.key];
    const all = Object.entries(T.designation[ctx.module] ?? {})
      .map(([key, v]): TypeShape & { k?: string; fn?: string[] } => (typeof v === "string" ? { key, p: v, w: 1, t: ["plain"] } : { key, p: v.p, w: 1, t: ["plain"], k: v.k, fn: v.fn }))
      .filter((sh) => tagOk(ctx, sh.k) && (!sh.fn || sh.fn.includes(ctx.fn)));
    const leaned = lean ? all.filter((sh) => lean.includes(sh.key!)) : [];
    return leaned.length > 0 ? leaned : all;
  }
  return (T.families[family] ?? []).map((v): TypeShape => (typeof v === "string" ? { p: v, w: 1, t: [] } : { p: v.p, w: v.w ?? 1, t: v.t ?? [] }));
}

/** The type families whose shapes hold a fixed letter prefix and a rising number. */

// ── Batches ─────────────────────────────────────────────────────────────────

/** §5: a batch of unique names. */
export function generateVesselNames(options: VesselOptions): VesselBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const module = options.module;
  const notices: string[] = [];
  const culture = findVesselCulture(options.culture) ?? VESSEL_CULTURES[0];
  const genre = options.genre ?? (module === "spacecraft" ? "scifi" : isAirLand(module) ? "modern" : "fantasy");
  const setting = groupSetting(genre, genre === "scifi" ? false : !!options.fantastic);
  let tone = options.tone ?? "any";
  const naming: VesselNaming = isAirLand(module) && options.naming === "types" ? "types" : "craft";
  const levels = techChoices(module, setting);
  let technology = options.technology ?? "any";
  if (technology !== "any" && !levels.includes(technology)) {
    notices.push(`“${technology}” isn't available here; using any technology.`);
    technology = "any";
  }
  const functions = availableFunctions(module, culture.key, technology, setting, naming);
  const chosenFn = options.function ? functions.find((f) => f.key === options.function) : undefined;
  if (options.function && !chosenFn) notices.push(`“${options.function}” isn't available here; using any function.`);
  let style = options.style && options.style !== "none" ? availableStyles(module, setting, technology).find((st) => st.key === options.style) : undefined;
  if (options.style && options.style !== "none" && !style) notices.push(`Style “${options.style}” isn't available here.`);
  // Aircraft and land brief §9: types and models are named by family, not by style.
  if (style && naming === "types") {
    notices.push("Styles don't apply to types and models.");
    style = undefined;
  }
  const guards =
    options.safeguards ??
    (isAirLand(module)
      ? { block: AIR_LAND.safeguards.block, flag: AIR_LAND.safeguards.flag, flagListBlocks: AIR_LAND.safeguards.flagListBlocks }
      : { block: VESSEL_DATA.safeguards.block, flag: VESSEL_DATA.safeguards.flag, flagListBlocks: VESSEL_DATA.safeguards.flagListBlocks });
  const guard = guardFor(module, guards);
  const pools = new Map<string, [{ w: string; t: GroupTone[] }, number][]>();
  const count = Math.max(0, Math.floor(options.count));
  const prefixes = !!options.prefixes && prefixSetting(setting);
  // §12.3: in sci-fi, one prefix per function for the whole batch.
  const sfPrefixes = new Map<string, string | undefined>();
  const sfPrefix = (fn: string) => {
    if (!sfPrefixes.has(fn)) {
      const list = VESSEL_DATA.prefixes.sf[fn];
      sfPrefixes.set(fn, list ? pickOne(list, rng) : undefined);
    }
    return sfPrefixes.get(fn);
  };
  // §10.2: a style's share of names (General 85%); §14.4: oceanic never draws on a sensitive culture's lists.
  const styleShare = !style ? 0 : style.key === "oceanic" && culture.sensitive ? 1 : culture.key === "general" ? VESSEL_DATA.styleShare.general : VESSEL_DATA.styleShare.default;

  const newCtx = (level: string, fn: string): Ctx => ({
    rng,
    module,
    setting,
    culture,
    mode: options.people ?? "placeholders",
    tone,
    level,
    customs: customsLevel(culture, level, module),
    shipCustoms: `T${range(culture.span)[1]}`,
    naming,
    fn,
    style,
    boost: !!style,
    // §14.4: sensitive cultures' poetic names never go to a style or a light or grim name.
    poeticAllowed: !(culture.sensitive && (lightOrGrim(tone) || !!style)),
    context: options.context,
    drawn: new Set(),
    words: [],
    pools,
  });

  /** §5: the route and pattern for one draw. */
  const choosePlan = (ctx: Ctx): Plan | undefined => {
    if (style && !options.shape && rng() < styleShare) {
      ctx.boost = false;
      return pickWeighted(stylePlans(ctx), rng);
    }
    const role = pickWeighted(roleWeights(ctx), rng);
    if (!role) return undefined;
    // §9.1: designation and leisure names are never hybrids.
    const share = inSpan(culture, ctx.level, module) ? VESSEL_DATA.hybrids.share.inSpan : VESSEL_DATA.hybrids.share.outOfSpan;
    if (!options.shape && role !== "designation" && role !== "leisure" && rng() < share) return pickWeighted(hybridPlans(ctx), rng);
    return pickWeighted(rolePlans(ctx, role, options.shape), rng);
  };

  /** A letter class's letter, for the early tanks' company letters (§12.2). */
  let classLetter: string | undefined;

  /** A finished, checked name with its prefix, or undefined. */
  const result = (ctx: Ctx, built: Built | undefined, series?: VesselName["series"]): VesselName | undefined => {
    if (!built || !acceptable(ctx, guard, built.name)) return undefined;
    let prefix: string | undefined;
    if (prefixes && !isAirLand(module) && !built.name.startsWith("The ")) prefix = setting === "SF" ? sfPrefix(ctx.fn) : module === "ships" ? realPrefix(ctx) : undefined;
    if (prefix && blocked(ctx, guard, built.name, prefix)) return undefined;
    // Aircraft and land brief §12: a registration or running number, for individual craft only.
    const code = isAirLand(module) && !!options.prefixes && naming === "craft" && prefixSetting(setting) ? makeCode(ctx, rng, classLetter) : undefined;
    return {
      text: code ? (code.before ? `${code.before}${built.name}` : `${built.name} (${code.after})`) : prefix ? `${prefix} ${built.name}` : built.name,
      name: built.name,
      ...(prefix ? { prefix } : {}),
      ...(code ? { code: code.before ? code.before.trim() : code.after } : {}),
      route: built.plan.route,
      role: built.plan.role,
      shape: built.plan.p,
      function: ctx.fn,
      level: ctx.level,
      customs: ctx.customs,
      tones: built.tones,
      words: ctx.words,
      ...(series ? { series } : {}),
    };
  };

  // §2.2: "any" draws a level evenly from those it offers, keeping the chosen function possible.
  const levelPool = technology === "any" ? anyLevels(module, culture, setting).filter((l) => !chosenFn || functionAvailableAt(chosenFn, culture, l)) : [technology];
  const fnChoices = (level: string) => functions.filter((f) => functionAvailableAt(f, culture, level));

  /** One name: technology, function, route, role, shape (§5); undefined after the GN §4 failures. */
  const oneName = (): VesselName | undefined => {
    if (levelPool.length === 0) return undefined;
    for (let round = 0; round < 2; round++) {
      const level = pickOne(levelPool, rng);
      const fn = chosenFn ?? pickWeighted(fnChoices(level).map((f): [VesselFunction, number] => [f, f.w]), rng);
      if (!fn) continue;
      for (let i = 0; i < 20; i++) {
        const ctx = newCtx(level, fn.key);
        const plan = choosePlan(ctx);
        if (!plan) break;
        const name = result(ctx, renderPlan(ctx, plan));
        if (name) return name;
      }
    }
    return undefined;
  };

  const seen = new Set<string>();
  const names: VesselName[] = [];
  const add = (name: VesselName | undefined): boolean => {
    if (!name) return false;
    const key = name.text.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    names.push(name);
    return true;
  };

  if (naming === "types") {
    if (options.series && levelPool.length > 0) typeFamilyBatch();
    else for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) add(oneType());
    if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
    return { names, seed, notices };
  }
  if (options.series && chosenFn && levelPool.length > 0) {
    const seriesTone = drawRuleClass() ? tone : drawClass();
    if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
    return { names, seed, notices, seriesTone };
  }
  if (options.series && !chosenFn) notices.push("A class needs a function.");

  for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) add(oneName());
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
  return { names, seed, notices };

  /** Aircraft and land brief §9.2: a type of one family from a shape of it. */
  function renderType(ctx: Ctx, family: string, shape: TypeShape): Built | undefined {
    const built = renderPlan(ctx, { route: "type", role: family, p: shape.p, tones: shape.t });
    if (!built) return undefined;
    const T = AIR_LAND.types;
    if (family === "classTheme") built.name = built.name.replace(/^The /, "the ").replace(/ Class$/, " class");
    else if (family === "future") built.name = built.name.replace(/-Class$/, "-class");
    else if (!T.mark.never.includes(family) && rng() < T.mark.share) built.name += ` Mark ${pickOne(T.mark.numerals, rng)}`;
    return built;
  }

  /** One type: a level, a function, a family by §9.3's weights and a shape of it. */
  function oneType(): VesselName | undefined {
    if (levelPool.length === 0) return undefined;
    for (let round = 0; round < 2; round++) {
      const level = pickOne(levelPool, rng);
      const fn = chosenFn ?? pickWeighted(fnChoices(level).map((f): [VesselFunction, number] => [f, f.w]), rng);
      if (!fn) continue;
      for (let i = 0; i < 20; i++) {
        const ctx = newCtx(level, fn.key);
        const family = pickWeighted(typeFamilyPool(ctx), rng);
        if (!family) break;
        const shape = pickWeighted(typeShapes(ctx, family).map((sh): [TypeShape, number] => [sh, sh.w]), rng);
        if (!shape) continue;
        // §9.4: for norman-british war types the rank family draws C-names at 50%.
        const R = AIR_LAND.types.rankInitial;
        if (family === "rank" && culture.key === R.culture && fn.key === R.fn && rng() < R.share) ctx.rankInitial = R.letter;
        const name = result(ctx, renderType(ctx, family, shape));
        if (name) return name;
      }
    }
    return undefined;
  }

  /** §9.5: one maker's line of types on one family: no word twice; ranks keep one initial; designations share a prefix and rise. */
  function typeFamilyBatch(): void {
    const level = pickOne(levelPool, rng);
    const fn = chosenFn ?? pickWeighted(fnChoices(level).map((f): [VesselFunction, number] => [f, f.w]), rng);
    if (!fn) return;
    const info: VesselName["series"] = { anchor: "family", value: null, counter: null };
    const used = new Set<string>();
    // The family: the first that gives a name.
    let family: string | undefined;
    let first: VesselName | undefined;
    let letter: string | undefined;
    for (let i = 0; i < 40 && !first; i++) {
      const ctx = newCtx(level, fn.key);
      family = pickWeighted(typeFamilyPool(ctx), rng);
      if (!family) return;
      if (family === "designation") break;
      const shape = pickWeighted(typeShapes(ctx, family).map((sh): [TypeShape, number] => [sh, sh.w]), rng);
      if (!shape) continue;
      const R = AIR_LAND.types.rankInitial;
      if (family === "rank") {
        // One initial for the whole family: a letter with enough words to fill the batch (C for the British war types at 50%).
        const initials = new Map<string, number>();
        for (const [e] of pool(ctx, "rank")) initials.set(e.w.charAt(0), (initials.get(e.w.charAt(0)) ?? 0) + 1);
        const enough = [...initials].filter(([, n]) => n >= count);
        const choices = (enough.length > 0 ? enough : [...initials].sort((a, b) => b[1] - a[1]).slice(0, 1));
        letter = culture.key === R.culture && fn.key === R.fn && rng() < R.share && initials.has(R.letter) ? R.letter : pickWeighted(choices, rng);
        ctx.rankInitial = letter;
      }
      const built = renderType(ctx, family, shape);
      first = result(ctx, built, info);
      if (first && built) {
        for (const w of drawnWords(built.record)) used.add(w);
        add(first);
      }
    }
    if (!family) return;
    if (family === "designation") {
      // A shared letter prefix and rising numbers (Ka-21, Ka-27, Ka-32).
      const ctx = newCtx(level, fn.key);
      const shapes = typeShapes(ctx, "designation");
      for (let tries = 0; tries < 10 && names.length < count; tries++) {
        const shape = pickOne(shapes, rng);
        const range = /\{romanNumeral\}/.test(shape.p) ? [1, 8] : /\{n23\}/.test(shape.p) ? [10, 999] : /\{n100\}/.test(shape.p) ? [1, 100] : [1, 99];
        if (range[1] - range[0] + 1 < count) continue;
        const letters = shape.p.includes("{AA}") ? baseTokenLetters(2) : shape.p.includes("{A}") ? baseTokenLetters(1) : "";
        const pool = Array.from({ length: range[1] - range[0] + 1 }, (_x, i) => range[0] + i);
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        for (const n of pool.slice(0, count).sort((a, b) => a - b)) {
          const text = shape.p
            .replace(/\{AA?\}/, letters)
            .replace(/\{(n|n23|n100)\}/, String(n))
            .replace("{romanNumeral}", AIR_LAND.lists.romanNumeral[n - 1]?.w ?? "");
          const built: Built = { name: vesselCapitals(text), plan: { route: "type", role: "designation", p: shape.p, tones: shape.t }, tones: [], record: [] };
          add(result(ctx, built, info));
        }
        if (names.length > 0) break;
      }
      return;
    }
    // The rest of the family, with no word drawn twice.
    for (let idle = 0; idle < 60 && names.length < count; ) {
      const ctx = newCtx(level, fn.key);
      if (letter) ctx.rankInitial = letter;
      const shape = pickWeighted(typeShapes(ctx, family).map((sh): [TypeShape, number] => [sh, sh.w]), rng);
      const built = shape ? renderType(ctx, family, shape) : undefined;
      const fresh = !!built && drawnWords(built.record).every((w) => !used.has(w));
      const name = fresh ? result(ctx, built, info) : undefined;
      if (name && add(name)) {
        for (const w of drawnWords(built!.record)) used.add(w);
        idle = 0;
      } else idle++;
    }
  }

  function baseTokenLetters(n: number): string {
    for (let i = 0; i < 20; i++) {
      const text = Array.from({ length: n }, () => LETTERS[Math.floor(rng() * 26)]).join("");
      if (text !== "SS") return text;
    }
    return "KA";
  }

  /**
   * Aircraft and land brief §11.1: a locomotive class keeps one theme, a named-train or fairground set one shape, a Clipper
   * fleet its shapes, and a letter class one initial; no drawn word twice. False when no such rule applies (SS's class series then runs).
   */
  function drawRuleClass(): boolean {
    if (!isAirLand(module) || !chosenFn) return false;
    const fn = chosenFn.key;
    const level = pickOne(levelPool, rng);
    const forced = module === "landVehicles" ? ({ locomotive: "classSet", train: "service", working: "fair" } as Record<string, string>)[fn] : undefined;
    let kind: "theme" | "shape" | "clipper" | "letter" | undefined = forced ? (forced === "classSet" ? "theme" : "shape") : undefined;
    if (!kind && module === "aircraft" && fn === "airliner" && culture.key === "american" && level === "A4" && rng() < 0.5) kind = "clipper";
    if (!kind && ((module === "aircraft" && (fn === "airliner" || fn === "bomber")) || (module === "landVehicles" && fn === "war" && (level === "L3" || level === "L4"))) && rng() < 0.4) kind = "letter";
    if (!kind) return false;
    const placeholders = (options.people ?? "placeholders") === "placeholders";
    const info: VesselName["series"] = { anchor: kind, value: null, counter: null };
    const used = new Set<string>();
    const varies = (record: Drawn[]) => record.some((d) => !(placeholders && PLACEHOLDER_TOKENS.has(d.name)));
    const accept = (built: Built | undefined, name: VesselName | undefined) => {
      if (!built || !name || !varies(built.record)) return undefined;
      // A class draws no token twice (two saints may both be "Saint …", two towns are two names).
      if (built.record.some((d) => used.has(d.text.toLowerCase()))) return undefined;
      return name;
    };
    const take = (built: Built, name: VesselName) => {
      for (const d of built.record) used.add(d.text.toLowerCase());
      add({ ...name, series: info });
    };
    const initial = (name: string) => name.replace(/^The /, "").charAt(0).toUpperCase();
    if (kind === "letter") {
      let letter: string | undefined;
      for (let attempt = 0; attempt < count * 80 && names.length < count; attempt++) {
        const ctx = newCtx(level, fn);
        const plan = choosePlan(ctx);
        if (!plan) continue;
        if (letter && module === "landVehicles") classLetter = letter;
        const built = renderPlan(ctx, plan);
        const name = accept(built, result(ctx, built));
        if (!name || !built) continue;
        if (!letter) {
          letter = initial(name.name);
          classLetter = letter;
          // The first name was coded before the class letter was known: its company letter is the class letter too.
          if (name.code && module === "landVehicles") {
            name.code = letter + name.code.slice(1);
            name.text = letter + name.text.slice(1);
          }
        } else if (initial(name.name) !== letter) continue;
        take(built, name);
      }
      classLetter = undefined;
      return true;
    }
    const ctx0 = newCtx(level, fn);
    const plans: [Plan, number][] =
      kind === "clipper" ? rolePlans(ctx0, "place").filter(([p]) => p.p.startsWith("Clipper ")) : rolePlans(ctx0, forced!);
    if (plans.length === 0) return false;
    // The first shape that can vary (a placeholder-only shape can't make a class).
    let allowed: [Plan, number][] | undefined;
    for (let i = 0; i < 40 && !allowed; i++) {
      const plan = pickWeighted(plans, rng)!;
      const keep = kind === "theme" ? plans.filter(([p]) => p.theme === plan.theme) : kind === "shape" ? plans.filter(([p]) => p.p === plan.p) : plans;
      const ctx = newCtx(level, fn);
      const probe = renderPlan(ctx, plan);
      if (probe && varies(probe.record) && result(ctx, probe)) allowed = keep;
    }
    if (!allowed) return false;
    for (let idle = 0; idle < 40 && names.length < count; ) {
      const ctx = newCtx(level, fn);
      const built = renderPlan(ctx, pickWeighted(allowed, rng)!);
      const name = accept(built, result(ctx, built));
      if (name && built && !seen.has(name.text.toLowerCase())) {
        take(built, name);
        idle = 0;
      } else idle++;
    }
    return true;
  }

  /** TS §3: one class: one technology, route and shape; a counter counts, or an anchor holds while the rest vary. */
  function drawClass(): GroupToneChoice {
    const level = pickOne(levelPool, rng);
    const fn = chosenFn!.key;
    const placeholders = (options.people ?? "placeholders") === "placeholders";
    const isPlaceholder = (d: Drawn) => placeholders && PLACEHOLDER_TOKENS.has(d.name);
    let first: { ctx: Ctx; built: Built; name: VesselName } | undefined;
    for (let i = 0; i < 40 && !first; i++) {
      const ctx = newCtx(level, fn);
      const plan = choosePlan(ctx);
      if (!plan) continue;
      const built = renderPlan(ctx, plan);
      const name = result(ctx, built);
      if (!built || !name) continue;
      // TS §3.3 step 3: redraw a shape where nothing could vary.
      if (!built.record.some((d) => kindOf(d.name) === "counter") && !built.record.some((d) => !isPlaceholder(d))) continue;
      first = { ctx, built, name };
    }
    if (!first) return tone;
    // TS §3.3 step 2: with tone Any, the first shape's first tone holds for the class.
    if (tone === "any") tone = first.built.plan.tones[0] ?? "any";
    const plan = first.built.plan;
    const rec = first.built.record;
    const draw = (hooks: Hooks, p = plan) => {
      const ctx = newCtx(level, fn);
      if (p.route === "style") ctx.boost = false;
      return result(ctx, renderPlan(ctx, p, hooks), info);
    };
    const counterAt = rec.findIndex((d) => kindOf(d.name) === "counter");
    let info: VesselName["series"];
    if (counterAt >= 0) {
      info = { anchor: null, value: null, counter: rec[counterAt].name };
      add({ ...first.name, series: info });
      const locked = new Map(rec.map((d, i) => [i, d] as const));
      let firstValue = true;
      for (const value of counterValues(first.ctx, rec[counterAt].name, rec[counterAt].text)) {
        if (names.length >= count) break;
        if (firstValue) {
          firstValue = false;
          continue;
        }
        locked.set(counterAt, { name: rec[counterAt].name, text: value });
        add(draw({ byIndex: new Map(locked) }));
      }
      return tone;
    }
    // TS §3.3 step 4: the first owner token that isn't a placeholder, else the first of two or more list tokens.
    let anchorAt = rec.findIndex((d) => kindOf(d.name) === "owner" && !isPlaceholder(d));
    const listAt = rec.map((d, i) => (kindOf(d.name) === "list" && !isPlaceholder(d) ? i : -1)).filter((i) => i >= 0);
    if (anchorAt < 0 && listAt.length >= 2) anchorAt = listAt[0];
    const anchor = anchorAt >= 0 ? rec[anchorAt] : undefined;
    info = { anchor: anchor?.name ?? null, value: anchor?.text ?? null, counter: null };
    const hold = new Map<number, Drawn>();
    if (anchor) hold.set(anchorAt, anchor);
    else if (listAt.length === 1) rec.forEach((d, i) => i !== listAt[0] && hold.set(i, d));
    add({ ...first.name, series: info });
    const fill = (next: () => VesselName | undefined) => {
      for (let idle = 0; idle < 20 && names.length < count; ) idle = add(next()) ? 0 : idle + 1;
    };
    fill(() => draw({ byIndex: hold }));
    if (!anchor || names.length >= count) return tone;
    // TS §3.5: top up from the route's other shapes with the anchor's token.
    const ctx = newCtx(level, fn);
    const others = (plan.route === "style" ? stylePlans(ctx) : plan.route === "hybrid" ? hybridPlans(ctx) : rolePlans(ctx, plan.role)).filter(
      ([p]) => p.p !== plan.p && [...p.p.matchAll(/\{([^}:]+)/g)].some((m) => m[1] === anchor.name),
    );
    if (others.length === 0) return tone;
    fill(() => draw({ byName: anchor }, pickWeighted(others, rng)));
    return tone;
  }
}

/** §1.2: "ships and boats · historic or low fantasy · Hawaiian · steam and iron". */
export function vesselHistoryLabel(module: VesselModule, genre: GroupGenre, fantastic: boolean, culture: string, technology: string): string {
  const label = findVesselCulture(culture)?.label ?? "General";
  return [VESSEL_MODULE_LABELS[module], SETTING_PHRASES[groupSetting(genre, fantastic)], label, technology === "any" ? "any technology" : techLabel(module, technology)].join(
    " · ",
  );
}
