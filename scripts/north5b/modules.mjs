// Batch 5b (B2): expands the authored content (content-a.mjs, content-b.mjs, regions.mjs) into vocabulary pools and culture shapes
// for streets and districts, inns and taverns, buildings and landmarks and monuments and statues.
import { ENGLISH, WELSH, SCOTTISH, IRISH, CORNISH } from "./content-a.mjs";
import { NORSE, SCANDINAVIAN, GERMAN, CELTIC } from "./content-b.mjs";
import { REGIONS } from "./regions.mjs";

export const CULTURES = [
  { key: "english", keys: ["anglo-saxon", "norman-british"], label: "English", c: ENGLISH },
  { key: "welsh", keys: ["welsh"], label: "Welsh", c: WELSH },
  { key: "scottish", keys: ["scottish"], label: "Scottish", c: SCOTTISH },
  { key: "irish", keys: ["irish"], label: "Irish", c: IRISH },
  { key: "cornish", keys: ["cornish"], label: "Cornish", c: CORNISH },
  { key: "norse", keys: ["norse"], label: "Norse", c: NORSE },
  { key: "scandinavian", keys: ["scandinavian"], label: "Scandinavian", c: SCANDINAVIAN },
  { key: "german", keys: ["german"], label: "German", c: GERMAN },
  { key: "celtic", keys: ["celtic"], label: "Celtic", c: CELTIC },
];

/** The modules: pools (one per main kind, then the region pool), kinds, and the tokens their own frames use. */
export const MODULES = {
  streetNames: { id: "streets", pools: ["nbStreetStreet", "nbStreetSquare", "nbStreetDistrict"], region: "nbStreetRegion", kinds: ["streets", "squares", "districts"], person: "founder", label: "streets and districts" },
  innNames: { id: "inns", pools: ["nbInnInn", "nbInnTavern", "nbInnWayhouse"], region: "nbInnRegion", kinds: ["inn", "tavern", "wayhouse"], person: "owner", label: "inns and taverns" },
  buildingNames: { id: "buildings", pools: ["nbBuildDefence", "nbBuildFaith", "nbBuildCivic"], region: "nbBuildRegion", kinds: ["defence", "faith", "civic"], person: "owner", label: "buildings and landmarks" },
  monumentNames: { id: "monuments", pools: ["nbMonStone", "nbMonCross", "nbMonMemorial"], region: "nbMonRegion", kinds: ["stone", "cross", "memorial"], person: "owner", label: "monuments and statues" },
};

const ERA_BY_INDEX = (i, n) => {
  if (n <= 8) return i < 3 ? ["AN", "MD"] : i < 5 ? ["EM", "ST"] : i < 6 ? ["ST", "MO"] : i < 7 ? "h" : undefined;
  return i < 3 ? ["AN", "MD"] : i < 6 ? ["EM", "ST"] : i < 8 ? ["ST", "MO"] : i === 8 ? "h" : undefined;
};

const words = (text, base) => {
  const list = text.split("|").map((s) => s.trim()).filter(Boolean);
  return list.map((w, i) => {
    const e = { w, ...base };
    const tag = base.noEra ? undefined : ERA_BY_INDEX(i, list.length);
    delete e.noEra;
    if (tag === "h") e.h = true;
    else if (tag) e.e = tag.length === 2 && tag[0] === "AN" ? ["AN", "MD"] : tag[0] === "EM" ? ["EM", "ST"] : ["ST", "MO"];
    return e;
  });
};

/** Two-letter era spans for the nouns: AN-MD, EM-ST, ST-MO. */
const fixEras = (e) => e;

const ADJ_TOKENS = ["{A0}", "{A1}", "{A2}"];
const sub = (p, c, mod) => p.replace(/\{N([012])\}/g, (_m, i) => `{${mod.pools[+i]}}`).replace(/\{A([012])\}/g, (_m, i) => c.adj[+i]);

/** The ten plain frames of a module per naming style: [pattern, weight, kind index]. */
const FRAMES = {
  streets: {
    last: [["{founder:poss} {N0}", 14, 0], ["{destination} {N0}", 12, 0], ["{trade:poss} {N0}", 10, 0], ["{A0} {N0}", 8, 0], ["{founder:poss} {N1}", 12, 1], ["{A1} {N1}", 8, 1], ["{destination} {N1}", 10, 1], ["{destination} {N2}", 12, 2], ["{A2} {N2}", 8, 2], ["{trade:poss} {N2}", 8, 2]],
    first: [["{N0} of {founder}", 14, 0], ["{N0} to {destination}", 12, 0], ["{N0} of the {trade}", 10, 0], ["{A0} {N0}", 8, 0], ["{N1} of {founder}", 12, 1], ["{A1} {N1}", 8, 1], ["{N1} of {destination}", 10, 1], ["{N2} of {destination}", 12, 2], ["{A2} {N2}", 8, 2], ["{N2} of the {trade}", 8, 2]],
  },
  inns: {
    last: [["{owner:poss} {N0}", 18, 0], ["the {creature} {N0}", 16, 0], ["{town} {N0}", 12, 0], ["the {A0} {N0}", 8, 0], ["{owner:poss} {N1}", 14, 1], ["{colour} {N1}", 12, 1], ["{trade:poss} {N1}", 10, 1], ["{creature} {N2}", 14, 2], ["{town} {N2}", 12, 2], ["the {A2} {N2}", 8, 2]],
    first: [["{N0} of {owner}", 18, 0], ["{N0} of the {creature}", 16, 0], ["{N0} of {town}", 12, 0], ["the {A0} {N0}", 8, 0], ["{N1} of {owner}", 14, 1], ["{colour} {N1}", 12, 1], ["{N1} of the {trade}", 10, 1], ["{N2} of the {creature}", 14, 2], ["{N2} of {town}", 12, 2], ["the {A2} {N2}", 8, 2]],
  },
  buildings: {
    last: [["{owner:poss} {N0}", 16, 0], ["{town} {N0}", 14, 0], ["{creature} {N0}", 12, 0], ["{A0} {N0}", 8, 0], ["{N1} of {town}", 14, 1], ["{owner:poss} {N1}", 12, 1], ["{A1} {N1}", 8, 1], ["{town} {N2}", 16, 2], ["{owner:poss} {N2}", 12, 2], ["{A2} {N2}", 8, 2]],
    first: [["{N0} of {owner}", 16, 0], ["{N0} of {town}", 14, 0], ["{N0} of the {creature}", 12, 0], ["{A0} {N0}", 8, 0], ["{N1} of {town}", 14, 1], ["{N1} of {owner}", 12, 1], ["{A1} {N1}", 8, 1], ["{N2} of {town}", 16, 2], ["{N2} of {owner}", 12, 2], ["{A2} {N2}", 8, 2]],
  },
  monuments: {
    last: [["{owner:poss} {N0}", 16, 0], ["{N0} of {town}", 14, 0], ["{creature} {N0}", 10, 0], ["{A0} {N0}", 8, 0], ["{town} {N1}", 16, 1], ["{owner:poss} {N1}", 12, 1], ["{A1} {N1}", 8, 1], ["{N2} of {town}", 14, 2], ["{owner:poss} {N2}", 12, 2], ["{A2} {N2}", 8, 2]],
    first: [["{N0} of {owner}", 16, 0], ["{N0} of {town}", 14, 0], ["{N0} of the {creature}", 10, 0], ["{A0} {N0}", 8, 0], ["{N1} of {town}", 16, 1], ["{N1} of {owner}", 12, 1], ["{A1} {N1}", 8, 1], ["{N2} of {town}", 14, 2], ["{N2} of {owner}", 12, 2], ["{A2} {N2}", 8, 2]],
  },
};
const REGION_FRAMES = (person, place) => [["{R}", 8], [`{${place}} {R}`, 6], [`{${person}:poss} {R}`, 5]];

/** Builds the batch's tables. */
export function buildModules() {
  const out = { vocab: { pools: {} }, streets: { cultureStreets: [], cultureSquares: [], cultureDistricts: [] }, inns: { cultureShapes: {} }, buildings: { cultureShapes: {} }, monuments: { cultureShapes: {} } };
  const add = (pool, entries) => ((out.vocab.pools[pool] ??= { entries: [] }).entries.push(...entries));
  const listing = [];
  for (const [module, m] of Object.entries(MODULES)) {
    for (const c of CULTURES) {
      const base = { c: c.keys };
      const lists = c.c[m.id];
      lists.forEach((text, i) => add(m.pools[i], words(text, base)));
      listing.push({ module, culture: c.label, lists, x: c.c.x?.[m.id] ?? [] });
      const style = c.c.style;
      const frames = [...FRAMES[m.id][style]];
      const own = c.key === "celtic" ? frames.slice(0, 4) : frames;
      const extras = c.key === "celtic" ? [] : (c.c.x?.[m.id] ?? []);
      const shapes = [...own, ...extras].map(([p, w, k]) => ({ p: sub(p, c.c, m), w, kind: m.kinds[k], sig: true }));
      const regional = c.key === "celtic" ? [] : REGION_FRAMES(m.person, m.id === "streets" ? "destination" : "town").map(([p, w], i) => ({ p: p.replace("{R}", `{${m.region}}`), w, kind: m.kinds[i], sig: true, rg: true }));
      const mark = { ...(c.keys.length === 1 ? { culture: c.keys[0] } : { c: c.keys }) };
      const all = [...shapes, ...regional];
      if (m.id === "streets") {
        for (const s of all) {
          const { kind, ...rest } = s;
          if (kind === "streets") out.streets.cultureStreets.push({ ...rest, ...mark });
          else if (kind === "squares") out.streets.cultureSquares.push({ ...rest, ...mark });
          else out.streets.cultureDistricts.push({ ...rest, ...mark, fn: "any" });
        }
      } else {
        for (const key of c.keys) {
          const entry = m.id === "inns" ? (s) => ({ ...s, kinds: [s.kind] }) : (s) => s;
          (out[m.id].cultureShapes[key] ??= []).push(...all.map((s) => { const e = entry(s); if (m.id === "inns") delete e.kind; return e; }));
        }
      }
    }
    // Region words.
    const regionEntries = [];
    for (const [code, r] of Object.entries(REGIONS)) regionEntries.push(...r[m.id].split("|").map((w) => ({ w, c: r.cultures, r: [code] })));
    add(m.region, regionEntries);
  }
  return { out, listing };
}
