import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MarkovModel, mulberry32 } from "../src/markov";
import {
  type Adoption,
  adoptName,
  AGEING_MOVES,
  buildInventory,
  prepareTakeoverTarget,
  TAKEOVER,
  TAKEOVER_MOVES,
  wordVariants,
} from "../src/ageing/engine";
import { adoptionRng, samePackNotice, takeOver } from "../src/takeover/batch";
import { formatAdoptedName } from "../src/takeover/format";

const pack = (file: string) =>
  readFileSync(`tests/fixtures/packs/${file}.txt`, "utf8").split("\n").map((l) => l.trim()).filter((l) => l);
const ENGLISH = pack("english-towns");
const LATIN = pack("latin-towns");

const buildScorer = (names: string[]) => {
  const model = MarkovModel.build(names);
  return (word: string) => model.scoreWord(word);
};
const PREPARED = prepareTakeoverTarget(LATIN, buildScorer);
const adopt = (native: string, rng: () => number) => adoptName({ native, target: PREPARED, rng });
const nativeModel = MarkovModel.build(ENGLISH);
const drawNative = (rng: () => number) =>
  nativeModel.generateDetailed({ count: 1, faithfulness: 2, strictness: 3, seed: Math.floor(rng() * 0x100000000) >>> 0 }).names[0] ?? null;
const batch = (seed: number, batchSize = 8) => takeOver({ drawNative, adopt, batchSize, seed });

const SEPARATOR = /[ \-']/;
const words = (s: string) => s.split(SEPARATOR).filter((w) => w.length > 0);

test("determinism: same seed and inputs give the same batch; a different seed differs", () => {
  const a = batch(42);
  assert.deepEqual(batch(42), a);
  assert.equal(a.rows.length, 8);
  assert.notDeepEqual(batch(43).rows, a.rows);
});

test("move sets: M1–M3 never in takeover; M10 and M11 never in ageing", () => {
  const inv = buildInventory(LATIN);
  for (const word of ["stockholm", "mannahatta", "londin", "kanpur", "strand", "breukelen"]) {
    for (const move of wordVariants(word, inv).values()) assert.ok(AGEING_MOVES.has(move) && move !== "M10" && move !== "M11");
    for (const move of wordVariants(word, inv, TAKEOVER_MOVES).values()) assert.ok(!["M1", "M2", "M3"].includes(move), `${word}: ${move}`);
  }
  for (const row of batch(7, 10).rows) for (const m of row.moves) assert.ok(TAKEOVER_MOVES.has(m), m);
});

test("M10 and M11: the boundary letter appears once; initial clusters may take a vowel", () => {
  const inv = { vowelRuns: ["e"], consonantUnits: new Set<string>(), letters: new Set<string>(), endings: ["num"] };
  const v = wordVariants("londin", inv, TAKEOVER_MOVES);
  assert.equal(v.get("londinum"), "M10");
  assert.equal(v.get("lonedin"), "M11");
  assert.equal(wordVariants("stockholm", inv, TAKEOVER_MOVES).get("estockholm"), "M11");
  assert.ok(!wordVariants("londinum", inv, TAKEOVER_MOVES).has("londinumnum"));
});

test("move limits: at most one M10 and two M11 per word per adoption", () => {
  // Single-word natives, so every move counted belongs to that word.
  for (let seed = 1; seed <= 30; seed++) {
    const native = drawNative(mulberry32(seed));
    if (!native || words(native).length !== 1) continue;
    const a = adopt(native, mulberry32(seed));
    if (!a) continue;
    assert.ok(a.moves.filter((m) => m === "M10").length <= TAKEOVER.maxEndingAdditions, a.moves.join());
    assert.ok(a.moves.filter((m) => m === "M11").length <= TAKEOVER.maxVowelInsertions, a.moves.join());
  }
});

test("filters: every adopted name passes §4.4", () => {
  const letters = buildInventory(LATIN).letters;
  for (const seed of [1, 2, 3]) {
    for (const row of batch(seed, 10).rows) {
      assert.notEqual(row.adopted.toLowerCase(), row.native.toLowerCase());
      assert.ok(row.recognisability >= TAKEOVER.minRecognisability, `${row.native} → ${row.adopted}`);
      assert.ok(row.plausibility >= TAKEOVER.minPlausibility, `${row.native} → ${row.adopted}`);
      for (const w of words(row.adopted)) {
        if (w.length < TAKEOVER.passthroughBelow) continue;
        for (const ch of Array.from(w.toLowerCase())) assert.ok(letters.has(ch), `${row.adopted}: ${ch}`);
      }
    }
  }
});

test("passthrough: short words keep their exact form; a name of only short words fails", () => {
  for (const native of ["de la Mora", "Ó Briain", "al-Kanpur", "Pons de Vel"]) {
    const a = adopt(native, mulberry32(5));
    assert.ok(a, native);
    const before = native.split(/([ \-'])/);
    const after = a.adopted.split(/([ \-'])/);
    assert.equal(after.length, before.length);
    before.forEach((p, i) => {
      if (!SEPARATOR.test(p) && Array.from(p).length < TAKEOVER.passthroughBelow) assert.equal(after[i], p, a.adopted);
    });
  }
  assert.equal(adopt("de la", mulberry32(1)), null);
  assert.equal(adopt("Ó", mulberry32(1)), null);
});

test("batch filling: failures are replaced, duplicates skipped, and the cap triggers the notice", () => {
  const natives = ["Alpha", "Alpha", "Bravo", "Fail", "Charlie", "Delta", "Echo", "Fail2", "Golf", "Hotel"];
  let i = 0;
  const drawn: string[] = [];
  const adopted: string[] = [];
  const stub = (native: string): Adoption | null => {
    adopted.push(native);
    return native.startsWith("Fail") ? null : { native, adopted: native + "um", score: 1, plausibility: 1, recognisability: 1, moves: ["M10"] };
  };
  const full = takeOver({ drawNative: () => (drawn.push(natives[i]), natives[i++ % natives.length]), adopt: stub, batchSize: 4, seed: 1 });
  assert.deepEqual(full.rows.map((r) => r.native), ["Alpha", "Bravo", "Charlie", "Delta"]);
  assert.deepEqual(adopted, ["Alpha", "Bravo", "Fail", "Charlie", "Delta"]);
  assert.equal(full.notice, undefined);

  let draws = 0;
  const capped = takeOver({ drawNative: () => `Fail${draws++}`, adopt: stub, batchSize: 5, seed: 1 });
  assert.equal(draws, TAKEOVER.nativeCapFactor * 5);
  assert.equal(capped.rows.length, 0);
  assert.equal(capped.notice, "Only 0 names could be adopted. Try a different takeover pack.");
});

test("stream independence: discarding a native name leaves later adoptions unchanged", () => {
  const seed = 99;
  const base = batch(seed, 6);
  const victim = base.rows[1].native;
  const withDiscard = takeOver({
    drawNative,
    adopt: (native, rng) => (native === victim ? null : adopt(native, rng)),
    batchSize: 6,
    seed,
  });
  const later = base.rows.slice(2);
  for (const row of later) assert.deepEqual(withDiscard.rows.find((r) => r.native === row.native), row);
  // Each adoption depends only on the seed and the name.
  assert.deepEqual(adopt(victim, adoptionRng(seed, victim)), base.rows[1]);
});

test("a prepared target gives the same adoption as an unprepared one", () => {
  const unprepared = adoptName({ native: "Mannahatta", target: { targetNames: LATIN, buildScorer }, rng: mulberry32(3) });
  assert.deepEqual(adopt("Mannahatta", mulberry32(3)), unprepared);
});

test("same pack: the notice is shown and nothing runs", () => {
  assert.equal(samePackNotice("Packs/Latin.md", "Packs/Latin.md"), "Choose a different takeover pack.");
  assert.equal(samePackNotice("Packs/English.md", "Packs/Latin.md"), null);
  assert.equal(samePackNotice(undefined, undefined), null);
});

test("insert formats render exactly as specified", () => {
  assert.equal(formatAdoptedName("Eburākon", "Eboracum", "adopted"), "Eboracum");
  assert.equal(formatAdoptedName("Eburākon", "Eboracum", "origin"), "Eboracum (from Eburākon)");
  assert.equal(formatAdoptedName("Eburākon", "Eboracum", "pair"), "Eburākon → Eboracum");
});
