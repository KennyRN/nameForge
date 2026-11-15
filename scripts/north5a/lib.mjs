// Northern Europe tables brief, batch 5a: the content notation and the expansion into the engines' tables.
//
// A word list is a string: items separated by "|"; an item is `Word` and flags after `;`: an era or span (AN, MD, EM-MO, ST-MO…),
// `h` (fantastic worlds only), a tone (grand, plain, grim, light, strange) and `xN` (weight N). A frame is
// [pattern, weight, family, flags?]; `{N}` is the module's own pool, `{B}`, `{C}` and `{D}` the group's shared pools.

export const ERAS = ["AN", "MD", "EM", "ST", "MO", "NF", "IS"];
const TONES = new Set(["grand", "plain", "grim", "light", "strange"]);

export function eraSpan(token) {
  const m = token.match(/^([A-Z]{2})-([A-Z]{2})$/);
  if (!m) return [token];
  return ERAS.slice(ERAS.indexOf(m[1]), ERAS.indexOf(m[2]) + 1);
}

export function parseItem(item, base = {}) {
  const [w, ...flags] = item.split(";").map((s) => s.trim());
  const e = { w, ...base };
  for (const f of flags) {
    if (f === "h") e.h = true;
    else if (TONES.has(f)) e.t = [...(e.t ?? []), f];
    else if (/^x[\d.]+$/.test(f)) e.x = Number(f.slice(1));
    else if (/^[A-Z]{2}(-[A-Z]{2})?$/.test(f)) e.e = [...new Set([...(e.e ?? []), ...eraSpan(f)])];
    else throw new Error(`unknown flag “${f}” in “${item}”`);
  }
  return e;
}

export const parseList = (text, base) => (text ? text.split("|").map((s) => s.trim()).filter(Boolean).map((i) => parseItem(i, base)) : []);

/** The module groups: each module's own pool and the kinds its signature shapes serve. */
export const LAND_MODULES = {
  mountainNames: { pool: "nMountain", terrain: "mountain", kinds: ["peak", "ridge", "range"], file: "wilds" },
  forestNames: { pool: "nWood", terrain: "wood", kinds: ["forest", "grove", "clearing"], file: "wilds" },
  moorNames: { pool: "nMoor", terrain: "moor", kinds: ["moor", "hill", "stone"], file: "wilds" },
  wetlandNames: { pool: "nWet", terrain: "wet", kinds: ["marsh", "bog", "isle"], file: "wilds" },
  grasslandNames: { pool: "nGrass", terrain: "grass", kinds: ["plain", "down", "vale"], file: "wilds" },
  lands: { pool: "nLands", terrain: "lands", kinds: ["country", "shire", "parish"], file: "wilds" },
  farmland: { pool: "nFarm", terrain: "farm", kinds: ["field", "farm", "enclosure"], file: "wilds" },
  hillsValleys: { pool: "nHill", terrain: "hill", kinds: ["hill", "valley", "ridge"], file: "wilds" },
  riversInland: { pool: "nRiver", terrain: "river", kinds: ["stream", "lake", "falls"], file: "wilds" },
};
export const WATER_MODULES = {
  seasLakes: { pool: "nSea", terrain: "sea", kinds: ["bay", "inlet", "strait"], file: "waters" },
  coastsIslands: { pool: "nCoast", terrain: "coast", kinds: ["headland", "cove", "island"], file: "waters" },
  seaCharts: { pool: "nChart", terrain: "chart", kinds: ["bank", "reef", "channel"], file: "waters" },
};
export const ROUTE_KINDS = ["road", "trade", "pilgrim", "military", "drove", "sea", "rail", "motor"];

/** The shared pools of a group, and the pools they sit in. */
export const SHARED = {
  land: { B: "nLandB", C: "nLandC", D: "nLandD" },
  water: { B: "nWaterB", C: "nWaterC", D: "nWaterD" },
  route: { N: "nRoute", B: "nRouteB", C: "nRouteC", D: "nRouteD" },
  sacred: { N: "nSacred", B: "nSacredB", C: "nSacredC", D: "nSacredD" },
};

/** All the pool names the batch adds, with the modules that read each (for docs/vocabulary-pools.md and the coverage readers). */
export function poolReaders() {
  const out = {};
  const wildReaders = ["wild lands", "lands and territories", "farmland and countryside", "hills and valleys", "rivers and inland waters"];
  for (const m of Object.values(LAND_MODULES)) out[m.pool] = m.file === "wilds" && m.pool === "nLands" ? "lands and territories" : null;
  return { out, wildReaders };
}

// ── Frame sets by naming style (§7) ──────────────────────────────────────────
const f = (p, w, fam) => [p, w, fam];
export const STYLE_FRAMES = {
  // The generic first: "Cairn of the Oak" (Welsh, Cornish, Irish).
  first: {
    land: [f("{N} of {person}", 4, "per"), f("{N} of the {tree}", 4, "flora"), f("{N} of the {beast}", 4, "crt"), f("{N} of {holy}", 3, "sai"), f("{B} {N}", 5, "work"), f("{wildColour} {N}", 4, "col"), f("{N} of {town}", 4, "twn"), f("{D} {N}", 4, "qual"), f("{C} {N}", 3, "myth"), f("{N} of the {wildQuality} {tree}", 2, "flora"), f("{town} {N}", 5, "twn"), f("{N} of the {B}", 3, "work")],
    water: [f("{N} of {person}", 4, "per"), f("{N} of the {seaCreature}", 4, "crt"), f("{B} {N}", 5, "work"), f("{N} of {town}", 4, "twn"), f("{D} {N}", 4, "qual"), f("{C} {N}", 3, "myth"), f("{seaColour} {N}", 4, "col"), f("{N} of {holy}", 3, "sai"), f("{town} {N}", 5, "twn"), f("{N} of the {number} {seaCreature:pl}", 2, "crt")],
    route: [["road", "{B} {N}", 5], ["road", "{N} of {destination}", 5], ["road", "{D}", 3], ["trade", "{B} Road", 5], ["trade", "{N} of the {goods} Trade", 3], ["pilgrim", "Pilgrims' {N} to {holy}", 4], ["pilgrim", "{holy:poss} {N}", 4], ["military", "{N} of the {folk}", 3], ["drove", "Drovers' {N}", 5], ["drove", "{B} {N}", 4], ["road", "{C} {N}", 3], ["trade", "{D} Trade Route", 2]],
    sacred: [["{N} of {deityRef}", 4], ["{B} {N}", 5], ["{N} of the {number}", 3], ["{C} {N}", 3], ["{place:poss} {N}", 4], ["{holy:poss} {N}", 4], ["{D} of {place}", 3], ["the {sacredQuality} {N}", 3], ["{N} of the {B}", 3], ["{D} of {deityRef}", 3]],
  },
  // The generic last: "Oak Crag" (English, Scottish, Scandinavian, German).
  last: {
    land: [f("{person:poss} {N}", 4, "per"), f("{tree} {N}", 4, "flora"), f("{beast} {N}", 4, "crt"), f("{holy:poss} {N}", 3, "sai"), f("{B} {N}", 5, "work"), f("{wildColour} {N}", 4, "col"), f("{town} {N}", 5, "twn"), f("{D} {N}", 4, "qual"), f("{C} {N}", 3, "myth"), f("{wildQuality} {tree} {N}", 2, "flora"), f("{N} of {town}", 3, "twn"), f("Old {B} {N}", 3, "work")],
    water: [f("{person:poss} {N}", 4, "per"), f("{seaCreature} {N}", 4, "crt"), f("{B} {N}", 5, "work"), f("{town} {N}", 5, "twn"), f("{D} {N}", 4, "qual"), f("{C} {N}", 3, "myth"), f("{seaColour} {N}", 4, "col"), f("{holy:poss} {N}", 3, "sai"), f("{N} of {town}", 3, "twn"), f("Old {B} {N}", 3, "work")],
    route: [["road", "{B} {N}", 5], ["road", "{town} {N}", 5], ["road", "{D}", 3], ["trade", "{B} Road", 5], ["trade", "{goods} {N}", 3], ["pilgrim", "{holy:poss} {N}", 4], ["pilgrim", "Pilgrims' {N} to {holy}", 4], ["military", "{folk} {N}", 3], ["drove", "{B} Drove", 5], ["drove", "Drovers' {N}", 4], ["road", "{C} {N}", 3], ["trade", "{D} Trade Route", 2]],
    sacred: [["{deityRef} {N}", 3], ["{B} {N}", 5], ["{N} of the {number}", 3], ["{C} {N}", 3], ["{place:poss} {N}", 4], ["{holy:poss} {N}", 4], ["{D} of {place}", 3], ["the {sacredQuality} {N}", 3], ["{N} of the {B}", 3], ["{D} of {deityRef}", 3]],
  },
};
/** Frames of a culture: its style's, with its own extras (and replacements by index) added. */
export function framesOf(style, extra = {}) {
  const base = STYLE_FRAMES[style];
  return { land: [...base.land, ...(extra.land ?? [])], water: [...base.water, ...(extra.water ?? [])], route: [...base.route, ...(extra.route ?? [])], sacred: [...base.sacred, ...(extra.sacred ?? [])] };
}
