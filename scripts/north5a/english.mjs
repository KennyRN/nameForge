import { framesOf } from "./lib.mjs";
// English (§7): the Anglo-Saxon and Norman & British keys together; the generic last ("Oakdale"): fold, ley, wick, toft in English words.
export default {
  key: "english", keys: ["anglo-saxon", "norman-british"], label: "English",
  frames: framesOf("last", { land: [["{N} of the {tree}", 2, "flora"]], water: [["{N} of the {seaCreature}", 2, "crt"]] }),
  land: {
    N: {
      mountain: "Hog's Back|Saddle|High Top|Steep Rise|Rocky Brow|Beacon Top", wood: "Copse|Coppice|Greenwood|Wood Edge|Forest Bank|Grove Wood", moor: "Common|Waste|Moorland|Rough Pasture|Furze Hill|Gorse Common",
      wet: "Marsh Meadow|Water Meadow|Reed Bed|Flood Plain|Wet Level|Osier Bed", grass: "Meadow|Leaze|Green|Pasture|Hay Meadow|Home Close", lands: "Shire|Hundred|Riding|Manor|Liberty|Wapentake",
      farm: "Barton|Grange|Fold|Croft|Close|Furlong", hill: "Barrow|Beacon|Rise|Brow|Knoll|Mound", river: "Brook|Weir|Ford|Mill Stream|Spring|Pool",
    },
    B: "Oak|Ash|Wool|Barley|Hop|Clay|Chalk|Flint|Thorn|Honey",
    C: "Barrow Wight|Boggart|Black Dog|Green Man|Hob|Dragon",
    D: "Fortified Town;AN-MD|Moot Hill;AN-MD|Hundred Moot;AN-MD|Burial Mound;AN-MD|Ley Line;AN-MD|Roman Villa;AN-MD|Deer Park;MD|Abbey Grange;MD|Enclosure;EM-MO|Turnpike Cutting;EM-MO|Canal Cutting;EM-MO|Railway Embankment;EM-MO|Quarry;EM-MO|Reservoir;EM-MO|Bypass;EM-MO",
  },
  water: {
    N: { sea: "Reach|Roads|Haven|Wash|Sound|Narrows", coast: "Ness|Naze|Bill|Strand|Spit|Foreland", chart: "Bank|Sand|Ledge|Gat|Shoal|Race" },
    B: "Herring|Oyster|Cod|Salt|Smuggler's|Sail|Wool|Coal|Shingle|Samphire",
    C: "Drowned Church|Black Shuck|Mermaid|Sea Hag|Sunken Bell|Hobman",
    D: "Fish Weir;AN-MD|Hythe;AN-MD|Beach Market;AN-MD|Saxon Shore Fort;AN-MD|Trading Port;AN-MD|Longship Landing;AN-MD|Staithe;MD|Cinque Port;MD|Lifeboat Station;EM-MO|Martello Tower;EM-MO|Seaside Pier;EM-MO|Lighthouse;EM-MO|Coastguard Cottages;EM-MO|Promenade;EM-MO|Marina;EM-MO",
  },
  route: {
    N: "Way|Lane|Causeway|Ridgeway|Highway|Track", B: "Salt|Wool|Corn|Pack|Drove|Market|Church|Coach|Corpse|Smugglers'",
    C: "Black Dog|Wight's|Green Man's|Hob's|Phantom|Giants'",
    D: "Ridgeway;AN-MD|Roman Road;AN-MD|Saxon Way;AN-MD|Army Road;AN-MD|Ford Way;AN-MD|Salt Way;AN-MD|Pilgrims' Way;MD|Corpse Road;MD|Turnpike;EM-ST|Coach Road;EM-ST|Toll Road;EM-ST|Drove Road;EM-ST|Canal Towpath;EM-ST|Stage Road;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Viaduct;ST-MO|Station Road;ST-MO|Tramway;ST-MO|Cycle Way;ST-MO|Motorway;MO|Ring Road;MO",
  },
  sacred: {
    N: "Holy Well|Minster|Moot Hill|Chantry|Standing Stone|Shrine", B: "Saint's|Healing|Pilgrim|Holy|Wishing|Hermit's",
    C: "Green Man's|Wight's|Fairy|Black Dog's|Drowned",
    D: "Barrow;AN-MD|Standing Stone;AN-MD|Holy Well;AN-MD|Moot Hill;AN-MD|Sacred Grove;AN-MD|Hill Figure;AN-MD|Minster;MD|Chantry;MD|Parish Church;EM-ST|Meeting House;EM-ST|Wayside Cross;EM-ST|Almshouse Chapel;EM-ST|Tithe Barn Chapel;EM-ST|Churchyard Yew;EM-ST|Mission Hall;ST-MO|Cathedral;ST-MO|Garden of Remembrance;ST-MO|War Memorial;ST-MO|Cemetery Chapel;ST-MO|Village Hall Chapel;ST-MO|Crematorium Chapel;MO|Interfaith Room;MO",
  },
};
