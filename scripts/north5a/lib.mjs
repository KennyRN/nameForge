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

/** The module groups: each module's own pools (one per main kind, §11.2), the kinds they serve, and the words its own frames use. */
const tri = (p, ks) => ks.map((k) => `${p}${k[0].toUpperCase()}${k.slice(1)}`);
const land = (pool, terrain, kinds, adj, rel) => ({ pool, pools: tri(pool, kinds), terrain, kinds, adj, rel, file: "wilds", creature: "{beast}", tree: "{tree}", colour: "{wildColour}" });
const sea = (pool, terrain, kinds, adj, rel) => ({ pool, pools: tri(pool, kinds), terrain, kinds, adj, rel, file: "waters", creature: "{seaCreature}", tree: "{seaCreature}", colour: "{seaColour}" });
export const LAND_MODULES = {
  mountainNames: land("nMountain", "mountain", ["peak", "ridge", "range"], ["Lonely", "Great", "Bleak"], ["above", "over"]),
  forestNames: land("nWood", "wood", ["forest", "grove", "clearing"], ["Old", "Deep", "Dark"], ["beside", "behind"]),
  moorNames: land("nMoor", "moor", ["moor", "hill", "stone"], ["Wide", "Lonely", "Bleak"], ["above", "beyond"]),
  wetlandNames: land("nWet", "wet", ["marsh", "bog", "isle"], ["Reedy", "Black", "Low"], ["beside", "below"]),
  grasslandNames: land("nGrass", "grass", ["plain", "down", "vale"], ["Broad", "Open", "Sunlit"], ["beside", "beyond"]),
  lands: land("nLands", "lands", ["country", "shire", "parish"], ["Upper", "Lower", "Greater"], ["beyond", "within"]),
  farmland: land("nFarm", "farm", ["field", "farm", "enclosure"], ["Upper", "Lower", "Little"], ["beside", "below"]),
  hillsValleys: land("nHill", "hill", ["hill", "valley", "ridge"], ["Bare", "Low", "Wooded"], ["above", "beside"]),
  riversInland: land("nRiver", "river", ["stream", "lake", "falls"], ["Clear", "Swift", "Deep"], ["below", "above"]),
  // §6: deserts are exempt for every core culture except Norse and Scandinavian (lava fields and black sands): 12 words and 4 shapes, for those two only.
  desertNames: land("nDesert", "desert", ["desert", "dune", "rock"], ["Barren", "Stony", "Bleak"], ["above", "beyond"]),
};
export const WATER_MODULES = {
  seasLakes: sea("nSea", "sea", ["bay", "inlet", "strait"], ["Deep", "Wide", "Grey"], ["off", "beyond"]),
  coastsIslands: sea("nCoast", "coast", ["headland", "cove", "island"], ["Rocky", "Bold", "Low"], ["off", "beside"]),
  seaCharts: sea("nChart", "chart", ["bank", "reef", "channel"], ["Outer", "Foul", "Hard"], ["off", "beyond"]),
};
/** Route names and sacred places: three lists by kind (routes) and by site (sacred places, which have one kind). */
export const ROUTE_MODULE = { pools: ["nRouteRoad", "nRouteTrade", "nRoutePilgrim"], kinds: ["road", "trade", "pilgrim"], adj: ["Old", "High", "Long"] };
export const SACRED_MODULE = { pools: ["nSacredWater", "nSacredStone", "nSacredBuilt"], adj: ["Ancient", "Hidden", "Lonely"], rel: ["above", "beside"] };
export const ROUTE_KINDS = ["road", "trade", "pilgrim", "military", "drove", "sea", "rail", "motor"];

/** The shared pools of a group, and the pools they sit in. */
export const SHARED = {
  land: { B: "nLandB", C: "nLandC", D: "nLandD", Dold: "nLandDOld" },
  water: { B: "nWaterB", C: "nWaterC", D: "nWaterD", Dold: "nWaterDOld" },
  route: { B: "nRouteB", C: "nRouteC", D: "nRouteD", Dold: "nRouteDOld" },
  sacred: { B: "nSacredB", C: "nSacredC", D: "nSacredD", Dold: "nSacredDOld" },
};

// ── Frame sets by naming style (§7) ──────────────────────────────────────────
const f = (p, w, fam) => [p, w, fam];
export const STYLE_FRAMES = {
  // The generic first: "Cairn of the Oak" (Welsh, Cornish, Irish).
  first: {
    land: [f("{N} of {person}", 4, "per"), f("{N} of the {tree}", 4, "flora"), f("{N} of the {beast}", 4, "crt"), f("{N} of {holy}", 3, "sai"), f("{B} {N}", 5, "work"), f("{wildColour} {N}", 4, "col"), f("{N} of {town}", 4, "twn"), f("{C} {N}", 3, "myth"), f("{N} of the {wildQuality} {tree}", 2, "flora"), f("{town} {N}", 5, "twn"), f("{N} of the {B}", 3, "work")],
    water: [f("{N} of {person}", 4, "per"), f("{N} of the {seaCreature}", 4, "crt"), f("{B} {N}", 5, "work"), f("{N} of {town}", 4, "twn"), f("{C} {N}", 3, "myth"), f("{seaColour} {N}", 4, "col"), f("{N} of {holy}", 3, "sai"), f("{town} {N}", 5, "twn"), f("{N} of the {number} {seaCreature:pl}", 2, "crt")],
    route: [["road", "{B} {N}", 5], ["road", "{N} of {destination}", 5], ["road", "{D}", 3], ["trade", "{B} Road", 5], ["trade", "{N} of the {goods} Trade", 3], ["pilgrim", "Pilgrims' {N} to {holy}", 4], ["pilgrim", "{holy:poss} {N}", 4], ["military", "{N} of the {folk}", 3], ["drove", "Drovers' {N}", 5], ["drove", "{B} {N}", 4], ["road", "{C} {N}", 3], ["trade", "{D} Trade Route", 2]],
    sacred: [["{N} of {deityRef}", 4], ["{B} {N}", 5], ["{N} of the {number}", 3], ["{C} {N}", 3], ["{place:poss} {N}", 4], ["{holy:poss} {N}", 4], ["{D} of {place}", 3], ["the {sacredQuality} {N}", 3], ["{N} of the {B}", 3], ["{D} of {deityRef}", 3]],
  },
  // The generic last: "Oak Crag" (English, Scottish, Scandinavian, German).
  last: {
    land: [f("{person:poss} {N}", 4, "per"), f("{tree} {N}", 4, "flora"), f("{beast} {N}", 4, "crt"), f("{holy:poss} {N}", 3, "sai"), f("{B} {N}", 5, "work"), f("{wildColour} {N}", 4, "col"), f("{town} {N}", 5, "twn"), f("{C} {N}", 3, "myth"), f("{wildQuality} {tree} {N}", 2, "flora"), f("{N} of {town}", 3, "twn"), f("Old {B} {N}", 3, "work")],
    water: [f("{person:poss} {N}", 4, "per"), f("{seaCreature} {N}", 4, "crt"), f("{B} {N}", 5, "work"), f("{town} {N}", 5, "twn"), f("{C} {N}", 3, "myth"), f("{seaColour} {N}", 4, "col"), f("{holy:poss} {N}", 3, "sai"), f("{N} of {town}", 3, "twn"), f("Old {B} {N}", 3, "work")],
    route: [["road", "{B} {N}", 5], ["road", "{town} {N}", 5], ["road", "{D}", 3], ["trade", "{B} Road", 5], ["trade", "{goods} {N}", 3], ["pilgrim", "{holy:poss} {N}", 4], ["pilgrim", "Pilgrims' {N} to {holy}", 4], ["military", "{folk} {N}", 3], ["drove", "{B} Drove", 5], ["drove", "Drovers' {N}", 4], ["road", "{C} {N}", 3], ["trade", "{D} Trade Route", 2]],
    sacred: [["{deityRef} {N}", 3], ["{B} {N}", 5], ["{N} of the {number}", 3], ["{C} {N}", 3], ["{place:poss} {N}", 4], ["{holy:poss} {N}", 4], ["{D} of {place}", 3], ["the {sacredQuality} {N}", 3], ["{N} of the {B}", 3], ["{D} of {deityRef}", 3]],
  },
};
// Sibling-distinctness brief: two more styles for the nations that would otherwise name exactly as another does. `firstB` takes the generic-first frames at the even places and the generic-last at the odd;
// `lastB` the other way about. Irish is `firstB` and Cornish `lastB`, so that Welsh (`first`), Scottish (`last`), Irish and Cornish share no frame at any place.
const mixed = (a, b, startA) => a.map((x, i) => ((i % 2 === 0) === startA ? x : b[i] ?? x));
export const pickStyle = (style, first, last) => (style === "first" ? first : style === "last" ? last : style === "firstB" ? mixed(first, last, true) : mixed(last, first, true));
for (const [name, a, b] of [["firstB", "first", "last"], ["lastB", "last", "first"]]) {
  STYLE_FRAMES[name] = Object.fromEntries(Object.keys(STYLE_FRAMES.first).map((k) => [k, mixed(STYLE_FRAMES[a][k], STYLE_FRAMES[b][k], true)]));
}
const LATE = { e: ["ST", "MO", "NF", "IS"] };
/** §11.4: era words read on their own terms; the older ones get "Old" from the steam age on. */
const ERA_FRAMES = {
  land: [f("{town} {D}", 4, "twn"), f("{D} of {person}", 3, "per"), ["Old {Dold}", 3, "qual", LATE]],
  water: [f("{town} {D}", 4, "twn"), f("{D} of {person}", 3, "per"), ["Old {Dold}", 3, "qual", LATE]],
  route: [["road", "Old {Dold}", 3, LATE]],
  sacred: [["Old {Dold}", 3, LATE]],
};
/** The group frames of a culture (§11.1: read by every module of the group, not counted towards the cells): its style's, its extras and the era frames. */
export function framesOf(style, extra = {}) {
  const base = STYLE_FRAMES[style];
  return { land: [...base.land, ...ERA_FRAMES.land, ...(extra.land ?? [])], water: [...base.water, ...ERA_FRAMES.water, ...(extra.water ?? [])], route: [...base.route, ...ERA_FRAMES.route, ...(extra.route ?? [])], sacred: [...base.sacred, ...ERA_FRAMES.sacred, ...(extra.sacred ?? [])] };
}

/**
 * §11.2: a module's own frames, ten per culture, written for it. `{N}` is the pool of the frame's kind (0, 1 or 2 of the module's three);
 * `A0`…`A2` are the module's adjectives and `R0`, `R1` its relations ("Crag above Ashby", "Cove off Ashby").
 * Each is [kindIndex, pattern, weight, family]; the culture's style decides the order.
 */
export function ownFrames(style, m) {
  const sub = (p) => p.replace(/\{A(\d)\}/g, (_x, i) => m.adj[+i]).replace(/\{R(\d)\}/g, (_x, i) => m.rel[+i]).replace("{creature}", m.creature).replace("{tree}", m.tree).replace("{colour}", m.colour);
  const last = [
    [0, "{A0} {N}", 4, "qual"], [1, "{A1} {N}", 3, "qual"], [2, "{A2} {N}", 3, "qual"], [0, "{N} {R0} {town}", 4, "twn"], [1, "{creature} {N}", 4, "crt"],
    [2, "{person:poss} {N}", 3, "per"], [0, "{colour} {N}", 3, "col"], [1, "{town} {N}", 4, "twn"], [2, "{N} {R1} {town}", 2, "twn"], [1, "{A0} {colour} {N}", 2, "col"],
  ];
  const first = [
    [0, "{N} of {person}", 4, "per"], [1, "{N} of the {tree}", 4, "flora"], [2, "{N} of the {creature}", 4, "crt"], [0, "{N} {R0} {town}", 4, "twn"], [1, "{N} of {town}", 4, "twn"],
    [2, "{N} of the {A0} {tree}", 3, "flora"], [0, "{N} of the {A1} {creature}", 3, "crt"], [1, "{N} of {holy}", 3, "sai"], [2, "{N} {R1} {town}", 3, "twn"], [1, "{colour} {N}", 2, "col"],
  ];
  return pickStyle(style, first, last).map(([k, p, w, fam]) => [k, sub(p), w, fam]);
}
/** Route names: ten frames, by kind. */
export function ownRouteFrames(style, m) {
  const last = [
    ["road", "{A0} {N}", 4], ["road", "{town} {N}", 4], ["road", "{N} from {town}", 3], ["road", "{person:poss} {N}", 3],
    ["trade", "{A1} {N}", 3], ["trade", "{goods} {N}", 5], ["trade", "{folk} {N}", 3],
    ["pilgrim", "{holy:poss} {N}", 4], ["pilgrim", "{A2} {N}", 3], ["pilgrim", "{N} to {holy}", 3],
  ];
  const first = [
    ["road", "{N} to {destination}", 5], ["road", "{N} from {town}", 3], ["road", "{N} of {person}", 3], ["road", "{A0} {N}", 3],
    ["trade", "{N} of the {goods} Trade", 3], ["trade", "{goods} {N}", 4], ["trade", "{N} of the {folk}", 3],
    ["pilgrim", "{N} to {holy}", 4], ["pilgrim", "{holy:poss} {N}", 4], ["pilgrim", "{A2} {N}", 2],
  ];
  const kinds = m.kinds;
  return pickStyle(style, first, last).map(([k, p, w]) => [kinds.indexOf(k), p.replace(/\{A(\d)\}/g, (_x, i) => m.adj[+i]), w]);
}
/** Sacred places: ten frames; `{N}` is the pool of the frame's site (water, stone, built). The deities engine's tokens: `{place}`, `{holy}`, `{deityRef}`, `{number}`, `{sacredQuality}`. */
export function ownSacredFrames(style, m) {
  const sub = (p) => p.replace(/\{A(\d)\}/g, (_x, i) => m.adj[+i]).replace(/\{R(\d)\}/g, (_x, i) => m.rel[+i]);
  const last = [
    [0, "{A0} {N}", 4], [0, "{holy:poss} {N}", 4], [1, "{place:poss} {N}", 4], [1, "{N} {R0} {place}", 3], [2, "{A1} {N}", 3],
    [2, "{deityRef} {N}", 3], [0, "{N} {R1} {place}", 3], [1, "{A2} {N}", 3], [2, "{sacredQuality} {N}", 2], [0, "{place} {N}", 3],
  ];
  const first = [
    [0, "{N} of {holy}", 4], [1, "{N} of {place}", 4], [2, "{N} of the {number}", 3], [0, "{N} {R0} {place}", 3], [1, "{N} of {deityRef}", 4],
    [2, "{N} {R1} {place}", 3], [0, "{A0} {N}", 3], [1, "the {sacredQuality} {N}", 3], [2, "{A1} {N}", 3], [0, "{place:poss} {N}", 3],
  ];
  return pickStyle(style, first, last).map(([k, p, w]) => [k, sub(p), w]);
}
