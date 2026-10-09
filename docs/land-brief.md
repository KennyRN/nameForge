# Coding brief: land – biomes everywhere, terrain, peoples on rivers and editable biomes

> [!summary] What this brief asks for
> 1. **Biomes for british place names and world place names.** Britain becomes a biome of its own, built from today's built-in lists, so British naming habits can be set in a desert and Roman legionaries can name places in Britain. World cultures swap their nature words for the chosen biome's.
> 2. **A terrain chooser, with eight terrains.** Any terrain, or one of plains, hills, mountains, forest, coasts, rivers and lakes, wetlands and islands. These replace the six terrains of the tribal names brief, whose catch-all "open" terrain is split into plains, hills and forest. A twelfth biome, **Moorland**, covers wet, windswept, mostly treeless country. Terrain re-weights which kinds of place get named and which land and water words are used.
> 3. **Tribal names feed river names.** `[tribal name]` and `[native people]` in river patterns become English people names.
> 4. **User-editable lists.** Biome packs, with editable terrains (words, weights, and terrains of your own), plus editable tribal safeguard lists.
> 5. **Simpler slots.** Ten wizard slots shrink to two choices (a land source or Placeholder), and three more lose options they no longer need. Ignore stays on every slot.
>
> Everything is fixed numbers. Where this brief gives a weight, use it; do not tune or guess.

This brief builds on the **tribal names and biomes brief**, which is already implemented: `src/biomes.ts`, `src/data/biomes.json`, `src/tribes/`, the colonial biome, the river biome and the tribal slot kind are all in the code. Cite this one in comments as `Land brief §n`.

Read the whole brief before starting. Work through the milestones in §12 in order, running `npm test` and `npm run build` at the end of each, and commit at the end of each.

---

## 0. Decisions already taken

| Question | Decision |
|---|---|
| What "Britain" is | A built-in biome with id `britain`, made from today's `name-words.json` lists (old words, plurals, fusion and all). It is the default for british place names and appears in every biome menu |
| Defaults | No biome and Any terrain everywhere reproduce today's output exactly, seed for seed |
| What terrain changes | Which kinds of place are named (shape group and generic multipliers); which land and water words are used; in tribal names, which terrain every name uses. It never changes animals, plants or people |
| Where the controls live | One **Land** button (biome and terrain) in every module that uses them. The biome moves out of the second box it was given by the tribal names brief |
| Where terrains are edited | Inside biome packs: each terrain's words and weight can be changed, and a pack can add terrains of its own |
| Tribal names in river names | On by default in the river names module; British rivers use `celtic`, colonial rivers use a tradition chosen in the module (General by default) |
| Block list | User packs can add to both safeguard lists and remove entries from the flag list, but cannot remove built-in block-list entries (they protect living peoples' names) |
| Terrains | Eight: plains, hills, mountains, forest, coasts, rivers and lakes, wetlands, islands. Relief (flat, hilly, mountainous) and cover (forest) are separate terrains; the old `open` terrain is removed (§2.0) |
| Biome renames | **Temperate lands** (was Temperate woodland), **Steppe and grassland** (was Steppe and prairie), **Mediterranean lands** (was Mediterranean hills) and **Highlands** (was High mountains). Ids are unchanged |
| New biome | **Moorland** (`moorland`): the Highlands and Islands, the Pennines and Dartmoor, Iceland, the Faroes, the Falklands and Tierra del Fuego (§2.0) |
| Old recipes | Never rewritten. Slot settings the new dropdowns no longer offer keep working and show as "(not recommended)", as today |

---

## 1. Codebase orientation

Follow the existing conventions: Obsidian-free engines with JSON data, one seeded `mulberry32` stream per batch, tests under `node:test` through `npm test`, British English and OUP punctuation in all user-facing text.

### 1.1 Files to add

| File | Purpose |
|---|---|
| `src/data/terrains.json` | Terrain labels, phrases and shape multipliers (§2.7) |
| `src/biomePacks.ts` | Obsidian-free: parse a biome pack, render a biome as pack text, diff against its base, merge onto its base (§9) |
| `src/landMenu.ts` | The Land button and its menu, shared by every module (§6) |
| `src/tribes/safeguardPacks.ts` | Obsidian-free: parse and merge tribal safeguard packs (§10) |
| `tests/land.test.ts` | §13.1 |
| `tests/landSlots.test.ts` | §13.2 |
| `tests/worldBiomes.test.ts` | §13.3 |
| `tests/biomePacks.test.ts` | §13.4 |
| `tests/riverPeoples.test.ts` | §13.5 |

### 1.2 Files to change

| File | Change |
|---|---|
| `src/data/biomes.json` | The terrain split, four renames and the Moorland biome (§2.0); Britain, short words, ground, resources, seasons and shape multipliers for every biome (§2.1–§2.6) |
| `src/biomes.ts` | Britain, terrains, custom biomes and terrains, the new lists, environment multipliers (§2.8) |
| `src/placeShapes.ts`, `src/colonialShapes.ts` | An optional environment multiplier layer (§3) |
| `src/names/recipe.ts` | `shape.terrain`; organic `shape.biome`; slot kind `biome`; biome links (§4.1, §5.1) |
| `src/names/engine.ts` | Land-driven slot resolution (§5.3); native-pack rivers (§8.2) |
| `src/names/slotOptions.ts` | Two-choice slots (§5.1) |
| `src/recipeEditor.ts`, `src/colonialSentence.ts` | Terrain and biome in all three sentences; slot dropdowns and descriptions (§4.2, §5.2) |
| `src/world/engine.ts`, `src/data/world-place-names.json` | Biome swaps and homeland biomes (§7) |
| `src/rivers/engine.ts` | People fills from tribal names (§8.1) |
| `src/tribes/engine.ts` | Britain, terrain choice, custom biomes, user safeguard lists (§11) |
| `src/modal.ts` | Land button in five modules; river options button; Biome pack editor (§6, §8.1, §9.4) |
| `src/sections.ts` | History labels (§6.4) |
| `README.md` | Biomes, terrain and biome packs |

---

## 2. Biome data additions

### 2.0 Eight terrains instead of six

The tribal names brief gave every biome six terrains, one of them `open`: "the biome's main country". That lumped together how the land lies (flat or hilly) and what covers it (woodland or open ground). Replace `open` with three terrains everywhere: in `biomes.json`, the `TerrainId` type, tradition terrain multipliers (none of which name `open`) and every table in this brief.

| Id | Covers |
|---|---|
| `plains` | Flat country: fields, pasture, vales, grassland, sand and stony plains, and the high plateaux of the highlands |
| `hills` | Downs, wolds, moors, ridges, slopes, dunes and mesas, terraces and side valleys |
| `forest` | Woods, groves, clearings and jungle |

`mountains`, `coast`, `rivers`, `wetland` and `islands` are unchanged. Terrain order everywhere: plains, hills, mountains, forest, coast, rivers, wetland, islands.

**New terrain weights.** Each row sums to 100. These replace the tribal names brief's terrain weights table.

| Biome | plains | hills | mountains | forest | coast | rivers | wetland | islands |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| temperate | 20 | 15 | 5 | 20 | 15 | 15 | 7 | 3 |
| moorland | 15 | 35 | 15 | 2 | 15 | 8 | 8 | 2 |
| boreal | 10 | 10 | 10 | 30 | 15 | 15 | 7 | 3 |
| cool-rainforest | 5 | 10 | 20 | 25 | 25 | 10 | 2 | 3 |
| mediterranean | 15 | 25 | 10 | 5 | 25 | 5 | 5 | 10 |
| steppe | 50 | 15 | 8 | 2 | 0 | 20 | 5 | 0 |
| desert | 45 | 15 | 15 | 0 | 10 | 15 | 0 | 0 |
| savannah | 40 | 15 | 5 | 5 | 5 | 20 | 10 | 0 |
| rainforest | 10 | 10 | 5 | 40 | 5 | 25 | 5 | 0 |
| monsoon | 30 | 15 | 10 | 10 | 10 | 15 | 10 | 0 |
| tropical-islands | 5 | 10 | 15 | 5 | 35 | 3 | 2 | 25 |
| highland | 15 | 15 | 45 | 5 | 0 | 15 | 5 | 0 |

A weight of 0 means the terrain isn't offered for that biome (no forest in the desert, no coasts on the steppe).

**Universal land phrases** (tribal names; weight 1). These replace the `open` row of the tribal names brief's universal table:

| Terrain | Land phrases |
|---|---|
| plains | Plain, Lowland, Valley, Flats |
| hills | Hills, Ridge, Hollow, Upland |
| forest | Woods, Forest, Grove |

**Biome land phrases** (tribal names; weight 2). These replace each biome's `open` row. No biome had `open` water phrases, so the three new terrains have none of their own; they use universal water words only.

| Biome | plains | hills | forest |
|---|---|---|---|
| temperate | Vale, Meadows, Heath, Open Fields | Downs, Downland, Chalkland, Chalk Hills, Moor, Wold | Woodland, Forest, Greenwood, Deep Wood, Old Wood |
| boreal | Tundra, Barrens, Frozen Plain, Snowfields, Ice Edge | Bare Hills, Stony Ridges, Birch Hills | Pine Forest, Dark Forest, Birch Woods, Spruce Forest |
| cool-rainforest | Green Valleys, Fern Flats, River Flats | Mist Hills, Green Hills, Fern Ridges | Deep Forest, Fern Forest, Moss Forest, Mist Forest, Old Forest, Great Trees |
| mediterranean | Stony Plain, Dry Valleys, Olive Plain, Coastal Plain | Scrub Hills, Rocky Hills, Terraces, Golden Hills, Limestone Hills | Oak Woods, Pine Woods, Cork Woods |
| steppe | Grass, Grasslands, Open Plain, Black Earth, Salt Flats, Sea of Grass, Short Grass, Long Grass | Rolling Hills, Badlands, Grassy Ridges | Birch Groves, Forest Edge, Poplar Woods |
| desert | Sands, Sand Sea, Stony Desert, Gravel Plain, Salt Pans, Salt Road, Dry Valley | Dunes, Red Rocks, Mesas, Rocky Hills | – |
| savannah | Grasslands, Tall Grass, Wide Plains, Red Earth, Thornlands | Red Hills, Stone Hills, Termite Hills, Granite Hills | Bushland, Gallery Forest, Thorn Forest |
| rainforest | Clearings, Forest Edge, River Flats | Green Hills, Jungle Ridges | Deep Forest, Great Forest, Canopy, Vine Forest |
| monsoon | River Plain, Paddies, Green Plain | Terraces, Red Hills, Blue Ridges | Bamboo Forest, Teak Forest, Jungle |
| tropical-islands | Taro Gardens, Coastal Flats | High Valley, Green Valleys, Cloud Valley, Green Ridges | Breadfruit Groves, Palm Groves, Fern Forest |
| highland | High Plateau, High Plains, Stony Plain, High Pastures | Terraces, High Valley, Hanging Valley, Cold Heights, Foothills | Cloud Forest, Juniper Woods, Pine Woods |

**Renames** in `biomes.json` (ids unchanged):

| Id | Menu label | Sentence phrase | Guide |
|---|---|---|---|
| `temperate` | Temperate lands | the temperate lands | Broadleaf forest, downs, heath and farmland with four seasons: most of Europe, eastern North America, northern China, Korea and Japan. |
| `steppe` | Steppe and grassland | the grasslands | Temperate grassland, vast and mostly treeless, with hot summers and bitter winters: the Eurasian steppe from Hungary to Mongolia, the North American prairies and the pampas. |
| `mediterranean` | Mediterranean lands | the Mediterranean lands | Unchanged |
| `highland` | Highlands | the highlands | Unchanged |

**New biome: Moorland (`moorland`).** Add it to `biomes.json` in the tribal names brief's format (its §3.5), straight after `temperate`, so `BIOMES` and every biome menu run: temperate, moorland, boreal, cool-rainforest, mediterranean, steppe, desert, savannah, rainforest, monsoon, tropical-islands, highland.

| Field | Value |
|---|---|
| Menu label | Moorland |
| Sentence phrase | the moors |
| Guide | Cool, wet, windswept and mostly treeless country of heather, bog and bare hills: the Scottish Highlands and Islands, the Pennines and Dartmoor, Iceland, the Faroes, the Falklands and Tierra del Fuego. |

| Terrain | Land | Water |
|---|---|---|
| plains | Heath, Heather Flats, Rough Grazing, Cotton-Grass Flats | – |
| hills | Moor, High Moor, Fells, Heather Hills, Tors, Peat Hags | – |
| mountains | Bare Mountains, Scree Slopes, Stony Tops, Cairns | Tarns, Hill Springs |
| forest | Birch Scrub, Scrub Woods | – |
| coast | Sea Cliffs, Bird Cliffs, Storm Beach, Sea Stacks | Grey Sea, Sounds, Long Inlets |
| rivers | – | Peat Streams, Brown River, Long Lakes, Moss Pools |
| wetland | – | Blanket Bog, High Moss, Bog Pools, Mires |
| islands | Bird Isles, Bare Isles, Seal Isles | – |

- **Wild animals:** red deer, hare, mountain hare, fox, stoat, otter, wildcat, pine marten, wolf (0.5)
- **Birds:** grouse, curlew, lapwing, golden plover, skylark, merlin, hen harrier, raven, golden eagle, skua, puffin, gannet, snipe
- **Creatures:** salmon, trout, eel, seal, adder, frog, dragonfly
- **Trees:** rowan, birch, juniper, willow, pine, alder, hawthorn
- **Plants:** heather, bracken, cotton grass, bog myrtle, gorse, bilberry, moss, rush
- **Crops:** oats, barley, rye
- **Livestock:** sheep (3), cattle (2), pony, horse, goat, dog, goose
- **Lifeways:** Shepherds 20, Crofters 14, Fishers 10, Cattle Keepers 10, Peat Cutters 8, Fowlers 8, Drovers 8, Hunters 6, Weavers 6, Smiths 4, Seal Hunters 3, Kelp Gatherers 3
- **Sacred:** Standing Stones, Stone Circle, Cairns, Old Barrow, Hill Fire, Holy Well (0.5)
- **Materials:** Peat, Stone, Wool, Slate, Iron, Lead

Add `grouse → grouse` and `snipe → snipe` to `irregularPlurals`. Two-word entries pluralise their last word as usual (red deer → red deer, mountain hare → mountain hares). Moorland's short words, ground, resources, seasons and shape multipliers are in §2.3–§2.5.

**Tribal homelands that change** (each still sums to 100):

| Tradition | New homeland |
|---|---|
| `general` | temperate 8, moorland 4, boreal 8, cool-rainforest 8, mediterranean 9, steppe 9, desert 9, savannah 9, rainforest 10, monsoon 9, tropical-islands 9, highland 8 |
| `celtic` | temperate 80, moorland 20 |
| `germanic` | temperate 55, boreal 30, moorland 15 |

**Knock-on effects.**

- Tribal names output changes for the same seed, because its terrain draws change. This is intended. Its snapshots are taken after M1 (§12).
- The tribal names brief's gating thresholds (its §3.8) name only coast, rivers, wetland and islands, so they are unchanged.
- The tribal names brief's tests that list terrains, list `BIOMES` or check its terrain table are updated to these values (`BIOMES` now has 12 ids, in the order above).

### 2.1 Britain (`britain`)

A built-in biome made from the existing lists, so nothing about British names changes when it is chosen.

| Field | Value |
|---|---|
| Menu label | Britain |
| Sentence phrase | Britain |
| Guide | The British Isles: the built-in British lists, with their old words, plurals and joining forms. |
| Terrain weights | As `temperate` (§2.0) |
| Wild animals, birds, creatures, trees, plants, crops, livestock | `name-words.json` categories `wild-animal`, `bird`, `fish-and-other-creatures`, `tree`, `wild-plant`, `crop`, `domestic-animal`, as full `NameWordEntry` objects |
| Short land, short water | `landform` and `water-or-wetland-feature` built-ins, tagged by terrain (§2.2) |
| Ground, resources, seasons | `soil-or-ground`, `resource`, `season` built-ins |
| Shape multipliers | None (all 1) |
| Everything else (land and water phrases, lifeways, sacred, materials) | Inherited from `temperate` |

Store Britain in `biomes.json` as `{ "id": "britain", "inherits": "temperate", "builtInLists": { … category ids … }, "terrainTags": { … } }`. Keep `BIOMES` as the 12 natural biomes (its test is updated for Moorland). Export `BRITAIN` separately and `allBiomes(custom)` = `[BRITAIN, ...BIOMES, ...custom]`.

### 2.2 Britain terrain tags

The built-in landform and water words, tagged so a terrain can filter them.

| Word | Terrains |
|---|---|
| hill | hills, mountains |
| ridge | hills, mountains |
| spur | hills, mountains |
| edge | hills, mountains, coast |
| bank | plains, rivers, coast, wetland, forest |
| slope | hills, mountains, forest |
| knoll | hills, islands, forest |
| mound | plains, wetland |
| down | hills |
| crag | mountains, coast |
| top | hills, mountains |
| head | coast, mountains, islands |
| marsh | wetland |
| ford | rivers |
| well | plains, islands |
| spring | plains, hills, mountains, forest |
| pool | rivers, wetland, coast, forest |
| mere | wetland, rivers, plains |
| brook | rivers, hills, forest |
| stream | rivers, mountains, hills |
| moss | wetland |

Both `stream` entries in the built-in list share the tag.

### 2.3 Short land and water words

The land and water phrases in the biome data ("Chalk Hills", "Sand Sea") suit tribal names but not one half of a place name. Each terrain therefore also gets **short words**: single words that work as a place-name specific or a world-culture feature. They are used by the Landform and Water or wetland feature slots and by world place names.

**Universal short words** (every biome, weight 1):

| Terrain | Short land | Short water |
|---|---|---|
| plains | plain, flat, vale | well, spring |
| hills | hill, ridge, hollow, slope | spring |
| mountains | peak, crag, pass, ridge | spring, falls |
| forest | wood, grove, glade | spring, pool |
| coast | point, head, cliff, shore | bay, cove, sound |
| rivers | bank, bend | stream, pool, ford, lake, falls |
| wetland | bank, island | marsh, pool |
| islands | isle, rock | sound, bay |

**Biome short words** (weight 2). A dash means none beyond the universal words.

| Biome | Terrain | Short land | Short water |
|---|---|---|---|
| temperate | plains | meadow, heath | pond |
| | hills | down, moor, wold | – |
| | mountains | fell, tor, edge | tarn, brook |
| | forest | copse, thicket | – |
| | coast | cliff, dune, shingle | creek, estuary, haven |
| | rivers | meadow, bank | brook, weir |
| | wetland | – | fen, bog, mere |
| | islands | skerry, holm | sound |
| moorland | plains | heath | – |
| | hills | moor, fell, tor | – |
| | mountains | scree, cairn | tarn |
| | forest | scrub | – |
| | coast | stack, cliff | sound, inlet |
| | rivers | – | rill |
| | wetland | – | bog, mire, moss |
| | islands | holm, skerry | sound |
| boreal | plains | tundra, barrens | lake, pond |
| | hills | esker | – |
| | mountains | glacier, fell, scree | tarn, torrent |
| | forest | forest, birchwood, pinewood | – |
| | coast | skerry, ice | fjord, inlet |
| | rivers | – | rapids, lake, torrent |
| | wetland | – | mire, bog, moss |
| | islands | skerry, holm | – |
| cool-rainforest | plains | meadow | spring |
| | hills | bluff | – |
| | mountains | glacier, volcano | torrent, geyser |
| | forest | forest, fern | – |
| | coast | stack, beach | inlet, fjord |
| | rivers | – | rapids, torrent |
| | wetland | – | swamp, bog |
| | islands | stack | – |
| mediterranean | plains | field | well, cistern |
| | hills | terrace, scrub | – |
| | mountains | gorge, crag | spring |
| | forest | pinewood | – |
| | coast | cape, beach | cove, lagoon |
| | rivers | gorge | torrent |
| | wetland | – | lagoon, marsh |
| | islands | islet | strait |
| steppe | plains | steppe, grass | well, lake |
| | hills | mound, rise | – |
| | mountains | scarp | spring |
| | forest | – | – |
| | rivers | bluff | lake |
| | wetland | – | reedbed, marsh |
| desert | plains | sand | well, oasis |
| | hills | dune, mesa, rock | – |
| | mountains | canyon, rock | pool |
| | coast | spit | inlet |
| | rivers | grove | oasis, wadi, well |
| savannah | plains | bush, scrub | waterhole |
| | hills | rise, outcrop | – |
| | mountains | escarpment, plateau, dome | – |
| | forest | thicket | – |
| | coast | beach, dune | creek |
| | rivers | – | waterhole |
| | wetland | – | swamp, delta |
| rainforest | plains | clearing | creek |
| | hills | spur | – |
| | mountains | gorge | cascade |
| | forest | forest, jungle | – |
| | coast | mudbank | creek, estuary |
| | rivers | sandbank | rapids, creek, oxbow |
| | wetland | – | swamp, backwater |
| monsoon | plains | paddy | tank, pond |
| | hills | terrace | – |
| | mountains | gorge | torrent |
| | forest | jungle, bamboo | – |
| | coast | beach, dune | creek, backwater |
| | rivers | sandbank | delta |
| | wetland | – | swamp, backwater, delta |
| tropical-islands | plains | garden | – |
| | hills | valley | pool |
| | mountains | volcano, crater | pool |
| | forest | – | – |
| | coast | beach, sandbar | reef, lagoon |
| | rivers | – | – |
| | wetland | – | swamp |
| | islands | atoll, islet, cay | lagoon, reef |
| highland | plains | plateau, pasture | tarn |
| | hills | terrace, foothill | – |
| | mountains | glacier, scree, col | torrent, tarn |
| | forest | – | – |
| | rivers | gorge | torrent, tarn |
| | wetland | – | bog, mire |

Short words are stored lower case and fill as `NameWordEntry` with `fuses: "no"`, `plural: pluralOf(word)` and `forms: [TitleCase(word)]`.

### 2.4 Ground, resources and seasons

| Biome | Ground (soil or ground) | Resources | Seasons |
|---|---|---|---|
| temperate | clay, chalk, gravel, sand, flint, loam, peat | iron, tin, copper, lead, coal, salt, timber | summer, winter, spring, autumn |
| moorland | peat, granite, gravel, stone, slate | peat, slate, lead, iron, granite | winter, summer, spring, storm |
| boreal | peat, gravel, rock, ice, moss | fur, iron, copper, timber, amber | winter, summer, thaw |
| cool-rainforest | moss, peat, basalt, gravel, mud | timber, copper, greenstone, gold | rain, winter, summer |
| mediterranean | limestone, marble, marl, stone, gravel, sand | marble, silver, copper, salt, iron | summer, winter, harvest |
| steppe | black earth, loess, salt, sand, gravel | gold, salt, iron, copper | winter, summer, spring |
| desert | sand, salt, gravel, flint, rock, dust | salt, gold, copper, turquoise, incense | summer, winter, rain |
| savannah | red earth, clay, sand, ironstone, granite | iron, copper, gold, ivory, salt | rain, drought, harvest |
| rainforest | mud, clay, silt, red earth, sand | gold, rubber, timber, resin | rain, flood |
| monsoon | silt, clay, mud, red earth, sand | spice, silk, pearl, ruby, salt | monsoon, rain, flood, harvest |
| tropical-islands | coral, sand, basalt, ash, pumice | pearl, shell, coral, obsidian, salt | rain, storm, harvest |
| highland | scree, granite, slate, gravel, ice | silver, gold, copper, tin, salt | winter, summer, frost, thaw |

All weight 1. Two-word entries (black earth, red earth) never fuse.

### 2.5 Biome shape multipliers

Applied to place-shape groups (both shape generators share these group ids) and to the colonial `new-landscapes` generics. Anything not listed is ×1. `temperate` and `britain` have none.

| Biome | Group multipliers | Generic multipliers |
|---|---|---|
| moorland | upland-and-open-ground ×2.5, seasonal-and-upland-settlement ×2, wetland ×1.5, mountains-and-rock ×1.3, religious-burial-and-memorial ×1.3, open-and-farmed-land ×0.5, clearings ×0.2, woodland ×0.15 | plain-grassland ×0.5, volcano ×0.3, glacier ×0.3, desert ×0, oasis ×0, dry-riverbed ×0, reef ×0, lagoon ×0 |
| boreal | woodland ×1.3, wetland ×1.5, springs-pools-and-lakes ×1.5, open-and-farmed-land ×0.4, clearings ×0.7 | glacier ×1.5, volcano ×0.3, desert ×0, oasis ×0, dry-riverbed ×0, reef ×0, lagoon ×0 |
| cool-rainforest | woodland ×2, mountains-and-rock ×1.3, coast-and-sea ×1.3, open-and-farmed-land ×0.4, upland-and-open-ground ×0.3 | volcano ×1.5, glacier ×1.5, plain-grassland ×0.2, desert ×0, oasis ×0, dry-riverbed ×0, reef ×0 |
| mediterranean | hills-and-slopes ×1.5, coast-and-sea ×1.3, woodland ×0.6, upland-and-open-ground ×0.6, wetland ×0.4 | dry-riverbed ×2, volcano ×0.5, reef ×0.3, desert ×0.2, glacier ×0 |
| steppe | open-and-farmed-land ×2, upland-and-open-ground ×1.5, islands-and-river-land ×0.5, mountains-and-rock ×0.5, woodland ×0.2, clearings ×0.2, coast-and-sea ×0 | plain-grassland ×4, glacier ×0, volcano ×0, reef ×0, lagoon ×0 |
| desert | springs-pools-and-lakes ×1.5, mountains-and-rock ×1.5, open-and-farmed-land ×0.5, upland-and-open-ground ×0.3, woodland ×0.05, clearings ×0.05, wetland ×0 | desert ×5, oasis ×5, dry-riverbed ×4, plain-grassland ×0.3, creek ×0.3, reef ×0.3, lagoon ×0.2, glacier ×0 |
| savannah | open-and-farmed-land ×1.5, wetland ×0.8, upland-and-open-ground ×0.5, woodland ×0.4 | plain-grassland ×3, dry-riverbed ×2, oasis ×0.5, desert ×0.3, glacier ×0 |
| rainforest | woodland ×2, rivers-and-streams ×1.5, wetland ×1.3, open-and-farmed-land ×0.4, upland-and-open-ground ×0.1 | creek ×1.5, plain-grassland ×0.2, desert ×0, oasis ×0, dry-riverbed ×0, glacier ×0 |
| monsoon | open-and-farmed-land ×1.5, rivers-and-streams ×1.3, wetland ×1.3, upland-and-open-ground ×0.2 | dry-riverbed ×0.5, lagoon ×0.5, glacier ×0.2, desert ×0.2, oasis ×0.2 |
| tropical-islands | coast-and-sea ×2, islands-and-river-land ×2, wetland ×0.5, open-and-farmed-land ×0.5, upland-and-open-ground ×0.1 | reef ×4, lagoon ×4, island-group ×3, volcano ×3, plain-grassland ×0.2, glacier ×0, desert ×0, oasis ×0, dry-riverbed ×0 |
| highland | mountains-and-rock ×2.5, seasonal-and-upland-settlement ×2, valleys ×1.5, hills-and-slopes ×1.3, woodland ×0.4, wetland ×0.4, coast-and-sea ×0 | mountain-range ×3, glacier ×3, volcano ×1.5, plain-grassland ×0.5, reef ×0, lagoon ×0 |

A group id a generator doesn't have is ignored (organic shapes have no `new-landscapes`).

### 2.6 What each slot draws from a biome

| Slot | Biome list |
|---|---|
| `wild-animal` | wild animals |
| `bird` | birds |
| `fish-and-other-creatures` | creatures |
| `tree` | trees |
| `wild-plant` | plants |
| `domestic-animal` | livestock |
| `crop` | crops |
| `landform` | short land for the terrain (§5.4) |
| `water-or-wetland-feature` | short water for the terrain |
| `soil-or-ground` | ground |
| `resource` | resources |
| `season` | seasons |

`biomeEntries(biome, categoryId)` (already in `biomes.ts`) is extended to all twelve, taking an optional terrain for the two terrain slots. For `britain` it returns the built-in `NameWordEntry` objects unchanged (weight 1 each), so fusion and traditional forms work exactly as now.

### 2.7 Terrain and custom terrains

`src/data/terrains.json`:

| Id | Menu label | Sentence phrase |
|---|---|---|
| `any` | Any terrain | any part |
| `plains` | Plains | the plains |
| `hills` | Hills | the hills |
| `mountains` | Mountains | the mountains |
| `forest` | Forest | the forests |
| `coast` | Coasts | the coasts |
| `rivers` | Rivers and lakes | the rivers and lakes |
| `wetland` | Wetlands | the wetlands |
| `islands` | Islands | the islands |

**Terrain shape multipliers** (anything not listed ×1):

| Terrain | Group multipliers | Generic multipliers |
|---|---|---|
| plains | open-and-farmed-land ×2.5, settlement-farms-and-estates ×1.25, woodland ×0.5, valleys ×0.5, hills-and-slopes ×0.4, coast-and-sea ×0.3, mountains-and-rock ×0.2 | plain-grassland ×3, desert ×2 |
| hills | hills-and-slopes ×3, upland-and-open-ground ×2, valleys ×1.5, hollows-and-corners ×1.5, seasonal-and-upland-settlement ×1.25, mountains-and-rock ×0.5, wetland ×0.5, coast-and-sea ×0.3, islands-and-river-land ×0.3 | mountain-range ×0.5 |
| mountains | mountains-and-rock ×3, hills-and-slopes ×2, valleys ×2, seasonal-and-upland-settlement ×2, upland-and-open-ground ×1.5, open-and-farmed-land ×0.5, wetland ×0.3, islands-and-river-land ×0.2, coast-and-sea ×0.1 | mountain-range ×3, volcano ×2, glacier ×2 |
| coast | coast-and-sea ×4, islands-and-river-land ×1.5, industry-and-trade ×1.5, valleys ×0.5, mountains-and-rock ×0.3, upland-and-open-ground ×0.3 | reef ×2, lagoon ×2, creek ×1.5 |
| rivers | rivers-and-streams ×3, springs-pools-and-lakes ×2.5, crossings-and-routes ×2, islands-and-river-land ×1.5, valleys ×1.5, coast-and-sea ×0.3, mountains-and-rock ×0.3 | creek ×2, oasis ×1.5 |
| wetland | wetland ×4, islands-and-river-land ×2, springs-pools-and-lakes ×1.5, hills-and-slopes ×0.5, upland-and-open-ground ×0.3, mountains-and-rock ×0.1 | lagoon ×1.5 |
| forest | woodland ×4, clearings ×3, religious-pre-christian-and-sacred ×1.25, mountains-and-rock ×0.5, open-and-farmed-land ×0.4, upland-and-open-ground ×0.3, coast-and-sea ×0.3 | plain-grassland ×0.2, desert ×0 |
| islands | islands-and-river-land ×4, coast-and-sea ×2.5, mountains-and-rock ×0.5, valleys ×0.5, open-and-farmed-land ×0.5, upland-and-open-ground ×0.5 | island-group ×4, reef ×2, lagoon ×2, volcano ×1.5 |

**Available terrains.** A biome offers the terrains whose weight is above 0, in table order, then any custom terrains from its pack (§9.3). Choosing a biome that lacks the current terrain resets the terrain to Any.

**Custom terrains** (biome packs only, §9.3) have an id from their name in kebab case, menu label as written, phrase "the {name in lower case}", the weight the pack gives, no universal words, and the shape multipliers the pack gives (none by default).

### 2.8 API additions (`src/biomes.ts`)

```ts
export const BRITAIN: Biome;
export function allBiomes(custom?: readonly Biome[]): Biome[];
export type TerrainChoice = "any" | string;            // a TerrainId or a custom terrain id
export function availableTerrains(biome: Biome): Terrain[];
export function terrainWeights(biome: Biome, choice: TerrainChoice, multipliers?: Partial<Record<string, number>>): Record<string, number>;
export function shortWords(biome: Biome, kind: "land" | "water", terrain: string): [NameWordEntry, number][];
export function environmentMultipliers(biome: Biome | undefined, terrain: TerrainChoice): { groups: Record<string, number>; generics: Record<string, number> } | undefined;
```

- `terrainWeights` with a chosen terrain returns `{ [terrain]: 100 }`; with `any` it returns the biome's weights × the multipliers.
- `environmentMultipliers` returns `undefined` when there is no biome (or `britain`/unknown) **and** the terrain is `any`, so callers can keep their unchanged code path. Otherwise it multiplies the biome's and the terrain's tables key by key.
- `Biome` gains `custom?: { path: string; base: string }`, `phrase`, `guide` and a terrain list that can include custom terrains.

---

## 3. The environment layer in the shape generators

Biome and terrain change which kinds of place get named through one optional multiplier layer, added to both shape generators.

- `PlaceShapeGenerateOptions` and `ColonialGenerateOptions` gain `environment?: { groups: Record<string, number>; generics: Record<string, number> }` (from `environmentMultipliers`).
- **Colonial:** `groupMultiplier(id)` becomes `profile × context × (environment.groups[id] ?? 1)`. Wherever a generic's weight is built from `profile.genericMultipliers`, multiply by `environment.generics[id] ?? 1` too. The stacked-generic source and the affix weights are unchanged.
- **Place shapes:** with no region, today's generator makes uniform group and generic picks so that All Britain reproduces part 1 batches. **Keep that path exactly when `environment` is undefined.** When it is set, switch to weighted picks: each group's weight is `(region group multiplier ?? 1) × (environment.groups[id] ?? 1)`, and each generic's is `(region generic multiplier ?? 1) × (environment.generics[id] ?? 1)`. Groups or generics that reach 0 drop out; if every group drops out, throw `No eligible place-shape groups` as today, and the caller shows "No place names fit this biome and terrain."
- The feature filter (settlement, landscape, a single group) applies first; the environment only re-weights what is left.
- `names/engine.ts` passes `environment` from the recipe's biome and terrain to whichever generator it calls.

---

## 4. Recipes

### 4.1 Schema

- `shape.terrain`: a terrain id, a custom terrain id or `any`. Default `any`; never written when `any`.
- `shape.biome`: now read for the **organic** part too. For organic, unset or `unknown` means Britain. For colonial parts, unset or `unknown` means unknown country, as now. `britain` is accepted in every part.
- A user biome is written as a link: `biome: "[[Salt Marshes]]"`. `readRecipe` keeps it as a link target; the host resolves it to a `Biome` (§9.5). A missing pack gives the notice `Biome pack “Salt Marshes” wasn't found; using unknown country.` (colonial) or `…; using Britain.` (organic), and the recipe still generates.
- An unknown terrain gives the problem `Unknown terrain “{x}”.` and reads as `any`. A custom terrain the chosen biome lacks reads as `any` with the notice `{Biome label} has no “{x}” terrain.`
- `NameGenerateOptions` gains `biome?: Biome` (resolved by the host) so the engine never reads the vault.

```yaml
shape:
  part: organic
  region: north
  biome: desert
  terrain: mountains
  feature: any
```

### 4.2 The three sentences

Terrain and biome form one phrase, "‹terrain› of ‹biome›". In both colonial sentences it replaces the tribal names brief's "across ‹biome›"; Place names gains it too.

| Part | Sentence |
|---|---|
| Place names | ‹Any feature› from ‹all of Britain›, set in ‹any part› of ‹Britain› |
| Exploration | ‹General explorers› in ‹wild and unsettled lands› across ‹any part› of ‹unknown country›, naming ‹any feature› |
| Expansion | ‹General incomers› who are ‹ruling over the locals› across ‹any part› of ‹unknown country›, naming ‹any feature› |

Examples that must render exactly through `colonialSentenceText` (extend it to the organic part and rename it `wizardSentenceText(part, settings)`):

| Settings | Sentence |
|---|---|
| organic, all-britain, britain, any, any | Any feature from all of Britain, set in any part of Britain |
| organic, north, desert, mountains, any | Any feature from the North, set in the mountains of the desert |
| organic, wales, tropical-islands, coast, landscape | Landscape from Wales, set in the coasts of tropical islands |
| organic, all-britain, britain, forest, any | Any feature from all of Britain, set in the forests of Britain |
| new-land, roman, contested-frontier, highland, hills, any | Roman-themed explorers in a contested frontier across the hills of the highlands, naming any feature |
| new-land, general, wild-and-unsettled, unknown, any, any | General explorers in wild and unsettled lands across any part of unknown country, naming any feature |
| new-land, spanish, contested-frontier, rainforest, rivers, any | Spanish-themed explorers in a contested frontier across the rivers and lakes of tropical rainforest, naming any feature |
| established, roman, imposition, britain, any, any | Roman-themed incomers who are ruling over the locals across any part of Britain, naming any feature |
| established, british-imperial, accommodation, monsoon, wetland, settlement | British-themed incomers who are living alongside the locals across the wetlands of the monsoon lands, naming settlement |
| new-land, dutch, sparse-or-weak-native-presence, unknown, islands, any | Dutch-themed explorers in lands with a sparse, or weak, native presence across the islands of unknown country, naming any feature |

- **Terrain link** opens a `Menu`: Any terrain ("any part"), a separator, then the available terrains' phrases (§2.7). With unknown country, all eight built-in terrains are offered.
- **Biome link** opens a `Menu`: the part's default ("Britain" for organic, "unknown country" for colonial), a separator, then Britain (colonial only, since it is organic's default), the 12 biomes, and, if any exist, a separator and the user's biome packs by phrase.
- **Guide icon:** Place names gains the info icon too. All three open the existing guide modal, which gains a **Terrain** heading (each terrain's menu label and one line: what it favours, taken from its top two group multipliers, e.g. "Mountains: mountains and rock, hills and slopes") and lists user biomes under **Your biomes** with their guide text.

---

## 5. Two-choice slots

### 5.1 The new dropdowns

Every slot keeps **Ignore** as its last option. "(not recommended)" options appear only when the recipe already uses them, exactly as today.

| Slot | Parts | Unset (default) label | Other choices |
|---|---|---|---|
| Wild animal, Bird, Fish and other creatures, Tree, Wild plant | all | From the biome | Placeholder, Ignore |
| Landform, Water or wetland feature | all | From the terrain | Placeholder, Ignore |
| Soil or ground | all | From the biome | Placeholder, Ignore |
| Resource | Exploration | From the biome | Placeholder, Ignore |
| River or stream name | all | River name module | Placeholder, Ignore |
| Season | all | From the biome | Ignore |
| Domestic animal, Crop | Place names | From the biome | Ignore |
| Domestic animal, Crop | Exploration, Expansion | Incomers' own | From the biome, Ignore |

All other slots keep today's dropdowns, including Tribal names on Folk group and Native people or tribe.

- In `slotOptions.ts`, replace the per-option booleans for these slots with `slotChoices(part, id): ("default" | "biome" | "placeholder" | "ignore")[]`, and keep `allowsPacks`, `allowsLists` and `allowsPlaceholderChoice` returning `false` for them, so that existing settings fall through to the "(not recommended)" path.
- New slot kind `{ kind: "biome" }`, YAML `domestic-animal: biome`. It is only offered for colonial domestic animal and crop; written anywhere else, it reads the same as unset.
- In the colonial parts, Placeholder on the five nature slots renders the native label (`[native bird]`), as unset does today without a biome.

### 5.2 Slot descriptions

Under each of these slots, a muted line says what the default resolves to with the current biome and terrain:

| Case | Text |
|---|---|
| Nature, soil, resource, season, organic crops and livestock | "{Biome menu label} list", e.g. "Savannah list", "Britain list", "Salt Marshes list" |
| Colonial nature, no biome | "Native placeholder until a biome is chosen" |
| Colonial soil, resource, season, no biome | "Britain list until a biome is chosen" |
| Landform and water | "{Biome} · {terrain menu label}", e.g. "Desert · Mountains", "Britain · Any terrain" |
| Colonial crops and livestock, default | "The incomers' own animals and crops (Britain list)" |
| Colonial crops and livestock, From the biome | "{Biome} list" (or "Britain list until a biome is chosen") |

The existing "Set – shown outside this tier" note still applies and is joined with " · ".

### 5.3 Resolution in the renderer

In `NameRenderer.fill`, for these slots when unset (or `kind: "biome"` where offered):

| Slot | Organic | Colonial |
|---|---|---|
| Five nature slots | `biome ?? BRITAIN` lists | biome lists; no biome → native placeholder (today) |
| Landform, water | `shortWords` for the terrain (§5.4) | the same; no biome → Britain's tagged built-ins |
| Soil, resource, season | `biome ?? BRITAIN` | `biome ?? BRITAIN` |
| Domestic animal, crop | `biome ?? BRITAIN` | default: Britain (incomers' own, today); `kind: "biome"`: `biome ?? BRITAIN` |

- **Seed stability.** With no biome and Any terrain, every one of these fills must make exactly today's RNG calls on today's lists. Britain's entries are today's `NAME_WORDS` entries in today's order, and the Britain path with Any terrain must go through today's `pickUniform`, not a weighted pick.
- Biome words that are not Britain's fill as word fills with `fuses: "no"` unless a pack table says otherwise (§9.3), take the "of the" form like other wildlife words, and are never adapted by a takeover pack.

### 5.4 Terrain words for landform and water

| Biome | Terrain Any | A chosen terrain |
|---|---|---|
| Britain (or none) | Today's built-in list, uniform (unchanged) | Built-ins tagged with that terrain (§2.2), uniform |
| Any other biome | Draw a terrain by `terrainWeights`, keeping only terrains that have short words of that kind, then a weighted short word | Weighted short words for that terrain |

A custom terrain with no short words of the needed kind falls back to the biome's `plains` short words, with the notice `“{terrain}” has no short {land/water} words; using the plains.`, shown once per batch.

---

## 6. The Land button and the generate views

### 6.1 The button

`src/landMenu.ts` exports one component used by every module below: an icon button (Lucide `mountain`) placed beside the guide button.

- **Tooltip:** "Land: {biome menu label} · {terrain menu label}", e.g. "Land: Homeland · Any terrain".
- **Active state:** `is-active` when the biome or terrain is not the module's default.
- **Menu** (Obsidian `Menu`): a disabled "Biome" item as a heading; the module's default; a separator; Britain; the 12 biomes; then, if any, a separator, a disabled "Your biomes" heading and the user's biome packs. Then a separator, a disabled "Terrain" heading, "Any terrain" and the available terrains. The current choices are checked. Modules that don't use terrain omit the terrain half.
- Choices are session-only, kept per module (and per part for the two colonial modules), like the existing tradition and context choices.
- The user's biome packs are read from the names folder when the menu opens (§9.5).

### 6.2 Where it appears

| Module | Biome default | Terrain | Notes |
|---|---|---|---|
| place names, Britain | Britain | yes | Drives `britishPlaceNamesRecipe(region, biome, terrain)` |
| place names, a world culture | Homeland | yes | §7. Hidden for cultures with no swappable lists (Egyptian) |
| exploration place names, empire expansion place names | Unknown country | yes | `colonialPlaceNamesRecipe(part, tradition, context, biome, terrain)` |
| tribal names | Homeland | yes | §11 |
| river names, New Land and Established | Unknown country | no | British setting: no Land button |

**Moving the biome.** The tribal names brief put the biome in the second box for tribal names, the two colonial modules and the colonial river settings. Move it into the Land menu and return the second box to how it was before that brief: hidden for tribal names and the colonial modules; the region for British rivers; hidden for colonial rivers.

### 6.3 Place names module

- Britain: the Land button sits beside the culture box. Region (second box) and biome are independent, so "the North" in "Desert" gives northern British naming habits in desert country.
- A world culture: the second box keeps its eras; the Land button works as §7 describes.
- Switching between Britain and a culture keeps each one's own land choice (session only).

### 6.4 History labels

Append " · {biome menu label in lower case}" when the biome isn't the module's default, then " · {terrain menu label in lower case}" when the terrain isn't Any:

- "british place names · North · desert · mountains"
- "world place names · Norse · Viking Age · tropical rainforest"
- "exploration place names · Spanish · contested frontier · tropical rainforest · rivers and lakes"
- "tribal names · Polynesian · britain · coasts · plain"

Labels with neither are unchanged, and `historySection` keeps matching by prefix.

---

## 7. World place names

### 7.1 Homeland biomes

Each culture gets a `homelandBiome` in `world-place-names.json`, used only when a terrain is chosen in Homeland mode:

| Culture | Homeland biome | Culture | Homeland biome |
|---|---|---|---|
| anglo-saxon | britain | slavic | temperate |
| norse | boreal | arabic-persian | desert |
| celtic | britain | indian | monsoon |
| roman | mediterranean | japanese | temperate |
| chinese | temperate | west-african | savannah |
| egyptian | desert | maya | rainforest |
| aztec | highland | korean | temperate |
| bantu | savannah | ethiopian | highland |

### 7.2 Swappable lists

Add a `biomeSwaps` block to the data. Each entry names a list (at culture or era level), what replaces it and which entries are kept.

| Culture | List (level) | Replaced by | Kept entries |
|---|---|---|---|
| anglo-saxon | wild | wild animals | – |
| anglo-saxon | bird | birds | – |
| anglo-saxon | tree | trees | – |
| anglo-saxon | plant | plants 60, crops 40 | – |
| anglo-saxon | domestic | livestock | – |
| anglo-saxon | water | short water | – |
| norse | animal | animal mix | – |
| norse | tree | trees | – |
| celtic | animal | animal mix | – |
| celtic | tree | trees | – |
| celtic | feature (era `saints`) | feature mix | – |
| roman | animal | animal mix | Eagle, Wolf |
| roman | peak (era `medieval`) | short land (mountains) | Mount |
| chinese | beast | animal mix | Dragon, Phoenix, Qilin, Golden Rooster, White Horse |
| chinese | feature (era `modern`) | feature mix | Gate, Bridge |
| chinese | water (era `modern`) | short water | – |
| aztec | animal | animal mix | – |
| aztec | plant | plants 40, crops 30, trees 30 | – |
| aztec | feature (era `mexica`) | feature mix | – |
| bantu | animal | animal mix | – |
| bantu | feature | feature mix | – |
| slavic | animal | animal mix | – |
| arabic-persian | animal | animal mix | – |
| arabic-persian | plant (era `persian`) | plants 50, trees 50 | Rose |
| indian | animal | animal mix | – |
| indian | plant (era `ancient`) | plants 50, trees 50 | Lotus, Basil |
| japanese | animal | animal mix | Dragon |
| japanese | feature | feature mix | Bridge, Field |
| west-african | animal | animal mix | – |
| west-african | tree | trees | – |
| west-african | feature | feature mix | Crossing |
| maya | animal | animal mix | – |
| maya | feature | feature mix | Plaza, Ballcourt, Causeway, Well |
| korean | animal | animal mix | Dragon |
| korean | feature | feature mix | Gate, Field |
| ethiopian | animal | animal mix | – |
| ethiopian | feature | feature mix | Market, Field |

Lists not named here (gods, saints, people, rulers, materials, adjectives, Markov sources, Chinese river and mountain names, Persian water) never change. The Egyptian culture has no swappable lists, so its Land button is hidden.

**Mixes:**

| Mix | Make-up |
|---|---|
| Animal mix | wild animals 40, birds 30, creatures 15, livestock 15 |
| Feature mix | short land 60, short water 40 |

### 7.3 How a swap works

- **Homeland, Any terrain:** no swaps; output identical to today, seed for seed.
- **Homeland, a chosen terrain:** only the `feature`, `water` and `peak` swaps apply (the lists that describe land and water), drawing short words from the culture's homeland biome for that terrain (Britain uses its tagged built-ins). Kept entries stay.
- **A chosen biome:** every swap applies. Short words come from the chosen terrain, or from a terrain drawn by `terrainWeights` for each fill when the terrain is Any.
- **Kept entries** stay at their original share: a list of *n* entries with *k* kept becomes the *k* kept entries (weight 1 each) plus one biome slot of weight *n − k*. A nested list such as anglo-saxon `animal` (`{domestic}`, `{domestic}`, `{wild}`) is left as written and picks up the swapped `domestic` and `wild`.
- **Form:** biome words become title case. Plurals follow the world engine's `Word|Plural` convention, with the plural from `pluralOf`, so `{animal:pl}` and `{animal:pos}` keep working ("Seven Hornbills", "Hornbill's Ford").
- `WorldOptions` gains `biome?: Biome` and `terrain?: string`. Swaps are built once per batch; all draws stay on the batch's single stream.

---

## 8. River names

### 8.1 People from tribal names

In the river names module, patterns containing `[tribal name]` (British setting) or `[native people]` (New Land and Established) fill those brackets from the tribal names engine.

| Setting | Tradition | Biome | Templates | Max words | Register | Perspectives | Group types |
|---|---|---|---|---|---|---|---|
| British | `celtic` | Britain | A 50, B 50 | 2 | plain | base weights | regional, settlement, kin |
| New Land, Established | chosen in the module (General by default) | the river's biome if set, else the tradition's homeland | A 40, B 40, F 20 | 2 | plain 70, administrative 30 | base weights with imposed ×3, neighbour ×2 | regional, settlement, kin, confederation |

- Tails never; hostile names never; a leading "The" removed. Use `tribalSlotFill` from the tribal names brief, extended with the fields above.
- Draws use the river batch's stream, immediately after the pattern is chosen, in left-to-right bracket order.
- The muted placeholder flag clears when no brackets remain. Other brackets (`[personal name]`, `[deity]`, `[monarch]`, `[holy person]`, `[earlier or district name]`) stay bracketed.
- **Seed stability:** with peoples set to Placeholder, output is identical to today.
- Results: "Hill Folk River", "River of the Hill Folk", "High Folk Water", "Salt Kin Creek".

**Control.** An options button (Lucide `sliders-horizontal`) beside the guide button in river names opens a `Menu`:

- "Peoples from tribal names" (checked by default) and "Peoples as placeholders": a radio pair.
- New Land and Established only: a separator, a disabled "Tradition" heading, then General and the 16 traditions in tribal names menu order, the current one checked.

Session only. The history label gains " · peoples as placeholders" only when that is chosen.

### 8.2 Native-sounding rivers in colonial recipes

When a colonial recipe has a native pack and its River or stream name slot is unset (River name module):

- Each river fill is a **native river** with probability 0.4: a whole name drawn from the native pack (as the native place name slot draws it) and returned as a name fill marked native, so the takeover pack adapts it exactly as it adapts native place names.
- Otherwise the river module fills it as today.
- The 0.4 draw uses the fill stream and happens only when a native pack is set, so recipes without one are unchanged.
- The constant lives in `NAMES` as `nativeRiverShare: 0.4`.

---

## 9. Biome packs (user-editable biomes and terrains)

### 9.1 What a biome pack is

A markdown file in the names folder that starts from a base biome and replaces whichever sections it lists. Everything it doesn't list comes from the base. It can change any list, any terrain's words and weight, and the shape multipliers, and it can add terrains of its own.

```markdown
---
type: biome
packName: Salt Marshes
setting:
based-on: temperate
phrase: the salt marshes
---

Low, tidal country of creeks, mudflats and grazing marsh.

## Terrain weights
- plains (15), coast (30), rivers (10), wetland (35)
- salt pans (10)

## Wetland: land
- Saltings, Mudflats, Grazing Marsh, Samphire Flats

## Wetland: short water
- creek, rill, fleet

## Salt pans: land
- Salt Pans, White Flats

## Salt pans: short land
- pan, flat

## Salt pans: shape groups
- industry-and-trade (2), wetland (1.5)

## Birds
- curlew, redshank, avocet, egret (2), marsh harrier, oystercatcher

## Shape groups
- woodland (0.2), upland-and-open-ground (0.3), wetland (2)
```

### 9.2 Frontmatter

| Key | Required | Meaning |
|---|---|---|
| `type: biome` | yes | Marks the file as a biome pack |
| `packName` | yes | Menu label |
| `based-on` | yes | A built-in id (`britain`, `temperate` …) or a link to another biome pack (`"[[Fen Country]]"`) |
| `phrase` | no | The sentence phrase. Default: "the " + `packName` in lower case, unless the name already starts with "the" |
| `universal-words` | no | `false` drops the universal terrain words (§2.3 and the tribal names brief's universal words). Default `true` |
| `setting` | no | As other packs |

The body text before the first heading is the biome's **guide** (tooltip and guide modal). Empty means "Based on {base menu label}."

### 9.3 Sections

Headings are matched case-insensitively. Lines use the word-list format (`parseWordList`): `-` lines of comma-separated words with optional `(weight)` tags, word-list tables (Modern, Plural, Traditional, Combining forms, Fuses), and, in word sections only, `//` pack lines.

| Heading | Sets | Also accepted |
|---|---|---|
| Terrain weights | Every terrain's weight; terrains left out get 0 (removed); new names add custom terrains | Terrains |
| {Terrain}: land | Land phrases for tribal names | separators ":", "-", "–" |
| {Terrain}: water | Water phrases | |
| {Terrain}: short land | Short land words (§2.3) | |
| {Terrain}: short water | Short water words | |
| {Terrain}: shape groups | That terrain's group multipliers (custom terrains only; built-in terrains keep §2.7) | |
| {Terrain}: shape generics | That terrain's generic multipliers (custom terrains only) | |
| Wild animals | wild animals | Wild animal |
| Birds | birds | Bird |
| Creatures | creatures | Fish and other creatures |
| Trees | trees | Tree |
| Plants | plants | Wild plant |
| Crops | crops | Crop |
| Livestock | livestock | Domestic animal |
| Lifeways | lifeways (weights renormalised) | |
| Sacred | sacred | |
| Materials | materials | |
| Ground | ground | Soil or ground |
| Resources | resources | Resource |
| Seasons | seasons | Season |
| Shape groups | the biome's group multipliers (ids or labels: "woodland" or "Woodland") | |
| Shape generics | the biome's generic multipliers | |

Rules:

- **A section replaces the base's section entirely.** A heading with nothing under it empties that list.
- `{Terrain}` is a built-in terrain's menu label or id ("Coasts", "coast"), or a custom terrain's name. A custom terrain must appear in Terrain weights; one that doesn't is ignored, with the problem `“{name}” has words but no weight in Terrain weights.`
- `-` line words fill with `fuses: "no"`; table rows keep their Fuses column, so a Britain-based pack can keep joining forms (*Brockford*).
- A `//` line in a word section draws a whole name from that pack when picked, used as an open, named word. The host resolves it to a draw function, as word lists do; a missing pack is skipped with a notice.
- Unknown headings are kept in the file, ignored, and listed in the problems.
- Bases chain to a depth of 5. A loop or a missing base gives the problem `Biome pack “{name}” can't find its base “{x}”; using temperate woodland.` and uses `temperate`.

### 9.4 The editor

The pack editor's second line gains a **Biome** button (Lucide `mountain`) after Word list.

- **Fields:** name (the existing name field); **Start from** (a dropdown: Britain, the 12 biomes, then the user's biome packs; default Temperate lands); **Phrase** (a text input whose placeholder shows the default phrase); the textarea.
- The textarea opens filled with `biomeToText(base)`: the whole base biome as pack text, so every list is there to edit. Changing **Start from** refills it if the text hasn't been edited since it was last filled; otherwise the text is kept and the status line says "Your edits are kept; sections you haven't changed come from the new base."
- **Save** writes only the sections that differ from the base (`diffAgainstBase`; sections compare as sets of word, weight and fuses, ignoring order and spacing), plus the guide text. Status: "Saved: {n} sections of your own; the rest comes from {base menu label}."
- **Editing an existing pack** opens with the base and the pack merged into full text, and saves differences again, as recipes do with templates.
- Saving never blocks. The status line lists problems: empty lists, terrains with weight but no words, unknown headings, missing bases or packs.
- Biome packs are treated wherever the code treats word-list packs (`type: word-list`) for listing, opening and editing, except that they are offered in biome menus rather than as slot sources.

`biomeToText`:

- Britain's built-in lists are written as word-list tables (reuse `starterTemplates.ts`'s `table()`).
- Every other list is written as `-` lines, 8 words per line, with `(weight)` where the weight isn't 1. Lifeways always show their weights.
- Sections are written in §9.3 order. Universal words are not written.

### 9.5 Loading

- The host scans the names folder for `type: biome` files when a biome menu opens and when a recipe that links one generates, caching by file modification time.
- It resolves each pack's base chain, merges, resolves `//` lines to draw functions, and builds a `Biome` with `custom: { path, base }`.
- Engines receive resolved `Biome` objects and never read the vault.
- In menus, user biomes are listed alphabetically by `packName`. In recipes they are linked (§4.1); in generate views the choice is held by file path for the session.

---

## 10. Tribal safeguard packs

- **File:** `type: tribal-safeguards`, with sections `## Block`, `## Flag` and `## Allow` of `-` lines. Any number of these files in the names folder all apply.
- **Merging:**
  - Block = built-in block list ∪ every pack's Block.
  - Flag = (built-in flag list ∪ every pack's Flag) − every pack's Allow.
  - An Allow entry matching a built-in block entry is ignored, with the notice `“{x}” is on the built-in block list and stays blocked.`
- **Switch:** frontmatter `flag-list-blocks: true` in any safeguard pack turns the flag list into a block list.
- **Engine:** `TribalOptions` gains `safeguards?: { block: string[]; flag: string[]; flagBlocks: boolean }`, merged by the host with `src/tribes/safeguardPacks.ts`.
- **Command:** "Create tribal safeguard list" writes `Tribal safeguards.md` to the names folder (never over an existing file). It contains the three headings, each followed by a one-line explanation as body text, so the user can see what each section does.

---

## 11. Tribal names changes

- **Biome menu** (now in the Land button): Homeland (default), Britain, the 12 biomes, and the user's biome packs.
- **Britain** in tribal names: nature words come from Britain's built-in lists (modern words, title case in names); everything else from `temperate`. Britain counts as a chosen biome, never a homeland, so homeland flavour words are off and homeland suppressions are lifted.
- **Terrain:**
  - A chosen terrain fixes every name's terrain: landscape and water words come only from it, and the gating thresholds (tribal names brief §3.8) use `{ [terrain]: 100 }`.
  - With Any, today's behaviour (biome weights × tradition terrain multipliers).
  - In Homeland mode with a chosen terrain, each name's homeland biome is drawn as now; the terrain is forced when that biome has it, and is Any for that name when it doesn't.
- **Custom terrains** count as `plains` for gating.
- **User biomes** behave like chosen built-in biomes. The transplanted-biome history sentence and the historicity line use the pack's phrase.
- **Safeguards** come from §10.
- **Tribal slot fills in recipes** (tribal names brief §20) receive the recipe's biome and terrain.

---

## 12. Milestones

Run `npm test` and `npm run build` at the end of every milestone; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M0 | **Snapshots.** Before changing any code, record seeded output to `tests/fixtures/land-snapshots.json`: british place names (seeds 1, 2, 3; All Britain, North, Wales; 20 names each); both colonial parts (3 seeds, General, no context); every world culture and era (seed 1, 20 names); river names, all three settings (3 seeds); and the existing recipe fixtures. Tribal names snapshots (General, Celtic, Polynesian; seeds 1, 2) are recorded at the end of M1 instead, because the terrain split changes them on purpose | Fixture committed |
| M1 | **Data and API** (§2), including the terrain split and renames (§2.0) and the matching updates to the tribal names brief's tests | §13.1 passes; tribal names snapshots recorded |
| M2 | **Environment layer and recipe schema** (§3, §4.1) | Snapshot regressions pass; §13.2 schema tests pass |
| M3 | **Two-choice slots, sentences and guide** (§4.2, §5) | §13.2 passes |
| M4 | **Land button and module wiring** (§6), including moving the biome out of the second box | Manual check in Obsidian: every module listed in §6.2 shows the button, choices persist when switching modules, and history labels match §6.4 |
| M5 | **World place names** (§7) | §13.3 passes |
| M6 | **River names** (§8) | §13.5 passes |
| M7 | **Biome packs** (§9), including menus and recipe links | §13.4 passes; manual check: create, edit and use a pack in a recipe and in each module |
| M8 | **Safeguard packs and tribal changes** (§10, §11) | §13.4 safeguard tests and §13.5 tribal terrain tests pass |
| M9 | **Docs and tidy-up.** README section on biomes, terrain and biome packs | Clean `npm test` and `npm run build` |

---

## 13. Tests

### 13.1 `tests/land.test.ts`

- `BRITAIN`'s lists are the `NAME_WORDS` category arrays: the same entries in the same order.
- Every built-in landform and water word has at least one terrain tag. Every terrain has at least one tagged landform and one tagged water word.
- Every biome in `BIOMES`: each terrain with weight above 0 has at least 2 short words (land and water, universal included); ground has at least 4 words, resources at least 4 and seasons at least 2.
- `terrainWeights(steppe, "mountains")` equals `{ mountains: 100 }`. `terrainWeights(b, "any")` sums to 100 for every biome.
- `availableTerrains(steppe)` contains neither `coast` nor `islands`.
- `environmentMultipliers(undefined, "any")` and `environmentMultipliers(BRITAIN, "any")` are `undefined`. `environmentMultipliers(desert, "mountains")` gives `groups["mountains-and-rock"]` = 4.5 and `generics.desert` = 5.
- `terrains.json` has the 9 entries of §2.7 in order.
- No biome in `biomes.json` has an `open` terrain. Every biome's terrain weights equal the §2.0 table and sum to 100.
- `availableTerrains(desert)` has no `forest`; `availableTerrains(temperate)` has all eight.
- Labels: `temperate` "Temperate lands", `steppe` "Steppe and grassland", `mediterranean` "Mediterranean lands", `highland` "Highlands", `moorland` "Moorland".
- `BIOMES.map(b => b.id)` equals the 12 ids in §2.0 order. Moorland meets the tribal names brief's minimum list sizes, and its lifeway weights sum to 100.
- `environmentMultipliers(moorland, "any").groups.woodland` = 0.15.
- `environmentMultipliers(temperate, "forest")` gives `groups.woodland` = 4 and `groups.clearings` = 3.

### 13.2 `tests/landSlots.test.ts`

- **Regression:** the M0 snapshots match for organic recipes with no biome and Any terrain, colonial recipes with unknown country and Any terrain, and fixture recipes using legacy settings (sources, built-in, placeholder) on the reduced slots.
- **Organic, desert, 2,000 names:**
  - no word appears that is in Britain's wild animal, bird, tree or wild plant lists and not in the desert's matching lists;
  - at least one desert nature word appears;
  - fewer than 1% of shapes are from the `woodland` group.
- **Organic, all of Britain, coast:** the share of `coast-and-sea` shapes is at least 3 times the Any-terrain share (2,000 shapes each, same seed).
- **Organic, all of Britain, Moorland, 2,000 shapes:** the `upland-and-open-ground` share is at least twice the Britain share, and the `woodland` share at most a quarter of it.
- **Organic, all of Britain, forest:** the share of `woodland` and `clearings` shapes together is at least 3 times the Any-terrain share; **hills:** the `hills-and-slopes` share is at least 2 times.
- **Landform:** with desert and mountains, it draws only from the desert's mountain short words plus the universal mountain words.
- **Domestic animal:** colonial default draws only from Britain's list; `kind: "biome"` with savannah draws only from savannah livestock.
- **Season:** with tropical islands it is never "winter".
- `slotChoices` matches §5.1 for every part.
- `wizardSentenceText` returns the 10 sentences of §4.2 exactly.
- **YAML:** `terrain: any` is never written; a biome link round-trips; an unknown terrain gives its problem.
- Feature "settlement" with the desert biome never throws.

### 13.3 `tests/worldBiomes.test.ts`

- Homeland with Any terrain matches the snapshots for every culture and era.
- For every culture with swaps × the 13 biomes (Britain and the 12), 500 names: no unresolved `{` token, and no empty name.
- Chinese with rainforest, 5,000 names: "Dragon" appears at least once (kept entries survive).
- Anglo-Saxon with desert, 2,000 names: no word from the original `wild` list appears unless it is also in the desert's wild animals.
- Egyptian: `cultureUsesBiomes("egyptian")` is false, and its output with any biome matches Homeland exactly.
- Norse, Homeland, mountains: only names from templates using `feature`, `water` or `peak` differ from the snapshot.
- `{animal:pl}` renders "Deer" for deer and "Hornbills" for hornbill.

### 13.4 `tests/biomePacks.test.ts`

- The §9.1 example parses to: terrain weights of plains 15, coast 30, rivers 10, wetland 35 and `salt-pans` 10, with hills, mountains, forest and islands removed; wetland land, wetland short water, birds and shape groups replaced; everything else from `temperate`.
- Heading aliases work ("Wild animal" fills wild animals; "Coasts: land" equals "coast: land").
- **Round trip:** for every built-in biome including Britain, `parseBiomePack(biomeToText(b))` deep-equals `b`.
- `diffAgainstBase` on `biomeToText(base)` with one section edited keeps exactly that section.
- A chain (A based on B based on desert) merges in order; a loop reports its problem and falls back to temperate.
- A `//` line produces a pack item; an empty section produces an empty list.
- **Safeguards:** a pack's Allow removes a flag-list entry; an Allow cannot remove a built-in block entry; a pack's Block adds an entry.

### 13.5 `tests/riverPeoples.test.ts`

- With peoples as placeholders, output matches the snapshots for all three settings.
- **British, peoples from tribal names, 2,000 names:** no `[tribal name]` remains; every filled people name has at most 2 words and never starts with "The".
- **New Land with savannah:** no `[native people]` remains.
- **Colonial recipe with a native pack fixture, 2,000 river fills:** native rivers make up between 30% and 50%; with a takeover pack fixture, at least one native river differs from its drawn form.
- **Tribal names, Polynesian, Britain, coast, 1,000 names:** every landscape or water result uses only coast words (Britain's inherited temperate coast phrases plus the universal coast words).

---

## 14. Parked

- Biome-specific generic word swaps (for example "moor" read as "plain" on the steppe), beyond the recipe's Generic words.
- Terrain for the river names module.
- Standalone terrain packs shared between biomes (terrains live inside biome packs for now).
- Biomes for name ageing and name takeover.
- Biome-flavoured Activity and Produce slots.
