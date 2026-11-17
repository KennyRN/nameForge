// Builds the world-engine data for batch 6b's settlement names from scripts/tier6a/settlement.mjs and the people tables.
import { readFileSync } from "node:fs";
import { CULTURES, ERA_MAP, NEW_ERAS } from "./settlement.mjs";
import { INTERSTELLAR_LIST_FARM2, INTERSTELLAR_TEMPLATES } from "../north5b/settlement.mjs";

const people = JSON.parse(readFileSync(new URL("../../src/data/people.json", import.meta.url), "utf8")).cultures;
const labels = { ...JSON.parse(readFileSync(new URL("../../src/data/world-place-names.json", import.meta.url), "utf8")).labels, ...JSON.parse(readFileSync(new URL("../../src/data/tier6a.json", import.meta.url), "utf8")).settlement.labels };
const north5bLabels = JSON.parse(readFileSync(new URL("../../src/data/north5b.json", import.meta.url), "utf8")).settlement.labels;
const pick = (culture, key, n) => people[culture].historic[key].filter((e) => !e[2]).slice(0, n).map((e) => e[0]);
const saints = (culture) => {
  const free = pick(culture, "holy", 14);
  return free.length >= 8 ? free : people[culture].historic.holy.slice(0, 14).map((e) => e[0]);
};
const LABELS = { river: "river word", monastery: "monastery word", gate: "gate word", village: "village word", port: "harbour word", canal: "canal word", boulevard: "street word", station: "station word", delta: "farmland word", coast: "coast word", dam: "works word", amba: "amba word", market: "market word", lake: "lake word", mission: "mission word", post: "trading post word", kraal: "homestead word", township: "township word", mine: "mine word", rail: "railway word", lagoon: "lagoon word", mosque: "mosque word", steppe: "steppe word", han: "inn word", bazaar: "market word", baths: "bath word", pasture: "camp word", camp: "camp word", cairn: "cairn word", relay: "relay word", mount: "mountain word", well: "well word", wadi: "wadi word", oasis: "oasis word", souk: "market word", stop: "caravan stop word", dune: "desert word", garden: "garden word", channel: "channel word", caravanserai: "inn word", fire: "temple word", salt: "salt word", polo: "square word", pass: "pass word", town: "settlement word", hill: "hill word", water: "water word", field: "field word", castle: "fort word", church: "church word", craft: "works word", dike: "dike word", fen: "wet ground word", haven: "harbour word", ridge: "ridge word", mill: "works word", tower: "fort word", commune: "town word", square: "square word", harbour: "harbour word", rank: "status", where: "landmark", land: "landscape word", good: "auspicious word", cape: "cape word", vine: "farm word", fort: "fort word", fishing: "fishing word", god: "deity", city: "settlement word", sacred: "sacred place", island: "island word", plain: "plain word", fortress: "fort word", monastery: "monastery word", imperial: "status", road: "road word", wood: "wood word", farm2: "steading word" };
const withGreat = (codes) => (codes.includes("c") && !codes.includes("g") ? `${codes}g` : codes);
const parse = (s) => s.split("|").map((x) => x.trim()).filter(Boolean);
const listsOf = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, parse(v)]));
const OWN_EXCLUDED = ["name", "saint", "adj", "tree", "animal"];

export function buildSettlement() {
  const cultures = [];
  const sizes = {};
  const allKeys = new Set();
  for (const [id, c] of Object.entries(CULTURES)) {
    const lists = listsOf(c.lists);
    lists.name = pick(c.name, "male", 28);
    lists.saint = saints(c.saintFrom);
    const eraTables = {};
    const eras = c.eras.map((e) => {
      eraTables[e.id] = Object.fromEntries(e.templates.map(([p, , s]) => [p, withGreat(s)]));
      return { id: e.id, label: e.label, templates: e.templates.map(([p, w]) => [p, w]) };
    });
    eras.push({ id: "interstellar", label: "Interstellar", guide: `${c.label} steadings and space words.`, lists: { farm2: parse(INTERSTELLAR_LIST_FARM2) }, templates: INTERSTELLAR_TEMPLATES.map(([p, w]) => [p, w]) });
    eraTables.interstellar = Object.fromEntries(INTERSTELLAR_TEMPLATES.map(([p, , s]) => [p, s]));
    cultures.push({ id, homelandBiome: c.biome, label: c.label, guide: c.guide, fuseChance: c.fuse, lists, eras });
    const own = Object.fromEntries(Object.entries(lists).filter(([k]) => !OWN_EXCLUDED.includes(k)).map(([k, v]) => [k, Object.fromEntries(v.map((w) => [w, "hvtcg"]))]));
    sizes[id] = { eras: eraTables, lists: own };
    for (const k of Object.keys(lists)) allKeys.add(k);
  }
  // The existing cultures' new eras (Roman, Slavic): the era, and its size tables.
  const newEras = {};
  const augmentSizes = {};
  for (const [culture, eras] of Object.entries(NEW_ERAS)) {
    newEras[culture] = [];
    augmentSizes[culture] = { eras: {}, lists: {} };
    for (const e of eras) {
      const lists = { ...listsOf(e.lists), name: pick(e.name, "male", 28) };
      newEras[culture].push({ id: e.id, label: e.label, guide: e.guide, lists, templates: e.templates.map(([p, w]) => [p, w]) });
      augmentSizes[culture].eras[e.id] = Object.fromEntries(e.templates.map(([p, , s]) => [p, withGreat(s)]));
      for (const [k, v] of Object.entries(listsOf(e.lists))) {
        allKeys.add(k);
        augmentSizes[culture].lists[k] = { ...(augmentSizes[culture].lists[k] ?? {}), ...Object.fromEntries(v.map((w) => [w, "hvtcg"])) };
      }
    }
  }
  const newLabels = Object.fromEntries([...allKeys].filter((k) => !(k in labels) && !(k in north5bLabels)).map((k) => [k, LABELS[k] ?? `${k} word`]));
  return { cultures, sizes, newEras, augmentSizes, labels: newLabels, eraMap: ERA_MAP };
}
