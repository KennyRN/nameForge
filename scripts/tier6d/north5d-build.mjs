// Brief 6d: assembles the 5d content of the four cultures (see north5d-words.mjs): module by culture, the inline tags moved into the tag dictionary.
import { CW5D } from "./north5d-words.mjs";
import { NEW6D } from "./north5c-words.mjs";
const TURN = { aztec: 15, maya: 17, andean: 19, polynesian: 21, american: 23 };
const turn = (culture, text) => text.split(";").map((l, i) => { const w = l.split("|"); const k = (TURN[culture] + 2 * i) % w.length; return [...w.slice(k), ...w.slice(0, k)].join("|"); }).join(";");
export const WORDS5D6D = {};
export const TAGS5D6D = {};
for (const culture of NEW6D) {
  for (const [module, text] of Object.entries(CW5D[culture])) {
    const tags = {};
    const clean = text.split(";").map((l) => l.split("|").map((w) => { const i = w.lastIndexOf("@"); if (i < 0) return w; tags[w.slice(0, i)] = w.slice(i + 1); return w.slice(0, i); }).join("|")).join(";");
    (WORDS5D6D[module] ??= {})[culture] = turn(culture, clean);
    ((TAGS5D6D[module] ??= {})[culture] = tags);
  }
}
