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
| `r` | a route region tag (route names §4.4), on fixed whole names | – |

A pool's `cultureExtra` adds words for one culture at ×3 (a word already in the pool is tripled).

**Groups.** `british`: anglo-saxon, celtic, norman-british. `christian`: anglo-saxon, celtic, norman-british, slavic, and greek-byzantine and roman from the medieval era on.

## Pools

| Pool | Holds | Tags used | Read by |
|---|---|---|---|
| `direction` | compass points for "‹direction› Road" (diagonals ×0.2) | x | route names |
| `directionAdj` | Northern, Southern, Eastern, Western | – | route names |
| `travellers` | plural travellers for "‹travellers›' Way" | x, t, c, e | route names |
| `routeFeature` | earthworks and markers for "‹feature› Way" | x | route names |
| `routeMaterial` | road surfaces for "‹material› Street" | x, e | route names |
| `routeLandform` | country a road crosses, for "‹landform› Way" | c | route names |
| `routeGoods` | goods carried on a route ("Salt Way", "Amber Road"), with each culture's extra goods | x, e, cultureExtra | route names |
| `holySite` | a holy destination, read as "the ‹site›" | x, c | route names |
| `holySitePl` | plural holy sites for "Road of the ‹number› ‹sites›" | c | route names |
| `dayNumber` | day counts for "‹n› Days Road" | – | route names |
| `jFeature` | Japanese road features ("Western Mountain Road") | x, c | route names |
| `romanRoadNomen` | Roman family adjectives for "‹nomen› Way" | c | route names |
| `spaceGoods` | cargoes for "‹goods› Run" | x | route names |
| `skyPath` | Polynesian sky and sea signs for "‹sign› Path" | c | route names |
| `routeFixed:road` | whole road names | x, e, c, r | route names |
| `routeFixed:trade` | whole trade-route names | x, e, c | route names |
| `routeFixed:pilgrim` | whole pilgrim and holy road names (never for Polynesian or Andean) | t, e, c, r | route names |
| `routeFixed:military` | whole military road names | e, c, r | route names |
| `routeFixed:drove` | whole drove and track names | t, e, c, r | route names |
| `routeFixed:sea` | whole sea-route names | t, e, c | route names |
| `routeFixed:rail` | whole railway and canal names (none built in) | – | route names |
| `routeFixed:motor` | whole modern road names (none built in) | – | route names |
| `routeFixed:space` | whole space-lane names ("The Long Haul") | t | route names |
