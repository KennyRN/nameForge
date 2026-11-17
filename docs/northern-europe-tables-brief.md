# Northern Europe tables – brief

**Status:** agreed with Kenny, 15 November 2026. Brief 5 of the table overhaul (`shared-lens-and-coverage-brief.md` §10). Lands after the fill polish (`fill-polish-prompt.md`). Delivered in four batches (§8), each with its own prompt and each reviewed by Kenny before the next.

## 1. What changes

The seven core cultures get tables of their own in every module, at the core target, and Scandinavia and Germany get regions.

| # | Change | Agreed |
|---|---|---|
| 1 | Welsh, Scottish, Irish and Cornish become **cultures in their own right** in every module (§3.1) | – |
| 2 | **Celtic stays** as a mix for fantasy and ancient settings (§3.2) | Keep as a mix |
| 3 | **Norse and Scandinavian** split like early and later English (§3.3) | Split like English |
| 4 | **German** becomes a full culture (§3.4) | – |
| 5 | **Scandinavian and German regions** go live (§4) | Both |
| 6 | Each core culture reaches **30 signature words and 10 signature shapes** per module, each region **6 entries** (§6) | The lens targets |
| 7 | Four batches by module group (§8) | By module group |

### 1.1 Hard rules

1. **Other cultures don't change.** Names for every culture outside the core seven (and outside Celtic, §3.2) stay byte-identical in every module a batch touches. General may change only where a batch says so.
2. **Core cultures do change**, deliberately. Each batch re-records the fixtures it changes, after checking every changed entry is a core-culture state, and lists fixtures and counts.
3. **Retired presets still run unchanged.** The retired engines' tables are not edited; new words go in the focused modules' own tables.
4. **English output.** Every word is plain English, as Kenny's earlier rules set: names "translated" (Black Forest, not Schwarzwald), and region words are English words. A loanword is allowed only where a standard English dictionary has it (fjord, fell, skerry, holm, alp, polder, heath). No Welsh, Gaelic, Cornish, Norse or German words otherwise. Personal names come from the people tables, not the module tables.
5. **No famous real places as fixed names.** Fixed whole names (`f: "fixed"`) must not be a well-known real place ("Land's End", "Snowdon", "Black Forest"). Generated compounds that happen to match a real place are fine.
6. Follow the existing conventions: Obsidian-free engines, data in the tables, tags through the lens, one seeded `mulberry32` stream per batch, British English with OUP punctuation in user-facing text.

## 2. Where the core cultures stand

From `docs/coverage.json` at `c80d6ee`, words/shapes, for the land and sea modules:

| Module | English | Welsh, Scottish, Irish, Cornish (all via Celtic) | Scandinavian | German |
|---|---|---|---|---|
| Route names | 24/14 | 23/13 | 7/3 | 0/0 |
| Mountains | 4/2 | 5/2 | 3/0 | 0/0 |
| Forests | 4/7 | 5/2 | 1/0 | 0/0 |
| Moors, wetlands, grasslands | 4–5/1–3 | 5/1–3 | 0–1/0 | 0/0 |
| Lands, farmland, hills, rivers | 1–2/33–44 | the same (borrowed British source) | 0/0 | 0/0 |
| Seas and bays, coasts, sea charts | 0–7/17–32 | 1–2/17–32 | 0–8/3–12 | 0/0 |
| Sacred places | 30/0 | 16/0 | 17/0 | 0/0 |

The four Celtic nations read the same data today; German has none.

## 3. Cultures

### 3.1 Welsh, Scottish, Irish and Cornish

- New module culture keys `welsh`, `scottish`, `irish`, `cornish`, used in data tags and states, with the lens's `british` and `christian` groups gaining all four.
- The brief 2 **views retire**: Welsh, Scottish and Cornish are real menu entries. A stored `celtic` + WAL state is read as `welsh` + WAL; `celtic` + COR as `cornish` + COR; `celtic` + SBL, SLO, SHH or NSI as `scottish` + that region. Their names change: that is the point of this brief. Stored notes are not rewritten.
- Regions: Welsh WAL (fixed), Cornish COR (fixed), Scottish SBL, SLO, SHH, NSI (link, default SLO), Irish none. English keeps WCY, SEA, EAN, WMM, EMD, NTH, SBL.
- A batch offers the four only in modules it gives tables; elsewhere the probe keeps them out until their batch (brief 2 rule).

### 3.2 Celtic

`celtic` stays as **Celtic**: a mix for fantasy and ancient settings. It draws its own entries (Iron Age Britain and Gaul: hillforts, sacred groves and springs, horse and boar, mother goddesses, rendered in English) plus each nation's signature entries at a quarter weight each. Region link: "across all of Britain" only. Target: 12 own words and 4 own shapes per module (the second-tier target).

### 3.3 Norse and Scandinavian

- `norse` reads **Norse**: the early period (Viking age and medieval). It keeps all its data.
- A new module key `scandinavian` reads **Scandinavian**: the later period (early modern to interstellar), with its own data.
- Both are offered in every era, as early and later English are, and the probe decides where they differ. Both read the regions of §4.
- People tables: `norse` reads Scandinavian historic; `scandinavian` reads both periods.
- Each is held to the core target on its own.

### 3.4 German

`german` loses its colonial-only scope and becomes a full culture with the regions of §4, offered wherever its batch gives it data.

## 4. Regions

| Culture | Code | Region | Landscape to draw on |
|---|---|---|---|
| Norse, Scandinavian | DEN | Denmark | low islands, heath, beech wood, sounds, dunes, bogs |
| | NOR | Norway | fjords, fells, high moor, glaciers, waterfalls, steep farms |
| | SWE | Sweden | lakes, forest, rock, skerries, eskers, mines |
| | ICE | Iceland and the Atlantic isles | lava, black sand, hot springs, ice caps, bare fell, bird cliffs |
| German | NDT | North German plain and coast | marsh, heath, moor, dykes, mudflats, islands, brick towns |
| | RHN | Rhineland | river gorge, vineyards, crags, castles, old Roman towns |
| | MIT | Central uplands | forested hills, mining, springs, ridges, clearings |
| | ALP | Alpine south | alps, high pasture, passes, lakes, avalanches, gorges |
| | OST | Eastern marches | lakes, pine, sand, marsh, Slavic-borrowed settlements |

- Region link text as Britain's: "across all of Scandinavia" or "in Norway"; "across all of Germany" or "in the Rhineland".
- Region words are English words (rule 4), weighted per region in `regionTags` the way fell and dale are: for example *fjord* (NOR 3, ICE 2, SWE 0.3), *skerry*, *holm*, *fell*, *heath* (DEN 2, NDT 3), *alp* (ALP 3), *marsh*, *dyke*, *forest*.
- British dialect words stay British (§3 of the shared-tables fixes); Scandinavian and German region words are drawn only for their own cultures.
- `regionTags` gains the nine codes for every existing word (0 unless it fits).

## 5. Tags

Data entries may now carry `c` values `welsh`, `scottish`, `irish`, `cornish`, `scandinavian`, `german`, and region codes DEN, NOR, SWE, ICE, NDT, RHN, MIT, ALP, OST. A new culture group `nordic`: `norse`, `scandinavian`. The coverage adapters read the new keys straight into their lens cultures.

## 6. Targets

Per module in a batch, from `lens.json`:

| Cell | Target |
|---|---|
| English (counting `anglo-saxon` and `norman-british` together), Welsh, Scottish, Irish, Cornish, Norse, Scandinavian, German | 30 signature words and 10 signature shapes |
| Celtic (own entries) | 12 words and 4 shapes |
| Each English, Scottish, Scandinavian and German region | 6 entries restricted to or multiplied for it |
| Each core culture × era the module offers | 6 entries restricted to that era (part of the 30 and 10, not on top) |

- **Exempt:** deserts for every core culture except Scandinavian and Norse in ICE (lava fields, black sands), which take 12 words and 4 shapes; sea charts and coasts for German take the target only through NDT. The coverage report shows these as "excluded" or reduced.
- Borrowed source entries (the British shapes) don't count towards signature cells: the target is the module's own tables.

## 7. Content rules

- **Signature means it belongs.** A signature entry is restricted to its culture because it would be wrong or odd elsewhere: Welsh *cwm*-shaped valleys rendered "Valley Head", Cornish "Saint's Cove" and mine names, Scottish "Shieling", "Mull of", Irish "Holy Well", "Bog Road", Norse "Thing Field", "Longship Strand", German "Mark", "Burg Hill" ("Castle Hill"), "Salt Road". Plain English words that suit every culture belong in the general lists, not in a culture's.
- **Shapes** follow how each culture names: Welsh and Cornish put the generic first ("Valley of the Oak", "Cove of Saint Piran"); English puts it last ("Oakdale"); Irish names by saints, chieftains and the land ("Holy Well of Brigid", "Mag's Plain"); Norse by farms, things and kin ("Ulf's Farm Holm"); German by castles, marks and forests ("Hawk Castle Wood").
- **Eras:** each culture's entries are tagged by era wherever an entry belongs to one (mine and mill words from EM, rail and quarry words from ST); the land band (EM to MO) may be tagged as a span.
- **Fantastic:** at least 3 words per culture per module tagged `h` (fantastic), in the culture's own lore (knockers in Cornish mines, the Wild Hunt for German forests, trolls for Norway).
- **Sources:** the research reference (`docs/worldbuilding-research-reference.md`), the British and colonial reference documents and standard place-name knowledge. No word list is copied from a copyrighted source.

## 8. Batches

| Batch | Modules | Note |
|---|---|---|
| 5a | Lands and territories, farmland and countryside, hills and valleys, rivers and inland waters, route names, sacred places, the six wild lands, seas and bays, coasts and islands, sea charts | Regions first appear here |
| 5b | Settlement names, streets and districts, inns and taverns, buildings and landmarks, monuments and statues, settlement kit | |
| 5c | The seven group families, tribes and kin groups, the three bynames modules, realms, peoples and tongues, ships, aircraft, land vehicles | |
| 5d | Money, calendars and festivals, sky lore, events and eras, the three named things modules, deities | |

Stars and space, spacecraft and hyperspace charts are left to the style tables brief.

Each batch:

1. Writes `docs/northern-europe-<batch>.md`: every new entry, by module, culture, region and era, for Kenny's review.
2. Wires the entries in, re-runs `npm run offers`, re-records the coverage ratchet.
3. Stops and reports. The next batch's prompt follows Kenny's review.

## 9. Tests

- Per batch: every core cell in the batch's modules meets §6 (or its exemption) in the coverage report; a test reads the report and fails if not.
- Region words: a Scandinavian or German region word never appears for another culture; a test sweeps the probe's states.
- Non-core cultures: byte-identical in the batch's modules (rule 1), against a per-batch M0 baseline.
- Stored Celtic views read as the new cultures (§3.1), shown correctly in the sentence.
- Fixed names: none on a list of well-known real places that the test holds (at least 150 British, Scandinavian and German names).

## 10. Out of scope

- Second-tier and local cultures (brief 6); styles (brief 7).
- Region-level people tables (Northern English, Highland names): the people tables keep one list per culture and period.
- Stars and space, spacecraft, hyperspace charts.
- The retired engines' tables.

## 11. Amendment, 16 November 2026: batch 5a fixes

Agreed with Kenny after a run of the 5a modules. Earlier sections stand; this adds to §6 and §7 and fixes what the run showed.

### 11.1 How the signature cells count (amends §6)

The 30 words and 10 shapes per module were met by counting the shared pools and one set of land frames in every module that reads them. From now on, for the core cells of this brief:

- **Signature words** are the module's own `{N}` nouns only. The shared pools (`nLandB`, `nLandC`, `nLandD` and their water, route and sacred twins) are still read by every module of their group, but are not counted towards a signature cell.
- **Signature shapes** are the module's own frames only. The group frames (the same set read by every module of a group) are still drawn, but are not counted.
- The targets stand: 30 words and 10 shapes per core culture per module; 12 and 4 for Celtic; 6 per region; 6 per era.

### 11.2 Depth per module

- Each module's three main kinds get a noun list of their own, of at least 8 words and in practice 10 (30 per module), each word right for its kind. A noun is never used on the wrong kind ("Saddle" as a range).
- Each module has frames of its own, written for it (a coast frame reads like a coast), at least 10 per culture; the group frames are on top of them.
- Sacred places have one kind, so their three lists are by site: water, stone and ground, and built places.
- `B` (land use and material) and `C` (lore) stay shared by the group.

### 11.3 Making the culture show

- When a core culture (or Celtic) is chosen, its signature frames take 40% of the draws of a kind. General and other cultures are unchanged.
- Within one batch a culture noun appears at most twice (until the module's nouns for that culture run out).

### 11.4 Era words

The `{D} {N}` frame is dropped: era words read on their own terms (`{town} {D}`, `{D} of {person}`, `Old {D}` from the steam age on for older eras' words). Ley Line is a 1920s idea: modern and fantastic only.

### 11.5 Words

Output is English words in a standard dictionary: Barrow Wight (a coinage) becomes Barrow Ghost; Autobahn becomes Motorway; Bal and Carn become Mine and Cairn; Draugr becomes Walking Dead. Wheal and Zawn stay for region COR only. Fixed whole names are checked against the real-place list of §9 in every wild lands, waters and place table, not only the new ones.

### 11.6 Fills and sources

Holy and title fills never follow a bare generic (they take "Saint {n}", or "of" or a possessive); folk fills never follow a bare generic and take "the" after "of"; old personal names go by culture first, region second; the British shapes source never runs for Norse, Scandinavian or German; rivers at home never use the native forms; the plain narrow-valley word reads "Combe" for Welsh and Cornish; German `[place]` fills read the German people tables (as "{given}'s {generic}" or "{surname} {generic}") until batch 5b adds German settlement names.

## 12. Amendment of 16 November 2026: regions, strays and batch 5b

Part A finishes batch 5a; Part B is batch 5b (settlement names, streets and districts, inns and taverns, buildings and landmarks, monuments and statues, the settlement kit).

### 12.1 Region share

When a region is chosen (not "across all of…"), entries weighted for that region (a `regionTags` weight of 1 or more for the chosen region, or an `r` tag naming it) take **30%** of the module's own-shape draws, in every region-reading module, for British, Scandinavian and German regions alike. "Across all of…" is unchanged. The share is in `lens.json` (`shares.region`) beside the signature share (`shares.signature`, 40%). It is applied after the signature share.

### 12.2 Region depth and exemptions

Each region has at least **6** region-weighted shapes in each land and water module whose landscape it has (counted from the live plans of a chosen region, not from the tag tables). A region that lacks a module's landscape is marked exempt in `lens.json` (`regionExempt`) and its draws fall back to the culture's own: mountains for NDT, DEN, OST and EAN; forests for ICE and NSI; moors for RHN and ALP; wetlands for RHN, MIT and ALP; grasslands for RHN; seas and bays for ALP, WMM and EMD; coasts for WMM and EMD; sea charts for every inland region (RHN, MIT, ALP, OST, WMM, EMD). The new entries are in `scripts/north5a/regionPacks.mjs`: two region words per module, each with three frames written for it.

### 12.3 Fills

- A fill that starts with the generic it follows ("River" + "River Mother") is drawn again, as one that ends with it is; the guard covers place, earlier-name, deity and folk fills.
- Old personal names come from the people tables only and never a name that is also a feature word of a module list ("Turlough").
- A name takes at most one `[place]` fill: a second is a single word, and a German place beside a feature word is a bare name until German settlement names (Part B).
- A deity fill after "of" takes "the" ("Valley of the Keeper of Masks").
- A plural before a people word is singular ("Hill Ploughmen").
- A `[place]` fill that is on the real-place list (`src/data/real-places.json`, the 150 of §9 and real towns such as Bath) is drawn again.

### 12.4 Dictionary check

Every loanword is checked against a standard English dictionary; those that are not there are replaced by their English sense (listed in `docs/northern-europe-5a.md`).

### 12.5 Decisions for batch 5b

- Settlement names come first, as the `[place]` source of every module. Each core culture gets settlement names of its own at home, translated into English; the `[place]` fill then reads each culture's own settlement names (replacing the interim German rule); the family chain stays as the fallback for cultures without their own. Newly explored and settled lands keep the colonial engine.
- The other five modules meet §6 and §7 with the 5a counting and the region share and depth of §12.1 and §12.2 where they read regions; the settlement kit composes the others.
- Non-core cultures stay byte-identical to a 5b M0 baseline in the six modules; retired presets are unchanged; English output only; no famous real place as a fixed name or fill; every entry is written to `docs/northern-europe-5b.md`.

## 13. Amendment of 16 November 2026: 5b follow-ups and batch 5c

### 13.1 Part A: follow-ups to 5b

- **Real-world names in settlement names.** Settlement names keeps its per-slot name sentence. The closing link and each slot's menu gain **real-world names** and **generated names** beside placeholders, lists and generators, with real-world names the default for a new state (as the people link is in every module). A stored state or preset runs as saved: a preset with no slot choices stays on placeholders, and one whose every offered slot is real-world (or generated) names reads as that setting of the whole sentence. The people filler fills the slots set to those choices after the run, only on their labels. A `[place]` fill drawn from settlement names is always filled in the calling module's people mode, and one that still holds a bracket gives way to a person's name, so no bracket from a fill reaches another module's output in real or generated mode.
- **Stacked fills stay.** No length cap on a name with fills ("Brian's Fort Cairn", "Finlay's Shieling Merchants' Howff"): only the existing guards apply (one `[place]` fill per name, no fill ending or starting with its feature's generic).
- **Dictionary check, finished.** Every loanword in the 5a and 5b review tables was looked up on collinsdictionary.com (only the word sent). The result of each lookup and every replacement are in `docs/loanwords.md`. A word found only in another sense counts as not found. Wheal and Zawn stay (Cornish only).
- **The inns port ratio test.** Measured at `7936e32` (before 5b) and now, seed by seed: General's port to anywhere ratio is 2.87, 2.78 and 2.95 over 3,000, 6,000 and 30,000 names both before and after 5b, so it was already below 3×; Norman & British was 3.03, 2.89 and 2.93 before and is 2.74, 2.66 and 2.62 now counting every name (2.94, 2.89 and 2.73 without the culture's own shapes, which the test excludes). The 3,000-name sample had passed 3× by luck; the floor of 2.5× stands.

### 13.2 Decisions for batch 5c

- **Group families** switch from their tradition link to the shared culture menu (the brief 2 lens clause). A stored `tradition` state or preset keeps its old draw and shows its tradition's label until a culture is picked; nothing is migrated.
- **Tribes and kin groups** keep their traditions and gain eight: English, Welsh, Scottish, Irish, Cornish, Norse, Scandinavian and German. The Celtic and Germanic traditions stay as the broad mixes they are.
- **Content (5c modules):** the seven group families, tribes and kin groups, the three bynames modules, realms, peoples and tongues, ships, aircraft and land vehicles: per core culture at least 8 words per kind for each of a module's three main kinds (30 in all) and 10 frames of its own with the 40% signature share; Celtic 12 and 4. Spacecraft is left to the style tables brief. The bynames modules keep their native and mixed language settings (ap, verch, Mac, Ó, Ní, Nic, -son, -dottir, von, zu, Jarl, Graf, Thane); the English setting renders them in English.
- **Real names:** the real-place list is extended with at least 120 well-known real groups, realms and craft (the Hanseatic League, the Teutonic Order, the Black Watch, the Mary Rose, the Long Serpent, the Hindenburg, the Lordship of the Isles); every new fixed name is checked against it.
- **Rules:** a 5c M0 baseline of every non-core culture and every stored tradition preset in the 5c modules is recorded before any 5c change and stays byte-identical; retired presets are unchanged; every new entry is written to `docs/northern-europe-5c.md` and its loanwords, each looked up, to `docs/loanwords.md`.

### 13.3 What batch 5c did, and how (decisions the prompt left open)

- **The group families' culture menu** is the lens menu's headings and order, filtered to the cultures the families have a flavour for (`CULTURE_TRADITION` in `src/tribes/engine.ts`; a culture with no tradition, such as French or Slavic, would read General and is left out). Picking a culture stores its tradition (`english`, `welsh`… for the core cultures, the old traditions for the rest), so presets, notes and history keep their format. The sentence also keeps `culture`, which makes `celtic` (a legacy tradition) draw its own twelve words and four frames. A stored `celtic` or `germanic` tradition keeps its draw exactly (the 5c baseline holds every one) and is shown with its own label until a culture is picked.
- **Signature names.** The batch's words and frames are in `src/data/north5c.json`, written by `scripts/make-north5c.mjs` from `scripts/north5c/`: for each of sixteen modules, three lists of ten English words per core culture (Celtic four), ten frames per culture (Celtic four) in one of four styles (the generic first for Welsh, Cornish, Irish and Scottish; adjective and noun for English; owners and kin for Norse and Scandinavian; stacked compounds for German), and 40% of a batch's names are drawn from them. A noun is used at most twice in a batch. A chosen kind, type, function, style, a full style, a series, a pack and the settlement kit keep the module's own draw. The other modules that read these engines for their pools (things, money, routes, waters, the kit) pass `signature: false`.
- **Bynames:** the English setting renders in English. Native and mixed settings add the culture's own forms (ap and ferch, Mac, Ó and Ní, Nic, -son and -dottir, von and zu, Jarl, Graf) from `NATIVE`; a family name takes them in a share of its names. The titles' words carry no rank that has a sex, because a title is drawn for men and for women (a check in the generator).
- **Newer culture keys** (Welsh, Scottish, Irish, Cornish, Scandinavian, German) read the legacy key's tables in the bynames, realms, peoples and vessels engines (`engineAlias`); German reads General, so it has no British prefix (HMS) or registration (G-). Spacecraft keeps its thirty-four cultures.
- **Not done in 5c:** the signature words carry no era or fantastic tags (the cells of §6 for era are not part of the 5c prompt); tribes and kin groups keep Celtic as it is, so their Celtic cell has no words of its own.

## 14. Amendment of 17 November 2026: 5c follow-ups and batch 5d

### 14.1 Part A: follow-ups to 5c

1. **Era and fantastic tags on the 5c words.** A signature word may carry an era span (`AN-EM`, `ST-MO`, `MO`) and a trailing `*` for a fantastic word. A word is drawn only where the state's eras meet its span (unknown eras filter nothing) and a fantastic word only in a fantastic setting. The eras come from the module's own notion: a craft's technology level (ships, aircraft, land vehicles: no longship in the modern era, no steam drifter in the medieval one), a realm's era, a genre's eras for the other modules (fantasy: AN, MD, EM; modern: ST, MO; science fiction: NF, IS). Tribes, peoples and tongues, and supernatural courts have no fantastic switch of their own and always count as fantastic. Each core culture has six words restricted to each era its module offers (a span of up to four eras counts for each) and three fantastic words; Celtic has three fantastic. The pools the cells are filled from are in `scripts/north5c/content-pools.mjs`; the tags in `content-tags.mjs`.
2. **Ranks by sex, not without rank.** Titles use `{R}`: each culture's ranks are pairs, the man's form first (Duke and Duchess, Earl and Countess, Baron and Baroness, Prince and Princess, Laird and Lady, and in native settings Freiherr and Freifrau, Graf and Graefin, Brenin and Brenhines); where a rank has no woman's form (Jarl, Thane, Hersir) the woman is "Lady". A native form is written `{man/woman}`. A base title that holds a rank before "of" ("King of the Five Kingdoms") takes the pair of the bearer's sex.
3. **A place in a title, group, realm or craft name is a settlement's, never a person's.** The `[place]` of those modules is filled from settlement names only (the culture's, its family's, then General's); the bare person's name that 5b gave a German place beside a feature word and 5c gave a bracket that would not fill are not used there.
4. **Native bynames per nation.** A Celtic nation draws only its own forms in the family-name and title modules: Welsh never "Mac" or "Nic", Scottish never "ap", "ferch" or "Ó", Irish daughters "Ní" (not "Nic"), Cornish none of them; Celtic's native rank forms are Irish, so the other nations draw English ranks there.
5. **Tribes show their culture.** Tribes and kin groups take the signature share as a quota (a batch of five shows two own names, not "about two"), and each of the eight traditions draws on a stream of its own, so the same seed no longer gives the same "Spear Folk" in all of them.
6. **Guild forms.** English livery forms ("Worshipful Company of …", "Honourable Company of …", "Chartered …") are for English only; a German, Scottish, Welsh, Irish, Cornish, Norse or Scandinavian guild takes "Guild of the …", "Brotherhood of the …" or "… Hall". A name that all but names a real London livery company (its trade is a real company's) is not drawn: `isRealGroup` knows them.
7. **Scandinavian cells.** A culture's own rows count for that culture alone: Scandinavian no longer reads Norse's rows, nor a Celtic nation Celtic's (`north5cRows`).
8. **The culture menu** highlights a stored tradition only where one culture is that tradition (Celtic, Steppe…) or the only one that reads it; a stored Germanic highlights nothing and shows its own label.
9. **Ship prefixes.** German craft take "SMS" (the Imperial navy, the steam age); Scandinavian craft "HDMS", "HNoMS" and "HSwMS", in the eras those navies used them. The British and American prefixes (HMS, RMS, USS) are not theirs.

### 14.2 Decisions for batch 5d

- **Modules:** money and coins, calendars and festivals, sky lore, events and eras, the three named things modules (arms and armour, treasure and relics, books and records), deities.
- **Content:** per brief §6 and §7 and the 5a counting, with era and fantastic tags from the start: each core culture at least 8 words per kind for the module's three main kinds (30 in all), 10 frames of its own, 6 era-restricted entries per era offered and 3 fantastic; Celtic 12 words and 4 shapes. 40% signature share; no noun twice in a batch.
- **Each module's own rules stand.** Money: translated names, native names only in the loanword setting, series values only from real historical ratios. Calendars and festivals: a culture's plain real month and day names stay blocked; festivals in English ("Summer's End", "Winter Nights"), counts only from real calendar systems. Deities: invented gods in English epithets, no real god's name as an invented god. Events and named things: no famous real event or object as a fixed name (the Battle of Hastings, Excalibur, the Stone of Destiny), added to the real-name list.
- **Baseline and fixtures:** a 5d M0 baseline of every non-core culture in the 5d modules before any 5d change; non-core cultures stay byte-identical; retired presets unchanged; every entry written to `docs/northern-europe-5d.md`; the loanwords looked up and recorded in `docs/loanwords.md`.

### 14.3 Batch 5d as built (16 November 2026)

- **Data:** `src/data/north5d.json`, generated by `scripts/make-north5d.mjs` from `scripts/north5d/`; one reader (`src/north5c.ts`) serves 5c and 5d. A frame may name the kind it is written for (a month, a festival, a moon; a constellation, a light) and is then drawn only for it.
- **Rosters:** money, events, calendars, sky lore, the named things and deities offer Welsh, Scottish, Irish, Cornish, Scandinavian and German; they read the legacy keys' tables (`engineAlias`) beneath their own words.
- **Share and cells:** each core culture has three lists of ten words and ten frames per module (Celtic four of each), six words restricted to each of the five eras and three fantastic; the signature share is 40%. A chosen kind, a series, the loanword setting and the module's other options keep the module's own draw.
- **Real names:** the real-name list gains 113 well-known real events and objects (`src/data/real-places.json`, `groups`).
- **Loanwords:** 33 looked up on collinsdictionary.com (`docs/loanwords.md`); Hacksilver is not in Collins and became Cut Silver.


> **Note, 17 November 2026.** The sibling-distinctness amendment (docs/second-tier-tables-brief.md §10) applies to the core cultures of this brief as well: the nations, Norse and Scandinavian, Anglo-Saxon and Norman and British, and each core culture against General, are held to its limits by tests/distinctness.test.ts.
