// Northern Europe brief §4: the nine new region columns added to the existing region tags. 0 unless the word fits the region.
// Only the Norse-derived English words (fell, force, beck, ghyll, dale, tarn, holm, skerry, stack, ness…) read the Scandinavian
// regions: [DEN, NOR, SWE, ICE]. The German columns stay 0 for them (§4: British dialect words stay British); German has region
// words of its own (regions.mjs). A tag that is only a structure ("Mount {town}", "Lake {x}") is neutral (1) for the Nordic regions.

export const NEW_REGIONS = ["DEN", "NOR", "SWE", "ICE", "NDT", "RHN", "MIT", "ALP", "OST"];

/** [DEN, NOR, SWE, ICE] per tag; absent tags are 0 everywhere. */
export const NORDIC_WILDS = {
  fell: [0.2, 3, 1, 2],
  force: [0, 2, 0.5, 3],
  beck: [1, 1, 1, 1],
  ghyll: [0, 2, 0.5, 1],
  hause: [0, 2, 0.3, 1],
  dale: [0.3, 2, 1, 1],
  tarn: [0, 2, 2, 1],
  moss: [1, 1, 2, 1],
  howe: [2, 0.5, 1, 0.3],
  holme: [2, 1, 2, 0.3],
  rigg: [0, 1, 1, 0],
  scar: [0, 1, 0.3, 1],
  pike: [0, 1.5, 0, 0],
  knott: [0, 1, 0, 0],
  hope: [0, 1, 0, 0],
  ings: [1, 0, 1, 0],
  carr: [1, 0, 1, 0],
  flow: [0, 1, 0, 1],
  holt: [2, 0.3, 1, 0.3],
  moor: [0.5, 2, 1.5, 0.5],
  heath: [3, 0.5, 1, 0],
  fen: [1, 0, 0.5, 0],
  marsh: [2, 0, 0.5, 0],
  mount: [1, 1, 1, 1],
  oldMan: [1, 1, 1, 1],
  lakeLake: [1, 1, 1, 1],
  lakeWater: [1, 1, 1, 1],
  causeway: [0.5, 0, 0.5, 0],
  drain: [1, 0, 0, 0],
};

export const NORDIC_WATERS = {
  ness: [0.5, 2, 0.5, 3],
  firth: [1, 1.5, 0, 1],
  soundOf: [3, 1, 2, 0.5],
  holm: [3, 1, 3, 0.3],
  skerry: [0.5, 2, 3, 1],
  stack: [0, 2, 0, 2],
  geo: [0, 0.5, 0, 3],
  fleet: [1, 0, 0, 0],
  saltings: [1, 0, 0, 0],
  tarn: [0, 2, 2, 1],
  scar: [0, 1, 0.3, 1],
  cape: [1, 1, 1, 1],
  foreland: [1, 1, 1, 1],
  estuary: [1, 1, 1, 1],
  creek: [0.5, 0, 0.5, 0],
  cove: [1, 1, 1, 1],
  pool: [1, 1, 1, 1],
  riverSea: [1, 1, 1, 1],
  deepChannel: [1, 1, 1, 1],
  roads: [1, 0, 1, 0],
  lakeLake: [1, 1, 1, 1],
  lakeWater: [1, 1, 1, 1],
  cauldron: [0, 1, 0, 1],
};

export function columns(tags, nordic) {
  const out = {};
  for (const tag of Object.keys(tags)) {
    const n = nordic[tag] ?? [0, 0, 0, 0];
    out[tag] = Object.fromEntries(NEW_REGIONS.map((r, i) => [r, i < 4 ? n[i] : 0]));
  }
  return out;
}
