// Place modules split brief §9: the three wide place modules leave the line-up; their presets, recipe
// packs, history rows and engines stay.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GROUP_LABELS, historySection, RETIRED_SECTIONS, SECTION_GROUPS, SECTION_LABELS, SECTION_ORDER, SWITCHER_ORDER } from "../src/sections";
import { SECTION_ICONS } from "../src/sectionIcons";
import { EXPANSION_PRESET_MODULE, EXPLORATION_PRESET_MODULE, NATIVE_PLACE_PRESET_MODULE, parseModulePreset } from "../src/presets";

const RETIRED = ["placeShapes", "explorationPlaceShapes", "empireExpansionPlaceShapes"] as const;

test("the three modules are out of the line-up, the place names group and the switcher", () => {
  assert.deepEqual([...RETIRED_SECTIONS], [...RETIRED]);
  for (const m of RETIRED) {
    assert.ok(!SECTION_ORDER.includes(m), m);
    assert.ok(!(Object.values(SECTION_GROUPS) as string[][]).some((g) => g.includes(m)), m);
    assert.ok(!(SWITCHER_ORDER as string[]).includes(m), m);
  }
  assert.deepEqual(SECTION_GROUPS.placeNames, ["lands", "farmland", "hillsValleys", "riversInland", "routeNames", "sacredPlaces", "starsSpace"]);
  assert.equal(GROUP_LABELS.placeNames, "place names");
});

test("their labels, icons and history rows are kept", () => {
  assert.equal(SECTION_LABELS.placeShapes, "native place names");
  assert.equal(SECTION_LABELS.explorationPlaceShapes, "exploration into new lands");
  assert.equal(SECTION_LABELS.empireExpansionPlaceShapes, "expansion into settled lands");
  for (const m of RETIRED) assert.ok(SECTION_ICONS[m], `${m} keeps its icon`);
  assert.equal(historySection("native place names · My preset"), "placeShapes", "a retired preset's history row");
  assert.equal(historySection("british place names · all of Britain"), "placeShapes");
  assert.equal(historySection("exploration into new lands · Spanish · frontier"), "explorationPlaceShapes");
  assert.equal(historySection("expansion into settled lands · French · garrison"), "empireExpansionPlaceShapes");
  assert.equal(historySection("exploration place names · Spanish"), "explorationPlaceShapes");
});

test("a preset of a retired module still parses, with its saved sentence and no loss", () => {
  const note = (module: string, extra: string) => `---\ntype: module-preset\nmodule: ${module}\npackName: Saved\nsetting: \nbiome: \nterrain: any\nplaceNames: placeholders\n${extra}---\nBritish place names, set in all of Britain.\n`;
  const native = parseModulePreset(note(NATIVE_PLACE_PRESET_MODULE, "culture: britain\nregion: all\nera: \n"), "Saved");
  assert.ok(native.nativePlace, "a native place names preset");
  assert.equal(native.nativePlace!.description, "British place names, set in all of Britain.");
  const exploration = parseModulePreset(note(EXPLORATION_PRESET_MODULE, "tradition: general\ncontext: frontier\naliens: false\n"), "Saved");
  assert.ok(exploration.exploration, "an exploration preset");
  const expansion = parseModulePreset(note(EXPANSION_PRESET_MODULE, "tradition: general\ncontext: garrison\naliens: false\n"), "Saved");
  assert.ok(expansion.expansion, "an expansion preset");
});

test("choosing a retired preset shows its sentence as plain text under the heading, with no Open in", () => {
  const modal = readFileSync("src/modal.ts", "utf8");
  assert.match(modal, /From a retired module: runs as saved/);
  assert.match(modal, /this\.openPresetButton\?\.toggle\(this\.activeSection === "markov" && !retired\)/, "no Open in for a retired preset");
  assert.match(modal, /groupModule: Record<SectionGroup, NameForgeSection> = \{ placeNames: "lands"/, "the group opens at lands and territories");
});
