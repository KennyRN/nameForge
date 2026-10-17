// Stellar brief §15.2: star names - proper, possessive, Bayer, catalogue and planet.
import test from "node:test";
import assert from "node:assert/strict";
import { GROUP_DATA, groupStar } from "../src/groups/engine";
import { mulberry32 } from "../src/markov";
import { SCALES, type ScaleChoice } from "../src/space/scale";
import { bayerName, catalogueName, drawStarKind, dropStarWord, planetLetter, spokenCatalogue } from "../src/space/stars";

test("§4.2: Eridani is gone from the proper names, and the new ones are in", () => {
  const stars = GROUP_DATA.lists.star.map((e) => e.w);
  assert.ok(!stars.includes("Eridani"));
  for (const w of ["Alphard", "Alphecca", "Hamal", "Diphda", "Menkar", "Mirfak", "Nunki", "Sadr", "Vega"]) assert.ok(stars.includes(w), w);
});

test("§4.5: catalogue numbers stay in range with the right joiner", () => {
  const rng = mulberry32(7);
  const ranges: Record<string, [number, number, string]> = {
    Gliese: [1, 1000, " "], Wolf: [1, 1500, " "], Ross: [1, 1000, " "], Lalande: [1000, 50000, " "], Groombridge: [1, 4000, " "],
    HD: [1000, 250000, " "], HIP: [1000, 120000, " "], LHS: [1, 5000, " "], Kepler: [1, 2000, "-"], K2: [1, 400, "-"], TOI: [100, 6000, "-"],
  };
  const seen = new Set<string>();
  for (let i = 0; i < 3000; i++) {
    const name = catalogueName(rng);
    const m = /^([A-Za-z0-9]+?)([ -])(\d+)$/.exec(name)!;
    assert.ok(m, name);
    const [lo, hi, joiner] = ranges[m[1]];
    assert.equal(m[2], joiner, name);
    assert.ok(Number(m[3]) >= lo && Number(m[3]) <= hi, name);
    seen.add(m[1]);
  }
  assert.equal(seen.size, 11);
});

test("§4.6: planet letters are b to h", () => {
  const rng = mulberry32(3);
  for (let i = 0; i < 300; i++) assert.match(planetLetter(rng), /^ [b-h]$/);
});

test("§4.4: Bayer names pair a Greek letter with a genitive", () => {
  const rng = mulberry32(11);
  for (let i = 0; i < 200; i++) assert.match(bayerName(rng), /^[A-Z][a-z]+ [A-Z][a-zö]+( Majoris)?$/);
});

test("§4.8: spoken catalogue names", () => {
  assert.equal(spokenCatalogue("Gliese 581"), "Five-Eighty-One");
  assert.equal(spokenCatalogue("Ross 507"), "Five-Oh-Seven");
  assert.equal(spokenCatalogue("Kepler-1132"), "Eleven-Thirty-Two");
  assert.equal(spokenCatalogue("HD 40307"), "Three-Oh-Seven");
  assert.equal(spokenCatalogue("Wolf 22"), "Twenty-Two");
  assert.equal(spokenCatalogue("Gliese 581 d"), "Five-Eighty-One Dee");
  assert.equal(spokenCatalogue("Wolf 500"), "Five Hundred");
  assert.equal(spokenCatalogue("Ross 7"), "Seven");
  assert.equal(spokenCatalogue("HIP 2000"), "Two Thousand");
  assert.equal(spokenCatalogue("Kepler-1005"), "Ten-Oh-Five");
});

test("§6.6: a possessive star drops the word Star", () => {
  assert.equal(dropStarWord("Barnard's Star"), "Barnard's");
  assert.equal(dropStarWord("Vega"), "Vega");
});

test("§4.7: kind shares match the table within ±3 points at every scale", () => {
  const expected: Record<string, Record<string, number>> = {
    any: { proper: 40, possessive: 15, bayer: 20, catalogue: 25 },
    Pl: { proper: 40, possessive: 15, bayer: 20, catalogue: 25 },
    Sy: { proper: 40, possessive: 15, bayer: 20, catalogue: 25 },
    Nb: { proper: 35, possessive: 25, bayer: 25, catalogue: 15 },
    Se: { proper: 25, possessive: 10, bayer: 20, catalogue: 45 },
    Ga: { proper: 40, possessive: 0, bayer: 10, catalogue: 50 },
  };
  for (const scale of ["any", ...SCALES] as ScaleChoice[]) {
    const rng = mulberry32(21);
    const counts: Record<string, number> = { proper: 0, possessive: 0, bayer: 0, catalogue: 0 };
    for (let i = 0; i < 10000; i++) counts[drawStarKind(scale, rng)]++;
    for (const [kind, share] of Object.entries(expected[scale])) {
      assert.ok(Math.abs(counts[kind] / 100 - share) <= 3, `${scale} ${kind}: ${counts[kind] / 100}`);
    }
  }
});

test("§4.7: groupStar returns real names and never a bare genitive", () => {
  const rng = mulberry32(4);
  for (let i = 0; i < 1000; i++) {
    const star = groupStar("SF", "any", rng, { person: () => "Ada" });
    assert.ok(star.length > 2 && star !== "Eridani", star);
  }
});
