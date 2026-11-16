// Roman (brief 6a): the generic first; roads, aqueducts, villas, colonies and camps; later eras read the ruins and the papal and Italian lands over them.
export default {
  key: "roman", label: "Roman", style: "first",
  land: {
    B: "Marble|Olive|Wheat|Vine|Salt|Lead|Tin|Sulphur|Grain|Timber",
    C: "Wolf Mother|Dragon|Lamia|Shades|Wild Hunt|Giant",
    D: "Road Station;AN-MD|Villa;AN-MD|Camp;AN-MD|Aqueduct;AN-MD|Milestone;AN-MD|Fortress;MD|Pilgrim Hospice;MD|Ruined Forum;EM-ST|Marble Quarry;EM-MO|Railway Halt;ST-MO|Excavation;ST-MO|Archaeological Park;MO|Autostrada Service Area;MO|Visitor Centre;MO",
  },
  water: {
    B: "Salt|Tuna|Garum|Oyster|Wine|Grain|Fish|Purple|Trireme|Amber",
    C: "Sea Serpent|Drowned City|Siren|Sea Giant|Phantom Trireme|Triton",
    D: "Fish Pond;AN-MD|Harbour Mole;AN-MD|Saltern;AN-MD|Lighthouse;AN-MD|Naval Station;AN-MD|Abbey Landing;MD|Ruined Harbour;EM-ST|Quarantine Station;EM-ST|Seaside Promenade;ST-MO|Ferry Terminal;ST-MO|Marina;MO|Beach Resort;MO",
  },
  route: {
    N: "Paved Road|Military Road|Causeway|Mule Track|Mountain Pass|Coast Road",
    B: "Grain|Wine|Salt|Marble|Oil|Amber|Tin|Pilgrims'",
    C: "Shades'|Ghost|Dragon's|Giants'|Phantom|Wolf Mother's",
    D: "Paved Road;AN-MD|Military Road;AN-MD|Milestone Road;AN-MD|Posting Road;AN-MD|Causeway;AN-MD|Pilgrim Way;MD|Drove Road;MD|Papal Road;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Motorway;MO|Ring Road;MO|Archaeological Trail;MO",
  },
  sacred: {
    N: "Sacred Spring|Altar|Sacred Grove|Temple|Shrine|Basilica",
    B: "Saint's|Augurs'|Vestal|Healing|Sacred|Martyrs'",
    C: "Shades'|Lamia's|Giant's|Drowned|Phantom",
    D: "Sacred Grove;AN-MD|Spring Shrine;AN-MD|Altar;AN-MD|Temple;AN-MD|Catacomb;AN-MD|Basilica;MD|Martyr's Shrine;MD|Pilgrim Church;EM-ST|Procession Shrine;EM-ST|Sanctuary;ST-MO|War Memorial Chapel;ST-MO|Archaeological Temple;MO",
  },
  nouns: {
    land: {
      mountain: ["Watch Peak|Altar Peak|Hermit's Peak|Marble Peak|Shepherd's Peak|Alpine Peak|Summit Cross|Cable Car Peak|Giant's Peak|Bare Peak", "Pass Ridge|Border Ridge|Apennine Ridge|Marble Ridge|Smugglers' Ridge|Mine Ridge|Skyline Ridge|Paragliding Ridge|Dragon's Back|Long Ridge", "Great Range|Border Mountains|Great Alpine Range|Marble Hills|Drove Mountains|Hunting Range|National Park|Ski Range|Shades' Mountains|Great Range"],
      wood: ["Sacred Forest|Oak Forest|Hunting Forest|Timber Forest|Pine Plantation|Shipbuilders' Forest|Nature Reserve|Picnic Forest|Enchanted Forest|Great Forest", "Sacred Grove|Olive Grove|Hermit's Grove|Cypress Grove|Laurel Grove|Lemon Grove|Memorial Grove|Pine Grove|Lamia's Grove|Old Grove", "Timber Clearing|Charcoal Clearing|Hunters' Clearing|Boar Glade|Wood Yard|Firebreak|Picnic Clearing|Camping Glade|Faun's Ring|Clearing"],
      moor: ["Scrub Moor|Shepherds' Moor|Heath Moor|Broom Moor|Mule Moor|Mining Moor|Wind Farm Moor|Shooting Moor|Ghost Moor|Open Moor", "Barrow Hill|Tomb Hill|Border Hill|Beacon Hill|Windmill Hill|Mine Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Standing Stone|Tomb|Boundary Stone|Milestone|Wayside Shrine|Stone Cross|Trig Pillar|Heritage Stone|Giant's Stone|Rock"],
      wet: ["Salt Marsh|Lagoon Marsh|Reed Marsh|Drained Marsh|Reclaimed Marsh|Wildfowl Marsh|Nature Reserve Marsh|Reedbed|Lamia's Marsh|Marsh", "Peat Bog|Lagoon|Tidal Flat|Saltpan Bog|Cut Bog|Reservoir Bog|Wetland Trail|Birdwatchers' Bog|Lantern Bog|Bog", "Lagoon Isle|Reed Isle|Fishermen's Isle|Temple Isle|Duck Isle|Salt Isle|Heron Island|Flamingo Island|Drowned Isle|Isle"],
      grass: ["Fertile Plain|Wheat Plain|Grain Plain|Cattle Plain|Enclosed Plain|Irrigated Plain|Grazing Plain|Solar Plain|Latin Plain|Great Plain", "Hill Pasture|Summer Pasture|Winter Pasture|Drove Pasture|Enclosed Pasture|Buffalo Pasture|Grazing Common|Sheep Run|Enchanted Pasture|Green Slope", "Fertile Vale|Orchard Vale|Mill Vale|Water Meadow|Aqueduct Vale|Wine Vale|Bypass Vale|Hidden Vale|Fairy Vale|Vale"],
      lands: ["Province|Colony|Kingdom|Duchy|Municipium|Republic|Region|Prefecture|Lost Province|Lands", "Imperial Domain|Papal Domain|Marquisate|Seigniory|League|Diocese|Canton|Metropolitan Area|Shades' Province|Territory", "Parish|Hundred|Town Lands|Common Lands|Commune|Council Area|Civil Parish|Neighbourhood|Haunted Parish|Lands"],
      farm: ["Wheat Field|Open Field|Grain Field|Vine Field|Irrigated Field|Orchard Field|Sunflower Field|Solar Field|Fairy Field|Field", "Villa Farm|Latifundium|Sheepfold Farm|Wine Estate|Dairy Farm|Olive Estate|Farm Stay|Organic Farm|Enchanted Farm|Farm", "Sheep Pen|Cattle Enclosure|Stud Enclosure|Hunting Enclosure|Walled Garden|Orchard|Paddock|Allotment|Giant's Fold|Enclosure"],
      hill: ["Hill|Camp Hill|Hermit's Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Gorge|Roman Valley|Pilgrim Valley|Mine Valley|Aqueduct Valley|Reservoir Valley|Bypass Valley|Hidden Valley|Enchanted Valley|Valley", "Hill Spur|Border Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Quarry Ridge|Skyline|Hill Walk|Dragon's Back|Ridge"],
      river: ["Mountain Stream|Aqueduct Channel|Mill Stream|Ford|Mill Race|Cutting|Fishing Stream|Kayak Stream|Triton's Stream|Brook", "Lake|Crater Lake|Fish Pond|Millpond|Mining Lake|Water Reservoir|Lake Beach|Swimming Lake|Enchanted Lake|Pond", "Mountain Falls|Mill Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Viewpoint Falls|Canyoning Gorge|Dragon's Falls|Waterfall"],
    },
    water: {
      sea: ["Bay|Fishing Bay|Imperial Bay|Trireme Bay|Amber Bay|Anchorage|Naval Bay|Fish Farm Bay|Siren's Bay|Great Bay", "Gulf|Lagoon Inlet|Salt Inlet|Fish Inlet|Harbour Inlet|Shipyard Inlet|Marina Inlet|Beach Inlet|Drowned Inlet|Creek", "Strait|Imperial Strait|Pilgrim Strait|Pirate Strait|Grain Strait|Convoy Strait|Ferry Strait|Shipping Lane|Pillars Strait|Channel"],
      coast: ["Headland|Cape|Watch Headland|Temple Headland|Fisher's Headland|Tuna Headland|Lighthouse Headland|Clifftop Walk|Siren's Headland|Point", "Cove|Smugglers' Cove|Fishermen's Cove|Pirate Cove|Purple Cove|Salt Cove|Beach Cove|Naturist Cove|Enchanted Cove|Beach", "Island|Hermit's Island|Villa Island|Fisher Island|Exile Island|Penal Island|Holiday Island|Resort Island|Siren Island|Islet"],
      chart: ["Bank|Fishing Bank|Tuna Bank|Wreck Bank|Amber Bank|Convoy Bank|Trawling Bank|Sandbank|Siren's Bank|Shoal", "Reef|Rock Reef|Wreck Reef|Trireme Reef|Coral Reef|Pirate Reef|Dive Reef|Surf Reef|Drowned Reef|Rock", "Channel|Fishing Channel|Imperial Channel|Pilot Channel|Grain Channel|Convoy Channel|Ferry Channel|Shipping Channel|Siren Channel|Passage"],
    },
    route: [
      "Paved Road|Military Road|Pilgrim Road|Imperial Road|Post Road|Coach Road|Main Road|Motorway|Ghost Road|Highway",
      "Grain Road|Salt Road|Wine Road|Marble Road|Amber Road|Tin Road|Rail Freight Line|Freight Corridor|Smugglers' Road|Trade Road",
      "Pilgrim Way|Martyrs' Way|Hermit's Path|Procession Way|Catacomb Way|Rosary Way|Pilgrim Hostel Road|Walking Route|Enchanted Way|Holy Road",
    ],
    sacred: [
      "Sacred Spring|Healing Spring|Saint's Fountain|Baptismal Pool|Spa Spring|Thermal Spring|Fountain Shrine|Spa Pool|Triton's Fountain|Spring",
      "Altar|Roadside Shrine|Temple Rock|Tomb|Boundary Altar|Stone Cross|War Memorial Cross|Summit Cross|Giant's Altar|Standing Stone",
      "Temple|Basilica|Martyr's Shrine|Cathedral|Parish Church|Procession Shrine|Pilgrimage Church|Memorial Chapel|Enchanted Temple|Chapel",
    ],
  },
};
