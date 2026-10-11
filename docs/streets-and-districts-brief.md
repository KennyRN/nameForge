# Streets and districts – brief (first release)

This brief adds a module, **streets and districts**, to the **place names** group, after route names. It names three things inside a settlement:

- **streets and lanes:** *Mill Lane*, *Butchers' Row*, *Westgate*, *Market of the Coppersmiths*, *Lamplight Row*, *Deck 9 Concourse*
- **squares and markets:** *Market Square*, *Saturday Market*, *Fourth-Day Market*, *Caravan Court*, *Exhibition Square*
- **districts and quarters:** *Weavers' Quarter*, *Strangers' Quarter*, *Castle Town*, *Engine Quarter*, *Hab Block Tau*

It is the second brief built from `docs/worldbuilding-research-reference.md` (WR §x), and it builds directly on **route names** (`docs/route-names-brief.md`, RN §x):

- it reads and extends the **shared vocabulary** (`settlement-vocab.json`) and **vocabulary packs** RN set up, adding its own pools and one new tag (regions)
- streets can carry a **route** through town (*Salt Way*, *Fenwick Road*)
- it uses RN's eras, cultures, regions, fantastic switch and settlement safeguard packs unchanged

Its **"as one town"** series is the groundwork for a later settlement kit, and its pools are the ones inns and buildings will read.

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow RN, then `docs/group-names-brief.md` (GN §x) and `docs/group-tone-and-series-brief.md` (TS §x). Reuse existing helpers rather than copying them.

All output is in modern English. Native terms appear in WR as reference only.

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | A new module `streetNames` in the place names group, after route names |
| Kinds | streets and lanes · squares and markets · districts and quarters |
| Cultures, eras, fantastic, regions | As RN §4 (22 cultures, 7 eras, steampunk in the steam age, 12 British regions) |
| Settlement size | A new link: village · town · city · great city (in sci-fi: outpost · colony · station · megacity) |
| District function | A link shown for districts: commercial, craft, religious, rule, learning, foreign, military, industrial, poor, elite |
| Dialect words | British regional alley and street words: plain only · as variants · instead. Default **as variants**, matching british place names 1a. |
| Series | **As one town**: a main street first, then no component or function twice, neighbouring towns as destinations, and one route through town (§10) |
| Shared vocabulary | New pools in `settlement-vocab.json`; entries gain an optional region tag `r`; vocabulary pack headings gain a region form (§3) |
| Caste rule | indian and west-african trade-named streets and districts switch to goods (WR §6.3) |
| Buildings and landmarks | Parked (their own module, reading these pools) |

---

## 1. Module

### 1.1 Section

- Add `streetNames` to `NameForgeSection`, label **"streets and districts"**, Lucide icon `signpost`.
- Insert it in `SECTION_GROUPS.placeNames` and `SECTION_ORDER` straight after `routeNames`.

### 1.2 History

`streets and districts · {era label} · {culture label}`, then ` · {kind}` when not Any, ` · {size}`, ` · {region phrase}` when chosen, ` · steampunk` or ` · fantastic` when on, ` · {tone}` when not Any, ` · one town` in a series.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/settlement-vocab.json` | The new pools (§5), added beside RN's |
| `src/data/street-names.json` | Kinds, sizes, functions, shapes, dialect map, culture shapes, safeguards |
| `src/streets/engine.ts` | Generation (§8), series (§10), rendering (§11). No Obsidian imports. |
| `src/streets/sentence.ts` | The sentence (§2) |
| `docs/vocabulary-pools.md` | Add rows for every new pool |
| `tests/streetNames.test.ts` | §16 |

Add this brief to `docs/` as `streets-and-districts-brief.md`.

---

## 2. The sentence

### 2.1 Shape

> ‹Norman & British› ‹streets and lanes› of the ‹medieval› era, in a ‹realistic› world, ‹across all of Britain›, for a ‹town›, ‹with dialect words as variants›, ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›.

With districts chosen, the kind segment reads "‹districts› ‹of any function›".

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | as RN | as RN §4.1 | `norman-british` |
| `kind` | "streets, squares and districts" (Any) or the kind's plural | Any, then the kinds offered for the size (§6.2) | any |
| `function` | "of any function" / "for ‹craft›" | any, then the 10 functions (§7.1) | any |
| `era`, `fantastic`, `region` | as RN §2.2 | as RN | MD, realistic, all of Britain |
| `size` | "for a ‹town›" | the 4 sizes (§6.1), labelled by era | town |
| `dialect` | "with plain words only" · "with dialect words as variants" · "with dialect words instead" | the three | as variants |
| `tone`, `people`, `series` | as RN; series reads "each one separate" · "as one town" | | separate |

- **Function link:** shown only when kind is districts.
- **Dialect link:** shown only for the British cultures (RN §4.1). Hidden reads as plain words only.
- **Tooltips:** kind, the kind's description (§6); function, "What the quarter is for"; size, "How big the settlement is: decides which streets, squares and districts it has"; dialect, "Regional words such as wynd, chare or twitten, beside or instead of the plain word"; series, "One town's streets: a main street first, then no repeats"; the rest as RN.

### 2.3 Resets

- **Size changed:** a kind not offered for the size resets to Any.
- **Kind changed** away from districts: function resets to any.
- **Culture changed** away from the British cultures: region resets (RN §2.3) and dialect reads as plain.

### 2.4 Plain text, state, presets

As GN §2.5–§2.6. Presets in §14.

---

## 3. Extending the shared vocabulary

### 3.1 Region tag

Entries in `settlement-vocab.json` gain one optional key:

| Key | Meaning | Default |
|---|---|---|
| `r` | region codes (RN §4.4) where the entry is used; ignored for non-British cultures | all regions |

Update RN's loader (`src/settlement/vocab.ts`) to read it. Existing pools are unaffected.

### 3.2 Vocabulary pack headings

Headings may now also carry a region code: `## alleyDialect · SLO`. The full form is `## {pool}`, then optionally ` · {culture}`, ` · {era}`, ` · {region}`, in any order. A code that is both a valid era and region doesn't exist, so there's no ambiguity.

### 3.3 Register

Add a row to `docs/vocabulary-pools.md` for every pool in §5, and add "streets and districts" to the "Read by" column of RN's pools that this module reads (`direction`, `directionAdj`, `travellers`, `routeGoods`, `holySite`).

---

## 4. Supporting sources

As RN §4.2, plus:

| Token | Source |
|---|---|
| `{route}` | One route name from the route engine for the same culture, era, fantastic and region, kind road (40), trade (25), drove (20) or pilgrim (15), people mode as here. In MO on, kind road or motor. |
| `{trade}` / `{tradeSg}` | `streetTrades` (§5): plural for possessives (*Butchers' Row*), singular for bare forms (*Butcher Street*) |
| `{people}` | One tribes and kin groups name (as RN `{folk}`) without "the" — a fictional people, never a real ethnonym. Placeholder `[people]`. |
| `{royal}` | Placeholder `[royal]`. In invented mode, shapes with `{royal}` are drawn as `{streetFigure} {streetWord}` instead (*King Street*). |
| `{holy}` | GN §8.2 saints for christian cultures only |
| `{weekday}` | Monday … Sunday; Saturday ×2, Thursday ×1.5 |
| `{surname}` | GN `surname` (invented for general, celtic, norman-british; placeholder otherwise, as GN §8.3) |

---

## 5. New pools (settlement-vocab.json)

Tone tags in brackets; era codes as RN §4.3; `c` cultures; `r` regions.

### 5.1 Components (WR §2.1)

One pool per function, so packs can extend each. `S` marks WR's S-tier words, weighted ×3.

| Pool | Entries |
|---|---|
| `compWater` | Well (S), Spring (S), Conduit, Cistern (AN–EM), Fountain, Pump (EM–ST), Aqueduct (AN; roman, greek-byzantine, arabic-persian, aztec), Step Well (indian), Water Channel (arabic-persian), Waterworks (ST), Reservoir (ST–MO) |
| `compCrossing` | Bridge (S), Ford (S), Ferry, Causeway, Stepping Stones (light), Viaduct (ST), Swing Bridge (ST) |
| `compMill` | Mill (S), Kiln, Forge, Smithy, Quarry, Tannery, Ropewalk (EM–ST), Salt Pans, Works (ST–MO), Foundry (ST), Gasworks (ST), Engine House (ST), Brickworks (ST) |
| `compStorage` | Granary, Storehouse, Barn, Tithe Barn (christian), Warehouse, Bonded Store (ST), Coal Yard (ST) |
| `compMarket` | Market (S), Cross (S; british), Exchange, Hall, Guildhall (MD–EM), Arcade (ST), Corn Exchange (ST) |
| `compDefence` | Gate ×2, Wall, Tower, Castle, Keep, Citadel, Bastion, Barbican (MD–EM), Barracks (EM–MO), Battery (EM–ST), Drill Hall (ST) |
| `compFaith` | Temple, Shrine, Sanctuary, Monastery, Holy Well; christian: Church ×2, Chapel ×2, Minster, Abbey, Priory, Friary |
| `compRule` | Court, Hall, Treasury, Mint, Custom House, Toll House, Moot Hill (anglo-saxon, norse), Town Hall (ST–MO), Courthouse (ST–MO) |
| `compWaterside` | Dock, Wharf, Quay, Harbour, Landing, Strand, Staithe (r: EAN NTH), Basin (ST), Pier (ST–MO), Lock (EM–ST) |
| `compTravel` | Post House, Inn, Caravan Court (arabic-persian, steppe, indian), Toll Gate (EM–ST), Station ×2 (ST–MO), Terminus (ST) |
| `compLearning` | Library, School, Academy, College, Institute (ST), Museum (ST–MO) |
| `compDeath` | Burial Ground, Barrow (AN–MD), Charnel House (grim), Cemetery (ST–MO), Gallows (grim) |
| `compPublic` | Green ×2 (british), Common (british), Gardens, Bath House, Baths (ST), Park (ST–MO), Pleasure Gardens (ST) |
| `compSteampunk` (`h: true`, ST) | Aether Works, Clock Tower, Glasshouse, Airship Mast, Pneumatic Exchange, Engine Hall, Gasometer |
| `compSciFi` (NF–IS) | Hub, Spoke, Dock Arm, Hydroponics, Reactor, Airlock, Lift, Observation Deck, Cargo Bay, Recycler (grim) |

**`component`** = all the pools above, as available, with these weights: compWater 15, compCrossing 15, compMill 15, compMarket 12, compFaith 10, compDefence 8, compWaterside 8, compStorage 5, compRule 5, compTravel 4, compPublic 4, compLearning 2, compDeath 1; in ST with fantastic, compSteampunk 10; in NF–IS, compSciFi replaces all but compMarket, compPublic and compLearning, at 50.

### 5.2 Street words

| Pool | Entries |
|---|---|
| `streetWord` | Street ×4, Lane ×4, Road ×2, Row ×2, Way, Close, Walk (ST on), Hill, Gate ×3 (c: anglo-saxon, norse, norman-british; r: NTH EMD ×3, EAN ×1.5; MD–EM) |
| `alleyWord` | Alley ×2, Passage, Court, Yard, Entry |
| `planned` (ST on) | Terrace ×2, Crescent, Place, Avenue, Gardens, Grove, Mews, Parade, Drive (MO on) |
| `alleyDialect` | Wynd (r: SLO SBL NTH), Vennel (r: SLO SBL), Close (r: SLO, Edinburgh sense), Chare (r: NTH SBL), Snicket (r: NTH), Ginnel (r: NTH), Twitten (r: SEA), Jitty (r: EMD), Entry (r: WMM), Gully (r: NTH), Opening (r: NTH), Ope (r: WCY COR), Lonning (r: NTH SBL) |
| `mainStreet` | High Street ×3 (british), Main Street (general MO; celtic; r: SLO SHH), Broad Street, Long Street, Middle Street (greek-byzantine), Great Street (slavic, norse), Bell Street (korean) |
| `streetTrades` | Butchers ×2, Bakers, Coopers, Tanners, Weavers, Dyers, Smiths ×2, Fishers, Chandlers, Cutlers, Glovers, Potters, Masons, Millers, Ropemakers, Saddlers, Shoemakers, Tailors, Goldsmiths, Silversmiths, Brewers, Vintners, Drapers, Mercers, Fullers; c: chinese/japanese/korean + Silk Reelers, Lacquerers, Paper Makers, Fan Makers, Swordsmiths, Sake Brewers (japanese); arabic-persian + Coppersmiths, Perfumers, Booksellers, Carpet Weavers, Spice Sellers; aztec/maya + Featherworkers, Jade Carvers, Mat Makers; ST + Clockmakers, Printers, Engine Makers; `h: true` ST + Aethersmiths, Gearwrights. Singular forms drop the final -s (Smiths → Smith). |
| `streetGoods` | Silver, Corn ×2, Wool, Hay, Salt, Fish, Butter, Cheese, Milk, Bread, Leather, Cloth, Silk, Horse, Cattle (as markets), Coal (ST); plus RN `routeGoods` cultureExtra words ×2 |
| `streetFigure` | King ×2, Queen ×2, Prince, Duke, Bishop (christian), Abbot (christian), Friar (christian), Mayor (ST–MO), Earl (british), Lord |
| `streetTree` (ST on) | Elm, Ash, Lime, Cherry, Oak, Chestnut, Willow, Poplar, Plane, Holly, Laburnum, Acacia |
| `commemorative` (ST–MO) | Jubilee, Victory, Coronation, Station ×2, Railway, Peace, Exhibition, Empire (grim), Albion ×0.3 |
| `streetSteampunk` (`h: true`, ST; whole names) | Piston Street, Lamplight Row, Gasworks Lane, Cog Alley, Aether Terrace, Brass Parade, Gaslight Arcade, Smog Lane (grim), Pneumatic Row, Boiler Yard |
| `streetFixed` | Back Lane ×2, Shambles (british; MD–EM), Market Place (british), Church Street (christian), Station Road (ST–MO), Water Lane, Love Lane (light; british), Cheap Street (british; MD), Friar Street (christian) |

### 5.3 Squares and markets

| Pool | Entries |
|---|---|
| `squareWord` | Square ×3, Place, Green (british), Cross (british), Plaza (aztec, maya, iberian-style general MO), Court, Circus (ST; british) |
| `marketWord` | Market ×4, Exchange, Hall, Lanes (arabic-persian), Court |
| `squareFixed` | Market Square ×3, Market Place (british), Old Market, New Market, Market Cross (british), Corn Exchange (ST), Covered Market (arabic-persian), Caravan Court (arabic-persian, steppe), Great Market (aztec), Great Plaza (maya), Drum Tower Square (chinese), Clock Tower Square (ST; indian, general), Horse Fair (british), Exhibition Square (`h: true`, ST), Aether Exchange (`h: true`, ST), Hub (NF–IS), Exchange Deck (NF–IS) |

### 5.4 Districts

| Pool | Entries |
|---|---|
| `districtWord` | Quarter ×3, Ward ×2, District, Precinct, End, Side, Town (Old Town, New Town shapes); Borough (EM on; british), Liberty (british; MD–EM), Rookery (ST; grim), Estate (MO), Sector (NF–IS), Deck (NF–IS), Ring (NF–IS), Level (NF–IS) |
| `districtFixed` | Old Town ×2, New Town, High Town, Lower Town, Below the Wall (grim), Outer Town, Inner City (chinese), Citadel Ward, Castle Town (japanese), Temple Town (japanese, indian), Post Town (japanese), Trading Town (slavic), Free Settlement (slavic), Strangers' Quarter (west-african, general), Golden Camp (steppe), Floating Gardens (aztec), Workers' Village (egyptian), City of the Dead (egyptian; grim), Royal Enclosure (bantu), Palace Compound (ethiopian), Cantonment (ST; indian, british) |

---

## 6. Kinds and sizes

### 6.1 Sizes

| Key | Label (AN–MO) | Label (NF–IS) |
|---|---|---|
| `village` | village | outpost |
| `town` | town | colony |
| `city` | city | station |
| `great` | great city | megacity |

### 6.2 Kinds by size (kind Any weights)

| Kind | Description | village | town | city | great |
|---|---|--:|--:|--:|--:|
| `streets` | Streets, lanes and alleys | 85 | 65 | 55 | 50 |
| `squares` | Squares, markets and market places | 15 | 20 | 15 | 15 |
| `districts` | Districts, quarters and wards | 0 | 15 | 30 | 35 |

A village has no districts: the districts kind isn't offered for it.

### 6.3 Size effects on streets

| Shape group | village | town | city | great |
|---|--:|--:|--:|--:|
| `mainStreet` | ×1 | ×1 | ×0.5 | ×0.3 |
| trade shapes | ×0.3 | ×1 | ×1.5 | ×1.5 |
| planned shapes (ST on) | ×0.2 | ×1 | ×1.5 | ×2 |
| alley shapes | ×0.5 | ×1 | ×1.5 | ×2 |

---

## 7. District functions

### 7.1 Line-up

| Key | Menu | Weight (any) | Sizes |
|---|---|--:|---|
| `commercial` | Commercial | 15 | town on |
| `craft` | Craft | 15 | town on |
| `religious` | Religious | 10 | town on |
| `rule` | Rule and government | 8 | city on |
| `learning` | Learning | 5 | city on |
| `foreign` | Foreign | 8 | city on |
| `military` | Military | 7 | town on |
| `industrial` | Industrial | 10 (ST–MO ×3) | town on |
| `poor` | Poor and marginal | 10 | town on |
| `elite` | Elite | 7 | city on |

### 7.2 District shapes

Weights within the function. `{dw}` = `districtWord`.

| Function | Shape | Weight | Eras | Cultures | Tone | Example |
|---|---|--:|---|---|---|---|
| commercial | `{streetGoods} Market {dw}` | 20 | all | all | – | Spice Market Quarter |
| commercial | `Merchants' {dw}` | 20 | all | all | plain | Merchants' Quarter |
| commercial | `Dock {dw}` / `Warehouse {dw}` | 15 | all | all | plain | Dock Ward |
| commercial | `Exchange {dw}` | 10 | EM on | all | – | Exchange District |
| craft | `{trade:poss} {dw}` | 40 | all | all except indian, west-african | – | Weavers' Quarter |
| craft | `{trade:poss} End` / `{trade:poss} Row` | 20 | MD on | british | plain | Tanners' End |
| craft | `{streetGoods} {dw}` | 25 | all | indian, west-african (caste rule) | – | Cloth Ward |
| religious | `Temple {dw}` / `Pilgrims' {dw}` | 30 | all | all | – | Pilgrims' Quarter |
| religious | `{holy:poss} Close` / `Abbey {dw}` / `Minster {dw}` | 20 | MD on | christian | grand | Saint Osyth's Close |
| religious | `Shrine {dw}` / `{holySite} {dw}` | 15 | all | all | strange | Holy Well Ward |
| rule | `Palace {dw}` / `Citadel {dw}` / `Court {dw}` | 40 | all | all | grand | Palace Quarter |
| learning | `Scholars' {dw}` / `College {dw}` / `Library {dw}` | 40 | all | all | – | Scholars' Quarter |
| foreign | `{people} {dw}` | 30 | all | all | – | High Folk Quarter |
| foreign | `Merchant Nations' {dw}` / `Embassy Row` (ST on) | 15 | all | all | – | Merchant Nations' Ward |
| military | `Barracks {dw}` / `Armoury {dw}` / `Garrison {dw}` | 40 | all | all | plain | Barracks Quarter |
| industrial | `Mill {dw}` / `Foundry {dw}` / `Kiln End` / `Tannery Side` | 40 | all | all | plain | Foundry District |
| poor | `Poor {dw}` / `Rookery` (ST) / `Outer Town` / `Ruined {dw}` / `Cemetery {dw}` | 40 | all | all | grim | Cemetery Ward |
| elite | `High Town` / `Garden {dw}` / `Hill {dw}` / `{surname} Crescent` (ST on) | 40 | all | all | grand | Garden Quarter |
| any | `districtFixed` entries for the function: Old Town, New Town (commercial); Castle Town, Citadel Ward (rule); Temple Town (religious); Strangers' Quarter (foreign); Below the Wall, Outer Town (poor); High Town (elite); Cantonment (military) | 20 | as tagged | as tagged | – | |

### 7.3 Culture districts (WR §5.3)

Added to the matching functions at weight 20. All English.

| Culture | Function | Shapes |
|---|---|---|
| arabic-persian | commercial | `{trade} Market Lanes` (Coppersmiths' Market Lanes), Covered Market Quarter |
| arabic-persian | rule / poor | Citadel (fixed) / Outer Town (fixed) |
| chinese | any | `{directionAdj} Ward`, `{ordinal} Ward`, Inner City, Outer City |
| japanese | rule / commercial / religious | Castle Town, Retainers' Quarter / Merchants' Town / Temple Town |
| korean | any | `{direction} Village`, Palace Ward |
| indian | commercial / religious | `{streetGoods} Market Ward` / River Steps Quarter |
| slavic | rule / commercial / craft | Citadel / Trading Town, Free Settlement / `{trade:poss} End` |
| roman | any | `{ordinalWord} Region`, Forum Quarter, `{hill} Hill` (hill: Oak, Laurel, Cattle, Palace, Willow) |
| greek-byzantine | rule / commercial | High Town / Harbour Quarter, Market Square Quarter |
| egyptian | religious / poor | Temple Precinct / Workers' Village, City of the Dead |
| ethiopian | rule / religious | Palace Compound / Church Compound |
| bantu | rule | Royal Enclosure, Valley Town |
| west-african | foreign / commercial | Strangers' Quarter / Market Ward, `{weekday} Market Ward` |
| aztec | any | `{directionAdj} Ward`, Merchants' Ward, Floating Gardens |
| maya | any | `{directionAdj} Plaza Group`, Ball Court Quarter |
| steppe | any | Golden Camp, Left Wing, Right Wing, Horse Lines |
| norse | commercial | Harbour, Assembly Field |
| polynesian | any | Canoe Houses, Meeting Ground (civic sense only) |
| andean | any | `{directionAdj} Quarter`, Terrace Quarter |

**Steampunk** (`h: true`, ST): Engine Quarter, Brass Quarter, Aether Works, Clockmakers' Row, Smog End (grim), Glass Arcade, Exhibition Quarter, Airship Docks, Gaslight District.
**Sci-fi** (NF–IS): `Deck {n}`, `{ordinal} Ring`, Spinward Sector, Antispinward Sector, `Hab Block {greek}`, Undercity, Upper Spire, Hydroponics Ring, Dock Spine, Reactor Sector (grim), Old Dome. These replace the historical function shapes in NF–IS at 60%.

---

## 8. Streets and squares: shapes

### 8.1 Streets

`{sw}` = `streetWord`; `{aw}` = `alleyWord` (dialect rules in §9).

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `{component} {sw}` | 25 | all | all | – | Mill Lane, Well Street |
| `{trade:poss} {sw}` | 10 | MD on | all except indian, west-african | – | Butchers' Row |
| `{tradeSg} Street` | 6 | MD on | british, general | plain | Cooper Street |
| `{mainStreet}` (fixed) | 6 | all | as tagged | – | High Street |
| `{direction} {sw}` | 6 | all | all | plain | North Street |
| `{direction}gate` | 4 | MD–EM | anglo-saxon, norse, norman-british (r: NTH EMD ×3) | – | Westgate |
| `{destination} Road` | 8 | all | all | plain | Fenwick Road |
| `{route}` | 4 | all | all | – | Salt Way |
| `{holy:poss} {sw}` | 4 | MD on | christian | – | Saint Anne's Lane |
| `{streetGoods} {sw}` | 8 | all | all | plain | Silver Street, Corn Street |
| `Old {component} {sw}` | 4 | EM on | all | – | Old Mill Lane |
| `{streetFigure:poss} {sw}` | 4 | MD on | all | – | King's Street, Bishop's Lane |
| `{streetFigure} {sw}` | 3 | EM on | british, general | – | King Street |
| `{component} {aw}` | 6 | all | all | – | Well Alley, Bridge Yard |
| `{trade:poss} {aw}` | 3 | MD on | all except indian, west-african | – | Tanners' Court |
| `{surname} {planned}` | 6 | ST on | british, general | plain | Harrow Terrace |
| `{streetTree} {planned}` | 5 | ST on | british, general | light | Laburnum Grove |
| `{commemorative} {sw}` | 5 | ST–MO | all | – | Jubilee Street, Station Road |
| `{royal} {sw}` / `{royal} {planned}` | 3 | ST–MO | british, general | grand | [royal] Street |
| `streetFixed` | 6 | as tagged | as tagged | – | Back Lane, Shambles |
| `streetSteampunk` | 15 | ST (`h: true`) | all | – | Lamplight Row |

### 8.2 Culture streets (WR §3.3)

Added at weight 15 each; English output.

| Culture | Shapes | Examples |
|---|---|---|
| norse | `{trade:poss} Street`, `{component} Street` (Gate as `{sw}` at ×3) | Coopers' Street |
| roman | `Street of the {people}`, `{trade:poss} Street`, `Long Street`, `Sacred Way` (fixed) | Street of the High Folk, Sandal-Makers' Street |
| greek-byzantine | `Middle Street`, `Colonnade of {streetFigure}` | Middle Street |
| arabic-persian | `Market of the {trade}`, `Lane of the {component}` | Market of the Coppersmiths, Lane of the Fountain |
| chinese | `{trade} Street` (no possessive), `{streetTree} Lane`, `{direction} Gate Street`, `{ordinal} Lane` | Silk Street, Willow Lane, East Gate Street |
| japanese | `{trade:poss} Ward Street`, `{ordinalWord} Block`, `{holySite} Street` | Dyers' Ward Street, Third Block |
| korean | `{streetGoods} Street`, `{direction} Gate Road`, Bell Street (fixed) | Paper Street |
| indian | `{streetGoods} Market`, `{component} Lane`, `Gated Lane of the {component}` | Cloth Market, Temple Lane |
| slavic | `{trade:poss} End`, `{destination} Road` ×2 | Potters' End |
| west-african | `{streetGoods} Market`, `Strangers' Road` (fixed) | Kola Market |
| aztec | `{destination} Causeway Street`, `{directionAdj} Ward Street` | Northern Ward Street |
| maya | `White Road to the {component}` | White Road to the Temple |
| egyptian | `Road of the {component}`, `{god:poss} Way` | Road of the Granary |
| polynesian | `{component} Path` | Spring Path |

**Sci-fi streets** (NF–IS; replace the historical shapes at 70%): `{ordinal} Corridor`, `Deck {n} Concourse`, `Spine {greek}`, `Ring Road` (fixed), `{directionAdj} Promenade`, `Spinward Walk` (fixed), `Hydroponics Row` (fixed), `Reactor Lane` (grim, fixed), `Gravity Street` (light, fixed), `{star} Promenade`.

`{n}` is 1–40 for decks.

### 8.3 Squares and markets

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `squareFixed` | 20 | as tagged | as tagged | – | Market Square, Caravan Court |
| `{streetGoods} {marketWord}` | 20 | all | all | plain | Corn Market, Butter Market |
| `{weekday} Market` | 10 | MD on | british, slavic; west-african ×3 | plain | Saturday Market |
| `{ordinalWord}-Day Market` | 10 | MD–ST | japanese | – | Fourth-Day Market |
| `{component} {squareWord}` | 15 | all | all | – | Well Square, Bridge Place |
| `{streetFigure:poss} {squareWord}` | 8 | MD on | all | grand | Queen's Square |
| `{holy:poss} {squareWord}` | 5 | MD on | christian | – | Saint Ivo's Square |
| `{commemorative} {squareWord}` | 8 | ST–MO | all | – | Victory Square |
| `Forum of {founder}` | 8 | AN | roman | grand | Forum of [founder] |
| `{streetGoods} Forum` | 5 | AN | roman | – | Cattle Forum |
| `{directionAdj} {marketWord}` | 6 | all | chinese, aztec, maya | – | Eastern Market |
| `{star} Plaza` / `Concourse {greek}` | 15 | NF–IS | all | – | Vega Plaza |

`{ordinalWord}-Day` uses First–Ninth only.

---

## 9. Dialect words

For the British cultures only.

- **Which words:** `alleyDialect` entries whose `r` includes the chosen region. With all of Britain, any entry may be drawn, weighted by how many regions it has.
- **Where:** shapes using `{aw}`. In NTH, SBL and SLO, `Wynd`, `Vennel`, `Chare` and `Close` can also replace `Lane` in `{component} Lane` at 20%.
- **Dialect setting:**

| Setting | Output | Example |
|---|---|---|
| plain words only | the plain word | Tanners' Alley |
| as variants | the plain word, then the dialect form in brackets | Tanners' Alley (Tanners' Wynd) |
| instead | the dialect form | Tanners' Wynd |

- With "as variants", a name with no dialect word is shown plain. At most 40% of a batch carries a variant, so batches don't read as all bracketed.
- `Gate` (Norse *gata*, "street") isn't a dialect variant; it's a street word with its own region weights (§5.2).

---

## 10. Series: as one town

The series link "as one town" makes a batch read like one settlement's names.

**Streets:**
1. The first name is a `mainStreet` entry for the culture (or `{mainStreet}` equivalent: *Middle Street*, *Bell Street*, *Main Street*); in NF–IS, *Ring Road*.
2. Later names never repeat a component, trade, good, direction or destination.
3. Destinations (`{destination}`) are drawn from one pool of 6 towns made at the start, so roads point to the same neighbours.
4. At most one `{route}` per batch; if the batch is 8 or more, exactly one.
5. Dialect variants (if on) keep to one region's words.

**Squares:** the first is the culture's main market fixed entry (*Market Square*, *Market Place*, *Great Market*, *Caravan Court*, *Hub*); no good or component repeats.

**Districts:** functions are drawn without repeats until every function offered for the size has been used once; *Old Town* (or the culture equivalent) is first for towns and cities.

**Kind Any:** a mix in the size's proportions, each kind following its own rules above.

---

## 11. Rendering

- GN §11: capitals, plurals, OUP possessives (*Butchers' Row*, *Woolmen's Lane*, *Saint Anne's Lane*).
- `{direction}gate` is one word, lower-case "gate": *Westgate*.
- `{ordinalWord}-Day Market`: hyphen, capitalised: *Fourth-Day Market*.
- A leading "the" is never added to streets or squares; districts drop "the" too (*Strangers' Quarter*, not *the Strangers' Quarter*).
- Cap: 6 words, plus a bracketed variant.

---

## 12. Tone

TS §2 applies; tags in §5, §7 and §8. Sensitive cultures (RN §12.4) never draw light or grim tagged entries.

---

## 13. Safeguards

### 13.1 Block list

Whole-name matches (case-insensitive) are redrawn; the bracketed variant is checked too.

- **Real streets:** Wall Street, Downing Street, Whitehall, Fleet Street, Threadneedle Street, Lombard Street, Pall Mall, Park Lane, Oxford Street, Regent Street, Bond Street, Carnaby Street, Coronation Street, Abbey Road (as a whole name: flag, §13.2), Pudding Lane, Cheapside, Grub Street, Bourbon Street, Broadway, Champs-Élysées, Nevsky Prospect, Unter den Linden, Royal Mile, Princes Street, Grafton Street, Sauchiehall Street, Ginza, Gion, Pontochō, Chandni Chowk, Jongno, Wangfujing.
- **Real districts and squares:** Shambles (as "The Shambles"; bare allowed), Coppergate, Forbidden City, Imperial City, Kremlin, Red Square, Tiananmen, Trafalgar Square, Piccadilly Circus, Times Square, Grand Bazaar, Medina of Fez, Old City of Jerusalem, Latin Quarter, Jewish Quarter, Armenian Quarter, Christian Quarter, Muslim Quarter, Soho, Montmartre, Harlem, Chinatown, Little Italy, Barrio, Bowery, Five Points.
- **Fiction:** Diagon Alley, Knockturn Alley, Privet Drive, Spinner's End, Baker Street 221B, Ramsay Street, Albert Square, Wisteria Lane, Elm Street (as "Elm Street"; flag), Sesame Street, Coronation Street, Hob's Lane, the Shades, Night City, Midgar, Flea Bottom, Street of Steel, Street of Silk, Street of the Sisters, Hill of Rhaenys.

### 13.2 Flag list

Allowed by default (`flagListBlocks: false`): High Street, Main Street, Market Street, Market Square, Market Place, Mill Lane, Church Street, Station Road, Back Lane, Water Lane, Love Lane, Baker Street, Abbey Road, Elm Street, King Street, Queen Street, Broad Street, Old Town, New Town, Westgate, Eastgate, Northgate, Southgate.

### 13.3 Living religions

WR §10.1. Faith components for non-christian cultures use generic words (Temple, Shrine, Sanctuary, Monastery, Holy Well). No *Mosque*, *Synagogue*, *Gurdwara* or *Pagoda*. Christian words (Church, Chapel, Abbey, Minster, Friar) only for christian cultures.

### 13.4 Caste

indian and west-african: no `{trade}`/`{tradeSg}` in streets, squares or districts (§7.2, §8.1, §8.2); goods are used instead.

### 13.5 Banned words

GN §12.3 and RN §12.5, plus: Ghetto, Native Quarter, Native Town, Black Town, White Town, Slum, Reservation, Leper (WR §18.6).

### 13.6 Safeguard packs

The `type: settlement-safeguards` packs from RN §12.6 apply here too.

---

## 14. Presets

```yaml
---
type: module-preset
module: street-names
packName: Northern market town
culture: norman-british
region: NTH
kind: any
function: any
era: EM
fantastic: false
size: town
dialect: variants
tone: any
people: invented
series: true
---

Norman & British streets, squares and districts of the early modern era, in a realistic world, in the North, for a town, with dialect words as variants, of any tone, with invented people and places, as one town.
```

| Key | Values | Default |
|---|---|---|
| `culture`, `region`, `era`, `fantastic` | as RN §13 | as there |
| `kind` | `any`, `streets`, `squares`, `districts` | `any` |
| `function` | `any` or a function key | `any` |
| `size` | `village`, `town`, `city`, `great` | `town` |
| `dialect` | `plain`, `variants`, `instead` | `variants` |
| `tone`, `people`, `series` | as TS §6.2 | as there |

Unknown values are reported and defaulted. `kind: districts` with `size: village` runs as streets and reports `A village has no districts.`

---

## 15. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Vocabulary.** The region tag and pack heading form (§3), the new pools (§5), register rows | §16.1 passes; RN tests still pass |
| M2 | **Engine.** Kinds, sizes, functions, shapes, culture shapes, dialect, one-town series, safeguards | §16.2–§16.7 pass |
| M3 | **Module.** Section, sentence, history, presets | §16.8 passes; the module generates in the app |

---

## 16. Tests (`tests/streetNames.test.ts`)

### 16.1 Vocabulary

- Every new pool entry is valid (RN §15.1 rules); `r` codes are real region codes.
- A vocabulary pack section `## alleyDialect · SBL` adds only for SBL.

### 16.2 Coverage and determinism

- Same options and seed give the same names.
- Every culture × era × kind offered × size × dialect × people: 20 unique names within the cap.

### 16.3 Sizes and functions

- Village: no district is ever produced; districts isn't offered.
- City, districts, 2,000 names: every function offered appears.
- Rule, learning, foreign and elite never appear for a town.

### 16.4 Dialect

- SEA, "instead": alley names use Twitten and no other dialect word.
- "As variants": at most 40% of a 20-name batch has a bracket; every bracket's word is valid for the region.
- Non-British culture: no dialect words.

### 16.5 Culture and caste

- indian and west-african, 5,000 names: no `streetTrades` word.
- japanese squares: `Fourth-Day Market`-style names appear; chinese streets: trade names have no possessive.
- MD, 2,000 names: no `planned`, `commemorative` or sci-fi shape.
- NF–IS: at least 70% of streets are sci-fi shapes.

### 16.6 One-town series

- Streets, series of 10: the first is a `mainStreet`; no component, trade, good, direction or destination repeats; exactly one `{route}`; destinations come from 6 towns or fewer.
- Districts, city, series of 10: no function repeats before all are used; the first is Old Town or the culture equivalent.

### 16.7 Safeguards

- 5,000 names per culture: 0 block-list matches (including variants), 0 banned words.
- No faith word of a living religion; christian words only for christian cultures.

### 16.8 Sentence and presets

- Default plain text: "Norman & British streets, squares and districts of the medieval era, in a realistic world, across all of Britain, for a town, with dialect words as variants, of any tone, with placeholders for people and places, each one separate."
- Function link only with districts; dialect link hidden for japanese; size labels change in NF–IS.
- Preset round-trip; districts with village reports and runs as streets.

---

## 17. Parked

- **Buildings and landmarks** module (WR §13), reading the component pools.
- **Inns, taverns and houses of hospitality** (WR §11), reading streets, squares and routes (*Inn of the West Gate*).
- **Settlement kit:** one press for a whole town (a name, its districts, streets, squares, inns, watch, guild and gang), built from the one-town series and presets.
- Streets named after a world's own people and places (linking to a vault's notes).
- House numbers and addresses.
- More dialect words (Welsh, Scots Gaelic and Irish street words in English form) through vocabulary packs and a later research pass.
