# Seas and coasts – brief (first release)

This brief adds a new group, **seas and coasts**, with four modules sharing one engine:

- **seas and lakes** – oceans, seas, gulfs and bays, firths, fjords and sea lochs, straits and channels, lakes and lochs
- **coasts and islands** – headlands, cliffs and rocks, beaches and sands, coves and inlets, islands, coasts and shores
- **sea charts** – banks and shoals, reefs and ledges, deeps and holes, races and currents, roads and anchorages, channels and swatchways
- **hyperspace charts** – hyperspace treated as a sea: shores, shoals, deeps, straits, currents, calms, divides and weather belts

The reasoning behind every word list is in `docs/nautical-lexicon-review.md` (NR §x). It is reference only; where it and this brief differ, this brief wins.

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow `docs/route-names-brief.md` (RN §x) first, then `docs/stellar-names-brief.md` (SN §x), `docs/group-names-brief.md` (GN §x), `docs/group-tone-and-series-brief.md` (TS §x), `docs/bynames-and-titles-brief.md` (BT §x) and `docs/ships-and-spacecraft-brief.md` (SS §x). Reuse existing helpers – weighted draws, tone factor, series, `groupTown` and `townSource`, the river engine, the vessel engine, the tribal engine, the star draw, `dropStarWord`, safeguard checks – rather than copying them.

All output is in modern English. Real names are models, not outputs, but a generated name that happens to match a real one (*North Sea*, *Dogger Bank*) is allowed, as british place names allows *Oxford* (NR §5). Franchise phrases are blocked (§14).

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | A new group **seas and coasts**, after place names in the switcher, holding four modules |
| Engine | One shared engine (`src/waters/engine.ts`) and data file (`src/data/waters.json`), as vessels serves ships and spacecraft |
| Cultures | The 22 route-name cultures (RN §4.1) |
| Eras | Seas and lakes, coasts and islands: all seven. Sea charts: ancient to modern. Hyperspace charts: interstellar only, with no era link |
| Where | Earthly modules: **on home shores** or **on newly charted shores** (§3.2) |
| British regions | The 12 place-shape regions, for the three British cultures on home shores only |
| Biomes | The 12 earthly biomes, wherever the region link isn't shown |
| Fantastic | A switch on the three earthly modules (RN §2.2, including steampunk in the steam age) |
| Tone | The five tones (TS §2) |
| Series | Coasts and islands, sea charts and hyperspace charts: one shared specific across a set (§13). Seas and lakes: none |
| Hyperspace scale | Star system, local stellar neighbourhood, sector, galaxy (no planetary system) |
| Hyperspace register | Spacers' words, chart words, survey words, or any (§12.3) |
| Hyperspace medium | Flows **like the sea** (default) or **like the wind**, or either (§12.4) |
| Shared pools | New pools go in `settlement-vocab.json`, so vocabulary packs can extend them (RN §3) |
| Other modules | Untouched. Every existing output stays identical, seed for seed |

---

## 1. Group, modules and code layout

### 1.1 Group and sections

- Add four sections to `NameForgeSection`: `seasLakes`, `coastsIslands`, `seaCharts`, `hyperspaceCharts`, labelled **"seas and lakes"**, **"coasts and islands"**, **"sea charts"** and **"hyperspace charts"**.
- Add `seasCoasts` to `SectionGroup`, labelled **"seas and coasts"**, holding the four in that order. Its default module (`groupModule`) is `seasLakes`.
- Insert `seasCoasts` in `SWITCHER_ORDER` straight after `placeNames`, and the four sections in `SECTION_ORDER` straight after `sacredPlaces`.

### 1.2 Icons

From icon sets already in `LICENCES - Third Party`, inlined as the other icons are:

| Item | Icon |
|---|---|
| seas and coasts (group) | Phosphor `waves` |
| seas and lakes | Tabler `ripple` |
| coasts and islands | Tabler `beach` |
| sea charts | Phosphor `anchor` |
| hyperspace charts | Phosphor `compass-rose` |

If Kenny supplies an SVG for any of these before work starts, use his instead.

### 1.3 History

- Earthly: `{module} · {era label} · {culture label}`, then ` · new shores` when chosen, ` · {region phrase}` or ` · {biome label}` when set, ` · {kind}` when not Any, ` · fantastic` or ` · steampunk` when on, ` · {tone}` when not Any, ` · series` in a series.
- Hyperspace: `hyperspace charts · {scale label} · {culture label}`, then ` · {register}` when not any, ` · like the wind` or ` · sea or wind` when not the default, ` · {kind}`, ` · {tone}`, ` · series` as above.
- `historySection()` maps each label prefix to its section.

### 1.4 Code layout

| File | Contents |
|---|---|
| `src/data/waters.json` | Kinds, shapes, region and biome tag tables, culture multipliers, culture shapes, hyperspace data, safeguards |
| `src/data/settlement-vocab.json` | The new pools (§5), added to the existing file |
| `src/waters/engine.ts` | Generation for all four modules. No Obsidian imports. |
| `src/waters/sentence.ts` | The four sentences |
| `docs/vocabulary-pools.md` | New rows for every pool in §5 |
| `tests/watersEarthly.test.ts`, `tests/hyperspaceCharts.test.ts` | §17 |

Add this brief to `docs/` as `seas-and-coasts-brief.md`, and `nautical-lexicon-review.md` alongside it.

---

## 2. The sentences

### 2.1 Earthly shape

> ‹Norman & British› ‹waters of any kind› of the ‹medieval› era, ‹on home shores›, in a ‹realistic› world, ‹across all of Britain›, ‹of any tone›, with ‹placeholders for› people and places.

Coasts and islands and sea charts add, at the end: `, ‹each one separate›`.

### 2.2 Earthly fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | the culture label | as RN §2.2 | `norman-british` |
| `kind` | the module's Any text, or the kind's plural (§6) | Any, then the module's kinds | any |
| `era` | "of the ‹label› era" | seas and lakes, coasts and islands: the 7; sea charts: AN–MO | `medieval` |
| `where` | "on home shores" · "on newly charted shores" | the two | home |
| `fantastic` | as RN §2.2 | the two | realistic |
| `region` | as RN §2.2 | all of Britain, then the 12 regions | all of Britain |
| `biome` | "in any land" or the biome's `phrase`, prefixed "in " | any, then the 12 earthly biomes | any |
| `tone` | as TS §5.2 | the six | any |
| `people` | as GN §2.2 | placeholders · invented | placeholders |
| `series` | coasts: "each one separate" · "along one stretch of coast"; charts: "each one separate" · "on one chart" | the two | separate |

- **Region** shows only for the three British cultures on home shores.
- **Biome** shows whenever region doesn't.
- **Any texts:** seas and lakes "waters of any kind"; coasts and islands "coast features of any kind"; sea charts "chart features of any kind".
- **Tooltips:** where, "Home shores: a people naming its own coast. New shores: explorers naming a coast they have just reached"; biome, "Weights the names towards a land's waters and wildlife"; series, "Names that share one place or person, like the features of one stretch of coast". The rest as RN §2.2.

### 2.3 Hyperspace shape and fields

> ‹General› ‹hyperspace features of any kind› across ‹any scale›, where hyperspace flows ‹like the sea›, ‹in any words›, ‹of any tone›, with ‹placeholders for› people, ‹each one separate›.

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | the culture label | as earthly | `general` |
| `kind` | "hyperspace features of any kind" or the kind's plural (§12.5) | Any, then the kinds offered at the scale | any |
| `scale` | the scale phrase (SN §2.1) | any, Sy, Nb, Se, Ga | any |
| `medium` | "like the sea" · "like the wind" · "like the sea or the wind" | the three | sea |
| `register` | "in any words" · "in spacers' words" · "in chart words" · "in survey words" | the four | any |
| `tone`, `people`, `series` | as earthly (series texts as charts) | | |

**Tooltips:** scale, as SN; medium, "Like the sea: bores, spills and dead water. Like the wind: shocks, rarefactions and squalls"; register, "Who is speaking: spacers, the chart, or the survey office".

### 2.4 Resets

- **Kind** not offered after an era or scale change resets to Any.
- **Culture** changed away from the British cultures, or **where** set to new shores: region resets to all of Britain.
- **Region** shown again: biome resets to any.

### 2.5 Plain text, state, presets

As GN §2.5–§2.6. Presets in §15.

---

## 3. Cultures, settings, regions and biomes

### 3.1 Cultures and eras

As RN §4.1 and §4.3, with the same **British cultures** (anglo-saxon, celtic, norman-british) and **christian cultures**. Polynesian and Andean keep their sensitive handling (RN §12.4).

### 3.2 Where: home or new shores

| Family | Home | New |
|---|---|---|
| `mood` (explorer's mood) | ×0.1 | ×4 |
| `false` | ×0.2 | ×3 |
| `sai` (saints) | ×1 | ×2 |
| `per` (persons) | ×0.5 | ×2 |
| everything else | ×1 | ×1 |

### 3.3 Region tags

For British cultures on home shores. Multipliers apply to shapes **and pool entries** carrying the tag (`rt`). Untagged items are ×1. Order: COR, WCY, SEA, EAN, WMM, WAL, EMD, NTH, SBL, SLO, SHH, NSI.

| Tag | Used by | COR | WCY | SEA | EAN | WMM | WAL | EMD | NTH | SBL | SLO | SHH | NSI |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| `ness` | Ness | 0.3 | 0.5 | 1 | 2 | 0.5 | 0.3 | 2 | 2 | 2 | 1.5 | 2 | 3 |
| `naze` | Naze | 0 | 0 | 1.5 | 2 | 0 | 0 | 0.3 | 0.3 | 0 | 0 | 0 | 0 |
| `bill` | Bill | 0 | 3 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `mull` | Mull of | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 2 | 3 | 0.3 |
| `nab` | Nab | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 |
| `foreland` | Foreland | 0.5 | 2 | 3 | 1 | 0 | 0.5 | 0.5 | 1 | 0.5 | 0.3 | 0.3 | 0.3 |
| `cape` | Cape (home) | 0.5 | 0.3 | 0.3 | 0.2 | 0.2 | 0.3 | 0.2 | 0.3 | 0.3 | 0.3 | 0.5 | 0.3 |
| `northIsle` | Voe, Wick, Hope, Ayre, Calf, Noup, Ord | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 3 |
| `geo` | Geo, Clett | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1.5 | 3 |
| `kyle` | Kyle of | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 3 | 0 |
| `loch` | Loch | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 2 | 3 | 1 |
| `firth` | Firth | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 2 | 2 | 2 |
| `soundOf` | Sound of | 0.2 | 0.2 | 0.2 | 0.2 | 0 | 0.2 | 0.2 | 0.2 | 0.2 | 0.5 | 3 | 1 |
| `inch` | Inch | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 1 | 0 |
| `holm` | Holm | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0.5 | 0 | 0.3 | 1 | 3 |
| `skerry` | Skerry, Skerries | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0.5 | 2 | 3 |
| `stack` | Stack | 1 | 1 | 0.3 | 0 | 0 | 2 | 0 | 0.5 | 0.3 | 0.5 | 2 | 3 |
| `porth` | Porth | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| `chine` | Chine | 0 | 1.5 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `pill` | Pill | 0 | 2 | 0 | 0 | 0.3 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| `fleet` | Fleet | 0 | 1 | 1.5 | 0.5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `creek` | Creek | 2 | 1.5 | 2 | 2 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 |
| `cove` | Cove | 3 | 2 | 1 | 0.3 | 0.3 | 1 | 0.3 | 0.5 | 0.5 | 0.5 | 0.5 | 0.3 |
| `scar` | Scar, Brigg | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 1 | 0 | 0 | 0 |
| `links` | Links | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 3 | 1 | 0 |
| `machair` | Machair | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 |
| `denes` | Denes | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `saltings` | Saltings | 0 | 0.5 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `snook` | Snook | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 2 | 0 | 0 | 0 |
| `estuary` | Gat, Swin, Swatch, Swatchway, Spitway, Knock | 0 | 0 | 3 | 3 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| `wash` | Wash | 0 | 0 | 1 | 2 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| `deepChannel` | Deep as a channel | 0.3 | 0.3 | 3 | 2 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 |
| `tarn` | Tarn | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 1 | 0 | 0 | 0 |
| `lakeWater` | Water (lake) | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 3 | 1 | 0.2 | 0.2 | 0.2 |
| `mere` | Mere | 0 | 0.5 | 0.5 | 2 | 3 | 0.2 | 1 | 2 | 0.2 | 0.2 | 0.2 | 0.2 |
| `broad` | Broad | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `pool` | Pool (lake) | 0.5 | 1 | 0.5 | 0.5 | 2 | 1 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 |
| `llyn` | Llyn | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| `lakeLake` | Lake | 0.3 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.3 | 0.1 | 0.1 | 0.1 |
| `bore` | Bore | 0.5 | 2 | 0.5 | 0.5 | 2 | 0.5 | 1 | 1 | 0.5 | 0.5 | 0.5 | 0.5 |
| `aegir` | Aegir | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 2 | 0 | 0 | 0 | 0 |
| `merryMen` | Merry Men | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 1 | 3 |
| `cauldron` | Cauldron | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 3 | 1 |
| `roads` | Roads | 1 | 1 | 2 | 2 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| `fourteens` | depth-number banks | 1 | 1 | 1.5 | 2 | 0 | 0.5 | 1 | 1.5 | 1 | 1 | 0.5 | 1 |
| `riverSea` | ‹river› Sea | 0.5 | 2 | 0.5 | 0.5 | 1 | 2 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 |

- **All of Britain** (no region chosen) uses the mean of each tag's 12 values.
- **Home-British shapes:** a shape whose cultures include `british` and which carries a region tag is live for the British cultures **only on home shores**. Any other culture key listed beside `british` (norse, for *Voe*, *Holm*, *Geo*, *Wick*) is live on any shore, with the region tag ignored.
- **Kind multipliers, British cultures on home shores:** oceans ×0.3, lakes and lochs ×1.5.

### 3.4 Biome tags

Wherever the biome link is shown and a biome is chosen. Multipliers apply to shapes and pool entries carrying the tag (`bt`); untagged items are ×1. With biome any, every tag is ×1. Order: temperate, moorland, boreal, cool-rainforest, mediterranean, steppe, desert, savannah, rainforest, monsoon, tropical-islands, highland.

| Tag | Used by | tmp | moor | bor | crf | med | stp | des | sav | rf | mon | tri | hgh |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| `fjord` | Fjord, Arm, inlet Sound, Kyle | 1 | 0.5 | 3 | 3 | 0.3 | 0 | 0 | 0 | 0 | 0 | 0 | 2 |
| `tropic` | Cay, Key, Atoll, Lagoon, reef Pass, Coral | 0 | 0 | 0 | 0 | 0.3 | 0 | 0.3 | 0.5 | 2 | 2 | 4 | 0 |
| `ice` | Frozen, Ice, Walrus, Eider | 0 | 0 | 3 | 1 | 0 | 0.3 | 0 | 0 | 0 | 0 | 0 | 1 |
| `dry` | Bitter, Salt, Skeleton | 0.2 | 0 | 0 | 0 | 1 | 2 | 4 | 1.5 | 0 | 0.3 | 0 | 0 |
| `warm` | Warm, Pearl, Shark, Turtle, Pelican | 0 | 0 | 0 | 0 | 1 | 0.3 | 1 | 1 | 2 | 2 | 2 | 0 |
| `lowWater` | Mere, Broad, Pool | 1.5 | 1 | 1 | 0.5 | 0.5 | 1 | 0.2 | 1 | 1 | 1 | 0.3 | 0.3 |
| `upland` | Tarn, Loch (fresh) | 1 | 2 | 1.5 | 1.5 | 0.5 | 0.3 | 0.2 | 0.3 | 0.5 | 0.5 | 0.3 | 3 |
| `cliff` | Cliffs, Stack, Skerry, Puffin | 1 | 1.5 | 1.5 | 1.5 | 1.5 | 0.5 | 1 | 0.5 | 0.5 | 0.5 | 1 | 2 |
| `sand` | Sands, Dunes, Spit, Links | 1 | 0.5 | 0.5 | 0.3 | 1 | 1 | 2 | 1 | 0.5 | 1 | 1.5 | 0.3 |

A tag also applies on home shores for non-British cultures when a biome is chosen. For British cultures on home shores, biome tags are ignored (regions decide).

### 3.5 Culture family multipliers

Every shape has a **family** (`f`) and may be an **of-shape** (`of: true`, the "‹generic› of ‹x›" order). Culture multipliers apply to both. Blank means ×1.

| Culture | of | dir | col | ppl | per | god | crt | shp | kenn | euph | cosmo | sai |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| general | | | | | | | | | 0 | 0 | 0 | |
| anglo-saxon | 0.7 | 1.5 | | 1.5 | | | 1.5 | | 5 | 0 | 0 | 1.5 |
| norse | 0.5 | 2 | 1.5 | | | 1.5 | 1.5 | | 4 | 0 | 0 | |
| celtic | 2 | | | | 1.5 | | 1.5 | | 0.5 | 0 | 0 | 2 |
| norman-british | 1.2 | 1.5 | | | 1.5 | 0 | | | 0 | 0 | 0 | 1.5 |
| roman | 2.5 | 1.5 | 0.7 | 3 | | | 0.5 | 0.5 | 0 | 0 | 0 | |
| greek-byzantine | 2 | | | 1.5 | 3 | 2 | 0.7 | | 0 | 5 | 0 | |
| slavic | | | 2 | 2 | | 0 | | | 0 | 0 | 0 | |
| steppe | 0.7 | | 3 | | 0.5 | 0 | | | 0 | 0 | 0 | |
| arabic-persian | 3 | | 1.5 | 3 | | 0 | | | 0 | 0 | 0 | |
| indian | 1.5 | | | | 2 | | | | 0 | 0 | 5 | |
| chinese | 0.3 | 3 | 2 | 0.5 | 0.5 | 0.5 | | 2 | 0 | 0 | 0 | |
| japanese | 0.5 | 2 | 1.5 | 0.5 | 0.5 | 0.5 | | 3 | 0 | 0 | 0 | |
| korean | 0.3 | 4 | 1.5 | 0.5 | 0.5 | 0.5 | | | 0 | 0 | 0 | |
| egyptian | | | 2 | 0.5 | 0.5 | 3 | | | 0 | 0 | 0 | |
| ethiopian | 1.5 | | 2 | | | | | | 0 | 0 | 0 | |
| bantu | 1.5 | | | | | 1.5 | 2 | | 0 | 0 | 0 | |
| west-african | | | | | | | 1.5 | | 0 | 0 | 0 | |
| aztec | | | 1.5 | | 0.5 | 3 | | | 0 | 0 | 0 | |
| maya | | | 1.5 | | 0.5 | 3 | | | 0 | 0 | 0 | |
| polynesian | 2 | | | | 1.5 | 0 | 1.5 | | 0 | 0 | 0 | |
| andean | | | | | 0.5 | 0 | | | 0 | 0 | 0 | |

- `sai` shapes need a christian culture as well; `god` shapes need a culture with a `{god}` source (§4) and are otherwise weight 0.
- Families not in the table (`twn`, `qual`, `mood`, `false`, `riv`, `unc`, `boat`, `ship`, `maria`, `mon`, `fixed`) are ×1 for every culture.

### 3.6 Era multipliers

| Family | AN | MD | EM | ST | MO | NF | IS |
|---|--:|--:|--:|--:|--:|--:|--:|
| `mood` | 0.2 | 0.5 | 2 | 1.5 | 0.5 | 1 | 1 |
| `per` | 0.5 | 0.7 | 1.5 | 2 | 1.5 | 1 | 1 |
| `maria` | 1 | 1 | 1 | 1 | 1 | 6 | 6 |
| `ship` | 0 | 0 | 0.5 | 2 | 2 | 1 | 1 |

In NF and IS, the earthly modules name the waters of other worlds; the maria and sea-monster shapes (§8) carry that.

§3.2 and §3.6 don't apply to hyperspace charts.

---

## 4. Supporting sources

As RN §4.2 for `{town}`, `{folk}`, `{person}`, `{figure}`, `{kingdom}`, `{holy}`, `{number}`, `{direction}`, `{directionAdj}`, `{ordinal}`. New:

| Token | Source |
|---|---|
| `{river}` | `riverFill` from the river engine: British region on home shores → the British setting with that region; other home shores → `established`; new shores → `new-land`. Strip any *River* word; a multiword fill is used whole. Placeholder `[river]`. |
| `{ship}` | One name from the vessel engine: module ships, function `explore`, the culture's nearest vessel culture, technology as the ships module defaults for the era. Strip any prefix (HMS, SS). Placeholder `[ship]`. |
| `{god}` | RN §4.2's world `god` list where the culture has one; otherwise `deityHooks().deityTitle` for a culture the deities module offers (`cultureOffered`). Never for the sensitive cultures (Polynesian, Andean). With neither, `{god}` shapes are weight 0. Placeholder `[deity]`. |
| `{star}` | Hyperspace only: the stellar star draw (SN §4.7) at the chosen scale, **proper and possessive kinds only**; possessives through `dropStarWord` (*Barnard's Strait*). Never Bayer or catalogue forms. Always invented. |
| `{spaceDirection}` | The existing pool, with its scale tags |
| `{x:pl}` | The entry's `pl`, else `pluralOf` with `irregularPlurals` |
| `{x:poss}` | As RN |

---

## 5. Pools (`settlement-vocab.json`)

Entry keys as RN §3.1, plus `rt` (region tag, §3.3) and `bt` (biome tag, §3.4). Weights are ×1 unless given.

| Pool | Entries |
|---|---|
| `seaColour` | Black ×3, White ×2, Red ×2, Green ×2, Grey ×2, Blue, Yellow, Silver (grand), Golden (grand) · `cultureExtra` greek-byzantine: Wine-Dark (AN, grand, strange) |
| `seaQuality` | Great ×3, Narrow ×2, Inner ×2, Outer ×2, Middle, Long, Broad, Still, Shallow, Quiet, Restless (strange), Hidden (strange), Lonely (grim), Bitter (grim, `bt` dry), Dead ×0.5 (grim), Frozen (`bt` ice), Warm (`bt` warm), Peaceful (light), Endless (grand) |
| `oceanQuality` | Great ×3, Outer ×2, Encircling (AN, MD; grand, strange), Endless (grand), Boundless (grand), Peaceful, Silent (strange), Grey, Dark (grim) |
| `oceanOf` | Storms ×2, Darkness (grim), Mists, Winds, Fogs, the World, the Sunset, Ice (`bt` ice), the Dead ×0.3 (grim) |
| `seaCreature` | Seal ×3, Whale ×3, Gull ×2, Cormorant, Gannet, Puffin (light, `bt` cliff), Otter, Herring (pl Herring), Cod (pl Cod), Salmon (pl Salmon), Mackerel (pl Mackerel), Crab, Lobster, Oyster, Eel, Dolphin, Porpoise, Tern, Kittiwake, Heron, Skua (grim), Eider (`bt` ice), Walrus (`bt` ice), Shark (grim, `bt` warm), Turtle (`bt` warm), Pelican (`bt` warm) |
| `lakeCreature` | Swan ×3, Heron ×2, Pike (pl Pike), Trout (pl Trout), Char (pl Char, `bt` upland), Otter, Crane, Duck, Goose (pl Geese), Grebe, Coot, Kingfisher, Eel, Diver (`bt` ice), Beaver (AN, MD), Frog (light), Crocodile (grim, `bt` warm), Hippo (`bt` warm), Flamingo (`bt` dry), Pelican (`bt` warm) |
| `shoreShape` | Horn ×2, Hook ×2, Nose, Tongue, Elbow, Knuckle, Thumb, Tooth, Comb, Saddle, Anvil, Arrow, Crescent, Sleeve |
| `lakeShape` | Moon ×2, Crescent, Horseshoe, Mirror, Eye, Harp, Sleeve · `cultureExtra` japanese: Lute, Fan · chinese: Ear, Fan · korean: Ear |
| `explorerMood` | Plenty ×2, Hope ×2, Good Hope, Disappointment ×2, Desolation ×2 (grim), Farewell ×2, Turnagain, Deliverance, Providence, Mercy, Fortune, Patience, Welcome, Refuge, Rescue, Foulweather, Repulse (grim), Despair (grim), Tribulation (grim), Poverty (grim), Flattery (light), Contentment (light), Doubtful (light) |
| `coastGoods` | Gold ×3, Ivory ×2, Pepper, Grain, Spice, Amber, Pearl (`bt` warm), Coral (`bt` tropic), Salt, Tin, Silver |
| `grimCoast` | Skeleton ×2 (`bt` dry), Wreckers', Widow's, Bone, Storm, Shipwreck, Gallows, Drowned, Ghost – all grim |
| `endWord` | Land's ×3, World's, Earth's |
| `stackGroup` | Needles ×2, Maidens ×2, Sisters ×2, Brothers, Monks, Friars, Bishops, Teeth, Fingers, Sentinels, Giants, Old Women (light) |
| `coveFolk` | Smugglers ×2 (light), Fishermen ×2, Pirates (light), Wreckers (grim), Monks, Pilgrims |
| `folkUncanny` | Devil's ×3, Giant's ×2, Witch's, Mermaid's, Dead Man's (grim), Hag's (grim), Fiddler's (light), Piper's (light), Wizard's (strange) |
| `devilFeature` | Rock ×2, Bellows, Frying Pan (light), Chimney, Kitchen, Throat, Punchbowl, Cauldron, Hole |
| `narrowsWord` | Iron ×2, Stone, Long, Black, Grey, Crooked, Twin, Upper, Lower, Bitter (grim), Golden (grand) |
| `gateWord` | Golden ×2, Iron ×2, Narrow, Western, Eastern, Brass, Silver, Stone |
| `fordBeast` | Ox ×2, Cow, Heifer, Horse, Goat, Ram |
| `bayQuality` | Long ×2, Broad ×2, Deep, Sandy ×2, Stony, Fair, Calm, Shingle, Crooked, Round, Hidden, Quiet, Wide, Little, Shell, Smooth |
| `islandQuality` | Long ×2, Flat ×2, Green ×2, Steep, High, Low, Fair, Burnt, Bare, Rough, Black, White, Round, Little, Great, Holy (christian cultures), Lonely (grim) |
| `shoreQuality` | Long ×2, Broad, Black, White, Red, Golden, Silver, Shell, Shingle, Pebble, Stony, Sandy, High, Low, Steep, Crooked, Wide |
| `lakeQuality` | Long ×2, Round, Still, Deep, Great, Little, Upper, Lower, Silver, Hidden (strange), Glass (strange), Bitter (`bt` dry), Salt (`bt` dry) |
| `lakeFuse` | Grass, Butter, Reed, Rush, Ash, Alder, Swan, Hern, Crane, Pike, Eel, Mill, Black, Brad, Cold, Thorn (fused words: *Grassmere*, *Reedwater*) |
| `boatWord` | Dogger (MD, EM), Buss (MD, EM), Cog (MD), Smack (EM, ST), Lugger (EM, ST), Hooker (EM, ST), Collier (EM, ST), Coble (EM, ST, `rt` scar), Drifter (ST, MO), Trawler (ST, MO) |
| `pitWord` | Silver ×2, Sole, Herring, Ling, Cod, Black |
| `depthNumber` | Fourteens ×2, Forties ×2, Eighteens, Twenties, Thirties, Fifties, Sixties |
| `lengthAdj` | Broad ×2, Long ×2, Narrow, Great, Little, Outer, Inner |
| `gatTrade` | Fisherman's ×2, Pilot's, Smuggler's (light), Wherryman's, Bargeman's, Oysterman's, Shrimper's (light) |
| `swallowWord` | Swallower ×2, Grinder, Churn, Cauldron, Boil, Gullet (grim) |
| `kinCurrent` | Parent ×2, Mother, Child (c japanese) |
| `seaKenning` | Whale Road ×3, Swan Road ×2, Gannet's Bath ×2, Sail Road, Seal's Bath, Wave Field, Fish Home (strange) – c anglo-saxon, norse |
| `mariaWord` | Tranquillity ×2, Serenity ×2, Storms ×2, Clouds, Rains, Showers, Crises, Vapours, Cold, Nectar, Fertility, Moisture, Islands, Waves, Foam, Dreams, Hope, Time (strange), Forgetting (strange), Joy (light), Decay (grim), Fear (grim), Sorrow (grim), Death ×0.5 (grim), Winter, Summer, Autumn, Spring |
| `seaMonster` | Kraken ×3, Leviathan ×2, Serpent ×2, Siren, Dragon · `cultureExtra` celtic: Merrow, Selkie · norse: Selkie |
| `cosmoSubstance` | Milk ×2, Salt ×2, Wine, Ghee, Curds, Sugar Cane, Sweet Water (c indian) |
| `euphemism` | Hospitable ×2, Kindly, Gentle, Friendly, Fair, Welcoming (c greek-byzantine; light) |
| `hyperColour` | Black ×2, Grey ×2, Silver ×2, Amber ×2, White, Red, Blue, Green, Violet, Gold, Pale, Brass (light) |
| `hyperAdj` | Blind ×2, Silent ×2, Broken ×2, Shifting ×2, False ×2, Long ×2, Hollow, Still, Restless (strange), Bitter, Dead (grim), Ghost (grim, strange), Drowned (grim), Glass (strange) |
| `hyperPhysical` | Gravity ×3, Phase ×2, Time ×2, Echo ×2, Mirror, Mass, Causality (strange) |
| `weatherAdj` | Howling ×2, Wailing, Grinding, Hissing, Weeping (grim), Shrieking (grim), Singing (strange), Whispering (strange) |
| `depthBand` | Forties ×2, Twenties, Thirties, Fifties, Sixties, Seventies |

Region-tagged pool entries: none beyond `boatWord` Coble. Shapes carry the regional generics.

---

## 6. Kinds and weights

Kind weights with kind Any, before §3.3's kind multipliers.

### 6.1 Seas and lakes

| Key | Menu | Plural | Weight |
|---|---|---|--:|
| `ocean` | Oceans | oceans | 10 |
| `sea` | Seas | seas | 25 |
| `bay` | Gulfs and bays | gulfs and bays | 25 |
| `inlet` | Firths, fjords and sea lochs | firths, fjords and sea lochs | 12 |
| `strait` | Straits and channels | straits and channels | 13 |
| `lake` | Lakes and lochs | lakes and lochs | 15 |

### 6.2 Coasts and islands

| Key | Menu | Plural | Weight |
|---|---|---|--:|
| `headland` | Headlands and points | headlands and points | 22 |
| `cliff` | Cliffs and rocks | cliffs and rocks | 15 |
| `beach` | Beaches and sands | beaches and sands | 15 |
| `cove` | Coves and inlets | coves and inlets | 15 |
| `island` | Islands | islands | 23 |
| `coast` | Coasts and shores | coasts and shores | 10 |

### 6.3 Sea charts

| Key | Menu | Plural | Weight |
|---|---|---|--:|
| `bank` | Banks and shoals | banks and shoals | 25 |
| `reef` | Reefs, rocks and ledges | reefs, rocks and ledges | 20 |
| `deep` | Deeps and holes | deeps and holes | 13 |
| `race` | Races, tides and currents | races, tides and currents | 20 |
| `roads` | Roads and anchorages | roads and anchorages | 10 |
| `channel` | Channels and swatchways | channels and swatchways | 12 |

Every earthly kind is offered in every era its module offers.

---

## 7. Pipeline and rendering

```
module → kind (chosen, or §6 × §3.3 kind multipliers)
    ↓
shape   (kind's shapes §8–§10 + culture shapes §11; filtered by era, culture, fantastic, register, medium, scale;
         × family (§3.5) × of (§3.5) × where (§3.2) × era (§3.6) × region (§3.3) or biome (§3.4) × tone factor)
    ↓
tokens  (pools §5 with their own tags and multipliers; sources §4; series anchor §13)
    ↓
rendering (below) → safeguards (§14)
```

- **Fantastic:** `h: true` shapes and words only with the switch on; `h: false` only with it off. In the steam age, the switch reads steampunk and adds nothing new here.
- **Folk-supernatural** shapes (`unc`: *Devil's Hole*, *Witch Ground*, *Mermaid's Rock*) are realistic and need no switch (NR §4.5).
- **Zero weights:** a shape whose weight comes to 0 is skipped; if a kind has no live shapes, redraw the kind; if no kind is live, fall back to the module's untagged shapes.
- **Fusion:** shapes written `{x}mere`, `{x}water` join with no space and lower-case the generic (*Grassmere*). They only ever take `lakeFuse`, never a town or person.
- **"The":** shapes beginning *The* keep it capitalised.
- **Repeats:** reject a name repeating a content word (*Seal Seal Rock*), using `repeatsContent`.
- **Failure, batches, uniqueness:** as GN §4. Cap: 6 words.

---

## 8. Shapes: seas and lakes

Columns: weight; family (`f`); of-shape; eras (all if blank); cultures (all if blank; `british`, `christian`, keys, `!key`); region tag; biome tag; tone; `h`.

### 8.1 Oceans

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{directionAdj} Ocean` | 25 | dir | | | | | | plain | |
| `{oceanQuality} Ocean` | 25 | qual | | | | | | | |
| `Ocean of {oceanOf}` | 10 | qual | ✓ | | | | | | |
| `{folk} Ocean` | 6 | ppl | | | | | | | |
| `{seaColour} Ocean` | 6 | col | | | | | | | |
| `Ocean of {god}` | 4 | god | ✓ | | | | | grand | |
| `Ocean of {cosmoSubstance}` | 8 | cosmo | ✓ | | indian | | | strange | |
| `Ocean of {mariaWord}` | 3 | maria | ✓ | | | | | strange | |

### 8.2 Seas

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{direction} Sea` | 15 | dir | | | | | | plain | |
| `{directionAdj} Sea` | 8 | dir | | | | | | | |
| `{seaColour} Sea` | 12 | col | | | | | | | |
| `{seaQuality} Sea` | 12 | qual | | | | | | | |
| `{folk} Sea` | 10 | ppl | | | | | | | |
| `Sea of the {folk}` | 6 | ppl | ✓ | | | | | | |
| `Sea of {town}` | 8 | twn | ✓ | | | | | | |
| `{town} Sea` | 4 | twn | | | | | | | |
| `{person} Sea` | 4 | per | | EM, ST, MO, NF, IS | | | | | |
| `Sea of {person}` | 3 | per | ✓ | | | | | grand | |
| `Sea of {god}` | 3 | god | ✓ | | | | | grand | |
| `{seaCreature} Sea` | 4 | crt | | | | | | | |
| `{seaKenning}` | 4 | kenn | | AN, MD | | | | strange | |
| `{euphemism} Sea` | 2 | euph | | | | | | light | |
| `{river} Sea` | 2 | riv | | AN, MD | british | riverSea | | | |
| `Sea of {mariaWord}` | 4 | maria | ✓ | | | | | strange | |
| `{seaMonster} Sea` | 3 | mon | | AN, MD, EM, ST, MO, NF | | | | strange | true |
| `{seaMonster} Sea` | 4 | mon | | IS | | | | | |

### 8.3 Gulfs and bays

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{town} Bay` | 14 | twn | | | | | | plain | |
| `Gulf of {town}` | 12 | twn | ✓ | | | | | | |
| `Bay of {town}` | 6 | twn | ✓ | | | | | | |
| `{seaCreature} Bay` | 10 | crt | | | | | | | |
| `{bayQuality} Bay` | 6 | qual | | | | | | plain | |
| `{seaColour} Bay` | 4 | col | | | | | | | |
| `{direction} Bay` | 6 | dir | | | | | | plain | |
| `Bay of {kingdom}` | 3 | ppl | ✓ | | | | | | |
| `{folk} Gulf` | 3 | ppl | | | | | | | |
| `{holy:poss} Bay` | 6 | sai | | | christian | | | | |
| `{person:poss} Bay` | 5 | per | | | | | | | |
| `{explorerMood} Bay` | 6 | mood | | | | | | | |
| `Bay of {explorerMood}` | 3 | mood | ✓ | | | | | | |
| `{town} Bight` | 3 | twn | | EM, ST, MO, NF, IS | | | | | |
| `Bight of {town}` | 2 | twn | ✓ | EM, ST, MO, NF, IS | | | | | |
| `False Bay` | 1 | false | | EM, ST, MO, NF, IS | | | | | |
| `{folkUncanny} Bay` | 2 | unc | | | | | | strange | |
| `{seaMonster} Bay` | 2 | mon | | | | | | grim | true |

### 8.4 Firths, fjords and sea lochs

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `Firth of {river}` | 10 | riv | ✓ | | british, norse | firth | fjord | | |
| `{town} Firth` | 6 | twn | | | british, norse | firth | fjord | | |
| `Loch {town}` | 8 | twn | | | british | loch | fjord | | |
| `Loch of the {seaCreature:pl}` | 3 | crt | ✓ | | british | loch | fjord | | |
| `{town} Fjord` | 10 | twn | | | !anglo-saxon, !celtic, !norman-british | | fjord | | |
| `{seaQuality} Fjord` | 4 | qual | | | !anglo-saxon, !celtic, !norman-british | | fjord | | |
| `{town} Sound` | 8 | twn | | | | | fjord | | |
| `Sound of {town}` | 5 | twn | ✓ | | | soundOf | fjord | | |
| `{town} Inlet` | 6 | twn | | EM, ST, MO, NF, IS | | | | plain | |
| `{person:poss} Inlet` | 3 | per | | EM, ST, MO, NF, IS | | | | | |
| `{town} Arm` | 3 | twn | | | | | fjord | | |
| `{explorerMood} Arm` | 2 | mood | | EM, ST, MO, NF, IS | | | fjord | | |
| `{town} Voe` | 6 | twn | | | british, norse | northIsle | | | |
| `{river} Estuary` | 4 | riv | | ST, MO, NF, IS | | | | plain | |
| `{river} Mouth` | 3 | riv | | | | | | plain | |

- **Norse** fjord shapes are ×5 for norse.
- British cultures never use *Fjord*: at home they say *firth*, and abroad *sound* (as in *Milford Sound*).

### 8.5 Straits and channels

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `Strait of {town}` | 10 | twn | ✓ | | | | | | |
| `{town} Strait` | 8 | twn | | | | | | plain | |
| `{person} Strait` | 4 | per | | EM, ST, MO, NF, IS | | | | | |
| `{town} Channel` | 8 | twn | | | | | | plain | |
| `{direction} Channel` | 6 | dir | | | | | | | |
| `{seaQuality} Channel` | 4 | qual | | | | | | | |
| `{folk} Channel` | 4 | ppl | | | | | | | |
| `The {narrowsWord} Narrows` | 6 | qual | | | | | | | |
| `{town} Narrows` | 5 | twn | | | | | | plain | |
| `Kyle of {town}` | 6 | twn | ✓ | | british | kyle | fjord | | |
| `{town} Sound` | 4 | twn | | | | | | | |
| `Gut of {town}` | 2 | twn | ✓ | | | | | | |
| `{gateWord} Gate` | 3 | qual | | | | | | grand | |
| `{town} Gate` | 2 | twn | | | | | | | |

### 8.6 Lakes and lochs

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `Lake {town}` | 10 | twn | | | | lakeLake | | plain | |
| `{town} Lake` | 8 | twn | | | | lakeLake | | | |
| `{lakeCreature} Lake` | 6 | crt | | | | lakeLake | | | |
| `Lake of the {lakeCreature:pl}` | 4 | crt | ✓ | | | lakeLake | | | |
| `{seaColour} Lake` | 6 | col | | | | lakeLake | | | |
| `{lakeQuality} Lake` | 6 | qual | | | | lakeLake | | | |
| `Loch {town}` | 10 | twn | | | british | loch | upland | | |
| `Loch of the {lakeCreature:pl}` | 3 | crt | ✓ | | british | loch | upland | | |
| `{town} Water` | 6 | twn | | | british | lakeWater | | | |
| `{lakeFuse}water` | 3 | qual | | | british | lakeWater | | | |
| `{lakeFuse}mere` | 4 | qual | | | british | mere | lowWater | | |
| `{town} Mere` | 4 | twn | | | | mere | lowWater | | |
| `{town} Tarn` | 4 | twn | | | british | tarn | upland | | |
| `{lakeQuality} Tarn` | 2 | qual | | | british | tarn | upland | | |
| `{town} Broad` | 4 | twn | | | british | broad | lowWater | | |
| `{town} Pool` | 3 | twn | | | | pool | lowWater | | |
| `Llyn {town}` | 4 | twn | | | british | llyn | | | |
| `{town} Reservoir` | 3 | twn | | ST, MO, NF, IS | | | | plain | |
| `{lakeShape} Lake` | 3 | shp | | | | lakeLake | | | |
| `{folk} Lake` | 3 | ppl | | | | lakeLake | | | |
| `Lake of {god}` | 2 | god | ✓ | | | | | grand | |
| `Lake of {mariaWord}` | 3 | maria | ✓ | | | | | strange | |

- Home-British shapes (§3.3: *Loch*, *Water*, *Tarn*, *Broad*, the fused forms, *Llyn*) are weight 0 off British home shores.
- Off British home shores, `lakeLake` is ×1.

---

## 9. Shapes: coasts and islands

### 9.1 Headlands and points

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{town} Head` | 14 | twn | | | | | | plain | |
| `{town} Point` | 10 | twn | | | | | | plain | |
| `Point of {town}` | 3 | twn | ✓ | | | northIsle | | | |
| `Cape {town}` | 10 | twn | | | | cape | | | |
| `Cape {person}` | 4 | per | | EM, ST, MO, NF, IS | | cape | | | |
| `Cape {explorerMood}` | 6 | mood | | | | cape | | | |
| `Cape {holy}` | 4 | sai | | | christian | cape | | | |
| `{town} Ness` | 8 | twn | | | | ness | | | |
| `{seaColour} Ness` | 3 | col | | | | ness | | | |
| `Mull of {town}` | 6 | twn | ✓ | | british | mull | | | |
| `{town} Bill` | 4 | twn | | | british | bill | | | |
| `The {shoreQuality} Naze` | 2 | qual | | | british | naze | | | |
| `{direction} Foreland` | 4 | dir | | | | foreland | | | |
| `{town} Nab` | 2 | twn | | | british | nab | | | |
| `Ord of {town}` | 2 | twn | ✓ | | british, norse | northIsle | | | |
| `{town} Noup` | 1 | twn | | | british, norse | northIsle | | | |
| `{shoreShape} Point` | 4 | shp | | | | | | | |
| `Horn of {town}` | 2 | shp | ✓ | | | | | | |
| `{seaCreature} Head` | 5 | crt | | | | | | | |
| `{seaCreature} Point` | 3 | crt | | | | | | | |
| `{holy:poss} Head` | 4 | sai | | | christian | | | | |
| `{endWord} End` | 2 | qual | | | | | | grand | |
| `False Point` | 1 | false | | | | | | | |
| `{town} Promontory` | 2 | twn | | | roman, greek-byzantine | | | grand | |

### 9.2 Cliffs and rocks

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{seaColour} Cliffs` | 8 | col | | | | | cliff | | |
| `{town} Cliffs` | 6 | twn | | | | | cliff | plain | |
| `{seaCreature} Cliffs` | 4 | crt | | | | | cliff | | |
| `{shoreQuality} Cliffs` | 4 | qual | | | | | cliff | | |
| `{town} Crag` | 3 | twn | | | | | cliff | | |
| `{seaCreature} Rock` | 8 | crt | | | | | | | |
| `{town} Rock` | 6 | twn | | | | | | plain | |
| `{seaColour} Rock` | 4 | col | | | | | | | |
| `{person:poss} Rock` | 3 | per | | | | | | | |
| `{seaCreature} Stack` | 4 | crt | | | | stack | cliff | | |
| `{town} Stack` | 3 | twn | | | | stack | cliff | | |
| `Old Man of {town}` | 3 | per | ✓ | | | stack | cliff | light | |
| `Old {person}` | 2 | per | | | | stack | cliff | light | |
| `The {number} Sisters` | 2 | qual | | | | | cliff | | |
| `The {stackGroup}` | 2 | qual | | | | | cliff | | |
| `{town} Skerry` | 4 | twn | | | | skerry | cliff | | |
| `{seaCreature} Skerry` | 4 | crt | | | | skerry | cliff | | |
| `{town} Scar` | 3 | twn | | | british | scar | | | |
| `{town} Brigg` | 2 | twn | | | british | scar | | | |
| `{town} Clett` | 2 | twn | | | british, norse | geo | | | |
| `The {seaColour} Stones` | 3 | col | | | | | | | |
| `{folkUncanny} {devilFeature}` | 2 | unc | | | | | | strange | |

### 9.3 Beaches and sands

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{town} Sands` | 10 | twn | | | | | sand | plain | |
| `{shoreQuality} Sands` | 6 | qual | | | | | sand | | |
| `{seaColour} Sands` | 4 | col | | | | | sand | | |
| `{town} Beach` | 8 | twn | | ST, MO, NF, IS | | | | plain | |
| `{town} Beach` | 2 | twn | | AN, MD, EM | | | | plain | |
| `{shoreQuality} Beach` | 4 | qual | | ST, MO, NF, IS | | | | | |
| `{town} Strand` | 4 | twn | | | | | | | |
| `{seaCreature} Strand` | 2 | crt | | | | | | | |
| `{town} Links` | 3 | twn | | | british | links | sand | | |
| `{town} Machair` | 2 | twn | | | british | machair | | | |
| `{town} Denes` | 2 | twn | | | british | denes | sand | | |
| `{town} Spit` | 4 | twn | | | | | sand | | |
| `{shoreQuality} Spit` | 2 | qual | | | | | sand | | |
| `Ayre of {town}` | 2 | twn | ✓ | | british, norse | northIsle | | | |
| `{town} Saltings` | 2 | twn | | | british | saltings | | | |
| `{town} Flats` | 3 | twn | | | | | | plain | |
| `The {town} Shingle` | 2 | twn | | | | | | | |
| `{town} Dunes` | 3 | twn | | | | | sand | | |
| `The {town} Snook` | 1 | twn | | | british | snook | | | |

### 9.4 Coves and inlets

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{town} Cove` | 10 | twn | | | | cove | | plain | |
| `{seaCreature} Cove` | 6 | crt | | | | cove | | | |
| `{bayQuality} Cove` | 4 | qual | | | | cove | | | |
| `{person:poss} Cove` | 3 | per | | | | cove | | | |
| `{coveFolk:poss} Cove` | 3 | qual | | | | cove | | | |
| `{town} Creek` | 5 | twn | | | | creek | | | |
| `{town} Inlet` | 3 | twn | | | | | | plain | |
| `{town} Haven` | 5 | twn | | | | | | | |
| `Porth {town}` | 4 | twn | | | british | porth | | | |
| `{town} Geo` | 3 | twn | | | british, norse | geo | | | |
| `{seaCreature} Geo` | 2 | crt | | | british, norse | geo | | | |
| `{town} Wick` | 3 | twn | | | british, norse | northIsle | | | |
| `Wick of {town}` | 2 | twn | ✓ | | british, norse | northIsle | | | |
| `{town} Hope` | 2 | twn | | | british, norse | northIsle | | | |
| `{town} Chine` | 3 | twn | | | british | chine | | | |
| `{town} Pill` | 2 | twn | | | british | pill | | | |
| `{town} Fleet` | 2 | twn | | | british | fleet | | | |
| `{town} Lagoon` | 4 | twn | | | | | tropic | | |
| `{town} Pass` | 3 | twn | | | | | tropic | | |
| `Mermaid's Cove` | 1 | unc | | | | cove | | light | |

- Off British home shores, home-British shapes are weight 0 (§3.3).
- `{town} Lagoon` is ×3 for west-african; `{town} Pass` is ×5 for polynesian.

### 9.5 Islands

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{town} Island` | 8 | twn | | | | | | plain | |
| `{town} Isle` | 6 | twn | | | | | | | |
| `Isle of {town}` | 6 | twn | ✓ | | | | | | |
| `{seaCreature} Island` | 8 | crt | | | | | | | |
| `{seaCreature} Isle` | 4 | crt | | | | | | | |
| `{islandQuality} Island` | 4 | qual | | | | | | | |
| `{islandQuality} Isle` | 3 | qual | | | | | | | |
| `{seaColour} Island` | 4 | col | | | | | | | |
| `{town} Holm` | 4 | twn | | | british, norse | holm | | | |
| `{islandQuality} Holm` | 3 | qual | | | british, norse | holm | | | |
| `Inch {person}` | 2 | per | | | british | inch | | | |
| `Inch {town}` | 1 | twn | | | british | inch | | | |
| `Calf of {town}` | 2 | twn | ✓ | | british, norse | northIsle | | | |
| `{town} Skerries` | 2 | twn | | | | skerry | cliff | | |
| `The {number} Isles` | 3 | qual | | | | | | | |
| `The {town} Isles` | 4 | twn | | | | | | | |
| `The {seaCreature} Islands` | 3 | crt | | | | | | | |
| `{town} Islands` | 3 | twn | | | | | | | |
| `{holy:poss} Island` | 4 | sai | | | christian | | | | |
| `{town} Key` | 4 | twn | | EM, ST, MO, NF, IS | | | tropic | | |
| `{seaCreature} Cay` | 3 | crt | | EM, ST, MO, NF, IS | | | tropic | | |
| `{town} Atoll` | 3 | twn | | | | | tropic | | |
| `{person} Archipelago` | 2 | per | | ST, MO, NF, IS | | | | grand | |
| `{explorerMood} Island` | 3 | mood | | | | | | | |
| `The Drowned Isle of {town}` | 1 | twn | ✓ | | | | | strange | true |

- `{town} Atoll` is ×5 for polynesian.
- Off British home shores, `Key` and `Cay` keep their weights; on British home shores they are weight 0.

### 9.6 Coasts and shores

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{town} Coast` | 6 | twn | | | | | | plain | |
| `{direction} Coast` | 6 | dir | | | | | | plain | |
| `{coastGoods} Coast` | 6 | qual | | EM, ST | | | | | |
| `{seaColour} Coast` | 4 | col | | | | | | | |
| `{folk} Coast` | 4 | ppl | | | | | | | |
| `Coast of {town}` | 3 | twn | ✓ | | | | | | |
| `{grimCoast} Coast` | 3 | qual | | | | | | grim | |
| `{town} Shore` | 4 | twn | | | | | | | |
| `{direction} Shore` | 3 | dir | | | | | | | |
| `{direction} Seaboard` | 2 | dir | | EM, ST, MO, NF, IS | | | | plain | |
| `{town} Riviera` | 2 | twn | | ST, MO | | | | light | |
| `The {town} Littoral` | 1 | twn | | | roman, greek-byzantine | | | grand | |

`{coastGoods} Coast` is ×3 on new shores (on top of §3.2, which doesn't touch `qual`).

---

## 10. Shapes: sea charts

### 10.1 Banks and shoals

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{town} Bank` | 10 | twn | | | | | | plain | |
| `{seaCreature} Bank` | 6 | crt | | | | | | | |
| `{boatWord} Bank` | 3 | boat | | | | | | | |
| `{town} Sands` | 8 | twn | | | | | sand | | |
| `{town} Sand` | 6 | twn | | | | | sand | plain | |
| `{lengthAdj} Sand` | 4 | qual | | | | | sand | | |
| `{town} Shoal` | 6 | twn | | | | | | plain | |
| `{town} Shoals` | 3 | twn | | | | | | | |
| `{town} Knoll` | 3 | twn | | | | | | | |
| `{town} Knock` | 3 | twn | | | british | estuary | | | |
| `{town} Wash` | 2 | twn | | | british | wash | | | |
| `{town} Patch` | 2 | twn | | | | | | plain | |
| `{town} Ridge` | 3 | twn | | | | | | | |
| `The {town} Bar` | 4 | twn | | | | | | | |
| `{town} Flats` | 2 | twn | | | | | | | |
| `The {lengthAdj} {depthNumber}` | 3 | qual | | EM, ST, MO | | fourteens | | | |
| `{seaCreature} Grounds` | 3 | crt | | | | | | plain | |
| `{folkUncanny} Ground` | 2 | unc | | | | | | strange | |
| `{ship} Bank` | 2 | ship | | | | | | | |

### 10.2 Reefs, rocks and ledges

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{town} Reef` | 8 | twn | | | | | | plain | |
| `{seaColour} Reef` | 4 | col | | | | | | | |
| `{seaCreature} Reef` | 3 | crt | | | | | | | |
| `{town} Rocks` | 6 | twn | | | | | | plain | |
| `{town} Ledges` | 4 | twn | | | | | | | |
| `The {town} Ledge` | 3 | twn | | | | | | | |
| `The {number} Stones` | 3 | qual | | | | | | | |
| `The {stackGroup}` | 3 | qual | | | | | | | |
| `{person:poss} Rock` | 3 | per | | | | | | | |
| `{folkUncanny} Rock` | 3 | unc | | | | | | | |
| `{town} Skerries` | 3 | twn | | | | skerry | cliff | | |
| `{town} Scars` | 3 | twn | | | british | scar | | | |
| `{town} Shelf` | 2 | twn | | | | | | | |
| `The {town} Pinnacle` | 2 | twn | | | | | | | |
| `{town} Breakers` | 2 | twn | | | | | | | |
| `Outer {town} Reef` | 2 | twn | | | | | tropic | | |
| `{seaMonster} Reef` | 2 | mon | | | | | | grim | true |

### 10.3 Deeps and holes

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{town} Deep` | 8 | twn | | | | | | plain | |
| `{folkUncanny} Hole` | 4 | unc | | | | | | | |
| `{town} Hole` | 4 | twn | | | | | | | |
| `{pitWord} Pit` | 3 | qual | | | | | | | |
| `{town} Trench` | 5 | twn | | ST, MO | | | | | |
| `{town} Trough` | 4 | twn | | ST, MO | | | | | |
| `{ship} Deep` | 4 | ship | | | | | | | |
| `{town} Basin` | 3 | twn | | MO | | | | plain | |
| `{seaColour} Deep` | 3 | col | | | | | | | |
| `{seaQuality} Deep` | 3 | qual | | | | | | | |
| `The {seaMonster:poss} Deep` | 2 | mon | | | | | | grim | true |

### 10.4 Races, tides and currents

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{town} Race` | 6 | twn | | | | | | | |
| `Race of {town}` | 5 | twn | ✓ | | | | | | |
| `{town} Overfalls` | 4 | twn | | | | | | plain | |
| `The {town} Rip` | 2 | twn | | | | | | | |
| `{river} Bore` | 4 | riv | | | | bore | | | |
| `The {river} Aegir` | 1 | riv | | | british | aegir | | | |
| `{town} Current` | 6 | twn | | ST, MO | | | | plain | |
| `{seaColour} Current` | 4 | col | | | | | | | |
| `{direction} Current` | 4 | dir | | ST, MO | | | | plain | |
| `{directionAdj} Drift` | 3 | dir | | ST, MO | | | | | |
| `{town} Stream` | 3 | twn | | ST, MO | | | | | |
| `{person} Current` | 3 | per | | ST, MO | | | | | |
| `{kinCurrent} Current` | 2 | qual | | | japanese | | | | |
| `{person:poss} Cauldron` | 3 | per | | | | cauldron | | strange | |
| `{town} Whirlpool` | 3 | twn | | | | | | | |
| `The {town} Maelstrom` | 1 | twn | | | | | | grim | |
| `The {swallowWord}` | 2 | qual | | | | | | strange | |
| `The Merry Men of {town}` | 2 | per | ✓ | | british, norse | merryMen | | light | |
| `The {town} Boils` | 1 | twn | | | | | | | |
| `{town} Tideway` | 2 | twn | | | british | | | | |

- `The {town} Maelstrom` is ×3 for norse.
- `{seaColour} Current` is ×4 for japanese.

### 10.5 Roads and anchorages

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{town} Roads` | 10 | twn | | EM, ST | | roads | | plain | |
| `{town} Roads` | 4 | twn | | AN, MD, MO | | roads | | plain | |
| `{town} Anchorage` | 4 | twn | | | | | | plain | |
| `{town} Pool` | 4 | twn | | | | | | | |
| `{town} Lee` | 2 | twn | | | | | | | |
| `{town} Hope` | 3 | twn | | | british, norse | northIsle | | | |
| `The {lengthAdj} Hope` | 2 | qual | | | british, norse | northIsle | | | |
| `{town} Roadstead` | 2 | twn | | EM, ST, MO | | | | plain | |
| `{town} Haven` | 3 | twn | | | | | | | |
| `{town} Sound` | 3 | twn | | | | | | | |

### 10.6 Channels and swatchways

| Shape | w | f | of | Eras | Cultures | rt | bt | Tone | h |
|---|--:|---|:-:|---|---|---|---|---|---|
| `{town} Channel` | 8 | twn | | | | | | plain | |
| `{seaColour} Deep` | 4 | col | | | british | deepChannel | | | |
| `{town} Deep` | 3 | twn | | | british | deepChannel | | | |
| `{person:poss} Gat` | 3 | per | | | british | estuary | | | |
| `{gatTrade} Gat` | 3 | qual | | | british | estuary | | | |
| `{town} Gat` | 2 | twn | | | british | estuary | | | |
| `{town} Swatch` | 2 | twn | | | british | estuary | | | |
| `{town} Swatchway` | 2 | twn | | | british | estuary | | | |
| `{direction} Swin` | 2 | dir | | | british | estuary | | | |
| `{town} Spitway` | 2 | twn | | | british | estuary | | | |
| `{town} Gut` | 2 | twn | | | | | | | |
| `{town} Fairway` | 2 | twn | | ST, MO | | | | plain | |
| `{town} Run` | 2 | twn | | | | | | | |

Off British home shores, home-British shapes are weight 0 (§3.3), and `{town} Channel` and `{town} Gut` carry the kind.

---

## 11. Culture shapes

Added to the named kind at the given weight, as RN §7's culture shapes. All are family `fixed` (×1) unless noted.

| Culture | Module · kind | Shape | w | Eras | Tone |
|---|---|---|--:|---|---|
| roman | seas · sea | `Our Sea` | 3 | AN | grand |
| roman | seas · strait | `Pillars of {person}` | 3 | AN, MD | grand |
| greek-byzantine | seas · strait | `{fordBeast} Ford` | 6 | | |
| greek-byzantine | seas · sea | `Fore Sea` | 2 | AN, MD | |
| steppe | seas · lake | `{seaColour} Sea` | 10 | | |
| steppe | seas · lake | `Sea of Islands` | 2 | | |
| arabic-persian | seas · ocean | `Sea of Darkness` | 4 | AN, MD, EM | grim |
| indian | seas · bay | `Bay of {kingdom}` | 6 | | |
| chinese | seas · lake | `{lakeShape} Sea` | 6 | | |
| chinese | seas · sea | `The Four Seas` | 1 | | grand |
| japanese | seas · sea | `Inland Sea` | 4 | | |
| egyptian | seas · sea | `Great Green` | 6 | AN | |
| egyptian | seas · lake | `Great Lake` | 4 | AN, MD | |
| bantu | seas · lake | `Great Water` | 4 | | |
| bantu | seas · lake | `Home of {god}` | 3 | | grand |
| west-african | seas · lake | `Great Water` | 4 | | |
| aztec | seas · sea | `Sky Water` | 6 | AN, MD, EM | |
| aztec | seas · sea | `Divine Water` | 3 | AN, MD, EM | grand |
| aztec | seas · lake | `Lake of the Moon` | 3 | | |
| maya | seas · sea | `Sky Water` | 3 | AN, MD, EM | |
| polynesian | seas · ocean | `Great Ocean of the {skyPath}` | 10 | | grand |
| polynesian | seas · sea | `Sea of the {skyPath}` | 4 | | |
| andean | seas · sea | `Mother Sea` | 6 | | |
| andean | seas · lake | `Mother Lake` | 3 | | |

- Fixed whole names are also pools, one per module, so packs can add to them: `watersFixed:seas`, `watersFixed:coasts`, `watersFixed:charts`, `watersFixed:hyperspace`. They start empty.
- A culture shape with no live token (no `{god}` source) is weight 0.

---

## 12. Hyperspace charts

### 12.1 The rule behind it

Hyperspace is a sea with **depth** (how far below realspace a ship is), **set and drift** (where an unpowered ship is carried, and how fast), **holding** (how well a drive or hull grips the medium) and **hazards**. Star systems are its islands; the edge of a system's gravity is its coast. A **Draw** is where the medium sinks into deeper hyperspace, a **Spill** where it wells up (NR §1.5). This text goes in the module's guide (the info button the other modules use), in Kenny's British English.

### 12.2 Scale

Reuse the space scale data (SN §2) without the planetary system. With scale any, draw by: Sy 25, Nb 30, Se 25, Ga 20. Each kind lists its scales (§12.5); a shape may narrow them with `sc`.

### 12.3 Register

Every shape has a register: **s** spacers' words, **c** chart words, **v** survey words. Multipliers:

| Link | s | c | v |
|---|--:|--:|--:|
| any | 1 | 1 | 0.5 |
| spacers' words | 1 | 0.15 | 0 |
| chart words | 0.3 | 1 | 0.2 |
| survey words | 0 | 0.4 | 1 |

### 12.4 Medium

Shapes marked `m: sea` are weight 0 under *like the wind*; `m: wind` are weight 0 under *like the sea*. Under *like the sea or the wind*, both are live. Unmarked shapes are always live.

### 12.5 Kinds

| Key | Menu | Plural | Scales | Weight |
|---|---|---|---|--:|
| `waters` | Great waters | great waters | Se, Ga | 8 |
| `shore` | Coasts and shores | coasts and shores | Sy, Nb | 15 |
| `shoal` | Shoals, reefs and banks | shoals, reefs and banks | Sy, Nb, Se | 18 |
| `deep` | Deeps and wells | deeps and wells | Sy, Nb, Se, Ga | 12 |
| `strait` | Straits and passages | straits and passages | Nb, Se | 14 |
| `current` | Currents and tides | currents and tides | Sy, Nb, Se, Ga | 15 |
| `calm` | Calms and anchorages | calms and anchorages | Sy, Nb | 8 |
| `divide` | Divides and fronts | divides and fronts | Nb, Se, Ga | 6 |
| `weather` | Weather belts | weather belts | Nb, Se, Ga | 4 |

A kind is offered at a scale when the scale is in its list (all kinds at scale any).

### 12.6 Pools and sources

`hyperColour`, `hyperAdj`, `hyperPhysical`, `weatherAdj`, `depthBand` (§5); `{star}`, `{spaceDirection}` (§4); `{person}`, `{holy}`, `{folk}`, `{number}`, `{ordinal}` as RN §4.2, and `{god}` as §4. Hyperspace never reads `spaceLand`, `spacePrefix` or `spaceHazard`.

### 12.7 Shapes

Columns: weight; register; medium; scales (the kind's if blank); tone.

**Great waters**

| Shape | w | Reg | m | sc | Tone |
|---|--:|---|---|---|---|
| `The {hyperColour} Main` | 6 | s | | Ga | |
| `The {spaceDirection} Main` | 4 | s | | Ga | plain |
| `The {star} Sea` | 6 | s | | | |
| `The {hyperAdj} Sea` | 6 | s | | | |
| `The {spaceDirection} Deep` | 4 | s | | | |
| `The {star} Gyre` | 5 | c | | | |
| `The Great {spaceDirection} Gyre` | 3 | c | | Ga | grand |
| `The {star} Basin` | 4 | c | | | |
| `The {folk} Main` | 2 | s | | | |
| `{person:poss} Ocean` | 2 | c | | | grand |

**Coasts and shores**

| Shape | w | Reg | m | sc | Tone |
|---|--:|---|---|---|---|
| `{star} Realshore` | 8 | s | | | plain |
| `The {star} Coast` | 8 | s | | | |
| `{star} Starshore` | 4 | s | | | |
| `The {hyperAdj} Shore` | 4 | s | | | |
| `The {star} Shallows` | 4 | s | | | |
| `{star} Offing` | 5 | c | | | |
| `The {star} Hard Coast` | 3 | s | | | |
| `The {star} Soft Coast` | 2 | s | | | |
| `{star} Littoral` | 3 | v | | | |
| `The False Shore of {star}` | 2 | s | | | strange |
| `{star} Voidshore` | 2 | s | | | grim |
| `Cape {star}` | 3 | s | | | |
| `{star} Point` | 3 | s | | | |
| `The {star} Keys` | 3 | s | | Nb | |
| `{star} Atoll` | 2 | c | | Nb | |
| `The {star} Beach` | 2 | s | | Sy | light |
| `{star} Riftmouth` | 2 | s | | | |

**Shoals, reefs and banks**

| Shape | w | Reg | m | sc | Tone |
|---|--:|---|---|---|---|
| `{star} Shoal` | 8 | s | | | plain |
| `{star} Reef` | 6 | s | | | |
| `{star} Bank` | 6 | s | | | |
| `The {hyperColour} Banks` | 6 | s | | | |
| `{hyperPhysical} Shoal` | 5 | s | | | |
| `{hyperPhysical} Reef` | 5 | s | | | |
| `{hyperPhysical} Bank` | 3 | s | | | |
| `The {star} {hyperPhysical} Shoal` | 3 | c | | | |
| `{star} Bar` | 4 | s | | | |
| `The {hyperPhysical} Bar` | 2 | s | | | strange |
| `The {hyperAdj} Reef` | 3 | s | | | |
| `{star} Sill` | 5 | c | | | |
| `{star} Shelf` | 4 | c | | | |
| `{star} Ledge` | 3 | c | | | |
| `The {star} Pinnacle` | 2 | c | | | |
| `{star} Knoll` | 1 | v | | | |
| `{star} Seamount` | 1 | v | | | |
| `{holy:poss} Bar` | 2 | s | | | |
| `{person:poss} Reef` | 3 | s | | | |
| `The {number} Banks` | 2 | s | | | |
| `{star} Breakers` | 2 | s | | | |

`{holy:poss}` shapes need a christian culture, as earthly.

**Deeps and wells**

| Shape | w | Reg | m | sc | Tone |
|---|--:|---|---|---|---|
| `{star} Trench` | 6 | c | | | |
| `{star} Deepfold` | 5 | s | | | |
| `{star} Depthwell` | 5 | s | | | |
| `The {star} Draw` | 4 | s | | | |
| `{star} Depthrise` | 3 | s | | | |
| `The {star} Spill` | 2 | s | | | |
| `The {hyperAdj} Trench` | 3 | c | | | |
| `{star} Trough` | 3 | c | | | |
| `{star} Hole` | 3 | s | | | |
| `The {hyperAdj} Pit` | 2 | s | | | grim |
| `{star} Shallowfold` | 2 | s | | | |
| `The {star} Undershelf` | 2 | c | | | |
| `{star} False Bottom` | 2 | s | | | strange |
| `The {star} Moat` | 2 | c | | | |
| `{star} Escarpment` | 2 | c | | | |
| `{star} Scarp` | 2 | s | | | |
| `{star} Slope` | 2 | c | | | |
| `The Unsounded Deep of {star}` | 1 | s | | | strange |
| `{star} Abyss` | 1 | s | | | grim |
| `The {star} Plain` | 1 | v | | Se, Ga | |
| `{star} Fan` | 1 | v | | | |

**Straits and passages**

| Shape | w | Reg | m | sc | Tone |
|---|--:|---|---|---|---|
| `{star} Strait` | 8 | s | | | plain |
| `The {star} Narrows` | 6 | s | | | |
| `The {hyperColour} Narrows` | 3 | s | | | |
| `{star} Channel` | 5 | c | | | |
| `{star} Gut` | 3 | s | | | |
| `{star} Swatch` | 3 | s | | | |
| `{star} Saddle` | 3 | c | | | |
| `The {star}–{star} Saddle` | 2 | c | | | |
| `{star} Gate` | 3 | s | | | |
| `{star} Threadway` | 4 | s | | | |
| `The {star} Thread` | 3 | s | | | |
| `The {spaceDirection} Thread` | 3 | s | | | |
| `{star} Runnel` | 2 | s | | | |
| `{star} Fairwater` | 2 | s | | | |

**Currents and tides**

| Shape | w | Reg | m | sc | Tone |
|---|--:|---|---|---|---|
| `The {star} Current` | 6 | s | | | plain |
| `{star} Flowroad` | 5 | s | | | |
| `The {hyperColour} Current` | 3 | s | | | |
| `The {spaceDirection} Drift` | 4 | s | | | |
| `The {star} Race` | 5 | s | | | |
| `The {star} Eddy` | 4 | s | | | |
| `{star} Tide` | 4 | s | | Sy | |
| `The Blind Tide of {star}` | 2 | s | | Sy | strange |
| `{star} Tidepath` | 3 | s | | Sy, Nb | |
| `{star} Wake` | 3 | s | | | |
| `{star} Jet` | 3 | c | | | |
| `The {star} Countercurrent` | 3 | c | | | |
| `{star} Undercurrent` | 2 | c | | | |
| `{star} Gyre` | 3 | c | | Se, Ga | |
| `{star} Overfalls` | 4 | s | sea | | |
| `{star} Bore` | 3 | s | sea | | |
| `{star} Boil` | 2 | s | sea | | |
| `{star} Rip` | 2 | s | | | |
| `The {star} Whirl` | 2 | s | | | |
| `{star} Maelstrom` | 1 | s | | | grim |
| `{star} Vortex` | 2 | c | | | |
| `The {star} Shock` | 3 | c | wind | | |
| `{star} Shock Train` | 1 | v | wind | | |
| `The {star} Return` | 2 | s | | | |
| `The {star} Fold` | 2 | s | | | |
| `The {star} Manifold` | 2 | c | | | |
| `{star} Vortex Street` | 1 | v | | | |
| `{star} Upwelling` | 1 | v | | | |
| `{star} Downwelling` | 1 | v | | | |

**Calms and anchorages**

| Shape | w | Reg | m | sc | Tone |
|---|--:|---|---|---|---|
| `{star} Roads` | 6 | s | | | plain |
| `{star} Anchorage` | 5 | c | | | plain |
| `The {star} Lee` | 5 | s | | | |
| `{star} Slack` | 3 | s | | | |
| `The {star} Slack Basin` | 2 | c | | | |
| `{star} Stillwater` | 3 | s | | | |
| `The {star} Eye` | 3 | s | | | |
| `The {hyperAdj} Calm` | 3 | s | | | |
| `{person:poss} Calm` | 2 | s | | | |
| `The {star} Doldrums` | 2 | s | wind | | |
| `{star} Deadwater` | 2 | s | sea | | |
| `The {star} Hush` | 2 | s | | | strange |
| `{star} Restwater` | 2 | s | | | |
| `The {star} Still Point` | 2 | s | | | |
| `{star} Cavitation` | 1 | v | sea | | |

**Divides and fronts**

| Shape | w | Reg | m | sc | Tone |
|---|--:|---|---|---|---|
| `The {star} Divide` | 6 | s | | | |
| `{star} Separatrix` | 4 | c | | | |
| `The {star} Front` | 5 | c | | | |
| `The {star} Shear` | 4 | c | | | |
| `The {hyperColour} Shear` | 4 | c | | | |
| `{star} Null` | 4 | c | | | |
| `The {star} Fork` | 3 | s | | | |
| `The {star} Confluence` | 3 | c | | | |
| `The {star} Crossroads` | 2 | s | | | |
| `{star} Depthline` | 3 | c | | | |
| `The {ordinal} Depthline` | 2 | c | | | plain |
| `The {star} Layer` | 2 | c | | | |
| `The {star} Marches` | 2 | s | | | |
| `The {hyperAdj} Front` | 2 | s | | | |
| `{star} Bifurcation` | 1 | v | | | |
| `{star} Pycnocline` | 1 | v | sea | | |
| `{star} Rarefaction` | 1 | v | wind | | |
| `The {star} Expansion Fan` | 1 | v | wind | | |
| `The {star} Pressure Ridge` | 1 | c | wind | | |

**Weather belts**

| Shape | w | Reg | m | sc | Tone |
|---|--:|---|---|---|---|
| `The {weatherAdj} {depthBand}` | 4 | s | | | |
| `The {star} Squalls` | 3 | s | wind | | |
| `{hyperPhysical} Fog` | 3 | s | | | strange |
| `The {hyperColour} Fog` | 2 | s | | | |
| `The {star} Storm Belt` | 3 | c | | | |
| `The {hyperAdj} Swell` | 3 | s | | | |
| `The {star} Groundswell` | 2 | s | | | |
| `{star} Standing Wave` | 2 | c | | | |
| `The {star} Seiche` | 1 | v | sea | | |

### 12.8 Culture in hyperspace

Culture chooses the people, saints, gods and folk in names; it does not change shape weights except through §3.5's `per`, `god`, `ppl` and `sai` columns, which apply to hyperspace shapes using those tokens. Family for every other hyperspace shape is `fixed`.

---

## 13. Series

For coasts and islands, sea charts and hyperspace charts, with series on:

- At the start of the batch draw **two anchors**: two `{town}` values (earthly) or two `{star}` values (hyperspace).
- Each name's first `{town}` or `{star}` token takes one of the anchors (equal chance) with probability **0.6**; otherwise it draws freely.
- A name may hold an anchor only once; a shape with two `{star}` tokens uses at most one anchor.
- Anchors are reused through the series helpers route names uses (`seriesTokenKind`).

So a set reads like one stretch of coast: *Hesket Head*, *Hesket Sands*, *Seal Skerry*, *Hesket Roads*.

---

## 14. Safeguards

Exact phrases, case-insensitive, checked on the whole name with and without a leading *The*.

- **Earthly block list:** Grey Havens, Sword Coast, Sea of Fallen Stars, Isle of Dread, Sea of Thieves, Sea of Stars, Skull Island.
- **Hyperspace block list:** The Maelstrom, Eye of Terror, Immaterium, Webway, Witch Space, Witchspace, Foldspace, Slow Zone, Unthinking Depths, Transcend, Infraspace, Ultraspace, Astral Sea, Wildspace, Phlogiston, Hydian Way, Perlemian Trade Route, Corellian Run, Rimma Trade Route, The Maw, Roaring Forties, Furious Fifties, Screaming Sixties.
- **Hyperspace also checks** the existing space safeguards (SN §10; `hasSpaceBlock`).
- A blocked name is redrawn, as RN §12.

---

## 15. Presets and history

As RN §13: each module's state saves as a preset note and runs as the module runs. Preset fields: `culture`, `kind`, `era`, `where`, `fantastic`, `region`, `biome`, `tone`, `people`, `series`; hyperspace adds `scale`, `medium`, `register` and drops `era`, `where`, `fantastic`, `region`, `biome`. Values outside their choices fall back to the defaults. History as §1.3.

---

## 16. Milestones

Commit at the end of each, with `npm test` and `npm run build` passing.

1. **Group and engine.** Sections, the group, icons, switcher order, `waters.json` skeleton, `src/waters/engine.ts` and `sentence.ts` with the shared pipeline (§7), §3 tables, §4 sources and §5 pools, `docs/vocabulary-pools.md` rows.
2. **Seas and lakes** (§6.1, §8, §11 for seas). Tests §17.1.
3. **Coasts and islands** (§6.2, §9) and series (§13). Tests §17.2.
4. **Sea charts** (§6.3, §10), including `{ship}` and `{river}`. Tests §17.3.
5. **Hyperspace charts** (§12), with scale, register, medium and the guide text. Tests §17.4.
6. **Safeguards, presets and history** (§14–§15). Tests §17.5.
7. **Docs** (§18).

---

## 17. Tests

### 17.1 Seas and lakes

- Every shape's tokens resolve; every `rt` and `bt` is a key in §3.3 or §3.4; every culture key exists.
- On British home shores in NSI, 2,000 names include *Voe* or *Firth* at least once, and never *Fjord*, *Llyn*, *Broad* or *Tarn*.
- In EAN, 2,000 lake names include *Broad* at least once; in WAL, *Llyn*; in NTH, *Tarn* and *Water*.
- Off British home shores, no home-British shape (§3.3) appears for a British culture in 2,000 names; norse still gets *Voe*, *Holm* and *Geo* on any shore.
- Fused forms only ever use `lakeFuse` (*Reedmere*, never a town).
- `{seaKenning}` never appears outside anglo-saxon and norse; `{cosmoSubstance}` never outside indian.
- NF and IS: maria shapes make up at least 15% of 2,000 sea names; IS sea-monster shapes appear with fantastic off.
- With fantastic off, no `h: true` shape appears in any era before IS.

### 17.2 Coasts and islands

- In COR, *Porth* and *Cove* appear in 2,000 names; *Naze*, *Bill*, *Mull*, *Geo* and *Voe* never do.
- In SHH, *Mull of*, *Machair* and *Stack* appear; *Chine*, *Pill* and *Denes* never do.
- Biome tropical archipelago (non-British culture): *Key*, *Cay*, *Atoll*, *Lagoon* or *Pass* make up at least 20% of 2,000 names; biome boreal: none of them appear.
- New shores, early modern: explorer's-mood shapes make up at least 10% of 2,000 headland names and of 2,000 island names; home shores: under 2%. The same holds for bay names in seas and lakes.
- Series on: across 1,000 batches of 10, the share of names holding an anchor is 0.6 ± 0.05 among names whose shape has a `{town}`.

### 17.3 Sea charts

- `{ship}` never appears in AN or MD.
- *Trench* and *Trough* never appear before ST.
- *Gat*, *Swin*, *Swatchway*, *Spitway* and *Knock* only appear in SEA, EAN and EMD.
- The depth-number shape renders as *The Broad Fourteens*-style two words after *The*.

### 17.4 Hyperspace charts

- The hyperspace pipeline never reads `spaceLand`, `spacePrefix` or `spaceHazard` (assert the pools it touches).
- `{star}` never yields a Bayer or catalogue form; possessives drop *Star*.
- Scale Sy: no great-waters or straits-and-passages names; scale Ga: no *Realshore* or *Roads*.
- Medium sea: no `m: wind` shape in 2,000 names; medium wind: no `m: sea` shape.
- Register spacers': no `v` shape and under 10% `c` shapes in 2,000 names; survey: no `s` shapes.
- No blocked phrase (§14) appears in 10,000 names across all settings.

### 17.5 Safeguards, presets, history and regressions

- A preset round-trips for each module.
- History labels match §1.3.
- Every existing regression fixture passes unchanged (place, compound, recipe, ageing, tribal, group, biome, land and settlement snapshots).

---

## 18. Docs

- Add this brief and `nautical-lexicon-review.md` to `docs/`.
- `docs/vocabulary-pools.md`: a row for every pool in §5.
- README: a short **Seas and coasts** section listing the four modules in one line each, in British English with OUP punctuation.

---

## 19. Parked

- Route names drawing hyperspace currents and threads for its *by hyperspace lanes* choice.
- Moving river names into the seas and coasts group.
- Transient hyperspace storms as an events-and-eras kind.
- A fantasy *astral sea* or aether variant of hyperspace charts.
- Named winds (*mistral*, *sirocco*).
