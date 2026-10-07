import { test } from "node:test";
import assert from "node:assert/strict";
import { MarkovModel, mulberry32 } from "../src/markov";
import {
  AGEING,
  ageName,
  type AgeingInput,
  buildInventory,
  recognisability,
  segment,
  validateSource,
  wordVariants,
} from "../src/ageing/engine";
import { formatAgedName } from "../src/ageing/format";

const TARGET = (
  "London York Bristol Oxford Cambridge Norwich Lincoln Chester Exeter Bath Wells Durham Carlisle Leicester " +
  "Gloucester Winchester Canterbury Salisbury Worcester Hereford Coventry Derby Nottingham Sheffield Leeds " +
  "Bradford Ripon Selby Whitby Scarborough Hull Grimsby Boston Ely Peterborough Bedford Luton Reading Guildford " +
  "Dover Hastings Brighton Chichester Southampton Portsmouth Dorchester Taunton Truro Penzance Plymouth"
).split(" ");

const buildScorer = (names: string[]) => {
  const model = MarkovModel.build(names);
  return (word: string) => model.scoreWord(word);
};

function run(source: string, overrides: Partial<AgeingInput> = {}, seed = 2026) {
  return ageName({ source, targetNames: TARGET, buildScorer, depth: 3, count: 5, rng: mulberry32(seed), ...overrides });
}

const lower = (s: string) => s.toLowerCase();
const words = (form: string) => form.split(/[ \-']/).filter((w) => w.length > 0);

test("determinism: same inputs and seed match; a different seed differs", () => {
  const a = run("Londinium", { depth: 4 });
  const b = run("Londinium", { depth: 4 });
  assert.deepEqual(a, b);
  assert.ok(a.candidates.length > 0);
  assert.notDeepEqual(run("Londinium", { depth: 4 }, 99).candidates, a.candidates);
});

test("tokenisation: segments, consonant units and the y rule", () => {
  assert.deepEqual(segment("londinium").map((s) => s.units.join("")), ["l", "o", "nd", "i", "n", "iu", "m"]);
  assert.deepEqual(segment("quest").map((s) => s.units), [["qu"], ["e"], ["s", "t"]]);
  assert.deepEqual(segment("schlong")[0].units, ["sch", "l"]);
  assert.equal(segment("york")[0].vowel, false);
  assert.equal(segment("ylva")[0].vowel, true);
});

test("constraints: every move keeps a vowel run, 3 letters and the first unit (bar substitution or M7)", () => {
  const inv = buildInventory(TARGET);
  for (const word of ["londinium", "eboracum", "breukelen", "aquae", "strand", "thorpe"]) {
    const firstBefore = segment(word)[0].units[0];
    for (const [variant, move] of wordVariants(word, inv)) {
      assert.ok(Array.from(variant).length >= AGEING.minLetters, `${word} → ${variant}`);
      assert.ok(segment(variant).some((s) => s.vowel), `${word} → ${variant}`);
      const firstAfter = segment(variant)[0].units[0];
      if (firstAfter !== firstBefore) assert.ok(["M4", "M6", "M7"].includes(move), `${word} → ${variant} by ${move}`);
    }
  }
});

test("constraints: trails pass the step limit and finals pass every filter", () => {
  for (const [source, depth] of [["Londinium", 3], ["Eboracum", 5], ["Breukelen", 4], ["Aquae Sulis", 5]] as const) {
    const { candidates } = run(source, { depth });
    const letters = buildInventory(TARGET).letters;
    const forms = new Set<string>();
    for (const c of candidates) {
      const trail = c.trail.map(lower);
      for (let i = 1; i < trail.length; i++) {
        assert.ok(recognisability(trail[i - 1], trail[i]) >= AGEING.stepLimit, `${trail[i - 1]} → ${trail[i]}`);
      }
      for (const form of trail) for (const w of words(form)) assert.ok(Array.from(w).length >= AGEING.minLetters, form);
      const final = lower(c.name);
      assert.notEqual(final, lower(source));
      assert.ok(c.recognisability >= AGEING.depthFloor[depth]);
      assert.ok(c.plausibility >= AGEING.minPlausibility);
      for (const ch of Array.from(final)) if (!/[ \-']/.test(ch)) assert.ok(letters.has(ch), `${final}: ${ch}`);
      assert.ok(!forms.has(final), `duplicate ${final}`);
      forms.add(final);
    }
  }
});

test("separators: multi-word and hyphenated sources keep them in every trail form", () => {
  for (const source of ["Aquae Sulis", "Burh-Stede", "Old Stede", "Caer'Luel"]) {
    const seps = source.replace(/[^ \-']/g, "");
    const { candidates } = run(source, { depth: 4 });
    assert.ok(candidates.length > 0, source);
    for (const c of candidates) for (const form of c.trail) assert.equal(form.replace(/[^ \-']/g, ""), seps, form);
  }
});

test("insert formats render exactly as specified", () => {
  const trail = ["Londinium", "Lundinium", "Lunden", "London"];
  assert.equal(formatAgedName(trail, "name"), "London");
  assert.equal(formatAgedName(trail, "history"), "London (earlier Lunden, Lundinium; originally Londinium)");
  assert.equal(formatAgedName(trail, "trail"), "Londinium → Lundinium → Lunden → London");
  assert.equal(formatAgedName(["Haarlem", "Harlem"], "history"), "Harlem (originally Haarlem)");
});

test("edge cases: short words and small packs are rejected", () => {
  assert.ok(validateSource("Ox"));
  assert.ok(validateSource("Stoke on Trent"));
  assert.ok(validateSource("Lon2don"));
  assert.equal(validateSource("Londinium"), null);
  assert.throws(() => run("Ox"));
  assert.throws(() => run("Londinium", { targetNames: TARGET.slice(0, AGEING.minTargetNames - 1) }), /at least 30/);
});

test("edge cases: letters absent from the target only appear if nothing maps them", () => {
  const { candidates } = run("Þórsmörk", { depth: 3 });
  const letters = buildInventory(TARGET).letters;
  for (const c of candidates) {
    for (const ch of Array.from(lower(c.name))) if (!/[ \-']/.test(ch)) assert.ok(letters.has(ch), `${c.name}: ${ch}`);
  }
});

test("performance: a depth-5, two-word run completes in under a second", () => {
  const t0 = performance.now();
  run("Aquae Sulis", { depth: 5 });
  assert.ok(performance.now() - t0 < 1000);
});
