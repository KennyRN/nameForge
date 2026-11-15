# nameForge core: the shared generator bundle – brief

**Status:** agreed with Kenny, 8 November 2026; **amended 10 November 2026** for storyForge's needs (storyForge decision 178): no network or dynamic code (§2.7, §13.3), no runtime dependencies (§12), default generation settings exported (§11), a changelog and an attested release of the core (§12), and Kenny's replacement crown (§9.2). Implement in the milestones of §14, **after** the wizard retirement brief (`wizard-retirement-brief.md`) is done and pushed. This brief assumes its results: the place name wizard archived, slot choices in the place-name sentences, presets for native place names, exploration and expansion, and the biome catalogue.

## 1. What this is

The generators come out of the Obsidian plugin into a package with no user interface, **`nameforge-core`**. Two apps use it:

- **The Obsidian plugin**, rewired to import the core. Its behaviour, notes and output don't change.
- **The storyForge app** (Tauri), which imports the core as an npm package and draws its own UI from it. Building storyForge's screens is **not** part of this brief.

The core holds the engines, their JSON data, every module's sentence model, a **module registry** that lets a host run any module the same way, the pack and note formats as text-in/text-out functions, and the generator icons.

Agreed decisions:

| # | Decision | Agreed |
|---|---|---|
| 1 | One shared core, or freeze the plugin | **Shared:** one repo, core in `packages/core`, plugin imports it |
| 2 | A uniform module registry | **Yes:** the per-module glue moves out of `modal.ts` into the core |
| 3 | Modules that don't fit "sentence → generate" (ageing, takeover, Create Pack) | The core exposes the **functions and data**; each host builds its own screens. The place name wizard is archived first and isn't ported |
| 4 | Note format | **Identical** in both apps: one names folder works in either |
| 5 | Packaging | ES modules with TypeScript types; tests move with the engines; icon licences carried over; startup kept light (§10) |

## 2. Hard rules

1. **No output changes.** Every module gives exactly the same names for the same state and seed after this work as before. §13 fixes the regression snapshot, recorded before anything moves.
2. **No behaviour changes in the plugin.** Same UI, menus, notes, presets, history lines and settings. This is a refactor. **The one intended change to the look is the crown** (§9.2).
3. **The core never imports `obsidian`** and never touches the DOM, `window` or a file system. It reads notes only through the host's notes source (§4).
4. **Move, don't rewrite.** Engines, data and sentence files move with `git mv` and keep their history. Change only imports, plus what §5–§9 ask for.
5. **Note formats are frozen.** Packs, presets, safeguards, vocabulary, biome and recipe packs, kit notes and the configuration note read and write byte-for-byte as they do now.
6. Follow the existing conventions: Obsidian-free engines with JSON data, one seeded `mulberry32` stream per batch, sentences as plain segments, British English with OUP punctuation in user-facing text (spaced en dashes; colons rather than dashes in label–value text).
7. **No network, no dynamic code, no storage.** storyForge promises that it makes no network requests and that a writer's files are safe, and it ships this package inside its app. So the core never uses `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `navigator.sendBeacon`, `importScripts`, `eval`, `new Function` or a string passed to `setTimeout`/`setInterval`, and never touches `localStorage`, `sessionStorage` or `indexedDB`. Its only dynamic `import()` is the generators chunk (§10). The purity test (§13.3) enforces this.
8. **No runtime dependencies.** `packages/core/package.json` has no `dependencies` (or an empty one). Anything needed only to build or test it is a `devDependency`.

## 3. Repo layout

npm workspaces, with the plugin staying at the repo root. Obsidian's release process reads `manifest.json` from the root, so the plugin doesn't move.

```
nameForge/
├── package.json            ← adds "workspaces": ["packages/*"]; plugin depends on "nameforge-core": "*"
├── manifest.json, versions.json, styles.css, esbuild.config.mjs   (unchanged places)
├── src/                    ← plugin only: UI and Obsidian glue
├── tests/                  ← plugin-only tests (UI glue, folder setting, migration)
└── packages/
    └── core/
        ├── package.json    ← "name": "nameforge-core", "version": "1.0.0", "type": "module"
        ├── tsconfig.json
        ├── build.mjs       ← esbuild → dist/ (ESM) + tsc --emitDeclarationOnly → dist/*.d.ts
        ├── LICENCE, LICENCES - Third Party
        ├── src/
        │   ├── index.ts        ← public API (§11)
        │   ├── registry/       ← module metadata, runtime definitions, loader (§5–§7, §10)
        │   ├── engines/        ← each engine folder, moved as is (ageing/, buildings/, … world/)
        │   ├── shared/         ← markov, biomes, placeShapes, colonialShapes, colonialSentence, …
        │   ├── formats/        ← packs, presets, safeguards, vocabulary, biome packs, templates, history (§8)
        │   ├── tools/          ← Create Pack, ageing and takeover helpers (§7.6–§7.8)
        │   ├── icons/          ← generator icons (§9)
        │   └── data/           ← the 33 JSON files, moved as is
        └── tests/              ← engine tests, fixtures and the regression snapshot
```

The folder names inside `packages/core/src` are a guide. Keep each engine folder intact. Put the shared files wherever reads best, as long as every engine stays importable on its own path.

### 3.1 What moves and what stays

| Moves to core | Stays in the plugin |
|---|---|
| Every `src/*/engine.ts` and its helpers (`biomes` with `biomeCatalogue`, `markov`, `placeShapes`, `colonialShapes`, `colonialWording`, `colonialSentence`, `nameParser`, `schema`, `space/*`, `settlement/*` except UI, `takeover/batch`, `takeover/recipe`, `takeover/format`, `ageing/format`, `deities/hook`) | `main.ts`, `modal.ts`, `presetModal.ts`, `folderModal.ts`, `settings.ts` |
| Every sentence file (`*/sentence.ts`, `settlement/kitSentence.ts`, `timesky/*Sentence.ts`), and `names/slotOptions.ts` (the slot sentence's rules) | `landMenu.ts` (it becomes a thin Obsidian `Menu` over the core's land model, §5.4) |
| `sections.ts` (line-up, labels, groups, `historySection`) | `loading.ts`, `waters/guide.ts` (UI help text: see §7.9) |
| `presets.ts`, `packs/*`, `names/*`, `templates.ts`, `biomePacks.ts`, `*/safeguardPacks.ts`, `settlement/vocabPacks.ts`, `settlement/kitFormat.ts`, `migration.ts` parsing helpers | `storyforgeBridge.ts`, `hostConnectRetry.ts` (the Obsidian storyForge companion panel) |
| `sectionIcons.ts` and the generator icons from `icons.ts` (§9) | The UI icons in `icons.ts` and the meeple |
| `src/data/*.json` | `paths.ts`, `starterInstall.ts` (vault folder handling) |
| The non-Obsidian parts of `recipeHost.ts`, `takeoverView.ts`, `starterInstall.ts` and the history parsing in `main.ts` | Their Obsidian parts |

Where a file mixes the two (`recipeHost`, `takeoverView`, `main.ts`'s history helpers, the vault-reading parts of `migration`), split it: the pure part moves, the Obsidian part stays and imports it.

`archive/place-name-wizard/` stays where it is, at the repo root, and isn't part of either package.

## 4. The notes source

The core reads the names folder through an interface the host supplies. It never lists or reads files itself.

```ts
export interface NoteRef {
  /** Stable id the host understands: the vault path in Obsidian, the file path in storyForge. */
  path: string;
  /** File name without extension, as Obsidian's `basename`. */
  basename: string;
  read(): Promise<string>;
}

export interface NotesSource {
  /** The names folder's markdown notes, top level only (as `namesFolderNotes()` today). */
  list(): Promise<NoteRef[]> | NoteRef[];
}
```

- **Obsidian:** `list()` maps `namesFolderNotes()` to refs whose `read` is `vault.cachedRead`.
- **storyForge:** its own implementation, through storyForge's own read commands (its window has no file-system permission of its own). Not built here.
- The core may cache what it parses from notes for the length of one `generate` or `prepare` call. It must not cache across calls: the user may have edited a note.

Writing stays with the host. Where the plugin writes a note (presets, packs, kit notes, the configuration note), the core returns the **content** and a suggested file name; the host writes it.

## 5. The module registry

### 5.1 Module metadata

Synchronous and light: no engines or data. It's built from `sections.ts` and `sectionIcons.ts`.

```ts
export type ModuleId = NameForgeSection;          // the existing union, unchanged
export type GroupId = SectionGroup;

export interface ModuleInfo {
  id: ModuleId;
  label: string;           // SECTION_LABELS
  group?: GroupId;         // sectionGroup()
  icon: GeneratorIconId;   // §9
  kind: ModuleKind;        // §5.6
}

export interface GroupInfo { id: GroupId; label: string; icon: GeneratorIconId; modules: ModuleId[] }

export const MODULES: ModuleInfo[];            // in SECTION_ORDER
export const GROUPS: GroupInfo[];              // in SWITCHER_ORDER
export const SWITCHER_ORDER: (ModuleId | GroupId)[];
export function historySection(label: string): ModuleId;   // moved as is
```

`riverNames` is not in the line-up (British river names are a choice within native place names). It keeps its id, label and icon for history, as now.

### 5.2 The common segment

Every sentence already returns the same shape under its own name (`InnSegment`, `RealmSegment` …). Add one shared type and make each module's type an alias of it (keep the field union per module):

```ts
export interface SentenceChoice {
  id: string | undefined;
  label: string;
  title?: string;
  /** Starts a new labelled run of choices in the menu (existing `group`). */
  group?: string;
  /** A disabled heading before this choice (the modal's `heading`/`headingTip`). */
  heading?: string;
  headingTip?: string;
}

export type SentenceSegment<F extends string = string> =
  | string
  | { field: F; text: string; title: string; choices: SentenceChoice[]; current: string | undefined };
```

### 5.3 Module runtime

Loaded on demand (§10). One definition per module; modules that share an engine (the waters, wilds, vessels, bynames, things, group families, calendar and sky) get one definition each, built from a shared factory.

```ts
export interface ModuleDefinition<S = unknown> {
  info: ModuleInfo;
  defaultState(): S;

  /** Reads what the sentence needs from the names folder: pack lists, custom biomes, limits.
   *  Called when the module opens and whenever the host thinks the folder changed. */
  prepare(notes: NotesSource): Promise<ModuleContext>;

  /** One line of segments, or several (the place-name modules' slot sentence is a second line, §7.2). */
  sentence(state: S, ctx: ModuleContext): SentenceSegment[] | SentenceSegment[][];
  choose(state: S, field: string, id: string | undefined, ctx: ModuleContext): S;
  sentenceText(state: S, ctx: ModuleContext): string;   // as the existing *SentenceText helpers

  land?: LandControl<S>;                                 // §5.4
  input?: InputControl<S>;                               // §5.5

  generate(state: S, request: GenerateRequest): Promise<GenerateResult>;
  historyLabel(state: S, ctx: ModuleContext): string;

  preset?: PresetControl<S>;                             // §8.2
}

export interface ModuleContext {
  /** Opaque to the host; the module's own sentence and choose read it. */
  readonly [key: string]: unknown;
  /** Problems found while reading notes, for the host's status line. */
  notices: string[];
}

export interface GenerateRequest {
  count: number;
  /** A locked seed; absent means a fresh one (as `parseSeedInput` today). */
  seed?: number;
  notes: NotesSource;
  /** The plugin's faithfulness and strictness settings, for the modules that use them. */
  faithfulness: number;
  strictness: number;
}

export interface GeneratedItem {
  text: string;
  hasPlaceholder: boolean;
  /** The second line the modal shows today (etymology, tribal details, ageing trail …), or "". */
  etymology: string;
}

export interface GenerateResult {
  seed: number;
  items: GeneratedItem[];
  /** Everything the modal puts in its status line: problems, engine notices, safeguard and vocabulary notices, in today's order. */
  notices: string[];
  /** Only the settlement kit: the note it would write (§7.5). */
  document?: { title: string; suggestedPath: string; markdown: string };
}
```

`generate` does everything the modal's `run…` method does today **except** rendering and history writing: loading safeguards, monument guards, vocabulary and biome packs, catching land errors (`tryLand`), choosing `innFormFor` and similar. Move each module's glue out of `modal.ts` into its definition, line for line, so the call into the engine receives exactly the same options.

### 5.4 Land

Modules with the Land button (biome and terrain) expose:

```ts
export interface LandControl<S> {
  get(state: S): LandState;                 // { biome, terrain }, moved from landMenu.ts
  set(state: S, land: LandState): S;
  defaultLabel(state: S): string;           // "Britain", "Homeland", "Unknown country"
  offersTerrain(state: S): boolean;
}
export function landMenuModel(ctx: ModuleContext, land: LandState): LandMenuModel;  // the menu's items, built from biomeCatalogue
```

Every biome list and lookup goes through `biomeCatalogue` (wizard retirement brief §5), with the custom biomes read in `prepare`, so overrides and custom biomes behave the same in both apps.

The plugin's `LandButton` keeps its look and simply draws `landMenuModel`. The modal's per-module land keys (`britain`, `world:{id}`, `settlement:…`, `colonial:{part}`) become part of each module's state, so storyForge doesn't need to know about them.

### 5.5 Typed input

Modules that take something the user types (name ageing's original name; peoples and tongues when its source is typed names) declare it:

```ts
export interface InputControl<S> {
  label: string;           // as the modal labels the box today
  placeholder?: string;
  multiline: boolean;
  get(state: S): string;
  set(state: S, text: string): S;
}
```

### 5.6 Module kinds

```ts
export type ModuleKind = "sentence" | "packs" | "document" | "tool";
```

| Kind | Modules | Host draws |
|---|---|---|
| `sentence` | All the specialist modules except those below | The sentence, the Land button if `land`, the input box if `input`, quantity, Generate |
| `packs` | `markov` | The pack picker, then the pack's own sentence (§7.1) |
| `document` | `settlementKit` | As `sentence`, but the result is one kit with a note to write |
| `tool` | `nameAgeing`, `nameTakeover` | As `sentence`, plus their extra controls (§7.6–§7.7) |

## 6. The module list

Every module in `SECTION_ORDER`, with its sentence today and what its definition needs. "Extract" means the sentence is currently built imperatively inside `modal.ts` and must become a pure segment builder in the core first (§7).

| Group | Module (id) | Sentence today | Needs |
|---|---|---|---|
| – | markov generator (`markov`) | modal: `renderSectionSentence`, `renderPlaceSentence`, recipe run | **Extract** – §7.1 |
| place names | native place names (`placeShapes`) | modal: `renderNativeSentence`, `nativeClauses`, `landClause`, `spaceClause`, plus the slot sentence | **Extract** – §7.2; land; packs (slot sources); preset |
| place names | exploration into new lands (`explorationPlaceShapes`) | modal: `renderColonialSentence`, `colonialClauses`, plus the slot sentence | **Extract** – §7.3; land; packs; preset |
| place names | expansion into settled lands (`empireExpansionPlaceShapes`) | as exploration | **Extract** – §7.3; land; packs; preset |
| place names | route names (`routeNames`) | `routes/sentence.ts` | safeguards, vocabulary |
| place names | sacred places (`sacredPlaces`) | `deities/sentence.ts` | packs |
| urban | settlement names (`settlementNames`) | `settlement/sentence.ts` + modal `renderSettlementSentence`, plus the slot sentence | **Extract** – §7.4; land; packs; preset (recipe-note format) |
| urban | streets and districts, inns and taverns, buildings and landmarks, monuments and statues | their `sentence.ts` | safeguards, monument guards, vocabulary |
| urban | settlement kit (`settlementKit`) | `settlement/kitSentence.ts` | kind `document` – §7.5 |
| seas and coasts | seas and lakes, coasts and islands, sea charts, hyperspace charts | `waters/sentence.ts` | land where offered |
| wild lands | mountains, forests and woods, deserts, moors and heaths, wetlands, grasslands | `wilds/sentence.ts` | land, vocabulary |
| group names | powers and factions … supernatural courts and hosts (7 families) | `groups/sentence.ts` | safeguards |
| group names | realms and polities | `realms/sentence.ts` | biome lookup, limits |
| group names | peoples and tongues | `peoples/sentence.ts` | packs; `input` when typed |
| group names | tribes and kin groups | `tribes/sentence.ts` | biome lookup, limits, land |
| group names | deities | `deities/sentence.ts` | packs |
| bynames and titles | epithets and bynames, family names, titles and honourifics | `bynames/sentence.ts` | packs |
| vehicles | ships and boats, spacecraft and stations, aircraft and airships, land vehicles | `vessels/sentence.ts` | packs |
| named things | arms and armour, treasures and regalia, books and writings | `things/sentence.ts` | packs |
| advanced | name ageing (`nameAgeing`) | modal: `renderAgeingSentence` | **Extract** – §7.6; kind `tool`; `input` |
| advanced | name takeover (`nameTakeover`) | modal: `renderTakeoverSentence` + `takeoverView.ts` | **Extract** – §7.7; kind `tool` |
| advanced | events and eras, money and coins | their `sentence.ts` | safeguards |
| advanced | calendars and festivals, sky lore | `timesky/*Sentence.ts` | limits |

## 7. Modules that need extracting

For each, the modal keeps exactly its current look by drawing the new segments with its existing `sentenceLink`. Where the modal builds a link from state that isn't a segment today (land keys, per-part tradition maps, eras per culture), that state moves into the module's state type.

### 7.1 markov generator (packs)

- `prepare` lists every pack and preset in the folder with the same classification, labels and order as the pack dropdown today (`NamePackType`, sub-generator, template flag, hidden templates), each with its icon from §9.
- The state holds the chosen pack's path plus the pack's own sentence state: the sections selector (`packs/sections.ts`, "## titles"), the place pack sentence, the compound settings.
- `generate` runs breakdown, list, compound, place and mix packs as `generateNamesFromSource` and the place paths do today, and runs **recipe packs** as `runRecipe` does.
- **Presets** in the picker run through their owning module: `runPreset(note, request)` parses the preset (`parseModulePreset`) and dispatches to that module's `generate` with the preset's state and its history label (`{module label} · {preset name}`).

### 7.2 Native place names

One segment builder covering British, British river and world cultures: region, era per culture, the land clause and the interstellar space clause, exactly as `renderNativeSentence` reads now. The river-option refresh (`refreshRiverOptions`) becomes part of `choose`.

**The slot sentence** (wizard retirement brief §3) is the module's second sentence. Return it as the second line of `sentence` (§5.3); hosts draw each line in turn. The slot links' choices (packs, word lists, the built-in list, tribes and kin groups) come from `prepare`. Slot resolution (`runRecipe`'s, in `recipeHost.ts`) moves into the core with it.

### 7.3 Exploration and expansion

`colonialClauses` becomes a segment builder in `colonialSentence.ts`, with the tradition, context and aliens switch held per part in the state. The slot sentence as §7.2.

### 7.4 Settlement names

`renderSettlementSentence` reuses §7.2 and §7.3 after its size and setting links, as now, slot sentence included. Its presets stay recipe notes: its `PresetControl` writes and reads that format.

### 7.5 Settlement kit

`generate` returns the kit's lines as `items` (as the modal lists them now) and `document` set to `kitNoteContent(kit)` with the path `freeNotePath` would choose. Pass the host's "does this path exist" check in through the request:

```ts
interface GenerateRequest { /* … */ pathExists?: (path: string) => boolean }
```

The plugin writes the note; storyForge does what it likes with it.

### 7.6 Name ageing

`input` is the original name. The target pack link's choices come from `prepare` (the packs `ageingPacks` lists today, with their unusable `reason`). The ages (lightly, well, deeply aged) and the 1–5 quantity are state and request, as in the name ageing pill. `items[].etymology` carries the trail of intermediate forms as the modal shows it.

### 7.7 Name takeover

The native and takeover pack links come from `prepare` (`takeoverView`'s pack lists and reasons). Move `takeoverView.ts`'s selection and batch logic into the core; the Obsidian part that remains is drawing.

### 7.8 Create Pack (a host-drawn tool)

Not a module. The core exports what its screen needs, and the screen stays in the plugin:

- Pack building and validation from pasted names (`nameParser`, `schema`, `packs/compound`, `packs/sections`, place-pack building, the "Breakdown section under 20" save warning), and writing a pack's content.
- Templates (`templates.ts`, the built-in templates, "packs created from a template stay linked").
- Biome packs (`biomePacks.ts`), including the override rule and the "Replaces the built-in … biome" line (wizard retirement brief §5.3).
- Word lists (`packs/wordList.ts`, `names/wordListSource.ts`), which the slot sentence's List choice and biome packs use.
- Recipe packs: parsing, merging linked templates and running (`names/recipe.ts`, `mergeRecipe`), so the picker can still run them. There's no recipe editor to support.

Export each as a plain function. Where the Create Pack modal builds data inline, move that code into the core and have the modal call it.

### 7.9 Help text

The seas and coasts guide (`waters/guide.ts` with `waters/guideText.ts`) mixes text and drawing. Move the **text** (as plain strings or simple heading/paragraph arrays) to the core so storyForge can show the same help; the drawing stays. (`contextGuide.ts` and `wordListGuide.ts` were archived with the wizard.)

## 8. Pack and note formats

### 8.1 Packs, templates and the folder

Export, all working on note text:

- `classifyNote(text, basename)` → pack type, sub-generator, template flag, preset module, or not a nameForge note.
- The parsers and writers for each pack type, templates, biome packs, vocabulary packs, safeguard packs (each family's `isXSafeguardPackContent`, `parseSafeguardPack`, `mergeSafeguards`, the `*_SAFEGUARD_TEMPLATE` texts), and `createVocabularyPack`.
- `packTypeIconId` (moved from `modal.ts`) returning a `GeneratorIconId`.
- The starter templates (`builtin-templates.json`) and the content `starterInstall` writes (starter word lists only, since the recipe templates were retired); the plugin keeps the prompt and the writing.

### 8.2 Presets

```ts
export interface PresetControl<S> {
  /** The name the save box suggests, as `openSave…Preset` builds it today. */
  suggestedName(state: S): string;
  /** The note content `modulePresetContent` writes today. */
  write(state: S, name: string, description: string): string;
  /** Recognises this module's preset when overwriting (the `sameModule` check). */
  owns(text: string, basename: string): boolean;
}
export function parsePreset(text: string, basename: string): { module?: ModuleId; state?: unknown; name?: string; problems: string[] };
```

`parsePreset` wraps `parseModulePreset` and each `…PresetState` mapping currently in the modal (`innPresetState` and its siblings).

### 8.3 Configuration and history

Move the configuration note's parsing and writing out of `main.ts` (frontmatter settings, `## Generation History`, `## Ageing History`, kit history) into the core as pure functions with the same line formats. The plugin keeps reading and writing the file.

## 9. Icons

### 9.1 Which icons

Only the icons tied to generators, plus the dice:

- **Module and group icons:** every icon in `SECTION_ICONS` and `GROUP_ICONS` – 53 custom icons plus `crown`.
- **Pack-type icons:** breakdown, list, compound breakdown, compound list, place, mix and recipe (`ICON_RECIPE_WIZARD`, which recipe packs wear), as `packTypeIconId` uses them.
- **The dice** (`ICON_DICE`) for the Generate button.

Everything else stays in the plugin's `icons.ts`: insert, save, cancel, save preset, seed lock and copy, history, folder, info, help, reset, list tree, adjustments, pencil, plus and create packs, the meeple, and the old generic place names alias.

### 9.2 Crown

`titles`, `treasureNames`, `powerFactions` and `supernaturalCourts` use Obsidian's built-in Lucide `crown`, which storyForge doesn't have. **Kenny replaces it** with a crown of his choosing (Tabler's or another set's), and supplies the SVG.

- Register it in the core as `nameforge-crown`, converted to the 100×100 body the other generator icons use, and point those four modules at it, in both apps. **In Obsidian this replaces the built-in crown:** the one intended change to the plugin's look (§2.2).
- **If Kenny hasn't supplied it by M5, stop and ask.** Don't fall back to Lucide's, and don't draw one.
- Show Kenny the four modules' icons in Obsidian, beside two of their neighbours, so he can judge its weight against the rest.
- Record its source and licence in `LICENCES - Third Party` (§12). Nothing from Lucide is added.

### 9.3 Format

```ts
export type GeneratorIconId = "nameforge-…";   // the existing ids, plus "nameforge-crown"

export interface GeneratorIcon {
  id: GeneratorIconId;
  /** Exactly the markup `addIcon` receives today (Obsidian's 100×100 body). */
  body: string;
  /** A standalone SVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">{body}</svg>`. */
  svg: string;
  source: string;   // e.g. "Majesticons — map-marker-area-line"
  licence: string;  // e.g. "MIT"
}

export const GENERATOR_ICONS: Record<GeneratorIconId, GeneratorIcon>;
export const MODULE_ICONS: Record<ModuleId, GeneratorIconId>;   // was SECTION_ICONS
export const GROUP_ICONS: Record<GroupId, GeneratorIconId>;
```

Wrapping the existing body keeps the drawing identical in both apps. Also write each icon to `packages/core/icons/{id}.svg`, generated by the build from `GENERATOR_ICONS` (not edited by hand), so storyForge can use files if it prefers. The plugin's `registerNameForgeIcons` registers the core's bodies plus its own UI icons.

`currentColor` stays as the fill or stroke throughout, so storyForge's theme colours the icons.

## 10. Loading

The engines are tightly linked: inns import buildings, streets, monuments and settlement vocabulary; groups import names, world, tribes and stars; and two engines **register helpers into others when they load**:

- `deities/engine.ts` calls `setDeityHooks`, which bynames, groups and routes read for their deity back-links.
- `realms/engine.ts` calls `registerRealmSource`, which vessels read for the `{realm}` token.

Loading one module's engine on its own would therefore change its output depending on what else had loaded. So:

1. **`nameforge-core` (the entry)** exports only light things: metadata (§5.1), icons (§9), formats (§8) and types. Importing it doesn't load any engine or generator data.
2. **`loadGenerators(): Promise<Generators>`** dynamically imports one chunk with every engine, sentence and module definition, and all the data. Inside it, the deities and realms engines load **before** any definition is returned. It resolves to `{ module(id): ModuleDefinition; runPreset; tools }` and caches itself.
3. The registrations become explicit: one `engines/links.ts` imports deities and realms for their side effects, and the chunk's entry imports it first. Add a comment there explaining why.
4. The plugin calls `loadGenerators()` once in `onload` and keeps the result. esbuild inlines the dynamic import into `main.js`, so nothing changes for Obsidian.

storyForge then starts with the module list and icons immediately and loads the generators on first use.

## 11. The public API

`packages/core/src/index.ts` exports, in sections with a comment each:

- **Registry:** `MODULES`, `GROUPS`, `SWITCHER_ORDER`, `historySection`, the types of §5.
- **Generators:** `loadGenerators` and the `Generators` type.
- **Formats:** §8.
- **Tools:** §7.8 (exported from `loadGenerators()`'s result, since they need the data).
- **Icons:** §9.
- **Seeds:** `mulberry32`, `parseSeedInput`, and whatever the modal uses to make a fresh seed.
- **Defaults:** `DEFAULT_GENERATION_SETTINGS`, `{ faithfulness, strictness }` at the plugin's own defaults, so a host without those settings passes the same values the plugin does by default.

Anything not exported here is internal. The plugin may import internals through `nameforge-core/internal/…` paths while it's rewired, but list each one in a comment in `packages/core/package.json` `exports` so they can be closed later.

## 12. Packaging and distribution

- `packages/core/package.json`: `"type": "module"`, `exports` for `"."`, `"./icons/*"` and the internal paths, `types` pointing at `dist/index.d.ts`, `files: ["dist", "icons", "LICENCE", "LICENCES - Third Party", "CHANGELOG.md"]`, version **1.0.0**, **no runtime `dependencies`** (§2.8).
- Build: esbuild to `dist/` as ESM (target es2020, code-splitting on so §10's chunk stays separate), then `tsc --emitDeclarationOnly`.
- Root scripts: `npm run build` builds the core, then the plugin. `npm test` runs both test suites.
- **The changelog:** `packages/core/CHANGELOG.md`, starting at 1.0.0. Every later version says, under a heading of its own, **whether any module's output changes** for the same state and seed, and which modules if so. storyForge reads this before taking a new version.
- **Distribution:** `npm pack` in `packages/core` produces `nameforge-core-{version}.tgz`. Don't publish to the npm registry. For local work, storyForge can use a `file:` path to `packages/core`.
- **The release workflow** (`.github/workflows/release.yml`), on a tag:
  - runs `npm ci`, `npm test` and `npm run build`, and stops if either fails
  - packs the core, and **attests the tarball** along with `main.js`, `manifest.json` and `styles.css`
  - attaches the tarball to the release beside the plugin's three files.
  
  **Pin every action to a full commit hash,** with the version in a comment (`actions/checkout`, `actions/setup-node`, `actions/attest-build-provenance`), as storyForge's workflows are: storyForge builds from this tarball, so it inherits this workflow's trust. Change nothing else about how the plugin is released.
- **How storyForge uses it (for information):** storyForge keeps a copy of a released, attested tarball in its own repository and builds from that copy, never from a link. It updates when Kenny chooses, after reading the changelog.
- Licences: the core carries the MIT `LICENCE` and a `LICENCES - Third Party` listing every icon set its icons come from, including Kenny's crown's source.
- Don't bump the plugin's version or tag a release: Kenny decides that.

## 13. Tests

### 13.1 The regression snapshot (first, before anything moves)

Write `tests/fixtures/coreSnapshot.ts` and record `core-snapshot.json` from the **current** code:

- For every module in `SECTION_ORDER`, its default state, plus at least six varied states (different cultures, eras and switches the sentence offers), each at three fixed seeds, count 12. Record the finished strings and the etymology line.
- Every built-in starter template run as a pack (breakdown and list), two seeds each.
- A kit at default and two varied states (the `document` markdown included).
- Name ageing and takeover against the starter templates, three names each.
- The place-name modules and settlement names with names chosen per slot (a pack, a word list, the built-in list and tribes and kin groups), and one module with a biome pack overriding a built-in, using fixture notes in `tests/fixtures/`.

The states are built by driving each module's own `choose…` functions from its default, so they're realistic. Where a module's sentence is extracted (§7), record its states through the engine options the modal passes today.

After every milestone, run the same states through the new path (the registry's `generate`) and require identical output.

### 13.2 Load order

A test that runs bynames, groups, routes and vessels through `loadGenerators()` **in a fresh process without loading anything else first**, and compares them with the snapshot. It must pass: this is what storyForge will do.

### 13.3 Purity

A test that bundles `packages/core/src/index.ts` and the generators chunk with `obsidian` marked as unresolvable and no DOM globals, and fails if:

- anything reaches for `obsidian`, `document` or `window`
- anything uses the network, dynamic code or storage APIs listed in §2.7
- the bundle imports anything from outside the package (no runtime dependencies, §2.8).

`markov.ts` mentions `window` in a comment only; make sure the check looks at code, not comments. Show that it works: each kind of check fails on a small planted example, which is then removed.

### 13.4 Moving the existing tests

Engine, sentence, format and snapshot tests move to `packages/core/tests` with their fixtures. Tests that exercise plugin glue (`folderSetting`, and any others that import from `modal`, `main` or `recipeHost`) stay in `tests/`. Every test that passes now must still pass, on its new imports.

## 14. Milestones

At the end of each: `npm test` and `npm run build` pass, the regression snapshot matches, and commit.

**M0 – Snapshot.** §13.1 on the current code, committed before any move.

**M1 – Workspace and move.** Set up the workspace (§3). `git mv` the engines, data, sentence files, `sections.ts` and the pure helpers into `packages/core`. Fix imports. Add the purity test (§13.3). The plugin builds against the core with no behaviour change. No new APIs yet.

**M2 – Common types, notes source and formats.** `SentenceSegment`, `NotesSource`, §8 (classification, packs, presets, safeguards, vocabulary, biome packs, templates, configuration and history). Split `main.ts`, `migration.ts`, `starterInstall.ts` and `recipeHost.ts` into their pure and Obsidian parts.

**M3 – Registry for the sentence modules.** §5 and the definitions for every module whose sentence already lives in a sentence file (the rows without "Extract" in §6). The modal's `run…`, `…PresetState`, `openSave…Preset` and `run…Preset` methods for those modules shrink to calls into their definitions. Land (§5.4) and input (§5.5).

**M4 – Extracted modules.** §7.1–§7.7: markov packs and presets, native place names, exploration and expansion, settlement names, the kit, ageing and takeover. The modal draws their segments.

**M5 – Tools, help text and icons.** §7.8, §7.9 and §9, including Kenny's crown and the generated `icons/*.svg`.

**M6 – Loading and packaging.** §10, §11 and §12, including the changelog and the release workflow. The load-order test (§13.2). `npm pack` produces the tarball; check it in a scratch project: install the tarball, import the entry, list the modules, load the generators, run one module of each kind, and print an icon's SVG. Confirm the installed package pulled in no other packages.

## 15. Out of scope

- storyForge's UI or any storyForge code.
- Any change to generator output, data, sentences' wording, or the plugin's look (except the crown, §9.2).
- Publishing to the npm registry.
- A Rust port.
- Removing the Obsidian storyForge companion-panel bridge.
