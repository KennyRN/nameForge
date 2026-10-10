# Bynames and titles – brief (first release)

This brief adds a new module group, **bynames and titles**, with three modules:

- **epithets and bynames:** what a person is called beside their name (*Harald the Bold*, *Ironhand*, *of the Plains*)
- **titles and honorifics:** ranks, offices and full royal styles (*Warden of the Marches*, *King of Kings, Lord of the Two Lands*)
- **family names:** surnames, patronymics and bynames that stand in for them (*MacGregor*, *Ivanovich*, *Fletcher*, *Ashford*)

Each is set up with a clickable sentence like the group modules. Titles and family names can come out **in English**, **in native forms**, or **mixed** (*King of Kings* or *Shahanshah*; *son of Gregor* or *MacGregor*).

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow `docs/group-names-brief.md` (cited as GN §x) and `docs/group-tone-and-series-brief.md` (cited as TS §x). Reuse the group engine's helpers (weighted draws, setting gating, tone factor, plurals, possessives, safeguard checks) rather than copying them.

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Group | New section group `bynames`, label "bynames and titles", after group names in the switcher |
| Modules | epithets and bynames · titles and honorifics · family names |
| Cultures | General + the 16 world place-name cultures + Greek & Byzantine, Turkic & Mongol steppe, Norman & British (20 in all) |
| Settings | The group five: FL, FH, MR, MF, SF (GN §3), with the same genre link and fantastic switch |
| Tone | The five tones and weighting of TS §2 |
| Body-and-mind epithets | Kept, but drawn **only** when the tone is light or grim |
| Language | English · native forms · mixed, for titles and family names. Native forms come only from attested lists in this brief. No invented foreign syllables. |
| Gender | men · women · anyone. Decides title forms (King/Queen, Khan/Khatun) and affixes (-son/-dóttir, Mac/Nic). |
| Whose name | a placeholder · names from a pack (with its `##` sections) · on their own |
| Results | The finished string only, as group names. No details line. |

---

## 1. Module line-up

### 1.1 Section group and sections

- Add `bynames` to `SectionGroup`, label `"bynames and titles"`, and to `SWITCHER_ORDER` after `groupNames`.
- Add three `NameForgeSection` values, in this order:

| Section key | Label | Icon (Lucide) |
|---|---|---|
| `epithets` | epithets and bynames | `quote` |
| `titles` | titles and honorifics | `crown` |
| `familyNames` | family names | `users` |

The group remembers its last-used module (`groupModule.bynames`), as groups do.

### 1.2 History

Label: `{module label} · {setting phrase} · {culture label}`, then ` · {tone}` when not Any, then ` · native` or ` · mixed` when the language isn't English. `historySection()` maps a label starting with each module label to its section.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/bynames.json` | All data in §4–§9 and §11 |
| `src/bynames/engine.ts` | Generation (§3), joining (§10), safeguards (§11). No Obsidian imports. |
| `src/bynames/sentence.ts` | The three sentences (§2) |
| `tests/bynames.test.ts` | §14 |

Add this brief to `docs/` as `bynames-and-titles-brief.md`.

---

## 2. The sentences

### 2.1 Shapes

**Epithets and bynames**

> ‹General›-themed ‹epithets of any kind› for a ‹fantasy› world ‹of historic or low fantasy›, ‹of any tone›, for ‹anyone›, ‹after a placeholder name›.

**Titles and honorifics**

> ‹General›-themed ‹titles of any kind› for a ‹fantasy› world ‹of historic or low fantasy›, ‹of any tone›, ‹in English›, for ‹anyone›, ‹as single titles›, ‹after a placeholder name›.

**Family names**

> ‹General›-themed ‹family names of any kind› for a ‹fantasy› world ‹of historic or low fantasy›, ‹of any tone›, ‹in English›, for ‹anyone›, ‹with a placeholder name›.

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | the culture label, then "-themed" | General, then the 19 cultures (§4) | `general` |
| `kind` | the module's "any" phrase or a kind's plural | Any, then the module's kinds available for this culture and setting (§5–§7) | any |
| `genre`, `fantastic` | as GN §2.2 | as GN | fantasy, off |
| `tone` | as TS §5.2 | the six | `any` |
| `language` | "in English" · "in native forms" · "in English or native forms" | the three | `english` |
| `gender` | "men" · "women" · "anyone" | the three | `anyone` |
| `length` (titles only) | "as single titles" · "as full styles" | the two | `single` |
| `source` | epithets and titles: "after a placeholder name" · "after names from ‹pack›" · "on their own"; family names: "with a placeholder name" · "with names from ‹pack›" · "on their own" | the three | placeholder |
| `pack` | the pack's name | the vault's name packs (people packs; not place packs, word lists or recipes) | the first pack |
| `section` | "‹its Male section›" | the pack's `##` headings, then "the whole pack" | §2.4 |

- **Language link:** hidden for epithets, and for General (it has no native forms). When hidden, `language` reads as `english`.
- **Pack and section links:** shown only when `source` is pack. The section link is shown only when the pack has `##` headings.
- **Length link:** titles only.
- **Tooltips:** culture, "Naming culture: which customs the names follow"; kind, the kind's description; language, "English translations, the culture's own words, or a mix"; gender, "Decides forms such as King or Queen, -son or -dóttir"; length, "One title, or a full royal style of two to four"; source, "Who the byname belongs to"; the rest as GN.

### 2.3 Resets

- **Culture, genre or fantastic changed:** a kind that isn't available resets to Any.
- **Culture set to General:** `language` resets to `english`.
- **Source changed away from pack:** pack and section are kept for next time but not used.

### 2.4 Pack sections and gender

- When the chosen pack has `##` headings named Male and Female (case-insensitive), the section link defaults to **"its section for the gender"**: Male for men, Female for women, and for anyone the matching section for each name's drawn gender.
- Otherwise the default is the first heading, as the compound brief's selector does.
- A section chosen by hand always wins over the gender default.
- The pack is drawn through the same `PackDraw` path that word-list `//` lines use (`src/names/wordListSource.ts`), with the section as the `SectionRequest`.
- If the pack can't be drawn (missing, or no name in 20 tries), fall back to the placeholder for that name and add the notice "Pack “{x}” gave no names; placeholders used."

### 2.5 State, presets and plain text

Session-only state, as GN. Plain text as GN §2.6. Presets in §12.

---

## 3. Generation pipeline

```
module
    ↓
gender          (men · women · per name 50/50 for anyone)
    ↓
kind            (chosen, or weighted from the culture's kinds in this setting)
    ↓
shape           (weighted; filtered by setting, culture, gender, language; tone factor)
    ↓
tokens          (lists filtered by setting; culture flavour; tone factor; native/English form)
    ↓
name            (placeholder, pack draw, or none: §2.4)
    ↓
joining         (§10: name order, "the", commas, affix rules)
    ↓
safeguards      (§11)
    ↓
result
```

- **Weights:** fixed base weights from this brief; culture flavour on top (§4.3); tone factor (TS §2.4); renormalised after filtering.
- **Language:** in native mode, a token that has a native form uses it; a token without one uses its English form. A shape marked `n` (native-only) is used only in native and mixed modes; a shape marked `e` (English-only) only in English and mixed. In mixed mode each name is native or English with equal chance, then follows that mode's rule.
- **Gender:** a word or shape marked `m` or `f` is used only for that gender. A pair is written `King / Queen`: the first form for men, the second for women.
- **Failure and batches:** as GN §4: redraw the shape; after 20 failures redraw the kind; after 20 more skip and add "Only {n} names could be generated." Unique case-insensitively; at most `count × 50` attempts; seeded with `mulberry32`.

### 3.1 Notation

Lists named in this brief but not defined here (`number`, `land`, `spaceLand`, `compass`, `star`) are read from `group-names.json` with their setting tags.


As GN §4.1, plus:

| Notation | Meaning |
|---|---|
| `{name}` | the person's name (§2.4). Never inside a shape: the join step (§10) places it. |
| `{father}`, `{mother}` | a parent's name: placeholder `[father]`/`[mother]`, or a pack draw from the Male/Female section (or the chosen section if the pack has no such headings). In "on their own" mode, always the placeholder. |
| `{a+b}` | the two words written as one, the second in lower case: `{material+bodyPart}` → Ironhand |
| `{list:native}` | the native form only (native-only shapes) |
| `[x]` in a table | the native form of the word before it, e.g. `King / Queen [Konungr / Drottning]` |

---

## 4. Cultures

### 4.1 The line-up

| Key | Label | Notes |
|---|---|---|
| `general` | General | no culture; home of fantasy and sci-fi words |
| `anglo-saxon` | Anglo-Saxon | world culture |
| `norse` | Norse | world culture |
| `celtic` | Celtic | world culture (Gaelic and Brittonic) |
| `norman-british` | Norman & British | **new**: Norman conquest to modern Britain; the generic medieval culture |
| `roman` | Roman / Italian | world culture |
| `greek-byzantine` | Greek & Byzantine | **new** |
| `slavic` | Slavic | world culture |
| `steppe` | Turkic & Mongol steppe | **new** |
| `arabic-persian` | Arabic & Persian | world culture |
| `indian` | Indian | world culture |
| `chinese` | Chinese | world culture |
| `japanese` | Japanese | world culture |
| `korean` | Korean | world culture |
| `egyptian` | Egyptian | world culture (ancient) |
| `ethiopian` | Ethiopian | world culture |
| `bantu` | Bantu | world culture |
| `west-african` | West African | world culture |
| `aztec` | Aztec | world culture |
| `maya` | Maya | world culture |

Menu order as above, with the 19 cultures grouped as the world place names menu groups them, and the three new ones placed: Norman & British after Celtic, Greek & Byzantine after Roman, steppe after Slavic.

### 4.2 Tooltips ("Draws on")

| Culture | Draws on |
|---|---|
| general | No cultural flavour; fantasy and sci-fi words |
| norman-british | Norman lords, medieval English surnames, knights and offices |
| greek-byzantine | Ancient Greek filiation, Byzantine courts and family names |
| steppe | Khans, begs and khatuns; Turkic patronymics; wolf and horse bynames |
| all others | The world place names culture's existing guide text |

### 4.3 Culture flavour

For any culture other than General:

1. **Animals:** the world culture's `animal` list (`beast` for Chinese) is added at ×3 to `beast` (§5.2). New cultures: Norman & British — Lion, Hart, Boar, Bear, Hound, Falcon, Swan, Wolf; Greek & Byzantine — Lion, Eagle, Bull, Dolphin, Owl, Serpent, Boar; steppe — Wolf, Grey Wolf, Horse, Falcon, Eagle, Bear, Snow Leopard, Camel.
2. **Gods:** where the world culture has a `god` list, `Beloved of {god}` styles may use it (§6.4). **Not** for Indian, Arabic & Persian, Ethiopian or Greek & Byzantine: those use the general holy words (§11.4).
3. **Places:** `{town}` uses the world place names engine for the culture, default era, as GN §8.4 does. Norman & British, Anglo-Saxon and Celtic use the British place names generator; Greek & Byzantine and steppe use a land compound (GN §8.4) until they have place data.
4. Each culture's own lists in §6–§7.

### 4.4 Name order

Family-first for `chinese`, `japanese` and `korean` (§10.3). Given-first for all others.

---

## 5. Epithets and bynames

### 5.1 Kinds

| Key | Menu | Sentence plural | Settings | Weight |
|---|---|---|---|--:|
| `character` | Character | epithets of character | all | 25 |
| `body` | Body and look | epithets of body and look | all | 15 |
| `deeds` | Deeds | epithets of deeds | all | 15 |
| `beast` | Beast and element | beast and element names | all | 15 |
| `mystic` | Mystical | mystical epithets | all | 10 |
| `place` | Place | place bynames | all | 10 |
| `compound` | Compound bynames | compound bynames | all | 10 |
| `nickname` | Modern nicknames | nicknames | MR MF | 15 (MR, MF only) |
| `dayName` | Day names | day names | FL FH | 15 (aztec only) |

"Any" phrase: "epithets of any kind".

### 5.2 Word lists

Tones per TS §2.3: a word may carry `t`. Columns below give the tone tag; words in the "–" column are untagged. `(H)`, `(S)`, `(M)`, `(MO)`, `(P)` as GN §3.2. Gender pairs as §3.

**`epCharacter`** (adjectives after "the")

| Tone | Words |
|---|---|
| grand | Great ×3, Magnificent, Glorious, Just ×2, Wise ×3, Pious, Noble, Valiant, Victorious, Unconquered, Lawgiver |
| plain | Good ×2, Steady, Quiet, Patient, Careful, Honest, Thrifty, Peaceful, Fair-Minded |
| grim | Cruel ×2, Ruthless, Grim, Merciless, Wrathful, Pitiless, Bloody, Terrible, Iron-Hearted, Treacherous |
| light | Generous, Merry, Lucky, Rash, Restless, Peaceable, Lavish, Talkative, Unlucky, Quarrelsome |
| strange | Silent, Sleepless, Unsmiling, Watchful, Far-Seeing, Strange, Dreamer |
| – | Bold ×3, Brave ×2, Proud ×2, Stern, Resolute, Merciful, Learned, Stout-Hearted, Young, Old ×2, Elder, Younger, Hardy, Fierce, Wary, Gentle, Strong ×2 |

**`epBody`** (adjectives after "the"; normal pool)

Tall ×2, Short, Broad, Strong ×2, Fair ×2, Dark, Red ×2, White, Black, Grey, Golden, Red-Haired, Fair-Haired, Black-Bearded, Grey-Bearded, Long-Haired, Handsome, Beautiful, Scarred, One-Eyed, Swift, Lion-Hearted ×0.3 (grand).

**`epBodyMind`** — drawn **only when the tone is light or grim** (tags shown; never drawn with any other tone, including Any)

| Tone | Words |
|---|---|
| light | Fat, Bald, Stammerer, Unready, Short-Legged, Squint-Eyed, Big-Nosed, Simple, Sleepy, Gouty, Flat-Nosed, Wry-Necked, Fat-Bellied, Clumsy |
| grim | Lame, Mad, Blind, Crookback, Hunchback, Leper ×0.3, Deaf, Mute, Twisted, Pale |

These feed `the {epBodyMind}` (§5.4) and the body compound halves marked † (§5.3).

**`epDeed`** (nouns after "the")

| Tone | Words |
|---|---|
| grand | Conqueror ×2, Founder, Lawgiver, Liberator, Restorer, Unifier, Peacemaker, Victor, Builder ×2 |
| plain | Farmer, Shipwright, Smith, Ploughman, Fisher, Hunter, Traveller, Trader |
| grim | Butcher, Usurper, Tyrant, Oathbreaker, Kinslayer, Burner, Hangman, Exile ×0.5 |
| light | Wanderer, Rover, Kingmaker, Peacock, Gambler |
| strange | Seer, Pilgrim, Returner, Dreamer, Wakeful |
| – | Explorer, Navigator, Defender, Avenger, Crusader `(P)` ×0.3, Champion, Hero, Breaker, Raider |
| (H) | Dragonslayer, Demonbane, Giant-Scourge, Witch-Hunter, Spellbreaker, Wyrmbane |
| (S) | Starfarer, Planetbreaker, Void-Walker, Pathfinder, Terraformer |

**`epMystic`** (after "the")

| Tone | Words |
|---|---|
| grand | Blessed ×2, Chosen, Enlightened, Anointed, Holy ×0.5, Radiant |
| grim | Cursed ×2, Damned ×0.5, Deathless, Doomed, Hollow, Unburied ×0.3 |
| strange | Prophet, Seer, Twice-Born, Dreaming, Far-Walker, Unseen, Moon-Touched, Witch-Born ×0.5 |
| – | Fortunate, Fated, Foretold |
| (H) | Flameborn, Frost-Touched, Storm-Called, Spirit-Touched, Spellbound |
| (S) | Warpborn, Synthborn, Void-Touched, Uplifted |

**`beast`** (after "the"; also in compounds and colour nicknames)

Wolf ×3, Bear ×2, Lion ×2, Raven ×2, Eagle ×2, Fox ×2, Boar, Stag, Hound, Hawk, Falcon, Serpent, Bull, Badger, Otter, Crow, Owl, Lynx; (H) Dragon, Griffin, Wyvern. Culture animals ×3 (§4.3). Female people may also draw She-Wolf, She-Bear ×0.5 each (light).

**`element`**: Storm ×2, Thunder, Tempest, Flame, Frost, Winter, Wind, Gale, Lightning, Tide, Ember, Ash; (S) Nova, Comet, Void.

**`colourNick`**: Red ×3, Black ×3, White ×2, Grey ×2, Gold, Silver, Bronze, Crimson, Azure ×0.5, Emerald ×0.5, Scarlet. (Tags as GN `colour` in TS §2.7; Emerald untagged.)

**`epPlaceLand`**: the GN `land` list with its prefix rule (GN §5.4) and culture land words, plus: North ×2, South ×2, East ×2, West ×2, Isles, Plains, Frontier, Highlands, Hills, Marshes, Coast, Steppe (steppe ×5), Desert (arabic-persian, egyptian ×5), Forest. In SF: `spaceLand` (GN §5.4) plus Belt, Core.

**`modernNick`** `(MO)`

| Tone | Words |
|---|---|
| light | Lucky ×2, Slim, Tiny, Doc, Sparky, Two-Times, Mumbles, Spuds, the Weasel, Knuckles, Lefty, Shorty, Dapper |
| grim | the Knife, the Hammer, Mad Dog, the Undertaker, Cold Eyes |
| strange | the Ghost, the Owl, Whisper, the Saint |
| plain | Red, Duke, Ace, Chief, Doc, Sarge, Mac |
| grand | the Professor, the Baron, the Governor |

**Aztec day names** (`dayNumber` + `daySign`)

| `dayNumber` English [native] | `daySign` English [native] |
|---|---|
| One [Ce], Two [Ome], Three [Yei], Four [Nahui], Five [Macuilli], Six [Chicuace], Seven [Chicome], Eight [Chicuei], Nine [Chicnahui], Ten [Mahtlactli], Eleven [Mahtlactli-once], Twelve [Mahtlactli-omome], Thirteen [Mahtlactli-omei] | Crocodile [Cipactli], Wind [Ehecatl], House [Calli], Lizard [Cuetzpalin], Serpent [Coatl], Death [Miquiztli], Deer [Mazatl], Rabbit [Tochtli], Water [Atl], Dog [Itzcuintli], Monkey [Ozomatli], Grass [Malinalli], Reed [Acatl], Jaguar [Ocelotl], Eagle [Cuauhtli], Vulture [Cozcacuauhtli], Movement [Ollin], Flint [Tecpatl], Rain [Quiahuitl], Flower [Xochitl] |

Day names follow the language setting even in the epithets module: this is the one epithet kind with native forms. The language link shows for epithets only when the culture is Aztec.

### 5.3 Compound halves

Compounds are written as one word, the second half lower case (§3.1). Words marked † are body-and-mind halves: a compound using one counts as `epBodyMind` (light or grim only).

| List | Words |
|---|---|
| `material` | Iron ×3, Stone ×2, Steel `(PM)`, Gold, Silver, Bronze, Oak, Ash, Frost, Fire, Storm, Blood (grim), Bone (grim), Black, White, Red, Grey; (S) Chrome, Void, Star |
| `bodyPart` | hand ×3, heart ×2, fist, arm, beard, foot, shield, eye, brow, tooth, side, skull (grim) |
| `bodyLook` (look + part: Bluetooth-style) | Blue+tooth, Fork+beard, Fair+hair, Long+shanks, Strong+bow, Bare+foot, Broad+hand, Grey+cloak, Long+sword, Red+cloak, Iron+side, Hard+head, Wide+mouth †, Crook+back †, Flat+nose †, Split+lip †, Wry+neck †, Ox+foot † |
| `doer` (noun + -er/-maker etc.) | Oath+breaker (grim), Shield+breaker, Ship+breaker, Ring+giver (grand), King+maker, Bridge+builder, Gold+giver (grand), Wolf+feeder (grim), Raven+feeder (grim), Peace+weaver (grand), Spear+shaker, Skull+splitter (grim), Wave+rider, Sea+rover, Mead+drinker (light), Ale+swiller (light), Horse+breaker; (H) Dragon+bane, Troll+slayer, Rune+carver, Moon+caller, Star+weaver, Storm+crow; (S) Grid+runner, Ghost+wire, Black+code, Star+born, Void+walker |
| `clanBorn` (H) | {material} or {element} + born / blood / heart / fist / brand / shield: Frostborn, Ironblood, Wolfheart, Stonefist, Firebrand |

### 5.4 Shapes

Each shape has a **join** (§10.1): `the` (joins as "{name} the X"), `of` ("{name} of X"), `bare` ("{name} X"), or `comma` ("{name}, X").

| Kind | Shape | Join | Weight | Settings | Example |
|---|---|---|--:|---|---|
| character | `the {epCharacter}` | the | 80 | all | the Bold |
| character | `the {epCharacter} and {epCharacter}` | the | 5 | all | the Wise and Patient |
| character | `the {epCharacter} {beast}` | the | 15 | all | the Bold Wolf |
| body | `the {epBody}` | the | 60 | all | the Tall |
| body | `{bodyLook}` | bare | 25 | FL FH | Forkbeard |
| body | `the {epBodyMind}` | the | 15 | all | the Stammerer (light or grim only) |
| deeds | `the {epDeed}` | the | 75 | all | the Builder |
| deeds | `{doer}` | bare | 25 | all | Ringgiver |
| beast | `the {beast}` | the | 30 | all | the Raven |
| beast | `{colourNick} {beast}` | bare | 25 | all | Red Wolf |
| beast | `the {element}` | the | 15 | all | the Storm |
| beast | `{beast} of the {epPlaceLand}` | comma | 15 | all | Tiger of the Western Hills |
| beast | `{beast} of {town}` | comma | 15 | all | Lion of Saltgate |
| mystic | `the {epMystic}` | the | 80 | all | the Blessed |
| mystic | `{element}-Touched` | bare | 15 | FH MF SF | Frost-Touched |
| place | `of the {epPlaceLand}` | of | 50 | all | of the Plains |
| place | `of {town}` | of | 50 | all | of Saltgate |
| compound | `{material+bodyPart}` | bare | 40 | all | Ironhand |
| compound | `{doer}` | bare | 30 | all | Shieldbreaker |
| compound | `{clanBorn}` | bare | 30 | FH MF | Frostborn |
| nickname | `“{modernNick}”` | bare | 100 | MR MF | “Lucky” |
| dayName | `{dayNumber} {daySign}` | comma | 100 | FL FH | One Reed / Ce Acatl |

- `{epBodyMind}` shapes and † compounds are weight 0 unless the tone is light or grim. Then they use the weights above.
- Modern nicknames: in MR and MF the `nickname` kind is weighted 15 and the `body` kind's `{bodyLook}` shape is off.

---

## 6. Titles and honorifics

### 6.1 Kinds

| Key | Menu | Sentence plural | Weight |
|---|---|---|--:|
| `rank` | Ranks | ranks | 40 |
| `office` | Offices of a domain | offices | 40 |
| `style` | Royal and sacred styles | royal styles | 20 |

"Any" phrase: "titles of any kind". With `length` full styles, the kind is ignored (§6.5).

### 6.2 Ranks by culture

Each entry is `English m / English f [native m / native f]`. "—" means no form for that gender: with that gender the entry isn't drawn. Where only one native form exists for both, it's written once. **pos: after** means the rank follows the name (*Temür Khan*); everything else goes before (*King Harald*).

| Culture | Ranks |
|---|---|
| general | King / Queen ×2, Lord / Lady ×3, Duke / Duchess, Count / Countess, Baron / Baroness, Prince / Princess, Marshal ×0.5, Warden, Steward, Chancellor ×0.5, Governor `(PM)`; `(MO)` President, Minister, Director, Commissioner, Chairman / Chairwoman; `(S)` Administrator, Prefect, High Commissioner, Overseer, Director-General, Governor-General; (H) Archmage, Witch-Queen (f), Warlock-King (m) |
| anglo-saxon | King / Queen [Cyning / Cwen], Lord / Lady [Hlaford / Hlæfdige], Ealdorman / — [Ealdorman / —], Thane / — [Thegn / —], Reeve / — [Gerefa / —], Prince / — [Ætheling / —] |
| norse | King / Queen [Konungr / Drottning], Jarl / — [Jarl / —], Chieftain / — [Goði / —], Hersir / — [Hersir / —], Lawspeaker / — [Lögsögumaðr / —], Sea-King / — [Sækonungr / —] |
| celtic | King / Queen [Rí / Rígan], High King / High Queen [Ard Rí / Ard Rígan], Chief / — [Toísech / —], Lord / Lady [Tigerna / Tigernae], Bard / — [Bard / —] |
| norman-british | King / Queen [Roi / Reine], Duke / Duchess [Duc / Duchesse], Earl / Countess [Comte / Comtesse], Baron / Baroness, Lord / Lady [Seigneur / Dame], Sir / Dame ×2, Sheriff / —, Constable / — [Connétable / —], Seneschal / — [Sénéchal / —], Marshal / — [Maréchal / —]; `(MO)` Lord Lieutenant / Lady Lieutenant, Chief Constable / Chief Constable, Alderman / Alderwoman, Mayor / Mayor |
| roman | Emperor / Empress [Imperator / Augusta], Caesar / — [Caesar / —], Consul / — [Consul / —], Senator / — [Senator / —], Legate / — [Legatus / —], Tribune / — [Tribunus / —], Prefect / — [Praefectus / —], Proconsul / — [Proconsul / —], Lady / Lady [— / Domina]; `(MO)` Doge / — [Doge / —] ×0.3 |
| greek-byzantine | Emperor / Empress [Basileus / Basilissa], Autocrat / — [Autokrator / —], Despot / Despoina [Despotes / Despoina], General / — [Strategos / —], Archon / Archontissa [Archon / Archontissa], Logothete / — [Logothetes / —], Exarch / — [Exarchos / —], Patrician / Patrician [Patrikios / Zoste Patrikia], Sebastos / Sebaste [Sebastos / Sebaste] |
| slavic | Tsar / Tsaritsa [Tsar / Tsaritsa], Grand Prince / Grand Princess [Veliky Knyaz / Velikaya Knyaginya], Prince / Princess [Knyaz / Knyaginya], Boyar / Boyarynya [Boyar / Boyarynya], Voivode / — [Voivode / —], Ban / — [Ban / —], Hetman / — [Hetman / —] |
| steppe | Khan / Khatun [Khan / Khatun] (pos: after), Great Khan / — [Khagan / —], Beg / — [Beg / —] (pos: after), Commander / — [Noyan / —], Tarkhan / — [Tarkhan / —], Yabgu / — [Yabgu / —] |
| arabic-persian | Sultan / Sultana [Sultan / Sultana], King / Queen [Malik / Malika], Emir / Emira [Amir / Amira], Shah / Shahbanu [Shah / Shahbanu], Vizier / — [Wazir / —], Satrap / — [Satrap / —], Sheikh / Sheikha [Shaykh / Shaykha], Nawab / Begum [Nawab / Begum] |
| indian | King / Queen [Raja / Rani] ×2, Great King / Great Queen [Maharaja / Maharani], Emperor / Empress [Samrat / Samragni], Crown Prince / Crown Princess [Yuvaraja / Yuvarani], General / — [Senapati / —], Minister / — [Amatya / —], Nawab / Begum [Nawab / Begum] |
| chinese | Emperor / Empress [Huangdi / Huanghou], King / Queen [Wang / Wanghou], Duke / — [Gong / —], Marquis / — [Hou / —], General / — [Jiangjun / —], Chancellor / — [Chengxiang / —], Princess / Princess [— / Gongzhu] |
| japanese | Emperor / Empress [Tennō / Kōgō] ×0.3, Shogun / — [Shōgun / —], Regent / — [Kampaku / —], Lord / — [Daimyō / —], Princess / Princess [— / Hime], Governor / — [Kami / —] |
| korean | King / Queen [Wang / Wangbi], Great King / — [Daewang / —], Emperor / — [Hwangje / —], Crown Prince / — [Seja / —], Princess / Princess [— / Gongju], General / — [Janggun / —], Chief Minister / — [Yeonguijeong / —] |
| egyptian | Pharaoh / Pharaoh [Per-aa / Per-aa], — / King's Great Wife [— / Hemet Nesu Weret], Vizier / — [Tjaty / —], Nomarch / — [Nomarch / —], Overseer / — [Imy-ra / —], Scribe / — [Sesh / —] |
| ethiopian | Emperor / Empress [Negusa Nagast / Nigiste Negestat], King / Queen [Negus / Nigist], Prince / Princess [Le'ul / Le'ilt], Duke / — [Ras / —], Commander / — [Dejazmach / —], Vanguard Commander / — [Fitawrari / —], Queen / Queen [— / Itege] |
| bantu | King / Queen [Mwami / Mwamikazi], Chief / — [Nkosi / —], Lord / — [Mfumu / —], Ruler / — [Mani / —], Queen Mother / Queen Mother [— / Ndlovukazi], Elder / Elder [Mzee / Mzee] |
| west-african | Emperor / — [Mansa / —], Emperor / — [Askia / —] ×0.5, King / Queen [Oba / —], Owner of the Palace / — [Alaafin / —], Chief / — [Ohene / —], Queen Mother / Queen Mother [— / Ohemaa], Queen Mother / Queen Mother [— / Iyoba], Emir / — [Amir / —] |
| aztec | Ruler / Ruler [Tlatoani / Cihuatlatoani], Great Speaker / — [Huey Tlatoani / —], Lord / Lady [Tecuhtli / Cihuapilli], Snake Woman / — [Cihuacoatl / —] (a man's office), Noble / Noble [Pilli / Cihuapilli], Eagle Lord / — [Cuauhpilli / —] |
| maya | Holy Lord / Holy Lady [K'uhul Ajaw / K'uhul Ixik], Lord / Lady [Ajaw / Ix Ajaw], Overlord / Overlady [Kalomte' / Ix Kalomte'], Governor / — [Sajal / —], Keeper of the Holy Books / — [Aj K'uhun / —] |

### 6.3 Offices of a domain

Offices are mostly English in every culture; the domain makes them. Native forms only where a rank in §6.2 is used as the office word.

- **`officeWord`** (all cultures): Warden ×3, Keeper ×3, Guardian ×2, Lord / Lady ×3, Master / Mistress ×2, Protector, Steward ×2, Shield, Hand, Voice, Sword, Watcher, Captain; `(S)` Custodian, Administrator, Overseer, Director.
- **`courtDomain`** (after "of the"): Seal, Rolls, Treasury, Horse ×2, Wardrobe, Hounds, Hunt, Granaries, Keys, Gates ×2, Walls, Harbour, Mint, Ships, Wine, Bedchamber, Archives, Roads, Bridges, Waters; (H) Runes, Fey Roads, Sacred Flame ×0.5, Dragons ×0.5, Storms ×0.5; `(S)` Core, Docks, Data Vaults, Rings, Long Watch.
- **`domainLand`**: the epithet `epPlaceLand` list (§5.2): *the North*, *the Marches*.

| Shape | Weight | Settings | Example |
|---|--:|---|---|
| `{officeWord} of the {courtDomain}` | 35 | all | Keeper of the Seal |
| `{officeWord} of the {domainLand}` | 30 | all | Warden of the Marches |
| `{officeWord} of {town}` | 20 | all | Lord of Saltgate |
| `{rank} of {town}` | 15 | all | Jarl of Fenwick / Duc de Fenwick (§10.4) |

### 6.4 Royal and sacred styles

Each entry is English, then [native] where an attested form exists. Entries without a native form stay English in native mode. Tone tags in brackets.

| Culture | Styles |
|---|---|
| general | King of Kings (grand), Lord of the {domainLand} ×2, Protector of the Realm (grand), Shield of the People, Keeper of the Peace (plain), Father of the Nation `(MO)` / Mother of the Nation `(MO)`, Lord of Storms (H), Keeper of the Sacred Flame (H), Master of the Ten Winds (H, strange), Custodian of the Core `(S)` |
| anglo-saxon | Ring-Giver [Beahgifa], Gold-Friend of Men (grand), Ruler of Britain [Bretwalda], Shepherd of the People (plain), Protector of Warriors |
| norse | Ring-Giver, Gold-Breaker of the Sea-Wolves (grand), Feeder of Ravens (grim), Sea-King [Sækonungr], Gift-Giver |
| celtic | High King [Ard Rí], Hound of the {epPlaceLand} (grand), King of the {number} Kingdoms, Lord of the Sea-Roads |
| norman-british | Lord of {town}, Lord of the {domainLand}, Protector of the Realm, Lord Protector `(PM)` ×0.3, Defender of {town}, Duke of {town} [Duc de {town}] |
| roman | Father of the Fatherland [Pater Patriae] (grand), First Citizen [Princeps], Greatest Pontiff [Pontifex Maximus], Unconquered [Invictus], Dutiful and Fortunate [Pius Felix], Conqueror of the {domainLand} |
| greek-byzantine | Purple-Born [Porphyrogennetos] (grand), Autocrat [Autokrator], Ever-August [Aei Augoustos], Despot of the {domainLand} [Despotes of the {domainLand}] |
| slavic | Autocrat of All the {domainLand} [Samoderzhets of All the {domainLand}], Grand Prince of {town} [Veliky Knyaz of {town}], Father of the Land (plain) |
| steppe | Great Khan [Khagan] (grand), Lord of the Felt Tents, Ruler of the Four Corners, Khan of the {colourNick} Steppe, Wolf of the Steppe (grim) |
| arabic-persian | King of Kings [Shahanshah] (grand), Pillar of the State, Shield of the State, Lamp of the State, Glory of the State, Right Hand of the State, Lord of the Two Seas, Lord of the Lands of {town} |
| indian | King of Great Kings [Maharajadhiraja] (grand), Universal Ruler [Chakravartin], Beloved of the Earth [Prithvivallabha], Lord of the Three Oceans, Destroyer of Foes (grim) |
| chinese | Son of Heaven [Tianzi] (grand), Ten Thousand Years [Wansui], Holder of the Mandate (grand), Lord of the Middle Kingdom |
| japanese | Son of Heaven [Tenshi] ×0.3, Ruler of the Realm (grand), Lord of the Eastern Provinces, Great General of the {domainLand} |
| korean | Great King [Daewang] (grand), King of the Eastern Land, Lord of the Three Kingdoms |
| egyptian | Lord of the Two Lands [Neb Tawy] (grand), Son of Ra [Sa Ra], Beloved of {god} ×2, Living Image of {god} (strange), Mighty Bull [Ka Nakht] (grand), Lord of Crowns [Neb Khau] |
| ethiopian | King of Kings [Negusa Nagast] (grand), Lord of the Highlands, Light of {town} |
| bantu | The Lion [Ingwenyama] (grand), The She-Elephant [Ndlovukazi] (women only), Mother of the Nation (women only), Lord of the Land, Owner of Cattle (plain) |
| west-african | Ruler of the World [Mogho Naaba] (grand), Owner of the Palace [Alaafin], Lord of the Gold Lands, Master of the River |
| aztec | Great Speaker [Huey Tlatoani] (grand), Holder of the Mat and Seat (strange), Lord of {town} [Tecuhtli of {town}] |
| maya | Holy Lord of {town} [K'uhul Ajaw of {town}], Overlord of the West [Ochk'in Kalomte'] (grand), He of Twenty Captives [Aj Winik Baak] (grim; men only), Lord of the {number} Katuns (strange) |

- `{god}` uses the world culture's `god` list (Norse, Anglo-Saxon, Egyptian, Aztec, Maya). Only Egyptian has `{god}` styles in this table.

### 6.5 Length

- **Single titles:** one shape from the chosen kind (or Any).
- **Full styles:** 2 (40%), 3 (40%) or 4 (20%) titles joined with ", ". The first is always a rank (`{rank}` alone, or `{rank} of {town}`); the rest are styles or offices, at most one office. No title twice; no two titles sharing a content word (GN §11.5 across the whole style). Full styles are shown only for General and cultures with three or more styles in §6.4 (all of them).
- Full styles ignore the 8-word cap; they are capped at 24 words.

### 6.6 Kind shapes

| Kind | Shape | Weight |
|---|---|--:|
| rank | `{rank}` | 100 |
| office | §6.3 shapes | – |
| style | `{style}` | 100 |

---

## 7. Family names

### 7.1 Kinds

| Key | Menu | Sentence plural | Settings |
|---|---|---|---|
| `patronymic` | Patronymics | patronymics | all |
| `occupational` | Trades | trade names | all |
| `place` | Places | place names | all |
| `descriptive` | Nicknames | nickname surnames | all |
| `inherited` | Inherited surnames | inherited surnames | all |
| `clan` | Clan-style | clan-style names | FH MF SF (General only) |

"Any" phrase: "family names of any kind". Each culture offers only the kinds listed for it in §7.3, with the weights given there.

### 7.2 General English lists

Used by General and Norman & British, and by any culture whose row says "English lists".

- **`trade`**: Smith ×3, Baker, Brewer, Butcher, Carter, Chandler, Cooper, Draper, Dyer, Fisher, Fletcher, Fowler, Glover, Hunter, Mason, Miller ×2, Parker, Potter, Sawyer, Shepherd, Skinner, Slater, Spicer, Taylor ×2, Thatcher, Turner, Walker, Ward, Weaver, Webster, Wright, Bowyer, Collier, Cartwright, Wheelwright, Tanner, Tyler; (H) Runesmith, Spellwright, Dragonkeeper, Ironbinder; `(S)` Voidwright, Starmaker, Synthwright.
- **`placeFirst`**: Ash, Oak, Elm, Thorn, Black, White, Red, Green, Grey, North, South, East, West, Brad (broad), Stan (stone), Brook, Hay, Lang (long), Rad (red), Wood, Holly, Fern, Bir (birch), Cold, Win, Hart, Wolf, Shel, Kirk.
- **`placeLast`**: ford ×2, ley ×2, ton ×2, wood, field, hill, well, brook, stone, marsh, worth, combe, dale, bury, by, thorpe, holt, hurst, stead, wick.
- **`placeWord`** (bare place surnames): Hill, Brook, Ford, Wood, Stone, Marsh, Field, Dale, Moor, Heath, Lane, Bridge, Green, Shaw, Holt.
- **`nick`**: Brown, White, Black, Grey, Little, Long, Short, Young, Good, Strong, Armstrong, Swift, Fairfax, Whitehead, Redhead, Goodman, Bold, Sharp, Hardy, Merry, Wise; light or grim only (body-and-mind rule, light tag): Cruikshank, Ballard, Gammon, Crookes, Lightfoot.
- **`clanStyle`** (H/S, General only): the `clanBorn` list (§5.3) plus {material+heart|blood|shield|fist|bane}; `(S)` Voidborn, Starborn, Gridborn, Shipborn.

### 7.3 Culture systems

Patronymic forms use `{father}` (or `{mother}` where shown). "f:" gives the women's form. "E:" is the English form, "N:" the native form; mixed mode chooses per name.

| Culture | Kinds (weight) | Forms |
|---|---|---|
| general | occupational 30, place 30, descriptive 20, patronymic 20, clan (FH MF SF) 15 | patronymic E: `{father}son` 70 / `son of {father}` 30; f: `daughter of {father}`. English lists §7.2. |
| anglo-saxon | patronymic 50, descriptive 30, place 20 | patronymic E: `son of {father}`, f: `daughter of {father}`; N: `{father}ing`, f: `{father}es dohtor`. Place: `of {town}`. Descriptive from `nick`. |
| norse | patronymic 70, descriptive 30 | E: `{father}son` 60 / `son of {father}` 40, f: `{father}'s daughter` → render "daughter of {father}"; N: `{father}sson`, f: `{father}sdóttir` (if the name ends in s: `{father}son`, `{father}dóttir`); matronymic N: `{mother}sson` ×0.1 |
| celtic | patronymic 75, descriptive 25 | Gaelic N: `Mac{father}` 40, `Ó {father}` → write `O'{father}` 20, f: `Nic{father}`; Welsh N: `ap {father}` (`ab {father}` before a vowel) 30, f: `ferch {father}`; E: `son of {father}` / `grandson of {father}` (for O'), f: `daughter of {father}`. |
| norman-british | occupational 25, place 25, descriptive 15, patronymic 20, inherited 15 | E (British): §7.2 lists; patronymic `{father}son` 60 / `{father}s` 40 (Johnson, Williams). N (Norman): patronymic `Fitz{father}` (men only; women use `de {town}`); place `de {town}`; descriptive `le {normanNick}`. **`normanNick`** [English]: Brun [Brown], Blanc [White], Roux [Red], Gros [Fat] (light only), Petit [Little], Fort [Strong], Sage [Wise], Hardi [Bold], Fèvre [Smith] (counts as occupational), Breton [Breton], Long [Tall], Noir [Black]. Inherited: `{placeFirst+placeLast}` English; N: `de {placeFirst+placeLast}`. |
| roman | inherited 70, descriptive 30 | Inherited N: `{nomen} {cognomen}`, f: `{nomen:f}`; E: `{nomen} the {cognomen:E}`, f: `{nomen:f}`. Descriptive = cognomen alone, N `{cognomen}` / E `the {cognomen:E}`. Lists below. |
| greek-byzantine | patronymic 40, inherited 60 | Patronymic E: `son of {father}`, f: `daughter of {father}`; N: `{father}ides` (if the name ends in a vowel, drop it first). Inherited (Byzantine family names, kept as proper names in both modes): Komnenos, Doukas, Palaiologos, Angelos, Laskaris, Kantakouzenos, Phokas, Skleros, Bryennios, Dalassenos, Tornikes, Kourkouas, Argyros, Melissenos, Botaneiates, Tarchaneiotes, Raoul, Philanthropenos, Synadenos, Branas; f: the same name with -ene for -os (Komnene, Doukaina for Doukas, Palaiologina for Palaiologos) — store the female form with each. |
| slavic | patronymic 40, inherited 60 | Patronymic N: `{father}ovich`, f: `{father}ovna` (ending rules §7.4); E: `son of {father}`, f: `daughter of {father}`. Inherited: pairs below. |
| steppe | patronymic 70, descriptive 30 | Patronymic N: `{father}oğlu`, f: `{father}kızı`; E: `son of {father}`, f: `daughter of {father}`. Descriptive E only: `of the {colourNick} Wolf Clan`, `of the {beast} Clan`. |
| arabic-persian | patronymic 40, occupational 20, place 25, descriptive 15 | Patronymic N: `ibn {father}`, f: `bint {father}`; Persian N: `{father}zadeh` ×0.3 (both); E: `son of {father}`, f: `daughter of {father}`. Kunya (descriptive slot, men) N: `Abu {child}`, women `Umm {child}`; E: `father of {child}` / `mother of {child}`; `{child}` = a pack or placeholder name, any gender. Occupational and place: pairs below. |
| indian | patronymic 60, place 40 | Patronymic N: `{father}putra`, f: `{father}putri`; matronymic N: `{mother}putra` ×0.3 (as Gautamiputra); E: `son of {father}`, f: `daughter of {father}`. Place: `of {town}`. **No occupational, clan or inherited surnames** (caste safeguard, §11.5). |
| chinese | inherited 100 | Surname list below; family-first (§10.3). |
| japanese | inherited 100 | Surname pairs below; family-first. |
| korean | inherited 100 | Surname pairs below; family-first. |
| egyptian | patronymic 70, place 30 | Patronymic N: `sa {father}`, f: `sat {father}`; E: `son of {father}`, f: `daughter of {father}`. Place: `of {town}`. |
| ethiopian | patronymic 100 | N: `{father}` (bare: given name then father's name); E: `son of {father}`, f: `daughter of {father}`. |
| bantu | patronymic 60, inherited 40 | Patronymic N: `ka{father}` (both genders; `kaSenzangakhona` style, lower-case ka joined); E: `son of {father}`, f: `daughter of {father}`. Inherited pairs below. |
| west-african | patronymic 70, place 30 | Patronymic N: `dan {father}`, f: `'yar {father}`; E: `son of {father}`, f: `daughter of {father}`. Place: `of {town}`. No clan names (§11.5). |
| aztec | patronymic 40, place 60 | E only: `son of {father}` / `daughter of {father}`; place `of {town}`. (Day names live in epithets.) |
| maya | patronymic 40, place 60 | E only, as Aztec. Place: `of {town}`; with native mode, `{town}`'s holy-lord form is a title, not a surname. |

### 7.4 Slavic patronymic endings

Applied to the father's name before the suffix:

| Name ends in | Men | Women |
|---|---|---|
| a consonant | +ovich | +ovna |
| -y, -i, -iy, -ei | drop the ending, +evich | drop, +evna |
| -a, -ya | drop it, +ich | drop, +ichna |
| anything else | +ovich | +ovna |

Capitalisation: the father's name keeps its capital; the suffix is lower case.

### 7.5 Culture lists

**Roman `nomen`** (m / f): Julius / Julia ×0.3, Cornelius / Cornelia, Valerius / Valeria, Claudius / Claudia ×0.5, Aemilius / Aemilia, Fabius / Fabia, Junius / Junia, Licinius / Licinia, Sempronius / Sempronia, Tullius / Tullia, Aurelius / Aurelia, Flavius / Flavia, Domitius / Domitia, Sulpicius / Sulpicia, Caecilius / Caecilia, Calpurnius / Calpurnia, Antonius / Antonia, Octavius / Octavia, Livius / Livia, Servilius / Servilia, Manlius / Manlia, Postumius / Postumia, Furius / Furia, Horatius / Horatia.

**Roman `cognomen`** [English]: Rufus [Red], Niger [Black], Albinus [White], Longus [Tall], Magnus [Great] (grand), Severus [Stern], Felix [Lucky] (light), Pius [Dutiful], Lepidus [Charming] (light), Paullus [Small], Agricola [Farmer] (plain), Corvus [Raven], Lupus [Wolf], Ursus [Bear], Aquila [Eagle], Celer [Swift], Sabinus [Sabine], Maximus [Greatest] (grand), Priscus [Elder], Fortis [Brave]; body-and-mind (light or grim only): Crassus [Fat] (light), Naso [Nose] (light), Strabo [Squinter] (light), Balbus [Stammerer] (light), Caecus [Blind] (grim), Brutus [Dull] (light), Varus [Bow-Legged] (light), Calvus [Bald] (light).

**Slavic inherited** [English]: Kuznetsov [Smith], Melnikov [Miller], Rybakov [Fisher], Plotnikov [Carpenter], Goncharov [Potter], Volkov [Wolf], Sokolov [Falcon], Lebedev [Swan], Medvedev [Bear], Orlov [Eagle], Voronin [Raven], Kozlov [Goat], Zaitsev [Hare], Belov [White], Chernov [Black], Novikov [Newman], Morozov [Frost], Kamenev [Stone], Lesnoy [Forest] — female: replace -ov/-ev/-in with -ova/-eva/-ina, -oy with -aya. In English mode use the English word (*Wolf*, *Smith*).

**Arabic & Persian occupational** [English]: al-Haddad [Smith], al-Najjar [Carpenter], al-Khayyat [Tailor], al-Attar [Perfumer], al-Sabbagh [Dyer], al-Warraq [Stationer], al-Sayegh [Goldsmith], al-Tahhan [Miller], al-Jammal [Cameleer], al-Bazzaz [Cloth-Seller].

**Arabic & Persian place (nisba)** [English]: al-Baghdadi [of Baghdad], al-Dimashqi [of Damascus], al-Misri [of Egypt], al-Andalusi [of Andalusia], al-Farisi [of Fars], al-Shirazi [of Shiraz], al-Isfahani [of Isfahan], al-Tabrizi [of Tabriz], al-Basri [of Basra], al-Kufi [of Kufa], al-Halabi [of Aleppo], al-Maghribi [of the West], al-Yamani [of Yemen]; plus E `of {town}` ×2 (English mode only).

**Chinese surnames** (native, family-first): Li, Wang, Zhang, Liu, Chen, Yang, Zhao, Huang, Zhou, Wu, Xu, Sun, Ma, Zhu, Hu, Guo, He, Lin, Gao, Luo, Zheng, Liang, Xie, Tang, Han, Feng, Deng, Cao, Peng, Xiao, Tian, Dong, Pan, Yuan, Cai, Jiang, Yu, Du, Ye, Cheng, Wei, Su, Ding, Shen, Yao, Lu, Cui, Zhong, Tan, Fan, Jin, Shi, Bai, Meng, Xiong, Qin, Long.
English mode draws only these pairs: Wang [King], Li [Plum], Lin [Forest], Huang [Yellow], Bai [White], Shi [Stone], Ma [Horse], Long [Dragon], Xiong [Bear], Gao [High], Jin [Gold], Ye [Leaf], Tian [Field], Yang [Poplar], Zhu [Vermilion].

**Japanese surnames** [English]: Tanaka [Middlefield], Yamamoto [Mountainfoot], Yamada [Mountainfield], Nakamura [Midvillage], Kobayashi [Littlewood], Matsumoto [Pinefoot], Inoue [Wellhead], Kimura [Treeton], Hayashi [Forest], Ishikawa [Stonebrook], Yamaguchi [Hillmouth], Morita [Woodfield], Ikeda [Pondfield], Hashimoto [Bridgefoot], Ishii [Stonewell], Ogawa [Littlebrook], Okada [Hillfield], Fujita [Wisteriafield], Takahashi [Highbridge], Kawaguchi [Rivermouth], Matsuda [Pinefield], Sakamoto [Slopefoot], Shimizu [Clearwater], Mori [Wood], Ono [Littlefield], Nishimura [Westvillage], Kitamura [Northvillage], Kawamura [Rivervillage], Takeda [Bamboofield] ×0.3.

**Korean surnames** (native, family-first): Kim, Lee, Park, Choi, Jung, Kang, Cho, Yoon, Jang, Lim, Han, Oh, Seo, Shin, Kwon, Hwang, Ahn, Song, Ryu, Hong, Jeon, Ko, Moon, Yang, Son, Baek, Seok, Ma.
English mode draws only these pairs: Kim [Gold], Lee [Plum], Lim [Forest], Hwang [Yellow], Baek [White], Seok [Stone], Ma [Horse], Ryu [Willow].

**Bantu inherited** [English]: Ndlovu [Elephant], Ngwenya [Crocodile], Nyathi [Buffalo], Ngonyama [Lion].

---

## 8. Tone

TS §2 applies unchanged: tags on words (`t`), lists (`listTones`) and shapes; ×4 matching, ×0.25 opposed. Tags are given in §5–§7. Additionally:

- **List tags:** `epBodyMind` and † compound halves carry their own light/grim tags and are **gated**, not weighted: weight 0 unless the tone is light or grim.
- **Shape tags:**

| Module | Shape | Tag |
|---|---|---|
| epithets | `the {epCharacter} and {epCharacter}` | grand |
| epithets | `{bodyLook}` | light |
| epithets | `{beast} of {town}` | grand |
| epithets | `{beast} of the {epPlaceLand}` | grand |
| epithets | `of {town}` | plain |
| epithets | `{doer}` | light |
| titles | `{officeWord} of the {courtDomain}` | plain |
| titles | `{style}` | grand |
| family | occupational and place kinds | plain |
| family | `{clanStyle}` | grand |

---

## 9. Placement in other modules (parked hook)

`{person}` in group shapes (GN §8) can later take an epithet: *the Red Duke* already exists there. Not in this release.

---

## 10. Joining

### 10.1 Epithets

| Join | With a name | On its own |
|---|---|---|
| the | `{name} the Bold` | `the Bold` |
| of | `{name} of the Plains` | `of the Plains` |
| bare | `{name} Ironhand` | `Ironhand` |
| comma | `{name}, the Tiger of the Western Hills` (adds "the" unless the shape starts with a number word) | `Tiger of the Western Hills` |

A day name with a name: `{name}, One Reed` / `{name}, Ce Acatl`.

### 10.2 Titles

- **Rank, pos before:** `King {name}`; **pos after:** `{name} Khan`.
- **Office or style:** `{name}, Warden of the Marches`.
- **Full style:** `{rank} {name}, {title}, {title}` (pos-after ranks: `{name} {rank}, {title}`).
- **On their own:** the title or style as it stands; full styles start with the rank.

### 10.3 Family names

- **Given-first cultures:** `{name} {family}`. A patronymic in "son of" form: `{name}, son of {father}`.
- **Family-first cultures (Chinese, Japanese, Korean):** `{family} {name}`. In English mode the translated surname still comes first: *Forest Mei*.
- **On their own:** the family name alone, or `son of [father]` for an English patronymic.
- **Slavic:** `{name} {patronymic}` for the patronymic kind; inherited surnames as given-first.

### 10.4 Native "of"

In native mode, a native rank with a place uses the culture's own word for "of" where this table gives one; everyone else keeps English "of".

| Culture | of |
|---|---|
| norman-british | de (d' before a vowel) |
| roman | – (keep "of") |
| all others | of |

### 10.5 Capitals and dashes

- As GN §11.1: "of", "the", "and" stay lower case except at the start of a standalone result; "the" at the start of an epithet on its own stays lower case (*the Bold*).
- Native particles keep their own case: ibn, bint, ap, ab, ferch, de, le, ka, dan, 'yar, sa, sat, al-.
- `Mac`, `Nic`, `Fitz` join to the name with no space and the name keeps its capital: MacTavin, FitzWalter. `O'` likewise: O'Brannoc.
- Hyphenated compounds capitalise each part (*Frost-Touched*); closed compounds don't (*Ironhand*).

---

## 11. Safeguards

### 11.1 Block list

Whole-result matches (case-insensitive, ignoring a leading "the" and the `{name}` part) are redrawn. Matching also runs on the byname alone, so *the Unready* is allowed but *Æthelred the Unready* can't be produced through a pack name.

- **Real epithets and names:** William the Conqueror, Harald Bluetooth, Sweyn Forkbeard, Harald Fairhair, Erik the Red, Eric the Red, Ivar the Boneless, Æthelred the Unready, Ethelred the Unready, Alfred the Great, Edward the Confessor, Edward Longshanks, Richard the Lionheart, Richard Lionheart, Lionheart, Vlad the Impaler, Ivan the Terrible, Peter the Great, Catherine the Great, Alexander the Great, Charles the Bald, Pepin the Short, Louis the Pious, Charles the Hammer, Basil the Bulgar-Slayer, Bulgar-Slayer, Suleiman the Magnificent, Tiger of Kai, One-Eyed Dragon, Red Devil, Bloody Mary, Black Prince, Iron Lady, Iron Duke, Lion of the North, Desert Fox, Scourge of God, Hammer of the Scots, Kingmaker (as a byname of Warwick: allowed alone, blocked as "Warwick the Kingmaker"), Longshanks, Lackland, Bluebeard, Barbarossa, Crookback (allowed alone; blocked as "Richard Crookback").
- **Real titles held by one person or still in use:** Lion of Judah, Defender of the Faith, Commander of the Faithful, Custodian of the Two Holy Mosques, Keeper of the Holy Places, Shadow of God on Earth, Lord of the Isles, Prince of Wales, Duke of Cornwall, Duke of York, Emperor of the Romans, Supreme Leader, Great Leader, Dear Leader, Führer, Il Duce, Generalissimo, Father of the Nation (allowed only as the generic MO style with no place).
- **Real Arabic religious honorifics:** Sword of Faith, Sword of Islam, Sword of God, Lion of God, Light of the Faith, Pillar of the Faith, Glory of the Faith, and any "… of the Faith" or "… of Islam" or "… of God" form.
- **Fiction:** Oakenshield, Elf-friend, Elf-Friend, Stormborn, Kingslayer, Mother of Dragons, Breaker of Chains, Unburnt, Warden of the North, Hand of the King, Lord Commander, Kingsguard, Dragonborn, Dovahkiin, Witcher, White Wolf, Grey Pilgrim, Strider, Wormtongue, Ringbearer, Ring-Bearer, Lightbringer, Godslayer, Warp-Touched (as a Warhammer term: block exact), Emperor of Mankind, Lord of Light, Dark Lord, Chosen One, Boy Who Lived, Mad King, Night King, King in the North, Imp, Hound, the Mountain, Lady Stoneheart, Bloodraven, Starkiller, Skywalker, Darth.
- **Real gangsters:** Scarface, Bugsy, Machine Gun, Legs, Lucky Luciano, Teflon Don, Dapper Don (Dapper alone is allowed).

### 11.2 Flag list

Allowed by default (`flagListBlocks: false`), as GN §12.2: the Bold, the Great, the Wise, the Fair, the Just, the Good, the Pious, the Fat, the Bald, the Lame, the Mad, the Red, the Black, Ironside, Ironhand, Strongbow, Fitzwalter, King of Kings, Son of Heaven, Ring-Giver.

### 11.3 Banned words

The GN §12.3 list, plus the tribal banned list, plus these, checked as whole words: Saracen, Infidel, Heathen, Gypsy, Savage, Barbarian, Coolie, Darkie, Negro, Half-Breed, Cripple, Retard, Spastic, Midget, Idiot, Imbecile; and these as whole epithets only (so *Moor* as a surname and *of the Moors* stay allowed): the Moor, the Turk, the Pagan, the Mongol, the Dwarf, the Jew, the Gentile.

### 11.4 Sacred specifics

- No real deity names for Indian, Arabic & Persian, Ethiopian or Greek & Byzantine. Their holy styles use the general holy words: Blessed, Holy, Chosen, Anointed, Beloved of Heaven.
- `Beloved of {god}` and `Living Image of {god}` only for Egyptian (and Norse, Anglo-Saxon, Aztec and Maya if a later release adds them).
- No saint-based Christian names (*Wolde Giorgis*), no Islamic theophoric forms (*Abd al-…*, *…-uddin*), no Hindu deity-name surnames.

### 11.5 Caste and clan safeguard

- **Indian:** no surnames beyond patronymic and place (no Sharma, Patel, Iyer and the rest). No ranks tied to caste (Thakur, Rana).
- **West African:** no Mande clan names (*jamu*: Keita, Traoré, Kouyaté and so on), because of their link to occupational castes.
- **Celtic:** no real clan names (MacLeod, MacDonald): Mac forms come from the person's own father name only.
- **Bantu:** only the four inherited names in §7.5.

### 11.6 Gender check

A gendered form never appears for the wrong gender: no *Queen {male name}* from a pack section labelled Male; no *-dóttir* for men. Test in §14.

### 11.7 Safeguard packs

`type: byname-safeguards` packs, read as group safeguard packs (`## Block`, `## Flag`, `## Allow`), with the command "Create byname safeguard list" writing "Byname safeguards.md" (never overwriting).

---

## 12. Presets

```yaml
---
type: module-preset
module: bynames
bynameModule: titles
packName: Steppe khans
culture: steppe
kind: any
genre: fantasy
fantastic: false
tone: grand
language: mixed
gender: men
length: full
source: pack
pack: Steppe names
section: Male
---

Turkic & Mongol steppe-themed titles of any kind for a fantasy world of historic or low fantasy, with a grand air, in English or native forms, for men, as full styles, after names from Steppe names.
```

| Key | Values | Default |
|---|---|---|
| `bynameModule` | `epithets`, `titles`, `familyNames` | required |
| `culture` | `general` or a culture key | `general` |
| `kind` | `any` or a kind key of that module | `any` |
| `genre` / `fantastic` / `tone` | as TS §6.2 | as there |
| `language` | `english`, `native`, `mixed` | `english` |
| `gender` | `men`, `women`, `anyone` | `anyone` |
| `length` | `single`, `full` (titles only) | `single` |
| `source` | `placeholder`, `pack`, `none` | `placeholder` |
| `pack` | a pack name | – |
| `section` | a heading, `gender`, or `whole` | `gender` |

Unknown values: reported as `Unknown {key} “{x}”.` and defaulted, as GN §13. A missing `pack` with `source: pack` runs with placeholders and reports `Pack “{x}” wasn't found.`

---

## 13. Output

As GN §14: `GeneratedName` with `text` and empty `etymology`; the details toggle is hidden. The engine returns, for tests, `{ text, module, culture, kind, shape, gender, language, tones }`.

---

## 14. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Data and epithets engine.** `bynames.json` (all of §4–§9, §11), the shared engine, epithets | §15.1–§15.3 pass |
| M2 | **Titles and family names.** §6, §7, §10 | §15.4–§15.6 pass |
| M3 | **Sentences, modules, presets.** §1, §2, §12, safeguard packs and command | §15.7–§15.8 pass; each module generates in the app |

---

## 15. Tests (`tests/bynames.test.ts`)

### 15.1 Data

- 20 cultures in the §4.1 order. Every kind, shape and list named in this brief exists; all weights > 0.
- No word contains `(`, `)`, `§`, `×` or `?`; no note text from this brief leaked into data (check for "blocked", "Drop", "Remove", "note" as words).
- Every native-form entry has an English form. Every gender pair has a form for each gender or an explicit "—".

### 15.2 Determinism and coverage

- Same options and seed give the same results.
- Every module × culture × available setting × gender × language (where shown) × source (placeholder, none): a batch of 20 returns 20 unique non-empty results, or the shortfall notice only where a culture has a single small list (Bantu inherited: at most 4).

### 15.3 Epithets

- 5,000 epithets with tone Any, plain, grand and strange: no `epBodyMind` word and no † compound.
- With tone light: at least one appears in 2,000.
- Joins: `the` → "[name] the Bold"; `bare` → "[name] Ironhand"; `comma` → "[name], the Tiger of the Western Hills".
- Aztec day names: English "One Reed", native "Ce Acatl".

### 15.4 Titles

- Men never get a women-only form and vice versa (2,000 each, every culture).
- Steppe Khan with a name: "[name] Khan".
- Full styles: 2–4 parts, first part a rank, no repeated content word.
- Native mode: `King` in Norse renders "Konungr"; an entry with no native form stays English.
- Norman native place: "Duc de Fenwick", "d'" before a vowel.

### 15.5 Family names

- Slavic endings (§7.4): Ivan → Ivanovich / Ivanovna; Sergei → Sergevich / Sergevna; Ilya → Ilyich / Ilyichna.
- Norse: Sigurd → Sigurdsson / Sigurdsdóttir; a name ending in s: Hans → Hansson / Hansdóttir.
- Gaelic: Brannoc → MacBrannoc / NicBrannoc; Welsh: Owain → ab Owain.
- Family-first: Chinese "[name]" result reads "Wang [name]".
- Indian: 5,000 family names contain no occupational word and no word from §11.5.
- English mode Chinese: only the 15 pairs appear.

### 15.6 Safeguards

- 5,000 per module per culture: 0 block-list matches, 0 banned words, 0 sacred-specific forms (§11.4).
- Pack names: a test pack containing "Æthelred" never yields "Æthelred the Unready".

### 15.7 Sentence

- Default epithets text: "General-themed epithets of any kind for a fantasy world of historic or low fantasy, of any tone, for anyone, after a placeholder name."
- Language link hidden for General and for epithets (except Aztec); shown for titles and family names with a culture.
- Pack chosen with Male/Female headings: the section defaults to the gender's heading.

### 15.8 Presets

Round-trip; unknown keys default with a problem; `source: pack` with a missing pack runs with placeholders.

---

## 16. Parked

- Epithets inside group names' `{person}`.
- Native forms for Aztec and Maya family names; Akan day names (Kwame, Kofi) as West African bynames.
- More cultures (Polynesian chiefly titles, Mongol clan names, Hungarian and other family-first systems).
- A "family" series: a father, his sons and their bynames in one set.
