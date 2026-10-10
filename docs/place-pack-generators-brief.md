# Coding brief: place pack generators

> [!summary] What this brief asks for
> 1. **Three place generators.** A Place pack can be **breakdown** (today's place model, unchanged), **list** (names picked as written) or **compound** (parts, as in people compound packs).
> 2. **A place pack sentence.** In the Create Pack modal, the Place pane opens with *Place pack will be a ‹breakdown› pack.* Picking compound shows the compound sentence and part boxes, mirrored from people compound.
> 3. **Sections for places.** List and breakdown place packs get `##` titles, the sections sentence and whole-pack labels, as people packs already have.
> 4. **Place model throughout.** Every breakdown in a place pack, including breakdown parts of a compound place pack, uses `PlaceNameModel`.

This builds on `docs/compound-parts-and-sections-brief.md` (already implemented). Reuse its code rather than copying it. Read the whole brief before starting. Work through the milestones in §7 in order, running `npm test` and `npm run build` at the end of each. Commit at the end of each milestone.

---

## 0. Decisions already taken

Do not reopen these.

| Question | Decision |
|---|---|
| Scope | **Places only.** People packs (Breakdown, List, Compound, Mix) and their buttons, icons and editors are left exactly as they are |
| Place breakdown | Today's `PlaceNameModel`, with no change to how it generates |
| Breakdown parts in a place compound | `PlaceNameModel`, for every breakdown part |
| `##` titles in place packs | Allowed in list and breakdown place packs, with the sections sentence and whole-pack labels; compound place packs get titles in parts as people compound packs do |
| Pack type control | A sentence in the Place pane: *Place pack will be a ‹breakdown|list|compound› pack.* The Place button stays where it is |
| Compound place editor | Mirrors the people compound section: the pack sentence with its bracketed example, the part sentences and the part boxes |
| Compound place examples | Place examples, not the people ones (§4.3) |
| Icons | **Every place pack keeps the one place icon**, whatever its generator. No new icon variants |

### 0.1 Defaults taken (flagged for review, but build them as written)

| Question | Default |
|---|---|
| How the generator is stored | `packType: placePack` stays. A new key, `placeGenerator: breakdown | list | compound`. Missing or unknown means `breakdown`, so existing place packs are read without being rewritten |
| Three-part place examples | (Ash+wick+ham = Ashwickham) and (Old+Kings+Bridge = Old Kings Bridge) |
| Discovered endings | The endings panel and the endings shown with results stay, for breakdown place packs only |
| Templates pane | Built-in and user place templates are offered for breakdown and list (both use the text box). Compound shows user compound place templates only; there are no built-in ones yet |
| Recipe stem mode | Breakdown: `sampleStem`, as now. List: the name as written. Compound: part 1, through `sampleStem` if part 1 is breakdown, else picked as written |
| Place packs as corpora | Wherever a place pack's names are read as a whole (Mix sources, ageing targets, takeover packs), list and breakdown give their names; compound gives its parts' fragments flattened, as people compound packs already do in `namesFromParsedPack` |
| Place compound in recipes and takeover | Behaves as people compound does there (§4.5 of the compound brief), with breakdown parts on the place model |

---

## 1. File format

### 1.1 Breakdown and list

```markdown
---
type: namePack
packType: placePack
placeGenerator: list
packName: Danish Settlements
setting: 
---

## coastal
Grimsby
Skegness

## inland
Derby
Thoresby
```

- `placeGenerator` is written only when it is not `breakdown`, so a plain breakdown place pack's frontmatter stays as it is.
- `parseNamesFileContent` runs `parseNameSections` for place packs too (today only List and Breakdown packs get `sectioned`, at `nameParser.ts` around line 184). A place pack with no headings has no `sectioned` and behaves exactly as today.

### 1.2 Compound

The same layout and keys as people compound packs, with `placeGenerator: compound`:

```markdown
---
type: namePack
packType: placePack
placeGenerator: compound
compoundParts: 2
compoundGenerator: combined
compoundJoining: joined
compoundPartUse: all, all
compoundPartGenerators: breakdown, list
packName: Fenland Places
setting: 
---

# Part 1
Ash
Wis
Thorn

# Part 2
## river
ford
bridge
## upland
ley
hill
```

- Reuse `parseCompoundBody`, `parseCompoundUse`, `parseCompoundPartGenerators` and `parseCompoundGenerator`. The parsed shape carries the same compound fields as a people compound pack, plus `placeGenerator`.
- Old `## Part N` layout is read too, as for people compound packs, though no place pack uses it yet.
- `createCompoundNamesFileContent` (or a thin place wrapper around it) writes `packType: placePack` and `placeGenerator: compound`.

---

## 2. Generation

### 2.1 Breakdown

Unchanged for packs without headings. With headings:

- The sections sentence and whole-pack labels work as for people Breakdown packs (compound brief §1), with one `PlaceNameModel` per list (cached).
- Small-list rules (compound brief §2) apply: `PlaceNameModel` already takes `allowSourceCopies`; use `breakdownSettingsFor` for the loosening, and the same notices.
- Discovered endings come from the model actually used: the chosen list's, or, for whole pack, the whole pack's.

### 2.2 List

Names picked as written, as people List packs do (`ListGenerator`), with sections, labels and no minimum.

### 2.3 Compound

- Add an option to `generateCompoundNamesDetailed`: `breakdownModel?: "plain" | "place"` (default `"plain"`). With `"place"`, breakdown pools are built with `PlaceNameModel.build(part).generateDetailed(...)` instead of `MarkovModel`. Keep the order of `nextSubSeed()` calls unchanged, so people compound output stays identical.
- Everything else (frequencies, rerolls, combined, titles through `compoundPartsFor`, small-list loosening) is shared with people compound.
- `joinCompoundParts` is unchanged: joined fuses parts into one word; spaced keeps them as separate capitalised words.

### 2.4 Where it applies

Branch on `placeGenerator` everywhere a place pack is generated from:

- the generate view (`modal.ts` around line 288);
- recipes (`recipeHost.ts` `case "placePack"`, around line 310): honour slot sections and gender draws as for people packs, and stem mode per §0.1;
- takeover (`takeoverView.ts` `case "placePack"`, around line 74);
- the endings lookup (`modal.ts` around line 1870): breakdown only.

---

## 3. Compatibility

- An existing place pack (no `placeGenerator`, no headings) gives **exactly** the same names from the same seed as before. Capture a fixture before M1 and keep it as a regression test.
- People compound output is unchanged by the new `breakdownModel` option (the existing compound seed fixture must still pass).
- No pack file is rewritten on load.

---

## 4. Create Pack modal

### 4.1 The place sentence

When Place is selected, the pane opens with:

> Place pack will be a ‹breakdown› pack

with the choices breakdown, list and compound, built with the same `menuLink` sentence style as the compound pack sentence. The default for a new pack is breakdown.

### 4.2 Breakdown and list

Below the sentence, the existing place text box (`placePack` text pane). `##` lines typed in it are kept and saved as titles. The endings help text stays for breakdown only.

### 4.3 Compound

Below the place sentence, a second sentence and the part boxes, mirrored from the people compound section (`compoundSectionEl`, `renderCompoundSentences`): share the code, parameterised for place, rather than duplicating it.

> Names have ‹2› parts, built as ‹breakdown› and ‹joined› (Ash+ford = Ashford)

| Parts | Joining | Example |
|---|---|---|
| 2 | joined | (Ash+ford = Ashford) |
| 2 | spaced | (Kings+Bridge = Kings Bridge) |
| 3 | joined | (Ash+wick+ham = Ashwickham) |
| 3 | spaced | (Old+Kings+Bridge = Old Kings Bridge) |

Then the part sentences (*Part 1 is used ‹all of the time›*, plus *, and is a ‹breakdown›* when combined) and part boxes keeping `##` titles, exactly as for people.

### 4.4 Loading and saving

- Loading a place pack into the editor sets the sentence from `placeGenerator` and fills the text box or the part boxes.
- Saving writes the matching layout (§1) and runs the short-list check (compound brief §2.2), counting breakdown place lists and breakdown parts.
- Switching the sentence between breakdown and list keeps the text box's contents. Switching to or from compound keeps each side's contents for as long as the modal is open.

### 4.5 Templates and icons

- Templates per §0.1.
- Every place pack uses the existing place icon in the pack dropdown and anywhere else icons appear (`packTypeIconId`), whatever its generator.

---

## 5. Tests

Add to the existing suites:

- Parsing: `placeGenerator` missing, unknown, list, compound; sections parsed for place breakdown and list; compound place fields.
- Writing: round trips for list (with titles) and compound (with titles, frequencies and per-part generators); `placeGenerator` omitted for breakdown.
- Seed regression: an existing place pack matches the captured fixture; the people compound fixture still passes.
- Compound with `breakdownModel: "place"`: breakdown parts come from a `PlaceNameModel`; list parts yield source fragments verbatim.
- Sections: whole-pack labels for place breakdown and list are true to their lists.
- Short-list check counts place breakdown lists and parts; list exempt.
- Recipe stem mode for each generator.

---

## 6. Parked

- Built-in compound place templates.
- Built-in place templates with `##` titles.
- Different examples per culture in the compound place sentence.

---

## 7. Milestones

1. **File format.** §1: `placeGenerator`, sections for place packs, compound place parsing and writing. Capture the place seed fixture first.
2. **Generation.** §2 throughout: breakdown with sections, list, compound on the place model, recipes, takeover, endings, corpora.
3. **Create Pack modal.** §4: the place sentence, the mirrored compound section with place examples, loading, saving, templates, icons.

Run `npm test` and `npm run build` at the end of each milestone, then commit.
