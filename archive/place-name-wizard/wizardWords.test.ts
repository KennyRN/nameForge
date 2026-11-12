// The place name wizard's page 4 (Presets brief §4, §6, §12.2).
import { test } from "node:test";
import assert from "node:assert/strict";
import { findBiome } from "../src/biomes";
import { NAME_WORDS } from "../src/names/engine";
import {
  applyWordsToSlots,
  assembleWordsNote,
  baselineText,
  sectionChanged,
  slotBaselineSource,
  slotWordsView,
  wordsNoteDescription,
  wordsNoteName,
} from "../src/names/wizardWords";
import { mergeRecipe, readRecipe, recipeToFrontmatter } from "../src/names/recipe";
import { wordTable } from "../src/names/starterTemplates";

test("page 4: the built-in baseline for bird is its word table", () => {
  const source = slotBaselineSource("organic", "bird", undefined, undefined, "any");
  assert.equal(source.from, "built-in");
  assert.equal(baselineText(source), wordTable(NAME_WORDS.categories.bird));
});

test("page 4: reordered and respaced rows are no change; an added or removed row is", () => {
  const base = wordTable(NAME_WORDS.categories.bird);
  const [header, rule, ...rows] = base.split("\n");
  const shuffled = [header, rule, ...[...rows].reverse().map((r) => r.replace(/\|/g, " |  "))].join("\n");
  assert.equal(sectionChanged(shuffled, base), false);
  assert.equal(sectionChanged(`${base}\n| kiwi | — | kiwis | Kiwi- | Yes |`, base), true);
  assert.equal(sectionChanged([header, rule, ...rows.slice(1)].join("\n"), base), true);
});

test("page 4: a placeholder section with one - word is changed; an empty one is not", () => {
  assert.equal(sectionChanged("- Ship", ""), true);
  assert.equal(sectionChanged("  \n", ""), false);
});

test("page 4: statuses", () => {
  const view = (part: "organic" | "new-land", id: string, slot?: Parameters<typeof slotWordsView>[0]["slot"], biome?: string, native?: string) =>
    slotWordsView({ part, id, label: id, slot, biome: biome ? findBiome(biome) : undefined, terrain: "any", native })!;
  assert.equal(view("organic", "bird").statusText, "Built-in");
  assert.equal(view("new-land", "bird").status, "placeholder");
  assert.equal(view("new-land", "bird", undefined, "savannah").statusText, "Savannah list");
  assert.equal(view("organic", "folk-group", { kind: "tribal", tradition: "auto" }).status, "tribal");
  assert.equal(view("organic", "river-or-stream-name").status, "river");
  assert.equal(view("new-land", "native-place-name", undefined, undefined, "Zulu").status, "native");
  assert.equal(view("organic", "saint-or-holy-person", { kind: "sources", sources: [{ list: "Saints", weight: 1 }] }).statusText, "Word list");
  assert.equal(slotWordsView({ part: "organic", id: "bird", label: "Bird", slot: { kind: "ignore" }, biome: undefined, terrain: "any" }), undefined);
});

test("page 4: note assembly keeps the description and other sections, writes changed ones, drops reset ones", () => {
  const existing = "Words for the [[Danelaw]] recipe.\n\n## Bird\n\n- Raven\n\n## Ships\n\n- Longship, Knarr\n\n## Tree\n\n- Ash";
  const body = assembleWordsNote(existing, wordsNoteDescription("Danelaw"), ["Bird", "Tree"], [{ label: "Tree", text: "- Yew" }]);
  assert.equal(body, "Words for the [[Danelaw]] recipe.\n\n## Ships\n\n- Longship, Knarr\n\n## Tree\n\n- Yew");
  const fresh = assembleWordsNote(undefined, wordsNoteDescription("Danelaw"), ["Bird"], [{ label: "Bird", text: "- Raven" }]);
  assert.equal(fresh, "Words for the [[Danelaw]] recipe.\n\n## Bird\n\n- Raven");
});

test("page 4: changed slots point at the note; reset ones return to their earlier setting", () => {
  const slots = applyWordsToSlots(
    { bird: { kind: "sources", sources: [{ list: "Danelaw words", weight: 100 }] }, tree: { kind: "built-in" } },
    [
      { id: "bird", changed: false, previous: undefined },
      { id: "tree", changed: false, previous: { kind: "built-in" } },
      { id: "colour", changed: true, previous: undefined },
    ],
    "Danelaw words",
  );
  assert.deepEqual(slots, { tree: { kind: "built-in" }, colour: { kind: "sources", sources: [{ list: "Danelaw words", weight: 100 }] } });
});

test("page 4: the note takes the next free name", () => {
  const taken = new Set(["Danelaw words"]);
  assert.equal(wordsNoteName("Danelaw", (n) => taken.has(n)), "Danelaw words 2");
  assert.equal(wordsNoteName("Danelaw", () => false), "Danelaw words");
  assert.equal(wordsNoteName("Danelaw", () => true, "Danelaw words"), "Danelaw words");
});

test("page 4: recipes keep words through YAML; templates never pass it on", () => {
  const { recipe } = readRecipe({ type: "recipe", words: "[[Danelaw words]]" });
  assert.equal(recipe.words, "Danelaw words");
  assert.equal(recipeToFrontmatter(recipe).words, "[[Danelaw words]]");
  assert.equal(mergeRecipe({}, { words: "Template words" }).words, undefined);
  assert.equal(mergeRecipe({ words: "Mine" }, { words: "Template words" }).words, "Mine");
});

test("page 4: an edited slot shows the note's section", () => {
  const view = slotWordsView({
    part: "organic",
    id: "bird",
    label: "Bird",
    slot: { kind: "sources", sources: [{ list: "Danelaw words", weight: 100 }] },
    biome: undefined,
    terrain: "any",
    words: "Danelaw words",
    wordsBody: "Words.\n\n## Bird\n\n- Raven\n- Crow",
  })!;
  assert.equal(view.status, "edited");
  assert.equal(view.text, "- Raven\n- Crow");
  assert.equal(view.resetTo, "built-in");
});
