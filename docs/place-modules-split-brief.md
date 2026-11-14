# Place modules split – brief

**Status:** agreed with Kenny, 14 November 2026. Brief 3 of the table overhaul (`shared-lens-and-coverage-brief.md` §10). Builds on brief 2 (`one-sentence-brief.md`, on `main` at `0e28dd0`). Implement in the milestones of §11.

## 1. What changes

The three wide place modules retire into focused ones, and every focused place module learns to name home country, newly explored country and settled lands.

| # | Change | Agreed |
|---|---|---|
| 1 | **native place names**, **exploration into new lands** and **empire expansion** leave the line-up (§9) | All three retire; old presets still run |
| 2 | Five new focused modules (§5) | lands and territories; farmland and countryside; hills and valleys; rivers and inland waters; stars and space |
| 3 | **seas and lakes** becomes **seas and bays**: lakes move to rivers and inland waters (§5.4) | Agreed |
| 4 | Every focused place module gets a three-way **where** link: home, newly explored, settled (§3) | Replaces exploration and expansion |
| 5 | Kinds borrow from the retired engines through **sources** with fixed shares (§4) | The old content is drawn on, not copied or lost |
| 6 | A **class** link: natural, managed, constructed or all (§6) | Kenny's earlier request for the focused modules |
| 7 | The colonial traditions become **cultures** in the shared menu (§7) | Offered only where they have data, by the brief 2 rule |

### 1.1 Hard rules

1. **The retired engines keep their behaviour.** `src/names/` (the British shapes and rendering), `src/world/engine.ts`, `src/colonialShapes.ts`, `src/rivers/engine.ts` and their tables stay as they are. The one allowed change is an **optional filter** (a list of generics or groups to draw from), absent by default, so the sources of §4 can restrict them; with no filter every caller gets exactly what it gets now. Settlement names, the settlement kit, recipe packs and old presets still use these engines, and their output must not change.
2. **Output that must not change:** every module outside the place, wild lands and seas and coasts groups; settlement names; the settlement kit; route names; sacred places; and every saved preset or recipe of the three retired modules.
3. **Output that may change, and only as this brief says:** the six wild lands modules and the three seas and coasts modules (§8). Each change is listed in the milestone's commit.
4. **Stored state keeps working.** Presets, history rows and sentence states keep today's keys. `where: "new"` keeps its meaning; `"settled"` is added. Nothing is migrated and no note is rewritten.
5. **No new culture data.** New words are only the new modules' own shapes (§5.6). Culture, region, era and style tables come in briefs 4 to 7.
6. Follow the existing conventions: Obsidian-free engines and sentence builders, sentences as plain segments through the brief 2 lens clause, one seeded `mulberry32` stream per batch, British English with OUP punctuation in user-facing text (spaced en dashes; colons rather than dashes in label–value text). Common English words only in new shapes: no Gaelic or Welsh loanwords except the region-tagged dialect words already in the data.

## 2. The line-up after

| Group | Modules, in order |
|---|---|
| Place names | lands and territories · farmland and countryside · hills and valleys · rivers and inland waters · route names · sacred places · stars and space |
| Urban | unchanged |
| Seas and coasts | seas and bays · coasts and islands · sea charts · hyperspace charts |
| Wild lands | unchanged: mountains, forests, deserts, moors, wetlands, grasslands |

The five new modules need icons. Kenny supplies them: list the five in the summary, and use the existing place icon until they arrive.

## 3. Where

### 3.1 The link

Every module in the place names group (except route names and sacred places, which are unchanged), the wild lands group and the first three seas and coasts modules has a **where** link, placed as the wild lands sentence has it now (after the era):

| Value | Text | Meaning |
|---|---|---|
| `home` | in home country | a people naming its own land (today's default) |
| `new` | in newly explored country | explorers in wild or thinly peopled land: the old exploration module |
| `settled` | in settled lands | a dominant culture naming or renaming within a peopled land: the old expansion module |

Seas and coasts read "on home shores", "on newly explored shores", "on settled shores". Stars and space reads "in newly explored space" and "in settled space", and has no home (§5.5).

- The biome link shows for `new` and `settled`, as it shows for `new` now.
- The region link shows for `home` only, as now.
- `settled` reads the `where` multipliers in `wilds.json` and `waters.json` from a new `settled` column, set to the same values as `new` except: `mood` 1, `per` 3, `sai` 1.5. (Settled lands are less wondering and more named after people and saints.)

### 3.2 Culture to tradition

For `new` and `settled`, a module's culture chooses a colonial tradition. `settlementLink.cultureToColonial` in `wilds.json` is the one map; its existing entries stay and these are added:

| Culture | Tradition |
|---|---|
| `norse` | `danish` 50, `swedish` 50 |
| `dutch` | `dutch` |
| `french` | `french` |
| `iberian` | `spanish` 50, `portuguese` 50 |
| `american` | `english-speaking-settler` |
| `ottoman` | `ottoman` |
| `german`, `italian`, `phoenician`, `belgian` | the tradition of the same name |

A two-way entry is drawn per name, by weight. A culture with no entry has no colonial source: in `new` and `settled` it uses its module's own shapes only, as the wild lands do now.

## 4. Sources

### 4.1 What a source is

Each kind in a focused place module may list **sources**: an engine it borrows names from, restricted to the generics or groups that fit the kind. Each draw first picks where the name comes from, by these fixed shares (in `lens.json` under `sourceShares`):

| Where | Culture | Source | Share of draws | Rest |
|---|---|---|---|---|
| home | Norman & British, Anglo-Saxon, Celtic (and its views) | `native`: the British shapes engine, with the region | 40% | own shapes |
| new | any culture with a tradition (§3.2) | `colonial`: part 2, that tradition | 50% | own shapes |
| settled | any culture with a tradition | `colonial`: part 2a, that tradition, default context | 60% | own shapes |

- If the source can give nothing for the kind and state (no listed generics, an era it doesn't cover), the draw falls back to own shapes; if a kind has no own shapes, to the source.
- A kind may instead be **delegated** whole to another engine (settlements to settlement names, rivers to the river engine, as the wild lands' settlement kind is now). Delegated kinds ignore the shares.
- The source keeps its own rendering: brackets, generics as plain words, region weights and all. That is how the 12-region tables and the colonial profiles carry over unchanged.
- `people: "invented"` passes through to the source as the module's own shapes take it.
- Series mode draws from own shapes only.

### 4.2 Where it lives

One function in a new `src/places/sources.ts` resolves a kind's draw for every module that uses sources; the wild lands and waters engines call it rather than each carrying a copy. Sources and shares are data: each kind's `sources` entry in its module's table, the shares in `lens.json`.

## 5. The new modules

All five are built on the wild lands engine and table format (`wilds.json` style: `modules`, `kinds`, `shapes`, `cultureShapes`, `regionTags`, `cultureMult`, `eraMult`, `where`), in a new table `src/data/places.json`, with the brief 2 lens clause, the where link, tone, people and series. Each kind lists its class (§6). Generic ids below are those in `place-shapes.json`; group ids are those in `colonial-shapes.json`.

### 5.1 Lands and territories

"‹Norman & British› ‹all› ‹lands and territories of any kind› of the ‹medieval› era, ‹in home country›, in a ‹historic or low fantasy› world, ‹across all of Britain›, ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›". Series: "in one realm". Eras AN–MO.

| Kind | Menu | Class | native generics | colonial groups or generics |
|---|---|---|---|---|
| `country` | Named countrysides (the Weald, the Fens) | natural | – | `new-landscapes`: plain-grassland, desert |
| `shire` | Shires, counties and hundreds | managed | land-holding-share-of-land, folk-group-territory | `land-territory` |
| `march` | Marches and borderlands | managed | boundary, dyke-boundary-earthwork | `frontier-march` |
| `province` | Provinces, colonies and dominions | managed | – | `province-kingdom` |
| `parish` | Parishes, townships and estates | managed | estate-manor-centre, farm-township | – |
| `folk` | Lands of a people | managed | folk-group-territory | – |

Distinct from realms and polities, which name states; this names the land and its divisions.

### 5.2 Farmland and countryside

"…‹fields and farmland of any kind›…". Series: "on one estate". Eras AN–IS.

| Kind | Menu | Class | native generics |
|---|---|---|---|
| `field` | Fields, meadows and pastures | managed | open-country, level-field, hay-meadow, pasture, arable-field, arable-unit, furlong |
| `enclosure` | Folds, closes and orchards | managed | animal-fold, hedged-enclosure, orchard, small-enclosed-field-by-a-house |
| `farm` | Farms and granges | constructed | enclosed-farmstead, home-farm-of-an-estate, outlying-grain-farm, specialised-farm, cattle-farm, monastic-outlying-farm, shieling-summer-pasture-hut |
| `common` | Commons and greens | managed | assembly-field, place-for-games-or-sport |
| `moot` | Moots, gallows and boundary stones | constructed | assembly-mound, speech-place, meeting-place, execution-site |
| `works` | Mills, kilns, quarries and salt works | constructed | mill, kiln, pit-quarry, salt-works, salt-house, fish-weir |
| `settlement` | Hamlets and villages | constructed | delegated to settlement names, sizes hamlet and village |

Colonial source for every kind except settlement: groups `open-and-farmed-land` and `colonial-settlement`.

### 5.3 Hills and valleys

"…‹hill and valley features of any kind›…". Series: "in one vale". Eras AN–IS.

| Kind | Menu | Class | native generics |
|---|---|---|---|
| `hill` | Hills, knolls and mounds | natural | low-level-topped-hill, hill, knoll, rounded-hill-mound, summit-top, wooded-hill |
| `ridge` | Ridges, edges and banks | natural | ridge, back-low-ridge, flat-topped-ridge, heel-shaped-spur, edge-escarpment, steep-slope-bank, slope, upper-end-head |
| `valley` | Valleys, dales and vales | natural | long-valley, dale, broad-valley, short-bowl-shaped-valley, small-enclosed-side-valley, shallow-damp-valley |
| `combe` | Combes, hollows and nooks | natural | hollow, valley-bottom, valley-head, nook, corner-projecting-piece-of-land, corner-angle, bend-crook |
| `ravine` | Ravines and dells | natural | ravine, steep-bank-ravine-side, river-cut-gorge |
| `terrace` | Terraces and lynchets | managed | terrace-lynchet |
| `settlement` | Hill and valley settlements | constructed | delegated to settlement names |

Colonial source: groups `hills-and-slopes`, `valleys`, `hollows-and-corners`. Mountains keeps ranges, peaks, passes, gorges and the high ground; this module is the lowland.

### 5.4 Rivers and inland waters

"…‹rivers and inland waters of any kind›…". Series: "in one river system". Eras AN–IS.

| Kind | Menu | Class | Source |
|---|---|---|---|
| `river` | Rivers | natural | delegated to the river engine (`rivers/engine.ts`): all three of its kinds, its region corpora and forms, `british`, `new-land` or `established` by where |
| `stream` | Streams, brooks and becks | natural | native: clear-stream, sluggish-or-muddy-stream, mountain-stream, stream-with-its-valley |
| `spring` | Springs and wells | natural | native: river-source-spring-head, spring-well, spring-with-roman-association |
| `pool` | Pools and meres | natural | native: pool, mere-shallow-lake, miry-pool-wallowing-place |
| `lake` | Lakes and lochs | natural | native: lake, small-mountain-lake; and the seas and lakes `lake` kind's shapes, moved here |
| `falls` | Waterfalls and rapids | natural | native: waterfall |
| `riverland` | Meadows, bends and eyots | natural | native: land-in-a-river-bend, water-meadow, flood-prone-land-by-a-river, river-mouth, confluence, dry-ground-in-wet-land |
| `cut` | Canals, leats and reservoirs | constructed | own shapes only; leats from MD, canals and reservoirs from ST |

Colonial source for every kind but river: groups `rivers-and-streams`, `springs-pools-and-lakes`, and from `new-landscapes`: creek, dry-riverbed, lagoon.

**Seas and bays.** The seas and lakes module is relabelled "seas and bays"; its section key stays `seasLakes`. Its menu drops the `lake` kind; a preset or state with `kind: lake` still runs exactly as now. History rows labelled "seas and lakes" keep their icon. The wild lands' own stream, river, tarn, pool and lake kinds stay where they are: they are named for their terrain.

### 5.5 Stars and space

"‹General› ‹all› ‹space features of any kind› of the ‹interstellar› era, ‹in newly explored space›, in a ‹science fiction› world, across ‹any scale›, ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›". Series: "in one system". Eras NF and IS only. The scale link is route names' `ScaleChoice`, shown and behaving as it does there.

| Kind | Menu | Class | colonial groups |
|---|---|---|---|
| `world` | Planets, moons and rings | natural | planet-surface, planet-moons, planet-rings |
| `orbit` | Orbits, belts and boundaries | natural | planet-orbits, system-inner, system-belts, system-outer, system-boundaries, system-binaries |
| `star` | Stars and stellar neighbourhoods | natural | neighbourhood-stars, neighbourhood-bubbles, neighbourhood-streams |
| `nebula` | Clouds, nebulae and clusters | natural | neighbourhood-clouds, sector-nebulae, sector-clusters |
| `expanse` | Rifts, spurs, arms and voids | natural | sector-rifts, sector-spurs, galaxy-arms, galaxy-core, galaxy-disc, galaxy-halo, galaxy-voids |
| `station` | Stations and habitats | constructed | delegated to settlement names' space sites |

Every kind is all source (`new`: part 2, `settled`: part 2a, both at 100%), plus its own shapes only where the colonial space groups give nothing for a culture. Sky lore keeps the sky as seen from the ground.

### 5.6 Own shapes

Each new kind except delegated ones needs its own shapes: at least **6 open to General** (the kind target), in the wild lands shape format, using the existing pools and slots. Where the British shapes or the colonial patterns already give a fitting pattern, carry it across as an own shape rather than inventing one. Write every new shape, with its kind, into `docs/place-split-new-shapes.md` for Kenny to review.

## 6. Class

Every kind in every focused place module (the five new modules, the six wild lands and the three seas and coasts modules) carries `class`: `natural`, `managed` or `constructed`.

- The **class link** sits before the kind link: "‹all› ‹features of any kind›" with choices all, natural, managed, constructed. The kind menu and "any kind" draws then keep only kinds of that class.
- It shows only where a module has kinds in at least two classes. The probe (`npm run offers`) records which classes each module offers.
- Default `all`. A stored kind outside the chosen class is shown and kept (brief 2's rule 4).

Existing kinds:

| Module | natural | managed | constructed |
|---|---|---|---|
| mountains | range, peak, ridge, pass, gorge, valley, stream, river, tarn, ice, cave | – | settlement |
| forests | forest, grove, stream, river, pool, tree | clearing, ride, walk | settlement |
| deserts | desert, dune, plain, rock, canyon, oasis, lake | – | route, landmark, settlement |
| moors | moor, hill, bog, clough, stream, pool | – | stone, track, settlement |
| wetlands | marsh, bog, swamp, reed, water, isle, delta | channel | causeway, settlement |
| grasslands | plain, down, heath, vale, stream, lake | meadow | track, landmark, settlement |
| seas and bays | ocean, sea, bay, inlet, strait | – | – |
| coasts and islands | headland, cliff, beach, cove, island, coast | – | – |
| sea charts | bank, reef, deep, race, channel | roads | – |

Seas and bays and coasts and islands have one class each, so among the seas and coasts modules the link shows in sea charts only.

## 7. Colonial traditions in the culture menu

- `german` and `italian` become **live** lens cultures with `scope: "colonial"`: offered only where the module's where link is `new` or `settled`, and only where the probe finds they differ. Their status in every other module stays as brief 1 set it.
- `phoenician`, `belgian` and `hellenistic` are offered the same way, as local cultures: Phoenician under Middle East and Africa, Belgian under Northern Europe, Hellenistic under Western and southern Europe.
- Changing where back to home with one of these cultures chosen resets the culture to the module's default.
- The probe gains `where` as an input, so `lens-offers.json` records cultures per where.

## 8. What changes in the existing modules

| Module | Change |
|---|---|
| Six wild lands modules | `settled` added; sources added per §8.1; class field |
| Seas and bays, coasts and islands, sea charts | `settled` added; sources per §8.1; class field; seas and bays loses the `lake` kind from its menu |
| Hyperspace charts, route names, sacred places | none |

### 8.1 Sources for the existing modules

| Module and kinds | native generics | colonial groups or generics |
|---|---|---|
| mountains: range, peak, ridge, cave | mountain, fell, pointed-hill, sharp-peak, tor, crag, stone, cave | `mountains-and-rock`; mountain-range, volcano, glacier |
| mountains: pass | pass, gap-notch | – |
| mountains: valley, gorge | narrow-valley-glen, corrie, river-cut-gorge | `valleys` |
| mountains: tarn | small-mountain-lake | – |
| forests: forest, grove, tree | wood, single-species-wood, great-woodland, royal-hunting-ground, grove, grove-small-wood, grove-possibly-sacred, strip-of-woodland-shaw, wood-on-a-steep-slope, scrubland, thicket | `woodland` |
| forests: clearing | woodland-then-clearing, newly-cleared-land-assart, clearing-paddock, woodland-swine-pasture | `clearings` |
| forests: walk | park | – |
| moors: moor, hill | upland-moor, heath | `upland-and-open-ground` |
| wetlands: marsh, bog, reed, water | marsh, fen, lowland-marsh, brushwood-marsh-carr, mire, peat-bog-moss, bog | `wetland` |
| wetlands: isle | dry-ground-in-wet-land | – |
| wetlands: causeway | causeway | – |
| grasslands: down, heath | wold, heath | `upland-and-open-ground`; plain-grassland |
| grasslands: meadow | hay-meadow, pasture | – |
| deserts: desert, oasis | – | desert, oasis, dry-riverbed |
| coasts and islands: headland, cliff, beach, cove, island, coast | headland, point-nose, promontory, sea-cliff, coastal-chasm-geo, beach-strand, sand-dunes-sandy-shore, shingle-bank, small-bay-creek, cove, island, skerry-rock-islet | `coast-and-sea`, `islands-and-river-land`; island-group, reef, lagoon |
| seas and bays: bay, inlet, strait | bay, sea-inlet-firth, strait-sound, estuary | `coast-and-sea` |

All other kinds keep their own shapes only.

## 9. Retiring the three modules

1. **Tag `archive/wide-place-modules`** on the last commit before any removal, and push the tag.
2. `placeShapes`, `explorationPlaceShapes` and `empireExpansionPlaceShapes` leave the section line-up and the place names group. Their section keys, engines, sentence builders, preset parsing and data stay.
3. **Presets** of the three modules still show in the preset list and still run. Choosing one shows its saved sentence as plain text, headed "From a retired module: runs as saved", with no links, and generates exactly as before. "Save as new preset" is not offered for them.
4. **Recipe packs** run from the pack picker as now.
5. **History rows** of the three modules keep their icons and labels.
6. **Settlement names** keeps its native, new lands and settled lands settings, which call the same engines as now.
7. Guide text, the README module list and `docs/vocabulary-pools.md` drop the three modules and describe the five new ones and the where and class links.

## 10. Tests and coverage

### 10.1 Before anything changes (M0)

`tests/placeSplitBaseline.test.ts` with `tests/fixtures/place-split-baseline.json`, recorded with `CAPTURE_PLACE_SPLIT_BASELINE=1`, committed before any other change: seeds 1, 42 and 2024, 12 names, for

- every preset fixture and one preset per setting for native place names (British with each region, each world culture and era), exploration (each tradition) and expansion (each tradition, each context);
- settlement names in all three settings, and the settlement kit;
- the six wild lands and three seas and coasts modules at `where: home` and `new`, each culture they offer (the "before" for §8).

The first two parts must never change. The third is replaced at M7, and its commit lists which states changed.

### 10.2 New

- `lens-baseline.json`, the brief 2 preset baseline and every other regression fixture: untouched and matching, except the wild lands and seas and coasts states replaced at M7.
- Sources: with `Math.random` replaced by the seeded stream, a large batch hits the shares of §4.1 within 3 points; fallbacks as §4.1; delegated kinds call their engine with the right options.
- Where: `settled` round trip through the lens clause; old `new` states unchanged in meaning.
- Class: the link shows by §6; kind menus filter; a stored kind outside the class is kept.
- Retired presets run identically (M0 part 1).
- Coverage: an adapter for each new module. A borrowed source's entries count for the module that borrows them, as shared pools do. Re-record the ratchet baseline once at the end and say so.
- `npm run offers`: regenerated with where and class; report how long it now takes.

## 11. Milestones

| # | Milestone | Done when |
|---|---|---|
| M0 | Baselines | Committed before any other change; archive tag pushed |
| M1 | `src/places/sources.ts`, `sourceShares`, `settled` in the wild lands and waters engines, the extended culture-to-tradition map | No module uses sources yet; fixtures match |
| M2 | `class` on every kind; the class link; probe records classes | Fixtures match (class `all` changes nothing) |
| M3 | Rivers and inland waters; seas and bays | Lake moved; river kind delegated; own shapes listed |
| M4 | Hills and valleys; farmland and countryside | Own shapes listed |
| M5 | Lands and territories | Own shapes listed |
| M6 | Stars and space | Every colonial space group reachable |
| M7 | Sources in the existing wild lands and seas and coasts modules; colonial cultures in the menus | §8 changes listed; their fixtures replaced |
| M8 | Retirement, line-up, presets, history, guide text, README, coverage, offers | §9 done; ratchet re-recorded |

`npm test` and `npm run build` pass at the end of each.

## 12. Out of scope

- New culture, region, era or style words (briefs 4 to 7). The people and place brackets the sources bring with them are filled by brief 4.
- The per-slot name sentence in the focused modules: settlement names keeps it; the others keep their people link.
- Expansion's context choice: settled lands use the default context.
- Changes to route names, sacred places, hyperspace charts, settlement names, the settlement kit, the urban modules, ageing and takeover.
- Moving the retired engines' words into the focused modules' own tables: the sources draw on them where they are.
