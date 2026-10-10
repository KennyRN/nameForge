// Compound brief §3, §6, §7: the `# Part N` layout, its keys, writing, and the seed regression.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateCompoundNamesDetailed } from "../src/markov";
import { createCompoundNamesFileContent, parseNamesFileContent } from "../src/nameParser";
import { COMPOUND_FIXTURE_PACKS } from "./fixtures/compoundPacks";

const NEW = `---
type: namePack
packType: compoundPack
compoundParts: 3
compoundGenerator: combined
compoundJoining: joined
compoundPartUse: all, sometimes, all
compoundPartGenerators: breakdown, breakdown, list
packName: Orc Names
setting: 
---

# Part 1
Grak
Mor

# Part 2
## male
gash
## women
ith

# Part 3
## male
ak
uk
## women
a
ra
`;

test("compound parsing: new layout with titles and keys", () => {
  const p = parseNamesFileContent(NEW);
  assert.equal(p.compoundGenerator, "combined");
  assert.deepEqual(p.parts, [["Grak", "Mor"], ["gash", "ith"], ["ak", "uk", "a", "ra"]]);
  assert.deepEqual(p.compoundPartUse, ["all", "sometimes", "all"]);
  assert.deepEqual(p.compoundPartGenerators, ["breakdown", "breakdown", "list"]);
  assert.equal(p.compoundPartData![0].sectioned, undefined);
  assert.deepEqual(p.compoundPartData![2].sectioned!.sections.map((s) => [s.name, s.names]), [["male", ["ak", "uk"]], ["women", ["a", "ra"]]]);
});

test("compound parsing: old layout has no titles; missing and unknown keys take defaults", () => {
  const old = parseNamesFileContent(COMPOUND_FIXTURE_PACKS["breakdown-joined-2"]);
  assert.equal(old.compoundGenerator, "breakdown");
  assert.deepEqual(old.compoundPartUse, ["all", "all"]);
  assert.equal(old.compoundPartGenerators, undefined);
  assert.ok(old.compoundPartData!.every((p) => !p.sectioned));
  const odd = parseNamesFileContent(
    NEW.replace("compoundGenerator: combined", "compoundGenerator: wibble")
      .replace("compoundPartUse: all, sometimes, all", "compoundPartUse: never, rarely")
      .replace("compoundPartGenerators: breakdown, breakdown, list", "compoundPartGenerators: list"),
  );
  assert.equal(odd.compoundGenerator, "breakdown");
  assert.deepEqual(odd.compoundPartUse, ["all", "rarely", "all"]);
  assert.equal(odd.compoundPartGenerators, undefined, "only read when combined");
  const combined = parseNamesFileContent(NEW.replace("compoundPartGenerators: breakdown, breakdown, list", "compoundPartGenerators: list"));
  assert.deepEqual(combined.compoundPartGenerators, ["list", "breakdown", "breakdown"]);
  const bare = parseNamesFileContent(NEW.replace(/compoundPart(Use|Generators):.*\n/g, ""));
  assert.deepEqual(bare.compoundPartUse, ["all", "all", "all"]);
  assert.deepEqual(bare.compoundPartGenerators, ["breakdown", "breakdown", "breakdown"]);
});

test("compound writing: round trip keeps titles, frequencies and per-part generators", () => {
  const p = parseNamesFileContent(NEW);
  const written = createCompoundNamesFileContent("Orc Names", p.compoundPartData!, "combined", "joined", undefined, {
    partUse: p.compoundPartUse,
    partGenerators: p.compoundPartGenerators,
  });
  assert.match(written, /^# Part 2\n\n## male\n\ngash\n\n## women\n\nith$/m);
  assert.ok(!written.includes("## Part"));
  const again = parseNamesFileContent(written);
  for (const key of ["parts", "compoundPartUse", "compoundPartGenerators", "compoundGenerator", "compoundPartData"] as const) {
    assert.deepEqual(again[key], p[key], key);
  }
});

test("compound writing: plain packs don't gain the new keys", () => {
  const written = createCompoundNamesFileContent("C", [["a"], ["b"]], "breakdown", "joined", undefined, { partUse: ["all", "all"] });
  assert.ok(!written.includes("compoundPartUse") && !written.includes("compoundPartGenerators"));
  assert.ok(!createCompoundNamesFileContent("C", [["a"], ["b"]], "list", "joined", undefined, { partGenerators: ["list", "list"] }).includes("compoundPartGenerators"));
});

test("seed regression: old-layout packs, and the same packs re-saved in the new layout, match the captured batches", () => {
  const fixture = JSON.parse(readFileSync("tests/fixtures/compound-regression.json", "utf8")) as Record<string, string[]>;
  for (const [key, content] of Object.entries(COMPOUND_FIXTURE_PACKS)) {
    if (key.includes("tiny")) continue; // gave nothing before; §2.3 loosening now gives names
    const old = parseNamesFileContent(content);
    const resaved = parseNamesFileContent(
      createCompoundNamesFileContent("Fixture", old.compoundPartData!, old.compoundGenerator!, old.compoundJoining!, undefined, { partUse: old.compoundPartUse }),
    );
    for (const parsed of [old, resaved]) {
      for (const seed of [1, 2, 99]) {
        const names = generateCompoundNamesDetailed(parsed.parts ?? [], {
          count: 25,
          generator: parsed.compoundGenerator ?? "breakdown",
          joining: parsed.compoundJoining ?? "joined",
          seed,
        }).names;
        assert.deepEqual(names, fixture[`${key} ${seed}`], `${key} ${seed}`);
      }
    }
  }
});

test("tiny Breakdown parts that gave nothing are loosened and now give names (§2.3)", () => {
  const fixture = JSON.parse(readFileSync("tests/fixtures/compound-regression.json", "utf8")) as Record<string, string[]>;
  assert.deepEqual(fixture["breakdown-joined-3-tiny 1"], []);
  const p = parseNamesFileContent(COMPOUND_FIXTURE_PACKS["breakdown-joined-3-tiny"]);
  const result = generateCompoundNamesDetailed(p.parts!, { count: 10, generator: "breakdown", joining: "joined", seed: 1 });
  assert.ok(result.names.length > 0);
  assert.ok((result.loosened ?? []).length > 0);
});

import { compoundPartFromText } from "../src/packs/compound";

test("editor part boxes: typed ## titles save as titles and come back as typed (§5.3)", () => {
  const boxes = ["Grak\nMor", "## male\ngash\n## women\nith"];
  const parts = boxes.map(compoundPartFromText);
  const written = createCompoundNamesFileContent("Orcs", parts, "combined", "joined", undefined, {
    partUse: ["all", "sometimes"],
    partGenerators: ["list", "breakdown"],
  });
  assert.match(written, /^compoundPartUse: all, sometimes$/m);
  assert.match(written, /^compoundPartGenerators: list, breakdown$/m);
  const parsed = parseNamesFileContent(written);
  assert.deepEqual(parsed.compoundPartData![1].sectioned!.sections.map((s) => s.name), ["male", "women"]);
  assert.deepEqual(parsed.parts, [["Grak", "Mor"], ["gash", "ith"]]);
});
