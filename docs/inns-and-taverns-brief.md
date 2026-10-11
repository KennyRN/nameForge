# Inns and taverns – brief (first release)

This brief adds a module, **inns and taverns**, to the **place names** group, after streets and districts. It names houses of hospitality in every culture and era:

- English inn signs (*the Red Lion*, *the Fox and Grapes*, *the Weavers' Arms*, *the Bear's Den*)
- the world's other traditions (*House of the Seven Wells*, *Inn of Lasting Peace*, *Pine Wind Tea House*, *Lotus Rest House*, *Mead House of Ashby*, *Strangers' Lodge of Saltgate*)
- steam-age and steampunk houses (*the Great Northern Hotel*, *the Brass Owl*), modern pubs and cafés, and sci-fi station bars (*the Last Drink Before Vega*)

It is the third settlement module (after route names, RN, and streets and districts, SD), built from `docs/worldbuilding-research-reference.md` (WR §11) and the Book of Names' Inns and Taverns section, whose "Base Tavern Titles" weights it keeps for the English tradition. GN §17 parked this module.

It reads the earlier work rather than repeating it:

- the **shared vocabulary** (`settlement-vocab.json`) and vocabulary packs (RN §3), with new pools and one new tag, **themes** (§3)
- the group names **emblem pool** (GN §5.5) for creatures and items
- **routes** for roadside inns (*the Salt Way Inn*), **streets and components** for locations (*the Old Mill*), **trades** for guild arms (*the Coopers' Arms*)
- RN's cultures, eras, regions, fantastic switch, tones and settlement safeguard packs

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow SD, then RN, then GN and TS. Reuse existing helpers rather than copying them. All output is in modern English.

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | A new module `innNames` in the place names group, after streets and districts |
| Kinds | inns and lodgings · taverns and alehouses · eating, tea and coffee houses · way stations and caravan courts · rest houses and hostels · clubs, halls and hotels · bars and lounges |
| Cultures, eras, fantastic, regions | As RN §4 |
| Setting | A new link: anywhere · in a town · in the country · in a port · by the road. It weights the Book of Names' themes (rural, urban, maritime) and roadside words. |
| Form | as signs (*the Red Lion*) · with a house word (*the Red Lion Inn*) · either (default) |
| English signs | The Book of Names' table: creature 13, person 7, item 10, arms 3, location 3, owner 2, feature 2, description 30, combination 30 |
| Series | **As one town**: no creature, item, person or colour twice; one roadside or street-based house in larger batches; at most one Arms |
| Shared vocabulary | New pools; entries gain an optional theme tag `th` (§3) |
| Leading "the" | Lower case, as GN (*the Red Lion*), so names drop into sentences |

---

## 1. Module

### 1.1 Section

- Add `innNames` to `NameForgeSection`, label **"inns and taverns"**, Lucide icon `beer`.
- Insert it in `SECTION_GROUPS.placeNames` and `SECTION_ORDER` straight after `streetNames`.

### 1.2 History

`inns and taverns · {era label} · {culture label}`, then ` · {kind}` when not Any, ` · {setting}` when not anywhere, ` · {region phrase}`, ` · steampunk` / ` · fantastic`, ` · {tone}`, ` · one town`.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/settlement-vocab.json` | The new pools (§4) |
| `src/data/inn-names.json` | Kinds, settings, the sign table, culture shapes, era shapes, safeguards |
| `src/inns/engine.ts` | Generation (§7), series (§9), rendering (§10). No Obsidian imports. |
| `src/inns/sentence.ts` | The sentence (§2) |
| `docs/vocabulary-pools.md` | Rows for the new pools and the `th` key |
| `tests/innNames.test.ts` | §15 |

Add this brief to `docs/` as `inns-and-taverns-brief.md`.

---

## 2. The sentence

### 2.1 Shape

> ‹Norman & British› ‹houses of any kind› of the ‹medieval› era, in a ‹realistic› world, ‹across all of Britain›, ‹anywhere›, ‹as signs or with a house word›, ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›.

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture`, `era`, `fantastic`, `region` | as RN §2.2 | as RN | `norman-british`, MD, realistic, all of Britain |
| `kind` | "houses of any kind" or the kind's plural (§5) | Any, then the kinds offered in the era | any |
| `setting` | "anywhere" · "in a town" · "in the country" · "in a port" · "by the road" | the five | anywhere |
| `form` | "as signs" · "with a house word" · "as signs or with a house word" | the three | either |
| `tone`, `people`, `series` | as SD; series reads "each one separate" · "as one town" | | |

- **Form link:** shown only for cultures with an English sign tradition (§6.1). Hidden reads as either.
- **Tooltips:** kind, the kind's description; setting, "Where the house stands: weights country, town, harbour or roadside signs"; form, "A bare sign name, or the sign with Inn, Tavern and so on"; the rest as RN and SD.

### 2.3 Resets

- **Era changed:** a kind not offered resets to Any.
- **Culture changed** away from the British cultures: region resets (RN §2.3).

### 2.4 Plain text, state, presets

As GN §2.5–§2.6. Presets in §13.

---

## 3. Theme tag

Entries in `settlement-vocab.json` gain one optional key:

| Key | Meaning | Default |
|---|---|---|
| `th` | themes the entry belongs to: `rural`, `urban`, `maritime`, `road`, `magical` | none |

- Update `src/settlement/vocab.ts` to read it. A theme multiplies the entry's weight when the inn **setting** asks for it (§6.3). Other modules ignore `th` unless their brief says otherwise.
- Vocabulary pack lines may add themes in square brackets: `- Eel Trap [maritime]`, alongside RN's `×n` and `(tone)`.
- Add `th` to the entry-keys table in `docs/vocabulary-pools.md`.

---

## 4. New pools (settlement-vocab.json)

Tags as RN §3.1 and SD §3.1, plus `th`.

### 4.1 Sign parts (English tradition)

| Pool | Entries |
|---|---|
| `innCreature` | Added to GN `creature` (beast, bird, fish) and `heraldicBeast` at read time: Goose (th: rural), Duck (rural), Drake, Lamprey (maritime), Minnow, Roebuck, Hind (rural), Hedgehog, Mole, Coot, Cormorant (maritime), Herring (maritime), Pelican (maritime), Sea-Lion (maritime; heraldic), Mermaid (maritime; heraldic), Talbot, Greyhound, Ox, Sheep (rural), Pig (light) |
| `innPerson` | Hero, Hunter (rural), King ×2, Knight, Maid, Queen ×2, Sailor (maritime), Shepherd (rural), Traveller (road), Baron, Duke, Earl, Lord, Lady, Prince, Princess, Archer, Bowman, Squire, Soldier, Drover (rural, road), Fisher (maritime), Forester, Ploughman (rural), Goose Girl (rural; light), Goat Boy (rural; light), Constable, Judge, Champion, Executioner (grim), Blacksmith, Cooper, Fletcher, Mason, Weaver, Sage, Scholar, Scribe, Doctor, Pilgrim (road), Fiddler (light), Harper, Jester (light), Minstrel, Piper, Highwayman (road; grim), Pirate (maritime), Rogue (light), Beggar, Brewer, Cook, Ferryman (maritime), Fishwife (maritime; light), Gardener, Greybeard, Merchant, Miller, Miner, Tinker (road; light), Vintner, Wanderer, Old Woman, Crone (light), Lad; christian cultures: Abbot, Bishop, Friar, Monk, Nun, Prior; fantastic (`h: true`): Wizard (magical), Enchantress (magical), Druid (magical), Giant, Troll, Goblin |
| `innItem` | Added to GN `emblem` item sub-lists (weapon, worn, celestial, plant, musical, various, food) at read time: Cask (urban), Barrel, Firkin, Hogshead, Tun, Cup (urban), Goblet, Horn, Tankard, Jug, Flagon, Bottle, Crooked Billet, Wheatsheaf (rural), Hops (rural), Barley Mow (rural), Plough (rural), Harrow (rural), Scythe (rural), Shears (rural), Bush (rural), Stump (rural), Coach (road; EM on), Wagon (road), Saddle (road), Horseshoe (road), Lantern (road), Bell (urban), Portcullis (urban), Torch (urban), Gate (urban), Castle (urban), Crown (urban), Anchor (maritime), Net (maritime), Shell (maritime), Ship (maritime), Oar (maritime), Compass (maritime), Book (magical), Crystal Ball (magical; `h: true`), Mandrake (magical), Pentacle (magical; `h: true`), Scroll (magical), Staff (magical), Talisman (magical), Wand (magical; `h: true`), Zodiac (magical) |
| `innDescription` | Black ×2, White ×2, Red ×2, Blue, Green, Golden ×2, Grey, Royal, Jolly ×2 (light), Old, New, Silver, Brazen, Iron, Copper, Crystal, Pied, Spotted, Chequered, Laughing (light), Dancing (light), Drunken (light), Sleepy (light), Roaring, Leaping, Prancing, Flying, Fighting, Hungry, Lazy (light), Little, Lucky (light), Merry (light), Crooked, Mucky (light), Ragged, Rising, Running, Singing, Smiling, Wild, Wise, Blind, Broken (grim), Howling (grim), Hooded, Lone, Weeping (strange), Silent (strange), Pale (strange) |
| `innNumber` | Two ×5, Three ×4, Four ×3, Five ×3, Six, Seven ×2, Eight, Nine (Book of Names weights) |
| `innFeature` | Head ×10, Antlers, Paw, Talon, Tail, Foot |
| `innHome` | Den, Nest, Lair, Burrow, Sett, Rest, Haunt, Roost |
| `innWorn` | in Armour, in Boots, in a Doublet, in a Hat, in a Cloak |
| `innLocation` | Arbour, Archway, Baths, Blasted Oak, Boundary Stone, Bridge, Brook, Castle, Cave, Cellar, Cliff, Crag, Crossroads (road), Cross, Dock (maritime), Dyke, Ferry (maritime), Forge, Fork, Gallows (grim), Gardens, Gate, Grove, Hill, Island, Lakeshore, Market, Mill (rural), Pier (maritime), Pool, Pump, Quarry, Riverside, Ruins, Shore (maritime), Spring, Stables (road), Standing Stone, Stocks (light), Tollgate (road), Tower, Wall, Waterfall, Wayside (road), Weir, Well, Wood. Plus SD's component pools at ×0.3. |
| `innFable` (whole signs) | Fox and Grapes, Hare and Tortoise, Bird in Hand, Cat and Fiddle (light), Coach and Horses (road; EM on), Rose and Crown, Crown and Anchor (maritime), Lion and Unicorn, Swan with Two Necks, Hen and Chickens (rural), Pig and Whistle (light), Goat and Compasses, Eight Bells (maritime), Jolly Sailor (maritime), Crooked Billet, Rising Sun, Royal Oak, Wheatsheaf (rural), Mucky Duck (light), Barley Mow (rural), Plough and Harrow (rural), Ship and Shovel (maritime), Bull and Butcher, Fleece (rural; rx NTH ×3), Black Bull (rx SLO SBL NTH ×3), Red Dragon (rx WAL ×4), Cross Keys (christian), Lamb and Flag (christian), Angel (christian), George and Dragon (christian), Jolly Tinner (rx COR ×4), Wherry (maritime; rx EAN ×3) |

### 4.2 House words

One pool per kind, so packs can add house words by culture and era. Each pool carries culture and era tags.

| Pool | Entries |
|---|---|
| `houseWord:inn` | Inn ×4, Hostelry (british; MD–EM), Lodging House (ST), Hotel (ST–MO), Guest House (celtic, greek-byzantine, bantu, polynesian; and all in MO), Guest Hall (norse), Station Inn (roman, korean), Lords' Inn (japanese; EM), Clachan (r: SHH; MD–ST) |
| `houseWord:tavern` | Tavern ×3, Alehouse (british; MD–EM), Mead Hall (anglo-saxon, norse), Wine House (greek-byzantine, chinese, roman), Beer House (egyptian; and british ST), Mead House (ethiopian), Public House (british; EM–MO), Pub (british; MO), Gin Shop (british; ST), Howff (r: SLO SBL; EM–ST) |
| `houseWord:eating` | Cookshop (british; MD–EM), Chop House (EM–ST), Eating House, Tea House (chinese, japanese, korean; indian and british ST on), Coffee House (arabic-persian EM on; british EM–ST; slavic ST), Café (MO), Dining Rooms (ST) |
| `houseWord:wayhouse` | Post House (MD–ST), Post Station (steppe, chinese, slavic), Caravan Court (arabic-persian, steppe, indian), Change Station (roman), Station Inn (roman), Coaching Inn (british; EM–ST), Way Station, Royal Station (andean) |
| `houseWord:rest` | Rest House (indian, arabic-persian; and all), Pilgrims' Lodge, Hostel, Hospice (christian; MD), Guest House (greek-byzantine), Strangers' Lodge (west-african), Landlord's House (west-african), Merchants' House (aztec, maya), Temperance Hotel (british; ST) |
| `houseWord:club` | Club ×2, Rooms, Hall, Hotel, Assembly Rooms (british; EM–ST), Music Hall (ST), Gin Palace (british; ST), Railway Hotel (ST) |
| `houseWord:bar` | Bar ×3, Lounge, Diner (general; MO), Motel (general; MO), Canteen (NF–IS), Rest (NF–IS) |

### 4.3 World anchors

| Pool | Entries |
|---|---|
| `auspicious` (chinese, korean) | Lasting Peace ×2, Ten Thousand Blessings, Peace and Plenty, Eternal Spring, Clear Brightness, Harmony, Abundance, Good Fortune, Joyful Arrival |
| `welcomePhrase` (chinese) | Welcome Guests ×2, Guests Return, Joyful Arrival, Gathered Friends, Long Road's End |
| `eastNature` (chinese, korean, japanese) | Jade River, Willow Bank, Plum Blossom, Bamboo Grove, Moon Pavilion, Golden Crane, Pine Wind, Maple, Cherry Blossom, Snow Country, Crane, Magpie, Autumn Moon, Spring Rain, Mountain Mist |
| `oasisAnchor` (arabic-persian) | Rose, Garden, Fountain, Cypress, Nightingale, Pomegranate, Crescent, Date Palm, Two Stars, Seven Wells |
| `indianAnchor` (indian) | Lotus ×2, Garden, River, Peacock, Mango Grove, Banyan, Moonlight, Jasmine, Monsoon |

---

## 5. Kinds

### 5.1 Line-up and weights by era (kind Any)

| Key | Menu | Plural | AN | MD | EM | ST | MO | NF | IS |
|---|---|---|--:|--:|--:|--:|--:|--:|--:|
| `inn` | Inns and lodgings | inns | 25 | 30 | 30 | 20 | 15 | 10 | 5 |
| `tavern` | Taverns and alehouses | taverns | 30 | 35 | 30 | 25 | 25 | 15 | 10 |
| `eating` | Eating, tea and coffee houses | eating houses | 10 | 10 | 15 | 15 | 20 | 15 | 10 |
| `wayhouse` | Way stations and caravan courts | way stations | 20 | 15 | 15 | 10 | 0 | 0 | 0 |
| `rest` | Rest houses and hostels | rest houses | 15 | 10 | 10 | 5 | 5 | 5 | 5 |
| `club` | Clubs, halls and hotels | clubs and hotels | 0 | 0 | 0 | 25 | 15 | 10 | 5 |
| `bar` | Bars and lounges | bars | 0 | 0 | 0 | 0 | 20 | 45 | 65 |

**Descriptions.** Inn: "Houses that lodge travellers". Tavern: "Drinking houses: taverns, alehouses, mead halls and pubs". Eating: "Cookshops, tea houses, coffee houses and cafés". Wayhouse: "Post houses, coaching inns and caravan courts on the road". Rest: "Charitable and pilgrim lodgings: rest houses, hostels and hospices". Club: "Gentlemen's clubs, music halls, gin palaces and grand hotels". Bar: "Bars, lounges and diners, down to station bars in space".

### 5.2 Setting effects on kinds

| Setting | Multipliers |
|---|---|
| in a town | club ×2, eating ×1.5, wayhouse ×0.5 |
| in the country | inn ×1.5, tavern ×1.5, club 0, eating ×0.5 |
| in a port | tavern ×2, wayhouse 0 |
| by the road | wayhouse ×4, inn ×2, club 0 |

---

## 6. English sign tradition

### 6.1 Who uses it

- **Fully:** general, anglo-saxon (MD on), celtic (MD on), norman-british.
- **In part** (at the share shown, the rest from §8): roman 40% (with "Sign of the" and "Inn of the" forms), slavic 40%, greek-byzantine 25% (MD on), norse 30% (MD on).
- **Not at all:** the other cultures, which use their own anchors (§8).
- In ST on, the tradition carries on for its users alongside the era shapes (§8.3), as English pubs did.

### 6.2 The sign table (Book of Names)

| Anchor | Weight | Shapes | Examples |
|---|--:|---|---|
| creature | 13 | `the {creature}` | the Griffin, the Wolf |
| person | 7 | `the {innPerson}` | the Jester, the Goose Girl |
| item | 10 | `the {item}` | the Harp, the Moon |
| arms | 3 | `the {streetFigure:poss} Arms` 40 · `the {surname} Arms` 30 · `the {trade:poss} Arms` 30 | the King's Arms, the Weavers' Arms |
| location | 3 | `the {innLocation}` 60 · `the Old {innLocation}` 40 | the Old Bridge, the Lakeshore |
| owner | 2 | `{owner:poss} {houseWord}` 50 · `Mother {owner:poss}` 25 · `Old {owner:poss}` 25 | Slorg's Cellar pattern, Mother Merla's |
| feature | 2 | `the {creatureOrPerson:poss} Head` 5 · `the {creature:poss} {innFeature}` 1 | the Boar's Head, the Stag's Antlers |
| description | 30 | `the {innDescription} {creatureOrItem}` 70 · `the {innNumber} {creatureOrItem:pl}` 30 | the Green Star, the Three Stags |
| combination | 30 | `the {a} and {b}` 70 · `the {creature} in {innWorn}` 8 · `the {creature:poss} {innHome}` 12 · `the {innFable}` 10 | the Bear and Barrel, the Hog in Armour, the Raven's Nest |

- `{creatureOrItem}`, `{creatureOrPerson}`: equal chance of either.
- `{a}`, `{b}`: creature 45, item 40, person 15; never the same word; `{a}` creature and `{b}` creature of the same kind may pair as mate (*the Fox and Vixen*, *the Hart and Hind*) at 10% where the pair is in `innPairs` (Fox/Vixen, Hart/Hind, Cock/Hen, Bull/Cow, Ram/Ewe, Stag/Hind, Drake/Duck).
- `{owner}`: placeholder `[owner]`; invented: a `{person}` (RN §4.2) or a GN `surname`, as available, else the shape gets weight 0.
- `{trade}`: SD `streetTrades` (caste rule: never for indian or west-african; this tradition doesn't reach them anyway).
- Arms are always "the … Arms"; Arms never takes a house word.
- In AN, arms and owner anchors are 0 (no heraldry).

### 6.3 Setting themes

| Setting | Multiplier on entries tagged |
|---|---|
| in a town | urban ×3; arms ×2 |
| in the country | rural ×3 |
| in a port | maritime ×4 |
| by the road | road ×3; the roadside shapes below gain weight |
| fantastic (any setting) | magical ×2 |

**Roadside shapes** (by the road; also at weight 3 elsewhere), English tradition:

| Shape | Weight | Example |
|---|--:|---|
| `the {route} Inn` | 10 | the Salt Way Inn |
| `the {travellers:poss} Rest` | 10 | the Drovers' Rest |
| `the {destination} Arms` | 5 | the Fenwick Arms |
| `the Halfway House` (fixed) | 3 | – |
| `the {innNumber} Mile House` | 4 | the Four Mile House |

`{route}` is one route name (RN), kind road, drove or trade, without a leading "the".

### 6.4 Form: house words

- **As signs:** the sign alone (*the Red Lion*).
- **With a house word:** the sign plus the kind's house word for the culture and era (*the Red Lion Inn*, *the Black Bull Tavern*), or, at 15%, `the Inn of the {sign}` / `the Sign of the {sign}` (*the Sign of the Hound*).
- **Either:** each name 60% sign, 40% with a house word.
- Arms, owner and "Rest"/"House" shapes never take another house word.

### 6.5 Regions

Region multipliers come from `rx` on entries (`innFable`, house words). Also: SHH and NSI halve heraldic `arms`; WAL doubles `Dragon` in `{creature}`.

---

## 7. Generation pipeline

```
era → kind (chosen, or §5.1 × §5.2)
    ↓
tradition    (English signs per §6.1 share, or the culture's own anchors §8.1, or era shapes §8.3)
    ↓
shape        (× setting themes §6.3 × tone)
    ↓
tokens       (pools §4, GN emblem lists, RN/SD sources)
    ↓
form         (§6.4, English tradition only)
    ↓
rendering → safeguards
```

- In ST on, era shapes (§8.3) take 40% of names (60% in NF–IS for bars); the rest use the culture's tradition.
- **Failure and batches:** as GN §4. Cap: 7 words.

---

## 8. Shapes

### 8.1 Culture anchors

At weights shown within the culture's share (not the English share). `{hw}` = the kind's house word for the culture and era.

| Culture | Shapes (weight) | Examples |
|---|---|---|
| anglo-saxon (AN) | `{owner:poss} Mead Hall` 40 · `Mead Hall of {town}` 30 · `the {creature} Hall` 30 | Tota's Mead Hall |
| celtic (AN) | `Hostel of {town}` 50 · `{owner:poss} Guest House` 30 · `Hostel of the {creature}` 20 | Hostel of Fenwick |
| norse | `{owner:poss} Hall` 35 · `Guest Hall of {town}` 30 · `the {creature} Hall` 20 · `Mead Hall of {town}` 15 | Ketil's Hall |
| roman | `Inn of the {creature}` 30 · `Sign of the {item}` 25 · `Station Inn of {town}` 20 (inn, wayhouse) · `Change Station of {town}` 10 (wayhouse) · `{owner:poss} Tavern` 15 | Inn of the Elephant pattern, Sign of the Wheel |
| greek-byzantine | `Wine House of {owner}` 30 · `Guest House of {holy}` 25 (MD on) · `Guest House of {town}` 25 · `the {creature} Wine House` 20 | Guest House of Saint Mamas pattern |
| slavic | `Post House of the {route}` 25 (wayhouse) · `{holy:poss} Inn` 20 · `the {colour} {item} Tavern` 30 · `{town} Post House` 25 | Post House of the Great Eastern Road |
| steppe | `{ordinal} Post Station` 30 · `Guest Tent of the {figure}` 25 · `{town} Caravan Court` 25 · `the {colour} Tent` 20 | Ninth Post Station, Guest Tent of the Khan |
| arabic-persian | `House of the {number} Wells` 20 · `Caravan Court of the {directionAdj} Gate` 20 · `Coffee House of the {oasisAnchor}` 20 (eating) · `{oasisAnchor} Coffee House` 15 · `{patron:poss} Caravan Court` 15 · `Inn of the {streetGoods} Merchants` 10 | House of the Seven Wells, Coffee House of the Two Stars |
| indian | `{indianAnchor} Rest House` 30 · `{founder:poss} Rest House` 20 · `Pilgrims' Lodge of the {holySite}` 20 · `{indianAnchor} Inn` 20 · `{town} Caravan Court` 10 (wayhouse) | Lotus Rest House |
| chinese | `Inn of {auspicious}` 30 · `{welcomePhrase} Inn` 20 · `{eastNature} Tea House` 25 (eating) · `{eastNature} Wine House` 15 (tavern) · `{town} Post Station` 10 (wayhouse) | Inn of Lasting Peace, Welcome Guests Inn, Jade River Tea House |
| japanese | `{eastNature} Inn` 35 · `{eastNature} Tea House` 30 (eating) · `Lords' Inn of {town}` 15 (EM) · `{town} Inn` 20 | Pine Wind Tea House |
| korean | `{eastNature} Tavern` 40 · `{town} Station Inn` 30 (wayhouse) · `Inn of {auspicious}` 30 | Plum Blossom Tavern |
| egyptian | `Beer House of {town}` 35 · `{owner:poss} Beer House` 35 · `House of Beer of {god}` 30 | – |
| ethiopian | `Mead House of {town}` 50 · `{owner:poss} Mead House` 50 | – |
| west-african | `House of {owner}` 30 · `Strangers' Lodge of {town}` 25 · `{weekday} Market Rest` 20 · `Landlord's House of {town}` 25 | – |
| bantu | `Guest House of {town}` 50 · `the {creature} Guest House` 50 | – |
| aztec, maya | `Merchants' House of the {directionAdj} Ward` 50 · `House of {town}` 30 · `the {creature} House` 20 | – |
| andean | `Royal Station of {town}` 60 · `{town} Way Station` 40 | – |
| polynesian | `Guest House of {town}` 100 (MO on only; earlier eras: kind rest only) | – |

- Kinds in brackets limit a shape to that kind; unmarked shapes serve inn, tavern and rest.
- Where a culture has no shape for the chosen kind, it uses `{owner:poss} {hw}` 50 and `{hw} of {town}` 50.

### 8.2 Fantastic additions

`h: true`, English tradition and all cultures not marked sensitive: `the {heraldicBeast:poss} Hoard` 3, `the Wizard's {item}` 3, `the Prancing {heraldicBeast}` 2, `the Drunken Dragon` (fixed) 1, `the Goblin's Rest` (fixed) 1, `the Troll and Toadstool` (fixed) 1. Real fiction blocked (§12).

### 8.3 Era shapes (WR §11.2–11.4)

| Era | Kind | Shapes (weight) | Examples |
|---|---|---|---|
| ST | club | `the {grandAdj} Gin Palace` 15 · `the {colour} {item} Music Hall` 15 · `the Great {directionAdj} Hotel` 15 · `{town} Station Hotel` 15 · `the {quality} Club` 15 · `{town} and County Club` 10 · `the {virtue} Temperance Hotel` 15 | the Great Northern Hotel |
| ST | eating | `{owner:poss} Coffee House` 40 · `the {item} Chop House` 30 · `{owner:poss} Dining Rooms` 30 | the Gridiron Chop House |
| ST (`h: true`) | any | `the Brass {creature}` 20 · `the Aether and Anchor` (fixed) 5 · `the Clockwork {creature}` 20 · `the Gaslight Rooms` (fixed) 10 · `the {colour} Cog` 15 · `the Copper Kettle and Boiler` (fixed) 5 | the Brass Owl |
| MO | eating | `{owner:poss} Café` 40 · `the {item} Café` 30 · `{town} Tea Rooms` 30 | – |
| MO | bar | `the {item} Bar` 25 · `{town} Motel` 15 (general) · `{owner:poss} Diner` 15 (general) · `the {colour} Room` 25 · `{brandRoot} Inn` 20 | – |
| NF–IS | bar | `the {tech} {creature}` 30 · `Deck {n} Bar` 15 · `the Last {drink} Before {star}` 15 · `{star} Lounge` 20 · `Spacers' Rest` (fixed) 10 · `the Airlock` (fixed) 10 | the Void Fox, the Last Drink Before Vega |
| NF–IS | inn, rest | `{star} Transit Hostel` 40 · `Dock {n} Bunkhouse` 30 · `the {spaceLand} Rest` 30 | – |

- `grandAdj`: Crystal, Golden, Palatial, Royal, Grand, Gilded. `virtue`: Sober, Abstainers', Prudent, Total.
- `drink`: Drink, Round, Pint, Glass, Toast.
- `quality`: GN `quality`. `tech`: GN `tech`. `{n}`: 1–40.

---

## 9. Series: as one town

- No creature, item, person, colour or anchor word twice in a batch.
- At most one Arms; at most one owner shape.
- In batches of 6 or more: exactly one roadside shape (§6.3) and one location shape (§6.2), so the town's inns point to its roads and landmarks.
- Kind Any: the mix follows the setting's kind weights.

---

## 10. Rendering

- Leading "the" lower case; a culture shape that starts "House", "Inn", "Hostel" and so on has no "the".
- "and" is always written as "and" (never "&").
- Possessives OUP (*the Drovers' Rest*, *the Weavers' Arms*, *the Boar's Head*).
- `{innNumber}` with a creature or item uses the plural (*the Three Stags*, *the Seven Stars*); "Two" may render as "Brace of" for birds at 20% (*the Brace of Pheasants*).

---

## 11. Tone

TS §2; tags in §4 and §8. Sensitive cultures (RN §12.4) draw no light or grim entries and no fantastic shapes.

---

## 12. Safeguards

### 12.1 Block list

Whole-name matches are redrawn (with or without a house word, and with or without "the").

- **Fiction:** Prancing Pony, Green Dragon, Leaky Cauldron, Three Broomsticks, Hog's Head, Hogs Head, Winchester, Slaughtered Lamb, Admiral Benbow, Jamaica Inn, Mended Drum, Drum, Broken Drum, Queen Vic, Queen Victoria, Rovers Return, Woolpack, Moe's, Cheers, Mos Eisley Cantina, Ten Forward, Quark's, Restaurant at the End of the Universe, Afterlife, Golden Perch, Bannered Mare, Sleeping Giant, Yawning Portal, Elfsong Tavern.
- **Real famous houses:** Ye Olde Trip to Jerusalem, Ye Olde Cheshire Cheese, Ye Olde Fighting Cocks, Prospect of Whitby, George Inn, Raffles, Savoy, Ritz, Langham, Adelphi, Crystal Palace, Café Royal, Lloyd's, Garrick Club, Reform Club, Athenaeum, Carlton Club, White's, Boodle's, Hellfire Club.

### 12.2 Flag list

Allowed by default: Red Lion, White Hart, Royal Oak, Crown, Rose and Crown, Crown and Anchor, King's Head, King's Arms, Swan, Bull, Plough, Anchor, Angel, Bell, George, George and Dragon, Coach and Horses, New Inn, White Horse, Black Bull, Cross Keys, Lamb and Flag, Rusty Anchor, Fleece, Wheatsheaf, Rising Sun, Halfway House.

### 12.3 Living religions

WR §10.1: Christian signs (*Cross Keys*, *Lamb and Flag*, *Angel*, saints) only for christian cultures. No living-religion divine names; `{god}` only for egyptian (as RN §12.3; the other four god cultures have no god shapes here).

### 12.4 Banned words and persons

- GN §12.3 and SD §13.5, plus the words Harlot, Strumpet, Wench, Gypsy, Savage, Barbarian, Blackamoor, Negro and Saracen.
- **Never these real historic signs** with racial imagery, or any sign built on them: the Moor's Head, the Saracen's Head, the Turk's Head, the Black Boy, the Black's Head. (*Moor* as land, as in *the Moor Inn*, stays allowed.)
- The Book of Names' person list is used with these removed (as GN §5.5 already did for groups).

### 12.5 Safeguard packs

`type: settlement-safeguards` (RN §12.6).

---

## 13. Presets

```yaml
---
type: module-preset
module: inn-names
packName: Harbour taverns
culture: norman-british
region: all
kind: tavern
era: EM
fantastic: false
setting: port
form: either
tone: any
people: invented
series: true
---

Norman & British taverns of the early modern era, in a realistic world, across all of Britain, in a port, as signs or with a house word, of any tone, with invented people and places, as one town.
```

| Key | Values | Default |
|---|---|---|
| `culture`, `region`, `era`, `fantastic`, `tone`, `people`, `series` | as RN §13 | as there |
| `kind` | `any` or a kind key | `any` |
| `setting` | `anywhere`, `town`, `country`, `port`, `road` | `anywhere` |
| `form` | `signs`, `house`, `either` | `either` |

---

## 14. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Vocabulary.** The `th` tag and pack syntax (§3), the new pools (§4), register rows | §15.1 passes; RN and SD tests still pass |
| M2 | **Engine.** Kinds, settings, the sign table, house words, culture anchors, era shapes, series, safeguards | §15.2–§15.6 pass |
| M3 | **Module.** Section, sentence, history, presets | §15.7 passes; the module generates in the app |

---

## 15. Tests (`tests/innNames.test.ts`)

### 15.1 Vocabulary

- New entries valid; `th` values are the five themes; a pack line `- Eel Trap [maritime]` is read with its theme.

### 15.2 Coverage and determinism

- Same options and seed give the same names.
- Every culture × era × kind offered × setting × form × people: 20 unique names within the cap.

### 15.3 Sign table

- Norman & British MD, kind Any, form "as signs", 10,000 names: anchor shares within ±3 points of the §6.2 table.
- AN: no Arms and no owner shapes.
- Arms never carry a house word; "the" is always lower case at the start.

### 15.4 Settings

- In a port: maritime-tagged words appear at least 3× as often as with anywhere (same seed count).
- By the road: at least 20% of 2,000 names are roadside shapes or way-station kinds; every `{route}` passes route safeguards.

### 15.5 Cultures and eras

- chinese, japanese, arabic-persian, indian, west-african: no English sign shape (no "the {creature}" without a culture anchor).
- ST club: at least one of the §8.3 shapes in 500 names; IS: bars dominate (≥ 50%).
- Sensitive cultures: no light, grim or fantastic entries.

### 15.6 Series and safeguards

- Series of 8: no anchor word repeats; exactly one roadside and one location shape; at most one Arms.
- 5,000 names per culture: 0 block-list matches, 0 banned words or persons; christian signs only for christian cultures.

### 15.7 Sentence and presets

- Default plain text: "Norman & British houses of any kind of the medieval era, in a realistic world, across all of Britain, anywhere, as signs or with a house word, of any tone, with placeholders for people and places, each one separate."
- Form link hidden for chinese.
- Preset round-trip.

---

## 16. Parked

- Inn details: landlord, speciality, reputation.
- Drink and food names (ales, wines, dishes) as their own module.
- Inns placed on a specific street or route from a vault's notes.
- Sign descriptions (what the painted sign shows) as a details line.


---

## Buildings back-link

Added by the buildings and landmarks brief (§11.2): the location anchor gains `the {landmark}` at 20% of location draws (weight 25 beside 60 and 40), with `{landmark}` one `buildingName()` of kind defence, crossing, water or monument, without "the" and of 3 words or fewer (*the Grey Tower*, *the Lady Well*). Roadside shapes gain `the {landmark} Inn` (weight 3, no house word), kinds crossing and monument (*the Old Bridge Inn*, *the Four Mile Stone Inn*). Landmarks pass the building safeguards.
