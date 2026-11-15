// Builds the world-engine data for batch 5b's settlement names from scripts/north5b/settlement.mjs and the people tables.
import { readFileSync } from "node:fs";
import { CULTURES, INTERSTELLAR_LIST_FARM2, INTERSTELLAR_TEMPLATES, NORSE_REGIONS } from "./settlement.mjs";

const people = JSON.parse(readFileSync(new URL("../../src/data/people.json", import.meta.url), "utf8")).cultures;
const pick = (culture, key, n) => people[culture].historic[key].filter((e) => !e[2]).slice(0, n).map((e) => e[0]);
const saints = (culture) => {
  const free = pick(culture, "holy", 14);
  return free.length >= 8 ? free : people[culture].historic.holy.slice(0, 14).map((e) => e[0]);
};
const labels = JSON.parse(readFileSync(new URL("../../src/data/world-place-names.json", import.meta.url), "utf8")).labels;
const LABELS = { hill: "hill word", valley: "valley word", spring: "spring word", chapel: "chapel word", mine: "works word", mead: "meadow word", cove: "cove word", moor: "moor word", kirk: "church word", ford: "ford word", mouth: "mouth word", bog: "wet ground word", lake: "lake word", brook: "brook word", field: "field word", mark: "border word", free: "town word", wood: "wood word", rA: "region word", rB: "region word", farm2: "steading word" };
// A template that serves a city also serves a great city.
const withGreat = (codes) => (codes.includes("c") && !codes.includes("g") ? `${codes}g` : codes);
const parse = (s) => s.split("|").map((x) => x.trim()).filter(Boolean);
const listsOf = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, parse(v)]));

export function buildSettlement() {
  const cultures = [];
  const sizes = {};
  for (const [id, c] of Object.entries(CULTURES)) {
    const lists = listsOf(c.lists);
    lists.name = pick(id, "male", 28);
    lists.saint = saints(id);
    const eraTables = {};
    const eras = c.eras.map((e) => {
      eraTables[e.id] = Object.fromEntries(e.templates.map(([p, , s]) => [p, withGreat(s)]));
      return { id: e.id, label: e.label, templates: e.templates.map(([p, w]) => [p, w]) };
    });
    eras.push({ id: "interstellar", label: "Interstellar", guide: `${c.label} steadings and space words.`, lists: { farm2: parse(INTERSTELLAR_LIST_FARM2) }, templates: INTERSTELLAR_TEMPLATES.map(([p, w]) => [p, w]) });
    eraTables.interstellar = Object.fromEntries(INTERSTELLAR_TEMPLATES.map(([p, , s]) => [p, s]));
    let regions;
    if (c.regions) {
      regions = {};
      for (const [r, v] of Object.entries(c.regions)) {
        regions[r] = { templates: v.templates.map(([p, w]) => [p, w]), lists: listsOf(v.lists) };
        for (const [p, , s] of v.templates) for (const t of Object.values(eraTables)) if (!(p in t)) t[p] = withGreat(s);
      }
    }
    cultures.push({ id, homelandBiome: c.biome, label: c.label, guide: c.guide, fuseChance: c.fuse, lists, eras, ...(regions ? { regions } : {}) });
    // Every list the templates use, but the people lists and the plain adjectives, trees and animals, counts as the culture's own words, at every size.
    const own = Object.fromEntries(Object.entries(lists).filter(([k]) => !["name", "saint", "adj", "tree", "animal"].includes(k)).map(([k, v]) => [k, Object.fromEntries(v.map((w) => [w, "hvtcg"]))]));
    sizes[id] = { eras: eraTables, lists: own };
  }
  const norseRegions = {};
  const norseSizes = {};
  for (const [r, v] of Object.entries(NORSE_REGIONS)) {
    norseRegions[r] = { templates: v.templates.map(([p, w]) => [p, w]), lists: listsOf(v.lists) };
    for (const [p, , s] of v.templates) norseSizes[p] = withGreat(s);
  }
  // A label for every list key the batch adds that the world data has none for.
  const keys = new Set([...cultures.flatMap((c) => [...Object.keys(c.lists), ...c.eras.flatMap((e) => Object.keys(e.lists ?? {})), ...Object.values(c.regions ?? {}).flatMap((r) => Object.keys(r.lists))]), ...Object.values(norseRegions).flatMap((r) => Object.keys(r.lists))]);
  const newLabels = Object.fromEntries([...keys].filter((k) => !(k in labels)).map((k) => [k, LABELS[k] ?? `${k} word`]));
  return { cultures, sizes, norseRegions, norseSizes, labels: newLabels };
}
