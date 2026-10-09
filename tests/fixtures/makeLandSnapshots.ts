// Records the "before land" snapshots (Land brief §12 M0): run once from unchanged code.
import { writeFileSync } from "node:fs";
import { generatePlaceNames } from "../../src/names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe } from "../../src/names/recipe";
import { generateRiverNames } from "../../src/rivers/engine";
import { generateWorldPlaceNames, WORLD_CULTURES } from "../../src/world/engine";

const out: Record<string, unknown> = {};
const plain = (v: unknown) => JSON.parse(JSON.stringify(v));
for (const seed of [1, 2, 3]) {
  for (const region of [undefined, "NTH", "WAL"]) {
    out[`british ${region ?? "all"} ${seed}`] = plain(generatePlaceNames({ recipe: britishPlaceNamesRecipe(region), slots: {}, count: 20, seed }).names);
  }
  for (const part of ["new-land", "established"] as const) {
    out[`colonial ${part} ${seed}`] = plain(generatePlaceNames({ recipe: colonialPlaceNamesRecipe(part, undefined, undefined), slots: {}, count: 20, seed }).names);
  }
  for (const setting of ["british", "new-land", "established"] as const) {
    out[`river ${setting} ${seed}`] = plain(generateRiverNames({ setting, count: 20, seed }).names);
  }
}
for (const culture of WORLD_CULTURES) {
  for (const era of culture.eras) {
    out[`world ${culture.id} ${era.id}`] = plain(generateWorldPlaceNames({ culture: culture.id, era: era.id, count: 20, seed: 1 }).names);
  }
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log(Object.keys(out).length, "snapshots");
