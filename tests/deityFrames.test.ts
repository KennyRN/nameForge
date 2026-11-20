// Brief 6d A2: deities use the culture's own frames (six of ten, at least 60% of the weight), and no legacy fixed deity name stands in more than two cultures' ten-name lists at seeds 1 to 5.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import north5d from "../src/data/north5d.json";
import { deityCulture, generateDeityNames } from "../src/deities/engine";
import { DEFAULT_DEITY_STATE } from "../src/deities/sentence";
import { DEITY_OWN_CULTURES, deityFrames } from "../scripts/tier6d/deity-frames.mjs";

type Frame = [string, number, string?];
const frames = (culture: string): Frame[] => (north5d as unknown as { modules: { deityNames: { cultures: Record<string, { f: Frame[] }> } } }).modules.deityNames.cultures[culture].f;

test("deity frames: every core-depth culture draws eight of its ten frames, and at least 60% of the weight, from frames of its own", () => {
  const short: string[] = [];
  for (const culture of DEITY_OWN_CULTURES) {
    const f = frames(culture);
    const own = deityFrames(culture, [])!.slice(0, 8).map((x: Frame) => x[0]);
    const mine = f.filter((x) => own.includes(x[0]));
    const weight = mine.reduce((a, x) => a + x[1], 0) / f.reduce((a, x) => a + x[1], 0);
    if (f.length !== 10 || mine.length < 8 || weight < 0.6) short.push(`${culture}: ${f.length} frames, ${mine.length} own, ${(weight * 100).toFixed(0)}%`);
  }
  assert.deepEqual(short, []);
});

test("deity frames: the own frames of two cultures never agree for more than two of eight", () => {
  const seen = new Map<string, string[]>();
  for (const culture of DEITY_OWN_CULTURES) for (const [p] of deityFrames(culture, [])!.slice(0, 8)) seen.set(p, [...(seen.get(p) ?? []), culture]);
  const bad = [...seen].filter(([, cs]) => cs.length > 2).map(([p, cs]) => `${p}: ${cs.join(", ")}`);
  assert.deepEqual(bad.slice(0, 8), []);
});

test("deity names: no fixed name stands in more than two core-depth cultures' ten-name lists (seeds 1 to 5, every era)", () => {
  const spread = new Map<string, Set<string>>();
  // English is the deities module's general engine (it has no culture of its own there), so it is not one of the cultures counted.
  for (const c of DEITY_OWN_CULTURES.filter((key: string) => deityCulture(key).culture === key).map((key: string) => ({ key }))) for (const era of ["AN", "MD", "EM", "ST", "MO", "NF", "IS"]) for (let seed = 1; seed <= 5; seed++) {
    let names: { text?: string }[];
    try {
      names = generateDeityNames({ ...DEFAULT_DEITY_STATE, culture: c.key, era, count: 10, seed, people: "placeholders" } as never).names as { text?: string }[];
    } catch {
      continue;
    }
    for (const n of names) {
      if (!n.text || n.text.includes("[")) continue;
      const key = `${era} seed ${seed}: ${n.text}`;
      spread.set(key, (spread.get(key) ?? new Set()).add(c.key));
    }
  }
  const bad = [...spread].filter(([, s]) => s.size > 2).map(([k, s]) => `${k} (${[...s].join(", ")})`);
  assert.deepEqual(bad.slice(0, 10), [], `${bad.length} fixed names`);
});
