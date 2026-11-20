// Builds the world-engine data for batch 6c's settlement names (the eras added to the four existing world cultures) from scripts/tier6c/settlement.mjs and the people tables.
import { readFileSync } from "node:fs";
import { NEW_ERAS } from "./settlement.mjs";

const people = JSON.parse(readFileSync(new URL("../../src/data/people.json", import.meta.url), "utf8")).cultures;
const labels = {
  ...JSON.parse(readFileSync(new URL("../../src/data/world-place-names.json", import.meta.url), "utf8")).labels,
  ...JSON.parse(readFileSync(new URL("../../src/data/tier6a.json", import.meta.url), "utf8")).settlement.labels,
  ...JSON.parse(readFileSync(new URL("../../src/data/tier6b.json", import.meta.url), "utf8")).settlement.labels,
};
const north5bLabels = JSON.parse(readFileSync(new URL("../../src/data/north5b.json", import.meta.url), "utf8")).settlement.labels;
/** Famous figures never name a place. */
/** Brief 6d A3: a personal name that reads as an English word or a famous place is not a place's founder ("Fuji's Eating House", "Park's Tea House"). */
const READS_AS_WORD = new Set(["man", "park", "moon", "song", "sun", "son", "fuji", "hong"]);
const pick = (culture, key, n) => people[culture].historic[key].filter((e) => !e[2] && !READS_AS_WORD.has(e[0].toLowerCase())).slice(0, n).map((e) => e[0]);
const withGreat = (codes) => (codes.includes("c") && !codes.includes("g") ? `${codes}g` : codes);
const parse = (s) => s.split("|").map((x) => x.trim()).filter(Boolean);
const listsOf = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, parse(v)]));

export function buildSettlement() {
  const newEras = {};
  const augmentSizes = {};
  const allKeys = new Set();
  for (const [culture, eras] of Object.entries(NEW_ERAS)) {
    newEras[culture] = [];
    augmentSizes[culture] = { eras: {}, lists: {} };
    for (const e of eras) {
      const lists = { ...listsOf(e.lists), name: pick(e.name, e.nameKey ?? "male", 28) };
      newEras[culture].push({ id: e.id, label: e.label, guide: e.guide, lists, templates: e.templates.map(([p, w]) => [p, w]) });
      augmentSizes[culture].eras[e.id] = Object.fromEntries(e.templates.map(([p, , s]) => [p, withGreat(s)]));
      for (const [k, v] of Object.entries(listsOf(e.lists))) {
        allKeys.add(k);
        augmentSizes[culture].lists[k] = { ...(augmentSizes[culture].lists[k] ?? {}), ...Object.fromEntries(v.map((w) => [w, "hvtcg"])) };
      }
    }
  }
  const newLabels = Object.fromEntries([...allKeys].filter((k) => !(k in labels) && !(k in north5bLabels)).map((k) => [k, `${k} word`]));
  return { cultures: [], sizes: {}, newEras, augmentSizes, labels: newLabels, eraMap: {} };
}
