// Persian (brief 6b): the plateau and its gardens; walled gardens and underground channels, caravanserais, fire temples, tiled domes, bazaars, passes and salt deserts; divs, peris and the Simurgh for lore.
// Each noun list is ten words in the fixed order: three AN-MD, three EM-ST, two ST-MO, one fantastic (`h`), one general.
export default {
  key: "persian", label: "Persian", style: "last",
  land: {
    B: "Rose|Saffron|Pistachio|Pomegranate|Almond|Carpet|Nightingale|Walnut|Melon|Silk",
    C: "Demon|Peri|Simurgh|Rose Queen|Fire Spirit|Sleeping Hero",
    D: "Fire Temple;AN-MD|Walled Garden;AN-MD|Watchtower;AN-MD|Orchard;AN-MD|Underground Channel;AN-MD|Caravanserai;MD|Tiled Dome;MD|Rose Estate;EM-ST|Pavilion Garden;EM-ST|Oil Camp;ST-MO|Reservoir;ST-MO|Ski Resort;MO|Pistachio Farm;MO|Solar Farm;MO",
  },
  water: {
    B: "Caviar|Pearl|Date|Spice|Silk|Carpet|Rose Water|Tanker|Oil|Sturgeon",
    C: "Sea Demon|Drowned City|Sea Peri|Phantom Ship|Sea Serpent|Pearl Queen",
    D: "Fish Weir;AN-MD|Harbour Tower;AN-MD|Salt Works;AN-MD|Royal Landing;MD|Ship Yard;MD|Pearl Station;EM-ST|Customs House;EM-ST|Caviar Station;ST-MO|Oil Jetty;ST-MO|Corniche;MO|Marina;MO|Container Terminal;MO",
  },
  route: {
    N: "Satrap's Road|Caravan Road|Pilgrim Road|Cloth Road|Mountain Pass|Post Road",
    B: "Silk|Rose|Saffron|Carpet|Pistachio|Royal|Pilgrims'|Spice",
    C: "Ghost|Demon's|Peri's|Phantom|Winged|Fire",
    D: "Satrap's Road;AN-MD|Governor's Road;AN-MD|Post Road;AN-MD|Caravan Road;AN-MD|Cloth Road;MD|Stone Bridge Road;MD|Coach Road;EM-ST|Telegraph Road;EM-ST|Railway Line;ST-MO|Oil Pipeline Road;ST-MO|Motorway;MO|Ring Road;MO|Metro Line;MO",
  },
  sacred: {
    N: "Fire Temple|Holy Spring|Saint's Tomb|Shrine|Mosque|Tomb",
    B: "Saint's|Magus's|Pilgrims'|Healing|Holy|Poet's",
    C: "Peri's|Enchanted|Demon's|Buried|Phantom",
    D: "Fire Temple;AN-MD|Holy Spring;AN-MD|Cypress of the Sage;AN-MD|Tower of Silence;AN-MD|Tiled Mosque;MD|Saint's Tomb;MD|Poet's Garden Tomb;EM-ST|Shrine Dome;EM-ST|Great Mosque;ST-MO|Martyrs' Memorial;ST-MO|Pilgrimage Square;MO",
  },
  nouns: {
    land: {
      mountain: ["Fire Peak|Snow Peak|Eagle Peak|Turquoise Peak|Satrap's Peak|Hermit Peak|Radio Peak|Skiers' Peak|Demon's Peak|Great Peak", "Pass Ridge|Royal Ridge|Caravan Ridge|Mining Ridge|Telegraph Ridge|Fort Ridge|Tunnel Ridge|Cable Ridge|Simurgh's Ridge|Long Ridge", "Tower Range|Frontier Mountains|Highland Chain|Mining Range|Rail Range|Oak Range|Dam Range|Trekking Range|Demon Range|Mountains"],
      wood: ["Cypress Forest|Plane Forest|Hunting Forest|Royal Forest|Caspian Forest|Charcoal Forest|Reserve Forest|Picnic Forest|Peri Forest|Great Forest", "Cypress Grove|Pomegranate Grove|Poet's Grove|Almond Grove|Mulberry Grove|Walnut Grove|Memorial Grove|Pistachio Grove|Simurgh Grove|Old Grove", "Rose Clearing|Spring Clearing|Pavilion Clearing|Hunting Clearing|Polo Clearing|Camp Clearing|Picnic Clearing|Wind Clearing|Peri Clearing|Clearing"],
      moor: ["Salt Desert Moor|Gravel Moor|Sheep Moor|Thistle Moor|Frontier Moor|Mining Moor|Wind Moor|Hunting Moor|Demon Moor|Open Moor", "Fire Hill|Tower Hill|Border Hill|Ruin Hill|Telegraph Hill|Mine Hill|Viewpoint Hill|Antenna Hill|Peri's Hill|Round Hill", "Lion Stone|Relief Stone|Boundary Stone|Fountain Stone|Milestone|Memorial Stone|Monument Stone|Photo Stone|Demon Stone|Standing Stone"],
      wet: ["Salt Marsh|Reed Marsh|Heron Marsh|Caspian Marsh|Drained Marsh|Rice Marsh|Reserve Marsh|Flamingo Marsh|Peri's Marsh|Marsh", "Salt Bog|Hot Bog|Reed Bog|Lagoon Bog|Cut Bog|Pumped Bog|Spa Bog|Birdwatch Bog|Lantern Bog|Bog", "Lake Isle|Reed Isle|Fisher Isle|Fire Isle|Prison Isle|Royal Isle|Ferry Isle|Picnic Isle|Demon's Isle|Isle"],
      grass: ["Plateau Plain|Wheat Plain|Horse Plain|Frontier Plain|Nomad Plain|Cotton Plain|Irrigated Plain|Solar Plain|Demon Plain|Great Plain", "Summer Pasture|Highland Pasture|Winter Pasture|Royal Pasture|Horse Pasture|Sheep Pasture|Cooperative Pasture|Tourist Pasture|Peri Pasture|Pasture", "Fertile Vale|Orchard Vale|Rose Vale|River Vale|Mill Vale|Cotton Vale|Dam Vale|Wine Vale|Simurgh Vale|Vale"],
      lands: ["Empire|Governorate|Frontier March|Province|Kingdom|Khanate|Emirate|Republic|Lost Empire|Lands", "Shah's Domain|Province|Governorate|Khanate|Principality|Crown Lands|Protectorate|District|Peri Kingdom|Territory", "Tribe Lands|Village Lands|Town Lands|Garden Lands|Headman's Lands|Council Lands|Municipality|Neighbourhood|Demon Lands|Common Lands"],
      farm: ["Wheat Field|Saffron Field|Rose Field|Melon Field|Irrigated Field|Cotton Field|Greenhouse Field|Solar Field|Demon Field|Field", "Orchard Farm|Stud Farm|Silk Farm|Pistachio Farm|Rose Estate|Saffron Estate|Rural Hotel|Organic Farm|Peri Farm|Farm", "Sheepfold|Horse Pen|Orchard Enclosure|Walled Garden|Caravan Enclosure|Cattle Pen|Stud Enclosure|Camp Enclosure|Demon Pen|Enclosure"],
      hill: ["Hill|Fire Hill|Hermit Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Demon's Hill|Round Hill", "Gorge|Mountain Valley|Caravan Valley|Mine Valley|Railway Valley|Dam Valley|Highway Valley|Hidden Valley|Peri Valley|Valley", "Hill Spur|Border Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Pylon Ridge|Skyline Ridge|Glider Ridge|Simurgh Ridge|Ridge"],
      river: ["Mountain Stream|Mill Stream|Ford Stream|Qanat Stream|Rose Stream|Irrigation Stream|Rafting Stream|Canoe Stream|Demon Stream|Brook", "Mountain Lake|Salt Lake|Fish Lake|Royal Lake|Reservoir Lake|Spa Lake|Beach Lake|Sailing Lake|Peri Lake|Lake", "Mountain Falls|Mill Falls|Spring Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Tourist Falls|Simurgh Falls|Falls"],
      desert: ["Salt Desert|Stony Desert|Dead Sand Desert|Caravan Desert|Satrap's Desert|Frontier Desert|Oil Field Desert|Mining Desert|Demon Desert|Great Desert", "Whispering Dune|Camel Dune|Singing Dune|Caravan Dune|Border Dune|Pipeline Dune|Tourist Dune|Sand Ski Dune|Simurgh's Dune|Dune", "Watch Rock|Cave Rock|Fire Rock|Fort Rock|Salt Rock|Mine Rock|Climbing Rock|Photo Rock|Peri's Rock|Rock"],
    },
    water: {
      sea: ["Bay|Pearl Bay|Royal Bay|Harbour Bay|Pirate Bay|Roadstead|Naval Bay|Sturgeon Bay|Peri Bay|Great Bay", "Inlet|Creek|Salt Inlet|Royal Inlet|Harbour Inlet|Shipyard Inlet|Marina Inlet|Beach Inlet|Drowned Inlet|Gulf", "Strait|Narrow Strait|Customs Strait|Convoy Strait|Pirate Strait|Tanker Strait|Ferry Strait|Shipping Strait|Phantom Strait|Sound"],
      coast: ["Headland|Cape|Watch Cape|Pearl Cape|Pirate Cape|Lighthouse Cape|Quarantine Cape|Corniche Walk|Peri Cape|Point", "Cove|Pirate Cove|Pearl Divers' Cove|Royal Cove|Salt Cove|Fisher Cove|Beach Cove|Resort Cove|Siren Cove|Beach", "Island|Hermit Island|Prison Island|Pearl Island|Pilgrim Island|Quarantine Island|Resort Island|Ferry Island|Phantom Island|Isle"],
      chart: ["Bank|Pearl Bank|Sturgeon Bank|Wreck Bank|Coral Bank|Convoy Bank|Trawl Bank|Sandbank|Peri Bank|Shoal", "Reef|Coral Reef|Wreck Reef|Royal Reef|Pirate Reef|Tanker Reef|Dive Reef|Artificial Reef|Drowned Reef|Rock", "Channel|Pearl Channel|Royal Channel|Pilot Channel|Customs Channel|Convoy Channel|Ferry Channel|Shipping Channel|Phantom Channel|Passage"],
    },
    route: [
      "Satrap's Road|Satrap's Causeway|Post Road|King's Highway|Pilgrim Highway|Coach Road|Main Road|Motorway|Ghost Road|Highway",
      "Cloth Road|Saffron Road|Rose Road|Carpet Road|Pistachio Road|Caravan Track|Rail Freight Line|Pipeline Corridor|Smugglers' Track|Trade Road",
      "Pilgrim Road|Saint's Path|Poet's Path|Shrine Path|Holy Road|Mourners' Road|Walking Route|Trekking Trail|Enchanted Way|Pilgrim Way",
    ],
    sacred: [
      "Holy Spring|Healing Spring|Saint's Fountain|Ablution Pool|Hot Spring|Rose Water Spring|Fountain Shrine|Spa Pool|Peri Spring|Spring",
      "Fire Temple|Tower of Silence|Cypress of the Sage|Standing Stone|Boundary Stone|Tomb Garden|Memorial Stone|Summit Cairn|Demon Stone|Holy Rock",
      "Tiled Mosque|Saint's Tomb|Poet's Tomb|Shrine Dome|Great Mosque|Martyrs' Memorial|Heritage Mosque|Restored Shrine|Enchanted Shrine|Shrine",
    ],
  },
};
