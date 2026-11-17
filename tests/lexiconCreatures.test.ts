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
  assert.ok(lexiconWords("colours").length >= 25);
});

test("creatures: 12 per core culture, 8 per second-tier culture, 30 General, habitats from the list", () => {
  const core = ["anglo-saxon", "norman-british", "welsh", "scottish", "irish", "cornish", "scandinavian", "german"];
  const t6 = new Set(["french", "dutch", "italian", "spanish", "portuguese", "roman", "greek", "byzantine", "slavic", "turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african"]);
  const second = (LENS.cultures as { key: string; tier: string }[]).filter((c) => c.tier === "second").map((c) => c.key);
  for (const c of t6) assert.ok(creaturesFor(c).length >= 12, c);
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

// ── Shared tables brief §13.1: the wiring ──────────────────────────────────

import groupData from "../src/data/group-names.json";
import airLandData from "../src/data/vehicles-air-land.json";
import tribalData from "../src/data/tribal-names.json";
import { LEXICON_WIRING } from "../src/lexiconWiring";
import { BUILT_IN_VOCAB, CREATURE_POOL_HABITATS, poolEntries } from "../src/settlement/vocab";

test("lexicon wiring: every wired module list holds every shared word of its kinds (single words only where it is glued)", () => {
  const files: Record<string, unknown> = { "group-names.json": groupData, "vehicles-air-land.json": airLandData, "tribal-names.json": tribalData };
  for (const { file, list, kinds, single } of LEXICON_WIRING) {
    if (!files[file]) continue;
    const pool = list.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], files[file]) as ({ w: string } | string)[];
    const have = new Set(pool.map((e) => (typeof e === "string" ? e : e.w).toLowerCase()));
    for (const kind of kinds) for (const e of lexiconWords(kind)) if (!single || !/[ -]/.test(e.w)) assert.ok(have.has(e.w.toLowerCase()), `${list} lacks ${e.w}`);
  }
});

test("lexicon wiring: closed lists stay closed", () => {
  const dir = (tribalData.vocabulary.directions as unknown as { compass: string[] }).compass;
  assert.ok(dir.every((w) => !lexiconWords("colours").some((e) => e.w === w)));
  assert.equal(groupData.lists.factionColour.some((e) => /^(Gold|Ruby)$/.test(e.w)), false);
});

test("creatures wiring: a fantastic world adds the culture's creatures of the pool's habitats; a realistic one does not", () => {
  const where = (fantastic: boolean) => ({ culture: "norman-british", era: "MD" as never, fantastic });
  for (const pool of Object.keys(CREATURE_POOL_HABITATS)) {
    const real = poolEntries(BUILT_IN_VOCAB, pool, where(false)).map(([e]) => e.w);
    const fantasy = poolEntries(BUILT_IN_VOCAB, pool, where(true)).map(([e]) => e.w);
    assert.ok(fantasy.length >= real.length, pool);
    assert.deepEqual(real, poolEntries(BUILT_IN_VOCAB, pool, where(false)).map(([e]) => e.w));
  }
  const mountain = poolEntries(BUILT_IN_VOCAB, "mtBeast", where(true)).map(([e]) => e.w);
  assert.ok(creaturesFor("norman-british", "mountain").every((c) => mountain.includes(c.name.replace(/\b[a-z]/g, (ch) => ch.toUpperCase()))));
  assert.equal(poolEntries(BUILT_IN_VOCAB, "mtBeast", where(false)).some(([e]) => e.w === "Troll" && !BUILT_IN_VOCAB.pools.mtBeast.entries.some((x) => x.w === "Troll")), false);
});
