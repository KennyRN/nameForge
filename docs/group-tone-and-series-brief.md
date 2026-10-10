# Group names: tone and series – brief

This brief adds two controls to the seven group-name modules (faiths and mystic orders through supernatural courts and hosts). It does not touch tribes and kin groups.

- **Tone** weights names towards a mood: grand, plain, grim, light or strange.
- **Series** makes one press of Generate return one related set (2nd, 3rd and 7th Fenwick Rifles; the Harrow Family and its fronts) instead of separate names.

Both are extra steps in the existing pipeline. Everything here is data or a rule with fixed numbers. Where something isn't specified, follow `docs/group-names-brief.md`. Section numbers written as "GN §x" refer to that brief.

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Tones | Any (default) · grand · plain · grim · light · strange |
| Tone mechanism | Soft weighting only: a matching tone ×4, an opposing tone ×0.25. Tone never empties a choice. |
| Tone tagging | Shapes, whole lists and words in the adjective-style lists. Not every word. |
| Fronts | Front shapes take tone like any other shape |
| Series | Only when a type is picked. With type Any the series link is hidden and series is off. |
| Series and tone | A series is drawn under one tone. With tone Any, the first name's tone becomes the series tone. |
| Series anchor | Chosen automatically (§6.3), with an optional per-shape override |
| Data fix | Two stray entries from parsing GN notes are removed (§1) |

---

## 1. Data fix (do first)

Two entries in `src/data/group-names.json` are fragments of the GN brief's notes, not words. Both can appear in names today.

| List | Entry to remove | Note |
|---|---|---|
| `creatures` | `{"w": "elsewhere)", "x": 0.5}` | Fragment of "(×1 in fantasy, ×0.5 elsewhere)". The ×0.5 `sx` on Griffins, Dragons, Wyverns and Basilisks is already correct. |
| `nickTrait` | `{"w": "§12)"}` | Fragment of "(flag list, §12)" |

Add a data test (§9.1): no word in any list contains `(`, `)`, `§` or `×`, and none starts with a lower-case letter except in `brandEnd` and `townSuffix`.

---

## 2. Tone

### 2.1 The tones

| Key | Sentence text | Pulls towards |
|---|---|---|
| `any` | of any tone | current weights (no change) |
| `grand` | with a grand air | honorifics, long formal shapes, rich colours, royalty |
| `plain` | with a plain, workaday feel | town and surname shapes, numbers, everyday words |
| `grim` | with a grim edge | death, blood, ash, hollow, last |
| `light` | with a light touch | nicknames, euphemisms, everyday objects, irony |
| `strange` | with a strange air | cult phrasing, veils and thresholds, unsettling qualities |

### 2.2 Opposites

| Tone | Opposed by |
|---|---|
| grand | light, plain |
| plain | grand, strange |
| grim | light |
| light | grand, grim |
| strange | plain |

### 2.3 Tags in the data

- **Shapes:** an optional `"t": ["grim"]` on any shape record, including front shapes.
- **Whole lists:** a new top-level object `listTones`, e.g. `"listTones": { "lastThing": ["grim"] }`. Every word in the list carries the list's tags.
- **Words:** an optional `"t": [...]` on a word record. A word's own `t` **replaces** its list's tags (it doesn't add to them). An empty array `"t": []` makes a word neutral in a tagged list.
- Untagged means neutral.

### 2.4 Weighting rule

With tone `any`, nothing changes.

Otherwise, for a chosen tone T:

1. **Shape factor.** A shape's *effective tags* are its own `t` plus the `listTones` of every list its tokens name (for `{a/b}`, both lists). Words with their own `t` don't count here.
   - any effective tag equals T → ×4
   - otherwise, any effective tag opposes T → ×0.25
   - otherwise → ×1
2. **Word factor.** The same rule on the word's tags (its own `t`, or its list's), applied inside every list draw.
3. Multiply onto the existing weights (base × tradition × setting `sx` × tone) and renormalise, as GN §4 does.
4. The type draw (type Any) isn't weighted by tone.

A tagged item that matches T and also carries an opposing tag counts as matching.

### 2.5 Where tone applies

- Every list draw, including shared lists, family and type lists, composites (`emblem`, `band`), `nickname` parts and front lists.
- People and places: `{person}` parts use the word rule where they draw from tagged lists (`colour`, for instance). `{town}`, `{surname}` and `{house}` are never tone-weighted.
- Borrowed shapes in adventuring companies (GN §6.5) keep the tags they carry in their own type.

### 2.6 List tags (`listTones`)

| Tone | Lists |
|---|---|
| grand | `craftHonorific`, `heavenThing` |
| grim | `lastThing`, `deadQuality`, `hellPlace`, `chainItem` |
| light | `nickTrait`, `gangNoun`, `factionNick`, `compound`, `thiefEuph`, `gentleAdj`, `benefAdj`, `folkKind` |
| strange | `verbPhrase`, `cultName`, `secretQuality`, `folkFixed` |

### 2.7 Word tags

Words not named stay neutral (or keep their list's tag). Lists marked † carry a list tag in §2.6, and the words named here override it.

| List | grand | plain | grim | light | strange |
|---|---|---|---|---|---|
| `colour` | Gold, Golden, Silver, Scarlet, Azure, Ivory, Purple | Grey, Green, Blue, Red, Iron, Copper, Russet | Black, Ashen, Sable, Crimson | – | Pale, Violet |
| `colourRich` | Golden, Silver, Emerald, Sapphire, Ruby, Azure, Pearl, Ivory, Amethyst, Crystal, Opal, Topaz | Grey, Green, Blue, Red, White | Black, Ebony, Jet, Ashen, Sable, Crimson | Rosy, Rainbow | Pale, Incarnadine, Umber, Viridian |
| `desc` | Royal, Crown, High, Star, Sun, Gold, Silver, Thunder, Lightning | Iron, Stone, Salt, Border, Long, Old, Loyal, Sea, Grey | Blood, Bone, Death, Dire, Doom, Skull, Wrath, Chaos, Ash, Hollow, Last, Dark, Night | – | Rune, Moon |
| `quality` | Glorious, Radiant, Resplendent, Effulgent, Sublime, Supernal, Transcendent, Celestial, Eternal, Sacred, Shining, Luminous, Ineffable, Quintessential, Elder, Ancient, True | Inner, First, Pure, Still | Dark, Gloomy, Sinister, Shadowed, Forgotten, Lost, Weeping, Hollow, Last | Singing | Hidden, Veiled, Secret, Occult, Esoteric, Arcane, Unseen, Nameless, Unspoken, Whispering, Sleeping, Penumbral, Recondite, Concealed, Spiral, Mysterious, Recursive, Null, Fractal, Infinite |
| `number` | – | – | – | – | Seven, Nine, Thirteen |
| `shade` | – | Grey, Quiet, Long, Narrow, Lean | Bloody, Cold, Hollow, Black, Dark, Gloom, Midnight, Moonless | Velvet, Soft, Nimble, Sly, Quick, Ready, Crooked | Fog, Smoke, Whisper, Shade, Dim, Dusk |
| `cultQuality` | – | – | Hollow, Drowned, Hungry, Burning, Final, Crawling | – | Unblinking, Smiling, Faceless, Twin, Ninth, Nameless, Sleeping, Patient, Coming, Weeping, Pale, Silent |
| `cultEntity` | King, Queen, Crown, Throne, Sun | – | Worm, Mouth, Dark | – | Dreamer, Door, Eye, Hour, Choir, Child, Mother, Father, Lamb |
| `bloodQuality` | Ancient, Velvet | – | Hollow, Hungry, Cold | – | Silent, Patient, Sleepless, Nameless |
| `demonQuality` | Brazen | – | Burning, Hungry, Hollow, Cinder | – | Smiling, Laughing, Patient, Thousand-Voiced |
| `heavenQuality` | Shining, Radiant, Golden, Highest, Unfading | – | – | – | Silent |
| `holyQuality` | Holy, Blessed | Humble, Poor, Little, Barefoot | Penitent | – | Hidden, Silent |
| `holyEntity` | Grace, Mountain, Dawn, Far Light | Bread, Well, Hearth, Bell, Stone, Path, Gate, Lamp, Lantern, Open Hand | Ash | – | Silence, Vigil, Quiet Star |
| `rebelQuality` | Unbowed, Uncrowned, Unbroken, Rising | Free | Broken, Fallen, Last, Burning | – | Hidden |
| `secretQuality` † | – | Second, Inner | – | – | (list tag) |
| `secretItem` | – | Table, Ledger, Chair, Cup, Coin, Window, Stair, Glove, Quill | – | – | Mirror, Mask, Thread, Door, Seal |
| `councilQuality` | – | Upper, Lower, Lesser, Greater, Old | – | – | Silent, Hidden, Inner |
| `fleetQuality` | Thunder, Storm | Grey, Salt, Long, Swift, Iron | Night | – | Silent |
| `tradeDesc` | Royal, Golden, Silver | Old, Iron, Red, Green, Black | – | Honest, Good | – |
| `nickAdj` | Gallant, Faithful | Old, Fighting | Bloody | Lucky, Saucy, Ragged, Hungry, Stubborn | – |
| `entity` | Crown, Throne, Sceptre, Radiance, Dominion, Grail, Chalice, Sun, Revelation | Lamp, Lantern, Key, Hand, Path, Way, Word, Well, Stone | Darkness, Shadow, Void, Night, Serpent | Question | Veil, Labyrinth, Threshold, Mirror, Eye, Sleeper, Ouroboros, Spiral, Singularity, Silence, Portal, Hourglass |
| `uWeapon` | – | Knife, Blade | Garrotte, Razor, Fang, Claw, Stiletto, Dagger | Cosh, Needle, Hand | – |
| `uCreature` | – | Eels | Vipers, Scorpions, Spiders, Jackals, Rats, Crows | Jackdaws, Magpies, Ferrets, Stoats, Weasels, Cats, Moths, Foxes | Owls, Bats |
| `creatures` | Lions, Eagles, Griffins, Dragons, Stags, Falcons | Hounds, Bulls, Boars, Bears, Hawks | Vipers, Scorpions, Sharks, Wolves, Ravens, Rats, Devils | Badgers | Basilisks |
| `mercs` | Condottieri | Sellswords, Freeswords, Contractors, Free Lances | Destroyers, Devourers, Reavers, Marauders | – | – |
| `raiders` | – | Raiders, Bandits, Brigands, Outlaws, Pirates | Reavers, Wreckers, Marauders | Freebooters, Rovers, Buccaneers | – |
| `agents` | – | Finders | Slayers, Stalkers, Cutters, Takers | Lifters, Pickers, Light-Fingers, Creepers | Shadows, Walkers |
| `members` | Masters, Magi, Sages, Illuminants, Apostles, Revealers, Adepts | Brothers, Sisters, Fellows, Followers, Servants | – | Gentlemen, Ladies | Watchers, Dreamers, Walkers, Children, Hermits, Heirs |
| `soldiers` | Champions, Paladins, Victors, Lancers, Sentinels, Janissaries | Soldiers, Troopers, Fighters, Volunteers, Irregulars, Yeomen, Fencibles | Raiders | Bravos | – |
| `warders` | Lords, Knights, Preservers, Protectors, Crusaders | Guards, Sentries, Wardens | – | – | Watchers, Keepers |
| `gear` | Lances, Swords, Sabres | Spears, Shields, Bows, Pikes, Knives | Scythes, Teeth, Fangs, Talons, Claws, Flails, Maces | Bucklers, Darts, Fists | – |
| `expPlace` | Great Forest, Western Ocean | Interior, Inland Sea, Far North, Long River | Burning Sands, Sunken Coast | – | Lost Valley, Silent Reach |
| `feyTime` | Summer, Dawn | Harvest, Spring, Autumn | Winter, Midnight, Frost | – | Twilight, Dusk, Moonlit |
| `ideal` | Crown, Covenant, Restoration, Concord, Commonweal, Charter | Bread, Plough, Land, Harvest, Hearth, Commons, Lantern, Anchor | – | – | – |
| `smugglerAgents` | – | Runners, Landers, Blockade Runners, Tide-Runners | – | Gentlemen, Owlers, Lantern Men, Free Traders | – |
| `gangMembers` | Kings, Lords | Mob, Crew, Gang, Set, Firm | Jackals, Dogs, Hounds | Lads, Lasses, Boys, Girls, Saints | – |
| `techWord` | – | Kernel, Packet, Root, Signal, Vector, Proxy | – | Rust, Cold Boot | Null, Ghost, Echo, Mirror, Shadow, Cipher, Zero |
| `crewCollective` | – | Crew, Collective, Cell, Front, Club | Wolves | Kids | Choir, Ghosts, Saints |
| `pursuit` | the Preservation of Antiquities, the Encouragement of the Arts, Natural Philosophy | the Relief of Widows | – | Lantern-Lit Walks, Rational Recreation, Mutual Improvement | Quiet Remembrance, Psychical Research, the Study of Old Tongues |
| `redressAdj` | Supreme, Impartial | – | Final, Extreme, Ultimate, Utmost, Decisive | Apt, Fitting, Prompt, Reliable, Dependable, Discreet | – |
| `balancers` | Restorers, Reconcilers, Harmonisers | – | Disposers | Menders, Adjusters, Arrangers, Correctors, Regulators | – |
| `benefAdj` † | – | – | – | (list tag) | Patient |
| `folkKind` † | – | – | – | (list tag) | Quiet, Old, Lordly |
| `tech` | Celestial, Stellar, Galactic, Cosmic, Astral | Orbital, Ion, Solar, Lunar, Rocket | Void, Disruptor, Nullifier | – | Temporal, Quantum, Phase, Warp |
| `element` | Thunder, Storm, Flame | Iron, Stone | Ash, Night, Winter | – | – |
| `skyThing` | Sun, Star, Dawn | – | Frost | – | Mist, Dew, Dusk, Moon |
| `covenEmblem` | – | Thread, Needle | Bone, Hag-Stone, Toad | Hare, Cat, Broom, Apple, Candle | Mirror, Moon, Owl, Cauldron |
| `undeadNoun` | Kings, Lords, Host, Legion, Barrow-Kings | – | Dead, Risen | – | Sleepers |

Where a word appears more than once in a list (e.g. Lances in `gear`), every copy takes the tag. Where a list is defined per type rather than shared, tag it wherever it is defined.

### 2.8 Shape tags

Shapes are identified by type and pattern (`p`). Shapes not listed stay untagged (their list tags still count, §2.4). Esoteric and arcane share most patterns: tag both.

**Faiths and mystic orders**

| Type | Pattern | Tags |
|---|---|---|
| esoteric, arcane | `{quality} {group} of the {colourRich} {entity}` | grand |
| esoteric, arcane | `Most Ancient {group} of the {quality} {entity}` | grand |
| esoteric, arcane | `Hermetic {group} of the {entity}` | grand |
| esoteric, arcane | `{members} Beyond the {entity}` | strange |
| esoteric, arcane | `the {entity} {group}` | plain |
| arcane | `College of the {quality} {entity}` | grand |
| arcane | `the {quality} Choir` | strange |
| arcane | `{entity} Collective` | strange |
| holy | `Order of {holy}` | grand |
| holy | `the {habit} {holyMembers}` | plain |
| holy | `the {holyEntity} {holyGroup}` | plain |
| holy | `the {holyQuality} {holyMembers}` | plain |
| cult | `Those Who {verbPhrase}` | strange (also via list) |
| cult | `{cultGroup} of the {ordinalWord} {cultEntity}` | strange |
| cult | `Church of the {cultQuality} {cultEntity}` | grand |
| cult | `{person:poss} {cultGroup}` | plain |
| coven | `the {covenLand} Coven` | plain |
| coven | `the {covenLand} {covenMembers}` | plain |
| coven | `{covenMembers} of the {colourRich} Moon` | strange |
| coven | `the {number} of the {covenLand}` | strange |
| coven | `the {covenEmblem} {covenGroup}` | light |
| school | `the {emblem} School` | plain |
| school | `{person:poss} School` | plain |
| school | `Academy of the {quality} {entity}` | grand |
| school | `the {schoolIdea}` | light |

**Armies and martial orders**

| Type | Pattern | Tags |
|---|---|---|
| unit | `{person:poss} {band}` | plain |
| unit | `{ordinal} {unitGroup}` | plain |
| unit | `{ordinal} {town} {arm}` | plain |
| unit | `{ordinal} Battalion, {town} {arm}` | plain |
| unit | `Task Force {greek}` | plain |
| unit | `{ordinal} ({town}) Regiment of {regimentOf}` | grand |
| unit | `{ordinalWord} {unitGroup} of the {land}` | grand |
| unit | `{desc} {desc} {unitGroup}` | grim |
| unit | `the {nickname}` | light |
| chivalric | `Order of the {colour} {knightEmblem}` | grand |
| chivalric | `Most Noble Order of the {colour} {knightEmblem}` | grand |
| chivalric | `Knights Protector of the {land}` | grand |
| chivalric | `Royal {town} Order` | grand |
| chivalric | `Order of the {tech} Star` | grand |
| chivalric | `the {colour} Knights` | plain |
| chivalric | `the {knightEmblem} Knights` | plain |
| chivalric | `the {colour} {knightEmblem:pl}` | light |
| mercenary | `the {colour} Company` | plain |
| mercenary | `{person:poss} {mercs}` | plain |
| mercenary | `{surname} {securitySuffix}` | plain |
| mercenary | `the {town} {mercs}` | plain |
| mercenary | `Free Company of the {emblem}` | grand |
| mercenary | `the {desc} {emblem} Company` | light |
| fleet | `the {compass} Squadron` | plain |
| fleet | `{ordinal} Fleet` | plain |
| fleet | `the {town} {fleetGroup}` | plain |
| fleet | `{town} Navy` | plain |
| fleet | `Task Group {greek}` | plain |
| fleet | `Squadron of the {colour} {knightEmblem}` | grand |
| watch | `the {town} Watch` | plain |
| watch | `{town} Constabulary` | plain |
| watch | `{ordinal} Precinct` | plain |
| watch | `{town} Marshals` | plain |
| watch | `Bureau of {lawPursuit}` | plain |
| watch | `the {colour}-Coats` | light |
| watch | `Wardens of the {land}` | grand |
| raiders | `{person:poss} {raiders}` | plain |
| raiders | `the {desc} {gear}` | grim |
| raiders | `Brethren of the {colour} {raiderEmblem}` | light |
| guardians | `Guardians of the {desc} {land}` | grand |
| guardians | `the {colour} Watch` | plain |
| guardians | `Keepers of the {knightEmblem}` | strange |

**Thieves and the underworld**

| Type | Pattern | Tags |
|---|---|---|
| thieves | `the {agents:poss} {thiefGroup}` | plain |
| thieves | `the {town} {thiefGroup}` | plain |
| thieves | `{person:poss} {agents}` | plain |
| thieves | `the {uCreature}` | light |
| thieves | `Knights of the {uWeapon}` | light |
| assassins | `the {number} {uWeapon:pl}` | grim |
| assassins | `the {uCreature}` | strange |
| gang | `the {street} {gangMembers}` | plain |
| gang | `the {colour} {gangWear}` | plain |
| gang | `{person:poss} {gangMembers}` | plain |
| gang | `the {urbanArea} {gangMembers}` | plain |
| syndicate | `the {surname} Family` | plain |
| syndicate | `the {town} {firm}` | plain |
| syndicate | `{person:poss} {firm}` | plain |
| syndicate | `the {surname} {firm}` | plain |
| syndicate | `the {shade} Hand` | grim |
| syndicate | `the {number} {portPlaces}` | strange |
| syndicate | `the {colour} {emblem} {thiefGroup}` | grand |
| smugglers | `the {town} Ring` | plain |
| smugglers | `{person:poss} {smugglerAgents}` | plain |
| smugglers | `Gentlemen of the {land}` | light |
| smugglers | `the {colour} Lanterns` | strange |
| crew | `{person:poss} Crew` | plain |
| crew | `the {techWord} {uCreature}` | light |
| crew | `the {number} {crewNoun}` | strange |

**Guilds and trading houses**

| Type | Pattern | Tags |
|---|---|---|
| craft | `Guild of {tradesmen}` | plain |
| craft | `the {tradesmen:poss} Guild` | plain |
| craft | `the {town} {tradesmen}` | plain |
| craft | `{craftHonorific} Company of {tradesmen}` | grand (also via list) |
| craft | `{tradeDesc} {emblem} {tradesmen}` | light |
| merchant | `House {house}` | grand |
| merchant | `Honourable Company of {goods} Merchants` | grand |
| merchant | `Merchant Adventurers of {town}` | grand |
| merchant | `Company of the {knightEmblem}` | grand |
| merchant | `the {town} Company` | plain |
| merchant | `{goods} Merchants of {town}` | plain |
| merchant | `{surname} & {surname}` | plain |
| merchant | `the {town} {goods} Company` | plain |
| merchant | `{town} Trade Consortium` | plain |
| bank | `{surname} & {surname}` | plain |
| bank | `{surname} Brothers` | plain |
| bank | `Bank of {town}` | plain |
| bank | `{town} {bankWord}` | plain |
| bank | `House of {surname}` | grand |
| bank | `{surname}, {surname} & Co.` | grand |
| bank | `the {colour} {various} Bank` | light |
| corp | `{town} {corpSuffix}` | plain |
| corp | `{surname} {corpSuffix}` | plain |
| corp | `{initials}` | plain |
| corp | `{brandStart}{brandEnd}` | strange |
| union | `the {town} {unionTrade:poss} Union` | plain |
| union | `{unionTrade:poss} Friendly Society` | plain |
| union | `{initials}` | plain |
| union | `Amalgamated Society of {unionTrade}` | grand |
| union | `United Brotherhood of {unionTrade}` | grand |
| caravan | `{person:poss} Caravan` | plain |
| caravan | `the {surname} Line` | plain |
| caravan | `{town} Freight` | plain |
| caravan | `{town} Steam Packet Company` | plain |
| caravan | `Caravan of the {number} {wellPlaces}` | grand |
| caravan | `the {colour} {lineEmblem} Line` | light |

**Adventurers and explorers**

| Type | Pattern | Tags |
|---|---|---|
| company | `{person:poss} {companyGroup}` | plain |
| company | `the {compound}` | light (also via list) |
| company | `{compound} Company` | light (also via list) |
| company | `the {number} in {colour}` | light |
| company | `the {emblem} and {emblem} Company` | light |
| company | `{tradeDesc} {emblem} {vocation}` | light |
| company | `Company of the {ordinalWord} {emblem}` | strange |
| company | `the {colour} {creature:pl}` | plain |
| expedition | `the {expPlace} Expedition` | plain |
| expedition | `{person:poss} Expedition` | plain |
| expedition | `the {expPlace} Survey` | plain |
| expedition | `{ordinal} {town} Expedition` | plain |
| expedition | `Royal {expPlace} Survey` | grand |
| expedition | `Society for the Exploration of the {expPlace}` | grand |
| hunters | `the {monster} {hunterNoun}` | plain |
| hunters | `the {town} Huntsmen` | plain |
| hunters | `{person:poss} {retrieval}` | plain |
| hunters | `Brotherhood of the {desc} Hunt` | grim |
| hunters | `Hunters' Brotherhood of the {land}` | grand |
| hunters | `Order of the {colour} {weapon}` | grand |

**Powers and factions**

| Type | Pattern | Tags |
|---|---|---|
| council | `Council of {town}` | plain |
| council | `{town} {assemblyWord}` | plain |
| council | `the {town} {directorate}` | plain |
| council | `{ordinal} Directorate` | plain |
| council | `Council of {number} {various:pl}` | strange |
| council | `the {number}` | strange |
| council | `the {councilQuality} Court` | strange |
| council | `the {colour} Chamber` | grand |
| faction | `the {ideal} Party` | plain |
| faction | `the {factionColour}` | plain |
| faction | `the {ideal} Faction` | plain |
| faction | `the {factionNick}` | light (also via list) |
| faction | `Friends of the {ideal}` | light |
| faction | `Party of the {ideal}` | grand |
| secret | `the {number}` | strange |
| secret | `the {number} {secretItem:pl}` | strange |
| secret | `Friends of {person}` | light |
| secret | `Order of the {secretQuality} {secretItem}` | grand |
| rebels | `{person:poss} Rising` | plain |
| rebels | `the {colour} {rebelWear}` | plain |
| rebels | `{town} Liberation Front` | plain |
| rebels | `Army of the {ideal}` | grand |
| rebels | `the {rebelQuality} Hand` | grim |
| rebels | `the {ordinalWord} of {season} Movement` | strange |
| league | `the {number} {cityWord:pl}` | plain |
| league | `Union of {town} and {town}` | plain |
| league | `{town} {leagueGroup}` | plain |
| league | `League of {number} {cityWord:pl}` | grand |
| league | `Coalition of {number} Worlds` | grand |
| agency | `Section {number}` | plain |
| agency | `Bureau of {agencyPursuit}` | plain |
| agency | `Department of {agencyPursuit}` | plain |
| agency | `Office of {agencyPursuit}` | plain |
| agency | `{ordinal} Directorate` | plain |
| agency | `{initials}` | plain |
| agency | `the {colour} Desk` | plain |
| agency | `the {ruler:poss} {spyWord}` | light |
| agency | `the {colour} Cabinet` | strange |
| agency | `the {secretQuality} Office` | strange (also via list) |
| house | `House {house}` | grand |
| house | `House {house} of {town}` | grand |
| house | `House of the {colour} {knightEmblem}` | grand |
| house | `House {house} of {star}` | grand |
| house | `the {house:pl} of {town}` | plain |
| house | `the {house} Line` | plain |

**Supernatural courts and hosts**

| Type | Pattern | Tags |
|---|---|---|
| fey | `the {number} Courts of the {feyPlace}` | grand |
| fey | `the {feyTime} {feyTitle:poss} Court` | grand |
| fey | `Court of the {feyPlant} {skyThing}` | strange |
| fey | `Riders of the {feyPlace}` | strange |
| fey | `{person:poss} Court` | plain |
| fey | `Folk of the {feyPlace}` | light |
| blood | `the {colour} Line` | plain |
| blood | `Court of the {colour} {knightEmblem}` | grand |
| blood | `House {house}` | grand |
| blood | `Blood of {person}` | grim |
| blood | `the {number} Bloods` | grim |
| blood | `Children of the {bloodQuality} {skyThing}` | strange |
| pack | `the {land} Pack` | plain |
| pack | `{person:poss} Pack` | plain |
| pack | `the {shifter}-{kinWord}` | plain |
| pack | `the {number} {bodyPart:pl}` | grim |
| pack | `Children of the {skyThing}` | strange |
| spirit | `the {number} Winds` | strange |
| spirit | `Riders of the {weather}` | strange |
| spirit | `Court of the {feyPlace}` | grand |
| undead | `Host of the {ordinalWord} {hellPlace}` | grand (and grim via list) |
| undead | `Legion of the {deadQuality} Crown` | grand (and grim via list) |
| undead | `Army of {person}` | grand |
| undead | `Legion of the {land}` | grand |
| undead | `the {colour} Barrows` | grim |
| demon | `Host of the {ordinalWord} {hellPlace}` | grand (and grim via list) |
| demon | `Court of {number} {chainItem}` | grand (and grim via list) |
| demon | `Princes of the {hellPlace}` | grand (and grim via list) |
| demon | `{person:poss} Own` | light |
| demon | `the {demonQuality} Choir` | strange |
| celestial | `the {colour} Wings` | plain |
| celestial | `the {number} Thrones` | grand |
| celestial | `Choir of the {entity}` | grand |
| celestial | `Watchers of the {heavenThing}` | strange (and grand via list) |

**Fronts**

| Front | Pattern | Tags |
|---|---|---|
| society | `the {weekday} Club` | light |
| society | `the {streetFirst} {club}` | light |
| society | `{town} Benevolent Society` | plain |
| society | `{town} Philosophical Society` | grand |
| society | `Friends of the {respectablePlace}` | strange |
| society (pack) | `the {town} Hunt` | plain |
| thieves | `Honourable Company of {thiefEuph}` | grand (and light via list) |
| assassins | `{brandRoot} Resolution Services` | plain |
| business | all shapes | plain |
| freeTraders | `Friends of the Harbour Lights` | light |
| freeTraders | all other shapes | plain |
| office | all shapes | plain |
| folk | `the People of {peace}` | strange |
| folk | `Folk of the {respectablePlace}` | strange |
| benefactor | `{town} Mutual Assurance Society` | plain |
| benefactor | `Friends of the {bargainWord}` | strange |

### 2.9 Coverage check

Some families have little or nothing for a tone (celestial hosts have no light shapes). That is intended: soft weighting means a "light" celestial host still generates, just as it does with Any. No new shapes are added in this brief.

---

## 3. Series

### 3.1 What a series is

With a type picked and series on, one press of Generate returns one related set of the requested size. Examples (illustrations, not fixed outputs):

| Type | A series |
|---|---|
| unit | 2nd Fenwick Rifles · 3rd Fenwick Rifles · 7th Fenwick Rifles · 12th Fenwick Rifles |
| fleet | 1st Fleet · 2nd Fleet · 4th Fleet |
| chivalric | Order of the White Hart · Order of the White Swan · Order of the White Spur |
| syndicate (front: may hide) | the Harrow Family · the Harrow Combine · Harrow & Sons Haulage · the Harrow Social Club |
| corp | Kestrel Dynamics · Kestrel Logistics · Kestrel Capital |
| fey | the Winter Court · the Summer Court · the Twilight Court |
| holy | Brothers of the Lantern · Sisters of the Lantern · Poor Friars of the Lantern |

### 3.2 Counters and anchors

A shape's tokens fall into three kinds for a series:

| Kind | Tokens | In a series |
|---|---|---|
| **Counter** | `{ordinal}`, `{ordinalWord}`, `{greek}` | counts upwards (§3.4) |
| **Owner** | `{town}`, `{surname}`, `{house}`, `{brandRoot}`, `{star}` | can be the anchor |
| **List** | every other list token, including `{number}` | can be the anchor |

`{person}`, `{holy}` and `{initials}` are never anchors and never counters. Placeholders (`[place]`, `[surname]` and so on) are never anchors.

### 3.3 Choosing the shape and anchor

1. **Type** is the picked type. Series is never on with type Any (§5).
2. **Tone.** If the chosen tone is Any, the series tone is decided after step 3: the first tag of the first shape's effective tags (§2.4) in the order grand, plain, grim, light, strange, or Any if it has none. Every later draw in the series uses that tone.
3. **Shape.** Draw one shape as usual (form, front, setting, tone, tradition all apply). Redraw if the shape has no counter and no token that can vary (e.g. `the {surname} Family` in placeholder mode). Fronts: with front "hide", draw from front shapes; with "say" or "may hide", draw from plain shapes.
4. **Anchor.** If the shape has a counter, the counter varies and every other token is locked to its first value. Otherwise:
   1. the shape's `seriesAnchor` if it has one (§3.6);
   2. else the first owner token, unless it renders as a placeholder;
   3. else, if the shape has two or more list tokens, the first list token;
   4. else (one list token only) there is no anchor: the shape is locked and that token varies.
5. Every token that is neither the anchor nor a counter varies freely.

### 3.4 Counting

- **`{ordinal}`:** the first value is drawn as now. Each next value adds a gap: +1 (50%), +2 (25%), or +3 to +6 (25%, evenly). Stop at 99.
- **`{ordinalWord}`:** the same gaps, stepping through the list in its stored order (First … Thirteenth).
- **`{greek}`:** the same gaps, in alphabet order (Alpha … Omega).
- If the shape has two counters (`{greek} {greek} {starBand}`), only the first counts; the second is locked.
- The series is returned sorted by the counter.
- If the counter runs out before the batch is full, return what there is with the notice "Only {n} names could be generated."

### 3.5 Filling and topping up (no counter)

1. Draw names from the locked shape, keeping the anchor value, until the batch is full or 20 draws in a row add nothing new.
2. **Top up** from the type's other shapes that contain a token of the same kind as the anchor (the same list name, or the same owner token), with the anchor value fixed. With front "may hide" or "hide", front shapes of the type's front style that contain that token join the top-up pool. Tone, form and setting rules apply. This is how *Harrow & Sons Haulage* joins *the Harrow Family*.
3. If there's no anchor (§3.3 step 4.4), there's no top-up.
4. Still short: the usual notice.

Names in a series are unique, case-insensitively, like any batch. All safeguards (GN §12) apply to each name; a blocked name is redrawn within the same series rules.

### 3.6 `seriesAnchor` overrides

An optional `"sa": "<list name or owner token>"` on a shape overrides step 4. Set these:

| Type | Pattern | `sa` |
|---|---|---|
| holy | `{holyMembers} of the {holyEntity}` | `holyEntity` |
| holy | `{holyQuality} {holyMembers} of the {holyEntity}` | `holyEntity` |
| esoteric, arcane | `{members} of the {quality} {entity}` | `entity` |
| esoteric, arcane | `{members} of the {entity}` | `entity` |
| cult | `Children of the {cultQuality} {cultEntity}` | `cultEntity` |
| cult | `Cult of the {cultQuality} {cultEntity}` | `cultEntity` |
| craft | `{tradesmen} of the {colour} {emblem}` | `emblem` |
| merchant | `{goods} Merchants of {town}` | `town` |
| rebels | `Sons of the {rebelQuality} {rebelEmblem}` | `rebelEmblem` |
| rebels | `Daughters of the {rebelQuality} {rebelEmblem}` | `rebelEmblem` |
| fey | `Court of the {feyPlant} {skyThing}` | `skyThing` |

Owner-token overrides follow the placeholder rule: if the anchor would render as a placeholder, fall back to step 4.

### 3.7 What the engine returns

Add to each returned name, for tests: `tones: string[]` (the effective tags of its shape plus the tags of every word drawn) and, in a series, `series: { anchor: string | null, value: string | null, counter: string | null }`. The batch gains `seriesTone` when series is on. The view still uses only `text`.

---

## 4. Options

Add to `GroupOptions`:

| Option | Values | Default |
|---|---|---|
| `tone` | `any`, `grand`, `plain`, `grim`, `light`, `strange` | `any` |
| `series` | `true`, `false` | `false` |

The engine throws if `series` is true and no type is given.

---

## 5. The sentence

### 5.1 Shape

> ‹General›-themed ‹regular units› for a ‹fantasy› world ‹of historic or low fantasy›, using ‹formal or everyday› names ‹with a grim edge› ‹that say what they are›, with ‹placeholders for› people and places, ‹as one related set›.

### 5.2 New fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `tone` | §2.1 sentence text | the six | `any` ("of any tone") |
| `series` | "each one separate" · "as one related set" | the two | separate |

- The tone link sits after the form link, before the front link.
- The series link comes last, after "people and places" and a comma, and shows **only when a type is picked**. When hidden, `series` reads as false.
- **Tooltips:** tone, "Tone: weights names towards a mood; it never rules any out"; series, "A related set: one shape, sharing a town, colour, owner or a number sequence".

### 5.3 Resets

- **Type set to Any:** series resets to separate.
- Nothing else resets tone or series.

### 5.4 Plain text

As GN §2.6. The default mystic sentence now reads:

> General-themed orders and faiths of any kind for a fantasy world of historic or low fantasy, using formal or everyday names of any tone that say what they are, with placeholders for people and places.

Update the GN §16.7 test to this text.

---

## 6. History and presets

### 6.1 History

Append ` · {tone}` when the tone isn't Any, then ` · series` when series is on: "armies and martial orders · historic or low fantasy · Germanic & Norse · grim · series". `historySection()` still matches on the module label at the start.

### 6.2 Presets

Two new keys in group presets (GN §13):

| Key | Values | Default |
|---|---|---|
| `tone` | `any`, `grand`, `plain`, `grim`, `light`, `strange` | `any` |
| `series` | `true`, `false` | `false` |

- An unknown value is reported as `Unknown {key} “{x}”.` and takes the default, as other keys do.
- A preset with `series: true` and `groupType: any` runs as separate names and reports `Series needs a type.`
- Older presets without these keys load as `any` and `false`.

---

## 7. Code layout

| File | Change |
|---|---|
| `src/data/group-names.json` | §1 fix; `listTones`; `t` on words and shapes; `sa` on shapes |
| `src/groups/engine.ts` | tone factor (§2.4), series (§3), new options and return fields |
| `src/groups/sentence.ts` | tone and series fields, resets, plain text |
| `src/presets.ts` | the two keys |
| `tests/groupNames.test.ts` | §9 |

Add this brief to `docs/` as `group-tone-and-series-brief.md`.

---

## 8. Milestones

Run `npm test` and `npm run build` at the end of every milestone; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Data fix and tone.** §1, §2, the tone option | §9.1–§9.3 pass; all existing group tests pass |
| M2 | **Series.** §3 | §9.4 passes |
| M3 | **Sentence, history and presets.** §5, §6 | §9.5–§9.6 pass; tone and series work in the app |

---

## 9. Tests (`tests/groupNames.test.ts`)

### 9.1 Data

- No word contains `(`, `)`, `§` or `×`; none starts lower case except in `brandEnd` and `townSuffix`.
- Every `t` value and every `listTones` value is one of grand, plain, grim, light, strange. Every `listTones` key names an existing list.
- Every shape named in §2.8 and §3.6 exists in the data with the given tags or `sa`, and every `sa` names a token that appears in its shape.

### 9.2 Tone weighting

- Tone `any` gives exactly the same names as before this brief for the same seed and options.
- For each family, each tone T, in FH (MF for supernatural if FH lacks the type), type Any, 2,000 names: if the family has at least one shape whose effective tags include T, the share of names whose `tones` include T is at least **1.5×** the share with tone Any.
- For each tone T with an opposite O (§2.2), same batches: the share of names whose `tones` include O is **lower** than with tone Any.

### 9.3 Tone never empties

Extend GN §16.2 coverage: every module × available setting × form × front × people × each of the six tones returns 20 unique names.

### 9.4 Series

- `series: true` without a type throws.
- **Counter:** martial unit, invented people, a seed whose first shape is `{ordinal} {town} {arm}`: all names share the town and arm; ordinals strictly increase.
- **Anchor:** for 200 seeds per type across all types and settings, series of 5: every name either uses the first name's shape or contains the anchor value. Where `series.anchor` is set, every name contains `series.value`.
- **Placeholders:** in placeholder mode, no `series.anchor` is an owner token.
- **Top-up:** syndicate, front "may hide", invented people: in at least 25% of 200 series of 5 whose first shape is `the {surname} Family`, at least one name comes from a front shape and contains the same surname.
- **Tone lock:** with tone Any, every name in a series is generated with `seriesTone`, and `seriesTone` matches §3.3 step 2.
- **Shortfall:** an `{ordinalWord}` series of 20 returns at most 13 names with the notice.

### 9.5 Sentence

- The default plain text is the §5.4 text.
- The series segment is absent with type Any and present with a type picked.
- Setting the type back to Any sets series to false.
- The tone segment sits between form and front.

### 9.6 Presets and history

- A group preset with `tone: grim` and `series: true` round-trips.
- `series: true` with `groupType: any` reports `Series needs a type.` and runs separate.
- An older preset without the keys loads as `any` / `false`.
- The history label gains " · grim · series" with those options and nothing with Any and separate.

---

## 10. Parked

- New shapes written specifically to give every family something in every tone.
- Tone for tribes and kin groups.
- Shades as built-in starting points (curated presets such as *Roman legions* or *Victorian street gangs*).
- A series that spans types (an army with its fleet).
