// Northern Europe tables brief, batch 5c: the data patches the batch makes to existing files, written to be run again without effect:
//  - tribal-names.json gains eight traditions (English, Welsh, Scottish, Irish, Cornish, Norse, Scandinavian, German) and every table keyed by
//    tradition gains their keys (the four nations read Celtic's, the others Germanic's), so nothing that was drawn before changes;
//  - group-names.json: the same keys in its tradition tables;
//  - lens.json: the tribal mapping for the eight, the `north5c` and `vehicle5c` culture sets, and the cultures sets of the 5c modules.
import { readFileSync, writeFileSync } from "node:fs";

const read = (p) => JSON.parse(readFileSync(new URL(`../../${p}`, import.meta.url), "utf8"));
const write = (p, v, indent) => writeFileSync(new URL(`../../${p}`, import.meta.url), `${JSON.stringify(v, null, indent)}\n`);
const clone = (v) => JSON.parse(JSON.stringify(v));

export const NATIONS = ["welsh", "scottish", "irish", "cornish"];
export const GERMANIC = ["norse", "scandinavian", "german", "english"];
const NEW = [...NATIONS, ...GERMANIC];

/** Adds the new tradition keys to every dict keyed by tradition and every list of tradition keys. */
function spread(node) {
  if (Array.isArray(node)) {
    for (const item of node) spread(item);
    if (node.every((x) => typeof x === "string")) {
      if (node.includes("celtic")) for (const k of NATIONS) if (!node.includes(k)) node.push(k);
      if (node.includes("germanic")) for (const k of GERMANIC) if (!node.includes(k)) node.push(k);
    }
    return;
  }
  if (node && typeof node === "object") {
    for (const v of Object.values(node)) spread(v);
    if ("celtic" in node) for (const k of NATIONS) if (!(k in node)) node[k] = clone(node.celtic);
    if ("germanic" in node) for (const k of GERMANIC) if (!(k in node)) node[k] = clone(node.germanic);
  }
}

const TRADITIONS = {
  english: { base: "germanic", label: "English", drawsOn: "Anglo-Saxon hundreds and tithings; medieval and later English kin, households and parishes", homeland: { temperate: 80, moorland: 20 }, terrainMultipliers: { coast: 1.1 }, flavour: { animals: ["Hart", "Boar", "Hound", "Swan", "Falcon", "Lion"], plants: ["Oak", "Hawthorn", "Yew", "Thorn"], land: ["Weald", "Down", "Fen", "Wold"], lifeways: ["Ploughmen", "Shepherds"] }, favouredLifeways: ["Ploughmen", "Shepherds", "Smiths", "Cattle Keepers"], signatureCollectives: ["Folk", "Kin", "House", "Hundred", "Neighbours"], themes: { landscape: 1.3, relationship: 1.2, qualities: 1.2, warfare: 0.8, dress: 1 }, templates: { A: 1.2, B: 1.1 }, groupTypes: { settlement: 1.3, regional: 1.2, confederation: 1 }, numbers: ["Three", "Seven", "Twelve"], special: {} },
  welsh: { base: "celtic", label: "Welsh", drawsOn: "Welsh kindreds, princedoms and valley communities", homeland: { highland: 40, temperate: 40, moorland: 20 }, terrainMultipliers: { mountains: 1.2, coast: 1.1 }, flavour: { animals: ["Dragon", "Red Kite", "Raven", "Salmon", "Stag", "Hound"], plants: ["Oak", "Mistletoe", "Rowan", "Leek"], land: ["Valley", "Mountain", "Moor"], lifeways: ["Drovers", "Bards"] }, favouredLifeways: ["Drovers", "Cattle Keepers", "Smiths", "Ploughmen"], signatureCollectives: ["Kin", "Children", "Folk", "Descendants", "Hosts"], themes: { landscape: 1.5, qualities: 1.3, animals: 1.3, warfare: 1.1, vessel: 0.3 }, templates: { O: 1.4, A: 1.2 }, groupTypes: { dynasty: 1.3, regional: 1.3, kin: 1.2 }, numbers: ["Three", "Seven", "Nine"], special: {} },
  scottish: { base: "celtic", label: "Scottish", drawsOn: "Highland clans and septs; Lowland and Border families; the Isles", homeland: { highland: 45, temperate: 25, moorland: 30 }, terrainMultipliers: { mountains: 1.3, coast: 1.3, islands: 1.3 }, flavour: { animals: ["Stag", "Wildcat", "Eagle", "Salmon", "Raven", "Hound"], plants: ["Thistle", "Rowan", "Heather", "Pine"], land: ["Glen", "Loch", "Strath", "Moor"], lifeways: ["Crofters", "Fishermen"] }, favouredLifeways: ["Cattle Keepers", "Fishermen", "Crofters", "Smiths"], signatureCollectives: ["Clan", "Sept", "Kin", "Children", "Descendants"], themes: { landscape: 1.4, warfare: 1.3, qualities: 1.2, animals: 1.2, relationship: 1.3 }, templates: { O: 1.3, A: 1.3 }, groupTypes: { dynasty: 1.4, kin: 1.3, warband: 1.2 }, numbers: ["Three", "Seven"], special: {} },
  irish: { base: "celtic", label: "Irish", drawsOn: "Irish septs, kindreds and over-kingdoms", homeland: { temperate: 70, moorland: 30 }, terrainMultipliers: { coast: 1.2, islands: 1.2 }, flavour: { animals: ["Hound", "Boar", "Salmon", "Stag", "Hawk", "Raven"], plants: ["Hazel", "Ash", "Oak", "Shamrock"], land: ["Plain", "Bog", "Hill Fort"], lifeways: ["Cattle Keepers", "Poets"] }, favouredLifeways: ["Cattle Keepers", "Horse Breeders", "Smiths", "Ploughmen"], signatureCollectives: ["Sept", "Kin", "Children", "Descendants", "People"], themes: { landscape: 1.3, warfare: 1.3, qualities: 1.5, animals: 1.2, relationship: 1.3 }, templates: { O: 1.5, A: 1.3 }, groupTypes: { dynasty: 1.4, confederation: 1.3, kin: 1.3 }, numbers: ["Three", "Five", "Seven"], special: {} },
  cornish: { base: "celtic", label: "Cornish", drawsOn: "Cornish kindreds, tinners and fishing communities", homeland: { temperate: 50, moorland: 50 }, terrainMultipliers: { coast: 1.6, islands: 1.2 }, flavour: { animals: ["Chough", "Gull", "Seal", "Hound", "Hare", "Raven"], plants: ["Oak", "Gorse", "Thrift"], land: ["Moor", "Cove", "Tor"], lifeways: ["Tinners", "Fishermen"] }, favouredLifeways: ["Fishermen", "Smiths", "Cattle Keepers", "Boatwrights"], signatureCollectives: ["Kin", "Children", "Folk", "Tinners", "Descendants"], themes: { landscape: 1.4, water: 1.3, qualities: 1.2, animals: 1.2, vessel: 0.8 }, templates: { O: 1.3, A: 1.2 }, groupTypes: { settlement: 1.3, kin: 1.2, regional: 1.2 }, numbers: ["Three", "Seven"], special: {} },
  norse: { base: "germanic", label: "Norse", drawsOn: "Viking-age Norse kindreds, steadings and war-bands", homeland: { boreal: 50, temperate: 30, moorland: 20 }, terrainMultipliers: { coast: 1.5, islands: 1.4, mountains: 1.1 }, flavour: { animals: ["Wolf", "Raven", "Bear", "Serpent", "Eagle", "Boar"], plants: ["Ash", "Birch", "Pine", "Yew"], land: ["Fjord", "Fell", "Dale"], water: ["Fjord", "Long Inlet"], lifeways: ["Seafarers", "Boatwrights"] }, favouredLifeways: ["Seafarers", "Boatwrights", "Smiths", "Cattle Keepers"], signatureCollectives: ["Sons", "Kin", "Folk", "Host", "Men"], themes: { warfare: 1.5, dress: 1.5, relationship: 1.5, vessel: 1.6, sacred: 0.9 }, templates: { A: 1.3, L: 1.2 }, groupTypes: { warband: 1.6, migrant: 1.3, confederation: 1.2 }, numbers: ["Two", "Three", "Nine", "Twelve"], special: { longship: true } },
  scandinavian: { base: "germanic", label: "Scandinavian", drawsOn: "Scandinavian farm-communities, parishes and seafarers, early modern to now", homeland: { boreal: 55, temperate: 30, highland: 15 }, terrainMultipliers: { coast: 1.3, islands: 1.3 }, flavour: { animals: ["Elk", "Wolf", "Bear", "Swan", "Raven", "Eagle"], plants: ["Pine", "Birch", "Spruce", "Rowan"], land: ["Heath", "Forest"], water: ["Fjord", "Lake"], lifeways: ["Foresters", "Seafarers"] }, favouredLifeways: ["Foresters", "Seafarers", "Ploughmen", "Smiths"], signatureCollectives: ["Folk", "Kin", "House", "Sons", "Neighbours"], themes: { landscape: 1.4, water: 1.3, relationship: 1.3, animals: 1.2, vessel: 1.2 }, templates: { A: 1.2, L: 1.1 }, groupTypes: { settlement: 1.3, regional: 1.2, kin: 1.2 }, numbers: ["Three", "Seven", "Nine"], special: {} },
  german: { base: "germanic", label: "German", drawsOn: "German kin and free communities, leagues and imperial cities", homeland: { temperate: 60, boreal: 20, highland: 20 }, terrainMultipliers: { mountains: 1.1 }, flavour: { animals: ["Wolf", "Eagle", "Bear", "Stag", "Boar", "Hound"], plants: ["Oak", "Linden", "Beech", "Fir"], land: ["Heath", "Forest"], lifeways: ["Foresters", "Smiths"] }, favouredLifeways: ["Ploughmen", "Smiths", "Foresters", "Cattle Keepers"], signatureCollectives: ["Folk", "Kin", "House", "Brethren", "Neighbours"], themes: { landscape: 1.3, warfare: 1.2, relationship: 1.4, qualities: 1.2, sacred: 0.9 }, templates: { A: 1.2, B: 1.2 }, groupTypes: { confederation: 1.3, settlement: 1.2, regional: 1.2 }, numbers: ["Three", "Seven", "Nine", "Twelve"], special: {} },
};

// Brief 6a: the batch's cultures as tribal traditions: the Latin and Greek ones read the Mediterranean tradition's tables, Dutch and Slavic the Germanic ones.
export const MEDITERRANEAN6 = ["french", "spanish", "portuguese", "italian", "roman", "greek", "byzantine", "iberian", "greek-byzantine"];
export const GERMANIC6 = ["dutch", "slavic"];
const LABEL6 = { french: "French", spanish: "Spanish", portuguese: "Portuguese", italian: "Italian", roman: "Roman", greek: "Greek", byzantine: "Byzantine", iberian: "Iberian", "greek-byzantine": "Greek and Byzantine", dutch: "Dutch", slavic: "Slavic" };
function patch6a() {
  const tribal = read("src/data/tribal-names.json");
  if (!tribal.traditions.some((t) => t.key === "french")) {
    for (const key of [...MEDITERRANEAN6, ...GERMANIC6]) {
      const from = tribal.traditions.find((t) => t.key === (GERMANIC6.includes(key) ? "germanic" : "mediterranean"));
      tribal.traditions.push({ ...clone(from), key, group: "Western and southern Europe", label: LABEL6[key], drawsOn: `${LABEL6[key]} kin, households and communities` });
    }
  }
  const spread6 = (node) => {
    if (Array.isArray(node)) {
      for (const item of node) spread6(item);
      if (node.every((x) => typeof x === "string")) {
        if (node.includes("mediterranean")) for (const k of MEDITERRANEAN6) if (!node.includes(k)) node.push(k);
        if (node.includes("germanic")) for (const k of GERMANIC6) if (!node.includes(k)) node.push(k);
      }
      return;
    }
    if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node)) if (k !== "homeland") spread6(v);
      if ("mediterranean" in node && !("temperate" in node)) for (const k of MEDITERRANEAN6) if (!(k in node)) node[k] = clone(node.mediterranean);
      if ("germanic" in node && !("temperate" in node)) for (const k of GERMANIC6) if (!(k in node)) node[k] = clone(node.germanic);
    }
  };
  spread6(tribal);
  write("src/data/tribal-names.json", tribal, 1);
  const group = read("src/data/group-names.json");
  spread6(group);
  write("src/data/group-names.json", group, 1);
  const lens = read("src/data/lens.json");
  for (const key of [...MEDITERRANEAN6, ...GERMANIC6]) if (!lens.mappings.cultures.tribal[key]) lens.mappings.cultures.tribal[key] = { lens: [key], weights: [[key, 1]] };
  write("src/data/lens.json", lens, 1);
}


// Brief 6b: Turkic, Mongol, Arabic, Persian, Egyptian and Ethiopian as tribal traditions (the old steppe, arabian, bantu and westAfrican keep their own).
// Each new tradition starts from the tables of the one it grew from, with homelands, flavour and signature collectives of its own.
export const TRIBAL6B = {
  turkic: { base: "steppe", label: "Turkic", group: "Eastern Europe and the steppe", drawsOn: "Oghuz, Seljuk and Ottoman Turkic tribes, beyliks and khanates", homeland: { steppe: 35, highland: 35, temperate: 30 }, terrainMultipliers: { rivers: 1.2, coast: 0.8, islands: 0.3 },
    flavour: { animals: ["Grey Wolf", "Horse", "Falcon", "Eagle", "Ram", "Camel", "Stag", "Nightingale"], plants: ["Feather Grass", "Walnut", "Plane"], land: ["Highland Pasture", "Pass", "Plateau"], water: ["Springs", "Salt Lakes"], lifeways: ["Horse Herders", "Carpet Weavers", "Felt Makers"] }, signatureCollectives: ["Tribe", "Host", "Banners", "Tents", "Riders", "Beylik"] },
  mongol: { base: "steppe", label: "Mongol", group: "Eastern Europe and the steppe", drawsOn: "Mongol clans, ordos and banners of the steppe", homeland: { steppe: 70, desert: 15, highland: 15 }, terrainMultipliers: { rivers: 1.1, coast: 0, islands: 0 },
    flavour: { animals: ["Blue Wolf", "Horse", "Golden Eagle", "Camel", "Yak", "Marmot", "Red Deer", "Falcon"], plants: ["Feather Grass", "Wild Onion", "Larch"], land: ["Gobi", "Pass", "Cairn"], water: ["Salt Lakes", "Springs"], lifeways: ["Horse Herders", "Archers", "Felt Makers"] }, signatureCollectives: ["Ordo", "Horde", "Arrows", "Banners", "Tents", "Riders"] },
  arabic: { base: "arabian", label: "Arabic", group: "Middle East and Africa", drawsOn: "Arabian tribes, caravan towns and oasis communities", homeland: { desert: 60, temperate: 25, highland: 15 }, terrainMultipliers: { coast: 1.1, rivers: 0.6 },
    flavour: { animals: ["Camel", "Falcon", "Gazelle", "Oryx", "Horse", "Ibex", "Hawk"], plants: ["Date Palm", "Acacia", "Tamarisk"], land: ["Wadi", "Oasis", "Dunes"], water: ["Wells", "Springs"], lifeways: ["Camel Herders", "Traders", "Pearl Divers"] }, signatureCollectives: ["Tribe", "Clan", "Caravan", "Tents", "House"] },
  persian: { base: "arabian", label: "Persian", group: "Middle East and Africa", drawsOn: "Persian tribes, garden cities and the satrapies of the plateau", homeland: { highland: 40, desert: 25, temperate: 35 }, terrainMultipliers: { mountains: 1.2, coast: 0.8 },
    flavour: { animals: ["Lion", "Falcon", "Horse", "Gazelle", "Leopard", "Nightingale", "Ram"], plants: ["Rose", "Cypress", "Pomegranate"], land: ["Plateau", "Garden", "Salt Desert"], water: ["Qanats", "Springs"], lifeways: ["Gardeners", "Carpet Weavers", "Horse Herders"] }, signatureCollectives: ["Tribe", "House", "Satrapy", "Gardens", "Riders"] },
  egyptian: { base: "arabian", label: "Egyptian", group: "Middle East and Africa", drawsOn: "Nile valley kin, nome communities and river towns", homeland: { temperate: 55, desert: 45 }, terrainMultipliers: { rivers: 2, coast: 1.1, mountains: 0.3 },
    flavour: { animals: ["Falcon", "Ibis", "Jackal", "Crocodile", "Hippo", "Cobra", "Bull"], plants: ["Papyrus", "Lotus", "Date Palm"], land: ["Delta", "Cataract", "Oasis"], water: ["Nile", "Canals"], lifeways: ["Boatmen", "Farmers", "Scribes"] }, signatureCollectives: ["Nome", "House", "Households", "Boats", "Temple"] },
  ethiopian: { base: "arabian", label: "Ethiopian", group: "Middle East and Africa", drawsOn: "Highland kin, church communities and the lowland peoples of the Rift", homeland: { highland: 60, temperate: 25, desert: 15 }, terrainMultipliers: { mountains: 1.4, coast: 0.4, rivers: 1.1 },
    flavour: { animals: ["Lion", "Ibis", "Mule", "Ibex", "Leopard", "Hornbill", "Baboon"], plants: ["Coffee", "Teff", "Juniper"], land: ["Amba", "Highland", "Rift"], water: ["Lakes", "Springs"], lifeways: ["Farmers", "Herders", "Coffee Growers"] }, signatureCollectives: ["Kin", "Church", "Households", "Clan", "Village"] },
};
const TRIBAL6B_KEYS = Object.keys(TRIBAL6B);
function patch6b() {
  const tribal = read("src/data/tribal-names.json");
  if (!tribal.traditions.some((t) => t.key === "turkic")) {
    for (const [key, spec] of Object.entries(TRIBAL6B)) {
      const { base, ...own } = spec;
      const from = tribal.traditions.find((t) => t.key === base);
      tribal.traditions.push({ ...clone(from), key, ...own, flavour: { ...clone(from.flavour), ...own.flavour } });
    }
  }
  const spread6b = (node) => {
    if (Array.isArray(node)) {
      for (const item of node) spread6b(item);
      if (node.every((x) => typeof x === "string")) for (const [k, spec] of Object.entries(TRIBAL6B)) if (node.includes(spec.base) && !node.includes(k)) node.push(k);
      return;
    }
    if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node)) if (k !== "homeland") spread6b(v);
      for (const [k, spec] of Object.entries(TRIBAL6B)) if (spec.base in node && !("temperate" in node) && !(k in node)) node[k] = clone(node[spec.base]);
    }
  };
  spread6b(tribal);
  write("src/data/tribal-names.json", tribal, 1);
  const group = read("src/data/group-names.json");
  spread6b(group);
  write("src/data/group-names.json", group, 1);
  const lens = read("src/data/lens.json");
  for (const key of TRIBAL6B_KEYS) if (!lens.mappings.cultures.tribal[key]) lens.mappings.cultures.tribal[key] = { lens: [key], weights: [[key, 1]] };
  write("src/data/lens.json", lens, 1);
}

export function patchData() {
  // ── tribal-names.json
  const tribal = read("src/data/tribal-names.json");
  if (!tribal.traditions.some((t) => t.key === "english")) {
    for (const [key, spec] of Object.entries(TRADITIONS)) {
      const { base, ...own } = spec;
      const from = tribal.traditions.find((t) => t.key === base);
      tribal.traditions.push({ ...clone(from), key, group: "Northern Europe", ...own });
    }
  }
  spread(tribal);
  write("src/data/tribal-names.json", tribal, 1);

  // ── group-names.json
  const group = read("src/data/group-names.json");
  spread(group);
  write("src/data/group-names.json", group, 1);

  // ── lens.json
  const lens = read("src/data/lens.json");
  const maps = lens.mappings.cultures;
  for (const key of NEW) maps.tribal[key] = { lens: [key], weights: [[key, 1]] };
  if (!maps.tribal.celtic.lens.includes("celtic")) maps.tribal.celtic.lens.push("celtic");
  const six = ["welsh", "scottish", "irish", "cornish", "scandinavian", "german"];
  maps.north5c = { extends: "shared", entries: Object.fromEntries(six.map((k) => [k, { lens: [k] }])) };
  maps.vehicle5c = { extends: "vehicle", entries: Object.fromEntries(six.map((k) => [k, { lens: [k] }])) };
  for (const m of ["epithets", "titles", "familyNames", "realms", "peoplesTongues"]) lens.modules[m].cultures = "north5c";
  for (const m of ["ships", "aircraft", "landVehicles"]) lens.modules[m].cultures = "vehicle5c";
  // Spacecraft is left to the style tables brief: its roster and mapping stay the thirty-four.
  lens.modules.spacecraft.sentence.roster = "vesselSpace";
  write("src/data/lens.json", lens, 1);
  patch6a();
  patch6b();
}

if (process.argv[1] && process.argv[1].endsWith("patchData.mjs")) patchData();
