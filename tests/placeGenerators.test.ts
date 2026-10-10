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

// ── Generation (§2) ─────────────────────────────────────────────────────────
import { generateCompoundNamesDetailed, mulberry32 } from "../src/markov";
import { generateLabelledNames } from "../src/packs/labelled";
import { labelledLists } from "../src/packs/sections";
import { placePackDraw } from "../src/packs/placeDraw";

const TOWNS = readFileSync("tests/fixtures/packs/english-towns.txt", "utf8").split("\n").filter(Boolean);
const LATIN = readFileSync("tests/fixtures/packs/latin-towns.txt", "utf8").split("\n").filter(Boolean);

test("compound with breakdownModel place: breakdown parts come from a PlaceNameModel; list parts verbatim", () => {
  const tails = ["ford", "bridge", "ley"];
  const seed = 11;
  const result = generateCompoundNamesDetailed([TOWNS, tails], {
    count: 20,
    generator: "combined",
    partGenerators: ["breakdown", "list"],
    joining: "spaced",
    breakdownModel: "place",
    seed,
  });
  const subSeed = Math.floor(mulberry32(seed)() * 0xffffffff) >>> 0;
  const pool = PlaceNameModel.build(TOWNS).generateDetailed({ count: 30, faithfulness: 2, strictness: 3, seed: subSeed }).names;
  assert.ok(result.names.length > 0);
  for (const n of result.names) {
    const last = n.split(" ").at(-1)!;
    assert.ok(["Ford", "Bridge", "Ley"].includes(last), n);
    assert.ok(pool.map((p) => p.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")).includes(n.slice(0, -last.length - 1)), n);
  }
});

test("whole-pack labels for place breakdown and list are true to their lists", () => {
  const p = parseNamesFileContent(place("placeGenerator: list\n", SECTIONED));
  const lists = labelledLists(p.sectioned!);
  for (const n of generateLabelledNames(lists, { generator: "list", count: 10, seed: 2 }).names) {
    assert.ok(lists.find((l) => l.tag === n.tag)!.names.includes(n.name));
  }
  const big = [{ tag: "english", names: TOWNS }, { tag: "latin", names: LATIN }];
  const a = generateLabelledNames(big, { generator: "place", count: 20, seed: 5 });
  assert.ok(a.names.length > 0);
  for (const n of a.names) assert.ok(n.tag === "english" || n.tag === "latin");
  assert.deepEqual(a, generateLabelledNames(big, { generator: "place", count: 20, seed: 5 }));
});

test("recipe draws: stem mode for each place generator", () => {
  const rng = mulberry32(3);
  const breakdown = placePackDraw(parseNamesFileContent(place("", TOWNS.join("\n"))), {});
  const stem = breakdown({}, "stem", rng);
  assert.ok(stem && stem.length > 0);
  assert.equal(stem, PlaceNameModel.build(TOWNS).sampleStem(mulberry32(3)));
  const list = placePackDraw(parseNamesFileContent(place("placeGenerator: list\n", SECTIONED)), {});
  for (let i = 0; i < 10; i++) assert.ok(["Grimsby", "Skegness", "Derby", "Thoresby"].includes(list({}, "stem", rng)!));
  assert.ok(["Derby", "Thoresby"].includes(list({ section: "inland" }, "whole", rng)!));
  const listFirst = parseNamesFileContent(COMPOUND.replace("compoundPartGenerators: breakdown, list", "compoundPartGenerators: list, list"));
  for (let i = 0; i < 10; i++) assert.ok(["Ash", "Wis", "Thorn"].includes(placePackDraw(listFirst, {})({}, "stem", rng)!));
  const breakdownFirst = placePackDraw(parseNamesFileContent(COMPOUND.replace(/# Part 1\n[\s\S]*?\n\n# Part 2/, `# Part 1\n${TOWNS.join("\n")}\n\n# Part 2`)), {});
  assert.ok(breakdownFirst({}, "stem", rng));
  const whole = placePackDraw(parseNamesFileContent(COMPOUND), {})({ section: "river" }, "whole", rng);
  assert.ok(whole && /(ford|bridge)$/.test(whole), String(whole));
});

import { shortBreakdownLists } from "../src/packs/sections";
import { partIsBreakdown } from "../src/packs/compound";

test("short-list check counts place breakdown lists and breakdown parts; list exempt", () => {
  const p = parseNamesFileContent(place("", SECTIONED));
  const breakdown = (p.placeGenerator ?? "breakdown") === "breakdown";
  assert.deepEqual(shortBreakdownLists([{ body: SECTIONED, breakdown }]), [
    { title: "coastal", count: 2 },
    { title: "inland", count: 2 },
  ]);
  assert.deepEqual(shortBreakdownLists([{ body: SECTIONED, breakdown: parseNamesFileContent(place("placeGenerator: list\n", SECTIONED)).placeGenerator === "breakdown" }]), []);
  const c = parseNamesFileContent(COMPOUND);
  const short = shortBreakdownLists(
    c.compoundPartData!.map((part, i) => ({ part: i + 1, body: part.sectioned ? "## x\n" + part.names.join("\n") : part.names.join("\n"), breakdown: partIsBreakdown(c.compoundGenerator!, c.compoundPartGenerators, i) })),
  );
  assert.deepEqual(short, [{ part: 1, count: 3 }]);
});
