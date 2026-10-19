# Urban group and settlement names – brief

**Status:** agreed with Kenny, 18 October 2026. Implement in the milestones of §10. The data the module needs is fixed in `settlement-names.json` (delivered with this brief); don't re-derive or reweight it.

## 1. The line-up

### 1.1 The new urban group

A new section group, `urban`, with the label **urban** (lowercase, like the others). In `SWITCHER_ORDER` it sits straight after place names:

> markov · place names · **urban** · seas and coasts · group names · bynames and titles · vehicles · advanced

Its modules, top to bottom:

| # | Module | Id | From |
|---|---|---|---|
| 1 | settlement names | `settlementNames` (new) | – |
| 2 | streets and districts | `streetNames` | place names |
| 3 | inns and taverns | `innNames` | place names |
| 4 | buildings and landmarks | `buildingNames` | place names |
| 5 | settlement kit | `settlementKit` | advanced |

Streets, inns and buildings keep their current order relative to each other. The group opens on settlement names the first time; after that it remembers the last module used, as every group does.

### 1.2 What's left behind

- **Place names:** native place names, exploration into new lands, expansion into settled lands, route names, sacred places.
- **Advanced:** name ageing, name takeover, events and eras, money and coins, calendars and festivals, sky lore.

Moving modules changes no module ids, presets, history labels or saved state. Update the `// … brief §1.1: after …` position comments in `sections.ts` to say where each module now sits.

### 1.3 Icons

Kenny supplies the urban group's SVG icon (and, if he gives one, the settlement names module's icon) in the Claude Code prompt. If the module has no icon of its own, it uses the group's. Register them the way the vehicles SVG was registered (`icons.ts`, `GROUP_ICONS`, `SECTION_ICONS`). Don't invent or substitute an icon: if none is supplied, stop and ask.

## 2. Settlement names: what it is

A settlement-only view of the three existing place-name engines:

| Setting | Engine | Same as |
|---|---|---|
| native | British (part 1 shapes, rendered) and world place names | native place names |
| in new lands | colonial part 2 | exploration into new lands |
| in settled lands | colonial part 2a | expansion into settled lands |

It draws only names a settlement would carry: habitation names (town, farm, burgh, minster, market, port and the like), plus the features towns grow up at (fords, bridges, wells, hills, clearings, river mouths and so on). Bare landscape names (a moor, a marsh, a mountain, a lake, a province) are never drawn. A size choice then steers the names towards a hamlet, village, town, city or great city.

**The source modules are untouched.** Native place names, exploration and expansion must produce exactly the same names for the same seed after this work as before (§9 has the regression test). Everything new is opt-in through new engine options.

- **Module label:** `settlement names`.
- **History name:** `SETTLEMENT_NAMES_HISTORY_NAME = "settlement names"`. Add it to the history-label → section lookup in `sections.ts`, and check that "settlement names" and "settlement kit" can't be mistaken for one another.

## 3. The sentence

The module's sentence leads with the size and the setting, then reuses its source module's own sentence after a colon:

- **Native, British:** "‹Settlement› names, ‹native›: ‹British› from ‹all of Britain›, set in ‹any part› of ‹Britain›"
- **Native, world culture:** "‹Town› names, ‹native›: ‹Chinese› from the ‹Imperial› era, set in ‹their homeland›"
- **In new lands:** "‹Village› names, ‹in new lands›: ‹General explorers› in ‹wild and unsettled lands› across ‹unknown country›"
- **In settled lands:** "‹City› names, ‹in settled lands›: ‹General incomers› who are ‹ruling over the locals› across ‹unknown country›"

**First link: size.** Choices: Settlement (any size, the default), Hamlet, Village, Town, City, Great city. The link is capitalised as the sentence's first word.

**Second link: setting.** Choices: native (the default), in new lands, in settled lands.

**After the colon:**

- **Native:** the culture list from `renderNativeSentence` without "British river". The British branch keeps the region and land clauses but drops its " place names" words. The world branch keeps the era link (where a culture has more than one era), the land clause and the Interstellar space clause, again without " place names".
- **In new lands / in settled lands:** `renderColonialSentence`'s clauses unchanged: tradition, context, land, and alien life under a space biome.

Factor the shared clause-building out of the two existing renderers rather than copying it, so all three stay in step.

**State is the module's own.** It keeps its own culture, era, region, tradition, context, land, aliens and size, so changing settlement names never changes native place names or the colonial modules, and vice versa. Give its land choices their own keys (e.g. `settlement:british`, `settlement:world:<id>`, `settlement:colonial:2`, `settlement:colonial:2a`).

Results render exactly as the source module renders them (British overlay wording, world etymologies, colonial wording), with the same quantity pill and insert options.

## 4. Sizes

| Key | Label | Code in the data |
|---|---|---|
| `any` | settlement | – (no size filter) |
| `hamlet` | hamlet | `h` |
| `village` | village | `v` |
| `town` | town | `t` |
| `city` | city | `c` |
| `great` | great city | `g` |

Village, town, city and great city match the streets module's and the kit's sizes, so the kit can pass its size straight through (§7). Labels are the same in every era, including Interstellar.

**Size filter:** an item (generic, affix form, template, list word) is eligible at a size only when its size code string contains that size's letter. At `any`, every item in the file is eligible, and nothing outside the file ever is.

**Fallback:** if a size leaves nothing to draw (an engine would throw "No eligible…" or a world era has no template at that size), step down through `fallbackOrder` (great → city → town → village → hamlet) to the first size that works. Then show a status notice, for example "Norse names don't run to a great city; these are city names." The data check found eight such cases, all great city: Anglo-Saxon Modern, Norse Viking and Interstellar, Roman/Italian Medieval, West African Interstellar, Maya Interstellar, and Korean Joseon and Interstellar.

**List words:** if a filtered list has no word at the chosen size, fall back to any word in that filtered list, never to an unfiltered word.

## 5. The data file

Place `settlement-names.json` at `src/data/settlement-names.json` as delivered. Its keys:

- **`sizes`, `fallbackOrder`:** as in §4.
- **`generics`:** generic id → size codes. These are the British part 1 generic ids, which the colonial engine inherits, plus the colonial-only ids (colonial settlement, military and administrative, new landscapes, local generics, Islamic, space settlement). **A generic not listed is never drawn.** That excludes every territory, every bare river, lake, mountain, moor, bog and cliff, graves, execution sites, boundaries and the like.
- **`spaceSiteGroups`:** under a space biome, every generic in these colonial landscape groups (planet surface, moons, orbits, belts) is eligible at hamlet and village. Other space landscape groups are not.
- **`affixes`:** affix type id → form text → size codes. `"*"` covers every form of a type whose forms are slot-filled (owner by status, owner by family, dedication, location). `city` is the colonial City affix. A form not listed is never drawn.
- **`world`:** culture id → `eras` (era id → template string → size codes) and `lists` (list key → word → size codes).
  - A template not listed for its era is never drawn; the listed ones keep their own weights.
  - A list key present here is filtered wherever the module looks that list up, including inside nested list entries (e.g. Anglo-Saxon Modern's `place` → `{spec}+{gen}`) and in era lists of the same key. Words are matched without their `|plural` or trailing `~`. A list not present is used as it is.

The file was checked against the current data: every generic id, affix form, culture, era, template string and list word in it exists. Keep that check as a test (§9).

## 6. Engine changes

All additive, and all behind a new option that the source modules never pass.

### 6.1 British (`placeShapes.ts`) and colonial (`colonialShapes.ts`)

- **New option:** a `settlement` option, `{ size: SizeKey }` (or the size plus the parsed data, whichever keeps the engines free of the JSON import if that's the existing pattern).
- **Side split:** when it's set, the engine runs exactly as with `feature: "settlement"` today. Settlement groups are drawn, with landscape groups at the region's `landscapeShareSettlement` (British) or the colonial engine's existing share.
- **Filters on top of that:**
  - Generic weight × 0 for any generic not in `generics` (or `spaceSiteGroups`), or not at the chosen size. Groups left empty drop out, as the existing filters already do.
  - Affix forms not in `affixes`, or not at the size, are dropped; an affix type left with no forms drops out.
- **Fallback (§4):** catch the "No eligible…" error per size and step down.
- **Untouched:** the British rendering overlay and the colonial wording stay exactly as they are.

### 6.2 World (`world/engine.ts`)

- **New option:** `WorldOptions.settlement?: { size: SizeKey }`. When it's set:
  - The era's templates are cut to those listed for the culture and era, at the size, with their own weights.
  - Lists in `world[culture].lists` are filtered as in §5, at the size, with the list-word fallback of §4.
- **Biome swaps:** if a swapped list is also a filtered list, filter the kept entries and leave the biome's replacements as they are. Biome words are landscape words and are already site-like.
- **No templates at the size:** use the size fallback.

### 6.3 One entry point

Add `generateSettlementNames(options)` in a new `src/settlement/names.ts`. It takes the setting, the source module's own options, the size, count and seed, calls the right engine with the `settlement` option, and returns names, seed and notices in the shape the modal already renders for each engine. The modal and the kit (§7) both call it.

## 7. The settlement kit draws from settlement names

Today the kit's town and its six neighbours come from `routePlace()`, which draws from `townPool()`: 300 native place names at seed 1789, from the British recipe or the culture's first world era, with no size and no settlement filter.

**Change:** in `buildContext`, for any era that isn't a future era and any culture whose `townSource()` is defined, draw the town and neighbours from a settlement names pool instead:

| Input | Value |
|---|---|
| Setting | native |
| Culture | `townSource(culture)`: `britain` → British, otherwise the world culture id |
| Era | the world culture's first era (as `townPool` does today) |
| Region | the kit's region, for British only, and only if it's a place-shape region code; otherwise all of Britain |
| Size | the kit's size (`village` → village, `town` → town, `city` → city, `great` → great city) |
| Pool | 300 names at seed 1789, cached by culture, size and region |

Everything else in `place()` stays:

- **Checks:** the holy-names check (`holyNamesIn`), the block lists, the `[` check and the no-repeat rule.
- **Fallback:** the numbered fallback, and falling back to `routePlace()` if the pool is empty.
- **Notices:** size fallback notices are not shown in the kit.

**Unchanged:**

- **Future eras:** still `groupTown("SF", …)`.
- **Cultures with no `townSource`** (Greek & Byzantine, steppe) and the sensitive cultures (Polynesian, Andean): keep their current path.
- **Every other `{town}` user:** route names, group names and bynames still use `townPool()` as now. This change is for the kit only.

Expect the kit's existing seeded tests to change their town names. Update those expectations, and check by eye that the new names read as settlements.

## 8. Presets and history

- **Presets:** settlement names gets **Save as preset** wherever its source module has it: the British native setting, in new lands and in settled lands. The world native cultures have none, matching native place names. A preset stores the setting and size plus the same fields the source module's preset stores. Loading one opens settlement names, not the source module.
- **History:** "settlement names · ‹size label› · ‹the source module's history label without its own base name›", for example "settlement names · town · British · North" or "settlement names · settlement · Chinese · Imperial".

## 9. Tests

1. **Data check:** every id, template, era, culture, affix form and list word in `settlement-names.json` exists in the current data, and every size string uses only `h v t c g`.
2. **Regression:** native place names (British, a British region, three world cultures), exploration and expansion give identical names for fixed seeds before and after.
3. **Filter:** at `any`, no British or colonial result uses a generic outside `generics`, and no world result uses a template outside the file.
4. **Size:** at each size, every drawn generic, template and list word carries that size's letter. Great city for Norse Viking falls back to city with a notice.
5. **Kit:** a British town kit and a Chinese city kit draw their town and neighbours from the settlement pool at the kit's size; a future-era kit and a Greek & Byzantine kit keep their old path.
6. **Line-up:** `SECTION_GROUPS.urban` is exactly `["settlementNames", "streetNames", "innNames", "buildingNames", "settlementKit"]`; place names and advanced no longer list those modules; `SWITCHER_ORDER` has `urban` after `placeNames`.

## 10. Milestones

1. **M1, the line-up:** add the urban group, move the four modules, register the icons, update the switcher order and position comments. Tests 6. Commit.
2. **M2, the data and engines:** add `settlement-names.json` and the `settlement` options (§6.1, §6.2) with `generateSettlementNames`. Tests 1–4. Commit.
3. **M3, the module:** add the module, its sentence and state (§3), sizes and notices (§4), presets and history (§8). Commit.
4. **M4, the kit link:** §7, with test 5 and the updated kit expectations. Commit.

## 11. Parked

- **Other `{town}` slots:** route names, group names and bynames drawing their `{town}` from settlement names.
- **Kit era:** the kit choosing the world culture's era from its own era rather than always the first.
- **World presets:** presets for the world native cultures, here and in native place names.

## Notes

- **2026-10-19:** settlement names with one of five terrains (mountains, forest, wetland, plains, hills) now draws 60% of its names from the wild lands modules (`docs/wild-lands-brief.md` §10); every other terrain, and the settlement kit, are unchanged.
