// Coverage rows (shared lens brief §6.1): the shape every module's coverage adapter returns, and the
// helpers that turn a table entry's own tags into lens terms. Pure: nothing here runs a generator,
// reads a note or touches Obsidian. Adapters read the JSON tables and return rows.

import routeData from "./data/route-names.json";
import vocabData from "./data/settlement-vocab.json";
import {
  LENS_CULTURE_GROUPS,
  LENS_ERAS,
  LENS_LAND_BAND,
  isLandModule,
  lensCulture,
  lensCulturesFor,
  lensErasFor,
  lensStyleForVocabulary,
  STEAMPUNK_NAMES,
} from "./lens";
import { poolReaders } from "./coverageReaders";

export type CoverageRowType = "shape" | "word";

/** One entry of a module's tables, read in lens terms. */
export interface CoverageRow {
  /** The module's section id: "mountainNames", "innNames"… */
  module: string;
  /** The module's own kind key. */
  kind?: string;
  type: CoverageRowType;
  /** The pool, list or shape table the entry sits in. */
  source: string;
  /** Lens culture keys the entry is restricted to; absent: open to all. */
  cultures?: string[];
  /** Lens era codes; absent: all. */
  eras?: string[];
  /** Lens style keys; absent: realistic. */
  styles?: string[];
  tones?: string[];
  regions?: string[];
  /** Entries, not weights. */
  n: number;
}

/** A module's coverage adapter: a pure function over its tables. */
export interface CoverageAdapter {
  /** The module's section id. */
  module: string;
  /** The module's own kind keys, for the per-kind report. */
  kinds?: readonly string[];
  /** Cultures the module deliberately excludes (§6.3): their cells read "excluded", whole module or one kind. */
  excluded?: readonly { cultures: readonly string[]; kind?: string }[];
  /** The module has no word lists or shapes of its own; it draws on other modules (the settlement kit). */
  noTables?: boolean;
  /** Whether the module reads its own regions (§6.2 module × region). */
  regions?: boolean;
  /** The module's own culture keys, as its menu offers them (for the roster differences and the culture cells). */
  roster?: readonly string[];
  /** The era codes the module offers; absent: all seven. */
  eras?: readonly string[];
  /** The rows: shape tables, word lists and the shared pools the module reads. */
  rows(): CoverageRow[];
}

/** The culture keys the route, street, inn, building, monument, event, calendar, sky, wild lands and waters modules all offer (22). */
export const SHARED_ROSTER: readonly string[] = (routeData.cultures as { key: string }[]).map((c) => c.key);

// ── Tags ────────────────────────────────────────────────────────────────────

/** The tags a table entry may carry, as the data files spell them. */
export interface EntryTags {
  /** Culture keys, the groups `british` and `christian`, or `!key` exclusions. */
  c?: readonly string[];
  /** A single culture key (culture shape tables). */
  culture?: string;
  /** Era codes, or a range string such as "AN-MD". */
  e?: readonly string[] | string;
  t?: readonly string[];
  /** True: fantastic only. */
  h?: boolean;
  /** Regions the entry is restricted to. */
  r?: readonly string[];
  /** Region multipliers. */
  rx?: Record<string, number>;
  /** Family tag: "fixed" is a whole name, so a word. */
  f?: string;
}

export interface RowOptions {
  module: string;
  source: string;
  kind?: string;
  type?: CoverageRowType;
  /** The culture key of the table the entry sits in (a table keyed by culture). */
  culture?: string;
  /** A table named for steampunk (§4.3). */
  steampunk?: boolean;
  /** Eras the table implies when the entry names none (sci-fi shape tables). */
  eras?: readonly string[];
  /** Regions the entry belongs to, when the table says so rather than the entry. */
  regions?: readonly string[];
}

const ERA_CODES: readonly string[] = LENS_ERAS.map((e) => e.code);

/** "AN-MD" reads as AN, MD; "ST" as ST; an array as itself. */
export function eraList(e: readonly string[] | string | undefined): string[] | undefined {
  if (e === undefined) return undefined;
  if (typeof e !== "string") return [...e];
  const range = e.match(/^([A-Z]{2})-([A-Z]{2})$/);
  if (range) {
    const from = ERA_CODES.indexOf(range[1]);
    const to = ERA_CODES.indexOf(range[2]);
    return from >= 0 && to >= from ? ERA_CODES.slice(from, to + 1) : [e];
  }
  return e.split(/[,\s]+/).filter((x) => x);
}

/** The lens cultures a module's culture key counts towards; a key with no lens reading counts as itself (a local culture). */
export function cultureReading(module: string, key: string): string[] {
  const lens = lensCulturesFor(module, key);
  if (lens.length > 0) return lens;
  return lensCulture(key) ? [key] : [key];
}

/** Era tags, read in lens terms: a land module's land band reads whole (§3.3), and five or more eras read as open (§6.1). */
export function eraReading(module: string, tagged: readonly string[] | undefined): string[] | undefined {
  if (!tagged || tagged.length === 0) return undefined;
  let eras = [...new Set(tagged.flatMap((e) => (ERA_CODES.includes(e) ? lensErasFor(module, e) : lensErasFor(module, e))))];
  if (eras.length === 0) eras = [...new Set(tagged.filter((e) => ERA_CODES.includes(e)))];
  if (isLandModule(module) && eras.some((e) => (LENS_LAND_BAND as readonly string[]).includes(e))) {
    eras = [...new Set([...eras, ...LENS_LAND_BAND])];
  }
  eras = ERA_CODES.filter((e) => eras.includes(e));
  return eras.length >= 5 || eras.length === 0 ? undefined : eras;
}

/** The cultures an entry is restricted to, as lens keys: positive `c` entries (groups expanded) and the culture key; `!key` exclusions read as open. */
export function cultureTags(module: string, entry: EntryTags, tableCulture?: string): string[] | undefined {
  const keys: string[] = [];
  if (tableCulture) keys.push(tableCulture);
  if (entry.culture) keys.push(entry.culture);
  for (const c of entry.c ?? []) {
    if (c.startsWith("!")) continue;
    const group = LENS_CULTURE_GROUPS[c];
    if (group) keys.push(...group.cultures, ...Object.keys(group.from ?? {}));
    else keys.push(c);
  }
  const lens = [...new Set(keys.flatMap((k) => cultureReading(module, k)))].filter((c) => c !== "general");
  return lens.length > 0 ? lens : undefined;
}

/** The regions an entry belongs to: those it is restricted to, and those that multiply it. */
export function regionTags(entry: EntryTags): string[] | undefined {
  const out = new Set<string>(entry.r ?? []);
  for (const [code, mult] of Object.entries(entry.rx ?? {})) if (mult > 1) out.add(code);
  return out.size > 0 ? [...out] : undefined;
}

/** A region multiplier table (`{COR: 0, SHH: 3 …}`), read as the regions the entry is restricted to or multiplied for. */
export function regionMultipliers(table: Record<string, number>): string[] | undefined {
  const values = Object.values(table);
  const restricted = values.some((v) => v === 0);
  const out = Object.entries(table)
    .filter(([, v]) => v > 1 || (restricted && v === 1))
    .map(([code]) => code);
  return out.length > 0 ? out : undefined;
}

/** One table entry as a coverage row. */
export function makeRow(entry: EntryTags, o: RowOptions): CoverageRow {
  const rawEras = eraList(entry.e) ?? (o.eras ? [...o.eras] : undefined);
  const row: CoverageRow = {
    module: o.module,
    ...(o.kind ? { kind: o.kind } : {}),
    type: o.type ?? (entry.f === "fixed" ? "word" : "shape"),
    source: o.source,
    n: 1,
  };
  const cultures = cultureTags(o.module, entry, o.culture);
  if (cultures) row.cultures = cultures;
  const eras = eraReading(o.module, rawEras);
  if (eras) row.eras = eras;
  const styles = styleTags(entry, o.steampunk, rawEras);
  if (styles) row.styles = styles;
  if (entry.t && entry.t.length > 0) row.tones = [...entry.t];
  const regions = o.regions ? [...o.regions] : regionTags(entry);
  if (regions && regions.length > 0) row.regions = regions;
  return row;
}

function styleTags(entry: EntryTags, steampunk: boolean | undefined, eras: readonly string[] | undefined): string[] | undefined {
  if (steampunk) return ["steampunk"];
  if (entry.h !== true) return undefined;
  const readings = lensStyleForVocabulary({ h: true, e: eras });
  const styles = [...new Set(readings.map((r) => r.style))];
  return styles.length > 0 ? styles : undefined;
}

// ── Tables ──────────────────────────────────────────────────────────────────

/** A JSON value at a slash path (`a/b/c`). */
export function at(data: unknown, path: string): unknown {
  let cur = data;
  for (const part of path.split("/").filter((p) => p)) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

const isEntry = (x: unknown): x is EntryTags & { kind?: unknown; kinds?: unknown } => !!x && typeof x === "object" && !Array.isArray(x);

/**
 * The rows of a list of shape entries. An entry names the kinds it serves in `kind` (one) or `kinds`
 * (several: one row each); with neither, `o.kind` (the table's own) stands.
 */
export function listRows(list: unknown, o: RowOptions & { kindFrom?: "entry" | "kinds" }): CoverageRow[] {
  if (!Array.isArray(list)) return [];
  const out: CoverageRow[] = [];
  for (const entry of list) {
    if (!isEntry(entry)) continue;
    const own = typeof entry.kind === "string" ? [entry.kind] : Array.isArray(entry.kinds) ? (entry.kinds as string[]) : undefined;
    const kinds = own ?? (o.kind ? [o.kind] : [undefined]);
    for (const kind of kinds) out.push(makeRow(entry, { ...o, ...(kind ? { kind } : { kind: undefined }) }));
  }
  return out;
}

/** A table keyed by culture: `{ "norse": [entries] }`. */
export function byCultureRows(table: unknown, o: RowOptions): CoverageRow[] {
  if (!table || typeof table !== "object") return [];
  return Object.entries(table as Record<string, unknown>).flatMap(([culture, list]) => listRows(list, { ...o, culture }));
}

/** A table keyed by kind: `{ "civic": [entries] }`. */
export function byKindRows(table: unknown, o: RowOptions): CoverageRow[] {
  if (!table || typeof table !== "object") return [];
  return Object.entries(table as Record<string, unknown>).flatMap(([kind, list]) => listRows(list, { ...o, source: `${o.source}/${kind}`, kind }));
}

// ── The shared vocabulary ───────────────────────────────────────────────────

interface VocabEntry extends EntryTags {
  w: string;
}
interface VocabPool {
  entries: VocabEntry[];
  cultureExtra?: Record<string, { w: string }[]>;
}
const VOCAB_POOLS = (vocabData as unknown as { pools: Record<string, VocabPool> }).pools;

/** Every shared-vocabulary pool name. */
export const VOCAB_POOL_NAMES: readonly string[] = Object.keys(VOCAB_POOLS);

/**
 * The words of every shared pool the module reads (§6.1: a shared pool is counted in every module that
 * reads it). `cultureExtra` words count as signature words for their culture. A pool named `x:kind`
 * serves that kind.
 */
export function vocabularyRows(module: string, only?: (pool: string) => boolean): CoverageRow[] {
  const out: CoverageRow[] = [];
  for (const [name, pool] of Object.entries(VOCAB_POOLS)) {
    if (!poolReaders(name).includes(module)) continue;
    if (only && !only(name)) continue;
    const kind = name.includes(":") ? name.slice(name.indexOf(":") + 1) : undefined;
    const steampunk = STEAMPUNK_NAMES.pools.includes(name);
    for (const entry of pool.entries) out.push(makeRow(entry, { module, source: name, type: "word", steampunk, ...(kind ? { kind } : {}) }));
    for (const [culture, words] of Object.entries(pool.cultureExtra ?? {})) {
      for (const w of words) out.push(makeRow({ ...w, culture } as EntryTags, { module, source: `${name}/cultureExtra`, type: "word", steampunk, ...(kind ? { kind } : {}) }));
    }
  }
  return out;
}

/** The pools of the shared vocabulary that have no entries (left for packs). */
export function poolEntryCount(pool: string): number {
  const p = VOCAB_POOLS[pool];
  return p ? p.entries.length : 0;
}
