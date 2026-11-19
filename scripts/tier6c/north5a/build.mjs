// Brief 6c, the land and sea modules: the four cultures' noun lists are built from each culture's own modifiers (era groups A to C, fantastic F) over the module's generic geography nouns, so that
// every list of ten words keeps the fixed order (three AN-MD, three EM-ST, two ST-MO, one fantastic, one general) and no culture is another's with words changed.
const BASE = {
  mountain: ["Peak", "Ridge", "Range"], wood: ["Forest", "Grove", "Clearing"], moor: ["Moor", "Hill", "Stone"], wet: ["Marsh", "Bog", "Isle"], grass: ["Plain", "Pasture", "Vale"],
  lands: ["Province", "Domain", "Lands"], farm: ["Field", "Farm", "Enclosure"], hill: ["Hill", "Valley", "Spur"], river: ["Stream", "Lake", "Falls"], desert: ["Desert", "Dune", "Rock"],
  sea: ["Bay", "Inlet", "Strait"], coast: ["Headland", "Cove", "Island"], chart: ["Bank", "Reef", "Channel"],
};
const LAND = ["mountain", "wood", "moor", "wet", "grass", "lands", "farm", "hill", "river", "desert"];
const WATER = ["sea", "coast", "chart"];
const list = (m, base, s) => {
  const a = (i) => m.A[(s + i) % m.A.length];
  const b = (i) => m.B[(s + i) % m.B.length];
  const c = (i) => m.C[(s + i) % m.C.length];
  const f = m.F[s % m.F.length];
  return [a(0), a(1), a(2), b(0), b(2), b(4), c(0), c(1), f].map((x) => `${x} ${base}`).concat(base).join("|");
};
export function buildCulture(def) {
  const out = { key: def.key, label: def.label, style: def.style, land: def.land, water: def.water, route: def.route, sacred: def.sacred, nouns: { land: {}, water: {}, route: [], sacred: [] } };
  let s = 0;
  for (const k of LAND) {
    const bases = k === "desert" && def.desertBase ? def.desertBase : BASE[k];
    out.nouns.land[k] = bases.map((b, L) => list(def.mods, b, s * 3 + L));
    s++;
  }
  for (const k of WATER) {
    out.nouns.water[k] = BASE[k].map((b, L) => list(def.mods, b, s * 3 + L));
    s++;
  }
  // The routes' and the sacred sites' lists: roads, tracks and paths; springs, stones and shrines.
  // Each route list takes two extras of each end of the eras (tagged), so that a kind with few words still gives twenty unique names.
  const extra = (b, k) => [...[3, 4, 5].map((i) => def.mods.A[(k + i) % 6]), ...[1, 3, 5].map((i) => def.mods.B[(k + i) % 6]), ...[2, 3].map((i) => def.mods.C[(k + i) % 4])].map((x) => `|${x} ${b};AN-IS`).join("");
  out.nouns.route = ["Road", "Track", "Path"].map((b, L) => list(def.mods, b, 40 + L) + extra(b, 40 + L));
  out.nouns.sacred = ["Spring", "Stone", "Shrine"].map((b, L) => list(def.mods, b, 50 + L));
  return out;
}
