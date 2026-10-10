// Place generators brief §1, §3, §5: placeGenerator, place sections, compound place packs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PlaceNameModel } from "../src/markov";
import { createCompoundNamesFileContent, createNamesFileContent, parseNamesFileContent } from "../src/nameParser";

const place = (extra: string, body: string) => `---\ntype: namePack\npackType: placePack\n${extra}packName: P\nsetting: \n---\n\n${body}`;
const SECTIONED = "## coastal\nGrimsby\nSkegness\n\n## inland\nDerby\nThoresby\n";

const COMPOUND = `---
type: namePack
packType: placePack
placeGenerator: compound
compoundParts: 2
compoundGenerator: combined
compoundJoining: joined
compoundPartUse: all, all
compoundPartGenerators: breakdown, list
packName: Fenland Places
setting: 
---

# Part 1
Ash
Wis
Thorn

# Part 2
## river
ford
bridge
## upland
ley
hill
`;

test("place parsing: placeGenerator missing, unknown, list, compound", () => {
  assert.equal(parseNamesFileContent(place("", "York")).placeGenerator, "breakdown");
  assert.equal(parseNamesFileContent(place("placeGenerator: wibble\n", "York")).placeGenerator, "breakdown");
  assert.equal(parseNamesFileContent(place("placeGenerator: list\n", "York")).placeGenerator, "list");
  const c = parseNamesFileContent(COMPOUND);
  assert.equal(c.packType, "placePack");
  assert.equal(c.placeGenerator, "compound");
  assert.equal(c.compoundGenerator, "combined");
  assert.deepEqual(c.parts, [["Ash", "Wis", "Thorn"], ["ford", "bridge", "ley", "hill"]]);
  assert.deepEqual(c.compoundPartGenerators, ["breakdown", "list"]);
  assert.deepEqual(c.compoundPartData![1].sectioned!.sections.map((s) => s.name), ["river", "upland"]);
});

test("place parsing: sections for breakdown and list place packs; none without headings", () => {
  for (const extra of ["", "placeGenerator: list\n"]) {
    const p = parseNamesFileContent(place(extra, SECTIONED));
    assert.deepEqual(p.sectioned!.sections.map((s) => [s.name, s.names]), [["coastal", ["Grimsby", "Skegness"]], ["inland", ["Derby", "Thoresby"]]]);
    assert.deepEqual(p.names, ["Grimsby", "Skegness", "Derby", "Thoresby"]);
  }
  assert.equal(parseNamesFileContent(place("", "York\nLeeds")).sectioned, undefined);
});

test("place writing: list round trip with titles; placeGenerator omitted for breakdown", () => {
  const p = parseNamesFileContent(place("placeGenerator: list\n", SECTIONED));
  const written = createNamesFileContent("P", p.names, "placePack", { sectioned: p.sectioned, placeGenerator: "list" });
  assert.match(written, /^placeGenerator: list$/m);
  const again = parseNamesFileContent(written);
  assert.equal(again.placeGenerator, "list");
  assert.deepEqual(again.sectioned, p.sectioned);
  assert.ok(!createNamesFileContent("P", ["York"], "placePack", { placeGenerator: "breakdown" }).includes("placeGenerator"));
  assert.ok(!createNamesFileContent("P", ["York"], "listPack", { placeGenerator: "list" }).includes("placeGenerator"));
});

test("place writing: compound round trip keeps titles, frequencies and per-part generators", () => {
  const p = parseNamesFileContent(COMPOUND);
  const written = createCompoundNamesFileContent("Fenland Places", p.compoundPartData!, "combined", "joined", undefined, {
    partUse: ["all", "sometimes"],
    partGenerators: p.compoundPartGenerators,
    place: true,
  });
  assert.match(written, /^packType: placePack\nplaceGenerator: compound$/m);
  const again = parseNamesFileContent(written);
  assert.equal(again.placeGenerator, "compound");
  assert.deepEqual(again.compoundPartUse, ["all", "sometimes"]);
  assert.deepEqual(again.compoundPartGenerators, ["breakdown", "list"]);
  assert.deepEqual(again.compoundPartData, p.compoundPartData);
});

test("seed regression: existing place packs match the captured batches and endings", () => {
  const fixture = JSON.parse(readFileSync("tests/fixtures/place-regression.json", "utf8")) as Record<string, { names: string[]; endings: string[] }>;
  for (const pack of ["english-towns", "latin-towns", "native-places"]) {
    const parsed = parseNamesFileContent(place("", readFileSync(`tests/fixtures/packs/${pack}.txt`, "utf8")));
    assert.equal(parsed.sectioned, undefined);
    for (const seed of [1, 2, 99]) {
      const model = PlaceNameModel.build(parsed.names);
      const names = model.generateDetailed({ count: 25, faithfulness: 2, strictness: 3, seed }).names;
      assert.deepEqual({ names, endings: model.endings.map((e) => JSON.stringify(e)) }, fixture[`${pack} ${seed}`], `${pack} ${seed}`);
    }
  }
});
