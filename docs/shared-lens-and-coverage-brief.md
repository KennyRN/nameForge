# Shared lens and coverage test – brief

**Status:** agreed with Kenny, 12 November 2026. Implement in the milestones of §8. This is the first of six briefs in the table overhaul (§10) and lands **before** the nameForge core brief (`nameforge-core-brief.md`), so the core is ported with one lens rather than nine rosters.

## 1. What changes

Every non-Markov module was built from its own brief, so each carries its own list of cultures, its own idea of era and its own idea of genre. This brief gives them one shared definition, the **lens**, and a **coverage report** that measures every table against it. It adds no words and changes no names: it makes the gaps visible and stops them growing.

| # | Change | Agreed |
|---|---|---|
| 1 | One lens (§3): cultures, regions, eras, styles and tones defined once in `src/data/lens.json` | Northern Europe core; seven eras plus a style overlay |
| 2 | Every module's own roster is **mapped** to the lens (§4) | Module data is not renamed or merged yet |
| 3 | Hard-coded culture and era sets in the engines read from the lens (§5) | No change in output |
| 4 | A coverage report and a ratchet test (§6) | Targets are fixed numbers in `lens.json` |

### 1.1 Hard rules

1. **Output doesn't change.** Every module gives exactly the same names for the same state and seed. §7 fixes the regression fixtures, recorded before any change.
2. **Menus and sentences don't change.** No culture, era or style is added to or removed from any sentence. Cultures marked `planned` (§3.1) are declared but never offered.
3. **No new words.** No entry is added to, removed from or retagged in any table under `src/data/` other than the new `lens.json`.
4. **Existing notes keep working, untouched.** Presets, vocabulary packs, biome packs and recipe packs carry today's keys (`anglo-saxon`, `celtic`, `FL`, `T4`…); all are read as now and never rewritten.
5. Follow the existing conventions: Obsidian-free engines and sentence builders, one seeded `mulberry32` stream per batch, British English with OUP punctuation in user-facing text (spaced en dashes; colons rather than dashes in label–value text).

## 2. Why: the audit

Measured on commit `380d4b9`, across the 33 tables in `src/data/`.

### 2.1 Nine culture rosters

| Roster | Size | Where |
|---|---|---|
| World place names, settlement names (world) | 16 | `world-place-names.json`, `settlement-names.json` |
| Tribal traditions | 17 | `tribal-names.json` (own taxonomy) |
| Colonial traditions | 19 | `colonial-shapes.json` (own taxonomy) |
| Realms | 19 | `realms.json` |
| Bynames, named things, peoples and tongues | 20 | `bynames.json`, `named-things.json`, `peoples-tongues.json` |
| Routes, time and sky, wilds, waters | 22 | adds `polynesian`, `andean` |
| Money | 24 | adds `french`, `dutch`, `iberian`, `american` |
| Shared vocabulary | 26 | `settlement-vocab.json` |
| Ships, aircraft, land vehicles | 34 | `vessels.json`, `vehicles-air-land.json` |

German is a culture in no module (colonial tradition and tribal `germanic` only). Scandinavia is `norse` alone, and in world place names that is Viking and Interstellar with nothing between. Wales, Scotland, Ireland and Cornwall share `celtic`, told apart only by the 12 British regions in the modules that read them. French, Dutch and Iberian are money and vehicle cultures only; Italian is colonial only.

### 2.2 Four era and genre systems

| System | Values | Where |
|---|---|---|
| Era codes | AN, MD, EM, ST, MO, NF, IS | urban, wilds, waters, routes, events, money, things, time and sky |
| Era codes, six | no ST | realms |
| Named eras per culture | two to four each (`old-english`, `viking`, `samurai`…) | world place names |
| Genre settings | FL, FH, MR, MF, SF | group names |
| Technology and styles | T1–T7, S1–S3, A1–AF, L1–L6; 17 styles | vehicles |
| None | – | british place names, river names |

Steampunk is an `h` (fantastic) flag on ST in the shared vocabulary and a style in vessels. Dieselpunk, post-apocalyptic, elven and dwarven exist only in vessels. Cyberpunk exists nowhere.

### 2.3 Depth

- **Shared vocabulary:** 4,586 entries; 3,415 with no culture tag. Tagged: Chinese 148, Japanese 130, Korean 119, Arabic and Persian 97, Norman-British 90, Indian 83, Roman 82, Norse 67, Anglo-Saxon 66, Slavic 57, Celtic 47, Egyptian 45, Ethiopian 35, Polynesian 8, Andean 3.
- **Era tags:** ST 521, EM 376, MO 368, IS 343, NF 341, MD 289, AN 170.
- **Tone tags:** grim 161, light 121, strange 97, grand 27, plain 6.
- **World place names lists:** Anglo-Saxon 200 words, Norse 141, West African 95, Japanese 83, Celtic 47, Indian 33, Arabic and Persian 25, Egyptian 24, Roman 12.
- **Wild lands culture shapes:** 60 across six modules: Chinese 7; Norse, Aztec, Andean, Indian, Egyptian 5 each; Anglo-Saxon, Roman, Maya, Arabic and Persian 1 each; Celtic, Norman-British, Ethiopian none.
- **Seas and coasts culture shapes:** 24; seven cultures none (Anglo-Saxon, Norse, Celtic, Norman-British, Slavic, Korean, Ethiopian).
- **Pools:** 17 empty (left for packs), 16 more with three entries or fewer.

## 3. The lens

One data file, `src/data/lens.json`, read through one module, `src/lens.ts` (§5). Everything in this section goes into the file as written; none of it is for the coding agent to choose.

### 3.1 Cultures

`status` is `live` (offered today under one or more existing keys) or `planned` (declared, never offered by this brief).

**Core tier** – full depth in every module, with regions (§3.2):

| Key | Label | Family | Reads today's keys | Status |
|---|---|---|---|---|
| `english` | English | british | `anglo-saxon`, `norman-british` | live |
| `welsh` | Welsh | british | `celtic` | planned |
| `scottish` | Scottish | british | `celtic` | planned |
| `irish` | Irish | british | `celtic` | planned |
| `scandinavian` | Scandinavian | germanic | `norse` | live |
| `german` | German | germanic | – | planned |

**Second tier** – a fixed minimum in every module (§6.3):

| Key | Label | Family | Reads today's keys | Status |
|---|---|---|---|---|
| `french` | French | romance | `french` | live (money, vehicles) |
| `dutch` | Dutch | germanic | `dutch` | live (money, vehicles) |
| `iberian` | Iberian | romance | `iberian` | live (money, vehicles) |
| `italian` | Italian | romance | – | planned |
| `roman` | Roman | classical | `roman` | live |
| `greek-byzantine` | Greek and Byzantine | classical | `greek-byzantine` | live |
| `slavic` | Slavic | slavic | `slavic` | live |
| `steppe` | Turkic and Mongol steppe | steppe | `steppe` | live |
| `arabic-persian` | Arabic and Persian | near-east | `arabic-persian` | live |
| `egyptian` | Egyptian | near-east | `egyptian` | live |
| `ethiopian` | Ethiopian | africa | `ethiopian` | live |
| `bantu` | Bantu | africa | `bantu` | live |
| `west-african` | West African | africa | `west-african` | live |
| `indian` | Indian | south-asia | `indian` | live |
| `chinese` | Chinese | east-asia | `chinese` | live |
| `japanese` | Japanese | east-asia | `japanese` | live |
| `korean` | Korean | east-asia | `korean` | live |
| `aztec` | Aztec | americas | `aztec` | live |
| `maya` | Maya | americas | `maya` | live |
| `andean` | Andean | americas | `andean` | live |
| `polynesian` | Polynesian | pacific | `polynesian` | live |
| `american` | American | settler | `american` | live (money, vehicles) |

**Local tier** – stay in the modules that have them; a signature set only:

`ottoman`, `swahili-omani`, `malay`, `hawaiian`, `maori`, `w-polynesian`, `nw-coast`, `arctic`, `na-woodlands` (vehicles); `phoenician`, `hellenistic`, `belgian` (colonial); `northAmerican`, `maritimeSEA`, `northernPacific`, `sahul` (tribal).

**`general`** is outside the tiers: it is the unmarked baseline every module keeps.

**Legacy keys.** `anglo-saxon`, `norman-british`, `celtic` and `norse` remain the live keys in every module, preset and pack. The lens records which lens culture each feeds (`legacy` in the file). How `anglo-saxon` and `norman-british` sit inside `english`, and what remains of `celtic` once Welsh, Scottish and Irish are live, is settled in brief 2 (§10), not here.

**Groups.** The vocabulary's `british` and `christian` culture groups move into the lens unchanged: `british`: anglo-saxon, celtic, norman-british; `christian`: anglo-saxon, celtic, norman-british, slavic, french, iberian, and greek-byzantine and roman from MD on.

### 3.2 Regions

Regions belong to core cultures only. The 12 existing British codes are shared out; the rest are declared `planned` with no data.

| Culture | Regions | Status |
|---|---|---|
| `english` | COR Cornwall, WCY West Country, SEA South East, EAN East Anglia, WMM West Midlands and Marches, EMD East Midlands, NTH North, SBL Borderlands | live |
| `welsh` | WAL Wales | live code, planned culture |
| `scottish` | SBL Borderlands, SLO Lowlands, SHH Highlands and Hebrides, NSI Northern Isles | live codes, planned culture |
| `irish` | ULS Ulster, CON Connacht, LEI Leinster, MUN Munster | planned |
| `scandinavian` | DEN Denmark, NOR Norway, SWE Sweden, ICE Iceland and the Atlantic isles | planned |
| `german` | NDT North German plain and coast, RHN Rhineland, MIT Central uplands, ALP Alpine south, OST Eastern marches | planned |

SBL belongs to both `english` and `scottish`, as the cross-border zone it already is. Until brief 2, every module that reads regions keeps offering all 12 British codes under its British cultures exactly as now.

### 3.3 Eras

The seven existing codes are the lens eras, unchanged.

| Code | Label | Span |
|---|---|---|
| AN | ancient | to c. 500 |
| MD | medieval | c. 500–1500 |
| EM | early modern | c. 1500–1750 |
| ST | steam age | c. 1750–1914 |
| MO | modern | c. 1914–now |
| NF | near future | – |
| IS | interstellar | – |

**Land band.** `landBand: ["EM", "ST", "MO"]`: for land-naming modules these three read as one band, since place names barely move from 1700 to now. This brief only records it; the coverage report (§6) counts an entry tagged with any of the three as covering all three **for modules flagged `land: true`** (the six wild lands modules, seas and lakes, coasts and islands, sea charts, river names, native place names). Urban, vehicle, money and group modules keep the three apart.

### 3.4 Styles

Style is an overlay on era, separate from tone. This brief declares the list and maps existing data to it (§4.3); no sentence offers it yet.

| Key | Label | Eras it can sit on |
|---|---|---|
| `realistic` | realistic | all |
| `low-fantasy` | historic or low fantasy | AN, MD, EM |
| `high-fantasy` | high or epic fantasy | AN, MD, EM |
| `contemporary-fantasy` | contemporary fantasy | ST, MO |
| `steampunk` | steampunk | ST |
| `dieselpunk` | dieselpunk | MO |
| `cyberpunk` | cyberpunk | NF |
| `post-apocalyptic` | post-apocalyptic | MO, NF, IS |
| `space-opera` | space opera | IS |

`realistic` on NF and IS is hard science fiction; no separate key.

### 3.5 Tones

The five existing tones, unchanged: grand, plain, grim, light, strange.

## 4. Mapping the modules' own rosters

Each module keeps its data and its keys. `lens.json` holds a `modules` map with, for every module, how its own values read in lens terms. The tables below are the content of that map.

### 4.1 Cultures

Modules whose keys are already the vocabulary's map one to one, plus the legacy rule of §3.1. Three taxonomies need a table.

**Tribal traditions** (`tribal-names.json`):

| Tradition | Lens cultures |
|---|---|
| `general` | general |
| `celtic` | welsh, scottish, irish |
| `germanic` | english, scandinavian, german, dutch |
| `mediterranean` | roman, greek-byzantine, italian |
| `steppe` | steppe |
| `arabian` | arabic-persian |
| `bantu` | bantu |
| `westAfrican` | west-african |
| `southAsian` | indian |
| `eastAsian` | chinese, japanese, korean |
| `mesoamerican` | aztec, maya |
| `andean` | andean |
| `polynesian` | polynesian |
| `northAmerican`, `maritimeSEA`, `northernPacific`, `sahul` | local |

This replaces `traditions.cultureMap` in `group-names.json` as the one source; the group engine must draw exactly as before (the weights 50/25/25 for east Asian and 60/40 for Mesoamerican stay, as `weights` beside the mapping).

**Colonial traditions** (`colonial-shapes.json`):

| Tradition | Lens culture |
|---|---|
| `british-imperial` | english |
| `english-speaking-settler` | american |
| `german` | german |
| `danish`, `swedish` | scandinavian |
| `dutch` | dutch |
| `french` | french |
| `spanish`, `portuguese` | iberian |
| `italian` | italian |
| `roman` | roman |
| `russian` | slavic |
| `arab`, `ottoman` | arabic-persian |
| `chinese` | chinese |
| `japanese` | japanese |
| `hellenistic`, `phoenician`, `belgian` | local |

**Vehicle cultures** (`vessels.json`, `vehicles-air-land.json`): the 22 shared keys one to one; `hawaiian`, `maori`, `w-polynesian`: also count towards `polynesian`; `ottoman`, `swahili-omani`: also count towards `arabic-persian`; the rest local.

### 4.2 Eras

| Module value | Lens eras |
|---|---|
| Realms `ancient`, `medieval`, `earlyModern`, `modern`, `nearFuture`, `interstellar` | AN, MD, EM, MO, NF, IS (ST: not covered) |
| World: `old-english`, `viking`, `saints`, `rus`, `medieval` (Roman), `arabic`, `mexica` | MD |
| World: `pagan`, `imperial` (Roman), `pharaonic`, `graeco-roman`, `ancient` (Indian), `classic` | AN |
| World: `persian` | AN, MD |
| World: `imperial` (Chinese), `samurai`, `joseon`, `kingdoms`, `sahel-and-forest`, `aksum-and-abyssinia` | MD, EM |
| World: `colonial` (Aztec) | EM |
| World: `imperial` (Slavic) | EM, ST |
| World: `modern` (Anglo-Saxon, Chinese, Indian, Japanese) | ST, MO |
| World: `soviet` | MO |
| World: `interstellar` | IS |
| Ships T1, T2 | AN |
| Ships T3 | MD |
| Ships T4 | EM |
| Ships T5 | ST |
| Ships T6, T7 | MO |
| Spacecraft S1, S2 | NF |
| Spacecraft S3 | IS |
| Aircraft and land vehicle technology codes | by each code's own dates in `technology`; the agent lists its reading in the summary for Kenny to check |
| british place names, river names | all seven (no era of their own) |

Technology stays its own axis in the vehicle modules (a Polynesian coal ship remains possible); the mapping is for counting only.

### 4.3 Styles

| Module value | Lens era and style |
|---|---|
| Group setting FL | MD, low-fantasy |
| Group setting FH | MD, high-fantasy |
| Group setting MR | MO, realistic |
| Group setting MF | MO, contemporary-fantasy |
| Group setting SF | IS, realistic |
| Vocabulary `h: true` with era ST only | steampunk |
| Vocabulary `h: true`, any other era | high-fantasy on AN, MD, EM; contemporary-fantasy on MO; space-opera on NF, IS |
| Vocabulary `h: false` | realistic |
| Pools and shapes named for steampunk (`compSteampunk`, `streetSteampunk`, `steampunkLandmark`, `steampunkMonument`, `steampunk` shape lists) | steampunk |
| Vessel styles `heroic`, `elven`, `dwarven`, `oceanic`, `fpirate` | high-fantasy |
| Vessel style `dark` | high-fantasy, contemporary-fantasy |
| Vessel style `steampunk` | steampunk |
| Vessel style `dieselpunk` | dieselpunk |
| Vessel styles `postapoc`, `wasteland` | post-apocalyptic |
| Vessel styles `sfmilitary`, `sfexplore`, `ai`, `alien` | space-opera |
| Vessel styles `corporate`, `colony`, `outlaw` | realistic on NF, IS |
| Everything else | realistic |

## 5. `src/lens.ts` and the engines

`src/lens.ts` is Obsidian-free and exports, at least:

- `LENS_CULTURES`, `LENS_ERAS`, `LENS_STYLES`, `LENS_TONES`, `LENS_REGIONS`, each with its label and, for cultures, tier, family, status and legacy keys.
- `lensCulturesFor(moduleKey, moduleCultureKey): string[]`, `lensErasFor(moduleKey, moduleEraKey): string[]`, `lensStyleFor(...)`: the §4 mappings.
- `inCultureGroup(group, culture, era)`: moved from `settlement/vocab.ts`, which re-exports it.
- `isLandModule(moduleKey)`.

Then:

1. `settlement-vocab.json` keeps its `eras`, `cultures`, `cultureGroups`, `regions` arrays (packs and tests read them), but a test asserts each equals what the lens gives. One definition, checked both ways.
2. Search `src/` for hard-coded culture or era sets in engines and sentence builders (for example `CHRISTIAN` in `src/realms/engine.ts`, and any other `new Set([...])` or array literal of culture keys or era codes). Move each to the lens or to its module's data where it is module-specific. **List every one found in the summary, with where it went or why it stayed.** A set that turns out to differ from the lens group of the same name (the realms `CHRISTIAN` set includes `general` and `ethiopian`, the vocabulary's group doesn't) is kept as it is under its own name: output must not change.
3. `traditions.cultureMap` in `group-names.json` is read from the lens (§4.1).

## 6. Coverage

### 6.1 Rows

Each module gets a small **coverage adapter**: a pure function that reads the module's tables and returns rows.

```ts
interface CoverageRow {
  module: string;        // "mountains", "inns and taverns"…
  kind?: string;         // the module's own kind key
  type: "shape" | "word";
  source: string;        // pool, list or shape table the entry sits in
  cultures?: string[];   // lens keys the entry is restricted to; absent = open to all
  eras?: string[];       // lens codes; absent = all
  styles?: string[];     // lens keys; absent = realistic
  tones?: string[];
  regions?: string[];
  n: number;             // entries, not weights
}
```

Rules, the same for every adapter:

- An entry counts once per lens culture it is restricted to. `!key` exclusions and entries open to all count as **open**, not as signature.
- An entry tagged with five or more eras counts as open for era. For `land` modules the land band (§3.3) applies first.
- `cultureExtra` words count as signature words for their culture.
- Fixed whole names (`f: "fixed"`, the `…Fixed:` pools) are words, not shapes.
- Shared pools are counted in every module that reads them (the readers are in `docs/vocabulary-pools.md`; a test checks the adapters and that table agree).
- Module-own cultures map through §4 before counting.

Adapters live beside the engines (`src/<module>/coverage.ts`) and are collected in `src/coverage.ts`. Modules: all 46 non-Markov modules, name ageing and name takeover excluded.

### 6.2 The report

`npm run coverage` writes `docs/coverage.md` (and `docs/coverage.json`, the same numbers). Sections:

1. **Module × culture:** signature words and signature shapes per cell, with the tier target beside it; cells below target marked.
2. **Module × era** and **module × style:** restricted entries per cell.
3. **Module × tone.**
4. **Module × region**, for modules that read regions.
5. **Module × kind:** shapes open to `general` per kind.
6. **Thin pools:** every pool or list under its minimum.
7. **Roster differences:** per module, lens cultures it doesn't offer and keys it offers that are local.
8. **Totals** per lens culture, era, style and tone across the plugin.

### 6.3 Targets

Fixed numbers in `lens.json` under `targets`. They are starting values: Kenny adjusts them after reading the first report, in the file, not in code.

| Cell | Target |
|---|---|
| Core culture, per module | 30 signature words and 10 signature shapes |
| Second-tier culture, per module | 12 signature words and 4 signature shapes |
| Local culture, per module that has it | 4 signature words and 1 signature shape |
| Era, per module that offers it | 12 era-restricted entries |
| Style, per module | 16 words and 4 shapes |
| Tone (grand, grim, light, strange), per module with tone | 8 tagged entries each |
| Region, per region-reading module | 6 entries restricted to or multiplied for the region |
| Kind | 6 shapes open to `general` |
| Pool or list | 8 entries |

Exempt from the pool minimum, each flagged in `lens.json` under `poolExemptions` with one of two reasons:

- `forPacks`: empty or near-empty by design (the `…Fixed:` pools documented as "for packs").
- `closed`: a real closed set (`cycleElement`, `cycleAnimal`, `direction`, `directionAdj`, `dayElement`, the calendar and zodiac systems in `time-sky.json`, money ladders). The agent proposes the `closed` list in the summary; anything it is unsure of is left unexempt.

Culture targets are not applied where a module deliberately excludes a culture (`unoffered` in `deity-names.json`, `notOffered` in `money-names.json`, `sensitive` lists, pilgrim routes for Polynesian and Andean). Those cells read "excluded" in the report.

### 6.4 The ratchet test

`tests/coverage.test.ts`:

1. Reads `tests/fixtures/coverage-baseline.json` (the report's numbers, committed in M4).
2. **No cell may fall** below its baseline value. Removing or retagging entries deliberately means re-recording with `CAPTURE_COVERAGE_BASELINE=1` and saying so in the commit.
3. **A cell that has met its target must keep meeting it.**
4. Cells under target do not fail the test; they are the report's job.

## 7. Tests

### 7.1 Before anything changes (M0)

`tests/lensBaseline.test.ts` with `tests/fixtures/lens-baseline.json`, in the manner of `wizardRetirementBaseline.test.ts`: seeds 1, 42 and 2024, 12 names, for **every non-Markov module, each culture it offers, at its default settings and at one non-default era or setting**. Reuse the existing snapshot makers where they cover a module. Recorded with `CAPTURE_LENS_BASELINE=1`, committed before any other change, never edited to fit new code.

### 7.2 New

- Lens integrity: every key used in a mapping exists; every module culture, era and style value in the data maps to a lens value or is listed as local; no lens culture is both `planned` and offered.
- The vocabulary's arrays equal the lens (§5.1).
- The group engine's tradition draws are unchanged with the mapping read from the lens.
- Adapters: for three modules (mountains, inns and taverns, realms), hand-counted fixtures of a few cells.
- The ratchet (§6.4).

## 8. Milestones

| # | Milestone | Done when |
|---|---|---|
| M0 | Lens baseline fixtures | Committed before any other change |
| M1 | `lens.json`, `src/lens.ts`, integrity tests | §3 and §4 are in the file exactly; tests pass |
| M2 | Engines read the lens | §5 done; M0 fixtures match; the hard-coded sets are listed |
| M3 | Coverage adapters and `npm run coverage` | All 46 modules report; hand-counted cells match |
| M4 | Report, baseline and ratchet committed | `docs/coverage.md`, `docs/coverage.json`, `coverage-baseline.json`; `docs/vocabulary-pools.md` gains a short section on the lens and the report |

`npm test` and `npm run build` pass at the end of each.

## 9. Out of scope

- New words, new shapes, retagging.
- Offering any new culture, region, era or style in a sentence.
- Merging or renaming module keys; touching presets or packs.
- Splitting or retiring any module.
- A module registry: that is the core brief's. The adapter list in `src/coverage.ts` is a plain array the registry can absorb later.

## 10. The overhaul this starts

| # | Brief | In short |
|---|---|---|
| 1 | Shared lens and coverage test | This one |
| 2 | Roster, eras and style in the sentences | One culture menu everywhere; legacy keys settled; realms gains the steam age; world eras become the seven; the style link; land band in the land modules |
| 3 | Module split | New: farmland and countryside; rivers and inland waters. british place names and world place names retired into the focused modules, with culture and region as choices; regional tables move with them; kinds merged or split where the report shows them thin or overloaded |
| 4 | Northern Europe tables | English regions, Welsh, Scottish, Irish, Scandinavian, German to the core target in every module |
| 5 | Second tier | French, Dutch, Iberian, Italian and Slavic first, then the world cultures levelled to the second-tier target |
| 6 | Style tables | Low and high fantasy, steampunk, dieselpunk, cyberpunk, post-apocalyptic and space opera to target in every module |

Briefs 4 to 6 are word tables written against the report from this brief, so each can be checked by the ratchet as it lands.
