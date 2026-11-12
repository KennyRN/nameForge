# The place name wizard (archived)

## What it was

A multi-page wizard in nameForge for building **recipe packs**: it chose a place-name shape (British, exploration or expansion), a region or tradition, the render settings, and what filled each name slot (a pack, a word list, the built-in list or tribal names). Page 4 held optional word lists for the slots. It lived in the Create Pack modal (the "Place name wizard" pane) and, for existing recipes, behind an **Edit recipe** button in the pack row.

## Why it was retired

`docs/wizard-retirement-brief.md` retired it. The module sentences now do its job: native place names, exploration, expansion and settlement names have **slot choices** (names chosen per slot), their own **presets**, and biome packs can **override** built-in biomes.

Recipe packs written by the wizard still run from the pack picker, linked recipes still merge their templates, and settlement names presets still open in settlement names. Nothing in anyone's notes was changed.

## The tag

The code as it stood just before removal is tagged **`archive/place-name-wizard`** (commit `2616aba`). To see the whole plugin with the wizard in place: `git checkout archive/place-name-wizard`.

## The files

| Archived here | Lived at | Notes |
|---|---|---|
| `recipeEditor.ts` | `src/recipeEditor.ts` | The wizard (`RecipeEditorModal`, `RecipeWizard`) |
| `wizardWords.ts` | `src/names/wizardWords.ts` | Page 4 word lists |
| `wizardWords.test.ts` | `tests/wizardWords.test.ts` | |
| `wordListGuide.ts` | `src/wordListGuide.ts` | Opened only by the wizard |
| `contextGuide.ts` | `src/contextGuide.ts` | Opened only by the wizard |
| `slotTiers.ts` | `src/names/slotOptions.ts` | `SLOT_TIERS`, `TIER_TABLE`, `slotTier`, `tierTableIds`, `tierIncludes` |
| `slotTiers.test.ts` | `tests/slotOptions.test.ts` | The tier tests |

`src/names/slotOptions.ts` itself stays: its option rules decide what the slot sentence offers.

## Not built or tested

This folder is outside `src/`. It is excluded in `tsconfig.json`, `scripts/run-tests.mjs` reads only `tests/`, and nothing in `src/` or `tests/` imports from it (`tests/archive.test.ts` checks that). The files here import from `../../src/…` and won't compile as they stand if those modules change.
