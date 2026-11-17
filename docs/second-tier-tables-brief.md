# Second-tier tables – brief

**Status:** agreed with Kenny, 16 November 2026. Brief 6 of the table overhaul (`shared-lens-and-coverage-brief.md` §10). Follows brief 5 (Northern Europe tables, finished at `6187abe`). Delivered in four batches by culture group (§6), each with its own prompt and each reviewed by Kenny before the next.

## 1. What changes

| # | Change | Agreed |
|---|---|---|
| 1 | Every second-tier culture reaches **core depth** in every module (§4) | All at core depth |
| 2 | Four cultures **split** in two (§2) | Spanish and Portuguese; Arabic and Persian; Greek and Byzantine; Turkic and Mongol |
| 3 | **No regions** for second-tier cultures | None for now |
| 4 | Four batches **by culture group** (§6) | By culture group |

### 1.1 Hard rules

Brief 5's rules carry over unchanged (`northern-europe-tables-brief.md` §1.1 and its amendments §11 to §14):

1. Cultures outside the batch stay byte-identical to the batch's M0 baseline; retired presets unchanged.
2. English output only, with dictionary loanwords looked up on Collins or Oxford and recorded in `docs/loanwords.md`; native forms only in bynames' native and mixed settings and money's loanword setting.
3. No famous real places, events, objects, groups, realms or craft as fixed names or fills; extend `src/data/real-places.json` for each batch's cultures.
4. Each module's own rules hold (blocked month and day names, real coin ratios, invented gods only, the deities `unoffered` and calendar `sensitive` lists, money's `notOffered`).
5. Every new entry is generated from `scripts/` and listed in `docs/second-tier-<batch>.md`.

## 2. Splits

| Today | Becomes | Kind of split | Legacy key |
|---|---|---|---|
| `iberian` | `spanish` **Spanish**, `portuguese` **Portuguese** | two cultures | `iberian` stays as **Iberian**, a mix of both (as Celtic is) |
| `arabic-persian` | `arabic` **Arabic**, `persian` **Persian** | two cultures | `arabic-persian` stays as **Arabic and Persian**, a mix |
| `greek-byzantine` | `greek` **Greek**, `byzantine` **Byzantine** | two periods, like Norse and Scandinavian: Greek to the end of antiquity, Byzantine from late antiquity on; both offered in every era, the probe deciding | `greek-byzantine` stays as **Greek and Byzantine**, a mix |
| `steppe` | `turkic` **Turkic**, `mongol` **Mongol** | two cultures | `steppe` stays as **Turkic and Mongol steppe**, a mix |

- Each mix draws its own legacy entries plus both halves' signature entries at half weight each, and is held to the Celtic-style target (12 words and 4 shapes of its own).
- Stored states with the legacy keys run as saved.
- Each new culture gets people tables (§3), settlement names and the menu entry under its heading: Spanish and Portuguese under Western and southern Europe; Greek and Byzantine there too; Arabic and Persian under Middle East and Africa; Turkic and Mongol under Eastern Europe and the steppe.
- `ottoman` (local) maps to Turkic for people and fills; `swahili-omani` to Arabic.

## 3. People tables

The splits need tables: Spanish and Portuguese from the Iberian tables; Arabic and Persian; Greek (historic only) and Byzantine (historic, with Greek modern names under `modern`); Turkic and Mongol. Same rules as the shared tables brief §3 and its review amendments (one spelling per name, right sex, people only, royal and saint share by weight, era tags, no living royals). Written to `docs/people-tables.md` in the batch that needs them.

## 4. Targets

Core depth for every culture, as brief 5 with the 5a fixes' counting:

| Cell | Target |
|---|---|
| Culture × module | 30 signature words (module-own, at least 8 per kind for its three main kinds) and 10 signature frames |
| Culture × era the module offers | 6 era-restricted entries |
| Culture × module, fantastic | 3 |
| Legacy mixes (Iberian, Arabic and Persian, Greek and Byzantine, Turkic and Mongol steppe) | 12 words and 4 frames of their own |
| Signature share | 40% of own-shape draws; 60% where a culture also reads a legacy table it shares with another (§5.1) |

Exemptions where a culture lacks a landscape (deserts for most of Europe, East Asia's islands aside; sea modules for Mongol; mountains for the Dutch) are marked in `lens.json` and shown as "excluded".

## 5. Content

### 5.1 Settlement names first

In each batch, settlement names comes first, because it fills `[place]` everywhere. Each culture names its towns in its own way, rendered in English: Spanish "New Town", "Saint Mary of the Sea", "Castle of the Count"; Portuguese "Holy Cross", "Good Haven"; Italian "Fortress of …", "Free Commune"; Arabic "Fort of …", "Market of …", "Well of …"; Persian "Garden of …", "City of the King"; Japanese "Eastern Capital", "Rice Field Crossing"; Chinese "Peace Gate", "Southern Capital"; and so on. The world place names and settlement names tables already hold much of this to build on.

### 5.2 Everything else

Every module, as brief 5 did for the core cultures, with era and fantastic tags from the start and the module's own rules. Fantastic words in each culture's own lore (djinn and ghouls for Arabic, kitsune and oni for Japanese, the Feathered Serpent for Aztec, the Wild Hunt is German's, not everyone's).

## 6. Batches

| Batch | Cultures | Mixes |
|---|---|---|
| 6a | French, Dutch, Spanish, Portuguese, Italian, Roman, Greek, Byzantine, Slavic | Iberian, Greek and Byzantine |
| 6b | Turkic, Mongol, Arabic, Persian, Egyptian, Ethiopian, Bantu, West African | Turkic and Mongol steppe, Arabic and Persian |
| 6c | Indian, Chinese, Japanese, Korean | – |
| 6d | Aztec, Maya, Andean, Polynesian, American | – |

Each batch works through the module groups in brief 5's order (land and sea; urban; groups, bynames, realms and vehicles; the rest), committing each part, and stops only at the end of the batch with a review doc, sample names and a commit-and-sync check.

## 7. Tests

As brief 5 §9, per batch: core cells met or exempt, a test reading the coverage report; cultures outside the batch byte-identical; stored legacy keys run as saved; the real-name list checked.

## 8. Out of scope

Regions for second-tier cultures; local cultures beyond their mappings; styles (brief 7); the core brief.

## 9. Amendment, 17 November 2026: batch 6a fixes

Agreed with Kenny after a run of batch 6a. Earlier sections stand; this adds to §2, §3, §4 and §6.

1. **Portuguese and Byzantine are written fresh in every module**, to the core targets and with habits of their own, not derived from Spanish and Greek. Portuguese is Atlantic and maritime (quays, salt pans, cork oak, tile works, caravels and carracks, the saints of Lisbon and Porto, Brazilian and African trading ports from the early modern era, fado houses and tram lines from the steam age), not Castilian castles and counts. Byzantine is the Christian Roman east (themes and strategoi, monasteries and lavras, cisterns and hippodromes, icons and relics, dromons and chelandia, court titles such as sebastos and protospatharios in English), not classical temples, oracles and agoras. `docs/second-tier-6a.md` lists what each shares with Spanish and Greek: only genuinely common words.
2. **The mixes draw both halves.** Iberian and Greek and Byzantine draw their own entries and both halves' signature entries at half weight each, in every module (as Celtic does), including land and sea and urban. The mixes' tribe cells reach 12 words and 4 shapes.
3. **Own-shape share.** Every culture with core-depth tables (the core cultures and every second-tier culture whose batch is done) takes 60% of own-shape draws from its own entries: one value in `lens.json`. This changes core cultures' output; the changed states are listed.
4. **Famous people.** The people tables flag famous figures (writers, philosophers, generals, artists) like royals, and hold flagged names to a fifth of a list's weight (rule 8). Greek leads with ordinary attested names, Roman with ordinary praenomina and cognomina, Italian with common medieval names. Possessive settlement names read "Vsevolod's Town", "Vladimir's Town".
5. **Loanwords.** Every loanword in `docs/loanwords.md` under "still to look up", and every 6a loanword, is looked up on collinsdictionary.com or oed.com, sending only the word; replaced by its English sense where not found.
6. **Deferred cells.** The stars and space, hyperspace charts, spacecraft and river names cells of the 6a cultures are marked `deferred: styles` in `lens.json` (the styles brief owns them), so the report shows why they are short. No other 6a cell stays below target.


## 10. Amendment, 17 November 2026: sibling distinctness

Related cultures must read as themselves before batch 6b. This section is a dated amendment; earlier sections are as they were. The overlap table for every pair and module is in docs/sibling-distinctness.md.

1. **A standing test.** tests/distinctness.test.ts runs every module at its default state with only the culture changed, seeds 1 to 5, twelve names each; a pair's overlap is the share of A's names that B also gives at the same seed. Siblings are held to 25% and each core-depth culture against General to 30%. The pairs, limits and exclusions are in lens.json (`distinctness`); every later batch adds its sibling pairs and its cultures there and must pass. Not measured: the deferred-styles modules (stars and space, hyperspace charts, spacecraft, river names), deserts (no landscape of their own in these lands), the settlement kit, and a mix against its own halves.
2. **How overlap was brought down** (never by changing a random stream): the groups engine now draws the batch's own group families (it only did so for eight named traditions); a culture that reads a table shared with a sibling draws it at a weight in lens.json (`shares.legacy`: 0.1 the Celtic nations and Scandinavian, 0.02 Spanish, Portuguese, Greek, Byzantine and Anglo-Saxon), including the kinds of a module where it has no shapes of its own (land and water modules, buildings, routes), the British native source, and the real month names of a calendar; `shares.module` gives a floor for modules whose general draw would leave a culture near General; Portuguese and Byzantine name in patterns of their own and Anglo-Saxon in its own; Irish and Cornish take two more frame styles (`firstB`, `lastB`) so no two nations share a frame at any place; Scandinavian and the four nations have calendar tables of their own (`engineOwn` `time`); and the calendar and sky lists of every sibling are written so that no two share a word at the same place. Anglo-Saxon has a content key of its own in every module of 5a to 5d: Old English settlement habits in English (the hundred and the moot, minsters and wics, burhs and folds), thegns and ealdormen, shield-walls and mead-halls, the old gods unnamed, the wyrm.
3. **Standing rule for later batches.** New words are English, loanwords are looked up on Collins or the OED and recorded in docs/loanwords.md, and no famous real name is used. The words this brief added are in docs/second-tier-6a.md Part E.
4. **Where it stands.** Every sibling pair and every culture against General is within its limit in every measured module, and all ten pairs are in the test:

| pair | limit | modules over before | modules over after |
| --- | --- | --- | --- |
| anglo-saxon/norman-british | 25 | 29 | 0 |
| welsh/scottish | 25 | 11 | 0 |
| welsh/irish | 25 | 11 | 0 |
| welsh/cornish | 25 | 12 | 0 |
| scottish/irish | 25 | 11 | 0 |
| scottish/cornish | 25 | 10 | 0 |
| irish/cornish | 25 | 12 | 0 |
| norse/scandinavian | 25 | 11 | 0 |
| spanish/portuguese | 25 | 29 | 0 |
| greek/byzantine | 25 | 28 | 0 |
| german/general | 30 | 7 | 0 |
| french/general | 30 | 12 | 0 |
| dutch/general | 30 | 11 | 0 |
| italian/general | 30 | 14 | 0 |
| spanish/general | 30 | 12 | 0 |
| portuguese/general | 30 | 12 | 0 |
| roman/general | 30 | 7 | 0 |
| norman-british/general | 30 | 3 | 0 |
| anglo-saxon/general | 30 | 1 | 0 |
| norse/general | 30 | 1 | 0 |
| slavic/general | 30 | 7 | 0 |
| welsh/general | 30 | 3 | 0 |
| scottish/general | 30 | 0 | 0 |
| irish/general | 30 | 1 | 0 |
| cornish/general | 30 | 1 | 0 |
| scandinavian/general | 30 | 3 | 0 |
| greek/general | 30 | 7 | 0 |
| byzantine/general | 30 | 7 | 0 |

**Note, 18 November 2026: the test as fixed.** The first version of tests/distinctness.test.ts built its states from tests/helpers/lensSnapshot.ts, which has no states for many modules for the newer cultures (urban modules, lands, farmland, hills, rivers, events, bynames and the group families of the cultures added after the lens baseline), and so never measured them. It now builds its states from `probeSpecs()` (tests/helpers/probeStates.ts): each module's real default state, as the plugin has it, with only the culture changed, for every culture the module offers (lens-offers.json), less `excludedModules` and `excludedCells`; it fails if a module of lens-offers.json is not measured or an offered module and culture pair has no state, and a failure lists every pair and module with its overlap. It measures 1,092 pair-and-module cells (867 before). The fixed test found: Spanish/Portuguese inns 50%, monuments 35%, buildings 32%, streets 30%; Greek/Byzantine inns 48%, monuments 28%, streets 28%; Welsh/Irish monuments 28%; Welsh/Cornish inns 38%, buildings 33%, monuments 27%; and Norman and British drew exactly General's group families (100%: it was missing from the groups engine's list of traditions with their own families). They are brought down by the same means: urban frames of their own (the `last` style for Portuguese and Byzantine, `firstB` and `lastB` for Irish and Cornish), own inn, building and adjective lists for Cornish, monument kinds read at the legacy weight, legacy weight 0.02 for Welsh and Cornish, a floor on five group families for Norman and British, and Norman and British in the groups engine's list. Every pair is within its limit in every measured module (docs/sibling-distinctness.md). Generic names every culture of a module can draw ("Copper Cellar", "the Red Anchor", "the Flying Cock") still appear in two or three of ten names; they are within the limits and not removed.
