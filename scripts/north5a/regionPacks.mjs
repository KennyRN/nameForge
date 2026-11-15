// Northern Europe brief 5b Part A (§12.2): region depth. Every region has at least six entries of its own in each land and water module whose
// landscape it has: two region words per module, each with three frames written for the module. The words are plain English (standard
// dictionary entries; regional dialect words such as tor, combe, carse and brae are listed in dictionaries). A word is a region tag, weighted 3
// for its region and 0 elsewhere, and drawn only for the cultures that read the region.

const E = ["anglo-saxon", "norman-british"];
const N = ["norse", "scandinavian"];
const G = ["german"];
const S = ["scottish"];

/** The six frame forms of a group: [pattern, family, kind index]. `{W}` is the region word. */
const FORMS = [["{beast} {W}", "crt", 0], ["{town} {W}", "twn", 1], ["{wildColour} {W}", "col", 2], ["{W} of {person}", "per", 0], ["{person:poss} {W}", "per", 1], ["{W} of {town}", "twn", 2]];
const WATER_FORMS = [["{seaCreature} {W}", "crt", 0], ["{town} {W}", "twn", 1], ["{seaColour} {W}", "col", 2], ["{W} of {person}", "per", 0], ["{person:poss} {W}", "per", 1], ["{W} of {town}", "twn", 2]];
const frames = (kinds, water = false) => (water ? WATER_FORMS : FORMS).map(([p, f, k]) => [kinds[k], p, f]);

/** Group letter → module, whether it is a water module, and its six frames [kind, pattern, family]. */
export const GROUPS = {
  M: { module: "mountainNames", g: "wilds", frames: frames(["peak", "ridge", "range"]) },
  F: { module: "forestNames", g: "wilds", frames: frames(["forest", "grove", "clearing"]) },
  O: { module: "moorNames", g: "wilds", frames: frames(["moor", "hill", "bog"]) },
  W: { module: "wetlandNames", g: "wilds", frames: frames(["marsh", "bog", "water"]) },
  G: { module: "grasslandNames", g: "wilds", frames: frames(["meadow", "down", "heath"]) },
  L: { module: "lands", g: "wilds", frames: [["country", "{W} Country", "qual"], ["parish", "{town} {W}", "twn"], ["shire", "{wildColour} {W} Shire", "col"], ["province", "{W} Province", "qual"], ["parish", "{W} of {town}", "twn"], ["shire", "{town} {W} Shire", "twn"]] },
  A: { module: "farmland", g: "wilds", frames: frames(["field", "farm", "enclosure"]) },
  H: { module: "hillsValleys", g: "wilds", frames: frames(["hill", "valley", "ridge"]) },
  R: { module: "riversInland", g: "wilds", frames: frames(["stream", "spring", "pool"]) },
  S: { module: "seasLakes", g: "waters", frames: frames(["bay", "inlet", "strait"], true) },
  C: { module: "coastsIslands", g: "waters", frames: frames(["headland", "cove", "island"], true) },
  K: { module: "seaCharts", g: "waters", frames: frames(["bank", "channel", "roads"], true) },
};

/** Region → the cultures that read it, then group letter → the region's words for that module. */
export const PACKS = {
  SEA: { for: E, A: ["Orchard", "Hopfield", "Warren", "Sheepfold"], H: ["Combe", "Hanger", "Dene", "Down"], L: ["Weald", "Downland", "Levels", "Chalkland"], M: ["Beacon", "Downs", "Scarp", "Ridgeway"], R: ["Bourne", "Winterbourne", "Brook", "Weir"], S: ["Haven", "Reach", "Estuary", "Harbour"] },
  WCY: { for: E, A: ["Orchard", "Dairy", "Smallholding", "Warren"], H: ["Combe", "Tor", "Hollow", "Hanger"], K: ["Race", "Roads", "Ledge", "Bank"], L: ["Moorland", "Vale", "Downland", "Peninsula"], R: ["Leat", "Rill", "Brook", "Weir"], S: ["Estuary", "Haven", "Creek", "Roads"] },
  EAN: { for: E, A: ["Warren", "Grange", "Sheepwalk", "Orchard"], H: ["Knoll", "Rise", "Barrow", "Mound"], L: ["Fenland", "Breckland", "Marshland", "Broads"], S: ["Wash", "Broad", "Haven", "Estuary"] },
  WMM: { for: E, A: ["Hopyard", "Pasture", "Orchard", "Dairy"], H: ["Edge", "Dingle", "Hollow", "Bank"], L: ["Marches", "Vale", "Heartland", "Border"], M: ["Beacon", "Crag", "Edge", "Knoll"] },
  EMD: { for: E, A: ["Grange", "Dairy", "Pasture", "Warren"], H: ["Wold", "Edge", "Dale", "Bank"], L: ["Wolds", "Heartland", "Vale", "Plain"] },
  NTH: { for: E, A: ["Sheepwalk", "Dairy", "Grange", "Pasture"], K: ["Race", "Bank", "Roads", "Skerry"], L: ["Riding", "Moorland", "Dales", "Fellside"] },
  WAL: { for: ["welsh"], A: ["Sheepwalk", "Smallholding", "Dairy", "Pasture"], F: ["Oakwood", "Hazelwood", "Ashwood", "Birchwood"], G: ["Pasture", "Upland", "Meadow", "Hillside"], H: ["Combe", "Dingle", "Hollow", "Cleft"], K: ["Race", "Roads", "Bar", "Bank"], L: ["Upland", "Valley", "Highland", "Moorland"], M: ["Crag", "Cairn", "Tor", "Peak"], R: ["Torrent", "Cascade", "Brook", "Rill"], S: ["Estuary", "Sound", "Haven", "Creek"] },
  COR: { for: ["cornish"], A: ["Smallholding", "Orchard", "Croft", "Warren"], F: ["Oakwood", "Hazelwood", "Thicket", "Ashwood"], G: ["Pasture", "Downland", "Meadow", "Clifftop"], H: ["Combe", "Tor", "Hollow", "Hanger"], K: ["Ledge", "Roads", "Race", "Bank"], L: ["Moorland", "Peninsula", "Downland", "Heathland"], R: ["Leat", "Rill", "Estuary", "Brook"], S: ["Creek", "Estuary", "Haven", "Sound"], W: ["Mire", "Bog", "Marsh", "Moss"] },
  SBL: { for: [...E, ...S], A: ["Hirsel", "Sheepwalk", "Grange", "Croft"], F: ["Chase", "Plantation", "Wood", "Forest"], G: ["Haugh", "Pasture", "Common", "Meadow"], K: ["Bank", "Race", "Roads", "Skerry"], L: ["Marches", "Barony", "Border", "Lowland"], R: ["Linn", "Cleugh", "Burn", "Water"], W: ["Moss", "Flow", "Mire", "Bog"] },
  SLO: { for: S, A: ["Grange", "Steading", "Croft", "Dairy"], F: ["Plantation", "Forest", "Wood", "Chase"], H: ["Brae", "Law", "Knowe", "Rig"], K: ["Bank", "Roads", "Race", "Firth"], L: ["Carse", "Lowland", "Barony", "Strath"], R: ["Linn", "Burn", "Water", "Cleugh"], W: ["Moss", "Flow", "Mire", "Carse"] },
  SHH: { for: S, A: ["Shieling", "Croft", "Sheepwalk", "Steading"], F: ["Pinewood", "Birchwood", "Forest", "Chase"], G: ["Machair", "Upland", "Pasture", "Shieling"], H: ["Corrie", "Brae", "Knowe", "Law"], K: ["Skerry", "Race", "Bank", "Roads"], L: ["Strath", "Clanland", "Moorland", "Highland"], R: ["Torrent", "Linn", "Burn", "Cleugh"], W: ["Moss", "Flow", "Bog", "Mire"] },
  NSI: { for: S, A: ["Croft", "Steading", "Sheepwalk", "Dairy"], G: ["Machair", "Links", "Pasture", "Meadow"], H: ["Knowe", "Brae", "Law", "Rig"], L: ["Isle", "Mainland", "Skerry", "Holm"], R: ["Voe", "Burn", "Loch", "Water"], W: ["Moss", "Flow", "Mire", "Bog"] },
  DEN: { for: N, A: ["Meadow", "Grange", "Pasture", "Orchard"], H: ["Barrow", "Knoll", "Rise", "Mound"], K: ["Sound", "Roads", "Bank", "Skerry"], L: ["Isle", "Lowland", "Meadow", "Heathland"] },
  NOR: { for: N, A: ["Shieling", "Steading", "Pasture", "Meadow"], F: ["Pinewood", "Birchwood", "Firwood", "Forest"], G: ["Shieling", "Upland", "Pasture", "Meadow"], H: ["Fell", "Knoll", "Rise", "Crest"], K: ["Skerry", "Sound", "Bank", "Roads"], L: ["Fjordland", "Highland", "Fell", "Valley"] },
  SWE: { for: N, A: ["Meadow", "Smallholding", "Pasture", "Grange"], H: ["Hummock", "Knoll", "Rise", "Mound"], K: ["Skerry", "Sound", "Bank", "Roads"], L: ["Woodland", "Forestland", "Lowland", "Heathland"] },
  ICE: { for: N, A: ["Hayfield", "Sheepwalk", "Pasture", "Meadow"], G: ["Upland", "Pasture", "Meadow", "Heath"], H: ["Knoll", "Bluff", "Crag", "Mound"], K: ["Skerry", "Race", "Bank", "Roads"], L: ["Highland", "Wasteland", "Lowland", "Moorland"], W: ["Mire", "Moss", "Fen", "Bog"] },
  NDT: { for: G, A: ["Orchard", "Pasture", "Meadow", "Grange"], F: ["Alderwood", "Pinewood", "Beechwood", "Oakwood"], G: ["Meadow", "Common", "Pasture", "Haymeadow"], H: ["Rise", "Barrow", "Knoll", "Mound"], L: ["Marshland", "Lowland", "Plain", "Fenland"], O: ["Peatland", "Moss", "Bog", "Fen"], R: ["Estuary", "Backwater", "Weir", "Canal"], S: ["Bight", "Haven", "Estuary", "Roads"] },
  RHN: { for: G, A: ["Orchard", "Terrace", "Garden", "Hopgarden"], F: ["Beechwood", "Oakwood", "Forest", "Chestnutwood"], H: ["Slope", "Terrace", "Crag", "Knoll"], L: ["Wineland", "Riverland", "Valley", "Upland"], R: ["Backwater", "Oxbow", "Weir", "Millrace"] },
  MIT: { for: G, A: ["Pasture", "Hopfield", "Orchard", "Meadow"], F: ["Beechwood", "Oakwood", "Forest", "Firwood"], G: ["Clearing", "Upland", "Meadow", "Pasture"], H: ["Knoll", "Spur", "Hollow", "Crest"], L: ["Uplands", "Woodland", "Highland", "Forestland"], O: ["Peat", "Moorland", "Bog", "Moss"], R: ["Rill", "Millrace", "Brook", "Weir"] },
  ALP: { for: G, A: ["Dairy", "Hayfield", "Pasture", "Smallholding"], F: ["Pinewood", "Larchwood", "Firwood", "Forest"], G: ["Meadow", "Pasture", "Upland", "Hayfield"], H: ["Slope", "Spur", "Crest", "Knoll"], L: ["Highland", "Uplands", "Valley", "Mountainland"], R: ["Torrent", "Cascade", "Brook", "Rill"] },
  OST: { for: G, A: ["Grange", "Pasture", "Meadow", "Sandfield"], F: ["Pinewood", "Birchwood", "Forest", "Alderwood"], G: ["Meadow", "Common", "Pasture", "Heath"], H: ["Moraine", "Hummock", "Knoll", "Mound"], L: ["Sandland", "Plain", "Marchland", "Lakeland"], O: ["Moorland", "Peat", "Bog", "Fen"], R: ["Backwater", "Millrace", "Brook", "Canal"], W: ["Fen", "Carr", "Mire", "Marsh"] },
};

/** Cells with no such landscape, exempt from the six-entry depth (also in lens.json `regionExempt`). */
export const EXEMPT = {
  mountainNames: ["NDT", "DEN", "OST", "EAN"],
  forestNames: ["ICE", "NSI"],
  moorNames: ["RHN", "ALP"],
  wetlandNames: ["RHN", "MIT", "ALP"],
  grasslandNames: ["RHN"],
  seasLakes: ["ALP", "WMM", "EMD"],
  coastsIslands: ["WMM", "EMD"],
  seaCharts: ["RHN", "MIT", "ALP", "OST", "WMM", "EMD"],
};

/** The pack as region-tag entries in the shape regions.mjs uses: [g, tag, cultures, row, shapes]. */
export function packTags() {
  const out = [];
  for (const [region, pack] of Object.entries(PACKS)) {
    const words = new Map();
    for (const [letter, list] of Object.entries(pack)) {
      if (letter === "for") continue;
      for (const w of list) {
        const key = `${GROUPS[letter].g}:${w}`;
        if (!words.has(key)) words.set(key, { g: GROUPS[letter].g, word: w, shapes: [] });
        for (const [kind, p, f] of GROUPS[letter].frames) words.get(key).shapes.push([GROUPS[letter].module, kind, p.replace("{W}", w), 4, f]);
      }
    }
    for (const { g, word, shapes } of words.values()) out.push({ g, tag: `p${region}${word.replace(/\W/g, "")}`.toLowerCase(), for: pack.for, row: { [region]: 3 }, shapes, homeOnly: true });
  }
  return out;
}
