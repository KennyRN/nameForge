import { framesOf } from "./lib.mjs";
// Scandinavian (§7): the later period, early modern to interstellar: mines, forests, lakes, farms, railways and fjord ferries.
export default {
  key: "scandinavian", keys: ["scandinavian"], label: "Scandinavian",
  frames: framesOf("last", { land: [["{person:poss} {N}", 3, "per"]], water: [["{person:poss} {N}", 3, "per"]] }),
  land: {
    N: {
      mountain: "Fell|Peak|Ridge|Plateau|Rock Face|Saddle", wood: "Forest|Pine Forest|Birch Wood|Beech Wood|Clearing|Logging Road", moor: "Fell Moor|Heath|Mire|Bog|Tundra|Reindeer Moor",
      wet: "Mire|Bog|Marsh|Wet Meadow|Reed Lake|Flood Plain", grass: "Meadow|Field|Pasture|Heath Meadow|Summer Farm|Mountain Pasture", lands: "County|Province|Parish|Kingdom|Duchy|Municipality",
      farm: "Farm|Croft|Steading|Home Farm|Summer Farm|Smallholding", hill: "Hill|Ridge|Esker|Moraine|Knoll|Rock", river: "Falls|Lake|Rapids|Stream|River Mouth|Spring",
    },
    B: "Iron|Copper|Silver|Pine|Birch|Timber|Tar|Reindeer|Herring|Granite",
    C: "Troll|House Goblin|Forest Maiden|Giant|Forest Spirit|Water Sprite",
    D: "Mine Shaft;EM-MO|Silver Mine;EM-MO|Ironworks;EM-MO|Sawmill;EM-MO|Pulp Mill;EM-MO|Hydro Dam;EM-MO|Logging Camp;EM-MO|Beacon Hill;AN-MD|Rune Stone;AN-MD|Cairn;AN-MD|Ship Setting;AN-MD|Ring Fort;AN-MD|Burial Mound;AN-MD|Summer Farm;MD|Market Place;MD",
  },
  water: {
    N: { sea: "Fjord|Sound|Strait|Archipelago|Bay|Skerry Guard", coast: "Skerry|Holm|Ness|Island|Stack|Strand", chart: "Bank|Skerry|Shoal|Channel|Ledge|Reef" },
    B: "Herring|Cod|Salmon|Whale|Timber|Ore|Ice|Ferry|Lighthouse|Pilot",
    C: "Sea Troll|Kraken|Mermaid|Sea Serpent|Storm Giant|Water Sprite",
    D: "Fishing Station;AN-MD|Ship Harbour;AN-MD|Beach Market;AN-MD|Beacon;AN-MD|Boat Shed;AN-MD|Whaling Strand;AN-MD|Trading Quay;MD|Stockfish Rack;MD|Lighthouse;EM-MO|Timber Float;EM-MO|Steam Ferry Quay;EM-MO|Cannery;EM-MO|Canal Lock;EM-MO|Pilot Station;EM-MO|Oil Terminal;EM-MO",
  },
  route: {
    N: "Road|Way|Path|Track|Pass Road|Ferry Way", B: "Timber|Ore|Iron|Fish|Reindeer|Post|Ferry|Mail|Mining|Tourist",
    C: "Troll|Goblin's|Forest Maiden's|Giants'|Forest|Phantom",
    D: "Ridge Road;AN-MD|Thing Way;AN-MD|Ford Way;AN-MD|Pilgrim Way;AN-MD|Fur Trail;AN-MD|Ship Haul;AN-MD|Church Path;MD|Market Road;MD|Post Road;EM-ST|Coach Road;EM-ST|Timber Road;EM-ST|Mining Road;EM-ST|Canal Towpath;EM-ST|Float Way;EM-ST|Railway Line;ST-MO|Ore Line;ST-MO|Branch Line;ST-MO|Station Road;ST-MO|Viaduct;ST-MO|Ferry Road;ST-MO|Motorway;MO|Tunnel Road;MO",
  },
  sacred: {
    N: "Church|Holy Well|Holy Mountain|Stone Church|Cairn|Pilgrim Path", B: "Saint's|Healing|Holy|Pilgrim|Miners'|Seamen's",
    C: "Troll's|Giant's|Elf|Forest Maiden's|Goblin's",
    D: "Rune Stone;AN-MD|Burial Mound;AN-MD|Sacred Grove;AN-MD|Sacred Spring;AN-MD|Holy Mountain;AN-MD|Cairn;AN-MD|Stave Church;MD|Hermitage;MD|Parish Church;EM-ST|Mining Church;EM-ST|Seamen's Church;EM-ST|Wayside Cross;EM-ST|Pietist Hall;EM-ST|Prayer House;EM-ST|Free Church;ST-MO|Cathedral;ST-MO|Cemetery Chapel;ST-MO|Memorial Stone;ST-MO|Folk High School Chapel;ST-MO|Mission House;ST-MO|Crematorium Chapel;MO|Forest Chapel;MO",
  },
};
