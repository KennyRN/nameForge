// Built-in templates in the Create Pack window.
import { test } from "node:test";
import assert from "node:assert/strict";
import { builtinTemplates, templateNameCount, templateText, templateTypeFor } from "../src/templates";
import { parseNameSections } from "../src/packs/sections";

const section = (template: string, name: string) =>
  builtinTemplates("people").find((t) => t.name === template)!.sections!.find((s) => s.name === name)!.items;

test("templates: each pack type takes its kind of template", () => {
  assert.equal(templateTypeFor("breakdownPack"), "people");
  assert.equal(templateTypeFor("listPack"), "people");
  assert.equal(templateTypeFor("compoundPack"), "people-compound");
  assert.equal(templateTypeFor("placePack"), "place");
  assert.equal(templateTypeFor("mixPack"), undefined);
  assert.equal(templateTypeFor("recipePack"), undefined);
});

test("templates: Victorian, England holds ## male and ## female lists, complete", () => {
  const male = section("Victorian, England", "male");
  assert.equal(male.length, 168);
  assert.equal(new Set(male).size, male.length);
  assert.equal(male[0], "Albert");
  assert.equal(male.at(-1), "Willie");
  const female = section("Victorian, England", "female");
  assert.equal(female.length, 168);
  assert.equal(new Set(female).size, female.length);
  assert.equal(female[0], "Ada");
  assert.equal(female.at(-1), "Winifred");
});

test("templates: Anglo-Saxon holds ## male and ## female lists, unique and alphabetical", () => {
  const male = section("Anglo-Saxon", "male");
  assert.equal(male.length, 77);
  assert.equal(new Set(male).size, male.length);
  assert.deepEqual(male, [...male].sort());
  const female = section("Anglo-Saxon", "female");
  assert.equal(female.length, 25);
  assert.equal(new Set(female).size, female.length);
  assert.deepEqual(female, [...female].sort((a, b) => a.localeCompare(b, "en")));
});

test("templates: a sectioned template fills the box as ## lists the pack reads back", () => {
  const t = builtinTemplates("people").find((x) => x.name === "Anglo-Saxon")!;
  assert.equal(templateNameCount(t), 102);
  const parsed = parseNameSections(templateText(t))!;
  assert.deepEqual(parsed.sections.map((s) => [s.name, s.names.length]), [["male", 77], ["female", 25]]);
  assert.deepEqual(builtinTemplates("people").map((x) => x.name), ["Victorian, England", "Anglo-Saxon"]);
});

import { templatePartTexts } from "../src/templates";
import { compoundPartFromText, compoundTitles } from "../src/packs/compound";

test("templates: Orc is a three-part compound; part 3 has Male, Female and Child titles", () => {
  const t = builtinTemplates("people-compound").find((x) => x.name === "Orc")!;
  assert.deepEqual(t.parts!.map((p) => p.length), [46, 33, 42]);
  const parts = templatePartTexts(t)!.map(compoundPartFromText);
  assert.equal(parts[0].sectioned, undefined);
  assert.deepEqual(compoundTitles(parts), ["Male", "Female", "Child"]);
  const child = t.partSections![2]!.find((s) => s.name === "Child")!.items;
  assert.equal(child.length, 8);
  assert.equal(child.at(-1), "ul");
  assert.ok(!t.parts!.flat().includes("or"));
  assert.deepEqual(parts[2].sectioned!.sections.map((s) => s.names.length), [18, 16, 8]);
});

import { examplePacks, isExamplePackPath } from "../src/templates";
import { parseNamesFileContent } from "../src/nameParser";
import { sectionOptions } from "../src/packs/sections";

test("example packs: Victorian as list and breakdown, Orc as combined; each offers its titles", () => {
  const packs = examplePacks().map((e) => ({ path: e.path, parsed: parseNamesFileContent(e.content) }));
  assert.ok(packs.every((p) => isExamplePackPath(p.path)));
  const [list, breakdown, orc] = packs.map((p) => p.parsed);
  assert.equal(list.packType, "listPack");
  assert.equal(breakdown.packType, "breakdownPack");
  for (const p of [list, breakdown]) assert.deepEqual(sectionOptions(p.sectioned!).map((o) => o.label), ["male", "female", "whole pack"]);
  assert.equal(list.names.length, 333); // Jessie, Marion and Willie are in both lists
  assert.equal(orc.compoundGenerator, "combined");
  assert.deepEqual(orc.compoundPartUse, ["all", "sometimes", "all"]);
  assert.deepEqual(compoundTitles(orc.compoundPartData!), ["Male", "Female", "Child"]);
});
