// Korean (brief 6c): mountain and river naming, walled towns and fortresses, Confucian academies, royal tombs and hermitages, market days, provinces and counties, paddy, the open ports. No desert content.
import { buildCulture } from "./build.mjs";
export default buildCulture({
  key: "korean", label: "Korean", style: "first",
  mods: { A: ["Pine", "Tiger", "Hermitage", "Fortress", "Magpie", "Crane"], B: ["Yangban", "Royal", "Ginseng", "Paddy", "Market", "Beacon"], C: ["Railway", "Dam", "Industrial", "Resort"], F: ["Dokkaebi", "Mountain-Spirit", "Haetae", "Nine-Tailed"] },
  desertBase: ["Sand Barrens", "Dune", "Volcanic Rock"],
  land: {
    B: "Rice|Ginseng|Pine|Silk|Paper|Celadon|Tea|Persimmon|Salt|Hemp",
    C: "Dokkaebi|Mountain Spirit|Haetae|Nine-Tailed Fox|Maiden Ghost|Sleeping General",
    D: "Mountain Fortress;AN-MD|Paddy Terrace;AN-MD|Watchtower;AN-MD|Pine Grove;AN-MD|Hermitage;AN-MD|Walled Town;MD|Academy;MD|Ginseng Field;EM-ST|Open Port;EM-ST|Silk Mill;ST-MO|Reservoir;ST-MO|Industrial Complex;MO|Wind Farm;MO|Ski Resort;MO",
  },
  water: {
    B: "Carp|Pearl|Seaweed|Salt|Pollock|Anchovy|Octopus|Rice|Shrimp|Eel",
    C: "Sea Dragon|Drowned Town|River Ghost|Phantom Boat|Sea Dokkaebi|Pearl Maiden",
    D: "Fish Weir;AN-MD|Ferry Crossing;AN-MD|Salt Works;AN-MD|Fortress Harbour;MD|Ship Yard;MD|Customs House;EM-ST|Lighthouse;EM-ST|Steamer Pier;ST-MO|Dam Lake;ST-MO|Container Port;MO|Marina;MO|Ferry Terminal;MO",
  },
  route: {
    N: "Royal Road|Post Road|Pilgrim Road|Mountain Pass|Ferry Road|Market Road",
    B: "Rice|Ginseng|Salt|Silk|Royal|Pilgrims'|Horse|Fish",
    C: "Ghost|Fox's|Dokkaebi's|Phantom|Winged|Tiger's",
    D: "Royal Road;AN-MD|Post Road;AN-MD|Pilgrim Road;AN-MD|Mountain Pass;AN-MD|Ferry Road;MD|Beacon Road;MD|Coach Road;EM-ST|Telegraph Road;EM-ST|Railway Line;ST-MO|Trunk Road;ST-MO|Expressway;MO|Ring Road;MO|High-Speed Line;MO",
  },
  sacred: {
    N: "Holy Spring|Mountain Shrine|Pilgrim Stone|Shrine|Temple|Tomb",
    B: "Monk's|Pilgrims'|Healing|Holy|Hermit's|Ancestral",
    C: "Tiger's|Enchanted|Dokkaebi's|Buried|Phantom",
    D: "Holy Spring;AN-MD|Sacred Rock;AN-MD|Mountain Shrine;AN-MD|Pine Avenue;AN-MD|Temple Gate;MD|Royal Tomb;MD|Academy Shrine;EM-ST|Grave Mound;EM-ST|Great Temple;ST-MO|Memorial Garden;ST-MO|Pilgrimage Square;MO",
  },
});
