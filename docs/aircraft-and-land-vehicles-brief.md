# Aircraft and land vehicles – brief (second vehicles release)

This brief adds two modules to the **vehicles** group, after spacecraft and stations, on the ships engine:

- **aircraft and airships:** balloons, airships, biplanes, piston and jet aircraft, drones and future flyers, and, in fantasy, **sky ships**
  - craft: *Spirit of Saltgate*, *Lucky Kate*, *Miss Fenwick*, *G for George*-style call names, *Clipper Morning Star*
  - types: *Stormcat*, *Kestrel*, *Fenwick*-class bombers, *Super Comet*, *Ka-27*-style designations
- **land vehicles:** chariots, coaches, wagons, locomotives, named trains, traction and showmen's engines, tanks, cars and crawlers, and, in fantasy, **war engines and wonders**
  - vehicles: *Ashby Castle*, *the Saltgate Express*, *the Tantivy*, *Pride of the Road*, *War Boar*, *Bad Cousin*, *Daisy*
  - types: *the Castle class*, *Conqueror*, *Golden Wraith*, *Steppe Schooner*, *T-44*-style designations

It is built on ships and spacecraft (SS), group names (GN), tone and series (TS), bynames and titles (BT) and events and eras (EE). Where something isn't specified, follow SS, then GN and TS. Reuse the vessel engine's helpers (technology spans, customs level, hybrids, styles, prefixes, class series, safeguards) rather than copying them.

Everything here is data or a rule with fixed numbers. All results are in **translated English**; there are no native-language forms.

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | Two new modules in `vehicles`, after `spacecraft`: `aircraft` ("aircraft and airships") and `landVehicles` ("land vehicles") |
| Engine | The vessel engine, with these two as new vessel modules. Ships and spacecraft are untouched. |
| Naming | A new link: **each craft** (individual names) or **types and models** (*Kestrel*, *the Castle class*) (§9) |
| Cultures | SS's 34 (§3), with native spans for each module (§3.2) |
| Technology | Its own link, as SS. 7 aircraft levels plus **sky ships** (fantastic); 6 land levels plus **war engines and wonders** (fantastic) (§4) |
| Sky ships | In aircraft, as the fantastic level `AF`. Ships has no sky-ship content, so nothing moves out of it. |
| Fantasy land machines | In land vehicles, as the fantastic level `LF` |
| Functions | 9 for aircraft, 7 for land vehicles (§5) |
| Prefixes | Become **codes**: registrations and serials for aircraft, numbers for locomotives and early tanks (§12) |
| Series | Each craft: **as one class** (SS), with new class themes (§11). Types: **as one family** (§9.5). |
| People and places | Placeholders or invented, as GN §8 |

---

## 1. Modules

### 1.1 Sections

| Section key | Label | Icon (Lucide) |
|---|---|---|
| `aircraft` | aircraft and airships | `plane` |
| `landVehicles` | land vehicles | `train-front` |

- Extend `VesselModule` with `"aircraft"` and `"landVehicles"`, and append both to `VESSEL_SECTIONS` after `spacecraft`. `SECTION_ORDER` and `SECTION_GROUPS.vehicles` follow from it.
- History routing (`historySection`): rows starting `aircraft and airships` and `land vehicles` go to their modules.

### 1.2 History label

As SS §1.2, then ` · types` when naming types and models, ` · codes` when codes are on, and ` · class` or ` · family` in a series.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/vehicles-air-land.json` | Everything in §3–§14 for the two new modules |
| `src/vessels/engine.ts` | Reads the new file alongside `vessels.json`; the new modules' functions, roles, technology, types, codes and series |
| `src/vessels/sentence.ts` | The two new sentences (§2) |
| `tests/airLandVehicles.test.ts` | §16 |

`vessels.json` is **not changed**. The new file is merged in by module key at load, so ships and spacecraft draw exactly as before.

Add this brief to `docs/` as `aircraft-and-land-vehicles-brief.md`.

---

## 2. The sentences

### 2.1 Shapes

**Aircraft and airships**

> ‹General›-themed ‹aircraft of any kind› with ‹any› technology, for a ‹modern› world ‹of the real world›, naming ‹each craft›, in ‹no particular› style, ‹of any tone›, ‹without codes›, with ‹placeholders for› people and places, ‹each one separate›.

**Land vehicles**

> ‹Norman & British›-themed ‹land vehicles of any kind› with ‹any› technology, for a ‹modern› world ‹of the real world›, naming ‹each vehicle›, in ‹no particular› style, ‹of any tone›, ‹without numbers›, with ‹placeholders for› people and places, ‹each one separate›.

### 2.2 Fields

As SS §2.2, with these changes:

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | as SS | SS's 34 | aircraft: `general`; land: `norman-british` |
| `function` | "aircraft of any kind" / "land vehicles of any kind", or the function's plural (§5) | Any, then the functions available | any |
| `technology` | "with ‹label› technology" | any, then the levels for the setting (§4.3) | any |
| `genre`, `fantastic` | as GN §2.2 | fantasy, modern, sci-fi | modern, real world |
| `naming` | "naming ‹each craft›" (aircraft) / "‹each vehicle›" (land) · "‹types and models›" | the two | each craft |
| `style` | as SS | the styles for the setting and module (§13) | none |
| `codes` | aircraft "‹without codes›" · "‹with registrations›"; land "‹without numbers›" · "‹with numbers›" | the two | without |
| `series` | each craft: "‹each one separate›" · "‹as one class›"; types: "‹each one separate›" · "‹as one family›" | the two | separate |

- **Codes link:** shown only in MR, MF and SF, and only when naming each craft (§12).
- **Series link:** as SS, shown when a function is picked (types: always shown).
- **Tooltips:**
  - naming: "Name single craft (Lucky Kate, Ashby Castle), or the types and models they belong to (Kestrel, the Castle class)."
  - codes: "Registrations, serials and running numbers where the culture and period used them."
  - the rest as SS.

### 2.3 Resets

As SS §2.3, and:

- **Naming changed:** series resets to separate; a function not offered for the naming (§5.3) resets to Any.
- **Fantastic off:** technology `AF` or `LF` resets to any.

### 2.4 Plain text, state and presets

As SS §2.4. Presets in §15.

---

## 3. Cultures

### 3.1 Line-up

SS's 34 cultures in SS's menu order and groups, with their records (flavour animals, `town`, `holy`, `sensitive`, own lists).

### 3.2 Native spans

Each culture gains `airSpan` and `landSpan`: the levels it really had. A dash means none.

| Culture | `airSpan` | `landSpan` |
|---|---|---|
| general | A1–A6 | L1–L5 |
| anglo-saxon, norse, celtic, greek-byzantine, steppe | – | L1 |
| norman-british, french, american, slavic | A1–A6 | L1–L5 |
| roman | A2–A6 | L1–L5 |
| dutch, iberian | A3–A6 | L1–L5 |
| japanese | A3–A6 | L1–L5 |
| chinese, indian, ethiopian | A4–A6 | L1–L5 |
| korean | A5–A6 | L1–L5 |
| arabic-persian, egyptian | A5–A6 | L1–L5 |
| ottoman | A3–A4 | L1–L3 |
| swahili-omani | – | L1 |
| malay | – | L1–L4 |
| bantu, west-african | – | L3–L5 |
| arctic, na-woodlands | – | L1 (sledges and travois) |
| hawaiian, maori, w-polynesian, nw-coast, aztec, maya, andean | – | – |

### 3.3 Out-of-span technology

As SS §4.3, with one addition. When the culture has **no** native level in the module, its customs come from its **ships** lists at its highest native ship level, as SS does for spacecraft. Hybrids use the chosen level's words at 35%.

Examples (illustrations): Polynesian sky ship: *Cloud Path of the Ancestors*. Maya locomotive: *Iron Jaguar's Passage*. Norse biplane: *Wing-Raven*.

---

## 4. Technology

### 4.1 Aircraft

| Code | Label | Covers |
|---|---|---|
| A1 | balloons and kites | gas and hot-air balloons, man-lifting kites, gliders |
| A2 | airships | rigid and blimp airships |
| A3 | pioneer and biplane | the first aeroplanes to the 1920s |
| A4 | piston age | monoplanes, flying boats, wartime bombers and fighters |
| A5 | jet age | jets, early helicopters, the first airliners of the jet age |
| A6 | modern and drones | today's airliners, helicopters, drones |
| A7 | future | skimmers, hover-flyers, sky cars, gunships |
| AF | sky ships | sky galleons, flying ships, cloud barges, wind skiffs (fantastic only) |

### 4.2 Land vehicles

| Code | Label | Covers |
|---|---|---|
| L1 | animal-drawn | chariots, carts, wagons, coaches, carriages, sledges, siege engines |
| L2 | steam | locomotives, traction engines, steam carriages, steamrollers |
| L3 | early motor | early cars, lorries and buses, the first tanks, electric trams |
| L4 | mid-century | diesel and electric trains, wartime tanks, motorcycles |
| L5 | modern | high-speed trains, modern cars and armour |
| L6 | future | maglevs, hover vehicles, crawlers and walkers |
| LF | war engines and wonders | walking war machines, dwarven engines, war wagons, rune-driven carriages (fantastic only) |

### 4.3 Levels by setting

Which levels the technology menu offers, and which "any" draws from. "Any" draws each name's level evenly from the culture's native span within the setting's levels; where that is empty, evenly from the setting's levels.

| Setting | Aircraft | Land |
|---|---|---|
| FL | A1 | L1 |
| FH | A1, AF | L1, LF |
| MR | A1–A6 | L1–L5 |
| MF | A1–A6, AF | L1–L5, LF |
| SF | A6–A7 | L5–L6 |

The menu offers every level in the row; out-of-span levels follow §3.3. Nothing is blocked by culture.

### 4.4 Technology words (hybrids)

As SS §9: 20% of names in span, 35% out of span; designation and leisure never take a hybrid; types and models never take a hybrid.

| Level | `techAdj` | `techNoun` |
|---|---|---|
| A1 | Lofty, Silken, Rising, Buoyant | Balloon, Basket, Ascent, Kite, Updraft |
| A2 | Great, Silver, Stately, Rigid | Envelope, Gondola, Airship, Mooring |
| A3 | Wooden, Daring, Flying | Wing, Propeller, Strut, Loop |
| A4 | Roaring, Silver, Twin-Engined | Engine, Prop, Wing, Clipper |
| A5 | Jet ×2, Swept, Supersonic, Silver | Jet, Contrail, Turbine, Thunder |
| A6 | Swift, Global, Silent, Stealth | Drone, Wing, Jet, Rotor |
| A7 | Hover, Ion, Skyward, Silent | Skimmer, Flyer, Lifter, Thruster |
| AF | Sky ×2, Cloud, Wind-Borne, High | Sky, Cloud, Gale, Keel, Zenith |
| L1 | Swift, Painted, Iron-Shod, Creaking (light) | Wheel, Axle, Whip, Team, Road |
| L2 | Iron ×2, Steam, Brass, Coal-Black | Engine, Boiler, Piston, Smoke, Firebox |
| L3 | Motor, Iron, Rattling (light) | Motor, Engine, Track, Crank |
| L4 | Diesel, Steel ×2, Streamlined, Chrome | Diesel, Track, Turret, Express |
| L5 | Electric, High-Speed, Steel, Swift | Current, Track, Express, Turbine |
| L6 | Hover, Ion, Silent, Magnetic | Maglev, Crawler, Walker, Track |
| LF | Iron ×2, Rune, Stone, Walking, Brass | Engine, Strider, Juggernaut, Colossus, Golem |

### 4.5 Place words

The ships shapes that use sea words read them per module:

| Ships word | Aircraft | Land vehicles |
|---|---|---|
| `seaAdj` | Sky ×2, Cloud, Wind, Storm, High, Silver | Road ×2, Iron, Steel (L3 on), Steam (L2), Dust, Rail (L2 on) |
| `seaLand` | Skies ×2, Clouds, Winds, Heights, Air | Road ×2, Rails (L2 on), Plains, Hills, North, South, East, West, Highlands |
| `City of {town}` | as written | as written |

---

## 5. Functions

### 5.1 Aircraft

| Key | Menu | Plural (sentence) | Weight (Any) | Needs | Description |
|---|---|---|--:|---|---|
| `war` | Fighters and warplanes | fighters and warplanes | 20 | – | Fighters, war balloons and sky warships |
| `bomber` | Bombers | bombers | 10 | A3+ | Bombers and heavy warplanes |
| `airliner` | Airliners | airliners | 15 | A2+ | Passenger airships, flying boats and airliners |
| `transport` | Transport and cargo | transport and cargo aircraft | 12 | A2+ | Freighters, transports and sky traders |
| `explore` | Survey and record-breaking | survey and record-breaking craft | 10 | – | Survey craft, expedition balloons and record-breakers |
| `private` | Private and sport | private and sport craft | 10 | – | Private aircraft, sport balloons and sky yachts |
| `working` | Working aircraft | working aircraft | 10 | A3+ | Bush planes, crop sprayers, air ambulances and fire-fighting aircraft |
| `state` | State and ceremonial | state craft | 5 | A2+ | State aircraft, flagships and royal sky barges |
| `raider` | Raiders and smugglers | raiders and smugglers | 8 | – | Smugglers, rum-runners and sky pirates |

"Any" phrase: "aircraft of any kind". At AF, every function is available; `private` reads "sky yachts" in the menu.

### 5.2 Land vehicles

| Key | Menu | Plural | Weight (Any) | Needs | Description |
|---|---|---|--:|---|---|
| `locomotive` | Locomotives | locomotives | 20 | L2+, LF | Steam, diesel and electric locomotives, and rune engines |
| `train` | Named trains | named trains | 10 | L2+ | Named services: expresses, mails and limiteds |
| `war` | War machines | war machines | 20 | – | Chariots, siege engines, war wagons, tanks and armour |
| `coach` | Coaches and carriages | coaches and carriages | 15 | L1–L3, LF | Mail and stage coaches, state coaches and carriages |
| `road` | Road vehicles | road vehicles | 15 | L3+ | Cars, lorries, buses and motorcycles |
| `wagon` | Wagons and caravans | wagons and caravans | 10 | L1–L4, LF | Wagons, sledges, living vans and circus wagons |
| `working` | Working engines | working engines | 10 | L2+, LF | Traction engines, steamrollers, showmen's engines and tractors |

"Any" phrase: "land vehicles of any kind".

### 5.3 Functions by naming

- **Types and models:** every function except `train` (named trains are services, not types).
- **Sensitive cultures:** as SS §6.2 for yachts, `private` (aircraft) and `road` with role leisure are never drawn.

---

## 6. Roles

### 6.1 Roles

Every ships role (SS §7) is used, with its shared lists and shapes (SS §8.1–§8.2), place words as §4.5. New roles:

| Role | What it names | Modules |
|---|---|---|
| `nose` | nose art and crew names: homely, cheeky, lucky | both |
| `call` | wartime call names (*G for George*) | aircraft, A4 only |
| `classSet` | locomotive class themes: castles, halls, saints, schools, birds… | land |
| `speed` | coach names of speed and dash | land |
| `service` | named trains | land |
| `siege` | siege engines and war wagons | land, L1 and LF only |
| `fair` | showmen's engines and fairground grandeur | land |

### 6.2 Role weights: aircraft

| Role | war | bomber | airliner | transport | explore | private | working | state | raider |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| virtue | 15 | 10 | 5 | 5 | 10 | 2 | 5 | 10 | 5 |
| royal | 5 | 2 | 10 | 2 | 0 | 2 | 0 | 25 | 0 |
| holy | 0 | 0 | 5 | 2 | 0 | 0 | 5 | 10 | 0 |
| beast | 20 | 10 | 10 | 5 | 5 | 5 | 5 | 5 | 10 |
| sky | 15 | 10 | 20 | 10 | 15 | 15 | 10 | 15 | 10 |
| place | 5 | 10 | 30 | 25 | 5 | 5 | 15 | 15 | 0 |
| person | 5 | 5 | 10 | 5 | 20 | 10 | 10 | 15 | 5 |
| poetic | 0 | 0 | 0 | 0 | 5 | 5 | 0 | 5 | 0 |
| commerce | 0 | 0 | 10 | 25 | 0 | 5 | 5 | 0 | 5 |
| menace | 10 | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 45 |
| discovery | 0 | 0 | 0 | 5 | 35 | 5 | 0 | 0 | 0 |
| affection | 5 | 8 | 0 | 5 | 0 | 20 | 25 | 0 | 5 |
| leisure | 0 | 0 | 0 | 0 | 0 | 25 | 0 | 0 | 0 |
| designation | 5 | 5 | 0 | 10 | 5 | 0 | 15 | 0 | 0 |
| nose | 10 | 25 | 0 | 2 | 0 | 5 | 5 | 0 | 15 |
| call | 5 | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

- `call` is weight 0 outside A4.
- At AF, `nose`, `call` and `designation` are 0, and `poetic` ×2.

### 6.3 Role weights: land vehicles

| Role | locomotive | train | war | coach | road | wagon | working |
|---|--:|--:|--:|--:|--:|--:|--:|
| virtue | 10 | 5 | 15 | 15 | 10 | 10 | 10 |
| royal | 10 | 5 | 0 | 15 | 0 | 0 | 10 |
| holy | 5 | 0 | 0 | 5 | 0 | 0 | 0 |
| beast | 5 | 0 | 15 | 0 | 10 | 5 | 0 |
| sky | 5 | 10 | 0 | 10 | 0 | 0 | 0 |
| place | 15 | 10 | 10 | 10 | 15 | 25 | 15 |
| person | 15 | 0 | 5 | 0 | 15 | 0 | 10 |
| poetic | 0 | 0 | 0 | 0 | 0 | 10 | 0 |
| commerce | 0 | 0 | 0 | 0 | 10 | 0 | 0 |
| menace | 0 | 0 | 15 | 0 | 0 | 0 | 0 |
| affection | 5 | 0 | 10 | 0 | 30 | 30 | 20 |
| leisure | 0 | 0 | 0 | 0 | 10 | 0 | 0 |
| designation | 5 | 0 | 10 | 0 | 0 | 0 | 0 |
| nose | 0 | 0 | 10 | 0 | 0 | 0 | 0 |
| classSet | 30 | 0 | 0 | 0 | 0 | 0 | 0 |
| speed | 0 | 0 | 0 | 45 | 0 | 0 | 0 |
| service | 0 | 70 | 0 | 0 | 0 | 0 | 0 |
| siege | 0 | 0 | 20 | 0 | 0 | 0 | 0 |
| fair | 0 | 0 | 0 | 0 | 0 | 20 | 35 |

- `siege` is weight 0 outside L1 and LF; `nose` in war is 0 at L1.
- The `poetic` role reads the culture's ships `poetic` list.

### 6.4 Culture role multipliers

SS §7.3 applies in both modules. These are added for the new roles; cultures not listed are ×1.

| Culture | Aircraft | Land |
|---|---|---|
| general | – | – |
| norman-british | nose ×1.5, call ×2 | classSet ×3, speed ×3, fair ×3, service ×1.5 |
| american | nose ×3, place ×1.5 (Clipper shapes, §7.6) | service ×2, nose ×2 |
| french | – | service ×1.5 |
| slavic | person ×2 | service ×1.5 |
| japanese, chinese, korean | nose ×0.3 | classSet ×0.3, designation ×3, service ×1.5 |
| indian | – | service ×2 |
| celtic | holy ×3 (airliners named for saints) | – |
| dutch | beast ×2 (airliners named for birds) | – |
| sensitive cultures (SS §14.4) | nose ×0, call ×0 | nose ×0, fair ×0, siege ×0 |

---

## 7. New lists and shapes

Lists are in `vehicles-air-land.json`; names not defined here (`womanName`, `virtue`, `royal`, `sky`, `discovery`, `colour`, `number`, `numberWord`, `ordinalWord`, `greek`, `compass`, `star`, `spaceLand`, `surname`, `brandRoot`) are SS's or GN's, with their tags.

### 7.1 People

| List | Words |
|---|---|
| `manName` (invented; general, norman-british, american, celtic only, as SS `womanName`) | Edward ×2, Henry, William, George, Richard, Charles, James, John, Arthur, Alfred, Harold, Edgar, Edmund, Albert, Robert, Thomas, Walter, Hugh, Ned, Jack |
| `romanNumeral` | I, II, III, IV, V, VI, VII, VIII |

### 7.2 Nose art and crew names (`nose`)

| List | Words |
|---|---|
| `noseName` (whole names, light) | Lucky Lady, Second Chance, Homeward Bound, Return Ticket, Bad Penny, Sack Time, Ready Teddy, Lady Luck, Night Owl, Wee Bonnie, Sky Lark, Old Reliable, Sweet Pea, Snake Eyes, Sitting Pretty, Miss Behave, Dinah Might, Home Sweet Home, Last Laugh |
| `noseAdj` | Lucky ×2, Sweet, Wicked (grim), Lonesome, Little, Hot, Iron, Brazen, Bonny |
| `noseNoun` | Lady ×2, Lass, Penny, Ticket, Angel, Devil (grim), Duchess, Ace, Belle, Jinx |

| Shape | Weight | Example |
|---|--:|---|
| `{noseName}` | 30 | Return Ticket |
| `Lucky {womanName}` | 15 | Lucky Kate |
| `{town} Belle` | 10 | Saltgate Belle |
| `Miss {town}` | 10 | Miss Fenwick |
| `{womanName} of {town}` | 10 | Nellie of Ashby |
| `{noseAdj} {noseNoun}` | 15 | Brazen Duchess |
| `Old {manName}` | 5 | Old Ned |
| `{womanName}` (land war only, as WWI tank crews) | 5 | Daisy |

Nose names are light unless a word says otherwise. For cultures without `womanName` (SS §8.2), shapes with it have weight 0.

### 7.3 Call names (`call`, aircraft A4)

`{letter} for {phonetic}` (50%) or `{letter}-{phonetic}` (50%), where `{phonetic}` is the wartime word for `{letter}`: Able, Baker, Charlie, Dog, Easy, Fox, George, How, Item, Johnny, King, Love, Mike, Nan, Oboe, Peter, Queen, Roger, Sugar, Tare, Uncle, Victor, William, X-ray, Yoke, Zebra. *K for King*, *D-Dog*. Tone plain.

### 7.4 Locomotive class themes (`classSet`)

Each theme is one shape. In a series (§11.1) the whole class keeps one theme.

| Theme | Shape | Weight | Cultures | Example |
|---|---|--:|---|---|
| castle | `{town} Castle` | 15 | all; norman-british ×2 | Ashby Castle |
| hall | `{town} Hall` | 10 | norman-british, general, american | Fenwick Hall |
| manor | `{town} Manor` / `{town} Grange` | 8 | norman-british, general | Saltgate Grange |
| king | `King {manName}` / `King {manName} {romanNumeral}` (50/50) | 6 | general, norman-british | King Edgar III |
| queen | `Queen {womanName}` | 4 | general, norman-british | Queen Ada |
| saint | `{holy}` | 6 | christian cultures | Saint Aldhelm |
| star | `{skyAdj} Star` / `{colour} Star` | 6 | all | Evening Star is blocked; Red Star |
| school | `{town}` | 6 | norman-british | Repton-style *Fenwick* |
| regiment | `The {town} Regiment` / `{town} Fusilier` / `Royal {town} Rifleman` | 8 | norman-british, general | Ashby Fusilier |
| county | `County of {town}` | 6 | norman-british, american | County of Saltgate |
| bird | `{bird}` / `Golden {bird}` | 8 | all | Golden Heron |
| racehorse | `{raceA} {raceB}` | 6 | norman-british, american, general | Dancing Lancer |
| football | `{town} United` / `{town} Rovers` / `{town} Wanderers` / `{town} Athletic` (light) | 4 | norman-british | Fenwick Rovers |
| shipping | `{colour} Funnel Line` / `{town} Line` | 4 | norman-british, dutch | Blue Funnel Line is blocked; Grey Funnel Line |
| people | `Sir {manName} {surname}` / `Lord {surname}` / `{manName} {surname}` | 8 | general, norman-british, american | Sir Walter Pell |
| early American | `General {surname}` / `{town}` / `{virtue}` | 10 | american (L2 only) | General Vance |
| stars (L6) | `{star}` | 10 | all | Altair |

- `{bird}`: BT `cultureAnimals` birds for the culture, else the temperate biome's birds.
- `{raceA}`: Dancing, Flying, Royal, Silver, Golden, Lucky, Gallant, Merry, Blink. `{raceB}`: Lad, Bonnie, Fox, Dancer, Prince, Arrow, Lancer, Lass, Rover, Jester.

### 7.5 Coaches (`speed`)

| List | Words |
|---|---|
| `speedWord` | Telegraph, Tally-Ho, Wonder, Comet, Highflyer, Regulator, Tantivy, Lightning, Magnet, Courier, Swiftsure, Nimrod, Phoenix, Hope, Independent, Defiance, Rapid |

| Shape | Weight | Example |
|---|--:|---|
| `The {speedWord}` | 40 | The Tantivy |
| `The {town} {speedWord}` | 25 | The Saltgate Regulator |
| `The {compass} {speedWord}` | 15 | The Northern Courier |
| `The {colour} Rover` | 10 | The Red Rover |
| `The Royal {speedWord}` | 10 | The Royal Highflyer |

State coaches (royal role, coach only): `The {metal} State Coach` 40 (`{metal}`: Gold, Silver, Glass, Crystal), `The {realm} State Coach` 30 (realms short form), `The {colour} Coach` 30.

### 7.6 Named trains (`service`)

| Shape | Weight | Cultures (×) | Example |
|---|--:|---|---|
| `The {town} Express` / `The {compass} Express` | 15 | all | The Northern Express |
| `The {town} Flyer` | 10 | all | The Fenwick Flyer |
| `The {town} Mail` | 10 | indian ×3 | The Ashby Mail |
| `The {colour} {serviceObj}` (`{serviceObj}`: Arrow, Train, Star, Ribbon, Comet, Bird) | 15 | slavic ×3, french ×2 | The Silver Ribbon |
| `The {town} Limited` / `The {limitedNoun} Limited` (`{limitedNoun}`: Capitals, Overland, Lakes, Mountain, Valley, Plains) | 10 | american ×3 | The Prairie Limited |
| `The {town} Pullman` | 5 | norman-british, american | The Saltgate Pullman |
| `The {town} Queen` | 5 | indian ×3 | The Fenwick Queen |
| `The {town} Riviera` | 3 | norman-british, french | The Ashby Riviera |
| `The {natureWord}` (`{natureWord}`: Light, Hope, Echo, Swallow, Pigeon, Crane, Cherry Blossom, Morning Sun, Lightning, Wind, Wave, Falcon) | 10 | japanese ×4, chinese ×3, korean ×3 | The Swallow |
| `The Night {nightObj}` (`{nightObj}`: Ferry, Mail, Express, Owl (light), Riviera) | 5 | all | The Night Owl |
| `The Master {trade}` (`{trade}`: Weaver, Brewer, Potter, Mason, Smith, Miller) | 3 | norman-british ×2 | The Master Weaver |
| `The {agentNoun}` (`{agentNoun}`: Pathfinder, Pioneer, Talisman, Ranger, Chief, Voyager, Pilgrim) | 5 | all | The Pilgrim |
| `The {town}–{town} Express` (en dash; two different towns) | 5 | all | The Ashby–Fenwick Express |
| `The {spaceLand} Express` / `The {star} Maglev` | 20 | all; L6 only | The Vega Maglev |

### 7.7 Siege engines and war wagons (`siege`)

| Shape | Weight | Tone | Example |
|---|--:|---|---|
| `War {beast}` | 20 | grim | War Boar |
| `Bad {kin}` (`{kin}`: Cousin, Guest, Brother, Uncle, Bride, Stranger, Neighbour) | 15 | light | Bad Cousin |
| `Taker of {wallWord}` (`{wallWord}`: Walls, Towers, Gates, Castles) | 10 | grand | Taker of Towers |
| `{town}-Breaker` | 15 | grim | Saltgate-Breaker |
| `The {siegeAgent}` (`{siegeAgent}`: Thunderer, Wall-Eater, Stone-Thrower, Grinder, Roarer, Sorrow, Answer) | 10 | – | The Wall-Eater |
| `{figure:poss} {siegeNoun}` (`{siegeNoun}`: Stone, Hammer, Answer, Gift, Word) | 10 | grim | the Earl's Gift |
| `The {colour} {siegeNoun}` | 10 | – | The Grey Hammer |
| LF: `{beast} Strider` / `The Walking {tower}` (`{tower}`: Tower, Hill, Keep, Fortress) / `Iron {figure}` | 10 | strange | The Walking Keep |

### 7.8 Fairground and showmen's engines (`fair`)

| Shape | Weight | Example |
|---|--:|---|
| `{fairWhole}` (`{fairWhole}`: Majestic, Supreme, The Busy Bee, King of the Road, Queen of the Fair, Pride of the Road, Old Timer, Little Wonder, Goliath, Samson, Hero, Marvel) | 30 | King of the Road |
| `Queen of the {fairPlace}` (`{fairPlace}`: Fair, Road, Show, Midway (american), Ring) | 15 | Queen of the Show |
| `{surname:poss} {fairNoun}` (`{fairNoun}`: Pride, Wonder, Marvel, Delight, Glory) | 20 | Harrow's Wonder |
| `The {town} Wonder` | 15 | The Ashby Wonder |
| `{fairAdj} {fairNoun}` (`{fairAdj}`: Royal, Golden, Little, Mighty, Dazzling) | 20 | Mighty Marvel |

Fair names are light unless the word says otherwise.

### 7.9 Wagons and caravans

The wagon function also draws `wagonWhole` at weight 15 within the affection role: Wanderer, Rover, Rambler, Long Road, Open Road, Hearth on Wheels (light), Journey's End, Roadside Rest, Far Meadow.

### 7.10 Airliners and airships

Extra place shapes (role place) in aircraft:

| Shape | Weight | Cultures | Levels | Example |
|---|--:|---|---|---|
| `Clipper {town}` / `Clipper {virtue}` / `Clipper {sky}` | 25 | american ×3 | A4 | Clipper Morning Star |
| `Spirit of {town}` | 15 | all | A3 on | Spirit of Saltgate |
| `City of {town}` | 20 | all | A2 on | City of Fenwick |
| `{realm}` | 10 | all | A2 | Ashmark (airships named for nations) |
| `Count {surname}` | 5 | all | A2 | Count Pell |
| `{figure} of the Skies` | 5 | all | A2–A4 | Queen of the Skies is blocked; Duke of the Skies |
| `{colour} Mountain` | 10 | japanese ×3 | A4 on | White Mountain |

### 7.11 Sky ships (AF)

At AF, the role shapes use the sky place words (§4.5), and add:

| Shape | Weight | Role | Example |
|---|--:|---|---|
| `{beast} of the Clouds` | 15 | beast | Heron of the Clouds |
| `Cloud-{cloudNoun}` (`{cloudNoun}`: Runner, Splitter, Dancer, Rider, Treader) | 15 | sky | Cloud-Dancer |
| `Sky {virtue}` | 10 | virtue | Sky Defiance |
| `{royal} of the Upper Air` | 10 | royal | Sovereign of the Upper Air |
| `{town} in the Clouds` | 5 | place | Saltgate in the Clouds |

### 7.12 War engines and wonders (LF)

At LF, `siege` takes its LF shapes (§7.7) at ×2, the dwarven style's pools (SS §10.3) are added to `virtue` and `beast` at ×2, and:

| Shape | Weight | Role | Example |
|---|--:|---|---|
| `Clan {wNoun}` | 15 | person | Clan Anvil |
| `{wAdj} {figure}` | 15 | royal | Iron Duchess |
| `Rune {wNoun}` | 10 | virtue | Rune Hearth |
| `The {beast} Engine` | 10 | beast | The Bear Engine |

---

## 8. Culture lists

Cultures keep their ships lists (SS §8.3). These additions apply only in the new modules:

| Culture | Additions |
|---|---|
| norman-british | aircraft war and bomber: `virtue` adds Dauntless, Defiant, Vigilant, Steadfast, Gallant; land locomotive: `classSet` as §7.4 |
| american | aircraft: Clipper shapes (§7.10); land L2: early American class theme (§7.4); service Limited shapes ×3 |
| french | land service: `The {colour} Train` ×2 |
| slavic | aircraft: `person` shapes `{surname}` ×2 (giant aircraft named for people); land service: `The {colour} Arrow` ×3 |
| indian | land service: Mail and Queen shapes ×3 |
| japanese, chinese, korean | land service: `{natureWord}` shapes; aircraft airliner: `{colour} Mountain` (japanese) |
| celtic | aircraft airliner: `{holy}` ×3 |
| dutch | aircraft airliner: `{bird}` ×3 |

---

## 9. Types and models

With "types and models", the module names the type a craft belongs to, not the craft. Types don't use roles: each function has its own **type families**.

### 9.1 Type pools

| Pool | Words |
|---|---|
| `weatherWord` | Cyclone, Monsoon, Squall, Gale, Blizzard, Mistral, Sirocco, Thunderhead, Downburst, Hailstorm, Waterspout, Northerly, Williwaw |
| `raptor` | Kestrel, Falcon, Eagle, Osprey, Merlin, Hobby, Buzzard, Kite, Condor, Goshawk, Sparrowhawk, Peregrine |
| `insect` | Hornet, Wasp, Gnat, Dragonfly, Horsefly, Cicada, Mayfly, Damselfly |
| `bigBird` | Albatross, Pelican, Stork, Heron, Crane, Swan, Gull, Petrel, Cormorant |
| `smallBird` | Swift, Swallow, Martin, Lark, Linnet, Wren, Finch, Robin, Moth |
| `workBeast` | Otter, Beaver, Moose, Caribou, Musk Ox, Marten, Mink, Bison, Wolverine |
| `bigCat` | Cheetah, Ocelot, Caracal, Serval, Margay, Clouded Leopard, Snow Leopard |
| `smallFierce` | Stoat, Weasel, Badger, Polecat, Mongoose, Marten |
| `horse` | Stallion, Courser, Destrier, Palomino, Thoroughbred, Filly (light), Hackney |
| `draughtBeast` | Ox, Bullock, Mule, Shire, Carthorse, Packhorse, Elephant, Yak, Camel (steppe, arabic-persian ×2) |
| `catPrefix` (for `{catPrefix}cat`) | Storm, Iron, Sky, Sea, Thunder, Fire, Night, Sand, Ice, Wolf, Ghost |
| `rank` | Consul, Ambassador, Viceroy, Envoy, Senator, Sovereign, Monarch, Marshal, Vanguard, Defender, Champion, Warden, Ranger, Courier, Pathfinder, Commander, Captain, Constable, Castellan, Chancellor, Seneschal, Steward, Provost |
| `titan` | Titan, Atlas, Colossus, Goliath, Samson, Mammoth, Giant, Leviathan, Behemoth, Hercules |
| `spirit` | Ghost, Shadow, Wraith, Spectre, Phantom, Spirit, Shade, Seraph |
| `typeWeapon` | Lance, Javelin, Arrow, Dart, Halberd, Claymore, Bolt, Pike, Glaive, Partisan, Falchion |
| `typeSky` | Nova, Aurora, Zenith, Orbit, Polaris, Starling, Quasar, Halo, Solstice, Equinox |
| `prettyWord` (English words chosen for sound) | Charm, Clover, Bloom, Cherry, Merry, Harmony, Symphony, Serene, Breeze, Melody, Prima, Joy, Fortune, Grace, Daybreak, Bonny |
| `greekLetter` | Alpha, Gamma, Epsilon, Zeta, Theta, Iota, Kappa, Sigma, Omega |
| `classTheme` | Castle, Hall, Grange, Manor, King, Queen, Saint, Star, School, Regiment, County, Bird, Racehorse, Footballer, Merchant, Patriot, Jubilee |
| `workWord` | Tractor, Roller, Engine, Steamer, Digger, Hauler, Ploughman |
| `skyPrefix` / `skyShip` (AF) | Sky, Cloud, Storm, Wind, High, Zenith / Galleon, Clipper, Frigate, Barque, Skiff, Cutter, Brig, Sloop, Carrack, Ketch |

### 9.2 Type shapes

| Family | Shapes |
|---|---|
| weather | `{weatherWord}` |
| raptor, insect, bigBird, smallBird, workBeast, bigCat, smallFierce, horse, draughtBeast | the pool word |
| catCompound | `{catPrefix}cat` (closed: *Stormcat*) |
| town | `{town}` |
| exoticTown | a town from the roman world culture's pool (cars named for warm resorts) |
| rank | `{rank}` |
| titan | `{titan}` |
| spirit | `{metal} {spirit}` / `{colour} {spirit}` (`{metal}`: Silver, Golden, Bronze, Iron) |
| weapon | `{typeWeapon}` |
| sky | `{typeSky}` / `Super {typeSky}` (10%) |
| airliner | `Strato{strato}` (`{strato}`: cruiser, liner, master, lifter, jet) / `{typeSky}liner` / `Sky{skyPart}` (`{skyPart}`: master, liner, train, king, lark) |
| pretty | `{prettyWord}` |
| greek | `{greekLetter}` |
| general | `{surname}` / `General {surname}` |
| classTheme | `the {classTheme} class` |
| designation | aircraft: `{AA}-{n}` (two capitals, 2–3 digits) · `Type {n}` (1–100) · `{A}-{n}` (1–99); land: `{A}-{n}` · `Type {n}` · `Mark {romanNumeral}` (L3 only) · `Class {n}` (locomotives, 1–99) |
| carriage | `{town}` / `{surname}` (carriages named for a town or a patron) |
| wagonType | `{town} Wagon` / `{landWord} Schooner` (`{landWord}`: Steppe, Desert, Plains, Tundra, Veld) / `{town} Van` |
| workType | `{titan}` / `{surname} {workWord}` / `Little {colour} {surname}` (light) / `{draughtBeast}` |
| skyShip (AF) | `{skyPrefix} {skyShip}` |
| engineType (LF) | `{wAdj} {wNoun}` / `{beast} Strider` / `Rune {wNoun}` |
| future (A7, L6) | `{star}-class` / `{beast} Crawler` / `{spaceLand} Rover` / `Sky{weatherWordLower}` (closed: *Skytempest*) |

### 9.3 Family weights by function

**Aircraft**

| Family | war | bomber | airliner | transport | explore | private | working | state | raider |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| weather | 25 | 10 | 0 | 0 | 15 | 15 | 0 | 0 | 20 |
| raptor | 20 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 15 |
| insect | 10 | 5 | 0 | 0 | 0 | 5 | 0 | 0 | 15 |
| catCompound | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 10 |
| bigBird | 0 | 0 | 10 | 20 | 15 | 15 | 20 | 0 | 0 |
| smallBird | 0 | 0 | 0 | 0 | 0 | 35 | 10 | 0 | 0 |
| workBeast | 0 | 0 | 0 | 0 | 0 | 0 | 20 | 0 | 0 |
| horse | 5 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 |
| town | 0 | 30 | 10 | 0 | 0 | 0 | 0 | 15 | 0 |
| rank | 5 | 10 | 25 | 20 | 20 | 10 | 20 | 40 | 0 |
| sky | 0 | 10 | 25 | 15 | 30 | 15 | 0 | 30 | 20 |
| airliner | 0 | 0 | 30 | 10 | 0 | 0 | 0 | 15 | 0 |
| weapon | 10 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 20 |
| designation | 15 | 20 | 10 | 25 | 20 | 15 | 30 | 0 | 0 |

At AF, every function uses skyShip 70 and the function's weather, raptor, bigBird, rank and sky weights for the rest. At A7, future 40 and the rest as written.

**Land vehicles**

| Family | locomotive | war | coach | road | wagon | working |
|---|--:|--:|--:|--:|--:|--:|
| classTheme | 60 | 0 | 0 | 0 | 0 | 0 |
| designation | 30 | 20 | 0 | 5 | 0 | 10 |
| rank | 10 | 25 | 10 | 15 | 0 | 0 |
| bigCat | 0 | 15 | 0 | 10 | 0 | 0 |
| smallFierce | 0 | 10 | 0 | 0 | 0 | 0 |
| general | 0 | 15 | 0 | 0 | 0 | 0 |
| weapon | 0 | 5 | 0 | 5 | 0 | 0 |
| town | 0 | 0 | 0 | 15 | 0 | 0 |
| exoticTown | 0 | 0 | 0 | 10 | 0 | 0 |
| spirit | 0 | 0 | 0 | 10 | 0 | 0 |
| weather | 0 | 0 | 0 | 10 | 0 | 0 |
| horse | 0 | 0 | 0 | 5 | 0 | 0 |
| sky | 0 | 0 | 0 | 10 | 0 | 0 |
| pretty | 0 | 0 | 0 | 5 | 0 | 0 |
| greek | 0 | 0 | 0 | 5 | 0 | 0 |
| titan | 0 | 0 | 0 | 0 | 0 | 30 |
| carriage | 0 | 0 | 90 | 0 | 0 | 0 |
| wagonType | 0 | 0 | 0 | 0 | 100 | 0 |
| workType | 0 | 0 | 0 | 0 | 0 | 60 |

- **L1 war** (siege engines and chariots): `the {beast}` 60 (siege engines named for beasts, as the *onager* and *sow*), weapon 20, rank 20.
- **LF:** engineType 70 for every function, the rest as written.
- **L6:** future 40, the rest as written.

### 9.4 Culture leanings for types

| Culture | Leanings |
|---|---|
| norman-british | weather ×2, town ×2 (bombers named for cities), rank ×2, spirit ×2, classTheme ×2 |
| american | catCompound ×3, general ×3, horse ×2, airliner ×2, designation ×1.5 |
| slavic | designation ×3, general ×0.5 |
| japanese | designation ×3 (*Type {n}*), pretty ×3, weather ×1.5 |
| chinese, korean | pretty ×3, designation ×2 |
| roman | greek ×3, exoticTown ×0.5 |
| french | general ×2, designation ×1.5 |
| steppe, arabic-persian | draughtBeast ×2, horse ×2 |

- **Mark numbers:** a type name takes ` Mark {romanNumeral}` (II–V) at 15% (*Kestrel Mark III*), never on designations or classes.
- **Initial letter:** for norman-british war types, the rank family draws only words beginning with C at 50% (the British habit of C-names for tanks).

### 9.5 As one family

"As one family" returns one maker's line of types on one family: every name from the same family, with no word twice; the rank family keeps one initial letter for the whole family; designations share their letter prefix and rise in number (*Ka-21*, *Ka-27*, *Ka-32*).

---

## 10. Rendering

As SS §13, and:

- **Types:** no leading "The", except the class family (*the Castle class*, lower-case "the" and "class").
- **Closed compounds** (`{catPrefix}cat`, `Strato…`, `Sky…`) are one word, second part lower case.
- **En dash** between two towns in named trains, unspaced (*The Ashby–Fenwick Express*).
- Every name passes `repeatsContent` (*Saltgate Saltgate Express* is redrawn).

---

## 11. Series

### 11.1 Each craft: as one class

SS's class series (TS §3), and these class rules:

| Module, function | Class rule |
|---|---|
| land locomotive | one `classSet` theme for the whole class (§7.4), drawn by its weights |
| land war (L3–L4), aircraft airliner, aircraft bomber | at 40%, a **letter class**: every name starts with the same letter (as the tanks of one company, or the airliners of one class) |
| aircraft airliner, american, A4 | at 50%, a Clipper fleet: every name `Clipper {…}` |
| land train | one shape for the whole set (*The … Express*) |
| land working (fair) | one shape for the whole set |

No word twice in a class.

### 11.2 Types: as one family

§9.5.

---

## 12. Codes

Codes are added only when the codes link is on, naming is each craft, the setting is MR, MF or SF, and a row below applies. `{A}` is a capital letter, `{d}` a digit.

### 12.1 Aircraft

Format: `{name} ({code})`: *Spirit of Saltgate (G-ABCD)*.

| Culture | Civil (airliner, transport, private, working, explore, state) | Military (war, bomber) |
|---|---|---|
| general, norman-british | `G-{AAAA}` (A3 on) | `{A}{dddd}` (A3–A4); `{AA}{ddd}` (A5 on) |
| american | `N{ddd}{AA}` (A3 on) | `{dd}-{ddddd}` (A4); `{dd}-{dddd}` (A5 on) |
| french | `F-{AAAA}` | – |
| dutch | `PH-{AAA}` | – |
| roman | `I-{AAAA}` | – |
| iberian | `EC-{AAA}` or `CS-{AAA}` (50/50) | – |
| slavic | `RA-{ddddd}` (A6 only) | – |
| japanese | `JA{dddd}` | – |
| chinese | `B-{dddd}` | – |
| korean | `HL{dddd}` | – |
| indian | `VT-{AAA}` | – |
| arabic-persian | `EP-{AAA}` | – |
| egyptian | `SU-{AAA}` | – |
| ethiopian | `ET-{AAA}` | – |
| any culture, SF | `{AA}-{dddd}` | `{AA}-{dddd}` |
| airships (A2) | norman-british, general: `R{dd}`; american: `ZR-{d}` | as civil |

No code at A1 or AF, or where the row has a dash.

### 12.2 Land vehicles

| Function | Levels | Format | Example |
|---|---|---|---|
| locomotive | L2 | `No. {d–ddd} {name}` | No. 27 General Vance |
| locomotive | L3–L5, norman-british and general | `{dddd} {name}` | 4127 Ashby Castle |
| locomotive | L3–L5, other cultures | `No. {dddd} {name}` | No. 6201 Altair |
| war | L3 | `{A}{dd} {name}` (company letter and number; in a letter class, the class letter) | D17 Daisy |
| any other | – | no code | – |

---

## 13. Styles

SS's styles, offered by module:

| Style | Aircraft | Land |
|---|---|---|
| heroic, elven | AF only | LF only |
| dwarven | AF only | LF and L2 only |
| dark | yes | yes |
| oceanic | no | no |
| fpirate | AF only (label "sky pirate") | no |
| steampunk, dieselpunk | yes | yes |
| postapoc, wasteland | yes | yes |
| sfmilitary, corporate, colony, ai, alien, outlaw | yes | yes |
| sfexplore | yes | no |

Settings follow SS §10.1. Shares and shapes as SS §10.2–§10.4. In aircraft, style shapes that use sea words read the sky words (§4.5).

---

## 14. Safeguards

### 14.1 Block list

Whole-name matches (case-insensitive; codes and a leading "The" ignored) are redrawn. Add to `vehicles-air-land.json`; vessel safeguard packs (SS §14.5) apply and can add, not remove.

- **Real aircraft:** Memphis Belle, Enola Gay, Bockscar, Spirit of St. Louis, Spirit of St Louis, Winnie Mae, Glamorous Glennis, Sentimental Journey, Swoose, Lady Be Good, Lucky Strike, G for George, G-George, S for Sugar, S-Sugar, Air Force One, Spruce Goose, Hindenburg, Graf Zeppelin, Norge, Italia, R100, R101, Shenandoah, Akron, Macon, Los Angeles, Le Géant, Double Eagle, Breitling Orbiter, Kitty Hawk, Wright Flyer, Queen of the Skies, Clipper America, China Clipper, Yankee Clipper, Dixie Clipper.
- **Real aircraft types:** Spitfire, Seafire, Hurricane, Typhoon, Tempest, Tornado, Lightning, Meteor, Vampire, Venom, Hunter, Harrier, Hawk, Mosquito, Lancaster, Halifax, Stirling, Wellington, Blenheim, Lincoln, Vulcan, Victor, Valiant, Camel, Snipe, Moth, Tiger Moth, Gipsy Moth, Swordfish, Sunderland, Catalina, Dakota, Skytrain, Comet, Constellation, Super Constellation, Stratocruiser, Stratoliner, Stratofortress, Viscount, Britannia, Trident, Mustang, Thunderbolt, Corsair, Wildcat, Hellcat, Bearcat, Tomcat, Tigercat, Warhawk, Kittyhawk, Airacobra, Flying Fortress, Superfortress, Liberator, Mitchell, Marauder, Sabre, Phantom, Starfighter, Nighthawk, Blackbird, Galaxy, Globemaster, Hercules, Starlifter, Zero, Shiden, Flanker, Fulcrum, Fishbed, Foxbat, Backfire, Blackjack, Gripen, Viggen, Draken, Mirage, Rafale, Tucano, Otter, Twin Otter, Beaver, Caribou, Buffalo, Cub, Learjet, Concorde, Jumbo, Jumbo Jet, Dreamliner, Starliner, Skyhawk, Skymaster, Skyraider, Skyknight, Stratojet.
- **Real locomotives and trains:** Flying Scotsman, Mallard, Rocket, Puffing Billy, Locomotion, Tom Thumb, John Bull, Best Friend of Charleston, DeWitt Clinton, General, Texas, Fairy Queen, Evening Star, City of Truro, Caerphilly Castle, King George V, Sir Nigel Gresley, Duchess of Hamilton, Big Boy, Flying Hamburger, Orient Express, Simplon-Orient-Express, Train Bleu, Blue Train, Golden Arrow, Red Arrow, Royal Scot, Coronation Scot, Silver Jubilee, Cornish Riviera, Night Ferry, Master Cutler, Talisman, Elizabethan, Twentieth Century Limited, Broadway Limited, Golden State Limited, Prairie Limited, Super Chief, Empire Builder, California Zephyr, Rheingold, Frontier Mail, Deccan Queen, Palace on Wheels, Hikari, Nozomi, Kodama, Tsubame, Hato, Rossiya, Trans-Siberian, Ghan, Indian Pacific, Blue Funnel Line, Castle class, King class.
- **Real war machines:** War Wolf, Warwolf, Malvoisin, Bad Neighbour, Helepolis, Taker of Cities, Little Willie, Big Willie, Mother, Fray Bentos, Crème de Menthe, Dinnaken, Deborah, Cobra King, Thunderbolt, Tiger, King Tiger, Panther, Leopard, Puma, Maus, Elefant, Ferdinand, Sherman, Grant, Lee, Stuart, Pershing, Patton, Abrams, Bradley, Matilda, Valentine, Crusader, Cavalier, Churchill, Cromwell, Centurion, Conqueror, Chieftain, Challenger, Scorpion, Scimitar, Saladin, Saracen, Ferret, Warrior, Leclerc, Merkava, Arjun, Black Prince, Firefly, Onager, Mangonel.
- **Real coaches and road vehicles:** Gold State Coach, Irish State Coach, Glass Coach, Scottish State Coach, Australian State Coach, Diamond Jubilee State Coach, Silver Ghost, Silver Shadow, Silver Wraith, Silver Spirit, Silver Seraph, Silver Dawn, Silver Spur, Silver Cloud, Phantom, Ghost, Wraith, Spectre, Cullinan, Black Shadow, Black Lightning, Model T, Tin Lizzie, Beetle, Mini, Minor, Cortina, Capri, Granada, Sierra, Escort, Fiesta, Zephyr, Zodiac, Anglia, Prefect, Thunderbird, Corvette, Camaro, Impala, Bel Air, Eldorado, Seville, Fury, Charger, Viper, Cobra, Stingray, Corolla, Corona, Crown, Camry, Celica, Supra, Civic, Accord, Prelude, Sunny, Bluebird, Fairlady, Cedric, Gloria, Skyline, Silvia, Panda, Punto, Lambda, Delta, Giulietta, Herald, Dolomite, Stag, Rapier, Alpine, Minx, Imp, Avenger, Viva, Astra, Cresta, Velox, Jaguar, Bonneville, Commando, Gold Star, Bullet, Routemaster, Atlantean, Olympian, Regent, Conestoga, Prairie Schooner, Babs, Golden Arrow, Spirit of America, Thrust2, Thrust SSC.
- **Fiction:** Thunderbird 1, Thunderbird 2, Thunderbird 3, Thunderbird 4, Thunderbird 5, Airwolf, Blue Thunder, Firefox, Snowspeeder, X-wing, TIE Fighter, Batwing, Quinjet, Helicarrier, Nimbus Two Thousand, Firebolt, Flying Ford Anglia, Sandcrawler, AT-AT, AT-ST, Landmaster, Warthog, Mako, Hogwarts Express, Polar Express, Snowpiercer, Interceptor, War Rig, Doof Wagon, Gigahorse, Laputa, Highwind, Ragnarok, Chitty Chitty Bang Bang, Genevieve, General Lee, Herbie, KITT, Batmobile, Ecto-1, DeLorean, Mystery Machine, Bumblebee, Optimus Prime, Lightning McQueen, Christine, Eleanor, Thomas the Tank Engine, Deadwood Stage, Black Pearl, Flying Dutchman.

**Common single words.** The single common words in the real aircraft types, war machines and road vehicles lists (*Hurricane*, *Tiger*, *Comet*, *Herald*, *Lightning*…) are blocked only when naming **types and models**. As the name of a single craft (*the Comet*, a mail coach; *Lightning*, a tank) they are allowed.

### 14.2 Flag list

Allowed by default: Eagle, Falcon, Raptor, Hornet, Kestrel, Vanguard, Consul, Titan, Juggernaut, Walker, Goliath, Samson, Defiant, Dauntless, Intrepid, Spirit of Saltgate-style *Spirit of {town}*, King of the Road, Queen of the Fair.

### 14.3 Banned words

In any position, in both modules: SS §14.3; the money module's list (MC §13.3); and the names of real peoples and nations, which real makers have used for vehicles and which this module never uses: Apache, Comanche, Cheyenne, Kiowa, Lakota, Dakota, Sioux, Chinook, Mohawk, Iroquois, Shawnee, Seminole, Navajo, Navaho, Cherokee, Pawnee, Huron, Ute, Arapaho, Blackfoot, Mescalero, Hiawatha, Pontiac, Winnebago, Geronimo, Tomahawk, Zulu, Maori, Inuit, Eskimo, Gurkha, Gipsy. Whole names: Black Hawk, Sitting Bull, Crazy Horse, Red Cloud.

### 14.4 Sensitive cultures

SS §14.4 applies, and: the `nose`, `call`, `fair` and `siege` roles are never drawn for sensitive cultures (§6.4), and their `poetic` names are never used in types.

---

## 15. Presets

```yaml
---
type: module-preset
module: vessels
vesselModule: landVehicles
packName: Western Region engines
culture: norman-british
function: locomotive
technology: L3
genre: modern
fantastic: false
naming: craft
style: none
tone: any
prefixes: true
people: invented
series: true
---

Norman & British-themed locomotives with early motor technology, for a modern world of the real world, naming each vehicle, in no particular style, of any tone, with numbers, with invented people and places, as one class.
```

| Key | Values | Default |
|---|---|---|
| `vesselModule` | `ships`, `spacecraft`, `aircraft`, `landVehicles` | required |
| `naming` | `craft`, `types` | `craft` |
| `prefixes` | `true`, `false` (the codes link) | `false` |
| the rest | as SS §15 | as there |

A preset with technology `AF` or `LF` in a world without fantastic runs with technology any and reports it, as SS does for styles. Presets of ships and spacecraft without `naming` are unchanged.

---

## 16. Tests (`tests/airLandVehicles.test.ts`)

### 16.1 Data

- Every culture has `airSpan` and `landSpan` (possibly empty) inside its module's levels.
- Every role in §6.2–§6.3 exists; every list named in §7 and §9 exists; no word contains `(`, `)`, `§`, `×`, `?` or `→`.
- No pool word or fixed shape matches the block list or a banned word.
- Ships and spacecraft output is identical, seed for seed (existing fixtures and `tests/vessels.test.ts`).

### 16.2 Determinism and coverage

- Same options and seed give the same names.
- Every module × culture × technology offered × function available × setting × naming × people: 20 unique names within the cap.

### 16.3 Technology and functions

- §4.3: the technology menu matches the table for every setting; AF and LF only with fantastic on.
- Bombers never at A1–A2; named trains never at L1; coaches never at L4–L6; road vehicles never at L1–L2.
- A Maya locomotive (no native land span): non-hybrid names come from Maya ships lists; at least 25% of 2,000 names hold an L-level tech word.

### 16.4 Roles

- Call names only at A4, and every one pairs a letter with its own phonetic word.
- A norman-british locomotive class: every name on one theme.
- Sensitive cultures: 0 names from `nose`, `call`, `fair`, `siege`, `affection`, `menace`, `figure` or `leisure`.

### 16.5 Types

- Types never have a code or a leading "The" (except the class family).
- Over 2,000 american fighter types, catCompound and the -cat words are at least 15%; over 2,000 japanese types, *Type {n}* designations at least 20%.
- As one family: one family per batch, no word twice; rank families keep one initial letter.
- No type contains a §14.3 word.

### 16.6 Codes

- Codes only with the link on, naming each craft, in MR, MF or SF.
- *G-* only for general and norman-british; *N* only for american; no code at A1 or AF; every code matches its row's pattern.
- Locomotive numbers as §12.2; L3 war codes use the class letter in a letter class.

### 16.7 Safeguards

- 5,000 names per culture per module per naming: 0 block-list matches (codes stripped), 0 banned words, 0 living-religion divine names.

### 16.8 Sentences and presets

- Default aircraft plain text: "General-themed aircraft of any kind with any technology, for a modern world of the real world, naming each craft, in no particular style, of any tone, without codes, with placeholders for people and places, each one separate."
- Default land plain text: "Norman & British-themed land vehicles of any kind with any technology, for a modern world of the real world, naming each vehicle, in no particular style, of any tone, without numbers, with placeholders for people and places, each one separate."
- `aircraft` and `landVehicles` follow `spacecraft` in `VESSEL_SECTIONS`.
- Resets as §2.3; preset round-trips, including AF in a non-fantastic world and old ships presets without `naming`.

---

## 17. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Data and craft engine.** `vehicles-air-land.json`; spans, technology, functions, roles, lists, shapes, culture additions, hybrids, place words, safeguards; the two modules generate individual names | §16.1–§16.4 and §16.7 pass |
| M2 | **Types, series, codes, styles.** §9, §11, §12, §13 | §16.5–§16.6 pass |
| M3 | **Modules.** Sections, sentences, resets, history, presets; README section; rebuilt `main.js` | §16.8 passes; both modules generate in the app |

---

## 18. Parked

- Named horses, hounds and other animals (with the named things parked list).
- Bicycles, rickshaws, palanquins and sedan chairs.
- Lifts, cable cars, funiculars and trams as their own functions.
- Squadron, regiment and railway company names (these sit better in group names).
- Class names shown above a craft series (*Castle class*), as SS.
- Legacy names with numbers (*Saltgate Belle II*).
