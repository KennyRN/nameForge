# Coding brief: stellar names – scale, space vocabulary, star names, space routes and the Interstellar era

> [!summary] What this brief asks for
> 1. **One shared space vocabulary, tagged by scale.** The space lists every sci-fi module already draws (`spaceLand`, `spacePrefix`, `star` and friends) are rebuilt from the stellar lexicon review, and each word is tagged with the scales it belongs to.
> 2. **Five scales.** Planetary system (a planet and its moons), star system, local stellar neighbourhood, sector, and galaxy-spanning. A scale link appears where scale changes the answer: route names, realms and group names. The settlement kit sets the scale itself.
> 3. **Stellar place names in exploration and expansion.** Five built-in **space biomes**, one per scale, each with its own terrains and generics. Colonial naming traditions then name space exactly as they name new lands, still in English.
> 4. **An Interstellar era in world place names.** Every world culture gains an Interstellar era that names space its own way, in English: *Horizon of Ra*, *Thor's Ring*, *Sunny Side of the Moon*, *At the Fifth Point*.
> 5. **Real star-naming conventions.** Proper names, possessives (*Barnard's Star*), Bayer names (*Tau Ceti*), catalogue and survey numbers (*Gliese 581*, *Kepler-452*), and planet letters.
> 6. **Space routes by scale.** Route names gains scale-specific shapes, a faster-than-light link, surface routes on planets in the interstellar era, and space networks.
> 7. **Fixes and safeguards.** The *Eridani* bug, *Deep Deep*, a duplicated list, and a block list for franchise phrases (*Outer Rim*, *Kessel Run*, …).
>
> **No new modules.** Everything here enhances modules that already exist.
>
> **Fixed numbers throughout.** Where this brief gives a weight, use it. Do not tune or guess.

This brief builds on the **land brief** (biomes, terrains, custom terrains, the Land button), the **route names brief**, the **realms and polities brief**, the **group names brief** and the **ships and spacecraft brief**. All are already implemented. Cite this one in comments as `Stellar brief §n`.

The reasoning behind every word choice is in `docs/stellar-lexicon-review.md` (§0.1). Where this brief and the review differ, this brief wins.

Read the whole brief before starting. Work through the milestones in §14 in order. At the end of each milestone, run `npm test` and `npm run build`, then commit.

---

## 0. Decisions already taken

| Question | Decision |
|---|---|
| New modules | None. Space biomes, links and shapes extend existing modules |
| The five scales | Planetary system, star system, local stellar neighbourhood, sector, galaxy-spanning (§2) |
| What "planetary system" means | A planet and its moons. Astronomers use the phrase for a star's planets, so the guide text says so |
| Era gating | Near future offers planetary system and star system only; interstellar offers all five. Modules without an era (group names) offer all five |
| Where stellar place names live | Exploration and expansion, through five space biomes; in those modules the biome *is* the scale (§5). World place names, through a new **Interstellar** era for every culture (§12) |
| World place names era | Named **Interstellar**, to match the era label elsewhere. Added last, so every culture's default era and output are unchanged |
| Where the scale link lives | Route names and group names get a scale link. Realms gets the space biomes in its Land menu, because it already has one (§7). The settlement kit derives the scale from its position (§8) |
| Folk and formal forms | A space generic can carry a folk word and a formal form (*lobe* / *Roche lobe*). The existing plain / full / both output setting chooses between them |
| `[native place]` in space | Becomes a **catalogue name**: the place's "old name" is its survey designation, which the colonists keep, clip or replace (§5.7) |
| `[native people]` in space | A new **alien life** link. With no alien life (the default), the slot is dropped in exploration and becomes `[earlier settlers]` in expansion. With alien life, it renders `[alien people]` (§5.8) |
| Interstellar routes on planets | At planetary-system scale, ordinary routes come back: space 50, modern roads 25, railways 15, trade 5, sea 5 (§6.3) |
| Faster-than-light travel | A new link in route names only: any, none, jump points, gates, hyperspace lanes. FTL shapes only ever appear at neighbourhood scale and larger (§6.2) |
| Earthly borrowing in space lanes | 25% at planetary-system and star-system scale; 10% at the larger three (§6.5) |
| Franchise phrases | Exact phrases are blocked; single words stay (§10) |
| Earthly output | Unchanged, seed for seed, in every setting that isn't sci-fi |
| Sci-fi output | Will change, because the lists change. Update pinned test strings that depend on the old space lists, and say so in the commit message. Don't bend the engine to keep old strings |
| Language | All output in English. British spelling: *barycentre*, *harbour*, *disc* |

### 0.1 The reference document

Copy `stellar-lexicon-review.md` (supplied with this brief) into `docs/` unchanged. It is the reasoning behind the word lists, not a spec.

---

## 1. Codebase orientation

Follow the existing conventions:

- Obsidian-free engines with JSON data.
- One seeded `mulberry32` stream per batch.
- Tests under `node:test` through `npm test`.
- British English and OUP punctuation in all user-facing text.
- Sentence builders as plain segments with no Obsidian imports.

The sci-fi setting code is `"SF"`; the two future eras are `NF` and `IS`.

### 1.1 Files to add

| File | Purpose |
|---|---|
| `src/data/space.json` | Scale table, star-name lists and catalogue ranges, direction words, space fills for colonial categories, space safeguards (§2–§4, §5.6, §10) |
| `src/space/scale.ts` | `SpaceScale`, labels and phrases, era gating, any-scale weights, `scaleAllows(entry, scale)` (§2) |
| `src/space/stars.ts` | `drawStar`, `catalogueName`, `spokenCatalogue`, `planetLetter` (§4) |
| `src/space/safeguards.ts` | The space block list and its matcher (§10) |
| `tests/spaceScale.test.ts` | §15.1 |
| `tests/stars.test.ts` | §15.2 |
| `tests/spaceBiomes.test.ts` | §15.3 |
| `tests/spaceRoutes.test.ts` | §15.4 |
| `tests/worldInterstellar.test.ts` | §15.5 |

### 1.2 Files to change

| File | Change |
|---|---|
| `src/data/group-names.json` | Rebuilt `spaceLand`, `spacePrefix` and `star`; scale tags on `expPlace`, `cityWord` and `sfTown`; `coastWord` and `seaWord` read `spaceLand` (§3, §4.7) |
| `src/groups/engine.ts`, `src/groups/sentence.ts` | Scale option and link; `groupStar`; scale filtering in `pool` (§3.4, §9) |
| `src/data/biomes.json`, `src/biomes.ts` | Five space biomes with `space` and `scale` fields (§5.1–§5.3) |
| `src/data/colonial-shapes.json`, `src/colonialShapes.ts` | Space generic groups, live only under a space biome; space category rules (§5.4–§5.6) |
| `src/data/name-words.json` | Plain and full words for every space generic, in `colonialGenerics` (§5.4) |
| `src/colonialSentence.ts`, `src/colonialWording.ts`, `src/names/engine.ts`, `src/recipeEditor.ts`, `src/landMenu.ts` | Space biomes in the Land menu, the alien life link, space wording, catalogue and alien fills (§5.7–§5.9) |
| `src/data/route-names.json`, `src/data/settlement-vocab.json`, `src/routes/engine.ts`, `src/routes/sentence.ts` | Scale and FTL links, kind weights by scale, space shapes, fixed names, networks (§6) |
| `src/data/realms.json`, `src/realms/engine.ts`, `src/realms/sentence.ts` | Space biomes in the Land menu; form multipliers by scale (§7) |
| `src/settlement/kit.ts`, `src/settlement/context.ts` | A derived scale passed to routes, groups and realms (§8) |
| `src/data/vessels.json`, `src/data/street-names.json`, `src/data/building-names.json`, `src/data/settlement-vocab.json` | Smaller vocabulary passes (§11) |
| `src/data/world-place-names.json`, `src/world/engine.ts` | The Interstellar era for every culture, `@` space tokens, no swaps in space, `eraUsesLand` (§12) |
| `src/presets.ts`, `src/modal.ts` | New fields in presets and history labels (§13); the world Interstellar land clause (§12.3) |
| `README.md`, briefs | Docs (§16) |

---

## 2. Scales

### 2.1 The table

`src/space/scale.ts` exports `type SpaceScale = "Pl" | "Sy" | "Nb" | "Se" | "Ga"` and `type ScaleChoice = "any" | SpaceScale`. Labels, sentence phrases and tooltips live in `space.json`:

| Code | Menu label | Sentence phrase | Tooltip |
|---|---|---|---|
| `any` | Any scale | any scale | Names from every scale the era allows |
| `Pl` | Planetary system | a planetary system | A planet and its moons: surface, rings, moons and the orbits around them |
| `Sy` | Star system | a star system | One star or binary pair: belts, the frost line, the outer clouds and the edge of the star's wind |
| `Nb` | Local stellar neighbourhood | the local stars | The nearby stars and the clouds and bubbles between them |
| `Se` | Sector | a sector | A stretch of a spiral arm: nebulae, clusters, rifts and spurs |
| `Ga` | Galaxy-spanning | the galaxy | Arms, the core and bar, the disc, the halo and the voids beyond |

### 2.2 Era gating

`scalesFor(era)`:

| Era | Scales |
|---|---|
| `NF` near future | any, Pl, Sy |
| `IS` interstellar | any, Pl, Sy, Nb, Se, Ga |
| no era (group names) | any, Pl, Sy, Nb, Se, Ga |

If the era changes and the chosen scale is no longer offered, reset it to `any` without a notice, as other links do.

### 2.3 Any scale

There are two ways a module can treat "any scale":

- **Modules that only filter word lists** (group names, realms' "the stars", and every module without a scale link) use every word. No filtering is applied.
- **Route names** draws a scale for each name, because kinds and shapes depend on it. The weights are:

| Era | Pl | Sy | Nb | Se | Ga |
|---|---|---|---|---|---|
| `NF` | 50 | 50 | 0 | 0 | 0 |
| `IS`, or no era | 20 | 25 | 20 | 20 | 15 |

### 2.4 Scale tags on list entries

List entries gain an optional `sc` field: an array of scale codes. `scaleAllows(entry, scale)` follows these rules:

- No `sc` means the entry is valid at every scale.
- `any` allows every entry.
- Otherwise the entry is allowed only if its `sc` includes the scale.

Apply `sc` as a filter **after** the existing setting (`s`), era (`e`) and tone (`t`) handling, so tone weighting is unchanged.

If a filtered list comes back empty, fall back to the unfiltered list and add no notice. This should never happen with the data below, but it must not crash.

---

## 3. The shared space vocabulary

All entries below carry `"s": ["SF"]`. The `x` weights and `t` tones use the existing meanings.

### 3.1 `spaceLand` (folk region words)

This list replaces the current one. Kept words keep their current weights unless a new weight is given.

| Word | `x` | `sc` | `t` |
|---|---|---|---|
| Belt | 2 | Sy | |
| Rim | 2 | – | |
| Reach | 1 | – | |
| Drift | 1 | Sy Nb Se | |
| Halo | 1 | Sy Ga | |
| Ring | 1 | Pl Sy | |
| Verge | 1 | – | |
| Expanse | 0.5 | – | |
| Deep | 1 | – | |
| Void | 1 | Se Ga | grim |
| Core | 1 | Se Ga | |
| Spur | 1 | Nb Se Ga | |
| Gap | 1 | Pl Sy Se | |
| Shoals | 1 | Sy Nb | |
| Cluster | 1 | Se Ga | |
| Frontier | 1 | – | |
| Dark | 1 | Nb Se | grim |
| Lanes | 0.5 | Se | |
| Horizon | 1 | – | |
| Well | 1 | Pl Sy | |
| Saddle | 1 | Pl | |
| Arc | 1 | Pl | |
| Camp | 1 | Sy | |
| Chain | 1 | Sy | |
| Swarm | 1 | Sy | |
| Frostline | 1 | Sy | |
| Cloud | 1 | Sy Nb Se Ga | |
| Shell | 1 | Sy Nb | |
| Sheath | 1 | Sy | |
| Pause | 1 | Sy | |
| Shock | 1 | Sy | grim |
| Bow | 0.5 | Sy | |
| Tail | 0.5 | Sy | |
| Wake | 1 | Sy Nb | |
| Lobe | 1 | Sy | |
| Neck | 1 | Sy | |
| Bridge | 1 | Sy Ga | |
| Bubble | 1 | Nb | |
| Fluff | 0.5 | Nb | light |
| Hollow | 1 | Nb | |
| Wall | 1 | Nb Ga | |
| Stream | 1 | Nb Ga | |
| Wave | 0.5 | Nb | |
| Nebula | 1.5 | Se | |
| Pillars | 1 | Se | grand |
| Knot | 1 | Se | |
| Rift | 1.5 | Se | |
| Filament | 1 | Se Ga | |
| Arm | 2 | Ga | |
| Bar | 1 | Ga | |
| Disc | 1 | Ga | |
| Warp | 0.5 | Ga | strange |
| Sheet | 0.5 | Ga | |

### 3.2 `spacePrefix`

| Word | `x` | `sc` |
|---|---|---|
| Outer, Inner, Far, Near, Deep, Long, Silent | 1 | – |
| Northern, Southern, Eastern, Western | 0.5 | – |
| High, Low | 1 | Pl |
| Sunward | 1 | Sy |
| Coreward, Rimward, Spinward, Trailing | 1 | Se Ga |

**Prefix rule.** Wherever a prefix is joined to a `spaceLand` word, it must not repeat the word. Redraw the prefix up to 5 times; if it still matches, drop the prefix. This applies in the groups, realms, routes, inns and bynames engines. It fixes *Deep Deep* (and a future *Sunward Sunward*).

### 3.3 New lists

| List | Entries |
|---|---|
| `spaceDirection` | Pl: Upwell, Downwell, Polar, Equatorial · Sy: Sunward, Outward, Inward, Upwell, Downwell · Nb Se Ga: Coreward, Rimward, Spinward, Trailing |
| `stationDirection` | Spinward, Antispinward, Hubward, Rimward |
| `orbitAdj` (`sc` Pl) | High, Low, Polar, Equatorial, Parking, Long, Fast |
| `spaceHazard` | Sy: Shock, Pause, Sheath, Frostline, Corona, Neck · Nb: Bubble, Wall, Cloud · Se: Rift, Dark, Knot, Nebula · Ga: Bar, Void, Warp |
| `spaceGoods` (in `settlement-vocab.json`) | Today's seven, plus Nickel, Platinum, Deuterium (weight 1) |

Notes on the direction lists:

- In `spaceDirection`, a word listed under two scales (Upwell, Downwell) gets both scales in its `sc` tag.
- The direction lists are **direction tokens** for route networks (§6.7). Their compass orders are:
  - Pl: Upwell, Equatorial, Downwell, Polar
  - Sy: Sunward, Upwell, Outward, Downwell, Inward
  - Nb Se Ga: Coreward, Spinward, Rimward, Trailing
  - stations: Hubward, Spinward, Rimward, Antispinward

### 3.4 Lists that copy `spaceLand`

`coastWord` and `seaWord` currently copy `spaceLand` words into their SF entries. Change this:

- **`coastWord`:** delete its SF entries. When the setting is SF, it reads `spaceLand` (scale-filtered), so a single edit now changes both.
- **`seaWord`:** keep `Reaches` and `Worlds` as they are. Its `Belt` and `Rim` entries are deleted and come from `spaceLand` in the same way.

### 3.5 Scale tags on other existing lists

| List | Tags |
|---|---|
| `expPlace` SF | Deep Rim (–), Outer Belt (Sy), Far Drift (Sy Nb), Silent Reach (–), Kepler Gap (Sy), Inner Halo (Ga) |
| `expPlace` additions | Far Spur (Se), Coreward Reach (Ga), Bubble Rim (Nb), Dark Rift (Se), Trojan Camp (Sy), Long Wake (Sy) |
| `cityWord` SF | Moon (Pl); World, Station, Colony, Habitat untagged |
| `sfBody` | Untagged; used at Pl and Sy by route shapes (§6.4) |

---

## 4. Star names

### 4.1 Five kinds

| Kind | Source | Example |
|---|---|---|
| `proper` | the `star` list (§4.2) | *Vega* |
| `possessive` | real list 50%, invented 50% (§4.3) | *Barnard's Star*, *[person]'s Star* |
| `bayer` | Greek letter + constellation genitive (§4.4) | *Tau Ceti* |
| `catalogue` | catalogue prefix + number (§4.5) | *Gliese 581*, *Kepler-452* |
| `planet` | a catalogue name + planet letter (§4.6) | *Gliese 581 d* |

### 4.2 `star` (proper names)

- Keep today's list **except `Eridani`**, which is a genitive rather than a star. Delete it; *Epsilon Eridani* now comes from the Bayer kind.
- Add: Alphard, Alphecca, Hamal, Diphda, Menkar, Mirfak, Nunki, Sadr.

### 4.3 `starPossessive`

**Real names (50%), equal weights:** Barnard's Star, Kapteyn's Star, Luyten's Star, Teegarden's Star, Van Maanen's Star, Przybylski's Star.

**Invented names (50%):** `{person}'s Star`. Use the drawing module's own person token, so it honours that module's placeholders / invented setting. In modules with no person token, use the real list only.

### 4.4 `starBayer`

The Greek letter comes from the existing `greek` list. Alpha, Beta, Gamma, Delta and Epsilon have weight 3; every other letter has weight 1.

The constellation genitive is drawn from these, all weight 1:

> Andromedae, Aquilae, Arietis, Aurigae, Boötis, Cancri, Carinae, Cassiopeiae, Centauri, Cephei, Ceti, Cygni, Draconis, Eridani, Herculis, Hydrae, Indi, Leonis, Lyrae, Orionis, Pavonis, Persei, Scorpii, Tauri, Tucanae, Ursae Majoris, Virginis

### 4.5 `starCatalogue`

Draw a prefix by weight, then an integer uniformly from its range (inclusive).

| Prefix | Joiner | Range | Weight |
|---|---|---|---|
| Gliese | space | 1–1000 | 3 |
| Wolf | space | 1–1500 | 2 |
| Ross | space | 1–1000 | 2 |
| Lalande | space | 1000–50000 | 1 |
| Groombridge | space | 1–4000 | 1 |
| HD | space | 1000–250000 | 2 |
| HIP | space | 1000–120000 | 2 |
| LHS | space | 1–5000 | 1 |
| Kepler | hyphen | 1–2000 | 2 |
| K2 | hyphen | 1–400 | 1 |
| TOI | hyphen | 100–6000 | 1 |

Output looks like *Gliese 581*, *HD 40307*, *Kepler-452* and *TOI-700*. Numbers have no thousands separators.

### 4.6 Planet letters

`planetLetter(rng)` appends a space and a lower-case letter, drawn by weight:

| Letter | b | c | d | e | f | g | h |
|---|---|---|---|---|---|---|---|
| Weight | 5 | 4 | 3 | 2 | 1 | 1 | 0.5 |

The letter is only used where a star names a **world or a settlement**: `sfTown` (§4.7), and catalogue native names at Pl and Sy (§5.7). There, a catalogue star takes a letter 30% of the time.

### 4.7 Drawing a star

`drawStar(scale: ScaleChoice, rng, opts?)` picks the kind with these weights:

| Scale | proper | possessive | bayer | catalogue |
|---|---|---|---|---|
| any | 40 | 15 | 20 | 25 |
| Pl, Sy | 40 | 15 | 20 | 25 |
| Nb | 35 | 25 | 25 | 15 |
| Se | 25 | 10 | 20 | 45 |
| Ga | 40 | 0 | 10 | 50 |

Wiring it in:

- Every place that draws the `star` list today calls a single exported `groupStar(setting, scale, rng, opts)` in `src/groups/engine.ts`, which wraps `drawStar`. That covers the `{star}` tokens in group names, realms, routes, streets, buildings, inns, events and vessels.
- Modules with no scale pass `any`.
- **Do not** let `{star}–{star}` draw the same star twice. Redraw the second up to 5 times.

**`sfTown`.** The patterns become:

| Pattern | Weight |
|---|---|
| `{star}` | 35 |
| `{star} {starNumber}` | 15 |
| `{catalogueStar}{planetLetter?}` (letter 30%) | 10 |
| `{spaceLandPrefixed}` | 20 |
| `{brandRoot} Station` | 10 |
| `New {britishPlace}` | 10 |

### 4.8 The spoken form of a catalogue name

`spokenCatalogue(name)` gives the clipped form colonists would say aloud, for §5.7's *adapted* treatment:

- **Number read aloud, title case, hyphenated:**
  - 1–20: one word (*Seven*, *Twelve*).
  - 21–99: tens–units (*Twenty-Two*).
  - 100–999: the hundreds digit, then the last two as a pair (*581* → *Five-Eighty-One*; *507* → *Five-Oh-Seven*; *500* → *Five Hundred*).
  - 1000–9999: two pairs (*1132* → *Eleven-Thirty-Two*; *2000* → *Two Thousand*; *1005* → *Ten-Oh-Five*).
  - 10000 and up: read the last three digits only, by the 100–999 rule.
- **A planet letter, if present,** becomes a trailing word: *b* → *Bee*, *c* → *Cee*, *d* → *Dee*, *e* → *Ee*, *f* → *Eff*, *g* → *Gee*, *h* → *Aitch*. So *Gliese 581 d* → *Five-Eighty-One Dee*.

---

## 5. Space biomes in exploration and expansion

### 5.1 The five biomes

Add five biomes to `biomes.json`. Each has `"space": true` and a `"scale"` code. They are **built-in only**: biome packs may copy them (the existing pack flow), and a pack based on a space biome inherits `space` and `scale`.

| id | Label | Phrase | Scale | Guide |
|---|---|---|---|---|
| `planetary-system` | Planetary system | a planetary system | Pl | A planet and its moons: the surface, the moons, the rings and the orbits around them. (Astronomers use "planetary system" for a star's planets; here it means one planet's neighbourhood.) |
| `star-system` | Star system | a star system | Sy | One star or a binary pair: the inner system, the belts, the frost line and outer clouds, and the edge of the star's wind. |
| `local-stars` | Local stellar neighbourhood | the local stars | Nb | The nearby stars and the clouds, bubbles and stellar streams between them. |
| `sector` | Sector | a sector | Se | A stretch of a spiral arm: nebulae, star clusters, dark rifts and spurs. |
| `galaxy` | Galaxy-spanning | the galaxy | Ga | The arms, the core and its bar, the disc, the halo, and the voids beyond. |

**Where they appear.** Space biomes appear **only** in these places:

- the exploration and expansion Land menus, under a heading **Space**, after the earthly biomes;
- realms (§7);
- world place names' Interstellar era, where they are the only choices (§12.3).

**Where they don't.** They never appear in british place names, river names, tribal names, or world place names' other eras. A recipe or preset that somehow names one there falls back to that module's default, with the notice "Space biomes are for exploration, expansion and the Interstellar era."

Space biomes set `universalWords: false`, and supply their own `customTerrains` (§5.2).

### 5.2 Terrains

Each space biome's terrains are custom terrains in its own data. They carry no shape multipliers of their own: the raising is done by §5.5's group multipliers.

| Biome | Terrain id | Label | Phrase | Weight |
|---|---|---|---|---|
| planetary-system | `surface` | Surface | the surface | 30 |
| | `moons` | Moons | the moons | 25 |
| | `rings` | Rings | the rings | 20 |
| | `orbits` | Orbits | the orbits | 25 |
| star-system | `inner` | Inner system | the inner system | 20 |
| | `belts` | Belts | the belts | 25 |
| | `outer` | Outer system | the outer system | 25 |
| | `boundaries` | Boundaries | the edge of the system | 20 |
| | `binaries` | Binary stars | the binary stars | 10 |
| local-stars | `stars` | Nearby stars | the nearby stars | 35 |
| | `clouds` | Clouds | the clouds | 25 |
| | `bubbles` | Bubbles and shells | the bubbles and shells | 20 |
| | `streams` | Stellar streams | the stellar streams | 20 |
| sector | `nebulae` | Nebulae | the nebulae | 30 |
| | `clusters` | Clusters | the clusters | 25 |
| | `rifts` | Rifts | the rifts | 20 |
| | `spurs` | Spurs and filaments | the spurs and filaments | 25 |
| galaxy | `arms` | Arms | the arms | 30 |
| | `core` | Core | the core | 20 |
| | `disc` | Disc | the disc | 20 |
| | `halo` | Halo | the halo | 15 |
| | `voids` | Voids | the voids | 15 |

The wizard sentence reads, for example: *"General explorers in wild and unsettled space across the belts of a star system, with no alien life, naming any feature"* (§5.9).

### 5.3 Biome word lists

**`short.land`** gives the `landform` fills, by terrain, weight 1 each. **`short.water`** is empty for every space terrain.

**`land`** holds the tribal-style phrases. Realms reads these as `landPl` (§7). Weight 1 each.

| Terrain | `short.land` | `land` |
|---|---|---|
| surface | crater, ridge, basin, plain, rille, scarp | Craterlands, Dayside, Nightside, Twilight Band, Ice Plains |
| moons | moon, moonlet, crater, rift | Moons, Moonlets, Ice Moons |
| rings | ring, gap, arc, ringlet, spoke | Rings, Ring Gaps, Ring Arcs |
| orbits | well, saddle, node, point | High Orbits, Wells, Saddles |
| inner | corona, spot, flare | Corona, Inner Worlds, Flare Zone |
| belts | belt, gap, camp, swarm, chain | Belts, Trojan Camps, Swarms, Kirkwood Gaps |
| outer | frostline, cloud, disc, deep | Outer Worlds, Comet Cloud, Scattered Disc, Ice Giants |
| boundaries | shock, sheath, pause, bow, tail | Shocklands, Sheath, Pause, Bow, Tail |
| binaries | lobe, neck, bridge, bary | Lobes, Neck, Bridge |
| stars | star, pair, dwarf | Near Stars, Red Dwarfs, Pairs |
| clouds | cloud, fluff, globule, veil | Clouds, Fluff, Globules |
| bubbles | bubble, shell, hollow, wall | Bubble, Shells, Hollows, Wall |
| streams | stream, wave, group | Streams, Wave, Moving Groups |
| nebulae | nebula, pillar, knot, veil, dark | Nebulae, Pillars, Knots, Dark |
| clusters | cluster, nursery, association | Clusters, Nurseries |
| rifts | rift, gap, lane, void | Rifts, Dust Lanes, Dark Rift |
| spurs | spur, branch, fork, filament | Spurs, Branches, Filaments |
| arms | arm, spur, gap | Arms, Interarm Gaps |
| core | core, bar, bulge | Core, Bar, Bulge |
| disc | disc, warp, flare, rim, plane | Disc, Warp, Rim |
| halo | halo, stream, cloud, cluster | Halo, Streams, Satellite Clouds |
| voids | void, wall, sheet | Voids, Walls, Local Sheet |

Every space biome sets these lists:

| List | Value |
|---|---|
| `wildAnimals`, `birds`, `creatures`, `trees`, `plants`, `livestock`, `seasons` | empty |
| `crops` | algae, kelp, soy, rice, potato, wheat (Pl and Sy only; empty at Nb, Se, Ga) |
| `ground` | regolith, dust, ice, iron, basalt, carbon |
| `resources` | ice, water, helium, iron, nickel, platinum, deuterium, silicates |
| `materials` | Ice, Iron, Nickel, Carbon, Glass, Alloy |
| `lifeways` | Miners 14, Haulers 12, Pilots 10, Riggers 8, Salvagers 8, Prospectors 8, Hydroponic Growers 6, Engineers 6, Surveyors 6, Dock Hands 6, Traders 4 |
| `sacred` | Old Beacon, First Landing, Derelict, Wreck, Ice Shrine |
| `shapeMultipliers` | `{ groups: {}, generics: {} }` (§5.5 does the work) |

### 5.4 Space generic groups

Add these groups to `colonial-shapes.json` with:

- `"inherited": false`
- `"space": true`
- `"scale"` set
- `"terrain"`: the custom terrain that raises them
- `"side"`: `landscape`, or `settlement` for `space-settlement`
- `parts` `["2", "2a"]` on every generic

Add every generic's words to `name-words.json` `colonialGenerics` as `[plain, full]`. When only one word is given, the plain and full forms are the same. The existing plain / full / both setting renders them; e.g. *Kepler Lobe* / *Kepler Roche Lobe* / *Kepler Lobe (Roche Lobe)*, using whatever separator the setting already uses.

Generic weights within a group are equal.

| Group id | Scale · terrain | Generics: id → plain / full |
|---|---|---|
| `planet-surface` | Pl · surface | crater, basin, plain, ridge, terminator, twilight → twilight / twilight band, dayside, nightside, pole, sea → sea / mare |
| `planet-moons` | Pl · moons | moon, moonlet, shepherd → shepherd / shepherd moon |
| `planet-rings` | Pl · rings | ring, gap, division, arc, ringlet, spokes |
| `planet-orbits` | Pl · orbits | well → well / gravity well, hill → hill / Hill sphere, lagrange-point → point / Lagrange point, saddle, node, high-orbit → orbit / high orbit, roche-limit → limit / Roche limit |
| `system-inner` | Sy · inner | corona, spot → spot / starspot, prominence, flare → flare / flare zone, habitable-zone → zone / habitable zone |
| `system-belts` | Sy · belts | belt → belt / asteroid belt, trojan-camp → camp / Trojan camp, kirkwood-gap → gap / Kirkwood gap, resonant-chain → chain / resonant chain, swarm, family → family / asteroid family |
| `system-outer` | Sy · outer | frostline → frostline / frost line, comet-cloud → cloud / comet cloud, scattered-disc → disc / scattered disc, deep, reach |
| `system-boundaries` | Sy · boundaries | shock → shock / termination shock, sheath → sheath / astrosheath, pause → pause / astropause, bow → bow / bow shock, tail → tail / astrotail, wake, sphere → sphere / astrosphere |
| `system-binaries` | Sy · binaries | roche-lobe → lobe / Roche lobe, neck, bridge, barycentre → bary / barycentre, circumbinary-disc → disc / circumbinary disc |
| `neighbourhood-stars` | Nb · stars | star, pair → pair / binary pair, dwarf → dwarf / red dwarf |
| `neighbourhood-clouds` | Nb · clouds | cloud → cloud / interstellar cloud, fluff, globule → globule / Bok globule, veil |
| `neighbourhood-bubbles` | Nb · bubbles | bubble, shell, cavity, hollow, wall |
| `neighbourhood-streams` | Nb · streams | stream → stream / stellar stream, wave, moving-group → group / moving group, association → association / stellar association |
| `sector-nebulae` | Se · nebulae | nebula, dark → dark / dark nebula, pillars, knot, clump, veil, molecular-cloud → cloud / molecular cloud |
| `sector-clusters` | Se · clusters | cluster → cluster / open cluster, association → association / OB association, nursery → nursery / stellar nursery, h-two → region / H II region |
| `sector-rifts` | Se · rifts | rift, gap, dust-lane → lane / dust lane, void |
| `sector-spurs` | Se · spurs | spur, branch, fork, filament |
| `galaxy-arms` | Ga · arms | arm → arm / spiral arm, spur, interarm-gap → gap / interarm gap |
| `galaxy-core` | Ga · core | core, bar, bulge, central-zone → zone / central molecular zone |
| `galaxy-disc` | Ga · disc | disc → disc / galactic disc, warp, flare, rim, plane |
| `galaxy-halo` | Ga · halo | halo, stream → stream / stellar stream, bridge, satellite-cloud → cloud / satellite galaxy, globular → cluster / globular cluster |
| `galaxy-voids` | Ga · voids | void, wall, sheet, filament |
| `space-settlement` | all · – | station, habitat, colony, outpost, port, haven, anchorage, yard → yard / shipyard, dock, base, camp → camp / mining camp, relay, beacon, observatory, gate → gate / jump gate (Nb, Se, Ga only) |

### 5.5 Which groups are live under a space biome

Under a space biome, **only** these groups are live:

| Group | Base weight |
|---|---|
| that scale's space groups | 1 each |
| `space-settlement` | 1 |
| `territories` (land-territory, frontier-march, province-kingdom) | 0.5 |
| `military-and-administrative` (garrison-camp, frontier-post only) | 0.3 |
| `colonial-settlement` | Pl only: 0.5 |

Every other inherited and non-inherited group is weight 0. The other scales' space groups are always weight 0.

A chosen terrain multiplies its own group by **4**. Any terrain leaves every group at its base weight.

Outside a space biome, every `space: true` group is weight 0, so earthly output is unchanged.

**The feature link.** In a space biome, the "naming ‹any feature›" link offers:

- Any feature
- Settlement (`space-settlement`, `colonial-settlement`, `military-and-administrative`, `territories`)
- Landscape (the scale's space groups)
- each live group by label

Group labels are the group id in sentence case with the hyphens spaced: "Planet rings", "System belts", etc.

### 5.6 Category rules under a space biome

Apply these as an extra multiplier layer after the tradition and context multipliers. Categories not listed here are unchanged.

| Category | Multiplier | Fill |
|---|---|---|
| wild-animal, bird, fish-and-other-creatures, tree, wild-plant, domestic-animal, season, river-or-stream-name, water-or-wetland-feature | 0 | – |
| crop, produce | 1 at Pl and Sy, 0 at Nb, Se, Ga | the biome's `crops` |
| landform | 1.5 | the terrain's `short.land` (all terrains of the biome when Any) |
| soil-or-ground | 1 | the biome's `ground` |
| resource | 2 | the biome's `resources` |
| position-or-direction | 1 | `spaceDirection` filtered to the scale, 50%; the existing positional words (Outer, Inner, Upper, Far, Near, High, Low only), 50% |
| built-feature | 1 | `spaceBuilt`: dock, mast, array, dish, beacon, relay, yard, tether |
| activity | 1 | `spaceActivity`: Mining, Hauling, Salvage, Survey, Docking, Refuelling |
| distance-or-survey-mark | 2 | ordinals: First–Fifth at Pl (Lagrange numbering), First–Twelfth elsewhere; never miles |
| ship | 2 | unchanged |
| explorer-or-founder | 1.5 | unchanged |
| official-patron-or-sponsor | 1.5 | unchanged |
| homeland-place-name | 1.5 | unchanged (Earth places: *New Sheffield*) |
| native-place-name | 1 | a catalogue name (§5.7) |
| native-people-or-tribe | §5.8 | §5.8 |
| local-deity | §5.8 | §5.8 |
| supernatural-being | 0.5 | unchanged |

`spaceBuilt` and `spaceActivity` live in `space.json`.

### 5.7 Catalogue names in the native-place slot

`native-place-name` under a space biome draws a catalogue name:

- **Pl and Sy:** `catalogueName` plus a planet letter 30% of the time.
- **Nb, Se, Ga:** `catalogueName` only.

The existing native treatment split (adopted 50%, adapted 50%) applies, but it **bypasses the takeover engine**:

- **Adopted:** the catalogue name as drawn (*Gliese 581 d Colony*).
- **Adapted:** `spokenCatalogue` (*Five-Eighty-One Dee*). In fused shapes it never fuses; it is always spaced.

Recipes with a takeover pack set don't apply it to catalogue names.

**Native pack slots.** If a recipe maps the native-place slot to a native pack (`//` lines or a native pack setting), the pack still wins under a space biome. This is how a user gives aliens real-sounding place names.

### 5.8 The alien life link

Under a space biome, the exploration and expansion sentences gain a link after the land phrase: **"with ‹no alien life›"**, with the choices *no alien life* (default) and *alien life*.

| Slot | No alien life | Alien life |
|---|---|---|
| native-people-or-tribe, exploration (2) | weight 0 | `[alien people]` |
| native-people-or-tribe, expansion (2a) | `[earlier settlers]` | `[alien people]` |
| local-deity (2a) | weight 0 | `[alien god]` |
| native-place-name | catalogue name (§5.7) | catalogue name 50%, `[alien place]` 50% |

The new brackets follow the existing bracket rules: they are placeholders and can be mapped in the wizard like `[native people]`.

The link is saved on the recipe and the preset as `aliens: true|false`; absent means false. It is hidden, and ignored, under earthly biomes.

### 5.9 Space wording

Under a space biome:

- The exploration contexts read **"wild and unsettled space"**, **"space with a sparse, or weak, native presence"** and **"a contested frontier"**.
- The expansion contexts are unchanged.
- The land phrase is `{terrain phrase} of {biome phrase}` as today ("the belts of a star system"). With Any terrain it reads **"all of {biome phrase}"** ("all of a sector").

Add the space context phrases alongside `CONTEXT_PHRASES` in `colonialWording.ts`, keyed by the same context ids.

### 5.10 Traditions

Every colonial tradition, and General, works under a space biome with no data changes. §5.6 is the only multiplier layer added.

Add one guide line to the Land menu's Space heading tooltip:

> "Traditions name space as they named new lands: rulers, founders, sponsors, ships and homeland names."

---

## 6. Route names

### 6.1 The scale link

When the era is `NF` or `IS` **and** the kind is Any or Space lanes, add a scale link after the kind:

> "…‹space lanes› **across ‹any scale›** of the ‹interstellar› era…"

The choices are §2.2's for the era, using §2.1's phrases ("across a star system", "across the galaxy").

If the kind is anything else in `NF` or `IS`, the link is hidden and the scale is treated as **Pl**.

### 6.2 The faster-than-light link

When the era is `IS`, the kind is Any or Space lanes, **and** the scale is any, Nb, Se or Ga, add this after the world link:

> ", ‹with any faster-than-light travel›"

| id | Text |
|---|---|
| `any` (default) | with any faster-than-light travel |
| `none` | with no faster-than-light travel |
| `jump` | by jump points |
| `gate` | by gates |
| `hyper` | by hyperspace lanes |

Shapes tagged `ftl` (§6.4) are live only when the link is `any` or matches their tag. `none` removes all of them. Shapes without `ftl` are always live.

### 6.3 Kind weights by scale

`kindsOffered` and the kind draw take the scale:

| Era · scale | space | motor | rail | road | trade | sea |
|---|---|---|---|---|---|---|
| `NF` · Pl | today's `NF` weights unchanged (space 40, motor 30, rail 15, road 5, trade 5, sea 5) | | | | | |
| `NF` · Sy | 100 | 0 | 0 | 0 | 0 | 0 |
| `IS` · Pl | 50 | 25 | 15 | 0 | 5 | 5 |
| `IS` · Sy, Nb, Se, Ga | 100 | 0 | 0 | 0 | 0 | 0 |

- Pilgrim keeps its `fantasticEra` weight of 5 at Pl only.
- With "any scale", a scale is drawn per name (§2.3), then the kind from that scale's row.
- The kind menu offers every kind with a weight above 0 at **some** scale the era allows. This means the motor, rail, trade and sea kinds return to the `IS` menu.

### 6.4 Space shapes

Replace `shapes.space` with the table below.

- `sc` restricts a shape to scales.
- `ftl` marks an FTL shape.
- `e` keeps the existing era tags.
- Token notes:
  - `{spaceLand}` is scale-filtered.
  - `{sfBody}`, `{orbitAdj}`, `{spaceDirection}` and `{spaceHazard}` are §3's lists, scale-filtered.
  - `{town}` is `groupTown("SF")`.
  - `{star}` is `groupStar` at the drawn scale.

| Shape | `w` | `sc` | `e` | `ftl` | Example |
|---|---|---|---|---|---|
| `{orbitAdj} Transfer` | 15 | Pl | NF IS | | *Low Transfer* |
| `{sfBody} Shuttle` | 10 | Pl | NF IS | | *Europa Shuttle* |
| `{town}–{sfBody} Line` | 10 | Pl | NF IS | | *Arcturus–Titan Line* |
| `{town} Ladder` | 8 | Pl | NF IS | | *Meridian Ladder* |
| `{spaceDirection} Line` | 8 | Pl | NF IS | | *Upwell Line* |
| `Tether {greek}` | 6 | Pl | NF IS | | *Tether Gamma* |
| `{town} Loop` | 5 | Pl | IS | | *Vega Loop* |
| `{spaceDirection} Run` | 15 | Sy | NF IS | | *Sunward Run* |
| `{spaceLand} Haul` | 12 | Sy | NF IS | | *Belt Haul* |
| `{spaceHazard} Crossing` | 10 | Sy | NF IS | | *Pause Crossing* |
| `{spaceLand} Run` | 10 | Sy | NF IS | | *Frostline Run* |
| `{spaceGoods} Run` | 8 | Sy | NF IS | | *Ice Run* (existing shape) |
| `{spaceGoods} Cycle` | 8 | Sy | NF IS | | *Helium Cycle* |
| `{town}–{sfBody} Lane` | 8 | Sy | NF IS | | *Kestrel–Ceres Lane* |
| `{sfBody} Slingshot` | 6 | Sy | NF IS | | *Ganymede Slingshot* |
| `{star} Run` | 15 | Nb | IS | | *Barnard's Run* (§6.6) |
| `{star}–{star} Lane` | 15 | Nb Se | IS | | *Vega–Altair Lane* |
| `{star} Road` | 8 | Nb | IS | | *Tau Ceti Road* |
| `{spaceLand} Road` | 8 | Nb Ga | IS | | *Bubble Road* |
| `{spaceDirection} Lane` | 6 | Nb | IS | | *Coreward Lane* |
| `{spaceHazard} Passage` | 6 | Nb Se | IS | | *Rift Passage* |
| `{ordinal} Jump Route` | 8 | Nb Se | IS | jump | *Third Jump Route* |
| `{spaceLand} Corridor` | 12 | Se | IS | | *Rift Corridor* |
| `{spaceLand} Passage` | 10 | Se | IS | | *Knot Passage* |
| `{spaceDirection} Corridor` | 10 | Se | IS | | *Spinward Corridor* |
| `Gate Chain {greek}` | 8 | Se Ga | IS | gate | *Gate Chain Delta* |
| `{spaceLand} Hyperlane` | 6 | Se Ga | IS | hyper | *Nebula Hyperlane* |
| `{spaceLand} Trunk` | 12 | Ga | IS | | *Arm Trunk* |
| `{spaceDirection} Line` | 12 | Ga | IS | | *Spinward Line* |
| `{spaceDirection} Trunk` | 6 | Ga | IS | | *Coreward Trunk* |
| `Great {spaceDirection} Road` | 5 | Ga | IS | | *Great Rimward Road* |
| `{spaceDirection} Jump Line` | 6 | Ga | IS | jump | *Trailing Jump Line* |
| fixed | 10 | – | NF IS | | §6.6 |

`{spaceDirection} Line` appears twice, once at Pl and once at Ga, with different scale-filtered words. These are two separate entries.

### 6.5 Earthly borrowing

`spaceBorrow.share` becomes a table:

```json
"share": { "Pl": 0.25, "Sy": 0.25, "Nb": 0.1, "Se": 0.1, "Ga": 0.1 }
```

The borrowed kinds are unchanged.

### 6.6 Possessive star runs, and fixed names

**Possessive runs.** When `{star} Run` or `{star} Road` draws a possessive star, drop *Star*:

- *Barnard's Star* + Run → *Barnard's Run*
- *[person]'s Star* + Road → *[person]'s Road*

**Fixed names.** `routeFixed:space` becomes:

| Name | `sc` | `t` |
|---|---|---|
| The Long Haul | Sy | |
| The Dark Lane | Nb Se | grim |
| The Pilgrim Road | Nb Se | |
| The Quiet Lane | Nb Se | strange |
| The Narrows | Sy Se | |
| The Ladder | Pl | |
| The Long Fall | Pl | grim |
| The Shuttle | Pl | plain |
| The Ice Road | Sy | |
| The Crossing | Nb | |
| The Thread | Se | strange |
| The Spine | Se Ga | |
| The Long Run | Ga | |
| The Great Road | Ga | grand |
| The Coreward Road | Ga | |

### 6.7 Networks ("as one network")

These rules extend the existing network rules:

1. **Direction networks.** The §3.3 direction lists are direction tokens, so a shape with `{spaceDirection}` turns through its scale's compass order (*Sunward Run*, *Upwell Run*, *Outward Run*, …) under the existing direction rule. No new code beyond registering the tokens and their orders.
2. **Gate chains.** A network whose first shape is `Gate Chain {greek}` returns the chain, then its gates in order: *Gate Chain Delta*, *Delta Gate One*, *Delta Gate Two*, …, up to the count. Number words come from the existing `numberWord` list.
3. **Cycles.** A network whose first shape is `{spaceGoods} Cycle` names a closed circuit. It draws stops (`{sfBody}` 50%, `{town}` 50%), one more than the count, with no repeats, and returns legs in order: *Ceres–Vesta Cycle*, *Vesta–Halcyon Cycle*, …, closing *{last}–{first} Cycle* when the count allows. The first name in the batch is the circuit name, *Helium Cycle*. The legs fill the rest of the count.

---

## 7. Realms

### 7.1 Space biomes in the Land menu

In `NF` and `IS`, the realm Land menu lists the space biomes under a **Space** heading, after the earthly biomes. `NF` lists Planetary system and Star system only. Choosing one:

- sets the realm's scale to that biome's scale;
- replaces the identity lists with the space biome's `land` phrases (§5.3) as `landPl`, and empties `waterPl` and `waterSg`, so their shapes drop out;
- replaces `compassAdj` with `spaceDirection` filtered to the scale;
- filters "the stars" named-for (`spaceLand`, `spacePrefix`, `groupStar`) to the scale.

An earthly biome in `NF` or `IS` behaves exactly as today: a planet-bound realm with no scale multipliers.

If the era changes away from `NF`/`IS` while a space biome is chosen, reset the biome to the homeland.

### 7.2 Form multipliers by scale

These apply only under a space biome. Every form not listed is ×1.

| Form | Pl | Sy | Nb | Se | Ga |
|---|---|---|---|---|---|
| Planetary Union | 3 | 2 | 0.5 | 0.2 | 0.1 |
| Orbital Republic | 3 | 1.5 | 0.3 | 0.1 | 0 |
| City-State, Free City, Metropolitan Authority | 2 | 1 | 0.5 | 0.2 | 0.1 |
| Free Zone, Development Zone | 1.5 | 1.5 | 1 | 1 | 1 |
| System Hegemony | 0.5 | 3 | 1 | 0.3 | 0.1 |
| Colonial Authority | 1.5 | 1.5 | 1.5 | 1 | 0.5 |
| Interstellar Federation | 0 | 0.3 | 2 | 2 | 1.5 |
| Stellar Commonwealth | 0 | 0.5 | 2 | 1.5 | 1 |
| Sector Government | 0 | 0 | 1 | 3 | 1 |
| Hegemony | 0.5 | 1 | 1 | 1.5 | 2 |
| Empire | 0.5 | 1 | 1 | 1.5 | 3 |

A form whose final weight is 0 is not drawn. If the user has chosen a form that comes out at weight 0, keep the choice, and add the notice "{Form} is unusual at the scale of {phrase}."

---

## 8. Settlement kit

The kit derives a scale. There is no new link.

| Position (in `NF` or `IS`) | Scale |
|---|---|
| inland ("on a planet"), river ("on a river world"), coast ("on an ocean world") | Pl |
| crossroads ("on a station") | Sy |

It passes this scale to route names, group names and realms when it calls them. Outside `NF` and `IS`, nothing changes.

The consequence: a settlement on a planet in the interstellar era gets roads and railways again (§6.3), while a station keeps all space lanes.

---

## 9. Group names

When the genre is **sci-fi**, add a scale link after the genre link:

> "…‹sci-fi› groups **at ‹any scale›**…"

It offers all six choices, because groups have no era.

The scale filters:

- `spaceLand`
- `spacePrefix`
- `expPlace` SF
- `coastWord` via `spaceLand`
- `cityWord` SF
- `groupStar`

At any scale, nothing is filtered (§2.3).

The link is hidden for fantasy and modern, and the scale is ignored there. Series mode is unaffected.

Bynames, inns, events and buildings have no scale link. They draw at any scale and simply get the richer lists.

---

## 10. Space safeguards

`space.json` holds a block list of exact phrases.

**Matching.** Case-insensitive. A name is rejected if it **equals** a phrase, or **contains** it as whole words. Rejected names are redrawn under each module's existing redraw rules.

**Where it applies.** Merge the list into every block set that space words can reach: the groups' shared safeguards, routes, realms, vessels, inns, events, buildings and streets. It also applies to colonial and names-engine output under a space biome.

**User packs.** User safeguard packs can add to this list but cannot remove from it, matching the tribal block-list rule.

| Phrases |
|---|
| Outer Rim, Mid Rim, Inner Rim, Core Worlds, Deep Core, Wild Space, Unknown Regions, Kessel Run |
| Spinward Marches, Trailing Marches |
| Alpha Quadrant, Beta Quadrant, Gamma Quadrant, Delta Quadrant, Neutral Zone, Deep Space Nine, Deep Space 9 |
| Terminus, The Expanse, Mass Relay, Halo Array, Babylon 5, Babylon Five |

Single words (*Rim*, *Halo*, *Expanse*, *Core*) stay in the lists.

---

## 11. Smaller vocabulary passes

These are data-only unless stated otherwise.

### 11.1 Spacecraft and stations (`vessels.json` `space.station`)

Add these patterns. The existing ones stay at their weights.

| Pattern | `w` | Example |
|---|---|---|
| `{spaceLand} Station` | 10 | *Frostline Station* |
| `Ell-{lagrangeWord} Station` | 5 | *Ell-Five Station* |
| `{sfBody} Ring` | 8 | *Titan Ring* |
| `{spaceLand} Anchorage` | 5 | *Belt Anchorage* |
| `{star} Haven` | 5 | *Kapteyn's Haven* (possessives drop *Star*, as §6.6) |

`lagrangeWord` is One, Two, Three, Four or Five, with weights 1, 1, 1, 3, 3. The real-world interest is in L4 and L5.

### 11.2 Streets and districts (`street-names.json`)

- `scifiStreets`: replace `Spinward Walk` with `{stationDirection} Walk` (w 10). Add `{stationDirection} Concourse` (w 5) and `Hubward Lift` (w 5).
- `scifiDistricts`: replace `Spinward Sector` and `Antispinward Sector` with `{stationDirection} Sector` (w 20).

### 11.3 Buildings (`sciFiLandmark` in `settlement-vocab.json`)

Add, with `e` NF IS: Relay Mast, Beacon, Dock Ring, Ice Works, Refinery, Shipyard, Array, Tether Head, Ladder Foot.

### 11.4 Sacred places (`sacredLand`)

Add, with `e` NF IS: Comet, Star, Ring, Wreck, Beacon.

### 11.5 Events (`eventFixed:*`)

| Pool | Add |
|---|---|
| `eventFixed:war` | Belt War (`e` NF IS), Ring War (NF IS) |
| `eventFixed:collapse` | Gate Fall (IS, `t` strange) |
| `eventFixed:migration` | Great Crossing (IS) |

---

## 12. World place names – the Interstellar era

Every world culture gains a last era, **Interstellar** (id `interstellar`). In it, the culture names places in space its own way, written in modern English as the other eras are: *Horizon of Ra*, *Thor's Ring*, *Sunny Side of the Moon*, *Mother of Moons*, *At the Fifth Point*.

### 12.1 The name

Keep **Interstellar**:

- It is the era label nameForge already uses for the five-scale future, in route names, realms, streets and the settlement kit.
- It reads naturally in the sentence: "‹Norse› place names from the ‹Interstellar› era".

The era covers all five scales, planetary system included, exactly as the interstellar era does elsewhere. World place names has no near-future era, so it doesn't need one.

### 12.2 What changes for existing eras

- **Nothing.** Interstellar is added **last** in each culture's `eras`, so every culture's default era is unchanged.
- Existing output, presets and history labels are unchanged seed for seed.
- So are the group engine's world-name town pools, which use the default era.
- Cultures that had a single era (Norse, Bantu, West African, Maya, Korean, Ethiopian) now have two. So the sentence shows their era link, which reads "from the ‹Viking› era".

### 12.3 Land in the Interstellar era

In the Interstellar era, the sentence's land clause reads **"set in ‹all of space›"**. The Land menu offers:

| Choice | Effect |
|---|---|
| **all of space** (default) | Each name draws a scale by §2.3's interstellar weights (Pl 20, Sy 25, Nb 20, Se 20, Ga 15), then uses that scale's space biome with Any terrain |
| the five space biomes | That biome for every name; its terrains (§5.2) are offered as today's terrain link |

Rules for the Land menu in this era:

- **No earthly biomes and no Homeland.** Earthly biomes and Homeland aren't offered.
- **Reading the sentence:**
  - Any terrain reads "set in all of ‹a sector›".
  - A chosen terrain reads "set in ‹the belts› of ‹a star system›".
- **Land state:** kept under its own key, `world:interstellar`, shared by every culture. Switching culture keeps the scale.
- **The Egyptian exception:** Egyptian has no biome swaps, but it shows the Land clause in this era too. Replace the modal's `cultureUsesBiomes(culture)` check with `eraUsesLand(culture, era)`:
  - The Interstellar era always returns true.
  - Every other era returns `cultureUsesBiomes(culture)` as today.
- **Earthly biome saved in a preset:** if a preset or saved state sets an earthly biome with the Interstellar era, use all of space, with the notice "The Interstellar era is set in space."

This is the one exception to §5.1's "Where they don't": world place names offers space biomes in its Interstellar era only.

### 12.4 No biome swaps in space

In the Interstellar era, **no** `biomeSwaps` entry applies, era-tagged or not. Space biomes have no animals, trees or plants to swap in.

So the culture's own animals, trees, gods and saints stay as they are. They read as homeland words carried into space: *Raven Gap*, *Oak Ring*, *Place of Jaguars*.

Space words come only from the space tokens (§12.5).

### 12.5 Space tokens

Templates and list entries gain a third slot prefix, `@`, alongside plain slots and `#` Markov slots. Extend `parseTemplate`'s regex to `\{([#@]?)([\w-]+)(?::(pl|pos))?\}`.

A `@` slot is resolved by the engine from the name's scale and space biome. They are resolved per name, so "all of space" can vary the scale within a batch.

| Token | Source | Fusable | Example |
|---|---|---|---|
| `{@land}` | the biome's `short.land` (§5.3) for the chosen terrain; with Any, a terrain drawn by the biome's terrain weights (only terrains with words) | yes | Ring, Gap, Well, Nebula |
| `{@region}` | `spaceLand` filtered to the scale (§3.1) | yes, single words only | Belt, Reach, Drift |
| `{@hab}` | station words (below) | yes | Station, Haven |
| `{@resource}` | the biome's `resources` | yes | Ice, Helium |
| `{@ordinal}` | First–Fifth at Pl; First–Twelfth elsewhere | no | Fifth |
| `{@star}` | `drawStar` at the scale (§4.7) | no | Altair, Tau Ceti |
| `{@direction}` | `spaceDirection` filtered to the scale (§3.3) | no | Sunward, Coreward |

How the tokens render:

- Words are title-cased.
- `:pl` uses the world engine's plurals (`pluralise`, with `biomes.ts`'s irregular plurals first).
- `:pos` uses `possessive`, as other slots do.

**Station words** (`worldHab` in `space.json`):

| Word | Weight |
|---|---|
| Station | 3 |
| Habitat, Colony | 2 each |
| Outpost, Port, Haven, Anchorage, Yard, Dock, Base, Camp, Relay, Beacon, Observatory | 1 each |
| Gate | 1, at Nb, Se and Ga only |

**Etymology labels.** Add these to `labels`:

| Token | Label |
|---|---|
| `@land` | space feature |
| `@region` | space region |
| `@hab` | station word |
| `@resource` | resource |
| `@ordinal` | point |
| `@star` | star |
| `@direction` | direction |

**Outside the Interstellar era**, a `@` slot renders `[key]` and adds a notice, as an unknown list does today. No other era uses them.

### 12.6 The eras

Each era below lists its guide, its templates as `[template, weight]` and its era `lists`. Era lists override the culture's lists of the same name, as today. Where a list isn't given, the culture's own list is used.

Data entry rules:

- Enter the templates and lists exactly as given.
- Keep the `Word|Plural` and trailing `~` conventions.
- The `fuseChance` is the culture's own.

#### Anglo-Saxon

*Guide:* "Fused compounds carried into space: homeland words on rings, wells and gaps; owners' stations and new homes."

| Template | Weight |
|---|---|
| `{spec}+{@land}` | 10 |
| `{size} {spec}+{@land}` | 3 |
| `{name:pos} {@hab}` | 4 |
| `{name:pos} {@land}` | 3 |
| `New {place}` | 3 |
| `{place} {@hab}` | 2 |
| `{colour} {@region}` | 2 |
| `{saint:pos} {@hab}` | 2 |
| `{god:pos} {@land}` | 1 |
| `Home of {name:pos} People` | 1 |

Lists: `place`: `{spec}+{gen}`, `{spec}+{gen}`, `{colour}+{gen}`.

#### Norse

*Guide:* "Owners' steadings, god-shrines and blunt space words: gap, ring, well, belt."

| Template | Weight |
|---|---|
| `{name:pos} {farm}` | 7 |
| `{adj} {@land}` | 5 |
| `{god:pos} {@land}` | 4 |
| `{animal} {@land}` | 4 |
| `{god:pos} {holy}` | 2 |
| `{animal}+{@land}` | 2 |
| `{adj}+{@land}` | 2 |
| `Assembly {meet}` | 2 |
| `{status} {farm}` | 2 |
| `The {@land:pl}` | 1 |
| `{name:pos} {@region}` | 1 |

Lists:
- `farm`: Steading, Steading, Homestead, Hold, Shieling, Habitat, Toft
- `holy`: Shrine, Temple, Stone, Beacon, Ring
- `meet`: Ring, Station, Hall, Dock, Holm

#### Celtic

*Guide:* "Head-first naming carried into space: Church of, Cell of, Mouth of, Head of, Fort of."

| Template | Weight |
|---|---|
| `Church of {saint}` | 4 |
| `Fort of {god}` | 3 |
| `Mouth of the {@land}` | 3 |
| `Head of the {@land}` | 3 |
| `Cell of {saint}` | 2 |
| `Fort of the {animal:pl}` | 2 |
| `{adj} {@hab}` | 2 |
| `{@land} of {god}` | 2 |
| `Church of {saint} {prep} {@land}` | 2 |
| `{@land} of the {animal:pl}` | 2 |

Lists:
- `god`: Lugus, Belenus, Brigantia, Taranis, Epona, Sulis
- `saint`: Mary, David, Patrick, Columba, Brigid, Kentigern
- `prep`: in the, by the, beside the, above the, under the, across the

#### Roman / Italian

*Guide:* "Gods' harbours and shrines, emperors' colonies, forums of great men, and Lagrange points counted like milestones."

| Template | Weight |
|---|---|
| `Harbour of {god}` | 3 |
| `Forum of {person}` | 3 |
| `Colony of {emperor}` | 3 |
| `At the {@ordinal} Point` | 3 |
| `Shrine of {god}` | 2 |
| `{emperor:pos} {@hab}` | 2 |
| `Camp at the {@land}` | 2 |
| `Mouth of the {@land}` | 2 |
| `New {homeland}` | 2 |
| `Saint {saint}` | 1 |
| `{@land} of {person}` | 1 |

Lists:
- `god`: Jupiter, Juno, Minerva, Mars, Venus, Mercury, Apollo, Diana
- `person`: Julius, Claudius, Flavius, Livius, Cornelius, Sempronius, Appius, Aurelius
- `emperor`: Augustus, Tiberius, Claudius, Vespasian, Trajan, Hadrian, Antoninus, Severus
- `saint`: Lawrence, John, Mark, Peter, Paul, Michael, Angelo, Benedict
- `homeland`: Rome, Naples, Milan, Genoa, Venice, Turin, Florence, Palermo

#### Chinese

*Guide:* "Places named by position (the sunny side of the moon, sunward of the belt), by virtue and slogan, and frontier stations named as orders."

| Template | Weight |
|---|---|
| `{side} of the {@land}` | 4 |
| `{adv} {quality}` | 3 |
| `{verb} the {far}` | 3 |
| `{quality} {@hab}` | 3 |
| `{direction} Peace` | 2 |
| `{direction} Capital` | 2 |
| `{beast} {@land}` | 2 |
| `{slot} {@hab}` | 2 |
| `{material} Gate` | 1 |
| `Mount {mountain}` | 1 |
| `{quality} {@region}` | 1 |

Lists:
- `side`: Sunny Side, Shady Side, Sunward Side, North Side, South Side
- `direction`: `{@direction}`, `{@direction}`, Central, Northern, Southern, Eastern, Western
- `adv`: Long, Eternal, Lasting, Great, Universal, Continuing, Restored, Everlasting
- `verb`: Pacify, Pacify, Guard, Subdue, Calm, Secure, Hold
- `far`: Distant, Frontier, Far `{@region}`, Outer `{@region}`, Deep
- `slot`: Red Flag, Red Star, Liberation, Victory, Friendship, Unity, Vanguard, New Life

#### Egyptian

*Guide:* "Houses, horizons and seats of the gods on rings and moons; pharaohs' mansions; the gods' barques."

| Template | Weight |
|---|---|
| `House of {lord}` | 4 |
| `Horizon of {god}` | 4 |
| `{god:pos} {@hab}` | 3 |
| `Seat of {god}` | 2 |
| `{@land} of {god}` | 2 |
| `Mansion of {pharaoh}` | 2 |
| `{pair} and {pair}` | 2 |
| `Barque of {god}` | 2 |
| `Nome of the {sacred}` | 1 |
| `The {colour} Walls` | 1 |
| `{@land} of the {sacred:pl}` | 1 |

Lists: copy the Pharaonic era's `pharaoh`, `lord`, `sacred`, `pair` and `colour` lists unchanged.

#### Aztec

*Guide:* "Locative names in space: place of eagles, near the rings, in the navel of the moon, Tlaloc's well."

| Template | Weight |
|---|---|
| `Place of {animal:pl}` | 4 |
| `{animal} {@land}` | 3 |
| `Near the {near}` | 2 |
| `On the {@land}` | 2 |
| `In the Navel of the {celestial}` | 2 |
| `{god:pos} {@land}` | 2 |
| `Place of {plant:pl}` | 2 |
| `Where the {animal} {verb}` | 1 |
| `{peak} {@land}` | 1 |
| `Where {plant:pl} Abound` | 1 |

Lists:
- `near`: `{@land:pl}`, `{@land:pl}`, Sun, Stars, Ice, Moon
- `celestial`: Moon, Moon, Sun, Sky, Stars, Ring
- `verb`, `peak`: copy the Mexica era's lists unchanged

#### Bantu

*Guide:* "One invented people-name per batch feeds space, place and royal-station names, so a batch reads as one region."

| Template | Weight |
|---|---|
| `Land of the {#people}` | 4 |
| `{@region} of the {#people}` | 3 |
| `Place of the {#people}` | 3 |
| `Place of {event}` | 3 |
| `Royal Enclosure of {#ruler}` | 2 |
| `{#ruler:pos} {@hab}` | 2 |
| `{@land} of the {animal:pl}` | 2 |
| `At the {@land}` | 2 |
| `The {noun} That {verb}` | 1 |
| `{adj} {@land}` | 1 |
| `Grave of {#ruler}` | 1 |

Lists: `noun`: Smoke, Ice, Light, Star, Ring, Mist.

The culture's `people` and `ruler` Markov sources apply as they do now.

#### Slavic

*Guide:* "New towns and princes' possessives, tsars' glory on the frontier, and Soviet-style closed stations known by number."

| Template | Weight |
|---|---|
| `New {town}` | 3 |
| `{ideal} {@hab}` | 3 |
| `{prince:pos} {@hab}` | 2 |
| `Glory of {monarch}` | 2 |
| `Ruler of the {region}` | 2 |
| `{#hero:pos} {@hab}` | 2 |
| `{closed}-{num}` | 2 |
| `Red {red}` | 2 |
| `{material} {@hab}` | 2 |
| `Star Town` | 1 |
| `{animal} {@land}` | 1 |

Lists:
- `town`: Town, Station, Settlement, Habitat, Fort
- `region`: `{@region}`, `{@region}`, Stars, Frontier, East
- `closed`: Star Town, Ice Town, Ring Town, White Town, Salt Town, Iron Town
- `red`: Star, Ring, Dawn, Banner, Guard, Moon
- `monarch`, `material`: copy from the Imperial and Rus' eras unchanged
- `ideal`, `num`: copy from the Soviet era unchanged

Markov: copy the Soviet era's `hero` source unchanged.

#### Arabic & Persian

*Guide:* "Abodes of peace, mothers and fathers of things, gates of the stars; Persian gardens and kings' glory. Many star names are Arabic already."

| Template | Weight |
|---|---|
| `Abode of {abode}` | 3 |
| `Mother of {mother}` | 3 |
| `Gate of {gate}` | 3 |
| `Father of {father}` | 2 |
| `The {epithet}` | 2 |
| `Harbour of {person}` | 2 |
| `{king:pos} City` | 2 |
| `{plant} Garden` | 2 |
| `Camp of {person}` | 1 |
| `{day} Market` | 1 |
| `{@land} of {valley}` | 1 |
| `Glory of {king}` | 1 |
| `{num} {water}` | 1 |

Lists:
- `mother`: Moons, Rings, Wells, Stars, Springs, Gardens, Lights
- `father`: the Ice, the Rings, the Falcon, the Lion, the Stars
- `gate`: `{@star}`, `{@star}`, the Stars, the Sun, the Deep, Iron, Gold, Victory, Lamentation
- `valley`: Stones, Gold, Fire, Ice, Light
- `abode`, `epithet`, `person`, `day`: copy from the Arabic era unchanged
- `king`, `plant`, `num`, `water`: copy from the Persian era unchanged

#### Indian

*Guide:* "Gods' cities and abodes, sages' hermitages on lonely moons, the Unconquerable; founders' abodes and markets."

| Template | Weight |
|---|---|
| `{god:pos} City` | 3 |
| `City of {city}` | 3 |
| `The {epithet}` | 2 |
| `Abode of {god}` | 2 |
| `{sage:pos} Hermitage` | 2 |
| `{founder:pos} Abode` | 2 |
| `{raja:pos} {@hab}` | 2 |
| `{market} Market` | 2 |
| `{god:pos} {@land}` | 2 |
| `Between the {@land:pl}` | 1 |
| `{plant} Garden` | 1 |
| `{animal} City` | 1 |

Lists:
- `market`: Ice, Ore, Grain, Silk, Spice, Night
- `city`, `epithet`, `sage`, `plant`: copy from the Ancient era unchanged
- `founder`, `raja`: copy from the Modern era unchanged

#### Japanese

*Guide:* "Modifier first and generic last: Long Ring, Gap Mouth; auspicious names, gates of the kami, and suburban hopes."

| Template | Weight |
|---|---|
| `{adj} {@land}` | 8 |
| `{good} {@land}` | 4 |
| `{@land} Mouth` | 3 |
| `{animal} {@land}` | 3 |
| `Before {kami:pos} Gate` | 2 |
| `{pretty} {@hab}` | 2 |
| `{kami} {@land}` | 1 |
| `{number} {@land:pl}` | 1 |
| `{@hab} Front` | 1 |
| `Capital of {virtue} and {virtue}` | 1 |
| `Middle of the {@land}` | 1 |

Lists:
- `good`, `virtue`, `number`: copy from the Samurai era unchanged
- `pretty`: copy from the Modern era unchanged

#### West African

*Guide:* "Under the kapok tree, where the ring divides, Buktu's well, grove of Osun; towns of invented peoples, a batch at a time."

| Template | Weight |
|---|---|
| `{animal} {@land}` | 3 |
| `{person:pos} {@land}` | 3 |
| `Town of the {#people}` | 3 |
| `Under the {tree} Tree` | 2 |
| `Grove of {spirit}` | 2 |
| `{@region} of the {#people}` | 2 |
| `Where the {@land} {bend}` | 2 |
| `{market} Market` | 2 |
| `Beside the {@land}` | 2 |
| `{adj} {@land}` | 2 |
| `{@land} of {spirit}` | 1 |

Lists:
- `bend`: Bends, Widens, Divides, Narrows, Ends, Turns
- `market`: Salt, Gold, Ice, Ore, Night, Cloth

#### Maya

*Guide:* "Big water, wells of peoples, emblem kingdoms; colour-directions on rings and gaps; seats of the gods."

| Template | Weight |
|---|---|
| `{colourdir} {@land}` | 4 |
| `{emblem} Kingdom` | 3 |
| `Well of the {people}` | 2 |
| `{holyword} {@land}` | 2 |
| `{animal} {@land}` | 2 |
| `Place of the {animal:pl}` | 2 |
| `{number} Stones` | 2 |
| `Seat of {god}` | 2 |
| `Big {@land}` | 1 |
| `{number} {@land:pl}` | 1 |
| `{god:pos} {@land}` | 1 |

No era lists.

#### Korean

*Guide:* "Big Ring, Cauldron Moon, Ice Source; districts of virtue, and provinces that blend two districts."

| Template | Weight |
|---|---|
| `{adj} {@land}` | 6 |
| `{jvirtue} District` | 4 |
| `{shape} {@land}` | 3 |
| `{jvirtue}–{jvirtue} Province` | 3 |
| `{animal} {@land}` | 2 |
| `Temple of {buddhist}` | 2 |
| `Gate of {virtue}` | 2 |
| `{direction} {@region}` | 1 |
| `Sunward of the {@land}` | 1 |
| `{@resource} Source` | 1 |
| `{adj} Fortress` | 1 |

No era lists.

#### Ethiopian

*Guide:* "Mounts of light and of the saints, monasteries on far moons, churches cut from the rock; royal camps of the kings."

| Template | Weight |
|---|---|
| `Mount of {holy}` | 3 |
| `Mount of {saint}` | 3 |
| `{adj} {@land}` | 3 |
| `Monastery of {saint}` | 2 |
| `Church of {saint} in the Rock` | 2 |
| `New {new}` | 2 |
| `Royal Camp of {king}` | 2 |
| `{king:pos} {@hab}` | 2 |
| `Throne of {king}` | 1 |
| `Gate of {holy}` | 1 |
| `Place of the {animal:pl}` | 1 |

No era lists.

### 12.7 Engine changes

All of these are in `src/world/engine.ts`; there are no Obsidian imports.

- **`WorldOptions`** gains nothing new. The existing `biome` may now be a space biome, and `undefined` with the Interstellar era means all of space.
- **The renderer** keeps the batch's scale settings. Per name:
  - With all of space: draw a scale (§12.3) and take that scale's built-in space biome.
  - Otherwise: use the chosen biome.
  - Then resolve every `@` slot in that name from the result.
  - Draw the scale on the batch stream **before** the template, so batches stay seeded.
- **`buildSwaps`** returns early in the Interstellar era (§12.4).
- **`eraUsesLand(cultureId, eraId)`** is exported (§12.3).
- **Space safeguards.** The §10 safeguards apply to Interstellar output; a blocked name is redrawn under the existing attempt cap.
- **History** labels need no change: `worldHistoryLabel` already adds the era ("world place names · Norse · Interstellar"), and `landHistorySuffix` adds the space biome and terrain.

### 12.8 Presets

World presets already save the era and land. An Interstellar preset saves `era: interstellar` and the space biome id (or none for all of space). Nothing else is new. Existing preset notes are never rewritten.

---

## 13. Presets and history

### 13.1 Saved fields

| Module | New fields | Absent means |
|---|---|---|
| route names | `scale`, `ftl` | `any`, `any` |
| group names | `scale` | `any` |
| exploration, expansion (recipes and presets) | `aliens` | `false` |
| realms | none (the biome field already holds a space biome id) | – |

Existing preset notes are never rewritten.

### 13.2 History labels

When the scale isn't `any`, append the scale's menu label in lower case after the existing fields: e.g. *"route names · interstellar · … · star system"*.

When FTL isn't `any`, append its text: *"… · by gates"*.

---

## 14. Milestones

Commit at the end of each milestone, with `npm test` and `npm run build` passing.

1. **Vocabulary and stars.**
   - `space.json`, `src/space/scale.ts` and `src/space/stars.ts`.
   - §3 list rebuilds and tags, the prefix rule, `coastWord`/`seaWord`.
   - `groupStar` wired into every `{star}` reader.
   - `sfTown`, and §10's safeguards.
   - Tests §15.1–§15.2.
2. **Group names scale link** (§9).
3. **Route names** (§6), including networks and the FTL link. Tests §15.4.
4. **Space biomes** (§5): data, live-group gating, category rules, catalogue and alien fills, Land menu heading, wording, the alien life link in the wizard and both modules. Tests §15.3.
5. **World place names: the Interstellar era** (§12): `@` tokens, the 16 eras, the land clause and `eraUsesLand`. Tests §15.5.
6. **Realms and settlement kit** (§7–§8).
7. **Smaller passes** (§11) and **presets and history** (§13).
8. **Docs** (§16).

---

## 15. Tests

### 15.1 `tests/spaceScale.test.ts`

- `scalesFor("NF")` is any, Pl, Sy; `scalesFor("IS")` has all six.
- `scaleAllows`: no `sc` allows every scale; `any` allows every entry.
- An empty filtered list falls back without throwing.
- Every `spaceLand` and `spacePrefix` entry has valid `sc` codes, and every scale has at least 8 `spaceLand` words.
- The prefix rule: 2,000 seeded draws of prefixed space land never repeat a word (*Deep Deep*).

### 15.2 `tests/stars.test.ts`

- `star` no longer contains `Eridani`.
- Catalogue numbers fall within their ranges, and the joiners are right (*Kepler-452*, *Gliese 581*).
- `spokenCatalogue`:
  - *Gliese 581* → *Five-Eighty-One*
  - *Ross 507* → *Five-Oh-Seven*
  - *Kepler-1132* → *Eleven-Thirty-Two*
  - *HD 40307* → *Three-Oh-Seven*
  - *Wolf 22* → *Twenty-Two*
  - *Gliese 581 d* → *Five-Eighty-One Dee*
- Kind shares match §4.7 within ±3 percentage points over 10,000 seeded draws, at each scale.
- `{star}–{star}` never repeats a star.

### 15.3 `tests/spaceBiomes.test.ts`

- The five biomes exist with `space` and `scale`; their terrains match §5.2.
- They appear in the exploration and expansion biome choices under Space, and not in organic, river or tribal choices, or world choices outside the Interstellar era.
- Under a space biome, no generic from an earthly inherited group appears in 2,000 names.
- Outside a space biome, no space generic appears in 2,000 names.
- Earthly exploration and expansion output is unchanged seed for seed. Use the existing recipe regression fixtures.
- With no alien life:
  - Exploration never emits `[native people]` or `[alien people]`.
  - Expansion emits `[earlier settlers]` and never `[alien people]`.
- With alien life, `[alien people]` appears.
- Catalogue native names: the adapted form is the spoken form and never fuses.
- Plain / full / both renders *lobe* / *Roche lobe* correctly.
- The wizard sentence reads as §5.2's example.

### 15.4 `tests/spaceRoutes.test.ts`

- `IS` at Pl offers motor, rail, trade and sea. At Sy, only space lanes are drawn.
- Kind shares at `IS` · Pl are within ±3 points of §6.3.
- FTL `none`: no `ftl` shape appears in 5,000 names. FTL `gate`: no jump or hyperspace shape appears.
- No FTL shape ever appears at Pl or Sy.
- The borrowed share by scale is within ±3 points of §6.5.
- Possessive runs drop *Star*.
- Networks:
  - A gate-chain network gives *Gate Chain X*, then *X Gate One*, *X Gate Two*, ….
  - A cycle network's legs chain end to start.
  - A direction network follows the §3.3 order.
- Safeguards: *Kessel Run* and *Outer Rim* never appear in 20,000 seeded names across routes and groups.

### 15.5 `tests/worldInterstellar.test.ts`

- Every culture's last era is `interstellar`, and its first era is unchanged.
- Each culture's default-era output is unchanged seed for seed (the existing world fixtures).
- 2,000 seeded names per culture in the Interstellar era:
  - no `[` placeholder from an unknown list or `@` token;
  - no word from the culture's swapped biome lists replaced by a space word;
  - every name passes the space safeguards.
- With a chosen space biome and terrain, every `{@land}` word comes from that terrain's `short.land`.
- With all of space, the scale shares are within ±3 points of §12.3.
- A `@` token in an earthly era renders `[key]` with a notice.
- `eraUsesLand("egyptian", "interstellar")` is true; `eraUsesLand("egyptian", "pharaonic")` is false.
- Pinned examples (fixed seeds chosen by the implementer):
  - Anglo-Saxon fuses `{spec}+{@land}` (e.g. *Ravenwell*).
  - Roman yields *At the {ordinal} Point*, with First–Fifth only at planetary-system scale.

### 15.6 Existing tests

- Update any test that pins sci-fi strings from the old lists. List them in the milestone commit message.
- Every earthly test must pass untouched.

---

## 16. Docs

- `README.md`: the five scales; space biomes in exploration and expansion; the Interstellar era in world place names; the scale links; the FTL and alien life links.
- `docs/stellar-lexicon-review.md`: added (§0.1).
- Add a one-line dated note (16 October 2026) to §1 of:
  - `docs/route-names-brief.md`: scale, FTL and surface routes
  - `docs/realms-and-polities-brief.md`: space biomes and scale forms
  - `docs/group-names-brief.md`: scale link
  - `docs/land-brief.md`: space biomes
  - `docs/ships-and-spacecraft-brief.md`: station patterns
  - `docs/settlement-kit-brief.md`: derived scale
  - `docs/land-brief.md` (again): the Interstellar era in world place names and `eraUsesLand`
- Add this brief to `docs/` as `stellar-names-brief.md`.
- British English and OUP punctuation throughout.

---

## Out of scope

- **New modules.** None.
- **British place names, river names and tribal names:** no space biomes. World place names gets them in its Interstellar era only.
- **Earthly biomes in the Interstellar era** (naming a colonised, Earth-like planet's surface): not offered. Use the culture's ordinary eras with an earthly biome for that.
- **Catalogue and spoken-catalogue tokens in world place names:** not added. The culture names stand on their own.
- **Ageing link for relict names** (disc-era names surviving in a cleared system): parked.
- **Alien naming packs:** users can map a native pack to the native-place slot (§5.7); no built-in alien packs.
- **Spacecraft technology levels:** unchanged.
- **A scale link in bynames, inns, events, buildings or streets:** not added; they draw at any scale.
- **Demonyms:** still parked.
