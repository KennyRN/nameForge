# Wild lands – brief (first release)

**Status:** agreed with Kenny, 19 October 2026. Implement in the milestones of §15.

This brief adds a new group, **wild lands**, holding six terrain modules that share one engine:

- **mountains:** ranges, peaks, ridges and crags, passes, gorges, valleys and corries, streams and falls, mountain rivers, tarns, glaciers, caves and mines, and mountain settlements
- **forests and woods:** forests, groves and copses, clearings and glades, rides and forest roads, streams and springs, forest rivers, pools and ponds, named trees and stones, walks and coverts, and forest settlements
- **deserts:** deserts and sand seas, dunes, stony plains and salt flats, mesas and rocks, canyons and wadis, oases and wells, salt lakes, caravan roads, lost places, and desert settlements
- **moors and heaths:** moors and fells, tors and riggs, mosses and mires, cloughs and combes, becks and burns, tarns and pools, stones and crosses, moorland tracks, and moorland settlements
- **wetlands:** marshes and fens, bogs, swamps and backwaters, reedbeds and carrs, meres and broads, lodes and drains, holmes and eyots, causeways and fords, deltas and saltmarshes, and wetland settlements
- **grasslands:** plains and steppes, downs and wolds, meadows and leas, heaths and commons, vales and straths, streams and waterholes, ponds, droves and trails, barrows and lone trees, and grassland settlements

Each module's settlements also **feed the urban group's settlement names module** (§10). When settlement names is set in mountains, forest, wetland, plains or hills, most of its names come from the matching terrain module, so they carry the terrain: *Wolf Pass Fort*, *Deepdale Head*, *Oakhurst*, *Swinfen*, *Ashby under Hartley Pike*.

**Build order.** This brief comes after the **urban brief** (urban group and settlement names). It needs `generateSettlementNames` in `src/settlement/names.ts` and the `settlementNames` section. If they aren't in the code, stop and say so before M1.

**Data.** All shapes, kinds and tag tables are in `wilds.json`. All new word pools are in `wilds-pools.json`. Both are delivered with this brief and are fixed: don't re-derive, reweight or retype them.

- `wilds.json` goes into `src/data/` as it is.
- `wilds-pools.json` is merged into the `pools` object of `src/data/settlement-vocab.json`, so vocabulary packs can extend the new pools (RN §3). None of its pool names exist yet.

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow `docs/seas-and-coasts-brief.md` (SC §x) first, then `docs/route-names-brief.md` (RN §x), `docs/land-brief.md` (LB §x), `docs/group-names-brief.md` (GN §x) and `docs/group-tone-and-series-brief.md` (TS §x). Reuse existing helpers rather than copying them: weighted draws, the tone factor, `routePlace`, `routeFolk`, `routeKingdom`, `personNames`, `godNames`, `groupSaint`, `riverFill`, `cultureAllowed`, the biome helpers in `src/biomes.ts`, and the safeguard checks.

All output is in modern English. Real names are models, not outputs. A generated name that happens to match a real one (*Black Mountains*, *Dartmoor*, *Salisbury Plain*) is allowed, as british place names allows *Oxford*. Franchise names and the holy mountains of living religions are blocked (§13).

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | A new group **wild lands**, straight after seas and coasts in the switcher, holding six modules |
| Engine | One shared engine (`src/wilds/engine.ts`) and data file (`src/data/wilds.json`), as the waters engine serves seas and coasts |
| Modules | mountains · forests and woods · deserts · moors and heaths · wetlands · grasslands, each with its own kinds (§6) |
| Cultures | The 22 route-name cultures (RN §4.1), with Polynesian and Andean handled as RN §12.4 |
| Eras | All seven. In near future and interstellar the modules name the land of other worlds (SC §3.6) |
| Where | **In home country** or **in newly explored country** (§3.2) |
| British regions | The 12 place-shape regions, for the three British cultures in home country, in every module except deserts |
| Biomes | Each module offers the biomes its terrain exists in (§3.4), wherever the region link isn't shown |
| British words | Common English and long-established regional English only: no Gaelic or Welsh forms such as Bealach, Sgurr, Bwlch, Moel or Pen |
| Settlements | Each module's settlement kind is **60% purpose-built** shapes and **40% native** settlement names with the terrain locked (§9) |
| Settlement names | Its existing terrain choice sends 60% of its names to the matching wild-lands module (§10) |
| Fantastic, tone, people, series | As SC: the fantastic switch, the five tones, placeholders or invented, and a one-place series in every module (§12) |
| Biome packs | User biome packs are **parked** for these modules: only the 12 built-in biomes are offered |
| Icons | Kenny supplies SVGs for the group and all six modules (§1.2) |
| Other modules | Untouched. Every existing output stays identical, seed for seed, except settlement names with one of the five mapped terrains (§10.5) |

---

## 1. Group, modules and code layout

### 1.1 Group and sections

- Add six sections to `NameForgeSection`: `mountainNames`, `forestNames`, `desertNames`, `moorNames`, `wetlandNames`, `grasslandNames`. Their labels are **"mountains"**, **"forests and woods"**, **"deserts"**, **"moors and heaths"**, **"wetlands"** and **"grasslands"**.
- Add `WILDS_SECTIONS` (the six, in that order) and `wildLands` to `SectionGroup`, with the label **"wild lands"**. Its default module (`groupModule`) is `mountainNames`.
- Insert `wildLands` in `SWITCHER_ORDER` straight after `seasCoasts`, and the six sections in `SECTION_ORDER` straight after `...WATERS_SECTIONS`.

After the urban brief and this one, the switcher reads:

> markov · place names · urban · seas and coasts · **wild lands** · group names · bynames and titles · vehicles · named things · advanced

### 1.2 Icons

Kenny supplies the SVGs. **Before writing any code**, list the icons needed and wait for them:

1. wild lands (group)
2. mountains
3. forests and woods
4. deserts
5. moors and heaths
6. wetlands
7. grasslands

Register them as the vehicles SVG was registered: in `src/icons.ts`, with the inner markup wrapped in a `<g transform="scale(…)">` that fits Obsidian's 100×100 viewBox, and `currentColor` for fills and strokes. Then add them to `GROUP_ICONS` and `SECTION_ICONS`. Don't invent or substitute an icon. If one is missing, stop and ask.

### 1.3 History

- **Label:** `{module} · {era label} · {culture label}`.
- **Then, in order, when they apply:**
  - ` · new country` when chosen
  - ` · {region phrase}` or ` · {biome label}` when set
  - ` · {kind}` when not Any
  - ` · fantastic` or ` · steampunk` when on
  - ` · {tone}` when not Any
  - ` · series` in a series
- **Section lookup:** `historySection()` maps each module label prefix to its section. Check that "moors and heaths" can't be mistaken for any existing label, and that "mountains" doesn't match "mountain" text inside another module's label.

### 1.4 Code layout

| File | Contents |
|---|---|
| `src/data/wilds.json` | Delivered: modules, kinds, shapes, culture shapes, region and biome tags, multipliers, the settlement link tables, safeguards |
| `src/data/settlement-vocab.json` | The pools from `wilds-pools.json`, merged into `pools` |
| `src/wilds/engine.ts` | `generateWildsNames(options)` for all six modules, in the shape of `generateWatersNames`. No Obsidian imports |
| `src/wilds/sentence.ts` | The shared sentence builder, its state and plain text |
| `src/settlement/names.ts` | The wild-lands branch of settlement names (§10) |
| `docs/vocabulary-pools.md` | One row for every new pool |
| `tests/wildLands.test.ts`, `tests/wildSettlements.test.ts` | §16 |

Add this brief to `docs/` as `wild-lands-brief.md`.

**Shared code with the waters engine.** The region multiplier, biome multiplier, shape weight and pattern renderer work as SC's. Lift them into a shared helper only if that's straightforward **and** every waters fixture still passes unchanged. Otherwise mirror them in `src/wilds/engine.ts`.

---

## 2. The sentence

### 2.1 Shape

All six modules share one sentence:

> ‹Norman & British› ‹mountain features of any kind› of the ‹medieval› era, ‹in home country›, in a ‹realistic› world, ‹across all of Britain›, ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›.

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | the culture label | as RN §2.2 | `norman-british` (deserts: `general`) |
| `kind` | the module's Any text, or the kind's plural (§6) | Any, then the kinds live in the era | any |
| `era` | "of the ‹label› era" | the seven | `medieval` |
| `where` | "in home country" · "in newly explored country" | the two | home |
| `fantastic` | as RN §2.2 | the two | realistic |
| `region` | as RN §2.2 | all of Britain, then the 12 regions | all of Britain |
| `biome` | "in any land", or "in " + the biome's `phrase` | any land, then the module's biomes (§3.4) | any land |
| `tone` | as TS §5.2 | the six | any |
| `people` | as GN §2.2 | placeholders · invented | placeholders |
| `series` | "each one separate" · the module's series text | the two | separate |

**Any texts:**

| Module | Any text | Series text |
|---|---|---|
| mountains | mountain features of any kind | in one range |
| forests and woods | forest features of any kind | in one forest |
| deserts | desert features of any kind | in one desert |
| moors and heaths | moorland features of any kind | on one moor |
| wetlands | wetland features of any kind | in one marsh |
| grasslands | grassland features of any kind | on one plain |

**When fields show:**

- **Region** shows only for the three British cultures in home country, and never in deserts.
- **Biome** shows whenever region doesn't.

**Tooltips:**

- **Where:** "Home country: a people naming its own land. New country: explorers naming land they have just reached"
- **Biome:** "Weights the names towards a land's wildlife, plants and words"
- **Series:** "Names that share one place, like the peaks and passes of one range"
- **Everything else:** as RN §2.2.

### 2.3 Resets

- **Era:** changing the era to one where the chosen kind isn't live (§6) resets the kind to Any.
- **Culture or where:** changing either so the region link hides keeps the region in state but stops applying it.
- **Biome:** a biome the module doesn't offer resets to any land.

### 2.4 Plain text, state and presets

As SC §2.5. Each module keeps its own state on the modal, so switching between modules keeps each one's choices.

---

## 3. Cultures, settings, regions and biomes

### 3.1 Cultures and eras

As RN §4.1 and §4.3, with the same **British cultures** (anglo-saxon, celtic, norman-british) and **christian cultures**. The fantastic switch reads steampunk in the steam age, as RN.

### 3.2 Where: home or new country

`wilds.json` → `where`:

| Family | Home | New |
|---|--:|--:|
| `mood` (explorer's mood) | ×0.1 | ×4 |
| `sai` (saints) | ×1 | ×2 |
| `per` (persons) | ×0.5 | ×2 |
| everything else | ×1 | ×1 |

A shape's `nx` multiplies its weight in new country only.

### 3.3 Region tags

`wilds.json` → `regionTags`. These apply to British cultures in home country, in every module but deserts. They multiply the weight of every shape carrying the tag (`rt`). Untagged shapes are ×1. **All of Britain** (no region chosen) uses the mean of each tag's 12 values, as SC §3.3.

| Tag | Generics | COR | WCY | SEA | EAN | WMM | WAL | EMD | NTH | SBL | SLO | SHH | NSI |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| `ben` | Ben | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.3 | 1 | 3 | 0.5 |
| `corrie` | Corrie | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 0 | 1 | 3 | 0.3 |
| `glen` | Glen | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.3 | 1.5 | 2 | 2.5 | 0.5 |
| `fell` | Fell, Fells, ‹fused›fell | 0 | 0 | 0 | 0 | 0 | 0 | 0.3 | 3 | 1.5 | 0 | 0 | 0.5 |
| `pike` | Pike | 0 | 0 | 0 | 0 | 0.3 | 0 | 0.5 | 3 | 1 | 0 | 0 | 0 |
| `beck` | Beck, ‹fused›beck | 0 | 0 | 0 | 0.5 | 0 | 0 | 1 | 3 | 0.5 | 0 | 0 | 0 |
| `force` | Force | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0.5 | 0 | 0 | 0 |
| `ghyll` | Ghyll, Gill | 0 | 0 | 0.5 | 0 | 0 | 0 | 0.5 | 3 | 1 | 0 | 0 | 0 |
| `hause` | Hause | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |
| `knott` | Knott | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0.5 | 0 | 0 | 0 |
| `tor` | Tor | 3 | 3 | 0 | 0 | 0 | 0.3 | 1 | 0.3 | 0 | 0 | 0 | 0 |
| `law` | Law | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 3 | 2 | 0 | 0 |
| `cwm` | Cwm | 0 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| `combe` | Combe, ‹fused›combe | 1.5 | 3 | 1 | 0 | 0.5 | 0.3 | 0 | 0 | 0 | 0 | 0 | 0 |
| `clough` | Clough | 0 | 0 | 0 | 0 | 0.5 | 0 | 2 | 2.5 | 0 | 0 | 0 | 0 |
| `edge` | Edge | 0.5 | 0.5 | 0.5 | 0.5 | 1.5 | 0.5 | 2.5 | 1.5 | 0.5 | 0.5 | 0.5 | 0.5 |
| `scar` | Scar | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 2.5 | 0.5 | 0 | 0 | 0 |
| `linn` | Linn | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1.5 | 2.5 | 1 | 0 |
| `burn` | Burn, ‹fused›burn | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 3 | 3 | 2 | 1 |
| `crag` | Crag | 0.5 | 0.5 | 0.3 | 0.3 | 0.5 | 1 | 1 | 2 | 1.5 | 1 | 1 | 0.3 |
| `dale` | ‹fused›dale | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 2 | 3 | 1 | 0.2 | 0.2 | 0.2 |
| `mount` | Mount | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 |
| `oldMan` | The Old Man of | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 2 | 0.3 | 0.3 | 1.5 | 2 |
| `pot` | Pot | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 3 | 0 | 0 | 0 | 0 |
| `shieling` | Shieling | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1.5 | 2 | 2 | 3 | 1 |
| `hope` | Hope | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 2 | 2.5 | 0 | 0 | 0 |
| `tarn` | Tarn | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 1 | 0 | 0 | 0 |
| `loch` | Loch | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 2 | 3 | 1 |
| `lochan` | Lochan | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.3 | 1.5 | 3 | 1 |
| `mere` | Mere, Mere of the …, ‹fused›mere | 0 | 0.5 | 0.5 | 2 | 3 | 0.2 | 1 | 2 | 0.2 | 0.2 | 0.2 | 0.2 |
| `broad` | Broad, Staithe | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `lakeLake` | Lake | 0.3 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.3 | 0.1 | 0.1 | 0.1 |
| `lakeWater` | ‹fused›water | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 3 | 1 | 0.2 | 0.2 | 0.2 |
| `saltings` | Saltings | 0 | 0.5 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `moor` | Moor, ‹fused›moor | 2 | 2.5 | 0.3 | 0.2 | 1 | 1 | 1.5 | 2.5 | 1.5 | 1 | 0.5 | 0.5 |
| `muir` | Muir | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1.5 | 2.5 | 1 | 0 |
| `rigg` | Rigg | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2.5 | 1 | 0 | 0 | 0 |
| `howe` | Howe | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2.5 | 0 | 0 | 0 | 0 |
| `cleave` | Cleave | 1 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `moss` | Moss | 0 | 0 | 0 | 0 | 0.5 | 0 | 1 | 2.5 | 2 | 2 | 1 | 1 |
| `flow` | Flow | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 3 | 2 |
| `heath` | Heath | 0.3 | 1.5 | 3 | 2.5 | 1 | 0.3 | 1 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 |
| `common` | Common | 1 | 1.5 | 2 | 1.5 | 1.5 | 1 | 1 | 0.5 | 0.2 | 0.2 | 0.2 | 0.2 |
| `fen` | Fen, Fens, ‹fused›fen | 0.1 | 0.1 | 0.5 | 3 | 0.5 | 0.1 | 2 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 |
| `carr` | Carr | 0.2 | 0.2 | 0.2 | 2.5 | 0.2 | 0.2 | 1.5 | 2 | 0.2 | 0.2 | 0.2 | 0.2 |
| `levels` | Levels, Moor | 0 | 3 | 0.5 | 0 | 0 | 1.5 | 0 | 0 | 0 | 0 | 0 | 0 |
| `rhyne` | Rhyne | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `lode` | Lode | 0 | 0 | 0 | 3 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| `ings` | Ings | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 2.5 | 0 | 0 | 0 | 0 |
| `drain` | Drain, Dyke | 0.5 | 1 | 0.5 | 2 | 0.5 | 0.5 | 2 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 |
| `marsh` | Marsh | 0.5 | 1.5 | 2 | 1.5 | 1 | 1 | 1 | 1 | 0.5 | 0.5 | 0.3 | 0.3 |
| `holme` | Holme, ‹fused›holme | 0.3 | 0.3 | 0.3 | 1.5 | 0.3 | 0.3 | 2 | 2 | 0.3 | 0.3 | 0.3 | 0.3 |
| `eyot` | Eyot | 0.5 | 0.5 | 2 | 1.5 | 1 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 |
| `causeway` | Causeway | 1 | 1.5 | 1 | 3 | 1 | 2 | 1.5 | 1 | 1 | 1 | 1 | 1 |
| `down` | Down, Downs, Bottom, Hill, Ridgeway, Dyke, hill figures (*The White Horse*) | 0.3 | 2.5 | 3 | 0.3 | 0.5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `wold` | Wold, Wolds, ‹fused›wold | 0.2 | 0.2 | 0.2 | 1 | 1.5 | 0.2 | 3 | 2 | 0.2 | 0.2 | 0.2 | 0.2 |
| `strath` | Strath | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 2 | 3 | 1 |
| `haugh` | Haugh | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 3 | 2 | 0 | 0 |
| `carse` | Carse | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0.5 | 0 |
| `bourne` | Bourne, ‹fused›bourne | 0.2 | 2.5 | 3 | 1 | 1 | 0.2 | 0.5 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 |
| `drove` | Drove | 1 | 1 | 0.5 | 0.5 | 1.5 | 3 | 1 | 2 | 3 | 2 | 3 | 2 |
| `hanger` | Hanger | 0 | 1 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `hurst` | ‹fused›hurst | 0.2 | 1 | 3 | 0.5 | 0.5 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 |
| `den` | Den, ‹fused›den | 0.2 | 0.2 | 3 | 0.3 | 0.2 | 0.2 | 0.2 | 1.5 | 0.2 | 0.2 | 0.2 | 0.2 |
| `holt` | Holt, ‹fused›holt | 0.3 | 0.3 | 1 | 3 | 0.3 | 0.3 | 1 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 |
| `slade` | Slade | 0.3 | 1 | 1 | 0.3 | 2 | 0.3 | 2 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 |
| `frith` | Frith | 0.2 | 0.2 | 1 | 0.2 | 2.5 | 1 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 |
| `walk` | Bailiwick, Inclosure, Lawn, Walk | 0.3 | 1 | 3 | 0.3 | 1.5 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 |
| `shaw` | Shaw | 0.5 | 0.5 | 2 | 0.5 | 0.5 | 0.5 | 1 | 1.5 | 0.5 | 0.5 | 0.5 | 0.5 |
| `spinney` | Spinney | 0.3 | 0.3 | 1 | 1.5 | 1.5 | 0.3 | 2.5 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 |
| `weald` | Weald | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `chase` | Chase | 0.5 | 0.5 | 1 | 0.5 | 2 | 0.5 | 1.5 | 1 | 0.5 | 0.5 | 0.5 | 0.5 |

- **Home-British shapes:** a shape that carries a region tag is weighted by its region only for British cultures in home country. For every other case it is ×1, so other cultures can still draw *Raven Crag* or *Black Tarn*.
- **Reused from seas and coasts:** `tarn`, `loch`, `mere`, `broad`, `lakeLake`, `lakeWater` and `saltings` repeat SC's values. Read them from `wilds.json`, not from `waters.json`, so the two can drift apart safely.

### 3.4 Biomes

**Offered biomes and defaults** (`wilds.json` → `modules[m].biomes` and `defaultBiome`):

| Module | Biomes offered | Default |
|---|---|---|
| mountains | all 12 | highland |
| forests and woods | all but desert | temperate |
| deserts | desert, steppe, highland, savannah, mediterranean | desert |
| moors and heaths | moorland, temperate, boreal, highland, cool-rainforest | moorland |
| wetlands | all but desert | temperate |
| grasslands | temperate, steppe, savannah, mediterranean, highland, monsoon | steppe |

**The resolved biome.** Every name works from one biome, found in this order:

1. **British cultures in home country** (not deserts): the **Britain** biome. Region tags apply and biome tags don't.
2. **A biome chosen** in the sentence: that biome.
3. **Any land:** the culture's homeland biome (`wilds.json` → `homeland`), if the module offers it. Otherwise the module's default.

The resolved biome supplies the biome half of `{beast}`, `{tree}` and `{stock}` (§4). For every case except rule 1, it also sets the **biome tags**.

**Biome tags.** `wilds.json` → `biomeTags`. They multiply shapes **and pool entries** carrying the tag (`bt`). Untagged items are ×1.

| Tag | tmp | moor | bor | crf | med | stp | des | sav | rf | mon | tri | hgh |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| `cold` | 0.5 | 1 | 3 | 1 | 0 | 0.3 | 0 | 0 | 0 | 0 | 0 | 2 |
| `hot` | 0 | 0 | 0 | 0 | 0.5 | 0 | 1.5 | 2 | 2 | 2 | 2 | 0 |
| `dry` | 0 | 0 | 0 | 0 | 1 | 2 | 4 | 1.5 | 0 | 0.3 | 0 | 0.5 |
| `alpine` | 0.5 | 0.3 | 1.5 | 1.5 | 0.5 | 0.5 | 0.5 | 0 | 0 | 0 | 0 | 3 |
| `volcanic` | 0.3 | 1 | 0.5 | 1.5 | 0.3 | 0 | 0.5 | 0.3 | 0.3 | 0.3 | 3 | 1.5 |
| `jungle` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.3 | 3 | 2 | 1.5 | 0 |
| `conifer` | 1 | 0.5 | 3 | 2 | 0.7 | 0.3 | 0 | 0 | 0 | 0.3 | 0 | 1.5 |
| `broadleaf` | 3 | 0.3 | 0.5 | 1 | 1 | 0.3 | 0 | 0.3 | 0.3 | 0.5 | 0.3 | 0.3 |
| `grass` | 1 | 0.5 | 0.3 | 0.3 | 0.7 | 3 | 0.3 | 3 | 0.1 | 0.7 | 0.3 | 1 |
| `steppe` | 0.3 | 0 | 0.3 | 0 | 0.3 | 4 | 0.5 | 0 | 0 | 0 | 0 | 0.5 |
| `sand` | 0.2 | 0 | 0 | 0 | 0.7 | 1 | 4 | 0.7 | 0 | 0.3 | 1 | 0.3 |
| `salt` | 0.2 | 0.2 | 0.2 | 0 | 1 | 3 | 3 | 1 | 0 | 0.2 | 0.2 | 2 |
| `peat` | 1 | 3 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `swamp` | 0.7 | 0.2 | 0.5 | 0.5 | 0.3 | 0.3 | 0 | 1.5 | 3 | 3 | 2 | 0.3 |
| `mangrove` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 2 | 3 | 3 | 0 |
| `heathland` | 2 | 2 | 0.5 | 0.2 | 1 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 |

Example: in mountains with Norse and any land, the resolved biome is boreal. *Ptarmigan Crag* is ×3 there, while *Snow Leopard Pass* is ×1.5 (alpine).

### 3.5 Kind multipliers

`wilds.json` → `kindMult`. Apply them to the kind weights when the kind is Any:

- **British cultures in home country:**
  - mountains `ice`: ×0
  - wetlands `swamp`: ×0.2
  - wetlands `delta`: ×0.5
  - grasslands `plain`: ×0.5
- **Every other case:** the kind is multiplied by the resolved biome's value for that tag:
  - mountains `ice`: `alpine`
  - wetlands `swamp`: `swamp`
  - deserts `dune`: `sand`
  - grasslands `heath`: `heathland`

### 3.6 Culture family multipliers

`wilds.json` → `cultureMult`. Every shape has a **family** (`f`) and may be an **of-shape** (`of: true`, the "‹generic› of ‹x›" order). Blank means ×1.

| Culture | of | dir | col | ppl | per | god | crt | flora | shp | sai | unc | work |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| general |  |  |  |  |  |  |  |  |  |  |  |  |
| anglo-saxon | 0.7 | 1.5 |  | 1.5 |  |  | 1.5 | 1.5 |  | 1.5 | 1.5 |  |
| norse | 0.5 | 2 | 1.5 |  |  | 1.5 | 1.5 |  |  |  | 2 |  |
| celtic | 2 |  |  |  | 1.5 |  | 1.5 | 1.5 |  | 2 | 2 |  |
| norman-british | 1.2 | 1.5 |  |  | 1.5 | 0 |  |  |  | 1.5 |  | 1.5 |
| roman | 2.5 | 1.5 | 0.7 | 3 |  |  | 0.5 |  | 0.5 |  |  |  |
| greek-byzantine | 2 |  |  | 1.5 | 3 | 2 | 0.7 |  |  |  |  |  |
| slavic |  |  | 2 | 2 |  | 0 |  | 1.5 |  |  |  |  |
| steppe | 0.7 |  | 3 |  | 0.5 | 0 | 1.5 |  |  |  |  |  |
| arabic-persian | 3 |  | 1.5 | 3 |  | 0 |  |  |  |  |  |  |
| indian | 1.5 |  |  |  | 2 |  |  | 1.5 |  |  |  |  |
| chinese | 0.3 | 3 | 2 | 0.5 | 0.5 | 0.5 | 1.5 |  | 2 |  |  |  |
| japanese | 0.5 | 2 | 1.5 | 0.5 | 0.5 | 0.5 |  | 2 | 3 |  |  |  |
| korean | 0.3 | 4 | 1.5 | 0.5 | 0.5 | 0.5 |  |  |  |  |  |  |
| egyptian |  |  | 2 | 0.5 | 0.5 | 3 |  |  |  |  |  |  |
| ethiopian | 1.5 |  | 2 |  |  |  |  |  |  | 1.5 |  |  |
| bantu | 1.5 |  |  |  |  | 1.5 | 2 |  |  |  |  |  |
| west-african |  |  |  |  |  |  | 1.5 | 1.5 |  |  |  |  |
| aztec |  |  | 1.5 |  | 0.5 | 3 | 1.5 |  |  |  |  |  |
| maya |  |  | 1.5 |  | 0.5 | 3 | 1.5 |  |  |  |  |  |
| polynesian | 2 |  |  |  | 1.5 | 0 | 1.5 |  |  |  |  |  |
| andean |  |  |  |  | 0.5 | 0 |  |  |  |  |  |  |

- **Other families:** `qual`, `twn`, `mood`, `myth`, `alien`, `riv`, `set` and `fixed` are ×1 for every culture.
- **`sai` shapes** need a christian culture.
- **`god` shapes** need a `{god}` source (§4). Without one they are weight 0.
- **`cx` multipliers:** a shape's `cx` multiplies its weight for the named culture only. For example, *The Empty Quarter* shape is ×3 for Arabic & Persian.

### 3.7 Era multipliers

`wilds.json` → `eraMult`:

| Family | AN | MD | EM | ST | MO | NF | IS |
|---|--:|--:|--:|--:|--:|--:|--:|
| `mood` | 0.2 | 0.5 | 2 | 1.5 | 0.5 | 1 | 1 |
| `per` | 0.5 | 0.7 | 1.5 | 2 | 1.5 | 1 | 1 |
| `work` | 0.5 | 1 | 1.5 | 2 | 1.5 | 1 | 1 |
| `alien` | 0 | 0 | 0 | 0 | 0 | 6 | 6 |

The `alien` shapes name the land of other worlds (*Mountains of Tranquillity*, *Plain of Dreams*). They only ever appear in near future and interstellar.

---

## 4. Sources

These tokens are filled from a source rather than a pool. Everything else in braces is a pool in `settlement-vocab.json`.

| Token | Source |
|---|---|
| `{town}`, `{folk}`, `{person}`, `{kingdom}`, `{holy}`, `{god}`, `{river}`, `{number}` | As SC §4 and RN §4.2, with the same placeholders and invented sources. `{river}` uses `riverFill`: a British region in home country uses the British setting with that region, any other home country uses `established`, and new country uses `new-land`. |
| `{beast}` | 60%: the module's creature pool (`wilds.json` → `beastPools`: `mtBeast`, `fstBeast`, `dsrBeast`, `mrBeast`, `wetBeast`, `grsBeast`), with its biome tags. 40%: the resolved biome's wild animals (60) or birds (40), title case. |
| `{tree}` | 50%: `wildTree`, with its biome tags. 50%: the resolved biome's trees, title case. |
| `{stock}` | The resolved biome's livestock, title case. |
| `{@kind}` | A feature name drawn from another kind of the **same module** (§9.3). |
| `{x:pl}` | The entry's `pl`, else `pluralOf` with `irregularPlurals` |
| `{x:poss}` | As RN |

- **Biome words:** for Britain, `{beast}`, `{tree}` and `{stock}` read the built-in `name-words.json` lists through `biomeEntries` (LB §2.6), taking the modern form.
- **Shared stream:** each source's 60/40 or 50/50 split is drawn on the batch stream.


### 4.1 Town stems (added 19 October 2026)

In wild lands, `{town}` is a **stem**: a short name that reads well in front of a generic (*Oxdale Pike*, *Wide Bridge Pass*) or after one (*Lake Gosport*, *Fort Redstone*). It is never a whole translated place name. Full names such as *Badger Edge*, *Cattle Market*, *Forum of Flavius* or *Peacock City* gave results like *Island of the Abbot Gorge* and *Lake Lower Ridge*.

This applies to wild lands only. Route names, seas and coasts and every other module keep `routePlace` as now.

**The pool.** Build one pool per stem source, plus the region for British sources, and cache it:

- Call `generateSettlementNames` with:
  - setting native
  - culture `townSource(culture)`
  - size village
  - count 2000
  - seed 1789
  - the region for British sources
  - `wilds: false`
- Keep a **one-word name** if all of these are true:
  - it has 10 letters or fewer
  - it has no apostrophe
  - it isn't a stop word (below), or a stop word plus *s*
  - it doesn't end in *village*, *hamlet*, *homestead*, *headland* or *pasture*
  - it isn't *Moot*, *Bath* or *Isthmus*, or one of those plus *s*
- Keep a **two-word name** only for non-British sources, and only if all of these are true:
  - both words are capitalised
  - it has no apostrophe
  - it doesn't begin with *The*
  - its second word isn't a stop word
- Never keep a name of three words or more.
- **Duplicates:** remove them, so each stem appears once.
- **Weights:** one-word names ×3, two-word names ×1.

**Stop words: feature generics.** Hill, Hills, Ridge, Edge, Island, Isle, Isles, Marsh, Marshes, Fen, Fens, Moor, Moors, Lake, Mere, Pool, Pond, Water, Waters, River, Brook, Beck, Burn, Dale, Valley, Vale, Wood, Woods, Forest, Heath, Down, Downs, Pass, Gap, Bank, Bay, Shore, Cape, Point, Head, Ness, Cliff, Cliffs, Crag, Rock, Rocks, Stone, Stones, Holm, Spring, Springs, Well, Wells, Mound, Knoll, Slope, Spur, Top, Moss, Mount, Mountain, Mountains, Peak, Glen, Combe, Fell, Tor, Gorge, Field, Fields, Meadow, Meadows, Plain, Plains, Common, Wash, Creek, Sands, Dune, Dunes, Oasis, Grove, Copse, Clearing, Glade, Lawn, Hollow, Cove, Sound, Bottom, Bottoms, Barrow, Cave, Caves, Fjord, Waterfall, Falls, Paddy, Mouth, Source.

**Stop words: habitation generics.** Village, Town, City, Market, Manor, Farm, Cottages, Cottage, Enclosure, County, District, Prefecture, Fort, Fortress, Camp, Homestead, Estate, Court, Hall, House, Houses, Temple, Church, Chapel, Minster, Abbey, Priory, Castle, Palace, Mansion, Seat, Station, Post, Harbour, Port, Haven, Landing.

**Thin pools.** If a pool keeps fewer than 20 names, add the resolved biome's one-word wild animals and trees, title case, at weight 1 each (*Jackal Pass*, *Cedar Mountains*). For those cultures, `twn` shapes are also ×0.5, so they don't crowd out the `crt` shapes. On the current data, these cultures fall below 20:

- Roman
- Egyptian
- Aztec
- Bantu
- Arabic & Persian
- Indian
- Ethiopian
- Chinese
- Slavic
- West African

British, Norse, Japanese, Korean and Maya kept 40 or more. At count 2000, all of Britain gives about 107 stems. A count of 600 gave only 36, and the larger count doesn't change which cultures are thin.

**No stem source.** Greek & Byzantine, steppe, Polynesian and Andean have no stem source. They keep their current `routePlace` draw, filtered by the same rules. A draw that fails goes to the biome fallback.

**Clash guard.** Reject a stem whose last word, or whose fused ending, repeats the shape's generic: *Oxdale Dale*, *Redstone Stone*, *Falcon Ford Ford*. Redraw up to 10 times, then use the biome fallback.

**Unchanged:**

- **Placeholders:** placeholders mode still gives `[place]`.
- **Series:** the anchor is drawn from this pool.
- **Shared stream:** draws use the batch stream; the pools are fixed-seed and cached.
- **Settlements:** the native settlement branch (§9.4) and settlement names' own output are unchanged. They produce whole names and never use `{town}`.

---

## 5. Pools

The 51 new pools are in `wilds-pools.json`, in the usual entry format (RN §3.1, plus `bt` from SC). Merge them into `settlement-vocab.json` unchanged and add a row for each to `docs/vocabulary-pools.md`.

**Existing pools the shapes read:** `direction`, `directionAdj`, `explorerMood`, `folkUncanny`, `devilFeature`, `gateWord`, `lakeQuality`, `lakeCreature`, `lakeFuse`, `lakeShape`, `stackGroup`, `fordBeast` and `mariaWord`. **Don't change them.**

**New pools by role:**

| Role | Pools |
|---|---|
| Shared | `wildColour`, `wildQuality`, `wildFuse`, `wildWeather`, `wildShape`, `wildMetal`, `wildTree`, `moodOf`, `mythBeast`, `mythFuse`, `treeFunc`, `leapWho`, `drainFeet` |
| Mountains | `mtBeast`, `mtWork`, `mtRiverWord`, `mtRiverAdj`, `rangeBody`, `iceWord` |
| Forests | `fstBeast`, `fstQuality`, `fstNoun`, `fstOwner`, `fstWork`, `fstKeeper`, `fstFlora`, `fstFestival`, `fstSprite`, `fstRiverWord`, `fstPond` |
| Deserts | `dsrBeast`, `dsrQuality`, `dsrStuff`, `dsrStone`, `dsrOasisWord`, `dsrGoods`, `dsrDays`, `dsrWork` |
| Moors | `mrBeast`, `mrQuality`, `mrFlora`, `mrWork` |
| Wetlands | `wetBeast`, `wetQuality`, `wetNoun`, `wetFlora`, `wetWork` |
| Grasslands | `grsBeast`, `grsQuality`, `grsFlora`, `grsWork` |

- **`moodOf`** is `explorerMood` without the words that can't follow "of" (Turnagain, Foulweather, Repulse, Doubtful). The data already uses it in every "‹x› of ‹mood›" shape.
- **`mythBeast` and `mythFuse`** entries are `h: true`, so they appear only with the fantastic switch on.

---

## 6. Kinds

Kind weights with kind Any, before §3.5. A kind is **live** in an era if at least one of its shapes is. With kind Any, kinds with no live shapes are left out. With a kind chosen, the kind menu lists only live kinds (§2.3).

The only kind that isn't live in every era is forests' `walk` (medieval to modern).

### 6.1 mountains (`mountainNames`)

| Key | Menu | Plural | Weight |
|---|---|---|--:|
| `range` | Ranges and massifs | ranges and massifs | 16 |
| `peak` | Peaks and summits | peaks and summits | 22 |
| `ridge` | Ridges, edges and crags | ridges, edges and crags | 12 |
| `pass` | Passes and cols | passes and cols | 12 |
| `gorge` | Gorges and ravines | gorges and ravines | 7 |
| `valley` | Valleys, glens and corries | valleys, glens and corries | 10 |
| `stream` | Streams and falls | streams and falls | 8 |
| `river` | Mountain rivers | mountain rivers | 4 |
| `tarn` | Tarns and lakes | tarns and lakes | 6 |
| `ice` | Glaciers and snowfields | glaciers and snowfields | 3 |
| `cave` | Caves and mines | caves and mines | 4 |
| `settlement` | Mountain settlements | mountain settlements | 6 |

### 6.2 forests and woods (`forestNames`)

| Key | Menu | Plural | Weight |
|---|---|---|--:|
| `forest` | Forests and woods | forests and woods | 22 |
| `grove` | Groves, copses and thickets | groves, copses and thickets | 14 |
| `clearing` | Clearings, glades and dells | clearings, glades and dells | 12 |
| `ride` | Rides, paths and forest roads | rides, paths and forest roads | 10 |
| `stream` | Streams and springs | streams and springs | 9 |
| `river` | Forest rivers | forest rivers | 4 |
| `pool` | Pools, ponds and lakes | pools, ponds and lakes | 7 |
| `tree` | Named trees and stones | named trees and stones | 8 |
| `walk` | Walks, parks and coverts | walks, parks and coverts | 6 |
| `settlement` | Forest settlements | forest settlements | 8 |

### 6.3 deserts (`desertNames`)

| Key | Menu | Plural | Weight |
|---|---|---|--:|
| `desert` | Deserts and sand seas | deserts and sand seas | 18 |
| `dune` | Dunes and sandhills | dunes and sandhills | 10 |
| `plain` | Stony plains and salt flats | stony plains and salt flats | 12 |
| `rock` | Mesas, buttes and rocks | mesas, buttes and rocks | 10 |
| `canyon` | Canyons and wadis | canyons and wadis | 12 |
| `oasis` | Oases, wells and springs | oases, wells and springs | 14 |
| `lake` | Salt lakes and dry lakes | salt lakes and dry lakes | 6 |
| `route` | Tracks and caravan roads | tracks and caravan roads | 8 |
| `landmark` | Landmarks and lost places | landmarks and lost places | 5 |
| `settlement` | Desert settlements | desert settlements | 10 |

### 6.4 moors and heaths (`moorNames`)

| Key | Menu | Plural | Weight |
|---|---|---|--:|
| `moor` | Moors and fells | moors and fells | 20 |
| `hill` | Tors, riggs and hills | tors, riggs and hills | 14 |
| `bog` | Mosses, mires and flows | mosses, mires and flows | 10 |
| `clough` | Cloughs, combes and hopes | cloughs, combes and hopes | 8 |
| `stream` | Becks, gills and burns | becks, gills and burns | 10 |
| `pool` | Tarns and pools | tarns and pools | 6 |
| `stone` | Stones, cairns and crosses | stones, cairns and crosses | 10 |
| `track` | Tracks and ways | tracks and ways | 8 |
| `settlement` | Moorland settlements | moorland settlements | 8 |

### 6.5 wetlands (`wetlandNames`)

| Key | Menu | Plural | Weight |
|---|---|---|--:|
| `marsh` | Marshes and fens | marshes and fens | 20 |
| `bog` | Bogs and mires | bogs and mires | 10 |
| `swamp` | Swamps and backwaters | swamps and backwaters | 10 |
| `reed` | Reedbeds and carrs | reedbeds and carrs | 8 |
| `water` | Meres, broads and pools | meres, broads and pools | 10 |
| `channel` | Creeks, lodes and drains | creeks, lodes and drains | 10 |
| `isle` | Islands and holmes | islands and holmes | 8 |
| `causeway` | Causeways and crossings | causeways and crossings | 6 |
| `delta` | Deltas and saltmarshes | deltas and saltmarshes | 6 |
| `settlement` | Wetland settlements | wetland settlements | 8 |

### 6.6 grasslands (`grasslandNames`)

| Key | Menu | Plural | Weight |
|---|---|---|--:|
| `plain` | Plains, steppes and prairies | plains, steppes and prairies | 20 |
| `down` | Downs and wolds | downs and wolds | 14 |
| `meadow` | Meadows, leas and pastures | meadows, leas and pastures | 14 |
| `heath` | Heaths and commons | heaths and commons | 8 |
| `vale` | Vales and straths | vales and straths | 10 |
| `stream` | Streams and waterholes | streams and waterholes | 8 |
| `lake` | Lakes and ponds | lakes and ponds | 5 |
| `track` | Droves, trails and tracks | droves, trails and tracks | 8 |
| `landmark` | Mounds, barrows and lone trees | mounds, barrows and lone trees | 7 |
| `settlement` | Grassland settlements | grassland settlements | 8 |

---

## 7. Pipeline and rendering

```
module → kind (chosen, or §6 × §3.5)
    ↓
shape   (the kind's shapes in wilds.json + culture shapes §11; filtered by era, culture, fantastic;
         × family and of (§3.6) × cx × where (§3.2) and nx × era (§3.7) × region (§3.3) or biome (§3.4) × tone factor)
    ↓
tokens  (pools with their own tags; sources §4; series anchor §12)
    ↓
rendering (below) → safeguards (§13)
```

- **Fantastic:** `h: true` shapes and words appear only with the switch on, and `h: false` only with it off. In the steam age the switch reads steampunk and adds nothing new here.
- **Folk-supernatural shapes** (`unc`: *Devil's Kitchen*, *Giant's Grave*, *Fairy Ring*) are realistic and need no switch.
- **Zero weights:** a shape whose weight comes to 0 is skipped. If a kind has no live shapes, redraw the kind. If no kind is live, fall back to the module's untagged shapes.
- **Fusion:** a pattern written `{x}dale`, `{x}hurst`, `{x}water` and so on joins with no space and lower-cases the generic (*Ravendale*, *Oakhurst*, *Greywater*). Fusion only ever takes `wildFuse`, `lakeFuse` or `mythFuse`.
- **"The":** shapes beginning *The* keep it capitalised. `{@kind}` drops a leading *The* (§9.3).
- **Repeats:** reject a name that repeats a content word (*Raven Raven Crag*), using `repeatsContent`.
- **Colour rule:** GN §12.4 applies to the final name.
- **Failure, batches, uniqueness:** as GN §4. Cap: 6 words.

---

## 8. Shapes

The shapes are in `wilds.json` → `shapes[module][kind]`, in SC's `WatersShape` format:

| Key | Meaning |
|---|---|
| `p` | the pattern |
| `w` | the weight |
| `f` | the family |
| `of` | an of-shape |
| `e` | eras |
| `c` | cultures (keys, `british`, `christian`) |
| `rt` | region tag |
| `bt` | biome tag |
| `t` | tones |
| `h` | fantastic only (`true`) or realistic only (`false`) |
| `cx` | culture multipliers |
| `nx` | new-country multiplier |

Two keys are new:

| Key | Meaning |
|---|---|
| `sz` | Settlement kind only: the sizes the settlement suits, as letters from `h v t c g` (hamlet, village, town, city, great city), matching the urban brief. |
| `st` | A feature shape that also works as a settlement name, with its sizes: *Deepdale*, *Oakhurst*, *Swinfen*, *Hartley*, *Glen Ashby*, *Two Wells*. See §9.2. |

**What each module sounds like** (sampled from the data, medieval, with placeholder towns):

| Module | Examples |
|---|---|
| mountains | *The Black Mountains*, *Raven Crag*, *Wenlow Pike*, *Pass of the Eagles*, *Kettledale*, *Grey Force*, *Roaring Water*, *Falcon Tarn*, *The Frozen Tongue*, *Giant's Bellows*, *Ashby Gap Hospice* |
| forests and woods | *The Dark Wood*, *Kelmscott Chase*, *Oakhurst*, *Bluebell Hanger*, *Midsummer Glade*, *Charcoal Burners' Track*, *Swinbourne*, *River Shade*, *Hammer Pond*, *The Gospel Oak*, *Fox Covert*, *Keeper's Lodge* |
| deserts | *The Empty Desert*, *Sea of Sand*, *The Singing Dunes*, *Stanmore Salt Pan*, *Red Mesa*, *Hartley Canyon*, *Palm Oasis*, *Lake Disappointment*, *Twenty Days' Road*, *The Buried City*, *Lone Well Fort* |
| moors and heaths | *Grouse Moor*, *Blackmoor*, *Muir of Hartley*, *Lapwing Tor*, *Wenlow Flow*, *Merlin Clough*, *Yellow Burn*, *Buttermere*, *The Nine Maidens*, *Peat Cutters' Road*, *Ashby Moor Gate* |
| wetlands | *Bittern Marsh*, *Swinfen*, *Ashby Slough*, *Cypress Swamp*, *Alder Carr*, *Stanmore Broad*, *Forty Foot Drain*, *Hartholme*, *Bishop's Causeway*, *Thursby Saltings*, *Eelers' Huts* |
| grasslands | *The Wide Plains*, *Hartley Down*, *The Western Wolds*, *Cowslip Meadow*, *Elderley*, *Vale of the Black Horse*, *Kelmscott Bourne*, *Dew Pond*, *Cattle Drove*, *The Wishing Stone*, *Hill Folk Camp* |

---

## 9. Settlements in the terrain modules

### 9.1 The 60/40 split

Each module's `settlement` kind draws each name in one of two ways. The 0.6 draw is made on the batch stream, before anything else for that name.

- **60% purpose-built** (`settlementLink.purposeBuiltShare`): a shape from §9.2.
- **40% native:** a name from the urban group's settlement names module with the terrain locked (§9.4).

If the native branch isn't available (§9.4), the name is purpose-built.

### 9.2 Purpose-built candidates

The candidates are:

- **The settlement kind's own shapes,** at their weights. These are places that exist because of the terrain: pass forts, hospices, shielings, mining camps, hunting lodges, charcoal camps, decoys, stations, caravanserais, and holds and halls with the fantastic switch on.
- **Every shape in the module carrying `st`,** at **half** its weight. These are feature names that are also village names: *Deepdale*, *Glen Ashby*, *Oakhurst*, *Ashden*, *Swinfen*, *Hartley*, *Two Wells*.

In the terrain modules there's no size filter: `sz` and `st` are only read by settlement names (§10).

### 9.3 Feature references: `{@kind}`

Many settlement shapes name the settlement after a feature drawn from its own module: *{@pass} Fort* gives *Wolf Pass Fort*, *{@valley} Head* gives *Deepdale Head*, and *{@forest} Lodge* gives *Oak Wood Lodge*. This is how settlements carry the terrain in their names.

- **Same settings:** the reference is drawn with the same options (culture, era, where, region, biome, fantastic, tone, people), on the same stream.
- **Left out of the draw:**
  - of-shapes
  - shapes beginning *The*
  - shapes containing `{river}`
  - settlement shapes
- **Length:** the result must be at most two words. Try up to 10 times, then treat the settlement shape as dead and redraw the shape.
- **Series:** the reference takes the series anchor like any other `{town}` (§12), so a series gives *Hartfell Pass* and then *Hartfell Pass Fort*.

### 9.4 The native branch

The native branch calls `generateSettlementNames` (urban brief §6.3) with:

| Input | Value |
|---|---|
| Size | settlement (any size) |
| Culture | **Home country:** British cultures and general → **native, British**, with the region. A culture with a world place-names entry → **native, that world culture**, at the first world era whose route era (`settlementLink.worldEraToRoute`) equals the module's era, else the culture's first era. **New country:** the colonial tradition in `settlementLink.cultureToColonial`, with **in new lands**. |
| Land | `settlementLink.nativeLand[module]`: the terrain, plus a biome when the sentence's biome is any land (moors: moorland; deserts: desert). Otherwise the chosen biome. |
| Wild lands | **off** (`wilds: false`), so settlement names never calls back into this module (§10.4) |

The native branch isn't available, so the name is purpose-built, in these cases:

- **Cultures:** greek-byzantine, steppe, polynesian and andean in home country.
- **Traditions:** cultures with no colonial tradition in new country.
- **Eras:** near future and interstellar.
- **People:** placeholders mode. A native name would be a finished name in a batch meant to show placeholders (*[place] Pass Fort*), so the branch is skipped.

**Batch efficiency.** Call `generateSettlementNames` **once per batch**, the first time the branch is needed. Take its seed from the batch stream at that moment, ask for as many names as the batch count, and hand them out in order. If they run out, the name is purpose-built.

---

## 10. Settlement names: the wild-lands branch

### 10.1 When it applies

Settlement names already has a terrain: the British native sentence's "set in ‹terrain› of ‹biome›", the world cultures' Land button, and the colonial sentences' terrain link (LB §4.2, §6). This brief adds no new link. When that terrain is one of the five below, settlement names draws **60%** of its names from the matching wild-lands module and **40%** from its own engines as now (`settlementLink.terrainToModule`):

| Terrain | Module | Exceptions by biome |
|---|---|---|
| mountains | mountains | – |
| forest | forests and woods | – |
| wetland | wetlands | – |
| plains | grasslands | desert → deserts; moorland → moors and heaths |
| hills | grasslands | desert → deserts; moorland, boreal, highland → moors and heaths; Britain and temperate → moors and heaths 50, grasslands 50, drawn per name |

Any terrain, coasts, rivers and lakes, islands and custom terrains don't use the branch: output is unchanged, seed for seed.

### 10.2 What it asks the terrain module for

| Input | Value |
|---|---|
| Kind | `settlement`, **purpose-built only** (no native branch) |
| Size | the settlement names size: only shapes whose `sz` (settlement shapes) or `st` (dual-use shapes) contain the size's letter. Settlement (any size) takes every candidate. |
| Culture and era | **Native, British:** `norman-british`, medieval, home, with the region. **Native, world culture:** that culture, its era mapped by `settlementLink.worldEraToRoute` (interstellar → IS), home. **In new lands / in settled lands:** `settlementLink.colonialToCulture[tradition]`, new country. |
| Biome | the settlement names biome, if it's one the module offers; otherwise any land (resolved as §3.4) |
| People | invented |
| Fantastic, tone, series | realistic, any, separate |

### 10.3 The split

- The 0.6 draw is per name, on the settlement names batch stream, before the name is drawn.
- **Terrain module call:** call `generateWildsNames` **once per batch**, the first time the branch is needed, with its seed taken from the stream at that moment and the batch count as its count.
- **Running out:** a name with no purpose-built candidate at the size (every great city, for example) quietly takes the normal path. So does a call that returns too few names. There's no notice.
- **Uniqueness:** the batch stays unique across both branches.

### 10.4 No loops

- Settlement names gains an option `wilds?: boolean` (default `true`). The terrain modules' native branch passes `false`.
- `generateWildsNames` gains `purposeBuiltOnly?: boolean`. Settlement names passes `true`.

Neither path can call the other twice.

### 10.5 What changes

- **Settlement names, one of the five terrains:** output changes. This is intended.
- **Settlement names, any other terrain:** identical, seed for seed.
- **Native place names, exploration, expansion and the settlement kit:** identical, seed for seed. The kit passes no terrain.
- **History labels:** unchanged. They already carry the terrain (LB §6.4).

---

## 11. Culture shapes

`wilds.json` → `cultureShapes`. These are added to the named module and kind at the given weight, as SC §11. All are family `fixed`, so ×1 for every culture.

Examples:

| Culture | Shape |
|---|---|
| Norse | *Giants' Home*, *Troll Wall* |
| Aztec | *Smoking Mountain*, *White Woman*, *Place of Reeds* |
| Indian | *Abode of Snow* |
| Chinese | *Mountain of the White Dragon*, *Sea of Death*, *‹town› Bamboo Forest* |
| Egyptian | *Red Land*, *Field of Reeds* |
| West African | *Sacred Forest of ‹town›* |
| Slavic | *Wild Field* |
| Andean | *High Plain* |

- **No live token:** a culture shape whose token has nothing to offer (no `{god}` source) is weight 0.
- **Polynesian and Andean:** their culture shapes are plain descriptive names, with no deities and no light or grim tones (RN §12.4).

---

## 12. Series

With series on:

- **Anchor:** at the start of the batch, draw **one anchor**, a `{town}` value (`[place]` with placeholders).
- **First name:** with kind Any, the first name is the module's **parent kind**, drawn only from its `twn` shapes and holding the anchor. The parent kinds are: mountains `range`, forests `forest`, deserts `desert`, moors `moor`, wetlands `marsh` and grasslands `plain`. With a kind chosen, there's no parent name.
- **Later names:** a name's first `{town}` takes the anchor with probability **0.6**. Otherwise it draws freely. This includes the `{town}` inside a `{@kind}` reference.
- **Helpers:** reuse the series helpers route names and seas and coasts use.

So a set reads like one range: *The Hartfell Mountains*, *Hartfell Pike*, *Raven Crag*, *Hartfell Pass*, *Hartfell Pass Fort*.

---

## 13. Safeguards

Exact phrases, case-insensitive, checked on the whole name with and without a leading *The*. The lists are in `wilds.json` → `safeguards`.

- **mountains:**
  - **Franchise:** Misty Mountains, Lonely Mountain, Mount Doom, Mountains of Madness, Mountains of Shadow, Spine of the World, Throat of the World, Paths of the Dead, Weathertop, Gap of Rohan, Iron Hills, Grey Mountains.
  - **Holy mountains of living religions:** Mount Sinai, Mount Zion, Mount Moriah, Mount of Olives, Mount Hira, Mount Arafat, Mount Kailash, Mount Meru, Mount Ararat, Mount Olympus.
- **forests and woods:** Mirkwood, Fangorn, Lothlórien, Lothlorien, Forbidden Forest, Hundred Acre Wood, Chetwood, Old Forest Road, Wildwood, Elfwood.
- **deserts:** Dune Sea, Jundland Wastes, Deep Desert, Great Pit of Carkoon, Arrakis, Tatooine, Desert of Desolation.
- **moors and heaths:** Barrow-downs, Barrow Downs, Grimpen Mire, Wuthering Heights, Weather Hills, Midgewater.
- **wetlands:** Dead Marshes, Midgewater Marshes, Swamp of Sorrows, Swamps of Sadness, Fire Swamp, Bog of Eternal Stench, Dagobah.
- **grasslands:** Rohan, Riddermark, Pelennor Fields, Plains of Rohan, Dothraki Sea, Westfold, Eastfold.
- **Banned words** (whole words, every module): GN §12.3, plus *Squaw*, the slur once common in American place-name generics.

More rules:

- **Settlement safeguard packs:** packs (RN §12.6) apply to every module.
- **Living religions:** RN §12.3. `{god}` follows its sources, `{holy}` is christian cultures only, and sacred groves and holy mountains are always generic.
- **Sensitive cultures:** Polynesian and Andean follow RN §12.4, with no light or grim shapes or words and no fantastic shapes.
- **Redraws:** a blocked name is redrawn, as RN §12.

---

## 14. Presets and history

As RN §13 and SC §15:

- **Module keys:** `mountain-names`, `forest-names`, `desert-names`, `moor-names`, `wetland-names`, `grassland-names`.
- **Fields:** `culture`, `kind`, `era`, `where`, `fantastic`, `region`, `biome`, `tone`, `people` and `series`. A value outside its choices falls back to the default.
- **History:** as §1.3.

---

## 15. Milestones

Commit at the end of each, with `npm test` and `npm run build` passing.

1. **M1 – Group and engine.**
   - List the icons (§1.2) and wait for Kenny's SVGs.
   - Then add the sections, group, icons and switcher order.
   - Add `wilds.json` and merge the pools. Add `docs/vocabulary-pools.md` rows.
   - Build `src/wilds/engine.ts` with the pipeline (§7), the §3 tables and the §4 sources, plus `sentence.ts`.
   - Tests: §16.1.
2. **M2 – Mountains and forests:** both modules end to end, with `{@kind}` (§9.3) and the purpose-built settlements. Tests: §16.2.
3. **M3 – Deserts, moors and heaths, wetlands, grasslands.** Tests: §16.3.
4. **M4 – Series, safeguards, presets, history** (§12–§14). Tests: §16.4.
5. **M5 – Settlements both ways:**
   - The native branch in the terrain modules (§9.4).
   - The wild-lands branch in settlement names (§10), with `wilds` and `purposeBuiltOnly`.
   - Tests: §16.5.
6. **M6 – Docs** (§17). Rebuild `main.js` before the last commit, then push.

---

## 16. Tests

### 16.1 Data and engine (`tests/wildLands.test.ts`)

- **Data:**
  - Every token in every shape resolves to a source or a pool, and every `rt` and `bt` is a key of its table.
  - Every culture key exists, every `sz` and `st` uses only `h v t c g`, and every `{@kind}` names a non-settlement kind of its own module.
  - `sz` appears only on settlement shapes, and fusion only ever follows `wildFuse`, `lakeFuse` or `mythFuse`.
- **Pools:** every pool in `wilds-pools.json` is in `settlement-vocab.json`, and every existing pool is unchanged.
- **Regressions:** every existing fixture passes unchanged, including waters, routes, place, compound, recipe, ageing, tribal, group, biome, land and settlement.

### 16.2 Mountains and forests

**Mountains:**

- In NTH (British culture, home), 2,000 names include *Fell*, *Pike*, *Beck* and *Force*, and never *Cwm*, *Ben*, *Lochan* or *Linn*.
- In SHH they include *Ben*, *Corrie* and *Lochan*, and never *Tor*, *Fell* or *Hause*.
- In WAL they include *Cwm*. In WCY and COR they include *Tor* and *Combe*.
- British culture at home: no `ice` kind in 2,000 names.
- Biome highland, general culture: `ice` names make up at least 3% of 2,000 names.
- Biome rainforest: *Ptarmigan*, *Ibex*, *Chamois* and *Snow Leopard* never appear.

**Forests:**

- `walk` never appears in AN, NF or IS.
- In SEA, *Hanger* and *‹fused›hurst* appear in 2,000 names. In EAN, *Holt* and *Carr* appear. *Hanger* never appears in SHH.
- Biome boreal: *Teak*, *Mahogany*, *Tiger* and *Monkey* never appear.

**Both:**

- `{@kind}` results are at most two words, never begin *The* and never contain *of*.
- **Explorer's mood (all six modules):** new country, early modern, general culture, any land: explorer's-mood shapes make up at least 4% of 2,000 names in each module. Home country: under 1.5%.

### 16.3 Deserts, moors and heaths, wetlands, grasslands

- **Deserts:**
  - The region link never shows, and no region-tagged shape is weighted by region.
  - *Mesa*, *Butte* and *Canyon* never appear before ST.
  - *Wadi* only appears for its four cultures.
- **Moors and heaths:** in WCY, *Tor*, *Cleave* and *Combe* appear; in SHH, *Flow* appears; in NTH, *Rigg*, *Howe* and *Beck* appear. *Muir* never appears in COR.
- **Wetlands:**
  - In EAN, *Fen*, *Lode*, *Broad* and *Carr* appear; in WCY, *Rhyne* and *Levels* appear.
  - Biome monsoon: at least 10% swamps; biome boreal: no *Mangroves* or *Bayou*.
- **Grasslands:**
  - In SEA, *Down* and *Bourne* appear; in EMD, *Wold*; in SBL, *Haugh*; in SLO, *Carse*.
  - Biome steppe: *Steppe*, *Camp* or *Wild Horse* appear in 2,000 names.
  - Biome temperate: *Zebra*, *Baobab* and *Waterhole* never appear.
- **All:**
  - With fantastic off, no `h: true` shape or word appears in any era.
  - In IS, `alien` shapes make up at least 4% of 2,000 names in each module.
  - In AN to MO they never appear.

### 16.4 Series, safeguards, presets and history

- **Series:**
  - With series on and kind Any, the first name is the parent kind and holds the anchor.
  - Across 1,000 batches of 10, the share of later names holding the anchor is 0.6 ± 0.05 among names whose shape, including any `{@kind}` it drew, contains a `{town}`.
- **Safeguards:** no blocked phrase appears in 10,000 names per module across all settings.
- **Presets:** a preset round-trips for each module.
- **History:** labels match §1.3, and `historySection` routes all six.

### 16.5 Settlements (`tests/wildSettlements.test.ts`)

- **Terrain modules:**
  - In the `settlement` kind, the share of native-branch names is 0.4 ± 0.05 over 2,000 names (British, home, MD, invented people).
  - It is 0 in IS, for greek-byzantine at home, and in placeholders mode.
- **Settlement names:**
  - **Wild-lands share:** with terrain mountains, a British village batch draws 0.6 ± 0.05 of its names from mountains (tag each name's source in a test hook).
  - **Size:** every one of those names has a shape whose `sz` or `st` contains `v`.
  - **Great city:** gives no wild-lands names, with no notice.
- **Mapping:** plains with desert → deserts; hills with moorland → moors and heaths; hills with Britain → both modules over 2,000 names, each at 0.5 ± 0.05.
- **Unchanged:** settlement names with any terrain, coasts, rivers and lakes, or islands gives identical names for fixed seeds before and after M5. The settlement kit gives identical kits for fixed seeds.
- **No loops:** the native branch calls settlement names with `wilds: false`, and settlement names calls the terrain module with `purposeBuiltOnly: true` (spy on both).

---

## 17. Docs

- Add this brief to `docs/` as `wild-lands-brief.md`.
- `docs/vocabulary-pools.md`: a row for every new pool.
- `docs/land-brief.md` and the urban brief: a one-line dated note pointing to §10.
- **README:** a short **Wild lands** section listing the six modules in one line each, and a sentence on how settlement names uses them, in British English with OUP punctuation.

---

## 18. Parked

- **User biome packs** in these modules (custom terrains and words).
- **A terrain link in the settlement kit,** so a kit's town, roads and inns can sit in the mountains or a forest.
- **Coasts, rivers and lakes and islands** feeding settlement names through seas and coasts.
- **Gaelic, Welsh and other regional loanwords** (Bealach, Sgurr, Bwlch, Moel, Pen) as an opt-in.
- **"Great X / Little X" pairs** in a series (*Great Hartfell*, *Little Hartfell*).
- **Polar ice and tundra** as their own module.
- **Volcanoes** as their own kind, beyond the volcanic peaks in mountains.
