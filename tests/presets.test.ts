// Module presets (Presets brief §7.2, §12.1).
import { test } from "node:test";
import assert from "node:assert/strict";
import { isModulePresetContent, modulePresetContent, parseModulePreset, type TribalPreset } from "../src/presets";

const FULL = `---
type: module-preset
module: tribal-names
packName: Highland Tribes
setting:
tradition: celtic
biome: highland
terrain: mountains
register: historical
groupType: kin
perspective: self
hostile: true
---

Iron Age-style kin groups in high mountain country.
`;

test("presets: only module-preset notes are presets", () => {
  assert.equal(isModulePresetContent(FULL), true);
  assert.equal(isModulePresetContent("---\ntype: recipe\n---\n"), false);
  assert.equal(isModulePresetContent("---\ntype: word-list\npackName: Birds\n---\n"), false);
  assert.equal(isModulePresetContent("---\npackName: Saxons\npackType: listPack\n---\nAelfric\n"), false);
});

test("presets: a full preset parses; a bare one takes every default", () => {
  const { preset, problems } = parseModulePreset(FULL, "Highland Tribes");
  assert.deepEqual(problems, []);
  assert.deepEqual(preset, {
    packName: "Highland Tribes",
    setting: "",
    description: "Iron Age-style kin groups in high mountain country.",
    tradition: "celtic",
    biome: "highland",
    terrain: "mountains",
    register: "historical",
    groupType: "kin",
    perspective: "self",
    hostile: true,
  });
  const bare = parseModulePreset("---\ntype: module-preset\nmodule: tribal-names\n---\n", "Bare");
  assert.deepEqual(bare.problems, []);
  assert.deepEqual(bare.preset, {
    packName: "Bare",
    setting: "",
    description: "",
    tradition: "general",
    biome: "homeland",
    terrain: "any",
    register: "plain",
    groupType: "any",
    perspective: "any",
    hostile: false,
  });
});

test("presets: writing then reading round-trips every field", () => {
  const preset: TribalPreset = {
    packName: "Savannah Peoples",
    setting: "Aster",
    description: "Bantu-themed groups on the savannah.",
    tradition: "bantu",
    biome: "[[Salt Marshes]]",
    terrain: "plains",
    register: "administrative",
    groupType: "confederation",
    perspective: "imposed",
    hostile: false,
  };
  assert.deepEqual(parseModulePreset(modulePresetContent(preset), "x").preset, preset);
});

test("presets: unknown values are reported", () => {
  const tradition = parseModulePreset("---\ntype: module-preset\nmodule: tribal-names\ntradition: x\n---\n", "P");
  assert.deepEqual(tradition.problems, ["Unknown tradition “x”."]);
  assert.equal(tradition.preset!.tradition, "general");
  const module = parseModulePreset("---\ntype: module-preset\nmodule: x\n---\n", "P");
  assert.deepEqual(module.problems, ["Unknown module “x”."]);
  assert.equal(module.preset, undefined);
});
