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
| `rt` | a region tag (route names §4.4, on fixed whole route names; seas and coasts §3.3, on pool words such as the boat `Coble`) | – |
| `bt` | a biome tag (seas and coasts §3.4): the chosen biome multiplies the word (`ice`, `dry`, `warm`, `cliff`, `upland`, `tropic`, `fjord`, `sand`, `lowWater`) | ×1 |
| `th` | themes: rural, urban, maritime, road, magical; the inn and building settings multiply them (other modules ignore them); pack lines add them as ` [maritime]` | none |
| `g` | the gender a divine figure or kin word is for: m, f or n (neither); unmarked reads as n; read by deities and sacred places | n |
| `fn` | the district functions a fixed district name serves (`any`: every function) | – |
| `v` | value tiers the entry fits: `h` high (gold), `m` middle (silver), `l` low (copper and small change); read by money and coins only (pack lines add them in the round brackets, `(h, grim)`) | all three |
| `loan` | the familiar English loanword for a translated coin name (`Little Flower` → `Florin`); money and coins only (pack lines add it in square brackets, `- Little Flower [Florin] (h)`) | – |
| `fx` | the fixed row of money shapes an entry belongs to (`siege`, `sf-scrip`…); an entry without `fx` is a culture's own name | – |
| `ts` | a fraction word's move along the tiers: 1 lowers one step (Half, Quarter, Third), -1 raises one (Double) | – |

Vocabulary pack headings can narrow by culture, era and region in any order: `## alleyDialect · SLO`.

A pool's `cultureExtra` adds words for one culture at ×3 (a word already in the pool is tripled).

**Groups.** `british`: anglo-saxon, celtic, norman-british. `christian`: anglo-saxon, celtic, norman-british, slavic, french, iberian, and greek-byzantine and roman from the medieval era on.

**Money-only cultures.** `french`, `dutch`, `iberian` and `american` are listed in `cultures` and flagged in `moneyOnly`: vocabulary packs can tag them (`## moneyFixed:coin · french`), but no other module's culture menu offers them.

## Pools

| Pool | Holds | Tags used | Read by |
|---|---|---|---|
| `direction` | compass points for "‹direction› Road" (diagonals ×0.2) | x | route names, streets and districts, buildings and landmarks, seas and coasts |
| `directionAdj` | Northern, Southern, Eastern, Western | – | route names, streets and districts, inns and taverns, buildings and landmarks, seas and coasts |
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
| `skyPath` | Polynesian sky and sea signs for "‹sign› Path" | c | route names, seas and lakes |
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
| `streetTrades` | plural trades: Butchers, Weavers (singular drops the -s) | x, c, e, h | streets and districts, inns and taverns, buildings and landmarks, events and eras |
| `streetGoods` | goods for streets and markets: Corn, Silver (plus routeGoods' culture extras ×2) | x, e | streets and districts, inns and taverns, buildings and landmarks, events and eras |
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
| `warObject` | war causes: Salt Wells, Broken Oath, Stolen Bride | t | events and eras |
| `warAnimal` | light war animals: Goose War | t | events and eras |
| `battleSite` | battle sites: Ford, Bridge, Moor | x | events and eras |
| `rebelGarment` | rising garments: Ribbon, Cockade | – | events and eras |
| `disaster` | disasters: Fire, Plague, Locusts | x, c | events and eras |
| `collapseNoun` | collapses: Fall, Sundering, Drowning | t | events and eras |
| `crisisNoun` | crises: Troubles, Interregnum, Anarchy | t | events and eras |
| `migrationNoun` | migrations: Long Walk, Exodus, Landing | t | events and eras |
| `eraNoun` | era nouns (WR §9.2 pools, steam age, modern and sci-fi) | x, e, h | events and eras |
| `metalAge` | metal ages: Silver, Lead, Steel | t, e | events and eras |
| `eastEraWord` | East Asian era names: Great Peace, Bright Rule | x, c | events and eras |
| `cycleElement` | the five elements of the year cycle | c | events and eras |
| `cycleAnimal` | the twelve animals of the year cycle | c | events and eras |
| `yearThing` | years named for a thing: Comet, Two Moons | c | events and eras |
| `sunOrdinal` | Aztec and Maya sun ordinals: Sixth (Fifth ×0.3) | x, c | events and eras |
| `chronicleSeason` | seasons: Harvest, Midwinter | – | events and eras |
| `eventFixed:war` | whole war names: Gate Wars, Brothers' War; the fixed shape's weight is the brief's | t, e, c | events and eras |
| `eventFixed:battle` | whole battle names (empty: for packs); the fixed shape's weight is the brief's | t, e, c | events and eras |
| `eventFixed:rebellion` | whole rebellion names (empty: for packs); the fixed shape's weight is the brief's | t, e, c | events and eras |
| `eventFixed:treaty` | whole treaty names (empty: for packs); the fixed shape's weight is the brief's | t, e, c | events and eras |
| `eventFixed:crisis` | whole crisis names (empty: for packs); the fixed shape's weight is the brief's | t, e, c | events and eras |
| `eventFixed:migration` | whole migration names: First Contact; the fixed shape's weight is the brief's | t, e, c | events and eras |
| `eventFixed:disaster` | whole disaster names: Quarantine Years; the fixed shape's weight is the brief's | t, e, c | events and eras |
| `eventFixed:collapse` | whole collapse names: Collapse, Long Night; the fixed shape's weight is the brief's | t, e, c | events and eras |
| `eventFixed:era` | whole era names: New Fire; the fixed shape's weight is the brief's | t, e, c | events and eras |
| `divineFigure` | divine figures by gender: Lord, Lady, One | x, t, g | deities and sacred places |
| `divineQuality` | divine qualities: Hidden, Laughing, Undying | x, t, h | deities and sacred places |
| `divineVerb` | “Who …” verbs: Remembers, Keeps the Flame | x, t | deities and sacred places |
| `bodyNumber` | body numbers: Thousand, Many | x | deities and sacred places |
| `bodyPart` | body parts: Eyed, Headed | x, t | deities and sacred places |
| `divineKin` | divine kin by gender: Father, Mother, Kin | x, g | deities and sacred places |
| `pantheonNoun` | pantheon nouns: Gods, Host, Choir | x | deities and sacred places |
| `pantheonQuality` | pantheon qualities: Old, Bright, Nameless | x | deities and sacred places |
| `sacredLand` | sacred lands: Mountain, Grove, Station Shrine | x, e, c, h | deities and sacred places |
| `sacredQuality` | sacred qualities: Holy, Weeping, Forbidden | x, t | deities and sacred places |
| `oracleWord` | oracle words: Oracle, Pool of Seeing | x, t | deities and sacred places |
| `sacredVirtue` | sacred virtues: Mercy, Forgetting | t | deities and sacred places |
| `cultureDivineAnimal` | divine animals by culture (BT cultureAnimals; general and egyptian their own) | c | deities and sacred places |
| `deityFixed:deity` | whole deity titles (empty: for packs) | t, e, c | deities and sacred places |
| `deityFixed:pantheon` | whole pantheon names: the Twins, the Makers, the Elder Kin | t, e, c | deities and sacred places |
| `deityFixed:place` | whole sacred places (empty: for packs) | t, e, c | deities and sacred places |
| `seaColour` | colour seas: Black, White, Red, Golden; Wine-Dark for Greek-Byzantine | x, t, e, cultureExtra | seas and lakes, coasts and islands, sea charts |
| `seaQuality` | qualities of a sea: Great, Narrow, Inner, Restless, Frozen | x, t, bt | seas and lakes, sea charts |
| `oceanQuality` | qualities of an ocean: Great, Outer, Encircling, Silent | x, t, e | seas and lakes |
| `oceanOf` | "Ocean of ‹…›": Storms, Darkness, Mists, the World | x, t, bt | seas and lakes |
| `seaCreature` | sea creatures and birds: Seal, Whale, Gull, Puffin, Walrus | x, t, pl, bt | seas and lakes, coasts and islands, sea charts |
| `lakeCreature` | lake creatures and birds: Swan, Heron, Pike, Crocodile | x, t, e, pl, bt | seas and lakes |
| `shoreShape` | body shapes a headland resembles: Horn, Hook, Nose, Tongue | x | coasts and islands |
| `lakeShape` | shapes a lake resembles: Moon, Crescent, Eye; Lute and Fan for Japanese, Ear for Chinese and Korean | x, cultureExtra | seas and lakes |
| `explorerMood` | explorers' moods: Plenty, Hope, Disappointment, Desolation, Farewell | x, t | seas and lakes, coasts and islands |
| `coastGoods` | goods a coast is named for: Gold, Ivory, Pepper, Pearl, Coral | x, bt | coasts and islands |
| `grimCoast` | grim coast words: Skeleton, Wreckers', Widow's, Drowned (all grim) | x, t, bt | coasts and islands |
| `endWord` | "‹…› End": Land's, World's, Earth's | x | coasts and islands |
| `stackGroup` | groups of sea stacks: Needles, Maidens, Sisters, Teeth | x, t | coasts and islands, sea charts |
| `coveFolk` | people a cove is named for: Smugglers, Fishermen, Pirates, Monks | x, t | coasts and islands |
| `folkUncanny` | folk-supernatural possessives: Devil's, Giant's, Witch's, Mermaid's | x, t | seas and lakes, coasts and islands, sea charts |
| `devilFeature` | what the Devil owns: Rock, Bellows, Frying Pan, Punchbowl | x, t | coasts and islands |
| `narrowsWord` | "The ‹…› Narrows": Iron, Stone, Long, Crooked, Twin | x, t | seas and lakes |
| `gateWord` | "‹…› Gate": Golden, Iron, Narrow, Western | x | seas and lakes |
| `fordBeast` | beasts of "‹…› Ford" (Bosporus): Ox, Cow, Horse, Goat | x | seas and lakes |
| `bayQuality` | qualities of a bay or cove: Long, Broad, Sandy, Hidden, Shell | x | seas and lakes, coasts and islands |
| `islandQuality` | qualities of an island: Long, Flat, Green, Steep, Holy | x, t, c | coasts and islands |
| `shoreQuality` | qualities of a shore or sand: Long, Black, Golden, Shingle, Steep | x | coasts and islands |
| `lakeQuality` | qualities of a lake: Long, Still, Deep, Hidden, Salt | x, t, bt | seas and lakes |
| `lakeFuse` | first halves of fused lake words: Grass- and Reed- (Grassmere, Reedwater) | – | seas and lakes |
| `boatWord` | fishing boats banks are named for: Dogger, Buss, Cog, Smack, Trawler | e, rt | sea charts |
| `pitWord` | "‹…› Pit": Silver, Sole, Herring, Ling, Cod | x | sea charts |
| `depthNumber` | depth-number banks: Fourteens, Forties, Eighteens | x | sea charts |
| `lengthAdj` | "The ‹…› Fourteens": Broad, Long, Narrow, Great, Outer | x | sea charts |
| `gatTrade` | trades a gat is named for: Fisherman's, Pilot's, Smuggler's | x, t | sea charts |
| `swallowWord` | whirlpool words: Swallower, Grinder, Churn, Cauldron, Boil | x, t | sea charts |
| `kinCurrent` | kin words for currents (Japanese): Parent, Mother, Child | x, c | sea charts |
| `seaKenning` | kennings for the sea (Anglo-Saxon and Norse): Whale Road, Swan Road, Gannet's Bath | x, t, c | seas and lakes |
| `mariaWord` | lunar maria words: Tranquillity, Serenity, Storms, Dreams, Decay | x, t | seas and lakes |
| `seaMonster` | sea monsters: Kraken, Leviathan, Serpent; Merrow and Selkie for Celtic and Norse | x, cultureExtra | seas and lakes, sea charts |
| `cosmoSubstance` | the seven Puranic oceans' substances (Indian): Milk, Salt, Wine, Ghee | x, c | seas and lakes |
| `euphemism` | euphemisms for a sea (Greek-Byzantine): Hospitable, Kindly, Gentle | x, t, c | seas and lakes |
| `hyperColour` | hyperspace colours: Black, Grey, Silver, Amber, Brass | x, t | hyperspace charts |
| `hyperAdj` | hyperspace qualities: Blind, Silent, Broken, False, Ghost | x, t | hyperspace charts |
| `hyperPhysical` | what hyperspace hazards are made of: Gravity, Phase, Time, Echo, Mirror | x, t | hyperspace charts |
| `weatherAdj` | weather adjectives: Howling, Wailing, Grinding, Singing | x, t | hyperspace charts |
| `depthBand` | hyperspace depth bands, named as the Forties are: Forties to Seventies | x | hyperspace charts |
| `watersFixed:seas` | whole sea and lake names (empty: for packs) | – | seas and lakes |
| `watersFixed:coasts` | whole coast and island names (empty: for packs) | – | coasts and islands |
| `watersFixed:charts` | whole chart-feature names (empty: for packs) | – | sea charts |
| `watersFixed:hyperspace` | whole hyperspace-feature names (empty: for packs) | – | hyperspace charts |
| `coinMetal` | metals for coins: Gold, Silver, Copper…, with the fantastic and near-future metals; `v` gives the tier | x, e, c, h, v | money and coins |
| `coinWord` | coin nouns: Penny, Crown, Noble, Mark…; `v` gives the tiers each fits | x, e, c, v | money and coins |
| `coinEmblem` | what a coin bears: Lion, Rose, Cross, Dragon…, with the fantastic and steampunk emblems (the culture's animals from bynames join at ×1) | x, e, c, h | money and coins |
| `coinFraction` | Half, Quarter, Double, Third; `ts` says which way they move the tier | x, e, ts | money and coins |
| `coinShapeWord` | coin shapes: Round, Square, Oval, Ring, Cup | c, e | money and coins |
| `earlyMoney` | the forms of early money: Ingot, Bar, Ring, Wire, Rod (the shapes pick which ones) | – | money and coins |
| `goodsMoney` | goods money named whole: Cake of Salt, Salt Bar, Head of Cattle (the shapes pick which ones) | – | money and coins |
| `paperWord` | Note, Bill, Bond, Certificate, Draft… | x, e | money and coins |
| `tokenWord` | Token, Scrip, Check, Chit, Ticket, Credit | x, e | money and coins |
| `unitWord` | the last word of a currency: Standard, Mark, Crown, Credit… | x, e | money and coins |
| `moneyNickname` | everyday words for coins: Rounds, Bits, Chips, Shells, Beans… | x, c | money and coins |
| `sfMoney` | Credit, Unit, Chit, Token… for near-future and interstellar money | x, e | money and coins |
| `moneyFixed:coin` | whole coin names: the culture names (Little Flower, Groat…) and the fixed rows (fantastic, steampunk, near future, interstellar) | x, t, e, c, h, v, loan, fx | money and coins |
| `moneyFixed:early` | whole early and shaped money names: Hacksilver, Spade, Silver Shoe… | x, e, c, v, loan, fx | money and coins |
| `moneyFixed:goods` | whole goods money names: Cowrie, Cacao Bean, Tea Brick, Salt Bar… | x, t, e, c, h, v, loan, fx | money and coins |
| `moneyFixed:paper` | whole paper and credit names: Flying Money, Tally, Bill of Exchange… | x, t, e, c, h, v, loan, fx | money and coins |
| `moneyFixed:scrip` | whole scrip and token names: Pit Token, Hop Token, Siege Piece… | x, t, e, c, h, v, fx | money and coins |
| `moneyFixed:currency` | whole currency names, printed without a leading "the": Pound, Wrought Silver… | x, e, c, loan, fx | money and coins |
| `moneyFixed:nickname` | whole nicknames: Bob, Quid, Owls, Sorrel… | x, t, e, c, v, fx | money and coins |
| `seasonWord` | words for the year's seasons, each tagged `s` with the seasons it fits: Sowing, Hay, Harvest, Frost, Thaw, Rain, Flood… | x, t, c, s | calendars and festivals |
| `workWord` | the farming-year subset of the season words: Ploughing, Lambing, Shearing, Reaping…; tagged `wk` and `s` | x, s | calendars and festivals |
| `dayWork` | what a day is for: Market, Wash, Rest, Fast, Moot, Assembly… | x, t, c, e | calendars and festivals |
| `dayElement` | the five elements of an East Asian week: Fire, Water, Wood, Metal, Earth | c | calendars and festivals |
| `skyFigure` | people in the sky: Hunter, Weaver, Ploughman, Twins… | x, t | sky lore |
| `skyObject` | things in the sky: Plough, Wain, Loom, Fishhook, Fire Drill… | x, c | sky lore |
| `skyBodyPart` | parts of a star picture: Eye, Tail, Horn, Heart… | x, t | sky lore |
| `skyQuality` | qualities of a light: Pale, Red, Slow, Swift, Bright… | x, t | sky lore |
| `skyKin` | kin of the sky: Sister, Brother, Mother, Bride… | x, t | sky lore |
| `skyRiver` | the Milky Way's road words: River, Road, Path, Way, Seam… | x, t | sky lore |
| `skyHeaven` | what the Milky Way leads to: Heaven, the Sky, the Night, Souls… | x, t, c | sky lore |
| `festNoun` | what a festival honours: Lanterns, Bonfires, Ancestors, Kites… | x, t | calendars and festivals |
| `festBlessing` | what is blessed: the Boats, the Ploughs, the Herds… | x | calendars and festivals |
| `extraDays` | words for the days outside the months: Empty, Nameless, Lost, Idle… | x, t | calendars and festivals |
| `thingObject` | the object word of each kind: Sword, Blade, Crown, Annals, Gazette…; `k` gives the kind | x, e, c, h, t, k | arms and armour, treasures and regalia, books and writings |
| `deedTarget` | what a blade cleaves: Leg, Helm, Bone, Oak…; fantastic targets Troll, Dragon, Wyrm | x, h, k, c | arms and armour |
| `deedVerb` | Biter, Cutter, Splitter, Breaker…; `k` gives the kinds each fits | x, t, k | arms and armour |
| `thingAgent` | what a thing does, as a name: Answerer, Thunderer, Watcher… | x, t, k | arms and armour |
| `thingMood` | a temper as a name: Joyous, Wrath, Faithful… | x, t | arms and armour |
| `kenningFirst` | the first half of a kenning: Battle, War, Storm, Raven… | x, t | arms and armour |
| `kenningSecond` | the second half, by kind: Flame, Snake, Board, Boar… | x, k | arms and armour |
| `thingBodyPart` | Tooth, Fang, Claw, Wing, Eye…; `k` gives the kinds | x, t, k | arms and armour, treasures and regalia |
| `thingQuality` | Long, Black, Old, Broken, Lucky… | x, t | all three |
| `thingVirtue` | Mercy, Justice, Honour, Oaths… | x, t | all three |
| `lightPlace` | River, Lake, Crown, Eye, Moon, Star… (of Light) | x | treasures and regalia |
| `thingSound` | Calling, Ringing, Roaring, Singing… | x, t | treasures and regalia |
| `thingFate` | Kings, Fate, Oaths, Crowning… | x, t | treasures and regalia |
| `thingPlenty` | Plenty, Rebirth, Wisdom, Feasting… | x, t | treasures and regalia |
| `thingFlower` | Rose, Lily, Plum, Peony, Thistle… | x, c | treasures and regalia |
| `thingGiven` | homely given names for guns and bells; `g` gives the gender | x, g | arms and armour, treasures and regalia |
| `thingTemper` | Mad, Lazy, Fat, Brown, Old, Big, Long (men's names only) | x, t, g | arms and armour |
| `thingDomain` | Storms, Fire, Frost, the Sea, Tides… | x, t | treasures and regalia, books and writings |
| `scholarGroup` | Masters, Monks, Scholars, Clerks… | x | books and writings |
| `bookSubject` | Princes, Kings, Herbs, Beasts, Ladies, Fools… | x, t | books and writings |
| `bookPlace` | Meadows, Mines, Gardens, Rivers, Seas, Fountains | x | books and writings |
| `bookTreasure` | Gold, Gems, Pearls, Silver, Coral, Musk, Amber | x | books and writings |
| `bookOpening` | Hear Me, Long Ago, In the Old Days… | x, t | books and writings |
| `sageWord` | Teacher, Sage, Master, Elder, Seer, Hermit, Pilgrim | x | books and writings |
| `bookSecret` | Night, Ash, Bones, Stars, Keys, Names, Tides… | x, t | books and writings |
| `officeWord` | Exchequer, Treasury, Admiralty, Chancery, Wardrobe… | x | books and writings |
| `moodOf` | explorers' moods that can follow "of": Plenty, Hope, Disappointment, Farewell | x, t | wild lands |
| `wildColour` | colours: Black, White, Red, Grey, Green | x, t | wild lands |
| `wildQuality` | plain adjectives: Great, Little, High, Long, Old | x, c, t | wild lands |
| `wildFuse` | first halves of fused words: Ash- and Raven- (Ashdale, Ravenhurst) | – | wild lands |
| `wildWeather` | weather and sky: Wind, Storm, Mist, Frost | x, bt, t | wild lands |
| `wildShape` | shapes a feature resembles: Saddle, Anvil, Horn, Needle | x, c, t | wild lands |
| `rangeBody` | body words of a range: Spine, Backbone, Teeth, Wall | x | wild lands |
| `wildMetal` | metals and stones worked: Silver, Copper, Lead, Coal, Slate | x, bt, c | wild lands |
| `mythBeast` | fantastic beasts: Dragon, Wyrm, Griffin, Giant, Troll (fantastic only) | x, h, t | wild lands |
| `mythFuse` | fantastic first halves: Elf-, Fey-, Troll-, Dwarf- (fantastic only) | x, h | wild lands |
| `leapWho` | whose leap: Maiden's, Lover's, Giant's, Hart's | x, e, t | wild lands |
| `iceWord` | ice features: River, Stair, Tongue, Wall | – | wild lands |
| `mtWork` | mountain trades: Shepherds', Drovers', Miners', Pilgrims' | x, e, t | wild lands |
| `mtRiverWord` | mountain river words: Swift, Rush, Roar, Tumble | x | wild lands |
| `mtRiverAdj` | mountain river adjectives: Roaring, Rushing, Tumbling | x | wild lands |
| `mtBeast` | mountain creatures: Eagle, Raven, Goat, Ptarmigan, Ibex | x, bt, c, t | wild lands |
| `fstQuality` | forest adjectives: Dark, Deep, Green, Old | x, t | wild lands |
| `fstNoun` | what a forest holds: Shadows, Whispers, Thorns | t | wild lands |
| `fstOwner` | forest owners: King's, Queen's, Bishop's, Earl's | x, e | wild lands |
| `fstWork` | forest trades: Charcoal Burners', Woodcutters', Foresters' | x, t | wild lands |
| `fstKeeper` | forest officers: Keeper's, Verderer's, Ranger's | x | wild lands |
| `fstFlora` | forest plants: Bluebell, Primrose, Bracken, Fern | x, bt, c | wild lands |
| `fstFestival` | festivals: Midsummer, May, Harvest, Beltane | x, c, t | wild lands |
| `fstSprite` | forest sprites: Fairy, Pixie, Elf, Goblin, Puck | x, t | wild lands |
| `fstRiverWord` | forest river words: Shade, Leaf, Hush, Moss | x | wild lands |
| `fstPond` | pond kinds: Hammer, Mill, Furnace, Fish, Dew | x, e | wild lands |
| `treeFunc` | what a named tree or stone was for: Gospel, Hanging, Moot, Boundary, Wishing | x, c, e, t | wild lands |
| `fstBeast` | forest creatures: Deer, Boar, Wolf, Fox, Owl | x, bt, c, t | wild lands |
| `wildTree` | trees: Oak, Ash, Beech, Elm, Pine (biome-tagged) | x, bt, c | wild lands |
| `dsrQuality` | desert adjectives: Empty, Great, Burning, Red, Thirsty | x, t | wild lands |
| `dsrStuff` | what a desert is: Sand, Stones, Gravel, Salt | x, t | wild lands |
| `dsrStone` | desert ground: Flint, Gravel, Pebble, Stone | t | wild lands |
| `dsrOasisWord` | oasis words: Palm, Date, Green, Twin, Lone | x, t | wild lands |
| `dsrGoods` | caravan goods: Salt, Gold, Incense, Spice | x | wild lands |
| `dsrDays` | days' journey: Forty, Ten, Seven, Twenty | x | wild lands |
| `dsrWork` | desert trades: Caravan, Pilgrims', Salt Traders' | x, t | wild lands |
| `dsrBeast` | desert creatures: Camel, Jackal, Scorpion, Gazelle | x, bt, c, t | wild lands |
| `mrQuality` | moor adjectives: Bleak, Black, Wild, High | x, t | wild lands |
| `mrFlora` | moorland plants: Heather, Gorse, Bracken, Bilberry | x, bt | wild lands |
| `mrWork` | moorland trades: Peat Cutters', Shepherds', Miners' | x, t | wild lands |
| `mrBeast` | moorland creatures: Grouse, Curlew, Lapwing, Merlin | x, pl, t | wild lands |
| `wetQuality` | wetland adjectives: Black, Still, Wide, Sour | x, t | wild lands |
| `wetNoun` | what a wetland holds: Mists, Reeds, Whispers, Lights | t | wild lands |
| `wetFlora` | wetland plants: Reed, Rush, Sedge, Willow, Cypress | x, bt | wild lands |
| `wetWork` | wetland trades: Reed Cutters', Eelers', Fowlers' | x, t | wild lands |
| `wetBeast` | wetland creatures: Heron, Bittern, Crane, Eel, Frog | x, bt, e, pl, t | wild lands |
| `drainFeet` | widths of a drain: Forty, Twenty, Sixteen, Hundred | x | wild lands |
| `grsQuality` | grassland adjectives: Wide, Open, Green, Golden | x, bt, t | wild lands |
| `grsFlora` | grassland plants: Grass, Clover, Cowslip, Poppy | x, bt | wild lands |
| `grsWork` | grassland trades: Drovers', Shepherds', Herders' | x | wild lands |
| `grsBeast` | grassland creatures: Horse, Hare, Lark, Bison | x, bt, pl | wild lands |
