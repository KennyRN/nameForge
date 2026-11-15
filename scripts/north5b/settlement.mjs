// Northern Europe tables brief, batch 5b (B1): settlement names of the core cultures, in English, as the world engine's cultures.
// A template is [pattern, weight, sizes]: sizes are letters h (hamlet), v (village), t (town), c (city), g (great city). A word list is a
// pipe-separated string; `name` and `holy` are filled from the people tables by make-north5b.mjs (rule 4: personal names come from the people tables).
// Region entries (regions) hold a few templates and the lists they use; they are drawn only when a region is chosen, at the region share.

const T = (p, w, s) => [p, w, s];
const ALL = "hvtcg";

const common = {
  adj: "Old|New|High|Low|Great|Little|Upper|Lower|East|West|North|South|Long|Broad",
  tree: "Oak|Ash|Elm|Birch|Alder|Willow|Hazel|Rowan|Yew|Thorn",
  animal: "Wolf|Stag|Hawk|Fox|Otter|Raven|Boar|Heron|Eagle|Hare",
};

/** Eight of each: one list per culture, the words each culture names its settlements with. */
export const CULTURES = {
  welsh: {
    label: "Welsh", guide: "Generic first: Church of the saint, Mouth of the stream, Head of the valley, Fort of the chief.", fuse: 0, biome: "temperate",
    lists: { ...common, river: "Black Water|White Water|Red Stream|Clear Stream|Cold Brook|Bright River|Swift Water|Deep Pool", valley: "Valley|Combe|Glen|Dale|Vale", hill: "Hill|Mount|Rock|Ridge|Cairn|Knoll", farm: "Farm|Homestead|Holding|Steading|Croft", spring: "Spring|Well|Pool|Fount", chapel: "Chapel|Church|Meeting House|Preaching House", mine: "Quarry|Slate Mine|Coal Pit|Ironworks|Mill", mead: "Meadow|Pasture|Field|Fold" },
    eras: [
      { id: "medieval", label: "Medieval", templates: [T("{saint}'s Church", 5, "hvt"), T("{name:pos} Fort", 5, "hvt"), T("{saint}'s Well", 3, "hv"), T("Church of {saint}", 9, "hvt"), T("Mouth of the {river}", 7, "vtc"), T("Bridge End", 4, "vt"), T("Head of the {valley}", 6, "hv"), T("Fort of {name}", 7, "hvtc"), T("Meadow of the {animal}", 5, "hv"), T("Hall of {name}", 4, "vt"), T("{farm} of {name}", 5, "hv"), T("Ford of the {tree}", 4, "hvt"), T("{adj} {hill}", 3, "hvt"), T("Market of {saint}", 3, "tcg"), T("Castle of {name}", 4, "tcg")] },
      { id: "modern", label: "Modern", templates: [T("{saint}'s Chapel", 5, "hvt"), T("{name:pos} Quarry", 4, "hv"), T("Chapel {mead}", 4, "hv"), T("Church of {saint}", 5, "hvt"), T("Mouth of the {river}", 5, "vtc"), T("{mine} of {name}", 5, "hvt"), T("{name:pos} Row", 3, "hv"), T("Head of the {valley}", 4, "hv"), T("New {mine} Town", 3, "tc"), T("Station {mead}", 3, "vt"), T("Harbour of {name}", 3, "vtcg"), T("Castle of {name}", 4, "tcg"), T("Bridge End", 3, "vt")] },
    ],
  },
  cornish: {
    label: "Cornish", guide: "Generic first: Farm of the chief, Church of the saint, Cove, Fort of the tree; mining towns from the steam age.", fuse: 0, biome: "temperate",
    lists: { ...common, cove: "Cove|Haven|Harbour|Creek|Strand|Bay|Port", hill: "Tor|Down|Hill|Ridge|Barrow|Beacon|Crag", farm: "Farm|Barton|Holding|Steading|Croft|Manor|Cottage", spring: "Spring|Well|Pool|Fount|Brook", mine: "Mine|Engine House|Stream Works|Smelter|Quarry|Shaft|Adit", moor: "Moor|Heath|Downs|Common|Marsh|Heathland" },
    eras: [
      { id: "medieval", label: "Medieval", templates: [T("{saint}'s Church", 5, "hvt"), T("{name:pos} Farm", 5, "hv"), T("{saint}'s Cove", 3, "hv"), T("Farm of {name}", 8, "hv"), T("Church of {saint}", 9, "hvt"), T("Fort of the {tree}", 5, "hv"), T("{cove} of {saint}", 6, "hvt"), T("Head of the {hill}", 4, "hv"), T("Mouth of the Stream", 3, "hv"), T("{spring} of {saint}", 5, "hv"), T("Market of {name}", 3, "tcg"), T("Castle of {name}", 4, "tcg"), T("{adj} {cove}", 3, "vtc"), T("Meeting of the {animal}", 2, "hv")] },
      { id: "modern", label: "Modern", templates: [T("{saint}'s Cove", 4, "hvt"), T("{name:pos} Mine", 5, "hvt"), T("Farm of {name}", 4, "hv"), T("Church of {saint}", 5, "hvt"), T("{mine} of {name}", 7, "hvt"), T("Mine {name:pos}", 4, "hvt"), T("{cove} of {saint}", 4, "hvt"), T("Harbour of {name}", 3, "vtc"), T("Terrace of {name}", 3, "vt"), T("{moor} of {name}", 3, "hv"), T("Castle of {name}", 3, "tcg"), T("Market of {name}", 3, "tcg")] },
    ],
  },
  scottish: {
    label: "Scottish", guide: "Mouth of the river, Church of the saint, Field of the tree, Fort Hill, Ford of the chief; Norse-derived farms in the north and isles.", fuse: 0, biome: "temperate",
    lists: { ...common, river: "Black Water|White Water|Red Burn|Clear Burn|Cold Water|Bright River|Swift Water|Deep Pool", hill: "Hill|Knowe|Law|Rig|Crag|Brae", kirk: "Church|Chapel|Kirk|Cell", farm: "Farm|Steading|Croft|Shieling|Toun", fort: "Fort|Dun|Stronghold|Tower", fuse: "Ness|Wick|Holm|Dale", harbour: "Harbour|Haven|Landing|Quay" },
    eras: [
      { id: "medieval", label: "Medieval", templates: [T("{saint}'s Kirk", 5, "hvt"), T("{name:pos} Ford", 5, "hvt"), T("Mouth of the {river}", 8, "vtc"), T("Church of {saint}", 8, "hvt"), T("Field of the {tree}", 5, "hv"), T("{fort} {hill}", 6, "hvt"), T("Ford of {name}", 6, "hvt"), T("{adj} {hill}", 3, "hvt"), T("{name:pos} {farm}", 5, "hv"), T("Burgh of {saint}", 4, "tcg"), T("Market of {name}", 4, "tc"), T("Castle of {name}", 4, "tcg"), T("Harbour of {saint}", 3, "vtc")] },
      { id: "modern", label: "Modern", templates: [T("{saint}'s Kirk", 4, "hvt"), T("{name:pos} Mill", 4, "hvt"), T("Mouth of the {river}", 5, "vtc"), T("Church of {saint}", 5, "hvt"), T("{name:pos} {farm}", 4, "hv"), T("Ford of {name}", 4, "hvt"), T("Mill of {name}", 4, "hvt"), T("{adj} {harbour}", 3, "vtc"), T("New {hill}", 3, "vt"), T("{name:pos} Row", 3, "vt"), T("Burgh of {saint}", 3, "tcg"), T("Castle of {name}", 3, "tcg")] },
    ],
    regions: {
      SBL: { templates: [T("{rA} Border", 6, "hvt"), T("Tower of {name}", 5, "hv"), T("{rA} Ford", 5, "hvt")], lists: { rA: "Raiders'|Reivers'|Drovers'|Watch|Peel|Border" } },
      SLO: { templates: [T("{rA} Burgh", 6, "vtc"), T("Mill of {name}", 5, "hvt"), T("{rA} Cross", 5, "vtc")], lists: { rA: "Market|Mercat|Weavers'|Merchants'|Royal|Cathedral" } },
      SHH: { templates: [T("{rA} Strath", 6, "hv"), T("Shieling of {name}", 5, "hv"), T("{rA} Glen", 5, "hv")], lists: { rA: "Cattle|Clan|Chieftain's|Hunters'|Eagle|Highland" } },
      NSI: { templates: [T("{rA} Voe", 6, "hv"), T("Croft of {name}", 5, "hv"), T("{rA} Wick", 5, "hvt")], lists: { rA: "Fishers'|Herring|Skerry|Island|Hall|Kelp" } },
    },
  },
  irish: {
    label: "Irish", guide: "Church of the saint, Fort of the chief, Ford of the stone, Plain of the beast, Hill of the chief; towns around old abbeys.", fuse: 0, biome: "temperate",
    lists: { ...common, hill: "Hill|Mound|Rock|Ridge|Knoll|Hillock|Height", ford: "Ford|Crossing|Bridge|Weir|Ferry|Causeway", beast: "Stag|Horse|Hound|Boar|Hare|Wolf|Salmon|Heron", mouth: "Mouth|Bend|Head|Meeting|Confluence|Estuary", bog: "Bog|Marsh|Fen|Wet Meadow|Mere|Peat|Moss" },
    eras: [
      { id: "medieval", label: "Medieval", templates: [T("{saint}'s Church", 5, "hvt"), T("{name:pos} Fort", 5, "hvtc"), T("Church of {saint}", 9, "hvt"), T("Fort of {name}", 7, "hvtc"), T("{ford} of the {tree}", 5, "hvt"), T("Plain of the {beast}", 5, "hv"), T("Hill of {name}", 5, "hvt"), T("Mouth of the {ford}", 3, "vt"), T("Holy Well of {saint}", 4, "hv"), T("Abbey of {saint}", 4, "tcg"), T("Market of {name}", 3, "tc"), T("Castle of {name}", 4, "tcg"), T("{adj} {bog}", 3, "hv")] },
      { id: "modern", label: "Modern", templates: [T("{saint}'s Church", 4, "hvt"), T("{name:pos} Quay", 4, "vtc"), T("Church of {saint}", 6, "hvt"), T("Fort of {name}", 3, "hvt"), T("{ford} of {name}", 4, "hvt"), T("Plain of the {beast}", 3, "hv"), T("Hill of {name}", 3, "hvt"), T("Quay of {name}", 4, "vtc"), T("{name:pos} Mall", 3, "tc"), T("New Market", 3, "tcg"), T("Abbey of {saint}", 4, "tcg"), T("Castle of {name}", 3, "tcg"), T("Chapel of {saint}", 3, "hvt")] },
    ],
  },
  scandinavian: {
    label: "Scandinavian", guide: "Farms and steadings as Norse, then market towns, church towns, mine towns, new towns, manors, harbour and railway towns.", fuse: 0.3, biome: "boreal",
    lists: { ...common, farm: "Farm|Homestead|Steading|Manor|Croft", land: "Bay|Sound|Ness|Dale|Fell|Island|Holm|Beck|Skerry|Strand|Haven", mine: "Mine|Smelter|Ironworks|Quarry|Mill", lake: "Lake|Water|Tarn|Pool", harbour: "Harbour|Haven|Quay|Landing|Wharf", church: "Church|Chapel|Minster|Cloister" },
    eras: [
      { id: "early-modern", label: "Early modern", templates: [T("{name:pos} {farm}", 8, "hv"), T("Market Town of {name}", 5, "tc"), T("{church} Town", 6, "vt"), T("{mine} Town", 5, "vtc"), T("New Town", 3, "tcg"), T("{name:pos} Manor", 5, "hvt"), T("{animal} {land}", 4, "hvt"), T("{adj} {land}", 4, "hvt"), T("{lake} Market", 3, "vt"), T("{harbour} of {name}", 4, "vtc"), T("Royal Town", 2, "tcg")] },
      { id: "modern", label: "Modern", templates: [T("{name:pos} {farm}", 4, "hv"), T("Market Town of {name}", 4, "tc"), T("{church} Town", 4, "vt"), T("{mine} Town", 4, "vtc"), T("New Town", 3, "tcg"), T("{harbour} Town", 5, "vtcg"), T("Railway Town", 4, "vtc"), T("{name:pos} Manor", 3, "hvt"), T("{adj} {land}", 3, "hvt"), T("{lake} Market", 3, "vt"), T("Station Town", 3, "vtc")] },
    ],
    regions: {
      DEN: { templates: [T("{rA} Heath", 6, "hv"), T("{rA} Sound", 5, "vt"), T("{name:pos} {rB}", 5, "hv")], lists: { rA: "Beech|Dune|Moor|Sand|Harbour|Island", rB: "Barrow|Beech Wood|Sound Farm|Dune|Dyke" } },
      NOR: { templates: [T("{rA} Fjord", 6, "hvt"), T("{name:pos} {rB}", 5, "hv"), T("{rA} Fell", 5, "hv")], lists: { rA: "Glacier|Waterfall|Steep|Fish|Salmon|Eagle", rB: "Steep Farm|Shieling|Fjord Farm|High Farm|Cliff Farm" } },
      SWE: { templates: [T("{rA} Lake", 6, "hvt"), T("{rA} Mines", 5, "vtc"), T("{name:pos} {rB}", 5, "hv")], lists: { rA: "Forest|Rock|Silver|Iron|Skerry|Esker", rB: "Forest Farm|Rock Farm|Mill|Lakeside Farm|Mine Farm" } },
      ICE: { templates: [T("{rA} Springs", 6, "hv"), T("{rA} Bay", 5, "hvt"), T("{name:pos} {rB}", 5, "hv")], lists: { rA: "Hot|Lava|Black Sand|Glacier|Geyser|Bird Cliff", rB: "Lava Farm|Hot Spring Farm|Bird Cliff|Sheep Farm|Fell Farm" } },
    },
  },
  german: {
    label: "German", guide: "The chief's village, the chief's houses, the chief's home, the castle of the chief, free towns, market towns, new towns, marks and fields.", fuse: 0, biome: "temperate",
    lists: { ...common, brook: "Brook|Stream|Beck|Water|Spring|Rill|Ford", field: "Field|Meadow|Clearing|Assart|Acre|Green|Pasture", mark: "Mark|Border|March|Boundary|Frontier|Edge", free: "Free|Imperial|Hanse|Cathedral|Market|Royal|Merchant", wood: "Forest|Wood|Grove|Heath|Moor|Thicket|Glade" },
    eras: [
      { id: "medieval", label: "Medieval", templates: [T("{name:pos} Village", 8, "hv"), T("{name:pos} Houses", 6, "hv"), T("{name:pos} Home", 6, "hvt"), T("Castle of {name}", 6, "vtc"), T("{brook} Town", 5, "vt"), T("{tree} {field}", 4, "hv"), T("{mark} of {name}", 3, "hv"), T("{free} Town", 5, "tcg"), T("Market Town of {name}", 4, "tc"), T("New Town", 3, "tcg"), T("Cloister of {saint}", 3, "vt")] },
      { id: "modern", label: "Modern", templates: [T("{name:pos} Village", 5, "hv"), T("{name:pos} Houses", 4, "hv"), T("{name:pos} Home", 4, "hvt"), T("Castle of {name}", 3, "vtc"), T("{free} Town", 4, "tcg"), T("{wood} Town", 3, "vt"), T("Spa Town", 3, "tc"), T("Station Town", 4, "vtc"), T("New Town", 4, "tcg"), T("{brook} Town", 4, "vt"), T("Harbour Town", 3, "vtc")] },
    ],
    regions: {
      NDT: { templates: [T("Dyke Village of {name}", 6, "hv"), T("{rA} Town", 5, "vtc"), T("{rB} Houses", 5, "hv")], lists: { rA: "Brick|Hanse|Harbour|Dyke|Marsh|Island", rB: "Dyke|Marsh|Heath|Peat|Sea|Polder" } },
      RHN: { templates: [T("{rA} Town", 6, "vtc"), T("{rB} Village", 5, "hv"), T("Castle of {name}", 4, "vtc")], lists: { rA: "Wine|Roman|Cathedral|River|Cellar|Crag", rB: "Vineyard|Gorge|Crag|Ferry|Terrace|Cellar" } },
      MIT: { templates: [T("{rA} Town", 6, "vtc"), T("{rB} Village", 5, "hv"), T("{rA} Clearing", 4, "hv")], lists: { rA: "Salt|Mine|Spring|Charcoal|Ridge|Smelter", rB: "Mine|Spring|Forest|Hammer|Glass|Ridge" } },
      ALP: { templates: [T("Alp Village of {name}", 6, "hv"), T("{rA} Village", 5, "hv"), T("{rB} Town", 4, "vt")], lists: { rA: "Pasture|Avalanche|Pass|Glacier|Gorge|Lake", rB: "Pass|Lake|Pasture|Spa|Salt|Mountain" } },
      OST: { templates: [T("{rA} Lake Village", 6, "hv"), T("{rB} Houses", 5, "hv"), T("{rA} Sand", 4, "hv")], lists: { rA: "Pine|Sand|Lake|Marsh|Fish|Amber", rB: "Pine|Sand|Lake|Marsh|Fisher|Heath" } },
    },
  },
};

/** The world cultures that already exist and gain regions (Norse reads the Scandinavian regions). */
export const NORSE_REGIONS = CULTURES.scandinavian.regions;
export const INTERSTELLAR_TEMPLATES = [T("{name:pos} {farm2}", 7, "hvtcg"), T("{adj} {@land}", 5, "hvtcg"), T("{animal} {@land}", 4, "hv"), T("{animal}+{@land}", 2, "hv"), T("The {@land:pl}", 1, "vt"), T("{name:pos} {@region}", 1, "vt")];
export const INTERSTELLAR_LIST_FARM2 = "Steading|Homestead|Hold|Habitat|Station";
