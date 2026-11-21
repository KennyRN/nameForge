// Brief 6d fixes §3: every module the lens knows (`probeSpecs`) at every culture it offers, in every era it reads, at the given seeds, with the people link on placeholders and on real.
import "../../src/lensRosterSources";
import "../../src/fill/batch";
import "../../src/places/sources";
import { probeOfferedCultures, probeSpecs } from "../fixtures/lensOffersProbe";

interface Spec {
  key: string;
  culture: string;
  state: () => Record<string, unknown>;
  run: (state: Record<string, unknown>, seed: number) => string[];
}
export const FAULT_ERAS = ["AN", "MD", "EM", "ST", "MO", "NF", "IS"];

/** Calls `visit(module, culture, text)` for every name of every module, culture, era (where the module has one) and seed. */
export function sweepEveryModule(seeds: number[], visit: (module: string, culture: string, text: string) => void): { modules: string[]; runs: number } {
  const modules: string[] = [];
  let runs = 0;
  for (const spec of probeSpecs() as unknown as Spec[]) {
    modules.push(spec.key);
    const base = spec.state();
    const eras = "era" in base ? FAULT_ERAS : [undefined];
    for (const culture of probeOfferedCultures(spec as never)) {
      for (const era of eras) {
        for (const people of ["placeholders", "real"]) {
          for (const seed of seeds) {
            let names: string[] = [];
            try {
              names = spec.run({ ...base, [spec.culture]: culture, ...(era ? { era } : {}), ...("people" in base ? { people } : {}), count: 12 }, seed);
            } catch {
              continue;
            }
            runs++;
            for (const t of names) visit(spec.key, culture, t);
          }
        }
      }
    }
  }
  return { modules, runs };
}
