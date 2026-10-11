# Vocabulary pools

Every pool in `src/data/settlement-vocab.json`: what it holds, the tags its entries use and the modules that read it. Modules read pools through `src/settlement/vocab.ts`, so a vocabulary pack (a `type: vocabulary` note, route names brief §3.3) extends every module that reads the pool. Each brief that adds a pool or a reader adds a row or a module here.

## Entry keys

| Key | Meaning | Default |
|---|---|---|
| `w` | the word as it appears in a name | required |
| `x` | weight | 1 |
| `t` | tone tags: grand, plain, grim, light, strange | none |
| `e` | era codes: AN, MD, EM, ST, MO, NF, IS | all eras |
| `c` | culture keys, the groups `british` and `christian`, or `!key` to exclude | all cultures |
| `h` | true: fantastic only; false: realistic only | both |
| `pl` | plural, where `pluralOf` would be wrong | – |
| `r` | region codes (COR … NSI) where the entry is used; read for the British cultures only | all regions |
| `rx` | region multipliers for the British cultures, e.g. `{"NTH": 3}` | ×1 |
| `rt` | a route region tag (route names §4.4), on fixed whole route names | – |
| `th` | themes: rural, urban, maritime, road, magical; the inn and building settings multiply them (other modules ignore them); pack lines add them as ` [maritime]` | none |
| `fn` | the district functions a fixed district name serves (`any`: every function) | – |

Vocabulary pack headings can narrow by culture, era and region in any order: `## alleyDialect · SLO`.

A pool's `cultureExtra` adds words for one culture at ×3 (a word already in the pool is tripled).

**Groups.** `british`: anglo-saxon, celtic, norman-british. `christian`: anglo-saxon, celtic, norman-british, slavic, and greek-byzantine and roman from the medieval era on.

## Pools

| Pool | Holds | Tags used | Read by |
|---|---|---|---|
| `direction` | compass points for "‹direction› Road" (diagonals ×0.2) | x | route names, streets and districts, buildings and landmarks |
| `directionAdj` | Northern, Southern, Eastern, Western | – | route names, streets and districts, inns and taverns, buildings and landmarks |
| `travellers` | plural travellers for "‹travellers›' Way" | x, t, c, e | route names, streets and districts, inns and taverns |
| `routeFeature` | earthworks and markers for "‹feature› Way" | x | route names |
| `routeMaterial` | road surfaces for "‹material› Street" | x, e | route names |
| `routeLandform` | country a road crosses, for "‹landform› Way" | c | route names |
| `routeGoods` | goods carried on a route ("Salt Way", "Amber Road"), with each culture's extra goods | x, e, cultureExtra | route names, streets and districts |
| `holySite` | a holy destination, read as "the ‹site›" | x, c | route names, streets and districts, inns and taverns, buildings and landmarks |
| `holySitePl` | plural holy sites for "Road of the ‹number› ‹sites›" | c | route names |
| `dayNumber` | day counts for "‹n› Days Road" | – | route names |
| `jFeature` | Japanese road features ("Western Mountain Road") | x, c | route names |
| `romanRoadNomen` | Roman family adjectives for "‹nomen› Way" | c | route names, buildings and landmarks |
| `spaceGoods` | cargoes for "‹goods› Run" | x | route names |
| `skyPath` | Polynesian sky and sea signs for "‹sign› Path" | c | route names |
| `routeFixed:road` | whole road names | x, e, c, rt | route names |
| `routeFixed:trade` | whole trade-route names | x, e, c | route names |
| `routeFixed:pilgrim` | whole pilgrim and holy road names (never for Polynesian or Andean) | t, e, c, rt | route names |
| `routeFixed:military` | whole military road names | e, c, rt | route names |
| `routeFixed:drove` | whole drove and track names | t, e, c, rt | route names |
| `routeFixed:sea` | whole sea-route names | t, e, c | route names |
| `routeFixed:rail` | whole railway and canal names (none built in) | – | route names |
| `routeFixed:motor` | whole modern road names (none built in) | – | route names |
| `routeFixed:space` | whole space-lane names ("The Long Haul") | t | route names |
| `compWater` | water components: Well, Spring, Fountain | x, e, c | streets and districts, inns and taverns, buildings and landmarks |
| `compCrossing` | crossings: Bridge, Ford, Ferry | x, t, e | streets and districts, inns and taverns, buildings and landmarks |
| `compMill` | mills and works: Mill, Kiln, Foundry | x, e | streets and districts, inns and taverns, buildings and landmarks |
| `compStorage` | storage: Granary, Barn, Warehouse | c, e | streets and districts, inns and taverns, buildings and landmarks |
| `compMarket` | trade buildings: Market, Cross, Exchange | x, c, e | streets and districts, inns and taverns, buildings and landmarks |
| `compDefence` | defences: Gate, Wall, Castle | x, e | streets and districts, inns and taverns, buildings and landmarks |
| `compFaith` | faith buildings (christian words for christian cultures only) | x, c | streets and districts, inns and taverns, buildings and landmarks |
| `compRule` | government: Court, Mint, Moot Hill | c, e | streets and districts, inns and taverns, buildings and landmarks |
| `compWaterside` | waterside: Dock, Quay, Staithe | e, r | streets and districts, inns and taverns, buildings and landmarks |
| `compTravel` | travel: Inn, Post House, Station | x, c, e | streets and districts, inns and taverns, buildings and landmarks |
| `compLearning` | learning: Library, School, Museum | e | streets and districts, inns and taverns, buildings and landmarks |
| `compDeath` | burial and execution places | t, e | streets and districts, inns and taverns, buildings and landmarks |
| `compPublic` | public spaces: Green, Gardens, Park | x, c, e | streets and districts, inns and taverns, buildings and landmarks |
| `compSteampunk` | steampunk components (fantastic, steam age) | e, h | streets and districts, inns and taverns, buildings and landmarks |
| `compSciFi` | sci-fi components: Hub, Spoke, Airlock | t, e | streets and districts, inns and taverns, buildings and landmarks |
| `streetWord` | street words: Street, Lane, Row, Gate | x, e, c, rx | streets and districts |
| `alleyWord` | alley words: Alley, Court, Yard | x | streets and districts |
| `planned` | planned-street words: Terrace, Crescent, Grove | x, e | streets and districts |
| `alleyDialect` | British regional alley words: Wynd, Chare, Twitten | r | streets and districts |
| `mainStreet` | whole main-street names: High Street, Middle Street | x, c, e, r | streets and districts |
| `streetTrades` | plural trades: Butchers, Weavers (singular drops the -s) | x, c, e, h | streets and districts, inns and taverns, buildings and landmarks |
| `streetGoods` | goods for streets and markets: Corn, Silver (plus routeGoods' culture extras ×2) | x, e | streets and districts, inns and taverns, buildings and landmarks |
| `streetFigure` | figures for King's Street, Bishop's Lane | x, c, e | streets and districts, inns and taverns, buildings and landmarks |
| `streetTree` | trees for planned streets: Laburnum Grove | e | streets and districts |
| `commemorative` | commemorative words: Jubilee, Victory, Station | x, t, e | streets and districts |
| `streetSteampunk` | whole steampunk street names: Lamplight Row | t, e, h | streets and districts |
| `streetFixed` | whole street names: Back Lane, Shambles | x, t, e, c | streets and districts |
| `squareWord` | square words: Square, Place, Green | x, c, e | streets and districts |
| `marketWord` | market words: Market, Exchange, Hall | x, c | streets and districts |
| `squareFixed` | whole square and market names: Market Square, Caravan Court | x, c, e, h | streets and districts |
| `districtWord` | district words: Quarter, Ward, End | x, t, e, c | streets and districts |
| `districtFixed` | whole district names: Old Town, Castle Town | x, t, e, c, fn | streets and districts |
| `innCreature` | creatures added to GN beast, bird, fish and heraldicBeast for inn signs | t, th | inns and taverns |
| `innPerson` | sign people: the Jester, the Goose Girl | x, t, c, h, th | inns and taverns |
| `innItem` | items added to GN emblem items for inn signs | e, h, th | inns and taverns |
| `innDescription` | sign adjectives: Black, Jolly, Prancing | x, t | inns and taverns |
| `innNumber` | sign numbers: Two ×5 … Nine | x | inns and taverns |
| `innFeature` | creature parts: Head, Antlers | x | inns and taverns |
| `innHome` | creature homes: Den, Nest | – | inns and taverns |
| `innWorn` | "in Armour", "in Boots" | – | inns and taverns |
| `innLocation` | sign locations: the Old Bridge (plus SD components ×0.3) | t, th | inns and taverns |
| `innFable` | whole signs: Fox and Grapes, Rose and Crown | t, e, c, rx, th | inns and taverns |
| `houseWord:inn` | house words for inns: Inn, Hostelry, Guest Hall | x, e, c, r | inns and taverns |
| `houseWord:tavern` | house words for taverns: Tavern, Alehouse, Mead Hall | x, e, c, r | inns and taverns |
| `houseWord:eating` | house words for eating houses: Cookshop, Tea House, Café | e, c | inns and taverns |
| `houseWord:wayhouse` | house words for way stations: Post House, Caravan Court | e, c | inns and taverns |
| `houseWord:rest` | house words for rest houses: Rest House, Hostel, Hospice | e, c | inns and taverns |
| `houseWord:club` | house words for clubs and hotels: Club, Music Hall | x, e, c | inns and taverns |
| `houseWord:bar` | house words for bars: Bar, Lounge, Canteen | x, e, c | inns and taverns |
| `auspicious` | Chinese and Korean auspicious phrases: Lasting Peace | x, c | inns and taverns, buildings and landmarks |
| `welcomePhrase` | Chinese welcome phrases: Welcome Guests | x, c | inns and taverns |
| `eastNature` | East Asian nature anchors: Pine Wind, Plum Blossom | c | inns and taverns, buildings and landmarks |
| `oasisAnchor` | Arabic and Persian anchors: Two Stars, Seven Wells | c | inns and taverns, buildings and landmarks |
| `indianAnchor` | Indian anchors: Lotus, Banyan | x, c | inns and taverns, buildings and landmarks |
| `buildingWord:defence` | building words for defences: Castle, Keep, Peel Tower | x, e, c, r | buildings and landmarks |
| `buildingWord:residence` | building words for halls and palaces: Hall, Manor, Felt Palace | x, e, c, th | buildings and landmarks |
| `buildingWord:faith` | building words for houses of faith (christian words for christian cultures only) | x, e, c | buildings and landmarks |
| `buildingWord:civic` | building words for civic buildings: Guildhall, Moot Hall, Corn Exchange | x, e, c, th | buildings and landmarks |
| `buildingWord:crossing` | building words for crossings: Bridge, Ford, Causeway | x, t, e, c | buildings and landmarks |
| `buildingWord:water` | building words for water: Well, Spring, Conduit | x, e, c | buildings and landmarks |
| `buildingWord:works` | building words for works: Mill, Forge, Pithead | x, e | buildings and landmarks |
| `buildingWord:monument` | building words for monuments: Cross, Column, Folly | x, e, c | buildings and landmarks |
| `buildingWord:learning` | building words for learning and healing: School, Library, Infirmary | x, e, c | buildings and landmarks |
| `buildingWord:confinement` | building words for gaols: Gaol, Lock-up, Tolbooth | x, t, e, c, h, rx | buildings and landmarks |
| `buildingWord:maritime` | building words for lights: Lighthouse, Light, Daymark | x, e | buildings and landmarks |
| `buildingFixed:defence` | whole defence names: Drum Tower, Bell Tower; the `{fixed}` shape's weight is the sum of their x | x, t, e, c | buildings and landmarks |
| `buildingFixed:residence` | whole residence names: Hill Enclosure; the `{fixed}` shape's weight is the sum of their x | x, t, e, c | buildings and landmarks |
| `buildingFixed:faith` | whole faith names (empty: for packs); the `{fixed}` shape's weight is the sum of their x | x, t, e, c | buildings and landmarks |
| `buildingFixed:civic` | whole civic names: Exhibition Palace; the `{fixed}` shape's weight is the sum of their x | x, t, e, c | buildings and landmarks |
| `buildingFixed:crossing` | whole crossing names: Devil's Bridge; the `{fixed}` shape's weight is the sum of their x | x, t, e, c | buildings and landmarks |
| `buildingFixed:water` | whole water names: Wishing Well; the `{fixed}` shape's weight is the sum of their x | x, t, e, c | buildings and landmarks |
| `buildingFixed:works` | whole works names (empty: for packs); the `{fixed}` shape's weight is the sum of their x | x, t, e, c | buildings and landmarks |
| `buildingFixed:monument` | whole monument names: Market Cross; the `{fixed}` shape's weight is the sum of their x | x, t, e, c | buildings and landmarks |
| `buildingFixed:learning` | whole learning names (empty: for packs); the `{fixed}` shape's weight is the sum of their x | x, t, e, c | buildings and landmarks |
| `buildingFixed:confinement` | whole confinement names (empty: for packs); the `{fixed}` shape's weight is the sum of their x | x, t, e, c | buildings and landmarks |
| `buildingFixed:maritime` | whole maritime names (empty: for packs); the `{fixed}` shape's weight is the sum of their x | x, t, e, c | buildings and landmarks |
| `buildingQual` | building qualifiers: Old, Grey, King's | x, t | buildings and landmarks |
| `follyOwner` | folly builders: Sir {surname}, Mad {surname} | x, t | buildings and landmarks |
| `holyWellPrefix` | holy well names: Lady, Saint {holy} | x, c | buildings and landmarks |
| `steampunkLandmark` | steampunk landmarks: Aether Spire, Clockwork Tower | e, h | buildings and landmarks |
| `sciFiLandmark` | sci-fi landmarks: Arcology, Sky Elevator | e | buildings and landmarks |
| `eastVirtue` | East Asian virtue names: Clear Brightness, Listening Pines | c | buildings and landmarks |
| `castleBird` | Japanese castle birds: Egret, Heron | c | buildings and landmarks |
| `indianPalaceWord` | Indian palace words: Mirrors, Peacock | c | buildings and landmarks |
| `oasisNoun` | Arabic and Persian palace words: Fountains, Nightingales | c | buildings and landmarks |
