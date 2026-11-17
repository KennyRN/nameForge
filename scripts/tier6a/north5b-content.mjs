// Brief 6a, the urban modules: streets and districts, inns and taverns, buildings and landmarks, monuments and statues of the batch's cultures.
// Same layout as scripts/north5b/content-a.mjs: per module three lists of ten words (one per main kind), in the fixed order: three words of the ancient to
// medieval eras, three of the early modern to the steam age, two of the steam age to modern, one fantastic (the culture's own lore) and one for every era.
// Streets: streets, squares, districts. Inns: inn, tavern, wayhouse. Buildings: defence, faith, civic. Monuments: stone, cross, memorial.

export const SPANISH = {
  style: "first", adj: ["Old", "Royal", "Little"],
  streets: ["Street|Alley|Lane|Steps|Slope|Passage|Avenue|Boulevard|Moorish Alley|Way", "Square|Market Square|Plaza|Cloister|Fountain Square|Bullring Square|Promenade|Roundabout|Haunted Square|Green", "Quarter|Moorish Quarter|Jewish Quarter|Old Town|Barrio|Port Quarter|Suburb|Estate|Ghost Quarter|District"],
  inns: ["Inn|Hostelry|Posada|Wayside Inn|Muleteers' Inn|Coaching Inn|Parador|Hotel|Enchanted Inn|House", "Tavern|Wine Cellar|Taproom|Bodega|Cider House|Tapas Bar|Cafe|Bar|Moorish Tavern|Cellar", "Resting Place|Pilgrims' Hostel|Muleteers' Stop|Wayside Hut|Drovers' Rest|Hospice|Hostel|Service Station|Crossroads Haunt|Rest"],
  buildings: ["Castle|Alcazar|Watchtower|Fortress|Gate|Citadel|Barracks|Arsenal|Moorish Tower|Tower", "Church|Cathedral|Monastery|Hermitage|Convent|Chapel|Basilica|Shrine|Moorish Chapel|Hall", "Town Hall|Market Hall|Guildhall|Exchange|Hospital|Palace|University|Library|Council House|House"],
  monuments: ["Standing Stone|Border Stone|Moorish Pillar|Milestone|Boundary Cross|Cairn|Memorial Stone|Roadside Stone|Giant's Stone|Stone", "Roadside Cross|Holy Cross|Calvary|Wayside Cross|Churchyard Cross|Stone Cross|Memorial Cross|Summit Cross|Giant's Cross|Cross", "Memorial|Statue|Fountain|Column|Plaque|Obelisk|War Memorial|Monument|Ghost Memorial|Tablet"],
};
export const PORTUGUESE = {
  style: "first", adj: ["Old", "Royal", "Little"],
  streets: ["Street|Lane|Quay Walk|Steps|Passage|Slope|Avenue|Boulevard|Mermaid's Alley|Way", "Square|Market Square|Quay Square|Fountain Square|Tram Square|Cathedral Square|Promenade|Roundabout|Lost Fleet Square|Green", "Quarter|Fishermen's Quarter|Old Town|Port Quarter|Fado Quarter|Tile Quarter|Suburb|Estate|Drowned Quarter|District"],
  inns: ["Inn|Hostelry|Sailors' Inn|Wayside Inn|Pilgrims' Inn|Coaching Inn|Guest House|Hotel|Mermaid's Inn|House", "Tavern|Wine Cellar|Taproom|Port Lodge|Cider House|Fado House|Cafe|Bar|Lost Fleet Tavern|Cellar", "Resting Place|Pilgrims' Hostel|Fishermen's Stop|Wayside Hut|Drovers' Rest|Hospice|Hostel|Service Station|Crossroads Haunt|Rest"],
  buildings: ["Castle|Fortress|Watchtower|Tower|Sea Gate|Citadel|Barracks|Arsenal|Lantern Tower|Keep", "Church|Cathedral|Monastery|Hermitage|Convent|Chapel|Basilica|Shrine|Mermaid Chapel|Hall", "Town Hall|Customs House|Exchange|Hospital|Palace|Tile Works|Library|Council House|Market Hall|House"],
  monuments: ["Standing Stone|Border Stone|Pillar Stone|Milestone|Boundary Cross|Cairn|Memorial Stone|Quay Stone|Navigator's Stone|Stone", "Roadside Cross|Holy Cross|Calvary|Wayside Cross|Mariners' Cross|Stone Cross|Memorial Cross|Summit Cross|Drowned Sailors' Cross|Cross", "Memorial|Statue|Fountain|Column|Plaque|Obelisk|Mariners' Memorial|Monument|Ghost Ship Memorial|Tablet"],
};
export const FRENCH = {
  style: "first", adj: ["Old", "Royal", "Little"],
  streets: ["Street|Alley|Lane|Passage|Rampart Walk|Quay|Avenue|Boulevard|Fairy Alley|Way", "Square|Market Square|Cloister Square|Fountain Square|Cathedral Square|Bandstand Square|Promenade|Roundabout|Haunted Square|Green", "Quarter|Latin Quarter|Jewish Quarter|Old Town|Left Bank|Port Quarter|Suburb|Estate|Ghost Quarter|District"],
  inns: ["Inn|Hostelry|Relay House|Wayside Inn|Coaching Inn|Pilgrims' Inn|Auberge|Hotel|Enchanted Inn|House", "Tavern|Wine Cellar|Taproom|Cabaret|Cider House|Brasserie|Cafe|Bar|Fairy Tavern|Cellar", "Resting Place|Pilgrims' Hostel|Drovers' Stop|Wayside Hut|Relay Stage|Hospice|Hostel|Service Station|Crossroads Haunt|Rest"],
  buildings: ["Castle|Keep|Watchtower|Fortress|Gate|Citadel|Barracks|Arsenal|Dragon Tower|Tower", "Church|Cathedral|Abbey|Priory|Convent|Chapel|Basilica|Shrine|Fairy Chapel|Hall", "Town Hall|Market Hall|Guildhall|Exchange|Hospital|Palace|University|Library|Council House|House"],
  monuments: ["Standing Stone|Menhir|Dolmen|Milestone|Boundary Cross|Cairn|Memorial Stone|Roadside Stone|Giant's Stone|Stone", "Roadside Cross|Calvary|Wayside Cross|Churchyard Cross|Stone Cross|Market Cross|Memorial Cross|Summit Cross|Giant's Cross|Cross", "Memorial|Statue|Fountain|Column|Plaque|Obelisk|War Memorial|Monument|Ghost Memorial|Tablet"],
};
export const ITALIAN = {
  style: "first", adj: ["Old", "Great", "Little"],
  streets: ["Street|Alley|Lane|Steps|Via|Passage|Avenue|Boulevard|Witch's Alley|Way", "Square|Market Square|Loggia|Cloister|Fountain Square|Piazza of Towers|Promenade|Roundabout|Haunted Square|Green", "Quarter|Ghetto|Old Town|Hill Quarter|Wharf Quarter|Port Quarter|Suburb|Estate|Ghost Quarter|District"],
  inns: ["Inn|Hostelry|Osteria|Wayside Inn|Coaching Inn|Pilgrims' Inn|Locanda|Hotel|Enchanted Inn|House", "Tavern|Wine Cellar|Taproom|Enoteca|Wine Bar|Trattoria|Cafe|Bar|Witch's Tavern|Cellar", "Resting Place|Pilgrims' Hostel|Muleteers' Stop|Wayside Hut|Relay Stage|Hospice|Hostel|Service Station|Crossroads Haunt|Rest"],
  buildings: ["Fortress|Castle|Watchtower|Tower|Gate|Citadel|Barracks|Arsenal|Witch's Tower|Keep", "Church|Cathedral|Baptistery|Abbey|Convent|Chapel|Basilica|Shrine|Witch's Chapel|Hall", "Town Hall|Palace|Loggia|Exchange|Hospital|Guildhall|University|Library|Council House|House"],
  monuments: ["Standing Stone|Etruscan Pillar|Milestone|Boundary Stone|Boundary Cross|Cairn|Memorial Stone|Roadside Stone|Giant's Stone|Stone", "Roadside Shrine|Calvary|Wayside Cross|Churchyard Cross|Stone Cross|Column Cross|Memorial Cross|Summit Cross|Giant's Cross|Cross", "Memorial|Statue|Fountain|Column|Plaque|Obelisk|War Memorial|Monument|Ghost Memorial|Tablet"],
};
export const DUTCH = {
  style: "last", adj: ["Old", "High", "Long"],
  streets: ["Street|Alley|Lane|Dike Road|Quay|Canal Way|Avenue|Boulevard|Elf Alley|Way", "Square|Market Square|Dam Square|Church Square|Fish Market|Windmill Square|Promenade|Roundabout|Haunted Square|Green", "Quarter|Beguinage Quarter|Jewish Quarter|Old Town|Canal Quarter|Port Quarter|Suburb|Estate|Ghost Quarter|District"],
  inns: ["Inn|Hostelry|Wayhouse|Wayside Inn|Coaching Inn|Skippers' Inn|Herberg|Hotel|Elf Inn|House", "Tavern|Taproom|Brew House|Gin House|Beer Hall|Brown Cafe|Cafe|Bar|Water Spirit Tavern|Cellar", "Resting Place|Barge Stop|Drovers' Stop|Wayside Hut|Ferry Stage|Hospice|Hostel|Service Station|Crossroads Haunt|Rest"],
  buildings: ["Castle|Keep|Watchtower|Fortress|Gate|Dike House|Barracks|Arsenal|Drowned Tower|Tower", "Church|Cathedral|Abbey|Beguinage|Convent|Chapel|Hidden Church|Shrine|Elf Chapel|Hall", "Town Hall|Weigh House|Guildhall|Exchange|Hospital|Almshouse|University|Library|Council House|House"],
  monuments: ["Hunebed|Standing Stone|Dwelling Mound|Milestone|Boundary Stone|Cairn|Memorial Stone|Roadside Stone|Giant's Stone|Stone", "Roadside Cross|Calvary|Wayside Cross|Churchyard Cross|Stone Cross|Market Cross|Memorial Cross|Summit Cross|Giant's Cross|Cross", "Memorial|Statue|Fountain|Column|Plaque|Obelisk|War Memorial|Monument|Ghost Memorial|Tablet"],
};
export const ROMAN = {
  style: "first", adj: ["Old", "Great", "Little"],
  streets: ["Road|Alley|Lane|Steps|Via|Passage|Avenue|Boulevard|Shades' Alley|Way", "Forum|Market Square|Colonnade|Baths Square|Fountain Square|Circus Square|Promenade|Roundabout|Haunted Square|Green", "Quarter|Tenement Quarter|Forum District|Old Town|Hill Quarter|Port Quarter|Suburb|Estate|Ghost Quarter|District"],
  inns: ["Inn|Hostelry|Mansio|Wayside Inn|Posting House|Pilgrims' Inn|Caupona|Hotel|Haunted Inn|House", "Tavern|Wine Shop|Taproom|Thermopolium|Wine Bar|Trattoria|Cafe|Bar|Lamia's Tavern|Cellar", "Resting Place|Posting Station|Drovers' Stop|Wayside Hut|Relay Stage|Hospice|Hostel|Service Station|Crossroads Haunt|Rest"],
  buildings: ["Fort|Camp Gate|Watchtower|Tower|Gate|Citadel|Barracks|Arsenal|Shades' Tower|Keep", "Temple|Basilica|Martyrium|Shrine|Convent|Chapel|Catacomb|Cathedral|Lamia's Shrine|Hall", "Forum|Bath House|Amphitheatre|Exchange|Hospital|Palace|Curia|Library|Council House|House"],
  monuments: ["Milestone|Boundary Stone|Altar Stone|Tomb|Boundary Altar|Cairn|Memorial Stone|Roadside Stone|Giant's Stone|Stone", "Roadside Shrine|Calvary|Wayside Altar|Churchyard Cross|Stone Cross|Column Cross|Memorial Cross|Summit Cross|Giant's Altar|Altar", "Triumphal Arch|Statue|Fountain|Column|Plaque|Obelisk|War Memorial|Monument|Ghost Memorial|Tablet"],
};
export const SLAVIC = {
  style: "last", adj: ["Old", "High", "Long"],
  streets: ["Street|Alley|Lane|Wooden Road|Embankment|Boulevard|Avenue|Prospect|Witch's Alley|Way", "Square|Market Square|Church Square|Fair Square|Bell Square|Parade Square|Promenade|Roundabout|Haunted Square|Green", "Quarter|Kremlin Quarter|Jewish Quarter|Old Town|Settlement|Port Quarter|Suburb|Estate|Ghost Quarter|District"],
  inns: ["Inn|Hostelry|Wayhouse|Wayside Inn|Post Inn|Pilgrims' Inn|Posting House|Hotel|Witch's Inn|House", "Tavern|Mead Hall|Taproom|Kvass House|Beer Hall|Teahouse|Cafe|Bar|Spirit Tavern|Cellar", "Resting Place|Portage Stop|Drovers' Stop|Wayside Hut|Relay Stage|Hospice|Hostel|Service Station|Crossroads Haunt|Rest"],
  buildings: ["Stockade|Hillfort|Watchtower|Fortress|Gate|Kremlin|Barracks|Arsenal|Dragon Tower|Tower", "Wooden Church|Cathedral|Monastery|Hermitage|Convent|Chapel|Onion-domed Church|Shrine|Witch's Chapel|Hall", "Town Hall|Market Hall|Guildhall|Exchange|Hospital|Boyar's House|University|Library|Council House|House"],
  monuments: ["Idol Stone|Standing Stone|Burial Mound|Milestone|Boundary Stone|Cairn|Memorial Stone|Roadside Stone|Giant's Stone|Stone", "Roadside Cross|Calvary|Wayside Cross|Churchyard Cross|Stone Cross|Memorial Cross|Summit Cross|Grave Cross|Giant's Cross|Cross", "Memorial|Statue|Fountain|Column|Plaque|Obelisk|War Memorial|Monument|Ghost Memorial|Tablet"],
};
export const GREEK = {
  style: "first", adj: ["Old", "Great", "Little"],
  streets: ["Street|Alley|Lane|Sacred Way|Steps|Passage|Avenue|Boulevard|Nymph's Alley|Way", "Agora|Market Square|Colonnade|Fountain Square|Theatre Square|Gymnasium Square|Promenade|Roundabout|Haunted Square|Green", "Quarter|Acropolis Quarter|Foreigners' Quarter|Old Town|Hill Quarter|Port Quarter|Suburb|Estate|Ghost Quarter|District"],
  inns: ["Inn|Hostelry|Katagogion|Wayside Inn|Posting House|Pilgrims' Inn|Guest House|Hotel|Nymph's Inn|House", "Tavern|Wine Shop|Taproom|Kapeleion|Wine Bar|Taverna|Cafe|Bar|Satyr's Tavern|Cellar", "Resting Place|Pilgrims' Hostel|Muleteers' Stop|Wayside Hut|Relay Stage|Hospice|Hostel|Service Station|Crossroads Haunt|Rest"],
  buildings: ["Acropolis|Fort|Watchtower|Tower|Gate|Citadel|Barracks|Arsenal|Titan's Tower|Keep", "Temple|Sanctuary|Oracle|Altar House|Shrine|Chapel|Treasury|Church|Nymph's Shrine|Hall", "Council House|Stoa|Theatre|Exchange|Gymnasium|Palace|Prytaneion|Library|Assembly House|House"],
  monuments: ["Standing Stone|Herm|Hero's Tomb|Milestone|Boundary Stone|Cairn|Memorial Stone|Roadside Stone|Giant's Stone|Stone", "Roadside Shrine|Calvary|Wayside Altar|Churchyard Cross|Stone Cross|Column Cross|Memorial Cross|Summit Chapel|Giant's Altar|Altar", "Memorial|Statue|Fountain|Column|Plaque|Obelisk|War Memorial|Monument|Ghost Memorial|Tablet"],
};
export const BYZANTINE = {
  style: "first", adj: ["Old", "Great", "Little"],
  streets: ["Street|Lane|Imperial Way|Steps|Procession Way|Passage|Avenue|Boulevard|Phantom's Alley|Way", "Forum|Market Square|Colonnade|Cistern Square|Icon Square|Hippodrome Square|Promenade|Roundabout|Haunted Square|Green", "Quarter|Palace Quarter|Foreigners' Quarter|Monastery Quarter|Hill Quarter|Port Quarter|Suburb|Estate|Ghost Quarter|District"],
  inns: ["Inn|Hostelry|Pilgrims' House|Wayside Inn|Posting House|Pilgrims' Inn|Guest House|Hotel|Phantom's Inn|House", "Tavern|Wine Shop|Taproom|Monks' Cellar|Wine Bar|Cook Shop|Cafe|Bar|Revenant's Tavern|Cellar", "Resting Place|Pilgrims' Hostel|Muleteers' Stop|Wayside Hut|Relay Stage|Hospice|Hostel|Service Station|Crossroads Haunt|Rest"],
  buildings: ["Fortress|Citadel|Watchtower|Sea Wall|Golden Gate|Fort|Barracks|Arsenal|Revenant's Tower|Keep", "Great Church|Monastery|Lavra|Cave Church|Shrine|Chapel|Cathedral|Church|Saint's Shrine|Hall", "Palace|Hippodrome|Exchange|Hospital|Cistern|Guildhall|Academy|Library|Council House|House"],
  monuments: ["Standing Stone|Milestone|Saint's Tomb|Boundary Stone|Boundary Cross|Cairn|Memorial Stone|Roadside Stone|Giant's Stone|Stone", "Roadside Shrine|Icon Shrine|Wayside Cross|Churchyard Cross|Stone Cross|Column Cross|Memorial Cross|Summit Chapel|Giant's Cross|Cross", "Memorial|Statue|Fountain|Column|Plaque|Obelisk|War Memorial|Monument|Ghost Memorial|Tablet"],
};
// The mixes: 12 words and 4 shapes of their own (their halves' at half weight): the first of each module's lists, four words per kind.
export const IBERIAN = { ...SPANISH, mix: true };
export const GREEK_BYZANTINE = { ...GREEK, mix: true };
