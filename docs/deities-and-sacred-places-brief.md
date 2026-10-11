# Deities and sacred places – brief (first release)

This brief adds the second module of the **history and faith** group: **deities and sacred places**. It names invented religion, in modern English:

- **deities and spirits:** *Lord of Storms*, *She Who Remembers*, *the Hidden One*, *Forge Father*, *Thousand-Eyed Mother*, *Jaguar of the Night*, *the Clockmaker*, *the First Signal*
- **pantheons and divine courts:** *the Twelve*, *the Old Gods*, *the Bright Host*, *the Court Under the Mountain*, *the Nine Who Wait*
- **sacred places:** *Mountain of the Storm Lord*, *Grove of She Who Remembers*, *the Seven Stones*, *Spring of Mercy*, *the Silent Oracle*

It is built from `docs/worldbuilding-research-reference.md` (WR §10). It follows the rule every nameForge module keeps: **no names, titles, scriptures or sacred places of living religions**, and nothing from the sensitive traditions (WR §10.1, §18.3–§18.4). Every deity here is invented.

It uses the shared vocabulary and packs (RN §3), joins the `lore` group set up by `docs/events-and-eras-brief.md` (EE), and in M3 feeds back into earlier modules (§10):

- buildings: *Temple of the Storm Lord* for every culture, not only the five ancient-god cultures
- route names: *Sacred Way to the Mountain of the Storm Lord*
- group names: cults and holy orders devoted to an invented deity (*Children of She Who Remembers*)

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow EE, then RN, GN, TS and BT (for the pack-name source). Reuse existing helpers.

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | A new module `deityNames` in the `lore` group, after events and eras |
| Kinds | deities and spirits · pantheons and divine courts · sacred places |
| Cultures | The 20 byname cultures (BT §4.1). **Polynesian and Andean are not offered** (sensitive), and there is no Sahul culture. |
| Eras, fantastic | As RN §4; the steam age with fantastic gives steampunk; NF–IS give sci-fi faiths |
| Domain | A link: any, or one of 12 domains (§4.1) |
| Gender | A link: any · male · female · neither (*They Who …*) |
| Names | A link: titles only (default) · a placeholder name and title (*[deity], Lady of Ash*) · names from a pack, as bynames do (*Asharet, Lady of Ash*) |
| Real gods | **Never output**, ancient or living. Ancient cultures shape the style; the names are invented. |
| Series | **As one pantheon**: a set of deities covering different domains, with a shared court name first (§8) |
| Back-links | Buildings, route names and group names read invented deities (§10) |

---

## 1. Module

### 1.1 Section

- Add `deityNames` to `NameForgeSection`, label **"deities and sacred places"**, Lucide icon `sun-moon`.
- Append it to `SECTION_GROUPS.lore` after `eventNames`.

### 1.2 History

`deities and sacred places · {era label} · {culture label}`, then ` · {kind}`, ` · {domain}`, ` · {gender}`, ` · steampunk` / ` · fantastic`, ` · {tone}`, ` · one pantheon` as they apply.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/settlement-vocab.json` | The new pools (§5) |
| `src/data/deity-names.json` | Kinds, domains, shapes, culture styles, safeguards |
| `src/deities/engine.ts` | Generation (§7), series (§8), rendering (§9); exported `deityTitle()` and `sacredPlace()` for back-links (§10). No Obsidian imports. |
| `src/deities/sentence.ts` | The sentence (§2) |
| `docs/vocabulary-pools.md` | Rows for the new pools |
| `tests/deityNames.test.ts` | §14 |

Add this brief to `docs/` as `deities-and-sacred-places-brief.md`.

---

## 2. The sentence

### 2.1 Shape

> ‹General›-themed ‹deities of any kind› of ‹any domain›, ‹of any gender›, of the ‹medieval› era, in a ‹realistic› world, ‹of any tone›, as ‹titles only›, ‹each one separate›.

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | label + "-themed" | General, then the 19 byname cultures | `general` |
| `kind` | "deities of any kind" or the kind's plural (§3) | Any, then the three | any |
| `domain` | "of ‹any domain›" / "of ‹storm and sky›" | any, then the domains (§4.1) for the era and fantastic | any |
| `gender` | "of any gender" · "male" · "female" · "neither male nor female" | the four | any |
| `era`, `fantastic` | as RN §2.2 | as RN | MD, realistic |
| `tone` | as TS | the six | any |
| `names` | "as titles only" · "with placeholder names" · "with names from ‹pack›" | the three | titles only |
| `pack`, `section` | as BT §2.2 | name packs and their headings | – |
| `series` | "each one separate" · "as one pantheon" | the two | separate |

- **Gender link:** hidden for sacred places; hidden reads as any.
- **Names link:** hidden for sacred places.
- **Tooltips:** domain, "What the deity rules over"; gender, "Decides Lord or Lady, He Who or She Who, Father or Mother; neither gives They Who and The One"; names, "Titles alone, a placeholder before the title, or a name from one of your packs"; series, "A pantheon: one court name, then deities of different domains"; the rest as RN and BT.

### 2.3 Resets, plain text, presets

Era or fantastic changed: a domain not offered resets to any. Kind set to sacred places: gender and names read as any and titles only. Plain text as GN §2.6. Presets in §12.

---

## 3. Kinds

| Key | Menu | Plural | Weight (Any) | Description |
|---|---|---|--:|---|
| `deity` | Deities and spirits | deities | 60 | Gods, goddesses and spirits, named by their titles |
| `pantheon` | Pantheons and divine courts | pantheons | 15 | Collective names for a group of gods or spirits |
| `place` | Sacred places | sacred places | 25 | Holy mountains, groves, springs, stones and oracles |

"Any" phrase: "deities of any kind".

---

## 4. Domains and archetypes

### 4.1 Domains

| Key | Label | Eras | Words used in titles (`domainWord`) |
|---|---|---|---|
| `sky` | storm and sky | all | Storms ×2, the Sky, Thunder, Lightning, the Winds, Rain, Clouds, the High Air |
| `earth` | earth and harvest | all | the Harvest ×2, the Fields, Grain, the Earth, Seeds, Orchards, Herds, Maize (aztec, maya) |
| `water` | sea and rivers | all | the Sea ×2, Rivers, the Deep, Tides, Springs, Wells, Lakes, Rain |
| `fire` | fire and forge | all | the Forge ×2, Fire, the Hearth, Embers, Iron, Bronze, the Kiln |
| `war` | war and the hunt | all | Battle, the Hunt ×2, Spears, Victory, the Chase, Shields, the Bow |
| `death` | death and ancestors | all | the Dead ×2, Ancestors, Graves, the Last Road, Ash, Silence, the Underworld |
| `wisdom` | wisdom and craft | all | Wisdom, Secrets, the Loom, Letters, Counting, Dreams, Thresholds, Keys |
| `love` | love and the hearth | all | the Hearth ×2, Marriage, Children, Kinship, Home, Mercy, Gardens |
| `trickery` | tricks and luck | all | Luck, Crossroads ×2, Masks, Riddles, Thieves, Doors, Chance |
| `sun` | sun, moon and stars | all | the Sun ×2, the Moon ×2, the Stars, Dawn, Dusk, the Night Sky, Eclipses |
| `steampunk` | engines and invention | ST (`h: true`) | Gears, the Great Engine, Steam, Sparks, Springs, Clocks, Invention |
| `machine` | machines and the void | NF–IS | the Void ×2, Signals, the Machine, Stars, the Long Dark, Code, the Drift |

### 4.2 Archetypes (WR §10.2)

Each domain has archetypes: fixed title roots for each gender. `m` / `f` / `n` (neither).

| Domain | Archetypes (m / f / n) |
|---|---|
| sky | Sky Father / Sky Mother / the Sky · Storm Bringer (all) · Thunder Lord / Thunder Lady / the Thunderer · Rain Lord / Rain Mother / the Rain-Giver |
| earth | Harvest Father / Harvest Mother / the Sower · Maize Father / Maize Mother / the Green One (aztec, maya) · Earth Father / Earth Mother / the Deep Root |
| water | Lord of the Deep / Sea Mother / the Tide · River Lord / River Mother / the Flowing One · Lord of Fish / Mother of Fish / the Shoal |
| fire | Forge Father / Forge Mother / the Smith · Hearth Lord / Hearth Lady / the Ember |
| war | the Hunter / the Huntress / the Hunt · War Lord / War Mother / the Spear · the Champion (all) |
| death | Lord of the Dead / Lady of the Dead / the Keeper · Ancestor King / Ancestor Queen / Keeper of Ancestors · the Ferryman / the Ferrywoman / the Ferry |
| wisdom | the Wise One (all) · the Weaver (all) · the Judge (all) · the Hidden One (all) · Lord of Thresholds / Lady of Thresholds / the Threshold |
| love | Hearth Father / Hearth Mother / the Kindling · the Lover / the Beloved / the Bond |
| trickery | the Trickster (all) · Lord of the Crossroads / Lady of the Crossroads / the Crossroads · the Spider (west-african, bantu, general) · the Hare (bantu, general) · the Raven (norse, general) · the Fox (chinese, japanese, korean) · the Coyote (aztec) |
| sun | Sun King / Sun Queen / the Sun · Moon Man / Moon Mother / the Moon · Star Father / Star Mother / the Star-Keeper · the Twins (all, in pantheons) |
| steampunk | the Clockmaker / Lady of Gears / the Great Engine · the Spark (all) |
| machine | the Machine (all) · the Navigator (all) · the First Signal (all) · the Makers (pantheon) · the Sleeper (all) · the Void (all) |

---

## 5. New pools (settlement-vocab.json)

| Pool | Entries |
|---|---|
| `divineFigure` | m: Lord ×3, King, Father ×2, Master, Prince, Old Man (light) · f: Lady ×3, Queen, Mother ×2, Mistress, Princess, Old Woman (light) · n: One ×2, Keeper ×2, Guardian, Voice, Eye, Hand, Watcher |
| `divineQuality` | Hidden ×2, Silent, Wise, Shining, Burning, Patient, Sleeping, Laughing, Weeping, Hungry (grim), Nameless (strange), Faceless (strange), Ancient, First, Last, Wandering, Blind (strange), Golden, Pale, Smiling, Watching, Twice-Born (strange), Unsleeping |
| `divineVerb` (for "Who …") | Waits ×2, Remembers ×2, Watches, Weaves, Hungers (grim), Sings, Listens, Walks Beneath, Keeps the Flame, Counts the Dead, Opens Doors, Sleeps Below, Speaks Twice, Wears the Sun, Carries the Moon, Drowns the Proud (grim) |
| `bodyNumber` | Thousand ×2, Hundred, Seven, Nine, Four, Three, Many |
| `bodyPart` | Eyed ×2, Handed, Faced ×2, Armed, Headed, Tongued (strange), Winged |
| `divineKin` | m: Father ×2, Brother, Son, Grandfather · f: Mother ×2, Sister, Daughter, Grandmother · n: Kin, Child, Elder |
| `pantheonNoun` | Gods ×2, Powers, Host ×2, Court, Circle, Kindred, Children, Elders, Thrones, Choir |
| `pantheonQuality` | Old ×2, Bright, Hidden, Elder, Silent, Shining, Deep, Wild, High, Low, First, Sleeping, Nameless |
| `sacredLand` | Mountain ×3, Hill, Grove ×2, Spring ×2, Well, Lake, Cave, Island, Stone, Stones, Tree, Peak, Valley, Cliff, Waterfall, Forest, Desert (arabic-persian, egyptian, west-african, steppe), Steppe (steppe) |
| `sacredQuality` | Holy ×2, Sacred ×2, Silent, Shining, Blessed, Weeping, Singing, Hidden, Burning, Dreaming, Forbidden (grim), Whispering |
| `oracleWord` | Oracle ×2, Seat, Voice, Mouth (strange), Eye, Pool of Seeing, Speaking Stone |
| `sacredVirtue` | Mercy, Healing, Plenty, Truth, Wisdom, Peace, Victory, Return, Seeing, Forgetting (strange), Dreams |
| `cultureDivineAnimal` | WR §10.4 lists by culture, with the culture's flavour animals (BT `cultureAnimals`); indian without Cow |

Fixed whole names are pools per kind, so packs can add them: `deityFixed:deity`, `deityFixed:pantheon`, `deityFixed:place`.

---

## 6. Culture styles

A culture changes **weights and words**, never introduces real names.

| Culture | Style |
|---|---|
| general | all shapes at table weights |
| anglo-saxon, norse | kennings ×3 (§7.1 "Form G"); `{animal} of the {domainWord}` ×2; domains sky, war, death ×1.5 |
| celtic | triple forms ×3 (`the Three {figure:pl} of …`, *the Three Mothers of the Well*); water and sacred places ×1.5 |
| norman-british, slavic, greek-byzantine, roman, ethiopian | christian cultures: **pantheon and deity kinds use the generic forms only** (for fantasy and alternate worlds); their sacred places favour wells, springs and hills ×2 |
| roman, greek-byzantine (AN) | Form A ×2 (`{figure} of {domainWord}`); `the {quality} {figure}` ×1.5 |
| egyptian | Form F ×3 (animal-headed: `the {animal}-Headed {figure}`, *the Falcon-Headed Lord*); domains sun, death ×2 |
| aztec, maya | Form F ×2 (`{animal} of the {domainWord}`), Form E ×2 (`{bodyNumber}-{bodyPart} {figure}`), Feathered Serpent archetype (`the Feathered {animal}`), domains earth (maize), sun, death ×2 |
| chinese, korean, japanese | Form A ×2 with `{eastHonour}` (Jade, Heavenly, Celestial, August) before the figure (*the Jade Lady of the Moon*); domains water, sun, wisdom ×1.5; the Fox trickster |
| indian | Form E ×2 (`{bodyNumber}-{bodyPart} {figure}`); domains water, sun ×1.5 |
| arabic-persian | spirits rather than gods: Form B and Form C ×2; `the {quality} {spiritWord}` (spiritWord: Spirit, Wind, Flame, Watcher) ×2 |
| steppe | Eternal Sky archetype (`the Eternal {colour} Sky`, any colour except Blue); domains sky, sun ×2; `{animal} Mother` (Wolf Mother, Deer Mother) |
| west-african, bantu | Spider and Hare tricksters; Ancestor Kings ×2; Form C ×1.5; `{animal} of the {domainWord}` |

`{animal}`: `cultureDivineAnimal`. `{eastHonour}`: Jade ×2, Heavenly, Celestial, August, Pearl.

---

## 7. Shapes

### 7.1 Deities and spirits

`{figure}` = `divineFigure` for the gender (any: equal m/f/n). `{kin}` = `divineKin` for the gender. "He/She/They" follow the gender.

| Form | Shape | Weight | Tone | Example |
|---|---|--:|---|---|
| archetype | the archetype for the domain and gender (§4.2) | 15 | – | Storm Bringer, Sea Mother |
| A | `{figure} of {domainWord}` | 20 | grand | Lord of Storms, Lady of Ash |
| B | `the {divineQuality} {figure}` | 12 | – | the Hidden One, the Laughing Lady |
| C | `{He/She/They} Who {divineVerb}` | 12 | strange | She Who Remembers |
| D | `{domainSg} {kin}` | 10 | – | Forge Father, Storm Mother |
| E | `the {bodyNumber}-{bodyPart} {figure}` | 6 | strange | the Thousand-Eyed Lord |
| F | `{animal} of the {domainWord}` / `the {animal}-Headed {figure}` | 8 | – | Jaguar of the Night, the Falcon-Headed Lord |
| G (kenning) | `{domainSg}-{kennWord}` | 5 | – | Storm-Rider, Sea-Walker (kennWord: Rider, Breaker, Bringer, Wielder, Keeper, Walker, Singer) |
| H | `{figure} of the {colour} {domainSg}` | 6 | – | Queen of the White Moon |
| I | `the {figure} Below` / `the {figure} Above` / `the {figure} Between` | 6 | strange | the Smith Below |

- `{domainSg}`: the domain word without "the", singular (*Storm*, *Forge*, *Moon*, *Sea*, *Harvest*).
- Form G only for anglo-saxon, norse and general.

**With names** (`names` link):
- placeholder: `[deity], {title}` (*[deity], Lady of Ash*); a title beginning "the" drops its capital: *[deity], the Hidden One*.
- pack: `{name}, {title}`, drawn through BT's pack mechanism (BT §2.4), section by gender (male, female, or the first section for neither).

### 7.2 Pantheons and divine courts

| Shape | Weight | Tone | Example |
|---|--:|---|---|
| `the {number}` | 15 | – | the Twelve, the Nine |
| `the {pantheonQuality} {pantheonNoun}` | 25 | – | the Old Gods, the Bright Host |
| `the {number} Who {divineVerb}` | 10 | strange | the Nine Who Wait |
| `the Court {underAbove} the {sacredLand}` | 10 | – | the Court Under the Mountain (underAbove: Under, Above, Beyond, Beneath) |
| `the {pantheonNoun} of the {domainSg}` | 10 | grand | the Host of the Sun |
| `Children of the {archetype}` | 8 | – | Children of the Sky Father |
| `the {colour} and the {colour}` | 5 | – | the Silver and the Gold |
| `the Twins` / `the Makers` / `the Elder Kin` (fixed) | 7 | – | – |
| `the {number} {figure:pl} of the {sacredLand}` | 10 | – | the Three Mothers of the Well (celtic ×3) |

`{number}`: Two, Three ×2, Four, Five, Seven ×2, Nine ×2, Twelve ×2, Thirteen (strange).

### 7.3 Sacred places

| Shape | Weight | Tone | Example |
|---|--:|---|---|
| `{sacredLand} of the {deity}` | 20 | grand | Mountain of the Storm Lord, Grove of She Who Remembers |
| `the {sacredQuality} {sacredLand}` | 20 | – | the Holy Mountain, the Weeping Spring |
| `the {number} {sacredLand:pl}` | 10 | – | the Seven Stones |
| `{sacredLand} of {sacredVirtue}` | 12 | – | Spring of Mercy |
| `the {divineQuality} {oracleWord}` | 8 | strange | the Silent Oracle |
| `{oracleWord} of the {sacredLand}` | 6 | strange | Voice of the Cave |
| `{place:poss} Holy {sacredLand}` | 8 | plain | Fenwick's Holy Well |
| `{holy:poss} {sacredLand}` | 8 | – | Saint Anne's Well (christian cultures only) |
| `{domainSg} {sacredLand}` | 8 | – | Thunder Hill, Moon Lake |

- `{deity}`: one deity title from §7.1 (archetype, A, B, C or D), without names, gender any.
- In NF–IS: `{sacredLand}` adds Moon, Asteroid, Derelict, Station Shrine; `{star}` as `{place}`.

### 7.4 Era and genre additions

- **ST with fantastic (steampunk):** steampunk domain archetypes; shapes `the Clockwork {figure}`, `{figure} of the Great Engine`, `the Brass {pantheonNoun}`; sacred places `the {sacredQuality} Engine`, `Shrine of the Spark`.
- **NF–IS:** machine domain archetypes; shapes `the {divineQuality} Signal`, `{He/She/They} Who {divineVerb} in the Void`, `the {ordinal} Maker`; pantheon `the Makers`, `the Silent Fleet`, `the {number} Signals`.
- **Fantastic (any era):** `h: true` entries allowed, e.g. `divineQuality` Starborn, Undying; `sacredLand` Floating Island, Sky Well.

---

## 8. Series: as one pantheon

1. The first name is a pantheon name (§7.2).
2. Then deities, each from a **different domain** until every offered domain is used; genders alternate m, f, n unless the gender link is set.
3. One archetype per domain at most; at least one Form C deity in a batch of 6 or more.
4. If a sacred place appears (kind Any), it names one of the batch's deities (`{sacredLand} of the {deity}`).
5. With a pack, names don't repeat.

---

## 9. Rendering

- A deity title starts with lower-case "the" (*the Hidden One*), as every nameForge group and place name does; after a name and comma it stays lower case (*[deity], the Hidden One*).

- Hyphenated compounds capitalise each part (*Thousand-Eyed*, *Falcon-Headed*, *Storm-Rider*).
- Possessives OUP.

---

## 10. Back-links into earlier modules

Part of M3. Add a short "Deities back-link" note to each module's brief in `docs/`.

### 10.1 Buildings and landmarks (BL)

- New faith shape for **all non-sensitive cultures**, weight 15: `Temple of the {deity}` (*Temple of the Storm Lord*), with `{deity}` from `deityTitle()` (archetype, A, B or D; gender any; culture style as §6).
- For christian cultures this shape has weight 3 and only with fantastic on (alternate faiths).
- `Shrine of the {holySite}` (BL §8.2) gains `Shrine of the {deity}` at equal weight.

### 10.2 Route names (RN)

- Pilgrim kind gains `Sacred Way to the {sacredPlace}` and `Pilgrims' Road to the {sacredPlace}` (weight 8 each), with `{sacredPlace}` from `sacredPlace()` shapes `{sacredLand} of the {deity}` and `the {sacredQuality} {sacredLand}`, without a leading "the" doubled.
- Not for Polynesian or Andean.

### 10.3 Group names (GN)

- Mystic family, cult type: new shape `Children of the {deity}` (weight 8), `Cult of the {deity}` (weight 6).
- Mystic family, holy type: new shape `{holyMembers} of the {deity}` (weight 6), not for christian cultures unless fantastic (`tradition` mapping as SK §3).

### 10.4 Settlement kit (SK)

- With contents whole, the kit's faith group (SK §5.2) and faith building (BL) use the **same** deity, chosen once into the context as `context.deity` (null for christian cultures in realistic worlds).

### 10.5 Tests

Each back-link adds a test: the new shapes appear in their module; never for sensitive cultures; christian cultures only with fantastic; deity titles pass this module's safeguards.

---

## 11. Safeguards

### 11.1 Block list

Whole-title matches (case-insensitive, leading "the" ignored) are redrawn, in this module and wherever its titles are used.

- **Living-religion titles and epithets:** God, Lord God, God Almighty, the Almighty, Lord of Lords, King of Kings, Lord of Hosts, Lamb of God, Prince of Peace, Son of God, Holy Spirit, Holy Ghost, Holy Trinity, the Trinity, Father, Son and Holy Spirit, Mother of God, Queen of Heaven, Our Lady, the Virgin, the Merciful, the Compassionate, the Most Merciful, the Most High, the One, the Creator, the Preserver, the Destroyer, Lord of the Dance, the Enlightened One, the Awakened One, the Compassionate One, the Blessed One, the Great Spirit, Great Spirit, Sky Woman, Eternal Blue Sky, Sun Goddess, Divine Mother, Supreme Being, Holy One, the Holy One of Israel, the Name, Ancient of Days, Alpha and Omega, Light of the World, Good Shepherd, Lord of the Worlds.
- **Real deity names** (ancient and living), whole or as a title part: Zeus, Hera, Athena, Apollo, Jupiter, Mars, Venus, Odin, Thor, Freyja, Loki, Woden, Thunor, Ra, Osiris, Isis, Horus, Anubis, Thoth, Quetzalcoatl, Tezcatlipoca, Tlaloc, Huitzilopochtli, Itzamna, Kukulkan, Chaak, Inti, Viracocha, Pachamama, Amaterasu, Susanoo, Inari, Guanyin, Mazu, Jade Emperor, Shiva, Vishnu, Brahma, Krishna, Rama, Ganesha, Kali, Durga, Lakshmi, Indra, Agni, Surya, Allah, Yahweh, Jehovah, Jesus, Christ, Mary, Buddha, Anansi, Olodumare, Shango, Yemoja, Oshun, Ogun, Eshu, Elegua, Nyame, Unkulunkulu, Mwari, Ngai, Tengri, Umay, Perun, Veles, Mokosh, Svarog, Dagda, Brigid, Lugh, Morrigan, Cernunnos, Baal, Marduk, Ishtar, Inanna, Ahura Mazda, Mithra, Rainbow Serpent, Baiame, Tangaroa, Tāne, Pele, Kāne, Māui.
- **Real sacred places:** Olympus, Asgard, Valhalla, Duat, Mictlan, Xibalba, Sinai, Zion, Moriah, Calvary, Golgotha, Mecca, Medina, Jerusalem, Kailash, Meru, Varanasi, Bodh Gaya, Lhasa, Fuji, Ise, Uluru, Delphi, Dodona, Eleusis, Glastonbury Tor, Stonehenge, Avebury, Iona, Lindisfarne, Lourdes, Santiago, Canterbury, Chalice Well, Mount Athos, Tai Shan, Kumano, Croagh Patrick.
- **Fiction:** the Seven, Lord of Light, R'hllor, the Drowned God, the Many-Faced God, the Old Gods and the New, the Nine Divines, the Eight Divines, the Daedric Princes, Talos, Akatosh, Emperor of Mankind, Chaos Gods, Khorne, Nurgle, Tzeentch, Slaanesh, the Valar, the Ainur, Eru Ilúvatar, Morgoth, Sauron, Aslan, the Great Old Ones, Cthulhu, Azathoth, Nyarlathotep, Shub-Niggurath, Mother of Dragons, Om, the Traveler, Lathander, Mystra, Bane, Tyr, Pelor, Vecna, Lolth, the Raven Queen.

### 11.2 Flag list

Allowed by default (`flagListBlocks: false`): Mother Earth, Father Time, Great Mother, Sky Father, Earth Mother, Sea Mother, Storm Bringer, the Hunter, the Trickster, the Smith, the Weaver, the Old Gods, the Elder Gods, the Old Ones, the Maker, the Makers, Holy Mountain, Sacred Mountain, Holy Island, Avalon, the Lady, the Twins, the Twelve.

### 11.3 Banned words

GN §12.3 plus: Satan, Devil (as a title), Antichrist, Lucifer, Iblis, Shaitan, Mara (as a title), Demon (as a deity title; GN's supernatural courts keep their own infernal hosts), Infidel, Heathen, Pagan, Idol, False God.

### 11.4 Sensitive traditions

- Polynesian and Andean aren't offered; no Sahul culture exists.
- Back-links (§10) never reach those cultures.
- Archetypes drawn from living traditions (the Spider, Hare, Raven, Coyote and Fox tricksters; Ancestor Kings) are **generic forms only**, never with a real name, and never combined with light-tagged qualities.

### 11.5 Safeguard packs

`type: settlement-safeguards` (RN §12.6) apply; a pack's Block entries also stop a title being used by the back-links.

---

## 12. Presets

```yaml
---
type: module-preset
module: deity-names
packName: Storm pantheon
culture: norse
kind: any
domain: any
gender: any
era: MD
fantastic: true
tone: any
names: placeholder
series: true
---

Norse-themed deities of any kind of any domain, of any gender, of the medieval era, in a fantastic world, of any tone, with placeholder names, as one pantheon.
```

| Key | Values | Default |
|---|---|---|
| `culture`, `era`, `fantastic`, `tone`, `series` | as RN §13 (culture: a byname culture) | as there |
| `kind` | `any`, `deity`, `pantheon`, `place` | `any` |
| `domain` | `any` or a domain key | `any` |
| `gender` | `any`, `male`, `female`, `neither` | `any` |
| `names` | `titles`, `placeholder`, `pack` | `titles` |
| `pack`, `section` | as BT §12 | – |

Unknown values reported and defaulted, as GN §13. `culture: polynesian` or `andean` reports `This culture isn't offered for deities.` and runs as General.

---

## 13. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Vocabulary and engine.** Pools, register rows, kinds, domains, archetypes, culture styles, shapes, series, safeguards, `deityTitle()` and `sacredPlace()` | §14.1–§14.5 pass |
| M2 | **Module.** Section in `lore`, sentence, history, presets | §14.6 passes; the module generates in the app |
| M3 | **Back-links.** §10 in buildings, route names, group names and the settlement kit, with their notes and tests | §10.5 tests pass; all earlier tests still pass |

---

## 14. Tests (`tests/deityNames.test.ts`)

### 14.1 Vocabulary

- New entries valid; none is a blocked title or name.

### 14.2 Coverage and determinism

- Same options and seed give the same names.
- Every culture × era × kind × domain offered × gender × names mode: 20 unique names within the cap.

### 14.3 Gender and names

- Male: no `f` figure, kin or archetype; female: no `m`; neither: only `n` forms and "They Who".
- Placeholder names render `[deity], {title}` with lower-case "the"; pack names come from the pack's gender section.

### 14.4 Culture styles and eras

- egyptian, 2,000 deities: at least 15% animal-headed forms; norse: kennings appear; never a real god's name (block list).
- MD: no steampunk or machine domains; ST with fantastic: steampunk domain offered; IS: machine domain offered.
- christian cultures in a realistic world: deities still generate (generic forms); sacred places favour wells and springs.

### 14.5 Series and safeguards

- Series of 8: the first is a pantheon name; deities cover different domains; genders alternate; at least one Form C.
- 10,000 titles across options: 0 block-list matches, 0 banned words; Polynesian and Andean not offered.

### 14.6 Sentence and presets

- Default plain text: "General-themed deities of any kind of any domain, of any gender, of the medieval era, in a realistic world, of any tone, as titles only, each one separate."
- Gender and names links hidden for sacred places.
- Preset round-trip; Polynesian reports and runs as General.

---

## 15. Parked

- Holy days, festivals and calendars (with eras).
- Religious offices and clergy titles beyond bynames (*High Priestess of the Storm Lord*).
- Relics and sacred objects (with an artefacts module).
- Myths and epithets as a details line (*She Who Remembers, keeper of oaths*).
- Faith names (the religion itself: *the Way of the Lantern*, *the Old Faith*).
