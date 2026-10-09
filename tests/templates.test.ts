// Built-in templates in the Create Pack window.
import { test } from "node:test";
import assert from "node:assert/strict";
import { builtinTemplates, templateTypeFor } from "../src/templates";

test("templates: each pack type takes its kind of template", () => {
  assert.equal(templateTypeFor("breakdownPack"), "people");
  assert.equal(templateTypeFor("listPack"), "people");
  assert.equal(templateTypeFor("compoundPack"), "people-compound");
  assert.equal(templateTypeFor("placePack"), "place");
  assert.equal(templateTypeFor("mixPack"), undefined);
  assert.equal(templateTypeFor("recipePack"), undefined);
});

test("templates: Victorian, England, Male is complete", () => {
  const victorian = builtinTemplates("people").find((t) => t.name === "Victorian, England, Male")!;
  const items = victorian.items!;
  assert.equal(items.length, 168);
  assert.equal(new Set(items).size, items.length);
  assert.equal(items[0], "Albert");
  assert.equal(items.at(-1), "Willie");
});
