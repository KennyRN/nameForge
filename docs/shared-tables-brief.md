# Shared tables: people, places, lexicon and creatures – brief

**Status:** agreed with Kenny, 14 November 2026. Brief 4 of the table overhaul (`shared-lens-and-coverage-brief.md` §10). Lands after the place split fixes (`place-split-fixes-prompt.md`). Implement in the milestones of §10.

## 1. What changes

Most modules can only say "[founder] Peak" or "Lands of [holy person]". This brief gives every culture the tables to fill those slots, and one filler that every module uses.

| # | Change | Agreed |
|---|---|---|
| 1 | **People tables** per culture: given names, surnames, regnal names, holy names (§3) | Curated real lists |
| 2 | **Starter packs** built from the same lists, for generated names (§4) | Both real and generated, by choice |
| 3 | **One filler** for every bracket slot in every module (§5) | Shared |
| 4 | The **people link** becomes three-way, defaulting to filled (§6) | Filled by default; placeholders stay a choice |
| 5 | A shared **core lexicon** replaces the modules' own copies (§7) | Replace, keep extras |
| 6 | Shared **mythic creatures** per culture (§8) | Agreed in the plan |

### 1.1 Hard rules

1. **Saved presets don't change.** A preset or saved state with `people: placeholders` or `people: invented` gives the same names as now, except where the lexicon (§7) changes a word list it draws from. Lexicon changes are listed per module in their milestone's commit.
2. **The new default changes new states only.** A sentence opened fresh, or a preset with no `people` key, gets the new default (`real`). Fixtures recorded at default settings are replaced at M5 and the commit says which.
3. **No real person's full name.** Given names and surnames are drawn separately. A safeguard list (§3.5) blocks combinations that make a famous real person ("James Cook", "Francis Drake").
4. **Prior decisions hold:** native flora and fauna in newly explored and settled lands stay bracketed ([native bird], [native tree]); output is in English, with names themselves romanised in their usual English spelling.
5. Follow the existing conventions: Obsidian-free engines, one seeded `mulberry32` stream per batch (the filler draws from the same stream), British English with OUP punctuation in user-facing text.

## 2. Where the slots stand

The tables and engines produce about forty bracket labels. The main ones, with how each module makes them today:

| Labels | Made by | Today's "invented" mode |
|---|---|---|
| [person], [personal name], [founder], [explorer], [commander], [conqueror], [official], [patron], [sponsor] | groups, wild lands, waters, routes, colonial and British engines | epithet people: "the Red Captain", "Old Thorne", "the Fox" |
| [monarch], [ruler], [sultan], [royal woman], [dynasty] | colonial engine, realms | – |
| [holy person] | most | "Saint {saintName}" from one list |
| [surname], [house] | groups | only for General, Celtic and Germanic traditions |
| [place], [homeland place name], [earlier or district name], [town] | most | invented-town pools |
| [deity], [god], [local deity] | deities link | invented deity |
| [folk], [folk group], [tribal name], [people] | tribes link | – |
| [realm], [river] | realms, rivers | – |
| [native people], [native place], [native bird] and the other native flora and fauna | colonial engine | stay bracketed (rule 4) |
| [specific], [generic], [description], [aspiration], [associated with] | recipe shapes | stay bracketed |

## 3. People tables

### 3.1 The file

`src/data/people.json`, keyed by lens culture. Each culture has two **periods**: `historic` (AN, MD, EM) and `modern` (ST, MO). Near future and interstellar draw from `modern` with 25% of names from other cultures' `modern` lists, weighted towards the same lens family.

Each period holds:

| List | What it holds | Core | Second tier |
|---|---|---|---|
| `male`, `female` | given names, weighted by how common they were | 60 each | 30 each |
| `surnames` | where the culture used inherited surnames in that period; otherwise absent | 60 | 30 |
| `regnalMale`, `regnalFemale` | names rulers took | 15 each | 8 each |
| `holy` | names holy people are known by (saints, sages, hermits) | 24 | 12 |
| `holyForms` | how a holy name is said, with weights: "Saint {n}", "the Venerable {n}", "Sheikh {n}", "Master {n}" | as fits | as fits |
| `rulerForms` | "King {m}", "Queen {f}", "Emperor {m}", "Khan {m}"… with weights | as fits | as fits |

### 3.2 Cultures

- **Core:** `english` split by legacy key: `anglo-saxon` (historic only) and `norman-british` (both periods); `welsh`, `scottish`, `irish`, `cornish`, `scandinavian`, `german`.
- **Second tier:** all 22.
- **Local cultures** use their lens family's nearest second-tier culture (`maori`, `hawaiian`, `w-polynesian` → `polynesian`; `ottoman` → `arabic-persian` with Turkish names added as a 10-name extra; and so on). The agent lists the mapping.
- **Celtic** with no region draws evenly from welsh, scottish, irish and cornish. The Welsh, Scottish and Cornish views use their own tables, so the views now differ in every module that fills slots.
- **General** draws from `norman-british`.

### 3.3 Content rules

- Real, attested names of the culture and period, in their usual English spelling (Alfred, Edith, Wulfric, Ragnhild, Siobhán as Siobhan only if that is the usual English form).
- Weighted by how common they were. No more than a fifth of a list from royalty or saints.
- Ancient cultures (Roman, Egyptian, Greek and Byzantine) use their ancient names in `historic`; Greek and Byzantine may mix ancient and Byzantine names, tagged `AN` or `MD` so the filler can prefer the era.
- Every list is written to `docs/people-tables.md` per culture, for Kenny's review, before it is wired in.

### 3.4 Slot forms

`people.json` also holds, once, how each person slot is said (weights fixed here; `{g}` given, `{s}` surname, `{r}` ruler form, `{h}` holy form):

| Slots | Forms |
|---|---|
| founder, explorer, commander, conqueror | `{s}` 60, `{g} {s}` 15, `{g}` 25 (without surnames: `{g}` 100) |
| official, patron, sponsor | `{s}` 50, title + `{s}` 30 ("Governor Hale"), `{g} {s}` 20 |
| person, personal name | `{g}` 85, `{s}` 15 |
| monarch, ruler, sultan | `{r}` 50, regnal name alone 50 |
| royal woman | `regnalFemale` alone 70, "Queen {f}" 30 |
| dynasty, house | `{s}` 70, "House of {s}" in "[house]" slots only |
| holy person | `{h}` |

Titles for officials come from the titles module's office kind in that culture.

### 3.5 Safeguards

`people.json` holds a `blocked` list of full names of famous real people (explorers, rulers, saints with surnames, modern celebrities). The filler redraws if a given name and surname make one. Seed it with at least 200 entries across the core and second-tier cultures.

## 4. Starter packs

- Each culture's period lists become **built-in templates** in `builtin-templates.json`, in the people template format with `## Male`, `## Female` and, where present, `## Surnames` sections: "English, later (historic)", "Welsh (modern)" and so on. They appear in Create Pack's Templates beside the existing four, which are unchanged.
- **Generated names** (§6) train the Markov generator on the same lists in memory: given names from `male`/`female`, surnames from `surnames`. The model is built once per culture and period and cached.
- Lists too small for the Breakdown minimum of 20 are not offered for generation; the filler falls back to real names for that list.

## 5. The filler

### 5.1 One module

`src/fill/` (Obsidian-free) exports one function used by every module after its engine has run:

```ts
fillSlots(name: string, ctx: { culture: string; era: string; region?: string; mode: "real" | "generated"; rng: () => number; series?: Map<string, string> }): string
```

Engines keep producing brackets (they run as in placeholders mode); the filler replaces each bracket it knows. Unknown labels and those of §2's last two rows stay as they are.

### 5.2 Sources

`src/data/fill.json` maps every label to a source. The table below is fixed; the agent adds any label it finds that the table misses, and lists them.

| Labels | Source |
|---|---|
| person slots (§3.4) | people tables, culture and period of the state |
| [holy person] | people tables' `holy` with `holyForms` |
| [surname] | people tables' `surnames`; for cultures without, the family names module in that culture |
| [place], [town], [homeland place name] | settlement names, the state's culture and era, home, size any, one word or two only |
| [earlier or district name] | settlement names in the same culture's earlier period (`anglo-saxon` for `norman-british`), else as [place] |
| [deity], [god], [local deity] | the deities module, kind deity, same culture and era |
| [folk], [folk group], [tribal name], [people] | tribes and kin groups, the culture's tradition (lens mapping), short form |
| [realm] | realms and polities, short form |
| [river] | the river engine, as rivers and inland waters' river kind |

### 5.3 Rules

- **Possessives and articles:** "[founder]'s" takes the filled name's possessive ("Hale's", "Saint Botolph's"); "of the [folk]" drops a duplicate "the" ("Valley of the Ash Folk"). A filled name never starts a result with a lower-case "the".
- **Series mode:** each label is filled once per batch and reused, so a series reads as one founder's range.
- **Within one name**, two slots of the same label get different fills.
- **Era:** the filler uses the state's era; modules with only bands (group families, bynames, vehicles) use the band's middle era (MD, MO, IS).
- **Mode `generated`** uses §4's models for given names and surnames; everything else as `real`.

## 6. The people link

Every module that has a people link today keeps its place in the sentence, now "with ‹…› for people and places":

| Value | Text | Behaviour |
|---|---|---|
| `real` (new default) | real-world names | the filler, real lists |
| `generated` | generated names | the filler, starter models |
| `placeholders` | placeholders | as now |
| `invented` | invented names | as now (epithet people, invented towns); offered only in the modules that offer it today |

Modules whose output has fillable brackets but no people link (the agent lists them) gain the link. A stored value is always shown and kept (brief 2 rule 4).

## 7. Core lexicon

### 7.1 Lists

`src/data/lexicon.json`, one list per kind, entries tagged with the vocabulary's tags (`c`, `e`, `t`, `h`, culture exclusions) so the lens filters them:

colours · metals · gems and stones · numbers and ordinals · virtues and vices · weather · seasons and times of day · trades and crafts · directions and positions · sizes and ages.

### 7.2 Merging

- Find every module list that is one of these kinds (colour alone is in at least seven places: place words, groups, waters, hill figures, hyperspace, money, bynames). List them in `docs/lexicon-merge.md`: each list, its module, size and how it is read.
- The shared list is the union of the module lists, de-duplicated, with the tags of the module entries carried over.
- Each module reads the shared list, filtered by its lens state, **plus extras**: words only that module needs (heraldic tinctures in arms, hull colours in ships). An extra is a word in a module list that would be wrong in most other modules; the agent proposes them in the merge doc.
- **Closed sets stay closed:** a module that draws a real system (the five Chinese elements, the compass, calendar names) keeps its own list.
- Weights: where module lists weighted a word differently, the shared entry takes the median, and a module may keep a per-word multiplier as an extra.

## 8. Mythic creatures

`src/data/creatures.json`: per lens culture, 12 creatures for core cultures and 8 for second tier, plus a General list of 30, each with:

- its English name or the English word for it (troll, wyrm, barghest, kelpie, water horse, fox spirit, thunderbird), loanwords only where a standard English dictionary has them;
- habitats from: mountain, forest, water, sea, moor, desert, sky, underground, home;
- tone tags.

Modules that name creatures read it alongside their own pools, by habitat: inns (signs), the six wild lands, the seas and coasts modules, ships, monuments and the named things modules. The 9-entry supernatural being category and the sea monster pool become extras where their words aren't in the shared list.

## 9. Tests and coverage

### 9.1 Before anything changes (M0)

`tests/sharedTablesBaseline.test.ts` with `tests/fixtures/shared-tables-baseline.json`: seeds 1, 42 and 2024, 12 names, for every preset fixture and one saved preset per module with `people: placeholders` and one with `people: invented`. Recorded with `CAPTURE_SHARED_TABLES_BASELINE=1`, committed first. It changes only at M7 and M8, for the lexicon and creatures, with each changed state listed.

### 9.2 New

- Every bracket label in every module's output across the probe's states is either filled in `real` mode or on the stay-bracketed list. A test sweeps it.
- Possessives, articles, series reuse and different fills within one name.
- The blocked-name safeguard, with a seeded test that forces a blocked pair.
- Templates: each new template loads in Create Pack and meets the Breakdown minimum.
- Coverage: a **shared tables** section per culture (list sizes against §3.1, creatures against §8). Module cells are not credited with the shared tables.

## 10. Milestones

| # | Milestone | Done when |
|---|---|---|
| M0 | Baseline | Committed first |
| M1 | `src/fill/`, `fill.json`, the sweep test; placeholders mode unchanged | Every label mapped or listed as staying |
| M2 | Core people tables, `docs/people-tables.md` | Written for review; **stop and send Kenny the doc** before M3 |
| M3 | Second-tier people tables | Reviewed doc updated |
| M4 | Starter templates and generated mode | Templates in Create Pack |
| M5 | The people link, default `real`, in every module | Default fixtures replaced and listed |
| M6 | Safeguards and the remaining sources (deity, folk, realm, river, place) | Sweep test passes |
| M7 | Core lexicon, `docs/lexicon-merge.md` | Changed states listed |
| M8 | Mythic creatures; coverage; offers; README and `docs/vocabulary-pools.md` | Ratchet re-recorded once |

`npm test` and `npm run build` pass at the end of each.

## 11. Out of scope

- Native names for native peoples and places in new lands (they stay bracketed; the invented languages module may fill them later).
- The per-slot name sentence in settlement names: unchanged, though its list options may later offer the new templates.
- Region-level name lists inside a culture (Northern English names, Highland names): brief 5.
- Changes to the retired modules' presets.

## 12. Amendment: the people tables review (14 November 2026)

Added after the review of `docs/people-tables.md`. It amends §3, §5.2 and §9 and does not rewrite them. The rules apply to the core tables and to every second-tier table (M3).

### 12.1 New rules for every people table

Each rule that can be checked by code has a test in `tests/peopleTables.test.ts`.

1. **One spelling per name per list.** A name appears once in a list, in its usual English form. Variants of one name are duplicates (Edith and Eadgyth; Gwladus and Gwladys; Conor and Connor; Sadb, Sadhbh and Sive). Different names that share a root stay (Alexander and Alasdair; Donald and Dugald are different names; Dugald and Dougal are not).
2. **Old English names in one convention:** the modern English forms already used for most (Ethelfleda, Elgiva, Edburga, Aldgyth), with no `Ae-` or `Ea-` spellings beside them.
3. **German umlauts as `ae`, `oe`, `ue`** (Mueller, Schroeder, Krueger, Koenig, Jaeger, Foerster, Schaefer, Moeller, Koehler, Juergen), as Goetz already is; `ß` as `ss`. Scandinavian names keep dropping the marks (Bjorn, Soren, Sjoberg).
4. **Right sex.** A male name never appears in a female list or the reverse. Every saint is checked against their sex.
5. **People only.** No place names, name elements or words that are not names, and no gods or figures known only from myth or legend in `historic` lists, unless the name was also given to real people in the period. Legendary names revived later (Rhiannon, Olwen, Branwen) belong in `modern` only.
6. **No living royals.** Regnal lists do not include a name chiefly known from a living monarch or consort (Silvia and Sonja go; Margrethe and Harald stay, as old regnal names).
7. **English forms only** in holy and ruler forms, as the overhaul's output rule requires: "Sant", "Sen", "Naomh" and "Sankt" go (their weight goes to "Saint"), and "Kaiser" and "Kaiserin" become "Emperor" and "Empress". Jarl and Margrave stay; both are English words.
8. **Saints' share by weight, not count.** Names flagged `r` or `s` carry at most a fifth of a list's total weight, as well as at most a fifth of its names. The test checks both.
9. **Era tags within a period.** The `modern` period runs from about 1750 to now, so a name may carry the era tags `ST` and `MO`. Every `modern` given name carries `ST`, `MO` or both. The filler draws 80% of the time from names tagged with the state's era, and NF and IS prefer `MO`. Each `modern` given-name list holds at least 15 names tagged `ST` only, 15 tagged `MO` only and 12 names given in the last thirty years (the table's `recentMale` and `recentFemale`), all tagged `MO`. The same applies in `historic` where a table spans eras very differently (Greek and Byzantine, Roman, Egyptian).

An entry in `people.json` is `[name, weight, flag, eras]`: the flag is `r`, `s` or empty, and the eras are space-separated tags.

### 12.2 Existing templates are the source

Three cultures already have a built-in people template written by Kenny. They are the source for those tables, not something to rebuild.

| Template | Table it feeds |
|---|---|
| *Old Cornish* (149 male, 73 female) | `cornish` historic `male` and `female` |
| *Anglo-Saxon* (77 male, 25 female) | `anglo-saxon` historic `male` and `female` |
| *Victorian, England* (168 male, 168 female) | `norman-british` modern, names tagged `ST` |

- Every name in the template goes in the table, one spelling per person (rule 1). The template keeps its variants for Markov training; the table takes one. Where a name appears both as a person and as the parish named after them, the table takes the person's form (Wendrona not Wendron, Newlina not Newlyn, Endelienta not Endellion, Breaca not Breage). The usual modern English spelling is used where one exists (Petroc, Piran, Samson, Constantine for Custentin), otherwise the template's form.
- Old Cornish is early medieval: its names are tagged `MD`. A shorter later set is tagged `EM` for late medieval and early modern Cornwall (Jago, Jory, Jowan, Pasco, Hicca, Peder, Kitto, Jenifer, Tamsin, Loveday and the common English names of the period). Nothing else is kept in the Cornish historic given-name lists.
- Rule 8 does not apply to Cornish historic: the early Cornish record is largely saints, and the saints' names were personal names. Weights are flat (5) for the template names and 3 for the `EM` set.
- Anglo-Saxon: the template's names all go in, and the table's other names fill up to 60, with rules 1 and 2 applied across both.
- Norman & British modern: the template's names are the `ST` part of the list, and the list may exceed 60 to take them all.
- List sizes in §3.1 are minimums.
- **No duplicate templates at M4.** Where one of these three templates covers a culture and period, M4 does not create a new template for it: generated names train on Kenny's template. The templates are not edited.
- In generated mode, Cornish `[place]` fills train on the built-in *Old Cornish Place Names* template.

### 12.3 Additions to §5.2: three more sources

| Label | Source |
|---|---|
| `[battle]` | the events and eras module, battle kind, same culture and era, short form |
| `[ship]` | ships and boats, same culture, technology matching the era |
| `[company]` | the trade family of group names (guilds, companies and trade), same culture and setting |

They are no longer on the stay-bracketed list; `fill.json` maps each to its own source, with a resolver at M6.

### 12.4 Other decisions

- **Patronymics:** given name only, no "son of" forms. Weights by order, the flagging approach and plain letters are agreed. The "without surnames" slot forms and the sex shares stand. Titles for officials come from the bynames office list, with German reading General until it has its own list.
- **British affixes:** under a source filter the British shapes engine also skips the Market, Castle and Church affixes, as it skips stacked settlement generics. With no filter it is unchanged.
- **Stellar article:** only when called through a source filter under a space biome, the position-of-landmark form takes no "the" before a catalogue designation or a bracketed homeland name ("Coreward of HD 238298"). Retired presets are unchanged.
- **River names:** when the river engine is called from rivers and inland waters, the "River {name}" form applies only where the water word is "river" (so no "River Bear Brook"). Old presets are unchanged.
- **"Association":** left for the style tables brief.
- **Blocked list (M6):** it must catch "Richard Trevithick", since Trevithick stays in the Cornish modern surnames.

## 13. Amendment: fixes after a run of the real modules (15 November 2026)

Added after a run of the modules at seed 42, default settings and `people: real`. It amends §5, §7, §8 and §3 and does not rewrite them. The core brief comes after the table overhaul (briefs 5 to 7), not next.

### 13.1 Fixtures

The brief always meant the lexicon and creatures to change output (§1.1 rule 1). These may be re-recorded **for lexicon and creature changes only**: `tests/fixtures/settlement-engines.json`, the tone brief snapshots and any other frozen fixture. Before re-recording, every changed entry is diffed and the only differences must be words from a merged lexicon list or the creatures table; any other difference is a bug to fix. Each commit lists every re-recorded fixture and its count of changed entries. Retired presets (place-split baseline parts 1 and 2) still must not change, except for lexicon words, checked the same way.

M7 and M8 then stand as written: every module that held a merged lexicon list reads the shared list plus its extras, and creatures reach every module §8 names (inns, the six wild lands, the seas and coasts modules, ships, monuments, the named things modules) by habitat.

### 13.2 Filler fixes (amends §5)

1. **Place fills keep their plain-English form** ("Moot", "Grove", "Hollow", "Edge Hut", "Alder Valley"). They are not filtered. One guard only: a fill whose last word is the same generic as the feature it names ("Valley of Alder Valley", "Ashhill Hill") is redrawn, up to ten times.
2. **No unfilled `[place]` in real mode.** The chain is: settlement names in the culture; settlement names in the nearest lens-family culture that has one; General. Likewise `[homeland place name]` and `[town]`.
3. **No affix stacking after a fill.** Under a source filter the British engine skips its "-by-" and "-with-" affixes, and the colonial engine its equivalents.
4. **Titles match the person's sex.** When a title is female or male, the given name is drawn to match.
5. **Bare title slots** ([sir], [lord], [sire] and the like) fill as title plus name ("Sir Hugh's Army Road") or as a surname, never as the title alone.
6. **Person slots in place names from the steam age on.** In every place module, from ST onward and in stars and space always, `[person]` and `[personal name]` use the founder forms (surname-led). Before ST they keep the person forms.

### 13.3 British dialect words (amends §3 of the place briefs)

Every word in `regionTags` (in `wilds.json`, `waters.json` and `places.json`) is a British dialect word. It is drawn only for the lens's `british` culture group and `norse`, and has weight 0 for every other culture, in every module that reads it.

### 13.4 Aztec, Maya and Andean tables (amends §12)

The §12 rules apply to these three tables, which did not yet meet them: rulers flagged `r` and lists filled with ordinary names, a `modern` period (Spanish given names tagged by era, with the surnames each people carries now), and the per-culture corrections in the commit. Roman and Egyptian have no `modern` period; their later eras resolve to Italian and to Arabic and Persian respectively. Kenny's template names stay: Hengest, Horsa, Wealhtheow and Beadohild remain in Anglo-Saxon at the lowest weight, and Andersson and Andersen-type pairs stay as separate names.

## 14. Amendment: filler polish (15 November 2026)

Added after a run of the real modules following §13. It amends §5 and §13 and does not rewrite them.

### 14.1 No repeats within a batch (amends §5.3)

Outside series mode a fill is not reused within one batch until its list has nothing left. The filler keeps the fills used so far for each label and draws again (up to 40 times, and from the names not yet used) when a fill repeats; once a list has run out, a repeat is allowed. Ten Aztec, Maya or Andean founders at seed 42 no longer repeat a name.

### 14.2 Old personal names in old place names (amends §5.2)

A `[personal name]` that the British shapes source brings, or that an "-ing", "-ings", "-ington" or "-ingham" ending follows in any module, is an old personal name: it draws a man's given name from the historic table of the people who coined such names, whatever the state's culture or era. The new label `[old personal name]` (source `oldPerson`) is what the British shapes source gives when the filler follows; with `placeholders` the engine still says `[personal name]`. The weights are in `fill.json` (`oldNames`): Anglo-Saxon by default; Scandinavian 50% in NTH, EMD and EAN and 70% in NSI; Welsh in WAL; Cornish in COR; Scottish in SBL, SLO and SHH. "Henrying Tarn" becomes a name like "Godricing Tarn".

### 14.3 Folk fills stay short and suit the biome (amends §5.2)

`[folk]`, `[folk group]`, `[tribal name]` and `[people]` fill with at most two words after an optional "the", and are drawn in the state's biome: the biome the module has, else temperate for a British culture at home, else the folk's own homeland. No mango or millet on a temperate British coast.

### 14.4 Explorer's mood at home (amends §13.3)

The home multiplier for the explorer's-mood shapes in `wilds.json` is lowered (0.1 to 0.015) so that the share at home is under 1.5% in every wild lands module again, as it was before the dialect words were kept to the British. The test is back at 1.5%. The other three tests loosened in §13.3 stay as they are.

### 14.5 Founder forms in the place modules (confirms §13.2 item 6)

Lands and territories, farmland and countryside, hills and valleys, and rivers and inland waters run on the wild lands engine, whose filler call already passes the founder-forms switch (`placePersonsAsFounders`) from the steam age on, so they use the founder forms like the six wild lands. No change was needed; a test now holds it for every place module.
