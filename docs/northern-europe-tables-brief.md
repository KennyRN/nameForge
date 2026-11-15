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
