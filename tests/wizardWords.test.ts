// The place name wizard's page 4 (Presets brief §4, §6, §12.2).
import { test } from "node:test";
import assert from "node:assert/strict";
import { findBiome } from "../src/biomes";
import { NAME_WORDS } from "../src/names/engine";
import { slotBaselineSource, baselineText, sectionChanged, slotWordsView } from "../src/names/wizardWords";
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
