// Brief 6a: assembles the 5d content of the batch's cultures (see north5d-words.mjs).
import { W5D } from "./north5d-words.mjs";
import { PT5D, BZ5D } from "./pt-bz-words.mjs";
import { AS5D } from "./anglo-saxon-words.mjs";
const dedupe = (s) => s.split(";").map((l) => { const seen = new Set(); return l.split("|").filter((w) => (seen.has(w.toLowerCase()) ? false : (seen.add(w.toLowerCase()), true))).join("|"); }).join(";");
const four = (s) => s.split(";").map((l) => { const w = l.split("|"); return [w[0], w[3], w[8], w[9]].join("|"); }).join(";");
for (const m of Object.keys(W5D)) {
  if (!PT5D[m] || !BZ5D[m]) throw new Error(`no own Portuguese or Byzantine words for ${m}`);
  W5D[m].portuguese = dedupe(PT5D[m]);
  W5D[m].byzantine = dedupe(BZ5D[m]);
  if (!AS5D[m]) throw new Error(`no Anglo-Saxon words for ${m}`);
  W5D[m]["anglo-saxon"] = dedupe(AS5D[m]);
  W5D[m].iberian = four(W5D[m].spanish);
  W5D[m]["greek-byzantine"] = four(W5D[m].greek);
}
export const WORDS5D = W5D;
