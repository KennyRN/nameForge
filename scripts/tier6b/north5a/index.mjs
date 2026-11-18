// Brief 6b, the land and sea modules: adapts the compact culture files of scripts/tier6b/north5a/ to the 5a generator's format (scripts/make-north5a.mjs).
import { framesOf } from "../../north5a/lib.mjs";
import celtic from "../../north5a/celtic.mjs";
import turkic from "./turkic.mjs";
import mongol from "./mongol.mjs";
import arabic from "./arabic.mjs";
import persian from "./persian.mjs";
import egyptian from "./egyptian.mjs";
import ethiopian from "./ethiopian.mjs";
import bantu from "./bantu.mjs";
import westAfrican from "./west-african.mjs";

/** The fixed tag order of a ten-word list: three AN-MD, three EM-ST, two ST-MO, one fantastic, one general (a culture may give its own `tags`: Egyptian's era voices). */
const TAGS = ["AN-MD", "AN-MD", "AN-MD", "EM-ST", "EM-ST", "EM-ST", "ST-MO", "ST-MO", "h", ""];
const tag = (list, tags) => {
  const words = list.split("|");
  if (words.length !== 10) throw new Error(`a noun list needs ten words: ${list}`);
  return words.map((w, i) => (tags[i] ? `${w};${tags[i]}` : w)).join("|");
};
const tagAll = (nouns, tags, routeTags = tags) => ({
  land: Object.fromEntries(Object.entries(nouns.land).map(([k, lists]) => [k, lists.map((l) => tag(l, tags))])),
  water: Object.fromEntries(Object.entries(nouns.water).map(([k, lists]) => [k, lists.map((l) => tag(l, tags))])),
  route: nouns.route.map((l) => tag(l, routeTags)),
  sacred: nouns.sacred.map((l) => tag(l, tags)),
});
const full = [turkic, mongol, arabic, persian, egyptian, ethiopian, bantu, westAfrican];
export const CULTURES_6B = full.map((c) => ({ key: c.key, keys: [c.key], label: c.label, land: c.land, water: c.water, route: c.route, sacred: c.sacred, frames: framesOf(c.style) }));
export const NOUNS_6B = Object.fromEntries(full.map((c) => [c.key, tagAll(c.nouns, c.tags ?? TAGS, c.routeTags ?? c.tags ?? TAGS)]));
export const STYLE_6B = Object.fromEntries(full.map((c) => [c.key, c.style]));

// The mixes (Turkic and Mongol steppe, Arabic and Persian): 12 words and 4 shapes of their own, the halves' signature entries at half weight (the engine's `MIX_HALVES`).
const HALVES = { steppe: [turkic, mongol], "arabic-persian": [arabic, persian] };
const four = (list) => {
  const w = list.split("|");
  return [`${w[0]};AN`, `${w[3]};EM`, `${w[8]};h`, w[9]].join("|");
};
for (const [key, label, halves] of [["steppe", "Turkic and Mongol steppe", HALVES.steppe], ["arabic-persian", "Arabic and Persian", HALVES["arabic-persian"]]]) {
  const [a] = halves;
  const d4 = (d) => d.split("|").slice(0, 4).map((x) => (x.includes(";") ? x.split(";")[0] + ";AN" : x + ";AN")).join("|");
  CULTURES_6B.push({
    key, keys: [key], label,
    land: { B: a.land.B.split("|").slice(0, 4).join("|"), C: a.land.C.split("|").slice(0, 4).join("|"), D: d4(a.land.D) },
    water: { B: a.water.B.split("|").slice(0, 4).join("|"), C: a.water.C.split("|").slice(0, 4).join("|"), D: d4(a.water.D) },
    route: { N: a.route.N, B: a.route.B.split("|").slice(0, 4).join("|"), C: a.route.C.split("|").slice(0, 4).join("|"), D: d4(a.route.D) },
    sacred: { N: a.sacred.N, B: a.sacred.B.split("|").slice(0, 4).join("|"), C: a.sacred.C.split("|").slice(0, 4).join("|"), D: d4(a.sacred.D) },
    frames: celtic.frames,
  });
  NOUNS_6B[key] = {
    land: Object.fromEntries(Object.entries(a.nouns.land).map(([k, lists]) => [k, lists.map(four)])),
    water: Object.fromEntries(Object.entries(a.nouns.water).map(([k, lists]) => [k, lists.map(four)])),
    route: a.nouns.route.map(four),
    sacred: a.nouns.sacred.map(four),
  };
  STYLE_6B[key] = "first";
}
