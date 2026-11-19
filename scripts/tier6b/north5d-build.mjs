// Brief 6b: assembles the 5d content of the batch's cultures (see north5d-words.mjs): module by culture, the inline tags moved into the tag dictionary, and the two mixes.
import { CW5D } from "./north5d-words.mjs";
import { NEW6B } from "./north5c-words.mjs";
// The order of a list means nothing here, and two siblings drawing the same position of the same list would give the same word: each culture of a sibling group turns its lists by a step of its own.
const TURN = { turkic: 0, mongol: 3, arabic: 1, persian: 4, egyptian: 6, ethiopian: 8, bantu: 2, "west-african": 5 };
const turn = (culture, text) => text.split(";").map((l, i) => { const w = l.split("|"); const k = (TURN[culture] + 2 * i) % w.length; return [...w.slice(k), ...w.slice(0, k)].join("|"); }).join(";");
const four = (s) => s.split(";").map((l) => { const w = l.split("|"); return [w[0], w[3], w[8], w[9]].join("|"); }).join(";");
export const WORDS5D6B = {};
export const TAGS5D6B = {};
for (const culture of NEW6B) {
  for (const [module, text] of Object.entries(CW5D[culture])) {
    const tags = {};
    const clean = text.split(";").map((l) => l.split("|").map((w) => { const i = w.lastIndexOf("@"); if (i < 0) return w; tags[w.slice(0, i)] = w.slice(i + 1); return w.slice(0, i); }).join("|")).join(";");
    (WORDS5D6B[module] ??= {})[culture] = turn(culture, clean);
    ((TAGS5D6B[module] ??= {})[culture] = tags);
  }
}
for (const module of Object.keys(WORDS5D6B)) {
  WORDS5D6B[module].steppe = four(WORDS5D6B[module].turkic);
  WORDS5D6B[module]["arabic-persian"] = four(WORDS5D6B[module].arabic);
  TAGS5D6B[module].steppe = TAGS5D6B[module].turkic;
  TAGS5D6B[module]["arabic-persian"] = TAGS5D6B[module].arabic;
}
