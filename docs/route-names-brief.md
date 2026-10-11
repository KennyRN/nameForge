# Route names – brief (first release)

This brief adds a module, **route names**, to the **place names** group. It names long-distance roads, tracks, trade routes, pilgrim ways, military roads, sea routes, railways and canals, modern roads and space lanes, for 22 cultures from the ancient world to interstellar settings.

It is the first of two briefs built from `docs/worldbuilding-research-reference.md` (WR §x). The second, **streets and districts**, builds on it. To make sure later research can feed both, and every module after them, this brief also sets up:

- **a shared vocabulary file** (`src/data/settlement-vocab.json`) that route names, streets and districts, and later inns, buildings and a settlement kit all read
- **vocabulary packs**: markdown notes that add words to those shared pools, per culture and era, with no code change
- **a pool register** (`docs/vocabulary-pools.md`) listing every pool, its tags and which modules read it, which every later brief updates

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow `docs/group-names-brief.md` (GN §x), `docs/group-tone-and-series-brief.md` (TS §x), `docs/bynames-and-titles-brief.md` (BT §x), `docs/realms-and-polities-brief.md` (RP §x) and `docs/ships-and-spacecraft-brief.md` (SS §x). Reuse existing helpers (weighted draws, tone factor, series, `groupTown` and `townSource`, BT ranks, tribal names, safeguard checks) rather than copying them.

All output is in modern English. Real route names are models, never outputs (§12).

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | A new module `routeNames` in the place names group, after native place names |
| Cultures | 22: General, the 19 byname cultures, Polynesian, Andean |
| British regions | The 12 place-shape regions, offered for anglo-saxon, celtic and norman-british |
| Eras | ancient · medieval · early modern · steam age · modern · near future · interstellar |
| Fantastic | A switch. Steam age + fantastic = **steampunk**. |
| Kinds | roads and ways · trade routes · pilgrim and holy roads · military roads · droves and tracks · sea routes · railways and canals · modern roads · space lanes |
| Tone | The five tones (TS §2) |
| Series | **As one network**: directions turn round the compass and destinations change, so a set reads like the roads out of one town (§9) |
| Shared vocabulary | `settlement-vocab.json`, extendable by vocabulary packs (§3) |
| Ends of the route ("Saltgate to Fenwick") | Parked |

---

## 1. Module

### 1.1 Section

- Add `routeNames` to `NameForgeSection`, label **"route names"**, Lucide icon `route`.
- Insert it in `SECTION_GROUPS.placeNames` and `SECTION_ORDER` straight after `placeShapes`.

### 1.2 History

`route names · {era label} · {culture label}`, then ` · {region phrase}` when a region is chosen, ` · {kind}` when not Any, ` · steampunk` or ` · fantastic` when the switch is on, ` · {tone}` when not Any, ` · network` in a series. `historySection()` maps labels starting "route names" to `routeNames`.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/settlement-vocab.json` | The shared pools (§3, §6) |
| `src/data/route-names.json` | Cultures, kinds, shapes, region multipliers (§4–§8), safeguards (§12) |
| `src/settlement/vocab.ts` | Loads the shared pools and merges vocabulary packs (§3.3). No Obsidian imports. |
| `src/routes/engine.ts` | Generation (§7), series (§9), rendering (§10), safeguards. No Obsidian imports. |
| `src/routes/sentence.ts` | The sentence (§2) |
| `src/settlement/vocabPacks.ts` | Reads `type: vocabulary` notes (§3.3) |
| `docs/vocabulary-pools.md` | The pool register (§3.4) |
| `tests/routeNames.test.ts`, `tests/settlementVocab.test.ts` | §15 |

Add this brief to `docs/` as `route-names-brief.md`.

---

## 2. The sentence

### 2.1 Shape

> ‹Norman & British› ‹routes of any kind› of the ‹medieval› era, in a ‹realistic› world, ‹across all of Britain›, ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›.

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | the culture label | General, then the 21 cultures in §4.1 order | `norman-british` |
| `kind` | "routes of any kind" or the kind's plural (§5) | Any, then the kinds offered in the era (§5.2) | any |
| `era` | "of the ‹label› era" | the 7 (§4.3) | `medieval` |
| `fantastic` | "in a ‹realistic› world" / "in a ‹fantastic› world"; in the steam age "in a ‹realistic› world" / "in a ‹steampunk› world" | the two | realistic |
| `region` | "‹across all of Britain›" / "‹in the North›" | all of Britain, then the 12 regions (phrases as native place names) | all of Britain |
| `tone` | as TS §5.2 | the six | any |
| `people` | as GN §2.2 | placeholders · invented | placeholders |
| `series` | "each one separate" · "as one network" | the two | separate |

- **Region link:** shown only for anglo-saxon, celtic and norman-british. Hidden reads as all of Britain.
- **Series link:** always shown (a network works with kind Any).
- **Tooltips:** culture, "Naming culture: whose customs the routes follow"; kind, the kind's description (§5.1); era, "The age: decides which kinds of route exist"; fantastic, "Open magic and monsters; in the steam age, steampunk"; region, "Weights the routes towards a region's customs"; series, "A network: roads out of one place in each direction, or to different places"; tone and people as TS and GN.

### 2.3 Resets

- **Era changed:** a kind not offered in the new era resets to Any.
- **Culture changed** away from the three British cultures: region resets to all of Britain.

### 2.4 Plain text, state, presets

As GN §2.5–§2.6. Presets in §13.

---

## 3. Shared vocabulary and vocabulary packs

### 3.1 The file

`src/data/settlement-vocab.json` holds **pools**: named, weighted word lists. Each entry:

```json
{ "w": "Drovers", "x": 1, "t": ["plain"], "e": ["MD", "EM", "ST"], "c": ["celtic"], "h": false }
```

| Key | Meaning | Default |
|---|---|---|
| `w` | the word as it appears in a name | required |
| `x` | weight | 1 |
| `t` | tone tags (TS §2.3) | none |
| `e` | era codes (§4.3) where it's used | all eras |
| `c` | culture keys where it's used; `!key` excludes a culture | all cultures |
| `h` | true: fantastic only; false: realistic only | both |
| `pl` | plural, where `pluralOf` would be wrong | – |

A pool can also carry `"cultureExtra": { "<culture>": [entries] }`: words added for that culture at **×3**.

### 3.2 Pools introduced by this brief

The pools in §6 are created here. Brief 2 (streets and districts) adds its own to the same file.

### 3.3 Vocabulary packs

A **vocabulary pack** is a markdown note with `type: vocabulary` in its frontmatter. Its `##` headings name pools, and its `-` lines add words.

```markdown
---
type: vocabulary
---

## travellers
- Tinkers
- Salt-Wives

## routeGoods · japanese
- Rice
- Lacquer

## routeGoods · japanese · MD
- Swords

## routeFixed:sea · polynesian
- Path of the Morning Star
```

- **Heading form:** `## {pool}`, then optionally ` · {culture key}` and/or ` · {era code}`, in either order.
- **Lines:** `- word`, optionally followed by ` ×n` for a weight (e.g. `- Tinkers ×0.5`) and/or ` (grim)`-style tone tags in brackets: `- Corpse Bearers (grim)`.
- **Merging:** every vocabulary pack in the names folder is read, as safeguard packs are. Its words are **added** to the built-in pool, with the culture and era tags from the heading. Built-in words can't be removed by a pack. A word the safeguards block is dropped as usual.
- **Unknown pool or culture:** reported as `Unknown pool “{x}” in vocabulary pack “{note}”.` or `Unknown culture “{x}” …`; that section is skipped.
- **Command:** "Create vocabulary pack" writes **Vocabulary.md** (never overwriting) with the frontmatter, a one-line explanation, and every pool name as an empty `##` heading, so the user sees what can be extended.
- **Modules:** every module that reads a pool reads the merged pool. Packs need no module key.

### 3.4 The pool register

Write `docs/vocabulary-pools.md`: a table of every pool in `settlement-vocab.json` with its purpose, its allowed tags and the modules that read it. Later briefs add rows. Format:

| Pool | Holds | Read by |
|---|---|---|
| `travellers` | plural travellers for "‹travellers›' Way" | route names |

---

## 4. Cultures, regions and eras

### 4.1 Cultures

| Key | Label | Notes |
|---|---|---|
| `general` | General | culture-free |
| `anglo-saxon` | Anglo-Saxon | region link |
| `norse` | Norse | |
| `celtic` | Celtic | region link |
| `norman-british` | Norman & British | region link; default |
| `roman` | Roman / Italian | |
| `greek-byzantine` | Greek & Byzantine | |
| `slavic` | Slavic | |
| `steppe` | Turkic & Mongol steppe | |
| `arabic-persian` | Arabic & Persian | |
| `indian` | Indian | |
| `chinese` | Chinese | |
| `japanese` | Japanese | |
| `korean` | Korean | |
| `egyptian` | Egyptian | |
| `ethiopian` | Ethiopian | |
| `bantu` | Bantu | |
| `west-african` | West African | |
| `aztec` | Aztec | |
| `maya` | Maya | |
| `polynesian` | Polynesian | sensitive (§12.4) |
| `andean` | Andean | sensitive (§12.4) |

Menu groups as BT §4.1, with Polynesian and Andean in a final group "the Pacific and the Andes".

**British cultures** in this brief means anglo-saxon, celtic and norman-british. **Christian cultures** means anglo-saxon, celtic, norman-british, slavic, and greek-byzantine and roman in MD on, as in GN and SS.

### 4.2 Supporting sources

| Token | Source |
|---|---|
| `{town}`, `{destination}` | `groupTown(setting, townSource(culture), rng)`. Polynesian and Andean use a land compound (GN §8.4). Placeholder `[place]`. |
| `{folk}` | One tribes and kin groups name, using RP's culture→tradition map (Polynesian → `polynesian`, Andean → `andean`) and the tribal defaults, without its leading "the". Placeholder `[folk]`. |
| `{person}` | Invented: the world culture's `name` list where it has one (anglo-saxon, norse). Other cultures: shapes using `{person}` get weight 0 in invented mode. Placeholder `[person]`. |
| `{founder}` | Placeholder `[founder]`; invented as `{person}`. |
| `{patron}` | Placeholder `[patron]`; invented as `{person}`. |
| `{figure}` | The culture's BT ranks (§6.2 there), English men's form, at BT weights; General uses BT General. Polynesian: Chief, High Chief. Andean: Lord, Great Lord. |
| `{kingdom}` | One realms name for the culture and era, character territorial, named for land, **short** output (RP §11). Placeholder `[kingdom]`. |
| `{holy}` | GN §8.2 saints, for christian cultures only. Placeholder `[holy person]`. |
| `{god}` | The world culture's `god` list, for egyptian, norse, anglo-saxon, aztec and maya only (§12.3). |
| `{star}`, `{spaceLand}`, `{greek}`, `{ordinal}`, `{number}`, `{colour}` | group-names.json, with their rules |
| `{goods}` | `routeGoods` (§6) |

### 4.3 Eras

| Code | Label | Group setting (realistic / fantastic) |
|---|---|---|
| `AN` | ancient | FL / FH |
| `MD` | medieval | FL / FH |
| `EM` | early modern | FL / FH |
| `ST` | steam age | MR / MF (steampunk) |
| `MO` | modern | MR / MF |
| `NF` | near future | SF / SF |
| `IS` | interstellar | SF / SF |

The group setting is used for `groupTown` and for any group-names list read through its setting tags.

### 4.4 British regions

Region codes as `place-shape-regions.json`. Multipliers apply to shapes (§8) carrying the named **region tags**. Unlisted regions are ×1.

| Region tag | Shapes | COR | WCY | SEA | EAN | WMM | WAL | EMD | NTH | SBL | SLO | SHH | NSI |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| `roman` | Street shapes | 0.3 | 1 | 1.5 | 1.5 | 1.5 | 0.5 | 1.5 | 1.2 | 0.8 | 0.3 | 0 | 0 |
| `drove` | the drove kind | 1 | 1 | 0.5 | 0.5 | 1.5 | 3 | 1 | 2 | 3 | 2 | 3 | 2 |
| `causeway` | Causeway shapes | 1 | 1.5 | 1 | 3 | 1 | 2 | 1.5 | 1 | 1 | 1 | 1 | 1 |
| `corpse` | Corpse Road | 1 | 1 | 0.5 | 0.5 | 1 | 1 | 1 | 3 | 3 | 1 | 1 | 1 |
| `salt` | Salt Way | 1 | 1 | 1 | 1.5 | 3 | 1 | 1.5 | 1 | 1 | 1 | 1 | 1 |
| `ridge` | Ridgeway, Downs Way | 1 | 2 | 2 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0.3 | 0.3 |
| `packhorse` | Packhorse Road | 2 | 2 | 0.5 | 0.5 | 1 | 1.5 | 1 | 3 | 1.5 | 1 | 1 | 1 |
| `army` | Army Way | 1 | 2 | 2 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| `pedlar` | Pedlars' Way | 1 | 1 | 1 | 2 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| `militaryRoad` | Military Road shapes in EM | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 2 | 2 | 3 | 1 |
| `peat` | Peat Road, Summer Pasture Path | 1 | 1 | 0 | 0 | 0.5 | 2 | 0 | 1.5 | 1.5 | 1.5 | 3 | 3 |

---

## 5. Kinds

### 5.1 Line-up

| Key | Menu | Plural | Description |
|---|---|---|---|
| `road` | Roads and ways | roads and ways | Long-distance roads, old ways and highways |
| `trade` | Trade routes | trade routes | Salt ways, caravan roads and goods routes |
| `pilgrim` | Pilgrim and holy roads | pilgrim roads | Pilgrims' ways, sacred ways and corpse roads |
| `military` | Military roads | military roads | Army ways, frontier and post roads |
| `drove` | Droves and tracks | droves and tracks | Drove roads, packhorse ways and old tracks |
| `sea` | Sea routes | sea routes | Passages, runs and sea roads |
| `rail` | Railways and canals | railways and canals | Canals from the early modern era; railways from the steam age |
| `motor` | Modern roads | modern roads | Numbered roads, highways and bypasses |
| `space` | Space lanes | space lanes | Runs, lanes, corridors and jump routes |

"Any" phrase: "routes of any kind".

### 5.2 Weights by era (kind Any)

0 means the kind isn't offered in that era.

| Kind | AN | MD | EM | ST | MO | NF | IS |
|---|--:|--:|--:|--:|--:|--:|--:|
| road | 30 | 30 | 25 | 15 | 10 | 5 | 0 |
| trade | 25 | 20 | 20 | 10 | 5 | 5 | 0 |
| pilgrim | 10 | 15 | 10 | 5 | 3 | 0 (fantastic 5) | 0 (fantastic 5) |
| military | 15 | 10 | 10 | 5 | 2 | 0 | 0 |
| drove | 10 | 15 | 15 | 10 | 2 | 0 | 0 |
| sea | 10 | 10 | 15 | 10 | 5 | 5 | 0 |
| rail | 0 | 0 | 5 | 40 | 20 | 15 | 0 |
| motor | 0 | 0 | 0 | 0 | 50 | 30 | 0 |
| space | 0 | 0 | 0 | 0 | 0 | 40 | 100 |

In EM, rail offers canal shapes only.

### 5.3 Culture kind multipliers

| Culture | Multipliers |
|---|---|
| steppe | trade ×2, military ×1.5, sea ×0.2 |
| arabic-persian | trade ×2, pilgrim ×1.5 |
| west-african, ethiopian | trade ×2 |
| egyptian | pilgrim ×1.5, sea ×0.5 |
| polynesian | sea ×4, road ×0.5, drove 0, military 0 |
| andean | road ×1.5, military ×0.5, sea ×0.3 |
| norse | sea ×2 |
| japanese, korean | pilgrim ×1.5 |
| roman | military ×1.5, road ×1.5 |

---

## 6. Pools (settlement-vocab.json)

| Pool | Entries |
|---|---|
| `direction` | North, South, East, West; North-East, North-West, South-East, South-West ×0.2 |
| `directionAdj` | Northern, Southern, Eastern, Western |
| `travellers` | Pedlars ×2 (light), Drovers ×2, Pilgrims ×2, Carriers, Saltmen, Packmen, Merchants ×2, Smugglers (light), Soldiers, Tinkers (light), Shepherds, Miners, Monks (christian cultures), Colliers (ST), Navvies (ST) |
| `routeFeature` | Ditch ×2, Dyke, Bank, Mound, Barrow, Wall, Stone, Cross, Thorn, Beacon |
| `routeMaterial` | Stone ×2, Flint, Chalk, Gravel, Sand, Timber, Plank, Cobble (EM on), Brick (ST on) |
| `routeLandform` | Downs, Fen, Moor, Heath, Wold, Fell, Dale, Vale, Marsh, Hill, Cliff, Shore, Forest, Desert (arabic-persian, egyptian, west-african, steppe), Steppe (steppe), Highland |
| `routeGoods` | Salt ×3, Wool ×2, Amber, Tin, Lead, Iron, Copper, Grain, Corn, Timber, Fish, Cloth, Silk, Spice, Gold, Silver, Furs, Horses, Coal (ST on), Cotton (ST on) |
| `routeGoods` `cultureExtra` (×3) | anglo-saxon, norman-british, celtic: Wool, Salt, Tin, Lead · norse: Furs, Amber, Fish · roman: Salt, Wine, Olive Oil · greek-byzantine: Wine, Silk, Olive Oil · slavic: Furs, Amber, Wax, Honey · steppe: Horses, Felt, Tea · arabic-persian: Incense, Spice, Pearls, Dates · indian: Pepper, Cotton, Spice · chinese: Silk, Tea, Porcelain, Jade · japanese: Rice, Salt, Silk · korean: Ginseng, Paper, Silk · egyptian: Gold, Grain, Linen · ethiopian: Salt, Incense, Coffee · bantu: Copper, Gold, Cattle · west-african: Salt, Gold, Kola · aztec, maya: Cacao, Jade, Obsidian, Salt · polynesian: Stone, Feather · andean: Salt, Wool, Silver |
| `holySite` | Holy Well ×2, Shrine ×2, Oracle, Holy Mountain, Sacred Spring, Standing Stones, Sacred Grove, Temple, Holy Isle; christian cultures: Abbey, Minster |
| `holySitePl` | Shrines, Temples, Wells, Springs, Stones, Monasteries (christian cultures, greek-byzantine, korean, japanese) |
| `dayNumber` | Seven, Ten, Twelve, Twenty, Thirty |
| `jFeature` (japanese) | Sea ×2, Mountain ×2, Province, Coast, River, Pine |
| `romanRoadNomen` (roman) | Fabian, Junian, Licinian, Sempronian, Tullian, Sulpician, Caecilian, Calpurnian, Antonian, Octavian, Livian, Servilian, Manlian, Furian, Horatian |
| `spaceGoods` | Ice ×2, Helium, Ore ×2, Water, Data, Salvage, Fuel |
| `skyPath` (polynesian) | Morning Star, Evening Star, Rising Swell, Trade Wind |

Fixed whole names are also pools, one per kind, so packs can add to them: `routeFixed:road`, `routeFixed:trade`, `routeFixed:pilgrim`, `routeFixed:military`, `routeFixed:drove`, `routeFixed:sea`, `routeFixed:rail`, `routeFixed:motor`, `routeFixed:space`. Their built-in entries are the "fixed" rows in §8.

---

## 7. Generation pipeline

```
era → kind (chosen, or §5.2 × §5.3)
    ↓
shape        (§8: kind's shared shapes + culture shapes; filtered by era, culture, fantastic;
              × region (§4.4) × tone factor)
    ↓
tokens       (pools §6 merged with packs; supporting sources §4.2)
    ↓
rendering    (§10)
    ↓
safeguards   (§12)
```

- **Culture shapes** (§8.10) are added to the kind's shared shapes at their weights. A culture's `replace` list removes named shared shapes for that culture.
- **Fantastic:** shapes and words marked `h: true` only with the switch on; `h: false` only with it off.
- **Space kind and culture:** 25% of space-lane names use one of the culture's road, trade, pilgrim or sea shapes with `{destination}` and `{town}` read as `{star}` (SS §4.3 style: customs carry over). E.g. *Caravan Road to Vega*.
- **Failure and batches:** as GN §4. Cap: 8 words.

---

## 8. Shapes

Columns: weight within the kind; eras; cultures (`all`, `british`, `christian`, or keys); region tag (§4.4); tone. `fixed` shapes draw from `routeFixed:{kind}`.

### 8.1 Roads and ways

| Shape | Weight | Eras | Cultures | Region | Tone | Example |
|---|--:|---|---|---|---|---|
| `{direction} Road` | 10 | AN–NF | all | – | plain | West Road |
| `Great {direction} Road` | 8 | MD–MO | all | – | – | Great East Road |
| `Old {direction} Road` | 6 | EM–MO | all | – | – | Old West Road |
| `{destination} Road` | 15 | all | all | – | plain | Saltgate Road |
| `Road to {destination}` | 5 | all | all | – | – | Road to Fenwick |
| `{destination} Street` | 6 | AN–MD | british, roman | roman | – | Fenwick Street |
| `{figure:poss} Highway` | 6 | MD–ST | all | – | grand | King's Highway |
| `{figure:poss} Road` | 6 | all | all | – | grand | Emperor's Road |
| `{person:poss} Road` | 4 | all | all | – | – | Tota's Road |
| `{person:poss} Causeway` | 2 | all | all | causeway | – | Helen's Causeway pattern |
| `{folk} Way` | 10 | AN–MD | british, norse | – | – | Reed Folk Way |
| `Street of {person:poss} People` | 5 | AN–MD | anglo-saxon, norman-british | roman | – | Street of Tota's People |
| `{routeFeature} Way` | 8 | AN–MD | british | – | plain | Ditch Way |
| `{routeMaterial} Street` | 8 | AN–MD | british | roman | plain | Stone Street |
| `{kingdom} Street` | 3 | MD | anglo-saxon, norman-british | roman | grand | [kingdom] Street |
| `{routeLandform} Way` | 6 | all | all | ridge (Downs only) | – | Fen Way |
| `{destination} Causeway` | 3 | all | all | causeway | – | Fenwick Causeway |
| `{destination} Turnpike` | 6 | EM–ST | british, general | – | plain | Ashby Turnpike |
| `{destination} Mail Road` | 4 | EM–ST | british, general | – | – | Saltgate Mail Road |
| fixed | 6 | (per entry) | – | – | – | see below |

`routeFixed:road`: Ridgeway (AN–MD, british, region ridge), Hollow Way (MD–ST, british), Green Lane (MD–ST, british), Old Road ×0.5 (all), High Road (EM–ST), Great Road (AN–MD, celtic, indian).

### 8.2 Trade routes

| Shape | Weight | Eras | Cultures | Region | Tone | Example |
|---|--:|---|---|---|---|---|
| `{goods} Way` | 15 | AN–EM | all | salt (Salt only) | plain | Salt Way |
| `{goods} Road` | 20 | all | all | salt (Salt only) | plain | Amber Road |
| `{goods} Route` | 8 | EM–MO | all | – | – | Spice Route |
| `{goods} and {goods} Road` | 4 | all | all | – | – | Tea and Silk Road |
| `{travellers:poss} Way` (Merchants, Carriers, Pedlars, Packmen, Saltmen) | 10 | MD–EM | all | pedlar (Pedlars only) | – | Carriers' Way |
| `{dayNumber} Days Road` | 5 | AN–EM | arabic-persian, egyptian, west-african, ethiopian, steppe | – | strange | Twelve Days Road |
| `Road of the {number} Wells` | 5 | AN–EM | arabic-persian, west-african, steppe, indian | – | – | Road of the Seven Wells |
| `Caravan Road to {destination}` | 6 | AN–ST | arabic-persian, steppe, ethiopian, west-african, indian, chinese | – | – | Caravan Road to Ashby |
| fixed | 4 | | | | | |

`routeFixed:trade`: Market Way (MD, british), Silk Road ×0.2 (all; flagged), Incense Road (AN–EM, arabic-persian, ethiopian).

`{goods} and {goods}` never repeats a word.

### 8.3 Pilgrim and holy roads

| Shape | Weight | Eras | Cultures | Region | Tone | Example |
|---|--:|---|---|---|---|---|
| `Pilgrims' Road to {holySite}` | 15 | all | all | – | – | Pilgrims' Road to the Holy Well |
| `Sacred Way to {holySite}` | 10 | AN–EM | all | – | grand | Sacred Way to the Oracle |
| `Road of the {number} {holySitePl}` | 8 | all | all | – | strange | Road of the Seven Shrines |
| `Way of {holy}` | 8 | MD–MO | christian | – | grand | Way of Saint Aldric |
| `Ways of {god}` | 8 | AN | egyptian | – | grand | Ways of Horus pattern |
| `{destination} Pilgrim Road` | 8 | MD–ST | japanese, korean, indian, chinese | – | – | Fenwick Pilgrim Road |
| `White Road to {holySite}` | 10 | AN–MD | maya | – | – | White Road to the Temple |
| fixed | 6 | | | | | |

`routeFixed:pilgrim`: Pilgrims' Way (MD–MO, all; flagged), Sacred Way (AN, roman, greek-byzantine), Corpse Road (MD–EM, british, region corpse, grim), Coffin Way (MD–EM, british, region corpse, grim).

**Fantastic** (`h: true`): `Road of the {number} Gods` (5, AN–EM), `Spirit Road` (fixed, 4), `Ghost Road` (fixed, 3, grim); NF IS: `Pilgrim Stars`, `Starlit Way`, `Road of the {number} Suns` (fixed and shape, 10).

### 8.4 Military roads

| Shape | Weight | Eras | Cultures | Region | Tone | Example |
|---|--:|---|---|---|---|---|
| `{figure:poss} Army Road` | 5 | AN–EM | all | – | grim | King's Army Road |
| `{destination} Military Road` | 8 | EM–ST | all | militaryRoad | plain | Fenwick Military Road |
| `{ordinal} Legion's Road` | 6 | AN | roman | – | – | 9th Legion's Road |
| `{directionAdj} Frontier Road` | 8 | all | all | – | – | Northern Frontier Road |
| `Road of the {number} Forts` | 6 | AN–ST | all | – | – | Road of the Seven Forts |
| `{destination} Post Road` | 8 | AN–ST | steppe, chinese, roman, slavic, arabic-persian, andean | – | plain | Saltgate Post Road |
| fixed | 6 | | | | | |

`routeFixed:military`: Army Way (MD, british, region army), Straight Road (AN, chinese, roman), Wall Road (AN–MD, roman, chinese), Post Road (AN–ST, steppe, chinese, slavic), Frontier Road (all).

### 8.5 Droves and tracks

| Shape | Weight | Eras | Cultures | Region | Tone | Example |
|---|--:|---|---|---|---|---|
| `{destination} Drove` | 10 | MD–ST | all | drove | plain | Ashby Drove |
| `{travellers:poss} Way` (Drovers, Shepherds, Packmen, Saltmen, Tinkers, Miners) | 15 | MD–ST | all | drove | – | Drovers' Way |
| `{destination} Packhorse Road` | 6 | MD–EM | british | packhorse | – | Fenwick Packhorse Road |
| `{goods} Track` | 8 | all | all | – | plain | Salt Track |
| `{destination} Portage` | 5 | MD | slavic, norse | – | – | Saltgate Portage |
| fixed | 12 | | | | | |

`routeFixed:drove`: Drove Road (MD–ST), Packhorse Road (MD–EM, british, region packhorse), Hollow Way (MD–ST, british), Green Lane (MD–ST, british), Old Track, Cattle Road (bantu, celtic, steppe), Corpse Road (MD–EM, british, region corpse, grim), Peat Road (celtic, norse, region peat), Summer Pasture Path (celtic, norse, region peat), Winter Road (slavic, EM–ST).

### 8.6 Sea routes

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `{directionAdj} Passage` | 10 | all | all | – | Northern Passage |
| `{goods} Route` | 10 | MD–MO | all | – | Spice Route |
| `Sea Road to {destination}` | 15 | all | all | – | Sea Road to Fenwick |
| `{destination} Run` | 10 | EM–MO | all | – | Saltgate Run |
| `{direction} Way` | 8 | MD | norse | – | East Way |
| `Star Path to {destination}` | 15 | all | polynesian | – | Star Path to Fenwick |
| `{skyPath} Path` | 10 | all | polynesian | strange | Morning Star Path |
| fixed | 6 | | | | |

`routeFixed:sea`: Island Passage, Sea Lane (ST–NF), Monsoon Road (arabic-persian, indian, chinese), Whale-Road (AN–MD, anglo-saxon, norse; strange), Ship-Way (AN–MD, norse).

### 8.7 Railways and canals

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `{town} and {town} Canal` | 12 | EM–ST | all | plain | Ashby and Fenwick Canal |
| `Grand {directionAdj} Canal` | 8 | EM–ST | all | grand | Grand Western Canal |
| `{goods} Canal` | 5 | EM–ST | all | plain | Coal Canal |
| `{town} and {town} Railway` | 15 | ST–MO | all | plain | Saltgate and Ashby Railway |
| `{town}–{town} Railway` | 10 | ST–MO | chinese, korean, japanese, slavic, indian | plain | Fenwick–Ashby Railway |
| `Great {directionAdj} Railway` | 10 | ST–MO | all | grand | Great Northern Railway |
| `{directionAdj} Line` | 8 | ST–NF | all | – | Eastern Line |
| `{directionAdj} Main Line` | 6 | ST–MO | all (japanese ×3) | – | Western Main Line |
| `{town} Branch` | 6 | ST–MO | all | plain | Fenwick Branch |
| `{town} Light Railway` | 4 | ST–MO | british, general | light | Ashby Light Railway |
| `{town} Tramway` | 5 | ST–MO | all | plain | Saltgate Tramway |
| `{directionAdj} Express` | 4 | MO–NF | all | – | Southern Express |

**Steampunk** (ST, `h: true`): `{town} Skyway` 10, `Aether Lane {numberWord}` 8, `Imperial Air Road` (fixed) 3, `Pneumatic Line` (fixed) 4, `Brass Line` (fixed) 4, `{town} Overhead` 5, `{directionAdj} Airship Road` 6.

Real railway and canal names are blocked (§12.1), so the shapes produce invented ones.

### 8.8 Modern roads

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `{roadLetter}{n}` | 15 | MO–NF | british (A ×3, B ×2, M) | plain | A143, M6 |
| `Route {n}` | 10 | MO–NF | general | plain | Route 12 |
| `National Road {n}` | 8 | MO–NF | all except british, general | plain | National Road 7 |
| `{directionAdj} Highway` | 10 | MO–NF | all | – | Northern Highway |
| `{town} Bypass` | 10 | MO–NF | all | plain | Fenwick Bypass |
| `{town} Ring Road` | 8 | MO–NF | all | plain | Ashby Ring Road |
| `{directionAdj} Circular` | 5 | MO–NF | british | plain | South Circular pattern |
| `{town} Expressway` | 6 | MO–NF | all (chinese, japanese, korean ×3) | – | Saltgate Expressway |
| `{directionAdj} Motorway` | 6 | MO–NF | british, general | plain | Eastern Motorway |
| `{person:poss} Highway` | 4 | MO | all | – | [person]'s Highway |
| `{destination} Trail` | 5 | MO | general | – | Fenwick Trail |

- `{n}`: for British A and B roads 1–9999 (weights: 1–99 ×3, 100–999 ×2, 1000–9999 ×1); M roads 1–99; Route and National Road 1–199.
- Road numbers are not names, so real numbers (A1, M6) are allowed.

### 8.9 Space lanes

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `{star} Run` | 15 | NF–IS | all | – | Vega Run |
| `{star}–{star} Lane` | 15 | NF–IS | all | – | Altair–Vega Lane |
| `{spaceLand} Corridor` | 10 | NF–IS | all | – | Outer Belt Corridor |
| `{ordinal} Jump Route` | 8 | IS | all | plain | 3rd Jump Route |
| `Gate Chain {greek}` | 8 | IS | all | plain | Gate Chain Tau |
| `{spaceGoods} Run` | 8 | NF–IS | all | plain | Ice Run |
| fixed | 10 | | | | |

`routeFixed:space`: The Long Haul, The Dark Lane (grim), The Pilgrim Road, The Quiet Lane (strange), The Narrows.

Plus the 25% culture borrowing in §7.

### 8.10 Culture shapes

Added to the kinds shown, at the weights shown. `replace` removes named shared shapes for that culture.

| Culture | Kind | Shape | Weight | Eras | Tone | Example |
|---|---|---|--:|---|---|---|
| roman | road | `{romanRoadNomen} Way` | 20 | AN–MD | grand | Fabian Way |
| roman | road | `{goods} Road` (Salt ×5) | – | – | – | (weight in §8.2) |
| greek-byzantine | road | `Imperial Road to {destination}` | 10 | MD | grand | Imperial Road to Ashby |
| greek-byzantine | pilgrim | `Road of the {number} Monasteries` | 8 | MD–EM | – | Road of the Nine Monasteries |
| arabic-persian | road | `{patron:poss} Road` | 10 | MD–EM | – | [patron]'s Road |
| egyptian | road | `Desert Road to {destination}` | 10 | AN–EM | – | Desert Road to Fenwick |
| egyptian | trade | `Road of the {number} Oases` | 8 | AN–EM | – | Road of the Five Oases |
| indian | road | `{directionAdj} Road` | 20 | AN–EM | – | Northern Road |
| chinese | road | `Plank Road to {destination}` | 8 | AN–EM | – | Plank Road to Ashby |
| chinese | road | `Imperial Road to {destination}` | 10 | AN–ST | grand | – |
| japanese | road | `{directionAdj} {jFeature} Road` | 25 | MD–ST | – | Western Mountain Road |
| japanese | road | `Old {destination} Road` | 15 | EM–ST | – | Old Saltgate Road |
| korean | road | `{directionAdj} Great Road` | 20 | MD–ST | – | Southern Great Road |
| korean | road | `{destination} Great Road` | 10 | MD–ST | – | Fenwick Great Road |
| steppe | road | `Steppe Road` (fixed) | 10 | AN–ST | – | – |
| slavic | road | `Road from the {folk} to the {folk}` | 6 | MD | – | Road from the Reed Folk to the High Folk |
| slavic | road | `Great {directionAdj} Road` | 10 | EM–ST | – | Great Eastern Road |
| slavic | road | `Exiles' Road` (fixed) | 3 | EM–ST | grim | – |
| celtic | road | `Great Road of {destination}` | 10 | AN–MD | – | Great Road of Fenwick |
| ethiopian | road | `Highland Road to {destination}` | 10 | all | – | Highland Road to Ashby |
| west-african | road | `River Road to {destination}` | 8 | all | – | River Road to Saltgate |
| west-african | trade | `Desert Road to {destination}` | 10 | AN–EM | – | – |
| bantu | road | `Road to the Coast` (fixed) | 10 | all | – | – |
| aztec | road | `{directionAdj} Causeway` | 15 | AN–MD | – | Northern Causeway |
| aztec | road | `{destination} Causeway` | 10 | AN–MD | – | Fenwick Causeway |
| aztec | trade | `Merchants' Road to {destination}` | 10 | AN–MD | – | – |
| maya | road | `White Road to {destination}` | 25 | AN–MD | – | White Road to the Sea pattern |
| maya | road | `White Road` (fixed) | 5 | AN–MD | – | – |
| andean | road | `Royal Road to {destination}` | 20 | AN–MD | grand | Royal Road to Ashby |
| andean | road | `Mountain Road to {destination}` | 10 | all | – | – |
| polynesian | road | `Coast Path to {destination}` | 15 | all | – | – |

**Fantastic road shapes** (`h: true`, all cultures unless sensitive): `{heraldicBeast:poss} Road` 4 (*Dragon's Road*), `Fey Road` (fixed) 3, `Road Under the Hill` (fixed) 2, `Giant's Road` (fixed) 2, `Witch Way` (fixed) 2 (light).

---

## 9. Series: as one network

TS §3 applies, with these route-specific rules:

- **Directions turn.** If the first name's shape has `{direction}` or `{directionAdj}`, that token is a **counter**: later names step round the compass, North → East → South → West, then the four diagonals (adjective forms Northern → Eastern → Southern → Western). The rest of the shape is locked. A set of 4 gives *Great North Road*, *Great East Road*, *Great South Road*, *Great West Road*.
- **Destinations change.** If the shape has `{destination}` (and no direction), the destination varies and the rest is locked: *Fenwick Road*, *Ashby Road*, *Saltgate Road*.
- **Otherwise** TS's rules apply (anchor and top-up within the same kind).
- A network uses one kind; with kind Any, the first name's kind holds.
- Network names are returned in counter order.

---

## 10. Rendering

- GN §11: capitals, plurals, possessives (OUP: *Drovers' Way*, *Saltmen's Way*), en dash in `{star}–{star}` and `{town}–{town}`.
- `Ridgeway`, `Whale-Road`, `Ship-Way`: as written.
- A leading "The" is capitalised for fixed space names (*The Long Haul*), and lower case nowhere else.
- `{folk}` loses its leading "the" and keeps its spaces: *the Reed Folk* → *Reed Folk Way*.

---

## 11. Tone

TS §2 applies. Tags are in §6 and §8. Polynesian and Andean never draw light or grim shapes (§12.4).

---

## 12. Safeguards

### 12.1 Block list

Whole-name matches (case-insensitive) are redrawn. The built-in list is data; packs can add, not remove.

- **Real British roads:** Icknield Way, Fosse Way, Watling Street, Ermine Street, Stane Street, Dere Street, Akeman Street, Peddars Way, Sarn Helen, Great North Road, Old North Road, Old Kent Road, The Ridgeway, Military Road, Corpse Road (as "The Corpse Road"; bare allowed).
- **Real world routes:** Via Appia, Appian Way, Via Flaminia, Flaminian Way, Via Aurelia, Aurelian Way, Via Aemilia, Aemilian Way, Via Egnatia, Egnatian Way, Via Salaria, Salarian Way, Via Sacra, Via Maris, Way of the Sea, Via Francigena, Grand Trunk Road, Tea Horse Road, Tea and Horse Road, Tōkaidō, Tokaido, Eastern Sea Road, Nakasendō, Nakasendo, Central Mountain Road, Kumano Kodō, Camino de Santiago, Way of Saint James, Qhapaq Ñan, Inca Road, Darb al-Arbaʿīn, Forty Days Road, Darb Zubayda, Ways of Horus, Route from the Varangians to the Greeks, Road from the Varangians to the Greeks, Vladimirka, Siberian Trakt, Great Siberian Road, Oregon Trail, Santa Fe Trail, Chisholm Trail, Natchez Trace, Lincoln Highway, Route 66, Pan-American Highway, Burma Road, Ledo Road, Ho Chi Minh Trail, Karakoram Highway, Trans-Siberian Railway, Cape to Cairo, Grand Canal, Grand Union Canal, Grand Junction Canal, Grand Western Canal, Great Western Railway, Great Northern Railway, Great Eastern Railway, Great Central Railway, Panama Canal, Suez Canal, Kiel Canal, Southern Cross.
- **Real grim names:** Trail of Tears, Road of Bones, Death Railway, Burma Railway, Highway of Death, Via Dolorosa.
- **Fiction:** Kessel Run, Hydian Way, Corellian Run, Perlemian Trade Route, Rimma Trade Route, Yellow Brick Road, Kingsroad, Old Forest Road, Rainbow Road, Fury Road.

### 12.2 Flag list

Allowed by default (`flagListBlocks: false`): Pilgrims' Way, Silk Road, Amber Road, Spice Route, Incense Road, Royal Road, King's Highway, King's Road, Salt Road, Salt Way, Great West Road, Great South Road, Great Road, Straight Road, Plank Road, Post Road, Market Way, Portway, East Road, Old Road, Green Lane, Hollow Way, Monsoon Road, Whale-Road.

### 12.3 Living religions

WR §10.1: no divine names of living religions. `{god}` only for egyptian, norse, anglo-saxon, aztec and maya. `{holy}` (saints) only for christian cultures. Other cultures' holy roads use `holySite` words.

### 12.4 Sensitive cultures

- **Polynesian and Andean:** no light or grim tones' tagged shapes or words; no fantastic shapes; no `routeFixed:pilgrim` entries; `{god}` and `{holy}` never used.
- **Aboriginal Australian** songlines and Dreaming tracks are never generated or imitated (WR §18.4). There is no Sahul culture in this module.

### 12.5 Banned words

GN §12.3, plus: Slave, Slaver, Slavers', Trail of Tears.

### 12.6 Safeguard packs

`type: settlement-safeguards` packs (`## Block`, `## Flag`, `## Allow`), read like group safeguard packs, apply to route names and to every later settlement module. Command "Create settlement safeguard list" writes **Settlement safeguards.md** (never overwriting).

---

## 13. Presets

```yaml
---
type: module-preset
module: route-names
packName: Northern droves
culture: norman-british
region: NTH
kind: drove
era: MD
fantastic: false
tone: any
people: invented
series: false
---

Norman & British droves and tracks of the medieval era, in a realistic world, in the North, of any tone, with invented people and places, each one separate.
```

| Key | Values | Default |
|---|---|---|
| `culture` | a culture key (§4.1) | `norman-british` |
| `region` | `all` or a region code | `all` |
| `kind` | `any` or a kind key | `any` |
| `era` | an era code | `MD` |
| `fantastic` | `true`, `false` | `false` |
| `tone` / `people` / `series` | as TS §6.2 | as there |

Unknown values: reported and defaulted, as GN §13. A kind not offered in the era runs as any and reports `Kind “{x}” isn't offered in the {era} era.`

---

## 14. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Shared vocabulary.** `settlement-vocab.json` with §6's pools, `src/settlement/vocab.ts`, vocabulary packs and command (§3), `docs/vocabulary-pools.md` | §15.1–§15.2 pass |
| M2 | **Route engine.** `route-names.json`, cultures, regions, kinds, shapes, network series, safeguards | §15.3–§15.7 pass |
| M3 | **Module.** Section, sentence, history, presets, settlement safeguard pack and command | §15.8 passes; the module generates in the app |

---

## 15. Tests

### 15.1 Vocabulary (`tests/settlementVocab.test.ts`)

- Every pool entry has `w`; tags, eras and cultures are valid; no word contains `(`, `)`, `§`, `×`, `?` or `→`.

### 15.2 Vocabulary packs

- A pack with `## travellers` adds its words to the merged pool; a `· japanese` section applies only to japanese; a `· MD` section only in MD; `×0.5` and `(grim)` are read.
- An unknown pool or culture is reported and skipped.
- A pack can't remove a built-in word; a blocked word in a pack is dropped.
- "Create vocabulary pack" lists every pool as a heading and never overwrites.

### 15.3 Coverage and determinism

- Same options and seed give the same names.
- Every culture × era × kind offered × fantastic × people: 20 unique names within the cap (a shortfall notice is allowed only where §5.2 gives the kind weight 0).

### 15.4 Eras, kinds and culture

- MD, 2,000 names: no rail, motor or space shape.
- EM rail: canal shapes only.
- IS: only space lanes, including at least 10% culture-borrowed shapes over 2,000 names.
- Polynesian, 2,000 names: at least 40% sea routes; none light or grim; no fantastic shapes.
- Roman AN: at least one `{romanRoadNomen} Way`; never one of the blocked real names.

### 15.5 Regions

- Norman & British, SHH, AN–MD, 2,000 names: no Street shape (region tag `roman` ×0).
- NTH, drove kind: Corpse Road appears more often than in SEA (same seed count).

### 15.6 Network series

- A `Great {direction} Road` network of 4: the four directions in order, rest identical.
- A `{destination} Road` network of 5: five different destinations, same shape.

### 15.7 Safeguards

- 5,000 names per culture: 0 block-list matches, 0 banned words.
- `{god}` appears only for the five listed cultures; `{holy}` only for christian cultures.

### 15.8 Sentence and presets

- Default plain text: "Norman & British routes of any kind of the medieval era, in a realistic world, across all of Britain, of any tone, with placeholders for people and places, each one separate."
- Steam age shows "steampunk" in the fantastic link.
- Region link hidden for japanese; changing culture to japanese resets region.
- Preset round-trip; a kind not offered in the era reports and runs as any.

---

## 16. Parked

- Route ends: *Saltgate Road (Saltgate to Fenwick)*, and routes joining two towns from a world's own place list.
- Rivers as routes (*River Road*, navigations) linked to river names.
- Milestones, waystations and inns along a route (the inns module will read routes).
- A Sahul culture (deliberately not planned; WR §18.4).
- Further cultures as full rows: Ottoman, Swahili coast, Malay, Northwest Coast.
