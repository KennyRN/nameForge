import { framesOf } from "./lib.mjs";
// Irish (§7): names by saints, chieftains and the land ("Holy Well of Brigid", "Bog Road", "Mag's Plain").
export default {
  key: "irish", keys: ["irish"], label: "Irish",
  frames: framesOf("first", { land: [["{N} of {person}'s Clan", 3, "per"], ["{holy:poss} {N}", 4, "sai"]], water: [["{holy:poss} {N}", 4, "sai"]] }),
  land: {
    N: {
      mountain: "Mountain Gap|Rock Face|Hill of the Fort|Cairn Hill|Mountain Pass|Round Hill", wood: "Oak Wood|Hazel Wood|Holy Grove|Fairy Thorn|Wooded Island|Yew Wood", moor: "Blanket Bog|Mountain Bog|Turf Moor|Bog Road|Heath Hill|Turf Bank",
      wet: "Bog|Turlough|Callow|Reed Fen|Wet Meadow|Flooded Plain", grass: "Plain|Green Meadow|Cow Pasture|Mag|Long Meadow|Hill Pasture", lands: "Kingdom|Territory|Barony|Townland|Lordship|Province",
      farm: "Townland|Rath|Ringfort|Cow Field|Summer Pasture|Potato Garden", hill: "Hill|Esker|Drumlin|Hillock|Fort Hill|Rocky Hill", river: "Holy Well|Ford|Mill Race|Lake Island|Spring|Falls",
    },
    B: "Turf|Peat|Cattle|Black Cattle|Hazel|Yew|Blackthorn|Heather|Rushes|Limestone",
    C: "Banshee|Pooka|Fairy|Giant|Fionn's|Warrior's Ghost",
    D: "Ringfort;AN-MD|Standing Stone;AN-MD|Crannog;AN-MD|Passage Tomb;AN-MD|Hill Fort;AN-MD|Holy Well;AN-MD|Monastic Site;MD|Round Tower;MD|Tower House;EM-MO|Famine Road;EM-MO|Workhouse;EM-MO|Landlord's Lodge;EM-MO|Creamery;EM-MO|Bog Railway;EM-MO|Peat Works;EM-MO",
  },
  water: {
    N: { sea: "Lough|Bay|Sound|Narrows|Estuary|Haven", coast: "Strand|Head|Island|Sea Stack|Cove|Pier", chart: "Bank|Rock|Race|Shoal|Reef|Ledge" },
    B: "Salmon|Herring|Seaweed|Kelp|Turf|Currach|Pilgrims'|Saint's|Mackerel|Eel",
    C: "Selkie|Merrow|Sea Giant|Drowned Kingdom|Water Horse|Pooka",
    D: "Island Hermitage;AN-MD|Fish Weir;AN-MD|Sea Fort;AN-MD|Holy Island;AN-MD|Pilgrim Landing;AN-MD|Beehive Cell;AN-MD|Monks' Landing;MD|Viking Harbour;MD|Coastguard Station;EM-MO|Famine Pier;EM-MO|Lifeboat Station;EM-MO|Harbour Wall;EM-MO|Lighthouse;EM-MO|Emigrant Quay;EM-MO|Ferry Slip;EM-MO",
  },
  route: {
    N: "Bog Road|Hollow Way|Pilgrim Road|Cattle Road|Green Road|Boreen", B: "Turf|Cattle|Pilgrims'|Saint's|Butter|Salt|Peat|Cow|Hazel|Slate",
    C: "Fairy|Banshee's|Giants'|Phantom|Warriors'|Pooka's",
    D: "Pilgrim Road;AN-MD|Royal Road;AN-MD|Cattle Road;AN-MD|Fort Road;AN-MD|Ford Road;AN-MD|Saint's Road;AN-MD|Monks' Way;MD|Esker Road;MD|Mail Coach Road;EM-ST|Turnpike;EM-ST|Famine Road;EM-ST|Bog Road;EM-ST|Canal Towpath;EM-ST|Mass Path;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Station Road;ST-MO|Viaduct;ST-MO|Narrow Gauge Line;ST-MO|Bog Railway;ST-MO|Motorway;MO|Bypass;MO",
  },
  sacred: {
    N: "Holy Well|Holy Island|Sacred Hill|Pilgrim Station|Standing Stone|Monastic Site", B: "Saint's|Healing|Pilgrim|Holy|Fairy|Penitential",
    C: "Fairy|Giant's|Banshee's|Drowned|Otherworld",
    D: "Passage Tomb;AN-MD|Sacred Hill;AN-MD|Holy Well;AN-MD|Stone Circle;AN-MD|Sacred Tree;AN-MD|Fairy Fort;AN-MD|Monastic Site;MD|Round Tower;MD|Penal Mass Rock;EM-ST|Pilgrim Station;EM-ST|Parish Chapel;EM-ST|Holy Well Shrine;EM-ST|Mass House;EM-ST|Wayside Shrine;EM-ST|Grotto;ST-MO|Cathedral;ST-MO|Roadside Shrine;ST-MO|Memorial Hall;ST-MO|Pilgrimage Basilica;ST-MO|Holy Mountain Path;ST-MO|Garden of Remembrance;MO|Crematorium Chapel;MO",
  },
};
