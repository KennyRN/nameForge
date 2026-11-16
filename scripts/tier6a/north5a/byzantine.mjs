// Byzantine (brief 6a): from late antiquity, the generic first; fortresses, monasteries and hermitages, cave churches, icons, harbours and imperial roads, in English.
export default {
  key: "byzantine", label: "Byzantine", style: "first",
  land: {
    B: "Olive|Silk|Wheat|Vine|Honey|Salt|Iron|Alum|Goat|Lead",
    C: "Neraida|Dragon|Kallikantzaros|Revenant|Shades|Giant",
    D: "Roman Fort;AN-MD|Hermitage;AN-MD|Cave Church;AN-MD|Shepherd's Hut;AN-MD|Monastery;MD|Fortress;MD|Watchtower;MD|Pronoia Estate;MD|Ottoman Fort;EM-ST|Khan;EM-ST|Railway Halt;ST-MO|Mine;ST-MO|Pilgrim Hostel;MO|Wind Farm;MO",
  },
  water: {
    B: "Olive Oil|Silk|Tuna|Alum|Wine|Salt|Fish|Sponge|Dromon|Coral",
    C: "Sea Serpent|Drowned City|Siren|Sea Giant|Phantom Dromon|Lamia",
    D: "Fish Weir;AN-MD|Harbour Chain;AN-MD|Shipshed;AN-MD|Lighthouse;AN-MD|Monastery Landing;MD|Imperial Dock;MD|Quarantine Station;EM-ST|Sponge Fishery;EM-ST|Seaside Promenade;ST-MO|Ferry Terminal;ST-MO|Marina;MO|Beach Taverna;MO",
  },
  route: {
    N: "Imperial Road|Pilgrim Way|Mule Track|Mountain Pass|Coast Road|Goat Track",
    B: "Silk|Wine|Alum|Salt|Honey|Olive Oil|Grain|Pilgrims'",
    C: "Neraida's|Ghost|Dragon's|Giants'|Phantom|Revenants'",
    D: "Imperial Road;AN-MD|Roman Road;AN-MD|Mule Track;AN-MD|Procession Road;AN-MD|Paved Road;AN-MD|Pilgrim Way;MD|Drove Road;MD|Caravan Road;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Motorway;MO|Ring Road;MO|Hiking Trail;MO",
  },
  sacred: {
    N: "Holy Spring|Icon Shrine|Hermitage|Shrine|Chapel|Great Church",
    B: "Saint's|Healing|Holy|Hermit's|Icon's|Virgin's",
    C: "Neraida's|Revenant's|Giant's|Drowned|Phantom",
    D: "Holy Spring;AN-MD|Cave Church;AN-MD|Hermitage;AN-MD|Icon Shrine;AN-MD|Great Church;MD|Monastery Church;MD|Relic Shrine;MD|Saint's Tomb;MD|Pilgrim Chapel;EM-ST|Procession Shrine;EM-ST|War Memorial Chapel;ST-MO|Pilgrimage Church;MO|Open-air Chapel;MO",
  },
  nouns: {
    land: {
      mountain: ["Watch Peak|Hermit's Peak|Fortress Peak|Marble Peak|Shepherd's Peak|Monastery Peak|Summit Chapel|Cable Car Peak|Giant's Peak|Bare Peak", "Pass Ridge|Border Ridge|Imperial Ridge|Marble Ridge|Brigands' Ridge|Mine Ridge|Skyline Ridge|Hiking Ridge|Dragon's Back|Long Ridge", "Holy Mountain|Border Mountains|Highlands|Marble Hills|Drove Mountains|Hermits' Mountains|National Park|Ski Range|Giants' Mountains|Great Range"],
      wood: ["Imperial Forest|Oak Forest|Hunting Forest|Pine Forest|Fir Plantation|Shipbuilders' Forest|Nature Reserve|Picnic Forest|Neraidas' Forest|Great Forest", "Monastery Grove|Olive Grove|Hermit's Grove|Cypress Grove|Chestnut Grove|Fig Grove|Memorial Grove|Pine Grove|Neraida's Grove|Old Grove", "Honey Clearing|Charcoal Clearing|Hunters' Clearing|Goat Glade|Wood Yard|Firebreak|Picnic Clearing|Camping Glade|Revenant's Ring|Clearing"],
      moor: ["Scrub Moor|Shepherds' Moor|Heath Moor|Thyme Moor|Goat Moor|Mining Moor|Wind Farm Moor|Shooting Moor|Ghost Moor|Open Moor", "Tomb Hill|Fortress Hill|Border Hill|Beacon Hill|Windmill Hill|Mine Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Standing Stone|Saint's Tomb|Boundary Stone|Wayside Icon|Milestone|Stone Cross|Trig Pillar|Heritage Stone|Giant's Stone|Rock"],
      wet: ["Salt Marsh|Lagoon Marsh|Reed Marsh|Drained Marsh|Reclaimed Marsh|Wildfowl Marsh|Nature Reserve Marsh|Reedbed|Neraida's Marsh|Marsh", "Peat Bog|Lagoon|Tidal Flat|Saltpan Bog|Cut Bog|Reservoir Bog|Wetland Trail|Birdwatchers' Bog|Lantern Bog|Bog", "Lagoon Isle|Reed Isle|Monastery Isle|Fishermen's Isle|Duck Isle|Salt Isle|Heron Island|Flamingo Island|Drowned Isle|Isle"],
      grass: ["Fertile Plain|Wheat Plain|Imperial Plain|Horse Plain|Enclosed Plain|Irrigated Plain|Grazing Plain|Solar Plain|Lost Plain|Great Plain", "Goat Pasture|Hill Pasture|Summer Pasture|Drove Pasture|Enclosed Pasture|Sheep Pasture|Grazing Common|Sheep Run|Enchanted Pasture|Green Slope", "Fertile Vale|Orchard Vale|Mill Vale|Water Meadow|Olive Vale|Wine Vale|Bypass Vale|Hidden Vale|Neraida's Vale|Vale"],
      lands: ["Theme|Province|Empire|Despotate|Exarchate|Principality|Region|District|Lost Empire|Lands", "Imperial Domain|Monastic Republic|Pronoia|Catepanate|Duchy|Island Realm|Canton|Metropolitan Area|Revenants' Realm|Territory", "Parish|Bandon|Town Lands|Common Lands|Municipality|Council Area|Civil Parish|Neighbourhood|Haunted Parish|Lands"],
      farm: ["Wheat Field|Open Field|Olive Field|Vine Field|Irrigated Field|Orchard Field|Sunflower Field|Solar Field|Neraida's Field|Field", "Estate Farm|Monastery Farm|Sheepfold Farm|Wine Estate|Dairy Farm|Olive Estate|Farm Stay|Organic Farm|Enchanted Farm|Farm", "Sheep Pen|Goat Enclosure|Stud Enclosure|Hunting Enclosure|Walled Garden|Orchard|Paddock|Allotment|Giant's Fold|Enclosure"],
      hill: ["Hill|Fortress Hill|Hermit's Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Gorge|Hermits' Valley|Pilgrim Valley|Mine Valley|Railway Valley|Reservoir Valley|Bypass Valley|Hidden Valley|Enchanted Valley|Valley", "Hill Spur|Border Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Quarry Ridge|Skyline|Hill Walk|Dragon's Back|Ridge"],
      river: ["Mountain Stream|Holy Stream|Mill Stream|Ford|Mill Race|Cutting|Fishing Stream|Kayak Stream|Neraida's Stream|Brook", "Lake|Monastery Lake|Fish Pond|Millpond|Mining Lake|Water Reservoir|Lake Beach|Swimming Lake|Enchanted Lake|Pond", "Mountain Falls|Mill Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Viewpoint Falls|Canyoning Gorge|Giant's Falls|Waterfall"],
    },
    water: {
      sea: ["Bay|Fishing Bay|Imperial Bay|Dromon Bay|Silk Bay|Anchorage|Naval Bay|Fish Farm Bay|Siren's Bay|Great Bay", "Gulf|Harbour Inlet|Salt Inlet|Fish Inlet|Sponge Inlet|Shipyard Inlet|Marina Inlet|Beach Inlet|Drowned Inlet|Creek", "Strait|Imperial Strait|Pilgrim Strait|Pirate Strait|Grain Strait|Convoy Strait|Ferry Strait|Shipping Lane|Pillars Strait|Channel"],
      coast: ["Headland|Cape|Watch Headland|Monastery Headland|Fisher's Headland|Sponge Headland|Lighthouse Headland|Clifftop Walk|Siren's Headland|Point", "Cove|Smugglers' Cove|Fishermen's Cove|Pirate Cove|Silk Cove|Salt Cove|Beach Cove|Naturist Cove|Enchanted Cove|Beach", "Island|Hermit's Island|Monastery Island|Fisher Island|Exile Island|Penal Island|Holiday Island|Resort Island|Siren Island|Islet"],
      chart: ["Bank|Fishing Bank|Tuna Bank|Wreck Bank|Sponge Bank|Convoy Bank|Trawling Bank|Sandbank|Siren's Bank|Shoal", "Reef|Rock Reef|Wreck Reef|Dromon Reef|Coral Reef|Pirate Reef|Dive Reef|Surf Reef|Drowned Reef|Rock", "Channel|Fishing Channel|Imperial Channel|Pilot Channel|Grain Channel|Convoy Channel|Ferry Channel|Shipping Channel|Siren Channel|Passage"],
    },
    route: [
      "Imperial Road|Procession Road|Pilgrim Road|Paved Road|Post Road|Coach Road|Main Road|Motorway|Ghost Road|Highway",
      "Silk Road|Salt Road|Wine Road|Alum Road|Honey Road|Olive Oil Road|Rail Freight Line|Freight Corridor|Smugglers' Road|Trade Road",
      "Pilgrim Way|Saint's Way|Hermit's Path|Procession Way|Monastery Path|Rosary Way|Pilgrim Hostel Road|Walking Route|Enchanted Way|Holy Road",
    ],
    sacred: [
      "Holy Spring|Healing Spring|Fountain Shrine|Baptismal Pool|Spa Spring|Thermal Spring|Saint's Fountain|Spa Pool|Neraida's Fountain|Spring",
      "Icon Shrine|Roadside Shrine|Hermitage Rock|Saint's Tomb|Boundary Cross|Stone Cross|War Memorial Cross|Summit Chapel|Giant's Cross|Standing Stone",
      "Great Church|Cave Church|Monastery|Treasury|Parish Church|Procession Shrine|Pilgrimage Church|Memorial Chapel|Enchanted Church|Chapel",
    ],
  },
};
