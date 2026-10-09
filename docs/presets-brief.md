# Coding brief: presets, wizard word lists and icons

> [!summary] What this brief asks for
> 1. **Icons and the Create Pack modal.** Remove the Word list button. The place name wizard takes the word list's pen-in-map-pin icon.
> 2. **Place name wizard, page 3.** Two icons in the navigation row: **Save** (save and use as-is) and **Optional: edit word lists**, which opens a new page 4.
> 3. **Place name wizard, page 4: Word lists.** Every slot from page 3 shown as what it draws from, ready to edit. Only changed sections are saved, to one word-list note per recipe.
> 4. **Module-linked slots on page 4.** A slot that draws from a module shows that module's own sentence.
> 5. **Presets.** A module's current setup saved as a note that runs as-is: place-name modules save a recipe; tribal names saves a new `module-preset` note.
> 6. **Presets as sources.** A tribal preset can feed a recipe's tribal slots and a word list's `//` lines.

Read the whole brief before starting. Work through the milestones in §11 in order, running `npm test` and `npm run build` at the end of each. Commit at the end of each milestone.

---

## 0. Decisions already taken

Do not reopen these.

| Question | Decision |
|---|---|
| "Preset" vs "template" | Separate ideas. A **preset** is a saved module setup that runs as-is and appears in the pack dropdown. A **template** keeps today's meaning: `template: true`, hidden from the generate view, offered when creating packs |
| How a preset exists | Always as a markdown note in the names folder. The plugin reads its frontmatter; the user reads its body (a description) |
| Place-name presets | Recipe notes (`type: recipe`), written from the recipe the module already builds |
| Tribal presets | A new note type, `type: module-preset`, `module: tribal-names` |
| Word list button | Removed from the Create Pack modal. Page 4 of the wizard replaces it |
| Wizard icon | The wizard takes the current word list icon (pen in a map pin) |
| Page 4 button | Text "Optional: edit word lists", with the current wizard icon (map pin) |
| Save icons | Page 3 gains its own Save icon. The modal's Save and Cancel row stays too, so there are two Save buttons on page 3. Keep both |
| What page 4 saves | Only changed sections |
| Tribal sentence | Use the tribal names module's own sentences, already in the local code. Do not write new ones |

### 0.1 Defaults taken (flagged for review, but build them as written)

| Question | Default |
|---|---|
| Which modules get presets now | British place names, exploration place names, empire expansion place names (as recipes) and tribal names. River names, name ageing and name takeover are parked (§13) |
| Where presets combine | Recipe tribal slots and word-list `//` lines. A mix-pack "pick" mode is parked |
| Recipe packs in the pack dropdown | Take the wizard's new icon, since both come from `packTypeIconId("recipePack")` |
| How a recipe finds its word-list note | A new recipe key, `words: "[[Danelaw words]]"` (§6.1) |
| Starter templates command | Unchanged. It still installs the starter recipes and starter word lists |

---

## 1. Codebase orientation

The repo is `KennyRN/nameForge` (Obsidian plugin, TypeScript, esbuild).

> [!warning] Work from the local repository
> The local code is ahead of GitHub: it has the tribal names module, biomes and a Biomes tab in the Create Pack modal, built from `tribal-names-and-biomes-brief.md`. Read that brief too. Where this brief refers to tribal or biome code, use what the local code actually has: its file names, its sentence builders, its slot kind and its option keys. Where the local code differs from the tribal brief, the code wins.

Follow the existing conventions:

- **Obsidian-free logic in its own files**, tested under `node:test` through `scripts/run-tests.mjs` (`npm test`). UI code stays in `modal.ts` and `recipeEditor.ts`.
- **Comments cite the brief.** Cite this brief as `Presets brief §n`.
- **British English** in all user-facing text. OUP punctuation: spaced en dashes, colons for label–value text.
- **Never overwrite a template**, and never silently replace an existing note (§6.4, §8.3).

### 1.1 Files to add

| File | Purpose |
|---|---|
| `src/presets.ts` | Obsidian-free: `module-preset` types, `isModulePresetContent`, `parseModulePreset`, `modulePresetContent` (§7) |
| `src/names/wizardWords.ts` | Obsidian-free: page 4's baselines, change detection and word-list note assembly (§4, §6) |
| `tests/presets.test.ts` | §12.1 |
| `tests/wizardWords.test.ts` | §12.2 |
| `tests/presetSources.test.ts` | §12.3 |

### 1.2 Files to change

| File | Change |
|---|---|
| `src/icons.ts` | Rename `ICON_WORD_LIST` to `ICON_RECIPE_WIZARD`, keeping its glyph (§2.2) |
| `src/modal.ts` | Remove the Word list button and its code (§2.1); recipe pack icon (§2.2); Save as preset (§8); tribal presets in the pack dropdown and generate view (§9) |
| `src/recipeEditor.ts` | Page 3 icons (§3); page 4 (§4–§6) |
| `src/names/recipe.ts` | `words` key (§6.1); tribal slot preset links and fields (§5.1, §10.1) |
| `src/names/starterTemplates.ts` | Export the word-table helper (§4.3) |
| `src/recipeHost.ts` | Resolve tribal presets for slots and `//` lines (§10) |
| Tribal slot-fill code (local file name) | Accept preset options (§10.1) |
| `styles.css` | Page 4 sections; remove word-list editor styles |
| `README.md` | Presets, page 4, removal of the Word list button |

---

## 2. Icons and the Create Pack modal

### 2.1 Remove the Word list button

Remove the **Word list** type button from the Create Pack modal and everything only it uses:

- `wordListButton`, `wordListMode` and their branches in `updateTypeButtons` and the stage layout
- `saveWordList`
- the `"wordList"` branch of `loadTemplateOptions` and `listTemplates`
- any word-list-only styles

**Keep** everything recipes and existing notes still need: `parseWordList`, `isWordListContent`, `parseWordListFileContent`, `createWordListFileContent`, `mergeWordLists`, `template-of` support for hand-written word lists, and the wizard's **Word lists** slot option. Existing word-list notes must work exactly as before.

### 2.2 Icon changes

| Where | Before | After |
|---|---|---|
| Create Pack modal: Place name wizard button | `ICON_RECIPE` (solid map marker) | `ICON_RECIPE_WIZARD` (pen in a map pin; today's `ICON_WORD_LIST` glyph) |
| Pack dropdown: recipe packs (`packTypeIconId("recipePack")`) | `ICON_RECIPE` | `ICON_RECIPE_WIZARD` |
| Wizard page 3: Optional: edit word lists | – | `ICON_RECIPE` |
| Wizard page 2: Place names part button | `ICON_RECIPE` | Unchanged |
| History rows from the old generic place names | `ICON_RECIPE` | Unchanged |

Rename the constant `ICON_WORD_LIST` to `ICON_RECIPE_WIZARD` and register it as before. `ICON_RECIPE` keeps its glyph.

---

## 3. Place name wizard: page 3

The wizard keeps its three pages, plus an optional fourth:

```ts
const PAGES = ["Template", "Shape and rendering", "Slots and generic words", "Word lists"];
```

### 3.1 Navigation row

| Page | Row |
|---|---|
| 1–2 | Back · "n of 3 · {page name}" · Next (as now) |
| 3 | Back · "3 of 3 · Slots and generic words" · **Save** icon · **Optional: edit word lists** button |
| 4 | Back · "4 of 4 · Word lists" (no Next) |

- **Save** (`ICON_SAVE`, tooltip "Save and use as-is") runs exactly the same save as the host's Save button, including closing the host afterwards. Add a callback to `RecipeEditorOptions` (e.g. `requestSave: () => void`), set by both hosts: the Create Pack modal and `RecipeEditorModal`. Saving already loads the recipe in the generate view (`onSaved`); keep that.
- **Optional: edit word lists** is a text button with `ICON_RECIPE` before the text. It opens page 4.
- The modal's own Save and Cancel row stays on every page.

---

## 4. Page 4: Word lists

### 4.1 What is shown

Page 4 shows the same slots page 3 shows: those in the chosen tier, plus any slot set outside it. Slots set to **Ignore** are left out.

Each slot is a collapsible section, collapsed by default. The summary row shows the slot label and a status:

| The slot draws from | Status | Section body |
|---|---|---|
| Its built-in list (default or explicit) | Built-in | A textarea holding the built-in words as a word table (§4.3) |
| A biome (colonial native slots with a biome set) | {Biome menu label} list | A textarea holding the biome's words as a word table, using the local biome API |
| A placeholder (default or explicit) | Placeholder | An empty textarea. Hint: "Leave empty to keep the placeholder. Add a table, - words or // pack lines." |
| This recipe's own word-list note (§6), as its only source | Edited | A textarea holding that note's section for this slot, plus a **Reset** icon (`rotate-ccw`, tooltip "Back to the built-in list" or "Back to the placeholder") |
| Any other word list, name pack or mix of sources | Word list · Name pack · Sources | One read-only line naming the sources, each a link that opens the note in a new tab. Not editable here |
| The native pack (colonial native place and people slots) | Native pack | One read-only line: "From the native pack ‹X›" |
| A module | Tribal names · River names | The module's sentence (§5) |

The textareas accept everything a word-list section accepts today: tables, `-` lines and `//` pack lines.

### 4.2 Biomes

Biome-filled slots behave like built-in ones: they show the biome's words, and editing them saves a section that overrides the biome (an explicit slot setting already wins over the biome). Use the local biome code to get the words; do not copy biome data into this feature.

### 4.3 The word-table helper

Export the table builder in `src/names/starterTemplates.ts` (today's private `table()`) as `wordTable(entries: NameWordEntry[]): string`. Page 4's built-in and biome sections use it, so their format matches the starter word lists exactly.

---

## 5. Page 4: module-linked slots

### 5.1 Tribal names

A slot set to tribal names (`folk-group`, `native-people-or-tribe`) shows the tribal names module's own sentence, from the local code, with its clickable choices.

- **Storage.** The tribal slot setting gains optional fields for whatever the sentence lets the user choose (for example `biome`, `groupType`, `perspective`, `register`), using the same keys as the tribal module and the tribal preset (§7.2). Write only fields that differ from the slot's defaults. YAML:

  ```yaml
  slots:
    folk-group:
      tribal: celtic
      biome: highland
  ```

- **Slot limits still apply** (tribal brief §20.2): templates, maximum words, no leading "The", hostile names off. A sentence choice the slot can't use (for example a group type outside the slot's allowed list) is not offered.
- **Preset selector** (added in M7): above the sentence, a dropdown "Use preset", listing None and every tribal preset in the names folder. Choosing a preset sets `{ tribal: "[[Highland Tribes]]" }` and shows the sentence read-only, filled with the preset's values. Choosing None returns to the editable sentence, starting from the preset's values.

### 5.2 River names

The `river-or-stream-name` slot follows the recipe's part and region; there is nothing to choose. Show one read-only line. If the local river module has a sentence, use its wording; otherwise: "From the river name module, following this recipe's shape."

---

## 6. Page 4: saving

### 6.1 The recipe's word-list note

- A recipe's own word-list note is linked by a new key, `words: "[[Danelaw words]]"`.
- `readRecipe` accepts `words` as a link; `recipeToFrontmatter` writes it only when set.
- `mergeRecipe` never inherits `words` from a template: each recipe has its own.
- Slots inherited from a template that point at the template's word-list note show on page 4 as read-only source lines (§4.1).

### 6.2 What counts as changed

A section is changed when its parsed contents differ from its baseline:

| Slot's baseline | Source |
|---|---|
| Built-in | `wordTable` of the built-in list |
| Biome | `wordTable` of the biome's words |
| Placeholder | Empty |

Compare **parsed** sections (table entries, `-` words and `//` pack lines), ignoring row order and whitespace. Reformatting alone is not a change.

### 6.3 On save

Both Save buttons run the same save. Before writing the recipe:

1. Collect every editable section shown on page 4.
2. **Changed sections:** write them to the word-list note under `## {slot label}` (the label `wordListSource` matches). Point each such slot at the note: `{ kind: "sources", sources: [{ list: "{note name}", weight: 100 }] }`.
3. **Unchanged or reset sections:** remove them from the note, and return each slot to its page 3 setting (unset if it was unset).
4. **Keep everything else in the note untouched:** its description and any section whose heading is not a slot shown on page 4.
5. **No changed sections, no note yet:** create nothing.
6. **No changed sections left, note exists:** leave the note as it is, remove the `words` key, and say so in the save notice.
7. Write the note before the recipe, so the link resolves.

### 6.4 Creating the note

- **Name:** `{recipe name} words`. If a note of that name exists and isn't this recipe's `words` note, use the next free name: `{recipe name} words 2`, `… 3`. Never replace an existing note.
- **Content:** `createWordListFileContent(name, body)`. The description line is "Words for the [[{recipe name}]] recipe."
- **Location:** the recipe's folder.
- **Renaming the recipe** does not rename its word-list note; the `words` link keeps working.

---

## 7. Presets

### 7.1 Place-name presets

A place-name preset is an ordinary recipe note (`type: recipe`). There is nothing new to parse. It runs as a recipe pack, opens in the wizard and can use the wizard's Template toggle.

### 7.2 Tribal presets

```yaml
---
type: module-preset
module: tribal-names
packName: Highland Tribes
setting: 
tradition: celtic
biome: highland
register: historical
groupType: any
perspective: any
hostile: false
---

Iron Age-style kin groups in high mountain country.
```

| Key | Values | Default |
|---|---|---|
| `tradition` | A tradition key | `general` |
| `biome` | `homeland` or a biome id | `homeland` |
| `register` | `plain`, `historical`, `legendary`, `administrative` | `plain` |
| `groupType` | `any` or a group type key | `any` |
| `perspective` | `any` or a perspective key | `any` |
| `hostile` | `true`, `false` | `false` |

If the local tribal module has controls beyond these (for example in its sentences), store them too, using the same keys the module uses.

**`src/presets.ts`** exports:

```ts
export interface TribalPreset { packName: string; setting: string; description: string; tradition: string;
  biome: string; register: string; groupType: string; perspective: string; hostile: boolean; }
export function isModulePresetContent(content: string): boolean;          // type: module-preset
export function parseModulePreset(content: string, fileName: string): { preset?: TribalPreset; problems: string[] };
export function modulePresetContent(preset: TribalPreset): string;
```

- An unknown `module` is reported as `Unknown module “{x}”.`; the note is left out of the dropdown.
- An unknown value for a known key is reported as `Unknown {key} “{x}”.` and that key takes its default. Problems show in the status line when the preset is loaded, as recipe problems do.
- `template` and `template-of` are not read for module presets (parked, §13).

---

## 8. Save as preset

### 8.1 The button

For british place names, exploration place names, empire expansion place names and tribal names: an icon button beside the module's guide (and options) buttons, Obsidian icon `bookmark-plus`, tooltip "Save as preset".

### 8.2 The dialogue

A small modal:

- **Name:** prefilled from the current choices, e.g. "Polynesian · temperate woodland", "Spanish · contested frontier".
- **Description:** prefilled with the module's sentence as plain text (`colonialSentenceText` for the colonial modules; the tribal module's sentence; for british place names, the page 2 sentence as plain text, extracted into a plain function if it isn't one already).
- **Save** and **Cancel**, as large icons, matching the Create Pack modal.

### 8.3 Writing

| Module | Writes |
|---|---|
| British place names | `recipeToFrontmatter(britishPlaceNamesRecipe(region))` as a recipe note |
| Exploration, empire expansion | `recipeToFrontmatter(colonialPlaceNamesRecipe(part, tradition, context, biome))` as a recipe note |
| Tribal names | `modulePresetContent(…)` |

- Saved in the names folder; if none is set, ask for one as other saves do.
- A template with that name: refuse with "A template already has that name. Choose another name."
- A preset of the same module with that name: ask "Replace preset “{name}”?" and replace only on yes.
- Any other note with that name: refuse with "A file with that name already exists."
- Afterwards, show a notice "nameForge: preset “{name}” saved." and stay in the module. Refresh the pack dropdown.

---

## 9. Running a tribal preset

- The pack dropdown lists tribal presets alongside packs and recipes, with `ICON_TRIBAL_NAMES`. Add a pack type (e.g. `tribalPreset`) to `NamePackType` and `packTypeIconId`.
- Generating runs the tribal engine with the preset's options and the current quantity. Results render as the tribal module renders them: headwords, with the details toggle showing the two detail lines.
- History label: `tribal names · {preset name}`, so runs land in the tribal names history.
- An icon beside the dropdown, as the recipe edit button is (Obsidian `sliders-horizontal`, tooltip "Open in tribal names"), switches to the tribal names module with the preset's choices applied for this session. The user can adjust them and save the preset again (§8.3 asks before replacing).

---

## 10. Presets as sources

### 10.1 Recipe tribal slots

`{ tribal: "[[Highland Tribes]]" }` names a tribal preset. A value without brackets stays a tradition key or `auto`, as now.

| Setting | Comes from |
|---|---|
| Tradition | The preset |
| Biome | The preset's biome when it isn't `homeland`; otherwise the recipe's biome if set; otherwise the tradition's homeland |
| Group type | The preset's, when the slot allows it; otherwise the slot's group types |
| Perspective | The preset's |
| Register | The preset's, when it is `plain` or `administrative`; otherwise the slot's register weights |
| Hostile | Always off |
| Templates, maximum words, article | Always the slot's (tribal brief §20.2) |

- A missing preset is reported as `Preset “{name}” is missing.`; the slot renders its placeholder, as a missing name pack does.
- A link to a note that isn't a tribal preset is reported as `“{name}” isn't a tribal names preset.`, with the same fallback.

### 10.2 Word-list `//` lines

A `//` line may name a tribal preset: `// Highland Tribes`. Fills follow the colonial column of tribal brief §20.2 (at most three words, no leading "The"), with the preset supplying the settings in §10.1.

- `recipeHost` currently returns `notPack` for word lists and recipes; add tribal presets as a source it can draw from. Recipes and word lists stay refused as `//` targets.
- No loops are possible: presets never reference other notes.

---

## 11. Milestones

Run `npm test` and `npm run build` at the end of every milestone; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Icons and Create Pack modal.** Remove the Word list button and its code; icon changes (§2) | Build passes; manual check: the modal has no Word list button, the wizard button and recipe packs show the pen-in-pin icon, existing word-list notes still feed recipe slots |
| M2 | **Page 3 icons and page 4 display.** Navigation row, `requestSave`, page 4 sections and statuses, `wordTable` (§3, §4) | §12.2 baseline tests pass; manual check in both wizard hosts |
| M3 | **Page 4 saving.** `words` key, change detection, note assembly and naming (§6) | §12.2 passes in full; manual check: edit, save, reopen, reset, save |
| M4 | **Module sentences on page 4.** Tribal slot fields and sentence, river line (§5.1 without the preset selector, §5.2) | YAML round trip of the new tribal slot fields; existing tribal slot tests pass unchanged |
| M5 | **Tribal presets.** `src/presets.ts`, Save as preset for tribal names, dropdown entry, running, history, Open in tribal names (§7.2, §8, §9) | §12.1 passes; manual check |
| M6 | **Place-name presets.** Save as preset for the three place-name modules (§7.1, §8) | Manual check: each saved preset loads as a recipe pack and gives the same kind of names as the module did |
| M7 | **Presets as sources.** Tribal slot preset links, page 4 preset selector, `//` lines (§5.1, §10) | §12.3 passes |
| M8 | **Docs and tidy-up.** README sections on presets and page 4; removal of the Word list button noted; dead code removed | Clean `npm test` and `npm run build` |

---

## 12. Tests

### 12.1 `tests/presets.test.ts`

- `isModulePresetContent` is true for `type: module-preset` and false for packs, recipes and word lists.
- A full preset parses to its values; a preset with only `type` and `module` takes every default.
- `modulePresetContent` then `parseModulePreset` round-trips every field.
- An unknown tradition gives `Unknown tradition “x”.` and the default `general`; an unknown module gives `Unknown module “x”.` and no preset.

### 12.2 `tests/wizardWords.test.ts`

- The built-in baseline for `bird` equals `wordTable(NAME_WORDS.categories.bird)`.
- A section with the built-in rows reordered and respaced is unchanged; one with a row added or removed is changed.
- A placeholder section with one `-` word is changed; an empty one is unchanged.
- Note assembly keeps the description and a hand-added `## Ships` section untouched, writes changed sections and drops reset ones.
- Changed slots point at the note as a single list source; reset slots return to their earlier setting.
- Naming: with "Danelaw words" taken by another note, the new note is "Danelaw words 2".
- Recipe YAML round trip keeps `words`; `mergeRecipe` does not inherit it.

### 12.3 `tests/presetSources.test.ts`

- A new-land recipe with `native-people-or-tribe: { tribal: "[[Fixture]]" }` (fixture: `bantu`, `savannah`, register `historical`), 2,000 names: every tribal fill has at most three words, never starts with "The", and the register used is the slot's.
- A missing preset gives `Preset “Fixture” is missing.` and placeholder output.
- A link to a name pack gives `“X” isn't a tribal names preset.`
- A word-list fixture with `// Fixture` under `## Native people` feeds that slot with tribal fills.
- Existing tribal slot tests (`{ tribal: key }`, `auto`) pass unchanged.

---

## 13. Parked

- Presets for river names, name ageing and name takeover.
- Templates for module presets (`template` / `template-of` on `module-preset` notes).
- A mix-pack "pick" mode that draws each name whole from one weighted source, which would let presets join mixes.
- Editing a template's word-list sections from a derived recipe's page 4.
- Renaming a recipe's word-list note along with the recipe.
- Recipes as sources for slots or `//` lines.
