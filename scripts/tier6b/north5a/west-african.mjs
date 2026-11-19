// West African (brief 6b): the Sahel empires and the forest kingdoms; griots, market towns, mud-brick mosques, the Niger trade, kola and gold weights, guilds of smiths and weavers, coastal forts; the spider and the water mother for lore.
// Each noun list is ten words in the fixed order: three AN-MD, three EM-ST, two ST-MO, one fantastic (`h`), one general.
export default {
  key: "west-african", label: "West African", style: "lastB",
  // The route lists read a modern road in more of their words (the pilgrim list would otherwise hold three words for a modern route).
  routeTags: ["AN-MD", "AN-MD", "AN-MD", "EM-MO", "EM-MO", "EM-ST", "ST-MO", "ST-MO", "h", ""],
  land: {
    B: "Kola|Gold|Shea|Millet|Yam|Cotton|Indigo|Salt|Cocoa|Palm Oil",
    C: "Spider Trickster|Water Mother|Forest Spirit|Iron Giant|Griot's Ghost|Hidden Empire",
    D: "Market Town;AN-MD|Mud-brick Mosque;AN-MD|Smiths' Quarter;AN-MD|Weavers' Quarter;AN-MD|Gold Weigh House;AN-MD|Palace Compound;MD|Caravan Camp;MD|Coastal Fort;EM-ST|Trading Factory;EM-ST|Cocoa Estate;ST-MO|Railway Halt;ST-MO|Oil Town;MO|Market City;MO|Solar Farm;MO",
  },
  water: {
    B: "Cowrie|Salt|Dried Fish|Lagoon Oyster|Shrimp|Canoe|Palm Wine|Steamer|Oil|Coral",
    C: "Water Mother|Drowned Town|River Serpent|Phantom Canoe|Sea Giant|Lagoon Queen",
    D: "Fish Smokehouse;AN-MD|Canoe Landing;AN-MD|Salt Works;AN-MD|River Ferry;MD|Gold Landing;MD|Slave Fort;EM-ST|Customs House;EM-ST|Steamer Wharf;ST-MO|Oil Jetty;ST-MO|Lagoon Beach;MO|Marina;MO|Container Port;MO",
  },
  route: {
    N: "Gold Road|Salt Road|Caravan Road|Kola Path|River Crossing|Market Road",
    B: "Gold|Salt|Kola|Cowrie|Cloth|Griots'|Shea|Millet|Cocoa|Yam",
    C: "Ghost|Trickster's|Water Mother's|Phantom|Hidden|Lost|Spirit's|Drummers'|Masked|Ancestors'",
    D: "Gold Road;AN-MD|Salt Road;AN-MD|Caravan Road;AN-MD|Kola Path;AN-MD|Niger Ferry Road;MD|Emperor's Pilgrim Road;MD|Coast Road;EM-ST|Fort Road;EM-ST|Railway Line;ST-MO|Cocoa Road;ST-MO|Highway;MO|Ring Road;MO|Commuter Rail;MO|Expressway;MO|Toll Road;MO|Border Crossing;MO",
  },
  sacred: {
    N: "Sacred Grove|Mud Mosque|Shrine|Holy Spring|Ancestor Tree|Priest's House",
    B: "Ancestor's|Marabout's|Pilgrims'|Healing|Holy|Priest's",
    C: "Spirit's|Enchanted|Trickster's|Drowned|Phantom",
    D: "Sacred Grove;AN-MD|Spirit Shrine;AN-MD|Ancestor Tree;AN-MD|Holy Spring;AN-MD|Mud Mosque;MD|Library of Manuscripts;MD|Castle Chapel;EM-ST|Mission Church;EM-ST|Great Mosque;ST-MO|Memorial Hall;ST-MO|Festival Ground;MO",
  },
  nouns: {
    land: {
      mountain: ["Cliff Mountain|Rock Mountain|Eagle Mountain|Iron Mountain|Spirit Mountain|Hermit Mountain|Survey Mountain|Radio Mountain|Trickster's Mountain|Great Mountain", "Escarpment Ridge|Sandstone Ridge|Pass Ridge|Mining Ridge|Frontier Ridge|Fort Ridge|Pylon Ridge|Hiking Ridge|Spider Ridge|Long Ridge", "Cliff Range|Highland Chain|Border Mountains|Mining Range|Rail Range|Cocoa Range|Dam Range|Trekking Range|Water Mother Range|Mountains"],
      wood: ["Shea Forest|Baobab Forest|Sacred Forest|Royal Forest|Rain Forest|Iroko Forest|Cola Forest|Mahogany Forest|Spirit Forest|Great Forest", "Baobab Grove|Kola Grove|Ancestor Grove|Shea Grove|Oil Palm Grove|Mango Grove|Cashew Grove|Cocoa Grove|Trickster Grove|Old Grove", "Market Clearing|Shrine Clearing|Drumming Clearing|Honey Clearing|Palm Wine Clearing|Cassava Clearing|Plantain Clearing|Festival Clearing|Spider Clearing|Clearing"],
      moor: ["Sahel Scrub|Harmattan Scrub|Goat Scrub|Acacia Scrub|Frontier Scrub|Bauxite Scrub|Dust Scrub|Hunting Scrub|Spirit Scrub|Open Scrub", "Burial Mound|Tell Hill|Border Hill|Smelter Hill|Telegraph Hill|Bauxite Hill|Cocoa Hill|Mast Hill|Spider's Hill|Round Hill", "Altar Stone|Griot's Stone|Market Stone|Weigh Stone|Milestone|Independence Stone|Monument Stone|Gold Stone|Trickster Stone|Standing Stone"],
      wet: ["Niger Marsh|Rice Marsh|Heron Marsh|Delta Marsh|Mangrove Marsh|Cowrie Marsh|Reserve Marsh|Pelican Marsh|Water Mother's Marsh|Marsh", "Inland Delta|Salt Flat|Mangrove Flat|Lagoon Flat|Oyster Flat|Pumped Flat|Shrimp Flat|Birding Flat|Lantern Flat|Flat", "River Isle|Silt Isle|Shrine Isle|Fisher Isle|Fort Isle|Slave Isle|Ferry Isle|Oil Isle|Spirit Isle|Isle"],
      grass: ["Sahel Plain|Millet Plain|Cattle Plain|Frontier Plain|Empire Plain|Cotton Plain|Irrigated Plain|Solar Plain|Spirit Plain|Great Plain", "Cattle Pasture|Dry Season Pasture|Wet Season Pasture|Fulani Pasture|Herd Pasture|Goat Pasture|Cooperative Pasture|Tourist Pasture|Spider Pasture|Pasture", "Fertile Valley|Yam Valley|Cocoa Valley|River Valley|Mill Valley|Cotton Valley|Dam Valley|Palm Valley|Trickster Valley|Valley"],
      lands: ["Empire|Kingdom|Frontier March|Province|Great Kingdom|Caliphate|Federation|Republic|Lost Empire|Lands", "Paramount King's Lands|Colony|Protectorate|Coast of Gold|Province|Crown Lands|Emirate|District|Spirit Kingdom|Territory", "Clan Lands|Village Lands|Town Lands|Quarter Lands|Headman's Lands|Council Lands|Municipality|Ward|Ancestor Lands|Common Lands"],
      farm: ["Millet Field|Sorghum Field|Yam Field|Groundnut Field|Fonio Field|Indigo Field|Cassava Field|Rubber Field|Spider Field|Field", "Cattle Farm|Cocoa Farm|Shea Farm|Kola Estate|Palm Farm|Cashew Farm|Rural Lodge|Cotton Cooperative|Spirit Farm|Farm", "Compound|Goat Pen|Granary Enclosure|Yam Barn|Cattle Corral|Weavers' Yard|Dye Pit Yard|Smithy Yard|Trickster Pen|Enclosure"],
      hill: ["Hill|Spirit Hill|Hermit Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Spider's Hill|Round Hill", "Gorge|Highland Valley|Smelter Valley|Mine Valley|Railway Valley|Dam Valley|Highway Valley|Hidden Valley|Spirit Valley|Valley", "Hill Spur|Border Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Pylon Ridge|Skyline Ridge|Glider Ridge|Water Mother Ridge|Ridge"],
      river: ["Rocky Stream|Griot's Stream|Gold Panning Stream|Shrine Stream|Washing Stream|Canoe Stream|Sluice Stream|Fishers' Stream|Serpent Stream|Brook", "Great Reservoir Lake|Crater Lake|Fish Lake|Sacred Lake|Reservoir Lake|Oxbow Lake|Mangrove Lake|Lagoon Lake|Water Mother Lake|Lake", "Niger Rapids|Weaver's Falls|Gold Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Tourist Falls|Spirit Falls|Falls"],
      desert: ["Southern Sand Desert|Stony Desert|Salt Desert|Caravan Desert|Tuareg Desert|Frontier Desert|Uranium Desert|Mining Desert|Spirit Desert|Great Desert", "Singing Dune|Camel Dune|Harmattan Dune|Caravan Dune|Border Dune|Pipeline Dune|Tourist Dune|Sand Board Dune|Spider Dune|Dune", "Cave Rock|Rock Painting Rock|Marabout's Rock|Fort Rock|Salt Rock|Mine Rock|Climbing Rock|Photo Rock|Trickster Rock|Rock"],
    },
    water: {
      sea: ["Bay|Lagoon Bay|Cowrie Bay|Coast of Gold Bay|Slave Bay|Roadstead|Surf Bay|Shrimp Bay|Spirit Bay|Great Bay", "Inlet|Creek|Salt Inlet|Mangrove Inlet|Estuary|Boatyard Inlet|Oyster Inlet|Beach Inlet|Drowned Inlet|Gulf", "Strait|Surf Strait|Customs Strait|Canoe Strait|Rollers' Strait|Steamer Strait|Ferry Strait|Oil Strait|Phantom Strait|Sound"],
      coast: ["Headland|Cape|Cape Watch|Fisher's Cape|Fort Cape|Lighthouse Cape|Surf Cape|Beach Walk|Mermaid Cape|Point", "Cove|Canoe Cove|Fishermen's Cove|Trading Cove|Salt Cove|Smokers' Cove|Surf Cove|Resort Cove|Spirit Cove|Beach", "Island|Fort Island|Prison Island|Slave Island|Pilgrim Island|Cowrie Island|Oil Island|Ferry Island|Phantom Island|Isle"],
      chart: ["Bank|Fishing Bank|Shrimp Bank|Wreck Bank|Cowrie Bank|Surf Bank|Trawl Bank|Sandbar|Spirit Bank|Shoal", "Reef|Rock Reef|Wreck Reef|Canoe Reef|Breaker Reef|Steamer Reef|Oil Reef|Barrier Reef|Drowned Reef|Rock", "Channel|Lagoon Channel|Canoe Channel|Bar Channel|Customs Channel|Surf Channel|Ferry Channel|Oil Channel|Phantom Channel|Passage"],
    },
    route: [
      "Gold Road|Sahel Causeway|Post Road|Satrap's Road|Pilgrim Highway|Caravan Road|Main Road|Highway|Ghost Road|Tar Road",
      "Salt Road|Kola Path|Cowrie Path|Cloth Road|Shea Road|Caravan Track|Rail Freight Line|Freight Corridor|Smugglers' Track|Trade Road",
      "Pilgrim Road|Emperor's Road|Marabout's Path|Shrine Path|Holy Road|Mosque Track|Walking Route|Trekking Trail|Enchanted Way|Pilgrim Way",
    ],
    sacred: [
      "Holy Spring|Healing Spring|Ancestor's Well|Ablution Pool|Hot Spring|Rain Spring|Fountain Shrine|Spa Pool|Water Mother Spring|Spring",
      "Sacred Grove|Ancestor Tree|Spirit Shrine|Standing Stone|Boundary Stone|Royal Grave|Memorial Stone|Summit Cairn|Trickster Stone|Holy Rock",
      "Mud Mosque|Manuscript Library|Castle Chapel|Great Mosque|Pilgrim Hostel|Memorial Hall|Heritage Mosque|Restored Shrine|Enchanted Grove|Shrine",
    ],
  },
};
