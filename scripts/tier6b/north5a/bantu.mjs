// Bantu (brief 6b): central, eastern and southern Bantu-speaking lands; cattle and kraals, stone enclosures, chiefs' councils, iron-working, great lakes and rivers, mission stations and modern cities; the water spirit and the lightning bird for lore.
// Each noun list is ten words in the fixed order: three AN-MD, three EM-ST, two ST-MO, one fantastic (`h`), one general.
export default {
  key: "bantu", label: "Bantu", style: "last",
  land: {
    B: "Cattle|Millet|Sorghum|Cassava|Banana|Iron|Copper|Ivory|Maize|Honey",
    C: "Water Spirit|Lightning Bird|Rain Queen|Hairy Dwarf|Giant Snake|Ancestor",
    D: "Cattle Kraal;AN-MD|Iron Smelter;AN-MD|Stone Enclosure;AN-MD|Council Tree;AN-MD|Chief's Homestead;AN-MD|Royal Enclosure;MD|Rainmaker's Hill;MD|Trading Post;EM-ST|Mission Station;EM-ST|Compound;ST-MO|Mine Head;ST-MO|Township;MO|Game Lodge;MO|Solar Farm;MO",
  },
  water: {
    B: "Tilapia|Perch|Salt|Papyrus|Fish|Dugout|Hippo|Ferry|Cotton|Palm Oil",
    C: "River Serpent|Drowned Village|Lake Spirit|Phantom Canoe|Lake Giant|Mermaid Queen",
    D: "Fish Trap;AN-MD|Dugout Landing;AN-MD|Salt Pan;AN-MD|Lake Shrine;MD|Ivory Landing;MD|Mission Jetty;EM-ST|Customs Post;EM-ST|Lake Steamer Quay;ST-MO|Dam;ST-MO|Lodge Beach;MO|Marina;MO|Hydropower Station;MO",
  },
  route: {
    N: "Trade Path|Caravan Path|Pilgrim Path|Cattle Track|River Crossing|Porters' Road",
    B: "Ivory|Salt|Copper|Iron|Cattle|Porters'|Rainmaker's|Beads",
    C: "Ghost|Ancestors'|Serpent's|Phantom|Lightning|Lost",
    D: "Trade Path;AN-MD|Salt Path;AN-MD|Cattle Track;AN-MD|River Crossing;AN-MD|Copper Road;MD|Ivory Road;MD|Porters' Road;EM-ST|Mission Road;EM-ST|Railway Line;ST-MO|Mine Road;ST-MO|Highway;MO|Bypass;MO|Commuter Rail;MO",
  },
  sacred: {
    N: "Sacred Grove|Rain Shrine|Ancestor Tree|Holy Spring|Mission Church|Shrine",
    B: "Ancestor's|Rainmaker's|Pilgrims'|Healing|Holy|Chief's",
    C: "Spirit's|Enchanted|Serpent's|Drowned|Phantom",
    D: "Sacred Grove;AN-MD|Rain Shrine;AN-MD|Ancestor Tree;AN-MD|Holy Spring;AN-MD|Royal Grave;MD|Rainmaker's Hill;MD|Mission Church;EM-ST|Chapel;EM-ST|Cathedral;ST-MO|Memorial Church;ST-MO|Pilgrimage Hill;MO",
  },
  nouns: {
    land: {
      mountain: ["Rain Mountain|Cloud Mountain|Eagle Mountain|Iron Mountain|Chief's Mountain|Ancestor Mountain|Survey Mountain|Radio Mountain|Spirit Mountain|Great Mountain", "Escarpment Ridge|Cattle Ridge|Smelter Ridge|Mining Ridge|Frontier Ridge|Mission Ridge|Pylon Ridge|Hiking Ridge|Lightning Ridge|Long Ridge", "Dragon Range|Rift Mountains|Highland Chain|Mining Range|Rail Range|Tea Range|Dam Range|Trekking Range|Thunder Range|Mountains"],
      wood: ["Miombo Forest|Baobab Forest|Sacred Forest|Royal Forest|Mopane Forest|Charcoal Forest|Reserve Forest|Safari Forest|Spirit Forest|Great Forest", "Baobab Grove|Fig Grove|Ancestor Grove|Hermit Grove|Banana Grove|Coffee Grove|Memorial Grove|Eucalyptus Grove|Serpent Grove|Old Grove", "Council Clearing|Rain Clearing|Camp Clearing|Honey Clearing|Logging Clearing|Hunting Clearing|Picnic Clearing|Camp Site|Spirit Clearing|Clearing"],
      moor: ["Highveld Plateau|Heather Plateau|Cattle Plateau|Protea Plateau|Frontier Plateau|Mining Plateau|Wind Plateau|Hunting Plateau|Spirit Plateau|Open Plateau", "Burial Hill|Ruin Hill|Border Hill|Furnace Hill|Telegraph Hill|Mine Hill|Viewpoint Hill|Antenna Hill|Lightning Hill|Round Hill", "Rain Stone|Grave Stone|Boundary Stone|Council Stone|Milestone|Memorial Stone|Monument Stone|Photo Stone|Serpent Stone|Standing Stone"],
      wet: ["Swamp|Papyrus Swamp|Hippo Swamp|Floodplain Swamp|Drained Swamp|Reed Swamp|Reserve Swamp|Flamingo Swamp|Water Spirit's Swamp|Marsh", "Floodplain|Salt Pan|Reed Floodplain|Okavango Floodplain|Cut Floodplain|Pumped Floodplain|Spa Floodplain|Birdwatch Floodplain|Lantern Floodplain|Flat", "Lake Isle|Reed Isle|Shrine Isle|Fisher Isle|Prison Isle|Mission Isle|Ferry Isle|Resort Isle|Spirit Isle|Isle"],
      grass: ["Savanna|Millet Savanna|Cattle Savanna|Frontier Savanna|Royal Savanna|Cotton Savanna|Irrigated Savanna|Solar Savanna|Spirit Savanna|Great Savanna", "Cattle Pasture|Summer Pasture|Winter Pasture|Chief's Pasture|Herd Pasture|Goat Pasture|Cooperative Pasture|Tourist Pasture|Serpent Pasture|Pasture", "Fertile Valley|Banana Valley|Maize Valley|River Valley|Mill Valley|Tea Valley|Dam Valley|Wine Valley|Thunder Valley|Valley"],
      lands: ["Kingdom|Chiefdom|Frontier Chiefdom|Province|Great Kingdom|Empire|Federation|Republic|Lost Kingdom|Lands", "Paramount Chief's Lands|Colony|Protectorate|Reserve|Province|Crown Lands|Native Reserve|District|Spirit Kingdom|Territory", "Clan Lands|Village Lands|Town Lands|Mission Lands|Headman's Lands|Council Lands|Municipality|Township|Ancestor Lands|Common Lands"],
      farm: ["Millet Field|Sorghum Field|Maize Field|Bean Field|Cassava Field|Cotton Field|Greenhouse Field|Solar Field|Serpent Field|Field", "Cattle Farm|Tea Farm|Honey Farm|Coffee Estate|Banana Farm|Flower Farm|Safari Lodge|Organic Farm|Spirit Farm|Farm", "Kraal|Goat Pen|Granary Enclosure|Garden Enclosure|Cattle Enclosure|Cattle Yard|Stud Enclosure|Camp Enclosure|Ancestor Pen|Enclosure"],
      hill: ["Hill|Rain Hill|Hermit Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Lightning Hill|Round Hill", "Gorge|Highland Valley|Smelter Valley|Mine Valley|Railway Valley|Dam Valley|Highway Valley|Hidden Valley|Spirit Valley|Valley", "Hill Spur|Border Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Pylon Ridge|Skyline Ridge|Glider Ridge|Thunder Ridge|Ridge"],
      river: ["Mountain Stream|Rain Stream|Drift Stream|Spring Stream|Cattle Stream|Irrigation Stream|Rafting Stream|Canoe Stream|Serpent Stream|Brook", "Great Lake|Rift Lake|Fish Lake|Sacred Lake|Reservoir Lake|Hot Lake|Beach Lake|Sailing Lake|Spirit Lake|Lake", "Smoke Falls|Thunder Smoke Falls|Spring Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Tourist Falls|Thunder Falls|Falls"],
      desert: ["Red Sand Desert|Salt Pan Desert|Thirstland|Hunters' Desert|Herders' Desert|Frontier Desert|Diamond Desert|Mining Desert|Lightning Desert|Great Desert", "Singing Dune|Red Dune|Fog Dune|Hunters' Dune|Border Dune|Pipeline Dune|Tourist Dune|Sand Board Dune|Spirit Dune|Dune", "Painted Rock|Cave Rock|Rain Rock|Fort Rock|Salt Rock|Mine Rock|Climbing Rock|Photo Rock|Serpent Rock|Rock"],
    },
    water: {
      sea: ["Bay|Lake Bay|Papyrus Bay|Harbour Bay|Raider Bay|Anchorage|Naval Bay|Tilapia Bay|Hippo Bay|Wide Bay", "Arm|Backwater|Reed Inlet|Harbour Inlet|Dhow Inlet|Marina Inlet|Sand Inlet|Drowned Arm|Spirit Arm|Gulf Arm", "Channel|Narrows|Dhow Strait|Raider Strait|Reed Strait|Steamer Strait|Ferry Strait|Shipping Strait|Phantom Strait|Sound"],
      coast: ["Headland|Cape|Watch Cape|Fisher's Cape|Dhow Cape|Lighthouse Cape|Quarantine Cape|Lakeside Walk|Mermaid Cape|Point", "Cove|Dugout Cove|Fishermen's Cove|Ivory Cove|Salt Cove|Fisher Cove|Beach Cove|Resort Cove|Spirit Cove|Beach", "Island|Shrine Island|Prison Island|Hermit Island|Pilgrim Island|Quarantine Island|Resort Island|Ferry Island|Phantom Island|Isle"],
      chart: ["Bank|Fishing Bank|Tilapia Bank|Wreck Bank|Reed Bank|Convoy Bank|Trawl Bank|Sandbank|Spirit Bank|Shoal", "Reef|Rock Reef|Wreck Reef|Canoe Reef|Dhow Reef|Steamer Reef|Dive Reef|Artificial Reef|Drowned Reef|Rock", "Channel|Reed Channel|Canoe Channel|Pilot Channel|Customs Channel|Convoy Channel|Ferry Channel|Shipping Channel|Phantom Channel|Passage"],
    },
    route: [
      "Trade Path|Caravan Causeway|Post Road|Royal Path|Pilgrim Highway|Porters' Road|Main Road|Highway|Ghost Road|Tar Road",
      "Ivory Path|Salt Path|Copper Path|Iron Path|Cattle Path|Porters' Track|Rail Freight Line|Freight Corridor|Smugglers' Track|Trade Road",
      "Pilgrim Path|Ancestor Path|Rainmaker's Path|Grove Path|Holy Road|Mission Track|Walking Route|Trekking Trail|Enchanted Way|Pilgrim Way",
    ],
    sacred: [
      "Holy Spring|Healing Spring|Ancestor's Well|Baptismal Pool|Hot Spring|Rain Spring|Fountain Shrine|Spa Pool|Water Spirit Spring|Spring",
      "Sacred Grove|Ancestor Tree|Rain Shrine|Standing Stone|Boundary Stone|Royal Grave|Memorial Stone|Summit Cairn|Serpent Stone|Holy Rock",
      "Rainmaker's Hill|Mission Church|Chapel|Cathedral|Pilgrim Hostel|Memorial Church|Heritage Church|Restored Chapel|Enchanted Grove|Church",
    ],
  },
};
