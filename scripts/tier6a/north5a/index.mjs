// Brief 6a, the land and sea modules: adapts the compact culture files of scripts/tier6a/north5a/ to the 5a generator's format (scripts/make-north5a.mjs).
import { framesOf } from "../../north5a/lib.mjs";
import celtic from "../../north5a/celtic.mjs";
import spanish from "./spanish.mjs";
import portuguese from "./portuguese.mjs";
import french from "./french.mjs";
import italian from "./italian.mjs";
import dutch from "./dutch.mjs";
import roman from "./roman.mjs";
import slavic from "./slavic.mjs";
import greek from "./greek.mjs";
import byzantine from "./byzantine.mjs";

/** The fixed tag order of a ten-word list: three AN-MD, three EM-ST, two ST-MO, one fantastic, one general. */
const TAGS = ["AN-MD", "AN-MD", "AN-MD", "EM-ST", "EM-ST", "EM-ST", "ST-MO", "ST-MO", "h", ""];
const tag = (list) => {
  const words = list.split("|");
  if (words.length !== 10) throw new Error(`a noun list needs ten words: ${list}`);
  return words.map((w, i) => (TAGS[i] ? `${w};${TAGS[i]}` : w)).join("|");
};
const tagAll = (nouns) => ({
  land: Object.fromEntries(Object.entries(nouns.land).map(([k, lists]) => [k, lists.map(tag)])),
  water: Object.fromEntries(Object.entries(nouns.water).map(([k, lists]) => [k, lists.map(tag)])),
  route: nouns.route.map(tag),
  sacred: nouns.sacred.map(tag),
});
const full = [spanish, portuguese, french, italian, dutch, roman, slavic, greek, byzantine];
export const CULTURES_6A = full.map((c) => ({ key: c.key, keys: [c.key], label: c.label, land: c.land, water: c.water, route: c.route, sacred: c.sacred, frames: framesOf(c.style) }));
export const NOUNS_6A = Object.fromEntries(full.map((c) => [c.key, tagAll(c.nouns)]));
export const STYLE_6A = Object.fromEntries(full.map((c) => [c.key, c.style]));

// The mixes (Iberian, Greek and Byzantine): 12 words and 4 shapes of their own, the halves' signature entries at half weight (the engine's `MIX_HALVES`).
const HALVES = { iberian: [spanish, portuguese], "greek-byzantine": [greek, byzantine] };
const four = (list) => {
  const w = list.split("|");
  return [`${w[0]};AN`, `${w[3]};EM`, `${w[8]};h`, w[9]].join("|");
};
for (const [key, label, halves] of [["iberian", "Iberian", HALVES.iberian], ["greek-byzantine", "Greek and Byzantine", HALVES["greek-byzantine"]]]) {
  const [a] = halves;
  const d4 = (d) => d.split("|").slice(0, 4).map((x) => (x.includes(";") ? x.split(";")[0] + ";AN" : x + ";AN")).join("|");
  CULTURES_6A.push({
    key, keys: [key], label,
    land: { B: a.land.B.split("|").slice(0, 4).join("|"), C: a.land.C.split("|").slice(0, 4).join("|"), D: d4(a.land.D) },
    water: { B: a.water.B.split("|").slice(0, 4).join("|"), C: a.water.C.split("|").slice(0, 4).join("|"), D: d4(a.water.D) },
    route: { N: a.route.N, B: a.route.B.split("|").slice(0, 4).join("|"), C: a.route.C.split("|").slice(0, 4).join("|"), D: d4(a.route.D) },
    sacred: { N: a.sacred.N, B: a.sacred.B.split("|").slice(0, 4).join("|"), C: a.sacred.C.split("|").slice(0, 4).join("|"), D: d4(a.sacred.D) },
    frames: celtic.frames,
  });
  NOUNS_6A[key] = {
    land: Object.fromEntries(Object.entries(a.nouns.land).map(([k, lists]) => [k, lists.map(four)])),
    water: Object.fromEntries(Object.entries(a.nouns.water).map(([k, lists]) => [k, lists.map(four)])),
    route: a.nouns.route.map(four),
    sacred: a.nouns.sacred.map(four),
  };
  STYLE_6A[key] = "first";
}
