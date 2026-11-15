import { framesOf } from "./lib.mjs";
// Norse (§7): the Viking age and the medieval north: farms, things, kin and longships ("Thing Field", "Ulf's Farm Holm").
export default {
  key: "norse", keys: ["norse"], label: "Norse",
  frames: framesOf("last", { land: [["{person:poss} Farm {N}", 3, "per"], ["{N} of the {folk}", 2, "ppl"]], water: [["{person:poss} Farm {N}", 3, "per"]], route: [["road", "{person:poss} {N}", 3]]}),
  land: {
    B: "Thing|Longship|Wolf|Raven|Bear|Iron|Silver|Amber|Thor's|Odin's",
    C: "Troll|Walking Dead|Giant|Elf|Wyrm|Valkyrie",
    D: "Thing Mound;AN-MD|Ship Setting;AN-MD|Rune Stone;AN-MD|Longhouse Site;AN-MD|Burial Mound;AN-MD|Ring Fort;AN-MD|Trading Place;MD|Law Rock;MD|Mining Pit;EM-MO|Charcoal Burners' Hut;EM-MO|Sawmill;EM-MO|Ironworks;EM-MO|Pulp Mill;EM-MO|Hydro Dam;EM-MO|Quarry;EM-MO",
  },
  water: {
    B: "Longship|Whale|Herring|Seal|Walrus|Fish|Stockfish|Raider's|Trader's|Thing",
    C: "Sea Serpent|Walking Dead|Kraken|Sea Troll|Wave Maiden|Storm Giant",
    D: "Ship Harbour;AN-MD|Landing Place;AN-MD|Beach Market;AN-MD|Ship Burial;AN-MD|Boat Shed;AN-MD|Whaling Strand;AN-MD|Trading Town Quay;MD|Fish Drying Rack;MD|Whaling Station;EM-MO|Steam Ferry Quay;EM-MO|Lighthouse;EM-MO|Cannery;EM-MO|Oil Rig Mooring;EM-MO|Fish Farm;EM-MO|Harbour Wall;EM-MO",
  },
  route: {
    B: "Thing|Longship|Trade|Fur|Amber|Iron|Silver|Raiders'|Merchants'|Pilgrims'",
    C: "Troll|Barrow Dead's|Giants'|Valkyrie's|Raven|Phantom",
    D: "Ridge Road;AN-MD|Thing Way;AN-MD|Ship Haul;AN-MD|Amber Road;AN-MD|Fur Trail;AN-MD|Ford Way;AN-MD|Pilgrim Way;MD|Church Path;MD|Post Road;EM-ST|Coach Road;EM-ST|Timber Road;EM-ST|Mining Road;EM-ST|Canal Towpath;EM-ST|Drove Road;EM-ST|Railway Line;ST-MO|Ore Line;ST-MO|Branch Line;ST-MO|Station Road;ST-MO|Viaduct;ST-MO|Ferry Road;ST-MO|Motorway;MO|Tunnel Road;MO",
  },
  sacred: {
    B: "Odin's|Thor's|Freyja's|Holy|Warriors'|Kin",
    C: "Troll's|Giant's|Valkyrie's|Elf|Barrow Dead's",
    D: "Ship Setting;AN-MD|Burial Mound;AN-MD|Rune Stone;AN-MD|Sacred Grove;AN-MD|Sacrifice Stone;AN-MD|Holy Spring;AN-MD|Temple;MD|Stave Church;MD|Parish Church;EM-ST|Pietist Meeting House;EM-ST|Wayside Cross;EM-ST|Seamen's Church;EM-ST|Mining Church;EM-ST|Pilgrim Path;EM-ST|Free Church;ST-MO|Cathedral;ST-MO|Cemetery Chapel;ST-MO|Memorial Stone;ST-MO|Mission House;ST-MO|Folk High School Chapel;ST-MO|Crematorium Chapel;MO|Garden of Remembrance;MO",
  },
};
