// French (brief 6a): the generic first; châteaux, vineyards and abbeys rendered in English: moors of Brittany, causses, bocage hedgerows, canals and royal forests.
export default {
  key: "french", label: "French", style: "first",
  land: {
    B: "Vine|Chestnut|Walnut|Truffle|Apple|Lavender|Salt|Slate|Cattle|Lime",
    C: "Fairy|Dragon|Werewolf|White Lady|Wild Hunt|Giant",
    D: "Gallic Fort;AN-MD|Roman Villa;AN-MD|Hermitage;AN-MD|Priory;MD|Castle;MD|Abbey;MD|Bastide;MD|Royal Hunting Lodge;EM-ST|Chateau;EM-ST|Canal Lock;EM-ST|Railway Halt;ST-MO|Quarry;ST-MO|Motorway Service Area;MO|Wind Farm;MO",
  },
  water: {
    B: "Salt|Oyster|Sardine|Cod|Wine|Cognac|Fish|Lavender|Pearl|Mussel",
    C: "Sea Serpent|Drowned City of Ys|Siren|Fairy|Sea Giant|Phantom Ship",
    D: "Fish Weir;AN-MD|Gallic Harbour;AN-MD|Saltern;AN-MD|Abbey Landing;MD|Fortified Port;MD|Naval Arsenal;EM-ST|Corsair Port;EM-ST|Lighthouse;EM-MO|Seaside Casino;ST-MO|Ferry Terminal;ST-MO|Marina;MO|Oyster Bed;EM-MO",
  },
  route: {
    N: "Roman Road|Pilgrim Way|Royal Road|Towpath|Mountain Pass|Drove Road",
    B: "Wine|Salt|Cloth|Wool|Silk|Cheese|Oyster|Pilgrims'",
    C: "Fairy|Ghost|Dragon's|Giants'|Phantom|Wild Hunt's",
    D: "Roman Road;AN-MD|Pilgrim Way;AN-MD|Drove Road;AN-MD|Gallic Track;AN-MD|Royal Road;MD|Fair Road;MD|Post Road;EM-ST|Canal Towpath;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Motorway;MO|Ring Road;MO|High-Speed Line;MO",
  },
  sacred: {
    N: "Holy Well|Holy Spring|Calvary|Shrine|Chapel|Cathedral",
    B: "Saint's|Pilgrims'|Hermit's|Healing|Holy|Virgin's",
    C: "Fairy|Druids'|Giant's|Drowned|Phantom",
    D: "Gallic Sanctuary;AN-MD|Holy Well;AN-MD|Hermitage;AN-MD|Roadside Cross;AN-MD|Cathedral;MD|Abbey;MD|Pilgrim Chapel;EM-ST|Procession Shrine;EM-ST|Lourdes Grotto;ST-MO|War Memorial Chapel;ST-MO|Pilgrimage Church;MO",
  },
  nouns: {
    land: {
      mountain: ["Gallic Peak|Hermit's Peak|Beacon Peak|Mining Peak|Shepherd's Peak|Alpine Peak|Summit Cross|Cable Car Peak|Giant's Peak|Bare Peak", "Pass Ridge|Border Ridge|Gallic Ridge|Slate Ridge|Smugglers' Ridge|Mine Ridge|Skyline Ridge|Paragliding Ridge|Dragon's Back|Long Ridge", "Massif|Border Mountains|Highlands|Mining Hills|Drove Mountains|Royal Hunting Range|National Park|Ski Range|Enchanted Mountains|Great Massif"],
      wood: ["Royal Forest|Gallic Forest|Oak Forest|Charcoal Forest|Pine Plantation|Shipbuilders' Forest|Nature Reserve|Picnic Forest|Enchanted Forest|Great Forest", "Chestnut Grove|Oak Grove|Hermit's Grove|Beech Grove|Walnut Grove|Apple Grove|Memorial Grove|Pine Grove|White Lady's Grove|Old Grove", "Forest Clearing|Charcoal Clearing|Hunters' Clearing|Royal Glade|Wood Yard|Firebreak|Picnic Clearing|Camping Glade|Fairy Ring|Clearing"],
      moor: ["Breton Moor|Shepherds' Moor|Heath Moor|Gorse Moor|Peat Moor|Mining Moor|Wind Farm Moor|Shooting Moor|Ghost Moor|Open Moor", "Barrow Hill|Gallic Hill|Border Hill|Beacon Hill|Windmill Hill|Mine Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Standing Stone|Dolmen|Boundary Stone|Wayside Cross|Milestone|Stone Cross|Trig Pillar|Heritage Stone|Giant's Stone|Rock"],
      wet: ["Salt Marsh|Tidal Marsh|Reed Marsh|Drained Marsh|Reclaimed Marsh|Wildfowl Marsh|Nature Reserve Marsh|Reedbed|Fairy Marsh|Marsh", "Peat Bog|Pond Bog|Mere|Fish Pond Bog|Cut Bog|Reservoir Bog|Wetland Trail|Birdwatchers' Bog|Lantern Bog|Bog", "Reed Isle|Pond Isle|Fishermen's Isle|Willow Isle|Duck Isle|Salt Isle|Heron Island|Flamingo Island|Drowned Isle|Isle"],
      grass: ["Fertile Plain|Wheat Plain|Beet Plain|Cattle Plain|Enclosed Plain|Irrigated Plain|Grazing Plain|Solar Plain|Gallic Plain|Great Plain", "Hedged Pasture|Hill Pasture|Summer Pasture|Drove Pasture|Enclosed Pasture|Dairy Pasture|Grazing Common|Sheep Run|Enchanted Pasture|Green Slope", "Fertile Vale|Orchard Vale|Mill Vale|Water Meadow|Canal Vale|Wine Vale|Bypass Vale|Hidden Vale|Fairy Vale|Vale"],
      lands: ["Kingdom|County|Duchy|Lordship|Province|Bailiwick|Region|Department|Lost Kingdom|Lands", "Royal Domain|Marquisate|Viscounty|Barony|Intendancy|Province|Canton|Arrondissement|Fairy Kingdom|Territory", "Parish|Hundred|Town Lands|Common Lands|Commune|Council Area|Civil Parish|Neighbourhood|Haunted Parish|Lands"],
      farm: ["Wheat Field|Open Field|Beet Field|Vine Field|Irrigated Field|Orchard Field|Sunflower Field|Solar Field|Fairy Field|Field", "Grange|Manor Farm|Sheepfold Farm|Wine Estate|Dairy Farm|Cider Farm|Farm Inn|Organic Farm|Enchanted Farm|Farm", "Sheep Pen|Cattle Enclosure|Stud Enclosure|Hunting Enclosure|Walled Garden|Orchard|Paddock|Allotment|Giant's Fold|Enclosure"],
      hill: ["Hill|Gallic Hill|Hermit's Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Gorge|Gallic Valley|Pilgrim Valley|Mine Valley|Canal Valley|Reservoir Valley|Bypass Valley|Hidden Valley|Enchanted Valley|Valley", "Hill Spur|Border Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Quarry Ridge|Skyline|Hill Walk|Dragon's Back|Ridge"],
      river: ["Mountain Stream|Gallic Brook|Mill Stream|Ford|Mill Race|Cutting|Fishing Stream|Kayak Stream|White Lady's Stream|Brook", "Lake|Oxbow Lake|Fish Pond|Millpond|Mining Lake|Water Reservoir|Lake Beach|Swimming Lake|Enchanted Lake|Pond", "Mountain Falls|Mill Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Viewpoint Falls|Canyoning Gorge|Dragon's Falls|Waterfall"],
    },
    water: {
      sea: ["Bay|Fishing Bay|Gallic Bay|Whaling Bay|Oyster Bay|Anchorage|Naval Bay|Fish Farm Bay|Siren's Bay|Great Bay", "Inlet|Ria|Salt Inlet|Fish Inlet|Harbour Inlet|Shipyard Inlet|Marina Inlet|Beach Inlet|Drowned Inlet|Creek", "Strait|Gallic Strait|Pilgrim Strait|Corsair Strait|Convoy Strait|Blockade Strait|Ferry Strait|Shipping Lane|Pillars Strait|Channel"],
      coast: ["Headland|Cape|Watch Headland|Gallic Headland|Fisher's Headland|Whaling Headland|Lighthouse Headland|Clifftop Walk|Siren's Headland|Point", "Cove|Smugglers' Cove|Fishermen's Cove|Corsair Cove|Oyster Cove|Salt Cove|Beach Cove|Naturist Cove|Enchanted Cove|Beach", "Island|Hermit's Island|Abbey Island|Fisher Island|Prison Island|Penal Island|Holiday Island|Resort Island|Siren Island|Islet"],
      chart: ["Bank|Fishing Bank|Cod Bank|Wreck Bank|Oyster Bank|Convoy Bank|Trawling Bank|Sandbank|Siren's Bank|Shoal", "Reef|Rock Reef|Wreck Reef|Galleon Reef|Oyster Reef|Corsair Reef|Dive Reef|Surf Reef|Drowned Reef|Rock", "Channel|Fishing Channel|Gallic Channel|Pilot Channel|Oyster Channel|Convoy Channel|Ferry Channel|Shipping Channel|Siren Channel|Passage"],
    },
    route: [
      "Roman Road|Gallic Causeway|Pilgrim Road|Royal Road|Post Road|Coach Road|Main Road|Motorway|Ghost Road|Highway",
      "Drove Road|Salt Road|Wine Road|Cloth Road|Silk Road|Towpath|Rail Freight Line|Freight Corridor|Smugglers' Road|Trade Road",
      "Pilgrim Way|Saint's Way|Hermit's Path|Procession Way|Mountain Pilgrimage|Rosary Way|Pilgrim Hostel Road|Walking Route|Enchanted Way|Holy Road",
    ],
    sacred: [
      "Holy Well|Healing Spring|Saint's Fountain|Baptismal Pool|Spa Spring|Lourdes Spring|Fountain Shrine|Spa Pool|Fairy Fountain|Spring",
      "Calvary|Roadside Cross|Hermitage Rock|Menhir Cross|Boundary Cross|Stone Cross|War Memorial Cross|Summit Cross|Giant's Cross|Standing Stone",
      "Hermitage|Gallic Chapel|Abbey|Cathedral|Parish Church|Procession Shrine|Pilgrimage Church|Memorial Chapel|Enchanted Church|Chapel",
    ],
  },
};
