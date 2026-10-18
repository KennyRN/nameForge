# Time and sky – brief (first release)

This brief adds two modules to the **advanced** group, after money and coins. Both name time and the sky of a world, in modern English, and they share one engine:

- **calendars and festivals**
  - months: *Thaw Month*, *Hay Month*, *Before Yule*, *Little Vigil*
  - days of the week: *Market Day*, *Red Star Day*, *Wash Day*
  - festivals and holy days: *Feast of Reaping*, *Night of Lanterns*, *Founders' Day*
  - full moons: *Wolf Moon*, *Lambing Moon*, *Lone Moon*
- **sky lore**
  - constellations: *the Plough*, *the Weaver's Loom*, *the Great Elk*
  - star signs: *the Ram*, *the Hare*, *the Flint*
  - wanderers and lights: *the Red Wanderer*, *the Pale Sister*, *the Silver River*, *the Broom Star*

It is built on route names (RN), events and eras (EE), money and coins (MC), group names (GN), tone and series (TS), bynames and titles (BT), ships and spacecraft (SS), deities and sacred places (DS), tribal names and biomes (TB) and the land brief (LB). It uses the **shared vocabulary** and vocabulary packs (RN §3), so later research adds words without code.

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow MC, then EE, then RN, then GN and TS. Reuse existing helpers. All output is in modern English.

Two rules run through the whole brief:

1. **Counts are never invented.** Every calendar, week, festival cycle and zodiac in a series comes from a real system (§5). The names may be generated; the number of months, days or signs is always the system's.
2. **A real calendar is never reproduced.** A culture's own plain English names (*January*, *Monday*, *Aries*, *Mars*) are blocked outright (§13.1). Real names given by meaning (*Sacrifice Month*, *Fire Day*) may appear, but never more than half of any series (§10.1).

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | Two new modules, last in **advanced** after money and coins: `calendarNames` ("calendars and festivals") then `skyNames` ("sky lore") |
| Shared engine | `src/timesky/`: one engine, two sentences |
| Calendar kinds | months · days of the week · festivals and holy days · full moons |
| Sky kinds | constellations · star signs · wanderers and lights |
| Cultures | RN's twenty-two (§3.1). Polynesian and Andean follow SS's sensitive-culture rule (§3.2). The four money-only cultures are not offered. |
| Eras, fantastic | As RN §4.3 (seven eras, steampunk in the steam age) |
| Land | A biome link, with "their homeland" as the default (as realms). No terrain link. Space biomes in NF and IS. |
| Start | "starting in ‹their own new year›" or any season of the land (§6), for series of months, festivals and full moons |
| Naming | Real names translated by meaning (MC §7). A loanword switch for festivals only (§8.1). |
| Plain English names | Always blocked (§13.1) |
| Counts | Real systems only (§5). No free choice of number. |
| Series | "as one calendar", "as one week", "as one year", "as one zodiac", "as one sky", by kind (§10) |
| Gods | Invented deity titles from DS, or placeholders. None for the sensitive cultures. |
| Saints | Saints' days and quarter days for the christian cultures; the great holy days of living religions are blocked (§13) |

---

## 1. Modules

### 1.1 Sections

- Add `calendarNames` to `NameForgeSection`, label **"calendars and festivals"**, Lucide icon `calendar-days`.
- Add `skyNames`, label **"sky lore"**, Lucide icon `moon-star`.
- Append both to `SECTION_GROUPS.advanced` after `moneyNames`, and to `SECTION_ORDER` after `moneyNames`, in that order.
- History routing (`historySection`): rows starting `calendars and festivals` go to `calendarNames`; rows starting `sky lore` go to `skyNames`.

### 1.2 History labels

- `calendars and festivals · {era label} · {culture label} · {kind}`, then ` · {biome label}` when not the homeland, ` · from {start}` when not their own new year, ` · loanwords` when on, ` · steampunk` / ` · fantastic`, ` · {tone}`, and ` · {series text}` when on.
- `sky lore · {era label} · {culture label} · {kind}`, then the biome, steampunk or fantastic, tone and series as above.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/settlement-vocab.json` | The new pools (§7) |
| `src/data/time-sky.json` | Kinds, systems (§5), system table, season cycles and new years (§6), culture names (§8), shapes (§9), themes (§10), safeguards (§13) |
| `src/timesky/engine.ts` | Generation, layout of the year, series, rendering. No Obsidian imports. |
| `src/timesky/calendarSentence.ts` | The calendars sentence (§2.1) |
| `src/timesky/skySentence.ts` | The sky lore sentence (§2.2) |
| `docs/vocabulary-pools.md` | Rows for the new pools |
| `tests/timeSky.test.ts` | §16 |

Add this brief to `docs/` as `time-and-sky-brief.md`.

---

## 2. The sentences

### 2.1 Calendars and festivals

> ‹Anglo-Saxon› ‹months› of the ‹medieval› era, in a ‹realistic› world, set in ‹their homeland›, ‹of any tone›, with ‹placeholders for› gods and people, ‹each one separate›.

With a series on, the start link appears after the land:

> ‹Anglo-Saxon› ‹months› of the ‹medieval› era, in a ‹realistic› world, set in ‹their homeland›, starting in ‹their own new year›, ‹of any tone›, with ‹placeholders for› gods and people, ‹as one calendar›.

### 2.2 Sky lore

> ‹Norse› ‹constellations› of the ‹medieval› era, in a ‹realistic› world, seen from ‹their homeland›, ‹of any tone›, with ‹placeholders for› gods and people, ‹each one separate›.

### 2.3 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | the culture label | §3.1 | `norman-british` |
| `kind` | the kind's plural (§4) | the kinds offered for the culture and era (§5.5); no Any | months; constellations |
| `era`, `fantastic` | as RN §2.2 | as RN | MD, realistic |
| `biome` | "set in ‹…›" (calendars) / "seen from ‹…›" (sky): "their homeland" or the biome's phrase | Their homeland, every biome (built-ins and packs), and in NF and IS the space biomes under a Space heading (as realms) | their homeland |
| `start` | "starting in ‹their own new year›" · "starting in ‹spring›" · "starting in ‹the thaw›"… | Their own new year, then the land's seasons in cycle order (§6.1) | their own new year |
| `words` | "‹in translated names›" · "‹with familiar loanwords›" | the two | translated |
| `tone`, `people` | as TS, GN; people reads "gods and people" | | any, placeholders |
| `series` | "‹each one separate›" or the kind's series text (§10) | the two, where the kind has a system (§5.5) | separate |

- **Start link:** shown only when series is on for months, festivals or full moons, and the land is not a space biome.
- **Words link:** shown only for kind festivals, and only for cultures with at least one loan form (§8): celtic, roman, greek-byzantine, arabic-persian, slavic, egyptian, japanese, korean. Elsewhere it reads as translated.
- **Fantastic link:** hidden for polynesian and andean, where it reads as realistic (§3.2).
- **Season text:** the season key's phrase from §6.1 ("spring", "the thaw", "the rains", "the flood", "the dry season", "harvest", "the monsoon", "the storms", "the frosts").
- **Tooltips:**
  - kind: the kind's description (§4)
  - biome: as realms
  - start: "Which season the list starts in. Their own new year starts where the culture's year began (midwinter for the Anglo-Saxons, spring for the Romans)."
  - words: "Real festival names are given in English by meaning (Samhain: Summer's End). Loanwords keep the familiar English borrowing where there is one."
  - series: "A whole set in order. The number of months, days or signs always comes from a real system, named under the batch."
  - the rest as RN.

### 2.4 Resets

- **Culture or era changed:** a kind not offered resets to the module's default kind, or the first kind offered.
- **Series not offered** for the new culture, era and kind (§5.5): series resets to separate.
- **Biome changed:** a start season not in the new land's cycle resets to their own new year.
- **Era changed** away from NF and IS: a space biome resets to their homeland (as realms, with its notice).
- **Culture changed** to polynesian or andean: fantastic resets to realistic, and a light or grim tone resets to any.

### 2.5 Plain text, state, presets

As GN §2.5–§2.6. Presets in §14.

---

## 3. Cultures and sources

### 3.1 Cultures

RN's cultures and menu, in RN's order: general, anglo-saxon, norse, celtic, norman-british, roman, greek-byzantine, slavic, steppe, arabic-persian, indian, chinese, japanese, korean, egyptian, ethiopian, bantu, west-african, aztec, maya, polynesian, andean. French, dutch, iberian and american (`moneyOnly`) are filtered out, as in every module but money.

**Christian cultures** are those for which DS's `isChristianCulture(culture, era)` is true.

### 3.2 Sensitive cultures

Polynesian and andean follow SS §14.4:

- no light or grim tones (the tone menu offers any, grand, plain and strange)
- no fantastic or steampunk words (the fantastic link is hidden)
- no `{god}` or `{holy}` shapes (weight 0)
- no real sacred festival names: their festival culture names (§8) are seasonal and working festivals only

### 3.3 Homelands

"Their homeland" is `homelandBiome(culture)` (realms engine), with these overrides in `time-sky.json` (`homeland`), used only by this module:

| Culture | Homeland biome |
|---|---|
| polynesian | tropical-islands |
| andean | highland |

Some cultures also have a **homeland season cycle** (§6.1), used only when the land is their homeland.

### 3.4 Tokens

| Token | Source |
|---|---|
| `{god}` | DS `deityTitle({ culture, era, fantastic, tone, rng, safeguards, vocab })`, its leading "the" removed for possessives (*Storm Lord's Day*). Placeholder `[god]`. Weight 0 for the sensitive cultures. |
| `{holy}` | GN §8.2 saints, christian cultures only. Placeholder `[holy person]`. |
| `{figure}` | RN §4.2 (BT ranks, English men's form) |
| `{founder}` | GN invented person (surname form). Placeholder `[founder]`. |
| `{town}` | `groupTown(setting, townSource(culture), rng)`. Placeholder `[place]`. |
| `{realm}` | one realms name, short form, territorial, for the culture and era. Placeholder `[realm]`. |
| `{event}` | one EE name of kind treaty, battle or rebellion for the culture and era, with its "the" and any leading "Battle of" / "Treaty of" removed (*Saltgate*). Placeholder `[event]`. |
| `{star}`, `{spaceLand}`, `{colour}`, `{number}`, `{numberWord}`, `{ordinal}` | group-names.json lists, with their rules |
| `{wildAnimal}`, `{bird}`, `{creature}`, `{tree}`, `{plant}`, `{crop}`, `{livestock}` | the land's biome lists (`biomeWords`), title-cased |

---

## 4. Kinds

| Module | Key | Menu | Plural (sentence) | Description (tooltip) |
|---|---|---|---|---|
| calendars | `month` | Months | months | The months of the year |
| calendars | `day` | Days of the week | days of the week | The days of a week or market cycle |
| calendars | `festival` | Festivals and holy days | festivals and holy days | Feasts, fairs, fires and days of remembrance |
| calendars | `moon` | Full moons | full moons | The names of each full moon of the year |
| sky | `constellation` | Constellations | constellations | Star pictures and patterns |
| sky | `sign` | Star signs | star signs | The signs of a zodiac or a day count |
| sky | `light` | Wanderers and lights | wanderers and lights | Planets, moons, comets, the morning and evening stars and the Milky Way |

Kind `day` is not offered where the culture and era have no week system (§5.5). Kind `moon` is not offered in space biomes. Every other kind is always offered.

---

## 5. Systems

Each system is a real structure, listed in `time-sky.json` with a `key`, a `source` (shown under a series, §10.8) and its parts. **No system may be added that the brief doesn't list, and no count may be computed from anything else.**

### 5.1 Year systems (months)

| Key | Source (shown under the batch) | Months | Extra days | Leap |
|---|---|---|---|---|
| `julian-12` | Julian and Gregorian calendars | 12 | – | – |
| `romulus-10` | The ten-month calendar of Romulus (Roman legend) | 10 | the winter days, unnamed | – |
| `numa-12` | Republican Roman calendar | 12 | – | a 13th month after the 12th |
| `attic-12` | Athenian festival calendar | 12 | – | a 13th month after the 6th |
| `bede-12` | Anglo-Saxon year, as Bede describes it | 12 | – | a 13th month after the 7th |
| `coligny-12` | Gaulish calendar of Coligny | 12 | – | a 13th month before the 1st or after the 6th (50% each) |
| `icelandic-12` | Old Icelandic calendar | 12 | four extra nights | an extra week |
| `egyptian-civil` | Egyptian civil calendar | 12, in three seasons of four | five days upon the year | – |
| `ethiopian-13` | Ethiopian calendar | 13 (the 13th of five or six days) | – | – |
| `lunar-12` | Twelve-month lunar year | 12 | – | – |
| `persian-solar` | Persian solar year | 12 | – | – |
| `babylonian-12` | Babylonian lunisolar year | 12 | – | a 13th month after the 12th or the 6th (50% each) |
| `chinese-lunisolar` | Chinese lunisolar calendar | 12 | – | a 13th month after any month (uniform) |
| `indian-lunisolar` | Indian lunisolar calendar | 12 | – | a 13th month after any month (uniform) |
| `lunar-12-13` | Twelve lunar months, with a thirteenth in some years | 12 | – | a 13th month after the 12th |
| `aztec-18` | Aztec solar year of 365 days | 18 | five empty days | – |
| `maya-haab` | Maya solar year of 365 days | 18 | five nameless days | – |
| `fixed-13` | International Fixed Calendar (proposed 1902) | 13 | one year day | – |
| `darian-24` | Darian calendar for Mars (proposed 1985) | 24 | – | – |

- **Leap month:** in a series, each system with a leap month includes it at **7 in 19** (the Metonic rate), placed as the table says. It is marked *(leap month)* (§10.8).
- **Extra days:** shown as one line after the last month of the culture's own year, marked *(extra days)*. For `icelandic-12` the leap week is not shown.
- **Egyptian seasons:** in `egyptian-civil`, months 1–4, 5–8 and 9–12 form the three seasons; on the homeland cycle they are flood, winter and harvest (§6.1).

### 5.2 Week systems (days)

| Key | Source | Days | Slot traits |
|---|---|---|---|
| `week-7` | Seven-day week | 7 | planets in order: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn |
| `nundinal-8` | Roman market week of eight days | 8 | day 1 is the market day |
| `decade-10` | Ten-day week | 10 | day 10 is the rest day |
| `market-4` | Four-day market week | 4 | every day is a market day |
| `rokuyo-6` | Japanese six-day cycle | 6 | – |
| `day-signs-20` | Twenty day signs of the 260-day count | 20 | – |
| `moon-nights-30` | Nights of the moon | 30 | in order from the new moon; night 15 is the full moon |
| `soviet-5` | Soviet continuous week (1929–1931) | 5 | – |

The planet traits give each slot's light for the planets theme (§10.3) and match the sky series (§10.7).

### 5.3 Festival cycles (festivals)

| Key | Source | Festivals | Placed |
|---|---|---|---|
| `quarters-4` | The four quarters of the year | 4 | one at the start of each quarter of the slots (§6.2) |
| `season-starts-4` | Four festivals at the start of each season | 4 | one at the start of each season (Celtic: Summer's End, Ewe's Milk, Bright Fire, Lugh's Assembly) |
| `seasons` | One festival for each season of the land | the number of seasons in the land's cycle | one at the start of each season |
| `monthly` | One festival in each month | the year system's month count (no leap month) | one per month |
| `sekku-5` | Five seasonal festivals of Japan | 5 | in months 1, 3, 5, 7 and 9 |
| `ritu-6` | Six seasons of India | 6 | one every two months |
| `solar-terms-24` | Twenty-four solar terms | 24 | two per month |
| `egyptian-3` | Three seasons of the Egyptian year | 3 | one at the start of each season |

### 5.4 Sky systems

| Key | Source | Count | Notes |
|---|---|---|---|
| `zodiac-12` | Babylonian and Hellenistic zodiac | 12 | |
| `animals-12` | Twelve animals of the Chinese cycle | 12 | beasts only (§10.6) |
| `mansions-28` | Twenty-eight lunar mansions | 28 | |
| `nakshatras-27` | Twenty-seven lunar mansions of India | 27 | generated names only (§8.12) |
| `day-signs-20` | Twenty day signs of the 260-day count | 20 | |
| `decans-36` | Thirty-six Egyptian decans | 36 | generated names only |
| `classical-7` | The seven classical lights | 7 | Saturn, Jupiter, Mars, the Sun, Venus, Mercury, the Moon (Chaldean order) |

### 5.5 Which system

Where a cell has several, each is drawn at the stated share. A dash: no system, so that kind (days) or series (signs) is **not offered**.

**Months** (also full moons, §10.5)

| Culture | AN | MD | EM | ST | MO |
|---|---|---|---|---|---|
| general | lunar-12-13 | lunar-12-13 | julian-12 | julian-12 | julian-12 80 · fixed-13 20 |
| anglo-saxon | bede-12 | bede-12 | julian-12 | julian-12 | julian-12 |
| norse | icelandic-12 | icelandic-12 | icelandic-12 | julian-12 | julian-12 |
| celtic | coligny-12 | julian-12 | julian-12 | julian-12 | julian-12 |
| norman-british | julian-12 | julian-12 | julian-12 | julian-12 | julian-12 |
| roman | romulus-10 20 · numa-12 40 · julian-12 40 | julian-12 | julian-12 | julian-12 | julian-12 |
| greek-byzantine | attic-12 | julian-12 | julian-12 | julian-12 | julian-12 |
| slavic | lunar-12-13 | julian-12 | julian-12 | julian-12 | julian-12 |
| steppe | chinese-lunisolar | chinese-lunisolar | chinese-lunisolar | chinese-lunisolar | julian-12 |
| arabic-persian | babylonian-12 | lunar-12 50 · persian-solar 50 | lunar-12 50 · persian-solar 50 | lunar-12 50 · persian-solar 50 | persian-solar 50 · julian-12 50 |
| indian | indian-lunisolar | indian-lunisolar | indian-lunisolar | indian-lunisolar | indian-lunisolar 50 · julian-12 50 |
| chinese | chinese-lunisolar | chinese-lunisolar | chinese-lunisolar | chinese-lunisolar | julian-12 |
| japanese | chinese-lunisolar | chinese-lunisolar | chinese-lunisolar | julian-12 | julian-12 |
| korean | chinese-lunisolar | chinese-lunisolar | chinese-lunisolar | chinese-lunisolar | julian-12 |
| egyptian | egyptian-civil | egyptian-civil | egyptian-civil | julian-12 | julian-12 |
| ethiopian | ethiopian-13 | ethiopian-13 | ethiopian-13 | ethiopian-13 | ethiopian-13 |
| bantu | lunar-12-13 | lunar-12-13 | lunar-12-13 | lunar-12-13 | julian-12 |
| west-african | lunar-12-13 | lunar-12-13 | lunar-12-13 | lunar-12-13 | julian-12 |
| aztec | aztec-18 | aztec-18 | aztec-18 50 · julian-12 50 | julian-12 | julian-12 |
| maya | maya-haab | maya-haab | maya-haab 50 · julian-12 50 | julian-12 | julian-12 |
| polynesian | lunar-12-13 | lunar-12-13 | lunar-12-13 | lunar-12-13 | julian-12 |
| andean | lunar-12-13 | lunar-12-13 | julian-12 | julian-12 | julian-12 |

**NF and IS**, every culture: julian-12 70 · fixed-13 30. In the planetary-system space biome: julian-12 50 · fixed-13 20 · darian-24 30.

**Days**

| Culture | AN | MD | EM | ST | MO | NF–IS |
|---|---|---|---|---|---|---|
| general | week-7 | week-7 | week-7 | week-7 | week-7 | week-7 |
| anglo-saxon, norse, norman-british, ethiopian, arabic-persian, indian | week-7 | week-7 | week-7 | week-7 | week-7 | week-7 |
| celtic, greek-byzantine, slavic | – | week-7 | week-7 | week-7 | week-7 | week-7 |
| roman | nundinal-8 50 · week-7 50 | week-7 | week-7 | week-7 | week-7 | week-7 |
| slavic (MO only) | | | | | week-7 80 · soviet-5 20 | |
| steppe | – | week-7 | week-7 | week-7 | week-7 | week-7 |
| chinese | decade-10 | decade-10 | decade-10 | week-7 | week-7 | week-7 |
| japanese | decade-10 | rokuyo-6 | rokuyo-6 | week-7 | week-7 | week-7 |
| korean | decade-10 | decade-10 | decade-10 | week-7 | week-7 | week-7 |
| egyptian | decade-10 | week-7 | week-7 | week-7 | week-7 | week-7 |
| bantu, west-african | market-4 | market-4 | market-4 | market-4 50 · week-7 50 | week-7 | week-7 |
| aztec, maya | day-signs-20 | day-signs-20 | day-signs-20 50 · week-7 50 | week-7 | week-7 | week-7 |
| polynesian | moon-nights-30 | moon-nights-30 | moon-nights-30 | week-7 | week-7 | week-7 |
| andean | – | – | week-7 | week-7 | week-7 | week-7 |

**Festivals**

| Culture | Cycle |
|---|---|
| general, anglo-saxon, norse, norman-british, slavic, steppe | quarters-4 |
| celtic | season-starts-4 |
| roman, greek-byzantine | monthly |
| arabic-persian | quarters-4 |
| indian | ritu-6 |
| chinese, korean | solar-terms-24 |
| japanese | sekku-5 50 · solar-terms-24 50 |
| egyptian | egyptian-3 |
| aztec, maya | monthly (18) |
| ethiopian, bantu, west-african, polynesian, andean | seasons |
| every culture, NF–IS | seasons, or quarters-4 in a space biome |

**Star signs** ("–" means the series is not offered; single signs are always offered)

| Culture | AN | MD on |
|---|---|---|
| general, norman-british, roman, greek-byzantine | zodiac-12 | zodiac-12 |
| anglo-saxon, celtic, norse, slavic, ethiopian | – | zodiac-12 |
| arabic-persian | zodiac-12 70 · mansions-28 30 | zodiac-12 70 · mansions-28 30 |
| indian | zodiac-12 60 · nakshatras-27 40 | zodiac-12 60 · nakshatras-27 40 |
| chinese | animals-12 70 · mansions-28 30 | animals-12 70 · mansions-28 30 |
| japanese, korean, steppe | animals-12 | animals-12 |
| egyptian | decans-36 | zodiac-12 |
| aztec, maya | day-signs-20 | day-signs-20 |
| bantu, west-african, polynesian, andean | – | – |

**Wanderers and lights:** `classical-7` for every culture and era.

**Constellations:** no series.

---

## 6. Seasons and the start

### 6.1 Season cycles

Each biome gets a cycle: its seasons in yearly order, with a share of the year out of 12. These live in `time-sky.json` (`seasonCycles`); `biomes.json` is not changed. A biome pack may give its own `seasonCycle` (same shape); without one, its `seasons` list is used in the order written, with equal shares.

| Biome | Cycle (season share) |
|---|---|
| temperate, britain | spring 3 · summer 3 · autumn 3 · winter 3 |
| moorland | spring 2 · summer 3 · storm 3 · winter 4 |
| boreal | thaw 2 · summer 4 · winter 6 |
| cool-rainforest | summer 4 · rain 4 · winter 4 |
| mediterranean | winter 4 · summer 5 · harvest 3 |
| steppe | spring 2 · summer 4 · winter 6 |
| desert | winter 4 · summer 6 · rain 2 |
| savannah | rain 5 · harvest 2 · drought 5 |
| rainforest | rain 7 · flood 5 |
| monsoon | rain 3 · monsoon 4 · flood 2 · harvest 3 |
| tropical-islands | rain 5 · storm 2 · harvest 5 |
| highland | thaw 2 · summer 3 · frost 2 · winter 5 |

**Homeland cycles** (used only when the land is the culture's homeland):

| Culture | Cycle |
|---|---|
| egyptian | flood 4 · winter 4 · harvest 4 |
| aztec, maya | drought 6 · rain 6 |
| ethiopian | rain 3 · harvest 3 · drought 6 |
| andean | rain 4 · harvest 3 · frost 5 |

**Season phrases:** spring "spring", summer "summer", autumn "autumn", winter "winter", thaw "the thaw", rain "the rains", monsoon "the monsoon", flood "the flood", drought "the dry season", harvest "harvest", storm "the storms", frost "the frosts".

### 6.2 Laying out the year

For a year system of N months (no leap month):

1. **Share out the slots.** Each season gets `N × share / 12` slots, rounded by largest remainder, with at least one slot per season when N is at least the number of seasons.
2. **Ring.** The slots form a ring in cycle order. Each slot has its season and its position within the season (first, middle, last).
3. **Own new year.** The culture's new year (§6.3) fixes which slot is month 1 of its own year. Real names numbered by month (§8) attach to slots counted from there.
4. **Start.** The series lists the ring from the start: their own new year, or the first slot of the chosen season.

Days and signs have no seasons. Festivals use the same ring (§5.3). Full moons use the months' ring (§10.5).

### 6.3 Their own new year

A season and an offset (0 is the season's first slot). If the offset runs past the season's slots, it carries on into the next season. If the land's cycle lacks the season, the new year is the first slot of the cycle.

| Culture | New year | Real-world model |
|---|---|---|
| general | spring 0 | – |
| anglo-saxon | winter 1 | midwinter (Mothers' Night) |
| norse | summer 0 | the first day of summer |
| celtic | winter 0 | Summer's End |
| norman-british | winter 1 | January |
| roman | winter 3 | March (in the mediterranean cycle) |
| greek-byzantine | AN summer 2; MD on summer 4 | after midsummer; 1 September |
| slavic | AN–MD spring 0; EM on winter 1 | March; January |
| steppe | spring 0 | the White Month |
| arabic-persian | winter 3 | the spring equinox (in the desert cycle) |
| indian | rain 0 | the spring month |
| chinese, japanese, korean | spring 0 | the lunar new year |
| egyptian | flood 0 | the rising of the river |
| ethiopian | harvest 0 | the end of the rains |
| bantu | rain 0 | – |
| west-african | harvest 0 | after the yam harvest |
| aztec | drought 3 | Ceasing of Water |
| maya | drought 0 | – |
| polynesian, andean | rain 0 | the rising of the Pleiades; the December solstice |

### 6.4 Space biomes

In a space biome there are no seasons: the start link is hidden, every slot is "unseasoned", season-tagged words and shapes have weight 0, and the space words in §9.9 take their place. Full moons are not offered (§4).

---

## 7. New pools (settlement-vocab.json)

New entry key, read only by this module:

| Key | Meaning | Default |
|---|---|---|
| `s` | seasons the entry fits (season keys from §6.1) | all |

Other modules ignore `s`.

| Pool | Entries |
|---|---|
| `seasonWord` | **spring:** Sowing ×2, Lambing ×2, Blossom ×2, Budding, Ploughing ×2, Cuckoo, Swallow, Birch, Green, Mud, Planting, Seed, Hare, Grass, Calving, Nesting. **summer:** Hay ×2, Haymaking, Sun ×2, Rose, Honey, Shearing ×2, Long-Day, Heat ×2, Lime, Midsummer, Weeding, Swarming, Bright. **autumn:** Harvest ×3, Reaping ×2, Leaf-Fall ×2, Yellowing, Slaughter ×2, Rut, Apple, Nut, Gathering, Mist, Fog, Acorn, Threshing, Brewing, Wine (mediterranean words in any cycle with harvest). **winter:** Frost ×2, Snow ×2, Ice ×2, Wolf ×2, Dark ×2, Hearth, Yule (anglo-saxon, norse, norman-british, celtic, general), Long-Night, Cold ×2, Hunger (grim), Suet, Fasting, Storytelling, Clod. **thaw:** Thaw ×3, Meltwater ×2, Break-Up, Slush, Return, Mud. **rain:** Rain ×3, Cloud, Frog ×2, Green ×2, Downpour, Mushroom, Sprouting, Thunder. **monsoon:** Monsoon ×3, Storm ×2, Downpour, Deluge, Thunder, Peacock (indian), Cloud. **flood:** Flood ×3, Inundation ×2, Silt ×2, Rising Water, High Water, Black Earth. **drought:** Dust ×2, Dry ×2, Thirst, Burning (grim), Cracked Earth, Fire ×2, Bare, Smoke. **harvest:** Harvest ×3, Threshing ×2, Granary, Winnowing, Gleaning, Plenty, First Fruits, Yam (west-african, bantu ×3), Maize (aztec, maya ×3), Rice (chinese, japanese, korean, indian ×3). **storm:** Gale ×2, Storm ×3, Wreck (grim), Spray, Squall. **frost:** Frost ×3, Rime ×2, Hard Frost, Hail, White. |
| `workWord` | the farming-year subset of `seasonWord`, tagged `w: true`: Ploughing, Sowing, Planting, Lambing, Calving, Shearing, Hay, Haymaking, Weeding, Reaping, Harvest, Threshing, Winnowing, Gleaning, Slaughter, Brewing, Wine |
| `dayWork` | Market ×3, Wash ×2, Baking, Rest ×2, Fast, Hunting, Bath, Moot (anglo-saxon, norse, norman-british), Assembly, Pay (ST on), Mending, Spinning, Fishing, Prayer (×0.5), Court, Dancing (light) |
| `dayElement` | Fire, Water, Wood, Metal, Earth (chinese, japanese, korean, steppe) |
| `skyFigure` | Hunter ×2, Herdsman, Weaver ×2, Ploughman, Fisherman, Archer, Maiden, Twins, Smith, Warrior, King, Queen, Old Woman, Wanderer, Shepherd, Ferryman, Drummer, Sleeper (strange), Dancer, Mourner (grim), Thief, Rider, Giant |
| `skyObject` | Plough ×2, Sickle, Wain ×2, Ship, Canoe (polynesian ×3, maya, aztec), Harp, Crown, Spear, Ladle, Net, Hearth, Loom, Drum, Bow, Arrow, Sword, Shield, Fishhook (polynesian ×2), Fire Drill (aztec ×3), Scales, Cup, Key, Gate, Chair, Bowl, Basket, Kite, Kettle, Comb, Spindle, Distaff, Anvil, Tent (steppe, arabic-persian ×2), Stake (steppe ×2), Bier (arabic-persian), Ball Court (aztec, maya) |
| `skyBodyPart` | Eye ×2, Eyes, Tail, Horn, Heart, Belt, Head, Hand, Foot, Mane, Claw, Wing, Jaw, Spine, Tongue (strange) |
| `skyQuality` | Pale ×2, Red ×2, Slow, Swift, Bright ×2, Dim, Restless, Lonely, Faithful, Fierce, Gentle, Hidden, Weeping (strange), Smoking (strange), Silver, Golden |
| `skyKin` | Sister ×2, Brother ×2, Mother, Father, Child, Twin, Bride, Widow (grim), Guest, Stranger |
| `skyRiver` | River, Road ×2, Path, Way, Seam, Stream, Bridge, Trail, Spine (strange) |
| `skyHeaven` | Heaven ×2, the Sky ×2, the Night, Souls (strange), the Dead (grim), Birds, Straw, Milk, the Gods (non-sensitive cultures) |
| `festNoun` | Lanterns ×2, Masks, Bonfires ×2, Bells, Candles, Mirrors, Wolves, Ancestors ×2, Stars, Kites, Drums, Boats, Flowers, Ribbons, Torches, Ashes (grim), Fools (light), Kings, Queens, Spirits (strange) |
| `festBlessing` | the Boats, the Ploughs, the Herds, the Waters, the Fields, the Nets, the Hives, the Wells, the Bread, the Looms |
| `extraDays` | Empty ×2, Lost, Spare (light), Nameless ×2, Dark (grim), Waiting, Short, Idle |

Every pool is open to vocabulary packs (RN §3.3). Pack lines may add `s` tags in round brackets with tones: `- Sap Rising (spring, light)`.

---

## 8. Culture names

These are the real names of each culture's months, days, festivals, moons, signs and lights, given in English **by meaning**. They are listed in `time-sky.json` under `cultureNames`, by culture and kind. They are allowed only within the rules in §8.1 and §10.1.

Each row has: the translated name; a loan form (festivals only); its eras; and, for months and days, its **position** in the culture's own system (month n counted from the new year, §6.2; day n of the week from the week's first day), or for festivals its **season**. A name is drawn only for its position or season, and only within the system it is listed with.

### 8.1 Rules

- **Separate names:** each kind's shape table has a "culture names" row (§9). It draws a culture name of the kind, era and system at random; for months and days, any position.
- **In a series:** each slot takes its culture's real name at 25%, if there is one for that slot, **until half the series** (rounded down) is real names. After that, no more real names are drawn. A series may never be wholly real.
- **Loans (festivals only):** with "with familiar loanwords", a festival with a loan form prints the loan **at 70%**, the translated form otherwise. Loans keep OUP English spelling and accents.
- **Ancient gods** may appear in culture names (*Thor's Day*, *Mars's Month*), as in place names and ships. DS's `hasRealDivineName` is not applied to culture names; it is applied to every generated name (§13.4).
- Rows below marked **omit** must not be added: they are listed so they are not added later.

### 8.2 British Isles and northern Europe

**Anglo-Saxon** (months: `bede-12`; days: `week-7`)

| Months | Position | Eras |
|---|---|---|
| After Yule | 1 | AN–MD |
| Cake Month | 2 | AN–MD |
| Hretha's Month | 3 | AN–MD |
| Eostre's Month | 4 | AN–MD |
| Three-Milkings Month | 5 | AN–MD |
| Before Midsummer | 6 | AN–MD |
| After Midsummer | 7 | AN–MD |
| Third Midsummer | leap month | AN–MD |
| Weed Month | 8 | AN–MD |
| Holy Month | 9 | AN–MD |
| Winter Full Moon | 10 | AN–MD |
| Sacrifice Month | 11 | AN–MD |
| Before Yule | 12 | AN–MD |

Days: Sun's Day 1, Moon's Day 2, Tiw's Day 3, Woden's Day 4, Thunor's Day 5, Frige's Day 6, Saturn's Day 7 (all eras).

Festivals: Mothers' Night (winter), Yule (winter), Eostre's Feast (spring; AN only), Midsummer (summer), Loaf Mass (autumn; MD on), Winter Nights (autumn).

**Norse** (months: `icelandic-12`; days: `week-7`)

| Months | Position | Eras |
|---|---|---|
| Sun Month | 3 | AN–EM |
| Hay Month | 4 | AN–EM |
| Two-Month | 5 | AN–EM |
| Autumn Month | 6 | AN–EM |
| Slaughter Month | 7 | AN–EM |
| Yule Month | 8 | AN–EM |
| Suet Month | 9 | AN–EM |
| Lone Month | 12 | AN–EM |
| Extra Nights | extra days | AN–EM |

Days: Sun's Day 1, Moon's Day 2, Tyr's Day 3, Odin's Day 4, Thor's Day 5, Frigg's Day 6, Washing Day 7 (AN–MD); and from MD on also Third Day 3, Midweek 4, Fifth Day 5, Fast Day 6 at 50% against the older names.

Festivals: Winter Nights (autumn), Yule (winter), Sacrifice of the Disir (winter), Thorri's Feast (winter), First Day of Summer (summer), Midsummer (summer), Assembly Days (summer).

**Celtic** (months: MD on `julian-12`; days: `week-7` MD on)

| Months | Position | Eras |
|---|---|---|
| Bright Fire | 5 | MD on |
| Midsummer Month | 6 | MD on |
| Summer's End | 7 | MD on |
| Lugh's Assembly | 8 | MD on |
| Reaping Month | 9 | MD on |
| End of Harvest | 10 | MD on |
| Slaughter Month | 11 | MD on |
| Before Yule | 12 | MD on |

The Coligny names (AN) are not listed: their meanings are too uncertain.

Days: Lord's Day 1, Moon's Day 2, Mars's Day 3, First Fast 4, Between the Fasts 5, Fast Day 6, Saturn's Day 7 (MD on).

Festivals: Summer's End [Samhain] (winter), Ewe's Milk [Imbolc] (spring), Bright Fire [Beltane] (summer), Lugh's Assembly [Lughnasadh] (autumn).

**Norman & British** (months: `julian-12`; days: `week-7`)

- Months and days: none. The English month and day names are blocked (§13.1); every name is generated.
- Festivals (MD on): Plough Monday (winter), Candlemas (winter), Lady Day (spring), May Day (spring), Midsummer Day (summer), Lammas (summer), Harvest Home (autumn), Michaelmas (autumn), Martinmas (autumn), Hocktide (spring), Shrovetide (winter), Twelfth Night (winter); ST on also Wakes Week (summer), Bank Holiday (summer), Bonfire Night (autumn).

### 8.3 Western and southern Europe

**Roman / Italian** (months: `romulus-10`, `numa-12`, `julian-12`; days: `nundinal-8`, `week-7`)

| Months | Position (from March) | Systems | Eras |
|---|---|---|---|
| Mars's Month | 1 | all three | AN |
| Maia's Month | 3 | all three | AN |
| Juno's Month | 4 | all three | AN |
| Fifth Month | 5 | all three | AN |
| Sixth Month | 6 | all three | AN |
| Seventh Month | 7 | all three | AN |
| Eighth Month | 8 | all three | AN |
| Ninth Month | 9 | all three | AN |
| Tenth Month | 10 | all three | AN |
| Janus's Month | 11 | numa-12, julian-12 | AN |
| Purification Month | 12 | numa-12, julian-12 | AN |
| Wages Month | leap month | numa-12 | AN |
| the Winter Days | extra days | romulus-10 | AN |

Days: `nundinal-8`: Ninth Day 1 (the market day; Romans counted inclusively). `week-7`: Sun's Day 1, Moon's Day 2, Mars's Day 3, Mercury's Day 4, Jupiter's Day 5, Venus's Day 6, Saturn's Day 7 (AN); from MD on, Lord's Day 1 replaces Sun's Day.

Festivals (AN): Saturn's Feast [Saturnalia] (winter), Wolf Festival [Lupercalia] (winter), Flower Games [Floralia] (spring), Shepherds' Feast (spring), Rust Festival (spring), Mothers' Feast (spring), Vesta's Feast (summer), Wine Feast [Vinalia] (autumn), Boundary Feast [Terminalia] (winter), Oven Feast (winter), Harvest-Store Feast (summer). MD on: `{holy}` feasts only (§9.4).

**Greek & Byzantine** (months: `attic-12`, `julian-12`; days: `week-7` MD on)

| Months | Position | Eras |
|---|---|---|
| Hundred-Ox Month | 1 | AN |
| Neighbour-Moving Month | 2 | AN |
| Running-to-Help Month | 3 | AN |
| Bean-Boiling Month | 4 | AN |
| Blustering Month | 5 | AN |
| Poseidon's Month | 6 | AN |
| Second Poseidon's Month | leap month | AN |
| Wedding Month | 7 | AN |
| Flower Month | 8 | AN |
| Deer-Hunt Month | 9 | AN |
| First-Loaf Month | 11 | AN |

Days (MD on): Lord's Day 1, Second Day 2, Third Day 3, Fourth Day 4, Fifth Day 5, Preparation Day 6, Sabbath 7.

Festivals (AN): All-City Festival [Panathenaia] (summer), Flower Festival [Anthesteria] (winter), Dionysus's Festival [Dionysia] (spring), Bean Feast (autumn), Lawgiving Feast [Thesmophoria] (autumn), First-Loaf Feast (summer), Threshing-Floor Feast (winter). MD on: `{holy}` feasts only.

### 8.4 Eastern Europe and the steppe

**Slavic** (months: `julian-12` MD on; days: `week-7` MD on, `soviet-5` MO)

| Months | Position (from January) | Eras |
|---|---|---|
| Cutting Month, Ice Month | 1 | MD on |
| Fierce Month | 2 | MD on |
| Birch Month | 3 | MD on |
| Blossom Month, Oak Month | 4 | MD on |
| Grass Month | 5 | MD on |
| Red Month | 6 | MD on |
| Lime Month | 7 | MD on |
| Sickle Month | 8 | MD on |
| Heather Month | 9 | MD on |
| Yellowing Month | 10 | MD on |
| Leaf-Fall | 11 | MD on |
| Clod Month | 12 | MD on |

These attach by position counted from January, so they apply from EM on (when the slavic new year is January) and, in MD, are shifted to match a March new year (Birch Month is month 1).

Days: Rest Day 1, After-Rest 2, Second Day 3, Midweek 4, Fourth Day 5, Fifth Day 6, Sabbath 7 (MD on). `soviet-5` (MO): Yellow Day 1, Pink Day 2, Red Day 3, Purple Day 4, Green Day 5.

Festivals: Butter Week (winter), Bathing Night [Kupala] (summer), Forefathers' Night (autumn), Green Week (spring), Carol Night (winter).

**Turkic & Mongol steppe** (months: `chinese-lunisolar`; days: `week-7` MD on)

- Months: "{position} Month of {season}" (First, Middle, Last), built from the slot (§9.1), counts as a culture name. White Month 1 (MD on).
- Festivals: White Month (spring), New Day (spring), the Three Games (summer), Horse-Milk Feast (summer).

### 8.5 Middle East, Africa and the Indian Ocean

**Arabic & Persian** (months: `babylonian-12`, `lunar-12`, `persian-solar`; days: `week-7`)

- Months: **none**. The month names of these calendars belong to living religions (the Islamic, Jewish and Zoroastrian calendars): **omit**. Every month is generated.
- Days: Sabbath 1, One-Sabbath 2, Two-Sabbath 3, Three-Sabbath 4, Four-Sabbath 5, Five-Sabbath 6 (MD on); the seventh day is generated.
- Festivals: New Day [Nowruz] (spring), Longest Night (winter), Feast of Roses (spring), Water-Throwing Feast (summer). Mehregan and Sadeh: **omit**.

**Indian** (months: `indian-lunisolar`; days: `week-7`)

- Months: **none**. The month names are those of a living religious calendar: **omit**. Every month is generated. The leap month may take the culture name Extra Month.
- Days: none; the week's day names are named for living deities: **omit**. Days are generated with the planets theme from neutral sky names (§10.3).
- Festivals: generic seasonal festivals only: Kite Festival (winter), Monsoon Welcome (monsoon), Harvest of Rice (harvest). Living-religion festivals are blocked (§13.1).

**Egyptian** (months: `egyptian-civil`; days: `decade-10`, `week-7`)

| Months | Position | Eras |
|---|---|---|
| First Month of the Flood … Fourth Month of the Flood | 1–4 | AN–EM |
| First Month of Sowing … Fourth Month of Sowing | 5–8 | AN–EM |
| First Month of Harvest … Fourth Month of Harvest | 9–12 | AN–EM |
| Thoth's Month | 1 | MD–EM |
| Hathor's Month | 3 | MD–EM |
| Days upon the Year | extra days | AN–EM |

Festivals: Opening of the Year (flood), Feast of the Valley (harvest), Opet Festival [Opet] (flood), Feast of Drunkenness (flood), Rising of the Dog Star (flood).

**Ethiopian** (months: `ethiopian-13`; days: `week-7`)

- Months: Added Month 13. The other twelve are generated.
- Days: First Day 1, Second Day 2, Third Day 3, Fourth Day 4, Fifth Day 5, Preparation Day 6, Sabbath 7.
- Festivals: Gift of Jewels (harvest), Bonfire of the Flowers (harvest). Christian feasts as `{holy}` only.

**Bantu** (months: `lunar-12-13`; days: `market-4`, `week-7`)

- Months by season: Aloe Month (drought), New-Grass Month (drought), First-Ploughing Month (rain), Budding Month (rain), Overgrown Paths (rain). These attach to any slot of their season.
- Festivals: First Fruits (harvest), Reed Festival (rain), Rain Calling (drought).

**West African** (months: `lunar-12-13`; days: `market-4`, `week-7`)

- Months: none listed; generated.
- Festivals: New Yam Festival (harvest), Festival of the River (rain), Fishing Festival (drought), Masquerade (drought).

### 8.6 East Asia

**Chinese** (months: `chinese-lunisolar`, `julian-12`; days: `decade-10`, `week-7`)

| Months | Position | Eras |
|---|---|---|
| Principal Month | 1 | AN–ST |
| Apricot Month | 2 | AN–ST |
| Peach Month | 3 | AN–ST |
| Pomegranate Month | 5 | AN–ST |
| Lotus Month | 6 | AN–ST |
| Osmanthus Month | 8 | AN–ST |
| Chrysanthemum Month | 9 | AN–ST |
| Sacrifice Month | 12 | AN–ST |
| First Month … Twelfth Month | 1–12 | all (julian-12 in MO uses these too) |
| Leap {ordinal} Month | leap month (after month n) | AN–ST |

Seasonal form: "{position} Month of {season}" (First, Middle, Last) counts as a culture name.

Days: `week-7` (ST on): Sky Day 1, Day One 2 … Day Six 7.

Festivals (`solar-terms-24` positions in order from the start of spring): Start of Spring, Rain Water, Waking of Insects, Spring Equinox, Clear and Bright, Grain Rain, Start of Summer, Grain Full, Grain in Ear, Summer Solstice, Lesser Heat, Greater Heat, Start of Autumn, End of Heat, White Dew, Autumn Equinox, Cold Dew, Frost's Descent, Start of Winter, Lesser Snow, Greater Snow, Winter Solstice, Lesser Cold, Greater Cold. Other festivals: Spring Festival, Lantern Festival, Dragon Boat Festival, Double Seventh, Mid-Autumn Festival, Double Ninth, Cold Food Day.

**Japanese** (months: `chinese-lunisolar`, `julian-12`; days: `decade-10`, `rokuyo-6`, `week-7`)

| Months | Position | Eras |
|---|---|---|
| Affection Month | 1 | AN–EM |
| Extra-Clothes Month | 2 | AN–EM |
| Growing Month | 3 | AN–EM |
| Deutzia Month | 4 | AN–EM |
| Planting Month | 5 | AN–EM |
| Water Month | 6 | AN–EM |
| Letter Month | 7 | AN–EM |
| Leaf Month | 8 | AN–EM |
| Long Month | 9 | AN–EM |
| Frost Month | 11 | AN–EM |
| Teachers-Running Month | 12 | AN–EM |
| First Month … Twelfth Month | 1–12 | ST on |

Month 10 ("Godless Month") belongs to a living religion: **omit**.

Days: `rokuyo-6`: First Win 1, Friend-Pulling 2, First Loss 3, Great Peace 5, Red Mouth 6 (day 4 belongs to a living religion: **omit**). `week-7` (ST on): Sun Day 1, Moon Day 2, Fire Day 3, Water Day 4, Wood Day 5, Metal Day 6, Earth Day 7.

Festivals: `sekku-5`: Seven Herbs Day, Doll Festival, Boys' Day, Star Festival [Tanabata], Chrysanthemum Festival. Others: Season's Division [Setsubun] (winter), Blossom Viewing [Hanami] (spring), Moon Viewing (autumn). The solar terms as Chinese.

**Korean** (months: `chinese-lunisolar`, `julian-12`; days: `decade-10`, `week-7`)

- Months: First Month … Twelfth Month (all eras); "{position} Month of {season}".
- Days (ST on): Sun Day 1, Moon Day 2, Fire Day 3, Water Day 4, Wood Day 5, Metal Day 6, Earth Day 7.
- Festivals: New Year's Morning (spring), Great Full Moon (spring), Cold Food Day (spring), Double Fifth (summer), Autumn Eve [Chuseok] (autumn), Winter Solstice Day (winter). The solar terms as Chinese.

### 8.7 The Americas

**Aztec** (months: `aztec-18`; days and signs: `day-signs-20`)

| Months | Position | Eras |
|---|---|---|
| Ceasing of Water | 1 | AN–EM |
| Little Vigil | 3 | AN–EM |
| Great Vigil | 4 | AN–EM |
| Dryness | 5 | AN–EM |
| Eating of Maize and Beans | 6 | AN–EM |
| Little Feast of the Lords | 7 | AN–EM |
| Great Feast of the Lords | 8 | AN–EM |
| Offering of Flowers | 9 | AN–EM |
| Fall of the Fruit | 10 | AN–EM |
| Sweeping | 11 | AN–EM |
| Return of the Gods | 12 | AN–EM |
| Feast of the Mountains | 13 | AN–EM |
| Precious Feather | 14 | AN–EM |
| Raising of Banners | 15 | AN–EM |
| Falling of Water | 16 | AN–EM |
| Stretching | 17 | AN–EM |
| Growth | 18 | AN–EM |
| Empty Days | extra days | AN–EM |

Month 2 ("Flaying of Men"): **omit**.

Day signs (positions 1–20): Crocodile, Wind, House, Lizard, Serpent, Death, Deer, Rabbit, Water, Dog, Monkey, Grass, Reed, Jaguar, Eagle, Vulture, Movement, Flint, Rain, Flower.

Festivals: the month names above, as festivals of their month (§5.3 `monthly`); New Fire (drought; once in 52 years, so at weight 1).

**Maya** (months: `maya-haab`; days and signs: `day-signs-20`)

- Months: generated; Nameless Days for the extra days.
- Day signs (positions 1–20): Crocodile, Wind, Night, Seed, Serpent, Death, Deer, Star, Water, Dog, Monkey, Road, Reed, Jaguar, Eagle, Owl, Earth, Flint, Storm, Lord.
- Festivals: generated (§9.4).

### 8.8 The Pacific and the Andes

**Polynesian** (months: `lunar-12-13`; days: `moon-nights-30`)

- Months: generated, from season and working words only.
- Nights of the moon (positions): Faint Thread 1, Crescent 2, Hidden 7, Unfolding 8, Fruit 13, Star 14, Full 15, Dripping 17, Overshadowed 29, Cut Off 30. Nights named for gods: **omit**.
- Festivals: generic seasonal and working festivals only (fishing, planting, harvest). Makahiki and Matariki are blocked (§13.1).

**Andean** (months: `lunar-12-13`, `julian-12`; days: `week-7` EM on)

- Months by season: Great Ripening (rain), Earth Ripening (rain), Maize Harvest (harvest), Harvest Month (harvest), Earth-Breaking (frost), Water Month (frost).
- Festivals: generic only. Inti Raymi is blocked (§13.1).

### 8.9 General

General has no culture names, except the sky lore names marked "general" in §8.10–§8.11.

### 8.10 Constellations

| Culture | Names |
|---|---|
| general, norman-british | the Great Bear, the Little Bear, the Plough, the Hunter, the Seven Sisters, the Swan, the Eagle, the Dragon, the Lyre, the Crown, the Cup, the Crow, the Arrow, the Dolphin, the Southern Cross (all flag list, §13.2) |
| anglo-saxon | the Wain |
| norse | the Wain, Frigg's Distaff, Thiazi's Eyes, Aurvandil's Toe |
| celtic | the Court of Dôn, Arianrhod's Castle |
| roman, greek-byzantine | the twelve signs (§8.11), plus the general list |
| slavic | the Great Ladle, the Sieve |
| steppe | the Golden Stake, the Iron Stake, the Seven Robbers, the Two Horses |
| arabic-persian | the Daughters of the Bier, the Many Little Ones, the Follower |
| chinese | the Northern Dipper, the Weaving Girl, the Ox Herd, the Heavenly Market Enclosure, the Supreme Palace Enclosure |
| egyptian | the Bull's Foreleg, the Hippopotamus, the Crocodile |
| bantu | the Digging Stars, the Three Zebras |
| aztec | the Fire Drill, the Scorpion, the Ball Court |
| maya | the Turtle, the Scorpion |
| polynesian | the Fishhook, the Canoe, the Bird |
| andean | the Llama, the Toad, the Serpent, the Partridge, the Fox |
| indian | **omit** (the Seven Sages belong to a living religion) |

### 8.11 Star signs

| System | Names, in order |
|---|---|
| `zodiac-12` | the Ram, the Bull, the Twins, the Crab, the Lion, the Maiden, the Scales, the Scorpion, the Archer, the Sea-Goat, the Water-Bearer, the Fishes |
| `animals-12` | Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig (japanese: Boar for Pig; steppe: Mouse for Rat, Hare for Rabbit, Sheep for Goat, Hen for Rooster) |
| `mansions-28` (chinese) | Horn, Neck, Root, Room, Heart, Tail, Winnowing Basket, Dipper, Ox, Girl, Emptiness, Rooftop, Encampment, Wall, Legs, Bond, Stomach, Hairy Head, Net, Turtle Beak, Three Stars, Well, Ghost, Willow, Star, Extended Net, Wings, Chariot |
| `mansions-28` (arabic-persian) | the Two Signs, the Little Belly, the Many Little Ones, the Follower, the White Spot, the Brand, the Forearm, the Gap, the Glance, the Forehead, the Mane, the Changer, the Barker, the Unarmed, the Covering, the Claws, the Crown, the Heart, the Sting, the Ostriches, the City, Luck of the Slaughterer, Luck of the Swallower, Luck of Lucks, Luck of the Tents, the First Spout, the Second Spout, Belly of the Fish |
| `day-signs-20` | as the day signs in §8.7 |
| `nakshatras-27`, `decans-36` | none: generated only |

The zodiac names are all on the flag list (§13.2).

### 8.12 Wanderers and lights

`classical-7` slots: 1 Saturn, 2 Jupiter, 3 Mars, 4 Sun, 5 Venus, 6 Mercury, 7 Moon.

| Culture | Names (slot) |
|---|---|
| chinese, korean, japanese | Earth Star (1), Wood Star (2), Fire Star (3), Metal Star (5), Water Star (6); Milky Way: River of Heaven (chinese), Silver River (japanese, korean); comet: Broom Star; nova: Guest Star |
| greek-byzantine | the Shining (1), the Blazing (2), the Fiery (3), the Light-Bringer (5), the Evening Star (5), the Gleaming (6) |
| egyptian | Red Horus (3) |
| maya | the Great Star (5) |
| aztec | comet: the Smoking Star |
| norse | Milky Way: the Winter Way |
| steppe | Milky Way: the Seam of the Sky |
| arabic-persian | Milky Way: the Straw Road |
| andean | Milky Way: the River |
| general, anglo-saxon, norman-british, celtic, roman, slavic | the Morning Star (5), the Evening Star (5) (flag list) |

---

## 9. Shapes

Columns: weight within the kind; eras; cultures; tone; example. "all" in cultures means every culture where the kind is offered. The culture names row draws §8.

In a series, a slot's **season** filters season-tagged words (`s`): only words tagged for that season, or untagged, are drawn. In separate mode, any season of the land is drawn.

### 9.1 Months

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| culture names | 25 | all | all | – | Hay Month, Little Vigil |
| `{seasonWord} Month` | 25 | all | all | plain | Thaw Month, Lambing Month |
| `Month of {seasonWord}` | 6 | all | all | grand | Month of Frost |
| `{season} Month` | 4 | all | all | plain | Winter Month |
| `{position} Month of {season}` | 4 | all | all; chinese, korean, steppe, egyptian ×3 | plain | Middle Month of Spring |
| `{seasonWord}` (one word) | 6 | all | all | strange | Leaf-Fall, Meltwater |
| `{crop}-Sowing` / `{crop} Harvest` | 5 | all | all | plain | Barley Harvest |
| `{tree} Month` | 4 | all | all | – | Birch Month |
| `{wildAnimal} Month` / `{bird} Month` | 5 | all | all | – | Wolf Month, Cuckoo Month |
| `{god:poss} Month` | 6 | all | non-sensitive | grand | Storm Lord's Month |
| `{ordinal} Month` | 4 | all | all; roman, chinese, korean, japanese ×3 | plain | Seventh Month |
| `Before {turning}` / `After {turning}` | 4 | AN–MD | anglo-saxon ×3, celtic, norse | – | Before Yule (pairs only in series, §10.2) |
| `Little {pairFeast}` / `Great {pairFeast}` | 4 | AN–EM | aztec ×3, maya | – | Little Feast of the Weavers |
| `Month of the {festival}` | 4 | AN | greek-byzantine, roman ×3 | grand | Month of the Lantern Feast |
| `Hungry Month` / `Lean Month` / `Dead Month` (fixed) | 2 | all | all | grim | – |

- `{turning}`: Yule, Midsummer, Midwinter, the Thaw, the Rains, the Flood, the Harvest.
- `{pairFeast}`: Vigil, Feast of the Lords, Feast of the {skyFigure:pl}, Dance, Rains, Offering.
- `{position}`: First, Middle, Last (from the slot's position in its season).
- `{festival}`: one festival name of this module (§9.4), without "Feast of" or "Festival of".

### 9.2 Leap months and extra days

| Shape | Weight | Kind | Example |
|---|--:|---|---|
| culture name for the leap month | 50 | leap | Third Midsummer, Wages Month |
| `Second {previous}` | 20 | leap | Second Hay Month |
| `Leap {previous}` | 10 | leap | Leap Seventh Month |
| `Extra Month`, `Added Month`, `Thirteenth Month` (fixed) | 20 | leap | – |
| culture name for the extra days | 50 | extra | Empty Days, Days upon the Year |
| `the {extraDays} Days` | 30 | extra | the Nameless Days |
| `{seasonWord} Days` | 10 | extra | Thaw Days |
| `Year Day` (fixed-13), `the Winter Days` (romulus-10) | – | extra | always used for those systems |

`{previous}` is the name of the month before, as printed. The leap shapes `Second` and `Leap` are skipped when `{previous}` already starts with Second, Leap or a number word.

### 9.3 Days

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| culture names | 25 | all | all | – | Washing Day, Fire Day |
| `{dayWork} Day` | 20 | all | all | plain | Market Day, Wash Day |
| `{god:poss} Day` | 12 | all | non-sensitive | grand | Storm Lord's Day |
| `{light} Day` (neutral sky names, §9.8; possessive when the name ends in a `skyKin` word) | 10 | all | all | – | Red Wanderer Day, Pale Sister's Day |
| `{dayElement} Day` | 10 | all | chinese, japanese, korean, steppe | – | Wood Day |
| `{ordinal} Day` | 8 | all | all | plain | Fifth Day |
| `{goods} Market Day` | 10 | all | bantu, west-african, roman (nundinal) | plain | Salt Market Day |
| `{town} Market Day` | 6 | all | bantu, west-african, roman (nundinal) | plain | Fenwick Market Day |
| day sign: `{wildAnimal}` / `{bird}` / `{daySign}` | 15 | all | aztec, maya | – | Heron, Flint |
| `{number} {daySign}` | 8 | all | aztec, maya | – | Four Jaguar |
| night: `{moonPhase}` | 15 | all | polynesian | – | Thin Moon, Rising Night |
| `Shift {ordinal}`, `{ordinal} Sol`, `Rest Cycle`, `Port Day`, `Maintenance Day` (light), `Ration Day` (grim) | 20 | NF–IS | all | – | Third Sol |

- `{goods}`: SD/MC goods lists for the culture.
- `{daySign}`: Reed, Flint, House, Wind, Rain, Flower, Movement, Water, Grass, Earth, Storm, Road, Seed, Star, Night, Death (grim), Smoke, Mirror, Knife, Shell.
- `{moonPhase}`: Thin Moon, Bow Moon, Rising Night, Half Night, Round Night, Bright Night, Fading Night, Dark Night, Last Light, Sleeping Moon.

### 9.4 Festivals

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| culture names | 25 | all | all | – | Bright Fire, Mothers' Night |
| `Feast of {seasonWord}` | 10 | all | all | – | Feast of First Fruits |
| `{seasonWord} Home` | 3 | all | all | light | Hay Home |
| `{season} Fire` / `{seasonWord} Fires` | 5 | AN–EM | all | – | Winter Fire |
| `Night of {festNoun}` | 8 | all | all | strange | Night of Lanterns |
| `Day of the {festNoun}` | 5 | all | all | – | Day of the Ancestors |
| `Festival of {festNoun}` | 6 | all | all | – | Festival of Kites |
| `{crop} Festival` | 6 | all | all | plain | Barley Festival |
| `Feast of {god}` / `{god:poss} Day` | 8 | all | non-sensitive | grand | Feast of the Storm Lord |
| `Feast of {holy}` / `{holy:poss} Day` / `{holy:poss} Eve` | 8 | MD on | christian | – | Saint Aldhelm's Eve |
| `Blessing of {festBlessing}` | 4 | all | christian ×1; others ×0.5 | – | Blessing of the Boats |
| `{kin:pl}' Night` | 3 | all | all | – | Grandmothers' Night |
| `Burning of the {thing}` | 3 | all | all | strange | Burning of the Old Year |
| `Running of the {livestock:pl}` | 3 | all | all | light | Running of the Goats |
| `{figure:poss} Games` | 3 | AN–EM | all | grand | King's Games |
| `{town} Fair` | 6 | MD on | all | plain | Saltgate Fair |
| `{town} Wakes` | 2 | ST | norman-british, general | plain | Ashby Wakes |
| `Founders' Day`, `Charter Day`, `Landing Day` (fixed) | 4 | EM on | all | plain | – |
| `{founder} Day` | 4 | ST on | all | – | Harrow Day |
| `{event} Day` | 4 | ST on | all | – | Saltgate Day |
| `{realm} Day` | 3 | ST on | all | grand | Ashmark Day |
| `Landfall Day`, `Launch Day`, `First Light`, `Signal Day`, `Long Dark` (grim), `Quarantine's End` | 20 | NF–IS | all | – | – |
| `{star} Night`, `Perihelion Night` | 8 | NF–IS | all | strange | Vega Night |

- `{kin}`: Mothers, Fathers, Grandmothers, Ancestors, Sisters, Maidens, Shepherds, Fishers.
- `{thing}`: Old Year, Boats, Winter, Straw Man, Ploughs, Brooms.

### 9.5 Full moons

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `{seasonWord} Moon` | 30 | all | all | – | Lambing Moon, Harvest Moon |
| `{wildAnimal} Moon` / `{bird} Moon` | 12 | all | all | – | Wolf Moon, Crane Moon |
| `{tree} Moon` / `{crop} Moon` | 8 | all | all | – | Barley Moon |
| `Moon of {seasonWord}` | 6 | all | all | grand | Moon of Frost |
| `{skyFigure:poss} Moon` | 4 | all | all | – | Hunter's Moon |
| `{colour} Moon` | 4 | all | all | strange | Red Moon |
| `{god:poss} Moon` | 3 | all | non-sensitive | grand | Lady of Ash's Moon |
| leap moon: `Lone Moon`, `Extra Moon`, `Wandering Moon`, `Spare Moon` (light), `Stolen Moon` (strange), `Blue Moon` (flag) | – | all | all | – | only for a 13th moon (§10.5) |

### 9.6 Constellations

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| culture names | 15 | all | all | – | the Golden Stake |
| `the {wildAnimal}` / `the {bird}` / `the {creature}` | 18 | all | all | – | the Elk, the Heron |
| `the Great {beast}` / `the Little {beast}` | 8 | all | all | – | the Great Boar |
| `the {skyFigure}` | 12 | all | all | – | the Weaver |
| `the {skyObject}` | 12 | all | all | plain | the Sickle |
| `the {skyFigure:poss} {skyObject}` | 10 | all | all | – | the Ploughman's Net |
| `the {beast:poss} {skyBodyPart}` | 6 | all | all | – | the Wolf's Jaw |
| `the {numberWord} {group}` | 6 | all | all | – | the Five Brothers |
| `{god:poss} {skyObject}` | 6 | all | non-sensitive | grand | the Storm Lord's Spear |
| `the {colour} {beast}` | 4 | all | all | strange | the White Hare |
| `the {skyObject} of the {skyFigure}` | 4 | all | polynesian ×3, others ×1 | – | the Canoe of the Fisherman |
| fantastic (`h`): `the Dragon's {skyBodyPart}`, `the Wyrm`, `the Unicorn`, `the Witch's {skyObject}`, `the Giant's {skyObject}` | 10 | all | non-sensitive | – | the Dragon's Eye |
| `the Ark`, `the Lander`, `the Antenna`, `the Old Sun`, `the Home Star`, `the Probe` | 15 | NF–IS | all | – | – |

- `{beast}`: any of the land's wild animals, birds, creatures or livestock.
- `{group}`: Brothers, Sisters, Kings, Dancers, Hunters, Maidens, Thieves, Old Men, Hounds, Geese. `{numberWord}`: Three, Five, Seven, Nine.

### 9.7 Star signs

Separate signs are drawn from §9.6 with these weights changed: culture names 30 (the culture's sign names, §8.11), `the {beast}` 25, `the {skyFigure}` 15, `the {skyObject}` 15; no possessive or numbered shapes. In a zodiac series, §10.6.

### 9.8 Wanderers and lights

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| culture names | 20 | all | all | – | the Broom Star |
| `the {skyQuality} Wanderer` | 15 | all | all | – | the Red Wanderer |
| `the {skyQuality} {skyKin}` | 12 | all | all | – | the Pale Sister |
| `{god:poss} Lamp` / `{god:poss} Star` | 6 | all | non-sensitive | grand | the Storm Lord's Lamp |
| `the Morning {herald}` / `the Evening {herald}` | 6 | all | all | – | the Evening Lamp |
| `the {skyQuality} Moon` / `the Little Moon` / `the {skyKin} Moon` | 6 | all | all | – | the Bride Moon |
| `the {skyRiver} of {skyHeaven}` | 10 | all | all | – | the Road of Souls |
| `the {colour} {skyRiver}` | 4 | all | all | – | the Silver Road |
| `the {colour} Comet` / `the {beast}-Tail Star` | 6 | all | all | strange | the Fox-Tail Star |
| `the {skyQuality} Guest` | 4 | all | all | strange | the Bright Guest |
| `the Day Eye` / `the Great Lamp` / `the Night Eye` (fixed) | 3 | all | all | grand | – |
| `Old Sun`, `Home Star`, `the Bright Neighbour`, `the Gas Giant`, `the Ring World` (light) | 15 | NF–IS | all | – | – |

`{herald}`: Star, Lamp, Herald, Lady, Watcher, Bringer.

The **neutral sky names** used by days (§9.3) are the same shapes with gods excluded.

### 9.9 Genre additions

- **Fantastic** (`h: true`): months `{fantasticNoun} Month` (Witch Month, Dragon Month, Fair Folk Month; weight 8); festivals `Night of the {fantasticFolk}` (Night of the Fair Folk, Night of the Wild Hunt (flag), Night of Ghosts; weight 8), `Moon-Dark Eve`, `Eclipse Feast` (weight 4); full moons `Dragon Moon`, `Witch Moon`, `Ghost Moon` (weight 6).
- **Steampunk** (`h: true`, ST): festivals `Exhibition Day`, `Engine Day`, `Aether Night` (weight 6); days `Gear Day` (light; weight 2).
- **Space biomes:** months use `{ordinal} Cycle` (20), `{star} Month` (10), `Month of {founder}` (5), `{spaceLand} Month` (8), and the seasonless shapes of §9.1 only; days use the NF–IS row of §9.3.

---

## 10. Series

### 10.1 General rules

| Kind | Series text | System | Lines |
|---|---|---|---|
| months | as one calendar | year system (§5.1) | the months in ring order from the start, then the leap month (where it falls) and the extra days line |
| days | as one week | week system (§5.2) | the days in order from day 1 |
| festivals | as one year | festival cycle (§5.3) | the festivals in order from the start |
| full moons | as one year of moons | the year system's months (§10.5) | one moon per month, plus a 13th at 7 in 19 |
| star signs | as one zodiac | sky system (§5.4) | the signs in the system's order |
| wanderers and lights | as one sky | classical-7 | the seven lights in order |

- **The batch size is ignored** in a series: a series always gives its system's full count (as many lines as the system has).
- **Real names cap:** at most half the lines (rounded down) are culture names (§8.1). Real names are tested slot by slot in a random order, so the cap doesn't always favour early slots.
- **One theme** per series (§10.2–§10.7); every generated line uses shapes from it.
- **No word twice:** no season word, beast, object, figure, god or day word repeats in one series. If a slot can't be filled without a repeat after 20 tries, it may take any shape of the kind.
- **Deterministic:** one seeded stream for the whole series, as MC §9.

### 10.2 Months: themes

| Theme | Weight | Generated lines use |
|---|--:|---|
| seasons | 40 | `{seasonWord} Month`, `Month of {seasonWord}`, `{seasonWord}` (one word), with each slot's season |
| work | 15 | `{workWord} Month` with each slot's season |
| nature | 15 | `{tree} Month`, `{wildAnimal} Month`, `{bird} Month`, `{crop}-Sowing`, `{crop} Harvest` |
| gods | 10 | `{god:poss} Month` with distinct gods (non-sensitive cultures) |
| ordinal | 5 | `{ordinal} Month` (roman, chinese, korean, japanese ×3) |
| positions | 5 | `{position} Month of {season}` (chinese, korean, steppe, egyptian ×4) |
| festivals | 10 | `Month of the {festival}` (greek-byzantine, roman ×3) |

- **Pairs (seasons theme):** anglo-saxon, celtic and norse, AN–MD, at 50%: two neighbouring slots take `Before {turning}` and `After {turning}`, where the turning is the season the slots straddle or sit in (Yule for winter, Midsummer for summer, the Rains for rain…).
- **Pairs (aztec, maya):** at 50%, two neighbouring slots take `Little {pairFeast}` and `Great {pairFeast}`.
- In a space biome only the ordinal, gods and festival themes and §9.9's space shapes are used.

### 10.3 Days: themes

| Theme | Weight | Generated lines use |
|---|--:|---|
| planets | 30 | `{light} Day`, each day the neutral sky name of its slot's planet (§5.2) from one sky series (§10.7) drawn for the batch |
| gods | 20 | `{god:poss} Day` with distinct gods (non-sensitive cultures) |
| work | 25 | `{dayWork} Day`, distinct, with Rest Day or Market Day at most once each |
| ordinal | 15 | `{ordinal} Day`, with one day (the week's last) as Rest Day at 50% |
| elements | 10 | chinese, japanese, korean, steppe only: `{dayElement} Day` for five slots and the sun and moon slots from the planets theme |

- `market-4` and `nundinal-8`: themes towns (40; `{town} Market Day`, one town per day), goods (40; `{goods} Market Day`), ordinal (20). In `nundinal-8`, day 1 is always a market day.
- `day-signs-20`: one theme: beasts and forces (`{wildAnimal}`, `{bird}`, `{daySign}`), distinct.
- `moon-nights-30`: one theme: `{moonPhase}`, following the moon (the waxing words before night 15, Round Night or Full at night 15, the fading words after); words may repeat here with an ordinal (*Second Rising Night*).
- `rokuyo-6`, `soviet-5`: ordinal and colour themes only (`{colour} Day` for soviet-5).

### 10.4 Festivals

- One festival per position of the cycle (§5.3), each from the season of its slot.
- `solar-terms-24`: the chinese culture names in order as the real lines (still within the half cap); generated lines use `Start of {season}`, `{weather} {season}` and `{seasonWord}` shapes, where `{weather}`: Lesser, Greater, Cold, Warm, White, Clear.
- `sekku-5`: generated lines use `{tree} Festival`, `{bird} Day`, `{festNoun} Festival`.
- `monthly`: each festival may take its month's name (aztec) or a `Feast of {seasonWord}`.
- Themes: seasons (40), gods (20; non-sensitive), work (20), commemorations (20; ST on only: `{founder} Day`, `{event} Day`, `Founders' Day`…).

### 10.5 Full moons

- **Count:** the months of the year system for the culture and era (§5.5), without extra days. For lunar and lunisolar systems, the year's leap month gives a 13th moon. For solar systems (`julian-12`, `egyptian-civil`, `ethiopian-13`, `persian-solar`, `aztec-18`, `maya-haab`, `fixed-13`, `icelandic-12`, `darian-24`), there are **12** moons, and a 13th at 7 in 19; `aztec-18` and `maya-haab` count 12 (moons are not their months).
- Each moon takes its month slot's season. The 13th takes a leap moon name (§9.5).
- Theme: seasons (50), nature (35), mixed (15).

### 10.6 Star signs: themes

| System | Themes |
|---|---|
| `zodiac-12`, `nakshatras-27`, `decans-36` | beasts (40), figures (30), objects (30); one theme for the whole zodiac, or for `zodiac-12` at 30% a mixed zodiac of beasts and figures |
| `animals-12` | beasts only: the land's wild animals and livestock, distinct, with the culture's flavour animals (BT `cultureAnimals`) ×3 |
| `mansions-28` | objects (50), body parts (`the {skyBodyPart}`, `the {beast:poss} {skyBodyPart}`; 50) |
| `day-signs-20` | beasts and forces, as §10.3 |

### 10.7 Wanderers: as one sky

- Seven lines, slots 1–7 (§5.4).
- Slot traits guide the shapes: Saturn `skyQuality` Slow, Dim, Golden; Jupiter Bright, Faithful; Mars Red, Fierce, Restless; the Sun `the Day Eye`, `the Great Lamp`, `{god:poss} Lamp`; Venus `the Morning {herald}` or `the Evening {herald}` (50/50), Bright, Silver; Mercury Swift, Hidden, Restless; the Moon `the {skyQuality} Moon` or `the Night Eye`.
- Theme: kin (`the {skyQuality} {skyKin}`; 40), wanderers (`the {skyQuality} Wanderer`; 40), gods (20; non-sensitive).
- **The batch's sky names** (used by the days planets theme) are this series' lines for slots 1–7, drawn once per batch.

### 10.8 Display and the system line

- Each line of a months, festivals or full moons series is tagged with its season for display only, as section tags (*Thaw Month · the thaw*). Inserting uses the name alone.
- The leap month is tagged *leap month*; the extra days line is tagged *extra days*, with the number of days (*Empty Days · extra days, 5*).
- The **system line** goes under the batch as a notice (the shortfall-notice mechanism, as MC §10.5): `Calendar: {source}.`, `Week: {source}.`, `Festivals: {source}.`, `Zodiac: {source}.` or `Sky: {source}.` It is not a name and can't be starred.

---

## 11. Rendering

- Capitals and possessives as GN §11 (OUP: *Mothers' Night*, *Thor's Day*, *Storm Lord's Day*).
- "the": lower case, constellations, signs (except `animals-12` and `day-signs-20`, which are bare), and wanderers (§9.6–§9.8). Months, days, festivals and moons take no article.
- Hyphens as written in §7–§9 (*Leaf-Fall*, *Three-Milkings Month*, *Sea-Goat*).
- Every name passes `repeatsContent` (*Frost Moon of Frost* is redrawn).
- Cap: 7 words.

---

## 12. Tone

As TS §2. Shapes and pool entries with a tone count as that tone; culture names take their row's tone, or none. Polynesian and andean never take light or grim (§3.2).

---

## 13. Safeguards

### 13.1 Block list

Whole-name matches (case-insensitive, leading "the" ignored) are redrawn. Add to `time-sky.json`; safeguard packs can add, not remove.

- **Plain English names of the real calendar and sky** (rule 1 of this brief): January, February, March, April, May, June, July, August, September, October, November, December; Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday; Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces; Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, the Sun, the Moon, the Milky Way; Orion, Orion's Belt, Cassiopeia, Andromeda, Perseus, Pegasus, Hercules, Cepheus, Draco, Argo, the Pleiades, Charles's Wain, Arthur's Wain.
- **Great holy days of living religions:** Christmas, Easter, Good Friday, Ash Wednesday, Pentecost, Whitsun, Epiphany, All Souls; Ramadan, Eid, Eid al-Fitr, Eid al-Adha, Mawlid, Ashura; Passover, Pesach, Yom Kippur, Rosh Hashanah, Hanukkah, Purim, Sukkot, Shavuot; Diwali, Deepavali, Holi, Navaratri, Durga Puja, Dussehra, Pongal, Onam, Raksha Bandhan, Makar Sankranti; Vaisakhi, Baisakhi; Vesak, Bodhi Day, Obon, Bon, Ghost Festival; Mehregan, Sadeh; Festival of Lights, Day of the Dead.
- **Living indigenous festivals:** Inti Raymi, Matariki, Makahiki, Puanga, Sun Dance, Umhlanga.
- **Real commemorations and secular holidays:** Guy Fawkes Night, Burns Night, Bastille Day, Anzac Day, Australia Day, Canada Day, Juneteenth, Kwanzaa, Cinco de Mayo, Oktoberfest, Valentine's Day, Saint Patrick's Day.
- **Brands:** Subaru.
- **Fiction:** Afteryule, Foreyule, Solmath, Rethe, Astron, Thrimidge, Forelithe, Afterlithe, Wedmath, Halimath, Winterfilth, Blotmath, Lithe, Sterday, Trewsday, Hevensday, Mersday, Highday; Sun's Dawn, First Seed, Rain's Hand, Second Seed, Mid Year, Sun's Height, Last Seed, Hearthfire, Frostfall, Sun's Dusk, Sundas, Morndas, Tirdas, Middas, Turdas, Fredas, Loredas; Hammer, Alturiak, Ches, Tarsakh, Mirtul, Kythorn, Flamerule, Eleasis, Eleint, Marpenoth, Uktar, Nightal, Greengrass, Highharvestide, Shieldmeet, Feast of the Moon; Fireseek, Coldeven, Growfest, Flocktime, Wealsun, Richfest, Goodmonth, Patchwall, Ready'reat, Sunsebb, Needfest; Hogswatch, Hogswatchnight, Octeday, Soul Cake Tuesday, Sektober, Juvember, Febtober, Spune, Grune, Offle; Sickle of the Valar, Swordsman of the Sky, the Netted Stars, the Ice Dragon, the Crone's Lantern, the Moonmaid; Stardate.
- **Kind-only blocks:** in months, Morning Star and Evening Star (fictional months; both are allowed in sky lore).
- **Sets:** an "as one zodiac" series may not contain four or more of: the Warrior, the Mage, the Thief, the Lady, the Steed, the Lord, the Lover, the Shadow, the Tower, the Serpent, the Ritual, the Atronach, the Apprentice. If it does, the zodiac is redrawn.

### 13.2 Flag list

Allowed by default: Midsummer, Midwinter, Yule, Harvest Moon, Hunter's Moon, Wolf Moon, Blue Moon, Harvest Home, May Day, Lammas, Michaelmas, Candlemas, Martinmas, Lady Day, Plough Monday, Hocktide, Shrovetide, Twelfth Night, Wakes Week, Bank Holiday, Bonfire Night, Hallowe'en, Hogmanay, Walpurgis Night, Thanksgiving, Mother's Day, Boxing Day, New Year's Day, Independence Day, Victory Day, Labour Day, Remembrance Day, Armistice Day, Mardi Gras, Carnival, Night of the Wild Hunt, Samhain, Beltane, Imbolc, Lughnasadh, Nowruz, Chuseok, Spring Festival, Mid-Autumn Festival, Lantern Festival, Dragon Boat Festival, the Morning Star, the Evening Star, the zodiac names (§8.11), the general constellations (§8.10), the Seven Sisters, the Three Kings, the Long Night, Sabbath.

### 13.3 Banned words

In any position, in this module only: the money module's list (MC §13.3); and Christ, Jesus, Allah, Muhammad, Krishna, Shiva, Vishnu, Rama, Lakshmi, Ganesh, Durga, Kali, Buddha, Bodhisattva, Guru, Nanak, Kami, Amaterasu, Inari, Ahura, Mazda, Olodumare, Orisha, Obatala, Ogun, Shango, Ifa, Yemoja, Oshun, Pele, Pachamama, Inti, Viracocha, Kanaloa, Tangaroa, Tengri.

### 13.4 Living religions

WR §10.1, DS:

- DS's `breaksDeityWords` runs on **every** name.
- DS's `hasRealDivineName` runs on every **generated** name (not on culture names, §8.1).
- `{holy}` only for christian cultures; `{god}` only from DS's invented titles, never for the sensitive cultures.
- No month, day or festival names of living-religion calendars, as §8 marks them **omit**.

### 13.5 Safeguard packs

`type: settlement-safeguards` (RN §12.6) apply here too.

---

## 14. Presets

```yaml
---
type: module-preset
module: calendar-names
packName: Danelaw year
culture: anglo-saxon
kind: month
era: MD
fantastic: false
biome: homeland
start: own
words: translated
tone: any
people: placeholders
series: on
---

Anglo-Saxon months of the medieval era, in a realistic world, set in their homeland, starting in their own new year, of any tone, with placeholders for gods and people, as one calendar.
```

```yaml
---
type: module-preset
module: sky-names
packName: Steppe sky
culture: steppe
kind: sign
era: MD
fantastic: false
biome: homeland
tone: any
people: invented
series: on
---

Turkic & Mongol steppe star signs of the medieval era, in a realistic world, seen from their homeland, of any tone, with invented gods and people, as one zodiac.
```

| Key | Values | Default |
|---|---|---|
| `culture`, `era`, `fantastic`, `tone`, `people` | as RN §13 | as there |
| `kind` | a kind key of the module | `month`; `constellation` |
| `biome` | `homeland`, a biome id or a pack path | `homeland` |
| `start` | `own` or a season key | `own` |
| `words` | `translated`, `loanwords` | `translated` |
| `series` | `off`, `on` | `off` |

A preset with `series: on` where the kind has no system runs as `off`; a `start` the land lacks runs as `own`. Default preset name: `"{culture} · {kind menu}"`.

---

## 15. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Data.** Pools and the `s` key (§7); `time-sky.json` with systems, the system table, season cycles, homelands, new years, culture names, shapes, themes and safeguards; register rows | §16.1 passes; every existing test and regression fixture passes unchanged |
| M2 | **Calendar engine.** Months, days, festivals and full moons: separate draws, the year layout (§6.2), series (§10.1–§10.5), loans, rendering, safeguards | §16.2–§16.5 pass |
| M3 | **Sky engine.** Constellations, signs and wanderers; zodiac and sky series; the days planets theme reading the sky series | §16.6 passes |
| M4 | **Modules.** Sections, both sentences, resets, history, presets, display tags and system line; README section; rebuilt `main.js` | §16.7 passes; both modules generate in the app |

---

## 16. Tests (`tests/timeSky.test.ts`)

### 16.1 Data

- Every system in §5 is present with the counts given; no other system exists.
- Every cell of the §5.5 tables names a listed system, and shares in a cell sum to 100.
- Every season cycle's shares sum to 12; every new-year season exists in the culture's homeland cycle or carries into one.
- Every culture-name row's position is within its system's count, and every season tag is a key of §6.1.
- No culture-name row matches the block list or a banned word.
- Other modules' output is identical, seed for seed (existing fixtures); french, dutch, iberian and american are not in either module's menu.

### 16.2 Coverage and determinism

- Same options and seed give the same names and series.
- Every culture × era × kind offered × biome (homeland and three others) × people, separate: 20 unique names within the cap.
- Every culture × era × kind with a series: one series generates.

### 16.3 Counts

- A months series has exactly the system's months, plus at most one leap month and one extra days line, as §5.1 says. Over 1,900 seeded calendars of `bede-12`, the leap month appears 700 ± 60 times.
- A days series has exactly the week system's days; a festivals series exactly the cycle's festivals; a zodiac exactly the sign count; a sky exactly 7.
- A series ignores the batch size.

### 16.4 Real names

- Over 2,000 series across cultures, no series has more than half its lines (rounded down) as culture names.
- No series reproduces a culture's full list for its system.
- A numbered culture name appears only at its own position counted from the new year (e.g. *Seventh Month* is the seventh month of the Roman year whatever the start).
- Loanword mode: loans only in festivals, at roughly 70% of loan-capable draws (±5% over 5,000); translated mode: no loan forms at all.

### 16.5 Seasons and the start

- Temperate, start spring: the first line is tagged spring; lines follow the cycle order.
- Start "their own new year", anglo-saxon, britain: the first line is in winter (slot offset 1).
- Season-tagged words appear only in their seasons in a series.
- Space biome: no season tags, no start link, no full moons kind.

### 16.6 Sky

- `animals-12`: twelve distinct beasts, at most six of them the culture's real animals.
- `classical-7`: slot 5 is a morning or evening name; slot 3's quality is Red, Fierce or Restless when generated.
- The days planets theme for a batch uses the same sky names as a sky series drawn with the same seed.
- 10,000 names across options: 0 block-list matches, 0 banned words, no `{god}` in polynesian or andean, no light or grim tone in polynesian or andean, no zodiac with four or more names from the §13.1 set.

### 16.7 Sentences and presets

- Default calendar plain text: "Norman & British months of the medieval era, in a realistic world, set in their homeland, of any tone, with placeholders for gods and people, each one separate."
- Default sky plain text: "Norman & British constellations of the medieval era, in a realistic world, seen from their homeland, of any tone, with placeholders for gods and people, each one separate."
- The start link shows only with a series of months, festivals or full moons, outside space biomes.
- The words link shows only for festivals in the eight cultures of §2.3.
- `calendarNames` and `skyNames` are the last two entries of `SECTION_GROUPS.advanced`, after `moneyNames`.
- Resets as §2.4; preset round-trips, including the fall-backs in §14.

---

## 17. Parked

- Hours and watches of the day (canonical hours, ships' watches, the Roman hours).
- Year names and cycles (*Year of the Metal Rat*); events and eras already has cyclical-year event names.
- The 260-day count's numbered days as a whole (13 × 20) and the 52-year round.
- Multiple moons and suns for fantasy and alien worlds (counts would have to be chosen, against the real-systems rule).
- A world's own calendar linked from realms, or from events and eras' eras.
- A **Calendar** section in the settlement kit.
- More systems: the French Republican calendar (if French becomes a full culture), the Igbo eight-day week, the Akan 42-day cycle, the Coligny names once their meanings are better settled.
- Mottos, demonyms and named things (from the gaps list).
