// Ageing regression (takeover brief §8.1): ageing output must stay byte-identical to the
// fixtures captured before engine profiles were introduced. Run with CAPTURE_AGEING=1 to record.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { MarkovModel, mulberry32 } from "../src/markov";
import { ageName } from "../src/ageing/engine";

const FIXTURE = "tests/fixtures/ageing-regression.json";
const pack = (file: string) =>
  readFileSync(`tests/fixtures/packs/${file}.txt`, "utf8").split("\n").map((l) => l.trim()).filter((l) => l);
const PACKS: Record<string, string[]> = { english: pack("english-towns"), latin: pack("latin-towns") };

const buildScorer = (names: string[]) => {
  const model = MarkovModel.build(names);
  return (word: string) => model.scoreWord(word);
};

const CASES: { seed: number; source: string; pack: string; depth: number }[] = [
  { seed: 1, source: "Londinium", pack: "english", depth: 1 },
  { seed: 2, source: "Londinium", pack: "english", depth: 3 },
  { seed: 3, source: "Eboracum", pack: "english", depth: 5 },
  { seed: 4, source: "Aquae Sulis", pack: "english", depth: 3 },
  { seed: 5, source: "Burh-Stede", pack: "english", depth: 5 },
  { seed: 6, source: "Þórsmörk", pack: "english", depth: 3 },
  { seed: 7, source: "Breukelen", pack: "latin", depth: 1 },
  { seed: 8, source: "Stockholm", pack: "latin", depth: 3 },
  { seed: 9, source: "Canterbury", pack: "latin", depth: 5 },
  { seed: 10, source: "Old Stede", pack: "latin", depth: 3 },
  { seed: 11, source: "Caer'Luel", pack: "latin", depth: 5 },
  { seed: 2026, source: "Manchester", pack: "latin", depth: 1 },
];

const runAll = () =>
  CASES.map((c) => ({
    ...c,
    result: ageName({ source: c.source, targetNames: PACKS[c.pack], buildScorer, depth: c.depth, count: 5, rng: mulberry32(c.seed) }),
  }));

test("ageing regression: output matches the pre-takeover fixtures exactly", () => {
  const actual = runAll();
  if (process.env.CAPTURE_AGEING) {
    writeFileSync(FIXTURE, JSON.stringify(actual, null, 2) + "\n");
    return;
  }
  const expected = JSON.parse(readFileSync(FIXTURE, "utf8"));
  // Round-trip through JSON so numbers compare as stored.
  assert.deepEqual(JSON.parse(JSON.stringify(actual)), expected);
});
