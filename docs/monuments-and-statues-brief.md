# Monuments and statues – brief (first release)

**Status:** drafted for Kenny, 19 October 2026. Implement in the milestones of §16. Every weight, share and count below is fixed: don't tune or re-derive them.

**What it is:** a new urban module naming the monumental structures and statues of a settlement and its country – crosses, columns, obelisks, arches, statues, standing stones, tombs and mounds, memorials, follies and hill figures – for route names' 22 cultures and seven eras. It takes over buildings and landmarks' **Monuments and follies** kind, which is removed from buildings, and expands it. Monuments also give their names to the places around them (a statue of Wellington, a Wellington Roundabout), so the module feeds streets and districts, inns and the settlement kit.

Abbreviations, as elsewhere: **BL** buildings and landmarks (`docs/buildings-and-landmarks-brief.md`), **SD** streets and districts, **IT** inns and taverns, **SK** settlement kit, **RN** route names, **GN** group names, **UB** the urban brief.

---

## 0. Decisions

1. **Module:** `monuments and statues`, id `monumentNames`, in the urban group straight after buildings and landmarks.
2. **Icon:** the module takes the icon buildings and landmarks wears now (Font Awesome *monument*). Buildings gets a new SVG, which Kenny supplies in the Claude Code prompt.
3. **Buildings loses its monument kind.** Everything else in buildings is unchanged: with any remaining kind chosen, buildings gives identical names for the same seed (§14.1).
4. **Ten kinds** (§5), from crosses to hill figures, each with its own era weights.
5. **Built like buildings:** same cultures, eras, fantastic switch, regions, settings, tone, people and one-town series, on the shared settlement vocabulary.
6. **Every monument has a site name** (§8): the name the places around it take. Honorific monuments give their honouree (*Statue of Fenwick* → *Fenwick*); the rest give themselves (*the Leaning Obelisk* → *Leaning Obelisk*).
7. **What's named after it:** a sentence link that adds two nearby names to each monument (*Statue of Fenwick: Fenwick Roundabout, Fenwick Street*).
8. **Back-links:** streets, squares, districts, inns and the kit draw monuments from this module (§11–§12). The kit gains a Monuments section.
9. **English only,** invented names only: no real monuments, no real honourees (§13).

---

## 1. Module

### 1.1 Section

- **Label:** `monuments and statues`. **History name:** `MONUMENT_NAMES_HISTORY_NAME = "monuments and statues"`. Add it to the history-label → section lookup in `sections.ts`.
- **Urban line-up** (UB §1.1), top to bottom: settlement names · streets and districts · inns and taverns · buildings and landmarks · **monuments and statues** · settlement kit. Update `URBAN_SECTIONS` and the position comments.

### 1.2 Icons

| Icon | Id | SVG |
|---|---|---|
| Monuments and statues (new) | `ICON_MONUMENTS = "nameforge-monuments"` | the SVG `ICON_BUILDINGS` uses today (Font Awesome monument), moved across unchanged |
| Buildings and landmarks | `ICON_BUILDINGS = "nameforge-buildings"` (id kept) | **new**, supplied by Kenny in the prompt |

- `SECTION_ICONS.monumentNames` and the `monumentPreset` pack-type icon use `ICON_MONUMENTS`; buildings' entries keep `ICON_BUILDINGS`, which now draws the new SVG. Old buildings history entries show the new buildings icon.
- Add the new buildings icon's source and licence to `LICENCES - Third Party` if its set isn't listed already. Don't invent or substitute an icon: if none is supplied, stop and ask.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/monument-names.json` | kinds, settings, region effects, shapes, lists, sensitive rules, series, cap, safeguards (shaped like `building-names.json`) |
| `src/data/settlement-vocab.json` | the new pools of §4 (and the two buildings monument pools removed, §10) |
| `src/monuments/engine.ts` | `generateMonumentNames`, `monumentName` (back-links), `monumentNeighbours`, safeguards. No Obsidian imports |
| `src/monuments/sentence.ts` | the sentence, choices, resets, plain text, history label |
| `tests/monumentNames.test.ts` | §15 |

**Reuse buildings' machinery rather than copying it.** Where buildings' private helpers (the vocab pool filter, `fromPool`, `gnWord`, `creature`, `town`, `founder`, `renderPattern`, `shapeWeight`'s common checks, the series loop) are needed, move them into a shared module (e.g. `src/buildings/shared.ts`) used by both. Moving them must not change any buildings draw (§14.1).

---

## 2. The sentence

### 2.1 Shape

"‹Norman & British› ‹monuments and statues of any kind› of the ‹medieval› era, in a ‹realistic› world, ‹across all of Britain›, ‹anywhere›, ‹of any tone›, with ‹placeholders for› people and places, ‹on their own›, ‹each one separate›."

Built as segments like BL's sentence (`src/buildings/sentence.ts`).

### 2.2 Fields

| Field | Choices | Default | As |
|---|---|---|---|
| culture | route cultures, grouped | Norman & British | BL |
| kind | Any, then the kinds offered in the era (§5.1), by menu label | Any: "monuments and statues of any kind" | BL; chosen kind shows its plural |
| era | the seven route eras | medieval | BL |
| fantastic | realistic / fantastic (steam age: steampunk) | realistic | BL |
| region | all of Britain, then the 12 regions; British cultures only | all of Britain | BL |
| setting | the five inn settings | anywhere | BL |
| tone | any, grand, plain, grim, light, strange | any | BL |
| people | placeholders for / invented | placeholders for | BL |
| nearby | "on their own" / "with what's named after them" | on their own | new (§9) |
| series | "each one separate" / "as one town" | each one separate | BL |

### 2.3 Resets, plain text, presets

- A kind the era doesn't offer resets to Any. The region resets away from the British cultures. As BL §2.3.
- Plain text as BL (first letter capitalised, full stop).
- Presets: §14.5.

---

## 3. Vocabulary rules

As BL §3: all words come from `settlement-vocab.json` pools (with vocabulary packs), with the usual tags (`e`, `c`, `t`, `h`, `x`, `r`, `rx`). Monument words are plain modern English. A few long-established English monument words are kept where they're the ordinary English term for the thing (Barrow, Cairn, Howe, Low, Quoit, Mercat Cross, Stele, Obelisk, Belvedere); no other loanwords.

---

## 4. New pools (settlement-vocab.json)

### 4.1 Monument words, one pool per kind (`monumentWord:{kind}`, token `{mw}`)

Weight 1 unless given. "british" and "christian" are the existing culture groups.

| Kind | Entries |
|---|---|
| cross | Cross ×5 (christian); High Cross ×2 (christian, MD–EM); Preaching Cross (british, MD–EM); Market Cross ×2 (british, MD–EM); Butter Cross (british, EM); Mercat Cross ×3 (british, r SBL SLO SHH NSI); Wayside Cross (christian); Wheel Cross (british, rx COR ×3); Stump Cross (british, plain); Churchyard Cross (christian, MD–EM); Memorial Cross (christian, ST–MO) |
| column | Column ×4; Pillar ×2; Monument ×2 (EM on); Victory Column (EM on, grand); Memorial Column (ST–MO); Plinth (MO on, plain) |
| obelisk | Obelisk ×5; Needle ×2; Memorial Spire (ST–MO) |
| arch | Arch ×4; Gateway ×2; Triumphal Arch (roman ×3 AN; elsewhere EM on; grand); Memorial Arch (ST–MO); Memorial Archway ×3 (chinese, korean); Victory Gate (EM on; indian, arabic-persian ×2) |
| statue | Statue ×5; Equestrian Statue ×2 (AN, EM on; grand); Bust (EM on); Colossus ×2 (AN; elsewhere ×0.3; grand); Figure |
| stone | Stone ×5; Standing Stone ×3 (AN–MD); Stones ×2 (AN–MD); Stone Circle (AN); Stone Row (british, AN); Rune Stone ×2 (norse, MD); Picture Stone (norse, AN–MD); Cross-Slab (celtic, MD); Ogham Stone (celtic, AN–MD); Stele (egyptian, maya, ethiopian, chinese, korean, greek-byzantine); Boundary Stone (AN–ST, plain); Marker Stone (plain); Hoar Stone (british, AN–MD); Logan Stone (british, rx COR ×3, strange) |
| tomb | Barrow ×3 (AN–MD; british, norse, general); Long Barrow (british, AN); Cairn ×2 (AN–MD); Mound ×2; Burial Mound ×2 (chinese, japanese, korean, slavic, steppe); Tumulus (EM–ST); Howe (norse, rx NTH NSI ×2); Low (anglo-saxon, rx NTH EMD WMM ×2); Grave (british, AN–MD); Quoit (british, AN, rx COR ×3); Tomb ×2; Mausoleum ×2 (EM–MO; AN roman, greek-byzantine, egyptian); Pyramid (egyptian AN; british EM–ST ×0.5) |
| memorial | Memorial ×5; War Memorial ×3 (MO); Cenotaph ×2 (MO); Memorial Fountain (ST–MO); Drinking Fountain (ST); Clock Tower ×2 (ST–MO); Jubilee Clock (ST, british); Memorial Wall (MO on); Eternal Flame (MO on, grand) |
| folly | Folly ×5 (british, general); Tower ×3; Temple ×2; Ruin; Grotto; Rotunda; Prospect Tower; Hermitage ×0.5; Eyecatcher ×0.5; Belvedere ×0.5 |
| figure | – (figure shapes use their own pools, §4.3) |

### 4.2 Fixed names, one pool per kind (`monumentFixed:{kind}`, shape `{fixed}`)

As BL: the `{fixed}` shape's weight is the sum of its live entries.

| Kind | Entries |
|---|---|
| cross | Market Cross ×5 (british, MD–EM); High Cross ×2 (christian, MD–EM); Butter Cross (british, EM); Mercat Cross ×4 (british, r SBL SLO SHH NSI); Weeping Cross (british, strange); Stump Cross (british); White Cross; Queen's Cross (british, MD, grand) |
| column | the Monument (EM–ST); Jubilee Column (ST) |
| statue | the Fisherman (port ×3, light); the Miner (ST–MO); the Drover (country ×2); the Soldier (MO, grim); the Shepherd (country ×2); the Watcher (strange); the Weeping Woman (grim); the Sentinel (grand); the Old Man (light) |
| stone | Standing Stone ×3 (AN–MD); Long Stone ×2; Grey Stone; Hoar Stone (british, AN–MD); Logan Stone (british, rx COR ×3, strange); Boundary Stone (plain); Wishing Stone (strange); Oath Stone (AN–MD) |
| folly | Sham Castle (british, EM–ST, light); Sham Ruin (EM–ST); Sham Abbey (british, EM–ST, light); the Eyecatcher (EM–ST); the Pepperpot (british, light); the Grotto; Shell House (light); the Hermitage; Prospect Tower |
| figure | the Long Man ×2; the Giant ×2; the Old Man; the Hill Man; the Chalk Giant; Troy Town ×3 (maze); Mizmaze ×2 (maze); Turf Maze ×2; Walls of Troy; Shepherd's Race (light) |

### 4.3 Qualifiers and parts

| Pool | Token | Entries |
|---|---|---|
| `monumentQual` | `{monumentQual}` | Old ×3; Great ×2; High ×2; White ×2; Grey ×2; Black; Red; Golden; Marble; Bronze (EM on); Iron (ST on); Long; Tall; Little; King's; Queen's; Hoar (british, AN–MD); Broken (grim); Fallen (grim); Leaning (light); Crooked (light); Lonely (strange); Weeping (strange); Whispering (strange) |
| `monumentEvent` | `{event}` | Victory ×3 (grand); Peace ×2; Jubilee ×2 (EM on); Coronation (EM on, grand); Union (EM on); Deliverance (EM on); Liberty (EM on); Reform (ST); Founding ×2; Armistice (MO); Flood (grim); Great Fire (grim); Plague (grim); Famine (grim); Siege (grim); Storm (grim, port ×2); Lifeboat (ST–MO, port ×3) |
| `monumentFallen` | `{fallen}` | Fallen ×3 (grim); Drowned (port ×3, grim); Lost (strange); Miners (ST–MO); Fishermen (port ×3); Lifeboatmen (ST–MO, port ×3); Volunteers (ST–MO) |
| `monumentVirtue` | `{virtue}` | Concord ×2; Friendship ×2; Harmony; Liberty; Fame; Victory; Philosophy; Piety; Peace; the Muses |
| `statueMaterial` | `{material}` | Stone ×3; Bronze ×2 (AN, EM on); Marble (AN, EM on); Iron (ST on); Golden (grand); Brass (ST on, light) |
| `stoneFolk` | `{stoneFolk}` | Maidens ×2; Sisters ×2; Brothers; Pipers; Dancers; Ladies; Men; Kings; Sentinels (all british, AN–MD, strange) |
| `figureColour` | `{figureColour}` | White ×6; Red; Black ×0.5 (strange) |
| `figureBeast` | `{figureBeast}` | Horse ×6; Stag; Lion; Bull; Hound; Dragon ×0.5 |
| `junctionWord` | `{jw}` (§9) | Cross ×2 (MD–EM); Corner ×2 (EM on); Place (EM on); Square ×2 (EM on); Green (MD–ST, country ×2); Circus ×1.5 (ST–MO); Junction (ST–NF); Roundabout ×3 (MO–NF); Plaza (NF–IS); Concourse (NF–IS) |
| `steampunkMonument` | `{steampunkMonument}` | Clockwork Colossus ×2; Brass Titan; Aether Obelisk; Great Orrery; Lightning Spire; Engine Memorial (all ST, `h: true`) |
| `sfMonumentWord` | `{sfmw}` | Monument ×2; Stone; Obelisk; Marker |
| `sfRelic` | `{sfRelic}` | Old Lander ×2; First Rover; Last Rocket; Colony Bell |

Existing pools reused: `follyOwner` (moves from buildings' use to here, unchanged), `eastVirtue`, `buildingQual` is **not** used (monuments have `monumentQual`).

---

## 5. Kinds

### 5.1 Line-up and weights by era (kind Any)

| Key | Menu | Plural | Description | AN | MD | EM | ST | MO | NF | IS |
|---|---|---|---|--:|--:|--:|--:|--:|--:|--:|
| `cross` | Crosses | crosses | Market, preaching, high, wayside and memorial crosses | 0 | 15 | 12 | 6 | 3 | 1 | 1 |
| `column` | Columns and pillars | columns and pillars | Victory and memorial columns, pillars and plinths | 8 | 4 | 8 | 15 | 10 | 6 | 6 |
| `obelisk` | Obelisks and needles | obelisks and needles | Obelisks, needles and memorial spires | 6 | 1 | 4 | 12 | 8 | 4 | 4 |
| `arch` | Arches and gateways | arches and gateways | Triumphal arches, memorial archways and ceremonial gates | 8 | 3 | 6 | 12 | 8 | 5 | 5 |
| `statue` | Statues and figures | statues | Statues, equestrian figures, colossi and busts | 10 | 4 | 8 | 20 | 18 | 10 | 10 |
| `stone` | Standing stones and stelae | standing stones and stelae | Standing stones, stone circles, rune stones, stelae and milestones | 20 | 10 | 4 | 3 | 1 | 2 | 2 |
| `tomb` | Tombs and mounds | tombs and mounds | Barrows, cairns, mausolea and pyramids | 15 | 8 | 6 | 6 | 3 | 2 | 2 |
| `memorial` | Memorials and fountains | memorials | War and disaster memorials, cenotaphs, memorial fountains and clock towers | 2 | 3 | 6 | 15 | 20 | 12 | 12 |
| `folly` | Follies and eyecatchers | follies | Sham ruins, towers, garden temples and eyecatchers | 0 | 0 | 12 | 10 | 2 | 0 | 0 |
| `figure` | Hill figures and mazes | hill figures and mazes | Chalk and turf figures, turf mazes | 6 | 4 | 3 | 4 | 1 | 0 | 0 |

- As BL §5: a kind with no live shapes for the culture is weight 0 (so crosses need a christian culture, follies and hill figures need a British culture or General).
- **Folly** and **figure** kinds: British cultures (anglo-saxon, celtic, norman-british) and General only.
- In NF–IS, 50% of names in any kind that has sci-fi shapes come from them (§7.4).

### 5.2 Setting effects

| Setting | Multipliers |
|---|---|
| in a town | column ×2, statue ×2, memorial ×2, arch ×1.5, obelisk ×1.5, cross ×1.5, stone ×0.3, tomb ×0.3, folly ×0.3, figure ×0 |
| in the country | stone ×2, tomb ×2, folly ×3, figure ×3, column ×0.5, statue ×0.5, obelisk ×0.5, memorial ×0.5, arch ×0.3 |
| in a port | memorial ×2, statue ×1.5, column ×1.5, tomb ×0.5, folly ×0.5, figure ×0 |
| by the road | cross ×3, stone ×2, tomb ×1.5, memorial ×1.5, figure ×1.5, arch ×0.5 |

Pool entries tagged with a setting ("port ×3") use the inn settings' themes as BL does.

### 5.3 Region effects (British cultures only)

Kind multipliers by region, on top of era and setting. A region not listed is ×1.

| Kind | Multipliers |
|---|---|
| stone | COR ×3, SHH ×3, NSI ×3, WCY ×2, WAL ×2, NTH ×1.5, EAN ×0.5, SEA ×0.5 |
| tomb | NSI ×3, SHH ×2, COR ×1.5, WCY ×1.5 |
| cross | COR ×2, SLO ×1.5, SBL ×1.5 |
| figure | WCY ×3, SEA ×3; EAN, EMD, NTH, WMM ×0.5; COR, WAL, SBL ×0.3; SLO, SHH, NSI ×0.2 |

---

## 6. Supporting sources

As BL §6 (the `{town}`, `{founder}`, `{owner}`, `{patron}`, `{surname}`, `{holy}`, `{figure}`, `{god}`, `{deity}`, `{creature}`, `{colour}`, `{number}`, `{ordinal}`, `{ordinalWord}`, `{star}`, `{greek}`, `{discovery}`, `{n}` tokens behave exactly as in buildings), plus:

| Token | Placeholder | Invented |
|---|---|---|
| `{monarch}` | `[monarch]` | `routeFigure()` + a space + one of the culture's `personNames` (*King Edwin*, *Jarl Ketil*); shape weight 0 when the culture has no names |
| `{hero}` | `[hero]` | a GN surname for the surname cultures, else one of the culture's `personNames` |
| `{benefactor}` | `[benefactor]` | as `{hero}` |
| `{battle}` | `[battle]` | one `routePlace()` place name (the battle named after where it was fought) |
| `{event}`, `{fallen}`, `{virtue}`, `{material}`, `{stoneFolk}`, `{figureColour}`, `{figureBeast}`, `{steampunkMonument}`, `{sfmw}`, `{sfRelic}` | – | the pools of §4.3 |
| `{follyOwner}` | (its own `{surname}` gives `[surname]`) | `follyOwner` pool |
| `{fixed}` | – | `monumentFixed:{kind}` |
| `{mw}` | – | `monumentWord:{kind}`, limited by the shape's `mw` list where it has one |

`{discovery}` is BL's list; `{event}` here is `monumentEvent`, not BL's shorter list.

---

## 7. Shapes

Each shape has a pattern `p`, weight `w` and optional `e`, `c`, `t`, `h`, `sx`, `self` exactly as BL §8, plus `s`, its site pattern (§8). Weights are within the drawn kind.

### 7.1 Shared shapes (all kinds except figure)

| Shape | w | Eras | Cultures | Tone | Site `s` | Example |
|---|--:|---|---|---|---|---|
| `{town} {mw}` | 20 | all | all | plain | – | Saltgate Obelisk |
| `the {monumentQual} {mw}` | 20 | all | all | – | – | the Leaning Obelisk |
| `{monumentQual} {mw}` | 5 | all | all | – | – | Grey Stone |
| `{founder:poss} {mw}` | 8 | all | all | – | – | [founder]'s Column |
| `{mw} of {founder}` | 5 | all | all | grand | `{founder}` | Arch of [founder] |
| `{hero:poss} {mw}` | 10 | EM on | all | grand | `{hero}` | Fenwick's Column |
| `{monarch:poss} {mw}` | 8 | MD on | all | grand | `{monarch}` | King Edwin's Cross |
| `{surname} {mw}` | 6 | EM on | british, general | plain | – | Whitlock Obelisk |
| `{creature} {mw}` | 3 | all | all | – | – | Raven Stone |

`self` (SK §4) as BL: `{town} {mw}` names the settlement itself.

### 7.2 Kind shapes

| Kind | Shape | w | Eras | Cultures | Tone | Site `s` | Example |
|---|---|--:|---|---|---|---|---|
| cross | `{fixed}` | Σ | | | | | Market Cross |
| cross | `{holy:poss} Cross` | 10 | MD on | christian | – | – | Saint Osyth's Cross |
| cross | `{number} Crosses` | 3 | MD–EM | christian | strange | – | Three Crosses |
| cross | `{event} Cross` | 3 | ST–MO | christian | – | – | Victory Cross |
| column | `{event} Column` | 10 | EM on | all | – | – | Great Fire Column |
| column | `{battle} Column` | 8 | EM–MO | all | grand | `{battle}` | Brackley Column |
| column | `Column of {monarch}` | 6 | AN, EM–MO | all | grand | `{monarch}` | Column of King Edwin |
| column | `{fixed}` | Σ | | | | | the Monument |
| obelisk | `{event} Obelisk` | 8 | EM on | all | – | – | Jubilee Obelisk |
| obelisk | `{battle} Obelisk` | 5 | EM–MO | all | grand | `{battle}` | Holloway Obelisk |
| obelisk | `{monarch:poss} Needle` | 3 | ST | all | light | `{monarch}` | King Edwin's Needle |
| arch | `Arch of {monarch}` | 10 | AN, EM on | all | grand | `{monarch}` | Arch of King Edwin |
| arch | `{event} Arch` | 8 | EM on | all | – | – | Jubilee Arch |
| arch | `{battle} Arch` | 4 | EM–MO | all | grand | `{battle}` | Holloway Arch |
| statue | `Statue of {monarch}` | 15 | all | all | grand | `{monarch}` | Statue of Jarl Ketil |
| statue | `Statue of {hero}` | 15 | EM on | all | – | `{hero}` | Statue of Fenwick |
| statue | `Statue of {founder}` | 10 | all | all | – | `{founder}` | Statue of [founder] |
| statue | `Statue of {holy}` | 6 | MD on | christian | – | `{holy}` | Statue of Saint Anne |
| statue | `the {material} {creature}` | 10 | all | all | – | `{material} {creature}` | the Bronze Lion |
| statue | `Equestrian Statue of {monarch}` | 5 | AN, EM–ST | all | grand | `{monarch}` | Equestrian Statue of King Edwin |
| statue | `Colossus of {figure}` | 3 | AN | all | grand | – | Colossus of the King |
| statue | `{fixed}` | Σ | | | | | the Fisherman |
| stone | `{fixed}` | Σ | | | | | Long Stone |
| stone | `{number} Stones` | 8 | AN–MD | all | strange | – | Nine Stones |
| stone | `the {number} {stoneFolk}` | 6 | AN–MD | british | strange | `{number} {stoneFolk}` | the Seven Sisters |
| stone | `{owner:poss} Stone` | 8 | AN–MD | all | – | – | Ketil's Stone |
| stone | `{creature} Stone` | 5 | AN–MD | all | – | – | Eagle Stone |
| stone | `{town} Milestone` | 3 | EM–ST | british | plain | – (sx road ×3, self) | Saltgate Milestone |
| stone | `{number} Mile Stone` | 3 | EM–ST | british | plain | – (sx road ×3) | Four Mile Stone |
| tomb | `{owner:poss} {mw}` | 10 | AN–MD | all | – | – | Wada's Barrow |
| tomb | `Tomb of {founder}` | 10 | all | all | – | `{founder}` | Tomb of [founder] |
| tomb | `Tomb of {monarch}` | 8 | all | all | grand | `{monarch}` | Tomb of King Edwin |
| tomb | `{monarch:poss} Mausoleum` | 5 | EM–MO | all | grand | `{monarch}` | King Edwin's Mausoleum |
| tomb | `Giant's {mw}` | 4 | AN–MD | british | strange | – (`mw`: Grave, Cairn, Barrow, Quoit) | Giant's Grave |
| tomb | `{number} Barrows` | 3 | AN–MD | british | – | – | Seven Barrows |
| memorial | `{event} Memorial` | 15 | ST on | all | – | – | Lifeboat Memorial |
| memorial | `{town} War Memorial` | 10 | MO | all | plain | – (self) | Saltgate War Memorial |
| memorial | `{town} Cenotaph` | 5 | MO | all | grand | – (self) | Saltgate Cenotaph |
| memorial | `{benefactor} Memorial Fountain` | 6 | ST–MO | all | – | `{benefactor}` | Pell Memorial Fountain |
| memorial | `{benefactor} Memorial` | 5 | ST on | all | – | `{benefactor}` | Callow Memorial |
| memorial | `{event} Clock Tower` | 6 | ST–MO | all | – | – | Jubilee Clock Tower |
| memorial | `{town} Clock Tower` | 6 | ST–MO | all | plain | – (self) | Saltgate Clock Tower |
| memorial | `Memorial to the {fallen}` | 5 | ST on | all | grim | `{fallen}` | Memorial to the Drowned |
| memorial | `{town} Lifeboat Memorial` | 4 | ST–MO | all | – | – (sx port ×5, self) | Saltgate Lifeboat Memorial |
| folly | `{follyOwner:poss} {mw}` | 15 | EM–ST | british, general | light | – | Mad Thorne's Folly |
| folly | `{surname:poss} {mw}` | 10 | EM–ST | british, general | light | – | Fenwick's Tower |
| folly | `Temple of {virtue}` | 8 | EM–ST | british, general | grand | – | Temple of Concord |
| folly | `{fixed}` | Σ | | | | | Sham Castle |
| figure | `the {figureColour} {figureBeast}` | 25 | all | british, general | – | – | the White Horse |
| figure | `{town} White Horse` | 10 | all | british, general | plain | – (self) | Saltgate White Horse |
| figure | `{town} Giant` | 5 | all | british, general | strange | – (self) | Saltgate Giant |
| figure | `{town} Maze` | 5 | MD–ST | british, general | – | – (self) | Saltgate Maze |
| figure | `{fixed}` | Σ | | | | | Troy Town |

### 7.3 Culture shapes

Weight 15 each within their kind, all English. The two culture shapes buildings had for monuments (Chinese `Memorial Gate of {founder}`, Ethiopian `{founder:poss} Stele`) move here.

| Culture | Kind | Shapes | Eras |
|---|---|---|---|
| roman | arch | `Triumphal Arch of {monarch}` | AN–EM |
| roman | column | `Column of {monarch}` | AN |
| roman | statue | `Equestrian Statue of {monarch}` | AN |
| roman | tomb | `Mausoleum of {monarch}`, `Tomb of {founder}` (sx road ×3) | AN |
| roman | stone | `{ordinalWord} Milestone` (sx road ×3) | AN |
| greek-byzantine | column | `Column of {monarch}` | AN–MD |
| greek-byzantine | statue | `the {creature} of {town}` (grand) | AN–MD |
| greek-byzantine | stone | `Stele of {founder}` | AN |
| egyptian | obelisk | `Obelisk of {figure}`, `Needle of {god}` | AN |
| egyptian | statue | `Colossus of {figure}`, `Avenue of {creature:pl}` | AN |
| egyptian | tomb | `Pyramid of {figure}`, `Tomb of {figure}` | AN |
| egyptian | stone | `Stele of {figure}` | AN |
| chinese | arch | `Memorial Gate of {founder}` (from BL), `Memorial Archway of {founder}`, `Archway of {eastVirtue}` | all |
| chinese | stone | `Tortoise Stele of {founder}` | AN–ST |
| chinese | statue | `Stone {creature:pl}` | AN–EM |
| chinese | tomb | `Mound of {figure}` | AN–MD |
| japanese | tomb | `Keyhole Mound of {founder}` | AN |
| japanese | stone | `{town} Memorial Stone` | MD on |
| japanese | memorial | `Monument to {hero}` | EM on |
| korean | stone | `Tortoise Stele of {founder}` | AN–ST |
| korean | arch | `Red Gate of {founder}` | EM–ST |
| korean | tomb | `Burial Mound of {founder}` | AN–MD |
| indian | column | `Pillar of {figure}`, `Victory Pillar of {founder}` | AN–MD |
| indian | arch | `{town} Gateway`, `{event} Gate` | EM–MO |
| indian | tomb | `Cenotaph Pavilion of {founder}` | MD–ST |
| arabic-persian | tomb | `Tomb Tower of {founder}` | MD–EM |
| arabic-persian | arch | `{event} Gate` | EM–ST |
| arabic-persian | column | `Column of {figure}` | AN |
| norse | stone | `{owner:poss} Stone` ×2, `Rune Stone of {town}`, `{owner:poss} Stone Ship` | AN–MD |
| norse | tomb | `{owner:poss} Mound` | AN–MD |
| anglo-saxon | cross | `{owner:poss} Cross` | MD |
| anglo-saxon | tomb | `{owner:poss} Low`, `{owner:poss} Barrow` | AN–MD |
| celtic | cross | `{holy:poss} High Cross` | MD |
| celtic | stone | `Ogham Stone of {founder}` | AN–MD |
| celtic | tomb | `{owner:poss} Cairn` | AN–MD |
| norman-british | cross | `{monarch:poss} Cross` (grand) | MD |
| norman-british | memorial | `{town} Jubilee Clock` (self) | ST |
| slavic | column | `Column of {monarch}` | EM–ST |
| slavic | memorial | `Monument to {hero}` | ST–MO |
| slavic | cross | `{town} Wayside Cross` | MD–ST |
| slavic | tomb | `Burial Mound of {founder}` | AN–MD |
| steppe | stone | `Stone Man of {town}`, `{creature} Stone` | AN–MD |
| steppe | tomb | `Mound of {figure}` | AN–MD |
| ethiopian | stone | `{founder:poss} Stele` (from BL), `Great Stele of {town}`, `Stone Throne of {founder}` | AN–MD |
| ethiopian | obelisk | `Obelisk of {town}` | AN |
| bantu | column | `{bird} Pillar` (`{bird}`: GN bird list) | AN–MD |
| bantu | tomb | `Royal Grave of {founder}` | AN–EM |
| west-african | stone | `{town} Stone Circle` | AN–MD |
| west-african | column | `Memorial Pillar of {founder}` | MD–ST |
| west-african | tomb | `Grave Mound of {founder}` | AN–MD |
| aztec | stone | `Stone of the {creature}`, `Stone of {number} {creature}` | AN–MD |
| maya | stone | `Stela {n}` ×2, `Stela of {founder}`, `Great {creature} Stone` | AN–MD |

Polynesian and Andean have no culture shapes (§13.4).

### 7.4 Era shapes

**Steampunk** (ST, `h: true`), kinds as given:

| Shape | w | Kind |
|---|--:|---|
| `{steampunkMonument}` | 10 | statue |
| `{town} {steampunkMonument}` | 10 | statue (self) |
| `{surname} {steampunkMonument}` | 5 | statue |

**Fantastic** (AN–EM, `h: true`):

| Shape | w | Kind | Tone |
|---|--:|---|---|
| `the Petrified {creature}` | 5 | statue | strange |
| `the Sleeping Giant` / `the Drowned King` / `the Stone Knight` (fixed, `monumentFixed:statue` with `h: true`) | 2 each | statue | strange |
| `the {quality} Obelisk` (`{quality}`: GN quality list) | 5 | obelisk | strange |
| `{creature:poss} Cairn` | 4 | tomb | grim |
| `Barrow of the {figure}` | 4 | tomb | grim |
| `Statue of {deity}` / `Colossus of {deity}` | 5 / 2 | statue | grand |

The deity shapes follow BL's deity rules exactly (Deities back-link in the BL brief): never the sensitive cultures; christian cultures only with fantastic on, at weight 3.

**Sci-fi** (NF–IS), 50% share within any kind that has one:

| Shape | w | Kind |
|---|--:|---|
| `{discovery} Memorial` | 10 | memorial |
| `{town} Founders' Memorial` | 8 | memorial (self) |
| `Memorial to the {ordinalWord} Crew` | 6 | memorial (grim) |
| `the Wall of Names` | 3 | memorial (grim) |
| `the Eternal Beacon` | 3 | memorial (grand) |
| `First Landing {sfmw}` | 8 | stone |
| `{star} Monolith` | 10 | stone |
| `Monolith {greek}` | 8 | stone |
| `Statue of the Unknown Colonist` | 3 | statue |
| `the {sfRelic}` | 4 | statue (light) |
| `Plinth {n}` | 4 | column (plain) |
| `{discovery} Arch` | 4 | arch |

---

## 8. Site names

Every result carries `site`, the name places around the monument take (§9, §11, §12).

- A shape with `s`: the site is that pattern, rendered with **the same token values** the name drew (*Statue of Fenwick* → *Fenwick*; *Statue of [hero]* → *[hero]*).
- A shape without `s`: the site is the name itself without a leading "the" (*the Leaning Obelisk* → *Leaning Obelisk*; *Market Cross* → *Market Cross*).
- **District-worthy:** a site is district-worthy when the shape has no `s`, the name has no " of " and the site is 3 words or fewer. Only district-worthy sites can stand alone as a district (§9).
- `MonumentName` gains `site: string` and `districtWorthy: boolean` alongside BL's fields (`text`, `kind`, `shape`, `source`, `tones`, `words`, `uses`).

---

## 9. What's named after it

With **nearby** set to "with what's named after them", each monument gets **two** nearby names, of two different kinds, drawn from the neighbour shapes below. They render after a colon: *Statue of Fenwick: Fenwick Roundabout, Fenwick Street*.

### 9.1 Neighbour shapes (in `street-names.json`, owned by streets)

| Kind | Shape | w | Eras | Rule | Example |
|---|---|--:|---|---|---|
| junction | `{site} {jw}` | 30 | MD on | – | Fenwick Roundabout, Market Cross Corner |
| street | `{site} {streetWord}` | 25 | all | SD's street words and dialect rules | Obelisk Road |
| district | `{site}` | 20 | MD on | district-worthy sites only; never in a village (SK) | Market Cross |
| district | `{site} {districtWord}` | 10 | all | – | Obelisk Quarter |
| inn | `the {site}` | 10 | MD–MO | district-worthy sites only; IT capitals and safeguards | the Leaning Obelisk |

- `{jw}` is the `junctionWord` pool (§4.3), with its era and setting tags.
- `{site}` keeps its own capitals; the whole name runs through `innCapitals` as BL does.
- Every nearby name passes the street safeguards (SD §13), the inn ones for inn names, and the monument block list (§13.1).
- Export `monumentNeighbours(site, districtWorthy, options): string[]` from the streets engine, so monuments, streets and the kit share it.
- Placeholders stay placeholders (*[hero] Roundabout*).

---

## 10. Changes to buildings and landmarks

1. **Remove the `monument` kind:** from `kinds`, `settingX`, `kindShapes`, the two culture shapes (moved to §7.3) and the shared-shape `kinds` lists where it appears. Remove the `buildingWord:monument` and `buildingFixed:monument` pools from `settlement-vocab.json`; the `follyOwner` pool stays (monuments use it).
2. **Types:** `BuildingKind` loses `"monument"`. Every list that names it (`LANDMARK_KINDS` in the kit, `STREET_LANDMARK_KINDS`, `INN_LANDMARK_KINDS`, `INN_ROAD_LANDMARK_KINDS`) loses it and gains monuments through §11–§12 instead.
3. **Safeguards:** "Folly" leaves buildings' flag list and joins monuments' (§13.2). Real monuments in buildings' block list (Eleanor Cross, Charing Cross, Marble Arch, Nelson's Column, Cleopatra's Needle, Stonehenge, Avebury, Glastonbury Tor) move to monuments' block list; buildings keeps them too, since buildings' shared shapes could still make them.
4. **Presets:** a buildings preset with `kind: monument` loads as kind Any, with the problem line "Monuments and follies have moved to monuments and statues." It isn't rewritten on disk.
5. **Vocabulary packs:** a pack heading `## buildingWord:monument` or `## buildingFixed:monument` is ignored, with the pack notice "Monument words now belong to monuments and statues: use monumentWord:‹kind› or monumentFixed:‹kind›."
6. **Description and docs:** the module comment in `buildings/engine.ts` drops "monuments"; add a "Monuments back-link" note to the BL brief.

**Seed stability:** with any remaining kind chosen, buildings gives identical names for the same seed (§14.1). With kind Any the kind draw changes (the weights lost the monument row), so Any batches change; that's expected.

---

## 11. Back-links into streets and inns

`monumentName(o)` returns one monument for back-links: `{ text, site, districtWorthy }`, drawn as `generateMonumentNames` with count 8, the first result whose text without a leading "the" is 3 words or fewer; undefined if none. It takes the same options as `buildingName()` plus `kinds?: MonumentKind[]`.

### 11.1 Streets and districts

| Where | Change |
|---|---|
| `{landmark}` (BL §11.1) | 25% of draws are `monumentName()` (all kinds, its text without "the"); the rest are `buildingName()` of kinds defence, faith, crossing and water |
| streets | new shape `{monumentSite} {streetWord}`, weight 3, all eras (*Fenwick Street*) |
| squares | new shape `{monumentSite} {jw}`, weight 8, MD on (*Fenwick Roundabout*, *Obelisk Circus*) |
| districts | with function Any, 8% of district draws are monument districts, MD on, never in a village: `{monumentSite}` (district-worthy only) w 6, `{monumentSite} {districtWord}` w 4 |

- `{monumentSite}` is the site of one `monumentName()` (§8).
- In the one-town series, a batch of 8 or more uses a monument (as landmark or site) at most once, as BL's landmark rule.
- **Seed stability:** streets batches change where these shapes and the new landmark share are drawn; update the seeded expectations.

### 11.2 Inns and taverns

| Where | Change |
|---|---|
| location anchor `the {landmark}` (BL §11.2) | its landmark uses the 25% monument share of §11.1 |
| roadside `the {landmark} Inn` | 50% `buildingName()` of kind crossing, 50% `monumentName()` of kinds cross and stone (*the Four Mile Stone Inn*, *the Weeping Cross Inn*) |

Add a "Monuments back-link" note to the SD and IT briefs.

---

## 12. Settlement kit

### 12.1 The Monuments section

| | village | town | city | great |
|---|--:|--:|--:|--:|
| Monuments | 1 | 2 | 3 | 4 |

- Brief and Full detail as SK §5.1. In contents "places only" and "whole"; not in "people and groups only".
- **Order:** generated straight after Buildings (SK §6 step 4), before Districts. Its sub-seed step is **12** (new), so every other section keeps its sub-seed.
- **Output:** a "Monuments" heading straight after "Buildings and landmarks". With nearby on in the module this doesn't apply: the kit shows names only.
- Monuments run with series on (as one town), the kit's setting from position, and its context (town, neighbours, founder, saint).

### 12.2 Context and landmarks

- `SettlementContext` gains `monuments: { text: string; site: string; districtWorthy: boolean }[]` from the Monuments section.
- `landmarks` (SK §3) is now buildings' defence, crossing and water entries **plus** the monuments, each of 3 words or fewer without "the".
- Inside a kit, streets, squares, districts and inns take monument sites and landmarks only from the context, never fresh draws (as `contextLandmark` does today).

### 12.3 Positions and rerolls

- Crossroads: `buildingKindX` loses `monument`; add `monumentKindX: { cross: 1.5, stone: 1.5 }`.
- Rerolls (SK §8.4): Monuments redoes Monuments, Districts, Streets, Squares and Inns. Buildings still redoes Buildings, Streets and Inns.
- Kit seeded tests change; update them and check by eye that the sections still agree.

---

## 13. Safeguards

### 13.1 Block list (whole names, with or without "the")

- **Britain:** Nelson's Column, Marble Arch, Wellington Arch, Admiralty Arch, Cleopatra's Needle, Eleanor Cross, Charing Cross, King's Cross, Banbury Cross, Seven Dials, Monument to the Great Fire, the Cenotaph, Albert Memorial, Prince Albert Memorial, Victoria Memorial, Wallace Monument, Scott Monument, Nelson's Monument, Duke of York Column, Grey's Monument, Wellington Monument, Penshaw Monument, Stoodley Pike, Hoad Monument, Broadway Tower, McCaig's Tower, Mow Cop, Angel of the North, Stonehenge, Avebury, Callanish, Ring of Brodgar, Stones of Stenness, Rollright Stones, Castlerigg, Men-an-Tol, Merry Maidens, Nine Ladies, the Hurlers, Long Meg, Maeshowe, Newgrange, Wayland's Smithy, West Kennet Long Barrow, Silbury Hill, Sutton Hoo, Long Man of Wilmington, Cerne Abbas Giant, Uffington White Horse, Westbury White Horse, Glastonbury Tor, Dunmore Pineapple, Temple of British Worthies, Temple of Ancient Virtue, Bluestones.
- **World:** Statue of Liberty, Colossus of Rhodes, Christ the Redeemer, Arc de Triomphe, Brandenburg Gate, Trajan's Column, Column of Marcus Aurelius, Arch of Titus, Arch of Constantine, Arch of Septimius Severus, Altar of Peace, Mausoleum of Augustus, Mausoleum of Hadrian, Mausoleum at Halicarnassus, Serpent Column, Column of Constantine, Lion of Chaeronea, Lion of Amphipolis, Colossi of Memnon, Great Sphinx, Sphinx, Great Pyramid, Pyramid of the Sun, Pyramid of the Moon, Luxor Obelisk, Lateran Obelisk, Obelisk of Axum, Great Stele, Washington Monument, Lincoln Memorial, Mount Rushmore, Bronze Horseman, Alexander Column, Motherland Calls, Iron Pillar, Lion Capital, Tower of Victory, Victory Tower, Qutb Minar, India Gate, Gateway of India, Taj Mahal, Tomb of Cyrus, Terracotta Army, Ming Tombs, Spirit Way, Great Buddha, Moai, Nazca Lines, Sun Stone, Stone of the Sun, Stone of Tizoc, Altar Q, Rosetta Stone, Jelling Stones, Carnac Stones, Victory Column, Little Mermaid, Atomium, Statue of Unity, Temple of the Winds, Tower of the Winds, Golden Milestone.
- **Fiction:** Argonath, Pillars of the Kings, Colossus of Braavos, Titan of Braavos, Ozymandias, Stone of Erech, Barrow-downs, Iron Giant, Hollow Knight.
- Plus buildings' block list (BL §12.1).

### 13.2 Flag list (allowed by default)

White Horse, Long Man, the Giant, Market Cross, High Cross, Butter Cross, Mercat Cross, Weeping Cross, White Cross, Queen's Cross, Hoar Stone, Long Stone, Standing Stone, King Stone, Nine Maidens, Seven Sisters, Troy Town, Mizmaze, Julian's Bower, the Monument, Folly, Sham Castle, the Pepperpot, War Memorial, Eternal Flame, Jubilee Clock, Clock Tower, Tomb of the Unknown Soldier, Steam Clock.

### 13.3 Real honourees

An invented `{monarch}`, `{hero}` or `{benefactor}` is redrawn if it matches, as a whole word or phrase: Nelson, Wellington, Napoleon, Bonaparte, Churchill, Cromwell, Lincoln, Washington, Jefferson, Lenin, Stalin, Mao, Hitler, Mussolini, Franco, Garibaldi, Bolívar, Bolivar, Queen Victoria, Prince Albert, Queen Elizabeth, King Alfred, King Arthur, Boudicca, Caesar, Augustus, Alexander, Ashoka, Genghis, Peter the Great, Kublai. Kept in `safeguards.honourees`; packs can extend it.

### 13.4 Cultures, religion and sensitive rules

- **Living religions:** no Buddha figures, stupas, pagodas, torii, lingams, shrines or statues of living faiths' gods. `{god}` only for BL's five god cultures. `Statue of {holy}` and the crosses only for the christian cultures (via `cultureAllowed(["christian"], …)`, so era matters).
- **Arabic & Persian:** no statue kind in MD–ST (aniconism); AN and MO on are allowed.
- **Polynesian and Andean** (sensitive): stone, tomb and figure kinds weight 0; no culture shapes; no light, grim or fantastic entries; shared and kind shapes otherwise as tagged.
- **Caste** (Indian, West African): no `{trade}` shapes, as BL (none are defined here; keep the check).

### 13.5 Banned words

BL §12.5 (including GN, SD and IT's lists and BL's religious list), plus: Confederate, Slaver, Slave, Swastika, Lynching.

### 13.6 Safeguard packs

`type: settlement-safeguards` (RN §12.6), merged as BL: block, flag and honourees lists.

---

## 14. Series, rendering and history

### 14.1 Regression rule for buildings

Before any change, record buildings names for every remaining kind × 3 cultures × 3 eras at fixed seeds; after the change, the same calls give identical names. Kind Any is excluded (§10).

### 14.2 As one town

As BL §9: one of each kind offered before any repeats; one town and one founder for the series; founder at most 3 times; no qualifier, colour, creature or event twice; **no honouree twice** (record `h:{honouree}` in `uses`).

### 14.3 Rendering and cap

As BL §10: possessives and plurals by GN's helpers, capitals by `innCapitals`, "the" dropped before a possessive. Cap: 7 counted words.

### 14.4 History

"monuments and statues · {era} · {culture}", then kind plural, setting, region, steampunk or fantastic, tone, "one town" and "named after" (when nearby is on), as BL §1.2.

---

### 14.5 Presets

```yaml
---
type: module-preset
module: monument-names
packName: Downland monuments
culture: norman-british
region: WCY
kind: any
era: ST
fantastic: false
setting: country
tone: any
people: invented
nearby: true
series: true
---

Norman & British monuments and statues of any kind of the steam age era, in a realistic world, in the West Country, in the country, of any tone, with invented people and places, with what's named after them, as one town.
```

| Key | Values | Default |
|---|---|---|
| `culture`, `region`, `era`, `fantastic`, `setting`, `tone`, `people`, `series` | as BL §13 | as there |
| `kind` | `any` or a kind key | `any` |
| `nearby` | `true` / `false` | `false` |

A kind the era lacks loads as Any with a problem line, as BL. Pack type icon `ICON_MONUMENTS`; parse and write it in `src/presets.ts` beside the buildings preset.

---

## 15. Tests (`tests/monumentNames.test.ts`, plus the files named)

1. **Vocabulary:** every pool and token in §4–§7 exists; every `c` names a route culture or group; every `r`/`rx` a region code.
2. **Coverage and determinism:** each kind gives names in each era it's offered, for Norman & British (or, for cross, a christian culture; for folly and figure, General); same seed, same names.
3. **Kinds, settings, regions:** "in a town" never draws a hill figure; the road setting raises crosses and stones; WCY raises figures over SLO.
4. **Cultures:** no cross for a non-christian culture; no statue for Arabic & Persian in MD; Polynesian and Andean never draw stone, tomb or figure.
5. **Sites:** `Statue of {hero}` gives the hero as site; a shape without `s` gives its name without "the"; district-worthy is false for any name with " of ".
6. **Nearby:** two names of two kinds; no bare `{site}` district or inn for a non-district-worthy site; every nearby name passes street safeguards.
7. **Safeguards:** no blocked name, no real honouree, no banned word, across 2,000 names per culture group.
8. **Series:** no honouree, qualifier or event twice; one of each offered kind before a repeat.
9. **Buildings:** `BUILDING_KINDS` has no `monument`; §14.1's regression; a buildings preset with `kind: monument` loads as Any with the problem line.
10. **Back-links:** in `streetNames.test.ts` and `innNames.test.ts`, landmarks and monument sites are 3 words or fewer and pass both modules' safeguards; monument districts never appear in a village.
11. **Kit:** in `settlementKit.test.ts`, a town kit has 2 monuments; its landmarks include them; districts, streets and squares take monument sites only from the context; other sections' sub-seeds unchanged (same Roads for the same seed before and after).
12. **Line-up and icons:** `URBAN_SECTIONS` is exactly `["settlementNames", "streetNames", "innNames", "buildingNames", "monumentNames", "settlementKit"]`; `SECTION_ICONS.monumentNames === ICON_MONUMENTS`; the monuments SVG equals buildings' old SVG; buildings' SVG is the supplied one.
13. **Sentence and presets:** the default sentence text as §2.1; a preset round-trips.

---

## 16. Milestones

1. **M1, data and engine:** `monument-names.json`, the new pools, `src/monuments/engine.ts` (with the shared helpers factored out of buildings), sites and `monumentNeighbours`. Tests 1–8. Commit.
2. **M2, buildings and back-links:** §10 and §11, with the buildings regression (§14.1, recorded before the change) and tests 9–10. Commit.
3. **M3, the module:** sentence, line-up, icons (with the supplied buildings SVG), presets and history. Tests 12–13. Commit.
4. **M4, the kit:** §12, test 11, updated kit expectations. Commit.

---

## 17. Parked

- **Settlement names after monuments:** settlements named after crosses, stones and barrows (Whitecross, Stapleford) in the place-name engines.
- **Inns named after statues** beyond the bare `the {site}` neighbour (the Wellington Arms).
- **Gendered honourees:** queens and empresses with women's names (person name lists aren't gendered yet, so `{monarch}` uses the men's rank form, as `{figure}` does).
- **Ruined or removed monuments:** a "lost" tone or status (the cross that was pulled down, the stump left behind), and history-aware kits.
- **Plaques and blue plaques**, roadside shrines, sculpture parks.
