// Northern Europe tables brief, batch 5d (B0): the names of every culture in the 5d modules, recorded before anything changes. Run with
// CAPTURE_NE5D_BASELINE=1 to record. Never edit the fixture to fit new code.
//
// 5d modules: money and coins, events and eras, calendars and festivals (months, days, festivals, moons), sky lore, the three named things
// modules (arms, treasures, books) and deities. Seeds 1, 42 and 2024, 12 names each, at the default setting (medieval) and one other (modern),
// for every key the modules' rosters hold and for the six keys batch 5d adds (Welsh, Scottish, Irish, Cornish, Scandinavian, German), which
// read their legacy tables until 5d gives them their own. The core cultures (the two Englishes, Norse, Scandinavian, German, the four Celtic
// nations) and Celtic may change; every other culture must match.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { generateMoneyNames, MONEY_CULTURES } from "../src/money/engine";
import { generateEventNames } from "../src/events/engine";
import { generateTimeSkyNames } from "../src/timesky/engine";
import { TIME_CULTURES } from "../src/timesky/data";
import { generateThingNames, THING_CULTURES, type ThingModule } from "../src/things/engine";
import { DEITY_CULTURES, generateDeityNames } from "../src/deities/engine";
import { ROUTE_CULTURES } from "../src/routes/engine";
import "../src/lensRosterSources";

const FIXTURE = "tests/fixtures/northern-europe-5d-baseline.json";
const SEEDS = [1, 42, 2024];
const COUNT = 12;
const NEW6 = ["welsh", "scottish", "irish", "cornish", "scandinavian", "german"];
type Snapshot = Record<string, string[] | string>;

/** The cultures that may change in this batch. */
export const MAY_CHANGE_5D = new Set(["anglo-saxon", "norman-british", "norse", "german", "welsh", "scottish", "irish", "cornish", "scandinavian", "english", "celtic", "french", "dutch", "italian", "roman", "slavic", "spanish", "portuguese", "greek", "byzantine", "iberian", "greek-byzantine"]);

const textsOf = (result: unknown): string[] => ((result as { names: { text: string }[] }).names ?? []).map((n) => n.text);
function record(out: Snapshot, key: string, run: (seed: number) => string[]) {
  for (const seed of SEEDS) {
    try {
      out[`${key} ${seed}`] = run(seed);
    } catch (error) {
      out[`${key} ${seed}`] = `error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}
const keysOf = (list: readonly { key: string }[]) => [...new Set([...list.map((c) => c.key), ...NEW6])];

export function buildSnapshot(): Snapshot {
  const out: Snapshot = {};
  const eras = [["medieval", "MD"], ["modern", "MO"]] as const;
  for (const culture of keysOf(MONEY_CULTURES)) for (const [label, era] of eras) record(out, `moneyNames ${culture} ${label}`, (seed) => textsOf(generateMoneyNames({ culture, era, count: COUNT, seed, people: "real" })));
  for (const culture of keysOf(ROUTE_CULTURES)) for (const [label, era] of eras) record(out, `eventNames ${culture} ${label}`, (seed) => textsOf(generateEventNames({ culture, era, count: COUNT, seed, people: "real" })));
  for (const [module, kind] of [["calendarNames", "month"], ["calendarNames", "festival"], ["skyNames", "constellation"]] as const) {
    for (const culture of keysOf(TIME_CULTURES)) for (const [label, era] of eras) record(out, `${module} ${culture} ${kind} ${label}`, (seed) => textsOf(generateTimeSkyNames({ culture, kind, era, count: COUNT, seed, people: "real" })));
  }
  for (const [module, thing] of [["armsNames", "arms"], ["treasureNames", "treasure"], ["bookNames", "book"]] as [string, ThingModule][]) {
    for (const culture of keysOf(THING_CULTURES)) for (const [label, era] of eras) record(out, `${module} ${culture} ${label}`, (seed) => textsOf(generateThingNames({ module: thing, culture, era, count: COUNT, seed, people: "real" })));
  }
  for (const culture of keysOf(DEITY_CULTURES)) for (const [label, era] of eras) record(out, `deityNames ${culture} ${label}`, (seed) => textsOf(generateDeityNames({ culture, era, count: COUNT, seed })));
  return out;
}

const cultureOf = (key: string) => key.split(" ")[1];

test("batch 5d baseline: non-core cultures are byte-identical to B0 (brief rule 1)", () => {
  if (process.env.CAPTURE_NE5D_BASELINE === "1") {
    writeFileSync(FIXTURE, `${JSON.stringify(buildSnapshot())}\n`);
    return;
  }
  const baseline = JSON.parse(readFileSync(FIXTURE, "utf8")) as Snapshot;
  const now = buildSnapshot();
  const bad: string[] = [];
  let checked = 0;
  for (const [key, was] of Object.entries(baseline)) {
    if (MAY_CHANGE_5D.has(cultureOf(key))) continue;
    checked++;
    if (JSON.stringify(now[key]) !== JSON.stringify(was)) bad.push(key);
  }
  assert.ok(checked > 600, `the baseline covers ${checked} protected states`);
  assert.deepEqual(bad.slice(0, 20), [], `${bad.length} protected states changed`);
});
