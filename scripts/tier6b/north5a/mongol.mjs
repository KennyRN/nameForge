// Mongol (brief 6b): the steppe and the ordo; ger camps and herds, cairns on passes, relay stations, sacred mountains, monasteries, collective farms; the blue wolf and the wind horse for lore.
// The steppe has no sea: its water lists are lakes, rivers and salt lakes, and the sea modules are exempt for it in the coverage report (docs/second-tier-6b.md).
// Each noun list is ten words in the fixed order: three AN-MD, three EM-ST, two ST-MO, one fantastic (`h`), one general.
export default {
  key: "mongol", label: "Mongol", style: "first",
  land: {
    B: "Horse|Sheep|Camel|Yak|Goat|Cashmere|Marmot|Wild Onion|Felt|Fermented Mare's Milk",
    C: "Blue Wolf|Sky Spirit|Mountain Spirit|Wind Horse|Death Worm|Wild Man",
    D: "Cairn;AN-MD|Herder's Camp;AN-MD|Wintering Place;AN-MD|Relay Station;AN-MD|Felt Tent Camp;AN-MD|Prayer Banner Hill;MD|Monastery;MD|Winter Shelter;EM-ST|Border Post;EM-ST|Railway Siding;ST-MO|Collective Farm;ST-MO|Mining Town;MO|Tourist Camp;MO|Wind Farm;MO",
  },
  water: {
    B: "Omul|Taimen|Salt|Reed|Duck|Swan|Crane|Ice|Fish Weir|Felt Boat",
    C: "Lake Dragon|Water Spirit|Drowned Camp|Silver Fish Queen|Ice Phantom|Lake Giant",
    D: "Fishing Weir;AN-MD|Ice Fishing Hole;AN-MD|Salt Crust;AN-MD|Lake Shrine;MD|Reed Camp;MD|Ferry Raft;EM-ST|Border Post;EM-ST|Fish Cannery;ST-MO|Boat Station;ST-MO|Lakeside Camp;MO|Resort;MO|Reservoir;MO",
  },
  route: {
    N: "Relay Road|Caravan Track|Tea Road|Steppe Track|Mountain Pass|Herd Road",
    B: "Tea|Horse|Wool|Salt|Camel|Courier|Felt|Silk",
    C: "Ghost|Wolf's|Phantom|Sky|Wind|Spirit",
    D: "Courier Road;AN-MD|Relay Road;AN-MD|Caravan Track;AN-MD|Tea Road;AN-MD|Cart Track;MD|Imperial Courier Road;MD|Trade Track;EM-ST|Frontier Road;EM-ST|Railway Line;ST-MO|Soviet Highway;ST-MO|Asphalt Road;MO|Border Crossing;MO|Mining Road;MO",
  },
  sacred: {
    N: "Cairn|Sacred Mountain|Sacred Spring|Shrine|Monastery|Stupa",
    B: "Holy|Lama's|Shaman's|Pilgrims'|Spirit|Sky's",
    C: "Sky's|Wolf's|Enchanted|Giant's|Phantom",
    D: "Cairn;AN-MD|Sacred Spring;AN-MD|Shaman's Rock;AN-MD|Sacred Mountain;AN-MD|Monastery;MD|Prayer Wheel Hall;MD|Stupa;EM-ST|Festival Ground;EM-ST|Memorial Temple;ST-MO|Pilgrim Camp;ST-MO|Heritage Monastery;MO",
  },
  nouns: {
    land: {
      mountain: ["Cairn Peak|Blue Peak|Eagle Peak|Hunters' Peak|Khan's Peak|Sky Peak|Border Peak|Radio Peak|Wolf Peak|Great Peak", "Pass Ridge|Herder's Ridge|Snow Ridge|Mining Ridge|Frontier Ridge|Wind Ridge|Pylon Ridge|Skyline Ridge|Spirit Ridge|Long Ridge", "Golden Range|Sacred Range|Border Mountains|Mining Range|Frontier Range|Snow Range|Pipeline Range|Trekking Range|Wolf Range|Mountains"],
      wood: ["Larch Forest|Birch Forest|Hunting Forest|Sacred Forest|Taiga Forest|Pine Forest|Reserve Forest|Logging Forest|Spirit Forest|Great Forest", "Birch Grove|Larch Grove|Shaman's Grove|Aspen Grove|Willow Grove|Poplar Grove|Memorial Grove|Pine Grove|Wolf Grove|Old Grove", "Larch Clearing|Camp Clearing|Spring Clearing|Hunting Clearing|Logging Clearing|Herder's Clearing|Picnic Clearing|Wind Clearing|Spirit Clearing|Clearing"],
      moor: ["Wild Ass Moor|Salt Moor|Sheep Moor|Saxaul Moor|Frontier Moor|Dust Moor|Wind Moor|Hunting Moor|Wolf Moor|Open Moor", "Burial Mound|Cairn Hill|Border Hill|Stone Hill|Relay Hill|Mine Hill|Viewpoint Hill|Antenna Hill|Giant's Hill|Round Hill", "Deer Stone|Grave Stone|Boundary Stone|Cairn Stone|Milestone|Memorial Stone|Monument Stone|Photo Stone|Wolf Stone|Standing Stone"],
      wet: ["Salt Marsh|Reed Marsh|Crane Marsh|Spring Marsh|Frozen Marsh|Hay Marsh|Reserve Marsh|Swan Marsh|Water Spirit's Marsh|Marsh", "Peat Bog|Frozen Bog|Reed Bog|Spring Bog|Cut Bog|Pumped Bog|Mud Bath Bog|Birdwatch Bog|Lantern Bog|Bog", "Lake Isle|Reed Isle|Herder's Isle|Shrine Isle|Hermit's Isle|Ice Isle|Ferry Isle|Camp Isle|Spirit Isle|Isle"],
      grass: ["Steppe|Wheat Steppe|Horse Steppe|Frontier Steppe|Khan's Steppe|Camel Steppe|Collective Steppe|Solar Steppe|Wolf Steppe|Great Steppe", "Summer Pasture|Winter Pasture|Spring Pasture|Autumn Pasture|Horse Pasture|Sheep Pasture|Herders' Pasture|Tourist Pasture|Spirit Pasture|Pasture", "Wide Valley|Willow Valley|Spring Valley|River Valley|Mill Valley|Wheat Valley|Dam Valley|Camp Valley|Wind Valley|Valley"],
      lands: ["Great Khanate|Appanage|Ten Thousand Lands|Banner Lands|Province|Aimag|Khanate|Republic|Lost Great Khanate|Lands", "Banner|League|Khan's Domain|Princely Banner|Frontier Banner|Aimag|Province|District|Wolf Realm|Territory", "Camp Lands|Clan Lands|Herders' Lands|Sum Lands|Council Lands|Brigade Lands|Collective Lands|Ward|Spirit Lands|Common Lands"],
      farm: ["Barley Field|Horse Field|Hay Field|Wheat Field|Potato Field|Collective Field|Greenhouse Field|Solar Field|Wolf Field|Field", "Stud Farm|Herding Station|Dairy Farm|Cashmere Farm|Winter Farm|Collective Farm|Ger Hotel|Organic Farm|Spirit Farm|Farm", "Sheep Pen|Horse Pen|Winter Enclosure|Camel Enclosure|Calf Pen|Corral|Stud Enclosure|Camp Enclosure|Wolf Pen|Enclosure"],
      hill: ["Hill|Cairn Hill|Shaman's Hill|Camp Hill|Mine Hill|Prayer Hill|Viewpoint Hill|Radio Hill|Giant's Hill|Round Hill", "Gorge|Herders' Valley|Relay Valley|Mine Valley|Railway Valley|Reservoir Valley|Road Valley|Hidden Valley|Spirit Valley|Valley", "Hill Spur|Border Ridge|Stepped Ridge|Mine Ridge|Cutting Ridge|Pylon Ridge|Skyline Ridge|Glider Ridge|Wolf Ridge|Ridge"],
      river: ["Mountain Stream|Mill Stream|Ford Stream|Taimen Stream|Spring Stream|Irrigation Stream|Rafting Stream|Canoe Stream|Wolf Stream|Brook", "Mountain Lake|Salt Lake|Fish Lake|Sacred Lake|Reservoir Lake|Soda Lake|Beach Lake|Sailing Lake|Dragon Lake|Lake", "Mountain Falls|Mill Falls|Spring Falls|Weir|Cascade|Dam Spillway|Gorge Falls|Tourist Falls|Spirit Falls|Falls"],
      desert: ["Stony Wild Ass Desert|Stony Desert|Gravel Desert|Camel Desert|Herders' Desert|Frontier Desert|Dinosaur Desert|Mining Desert|Wind Horse Desert|Great Desert", "Singing Dune|Camel Dune|Wind Dune|Herders' Dune|Border Dune|Pipeline Dune|Tourist Dune|Sand Ski Dune|Spirit Dune|Dune", "Cairn Rock|Cave Rock|Lama's Rock|Petroglyph Rock|Bone Rock|Mine Rock|Climbing Rock|Photo Rock|Death Worm Rock|Rock"],
    },
    water: {
      sea: ["Great Lake|Reed Lake|Salt Lake|Sacred Lake|Fishing Lake|Crane Lake|Frozen Lake|Camp Lake|Dragon Lake|Blue Lake", "Lake Inlet|Reed Inlet|Salt Inlet|Fish Inlet|Frozen Inlet|Spring Inlet|Camp Inlet|Beach Inlet|Drowned Inlet|Creek", "Lake Narrows|Reed Narrows|Ice Narrows|Ferry Narrows|Border Narrows|Raft Narrows|Boat Narrows|Shipping Narrows|Phantom Narrows|Sound"],
      coast: ["Headland|Rocky Point|Shaman's Point|Fisher's Point|Border Point|Ice Point|Camp Point|Lakeside Walk|Dragon Point|Point", "Cove|Reed Cove|Fishermen's Cove|Salt Cove|Spring Cove|Frozen Cove|Beach Cove|Resort Cove|Spirit Cove|Beach", "Island|Hermit Island|Shrine Island|Fisher Island|Pilgrim Island|Prison Island|Resort Island|Ferry Island|Phantom Island|Isle"],
      chart: ["Bank|Fishing Bank|Taimen Bank|Ice Bank|Salt Bank|Frozen Bank|Net Bank|Sandbank|Spirit Bank|Shoal", "Rock|Ice Rock|Fisher's Rock|Reef Rock|Shrine Rock|Boat Rock|Dive Rock|Marker Rock|Drowned Rock|Reef", "Channel|Reed Channel|Ice Channel|Ferry Channel|Boat Channel|Fishing Channel|Marker Channel|Shipping Channel|Phantom Channel|Passage"],
    },
    route: [
      "Courier Road|Relay Track|Imperial Road|Caravan Road|Tea Road|Cart Road|Main Road|Highway|Ghost Road|Asphalt Road",
      "Tea Road|Horse Road|Wool Road|Salt Road|Camel Road|Fur Road|Rail Freight Line|Freight Corridor|Smugglers' Track|Trade Road",
      "Pilgrim Track|Lama's Path|Cairn Path|Circuit of the Mountain|Prayer Road|Monastery Road|Walking Route|Trekking Trail|Enchanted Way|Holy Road",
    ],
    sacred: [
      "Sacred Spring|Healing Spring|Holy Fountain|Ablution Spring|Hot Spring|Mineral Spring|Spring Shrine|Spa Pool|Spirit Spring|Spring",
      "Cairn|Prayer Cairn|Shaman's Rock|Standing Stone|Boundary Cairn|Deer Stone|Memorial Cairn|Summit Cairn|Giant's Cairn|Holy Rock",
      "Sacred Mountain|Monastery|Prayer Wheel Hall|Stupa|Festival Ground|Memorial Temple|Heritage Monastery|Restored Temple|Enchanted Shrine|Temple",
    ],
  },
};
