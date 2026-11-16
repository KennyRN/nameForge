// Portuguese (brief 6a): the generic first; serras, estuaries and capes, caravel harbours, cork oak and salt pans, holy crosses and quintas, in English.
export default {
  key: "portuguese", label: "Portuguese", style: "first",
  land: {
    B: "Cork Oak|Olive|Vine|Port Wine|Chestnut|Cattle|Eucalyptus|Granite|Rice|Orange",
    C: "Enchanted Moorish Girl|Dragon|Werewolf|Wild Man|Ghost Procession|Giant",
    D: "Castro;AN-MD|Moorish Fort;AN-MD|Hermitage;AN-MD|Shepherd's Hut;AN-MD|Border Castle;AN-MD|Monastery;MD|Pilgrim Hospice;MD|Wine Terrace;EM-MO|Quinta;EM-ST|Railway Halt;ST-MO|Reservoir;ST-MO|Granite Quarry;EM-MO|Surf Camp;MO|Wind Farm;MO",
  },
  water: {
    B: "Salt|Cod|Sardine|Cork|Port|Spice|Fish|Whale|Caravel|Pearl",
    C: "Sea Serpent|Drowned City|Mermaid|Lost Fleet|Sea Giant|Phantom Caravel",
    D: "Fish Weir;AN-MD|Moorish Watchtower;AN-MD|Saltern;AN-MD|Pilgrim Landing;MD|Caravel Port;MD|Whaling Station;EM-ST|Naval Dockyard;EM-ST|Lighthouse;EM-MO|Cod Drying Ground;EM-ST|Ferry Terminal;ST-MO|Marina;MO|Surf Beach;MO",
  },
  route: {
    N: "Roman Road|Pilgrim Way|Royal Road|Mule Track|Mountain Pass|Cattle Track",
    B: "Cork|Wine|Salt|Cod|Spice|Olive Oil|Mule|Pilgrims'",
    C: "Moorish|Ghost|Dragon's|Giants'|Phantom|Enchanted",
    D: "Roman Road;AN-MD|Pilgrim Way;AN-MD|Cattle Track;AN-MD|Moorish Causeway;AN-MD|Royal Road;MD|Mule Track;MD|Mail Coach Road;EM-ST|Wine Road;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Motorway;MO|Bypass;MO|High-Speed Line;MO",
  },
  sacred: {
    N: "Holy Well|Holy Cross|Hermitage|Shrine|Chapel|Cathedral",
    B: "Saint's|Pilgrims'|Hermit's|Healing|Holy|Virgin's",
    C: "Moorish|Enchanted|Giant's|Drowned|Phantom",
    D: "Hermitage;AN-MD|Roman Temple;AN-MD|Holy Well;AN-MD|Roadside Cross;AN-MD|Cathedral;MD|Monastery;MD|Pilgrim Chapel;EM-ST|Procession Shrine;EM-ST|Sanctuary;ST-MO|Fatima Shrine;ST-MO|Pilgrimage Church;MO",
  },
  nouns: {
    land: {
      mountain: ["Castro Peak|Moorish Peak|Hermit's Peak|Granite Peak|Shepherd's Peak|Cross Peak|Summit Cross|Radio Peak|Giant's Peak|Bare Peak", "Serra Spine|Border Ridge|Pass Ridge|Granite Ridge|Mule Ridge|Mine Ridge|Skyline Ridge|Hang-glider Ridge|Dragon's Back|Long Ridge", "Serra|Border Mountains|Highlands|Granite Hills|Drove Mountains|Royal Hunting Range|National Park|Ski Range|Enchanted Mountains|Great Serra"],
      wood: ["Cork Oak Forest|Pine Forest|Royal Forest|Charcoal Forest|Eucalyptus Plantation|Shipbuilders' Pinewood|Nature Reserve|Picnic Forest|Enchanted Forest|Great Forest", "Olive Grove|Chestnut Grove|Hermit's Grove|Cork Grove|Almond Grove|Orange Grove|Memorial Grove|Pine Grove|Wild Man's Grove|Old Grove", "Cork Glade|Charcoal Clearing|Hunters' Clearing|Pig Clearing|Resin Clearing|Firebreak|Picnic Clearing|Camping Glade|Fairy Ring|Clearing"],
      moor: ["Scrub Moor|Shepherds' Moor|Heath Moor|Broom Moor|Mule Moor|Mining Moor|Wind Farm Moor|Shooting Moor|Ghost Moor|Open Moor", "Barrow Hill|Moorish Hill|Border Hill|Beacon Hill|Windmill Hill|Mine Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Standing Stone|Dolmen|Boundary Stone|Wayside Cross|Milestone|Stone Cross|Trig Pillar|Heritage Stone|Giant's Stone|Rock"],
      wet: ["Salt Marsh|Rice Marsh|Reed Marsh|Estuary Marsh|Reclaimed Marsh|Wildfowl Marsh|Nature Reserve Marsh|Reedbed|Moorish Girl's Marsh|Marsh", "Peat Bog|Lagoon|Tidal Flat|Saltpan Bog|Cut Bog|Reservoir Bog|Wetland Trail|Birdwatchers' Bog|Lantern Bog|Bog", "Lagoon Isle|Reed Isle|Fishermen's Isle|Rice Isle|Duck Isle|Salt Isle|Heron Island|Flamingo Island|Drowned Isle|Isle"],
      grass: ["Fertile Plain|Wheat Plain|Shepherds' Plain|Cattle Plain|Enclosed Plain|Irrigated Plain|Grazing Plain|Solar Plain|Moorish Plain|Great Plain", "Cattle Pasture|Hill Pasture|Winter Pasture|Drove Pasture|Enclosed Pasture|Bull Pasture|Grazing Common|Sheep Run|Enchanted Pasture|Green Slope", "Fertile Vale|Orchard Vale|Mill Vale|Water Meadow|Reservoir Vale|Port Wine Vale|Bypass Vale|Hidden Vale|Moorish Vale|Vale"],
      lands: ["Kingdom|Border County|County|Lordship|Province|Captaincy|Region|District|Lost Kingdom|Lands", "Frontier March|Royal Domain|Duchy|Marquisate|Colony|Province|Council District|Metropolitan Area|Moorish Taifa|Territory", "Parish|Hundred|Town Lands|Common Lands|Municipality|Council Area|Civil Parish|Neighbourhood|Haunted Parish|Lands"],
      farm: ["Wheat Field|Open Field|Olive Field|Vine Field|Irrigated Field|Orange Field|Greenhouse Field|Solar Field|Moorish Field|Field", "Quinta|Herdade|Sheepfold Farm|Wine Estate|Bull Farm|Olive Estate|Rural Hotel|Organic Farm|Enchanted Farm|Farm", "Sheep Pen|Cattle Enclosure|Stud Enclosure|Hunting Enclosure|Walled Garden|Orchard|Paddock|Allotment|Giant's Fold|Enclosure"],
      hill: ["Hill|Castro Hill|Hermit's Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Ravine|Moorish Valley|Pilgrim Valley|Mine Valley|Railway Valley|Reservoir Valley|Bypass Valley|Hidden Valley|Enchanted Valley|Valley", "Hill Spur|Border Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Quarry Ridge|Skyline|Hill Walk|Dragon's Back|Ridge"],
      river: ["Mountain Stream|Moorish Channel|Mill Stream|Mule Ford|Irrigation Channel|Cutting|Fishing Stream|Kayak Stream|Moorish Girl's Stream|Brook", "Reservoir|Oxbow Lake|Fish Pond|Millpond|Mining Lake|Water Reservoir|Lake Beach|Swimming Lake|Enchanted Lake|Lake", "Mountain Falls|Mill Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Viewpoint Falls|Canyoning Gorge|Dragon's Falls|Waterfall"],
    },
    water: {
      sea: ["Bay|Fishing Bay|Moorish Bay|Whaling Bay|Spice Bay|Anchorage|Naval Bay|Fish Farm Bay|Mermaid's Bay|Great Bay", "Estuary|Ria|Salt Estuary|Fish Estuary|Harbour Estuary|Shipyard Estuary|Marina Estuary|Beach Estuary|Drowned Estuary|Creek", "Strait|Moorish Strait|Pilgrim Strait|Pirate Strait|Spice Strait|Convoy Strait|Ferry Strait|Shipping Lane|Pillars Strait|Channel"],
      coast: ["Cape|Headland|Watch Headland|Moorish Headland|Fisher's Headland|Whaling Headland|Lighthouse Headland|Clifftop Walk|Mermaid's Headland|Point", "Cove|Smugglers' Cove|Fishermen's Cove|Pirate Cove|Spice Cove|Salt Cove|Beach Cove|Naturist Cove|Enchanted Cove|Beach", "Island|Hermit's Island|Moorish Island|Fisher Island|Discovery Island|Penal Island|Holiday Island|Resort Island|Mermaid Island|Islet"],
      chart: ["Bank|Fishing Bank|Cod Bank|Wreck Bank|Spice Bank|Convoy Bank|Trawling Bank|Sandbank|Mermaid's Bank|Shoal", "Reef|Coral Reef|Wreck Reef|Caravel Reef|Spice Reef|Pirate Reef|Dive Reef|Surf Reef|Drowned Reef|Rock", "Channel|Fishing Channel|Moorish Channel|Pilot Channel|Spice Channel|Convoy Channel|Ferry Channel|Shipping Channel|Mermaid Channel|Passage"],
    },
    route: [
      "Roman Road|Moorish Causeway|Pilgrim Road|Royal Road|Mail Road|Mule Road|Main Road|Motorway|Ghost Road|Highway",
      "Cattle Track|Salt Road|Cork Road|Cod Road|Wine Road|Mule Track|Rail Freight Line|Freight Corridor|Smugglers' Road|Trade Road",
      "Pilgrim Way|Saint's Way|Hermit's Path|Procession Way|Mountain Pilgrimage|Rosary Way|Pilgrim Hostel Road|Walking Route|Enchanted Way|Holy Road",
    ],
    sacred: [
      "Holy Well|Healing Spring|Saint's Fountain|Baptismal Pool|Spa Spring|Fatima Spring|Fountain Shrine|Spa Pool|Moorish Fountain|Spring",
      "Holy Cross|Roadside Cross|Hermitage Rock|Calvary|Boundary Cross|Stone Cross|War Memorial Cross|Summit Cross|Giant's Cross|Standing Stone",
      "Hermitage|Roman Chapel|Monastery|Cathedral|Parish Church|Procession Shrine|Pilgrimage Church|Memorial Chapel|Enchanted Church|Chapel",
    ],
  },
};
