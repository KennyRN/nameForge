import { framesOf } from "./lib.mjs";
// Irish (§7): names by saints, chieftains and the land ("Holy Well of Brigid", "Bog Road", "Mag's Plain").
export default {
  key: "irish", keys: ["irish"], label: "Irish",
  frames: framesOf("first", { land: [["{N} of {person}'s Clan", 3, "per"], ["{holy:poss} {N}", 4, "sai"]], water: [["{holy:poss} {N}", 4, "sai"]] }),
  land: {
    B: "Turf|Peat|Cattle|Black Cattle|Hazel|Yew|Blackthorn|Heather|Rushes|Limestone",
    C: "Banshee|Pooka|Fairy|Giant|Fionn's|Warrior's Ghost",
    D: "Ringfort;AN-MD|Standing Stone;AN-MD|Crannog;AN-MD|Passage Tomb;AN-MD|Hill Fort;AN-MD|Holy Well;AN-MD|Monastic Site;MD|Round Tower;MD|Tower House;EM-MO|Famine Road;EM-MO|Workhouse;EM-MO|Landlord's Lodge;EM-MO|Creamery;EM-MO|Bog Railway;EM-MO|Peat Works;EM-MO",
  },
  water: {
    B: "Salmon|Herring|Seaweed|Kelp|Turf|Currach|Pilgrims'|Saint's|Mackerel|Eel",
    C: "Selkie|Merrow|Sea Giant|Drowned Kingdom|Water Horse|Pooka",
    D: "Island Hermitage;AN-MD|Fish Weir;AN-MD|Sea Fort;AN-MD|Holy Island;AN-MD|Pilgrim Landing;AN-MD|Beehive Cell;AN-MD|Monks' Landing;MD|Viking Harbour;MD|Coastguard Station;EM-MO|Famine Pier;EM-MO|Lifeboat Station;EM-MO|Harbour Wall;EM-MO|Lighthouse;EM-MO|Emigrant Quay;EM-MO|Ferry Slip;EM-MO",
  },
  route: {
    B: "Turf|Cattle|Pilgrims'|Saint's|Butter|Salt|Peat|Cow|Hazel|Slate",
    C: "Fairy|Banshee's|Giants'|Phantom|Warriors'|Pooka's",
    D: "Pilgrim Road;AN-MD|Royal Road;AN-MD|Cattle Road;AN-MD|Fort Road;AN-MD|Ford Road;AN-MD|Saint's Road;AN-MD|Monks' Way;MD|Esker Road;MD|Mail Coach Road;EM-ST|Turnpike;EM-ST|Famine Road;EM-ST|Bog Road;EM-ST|Canal Towpath;EM-ST|Mass Path;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Station Road;ST-MO|Viaduct;ST-MO|Narrow Gauge Line;ST-MO|Bog Railway;ST-MO|Motorway;MO|Bypass;MO",
  },
  sacred: {
    B: "Saint's|Healing|Pilgrim|Holy|Fairy|Penitential",
    C: "Fairy|Giant's|Banshee's|Drowned|Otherworld",
    D: "Passage Tomb;AN-MD|Sacred Hill;AN-MD|Holy Well;AN-MD|Stone Circle;AN-MD|Sacred Tree;AN-MD|Fairy Fort;AN-MD|Monastic Site;MD|Round Tower;MD|Penal Mass Rock;EM-ST|Pilgrim Station;EM-ST|Parish Chapel;EM-ST|Holy Well Shrine;EM-ST|Mass House;EM-ST|Wayside Shrine;EM-ST|Grotto;ST-MO|Cathedral;ST-MO|Roadside Shrine;ST-MO|Memorial Hall;ST-MO|Pilgrimage Basilica;ST-MO|Holy Mountain Path;ST-MO|Garden of Remembrance;MO|Crematorium Chapel;MO",
  },
};
