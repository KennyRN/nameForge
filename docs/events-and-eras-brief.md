# Events and eras – brief (first release)

This brief adds a new module group, **history and faith**, and its first module, **events and eras**. It names the past of a world:

- **wars and battles:** *War of the Salt Wells*, *Twelve Years' War*, *Second Fenwick War*, *Battle of the Ford*
- **rebellions:** *[leader]'s Rebellion*, *Green Ribbon Rising*, *Metal Rat Rising*
- **treaties and accords:** *Treaty of Saltgate*, *Compact of the Seven Wells*
- **successions and crises:** *Year of Three Kings*, *Disturbance of the Long Peace Years*
- **migrations and foundings:** *Long Walk*, *Landing at Ashby*
- **disasters:** *Great Fire*, *Grey Plague*, *Year of Ash*, *Year Without Summer*
- **collapses:** *Fall of Fenwick*, *Sundering*, *Breaking of the Crown*
- **eras and ages:** *Age of Salt*, *Years of Ash*, *Age of the Sixth Sun*, *Bright Peace Era*, *Long Night*

It is built from `docs/worldbuilding-research-reference.md` (WR §8, §9, §14). It uses the shared vocabulary and vocabulary packs (RN §3), so later research adds words without code. It accepts the **settlement context** (SK §3), and its M3 adds a **History** section to the settlement kit, which SK §14 parked.

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow `docs/route-names-brief.md` (RN), `docs/settlement-kit-brief.md` (SK), `docs/group-names-brief.md` (GN) and `docs/group-tone-and-series-brief.md` (TS). Reuse existing helpers. All output is in modern English. Real events are models, never outputs (§11).

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Group | New section group `lore`, label "history and faith", in the switcher after bynames and titles (before advanced) |
| Module | `eventNames`, label "events and eras" |
| Kinds | wars · battles · rebellions · treaties · successions and crises · migrations and foundings · disasters · collapses · eras and ages |
| Cultures, eras, fantastic | As RN §4 (22 cultures, 7 eras, steampunk in the steam age); regions are not used |
| Scale | A new link: local · a realm's · the world's |
| Series | **As one history**: a short chronicle in order, with recurring enemies, numbered wars and eras that frame the events (§8) |
| Shared vocabulary | New pools in `settlement-vocab.json` (§4); register rows |
| Kit back-link | The settlement kit gains a **History** section (§10) |
| Massacres, genocides, holy wars | Never generated (§11.3) |

---

## 1. Module

### 1.1 Group and section

- Add `lore` to `SectionGroup`, label **"history and faith"**, and to `SWITCHER_ORDER` after `bynames`.
- Add `eventNames` to `NameForgeSection`, label **"events and eras"**, Lucide icon `scroll-text`; `SECTION_GROUPS.lore = ["eventNames"]` (the deities brief adds its module here).
- The group remembers its last-used module (`groupModule.lore`).

### 1.2 History label

`events and eras · {era label} · {culture label}`, then ` · {kind}`, ` · {scale}`, ` · steampunk` / ` · fantastic`, ` · {tone}`, ` · one history` as they apply.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/settlement-vocab.json` | The new pools (§4) |
| `src/data/event-names.json` | Kinds, scales, shapes, culture shapes, safeguards |
| `src/events/engine.ts` | Generation (§6), series (§8), rendering (§9). No Obsidian imports. |
| `src/events/sentence.ts` | The sentence (§2) |
| `docs/vocabulary-pools.md` | Rows for the new pools |
| `tests/eventNames.test.ts` | §14 |

Add this brief to `docs/` as `events-and-eras-brief.md`.

---

## 2. The sentence

### 2.1 Shape

> ‹Norman & British› ‹events of any kind› of the ‹medieval› era, in a ‹realistic› world, on ‹a realm's› scale, ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›.

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture`, `era`, `fantastic` | as RN §2.2 | as RN | `norman-british`, MD, realistic |
| `kind` | "events of any kind" or the kind's plural (§5) | Any, then the kinds offered | any |
| `scale` | "on a ‹local› scale" · "on ‹a realm's› scale" · "on ‹the world's› scale" | the three | realm |
| `tone`, `people` | as TS, GN | | any, placeholders |
| `series` | "each one separate" · "as one history" | the two | separate |

Tooltips: kind, the kind's description; scale, "How far the event reached: a town, a realm, or the whole world"; series, "A short chronicle in order, with eras framing the events"; the rest as RN.

### 2.3 Resets, plain text, presets

Era changed: a kind not offered resets to Any. Plain text and state as GN §2.5–§2.6. Presets in §12.

---

## 3. Supporting sources

| Token | Source |
|---|---|
| `{place}` | RN `routePlace` (with a context: `context.neighbours`, or `context.town` where the shape is marked `self`) |
| `{people}` | one tribes and kin groups name (RN `{folk}`), without "the"; placeholder `[people]` |
| `{realm}` | one realms name, **short** form (RP §11), for the culture and era; placeholder `[realm]` |
| `{leader}` | placeholder `[leader]`; invented: RN `{person}`, else weight 0 |
| `{figure}` | BT ranks (RN §4.2); plural forms by `pluralOf` |
| `{dynasty}` | realms' dynasty source; placeholder `[dynasty]` |
| `{holy}` | GN §8.2 saints, christian cultures only |
| `{god}` | RN §4.2 (egyptian, norse, anglo-saxon, aztec, maya) |
| `{star}`, `{spaceLand}`, `{colour}`, `{number}`, `{ordinal}`, `{ordinalWord}`, `{season}` | group-names.json lists |
| `{world}` (NF–IS) | GN `star`, or a `context.town` |

With a settlement context (SK §4), `{place}` and `{leader}` follow its rules; shapes marked `self` use `context.town`.

---

## 4. New pools (settlement-vocab.json)

| Pool | Entries |
|---|---|
| `warObject` | Salt Wells, Crown, Bridges, Ford, Bells, Silver Mines, Three Rivers, Succession, Marches, Grain, Wool, Two Queens, Broken Oath, Stolen Bride (light), Red Banner, Seven Towers, Black Ships, Lost Heir, Mill (light), Ferry (light), Pig (light) |
| `warAnimal` (light) | Pig, Goose, Cow, Goat, Cat, Dog, Pigeon |
| `battleSite` | Ford ×2, Bridge ×2, Hill, Field ×2, Moor, Heath, Marsh, Pass, Crossroads, Wood, Wall, Gate, Shore, Mill, Stones |
| `rebelGarment` | Ribbon, Cap, Sash, Scarf, Cockade, Feather, Hood, Glove, Apron |
| `disaster` | Fire ×2, Plague ×2, Flood ×2, Famine ×2, Frost, Drought, Storm, Pestilence, Hunger, Sickness, Quake, Blight, Ash, Locusts (arabic-persian, egyptian, west-african, ethiopian, indian) |
| `collapseNoun` | Fall, Sundering, Breaking, Burning, Sack, Ruin, Unmaking, Scattering, Silence, Drowning (strange) |
| `crisisNoun` | Troubles, Disturbance, Interregnum, Anarchy (grim), Schism, Regency, Long Winter, Hard Years |
| `migrationNoun` | Great Migration, Long Walk (grim), Crossing, Exodus, Wandering, Landing, Coming, Return |
| `eraNoun` | WR §9.2 pools: prosperity (Gold, Plenty, Peace, Commerce, Learning), crisis (Ash, Iron, Storm, Silence, Hunger, Ruin, Night), renewal (Return, Rebuilding, Thaw, Second Dawn, Rekindling), mythic (Origins, Dawn, Heroes, Legends, Ancestors, First Fire, Emergence, Flood), authority (Crowns, Thrones, Empire, Kings), faith (Faith, Oaths, Revelation), expansion (Frontier, Settlement, Roads, Crossing), resources (Salt, Iron, Steel, Gold, Grain); ST (Steam, Smoke, Progress, Invention, Gaslight, Brass, Aether `h: true`); MO (Machine, Information, Reconstruction); NF–IS (Expansion, Contact, Diaspora, Uplift, Long Night) |
| `metalAge` | Gold, Silver, Bronze, Iron, Copper, Lead (grim), Glass (strange), Steel (ST on) |
| `eastEraWord` (chinese, japanese, korean) | Great Peace ×2, Lasting Peace, Bright Rule, Enlightened Rule, Heavenly Harmony, Eternal Prosperity, Celebrated Peace, Shining Virtue, Abundant Harvest, Restored Order, Clear Peace, Long Peace |
| `cycleElement` (chinese, korean, japanese) | Wood, Fire, Earth, Metal, Water |
| `cycleAnimal` (chinese, korean, japanese) | Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig |
| `yearThing` (arabic-persian, egyptian, ethiopian, west-african) | Locusts, Comet, Flood, Sandstorm, Camels, Two Moons, Silence, Black Rain, Falling Stars, Salt |
| `sunOrdinal` (aztec, maya) | Fifth ×0.3, Sixth ×2, Seventh, Eighth, Ninth, Thirteenth |
| `chronicleSeason` | Spring, Summer, Autumn, Winter, Harvest, Midwinter |

Fixed whole names are pools per kind, so packs can add them: `eventFixed:war`, `eventFixed:battle`, `eventFixed:rebellion`, `eventFixed:treaty`, `eventFixed:crisis`, `eventFixed:migration`, `eventFixed:disaster`, `eventFixed:collapse`, `eventFixed:era`. Built-in entries are the fixed rows in §7.

---

## 5. Kinds

### 5.1 Line-up and weights by era (kind Any)

| Key | Menu | Plural | AN | MD | EM | ST | MO | NF | IS |
|---|---|---|--:|--:|--:|--:|--:|--:|--:|
| `war` | Wars | wars | 18 | 18 | 18 | 15 | 15 | 12 | 12 |
| `battle` | Battles | battles | 12 | 12 | 10 | 8 | 6 | 6 | 6 |
| `rebellion` | Rebellions and risings | rebellions | 10 | 12 | 12 | 12 | 10 | 10 | 10 |
| `treaty` | Treaties and accords | treaties | 8 | 10 | 12 | 12 | 12 | 10 | 10 |
| `crisis` | Successions and crises | crises | 10 | 12 | 10 | 8 | 8 | 8 | 8 |
| `migration` | Migrations and foundings | migrations and foundings | 10 | 6 | 8 | 8 | 6 | 12 | 14 |
| `disaster` | Disasters | disasters | 10 | 10 | 10 | 10 | 10 | 10 | 8 |
| `collapse` | Collapses and falls | collapses | 8 | 8 | 6 | 5 | 6 | 10 | 10 |
| `era` | Eras and ages | eras and ages | 14 | 12 | 14 | 22 | 27 | 22 | 22 |

**Descriptions.** War: "Wars, named for their cause, length, place or enemy". Battle: "Battles, named for where they were fought". Rebellion: "Rebellions, risings and revolts". Treaty: "Treaties, peaces, compacts and accords". Crisis: "Disputed successions, troubles and interregnums". Migration: "Migrations, crossings, landings and foundings". Disaster: "Fires, plagues, floods, famines and other disasters". Collapse: "Falls, sackings and sunderings". Era: "Ages and eras: how a time is remembered".

### 5.2 Scale

| Scale | Effects |
|---|---|
| local | `{place}` shapes ×3; "Great", "World" and `{realm}` shapes 0; wars become **feuds and riots** in their labels: `{place} War` → `{place} Riot` at 40%, `{leader:poss} Feud` ×3 |
| realm | as the tables |
| world | "Great" shapes ×3; `{realm}` shapes ×2; local riots and feuds 0; MO on: adds `{ordinalWord} Great War` (weight 6, flagged §11.2). There is no "World War" shape. |

---

## 6. Generation pipeline

```
era → kind (chosen, or §5.1) → scale effects (§5.2)
    ↓
shape        (shared §7 + culture §7.10 + era §7.11; × tone)
    ↓
tokens → rendering (§9) → safeguards (§11)
```

Failure and batches as GN §4. Cap: 9 words.

---

## 7. Shapes

Columns: weight within the kind; eras; cultures; tone; example.

### 7.1 Wars

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `War of the {warObject}` | 20 | all | all | – | War of the Salt Wells |
| `{number} Years' War` | 12 | MD on | all | – | Twelve Years' War |
| `{place} War` | 12 | all | all | plain | Fenwick War |
| `{ordinalWord} {place} War` | 8 | all | all | plain | Second Fenwick War |
| `{people} War` | 8 | all | all | – | High Folk War |
| `War of {figure:poss} Succession` | 6 | MD–ST | all | – | War of the Duke's Succession |
| `War of the {colour} and the {colour}` | 4 | MD–EM | all | – | War of the Grey and the Gold |
| `{realm}–{realm} War` | 6 | EM on | all | plain | Ashmark–Fenwold War |
| `{warAnimal} War` | 3 | EM on | all | light | Goose War |
| `{leader:poss} War` | 6 | all | all | – | [leader]'s War |
| `{number}-Day War` | 4 | MO on | all | – | Nine-Day War |
| `{star} War` / `{ordinal} {spaceLand} War` | 10 | NF–IS | all | – | Vega War, 2nd Outer Belt War |
| fixed | 3 | | | | `eventFixed:war`: Gate Wars (IS), War of the Long Night (NF–IS), Brothers' War |

### 7.2 Battles

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `Battle of {place}` | 30 | all | all | plain | Battle of Saltgate |
| `Battle of the {battleSite}` | 25 | all | all | – | Battle of the Ford |
| `Battle of {place} {battleSite}` | 15 | all | all | plain | Battle of Fenwick Bridge |
| `{place} Field` (fixed form) | 8 | MD–EM | british, general | – | Ashby Field |
| `Battle of the {number} {figure:pl}` | 6 | AN–EM | all | grand | Battle of the Three Kings |
| `Siege of {place}` | 12 | all | all | grim | Siege of Ashby |
| `Battle of {star}` / `Battle of the {spaceLand}` | 15 | NF–IS | all | – | Battle of the Outer Belt |

### 7.3 Rebellions

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `{leader:poss} Rebellion` | 20 | all | all | – | [leader]'s Rebellion |
| `{colour} {rebelGarment} Rising` | 15 | MD on | all | – | Green Ribbon Rising |
| `Rising of the {people}` | 10 | all | all | – | Rising of the Reed Folk |
| `{trade:poss} Revolt` | 10 | MD on | all except indian, west-african | plain | Weavers' Revolt |
| `{chronicleSeason} Rising` | 8 | all | all | – | Harvest Rising |
| `{place} Uprising` | 12 | EM on | all | plain | Saltgate Uprising |
| `{place} Mutiny` | 5 | EM on | all | grim | Fenwick Mutiny |
| `{star} Secession` | 10 | NF–IS | all | – | Altair Secession |

`{trade}`: SD `streetTrades`.

### 7.4 Treaties

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `Treaty of {place}` | 30 | all | all | plain | Treaty of Saltgate |
| `Peace of {place}` | 15 | all | all | – | Peace of Ashby |
| `Compact of {place}` | 8 | all | all | – | Compact of Fenwick |
| `{place} Accord` | 10 | EM on | all | plain | Fenwick Accord |
| `Edict of {place}` | 8 | MD–ST | all | grand | Edict of Ashby |
| `Union of {place}` | 6 | MD–ST | all | – | Union of Saltgate |
| `Partition of {place}` | 5 | EM on | all | grim | Partition of Fenwick |
| `Compact of the {number} Wells` | 4 | AN–EM | arabic-persian, west-african, steppe | – | Compact of the Seven Wells |
| `{star} Accords` | 8 | NF–IS | all | – | Vega Accords |

### 7.5 Successions and crises

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `Year of {number} {figure:pl}` | 15 | AN–EM | all | – | Year of Three Kings |
| `{figure:poss} Succession` | 10 | MD–ST | all | – | Queen's Succession |
| `{ordinalWord} Time of {crisisNoun}` | 12 | all | all | grim | Second Time of Troubles |
| `{crisisNoun}` (fixed form: the Anarchy, the Interregnum, the Regency) | 8 | MD on | all | – | the Interregnum |
| `{dynasty} Schism` | 6 | MD–EM | all | – | [dynasty] Schism |
| `{place} Crisis` | 10 | ST on | all | plain | Saltgate Crisis |
| `Winter of {crisisFeeling}` | 6 | MO on | all | – | Winter of Doubt |

`crisisFeeling`: Doubt, Silence, Hunger, Waiting.

### 7.6 Migrations and foundings

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `{migrationNoun}` | 15 | all | all | – | Long Walk |
| `{people} Crossing` | 12 | all | all | – | High Folk Crossing |
| `Founding of {place}` | 15 | all | all | grand | Founding of Fenwick |
| `Landing at {place}` | 10 | all | all | – | Landing at Ashby |
| `Exodus of {place}` | 8 | all | all | grim | Exodus of Saltgate |
| `{ordinal} Settlement` | 6 | EM on | all | plain | 3rd Settlement |
| `{ordinalWord} Diaspora` | 12 | NF–IS | all | grim | Second Diaspora |
| `First Contact` (fixed) | 5 | NF–IS | all | strange | – |

### 7.7 Disasters

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `Great {disaster}` | 20 | all | all | grim | Great Fire |
| `{colour} {disaster}` | 15 | all | all | grim | Grey Plague |
| `Year of {disaster}` | 12 | all | all | grim | Year of Ash |
| `Year Without {chronicleSeason}` | 6 | all | all | strange | Year Without Summer |
| `{place} {disaster}` | 15 | all | all | plain | Fenwick Flood |
| `{disaster} of {place}` | 10 | all | all | – | Burning of Ashby pattern |
| `{star} Blight` / `Quarantine Years` (fixed) | 10 | NF–IS | all | grim | – |

### 7.8 Collapses

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `{collapseNoun} of {place}` | 30 | all | all | grim | Fall of Fenwick |
| `Breaking of the {warObject}` | 10 | all | all | grim | Breaking of the Crown |
| `the {collapseNoun}` (Sundering, Breaking, Scattering, Silence, Unmaking) | 20 | all | all | strange | the Sundering |
| `Fall of the {dynasty} {realmForm}` | 8 | AN–ST | all | grim | Fall of the [dynasty] Kingdom (realmForm: Kingdom, Empire, Line) |
| `Fall of {star}` | 15 | NF–IS | all | grim | Fall of Vega |
| `Collapse` / `Long Night` / `Silence` (fixed) | 10 | NF–IS | all | strange | – |

### 7.9 Eras and ages

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| `Age of {eraNoun}` | 25 | all | all | grand | Age of Salt |
| `Era of {eraNoun}` | 8 | EM on | all | – | Era of Progress |
| `{metalAge} Age` | 8 | all | all | – | Silver Age |
| `{ordinalWord} Age` | 8 | all | all | – | Second Age |
| `Years of {eraNoun}` | 12 | all | all | grim | Years of Ash |
| `{dynasty} Period` | 8 | AN–ST | all | plain | [dynasty] Period |
| `Reign of the {epithet} {figure}` | 6 | AN–EM | all | – | Reign of the Bold King (epithet: BT `epCharacter`) |
| `Time of {eraNoun}` | 8 | all | all | strange | Time of Silence |
| `Before the {collapseNoun}` / `After the {collapseNoun}` | 6 | all | all | strange | Before the Breaking |
| `{eraNoun} Age` (ST on) | 8 | ST on | all | – | Steam Age |

### 7.10 Culture shapes (WR §8.2, §9.1)

Added to the kinds shown at weight 20; English output.

| Culture | Kind | Shapes | Examples |
|---|---|---|---|
| chinese, korean | rebellion | `{cycleElement} {cycleAnimal} Rising`, `Rebellion of the {cycleElement} {cycleAnimal} Year` | Metal Rat Rising |
| chinese, korean | crisis | `Purge of the {cycleElement} {cycleAnimal} Year` (korean), `{cycleElement} {cycleAnimal} Disturbance` | – |
| chinese | era | `Period of the {number} {realmForm:pl}` (realmForm: Kingdom, Realm, State), `{eastEraWord} Era` | Period of the Six Kingdoms, Bright Rule Era |
| japanese | war, crisis | `War of the {eastEraWord} Years`, `{eastEraWord} Disturbance` | Disturbance of the Long Peace Years pattern |
| japanese, korean | era | `{eastEraWord} Era` | Great Peace Era |
| arabic-persian, egyptian, ethiopian, west-african | disaster, crisis | `Year of the {yearThing}` | Year of the Comet |
| arabic-persian | battle | `Battle of the {battleSite}` ×2, `Battle of the {number} Wells` | – |
| aztec, maya | era | `Age of the {sunOrdinal} Sun`, `End of the {ordinalWord} Cycle`, `New Fire` (fixed) | Age of the Sixth Sun |
| egyptian | crisis | `{ordinalWord} Time of Troubles` ×2 | Second Time of Troubles |
| egyptian | era | `Year {number} of the {figure}` | Year Nine of the Pharaoh |
| roman | crisis | `Year of the {number} Emperors` | Year of the Six Emperors |
| roman | war | `{ordinalWord} {people} War` ×2 | Third High Folk War |
| norse | war | `{leader:poss} Feud`, `Summer of the {warObject}` | Summer of the Black Ships |
| celtic | war | `Cattle Raid of {place}` | Cattle Raid of Fenwick |
| slavic | crisis | `{ordinalWord} Time of Troubles`, `{place} Uprising` ×2 | – |
| steppe | treaty, migration | `Great Gathering of {place}`, `{colour} Horde's March` | Grey Horde's March |
| west-african, bantu | collapse, war | `the Scattering`, `{leader:poss} Wars` | – |
| indian | era | `Age of {metalAge}`, `{dynasty} Peace` | Age of Gold |

### 7.11 Steampunk additions

`h: true`, ST: `Aether Crash` (fixed), `Engine Riots` (fixed), `{place} Exhibition of {year}` (year 1820–1913), `{goods} Panic of {year}`, `Smog Years` (fixed, grim), `Brass Revolution` (fixed). `{goods}` is SD `streetGoods`.

---

## 8. Series: as one history

"As one history" returns a short chronicle, in order:

1. The first name is an **era** (§7.9), unless kind is set to something else.
2. Later names follow a fixed rhythm: crisis or war → battle or siege → treaty → (repeat) → collapse or migration; disasters may fall anywhere (20% each slot).
3. **Recurring enemies:** one `{people}` and one `{realm}` are drawn at the start and reused (×4) through the batch.
4. **Numbered wars:** a war shape that repeats takes the next ordinal (*First Fenwick War* → *Second Fenwick War*); the first is renamed with "First" when a second appears.
5. **Places carry over:** a treaty after a battle uses the battle's place at 50% (*Battle of Saltgate* → *Treaty of Saltgate*).
6. In batches of 8 or more, a second era opens the second half (*Age of Salt* … *Years of Ash* …).
7. With a kind chosen, every name is of that kind; rules 3–5 still apply.

---

## 9. Rendering

- Capitals and possessives as GN §11 (OUP: *Twelve Years' War*, *Weavers' Revolt*, *[leader]'s Rebellion*).
- Leading "the" lower case for fixed forms (*the Sundering*, *the Interregnum*).
- En dash in `{realm}–{realm} War`.
- `{number}` in "Year of {number} …" uses words; `{year}` uses figures.

---

## 10. Settlement kit back-link

Part of M3. Add a short "Events back-link" note to `docs/settlement-kit-brief.md`.

- The kit gains a **History** section (SK §9.1, after Groups), contents "whole" and "people and groups only".
- Counts at standard detail: village 2, town 3, city 4, great 5 (detail multipliers as SK §5.1).
- It runs this engine with series on, scale local for village and town, realm for city and great city, and the kit's context: `self` shapes (`Founding of {place}`, `{place} Flood`, `Siege of {place}`, `Fall of {place}`) use `context.town`; other `{place}` tokens draw from `context.neighbours`; `{leader}` uses `context.founder` for the first founding shape.
- The first entry is always `Founding of {town}` in a history of 3 or more.
- Kit generation order (SK §6): after Groups, before Ships. Rerolling History redoes only History.
- Kit tests: History present with the right count; the founding entry names the town.

---

## 11. Safeguards

### 11.1 Block list

Whole-name matches (case-insensitive, leading "the" ignored) are redrawn. Add to `event-names.json`; packs can add, not remove.

- **Real wars and battles:** Hundred Years' War, Thirty Years' War, Seven Years' War, Eighty Years' War, Nine Years' War, Wars of the Roses, War of the Roses, War of Jenkins' Ear, War of the Bucket, War of the Oaken Bucket, Pig War, Emu War, Football War, Opium War, War of the Spanish Succession, War of the Austrian Succession, War of the Polish Succession, War of the Three Kingdoms, Hundred Days, Six-Day War, Winter War, Cold War, Great War, First World War, Second World War, World War, Gulf War, Boer War, Crimean War, Peloponnesian War, Punic War, Gallic War, Battle of Hastings, Battle of Agincourt, Battle of Bosworth, Bosworth Field, Battle of Waterloo, Battle of Trafalgar, Battle of Thermopylae, Battle of Marathon, Battle of Cannae, Battle of the Bulge, Battle of Britain, Battle of the Somme, Battle of Stamford Bridge, Battle of Maldon, Battle of Brunanburh, Battle of Culloden, Battle of Bannockburn, Battle of Flodden, Battle of the Boyne, Siege of Troy, Siege of Leningrad, Siege of Stalingrad.
- **Real rebellions and crises:** Peasants' Revolt, Boxer Rebellion, Taiping Rebellion, Red Turban Rebellion, Yellow Turban Rebellion, Indian Mutiny, Jacobite Rising, Easter Rising, Pilgrimage of Grace, Gunpowder Plot, Glorious Revolution, French Revolution, Russian Revolution, American Revolution, Industrial Revolution, Xinhai Revolution, Meiji Restoration, Ōnin War, Year of Four Emperors, Year of the Four Emperors, Year of Five Emperors, Year of the Elephant, Time of Troubles, Mfecane, Great Trek, Trail of Tears, Long March.
- **Real treaties:** Treaty of Versailles, Treaty of Westphalia, Peace of Westphalia, Treaty of Utrecht, Treaty of Tordesillas, Treaty of Paris, Treaty of Rome, Treaty of Waitangi, Treaty of Nanking, Edict of Nantes, Edict of Milan, Magna Carta, Act of Union, Congress of Vienna, Concordat of Worms, Diet of Worms, Peace of Augsburg.
- **Real disasters and eras:** Black Death, Great Plague, Great Plague of London, Great Fire of London, Great Famine, Irish Famine, Great Hunger, Year Without a Summer, Dust Bowl, Great Depression, Great Exhibition, Dark Ages, Middle Ages, Renaissance, Victorian Era, Edwardian Era, Elizabethan Era, Georgian Era, Gilded Age, Belle Époque, Warring States, Three Kingdoms, Spring and Autumn, Sengoku, Edo Period, Heian Period, Meiji, Taishō, Shōwa, Heisei, Reiwa, Kali Yuga, Space Age, Atomic Age, Information Age.
- **Fiction:** War of the Ring, War of Wrath, War of the Five Kings, Dance of the Dragons, Robert's Rebellion, Red Wedding, Doom of Valyria, Breaking of the World, Clone Wars, Eugenics Wars, Dominion War, Butlerian Jihad, Horus Heresy, Age of Strife, Long Night of Solace, Great Sundering, Oblivion Crisis.

### 11.2 Flag list

Allowed by default: Great War, Great Fire, Great Flood, Great Famine, Great Migration, Golden Age, Silver Age, Bronze Age, Iron Age, Stone Age, Long Night, Sundering, the Anarchy, Interregnum, Exodus, Diaspora, Enlightenment, Reformation, Fifth Sun, First Contact, Collapse, Silence, Long Walk, Year of Three Kings, Second Age, Steam Age.

### 11.3 Never generated

- **Massacres, genocides and atrocities:** no shape produces them, and these words are banned in this module: Massacre, Genocide, Holocaust, Shoah, Pogrom, Purge (see below), Ethnic Cleansing, Extermination, Final Solution, Slaughter, Butchery.
- **Holy wars:** Crusade, Jihad, Holy War, Inquisition, Heresy (as an event) are banned in this module (GN's mystic family keeps its own fantastic inquisitors).
- **Slavery:** no event is named for enslavement or the slave trade.

- **Purge** is banned except in the Korean `Purge of the {cycleElement} {cycleAnimal} Year` shape (modelled on the court purges of scholars), which never takes tone light.

### 11.4 Living religions

WR §10.1. `{holy}` only for christian cultures; `{god}` only for the five ancient-god cultures; no living-religion calendars or cosmologies (no *Kali Yuga*, no Islamic, Hebrew or Buddhist eras).

### 11.5 Safeguard packs

`type: settlement-safeguards` (RN §12.6) apply here too.

---

## 12. Presets

```yaml
---
type: module-preset
module: event-names
packName: Border chronicle
culture: norman-british
kind: any
era: MD
fantastic: false
scale: realm
tone: grim
people: invented
series: true
---

Norman & British events of any kind of the medieval era, in a realistic world, on a realm's scale, with a grim edge, with invented people and places, as one history.
```

| Key | Values | Default |
|---|---|---|
| `culture`, `era`, `fantastic`, `tone`, `people`, `series` | as RN §13 | as there |
| `kind` | `any` or a kind key | `any` |
| `scale` | `local`, `realm`, `world` | `realm` |

---

## 13. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Vocabulary and engine.** Pools, register rows, kinds, scales, shapes, culture and steampunk shapes, series, safeguards | §14.1–§14.5 pass |
| M2 | **Group and module.** The `lore` group, section, sentence, history, presets | §14.6 passes; the module generates in the app |
| M3 | **Kit back-link.** §10 | its kit tests pass; all earlier tests still pass |

---

## 14. Tests (`tests/eventNames.test.ts`)

### 14.1 Vocabulary

- New entries valid; none is a blocked real name.

### 14.2 Coverage and determinism

- Same options and seed give the same names.
- Every culture × era × kind × scale × people: 20 unique names within the cap.

### 14.3 Eras and scale

- MD: no `{number}-Day War`, no ST, MO or sci-fi shape.
- Local scale: no "Great" shape and no `{realm}` shape.
- World scale, MO: `{ordinalWord} Great War` appears and never "World War".

### 14.4 Cultures

- chinese, 2,000 rebellions: at least 20% use the cyclical year; never outside chinese, korean, japanese.
- aztec era: `Age of the {sunOrdinal} Sun` appears; "Age of the Fifth Sun" appears only at its low weight (×0.3).
- `{holy}` only in christian cultures; `{god}` only in the five.

### 14.5 Series and safeguards

- Series of 8: the first is an era; a repeated war takes "First"/"Second"; the recurring `{people}` appears at least twice; a second era appears in the second half.
- 10,000 names across options: 0 block-list matches, 0 banned words; no Korean purge with tone light.

### 14.6 Sentence and presets

- Default plain text: "Norman & British events of any kind of the medieval era, in a realistic world, on a realm's scale, of any tone, with placeholders for people and places, each one separate."
- The lore group appears after bynames and titles in the switcher.
- Preset round-trip.

---

## 15. Parked

- Dates and a timeline view (years, reigns, durations).
- Event details: sides, outcome, a one-line summary.
- Calendars and festivals, linked to eras.
- Linking events to realms (a realm's own history from its name).
