# Sibling distinctness: overlap by pair and module

Measured by tests/distinctness.test.ts as fixed on 18 November 2026: every module at the plugin's own default state (the states behind lens-offers.json, `probeSpecs()`), only the culture changed, seeds 1 to 5, twelve names, for every culture the module offers; the figure is the share of A's names that B also gives at the same seed, before → after the fixes of 18 November (`n/m`: not measured before: the earlier snapshot had no state for it). Excluded modules (deferred styles, and deserts) are not in the table. A dash is a module the pair does not both offer. Limits: 25% between siblings, 30% against General. 1092 pair-and-module cells are measured; 0 are over their limit. Read with docs/second-tier-tables-brief.md §10.

## Sibling pairs

| module | spanish/portuguese | greek/byzantine | welsh/scottish | scottish/irish | welsh/irish | welsh/cornish | scottish/cornish | irish/cornish | norse/scandinavian | anglo-saxon/norman-british |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| routeNames | 8→8 | 8→8 | 3→2 | 5→5 | 13→2 | 12→5 | 5→2 | 10→2 | 22→22 | 20→20 |
| sacredPlaces | 10→10 | 5→5 | 3→2 | 18→18 | 23→13 | 8→5 | 8→8 | 8→5 | 2→2 | 0→0 |
| streetNames | 30→15 | 28→12 | 12→2 | 15→13 | 20→3 | 15→5 | 13→2 | 17→2 | 2→2 | 5→3 |
| innNames | 50→20 | 48→20 | 17→12 | 17→20 | 25→17 | 38→18 | 17→10 | 23→12 | 3→3 | 22→22 |
| buildingNames | 32→25 | 15→15 | 10→0 | 10→10 | 23→2 | 33→5 | 10→0 | 23→0 | 2→2 | 0→0 |
| monumentNames | 35→18 | 28→15 | 23→0 | 23→8 | 28→2 | 27→3 | 22→0 | 23→0 | 18→7 | 13→3 |
| seasLakes | 3→3 | 5→5 | 8→2 | 8→8 | 5→2 | 8→18 | 7→2 | 3→2 | 7→7 | 3→3 |
| coastsIslands | 0→0 | 5→5 | 3→2 | 3→3 | 13→2 | 8→8 | 5→2 | 10→5 | 20→20 | 2→2 |
| seaCharts | 0→0 | 5→5 | 3→0 | 3→3 | 2→0 | 12→17 | 3→0 | 3→0 | 5→5 | 2→2 |
| mountainNames | 7→7 | 12→12 | 8→2 | 12→12 | 7→2 | 5→2 | 10→3 | 13→2 | 3→3 | 0→0 |
| forestNames | 7→7 | 7→7 | 5→2 | 12→12 | 5→2 | 7→5 | 13→2 | 10→2 | 5→5 | 0→0 |
| moorNames | 7→7 | 7→7 | 7→2 | 13→13 | 8→2 | 18→18 | 15→7 | 7→2 | 3→3 | 2→2 |
| wetlandNames | 5→5 | 3→3 | 7→2 | 5→5 | 22→5 | 5→2 | 10→5 | 5→2 | 2→2 | 2→2 |
| grasslandNames | 12→12 | 13→13 | 10→3 | 3→3 | 3→2 | 15→12 | 8→3 | 2→2 | 3→3 | 2→2 |
| lands | 7→7 | 7→7 | 12→8 | 3→3 | 3→2 | 10→7 | 10→5 | 3→0 | 7→7 | 7→7 |
| farmland | 3→3 | 2→2 | 5→0 | 7→7 | 7→0 | 12→5 | 5→0 | 7→0 | 2→2 | 2→2 |
| hillsValleys | 3→3 | 7→7 | 12→2 | 3→3 | 7→2 | 17→13 | 10→3 | 7→2 | 0→0 | 2→2 |
| riversInland | 8→8 | 7→7 | 10→2 | 8→8 | 8→2 | 10→7 | 10→2 | 7→2 | 0→0 | 0→0 |
| eventNames | 2→2 | 2→2 | 2→2 | 2→2 | 0→0 | 0→0 | 0→0 | 2→0 | 2→2 | 2→2 |
| moneyNames | 0→0 | 3→3 | 0→0 | 5→5 | 0→0 | 2→0 | 0→0 | 2→0 | 3→3 | 0→0 |
| armsNames | 0→0 | 0→0 | 3→7 | 5→5 | 5→12 | 7→7 | 0→2 | 7→5 | 10→10 | 3→3 |
| treasureNames | 0→0 | 0→0 | 3→3 | 3→3 | 2→2 | 2→0 | 2→0 | 0→2 | 3→3 | 2→2 |
| bookNames | 0→0 | 0→0 | 0→0 | 2→2 | 0→0 | 0→2 | 2→2 | 2→0 | 2→2 | 0→0 |
| deityNames | 22→22 | 18→18 | 25→25 | 20→20 | 20→20 | 20→20 | 20→20 | 20→20 | 5→5 | 17→17 |
| calendarNames | 12→12 | 8→8 | 3→3 | 2→2 | 3→3 | 0→0 | 7→8 | 2→3 | 7→7 | 10→10 |
| skyNames | 22→22 | 23→23 | 5→3 | 3→3 | 3→2 | 2→0 | 0→3 | 5→7 | 3→3 | 3→3 |
| peoplesTongues | 0→0 | 0→0 | 2→2 | 2→2 | 0→0 | 0→0 | 0→0 | 0→0 | 2→2 | 0→0 |
| mysticOrders | - | - | 3→2 | 0→0 | 0→0 | 0→0 | 2→0 | 2→0 | 3→3 | 2→0 |
| martialOrders | - | - | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 2→0 | 3→3 | 2→0 |
| underworldGroups | - | - | 2→2 | 2→2 | 0→0 | 0→0 | 0→0 | 3→2 | 3→3 | 2→3 |
| tradeGuilds | - | - | 2→2 | 0→0 | 0→0 | 0→0 | 2→0 | 2→0 | 5→5 | 2→0 |
| adventureCompanies | - | - | 2→2 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 5→5 | 2→0 |
| powerFactions | - | - | 2→2 | 0→0 | 0→0 | 0→2 | 0→0 | 2→0 | 3→3 | 2→0 |
| supernaturalCourts | - | - | 2→2 | 0→0 | 0→0 | 0→0 | 2→2 | 3→2 | 7→7 | 2→0 |
| epithets | 13→13 | 18→18 | 3→7 | 8→8 | 12→10 | 8→10 | 3→3 | 7→8 | 7→7 | 8→8 |
| familyNames | 5→5 | 3→3 | 5→10 | 7→7 | 0→3 | 3→7 | 2→2 | 10→10 | 2→2 | 5→5 |
| titles | 5→5 | 7→7 | 3→2 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 2→2 |
| ships | 0→0 | 8→8 | 5→3 | 3→3 | 5→5 | 0→2 | 2→0 | 2→0 | 8→8 | 3→3 |
| aircraft | 2→2 | 10→10 | 7→5 | 5→5 | 15→13 | 3→5 | 3→2 | 3→2 | 10→10 | 3→3 |
| landVehicles | 2→2 | 10→10 | 7→7 | 3→3 | 5→5 | 3→3 | 3→5 | 8→7 | 7→7 | 2→2 |
| realms | 0→0 | 0→0 | 2→2 | 2→2 | 2→0 | 0→0 | 2→3 | 0→0 | 0→0 | 0→0 |

## Each core-depth culture against General

| module | norman-british | anglo-saxon | welsh | scottish | irish | cornish | norse | scandinavian | german | french | dutch | italian | spanish | portuguese | roman | greek | byzantine | slavic |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| routeNames | 10→10 | 2→2 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 8→8 | 13→13 | 18→18 | 18→18 | 0→0 | 3→3 | 12→12 | 0→0 | 0→0 | 3→3 |
| sacredPlaces | 2→2 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 3→3 | 0→0 | 3→3 | 2→2 | 3→3 | 2→2 | 0→0 | 0→0 | 2→2 | 0→0 | 0→0 | 2→2 |
| streetNames | 10→10 | 0→0 | 3→2 | 5→3 | 3→3 | 3→2 | 5→5 | 3→3 | 12→12 | 8→8 | 8→8 | 8→8 | 2→2 | 2→2 | 7→7 | 2→2 | 2→2 | 10→10 |
| innNames | 13→13 | 10→10 | 5→5 | 5→5 | 5→5 | 5→5 | 3→3 | 0→0 | 10→10 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 8→8 | 0→0 | 0→0 | 5→5 |
| buildingNames | 22→22 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 7→7 | 0→0 | 8→8 | 7→7 | 12→12 | 12→12 | 0→0 | 0→0 | 3→3 | 0→0 | 0→0 | 7→7 |
| monumentNames | 8→8 | 5→0 | 3→0 | 3→0 | 3→0 | 3→0 | 3→3 | 5→0 | 5→5 | 0→0 | 3→3 | 3→3 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 |
| seasLakes | 3→3 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 2→2 | 0→0 | 13→13 | 18→18 | 17→17 | 18→18 | 0→0 | 0→0 | 5→5 | 0→0 | 0→0 | 7→7 |
| coastsIslands | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 2→2 | 10→10 | 13→13 | 12→12 | 0→0 | 0→0 | 12→12 | 0→0 | 0→0 | 8→8 |
| seaCharts | 13→13 | 2→2 | 0→0 | 0→0 | 0→0 | 0→0 | 3→3 | 0→0 | 7→7 | 8→8 | 5→5 | 5→5 | 0→0 | 0→0 | 8→8 | 0→0 | 0→0 | 5→5 |
| mountainNames | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 5→5 | 2→2 | 18→18 | 10→10 | 22→22 | 20→20 | 0→0 | 0→0 | 5→5 | 0→0 | 0→0 | 15→15 |
| forestNames | 10→10 | 0→0 | 0→0 | 2→2 | 0→0 | 0→0 | 7→7 | 2→2 | 17→17 | 15→15 | 28→28 | 27→27 | 0→0 | 0→0 | 5→5 | 0→0 | 0→0 | 23→23 |
| moorNames | 2→2 | 2→2 | 0→0 | 0→0 | 0→0 | 0→0 | 8→8 | 0→0 | 25→25 | 22→22 | 22→22 | 18→18 | 0→0 | 0→0 | 13→13 | 0→0 | 0→0 | 17→17 |
| wetlandNames | 2→2 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 5→5 | 2→2 | 3→3 | 27→27 | 22→22 | 27→27 | 0→0 | 0→0 | 7→7 | 0→0 | 0→0 | 20→20 |
| grasslandNames | 2→2 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 5→5 | 0→0 | 12→12 | 28→28 | 30→30 | 28→28 | 2→2 | 2→2 | 7→7 | 0→0 | 0→0 | 12→12 |
| lands | 5→5 | 2→2 | 0→0 | 0→0 | 0→0 | 3→0 | 5→5 | 0→0 | 0→0 | 8→8 | 8→8 | 7→7 | 0→0 | 0→0 | 5→5 | 0→0 | 0→0 | 7→7 |
| farmland | 5→5 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 2→2 | 0→0 | 3→3 | 2→2 | 7→7 | 7→7 | 0→0 | 0→0 | 2→2 | 0→0 | 0→0 | 2→2 |
| hillsValleys | 7→7 | 0→0 | 0→0 | 0→0 | 0→0 | 2→0 | 8→8 | 0→0 | 10→10 | 7→7 | 7→7 | 10→10 | 0→0 | 0→0 | 8→8 | 0→0 | 0→0 | 3→3 |
| riversInland | 2→2 | 0→0 | 2→0 | 2→2 | 0→0 | 0→0 | 12→12 | 0→0 | 10→10 | 13→13 | 17→17 | 15→15 | 0→0 | 0→0 | 13→13 | 0→0 | 0→0 | 10→10 |
| eventNames | 18→18 | 0→0 | 12→3 | 8→8 | 2→2 | 8→2 | 10→10 | 7→7 | 17→17 | 17→17 | 20→20 | 22→22 | 3→3 | 7→7 | 3→3 | 0→0 | 2→2 | 10→10 |
| moneyNames | 3→3 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 5→5 | 12→12 | 3→3 | 3→3 | 17→17 | 0→0 | 2→2 | 2→2 | 0→0 | 0→0 | 0→0 |
| armsNames | 2→2 | 0→0 | 0→0 | 3→3 | 0→0 | 0→0 | 3→3 | 0→0 | 13→13 | 12→12 | 13→13 | 12→12 | 3→3 | 2→2 | 0→0 | 2→2 | 0→0 | 2→2 |
| treasureNames | 2→2 | 0→0 | 2→2 | 2→2 | 0→0 | 0→0 | 3→3 | 2→2 | 8→8 | 8→8 | 7→7 | 8→8 | 2→2 | 0→0 | 2→2 | 2→2 | 0→0 | 2→2 |
| bookNames | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 2→0 | 2→2 | 0→0 | 5→5 | 3→3 | 2→2 | 2→2 | 0→0 | 2→2 | 2→2 | 0→0 | 0→0 | 0→0 |
| deityNames | 18→18 | 8→8 | 7→5 | 5→5 | 3→3 | 5→5 | 5→5 | 8→8 | 25→25 | 15→15 | 23→23 | 20→20 | 8→8 | 8→8 | 15→15 | 8→8 | 8→8 | 18→18 |
| calendarNames | 17→17 | 0→0 | 3→3 | 0→0 | 2→2 | 2→0 | 2→2 | 8→8 | 15→15 | 17→17 | 17→17 | 17→17 | 2→2 | 3→3 | 3→3 | 2→2 | 0→0 | 3→3 |
| skyNames | 27→27 | 5→5 | 5→0 | 10→10 | 13→13 | 7→3 | 7→7 | 7→7 | 23→23 | 27→27 | 28→28 | 27→27 | 22→22 | 20→20 | 7→7 | 0→0 | 3→3 | 13→13 |
| peoplesTongues | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 7→7 | 13→13 | 7→7 | 13→13 | 0→0 | 2→2 | 2→2 | 0→0 | 0→0 | 0→0 |
| mysticOrders | 100→10 | 2→2 | 5→2 | 12→12 | 3→3 | 5→2 | 10→10 | 13→13 | 10→10 | - | 8→8 | 17→17 | - | - | 17→17 | - | - | - |
| martialOrders | 100→8 | 2→2 | 2→2 | 7→7 | 2→2 | 3→0 | 5→5 | 8→8 | 13→13 | - | 10→10 | 12→12 | - | - | 10→10 | - | - | - |
| underworldGroups | 100→10 | 2→2 | 5→3 | 13→13 | 5→5 | 5→2 | 5→5 | 10→10 | 12→12 | - | 10→10 | 18→18 | - | - | 17→17 | - | - | - |
| tradeGuilds | 100→8 | 2→2 | 3→0 | 13→13 | 7→7 | 5→2 | 30→30 | 13→13 | 25→25 | - | 27→27 | 27→27 | - | - | 27→27 | - | - | - |
| adventureCompanies | 100→12 | 2→2 | 3→0 | 7→7 | 3→3 | 0→2 | 28→28 | 7→7 | 22→22 | - | 27→27 | 27→27 | - | - | 27→27 | - | - | - |
| powerFactions | 100→7 | 2→2 | 3→5 | 8→8 | 7→7 | 2→2 | 23→23 | 3→3 | 18→18 | - | 25→25 | 28→28 | - | - | 28→28 | - | - | - |
| supernaturalCourts | 100→12 | 2→2 | 7→3 | 7→7 | 7→7 | 10→2 | 27→27 | 8→8 | 27→27 | - | 23→23 | 27→27 | - | - | 27→27 | - | - | - |
| epithets | 8→8 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 |
| familyNames | 3→3 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 |
| titles | 8→8 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 |
| ships | 7→7 | 2→2 | 2→2 | 5→5 | 0→0 | 0→0 | 3→3 | 2→2 | 18→18 | 3→3 | 3→3 | 10→10 | 2→2 | 0→0 | 2→2 | 0→0 | 2→2 | 5→5 |
| aircraft | 7→7 | 0→0 | 2→2 | 3→3 | 0→0 | 3→0 | 8→8 | 2→2 | 27→27 | 13→13 | 8→8 | 30→30 | 0→0 | 0→0 | 12→12 | 0→0 | 0→0 | 7→7 |
| landVehicles | 12→12 | 0→0 | 2→0 | 0→0 | 0→0 | 2→0 | 5→5 | 0→0 | 28→28 | 7→7 | 13→13 | 27→27 | 0→0 | 2→2 | 5→5 | 0→0 | 0→0 | 10→10 |
| realms | 13→13 | 0→0 | 5→2 | 5→5 | 3→3 | 0→0 | 8→8 | 2→2 | 17→17 | 22→22 | 27→27 | 22→22 | 0→0 | 0→0 | 10→10 | 0→0 | 0→0 | 12→12 |

## Batch 6b (18 November 2026)

The seven new sibling pairs and the eight new core-depth cultures, measured as the rest of this document is: every offered module at the plugin's own default state, seeds 1 to 5, twelve names each, the share of A's names that B also gives at the same seed. The largest overlap over every module the pair is offered in:

| Pair | Limit % | Largest % | Module | Modules measured |
|---|---|---|---|---|
| turkic/mongol | 25 | 23 | skyNames | 34 |
| arabic/persian | 25 | 20 | skyNames | 34 |
| arabic/egyptian | 25 | 8 | ships | 34 |
| persian/egyptian | 25 | 7 | aircraft | 34 |
| ethiopian/bantu | 25 | 13 | monumentNames | 34 |
| ethiopian/west-african | 25 | 20 | epithets | 34 |
| bantu/west-african | 25 | 22 | coastsIslands | 41 |

| Culture against General | Limit % | Largest % | Module |
|---|---|---|---|
| turkic | 30 | 8 | deityNames |
| mongol | 30 | 8 | deityNames |
| arabic | 30 | 3 | deityNames |
| persian | 30 | 3 | deityNames |
| egyptian | 30 | 22 | forestNames |
| ethiopian | 30 | 8 | deityNames |
| bantu | 30 | 10 | deityNames |
| west-african | 30 | 10 | deityNames |

Every pair of core-depth cultures, the new ones included, is at or under the inn limit of 5% in the inns module (tests/distinctness.test.ts).

What brought the first pass under the limits: each sibling names in a frame style of its own (the Turkic by adjective, the Mongol by compound; Arabic generic first, Persian by owner, Egyptian by compound; Ethiopian generic first, Bantu by owner, West African by adjective); each culture of a sibling group turns its 5c and 5d word lists by a step of its own (the order of a list means nothing there, and two siblings drawing the same position of the same list gave the same word); each culture draws its era words from a place of its own in the shared pools; the Bantu and West African tables read their shared legacy table at 3% and 8% (`shares.legacy`); and the word lists of the pairs that shared too much were written again.
