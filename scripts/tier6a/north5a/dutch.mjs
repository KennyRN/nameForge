// Dutch (brief 6a): the generic last; dikes and polders, dunes, meres and fens, canals and windmills, in English. No mountains: the peaks, ridges and ranges are dunes, rises and ridges of hills.
export default {
  key: "dutch", label: "Dutch", style: "last",
  land: {
    B: "Peat|Cheese|Tulip|Herring|Cattle|Windmill|Brick|Flax|Turf|Clay",
    C: "Water Spirit|Drowned Village|Will-o'-the-Wisp|White Lady|Hellhound|Giant",
    D: "Dwelling Mound;AN-MD|Dike;AN-MD|Peat Cutting;AN-MD|Abbey Farm;MD|Polder;MD|Windmill;MD|Beacon;MD|Drainage Mill;EM-ST|Canal Lock;EM-ST|Brickworks;EM-ST|Railway Halt;ST-MO|Tulip Field;ST-MO|Motorway Service Area;MO|Wind Farm;MO",
  },
  water: {
    B: "Herring|Eel|Cod|Salt|Peat|Cheese|Whale|Spice|Tulip|Brick",
    C: "Sea Spirit|Drowned City|Mermaid|Sea Giant|Phantom Ship|Flying Dutchman's",
    D: "Fish Weir;AN-MD|Terp;AN-MD|Dike Gate;AN-MD|Herring Quay;MD|Sluice;MD|Whaling Station;EM-ST|East India Wharf;EM-ST|Lighthouse;EM-MO|Seaside Pavilion;ST-MO|Ferry Terminal;ST-MO|Marina;MO|Storm Surge Barrier;MO",
  },
  route: {
    N: "Dike Road|Towpath|Causeway|Peat Road|Cattle Track|Ferry Road",
    B: "Peat|Cheese|Herring|Cloth|Spice|Tulip|Brick|Barge",
    C: "Ghost|Water Spirit's|Giants'|Phantom|Hellhound's|Drowned",
    D: "Dike Road;AN-MD|Causeway;AN-MD|Peat Road;AN-MD|Ferry Road;MD|Pilgrim Way;MD|Barge Canal;EM-ST|Towpath;EM-ST|Trekschuit Canal;EM-ST|Railway Line;ST-MO|Tram Line;ST-MO|Motorway;MO|Cycle Path;MO|High-Speed Line;MO",
  },
  sacred: {
    N: "Holy Well|Holy Tree|Cloister Garden|Shrine|Chapel|Church",
    B: "Saint's|Pilgrims'|Hermit's|Healing|Holy|Virgin's",
    C: "Water Spirit's|Elf|Giant's|Drowned|Phantom",
    D: "Sacred Grove;AN-MD|Holy Well;AN-MD|Hermitage;AN-MD|Roadside Cross;AN-MD|Cathedral;MD|Beguinage;MD|Hidden Church;EM-ST|Procession Shrine;EM-ST|Windmill Chapel;ST-MO|Memorial Chapel;ST-MO|Pilgrimage Church;MO",
  },
  nouns: {
    land: {
      mountain: ["Great Dune|Dune Top|Beacon Dune|Sand Dune|Shepherd's Dune|Lookout Dune|Memorial Dune|Viewpoint Dune|Giant's Dune|High Dune", "Dune Ridge|Dike Ridge|Terp Ridge|Sand Ridge|Moraine Ridge|Mine Ridge|Cycle Ridge|Skyline Ridge|Dragon's Back|Long Ridge", "Dunes|Dune Coast|Hill Country|Moraine Hills|Heath Hills|Sand Hills|National Park|Dune Park|Giants' Dunes|Great Dunes"],
      wood: ["Beech Forest|Oak Forest|Hunting Forest|Charcoal Forest|Pine Plantation|Shipbuilders' Forest|Nature Reserve|Picnic Forest|Enchanted Forest|Great Forest", "Alder Grove|Willow Grove|Hermit's Grove|Beech Grove|Elm Grove|Orchard Grove|Memorial Grove|Poplar Grove|White Lady's Grove|Old Grove", "Heath Clearing|Charcoal Clearing|Hunters' Clearing|Peat Clearing|Wood Yard|Firebreak|Picnic Clearing|Camping Glade|Elf Ring|Clearing"],
      moor: ["Peat Moor|Shepherds' Moor|Heath Moor|Cotton Grass Moor|Turf Moor|Reclaimed Moor|Wind Farm Moor|Shooting Moor|Ghost Moor|Open Moor", "Barrow Hill|Dwelling Hill|Border Hill|Beacon Hill|Windmill Hill|Sand Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Hunebed|Standing Stone|Boundary Stone|Wayside Cross|Milestone|Stone Cross|Trig Pillar|Heritage Stone|Giant's Stone|Rock"],
      wet: ["Peat Fen|Reed Fen|Salt Marsh|Drained Fen|Reclaimed Fen|Wildfowl Fen|Nature Reserve Fen|Reedbed|Water Spirit's Fen|Fen", "Peat Bog|Moss Bog|Raised Bog|Turf Bog|Cut Bog|Drained Bog|Wetland Trail|Birdwatchers' Bog|Lantern Bog|Bog", "Reed Isle|Peat Isle|Fishermen's Isle|Willow Isle|Duck Isle|Polder Isle|Heron Island|Stork Island|Drowned Isle|Isle"],
      grass: ["Fertile Plain|Clay Plain|Polder Plain|Cattle Plain|Enclosed Plain|Irrigated Plain|Grazing Plain|Solar Plain|Drowned Plain|Great Plain", "Cattle Meadow|Hay Meadow|Summer Meadow|Dike Meadow|Enclosed Meadow|Dairy Meadow|Grazing Common|Sheep Run|Enchanted Meadow|Green Meadow", "Fertile Vale|Orchard Vale|Mill Vale|Water Meadow|Canal Vale|Bulb Vale|Bypass Vale|Hidden Vale|Elf Vale|Vale"],
      lands: ["Lordship|County|Duchy|Water Board|Province|Bailiwick|Region|Land|Lost Land|Lands", "Bishop's Domain|Marquisate|Seigniory|Barony|Republic|Province|Canton|Metropolitan Area|Sunken Kingdom|Territory", "Parish|Hundred|Town Lands|Common Lands|Municipality|Council Area|Civil Parish|Neighbourhood|Haunted Parish|Lands"],
      farm: ["Dike Field|Open Field|Flax Field|Reclaimed Field|Irrigated Field|Orchard Field|Tulip Field|Solar Field|Elf Field|Field", "Terp Farm|Manor Farm|Dairy Farm|Cheese Farm|Cattle Farm|Bulb Farm|Farm Stay|Organic Farm|Enchanted Farm|Farm", "Sheep Pen|Cattle Enclosure|Stud Enclosure|Hunting Enclosure|Walled Garden|Orchard|Paddock|Allotment|Giant's Fold|Enclosure"],
      hill: ["Hill|Dwelling Mound|Hermit's Hill|Mill Hill|Sand Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Hollow|Dike Valley|Pilgrim Valley|Peat Valley|Canal Valley|Reservoir Valley|Bypass Valley|Hidden Valley|Enchanted Valley|Valley", "Hill Spur|Moraine Ridge|Terraced Ridge|Sand Ridge|Cutting Ridge|Quarry Ridge|Skyline|Hill Walk|Dragon's Back|Ridge"],
      river: ["Stream|Mill Stream|Dike Channel|Ditch|Mill Race|Cutting|Fishing Stream|Kayak Stream|White Lady's Stream|Brook", "Mere|Oxbow Lake|Fish Pond|Millpond|Peat Lake|Water Reservoir|Lake Beach|Swimming Lake|Enchanted Lake|Lake", "Weir|Mill Weir|Lock Weir|Spillway|Dam Spillway|Sluice Falls|Viewpoint Weir|Canoe Slalom|Dragon's Weir|Cascade"],
    },
    water: {
      sea: ["Bay|Fishing Bay|Herring Bay|Whaling Bay|Spice Bay|Anchorage|Naval Bay|Fish Farm Bay|Mermaid's Bay|Great Bay", "Estuary|Tidal Inlet|Salt Inlet|Fish Inlet|Harbour Inlet|Shipyard Inlet|Marina Inlet|Beach Inlet|Drowned Inlet|Creek", "Strait|Sound|Pilgrim Strait|Privateer Strait|Spice Strait|Convoy Strait|Ferry Strait|Shipping Lane|Pillars Strait|Channel"],
      coast: ["Headland|Dune Cape|Watch Headland|Terp Headland|Fisher's Headland|Whaling Headland|Lighthouse Headland|Dune Walk|Mermaid's Headland|Point", "Cove|Smugglers' Cove|Fishermen's Cove|Privateer Cove|Herring Cove|Salt Cove|Beach Cove|Naturist Cove|Enchanted Cove|Beach", "Island|Sandbank Island|Terp Island|Fisher Island|Spice Island|Mud Flat Island|Holiday Island|Wadden Island|Mermaid Island|Islet"],
      chart: ["Bank|Fishing Bank|Herring Bank|Wreck Bank|Spice Bank|Convoy Bank|Trawling Bank|Sandbank|Mermaid's Bank|Shoal", "Reef|Sand Reef|Wreck Reef|Galleon Reef|Spice Reef|Privateer Reef|Dive Reef|Surf Reef|Drowned Reef|Rock", "Channel|Fishing Channel|Tidal Channel|Pilot Channel|Spice Channel|Convoy Channel|Ferry Channel|Shipping Channel|Mermaid Channel|Passage"],
    },
    route: [
      "Dike Road|Causeway|Pilgrim Road|Post Road|Coach Road|Canal Road|Main Road|Motorway|Ghost Road|Highway",
      "Peat Road|Cheese Road|Herring Road|Cloth Road|Spice Road|Towpath|Rail Freight Line|Freight Corridor|Smugglers' Road|Trade Road",
      "Pilgrim Way|Saint's Way|Hermit's Path|Procession Way|Cloister Path|Rosary Way|Pilgrim Hostel Road|Walking Route|Enchanted Way|Holy Road",
    ],
    sacred: [
      "Holy Well|Healing Spring|Saint's Fountain|Baptismal Pool|Spa Spring|Hermit's Spring|Fountain Shrine|Spa Pool|Water Spirit's Fountain|Spring",
      "Hunebed|Roadside Cross|Hermitage Rock|Calvary|Boundary Cross|Stone Cross|War Memorial Cross|Summit Cross|Giant's Cross|Standing Stone",
      "Hermitage|Beguinage Chapel|Abbey|Cathedral|Hidden Church|Procession Shrine|Pilgrimage Church|Memorial Chapel|Enchanted Church|Chapel",
    ],
  },
};
