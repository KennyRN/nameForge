# Buildings and landmarks – brief (first release)

This brief adds a module, **buildings and landmarks**, to the **place names** group, after inns and taverns. It names the named buildings and landmarks of a settlement and its country:

- castles, towers and forts (*Fenwick Castle*, *the Grey Tower*, *Egret Castle*)
- halls, palaces and houses (*King's Hall*, *Velloran Palace*, *Hall of Lasting Peace*)
- houses of faith (*Saint Anne's Church*, *Temple of the Jaguar God*, *Sun Temple of Ashby*)
- civic buildings, bridges, wells, mills, monuments and follies (*Old Bridge*, *Lady Well*, *Harrow Mill*, *Sir Thurston's Folly*)
- schools, infirmaries, gaols, lighthouses (*Saltgate Tolbooth*, *Fenwick Light*)
- steam-age, steampunk, modern and sci-fi landmarks (*Fenwick Corn Exchange*, *Aether Spire*, *Arcology Tau*)

It is the fourth settlement module, after route names (RN), streets and districts (SD) and inns and taverns (IT), built from `docs/worldbuilding-research-reference.md` (WR §2, §13).

It also **feeds back** into the modules already built (§11):

- streets gain landmark streets (*Red Tower Lane*, *Saint Anne's Well Street*)
- inns gain landmark locations (*the Grey Tower*, *the Folly Inn*)

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow IT, then SD, RN, GN and TS. Reuse existing helpers. All output is in modern English.

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | A new module `buildingNames` in the place names group, after inns and taverns |
| Kinds | defences · halls and palaces · houses of faith · civic buildings · bridges and crossings · wells and water · mills and works · monuments and follies · learning and healing · gaols and lock-ups · lighthouses and beacons |
| Cultures, eras, fantastic, regions | As RN §4 |
| Setting | As IT: anywhere · in a town · in the country · in a port · by the road |
| Series | **As one town**: one of each kind before any repeats, one shared founder for several buildings, no qualifier twice |
| Shared vocabulary | New pools; the `th` themes from IT apply (§3) |
| Back-links | Streets and inns read generated buildings (§11) |
| Living religions | Faith buildings follow WR §10.1: generic for non-christian cultures; no mosque, synagogue, gurdwara, pagoda or stupa |

---

## 1. Module

### 1.1 Section

- Add `buildingNames` to `NameForgeSection`, label **"buildings and landmarks"**, Lucide icon `landmark`.
- Insert it in `SECTION_GROUPS.placeNames` and `SECTION_ORDER` straight after `innNames`.

### 1.2 History

`buildings and landmarks · {era label} · {culture label}`, then ` · {kind}`, ` · {setting}`, ` · {region phrase}`, ` · steampunk` / ` · fantastic`, ` · {tone}`, ` · one town` as they apply.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/settlement-vocab.json` | The new pools (§4) |
| `src/data/building-names.json` | Kinds, setting multipliers, shapes, culture shapes, safeguards |
| `src/buildings/engine.ts` | Generation (§7), series (§9), rendering (§10); an exported `buildingName()` for back-links (§11). No Obsidian imports. |
| `src/buildings/sentence.ts` | The sentence (§2) |
| `docs/vocabulary-pools.md` | Rows for the new pools; add "buildings and landmarks" to the readers of the SD component pools and IT `eastNature`, `auspicious`, `indianAnchor`, `oasisAnchor` |
| `tests/buildingNames.test.ts` | §15 |

Add this brief to `docs/` as `buildings-and-landmarks-brief.md`.

---

## 2. The sentence

### 2.1 Shape

> ‹Norman & British› ‹buildings and landmarks of any kind› of the ‹medieval› era, in a ‹realistic› world, ‹across all of Britain›, ‹anywhere›, ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›.

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture`, `era`, `fantastic`, `region` | as RN | as RN | `norman-british`, MD, realistic, all of Britain |
| `kind` | "buildings and landmarks of any kind" or the kind's plural (§5) | Any, then the kinds offered in the era | any |
| `setting` | as IT §2.2 | the five | anywhere |
| `tone`, `people`, `series` | as IT | | |

Tooltips: kind, the kind's description; the rest as IT.

### 2.3 Resets, plain text, presets

As IT §2.3–§2.4. Presets in §13.

---

## 3. Vocabulary rules

- No new entry keys. The IT theme tag `th` is read by this module, with the same setting multipliers (IT §6.3: urban ×3 in a town, rural ×3 in the country, maritime ×4 in a port, road ×3 by the road, magical ×2 when fantastic).
- Vocabulary packs extend the new pools as RN §3.3, SD §3.2 and IT §3 describe.

---

## 4. New pools (settlement-vocab.json)

### 4.1 Building words, one pool per kind

| Pool | Entries |
|---|---|
| `buildingWord:defence` | Castle ×3, Tower ×3, Keep, Fort, Fortress, Citadel, Bastion, Hold, Watchtower, Gatehouse, Barbican (MD–EM), Motte (british; MD), Ring Fort (celtic; AN–MD), Hill Fort (AN), Tower House (r: SBL SLO NTH; MD–EM), Peel Tower (r: SBL NTH; MD–EM), Broch (r: SHH NSI; AN), Battery (EM–ST), Redoubt (EM–ST), Bunker (MO) |
| `buildingWord:residence` | Hall ×3, Manor ×2, House ×2, Palace, Court, Grange (rural), Lodge, Villa (roman), Longhouse (norse), Great House, Mead Hall (anglo-saxon, norse; AN–MD), Pavilion (chinese, japanese, korean, indian), Courtyard Palace (chinese, arabic-persian), Palace Compound (ethiopian, west-african), Royal Enclosure (bantu), Felt Palace (steppe), Mansion (EM–MO), Villa (MO) |
| `buildingWord:faith` | Temple ×2, Shrine ×2, Sanctuary, Monastery, Hermitage; christian: Church ×3, Chapel ×2, Minster, Abbey, Priory, Cathedral (MD on), Friary; Pyramid Temple (aztec, maya), Relic Mound (indian, chinese, japanese, korean), Sky Platform (aztec, maya) |
| `buildingWord:civic` | Hall ×2, Guildhall (MD–EM), Moot Hall (british; MD), Market Hall, Exchange, Court House, Customs House, Toll House, Mint, Treasury, Town Hall (ST–MO), Corn Exchange (ST), Assembly Rooms (EM–ST), Civic Centre (MO), Forum (roman), Basilica (roman), Council House (maya, aztec), Meeting House (polynesian; MO) |
| `buildingWord:crossing` | Bridge ×4, Ford, Ferry, Causeway, Viaduct (ST), Aqueduct Bridge (roman), Packhorse Bridge (british; MD–EM), Swing Bridge (ST), Stepping Stones (light) |
| `buildingWord:water` | Well ×4, Spring ×2, Fountain ×2, Conduit, Cistern, Pump (EM–ST), Step Well (indian), Water Tank (indian), Water Channel (arabic-persian), Aqueduct (roman, greek-byzantine, aztec), Reservoir (ST–MO), Waterworks (ST), Baths (roman, arabic-persian; ST) |
| `buildingWord:works` | Mill ×4, Watermill, Windmill (EM on), Forge, Kiln, Quarry, Mine, Saltworks, Tannery, Ropewalk (EM–ST), Brewery, Foundry (ST), Works (ST–MO), Engine House (ST), Pithead (ST), Gasworks (ST), Factory (MO) |
| `buildingWord:monument` | Cross ×2 (british, christian), Column, Obelisk (egyptian; and ST), Standing Stone (AN–MD), Stones (AN), Barrow (AN–MD), Arch, Memorial (ST–MO), Statue (EM on), Folly ×2 (EM–ST; british, general), Monument, Pillar, Gate (chinese, japanese: Memorial Gate), Stele (egyptian, maya, ethiopian) |
| `buildingWord:learning` | School ×2, College, Academy, Library ×2, Scriptorium (MD), House of Learning, Observatory (EM on), Institute (ST), Museum (ST–MO), Infirmary (EM–ST), Hospital (ST–MO), Almshouse (christian; MD–ST), Hospice (christian; MD), House of Life (egyptian), Hall of Learning (indian) |
| `buildingWord:confinement` | Gaol ×2, Prison, Lock-up, Tolbooth (r: SLO SBL SHH ×3), Bridewell (british; EM–ST), Workhouse (ST; grim), Dungeon (`h: true`), Oubliette (`h: true`) |
| `buildingWord:maritime` | Lighthouse ×3, Light ×3, Beacon ×2, Harbour Light, Lantern, Watch Tower, Daymark, Lightship (ST–MO) |

### 4.2 Qualifiers and parts

| Pool | Entries |
|---|---|
| `buildingQual` | Old ×3, New ×2, Great ×2, Little, High, Round, Long, White ×2, Black, Red ×2, Grey ×2, Golden, Silver, Green, Upper, Lower, Broken (grim), Ruined (grim), Crooked (light), Leaning (light), Hollow (strange), Burnt (grim), Drowned (strange), King's, Queen's |
| `follyOwner` | Sir {surname} ×2, Lady {surname}, Lord {surname}, Squire {surname}, Old {surname}, Mad {surname} (light), Captain {surname} |
| `holyWellPrefix` (christian) | Lady ×2, Saint {holy}, Holy, Priest's, Monk's, Hermit's |
| `steampunkLandmark` (`h: true`, ST) | Aether Spire, Clockwork Tower, Difference Engine Hall, Airship Mast, Orrery Hall, Brass Observatory, Pneumatic Exchange, Glass Exhibition Palace, Gasometer Tower |
| `sciFiLandmark` (NF–IS) | Spire, Arcology, Dome, Hab Module, Hydroponic Bay, Sky Elevator, Landing Tower, Reactor Hall, Observation Ring, Archive Core |
| `eastVirtue` (chinese, korean, japanese) | Lasting Peace, Clear Brightness, Heavenly Calm, Eternal Spring, Serene Light, Pure Harmony, Gathered Virtue, Distant Mountains, Listening Pines, Silver Moon |
| `castleBird` (japanese) | Egret, Crane, Heron, Swallow, Kite, Hawk |
| `indianPalaceWord` (indian) | Mirrors, Lotus, Moon, Clouds, Peacock, Pearl, Sun, Jasmine |
| `oasisNoun` (arabic-persian) | Fountains, Roses, Cypresses, Pomegranates, Nightingales, Stars, Mirrors, Gardens |

`buildingFixed:{kind}` pools (one per kind) hold whole names; built-in entries are the fixed rows in §8. Packs can add to them.

---

## 5. Kinds

### 5.1 Line-up and weights by era (kind Any)

| Key | Menu | Plural | AN | MD | EM | ST | MO | NF | IS |
|---|---|---|--:|--:|--:|--:|--:|--:|--:|
| `defence` | Defences | castles, towers and forts | 20 | 20 | 12 | 5 | 2 | 3 | 3 |
| `residence` | Halls and palaces | halls and palaces | 15 | 15 | 15 | 10 | 8 | 8 | 8 |
| `faith` | Houses of faith | houses of faith | 15 | 15 | 12 | 8 | 5 | 3 | 3 |
| `civic` | Civic buildings | civic buildings | 8 | 10 | 12 | 15 | 15 | 10 | 10 |
| `crossing` | Bridges and crossings | bridges and crossings | 8 | 10 | 10 | 10 | 8 | 5 | 0 |
| `water` | Wells and water | wells and springs | 10 | 10 | 8 | 5 | 2 | 5 | 5 |
| `works` | Mills and works | mills and works | 5 | 8 | 10 | 20 | 10 | 10 | 10 |
| `monument` | Monuments and follies | monuments and follies | 10 | 5 | 10 | 10 | 10 | 5 | 5 |
| `learning` | Learning and healing | schools, libraries and infirmaries | 4 | 4 | 6 | 10 | 15 | 10 | 10 |
| `confinement` | Gaols and lock-ups | gaols | 2 | 2 | 3 | 5 | 5 | 3 | 3 |
| `maritime` | Lighthouses and beacons | lighthouses and beacons | 3 | 3 | 4 | 5 | 5 | 0 | 0 |

In NF–IS, 60% of names in every kind come from the sci-fi shapes (§8.4).

### 5.2 Setting effects

| Setting | Multipliers |
|---|---|
| in a town | civic ×2, faith ×1.5, learning ×1.5, confinement ×1.5, works ×0.7 |
| in the country | defence ×1.5, works ×1.5, water ×1.5, monument ×1.5, civic ×0.3, learning ×0.3, confinement ×0.3 |
| in a port | maritime ×5, civic ×1.2 (customs), crossing ×0.5 |
| by the road | crossing ×3, water ×1.5, monument ×1.5 (milestones, crosses), confinement ×0.5 |

---

## 6. Supporting sources

As RN §4.2, SD §4 and IT §6.2, plus:

| Token | Source |
|---|---|
| `{bw}` | the kind's `buildingWord` pool for the culture, era and region |
| `{dynasty}` | realms' dynasty source (RP §6.1); placeholder `[dynasty]` |
| `{founder}` | RN `{founder}` |
| `{god}` | RN §4.2 (egyptian, norse, anglo-saxon, aztec, maya) |
| `{n}` | 1–40 (decks, modules) |

---

## 7. Generation pipeline

```
era → kind (chosen, or §5.1 × §5.2)
    ↓
shape        (shared §8.1 + kind §8.2 + culture §8.3 + era §8.4; × themes × tone)
    ↓
tokens → rendering (§10) → safeguards (§12)
```

Failure and batches as GN §4. Cap: 7 words.

---

## 8. Shapes

### 8.1 Shared shapes (all kinds)

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `{town} {bw}` | 20 | all | all | plain | Fenwick Castle, Ashby Mill |
| `the {buildingQual} {bw}` | 20 | all | all | – | the Grey Tower, the Old Bridge |
| `{buildingQual} {bw}` | 5 | all | all | – | Old Bridge, High Cross |
| `{streetFigure:poss} {bw}` | 8 | MD on | all | grand | King's Hall |
| `{founder:poss} {bw}` | 8 | all | all | – | [founder]'s Tower |
| `{bw} of {founder}` | 5 | all | all | grand | Tower of [founder] |
| `{surname} {bw}` | 8 | EM on | general, british | plain | Harrow Mill |
| `{holy:poss} {bw}` | 8 | MD on | christian (faith, water, learning, crossing) | – | Saint Anne's Church |
| `{dynasty} {bw}` | 4 | all | all (residence, defence) | grand | Velloran Palace |
| `{creature} {bw}` | 3 | all | all | – | Raven Tower |

`the {buildingQual} {bw}` drops "the" when the qualifier is possessive (*King's Bridge*).

### 8.2 Kind shapes

| Kind | Shape | Weight | Eras | Cultures | Tone | Example |
|---|---|--:|---|---|---|---|
| defence | `{colour} {bw}` | 10 | all | all | – | Black Keep |
| defence | `{town} Gatehouse` / `{direction} Gate` | 8 | MD–EM | all | plain | North Gate |
| defence | `{founder:poss} Fort` | 6 | AN–MD | celtic | – | [founder]'s Fort |
| residence | `{town} Hall` / `{town} Manor` / `{town} Grange` | 15 | MD on | british, general | plain | Ashby Grange |
| residence | `Palace of {dynasty}` | 6 | all | all | grand | Palace of [dynasty] |
| faith | `{town} {bw}` (christian: Minster, Abbey, Priory) | 10 | MD on | christian | – | Fenwick Abbey |
| faith | `Temple of {god}` | 15 | AN | egyptian, norse, anglo-saxon, aztec, maya | grand | Temple of Thor |
| faith | `Shrine of the {holySite}` | 6 | all | all except christian | strange | Shrine of the Sacred Spring |
| civic | `{town} {bw}` (Moot Hall, Guildhall, Corn Exchange, Town Hall) | 15 | as tagged | all | plain | Saltgate Corn Exchange |
| civic | `{trade:poss} Hall` | 8 | MD–ST | all except indian, west-african | – | Weavers' Hall |
| crossing | `{town} Bridge` | 15 | all | all | plain | Fenwick Bridge |
| crossing | `{figure:poss} Bridge` / `{holy:poss} Bridge` | 8 | MD on | all / christian | – | Bishop's Bridge |
| crossing | `{creature} Bridge` / `{colour} Bridge` | 6 | all | all | – | Swan Bridge |
| crossing | `Devil's Bridge` (fixed) | 2 | MD–EM | british | strange | – |
| water | `{holyWellPrefix} Well` | 15 | MD on | christian | – | Lady Well, Saint Anne's Well |
| water | `{buildingQual} Spring` / `{creature} Spring` | 8 | all | all | – | Hart Spring |
| water | `Wishing Well` (fixed) | 2 | EM on | british, general | light | – |
| water | `Step Well of {patron}` | 15 | MD–EM | indian | – | Step Well of [patron] |
| works | `{surname} Mill` / `{surname} Works` | 15 | EM on | general, british | plain | Harrow Works |
| works | `{goods} Mill` / `{goods} Works` | 10 | EM on | all | plain | Corn Mill, Salt Works |
| works | `{town} {bw}` | 15 | all | all | plain | Saltgate Pithead |
| monument | `{follyOwner:poss} Folly` | 15 | EM–ST | british, general | light | Sir Thurston's Folly |
| monument | `{founder:poss} {bw}` (Column, Arch, Cross, Pillar) | 15 | all | all | grand | [founder]'s Column |
| monument | `{town} Cross` / `Market Cross` (fixed) | 10 | MD–EM | british | – | Ashby Cross |
| monument | `{event} Memorial` | 8 | ST–MO | all | grim | Victory Memorial |
| monument | `{town} Milestone` / `{number} Mile Stone` | 6 | EM–ST | british (by the road ×3) | plain | Four Mile Stone |
| learning | `{town} {bw}` / `{surname} {bw}` | 20 | EM on | all | plain | Fenwick Infirmary, Harrow Institute |
| learning | `{holy:poss} {bw}` | 10 | MD on | christian | – | Saint Ivo's School |
| confinement | `{town} {bw}` | 30 | all | all | grim | Saltgate Tolbooth |
| confinement | `the {buildingQual} {bw}` | 10 | all | all | grim | the Old Gaol |
| maritime | `{town} Light` / `{town} Lighthouse` | 25 | all | all | plain | Fenwick Light |
| maritime | `{headland} Light` | 20 | EM on | all | – | Ness Light |
| maritime | `the {colour} Lantern` | 10 | all | all | strange | the Red Lantern |

### 8.3 Culture shapes (WR §13, §2.2)

At weight 15 each within their kinds; all English output.

| Culture | Kind | Shapes | Examples |
|---|---|---|---|
| chinese | residence | `Hall of {eastVirtue}`, `Pavilion of {eastNature}` | Hall of Clear Brightness |
| chinese | defence | `{direction} Gate`, `Drum Tower` (fixed), `Bell Tower` (fixed), `{eastNature} Tower` | – |
| chinese | monument | `Memorial Gate of {founder}` | – |
| japanese | defence | `{town} Castle`, `{castleBird} Castle`, `{colour} {castleBird} Castle` | Egret Castle |
| japanese | residence | `{eastNature} Villa`, `{eastNature} Pavilion` | Willow Pavilion |
| korean | residence | `Palace of {eastVirtue}`, `{direction} Palace` | – |
| korean | defence | `{direction} Gate`, `{town} Fortress` | – |
| indian | residence | `{figure:poss} Palace`, `Palace of {indianPalaceWord}` | Palace of Mirrors |
| indian | defence | `{colour} Fort`, `{town} Fort` | – |
| indian | civic | `Pillared Hall of {founder}`, `{town} Clock Tower` (ST) | – |
| arabic-persian | defence | `{colour} Fortress`, `Citadel of {town}` | – |
| arabic-persian | residence | `Palace of the {oasisNoun}`, `Garden of {quality}` | Palace of the Fountains |
| arabic-persian | civic | `{patron:poss} Caravan Court`, `{town} Covered Market` | – |
| egyptian | faith | `House of {god}`, `Mansion of {number} Years`, `Temple of {god}` | Mansion of Seven Years |
| egyptian | works | `{figure:poss} Granary` | – |
| roman | civic | `Baths of {founder}`, `Basilica of {founder}`, `Forum of {founder}` | – |
| roman | water | `{romanRoadNomen} Aqueduct` | Fabian Aqueduct |
| greek-byzantine | civic | `Colonnade of {founder}` | – |
| greek-byzantine | faith | `Church of {holy}` (MD on) | – |
| norse | residence | `{owner:poss} Hall`, `Hall of {town}`, `{creature} Hall` | Ketil's Hall |
| celtic | defence | `{founder:poss} Fort`, `Round Tower of {town}` | – |
| celtic | water | `{holy:poss} Well` ×2 | – |
| slavic | defence | `{colour} Tower`, `Citadel of {town}` | – |
| slavic | faith | `Church of {holy}`, `{holy} Monastery` | – |
| steppe | residence | `{colour} Felt Palace`, `{figure:poss} Tent` | Golden Felt Palace |
| west-african | residence | `Palace of the {figure}` | – |
| west-african | faith | `Great House of Prayer of {town}` | – |
| west-african | civic | `{town} Market Hall`, `{weekday} Market Hall` | – |
| bantu | residence | `Royal Enclosure of {town}`, `Hill Enclosure` (fixed) | – |
| ethiopian | residence | `Palace of the {figure}`, `{town} Castle` (EM) | – |
| ethiopian | monument | `{founder:poss} Stele` | – |
| aztec | faith | `Temple of {god}`, `Great Temple of {town}` | – |
| aztec | residence | `House of the {creature:pl}` | House of the Ocelots |
| maya | faith | `Temple of the {creature}`, `Temple of {god}`, `Temple of the {number} {creature:pl}` | Temple of the Nine Owls |
| maya | civic | `{directionAdj} Ball Court`, `Palace of the {number} Lords` | – |
| andean | works | `Royal Storehouse of {town}`, `{town} Terraces` | – |
| andean | faith | `Sun Temple of {town}` | – |
| polynesian | civic | `{town} Meeting House`, `Canoe House of {town}` | – |

`{eastNature}`, `{auspicious}`, `{indianAnchor}` and `{oasisAnchor}` are IT's pools; `{romanRoadNomen}` is RN's.

### 8.4 Era shapes

| Era | Shapes | Examples |
|---|---|---|
| ST | `{town} Corn Exchange`, `{town} Town Hall`, `{surname} Institute`, `{town} Infirmary`, `{town} Workhouse` (grim), `{town} Gaol`, `{town} Station`, `{surname} Memorial Library`, `Exhibition Palace` (fixed) | Saltgate Corn Exchange |
| ST (`h: true`) | `{steampunkLandmark}`, `{town} {steampunkLandmark}`, `{surname} {steampunkLandmark}` | Aether Spire, Fenwick Clockwork Tower |
| MO | `{surname} House`, `{town} Tower`, `{brandRoot} Tower`, `{town} Civic Centre`, `{town} General Hospital`, `{town} Power Station`, `{surname} Building` | Cobalt Tower |
| NF–IS | `{star} {sciFiLandmark}`, `{sciFiLandmark} {greek}`, `Hab Module {n}`, `{discovery} Dome` (RN/SS discovery words), `{ordinal} Hydroponic Bay`, `{town} Sky Elevator` | Vega Spire, Arcology Tau |

`{discovery}`: Discovery, Endeavour, Horizon, Pathfinder, Pioneer, Venture. `{event}`: Victory, Peace, Jubilee, Flood, Fire. `{headland}`: Point, Head, Ness, Cape, Rock.

---

## 9. Series: as one town

- One of each kind offered (for the era and setting) before any kind repeats.
- One founder is drawn at the start and used for up to three buildings in the batch (*[founder]'s Tower*, *[founder]'s Column*, *Tower of [founder]*), so a town has a benefactor.
- No qualifier, colour or creature twice.
- `{town}` in this series is the batch's own town: one town drawn at the start for every `{town}` token (so the castle, bridge and gaol share a name: *Fenwick Castle*, *Fenwick Bridge*, *Fenwick Gaol*). Other towns don't appear.

---

## 10. Rendering

- Leading "the" lower case (*the Grey Tower*). Shapes beginning with a town, a name or "Saint" have no "the".
- Possessives OUP; `{creature:pl}` from GN plurals.
- `{number} Mile Stone` uses words (Four Mile Stone).

---

## 11. Back-links into earlier modules

These changes are part of this brief's M3. Each module's own brief stays the record; add a short "Buildings back-link" note to `docs/streets-and-districts-brief.md` and `docs/inns-and-taverns-brief.md` describing the change.

### 11.1 Streets and districts

- New street shape, weight 4, all eras: `{landmark} {streetWord}`, where `{landmark}` is one `buildingName()` of kind defence, faith, crossing, water or monument for the same culture, era, fantastic and region, **without** a leading "the" and **only** if it has 3 words or fewer. Examples: *Red Tower Lane*, *Saint Anne's Well Street*, *Folly Lane*.
- In the one-town series (SD §10), a batch of 8 or more uses `{landmark}` at most once, and if both the buildings series and streets series are run with the same seed, they share the batch town (parked: a full settlement kit).

### 11.2 Inns and taverns

- The location anchor (IT §6.2) gains `the {landmark}` at 20% of location draws (*the Grey Tower*, *the Lady Well*), with `{landmark}` as above (kinds defence, crossing, water, monument).
- Roadside shapes (IT §6.3) gain `the {landmark} Inn` (weight 3), kinds crossing and monument (*the Old Bridge Inn*, *the Four Mile Stone Inn*).

### 11.3 Tests

Add to SD and IT tests: `{landmark}` names are never longer than 3 words before the street word or house word, and pass building safeguards.

---

## 12. Safeguards

### 12.1 Block list

Whole-name matches (with or without a leading "the") are redrawn.

- **Real British landmarks:** Tower of London, White Tower, Bloody Tower, Windsor Castle, Edinburgh Castle, Stirling Castle, Caernarfon Castle, Conwy Castle, Dover Castle, Warwick Castle, Bamburgh Castle, Tintagel, Glastonbury Tor, Stonehenge, Avebury, Hadrian's Wall, Offa's Dyke, Antonine Wall, Westminster Abbey, Westminster Hall, York Minster, Canterbury Cathedral, Durham Cathedral, Saint Paul's, St Paul's, Tower Bridge, London Bridge, Iron Bridge, Ironbridge, Forth Bridge, Clifton Suspension Bridge, Royal Exchange, Mansion House, the Guildhall, Old Bailey, Newgate, Marshalsea, Clink, Bedlam, Bethlem, Fleet Prison, Old Tolbooth, Eddystone, Bell Rock, Longships, Smeaton's Tower, Big Ben, Crystal Palace, Blackpool Tower, Martello Tower, Eleanor Cross, Charing Cross, Marble Arch, Nelson's Column, Cleopatra's Needle, Brighton Pavilion, Royal Pavilion, Sutton Hoo, Maeshowe, Skara Brae.
- **Real world landmarks:** Forbidden City, Hall of Supreme Harmony, Hall of Central Harmony, Hall of Preserving Harmony, Palace of Heavenly Purity, Temple of Heaven, Yellow Crane Tower, Great Wall, Golden Pavilion, Silver Pavilion, Himeji Castle, White Egret Castle, White Heron Castle, Crow Castle, Matsumoto Castle, Osaka Castle, Gyeongbokgung, Palace Greatly Blessed by Heaven, Red Fort, Palace of Winds, Hawa Mahal, Taj Mahal, Amber Fort, Lotus Temple, Alhambra, Red Fortress, Court of the Lions, Hagia Sophia, Holy Wisdom, Great Pyramid, Sphinx, Karnak, Luxor, Valley of the Kings, Colosseum, Pantheon, Parthenon, Acropolis, Tower of the Winds, Baths of Caracalla, Pont du Gard, Kremlin, Palace of Facets, Saint Basil's, Winter Palace, Hermitage, Great Enclosure, Great Zimbabwe, Fasil Ghebbi, Lalibela, Great Mosque of Djenné, Temple of the Great Jaguar, Temple of the Inscriptions, House of the Eagles, Templo Mayor, Pyramid of the Sun, Pyramid of the Moon, Coricancha, Machu Picchu, Sacsayhuamán, Eiffel Tower, Leaning Tower, Statue of Liberty, Empire State, Kremlin Wall, Brandenburg Gate, Arc de Triomphe.
- **Fiction:** Orthanc, Barad-dûr, Minas Tirith, Helm's Deep, Hogwarts, Azkaban, Gringotts, Castle Black, the Red Keep, Winterfell, Casterly Rock, Harrenhal, Dragonstone, Unseen University, Tower of Art, Castle Greyskull, Castle Dracula, Barad Dur, Isengard, Weathertop, Rivendell, Tower of Sorcery, High Hrothgar, Dragonsreach, Candlekeep, Baldur's Gate, Citadel of Ricks.

### 12.2 Flag list

Allowed by default: Old Bridge, Market Cross, High Cross, Lady Well, Holy Well, Grey Tower, Red Tower, Black Tower, Round Tower, Old Gaol, Town Hall, Corn Exchange, Devil's Bridge, King's Hall, Moot Hall, Wishing Well, Gatehouse, Keep, Guildhall, Market Hall, Folly.

### 12.3 Living religions

WR §10.1 and SD §13.3. Non-christian faith buildings use Temple, Shrine, Sanctuary, Monastery, Hermitage, Relic Mound, Great House of Prayer. No Mosque, Synagogue, Gurdwara, Pagoda, Stupa, Mandir, Wat. `Temple of {god}` only for the five ancient-god cultures.

### 12.4 Sensitive cultures

Polynesian and Andean: no faith-kind names except Andean `Sun Temple of {town}` in AN–MD (civic-historical sense, no gods), no sacred platforms, no light, grim or fantastic entries. Polynesian faith kind is weight 0.

### 12.5 Banned words

GN §12.3, SD §13.5 and IT §12.4, plus: Asylum, Lunatic, Madhouse, Leper House, Bedlam, Concentration Camp, Labour Camp, Slave, Plantation.

### 12.6 Safeguard packs

`type: settlement-safeguards` (RN §12.6).

---

## 13. Presets

```yaml
---
type: module-preset
module: building-names
packName: Border landmarks
culture: norman-british
region: SBL
kind: any
era: EM
fantastic: false
setting: country
tone: any
people: invented
series: true
---

Norman & British buildings and landmarks of any kind of the early modern era, in a realistic world, in the Scottish Borderlands, in the country, of any tone, with invented people and places, as one town.
```

| Key | Values | Default |
|---|---|---|
| `culture`, `region`, `era`, `fantastic`, `setting`, `tone`, `people`, `series` | as IT §13 | as there |
| `kind` | `any` or a kind key | `any` |

---

## 14. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Vocabulary and engine.** The new pools (§4), register rows, kinds, settings, shapes, culture and era shapes, series, safeguards, `buildingName()` | §15.1–§15.5 pass |
| M2 | **Module.** Section, sentence, history, presets | §15.6 passes; the module generates in the app |
| M3 | **Back-links.** §11 in streets and inns, notes in their briefs, their new tests | §11.3 tests pass; all earlier tests still pass |

---

## 15. Tests (`tests/buildingNames.test.ts`)

### 15.1 Vocabulary

- New entries valid; no entry is a blocked real name (§12.1).

### 15.2 Coverage and determinism

- Same options and seed give the same names.
- Every culture × era × kind offered × setting × people: 20 unique names within the cap (a shortfall notice is allowed only where a kind has weight 0).

### 15.3 Kinds, settings and eras

- In a port: lighthouses and beacons are at least 30% of 2,000 names with kind Any.
- MD: no ST, MO or sci-fi shapes; NF–IS: at least 60% sci-fi shapes in each kind.
- Steam age with fantastic: steampunk landmarks appear.

### 15.4 Cultures and religion

- japanese defence: `{castleBird} Castle` appears and never a blocked real castle.
- 5,000 names for each non-christian culture: no christian faith word; no Mosque, Synagogue, Gurdwara, Pagoda, Stupa, Mandir or Wat.
- `Temple of {god}` only for the five cultures; Polynesian has no faith names.

### 15.5 Series and safeguards

- Series of 11 with kind Any: every kind once; one town for all `{town}` tokens; the founder used at most 3 times; no qualifier twice.
- 5,000 names per culture: 0 block-list matches, 0 banned words.

### 15.6 Sentence and presets

- Default plain text: "Norman & British buildings and landmarks of any kind of the medieval era, in a realistic world, across all of Britain, anywhere, of any tone, with placeholders for people and places, each one separate."
- Preset round-trip.

---

## 16. Parked

- **Settlement kit:** one press for a whole town, sharing one town name, founder and route across streets, districts, inns and buildings (the series rules in SD §10, IT §9 and §9 here are its parts).
- Building details: age, condition, owner, legend.
- Ruins and lost places (*the Drowned Church*) as their own kind with legends.
- Country houses and estates as a fuller residence system (*Ashby Park*, *Fenwick Hall and Gardens*).


---

## Deities back-link

Added by the deities and sacred places brief (§10.1): a faith shape `Temple of the {deity}` (weight 15) for every culture but the sensitive ones, with `{deity}` from `deityTitle()` (archetype, A, B or D; any gender; the culture's style); christian cultures take it at weight 3 and only with fantastic on. `Shrine of the {deity}` sits beside `Shrine of the {holySite}` at the same weight (6). In the settlement kit both use the context's deity.

## Monuments back-link

Added by the monuments and statues brief (§10): the `monument` kind (Monuments and follies) left this module for monuments and statues (`docs/monuments-and-statues-brief.md`). `BuildingKind` loses `"monument"`; the `buildingWord:monument` and `buildingFixed:monument` pools, the kind's shapes and its two culture shapes (Chinese `Memorial Gate of {founder}`, Ethiopian `{founder:poss} Stele`) went with it, and "Folly" left the flag list. The real monuments on this block list stay on it as well as on monuments'. With any remaining kind chosen, the same seed gives the same names as before; kind Any draws from ten kinds. A buildings preset with `kind: monument` loads as Any ("Monuments and follies have moved to monuments and statues."), and a vocabulary pack heading for the two retired pools is ignored with a notice. Streets and inns draw their monument landmarks from monuments and statues (§11).
