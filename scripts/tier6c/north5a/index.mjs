// Brief 6c, the land and sea modules: adapts the culture files of scripts/tier6c/north5a/ to the 5a generator's format (scripts/make-north5a.mjs).
import { framesOf } from "../../north5a/lib.mjs";
import indian from "./indian.mjs";
import chinese from "./chinese.mjs";
import japanese from "./japanese.mjs";
import korean from "./korean.mjs";

/** The fixed tag order of a ten-word list: three AN-MD, three EM-ST, two ST-MO, one fantastic, one general. */
const TAGS = ["AN-MD", "AN-MD", "AN-MD", "EM-ST", "EM-ST", "EM-ST", "ST-MO", "ST-MO", "h", ""];
const tag = (list) => {
  const words = list.split("|");
  if (words.length < 10) throw new Error(`a noun list needs ten words: ${list}`);
  // Ten words take the fixed tags; any word after the tenth carries a tag of its own.
  if (words.slice(10).some((w) => !w.includes(";"))) throw new Error(`a word after the tenth needs its own tag: ${list}`);
  return words.map((w, i) => (i < 10 && TAGS[i] ? `${w};${TAGS[i]}` : w)).join("|");
};
const tagAll = (nouns) => ({
  land: Object.fromEntries(Object.entries(nouns.land).map(([k, lists]) => [k, lists.map(tag)])),
  water: Object.fromEntries(Object.entries(nouns.water).map(([k, lists]) => [k, lists.map(tag)])),
  route: nouns.route.map(tag),
  sacred: nouns.sacred.map(tag),
});
const full = [indian, chinese, japanese, korean];
export const CULTURES_6C = full.map((c) => ({ key: c.key, keys: [c.key], label: c.label, land: c.land, water: c.water, route: c.route, sacred: c.sacred, frames: framesOf(c.style, { route: [["drove", "{goods} Track", 4]] }) }));
export const NOUNS_6C = Object.fromEntries(full.map((c) => [c.key, tagAll(c.nouns)]));
export const STYLE_6C = Object.fromEntries(full.map((c) => [c.key, c.style]));
