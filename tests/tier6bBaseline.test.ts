// Second-tier tables brief, batch 6b (M0): the names of every culture, every stored tradition and the stored legacy keys, in every module,
// recorded before any 6b change (and after the 6b prompt's Part A, the inn signs). Run with CAPTURE_T6B_BASELINE=1 to record. Never edit the fixture to fit new code.
//
// Seeds 1 and 42, 12 names each, at the module's default setting and one other (medieval and modern; home, newly explored and settled
// country for the wild lands and seas), with the people link on `real`. The batch's cultures (Turkic, Mongol, Arabic, Persian, Egyptian, Ethiopian, Bantu, West African
// and the stored steppe and arabic-persian mixes) and the keys that map to them (ottoman, swahili-omani, malay, maritimeSEA, phoenician) may change; every other culture,
// and every stored legacy key outside the batch, must match.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { generateGroupNames, familyForSection } from "../src/groups/engine";
import { generatePeopleRows, PEOPLE_CULTURES } from "../src/peoples/engine";
import { generateTribalNames, TRIBAL_TRADITIONS } from "../src/tribes/engine";
import { generateDeityNames, DEITY_CULTURES } from "../src/deities/engine";
import { DEFAULT_SACRED_PLACE_STATE, sacredPlaceAsDeityState } from "../src/deities/sentence";
import { generateKit } from "../src/settlement/kit";
import { kitNoteContent } from "../src/settlement/kitFormat";
import { DEFAULT_KIT_STATE } from "../src/settlement/kitSentence";
import { generateWildsNames, PLACE_MODULES, WILDS_CULTURES, WILDS_MODULES, type WildsWhere } from "../src/wilds/engine";
import { defaultWildsState } from "../src/wilds/sentence";
import { generateWatersNames, WATERS_CULTURES, type WatersModule } from "../src/waters/engine";
import { defaultWatersState } from "../src/waters/sentence";
import { ROUTE_CULTURES } from "../src/routes/engine";
import { DEFAULT_GROUP_STATE } from "../src/groups/sentence";
import { DEFAULT_PEOPLE_STATE } from "../src/peoples/sentence";
import { GROUP_NAME_SECTIONS } from "../src/sections";
import { textsOf, visitStates } from "./helpers/bracketSweep";

const FIXTURE = "tests/fixtures/tier-6b-baseline.json";
const SEEDS = [1, 42];
const COUNT = 12;
type Snapshot = Record<string, string[] | string>;

/** The cultures that may change in this batch. */
export const MAY_CHANGE_6B = new Set(["arabian", "westAfrican", "turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african", "steppe", "arabic-persian",
  // The keys that map to a batch culture (§B4): their people and fills change with the mapping.
  "ottoman", "turkish", "swahili-omani", "malay", "maritimeSEA", "phoenician", "mamluk", "persianate", "mongolian", "african", "ethiopic", "coptic"]);
const PEOPLE_INPUT = ["Aldwin", "Brenna of the Vale", "Cassius", "Dagmar", "Eskil Thorne", "Fenwick", "Gaela", "Hrolf", "Isolde", "Jorund", "Kestrel", "Lysander"];
const keysOf = (list: readonly { key?: string; id?: string }[]) => list.map((c) => (c.key ?? c.id)!);

function record(out: Snapshot, key: string, run: (seed: number) => string[]) {
  for (const seed of SEEDS) {
    try {
      out[`${key} ${seed}`] = run(seed);
    } catch (error) {
      out[`${key} ${seed}`] = `error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}

export function buildSnapshot(): Snapshot {
  const out: Snapshot = {};
  // Every module with a culture roster, at the default kind, in the middle ages and the modern world.
  visitStates({ count: COUNT, eras: ["MD", "MO"], kinds: false }, (where, make) => record(out, where, (seed) => textsOf(make(seed))));
  // The wild lands and seas, at home and in newly explored and settled country (colonial cultures included).
  const wheres: WildsWhere[] = ["new", "settled"];
  for (const where of wheres) {
    for (const module of [...WILDS_MODULES, ...PLACE_MODULES.filter((m) => m !== "starsSpace")]) {
      for (const culture of keysOf(WILDS_CULTURES)) record(out, `${module} ${where} ${culture}`, (seed) => textsOf(generateWildsNames({ ...defaultWildsState(module), module, culture, where, count: COUNT, seed, people: "real" } as never)));
    }
    for (const module of ["seasLakes", "coastsIslands", "seaCharts"] as WatersModule[]) {
      for (const culture of keysOf(WATERS_CULTURES)) record(out, `${module} ${where} ${culture}`, (seed) => textsOf(generateWatersNames({ ...defaultWatersState(module), module, culture, where, count: COUNT, seed, people: "real" } as never)));
    }
  }
  // Sacred places, the kit, the group families and tribes (by stored tradition) and the peoples and tongues.
  for (const culture of keysOf(DEITY_CULTURES)) record(out, `sacredPlaces ${culture}`, (seed) => textsOf(generateDeityNames({ ...sacredPlaceAsDeityState({ ...DEFAULT_SACRED_PLACE_STATE, culture }), count: COUNT, seed } as never)));
  for (const culture of keysOf(ROUTE_CULTURES)) record(out, `settlementKit ${culture}`, (seed) => kitNoteContent(generateKit({ ...DEFAULT_KIT_STATE, culture, seed } as never)).split("\n"));
  const traditions = keysOf(TRIBAL_TRADITIONS);
  for (const section of GROUP_NAME_SECTIONS) {
    const family = familyForSection(section);
    if (!family) continue;
    for (const tradition of traditions) record(out, `${section} ${tradition}`, (seed) => textsOf(generateGroupNames({ ...DEFAULT_GROUP_STATE, family: family.key, tradition, count: COUNT, seed } as never)));
  }
  for (const tradition of traditions) record(out, `tribalNames ${tradition}`, (seed) => textsOf(generateTribalNames({ tradition, register: "plain", hostile: false, count: COUNT, seed } as never)));
  for (const culture of keysOf(PEOPLE_CULTURES)) {
    const base = { names: PEOPLE_INPUT, giving: DEFAULT_PEOPLE_STATE.giving, detail: DEFAULT_PEOPLE_STATE.detail, tone: DEFAULT_PEOPLE_STATE.tone };
    record(out, `peoplesTongues ${culture}`, (seed) => textsOf(generatePeopleRows({ ...base, culture, era: "MD", seed } as never)));
  }
  return out;
}

/** The culture a state key names: the first of its words that is a batch culture, else the one after the module. */
const touchesBatch = (key: string): boolean => key.split(" ").some((w) => MAY_CHANGE_6B.has(w));

test("batch 6b baseline: every culture outside the batch, and every stored legacy key outside it, is byte-identical to M0", () => {
  if (process.env.CAPTURE_T6B_BASELINE === "1") {
    writeFileSync(FIXTURE, `${JSON.stringify(buildSnapshot())}\n`);
    return;
  }
  const baseline = JSON.parse(readFileSync(FIXTURE, "utf8")) as Snapshot;
  const now = buildSnapshot();
  const bad: string[] = [];
  let checked = 0;
  for (const [key, was] of Object.entries(baseline)) {
    if (touchesBatch(key)) continue;
    checked++;
    if (JSON.stringify(now[key]) !== JSON.stringify(was)) bad.push(key);
  }
  assert.ok(checked > 1500, `the baseline covers ${checked} protected states`);
  assert.deepEqual(bad.slice(0, 20), [], `${bad.length} protected states changed`);
});
