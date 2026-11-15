// Shared tables brief §4 (M4): starter templates written from the people tables, and the generated mode.
import { test } from "node:test";
import assert from "node:assert/strict";
import PEOPLE from "../src/data/people.json";
import { mulberry32 } from "../src/markov";
import { builtinTemplates, examplePacks } from "../src/templates";
import { parseNameSections } from "../src/packs/sections";
import { peopleTable, PEOPLE_CULTURES, type PeoplePeriod } from "../src/people";
import { generatedModel, generatedModelCount, generatedName, generationOffered, trainingNames } from "../src/peopleGenerated";
import { templateText } from "../src/templates";

const COVERED = new Set(["cornish/historic", "anglo-saxon/historic", "norman-british/modern"]);
const tables: { culture: string; period: PeoplePeriod }[] = PEOPLE_CULTURES.flatMap((culture) =>
  (["historic", "modern"] as const).filter((period) => peopleTable(culture, period)).map((period) => ({ culture, period })),
);
const fromTable = () => builtinTemplates("people").filter((t) => t.fromTable);

test("a starter template for every table except the three Kenny's own templates cover", () => {
  assert.equal(fromTable().length, tables.length - COVERED.size);
  assert.equal(fromTable().length, 54, "51 and the modern tables of the Aztec, Maya and Andean (shared tables brief §13.4)");
  const names = fromTable().map((t) => t.name);
  assert.equal(new Set(names).size, names.length);
  // No duplicate of Kenny's three.
  for (const n of names) assert.ok(!/^Cornish \(historic\)|^Anglo-Saxon \(historic\)|^Norman & British \(modern\)/.test(n), n);
  for (const n of ["Norman & British (historic)", "Welsh (modern)", "Cornish (modern)", "Greek and Byzantine (historic)", "Polynesian (modern)", "American (modern)"]) assert.ok(names.includes(n), n);
});

test("each template holds its table's Male, Female and Surnames lists in order, and reads back as sections", () => {
  for (const t of fromTable()) {
    const parsed = parseNameSections(templateText(t))!;
    assert.deepEqual(parsed.sections.map((s) => s.name), t.sections!.map((s) => s.name));
    assert.equal(t.sections![0].name, "Male");
    assert.equal(t.sections![1].name, "Female");
  }
  const welsh = builtinTemplates("people").find((t) => t.name === "Welsh (modern)")!;
  const table = peopleTable("welsh", "modern")!;
  assert.deepEqual(welsh.sections![0].items, table.male.map((e) => e[0]));
  assert.deepEqual(welsh.sections![1].items, table.female.map((e) => e[0]));
  assert.deepEqual(welsh.sections![2].items, table.surnames!.map((e) => e[0]));
  // A culture with no surnames in the period has no Surnames section.
  assert.equal(builtinTemplates("people").find((t) => t.name === "Ethiopian (modern)")!.sections!.length, 2);
  assert.equal(builtinTemplates("people").find((t) => t.name === "Welsh (historic)")!.sections!.length, 2);
});

test("the templates are in step with people.json: every table's names are in its template", () => {
  for (const { culture, period } of tables) {
    if (COVERED.has(`${culture}/${period}`)) continue;
    const t = fromTable().find((x) => x.name.endsWith(`(${period})`) && x.sections![0].items[0] === peopleTable(culture, period)!.male[0][0] && x.sections![1].items[0] === peopleTable(culture, period)!.female[0][0]);
    assert.ok(t, `${culture}/${period} has a template`);
  }
  assert.ok((PEOPLE as { version: number }).version >= 3);
});

test("the new templates stay out of the example packs; Kenny's templates are unchanged", () => {
  const paths = examplePacks().map((p) => p.path);
  assert.ok(!paths.some((p) => p.includes("(historic)") || p.includes("(modern)")));
  assert.ok(paths.some((p) => p.includes("Old Cornish")) && paths.some((p) => p.includes("Anglo-Saxon")));
});

test("generation is offered for every list at the Breakdown minimum", () => {
  for (const { culture, period } of tables) {
    const t = peopleTable(culture, period)!;
    for (const list of ["male", "female", "surnames"] as const) {
      if (list === "surnames" && !t.surnames) {
        assert.equal(generationOffered(culture, period, list), false, `${culture}/${period}/surnames`);
        assert.equal(generatedModel(culture, period, list), undefined);
        continue;
      }
      assert.equal(generationOffered(culture, period, list), true, `${culture}/${period}/${list}`);
    }
  }
});

test("a model is built once per culture, period and list and kept", () => {
  const a = generatedModel("french", "modern", "male");
  const b = generatedModel("french", "modern", "male");
  assert.ok(a);
  assert.equal(a, b);
  const before = generatedModelCount();
  generatedModel("french", "modern", "male");
  assert.equal(generatedModelCount(), before);
});

test("generated names are reproducible from the stream, differ from each other and avoid what's avoided", () => {
  const draw = (seed: number) => {
    const rng = mulberry32(seed);
    return Array.from({ length: 12 }, () => generatedName("welsh", "historic", "male", rng)!);
  };
  assert.deepEqual(draw(5), draw(5));
  assert.ok(new Set(draw(5)).size > 6);
  for (const n of draw(5)) assert.match(n, /^[A-Z][A-Za-z' -]+$/);
  const rng = mulberry32(2);
  const first = generatedName("german", "modern", "surnames", rng)!;
  const again = generatedName("german", "modern", "surnames", mulberry32(2), new Set([first]));
  assert.notEqual(again, first);
  // No list, no name: the filler falls back to the real list.
  assert.equal(generatedName("ethiopian", "modern", "surnames", mulberry32(1)), undefined);
});

test("Kenny's templates are the training corpus for Old Cornish, Anglo-Saxon and Victorian, with the table's other names after", () => {
  const cornish = trainingNames("cornish", "historic", "male");
  for (const variant of ["Cemoere", "Cemoyre", "Comoere"]) assert.ok(cornish.includes(variant), variant);
  assert.ok(cornish.includes("Jago"), "the later set is added");
  assert.ok(trainingNames("anglo-saxon", "historic", "female").length >= 25);
  const victorian = trainingNames("norman-british", "modern", "male");
  assert.ok(victorian.includes("Albert") && victorian.includes("Oliver"));
  // Other cultures train on their table alone.
  assert.deepEqual(trainingNames("welsh", "modern", "male"), peopleTable("welsh", "modern")!.male.map((e) => e[0]));
});
