// Greek (brief 6a): to the end of antiquity, the generic first; acropoleis and agoras, olive groves and sacred springs, islands and harbours, oracles and temples, in English.
export default {
  key: "greek", label: "Greek", style: "first",
  land: {
    B: "Olive|Marble|Silver|Honey|Wine|Barley|Goat|Fig|Cypress|Purple",
    C: "Nymph|Dragon|Centaur|Titan|Shades|Giant",
    D: "Acropolis;AN-MD|Sacred Grove;AN-MD|Oracle;AN-MD|Altar;AN-MD|Shepherd's Hut;AN-MD|Theatre;AN-MD|Monastery;MD|Watchtower;MD|Quarry;EM-MO|Olive Press;EM-ST|Railway Halt;ST-MO|Archaeological Site;ST-MO|Wind Farm;MO|Taverna;MO",
  },
  water: {
    B: "Olive Oil|Purple|Tuna|Sponge|Wine|Salt|Fish|Silver|Trireme|Coral",
    C: "Sea Serpent|Drowned City|Siren|Sea Nymph|Sea Giant|Phantom Trireme",
    D: "Fish Weir;AN-MD|Harbour Mole;AN-MD|Shipshed;AN-MD|Lighthouse;AN-MD|Temple Landing;AN-MD|Monastery Landing;MD|Sponge Fishery;EM-ST|Quarantine Station;EM-ST|Seaside Promenade;ST-MO|Ferry Terminal;ST-MO|Marina;MO|Beach Taverna;MO",
  },
  route: {
    N: "Sacred Way|Mule Track|Mountain Pass|Coast Road|Goat Track|Causeway",
    B: "Olive Oil|Wine|Silver|Marble|Honey|Purple|Grain|Pilgrims'",
    C: "Nymph's|Ghost|Dragon's|Titans'|Phantom|Centaurs'",
    D: "Sacred Way;AN-MD|Mule Track;AN-MD|Goat Track;AN-MD|Procession Road;AN-MD|Paved Road;AN-MD|Pilgrim Way;MD|Drove Road;MD|Mail Road;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Motorway;MO|Ring Road;MO|Hiking Trail;MO",
  },
  sacred: {
    N: "Sacred Spring|Altar|Sacred Grove|Temple|Shrine|Oracle",
    B: "Priests'|Healing|Sacred|Oracle's|Heroes'|Nymphs'",
    C: "Nymph's|Titan's|Giant's|Drowned|Phantom",
    D: "Sacred Grove;AN-MD|Spring Shrine;AN-MD|Altar;AN-MD|Temple;AN-MD|Oracle;AN-MD|Hero's Tomb;AN-MD|Sanctuary;AN-MD|Monastery Church;MD|Pilgrim Chapel;EM-ST|Procession Shrine;EM-ST|War Memorial Chapel;ST-MO|Archaeological Temple;MO|Open-air Theatre;MO",
  },
  nouns: {
    land: {
      mountain: ["Watch Peak|Altar Peak|Hermit's Peak|Marble Peak|Shepherd's Peak|Oracle Peak|Summit Chapel|Cable Car Peak|Giant's Peak|Bare Peak", "Pass Ridge|Border Ridge|Sacred Ridge|Marble Ridge|Smugglers' Ridge|Mine Ridge|Skyline Ridge|Hiking Ridge|Titan's Back|Long Ridge", "Mountains|Border Mountains|Highlands|Marble Hills|Drove Mountains|Sacred Mountains|National Park|Ski Range|Titans' Mountains|Great Range"],
      wood: ["Sacred Forest|Oak Forest|Hunting Forest|Pine Forest|Fir Plantation|Shipbuilders' Forest|Nature Reserve|Picnic Forest|Nymphs' Forest|Great Forest", "Sacred Grove|Olive Grove|Hermit's Grove|Cypress Grove|Laurel Grove|Fig Grove|Memorial Grove|Pine Grove|Nymph's Grove|Old Grove", "Honey Clearing|Charcoal Clearing|Hunters' Clearing|Goat Glade|Wood Yard|Firebreak|Picnic Clearing|Camping Glade|Centaur's Ring|Clearing"],
      moor: ["Scrub Moor|Shepherds' Moor|Heath Moor|Thyme Moor|Goat Moor|Mining Moor|Wind Farm Moor|Shooting Moor|Ghost Moor|Open Moor", "Tomb Hill|Barrow Hill|Border Hill|Beacon Hill|Windmill Hill|Mine Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Standing Stone|Tomb|Boundary Stone|Herm|Wayside Shrine|Stone Cross|Trig Pillar|Heritage Stone|Giant's Stone|Rock"],
      wet: ["Salt Marsh|Lagoon Marsh|Reed Marsh|Drained Marsh|Reclaimed Marsh|Wildfowl Marsh|Nature Reserve Marsh|Reedbed|Nymph's Marsh|Marsh", "Peat Bog|Lagoon|Tidal Flat|Saltpan Bog|Cut Bog|Reservoir Bog|Wetland Trail|Birdwatchers' Bog|Lantern Bog|Bog", "Lagoon Isle|Reed Isle|Fishermen's Isle|Temple Isle|Duck Isle|Salt Isle|Heron Island|Flamingo Island|Drowned Isle|Isle"],
      grass: ["Fertile Plain|Barley Plain|Wheat Plain|Horse Plain|Enclosed Plain|Irrigated Plain|Grazing Plain|Solar Plain|Heroes' Plain|Great Plain", "Goat Pasture|Hill Pasture|Summer Pasture|Drove Pasture|Enclosed Pasture|Sheep Pasture|Grazing Common|Sheep Run|Enchanted Pasture|Green Slope", "Fertile Vale|Orchard Vale|Mill Vale|Water Meadow|Olive Vale|Wine Vale|Bypass Vale|Hidden Vale|Nymph's Vale|Vale"],
      lands: ["City-State|Colony|Kingdom|League|Federation|Tyranny|Region|District|Lost Kingdom|Lands", "Sacred Land|Hegemony|Confederacy|Satrapy|Province|Island Realm|Canton|Metropolitan Area|Titans' Realm|Territory", "Deme|Hundred|Town Lands|Common Lands|Municipality|Council Area|Civil Parish|Neighbourhood|Haunted Parish|Lands"],
      farm: ["Barley Field|Open Field|Olive Field|Vine Field|Irrigated Field|Orchard Field|Sunflower Field|Solar Field|Nymph's Field|Field", "Estate Farm|Manor Farm|Sheepfold Farm|Wine Estate|Dairy Farm|Olive Estate|Farm Stay|Organic Farm|Enchanted Farm|Farm", "Sheep Pen|Goat Enclosure|Stud Enclosure|Hunting Enclosure|Walled Garden|Orchard|Paddock|Allotment|Giant's Fold|Enclosure"],
      hill: ["Hill|Acropolis Hill|Hermit's Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Gorge|Sacred Valley|Pilgrim Valley|Mine Valley|Railway Valley|Reservoir Valley|Bypass Valley|Hidden Valley|Enchanted Valley|Valley", "Hill Spur|Border Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Quarry Ridge|Skyline|Hill Walk|Titan's Back|Ridge"],
      river: ["Mountain Stream|Sacred Stream|Mill Stream|Ford|Mill Race|Cutting|Fishing Stream|Kayak Stream|Nymph's Stream|Brook", "Lake|Sacred Lake|Fish Pond|Millpond|Mining Lake|Water Reservoir|Lake Beach|Swimming Lake|Enchanted Lake|Pond", "Mountain Falls|Mill Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Viewpoint Falls|Canyoning Gorge|Titan's Falls|Waterfall"],
    },
    water: {
      sea: ["Bay|Fishing Bay|Sacred Bay|Trireme Bay|Purple Bay|Anchorage|Naval Bay|Fish Farm Bay|Siren's Bay|Great Bay", "Gulf|Harbour Inlet|Salt Inlet|Fish Inlet|Sponge Inlet|Shipyard Inlet|Marina Inlet|Beach Inlet|Drowned Inlet|Creek", "Strait|Sacred Strait|Pilgrim Strait|Pirate Strait|Grain Strait|Convoy Strait|Ferry Strait|Shipping Lane|Pillars Strait|Channel"],
      coast: ["Headland|Cape|Watch Headland|Temple Headland|Fisher's Headland|Sponge Headland|Lighthouse Headland|Clifftop Walk|Siren's Headland|Point", "Cove|Smugglers' Cove|Fishermen's Cove|Pirate Cove|Purple Cove|Salt Cove|Beach Cove|Naturist Cove|Enchanted Cove|Beach", "Island|Sacred Island|Monastery Island|Fisher Island|Exile Island|Penal Island|Holiday Island|Resort Island|Siren Island|Islet"],
      chart: ["Bank|Fishing Bank|Tuna Bank|Wreck Bank|Sponge Bank|Convoy Bank|Trawling Bank|Sandbank|Siren's Bank|Shoal", "Reef|Rock Reef|Wreck Reef|Trireme Reef|Coral Reef|Pirate Reef|Dive Reef|Surf Reef|Drowned Reef|Rock", "Channel|Fishing Channel|Sacred Channel|Pilot Channel|Grain Channel|Convoy Channel|Ferry Channel|Shipping Channel|Siren Channel|Passage"],
    },
    route: [
      "Sacred Way|Procession Road|Pilgrim Road|Paved Road|Post Road|Coach Road|Main Road|Motorway|Ghost Road|Highway",
      "Olive Oil Road|Salt Road|Wine Road|Marble Road|Silver Road|Honey Road|Rail Freight Line|Freight Corridor|Smugglers' Road|Trade Road",
      "Pilgrim Way|Saint's Way|Oracle's Path|Procession Way|Initiates' Way|Rosary Way|Pilgrim Hostel Road|Walking Route|Enchanted Way|Holy Road",
    ],
    sacred: [
      "Sacred Spring|Healing Spring|Fountain Shrine|Baptismal Pool|Spa Spring|Thermal Spring|Nymph's Fountain|Spa Pool|Titan's Fountain|Spring",
      "Altar|Roadside Shrine|Temple Rock|Hero's Tomb|Boundary Herm|Stone Cross|War Memorial Cross|Summit Chapel|Giant's Altar|Standing Stone",
      "Temple|Oracle|Sanctuary|Treasury|Parish Church|Procession Shrine|Pilgrimage Church|Memorial Chapel|Enchanted Temple|Chapel",
    ],
  },
};
