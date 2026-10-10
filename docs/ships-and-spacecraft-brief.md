# Ships and spacecraft – brief (first release)

This brief adds a new module group, **ships and vehicles**, with two modules:

- **ships and boats:** canoes to container ships, for any culture, with any technology
- **spacecraft and stations:** rockets to interstellar ships, stations and habitats

Aircraft, airships and land vehicles are parked for a second release (§17).

It replaces the earlier ship handover's 70 fixed shades with links that combine:

| Link | Decides | Example |
|---|---|---|
| **Culture** | what a people names things after | British: virtues, royalty, towns |
| **Technology** | what the vessel is; adds its own words | Steam and iron: Iron, Engine, Collier |
| **Function** | what it's for | warship, merchant, working boat |
| **Style** | genre flavour | elven, steampunk, corporate |
| **Tone** | mood | the five tones |

Culture and technology are independent, so a Polynesian coal steamer or a British-named fleet of canoes works (§4.3).

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow `docs/group-names-brief.md` (GN §x) and `docs/group-tone-and-series-brief.md` (TS §x). Reuse the group engine's helpers (weighted draws, setting gating, tone factor, series, plurals, possessives, `townPool`, safeguard checks) rather than copying them.

All results are in **translated English**. There are no native-language forms in this module.

> **Override (from the request that delivered this brief):** the two modules go into the **advanced** section group, at the bottom, rather than a new `vessels` group. Ships and boats uses the supplied ship icon (Fluent `vehicle-ship-24-filled`) as its module icon.

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Group | New section group `vessels`, label "ships and vehicles", after bynames and titles in the switcher (or after group names if bynames hasn't landed) |
| Modules | ships and boats · spacecraft and stations |
| Cultures | 34: General, 19 world and byname cultures, 7 maritime additions, 7 Pacific and Indigenous American cultures (§3) |
| Technology | Its own link. 7 levels for ships, 3 for spacecraft. Never gated by culture or setting. |
| Out-of-span technology | The culture's customs from its nearest real technology, plus the chosen technology's words (§4.3) |
| Function | 8 for ships, 10 for spacecraft |
| Style | Its own link; only the styles that fit the setting are offered |
| Tone | The five tones (TS §2) |
| Series | A ship class, as TS §3; shown once a function is picked |
| Prefixes | Optional: HMS, USS, SS, RMS, MV, RV, FV in real-world settings; invented ones in sci-fi; never in fantasy |
| People and places | Placeholders or invented, as GN §8 |

---

## 1. Module line-up

### 1.1 Section group and sections

- Add `vessels` to `SectionGroup`, label `"ships and vehicles"`.
- Add two `NameForgeSection` values:

| Section key | Label | Icon (Lucide) |
|---|---|---|
| `ships` | ships and boats | `ship` |
| `spacecraft` | spacecraft and stations | `rocket` |

The group remembers its last-used module (`groupModule.vessels`).

### 1.2 History

`{module label} · {setting phrase} · {culture label} · {technology label}`, then ` · {style}` when a style is chosen, ` · {tone}` when not Any, ` · class` in a series.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/vessels.json` | All data in §3–§12 |
| `src/vessels/engine.ts` | Generation (§5), rendering (§13), safeguards (§14). No Obsidian imports. |
| `src/vessels/sentence.ts` | The two sentences (§2) |
| `tests/vessels.test.ts` | §16 |

Add this brief to `docs/` as `ships-and-spacecraft-brief.md`.

---

## 2. The sentences

### 2.1 Shapes

**Ships and boats**

> ‹General›-themed ‹ships and boats of any kind› with ‹any› technology, for a ‹fantasy› world ‹of historic or low fantasy›, in ‹no particular› style, ‹of any tone›, ‹without prefixes›, with ‹placeholders for› people and places, ‹each one separate›.

**Spacecraft and stations**

> ‹General›-themed ‹spacecraft of any kind› with ‹any› technology, for a ‹science fiction› world, in ‹no particular› style, ‹of any tone›, ‹without prefixes›, with ‹placeholders for› people and places, ‹each one separate›.

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | label + "-themed" | General, then the cultures in §3 order, grouped as §3.1 | `general` |
| `polySub` | (part of the culture choice) | Polynesian has three entries: Hawaiian, Māori, Western Polynesian | – |
| `function` | the "any" phrase or a function's plural (§6) | Any, then the functions available for the culture and technology | any |
| `technology` | "with ‹label› technology" | any, then the levels (§4) | any |
| `genre`, `fantastic` | as GN §2.2 | ships: fantasy, modern, sci-fi; spacecraft: modern, sci-fi | ships: fantasy; spacecraft: sci-fi |
| `style` | "in ‹no particular› style" / "in ‹an elven› style" | none, then the styles for the setting (§10) | none |
| `tone` | as TS §5.2 | the six | any |
| `prefixes` | "without prefixes" · "with prefixes" | the two | without |
| `people` | as GN §2.2 | the two | placeholders |
| `series` | "each one separate" · "as one class" | the two | separate |

- **Technology "any":** each name draws a level from the culture's native span (§4.2), evenly.
- **Prefixes link:** shown only in MR, MF and SF.
- **Series link:** shown only when a function is picked; Function back to Any resets it, as TS §5.3.
- **Spacecraft settings:** sci-fi (SF) for all levels; modern (MR, MF) for rocket age only. Choosing modern sets technology to rocket age and offers only that level. The fantastic link works as in GN for modern.
- **Tooltips:** culture, "Naming culture: what its people name vessels after"; technology, "What the vessel is: adds its own words; any culture can have any technology"; function, the function's description; style, the style's description; prefixes, "Prefixes such as HMS or SS, where the culture and period used them"; the rest as GN and TS.

### 2.3 Resets

- **Culture or technology changed:** a function not available (§6.2) resets to Any.
- **Setting changed:** a style not available resets to none.
- **Spacecraft, genre set to modern:** technology resets to rocket age.

### 2.4 Plain text, state and presets

Plain text as GN §2.6; session-only state; presets in §15.

---

## 3. Cultures

### 3.1 Line-up and menu groups

| Menu group | Cultures (key · label) |
|---|---|
| – | `general` · General |
| British Isles and northern Europe | `anglo-saxon` · Anglo-Saxon · `norse` · Norse · `celtic` · Celtic · `norman-british` · Norman & British |
| Western and southern Europe | `french` · French · `dutch` · Dutch · `iberian` · Spanish & Portuguese · `roman` · Roman / Italian · `greek-byzantine` · Greek & Byzantine |
| Eastern Europe and the steppe | `slavic` · Slavic · `steppe` · Turkic & Mongol steppe |
| Middle East, Africa and the Indian Ocean | `arabic-persian` · Arabic & Persian · `ottoman` · Ottoman & Barbary · `swahili-omani` · Swahili & Omani · `egyptian` · Egyptian · `ethiopian` · Ethiopian · `bantu` · Bantu · `west-african` · West African · `indian` · Indian · `malay` · Malay & Indonesian |
| East Asia | `chinese` · Chinese · `japanese` · Japanese · `korean` · Korean |
| The Pacific | `hawaiian` · Hawaiian · `maori` · Māori · `w-polynesian` · Western Polynesian |
| The Americas | `american` · American · `nw-coast` · Pacific Northwest Coast · `arctic` · Arctic · `na-woodlands` · North American Woodlands & Rivers · `aztec` · Aztec · `maya` · Maya · `andean` · Andean |

34 in all.

### 3.2 Culture records

Each culture record has:

| Field | Meaning |
|---|---|
| `span` | the technology levels it really had, as a range (§4.1) |
| `roles` | multipliers on the role weights (§7); missing means ×1 |
| `techRoles` | multipliers that apply only at some levels, e.g. `{"T5-T7": {"place": 2}}` |
| own lists | words for roles (§8). A culture's own list **replaces** the shared list for that role. |
| `flavour` | the animal list used for `{beast}` at ×3 (§3.3) |
| `town` | where `{town}` comes from (§12.2) |
| `holy` | `christian`, `gods`, `blessing` or `none` (§8.4) |
| `sensitive` | true for the indigenous cultures (§14.4) |

### 3.3 Flavour animals

| Culture | Source |
|---|---|
| world-place cultures (anglo-saxon, norse, celtic, roman, slavic, arabic-persian, indian, japanese, korean, egyptian, ethiopian, bantu, west-african, aztec, maya) | the world culture's `animal` list (`beast` for chinese) |
| norman-british | Lion, Hart, Boar, Bear, Hound, Falcon, Swan |
| french | Lion, Eagle, Cockerel, Stag, Swan, Falcon |
| dutch | Lion, Swan, Heron, Stork, Horse |
| iberian | Lion, Bull, Eagle, Falcon, Dolphin |
| greek-byzantine | Dolphin, Eagle, Lion, Owl, Bull, Serpent |
| steppe | Wolf, Horse, Falcon, Eagle, Snow Leopard, Swan |
| ottoman | Lion, Falcon, Eagle, Horse |
| swahili-omani | Dolphin, Turtle, Falcon, Heron, Kingfisher |
| malay | the tribal `maritimeSEA` flavour animals |
| hawaiian, maori, w-polynesian | the tribal `polynesian` flavour animals |
| nw-coast, arctic | the tribal `northernPacific` flavour animals |
| na-woodlands | the tribal `northAmerican` flavour animals |
| andean | the tribal `andean` flavour animals |
| american | Eagle, Bear, Wolf, Bison, Hawk, Panther |

---

## 4. Technology

### 4.1 Levels

**Ships**

| Code | Label | Adds |
|---|---|---|
| T1 | paddle and canoe | short names; close-to-nature words |
| T2 | oar and galley | oars, rams, beaks |
| T3 | early sail | wind, voyage, venture |
| T4 | Age of Sail | (no extra words; customs carry it) |
| T5 | steam and iron | iron, steam, engine, collier |
| T6 | diesel and steel | steel, turbine, express |
| T7 | modern | global, carrier, corporate series |

**Spacecraft**

| Code | Label | Adds |
|---|---|---|
| S1 | rocket age | rocket, orbit, lunar |
| S2 | interplanetary | solar, ion, belt |
| S3 | interstellar | deep, light, far |

Items (shapes, words) can carry a technology range `k`, e.g. `"k": "T5-T7"`. Untagged means every level.

### 4.2 Native spans

| Culture | Span | Culture | Span |
|---|---|---|---|
| general | T1–T7 | swahili-omani | T2–T5 |
| anglo-saxon | T1–T3 | egyptian | T1–T3 |
| norse | T1–T3 | ethiopian | T1–T4 |
| celtic | T1–T4 | bantu | T1–T3 |
| norman-british | T2–T7 | west-african | T1–T3 |
| french | T3–T7 | indian | T2–T7 |
| dutch | T3–T7 | malay | T1–T5 |
| iberian | T3–T6 | chinese | T2–T7 |
| roman | T2–T7 | japanese | T1–T7 |
| greek-byzantine | T2–T4 | korean | T1–T7 |
| slavic | T1–T7 | hawaiian, maori, w-polynesian | T1–T3 |
| steppe | T1–T3 | american | T4–T7 |
| arabic-persian | T2–T5 | nw-coast, arctic, na-woodlands | T1 |
| ottoman | T3–T5 | aztec, maya | T1 |
| andean | T1–T3 | | |

**Spacecraft:** no culture has a native space level. Every culture's customs come from its highest native ship level (§4.3).

### 4.3 Out-of-span technology

When the chosen level L is outside the culture's span:

1. **Customs level:** the culture's span level nearest to L (ties go to the higher level). Every `k` tag and `techRoles` entry is read **as if** at that customs level.
2. **Technology words:** the hybrid share (§9) rises from 20% to 35%, and hybrids use L's words.
3. **Function availability** (§6.2) uses L, not the customs level.
4. Nothing is flagged or blocked.

Examples (illustrations): Polynesian at T5 → customs of T3, words of T5: *Iron Star of the Ancestors*. British at T1 → customs of T2: *Saint Brannoc*, *Swift Oak*. Arctic spacecraft at S3 → customs of T1, words of S3: *Deep Seal beneath the Ice*.

---

## 5. Generation pipeline

```
module
    ↓
technology     (chosen, or drawn from the culture's span: §2.2)
    ↓
customs level  (§4.3)
    ↓
function       (chosen, or weighted: §6)
    ↓
route          style share (§10) · hybrid share (§9) · role route (§7)
    ↓
role → shape   (role weights × culture multipliers; shapes filtered by k, function, setting)
    ↓
tokens         (culture list or shared list; flavour; tone; people and places)
    ↓
rendering      (§13: capitals, articles, prefixes)
    ↓
safeguards     (§14)
    ↓
name
```

- **Route order per name:** if a style is chosen, the style route with its share (§10.2); otherwise (or if not taken) the hybrid route with its share (§9); otherwise the role route.
- **Weights:** base × culture role multiplier × `techRoles` × tone factor (TS §2.4); renormalised after filtering.
- **Failure and batches:** as GN §4.
- **Length cap:** 8 words, counted as GN §11.2.

---

## 6. Functions

### 6.1 Ships

| Key | Menu | Sentence plural | Weight (Any) |
|---|---|---|--:|
| `war` | Warships | warships | 25 |
| `merchant` | Merchant ships | merchant ships | 20 |
| `passenger` | Passenger ships | passenger ships | 8 |
| `explore` | Exploration and research | ships of exploration | 8 |
| `working` | Working boats | working boats | 15 |
| `yacht` | Yachts and pleasure boats | yachts and pleasure boats | 8 |
| `raider` | Pirates, privateers and smugglers | raiders | 10 |
| `sacred` | Sacred and official vessels | sacred and official vessels | 6 |

"Any" phrase: "ships and boats of any kind".

**Descriptions.** War: "Warships from war canoes to carriers". Merchant: "Traders, cargo ships and merchantmen". Passenger: "Packets, liners and ferries". Explore: "Ships of exploration, survey and research". Working: "Fishing boats, tugs, ferries and harbour craft". Yacht: "Yachts and pleasure boats". Raider: "Pirates, privateers and smugglers". Sacred: "Royal barges, ceremonial and sacred craft".

### 6.2 Availability

| Function | Needs |
|---|---|
| passenger | T4 or later |
| yacht | T3 or later; never for `sensitive` cultures |
| all others | any level |

### 6.3 Spacecraft

| Key | Menu | Sentence plural | Weight | Needs |
|---|---|---|--:|---|
| `war` | Warships | warships | 25 | – |
| `merchant` | Freighters | freighters | 20 | – |
| `passenger` | Liners | liners | 8 | S2+ |
| `explore` | Survey and exploration | survey ships | 12 | – |
| `working` | Working craft | working craft | 10 | – |
| `yacht` | Private craft | private craft | 5 | S2+ |
| `raider` | Raiders and smugglers | raiders | 8 | – |
| `sacred` | Flagships and official ships | official ships | 4 | – |
| `colony` | Colony and generation ships | colony ships | 8 | S2+ |
| `station` | Stations and habitats | stations and habitats | 10 | – |

"Any" phrase: "spacecraft of any kind". Working craft: "Tugs, miners, haulers and salvage ships".

---

## 7. Roles

A **role** is a theme a name is drawn from. Each function weights the roles; each culture multiplies them.

### 7.1 Role weights by function (ships)

| Role | war | merchant | passenger | explore | working | yacht | raider | sacred |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| virtue | 30 | 5 | 5 | 10 | 5 | 2 | 5 | 5 |
| royal | 15 | 5 | 15 | 5 | 0 | 2 | 2 | 15 |
| holy | 5 | 10 | 5 | 5 | 10 | 0 | 0 | 35 |
| beast | 15 | 5 | 5 | 5 | 5 | 5 | 15 | 5 |
| sky | 5 | 10 | 10 | 15 | 10 | 10 | 10 | 10 |
| place | 15 | 15 | 25 | 5 | 15 | 2 | 2 | 5 |
| person | 5 | 10 | 10 | 10 | 20 | 10 | 5 | 10 |
| poetic | 5 | 5 | 5 | 10 | 5 | 10 | 5 | 15 |
| commerce | 0 | 35 | 15 | 5 | 5 | 5 | 5 | 0 |
| menace | 5 | 0 | 0 | 0 | 0 | 0 | 40 | 0 |
| discovery | 0 | 5 | 5 | 30 | 0 | 5 | 0 | 0 |
| affection | 0 | 0 | 0 | 0 | 25 | 20 | 0 | 0 |
| leisure | 0 | 0 | 0 | 0 | 0 | 30 | 0 | 0 |
| designation | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 |

- **Designation** in war: weight 5 at T6–T7 only (*Patrol Boat 27*).
- Function Any: draw the function first (§6.1 weights), then the role.

### 7.2 Role weights by function (spacecraft)

| Role | war | merchant | passenger | explore | working | yacht | raider | sacred | colony | station |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| virtue | 30 | 5 | 5 | 10 | 5 | 2 | 5 | 10 | 10 | 5 |
| royal | 10 | 0 | 10 | 0 | 0 | 2 | 0 | 20 | 0 | 5 |
| holy | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 5 | 0 |
| beast | 15 | 5 | 0 | 5 | 5 | 5 | 15 | 5 | 0 | 0 |
| sky | 10 | 10 | 15 | 20 | 5 | 10 | 10 | 15 | 15 | 20 |
| place | 10 | 15 | 20 | 5 | 10 | 2 | 0 | 10 | 20 | 30 |
| person | 15 | 5 | 10 | 20 | 10 | 10 | 5 | 15 | 10 | 15 |
| poetic | 5 | 0 | 5 | 10 | 0 | 10 | 5 | 15 | 30 | 10 |
| commerce | 0 | 40 | 25 | 0 | 15 | 5 | 0 | 0 | 0 | 5 |
| menace | 5 | 0 | 0 | 0 | 0 | 0 | 45 | 0 | 0 | 0 |
| discovery | 0 | 5 | 5 | 30 | 0 | 5 | 0 | 0 | 10 | 5 |
| affection | 0 | 0 | 0 | 0 | 15 | 15 | 5 | 0 | 0 | 0 |
| leisure | 0 | 0 | 0 | 0 | 0 | 30 | 0 | 0 | 0 | 0 |
| designation | 0 | 20 | 0 | 0 | 40 | 0 | 10 | 0 | 0 | 5 |

### 7.3 Culture role multipliers

Cultures not listed use ×1 throughout. `techRoles` apply at the customs level.

| Culture | `roles` | `techRoles` |
|---|---|---|
| general | – | – |
| anglo-saxon | beast ×2, holy ×1.5, royal ×1.5, commerce ×0.5, poetic ×2 | – |
| norse | beast ×3, menace ×1.5, poetic ×2, holy ×0.5, commerce ×0.5 | – |
| celtic | beast ×2, holy ×2, sky ×1.5 | – |
| norman-british | – | T2–T3: holy ×3, royal ×1.5; T4: virtue ×3, royal ×2, beast ×1.5; T5: virtue ×2, place ×2; T6: virtue ×2, place ×2; T7: place ×2, person ×1.5 |
| french | virtue ×2, royal ×1.5 | T6–T7: person ×2, place ×1.5 |
| dutch | place ×2, commerce ×2, person ×1.5, holy ×0.3 | – |
| iberian | holy ×3, royal ×2 | – |
| roman | virtue ×2 | T2: holy ×2; T6–T7: person ×2, place ×2 |
| greek-byzantine | holy ×2, virtue ×1.5 | – |
| slavic | beast ×1.5 | T5–T7: person ×2, virtue ×1.5 |
| steppe | beast ×3, sky ×2, commerce ×0.5 | – |
| arabic-persian | sky ×2, virtue ×2, commerce ×1.5, holy ×0 | – |
| ottoman | virtue ×2, royal ×1.5, holy ×0 | – |
| swahili-omani | commerce ×2, sky ×1.5, holy ×0 | – |
| egyptian | holy ×2, royal ×2 | – |
| ethiopian | holy ×1.5, royal ×1.5 | – |
| bantu | beast ×3, place ×1.5 | – |
| west-african | beast ×2, commerce ×2 | – |
| indian | sky ×1.5, virtue ×1.5, royal ×1.5, holy ×0 | T7: place ×2 |
| malay | sky ×1.5, beast ×1.5, poetic ×1.5, holy ×0 | – |
| chinese | sky ×1.5, beast ×2, virtue ×1.5, holy ×0 | T7: place ×2 |
| japanese | sky ×2, place ×2 | – |
| korean | beast ×1.5 | T6–T7: person ×2, place ×1.5 |
| hawaiian, maori, w-polynesian | poetic ×3, sky ×3, menace ×0, leisure ×0, commerce ×0.3 | – |
| nw-coast, arctic, na-woodlands, andean | poetic ×3, beast ×2, menace ×0, leisure ×0, commerce ×0.3 | – |
| aztec, maya | beast ×2, poetic ×2, holy ×1.5 | – |
| american | virtue ×2, place ×2 | T7: person ×2 |

---

## 8. Role lists and shapes

### 8.1 Shared lists

These are the defaults. A culture's own list for a role replaces the shared one (§8.3). Tone tags in brackets apply as TS §2.3.

| List | Words |
|---|---|
| `virtue` (single-word names) | Resolute ×2, Valiant ×2, Defiance, Courage, Endurance, Constant, Faithful, Steadfast, Victory ×2, Triumph, Glory (grand), Hope, Fortitude, Liberty, Dauntless, Intrepid, Vigilant, Indomitable (grand), Swift, Bold |
| `virtueAdj` | Faithful, Brave, Swift, Bold, Constant, Noble (grand), Golden (grand), True, Steadfast, Gallant (grand) |
| `royal` | Sovereign (grand), Crown, Monarch, Regent, Prince, Princess, Empress (grand), Majesty (grand), Sceptre |
| `ruler` | King, Queen, Prince, Duke, Emperor, Lord |
| `seaLand` | North, South, East, West, Isles, Indies, Ocean, Deep; tradition land words ×2 |
| `sky` | Star ×2, Dawn, Morning Star, Evening Star, North Star, Comet, Moon, Sun, Wind, Tempest, Rising Sun, Aurora, Meteor |
| `skyAdj` | Morning, Evening, Northern, Southern, Rising, Silver, Bright, Falling (strange), Western, Wandering (strange) |
| `seaAdj` | Sea, Ocean, Wave, Tide, Salt, Storm |
| `commerceAdj` | Good, Prosperous, Fair, Golden, Honest (light), Rich, Lucky (light), Steady (plain) |
| `commerceNoun` | Fortune ×2, Venture ×2, Enterprise, Trader ×2, Merchant, Adventurer, Return, Exchange, Bounty, Harvest, Prosperity, Increase, Success; `k: T7`: Carrier, Spirit, Pioneer |
| `menaceAdj` | Black ×2, Red, Bloody, Grim, Cruel, Dread, Wicked, Broken, Hungry — all (grim) |
| `menaceNoun` | Fortune, Reckoning, Revenge, Vengeance, Wrath, Shadow, Terror, Warning, Mercy (light: ironic), Grin, Crown |
| `figure` | Widow, Tyrant, Devil, Hangman, Sinner, Beggar, Queen, Dead Man, King, Gallows |
| `consequence` | Revenge, Reckoning, Ransom, Curse, Debt, Lament, Delight (light), Folly (light), Bargain (light), Prize |
| `discovery` | Discovery, Endeavour, Resolution, Adventure, Explorer, Pathfinder, Venture, Horizon, Wayfarer, Seeker, Surveyor, Investigator, Pioneer |
| `affectionAdj` | Little ×2, Good, Our ×2, Bonny, Lucky, Faithful — (light) |
| `affectionNoun` | Lass, Lad, Girl, Pride ×2, Joy, Darling, Star |
| `leisureName` (whole names) | Second Wind, No Hurry, Blue Escape, One More Day, Knot Working, Reel Time, Sea Esta, Shore Thing, Seas the Day, Liquid Assets, Afternoon Off, Well Earned, Why Not, Plan B, Pension Pot, Nauti Buoy, Fair Weather, Gone Fishing — (light) |
| `leisureAdj` / `leisureNoun` | Summer, Lazy, Golden, Easy, Blue, Sunny, Gentle / Dream, Escape, Days, Breeze, Hours, Afternoon, Drift |
| `womanName` (invented; general, norman-british, american, celtic only) | Mary ×2, Anne, Elsie, Emily, Grace, Margaret, Kate, Ellen, Rose, Ivy, Lily, Jane, Beth, Molly, Agnes, Edith, Dora, Nellie, Florence, Ada |
| `designationWord` (ships) | Patrol Boat, Launch, Lighter, Tender, Barge, Motor Gunboat `k: T6`, Landing Craft `k: T6-T7`, Pilot Boat |
| `designationWord` (spacecraft) | Tender, Lighter, Drone, Ore Hauler, Tug, Shuttle, Cutter, Lander |
| `marian` (Our Lady of …) | Victory, Good Hope, the Rosary, Mercy, the Snows, the Sea, Remedies, Sorrows, Solitude, Light, Peace, Help, Good Voyage |
| `holyNoun` (blessing words, any culture) | Grace, Providence, Blessing, Mercy, Hope, Good Fortune, Deliverance, Thanksgiving |
| `holyAdj` | Holy, Blessed, Good, Sacred |

Lists named in this brief but not defined (`colour`, `number`, `numberWord` = GN `number`, `ordinalWord`, `greek`, `land`, `spaceLand`, `compass`, `star`, `brandRoot`, `surname`) come from `group-names.json` with their tags.

### 8.2 Shared shapes by role

Columns: weight within the role; `k` range; settings; tone tag. Function tags are given where a shape is limited to some functions.

| Role | Shape | Weight | k | Settings | Tone | Example |
|---|---|--:|---|---|---|---|
| virtue | `{virtue}` | 60 | – | all | – | Resolute |
| virtue | `{virtueAdj} {beast}` | 20 | – | all | – | Faithful Lion |
| virtue | `The {virtueAdj}` | 5 | – | all | – | The Faithful |
| virtue | `{virtue} of {town}` | 15 | – | all | grand | Triumph of Saltgate |
| royal | `{royal}` | 25 | – | all | grand | Sovereign |
| royal | `Royal {beast}` | 20 | – | all | grand | Royal Lion |
| royal | `{ruler:poss} {virtue}` | 20 | – | all | – | Queen's Hope |
| royal | `{royal} of the {seaLand}` | 20 | – | all | grand | Crown of the South |
| royal | `{royal} of the Seas` | 5 | T3–T4 | all | grand | Sovereign of the Seas |
| royal | `Empress of the {seaLand}` | 10 | T5–T7 | all | grand | Empress of the Atlantic |
| holy | `{holy}` | 35 | – | all | – | Saint Aldric / [holy person] |
| holy | `{holyAdj} {holyNoun}` | 30 | – | all | grand | Holy Grace |
| holy | `Our Lady of {marian}` | 15 | – | all; christian cultures only (§8.4) | grand | Our Lady of Good Voyage |
| holy | `{holyNoun}` | 20 | – | all | – | Providence |
| beast | `{beast}` | 30 | – | all | – | Dolphin |
| beast | `{colour} {beast}` | 30 | – | all | – | Red Serpent |
| beast | `{seaAdj} {beast}` | 15 | – | all | – | Sea Wolf |
| beast | `{beast} of {town}` | 15 | – | all | grand | Lion of Bristol |
| beast | `{beast:poss} {weapon}` | 10 | – | all | grim | Raven's Spear |
| sky | `{sky}` | 20 | – | all | – | Morning Star |
| sky | `{skyAdj} {sky}` | 40 | – | all | – | Northern Star |
| sky | `{sky} of the {compass}` | 20 | – | all | strange | Star of the West |
| sky | `{sky} over {town}` | 20 | – | all | strange | Dawn over Fenwick |
| place | `{town}` | 40 | – | all | plain | Delaware |
| place | `City of {town}` | 20 | T5–T7 | all; passenger, merchant | plain | City of Edinburgh |
| place | `Pride of {town}` | 20 | – | all | plain | Pride of Fenwick |
| place | `{town} {commerceNoun}` | 20 | – | all; merchant | plain | Saltgate Trader |
| person | `{womanName}` | 25 | – | all | – | Ellen |
| person | `{womanName} {surname}` | 15 | – | all | plain | Ellen Pell |
| person | `Admiral {surname}` | 15 | T5–T7 | all; war | – | Admiral Vance |
| person | `{surname}` | 20 | T6–T7 | all; war, explore | plain | Holloway |
| person | `{person}` | 25 | – | all | – | [admiral] |
| poetic | the culture's `poetic` list (whole names) | 100 | – | all | – | Path of the Ancestors |
| commerce | `{commerceAdj} {commerceNoun}` | 40 | – | all | – | Good Fortune |
| commerce | `Merchant's {commerceNoun}` | 15 | – | all | – | Merchant's Hope |
| commerce | `{seaLand} {commerceNoun}` | 25 | – | all | – | Eastern Enterprise |
| commerce | `{brandRoot} {town}` | 20 | T7 | MR MF SF | plain | Meridian Antwerp |
| menace | `{menaceAdj} {menaceNoun}` | 40 | – | all | grim | Black Fortune |
| menace | `{figure:poss} {consequence}` | 40 | – | all | – | Widow's Revenge |
| menace | `{menaceNoun}` | 20 | – | all | grim | Reckoning |
| discovery | `{discovery}` | 50 | – | all | – | Endeavour |
| discovery | `Far {discovery}` | 15 | – | all | – | Far Venture |
| discovery | `{compass} {discovery}` | 20 | – | all | – | Western Discovery |
| discovery | `New {discovery}` | 15 | – | all | – | New Horizon |
| affection | `{affectionAdj} {womanName}` | 35 | – | all | light | Little Elsie |
| affection | `{town} {affectionNoun}` | 35 | – | all | light | Felixstowe Pride |
| affection | `{affectionAdj} {affectionNoun}` | 30 | – | all | light | Bonny Lass |
| leisure | `{leisureName}` | 60 | – | all | light | Second Wind |
| leisure | `{leisureAdj} {leisureNoun}` | 40 | – | all | light | Summer Dream |
| designation | `{designationWord} {n}` (`n` 1–99) | 100 | – | all | plain | Patrol Boat 27 |

- Shapes with `{womanName}` or `{surname}` follow GN §8.3: in invented mode they get weight 0 for cultures whose `womanName` or surname source is a placeholder.
- `{person}` uses GN §8 with the label `[admiral]` (war), `[founder]` (merchant, passenger), `[explorer]` (explore), `[owner]` (others).
- `{weapon}` is GN `emblem` sub-list `weapon`.

### 8.3 Culture lists

A culture's lists below replace the shared list for that role. Words with `k` follow the technology rule. Tone tags in brackets.

**general:** shared lists only.

**anglo-saxon**
- `virtue`: Brave, Bold, Steadfast, Victory, Courage, Glory (grand), Faithful, Wolf-Hearted
- `poetic`: Wave-Steed, Sea-Stallion, Foam-Necked, Ring-Prowed (grand), Swan of the Waves, Sea-Wood, Whale-Road Rider, Curved-Prow
- `holy`: christian

**norse**
- `virtue`: Bold, Fearless, Victory, Gold-Breasted (grand), Battle-Glad (grim)
- `beast` (extra names, ×2): Serpent, Dragon, Raven, Wolf, Bison, Crane, Bull, Snake
- `poetic`: Wave-Steed, Sea-Stallion, Sail-Horse, Surf-Raven, Long Snake, Gold-Mane, Storm-Rider, Fjord-Wolf
- `holy`: gods (world `god` list) — shape `{god:poss} {beast}` replaces `{holy}` (*Thor's Raven*)

**celtic**
- `virtue`: Bold, Swift, Faithful, Bright, Glory
- `poetic`: Wave of the West, Hound of the Sea, Salmon of the Strand, Curragh of the Saint, Star of the Sound, Grey Seal, Bright Wave
- `holy`: christian

**norman-british**
- `virtue` by level: `k: T2-T3`: Good Anne, Saint Mary, Christopher, Gabriel, Peter, Trinity Royal ×0.3 · `k: T4`: Thunderer, Indefatigable, Bellerophon, Ajax, Orion, Minotaur, Agamemnon, Defiance, Invincible, Indomitable, Majestic, Revenge ×0.3 · `k: T5-T6`: Dauntless, Vanguard, Formidable, Warrior, Dreadnought ×0.3, Courageous, Glorious, Renown · `k: T7`: Defender, Protector, Daring, Diamond, Duncan
- `royal`: Sovereign, Royal Oak, Royal George ×0.3, Prince Regent, Queen, Monarch, Royal Sovereign
- `holy`: christian

**french**
- `virtue`: Glorious, Majestic, Formidable, Redoubtable, Brilliant, Intrepid, Triumphant, Fearless, Thundering, Invincible, Superb, Magnanimous, Audacious, Terrible (grim) ×0.3
- `royal`: Royal Sun, Crown, Dauphin, Royal Louis ×0.3, Queen, Majesty
- `holy`: christian; `Our Lady of {marian}` ×0.3

**dutch**
- `virtue`: Concord, Unity, Prosperity, Good Hope, Peace, Freedom, Hope, Faith, Diligence
- extra place shapes (role place): `Golden {town}` 20, `Arms of {town}` 25, `Lion of {town}` 15 (grand)
- `holy`: christian ×0.3

**iberian**
- `virtue`: Victory, Triumph, Conception, Hope, Glory, Fortune
- extra holy shapes: `Most Holy {holyNoun}` 15 (grand), `Holy Trinity` 5 (fixed), `Holy Cross` 5 (fixed), `{holy} and {holy}` 5 (*Saint Peter and Saint Paul* style), and `Our Lady of {marian}` ×3
- `royal`: Royal Prince, Crown, Royal Philip ×0.3, Prince of the Sea
- `holy`: christian

**roman**
- `virtue`: Victory, Concord, Fortune, Faith, Piety, Valour, Peace, Triumph, Unconquered
- `gods` (own list, `k: T2`): Jupiter, Mars, Neptune, Minerva, Mercury, Venus, Apollo, Diana, the Twins
- `holy`: gods at T2 (`{god:poss} {beast}`, `Fortune of {god}`); christian from T3
- extra place shape: `Lion of {town}` 15 (Venetian style, `k: T3-T5`)

**greek-byzantine**
- `virtue`: Victory, Glory, Swift, Faithful
- `gods` (`k: T2`): Athena, Poseidon, Apollo, Artemis, Hermes, Nike
- `poetic`: Sea-Born Victory, Daughter of Dawn, Dolphin, Swift, Imperial Light, Guardian Angel, Sacred Victory
- `holy`: gods at T2; christian from T3

**slavic**
- `virtue`: Steadfast, Resolute, Thundering, Swift, Fearless, Glorious, Courageous, Vigilant, Bold
- `k: T1-T3` `beast` extra: Falcon, Swan, Grey Duck, Pike
- `k: T6-T7` extra virtue shapes: `Red Banner` 5, `Red Star` 5, `Admiral {surname}` 15, `Marshal {surname}` 10, `Guardian of the People` 5
- `holy`: christian

**steppe**
- `virtue`: Swift, Bold, Fearless, Victory
- `sky`: Blue Sky, Morning Star, Great Bear, North Wind, Moon
- `poetic`: Wind across the Grass, Swift Rider, Horse of the Waves, Grey Wolf of the Lake, Falcon on the River, Rider of the Salt Lake
- `holy`: none

**arabic-persian**
- `virtue`: Victorious, Glory, Fortune, Light of Guidance, Star of Prosperity, Key to the East, Garden of the Sea, Gift of the Sea
- `poetic`: Pearl of {town}, Opening of Good, Lamp of the Gulf, Moon of the Two Seas, Falcon of the Gulf, Rose of {town}
- `holy`: none (§14.3)

**ottoman**
- `virtue`: Conquest, Great Conquest, Tower of Victory, Happiness, Help, Glory, Victory, Triumph
- `royal`: Crown of the Sea, Lion of the Sea, Sword of the Sultan ×0.3, Throne of the Sea
- `menace` extra (raider): Corsair, Sea-Lion, Red Galley, Scourge of {town} ×0.3
- `holy`: none

**swahili-omani**
- `sky`: Monsoon Wind, North-East Wind, Moon of the Coast, Morning Star, Coral Star
- `poetic`: Pearl of the Coast, Blessing of the Coast, Gift of the Sea, Lamp of {town}, Clove Wind, Star of the Coral Coast, Daughter of the Monsoon
- `holy`: none

**egyptian**
- `holy`: gods — shapes `{god:poss} Barque` 20, `Beloved of {god}` 20, `Star of {god}` 10
- `royal`: Glory of the Two Lands, Pharaoh's Favour, Star of the Two Lands, Wild Bull
- `poetic`: Appearing in {town}, Falcon of the River, Gift of the Nile ×0.3, Lotus on the Water

**ethiopian**
- `holy`: christian, but only `{holyAdj} {holyNoun}` and `{holyNoun}` (no saints)
- `royal`: Crown of {town}, Lion of the Highlands, Glory of the King
- `poetic`: Star of the Red Sea, Papyrus of the Lake, Morning on the Lake

**bantu**
- `poetic`: Elephant of the Lake, Lion of the River, She Who Crosses the Waters, Crocodile's Brother, Fish-Eagle's Cry, Child of the Great Lake, Rain over the River
- `holy`: none

**west-african**
- `poetic`: Child of the River, Python of the River, Market Canoe, Kola Bearer, Hornbill over the Water, Leopard of the Bend, Gift of the Floods
- `holy`: none

**indian**
- `virtue`: Courageous, Mighty, Sword, Victory, Glorious, Fearless, Lion-Hearted
- `poetic`: Lotus of the Sea, Monsoon Star, Pearl of the Coast, Elephant of the Waves, Peacock of the Sea, Tiger of the Bay, Star of the Western Coast
- `holy`: none (§14.3)

**malay**
- `poetic`: Sea Hornbill, Dragon of the Strait, Wind of the Straits, Monsoon Pearl, Swift Prau, Pride of {town}, Moon over the Mangroves, Crocodile of the River
- `holy`: none

**chinese**
- `virtue`: Ten Thousand Blessings, Peaceful Sea, Guarding the Sea, Harmony, Prosperity, Eternal Peace, Lasting Peace, Calm Waves, Settled Waters
- `poetic`: Moonlit Voyage, Golden Crane, Peaceful River, Eastern Dragon, Jade Phoenix, Pearl of the South Sea
- `holy`: none

**japanese**
- `sky`: Morning Mist, Autumn Moon, Heavenly Wind, Swift Current, Spring Rain, Evening Snow, Morning Sun, Summer Cloud
- `place` extra (role place): `Red Mountain` 5, `{colour} Mountain` 15, `{town} River` 10, `Cherry Blossom` 5
- `holy`: none

**korean**
- `beast` extra ×2: Turtle, Tiger, Crane, Dragon
- `virtue`: Loyalty, Righteous, Morning Calm, Eastern Sea
- `holy`: none

**hawaiian**
- `poetic`: Guiding Star, Path of the Ancestors, Child of the Ocean, Wind from the High Mountain, We Return Together, Dawn beyond the Island, Ocean of Gladness, The Sea Remembers, Star Path, Swell from the South
- `sky`: Guiding Star, Rising Swell, Morning Star, Trade Wind, Rain from the Mountain
- `holy`: none

**maori**
- `poetic`: Great Canoe of the Dawn, Path from the Ancient Homeland, Guardian of the Southern Cape, Descendants of the Mountain, Spear of the Red Chief, The Long Arrival, Ancestor beneath the Stars, Voice of the Headland
- `holy`: none

**w-polynesian**
- `poetic`: Strength of the Islands, House upon the Sea, Chief's Passage, Strong Hands Together, Friend of the Western Wind, The Returning Family, Shield of the Lagoon, Voyage of Many Islands
- `holy`: none

**nw-coast**
- `poetic`: Raven over the Water, Great Cedar, House of the Killer Whale, Salmon Returning, Chief of the Western Sea, Eagle's Passage, Voice of the Deep, Canoe of the High-Prowed House
- `holy`: none

**arctic**
- `poetic`: Quiet Harpoon, Seal beneath the Ice, Safe Passage Home, Breath over Dark Water, Patient Hunter, Opening in the Ice, Swift beneath the Snow, Provider's Return
- `holy`: none

**na-woodlands**
- `poetic`: White Birch, Loon across the Lake, Bear's River, Swift Portage, Morning on the Great Water, Northern Crossing, Crane among the Reeds, Path through Many Lakes, Great River, Turtle in the Current, Heron of the Floodplain, Downriver Trader, Meeting of the Waters
- `holy`: none

**aztec**
- `poetic`: Jade Water, Flower of the Lake, Reed of the Lake, Precious Feather, Eagle on the Water, Hummingbird Canoe
- `holy`: gods — `{god:poss} Canoe` 20

**maya**
- `poetic`: Road across the Water, Sea Turtle, Merchant of the Coast, Bearer of Cacao, Sun between the Islands, Jaguar's Passage, Morning Star Canoe
- `holy`: gods — `{god:poss} Canoe` 20

**andean**
- `poetic`: Reed of the Lake, Condor over the Water, Sun on the Lake, Daughter of the Lake, Raft of the South Wind, Balsa of the Cold Current
- `holy`: none

**american**
- `virtue`: Liberty ×2, Independence, Union, Resolute, Intrepid, Freedom, Enterprise ×0.3, Constellation ×0.3, Patriot
- `k: T7` person shape: `{person}` ×2 with label `[president]`
- `holy`: christian ×0.3

### 8.4 Holy types

| `holy` | Meaning |
|---|---|
| christian | `{holy}` (GN §8.2 saints), the holy shapes in §8.2, `Our Lady of {marian}` only where a culture says so |
| gods | the culture's god shapes in §8.3 in place of `{holy}`; `{holyAdj} {holyNoun}` kept |
| blessing | only `{holyAdj} {holyNoun}` and `{holyNoun}` |
| none | holy role weight 0 |

Cultures not given a holy type in §8.3 use `blessing`.

---

## 9. Hybrids: technology words

### 9.1 Share

- Inside the culture's span: 20% of names (role route not taken) are hybrids.
- Outside the span: 35%.
- `designation` and `leisure` functions never take a hybrid.

### 9.2 Technology words

| Level | `techAdj` | `techNoun` |
|---|---|---|
| T1 | Swift, Light, Little, Quick | Paddle, Reed, Bark, Current |
| T2 | Many-Oared, Swift-Oared, Bronze-Beaked | Oar, Ram, Beak, Rower |
| T3 | Fair-Winded, White-Winged | Sail, Wind, Mast, Pennant |
| T4 | Tall, White-Sailed | Canvas, Gale, Topsail, Broadside |
| T5 | Iron ×2, Steam, Brass, Coal-Black | Engine, Funnel, Boiler, Steamer, Collier, Smoke |
| T6 | Steel ×2, Turbine, Express, Diesel | Turbine, Express, Engine, Dynamo, Piston |
| T7 | Global, Swift, Blue | Carrier, Express, Navigator, Spirit, Runner |
| S1 | Rocket, Orbital, Lunar, Rising | Rocket, Orbit, Booster, Capsule |
| S2 | Solar, Ion, Planetary, Belt | Drive, Sail, Lander, Shuttle |
| S3 | Deep, Interstellar, Long, Far | Light, Lightyear, Wake, Leap |

### 9.3 Hybrid shapes

`{cultureNoun}` = a word from the culture's `beast`, `sky` or `virtue` list (own or shared), or a whole `poetic` name.

| Shape | Weight | Example |
|---|--:|---|
| `{techAdj} {cultureNoun}` | 50 | Iron Star |
| `{techAdj} {poetic}` | 20 | Iron Path of the Ancestors |
| `{cultureNoun} of {techNoun}` | 10 | Star of Steam |
| `{techNoun} {cultureNoun}` | 20 | Engine Wolf |

- `{techAdj} {poetic}` only when the poetic name has 5 words or fewer, and never before a name starting "The", "We" or "Where".
- No hybrid may repeat a word (GN §11.5).

---

## 10. Styles

### 10.1 Line-up

| Key | Label | Settings | Modules | Description |
|---|---|---|---|---|
| `heroic` | heroic | FH | ships | Heroes, virtues, legendary weapons |
| `dark` | dark | FH MF | both | Curses, death, ominous holy imagery |
| `elven` | elven | FH | ships | Moonlight, memory, song, silver |
| `dwarven` | dwarven | FH | ships | Metal, craft, clan, engines |
| `oceanic` | Oceanic voyaging (fantasy) | FH | ships | The ocean as a living presence; chosen navigators. Fantasy, not a real culture. |
| `fpirate` | fantasy pirate | FH | ships | Monsters, curses, treasure |
| `steampunk` | steampunk | MF FH | both | Brass, aether, imperial invention |
| `dieselpunk` | dieselpunk | MF | both | Industry, propaganda, heroic machinery |
| `postapoc` | post-apocalyptic | MF SF | both | Salvage, scarcity, dark jokes |
| `wasteland` | wasteland raider | MF SF | both | Rust, bone, crude boasting |
| `sfmilitary` | military | SF | both | Battles, predators, commanders |
| `sfexplore` | exploration | SF | both | Scientists, horizons, patient discovery |
| `corporate` | corporate | SF MR MF | both | Company stems, asset codes |
| `colony` | colony | SF | both | New homes, memory, survival |
| `ai` | AI culture | SF | both | Philosophical statements and paradoxes |
| `alien` | alien in translation | SF | both | Translated ritual phrases |
| `outlaw` | frontier outlaw | SF | both | Stolen wealth, defiance, dark humour |

### 10.2 How a style works

- **Share:** 60% of names use the style route; 40% use the culture routes (hybrid and role) with the style's pools added ×3 to the matching shared lists (`*Adj` → `virtueAdj` and `skyAdj`; `*Noun` → `virtue` and `sky`).
- With culture General, the share is 85%.
- The style route draws from the style's shapes below (equal weights unless given).

### 10.3 Style data

| Style | Whole names (`name`) | Pools | Shapes |
|---|---|---|---|
| heroic | Silver Champion, Dawn Sword, Star of Courage | `hAdj`: Silver, Golden, Dawn, Bright, Valiant, Shining · `hNoun`: Champion, Sword, Banner, Oath, Crown, Lance, Shield | `{name}`, `{hAdj} {hNoun}`, `{hNoun} of {town}`, `{beast:poss} Honour` |
| dark | Hollow Saint, Black Testament, Grave Tide, Mourning Crown, The Last Sin | `dAdj`: Hollow, Black, Grave, Mourning, Ashen, Drowned, Silent · `dNoun`: Saint, Testament, Tide, Crown, Sin, Psalm, Shroud, Vigil, Bell | `{name}`, `{dAdj} {dNoun}`, `The {ordinalWord} {dNoun}` |
| elven | Moonlit Bough, Song before Sunrise, Silver Leaf, Memory of Spring, Starlight upon Water | `eAdj`: Moonlit, Silver, Starlit, Evening, Gentle, Dreaming · `eNoun`: Bough, Leaf, Song, Memory, Willow, Dew, Lantern | `{name}`, `{eAdj} {eNoun}`, `{eNoun} before {sky}`, `{eNoun} of {season}` (`season`: Spring, Summer, Autumn, Winter) |
| dwarven | Iron Promise, Clan Anvil, Stonewake, Forge Runner, Brass Leviathan | `wAdj`: Iron, Brass, Stone, Deep, Coal, Hammered · `wNoun`: Promise, Anvil, Oath, Forge, Hammer, Leviathan, Hearth, Bellows | `{name}`, `{wAdj} {wNoun}`, `Clan {wNoun}`, `{wAdj+wake}` (Stonewake) |
| oceanic | The Ocean's Chosen, Heart of the Endless Sea, Wayfinder's Promise, Island beyond the Sunset, Daughter of the Living Tide, Song of the Returning Stars, The Wind Knows Our Way, Where the Ocean Leads | `oNoun`: Tide, Star, Wave, Island, Wind, Reef · `oAdj`: Living, Endless, Returning, Singing, Chosen | `{name}`, `Heart of the {oAdj} {oNoun}`, `Child of the {oAdj} {oNoun}`, `The {oNoun} Remembers` |
| fpirate | Kraken's Debt, Crimson Gallows, Dead Man's Fortune, The Burning Mermaid, Devil's Compass | `monster`: Kraken, Leviathan, Siren, Mermaid, Sea-Serpent, Devil, Ghost | `{name}`, `{monster:poss} {consequence}`, `The {menaceAdj} {monster}`, `{colour} {monster}` |
| steampunk | Imperial Aether, Brass Majesty, Queen's Contrivance, Indefatigable Engine, Crown of Progress | `spAdj`: Brass, Aether, Clockwork, Copper, Imperial, Gilded · `spNoun`: Majesty, Contrivance, Engine, Progress, Marvel, Apparatus, Dynamo, Sovereign | `{name}`, `{spAdj} {spNoun}`, `{ruler:poss} {spNoun}`, `{spNoun} of {town}` |
| dieselpunk | Steel Horizon, People's Thunder, Victory Express, Modern Titan, National Dynamo | `dpAdj`: Steel, Modern, National, Chrome, Streamlined · `dpNoun`: Horizon, Thunder, Titan, Dynamo, Express, Century, Tomorrow | `{name}`, `{dpAdj} {dpNoun}`, `{town} {dpNoun}` |
| postapoc | Still Floating, Last Ferry, Canned Hope, Plenty Enough, Patched Again, Not Sinking Today | `paAdj`: Last, Patched, Canned, Spare, Second-Hand · `paNoun`: Ferry, Hope, Chance, Tin, Luck, Road | `{name}`, `{paAdj} {paNoun}`, `{town} Road`, `Old {town}` |
| wasteland | Rust Tyrant, Bone Wake, Fuel Thief, Scrap King, Red Engine | `wrAdj`: Rust, Bone, Scrap, Red, Chrome, Burnt · `wrNoun`: Tyrant, Wake, Thief, King, Engine, Jaw, Grin | `{name}`, `{wrAdj} {wrNoun}`, `{wrNoun} of {town}` |
| sfmilitary | Unyielding, Relentless, Implacable | `battle`: Thermopylae, Salamis, Trafalgar, Lepanto, Agincourt, Jutland, Marathon, Actium, Hastings · `predator`: Harrier, Raptor, Viper, Shrike, Mako, Kestrel | `{name}`, `{battle}`, `{predator}`, `Admiral {surname}`, `{virtue}` |
| sfexplore | Far Horizon, New Dawn, Patient Explorer | `exAdj`: Patient, Far, Quiet, Long, New · `exNoun`: Horizon, Dawn, Explorer, Surveyor, Question, Light | `{name}`, `{exAdj} {exNoun}`, `{star} {exNoun}`, `{person}` (label `[scientist]`) |
| corporate | Prosperity, Reliable Transit | `asset`: Asset, Venture, Holding, Unit, Logistics, Transit | `{name}`, `{brandRoot} {asset} {numberWord}`, `{brandRoot} {town}`, `{brandRoot} {asset}` |
| colony | Children of Earth, Lasting Hope, Second Garden, Ancestral Memory | `cAdj`: Lasting, Second, New, Long, Faithful · `cNoun`: Hope, Garden, Memory, Promise, Home, Harvest | `{name}`, `New {town}`, `{cAdj} {cNoun}`, `Children of {town}` |
| ai | Kindly Consider the Alternative, Necessary Silence, We Remember Differently, Patient Question, Consensus Nine | `aiAdv`: Kindly, Gently, Respectfully, Regretfully, Patiently · `aiVerb`: Consider, Reconsider, Forgive, Revisit, Weigh · `aiObj`: Alternative, Evidence, Question, Margin, Silence · `aiAdj`: Necessary, Patient, Reasonable, Polite, Surplus · `aiNoun`: Silence, Question, Doubt, Courtesy, Consensus · `aiVerbPl`: Remember, Disagree, Wonder, Insist | `{name}`, `{aiAdv} {aiVerb} the {aiObj}`, `We {aiVerbPl} Otherwise`, `{aiAdj} {aiNoun}`, `{aiNoun} {numberWord}` |
| alien | The Water That Remembers, Third Voice of Winter, We Cross Together, Warm Stone beneath Stars, Child of the Returning Sky | `alElem`: Water, Stone, Wind, Light, Salt · `alVerb`: Remembers, Listens, Waits, Returns, Sings · `alVoice`: Voice, Song, Breath, Hand · `alTemp`: Warm, Cold, Slow, Still | `{name}`, `The {alElem} That {alVerb}`, `{ordinalWord} {alVoice} of {season}`, `{alTemp} {alElem} beneath Stars` |
| outlaw | Stolen Sunrise, Tax Collector, Vacuum Jackal, Honest Salvage, Last Warning | `oAdj2`: Stolen, Honest, Lucky, Borrowed, Crooked · `oNoun2`: Sunrise, Salvage, Warning, Jackal, Promise, Payday | `{name}`, `{oAdj2} {oNoun2}`, `{tech} {beast}` (tech: GN `tech`), `{figure:poss} {consequence}` |

### 10.4 Tones for styles

dark, fpirate, wasteland: grim. elven, oceanic, alien, ai: strange. postapoc, outlaw: light. heroic, steampunk, sfmilitary: grand. corporate, dieselpunk: plain. Each style's shapes carry its tag.

---

## 11. Spacecraft additions

### 11.1 Station shapes (function `station`)

| Shape | Weight | Example |
|---|--:|---|
| `{town} Station` | 25 | Saltgate Station |
| `{sky} Station` | 15 | Morning Star Station |
| `{greek} Station` | 10 | Tau Station |
| `Habitat {numberWord}` | 10 | Habitat Seven |
| `{discovery} Station` | 10 | Pathfinder Station |
| `New {town}` | 15 | New Fenwick |
| `{ordinal} Ring of {town}` | 5 | 3rd Ring of Ashby |
| `{star} Gate` | 10 | Vega Gate |

### 11.2 Colony shapes (function `colony`)

`{cAdj} {cNoun}` 30, `New {town}` 25, `Children of {town}` 15, culture `poetic` 20, `The {colony}`-style whole names from the colony style 10.

### 11.3 Space place words

In spacecraft, `seaLand` reads `spaceLand` (GN), `{seaAdj}` reads Star, Void, Deep, Solar, Night, and `City of {town}` becomes `Pride of {town}`.

---

## 12. People, places and prefixes

### 12.1 People

As GN §8: placeholders or invented. Placeholders as §8.2 plus `[woman's name]` for `{womanName}`.

### 12.2 Places (`{town}`)

| Culture | `townPool` source |
|---|---|
| general, anglo-saxon, celtic, norman-british, american | `britain` |
| world-place cultures (norse, roman, slavic, arabic-persian, indian, chinese, japanese, korean, egyptian, ethiopian, bantu, west-african, aztec, maya) | their world culture key |
| others (french, dutch, iberian, greek-byzantine, steppe, ottoman, swahili-omani, malay, the Pacific and Americas cultures) | a land compound (GN §8.4) |
| any culture, spacecraft in SF | the GN §8.4 SF row |

### 12.3 Prefixes

Prefixes are only ever added when the prefixes link is on, the setting is MR, MF or SF, and the name doesn't start with "The".

**Real-world (MR, MF)**

| Prefix | Cultures | Functions | Levels |
|---|---|---|---|
| HMS | general, norman-british | war | T4–T7 |
| HMY | general, norman-british | sacred, yacht | T4–T7 |
| USS | american | war | T4–T7 |
| RMS | general, norman-british | passenger | T5–T7 |
| SS | any | merchant, passenger | T5 (and T6 ×0.3) |
| MV | any | merchant, passenger, working | T6–T7 |
| SY | any | yacht | T5 |
| MY | any | yacht | T6–T7 |
| RV | any | explore | T6–T7 |
| FV | any | working | T6–T7 |

If no row applies, no prefix.

**Sci-fi (SF), both modules**

| Function | Prefixes (one drawn per batch, then used for the whole batch) |
|---|---|
| war | CNS, FNS, TNS, RNS, ANS |
| merchant | CMV, IFV, MV |
| passenger | SPL, IPL |
| explore | ISV, RSV, DSV |
| working | MT, UT |
| yacht | PY, SY |
| colony | CSV, LSV |
| sacred | ESV, FSV |
| raider, station | none |

Prefixes are written in capitals before the name with a space: *HMS Resolute*, *ISV Patient Explorer*.

---

## 13. Rendering

- **Capitals:** every word capitalised except `of`, `the`, `and`, `for`, `in`, `at`, `by`, `on`, `to`, `from`, `over`, `upon`, `beyond`, `beneath`, `among`, `across`, `through`, `between`, `above`, `into`, `with`, `before`, unless first. A leading "The" is capitalised (ship names stand alone): *The Sea Remembers*.
- **Possessives, plurals, repetition, dashes:** GN §11.3–§11.7.
- **Prefix and "The":** §12.3.
- Closed compounds written `{a+b}` as one word, second part lower case.

---

## 14. Safeguards

### 14.1 Block list

Whole-name matches (case-insensitive, prefix and leading "The" ignored) are redrawn.

- **Famous real ships:** Titanic, Lusitania, Britannic, Olympic, Bismarck, Tirpitz, Yamato, Musashi, Mayflower, Golden Hind, Mary Rose, Cutty Sark, Queen Anne's Revenge, Bounty, Essex, Mary Celeste, Marie Celeste, Edmund Fitzgerald, Andrea Doria, Exxon Valdez, Costa Concordia, Rainbow Warrior, General Belgrano, Belgrano, Kursk, Arizona, Graf Spee, Admiral Graf Spee, Scharnhorst, Potemkin, Aurora, Batavia, Vasa, Santa Maria, Pinta, Nina, Kon-Tiki, Long Serpent, Short Serpent, Divine Wind, Royal Charles, Black Prince, Grace of God, Holy Ghost, Mary Rose, Star of Gladness, Hokulea, Black Pearl.
- **Slave ships (never):** Amistad, Zong, Clotilda, Brookes, Henrietta Marie, Jesus of Lubeck, Wanderer, Wildfire, Hannibal.
- **Fiction:** Black Pearl, Flying Dutchman, Nautilus, Pequod, Hispaniola, Jolly Roger, Dawn Treader, Event Horizon, Millennium Falcon, Nostromo, Sulaco, Rocinante, Galactica, Discovery One, Heart of Gold, Red Dwarf, Bebop, Planet Express, Moya, Serenity, Normandy, Enterprise (as a space name; allowed for ships at ×0.3), Defiant (spacecraft only), Voyager (spacecraft only), Liberator (spacecraft only), Andromeda (spacecraft only), Red October, Interceptor, Queen Anne's Revenge, Going Merry, Thousand Sunny, Argo (allowed only with the greek-byzantine culture at T2).
- **Real spacecraft and stations:** Apollo, Gemini, Mercury, Vostok, Voskhod, Soyuz, Shenzhou, Tiangong, Mir, Skylab, Columbia, Challenger, Atlantis, Endeavour (spacecraft only), Discovery (spacecraft only), Buran, Dragon (spacecraft only), Starship, Orion (spacecraft only), Artemis (spacecraft only), Pioneer (spacecraft only), Voyager, Viking (spacecraft only), Hubble, ISS, International Space Station.
- **Banks's Culture ships** (AI style): So Much For Subtlety, Of Course I Still Love You, Just Read the Instructions, Sleeper Service, Grey Area, Attitude Adjuster, Limiting Factor, Killing Time, Experiencing a Significant Gravitas Shortfall, Mistake Not, Lasting Damage, Problem Child, Bora Horza Gobuchul, Size Isn't Everything, Very Little Gravitas Indeed.
- **Prefixed fiction:** USS Enterprise, USCSS, UNSC, SDF.

### 14.2 Flag list

Allowed by default (`flagListBlocks: false`): Victory, Enterprise, Resolute, Endeavour, Discovery, Endurance, Beagle, Defiance, Revenge, Dreadnought, Warspite, Ark Royal, Hood, Invincible, Royal Oak, Sovereign of the Seas, Serenity (ships), Liberty, Constitution, Independence, Golden Crane, Lion of Bristol.

### 14.3 Banned words and sacred specifics

- GN §12.3 banned list, plus: Slave, Slaver, Blackbirder, Coolie, Infidel, Heathen, Savage.
- No divine names from living religions in any culture: God, Christ, Jesus, Allah, Muhammad, Yahweh, Jehovah, Brahma, Vishnu, Shiva, Krishna, Rama, Buddha, and no "of God", "of the Prophet", "of the Faith" phrases.
- Christian saints and Marian titles are allowed for the christian cultures, as in GN holy orders.
- Hindu deities are never used (Indian `holy: none`), and neither are Islamic religious terms (Arabic & Persian, Ottoman, Swahili & Omani `holy: none`).

### 14.4 Sensitive cultures

For `hawaiian`, `maori`, `w-polynesian`, `nw-coast`, `arctic`, `na-woodlands` and `andean`:

- menace and leisure roles are 0 (§7.3); yacht is never offered (§6.2).
- The light and grim tones still weight words and shapes, but light and grim shapes from shared lists (`affection`, `menace`, `figure`) are never drawn.
- Their `poetic` names are never used by a style, a hybrid with a light or grim tone, or in a raider's prefix.
- The `oceanic` style is labelled "Oceanic voyaging (fantasy)" everywhere it appears and never draws from these cultures' lists.

### 14.5 Safeguard packs

`type: vessel-safeguards` packs, as group safeguard packs; command "Create vessel safeguard list" writing "Vessel safeguards.md" (never overwriting).

---

## 15. Presets

```yaml
---
type: module-preset
module: vessels
vesselModule: ships
packName: Polynesian steamers
culture: hawaiian
function: merchant
technology: T5
genre: fantasy
fantastic: false
style: none
tone: any
prefixes: false
people: placeholders
series: false
---

Hawaiian-themed merchant ships with steam and iron technology, for a fantasy world of historic or low fantasy, in no particular style, of any tone, without prefixes, with placeholders for people and places, each one separate.
```

| Key | Values | Default |
|---|---|---|
| `vesselModule` | `ships`, `spacecraft` | required |
| `culture` | a culture key | `general` |
| `function` | `any` or a function key | `any` |
| `technology` | `any` or a level code | `any` |
| `genre` / `fantastic` / `tone` / `people` / `series` | as TS §6.2 | as there |
| `style` | `none` or a style key | `none` |
| `prefixes` | `true`, `false` | `false` |

Unknown values: reported and defaulted, as GN §13. A style not available in the preset's setting runs as none and reports `Style “{x}” isn't available here.`

---

## 16. Tests (`tests/vessels.test.ts`)

### 16.1 Data

- 34 cultures in §3.1 order; every span inside T1–T7; every role and list named exists; all weights > 0 except the zero multipliers in §7.3.
- No word contains `(`, `)`, `§`, `×`, `?` or `→`.
- Ottoman flavour animals are exactly Lion, Falcon, Eagle, Horse; Swahili & Omani exactly Dolphin, Turtle, Falcon, Heron, Kingfisher.

### 16.2 Determinism and coverage

- Same options and seed give the same names.
- Every module × culture × technology × function available × setting × people mode: 20 unique names, within the cap.

### 16.3 Technology

- British at T4, 2,000 warships: at least one `k: T4` virtue word; none of the `k: T7` words.
- Hawaiian at T5 (out of span): at least 25% of 2,000 names contain a T5 `techAdj` or `techNoun`; every non-hybrid name comes from Hawaiian lists at customs level T3.
- Passenger never offered at T1–T3; yacht never for sensitive cultures.
- Spacecraft at S3 with arctic: hybrids use S3 words; non-hybrids use arctic lists.

### 16.4 Styles

- Styles appear only in their settings (§10.1). With a style, at least 50% of 2,000 names come from the style route.
- `oceanic` never uses a sensitive culture's list.

### 16.5 Prefixes

- HMS only on norman-british or general warships at T4–T7 in MR/MF with prefixes on.
- No prefix in FL or FH. No prefix before a name starting "The".
- An SF batch uses one prefix per function throughout.

### 16.6 Safeguards

- 5,000 names per culture per module: 0 block-list matches (with prefix stripped), 0 banned words, 0 living-religion divine names.
- Sensitive cultures: 0 names from `affection`, `menace`, `figure` or `leisure`.

### 16.7 Series

- A class with function war, British, T4, `{virtue}` shape: every name a single virtue word, all different.
- `{brandRoot} {town}` class: all names share the brand root.

### 16.8 Sentence and presets

- Default ships text: "General-themed ships and boats of any kind with any technology, for a fantasy world of historic or low fantasy, in no particular style, of any tone, with placeholders for people and places, each one separate." (Prefix link hidden in FL.)
- Series link hidden with function Any.
- Spacecraft with genre modern offers rocket age only.
- Preset round-trip; unknown style reported.

---

## 17. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Data and ship engine.** `vessels.json` (§3–§12, §14), roles, technology, hybrids | §16.1–§16.3 pass |
| M2 | **Styles, spacecraft and prefixes.** §10–§12 | §16.4–§16.7 pass |
| M3 | **Sentences, modules, presets.** §1, §2, §15, safeguard packs and command | §16.8 passes; both modules generate in the app |

---

## 18. Parked

- **Second release:** airships and aircraft (nose-art humour, squadron letters, airship grandeur); land vehicles (named locomotives, tanks and war machines, coaches and caravans, chariots).
- Class names shown above a series (*Valiant class*).
- Legacy names with numbers (*Enterprise II*).
- Japanese *Maru* merchant names (untranslatable; needs a kept-word rule).
- More Pacific and Americas subdivisions (Samoan and Tongan separately; Caribbean; Amazonian river cultures).
