# One sentence: culture, era and world in every module – brief

**Status:** agreed with Kenny, 13 November 2026. Brief 2 of the table overhaul (`shared-lens-and-coverage-brief.md` §10). It lands **after** the lens corrections (`lens-corrections-prompt.md`) and **before** the nameForge core brief, which then ports one sentence model instead of three. Implement in the milestones of §9.

## 1. What changes

The module sentences set culture, time and genre in three different ways (§2). This brief gives every module the same four links, built by one shared function and read from the lens:

> ‹English, later› ‹houses of any kind› of the ‹medieval› era, in a ‹historic or low fantasy› world, ‹across all of Britain›, …

| # | Change | Agreed |
|---|---|---|
| 1 | One shared **lens clause** (§4): culture, era, world, region | Same links, same order of choices, same wording in every module that has them |
| 2 | **Menus show only what a module can tell apart** (§5) | Worked out by probing the engines, written to a generated file; menus grow by themselves as tables land |
| 3 | **Culture menu** from the lens (§6) | English, early and English, later; Welsh, Scottish and Cornish go live where regions exist; one set of headings |
| 4 | **World** replaces both the realistic/fantastic switch and the genre links (§7) | One entry for realistic and low fantasy: "historic or low fantasy" to early modern, "realistic" from the steam age, "science fiction" in the future |

"World" is the user-facing word for what the lens calls style: the sentences already say "in a ‹realistic› world", and the vehicle modules keep their own "style" link.

### 1.1 Hard rules

1. **The engines are not touched.** No engine option, table or draw changes. The lens clause is a new way of *showing and choosing* the state the engines already take.
2. **Stored state doesn't change.** Sentence states, presets and history rows keep today's keys and values (`culture: celtic`, `region: WAL`, `fantastic: true`, `genre: fantasy`…). Nothing is migrated and no note is rewritten. Welsh, "high or epic fantasy" and the rest are views over those values (§6, §7).
3. **So output doesn't change.** `tests/fixtures/lens-baseline.json` and every other regression fixture must still match, untouched.
4. **A stored value is always shown and kept**, even when the menu rule (§5) would not offer it. It appears in its menu beside the offered choices until the user changes it.
5. **No new words.** No table under `src/data/` changes except `lens.json` and the new generated `lens-offers.json`.
6. Follow the existing conventions: Obsidian-free engines and sentence builders, sentences as plain segments, one seeded `mulberry32` stream per batch, British English with OUP punctuation in user-facing text (spaced en dashes; colons rather than dashes in label–value text).

## 2. Where the sentences stand

| Family | Modules | Today |
|---|---|---|
| A: era and a switch | route names, streets and districts, inns and taverns, buildings and landmarks, monuments and statues, settlement kit, events and eras, money and coins, the three named things modules, deities, sacred places, calendars and festivals, sky lore, peoples and tongues (era only), the six wild lands modules, seas and lakes, coasts and islands, sea charts | "of the ‹medieval› era, in a ‹realistic› world": `era` (seven codes) and `fantastic` (realistic or fantastic; "steampunk" in the steam age) |
| B: genre and a switch | the seven group-name families, the three bynames modules, ships and boats, spacecraft and stations, aircraft and airships, land vehicles, realms and polities | "for a ‹fantasy› world ‹of historic or low fantasy›": `genre` (fantasy, modern, science fiction) and `fantastic`, giving FL, FH, MR, MF, SF. Realms also has its own six eras; vehicles also have technology and style |
| C: neither | tribes and kin groups, native place names, exploration, expansion, river names, hyperspace charts | No era or genre |

Twelve sentences read one culture list (`ROUTE_CULTURES`); the rest each build their own, with their own headings.

## 3. Scope

**In:** every family A and family B module.

**Unchanged by this brief:**

- Family C. Tribes keep their traditions; exploration and expansion keep theirs; native place names and river names are reshaped in brief 3. Hyperspace charts keep their own sentence.
- The tribal `tradition` link in the group-name sentences: it stays as it is, where it is.
- Every link that isn't culture, era, world or region: kind, setting, tone, people, series, technology, vessel style, biome, scale and the rest.
- Module-specific rules on those four links (for example, supernatural courts in a modern world are always contemporary fantasy; near-future and interstellar eras unlock space biomes and scales). They are kept, applied on top of the shared clause.

## 4. The lens clause

### 4.1 One module

`src/lensView.ts`, Obsidian-free:

```ts
type LensField = "culture" | "era" | "world" | "region";

interface LensSegment {
  field: LensField;
  text: string;                 // what the sentence shows
  title: string;                // the tooltip
  choices: { id: string; label: string; title?: string; group?: string }[];
  current: string;
  fixed?: boolean;              // one choice only: drawn as plain text, not a link
}

/** The four links for a module in its present state, in sentence order; a module without one omits it. */
function lensClause(moduleKey: string, state: object): Partial<Record<LensField, LensSegment>>;

/** The state after one choice, with every knock-on reset applied. */
function applyLensChoice<S>(moduleKey: string, state: S, field: LensField, id: string): S;

/** The lens reading of a stored state, for history rows, preset descriptions and storyForge. */
function lensReading(moduleKey: string, state: object): { culture: string; era?: string; world?: string; region?: string };
```

Each sentence builder drops its own culture, era, fantastic, genre and region segments and places the segments `lensClause` returns. `applyLensChoice` replaces the matching cases in each module's own "state after one choice" function. Everything else in the builders stays.

`lens.json` gains, per module under `modules`, a `sentence` entry: its family (`A`, `B`, or `none`), and the names of the state fields that hold culture, era, fantastic, genre and region. Nothing about a module is hard-coded in `lensView.ts`.

### 4.2 Wording

| Link | Family A | Family B |
|---|---|---|
| Culture | as now, with the §6 labels | as now, with the §6 labels |
| Era | "of the ‹medieval› era" | "of the ‹pre-industrial› era" (§7.2) |
| World | "in a ‹historic or low fantasy› world" | "in a ‹historic or low fantasy› world" |
| Region | "‹across all of Britain›" or "in ‹the North›" (§6.3) | – (no family B module has regions) |

In family B the era and world links take the place of "for a ‹fantasy› world ‹of historic or low fantasy›". Where the old sentence ran on from that phrase (the sci-fi scale link in groups and realms, for example), keep the rest of the sentence reading naturally; show me each family B sentence before and after in the summary.

Tooltips: culture as each module has it now; era: "The age: decides what exists and how it is named"; world: "How real the world is: open magic and monsters, steam and brass, or as it really was"; region as now.

## 5. Menus show only what a module can tell apart

### 5.1 The rule

A choice appears in a module's menu only if choosing it can change that module's names. That is found by running the engines, not by reading the tables, so code paths count as well as data.

### 5.2 The probe

`scripts/make-lens-offers.mjs`, run by `npm run offers`, writes `src/data/lens-offers.json`. For each family A and B module:

- **Fixed inputs:** seeds 1, 42 and 2024; 12 names; every other link at its default; then again for **each kind** the module has, and for **each culture** the module offers today. A run that throws counts as an output of its own.
- **Two states "differ"** if any of those runs gives a different list of names.

It records:

| Entry | How it is found |
|---|---|
| `eras` | Family A: the seven codes in order, with adjacent eras that never differ merged into one **run**. Family B: the three fixed bands of §7.2, a band dropped if the module doesn't offer its genre |
| `worlds` | Per era (or band): `plain` always; `fantastic` only if switching `fantastic` on differs from off |
| `views` | `welsh` if (`celtic`, WAL) differs from (`celtic`, no region); `cornish` likewise with COR; `scottish` if any of SBL, SLO, SHH, NSI does. Only for modules with a region field |

The file is generated, committed and never edited by hand. A test regenerates it and fails if it is stale, so any brief that adds tables must run `npm run offers`; that is how the menus grow. If the script takes more than two minutes, tell me before trimming the probe.

### 5.3 Using it

- **Era link:** one choice per run. A run of one era has that era's label. A run that is exactly AN–EM, ST–MO or NF–IS has its band label (§7.2). Any other run is "‹first› to ‹last›" ("ancient to modern"). Choosing a run stores the era already stored if it lies in the run; otherwise MD if the run holds it, otherwise the run's first era.
- **World link:** the choices §7.1 gives for the stored era, less any the probe did not find. With one choice left it is `fixed`: plain text, no link.
- **Culture menu:** every culture the module offers today (no culture is removed), plus the `views` the probe found.
- A module with a single era run has no era link at all.

## 6. Culture

### 6.1 Labels and headings

Every culture menu in scope is built from the lens: the module's own keys, in lens order, under these headings. `General` comes first with no heading.

| Heading | Keys, in order, with labels |
|---|---|
| British Isles | `norman-british` **English, later** · `anglo-saxon` **English, early** · *Welsh* · *Scottish* · *Cornish* · `celtic` **Celtic** |
| Northern Europe | `norse` **Norse** · `dutch` Dutch |
| Western and southern Europe | `french` French · `iberian` Iberian · `roman` Roman and Italian · `greek-byzantine` Greek and Byzantine |
| Eastern Europe and the steppe | `slavic` Slavic · `steppe` Turkic and Mongol steppe · `ottoman` Ottoman |
| Middle East and Africa | `arabic-persian` Arabic and Persian · `egyptian` Egyptian · `ethiopian` Ethiopian · `swahili-omani` Swahili and Omani · `bantu` Bantu · `west-african` West African |
| South and East Asia | `indian` Indian · `malay` Malay · `chinese` Chinese · `japanese` Japanese · `korean` Korean |
| The Americas | `american` American · `arctic` · `na-woodlands` · `nw-coast` · `aztec` Aztec · `maya` Maya · `andean` Andean |
| The Pacific | `polynesian` Polynesian · `hawaiian` · `maori` · `w-polynesian` |

Keys shown without a label keep the label their module gives them now. The headings and order go into `lens.json` (`menu`), replacing the `group` strings in `route-names.json` and the other modules' own heading lists as the source; the module tables themselves are not edited.

Labels replace ampersands and slashes with "and" ("Greek and Byzantine", "Roman and Italian", "Turkic and Mongol steppe"). History rows written from now on use the new labels; old rows are still matched by the old ones.

### 6.2 English

`norman-british` reads **English, later** and `anglo-saxon` **English, early**. They are the two periods of the lens culture `english`; the keys, the data and the defaults don't change. Guide text that says "Norman & British" or "Anglo-Saxon" as a culture name is reworded to match; the name of the built-in *Anglo-Saxon* people template is not.

### 6.3 Welsh, Scottish and Cornish

Views over (`celtic`, region), offered where the probe finds them (§5.2):

| View | Shown when the state is | Choosing it sets | Region link |
|---|---|---|---|
| Welsh | `celtic`, WAL | `celtic`, WAL | fixed: "in Wales" |
| Cornish | `celtic`, COR | `celtic`, COR | fixed: "in Cornwall" |
| Scottish | `celtic`, one of SBL, SLO, SHH, NSI | `celtic`, SLO (or the stored region if it is one of the four) | link: the four Scottish regions, no "all" |
| Celtic | `celtic`, no region or any other region | `celtic`, no region | as now: "across all of Britain" and all 12 |

- Where a module offers a view, the **Celtic** entry's region menu no longer lists that view's regions (choose Welsh for Wales). A stored state is still shown as its view.
- **Irish** stays inside Celtic until the Northern Europe tables give it data of its own.
- "All of Scotland" needs the engines to weigh a set of regions together; that comes with the Northern Europe tables, not here.
- English, later and English, early keep today's region link unchanged: "across all of Britain" and all 12.
- Changing culture away from a view clears the region, as changing between British and non-British cultures does now.

## 7. Era and world

### 7.1 World

World is a reading of what the engines already store.

| Era (family A) or band (family B) | `fantastic` off | `fantastic` on |
|---|---|---|
| AN, MD, EM · pre-industrial (genre `fantasy`) | historic or low fantasy | high or epic fantasy |
| ST | realistic | steampunk |
| MO · industrial and modern (genre `modern`) | realistic | contemporary fantasy |
| NF, IS · future (genre `scifi`) | science fiction | space opera |

- In family B the science fiction genre has no fantastic setting today, so the future band offers "science fiction" alone, as fixed text. In family A, "space opera" appears only where the probe finds it.
- Family B has no steam age of its own: steampunk is not offered there (ships keep it as a vessel style).
- Dieselpunk, cyberpunk and post-apocalyptic are in the lens but no engine can produce them yet. They are not offered; the style tables brief adds them.
- A run of eras that crosses rows of this table (§5.3) takes the row of the era it stores.

### 7.2 Era in family B

Family B modules store a genre, not an era. The era link shows it as one of three bands:

| Band label | Eras | Stored as |
|---|---|---|
| pre-industrial | AN, MD, EM | `genre: fantasy` |
| industrial and modern | ST, MO | `genre: modern` |
| future | NF, IS | `genre: scifi` |

The bands go into `lens.json` (`bands`). A module that doesn't offer a genre today doesn't offer its band.

### 7.3 Realms and polities

Realms stores both its own era (six, no steam age) and a genre. The era link shows the six eras as now. The world link is read from the genre and `fantastic` by §7.1. Choosing an era also sets the genre to match (ancient, medieval, early modern: `fantasy`; modern: `modern`; near future, interstellar: `scifi`), keeping `fantastic` where the new row has both settings. A stored state whose era and genre disagree is shown as it is (rule 4) until the era is changed. The steam age arrives in realms with the tables that give it forms, not here.

### 7.4 Vehicles

Ships, spacecraft, aircraft and land vehicles: genre and `fantastic` become the era band and world links as in §7.2; **technology** and **vessel style** stay their own links, untouched, and technology stays free of era (a Polynesian coal ship remains possible). Any rule that today ties a technology or style to a genre is kept.

### 7.5 Land modules

The six wild lands modules and the three seas and coasts modules keep early modern, steam age and modern as separate eras wherever the probe finds they differ. The lens's land band is for counting coverage only.

## 8. Tests

### 8.1 Before anything changes (M0)

`tests/sentenceBaseline.test.ts` with `tests/fixtures/sentence-baseline.json`, recorded with `CAPTURE_SENTENCE_BASELINE=1` and committed before any other change:

- for every family A and B module: the default sentence as text, and every choice of its culture, era, fantastic, genre and region menus;
- for every module-preset fixture and one new preset per module at non-default settings: the engine options it resolves to.

The second part must never change. The first is the "before" for the summary; M3 to M5 replace it with the expected new sentences and say so in their commits.

### 8.2 New

- **Round trip:** for every module and every reachable combination of the four links, `lensReading` then choosing those same values through `applyLensChoice` gives back the identical stored state.
- **Engine options:** every state reachable through the lens clause resolves to engine options that were reachable before.
- **Rule 4:** a stored value the probe doesn't offer is shown, listed in its menu and kept.
- **Views:** the §6.3 table, each row both ways; SBL shown as Scottish.
- **Offers:** the file is current (§5.2); hand-checked entries for inns and taverns, mountains, powers and factions and ships and boats.
- `lens-baseline.json` and all other regression fixtures: untouched and matching.

## 9. Milestones

| # | Milestone | Done when |
|---|---|---|
| M0 | Sentence and preset baselines | Committed before any other change |
| M1 | The probe: `npm run offers`, `lens-offers.json`, its tests | File generated and committed; I've been told how long the script takes |
| M2 | `src/lensView.ts`, the `sentence`, `menu` and `bands` entries in `lens.json`, round-trip tests | No sentence uses it yet |
| M3 | Family A sentences on the lens clause | Era and world links from the probe; fixtures match |
| M4 | Family B sentences on the lens clause | Groups, bynames, vehicles, realms; fixtures match |
| M5 | Culture menus: labels, headings, English periods, the three views | Every in-scope culture menu built from the lens |
| M6 | History labels, preset descriptions, guide text, `README.md` and `docs/vocabulary-pools.md` | Docs describe the one sentence and `npm run offers` |

`npm test` and `npm run build` pass at the end of each.

## 10. Out of scope

- Any engine or table change; new cultures, eras or worlds no engine can yet produce.
- Tribes, exploration, expansion, native place names, river names, hyperspace charts.
- Irish, German, Italian, and French, Dutch, Iberian or American in modules that don't have them.
- "All of Scotland" and "all of England" as region choices.
- The steam age in realms; any era in the family C modules.
- A module registry: the core brief's. `lensClause`, `applyLensChoice` and `lensReading` are the surface the core will expose.

## 11. Changes to the overhaul plan

Three items the plan in `shared-lens-and-coverage-brief.md` §10 gave to this brief move, because each needs words that don't exist yet:

| Item | Now in |
|---|---|
| Realms gains the steam age | Brief 7, style and era tables |
| World place names eras become the seven | Brief 3, with the module's retirement |
| Land band in the land modules' menus | Dropped: the menus keep the three eras wherever they differ (§7.5) |
