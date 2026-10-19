// Records native place names, exploration and expansion batches for the urban brief's regression test (§9.2).
// Run against the code before the `settlement` options existed; the test replays them.
import { writeFileSync } from "node:fs";
import { generatePlaceNames } from "../../src/names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe } from "../../src/names/recipe";
import { generateWorldPlaceNames } from "../../src/world/engine";

export const SEEDS = [1, 42, 2024];
const out: Record<string, string[]> = {};
const texts = (r: { names: { text: string }[] }) => r.names.map((n) => n.text);

for (const seed of SEEDS) {
  const base = { slots: {}, count: 30, seed, faithfulness: 2, strictness: 3 };
  out[`british ${seed}`] = texts(generatePlaceNames({ ...base, recipe: britishPlaceNamesRecipe(undefined) }));
  out[`british NTH ${seed}`] = texts(generatePlaceNames({ ...base, recipe: britishPlaceNamesRecipe("NTH") }));
  for (const [culture, era] of [["norse", "viking"], ["chinese", "imperial"], ["roman", "medieval"]]) {
    out[`${culture} ${era} ${seed}`] = generateWorldPlaceNames({ culture, era, count: 30, seed }).names.map((n) => n.text);
  }
  out[`exploration ${seed}`] = texts(generatePlaceNames({ ...base, recipe: colonialPlaceNamesRecipe("new-land", undefined, undefined) }));
  out[`expansion ${seed}`] = texts(generatePlaceNames({ ...base, recipe: colonialPlaceNamesRecipe("established", undefined, undefined) }));
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
