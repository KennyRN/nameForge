// Slavic (brief 6a): the generic last; birch woods and marshes, rivers and portages, hillforts and stockades, steppe edge, villages of wooden churches, in English.
export default {
  key: "slavic", label: "Slavic", style: "last",
  land: {
    B: "Birch|Pine|Honey|Wheat|Rye|Fur|Iron|Salt|Flax|Amber",
    C: "Forest Spirit|Dragon|Water Maiden|Witch|Wild Hunt|Giant",
    D: "Hillfort;AN-MD|Stockade;AN-MD|Sacred Grove;AN-MD|Burial Mound;AN-MD|Wooden Church;MD|Monastery;MD|Portage;MD|Boyar's Estate;EM-ST|Onion-domed Church;EM-ST|Ironworks;EM-ST|Railway Halt;ST-MO|Collective Farm;ST-MO|Dacha;MO|Wind Farm;MO",
  },
  water: {
    B: "Sturgeon|Herring|Salt|Amber|Fur|Honey|Fish|Cod|Timber|Caviar",
    C: "Water Spirit|Drowned City|Water Maiden|Sea Giant|Phantom Ship|Sea Dragon",
    D: "Fish Weir;AN-MD|Portage;AN-MD|Trading Post;AN-MD|Monastery Landing;MD|River Port;MD|Salt Works;EM-ST|Timber Raft Station;EM-ST|Lighthouse;EM-MO|Seaside Sanatorium;ST-MO|Ferry Terminal;ST-MO|Marina;MO|Fishing Collective;ST-MO",
  },
  route: {
    N: "Portage|Winter Road|Forest Road|Cattle Track|Mountain Pass|Ford Road",
    B: "Fur|Honey|Salt|Amber|Timber|Grain|Iron|Pilgrims'",
    C: "Forest Spirit's|Ghost|Dragon's|Giants'|Phantom|Witch's",
    D: "Portage;AN-MD|Forest Path;AN-MD|Amber Road;AN-MD|River Road;AN-MD|Winter Road;MD|Pilgrim Way;MD|Post Road;EM-ST|Siberian Road;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Motorway;MO|Ring Road;MO|High-Speed Line;MO",
  },
  sacred: {
    N: "Holy Spring|Sacred Tree|Hillfort Shrine|Shrine|Chapel|Church",
    B: "Saint's|Pilgrims'|Hermit's|Healing|Holy|Virgin's",
    C: "Forest Spirit's|Water Maiden's|Giant's|Drowned|Phantom",
    D: "Sacred Grove;AN-MD|Holy Spring;AN-MD|Idol Hill;AN-MD|Burial Mound;AN-MD|Wooden Church;MD|Monastery;MD|Pilgrim Chapel;EM-ST|Procession Shrine;EM-ST|Onion-domed Church;EM-ST|War Memorial Chapel;ST-MO|Pilgrimage Church;MO",
  },
  nouns: {
    land: {
      mountain: ["Watch Peak|Hillfort Peak|Hermit's Peak|Iron Peak|Shepherd's Peak|Carpathian Peak|Summit Cross|Cable Car Peak|Giant's Peak|Bare Peak", "Pass Ridge|Border Ridge|Carpathian Ridge|Iron Ridge|Smugglers' Ridge|Mine Ridge|Skyline Ridge|Paragliding Ridge|Dragon's Back|Long Ridge", "Carpathians|Border Mountains|Highlands|Iron Hills|Drove Mountains|Hunting Range|National Park|Ski Range|Enchanted Mountains|Great Range"],
      wood: ["Birch Forest|Pine Forest|Primeval Forest|Charcoal Forest|Spruce Plantation|Timber Forest|Nature Reserve|Mushroom Forest|Enchanted Forest|Great Forest", "Birch Grove|Oak Grove|Sacred Grove|Linden Grove|Elm Grove|Apple Grove|Memorial Grove|Pine Grove|Witch's Grove|Old Grove", "Honey Clearing|Charcoal Clearing|Hunters' Clearing|Beehive Glade|Wood Yard|Firebreak|Picnic Clearing|Camping Glade|Witch's Ring|Clearing"],
      moor: ["Peat Moor|Shepherds' Moor|Heath Moor|Cotton Grass Moor|Turf Moor|Mining Moor|Wind Farm Moor|Shooting Moor|Ghost Moor|Open Moor", "Burial Hill|Mound Hill|Border Hill|Beacon Hill|Windmill Hill|Mine Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Idol Stone|Standing Stone|Boundary Stone|Wayside Cross|Milestone|Stone Cross|Trig Pillar|Heritage Stone|Giant's Stone|Rock"],
      wet: ["Peat Marsh|Reed Marsh|Pripet Marsh|Drained Marsh|Reclaimed Marsh|Wildfowl Marsh|Nature Reserve Marsh|Reedbed|Water Maiden's Marsh|Marsh", "Peat Bog|Moss Bog|Raised Bog|Turf Bog|Cut Bog|Drained Bog|Wetland Trail|Birdwatchers' Bog|Lantern Bog|Bog", "Reed Isle|Peat Isle|Fishermen's Isle|Willow Isle|Duck Isle|Monastery Isle|Heron Island|Stork Island|Drowned Isle|Isle"],
      grass: ["Black Earth Plain|Wheat Plain|Rye Plain|Cattle Plain|Enclosed Plain|Steppe Plain|Grazing Plain|Solar Plain|Lost Plain|Great Plain", "Hay Meadow|Hill Pasture|Summer Pasture|Drove Pasture|Enclosed Pasture|Collective Pasture|Grazing Common|Sheep Run|Enchanted Pasture|Green Slope", "Fertile Vale|Orchard Vale|Mill Vale|Water Meadow|Canal Vale|Apple Vale|Bypass Vale|Hidden Vale|Fairy Vale|Vale"],
      lands: ["Principality|Duchy|County|Land|Voivodeship|Margraviate|Region|Province|Lost Land|Lands", "Boyar Domain|Grand Duchy|Starosty|Barony|Governorate|Province|Canton|Metropolitan Area|Enchanted Kingdom|Territory", "Parish|Hundred|Town Lands|Common Lands|Municipality|Council Area|Civil Parish|Neighbourhood|Haunted Parish|Lands"],
      farm: ["Rye Field|Open Field|Flax Field|Strip Field|Irrigated Field|Orchard Field|Sunflower Field|Collective Field|Fairy Field|Field", "Manor Farm|Boyar Farm|Beekeeper's Farm|Dairy Farm|Cattle Farm|Collective Farm|Dacha Farm|Organic Farm|Enchanted Farm|Farm", "Sheep Pen|Cattle Enclosure|Stud Enclosure|Hunting Enclosure|Walled Garden|Orchard|Paddock|Allotment|Giant's Fold|Enclosure"],
      hill: ["Hill|Hillfort Hill|Hermit's Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Ravine|Gully Valley|Pilgrim Valley|Mine Valley|Railway Valley|Reservoir Valley|Bypass Valley|Hidden Valley|Enchanted Valley|Valley", "Hill Spur|Loess Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Quarry Ridge|Skyline|Hill Walk|Dragon's Back|Ridge"],
      river: ["Stream|Mill Stream|Portage Channel|Ford|Mill Race|Cutting|Fishing Stream|Kayak Stream|Water Maiden's Stream|Brook", "Lake|Oxbow Lake|Fish Pond|Millpond|Mining Lake|Water Reservoir|Lake Beach|Swimming Lake|Enchanted Lake|Pond", "Rapids|Mill Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Viewpoint Falls|Canoe Rapids|Dragon's Falls|Waterfall"],
    },
    water: {
      sea: ["Bay|Fishing Bay|Amber Bay|Sturgeon Bay|Herring Bay|Anchorage|Naval Bay|Fish Farm Bay|Water Maiden's Bay|Great Bay", "Estuary|Lagoon|Salt Inlet|Fish Inlet|Harbour Inlet|Shipyard Inlet|Marina Inlet|Beach Inlet|Drowned Inlet|Creek", "Strait|Sound|Pilgrim Strait|Viking Strait|Amber Strait|Convoy Strait|Ferry Strait|Shipping Lane|Pillars Strait|Channel"],
      coast: ["Headland|Cape|Watch Headland|Amber Headland|Fisher's Headland|Herring Headland|Lighthouse Headland|Clifftop Walk|Water Maiden's Headland|Point", "Cove|Smugglers' Cove|Fishermen's Cove|Pirate Cove|Amber Cove|Salt Cove|Beach Cove|Naturist Cove|Enchanted Cove|Beach", "Island|Hermit's Island|Monastery Island|Fisher Island|Prison Island|Penal Island|Holiday Island|Resort Island|Sea Maiden Island|Islet"],
      chart: ["Bank|Fishing Bank|Herring Bank|Wreck Bank|Amber Bank|Convoy Bank|Trawling Bank|Sandbank|Water Maiden's Bank|Shoal", "Reef|Rock Reef|Wreck Reef|Longship Reef|Amber Reef|Pirate Reef|Dive Reef|Surf Reef|Drowned Reef|Rock", "Channel|Fishing Channel|River Channel|Pilot Channel|Amber Channel|Convoy Channel|Ferry Channel|Shipping Channel|Water Maiden's Channel|Passage"],
    },
    route: [
      "Portage|Forest Road|Pilgrim Road|Post Road|Coach Road|Winter Road|Main Road|Motorway|Ghost Road|Highway",
      "Fur Road|Salt Road|Honey Road|Amber Road|Timber Road|Iron Road|Rail Freight Line|Freight Corridor|Smugglers' Road|Trade Road",
      "Pilgrim Way|Saint's Way|Hermit's Path|Procession Way|Monastery Path|Rosary Way|Pilgrim Hostel Road|Walking Route|Enchanted Way|Holy Road",
    ],
    sacred: [
      "Holy Spring|Healing Spring|Saint's Fountain|Baptismal Pool|Spa Spring|Mineral Spring|Fountain Shrine|Spa Pool|Water Maiden's Spring|Spring",
      "Idol Stone|Roadside Cross|Hillfort Rock|Burial Mound|Boundary Cross|Stone Cross|War Memorial Cross|Summit Cross|Giant's Stone|Sacred Oak",
      "Wooden Church|Hermitage|Monastery|Cathedral|Onion-domed Church|Procession Shrine|Pilgrimage Church|Memorial Chapel|Enchanted Church|Chapel",
    ],
  },
};
