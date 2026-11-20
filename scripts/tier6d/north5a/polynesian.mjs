// Polynesian (brief 6d): islands, lagoons and reefs, voyaging canoes and star paths, the marae and the meeting house, taro terraces, the mission station and the port town, the island states. No desert and no moor (the islands have neither of their own).
import { buildCulture } from "./build.mjs";
export default buildCulture({
  key: "polynesian", label: "Polynesian", style: "lastB", noDesert: true, noMoor: true,
  mods: { A: ["Coral", "Canoe", "Reef", "Star", "Lagoon", "Taro"], B: ["Mission", "Whaling", "Plantation", "Coconut", "Harbour", "Trading"], C: ["Airport", "Resort", "Phosphate", "Cruise"], F: ["Shark Spirit", "Hidden Island", "Sea Serpent", "Little People"] },
  land: {
    B: "Taro|Coconut|Breadfruit|Banana|Sugar|Pearl|Kava|Fern|Copra|Fish",
    C: "Shark Spirit|Hidden Island|Sea Serpent|Little People|Sleeping Giant|Drowned Valley",
    D: "Taro Terrace;AN-MD|Fishpond;AN-MD|Meeting Ground;AN-MD|Sacred Grove;AN-MD|Lava Field;AN-MD|Mission Station;EM-ST|Sugar Plantation;EM-ST|Whaling Station;EM-ST|Cannery;ST-MO|Reservoir;ST-MO|Golf Resort;MO|Wind Farm;MO|Solar Park;MO",
  },
  water: {
    B: "Fish|Turtle|Shell|Pearl|Coral|Shark|Tuna|Canoe|Whale|Lobster",
    C: "Sea Serpent|Drowned Village|Shark Spirit|Phantom Canoe|Whale Rider|Little People",
    D: "Canoe Landing;AN-MD|Fish Trap;AN-MD|Star Path Rock;AN-MD|Reef Passage;MD|Launching Beach;MD|Mission Wharf;EM-ST|Whaling Bay;EM-ST|Jetty;ST-MO|Cannery Wharf;ST-MO|Marina;MO|Resort Beach;MO|Container Port;MO",
  },
  route: {
    N: "Canoe Path|Reef Passage|Star Path|Footpath|Mission Road|Coast Road",
    B: "Taro|Coconut|Sandalwood|Pearl|Fish|Pilgrims'|Traders'|Copra",
    C: "Ghost|Shark Spirit's|Sea Serpent's|Phantom|Little People's|Lost",
    D: "Canoe Path;AN-MD|Star Path;AN-MD|Reef Passage;AN-MD|Footpath;AN-MD|Ridge Trail;MD|Mission Road;EM-ST|Coast Road;EM-ST|Plantation Track;EM-ST|Ferry Route;ST-MO|Railway Line;ST-MO|Highway;MO|Ring Road;MO|Flight Path;MO",
  },
  sacred: {
    N: "Marae|Holy Spring|Shrine|Cave|Sacred Hill|Burial Ground",
    B: "Sacred|Pilgrims'|Healing|Holy|Chief's|Shark's",
    C: "Shark Spirit's|Enchanted|Sea Serpent's|Buried|Phantom",
    D: "Marae;AN-MD|Sacred Spring;AN-MD|Cave Shrine;AN-MD|Chief's Rock;AN-MD|Priest's House;MD|Mission Church;EM-ST|Chapel;EM-ST|Pilgrimage Church;EM-ST|Great Church;ST-MO|Memorial Garden;ST-MO|Gathering Ground;MO",
  },
});
