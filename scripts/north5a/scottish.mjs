import { framesOf } from "./lib.mjs";
// Scottish (§7): "Shieling", "Mull of", "Isle of"; the English of the Lowlands, the Highlands and the Isles, with the Scots words an English dictionary has.
export default {
  key: "scottish", keys: ["scottish"], label: "Scottish",
  frames: framesOf("last", { land: [["{N} of {town}", 3, "twn"], ["{N} of the {folk}", 3, "ppl"]], water: [["{N} of {town}", 3, "twn"]] }),
  land: {
    N: {
      mountain: "Munro|Ridge|Buttress|Shoulder|Corrie Rim|Rock Peak", wood: "Pinewood|Birch Wood|Caledonian Wood|Policy|Glen Wood|Deer Forest", moor: "Grouse Moor|Peat Moss|Deer Moor|Heather Hill|Rough Bounds|Muir",
      wet: "Moss|Flow|Carse|Loch Edge|Flats|Bog Pool", grass: "Machair|Links|Haugh|Straths|Sheep Hill|Park", lands: "Lordship|Earldom|Barony|Shire|Thanedom|Clan Lands",
      farm: "Shieling|Croft|Mains|Town|Runrig|Steading", hill: "Brae|Knowe|Hill|Dun|Law|Hillock", river: "Burn|Linn|Pool|Loch Side|Falls|Water",
    },
    B: "Peat|Heather|Whisky|Salmon|Sheep|Slate|Kelp|Deer|Pine|Birch",
    C: "Kelpie|Brownie|Selkie|Giant|Hag|Washerwoman Ghost",
    D: "Broch;AN-MD|Dun;AN-MD|Pictish Stone;AN-MD|Cairn;AN-MD|Crannog;AN-MD|Cup-marked Rock;AN-MD|Abbey Land;MD|Castle Hill;MD|Clearance Village;EM-MO|Distillery;EM-MO|Shooting Lodge;EM-MO|Drove Stance;EM-MO|Railway Viaduct;EM-MO|Hydro Dam;EM-MO|Forestry;EM-MO",
  },
  water: {
    N: { sea: "Firth|Sound|Passage|Loch|Kyle|Voe", coast: "Mull|Ness|Skerry|Isle|Geo|Stack", chart: "Bank|Skerry|Race|Ledge|Shoal|Reef" },
    B: "Herring|Salmon|Kelp|Peat|Whale|Seal|Cod|Lobster|Crofter's|Drifter",
    C: "Selkie|Kelpie|Blue Men|Sea Giant|Water Horse|Fin Folk",
    D: "Broch;AN-MD|Fish Trap;AN-MD|Pictish Fort;AN-MD|Holy Isle;AN-MD|Sea Cave;AN-MD|Norse Landing;AN-MD|Monks' Isle;MD|Ferry Point;MD|Herring Quay;EM-MO|Kelp Shore;EM-MO|Lighthouse;EM-MO|Drifter Harbour;EM-MO|Steamer Pier;EM-MO|Oil Terminal;EM-MO|Ferry Terminal;EM-MO",
  },
  route: {
    N: "Drove Road|Military Road|Hill Road|Coffin Road|Wynd|Kirk Road", B: "Drove|Cattle|Whisky|Peat|Kirk|Smugglers'|Salt|Wool|Coffin|Herring",
    C: "Kelpie's|Fairy|Giants'|Brownie's|Phantom|Hag's",
    D: "Drove Road;AN-MD|Pictish Way;AN-MD|Kirk Road;AN-MD|Ford Road;AN-MD|Hill Track;AN-MD|Ferry Road;AN-MD|Pilgrim Way;MD|Market Cross Road;MD|Military Road;EM-ST|Turnpike;EM-ST|Drove Stance Road;EM-ST|Coffin Road;EM-ST|Toll Road;EM-ST|Canal Towpath;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Viaduct;ST-MO|Station Road;ST-MO|Ferry Line;ST-MO|Postbus Road;ST-MO|Trunk Road;MO|Bypass;MO",
  },
  sacred: {
    N: "Standing Stones|Cairn|Holy Well|Chapel|Hermit's Cave|Kirk", B: "Saint's|Druid's|Healing|Holy|Fairy|Clan",
    C: "Fairy|Giant's|Kelpie's|Witch's|Selkie's",
    D: "Stone Circle;AN-MD|Standing Stone;AN-MD|Cup-marked Rock;AN-MD|Sacred Well;AN-MD|Cave Shrine;AN-MD|Pictish Symbol Stone;AN-MD|Celtic Cross;MD|Abbey;MD|Parish Kirk;EM-ST|Covenanters' Stone;EM-ST|Meeting House;EM-ST|Conventicle Hill;EM-ST|Free Kirk;EM-ST|Manse;EM-ST|Mission Hall;ST-MO|Cathedral;ST-MO|Memorial Cairn;ST-MO|Cemetery Chapel;ST-MO|Kirk Hall;ST-MO|War Memorial;ST-MO|Crematorium Chapel;MO|Garden of Remembrance;MO",
  },
};
