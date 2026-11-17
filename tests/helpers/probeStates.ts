// Sibling-distinctness test (second pass): the states the user sees. Every module's real default state (tests/fixtures/lensOffersProbe.ts `probeSpecs`: the states behind
// lens-offers.json, which the probe and the plugin use), with only the culture changed, for each culture the module offers; the engines run as the module runs them.
import "../../src/lensRosterSources";
import "../../src/fill/batch";
import "../../src/places/sources";
import { probeOfferedCultures, probeSpecs } from "../fixtures/lensOffersProbe";

export type StateMode = "default" | "probe";
export interface Measured {
  /** module → culture → seed → the names. */
  names: Record<string, Record<string, Record<number, string[]>>>;
  /** module → the cultures it offers (whether or not the test measured them). */
  offered: Record<string, string[]>;
  /** module → culture → an error a run threw, if any. */
  errors: Record<string, Record<string, string>>;
}

/**
 * Runs every module (less `skip`) at its default state for `cultures` (where offered) over `seeds`. `mode` "default" is the plugin's own default state; "probe" runs it with
 * people as placeholders, as the probe behind lens-offers.json does.
 */
export function measureStates(cultures: readonly string[], seeds: readonly number[], skip: readonly string[], mode: StateMode): Measured {
  const out: Measured = { names: {}, offered: {}, errors: {} };
  for (const spec of probeSpecs()) {
    if (skip.includes(spec.key)) continue;
    const offered = probeOfferedCultures(spec);
    out.offered[spec.key] = offered;
    for (const culture of cultures) {
      if (!offered.includes(culture)) continue;
      const base = spec.state();
      let state: Record<string, unknown> = { ...base, [spec.culture]: culture };
      if (mode === "probe" && "people" in state) state = { ...state, people: "placeholders" };
      for (const seed of seeds) {
        try {
          const names = spec.run(state, seed);
          ((out.names[spec.key] ??= {})[culture] ??= {})[seed] = names;
        } catch (error) {
          (out.errors[spec.key] ??= {})[culture] = error instanceof Error ? error.message : String(error);
        }
      }
    }
  }
  return out;
}

/** The overlap of A against B in a module: the share of A's names B also gives at the same seed (undefined when either was not measured). */
export function overlap(m: Measured, module: string, a: string, b: string, seeds: readonly number[]): number | undefined {
  const A = m.names[module]?.[a];
  const B = m.names[module]?.[b];
  if (!A || !B) return undefined;
  let total = 0;
  let shared = 0;
  for (const seed of seeds) {
    if (!A[seed] || !B[seed]) return undefined;
    const set = new Set(B[seed]);
    total += A[seed].length;
    shared += A[seed].filter((n) => set.has(n)).length;
  }
  return total === 0 ? undefined : Math.round((100 * shared) / total);
}
