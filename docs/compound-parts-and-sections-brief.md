# Coding brief: pack sections, small lists and compound parts

> [!summary] What this brief asks for
> 1. **Pack sections as a sentence.** The generate view's Section box becomes a sentence listing the pack's `##` headings. The first heading is the default. "whole pack" comes last and can label each name with the list it came from.
> 2. **Small Breakdown lists.** A warning on save, not a block. At generation a small list is used as chosen, with looser settings, and never quietly swapped for the whole pack.
> 3. **Compound pack file layout.** Parts are marked `# Part 1/2/3` (H1). Any part can hold `##` titles. Old `## Part N` files are still read without being rewritten.
> 4. **Compound generation.** Each part has a frequency (all, most, often, sometimes, rarely). There is a new **combined** generator, where each part is Breakdown or List. Titles are chosen through the same sentence as in §1.
> 5. **Compound editor.** The three button pairs become one sentence with an example in brackets. Each part's label becomes a sentence.

Read the whole brief before starting. Work through the milestones in §8 in order, running `npm test` and `npm run build` at the end of each. Commit at the end of each milestone.

---

## 0. Decisions already taken

Do not reopen these.

| Question | Decision |
|---|---|
| Section control in the generate view | A sentence, not a select box, built in the same style as the tribal names sentence (each choice is a phrase that opens a menu) |
| Default section | The pack's **first `##` heading**, every time a pack is loaded. "whole pack" is never the default |
| "whole pack" position | Last in the menu |
| Heading depth offered | **One level only:** `##` headings. `###` subsections are not offered in the sentence |
| Labels on whole-pack results | Offered when "whole pack" is chosen, so the user can see which list each name came from |
| Breakdown minimum | Fixed at **20** names (a constant, no setting) |
| Minimum at save | A **warning**; the pack still saves |
| Minimum at generation | A small list is used as chosen, with a notice. **Never** fall back to the whole pack because a list is small |
| Loosening for small lists | Breakdown results may be names from the source list (`allowSourceCopies: true`), and strictness is one step looser. The novelty check is not involved: it is not wired to any setting and stays at 0 |
| Compound part markers | `# Part 1`, `# Part 2`, `# Part 3` (H1). `##` is free for titles in every pack type |
| Old compound packs | Files using `## Part N` are still read. They are never rewritten on load; they move to the new layout only when the user saves them from the editor |
| Frequency words and values | all = 100%, most = 80%, often = 50%, sometimes = 20%, rarely = 10% |
| Part 1 frequency | Can be set like any other part. If every part is skipped for a name, reroll |
| Generator choices | breakdown, list, **combined**. Combined lets each part be Breakdown or List |

### 0.1 Defaults taken (flagged for review, but build them as written)

| Question | Default |
|---|---|
| Frequency wording in the part sentence | "all of the time", "most of the time", "often", "sometimes", "rarely". "Often of the time" and similar don't read, so only the first two carry "of the time". Frontmatter stores the single words |
| Label format in results | The name, then the list's heading as a muted tag after a middle dot: `Alfred · male` |
| Labels when inserting | Insert, checklist, bullet list, history and ratings use the **name only**; the label is display-only |
| Label default | On ("showing") whenever "whole pack" is chosen |
| How whole pack works with labels on | Each name first picks a list (weighted by the list's number of names), then generates from that list alone, so the label is true. With labels off, whole pack behaves as it does today |
| Names before the first `##` heading | Part of "whole pack"; when labels are on they have no tag |
| A compound title that one part lacks | That part uses all of its names. A part that has the title uses that title's names only |
| Compound whole pack with labels on | Each name picks a title at random (equal chance), then resolves parts as for that title |
| Mix packs | The sentence lists their sources' titles as the select box does today. Whole-pack labels are not offered for Mix packs (parked) |
| `###` subsections in existing packs | Still read and still part of their `##` section. Recipes' male/female draws still use `### Male` / `### Female`. The old "Noble · Male" select options go away |
| Recipe gender draws on compound packs | A drawn gender uses a title of the same name (case-insensitive) if a part has one, else all of the part's names |
| Small-list notice wording | See §2.3. Plain and short |

---

## 1. Pack sections in the generate view

### 1.1 The sentence

Replace `sectionSelectEl` in `modal.ts` (around line 669) with a sentence row, shown only when the loaded pack has at least one `##` heading. That means List and Breakdown packs, compound packs whose parts have titles (§3), and Mix packs whose sources have headings.

> Use the ‹male› names

The menu lists each `##` heading in file order, then **whole pack**. Show headings exactly as written (case kept). Picking **whole pack** extends the sentence:

> Use the ‹whole pack› names, ‹showing› each name's list (Alfred · male)

The second phrase offers **showing** / **hiding**. The bracketed example tracks the choice. When hiding, the example drops the tag: `(Alfred)`.

Build it as segments, following `src/tribes/sentence.ts` and the `.nameforge-recipe-editor__sentence-link` styling, so it reads like the other sentences in the plugin.

### 1.2 Requests

- `sectionOptions` (`src/packs/sections.ts`) returns `##` sections only, then a whole-pack option. Drop the gender subsection entries.
- On pack load, the current request is the **first** option, not `undefined`.
- Choosing a heading behaves as today: that section's names only (including its `###` subsections' names).

### 1.3 Whole pack with labels

- **List packs:** pick a list weighted by its name count, then pick a name from it. The tag is the list's heading.
- **Breakdown packs:** pick a list weighted by its name count, then generate one name from a model built on that list (cache the model per list). The tag is the list's heading. Dedupe across the batch. Apply §2.3 loosening to lists under 20.
- **Compound packs:** see §4.4.
- Results keep the name and its tag separately. The `li` holds the name in a data attribute, and every insert and copy path reads that attribute, not `textContent`. History and ratings record the name only.

---

## 2. Small Breakdown lists

### 2.1 The constant

Add `BREAKDOWN_MIN_NAMES = 20` in one place (e.g. `src/packs/sections.ts`) and use it everywhere the literal `20` is passed today (`modal.ts` around line 3015, `recipeHost.ts` line 284).

### 2.2 At save

When a pack is saved from the editor (`saveToConfiguredFile`, `saveCompoundToConfiguredFile`), find every Breakdown list under the minimum:

- Breakdown packs: each `##` section, or the whole pack if it has no headings.
- Compound packs: each part that is Breakdown (the whole pack's generator, or the part's own in combined). Check each title within the part, or the part as a whole if it has no titles.

If any are short, save anyway and show one Notice listing them, for example:

> Saved. "women" has 11 names and Part 2 "children" has 8. Breakdown lists under 20 names may give short batches or repeat names from the list.

Put the check in a pure function that returns the short lists, so it can be tested without Obsidian.

### 2.3 At generation

- `selectSectionNames` no longer falls back because a list is small. The modal and the recipe host pass a minimum of 0. The fallback for a **missing** heading stays (e.g. a recipe naming a heading the pack no longer has).
- Wherever a Breakdown model is built from a list under the minimum (generate view, recipes, compound Breakdown parts, whole pack with labels), generate with `allowSourceCopies: true` and strictness one step looser (`Math.max(1, strictness - 1)`).
- Show one notice per generation, e.g. `"women" has 11 names: some results may be names from the list.`
- If a list still produces nothing, show `"women" produced no names.` Do not mix in other lists.

---

## 3. Compound pack file layout

### 3.1 New layout

```markdown
---
type: namePack
packType: compoundPack
compoundParts: 3
compoundGenerator: combined
compoundJoining: joined
compoundPartUse: all, sometimes, all
compoundPartGenerators: breakdown, breakdown, list
packName: Orc Names
setting: 
---

# Part 1
Grak
Mor

# Part 2
## male
gash
## women
ith

# Part 3
## male
ak
uk
## women
a
ra
```

- `compoundGenerator`: `breakdown` | `list` | `combined`. Unknown or missing values are `breakdown`, as now.
- `compoundPartUse`: one word per part, comma-separated: `all`, `most`, `often`, `sometimes`, `rarely`. Missing key, missing entries or unknown words mean `all`.
- `compoundPartGenerators`: one of `breakdown` or `list` per part. Only read when `compoundGenerator` is `combined`; missing entries mean `breakdown`.
- Write the new keys only when they differ from the defaults, so a plain pack's frontmatter stays as short as it is now.

### 3.2 Reading

In `nameParser.ts`:

- If the body has `# Part N` (H1) headings, split on those. Each part's text goes through `parseNameSections`, so its `##` headings become that part's titles. Names before a part's first `##` are untitled.
- Otherwise use the existing `## Part N` split (`splitCompoundPartSections`), with no titles.
- Never write to a file while reading it.

The parsed shape keeps, for each part: all its names, its titles in order, and each title's names. Keep `parts: string[][]` (all names per part) so callers that ignore titles still work.

### 3.3 Writing

`createCompoundNamesFileContent` writes the new layout. Each part's titles and names are written back as typed (heading lines kept), using `serialiseNameSections`.

---

## 4. Compound generation

All in `generateCompoundNamesDetailed` (`src/markov.ts`, around line 1459), unless noted.

### 4.1 New options

```ts
partUse?: number[];                          // percentages per part; missing = 100
partGenerators?: ("breakdown" | "list")[];   // used when generator is "combined"
```

`generator` gains `"combined"`.

### 4.2 Pools

Build each part's pool with its own generator: the pack's generator, or `partGenerators[i]` when combined. Keep the order of `nextSubSeed()` calls as it is now. Apply §2.3 loosening to Breakdown parts under the minimum.

### 4.3 Sampling

For each name attempt:

- For each part, if its use is below 100, roll `masterRng() * 100 < use` to decide whether to include it. **Do not draw from the RNG for parts at 100%.** This keeps output identical for existing packs.
- Pick a fragment from each included part.
- If no part was included, the attempt fails and counts towards `maxTries` (reroll).
- `joinCompoundParts` already capitalises whichever fragment comes first.

### 4.4 Titles

Add a pure helper, `compoundPartsFor(parsed, title?)`, that returns `string[][]`:

- No title: every part's names, as today.
- A title: each part that has the title uses that title's names; a part without it uses all its names.

Callers resolve parts with this helper before calling the generator. The generator itself does not know about titles.

The generate view's sentence (§1) lists the union of titles across all parts, in order of first appearance. The first title is the default. For whole pack with labels on, each name picks a title (equal chance), resolves parts with `compoundPartsFor`, generates one name, and tags it with the title. Labels off: no title, as today.

### 4.5 Other callers

- `recipeHost.ts` compound case (around line 310): pass `partUse` and `partGenerators`. A slot's `section` picks a title. A gender draw picks a title of the same name if any part has one, else no title. Stem mode uses part 1 with part 1's own generator.
- `takeoverView.ts` (around line 80): pass `partUse` and `partGenerators`; no titles.
- Generate view (`modal.ts` around line 2939): pass the resolved parts, `partUse` and `partGenerators`.

---

## 5. Compound editor

### 5.1 The pack sentence

Replace the three toggle pairs (2/3 parts, Breakdown/List, Joined/Spaced) in the compound section of the editor (`modal.ts` around line 3770) with one sentence, followed by an example in brackets that tracks the choices:

> Names have ‹2› parts, built as ‹breakdown› and ‹joined› (Wulf+stan = Wulfstan)

| Parts | Joining | Example |
|---|---|---|
| 2 | joined | (Wulf+stan = Wulfstan) |
| 2 | spaced | (Lofty+Tiger = Lofty Tiger) |
| 3 | joined | (Æthel+wulf+stan = Æthelwulfstan) |
| 3 | spaced | (Julius+Octavia+Caesar = Julius Octavia Caesar) |

The generator menu offers **breakdown**, **list** and **combined**.

### 5.2 The part sentences

Replace each `Part N` label above its textarea with:

> Part 1 is used ‹all of the time›

and, when the generator is combined:

> Part 1 is used ‹all of the time›, and is a ‹breakdown›

Frequency menu: all of the time, most of the time, often, sometimes, rarely. Generator menu: breakdown, list. Part 3's sentence and box are hidden when the pack has 2 parts, as now.

### 5.3 The part boxes

- Users can type `## title` lines in any part box. These are kept as typed and saved as titles (§3.3).
- Loading a pack into the editor fills each box with its titles and names. Old-layout packs fill as now.
- Saving runs the §2.2 check.

---

## 6. Compatibility

- A compound pack with no new keys, saved in either layout, gives **exactly** the same names from the same seed as before this change. Capture a fixture before starting M3 and keep it as a regression test.
- List and Breakdown packs without headings: no sentence, same output.
- Recipes and Mix packs keep working unchanged, apart from §2.3 (no small-list fallback) and §4.5.
- Template inheritance for compound packs keeps its current behaviour.

---

## 7. Tests

Add to the existing suites (`npm test`, `scripts/run-tests.mjs`):

- `sectionOptions`: `##` only, file order, whole pack last. No `###` entries.
- Whole pack with labels: every result's tag is the heading of a list that could have produced it.
- Short-list check (§2.2): Breakdown sections and compound Breakdown parts and titles found; List packs and List parts exempt.
- `selectSectionNames` with a small section returns that section, not the whole pack.
- Loosened Breakdown on an 8-name list returns names.
- Compound parsing: new layout with titles; old layout; defaults for missing and unknown keys.
- Compound writing: round trip keeps titles, frequencies and per-part generators.
- Seed regression: an old-style pack matches the captured fixture.
- Frequencies: over 2,000 names, a "sometimes" part appears in roughly 20% (allow a wide margin). No name is ever empty.
- Combined: a List part only yields its source fragments verbatim.
- `compoundPartsFor`: title present, title missing from a part, no title.

---

## 8. Milestones

1. **Sections sentence.** §1.1 and §1.2 for List, Breakdown and Mix packs; whole pack with labels for List and Breakdown (§1.3).
2. **Small lists.** §2 throughout: constant, save warning, no small-list fallback, loosening, notices.
3. **Compound file layout.** §3: parser for both layouts, new keys, writer, titles. Capture the seed fixture first.
4. **Compound generation.** §4: frequencies, reroll, combined, titles in the generate view sentence, recipes and takeover.
5. **Compound editor.** §5: pack sentence, part sentences, part boxes keeping titles.

Run `npm test` and `npm run build` at the end of each milestone, then commit.

---

## 9. Parked

- Whole-pack labels for Mix packs.
- `###` subsections in the sentence (a second level).
- Recipe gender ratios for more than two labels (e.g. `{ male: 45, female: 45, neuter: 10 }`).
- A setting for the Breakdown minimum.
- Wiring the novelty check to a setting.
- Different frequencies per title within a part.
- The macOS app.
