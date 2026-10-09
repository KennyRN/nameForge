// Records the "before biomes" snapshots (Tribal brief §21): run once from unchanged code.
import { writeFileSync } from "node:fs";
import { generatePlaceNames } from "../../src/names/engine";
import { colonialPlaceNamesRecipe } from "../../src/names/recipe";
import { generateRiverNames } from "../../src/rivers/engine";

export const SNAPSHOT_SEEDS = [1, 4242, 987654321];
export const SNAPSHOT_RECIPES: [string, "new-land" | "established", string | undefined, string | undefined][] = [
  ["new-land general", "new-land", undefined, undefined],
  ["new-land spanish contested", "new-land", "spanish", "contested-frontier"],
  ["established general", "established", undefined, undefined],
  ["established roman imposition", "established", "roman", "imposition"],
];

const out: Record<string, unknown> = {};
for (const [key, part, tradition, context] of SNAPSHOT_RECIPES) {
  for (const seed of SNAPSHOT_SEEDS) {
    out[`${key} ${seed}`] = generatePlaceNames({ recipe: colonialPlaceNamesRecipe(part, tradition, context), slots: {}, count: 20, seed }).names;
  }
}
for (const setting of ["british", "new-land", "established"] as const) {
  for (const seed of SNAPSHOT_SEEDS) out[`river ${setting} ${seed}`] = generateRiverNames({ setting, count: 20, seed }).names;
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
