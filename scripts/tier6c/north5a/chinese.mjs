// Chinese (brief 6c): walled cities and their gates, canals and granaries, county seats, mountains with temples, scholars and examination halls, tea houses, junks, treaty ports; the Gobi and Taklamakan.
import { buildCulture } from "./build.mjs";
export default buildCulture({
  key: "chinese", label: "Chinese", style: "first",
  mods: { A: ["Jade", "Willow", "Pagoda", "Imperial", "Granary", "Tiger"], B: ["Tea", "Silk", "Canal", "Treaty", "Junk", "Scholars'"], C: ["Railway", "Dam", "Factory", "Tourist"], F: ["Immortal", "Fox", "Dragon King's", "Kylin"] },
  land: {
    B: "Tea|Silk|Jade|Porcelain|Rice|Bamboo|Lacquer|Salt|Paper|Ink",
    C: "Dragon King|Immortal|Fox Spirit|Kylin|Jade Maiden|Sleeping Scholar",
    D: "Walled Town;AN-MD|Granary;AN-MD|Watchtower;AN-MD|Mulberry Grove;AN-MD|Terraced Field;AN-MD|Pagoda;MD|Examination Hall;MD|Tea Garden;EM-ST|Treaty Port;EM-ST|Silk Mill;ST-MO|Reservoir;ST-MO|Special Zone;MO|Wind Farm;MO|Ski Resort;MO",
  },
  water: {
    B: "Carp|Pearl|Silk|Salt|Tea|Junk|Lotus|Rice|Porcelain|Shrimp",
    C: "Dragon King|Drowned City|River Ghost|Phantom Junk|Sea Immortal|Pearl Maiden",
    D: "Fish Weir;AN-MD|Canal Lock;AN-MD|Salt Works;AN-MD|Ferry Landing;MD|Junk Yard;MD|Customs House;EM-ST|Bund;EM-ST|Steamer Wharf;ST-MO|Dam Lake;ST-MO|Container Port;MO|Marina;MO|Ferry Terminal;MO",
  },
  route: {
    N: "Imperial Road|Grand Canal Towpath|Pilgrim Road|Post Road|Tea Road|Mountain Pass",
    B: "Silk|Tea|Salt|Jade|Imperial|Pilgrims'|Horse|Porcelain",
    C: "Ghost|Dragon's|Fox's|Phantom|Winged|Immortal's",
    D: "Imperial Road;AN-MD|Post Road;AN-MD|Pilgrim Road;AN-MD|Canal Towpath;AN-MD|Tea Road;MD|Horse Road;MD|Treaty Road;EM-ST|Telegraph Road;EM-ST|Railway Line;ST-MO|Trunk Road;ST-MO|Expressway;MO|Ring Road;MO|High-Speed Line;MO",
  },
  sacred: {
    N: "Holy Spring|Temple Mountain|Ancestral Tomb|Shrine|Pagoda|Tomb",
    B: "Sage's|Pilgrims'|Healing|Holy|Immortal's|Ancestral",
    C: "Fox's|Enchanted|Dragon King's|Buried|Phantom",
    D: "Holy Spring;AN-MD|Spirit Way;AN-MD|Ancestral Hall;AN-MD|Cliff Temple;AN-MD|Pagoda;MD|Mountain Temple;MD|Scholar's Tomb;EM-ST|Memorial Archway;EM-ST|Great Temple;ST-MO|Heroes' Garden;ST-MO|Pilgrimage Square;MO",
  },
});
