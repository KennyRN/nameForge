// Compound brief §1, §7: the sections sentence's options and whole pack with labels.
import { test } from "node:test";
import assert from "node:assert/strict";
import { labelledLists, parseNameSections, sectionOptions } from "../src/packs/sections";
import { generateLabelledNames } from "../src/packs/labelled";

const PACK = "Ash\nBirch\n## male\nAlfred\nBeorn\n### Noble\nCuthbert\n## women\nEdith\nHild\n## Children\nTom";

test("sectionOptions: ## headings only, in file order, whole pack last", () => {
  const options = sectionOptions(parseNameSections(PACK)!);
  assert.deepEqual(options.map((o) => o.label), ["male", "women", "Children", "whole pack"]);
  assert.ok(options[3].whole);
  assert.ok(!options.some((o) => o.label === "Noble" || o.label.includes("·")));
});

test("labelledLists: untitled names untagged, sections include their ### names", () => {
  const lists = labelledLists(parseNameSections(PACK)!);
  assert.deepEqual(lists.map((l) => l.tag), [undefined, "male", "women", "Children"]);
  assert.deepEqual(lists[1].names, ["Alfred", "Beorn", "Cuthbert"]);
});

test("whole pack with labels (List): every tag names a list that holds the name", () => {
  const lists = labelledLists(parseNameSections(PACK)!);
  const { names } = generateLabelledNames(lists, { generator: "list", count: 50, seed: 7 });
  assert.equal(names.length, 8);
  for (const n of names) assert.ok(lists.find((l) => l.tag === n.tag)!.names.includes(n.name), `${n.name} · ${n.tag}`);
});

test("whole pack with labels (Breakdown): tags are headings, names unique, same seed same batch", () => {
  const big = (prefix: string) => Array.from({ length: 40 }, (_, i) => `${prefix}${"aeiou"[i % 5]}${"lmnrst"[i % 6]}${"dkg"[i % 3]}a`);
  const lists = [{ tag: "male", names: big("Bor") }, { tag: "women", names: big("Ela") }];
  const a = generateLabelledNames(lists, { generator: "breakdown", count: 20, seed: 3 });
  const b = generateLabelledNames(lists, { generator: "breakdown", count: 20, seed: 3 });
  assert.deepEqual(a, b);
  assert.ok(a.names.length > 0);
  assert.equal(new Set(a.names.map((n) => n.name.toLowerCase())).size, a.names.length);
  for (const n of a.names) assert.ok(n.tag === "male" || n.tag === "women");
});
