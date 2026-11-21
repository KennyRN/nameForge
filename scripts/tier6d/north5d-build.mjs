// Brief 6d: assembles the 5d content of the four cultures (see north5d-words.mjs): module by culture, the inline tags moved into the tag dictionary.
import { CW5D } from "./north5d-words.mjs";
import { NEW6D } from "./north5c-words.mjs";
const TURN = { aztec: 15, maya: 17, andean: 19, polynesian: 21, american: 23 };
// A shuffle keyed by culture and list, so that no 6d culture reads its lists in the order of another culture's (the draws at a seed then differ).
const hash = (t) => { let h = 2166136261; for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619) >>> 0; return h; };
const shuffle = (words, seed) => { const w = [...words]; let x = seed || 1; for (let i = w.length - 1; i > 0; i--) { x = Math.imul(x ^ (x >>> 15), 2246822519) >>> 0; x = (x + 0x9e3779b9) >>> 0; const j = x % (i + 1); [w[i], w[j]] = [w[j], w[i]]; } return w; };
const turn = (culture, text) => text.split(";").map((l, i) => shuffle(l.split("|"), hash(`${culture}:${i}:${l.length}`)).join("|")).join(";");
export const WORDS5D6D = {};
export const TAGS5D6D = {};
for (const culture of NEW6D) {
  for (const [module, text] of Object.entries(CW5D[culture])) {
    const tags = {};
    const clean = text.split(";").map((l) => l.split("|").map((w) => { const i = w.lastIndexOf("@"); if (i < 0) return w; tags[w.slice(0, i)] = w.slice(i + 1); return w.slice(0, i); }).join("|")).join(";");
    // Calendars: each list's words take eras in turn, so that every era holds six of the culture's own words and the shared pool's English farm months (lambing, threshing) are never drawn for it.
    if (module === "calendarNames") for (const l of clean.split(";")) l.split("|").forEach((w, i) => { if (!tags[w]) tags[w] = ["AN-MD", "AN-MD", "MD-EM", "MD-EM", "EM-ST", "ST-MO", "ST-MO", "MO", "MO", "AN-EM"][i % 10]; });
    (WORDS5D6D[module] ??= {})[culture] = turn(culture, clean);
    ((TAGS5D6D[module] ??= {})[culture] = tags);
  }
}
