# Named things – brief (first release)

This brief adds a new switcher group, **named things**, with three modules that share one engine. They name the objects of a world in modern English:

- **arms and armour:** *Helm-Splitter*, *Wolf's Tooth*, *the Answerer*, *Joyous*, *Battle-Boar*, *Mad Kate*, *Long Tom of Saltgate*
- **treasures and regalia:** *the Iron Crown of [realm]*, *River of Light*, *the Luck of Harrow*, *the Calling Horn*, *Great Nell*, *the Hand of Saint Aldhelm*
- **books and writings:** *Annals of Saltgate*, *the Black Book of Fenwick*, *Lay of [hero]*, *Dooms of [ruler]*, *Mirror of Princes*-style titles, *the Saltgate Courier and Advertiser*

It is built on route names (RN), money and coins (MC), events and eras (EE), group names (GN), tone and series (TS), bynames and titles (BT), deities and sacred places (DS) and realms and polities (RP). It uses the **shared vocabulary** and vocabulary packs (RN §3), so later research adds words without code.

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow MC, then EE, then RN, then GN and TS. Reuse existing helpers. All output is in modern English.

Two rules run through the whole brief:

1. **Real and famous things are never produced.** No real sword, jewel, crown, bell, gun or book, and no well-known fictional one, comes out of the generator, in its own name or translated (§13.1). The real traditions shape the names; they are not the names.
2. **English only.** No native-sounding or invented-language names. Real naming habits are carried over by meaning: the Norse *Leggbitr* teaches the shape *{target}-Biter*, not the word.

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | A new switcher group, **named things**, after vehicles; three modules `armsNames`, `treasureNames`, `bookNames` |
| Shared engine | `src/things/`: one engine, one sentence builder with a module switch |
| Cultures | BT's twenty (§3.1) |
| Eras, fantastic | As RN §4.3 (seven eras, steampunk in the steam age) |
| Owner | A link: anyone · people from a pack · no one (§2.3) |
| Description | A link: names only · with what they are (*Wolf's Tooth, sword of [hero]*) (§10) |
| Traditions | Shape **families** (deed, agent, mood, kenning…) weighted by culture (§8), so each culture names things in its own way |
| Magic items | Behind the fantastic switch (§9.1); grimoires and mirrors are fantastic-only kinds, except where §4 says otherwise |
| Series | **Parked** ("as one hoard", §17). Every name is separate. |
| Native forms | None (English only) |

---

## 1. Group and modules

### 1.1 Sections and group

- Add `armsNames` ("arms and armour", Lucide icon `sword`), `treasureNames` ("treasures and regalia", Lucide `crown`) and `bookNames` ("books and writings", Lucide `book-open`) to `NameForgeSection`.
- Add a `SectionGroup` **`namedThings`**, label **"named things"**, holding the three in that order. Its group icon is Lucide `gem` (set in `GROUP_ICONS`).
- Insert `namedThings` in `SWITCHER_ORDER` after `vehicles`, before `advanced`.
- Append the three to `SECTION_ORDER` after the vehicle sections, before `nameAgeing`.
- `groupModule` default for the new group: `armsNames`.
- History routing (`historySection`): rows starting `arms and armour`, `treasures and regalia` and `books and writings` go to their modules.

### 1.2 History label

`{module label} · {era label} · {culture label}`, then ` · {kind}` when not Any, ` · steampunk` / ` · fantastic`, ` · {tone}`, ` · owner: pack` / ` · owner: none` when not anyone, and ` · described` when the description is on.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/settlement-vocab.json` | The new pools (§5) |
| `src/data/named-things.json` | Kinds, object words, families, culture leanings, shapes, genre additions, describe words, safeguards |
| `src/things/engine.ts` | Generation (§6), rendering (§11), description (§10). No Obsidian imports. |
| `src/things/sentence.ts` | The sentence (§2), for all three modules |
| `docs/vocabulary-pools.md` | Rows for the new pools |
| `tests/namedThings.test.ts` | §16 |

Add this brief to `docs/` as `named-things-brief.md`.

---

## 2. The sentence

### 2.1 Shape

> ‹Norse› ‹arms and armour of any kind› of the ‹medieval› era, in a ‹realistic› world, ‹of any tone›, belonging to ‹anyone›, with ‹placeholders for› people and places, ‹names only›.

Treasures read the same. Books read "by or about ‹anyone›" in place of "belonging to ‹anyone›":

> ‹Norman & British› ‹books and writings of any kind› of the ‹early modern› era, in a ‹realistic› world, ‹of any tone›, by or about ‹anyone›, with ‹invented› people and places, ‹with what they are›.

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | the culture label | §3.1 | `norman-british` |
| `kind` | "{module} of any kind" or the kind's plural (§4) | Any, then the kinds offered for the culture, era and fantastic switch (§4) | any |
| `era`, `fantastic` | as RN §2.2 | as RN | MD, realistic |
| `tone`, `people` | as TS, GN | | any, placeholders |
| `owner` | "belonging to ‹anyone›" / "by or about ‹anyone›" · "‹people from ‹pack››" · "‹no one›" | the three; choosing "people from a pack" opens the pack picker, as BT §2.4, and the pack's `##` selector sentence where it has headings | anyone |
| `describe` | "‹names only›" · "‹with what they are›" | the two | names only |

- **Tooltips:**
  - kind: the kind's description
  - owner: "Who the things belong to, or who wrote and is written about. Anyone follows the people link; a pack gives its names; no one leaves people out of the names."
  - describe: "Add what each thing is, and whose (Wolf's Tooth, sword of [hero])."
  - the rest as RN and GN.

### 2.3 Owner

- **Anyone:** person tokens (§3.2) follow the people link: placeholders, or invented people from `groupPerson(setting, surnames, rng, animals)`.
- **People from a pack:** person tokens draw from the pack through BT's draw (`host.packDraw`), the section by the `##` selector, or the whole pack. Places still follow the people link. If the pack gives nothing, a notice as BT, and placeholders are used.
- **No one:** shapes with a person token have weight 0, and the description has no owner (§10).

### 2.4 Resets

- **Culture, era or fantastic changed:** a kind not offered resets to Any.
- **Module changed:** kind resets to Any; every other field is kept.

### 2.5 Plain text, state, presets

As GN §2.5–§2.6. Each module keeps its own state. Presets in §14.

---

## 3. Cultures and sources

### 3.1 Cultures

BT's twenty, in BT's menu order: general, anglo-saxon, norse, celtic, norman-british, roman, greek-byzantine, slavic, steppe, arabic-persian, indian, chinese, japanese, korean, egyptian, ethiopian, bantu, west-african, aztec, maya. The money-only cultures are not offered.

**Christian cultures** are those for which DS's `isChristianCulture(culture, era)` is true.

### 3.2 Tokens

**Person tokens** (governed by the owner link, §2.3):

| Token | Placeholder | Notes |
|---|---|---|
| `{hero}` | `[hero]` | arms; the subject of lays and sagas |
| `{ruler}` | `[ruler]` | regalia; laws |
| `{author}` | `[author]` | books |
| `{smith}` | `[smith]` | the maker of arms and treasures |

Possessives of person tokens follow GN §11 (*[hero]'s*, *Old Harrow's*).

**Other tokens** (governed by the people link):

| Token | Source |
|---|---|
| `{house}` | one BT family name (module `familyNames`, source none) for the culture and era. Placeholder `[house]`. |
| `{holy}` | GN §8.2 saints, christian cultures only. Placeholder `[holy person]`. |
| `{god}` | DS `deityTitle(...)`, its "the" removed for possessives. Placeholder `[god]`. |
| `{town}` | `groupTown(setting, townSource(culture), rng)`. Placeholder `[place]`. |
| `{realm}` | one realms name, short form, territorial, for the culture and era. Placeholder `[realm]`. |
| `{folk}` | one tribes and kin groups name without its "the", as RN. Placeholder `[folk]`. |
| `{dynasty}` | placeholder `[dynasty]` only |
| `{figure}` | RN §4.2 (BT ranks, English men's form) |
| `{beast}` | BT `cultureAnimals(culture)` ×3, then `worldAnimals(culture)` ×1 |
| `{colour}`, `{number}`, `{numberWord}`, `{compass}`, `{star}`, `{spaceLand}` | group-names.json lists, with their rules |
| `{metal}` | MC `coinMetal` entries, without their tiers; the fantastic and NF–IS entries follow their own tags |

---

## 4. Kinds

### 4.1 Arms and armour

| Key | Menu | Plural (sentence) | Description | AN | MD | EM | ST | MO | NF | IS |
|---|---|---|---|--:|--:|--:|--:|--:|--:|--:|
| `sword` | Swords | swords | Swords, sabres and blades | 30 | 30 | 25 | 15 | 8 | 10 | 10 |
| `axe` | Axes | axes | Axes, bills and halberds | 12 | 12 | 6 | 2 | 1 | 0 | 0 |
| `spear` | Spears and polearms | spears and polearms | Spears, lances and pikes | 15 | 12 | 6 | 1 | 0 | 0 | 0 |
| `bow` | Bows | bows | Bows, crossbows and slings | 10 | 8 | 4 | 1 | 0 | 0 | 0 |
| `mace` | Hammers and maces | hammers and maces | Hammers, maces, clubs and flails | 6 | 6 | 3 | 0 | 0 | 0 | 0 |
| `knife` | Knives and daggers | knives and daggers | Knives, daggers and dirks | 8 | 8 | 8 | 8 | 8 | 8 | 8 |
| `shield` | Shields | shields | Shields, bucklers and targes | 12 | 10 | 4 | 0 | 0 | 0 | 0 |
| `armour` | Helms and armour | helms and armour | Helmets, mail, plate and suits | 7 | 10 | 10 | 3 | 3 | 12 | 12 |
| `gun` | Guns | guns | Muskets, rifles, pistols and sidearms | 0 | 0 | 15 | 30 | 35 | 45 | 45 |
| `cannon` | Great guns | great guns | Bombards, cannon and mortars | 0 | 4 | 19 | 40 | 45 | 25 | 25 |

Culture multipliers on the era weights:

| Culture | Changes |
|---|---|
| norse, anglo-saxon | axe ×2 |
| steppe, japanese, korean | bow ×2 |
| norman-british, celtic | bow ×1.5 |
| bantu, west-african, greek-byzantine | spear ×1.5 |
| aztec, maya | sword ×0.5, spear ×1.5, mace ×2, shield ×1.5; gun and cannon in EM ×0.5 |
| bantu, west-african | shield ×1.5; gun and cannon in EM ×0.5 |

A kind whose final weight is 0 is not offered.

### 4.2 Treasures and regalia

| Key | Menu | Plural | Description | AN | MD | EM | ST | MO | NF | IS |
|---|---|---|---|--:|--:|--:|--:|--:|--:|--:|
| `crown` | Crowns and circlets | crowns and circlets | Crowns, circlets, diadems and caps of state | 15 | 15 | 15 | 15 | 12 | 6 | 6 |
| `ring` | Rings | rings | Rings and signets | 10 | 10 | 10 | 10 | 10 | 8 | 8 |
| `jewel` | Gems and jewels | gems and jewels | Named stones and jewels | 5 | 10 | 12 | 14 | 14 | 12 | 12 |
| `torc` | Torcs and brooches | torcs, necklaces and brooches | Torcs, necklaces, collars and brooches | 8 | 8 | 4 | 4 | 4 | 2 | 2 |
| `cup` | Cups and cauldrons | cups, horns and cauldrons | Cups, drinking horns, bowls and cauldrons | 10 | 10 | 8 | 6 | 4 | 4 | 4 |
| `instrument` | Harps and horns | harps, horns and drums | Harps, horns, drums and gongs | 6 | 6 | 6 | 4 | 4 | 2 | 2 |
| `sceptre` | Sceptres and staves | sceptres, rods and staves | Sceptres, rods, staves and orbs | 6 | 6 | 6 | 6 | 4 | 3 | 3 |
| `banner` | Banners and standards | banners and standards | Banners, standards and flags | 8 | 8 | 8 | 8 | 6 | 10 | 10 |
| `seat` | Stones and thrones | stones and thrones | Thrones, seats and crowning stones | 5 | 5 | 5 | 5 | 3 | 2 | 2 |
| `bell` | Bells | bells | Bells and gongs | 0 | 6 | 6 | 6 | 4 | 2 | 2 |
| `relic` | Relics | relics | Relics of holy people and ancestors | 0 | 6 | 6 | 2 | 2 | 1 | 1 |
| `mirror` | Mirrors and orbs | mirrors and orbs | Mirrors, scrying glasses and orbs | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

- `bell` in AN: chinese and korean 5.
- `relic`: christian cultures ×2.
- `mirror`: realistic, chinese, aztec, maya and egyptian 4 in every era; in a **fantastic** world 6 for every culture.
- Steppe: banner ×2. Bantu, west-african: seat ×2 (stools), instrument ×2 (drums). Celtic: torc ×2, instrument ×1.5 (harps).

### 4.3 Books and writings

| Key | Menu | Plural | Description | AN | MD | EM | ST | MO | NF | IS |
|---|---|---|---|--:|--:|--:|--:|--:|--:|--:|
| `chronicle` | Chronicles and histories | chronicles and histories | Annals, chronicles and histories | 20 | 20 | 20 | 15 | 15 | 10 | 10 |
| `lay` | Lays, sagas and songs | lays, sagas and songs | Epics, lays, sagas, tales and ballads | 20 | 20 | 15 | 10 | 10 | 8 | 8 |
| `law` | Laws and records | laws, charters and records | Law codes, charters, statutes, rolls and registers | 15 | 15 | 15 | 15 | 15 | 10 | 10 |
| `holy` | Holy books | holy books | Scriptures of invented faiths, and Christian manuscripts in the Christian cultures | 10 | 10 | 10 | 8 | 6 | 6 | 6 |
| `lore` | Learning and lore | learning and lore | Herbals, bestiaries, almanacs, maps, tables and treatises | 8 | 12 | 15 | 15 | 12 | 10 | 10 |
| `grimoire` | Grimoires | grimoires | Books of magic | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `paper` | Papers and periodicals | papers and periodicals | Newspapers, gazettes and magazines | 0 | 0 | 8 | 25 | 25 | 15 | 15 |
| `log` | Logs and archives | logs and archives | Ships' logs, mission records and archives | 0 | 0 | 0 | 0 | 0 | 25 | 25 |

- `grimoire`: 10 in every era in a **fantastic** world; otherwise not offered.
- `paper` in MD: chinese 4 (court gazettes).
- Celtic, AN: chronicle and law ×0.3 (oral learning). Bantu and west-african, AN–MD: chronicle ×0.5.

---

## 5. New pools (settlement-vocab.json)

New entry key, read only by this module:

| Key | Meaning | Default |
|---|---|---|
| `k` | kinds the entry fits (kind keys from §4) | all kinds of the pool's module |

Other modules ignore `k`.

### 5.1 Object words (`thingObject`)

Each kind's object word, drawn for `{object}`. Entries carry `k`.

| Kind | Words |
|---|---|
| sword | Sword ×3, Blade ×3, Brand (AN–MD), Broadsword (MD–EM), Longsword (MD), Falchion (MD), Sabre (EM–ST; steppe, arabic-persian, slavic ×2), Rapier (EM), Smallsword (EM) |
| axe | Axe ×3, Battleaxe, Hatchet, Bill (MD–EM), Halberd (MD–EM) |
| spear | Spear ×3, Lance (MD–EM), Pike (MD–EM), Javelin, Glaive (MD–EM) |
| bow | Bow ×3, Longbow (norman-british, celtic), Crossbow (MD–EM; chinese AN), Sling (AN–MD) |
| mace | Hammer ×2, Mace ×2, Club (aztec, maya, bantu, west-african ×3), Maul, Flail (MD), Warhammer (MD–EM) |
| knife | Knife ×2, Dagger ×2, Dirk (celtic, norman-british), Stiletto (EM), Bayonet (EM–ST), Blade (NF–IS) |
| shield | Shield ×3, Buckler (MD–EM), Targe (celtic ×2), Board |
| armour | Helm ×3, Helmet, Mail ×2, Hauberk (MD), Breastplate (EM), Coat, Harness (MD–EM), Armour, Suit (NF–IS ×3), Shell (NF–IS) |
| gun | Gun ×2, Musket (EM–ST ×2), Rifle (ST on ×2), Pistol, Carbine (ST–MO), Fowler (EM), Blunderbuss (EM; light), Revolver (ST), Sidearm (NF–IS ×2) |
| cannon | Gun ×3, Cannon ×2, Bombard (MD–EM ×2), Culverin (EM), Mortar, Great Gun, Howitzer (ST–MO), Battery (NF–IS) |
| crown | Crown ×4, Circlet, Diadem, Cap (slavic ×3, steppe), Coronet (EM on) |
| ring | Ring ×4, Signet, Seal Ring, Band |
| jewel | Jewel ×2, Stone, Gem, Pearl ×2, Ruby, Emerald, Sapphire, Diamond (EM on; indian MD on), Opal, Jade (chinese, korean, aztec, maya ×3), Turquoise (aztec, arabic-persian ×2), Amber (norse, slavic, anglo-saxon ×2) |
| torc | Torc (celtic ×3; AN–MD), Necklace, Brooch ×2, Collar, Chain, Pendant, Arm-Ring (norse, anglo-saxon) |
| cup | Cup ×3, Horn ×2 (norse, anglo-saxon, celtic ×2), Cauldron (celtic ×2), Bowl, Goblet, Chalice (christian), Mazer (MD; norman-british), Ewer |
| instrument | Harp ×2 (celtic ×2), Horn ×2, Drum ×2 (bantu, west-african ×3), Lyre (greek-byzantine, roman, anglo-saxon), Trumpet, Gong (chinese, korean ×2), Flute |
| sceptre | Sceptre ×3, Rod ×2, Staff ×2, Mace, Orb |
| banner | Banner ×3, Standard ×2, Flag (EM on), Pennant, Ensign (EM on), Tail Standard (steppe ×2) |
| seat | Throne ×3, Stone ×2 (celtic, norman-british, anglo-saxon ×2), Seat, Chair, High Seat (norse ×2), Stool (bantu, west-african ×3) |
| bell | Bell ×4, Great Bell, Chime, Gong (chinese, korean, japanese) |
| relic | (relic shapes name their parts directly, §7.2) |
| mirror | Mirror ×3, Glass, Orb ×2, Eye, Sphere, Bowl |
| chronicle | Annals ×2, Chronicle ×3, History ×2, Book, Records, Roll |
| lay | Lay ×2, Song ×3, Saga (norse ×4), Tale ×2, Ballad (EM on ×2), Cycle, Deeds, Lament |
| law | Laws ×3, Dooms (anglo-saxon ×4), Code ×2, Charter ×2, Statute, Assize (MD), Customs, Edict, Ordinances, Roll |
| holy | Book ×3, Scrolls, Sayings, Hymns, Songs, Teachings, Testament |
| lore | Herbal, Bestiary, Almanac (EM on), Tables, Atlas (EM on), Map, Canon, Compendium (EM on), Treasury, Mirror, Garden, Key, Classic (chinese, korean ×3), Book |
| grimoire | Grimoire ×2, Book ×2, Key, Codex, Pages |
| paper | Gazette ×2, Courier ×2, Herald ×2, Chronicle, Post ×2, Echo, Clarion, Sentinel, Observer, Advertiser, Intelligencer (EM–ST), Argus, Messenger, Register, Bulletin, Mercury |
| log | Logs ×2, Archive, Records, Manifest, Databank |

### 5.2 Naming pools

| Pool | Entries |
|---|---|
| `deedTarget` | Leg, Foot, Knee, Beard, Helm ×2, Shield ×2, Mail, Bone ×2, Skull, Neck, Quern, Oak, Iron, Stone, Wolf, Boar, Gate (cannon, mace), Wall (cannon), Castle (cannon), Province (cannon; japanese ×3), Tower (cannon), Ship (cannon, bow). Fantastic (`h: true`): Troll, Giant, Dragon, Demon, Ghost, Wyrm. |
| `deedVerb` | Biter ×3 (sword, axe, knife), Cutter ×3 (sword, knife), Splitter ×2 (axe, sword), Breaker ×3 (mace, axe, cannon), Cleaver (axe, sword), Piercer (spear, bow, knife), Crusher (mace, cannon), Render (grim), Feeder (in kennings only, §7.1), Taker, Ender (grim) |
| `thingAgent` | Answerer, Cleaver, Piercer, Thruster, Nailer, Sharp, Avenger (grim), Reaver (grim), Thunderer (cannon, gun ×2), Roarer (cannon), Persuader (light), Peacekeeper (light; gun), Widowmaker (grim), Harvester (grim), Watcher (shield, armour), Warder (shield, armour), Keeper (shield), Singer (bow, sword), Whisperer (knife; strange), Trusty (light) |
| `thingMood` | Joyous ×2, Precious ×2, Wrath ×2, Faithful ×2, Wakeful, Patience (light), Mercy, Sorrow (grim), Hope, Pride, Vengeance (grim), Doubt (strange), Delight, Fury, Grief (grim), Constant, Merry (light) |
| `kenningFirst` | Battle ×3, War ×3, Wound ×2 (grim), Slaughter (grim), Sword, Spear, Storm, Blood (grim), Raven, Wolf, Sea, Shield |
| `kenningSecond` | sword: Flame, Snake, Icicle, Fire, Tongue; axe: Ogress, Troll, Witch, Hag; spear: Snake, Fish, Ash; shield: Moon ×2, Board, Wall, Roof, Sun; armour: Boar ×2, Swine, Hood, Shirt, Net; bow: Bough, Elm; knife: Thorn, Tooth. Kenning `Feeder` shapes: Raven-Feeder, Wolf-Feeder, Eagle-Feeder (grim) |
| `thingBodyPart` | Tooth ×2, Fang, Claw, Talon, Sting, Tongue, Horn, Tusk, Beak, Wing (bow), Scale (shield, armour), Hide (armour), Shell (shield), Eye (jewel, mirror), Heart (jewel), Tear (jewel; strange) |
| `thingQuality` | Long, Black ×2, Red, Grey, White, Old, Broken (grim), Bright, Short, Iron, Silver, Golden, Cold, Patient, Hungry (grim), Lucky (light) |
| `thingVirtue` | Mercy ×2, Justice ×2, State, Law, Peace, Honour, Kings, Equity, Oaths, Fate, Judgement, Vengeance (grim) |
| `lightPlace` | River, Lake, Crown, Eye, Moon, Glory, Fountain, Garden, Star, Sun, Flame, Mountain, Sea |
| `thingSound` | Calling, Ringing, Roaring, Waking, Weeping (grim), Singing, Thundering, Whispering (strange), Laughing (light) |
| `thingFate` | Kings, Fate, Oaths, Crowning, Judgement, Speaking (strange), Choosing |
| `thingPlenty` | Plenty, Rebirth, Wisdom, Hunger (grim), Feasting, Plenty and Want |
| `thingFlower` | Rose, Lily, Plum, Peony, Orchid, Thistle (norman-british, celtic), Poppy |
| `thingGiven` | women (`f`): Bess, Meg, Mag, Nell, Kate, Moll, Bet, Sal, Peg, Madge, Bertha, Martha, Mary, Joan, Agnes. Men (`m`): Tom ×2, Jack, Ned, Will, Dick, Hal, Bill, Harry, George, Kit. |
| `thingTemper` | Mad ×2, Lazy, Fat, Roaring, Grumbling, Sulky (light), Black, Red, Brown, Old ×2, Big, Long (with `m` only) |
| `thingDomain` | Storms, Fire, Frost, Stars, the Sea, the Dead (grim), Dreams, Wisdom, Night, the Moon, the Sun, Shadows, Healing, Secrets, Ash, Bones (grim), Thunder, Winds |
| `scholarGroup` | Masters, Monks, Scholars, Clerks, Sages, Elders, Brothers |
| `bookSubject` | Princes ×2, Kings, the World, the Stars, Herbs, Beasts, the Seas, Healing, Ladies, Fools (light), Husbandry, the Hunt, War, Trade, Weights and Measures, Wonders |
| `bookPlace` | Meadows, Mines, Gardens, Rivers, Seas, Fountains |
| `bookTreasure` | Gold, Gems, Pearls, Silver, Coral, Musk, Amber |
| `bookOpening` | Hear Me, Long Ago, In the Old Days, When the World Was Young, Listen, In Those Days, Of Kings and Kin, Before the Ice (strange) |
| `sageWord` | Teacher, Sage, Master, Elder, Seer, Hermit, Pilgrim |
| `bookSecret` | Night, Ash, Bones (grim), Ashes, Stars, Keys, Names, Tides, Whispers (strange) |
| `officeWord` | Exchequer, Treasury, Admiralty, Chancery, Council, Court, Wardrobe, Household |

Every pool is open to vocabulary packs (RN §3.3). Pack lines may add `k` tags with tones in round brackets: `- Raven (shield, banner, grim)`.

---

## 6. Generation pipeline

```
module + culture + era + fantastic → kind (chosen, or §4 weights)
    ↓
shape        (module shapes §7 for the kind × family leaning §8 × tone; genre §9)
    ↓
tokens → rendering (§11) → safeguards (§13) → description (§10)
```

- A shape's **kinds** column lists the kinds it serves; `*` is every kind of the module.
- `{object}` is drawn from the kind's object words (§5.1) at the shape's era and culture.
- A shape with a person token is weight 0 when the owner is no one (§2.3).
- Failure and batches as GN §4. Cap: 8 words.

---

## 7. Shapes

Columns: family (§8); weight; kinds; eras; tone; example. Cultures not listed are all. Culture-only shapes are marked with their cultures.

### 7.1 Arms and armour

| Shape | Family | Weight | Kinds | Eras | Tone | Example |
|---|---|--:|---|---|---|---|
| `{deedTarget}-{deedVerb}` | deed | 14 | sword, axe, knife, mace, spear, cannon (each word's `k`) | all | – | Helm-Splitter, Bone-Breaker, Castle-Breaker |
| `the {thingAgent}` | agent | 12 | * (each word's `k`) | all | – | the Answerer, the Thunderer |
| `{thingMood}` | mood | 10 | sword, axe, spear, bow, knife, gun | all | – | Joyous, Faithful |
| `{kenningFirst}-{kenningSecond}` | kenning | 8 | sword, axe, spear, shield, armour, bow, knife | AN–MD | – | Battle-Boar, War-Board |
| `{beast}-Feeder` | kenning | 3 | sword, axe, spear | AN–MD | grim | Raven-Feeder |
| `{beast:poss} {thingBodyPart}` | beast | 10 | * (part `k`) | all | – | Wolf's Tooth |
| `Little {beast}` | beast | 4 | sword, knife, bow, gun | all | – | Little Crow |
| `the {colour} {beast}` | beast | 4 | * | all | – | the Red Boar |
| `{beast} {water}` (`{water}`: Spring, Abyss, Gorge, Pool, Peak, Gate) | beast | 4 | sword | all | – | Tiger Spring (chinese, korean, japanese ×3; others ×0.3) |
| `{hero:poss} {object}` | owner | 10 | * | all | plain | Harald's Blade |
| `{deedTarget}-Bane` (fantastic targets only, or King, Tyrant, Raider) | deed | 4 | sword, axe, spear | all | – | Tyrant-Bane |
| `{smith:poss} Work` / `the {smith} {object}` | maker | 4 | sword, knife, armour, gun | all | – | [smith]'s Work |
| `{object} of {thingVirtue}` | virtue | 6 | sword, axe, mace | all | grand | Sword of Mercy |
| `{object} of Light` / `{object} of the Dawn` | light | 3 | sword, spear | all | grand | Spear of the Dawn |
| `{colour}-Hilt` / `{colour}-Haft` / `{colour}-Rim` / `{colour}-Crest` | colour | 6 | sword, knife (Hilt); axe, spear (Haft); shield (Rim); armour (Crest) | all | – | White-Hilt is blocked (§13.1); Red-Haft |
| `{thingTemper} {thingGiven:f}` | nickname | 10 | gun, cannon | EM on | light | Mad Kate, Brown Nell |
| `Long {thingGiven:m}` / `Old {thingGiven}` / `Big {thingGiven}` | nickname | 8 | gun, cannon | EM on | light | Long Ned |
| `{town} {thingGiven:f}` | nickname | 4 | cannon | MD–ST | – | Fenwick Meg |
| `{thingGiven} of {town}` | nickname | 3 | cannon | MD–ST | – | Tom of Saltgate |
| `the Great {town} {object}` | place | 6 | cannon | MD–ST | grand | the Great Saltgate Bombard |
| `the {town} {object}` | find | 8 | * | ST on | plain | the Ashby Helmet |
| `the {figure:poss} {object}` | owner | 4 | * | all | grand | the Earl's Sword |
| `{god:poss} {object}` | god | 4 | * | AN–MD | grand | the Storm Lord's Spear |
| `{holy:poss} {object}` | holy | 3 | sword, spear, banner | MD–EM | – | Saint Edmund's Lance |
| `the {thingQuality} {object}` | plain | 6 | * | all | plain | the Long Yew, the Grey Blade |
| `Lord of the {fieldWord}` (`{fieldWord}`: Field ×2, Plain, Walls, Gate, Battle) | title | 6 | cannon | MD–ST | grand | Lord of the Walls (indian, arabic-persian ×3; others ×0.3) |
| `{quality2} Great General` (`{quality2}`: Divine Might, Thunder, Victorious, Ten Thousand Victories, Peace-Bringing) | title | 10 | cannon | MD–ST | grand | Thunder Great General (chinese, korean only) |
| `the {beast}` | beast | 4 | cannon, gun | EM–ST | – | the Basilisk is blocked; the Wolf |

### 7.2 Treasures and regalia

| Shape | Family | Weight | Kinds | Eras | Tone | Example |
|---|---|--:|---|---|---|---|
| `{object} of {ruler}` | owner | 10 | * but relic | all | – | Crown of [ruler] |
| `{ruler:poss} {object}` | owner | 8 | * but relic | all | – | [ruler]'s Cap |
| `the {metal} {object}` | plain | 8 | crown, ring, cup, sceptre, seat, torc, bell, mirror | all | plain | the Iron Crown is blocked; the Silver Rod |
| `the {metal} {object} of {realm}` / `… of {town}` | place | 8 | crown, sceptre, seat, ring | all | grand | the Gold Crown of Ashmark |
| `the {stateWord} {object}` (`{stateWord}`: Imperial, State, Great, High, Coronation, Holy (christian)) | virtue | 6 | crown, sceptre, seat, ring, banner | all | grand | the Coronation Ring |
| `{object} of {thingVirtue}` | virtue | 6 | sceptre, ring, seat | all | grand | Rod of Equity |
| `{lightPlace} of Light` | light | 12 | jewel ×3, crown, mirror | all | grand | River of Light |
| `Star of the {compass}` / `Star of {realm}` / `Star of {town}` | light | 6 | jewel | EM on | – | Star of the North |
| `{ruler:poss} {object}` / `the {figure:poss} {object}` | owner | 6 | jewel | all | – | the Duke's Pearl |
| `the {colour} {beast}` | beast | 4 | jewel, ring, banner | all | – | the Blue Heron |
| `Eye of the {beast}` / `the {beast:poss} {thingBodyPart}` | beast | 5 | jewel, mirror | all | strange | Eye of the Heron |
| `Moon of {town}` / `the {town} {object}` | place | 6 | jewel | all | – | Moon of Saltgate |
| `the Luck of {house}` | luck | 6 | cup, ring, jewel, bell | MD on | – | the Luck of Harrow |
| `Cauldron of {thingPlenty}` | luck | 4 | cup | AN–MD | – | Cauldron of Rebirth |
| `Cup of {figure}` / `{ruler:poss} Horn` | owner | 6 | cup, instrument | all | – | Cup of the Earl |
| `the {thingSound} {object}` | mood | 6 | instrument, bell | all | – | the Calling Horn |
| `the {object} of {town}` | place | 4 | instrument, bell, seat | all | – | the Harp of Fenwick |
| `{beast} Throne` / `{thingFlower} Throne` | beast | 6 | seat | all | grand | Crane Throne |
| `the {colour} Seat` / `High Seat of {realm}` | colour | 4 | seat | all | – | the Grey Seat |
| `Stone of {thingFate}` | virtue | 4 | seat | AN–MD | grand | Stone of Oaths |
| `Great {thingGiven}` / `Old {thingGiven}` / `{thingGiven} of {town}` | nickname | 10 | bell | MD on | – | Great Nell, Tom of Ashby |
| `the {figure} Bell` / `the {holy} Bell` | owner / holy | 4 | bell | MD on | – | the Bishop Bell |
| `the {beast} Banner` / `the {colour} {beast}` | beast | 8 | banner | all | – | the Wolf Banner |
| `the {colour} Flame` / `the {colour} Banner` | colour | 6 | banner | all | – | the Silver Flame |
| `the {numberWord} {colour} Banners` | colour | 4 | banner | AN–MD | grand | the Seven Black Banners (steppe ×3) |
| `Banner of {holy}` / `{holy:poss} Banner` | holy | 4 | banner | MD–EM | – | Banner of Saint Aldhelm |
| `the {figure:poss} Standard` | owner | 4 | banner | all | grand | the Khan's Standard |
| `the {relicPart} of {holy}` / `{holy:poss} {relicPart}` (`{relicPart}`: Hand ×2, Head, Tooth, Finger, Arm, Heart, Bones, Bell (celtic ×3), Staff, Cloak, Shrine) | holy | 20 | relic | MD on | – | the Hand of Saint Aldhelm |
| `the {relicPart} of {ruler}` / `Bones of the {figure}` / `{ruler:poss} {relicPart}` | owner | 15 | relic | all | – | Bones of the First King |
| `the {colour} {object}` | colour | 5 | * but relic | all | – | the Black Ring |
| `the {town} {object}` | find | 8 | * but relic | ST on | plain | the Ashby Torc |
| `{god:poss} {object}` | god | 4 | * but relic | AN–MD | grand | the Lady of Ash's Mirror |
| `Mirror of {domainMirror}` (`{domainMirror}`: Truth, Souls (strange), Far Seeing, the Moon, Days to Come, the Dead (grim)) | light | 8 | mirror | all | strange | Mirror of Far Seeing |
| `the {thingQuality} Glass` / `Orb of {thingDomain}` | mood | 6 | mirror | all | strange | the Cold Glass, Orb of Tides |

Non-christian cultures draw relic shapes only from the owner family (founders and ancestors); `{holy}` is christian only.

### 7.3 Books and writings

| Shape | Family | Weight | Kinds | Eras | Tone | Example |
|---|---|--:|---|---|---|---|
| `Annals of {town}` | place | 12 | chronicle | all | plain | Annals of Fenwick |
| `Annals of the {numberWord} {scholarGroup}` | place | 4 | chronicle | MD–EM | – | Annals of the Three Clerks (celtic ×3) |
| `Chronicle of {town}` / `the {town} Chronicle` | place | 10 | chronicle | all | plain | the Ashby Chronicle |
| `the {colour} Book of {town}` | colour | 8 | chronicle, law | MD on | – | the Black Book of Fenwick (celtic ×3, norman-british ×2) |
| `Book of {town}` | place | 6 | chronicle | MD on | – | Book of Saltgate (celtic ×2) |
| `History of the {numberWord} {realmWordPl}` (`{realmWordPl}`: Kingdoms, Realms, States, Houses) | place | 6 | chronicle | MD on | – | History of the Five Realms (chinese, korean ×3) |
| `Record of {oldThings}` (`{oldThings}`: Former Days, Old Things, Bygone Ages, the Elders) | place | 4 | chronicle | AN–EM | – | Record of Former Days (japanese, chinese ×3) |
| `Tale of {bygone}` (`{bygone}`: the Old Years, Former Times, the First Princes) | place | 4 | chronicle | MD | – | Tale of the First Princes (slavic ×3) |
| `Secret History of the {folk}` | place | 4 | chronicle | MD | – | Secret History of the Hill Folk (steppe ×3) |
| `Book of Landtakings` / `Book of the {folk}` | place | 4 | chronicle | MD | – | (norse ×3) |
| `Book of the Kings of {realm}` | owner | 4 | chronicle | AN–EM | grand | (arabic-persian ×3) |
| `{author:poss} History` / `History of {realm}` | owner | 6 | chronicle | all | plain | [author]'s History |
| `the {dynasty} Annals` | owner | 4 | chronicle | all | – | (chinese, korean, japanese ×3) |
| `the {town} Codex` / `Codex {house}` | place | 6 | chronicle, lore | EM on | – | the Saltgate Codex (aztec, maya ×3) |
| `{bookOpening}` | mood | 3 | chronicle, lay | AN–MD | strange | Long Ago (norse ×2) |
| `Lay of {hero}` / `Song of {hero}` | owner | 10 | lay | all | – | Lay of [hero] |
| `{hero:poss} Saga` / `Saga of {hero}` | owner | 10 | lay | MD–EM | – | Old Harrow's Saga (norse ×3) |
| `Tale of {hero}` / `Deeds of {hero}` | owner | 8 | lay | all | – | Deeds of [hero] |
| `Lament for {town}` | place | 4 | lay | AN–MD | grim | (arabic-persian ×2, egyptian ×2) |
| `the {hero} Cycle` / `the {numberWord} Branches` | owner | 4 | lay | MD | – | the Four Branches is blocked; the Seven Branches (celtic ×3) |
| `Ballad of {hero}` | owner | 6 | lay | EM on | light | Ballad of Kit Fenner |
| `{hero}iad` | owner | 3 | lay | AN; EM | grand | Harroviad: only when `{hero}` is one word; a final vowel is dropped first (greek-byzantine, roman ×2) |
| `Wanderings of {hero}` | owner | 4 | lay | AN–MD | – | (greek-byzantine ×2) |
| `Tale of the {house}` / `Song of the {folk}` | place | 5 | lay | all | – | Tale of the Harrows (japanese ×3) |
| `Laws of {ruler}` / `Code of {ruler}` | owner | 12 | law | all | plain | Laws of [ruler] |
| `Dooms of {ruler}` | owner | 6 | law | AN–MD | – | (anglo-saxon ×4) |
| `the {dynasty} Code` | owner | 4 | law | all | – | (chinese, korean, japanese ×3) |
| `the {numberWord} Tables` | virtue | 3 | law | AN | – | the Ten Tables (roman ×3) |
| `the {numberWord}-Article {lawWord}` (`{lawWord}`: Code, Law, Rule) | virtue | 3 | law | AN–MD | – | the Nine-Article Rule (japanese ×3) |
| `Charter of {town}` / `the {town} Charter` / `the Great Charter of {town}` | place | 10 | law | MD on | – | Charter of Saltgate |
| `the {metal} Bull` | colour | 3 | law | MD–EM | grand | the Silver Bull (roman, greek-byzantine, norman-british) |
| `Justice of the {folk}` | place | 3 | law | MD | – | (slavic ×3) |
| `Customs of {town}` / `Assize of {town}` / `Statute of {town}` / `Provisions of {town}` / `Ordinances of {town}` | place | 8 | law | MD–EM | plain | Provisions of Ashby (norman-british ×2) |
| `the {colour} Book of the {officeWord}` / `the {colour} Roll` | colour | 4 | law | MD–ST | – | the Red Book of the Wardrobe (norman-british ×3) |
| `Edict of {ruler}` | owner | 4 | law | all | grand | Edict of [ruler] |
| `Book of {god}` | god | 10 | holy | all | grand | Book of the Storm Lord |
| `Sayings of the {sageWord}` | mood | 8 | holy | all | – | Sayings of the Hermit |
| `Hymns of {thingDomain}` / `Songs of the {domainSong}` (`{domainSong}`: Dawn, Harvest, Long Night, Rivers) | mood | 6 | holy | all | – | Hymns of the Moon |
| `the {numberWord} Scrolls` | virtue | 6 | holy | all | – | the Nine Scrolls |
| `Testament of the {sageWord}` | mood | 4 | holy | all | – | Testament of the Pilgrim: non-christian cultures only |
| `Book of the {thingQuality} Way` | virtue | 6 | holy | all | – | Book of the Patient Way (chinese, japanese, korean ×2) |
| `the {town} Psalter` / `the {town} Gospels` / `Book of Hours of {ruler}` / `{holy:poss} Gospels` | holy | 15 | holy | MD–EM | – | the Fenwick Psalter: christian cultures only (§13.4) |
| `the {author} Herbal` / `the {town} Herbal` / `the {town} Bestiary` | owner / place | 6 | lore | MD on | – | the Saltgate Bestiary |
| `{author:poss} Almanac` | owner | 6 | lore | EM on | light | Old Harrow's Almanac |
| `the {ruler} Tables` / `Book of {ruler}` | owner | 4 | lore | MD–EM | – | the [ruler] Tables (arabic-persian ×2) |
| `the {town} World Map` / `the {folk} Atlas` / `{author:poss} Map` | place | 6 | lore | MD on | – | the Ashby World Map |
| `Mirror of {bookSubject}` / `Treasury of {bookSubject}` / `Key to {bookSubject}` / `Canon of {bookSubject}` / `Compendium of {bookSubject}` | virtue | 10 | lore | MD on (Compendium EM on) | – | Mirror of Ladies |
| `Garden of {bookSubject}` | virtue | 4 | lore | MD on | – | (arabic-persian ×3) |
| `Classic of {bookSubject} and {bookSubject}` | virtue | 4 | lore | AN–EM | – | Classic of Beasts and Herbs (chinese, korean ×3) |
| `{bookPlace} of {bookTreasure} and {bookPlace} of {bookTreasure}` | virtue | 4 | lore, chronicle | MD–EM | grand | Gardens of Pearls and Rivers of Musk (arabic-persian ×3); the two `{bookPlace}` differ |
| `the {number} Golden Remedies` | virtue | 3 | lore | MD–EM | – | (chinese ×2) |
| `the {colour} Grimoire` / `{author:poss} Grimoire` | colour / owner | 8 | grimoire | all | – | the Grey Grimoire |
| `Book of {thingDomain}` / `Pages of {thingDomain}` / `Book of {bookSecret}` | mood | 14 | grimoire | all | strange | Book of Tides |
| `Key of the {sageWord}` / `Aim of the {sageWord}` | virtue | 6 | grimoire | all | – | Key of the Hermit |
| `Book of the {numberWord} Seals` / `the {thingQuality} Codex` | virtue | 6 | grimoire | all | – | Book of the Seven Seals is blocked; the Cold Codex |
| `the {town} {object}` | place | 30 | paper | EM on | plain | the Fenwick Courier |
| `the {object}` | plain | 8 | paper | EM on | – | the Clarion |
| `the {town} {object} and {object}` | place | 8 | paper | ST on | plain | the Saltgate Courier and Advertiser (the two words differ) |
| `the Morning {object}` / `the Evening {object}` / `the {compass} {object}` | plain | 8 | paper | ST on | – | the Evening Echo |
| `the {town} Weekly {object}` | place | 6 | paper | ST on | plain | the Ashby Weekly Post |
| `the Gentlemen's Magazine` / `the Ladies' Magazine` patterns: `the {town} Gentlemen's {object}` / `the {town} Ladies' {object}` | place | 3 | paper | EM–ST | light | the Fenwick Ladies' Messenger |
| `the Capital Gazette` (fixed) / `the Court Gazette` (fixed) | plain | 10 | paper | MD–EM | – | chinese, korean, japanese only |

### 7.4 Sci-fi (NF–IS)

| Shape | Family | Weight | Module, kinds | Example |
|---|---|--:|---|---|
| `{star} Lance` / `the {star} {object}` | place | 8 | arms: sword, gun, cannon | Vega Lance |
| `{town} Pattern {object}` | find | 6 | arms: armour, gun | Ashby Pattern Suit |
| `the {star} Stone` / `the Last {object} of {homeworld}` (`{homeworld}`: Earth, the Old World, Home) | light | 10 | treasures: jewel, crown, ring, banner | the Last Banner of Earth |
| `Ark {object}` | plain | 4 | treasures | Ark Bell |
| `the {star} Logs` / `the {star} Archive` / `Mission Charter of {town}` / `Founders' Manifest` / `the Long Log` / `Core Memory` | place / plain | 30 | books: log | the Vega Logs |
| `the {star} {object}` / `{spaceLand} {object}` | place | 20 | books: paper | the Altair Bulletin |

---

## 8. Families and culture leanings

### 8.1 Families

| Family | What it names | Model traditions |
|---|---|---|
| `deed` | what the thing did | Norse *Leggbitr* (Legbiter), Japanese *Higekiri* (Beard-Cutter), *Kunikuzushi* (Province-Breaker) |
| `agent` | what it does | Irish *Fragarach* (the Answerer), Arabic *al-Battār* (the Sharp), OE *Hrunting* (Thruster), *Nægling* (Nailer) |
| `mood` | a temper or quality as a name | Frankish *Joyeuse*, *Précieuse*; Norse *Gram* (Wrath) |
| `kenning` | a poetic compound | Norse and OE: *Rimmugýgr* (Battle-Ogress), *Hildigǫltr* (Battle-Boar), shield as *war-board* |
| `beast` | an animal's part or likeness | Japanese *Kogarasu* (Little Crow), Chinese *Longquan* (Dragon Spring) |
| `light` | light and splendour | Persian and Indian gems: *Kūh-i Nūr*, *Daryā-i Nūr*; Irish *Claíomh Solais* |
| `owner` | whose it is | *Cap of Monomakh*, *Laws of Ine*, saga titles |
| `maker` | who made it | Chinese swords named for smiths (Gan Jiang, Mo Ye) |
| `place` | where it is from or kept | *Book of Leinster*, *Annals of Ulster*, *Mons Meg* |
| `find` | where it was found (archaeological naming) | *Sutton Hoo helmet*, *Snettisham torc* |
| `virtue` | a virtue or office | *Curtana* as the Sword of Mercy, *Rod of Equity*, *Stone of Destiny* |
| `nickname` | a homely given name | *Brown Bess*, *Mons Meg*, *Dulle Griet* (Mad Meg), *Great Tom* |
| `colour` | a colour | *Black Book of Carmarthen*, *Dyrnwyn* (White-Hilt), *Raven Banner* |
| `luck` | a house's luck or plenty | *Luck of Edenhall*, the Dagda's cauldron |
| `holy` | a saint | Christian relics and banners |
| `god` | an invented god | DS |
| `title` | a lordly title for a great gun | Indian *Malik-i Maidān* (Lord of the Battlefield), Chinese *Great General* cannon |
| `plain` | a plain descriptive name | *the Long Yew* |

The model names in this table are **examples of the tradition only** and are all on the block list (§13.1).

### 8.2 Culture leanings

Multipliers on shape weight, by family. Families not listed are ×1.

| Culture | Leanings |
|---|---|
| general | none |
| anglo-saxon | agent ×2, kenning ×2, deed ×1.5, owner ×1.5, luck ×1.5 |
| norse | deed ×3, kenning ×3, mood ×1.5, light ×0.3 |
| celtic | agent ×2, colour ×2, light ×1.5, beast ×1.5, luck ×2 |
| norman-british | mood ×2, virtue ×3, nickname ×3, find ×2, holy ×2, colour ×1.5, luck ×2 |
| roman | virtue ×2, owner ×2, place ×1.5, mood ×1.5, god ×1.5 |
| greek-byzantine | owner ×2, god ×2, place ×1.5, holy ×1.5 |
| slavic | owner ×2, holy ×1.5, place ×1.5 |
| steppe | beast ×2, colour ×3, owner ×1.5 |
| arabic-persian | agent ×3, light ×3, mood ×1.5 |
| indian | light ×3, beast ×1.5, virtue ×1.5, title ×2 |
| chinese | maker ×3, beast ×2, place ×1.5, mood ×1.5, virtue ×1.5, title ×2 |
| japanese | deed ×3, beast ×2, light ×1.5 |
| korean | virtue ×2, place ×1.5, beast ×1.5, colour ×1.5, title ×1.5 |
| egyptian | god ×3, owner ×2, beast ×1.5 |
| ethiopian | holy ×2, owner ×1.5, light ×1.5 |
| bantu | beast ×2, owner ×2, place ×1.5 |
| west-african | owner ×2, beast ×2, mood ×1.5 |
| aztec | beast ×3, god ×2, colour ×1.5 |
| maya | beast ×2, god ×2, owner ×1.5 |

Nickname shapes in cultures other than general, norman-british and anglo-saxon: ×0.3 (the homely English given names belong to English naming).

---

## 9. Genre additions

### 9.1 Fantastic (`h: true`)

| Shape | Weight | Module, kinds | Tone | Example |
|---|--:|---|---|---|
| `{element}-{edge}` (`{element}`: Frost, Flame, Storm, Star, Shadow, Moon, Sun, Thunder; `{edge}`: Edge, Fang, Heart, Song, Caller, Drinker (grim), Kiss (strange)) | 10 | arms: sword, axe, spear, knife, bow | – | Storm-Caller, Shadow-Fang |
| `{deedTarget}-Bane` with fantastic targets ×3 | 6 | arms | – | Wyrm-Bane |
| `Ring of {thingDomain}` / `Crown of {thingDomain}` / `the {thingDomain} Stone` | 10 | treasures: ring, crown, jewel | strange | Ring of Tides |
| `Staff of {thingDomain}` / `Orb of {thingDomain}` | 8 | treasures: sceptre, mirror | – | Staff of Winds |
| `the Witch's {object}` / `the Giant's {object}` | 4 | all modules | strange | the Witch's Glass |

### 9.2 Steampunk (`h: true`, ST)

| Shape | Weight | Module, kinds | Example |
|---|--:|---|---|
| `the Brass {beast}` / `Aether {object}` | 10 | arms: gun, cannon, armour | the Brass Heron, Aether Musket |
| `the Clockwork {object}` | 6 | treasures: crown, bell, mirror, instrument | the Clockwork Bell |
| `Transactions of the {town} {society}` / `Proceedings of the {town} {society}` (`{society}`: Philosophical Society, Aether Society, Engine Club, Lunar Society is blocked) | 10 | books: lore, paper | Proceedings of the Fenwick Aether Society |

---

## 10. Description

With "with what they are", each name gets a short description after a comma.

1. **Object part:** the shape's `{object}` in lower case, or, where the shape has none, the kind's **describe word**. It is left out when its word already appears in the name (case-insensitive).
2. **Owner part:** arms and treasures "of {owner}", books "by {author}" (kinds chronicle, lay, lore and grimoire only). It is left out when the owner is no one, or the name already has a person token.

| Parts | Arms and treasures | Books |
|---|---|---|
| both | `{name}, {object} of {owner}` | `{name}, a {object} by {author}` |
| object only | `{name}, a {object}` | `{name}, a {object}` |
| owner only | `{name}, carried by {owner}` (arms) / `{name}, held by {owner}` (treasures) | `{name}, by {author}` |
| neither | `{name}` | `{name}` |

- "a" becomes "an" before a vowel sound (*an axe*, *an almanac*).
- `{owner}` and `{author}` are drawn as person tokens (§3.2): placeholders `[hero]` (arms), `[ruler]` (treasures) and `[author]` (books).
- **Describe words:** sword "sword", axe "axe", spear "spear", bow "bow", mace "mace", knife "knife", shield "shield", armour "helm", gun "gun", cannon "great gun", crown "crown", ring "ring", jewel "jewel", torc "brooch", cup "cup", instrument "horn", sceptre "sceptre", banner "banner", seat "throne", bell "bell", relic "relic", mirror "mirror", chronicle "chronicle", lay "poem", law "law book", holy "holy book", lore "book of learning", grimoire "book of magic", paper "paper", log "record".
- The description is **part of the name** for display, insertion and starring.

Examples: *Wolf's Tooth, sword of [hero]* · *Helm-Splitter, an axe* · *Harald's Blade, a sword* is shortened to *Harald's Blade* · *Annals of Saltgate, a chronicle by [author]* · *Laws of [ruler]* · *the Luck of Harrow, a cup* · *Sword of Mercy, carried by [hero]*.

---

## 11. Rendering

- Capitals and possessives as GN §11 (OUP: *the Earl's Sword*, *Bakers' Token*-style plurals).
- "the": lower case at the start when the shape has it; names without "the" stay bare (*Joyous*, *Helm-Splitter*).
- Hyphenated compounds take a capital after the hyphen (*Helm-Splitter*, *Battle-Boar*, *White-Hilt*).
- `{hero}iad`: the hero's name plus *iad*, with a final vowel dropped first and a final *-ow* turned to *-ov* (*Brenna* → *Brenniad*, *Harrow* → *Harroviad*). A hero of more than one word (*Old Harrow*) skips the shape.
- Every name passes `repeatsContent` (*the Iron Iron Crown*, *Book of Book* are redrawn).

---

## 12. Tone

As TS §2. Shapes and pool entries with a tone count as that tone. Nickname shapes are light unless a pool entry says otherwise.

---

## 13. Safeguards

### 13.1 Block list

Whole-name matches (case-insensitive, leading "the" ignored, the description ignored) are redrawn. Add to `named-things.json`; safeguard packs can add, not remove.

- **Real swords and weapons:** Excalibur, Caliburn, Clarent, Durendal, Durandal, Joyeuse, Hauteclere, Almace, Précieuse, Curtana, Sword of Mercy, Tizona, Colada, Gram, Balmung, Hrunting, Naegling, Mimming, Skofnung, Tyrfing, Legbiter, Quernbiter, Footbiter, Battle-Ogress, Gungnir, Gáe Bulg, Gae Bulg, Areadbhar, Fragarach, Answerer, Claíomh Solais, Sword of Light, Dyrnwyn, White-Hilt, Caladbolg, Caledfwlch, Carnwennan, Rhongomyniad, Kusanagi, Grass-Cutter, Higekiri, Beard-Cutter, Hizamaru, Knee-Cutter, Kogarasu Maru, Little Crow, Onimaru, Mikazuki, Heshikiri, Dōjigiri, Honjō Masamune, Zulfiqar, Dhu'l-Fiqar, al-Battar, Gan Jiang, Mo Ye, Longquan, Dragon Spring, Taia, Zhanlu, Sword of State, Sword of Goliath, Holy Lance, Spear of Destiny, Lance of Longinus.
- **Real guns and great guns:** Brown Bess, Old Betsy, Mons Meg, Mad Meg, Dulle Griet, Faule Mette, Pumhart von Steyr, Big Bertha, Fat Bertha, Long Tom, Tsar Cannon, Great Turkish Bombard, Basilica, Basilisk, Zamzama, Kim's Gun, Malik-e-Maidan, Lord of the Battlefield, Jaivana, Kunikuzushi, Province-Breaker, Paris Gun, Schwerer Gustav, Dora, Anzio Annie, Killdeer, Peacemaker, Widowmaker.
- **Real bells:** Big Ben, Great Tom, Great Paul, Great John, Tom of Lincoln, Liberty Bell, Tsar Bell, Pummerin, Kaiserglocke, Bell of King Seongdeok, Emille Bell.
- **Real jewels:** Koh-i-Noor, Mountain of Light, Darya-ye Noor, Sea of Light, Hope Diamond, Cullinan, Star of Africa, Great Star of Africa, Lesser Star of Africa, Star of the South, Star of the East, Orlov, Black Orlov, Regent, Sancy, Great Mogul, Idol's Eye, Moon of Baroda, Nassak, Black Prince's Ruby, Timur Ruby, Eye of Brahma, Eye of the Tiger, Pigot, Florentine, Dresden Green, Tiffany Yellow, Heart of the Ocean, Star of India.
- **Real regalia, thrones and stones:** Iron Crown, Iron Crown of Lombardy, Crown of Saint Edward, Saint Edward's Crown, Holy Crown, Crown of Saint Stephen, Imperial State Crown, Imperial Crown, Cap of Monomakh, Monomakh's Cap, Crown of the Andes, Crown of Charlemagne, White Crown, Red Crown, Double Crown, Rod of Equity, Sceptre with the Cross, Black Rod, Peacock Throne, Sun Throne, Chrysanthemum Throne, Lion Throne, Golden Stool, Stone of Scone, Stone of Destiny, Lia Fáil, Coronation Stone, Coronation Chair, Throne of Solomon.
- **Real cups, banners and other treasures:** Holy Grail, Grail, Ardagh Chalice, Tara Brooch, Hunterston Brooch, Cup of Jamshid, Luck of Edenhall, Undry, Cauldron of the Dagda, Raven Banner, Oriflamme, Golden Flame, Dannebrog, Labarum, Nine White Banners, Banner of Saint Cuthbert, Gjallarhorn, Olifant, Draupnir, Brísingamen, Andvaranaut, Megingjörð, Mjölnir, Mjolnir, Aegis, Ancile, Prydwen, Sutton Hoo Helmet, Coppergate Helmet, Snettisham Torc, Staffordshire Hoard, Mildenhall Treasure, Lewis Chessmen.
- **Real books:** Anglo-Saxon Chronicle, Domesday Book, Doomsday Book, Great Survey, Magna Carta, Great Charter, Golden Bull, Twelve Tables, Grey Goose, Grágás, Russkaya Pravda, Rus' Justice, Tale of Bygone Years, Primary Chronicle, Secret History of the Mongols, Book of Settlements, Book of Icelanders, Heimskringla, Circle of the World, Record of Ancient Matters, Chronicles of Japan, History of the Three Kingdoms, Records of the Grand Historian, Book of Kings, Book of the Dead, Book of Coming Forth by Day, Popol Vuh, Book of the Council, Books of Chilam Balam, Books of the Jaguar Priest, Glory of the Kings, Kebra Nagast, Meadows of Gold, Meadows of Gold and Mines of Gems, Classic of Mountains and Seas, Book of the Way, Classic of Filial Piety, Canon of Medicine, Book of Healing, Thousand Golden Prescriptions, Book of Roger, Catalan Atlas, Mappa Mundi, Hereford Map, Black Book of Carmarthen, Red Book of Hergest, White Book of Rhydderch, Book of Taliesin, Book of Aneirin, Book of Leinster, Book of Kells, Book of Durrow, Lindisfarne Gospels, Book of the Dun Cow, Annals of the Four Masters, Annals of Ulster, Four Branches, Song of Roland, Lay of Hildebrand, Song of the Nibelungs, Lay of the Nibelungs, Cattle Raid of Cooley, Tale of Igor's Campaign, Lay of Igor's Campaign, Tale of the Heike, Tale of Genji, Iliad, Odyssey, Aeneid, Epic of Gilgamesh, Lament for Ur, Codex Mendoza, Florentine Codex, Voynich Manuscript, Red Book of the Exchequer, Black Book of the Exchequer, Book of the Seven Seals, Philosophical Transactions, Lunar Society.
- **Real grimoires:** Key of Solomon, Lesser Key of Solomon, Picatrix, Aim of the Sage, Grand Grimoire, Book of Abramelin, Book of Shadows, Sixth and Seventh Books of Moses.
- **Real papers:** The Times, Times, Daily Mail, Daily Telegraph, Daily Express, Guardian, Manchester Guardian, Observer, Spectator, Tatler, Rambler, Punch, Strand Magazine, Gentleman's Magazine, Morning Post, Morning Chronicle, Peking Gazette, New York Times, Washington Post, Pravda, Izvestia.
- **Fiction:** Sting, Glamdring, Orcrist, Andúril, Anduril, Narsil, Herugrim, Gúthwinë, Longclaw, Ice, Oathkeeper, Widow's Wail, Lightbringer, Dawn, Heartsbane, Needle, Stormbringer, Mournblade, Frostmourne, Ashbringer, Master Sword, Buster Sword, Keyblade, Vorpal Sword, Holy Avenger, Flame Tongue, Flametongue, Frost Brand, Frostbrand, Sunsword, Blackrazor, Wave, Whelm, Dragonlance, Lightsaber, Sword of Shannara, Sword of Truth, Sword of Gryffindor, Elder Wand, Sorting Hat, Philosopher's Stone, Sorcerer's Stone, Arkenstone, Silmaril, Silmarils, Palantír, Palantir, Phial of Galadriel, One Ring, Ring of Gyges, Ring of Power, Rings of Power, Tesseract, Infinity Gauntlet, Stormbreaker, Necronomicon, Book of Eibon, Pnakotic Manuscripts, Red Book of Westmarch, Daily Planet, Daily Bugle, Daily Prophet, Quibbler, Octavo, Lens of Truth, Triforce, Soul Edge, Soul Calibur.

### 13.2 Flag list

Allowed by default: Wrath, Mercy, Joyous, Precious, Faithful, the Cleaver, the Thunderer, Great Bell, Great Gun, Sword of Justice, Sword of Honour, Crown of Light, Star of the North, Luck of the House, Book of Hours, the Gazette, the Herald, the Courier, the Clarion, the Mercury, Mirror of Princes, Cauldron of Plenty, Long Nell.

### 13.3 Banned words

In any position, in this module only: the money module's list (MC §13.3); Bible, Quran, Koran, Torah, Talmud, Mishnah, Veda, Vedas, Upanishad, Gita, Purana, Sutra, Sutta, Tripitaka, Granth, Avesta, Hadith, Kojiki, Psalm, Psalms, Mormon; and, in kinds gun and cannon only: Kalashnikov, Uzi, Glock, Colt, Winchester, Enfield, Martini, Henry, Gatling, Maxim, Bren, Sten, Mauser, Luger, Browning, Remington, Beretta, Thompson, Tommy, Bofors, Krupp, Armstrong, Whitworth, Springfield.

### 13.4 Living religions

WR §10.1 and DS:

- DS's `breaksDeityWords` and `hasRealDivineName` run on every name.
- `{holy}` only in christian cultures; `{god}` only from DS's invented titles.
- Holy books are of **invented faiths only**, except the Christian-manuscript shape (`Psalter`, `Gospels`, `Book of Hours`), which is christian cultures only and MD–EM. *Gospels* and *Psalter* appear nowhere else.
- No relics of living non-Christian religions: in those cultures relic shapes use the owner family only (founders and ancestors).

### 13.5 Safeguard packs

`type: settlement-safeguards` (RN §12.6) apply here too.

---

## 14. Presets

```yaml
---
type: module-preset
module: arms-names
packName: Danelaw blades
culture: norse
kind: sword
era: MD
fantastic: false
tone: any
people: invented
owner: anyone
describe: on
---

Norse swords of the medieval era, in a realistic world, of any tone, belonging to anyone, with invented people and places, with what they are.
```

| Key | Values | Default |
|---|---|---|
| `module` | `arms-names`, `treasure-names`, `book-names` | – |
| `culture`, `era`, `fantastic`, `tone`, `people` | as RN §13 | as there |
| `kind` | `any` or a kind key of the module | `any` |
| `owner` | `anyone`, `none`, or a pack path (`"[[Saxon Men]]"`) | `anyone` |
| `ownerSection` | a `##` heading of the owner pack, or `whole` | the first heading |
| `describe` | `off`, `on` | `off` |

A preset whose owner pack is missing runs with owner anyone, with BT's missing-pack notice. Default preset name: `"{culture} · {kind menu}"`, or `"{culture} · {module label}"` when kind is Any.

---

## 15. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Data.** Pools and the `k` key (§5); `named-things.json` with kinds, families, leanings, shapes, genre additions, describe words and safeguards; register rows | §16.1 passes; every existing test and regression fixture passes unchanged |
| M2 | **Engine.** Kinds, family leanings, shapes, tokens, owner modes, rendering, description, safeguards | §16.2–§16.5 pass |
| M3 | **Modules.** The named things group and its icon, the three sections, the sentence, resets, history, presets; README section; rebuilt `main.js` | §16.6 passes; all three modules generate in the app |

---

## 16. Tests (`tests/namedThings.test.ts`)

### 16.1 Data

- Every pool entry is valid; every `k` names a kind of the right module.
- Every shape's kinds exist; every family in §7 is in §8.1.
- No pool entry or fixed shape matches the block list or a banned word.
- Other modules' output is identical, seed for seed (existing fixtures).

### 16.2 Coverage and determinism

- Same options and seed give the same names.
- Every module × culture × era × kind offered × fantastic × people × owner (anyone, none): 20 unique names within the cap.

### 16.3 Kinds and eras

- No guns in AN–MD; no great guns in AN; no shields in ST on; no logs before NF.
- Grimoires and (outside chinese, aztec, maya, egyptian) mirrors only in a fantastic world.
- Aztec and maya, EM: guns are offered; AN–MD: not.

### 16.4 Traditions

- Over 5,000 norse swords, deed and kenning shapes are at least 35% of draws; over 5,000 arabic-persian swords, agent shapes at least 25%; over 5,000 indian jewels, light shapes at least 35%.
- Nickname shapes appear for norman-british guns and great guns, and at no more than 5% of steppe great guns.
- Owner none: no name contains a person token or its placeholder.

### 16.5 Description and safeguards

- With describe on, every name follows one of the §10 forms; the object word never appears twice; "an" before vowels.
- 10,000 names across options: 0 block-list matches, 0 banned words; `{holy}` only in christian cultures; *Psalter* and *Gospels* only in christian cultures, MD–EM; gun-brand words never in gun or great-gun names.

### 16.6 Sentence and presets

- Default arms plain text: "Norman & British arms and armour of any kind of the medieval era, in a realistic world, of any tone, belonging to anyone, with placeholders for people and places, names only."
- Books read "by or about anyone".
- `namedThings` sits in `SWITCHER_ORDER` between `vehicles` and `advanced`, with the three modules in order.
- Resets as §2.4; preset round-trips, including a missing owner pack.

---

## 17. Parked

- **As one hoard:** the things of one owner on one theme (sword, shield, helm, horn and ring).
- Native-sounding names from a breakdown pack, with the English meaning alongside.
- A history line for each thing (who made it, who lost it, where it lies).
- Magic properties and curses.
- Named animals (warhorses, hounds, falcons) and named ships' figureheads.
- Tapestries, statues and paintings.
- Linking a realm's regalia from realms and polities.
