// Northern Europe tables brief, batch 5b (B2): the culture words of streets and districts, inns and taverns, buildings and landmarks,
// monuments and statues. Per module, three lists of ten words (one per main kind), in this order: three words of the ancient to medieval
// eras, three of the early modern to the steam age, two of the steam age to modern, one fantastic (the culture's own lore) and one for every era.
// Streets: streets, squares, districts. Inns: inn, tavern, wayhouse. Buildings: defence, faith, civic. Monuments: stone, cross, memorial.
// `x` are extra frames [pattern, weight, kind index]; `adj` the three adjectives the plain frames use.

export const ENGLISH = {
  style: "last", adj: ["Old", "High", "Long"],
  streets: [
    "Way|Gate|Street|Row|Court|Lane|Terrace|Crescent|Elf Walk|Close",
    "Green|Cross|Market Place|Shambles|Butts|Pavement|Parade|Circus|Fairy Ring|Common",
    "Ward|Borough|Cheap|Liberty|Almonry|Mill End|Garden Suburb|Estate|Ghost Quarter|Quarter",
  ],
  inns: [
    "Inn|Alehouse|Hostelry|Coaching Inn|Posting House|Roadhouse|Motor Inn|Lodge|Haunt|House",
    "Tavern|Ale Stake|Brewhouse|Gin Palace|Beerhouse|Free House|Pub|Local|Wassail House|Taproom",
    "Stopping Place|Wayfarers' Rest|Drovers' Stop|Waggon Yard|Posting Stage|Travellers' Rest|Motel|Layby Cafe|Crossroads Haunt|Rest",
  ],
  buildings: [
    "Keep|Motte|Gatehouse|Bastion|Citadel|Fort|Barracks|Armoury|Bone Tower|Tower",
    "Church|Minster|Chapel|Abbey|Priory|Meeting House|Cathedral|Parish Hall|Shrine of Elves|Hall",
    "Guildhall|Moot Hall|Market Hall|Almshouse|Town Hall|Corn Exchange|Workhouse|Library|Mayor's Parlour|Hall",
  ],
  monuments: [
    "Standing Stone|Moot Stone|Cairn|Barrow|Milestone|Boundary Stone|Memorial Stone|Roadside Stone|Giant's Stone|Stone",
    "Market Cross|Preaching Cross|Wayside Cross|Eleanor Cross|Churchyard Cross|Butter Cross|Celtic Cross|Memorial Cross|Elf Cross|Cross",
    "Memorial|Tablet|Plaque|Obelisk|Cenotaph|War Memorial|Statue|Blue Plaque|Ghost Memorial|Monument",
  ],
  x: { streets: [["{N0} End", 6, 0], ["Back {N0}", 4, 0], ["{N1} Side", 4, 1]], inns: [["the {creature} and {item}", 5, 0]], buildings: [["{town} {N1}", 8, 1]], monuments: [["{town} {N1}", 8, 1]] },
};

export const WELSH = {
  style: "first", adj: ["Old", "Long", "Little"],
  streets: [
    "Chapel Row|Lane|Bridge Street|Terrace|Slate Row|Hill Street|Station Road|Chapel Street|Dragon Lane|Row",
    "Chapel Green|Square|Market Square|Cross|Pound|Fair Green|Station Yard|Memorial Square|Giants' Square|Green",
    "Quarter|Terraces|Quarry Rows|Village End|Slate Town|Mining Rows|Colliery Rows|Housing Estate|Dragon Quarter|Rows",
  ],
  inns: [
    "Arms|Inn|Alehouse|Drovers' Inn|Coaching Inn|Chapel Inn|Temperance Hotel|Hotel|Dragon Inn|House",
    "Tavern|Beerhouse|Drovers' Stop|Miners' Arms|Quarrymen's Arms|Working Men's Club|Social Club|Pub|Wild Hunt Tavern|Bar",
    "Drovers' Rest|Pilgrims' Stop|Packhorse Stage|Coach Stage|Station Rest|Temperance Rest|Hikers' Hostel|Hostel|Hill Fairy Rest|Rest",
  ],
  buildings: [
    "Castle|Fort|Tower|Hill Fort|Keep|Gatehouse|Barracks|Pillbox|Dragon Tower|Hold",
    "Chapel|Church|Meeting House|Abbey|Priory|Methodist Chapel|Baptist Chapel|Welsh Chapel|Fairy Chapel|Shrine",
    "Guildhall|Market Hall|Almshouse|Slate Mill|Engine House|Town Hall|Institute|Library|Dragon Hall|Hall",
  ],
  monuments: [
    "Standing Stone|Cairn|Cromlech|Pillar Stone|Cross Slab|Milestone|Boundary Stone|Memorial Stone|Giant's Stone|Stone",
    "Cross|Celtic Cross|Wayside Cross|Preaching Cross|Churchyard Cross|High Cross|Pilgrim Cross|Memorial Cross|Fairy Cross|Pillar",
    "Memorial|Tablet|Miners' Memorial|Slate Memorial|Quarrymen's Memorial|War Memorial|Statue|Plaque|Dragon Memorial|Monument",
  ],
  x: { streets: [["Chapel {N0}", 8, 0], ["{N0} of the Slate", 4, 0], ["{N2} of {destination}", 4, 2]], inns: [["{owner:poss} Arms", 10, 0], ["the Red Dragon {N1}", 5, 1]], buildings: [["Chapel of {holy}", 8, 1]], monuments: [["{N1} of {holy}", 6, 1]] },
};

export const SCOTTISH = {
  style: "last", adj: ["Auld", "High", "Long"],
  streets: [
    "Wynd|Close|Vennel|Gait|Brae|Lane|Row|Terrace|Kelpie Wynd|Street",
    "Market Cross|Mercat Cross|Green|Square|Tron|Kirk Green|Circus|Crescent|Selkie Green|Cross",
    "Burgh|Old Town|Canongate|Kirkgate|Weaver's Row|Mill Wynd|Tenements|Scheme|Ghost Close|Quarter",
  ],
  inns: [
    "Inn|Change House|Howff|Alehouse|Coaching Inn|Hotel|Whisky Bar|Lodge|Kelpie Inn|House",
    "Tavern|Ale House|Brewery Tap|Pub|Bothy|Public House|Free House|Bar|Brownie Tavern|Howff",
    "Stage|Drovers' Stance|Ferry Inn|Coaching Stage|Posting Inn|Shooting Lodge|Youth Hostel|Hostel|Fairy Hill Rest|Rest",
  ],
  buildings: [
    "Tower House|Peel|Keep|Castle|Fort|Barracks|Gatehouse|Garrison|Brownie Tower|Tower",
    "Kirk|Church|Chapel|Abbey|Cell|Priory|Cathedral|Manse|Selkie Shrine|Hall",
    "Tolbooth|Town House|Mercat Hall|Weigh House|Burgh Chambers|Town Hall|Mill|Library|Kelpie Hall|Hall",
  ],
  monuments: [
    "Standing Stone|Pictish Stone|Cairn|Cup Stone|Boundary Stone|Clan Stone|Milestone|Memorial Stone|Kelpie Stone|Stone",
    "Mercat Cross|Celtic Cross|Cross Slab|Market Cross|High Cross|Churchyard Cross|Burgh Cross|Memorial Cross|Fairy Cross|Cross",
    "Memorial|Clan Memorial|Cairn Memorial|Burns Memorial|Tablet|War Memorial|Statue|Plaque|Selkie Memorial|Monument",
  ],
  x: { streets: [["{N0} of {destination}", 5, 0], ["{founder:poss} {N0}", 6, 0]], inns: [["the {creature} {N1}", 8, 1], ["{owner:poss} {N0}", 8, 0]], buildings: [["{town} {N0}", 8, 0]], monuments: [["{town} {N1}", 8, 1]] },
};

export const IRISH = {
  style: "firstB", adj: ["Old", "Long", "Little"],
  streets: [
    "Mall|Quay|Parade|Lane|Boreen|Road|Street|Terrace|Banshee Lane|Row",
    "Fair Green|Square|Diamond|Market Square|Cross|Green|Circus|Memorial Green|Fairy Fort Green|Place",
    "Liberty|Quarter|Tenements|Mill Row|Abbey Lands|Estate|Housing Scheme|Quay Quarter|Banshee Quarter|Ward",
  ],
  inns: [
    "Public House|Inn|Shebeen|Alehouse|Coaching Inn|Hotel|Pub|Lounge|Banshee Inn|House",
    "Tavern|Shebeen|Spirit Grocer|Snug|Bar|Local|Lounge Bar|Singing Pub|Leprechaun Tavern|Pub",
    "Pilgrims' Rest|Drovers' Rest|Coach Stage|Ferry Stop|Travellers' Rest|Station Hotel|Bed and Breakfast|Hostel|Fairy Rest|Rest",
  ],
  buildings: [
    "Tower House|Castle|Fort|Ring Fort|Keep|Gatehouse|Barracks|Martello Tower|Banshee Tower|Tower",
    "Abbey|Church|Round Tower|Chapel|Priory|Holy Well House|Cathedral|Parish Church|Fairy Fort Shrine|Shrine",
    "Market House|Courthouse|Town Hall|Almshouse|Workhouse|Big House|Library|Hall|Leprechaun Hall|Guildhall",
  ],
  monuments: [
    "Ogham Stone|Standing Stone|Cairn|Dolmen|Holy Stone|Milestone|Boundary Stone|Memorial Stone|Giant's Stone|Stone",
    "High Cross|Celtic Cross|Pillar Cross|Wayside Cross|Market Cross|Churchyard Cross|Famine Cross|Memorial Cross|Fairy Cross|Cross",
    "Famine Memorial|Memorial|Tablet|Plaque|Statue|War Memorial|Rising Memorial|Monument|Banshee Memorial|Cairn",
  ],
  x: { streets: [["{N0} of the {trade}", 5, 0], ["Holy Well {N0}", 4, 0]], inns: [["{owner:poss} {N0}", 8, 0], ["the {creature} {N1}", 6, 1]], buildings: [["Holy Well of {holy}", 8, 1]], monuments: [["Ogham Stone of {owner}", 6, 0]] },
};

export const CORNISH = {
  style: "lastB", adj: ["Windy", "Tinners'", "Salt"],
  streets: [
    "Lane|Row|Cove Road|Chapel Street|Fore Street|Quay|Terrace|Hill|Pisky Lane|Street",
    "Square|Fish Market|Cross|Green|Quay Square|Market Place|Station Square|Memorial Green|Giant's Green|Plain",
    "Cove|Fish Cellars|Mining Row|Count House Row|Engine Row|Harbour Quarter|Terraces|Estate|Knocker Row|Quarter",
  ],
  inns: [
    "Smugglers' Inn|Alehouse|Inn|Fishermen's Inn|Hotel|Coaching Inn|Wheal Inn|Pub|Pisky Inn|Public House",
    "Cellar Bar|Tavern|Beerhouse|Chapel Pub|Fishermen's Tavern|Surfers' Bar|Wreckers' Tavern|Local|Knocker Tavern|Taproom",
    "Harbour Rest|Fish Cellar Rest|Coach Stop|Guest House|Pilgrims' Rest|Station Stop|Sailors' Hostel|Bunkhouse|Pisky Rest|Lodging",
  ],
  buildings: [
    "Round|Gun Battery|Castle|Fort|Tower|Pillbox|Gatehouse|Barracks|Giant's Tower|Citadel",
    "Holy Well House|Chapel|Church|Parish Church|Wesleyan Chapel|Bible Christian Chapel|Priory|Methodist Chapel|Pisky Shrine|Hermitage",
    "Count House|Market House|Stannary Hall|Guildhall|Almshouse|Engine House|Institute|Town Hall|Knocker Hall|Moot Hall",
  ],
  monuments: [
    "Standing Stone|Quoit|Cairn|Holed Stone|Inscribed Stone|Milestone|Boundary Stone|Memorial Stone|Giant's Stone|Stone",
    "Cornish Cross|Wayside Cross|Churchyard Cross|Lantern Cross|Preaching Cross|Market Cross|Pilgrim Cross|Memorial Cross|Pisky Cross|Cross",
    "Miners' Memorial|Engine House Memorial|Lifeboat Memorial|Memorial|War Memorial|Tablet|Statue|Plaque|Knocker Memorial|Monument",
  ],
  x: { streets: [["Wheal {N0}", 5, 0], ["{N0} of the Fishing Fleet", 4, 0]], inns: [["the Miners' {N0}", 7, 0], ["{owner:poss} Arms", 8, 0]], buildings: [["Chapel of {holy}", 8, 1], ["Wheal {N2}", 5, 2]], monuments: [["Cross of {holy}", 8, 1]] },
};
