// Settlement kit brief §13.2: the seven engines' outputs without a context, for a fixed spread of
// options. tests/settlementKit.test.ts compares the engines against tests/fixtures/settlement-engines.json,
// written by this function before the context option was added, and again for the deities brief's
// back-links (§10), with the deities engine loaded as the app loads it.
import "../../src/deities/engine";
import { generateRouteNames } from "../../src/routes/engine";
import { generateStreetNames } from "../../src/streets/engine";
import { generateInnNames } from "../../src/inns/engine";
import { generateBuildingNames } from "../../src/buildings/engine";
import { generateGroupNames } from "../../src/groups/engine";
import { generateBynames } from "../../src/bynames/engine";
import { generateVesselNames } from "../../src/vessels/engine";
import type { RouteEra } from "../../src/routes/engine";

const CULTURES = ["norman-british", "general", "japanese", "arabic-persian", "slavic", "polynesian"];
const ERAS: RouteEra[] = ["AN", "MD", "EM", "ST", "MO", "NF", "IS"];

export function engineSnapshot(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  let seed = 11;
  for (const culture of CULTURES) {
    for (const era of ERAS) {
      for (const people of ["placeholders", "invented"] as const) {
        const series = seed % 2 === 0;
        const key = `${culture} ${era} ${people}`;
        out[`routes ${key}`] = generateRouteNames({ culture, era, people, series, count: 8, seed: seed++ }).names.map((n) => n.text);
        out[`streets ${key}`] = generateStreetNames({ culture, era, people, series, count: 10, seed: seed++ }).names.map((n) => n.text);
        out[`inns ${key}`] = generateInnNames({ culture, era, people, series, count: 8, seed: seed++ }).names.map((n) => n.text);
        out[`buildings ${key}`] = generateBuildingNames({ culture, era, people, series, count: 8, seed: seed++ }).names.map((n) => n.text);
      }
    }
  }
  for (const family of ["mystic", "martial", "underworld", "trade", "power", "adventure"]) {
    for (const tradition of ["general", "anglo-saxon", "japanese"]) {
      for (const people of ["placeholders", "invented"] as const) {
        for (const genre of ["fantasy", "modern", "scifi"] as const) {
          out[`groups ${family} ${tradition} ${people} ${genre}`] = generateGroupNames({ family, tradition, people, genre, count: 10, seed: seed++ }).names.map((n) => n.text);
        }
      }
    }
  }
  for (const module of ["titles", "epithets", "familyNames"] as const) {
    for (const culture of ["general", "norman-british", "aztec", "japanese", "slavic"]) {
      out[`bynames ${module} ${culture}`] = generateBynames({ module, culture, count: 10, seed: seed++ }).names.map((n) => n.text);
    }
  }
  for (const module of ["ships", "spacecraft"] as const) {
    for (const culture of ["general", "norman-british", "japanese", "hawaiian"]) {
      for (const people of ["placeholders", "invented"] as const) {
        out[`vessels ${module} ${culture} ${people}`] = generateVesselNames({ module, culture, people, count: 10, seed: seed++ }).names.map((n) => n.text);
      }
    }
  }
  return out;
}
