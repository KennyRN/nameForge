// Stellar brief §15.1: the scales, their era gating and the scale-tagged space vocabulary.
import test from "node:test";
import assert from "node:assert/strict";
import { GROUP_DATA, groupListWords, groupSpaceLand } from "../src/groups/engine";
import { mulberry32 } from "../src/markov";
import { SCALES, anyScaleWeights, drawScale, scaleAllows, scaleFilter, scalesFor, spaceDirections, validScale } from "../src/space/scale";

test("§2.2: near future offers any, Pl and Sy; interstellar and no era offer all six", () => {
  assert.deepEqual(scalesFor("NF"), ["any", "Pl", "Sy"]);
  assert.deepEqual(scalesFor("IS"), ["any", "Pl", "Sy", "Nb", "Se", "Ga"]);
  assert.deepEqual(scalesFor(undefined), ["any", "Pl", "Sy", "Nb", "Se", "Ga"]);
  assert.equal(validScale("Ga", "NF"), "any");
  assert.equal(validScale("Sy", "NF"), "Sy");
});

test("§2.4: scaleAllows and scaleFilter", () => {
  assert.ok(scaleAllows({}, "Pl"));
  assert.ok(scaleAllows({ sc: ["Sy"] }, "any"));
  assert.ok(scaleAllows({ sc: ["Sy"] }, "Sy"));
  assert.ok(!scaleAllows({ sc: ["Sy"] }, "Pl"));
  const entries = [{ w: "a", sc: ["Sy"] }, { w: "b" }];
  assert.deepEqual(scaleFilter(entries, "Pl").map((e) => e.w), ["b"]);
  // An empty result falls back to the unfiltered list.
  const only = [{ w: "a", sc: ["Sy"] }];
  assert.deepEqual(scaleFilter(only, "Pl"), only);
});

test("§2.3: any-scale weights", () => {
  assert.deepEqual(anyScaleWeights("NF").map(([, w]) => w), [50, 50, 0, 0, 0]);
  assert.deepEqual(anyScaleWeights("IS").map(([, w]) => w), [20, 25, 20, 20, 15]);
  const rng = mulberry32(5);
  const seen = new Set<string>();
  for (let i = 0; i < 400; i++) seen.add(drawScale("NF", rng));
  assert.deepEqual([...seen].sort(), ["Pl", "Sy"]);
});

test("§3: every spaceLand and spacePrefix tag is a scale; every scale has at least 8 spaceLand words", () => {
  for (const list of ["spaceLand", "spacePrefix", "spaceDirection", "spaceHazard", "orbitAdj"]) {
    for (const e of GROUP_DATA.lists[list]) for (const sc of e.sc ?? []) assert.ok(SCALES.includes(sc), `${list}: ${e.w}`);
  }
  for (const scale of SCALES) {
    assert.ok(groupListWords("spaceLand", "SF", scale).length >= 8, scale);
    assert.ok(spaceDirections(scale).length >= 2, scale);
  }
  // A scale narrows the list: a galaxy-wide word is not a planetary one.
  const pl = groupListWords("spaceLand", "SF", "Pl").map(([w]) => w);
  assert.ok(pl.includes("Saddle") && !pl.includes("Nebula"));
});

test("§3.4: coast and sea words read spaceLand in sci-fi, and keep their own words elsewhere", () => {
  const coast = groupListWords("coastWord", "SF").map(([w]) => w);
  assert.ok(coast.includes("Belt") && coast.includes("Nebula") && !coast.includes("Coast"));
  const sea = groupListWords("seaWord", "SF").map(([w]) => w);
  assert.ok(sea.includes("Reaches") && sea.includes("Worlds") && sea.includes("Rim"));
  assert.ok(groupListWords("coastWord", "FL").map(([w]) => w).includes("Coast"));
});

test("§3.2: a prefix never repeats its space-land word (2,000 draws)", () => {
  const rng = mulberry32(99);
  for (let i = 0; i < 2000; i++) {
    const text = groupSpaceLand("SF", "any", rng, true)!;
    const words = text.split(" ");
    assert.equal(new Set(words.map((w) => w.toLowerCase())).size, words.length, text);
  }
});
