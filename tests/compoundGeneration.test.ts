// Compound brief §4, §7: frequencies, rerolls, the combined generator and titles.
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateCompoundNamesDetailed } from "../src/markov";
import { parseNamesFileContent } from "../src/nameParser";
import { compoundPartData, compoundPartsFor, compoundSettings, compoundTitles, generateCompoundTitled } from "../src/packs/compound";

const FIRST = ["Lofty", "Bright", "Silver", "Quiet", "Red", "Swift", "Old", "Golden", "Little", "Proud", "Grey", "Wild"];
const SECOND = ["Tiger", "Blossom", "River", "Hawk", "Stone", "Fern", "Willow", "Fox", "Moon", "Thorn", "Wren", "Oak"];

test("frequencies: a 'sometimes' part appears in roughly 20% of 2,000 names; no name is empty", () => {
  const result = generateCompoundNamesDetailed([FIRST, SECOND], {
    count: 2000,
    generator: "list",
    joining: "spaced",
    partUse: [100, 20],
    seed: 5,
  });
  // Unique names cap the batch (12 + 144 combinations), so count shares over many seeds instead.
  let withSecond = 0;
  let total = 0;
  for (let seed = 0; seed < 200; seed++) {
    for (const name of generateCompoundNamesDetailed([FIRST, SECOND], { count: 10, generator: "list", joining: "spaced", partUse: [100, 20], seed }).names) {
      assert.ok(name.trim().length > 0);
      total++;
      if (name.includes(" ")) withSecond++;
    }
  }
  assert.ok(result.names.every((n) => n.length > 0));
  const share = withSecond / total;
  assert.ok(share > 0.1 && share < 0.6, `share ${share}`);
});

test("frequencies: when every part is skipped the attempt rerolls, and parts at 100% never draw", () => {
  const rare = generateCompoundNamesDetailed([FIRST, SECOND], { count: 30, generator: "list", joining: "spaced", partUse: [10, 10], seed: 2 });
  assert.equal(rare.names.length, 30);
  assert.ok(rare.names.every((n) => n.length > 0));
  const plain = generateCompoundNamesDetailed([FIRST, SECOND], { count: 20, generator: "list", joining: "joined", seed: 9 });
  const full = generateCompoundNamesDetailed([FIRST, SECOND], { count: 20, generator: "list", joining: "joined", partUse: [100, 100], seed: 9 });
  assert.deepEqual(full.names, plain.names);
});

test("combined: a List part only yields its source fragments verbatim", () => {
  const breakdownPart = ["Aldwin", "Beorhtric", "Cynewulf", "Eadmund", "Godwine", "Leofric", "Osric", "Wulfstan", "Aethelred", "Sigeberht", "Ealdred", "Wigmund", "Heahmund", "Theodric", "Cuthwine", "Ordgar", "Brihtnoth", "Dunstan", "Eadgar", "Wilfrid"];
  const tails = ["son", "ing", "ford"];
  const result = generateCompoundNamesDetailed([breakdownPart, tails], {
    count: 40,
    generator: "combined",
    partGenerators: ["breakdown", "list"],
    joining: "spaced",
    seed: 3,
  });
  assert.ok(result.names.length > 0);
  for (const n of result.names) assert.ok(["Son", "Ing", "Ford"].includes(n.split(" ")[1]), n);
});

const TITLED = `---
type: namePack
packType: compoundPack
compoundParts: 2
compoundGenerator: list
compoundJoining: spaced
packName: T
setting: 
---

# Part 1
Ann
Bob

# Part 2
## male
Smith
## women
Jones
`;

test("compoundPartsFor: title present, title missing from a part, no title", () => {
  const data = compoundPartData(parseNamesFileContent(TITLED));
  assert.deepEqual(compoundTitles(data), ["male", "women"]);
  assert.deepEqual(compoundPartsFor(data), [["Ann", "Bob"], ["Smith", "Jones"]]);
  assert.deepEqual(compoundPartsFor(data, "Women"), [["Ann", "Bob"], ["Jones"]]);
  assert.deepEqual(compoundPartsFor(data, "children"), [["Ann", "Bob"], ["Smith", "Jones"]]);
  assert.deepEqual(compoundPartData({ parts: [["a"], ["b"]] }), [{ names: ["a"] }, { names: ["b"] }]);
});

test("whole pack with labels (compound): each name's tag is a title whose parts can make it", () => {
  const parsed = parseNamesFileContent(TITLED);
  const data = compoundPartData(parsed);
  const { names } = generateCompoundTitled(data, { count: 10, ...compoundSettings(parsed), seed: 1 });
  assert.equal(names.length, 4);
  for (const n of names) {
    const [, second] = n.name.split(" ");
    assert.ok(compoundPartsFor(data, n.tag)[1].includes(second), `${n.name} · ${n.tag}`);
  }
});

test("compoundSettings: part-use words become percentages", () => {
  const s = compoundSettings({ compoundGenerator: "combined", compoundPartUse: ["all", "most", "often", "sometimes", "rarely"] as never, compoundPartGenerators: ["list"] });
  assert.deepEqual(s.partUse, [100, 80, 50, 20, 10]);
  assert.equal(s.generator, "combined");
  assert.deepEqual(s.partGenerators, ["list"]);
});
