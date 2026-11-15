import { framesOf } from "./lib.mjs";
// Cornish (§7): the generic first ("Cove of Saint Piran"); saints, tin and clay, mines and engine houses, fishing coves.
export default {
  key: "cornish", keys: ["cornish"], label: "Cornish", frames: framesOf("first"),
  land: {
    N: {
      mountain: "Carn|Tor|Rocky Down|Granite Crag|Tin Hill|Beacon", wood: "Wooded Combe|Hazel Coppice|Oak Hanger|Valley Wood|Saint's Grove|Sallow Copse", moor: "Downs|Tinners' Moor|Moorstone|Bal|Rough Ground|Engine Moor",
      wet: "Withy Bed|Marsh Level|Pill|Reed Bed|Streamwork|Salt Marsh", grass: "Downland|Cliff Pasture|Sheep Down|Ley|Town Place|Green Lane", lands: "Hundred|Duchy|Manor|Stannary|Parish|Tithing",
      farm: "Barton|Churchtown|Fogou Field|Cornfield|Croft|Tin Farm", hill: "Combe|Hill Fort|Round|Beacon Hill|Rocky Brow|Hollow", river: "Combe Stream|Leat|Saint's Well|Mill Leat|Pool|Waterwheel Pit",
    },
    B: "Tin|Copper|Clay|Arsenic|Pilchard|Granite|Gorse|Furze|Wheal|Engine",
    C: "Knocker|Piskie|Giant|Spriggan|Mermaid|Wrecker's Ghost",
    D: "Hill Fort;AN-MD|Round;AN-MD|Fogou;AN-MD|Standing Stone;AN-MD|Holy Well;AN-MD|Saint's Chapel;AN-MD|Church Town;MD|Tinners' Bounds;MD|Engine House;EM-MO|Tin Mine;EM-MO|China Clay Pit;EM-MO|Clay Tip;EM-MO|Mine Stack;EM-MO|Wheal;EM-MO|Quarry;EM-MO",
  },
  water: {
    N: { sea: "Pool|Roads|Haven|Narrows|Sound|River Mouth", coast: "Cove|Harbour|Headland|Island|Zawn|Sea Cliff", chart: "Shoal|Ledge|Rock|Race|Bank|Reef" },
    B: "Pilchard|Tin|Copper|Slate|Saffron|Smuggler's|Wrecker's|Seine|Gig|Lugger",
    C: "Mermaid|Drowned Bell|Lyonnesse|Wreck Ghost|Spriggan|Giant",
    D: "Fish Cellar;AN-MD|Saint's Landing;AN-MD|Tinners' Landing;AN-MD|Cliff Castle;AN-MD|Holy Island;AN-MD|Beacon;AN-MD|Chapel Rock;MD|Fishing Cove;MD|Pilchard Cellar;EM-MO|Harbour;EM-MO|Lifeboat Slip;EM-MO|Mine Quay;EM-MO|Lighthouse;EM-MO|Engine Cove;EM-MO|Quay;EM-MO",
  },
  route: {
    N: "Lane|Hollow Way|Tin Road|Saints' Way|Coffin Path|Track", B: "Tin|Copper|Clay|Pilchard|Fish|Pack|Miners'|Church|Saints'|Coffin",
    C: "Piskie|Knockers'|Giants'|Wreckers'|Spriggan|Phantom Coach",
    D: "Saints' Way;AN-MD|Ridgeway;AN-MD|Church Path;AN-MD|Tinners' Track;AN-MD|Ford Lane;AN-MD|Cliff Path;AN-MD|Coffin Path;MD|Market Way;MD|Turnpike;EM-ST|Toll Road;EM-ST|Mail Coach Road;EM-ST|Packhorse Road;EM-ST|Tramway;EM-ST|Mine Road;EM-ST|Mineral Railway;ST-MO|Branch Line;ST-MO|Viaduct;ST-MO|Harbour Line;ST-MO|Station Road;ST-MO|Clay Line;ST-MO|Bypass;MO|Link Road;MO",
  },
  sacred: {
    N: "Holy Well|Saint's Well|Chapel|Hermit's Cell|Standing Stone|Cross", B: "Saint's|Healing|Holy|Pilgrim|Drowned|Hermit's",
    C: "Giant's|Piskie|Knockers'|Drowned|Mermaid's",
    D: "Fogou;AN-MD|Stone Circle;AN-MD|Holy Well;AN-MD|Quoit;AN-MD|Cliff Chapel;AN-MD|Hermit's Cell;AN-MD|Oratory;MD|Monastery;MD|Wayside Cross;EM-ST|Parish Church;EM-ST|Mission Chapel;EM-ST|Mariners' Chapel;EM-ST|Methodist Chapel;EM-ST|Holy Well House;EM-ST|Miners' Chapel;ST-MO|Revival Chapel;ST-MO|Memorial Hall;ST-MO|Lifeboat Chapel;ST-MO|Cemetery Chapel;ST-MO|Fishermen's Mission;ST-MO|Garden of Remembrance;MO|Crematorium Chapel;MO",
  },
};
