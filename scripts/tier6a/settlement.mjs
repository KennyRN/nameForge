// Second-tier tables brief 6a §5.1: settlement names of the batch's cultures, in English, as the world engine's cultures (as batch 5b did for the core).
// A template is [pattern, weight, sizes]: sizes are letters h (hamlet), v (village), t (town), c (city), g (great city). A word list is a pipe-separated
// string; `name` and `saint` are filled from the people tables by the builder (rule: personal names come from the people tables).
// Each culture names its settlements in its own way (§5.1): Spanish "New Town", "Saint Mary of the Sea", "Castle of the Count"; Portuguese "Holy Cross",
// "Good Haven"; Italian "Fortress of …", "Free Commune"; French "Saint …", "Newtown", "Bastide of …"; Dutch dikes, dams and polders; Greek cities of the gods,
// Byzantine fortresses and monasteries.

const T = (p, w, s) => [p, w, s];
const common = {
  adj: "Old|New|High|Low|Great|Little|Upper|Lower|East|West|North|South|Long|Broad",
  tree: "Oak|Ash|Elm|Chestnut|Alder|Willow|Walnut|Cypress|Olive|Poplar",
  animal: "Wolf|Stag|Hawk|Fox|Heron|Eagle|Boar|Hare|Bull|Swan",
};

export const CULTURES = {
  french: {
    label: "French", guide: "Saint towns, castles, bastides and new towns; abbeys and priories; mills and forges from the steam age.", fuse: 0, biome: "temperate", name: "french", saintFrom: "french",
    lists: { ...common, hill: "Mount|Hill|Height|Rock|Crag|Peak|Ridge", water: "Spring|Brook|Stream|River Bend|Ford|Weir|Rapids", field: "Field|Meadow|Vineyard|Orchard|Pasture|Clearing|Garden", castle: "Castle|Fort|Tower|Keep|Stronghold|Citadel", church: "Abbey|Priory|Chapel|Minster|Convent|Hospice", craft: "Mill|Forge|Tannery|Saltworks|Quarry|Kiln|Glassworks", town: "Town|Borough|Bastide|Village|Hamlet|Grange" },
    eras: [
      { id: "medieval", label: "Medieval", templates: [T("Saint {saint}", 8, "hvtc"), T("{church} of Saint {saint}", 5, "vtc"), T("{castle} of {name}", 6, "hvtc"), T("New Town", 4, "vtc"), T("Bastide of {name}", 4, "vt"), T("{adj} {hill}", 4, "hvt"), T("{field} of the {animal}", 3, "hv"), T("Bridge of {name}", 4, "vt"), T("Ford of the {tree}", 3, "hv"), T("{name:pos} {field}", 4, "hv"), T("Market of {name}", 3, "tc"), T("Mount Saint {saint}", 3, "hvt"), T("Wood of the {animal}", 2, "hv"), T("{hill} of {name}", 4, "hvt"), T("Royal Borough", 2, "tcg"), T("Walled Town of {name}", 3, "tcg"), T("Spring of Saint {saint}", 3, "hv"), T("Crossroads of {name}", 3, "hvt")] },
      { id: "modern", label: "Modern", templates: [T("Saint {saint}", 5, "hvtc"), T("Port of {name}", 5, "vtcg"), T("{craft} of {name}", 5, "hvt"), T("New {town}", 3, "vtc"), T("Station of {name}", 3, "vt"), T("Spa of Saint {saint}", 3, "tc"), T("Harbour of {name}", 4, "vtcg"), T("Bridge of {name}", 3, "vt"), T("Mount Saint {saint}", 2, "hvt"), T("Market of {name}", 3, "tc"), T("{adj} {hill}", 3, "hvt"), T("{castle} of {name}", 3, "tcg"), T("Royal {town}", 2, "tcg"), T("{name:pos} {craft}", 4, "hvt")] },
    ],
  },
  dutch: {
    label: "Dutch", guide: "Dikes, dams, polders and fens; havens and free towns; windmills and canals.", fuse: 0.2, biome: "temperate", name: "dutch", saintFrom: "dutch",
    lists: { ...common, dike: "Dike|Dam|Sluice|Lock|Embankment|Weir|Levee", fen: "Fen|Mere|Marsh|Peat Bog|Polder|Meadow|Reclaimed Land", haven: "Haven|Harbour|Quay|Landing|Wharf|Port", ridge: "Dune|Sand Ridge|Mound|Hummock|Dwelling Mound|Rise|Hook", church: "Church|Chapel|Abbey|Cloister|Hospital", mill: "Windmill|Watermill|Brewery|Ropewalk|Dyeworks|Brickworks|Cheese Market", town: "Town|Borough|City|Village|Hamlet|Farm" },
    eras: [
      { id: "medieval", label: "Medieval", templates: [T("{name:pos} {dike}", 6, "hv"), T("{animal} {dike}", 5, "vtc"), T("{dike} of {name}", 4, "hvt"), T("{adj} Polder", 4, "hv"), T("{name:pos} {haven}", 5, "vtc"), T("{tree} Wood", 3, "hv"), T("{church} {town}", 3, "vt"), T("{fen} of {name}", 4, "hv"), T("Mouth of the {animal}", 3, "vtc"), T("New {town}", 3, "tcg"), T("Free Town of {name}", 3, "tcg"), T("{name:pos} {ridge}", 4, "hv"), T("{adj} {ridge}", 3, "hv"), T("Bridge of {name}", 3, "vt"), T("Cloth Market of {name}", 2, "tc")] },
      { id: "modern", label: "Modern", templates: [T("{name:pos} {dike}", 4, "hv"), T("{animal} {dike}", 4, "vtc"), T("{name:pos} {haven}", 5, "vtcg"), T("{mill} of {name}", 4, "hvt"), T("{adj} Polder", 3, "hv"), T("New {town}", 3, "tcg"), T("{church} {town}", 3, "vt"), T("Canal {town}", 3, "vtc"), T("{name:pos} {ridge}", 3, "hv"), T("Station {town}", 3, "vtc"), T("Garden {town}", 3, "tc"), T("Bridge of {name}", 3, "vt")] },
    ],
  },
  italian: {
    label: "Italian", guide: "Fortresses, free communes, saints, squares and palaces; ports and hill towns; new towns.", fuse: 0, biome: "mediterranean", name: "italian", saintFrom: "italian",
    lists: { ...common, tower: "Tower|Fortress|Castle|Keep|Gate|Rampart", commune: "Commune|Free Town|Republic|League|Borough|Seigniory", hill: "Hill|Hilltop|Crag|Peak|Ridge|Height", square: "Square|Market Square|Loggia|Cloister|Fountain|Arcade", harbour: "Port|Harbour|Haven|Landing|Quay|Mole", church: "Cathedral|Abbey|Basilica|Chapel|Hermitage|Monastery", town: "Town|Borough|Village|Hamlet|Hill Town" },
    eras: [
      { id: "medieval", label: "Medieval", templates: [T("Fortress of {name}", 6, "hvtc"), T("Free Commune", 4, "tcg"), T("Saint {saint}", 7, "hvtc"), T("{name:pos} {tower}", 5, "hvt"), T("Port of {name}", 4, "vtcg"), T("{hill} of {name}", 4, "hvt"), T("Bridge of {name}", 3, "vt"), T("Square of {name}", 3, "tc"), T("Palace of {name}", 3, "vtc"), T("Fountain of Saint {saint}", 3, "hv"), T("New Town", 3, "vtc"), T("Great {tower}", 2, "tcg"), T("Fair {hill}", 3, "hvt"), T("{commune} of {name}", 3, "tcg"), T("{church} of Saint {saint}", 4, "vtc"), T("Cross of {name}", 2, "hv")] },
      { id: "modern", label: "Modern", templates: [T("Saint {saint}", 5, "hvtc"), T("Port of {name}", 5, "vtcg"), T("{name:pos} {square}", 3, "vtc"), T("{hill} of {name}", 3, "hvt"), T("New Town", 3, "vtcg"), T("Station of {name}", 3, "vt"), T("Fortress of {name}", 3, "hvtc"), T("Spa of Saint {saint}", 2, "tc"), T("Palace of {name}", 3, "tcg"), T("{harbour} of {name}", 4, "vtcg"), T("Quarter of {name}", 3, "tc")] },
    ],
  },
  spanish: {
    label: "Spanish", guide: "Saints of the sea and the bridge, castles of counts, new towns, royal towns, holy crosses and fair views.", fuse: 0, biome: "mediterranean", name: "spanish", saintFrom: "spanish",
    lists: { ...common, castle: "Castle|Fortress|Tower|Keep|Watchtower|Citadel|Stronghold", rank: "Count|Duke|Marquis|Lord|Knight|King|Queen|Bishop|Abbot", where: "Sea|Bridge|Fields|Hills|Orchard|Vineyard|Spring|Cross", hill: "Hill|Mount|Rock|Peak|Ridge|Height|Crag", water: "Spring|Fountain|Stream|River Bend|Ford|Weir|Well", land: "View|Pasture|Valley|Hill|Spring|Harbour|Wind", good: "Good|Fair|Fine|Pleasant|Rich|Green", town: "Town|Borough|Village|Hamlet|Farm" },
    eras: [
      { id: "medieval", label: "Medieval", templates: [T("Saint {saint}", 7, "hvtc"), T("Saint Mary of the {where}", 5, "vtc"), T("Castle of the {rank}", 6, "hvtc"), T("New Town", 4, "vtcg"), T("Royal Town", 3, "tcg"), T("Holy Cross", 3, "hvt"), T("{good} {land}", 5, "hvt"), T("{castle} of {name}", 5, "hvtc"), T("Bridge of {name}", 3, "vt"), T("{name:pos} {town}", 4, "hv"), T("Fountain of Saint {saint}", 3, "hv"), T("Valley of the {animal}", 3, "hv"), T("Watchtower of {name}", 3, "hv"), T("Hill of the {tree}", 3, "hvt"), T("{adj} {hill}", 3, "hvt"), T("Market of {name}", 3, "tc")] },
      { id: "modern", label: "Modern", templates: [T("Saint {saint}", 5, "hvtc"), T("Port of {name}", 5, "vtcg"), T("New Town", 4, "vtcg"), T("{good} {land}", 4, "hvt"), T("Station of {name}", 3, "vt"), T("Mine of {name}", 4, "hvt"), T("Saint Mary of the {where}", 3, "vtc"), T("Castle of the {rank}", 3, "hvtc"), T("Colony of {name}", 3, "vt"), T("{name:pos} {town}", 3, "hv"), T("Bridge of {name}", 3, "vt"), T("Royal Town", 2, "tcg")] },
    ],
  },
  portuguese: {
    label: "Portuguese", guide: "Holy crosses, good havens, saints, forts, quays, vineyards and salt pans; fishing villages and capes.", fuse: 0, biome: "mediterranean", name: "portuguese", saintFrom: "portuguese",
    lists: { ...common, harbour: "Port|Haven|Harbour|Landing|Quay|Bay|Cove", cape: "Cape|Point|Headland|Cliff|Rock|Beach", vine: "Vineyard|Orchard|Olive Grove|Cork Wood|Farm|Estate", fort: "Fort|Castle|Tower|Keep|Wall|Gate", fishing: "Fishing Village|Salt Pans|Fishery|Net Quay|Cannery|Whale Station", good: "Good|Fair|Holy|Great|Blessed|Pleasant", land: "Haven|Hope|Spring|Valley|Hill|Harbour|View", town: "Town|Borough|Village|Hamlet|Farm" },
    eras: [
      { id: "medieval", label: "Medieval", templates: [T("Holy Cross", 4, "hvt"), T("{good} {land}", 6, "hvtc"), T("Saint {saint}", 7, "hvtc"), T("{fort} of {name}", 5, "hvtc"), T("Bridge of {name}", 3, "vt"), T("Port of {name}", 4, "vtcg"), T("{name:pos} Quay", 4, "vtc"), T("Cape of Saint {saint}", 3, "hvt"), T("{vine} of {name}", 4, "hv"), T("Cork Oak Wood", 3, "hv"), T("Salt Pans of {name}", 3, "hv"), T("New Town", 3, "vtcg"), T("{fishing} of {name}", 3, "hvt"), T("{adj} {cape}", 3, "hvt"), T("Market of {name}", 3, "tc"), T("Royal Town", 2, "tcg")] },
      { id: "modern", label: "Modern", templates: [T("Saint {saint}", 5, "hvtc"), T("{good} {land}", 5, "hvtc"), T("Port of {name}", 5, "vtcg"), T("{fishing} of {name}", 4, "hvt"), T("{name:pos} Quay", 4, "vtc"), T("Station of {name}", 3, "vt"), T("Holy Cross", 3, "hvt"), T("New Town", 3, "vtcg"), T("Colony of {name}", 3, "vt"), T("{fort} of {name}", 3, "hvtc"), T("Cape of Saint {saint}", 2, "hvt")] },
    ],
  },
  greek: {
    label: "Greek", guide: "Cities and harbours of the gods, colonies, citadels, sacred groves and isles; saints' villages and ports in the modern world.", fuse: 0, biome: "mediterranean", name: "greek", saintFrom: "byzantine",
    lists: { ...common, god: "Zeus|Hera|Athena|Apollo|Artemis|Poseidon|Demeter|Hermes|Dionysus|Hephaestus", city: "City|Town|Colony|Citadel|Fortress|Settlement", harbour: "Harbour|Port|Haven|Landing|Quay|Anchorage", hill: "Hill|Peak|Crag|Height|Ridge|Hillfort", sacred: "Temple|Shrine|Sacred Grove|Oracle|Altar|Sanctuary", island: "Isle|Island|Cape|Headland|Strait|Bay", plain: "Plain|Vale|Valley|Meadow|Olive Grove|Vineyard" },
    eras: [
      { id: "classical", label: "Classical", templates: [T("City of {god}", 5, "tcg"), T("Harbour of {god}", 4, "vtc"), T("Sacred Grove of {god}", 3, "hv"), T("City of {name}", 5, "tcg"), T("New City", 3, "tcg"), T("Colony of {name}", 4, "vtc"), T("High City", 3, "tc"), T("{hill} of {god}", 3, "hvt"), T("Spring of {god}", 3, "hv"), T("{island} of the {animal}", 3, "hvt"), T("Market of {name}", 3, "vtc"), T("Gate of the {animal}", 2, "vt"), T("{sacred} of {god}", 4, "hvt"), T("Olive Grove of {name}", 3, "hv"), T("{name:pos} {harbour}", 3, "vtc"), T("White {hill}", 3, "hvt")] },
      { id: "modern", label: "Modern", templates: [T("Saint {saint}", 6, "hvtc"), T("New {city}", 4, "vtcg"), T("{name:pos} Port", 4, "vtcg"), T("Chapel of Saint {saint}", 4, "hvt"), T("Olive Grove of {name}", 3, "hv"), T("White Village", 3, "hv"), T("Harbour Town", 3, "vtc"), T("Mountain Village", 3, "hv"), T("Monastery of Saint {saint}", 3, "vt"), T("{island} of {name}", 3, "hvt"), T("Upper {city}", 3, "vtc"), T("Station Town", 2, "vt")] },
    ],
  },
  byzantine: {
    label: "Byzantine", guide: "Saints and holy places, fortresses and citadels, monasteries and great churches; ports and imperial towns.", fuse: 0, biome: "mediterranean", name: "byzantine", saintFrom: "byzantine",
    lists: { ...common, fortress: "Fortress|Citadel|Fort|Stronghold|Tower|Kastron|Watchtower", monastery: "Monastery|Hermitage|Convent|Cloister|Hermit Colony|Cell", church: "Great Church|Chapel|Basilica|Cathedral|Shrine|Holy Church", harbour: "Harbour|Port|Haven|Landing|Quay|Anchorage", hill: "Hill|Peak|Crag|Height|Ridge|Mount", imperial: "Imperial|Royal|Holy|Great|Fortified|Golden", town: "Town|City|Borough|Village|Hamlet|Farm" },
    eras: [
      { id: "byzantine", label: "Byzantine", templates: [T("Saint {saint}", 7, "hvtc"), T("{fortress} of {name}", 6, "hvtc"), T("Monastery of Saint {saint}", 5, "hvt"), T("{church} of Saint {saint}", 4, "vtc"), T("Port of {name}", 4, "vtcg"), T("{imperial} {town}", 4, "tcg"), T("{name:pos} {harbour}", 3, "vtc"), T("{hill} of Saint {saint}", 3, "hvt"), T("Bridge of {name}", 3, "vt"), T("{name:pos} {town}", 4, "hv"), T("Market of {name}", 3, "tc"), T("Holy Spring of {saint}", 3, "hv"), T("{adj} {hill}", 3, "hvt"), T("Citadel of {name}", 3, "tcg")] },
      { id: "modern", label: "Modern", templates: [T("Saint {saint}", 6, "hvtc"), T("{name:pos} Port", 4, "vtcg"), T("Monastery of Saint {saint}", 4, "hvt"), T("New {town}", 3, "vtcg"), T("{fortress} of {name}", 3, "hvtc"), T("Harbour Town", 3, "vtc"), T("Mountain Village", 3, "hv"), T("{church} of Saint {saint}", 3, "vtc"), T("Station Town", 2, "vt")] },
    ],
  },
};

/** Era ids and the lens eras each reads (lens.json `mappings.eras.world`, keyed "culture:era"). */
export const ERA_MAP = {
  french: { medieval: ["MD"], modern: ["EM", "ST", "MO"] },
  dutch: { medieval: ["MD"], modern: ["EM", "ST", "MO"] },
  italian: { medieval: ["MD"], modern: ["EM", "ST", "MO"] },
  spanish: { medieval: ["MD"], modern: ["EM", "ST", "MO"] },
  portuguese: { medieval: ["MD"], modern: ["EM", "ST", "MO"] },
  greek: { classical: ["AN"], modern: ["EM", "ST", "MO"] },
  byzantine: { byzantine: ["MD"], modern: ["EM", "ST", "MO"] },
  roman: { republic: ["AN"] },
  slavic: { tribal: ["AN"] },
};

/**
 * Roman and Slavic already are world cultures: each gains an era of its own (before Interstellar), so that the eras they have keep their names, and
 * every other culture that reads them is unchanged (brief 6a: 30 words and 10 shapes of their own). `name` is filled from the people tables.
 */
export const NEW_ERAS = {
  roman: [
    {
      id: "republic", label: "Republic", guide: "Camps, forums, colonies and posting stations of the Republic; roads, baths and villas.", name: "roman", map: ["AN"],
      lists: { road: "Road|Milestone|Crossing|Posting Station|Paved Way|Ford|Causeway", craft: "Baths|Brickworks|Quarry|Mill|Smithy|Pottery", rank: "Legate|Prefect|Consul|Tribune|Governor|Senator", city: "City|Town|Colony|Camp|Fort|Settlement" },
      templates: [T("Camp of {name}", 5, "hvt"), T("Forum of {name}", 4, "vtc"), T("Colony of {name}", 4, "tc"), T("{road} of {name}", 4, "hv"), T("Fort of the {rank}", 3, "hvt"), T("Veterans' Colony", 2, "tc"), T("Posting Station of {name}", 3, "hvt"), T("{craft} of {name}", 4, "hvt"), T("Market of {name}", 3, "vtc"), T("Villa of {name}", 4, "hv"), T("Bridge of {name}", 3, "vt"), T("Harbour of {name}", 3, "vtcg"), T("Walls of {name}", 3, "hvtc"), T("New {city}", 3, "tcg")],
    },
  ],
  slavic: [
    {
      id: "tribal", label: "Tribal", guide: "Stockades, hillforts and woodland clearings of the tribes; salt, iron and bees.", name: "slavic", map: ["AN"],
      lists: { wood: "Birch Wood|Pine Wood|Oak Grove|Clearing|Forest Edge|Swamp", fort: "Stockade|Palisade|Hillfort|Watchtower|Refuge|Enclosure", craft: "Pitch Works|Salt Works|Iron Works|Beehives|Smithy|Mill" },
      templates: [T("{name:pos} Stockade", 5, "hvt"), T("{fort} of {name}", 4, "hvtc"), T("{wood} of the {animal}", 3, "hv"), T("{craft} of {name}", 3, "hvt"), T("Clan of {name}", 3, "hvt"), T("Hillfort of the {animal}", 3, "hvt"), T("{adj} {fort}", 3, "hvt"), T("Ford of {name}", 3, "hv"), T("Market of {name}", 3, "vt"), T("Holy Grove of {name}", 2, "hv"), T("{name:pos} Clearing", 4, "hv"), T("Beehive Village", 2, "hv")],
    },
  ],
};
