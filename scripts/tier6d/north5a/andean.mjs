// Andean (brief 6d): terraces and the road system, waystations and the four quarters, llama and alpaca herds, highland lakes and mountains held sacred (as landscape, never as gods' names); mining towns and reductions under saints' names; the republics; the coastal desert.
import { buildCulture } from "./build.mjs";
export default buildCulture({
  key: "andean", label: "Andean", style: "first",
  mods: { A: ["Terrace", "Condor", "Llama", "Stone", "Sacred", "Cloud"], B: ["Silver", "Mission", "Mining", "Colonial", "Viceroy's", "Mule"], C: ["Railway", "Highway", "Copper", "Border"], F: ["Mountain Spirit", "Hidden City", "Serpent", "Puma"] },
  desertMods: { A: ["Fog", "Dry", "Stony", "Salt", "Sand", "Condor"], B: ["Silver", "Mission", "Guano", "Frontier", "Mule", "Colonial"], C: ["Nitrate", "Highway", "Solar", "Border"], F: ["Mountain Spirit", "Lost Caravan", "Serpent", "Skeleton"] },
  land: {
    B: "Potato|Quinoa|Maize|Coca|Silver|Tin|Copper|Wool|Salt|Alpaca",
    C: "Mountain Spirit|Hidden City|Serpent King|Sleeping Puma|Condor Lord|Lost Llama",
    D: "Terrace;AN-MD|Stone Stair;AN-MD|Storehouse;AN-MD|Llama Pasture;AN-MD|Sacred Rock;AN-MD|Silver Mine;EM-ST|Mission;EM-ST|Reduction;EM-ST|Copper Mine;ST-MO|Reservoir;ST-MO|Ski Slope;MO|Wind Farm;MO|Solar Park;MO",
  },
  water: {
    B: "Trout|Frog|Salt|Reed|Duck|Totora|Guano|Canoe|Pearl|Shrimp",
    C: "Lake Serpent|Drowned City|Reed Boat Ghost|Sun Island Spirit|Water Puma|Phantom Fleet",
    D: "Reed Boat Landing;AN-MD|Fish Weir;AN-MD|Floating Island;AN-MD|Salt Pan;MD|Quay;MD|Customs House;EM-ST|Guano Wharf;EM-ST|Jetty;ST-MO|Dam;ST-MO|Marina;MO|Resort Beach;MO|Container Port;MO",
  },
  route: {
    N: "Royal Road|Runners' Road|Mule Road|Pilgrim Road|Pass Road|Post Road",
    B: "Silver|Wool|Coca|Salt|Potato|Pilgrims'|Merchants'|Llama",
    C: "Ghost|Mountain Spirit's|Serpent's|Phantom|Puma|Lost",
    D: "Royal Road;AN-MD|Runners' Road;AN-MD|Rope Bridge;AN-MD|Pilgrim Road;AN-MD|Salt Road;MD|Silver Road;EM-ST|Mule Road;EM-ST|Post Road;EM-ST|Railway Line;ST-MO|Canal Road;ST-MO|Highway;MO|Ring Road;MO|Cable Car;MO",
  },
  sacred: {
    N: "Sacred Rock|Holy Spring|Shrine|Cave|Holy Mountain|Tomb",
    B: "Sacred|Pilgrims'|Healing|Holy|Priest's|Condor's",
    C: "Mountain Spirit's|Enchanted|Serpent's|Buried|Phantom",
    D: "Sacred Rock;AN-MD|Holy Spring;AN-MD|Mountain Shrine;AN-MD|Stone Seat;AN-MD|Priest's House;MD|Wayside Cross;EM-ST|Chapel;EM-ST|Pilgrimage Church;EM-ST|Great Cathedral;ST-MO|Memorial Garden;ST-MO|Pilgrimage Square;MO",
  },
});
