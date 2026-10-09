# Coding brief: tribal names module and biomes

> [!summary] What this brief asks for
> 1. A new **tribal names** module: modern-English names for fictional peoples, kin groups, confederations, dynasties and war-bands, built from 17 naming traditions.
> 2. A shared **biome** system. Each of 11 biomes carries its own landscape, water, wildlife, plants, crops, livestock, lifeways, sacred features and materials. A biome is chosen separately from the naming tradition, so Māori-style names can be set in temperate woodland or a tropical rainforest.
> 3. **Biomes for explorers and incomers.** Exploration in new lands and Expansion into settled lands gain a biome. It fills the native wildlife and plant slots with real English words in place of `[native bird]`-style placeholders, and it joins the place name wizard's sentence.
> 4. **Tribal names as a slot source.** The `[native people]` and `[folk group]` slots can draw from the tribal names module.
>
> Everything is fixed numbers. Where this brief gives a weight, use it; do not tune or guess.

Read the whole brief before starting. Work through the milestones in §21 in order, running `npm test` and `npm run build` at the end of each. Commit at the end of each milestone.

---

## 0. Decisions already taken

These settle the open questions from the design document (v2 §17) and the biome redesign. Do not reopen them.

| Question | Decision |
|---|---|
| Module name | **tribal names** (lowercase, like the other modules) |
| Release list | All 17 traditions are built. They are grouped in the menu as General, First release (8), Second release (4) and Expansion (4) |
| Ancestor default | English epithet (the Far Navigator, the Iron King) |
| Flag list default | Allow and flag (`echoesReal: true`) |
| Hostile names toggle | Per run, in the generate view, off by default |
| Show histories | Folded into the module's existing details toggle (off by default), rather than a separate switch |
| Biomes | Promoted from an Advanced override to a first-class choice. **Tradition decides how a name is built and what it favours; biome decides which nature words exist.** Default biome is "Homeland": the tradition's own biomes |
| Biome data | One shared data file used by tribal names, exploration and expansion recipes, the two colonial generate-view modules and the river names module's colonial settings |
| Colonial default | A colonial recipe with no biome behaves exactly as today (native placeholders). Output must be byte-identical for the same seed |

---

## 1. Codebase orientation

The repo is `KennyRN/nameforge` (Obsidian plugin, TypeScript, esbuild). Follow its existing conventions:

- **Engines are Obsidian-free** and live in their own folder (`src/world/engine.ts`, `src/rivers/engine.ts`). Their data is JSON in `src/data/`. Tests import engines directly and run under `node:test` through `scripts/run-tests.mjs` (`npm test`).
- **One seeded stream.** Every engine takes an optional seed, builds `mulberry32(seed)` from `src/markov.ts`, and draws everything from it. Batches are unique case-insensitively with at most `count × 50` attempts.
- **Comments cite the brief.** Existing code writes `// River brief §6.9: …`. Cite this brief as `Tribal brief §n`.
- **British English** in all user-facing text. OUP punctuation: spaced en dashes, colons for label–value text.

### 1.1 Files to add

| File | Purpose |
|---|---|
| `src/data/biomes.json` | The 11 biomes, universal terrain words and irregular plurals (§3) |
| `src/biomes.ts` | Obsidian-free biome API: types, lookup, word draws, colonial entries (§3.9) |
| `src/data/tribal-names.json` | Traditions, group types, perspectives, themes, shared vocabulary, collectives, templates, history fragments, safeguard lists (§4–§17) |
| `src/tribes/engine.ts` | The tribal names engine (Obsidian-free) |
| `src/tribes/slotFill.ts` | Short tribal names for recipe slots (§20) |
| `src/colonialSentence.ts` | The wizard sentences as plain data, so they can be tested (§19.2) |
| `tests/biomes.test.ts` | §22.1 |
| `tests/tribalNames.test.ts` | §22.2 |
| `tests/colonialBiomes.test.ts` | §22.3 |
| `tests/tribalSlots.test.ts` | §22.4 |

### 1.2 Files to change

| File | Change |
|---|---|
| `src/sections.ts` | New section `tribalNames`, label `tribal names`, after `empireExpansionPlaceShapes`; history prefix `tribal names` |
| `src/icons.ts` | `ICON_TRIBAL_NAMES`: pick a "group of people" or "campfire" glyph from an icon set already credited in `LICENCES - Third Party`; register it like the others |
| `src/modal.ts` | Tribal names generate view (§18); biome box for the colonial modules and colonial river settings (§19.4–§19.5) |
| `src/names/recipe.ts` | `shape.biome`; slot kind `tribal` (§19.1, §20.1) |
| `src/names/engine.ts` | Biome fills for native flora and fauna; tribal slot fills (§19.3, §20.2) |
| `src/names/slotOptions.ts` | Tribal names option on two slots (§20.3) |
| `src/recipeEditor.ts` | Biome in both colonial sentences; slot default label; tribal slot footer (§19.2, §20.3) |
| `src/rivers/engine.ts` | Biome option for colonial settings (§19.5) |
| `README.md` | A short section on tribal names and biomes |

Do not change `colonial-shapes.json`, `place-shapes.json`, `name-words.json` or `river-names.json` except where §19.5 adds one key to `river-names.json`.

---

## 2. The English-only rule

This overrides every other section.

1. **Output is modern English.** No native-language forms, transliterations, reconstructions or affixes ever appear: no *iwi*, *ayllu*, *Banu*, *Kel*, *Orang*, *Ngāti*, *-che*, *-tlan*.
2. **Established English loanwords are allowed** where an ordinary English dictionary lists them and an English speaker would use them unprompted: jaguar, condor, llama, quetzal, oasis, lagoon, atoll, fjord, mangrove, hornbill, monkey-puzzle, wadi, billabong, tundra, paddy, jungle.
3. **Traditions supply patterns, not words.** The Māori habit of naming a people after the canoe their ancestors arrived on becomes "People of the White Heron Canoe". The Malay *orang laut* pattern becomes "Sea Folk". The Nahuatl "place of…" suffix becomes "People of the Place of Flints".
4. **Bracketed slots** (`[ancestor]`, `[founder]`, `[deity]`) are the only non-English placeholders, and `[ancestor]` and `[founder]` resolve to English epithets by default.

---

## 3. Biomes

### 3.1 Principle

A biome is a complete kit of nature words for one kind of country. It answers "what is out there?": the land, the water, the animals, the trees, the crops, the livestock, how people make a living, and what they hold sacred in the landscape. It never decides grammar, templates, collectives or how names are weighted. That is the tradition's job.

So a Polynesian-style people moved to temperate woodland keep their habits (descent from an ancestor, the founding canoe, windward and leeward) but name themselves after oaks, herons and chalk hills: *Descendants of the Heron*, *People of the White Heron Canoe*, *Seaward Kin of the Chalk Hills*.

### 3.2 The 11 biomes

| Id | Menu label | Sentence phrase | Guide (tooltip) |
|---|---|---|---|
| `temperate` | Temperate woodland | temperate woodland | Broadleaf forest, heath and farmland with four seasons: most of Europe, eastern North America, northern China, Korea and Japan. |
| `boreal` | Northern forest and tundra | northern forest and tundra | Conifer forest, lakes, tundra and ice: Scandinavia, Siberia, Canada, Alaska and the Arctic edge. |
| `cool-rainforest` | Cool rainforest | cool rainforest | Wet, mild forest of giant conifers, ferns and moss on mountainous coasts: the Pacific Northwest, New Zealand, southern Chile, Tasmania and western Norway. |
| `mediterranean` | Mediterranean hills | Mediterranean hills | Hot dry summers, mild wet winters, scrub-covered hills and rocky coasts: the Mediterranean, California, central Chile, the Cape and south-west Australia. |
| `steppe` | Steppe and prairie | the steppe | Vast treeless grassland with hot summers and bitter winters: the Eurasian steppe from Hungary to Mongolia, the North American plains and the pampas. |
| `desert` | Desert | the desert | Sand seas, stony plains, wadis and oases: the Sahara, Arabia, central Asia's deserts, the American south-west, the Atacama and Australia's interior. |
| `savannah` | Savannah | the savannah | Tall grass, scattered trees and a long dry season: eastern and southern Africa, the Sahel's southern edge, northern Australia, the Brazilian cerrado and India's Deccan. |
| `rainforest` | Tropical rainforest | tropical rainforest | Hot, wet, evergreen forest under a closed canopy, laced with great rivers: the Amazon, the Congo basin, Borneo, Sumatra and lowland New Guinea. |
| `monsoon` | Monsoon lands | the monsoon lands | Wet and dry seasons, river plains, paddy fields, bamboo and teak forest: India, Bangladesh, mainland South-East Asia, southern China and Java. |
| `tropical-islands` | Tropical islands | tropical islands | Volcanic peaks, coral atolls, lagoons and open ocean: Polynesia, Micronesia, Melanesia, the Caribbean and the Indonesian and Philippine archipelagos. |
| `highland` | High mountains | the high mountains | Cold, thin-aired country above the forests: the Andes, the Himalaya and Tibet, the Pamirs, the Ethiopian highlands, the high Alps and New Guinea's highland basins. |

Menu order is the table order. Biome base word lists are deliberately continent-neutral "storybook" kits: a rainforest has monkeys, leopards and parrots wherever it is. Regional specifics (jaguar, kangaroo, bison) come from a tradition's homeland flavour (§3.7), which only applies in Homeland mode.

### 3.3 Terrains

Every biome is divided into six terrains. A terrain is drawn by weight whenever a landscape or water word is needed.

| Terrain id | Meaning |
|---|---|
| `open` | The biome's main country |
| `mountains` | Mountains and high ground |
| `coast` | Shores and the sea's edge |
| `rivers` | Rivers, lakes, springs and wells |
| `wetland` | Marsh, swamp, bog and delta |
| `islands` | Offshore islands |

**Terrain weights** (each row sums to 100):

| Biome | open | mountains | coast | rivers | wetland | islands |
|---|--:|--:|--:|--:|--:|--:|
| temperate | 40 | 10 | 15 | 20 | 10 | 5 |
| boreal | 35 | 15 | 15 | 20 | 10 | 5 |
| cool-rainforest | 30 | 20 | 25 | 15 | 5 | 5 |
| mediterranean | 35 | 15 | 25 | 10 | 5 | 10 |
| steppe | 60 | 10 | 0 | 25 | 5 | 0 |
| desert | 55 | 15 | 10 | 20 | 0 | 0 |
| savannah | 55 | 10 | 5 | 20 | 10 | 0 |
| rainforest | 45 | 10 | 5 | 30 | 10 | 0 |
| monsoon | 40 | 15 | 10 | 25 | 10 | 0 |
| tropical-islands | 15 | 15 | 35 | 5 | 5 | 25 |
| highland | 35 | 40 | 0 | 20 | 5 | 0 |

A landscape word draws a terrain from those that have land words (renormalising the weights); a water word draws from those that have water words. Tradition terrain multipliers (§5.3) apply before renormalising.

### 3.4 Universal terrain words

Available in every biome, but only within their terrain. Weight 1 each (biome words weigh 2, §3.6).

| Terrain | Land words | Water words |
|---|---|---|
| open | Hills, Valley, Ridge, Hollow, Plain, Upland, Lowland | – |
| mountains | Mountains, Peaks, Pass, Heights, Crags | Falls, Springs |
| coast | Shore, Headland, Cliffs, Point | Bay, Inlet, Straits |
| rivers | – | River, Upper River, Lower River, Ford, Falls, River Fork, River Mouth, Springs, Lake, Twin Streams, Three Rivers |
| rivers (closed compounds) | – | Blackwater, Whitewater, Darkwater, Swiftwater, Deepwater, Reedwater, Clearwater, Redwater |
| wetland | – | Marsh, Swamp, Reeds |
| islands | Isles, Island, Outer Islands, Twin Isles | Sound |

**The Blackwater rule.** "Blackwater" (closed) reads as the proper name of a river or region; "Black Water" (open) describes the water. Closed compounds are stored and rendered closed; open phrases are never merged.

### 3.5 Biome data

Each biome below has the same sections. Word lists are uniform unless a word carries a weight in brackets: `cattle (2)` weighs 2, `bear (0.5)` weighs 0.5. Lifeway weights are given in full and sum to 100.

> [!note] How the sections are used
> - **Land / Water by terrain:** the landscape and water themes in tribal names.
> - **Wild animals, Birds, Creatures:** the animals theme in tribal names; the `wild-animal`, `bird` and `fish-and-other-creatures` slots in colonial recipes.
> - **Trees, Plants:** the plants theme; the `tree` and `wild-plant` slots in colonial recipes.
> - **Crops:** the plants theme (×0.5) and lifeway names.
> - **Livestock:** the animals theme (×0.5); gates "Ride the…", "Horse Stealers" and similar.
> - **Lifeways:** the lifeway theme (agent nouns).
> - **Sacred:** added to the universal sacred list (§9.2).
> - **Materials:** template Q ("Place of Flints") and the emblem pool for template F.

#### temperate – Temperate woodland

| Terrain | Land | Water |
|---|---|---|
| open | Downs, Downland, Chalkland, Chalk Hills, Moor, Heath, Wold, Woodland, Forest, Greenwood, Vale, Meadows | – |
| mountains | Fells, High Moors, Stony Heights, Blue Hills | Tarns, Hill Springs |
| coast | Shingle, Sea Cliffs, White Cliffs, Dunes | Estuary, Grey Sea, Tidal Flats |
| rivers | Water Meadows, Riverlands | Broad River, Stony Ford, Willow Ford, Eastern Ford, Brook, Clear Pools |
| wetland | Levels, Fenland | Fen, Fens, Reed Marsh, Bog, Mere |
| islands | Green Isles, Grey Isles, Seal Isles | – |

- **Wild animals:** bear, wolf, boar, deer, stag, elk, fox, otter, beaver, hare, badger, wildcat, lynx
- **Birds:** raven, crow, hawk, eagle, owl, heron, crane, swan, woodpecker, cuckoo, wren, kingfisher, falcon
- **Creatures:** salmon, trout, pike, eel, adder, toad, bee, seal
- **Trees:** oak, ash, yew, hazel, alder, birch, rowan, willow, beech, elm, holly, lime
- **Plants:** heather, bracken, gorse, reed, rush, fern, thistle, mistletoe, ivy, foxglove
- **Crops:** wheat, barley, oats, rye, flax, beans
- **Livestock:** cattle (2), horse (2), sheep (2), pig, goat, hound, goose, ox
- **Lifeways:** Cattle Keepers 14, Ploughmen 12, Shepherds 10, Hunters 8, Fishers 8, Smiths 8, Woodsmen 8, Swineherds 6, Weavers 6, Horse Breeders 6, Potters 5, Salt Makers 4, Traders 4, Charcoal Burners 1
- **Sacred:** Standing Stones, Sacred Grove, Old Oak, Barrow, Midsummer Fire, Holy Well (0.5)
- **Materials:** Flints, Chalk, Iron, Tin, Copper, Salt, Amber, Jet

#### boreal – Northern forest and tundra

| Terrain | Land | Water |
|---|---|---|
| open | Pine Forest, Dark Forest, Birch Woods, Barrens, Tundra, Snowfields, Ice Edge, Frozen Plain | – |
| mountains | Ice Mountains, White Peaks, Glacier, Bare Fells | Meltwater, Ice Falls |
| coast | Ice Shore, Skerries, Cold Shore, Floe Edge | Fjord, Long Inlet, Cold Sea, Ice Sea |
| rivers | Lakelands | Rapids, Ice River, Long Lake, Clear Lakes, Cold Springs, Thousand Lakes |
| wetland | – | Mire, Peat Bog, Moss, Bog |
| islands | Ice Isles, Seal Isles, Bird Rocks | – |

- **Wild animals:** bear, white bear, wolf, elk, reindeer, wolverine, lynx, fox, Arctic fox, hare, beaver, musk ox, marten, sable
- **Birds:** raven, eagle, owl, snowy owl, swan, goose, diver, ptarmigan, crane, gyrfalcon
- **Creatures:** salmon, char, pike, seal, walrus, whale, killer whale, narwhal
- **Trees:** pine, spruce, fir, larch, birch, cedar, willow, aspen
- **Plants:** moss, lichen, cloudberry, cotton grass, crowberry, reindeer moss
- **Crops:** barley, rye, oats
- **Livestock:** reindeer (3), dog (2), horse (0.5)
- **Lifeways:** Reindeer Herders 16, Hunters 14, Salmon Fishers 12, Sealers 8, Fur Hunters 8, Whalers 6, Ice Fishers 6, Woodsmen 6, Sledge Drivers 5, Boatwrights 5, Net Makers 5, Smiths 5, Traders 4
- **Sacred:** Northern Lights, Midnight Sun, Long Night, First Snow, Sacred Bear, Stone Cairns
- **Materials:** Amber, Ivory, Iron, Furs, Antler, Soapstone, Copper

#### cool-rainforest – Cool rainforest

| Terrain | Land | Water |
|---|---|---|
| open | Deep Forest, Fern Forest, Moss Forest, Mist Forest, Old Forest, Green Valleys, Great Trees | – |
| mountains | Snow Peaks, Fire Mountain, Glaciers, Cloud Peaks | Meltwater, Hot Springs |
| coast | Black Sands, Sea Stacks, Rocky Shore | Long Inlet, Fjords, Sounds, Kelp Beds |
| rivers | – | Rapids, Glacier River, Green River, Clear Lakes, Hot Springs |
| wetland | – | Swamp, Peat Bog, Flax Swamp |
| islands | Green Isles, Rain Isles | – |

- **Wild animals:** bear, black bear, wolf, elk, deer, cougar, otter, sea otter, beaver, mountain goat, mink
- **Birds:** raven, eagle, owl, heron, kingfisher, mountain parrot, wren, thrush, gull, hawk
- **Creatures:** salmon, trout, eel, seal, sea lion, killer whale, whale, octopus, crab
- **Trees:** cedar, spruce, hemlock, fir, tree fern, southern beech, alder, yew
- **Plants:** fern, moss, lichen, flax, salmonberry, sorrel, bramble
- **Crops:** sweet potato, beans
- **Livestock:** dog (2)
- **Lifeways:** Salmon Fishers 18, Hunters 12, Cedar Carvers 10, Boatwrights 8, Weavers 8, Whalers 6, Sealers 6, Net Makers 6, Berry Gatherers 6, Traders 6, Coppersmiths 6, Shell Gatherers 4, Gardeners 4
- **Sacred:** Carved Posts, Great Cedar, Mist, Fire Mountain, Steaming Springs
- **Materials:** Greenstone, Copper, Obsidian, Shells, Cedar Bark

#### mediterranean – Mediterranean hills

| Terrain | Land | Water |
|---|---|---|
| open | Scrub Hills, Rocky Hills, Stony Plain, Terraces, Dry Valleys, Golden Hills, Oak Hills, Limestone Hills | – |
| mountains | White Mountains, Limestone Peaks, Snow Peaks, High Pastures | Mountain Springs |
| coast | Rocky Shore, Coves, White Cliffs, Sea Caves | Blue Bay, Calm Sea, Wine-Dark Sea |
| rivers | Gorge | Winter Stream, Dry River, Cold Spring |
| wetland | – | Salt Marsh, Lagoon, Delta |
| islands | Many Isles, White Isles, Rocky Isles | – |

- **Wild animals:** wolf, boar, deer, lynx, wild goat, ibex, fox, hare, bear (0.5), jackal, wild sheep
- **Birds:** eagle, vulture, hawk, owl, dove, partridge, swallow, stork, hoopoe, nightingale, woodpecker
- **Creatures:** tuna, dolphin, octopus, lizard, tortoise, scorpion, cicada, bee, viper
- **Trees:** olive, oak, cork oak, cypress, pine, laurel, fig, carob, almond, plane
- **Plants:** thyme, myrtle, rosemary, broom, oleander, asphodel, sage
- **Crops:** wheat, barley, vines, olives, figs, lentils, beans
- **Livestock:** sheep (2), goat (2), cattle, horse, donkey, pig, hound, bull
- **Lifeways:** Shepherds 14, Fishers 12, Goatherds 10, Vine Growers 10, Olive Growers 10, Seafarers 10, Traders 10, Ploughmen 8, Potters 6, Smiths 4, Beekeepers 4, Salt Makers 2
- **Sacred:** Sacred Spring, Oracle, Old Shrine, Sacred Cave, Holy Mountain, Evening Star
- **Materials:** Marble, Copper, Silver, Salt, Purple Shells

#### steppe – Steppe and prairie

| Terrain | Land | Water |
|---|---|---|
| open | Grass, Grasslands, Open Plain, Black Earth, Salt Flats, Sea of Grass, Rolling Plains, Short Grass, Long Grass, Badlands | – |
| mountains | Sky Mountains, Golden Mountains, Stony Hills, Snow Ridge | Snow Springs |
| rivers | River Bluffs | Salt Lake, Salt Lakes, Bitter Springs, Wide River, Muddy River, Wells, Seven Wells, Long River |
| wetland | – | Reed Lakes, Reed Beds, Salt Marsh |

- **Wild animals:** wolf, wild horse, deer, antelope, wild ass, marmot, bison, gazelle, fox, hare, bear (0.3)
- **Birds:** eagle, golden eagle, falcon, hawk, bustard, crane, lark, kite, vulture, swan
- **Creatures:** sturgeon, carp, snake, viper, locust, beetle
- **Trees:** poplar, willow, birch, tamarisk, elm
- **Plants:** feather grass, wormwood, sage, wild tulip, thistle, tumbleweed, sunflower
- **Crops:** millet, barley, wheat
- **Livestock:** horse (3), sheep (2), cattle, camel, goat, yak (0.5), dog
- **Lifeways:** Horse Herders 20, Riders 12, Shepherds 12, Hunters 10, Cattle Keepers 8, Ploughmen 8, Felt Makers 6, Smiths 6, Traders 6, Camel Herders 4, Millet Growers 4, Wagon Dwellers 4
- **Sacred:** Eternal Sky, Burial Mounds, Stone Figures, Sacred Fire, High Sky
- **Materials:** Gold, Bronze, Iron, Salt, Felt

#### desert – Desert

| Terrain | Land | Water |
|---|---|---|
| open | Sands, Dunes, Sand Sea, Stony Desert, Gravel Plain, Red Rocks, Dry Valley, Salt Pans, Mesas, Salt Road | – |
| mountains | Black Mountains, Bare Mountains, Canyon, Red Cliffs, Rock Towers | Hidden Spring, Rock Pools |
| coast | Salt Coast, Fog Coast, Bare Shore | Pearl Banks, Shallow Gulf |
| rivers | Palm Groves, Oasis Gardens | Oasis, Wells, Seven Wells, Bitter Springs, Sweet Wells, Wadi, Great River |

- **Wild animals:** oryx, gazelle, jackal, fox, hyena, lion (0.5), wild ass, ibex, hare, desert lynx
- **Birds:** falcon, hawk, ostrich, vulture, sandgrouse, raven, owl, eagle, bustard
- **Creatures:** scorpion, viper, cobra, lizard, locust, scarab
- **Trees:** date palm, acacia, tamarisk, palm, juniper, frankincense tree
- **Plants:** thorn bush, cactus, saltbush, wild melon, desert grass
- **Crops:** dates, barley, millet, melons
- **Livestock:** camel (3), goat (2), sheep, donkey, horse (0.5), hound
- **Lifeways:** Camel Herders 22, Caravaneers 10, Oasis Farmers 10, Goatherds 10, Date Growers 8, Salt Traders 8, Riders 8, Well Diggers 6, Hunters 6, Smiths 6, Traders 6
- **Sacred:** Morning Star, Sacred Rock, Sacred Well, Desert Wind, Star Paths
- **Materials:** Salt, Gold, Incense, Copper, Turquoise

#### savannah – Savannah

| Terrain | Land | Water |
|---|---|---|
| open | Grasslands, Tall Grass, Red Hills, Thornlands, Bushland, Wide Plains, Red Earth, Stone Hills, Termite Hills | – |
| mountains | Plateau, Escarpment, Flat-Top Hills, Granite Domes | Hill Springs |
| coast | White Sands, Palm Shore | Warm Sea, Creek Mouth |
| rivers | – | Great River, Waterhole, Brown River, Dry River, Thundering Falls, Hippo Pools |
| wetland | – | Swamps, Flood Plain, Delta, Papyrus Marsh, Reed Beds |

- **Wild animals:** lion, leopard, cheetah, elephant, buffalo, rhinoceros, giraffe, zebra, antelope, hyena, hippopotamus, wild dog, baboon, warthog
- **Birds:** eagle, vulture, ostrich, crowned crane, hornbill, guineafowl, stork, weaver bird, secretary bird, hawk
- **Creatures:** crocodile, python, cobra, mamba, tortoise, termite, catfish
- **Trees:** baobab, acacia, fig, palm, thorn tree, ebony
- **Plants:** elephant grass, aloe, papyrus, thorn bush, wild gourd
- **Crops:** millet, sorghum, yams, beans, gourds
- **Livestock:** cattle (3), goat (2), sheep, donkey, dog, chicken
- **Lifeways:** Cattle Keepers 22, Millet Growers 12, Hunters 10, Smiths 10, Traders 8, Goatherds 6, Potters 6, Fishers 6, Weavers 6, Iron Smelters 6, Honey Gatherers 4, Salt Makers 4
- **Sacred:** Rain Hill, Sacred Fig, Great Baobab, Thunder, Ancestor Stones
- **Materials:** Iron, Copper, Ivory, Salt, Ochre, Gold, Beads

#### rainforest – Tropical rainforest

| Terrain | Land | Water |
|---|---|---|
| open | Deep Forest, Great Forest, Green Hills, Canopy, Forest Edge, Clearings, Vine Forest | – |
| mountains | Cloud Forest, Mist Mountains, Green Peaks, Waterfall Hills | Waterfalls |
| coast | Mangrove Coast, Black Sands | Warm Sea, Muddy Shallows |
| rivers | Sandbanks | Black River, Brown River, Great River, Floodwater, Rapids, Oxbow Lake, Hundred Streams, Green River |
| wetland | – | Mangroves, Swamp Forest, Flooded Forest, Sago Swamp |

- **Wild animals:** monkey, ape (0.5), leopard, tapir, forest elephant, wild pig, bat, otter, mouse-deer, porcupine
- **Birds:** parrot, hornbill, harpy eagle, kingfisher, heron, owl, bird of paradise, pigeon
- **Creatures:** crocodile, python, tree frog, butterfly, river turtle, catfish, monitor lizard, beetle
- **Trees:** banyan, fig, mahogany, kapok, ironwood, palm, rubber tree, tree fern
- **Plants:** liana, orchid, fern, rattan, pitcher plant, moss
- **Crops:** cassava, yams, bananas, taro, rice, sago
- **Livestock:** pig (2), chicken, dog
- **Lifeways:** River Fishers 16, Hunters 14, Forest Gardeners 12, Traders 8, Gatherers 6, Blowpipe Hunters 6, Boatwrights 6, Sago Makers 6, Rattan Weavers 6, Honey Gatherers 4, Potters 4, Bark-Cloth Makers 4, Bird Catchers 4, Resin Gatherers 4
- **Sacred:** Great Tree, Sacred Pool, Thunder, Rain, Old Forest
- **Materials:** Gold, Feathers, Resin, Bark Cloth, Rubber

#### monsoon – Monsoon lands

| Terrain | Land | Water |
|---|---|---|
| open | River Plain, Paddies, Bamboo Forest, Teak Forest, Terraces, Jungle, Green Plain, Red Hills | – |
| mountains | Blue Hills, Snow Mountains, Cloud Hills, Rock Heights | Mountain Torrent |
| coast | Palm Coast, Spice Coast | Warm Sea, Pearl Banks |
| rivers | Sandbanks | Great River, Delta, Floodwater, Lotus Pools, Seven Rivers, Tanks |
| wetland | – | Mangroves, Floodplain, Lotus Marsh |

- **Wild animals:** tiger, elephant, leopard, monkey, rhinoceros, water buffalo, deer, boar, bear, mongoose, wild dog
- **Birds:** peacock, crane, kingfisher, parrot, myna, vulture, kite, hornbill, heron, egret
- **Creatures:** cobra, python, crocodile, carp, river dolphin, turtle, frog, firefly
- **Trees:** banyan, sacred fig, teak, mango, bamboo, palm, sandalwood, mulberry
- **Plants:** lotus, jasmine, reed, rattan, water lily
- **Crops:** rice (3), millet, sugar cane, cotton, pepper, lentils
- **Livestock:** water buffalo (2), cattle (2), elephant, goat, chicken, pig, dog
- **Lifeways:** Rice Growers 22, Fishers 10, Traders 10, Buffalo Herders 8, Weavers 8, Potters 6, Smiths 6, Spice Growers 6, Silk Weavers 6, Boatmen 6, Elephant Keepers 4, Salt Makers 4, Cotton Growers 4
- **Sacred:** Sacred River, Monsoon Rains, Sacred Fire, Lotus Pool, Serpent Shrine
- **Materials:** Silk, Spices, Pearls, Indigo, Rubies, Salt

#### tropical-islands – Tropical islands

| Terrain | Land | Water |
|---|---|---|
| open | High Valley, Green Valleys, Cloud Valley, Taro Gardens, Breadfruit Groves | – |
| mountains | Fire Mountain, Rain Mountain, Smoking Mountain, Cloud Peak, Sheer Cliffs | Waterfall, Mountain Pools |
| coast | Black Sands, White Sands, Twin Bays, Coral Shore, Blowhole, Sandbar | Reef, Outer Reef, Lagoon, Reef Pass, Long Bay, Deep Ocean |
| rivers | – | Clear Stream, Freshwater Springs |
| wetland | – | Mangroves, Taro Swamp |
| islands | Atoll, Far Isles, Low Isles, Coral Isles | – |

- **Wild animals:** fruit bat, flying fox, wild pig, monitor lizard, rat (0.3)
- **Birds:** frigatebird, heron, owl, tern, albatross, parrot, tropicbird, plover, fruit dove
- **Creatures:** shark, turtle, octopus, whale, eel, manta ray, dolphin, tuna, flying fish, crab, giant clam, gecko
- **Trees:** coconut palm, breadfruit, pandanus, candlenut, ironwood, banyan, hibiscus, mangrove
- **Plants:** fern, vine, sea grass, ginger, sugar cane
- **Crops:** taro, breadfruit, yams, sweet potato, coconuts, bananas, sugar cane
- **Livestock:** pig (2), dog, chicken
- **Lifeways:** Reef Fishers 18, Voyagers 16, Taro Planters 12, Navigators 8, Boatwrights 8, Net Makers 6, Pearl Divers 6, Breadfruit Growers 6, Traders 6, Shell Gatherers 4, Bark-Cloth Makers 4, Bird Catchers 4, Salt Makers 2
- **Sacred:** Fire Mountain, Sacred Reef, Star Path, Ocean, Rainbow
- **Materials:** Shells, Pearls, Red Feathers, Basalt, Coral, Obsidian

#### highland – High mountains

| Terrain | Land | Water |
|---|---|---|
| open | High Pastures, High Plateau, Cold Heights, Stony Plain, Terraces, High Valley, Hanging Valley | – |
| mountains | Twin Peaks, Snow Peaks, Ice Fields, Glacier, Sky Peaks, Eagle Crags, Fire Mountain (0.5) | Glacier River, Torrent |
| rivers | Gorge | Cold Lake, Snow Springs, High Lake, Hot Springs, Torrent |
| wetland | – | High Marsh, Salt Lake |

- **Wild animals:** snow leopard, puma, bear, wild yak, ibex, wild sheep, wolf, marmot, vicuna
- **Birds:** condor, eagle, bearded vulture, falcon, raven, chough, pheasant, snowcock
- **Creatures:** trout, toad, frog, lizard, butterfly, beetle
- **Trees:** juniper, pine, rhododendron, monkey-puzzle, cedar, birch
- **Plants:** moss, lichen, edelweiss, gentian, bunch grass, wild potato
- **Crops:** potatoes, barley, maize, quinoa, beans
- **Livestock:** llama (2), yak (2), alpaca, goat, sheep, horse (0.5), dog, mule (0.5)
- **Lifeways:** Terrace Farmers 14, Llama Herders 12, Yak Herders 12, Shepherds 10, Weavers 10, Potato Growers 8, Traders 8, Miners 6, Salt Traders 6, Hunters 6, Smiths 4, Porters 4
- **Sacred:** Holy Mountain, Origin Lake, Ancestor Cave, Cairns, Sun
- **Materials:** Silver, Gold, Copper, Salt, Turquoise, Wool, Obsidian

### 3.6 Word weights and plurals

- Universal terrain words weigh **1**, biome words **2**, tradition homeland flavour words **3** (§3.7), before any bracketed weight is applied.
- Words are stored lowercase where they are common nouns (fauna, flora, crops, livestock) and title case where they are features (land, water, sacred, materials, lifeways). Capitalise for output using the rules in §14.2.
- **Plurals** follow ordinary English rules (`-s`, `-es`, `-y` → `-ies`). Store these exceptions in `biomes.json` under `irregularPlurals`: deer → deer, sheep → sheep, salmon → salmon, trout → trout, char → char, pike → pike, carp → carp, tuna → tuna, catfish → catfish, flying fish → flying fish, bison → bison, buffalo → buffalo, water buffalo → water buffalo, elk → elk, reindeer → reindeer, musk ox → musk oxen, ox → oxen, wolf → wolves, wolverine → wolverines, goose → geese, mouse-deer → mouse-deer, cattle → cattle, grass → grasses, fish → fish, sturgeon → sturgeon, swine → swine, cactus → cacti, papyrus → papyrus, lotus → lotuses, fungus → fungi, leaf → leaves, wild ass → wild asses, ibex → ibex, snowcock → snowcocks, giant clam → giant clams, oryx → oryx, vicuna → vicunas, mongoose → mongooses, octopus → octopuses, hippopotamus → hippopotamuses, rhinoceros → rhinoceroses, bird of paradise → birds of paradise.
- Crops and materials are stored as they read in a name (wheat, oats, beans, Flints, Furs) and are not re-pluralised.

### 3.7 Homeland and chosen biomes

There are two biome modes.

**Homeland** (default in tribal names). Each name draws its biome from the tradition's homeland weights (§5.3). The tradition's homeland flavour words are added at weight 3, and its homeland suppressions apply.

**Chosen.** The user picks one biome and every name uses it. Homeland flavour words are **not** used and homeland suppressions are **lifted**. Culture suppressions (§5.4) always apply.

| Suppression kind | Examples | Homeland | Chosen |
|---|---|---|---|
| `homeland` | No horses for Polynesian, Mesoamerican, Andean, Sahul or Pacific Northwest peoples; Horse ×0.6 for North American | Applies | Lifted |
| `culture` | Chariot, Sword, Bow limits; Braves, Spirit, Tomahawk; the South Asian lifeway and caste rule | Applies | Applies |

### 3.8 Gating by terrain

So that chosen biomes never produce nonsense:

| Vocabulary | Allowed only when |
|---|---|
| Sea-axis directions (Inland, Seaward, Windward, Leeward, Mountainward) | coast + islands ≥ 10; otherwise ×0.2 |
| River-axis directions (Upriver, Downriver, Upstream, Downstream) | rivers ≥ 15; otherwise ×0.2 |
| Vessel and voyage theme | coast + rivers + islands ≥ 20; otherwise ×0.2 |
| Counted noun Islands | islands ≥ 5 |
| Counted noun Canoes | coast + rivers ≥ 20 |
| Counted nouns Rivers, Streams, Lakes | rivers ≥ 15 |
| Counted noun Wells | biome `desert` or `steppe` |
| Counted noun Tents | biome `steppe`, `desert` or `boreal` |
| Lifeway word Riders; K phrase "Ride the …"; hostile "Horse Stealers" | livestock includes horse, camel, reindeer, yak or llama at weight ≥ 1 (Horse Stealers needs horse specifically) |
| Hostile "Goat Folk" | livestock includes goat |
| Hostile "Fish-Eaters" | coast + rivers ≥ 15 |
| Hostile "Mud Folk", "Marsh Crawlers" | wetland ≥ 5 |
| Dress "Bear-Cloak" | wild animals include bear |
| Dress "Fur-Cloak" | biome `boreal` or `highland` |
| Dress "Feather-Cloak" | biome `rainforest` or `tropical-islands` |
| Dress "Veiled" | biome `desert` |

The thresholds use the biome's terrain weights after tradition terrain multipliers.

### 3.9 The biome API (`src/biomes.ts`)

```ts
export type BiomeId = "temperate" | "boreal" | "cool-rainforest" | "mediterranean" | "steppe" | "desert"
  | "savannah" | "rainforest" | "monsoon" | "tropical-islands" | "highland";
export type TerrainId = "open" | "mountains" | "coast" | "rivers" | "wetland" | "islands";
export type BiomeList = "wildAnimals" | "birds" | "creatures" | "trees" | "plants" | "crops" | "livestock"
  | "lifeways" | "sacred" | "materials";

export const BIOMES: readonly Biome[];                    // table order
export function findBiome(id: string | undefined): Biome | undefined;
export function biomeWords(biome: Biome, list: BiomeList): [string, number][];  // with weights
export function terrainWords(biome: Biome, kind: "land" | "water", terrain: TerrainId): [string, number][]; // universal ×1 + biome ×2
export function pluralOf(word: string): string;
/** Colonial use (§19.3): a biome list as weighted name-word entries. */
export function biomeEntries(biome: Biome, categoryId: string): [NameWordEntry, number][] | undefined;
```

`biomeEntries` maps colonial slot ids to lists: `bird` → birds, `wild-animal` → wildAnimals, `fish-and-other-creatures` → creatures, `tree` → trees, `wild-plant` → plants; any other id returns `undefined`. Every entry is `{ modern: word, plural: pluralOf(word), forms: [TitleCase(word)], fuses: "no" }`, paired with its weight (1 unless bracketed). Store weights and pick weighted; never duplicate entries to fake a weight.

---

## 4. Tribal names: generation pipeline

Every name is built in this order. Each step filters and re-weights the options open to the next.

```
naming tradition          (patterns, multipliers, homeland biomes)
    ↓
biome                     (homeland draw per name, or the chosen biome)
    ↓
group type                (what kind of group is being named)
    ↓
perspective + tone        (who coined it, and how they felt)
    ↓
semantic theme            (what inspired it)
    ↓
grammatical template      (filtered by group type, theme, perspective and register)
    ↓
vocabulary                (biome words + shared lists, filtered by tradition, tone, register and §3.8)
    ↓
rendering                 (articles, capitals, hyphens, colour rule, length cap)
    ↓
safeguards                (collision lists, banned words)
    ↓
name, in-text form, history and alternatives
```

**Weighting.** Every list has fixed base weights given in this brief. A tradition applies multipliers. After multipliers and filtering, weights are renormalised. A multiplier of ×0 removes an option for that tradition.

**Failure handling.** If a step leaves no valid option, step back one stage and redraw. After 20 failed attempts for one name, fall back to the General tradition with the same group type and the same biome. After 20 more, skip the name (the batch notice says how many were skipped).

**Batches.** Results are unique case-insensitively within a batch, with at most `count × 50` attempts.

---

## 5. Naming traditions

### 5.1 The 17 traditions

| Group | Key | Display name | Draws on |
|---|---|---|---|
| General | `general` | General | Patterns shared by a majority of traditions |
| First release | `celtic` | Celtic Britain & Gaul | Iron Age Britain and Gaul; early Irish kin vocabulary |
| First release | `germanic` | Germanic & Norse | Migration-era Germanic peoples; Scandinavian folk districts |
| First release | `steppe` | Steppe | Scythian, Turkic and Mongol peoples |
| First release | `arabian` | Arabian & Saharan | Bedouin tribes; Amazigh and Tuareg confederations |
| First release | `bantu` | Bantu Africa | Central, eastern and southern Bantu-speaking peoples |
| First release | `northAmerican` | North American Woodlands & Plains | Eastern Woodlands, Great Lakes and Plains nations |
| First release | `polynesian` | Polynesian | Māori, Hawaiian, Samoan and Tongan societies |
| First release | `eastAsian` | East Asian | Chinese, Japanese and Korean clans; frontier peoples seen from the centre |
| Second release | `mesoamerican` | Mesoamerican | Nahua, Mixtec, Zapotec and Maya city-states |
| Second release | `andean` | Andean & Southern Cone | Andean kin communities; Mapuche and neighbours |
| Second release | `maritimeSEA` | Maritime South-East Asian | Malay world, Borneo, Philippines |
| Second release | `mediterranean` | Ancient Mediterranean | Italic peoples and Greek communities |
| Expansion | `northernPacific` | Pacific Northwest & Arctic | Northwest Coast houses and moieties; Arctic peoples |
| Expansion | `westAfrican` | West African | Mande, Akan, Yoruba and Sahelian societies |
| Expansion | `southAsian` | South Asian | Vedic peoples; dynastic lineages |
| Expansion | `sahul` | Australia & New Guinea | Aboriginal Australian and New Guinea communities |

The "Draws on" text is the tradition's tooltip in the generate view.

### 5.2 Profile fields

| Field | Meaning |
|---|---|
| `homeland` | Biome weights (sum 100) used in Homeland mode |
| `terrainMultipliers` | Applied to every biome's terrain weights, in both modes |
| `flavour` | Homeland-only words at weight 3: `animals`, `plants`, `land`, `water`, `lifeways` (lifeways at weight 10 each) |
| `favouredLifeways` | ×2 when the biome has them, in both modes |
| `orientation` | Direction systems used (§9.3), with multipliers |
| `lineage` | Percentages for patrilineal, matrilineal and bilateral draws |
| `signatureCollectives` | ×2 for this tradition |
| `themes`, `templates`, `groupTypes` | Multipliers |
| `numbers` | Preferred numbers (×3; others ×0.3) |
| `suppress` | Words or options with a multiplier and a kind (`homeland` or `culture`, §3.7) |
| `special` | Anything else, described in the profile |

Samples in each profile are illustrative: results the profile should be able to produce, not test fixtures.

**Lineage** decides the lineage collective: a patrilineal draw allows Sons; a matrilineal draw allows Daughters; a bilateral draw uses Children or Descendants. Children and Descendants are allowed in every draw.

### 5.3 Profiles

#### General (`general`)

- **Homeland:** temperate 10, boreal 8, cool-rainforest 8, mediterranean 9, steppe 10, desert 9, savannah 10, rainforest 10, monsoon 9, tropical-islands 9, highland 8.
- **Terrain multipliers:** none. **Flavour:** none. **Favoured lifeways:** none.
- **Orientation:** compass; relative (upper/lower, inner/outer); sea-axis.
- **Lineage:** bilateral 100.
- **Signature collectives:** Folk, People, Kin, Children.
- **Themes:** relationship to centre ×1.5; number ×1.2.
- **Numbers:** Three, Five, Seven, Nine.
- **Samples:** The True People · Northern Valley Folk · Children of the Bear · Three Peoples of the Hills · Strange-Speech Folk

#### Celtic Britain & Gaul (`celtic`) – first release

- **Homeland:** temperate 100.
- **Terrain multipliers:** mountains ×0.6, coast ×1.2.
- **Flavour:** animals Hound, Boar, Salmon, Raven, Bull, Horse; plants Oak, Yew, Rowan, Mistletoe; land Chalkland, Downs, Moor; lifeways Horse Breeders, Cattle Keepers.
- **Favoured lifeways:** Cattle Keepers, Horse Breeders, Smiths, Ploughmen.
- **Orientation:** compass; relative.
- **Lineage:** patrilineal 90, bilateral 10.
- **Signature collectives:** Folk, People, Kindred, Descendants, Seed, Portion, Host.
- **Themes:** landscape ×1.4, warfare ×1.3, qualities ×1.5, animals ×1.2, vessel ×0.3.
- **Templates:** O ×1.5, A ×1.3.
- **Group types:** confederation ×1.3, war-band ×1.2, dynasty ×1.2.
- **Numbers:** Three, Seven.
- **Reference patterns** (never output): Brigantes "the high ones", Catuvellauni "battle masters", Atrebates "settlers", Durotriges "fort dwellers", Epidii "horse people", Cornovii "horn people", Ordovices "hammer fighters"; early Irish Descendants (*Uí*), Kindred (*Cenél*), Seed (*Síol*), Portion (*Dál*).
- **Samples:** The High Ones · Fort Dwellers of the Chalk · Horse Folk of the Western Headland · Seed of the Red Hound · Portion of the Grey King

#### Germanic & Norse (`germanic`) – first release

- **Homeland:** temperate 65, boreal 35.
- **Terrain multipliers:** coast ×1.3, islands ×1.3.
- **Flavour:** animals Wolf, Raven, Boar, Bear, Stag, Eagle; plants Ash, Yew, Oak, Birch; land Heath; water Fjord, Long Inlet; lifeways Seafarers, Boatwrights.
- **Favoured lifeways:** Cattle Keepers, Ploughmen, Boatwrights, Smiths.
- **Orientation:** compass; relative; sea-axis (Inland, Seaward only).
- **Lineage:** patrilineal 90, bilateral 10.
- **Signature collectives:** Folk, Men, Kin, Host, Sons.
- **Themes:** warfare ×1.5, dress ×2, relationship to centre ×1.5, vessel ×1.5, sacred ×0.8.
- **Templates:** A ×1.3, L ×1.2.
- **Group types:** war-band ×1.5, migrant ×1.3, confederation ×1.2.
- **Numbers:** Two, Three, Nine, Twelve.
- **Special:** Longship is available in the vessel theme.
- **Reference patterns:** Saxons (from a knife), Franks (a javelin, or "the bold"), Alamanni "all men", Marcomanni "border men", Langobardi "long beards", Suebi "our own people".
- **Samples:** March Men of the Heath · Long-Shield Folk · Sons of the Grey Wolf · Knife Folk · Fjord Men of the Outer Isles

#### Steppe (`steppe`) – first release

- **Homeland:** steppe 80, desert 10, highland 10.
- **Terrain multipliers:** rivers ×1.2, coast ×0, islands ×0.
- **Flavour:** animals Horse, Wolf, Eagle, Falcon, Snow Leopard, Ram, Camel, Deer; plants Feather Grass, Wormwood; land Black Earth, Salt Flats; water Salt Lakes; lifeways Horse Herders, Felt Makers.
- **Favoured lifeways:** Horse Herders, Riders, Ploughmen, Felt Makers.
- **Orientation:** colour-direction ×2; moiety-axis (Left-Hand, Right-Hand); compass.
- **Lineage:** patrilineal 100. Bone is the lineage collective: White Bone marks nobility, Black Bone commoners.
- **Signature collectives:** Host, Horde, Arrows, Tents, Bone, Riders.
- **Themes:** number ×3, lifeway ×2, dress ×1.3, water ×0.7, plants ×0.4, vessel ×0 (culture).
- **Templates:** J ×3, F ×1.5, A ×1.2.
- **Group types:** confederation ×2, moiety ×2, war-band ×1.5, settlement ×0.4.
- **Numbers:** Nine, Ten, Twelve, Thirty, Hundred.
- **Special:** colours may modify Host, Horde, Tents, Arrows and Bone directly (§14.6).
- **Reference patterns:** the Western Turkic "Ten Arrows" and "Nine Tribes"; the "Blue" (celestial) Turks; Golden, White and Blue Hordes; colour as direction; Herodotus's Royal and Ploughman Scythians; Mongol left-hand and right-hand wings; Kazakh white bone and black bone.
- **Samples:** Twelve Arrows · Blue Host of the Eastern Grass · White Bone of the Golden Tent · Left-Hand Riders · Nine Peoples of the Salt Lakes · Ploughmen of the River

#### Arabian & Saharan (`arabian`) – first release

- **Homeland:** desert 80, mediterranean 10, highland 5, steppe 5.
- **Terrain multipliers:** rivers ×1.3, coast ×0.8.
- **Flavour:** animals Camel, Lion, Oryx, Gazelle, Falcon, Mare, Hound; plants Date Palm, Acacia; water Wells, Oasis, Seven Wells; lifeways Camel Herders, Caravaneers.
- **Favoured lifeways:** Camel Herders, Caravaneers, Oasis Farmers, Riders.
- **Orientation:** sunrise/sunset ×2 (east = Sunrise, west = Sunset); compass.
- **Lineage:** patrilineal 100.
- **Signature collectives:** Sons, House, Family, People, Riders, Tents.
- **Themes:** ancestor ×2.5, water ×1.3, animals ×1.3, qualities ×1.3, landscape ×1.2, plants ×0.6, vessel ×0.2.
- **Templates:** G ×2.5, N ×2, C ×1.3.
- **Group types:** kin ×2, dynasty ×1.3, confederation ×1.2, settlement ×0.7.
- **Numbers:** Three, Seven.
- **Reference patterns:** tribes named as the sons of an ancestor, including animal names ("sons of the lion", "sons of the dog"); Tuareg confederations named "people of" a mountain or region; the Amazigh self-name glossed "free people"; the Maghreb as "the place of sunset".
- **Samples:** Sons of the Grey Mare · People of the Black Mountain · House of the Seven Wells · Free People of the Sunset Sands · Riders of the Salt Road

#### Bantu Africa (`bantu`) – first release

- **Homeland:** savannah 70, rainforest 15, highland 15.
- **Terrain multipliers:** rivers ×1.2, wetland ×1.2.
- **Flavour:** animals Lion, Leopard, Elephant, Buffalo, Crocodile, Python, Eagle, Bull, Crane; plants Fig Tree, Baobab, Millet; land Red Hills; lifeways Cattle Keepers, Iron Smelters.
- **Favoured lifeways:** Cattle Keepers, Millet Growers, Iron Smelters, Smiths.
- **Orientation:** compass; sunrise/sunset; relative (Upland, Lowland).
- **Lineage:** patrilineal 70, matrilineal 30.
- **Signature collectives:** People, Children, House, Followers.
- **Themes:** ancestor ×2, lifeway ×1.6, plants ×1.6, speech ×1.5, sacred ×1.2, vessel ×0.3.
- **Templates:** N ×2, G ×1.5, M ×1.5, B ×1.2.
- **Group types:** dynasty ×1.5, kin ×1.3, confederation ×1.2.
- **Numbers:** Two, Three, Four.
- **Reference patterns:** "Bantu" itself means "people"; nations named after a founding king; a royal founder's name meaning "heaven" or "sky"; Kikuyu glossed "people of the great fig tree"; Maasai as "speakers of Maa".
- **Samples:** Children of the Sky · Fig Tree People · Followers of the Iron King · Cattle Kin of the Red Hills · Speakers of the River Tongue

#### North American Woodlands & Plains (`northAmerican`) – first release

- **Homeland:** temperate 65, steppe 25, boreal 10.
- **Terrain multipliers:** rivers ×1.3, wetland ×1.2.
- **Flavour:** animals Turtle, Beaver, Bison, Elk, Snipe, Bear, Wolf, Heron, Hawk, Deer; plants Maize, Wild Rice, Pine, Cedar, Elm; land Prairie; water Long Lake, Wild Rice Lakes; lifeways Maize Growers, Bison Hunters, Wild Rice Gatherers.
- **Favoured lifeways:** Hunters, Fishers, Maize Growers.
- **Orientation:** compass; sunrise/sunset.
- **Lineage:** matrilineal 60, patrilineal 40.
- **Signature collectives:** People, Nation, Clan, Fires, Allies.
- **Themes:** relationship to centre ×2, number ×1.8, animals ×1.5, speech ×1.5, dress ×1.3, landscape ×1.2, plants ×1.2, vessel ×0.4.
- **Templates:** O ×2, C ×1.5, J ×1.5, M ×1.5.
- **Group types:** confederation ×1.5, kin ×1.3, moiety ×1.2, dynasty ×0.6.
- **Numbers:** Three, Five, Six, Seven.
- **Suppress:** culture ×0: Braves, Chiefs (as a collective), Spirit, Feather, Tomahawk. Homeland ×0.6: Horse.
- **Special:** "Painted-Moccasin" is available in the dress theme. The regional emblem animal interpretation is relabelled "clan animal" and weighted ×1.5 (§15.4).
- **Reference patterns:** many self-names glossed "the people" or "the real people"; the Haudenosaunee as "people of the longhouse", with nations named for a standing stone, flint, a great hill or a great swamp; the "Seven Council Fires"; Lakota and Dakota glossed "allies"; outsiders naming peoples for dyed moccasins or unfamiliar speech; turtle, bear and wolf clans.
- **Samples:** The True People of the Lakes · Five Fires of the Pine Country · Turtle Clan of the Long Lake · People of the Red Bluffs · Strange-Speech People · Allies of the Upper River

#### Polynesian (`polynesian`) – first release

- **Homeland:** tropical-islands 80, cool-rainforest 20.
- **Terrain multipliers:** coast ×1.5, islands ×1.5, mountains ×1.2.
- **Flavour:** animals Shark, Turtle, Octopus, Whale, Frigatebird, Heron, Owl, Lizard, Kiwi; plants Breadfruit, Coconut Palm, Pandanus, Taro, Flax, Tree Fern; water Lagoon, Reef; lifeways Voyagers, Navigators, Taro Planters.
- **Favoured lifeways:** Voyagers, Navigators, Reef Fishers, Taro Planters.
- **Orientation:** sea-axis ×2 (Windward, Leeward, Inland, Seaward, Mountainward); relative.
- **Lineage:** bilateral 100; Sons of and Daughters of ×0.3.
- **Signature collectives:** Descendants, Children, People, Family, Kin.
- **Themes:** ancestor ×3, vessel ×3, sacred ×1.3, water ×1.3, plants ×1.3, warfare ×0.8, number ×0.6.
- **Templates:** G ×2.5, C ×2, N ×1.5, E ×1.3.
- **Group types:** kin ×2, dynasty ×1.5, migrant ×1.5, frontier ×0.4.
- **Numbers:** Two, Three.
- **Suppress:** homeland ×0: Horse. Culture: Chariot ×0, Sword ×0, Bow ×0.3.
- **Reference patterns:** Māori tribal names as "descendants of" an ancestor; peoples identified by the founding canoe (one canoe named after a shark); a people nicknamed "children of the mist"; mountainward and seaward as the main axis (Hawaiian); extended families under titled chiefs (Samoa).
- **Samples:** Descendants of the Far Navigator · People of the White Heron Canoe · Windward Kin of the Reef · Children of the Rain Mountain · Seaward Family of the Twin Bays

#### East Asian (`eastAsian`) – first release

- **Homeland:** temperate 50, monsoon 35, steppe 10, highland 5.
- **Terrain multipliers:** rivers ×1.3, wetland ×1.3, mountains ×1.2.
- **Flavour:** animals Tiger, Crane, Carp, Ox, Magpie, Horse, Falcon, Bear; plants Plum, Pine, Bamboo, Mulberry, Lotus; lifeways Rice Growers, Silk Weavers, Ritualists.
- **Favoured lifeways:** Rice Growers, Weavers, Silk Weavers, Ritualists, Smiths.
- **Orientation:** compass with a centre ×2 (Central Plain, Middle Kingdom-style "Central"); relative.
- **Lineage:** patrilineal 100.
- **Signature collectives:** House, Clan, Line, Guild, Folk.
- **Themes:** lifeway ×2.5, direction ×2, plants ×1.5, ancestor ×1.3, number ×1.3.
- **Templates:** P ×4, L ×2, E ×1.5, J ×1.3.
- **Group types:** occupational ×3, dynasty ×1.5, kin ×1.5, regional ×0.8.
- **Numbers:** Five, Hundred.
- **Special:** Dragon (legendary register) ×2.
- **Reference patterns:** prestige lineages tied to a home district; surnames with translatable meanings (plum, forest, horse, white); directional names for peoples beyond the frontier; the "Hundred Yue"; Japanese clans named for a hereditary office (weapon-keepers, ritualists, weavers); southern Kyushu peoples recorded as "falcon people" and "bear raiders"; Korean clans known by their ancestral seat.
- **Samples:** Plum House of the Western Ridge · Weavers' Clan of the River Plain · Hundred Peoples of the South · Falcon Folk of the Southern Capes · Eastern Bowmen

#### Mesoamerican (`mesoamerican`) – second release

- **Homeland:** highland 40, rainforest 40, desert 10, savannah 10.
- **Terrain multipliers:** wetland ×1.5, mountains ×1.3.
- **Flavour:** animals Jaguar, Eagle, Serpent, Hummingbird, Quetzal, Coyote, Heron, Deer, Monkey; plants Maize, Cacao, Agave, Cotton, Reed; water Reed Lake; lifeways Maize Growers, Featherworkers, Cacao Growers.
- **Favoured lifeways:** Featherworkers, Traders, Maize Growers.
- **Orientation:** four directions plus centre; sunrise/sunset.
- **Lineage:** patrilineal 60, bilateral 40.
- **Signature collectives:** People, House, Lords, Warriors, Great House.
- **Themes:** sacred ×2, lifeway ×1.5, animals ×1.5, plants ×1.3, number ×1.2.
- **Templates:** Q ×4, I ×1.5, F ×1.3, R ×1.3.
- **Group types:** dynasty ×1.5, war-band ×1.5, settlement ×1.5, occupational ×1.3.
- **Numbers:** Four, Seven, Thirteen.
- **Suppress:** homeland ×0: Horse. Culture ×0: Chariot, Sword (Obsidian Blade is used instead).
- **Special:** in the legendary register a city-state may render as "Water-Hill": "Lords of the Water-Hill of Flints" (probability 0.3 when template is Q or C and group type is settlement or dynasty).
- **Reference patterns:** the Mixtec self-name glossed "people of the rain" and the Zapotec "cloud people"; origin places named "place of herons" and "place of reeds"; Toltec coming to mean "master craftsmen"; city-states called "water-mountain"; city wards called "big house"; jaguar and eagle warrior orders.
- **Samples:** People of the Place of Flints · Cloud Lords of the Eastern Mountains · House of the Hummingbird · Masters of Feathers · Rain Folk of the Lake

#### Andean & Southern Cone (`andean`) – second release

- **Homeland:** highland 60, desert 15, cool-rainforest 10, mediterranean 10, steppe 5.
- **Terrain multipliers:** mountains ×1.3, rivers ×1.2.
- **Flavour:** animals Condor, Puma, Llama, Fox, Vicuna, Hummingbird, Serpent; plants Monkey-Puzzle, Maize, Potato; lifeways Llama Herders, Terrace Farmers.
- **Favoured lifeways:** Llama Herders, Terrace Farmers, Weavers, Potato Growers.
- **Orientation:** moiety-axis ×3 (Upper Half, Lower Half); four quarters; compass with Sea as a direction.
- **Lineage:** bilateral 60, patrilineal 40.
- **Signature collectives:** Kin, People, House, Half, Quarter.
- **Themes:** direction ×2.5, landscape ×1.5, sacred ×1.5, lifeway ×1.4, animals ×1.2, plants ×1.2.
- **Templates:** E ×2, C ×1.5, G ×1.3, K ×1.3.
- **Group types:** moiety ×3, kin ×1.5, confederation ×1.2.
- **Numbers:** Two, Four.
- **Suppress:** homeland ×0: Horse. Culture ×0: Chariot, Sword.
- **Reference patterns:** Andean kin communities holding land in common; societies split into upper and lower halves; an empire named "the four parts together"; descent from origin lakes, caves and springs; Mapuche "people of the land", with neighbours named as people of the north, the south, the east, the sea and the monkey-puzzle tree.
- **Samples:** Upper Kin of the Condor Valley · People of the South Forests · Coast People of the Pine Shore · Children of the Cold Lake · Lower Half of the Twin Peaks · Those Who Came from the Red Cave

#### Maritime South-East Asian (`maritimeSEA`) – second release

- **Homeland:** rainforest 55, tropical-islands 30, monsoon 15.
- **Terrain multipliers:** rivers ×1.5, coast ×1.3, islands ×1.2.
- **Flavour:** animals Hornbill, Crocodile, Tiger, Python, Monkey, Monitor Lizard, Dugong; plants Banyan, Bamboo, Sago Palm, Mangrove, Rattan; lifeways Sea Nomads, Sago Makers, River Traders.
- **Favoured lifeways:** River Fishers, Reef Fishers, Traders, Sago Makers.
- **Orientation:** river-axis ×2; sea-axis.
- **Lineage:** bilateral 100.
- **Signature collectives:** People, Folk, House, Kin.
- **Themes:** water ×2, direction ×2, lifeway ×1.6, relationship to centre ×1.5, vessel ×1.5, animals ×1.2.
- **Templates:** B ×2, E ×1.5, L ×1.3.
- **Group types:** regional ×1.3, settlement ×1.3, migrant ×1.3.
- **Numbers:** Two, Three, Seven.
- **Special:** House means a longhouse community; in histories write "longhouse".
- **Reference patterns:** Malay names of the form "people of" a feature (sea, upriver, hill, original); upstream and downstream as the governing axis; inland peoples named collectively by coastal neighbours; longhouse communities.
- **Samples:** Upriver People of the Black River · Sea Folk of the Outer Straits · Longhouse Kin of the Hornbill · Mangrove People · Hill People of the Inner Ranges

#### Ancient Mediterranean (`mediterranean`) – second release

- **Homeland:** mediterranean 90, temperate 10.
- **Terrain multipliers:** coast ×1.3, islands ×1.3, mountains ×1.2.
- **Flavour:** animals Woodpecker, Wolf, Bull, Ram, Heron, Dolphin, Owl, Eagle, Boar; plants Olive, Laurel, Cypress, Vine, Oak; lifeways Seafarers, Vine Growers.
- **Favoured lifeways:** Shepherds, Seafarers, Olive Growers, Vine Growers.
- **Orientation:** compass; relative; centre-relative ("Around").
- **Lineage:** patrilineal 100.
- **Signature collectives:** People, Dwellers, Settlers, Followers, Sons.
- **Themes:** relationship to centre ×2, animals ×1.3, sacred ×1.3, vessel ×1.3, lifeway ×1.2.
- **Templates:** R ×4, D ×1.3, H ×1.3, C ×1.2.
- **Group types:** migrant ×2, settlement ×1.3, confederation ×1.2.
- **Numbers:** Three, Four, Twelve.
- **Special:** migration guide interpretation at 30 for template R (§15.4).
- **Reference patterns:** Italic "sacred spring" migrations led by an animal (woodpecker, wolf, bull) whose name the migrants took; Greek "dwellers around" for free non-citizens; colonies named "new city".
- **Samples:** Followers of the Heron · Dwellers Around the Lake · Hill Folk of the Old Spring · Settlers of the New City · Sons of the White Ram

#### Pacific Northwest & Arctic (`northernPacific`) – expansion

- **Homeland:** cool-rainforest 60, boreal 40.
- **Terrain multipliers:** coast ×1.5, rivers ×1.3.
- **Flavour:** animals Raven, Eagle, Wolf, Bear, Killer Whale, Salmon, Beaver, Frog, Seal; plants Cedar, Spruce; lifeways Salmon Fishers, Cedar Carvers, Whalers.
- **Favoured lifeways:** Salmon Fishers, Cedar Carvers, Whalers, Sealers.
- **Orientation:** river-axis; sea-axis.
- **Lineage:** matrilineal 70, bilateral 30.
- **Signature collectives:** House, Side, Clan, People.
- **Themes:** animals ×2, vessel ×1.5, water ×1.5, lifeway ×1.5, relationship to centre ×1.5, plants ×0.8.
- **Templates:** G ×1.5, F ×1.5, O ×1.3.
- **Group types:** moiety ×3, kin ×1.5, dynasty ×1.2, war-band ×0.6.
- **Numbers:** Two, Four.
- **Suppress:** homeland ×0: Horse. Culture ×0: Chariot.
- **Special:** ancestor animal interpretation ×2.
- **Reference patterns:** societies split into two halves named for Raven and Eagle (or Wolf); named houses with inherited crests; prestige coppers; Arctic self-names glossed "the people".
- **Samples:** Raven Side · Killer Whale House of the Long Inlet · People of the Ice Edge · Salmon Clan of the River Mouth · House of the Copper Shield

#### West African (`westAfrican`) – expansion

- **Homeland:** savannah 50, rainforest 35, desert 15.
- **Terrain multipliers:** rivers ×1.3.
- **Flavour:** animals Python, Leopard, Crocodile, Elephant, Lion, Hornbill, Spider, Tortoise, Buffalo; plants Kola Tree, Baobab, Oil Palm, Silk-Cotton Tree; lifeways Traders, Smiths, Hunters.
- **Favoured lifeways:** Traders, Smiths, Hunters, Millet Growers.
- **Orientation:** compass; river-axis.
- **Lineage:** patrilineal 60, matrilineal 40.
- **Signature collectives:** People, House, Line, Children.
- **Themes:** ancestor ×2, animals ×1.5, water ×1.3, plants ×1.2, sacred ×1.2.
- **Templates:** K ×2, N ×1.5, G ×1.5, C ×1.3.
- **Group types:** dynasty ×1.5, kin ×1.5, settlement ×1.3.
- **Special:** clan taboo interpretation ×4 (§15.4).
- **Reference patterns:** clans with an animal they must not harm or eat; founders who were hunters; matrilineal clans (Akan); kingdoms centred on a founding town.
- **Samples:** Those Who Spare the Python · Leopard Line of the Forest Edge · House of the Hunter's Son · People of the Iron Hill · Children of the Great River

#### South Asian (`southAsian`) – expansion

- **Homeland:** monsoon 65, highland 15, desert 10, rainforest 10.
- **Terrain multipliers:** rivers ×1.5.
- **Flavour:** animals Tiger, Elephant, Peacock, Cobra, Bull, Horse, Deer, Crane; plants Lotus, Banyan, Sacred Fig, Mango, Sandalwood; water Seven Rivers. No lifeway flavour.
- **Favoured lifeways:** none.
- **Orientation:** compass.
- **Lineage:** patrilineal 100.
- **Signature collectives:** Line, House, Peoples, Kin.
- **Themes:** sacred ×2.5 (Sun, Moon and Fire as lineage sources), number ×1.8, water ×1.5, ancestor ×1.5, landscape ×1.2, lifeway ×0 (culture).
- **Templates:** G ×2, J ×1.8, C ×1.3.
- **Group types:** dynasty ×2, confederation ×1.3, occupational ×0 (culture).
- **Numbers:** Five, Seven, Ten.
- **Special:** see §17.5. Nothing may read as a caste or hereditary-status name, in any biome.
- **Reference patterns:** the Vedic "five peoples"; a region called "land of seven rivers"; dynasties claiming descent from the Sun, the Moon or fire.
- **Samples:** Sun Line of the Western Hills · Fire-Born House · Five Peoples of the Plain · Moon Kin of the River Fork · People of the Seven Streams

#### Australia & New Guinea (`sahul`) – expansion

- **Homeland:** desert 40, savannah 30, rainforest 15, highland 10, tropical-islands 5.
- **Terrain multipliers:** coast ×1.3, rivers ×1.3.
- **Flavour:** animals Kangaroo, Emu, Crocodile, Dingo, Eagle, Goanna, Barramundi, Cassowary, Bird of Paradise, Pig; plants Gum Tree, Spinifex, Wattle, Pandanus, Sago Palm; water Billabong, Saltwater, Freshwater; lifeways Foragers, Gardeners, Pig Keepers.
- **Favoured lifeways:** Hunters, Fishers, Gardeners.
- **Orientation:** compass; sea-axis; water-type (Saltwater, Freshwater).
- **Lineage:** patrilineal 50, matrilineal 30, bilateral 20.
- **Signature collectives:** People, Clan, Kin.
- **Themes:** water ×2.5, landscape ×2, speech ×1.5, relationship to centre ×1.2, sacred ×0.5, warfare ×0.5, number ×0.5.
- **Templates:** B ×2.5, M ×1.5, C ×1.3.
- **Group types:** regional ×1.5, moiety ×1.5, kin ×1.3, war-band ×0.5, dynasty ×0.2.
- **Suppress:** homeland ×0: Horse. Culture ×0: Chariot, Sword, Bow. Culture: sacred vocabulary limited to Sun, Moon, Rain and Springs in every biome (§17.2).
- **Reference patterns:** identity tied to country and water (saltwater and freshwater peoples); groups named for a distinctive word in their language; moiety divisions; New Guinea highland clans centred on gardens and pig exchange.
- **Samples:** Saltwater Clan of the Long Bay · Stone Country People · Freshwater Kin of the Red River · People of the Two Valleys · Garden Clan of the High Valley

### 5.4 Suppression summary

| Tradition | Homeland suppressions (lifted in a chosen biome) | Culture suppressions (always) |
|---|---|---|
| northAmerican | Horse ×0.6 | Braves, Chiefs (collective), Spirit, Feather, Tomahawk ×0 |
| polynesian | Horse ×0 | Chariot ×0, Sword ×0, Bow ×0.3 |
| mesoamerican | Horse ×0 | Chariot ×0, Sword ×0 |
| andean | Horse ×0 | Chariot ×0, Sword ×0 |
| northernPacific | Horse ×0 | Chariot ×0 |
| sahul | Horse ×0 | Chariot ×0, Sword ×0, Bow ×0; sacred limited |
| steppe | – | vessel theme ×0 |
| southAsian | – | lifeway theme ×0, occupational group ×0 |

"Horse" covers Horse, Mare, Horse Breeders, Horse Herders, Horse Stealers, Riders (when mounted on horses), Wild Horse and the K phrase "Ride the …" when the only mount is a horse.

---

## 6. Group types

### 6.1 Base weights

| Group type | Key | Base % |
|---|---|--:|
| Regional people | `regional` | 22 |
| Local settlement community | `settlement` | 12 |
| Kin group or lineage | `kin` | 14 |
| Ruling dynasty | `dynasty` | 9 |
| Confederation | `confederation` | 10 |
| War-band or warrior society | `warband` | 9 |
| Migrant or settler community | `migrant` | 6 |
| Frontier guardians | `frontier` | 5 |
| Religious or sanctuary community | `sanctuary` | 5 |
| Moiety or clan division | `moiety` | 4 |
| Occupational or craft community | `occupational` | 4 |
| **Total** | | **100** |

### 6.2 Descriptions and collectives

| Group type | Collectives | Examples |
|---|---|---|
| Regional | Folk, People, Dwellers, Inhabitants, Nation (administrative or later perspective only) | High Folk; Fen Dwellers; People of the Lower Valley |
| Settlement | Settlers, Dwellers, Folk, People, Inhabitants, Great House (mesoamerican) | Blackwater Settlers; Dwellers by the Eastern Ford |
| Kin | Kin, Kindred, Children, Descendants, Sons, Daughters, House, Line, Seed, Portion, Bone, Clan, Family | Bear Kin; Seed of the Red Hound; Descendants of the Far Navigator |
| Dynasty | House, Line, Descendants, Lords, Masters, Heirs (Lords and Masters ×2 here, ×0.5 elsewhere) | House of the Red Spear; Sun Line of the Western Hills |
| Confederation | Peoples, Folk, Allied Houses, United Kindreds, Fires, Arrows, Tribes (administrative/later only), Confederacy (administrative only) | Peoples of the Three Rivers; Five Fires of the Pine Country |
| War-band | Warriors, Spears, Shields, Host, Horde (steppe only), Guard, Defenders, Masters, Companions, Riders | Battle Masters; Red Spears; Companions of the White Horse |
| Migrant | Settlers (×3 against Newcomers and Arrivals), Newcomers, Arrivals, Wanderers, Exiles, Followers | Western Settlers; Followers of the Heron |
| Frontier | Guardians, Defenders, Watchers, Borderers, March Folk, Wardens (×0.5) | Watchers of the Pass; Borderers of the Eastern Fens |
| Sanctuary | Keepers, Guardians, Servants (×0.5), Children, People, Wardens (×0.5); "Holy" ×0.5 against "Sacred" | Keepers of the Sacred Grove; Children of the Great Oak |
| Moiety | Side, Half, Hand, Quarter, Clan | Raven Side; Upper Half of the Twin Peaks; Left-Hand Riders |
| Occupational | Lifeway agent nouns, plus Guild, Clan, Folk. Never framed as inferior status | Weavers' Clan of the River Plain; Salt-Maker Folk |

### 6.3 Perspective multipliers by group type

| Group type | Multiplier |
|---|---|
| Dynasty | dynastic ×2.5 |
| War-band | ceremonial ×2 |
| Sanctuary | ceremonial ×2 |
| Migrant | neighbour ×2, imposed ×1.5 |
| Frontier | geographical ×1.5, imposed ×1.5 |
| Occupational | later ×2 |

---

## 7. Perspectives and tone

### 7.1 Perspective base weights

| Perspective | Key | Base % | What it is |
|---|---|--:|---|
| Self-name | `self` | 38 | Proud or neutral; "The People", "Valley Folk" and "Old Settlers" are as typical as "Battle Masters" |
| Neighbour-name | `neighbour` | 27 | Location, landscape, direction, appearance, customs, weapons, speech, reputation or an emblem; has a tone |
| Geographical | `geographical` | 10 | A river, hill, forest, ford, coast or territory |
| Dynastic or ancestral | `dynastic` | 10 | A founder, ruling house, animal ancestor or legendary figure |
| Ceremonial title | `ceremonial` | 5 | Elevated and non-literal |
| Later or administrative | `later` | 5 | A chronicler's, map-maker's or official's label; plain, territorial, often grouping several communities |
| Imposed | `imposed` | 5 | A dominant power's administrative or dismissive label |
| **Total** | | **100** | |

### 7.2 Tone (neighbour and imposed names only)

| Tone | Base % | Notes |
|---|--:|---|
| Respectful | 25 | Admiring or wary: Swift Riders, Strong Folk |
| Neutral | 60 | Descriptive: Marsh Dwellers, Northern Folk |
| Hostile | 15 | Only when the hostile toggle is on. When off, a hostile draw becomes neutral |

Self, geographical, dynastic, ceremonial and later names are always respectful or neutral (respectful 30, neutral 70).

---

## 8. Themes

### 8.1 Base weights

| Theme | Key | Base % | Vocabulary source |
|---|---|--:|---|
| Landscape | `landscape` | 16 | Biome land words by terrain (§3) + flavour land |
| Water and rivers | `water` | 14 | Biome water words by terrain + flavour water |
| Warfare and authority | `warfare` | 9 | §9.1 |
| Animals and emblems | `animals` | 12 | Biome wild animals ×1, birds ×1, creatures ×0.7, livestock ×0.5; flavour animals; mythic (legendary only) |
| Plants and trees | `plants` | 5 | Biome trees ×1, plants ×1, crops ×0.5; flavour plants |
| Sacred and mythic | `sacred` | 6 | Universal sacred ×1 + biome sacred ×2 (§9.2) |
| Direction and orientation | `direction` | 7 | §9.3 |
| Qualities and reputation | `qualities` | 7 | §9.4 |
| Number | `number` | 3 | §9.6 |
| Lifeway and craft | `lifeway` | 7 | Biome lifeways; favoured ×2; flavour lifeways |
| Speech | `speech` | 2 | §9.7 |
| Dress and appearance | `dress` | 3 | §9.8 |
| Ancestor and founder | `ancestor` | 5 | §9.9 |
| Vessel and voyage | `vessel` | 1 | §9.10 |
| Relationship to the centre | `relationship` | 3 | §9.11 |
| **Total** | | **100** | |

Colour is not a theme. It is a modifier used by templates E and F and by the steppe colour-direction system (§9.5).

**Parity cap.** After multipliers, animals + sacred together may not exceed 40% for any tradition. Redistribute the excess proportionally across the other themes (§17.4).

### 8.2 Compatibility: group type × theme

★ = allowed and ×2 · ✓ = allowed · – = excluded

| Group type | Land | Water | War | Anim | Plant | Sacr | Dir | Qual | Num | Life | Spch | Dress | Anc | Voy | Rel |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Regional | ★ | ★ | ✓ | ✓ | ✓ | ✓ | ★ | ✓ | ✓ | ★ | ✓ | ✓ | – | ✓ | ★ |
| Settlement | ★ | ★ | – | – | ★ | ✓ | ✓ | – | – | ✓ | – | – | – | – | ✓ |
| Kin | ✓ | ✓ | ✓ | ★ | ★ | ✓ | – | ✓ | – | – | – | ✓ | ★ | ★ | – |
| Dynasty | ✓ | ✓ | ★ | ★ | ✓ | ★ | – | ★ | – | – | – | – | ★ | ✓ | – |
| Confederation | ★ | ★ | ✓ | ✓ | – | ✓ | ★ | ✓ | ★ | ✓ | ✓ | – | ✓ | ✓ | ✓ |
| War-band | ✓ | – | ★ | ★ | – | ✓ | ✓ | ★ | ✓ | – | – | ★ | ✓ | ✓ | – |
| Migrant | ★ | ★ | – | – | ✓ | – | ★ | – | – | ✓ | ✓ | ✓ | – | ★ | ★ |
| Frontier | ★ | ★ | ★ | ✓ | – | – | ★ | ✓ | – | – | – | – | – | – | ★ |
| Sanctuary | ✓ | ★ | – | ✓ | ★ | ★ | – | ✓ | ✓ | – | – | – | ✓ | – | – |
| Moiety | ✓ | ✓ | – | ★ | ✓ | ✓ | ★ | ✓ | – | – | – | – | ✓ | – | – |
| Occupational | ✓ | ✓ | ✓ | – | ✓ | ✓ | – | – | – | ★ | – | – | – | ✓ | – |

---

## 9. Shared vocabulary (not biome-dependent)

Store every word with tags: `theme`, `traditions` (or `all`), `registers` (or `all`), `tone`, `form` (`closed`, `open`, `hyphenated`) and `kind` (`named` or `descriptive`). Lists are data, not code.

### 9.1 Warfare and authority

Universal: Battle, War, Spear, Shield, Victory, Fort, Stronghold, Guard, Frontier, March, Long Shields.

| Word | Allowed in |
|---|---|
| Sword | celtic, germanic, steppe, arabian, eastAsian, mediterranean, southAsian, westAfrican, general |
| Chariot | celtic, mediterranean, southAsian, eastAsian, general (×0.3) |
| Bow, Arrow, Bowmen | all except polynesian (×0.3) and sahul (×0) |
| Axe | celtic, germanic, northAmerican, northernPacific, general |
| Club | polynesian, northAmerican, mesoamerican, sahul, general (×0.3) |
| Sling | mediterranean, andean, general (×0.3) |
| Obsidian Blade | mesoamerican |
| War Canoe | polynesian, maritimeSEA, northernPacific (subject to §3.8 vessel gating) |

### 9.2 Sacred and mythic

Universal: Sun, Moon, Thunder, Sky, Rain, First Fire, Ancestors, Sacred Hill, Sacred Spring, Great Tree, Morning Star, Old Shrine, Cloud, Mist. Biome sacred words (§3.5) are added at weight 2.

Gods are never named. Where a deity is wanted, use the `[deity]` slot (§18.4). For `sahul`, sacred vocabulary is limited to Sun, Moon, Rain and Springs in every biome.

**Mythic animals** (legendary register only, added to the animals theme at weight 0.5 each): Dragon (eastAsian ×2, germanic ×1.5), Great Serpent, Giants, Sky Bird.

### 9.3 Direction and orientation

| System | Words |
|---|---|
| Compass | Northern, Southern, Eastern, Western; North, South, East, West |
| Relative | Upper, Lower, Inner, Outer, Near, Far, Beyond, Across, Between |
| Centre-relative | Central, Middle, Border, Frontier, Around |
| Sunrise/sunset | Sunrise, Sunset, Dawn, Evening |
| River-axis | Upriver, Downriver, Upstream, Downstream |
| Sea-axis | Inland, Seaward, Mountainward, Windward, Leeward |
| Moiety-axis | Upper Half, Lower Half, Left-Hand, Right-Hand |
| Water-type (`sahul`) | Saltwater, Freshwater |
| Colour-direction (`steppe`) | Black (north), Blue (east), Red (south), White (west), Golden (centre) |

Colour-direction words render as plain colours ("Blue Host"); the history explains the direction. §3.8 gates river-axis and sea-axis words.

### 9.4 Qualities and reputation

High, Great, Strong, Bold, Watchful, Swift, Enduring, Ancient, New, Old, Fierce, Steadfast, Many.

Interpretive (self, dynastic or ceremonial perspective only): Free, Noble, True, Real, Unconquered, Proud.

### 9.5 Colour (modifier)

Red, White, Black, Golden, Grey, Blue, Green, Copper, Silver, Iron. "Yellow" is excluded except as the steppe centre colour, which renders as Golden. See the colour rule (§14.6).

### 9.6 Number

Numbers: Two, Three, Four, Five, Six, Seven, Nine, Ten, Twelve, Thirteen, Thirty, Hundred. A tradition's preferred numbers are ×3; others ×0.3.

Counted nouns: Rivers, Hills, Fires, Arrows, Peoples, Tents, Houses, Clans, Valleys, Islands, Canoes, Wells, Lakes, Streams, Kindreds. Biome gating in §3.8; Arrows follows the Bow rule.

### 9.7 Speech

Respectful or neutral: People of the Word, Plain Speakers, Speakers of the [Adjective] Tongue (Quick, Old, River, Hill), Strange-Speech Folk.

Hostile (gated by the toggle): Babblers, Mumblers, The Mute Ones.

### 9.8 Dress and appearance

Long-Beard, Long-Hair, Painted, Black-Cloak, Red-Cloak, Bear-Cloak, Shaven, Topknot, Tattooed, Bright-Shield, Black-Shield, Painted-Moccasin (northAmerican only), Fur-Cloak, Feather-Cloak, Veiled.

Always hyphenated compounds (or single words) modifying a collective: "Long-Beard Folk", "Black-Cloak People". Biome gating in §3.8.

### 9.9 Ancestor and founder

English epithets: the Navigator, the Far Navigator, the Hunter, the Smith, the Red King, the Grey King, the Iron King, the Hill King, the Bear-Born, the First Mother, the Elder Brother, the Twins, the Star-Born, the Old Woman, the One-Eyed, the Wanderer, the Hunter's Son.

Plus the `[ancestor]` and `[founder]` slots, which resolve to these epithets (§18.4).

### 9.10 Vessel and voyage

Canoe names: the Swift Canoe, the Long Canoe, the White Heron Canoe, the Red Wave Canoe, the Star Path Canoe, the Shark Canoe (flag list), the Two Hulls. In a chosen biome, one canoe name in three is built as "the {Colour} {Animal} Canoe" from the biome's birds and creatures ("the White Heron Canoe" in temperate woodland, "the Black Swan Canoe").

Other: Long Voyage, Far Shore, Landfall, Longship (germanic), Raft (biomes with rivers ≥ 25).

### 9.11 Relationship to the centre

True People, Real People, The People, First People, Dwellers Around, Outer Peoples, Inner Peoples, Allies, Friends, Latecomers, Old Settlers, New People, Folk Between, Tributaries (imposed or later only), Original People (block list).

### 9.12 Hostile vocabulary (toggle on only)

Mud Folk, Marsh Crawlers, Broken Shields, Hill Thieves, Horse Stealers, Babblers, Mumblers, Fish-Eaters, Goat Folk, Latecomers. Biome gating in §3.8.

### 9.13 Emblem pools

| Pool | Used by | Make-up |
|---|---|---|
| Emblem (F) | `[COLOUR] [EMBLEM] [COLLECTIVE]` | warfare objects 40 (Spear, Shield, Axe, Bow, Sword, Club as allowed), animals 35, plants 15, materials 10 |
| Emblem (G) | "of the [EMBLEM]" | by theme: animals, plants or sacred |
| Emblem (P) | `[EMBLEM] House` | plants 50, animals 40, materials 10 |
| Plural noun (Q) | "Place of [PLURAL NOUN]" | materials 50, animal plurals 25, plant plurals 25 |
| Guide animal (R) | "Followers of the [ANIMAL]" | biome wild animals and birds (+ flavour animals in Homeland) |

---

## 10. Collective nouns

| Collective | Group types | Registers | Notes |
|---|---|---|---|
| Folk | regional, settlement, confederation, kin | all | Universal |
| People | regional, settlement, kin, sanctuary | all | Universal |
| Peoples | confederation | all | |
| Dwellers | regional, settlement | all | |
| Inhabitants | regional, settlement | historical, administrative | |
| Nation | regional, confederation | historical, administrative | Later perspective only; northAmerican ×2 |
| Settlers | settlement, migrant | all | |
| Newcomers, Arrivals | migrant | all | ×0.33 against Settlers |
| Wanderers, Exiles | migrant | all | |
| Followers | migrant, dynasty | all | mediterranean, bantu |
| Kin | kin, moiety | all | Never pluralised |
| Kindred | kin | all | celtic |
| Children | kin, sanctuary, dynasty | all | |
| Descendants | kin, dynasty | all | |
| Sons | kin, dynasty | all | Patrilineal draws only |
| Daughters | kin | all | Matrilineal draws only |
| Seed, Portion | kin | historical, legendary | celtic only |
| Bone | kin, dynasty | all | steppe only |
| Family | kin | all | arabian, polynesian |
| House | kin, dynasty, settlement | all | |
| Line | kin, dynasty | all | |
| Clan | kin, moiety, occupational | all | |
| Lords, Masters, Heirs | dynasty, warband | all | ×2 for dynasty, ×0.5 elsewhere |
| Warriors, Spears, Shields, Guard, Companions | warband | all | |
| Host | warband, confederation | all | |
| Horde | warband, confederation | all | steppe only |
| Riders | warband, regional | all | steppe, arabian, northAmerican (×0.6); §3.8 gating |
| Arrows, Tents | confederation, kin | all | steppe; Tents also arabian; §3.8 gating |
| Fires | confederation | all | northAmerican |
| Allies, Allied Houses, United Kindreds | confederation | all | |
| Tribes | confederation | administrative | Later perspective only |
| Confederacy, Confederation | confederation | administrative | |
| Guardians, Defenders, Watchers, Borderers, March Folk | frontier | all | |
| Wardens | frontier, sanctuary | historical, legendary | ×0.5 |
| Keepers, Servants | sanctuary | all | Servants ×0.5 |
| Side, Half, Hand, Quarter | moiety | all | |
| Guild | occupational | historical, administrative | eastAsian |
| Great House | settlement | historical | mesoamerican |
| Men | regional, warband | all | germanic ×2, others ×0.3 |
| Ones | – | – | Template O only |

A collective restricted to named traditions is ×0 elsewhere, except in `general`, where it is ×0.3.

---

## 11. Templates

### 11.1 List

| Key | Pattern | Example |
|---|---|---|
| A | `[DESCRIPTOR] [COLLECTIVE]` | High Folk; Battle Masters |
| B | `[FEATURE] [COLLECTIVE]` | Blackwater Folk; Mangrove People |
| C | `[COLLECTIVE] of the [FEATURE]` | People of the Blackwater |
| D | `[COLLECTIVE] by the [FEATURE]` | Settlers by the Blackwater |
| E | `[DIRECTION] [FEATURE] [COLLECTIVE]` | Lower River Settlers; Windward Kin of the Reef |
| F | `[COLOUR] [EMBLEM] [COLLECTIVE]` | Red Spear Kindred; Blue Host |
| G | `[LINEAGE COLLECTIVE] of the [EMBLEM]` / `of [ANCESTOR]` | Children of the White Horse; Descendants of the Far Navigator |
| H | `[COLLECTIVE] Beyond/Across/Between the [FEATURE]` | Folk Across the Blackwater |
| I | `[ROLE] of the [PLACE]` | Guardians of the Western Ford |
| J | `[NUMBER] [COUNTED NOUN]` / `[COLLECTIVE] of the [NUMBER] [FEATURE]` (50/50) | Twelve Arrows; People of the Three Rivers |
| K | `Those Who [VERB PHRASE]` | Those Who Spare the Python |
| L | `[AGENT NOUN]` or `[FEATURE] [AGENT NOUN]` | Reef Fishers; Hill Shepherds |
| M | Speech forms (§9.7) | Speakers of the River Tongue |
| N | `[ANCESTOR]'s [COLLECTIVE]` | the Hill King's People |
| O | `The [QUALITY] Ones` / `The [QUALITY]` / `The True People` (50/30/20) | The High Ones; The Unconquered |
| P | `[EMBLEM] [House/Clan] of the [PLACE]` | Plum House of the Western Ridge |
| Q | `[COLLECTIVE] of the Place of [PLURAL NOUN]` | People of the Place of Flints |
| R | `Followers of the [GUIDE ANIMAL]` | Followers of the Heron |

`[FEATURE]` and `[PLACE]` are landscape or water words (a place for I and P may take a direction: "Western Ford"). A `[FEATURE]` or `[EMBLEM]` takes a colour from §9.5 with probability 0.2 ("Red Bluffs", "White Ram"), never on a closed compound or a word that already contains a colour. In template L, a one-word agent noun ("Shepherds") takes a feature prefix with probability 0.6 ("Hill Shepherds", "Delta Fishers"); a two-word agent noun ("Salt Makers") stands alone or takes the tail.

**Optional tail.** Templates A, B, E, F, L and P may append "of the [FEATURE]" with probability 0.25 (plain register 0.15). A tail is never added if it would break the length cap.

**K verb phrases** (by theme): Dwell Beneath the [LAND]; Fish the [WATER]; Came from the [ORIGIN]; Spare the [ANIMAL]; Keep the [SACRED]; Ride the [LAND] (§3.8); Walk Before the [EMBLEM]; Hold the [PLACE]. ORIGIN is a sacred origin place (Origin Lake, Ancestor Cave, Red Cave, Far Shore) or a land word with a colour.

### 11.2 Base weights by register

| Template | Plain | Historical | Legendary | Administrative |
|---|--:|--:|--:|--:|
| A | 18 | 6 | 4 | 8 |
| B | 17 | 8 | 3 | 16 |
| C | 12 | 18 | 16 | 12 |
| D | 3 | 8 | 4 | 4 |
| E | 9 | 8 | 2 | 16 |
| F | 6 | 5 | 6 | 4 |
| G | 7 | 12 | 14 | 5 |
| H | 3 | 6 | 5 | 2 |
| I | 4 | 7 | 9 | 6 |
| J | 4 | 5 | 5 | 10 |
| K | 1 | 2 | 13 | 0 |
| L | 6 | 3 | 1 | 8 |
| M | 2 | 2 | 2 | 1 |
| N | 2 | 3 | 2 | 2 |
| O | 3 | 2 | 7 | 0 |
| P | 1 | 2 | 1 | 4 |
| Q | 1 | 2 | 3 | 1 |
| R | 1 | 1 | 3 | 1 |
| **Total** | **100** | **100** | **100** | **100** |

Tradition template multipliers apply on top; then templates incompatible with the group type, theme or perspective are removed and the rest renormalised.

### 11.3 Template requirements

| Template | Requires |
|---|---|
| G, N | group type kin, dynasty, sanctuary or moiety; theme animals, ancestor, sacred or plants |
| J | group type confederation, regional or kin; theme number |
| K | any group type except occupational |
| L | theme lifeway; group type regional, settlement, occupational or migrant |
| M | theme speech; group type regional or confederation |
| O | perspective self or ceremonial |
| P | tradition eastAsian (or general at ×0.2); group type kin, dynasty or occupational |
| Q | tradition mesoamerican (or general at ×0.2) |
| R | group type migrant; theme animals |

---

## 12. Registers

Chosen per run. Default: Plain.

| Register | What it does | Examples |
|---|---|---|
| Plain (default) | Short, direct, literal-sounding | High Folk; Bear Kin; Reef Fishers |
| Historical | Longer, natural phrasing; headword carries "The" | The People of the Upper Blackwater |
| Legendary | Poetic and mythic; unlocks mythic animals, Water-Hill and most "Those Who…" names | Those Who Dwell Beneath the High Hills |
| Administrative | Maps, histories, reference works; unlocks Nation, Tribes, Confederacy | Northern Upland Confederation |

Hostile names are a tone (§7.2), not a register.

---

## 13. Word filters

A candidate word survives only if it passes every filter, in this order:

1. **Tradition allow-lists** (§9.1 restricted words, §10 restricted collectives).
2. **Suppressions** (§5.4): homeland kind only in Homeland mode; culture kind always.
3. **Register** tags (e.g. Inhabitants: historical and administrative only; mythic animals: legendary only).
4. **Perspective** tags (e.g. interpretive qualities: self, dynastic or ceremonial only; Tributaries: imposed or later only).
5. **Tone** (hostile vocabulary only when the toggle is on and the tone is hostile).
6. **Biome gating** (§3.8).
7. **Banned words** (§17.3).

The colour rule (§14.6) and the length caps (§14.5) are checked after rendering.

---

## 14. Rendering

### 14.1 Two forms per name

- **Headword:** as listed in a reference work: "High Folk", "People of the Blackwater", "The Unconquered".
- **In-text:** mid-sentence: "the High Folk", "the People of the Blackwater", "the Unconquered".

Template O and the historical register always carry "The" in the headword. Other headwords carry no article. The generate view shows headwords and inserts headwords.

### 14.2 Capitalisation

Title case. Lower-case only: a, an, and, at, by, in, of, on, the, to (unless first). Every other word is capitalised, including Beyond, Across, Between, Beneath, Under, Before. Hyphenated compounds capitalise each part: Black-Shield, Left-Hand, Bear-Born, Wine-Dark. Biome common nouns are capitalised in names ("Children of the Snow Leopard").

### 14.3 Hyphenation

- Closed compounds (Blackwater, Downland, Headland, Longship, Fenland) are never split.
- Named features and emblems (`kind: named`) stay open: White Horse People, Stony Ford Guardians, Three Rivers Folk, Snow Leopard Clan.
- Descriptive attributes (`kind: descriptive`) that pre-modify a collective are hyphenated: Black-Shield People, Long-Beard Folk, Strange-Speech Folk.
- All biome words are `named`.

### 14.4 Plurals and agreement

- Kin, Folk, People, Kindred and Seed are never pluralised.
- Spears, Shields and Arrows are plural metonyms.
- Histories treat names as plural ("the High Folk were…") except House, Line, Clan and the moiety terms, which are singular ("the House of the Red Spear was…").

### 14.5 Length caps (headword words)

| Register | Max |
|---|--:|
| Plain | 6 |
| Historical | 8 |
| Administrative | 7 |
| Legendary | 9 |

Over-length results are redrawn without the tail first, then redrawn completely.

### 14.6 The colour rule

A colour may not directly modify a person-collective (People, Folk, Men, Kin, Children, Sons, Daughters, Nation, Dwellers, Ones and so on). It must modify an object, feature or emblem: "Red Spear Folk" and "Red Hills People" are fine; "Red Folk" and "White People" are blocked, because they read as racial labels. Exception: in `steppe`, colours may modify Host, Horde, Tents, Arrows and Bone.

---

## 15. Name histories

### 15.1 Questions every history answers

Who coined the name; what it means; what kind of group it describes; whether the group accepted it; whether its meaning or use changed.

### 15.2 Assembly

Three sentences: **coinage**, **meaning** (with the animal interpretation, if any), **acceptance and drift**. Fill `{…}` from the name's own parts. Each bank is picked uniformly.

**Coinage**

| Perspective | Fragments |
|---|---|
| Self | "The name was their own, used at gatherings and in the recitation of descent." · "They called themselves this long before anyone wrote it down." · "Elders taught the name to children as the first thing they should know about who they were." |
| Neighbour (respectful) | "Their neighbours coined the name out of respect for {custom}." · "Those who traded with them named them for {feature}, and meant it kindly." |
| Neighbour (neutral) | "Communities nearby first used the name for the people of the {feature}." · "Travellers gave them the name because it was the plainest way to say where they lived." |
| Neighbour (hostile) | "Rivals coined the name as a jibe at {custom}." · "It began as an insult shouted across a disputed border." |
| Geographical | "The name began as a plain description of the settlements around the {feature}." · "It named the country first and the people second." |
| Dynastic | "The ruling house traced its line to {ancestor}, and the name proclaimed it." · "The name was taken by the heirs of {ancestor} to set them above other families." |
| Ceremonial | "The title was spoken at councils and in war-songs, never in ordinary speech." · "Priests and singers used the name; most people used something plainer." |
| Later | "Chroniclers applied the name to several communities they could not tell apart." · "Map-makers wrote the name across a region they knew only from report." |
| Imposed | "Imperial officials recorded the name when the region was brought under tribute." · "Conquerors used the name in their tax rolls, and it stuck." |

**Meaning** (by theme)

| Theme | Fragment |
|---|---|
| landscape | "It refers to the {feature} at the heart of their lands." |
| water | "It recalls the {feature} on which their lives depended." |
| warfare | "It boasts of {emblem} and the battles fought with it." |
| animals | "The {animal} was their {interpretation}." |
| plants | "The {plant} stood at the centre of their oldest settlement." |
| sacred | "It names the {sacred} they held holy." |
| direction | "It placed them {direction gloss}." |
| qualities | "It marks them out as {quality gloss}." |
| number | "It counts {number} groups bound together by oath." |
| lifeway | "It names the work that fed them: they were {lifeway, lower case}." |
| speech | "It turns on how they spoke, which was the first thing strangers noticed." |
| dress | "It describes how they looked to others: {dress gloss}." |
| ancestor | "It claims descent from {ancestor}." |
| vessel | "It remembers {vessel}, which first brought them to this land." |
| relationship | "It sets them in relation to the centre of the known world." |

**Glosses.** Store these maps in the data file.

| Map | Entries |
|---|---|
| Quality gloss | High: the people of the high ground · Great: a great and numerous people · Strong: a strong people · Bold: a bold people · Watchful: a watchful people, slow to trust · Swift: swift travellers · Enduring: a people who endure · Ancient: an ancient people · New: newcomers · Old: the oldest settled people · Fierce: a fierce people · Steadfast: a steadfast people · Many: a numerous people · Free: a free people, subject to no one · Noble: a noble people · True: the true people · Real: the real people · Unconquered: a people never conquered · Proud: a proud people |
| Direction gloss | Northern/North: to the north · Southern/South: to the south · Eastern/East: to the east · Western/West: to the west · Upper: upstream or uphill · Lower: downstream or downhill · Inner: nearer the centre · Outer: out on the edges · Near: close at hand · Far: far off · Beyond: beyond the borders · Across: across the water · Between: between two greater peoples · Central/Middle: at the centre · Border/Frontier: on the frontier · Around: around the city · Sunrise/Dawn: towards the sunrise · Sunset/Evening: towards the sunset · Upriver/Upstream: upriver · Downriver/Downstream: downriver · Inland: inland · Seaward: towards the sea · Mountainward: towards the mountains · Windward: on the windward side · Leeward: on the leeward side · Upper Half: in the upper half of a divided people · Lower Half: in the lower half of a divided people · Left-Hand: on the left hand of the ruler · Right-Hand: on the right hand of the ruler · Saltwater: by the salt water · Freshwater: by the fresh water · steppe colours: in the {north/east/south/west/centre}, whose colour is {colour} |
| Dress gloss | Long-Beard: long beards · Long-Hair: long hair · Painted: painted skin · Black-Cloak: black cloaks · Red-Cloak: red cloaks · Bear-Cloak: bearskin cloaks · Shaven: shaven heads · Topknot: topknots · Tattooed: tattoos · Bright-Shield: bright shields · Black-Shield: black shields · Painted-Moccasin: painted moccasins · Fur-Cloak: fur cloaks · Feather-Cloak: feather cloaks · Veiled: veiled faces |

**`{feature}`** when the name has none (templates A, F, O and similar): draw one land word from the name's biome.

**`{custom}`** (neighbour coinage) by theme: lifeway "their work as {lifeway, lower case}"; dress "their {dress gloss}"; speech "the way they spoke"; warfare "their skill in war"; animals "their {animal} emblem"; any other theme "their ways".

**Lower case in histories.** Biome common nouns (animals, plants, crops) and lifeway agent nouns are written in lower case inside history sentences; features keep their capitals ("the Blackwater", "the Chalk Hills").

**Acceptance** (one per value): embraced "They took the name as their own and use it with pride." · accepted "They accepted the name without complaint." · tolerated "They tolerated the name but rarely used it among themselves." · resented "They resented the name and corrected anyone who used it." · reclaimed "Later generations took up the insult and wore it with pride." · unknown "Whether they ever used the name themselves is not recorded."

**Drift** (one per value): none "Its meaning has not changed." · broadened "In time it came to cover the whole of the surrounding region." · narrowed "In time it came to mean only the ruling families." · passed to the land "The land itself now bears the name." · outlived "The name has outlived the people it once described." · transferred "The people who replaced them took the name over." · became a title "It survives as a title rather than the name of a people."

**Transplanted biome.** When the biome is chosen and is not in the tradition's homeland, the meaning sentence may (probability 0.3) be replaced by "Their ancestors brought the old ways of naming with them into {biome phrase}."

### 15.3 Acceptance weights

| Perspective / tone | Embraced | Accepted | Tolerated | Resented | Reclaimed | Unknown |
|---|--:|--:|--:|--:|--:|--:|
| Self | 80 | 20 | – | – | – | – |
| Neighbour, respectful | 25 | 50 | 25 | – | – | – |
| Neighbour, neutral | 10 | 50 | 30 | 10 | – | – |
| Neighbour, hostile | – | 10 | 25 | 45 | 20 | – |
| Geographical | 20 | 60 | 20 | – | – | – |
| Dynastic | 70 | 30 | – | – | – | – |
| Ceremonial | 90 | 10 | – | – | – | – |
| Later | – | 40 | 30 | – | – | 30 |
| Imposed | – | 20 | 35 | 35 | 10 | – |

**Drift** (base): none 40, broadened 15, narrowed 10, passed to the land 15, outlived 8, transferred 7, became a title 5.

### 15.4 Animal interpretation

| Interpretation | Base % | Text for `{interpretation}` |
|---|--:|---|
| Legendary ancestor | 25 | "legendary ancestor" |
| Regional emblem | 20 | "emblem across the region" |
| Warrior society badge | 15 | "warriors' badge" |
| Outsider's nickname | 15 | "nickname among outsiders" |
| Royal or house symbol | 10 | "royal symbol" |
| Sacred or spirit associate | 10 | "sacred companion" |
| Clan taboo | 5 | "sacred animal, which they must never harm or eat" |

Tradition multipliers: westAfrican taboo ×4; polynesian and northernPacific ancestor ×2; mediterranean adds "migration guide" at 30 for template R ("guide on the long migration"); northAmerican relabels regional emblem "clan animal" ×1.5.

### 15.5 Worked examples

> [!example] High Folk
> **Type:** Regional people · **Perspective:** Neighbour-name (neutral) · **Tradition:** Celtic Britain & Gaul · **Biome:** temperate woodland (homeland)
> **Meaning:** People living in the uplands.
> Communities nearby first used the name for the people of the Hills. It marks them out as the people of the high ground. In time it came to cover the whole of the surrounding region.

> [!example] People of the White Heron Canoe
> **Type:** Kin group · **Perspective:** Self-name · **Tradition:** Polynesian · **Biome:** tropical islands (homeland)
> **Meaning:** Descendants of those who arrived on the canoe named White Heron.

> [!example] Seaward Kin of the Chalk Hills
> **Type:** Kin group · **Perspective:** Self-name · **Tradition:** Polynesian · **Biome:** temperate woodland (chosen)
> **Meaning:** The kin who live on the seaward side of the chalk hills. Their ancestors brought the old ways of naming with them into temperate woodland.

---

## 16. Output structure

```json
{
  "name": "Blackwater Folk",
  "inText": "the Blackwater Folk",
  "tradition": "celtic",
  "biome": "temperate",
  "biomeMode": "homeland",
  "terrain": "rivers",
  "groupType": "regional",
  "perspective": "geographical",
  "tone": "neutral",
  "register": "plain",
  "theme": "water",
  "template": "B",
  "literalMeaning": "The people associated with the Blackwater",
  "interpretation": null,
  "acceptance": "embraced",
  "drift": "broadened",
  "origin": "The name began as a plain description of the settlements around the Blackwater. It recalls the Blackwater on which their lives depended. In time it came to cover the whole of the surrounding region.",
  "alternativeNames": ["People of the Blackwater", "Blackwater Dwellers", "Folk Across the Blackwater"],
  "slots": [],
  "echoesReal": false,
  "historicity": "Fictional modern-English name inspired by Celtic Britain & Gaul naming patterns"
}
```

- **Alternative names:** two to four, built from the same semantic core with different templates. With probability 0.3, one is drawn from a different perspective (an exonym for a self-name, or the reverse) and the history says so.
- **Slots:** unresolved bracketed slots, e.g. `["deity"]`.
- **Historicity:** fixed text, never omitted. In a chosen biome outside the homeland, append ", set in {biome phrase}".

---

## 17. Safeguards

### 17.1 Real-name collisions

Two editable data lists of distinctive English renderings of real peoples' names. Generic phrases ("The People", "Free People", "Border Men", "True People") are not listed. Matching is case-insensitive on the headword with any leading "The" removed.

- **Block list** (living peoples; exact matches are redrawn): Blackfoot, Crow, People of the Longhouse, People of the Standing Stone, People of the Flint, People of the Great Hill, People of the Great Swamp, People of the Dawn Land, Dawn Land People, Children of the Mist, Cloud People, People of the Rain, Original People, Seven Council Fires, People of the Veil.
- **Flag list** (historical peoples; allowed, `echoesReal: true`, history notes the echo): Ten Arrows, Nine Tribes, Golden Horde, White Horde, Blue Horde, Royal Scythians, Black Cloaks, Long Beards, All Men, Painted People, Sea Peoples, Sons of the Lion, Sons of the Dog, Followers of the Woodpecker, Followers of the Bull, Falcon People, Shark Canoe.

A data switch, `flagListBlocks` (default `false`), turns the flag list into a block list.

### 17.2 Sacred specifics

No real deity names, ceremonies, sacred sites or named ancestral beings in any list, biome lists included. Sacred themes use generic English nouns only. For `sahul`: Sun, Moon, Rain and Springs only.

### 17.3 Banned words (every tradition, register and tone, hostile included)

Savages, Barbarians, Primitives, Heathens, Redskins, Squaw, Bushmen, Hottentots, Eskimos, Head-Hunters, Cannibals, Natives, and any racial or ethnic slur. Colour plus person-collective is blocked by §14.6. The hostile tone insults conduct, lifeway or landscape ("Mud Folk", "Horse Stealers"), never ancestry or the body. A final check rejects any output containing a banned word as a whole word.

### 17.4 Parity across cultures

Every tradition must support at least 8 of the 11 group types, every perspective and every register, and respect the animals + sacred cap of 40%. A test checks all three (§22.2).

### 17.5 Caste

`southAsian` disables the lifeway theme and the occupational group type, in every biome, so no result can read as a caste or hereditary-status name. No varna, jati or status vocabulary exists in any list.

### 17.6 Historicity line

Every result carries the `historicity` text.

---

## 18. Tribal names: generate view

Kept minimal, matching the other modules. Reuse the existing boxes and rows; add no new layout.

### 18.1 Placement

- Section switcher: **tribal names**, after empire expansion place names, with `ICON_TRIBAL_NAMES`.
- `historySection()` maps labels starting `tribal names` to `tribalNames`.

### 18.2 Controls

| Control | Where | Choices | Default |
|---|---|---|---|
| Tradition | The first dropdown box (as colonial traditions) | General, then the 16 others grouped under muted, unclickable headings: First release, Second release, Expansion | General |
| Biome | The second box beneath it (as river regions) | Homeland, then the 11 biome labels | Homeland |
| Register | The toggle row (as the colonial context row) | plain · historical · legendary · admin | plain |
| Options | An icon button beside the guide button (Obsidian `sliders-horizontal`) opening an Obsidian `Menu` | **Group type:** Any, then the 11 (checked item shows the choice) · separator · **Perspective:** Any, then the 7 · separator · **Hostile names** (checkable) | Any · Any · off |
| Quantity | The existing count | | |

- **Tooltips.** Tradition: its "Draws on" text. Biome: its guide; for Homeland, "Homeland: " plus the tradition's homeland weights, e.g. "Homeland: tropical islands 80%, cool rainforest 20%". Register buttons: Plain translated, Historical narrative, Legendary, Administrative.
- **Hostile names.** Turning it on shows a Notice: "Hostile names are on: some results will be insults one people used for another." All choices are session-only, like the colonial modules' choices.

### 18.3 Results

- Show headwords through `renderRecipeResults(names, "module")`. Map each result to `GeneratedName` with `text` = headword and `etymology` = the details below. The existing details toggle (off by default) shows them.
- **Details**, two lines:
  1. `{Group type} · {perspective}{ (tone) when neighbour or imposed} · {biome label}{ (homeland) in Homeland mode}`, e.g. "Kin group · self-name · Tropical islands (homeland)".
  2. The three-sentence origin, then "Also: {alternatives joined with ' · '}". If `echoesReal`, add "Echoes a real historical name."
- Bracketed `[deity]` shows muted, as river name placeholders do.
- Insert actions insert headwords.
- **History label:** `tribal names · {tradition label} · {biome label or "homeland"} · {register}`, e.g. "tribal names · Polynesian · Temperate woodland · plain".

### 18.4 Slots inside tribal names

| Slot | Rendering |
|---|---|
| `[ancestor]` | An English epithet from §9.9 |
| `[founder]` | An English epithet from §9.9 |
| `[deity]` | Left bracketed (as in british place names) and listed in `slots` |

---

## 19. Biomes for explorers and incomers

This is the part that makes biomes usable for **Exploration in new lands** and **Expansion into settled lands**, in recipes, in the place name wizard and in the generate view.

### 19.1 Recipe schema

- `RecipeSettings.shape` gains `biome: string`. `RECIPE_DEFAULTS.shape.biome = "unknown"`.
- YAML key: `shape.biome`, a biome id from §3.2.
- `readRecipe`: accept `biome` alongside region, tradition, context and feature. An id that is neither a biome nor `unknown` is reported as `Unknown biome “{id}”.` and skipped.
- `RecipeWizard.collect()` and `recipeToFrontmatter` never write `biome: unknown`; leave the key out.
- The organic part (Place names) ignores `shape.biome` entirely: output is identical with or without it.

```yaml
shape:
  part: new-land
  tradition: spanish
  context: contested-frontier
  biome: rainforest
  feature: any
```

### 19.2 The wizard sentence

The biome joins both colonial sentences after the context, introduced by "across":

> ‹General explorers› in ‹wild and unsettled lands› **across ‹unknown country›**, naming ‹any feature›
>
> ‹General incomers› who are ‹ruling over the locals› **across ‹unknown country›**, naming ‹any feature›

Examples that must render exactly:

| Settings | Sentence |
|---|---|
| new-land, general, wild-and-unsettled, unknown, any | General explorers in wild and unsettled lands across unknown country, naming any feature |
| new-land, spanish, contested-frontier, rainforest, any | Spanish-themed explorers in a contested frontier across tropical rainforest, naming any feature |
| new-land, dutch, sparse-or-weak-native-presence, savannah, any | Dutch-themed explorers in lands with a sparse, or weak, native presence across the savannah, naming any feature |
| established, roman, imposition, mediterranean, any | Roman-themed incomers who are ruling over the locals across Mediterranean hills, naming any feature |
| established, british-imperial, accommodation, monsoon, settlement | British-themed incomers who are living alongside the locals across the monsoon lands, naming settlement |
| established, japanese, adoption, cool-rainforest, any | Japanese-themed incomers who are settling in amongst the locals across cool rainforest, naming any feature |

Implementation:

- Move the sentence wording into `src/colonialSentence.ts` (Obsidian-free): the context phrase tables, `explorersPhrase`, `incomersPhrase`, the biome choices and a function `colonialSentenceText(part, tradition, context, biome, feature): string` that returns the plain sentence. `recipeEditor.ts` imports these and keeps drawing the links; the tests use `colonialSentenceText`.
- **Biome link:** clicking "unknown country" (or the current phrase) opens a `Menu`: "unknown country", a separator, then the 11 sentence phrases in §3.2 order. The checked item is the current biome.
- **Guide icon.** Exploration gains the info icon at the end of its sentence (Expansion already has one). Both open one guide modal (extend `ContextGuideModal` or add a sibling): Expansion shows its three contexts first, then a **Biomes** heading; Exploration shows only Biomes. Each biome entry: menu label in bold, then its guide text.

### 19.3 What a biome does to a colonial recipe

In `NameRenderer.fill` (`src/names/engine.ts`), the colonial native flora and fauna branch becomes:

```ts
// Tribal brief §19.3: a recipe biome fills unmapped native flora and fauna with its own words.
if (this.colonial && !mapped && NATIVE_LABELS[categoryId]) {
  const biome = findBiome(this.recipe.shape.biome);
  const entries = biome ? biomeEntries(biome, categoryId) : undefined;
  if (entries) return { kind: "word", entry: pickWeighted(entries, rng), traditional: false };
  return { kind: "placeholder", categoryId, label: `[${NATIVE_LABELS[categoryId]}]`, native: true };
}
```

- The five slots affected: `bird`, `wild-animal`, `fish-and-other-creatures`, `tree`, `wild-plant`.
- **Seed stability:** the biome draw consumes the fill stream only when a biome is set. With no biome, output for a given seed is byte-identical to today.
- An explicit slot setting still wins: Name packs, Word lists, Placeholder, Ignore, or "Built-in list" (which still draws the British lists).
- Domestic animals and crops are unchanged: they are the incomers' own, so they stay English built-in words.
- Biome words are word fills, so they take the "of the" form like other wildlife words (*Point of the Hornbill*, *Baobab Flat*, *Hornbill Creek*) and are never adapted by a takeover pack.
- Etymology shows the word as drawn.

**Wizard slot default label.** On the slots page, for those five slots in a colonial part, the unset choice reads "{Biome menu label} list" (e.g. "Savannah list") when a biome is set, and "Native placeholder" when it isn't.

### 19.4 The generate-view colonial modules

Exploration place names and empire expansion place names get a biome too:

- Show the **second box** beneath the tradition box for both modules: "Unknown country", then the 11 biome labels. Tooltip: the biome's guide; for Unknown country, "Unknown country: native wildlife and plants stay as placeholders".
- Session state per part, beside `selectedTradition` and `selectedContext`: `selectedBiome: Record<ColonialPart, string | undefined>`.
- `colonialPlaceNamesRecipe(part, tradition, context, biome?)` sets `shape.biome` (`unknown` when undefined).
- `colonialHistoryLabel` gains an optional biome and appends its menu label in lower case when set: "exploration place names · Spanish · contested frontier · tropical rainforest". Labels without a biome are unchanged.

### 19.5 River names: colonial settings

The river names module's New Land and Established settings take a biome as well, so its native patterns resolve.

- **UI:** for those two settings, the second box shows the biome list (as §19.4), session state `riverBiome`. The British setting keeps its region box.
- **`RiverOptions.biome?: string`.**
- **Patterns:** after a colonial pattern is picked, replace each `[native bird]`, `[native wild animal]`, `[native fish or creature]`, `[native tree]` and `[native plant]` with a title-cased weighted draw from the biome's matching list ("Hornbill River", "Baobab Creek"). The placeholder (muted) flag is cleared when no brackets remain.
- **Descriptive names:** add `descriptiveCategories.colonialWithBiome` to `river-names.json`, used for colonial settings when a biome is set:

| Category | Weight |
|---|--:|
| colour | 35 |
| quality-or-condition | 20 |
| shape | 12 |
| bird | 10 |
| wild-animal | 8 |
| tree | 8 |
| wild-plant | 4 |
| fish-and-other-creatures | 3 |
| **Total** | **100** |

  The five native categories draw from the biome (`biomeEntries`); the others from `NAME_WORDS` as now.
- **Recipe river fills:** `riverWordFill` passes the recipe's `shape.biome` for colonial parts.
- **History label:** "river names · New Land · savannah" when a biome is set.
- Without a biome everything is byte-identical to today.

---

## 20. Tribal names as a slot source

### 20.1 Schema

`SlotSetting` gains `{ kind: "tribal"; tradition: string }`. YAML:

```yaml
slots:
  native-people-or-tribe:
    tribal: bantu
  folk-group:
    tribal: auto
```

- `tradition` is a tradition key from §5.1 or `auto`. `auto` is only meaningful for `folk-group` in the organic part; anywhere else it reads as `general`.
- `readSlot` recognises an object with a string `tribal`; an unknown tradition is reported as `Slot “{id}” names an unknown tradition “{x}”.` and the slot is skipped. `recipeToFrontmatter` writes `{ tribal: key }`.

### 20.2 Filling the slot

`src/tribes/slotFill.ts` exports `tribalSlotFill(options, rng): { text: string; tradition: string }`. `NameRenderer.fill` calls it for `kind: "tribal"` and returns a word fill `{ modern: text, forms: [], fuses: "no" }` with `traditional: false`, exactly as `riverWordFill` does. It uses the recipe's fill stream.

| Setting | Colonial parts (`native-people-or-tribe`) | Organic part (`folk-group`) |
|---|---|---|
| Templates | A 35, B 35, F 10, L 10, J 10 (first form only) | A 50, B 50 |
| Tail | Never | Never |
| Max words | 3 | 2 |
| Register | plain 70, administrative 30 | plain 100 |
| Perspective | base weights with imposed ×3, neighbour ×2 | base weights |
| Group types | regional, settlement, kin, confederation (base weights renormalised) | regional, settlement, kin |
| Biome | the recipe's biome if set, otherwise the tradition's homeland | the tradition's homeland |
| Hostile | off | off |
| Article | Leading "The" removed | Leading "The" removed |

**`auto`** picks the tradition per fill from the recipe region: COR, WAL, SHH, SLO → `celtic`; SBL → `celtic` 50, `germanic` 50; NSI and every other region → `germanic`; all of Britain → `germanic` 70, `celtic` 30.

Tribal fills are never adapted by a takeover pack, never fused and never possessive-fused. When `native-people-or-tribe` is set to Tribal names, the recipe's native pack no longer feeds that slot (an explicit setting always wins).

### 20.3 Wizard

- `slotOptions.ts`: `allowsTribal(part, id)` is true for (`organic`, `folk-group`) and (`new-land` or `established`, `native-people-or-tribe`) only.
- The slot dropdown offers **Tribal names** after Word lists where allowed. Choosing it sets `{ kind: "tribal", tradition: part === "organic" ? "auto" : "general" }`.
- Its footer has one dropdown, **Tradition**: "Regional (auto)" (organic only), General, then the 16 traditions in §5.1 order.
- A recipe that already uses Tribal names on another slot shows the option as "Tribal names (not recommended)", like the other options.

---

## 21. Milestones

Run `npm test` and `npm run build` at the end of every milestone; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Biome data and API.** `biomes.json`, `src/biomes.ts`, `tests/biomes.test.ts` | §22.1 passes |
| M2 | **Colonial biomes.** Recipe schema, renderer branch, `colonialSentence.ts`, wizard biome link and guide, slot default label, generate-view second box for both colonial modules, history labels | §22.3 passes; existing `recipeRegression`, `colonialNames`, `recipeTakeover` tests pass unchanged |
| M3 | **River biomes.** Options, patterns, `colonialWithBiome`, recipe river fills, UI box, history label | §22.4 passes; `riverNames` tests pass unchanged |
| M4 | **Tribal engine and first release.** `tribal-names.json`, `src/tribes/engine.ts`; General plus the 8 first-release traditions | §22.2 passes for those 9 |
| M5 | **Tribal generate view.** Section, icon, controls, results, details, history | Manual check in Obsidian: every control works, choices are kept while switching modules, history rows land in tribal names |
| M6 | **Second release and expansion.** The remaining 8 traditions | §22.2 passes for all 17 |
| M7 | **Tribal slot source.** Schema, `slotFill.ts`, renderer, wizard option and footer | §22.5 passes |
| M8 | **Docs and tidy-up.** README section; remove dead code; full test and build run | Clean `npm test` and `npm run build` |

Before M2 and M3, record seeded snapshots (first 20 names for 3 fixed seeds, per part and per river setting) from the unchanged code, so the "byte-identical without a biome" tests compare against real earlier output.

---

## 22. Tests

### 22.1 `tests/biomes.test.ts`

- `BIOMES.map(b => b.id)` equals `["temperate", "boreal", "cool-rainforest", "mediterranean", "steppe", "desert", "savannah", "rainforest", "monsoon", "tropical-islands", "highland"]`.
- Every biome's terrain weights sum to 100.
- Every terrain with weight > 0 has at least 2 land words or 2 water words (universal and biome combined).
- Minimum list sizes for every biome: wild animals 5, birds 8, creatures 6, trees 5, plants 5, crops 2, livestock 1, lifeways 10, sacred 5, materials 5.
- Every biome's lifeway weights sum to 100.
- No list contains a duplicate, and no word in any list matches §17.3.
- `pluralOf`: wolf → wolves, deer → deer, ox → oxen, cactus → cacti, lynx → lynxes, flying fox → flying foxes, bird of paradise → birds of paradise, thorn bush → thorn bushes, monkey-puzzle → monkey-puzzles. (Add bird of paradise → birds of paradise to `irregularPlurals`.)
- `biomeEntries(b, id)` returns weighted entries with `fuses: "no"` for the five native ids and `undefined` for `domestic-animal` and `crop`.

### 22.2 `tests/tribalNames.test.ts`

- 17 traditions in §5.1 order. Every homeland sums to 100 and names only valid biomes; every terrain multiplier names a valid terrain.
- **Determinism:** the same options and seed give the same names.
- **Coverage:** for every tradition × register (17 × 4), a batch of 50 returns 50 unique headwords (or a notice), none empty, all within the register's word cap.
- **English only:** every headword matches `/^[A-Za-z' -]+$/` and contains none of iwi, ayllu, banu, kel, orang, ngati as a whole word.
- **Colour rule:** across 2,000 names per tradition, no colour word is immediately followed by a person-collective, except the steppe exception.
- **Banned words:** 0 hits across 2,000 names per tradition with hostile names on.
- **Block list:** 0 exact matches across the same names.
- **Homeland vs chosen:**
  - `polynesian`, Homeland, 3,000 names: 0 containing Horse, Mare or Riders; 0 containing Sword.
  - `polynesian`, chosen `temperate`, 3,000 names: 0 containing a word that exists only in `tropical-islands` lists or the Polynesian flavour (compute that set in the test); at least 1 containing a `temperate` biome word; still 0 containing Sword.
  - `andean`, chosen `steppe`, 3,000 names: at least 1 containing Horse, Riders or Horse Herders (homeland suppression lifted).
- **Caste:** `southAsian`, 5,000 names in every biome mode: 0 with `theme: "lifeway"` or `groupType: "occupational"`.
- **Sahul sacred:** every `theme: "sacred"` result for `sahul` uses only Sun, Moon, Rain or Springs.
- **Parity:** each tradition supports at least 8 group types, all 7 perspectives and all 4 registers; animals + sacred after multipliers ≤ 40%.
- **General group types:** 10,000 General plain names; each group type's share is within 3 percentage points of its base weight.
- **Gating:** 2,000 `steppe`-tradition names in `tropical-islands`: 0 Tents or Wells counted nouns; 2,000 `polynesian` names in `desert`: sea-axis words appear in under 2% of names.

### 22.3 `tests/colonialBiomes.test.ts`

- **Regression:** for the recorded seeds, recipes with no biome produce the recorded snapshots exactly.
- For each colonial part × 11 biomes, 2,000 names from the built-in colonial recipe: 0 containing `[native `, and at least 1 containing a word from that biome's five native lists.
- Biome `savannah` with a word-list fixture mapped to `bird` (words "Testbird", "Otherbird"): bird fills come only from the fixture.
- Biome `savannah` with `tree: built-in`: "Oak" can appear; "Baobab" never does.
- Organic recipe with a hand-written `biome: desert`: output identical to the same recipe without it.
- YAML round trip keeps `biome`; `biome: unknown` is never written; `biome: tundra` gives the problem `Unknown biome “tundra”.`
- `colonialSentenceText` returns the six sentences in §19.2 exactly.
- `colonialHistoryLabel(…, "rainforest")` ends "· tropical rainforest"; without a biome it is unchanged.

### 22.4 River names

- For the recorded seeds, river names with no biome match the snapshots exactly, for all three settings.
- New Land and Established with each biome, 2,000 names each: 0 containing `[native `.
- `colonialWithBiome` weights sum to 100.

### 22.5 `tests/tribalSlots.test.ts`

- A new-land recipe with `native-people-or-tribe: { tribal: bantu }` and biome `savannah`, 2,000 names: every tribal fill is at most 3 words, never starts with "The", and never appears fused.
- With a takeover pack fixture set, tribal text appears unchanged in the output.
- Organic `folk-group: { tribal: auto }`: region WAL gives only `celtic`; region EAN only `germanic`; region SBL gives both within 2,000 fills.
- YAML round trip for `{ tribal: … }`; an unknown tradition gives the problem in §20.1.

---

## 23. Parked

- Biomes for the organic part (british place names) and for world place names cultures.
- User-editable biomes as word-list packs using the standard headings (Wild animal, Bird, Tree…): a natural next step, since word lists already work per slot.
- A terrain chooser in the UI.
- Blending two traditions in one name; tradition profiles as packs.
- Running tribal names through takeover or ageing (not applicable while output is English-only).
- Name packs or word lists for `[ancestor]`, `[founder]` and `[deity]` inside the tribal names module.
- Tribal names feeding the river names module's own `[tribal name]` and `[native people]` patterns outside recipes.
- Native-language forms: out of scope by design (§2).
