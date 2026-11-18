// Turkic (brief 6b): beyliks and khanates, yaylas and passes, caravanserais, dervish lodges and mosque complexes, galleys and steamers, in English; the grey wolf and the peri for lore.
// Each noun list is ten words in the fixed order: three AN-MD, three EM-ST, two ST-MO, one fantastic (`h`), one general.
export default {
  key: "turkic", label: "Turkic", style: "last",
  land: {
    B: "Horse|Sheep|Hazelnut|Apricot|Walnut|Tobacco|Poppy|Tulip|Fig|Mohair",
    C: "Grey Wolf|Giant|Serpent Queen|Winged Horse|Peri|One-Eyed Giant",
    D: "Watchtower;AN-MD|Border Fort;AN-MD|Highland Hut;AN-MD|Sheepfold;AN-MD|Caravanserai;AN-MD|Dervish Lodge;MD|Mosque Complex;MD|Tobacco Barn;EM-ST|Mining Village;ST-MO|Reservoir;ST-MO|Hydroelectric Dam;MO|Ski Resort;MO|Wind Farm;MO|Tea Terrace;ST-MO",
  },
  water: {
    B: "Anchovy|Sponge|Salt|Dried Fish|Silk|Spice|Galley|Steamship|Amber|Coral",
    C: "Sea Monster|Drowned City|Mermaid|Phantom Galley|Sea Serpent|Cursed Lamp",
    D: "Fishing Weir;AN-MD|Harbour Fort;AN-MD|Salt Pan;AN-MD|Caravan Landing;MD|Galley Dock;MD|Naval Arsenal;EM-ST|Lighthouse;EM-ST|Steamer Quay;ST-MO|Ferry Pier;ST-MO|Marina;MO|Beach Resort;MO|Container Port;MO",
  },
  route: {
    N: "Cloth Road|Caravan Road|Pilgrim Road|Post Road|Mountain Pass|Drove Track",
    B: "Silk|Salt|Horse|Spice|Pilgrims'|Caravan|Post|Honey",
    C: "Ghost|Giants'|Wolf's|Phantom|Winged|Serpent's",
    D: "Beylic Road;AN-MD|Caravan Road;AN-MD|Post Road;AN-MD|Pilgrim Road;AN-MD|Cloth Road;MD|Stone Bridge Road;MD|Mail Coach Road;EM-ST|Military Road;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Motorway;MO|Ring Road;MO|High-Speed Line;MO",
  },
  sacred: {
    N: "Holy Spring|Saint's Tomb|Dervish Lodge|Wishing Tree|Shrine|Mosque",
    B: "Saint's|Dervish|Pilgrims'|Healing|Holy|Elder's",
    C: "Wolf's|Enchanted|Giant's|Drowned|Phantom",
    D: "Wishing Tree;AN-MD|Holy Spring;AN-MD|Saint's Tomb;AN-MD|Rock Shrine;AN-MD|Mosque;MD|Dervish Lodge;MD|Mosque Complex;EM-ST|Hot Spring Shrine;EM-ST|Pilgrimage Hill;ST-MO|Memorial Shrine;ST-MO|Tomb Garden;MO",
  },
  nouns: {
    land: {
      mountain: ["Beacon Mountain|Snow Mountain|Eagle Mountain|Quarry Mountain|Shepherd Mountain|Pilgrim Mountain|Radio Mountain|Skiers' Mountain|Wolf Mountain|Great Mountain", "Pass Ridge|Frontier Ridge|Caravan Ridge|Mining Ridge|Telegraph Ridge|Pasture Ridge|Tunnel Ridge|Cable Ridge|Giant's Ridge|Long Ridge", "Cedar Range|Border Mountains|Highland Chain|Mining Range|Rail Range|Forest Range|Hydro Range|Trekking Range|Wolf Range|Mountains"],
      wood: ["Cedar Forest|Oak Forest|Hunting Forest|Beylic Forest|Ship Timber Forest|Charcoal Forest|Reserve Forest|Picnic Forest|Wolf Forest|Great Forest", "Plane Grove|Walnut Grove|Dervish Grove|Hazelnut Grove|Cypress Grove|Olive Grove|Memorial Grove|Tea Grove|Peri Grove|Old Grove", "Yayla Clearing|Pasture Clearing|Spring Clearing|Charcoal Clearing|Logging Clearing|Camp Clearing|Picnic Clearing|Wind Clearing|Wolf Clearing|Clearing"],
      moor: ["Steppe Moor|Salt Moor|Sheep Moor|Thistle Moor|Frontier Moor|Mining Moor|Wind Moor|Hunting Moor|Wolf Moor|Open Moor", "Tumulus Hill|Watch Hill|Border Hill|Lime Hill|Telegraph Hill|Mine Hill|Viewpoint Hill|Antenna Hill|Giant's Hill|Round Hill", "Horse Stone|Grave Stone|Boundary Stone|Fountain Stone|Milestone|Memorial Stone|Monument Stone|Photo Stone|Wolf Stone|Standing Stone"],
      wet: ["Salt Marsh|Reed Marsh|Heron Marsh|Delta Marsh|Drained Marsh|Cotton Marsh|Reserve Marsh|Flamingo Marsh|Serpent Marsh|Marsh", "Peat Bog|Hot Bog|Reed Bog|Lagoon Bog|Cut Bog|Pumped Bog|Spa Bog|Birdwatch Bog|Lantern Bog|Bog", "Lake Isle|Reed Isle|Fisher Isle|Monastery Isle|Prison Isle|Pasha's Isle|Ferry Isle|Picnic Isle|Peri's Isle|Isle"],
      grass: ["Central Plain|Wheat Plain|Horse Plain|Frontier Plain|Tribal Plain|Cotton Plain|Irrigated Plain|Solar Plain|Wolf Plain|Great Plain", "Summer Pasture|Highland Pasture|Winter Pasture|Drove Pasture|Horse Pasture|Sheep Pasture|Cooperative Pasture|Tourist Pasture|Peri Pasture|Pasture", "Fertile Vale|Orchard Vale|Fig Vale|River Vale|Mill Vale|Cotton Vale|Dam Vale|Wine Vale|Serpent Vale|Vale"],
      lands: ["Khanate|Border Principality|Emirate|Beylic|Province|Sultanate|Vilayet|Republic|Lost Khanate|Lands", "Frontier Sanjak|Pashalik|Timar Lands|Sultan's Domain|Vilayet|Governorate|Province|District|Peri Kingdom|Territory", "Tribe Lands|Village Lands|Town Lands|Parish Lands|Headman's Lands|Council Lands|Municipality|Neighbourhood|Wolf Lands|Common Lands"],
      farm: ["Wheat Field|Horse Field|Poppy Field|Tobacco Field|Orchard Field|Cotton Field|Greenhouse Field|Solar Field|Wolf Field|Field", "Yayla Farm|Stud Farm|Mulberry Farm|Hazelnut Farm|Tea Farm|Fig Farm|Rural Hotel|Organic Farm|Peri Farm|Farm", "Sheepfold|Horse Pen|Orchard Enclosure|Walled Garden|Caravan Enclosure|Cattle Pen|Stud Enclosure|Camp Enclosure|Wolf Pen|Enclosure"],
      hill: ["Hill|Fort Hill|Dervish Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Gorge|Mountain Valley|Caravan Valley|Mine Valley|Railway Valley|Dam Valley|Highway Valley|Hidden Valley|Peri Valley|Valley", "Hill Spur|Border Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Pylon Ridge|Skyline Ridge|Glider Ridge|Wolf Ridge|Ridge"],
      river: ["Mountain Stream|Mill Stream|Ford Stream|Fishing Stream|Dervish Stream|Irrigation Stream|Rafting Stream|Canoe Stream|Wolf Stream|Brook", "Crater Lake|Mountain Lake|Fish Lake|Reservoir Lake|Salt Lake|Spa Lake|Beach Lake|Sailing Lake|Peri Lake|Lake", "Mountain Falls|Mill Falls|Spring Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Tourist Falls|Serpent Falls|Falls"],
      desert: ["Black Sand Desert|Red Sand Desert|Salt Desert|Caravan Desert|Khan's Desert|Frontier Desert|Gas Field Desert|Mining Desert|Wolf Desert|Great Desert", "Whispering Dune|Camel Dune|Singing Dune|Caravan Dune|Border Dune|Pipeline Dune|Tourist Dune|Sand Ski Dune|Peri's Dune|Dune", "Watch Rock|Cave Rock|Dervish Rock|Fort Rock|Salt Rock|Mine Rock|Climbing Rock|Photo Rock|Giant's Rock|Rock"],
    },
    water: {
      sea: ["Bay|Galley Bay|Corsair Bay|Harbour Bay|Roadstead|Arsenal Bay|Naval Bay|Tuna Bay|Mermaid Bay|Great Bay", "Inlet|Anchorage Inlet|Salt Inlet|Arsenal Inlet|Fjord Inlet|Shipyard Inlet|Marina Inlet|Beach Inlet|Drowned Inlet|Creek", "Strait|Narrow Strait|Customs Strait|Convoy Strait|Pirate Strait|Steamer Strait|Ferry Strait|Shipping Strait|Phantom Strait|Sound"],
      coast: ["Headland|Cape|Beacon Cape|Corsair Cape|Beylic Cape|Fortress Cape|Quarantine Cape|Lighthouse Cape|Mermaid Cape|Point", "Cove|Corsair Cove|Sponge Divers' Cove|Galley Cove|Salt Cove|Harem Cove|Yacht Cove|Blue Cove|Lamp Cove|Beach", "Island|Hermit Island|Prison Island|Princes' Island|Pilgrim Island|Quarantine Island|Resort Island|Ferry Island|Phantom Island|Isle"],
      chart: ["Bank|Fishing Bank|Anchovy Bank|Wreck Bank|Sponge Bank|Convoy Bank|Trawl Bank|Sandbank|Siren Bank|Shoal", "Reef|Coral Reef|Wreck Reef|Galley Reef|Pirate Reef|Steamer Reef|Dive Reef|Artificial Reef|Drowned Reef|Rock", "Channel|Fishing Channel|Galley Channel|Pilot Channel|Customs Channel|Convoy Channel|Ferry Channel|Shipping Channel|Phantom Channel|Passage"],
    },
    route: [
      "Beylic Road|Caravan Causeway|Post Road|King's Highway|Pilgrim Highway|Mule Road|Main Road|Motorway|Ghost Road|Highway",
      "Cloth Road|Salt Road|Horse Road|Spice Road|Honey Road|Caravan Track|Rail Freight Line|Freight Corridor|Corsair's Road|Trade Road",
      "Pilgrim Road|Dervish Path|Saint's Path|Mountain Pilgrimage|Hajj Road|Lodge Road|Walking Route|Trekking Trail|Enchanted Way|Holy Road",
    ],
    sacred: [
      "Holy Spring|Healing Spring|Saint's Fountain|Ablution Pool|Hot Spring|Thermal Spring|Fountain Shrine|Spa Pool|Peri Fountain|Spring",
      "Wishing Tree|Saint's Tomb|Rock Shrine|Standing Stone|Boundary Stone|Tomb Garden|Memorial Stone|Summit Cairn|Giant's Stone|Holy Rock",
      "Dervish Lodge|Mosque|Mosque Complex|Pilgrimage Hill|Dervish Cell|Memorial Shrine|Heritage Mosque|Restored Lodge|Enchanted Shrine|Shrine",
    ],
  },
};
