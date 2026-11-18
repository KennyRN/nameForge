// Northern Europe tables brief, batch 5a (M0): the names of every non-core culture, and Celtic, in every
// 5a module, recorded before anything changes. Run with CAPTURE_NE5A_BASELINE=1 to record. Never edit the
// fixture to fit new code.
//
// 5a modules: lands and territories, farmland and countryside, hills and valleys, rivers and inland waters,
// route names, sacred places, the six wild lands, seas and bays, coasts and islands, sea charts.
// Seeds 1, 42 and 2024, 12 names each, at the module's default era (medieval), the steam age, and medieval
// with the fantastic on; the land and sea modules at where home, new and settled. The core cultures (the
// two Englishes, Norse, Scandinavian, German and the four Celtic nations) are recorded too, but only the
// rest must match: brief rule 1. Celtic is recorded for the before and after of the review document and
// is allowed to change (§3.2).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { generateRouteNames, ROUTE_CULTURES } from "../src/routes/engine";
import { DEFAULT_ROUTE_STATE } from "../src/routes/sentence";
import { generateDeityNames, DEITY_CULTURES } from "../src/deities/engine";
import { DEFAULT_SACRED_PLACE_STATE, sacredPlaceAsDeityState } from "../src/deities/sentence";
import { generateWatersNames, WATERS_CULTURES, type WatersModule } from "../src/waters/engine";
import { defaultWatersState } from "../src/waters/sentence";
import { generateWildsNames, PLACE_MODULES, WILDS_CULTURES, WILDS_MODULES, type WildsWhere } from "../src/wilds/engine";
import { defaultWildsState } from "../src/wilds/sentence";
import { COLONIAL_CULTURES } from "../src/places/colonialCultures";
import "../src/lensRosterSources";

const FIXTURE = "tests/fixtures/northern-europe-5a-baseline.json";
const SEEDS = [1, 42, 2024];
const COUNT = 12;
const VARIANTS: { era: string; fantastic: boolean }[] = [
  { era: "MD", fantastic: false },
  { era: "ST", fantastic: false },
  { era: "MD", fantastic: true },
];
const WHERES: WildsWhere[] = ["home", "new", "settled"];

/** The cultures that may change in this batch: the core seven and the Celtic nations (and their new keys). */
export const CORE = new Set(["anglo-saxon", "norman-british", "norse", "german", "welsh", "scottish", "irish", "cornish", "scandinavian"]);
/** Brief 6a: the batch's cultures change in this batch too. */
const MAY_CHANGE = new Set(["arabian", "westAfrican", "turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african", "steppe", "arabic-persian", "ottoman", "swahili-omani", "malay", "maritimeSEA", "phoenician", /* brief 6b: the batch's cultures change too */ ...CORE, "celtic", "french", "dutch", "italian", "roman", "slavic", "spanish", "portuguese", "greek", "byzantine", "iberian", "greek-byzantine"]);

type Texts = string[];
const textsOf = (r: unknown): Texts => ((r as { names?: unknown[] }).names ?? []).map((n) => (typeof n === "string" ? n : (n as { text: string }).text));

function record(): Record<string, Texts> {
  const out: Record<string, Texts> = {};
  const colonial = COLONIAL_CULTURES.map((c) => c.key);
  for (const v of VARIANTS) {
    for (const seed of SEEDS) {
      for (const c of ROUTE_CULTURES) {
        out[`routeNames|${c.key}|${v.era}|${v.fantastic}|${seed}`] = textsOf(generateRouteNames({ ...DEFAULT_ROUTE_STATE, culture: c.key, era: v.era as never, fantastic: v.fantastic, count: COUNT, seed }));
      }
      for (const c of DEITY_CULTURES) {
        out[`sacredPlaces|${c.key}|${v.era}|${v.fantastic}|${seed}`] = textsOf(
          generateDeityNames({ ...sacredPlaceAsDeityState({ ...DEFAULT_SACRED_PLACE_STATE, culture: c.key, era: v.era as never, fantastic: v.fantastic }), count: COUNT, seed } as never),
        );
      }
      for (const module of [...WILDS_MODULES, ...PLACE_MODULES.filter((m) => m !== "starsSpace")]) {
        for (const where of WHERES) {
          const keys = [...WILDS_CULTURES.map((c) => c.key), ...(where === "home" ? [] : colonial.filter((k) => !WILDS_CULTURES.some((c) => c.key === k)))];
          for (const culture of keys) {
            out[`${module}|${culture}|${where}|${v.era}|${v.fantastic}|${seed}`] = textsOf(generateWildsNames({ ...defaultWildsState(module), module, culture, where, era: v.era as never, fantastic: v.fantastic, count: COUNT, seed }));
          }
        }
      }
      for (const module of ["seasLakes", "coastsIslands", "seaCharts"] as WatersModule[]) {
        for (const where of WHERES) {
          const keys = [...WATERS_CULTURES.map((c) => c.key), ...(where === "home" ? [] : colonial.filter((k) => !WATERS_CULTURES.some((c) => c.key === k)))];
          for (const culture of keys) {
            out[`${module}|${culture}|${where}|${v.era}|${v.fantastic}|${seed}`] = textsOf(generateWatersNames({ ...defaultWatersState(module), module, culture, where, era: v.era as never, fantastic: v.fantastic, count: COUNT, seed } as never));
          }
        }
      }
    }
  }
  return out;
}

const cultureOf = (key: string) => key.split("|")[1];

test("batch 5a baseline: non-core cultures are byte-identical to M0 (brief rule 1)", () => {
  if (process.env.CAPTURE_NE5A_BASELINE === "1") {
    writeFileSync(FIXTURE, `${JSON.stringify(record())}\n`);
    return;
  }
  const baseline = JSON.parse(readFileSync(FIXTURE, "utf8")) as Record<string, Texts>;
  const now = record();
  const bad: string[] = [];
  let checked = 0;
  for (const [key, was] of Object.entries(baseline)) {
    if (MAY_CHANGE.has(cultureOf(key))) continue;
    checked++;
    if (JSON.stringify(now[key]) !== JSON.stringify(was)) bad.push(key);
  }
  assert.ok(checked > 1000, `the baseline covers ${checked} non-core states`);
  assert.deepEqual(bad.slice(0, 20), [], `${bad.length} non-core states changed`);
});
