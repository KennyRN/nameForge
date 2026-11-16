// Spanish (brief 6a): the generic first; sierras, mesas and vegas, castles of the Reconquest, shepherds' drove roads, hermitages and holy crosses, in English.
// Each noun list is ten words in the fixed order: three AN-MD, three EM-ST, two ST-MO, one fantastic (`h`), one general.
export default {
  key: "spanish", label: "Spanish", style: "first",
  land: {
    B: "Merino|Olive|Cork Oak|Vine|Saffron|Mule|Bull|Esparto|Holm Oak|Almond",
    C: "Moorish Queen|Dragon|Enchanted Moor|Wild Man|Ghost Procession|Giant",
    D: "Watchtower;AN-MD|Moorish Fort;AN-MD|Hermitage;AN-MD|Shepherd's Hut;AN-MD|Border Castle;AN-MD|Monastery;MD|Pilgrim Hospice;MD|Mine Shaft;EM-MO|Drove Road Inn;EM-ST|Railway Halt;ST-MO|Reservoir;ST-MO|Bullring;EM-MO|Ski Station;MO|Wind Farm;MO",
  },
  water: {
    B: "Salt|Tuna|Sardine|Cork|Wine|Sherry|Fish|Silver Fleet|Galleon|Coral",
    C: "Sea Serpent|Drowned City|Siren|Moorish Treasure|Sea Giant|Phantom Galleon",
    D: "Fishing Weir;AN-MD|Moorish Watchtower;AN-MD|Saltern;AN-MD|Pilgrim Landing;MD|Treasure Port;EM-ST|Whaling Station;EM-ST|Naval Dockyard;EM-ST|Lighthouse;EM-MO|Seaside Promenade;ST-MO|Ferry Terminal;ST-MO|Marina;MO|Beach Resort;MO",
  },
  route: {
    N: "Drove Road|Pilgrim Way|Royal Road|Mule Track|Mountain Pass|Sheep Walk",
    B: "Merino|Wool|Salt|Silver|Wine|Olive Oil|Mule|Pilgrims'",
    C: "Moorish|Ghost|Dragon's|Giants'|Phantom|Enchanted",
    D: "Roman Road;AN-MD|Pilgrim Way;AN-MD|Drove Road;AN-MD|Moorish Causeway;AN-MD|Royal Road;MD|Mule Track;MD|Mail Coach Road;EM-ST|Camino Real;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Motorway;MO|Bypass;MO|High-Speed Line;MO",
  },
  sacred: {
    N: "Holy Well|Holy Cross|Hermitage|Shrine|Chapel|Cathedral",
    B: "Saint's|Pilgrims'|Hermit's|Healing|Holy|Virgin's",
    C: "Moorish|Enchanted|Giant's|Drowned|Phantom",
    D: "Hermitage;AN-MD|Mozarabic Church;AN-MD|Holy Well;AN-MD|Roadside Cross;AN-MD|Cathedral;MD|Monastery;MD|Pilgrim Chapel;EM-ST|Procession Shrine;EM-ST|Sanctuary;ST-MO|War Memorial Chapel;ST-MO|Pilgrimage Church;MO",
  },
  nouns: {
    land: {
      mountain: ["Watch Peak|Moorish Peak|Hermit's Peak|Mining Peak|Shepherd's Peak|Cross Peak|Summit Cross|Radio Peak|Giant's Peak|Bare Peak", "Sierra Spine|Border Ridge|Pass Ridge|Slate Ridge|Mule Ridge|Mine Ridge|Skyline Ridge|Hang-glider Ridge|Dragon's Back|Long Ridge", "Sierra|Border Mountains|Highlands|Mining Hills|Drove Mountains|Royal Hunting Range|National Park|Ski Range|Enchanted Mountains|Great Sierra"],
      wood: ["Holm Oak Forest|Cork Oak Forest|Royal Forest|Charcoal Forest|Pine Plantation|Shipbuilders' Forest|Nature Reserve|Picnic Forest|Enchanted Forest|Great Forest", "Olive Grove|Chestnut Grove|Hermit's Grove|Cork Grove|Almond Grove|Orange Grove|Memorial Grove|Pine Grove|Wild Man's Grove|Old Grove", "Dehesa Glade|Charcoal Clearing|Hunters' Clearing|Pig Clearing|Cork Clearing|Firebreak|Picnic Clearing|Camping Glade|Fairy Ring|Clearing"],
      moor: ["Scrub Moor|Shepherds' Moor|Heath Moor|Esparto Moor|Mule Moor|Mining Moor|Wind Farm Moor|Shooting Moor|Ghost Moor|Open Moor", "Barrow Hill|Moorish Hill|Border Hill|Beacon Hill|Windmill Hill|Mine Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Standing Stone|Dolmen|Boundary Stone|Wayside Cross|Milestone|Stone Cross|Trig Pillar|Heritage Stone|Giant's Stone|Rock"],
      wet: ["Salt Marsh|Rice Marsh|Reed Marsh|Drained Marsh|Reclaimed Marsh|Wildfowl Marsh|Nature Reserve Marsh|Reedbed|Moorish Queen's Marsh|Marsh", "Peat Bog|Lagoon|Tidal Flat|Saltpan Bog|Cut Bog|Reservoir Bog|Wetland Trail|Birdwatchers' Bog|Lantern Bog|Bog", "Lagoon Isle|Reed Isle|Fishermen's Isle|Rice Isle|Duck Isle|Salt Isle|Heron Island|Flamingo Island|Drowned Isle|Isle"],
      grass: ["Fertile Plain|Wheat Plain|Shepherds' Plain|Merino Plain|Enclosed Plain|Irrigated Plain|Grazing Plain|Solar Plain|Moorish Plain|Great Plain", "Sheepwalk|Hill Pasture|Winter Pasture|Drove Pasture|Enclosed Pasture|Bull Pasture|Grazing Common|Sheep Run|Enchanted Pasture|Green Slope", "Fertile Vale|Orchard Vale|Mill Vale|Water Meadow|Reservoir Vale|Wine Vale|Bypass Vale|Hidden Vale|Moorish Vale|Vale"],
      lands: ["Kingdom|Border March|County|Lordship|Province|Captaincy|Autonomous Community|Region|Lost Kingdom|Lands", "Frontier March|Royal Domain|Duchy|Marquisate|Viceroyalty|Province|Council District|District|Moorish Emirate|Territory", "Parish|Hundred|Town Lands|Common Lands|Municipality|Council Area|Commune|Neighbourhood|Haunted Parish|Lands"],
      farm: ["Wheat Field|Open Field|Olive Field|Vine Field|Irrigated Field|Orange Field|Greenhouse Field|Solar Field|Moorish Field|Field", "Cortijo|Hacienda|Sheepfold Farm|Wine Estate|Bull Farm|Olive Estate|Rural Hotel|Organic Farm|Enchanted Farm|Farm", "Sheep Pen|Cattle Enclosure|Stud Enclosure|Hunting Enclosure|Walled Garden|Orchard|Paddock|Allotment|Giant's Fold|Enclosure"],
      hill: ["Hill|Fort Hill|Hermit's Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Ravine|Moorish Valley|Pilgrim Valley|Mine Valley|Railway Valley|Reservoir Valley|Bypass Valley|Hidden Valley|Enchanted Valley|Valley", "Hill Spur|Border Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Quarry Ridge|Skyline|Hill Walk|Dragon's Back|Ridge"],
      river: ["Mountain Stream|Moorish Channel|Mill Stream|Mule Ford|Irrigation Channel|Cutting|Fishing Stream|Kayak Stream|Moorish Queen's Stream|Brook", "Reservoir|Oxbow Lake|Fish Pond|Millpond|Mining Lake|Water Reservoir|Lake Beach|Swimming Lake|Enchanted Lake|Lake", "Mountain Falls|Mill Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Viewpoint Falls|Canyoning Gorge|Dragon's Falls|Waterfall"],
    },
    water: {
      sea: ["Bay|Fishing Bay|Moorish Bay|Whaling Bay|Treasure Bay|Anchorage|Naval Bay|Fish Farm Bay|Siren's Bay|Great Bay", "Inlet|Ria|Salt Inlet|Fish Inlet|Harbour Inlet|Shipyard Inlet|Marina Inlet|Beach Inlet|Drowned Inlet|Creek", "Strait|Moorish Strait|Pilgrim Strait|Pirate Strait|Treasure Strait|Convoy Strait|Ferry Strait|Shipping Lane|Pillars Strait|Channel"],
      coast: ["Headland|Cape|Watch Headland|Moorish Headland|Fisher's Headland|Whaling Headland|Lighthouse Headland|Clifftop Walk|Siren's Headland|Point", "Cove|Smugglers' Cove|Fishermen's Cove|Pirate Cove|Treasure Cove|Salt Cove|Beach Cove|Naturist Cove|Enchanted Cove|Beach", "Island|Hermit's Island|Moorish Island|Fisher Island|Treasure Island|Penal Island|Holiday Island|Resort Island|Siren Island|Islet"],
      chart: ["Bank|Fishing Bank|Tuna Bank|Wreck Bank|Treasure Bank|Convoy Bank|Trawling Bank|Sandbank|Siren's Bank|Shoal", "Reef|Coral Reef|Wreck Reef|Galleon Reef|Treasure Reef|Pirate Reef|Dive Reef|Artificial Reef|Drowned Reef|Rock", "Channel|Fishing Channel|Moorish Channel|Pilot Channel|Treasure Channel|Convoy Channel|Ferry Channel|Shipping Channel|Siren Channel|Passage"],
    },
    route: [
      "Roman Road|Moorish Causeway|Pilgrim Road|Royal Road|Mail Road|Mule Road|Main Road|Motorway|Ghost Road|Highway",
      "Drove Road|Salt Road|Wool Road|Silver Road|Wine Road|Mule Track|Rail Freight Line|Freight Corridor|Smugglers' Road|Trade Road",
      "Pilgrim Way|Saint's Way|Hermit's Path|Procession Way|Mountain Pilgrimage|Rosary Way|Pilgrim Hostel Road|Walking Route|Enchanted Way|Holy Road",
    ],
    sacred: [
      "Holy Well|Healing Spring|Saint's Fountain|Baptismal Pool|Spa Spring|Lourdes Spring|Fountain Shrine|Spa Pool|Moorish Fountain|Spring",
      "Holy Cross|Roadside Cross|Hermitage Rock|Calvary|Boundary Cross|Stone Cross|War Memorial Cross|Summit Cross|Giant's Cross|Standing Stone",
      "Hermitage|Mozarabic Church|Monastery|Cathedral|Parish Church|Procession Shrine|Pilgrimage Church|Memorial Chapel|Enchanted Church|Chapel",
    ],
  },
};
