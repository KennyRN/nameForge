// Indian (brief 6c): the subcontinent in every era: river ghats and tanks, stepwells, temple towns, hill forts, bazaars and caravanserais, the Mughal garden, cantonments and hill stations, the Thar.
import { buildCulture } from "./build.mjs";
export default buildCulture({
  key: "indian", label: "Indian", style: "firstB",
  mods: { A: ["Banyan", "Elephant", "Temple", "Pilgrim", "Cobra", "Peacock"], B: ["Mughal", "Garrison", "Caravan", "Tea", "Monsoon", "Cantonment"], C: ["Railway", "Hill-Station", "Dam", "Highway"], F: ["Naga", "Yaksha", "Rakshasa", "Apsara"] },
  // Brief 6d A1: the modifiers a desert module takes (no banyans or temples on the dunes).
  desertMods: { A: ["Camel", "Salt", "Stony", "Sandstone", "Mirage", "Thorn"], B: ["Caravan", "Frontier", "Garrison", "Mughal", "Nawab's", "Trade-Route"], C: ["Canal", "Solar", "Border", "Highway"], F: ["Naga", "Yaksha", "Rakshasa", "Apsara"] },
  land: {
    B: "Pepper|Cardamom|Silk|Cotton|Indigo|Tea|Rice|Spice|Sandalwood|Jute",
    C: "Naga|Yaksha|Rakshasa|Apsara|Serpent King|Sleeping Sage",
    D: "Stepwell;AN-MD|Temple Tank;AN-MD|Hill Fort;AN-MD|Banyan Grove;AN-MD|Ashram;AN-MD|Serai;MD|Mughal Garden;MD|Tea Estate;EM-ST|Cantonment;EM-ST|Mill;ST-MO|Reservoir;ST-MO|Hill Station;MO|Wind Farm;MO|Solar Park;MO",
  },
  water: {
    B: "Pearl|Spice|Cotton|Fish|Coconut|Salt|Dhow|Pepper|Rice|Jute",
    C: "Sea Serpent|Naga Queen|Drowned City|Phantom Dhow|Sea Rakshasa|Pearl Maiden",
    D: "Fish Weir;AN-MD|Ghat;AN-MD|Salt Pan;AN-MD|Royal Landing;MD|Dhow Yard;MD|Customs House;EM-ST|Pearl Bank;EM-ST|Jetty;ST-MO|Cotton Dock;ST-MO|Marine Drive;MO|Marina;MO|Container Port;MO",
  },
  route: {
    N: "Royal Road|Caravan Road|Pilgrim Road|Grand Trunk Road|Ghat Road|Post Road",
    B: "Spice|Cotton|Silk|Pepper|Pilgrims'|Royal|Salt|Tea",
    C: "Ghost|Naga's|Yaksha's|Phantom|Winged|Serpent",
    D: "Royal Road;AN-MD|Pilgrim Road;AN-MD|Caravan Road;AN-MD|Ghat Road;AN-MD|Salt Road;MD|Mughal Road;MD|Post Road;EM-ST|Trunk Road;EM-ST|Railway Line;ST-MO|Canal Road;ST-MO|Expressway;MO|Ring Road;MO|Metro Line;MO",
  },
  sacred: {
    N: "Temple Tank|Holy Spring|Ghat|Shrine|Hermitage|Tomb",
    B: "Saint's|Pilgrims'|Healing|Holy|Sage's|Banyan",
    C: "Naga's|Enchanted|Yaksha's|Buried|Phantom",
    D: "Temple Tank;AN-MD|Holy Spring;AN-MD|Bathing Ghat;AN-MD|Banyan Shrine;AN-MD|Hermitage;MD|Stepwell Shrine;MD|Saint's Tomb;EM-ST|Mughal Tomb;EM-ST|Great Temple;ST-MO|Memorial Garden;ST-MO|Pilgrimage Square;MO",
  },
});
