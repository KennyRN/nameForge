import { test } from "node:test";
import assert from "node:assert/strict";
import { extractNamesFromMarkdown, MarkovModel } from "../src/markov";
import {
  createCompoundNamesFileContent,
  createMixNamesFileContent,
  createNamesFileContent,
  applyTemplate,
  mergeWithTemplate,
  parseNamesFileContent,
  parseTemplateFields,
  parseWordListFileContent,
} from "../src/nameParser";
import { parseNameSections, selectSectionNames, sectionOptions, mergeSectionedNames } from "../src/packs/sections";
import { mergeWordLists, parseWordList, wordListEntries } from "../src/packs/wordList";

const pack = (frontmatter: string, body: string) => `---\ntype: namePack\n${frontmatter}\n---\n\n${body}\n`;
const SECTIONED = `## Noble
### Male
Aethelric, Beornwulf
### Female
Aethelflaed, Cyneburh

## Common
### Male
Dudda, Wiga
### Female
Bebbe, Tila`;

test("unchanged: packs without headings parse and save exactly as before", () => {
  const body = "Keelin\nOsbert\nBrynn\nMarusa";
  const parsed = parseNamesFileContent(pack("packType: breakdownPack\npackName: Old", body));
  assert.deepEqual(parsed.names, extractNamesFromMarkdown(body));
  assert.equal(parsed.sectioned, undefined);
  assert.equal(parsed.template, undefined);
  assert.equal(
    createNamesFileContent("Old", ["A", "B"], "listPack"),
    "---\ntype: namePack\npackType: listPack\npackName: Old\nsetting: \n---\n\nA\nB\n",
  );
  assert.equal(
    createMixNamesFileContent("M", [{ packName: "A", weight: 1 }, { packName: "B", weight: 2 }]),
    "---\ntype: namePack\npackType: mixPack\npackName: M\nsetting: \n---\n\n## Sources\n\n- [[A]] 1\n- [[B]] 2\n",
  );
  assert.ok(!createCompoundNamesFileContent("C", [["a"], ["b"]], "list", "joined").includes("template"));
});

test("unchanged: a sectioned pack's names (no section chosen) match the old extraction, so batches are identical", () => {
  const parsed = parseNamesFileContent(pack("packType: breakdownPack\npackName: S", SECTIONED));
  assert.deepEqual(parsed.names, extractNamesFromMarkdown(SECTIONED));
  const a = MarkovModel.build(parsed.names).generateDetailed({ count: 10, seed: 5 }).names;
  const b = MarkovModel.build(extractNamesFromMarkdown(SECTIONED)).generateDetailed({ count: 10, seed: 5 }).names;
  assert.deepEqual(a, b);
});

test("sections: named section, gender subsection and gender across sections", () => {
  const s = parseNameSections(SECTIONED)!;
  assert.deepEqual(sectionOptions(s).map((o) => o.label), ["Noble", "Common", "whole pack"]);
  assert.deepEqual(selectSectionNames(s, { section: "noble" }).names, ["Aethelric", "Beornwulf", "Aethelflaed", "Cyneburh"]);
  assert.deepEqual(selectSectionNames(s, { section: "Common", gender: "female" }).names, ["Bebbe", "Tila"]);
  assert.deepEqual(selectSectionNames(s, { gender: "male" }).names, ["Aethelric", "Beornwulf", "Dudda", "Wiga"]);
});

test("sections: unsectioned names count as either gender; ## Male sections work", () => {
  const s = parseNameSections("Alex\n## Male\nBran\n## Female\nCait")!;
  assert.deepEqual(selectSectionNames(s, { gender: "female" }).names, ["Alex", "Cait"]);
  assert.deepEqual(selectSectionNames(s, { section: "Male" }).names, ["Bran"]);
});

test("sections: fallback subsection → section → whole pack, with notices", () => {
  const s = parseNameSections("## Noble\nAeth, Beorn\n## Common\n### Male\nDudda")!;
  const missingSub = selectSectionNames(s, { section: "Noble", gender: "female" });
  assert.equal(missingSub.used, "Noble");
  assert.match(missingSub.notices[0], /“Noble · Female” not found — using “Noble”/);
  const missing = selectSectionNames(s, { section: "Clergy" });
  assert.equal(missing.used, "the whole pack");
  assert.equal(missing.names.length, 3);
});

test("sections: a small section is used as chosen, not swapped for the whole pack (Compound brief §2.3)", () => {
  const big = Array.from({ length: 25 }, (_, i) => `Name${String.fromCharCode(97 + (i % 26))}${i}`);
  const s = parseNameSections(`## Noble\n### Male\nAeth\n### Female\n${big.join("\n")}\n## Clergy\nBede\nCuth`)!;
  const clergy = selectSectionNames(s, { section: "Clergy" });
  assert.equal(clergy.used, "Clergy");
  assert.deepEqual(clergy.names, ["Bede", "Cuth"]);
  assert.deepEqual(clergy.notices, []);
  assert.equal(selectSectionNames(s, { section: "Noble", gender: "male" }).used, "Noble · Male");
});

test("templates: fields parse; derived packs inherit what they leave empty, replace what they have", () => {
  assert.deepEqual(parseTemplateFields('template: true\ntemplate-of: "[[Saxon names]]"'), { template: true, templateOf: "Saxon names" });
  const template = parseNamesFileContent(pack("packType: listPack\npackName: T\ntemplate: true", `Shared\n${SECTIONED}`));
  const derived = parseNamesFileContent(
    pack('packType: listPack\npackName: D\ntemplate-of: "[[T]]"', "## Common\n### Female\nEdith\n\n## Clergy\nBede"),
  );
  const merged = mergeWithTemplate(derived, template);
  const s = merged.sectioned!;
  assert.deepEqual(s.unsectioned, ["Shared"]); // inherited list
  assert.deepEqual(selectSectionNames(s, { section: "Noble" }).names.length, 4); // inherited section
  assert.deepEqual(selectSectionNames(s, { section: "Common", gender: "female" }).names, ["Edith"]); // replaced subsection
  assert.deepEqual(selectSectionNames(s, { section: "Common", gender: "male" }).names, ["Dudda", "Wiga"]); // inherited subsection
  assert.deepEqual(selectSectionNames(s, { section: "Clergy" }).names, ["Bede"]); // added section
  assert.equal(template.template, true); // the template object is never modified
  assert.equal(template.sectioned!.sections.length, 2);
});

test("templates: compound parts and mix sources are inherited whole when empty", () => {
  const t = { packName: "T", names: [], packType: "compoundPack" as const, compoundParts: 2 as const, parts: [["Ash"], ["ford"]], setting: "" };
  const d = { packName: "D", names: [], packType: "compoundPack" as const, compoundParts: 2 as const, parts: [[], ["ley"]], setting: "", templateOf: "T" };
  assert.deepEqual(mergeWithTemplate(d, t).parts, [["Ash"], ["ley"]]);
  const tm = { packName: "T", names: [], packType: "mixPack" as const, mixSources: [{ packName: "A", weight: 1 }], setting: "" };
  const dm = { packName: "D", names: [], packType: "mixPack" as const, mixSources: [], setting: "", templateOf: "T" };
  assert.deepEqual(mergeWithTemplate(dm, tm).mixSources, tm.mixSources);
});

test("templates: derived files store the link and only their own names", () => {
  const content = createNamesFileContent("D", [], "listPack", { templateOf: "Saxon names" });
  assert.match(content, /^template-of: "\[\[Saxon names\]\]"$/m);
  assert.equal(parseNamesFileContent(content).templateOf, "Saxon names");
});

test("word lists: blank columns take the §9.1 defaults", () => {
  const list = parseWordList(`## Wild animal
| Modern | Traditional | Plural | Combining forms | Fuses |
|---|---|---|---|---|
| kangaroo | — | kangaroos | Kangaroo- | No |
| emu |  |  |  |  |
| badger | brock | brocks | Brock-, Brocken- | Traditional only |`);
  const [kangaroo, emu, badger] = list.sections[0].entries;
  assert.deepEqual(kangaroo, { modern: "kangaroo", plural: "kangaroos", combiningForms: ["Kangaroo"], fuses: "no" });
  assert.deepEqual(emu, { modern: "emu", plural: "emus", combiningForms: ["emu"], fuses: "yes" });
  assert.deepEqual(badger, { modern: "badger", traditional: "brock", plural: "brocks", combiningForms: ["Brock", "Brocken"], fuses: "traditional-only" });
});

test("word lists: section matching is by label, case-insensitive; fallbacks per §9.2", () => {
  const list = parseWordList("## Wild Animal\n| Modern |\n|---|\n| wolf |\n\n## Bird\n| Modern |\n|---|\n| crane |");
  assert.deepEqual(wordListEntries(list, "wild animal")!.map((e) => e.modern), ["wolf"]);
  assert.equal(wordListEntries(list, "tree"), null); // sections exist but none match → built-in fallback
  const flat = parseWordList("| Modern |\n|---|\n| oak |");
  assert.deepEqual(wordListEntries(flat, "tree")!.map((e) => e.modern), ["oak"]);
});

test("word lists: file parsing and template merge (sections whole)", () => {
  const file = parseWordListFileContent('---\ntype: word-list\npackName: Fauna\ntemplate-of: "[[Base]]"\n---\n\n## Bird\n| Modern |\n|---|\n| emu |');
  assert.equal(file.packName, "Fauna");
  assert.equal(file.templateOf, "Base");
  const base = parseWordList("## Bird\n| Modern |\n|---|\n| crane |\n\n## Tree\n| Modern |\n|---|\n| oak |");
  const merged = mergeWordLists(file.list, base);
  assert.deepEqual(merged.sections.map((s) => [s.name, s.entries.map((e) => e.modern)]), [["Bird", ["emu"]], ["Tree", ["oak"]]]);
});

test("sections: merging leaves both inputs untouched", () => {
  const t = parseNameSections("## A\nx\n## B\ny")!;
  const d = parseNameSections("## A\nz")!;
  const before = JSON.stringify(t);
  mergeSectionedNames(d, t);
  assert.equal(JSON.stringify(t), before);
});

test("templates: missing, chained, self-templated and mismatched templates stop generation", () => {
  const derived = parseNamesFileContent(pack('packType: listPack\npackName: D\ntemplate-of: "[[T]]"', "Ann"));
  const template = parseNamesFileContent(pack("packType: listPack\npackName: T\ntemplate: true", "Bob"));
  assert.match(applyTemplate(derived, undefined).error!, /Template “T” is missing/);
  const chained = parseNamesFileContent(pack('packType: listPack\npackName: T\ntemplate: true\ntemplate-of: "[[U]]"', "Bob"));
  assert.match(applyTemplate(derived, chained).error!, /only one level/);
  const selfTemplate = parseNamesFileContent(pack('packType: listPack\npackName: D\ntemplate: true\ntemplate-of: "[[T]]"', "Ann"));
  assert.match(applyTemplate(selfTemplate, template).error!, /is a template/);
  const place = parseNamesFileContent(pack("packType: placePack\npackName: T\ntemplate: true", "Bob"));
  assert.match(applyTemplate(derived, place).error!, /different pack type/);
  assert.equal(applyTemplate(derived, template).error, undefined);
  assert.deepEqual(applyTemplate(derived, template).parsed.names, ["Ann"]);
});
