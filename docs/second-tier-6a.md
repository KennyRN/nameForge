# Second-tier tables: batch 6a

French, Dutch, Spanish, Portuguese, Italian, Roman, Greek, Byzantine and Slavic, with the Iberian and Greek-and-Byzantine mixes. Generated sections are marked; everything else is written by hand. Part B's entries follow Part A.

## Part A: brief 5's last gaps

### 1. The four nations and Scandinavian (60% of own-shape draws)

Welsh, Scottish, Irish, Cornish and Scandinavian also read a legacy table that others share (Celtic's, Norse's), so their own entries take 60% of own-shape draws (`shares.signatureShared` and `sharedLegacy` in `lens.json`), and the replacement stream of the batch is salted by culture so that the nations replace different positions. Ten names at seed 3, before and after:

```
BEFORE
arms / welsh: Mail-Biter; Deer's Tooth; Hammered-Blade; Swan's Tusk; Morfudd's Axe; Pig's Sting; Knight's Bane; Silver-Crest; the Nailer; Leg-Cutter
arms / irish: Mail-Biter; Deer's Tooth; Ironclad-Blade; Swan's Tusk; Orla's Axe; Pig's Sting; Knight's Bane; Silver-Crest; the Nailer; Leg-Cutter
arms / scottish: Mail-Biter; Deer's Tooth; Hammered-Blade; Swan's Tusk; Eva's Axe; Pig's Sting; Knight's Bane; Silver-Crest; the Nailer; Leg-Cutter
inns / welsh: the Red Anchor; Arms of Owain's Fort; the Fisher and Willow; Morgan's Alehouse; Elystan's Tavern; the Old Arms; Hostelry of Teilo's Church; Rhys's Post House; the Sleepy Talisman; the Bell and Old Woman
inns / irish: the Red Anchor; Public House of Brian's Fort; the Fisher and Willow; Turlough's Alehouse; Fursey's Tavern; the Old Public House; Hostelry of Brigid's Church; Cormac's Post House; the Sleepy Talisman; the Bell and Old Woman
inns / scottish: the Red Anchor; Duncan's Ford Inn; the Fisher and Willow; Fergus's Alehouse; Ninian's Tavern; the Auld Inn; Hostelry of Kentigern's Kirk; Donald's Post House; the Sleepy Talisman; the Bell and Old Woman
realms / welsh: the Iron Kingdom; Southern Colonial Authority; Dukedom of the Valleys and the Hill Folk; Owain's Fort City-State; High Kingdom of Brychan's Church; Fiefdom of Ednyfed; the Iron Free City; City-State of the Emerald Marsh; Western High Kingdom; New Cairn Trading Compact
realms / irish: the Iron Kingdom; Southern Colonial Authority; Territory of the Plains and the Hill Folk; Brian's Fort City-State; High Kingdom of Laurence's Church; Palatine of MacNamara; the Iron Free City; City-State of the Emerald Marsh; Western High Kingdom; Lower Mere Trading Compact
realms / scottish: the Iron Kingdom; Southern Colonial Authority; Hundred Moot of the Lowlands and the Hill Folk; Duncan's Ford City-State; High Kingdom of Serf's Kirk; Shire of Grant; the Iron Free City; City-State of the Emerald Marsh; Western High Kingdom; White Barrow Trading Compact

AFTER (60%, own stream per nation)
arms / welsh: Mighty Longsword; Deer's Tooth; Beast's Bane; Swan's Tusk; Longsword of the Boar; Dagger of the Fair Tyrant; Sword of the Knight; the Bitter Sword; Ironclad Longbow; Hammered Lance
arms / irish: Mail-Biter; the Swift Axe; Sword of the Old Serpent; Swan's Tusk; Invader's Bane; Pig's Sting; Hound-Bane; Tyrant-Bane; the Nailer; Longbow of the Raider
arms / scottish: Mail-Biter; Outlaw's Bane; Knight's Bane; Giant-Bane; Sword of the Green Giant; Dirk of the Stout Reiver; Blue-Hilt; Silver-Crest; Ironclad-Dirk; Leg-Cutter
inns / welsh: the Red Anchor; Arms of Owain's Fort; the Fisher and Willow; Morgan's Alehouse; Elystan's Tavern; the Old Arms; Llywelyn's Arms; Tavern of Bridge End; House of Elis's Fort; Crimson Bar
inns / irish: the Red Anchor; Public House of Brian's Fort; the Fisher and Willow; Turlough's Alehouse; Fursey's Tavern; the Old Public House; Conor's Shebeen; Eating House of Lower Mere; House of Cowbottom; Crimson Pub
inns / scottish: the Red Anchor; Duncan's Ford Inn; the Fisher and Willow; Fergus's Alehouse; Ninian's Tavern; the Auld Inn; Malcolm's Howff; Eating House of Cowbottom; Finlay's Ford House; Crimson Howff
realms / welsh: Realm of the Forest March; Southern Colonial Authority; Dominion of the Lowlands and the Border-Folk; Marcher Lordship of Ithel; Shire of the Fair Marches; Principality of the Kinsmen; Hundred of New Cairn; The Marcher Lordship of Wasteland; Western High Kingdom; Dukedom of the Coast-Folk
realms / irish: the Iron Kingdom; Kingdom of Brian's Fort; Palatine of Laurence's Church; Earldom of the Uplands and the Free Men; High Kingdom of Brendan's Church; O'Donnell Principality; the Iron Free City; Earldom of the Isles; Kingdom of the Plains of the Plain-Folk; Lower Mere Trading Compact
realms / scottish: the Iron Kingdom; Kingdom of the Plains of Macleod; Shire of Gordon; Earldom of the Borders; Hundred Moot of the Lowlands; Regality of the Stout Borders; the Iron Free City; City-State of the Emerald Marsh; Thanedom of the Uplands and the Marchmen; Kentigern's Kirk Trading Compact
```

### 2. Brackets left in real mode

`tests/bracketSweepReal.test.ts` (with `tests/helpers/bracketSweep.ts`) sweeps every module, every kind of it, every culture it offers (the lens cultures and the module's own keys) and the eras, with `people: real`, and lists the bracket labels that survive in finished names. Before this part the sweep found:

| Label | Where | Cause | Now |
| --- | --- | --- | --- |
| `[dynasty]` | roman treasures; realms' short names inside place, treasure, money and calendar names (Egyptian, Chinese, Bantu, Arabic and Persian, Ethiopian, Japanese, Slavic) | a realm drawn by the realm source held a bracket of its own and was put in unfilled | the fill is filled once more; one that still holds a bracket is drawn again |
| `[event]` | festivals ("[event] Day") in calendars and sky lore, every culture | no source for the label | mapped to a new `event` source (treaty, battle or rebellion of the culture and era, bare, one or two words; General's when the culture has none in the era) |
| `[ruler]` | treasures (Ethiopian instruments, modern era) | the list of regnal names is short and its unused names were blocked famous people | a name is repeated rather than the bracket left |
| `[founder]`, `[owner]`, `[surname]`, `[woman's Name]`, `[explorer]` | ships and aircraft of the Northwest Coast, Arctic and Eastern Woodlands local cultures | no people tables for them | stay bracketed: native peoples' names (rule 4) |
| `[place]` | deities and sacred places | the deities module has no people link (invented gods only) | stays bracketed: it is the user's own place |

The two staying lists are in `fill.json` under `stayBracketedFor`, with their reasons, and the test fails on any other survivor. (The "Standard of [ruler]" reported for English treasures came from the placeholders run; with the link on `real` English treasures were already filled.)

### 3. Hacksilver

The legacy early-money list (`settlement-vocab.json`, `moneyFixed:early`) gave "Hacksilver" to Anglo-Saxon, Norse and General: all three now read "Cut Silver" (Collins has no entry for Hacksilver), and the kind's description says "cut silver".

<!-- tier6a-generated:start -->

## Part B: generated entries

Written by `scripts/make-tier6a.mjs` from `scripts/tier6a/`; edit those, not this section. People tables: `docs/people-tables.md`.

### Settlement names

A template is a pattern with a weight and the sizes it serves (h hamlet, v village, t town, c city, g great city); `{name}` and `{saint}` are filled from the people tables of the culture, and each list is shown with its words.

#### French

*Saint towns, castles, bastides and new towns; abbeys and priories; mills and forges from the steam age.*

- **Medieval:** Saint {saint} (8, hvtc); {church} of Saint {saint} (5, vtc); {castle} of {name} (6, hvtc); New Town (4, vtc); Bastide of {name} (4, vt); {adj} {hill} (4, hvt); {field} of the {animal} (3, hv); Bridge of {name} (4, vt); Ford of the {tree} (3, hv); {name:pos} {field} (4, hv); Market of {name} (3, tc); Mount Saint {saint} (3, hvt); Wood of the {animal} (2, hv); {hill} of {name} (4, hvt); Royal Borough (2, tcg); Walled Town of {name} (3, tcg); Spring of Saint {saint} (3, hv); Crossroads of {name} (3, hvt)
- **Modern:** Saint {saint} (5, hvtc); Port of {name} (5, vtcg); {craft} of {name} (5, hvt); New {town} (3, vtc); Station of {name} (3, vt); Spa of Saint {saint} (3, tc); Harbour of {name} (4, vtcg); Bridge of {name} (3, vt); Mount Saint {saint} (2, hvt); Market of {name} (3, tc); {adj} {hill} (3, hvt); {castle} of {name} (3, tcg); Royal {town} (2, tcg); {name:pos} {craft} (4, hvt)
- **Words:** hill: Mount, Hill, Height, Rock, Crag, Peak, Ridge; water: Spring, Brook, Stream, River Bend, Ford, Weir, Rapids; field: Field, Meadow, Vineyard, Orchard, Pasture, Clearing, Garden; castle: Castle, Fort, Tower, Keep, Stronghold, Citadel; church: Abbey, Priory, Chapel, Minster, Convent, Hospice; craft: Mill, Forge, Tannery, Saltworks, Quarry, Kiln, Glassworks; town: Town, Borough, Bastide, Village, Hamlet, Grange

#### Dutch

*Dikes, dams, polders and fens; havens and free towns; windmills and canals.*

- **Medieval:** {name:pos} {dike} (6, hv); {animal} {dike} (5, vtc); {dike} of {name} (4, hvt); {adj} Polder (4, hv); {name:pos} {haven} (5, vtc); {tree} Wood (3, hv); {church} {town} (3, vt); {fen} of {name} (4, hv); Mouth of the {animal} (3, vtc); New {town} (3, tcg); Free Town of {name} (3, tcg); {name:pos} {ridge} (4, hv); {adj} {ridge} (3, hv); Bridge of {name} (3, vt); Cloth Market of {name} (2, tc)
- **Modern:** {name:pos} {dike} (4, hv); {animal} {dike} (4, vtc); {name:pos} {haven} (5, vtcg); {mill} of {name} (4, hvt); {adj} Polder (3, hv); New {town} (3, tcg); {church} {town} (3, vt); Canal {town} (3, vtc); {name:pos} {ridge} (3, hv); Station {town} (3, vtc); Garden {town} (3, tc); Bridge of {name} (3, vt)
- **Words:** dike: Dike, Dam, Sluice, Lock, Embankment, Weir, Levee; fen: Fen, Mere, Marsh, Peat Bog, Polder, Meadow, Reclaimed Land; haven: Haven, Harbour, Quay, Landing, Wharf, Port; ridge: Dune, Sand Ridge, Mound, Hummock, Dwelling Mound, Rise, Hook; church: Church, Chapel, Abbey, Cloister, Hospital; mill: Windmill, Watermill, Brewery, Ropewalk, Dyeworks, Brickworks, Cheese Market; town: Town, Borough, City, Village, Hamlet, Farm

#### Italian

*Fortresses, free communes, saints, squares and palaces; ports and hill towns; new towns.*

- **Medieval:** Fortress of {name} (6, hvtc); Free Commune (4, tcg); Saint {saint} (7, hvtc); {name:pos} {tower} (5, hvt); Port of {name} (4, vtcg); {hill} of {name} (4, hvt); Bridge of {name} (3, vt); Square of {name} (3, tc); Palace of {name} (3, vtc); Fountain of Saint {saint} (3, hv); New Town (3, vtc); Great {tower} (2, tcg); Fair {hill} (3, hvt); {commune} of {name} (3, tcg); {church} of Saint {saint} (4, vtc); Cross of {name} (2, hv)
- **Modern:** Saint {saint} (5, hvtc); Port of {name} (5, vtcg); {name:pos} {square} (3, vtc); {hill} of {name} (3, hvt); New Town (3, vtcg); Station of {name} (3, vt); Fortress of {name} (3, hvtc); Spa of Saint {saint} (2, tc); Palace of {name} (3, tcg); {harbour} of {name} (4, vtcg); Quarter of {name} (3, tc)
- **Words:** tower: Tower, Fortress, Castle, Keep, Gate, Rampart; commune: Commune, Free Town, Republic, League, Borough, Seigniory; hill: Hill, Hilltop, Crag, Peak, Ridge, Height; square: Square, Market Square, Loggia, Cloister, Fountain, Arcade; harbour: Port, Harbour, Haven, Landing, Quay, Mole; church: Cathedral, Abbey, Basilica, Chapel, Hermitage, Monastery; town: Town, Borough, Village, Hamlet, Hill Town

#### Spanish

*Saints of the sea and the bridge, castles of counts, new towns, royal towns, holy crosses and fair views.*

- **Medieval:** Saint {saint} (7, hvtc); Saint Mary of the {where} (5, vtc); Castle of the {rank} (6, hvtc); New Town (4, vtcg); Royal Town (3, tcg); Holy Cross (3, hvt); {good} {land} (5, hvt); {castle} of {name} (5, hvtc); Bridge of {name} (3, vt); {name:pos} {town} (4, hv); Fountain of Saint {saint} (3, hv); Valley of the {animal} (3, hv); Watchtower of {name} (3, hv); Hill of the {tree} (3, hvt); {adj} {hill} (3, hvt); Market of {name} (3, tc)
- **Modern:** Saint {saint} (5, hvtc); Port of {name} (5, vtcg); New Town (4, vtcg); {good} {land} (4, hvt); Station of {name} (3, vt); Mine of {name} (4, hvt); Saint Mary of the {where} (3, vtc); Castle of the {rank} (3, hvtc); Colony of {name} (3, vt); {name:pos} {town} (3, hv); Bridge of {name} (3, vt); Royal Town (2, tcg)
- **Words:** castle: Castle, Fortress, Tower, Keep, Watchtower, Citadel, Stronghold; rank: Count, Duke, Marquis, Lord, Knight, King, Queen, Bishop, Abbot; where: Sea, Bridge, Fields, Hills, Orchard, Vineyard, Spring, Cross; hill: Hill, Mount, Rock, Peak, Ridge, Height, Crag; water: Spring, Fountain, Stream, River Bend, Ford, Weir, Well; land: View, Pasture, Valley, Hill, Spring, Harbour, Wind; good: Good, Fair, Fine, Pleasant, Rich, Green; town: Town, Borough, Village, Hamlet, Farm

#### Portuguese

*Holy crosses, good havens, saints, forts, quays, vineyards and salt pans; fishing villages and capes.*

- **Medieval:** Holy Cross (4, hvt); {good} {land} (6, hvtc); Saint {saint} (7, hvtc); {fort} of {name} (5, hvtc); Bridge of {name} (3, vt); Port of {name} (4, vtcg); {name:pos} Quay (4, vtc); Cape of Saint {saint} (3, hvt); {vine} of {name} (4, hv); Cork Oak Wood (3, hv); Salt Pans of {name} (3, hv); New Town (3, vtcg); {fishing} of {name} (3, hvt); {adj} {cape} (3, hvt); Market of {name} (3, tc); Royal Town (2, tcg)
- **Modern:** Saint {saint} (5, hvtc); {good} {land} (5, hvtc); Port of {name} (5, vtcg); {fishing} of {name} (4, hvt); {name:pos} Quay (4, vtc); Station of {name} (3, vt); Holy Cross (3, hvt); New Town (3, vtcg); Colony of {name} (3, vt); {fort} of {name} (3, hvtc); Cape of Saint {saint} (2, hvt)
- **Words:** harbour: Port, Haven, Harbour, Landing, Quay, Bay, Cove; cape: Cape, Point, Headland, Cliff, Rock, Beach; vine: Vineyard, Orchard, Olive Grove, Cork Wood, Farm, Estate; fort: Fort, Castle, Tower, Keep, Wall, Gate; fishing: Fishing Village, Salt Pans, Fishery, Net Quay, Cannery, Whale Station; good: Good, Fair, Holy, Great, Blessed, Pleasant; land: Haven, Hope, Spring, Valley, Hill, Harbour, View; town: Town, Borough, Village, Hamlet, Farm

#### Greek

*Cities and harbours of the gods, colonies, citadels, sacred groves and isles; saints' villages and ports in the modern world.*

- **Classical:** City of {god} (5, tcg); Harbour of {god} (4, vtc); Sacred Grove of {god} (3, hv); City of {name} (5, tcg); New City (3, tcg); Colony of {name} (4, vtc); High City (3, tc); {hill} of {god} (3, hvt); Spring of {god} (3, hv); {island} of the {animal} (3, hvt); Market of {name} (3, vtc); Gate of the {animal} (2, vt); {sacred} of {god} (4, hvt); Olive Grove of {name} (3, hv); {name:pos} {harbour} (3, vtc); White {hill} (3, hvt)
- **Modern:** Saint {saint} (6, hvtc); New {city} (4, vtcg); {name:pos} Port (4, vtcg); Chapel of Saint {saint} (4, hvt); Olive Grove of {name} (3, hv); White Village (3, hv); Harbour Town (3, vtc); Mountain Village (3, hv); Monastery of Saint {saint} (3, vt); {island} of {name} (3, hvt); Upper {city} (3, vtc); Station Town (2, vt)
- **Words:** god: Zeus, Hera, Athena, Apollo, Artemis, Poseidon, Demeter, Hermes, Dionysus, Hephaestus; city: City, Town, Colony, Citadel, Fortress, Settlement; harbour: Harbour, Port, Haven, Landing, Quay, Anchorage; hill: Hill, Peak, Crag, Height, Ridge, Hillfort; sacred: Temple, Shrine, Sacred Grove, Oracle, Altar, Sanctuary; island: Isle, Island, Cape, Headland, Strait, Bay; plain: Plain, Vale, Valley, Meadow, Olive Grove, Vineyard

#### Byzantine

*Saints and holy places, fortresses and citadels, monasteries and great churches; ports and imperial towns.*

- **Byzantine:** Saint {saint} (7, hvtc); {fortress} of {name} (6, hvtc); Monastery of Saint {saint} (5, hvt); {church} of Saint {saint} (4, vtc); Port of {name} (4, vtcg); {imperial} {town} (4, tcg); {name:pos} {harbour} (3, vtc); {hill} of Saint {saint} (3, hvt); Bridge of {name} (3, vt); {name:pos} {town} (4, hv); Market of {name} (3, tc); Holy Spring of {saint} (3, hv); {adj} {hill} (3, hvt); Citadel of {name} (3, tcg)
- **Modern:** Saint {saint} (6, hvtc); {name:pos} Port (4, vtcg); Monastery of Saint {saint} (4, hvt); New {town} (3, vtcg); {fortress} of {name} (3, hvtc); Harbour Town (3, vtc); Mountain Village (3, hv); {church} of Saint {saint} (3, vtc); Station Town (2, vt)
- **Words:** fortress: Fortress, Citadel, Fort, Stronghold, Tower, Kastron, Watchtower; monastery: Monastery, Hermitage, Convent, Cloister, Lavra, Cell; church: Great Church, Chapel, Basilica, Cathedral, Shrine, Holy Church; harbour: Harbour, Port, Haven, Landing, Quay, Anchorage; hill: Hill, Peak, Crag, Height, Ridge, Mount; imperial: Imperial, Royal, Holy, Great, Fortified, Golden; town: Town, City, Borough, Village, Hamlet, Farm

#### Roman (new era, added before Interstellar)

- **Republic:** Camp of {name} (5, hvt); Forum of {name} (4, vtc); Colony of {name} (4, tc); {road} of {name} (4, hv); Fort of the {rank} (3, hvt); Veterans' Colony (2, tc); Posting Station of {name} (3, hvt); {craft} of {name} (4, hvt); Market of {name} (3, vtc); Villa of {name} (4, hv); Bridge of {name} (3, vt); Harbour of {name} (3, vtcg); Walls of {name} (3, hvtc); New {city} (3, tcg); words: road: Road, Milestone, Crossing, Posting Station, Paved Way, Ford, Causeway; craft: Baths, Brickworks, Quarry, Mill, Smithy, Pottery; rank: Legate, Prefect, Consul, Tribune, Governor, Senator; city: City, Town, Colony, Camp, Fort, Settlement

#### Slavic (new era, added before Interstellar)

- **Tribal:** {name:pos} Stockade (5, hvt); {fort} of {name} (4, hvtc); {wood} of the {animal} (3, hv); {craft} of {name} (3, hvt); Clan of {name} (3, hvt); Hillfort of the {animal} (3, hvt); {adj} {fort} (3, hvt); Ford of {name} (3, hv); Market of {name} (3, vt); Holy Grove of {name} (2, hv); {name:pos} Clearing (4, hv); Beehive Village (2, hv); words: wood: Birch Wood, Pine Wood, Oak Grove, Clearing, Forest Edge, Swamp; fort: Stockade, Palisade, Hillfort, Watchtower, Refuge, Enclosure; craft: Pitch Works, Salt Works, Iron Works, Beehives, Smithy, Mill

<!-- tier6a-generated:end -->
