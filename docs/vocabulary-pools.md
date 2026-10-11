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
| `fn` | the district functions a fixed district name serves (`any`: every function) | – |

Vocabulary pack headings can narrow by culture, era and region in any order: `## alleyDialect · SLO`.

A pool's `cultureExtra` adds words for one culture at ×3 (a word already in the pool is tripled).

**Groups.** `british`: anglo-saxon, celtic, norman-british. `christian`: anglo-saxon, celtic, norman-british, slavic, and greek-byzantine and roman from the medieval era on.

## Pools

| Pool | Holds | Tags used | Read by |
|---|---|---|---|
| `direction` | compass points for "‹direction› Road" (diagonals ×0.2) | x | route names, streets and districts |
| `directionAdj` | Northern, Southern, Eastern, Western | – | route names, streets and districts |
| `travellers` | plural travellers for "‹travellers›' Way" | x, t, c, e | route names, streets and districts |
| `routeFeature` | earthworks and markers for "‹feature› Way" | x | route names |
| `routeMaterial` | road surfaces for "‹material› Street" | x, e | route names |
| `routeLandform` | country a road crosses, for "‹landform› Way" | c | route names |
| `routeGoods` | goods carried on a route ("Salt Way", "Amber Road"), with each culture's extra goods | x, e, cultureExtra | route names, streets and districts |
| `holySite` | a holy destination, read as "the ‹site›" | x, c | route names, streets and districts |
| `holySitePl` | plural holy sites for "Road of the ‹number› ‹sites›" | c | route names |
| `dayNumber` | day counts for "‹n› Days Road" | – | route names |
| `jFeature` | Japanese road features ("Western Mountain Road") | x, c | route names |
| `romanRoadNomen` | Roman family adjectives for "‹nomen› Way" | c | route names |
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
| `compWater` | water components: Well, Spring, Fountain | x, e, c | streets and districts |
| `compCrossing` | crossings: Bridge, Ford, Ferry | x, t, e | streets and districts |
| `compMill` | mills and works: Mill, Kiln, Foundry | x, e | streets and districts |
| `compStorage` | storage: Granary, Barn, Warehouse | c, e | streets and districts |
| `compMarket` | trade buildings: Market, Cross, Exchange | x, c, e | streets and districts |
| `compDefence` | defences: Gate, Wall, Castle | x, e | streets and districts |
| `compFaith` | faith buildings (christian words for christian cultures only) | x, c | streets and districts |
| `compRule` | government: Court, Mint, Moot Hill | c, e | streets and districts |
| `compWaterside` | waterside: Dock, Quay, Staithe | e, r | streets and districts |
| `compTravel` | travel: Inn, Post House, Station | x, c, e | streets and districts |
| `compLearning` | learning: Library, School, Museum | e | streets and districts |
| `compDeath` | burial and execution places | t, e | streets and districts |
| `compPublic` | public spaces: Green, Gardens, Park | x, c, e | streets and districts |
| `compSteampunk` | steampunk components (fantastic, steam age) | e, h | streets and districts |
| `compSciFi` | sci-fi components: Hub, Spoke, Airlock | t, e | streets and districts |
| `streetWord` | street words: Street, Lane, Row, Gate | x, e, c, rx | streets and districts |
| `alleyWord` | alley words: Alley, Court, Yard | x | streets and districts |
| `planned` | planned-street words: Terrace, Crescent, Grove | x, e | streets and districts |
| `alleyDialect` | British regional alley words: Wynd, Chare, Twitten | r | streets and districts |
| `mainStreet` | whole main-street names: High Street, Middle Street | x, c, e, r | streets and districts |
| `streetTrades` | plural trades: Butchers, Weavers (singular drops the -s) | x, c, e, h | streets and districts |
| `streetGoods` | goods for streets and markets: Corn, Silver (plus routeGoods' culture extras ×2) | x, e | streets and districts |
| `streetFigure` | figures for King's Street, Bishop's Lane | x, c, e | streets and districts |
| `streetTree` | trees for planned streets: Laburnum Grove | e | streets and districts |
| `commemorative` | commemorative words: Jubilee, Victory, Station | x, t, e | streets and districts |
| `streetSteampunk` | whole steampunk street names: Lamplight Row | t, e, h | streets and districts |
| `streetFixed` | whole street names: Back Lane, Shambles | x, t, e, c | streets and districts |
| `squareWord` | square words: Square, Place, Green | x, c, e | streets and districts |
| `marketWord` | market words: Market, Exchange, Hall | x, c | streets and districts |
| `squareFixed` | whole square and market names: Market Square, Caravan Court | x, c, e, h | streets and districts |
| `districtWord` | district words: Quarter, Ward, End | x, t, e, c | streets and districts |
| `districtFixed` | whole district names: Old Town, Castle Town | x, t, e, c, fn | streets and districts |
