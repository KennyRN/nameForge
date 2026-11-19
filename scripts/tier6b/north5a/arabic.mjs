// Arabic (brief 6b): desert and city; wells and wadis, oases and palm groves, souks, forts and frontier forts, caravan routes, dhows; the djinn and the ghoul for lore.
// Each noun list is ten words in the fixed order: three AN-MD, three EM-ST, two ST-MO, one fantastic (`h`), one general.
export default {
  key: "arabic", label: "Arabic", style: "first",
  land: {
    B: "Date|Camel|Frankincense|Myrrh|Coffee|Henna|Barley|Goat|Falcon|Pomegranate",
    C: "Djinn|Ghoul|Afrit|Sand Queen|Buried City|Lost Caravan",
    D: "Well;AN-MD|Palm Grove;AN-MD|Watchtower;AN-MD|Bedouin Camp;AN-MD|Caravan Stop;AN-MD|Frontier Fort;MD|Mosque;MD|Date Plantation;EM-ST|Pearl Station;EM-ST|Oil Camp;ST-MO|Pumping Station;ST-MO|Desalination Plant;MO|Desert Resort;MO|Solar Farm;MO",
  },
  water: {
    B: "Pearl|Dhow|Date|Dried Shark|Incense|Spice|Mother-of-Pearl|Tanker|Oil|Coral",
    C: "Sea Djinn|Drowned City|Marid|Phantom Dhow|Sea Serpent|Pearl Queen",
    D: "Fish Trap;AN-MD|Harbour Tower;AN-MD|Salt Works;AN-MD|Incense Landing;MD|Dhow Yard;MD|Pearl Bank Station;EM-ST|Customs House;EM-ST|Telegraph Station;ST-MO|Oil Jetty;ST-MO|Corniche;MO|Marina;MO|Container Terminal;MO",
  },
  route: {
    N: "Incense Road|Caravan Road|Pilgrim Road|Camel Track|Wadi Track|Desert Track",
    B: "Incense|Pearl|Salt|Spice|Date|Camel|Pilgrims'|Coffee",
    C: "Ghost|Djinn's|Ghoul's|Phantom|Lost|Buried",
    D: "Incense Road;AN-MD|Caravan Road;AN-MD|Camel Track;AN-MD|Wadi Track;AN-MD|Pilgrim Road;MD|Hajj Route;MD|Coach Road;EM-ST|Telegraph Road;EM-ST|Pilgrim Railway;ST-MO|Oil Road;ST-MO|Highway;MO|Flyover;MO|Metro Line;MO",
  },
  sacred: {
    N: "Holy Well|Saint's Tomb|Mosque|Madrasa|Shrine|Minaret",
    B: "Saint's|Imam's|Pilgrims'|Healing|Holy|Sheikh's",
    C: "Djinn's|Enchanted|Ghoul's|Buried|Phantom",
    D: "Holy Well of the Pilgrims;AN-MD|Holy Well;AN-MD|Saint's Tomb;AN-MD|Dark Stone Shrine;AN-MD|Mosque;MD|Madrasa;MD|Pilgrim Hostel;EM-ST|Sufi Lodge;EM-ST|Great Mosque;ST-MO|Memorial Mosque;ST-MO|Pilgrimage Square;MO",
  },
  nouns: {
    land: {
      mountain: ["Watch Mountain|Incense Mountain|Hermit Mountain|Fort Mountain|Bedouin Mountain|Mosque Mountain|Quarry Mountain|Cable Mountain|Djinn Mountain|Great Mountain", "Sandstone Ridge|Frontier Ridge|Caravan Ridge|Copper Ridge|Telegraph Ridge|Hejaz Ridge|Pipeline Ridge|Hiking Ridge|Afrit's Ridge|Long Ridge", "Barrier Range|Rocky Mountains|Frontier Chain|Copper Range|Oil Range|Railway Range|Dam Range|Trekking Range|Djinn Range|Mountains"],
      wood: ["Acacia Forest|Juniper Forest|Frankincense Forest|Cedar Forest|Hunting Forest|Charcoal Forest|Reserve Forest|Tourist Forest|Ghoul Forest|Great Forest", "Date Grove|Palm Grove|Olive Grove|Sidr Grove|Fig Grove|Henna Grove|Memorial Grove|Fruit Grove|Djinn Grove|Old Grove", "Wadi Clearing|Spring Clearing|Camp Clearing|Tamarisk Clearing|Grazing Clearing|Hunting Clearing|Picnic Clearing|Camp Site|Ghoul Clearing|Clearing"],
      moor: ["Stony Desert|Salt Desert|Sand Desert|Gravel Desert|Frontier Desert|Mining Desert|Dust Desert|Hunting Desert|Ghoul Desert|Open Desert", "Burial Hill|Watch Hill|Border Hill|Lava Hill|Telegraph Hill|Mine Hill|Viewpoint Hill|Antenna Hill|Djinn's Hill|Round Hill", "Camel Stone|Grave Stone|Boundary Stone|Wayside Stone|Milestone|Memorial Stone|Monument Stone|Photo Stone|Afrit Stone|Standing Stone"],
      wet: ["Salt Marsh|Reed Marsh|Heron Marsh|Date Marsh|Drained Marsh|Papyrus Marsh|Reserve Marsh|Flamingo Marsh|Marid's Marsh|Marsh", "Tidal Flat|Salt Flat|Reed Flat|Pearl Flat|Cut Flat|Pumped Flat|Spa Flat|Birdwatch Flat|Lantern Flat|Flat", "Lagoon Isle|Reed Isle|Pearl Isle|Fisher Isle|Fort Isle|Prison Isle|Ferry Isle|Resort Isle|Djinn's Isle|Isle"],
      grass: ["Pasture Plain|Barley Plain|Camel Plain|Frontier Plain|Tribal Plain|Cotton Plain|Irrigated Plain|Solar Plain|Ghoul Plain|Great Plain", "Winter Pasture|Spring Pasture|Camel Pasture|Wadi Pasture|Bedouin Pasture|Goat Pasture|Cooperative Pasture|Tourist Pasture|Djinn Pasture|Pasture", "Fertile Wadi|Orchard Wadi|Palm Wadi|River Wadi|Mill Wadi|Cotton Wadi|Dam Wadi|Wine Wadi|Afrit Wadi|Wadi"],
      lands: ["Caliphate|Emirate|Frontier March|Sultanate|Province|Kingdom|Imamate|Republic|Lost Caliphate|Lands", "Sultan's Domain|Governorate|Emirate|Sheikhdom|Vilayet|Province|Protectorate|District|Djinn Kingdom|Territory", "Tribe Lands|Oasis Lands|Town Lands|Quarter|Headman's Lands|Council Lands|Municipality|Neighbourhood|Ghoul Lands|Common Lands"],
      farm: ["Date Field|Barley Field|Wheat Field|Henna Field|Irrigated Field|Cotton Field|Greenhouse Field|Solar Field|Ghoul Field|Field", "Oasis Farm|Camel Farm|Falcon Farm|Date Estate|Coffee Farm|Palm Farm|Desert Hotel|Organic Farm|Djinn Farm|Farm", "Goat Pen|Camel Enclosure|Palm Enclosure|Walled Garden|Caravan Enclosure|Cattle Pen|Stud Enclosure|Camp Enclosure|Afrit Pen|Enclosure"],
      hill: ["Hill|Fort Hill|Hermit Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Djinn's Hill|Round Hill", "Wadi|Dry Valley|Caravan Valley|Mine Valley|Railway Valley|Dam Valley|Highway Valley|Hidden Valley|Ghoul Valley|Valley", "Hill Spur|Border Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Pylon Ridge|Skyline Ridge|Glider Ridge|Afrit Ridge|Ridge"],
      river: ["Mountain Stream|Mill Stream|Ford Stream|Spring Stream|Qanat Stream|Irrigation Stream|Rafting Stream|Canoe Stream|Marid Stream|Brook", "Oasis Lake|Mountain Lake|Fish Lake|Reservoir Lake|Salt Lake|Spa Lake|Beach Lake|Sailing Lake|Djinn Lake|Lake", "Mountain Falls|Mill Falls|Spring Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Tourist Falls|Afrit Falls|Falls"],
      desert: ["Empty Sand Desert|Red Sand Desert|Salt Desert|Incense Desert|Bedouin Desert|Frontier Desert|Oil Field Desert|Mining Desert|Djinn Desert|Great Desert", "Singing Dune|Camel Dune|Red Dune|Caravan Dune|Border Dune|Pipeline Dune|Tourist Dune|Dune Bash Dune|Ghoul Dune|Dune", "Watch Rock|Cave Rock|Hermit Rock|Fort Rock|Salt Rock|Mine Rock|Climbing Rock|Photo Rock|Afrit Rock|Rock"],
    },
    water: {
      sea: ["Bay|Pearl Bay|Dhow Bay|Harbour Bay|Pirate Bay|Roadstead|Naval Bay|Tuna Bay|Marid's Bay|Great Bay", "Inlet|Creek|Salt Inlet|Dhow Inlet|Harbour Inlet|Shipyard Inlet|Marina Inlet|Beach Inlet|Drowned Inlet|Khor", "Strait|Narrow Strait|Customs Strait|Convoy Strait|Pirate Strait|Tanker Strait|Ferry Strait|Shipping Strait|Phantom Strait|Sound"],
      coast: ["Headland|Cape|Watch Cape|Pearl Cape|Pirate Cape|Lighthouse Cape|Quarantine Cape|Corniche Walk|Marid Cape|Point", "Cove|Pirate Cove|Pearl Divers' Cove|Dhow Cove|Salt Cove|Fisher Cove|Beach Cove|Resort Cove|Siren Cove|Beach", "Island|Hermit Island|Prison Island|Pearl Island|Pilgrim Island|Quarantine Island|Resort Island|Ferry Island|Phantom Island|Isle"],
      chart: ["Bank|Pearl Bank|Fishing Bank|Wreck Bank|Coral Bank|Convoy Bank|Trawl Bank|Sandbank|Marid Bank|Shoal", "Reef|Coral Reef|Wreck Reef|Dhow Reef|Pirate Reef|Tanker Reef|Dive Reef|Artificial Reef|Drowned Reef|Rock", "Channel|Pearl Channel|Dhow Channel|Pilot Channel|Customs Channel|Convoy Channel|Ferry Channel|Shipping Channel|Phantom Channel|Passage"],
    },
    route: [
      "Incense Road|Caravan Causeway|Post Road|King's Highway|Pilgrim Highway|Camel Road|Main Road|Highway|Ghost Road|Desert Highway",
      "Spice Road|Salt Road|Pearl Road|Coffee Road|Date Road|Camel Track|Rail Freight Line|Pipeline Corridor|Smugglers' Track|Trade Road",
      "Hajj Road|Pilgrim Track|Saint's Path|Mosque Path|Holy Road|Zamzam Road|Walking Route|Trekking Trail|Enchanted Way|Pilgrim Way",
    ],
    sacred: [
      "Holy Well|Healing Spring|Saint's Fountain|Ablution Pool|Hot Spring|Pilgrim Spring|Fountain Shrine|Spa Pool|Djinn Spring|Spring",
      "Saint's Tomb|Dark Stone|Pilgrim Stone|Standing Stone|Boundary Stone|Tomb Garden|Memorial Stone|Summit Cairn|Afrit Stone|Holy Rock",
      "Mosque|Madrasa|Great Mosque|Sufi Lodge|Minaret|Memorial Mosque|Heritage Mosque|Restored Madrasa|Enchanted Shrine|Shrine",
    ],
  },
};
