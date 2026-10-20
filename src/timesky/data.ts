// Time and sky (docs/time-and-sky-brief.md): the data layer. The systems and their table (§5), the
// season cycles and the layout of the year (§6) and the culture names (§8), read from time-sky.json.
// The engine (engine.ts) draws names from them. No Obsidian imports.

import timeSkyData from "../data/time-sky.json";
import { type Biome, isSpaceBiome } from "../biomes";
import { homelandBiome } from "../realms/engine";
import { type GroupTone, type GroupToneChoice } from "../groups/engine";
import { type RouteEra, ROUTE_CULTURES, ROUTE_ERAS } from "../routes/engine";

// ── Types ───────────────────────────────────────────────────────────────────

export type TimeKind = "month" | "day" | "festival" | "moon" | "constellation" | "sign" | "light";
export type TimeModule = "calendar" | "sky";
export type TimeWords = "translated" | "loanwords";

export interface TimeKindInfo {
  key: TimeKind;
  module: TimeModule;
  menu: string;
  plural: string;
  description: string;
}

export interface YearSystem {
  source: string;
  months: number;
  /** Egyptian civil: three seasons of four. */
  seasons?: number[];
  /** Extra days after the last month: a count, or null where the brief gives none. */
  extra?: { count: number | null };
  /** A 13th month: after one of these months (0 is before the first), or after any month. */
  leap?: { after?: number[]; uniform?: true };
  /** A leap the brief says is not shown. */
  leapHidden?: string;
}

export interface WeekSystem {
  source: string;
  days: number;
  planets?: string[];
  market?: number[];
  rest?: number;
  full?: number;
}

export interface FestivalCycle {
  source: string;
  count: number | "seasons" | "months";
  placed: "quarters" | "season-starts" | "months" | "pairs";
  months?: number[];
}

export interface SkySystem {
  source: string;
  count: number;
  order?: string[];
}

/** A culture-name row (§8): its name, position or season, eras, systems and loan form. */
export interface CultureRow {
  n: string;
  /** A position in the system, or "leap" / "extra". */
  p?: number | "leap" | "extra";
  /** The season, for festivals and the months by season. */
  s?: string;
  e?: string;
  sys?: string[];
  loan?: string;
  /** A festival cycle the position belongs to. */
  cyc?: string;
  /** Slavic: the position counts from January. */
  jan?: boolean;
}

export interface TimeShape {
  k: string;
  /** One pattern, or several that share the row's weight. A pattern may carry its own tones. */
  p: string | (string | [string, GroupTone[]])[];
  w: number;
  e?: string;
  c?: string[];
  cx?: Record<string, number>;
  /** Non-sensitive cultures only. */
  ns?: true;
  /** Christian cultures only. */
  ch?: true;
  cm?: { christian: number; other: number };
  t?: GroupTone[];
  h?: boolean;
  sys?: string[];
  /** The culture names row. */
  cn?: true;
  /** Space biomes only / allowed in space biomes. */
  sp?: true;
  sl?: true;
  /** Pairs: only drawn as a pair in a series. */
  pairs?: true;
  poss?: true;
  numbered?: true;
  commem?: true;
  all?: true;
  god?: true;
}

export interface TimeSkyData {
  sensitive: string[];
  homeland: Record<string, string>;
  kinds: TimeKindInfo[];
  series: Record<string, { text: string; line: string }>;
  leapShare: [number, number];
  realShare: number;
  loanShare: number;
  cap: number;
  years: Record<string, YearSystem>;
  weeks: Record<string, WeekSystem>;
  festivals: Record<string, FestivalCycle>;
  skies: Record<string, SkySystem>;
  cells: {
    months: Record<string, string[]>;
    monthsFuture: string;
    monthsPlanetary: string;
    days: Record<string, string[]>;
    festivals: Record<string, string>;
    festivalsFuture: string;
    festivalsSpace: string;
    signs: Record<string, string[]>;
    lights: string;
  };
  seasonCycles: Record<string, string>;
  homelandCycles: Record<string, string>;
  seasons: Record<string, { phrase: string; noun: string }>;
  newYear: Record<string, string | Record<string, string>>;
  janShift: Record<string, Record<string, number>>;
  seasonalMonths: Record<string, string[]>;
  cultureNames: Record<string, Partial<Record<TimeKind, CultureRow[]>>>;
  daySigns: Record<string, string[]>;
  signNames: Record<string, unknown>;
  constellations: Record<string, string[]>;
  lights: Record<string, { planets?: Record<string, string[]>; milky?: string; comet?: string; nova?: string; bare?: string[] }>;
  shapes: TimeShape[];
  themes: {
    month: [string, number][];
    monthMult: Record<string, Record<string, number>>;
    day: [string, number][];
    market: [string, number][];
    festival: [string, number][];
    moon: [string, number][];
    sign: [string, number][];
    mansions: [string, number][];
    light: [string, number][];
    mixedZodiac: number;
    pairShare: number;
  };
  lists: {
    turning: string[];
    turningOf: Record<string, string[]>;
    pairFeast: string[];
    position: string[];
    daySign: string[];
    daySignTone: Record<string, GroupTone[]>;
    moonPhase: string[];
    moonWaxing: string[];
    moonFull: string[];
    moonFading: string[];
    kin: string[];
    thing: string[];
    group: string[];
    numberWord: string[];
    herald: string[];
    weather: string[];
    lightQualities: Record<string, string[]>;
  };
  safeguards: { block: string[]; flag: string[]; flagListBlocks: boolean; banned: string[]; bannedFromMoney: boolean; kindBlock: Record<string, string[]>; zodiacSet: string[]; zodiacSetLimit: number };
}

export const TIME_SKY = timeSkyData as unknown as TimeSkyData;
export const TIME_KINDS = TIME_SKY.kinds;
export const findTimeKind = (key: string | undefined) => TIME_KINDS.find((k) => k.key === key);
export const timeKindDefaultOf = (module: TimeModule): TimeKind => (module === "calendar" ? "month" : "constellation");
export const kindsOfModule = (module: TimeModule) => TIME_KINDS.filter((k) => k.module === module);

/** §3.1: RN's cultures bar the four money-only ones (route names' own list already leaves them out). */
export const TIME_CULTURES = ROUTE_CULTURES;
export const findTimeCulture = (key: string | undefined) => TIME_CULTURES.find((c) => c.key === key);
export const isSensitive = (culture: string) => TIME_SKY.sensitive.includes(culture);

// ── Eras ────────────────────────────────────────────────────────────────────

const ERA_ORDER: RouteEra[] = ROUTE_ERAS.map((e) => e.code);

/** Eras written as a span: "all", "AN", "AN-MD", "MD+" (MD on). */
export function eraSpan(spec: string | undefined): RouteEra[] {
  if (!spec || spec === "all") return ERA_ORDER;
  if (spec.endsWith("+")) return ERA_ORDER.slice(ERA_ORDER.indexOf(spec.slice(0, -1) as RouteEra));
  const [a, b] = spec.split("-");
  const from = ERA_ORDER.indexOf(a as RouteEra);
  return ERA_ORDER.slice(from, (b ? ERA_ORDER.indexOf(b as RouteEra) : from) + 1);
}
export const inEras = (spec: string | undefined, era: RouteEra) => eraSpan(spec).includes(era);
export const isFutureEra = (era: RouteEra) => era === "NF" || era === "IS";

// ── The system table (§5.5) ─────────────────────────────────────────────────

/** "julian-12 80 · fixed-13 20" → shares; "-" → none; a lone key is the whole share. */
export function parseCell(cell: string | undefined): [string, number][] {
  if (!cell || cell.trim() === "-") return [];
  return cell.split("·").map((part) => {
    const [key, share] = part.trim().split(/\s+/);
    return [key, share === undefined ? 100 : Number(share)] as [string, number];
  });
}

const ERA_COLUMN: Record<string, number> = { AN: 0, MD: 1, EM: 2, ST: 3, MO: 4 };

/** The land a module reads: a space biome, its scale, or none. */
export interface LandKind {
  space: boolean;
  scale?: string;
}
export const landKind = (biome: Biome | undefined): LandKind => ({ space: isSpaceBiome(biome), scale: biome?.scale });

/** §5.5: the year systems for a culture and era (and, for the planetary-system biome, the Darian calendar). */
export function monthSystems(culture: string, era: RouteEra, land: LandKind = { space: false }): [string, number][] {
  if (isFutureEra(era)) return parseCell(land.space && land.scale === "Pl" ? TIME_SKY.cells.monthsPlanetary : TIME_SKY.cells.monthsFuture);
  return parseCell(TIME_SKY.cells.months[culture]?.[ERA_COLUMN[era]]);
}

/** §5.5: the week systems; none means the kind "days of the week" is not offered. */
export function weekSystems(culture: string, era: RouteEra): [string, number][] {
  const row = TIME_SKY.cells.days[culture];
  if (!row) return [];
  return parseCell(isFutureEra(era) ? row[5] : row[ERA_COLUMN[era]]);
}

/** §5.5: the festival cycles. */
export function festivalCycles(culture: string, era: RouteEra, land: LandKind = { space: false }): [string, number][] {
  if (isFutureEra(era)) return parseCell(land.space ? TIME_SKY.cells.festivalsSpace : TIME_SKY.cells.festivalsFuture);
  return parseCell(TIME_SKY.cells.festivals[culture]);
}

/** §5.5: the sky systems for star signs; none means the zodiac series is not offered. */
export function signSystems(culture: string, era: RouteEra): [string, number][] {
  return parseCell(TIME_SKY.cells.signs[culture]?.[era === "AN" ? 0 : 1]);
}

/** Every system named in the table. */
export function tableSystems(): string[] {
  const keys = new Set<string>();
  const add = (cell: string | undefined) => parseCell(cell).forEach(([k]) => keys.add(k));
  for (const row of Object.values(TIME_SKY.cells.months)) row.forEach(add);
  add(TIME_SKY.cells.monthsFuture);
  add(TIME_SKY.cells.monthsPlanetary);
  for (const row of Object.values(TIME_SKY.cells.days)) row.forEach(add);
  for (const cell of Object.values(TIME_SKY.cells.festivals)) add(cell);
  add(TIME_SKY.cells.festivalsFuture);
  add(TIME_SKY.cells.festivalsSpace);
  for (const row of Object.values(TIME_SKY.cells.signs)) row.forEach(add);
  add(TIME_SKY.cells.lights);
  return [...keys];
}

/** §4: the kinds offered for a culture, era and land. */
export function kindsOffered(module: TimeModule, culture: string, era: RouteEra, land: LandKind = { space: false }): TimeKindInfo[] {
  return kindsOfModule(module).filter((k) => {
    if (k.key === "day") return weekSystems(culture, era).length > 0;
    if (k.key === "moon") return !land.space;
    return true;
  });
}

/** §5.5: whether a series is offered for a kind (constellations have none; signs only where a system exists). */
export function seriesOffered(kind: TimeKind, culture: string, era: RouteEra, land: LandKind = { space: false }): boolean {
  switch (kind) {
    case "constellation":
      return false;
    case "day":
      return weekSystems(culture, era).length > 0;
    case "sign":
      return signSystems(culture, era).length > 0;
    case "moon":
      return !land.space;
    default:
      return true;
  }
}

// ── Seasons (§6) ────────────────────────────────────────────────────────────

export type Cycle = [string, number][];
export const seasonPhrase = (season: string) => TIME_SKY.seasons[season]?.phrase ?? season;
export const seasonNoun = (season: string) => TIME_SKY.seasons[season]?.noun ?? season;
export const SEASON_KEYS = Object.keys(TIME_SKY.seasons);

/** "spring 3 · summer 3" → a cycle. */
export function parseCycle(text: string): Cycle {
  return text.split("·").map((part) => {
    const [key, share] = part.trim().split(/\s+/);
    return [key, Number(share)] as [string, number];
  });
}

/** §3.3: "their homeland" for this module: the overrides, else the realms engine's. */
export const homelandOf = (culture: string): string => TIME_SKY.homeland[culture] ?? homelandBiome(culture);

/** A biome pack's own cycle (§6.1): the `seasonCycle` it gives. */
export type CycleBiome = Biome & { seasonCycle?: Cycle };

/** §6.1: the season cycle of a land; the culture's homeland cycle when the land is the homeland; none in space. */
export function seasonCycle(biome: CycleBiome | undefined, culture: string, atHome: boolean): Cycle | null {
  if (isSpaceBiome(biome)) return null;
  if (atHome && TIME_SKY.homelandCycles[culture]) return parseCycle(TIME_SKY.homelandCycles[culture]);
  const temperate = parseCycle(TIME_SKY.seasonCycles.temperate);
  if (!biome) return temperate;
  if (biome.seasonCycle && biome.seasonCycle.length > 0) return biome.seasonCycle.filter(([k]) => SEASON_KEYS.includes(k));
  if (TIME_SKY.seasonCycles[biome.id]) return parseCycle(TIME_SKY.seasonCycles[biome.id]);
  if (biome.custom) {
    const own = (biome.seasons ?? []).map(([w]) => w.toLowerCase()).filter((w) => SEASON_KEYS.includes(w));
    if (own.length > 0) return own.map((k) => [k, 1] as [string, number]);
    if (TIME_SKY.seasonCycles[biome.custom.base]) return parseCycle(TIME_SKY.seasonCycles[biome.custom.base]);
  }
  return temperate;
}

/** One month slot of the ring (§6.2): its season (null in space) and place in the season. */
export interface Slot {
  season: string | null;
  pos: "first" | "middle" | "last";
}

/** §6.2: N × share / 12 slots a season by largest remainder, at least one each when N allows; a ring in cycle order. */
export function layoutRing(n: number, cycle: Cycle | null): Slot[] {
  if (!cycle || cycle.length === 0) return Array.from({ length: n }, () => ({ season: null, pos: "middle" as const }));
  const total = cycle.reduce((sum, [, share]) => sum + share, 0);
  const exact = cycle.map(([, share]) => (n * share) / total);
  const counts = exact.map(Math.floor);
  let left = n - counts.reduce((a, b) => a + b, 0);
  const order = exact.map((x, i) => [i, x - Math.floor(x)] as [number, number]).sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  for (let i = 0; left > 0; i = (i + 1) % order.length, left--) counts[order[i][0]]++;
  if (n >= cycle.length) {
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] > 0) continue;
      let donor = 0;
      counts.forEach((c, j) => {
        if (c > counts[donor]) donor = j;
      });
      counts[donor]--;
      counts[i]++;
    }
  }
  const slots: Slot[] = [];
  cycle.forEach(([season], i) => {
    for (let j = 0; j < counts[i]; j++) slots.push({ season, pos: counts[i] === 1 ? "middle" : j === 0 ? "first" : j === counts[i] - 1 ? "last" : "middle" });
  });
  return slots;
}

/** §6.3: the slot that is month 1 of the culture's own year. */
export function ownYearStart(culture: string, era: RouteEra, ring: Slot[]): number {
  const spec = TIME_SKY.newYear[culture];
  const text = typeof spec === "string" ? spec : spec?.[era] ?? spec?.["*"];
  if (!text || ring.length === 0 || ring[0].season === null) return 0;
  const [season, offset] = text.split(/\s+/);
  const first = ring.findIndex((s) => s.season === season);
  if (first < 0) return 0;
  return (first + Number(offset)) % ring.length;
}

// ── Culture names (§8) ──────────────────────────────────────────────────────

/** The rows of a culture and kind. */
export const cultureRows = (culture: string, kind: TimeKind): CultureRow[] => TIME_SKY.cultureNames[culture]?.[kind] ?? [];

/** §8.4: a Slavic month position counted from January, as the new year puts it. */
export function ownPosition(row: CultureRow, culture: string, era: RouteEra, months: number): number | undefined {
  if (typeof row.p !== "number") return undefined;
  const shift = row.jan ? TIME_SKY.janShift[culture]?.[era] ?? 0 : 0;
  return ((((row.p - shift - 1) % months) + months) % months) + 1;
}

export type { GroupToneChoice };
