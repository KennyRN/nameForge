// Shared tables brief §7 and §8 (M7, M8): the core lexicon and the mythic creatures.
import { test } from "node:test";
import assert from "node:assert/strict";
import LENS from "../src/data/lens.json";
import { LEXICON_KINDS, lexiconWords } from "../src/lexicon";
import { creaturesFor, CREATURE_CULTURES } from "../src/creatures";
import { PEOPLE_CULTURES } from "../src/people";

test("the lexicon holds de-duplicated lists of the eleven kinds", () => {
  assert.deepEqual([...LEXICON_KINDS].sort(), ["colours", "directions", "gems", "metals", "numbers", "ordinals", "seasons", "sizes", "trades", "virtues", "weather"]);
  for (const k of LEXICON_KINDS) {
    const words = lexiconWords(k).map((e) => e.w.toLowerCase());
    assert.ok(words.length >= 8, k);
    assert.equal(new Set(words).size, words.length, k);
  }
  assert.ok(lexiconWords("colours").length >= 50);
});

test("creatures: 12 per core culture, 8 per second-tier culture, 30 General, habitats from the list", () => {
  const core = ["anglo-saxon", "norman-british", "welsh", "scottish", "irish", "cornish", "scandinavian", "german"];
  const second = (LENS.cultures as { key: string; tier: string }[]).filter((c) => c.tier === "second").map((c) => c.key);
  assert.equal(creaturesFor("general").length, 30);
  for (const c of core) assert.ok(creaturesFor(c).length >= 12, c);
  for (const c of second) assert.ok(creaturesFor(c).length >= 8, c);
  for (const c of PEOPLE_CULTURES) assert.ok(CREATURE_CULTURES.includes(c), c);
  const habitats = new Set(["mountain", "forest", "water", "sea", "moor", "desert", "sky", "underground", "home"]);
  for (const c of CREATURE_CULTURES) for (const cr of creaturesFor(c)) {
    assert.ok(cr.habitats.length > 0 && cr.habitats.every((h) => habitats.has(h)), `${c}/${cr.name}`);
    assert.ok(/^[a-z' -]+$/.test(cr.name), `${c}/${cr.name}`);
  }
  assert.ok(creaturesFor("scottish", "water").some((c) => c.name === "kelpie"));
});
