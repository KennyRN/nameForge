// Brief 6a Part A §2: a live sweep of every module, every kind and every culture it offers, with the people link on `real`:
// the bracket labels that survive in the finished names, and where each was found. Used by tests/bracketSweepReal.test.ts.
import { bracketLabels } from "../../src/fill";
import { generateThingNames, THING_CULTURES, THING_KINDS } from "../../src/things/engine";
import { generateInnNames, INN_KINDS } from "../../src/inns/engine";
import { innFormFor, DEFAULT_INN_STATE } from "../../src/inns/sentence";
import { generateStreetNames, STREET_KINDS } from "../../src/streets/engine";
import { generateBuildingNames, BUILDING_KINDS } from "../../src/buildings/engine";
import { generateMonumentNames, MONUMENT_KINDS } from "../../src/monuments/engine";
import { generateRouteNames, ROUTE_CULTURES, ROUTE_KINDS } from "../../src/routes/engine";
import { generateEventNames, EVENT_KINDS } from "../../src/events/engine";
import { generateMoneyNames, MONEY_CULTURES, MONEY_KINDS } from "../../src/money/engine";
import { generateTimeSkyNames, TIME_CULTURES } from "../../src/timesky/engine";
import { TIME_KINDS } from "../../src/timesky/data";
import { generateVesselNames, VESSEL_CULTURES } from "../../src/vessels/engine";
import { generateRealmNames, REALM_CULTURES } from "../../src/realms/engine";
import { BYNAME_CULTURES, generateBynames } from "../../src/bynames/engine";
import { DEITY_CULTURES, DEITY_KINDS, generateDeityNames } from "../../src/deities/engine";
import { generateWatersNames, WATERS_CULTURES } from "../../src/waters/engine";
import { generateWildsNames, WILDS_CULTURES, WILDS_MODULES } from "../../src/wilds/engine";
import { generateSettlementNames } from "../../src/settlement/names";
import { WORLD_CULTURES } from "../../src/world/engine";
import { DEFAULT_THING_STATE } from "../../src/things/sentence";
import { DEFAULT_STREET_STATE } from "../../src/streets/sentence";
import { DEFAULT_BUILDING_STATE } from "../../src/buildings/sentence";
import { DEFAULT_MONUMENT_STATE } from "../../src/monuments/sentence";
import { DEFAULT_ROUTE_STATE } from "../../src/routes/sentence";
import { DEFAULT_EVENT_STATE } from "../../src/events/sentence";
import { DEFAULT_MONEY_STATE } from "../../src/money/sentence";
import { DEFAULT_CALENDAR_STATE, DEFAULT_SKY_STATE } from "../../src/timesky/calendarSentence";
import { defaultVesselState } from "../../src/vessels/sentence";
import { DEFAULT_REALM_STATE } from "../../src/realms/sentence";
import { DEFAULT_BYNAME_STATE } from "../../src/bynames/sentence";
import { DEFAULT_DEITY_STATE } from "../../src/deities/sentence";
import { defaultWatersState } from "../../src/waters/sentence";
import { defaultWildsState } from "../../src/wilds/sentence";

const ALL_ERAS = ["AN", "MD", "EM", "ST", "MO", "NF", "IS"];
const keys = (list: readonly { key?: string; id?: string }[]) => list.map((c) => (c.key ?? c.id)!);
const texts = (r: unknown): string[] => {
  const x = r as { names?: unknown[]; rows?: unknown[] };
  return ((x.names ?? x.rows ?? []) as (string | { text?: string; name?: string })[]).map((n) => (typeof n === "string" ? n : n.text ?? n.name ?? ""));
};

/** Tests and scratch runs: how many batches each module ran, and how many threw. */
export const stats = { runs: new Map<string, number>(), errors: new Map<string, number>(), sample: [] as string[] };

/** Every bracket label left in a finished name, with where it was found (module, culture, kind). */
export function sweepBrackets(opts: { seeds?: number[]; count?: number; cultures?: string[]; thorough?: boolean } = {}): Map<string, Set<string>> {
  const found = new Map<string, Set<string>>();
  const seeds = opts.seeds ?? [3, 11];
  const count = opts.count ?? 12;
  const only = opts.cultures ? new Set(opts.cultures) : undefined;
  const run = (where: string, make: (seed: number) => unknown) => {
    for (const seed of seeds) {
      let out: string[] = [];
      try {
        out = texts(make(seed));
      } catch (e) {
        stats.errors.set(where.split(" ")[0], (stats.errors.get(where.split(" ")[0]) ?? 0) + 1);
        if (stats.sample.length < 12) stats.sample.push(`${where}: ${(e as Error).message}`);
        continue; // a state the module doesn't offer
      }
      stats.runs.set(where.split(" ")[0], (stats.runs.get(where.split(" ")[0]) ?? 0) + 1);
      for (const t of out) for (const label of bracketLabels(t)) found.set(label, (found.get(label) ?? new Set()).add(where));
    }
  };
  const extraCultures = opts.cultures ?? [];
  const each = (list: string[]) => [...new Set([...list, ...extraCultures])].filter((c) => !only || only.has(c));
  const ERAS = ALL_ERAS;
  /** Every era for the module's default kind; a named kind is swept in the middle ages and the modern world unless `thorough`. */
  const eraOk = (era: string, kind: string | undefined) => opts.thorough || kind === undefined || era === "MD" || era === "MO";
  const base = { people: "real" as const, count };
  for (const c of each(keys(THING_CULTURES))) for (const module of ["arms", "treasure", "book"] as const) {
    for (const era of ERAS) for (const kind of [undefined, ...keys(THING_KINDS)]) for (const fantastic of [false, true]) if (eraOk(era, kind))
      run(`things.${module} ${c} ${era} ${kind ?? "any"}`, (seed) => generateThingNames({ ...DEFAULT_THING_STATE, ...base, module, culture: c, era, kind, fantastic, seed } as never));
  }
  for (const c of each(keys(ROUTE_CULTURES))) {
    for (const era of ERAS) {
      for (const kind of [undefined, ...keys(INN_KINDS)]) if (eraOk(era, kind)) {
        const s = { ...DEFAULT_INN_STATE, ...base, culture: c, era, kind } as never;
        run(`inns ${c} ${era} ${kind ?? "any"}`, (seed) => generateInnNames({ ...(s as object), form: innFormFor(s), seed } as never));
      }
      for (const kind of [undefined, ...keys(STREET_KINDS)]) if (eraOk(era, kind)) run(`streets ${c} ${era} ${kind ?? "any"}`, (seed) => generateStreetNames({ ...DEFAULT_STREET_STATE, ...base, culture: c, era, kind, seed } as never));
      for (const kind of [undefined, ...keys(BUILDING_KINDS)]) if (eraOk(era, kind)) run(`buildings ${c} ${era} ${kind ?? "any"}`, (seed) => generateBuildingNames({ ...DEFAULT_BUILDING_STATE, ...base, culture: c, era, kind, seed } as never));
      for (const kind of [undefined, ...keys(MONUMENT_KINDS)]) if (eraOk(era, kind)) run(`monuments ${c} ${era} ${kind ?? "any"}`, (seed) => generateMonumentNames({ ...DEFAULT_MONUMENT_STATE, ...base, culture: c, era, kind, seed } as never));
      for (const kind of [undefined, ...keys(ROUTE_KINDS)]) if (eraOk(era, kind)) run(`routes ${c} ${era} ${kind ?? "any"}`, (seed) => generateRouteNames({ ...DEFAULT_ROUTE_STATE, ...base, culture: c, era, kind, seed } as never));
      for (const kind of [undefined, ...keys(EVENT_KINDS)]) if (eraOk(era, kind)) run(`events ${c} ${era} ${kind ?? "any"}`, (seed) => generateEventNames({ ...DEFAULT_EVENT_STATE, ...base, culture: c, era, kind, seed } as never));
    }
  }
  for (const c of each(keys(MONEY_CULTURES))) for (const era of ERAS) for (const kind of [undefined, ...keys(MONEY_KINDS)])
    run(`money ${c} ${era} ${kind ?? "any"}`, (seed) => generateMoneyNames({ ...DEFAULT_MONEY_STATE, ...base, culture: c, era, kind, seed } as never));
  for (const c of each(keys(TIME_CULTURES))) for (const era of ERAS) for (const kind of [undefined, ...keys(TIME_KINDS)]) if (eraOk(era, kind)) {
    run(`calendars ${c} ${era} ${kind ?? "any"}`, (seed) => generateTimeSkyNames({ ...DEFAULT_CALENDAR_STATE, ...base, culture: c, era, kind, seed } as never));
    run(`sky ${c} ${era} ${kind ?? "any"}`, (seed) => generateTimeSkyNames({ ...DEFAULT_SKY_STATE, ...base, culture: c, era, kind, seed } as never));
  }
  for (const module of ["ships", "spacecraft", "aircraft", "landVehicles"] as const) for (const c of each(keys(VESSEL_CULTURES))) {
    const st = defaultVesselState(module);
    for (const style of [undefined, "heroic", "grim", "outlaw"]) run(`${module} ${c} ${style ?? "default"}`, (seed) => generateVesselNames({ ...st, ...base, module, culture: c, style, seed } as never));
  }
  for (const c of each(keys(REALM_CULTURES))) for (const era of ["ancient", "medieval", "modern"]) for (const output of ["official", "short"])
    run(`realms ${c} ${era} ${output}`, (seed) => generateRealmNames({ ...DEFAULT_REALM_STATE, ...base, culture: c, era, output, seed } as never));
  for (const module of ["epithets", "familyNames", "titles"] as const) for (const c of each(keys(BYNAME_CULTURES))) for (const genre of ["FL", "modern"])
    run(`${module} ${c} ${genre}`, (seed) => generateBynames({ ...DEFAULT_BYNAME_STATE, ...base, module, culture: c, genre, seed } as never));
  for (const c of each(keys(DEITY_CULTURES))) for (const era of ERAS) for (const kind of keys(DEITY_KINDS)) if (eraOk(era, kind))
    run(`deities ${c} ${era} ${kind}`, (seed) => generateDeityNames({ ...DEFAULT_DEITY_STATE, ...base, culture: c, era, kind, seed } as never));
  for (const module of ["seasLakes", "coastsIslands", "seaCharts"] as const) for (const c of each(keys(WATERS_CULTURES))) for (const era of ["MD", "MO", "AN"])
    run(`${module} ${c} ${era}`, (seed) => generateWatersNames({ ...defaultWatersState(module), ...base, module, culture: c, era, seed } as never));
  for (const module of WILDS_MODULES) for (const c of each(keys(WILDS_CULTURES))) for (const era of ["MD", "MO", "AN"])
    run(`${module} ${c} ${era}`, (seed) => generateWildsNames({ ...defaultWildsState(module), ...base, module, culture: c, era, seed } as never));
  for (const c of each(WORLD_CULTURES.map((w) => w.id))) for (const size of ["any", "city", "village"]) for (const era of [undefined, "MD", "MO"])
    run(`settlements ${c} ${size} ${era ?? "-"}`, (seed) => generateSettlementNames({ setting: "native", culture: c, size, era, ...base, seed, faithfulness: 2, strictness: 3 } as never));
  return found;
}
