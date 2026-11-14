// The coverage report's numbers (shared lens brief §6): every module's adapter collected, and the rows
// counted into the cells of the report and the ratchet test. Pure: it reads the adapters' rows and the
// lens; it never runs a generator. `COVERAGE_ADAPTERS` is a plain array a module registry can absorb later.

import { buildingCoverage } from "./buildings/coverage";
import { bynameCoverage } from "./bynames/coverage";
import { deityCoverage } from "./deities/coverage";
import { groupCoverage } from "./groups/coverage";
import { colonialCoverage } from "./names/coverage";
import { peopleCoverage } from "./peoples/coverage";
import { realmCoverage } from "./realms/coverage";
import { riverCoverage } from "./rivers/coverage";
import { thingCoverage } from "./things/coverage";
import { tribalCoverage } from "./tribes/coverage";
import { vesselCoverage } from "./vessels/coverage";
import { placeShapesCoverage } from "./world/coverage";
import { type CoverageAdapter, type CoverageRow, cultureReading, poolEntryCount, VOCAB_POOL_NAMES } from "./coverageRows";
import { eventCoverage } from "./events/coverage";
import { innCoverage } from "./inns/coverage";
import {
  LENS_CULTURES,
  LENS_ERAS,
  LENS_MODULES,
  LENS_TARGETS,
  LENS_TONES,
  LENS_REGIONS,
  isLandModule,
  isLocalCulture,
  lensCulture,
  offeredLensCulturesFor,
  poolExemption,
} from "./lens";
import { moneyCoverage } from "./money/coverage";
import { monumentCoverage } from "./monuments/coverage";
import { routeCoverage } from "./routes/coverage";
import { settlementKitCoverage, settlementNamesCoverage } from "./settlement/coverage";
import { streetCoverage } from "./streets/coverage";
import { calendarCoverage, skyCoverage } from "./timesky/coverage";
import { watersCoverage } from "./waters/coverage";
import { wildsCoverage } from "./wilds/coverage";
import { placeCoverage } from "./places/coverage";

export type { CoverageAdapter, CoverageRow, CoverageRowType } from "./coverageRows";

/**
 * Every module's adapter, in the order the report lists them. A lens module with no adapter here is
 * reported as "no adapter yet", never as empty (a test checks that none is left).
 */
export const COVERAGE_ADAPTERS: CoverageAdapter[] = [
  routeCoverage,
  streetCoverage,
  innCoverage,
  buildingCoverage,
  monumentCoverage,
  settlementNamesCoverage,
  settlementKitCoverage,
  eventCoverage,
  moneyCoverage,
  calendarCoverage,
  skyCoverage,
  ...wildsCoverage,
  ...placeCoverage,
  ...watersCoverage,
  ...bynameCoverage,
  ...thingCoverage,
  realmCoverage,
  peopleCoverage,
  ...deityCoverage,
  tribalCoverage,
  ...groupCoverage,
  ...vesselCoverage,
  ...colonialCoverage,
  placeShapesCoverage,
  riverCoverage,
];

// ── Cells ───────────────────────────────────────────────────────────────────

export interface WordShape {
  words: number;
  shapes: number;
}

export interface CultureCell extends WordShape {
  /** The tier's target; absent for `general`. */
  target?: WordShape;
  /** The module doesn't offer this culture (roster difference). */
  notOffered?: boolean;
  /** The module deliberately excludes it (§6.3). */
  excluded?: boolean;
  /** The culture has its own non-empty row in a per-culture weight table (§11.2): a profile is not a substitute for words. */
  profile: boolean;
  /** Below target, and neither excluded nor unoffered. */
  below: boolean;
}

export interface ModuleCoverage {
  module: string;
  land: boolean;
  /** No adapter yet: the lens maps the module but nothing counts its tables. */
  adapter: boolean;
  /** The module has no tables of its own (the settlement kit): nothing to count. */
  noTables: boolean;
  rowCount: number;
  cultures: Record<string, CultureCell>;
  /** Restricted entries per lens era. */
  eras: Record<string, number>;
  /** Words and shapes per lens style, `realistic` excepted (it is the default). */
  styles: Record<string, WordShape>;
  /** Tagged entries per tone. */
  tones: Record<string, number>;
  /** Entries restricted to or multiplied for each region; present only for modules that read regions. */
  regions?: Record<string, number>;
  /** Shapes open to `general` per kind. */
  kinds: Record<string, number>;
  /** Kinds not held to the kind target: `delegated` (names from another engine) or `closed` (a real closed system). */
  kindFlags?: Record<string, "delegated" | "closed">;
  /** Culture keys the module offers that no live lens culture reads (its local ones) and the live lens cultures it doesn't offer. */
  roster?: { localKeys: string[]; notOffered: string[] };
}

export interface ThinPool {
  /** `pool` is a shared pool; otherwise a module's own list `module: source`. */
  pool: string;
  module?: string;
  entries: number;
  minimum: number;
}

export interface CoverageReport {
  modules: ModuleCoverage[];
  /** Distinct entries per lens culture, era, style and tone across the plugin (a shared pool counts once). */
  totals: {
    cultures: Record<string, WordShape>;
    eras: Record<string, number>;
    styles: Record<string, WordShape>;
    tones: Record<string, number>;
  };
  thinPools: ThinPool[];
  /** Lens modules the report has no adapter for yet. */
  withoutAdapter: string[];
}

const add = (a: WordShape, row: CoverageRow) => {
  if (row.type === "word") a.words += row.n;
  else a.shapes += row.n;
};

const tierOf = (culture: string): "core" | "second" | "local" | undefined => {
  const lens = lensCulture(culture);
  if (!lens) return "local";
  if (lens.tier === "baseline") return undefined;
  return lens.tier;
};

/** The cells of one module, from its rows. */
export function moduleCoverage(adapter: CoverageAdapter, rows: readonly CoverageRow[] = adapter.rows()): ModuleCoverage {
  const module = adapter.module;
  const cultures: Record<string, CultureCell> = {};
  const eras: Record<string, number> = Object.fromEntries(LENS_ERAS.map((e) => [e.code, 0]));
  const styles: Record<string, WordShape> = {};
  const tones: Record<string, number> = Object.fromEntries(LENS_TONES.map((t) => [t, 0]));
  const regions: Record<string, number> | undefined = adapter.regions ? Object.fromEntries(LENS_REGIONS.map((r) => [r.code, 0])) : undefined;
  const kinds: Record<string, number> = Object.fromEntries((adapter.kinds ?? []).map((k) => [k, 0]));
  const tally = new Map<string, WordShape>();

  for (const row of rows) {
    for (const culture of row.cultures ?? []) {
      if (!tally.has(culture)) tally.set(culture, { words: 0, shapes: 0 });
      add(tally.get(culture)!, row);
    }
    for (const era of row.eras ?? []) eras[era] = (eras[era] ?? 0) + row.n;
    for (const style of row.styles ?? []) {
      if (style === "realistic") continue;
      if (!styles[style]) styles[style] = { words: 0, shapes: 0 };
      add(styles[style], row);
    }
    for (const tone of row.tones ?? []) tones[tone] = (tones[tone] ?? 0) + row.n;
    for (const region of row.regions ?? []) if (regions) regions[region] = (regions[region] ?? 0) + row.n;
    // A shape open to `general` (no culture) serves its kind, or every kind when it names none.
    if (row.type === "shape" && !row.cultures) {
      for (const kind of row.kind ? [row.kind] : Object.keys(kinds)) if (kind in kinds) kinds[kind] += row.n;
    }
  }

  const profiled = new Set((adapter.profiles?.() ?? []).flatMap((k) => cultureReading(module, k)));
  const roster = adapter.roster;
  const offered = roster ? new Set(offeredLensCulturesFor(module, roster)) : undefined;
  const excludedCultures = new Set((adapter.excluded ?? []).filter((x) => !x.kind).flatMap((x) => [...x.cultures]));
  // Core and second-tier cultures are reported for every module; a local culture only where the module has it (§6.3).
  const lensKeys = LENS_CULTURES.filter((c) => c.tier === "core" || c.tier === "second" || (roster ?? []).includes(c.key)).map((c) => c.key);
  const keys = adapter.noTables ? [] : [...new Set([...lensKeys, ...tally.keys()])];
  for (const culture of keys) {
    const tier = tierOf(culture);
    const counted = tally.get(culture) ?? { words: 0, shapes: 0 };
    const target = tier ? LENS_TARGETS.cultures[tier] : undefined;
    const isLive = lensCulture(culture)?.status !== "planned";
    // Excluded cultures are matched by key or by the lens culture a module's own key feeds.
    const excluded = excludedCultures.has(culture) || [...excludedCultures].some((x) => (offeredLensCulturesFor(module, [x]) as string[]).includes(culture));
    const notOffered = !!offered && !offered.has(culture) && lensCulture(culture) !== undefined && isLive && !excluded;
    const cell: CultureCell = {
      ...counted,
      ...(target ? { target: { ...target } } : {}),
      ...(notOffered ? { notOffered: true } : {}),
      ...(excluded ? { excluded: true } : {}),
      profile: profiled.has(culture),
      below: !!target && !excluded && !notOffered && (counted.words < target.words || counted.shapes < target.shapes),
    };
    cultures[culture] = cell;
  }

  const localKeys = roster ? roster.filter((k) => isLocalCulture(module, k)) : [];
  return {
    module,
    land: isLandModule(module),
    adapter: true,
    noTables: !!adapter.noTables,
    rowCount: rows.length,
    cultures,
    eras,
    styles,
    tones,
    ...(regions ? { regions } : {}),
    kinds,
    ...(adapter.kindFlags && Object.keys(adapter.kindFlags).length > 0 ? { kindFlags: { ...adapter.kindFlags } } : {}),
    ...(roster && offered ? { roster: { localKeys, notOffered: LENS_CULTURES.filter((c) => c.status === "live" && c.tier !== "baseline" && !offered.has(c.key) && !excludedCultures.has(c.key)).map((c) => c.key) } } : {}),
  };
}

/** The whole report: every adapter's module, the totals and the thin pools. */
export function buildCoverage(adapters: readonly CoverageAdapter[] = COVERAGE_ADAPTERS): CoverageReport {
  const modules: ModuleCoverage[] = [];
  const totals: CoverageReport["totals"] = {
    cultures: {},
    eras: Object.fromEntries(LENS_ERAS.map((e) => [e.code, 0])),
    styles: {},
    tones: Object.fromEntries(LENS_TONES.map((t) => [t, 0])),
  };
  const sharedPools = new Set(VOCAB_POOL_NAMES);
  const poolOf = (source: string) => source.replace(/\/cultureExtra$/, "");
  /** The module that first counted each shared source: a shared pool is one set of entries however many modules read it. */
  const claimed = new Map<string, string>();
  const ownWords = new Map<string, { module: string; source: string; entries: number }>();

  for (const adapter of adapters) {
    const rows = adapter.rows();
    modules.push(moduleCoverage(adapter, rows));
    for (const row of rows) {
      const shared = sharedPools.has(poolOf(row.source));
      if (shared) {
        const owner = claimed.get(row.source);
        if (owner !== undefined && owner !== adapter.module) continue;
        claimed.set(row.source, adapter.module);
      }
      for (const culture of row.cultures ?? []) {
        totals.cultures[culture] ??= { words: 0, shapes: 0 };
        add(totals.cultures[culture], row);
      }
      for (const era of row.eras ?? []) totals.eras[era] = (totals.eras[era] ?? 0) + row.n;
      for (const style of row.styles ?? []) {
        if (style === "realistic") continue;
        totals.styles[style] ??= { words: 0, shapes: 0 };
        add(totals.styles[style], row);
      }
      for (const tone of row.tones ?? []) totals.tones[tone] = (totals.tones[tone] ?? 0) + row.n;
      if (row.type === "word" && !shared && !row.notPool) {
        const id = `${adapter.module}|${row.source}`;
        const found = ownWords.get(id) ?? { module: adapter.module, source: row.source, entries: 0 };
        found.entries += row.n;
        ownWords.set(id, found);
      }
    }
  }

  // §6.3: a pool or list under the minimum, unless exempt. A shared pool counts once, by its own entries.
  const minimum = LENS_TARGETS.pool;
  const thinPools: ThinPool[] = [];
  for (const pool of VOCAB_POOL_NAMES) {
    const entries = poolEntryCount(pool);
    if (entries < minimum && !poolExemption(pool)) thinPools.push({ pool, entries, minimum });
  }
  for (const { module, source, entries } of ownWords.values()) {
    if (entries < minimum && !poolExemption(source)) thinPools.push({ pool: source, module, entries, minimum });
  }
  thinPools.sort((a, b) => a.entries - b.entries || a.pool.localeCompare(b.pool) || (a.module ?? "").localeCompare(b.module ?? ""));

  const have = new Set(adapters.map((x) => x.module));
  return { modules, totals, thinPools, withoutAdapter: LENS_MODULES.filter((m) => !have.has(m)) };
}
