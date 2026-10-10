# Group names: orders, companies and factions – brief (first release)

This brief adds seven modules to the **group names** group, beside **tribes and kin groups**. They name organisations rather than peoples: orders, armies, gangs, guilds, adventuring companies, factions and supernatural courts, for fantasy, modern and sci-fi settings. Each module is set up with a clickable sentence, as tribes and kin groups and the place name wizard are.

The lists start from the Book of Names group tables (Mystic Orders, Military Units, Thieves and Assassins, Adventurers and Guilds, with the heraldic lists from Inns and Taverns). Here they are cleaned, re-weighted, sorted by genre and much expanded, with new shapes and five families the book doesn't cover. None of the book's example names are fixed outputs.

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow the tribal names brief's conventions (`docs/tribal-names-and-biomes-brief.md`).

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Setting control | **Genre** (fantasy · modern · sci-fi). Fantasy and modern each get a **fantastic switch**: fantasy goes from historic or low fantasy to high or epic fantasy; modern goes from the real world to contemporary fantasy. Sci-fi has no switch. |
| First release | Seven families: faiths and mystic orders · armies and martial orders · thieves and the underworld · guilds and trading houses · adventurers and explorers · powers and factions · supernatural courts and hosts |
| Second release (parked) | Learning and culture (colleges, learned societies, players' companies, bands, schools of arms) · sport and pastimes (teams, clubs) |
| Cultural flavour | Reuse the 17 tribal traditions for flavour. **General** (first in the menu) means no cultural flavour: it is the "general only" switch. |
| Results | Names only. No origin, no details line. |
| Set-up | A sentence of clickable choices for each module, built like the tribal sentence (`src/tribes/sentence.ts`) |
| Home | All seven are modules of the existing `groupNames` section group |

---

## 1. Module line-up

### 1.1 Sections

Add seven `NameForgeSection` values and append them, in this order, to `SECTION_GROUPS.groupNames` after `tribalNames`, and to `SECTION_ORDER` after `tribalNames`.

| Section key | Family key | Label (lowercase, as other modules) | Icon (Lucide, via `setIcon`) |
|---|---|---|---|
| `mysticOrders` | `mystic` | faiths and mystic orders | `sparkles` |
| `martialOrders` | `martial` | armies and martial orders | `swords` |
| `underworldGroups` | `underworld` | thieves and the underworld | `venetian-mask` |
| `tradeGuilds` | `trade` | guilds and trading houses | `scale` |
| `adventureCompanies` | `adventure` | adventurers and explorers | `compass` |
| `powerFactions` | `power` | powers and factions | `landmark` |
| `supernaturalCourts` | `supernatural` | supernatural courts and hosts | `ghost` |

Each module opens from the group's box like the place-name modules do. The group remembers its last-used module (`groupModule.groupNames`).

### 1.2 History

- **Label:** `{module label} · {setting phrase} · {tradition label}`, e.g. "armies and martial orders · high or epic fantasy · Germanic & Norse". General reads "General".
- **Setting phrases:** `historic or low fantasy` · `high or epic fantasy` · `real-world modern` · `contemporary fantasy` · `science fiction`.
- `historySection()` maps a label starting with each module label to its section.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/group-names.json` | All data in §5–§10 and §12. Lists are data, not code. |
| `src/groups/engine.ts` | Generation (§4), rendering (§11), safeguards (§12). No Obsidian imports. |
| `src/groups/sentence.ts` | The sentence (§2), built as segments like `tribalSentence`. No Obsidian imports. |
| `tests/groupNames.test.ts` | §16 |

The modal renders the sentence with the existing `sentenceLink`, as `renderTribalSentence` does.

---

## 2. The sentence

### 2.1 Shape

> ‹General›-themed ‹orders and faiths of any kind› for a ‹fantasy› world ‹of historic or low fantasy›, using ‹formal or everyday› names ‹that say what they are›, with ‹placeholders for› people and places

Each ‹…› is a link that opens a menu. The fantastic link and the front link only show when they apply (§2.2).

### 2.2 Fields

| Field | Text in sentence | Choices | Default |
|---|---|---|---|
| `tradition` | the tradition label, then "-themed" | General, then the 16 traditions, grouped as in tribal names | `general` |
| `type` | the type's sentence plural, or the family's "any" phrase | Any, then the family's types available in the current setting (§3) | any |
| `genre` | "fantasy" · "modern" · "science fiction" | the three (supernatural: fantasy and modern only) | `fantasy` |
| `fantastic` | fantasy: "of historic or low fantasy" / "of high or epic fantasy"; modern: "as it really is" / "of contemporary fantasy" | the two phrases for the genre | off |
| `form` | "formal or everyday" · "formal" · "everyday" | the three | `any` |
| `front` | "that say what they are" · "that hide what they are" · "that may hide what they are" | the three | `say` |
| `people` | "placeholders for" · "invented" | the two | `placeholders` |

- **Fantastic link:** shown for fantasy and modern, hidden for sci-fi.
- **Front link:** shown only when the chosen type can take a front, or when the type is Any and at least one available type can (§7). When hidden, `front` reads as `say`.
- **Tooltips:** tradition, its "Draws on" text (General: "No cultural flavour"); type, its description (§6); genre, "Genre: the kind of world"; fantastic, the setting phrase in full; form, "Formal titles, everyday names, or both"; front, "Front names: respectable names that hide what a group really is"; people, "Placeholders like [commander], or invented names".

### 2.3 Family "any" phrases and type plurals

| Family | Any phrase | Example type plural |
|---|---|---|
| mystic | orders and faiths of any kind | esoteric societies |
| martial | martial groups of any kind | regular units |
| underworld | underworld groups of any kind | thieves' guilds |
| trade | trading groups of any kind | craft guilds |
| adventure | adventuring groups of any kind | adventuring companies |
| power | powers of any kind | secret societies |
| supernatural | supernatural groups of any kind | fey courts |

Every type's sentence plural is in its family's type table (§6), in the "Sentence" column.

### 2.4 Changes that reset other fields

- **Genre or fantastic changed:** if the current type isn't available in the new setting, the type resets to Any.
- **Supernatural:** the genre menu offers fantasy and modern only. Choosing modern sets the fantastic switch on, and its menu offers only "of contemporary fantasy".
- **Type changed:** if the new type can't take a front, `front` resets to `say`.
- **Front set to "hide" with type Any:** only front-capable types are drawn.

### 2.5 State and presets

Choices are session-only, like the tribal choices. `{module} · Save as preset` works as for tribal names (§13).

### 2.6 Plain-text sentence

As `tribalSentenceText`: segments joined, first letter capitalised, a full stop added. Used for preset descriptions.

---

## 3. Genres and the fantastic switch

### 3.1 The five settings

| Code | Genre + switch | Covers |
|---|---|---|
| `FL` | fantasy, switch off | Historic and low-fantasy worlds, ancient to early modern. Magic is rare, rumoured or esoteric; heraldic beasts are emblems, not monsters. |
| `FH` | fantasy, switch on | High and epic fantasy: open magic, monsters, gods and demons as real powers |
| `MR` | modern, switch off | The real world, roughly 1850 to today |
| `MF` | modern, switch on | Contemporary and urban fantasy: the modern world with hidden magic and monsters |
| `SF` | sci-fi | Near future to far future, including space opera |

### 3.2 Tags

Every type, shape and word carries setting tags. Untagged means all five. A word can also carry explicit setting codes, e.g. `(FL FH SF)`. The tag codes used in this brief:

| Tag | Settings |
|---|---|
| `(H)` | Fantastic only: `FH`, `MF` |
| `(P)` | Past only: `FL`, `FH` |
| `(M)` | Modern and future: `MR`, `MF`, `SF` |
| `(MO)` | Modern only: `MR`, `MF` |
| `(S)` | Sci-fi only: `SF` |
| `(PM)` | Past and modern: `FL`, `FH`, `MR`, `MF` (not sci-fi) |
| `(L)` | Unfantastic only: `FL`, `MR` |

Shape tables also give settings directly in a "Settings" column, using the codes in §3.1, `all`, `F` (`FL FH`), `M` (`MR MF`) and `fan` (`FH MF`).

A multiplier written as `×0.5` after a word is its weight; otherwise weight 1.

### 3.3 Gating rule

A word, shape or type is used only in the settings its tags allow. After filtering, weights are renormalised. If a shape loses every option for one of its tokens, the shape is dropped for this draw.

---

## 4. Generation pipeline

Every name is built in this order:

```
module (family)
    ↓
type            (the chosen type, or a weighted draw from the family's types for this setting)
    ↓
front?          (§7: say → plain shapes; hide → front shapes; may hide → front 25%)
    ↓
form            (formal or everyday shapes, or both)
    ↓
shape           (weighted, filtered by setting, form and tradition)
    ↓
tokens          (lists, filtered by setting; tradition flavour added; people and places per §8)
    ↓
rendering       (§11: capitals, articles, plurals, possessives, caps)
    ↓
safeguards      (§12: block list, banned words, colour rule)
    ↓
name
```

- **Weights.** Fixed base weights from this brief; tradition multipliers on top (§9); renormalised after filtering.
- **Failure.** If a step leaves nothing, redraw the shape; after 20 failures for one name, redraw the type (or, with a chosen type, retry General flavour); after 20 more, skip the name and add the batch notice "Only {n} names could be generated."
- **Batches.** Unique case-insensitively, at most `count × 50` attempts, seeded like the tribal engine (`mulberry32`).

### 4.1 Shape notation

| Notation | Meaning |
|---|---|
| `{list}` | One word or phrase from that list. The engine looks for the list on the type first, then the family, then the shared lists (§5), then any other family's lists. List names are unique across the data. |
| `{a/b}` | Pick list `a` or `b` with equal chance, then a word from it |
| `{list:pl}` | The word made plural (§11.3) |
| `{list:poss}` | The word's possessive (§11.4) |
| `{person}`, `{holy}`, `{town}`, `{surname}`, `{house}` | People and places (§8) |
| `{initials}` | The initials of a formal name for the same type (§11.6) |
| Anything else | Literal text |

Shapes starting "the" render with a lowercase "the" (§11.1).

---

## 5. Shared vocabulary

All words are stored in Title Case as they appear in a name. Plurals follow §11.3.

### 5.1 Colours

**`colour`** (plain colours: martial, underworld, power, trade, adventure, supernatural): Black ×2, White ×1.5, Red ×2, Grey ×2, Green, Blue, Gold, Golden, Silver ×1.5, Iron, Scarlet, Crimson, Ashen, Pale, Copper, Bronze, Russet, Amber, Sable ×0.5, Azure ×0.5, Jade ×0.5, Ivory ×0.5, Violet ×0.5, Purple ×0.5.

**`colourRich`** (mystic and holy; the book's mystic colours, cleaned): Amber, Amethyst, Aquamarine ×0.3, Ashen, Azure ×2, Beryl ×0.3, Black, Blue, Brazen ×0.5, Bronze, Carmine ×0.5, Cerulean ×0.5, Copper, Crimson ×2, Crystal, Ebony, Emerald ×1.5, Golden ×2, Green, Grey, Incarnadine ×0.2, Indigo, Ivory, Jade ×1.5, Jet ×0.5, Malachite ×0.3, Opal ×0.5, Pale, Pearl, Purple, Rainbow ×0.3, Red, Rosy ×0.5, Ruby, Russet ×0.5, Sable ×0.5, Sapphire, Scarlet, Silver ×2, Topaz ×0.3, Turquoise ×0.3, Umber ×0.5, Vermilion ×0.5, Violet, Viridian ×0.3, White ×2.
*Removed from the book's list:* violaceous; brown, orange and yellow (too plain for this register).

### 5.2 Numbers

- **`number`:** Two, Three ×2, Four, Five, Six, Seven ×3, Nine ×2, Ten, Twelve ×2, Thirteen, Hundred ×0.5, Thousand ×0.3. Tradition numbers ×3 (§9).
- **`ordinal`** (written as figures, `1st`–`99th`): 1–12 weight 3 each, 13–30 weight 1, 31–99 weight 0.2.
- **`ordinalWord`:** First, Second, Third, Fourth, Fifth, Sixth, Seventh ×2, Eighth, Ninth ×2, Tenth, Twelfth, Thirteenth.
- **`greek`** `(S)`: Alpha, Beta, Gamma, Delta, Epsilon, Zeta, Eta, Theta, Iota, Kappa, Lambda, Mu, Nu, Xi, Omicron, Pi, Rho, Sigma, Tau, Upsilon, Phi, Chi, Psi, Omega. (The book's "khi" is spelt Chi.)

### 5.3 Description words

**`desc`** (martial and adventure; the book's military colours and "other" words, cleaned and extended): Black, White, Red, Gold, Silver, Iron ×2, Blue, Green, Grey; Battle, Blood ×0.5, Bolt, Bone, Chaos ×0.3, Dark, Death ×0.3, Dire ×0.5, Doom ×0.3, Fire, Flame, Free, High, Law ×0.3, Light, Lightning, Moon, Night ×1.5, Rune (H), Sea, Skull ×0.5, Star, Storm ×2, Sun, Thunder ×2, Thunderbolt ×0.5, Torch, War, Wave, Wind, Wing, Wrath ×0.5; Steel ×1.5, Stone, Ash, Ember, Frost, Winter, Crown, Royal, Loyal, Long, Last, Old, Salt, Border, Hollow, Sudden, Swift.

**`tech`** `(S)` (the book's futuristic list, cleaned): Astral, Comet, Celestial, Cosmic, Cyber ×0.5, Deep-Space, Eclipse, Galactic, Graviton, Hyperspace ×0.5, Ion, Infrared ×0.5, Laser, Lunar, Meteor, Nova ×2, Orbital ×2, Phase, Photon, Plasma, Pulsar, Quantum, Quasar, Rocket ×0.5, Solar, Sonic ×0.5, Stellar, Temporal ×0.5, Ultraviolet ×0.3, Vector, Void ×2, Warp, Zero-G, Nanotech ×0.5, Biotech ×0.5, Disruptor ×0.3, Nullifier ×0.3.
*Removed:* terminator and xenomorph (well-known film names), ultimate, ultra, space-time, matrix, dimensional, eliminator, starfarers (moved to soldiers).

**`urban`** `(M)`: Neon ×2 `(S)`, Chrome `(S)`, Static, Glass, Concrete `(MO)`, Velvet, Paper, Midnight, Rust, Signal.

### 5.4 Places: land and sea

**`land`** (used after "the": "Watchers of the Crags"): Crags ×2, Deep ×2, Marches ×2, Fens, Moors, Heath, Downs, Wolds, Fells, Dales, Hollow, Vale, Highlands, Lowlands, Coast, Shore, Strand, Isles, Reach, Sound, Narrows, Straits, Shallows, Bay, Cape, Headland, Cliffs, Pass ×1.5, Gate ×1.5, Ford, Bridge, Crossing, Old Road, Long Road, Salt Road, Wall, Tower, Barrow, Mere, Lakes, Falls, Forest, Weald, Greenwood, Wastes, Sands, Barrens, Peaks, Heights, Frontier, Borders, Harbour, Docks.
- With probability 0.3 a land word takes a prefix: a compass word (Northern, Southern, Eastern, Western) or a word from `colour`: "Western Marches", "Black Fens". Never on a word that already holds one (Salt Road, Old Road, Long Road).
- Tradition flavour land and water words (tribal `flavour.land`, plus the tradition's homeland water words if the data has them) are added at ×3.
- In `SF`, `{land}` draws from `spaceLand` instead.

**`spaceLand`** `(S)`: Belt ×2, Rim ×2, Reach, Drift, Halo, Ring, Verge, Expanse, Deep, Void, Core, Spur, Gap, Shoals, Cluster, Frontier, Dark, Lanes. Prefix with probability 0.3: Outer, Inner, Far, Near, Deep, Long, Silent, or a compass word. ("Outer Rim" is blocked, §12.)

**`compass`:** Northern, Southern, Eastern, Western; Home ×0.3.

### 5.5 Emblems

The shared heraldic pool, built from the book's Inns and Taverns lists. Used wherever a shape says `{emblem}`. Sub-lists can be named on their own (`{beast}`, `{bird}` …). Within `emblem` the sub-lists carry the weights shown.

| Sub-list | Weight in `emblem` | Words |
|---|--:|---|
| `beast` | 20 | Bear ×2, Boar ×2, Bull, Fox ×1.5, Hart ×2, Hind, Horse, Lamb, Lion ×2, Ram, Stag ×2, Wolf ×2, Badger, Otter, Hare ×1.5, Hound ×1.5, Talbot ×0.5, Leopard, Panther, Tiger ×0.5, Elephant ×0.3, Ox, Goat, Cat, Weasel ×0.5, Stoat ×0.5, Bat ×0.5, Spider ×0.5, Scorpion ×0.5, Serpent, Adder ×0.5, Toad ×0.5, Bee ×0.5, Squirrel ×0.3, Lynx, Ermine ×0.5 |
| `bird` | 18 | Cock, Crane, Crow, Raven ×2, Rook, Dove, Eagle ×2, Falcon ×1.5, Hawk ×1.5, Goshawk ×0.5, Merlin ×0.5, Heron, Kingfisher, Lark, Nightingale, Owl ×1.5, Peacock ×0.5, Pelican ×0.5, Pheasant ×0.3, Swan ×1.5, Swallow, Martlet ×0.5, Swift, Wren, Magpie, Jackdaw, Kite, Osprey, Stork ×0.5, Gull, Curlew ×0.5 |
| `fish` | 5 | Dolphin, Pike, Salmon, Trout ×0.5, Eel, Whale, Shark, Crab ×0.5, Lobster ×0.3, Sturgeon ×0.3 |
| `heraldicBeast` | 10 | Dragon ×3, Wyvern, Griffin ×2, Unicorn ×1.5, Phoenix, Basilisk ×0.5, Cockatrice ×0.5, Mermaid ×0.5, Pegasus ×0.5, Salamander ×0.5, Sea-Serpent ×0.5, Hydra ×0.3, Manticore ×0.3, Sphinx ×0.3, Enfield ×0.2, Opinicus ×0.2 |
| `weapon` | 10 | Arrow, Axe, Bow, Crossbow ×0.5, Dagger, Dart ×0.5, Flail ×0.3, Halberd ×0.5, Hammer, Javelin ×0.5, Lance, Mace ×0.5, Pike ×0.5, Sling ×0.3, Spear, Staff, Sword ×2, Sabre, Rapier ×0.5, Trident ×0.5 |
| `worn` | 6 | Boot ×0.3, Buckle ×0.5, Cloak, Coronet ×0.5, Crown ×2, Gauntlet, Glove, Hood, Helm, Mask, Ring, Robe ×0.5, Spur, Mantle |
| `celestial` | 8 | Cloud, Moon ×2, Crescent, Rainbow ×0.3, Star ×2, Sun ×2, Thunderbolt ×0.5, Comet, Eclipse ×0.5 |
| `plant` | 10 | Acorn, Oak ×2, Ash, Elm, Birch, Hazel, Holly, Ivy, Hawthorn, Rowan, Willow, Yew, Thistle, Rose ×2, Lily, Trefoil ×0.3, Bluebell ×0.5, Briar, Fern, Vine, Sheaf, Thorn, Laurel, Olive, Lotus ×0.5, Poppy, Mandrake ×0.3, Mistletoe ×0.5, Apple |
| `musical` | 3 | Drum, Fiddle, Flute, Harp ×2, Horn ×2, Lute, Lyre, Pipe, Trumpet, Bell, Whistle ×0.5, Tabor ×0.3 |
| `various` | 10 | Anchor, Anvil, Arrowhead ×0.5, Banner, Beacon, Beehive, Bell, Book, Bridge, Brazier, Candle, Cauldron, Castle, Chain, Chest ×0.5, Coin, Cup, Fleece ×0.5, Gate, Hand ×1.5, Fist, Horseshoe, Hourglass, Key ×1.5, Lamp, Lantern ×1.5, Lock, Loom, Needle, Plough, Portcullis, Quill, Rope, Sail, Scales, Sceptre, Scroll, Shell, Shield ×1.5, Ship, Sickle, Spindle, Talisman, Tower ×1.5, Wheel, Well, Windmill ×0.5, Compass, Torch, Kettle ×0.3, Tinderbox ×0.3 |
| `food` | 1 | Apple, Plum, Pear, Pomegranate, Loaf, Cheese, Fig, Barrel |
| `modernEmblem` `(M)` | 6 | Bolt, Wing, Arrow, Star, Globe, Lens, Prism, Spark, Cog; `(S)` Atom, Satellite, Comet, Rocket |

- `heraldicBeast` words are emblems in every setting (a red dragon on a banner needs no magic). As **creatures that actually exist** (monsters to hunt, supernatural kin) they need `(H)`; those lists are separate (§6).
- **`creature`** = `beast` + `bird` + `fish` (no heraldic beasts), used for plural creature names ("the Jackdaws").
- *Removed from the book's tavern Person list for group use:* gypsy, savage, harlot, strumpet, wench, virgin. Person lists aren't used in group shapes at all.

### 5.6 Mystic qualities and entities

**`quality`** (the book's mystic qualities, cleaned and weighted): Ancient ×2, Arcane ×2, Astral, Blinding ×0.5, Bright, Burning, Bygone ×0.5, Celestial, Concealed, Cosmic, Dark ×2, Deep, Dusky ×0.5, Effulgent ×0.3, Elder ×2, Elemental (H), Esoteric, Eternal ×2, Ethereal, Forgotten ×2, Gloomy ×0.3, Glorious ×0.5, Glowing ×0.5, Gnostic ×0.5, Hidden ×2, Ineffable ×0.5, Inner ×2, Lost ×2, Luminous, Lunar, Magical (H) ×0.5, Mysterious ×0.5, Mystic, Occult, Penumbral ×0.3, Profound ×0.5, Pure, Quintessential ×0.2, Radiant, Recondite ×0.2, Resplendent ×0.3, Revealed, Sacred ×2, Secret ×2, Shadowed, Shining, Sidereal ×0.3, Singing ×0.5, Sinister ×0.3, Solar, Solemn ×0.5, Spiral, Starry, Sublime ×0.5, Supernal ×0.3, Timeless, Transcendent ×0.5, True ×2, Veiled ×2; *added:* Silent ×2, Still, Hollow, Sleeping, Unseen, Nameless, Unbroken, Wandering, Weeping, Whispering, First, Last, Unspoken; `(S)` Quantum, Recursive, Infinite, Binary, Null, Prime, Fractal.
*Removed:* cardinal, dexter, difficult, existential, maieutical, zetetic, cloudy.

**`entity`** (the book's list, cleaned and weighted): Arcana ×0.3, Chalice, Chamber, Cloud, Cowl, Crown, Crystal, Darkness, Dawn ×2, Day, Doctrine ×0.5, Dominion ×0.5, Enlightenment ×0.5, Eye ×2, Faith, Fane ×0.3, Fire, Flame ×2, Fountain, Gate ×2, Glyph, Grail ×0.5, Hand ×2, Harmony, Heart, Insight ×0.5, Key ×2, Knowledge, Light ×2, Lore, Mantle, Mind, Moon ×2, Mystery, Night, Orb, Path ×2, Pentacle ×0.5, Pillar, Pool, Portal (H), Power, Pyramid ×0.5, Question ×0.5, Radiance, Rainbow ×0.5, Revelation, Robe ×0.5, Rod, Sceptre, Scroll, Secret, Shadow ×2, Shrine, Sigil, Sign, Sky, Sphere, Spring, Staff, Star ×2, Stone, Sun ×2, Symbol ×0.5, Teaching ×0.5, Temple, Throne, Time, Truth, Twilight, Veil ×2, Verity ×0.5, Void, Wand (H), Way ×2, Wisdom, Word ×2, World; *added:* Lantern ×2, Mirror ×2, Labyrinth, Threshold, Silence, Ember, Well, Tree, Serpent, Rose ×2, Compass, Hourglass, Eclipse, Tide, Loom, Thread, Spindle, Tower, Lamp ×2, Seal, Spiral, Ouroboros ×0.3, Lotus ×0.5, Sleeper; `(S)` Signal, Singularity, Lattice, Cipher, Pattern, Frequency, Machine, Code, Horizon, Array, Helix, Energy.
*Removed:* beyond (now a shape), influence, mastery, sapience, learning, space.

### 5.7 Names for people and firms

**`surname`** (partner shapes, crime families, banks; General, Celtic and Germanic only, §8.3): Ashby, Thorne, Hale, Varden, Harrow, Vance, Fenwick, Blackwood, Ostrey, Pell, Garrick, Holloway, Kestle, Rook, Selwyn, Tressel, Whitlock, Ambrose, Callow, Dunmore, Everard, Farrant, Gedge, Hartnell, Ingram, Jessop, Kingsley, Lacey, Marchbank, Northcote, Orme, Pagett, Quarrie, Rendell, Stannard, Tolley, Upshaw, Venn, Wardle, Yelland, Ashdown, Brack, Corrie, Drewitt, Eastlake, Fairweather, Grice, Hollis, Ketteridge, Larkin, Merrow, Nash, Oakes, Prentice, Ruddock, Shard, Tarrant, Vosper, Winship, Yeo.

**`house`** (noble and great houses, vampire houses): Velloran, Dravane, Corvane, Ostrey, Vey, Marrow, Varrick, Talmont, Morcant, Esk, Darrow, Quenby, Lisle, Arden, Caddoc, Fenmore, Sorrel, Thane, Valcourt, Ravel, Aster, Blackmere, Vantrell, Orrin, Selden, Corrow, Maelis, Tarrow, Vesper, Ilmar, Harrowgate, Ashcombe, Revel, Strand, Wyvenhoe, Calloway.

**`brandRoot`** `(M)`: Kestrel, Meridian, Vantage, Axiom, Halcyon, Sable, Corvid, Lumen, Paragon, Vertex, Ardent, Northstar, Bastion, Cinder, Helix, Arbor, Solace, Tessera, Argent, Brightwater, Ironvale, Greyfield, Monarch, Harrow, Vesper, Orrery, Cobalt, Saltire, Wyvern, Juniper.

**`brandStart`** + **`brandEnd`** `(M)` (one-word brands; reject if the result is in the block list or under 5 letters): starts Vent, Ax, Quant, Lum, Ser, Cor, Nov, Vel, Tal, Zeph, Orb, Kyn, Hal, Mer, Tess, Cal, Dyn, Ost; ends rix, ion, ara, eon, ica, ium, ora, yx, aris, ent, ova, ex.

**`corpSuffix`** `(M)`: Dynamics ×2, Systems ×2, Industries ×2, Holdings ×2, Consolidated, Group, Technologies, Labs, Works, Logistics, Analytics, Heavy Industries, Mining, Aerospace `(S)`, Solutions, Partners, Corporation, Ventures, Energy, Biotech ×0.5, Pharmaceuticals ×0.5, Shipping ×0.5, Combine `(S)`.

---

## 6. The families

Each family has a type table and shape tables. The type table columns are:

| Column | Meaning |
|---|---|
| Key | The data key |
| Menu | The menu label |
| Sentence | The sentence plural |
| Settings | Where the type exists |
| Weight | Its base weight when the type is Any |
| Front | Its front style (§7), or – |
| Person | Its placeholder label for `{person}` (§8) |

In shape tables, **Form** is `F` (formal), `E` (everyday) or `B` (both). Weights are relative within the type. Examples are illustrations, not fixed outputs.

### 6.1 Faiths and mystic orders (`mystic`)

| Key | Menu | Sentence | Settings | Weight | Front | Person |
|---|---|---|---|--:|---|---|
| `esoteric` | Esoteric and secret societies | esoteric societies | all | 25 | society | founder |
| `arcane` | Arcane orders and colleges | arcane orders | FH MF SF | 20 | society | founder |
| `holy` | Holy and monastic orders | holy orders | all | 20 | – | founder |
| `cult` | Cults and heresies | cults | all | 15 | society | prophet |
| `coven` | Covens and lodges | covens and lodges | FL FH MR MF | 10 | society | founder |
| `school` | Schools of philosophy | schools of philosophy | all | 10 | – | teacher |

**Descriptions (tooltips).** Esoteric: "Hermetic brotherhoods, secret lodges and questers after hidden knowledge, from harmless to sinister". Arcane: "Orders of working magicians, wizards' colleges, psychic orders". Holy: "Monks, nuns, friars and religious houses". Cult: "Cults, heresies and doomsday faiths". Coven: "Witches' covens, druids' groves, cunning folk". School: "Philosophical schools and followers of a teaching".

**Family lists**

- **`group`** (esoteric, arcane): Order ×3, Circle ×3, Brotherhood ×2, Sisterhood ×2, Society ×2, Fellowship ×2, Conclave, Lodge, Temple, Chapter, Assembly, Alliance, Association ×0.5, Cabal, Confraternity ×0.5, Convocation ×0.5, Coterie ×0.5, Fraternity, League, Sodality ×0.5, Guild ×0.5. Arcane only adds College ×2, Tower (H), Collegium ×0.5, Sanctum ×0.5, and `(S)` Choir, Collective.
- **`members`** (esoteric, arcane): Seekers ×3, Adepts ×2, Initiates ×2, Keepers ×2, Brothers ×2, Sisters ×2, Children ×2, Disciples, Devotees, Votaries ×0.5, Apostles ×0.5, Aspirants ×0.5, Fellows ×0.5, Followers, Servants, Masters, Illuminants ×0.3, Revealers ×0.3, Watchers, Wardens, Heirs, Walkers, Dreamers, Sages, Hermits ×0.5, Gentlemen ×0.3, Ladies ×0.3. Arcane only adds (H) Magi, Mages, Sorcerers, Enchanters, Wizards ×0.5, Thaumaturges ×0.3, and `(S)` Psions, Mentalists.
  *Removed from the book's list:* siblings, siblingship, colleagues, probers.

**Shapes: esoteric and arcane**

These follow the book's d10 table (group of the entity 1 in 10; group of the description and entity 7 in 10; description, group, description and entity 1 in 10; description and members 1 in 10) and add new shapes.

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `{group} of the {entity}` | B | 10 | all | Circle of the Veil |
| `{group} of the {quality} {entity}` | F | 30 | all | Order of the Hidden Lamp |
| `{group} of the {colourRich} {entity}` | F | 20 | all | Brotherhood of the Umber Cloud |
| `{quality} {group} of the {colourRich} {entity}` | F | 8 | all | Elder Circle of the Jade Mirror |
| `{members} of the {entity}` | B | 10 | all | Keepers of the Threshold |
| `{members} of the {quality} {entity}` | F | 10 | all | Seekers of the Lost Word |
| `{members} Beyond the {entity}` | B | 3 | all | Walkers Beyond the Veil |
| `{colourRich} {members}` | E | 6 | all | Ashen Adepts |
| `{quality} {members}` | E | 4 | all | Silent Seekers |
| `the {colourRich} {group}` | E | 5 | all | the Jade Circle |
| `the {entity} {group}` | E | 4 | all | the Lantern Lodge |
| `Most Ancient {group} of the {quality} {entity}` | F | 2 | all | Most Ancient Order of the Veiled Star |
| `Hermetic {group} of the {entity}` | F | 1 | FL FH MR MF | Hermetic Brotherhood of the Spindle |
| `College of the {quality} {entity}` | F | 6 | arcane only | College of the Burning Sigil |
| `the {colourRich} Tower` | E | 2 | arcane only, FH | the Azure Tower |
| `the {quality} Choir` | E | 3 | arcane only, SF | the Recursive Choir |
| `{entity} Collective` | E | 2 | arcane only, SF | Lattice Collective |

**Holy: lists**

- **`holyGroup`:** Order ×3, Brothers ×2, Sisters ×2, Brotherhood, Sisterhood, Friars, Community, House, Congregation, Society ×0.5, Fellowship ×0.5.
- **`holyMembers`:** Brothers ×2, Sisters ×2, Friars ×2, Monks, Nuns, Canons ×0.5, Hermits, Keepers, Servants, Pilgrims, Penitents ×0.5.
- **`holyQuality`:** Holy ×2, Blessed, Humble, Poor ×2, Little, Silent, Barefoot, Penitent ×0.5, Merciful, Wandering, Hidden ×0.5.
- **`holyEntity`:** Lantern, Still Water, Open Hand, Bread, Well, Hearth, Mercy, Dawn, Grace, Vigil, Bell, Lamp, Mountain, Pilgrim Road, Ash, Silence, Lamb, Dove, Olive, Rose, Spring, Stone, Path, Gate; `(S)` Quiet Star, Long Voyage, Far Light.
- **`habit`** (colours for "the Grey Friars" shapes): Grey ×2, White, Black, Brown ×1.5.

**Holy: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Order of {holy}` | F | 15 | all | Order of Saint Aldric |
| `{holyMembers} of {holy}` | F | 10 | all | Sisters of Saint Osyth |
| `{holyMembers} of the {holyEntity}` | B | 20 | all | Brothers of the Still Water |
| `{holyQuality} {holyMembers} of the {holyEntity}` | F | 15 | all | Poor Sisters of the Lantern |
| `{holyGroup} of the {holyQuality} {holyEntity}` | F | 15 | all | Order of the Silent Bell |
| `the {holyQuality} {holyMembers}` | E | 12 | all | the Barefoot Friars |
| `the {habit} {holyMembers}` | E | 6 | all | the Grey Monks |
| `the {holyEntity} {holyGroup}` | E | 7 | all | the Lantern House |

`the {habit} {holyMembers}` draws only Friars, Monks, Nuns and Canons: the colour rule (§12.4) blocks Brothers and Sisters.

**Cult: lists**

- **`cultGroup`:** Cult ×2, Children ×3, Church `(PM)`, Temple, Chosen, Followers, Flock, Brood ×0.5, Congregation, Covenant, Remnant ×0.5.
- **`cultQuality`:** Hollow ×2, Pale ×2, Silent, Weeping, Unblinking, Drowned, Coming, Final, Sleeping, Burning, Nameless, Patient, Hungry, Crawling ×0.3, Smiling, Faceless, Twin, Ninth.
- **`cultEntity`:** Sun ×2, Flame, Moon, King, Queen, Harvest, Dark, Star, Hour, Eye, Tide, Bell, Lamb, Door, Mother, Father, Child, Mouth ×0.5, Worm ×0.5, Crown, Throne, Choir, Gate, Dreamer.
- **`cultName`:** Unbound, Awakened, Returned, Watchful, Unsleeping, Hollowed, Marked, Faithful Few, Blessed Few, Remnant.
- **`verbPhrase`:** Wait Beneath, Keep the Last Flame, Dream Below, Remember the Fall, Watch the Sky, Do Not Sleep, Speak in Silence, Walk at Dusk, Count the Days, Listen to the Deep, Wait for the Tide, Bear the Mark.

**Cult: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Children of the {cultQuality} {cultEntity}` | B | 18 | all | Children of the Hollow Sun |
| `Cult of the {cultQuality} {cultEntity}` | B | 15 | all | Cult of the Pale Flame |
| `Church of the {cultQuality} {cultEntity}` | F | 8 | all | Church of the Drowned Bell |
| `the {cultQuality} {cultGroup}` | E | 10 | all | the Patient Flock |
| `Those Who {verbPhrase}` | E | 10 | all | Those Who Wait Beneath |
| `the {cultEntity:poss} {cultGroup}` | E | 8 | all | the Dreamer's Children |
| `{cultGroup} of the {ordinalWord} {cultEntity}` | F | 8 | all | Congregation of the Ninth Moon |
| `the {cultName}` | E | 8 | all | the Unsleeping |
| `{person:poss} {cultGroup}` | E | 5 | all | [prophet]'s Children |

**Coven: lists**

- **`covenGroup`:** Coven ×3, Circle ×2, Lodge, Grove, Hearth, Ring, Moot ×0.5, Gathering ×0.5.
- **`covenMembers`:** Sisters, Daughters, Wise Women, Cunning Folk, Hedge-Witches, Keepers, Dancers, Dreamers, Gatherers.
- **`covenEmblem`:** Hare ×2, Toad, Owl, Cat, Moon ×2, Thorn, Hawthorn, Yew, Elder, Rowan, Mistletoe, Cauldron, Broom, Candle, Mirror, Bone, Needle, Thread, Apple, Hag-Stone.
- **`covenLand`:** Fen, Moor, Heath, Hollow, Crossroads, Mere, Barrow, Wood, Common, Marsh. Tradition flavour land words ×3.
- **`tree`:** Oak, Yew, Ash, Rowan, Hazel, Holly, Elder, Willow, Birch, Hawthorn; tradition flavour plants ×3.

**Coven: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {covenLand} Coven` | E | 20 | all | the Fen Coven |
| `Circle of the {covenEmblem}` | B | 15 | all | Circle of the Hare |
| `{covenMembers} of the {colourRich} Moon` | B | 6 | all | Daughters of the Pale Moon |
| `the {covenEmblem} {covenGroup}` | E | 15 | all | the Hare Lodge |
| `{covenGroup} of the {colour} {covenEmblem}` | F | 15 | all | Lodge of the Grey Hare |
| `the {covenLand} {covenMembers}` | E | 10 | all | the Moor Sisters |
| `Grove of the {tree}` | B | 10 | all | Grove of the Yew |
| `the {number} of the {covenLand}` | E | 6 | all | the Seven of the Mere |

**School: lists**

- **`schoolGroup`:** School ×3, Academy, Garden, Porch, Walk, Hall, Way, Path, Circle.
- **`schoolMembers`:** Thinkers ×2, Walkers, Questioners, Listeners, Doubters, Followers, Students, Friends, Seekers.
- **`schoolPlace`:** Garden, Porch, Colonnade, Grove, Well, Market, Bridge, Hill, Library, Fountain.
- **`schoolIdea`:** Quiet Mind, Open Question, Still Water, Long View, Plain Truth, Second Thought, Measured Step, Empty Cup, Common Good, Clear Glass, Narrow Gate, Turning Wheel.

**School: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {emblem} School` | E | 20 | all | the Lamp School |
| `{schoolGroup} of the {schoolIdea}` | B | 20 | all | Way of the Still Water |
| `the {schoolPlace} {schoolMembers}` | E | 15 | all | the Garden Thinkers |
| `Followers of the {schoolIdea}` | B | 15 | all | Followers of the Long View |
| `{person:poss} School` | E | 10 | all | [teacher]'s School |
| `Academy of the {quality} {entity}` | F | 10 | all | Academy of the Still Lamp |
| `the {schoolIdea}` | E | 10 | all | the Plain Truth |

### 6.2 Armies and martial orders (`martial`)

| Key | Menu | Sentence | Settings | Weight | Front | Person |
|---|---|---|---|--:|---|---|
| `unit` | Regular units | regular units | all | 35 | – | commander |
| `chivalric` | Knightly and chivalric orders | knightly orders | all | 15 | – | founder |
| `mercenary` | Mercenary and free companies | mercenary companies | all | 15 | – | captain |
| `fleet` | Fleets and squadrons | fleets and squadrons | all | 10 | – | admiral |
| `watch` | Watch, police and law | watches and police forces | all | 10 | – | captain |
| `raiders` | Bandits, pirates and raiders | bandits and raiders | FL FH MF SF | 10 | – | captain |
| `guardians` | Guardians of a place | guardians of a place | FL FH MF SF | 5 | – | founder |

**Descriptions.** Unit: "Legions, regiments, battalions and starship troops". Chivalric: "Orders of knighthood and honour". Mercenary: "Free companies, sellswords and private military firms". Fleet: "Navies, squadrons and flotillas". Watch: "City watches, constabularies, marshals and police". Raiders: "Bandits, pirates, corsairs and raiders". Guardians: "Sworn guardians of a pass, coast or tower".

**Family lists**

- **`unitGroup`** (the book's "team" list, sorted by setting): Army, Battalion (×0.5 in FL and FH), Brigade, Cohort `(P)`, Century `(P)` ×0.5, Commandos `(M)` ×0.5, Company ×2, Contingent ×0.5, Division `(M)`, Force, Garrison, Guard ×2, Legion ×2, Militia, Patrol, Phalanx `(P)` ×0.5, Platoon `(M)`, Regiment ×2, Section `(M)` ×0.5, Squad `(M)`, Squadron, Troop, Vanguard, Host `(P)`, Warband `(P)` ×0.5, Banner `(P)`, Lance `(P)` ×0.5, Wing `(M)`, Detachment `(M)` ×0.5.
- **`soldiers`:** Champions ×0.5, Fighters ×0.5, Marines, Paladins (H), Riders, Skirmishers ×0.5, Soldiers, Troopers, Veterans ×2, Victors ×0.5, Warriors, Raiders, Rangers, Lancers, Blades, Bravos, Irregulars, Volunteers, Fencibles `(P)` ×0.5, Yeomen `(P)`, Janissaries `(P)` ×0.3, Sentinels; `(S)` Drop Troopers, Starfarers, Spacers, Exo-Troopers.
  *Removed from the book's list:* avengers (a well-known film and comic team), elite (an adjective).
- **`warders`** (the book's list): Defenders, Guardians, Guards, Keepers, Knights, Lords ×0.5, Preservers ×0.5, Protectors, Rangers, Sentinels, Sentries, Wardens ×2, Warders, Watchers ×2, Crusaders `(P)` ×0.3.
- **`mercs`:** Bandits, Destroyers ×0.5, Marauders, Pirates, Raptors ×0.5, Reavers, Sellswords, Freeswords, Free Lances, Condottieri ×0.2 (×3 for `mediterranean`), Contractors `(M)`, Devourers (H) ×0.3.
- **`gear`** (plural, from the book): Arrows, Axes, Blades ×2, Bows, Bucklers, Claws, Daggers, Darts, Fangs, Fists, Flails, Gauntlets, Halberds, Hammers, Helms, Knives, Lances, Maces, Pikes, Scythes, Shields, Spears, Swords, Talons, Teeth; `(PM)` Muskets, Sabres, Bayonets; `(S)` Lasers, Railguns, Lances.
- **`creatures`** (plural martial emblems): Bears, Boars, Bulls, Eagles, Falcons, Hawks, Hounds, Jaguars, Lions, Panthers, Rats, Scorpions, Sharks, Tigers, Vipers, Wolves ×2, Ravens, Stags, Wolverines, Badgers; Griffins, Dragons, Wyverns, Basilisks (×1 in fantasy, ×0.5 elsewhere); Angels ×0.5, Devils ×0.5. Tradition flavour animals, made plural, ×3.
- **`band`** (the book's group terms for desc + group shapes): `soldiers` 30, `warders` 15, `gear` 25, `creatures` 30, and `(S)` `starBand` 20.
- **`starBand`** `(S)`: Meteors, Comets, Novas, Pulsars, Quasars, Vipers, Hornets, Lancers, Spectres, Phantoms, Valkyries.
- **`arm`:** Foot ×3 `(P)`, Horse ×2 `(P)`, Rifles ×3 `(PM)`, Fusiliers `(PM)`, Dragoons `(PM)`, Lancers, Hussars `(PM)`, Grenadiers `(PM)`, Light Infantry `(PM)`, Bowmen `(P)`, Pikemen `(P)`, Archers `(P)`, Marines, Rangers, Artillery `(PM)`, Engineers `(M)`, Sappers `(PM)`, Cavalry, Yeomanry `(PM)`, Borderers, Fencibles `(P)` ×0.5, Mounted Infantry `(PM)` ×0.5, Highlanders (`celtic` only); `(S)` Drop Infantry, Armoured Infantry, Pathfinders, Orbital Marines, Recon.
- **`regimentOf`** (for "Regiment of …"): Foot ×3, Horse, Dragoons ×0.5, Marines ×0.5.
- **`element`:** Flame, Iron, Thunder, Winter, Stone, Storm, Ash, Night.

**Unit: nicknames**

- **`nickTrait`:** Steadfasts, Stubborns, Never-Yields, Mudlarks, Night-Owls, Lambs, Sweeps, Sprigs, Bucks, Moles, Larks, Ploughboys, Dandies, Greybacks, Ironbacks, Leatherheads, Stonewallers, Muddy Boots, Long Faces, Tin-Hats `(M)`, Die-Hards ×0.3 (flag list, §12).
- **`garment`:** Cuff, Sleeve, Coat, Jacket, Cap, Collar, Plume, Sash, Glove, Facing.
- **`nickAdj`:** Fighting ×2, Bloody ×0.5, Gallant, Faithful, Old ×2, Hungry, Lucky, Stubborn, Ragged, Saucy ×0.3.
- **`nickname`** is one of: `{nickTrait}` 35, `{colour}-{garment:pl}` 25 (Grey-Cuffs), `{creatures}` 20, `{nickAdj} {ordinalWord}` 20 (the Fighting Ninth).

**Unit: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `{person:poss} {band}` | E | 10 | all | [commander]'s Rats |
| `{desc} {band}` | E | 25 | all | Thunder Lances |
| `{desc} {desc} {unitGroup}` | E | 5 | all | Black Storm Legion |
| `{band} of the {land}` | B | 5 | all | Wolves of the Marches |
| `{band} of {element}` | B | 4 | all | Lions of Winter |
| `{ordinal} {unitGroup}` | F | 12 | all | 3rd Legion |
| `{ordinal} ({town}) Regiment of {regimentOf}` | F | 6 | FL MR | 14th (Saltgate) Regiment of Foot |
| `{ordinal} {town} {arm}` | F | 10 | all | 2nd Fenwick Rifles |
| `{ordinalWord} {unitGroup} of the {land}` | F | 6 | FL FH | Third Cohort of the Salt Road |
| `{ordinal} Battalion, {town} {arm}` | F | 5 | MR MF SF | 2nd Battalion, Ashby Fusiliers |
| `the {nickname}` | E | 10 | FL FH MR MF | the Grey-Cuffs |
| `{greek} {greek} {starBand}` | E | 4 | SF | Tau Xi Meteors |
| `{ordinal} {tech} {soldiers}` | F | 8 | SF | 7th Orbital Lancers |
| `Task Force {greek}` | F | 4 | SF; MR ×0.5 | Task Force Sigma |
| `{tech} {band}` | E | 8 | SF | Void Wolves |

**Chivalric: lists**

- **`knightEmblem`** (the book's knightly orders list, extended): Lily, Rose ×2, Oak, Rowan; Eagle, Falcon, Hawk, Swan; Dragon, Griffin, Hart ×2, Leopard, Lion ×2, Panther; Hand, Harp, Shell, Sun, Talisman; *added:* Star ×2, Spur, Sword, Crescent, Tower, Key, Bell, Unicorn, Stag, Boar, Pelican, Crane, Lamp, Anchor, Wheel, Ermine, Broom, Holly, Thistle ×0.5, Ship. Tradition flavour animals and plants ×2.
- **`chivMembers`:** Knights ×3, Companions ×2, Brothers ×2, Sergeants ×0.5, Paladins (H), Champions, Defenders, Sworn Brothers ×0.5.

**Chivalric: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Order of the {colour} {knightEmblem}` | F | 25 | all | Order of the White Hart |
| `Order of the {knightEmblem}` | F | 15 | all | Order of the Pelican |
| `Knights of the {knightEmblem}` | B | 15 | FL FH MF SF | Knights of the Rose |
| `Knights of the {colour} {knightEmblem}` | B | 10 | FL FH MF SF | Knights of the Silver Spur |
| `Most Noble Order of the {colour} {knightEmblem}` | F | 4 | all | Most Noble Order of the Golden Crane |
| `Order of {holy}` | F | 8 | FL FH MR MF | Order of Saint Ivo |
| `Knights Protector of the {land}` | F | 4 | FL FH MF | Knights Protector of the Marches |
| `{chivMembers} of the {knightEmblem}` | B | 8 | FL FH MF SF | Companions of the Swan |
| `the {colour} Knights` | E | 5 | FL FH MF SF | the Grey Knights |
| `the {knightEmblem} Knights` | E | 6 | FL FH MF SF | the Lily Knights |
| `the {colour} {knightEmblem:pl}` | E | 5 | all | the White Harts |
| `Royal {town} Order` | F | 4 | MR | Royal Saltgate Order |
| `Order of {town}` | F | 4 | MR | Order of Fenwick |
| `Knights of {star}` | F | 6 | SF | Knights of Arcturus |
| `Order of the {tech} Star` | F | 4 | SF | Order of the Orbital Star |

**Mercenary: lists**

- **`securitySuffix`** `(M)`: Security ×2, Defence Solutions, Risk Management, Tactical, Protection Services, Strategic Services.

**Mercenary: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {desc} {emblem} Company` | E | 20 | FL FH MF SF | the Grey Lantern Company |
| `the {colour} Company` | E | 8 | FL FH MF SF | the Russet Company |
| `{person:poss} {mercs}` | E | 15 | all | [captain]'s Sellswords |
| `Free Company of the {emblem}` | F | 10 | FL FH | Free Company of the Anvil |
| `the {town} {mercs}` | E | 5 | all | the Saltgate Bravos |
| `the {desc} {creatures}` | E | 10 | all | the Iron Wolves |
| `{surname} {securitySuffix}` | B | 15 | MR MF SF | Halvorsen Security |
| `{brandRoot} {securitySuffix}` | B | 10 | MR MF SF | Kestrel Defence Solutions |

**Fleet: lists**

- **`fleetGroup`:** Fleet ×3, Squadron ×3, Flotilla ×2, Armada (FL FH SF), Navy `(M)`, Patrol, Picket `(M)` ×0.5, Convoy ×0.5, Task Group `(M)`, Battle Group `(S)`.
- **`fleetQuality`:** Storm, Grey, Swift, Silent, Iron, Night, Long, Salt, Thunder, Winter.

**Fleet: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {compass} Squadron` | B | 15 | all | the Western Squadron |
| `{ordinal} Fleet` | F | 15 | all | 3rd Fleet |
| `the {town} {fleetGroup}` | B | 10 | all | the Fenwick Squadron |
| `{town} Navy` | F | 5 | MR MF SF | Saltgate Navy |
| `the {fleetQuality} Flotilla` | E | 10 | all | the Storm Flotilla |
| `{ordinal} {tech} Flotilla` | F | 10 | SF | 4th Void Flotilla |
| `Task Group {greek}` | F | 8 | SF; MR ×0.5 | Task Group Kappa |
| `Squadron of the {colour} {knightEmblem}` | F | 8 | FL FH | Squadron of the Black Swan |
| `the {colour} Fleet` | E | 10 | all | the Scarlet Fleet |
| `the {land} Patrol` | E | 5 | all | the Narrows Patrol |

**Watch: lists**

- **`watchGroup`:** Watch ×3, Guard ×2, Wardens, Marshals, Peacekeepers `(M)`, Runners, Thief-Takers `(P)`, Proctors ×0.5, Beadles `(P)` ×0.3, Rangers, Patrol, Inquisitors (H) ×0.5.
- **`lawPursuit`** `(M)`: Inquiry, Investigation, Public Safety, Public Order, Special Cases, Missing Persons, Unusual Crimes `(MF)`.
- **`enforcement`** `(S)`: Enforcement Division, Security Directorate, Colonial Marshals, Station Security.

**Watch: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {town} Watch` | B | 20 | FL FH MF SF | the Saltgate Watch |
| `{town} Constabulary` | F | 10 | MR MF; FL ×0.5 | Ashby Constabulary |
| `the {land} Watch` | E | 8 | FL FH MF | the Bridge Watch |
| `Bureau of {lawPursuit}` | F | 8 | MR MF SF | Bureau of Public Order |
| `{ordinal} Precinct` | F | 5 | MR MF | 12th Precinct |
| `the {colour}-Coats` | E | 10 | FL FH MR MF | the Grey-Coats |
| `Wardens of the {land}` | B | 10 | FL FH MF SF | Wardens of the Docks |
| `{town} Marshals` | E | 8 | all | Fenwick Marshals |
| `{town} {enforcement}` | F | 8 | SF | Vega Station Security |
| `{watchGroup} of the {land}` | B | 6 | all | Proctors of the Old Road |

"the Red-Coats" is excluded by the flag list (§12) and redrawn only if flag-list blocking is on.

**Raiders: lists**

- **`raiders`:** Bandits, Brigands, Corsairs, Freebooters, Buccaneers, Marauders, Outlaws ×0.5, Pirates, Raiders ×2, Reavers ×2, Rovers, Sea-Wolves, Wreckers, Wolves.
- **`raiderEmblem`:** Tide, Sail, Flag, Hook, Skull, Anchor, Shark, Wave, Gull, Wind, Moon.

**Raiders: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Brethren of the {colour} {raiderEmblem}` | B | 10 | FL FH SF | Brethren of the Red Tide |
| `{person:poss} {raiders}` | E | 20 | all | [captain]'s Reavers |
| `the {desc} {gear}` | E | 20 | all | the Long Knives |
| `{raiders} of the {land}` | B | 15 | all | Reavers of the Salt Coast |
| `the {land} {raiders}` | E | 10 | all | the Marsh Brigands |
| `the {tech} {raiders}` | E | 15 | SF | the Void Corsairs |
| `the {colour} {creatures}` | E | 10 | all | the Black Sharks |

**Guardians: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `{warders} of the {land}` | B | 40 | all | Watchers of the Crags |
| `the {land} {warders}` | E | 25 | all | the Fen Wardens |
| `Guardians of the {desc} {land}` | F | 10 | all | Guardians of the Iron Pass |
| `the {colour} Watch` | E | 10 | all | the Grey Watch |
| `Keepers of the {knightEmblem}` | B | 15 | all | Keepers of the Tower |

### 6.3 Thieves and the underworld (`underworld`)

| Key | Menu | Sentence | Settings | Weight | Front | Person |
|---|---|---|---|--:|---|---|
| `thieves` | Thieves' guilds | thieves' guilds | FL FH MF | 25 | euphemism (thieves) | leader |
| `assassins` | Assassins' guilds | assassins' guilds | FL FH MF SF | 15 | euphemism (assassins) | leader |
| `gang` | Street gangs | street gangs | all | 20 | business | leader |
| `syndicate` | Crime families and syndicates | crime families and syndicates | all | 15 | business | boss |
| `smugglers` | Smuggling rings | smuggling rings | all | 15 | free traders | leader |
| `crew` | Heist and hacker crews | heist and hacker crews | MR MF SF | 10 | business | leader |

**Descriptions.** Thieves: "Guilds of thieves, cutpurses and housebreakers". Assassins: "Guilds of assassins, from a recognised trade to a whispered rumour". Gang: "Street gangs from rookeries to neon-lit levels". Syndicate: "Crime families, outfits and cartels". Smugglers: "Smuggling rings, owlers and blockade runners". Crew: "Heist crews and hacker collectives".

**Family lists**

- **`shade`** (the book's descriptions, extended): Black, Dark, Dim, Dusk ×2, Fog, Gloom, Grey, Night ×2, Shade, Shadow ×2, Smoke, Quiet ×2, Subtle, Whisper, Bloody ×0.5, Hidden, Red, Ready, Sharp, Sudden, Velvet ×1.5, Silent, Soft, Still, Crooked, Nimble, Lean, Cold, Long, Narrow, Hollow, Sly, Quick, Midnight, Moonless.
- **`uWeapon`:** Blade, Bolt, Claw, Dagger, Dirk, Fang, Hand ×2, Knife ×2, Razor, Needle, Stiletto ×0.5, Sting, Cosh `(PM)` ×0.5, Garrotte ×0.3.
- **`uItem`:** Balance, Hourglass, Scales, Cloak, Cowl, Hand, Hood, Mantle, Mask ×2, Glove, Key, Lock, Lantern, Coin, Purse, Candle, Thread.
- **`uCreature`** (plural): Snakes, Scorpions, Spiders, Bats, Cats, Jackdaws, Dogs, Owls, Magpies, Rats ×2, Weasels, Foxes, Stoats, Ferrets, Crows, Moths, Eels, Vipers, Jackals.
- **`agents`** (from the book's actions): Finders, Hunters, Seekers, Shadows, Slayers, Stalkers ×2, Takers, Cutters, Lifters, Pickers, Walkers, Creepers, Prowlers, Light-Fingers.
- **`thiefGroup`:** Guild ×3, Brotherhood ×2, Fellowship, Band, Crew, Company, Ring, Family, Hand, Lodge, Society, Brethren.
- **`lastThing`:** Last Breath, Final Hour, Long Sleep, Quiet End, Closed Eye, Cut Thread, Still Heart, Last Candle, Folded Hands, Empty Chair.

**Thieves: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {shade} {uWeapon/uItem}` | E | 25 | all | the Velvet Hand |
| `{shade} {agents}` | E | 15 | all | Dusk Prowlers |
| `{thiefGroup} of the {uItem}` | B | 15 | all | Brotherhood of the Lantern |
| `the {agents:poss} {thiefGroup}` | E | 10 | all | the Lifters' Guild |
| `the {uCreature}` | E | 10 | all | the Jackdaws |
| `the {shade} {uCreature}` | E | 10 | all | the Night Moths |
| `{person:poss} {agents}` | E | 5 | all | [leader]'s Creepers |
| `the {town} {thiefGroup}` | E | 5 | all | the Saltgate Ring |
| `Knights of the {uWeapon}` | B | 5 | all | Knights of the Dirk |

**Assassins: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `House of the {lastThing}` | B | 20 | all | House of the Last Breath |
| `the {shade} {uWeapon}` | E | 20 | all | the Velvet Knife |
| `Brotherhood of the {uItem}` | B | 15 | all | Brotherhood of the Hourglass |
| `the {uCreature}` | E | 10 | all | the Spiders |
| `{shade} {agents}` | E | 15 | all | Quiet Stalkers |
| `the {number} {uWeapon:pl}` | E | 10 | all | the Seven Knives |
| `{thiefGroup} of the {lastThing}` | F | 10 | all | Fellowship of the Long Sleep |

Assassins draw `agents` from Hunters, Slayers, Stalkers, Takers and Cutters only.

**Gang: lists**

- **`gangMembers`:** Boys ×3, Lads, Girls, Lasses ×0.5, Mob ×2, Crew ×2, Gang ×2, Set `(M)`, Firm ×0.5, Kings ×0.5, Lords, Saints, Jackals, Dogs, Hounds.
- **`gangWear`:** Caps, Scarves, Jackets, Boots, Hats, Bandanas `(M)`, Gloves, Ribbons, Feathers, Coats, Sashes, Hoods.
- **`gangNoun`:** Lamplighters, Sweeps, Jackdaws, Razors `(PM)`, Rooks, Alley Cats, Ragged Kings, Monkeys, Moles, Ferrets, Hooks, Pennies, Farthings `(P)`, Sixpences `(PM)`, Dockers, Tanners.
- **`street`:** `{streetFirst} {streetLast}`; in SF, one of Deck `{1–40}`, Ring `{greek}`, Level `{1–99}`, Sector `{1–20}`.
  - **`streetFirst`:** Tanner, Mill, Rope, Brewer, Cooper, Chandler, Fish, Bell, Gallows, Market, Water, Dock, Coal, Salt, Bridge, King, Queen, Ash, Elm, Cherry, Sheep, Hog, Angel, Hope, Paradise.
  - **`streetLast`:** Street ×3, Lane ×2, Row, Yard, Road, Court, Alley, Walk, Steps, Wharf.
- **`urbanArea`** `(M)`: Dockside, Northside, Southside, Eastside, Westside, Riverside, Uptown, Downtown, Underground, Canalside.

**Gang: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {street} {gangMembers}` | E | 25 | all | the Tanner Street Boys |
| `the {gangNoun}` | E | 20 | FL FH MR MF | the Lamplighters |
| `the {colour} {gangWear}` | E | 15 | all | the Red Scarves |
| `the {urbanArea} {gangMembers}` | E | 10 | MR MF SF | the Dockside Crew |
| `the {urban} {gangNoun/gangMembers}` | E | 15 | MR MF SF | the Neon Jackals |
| `{person:poss} {gangMembers}` | E | 10 | all | [leader]'s Lads |

**Syndicate: lists**

- **`firm`:** Outfit, Combine, Concern, Organisation, Syndicate ×2, Cartel `(M)` ×0.5, Ring, Family ×2, Clan ×0.5, Brotherhood, Consortium `(S)`.
- **`portPlaces`:** Ports, Bridges, Docks, Gates, Lanes, Wharves, Towers, Markets.

**Syndicate: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {surname} Family` | E | 20 | all | the Harrow Family |
| `the {town} {firm}` | E | 15 | all | the Saltgate Syndicate |
| `the {number} {portPlaces}` | E | 15 | all | the Five Bridges |
| `the {shade} Hand` | E | 5 | all | the Velvet Hand |
| `{person:poss} {firm}` | E | 10 | all | [boss]'s Outfit |
| `the {surname} {firm}` | E | 10 | all | the Harrow Combine |
| `the {urban} {firm}` | E | 5 | SF | the Chrome Cartel |
| `the {colour} {emblem} {thiefGroup}` | E | 5 | all | the Jade Crane Society |

**Smugglers: lists**

- **`smugglerAgents`:** Owlers ×2, Free Traders, Lantern Men, Tide-Runners, Gentlemen, Runners ×2, Landers, Blockade Runners `(M)`.

**Smugglers: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {town} Ring` | E | 20 | all | the Saltgate Ring |
| `the {land} {smugglerAgents}` | E | 20 | all | the Marsh Owlers |
| `the {shade} {smugglerAgents}` | E | 15 | all | the Moonless Runners |
| `Gentlemen of the {land}` | B | 10 | FL FH MR MF | Gentlemen of the Shore |
| `{person:poss} {smugglerAgents}` | E | 10 | all | [leader]'s Lantern Men |
| `the {tech} Runners` | E | 15 | SF | the Void Runners |
| `the {colour} Lanterns` | E | 10 | all | the Blue Lanterns |

**Crew: lists**

- **`crewCollective`:** Choir, Collective, Cell, Crew ×2, Front, Circle, Kids, Ghosts, Saints, Wolves, Syndicate, Club.
- **`techWord`:** Null, Static, Zero, Glass, Cipher, Ghost, Echo, Proxy, Kernel, Packet, Signal, Neon, Chrome, Cold Boot ×0.5, Root, Vector, Mirror, Shadow, Rust, Silicon.
- **`crewNoun`:** Ghosts, Saints, Keys, Locks, Masks, Gloves, Shadows.

**Crew: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `{techWord} {crewCollective}` | E | 40 | all | Null Choir |
| `the {techWord} {uCreature}` | E | 15 | all | the Static Ferrets |
| `{person:poss} Crew` | E | 15 | all | [leader]'s Crew |
| `the {number} {crewNoun}` | E | 10 | all | the Seven Masks |
| `the {colour} {gangWear}` | E | 10 | all | the White Gloves |
| `{greek} {crewCollective}` | E | 10 | SF | Sigma Cell |

### 6.4 Guilds and trading houses (`trade`)

| Key | Menu | Sentence | Settings | Weight | Front | Person |
|---|---|---|---|--:|---|---|
| `craft` | Craft guilds and livery companies | craft guilds | all | 30 | – | founder |
| `merchant` | Merchant houses and trading companies | merchant houses | all | 25 | – | founder |
| `bank` | Banks and finance houses | banks | all | 10 | – | founder |
| `corp` | Corporations and megacorps | corporations | MR MF SF | 15 | – | founder |
| `union` | Unions and workers' associations | unions | MR MF SF | 10 | – | founder |
| `caravan` | Caravans and shipping lines | caravans and shipping lines | all | 10 | – | master |

**Descriptions.** Craft: "Craft guilds and livery companies". Merchant: "Merchant houses, chartered companies and trade consortia". Bank: "Banks, counting houses and finance houses". Corp: "Corporations, conglomerates and megacorps". Union: "Trade unions, friendly societies and workers' collectives". Caravan: "Caravans, shipping lines and freight companies".

**Family lists**

- **`tradesmen`:** Armourers, Bakers, Barbers, Bellfounders, Blacksmiths, Bookbinders, Bowyers, Brewers, Broderers, Butchers, Candlemakers, Carpenters, Cartographers, Chandlers, Clockmakers, Clothworkers, Coopers, Cordwainers, Cutlers, Drapers, Dyers, Farriers, Feltmakers, Fishmongers, Fletchers, Founders, Glassblowers, Glaziers, Glovers, Goldsmiths, Grocers, Haberdashers, Ironmongers, Joiners, Lanternmakers, Leathersellers, Locksmiths, Masons, Mercers, Millers, Needlemakers, Painters, Perfumers, Pewterers, Plasterers, Potters, Ropemakers, Saddlers, Salters, Scriveners, Shipwrights, Skinners, Spectacle Makers, Stationers, Tanners, Tilers, Turners, Vintners, Weavers, Wheelwrights, Woolmen.
  - `(MO)` adds: Electricians, Engineers, Printers, Mechanics, Plumbers, Builders, Surveyors, Typesetters.
  - `(H)` adds: Alchemists, Enchanters, Runecarvers, Wandwrights, Golemwrights, Beast-Tamers, Spell-Scribes.
  - `(S)` replaces the list with: Pilots, Navigators ×0.5, Engineers, Riggers, Salvagers, Fabricators, Terraformers, Prospectors, Couriers, Data-Brokers, Shipwrights, Medics.
- **`craftHonorific`:** Worshipful ×3 `(PM)`, Honourable ×2, Ancient, Royal, Venerable ×0.5, Most Excellent ×0.3.
- **`goods`:** Spice, Salt, Wool, Silk, Amber, Tea, Furs, Timber, Wine, Iron, Copper, Tin, Pepper, Saffron, Indigo, Cotton, Coffee `(PM)`, Grain, Horses, Pearls, Glass, Paper, Cloth; `(S)` replaces with: Ore, Ice, Water, Data, Fuel, Salvage, Helium, Alloys, Medicines.
- **`tradeDesc`:** Royal, Golden, Silver, Old, Black, Red, Green, Iron, Honest, Good.
- **`bankWord`:** Bank ×3, Savings Bank `(MO)`, Mutual `(MO)`, Building Society `(MO)`, Exchange, Counting House `(P)`, Trust, Credit Union `(M)`, Capital `(M)`.
- **`combineWord`** `(S)`: Combine, Consortium, Concern, Syndicate.
- **`unionTrade`** `(M)`: Dockers, Miners, Railwaymen, Weavers, Printers, Seamen, Engineers, Carters, Teachers, Nurses, Clerks, Bakers, Postal Workers, Shipbuilders, Steelworkers, Drivers; `(S)` replaces with: Spacers, Belt Miners, Dock Hands, Ring Workers, Hydroponic Growers, Ice Haulers, Reactor Crews.
- **`lineEmblem`:** Pennant ×2, Star, Anchor, Funnel `(M)`, Ensign, Flag, Diamond, Ribbon, Band.
- **`wellPlaces`:** Wells, Oases, Palms, Stars.

**Craft: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `{craftHonorific} Company of {tradesmen}` | F | 20 | all | Worshipful Company of Lanternmakers |
| `Guild of {tradesmen}` | F | 20 | all | Guild of Ropemakers |
| `the {tradesmen:poss} Guild` | E | 20 | all | the Glovers' Guild |
| `{tradeDesc} {emblem} {tradesmen}` | E | 10 | all | Golden Anvil Smiths |
| `{tradesmen} of the {colour} {emblem}` | B | 10 | all | Weavers of the Silver Shuttle |
| `the {town} {tradesmen}` | E | 10 | all | the Saltgate Coopers |
| `Fellowship of {tradesmen}` | F | 5 | all | Fellowship of Scriveners |
| `Guild of {tech} {tradesmen}` | F | 10 | SF | Guild of Void Pilots |

**Merchant: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `House {house}` | B | 15 | FL FH SF | House Velloran |
| `the {compass} Company` | E | 10 | FL FH MR MF | the Eastern Company |
| `the {town} Company` | E | 8 | all | the Fenwick Company |
| `Honourable Company of {goods} Merchants` | F | 8 | all | Honourable Company of Saffron Merchants |
| `{goods} Merchants of {town}` | F | 10 | all | Salt Merchants of Ashby |
| `{surname} & {surname}` | B | 12 | all | Ashby & Thorne |
| `Merchant Adventurers of {town}` | F | 5 | FL FH | Merchant Adventurers of Saltgate |
| `the {town} {goods} Company` | E | 12 | all | the Saltgate Spice Company |
| `Company of the {knightEmblem}` | B | 8 | FL FH | Company of the Crane |
| `{brandRoot} Trading {combineWord}` | F | 10 | SF | Meridian Trading Combine |
| `{town} Trade Consortium` | F | 5 | MR MF SF | Vega Trade Consortium |

**Bank: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `{surname} & {surname}` | B | 25 | all | Hale & Varden |
| `{surname} Brothers` | B | 8 | all | Pell Brothers |
| `Bank of {town}` | F | 15 | all | Bank of Fenwick |
| `{town} {bankWord}` | F | 15 | all | Saltgate Savings Bank |
| `House of {surname}` | F | 10 | FL FH | House of Garrick |
| `the {colour} {various} Bank` | E | 10 | all | the Golden Key Bank |
| `{surname}, {surname} & Co.` | F | 10 | FL FH MR MF | Venn, Larkin & Co. |
| `{brandRoot} Capital` | F | 7 | MR MF SF | Argent Capital |

**Corp: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `{brandRoot} {corpSuffix}` | B | 45 | MR MF SF | Kestrel Dynamics |
| `{surname}–{surname}` | B | 10 | MR MF SF | Harrow–Vance |
| `{town} {corpSuffix}` | B | 15 | MR MF SF | Northfield Heavy Industries |
| `{brandStart}{brandEnd}` | B | 10 | MR MF SF | Ventrix |
| `{surname} {corpSuffix}` | B | 10 | MR MF SF | Tarrant Logistics |
| `{initials}` | E | 10 | MR MF SF | NHI |

**Union: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Amalgamated Society of {unionTrade}` | F | 20 | MR MF SF | Amalgamated Society of Carters |
| `the {town} {unionTrade:poss} Union` | B | 25 | MR MF SF | the Saltgate Dockers' Union |
| `National Union of {unionTrade}` | F | 15 | MR MF | National Union of Printers |
| `{unionTrade:poss} Friendly Society` | F | 10 | MR MF | Railwaymen's Friendly Society |
| `United Brotherhood of {unionTrade}` | F | 10 | MR MF SF | United Brotherhood of Belt Miners |
| `the {unionTrade:poss} Collective` | E | 10 | SF | the Ice Haulers' Collective |
| `{initials}` | E | 10 | MR MF SF | ASC |

**Caravan: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {land} Caravan` | E | 15 | FL FH | the Salt Road Caravan |
| `Caravan of the {number} {wellPlaces}` | F | 10 | FL FH | Caravan of the Seven Wells |
| `{person:poss} Caravan` | E | 10 | FL FH | [master]'s Caravan |
| `the {colour} {lineEmblem} Line` | E | 20 | FL FH MR MF | the Blue Pennant Line |
| `{town} Steam Packet Company` | F | 8 | MR MF | Fenwick Steam Packet Company |
| `the {surname} Line` | E | 12 | all | the Pell Line |
| `{town} Freight` | B | 10 | MR MF SF | Ashby Freight |
| `{brandRoot} Lines` | B | 8 | SF | Halcyon Lines |
| `{star} Transit` | B | 7 | SF | Capella Transit |

### 6.5 Adventurers and explorers (`adventure`)

| Key | Menu | Sentence | Settings | Weight | Front | Person |
|---|---|---|---|--:|---|---|
| `company` | Adventuring companies | adventuring companies | FL FH MF SF | 50 | – | leader |
| `expedition` | Expeditions and survey corps | expeditions | all | 25 | – | leader |
| `hunters` | Hunter and slayer lodges | hunters' lodges | FL FH MF SF | 25 | – | leader |

**Descriptions.** Company: "Adventuring parties with a name to build". Expedition: "Expeditions, surveys and exploring societies". Hunters: "Lodges of monster hunters, slayers and bounty hunters".

In `MR` only expeditions are available.

**Company: borrowed shapes.** Following the book's d10 (mystic 1, thieves 2, military 3–5, tavern 6–0), a company name is drawn as:

| Source | Share | Shapes used |
|---|--:|---|
| Mystic | 10% | the esoteric shapes (§6.1) |
| Thieves | 10% | the thieves' shapes (§6.3) |
| Martial | 30% | the unit shapes with form E, and the mercenary shapes (§6.2) |
| Own (tavern heraldry) | 50% | the table below |

Borrowed shapes keep their own lists and form tags. Front never applies.

**Company: lists**

- **`companyGroup`:** Company ×3, Fellowship ×2, Band ×2, Alliance, Brotherhood, Sisterhood, League, Order ×0.5, Crew `(M)`, Society ×0.5.
- **`vocation`:** Swords, Blades, Hunters, Foresters, Rangers, Scouts, Pilgrims, Delvers, Wanderers, Seekers, Pathfinders; (H) Wizards, Witches, Spellblades ×0.3.
- **`compound`** (closed or hyphenated nouns): Crackbones, Bonebreakers, Stormchasers, Gravediggers, Duskwalkers, Lockbreakers, Coin-Finders, Fatecasters, Ironsingers, Ashwalkers, Starfinders, Mudlarks, Luckhunters, Doomsayers ×0.5, Gatecrashers, Mapmakers, Wayfinders, Pathbreakers, Lantern-Bearers, Kettle-Breakers ×0.5; (H) Wyrmtakers, Dungeon-Delvers.

**Company: own shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `{companyGroup} of the {emblem}` | B | 12 | all | Fellowship of the Wren |
| `{companyGroup} of the {colour} {emblem}` | B | 10 | all | Company of the Red Kettle |
| `the {colour} {creature:pl}` | E | 8 | all | the Grey Wolves |
| `{tradeDesc} {emblem} {vocation}` | E | 6 | all | Green Oak Foresters |
| `the {compound}` | E | 5 | all | the Stormchasers |
| `{compound} Company` | E | 3 | all | Crackbones Company |
| `the {number} in {colour}` | E | 3 | all | the Five in Russet |
| `{person:poss} {companyGroup}` | E | 6 | all | [leader]'s Band |
| `Company of the {ordinalWord} {emblem}` | F | 4 | all | Company of the Seventh Key |
| `the {emblem} and {emblem} Company` | E | 3 | all | the Bear and Barrel Company |
| `the {tech} {creature:pl}` | E | 6 | SF | the Void Larks |

`{compound} Company` uses the singular form (Crackbone Company): store each compound's singular too.

**Expedition: lists**

- **`expPlace`:** Far North, Southern Ice, Inland Sea, Interior, Sunken Coast, High Passes, Outer Isles, Western Ocean, Lost Valley, Great Forest, Burning Sands, Long River; `(S)` replaces with: Deep Rim, Outer Belt, Far Drift, Silent Reach, Kepler Gap, Inner Halo.
- **`expQuality`** `(S)`: Deep, Far, Long-Range, Outer, Frontier, Pathfinder.

**Expedition: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {expPlace} Expedition` | B | 25 | all | the Southern Ice Expedition |
| `{person:poss} Expedition` | B | 20 | all | [leader]'s Expedition |
| `the {expPlace} Survey` | B | 10 | all | the Inland Sea Survey |
| `Royal {expPlace} Survey` | F | 8 | FL FH MR MF | Royal High Passes Survey |
| `{expQuality} Survey Corps` | F | 10 | SF | Deep Survey Corps |
| `Society for the Exploration of the {expPlace}` | F | 7 | all | Society for the Exploration of the Interior |
| `Company of {expPlace} Pathfinders` | F | 5 | all | Company of Outer Isles Pathfinders |
| `{ordinal} {town} Expedition` | F | 5 | MR MF SF | 3rd Saltgate Expedition |
| `{greek} Expedition` | E | 10 | SF | Theta Expedition |

**Hunters: lists**

- **`monster`:** (H) Wyrm, Ghoul, Troll, Vampire, Werewolf, Wight, Hag, Giant, Drake, Shade, Witch ×0.3; all: Wolf, Boar, Bear, Beast; `(S)` Void-Beast, Bug ×0.5.
- **`hunterNoun`:** Hunters ×2, Wardens, Takers, Slayers, Stalkers, Huntsmen, Trackers.
- **`retrieval`** `(M)`: Retrievals, Recovery Services, Bounty Office, Acquisitions.

**Hunters: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Lodge of the {colour} {beast}` | B | 25 | all | Lodge of the Grey Hound |
| `the {monster} {hunterNoun}` | E | 25 | all | the Ghoul Takers |
| `the {town} Huntsmen` | E | 10 | FL FH MF | the Fenwick Huntsmen |
| `Order of the {colour} {weapon}` | F | 10 | FL FH MF | Order of the Silver Bolt |
| `Brotherhood of the {desc} Hunt` | F | 10 | all | Brotherhood of the Long Hunt |
| `{person:poss} {retrieval}` | B | 10 | MF SF | [leader]'s Retrievals |
| `the {tech} {hunterNoun}` | E | 10 | SF | the Void Trackers |
| `Hunters' Brotherhood of the {land}` | F | 3 | FL FH MF | Hunters' Brotherhood of the Fens |

### 6.6 Powers and factions (`power`)

| Key | Menu | Sentence | Settings | Weight | Front | Person |
|---|---|---|---|--:|---|---|
| `council` | Councils and courts | councils | all | 15 | – | founder |
| `faction` | Factions and parties | factions | all | 20 | – | leader |
| `secret` | Secret societies and conspiracies | secret societies | all | 15 | society | founder |
| `rebels` | Rebels and resistance movements | rebel movements | all | 15 | society | leader |
| `league` | Leagues and alliances | leagues | all | 10 | – | founder |
| `agency` | Agencies and intelligence services | agencies | all | 15 | office | spymaster |
| `house` | Noble and great houses | great houses | FL FH MF SF | 10 | – | founder |

**Descriptions.** Council: "Ruling councils, courts and assemblies". Faction: "Political factions and parties". Secret: "Conspiracies and secret societies with political aims". Rebels: "Rebels, resistance movements and risings". League: "Leagues, alliances and compacts". Agency: "Spy networks and intelligence services". House: "Noble and great houses".

**Family lists**

- **`assemblyWord`:** Assembly ×2, Senate, Moot `(P)`, Parliament `(M)` ×0.5, Conclave, Synod ×0.3, Witan ×0.3 (×5 for `germanic`).
- **`directorate`** `(M)`: Directorate, Committee, Authority, Commission, Board.
- **`councilQuality`:** Silent, Hidden, Old, Inner, Upper, Lower, Lesser, Greater.
- **`ideal`:** Commonweal, Hearth, Crown, Liberty, Unity, Progress, Order, Reform, Concord, Plenty, Covenant, Restoration, Commons, Charter, Land, Harvest, Bread, Lantern, Plough, Anchor, Rose; `(M)` Tomorrow, Future; `(S)` Frontier.
- **`factionColour`:** Blues, Greens, Golds, Greys, Purples, Ambers.
- **`factionNick`:** Hedgers, Bellringers, Roundcaps, Weathercocks, Long Wigs, Cockades, Brooms, Turnips ×0.5, Candlemen, Hearthmen, Sheaves, Levellers ×0.3, Diggers ×0.3.
- **`secretItem`:** Door, Key, Table, Lamp, Seal, Ring, Glove, Mask, Ledger, Quill, Candle, Cup, Mirror, Thread, Coin, Chair, Window, Stair.
- **`secretQuality`:** Closed, Quiet, Hidden, Silent, Second, Empty, Folded, Sealed, Locked, Unlit, Turning, Inner, Last.
- **`rebelQuality`:** Broken, Fallen, Last, Burning, Free, Rising, Unbowed, Hidden, Uncrowned, Unbroken.
- **`rebelEmblem`:** Crown, Sword, Oak, Banner, Flame, Star, Wheel, Plough, Bell, Chain, Gate, Rose.
- **`rebelGroup`:** Front, Movement ×2, Army ×0.5, Militia, Brotherhood, Rising, Alliance.
- **`rebelWear`:** Ribbons, Cockades, Sashes, Caps, Scarves, Armbands.
- **`season`** (fantasy calendar): Thaw, Seedtime, Midsummer, Harvest, Leaf-Fall, Frost, Deepwinter.
- **`month`** `(M)`: January … December.
- **`cityWord`:** Harbour, City, Town, Port, River, Valley, Crown, Tower, Gate; `(S)` replaces with: World, Moon, Station, Colony, Habitat.
- **`leagueGroup`:** League ×3, Alliance ×2, Concord, Compact, Covenant, Union, Accord, Federation `(M)`, Commonwealth `(M)`, Confederacy, Coalition, Pact, Entente ×0.3, Concordat ×0.3, Hegemony `(S)` ×0.5.
- **`agencyPursuit`** `(M)`: Unusual Affairs, Special Operations, Internal Security, External Affairs, Continuity, Records, Correspondence, Public Safety, Strategic Studies, Information; `(MF)` Arcane Affairs, Unusual Phenomena, Hidden Matters.
- **`spyWord`:** Eyes ×2, Ears, Shadows, Quills, Whisperers, Hands, Lanterns, Ravens.
- **`ruler`:** King ×2, Queen ×2, Duke, Prince, Regent, Emperor, Empress, Countess, Doge ×0.3, Margrave ×0.3.

**Council: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Council of {number} {various:pl}` | F | 15 | all | Council of Seven Lamps |
| `the {colour} Chamber` | E | 10 | all | the Amber Chamber |
| `Council of {town}` | F | 10 | all | Council of Saltgate |
| `the {number}` | E | 10 | all | the Nine |
| `the {councilQuality} Court` | E | 10 | all | the Silent Court |
| `{town} {assemblyWord}` | F | 15 | all | Fenwick Moot |
| `the {town} {directorate}` | B | 10 | MR MF SF | the Vega Authority |
| `{ordinal} Directorate` | F | 5 | SF | 4th Directorate |
| `the {colour} Table` | E | 5 | all | the Green Table |

**Faction: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {ideal} Party` | B | 20 | all | the Hearth Party |
| `the {factionColour}` | E | 10 | all | the Ambers |
| `{town} {ideal} League` | F | 10 | all | Saltgate Reform League |
| `{ideal} and {ideal}` | E | 10 | all | Crown and Hearth |
| `Friends of the {ideal}` | B | 10 | all | Friends of the Charter |
| `the {factionNick}` | E | 20 | FL FH MR MF | the Bellringers |
| `the {ideal} Faction` | E | 5 | all | the Plough Faction |
| `Party of the {ideal}` | F | 5 | all | Party of the Commons |
| `Movement for {ideal}` | F | 5 | MR MF SF | Movement for Tomorrow |

**Secret: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Society of the {secretQuality} {secretItem}` | B | 25 | all | Society of the Closed Door |
| `the {secretQuality} {secretItem}` | E | 20 | all | the Quiet Table |
| `the {number}` | E | 8 | all | the Twelve |
| `Brotherhood of the {entity}` | B | 10 | all | Brotherhood of the Seal |
| `the {colour} {secretItem}` | E | 10 | all | the Amber Glove |
| `Friends of {person}` | B | 10 | all | Friends of [founder] |
| `the {number} {secretItem:pl}` | E | 12 | all | the Seven Keys |
| `Order of the {secretQuality} {secretItem}` | F | 5 | all | Order of the Unlit Lamp |

**Rebels: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Sons of the {rebelQuality} {rebelEmblem}` | B | 12 | all | Sons of the Broken Crown |
| `Daughters of the {rebelQuality} {rebelEmblem}` | B | 6 | all | Daughters of the Burning Bell |
| `{town} Liberation Front` | F | 10 | MR MF SF | Fenwick Liberation Front |
| `Free {town} {rebelGroup}` | B | 12 | all | Free Saltgate Movement |
| `the {colour} {rebelWear}` | E | 10 | all | the Green Ribbons |
| `the {ordinalWord} of {season} Movement` | F | 4 | FL FH | the Third of Thaw Movement |
| `{ordinal} of {month} Movement` | F | 4 | MR MF | 9th of March Movement |
| `Army of the {ideal}` | F | 6 | all | Army of the Commons |
| `{person:poss} Rising` | E | 10 | all | [leader]'s Rising |
| `the {rebelQuality} Hand` | E | 5 | all | the Uncrowned Hand |
| `Rebels of the {land}` | E | 10 | all | Rebels of the High Passes |

**League: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `League of {number} {cityWord:pl}` | F | 20 | all | League of Nine Harbours |
| `the {councilQuality} Concord` | E | 10 | all | the Greater Concord |
| `{town} {leagueGroup}` | F | 20 | all | Saltgate Compact |
| `the {ideal} {leagueGroup}` | B | 15 | all | the Hearth Alliance |
| `Union of {town} and {town}` | F | 5 | all | Union of Ashby and Fenwick |
| `the {number} {cityWord:pl}` | E | 10 | all | the Seven Ports |
| `Coalition of {number} Worlds` | F | 10 | SF | Coalition of Twelve Worlds |
| `Free {cityWord:pl} {leagueGroup}` | B | 10 | all | Free Colonies Union |

**Agency: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Section {number}` | E | 15 | MR MF SF | Section Four |
| `Bureau of {agencyPursuit}` | F | 15 | MR MF SF | Bureau of Unusual Affairs |
| `the {colour} Desk` | E | 10 | MR MF SF | the Blue Desk |
| `Department of {agencyPursuit}` | F | 10 | MR MF SF | Department of Continuity |
| `Office of {agencyPursuit}` | F | 10 | MR MF SF | Office of Correspondence |
| `{ordinal} Directorate` | F | 5 | MR MF SF | 2nd Directorate |
| `Directorate {greek}` | F | 8 | SF | Directorate Omicron |
| `the {ruler:poss} {spyWord}` | E | 15 | FL FH | the Queen's Ears |
| `the {colour} Cabinet` | E | 8 | FL FH | the Grey Cabinet |
| `the {secretQuality} Office` | E | 8 | all | the Quiet Office |
| `{initials}` | E | 10 | MR MF SF | BUA |

**House: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `House {house}` | B | 35 | all | House Dravane |
| `House {house} of {town}` | F | 15 | all | House Talmont of Saltgate |
| `the {house:pl} of {town}` | E | 10 | all | the Vantrells of Fenwick |
| `House of the {colour} {knightEmblem}` | F | 15 | all | House of the Silver Crane |
| `the {house} Line` | E | 10 | all | the Morcant Line |
| `House {house}–{house}` | B | 5 | SF | House Vey–Ostrey |
| `House {house} of {star}` | F | 10 | SF | House Lisle of Deneb |

### 6.7 Supernatural courts and hosts (`supernatural`)

Settings: `FL` (folkloric), `FH`, `MF`. Not offered in `MR` or `SF` (§2.4).

| Key | Menu | Sentence | Settings | Weight | Front | Person |
|---|---|---|---|--:|---|---|
| `fey` | Fey courts and the hidden folk | fey courts | FL FH MF | 20 | folk | lord |
| `blood` | Vampire bloodlines and courts | vampire bloodlines | FL FH MF | 20 | society | sire |
| `pack` | Shapeshifter packs | shapeshifter packs | FL FH MF | 15 | society | alpha |
| `spirit` | Spirit courts and wild hunts | spirit hosts | FL FH MF | 15 | folk | lord |
| `undead` | Undead legions | undead legions | FH MF | 10 | – | lord |
| `demon` | Demonic and infernal hosts | infernal hosts | FL FH MF | 15 | benefactor | lord |
| `celestial` | Angelic and celestial hosts | celestial hosts | FH MF | 5 | – | lord |

**Descriptions.** Fey: "Fairy courts and the hidden folk under the hill". Blood: "Vampire bloodlines, houses and courts". Pack: "Werewolf and shapeshifter packs". Spirit: "Spirit courts, ghost hosts and wild hunts". Undead: "Legions of the risen dead". Demon: "Demonic hosts and infernal courts". Celestial: "Angelic choirs and heavenly hosts".

In `FL`, the shapes read as folklore: undead and celestial types are absent, and words marked (H) never appear.

**Family lists**

- **`feyTime`:** Winter, Summer, Autumn, Spring, Twilight ×2, Midnight, Dawn, Dusk, Moonlit, Frost, Harvest.
- **`feyPlant`:** Rowan, Thorn, Hawthorn, Elder, Ash, Willow, Briar, Foxglove, Bluebell, Hazel.
- **`feyPlace`:** Hollow Hill ×2, Green Mound, Old Barrow, Silver Mere, Thorn Ring, Under-Hill, Mist, Deep Wood, Fairy Ring ×0.5.
- **`feyTitle`:** Queen ×2, King ×2, Lady, Lord, Prince, Huntsman, Piper.
- **`skyThing`:** Moon ×2, Star ×2, Sun, Dawn, Dusk, Mist, Dew, Frost.
- **`bloodQuality`:** Silent, Ancient, Hollow, Hungry, Patient, Sleepless, Velvet, Cold, Nameless.
- **`bodyPart`:** Fang, Claw, Paw, Pelt, Mane, Tooth, Eye.
- **`kinWord`:** Kin ×2, Sons, Daughters, Brood, Blood.
- **`shifter`:** Wolf ×3, Bear ×2, Boar, Hare, Fox, Raven, Seal, Cat, Stag, Hound; tradition flavour animals ×3.
- **`weather`:** Gale, Mist, Frost, Thunder, North Wind, Long Night, Rain, Snow.
- **`deadQuality`:** Restless, Hungry, Drowned, Unquiet, Nameless, Patient, Weeping, Hollow, Grey.
- **`undeadNoun`:** Kings, Dead, Legion, Host, Lords, Barrow-Kings, Sleepers, Risen.
- **`hellPlace`:** Pit ×2, Abyss, Furnace, Deep, Gate, Fire, Ash, Cinders, Pyre, Throne.
- **`demonQuality`:** Burning, Smiling, Hungry, Hollow, Brazen, Cinder, Thousand-Voiced, Patient, Laughing.
- **`chainItem`:** Chains, Keys, Thorns, Crowns, Bells, Horns, Seals.
- **`heavenThing`:** Sun, Dawn, Star, Light, Flame, Throne, Gate, Sky, Morning.
- **`heavenQuality`:** Shining, Radiant, Golden, Silver, White, Unfading, Burning, Silent, Highest.

**Fey: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Court of the {feyPlant} {skyThing}` | B | 20 | all | Court of the Rowan Moon |
| `the {feyTime} Court` | E | 15 | all | the Twilight Court |
| `Folk of the {feyPlace}` | B | 15 | all | Folk of the Hollow Hill |
| `the {colour} {feyPlant} Court` | E | 10 | all | the Silver Briar Court |
| `the {number} Courts of the {feyPlace}` | F | 5 | all | the Three Courts of the Under-Hill |
| `the {feyTime} {feyTitle:poss} Court` | E | 15 | all | the Frost Queen's Court |
| `Riders of the {feyPlace}` | E | 10 | all | Riders of the Green Mound |
| `{person:poss} Court` | E | 10 | all | [lord]'s Court |

**Blood: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {colour} Line` | E | 20 | all | the Ashen Line |
| `House {house}` | B | 15 | all | House Ravel |
| `Blood of {person}` | B | 15 | all | Blood of [sire] |
| `Children of the {bloodQuality} {skyThing}` | B | 10 | all | Children of the Sleepless Moon |
| `the {bloodQuality} Kindred` | E | 10 | all | the Silent Kindred |
| `the {house} Court` | E | 10 | all | the Vesper Court |
| `Court of the {colour} {knightEmblem}` | F | 15 | all | Court of the Crimson Rose |
| `the {number} Bloods` | E | 5 | all | the Seven Bloods |

**Pack: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Pack of the {colour} {land}` | B | 25 | all | Pack of the Black Fells |
| `the {land} Pack` | E | 20 | all | the Moors Pack |
| `the {colour}-{bodyPart} Pack` | E | 10 | all | the Grey-Fang Pack |
| `Children of the {skyThing}` | B | 10 | all | Children of the Dusk |
| `the {shifter}-{kinWord}` | E | 15 | all | the Wolf-Kin |
| `{person:poss} Pack` | E | 10 | all | [alpha]'s Pack |
| `the {number} {bodyPart:pl}` | E | 10 | all | the Nine Claws |

**Spirit: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `the {colour/feyTime} Hunt` | E | 25 | all | the Grey Hunt |
| `Riders of the {weather}` | B | 15 | all | Riders of the Gale |
| `the {feyTime} Riders` | E | 10 | all | the Midnight Riders |
| `Court of the {feyPlace}` | B | 10 | all | Court of the Old Barrow |
| `Spirits of the {land}` | B | 10 | all | Spirits of the Mere |
| `the {number} Winds` | E | 10 | all | the Four Winds |
| `the {deadQuality} Dead` | E | 10 | all | the Unquiet Dead |
| `the {deadQuality} Host` | E | 10 | all | the Grey Host |

**Undead: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Host of the {ordinalWord} {hellPlace}` | F | 15 | all | Host of the Ninth Pit |
| `Legion of the {deadQuality} Crown` | F | 15 | all | Legion of the Hollow Crown |
| `the {deadQuality} {undeadNoun}` | E | 25 | all | the Hollow Kings |
| `Army of {person}` | F | 10 | all | Army of [lord] |
| `the {colour} Barrows` | E | 10 | all | the Black Barrows |
| `the {number} {undeadNoun}` | E | 10 | all | the Seven Sleepers |
| `Legion of the {land}` | F | 15 | all | Legion of the Fens |

**Demon: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Host of the {ordinalWord} {hellPlace}` | F | 15 | all | Host of the Seventh Furnace |
| `Legion of {person}` | F | 10 | all | Legion of [lord] |
| `the {demonQuality} Choir` | E | 15 | all | the Burning Choir |
| `Court of {number} {chainItem}` | F | 15 | all | Court of Seven Chains |
| `{person:poss} Own` | E | 10 | all | [lord]'s Own |
| `the {colour} {hellPlace}` | E | 10 | all | the Red Furnace |
| `Princes of the {hellPlace}` | B | 10 | all | Princes of the Abyss |

**Celestial: shapes**

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Host of the {heavenQuality} {heavenThing}` | F | 25 | all | Host of the Unfading Light |
| `Choir of the {entity}` | F | 20 | all | Choir of the Word |
| `the {colour} Wings` | E | 20 | all | the Silver Wings |
| `the {number} Thrones` | E | 10 | all | the Seven Thrones |
| `Watchers of the {heavenThing}` | B | 15 | all | Watchers of the Gate |
| `the {heavenQuality} Host` | E | 10 | all | the Shining Host |

---

## 7. Front names

A front is a respectable name that hides what a group really is. The book's examples are esoteric fronts for necromancers and euphemistic assassins' guilds; here every family that hides things can use one. The sentence's front field (§2.2) chooses between plain names, front names, or a mix (§10).

Each front-capable type has a front style (type tables, §6). Front shapes carry form tags like any other shape.

### 7.1 Society (esoteric, arcane, cult, coven, secret, rebels, blood, pack)

- **`pursuit`:** Quiet Remembrance, the Study of Old Tongues, the Preservation of Antiquities, Mutual Improvement, the Encouragement of the Arts, Natural Philosophy, Lantern-Lit Walks, the Relief of Widows, Rational Recreation, Psychical Research ×0.3.
- **`respectablePlace`:** Old Library, Harbour Lights, Lower Gardens, Old Bridge, Night Garden, Abbey Ruins, Town Museum, Bell Tower, Physic Garden.
- **`weekday`:** Monday … Sunday; Thursday ×2.
- **`club`:** Supper Club, Reading Circle, Debating Society, Rambling Club, Chess Club, Dining Club, Choral Society, Sewing Circle, Bridge Club `(MO)`, Book Club `(MO)`.

| Shape | Form | Weight | Example |
|---|---|--:|---|
| `Society for {pursuit}` | F | 25 | Society for Quiet Remembrance |
| `Friends of the {respectablePlace}` | B | 20 | Friends of the Old Library |
| `the {weekday} Club` | E | 15 | the Thursday Club |
| `the {streetFirst} {club}` | E | 20 | the Bell Supper Club |
| `{town} Benevolent Society` | F | 10 | Saltgate Benevolent Society |
| `{town} Philosophical Society` | F | 10 | Fenwick Philosophical Society |

The pack type adds `the {town} Hunt` (E, 15).

### 7.2 Euphemism: thieves

- **`thiefEuph`:** Uplifters, Redistributors, Leviers, Liberators, Relocators, Lighteners, Collectors, Finders, Purse-Lighteners, Rehomers `(MO)`.
- **`gentleAdj`:** Kindly, Generous, Honest, Thoughtful, Obliging, Charitable, Gentle.

| Shape | Form | Weight | Example |
|---|---|--:|---|
| `Honourable Company of {thiefEuph}` | F | 25 | Honourable Company of Purse-Lighteners |
| `Guild of {thiefEuph}` | F | 20 | Guild of Relocators |
| `the {town} {thiefEuph}` | E | 20 | the Ashby Uplifters |
| `Society of {thiefEuph}` | F | 15 | Society of Liberators |
| `the {gentleAdj} {thiefEuph}` | E | 20 | the Kindly Redistributors |

### 7.3 Euphemism: assassins (the book's two lists, cleaned)

- **`balancers`:** Arrangers, Bestowers ×0.3, Disbursers ×0.3, Disposers, Harmonisers, Reconcilers, Regulators, Reinstaters, Restorers ×2, Balancers, Correctors, Adjusters, Menders.
- **`balance`:** Balance ×2, Congruity ×0.3, Correspondence ×0.5, Equilibrium, Equipoise, Equity, Equivalence ×0.5, Parity, Symmetry, Accounts, Old Debts.
- **`redressAdj`:** Acute ×0.3, Apposite ×0.5, Apt, Decisive, Dependable, Discreet, Extreme ×0.3, Faithful, Final, Fitting, Impartial, Prompt, Reliable, Certain, Supreme ×0.5, Ultimate ×0.5, Utmost ×0.3.
- **`redress`:** Action, Justice, Reckoning, Recompense, Redress, Remedy, Reparation, Reprisal ×0.5, Requital, Retribution ×0.5, Satisfaction, Settlement, Vindication ×0.5.
- **`redressGroup`:** Alliance, Association, Company, Corporation `(M)` ×2, Organisation, Society ×2, Syndicate, Agency `(M)`.

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `{balancers} of {balance}` | B | 35 | all | Reconcilers of Equity |
| `{redressAdj} {redress} {redressGroup}` | B | 35 | all | Fitting Remedy Society |
| `the {town} {redress} Society` | F | 15 | all | the Saltgate Settlement Society |
| `{brandRoot} Resolution Services` | F | 15 | MR MF SF | Meridian Resolution Services |

### 7.4 Business (gang, syndicate, crew)

- **`businessTrade`:** Haulage, Shipping, Import–Export, Scrap Metals, Fine Wines, Laundry, Removals, Pawnbrokers, Builders' Merchants `(MO)`.

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `{surname} & Sons {businessTrade}` | B | 30 | all | Harrow & Sons Haulage |
| `{town} {businessTrade} Company` | F | 20 | all | Fenwick Removals Company |
| `{town} {businessTrade}` | E | 15 | all | Saltgate Laundry |
| `the {town} Social Club` | E | 15 | FL FH MR MF | the Ashby Social Club |
| `{brandRoot} {corpSuffix}` | B | 20 | MR MF SF | Greyfield Holdings |

### 7.5 Free traders (smugglers)

- **`fishWord`:** Fishing, Oyster, Herring, Salvage, Lighterage, Ferry.

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `{town} Free Traders` | E | 25 | all | Saltgate Free Traders |
| `{town} {fishWord} Company` | F | 25 | FL FH MR MF | Fenwick Oyster Company |
| `Friends of the Harbour Lights` | B | 10 | all | (fixed) |
| `{town} Pilots' Association` | F | 15 | all | Ashby Pilots' Association |
| `{brandRoot} Logistics` | F | 20 | MR MF SF | Cobalt Logistics |

### 7.6 Office (agency)

- **`mundane`:** Fisheries, Weights and Measures, Public Records, Agricultural Statistics, Inland Waterways, Postal Correspondence, Lighthouses, Bridges and Roads, Census Returns, Archives.
- **`mundaneOffice`:** Records Office, Survey Office, Tide Office, Statistical Office.
- **`clerkWord`** `(P)`: Clerks, Surveyors, Almoners, Archivists, Tax-Gatherers.

| Shape | Form | Weight | Settings | Example |
|---|---|--:|---|---|
| `Department of {mundane}` | F | 30 | MR MF SF | Department of Inland Waterways |
| `Bureau of {mundane}` | F | 25 | MR MF SF | Bureau of Weights and Measures |
| `the {town} {mundaneOffice}` | E | 25 | all | the Saltgate Tide Office |
| `the {ruler:poss} {clerkWord}` | E | 20 | FL FH | the King's Surveyors |

### 7.7 Folk (fey, spirit)

The folklore euphemisms for the fair folk are real; the generated ones follow their pattern.

- **`folkKind`:** Good ×2, Kindly, Gentle, Quiet, Fair, Honest, Pleasant, Bright, Little ×0.3, Old ×0.5, Lordly ×0.3.
- **`folkWord`:** Neighbours ×2, Folk ×2, People, Ones, Company, Gentry.
- **`folkFixed`:** the Gentry, the Good People, Themselves, the Others, Them Below, the Hidden Ones, the Gentle Neighbours.
- **`peace`:** Peace, the Hills, the Mounds, the Mist, Plenty.

| Shape | Form | Weight | Example |
|---|---|--:|---|
| `the {folkKind} {folkWord}` | E | 40 | the Quiet Neighbours |
| `the People of {peace}` | B | 20 | the People of the Mounds |
| `{folkFixed}` | E | 20 | Them Below |
| `Folk of the {respectablePlace}` | B | 20 | Folk of the Old Bridge |

### 7.8 Benefactor (demon)

- **`benefAdj`:** Generous, Patient, Charitable, Obliging, Accommodating, Kindly, Openhanded.
- **`benefGroup`:** Company, Lenders, Benefactors, Friends, Patrons, Society, Partners.
- **`bargainWord`:** Bargain, Fair Exchange, Open Hand, Long Lease, Kind Offer.

| Shape | Form | Weight | Example |
|---|---|--:|---|
| `the {benefAdj} {benefGroup}` | E | 40 | the Patient Lenders |
| `{town} Benefactors` | E | 20 | Fenwick Benefactors |
| `Friends of the {bargainWord}` | B | 20 | Friends of the Fair Exchange |
| `{town} Mutual Assurance Society` | F | 20 | Saltgate Mutual Assurance Society |

---

## 8. People and places

The sentence's people field chooses **placeholders** or **invented** names.

### 8.1 Placeholders

| Token | Placeholder |
|---|---|
| `{person}` | `[{label}]`, the type's Person label (§6): `[commander]`, `[founder]`, `[leader]`, `[prophet]`, `[captain]`, `[admiral]`, `[boss]`, `[teacher]`, `[master]`, `[spymaster]`, `[lord]`, `[sire]`, `[alpha]` |
| `{holy}` | `[holy person]` |
| `{town}` | `[place]` |
| `{surname}` | `[surname]` |
| `{house}` | `[house]` |

`{star}` is never a placeholder. Placeholders show muted, as river name placeholders do. Possessives attach outside the bracket: `[commander]'s Rats`.

### 8.2 Invented people

- **`{person}`**, weighted:
  - `the {colour} {personTitle}` 30: the Red Duke
  - `Old {surname}` 15: Old Harrow
  - `{rank} {surname}` 25: Captain Vance
  - `{surname}` 20: Harrow
  - `the {flavourAnimal}` 10: the Raven
  - **`personTitle`:** Duke ×2, Count, Baron, Captain ×2, Lady, Lord, Widow, Prince, Earl, Colonel `(PM)`, Commodore, Admiral, Marshal, Knight, Queen, King, Mother, Doctor `(M)`, Director `(M)`, Abbot ×0.3. Supernatural uses `feyTitle` plus Countess, Prince and Sire instead.
  - **`rank`:** Captain ×3, Colonel `(PM)`, Major `(M)`, Mother, Doctor `(M)`, Sergeant, Master, Mistress `(P)`, Commander `(S)`, Admiral `(S)`.
  - **`flavourAnimal`:** the tradition's flavour animals; General draws from `beast` and `bird`.
- **Traditions other than General, Celtic and Germanic:** surname forms are off. Draw `the {colour} {personTitle}` 60 and `the {flavourAnimal}` 40.
- **`{holy}`:** `Saint {saintName}` in fantasy and modern, `the Blessed {saintName}` in sci-fi. With traditions other than General, Celtic, Germanic and Ancient Mediterranean: `the {holyTitle}`.
  - **`saintName`:** Aldric, Bertilla, Brannoc, Cuthwin, Cyneburg, Edith, Elfrida, Felix, Gerwin, Hilary, Hilde, Ivo, Juthwara, Kenelm, Leofric, Lioba, Maelor, Mildred, Osyth, Petroc, Sidwell, Tecla, Wendreda, Wilfrid, Ysolde.
  - **`holyTitle`:** First Teacher, Silent Master, Wandering Sage, Lamp-Bearer, Pilgrim, Old Hermit.

### 8.3 Invented surnames and houses

- `{surname}` and `{house}` draw from their lists (§5.7) with General, Celtic and Germanic.
- With any other tradition, shapes using `{surname}` or `{house}` get weight 0 in invented mode. Placeholder mode keeps them.

### 8.4 Invented places (`{town}`)

| Setting | Tradition | Source |
|---|---|---|
| FL FH MR MF | General, Celtic, Germanic | The British place names generator, as the native place names module uses it for Britain: built-in lists, all of Britain, no biome. Redraw any result containing `[` (up to 10 times), then use a land compound. |
| FL FH MR MF | others | The world place names engine (`generateWorldPlaceNames`) for the mapped culture below, default era; same `[` rule. Unmapped traditions use a land compound. |
| SF | any | `{star}` 40 · `{star} {1–12}` 20 (Spica 4) · a `spaceLand` word with its prefix 20 (Far Reach) · `{brandRoot} Station` 10 · `New {British place}` 10 |

**Culture map.** mediterranean → `roman`; eastAsian → `chinese` 50, `japanese` 25, `korean` 25; mesoamerican → `aztec` 60, `maya` 40; bantu → `bantu`; westAfrican → `west-african`; arabian → `arabic-persian`; southAsian → `indian`. Others are unmapped.

**Land compound:** a prefix and a suffix written as one word.
- **Prefixes:** North, South, East, West, Black, White, Red, Grey, Green, Ash, Iron, Salt, Stone, Oak, Elm, Thorn, Wolf.
- **Suffixes:** march, ford, haven, moor, gate, wick, mere, holt, combe, fell, water, bridge, stead.
- Examples: Westmarch, Greyhaven, Ashmere.

**`star`:** Altair, Vega, Deneb, Rigel, Spica, Sirius, Capella, Arcturus, Procyon, Pollux, Castor, Antares, Regulus, Fomalhaut, Aldebaran, Achernar, Betelgeuse, Canopus, Mira, Algol, Denebola, Alcor, Mizar, Electra, Maia, Bellatrix, Alnitak, Mintaka, Hadar, Shaula, Tau Ceti, Eridani.

---

## 9. Cultural flavour (traditions)

The 17 tribal traditions (`TRIBAL_TRADITIONS`) are reused. **General adds nothing.** Any other tradition:

1. **Flavour animals** (tribal `flavour.animals`) ×3 in `beast`, `bird`, `creatures` (made plural), `shifter` and `flavourAnimal`, and ×2 in `knightEmblem`.
2. **Flavour plants** ×3 in `plant`, `tree` and `feyPlant`, and ×2 in `knightEmblem`.
3. **Flavour land words** ×3 in `land` and `covenLand`.
4. **Tradition numbers** ×3 in `number`.
5. **Culture suppressions** (tribal `suppress`, culture kind: Chariot, Sword, Bow and so on) apply to `weapon`, `gear` and `uWeapon` in FL and FH only.
6. **Signature words** (table below) are added at ×3 to the named lists. Words already in a list are multiplied ×3 instead.
7. **Sacred specifics** are never added (tribal brief §17.2). For `sahul`, only steps 1–4 apply.
8. **Caste safeguard:** `southAsian` adds nothing to `tradesmen`, `unionTrade` or any trade list, and the trade module with `southAsian` uses General vocabulary (tribal brief §17.5).

| Tradition | Signature words (list: words) |
|---|---|
| celtic | `group`, `covenGroup`: Grove · `members`: Druids `(PM)` · `soldiers`: Hounds, Champions · `companyGroup`: Band · `vocation`: Bards |
| germanic | `unitGroup`: Hearth-Troop, Host · `soldiers`: Sworn Men, Wolf-Coats · `assemblyWord`: Moot · `raiders`: Sea-Wolves · `companyGroup`: Fellowship |
| steppe | `unitGroup`: Horde, Hundred, Thousand, Banner · `soldiers`: Riders, Archers · `assemblyWord`: Great Council |
| arabian | `group`: Path, Lodge · `companyGroup`: Caravan · `soldiers`: Riders · the caravan type ×3 |
| bantu | `unitGroup`: Regiment, Age-Set · `group`: Society · `assemblyWord`: Council, Gathering · `soldiers`: Spears, Shields |
| northAmerican | `group`: Society, Lodge · `assemblyWord`: Council Fire · `soldiers`: Scouts, Runners |
| polynesian | `companyGroup`: Canoe, Voyagers · `tradesmen`: Navigators, Canoe-Builders · `members`: Wayfinders |
| eastAsian | `group`, `thiefGroup`: School, Sect, Hall, Gate, Pavilion, Society · `unitGroup`: Banner · `members`: Disciples, Retainers · the shapes `the {colour} {emblem} {group}` (E, 10) are added to esoteric and arcane, and `the {colour} {emblem} {thiefGroup}` (E, 10) to thieves |
| mesoamerican | `group`: House · `tradesmen`: Featherworkers · `soldiers`: Eagle Warriors, Jaguar Warriors |
| andean | `members`: Knot-Keepers · `soldiers`: Runners · `group`: House, Order |
| maritimeSEA | `fleetGroup`: Fleet · `raiders`: Sea-Rovers · `companyGroup`: Brotherhood |
| mediterranean | `unitGroup`: Legion, Cohort, Century · `group`: College, Sodality · `schoolGroup`: Porch, Garden · `assemblyWord`: Senate, Assembly |
| northernPacific | `group`: Society, House · `tradesmen`: Carvers, Canoe-Builders · `members`: Dancers |
| westAfrican | `group`: Society · `tradesmen`: Smiths, Praise-Singers · `assemblyWord`: Council · the shape `Hunters' Brotherhood of the {land}` ×5 |
| southAsian | `group`: Order, Fellowship · `assemblyWord`: Assembly · `schoolGroup`: School, Way · `members`: Seekers, Wanderers |
| sahul | – |

Signature words keep the setting tags of the list they join, unless shown with their own tag.

---

## 10. Form and front

- **Form any:** shapes keep their weights; B shapes count once.
- **Form formal / everyday:** only F and B, or E and B, shapes.
- **Fallback:** if a type has no shape for the chosen form in this setting (gangs have no formal names), use all of its shapes.
- **Front say:** plain shapes only. **Front hide:** front shapes only, and with type Any only front-capable types. **Front may hide:** 25% front shapes, 75% plain, per name, for front-capable types.

---

## 11. Rendering

### 11.1 Capitals and articles

- Every word is capitalised except `of`, `the`, `and`, `for`, `in`, `at`, `by`, `on`, `to` and `from`, which stay lower case except as the first word of a formal shape.
- A shape starting "the" keeps a lower-case "the" (the Grey Wolves, the Thursday Club), ready to insert mid-sentence.
- "Beyond", "Between" and "Across" are capitalised (Walkers Beyond the Veil).
- Each part of a hyphenated compound is capitalised: Grey-Cuffs, Light-Fingers, Wolf-Kin.

### 11.2 Length

Formal names at most 8 words; everyday names at most 5. A leading "the" and the words in §11.1's lower-case list don't count. Over the cap: redraw.

### 11.3 Plurals

Use `pluralOf` from `src/biomes.ts`, adding Wolf → Wolves, Knife → Knives, Ox → Oxen, Mouse → Mice, Staff → Staffs, Thief → Thieves. Compounds pluralise their last part (Sea-Serpents). Lists already in the plural (`soldiers`, `tradesmen`, `gangWear` …) are never re-pluralised.

### 11.4 Possessives (OUP)

- Singular: add **'s**, including names ending in s (Ross's, the Abbess's).
- Plural ending in s: add **'** (the Glovers' Guild).
- Plural not ending in s: add **'s** (the Woolmen's Guild, the Railwaymen's Friendly Society).
- Placeholders: `[commander]'s`.

### 11.5 Repetition

No content word twice in a name (case-insensitive, ignoring a final s): no "Order of the Order", no "Shadow Shadows". No two colour words, no two numbers.

### 11.6 Initials

`{initials}`:
1. Render a formal shape of the same type that has at least three words outside the lower-case list.
2. Take the first letter of each such word; a hyphenated compound counts as one word.
3. Write the letters as capitals, without full stops.
4. Keep the result only if it is 3–5 letters long and isn't in `blockedInitials` (§12.5); otherwise redraw.

### 11.7 Dashes and ampersands

- Partnership names and paired terms take an unspaced en dash (OUP): Harrow–Vance, Import–Export, House Vey–Ostrey.
- Hyphens are only for compounds.
- "&" is written as given in shapes.

---

## 12. Safeguards

### 12.1 Block list

Exact matches are redrawn. Matching is case-insensitive on the whole name, with a leading "the" ignored. The built-in list is data and can't be removed by packs.

- **Real orders and societies:** Illuminati, Golden Dawn, Hermetic Order of the Golden Dawn, Rosicrucians, Rose Cross, Order of the Rose Cross, Freemasons, Ordo Templi Orientis, Thule Society, Skull and Bones, Opus Dei, Knights Templar, Templars, Knights Hospitaller, Hospitallers, Teutonic Knights, Society of Jesus, Jesuits, Franciscans, Dominicans, Benedictines, Poor Clares, Order of Preachers, Little Sisters of the Poor, Royal Society, Royal Geographical Society.
- **Honours:** Order of the Garter, Order of the Bath, Order of the Thistle, Order of the Golden Fleece, Order of Merit, Order of the British Empire, Legion of Honour, Round Table, Knights of the Round Table.
- **Armed forces, police and agencies:** Red Army, SS, Waffen-SS, Gestapo, Stasi, Black and Tans, Wagner Group, Blackwater, Executive Outcomes, MI5, MI6, CIA, FBI, KGB, NSA, Mossad, Special Branch, Secret Intelligence Service, Security Service, Special Operations Executive, Privy Council, High Court, Supreme Court, Ordnance Survey.
- **Criminal organisations:** Black Hand, Red Hand, Ku Klux Klan, Klan, Aryan Brotherhood, Hells Angels, Hell's Angels, Bandidos, Outlaws, Pagans, Mongols, Bloods, Crips, Latin Kings, MS-13, Peaky Blinders, Forty Elephants, Five Families, Cosa Nostra, Mafia, Camorra, 'Ndrangheta, Yakuza, Triads, the Firm, Medellín Cartel, Sinaloa Cartel.
- **Political and armed movements:** Irish Republican Army, IRA, Provisional IRA, Ulster Defence Association, Ulster Volunteer Force, ETA, Red Army Faction, Red Brigades, Black September, Shining Path, Tamil Tigers, Weathermen, Weather Underground, Baader-Meinhof, Symbionese Liberation Army, Black Panthers, Black Panther Party, Hamas, Hezbollah, al-Qaeda, Islamic State, Muslim Brotherhood, National Front, British National Party.
- **Political parties:** Labour Party, Conservative Party, Liberal Party, Liberal Democrats, Green Party, Reform Party, Democratic Party, Republican Party, Communist Party, Socialist Workers Party, Freedom Party, People's Party, National Party.
- **Real companies:** East India Company, Hudson's Bay Company, Hanseatic League, Virginia Company, Lehman Brothers, Warner Brothers, National Union of Mineworkers.
- **Fiction and games:** Night's Watch, Kingsguard, Golden Company, Second Sons, Unsullied, Faceless Men, Iron Bank, Brotherhood Without Banners, Stormcloaks, Dark Brotherhood, Harpers, Zhentarim, Red Wizards, Jedi, Sith, Galactic Empire, Rebel Alliance, First Order, Avengers, X-Men, Justice League, SHIELD, Hydra, Umbrella Corporation, Weyland-Yutani, Tyrell Corporation, Cyberdyne Systems, Aperture Science, Black Mesa, Torchwood, Men in Black, Ghostbusters, Section 31, Starfleet, Space Marines, Spacing Guild, Bene Gesserit, Outer Rim, Green Lantern, Green Lanterns, Green Lantern Corps, Night Riders, Black Riders, Nine Riders, Riders of the Storm, Riders on the Storm, Seelie Court, Unseelie Court, Ninth Circle, Devil's Own, Borrowers, Fellowship of the Ring, Order of the Phoenix, Death Eaters, Dumbledore's Army, Brotherhood of Steel.

### 12.2 Flag list

These are allowed, because they are historical or folklore names that suit the generator. A data switch, `flagListBlocks` (default `false`), turns the flag list into a block list, as in tribal names.

White Company, Grey Friars, Black Friars, White Friars, Die-Hards, Red Devils, Red-Coats, Levellers, Diggers, Long Knives, Children of the Moon, Good Neighbours, Fair Folk, Gentry, People of Peace, Kindly Ones, Free Traders, Bow Street Runners, Merchant Adventurers, Eagle Warriors, Jaguar Warriors, Society for Psychical Research, Wild Hunt, Winter Court, Summer Court, Section Nine, Sons of Liberty, Hellfire Club, Star Chamber, Silk Road, Colonial Marines, Western Squadron, Home Fleet, Blues, Greens, Four Winds.

### 12.3 Banned words

The tribal banned list (tribal brief §17.3), plus: Aryan, Reich, Nazi, Fascist, Klan, Jihad, Jihadist, Caliphate, Supremacist, Master Race, Racial, Pogrom, Holocaust, Genocide, Swastika, and any racial, ethnic or religious slur. Checked as whole words on the final name.

### 12.4 Colour rule

A word from `colour`, `colourRich` or `habit` may not stand directly before one of these person nouns: Men, Women, People, Folk, Kin, Kindred, Children, Sons, Daughters, Brothers, Sisters, Brotherhood, Sisterhood, Boys, Girls, Lads, Lasses, Nation, Tribe, Tribes, Family, Clan. "Red Scarves" and "Grey Friars" are fine; "White Brotherhood" and "Black Sons" are not. `factionColour` holds only Blues, Greens, Golds, Greys, Purples and Ambers.

### 12.5 Blocked initials

IRA, ETA, SS, KKK, CIA, FBI, KGB, NSA, MI5, MI6, NHS, BBC, ISIS, NATO, UVF, UDA, BNP, NUM, SOE. Initials are also checked against §12.1 and §12.3.

### 12.6 Safeguard packs

- Add `type: group-safeguards` packs, read like the tribal ones (`## Block`, `## Flag`, `## Allow`). Every such file in the names folder applies.
- Add the command "Create group safeguard list", which writes "Group safeguards.md" and never overwrites an existing note.
- Packs can add to both lists and take entries off the flag list, never off the built-in block list.

---

## 13. Presets

Each of the seven modules gets the **Save as preset** button (`bookmark-plus`), as tribal names has.

```yaml
---
type: module-preset
module: group-names
family: martial
packName: Border Regiments
setting: 
tradition: germanic
groupType: unit
genre: fantasy
fantastic: false
form: any
front: say
people: invented
---

Germanic & Norse-themed regular units for a fantasy world of historic or low fantasy, using formal or everyday names, with invented people and places.
```

| Key | Values | Default |
|---|---|---|
| `family` | a family key (§1.1) | required |
| `tradition` | `general` or a tradition key | `general` |
| `groupType` | `any` or a type key of that family | `any` |
| `genre` | `fantasy`, `modern`, `scifi` | `fantasy` |
| `fantastic` | `true`, `false` | `false` |
| `form` | `any`, `formal`, `everyday` | `any` |
| `front` | `say`, `hide`, `may` | `say` |
| `people` | `placeholders`, `invented` | `placeholders` |

- **Parsing:** `src/presets.ts` accepts `module: group-names` alongside `tribal-names`. A missing or unknown family is reported as `Unknown family “{x}”.` and the note is left out. An unknown value for a known key is reported as `Unknown {key} “{x}”.` and that key takes its default.
- **Saving:** the prefilled name is "{tradition label} · {type menu label or family label} · {setting phrase}"; the description is the plain-text sentence (§2.6).
- **Running:** group presets load and run exactly as tribal presets do. A preset whose type isn't available in its setting runs with type Any and shows that as a problem.

---

## 14. Output

- Results are names only. Map each to `GeneratedName` with `text` = the name and an empty `etymology`. The details toggle is hidden for these modules.
- Insert actions insert the names as other modules do.
- History rows use the label in §1.2.
- The engine returns, per name, `{ text, family, type, shape, front, form }` for tests; the view uses only `text`.

---

## 15. Milestones

Run `npm test` and `npm run build` at the end of every milestone; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Data and engine.** `group-names.json` (§5–§10, §12), `src/groups/engine.ts`, `tests/groupNames.test.ts` (§16.1–§16.6) | §16.1–§16.6 pass |
| M2 | **Sentence and modules.** `src/groups/sentence.ts`, seven sections in `sections.ts`, icons, the modal's sentence row, history labels, the group safeguard pack and its command | §16.7 passes; existing tribal tests pass unchanged; each module generates in the app |
| M3 | **Presets.** §13 | §16.8 passes |

Add this brief to `docs/` as `group-names-brief.md`.

---

## 16. Tests (`tests/groupNames.test.ts`)

### 16.1 Data

- Seven families with the types in §6, in order. Every type's settings are a non-empty subset of the five codes.
- Every shape token resolves to a list (type, family or shared), a people or place token, or `{initials}`. Every list a shape names exists. All weights are greater than 0.
- Every type has at least one shape in every setting it exists in.
- Every front-capable type's front style exists, and has at least one shape in every setting the type exists in.

### 16.2 Determinism and coverage

- The same options and seed give the same names.
- For every module × available setting × form (any, formal, everyday) × front (say, and hide where available) × people (both): a batch of 20 with type Any returns 20 unique, non-empty names within the caps (§11.2).

### 16.3 Setting gating

From the data, build the words exclusive to each tag (words that appear only with that tag, nowhere untagged).

- 2,000 names per module in FL and in MR: no (H)-only word as a whole word.
- 2,000 per module in FL, FH, MR and MF: no (S)-only word.
- 2,000 per module in MR, MF and SF: no (P)-only word.
- 2,000 per module in FL and FH: no (M)- or (MO)-only word.
- `supernaturalCourts` can't be given MR or SF: the sentence state never reaches them, and the engine throws if asked.

### 16.4 Form, front and people

- **Form formal:** every name comes from an F or B shape, except for types using the fallback (§10).
- **Front hide:** every name comes from a front shape. **Front say:** none do.
- **Placeholders:** in 500 names per module, at least one contains `[`.
- **Invented:** in 2,000 names per module, none contains `[`.
- **Surnames:** with `eastAsian` and invented people, no name contains a word from `surname` or `house`.

### 16.5 Safeguards

- 5,000 names per module across all settings, with `flagListBlocks` both off and on: 0 block-list matches and 0 banned words. With it on, also 0 flag-list matches.
- The colour rule (§12.4): no colour word directly before a listed person noun.
- No initials from `blockedInitials`.

### 16.6 Traditions and rendering

- `eastAsian`, mystic, 1,000 names: at least one contains School, Sect, Hall, Gate or Pavilion.
- General: no signature word that appears only as a tradition signature word.
- `southAsian`, trade, 2,000 names: the vocabulary used is a subset of the General trade vocabulary.
- **Possessives:** Glovers → "Glovers'", Woolmen → "Woolmen's", Ross → "Ross's", `[commander]` → "[commander]'s".
- **Plurals:** Wolf → Wolves.
- **Initials:** "Northfield Heavy Industries" → "NHI".
- **Corps:** partner names use an en dash (U+2013).

### 16.7 Sentence

- Default mystic segments read, as plain text: "General-themed orders and faiths of any kind for a fantasy world of historic or low fantasy, using formal or everyday names that say what they are, with placeholders for people and places."
- Martial has no front segment.
- Sci-fi has no fantastic segment.
- Choosing a genre that the current type lacks resets the type to Any.
- Supernatural's genre choices are fantasy and modern, and modern sets fantastic on.

### 16.8 Presets

- `modulePresetContent` and `parseModulePreset` round-trip a group preset.
- An unknown family is a problem and the note is excluded.
- An unknown genre falls back to `fantasy` with a problem.

---

## 17. Parked

- **Second release:** learning and culture (colleges, learned societies and clubs, players' companies, bands, schools of arms); sport and pastimes (teams, clubs).
- An **inns and taverns** module: the emblem pool (§5.5) is most of its data.
- **Place name wizard slots** fed by these modules, e.g. a colonial `[commander]` or `[explorer]` slot, or a holy-person slot from holy orders.
- Mottos in English.
- A name pack as a source for `{person}` (the book's "use the name lists to name a unit's commander").
