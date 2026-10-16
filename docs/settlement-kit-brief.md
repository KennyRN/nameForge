# Settlement kit – brief (first release)

This brief adds a module, **settlement kit**, to the **place names** group, after buildings and landmarks. *(Later change: the module now sits at the bottom of the **advanced** group, and the place names group runs native place names, exploration, expansion, route names, streets, inns, buildings.)* One press makes a whole settlement in which every part agrees with every other:

- the settlement's **name**, the **realm** it belongs to and its **ruler's title**
- the **roads** out of it, one of which runs through the town
- its **districts**, **streets**, **squares and markets**
- its **inns** and **buildings and landmarks**
- its **groups**: watch, guilds, faith, council, and in larger places gangs, merchant houses and secret societies
- its **ships** (or spacecraft) if it stands on water or is a station

Example (illustration, Norman & British town, medieval, on a river, invented people):

> **Fenwick** — a town in the Kingdom of the Western Fells
> **Ruler:** Reeve of Fenwick
> **Roads:** Great North Road · Saltgate Road · Salt Way · Ashby Drove
> **Districts:** Old Town · Weavers' Quarter · Bridge End
> **Streets:** High Street · Mill Lane · Salt Way · Saint Osyth's Lane · Weavers' Row · Grey Tower Lane · Ashby Road · Back Lane
> **Inns:** the Red Lion · the Drovers' Rest · the Grey Tower
> **Buildings:** Fenwick Bridge · the Grey Tower · Saint Osyth's Church · Fenwick Moot Hall · Lady Well · Harrow Mill
> **Groups:** the Fenwick Watch · Guild of Weavers · Brothers of the Still Water · Fenwick Moot

Here the town name, the neighbouring towns (Saltgate, Ashby), the road through town (Salt Way), the patron saint (Saint Osyth), the town's trade (weaving) and its landmarks (the Grey Tower) are each chosen **once** and shared by every module.

The kit generates nothing of its own. It sets up a **settlement context** and passes it to the modules already built: route names (RN), streets and districts (SD), inns and taverns (IT), buildings and landmarks (BL), group names (GN), realms (RP), bynames (BT) and ships and spacecraft (SS). Build it **after** the inns and buildings briefs are complete.

Everything here is a rule with fixed numbers. Where something isn't specified, follow BL, then IT, SD, RN, GN and TS. All output is in modern English.

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | A new module `settlementKit` in the place names group, after buildings and landmarks |
| How it works | A **settlement context** (§3) passed to each module's existing engine; the kit has no word lists of its own |
| Cultures, eras, fantastic, regions | As RN §4 |
| Size | SD's four sizes: village · town · city · great city (outpost · colony · station · megacity in sci-fi) |
| Position | A new link: inland · on a river · on the coast · at a crossroads |
| Contents | the whole settlement · its places only · its people and groups only |
| Detail | brief · standard · full (section sizes ×0.5, ×1, ×1.5) |
| Output | A markdown block (§9): insert at the cursor, copy, or **create a note** with frontmatter that can regenerate it |
| Rerolls | Each section can be rerolled on its own, keeping the context |
| Engine changes | Each module's options gain an optional `context` (§4); without it, they behave exactly as now |

---

## 1. Module

### 1.1 Section

- Add `settlementKit` to `NameForgeSection`, label **"settlement kit"**, Lucide icon `building-2`.
- Insert it in `SECTION_GROUPS.placeNames` and `SECTION_ORDER` straight after `buildingNames`.

### 1.2 History

The kit's history row stores the whole block as one entry. Label: `settlement kit · {settlement name} · {size} · {era label} · {culture label}`. Selecting the row shows the block again (no regeneration).

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/settlement-kit.json` | Section sizes, group line-up, position rules, vessel mapping (§5–§7) |
| `src/settlement/context.ts` | The `SettlementContext` type and `buildContext()` (§3). No Obsidian imports. |
| `src/settlement/kit.ts` | `generateKit()`: runs the modules in order (§6), applies kit rules (§8), returns sections. No Obsidian imports. |
| `src/settlement/kitFormat.ts` | The markdown block (§9) and note frontmatter |
| `src/settlement/kitSentence.ts` | The sentence (§2) |
| Engine files of RN, SD, IT, BL, GN, BT, SS | the `context` option (§4) |
| `tests/settlementKit.test.ts` | §13 |

Add this brief to `docs/` as `settlement-kit-brief.md`.

---

## 2. The sentence

### 2.1 Shape

> A ‹Norman & British› ‹town› of the ‹medieval› era, in a ‹realistic› world, ‹across all of Britain›, ‹on a river›, ‹of any tone›, giving ‹the whole settlement› in ‹standard› detail, with ‹placeholders for› people and places.

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture`, `era`, `fantastic`, `region` | as RN §2.2 | as RN | `norman-british`, MD, realistic, all of Britain |
| `size` | SD's labels for the era | village · town · city · great city | town |
| `position` | "inland" · "on a river" · "on the coast" · "at a crossroads"; in NF–IS: "on a planet" · "on a river world" · "on an ocean world" · "on a station" | the four | inland |
| `tone` | as TS §5.2 | the six | any |
| `contents` | "the whole settlement" · "its places only" · "its people and groups only" | the three | whole |
| `detail` | "brief" · "standard" · "full" | the three | standard |
| `people` | as GN §2.2 | placeholders · invented | placeholders |

- "A" becomes "An" before a vowel (*An Arabic & Persian city*).
- **Tooltips:** size, "How big the settlement is"; position, "Where it stands: decides harbours, bridges, ships and roadside inns"; contents, "Everything, just the places, or just the people and groups"; detail, "How many names in each section"; the rest as RN.

### 2.3 Buttons

Below the result: **Generate** (new settlement), **Insert** (at the cursor), **Copy**, **Create note** (§9.3). Each section heading in the result has a small reroll icon (Lucide `refresh-cw`) (§8.4).

### 2.4 Presets

§11.

---

## 3. The settlement context

`buildContext(options, rng)` draws these once, in this order. Every module the kit runs receives the same context.

| Field | How it's drawn |
|---|---|
| `town` | One name from `routePlace(culture, setting, rng)` (RN), redrawn until it isn't blocked by any module's safeguards and has no `[`. In NF–IS, a station or colony name (GN §8.4 SF row). Placeholder mode still uses a real name: the town is the kit's subject, not a placeholder. |
| `neighbours` | 6 more names the same way, all different from `town` and each other. Used for every `{destination}` and every other `{town}` token that isn't the settlement itself. |
| `realm` | One realms name (RP) for the culture and era, character territorial, output **official**; in NF–IS any character. Shown in the summary line. Skipped (null) for a village 50% of the time. |
| `founder` | Placeholder `[founder]`, or in invented mode RN's `{person}` source (falls back to the placeholder where the culture has none). |
| `holy` | For christian cultures, one GN §8.2 saint; otherwise null. |
| `trades` | 2 words from SD `streetTrades` for the culture and era (null for indian and west-african: caste rule). |
| `goods` | 2 words from SD `streetGoods` (with RN `routeGoods` culture extras). |
| `throughRoute` | Chosen after the roads section is made (§6 step 3): one of its road, drove or trade names. |
| `landmarks` | Filled after the buildings section is made (§6 step 4): its names of kind defence, crossing, water or monument, 3 words or fewer, without a leading "the". |
| `setting` | RN `routeSetting(era, fantastic)` |
| `tradition` | RP's culture → tribal tradition map (for GN), with polynesian → `polynesian`, andean → `andean` |
| `vesselCulture` | §7.2 |

---

## 4. The `context` option (engine changes)

Add `context?: SettlementContext` to `RouteOptions`, `StreetOptions`, the inn options, the building options, `GroupOptions`, `BynameOptions` and `VesselOptions`. With it set, each engine changes **only** these things:

| Token or rule | With `context` |
|---|---|
| `{town}` meaning this settlement (`{town} Watch`, `{town} Bridge`, `Hostel of {town}`, `{officeWord} of {town}`) | `context.town` |
| `{destination}`, and any other `{town}` that names somewhere else | a draw from `context.neighbours` |
| `{founder}` | `context.founder` |
| `{holy}` | `context.holy` at ×4 (other saints still possible at ×1) |
| `{trade}` / `{tradeSg}` / `tradesmen` | words in `context.trades` at ×4 |
| `{goods}` / `{streetGoods}` / `goods` | words in `context.goods` at ×4 |
| `{route}` (SD streets, IT roadside) | `context.throughRoute` |
| `{landmark}` (SD §11.1 and IT §11.2 back-links) | a draw from `context.landmarks` (no fresh building names) |

**Which `{town}` is which.** In each engine's data, mark shapes whose `{town}` means "this place" with `"self": true` (watch, constabulary, council, guild of the town, town bridge, town light, town hall, gaol, inn "of {town}", hostels, way stations, offices). Unmarked `{town}` tokens name other places and draw from `neighbours`. A test (§13.2) checks every shape with `{town}` in those modules is marked one way or the other.

Without `context`, every engine behaves exactly as before; existing tests must pass unchanged.

---

## 5. Section sizes

### 5.1 Counts at standard detail

| Section | village | town | city | great |
|---|--:|--:|--:|--:|
| Roads | 2 | 3 | 4 | 5 |
| Districts | 0 | 3 | 5 | 7 |
| Streets | 4 | 8 | 12 | 16 |
| Squares and markets | 1 | 2 | 3 | 4 |
| Inns | 1 | 3 | 5 | 7 |
| Buildings | 3 | 6 | 9 | 12 |
| Groups | 1 | 4 | 7 | 10 |
| Ships (coast, river) | 2 | 3 | 4 | 6 |

- **Brief:** ×0.5, rounded up; a section with 0 stays 0. **Full:** ×1.5, rounded up.
- **Contents "places only":** no groups, no ruler, no ships. **"People and groups only":** name, realm, ruler and groups only.

### 5.2 Groups by size

Drawn in this order until the count is reached; a type not offered in the setting (GN type settings) is skipped and the next is taken.

| Order | Group | GN family · type | village | town | city | great |
|--:|---|---|:-:|:-:|:-:|:-:|
| 1 | Faith | mystic · holy (cult instead at 20% with tone grim or strange) | ✓ | ✓ | ✓ | ✓ |
| 2 | Watch | martial · watch | | ✓ | ✓ | ✓ |
| 3 | Guild | trade · craft | | ✓ | ✓ | ✓ |
| 4 | Council | power · council | | ✓ | ✓ | ✓ |
| 5 | Merchants | trade · merchant | | | ✓ | ✓ |
| 6 | Gang | underworld · gang | | | ✓ | ✓ |
| 7 | Garrison | martial · unit | | | ✓ | ✓ |
| 8 | Second guild | trade · craft | | | | ✓ |
| 9 | Thieves | underworld · thieves | | | | ✓ |
| 10 | Secret society | power · secret | | | | ✓ |
| 11 | Faction | power · faction | | | | ✓ |
| 12 | Second faith | mystic · any | | | | ✓ |

- Each group is one GN name with the context, the tradition (§3), the setting and tone, form any, front "may hide" for underworld and secret types.
- The section lists each group with its role: *Watch: the Fenwick Watch*.
- In NF–IS the line-up is the same; GN's sci-fi types and shapes apply.

---

## 6. Generation order

1. **Context** (§3): town, neighbours, realm, founder, holy, trades, goods.
2. **Ruler** (contents whole or people): one BT title, module titles, kind office, shapes restricted to those ending "of {town}" (with `context.town`), language English, gender any, source none. Village: `{officeWord}` limited to Reeve, Headman, Steward, Elder where the culture has them, else any.
3. **Roads:** RN with series on (network), kind Any but never rail, motor or space before their eras (RN already gates); `context.neighbours` as destinations. Then set `throughRoute` to one road, drove or trade entry from the result (the first such).
4. **Buildings:** BL with series on (as one town), setting from position (§7.1). Then fill `landmarks`.
5. **Districts:** SD kind districts, series on.
6. **Streets:** SD kind streets, series on, with `throughRoute` and `landmarks`.
7. **Squares and markets:** SD kind squares, series on.
8. **Inns:** IT kind Any, series on, setting from position (§7.1).
9. **Groups** (§5.2).
10. **Ships** (§7.2), if the position has water.

Every module gets the same `culture`, `era`, `fantastic`, `region`, `tone`, `people`, a sub-seed from the kit's seed (step number × 7919 + kit seed), and its merged safeguards and vocabulary packs.

---

## 7. Position

### 7.1 Effects

| Position | Buildings and inns setting | Other effects |
|---|---|---|
| inland | in a town (village: in the country) | – |
| on a river | in a town | BL crossing ×2; SD `compCrossing` and `compWaterside` ×2; ships section: working boats only |
| on the coast | in a port | BL maritime ×5; SD `compWaterside` ×3; ships section: any function |
| at a crossroads | by the road | roads +1; IT roadside ×2; BL crossing and monument ×1.5 |

NF–IS: "on a station" counts as on the coast for docks (spacecraft); "on an ocean world" as coast (ships); "on a river world" as river; "on a planet" as inland.

### 7.2 Ships section

- **Module:** ships (SS) for AN–MO and NF on water worlds; spacecraft for "on a station" and for IS.
- **Culture:** the vessel culture with the same key; polynesian → `hawaiian`; andean → `andean`.
- **Technology:** AN T2, MD T3, EM T4, ST T5, MO T7, NF T7 (ships) / S1 (spacecraft), IS S3.
- **Function:** river → working; coast → Any; station → Any.
- `context.town` is the home port for any "of {town}" or "Pride of {town}" shapes.

---

## 8. Kit rules

### 8.1 No repeats across sections

No name appears twice in the kit (case-insensitive, leading "the" ignored). If a module returns a name already used, the kit asks that module for one more (up to 20 tries), then drops it.

### 8.2 Agreement checks

After generation, the kit checks and repairs:

- Every `{town}`-self shape used `context.town`.
- `throughRoute` appears in Roads and, if Streets has 8 or more names, in Streets.
- Every landmark used by Streets or Inns is in Buildings.
- With a `holy` saint, Buildings includes at least one name with it (`{holy:poss} Church` or `{holy:poss} Well`) for town size and up; if not, the faith building is redrawn once with that shape.

### 8.3 Summary line

One line, built from options and context only (no invented lore): `{a/an} {size label}{, on a river / on the coast / at a crossroads}{ in {realm}}`. Examples: *a town on a river, in the Kingdom of the Western Fells*; *a city on the coast*.

### 8.4 Section rerolls

The reroll icon on a section runs that section's step again with the **same context** and a new sub-seed, then reapplies §8.1–§8.2. Rerolling Roads also resets `throughRoute` and reruns Streets and Inns (which use it); rerolling Buildings resets `landmarks` and reruns Streets and Inns. The result notes which sections were redone: "Streets and inns were redone to match."

---

## 9. Output

### 9.1 The block

```markdown
## Fenwick
*A town on a river, in the Kingdom of the Western Fells.*

**Ruler:** Reeve of Fenwick

### Roads
- Great North Road
- Saltgate Road
- Salt Way *(through the town)*

### Districts
- Old Town
- Weavers' Quarter

### Streets
- High Street
- Mill Lane

### Squares and markets
- Market Square

### Inns
- the Red Lion
- the Drovers' Rest

### Buildings and landmarks
- Fenwick Bridge
- the Grey Tower

### Groups
- **Faith:** Brothers of the Still Water
- **Watch:** the Fenwick Watch

### Ships
- Good Anne
```

- Heading levels: the settlement at H2, sections at H3, so the block drops into a larger note.
- Empty sections are left out.
- Dialect variants (SD) keep their bracket form.
- In placeholder mode, placeholders appear as written (*[founder]'s Tower*).

### 9.2 Insert and copy

**Insert** puts the block at the cursor in the active note (as other modules insert lists). **Copy** puts it on the clipboard.

### 9.3 Create note

- Writes `{town}.md` in the folder set in nameForge's settings for settlements (a new setting, **Settlements folder**, default the names folder plus `/Settlements`), creating the folder if needed.
- Never overwrites: if the note exists, writes `{town} 2.md`, `{town} 3.md` and so on.
- Content: frontmatter, then the block.

```yaml
---
type: settlement
culture: norman-british
era: MD
fantastic: false
region: all
size: town
position: river
tone: any
contents: whole
detail: standard
people: invented
seed: 482913
realm: Kingdom of the Western Fells
---
```

- The note opens after it's created.
- A command, **Regenerate settlement from note**, reads this frontmatter from the active note and shows the same kit in the modal (same seed gives the same settlement, as long as the vocabulary and safeguard packs haven't changed).

---

## 10. Tone and safeguards

- The tone applies to every module (TS §2).
- Each module's own safeguards and safeguard packs apply to its section. The kit adds none of its own beyond §8.1.
- Sensitive cultures (RN §12.4) pass through to every module.

---

## 11. Presets

```yaml
---
type: module-preset
module: settlement-kit
packName: Border market town
culture: norman-british
region: SBL
era: EM
fantastic: false
size: town
position: crossroads
tone: any
contents: whole
detail: standard
people: invented
---

A Norman & British town of the early modern era, in a realistic world, in the Scottish Borderlands, at a crossroads, of any tone, giving the whole settlement in standard detail, with invented people and places.
```

| Key | Values | Default |
|---|---|---|
| `culture`, `region`, `era`, `fantastic`, `tone`, `people` | as RN §13 | as there |
| `size` | `village`, `town`, `city`, `great` | `town` |
| `position` | `inland`, `river`, `coast`, `crossroads` | `inland` |
| `contents` | `whole`, `places`, `people` | `whole` |
| `detail` | `brief`, `standard`, `full` | `standard` |

---

## 12. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Context option.** `SettlementContext`, `buildContext()`, the `context` option in RN, SD, IT, BL, GN, BT, SS engines, `self` marks on shapes | §13.1–§13.2 pass; every existing test passes unchanged |
| M2 | **Kit engine.** `generateKit()`, section sizes, groups line-up, position, ships, kit rules, rerolls, the markdown block | §13.3–§13.6 pass |
| M3 | **Module.** Section, sentence, buttons, history, Create note, the Settlements folder setting, the Regenerate command, presets | §13.7 passes; the kit generates in the app |

---

## 13. Tests (`tests/settlementKit.test.ts`)

### 13.1 Context

- Same options and seed give the same context and the same kit.
- `town` and the 6 `neighbours` are all different, contain no `[`, and pass every module's safeguards.
- `holy` is null for non-christian cultures; `trades` is null for indian and west-african.

### 13.2 Engines with context

- For each of RN, SD, IT, BL, GN, BT, SS: every shape containing `{town}` is marked `self` or not (data test).
- With a context, every `self` shape's output contains `context.town`; every `{destination}` is one of `context.neighbours`.
- Without a context, outputs match the engines' existing fixtures exactly.

### 13.3 Sizes, contents and detail

- Section counts match §5.1 for every size × detail (allowing a shortfall only where a module returns its own notice).
- Village: no Districts section. "Places only": no Groups, Ruler or Ships. "People only": no place sections.
- Inland: no Ships section.

### 13.4 Agreement

- `throughRoute` is in Roads, and in Streets when Streets has 8 or more names; Inns' roadside shapes use it.
- Every landmark in Streets and Inns is in Buildings.
- Christian culture, town size: Buildings contains the patron saint.
- No name appears twice across sections.

### 13.5 Position and ships

- On the coast: at least one maritime building in 200 kits of town size; Ships present.
- On a river: Ships are working boats only.
- IS on a station: the Ships section uses spacecraft.

### 13.6 Rerolls and block

- Rerolling Roads changes `throughRoute` and redoes Streets and Inns; other sections are unchanged.
- The markdown block matches §9.1 (H2, H3, bullets, the *(through the town)* mark, groups with roles, empty sections left out).

### 13.7 Module

- Default plain text: "A Norman & British town of the medieval era, in a realistic world, across all of Britain, inland, of any tone, giving the whole settlement in standard detail, with placeholders for people and places."
- "An" before a vowel.
- Create note never overwrites; frontmatter round-trips through Regenerate to the same kit.
- Preset round-trip.

---

## 14. Parked

- **Locks:** keep chosen names when regenerating the rest.
- **Streets placed in districts** (each district with its own streets).
- **Notable people:** innkeepers, guild masters and the ruler named through bynames and name packs.
- **Linked notes:** one note per inn, building or group, linked from the settlement note.
- **A region kit:** several settlements sharing one realm, roads that join them, and a shared river.
- **Settlement history:** founding, events and eras, once the events and eras module exists.

---

## Events back-link

Added by the events and eras brief (§10): a **History** section after Groups (contents "whole" and "people and groups only"), village 2, town 3, city 4, great city 5 at standard detail (detail multipliers as §5.1). It runs the events engine as one history, on a local scale for a village or town and a realm's scale for a city or great city, with the kit's context: the `self` shapes (`Founding of {place}`, `{place} {disaster}`, `Siege of {place}`, `{collapseNoun} of {place}`) name the town, every other `{place}` a neighbour. A history of 3 or more opens with `Founding of {town}`. It runs after Groups and before Ships; rerolling History redoes only History.


---

## Deities back-link

Added by the deities and sacred places brief (§10.4): the context gains `deity`, one invented deity title drawn last (so every other field is unchanged), null for christian cultures in a realistic world and for the sensitive cultures. The faith group's and the faith building's deity shapes use it.
