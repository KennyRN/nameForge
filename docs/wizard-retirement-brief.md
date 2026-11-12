# Retiring the place name wizard: slot choices, place presets and biome overrides – brief

**Status:** agreed with Kenny, 8 November 2026. Implement in the milestones of §7. This lands **before** the nameForge core brief (`nameforge-core-brief.md`), which is updated to match.

## 1. What changes

The module sentences have taken over most of what the place name wizard did, so the wizard is archived. Four things go with it or replace it:

| # | Change | Agreed |
|---|---|---|
| 1 | The wizard is archived (§2) | Its screens, page 4 word lists and recipe templates go; existing **recipe packs still run** from the pack picker |
| 2 | **Slot choices** in the sentences (§3) | Each name slot can be a **placeholder**, a **list** or a **generator** (packs and linked modules found by nameForge) |
| 3 | **Presets** for native place names, exploration and expansion (§4) | Saved like every other module's |
| 4 | **Biome overrides** (§5) | A biome pack in the names folder shows in every biome list; one named like a built-in biome **replaces** it |

### 1.1 Hard rules

1. **Default output doesn't change.** With every slot on placeholder and no biome packs that override a built-in, every module gives exactly the same names for the same state and seed. §6 fixes the regression tests, recorded before any change.
2. **Existing notes keep working, untouched.** Recipe packs, linked recipes (`template-of`), template recipe notes, word lists, settlement names presets and biome packs are read as now and never rewritten.
3. **Slot drawing doesn't change.** The new sentence only builds the `slots` map the names engine already takes; it doesn't change how a slot draws from a pack or list.
4. Follow the existing conventions: Obsidian-free engines and sentence builders, one seeded `mulberry32` stream per batch, sentences as plain segments, British English with OUP punctuation in user-facing text (spaced en dashes; colons rather than dashes in label–value text).

## 2. Archiving the wizard

### 2.1 Tag, then move

1. Tag the commit before any removal `archive/place-name-wizard`.
2. Create `archive/place-name-wizard/` at the repo root, outside `src/`, with a `README.md` saying: what the wizard was; which brief retired it (this one); the tag; and the files below, with where each one lived. The folder must not be compiled, bundled or tested: exclude it in `tsconfig.json` and make sure `scripts/run-tests.mjs` only reads `tests/`.
3. `git mv` into it:

| File | Notes |
|---|---|
| `src/recipeEditor.ts` | The wizard (`RecipeEditorModal`, `RecipeWizard`) |
| `src/names/wizardWords.ts` and `tests/wizardWords.test.ts` | Page 4 word lists |
| `src/wordListGuide.ts`, `src/contextGuide.ts` | Only the wizard opens them; check nothing else does first |
| The tier parts of `src/names/slotOptions.ts` | `SLOT_TIERS`, `TIER_TABLE`, `slotTier`, `tierTableIds`, `tierIncludes`, as `archive/place-name-wizard/slotTiers.ts`, with their tests |

**`slotOptions.ts` itself stays in `src/names/`**: its option rules (`allowsPacks`, `allowsLists`, `allowsTribal`, `allowsPlaceholderChoice`, `slotChoices`, `showsGender`, `usesNativeDefault`, `slotCategories`) decide what the slot sentence offers (§3.3). Keep their tests.

### 2.2 What's removed from the plugin

- The **Edit recipe** button in the pack row, `openRecipeEditor` and `recipeEditorOptions`.
- The wizard pane and wizard mode in the **Create Pack** modal (`openWizard`, `wizardMode`, `wizardPaneEl` and its type button), and the **Optional: edit word lists** route.
- Recipe templates from the **Create Pack templates pane**.
- The recipe templates (`STARTER_RECIPES`) from the **Install starter templates** command. The starter word lists stay: the slot sentence's List choice (§3.3) and biome packs use word lists.
- Any styles in `styles.css` used only by the removed parts.

### 2.3 What stays

- **Recipe packs run from the pack picker** exactly as now (`loadRecipePack`, `runRecipe`), wearing `ICON_RECIPE_WIZARD`, with no edit button.
- **Linked recipes** still merge their template notes (`template-of`, `mergeRecipe`). Template recipe notes stay hidden from the picker, as now.
- **Settlement names presets** (recipe notes with `shape.settlement`) still show **Open in settlement names**.
- `names/recipe.ts`, `names/engine.ts`, `names/starterTemplates.ts` (the data stays, even where the command no longer installs it), `names/wordListSource.ts`, `packs/wordList.ts`, `recipeHost.ts` (minus anything only the wizard called).

## 3. Slot choices in the sentences

### 3.1 Where

| Module | Settings that get slot choices |
|---|---|
| native place names | British only. British river names and the world cultures don't run through the names engine's slots and are unchanged |
| exploration into new lands | All |
| expansion into settled lands | All |
| settlement names | Its native British, new lands and settled lands settings, through the same engines. Its world-culture setting is unchanged |

### 3.2 The sentence

The main sentence gets one closing link:

> …, set in ‹any part› of ‹Britain›, with ‹placeholders› for names

| Choice | Meaning |
|---|---|
| **placeholders** (default) | Today's behaviour: every name slot renders as a bracket |
| **names chosen per slot** | A second sentence appears under the first, one link per slot |

The second sentence lists, in the order the slots appear in the slot inventory, each slot the current setting can produce as a bracket (§3.4), as "‹slot label› from ‹source›", joined with semicolons and ending with a full stop:

> Personal names from ‹Anglo-Saxon (pack)›; earlier or district names as ‹placeholders›; folk groups from ‹tribes and kin groups›; deities as ‹placeholders›; holy people from ‹the built-in list›.

A slot on placeholder reads "as ‹placeholders›"; any other source reads "from ‹source›". Changing the setting rebuilds the list, keeping the choice of any slot still offered.

### 3.3 A slot's choices

Each slot link's menu has up to three runs of choices, each starting with a disabled heading (`SentenceChoice.heading`):

| Heading | Choices | Offered when |
|---|---|---|
| **Placeholder** | "placeholders" | `allowsPlaceholderChoice` |
| **Lists** | "the built-in list" (where the engine has one: `hasBuiltInList`), then each word-list pack in the names folder | `allowsLists` |
| **Generators** | Each name pack in the names folder (breakdown, list, compound, mix), then any linked module: **tribes and kin groups** where `allowsTribal` | `allowsPacks` (packs) and `allowsTribal` (module) |

A run with no choices isn't shown. Packs are listed by name, as the bynames and named things sentences list them.

- **Gender:** a pack with Male and Female sections uses the slot's existing default ratio (`hasGenderDefault`), as the wizard's default did. No new control.
- **Missing pack or list** (deleted or renamed since it was chosen): the slot falls back to placeholders and the status line says so, as bynames does.
- **Tribes and kin groups:** the slot uses the tribal module at its default settings with the run's culture and land, as the wizard's tribal link did (`tribalSlotFill`). No tribal sentence is shown inside the slot sentence.

### 3.4 Which slots appear

Exactly the slots that render as brackets today for the current setting, **except** land slots (`slotChoices` returns choices: flora, fauna, landform, water, soil, river, resource, season, domestic animal, crop). Those stay under the Land button.

For reference, British gives: personal name, earlier or district name, folk group, deity, holy person. The colonial parts give the person slots (monarch, ruler or dynasty; official, patron or sponsor; explorer or founder; commander or conqueror; royal woman), native people, native place, homeland place name, and in settled lands the local words. Derive the list from the data and the renderer, not from this paragraph, and add a test that checks it against what each setting can actually produce.

### 3.5 State, history and the engine

- The slot sources are part of each module's sentence state: `{ names: "placeholders" | "perSlot"; slots: Record<categoryId, SlotSetting> }`, using the recipe's existing `SlotSetting` type (`names/recipe.ts`).
- The run resolves those settings into the engine's `ResolvedSlot` map by the same code `runRecipe` uses for a recipe's slots (`recipeHost.ts`), reading packs and lists through it. On placeholders it passes `{}`, as today.
- History labels are unchanged when names are placeholders. With names chosen per slot, append " · own names".

## 4. Presets for the place-name modules

Native place names, exploration and expansion get **Save preset**, like every other module:

- **Suggested name:** "{culture or tradition} · {module label}", e.g. "British · native place names", "General explorers · exploration into new lands".
- **Content:** through `modulePresetContent`, with a new preset kind per module (`nativePlacePreset`, `explorationPreset`, `expansionPreset`). It stores everything the sentence holds, including region, era, land (biome and terrain) and the slot sources (packs and lists by name).
- **Picker:** each preset wears its module's icon (§9 of the core brief: `ICON_NATIVE_PLACE_NAMES`, `ICON_EXPLORATION_PLACE_SHAPES`, `ICON_EMPIRE_EXPANSION_PLACE_SHAPES`). Running a preset from the picker runs it as its module would, with the history label "{module label} · {preset name}"; **Open in {module}** applies it for the session, as every other preset does.
- **Settlement names presets stay recipe notes** (format unchanged). Their slot sources save in the recipe's existing `slots` field.

## 5. Biome overrides

### 5.1 One catalogue

Every biome list and every biome lookup goes through one function in `biomes.ts`:

```ts
export function biomeCatalogue(custom: readonly Biome[]): {
  /** Britain and the 12 built-ins, each replaced in place by its override if there is one, then every other custom biome A–Z. */
  all: Biome[];
  find(id: string | undefined): Biome | undefined;
  /** The built-in a custom biome descends from (its base chain's root), for lists limited to some built-ins. */
  rootOf(biome: Biome): string;
};
```

Today several places use the built-ins only. Each moves to the catalogue, so **a biome in the names folder shows in every biome list**:

- the Land menu (already lists custom biomes; moves to the catalogue so overrides apply);
- the colonial biome choices (`colonialSentence.ts` `biomeChoices`);
- seas and coasts (`waters/sentence.ts`, and the engine's `BIOMES.find` lookups);
- wild lands (`wilds/engine.ts` `wildsBiomes` and its lookups). A custom biome shows in a wild lands module when its root built-in does (`rootOf`);
- every other `findBiome(…)`, `BIOMES.find`, `BIOMES.map` or `allBiomes(…)` outside `biomes.ts` and `biomePacks.ts`. Search for them and move each one.

Engines don't read the folder. Where an engine looks a biome up today, pass the resolved catalogue (or the custom biomes) in through its options. With no custom biomes, the catalogue is exactly today's built-ins, so output is unchanged.

**Space biomes** keep their own lists. They're only overridable if the Biome tab can already start from them; if it can't, leave them out of this.

### 5.2 Overriding a built-in

A biome pack whose **name** matches a built-in biome's **label or id** replaces that built-in. The match ignores case, surrounding spaces and a trailing ".md": "Temperate", "temperate", "Northern forest and tundra" and "boreal" all match. Britain is included ("Britain", "British", "britain").

When a pack overrides a built-in:

- It takes the **built-in's id** (not `pack:{path}`) and its **place** in every list, keeping the built-in's label. The choice's title reads "Your version: {file name}".
- It's used **everywhere the built-in is**, including defaults: a tradition's home biome, a wild lands module's default, Britain as British place names' land, and saved states and presets that name the built-in's id.
- **Its base:** if `based-on` names the built-in it overrides (the usual case), the base is the real built-in, not the pack itself. Other bases work as now.
- **Two packs claiming one built-in:** the first by path wins; the other is listed as an ordinary custom biome under its own name, and the status line says so.
- **Renaming or deleting the pack** brings the built-in back. Nothing is written anywhere.

### 5.3 In Create Pack

- In the Biome tab, typing a name that matches a built-in sets **Start from** to that built-in (unless the user has already chosen one), and a line under the name reads: "Replaces the built-in {label} biome wherever it's used."
- The save notice reads: "biome “{name}” saved – replaces the built-in {label} biome."
- Saving is otherwise unchanged: biome packs save to the names folder, as now.

## 6. Tests

### 6.1 Before anything changes

Record with today's code, and keep passing throughout:

- **Place names:** native British, exploration and expansion, across their settings, three seeds each, count 12; settlement names for its British, new lands and settled lands settings. These become the "placeholders" expectations.
- **Recipe packs:** the existing `recipeRegression` test, plus one linked recipe (`template-of`) and one settlement names preset run from the picker.
- **Biomes:** the existing biome and land snapshots with no custom biomes, plus seas and coasts and wild lands at each built-in biome.

### 6.2 New

- **Archive:** nothing in `src/` or `tests/` imports from `archive/`, and the build doesn't include it.
- **Slot choices:** a pack, a word list, the built-in list and the tribal link each fill their slot; a missing pack falls back to placeholders with a notice; the slot list matches what each setting can produce (§3.4); "names chosen per slot" with every slot on placeholder gives the same output as "placeholders".
- **Presets:** each new preset round-trips (save → parse → same state) and runs from the picker with the same output as the module.
- **Biomes:** a custom biome appears in every list named in §5.1; an override takes the built-in's id and place; an override's `based-on` its own built-in resolves to the real built-in; a module whose default is the overridden built-in uses the override; two claimants resolve as §5.2 says; with no overrides, the snapshots are unchanged.

## 7. Milestones

At the end of each: `npm test` and `npm run build` pass, and commit.

**M0 – Fixtures.** §6.1, recorded and committed before any change.

**M1 – Archive.** §2: tag, move, remove, README. Recipe packs, linked recipes and settlement names presets still run.

**M2 – Slot choices.** §3, in all four modules.

**M3 – Place presets.** §4.

**M4 – Biome overrides.** §5.

## 8. Out of scope

- The nameForge core port: that follows this brief.
- Any change to how slots, lists, packs or biomes draw.
- Converting settlement names presets out of the recipe format.
- Slot choices for British river names or the world cultures.
- Deleting or rewriting anyone's recipe, template or word-list notes.
