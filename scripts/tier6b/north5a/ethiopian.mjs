// Ethiopian (brief 6b): the highlands; ambas and their monasteries, rock-hewn churches, stelae, highland markets, coffee, the Rift lakes and lowlands; the buda and the zar for lore.
// Each noun list is ten words in the fixed order: three AN-MD, three EM-ST, two ST-MO, one fantastic (`h`), one general.
export default {
  key: "ethiopian", label: "Ethiopian", style: "first",
  land: {
    B: "Teff|Coffee|Honey|Barley|Khat|Highland Sheep|Mule|Enset|Mead|Spice",
    C: "Zar|Zar Spirit|Lion of the Hills|Hyena Spirit|Hidden Church|Ark Guardian",
    D: "Stele;AN-MD|Rock Church;AN-MD|Amba Monastery;AN-MD|Highland Hut;AN-MD|Fortified Camp;AN-MD|Hermitage;MD|Pilgrim Path;MD|Coffee Terrace;EM-ST|Market Town;EM-ST|Mission Station;ST-MO|Railway Halt;ST-MO|Reservoir;MO|Flower Farm;MO|Wind Farm;MO",
  },
  water: {
    B: "Tilapia|Honey|Papyrus|Salt|Fish|Reed Boat|Hippo|Ferry|Coffee|Spice",
    C: "Lake Serpent|Drowned Church|Water Spirit|Phantom Boat|Lake Giant|Hippo Queen",
    D: "Reed Boat Landing;AN-MD|Island Monastery;AN-MD|Fish Weir;AN-MD|Salt Caravan Stop;MD|Ferry Crossing;MD|Lake Mission;EM-ST|Customs Post;EM-ST|Steamer Landing;ST-MO|Dam;ST-MO|Lakeside Resort;MO|Marina;MO|Hydropower Station;MO",
  },
  route: {
    N: "Salt Road|Caravan Road|Pilgrim Road|Mule Track|Mountain Pass|Market Road",
    B: "Salt|Coffee|Honey|Mule|Pilgrims'|Spice|Gold|Grain",
    C: "Ghost|Zar's|Hyena's|Phantom|Hidden|Lost",
    D: "Salt Caravan Road;AN-MD|Highland Track;AN-MD|Pilgrim Path;AN-MD|Mule Track;AN-MD|Satrap's Road;MD|Pass Road;MD|Mission Road;EM-ST|Telegraph Road;EM-ST|Railway Line;ST-MO|Dirt Road;ST-MO|Highway;MO|Ring Road;MO|Light Rail;MO",
  },
  sacred: {
    N: "Rock Church|Baptismal Pool|Monastery|Holy Spring|Stele|Cross",
    B: "Saint's|Priest's|Pilgrims'|Healing|Holy|Hermit's",
    C: "Lion's|Enchanted|Zar's|Hidden|Phantom",
    D: "Stele;AN-MD|Holy Spring;AN-MD|Rock Church;AN-MD|Cave Church;AN-MD|Island Monastery;MD|Amba Monastery;MD|Baptism Pool;EM-ST|Pilgrim Hostel;EM-ST|Cathedral;ST-MO|Memorial Church;ST-MO|Pilgrimage Hill;MO",
  },
  nouns: {
    land: {
      mountain: ["Amba|Flat Amba|Rock Amba|Monastery Amba|Fortress Amba|Hermit Amba|Pilgrim Amba|Radio Amba|Hyena Amba|Great Amba", "Escarpment Ridge|Highland Ridge|Pass Ridge|Mining Ridge|Frontier Ridge|Mission Ridge|Pylon Ridge|Hiking Ridge|Zar Ridge|Long Ridge", "Northern Range|Highland Mountains|Rift Escarpment|Mining Range|Rail Range|Coffee Range|Dam Range|Trekking Range|Zar Range|Mountains"],
      wood: ["Juniper Forest|Podocarpus Forest|Church Forest|Hunting Forest|Coffee Forest|Wild Olive Forest|Reserve Forest|Picnic Forest|Zar Forest|Great Forest", "Church Grove|Fig Grove|Sycamore Grove|Hermit Grove|Eucalyptus Grove|Coffee Grove|Memorial Grove|Orange Grove|Zar Grove|Old Grove", "Spring Clearing|Camp Clearing|Church Clearing|Honey Clearing|Logging Clearing|Hunting Clearing|Picnic Clearing|Camp Site|Hyena Clearing|Clearing"],
      moor: ["Afroalpine Moor|Heather Moor|Sheep Moor|Lobelia Moor|Frontier Moor|Mining Moor|Wind Moor|Hunting Moor|Hyena Moor|Open Moor", "Burial Hill|Stele Hill|Border Hill|Ruin Hill|Telegraph Hill|Mine Hill|Viewpoint Hill|Antenna Hill|Zar's Hill|Round Hill", "Obelisk Stone|Grave Stone|Boundary Stone|Cross Stone|Milestone|Memorial Stone|Monument Stone|Photo Stone|Zar Stone|Standing Stone"],
      wet: ["Highland Marsh|Reed Marsh|Ibis Marsh|Papyrus Marsh|Drained Marsh|Hay Marsh|Reserve Marsh|Flamingo Marsh|Hippo Queen's Marsh|Marsh", "Highland Bog|Hot Bog|Reed Bog|Lake Bog|Cut Bog|Pumped Bog|Spa Bog|Birdwatch Bog|Lantern Bog|Bog", "Lake Isle|Reed Isle|Monastery Isle|Hermit Isle|Prison Isle|Church Isle|Ferry Isle|Picnic Isle|Zar's Isle|Isle"],
      grass: ["Highland Plain|Teff Plain|Cattle Plain|Frontier Plain|Rift Plain|Coffee Plain|Irrigated Plain|Solar Plain|Hyena Plain|Great Plain", "Highland Pasture|Summer Pasture|Winter Pasture|Mule Pasture|Cattle Pasture|Sheep Pasture|Cooperative Pasture|Tourist Pasture|Zar Pasture|Pasture", "Fertile Valley|Barley Valley|Enset Valley|River Valley|Mill Valley|Coffee Valley|Dam Valley|Flower Valley|Zar Valley|Valley"],
      lands: ["Kingdom|Aksumite Lands|Frontier March|Province|Highland Kingdom|Empire|Principality|Federal Region|Lost Kingdom|Lands", "Ras's Domain|Province|Governorate|Highland Principality|Negus's Lands|Crown Lands|Protectorate|District|Zar Kingdom|Territory", "Clan Lands|Village Lands|Town Lands|Church Lands|Headman's Lands|Council Lands|Municipality|Neighbourhood|Zar Lands|Common Lands"],
      farm: ["Teff Field|Barley Field|Wheat Field|Bean Field|Terraced Field|Coffee Field|Greenhouse Field|Solar Field|Hyena Field|Field", "Highland Farm|Mule Farm|Honey Farm|Coffee Estate|Enset Farm|Flower Farm|Rural Lodge|Organic Farm|Zar Farm|Farm", "Sheep Pen|Cattle Pen|Church Enclosure|Walled Garden|Caravan Enclosure|Cattle Yard|Stud Enclosure|Camp Enclosure|Zar Pen|Enclosure"],
      hill: ["Hill|Church Hill|Hermit Hill|Mill Hill|Mine Hill|Windmill Hill|Viewpoint Hill|Radio Hill|Zar's Hill|Round Hill", "Gorge|Highland Valley|Pilgrim Valley|Mine Valley|Railway Valley|Dam Valley|Highway Valley|Hidden Valley|Zar Valley|Valley", "Hill Spur|Border Ridge|Terraced Ridge|Mine Ridge|Cutting Ridge|Pylon Ridge|Skyline Ridge|Glider Ridge|Hyena Ridge|Ridge"],
      river: ["Highland Stream|Mill Stream|Ford Stream|Spring Stream|Church Stream|Terrace Stream|Rafting Stream|Gorge Stream|Water Spirit Stream|Brook", "Crater Lake|Rift Lake|Soda Lake|Church Lake|Reservoir Lake|Hot Lake|Flamingo Lake|Sailing Lake|Serpent Lake|Lake", "Great Blue Falls|Mill Falls|Spring Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Tourist Falls|Zar Falls|Falls"],
      desert: ["Salt Desert|Lava Desert|Sulphur Desert|Caravan Desert|Afar Desert|Frontier Desert|Potash Desert|Mining Desert|Zar Desert|Great Desert", "Singing Dune|Camel Dune|Salt Dune|Caravan Dune|Border Dune|Pipeline Dune|Tourist Dune|Sand Ski Dune|Hyena Dune|Dune", "Watch Rock|Cave Rock|Hermit Rock|Fort Rock|Salt Rock|Mine Rock|Climbing Rock|Photo Rock|Zar Rock|Rock"],
    },
    water: {
      sea: ["Bay|Lake Bay|Papyrus Bay|Harbour Bay|Pirate Bay|Roadstead|Naval Bay|Tilapia Bay|Siren Bay|Great Bay", "Inlet|Creek|Salt Inlet|Reed Inlet|Harbour Inlet|Shipyard Inlet|Marina Inlet|Beach Inlet|Drowned Inlet|Gulf", "Strait|Narrow Strait|Customs Strait|Convoy Strait|Pirate Strait|Steamer Strait|Ferry Strait|Shipping Strait|Phantom Strait|Sound"],
      coast: ["Headland|Cape|Watch Cape|Fisher's Cape|Pirate Cape|Lighthouse Cape|Quarantine Cape|Lakeside Walk|Siren Cape|Point", "Cove|Smugglers' Cove|Fishermen's Cove|Reed Boat Cove|Salt Cove|Fisher Cove|Beach Cove|Resort Cove|Siren Cove|Beach", "Island|Monastery Island|Prison Island|Hermit Island|Pilgrim Island|Quarantine Island|Resort Island|Ferry Island|Phantom Island|Isle"],
      chart: ["Bank|Fishing Bank|Tilapia Bank|Wreck Bank|Reed Bank|Convoy Bank|Trawl Bank|Sandbank|Siren Bank|Shoal", "Reef|Rock Reef|Wreck Reef|Boat Reef|Pirate Reef|Steamer Reef|Dive Reef|Artificial Reef|Drowned Reef|Rock", "Channel|Reed Channel|Boat Channel|Pilot Channel|Customs Channel|Convoy Channel|Ferry Channel|Shipping Channel|Phantom Channel|Passage"],
    },
    route: [
      "Satrap's Road|Highland Causeway|Post Road|Mule Highway|Pilgrim Highway|Camel Road|Main Road|Highway|Ghost Road|Asphalt Road",
      "Salt Road|Coffee Road|Honey Road|Gold Road|Grain Road|Mule Track|Rail Freight Line|Freight Corridor|Smugglers' Track|Trade Road",
      "Pilgrim Path|Church Path|Saint's Path|Monastery Path|Holy Road|Hermit's Track|Walking Route|Trekking Trail|Enchanted Way|Pilgrim Way",
    ],
    sacred: [
      "Holy Spring|Healing Spring|Saint's Fountain|Baptismal Pool|Hot Spring|Church Spring|Fountain Shrine|Spa Pool|Zar Spring|Spring",
      "Stele|Obelisk|Cross Stone|Standing Stone|Boundary Stone|Tomb Garden|Memorial Stone|Summit Cairn|Zar Stone|Holy Rock",
      "Rock Church|Cave Church|Island Monastery|Amba Monastery|Pilgrim Hostel|Cathedral|Heritage Church|Restored Church|Enchanted Church|Church",
    ],
  },
};
