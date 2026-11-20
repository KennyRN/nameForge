// Aztec (brief 6d): the lake city and its causeways, chinampas, markets, temple precincts and the eagle and jaguar orders; the colonial layer of missions, haciendas and silver; modern Mexico; the dry north.
import { buildCulture } from "./build.mjs";
export default buildCulture({
  key: "aztec", label: "Aztec", style: "firstB",
  mods: { A: ["Lake", "Causeway", "Eagle", "Jaguar", "Reed", "Floating"], B: ["Mission", "Silver", "Hacienda", "Colonial", "Cathedral", "Mule"], C: ["Railway", "Border", "Oil", "Highway"], F: ["Feathered Serpent", "Eagle Warrior", "Jaguar Warrior", "Obsidian"] },
  desertMods: { A: ["Cactus", "Dust", "Stony", "Salt", "Eagle", "Thorn"], B: ["Silver", "Mule", "Frontier", "Mission", "Hacienda", "Trail"], C: ["Border", "Oil", "Highway", "Solar"], F: ["Feathered Serpent", "Obsidian", "Jaguar Warrior", "Skeleton"] },
  land: {
    B: "Maize|Cacao|Cotton|Obsidian|Feather|Salt|Amaranth|Chili|Copal|Silver",
    C: "Feathered Serpent|Eagle Warrior|Jaguar Warrior|Obsidian Lord|Weeping Woman|Sleeping Volcano",
    D: "Chinampa;AN-MD|Floating Garden;AN-MD|Reed Bed;AN-MD|Terraced Hill;AN-MD|Market Island;AN-MD|Hacienda;EM-ST|Silver Mine;EM-ST|Mission;EM-ST|Mill;ST-MO|Reservoir;ST-MO|Collective Farm;MO|Wind Farm;MO|Solar Park;MO",
  },
  water: {
    B: "Fish|Frog|Salt|Reed|Duck|Axolotl|Maize|Canoe|Pearl|Shrimp",
    C: "Lake Serpent|Drowned Temple|Weeping Woman|Phantom Canoe|Feathered Serpent|Water Jaguar",
    D: "Canoe Landing;AN-MD|Fish Weir;AN-MD|Floating Garden;AN-MD|Salt Pan;MD|Causeway Gate;MD|Customs House;EM-ST|Mission Harbour;EM-ST|Jetty;ST-MO|Dam;ST-MO|Marina;MO|Resort Beach;MO|Container Port;MO",
  },
  route: {
    N: "Causeway|Merchant Road|Pilgrim Road|Royal Road|Mule Road|Post Road",
    B: "Cacao|Cotton|Salt|Silver|Obsidian|Pilgrims'|Merchants'|Feather",
    C: "Ghost|Weeping Woman's|Feathered Serpent's|Phantom|Jaguar|Obsidian",
    D: "Causeway;AN-MD|Merchant Road;AN-MD|Pilgrim Road;AN-MD|Royal Road;AN-MD|Salt Road;MD|Silver Road;EM-ST|Mule Road;EM-ST|Post Road;EM-ST|Railway Line;ST-MO|Canal Road;ST-MO|Highway;MO|Ring Road;MO|Metro Line;MO",
  },
  sacred: {
    N: "Temple Mound|Holy Spring|Shrine|Cave|Sacred Hill|Tomb",
    B: "Sacred|Pilgrims'|Healing|Holy|Priest's|Eagle's",
    C: "Weeping Woman's|Enchanted|Feathered Serpent's|Buried|Phantom",
    D: "Temple Mound;AN-MD|Sacred Spring;AN-MD|Cave Shrine;AN-MD|Hill Altar;AN-MD|Priest's House;MD|Wayside Cross;EM-ST|Chapel;EM-ST|Pilgrimage Church;EM-ST|Great Cathedral;ST-MO|Memorial Garden;ST-MO|Pilgrimage Square;MO",
  },
});
