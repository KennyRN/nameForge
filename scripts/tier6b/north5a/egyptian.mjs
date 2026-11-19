// Egyptian (brief 6b, B2): the Nile valley in every era, in its own voice. AN is pharaonic and Ptolemaic, MD Coptic and Mamluk, EM and ST Ottoman and khedival, MO modern Egypt.
// Each noun list is ten words in the order: one AN, one AN-MD, one MD, one MD-EM, two EM-ST, one ST-MO, one MO, one fantastic (`h`), one general (`tags` below).
export default {
  key: "egyptian", label: "Egyptian", style: "firstB",
  tags: ["AN", "AN-MD", "MD", "MD-EM", "EM-ST", "EM-ST", "ST-MO", "MO", "h", ""],
  land: {
    B: "Papyrus|Lotus|Cotton|Date|Sugar Cane|Barley|Ibis|Buffalo|Onion|Flax",
    C: "Sphinx|Mummy|Scarab King|Sleeping Pharaoh|Jackal Spirit|Cursed Tomb",
    D: "Nome Capital;AN|Temple Town;AN|Granary;AN|Quarry Camp;AN|Pyramid Village;AN|Monastery;MD|Church;MD|Mamluk Fort;MD|Dyke Watchtower;MD|Cotton Ginnery;EM-ST|Khedive's Estate;EM-ST|Irrigation Pumping Station;ST-MO|Sugar Mill;ST-MO|Reclaimed Land;MO|Desert Resort;MO|New Town;MO",
  },
  water: {
    B: "Papyrus|Nile Perch|Lotus|Salt|Fish|Felucca|Ferry|Steamboat|Cotton|Date",
    C: "River Serpent|Drowned Temple|Nile Spirit|Phantom Barge|Sea Giant|Hippo Queen",
    D: "Flood Gauge;AN|Barge Landing;AN|Fish Weir;AN|Harbour Fort;MD|Canal Gate;MD|Felucca Quay;MD|Customs House;EM-ST|Cotton Port;EM-ST|Lighthouse;EM-ST|Canal Station;ST-MO|Barrage;ST-MO|Corniche;MO|Dive Resort;MO|Marina;MO",
  },
  route: {
    N: "Nile Road|Caravan Road|Desert Track|Processional Way|Canal Path|Pilgrim Road",
    B: "Cotton|Gold|Grain|Papyrus|Natron|Incense|Camel|Obelisk",
    C: "Ghost|Mummy's|Phantom|Scarab|Jackal's|Cursed",
    D: "Processional Way;AN|Quarry Road;AN|Delta Road;AN|Desert Track;AN|Monastery Road;MD|Pilgrim Way;MD|Caravan Road;MD|Dyke Road;MD|Mail Road;MD-ST|Canal Towpath;MD-ST|Railway Line;ST-MO|Corniche Road;ST-MO|Desert Highway;MO|Bridge Road;MO|Metro Line;MO",
  },
  sacred: {
    N: "Temple|Obelisk|Monastery|Holy Well|Church|Shrine",
    B: "Priest's|Saint's|Pilgrims'|Healing|Holy|Hermit's",
    C: "Mummy's|Enchanted|Sphinx's|Drowned|Phantom",
    D: "Temple;AN|Sacred Lake;AN|Obelisk;AN|Tomb Chapel;AN|Monastery;MD|Church;MD|Saint's Tomb;MD|Mamluk Mosque;MD|Sufi Shrine;EM-ST|Coptic Church;EM-ST|Great Mosque;ST-MO|Museum Temple;ST-MO|Pilgrimage Square;MO",
  },
  nouns: {
    land: {
      mountain: ["Quarry Mountain|Pyramid Peak|Hermit Mountain|Telegraph Peak|Survey Peak|Mining Mountain|Radio Peak|Climbers' Peak|Sphinx Mountain|Great Mountain", "Cliff Ridge|Tomb Ridge|Monastery Ridge|Rail Ridge|Fort Ridge|Quarry Ridge|Pylon Ridge|Cable Ridge|Jackal Ridge|Long Ridge", "Eastern Red Range|Red Hills|Holy Peaks|Mining Range|Phosphate Range|Rail Range|Radar Range|Trekking Range|Scarab Range|Mountains"],
      wood: ["Sycamore Forest|Acacia Forest|Hunting Forest|Tamarisk Forest|Sacred Forest|Palm Forest|Reserve Forest|Picnic Forest|Mummy Forest|Great Forest", "Date Grove|Sycamore Grove|Monastery Grove|Fig Grove|Mango Grove|Orange Grove|Memorial Grove|Palm Grove|Jackal Grove|Old Grove", "Temple Clearing|Spring Clearing|Camp Clearing|Reed Clearing|Palm Clearing|Hunting Clearing|Picnic Clearing|Camp Site|Scarab Clearing|Clearing"],
      moor: ["Gravel Desert|Salt Desert|Sand Desert|Black Desert|White Desert|Mining Desert|Dust Desert|Hunting Desert|Mummy Desert|Open Desert", "Tomb Hill|Watch Hill|Fortress Hill|Mound Hill|Telegraph Hill|Mine Hill|Viewpoint Hill|Antenna Hill|Sphinx Hill|Round Hill", "Boundary Stele|Obelisk Stone|Wayside Stone|Colossus Stone|Milestone|Memorial Stone|Monument Stone|Photo Stone|Scarab Stone|Standing Stone"],
      wet: ["Papyrus Marsh|Reed Marsh|Ibis Marsh|Delta Marsh|Drained Marsh|Lotus Marsh|Reserve Marsh|Flamingo Marsh|Hippo Queen's Marsh|Marsh", "Delta Flat|Salt Flat|Reed Flat|Lagoon Flat|Cut Flat|Pumped Flat|Spa Flat|Birdwatch Flat|Lantern Flat|Flat", "Nile Isle|Reed Isle|Temple Isle|Monastery Isle|Prison Isle|Cotton Isle|Ferry Isle|Resort Isle|Scarab Isle|Isle"],
      grass: ["Delta Plain|Wheat Plain|Flood Plain|Frontier Plain|Nome Plain|Cotton Plain|Irrigated Plain|Solar Plain|Mummy Plain|Great Plain", "Flood Pasture|Clover Pasture|Buffalo Pasture|Canal Pasture|Village Pasture|Goat Pasture|Cooperative Pasture|Tourist Pasture|Sphinx Pasture|Pasture", "Fertile Valley|Orchard Valley|Date Valley|River Valley|Mill Valley|Cotton Valley|Dam Valley|Wine Valley|Jackal Valley|Valley"],
      lands: ["Two Lands|Nome|Upper Kingdom|Lower Kingdom|Province|Delta Province|Dynasty Lands|Republic|Lost Kingdom|Lands", "Mamluk Emirate|Sultan's Domain|Governorate|Delta Province|Pasha's Lands|Province|Protectorate|District|Pharaoh's Phantom Realm|Territory", "Nome Lands|Village Lands|Town Lands|Estate Lands|Headman's Lands|Council Lands|Municipality|Neighbourhood|Mummy Lands|Common Lands"],
      farm: ["Flax Field|Barley Field|Emmer Field|Lotus Field|Flooded Field|Cotton Field|Greenhouse Field|Solar Field|Scarab Field|Field", "Date Farm|Buffalo Farm|Cotton Estate|Sugar Estate|Orange Farm|Palm Farm|Rural Hotel|Organic Farm|Sphinx Farm|Farm", "Cattle Pen|Goat Pen|Granary Enclosure|Walled Garden|Temple Enclosure|Cattle Yard|Stud Enclosure|Camp Enclosure|Jackal Pen|Enclosure"],
      hill: ["Hill|Tomb Hill|Hermit Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Sphinx Hill|Round Hill", "Wadi|Valley of Tombs|Quarry Valley|Mine Valley|Railway Valley|Dam Valley|Highway Valley|Hidden Valley|Scarab Valley|Valley", "Hill Spur|Cliff Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Pylon Ridge|Skyline Ridge|Glider Ridge|Jackal Ridge|Ridge"],
      river: ["Nile Branch|Mill Channel|Ford Channel|Reed Channel|Canal|Irrigation Canal|Rafting Channel|Canoe Channel|Hippo Queen's Channel|Brook", "Oasis Lake|Delta Lake|Fish Lake|Sacred Lake|Reservoir Lake|Spa Lake|Beach Lake|Sailing Lake|Nile Spirit Lake|Lake", "Lower Cataract|Second Cataract|Rapids|Weir|Barrage|Dam Spillway|Gorge Falls|Tourist Rapids|Serpent Cataract|Cataract"],
      desert: ["Black Desert|White Desert|Red Desert|Natron Desert|Pharaoh's Desert|Quarry Desert|Oasis Desert|Mining Desert|Mummy Desert|Great Desert", "Sand Sea Dune|Camel Dune|Singing Dune|Caravan Dune|Border Dune|Pipeline Dune|Tourist Dune|Sand Board Dune|Scarab Dune|Dune", "Tomb Rock|Cave Rock|Monk's Rock|Fort Rock|Salt Rock|Mine Rock|Climbing Rock|Mushroom Rock|Sphinx Rock|Rock"],
    },
    water: {
      sea: ["Bay|Delta Bay|Papyrus Bay|Harbour Bay|Pirate Bay|Roadstead|Naval Bay|Sardine Bay|Siren Bay|Great Bay", "Inlet|Lagoon Inlet|Salt Inlet|Delta Inlet|Harbour Inlet|Shipyard Inlet|Marina Inlet|Beach Inlet|Drowned Inlet|Creek", "Strait|Narrow Strait|Customs Strait|Canal Strait|Pirate Strait|Steamer Strait|Ferry Strait|Shipping Strait|Phantom Strait|Sound"],
      coast: ["Headland|Cape|Watch Cape|Fisher's Cape|Pirate Cape|Lighthouse Cape|Quarantine Cape|Corniche Walk|Siren Cape|Point", "Cove|Smugglers' Cove|Fishermen's Cove|Felucca Cove|Salt Cove|Fisher Cove|Beach Cove|Resort Cove|Siren Cove|Beach", "Island|Hermit Island|Prison Island|Pharos Island|Pilgrim Island|Quarantine Island|Resort Island|Ferry Island|Phantom Island|Isle"],
      chart: ["Bank|Fishing Bank|Sponge Bank|Wreck Bank|Coral Bank|Convoy Bank|Trawl Bank|Sandbank|Siren Bank|Shoal", "Reef|Coral Reef|Wreck Reef|Felucca Reef|Pirate Reef|Steamer Reef|Dive Reef|Artificial Reef|Drowned Reef|Rock", "Channel|Delta Channel|Felucca Channel|Pilot Channel|Customs Channel|Convoy Channel|Ferry Channel|Shipping Channel|Phantom Channel|Passage"],
    },
    route: [
      "Processional Way;AN-MO|Nile Causeway;MD-MO|Post Road;MD-MO|King's Highway;MD-MO|Pilgrim Highway;MD-MO|Camel Road;MD-MO|Main Road;MD-MO|Desert Highway;MD-MO|Sand Road;MD-MO|Highway",
      "Gold Road|Natron Road|Grain Road|Papyrus Road|Cotton Road|Caravan Track|Rail Freight Line|Pipeline Corridor|Smugglers' Track|Trade Road",
      "Pilgrim Way|Monastery Path;AN-IS|Saint's Path;MD-IS|Moulid Road;MD-IS|Holy Road;MD-IS|Hermit's Track;MD-IS|Walking Route;ST-IS|Trekking Trail;MO-IS|Enchanted Way|Pilgrim Road",
    ],
    sacred: [
      "Sacred Lake|Healing Spring|Saint's Well|Baptismal Pool|Hot Spring|Flood Gauge Well|Fountain Shrine|Spa Pool|Nile Spirit Spring|Spring",
      "Obelisk|Colossus|Stele|Standing Stone|Boundary Stele|Tomb Garden|Memorial Stone|Summit Cairn|Sphinx Stone|Holy Rock",
      "Temple|Monastery|Church|Mamluk Mosque|Sufi Shrine|Coptic Church|Heritage Mosque|Museum Temple|Enchanted Shrine|Shrine",
    ],
  },
};
