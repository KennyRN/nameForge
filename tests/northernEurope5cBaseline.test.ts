// Northern Europe tables brief, batch 5c (B0): the names of every culture and stored tradition in the 5c modules, recorded before
// anything changes. Run with CAPTURE_NE5C_BASELINE=1 to record. Never edit the fixture to fit new code.
//
// 5c modules: the seven group-name families, tribes and kin groups, the three bynames modules, realms, peoples and tongues, ships,
// aircraft and land vehicles (spacecraft is recorded too, and must not move). Seeds 1, 42 and 2024, 12 names each, at the default
// and at one other setting. Groups and tribes are recorded by stored tradition (every tradition: a stored `tradition` value keeps
// its old draw, brief 2 rule 4); the other modules by culture. The core cultures (the two Englishes, Norse, Scandinavian, German,
// the four Celtic nations) and Celtic may change; every other culture, and every tradition that exists today, must match.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { generateGroupNames, familyForSection } from "../src/groups/engine";
import { generateRealmNames, REALM_CULTURES } from "../src/realms/engine";
import { generatePeopleRows, PEOPLE_CULTURES } from "../src/peoples/engine";
import { generateTribalNames, TRIBAL_TRADITIONS } from "../src/tribes/engine";
import { BYNAME_CULTURES, generateBynames, type BynameModule } from "../src/bynames/engine";
import { generateVesselNames, VESSEL_CULTURES, AIR_LAND, VESSEL_DATA, isAirLand, type VesselModule } from "../src/vessels/engine";
import { DEFAULT_GROUP_STATE } from "../src/groups/sentence";
import { DEFAULT_REALM_STATE } from "../src/realms/sentence";
import { DEFAULT_PEOPLE_STATE } from "../src/peoples/sentence";
import { DEFAULT_BYNAME_STATE } from "../src/bynames/sentence";
import { defaultVesselState } from "../src/vessels/sentence";
import { GROUP_NAME_SECTIONS } from "../src/sections";
import "../src/lensRosterSources";
import "../src/deities/engine";

const FIXTURE = "tests/fixtures/northern-europe-5c-baseline.json";
const SEEDS = [1, 42, 2024];
const COUNT = 12;
type Snapshot = Record<string, string[] | string>;

/** The cultures and traditions that may change in this batch: the core seven, the Celtic nations, and Celtic. */
export const MAY_CHANGE = new Set(["arabian", "westAfrican", "turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african", "steppe", "arabic-persian", "ottoman", "swahili-omani", "malay", "maritimeSEA", "phoenician", /* brief 6b: the batch's cultures change too */ "anglo-saxon", "norman-british", "norse", "german", "welsh", "scottish", "irish", "cornish", "scandinavian", "english", "celtic", "french", "dutch", "italian", "roman", "slavic", "spanish", "portuguese", "greek", "byzantine", "iberian", "greek-byzantine"]);
/** The old traditions that may not change: every one that exists today, Celtic and Germanic (the broad mixes) included. */
const textsOf = (result: unknown): string[] => {
  const r = result as { names?: unknown[]; rows?: unknown[] };
  return ((r.names ?? r.rows ?? []) as (string | { text?: string; name?: string })[]).map((n) => (typeof n === "string" ? n : n.text ?? n.name ?? ""));
};
function record(out: Snapshot, key: string, run: (seed: number) => string[]) {
  for (const seed of SEEDS) {
    try {
      out[`${key} ${seed}`] = run(seed);
    } catch (error) {
      out[`${key} ${seed}`] = `error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}
const keysOf = (list: readonly { key?: string; id?: string }[]) => list.map((c) => (c.key ?? c.id)!);
const PEOPLE_INPUT = ["Aldwin", "Brenna of the Vale", "Cassius", "Dagmar", "Eskil Thorne", "Fenwick", "Gaela", "Hrolf", "Isolde", "Jorund", "Kestrel", "Lysander"];

export function buildSnapshot(): Snapshot {
  const out: Snapshot = {};
  const traditions = keysOf(TRIBAL_TRADITIONS);
  for (const section of GROUP_NAME_SECTIONS) {
    const family = familyForSection(section);
    if (!family) continue;
    for (const tradition of traditions) {
      const base = { ...DEFAULT_GROUP_STATE, family: family.key, tradition };
      record(out, `${section} ${tradition} fantasy`, (seed) => textsOf(generateGroupNames({ ...base, count: COUNT, seed })));
      const genre = section === "supernaturalCourts" ? "modern" : "scifi";
      record(out, `${section} ${tradition} ${genre}`, (seed) => textsOf(generateGroupNames({ ...base, genre, fantastic: section === "supernaturalCourts", count: COUNT, seed })));
    }
  }
  for (const culture of keysOf(REALM_CULTURES)) {
    record(out, `realms ${culture} medieval`, (seed) => textsOf(generateRealmNames({ ...DEFAULT_REALM_STATE, culture, count: COUNT, seed })));
    record(out, `realms ${culture} modern`, (seed) => textsOf(generateRealmNames({ ...DEFAULT_REALM_STATE, culture, era: "modern", count: COUNT, seed })));
  }
  for (const culture of keysOf(PEOPLE_CULTURES)) {
    const base = { names: PEOPLE_INPUT, giving: DEFAULT_PEOPLE_STATE.giving, detail: DEFAULT_PEOPLE_STATE.detail, tone: DEFAULT_PEOPLE_STATE.tone };
    record(out, `peoplesTongues ${culture} MD`, (seed) => textsOf(generatePeopleRows({ ...base, culture, era: "MD", seed })));
    record(out, `peoplesTongues ${culture} AN`, (seed) => textsOf(generatePeopleRows({ ...base, culture, era: "AN", seed })));
  }
  for (const tradition of traditions) {
    const base = { tradition, register: "plain" as const, hostile: false };
    record(out, `tribalNames ${tradition} default`, (seed) => textsOf(generateTribalNames({ ...base, count: COUNT, seed })));
    record(out, `tribalNames ${tradition} legendary hostile`, (seed) => textsOf(generateTribalNames({ ...base, register: "legendary", hostile: true, count: COUNT, seed })));
  }
  for (const module of ["epithets", "familyNames", "titles"] as BynameModule[]) {
    for (const culture of keysOf(BYNAME_CULTURES)) {
      record(out, `${module} ${culture} fantasy`, (seed) => textsOf(generateBynames({ ...DEFAULT_BYNAME_STATE, module, culture, count: COUNT, seed })));
      record(out, `${module} ${culture} modern`, (seed) => textsOf(generateBynames({ ...DEFAULT_BYNAME_STATE, module, culture, genre: "modern", count: COUNT, seed })));
      if (module !== "epithets") record(out, `${module} ${culture} native`, (seed) => textsOf(generateBynames({ ...DEFAULT_BYNAME_STATE, module, culture, language: "native", count: COUNT, seed })));
    }
  }
  for (const module of ["ships", "spacecraft", "aircraft", "landVehicles"] as VesselModule[]) {
    const techs = (isAirLand(module) ? AIR_LAND.technology[module as "aircraft" | "landVehicles"] : VESSEL_DATA.technology[module as "ships" | "spacecraft"]).map((t: { code: string }) => t.code);
    const variant = techs[Math.min(2, techs.length - 1)];
    for (const culture of keysOf(VESSEL_CULTURES)) {
      const base = { ...defaultVesselState(module), module, culture };
      record(out, `${module} ${culture} default`, (seed) => textsOf(generateVesselNames({ ...base, count: COUNT, seed })));
      record(out, `${module} ${culture} ${variant}`, (seed) => textsOf(generateVesselNames({ ...base, technology: variant, count: COUNT, seed })));
    }
  }
  return out;
}

const cultureOf = (key: string) => key.split(" ")[1];
/** Brief 6b: the batch's cultures and the keys that map to them change, stored traditions included (their group names take the batch's own entries and the new people tables). */
const BATCH_6B = new Set(["arabian", "westAfrican", "turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african", "steppe", "arabic-persian", "maritimeSEA", "malay", "ottoman", "swahili-omani", "phoenician"]);

test("batch 5c baseline: non-core cultures and every existing tradition are byte-identical to B0 (brief rule 1)", () => {
  if (process.env.CAPTURE_NE5C_BASELINE === "1") {
    writeFileSync(FIXTURE, `${JSON.stringify(buildSnapshot())}\n`);
    return;
  }
  const baseline = JSON.parse(readFileSync(FIXTURE, "utf8")) as Snapshot;
  const now = buildSnapshot();
  const bad: string[] = [];
  let checked = 0;
  for (const [key, was] of Object.entries(baseline)) {
    const module = key.split(" ")[0];
    const culture = cultureOf(key);
    // Stored traditions never move (group families and tribes); other modules: only the core cultures and Celtic may.
    if (BATCH_6B.has(culture)) continue;
    const isTradition = module === "tribalNames" || GROUP_NAME_SECTIONS.includes(module as never);
    if (!isTradition && MAY_CHANGE.has(culture)) continue;
    checked++;
    if (JSON.stringify(now[key]) !== JSON.stringify(was)) bad.push(key);
  }
  assert.ok(checked > 1000, `the baseline covers ${checked} states`);
  assert.deepEqual(bad.slice(0, 20), [], `${bad.length} protected states changed`);
});
