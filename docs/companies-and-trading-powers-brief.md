# Companies and trading powers – brief

This brief expands the group-name family **guilds and trading houses** into **guilds, companies and trade**. Five new types join the existing six:

- **chartered companies:** power-holding companies named for purpose, territory and authority (*Northern Ocean Trading Company*, *Company of the Sapphire Coast*)
- **colonial companies:** companies founded to settle new land (*Company for the Settlement of Greenwater*)
- **resource companies:** mining, timber and extraction (*Silver Mountain Mining Company*)
- **merchant leagues:** associations of merchants and trading towns (*League of Free Ports*)
- **syndicates and industrial companies:** combines, trusts, railways and canals (*Northern Shipping Syndicate*)

It also adds:

- a **commodity link** ("dealing in ‹spices and dyes›") for the types that trade in goods
- **sister companies:** a series that keeps one territory and changes the trade (*Northern Spice Company*, *Northern Timber Company*, *Northern Shipping Syndicate*)

And it makes the line with **realms and polities** clear: the lands a company *rules* are **company-states** in realms; this family names the *companies*. Realms' corporate character is renamed accordingly (§9).

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow `docs/group-names-brief.md` (GN §x), `docs/group-tone-and-series-brief.md` (TS §x) and `docs/realms-and-polities-brief.md` (RP §x). Reuse the group engine as it stands; the new types are ordinary GN types with shapes and lists.

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | The existing `trade` family; no new module |
| Family label | "guilds and trading houses" → **"guilds, companies and trade"** |
| New types | chartered · colonial · resource · league · industrial |
| Existing types | Kept; merchant, bank and corp gain a few shapes (§4) |
| Commodity | A sentence link for the trade family, shown for types that deal in goods |
| Series | Sister companies: a territory is held, and shapes may come from other types in the family (§6) |
| Company or state | Names that govern land (Territory, Dominion, Authority, Directorate, Charter Zone, Governance Zone) are **realms only**. This family never produces them. |
| Realms | The corporate character becomes **company-states**; four new shapes; allowed in the early modern era at full weight (§9) |
| Satire | Out. Light tone gives the gentler humour. |
| Charter dates, headquarters, flags | Parked |

---

## 1. Family rename

| Item | Was | Now |
|---|---|---|
| Family `label` (and `SECTION_LABELS.tradeGuilds`) | guilds and trading houses | guilds, companies and trade |
| Family `any` phrase | trading groups of any kind | guilds and companies of any kind |
| Icon | `scale` | `scale` (unchanged) |

- Keys don't change: family `trade`, section `tradeGuilds`, presets `family: trade`.
- **History:** new rows use the new label. `historySection()` maps labels starting with either the new or the old label to `tradeGuilds`, so old rows stay with the module.
- Update the label in `tests/britishPlaceNames.test.ts` and any other test that names it.

---

## 2. Type line-up

The trade family's types, in menu order:

| Key | Menu | Sentence | Settings | Weight | Front | Person | Commodity |
|---|---|---|---|--:|---|---|---|
| `craft` | Craft guilds and livery companies | craft guilds | all | 30 | – | founder | no |
| `merchant` | Merchant houses and trading companies | merchant houses | all | 25 | – | founder | yes |
| `chartered` | Chartered companies | chartered companies | all | 15 | – | governor | yes |
| `colonial` | Colonial companies | colonial companies | all | 8 | – | governor | no |
| `resource` | Resource companies | resource companies | all | 10 | – | founder | yes |
| `league` | Merchant leagues | merchant leagues | all | 8 | – | founder | yes |
| `industrial` | Syndicates and industrial companies | syndicates and combines | all | 8 | – | founder | yes |
| `bank` | Banks and finance houses | banks | all | 10 | – | founder | no |
| `corp` | Corporations and megacorps | corporations | MR MF SF | 15 | – | founder | no |
| `union` | Unions and workers' associations | unions | MR MF SF | 10 | – | founder | no |
| `caravan` | Caravans and shipping lines | caravans and shipping lines | all | 10 | – | master | yes |

Existing rows are unchanged apart from the commodity column. `[governor]` is a new placeholder label.

**Descriptions (tooltips)**

- Chartered: "Companies granted a charter to trade, and often to rule, a region. For the lands such a company rules, use realms and polities: company-states."
- Colonial: "Companies founded to settle and govern new land. For the colony itself, use realms and polities."
- Resource: "Mining, timber, quarrying and extraction companies"
- League: "Associations of merchants and trading towns"
- Industrial: "Syndicates, combines, trusts and early industrial companies such as railways and canals"

---

## 3. Shared lists

New shared lists in `group-names.json`. Tone tags in brackets apply as TS §2.3. Setting tags as GN §3.2.

### 3.1 Territory

| List | Words |
|---|---|
| `regionQual` | Spice ×2, Silver ×2, Amber ×2, Iron, Jade, Pearl, Coral, Sapphire, Copper, Cinnamon, Saffron, Tin, Salt, Golden ×2, Emerald, Cedar; `(S)` replaces with: Ice, Iron, Helium, Copper, Crystal, Silver |
| `coastWord` | Coast ×3, Shore, Sea ×2, Ocean, Isles, Straits, Gulf, Bay, Sound, Islands; `(S)` replaces with GN `spaceLand` |
| `commRegion` | `{regionQual} {coastWord}` → Silver Coast, Amber Sea, Iron Belt (SF) |
| `seaWord` | Seas ×2, Ocean ×2, Isles, Coast, Straits, Lands; `(S)` Reaches, Belt, Rim, Worlds |
| `newLand` | Albion ×0.3, Caledon ×0.3, Horizon, Haven, Hope, Dawn, Arcadia, Meridian, Harbour |
| `colonyTarget` | `{town}` 40 · `the {compass} Frontier` 25 · `New {newLand}` 20 · `New {town}` 15 |
| `sfRegion` `(S)` | GN `star` 50 · `{sfBody}` 50 |
| `sfBody` `(S)` | Sol, Titan, Ganymede, Callisto, Europa, Ceres, Vesta, Helios, Perseus, Proxima, Arcadia, Kepler |
| `mineLand` | Mountain ×2, Hills, Valley, Ridge, Fells, Peaks, Downs, Creek, River, Basin, Range |

`{compass}` is GN `compass` without Home.

### 3.2 Activities

| List | Words |
|---|---|
| `tradeActivity` | Trading ×4, Merchant ×2, Mercantile, Commercial, Commerce, Exchange |
| `shipActivity` | Shipping ×2, Navigation, Maritime, Deepwater, Harbour, Packet `(MO)` |
| `exploreActivity` | Exploration, Discovery, Expedition, Survey, Frontier |
| `resourceActivity` | Mining ×3, Extraction, Smelting, Quarrying, Fisheries, Refining `(M)`, Drilling `(MO)`; `(S)` replaces with: Asteroid Mining ×2, Ice Mining, Gas Harvesting, Terraforming, System Development, Orbital Logistics, Deep Space Exploration |
| `industry` | Shipping ×2, Industrial ×2, Mining, Trading, Freight, Haulage, Finance, Rail `(MO)`, Steel `(MO)`, Canal `(PM)` ×0.3; `(S)` Salvage, Orbital Logistics, Heavy Industries |
| `transport` `(PM)` | Railway ×2 `(MO)`, Canal (×0.3 in FL FH), Tramway `(MO)`, Steam Navigation `(MO)`, Telegraph `(MO)`, Water Works, Turnpike ×0.5, Gas Light ×0.3 `(MO)` |

### 3.3 Organisation words

| List | Words |
|---|---|
| `charterHonorific` | Royal ×2 (grand), Chartered ×2, Honourable ×2 (grand), Imperial (grand), United ×0.5 |
| `combineBody` | Syndicate ×2, Consortium, Combine `(M)`, Group `(M)`, Trust `(MO)` |
| `leagueQual` | Maritime ×2, Merchant, Northern, Southern, Eastern, Western, Amber, Salt, River, Harbour, Sea, Free, Coastal |
| `leaguePl` | Ports ×2, Harbours, Cities, Towns, Markets, Merchants; `(S)` Stations, Habitats, Traders, Worlds |
| `leagueBody` | League ×3, Association, Compact, Hanse ×0.5 |
| `sfCorpWord` `(S)` | Frontier, Colonial, Expansion, Development, Survey, Transit |

### 3.4 Resource goods

**`resGoods`** (resource companies; also feeds the metals, precious and fuel commodities, §5): Timber ×2, Copper ×2, Tin, Iron ×2, Silver, Gold, Lead, Salt, Marble, Slate, Coal `(MO)` (×0.3 in FL FH), Oil `(MO)`, Petroleum `(MO)`, Gas `(MO)`, Amber, Pearl, Sulphur ×0.3; `(S)` replaces with: Ore ×2, Ice ×2, Helium, Water, Crystal, Alloys, Rare Earths, Deuterium.

### 3.5 Realms-only words

These words govern land and belong to realms' company-states. No trade-family list or shape may contain them as a whole word: **Territory, Territories, Dominion, Authority, Directorate, Charter Zone, Governance Zone, Protectorate**. Test in §12.4.

---

## 4. Shapes

Columns as GN §6: Form (F formal, E everyday, B both), weight within the type, settings, tone tag (TS §2.8 style), example.

### 4.1 Chartered companies

| Shape | Form | Weight | Settings | Tone | Example |
|---|---|--:|---|---|---|
| `{commRegion} Company` | B | 20 | all | – | Silver Coast Company |
| `{compass} {seaWord} Company` | B | 15 | all | – | Western Seas Company |
| `{compass} {seaWord} {tradeActivity} Company` | F | 15 | all | – | Northern Ocean Trading Company |
| `Company of the {commRegion}` | F | 15 | all | grand | Company of the Sapphire Coast |
| `{charterHonorific} {commRegion} Company` | F | 10 | all | grand | Royal Amber Coast Company |
| `{compass} {goods} Company` | E | 10 | all | plain | Northern Spice Company |
| `Company of Merchants Trading to the {commRegion}` | F | 5 | FL FH MR MF | grand | Company of Merchants Trading to the Jade Sea |
| `{town} {tradeActivity} Company` | E | 10 | all | plain | Fenwick Trading Company |
| `{sfRegion} {tradeActivity} Company` | B | 10 | SF | – | Titan Trading Company |
| `{sfRegion} Interstellar Company` | F | 5 | SF | grand | Perseus Interstellar Company |

### 4.2 Colonial companies

| Shape | Form | Weight | Settings | Tone | Example |
|---|---|--:|---|---|---|
| `Company for the Settlement of {colonyTarget}` | F | 15 | all | grand | Company for the Settlement of Greenwater |
| `{compass} Frontier Company` | E | 15 | all | plain | Western Frontier Company |
| `New {newLand} Company` | E | 10 | all | – | New Albion Company |
| `New {town} Company` | E | 5 | all | – | New Fenwick Company |
| `{town} Land Company` | E | 10 | all | plain | Saltgate Land Company |
| `{charterHonorific} Company of {colonyTarget}` | F | 10 | all | grand | Chartered Company of Ashby |
| `{town} Colonial Company` | B | 10 | all | plain | Fenwick Colonial Company |
| `Society of Adventurers to {colonyTarget}` | F | 5 | FL FH MR MF | grand | Society of Adventurers to the Western Frontier |
| `{sfRegion} Colonial Services` | B | 10 | SF | plain | Titan Colonial Services |
| `{sfRegion} Settlement Company` | B | 10 | SF | – | Ceres Settlement Company |

`{colonyTarget}` after "of" or "to" keeps its leading "the" in lower case (*of the Western Frontier*).

### 4.3 Resource companies

`{mineLandPlace}` = `{resGoodsMetal} {mineLand}` where `resGoodsMetal` is the `resGoods` words Copper, Tin, Iron, Silver, Gold, Lead, Marble, Slate, Coal, Amber (as available in the setting).

| Shape | Form | Weight | Settings | Tone | Example |
|---|---|--:|---|---|---|
| `{mineLandPlace} {resourceActivity} Company` | B | 20 | FL FH MR MF | – | Silver Mountain Mining Company |
| `{compass} {resGoods} Company` | E | 15 | all | plain | Northern Timber Company |
| `{commRegion} {resourceActivity} Syndicate` | B | 10 | all | – | Iron Coast Mining Syndicate |
| `{town} {resGoods} Company` | E | 15 | all | plain | Fenwick Copper Company |
| `{resGoods} and {resGoods} Company` | E | 5 | all | plain | Copper and Tin Company |
| `{town} Colliery Company` | E | 5 | MR MF | plain | Ashby Colliery Company |
| `{resGoods} Trust` | E | 5 | MR MF | – | Copper Trust |
| `{sfRegion} {resourceActivity} Corporation` | B | 15 | SF | – | Ceres Asteroid Mining Corporation |
| `{spaceLand} {resGoods} Company` | E | 10 | SF | plain | Outer Belt Ice Company |

- `{resGoods} and {resGoods}` never repeats a word.
- `{spaceLand}` in this brief always takes GN's `spaceLand` prefix rule (GN §5.4); *Outer Rim* stays blocked.

### 4.4 Merchant leagues

| Shape | Form | Weight | Settings | Tone | Example |
|---|---|--:|---|---|---|
| `the {leagueQual} League` | E | 25 | all | – | the Maritime League |
| `League of Free {leaguePl}` | F | 20 | all | – | League of Free Ports |
| `the {compass} Merchants' League` | E | 10 | all | plain | the Northern Merchants' League |
| `the {town} Merchants' League` | E | 5 | all | plain | the Saltgate Merchants' League |
| `League of {number} {leaguePl}` | F | 10 | all | – | League of Seven Harbours |
| `the {goods} Merchants' League` | E | 10 | all | – | the Amber Merchants' League |
| `{town} {leagueBody}` | B | 10 | all | plain | Fenwick Hanse |
| `the {colour} Pennant League` | E | 5 | all | light | the Blue Pennant League |
| `{spaceLand} Traders' League` | E | 5 | SF | – | Inner Belt Traders' League |

`{number}` is GN `number` without Hundred and Thousand.

Realms also uses *League* as a form of state (RP §3.2). Here a league is an association of merchants and towns; the overlap is intended.

### 4.5 Syndicates and industrial companies

| Shape | Form | Weight | Settings | Tone | Example |
|---|---|--:|---|---|---|
| `{compass} {industry} Syndicate` | E | 20 | all | plain | Northern Shipping Syndicate |
| `{commRegion} Syndicate` | E | 10 | all | – | Silver Coast Syndicate |
| `{town} Industrial {combineBody}` | B | 15 | all | plain | Blackwater Industrial Combine |
| `the {surname} Trust` | E | 10 | MR MF | – | the Harrow Trust |
| `{surname}–{surname} Combine` | B | 5 | MR MF SF | plain | Harrow–Vance Combine |
| `{town} {transport} Company` | B | 15 | FL FH MR MF | plain | Fenwick Railway Company |
| `{town} and {town} {transport}` | F | 5 | MR MF | plain | Ashby and Saltgate Railway |
| `{sfRegion} {industry} Combine` | B | 15 | SF | – | Vega Orbital Logistics Combine |
| `{brandRoot} Consolidated` | B | 5 | MR MF SF | plain | Cobalt Consolidated |

In FL and FH, `{transport}` draws only Canal, Water Works and Turnpike.

### 4.6 Additions to existing types

| Type | Shape | Form | Weight | Settings | Tone | Example |
|---|---|---|--:|---|---|---|
| merchant | `{compass} {goods} Traders` | E | 8 | all | plain | Western Spice Traders |
| merchant | `{commRegion} Merchants` | E | 8 | all | – | Amber Coast Merchants |
| merchant | `{town} Trading House` | E | 5 | all | plain | Saltgate Trading House |
| merchant | `the {goods} Road Company` | E | 3 | FL FH MR MF | – | the Salt Road Company |
| bank | `the {colour} {various} Banking House` | E | 8 | all | light | the Golden Key Banking House |
| bank | `{town} Banking House` | F | 5 | all | plain | Fenwick Banking House |
| bank | `House {house}` | B | 5 | FL FH SF | grand | House Velloran |
| corp | `{sfRegion} {sfCorpWord} Corporation` | B | 10 | SF | – | Proxima Frontier Corporation |
| corp | `{sfRegion} Colonial Services` | B | 8 | SF | plain | Titan Colonial Services |

### 4.7 Series anchors (`sa`)

For sister companies (§6), these shapes take the territory as their anchor:

| Type | Shape | `sa` |
|---|---|---|
| chartered | `{compass} {seaWord} Company` | `compass` |
| chartered | `{compass} {seaWord} {tradeActivity} Company` | `compass` |
| chartered | `{compass} {goods} Company` | `compass` |
| resource | `{compass} {resGoods} Company` | `compass` |
| resource | `{commRegion} {resourceActivity} Syndicate` | `commRegion` |
| industrial | `{compass} {industry} Syndicate` | `compass` |
| industrial | `{commRegion} Syndicate` | `commRegion` |
| league | `the {compass} Merchants' League` | `compass` |
| merchant | `{compass} {goods} Traders` | `compass` |
| merchant | `{commRegion} Merchants` | `commRegion` |

Shapes with `{town}`, `{surname}`, `{house}`, `{brandRoot}` or `{star}` already anchor on those owner tokens (TS §3.3). Composite `{commRegion}` and `{sfRegion}` count as owner tokens for the trade family.

---

## 5. Commodity

### 5.1 The link

A new field for the trade family's sentence:

> ‹General›-themed ‹chartered companies› dealing in ‹anything› for a ‹fantasy› world ‹of historic or low fantasy›, …

| Field | Text | Choices | Default |
|---|---|---|---|
| `commodity` | "dealing in ‹label›" | anything, then the groups for the setting (§5.2) | anything |

- **Shown** when the type is Any or a type marked "yes" in §2. Hidden otherwise; hidden reads as anything.
- **Tooltip:** "What the company trades in: shapes its names where a shape names goods".
- **Resets:** a type without commodities resets it to anything; a setting change that leaves the group unavailable resets it to anything.

### 5.2 Groups

| Key | Label | Words | Settings |
|---|---|---|---|
| `spice` | spices and dyes | Spice ×3, Pepper, Cinnamon, Cloves, Nutmeg, Saffron, Indigo | FL FH MR MF |
| `cloth` | cloth and silk | Silk ×2, Wool ×2, Cloth, Cotton, Linen | FL FH MR MF |
| `furs` | furs and timber | Furs ×2, Timber ×2, Hides | FL FH MR MF |
| `metals` | metals | Iron ×2, Copper ×2, Tin, Lead | FL FH MR MF |
| `precious` | gold, silver and gems | Gold, Silver ×2, Pearls, Amber, Jade | FL FH MR MF |
| `food` | grain, salt and fish | Grain ×2, Salt ×2, Fish, Herring, Wheat | FL FH MR MF |
| `drink` | wine, tea and coffee | Wine ×2, Tea ×2, Coffee, Brandy | FL FH MR MF |
| `livestock` | horses and cattle | Horses ×2, Cattle, Mules, Camels | FL FH MR MF |
| `fuel` | coal and oil | Coal ×2, Oil, Petroleum, Gas | MR MF (Coal also FL FH ×0.3) |
| `ore` | ores and alloys | Ore ×2, Alloys, Iron, Rare Earths, Crystal | SF |
| `ice` | ice and water | Ice ×2, Water | SF |
| `energy` | fuel and energy | Fuel, Helium, Deuterium | SF |
| `data` | data | Data | SF |
| `salvage` | salvage | Salvage | SF |
| `medicine` | medicines | Medicines | SF |

**Never commodities** (not in any list, and not to be added by packs through this link): people or slaves, opium, ivory, sugar, tobacco, rubber.

### 5.3 How it works

With a group chosen:

1. `{goods}` draws only from the group's words.
2. `{resGoods}` and `{resGoodsMetal}` draw only from the group's words that are also in those lists. If none are (e.g. spices), shapes using them get weight 0.
3. Within each type, shapes containing `{goods}`, `{resGoods}` or `{resGoodsMetal}` get **×4**; others keep their weight.
4. With type Any, only commodity types (§2) are drawn, and resource is weighted ×3 for metals, precious, fuel, ore, ice and energy.

---

## 6. Sister companies (series)

TS §3 applies with one change for the trade family:

- **Top-up across types.** At TS §3.5 step 2, the top-up pool is every shape **in the trade family** that contains a token of the anchor's kind, whatever its type, with shapes of the picked type at ×3. Type settings, form, tone and commodity rules still apply to each shape.
- **Anchor order** (TS §3.3 step 4) for the trade family: a shape's `sa`; else `commRegion`, `compass`, `sfRegion`, `town`, `surname`, `house`, `brandRoot` (the first present and not a placeholder); else TS's default.
- Counters (`{ordinal}`, `{greek}`) still win, as in TS.

Example (illustration): picked type chartered, first name *Northern Ocean Trading Company* (anchor compass = Northern) → *Northern Spice Company*, *Northern Timber Company*, *Northern Shipping Syndicate*, *the Northern Merchants' League*.

---

## 7. Traditions and tone

- **Traditions:** GN §9 applies. The `southAsian` caste safeguard (GN §9 step 8) covers every trade type, including the new ones. The arabian caravan multiplier is unchanged. No new signature words.
- **Tone:** the tags in §3 and §4 apply as TS §2. `charterHonorific` words are grand; light shapes are the pennant league and the coloured banking house.

---

## 8. Safeguards

### 8.1 Block list additions

Add to the GN block list (whole-name, case-insensitive, leading "the" ignored):

- **Real chartered and colonial companies:** Dutch East India Company, United East India Company, VOC, West India Company, Dutch West India Company, Honourable East India Company, English East India Company, French East India Company, Swedish East India Company, Danish East India Company, Ostend Company, Muscovy Company, Russia Company, Levant Company, Turkey Company, Eastland Company, Greenland Company, Royal African Company, African Company, Company of Royal Adventurers Trading to Africa, British South Africa Company, Royal Niger Company, Imperial British East Africa Company, North Borneo Company, New Zealand Company, Plymouth Company, London Company, Massachusetts Bay Company, Ohio Company, North West Company, South Sea Company, Mississippi Company, Darien Company, Company of Scotland.
- **Real trading, banking and industrial houses:** Medici Bank, House of Medici, House of Fugger, Fugger, Rothschild, Barings, Baring Brothers, Coutts, Bank of England, Bank of Scotland, Lloyd's, Jardine Matheson, Butterfield and Swire, Swire, Mitsubishi, Mitsui, Sumitomo, Krupp, Standard Oil, De Beers, United Fruit Company, Anglo-Persian Oil Company, Union Pacific, Central Pacific, Great Western Railway, Peninsular and Oriental, P&O, Cunard, White Star Line, Black Ball Line, Blue Funnel Line, Hamburg America Line.
- **Real places as commodity coasts:** Gold Coast, Ivory Coast, Slave Coast, Grain Coast, Pepper Coast, Malabar Coast, Coromandel Coast, Barbary Coast, Spanish Main, New Caledonia.
- **Fiction and games:** East India Trading Company, Weyland-Yutani, Weyland Corporation, Hyperdyne Systems, Seegson, CHOAM, Spacing Guild, Arasaka, Militech, Kang Tao, Biotechnica, Petrochem, Tyrell Corporation, Wallace Corporation, Protogen, Mao-Kwikowski Mercantile, Tukera Lines, Sternmetal Horizons, General Products, Ling-Standard Products, Delgado Trading, Oberlindes Lines, ComStar, Defiance Industries, Buy n Large, Omni Consumer Products, OCP, Soylent Corporation, Rekall, Shinra, Vault-Tec, RobCo, Abstergo, Massive Dynamic, Initech.

### 8.2 Flag list additions

Allowed by default (`flagListBlocks: false`): New Albion, New Caledon, Spice Islands, Western Seas Company, Northern Ocean Trading Company, Silver Coast Company, Maritime League, League of Free Ports, Hanse.

### 8.3 Banned words

GN §12.3, plus: Slave, Slaves, Slaver, Opium, Plantation, Blackbirder, Coolie.

---

## 9. Realms: company-states

These changes apply to `src/data/realms.json` and the realms sentence.

### 9.1 Rename

| Item | Was | Now |
|---|---|---|
| `corporate` menu | Corporate | **Company-states** |
| plural (sentence) | corporate states | **company-states** |
| description | Authorities, charters and governance zones | **Lands ruled by a chartered company or corporation rather than a crown or people: company territories, charters and governance zones. For the companies themselves, use guilds, companies and trade.** |
| `eraMult` | AN 0, MD 0, EM 0.3 | AN 0, MD 0, **EM 1** |

- The key stays `corporate`, so presets and history still read.
- The realms history label shows "company-states" for this character.

### 9.2 New shapes

Added to the corporate character shapes (RP §6.5), group `admin`:

| Shape | Weight | Eras | Short form | Example |
|---|--:|---|---|---|
| `{commRegion} Company Territories` | 1 | EM MO NF | `{commRegion}` | Silver Coast Company Territories |
| `Territories of the {place} Company` | 1 | EM MO | `{place}` | Territories of the Fenwick Company |
| `{brandRoot} Corporate Dominion` | 1 | NF IS | `{brandRoot}` | Helix Corporate Dominion |
| `{star} Charter Territory` | 1 | NF IS | `{star}` | Orion Charter Territory |
| `{commRegion} Corporate Authority` | 1 | MO NF IS | `{commRegion}` | Silver Coast Corporate Authority |

`{commRegion}` is read from `group-names.json` (§3.1); in NF and IS it uses its `(S)` forms.

### 9.3 Brief update

Edit `docs/realms-and-polities-brief.md` §5.1, §5.2, §5.3 and §6.5 to match, so the realms brief stays the record of that module.

---

## 10. Presets

Group presets (GN §13) gain one key:

| Key | Values | Default |
|---|---|---|
| `commodity` | `any` or a group key (§5.2) | `any` |

- Read only for `family: trade`; ignored otherwise.
- A group not available in the preset's setting runs as `any` and reports `Commodity “{x}” isn't available here.`
- Older presets without the key load as `any`.

---

## 11. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Data, types and rename.** §1–§4, §7, §8 | §12.1–§12.4 pass; existing group tests pass with the renamed label |
| M2 | **Commodity and sister companies.** §5, §6, §10 | §12.5–§12.7 pass |
| M3 | **Realms company-states.** §9 | §12.8 passes; both modules generate in the app |

Add this brief to `docs/` as `companies-and-trading-powers-brief.md`.

---

## 12. Tests

### 12.1 Data (`tests/groupNames.test.ts`)

- The trade family has the 11 types of §2 in that order, with the label and "any" phrase of §1.
- Every list and shape named in §3–§4 exists; all weights > 0.
- No word contains `(`, `)`, `§`, `×`, `?` or `→`.
- Every `sa` in §4.7 names a token in its shape.

### 12.2 Coverage

GN §16.2 extended: every new type × available setting × form × people × tone: 20 unique names within the caps.

### 12.3 Rename and history

- `SECTION_LABELS.tradeGuilds` is "guilds, companies and trade".
- `historySection()` maps a label starting "guilds and trading houses" and one starting "guilds, companies and trade" to `tradeGuilds`.

### 12.4 Realms-only words

5,000 names per trade type across all settings: no §3.5 word appears as a whole word.

### 12.5 Commodity

- The commodity segment shows for type Any and the commodity types, and is hidden for craft, colonial, bank, corp and union.
- Chartered, commodity `spice`, 2,000 names: every name that came from a shape with `{goods}` contains a `spice` word, and at least 30% of names contain one.
- Type Any with a commodity: every name comes from a commodity type.
- Resource with `spice`: no shape using `{resGoods}` is drawn.
- No commodity list contains a "never" word (§5.2).
- Changing the setting to SF resets `spice` to anything.

### 12.6 Sister companies

- Chartered, series of 5, a seed whose first shape is `{compass} {seaWord} {tradeActivity} Company`: every name contains the first name's compass word, and in at least 25% of 200 such series at least one name comes from another type.
- With a picked type and anchor `town`, every name contains the town.

### 12.7 Safeguards and presets

- 5,000 names per new type: 0 block-list matches, 0 banned words.
- Preset with `commodity: metals` round-trips; `commodity: ice` in FL reports and runs as any; older presets load as any.

### 12.8 Realms (`tests/realms.test.ts`)

- The corporate character's menu is "Company-states" and its plural "company-states".
- Early modern, corporate, 2,000 names: generates (no shortfall notice), and at least 10% use a §9.2 shape.
- §9.2 short forms match the table.

---

## 13. Parked

- Company details: charter date, headquarters, primary commodity, controlled territory, military forces, trade routes, motto, flag, influence.
- A satire switch (*Happy Trading Company*).
- Linking a company to the company-state it rules (one territory shared across both modules).
- A shops and local businesses module (the document's out-of-scope retail names), alongside inns and taverns.
