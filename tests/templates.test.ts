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
