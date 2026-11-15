// Northern Europe brief 5b Part A (§12.2): region depth. Every region has at least six entries of its own in each land and water module whose
// landscape it has: two region words per module, each with three frames written for the module. The words are plain English (standard
// dictionary entries; regional dialect words such as tor, combe, carse and brae are listed in dictionaries). A word is a region tag, weighted 3
// for its region and 0 elsewhere, and drawn only for the cultures that read the region.

const E = ["anglo-saxon", "norman-british"];
const N = ["norse", "scandinavian"];
const G = ["german"];
const S = ["scottish"];

/** Group letter → module, whether it is a water module, and its three frames [kind, pattern, family]. */
export const GROUPS = {
  M: { module: "mountainNames", g: "wilds", frames: [["peak", "{beast} {W}", "crt"], ["ridge", "{town} {W}", "twn"], ["range", "{wildColour} {W}", "col"]] },
  F: { module: "forestNames", g: "wilds", frames: [["forest", "{town} {W}", "twn"], ["grove", "{W} of {person}", "per"], ["clearing", "{beast} {W}", "crt"]] },
  O: { module: "moorNames", g: "wilds", frames: [["moor", "{wildColour} {W}", "col"], ["hill", "{town} {W}", "twn"], ["bog", "{beast} {W}", "crt"]] },
  W: { module: "wetlandNames", g: "wilds", frames: [["marsh", "{town} {W}", "twn"], ["bog", "{wildColour} {W}", "col"], ["water", "{beast} {W}", "crt"]] },
  G: { module: "grasslandNames", g: "wilds", frames: [["meadow", "{town} {W}", "twn"], ["down", "{wildColour} {W}", "col"], ["heath", "{beast} {W}", "crt"]] },
  L: { module: "lands", g: "wilds", frames: [["country", "{W} Country", "qual"], ["parish", "{town} {W}", "twn"], ["shire", "{wildColour} {W} Shire", "col"]] },
  A: { module: "farmland", g: "wilds", frames: [["field", "{town} {W}", "twn"], ["farm", "{person:poss} {W}", "per"], ["enclosure", "{wildColour} {W}", "col"]] },
  H: { module: "hillsValleys", g: "wilds", frames: [["hill", "{town} {W}", "twn"], ["valley", "{wildColour} {W}", "col"], ["ridge", "{beast} {W}", "crt"]] },
  R: { module: "riversInland", g: "wilds", frames: [["stream", "{town} {W}", "twn"], ["spring", "{wildColour} {W}", "col"], ["pool", "{beast} {W}", "crt"]] },
  S: { module: "seasLakes", g: "waters", frames: [["bay", "{town} {W}", "twn"], ["inlet", "{seaColour} {W}", "col"], ["strait", "{W} of {town}", "twn"]] },
  C: { module: "coastsIslands", g: "waters", frames: [["headland", "{town} {W}", "twn"], ["cove", "{seaColour} {W}", "col"], ["island", "{seaCreature} {W}", "crt"]] },
  K: { module: "seaCharts", g: "waters", frames: [["bank", "{town} {W}", "twn"], ["channel", "{seaColour} {W}", "col"], ["roads", "{W} of {town}", "twn"]] },
};

/** Region → the cultures that read it, then group letter → the region's words for that module. */
export const PACKS = {
  SEA: { for: E, A: ["Orchard", "Hopfield"], H: ["Combe", "Hanger"], L: ["Weald", "Downland"], M: ["Beacon", "Downs"], R: ["Bourne", "Winterbourne"], S: ["Haven", "Reach"] },
  WCY: { for: E, A: ["Orchard", "Dairy"], H: ["Combe", "Tor"], K: ["Race", "Roads"], L: ["Moorland", "Vale"], R: ["Leat", "Rill"], S: ["Estuary", "Haven"] },
  EAN: { for: E, A: ["Warren", "Grange"], H: ["Knoll", "Rise"], L: ["Fenland", "Breckland"], S: ["Wash", "Broad"] },
  WMM: { for: E, A: ["Hopyard", "Pasture"], H: ["Edge", "Dingle"], L: ["Marches", "Vale"], M: ["Beacon", "Crag"] },
  EMD: { for: E, A: ["Grange", "Dairy"], H: ["Wold", "Edge"], L: ["Wolds", "Heartland"] },
  NTH: { for: E, A: ["Sheepwalk", "Dairy"], K: ["Race", "Bank"], L: ["Riding", "Moorland"] },
  WAL: { for: ["welsh"], A: ["Sheepwalk", "Smallholding"], F: ["Oakwood", "Hazelwood"], G: ["Pasture", "Upland"], H: ["Combe", "Dingle"], K: ["Race", "Roads"], L: ["Upland", "Valley"], M: ["Crag", "Cairn"], R: ["Torrent", "Cascade"], S: ["Estuary", "Sound"] },
  COR: { for: ["cornish"], A: ["Smallholding", "Orchard"], F: ["Oakwood", "Hazelwood"], G: ["Pasture", "Downland"], H: ["Combe", "Tor"], K: ["Ledge", "Roads"], L: ["Moorland", "Peninsula"], R: ["Leat", "Rill"], S: ["Creek", "Estuary"], W: ["Mire", "Bog"] },
  SBL: { for: [...E, ...S], A: ["Hirsel", "Sheepwalk"], F: ["Chase", "Plantation"], G: ["Haugh", "Pasture"], K: ["Bank", "Race"], L: ["Marches", "Barony"], R: ["Linn", "Cleugh"], W: ["Moss", "Flow"] },
  SLO: { for: S, A: ["Grange", "Steading"], F: ["Plantation", "Forest"], H: ["Brae", "Law"], K: ["Bank", "Roads"], L: ["Carse", "Lowland"], R: ["Linn", "Burn"], W: ["Moss", "Flow"] },
  SHH: { for: S, A: ["Shieling", "Croft"], F: ["Pinewood", "Birchwood"], G: ["Machair", "Upland"], H: ["Corrie", "Brae"], K: ["Skerry", "Race"], L: ["Strath", "Clanland"], R: ["Torrent", "Linn"], W: ["Moss", "Flow"] },
  NSI: { for: S, A: ["Croft", "Steading"], G: ["Machair", "Links"], H: ["Knowe", "Brae"], L: ["Isle", "Mainland"], R: ["Voe", "Burn"], W: ["Moss", "Flow"] },
  DEN: { for: N, A: ["Meadow", "Grange"], H: ["Barrow", "Knoll"], K: ["Sound", "Roads"], L: ["Isle", "Lowland"] },
  NOR: { for: N, A: ["Shieling", "Steading"], F: ["Pinewood", "Birchwood"], G: ["Shieling", "Upland"], H: ["Fell", "Knoll"], K: ["Skerry", "Sound"], L: ["Fjordland", "Highland"] },
  SWE: { for: N, A: ["Meadow", "Smallholding"], H: ["Hummock", "Knoll"], K: ["Skerry", "Sound"], L: ["Woodland", "Forestland"] },
  ICE: { for: N, A: ["Hayfield", "Sheepwalk"], G: ["Upland", "Pasture"], H: ["Knoll", "Bluff"], K: ["Skerry", "Race"], L: ["Highland", "Wasteland"], W: ["Mire", "Moss"] },
  NDT: { for: G, A: ["Orchard", "Pasture"], H: ["Rise", "Barrow"], F: ["Alderwood", "Pinewood"], G: ["Meadow", "Common"], L: ["Marshland", "Lowland"], O: ["Peatland", "Moss"], R: ["Estuary", "Backwater"], S: ["Bight", "Haven"] },
  RHN: { for: G, A: ["Orchard", "Terrace"], F: ["Beechwood", "Oakwood"], H: ["Slope", "Terrace"], L: ["Wineland", "Riverland"], R: ["Backwater", "Oxbow"] },
  MIT: { for: G, A: ["Pasture", "Hopfield"], F: ["Beechwood", "Oakwood"], G: ["Clearing", "Upland"], H: ["Knoll", "Spur"], L: ["Uplands", "Woodland"], O: ["Peat", "Moorland"], R: ["Rill", "Millrace"] },
  ALP: { for: G, A: ["Dairy", "Hayfield"], F: ["Pinewood", "Larchwood"], G: ["Meadow", "Pasture"], H: ["Slope", "Spur"], L: ["Highland", "Uplands"], R: ["Torrent", "Cascade"] },
  OST: { for: G, A: ["Grange", "Pasture"], H: ["Moraine", "Hummock"], F: ["Pinewood", "Birchwood"], G: ["Meadow", "Common"], L: ["Sandland", "Marchland"], O: ["Moorland", "Peat"], R: ["Backwater", "Millrace"], W: ["Fen", "Carr"] },
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
    for (const { g, word, shapes } of words.values()) out.push({ g, tag: `p${region}${word.replace(/\W/g, "")}`.toLowerCase(), for: pack.for, row: { [region]: 3 }, shapes });
  }
  return out;
}
