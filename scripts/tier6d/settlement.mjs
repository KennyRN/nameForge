// Second-tier tables brief 6d §5.1: settlement names of Aztec, Maya, Andean, Polynesian and American, in English, each in the culture's own habits and in every era it has.
// Aztec and Maya already are world cultures: they gain the eras they lack. Andean, Polynesian and American are new world cultures. A template is [pattern, weight, sizes]
// (h hamlet, v village, t town, c city, g great city). `name` comes from the people tables (natives only in the eras before the saints), `saint` from the holy lists.
const T = (p, w, s) => [p, w, s];
const common = {
  adj: "Old|New|High|Low|Great|Little|Upper|Lower|Long|Broad",
};

export const CULTURES = {
  andean: {
    label: "Andean", guide: "Terraces and the road system, waystations and the four quarters, llama and alpaca herds, highland lakes; mining towns and reductions under saints' names; the republics.", fuse: 0, biome: "highland", name: "andean", saintFrom: "andean",
    lists: { ...common, tree: "Quenua|Molle|Alder|Eucalyptus|Queñua|Willow|Cactus|Tara|Algarrobo|Pepper", animal: "Condor|Llama|Alpaca|Vicuña|Puma|Viscacha|Fox|Falcon|Guanaco|Hummingbird", terrace: "Terrace|Stair of Fields|Platform|Hanging Field|Stone Terrace|Irrigated Terrace", road: "Waystation|Resting Place|Crossing|Pass|Bridge|Storehouse|Road Station", quarter: "Quarter|Fourth|Province|District|Valley|Plateau", lake: "Lake|Lagoon|Spring|Pool|Reed Shore|High Water", peak: "Peak|Snow Mountain|Ridge|Summit|Saddle|Heights", herd: "Herd|Pasture|Corral|High Meadow|Fold|Grazing Ground", mine: "Silver Mine|Tin Mine|Copper Pit|Quarry|Smelter|Shaft", saintcity: "Reduction|Parish Town|Mission|Plaza|Chapel Town", plaza: "Plaza|Market Square|Fair|Avenue|Railway Yard" },
    eras: [
      { id: "inca", label: "Inca", natives: 12, templates: [T("{terrace} of {name}", 6, "hvt"), T("{road} of the {animal}", 4, "hvt"), T("{quarter} of the {animal}", 4, "tcg"), T("{name:pos} {herd}", 5, "hv"), T("{lake} of the {animal}", 4, "hvt"), T("{adj} {terrace}", 4, "hvt"), T("{peak} of {name}", 3, "hvt"), T("Royal {road}", 3, "vtc"), T("{terrace} of the {tree}", 3, "hv"), T("{name:pos} {quarter}", 3, "tc"), T("Bridge of the {animal}", 3, "hv"), T("Four Quarters", 2, "cg"), T("Storehouse of {name}", 3, "hvt"), T("{lake} {terrace}", 2, "hv"), T("{adj} {road}", 3, "hvt")] },
      { id: "viceroyalty", label: "Viceroyalty", templates: [T("Saint {saint} of the {peak}", 6, "vtc"), T("{saintcity} of Saint {saint}", 5, "vtc"), T("{mine} of {name}", 4, "vtc"), T("Saint {saint}", 6, "hvtcg"), T("{name:pos} {mine}", 3, "hvt"), T("{terrace} of Saint {saint}", 3, "hvt"), T("New {saintcity}", 3, "vtc"), T("{adj} {saintcity}", 3, "vt"), T("{saintcity} of the {animal}", 3, "vt"), T("Royal {mine}", 3, "tcg"), T("Our Lady of the {peak}", 4, "vtc"), T("{lake} of Saint {saint}", 3, "hvt"), T("Holy Cross {plaza}", 2, "tc"), T("{name:pos} {road}", 3, "hv")] },
      { id: "republic", label: "Republic", templates: [T("{mine} of {name}", 4, "hvt"), T("Railway {plaza}", 3, "vtc"), T("{adj} {plaza}", 3, "vtc"), T("Saint {saint}", 5, "hvtcg"), T("{peak} {plaza}", 3, "vtc"), T("Port of {name}", 4, "tcg"), T("Nitrate {mine}", 3, "hvt"), T("{terrace} of {name}", 3, "hvt"), T("New {quarter}", 3, "tcg"), T("Guano {road}", 2, "hv"), T("Independence {plaza}", 3, "vtc"), T("{name:pos} {herd}", 3, "hv")] },
      { id: "modern", label: "Modern", templates: [T("{adj} {plaza}", 4, "vtcg"), T("{peak} {plaza}", 4, "vtc"), T("Saint {saint}", 4, "hvtcg"), T("New {quarter}", 4, "tcg"), T("Highway {road}", 3, "hvt"), T("{mine} Camp", 3, "hvt"), T("{terrace} Heights", 3, "vtc"), T("Port of {name}", 3, "tcg"), T("Airport {plaza}", 2, "tc"), T("{lake} Resort", 2, "vt"), T("{name:pos} {plaza}", 3, "vtc"), T("Solar {quarter}", 2, "tc")] },
    ],
  },
  polynesian: {
    label: "Polynesian", guide: "Islands, lagoons and reefs; voyaging canoes and star paths; the marae and the meeting house; mission stations and port towns; the island states.", fuse: 0, biome: "tropical-islands", name: "polynesian", saintFrom: "polynesian",
    lists: { ...common, tree: "Coconut Palm|Breadfruit|Pandanus|Banyan|Hibiscus|Taro|Mangrove|Fern|Pine|Ironwood", animal: "Frigatebird|Turtle|Shark|Tern|Dolphin|Whale|Booby|Heron|Crab|Moray", reef: "Reef|Lagoon|Passage|Atoll|Shoal|Coral Ridge", bay: "Bay|Cove|Landing|Beach|Harbour|Anchorage", canoe: "Canoe Landing|Canoe House|Voyaging Shore|Launching Place|Star Path|Wayfinding Rock", marae: "Marae|Meeting House|Court|Plaza|Sacred Ground|Gathering Place", terrace: "Taro Terrace|Garden|Fishpond|Grove|Plantation|Oven Ground", peak: "Peak|Ridge|Crater|Cliff|Headland|Cone", island: "Island|Islet|Isle|Sandbar|Motu|Skerry", mission: "Mission|Chapel|School|Parsonage|Church", port: "Port|Wharf|Harbour|Cannery|Plantation|Customs Wharf" },
    eras: [
      { id: "voyaging", label: "Voyaging", templates: [T("{canoe} of {name}", 5, "hvt"), T("{reef} of the {animal}", 4, "hvt"), T("{name:pos} {bay}", 5, "hv"), T("{island} of the {animal}", 4, "hv"), T("{terrace} of {name}", 4, "hv"), T("{adj} {reef}", 3, "hvt"), T("{marae} of {name}", 4, "hvt"), T("Landing of the {animal}", 3, "hv"), T("{bay} of the {tree}", 3, "hv"), T("{peak} of {name}", 3, "hvt"), T("{adj} {island}", 3, "hv"), T("Star {canoe}", 2, "hv"), T("Great {marae} of {name}", 3, "tc")] },
      { id: "chiefdoms", label: "Chiefdoms", templates: [T("{marae} of {name}", 6, "hvtc"), T("{name:pos} {marae}", 5, "hvt"), T("{terrace} of {name}", 4, "hv"), T("{peak} of the {animal}", 3, "hvt"), T("Seat of {name}", 4, "vtc"), T("{adj} {marae}", 3, "vtc"), T("{bay} of {name}", 4, "hvt"), T("{reef} of {name}", 3, "hvt"), T("Great {marae}", 3, "tcg"), T("{island} of {name}", 3, "hvt"), T("{name:pos} {terrace}", 3, "hv"), T("Chief's {canoe}", 2, "hvt")] },
      { id: "mission", label: "Mission", templates: [T("{mission} of {name}", 5, "hvt"), T("{port} of {name}", 4, "vtcg"), T("{bay} {mission}", 4, "hvt"), T("Saint {saint} {mission}", 3, "hvt"), T("{adj} {port}", 3, "vtc"), T("{name:pos} {port}", 4, "vtc"), T("{reef} {mission}", 3, "hvt"), T("New {mission}", 3, "vt"), T("{peak} {mission}", 3, "hv"), T("{terrace} of {name}", 3, "hv"), T("Whaling {bay}", 3, "vt"), T("Trading {port}", 3, "tc")] },
      { id: "port-and-plantation", label: "Port and plantation", templates: [T("{port} of {name}", 5, "vtcg"), T("{adj} {port}", 4, "vtc"), T("{bay} {port}", 4, "vtc"), T("Sugar {port}", 3, "vt"), T("{name:pos} {port}", 4, "vtc"), T("Copra {bay}", 3, "hvt"), T("Phosphate {island}", 2, "hv"), T("{mission} {bay}", 3, "hvt"), T("Cannery {bay}", 3, "vt"), T("Government {port}", 3, "tc"), T("New {port}", 3, "tcg"), T("{peak} Station", 2, "hv")] },
      { id: "modern", label: "Modern", templates: [T("{adj} {port}", 4, "vtcg"), T("Airport {bay}", 3, "vt"), T("{bay} Resort", 4, "vtc"), T("{reef} Village", 3, "hv"), T("{name:pos} {bay}", 3, "vtc"), T("Harbour {port}", 3, "tcg"), T("New {port}", 3, "tcg"), T("{peak} Heights", 3, "vtc"), T("Fishing {bay}", 3, "hv"), T("{island} Town", 3, "vtc"), T("Lagoon {port}", 2, "tc")] },
    ],
  },
  american: {
    label: "American", guide: "Townships and counties, creeks, forks and bends; frontier forts and trading posts, homesteads and ranches; railroad towns, Main Street, diners and the interstate; and Canada's concession roads, portages and fur posts.", fuse: 0, biome: "temperate", name: "american", saintFrom: "american",
    lists: { ...common, tree: "Oak|Maple|Cottonwood|Pine|Aspen|Sycamore|Hickory|Cedar|Elm|Birch", animal: "Eagle|Bear|Beaver|Buffalo|Elk|Moose|Coyote|Heron|Turkey|Otter", creek: "Creek|Fork|Bend|Run|Branch|Landing|Falls|Crossing", fort: "Fort|Post|Station|Stockade|Trading Post|Blockhouse", farm: "Farm|Homestead|Ranch|Mill|Grange|Plantation|Claim", rail: "Junction|Depot|Siding|Crossing|Yard|Roundhouse", main: "Main Street|Courthouse Square|Center|Corners|Commons|Green", range: "Ridge|Bluff|Mesa|Butte|Prairie|Hollow|Notch", portage: "Portage|Concession|Rapids|Landing|Lock|Fur Post", highway: "Interchange|Exit|Strip|Truck Stop|Motel Row|Outlet" },
    eras: [
      { id: "colonies", label: "Colonies", templates: [T("{name:pos} {creek}", 6, "hvt"), T("{name:pos} Landing", 4, "hvt"), T("{name:pos} {fort}", 4, "hvt"), T("{adj} {main}", 3, "vtc"), T("{farm} of {name}", 4, "hv"), T("{creek} of the {animal}", 3, "hv"), T("New {name}", 4, "vtc"), T("{tree} {creek}", 3, "hv"), T("{adj} {portage}", 3, "hvt"), T("Plantation of {name}", 3, "hvt"), T("{name:pos} {main}", 3, "vtc"), T("Meeting House {range}", 2, "hv")] },
      { id: "frontier-and-steam", label: "Frontier and steam", templates: [T("{name:pos} {rail}", 5, "vtc"), T("{name:pos} {creek}", 5, "hvt"), T("{name:pos} {fort}", 4, "hvtc"), T("{tree} {creek}", 3, "hvt"), T("{range} {rail}", 3, "vt"), T("{adj} {main}", 4, "vtcg"), T("{name:pos} {farm}", 4, "hv"), T("New {name}", 3, "vtc"), T("{animal} {range}", 3, "hvt"), T("Gold {creek}", 3, "hvt"), T("{name:pos} {portage}", 3, "hvt"), T("Railroad {main}", 3, "vtc"), T("Cattle {rail}", 2, "hv")] },
      { id: "modern", label: "Modern", templates: [T("{adj} {main}", 5, "vtcg"), T("{name:pos} {highway}", 3, "vt"), T("{tree} {range}", 3, "hvt"), T("{creek} {main}", 3, "vtc"), T("{name:pos} {creek}", 3, "hvt"), T("North {main}", 3, "vtcg"), T("Lake {main}", 3, "vtc"), T("{animal} {highway}", 2, "vt"), T("New {name}", 3, "vtc"), T("{range} Heights", 3, "vtc"), T("{name:pos} {rail}", 3, "vt"), T("{adj} {portage}", 2, "hvt"), T("Suburb of {name}", 3, "tcg")] },
    ],
  },
};

export const ERA_MAP = {
  andean: { inca: ["AN", "MD"], viceroyalty: ["EM"], republic: ["ST"], modern: ["MO"] },
  polynesian: { voyaging: ["AN"], chiefdoms: ["MD"], mission: ["EM"], "port-and-plantation": ["ST"], modern: ["MO"] },
  american: { colonies: ["EM"], "frontier-and-steam": ["ST"], modern: ["MO"] },
};

/** Aztec and Maya already are world cultures: each gains the eras it lacks, before Interstellar. `name` is filled from the people tables (natives only before the saints). */
export const NEW_ERAS = {
  aztec: [
    { id: "early-valley", label: "Early Valley", guide: "Lake shores and reed beds, early towns of the valley, causeways and the first terraces.", name: "aztec", natives: 10, map: ["AN"],
      lists: { reed: "Reed Bed|Reeds|Marsh|Shore|Lake Shore|Spring", terrace: "Terrace|Garden|Raised Field|Field|Plot|Orchard", pyramid: "Pyramid|Mound|Temple Hill|Platform|Plaza|Stair", beast: "Eagle|Jaguar|Heron|Rabbit|Coyote|Hummingbird", causeway: "Causeway|Road|Dike|Canal|Ford|Landing" },
      templates: [T("{reed} of {name}", 5, "hvt"), T("{pyramid} of {name}", 4, "vtc"), T("{name:pos} {terrace}", 5, "hv"), T("{causeway} of the {beast}", 4, "hvt"), T("{adj} {reed}", 3, "hv"), T("{beast} {pyramid}", 3, "vtc"), T("{terrace} of the {beast}", 3, "hv"), T("Place of the {beast}", 3, "hvt"), T("{adj} {causeway}", 3, "hvt"), T("{name:pos} {pyramid}", 3, "vtc"), T("Lake of {name}", 2, "hv")] },
    { id: "republic", label: "Republic", guide: "Railway towns and haciendas, silver and henequen, plazas and the new republic's towns.", name: "aztec", natives: 10, map: ["ST"],
      lists: { rail: "Railway Station|Junction|Depot|Siding|Terminus|Roundhouse", hacienda: "Hacienda|Ranch|Mill|Sugar Mill|Estate|Farm", mine: "Silver Mine|Mine|Smelter|Quarry|Pit|Shaft", plaza: "Plaza|Market|Square|Fair|Avenue|Garden", saint: "James|Peter|Paul|Mary|Anne|Francis|Joseph|Michael|John" },
      templates: [T("{hacienda} of {name}", 5, "hvt"), T("{rail} of {name}", 4, "vt"), T("{mine} of {name}", 4, "hvt"), T("Saint {saint}", 5, "hvtcg"), T("{name:pos} {plaza}", 4, "vtc"), T("New {plaza}", 3, "vtc"), T("{adj} {rail}", 3, "vt"), T("Our Lady of the {mine}", 2, "vt"), T("{plaza} of the Republic", 3, "tcg"), T("Port of {name}", 3, "tcg"), T("{hacienda} of Saint {saint}", 3, "hvt")] },
    { id: "modern-mexico", label: "Modern Mexico", guide: "Colonias and ejidos, boulevards, bypasses and border towns; the modern capital's districts.", name: "aztec", natives: 10, map: ["MO"],
      lists: { colony: "Colony|Neighbourhood|District|Quarter|Settlement|Housing Estate", boulevard: "Boulevard|Avenue|Bypass|Interchange|Ring Road|Circuit", plaza: "Plaza|Market|Square|Station|Terminal|Gardens", border: "Border Crossing|Customs Post|Bridge|Gate|Checkpoint|Port of Entry" },
      templates: [T("{colony} of {name}", 4, "vtc"), T("{adj} {boulevard}", 3, "vtcg"), T("{name:pos} {plaza}", 4, "vtc"), T("Saint {saint}", 4, "hvtcg"), T("{adj} {plaza}", 4, "vtcg"), T("{border} of {name}", 3, "vt"), T("New {colony}", 3, "tcg"), T("{boulevard} {plaza}", 3, "tc"), T("{name:pos} {colony}", 3, "vtc"), T("North {colony}", 2, "tcg"), T("Industrial {colony}", 2, "tc")] },
  ],
  maya: [
    { id: "postclassic", label: "Postclassic", guide: "City-states of the north, cenotes and walled cities, ball courts, plazas and causeways, lords of each city.", name: "maya", natives: 6, map: ["MD"],
      lists: { cenote: "Cenote|Sinkhole|Well|Spring|Pool|Cave", court: "Ball Court|Plaza|Court|Square|Platform|Terrace", wall: "Wall|Walled City|Gate|Watchtower|Fort|Stockade", road: "White Road|Causeway|Road|Ford|Landing|Crossing", beast: "Jaguar|Macaw|Deer|Turkey|Toucan|Heron", milpa: "Milpa|Field|Clearing|Garden|Orchard|Plot" },
      templates: [T("{cenote} of {name}", 5, "hvt"), T("{court} of {name}", 4, "vtc"), T("{wall} of {name}", 3, "vtc"), T("{name:pos} {road}", 4, "hvt"), T("{cenote} of the {beast}", 4, "hvt"), T("{adj} {court}", 3, "vtc"), T("{milpa} of {name}", 4, "hv"), T("{beast} {cenote}", 3, "hvt"), T("{name:pos} {milpa}", 4, "hv"), T("{road} to {name}", 3, "hvt"), T("City of the {beast}", 3, "tcg"), T("Seat of {name}", 3, "tc")] },
    { id: "colonial-yucatan", label: "Colonial Yucatan", guide: "Highland and Yucatec towns under saints' names, haciendas and mission churches.", name: "maya", natives: 6, map: ["EM"],
      lists: { saint: "James|Peter|Paul|Mary|Anne|Francis|Joseph|Michael|John|Dominic", church: "Church|Chapel|Mission|Convent|Plaza|Parish Town", hacienda: "Hacienda|Ranch|Estate|Farm|Sugar Mill|Cattle Ranch", cenote: "Cenote|Well|Spring|Pool|Sinkhole|Cave" },
      templates: [T("Saint {saint} of {name}", 6, "hvtc"), T("{church} of {name}", 4, "vtc"), T("{hacienda} of {name}", 5, "hvt"), T("Saint {saint}", 6, "hvtcg"), T("{church} of the {cenote}", 3, "hvt"), T("New {church}", 3, "vt"), T("{name:pos} {hacienda}", 4, "hvt"), T("Our Lady of the {cenote}", 3, "vt"), T("{cenote} of Saint {saint}", 3, "hvt"), T("Holy Cross {church}", 2, "vtc"), T("{adj} {church}", 3, "vt")] },
    { id: "henequen-and-chicle", label: "Henequen and chicle", guide: "Henequen estates and chicle camps, railways and ports, new republic towns.", name: "maya", natives: 6, map: ["ST"],
      lists: { rail: "Railway Station|Junction|Depot|Siding|Halt|Terminus", estate: "Henequen Estate|Estate|Plantation|Hacienda|Press House|Camp", chicle: "Chicle Camp|Logging Camp|Mahogany Camp|Sawmill|Landing|Station", port: "Port|Wharf|Harbour|Pier|Landing|Customs House" },
      templates: [T("{estate} of {name}", 5, "hvt"), T("{rail} of {name}", 4, "vt"), T("{chicle} of {name}", 4, "hvt"), T("Saint {saint}", 4, "hvtcg"), T("{name:pos} {port}", 4, "vtcg"), T("New {estate}", 3, "hvt"), T("{adj} {rail}", 3, "vt"), T("{port} of {name}", 4, "tcg"), T("{chicle} of the {beast}", 2, "hv"), T("Saint {saint} {rail}", 2, "vt")] },
    { id: "modern-maya", label: "Modern Maya", guide: "Modern Guatemala and Yucatan: highland towns and lakes, coffee, resorts and the ruins' gateway towns.", name: "maya", natives: 6, map: ["MO"],
      lists: { lake: "Lake|Lagoon|Shore|Cove|Bay|Landing", coffee: "Coffee Farm|Plantation|Cooperative|Mill|Estate|Terrace", resort: "Resort|Beach|Marina|Strip|Gateway|Plaza", plaza: "Plaza|Market|Square|Terminal|Gardens|Avenue" },
      templates: [T("Saint {saint}", 5, "hvtcg"), T("{lake} of {name}", 3, "hvt"), T("{coffee} of {name}", 4, "hvt"), T("{adj} {plaza}", 4, "vtcg"), T("{name:pos} {plaza}", 4, "vtc"), T("{resort} of {name}", 3, "vtc"), T("New {plaza}", 3, "tcg"), T("{lake} {resort}", 3, "vtc"), T("{adj} {lake}", 3, "hvt"), T("{name:pos} {coffee}", 3, "hv"), T("Gateway to {name}", 2, "vt")] },
  ],
};

/** Lists every new era may use without defining them. */
export const ERA_DEFAULTS = {
  adj: "Old|New|High|Low|Great|Little|Upper|Lower",
  saint: "James|Peter|Paul|Mary|Anne|Francis|Joseph|Michael|John|Dominic",
  aztecBeast: "Eagle|Jaguar|Heron|Rabbit|Coyote|Hummingbird",
  mayaBeast: "Jaguar|Macaw|Deer|Turkey|Toucan|Heron",
};
/** Own saint lists for the new cultures (Christian saints, not the holy lists of the people tables). */
export const SAINTS = {
  andean: "Rose|Martin|Peter|Paul|James|Anne|Francis|Joseph|Michael|John|Mary|Toribius",
  polynesian: "John|Peter|Paul|Mary|Joseph|Michael|Francis|Anne|James|Matthew",
  american: "Mary|Joseph|Anne|Peter|Paul|John|Francis|Michael|Luke|Matthew",
};
