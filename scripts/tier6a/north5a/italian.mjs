// Italian (brief 6a): the generic first; hill towns, free communes, loggias and campaniles, lagoons and terraces, in English.
export default {
  key: "italian", label: "Italian", style: "first",
  land: {
    B: "Olive|Vine|Marble|Chestnut|Truffle|Wheat|Rice|Lemon|Sulphur|Cypress",
    C: "Fairy|Dragon|Werewolf|Witch|Wild Hunt|Giant",
    D: "Etruscan Tomb;AN-MD|Roman Villa;AN-MD|Hermitage;AN-MD|Fortress;MD|Free Commune;MD|Monastery;MD|Watchtower;MD|Villa;EM-ST|Marble Quarry;EM-MO|Terrace Vineyard;EM-ST|Railway Halt;ST-MO|Sulphur Mine;ST-MO|Autostrada Service Area;MO|Wind Farm;MO",
  },
  water: {
    B: "Salt|Tuna|Sardine|Coral|Wine|Lemon|Fish|Glass|Pearl|Anchovy",
    C: "Sea Serpent|Drowned City|Siren|Sea Witch|Sea Giant|Phantom Galley",
    D: "Fish Weir;AN-MD|Roman Harbour;AN-MD|Saltern;AN-MD|Abbey Landing;MD|Galley Port;MD|Arsenal;MD|Lagoon Fort;EM-ST|Lighthouse;EM-MO|Seaside Promenade;ST-MO|Ferry Terminal;ST-MO|Marina;MO|Beach Resort;MO",
  },
  route: {
    N: "Roman Road|Pilgrim Way|Via|Mule Track|Mountain Pass|Drove Road",
    B: "Wine|Salt|Silk|Marble|Wool|Olive Oil|Glass|Pilgrims'",
    C: "Witch's|Ghost|Dragon's|Giants'|Phantom|Wild Hunt's",
    D: "Roman Road;AN-MD|Pilgrim Way;AN-MD|Drove Road;AN-MD|Etruscan Track;AN-MD|Merchant Road;MD|Mule Track;MD|Post Road;EM-ST|Canal Towpath;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Motorway;MO|Ring Road;MO|High-Speed Line;MO",
  },
  sacred: {
    N: "Holy Well|Holy Spring|Calvary|Shrine|Chapel|Cathedral",
    B: "Saint's|Pilgrims'|Hermit's|Healing|Holy|Virgin's",
    C: "Witch's|Etruscan|Giant's|Drowned|Phantom",
    D: "Etruscan Sanctuary;AN-MD|Holy Well;AN-MD|Hermitage;AN-MD|Roadside Shrine;AN-MD|Cathedral;MD|Monastery;MD|Pilgrim Chapel;EM-ST|Procession Shrine;EM-ST|Sanctuary;ST-MO|War Memorial Chapel;ST-MO|Pilgrimage Church;MO",
  },
  nouns: {
    land: {
      mountain: ["Watch Peak|Hermit's Peak|Beacon Peak|Marble Peak|Shepherd's Peak|Alpine Peak|Summit Cross|Cable Car Peak|Giant's Peak|Bare Peak", "Pass Ridge|Border Ridge|Apennine Ridge|Marble Ridge|Smugglers' Ridge|Mine Ridge|Skyline Ridge|Paragliding Ridge|Dragon's Back|Long Ridge", "Great Range|Border Mountains|Highlands|Marble Hills|Drove Mountains|Hunting Range|National Park|Ski Range|Enchanted Mountains|Great Range"],
      wood: ["Chestnut Forest|Oak Forest|Hunting Forest|Charcoal Forest|Pine Plantation|Shipbuilders' Forest|Nature Reserve|Picnic Forest|Enchanted Forest|Great Forest", "Olive Grove|Chestnut Grove|Hermit's Grove|Cypress Grove|Walnut Grove|Lemon Grove|Memorial Grove|Pine Grove|Witch's Grove|Old Grove", "Truffle Glade|Charcoal Clearing|Hunters' Clearing|Boar Glade|Wood Yard|Firebreak|Picnic Clearing|Camping Glade|Fairy Ring|Clearing"],
      moor: ["Scrub Moor|Shepherds' Moor|Heath Moor|Broom Moor|Mule Moor|Mining Moor|Wind Farm Moor|Shooting Moor|Ghost Moor|Open Moor", "Etruscan Hill|Barrow Hill|Border Hill|Beacon Hill|Windmill Hill|Mine Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Standing Stone|Etruscan Tomb|Boundary Stone|Wayside Shrine|Milestone|Stone Cross|Trig Pillar|Heritage Stone|Giant's Stone|Rock"],
      wet: ["Salt Marsh|Lagoon Marsh|Reed Marsh|Drained Marsh|Reclaimed Marsh|Wildfowl Marsh|Nature Reserve Marsh|Reedbed|Witch's Marsh|Marsh", "Peat Bog|Lagoon|Tidal Flat|Saltpan Bog|Cut Bog|Reservoir Bog|Wetland Trail|Birdwatchers' Bog|Lantern Bog|Bog", "Lagoon Isle|Reed Isle|Fishermen's Isle|Rice Isle|Duck Isle|Salt Isle|Heron Island|Flamingo Island|Drowned Isle|Isle"],
      grass: ["Fertile Plain|Wheat Plain|Rice Plain|Cattle Plain|Enclosed Plain|Irrigated Plain|Grazing Plain|Solar Plain|Etruscan Plain|Great Plain", "Hill Pasture|Summer Pasture|Winter Pasture|Drove Pasture|Enclosed Pasture|Buffalo Pasture|Grazing Common|Sheep Run|Enchanted Pasture|Green Slope", "Fertile Vale|Orchard Vale|Mill Vale|Water Meadow|Canal Vale|Wine Vale|Bypass Vale|Hidden Vale|Fairy Vale|Vale"],
      lands: ["Kingdom|County|Duchy|Lordship|Free Commune|Republic|Region|Province|Lost Kingdom|Lands", "Papal Domain|Marquisate|Seigniory|Barony|League|Province|Canton|Metropolitan Area|Etruscan League|Territory", "Parish|Hundred|Town Lands|Common Lands|Commune|Council Area|Civil Parish|Neighbourhood|Haunted Parish|Lands"],
      farm: ["Wheat Field|Open Field|Rice Field|Vine Field|Irrigated Field|Orchard Field|Sunflower Field|Solar Field|Fairy Field|Field", "Villa Farm|Manor Farm|Sheepfold Farm|Wine Estate|Dairy Farm|Olive Estate|Farm Stay|Organic Farm|Enchanted Farm|Farm", "Sheep Pen|Cattle Enclosure|Stud Enclosure|Hunting Enclosure|Walled Garden|Orchard|Paddock|Allotment|Giant's Fold|Enclosure"],
      hill: ["Hill|Hill Town Hill|Hermit's Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Gorge|Roman Valley|Pilgrim Valley|Mine Valley|Canal Valley|Reservoir Valley|Bypass Valley|Hidden Valley|Enchanted Valley|Valley", "Hill Spur|Border Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Quarry Ridge|Skyline|Hill Walk|Dragon's Back|Ridge"],
      river: ["Mountain Stream|Roman Channel|Mill Stream|Ford|Mill Race|Cutting|Fishing Stream|Kayak Stream|Witch's Stream|Brook", "Lake|Oxbow Lake|Fish Pond|Millpond|Mining Lake|Water Reservoir|Lake Beach|Swimming Lake|Enchanted Lake|Pond", "Mountain Falls|Mill Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Viewpoint Falls|Canyoning Gorge|Dragon's Falls|Waterfall"],
    },
    water: {
      sea: ["Bay|Fishing Bay|Roman Bay|Galley Bay|Coral Bay|Anchorage|Naval Bay|Fish Farm Bay|Siren's Bay|Great Bay", "Gulf|Lagoon Inlet|Salt Inlet|Fish Inlet|Harbour Inlet|Shipyard Inlet|Marina Inlet|Beach Inlet|Drowned Inlet|Creek", "Strait|Roman Strait|Pilgrim Strait|Corsair Strait|Convoy Strait|Blockade Strait|Ferry Strait|Shipping Lane|Pillars Strait|Channel"],
      coast: ["Headland|Cape|Watch Headland|Roman Headland|Fisher's Headland|Tuna Headland|Lighthouse Headland|Clifftop Walk|Siren's Headland|Point", "Cove|Smugglers' Cove|Fishermen's Cove|Corsair Cove|Coral Cove|Salt Cove|Beach Cove|Naturist Cove|Enchanted Cove|Beach", "Island|Hermit's Island|Abbey Island|Fisher Island|Prison Island|Penal Island|Holiday Island|Resort Island|Siren Island|Islet"],
      chart: ["Bank|Fishing Bank|Tuna Bank|Wreck Bank|Coral Bank|Convoy Bank|Trawling Bank|Sandbank|Siren's Bank|Shoal", "Reef|Rock Reef|Wreck Reef|Galley Reef|Coral Reef|Corsair Reef|Dive Reef|Surf Reef|Drowned Reef|Rock", "Channel|Fishing Channel|Roman Channel|Pilot Channel|Coral Channel|Convoy Channel|Ferry Channel|Shipping Channel|Siren Channel|Passage"],
    },
    route: [
      "Roman Road|Etruscan Causeway|Pilgrim Road|Papal Road|Post Road|Coach Road|Main Road|Motorway|Ghost Road|Highway",
      "Drove Road|Salt Road|Wine Road|Marble Road|Silk Road|Towpath|Rail Freight Line|Freight Corridor|Smugglers' Road|Trade Road",
      "Pilgrim Way|Saint's Way|Hermit's Path|Procession Way|Mountain Pilgrimage|Rosary Way|Pilgrim Hostel Road|Walking Route|Enchanted Way|Holy Road",
    ],
    sacred: [
      "Holy Well|Healing Spring|Saint's Fountain|Baptismal Pool|Spa Spring|Thermal Spring|Fountain Shrine|Spa Pool|Witch's Fountain|Spring",
      "Calvary|Roadside Shrine|Hermitage Rock|Etruscan Tomb|Boundary Cross|Stone Cross|War Memorial Cross|Summit Cross|Giant's Cross|Standing Stone",
      "Hermitage|Etruscan Temple|Monastery|Cathedral|Parish Church|Procession Shrine|Pilgrimage Church|Memorial Chapel|Enchanted Church|Chapel",
    ],
  },
};
