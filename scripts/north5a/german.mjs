import { framesOf } from "./lib.mjs";
// German (§7): castles, marks and forests ("Hawk Castle Wood", "Salt Road", "Castle Hill"), in English.
export default {
  key: "german", keys: ["german"], label: "German",
  frames: framesOf("last", { land: [["{beast} Castle {N}", 3, "crt"], ["{N} of the {B}", 2, "work"]], water: [["{beast} Castle {N}", 2, "crt"]], route: [["trade", "{B} Road", 4]] }),
  land: {
    B: "Salt|Wine|Iron|Silver|Beech|Pine|Mill|Brick|Amber|Hunting",
    C: "Wild Hunt|Erlking|Kobold|Dwarf|Wood Spirit|Water Sprite",
    D: "Hill Fort;AN-MD|Ring Wall;AN-MD|Roman Watchtower;AN-MD|Sacred Grove;AN-MD|Burial Mound;AN-MD|Thing Place;AN-MD|Castle Ruin;MD|Monastery Farm;MD|Mine Shaft;EM-MO|Smelter;EM-MO|Spa Garden;EM-MO|Brickworks;EM-MO|Motorway Cutting;EM-MO|Pumped Dam;EM-MO|Quarry;EM-MO",
  },
  water: {
    B: "Salt|Herring|Amber|Brick|Dyke|Hansa|Cog|Wool|Wine|Shrimp",
    C: "Water Sprite|Sea Wife|Drowned Town|Kobold|Wave Giant|Ghost Ship",
    D: "Cog Harbour;AN-MD|Fish Weir;AN-MD|Salt Pan;AN-MD|Hanse Quay;AN-MD|Beacon;AN-MD|Island Hermitage;AN-MD|Merchant Landing;MD|Dyke Gate;MD|Lighthouse;EM-MO|Steam Ferry Quay;EM-MO|Seaside Pier;EM-MO|Naval Base;EM-MO|Canal Lock;EM-MO|Spa Beach;EM-MO|Container Terminal;EM-MO",
  },
  route: {
    B: "Salt|Wine|Amber|Iron|Pilgrims'|Merchants'|Emperor's|Post|Coach|Cloth",
    C: "Wild Hunt's|Erlking's|Kobold|Giants'|Phantom|Robber Knight's",
    D: "Salt Road;AN-MD|Roman Limes Road;AN-MD|Amber Road;AN-MD|Hanse Road;AN-MD|Ford Road;AN-MD|Pilgrim Way;AN-MD|Emperor's Road;MD|Market Road;MD|Post Road;EM-ST|Coach Road;EM-ST|Paved Road;EM-ST|Canal Towpath;EM-ST|Toll Road;EM-ST|Military Road;EM-ST|Railway Line;ST-MO|Ore Line;ST-MO|Branch Line;ST-MO|Station Road;ST-MO|Viaduct;ST-MO|Cog Railway;ST-MO|Motorway;MO|Ring Road;MO",
  },
  sacred: {
    B: "Saint's|Healing|Pilgrim|Holy|Imperial|Miners'",
    C: "Wild Hunt's|Giant's|Kobold's|Wood Spirit's|Erlking's",
    D: "Sacred Grove;AN-MD|Thing Place;AN-MD|Standing Stone;AN-MD|Holy Spring;AN-MD|Oak of the Gods;AN-MD|Burial Mound;AN-MD|Cathedral;MD|Monastery;MD|Parish Church;EM-ST|Pilgrim Chapel;EM-ST|Wayside Shrine;EM-ST|Calvary Hill;EM-ST|Baroque Chapel;EM-ST|Mining Chapel;EM-ST|Spa Chapel;ST-MO|Memorial Church;ST-MO|Cemetery Chapel;ST-MO|Mission House;ST-MO|Garden of Remembrance;ST-MO|Memorial Hall;ST-MO|Crematorium Chapel;MO|Interfaith Room;MO",
  },
};
