import { framesOf } from "./lib.mjs";
// Welsh (§7): the generic comes first ("Valley Head", "Cairn of the Oak"); cwm, hafod, aber and llan rendered in English.
export default {
  key: "welsh",
  keys: ["welsh"],
  label: "Welsh",
  land: {
    B: "Slate|Peat|Sheep|Cattle|Lead|Copper|Oak|Hazel|Gorse|Bracken",
    C: "Dragon|Fair Folk|Giant|Hag|Lake Monster|Phantom Hound",
    D: "Hillfort;AN-MD|Round Fort;AN-MD|Burial Cairn;AN-MD|Holy Enclosure;AN-MD|Standing Stone;AN-MD|Chieftain's Seat;AN-MD|Hermit's Cell;MD|Monks' Grange;MD|Chapel;EM-MO|Slate Quarry;EM-MO|Mine Tip;EM-MO|Reservoir;EM-MO|Tram Road;EM-MO|Colliery;EM-MO|Drovers' Halt;EM-MO",
  },
  water: {
    B: "Slate|Herring|Salt|Cockle|Lime|Coal|Wool|Lead|Seaweed|Pilgrims'",
    C: "Drowned Kingdom|Mermaid|Sea Dragon|Water Horse|Bell Under the Sea|Fair Folk",
    D: "Fish Weir;AN-MD|Island Hermitage;AN-MD|Pilgrim Landing;AN-MD|Beacon Hill;AN-MD|Sea Fort;AN-MD|Saint's Landing;AN-MD|Holy Island;MD|Monks' Fishery;MD|Herring Quay;EM-MO|Slate Quay;EM-MO|Lifeboat Station;EM-MO|Packet Pier;EM-MO|Lighthouse;EM-MO|Coal Staithe;EM-MO|Seaside Pier;EM-MO",
  },
  route: {
    N: "Causeway|Hollow Way|Mountain Road|Pack Road|Cattle Road|Stone Road",
    B: "Slate|Wool|Lead|Black Cattle|Salt|Coal|Lime|Drovers'|Pilgrims'|Saints'",
    C: "Fairy|Dragon's|Giants'|Hounds'|Phantom|Dead Men's",
    D: "Pilgrim Path;AN-MD|Hillfort Road;AN-MD|Saint's Road;AN-MD|Cattle Track;AN-MD|Ridgeway;AN-MD|Ford Road;AN-MD|Monks' Way;MD|Church Path;MD|Turnpike;EM-ST|Toll Road;EM-ST|Canal Towpath;EM-ST|Mail Coach Road;EM-ST|Plateway;EM-ST|Drove Road;EM-ST|Tramroad;ST-MO|Railway Cutting;ST-MO|Branch Line;ST-MO|Mineral Line;ST-MO|Viaduct;ST-MO|Station Road;ST-MO|Bypass;MO|Link Road;MO",
  },
  sacred: {
    N: "Holy Well|Holy Enclosure|Cairn|Hermit's Cell|Standing Stone|Sacred Spring",
    B: "Saint's|Healing|Pilgrim|Fair Folk's|Druids'|Holy",
    C: "Dragon's|Giant's|Fairy|Otherworld|Drowned",
    D: "Burial Chamber;AN-MD|Sacred Lake;AN-MD|Bardic Seat;AN-MD|Stone Circle;AN-MD|Sacred Hill;AN-MD|Holy Spring;AN-MD|Hermitage;MD|Monastery;MD|Chapel of Ease;EM-ST|Meeting House;EM-ST|Parish Church;EM-ST|Almshouse Chapel;EM-ST|Revival Chapel;EM-ST|Holy Well House;EM-ST|Nonconformist Chapel;ST-MO|Memorial Hall;ST-MO|Singing Chapel;ST-MO|Cemetery Chapel;ST-MO|Eisteddfod Pavilion;ST-MO|Garden of Remembrance;MO|Crematorium Chapel;MO",
  },
  frames: framesOf("first"),
};
