// Second-tier tables brief 6b §5.1: settlement names of the batch's cultures, in English, as the world engine's cultures. A template is [pattern, weight, sizes]: sizes are letters
// h (hamlet), v (village), t (town), c (city), g (great city). A word list is a pipe-separated string; `name` and `saint` are filled from the people tables by the builder.
// Each culture names its settlements in its own way: Turkic "Khan of …", "Covered Market of …", the beys' fortresses; Mongol camps, cairns and relay stations; Arabic wells,
// markets and frontier forts; Persian gardens, caravanserais and the king's cities; Egyptian the river's nome towns, monasteries and Cairo's quarters; Ethiopian ambas and rock-hewn churches;
// Bantu kraals, great enclosures and mission stations; West African market towns, mud-brick mosques and forts.

import { FILLS } from "./fills.mjs";
const T = (p, w, s) => [p, w, s];
const adj = "Old|New|High|Low|Great|Little|Upper|Lower|East|West|North|South|Long|Broad";

export const CULTURES = {
  turkic: {
    label: "Turkic", guide: "Beys' fortresses, khans and caravanserais, covered markets and baths, mosque complexes; Anatolian villages and passes; steamers' harbours and republic squares.", fuse: 0.1, biome: "temperate", name: "turkic", saintFrom: "turkic",
    lists: { adj, tree: "Poplar|Plane|Walnut|Juniper|Apricot|Willow|Elm|Oak|Pine|Mulberry", animal: "Wolf|Horse|Falcon|Eagle|Stag|Camel|Bear|Ram|Hawk|Fox", hill: "Mountain|Hill|Pass|Peak|Ridge|Crag|Heights", water: "Spring|Stream|River|Lake|Ford|Fountain|Well", steppe: "Steppe|Plain|Pasture|Meadow|Highland Pasture|Summer Pasture", fort: "Fortress|Castle|Tower|Citadel|Frontier Fort|Keep", han: "Inn|Caravanserai|Khan|Khan|Rest House|Halt", bazaar: "Bazaar|Market|Covered Market|Exchange|Cloth Market", mosque: "Mosque|Lodge|Shrine|Dervish Lodge|School|Fountain", baths: "Baths|Bathhouse|Hot Spring|Spa", town: "Town|City|Borough|Settlement", craft: "Factory|Mill|Station|Dam|Mine|Harbour|Shipyard|Power Station", pasture: "Camp|Pasture|Fold|Summer Camp|Winter Quarters" },
    eras: [
      { id: "medieval", label: "Medieval", templates: [T("{name:pos} {fort}", 6, "hvtc"), T("{name:pos} {han}", 5, "vtc"), T("{adj} {hill}", 4, "hvt"), T("{hill} of {name}", 4, "hvt"), T("{bazaar} of {name}", 4, "vtc"), T("{water} of {name}", 4, "hvt"), T("{steppe} of {name}", 3, "hv"), T("{mosque} of {name}", 4, "vtc"), T("{pasture} of {name}", 3, "hv"), T("{baths} of {name}", 3, "vtc"), T("{tree} Village", 3, "hv"), T("Beylic of {name}", 3, "tcg"), T("{animal} {hill}", 3, "hvt"), T("Frontier of {name}", 3, "vt")] },
      { id: "modern", label: "Modern", templates: [T("{name:pos} {han}", 3, "vt"), T("{craft} of {name}", 5, "hvt"), T("Port of {name}", 4, "vtcg"), T("Station of {name}", 3, "vt"), T("New {town}", 3, "tcg"), T("{bazaar} of {name}", 3, "vtc"), T("Republic Square", 2, "tcg"), T("{water} of {name}", 3, "hvt"), T("{hill} Village", 3, "hv"), T("{mosque} of {name}", 3, "vtc"), T("{tree} Village", 3, "hv"), T("Harbour of {name}", 3, "vtcg"), T("{baths} of {name}", 2, "vtc")] },
    ],
  },
  mongol: {
    label: "Mongol", guide: "Camps and ordos, cairns on passes, relay stations, sacred mountains, monasteries; herders' wintering places; collective farms, railway towns and modern Mongolia.", fuse: 0.1, biome: "steppe", name: "mongol", saintFrom: "mongol",
    lists: { adj, tree: "Larch|Birch|Pine|Poplar|Willow|Elm|Saxaul|Juniper|Aspen|Cedar", animal: "Wolf|Horse|Eagle|Stag|Camel|Ram|Falcon|Yak|Marmot|Argali", hill: "Mountain|Hill|Pass|Peak|Ridge|Crag|Heights", water: "Spring|River|Lake|Stream|Ford|Well|Salt Lake", steppe: "Steppe|Plain|Pasture|Valley|Grassland|Desert Edge", camp: "Camp|Ger Camp|Royal Camp|Winter Quarters|Summer Pasture|Herding Camp", cairn: "Cairn|Shrine Cairn|Mound|Standing Stone|Memorial Stone", relay: "Relay Station|Post Station|Waystation|Rest Stop|Courier Post", monastery: "Monastery|Temple|Lamasery|Shrine|Stupa|Prayer Wall", town: "Town|City|Settlement|Camp|Market", craft: "Collective Farm|Mine|Railway Station|Factory|Power Station|Dairy|Mill|Airfield", mount: "Sacred Mountain|Holy Peak|Mountain|Blue Peak" },
    eras: [
      { id: "steppe", label: "Steppe", templates: [T("{name:pos} {camp}", 6, "hvt"), T("{cairn} of {name}", 4, "hv"), T("{relay} of {name}", 4, "vtc"), T("{adj} {hill}", 4, "hvt"), T("{hill} of {name}", 4, "hvt"), T("{water} of {name}", 4, "hvt"), T("{animal} {steppe}", 3, "hv"), T("{mount} of {name}", 3, "hvt"), T("{monastery} of {name}", 4, "vtc"), T("Royal Camp of {name}", 3, "tcg"), T("Great Assembly of {name}", 2, "tc"), T("{steppe} of {name}", 3, "hv"), T("{name:pos} Winter Quarters", 3, "hv")] },
      { id: "modern", label: "Modern", templates: [T("{craft} of {name}", 5, "hvt"), T("{name:pos} {camp}", 3, "hv"), T("Railway Station of {name}", 3, "vt"), T("New {town}", 3, "tcg"), T("{monastery} of {name}", 3, "vtc"), T("{water} of {name}", 3, "hvt"), T("{hill} of {name}", 3, "hvt"), T("{animal} {steppe}", 3, "hv"), T("{relay} of {name}", 2, "vt"), T("Border Post of {name}", 2, "vt"), T("People's Square", 2, "tcg"), T("{steppe} of {name}", 3, "hv")] },
    ],
  },
  arabic: {
    label: "Arabic", guide: "Wells and wadis, oases and palm groves, markets and mosques, forts and frontier forts, caravan stops; dhow harbours; garden quarters and round cities.", fuse: 0, biome: "desert", name: "arabic", saintFrom: "arabic",
    lists: { adj, tree: "Palm|Date Palm|Acacia|Tamarisk|Olive|Fig|Sidr|Cedar|Pomegranate|Carob", animal: "Camel|Falcon|Gazelle|Oryx|Horse|Lion|Eagle|Ibex|Hare|Jackal", well: "Well|Spring|Cistern|Water Hole|Fountain|Oasis Spring", wadi: "Wadi|Dry Valley|Gorge|Ravine|Riverbed|Pass", oasis: "Oasis|Palm Grove|Garden|Orchard|Date Grove|Fields", souk: "Market|Souk|Bazaar|Exchange|Cloth Market|Spice Market", mosque: "Mosque|School|Shrine|Tomb|Minaret|Fountain", fort: "Fort|Fortress|Castle|Citadel|Frontier Fort|Watchtower|Gate", stop: "Caravan Stop|Rest House|Inn|Halt|Camel Stop|Waystation", harbour: "Port|Harbour|Landing|Pearl Bank|Anchorage|Creek", dune: "Dune|Sand Sea|Rocky Hill|Salt Flat|Plateau|Mount", town: "Town|City|Quarter|Settlement|Camp", craft: "Refinery|Port|Factory|Station|Dam|Airport|Pipeline|Salt Works" },
    eras: [
      { id: "ancient", label: "Ancient", templates: [T("Well of {name}", 5, "hvt"), T("{oasis} of {name}", 5, "hvt"), T("{stop} of {name}", 4, "hvt"), T("{adj} {wadi}", 3, "hv"), T("{wadi} of {name}", 3, "hv"), T("{souk} of {name}", 3, "vtc"), T("{name:pos} {fort}", 4, "hvtc"), T("{dune} of {name}", 3, "hv"), T("Incense Stop of {name}", 3, "vt"), T("{well} of the {animal}", 3, "hv")] },
      { id: "medieval", label: "Medieval", templates: [T("{fort} of {name}", 6, "hvtc"), T("{souk} of {name}", 5, "vtc"), T("{well} of {name}", 5, "hvt"), T("{oasis} of {name}", 4, "hvt"), T("{mosque} of {name}", 4, "vtc"), T("{wadi} of {name}", 3, "hv"), T("{stop} of {name}", 3, "vt"), T("Garden of {name}", 3, "vtc"), T("{name:pos} Round City", 2, "tcg"), T("{harbour} of {name}", 3, "vtcg"), T("{adj} {well}", 3, "hv"), T("{animal} {wadi}", 2, "hv")] },
      { id: "modern", label: "Modern", templates: [T("{souk} of {name}", 4, "vtc"), T("{harbour} of {name}", 5, "vtcg"), T("{craft} of {name}", 4, "hvt"), T("{well} of {name}", 4, "hvt"), T("New {town}", 3, "tcg"), T("{oasis} of {name}", 3, "hvt"), T("{mosque} of {name}", 3, "vtc"), T("{fort} of {name}", 3, "hvtc"), T("Corniche of {name}", 2, "tcg"), T("{wadi} of {name}", 2, "hv"), T("{dune} of {name}", 2, "hv")] },
    ],
  },
  persian: {
    label: "Persian", guide: "Walled gardens and underground channels, caravanserais, fire temples of antiquity, the king's cities, bazaars and tiled domes; passes and salt deserts.", fuse: 0, biome: "temperate", name: "persian", saintFrom: "persian",
    lists: { adj, tree: "Plane|Cypress|Poplar|Pomegranate|Almond|Walnut|Mulberry|Rose|Pistachio|Apricot", animal: "Lion|Falcon|Horse|Gazelle|Wild Ass|Leopard|Eagle|Ram|Nightingale|Peacock", garden: "Garden|Orchard|Rose Garden|Walled Garden|Pavilion|Fountain Garden", channel: "Channel|Spring|Underground Channel|Stream|Well|Pool", caravanserai: "Caravanserai|Inn|Rest House|Waystation|Halt|Bridge", fire: "Fire Temple|Temple|Shrine|Hall|Sanctuary|Dome", bazaar: "Bazaar|Market|Covered Bazaar|Exchange|Carpet Market", pass: "Pass|Gate|Mountain|Hill|Ridge|Heights", salt: "Salt Desert|Salt Flat|Dry Lake|Desert Edge|Plateau|Oasis", city: "City|Town|Royal City|Capital|Fortress Town", craft: "Refinery|Factory|Station|Dam|Mine|Pipeline|Kiln|Tile Works", polo: "Polo Ground|Square|Racecourse|Meadow|Field" },
    eras: [
      { id: "ancient", label: "Ancient", templates: [T("City of {name}", 5, "tcg"), T("{fire} of {name}", 4, "vtc"), T("{garden} of {name}", 4, "hvt"), T("{caravanserai} of {name}", 4, "vtc"), T("{channel} of {name}", 4, "hvt"), T("Satrap's {city}", 3, "tc"), T("{pass} of {name}", 3, "hvt"), T("Satrap's Road Halt", 3, "vt"), T("{name:pos} Fortress", 4, "hvtc"), T("{adj} {pass}", 3, "hv")] },
      { id: "medieval", label: "Medieval", templates: [T("{garden} of {name}", 5, "hvtc"), T("{caravanserai} of {name}", 5, "vtc"), T("{bazaar} of {name}", 4, "vtc"), T("City of {name}", 4, "tcg"), T("{channel} of {name}", 4, "hvt"), T("{polo} of {name}", 3, "vtc"), T("{pass} of {name}", 3, "hvt"), T("{fire} of {name}", 2, "vt"), T("{name:pos} Fortress", 4, "hvtc"), T("{animal} {pass}", 3, "hvt"), T("{tree} Garden", 3, "hv")] },
      { id: "modern", label: "Modern", templates: [T("{bazaar} of {name}", 4, "vtc"), T("{garden} of {name}", 4, "hvtc"), T("{craft} of {name}", 4, "hvt"), T("New {city}", 3, "tcg"), T("{caravanserai} of {name}", 3, "vt"), T("{channel} of {name}", 3, "hvt"), T("{pass} of {name}", 3, "hvt"), T("Station of {name}", 3, "vt"), T("{tree} Garden", 3, "hv"), T("{salt} of {name}", 2, "hv"), T("Port of {name}", 3, "vtcg")] },
    ],
  },
};

for (const [id, c] of Object.entries(CULTURES)) { c.lists.tree = FILLS[id].trees; c.lists.animal = FILLS[id].beasts; }

/** Era ids and the lens eras each reads (lens.json `mappings.eras.world`, keyed "culture:era"). */
export const ERA_MAP = {
  turkic: { medieval: ["MD"], modern: ["EM", "ST", "MO"] },
  mongol: { steppe: ["AN", "MD"], modern: ["EM", "ST", "MO"] },
  arabic: { ancient: ["AN"], medieval: ["MD"], modern: ["EM", "ST", "MO"] },
  persian: { ancient: ["AN"], medieval: ["MD"], modern: ["EM", "ST", "MO"] },
};

/**
 * Egyptian, Ethiopian, Bantu and West African already are world cultures: each gains the eras it lacked (before Interstellar), so that the eras they have keep their names, and every
 * other culture that reads them is unchanged. `name` is filled from the people tables. Egyptian: Coptic and Mamluk (MD), Ottoman and khedival (EM, ST), modern Egypt (MO).
 */
export const NEW_ERAS = {
  egyptian: [
    { id: "coptic-and-mamluk", label: "Coptic and Mamluk", guide: "Monasteries and churches of the Copts, the quarters and gates of Mamluk Cairo, nilometers, canals and river towns.", name: "egyptian", map: ["MD"],
      lists: { river: "River Town|Landing|Ferry|Canal Head|Dyke|Harbour", monastery: "Monastery|Hermitage|Church|Desert Monastery|Cell|Shrine", gate: "Gate|Quarter|Citadel|Market|Mosque|Fountain", village: "Village|Hamlet|Settlement|Estate|Farm" },
      templates: [T("Monastery of {name}", 5, "hvt"), T("{river} of {name}", 5, "hvtc"), T("{gate} of {name}", 5, "vtc"), T("Church of {name}", 3, "hvt"), T("Canal of {name}", 3, "hv"), T("{name:pos} Landing", 4, "hvt"), T("Citadel of {name}", 3, "tcg"), T("{village} of the Delta", 3, "hv"), T("Market of {name}", 4, "vtc"), T("Flood Gauge of {name}", 2, "vt")] },
    { id: "ottoman-and-khedival", label: "Ottoman and khedival", guide: "Ottoman governors' towns, cotton ports, the khedive's boulevards and canals, railway halts.", name: "egyptian", map: ["EM", "ST"],
      lists: { port: "Port|Landing|Quay|Cotton Port|Harbour|Customs House", canal: "Canal|Barrage|Dyke|Lock|Pumping Station|Weir", boulevard: "Boulevard|Quarter|Square|Palace|Garden|Mosque", station: "Station|Halt|Junction|Siding|Depot|Terminus" },
      templates: [T("{port} of {name}", 5, "vtcg"), T("{canal} of {name}", 4, "hvt"), T("{boulevard} of {name}", 4, "vtc"), T("Station of {name}", 4, "vt"), T("{name:pos} Estate", 3, "hv"), T("Cotton Ginnery of {name}", 3, "hvt"), T("Governor's Town", 3, "tc"), T("New {port}", 3, "tcg"), T("Market of {name}", 3, "vtc"), T("{name:pos} Landing", 3, "hvt")] },
    { id: "modern-egypt", label: "Modern Egypt", guide: "River cities, new towns in the desert, canal towns, delta villages and the Red Sea coast.", name: "egyptian", map: ["MO"],
      lists: { delta: "Delta Village|Canal Town|Pump House|Reclaimed Land|Farm|Rice Field", city: "City|New City|Town|Suburb|District|Settlement", coast: "Resort|Port|Dive Camp|Fishing Harbour|Bay|Marina", dam: "Dam|Barrage|Power Station|Lock|Bridge|Canal Head" },
      templates: [T("{delta} of {name}", 4, "hvt"), T("New {city}", 4, "tcg"), T("{coast} of {name}", 4, "vtcg"), T("{dam} of {name}", 3, "vt"), T("{name:pos} Quarter", 4, "tc"), T("Market of {name}", 3, "vtc"), T("Station of {name}", 3, "vt"), T("Corniche of {name}", 3, "tcg"), T("Oasis of {name}", 3, "hv"), T("{city} of the Delta", 3, "tc")] },
  ],
  ethiopian: [
    { id: "modern-ethiopia", label: "Modern Ethiopia", guide: "Highland market towns, church villages, railway halts, lake towns and the new capital's districts.", name: "ethiopian", map: ["ST", "MO"],
      lists: { amba: "Amba|Flat Mountain|Rock|Highland|Escarpment|Crag", church: "Church|Rock Church|Monastery|Shrine|Cross|Baptismal Pool", trade: "Market|Market Town|Coffee Market|Trading Post|Fair|Bazaar", lake: "Lake|Hot Spring|River|Falls|Gorge|Wetland", station: "Station|Halt|Junction|Depot|Terminus|Dam" },
      templates: [T("{church} of {name}", 5, "hvt"), T("{amba} of {name}", 4, "hvt"), T("{trade} of {name}", 5, "vtc"), T("{lake} of {name}", 3, "hvt"), T("Station of {name}", 3, "vt"), T("{name:pos} {trade}", 3, "vtc"), T("New {trade}", 3, "tcg"), T("{amba} {church}", 3, "hv"), T("Coffee Village of {name}", 3, "hv"), T("{name:pos} Quarter", 3, "tc")] },
  ],
  bantu: [
    { id: "mission-and-colony", label: "Mission and colony", guide: "Mission stations, trading posts, compounds and the colonial town laid out on a grid.", name: "bantu", map: ["ST"],
      lists: { mission: "Mission|Mission Station|Church|School|Hospital|Chapel", post: "Trading Post|Store|Depot|Boma|Compound|Fort", kraal: "Kraal|Homestead|Village|Cattle Post|Enclosure|Place", river: "River|Drift|Ford|Falls|Spring|Pool" },
      templates: [T("{mission} of {name}", 5, "hvt"), T("{post} of {name}", 5, "vtc"), T("{kraal} of {name}", 4, "hv"), T("{river} of {name}", 3, "hvt"), T("New Town of {name}", 3, "tcg"), T("Compound of {name}", 3, "vt"), T("{name:pos} Drift", 3, "hv"), T("Railway Siding of {name}", 3, "vt"), T("Mine of {name}", 3, "vtc")] },
    { id: "modern-bantu", label: "Modern", guide: "Townships, mining towns, new cities, lake and river towns, and rural villages.", name: "bantu", map: ["MO"],
      lists: { township: "Township|Location|Suburb|Settlement|Ward|District", mine: "Mine|Shaft|Plant|Smelter|Quarry|Compound", city: "City|Town|Metropolis|Harbour|Market|Junction", lake: "Lake|River|Falls|Dam|Spring|Gorge" },
      templates: [T("{township} of {name}", 4, "hvtc"), T("{mine} of {name}", 4, "hvt"), T("New {city}", 4, "tcg"), T("{lake} of {name}", 3, "hvt"), T("{name:pos} Place", 3, "hv"), T("Market of {name}", 3, "vtc"), T("Junction of {name}", 3, "vt"), T("{city} of {name}", 3, "tcg"), T("Harbour of {name}", 3, "vtcg")] },
  ],
  "west-african": [
    { id: "colony-and-coast", label: "Colony and coast", guide: "Coastal forts and castles, trading factories, colonial towns, railway and river ports.", name: "west-african", map: ["EM", "ST"],
      lists: { fort: "Fort|Castle|Factory|Lodge|Stockade|Landing", port: "Port|Harbour|Roadstead|Landing|Beach|Quay", rail: "Railway Station|Halt|Siding|Junction|Terminus|Depot", river: "River Port|Ford|Creek|Landing|Falls|Lagoon" },
      templates: [T("{fort} of {name}", 5, "hvtc"), T("{port} of {name}", 5, "vtcg"), T("{rail} of {name}", 3, "vt"), T("{river} of {name}", 3, "hvt"), T("{name:pos} Market", 4, "vtc"), T("Colonial Town of {name}", 3, "tc"), T("Plantation of {name}", 3, "hv"), T("{name:pos} Beach", 3, "hvt"), T("Kola Market of {name}", 3, "vt")] },
    { id: "modern-west-africa", label: "Modern", guide: "Great market cities, lagoon and river towns, oil and port towns, mud-brick mosque towns and farming villages.", name: "west-african", map: ["MO"],
      lists: { trade: "Market|Market City|Trading Post|Fair|Bazaar|Junction", lagoon: "Lagoon|Creek|River|Falls|Dam|Spring", mosque: "Mosque|Mud Mosque|School|Shrine|Fountain|Compound", port: "Port|Harbour|Oil Terminal|Beach|Quay|Landing" },
      templates: [T("{trade} of {name}", 5, "vtc"), T("{port} of {name}", 4, "vtcg"), T("{mosque} of {name}", 4, "vtc"), T("{lagoon} of {name}", 3, "hvt"), T("New {trade}", 3, "tcg"), T("{name:pos} Quarter", 4, "tc"), T("Farming Village of {name}", 3, "hv"), T("Station of {name}", 3, "vt"), T("{name:pos} Compound", 3, "hvt")] },
  ],
};
