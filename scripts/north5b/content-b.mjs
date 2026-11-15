// Batch 5b content, continued: Norse, Scandinavian, German and Celtic (see content-a.mjs for the notation).

export const NORSE = {
  style: "last", adj: ["Old", "High", "Long"],
  streets: [
    "Strand|Way|Path|Thing Way|Hall Row|Ship Row|Wharf Row|Harbour Way|Walking Dead Lane|Street",
    "Thing Field|Meeting Green|Market Strand|Landing|Hall Green|Hythe|Boat Green|Beach Market|Troll Green|Green",
    "Farm Row|Thorp|Hall Quarter|Wick|Strand Quarter|Boat Yard|Harbour Ward|Shipyard|Troll Quarter|Quarter",
  ],
  inns: [
    "Mead Hall|Guest Hall|Ale Hall|Hostelry|Longhouse|Alehouse|Drinking Hall|Hall|Valhalla Hall|House",
    "Ale Hall|Beer Hall|Alehouse|Brewhouse|Drinking Hall|Ale Cellar|Tavern|Bar|Wild Hunt Tavern|Tavern",
    "Guest House|Traveller's Rest|Thing Stop|Ferry House|Landing Rest|Shieling Rest|Wayhouse|Rest|Troll Rest|Hostel",
  ],
  buildings: [
    "Hall|Ring Fort|Longhouse|Boat Shed|Hill Fort|Fortress|Palisade|Stockade|Troll Fort|Fort",
    "Temple|Stave Church|Shrine|Grove Shrine|Church|Chapel|Cloister|Parish Church|Troll Shrine|Shrine",
    "Thing Hall|Long Hall|Boathouse|Smithy|Market Hall|Warehouse|Guildhall|Town Hall|Troll Hall|Hall",
  ],
  monuments: [
    "Rune Stone|Picture Stone|Standing Stone|Ship Setting|Burial Mound|Boundary Stone|Memorial Stone|Rune Pillar|Troll Stone|Stone",
    "Cross Slab|Wayside Cross|Stone Cross|High Cross|Hog-backed Stone|Churchyard Cross|Preaching Cross|Memorial Cross|Troll Cross|Cross",
    "Burial Mound|Ship Grave|Memorial Stone|Cenotaph|Tablet|Statue|Plaque|War Memorial|Barrow Dead Mound|Mound",
  ],
  x: { streets: [["Thing {N1}", 7, 1], ["{founder:poss} {N0}", 8, 0]], inns: [["{owner:poss} {N0}", 12, 0], ["{town} {N1}", 8, 1]], buildings: [["{owner:poss} {N0}", 10, 0]], monuments: [["{owner:poss} {N0}", 10, 0], ["Rune Stone of {owner}", 8, 0]] },
};

export const SCANDINAVIAN = {
  style: "last", adj: ["Old", "High", "Long"],
  streets: [
    "Strand Road|Church Street|Market Street|Harbour Street|Lane|Shore Road|Street|Way|Gnome Lane|Road",
    "Market Square|Church Square|Trade Square|Town Square|Harbour Square|Station Square|Green|Rail Square|Troll Square|Square",
    "Old Town|Harbour Quarter|Church Quarter|Mill Quarter|Mine Town|Wharf Quarter|Railway Quarter|Housing Estate|Troll Quarter|Quarter",
  ],
  inns: [
    "Inn|Coaching Inn|Posting Inn|Hostelry|Gasthouse|Manor Inn|Road Inn|Hotel|Gnome Inn|House",
    "Tavern|Ale House|Beer Hall|Brewery Tap|Cellar|Tap Room|Pub|Bar|Mead Tavern|Alehouse",
    "Posting House|Ferry Inn|Stage Inn|Coaching Stop|Station Inn|Mountain Lodge|Roadside Inn|Hostel|Troll Lodge|Rest",
  ],
  buildings: [
    "Castle|Manor|Fortress|Gatehouse|Bastion|Ring Fort|Barracks|Coastal Battery|Troll Castle|Fort",
    "Stave Church|Church|Chapel|Cathedral|Monastery|Parish Church|Cloister|Free Church|Gnome Shrine|Shrine",
    "Town Hall|Market Hall|Boathouse|Turf House|Mill|Warehouse|Station|Boat Shed|Troll Hall|Hall",
  ],
  monuments: [
    "Rune Stone|Picture Stone|Standing Stone|Boundary Stone|Cairn|Milestone|Memorial Stone|Bauta Stone|Troll Stone|Stone",
    "Cross|Wayside Cross|Stone Cross|Churchyard Cross|Crucifix|Memorial Cross|Preaching Cross|Mountain Cross|Troll Cross|Pillar",
    "Memorial|Monument|Statue|Tablet|Plaque|Harbour Statue|Freedom Memorial|War Memorial|Gnome Statue|Obelisk",
  ],
  x: { streets: [["{N0} of {destination}", 4, 0], ["{founder:poss} {N0}", 8, 0]], inns: [["{owner:poss} {N0}", 10, 0], ["Hotel {town}", 5, 0]], buildings: [["{town} {N1}", 8, 1]], monuments: [["{town} {N2}", 8, 2]] },
};

export const GERMAN = {
  style: "last", adj: ["Old", "High", "Long"],
  streets: [
    "Alley|Market Street|Wall Street|Cathedral Close|Ring Road|Castle Street|Town Street|Main Street|Erlking Lane|Street",
    "Market|Town Square|Cathedral Square|Castle Square|Fountain Square|Town Hall Square|Station Square|Place|Kobold Square|Square",
    "Old Town|Cathedral Quarter|Guild Quarter|Salt Quarter|Castle Quarter|Mill Quarter|Spa Quarter|Housing Estate|Kobold Quarter|Quarter",
  ],
  inns: [
    "Guest House|Inn|Coaching Inn|Postal Inn|Hostelry|Hotel|Country Inn|Guest Inn|Erlking Inn|House",
    "Beer Hall|Wine Tavern|Brew House|Cellar Tavern|Beer Garden|Tavern|Wine Cellar|Pub|Wild Hunt Tavern|Bar",
    "Posting House|Ferry Inn|Pilgrims' Rest|Toll Inn|Coach Stage|Hostel|Station Hotel|Roadside Inn|Kobold Rest|Rest",
  ],
  buildings: [
    "Castle|Burg|Keep|Gatehouse|Town Gate|Fortress|Bastion|Barracks|Dwarf Castle|Tower",
    "Cathedral|Minster|Cloister|Abbey|Church|Parish Church|Chapel|Pilgrim Chapel|Kobold Shrine|Shrine",
    "Town Hall|Guildhall|Salt House|Tithe Barn|Market Hall|Weigh House|Spa House|Hall|Erlking Hall|Mill",
  ],
  monuments: [
    "Standing Stone|Boundary Stone|Cairn|Mile Stone|Border Stone|Memorial Stone|Heritage Stone|Dolmen|Giant's Stone|Stone",
    "Wayside Cross|Calvary|Stone Cross|Boundary Cross|Pilgrim Cross|Market Cross|Memorial Cross|Summit Cross|Kobold Cross|Cross",
    "Memorial|Emperor Statue|Hero Statue|Fountain Statue|Monument|Tablet|War Memorial|Plaque|Erlking Statue|Column",
  ],
  x: { streets: [["Salt {N0}", 5, 0], ["{N0} of the {trade}", 5, 0]], inns: [["the Golden {creature}", 8, 0], ["the Black {creature}", 8, 0], ["Golden {creature} {N0}", 6, 0]], buildings: [["Hawk Castle {N2}", 3, 2], ["{town} {N0}", 8, 0]], monuments: [["Emperor {N2}", 6, 2]] },
};

export const CELTIC = {
  style: "first", adj: ["Old", "Long", "Sacred"],
  streets: [
    "Way|Track|Ford Way|Hill Track|Sacred Way|Horse Way|Boar Track|Spring Path",
    "Meeting Place|Gathering Place|Fair Field|Holy Spring|Ford|Sacred Grove|Mound|Gathering Stone",
    "Hillfort|Fort Quarter|Grove|Camp|Ring Ditch|Hall Quarter|Spring Quarter|Boar Quarter",
  ],
  inns: [
    "Feast Hall|Guest House|Hall|Roundhouse|Meeting House|Ale Hall|Ford House|Hearth House",
    "Ale House|Mead Hall|Feast Hall|Brewhouse|Hearth Tavern|Drinking Hall|Spring Tavern|Boar Tavern",
    "Ford Rest|Guest House|Drovers' Rest|Spring Rest|Track Rest|Hearth Stop|Grove Rest|Horse Rest",
  ],
  buildings: [
    "Hillfort|Roundhouse|Ring Fort|Broch|Dun|Rath|Palisade|Gate Tower",
    "Sacred Grove|Holy Spring|Shrine|Temple Mound|Stone Circle|Sacred Pool|Spring Shrine|Mother Shrine",
    "Meeting Hall|Feast Hall|Forge|Roundhouse|Assembly Mound|Ford House|Hearth Hall|Hall",
  ],
  monuments: [
    "Standing Stone|Cairn|Burial Mound|Stone Circle|Cup Stone|Pillar Stone|Horse Stone|Boar Stone",
    "Carved Pillar|High Cross|Spring Pillar|Mother Pillar|Sacred Post|Horse Post|Boar Post|Grove Post",
    "Burial Mound|Hero Mound|Cairn|Stone Row|Chief's Grave|Memorial Stone|Spring Mound|Mother Mound",
  ],
  x: {},
};
