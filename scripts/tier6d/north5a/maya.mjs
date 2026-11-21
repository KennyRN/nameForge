// Maya (brief 6d): city-states, plazas and causeways (sacbe), cenotes and milpa, ball courts and stelae; highland and Yucatec towns under saints' names and haciendas; modern Guatemala and Yucatan; the dry north of the peninsula.
import { buildCulture } from "./build.mjs";
export default buildCulture({
  key: "maya", label: "Maya", style: "lastB",
  mods: { A: ["Jaguar", "Cenote", "Stela", "Sacred", "Jungle", "Limestone"], B: ["Mission", "Henequen", "Hacienda", "Colonial", "Chicle", "Mahogany"], C: ["Railway", "Resort", "Highway", "Coffee"], F: ["Underworld", "Twin Hunter", "Quetzal", "Bat Lord"] },
  desertMods: { A: ["Cactus", "Dry", "Stony", "Salt", "Limestone", "Thorn"], B: ["Henequen", "Mission", "Frontier", "Hacienda", "Trail", "Chicle"], C: ["Resort", "Highway", "Solar", "Border"], F: ["Underworld", "Bat Lord", "Twin Hunter", "Skeleton"] },
  land: {
    B: "Maize|Cacao|Cotton|Henequen|Chicle|Mahogany|Honey|Salt|Jade|Vanilla",
    C: "Underworld|Twin Hunter|Bat Lord|Quetzal King|Sleeping Jaguar|Hidden City",
    D: "Milpa;AN-MD|White Causeway;AN-MD|Ball Court;AN-MD|Stela Plaza;AN-MD|Limestone Quarry;AN-MD|Hacienda;EM-ST|Mission;EM-ST|Henequen Estate;EM-ST|Coffee Farm;ST-MO|Sawmill;ST-MO|Resort;MO|Biosphere Reserve;MO|Wind Farm;MO",
  },
  water: {
    B: "Fish|Turtle|Salt|Shell|Manatee|Jade|Cacao|Canoe|Pearl|Shrimp",
    C: "Cenote Serpent|Drowned City|Underworld Canoe|Phantom Dugout|Water Lily Maiden|Cave Crocodile",
    D: "Canoe Landing;AN-MD|Fish Weir;AN-MD|Salt Pan;AN-MD|Cenote Steps;MD|Trading Port;MD|Customs House;EM-ST|Mahogany Wharf;EM-ST|Jetty;ST-MO|Lighthouse;ST-MO|Marina;MO|Resort Beach;MO|Container Port;MO",
  },
  route: {
    N: "White Road|Causeway|Trade Road|Pilgrim Road|Mule Road|Chicle Trail",
    B: "Cacao|Salt|Jade|Honey|Mahogany|Pilgrims'|Merchants'|Feather",
    C: "Ghost|Underworld|Twin Hunter's|Phantom|Jaguar|Bat Lord's",
    D: "White Road;AN-MD|Causeway;AN-MD|Trade Road;AN-MD|Pilgrim Road;AN-MD|Salt Road;MD|Mule Road;EM-ST|Chicle Trail;EM-ST|Post Road;EM-ST|Railway Line;ST-MO|Canal Road;ST-MO|Highway;MO|Ring Road;MO|Bus Route;MO",
  },
  sacred: {
    N: "Cenote|Holy Spring|Shrine|Cave|Sacred Hill|Tomb",
    B: "Sacred|Pilgrims'|Healing|Holy|Priest's|Jaguar's",
    C: "Underworld|Enchanted|Twin Hunter's|Buried|Phantom",
    D: "Sacred Cenote;AN-MD|Cave Shrine;AN-MD|Stela Altar;AN-MD|Temple Steps;AN-MD|Priest's House;MD|Wayside Cross;EM-ST|Chapel;EM-ST|Pilgrimage Church;EM-ST|Great Cathedral;ST-MO|Memorial Garden;ST-MO|Pilgrimage Square;MO",
  },
});
