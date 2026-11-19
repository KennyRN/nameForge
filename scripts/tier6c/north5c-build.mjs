// Brief 6c: assembles the 5c content of the four cultures: the words (north5c-words.mjs, by culture), moved into the module-by-culture layout the maker reads, the tags
// written inline (`Word@AN-MD*`) moved into the tag dictionary, adjectives, styles and rank pairs. Same layout as scripts/tier6b/north5c-build.mjs.
import { readFileSync } from "node:fs";
import { CW, NEW6C } from "./north5c-words.mjs";

// A step of its own for each culture's lists (two siblings drawing the same position of the same list would give the same word).
const TURN = { indian: 7, chinese: 9, japanese: 11, korean: 13 };
const turn = (culture, text) => text.split(";").map((l, i) => { const w = l.split("|"); const k = (TURN[culture] + 2 * i) % w.length; return [...w.slice(k), ...w.slice(0, k)].join("|"); }).join(";");
export const WORDS6C = {};
export const TAGS6C = {};
const split = (module, culture, text) => {
  const tags = {};
  const clean = text.split(";").map((l) => l.split("|").map((w) => {
    const i = w.lastIndexOf("@");
    if (i < 0) return w;
    tags[w.slice(0, i)] = w.slice(i + 1);
    return w.slice(0, i);
  }).join("|")).join(";");
  ((TAGS6C[module] ??= {})[culture] = tags);
  return clean;
};
// The family names of these four keep their own tables (surnames, family first): no 6c content for that module.
for (const culture of NEW6C) for (const [module, text] of Object.entries(CW[culture]).filter(([m]) => m !== "familyNames")) (WORDS6C[module] ??= {})[culture] = turn(culture, split(module, culture, text));
// Words of timeless sense tagged to the three eras before the modern ones, so that each era holds six words of the culture's own without the shared pools' English ones.
const TIMELESS = {
  realms: ["Realm", "Domain", "Province", "Heartland", "Plains", "Rivers", "Marches", "Uplands", "Lowlands", "Highlands", "Coast", "Kinsmen", "Free Men", "Shepherds", "Marchers", "Peninsula", "Fishers", "Archipelago"],
  powerFactions: ["Council", "Assembly", "Court", "Estates", "League", "Faction"],
  familyNames: ["Kinsman", "Heir", "Descendant", "Kindred", "Cousin"],
};
for (const [module, words] of Object.entries(TIMELESS)) {
  for (const culture of Object.keys(TAGS6C[module] ?? {})) {
    const lists = WORDS6C[module][culture].split(";").map((l) => l.split("|"));
    for (const w of lists.flat()) if (words.includes(w) && !TAGS6C[module][culture][w]) TAGS6C[module][culture][w] = "AN-EM";
  }
}
export const ADJ6C = {
  indian: "Old|Grey|Golden|Bright|Fair|Royal|Silent|Sacred|Amber|Great", chinese: "Old|Grey|Golden|Bright|Fair|Celestial|Silent|Jade|Vermilion|Great",
  japanese: "Old|Grey|Golden|Bright|Fair|Eastern|Silent|Crimson|Cherry|Great", korean: "Old|Grey|Golden|Bright|Fair|Morning|Silent|Pine|Azure|Great",
};
export const STYLE6C = { indian: "poss", chinese: "of", japanese: "cp", korean: "adj" };
// The four keep the rank tables they had (the titles module and its tests read them): the English forms of the legacy ranks, man's form first.
const legacy = JSON.parse(readFileSync(new URL("../../src/data/bynames.json", import.meta.url), "utf8")).ranks;
export const RANKS6C = Object.fromEntries(NEW6C.map((c) => [c, legacy[c].map((e) => `${e.m}/${e.f && e.f !== e.m ? e.f : "Lady"}`).join("|")]));
export { NEW6C };
