// Northern Europe tables brief, batch 5b (B0): the names of every culture in the six 5b modules, recorded before
// anything changes. Run with CAPTURE_NE5B_BASELINE=1 to record. Never edit the fixture to fit new code.
//
// 5b modules: settlement names, streets and districts, inns and taverns, buildings and landmarks, monuments and
// statues, the settlement kit. Seeds 1, 42 and 2024, 12 names each, at medieval, the steam age, and medieval with
// the fantastic on. The core cultures (the two Englishes, Norse, Scandinavian, German and the four Celtic nations)
// and Celtic are recorded too, but only the rest must match: brief rule 1.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { generateStreetNames, type StreetKind } from "../src/streets/engine";
import { generateInnNames } from "../src/inns/engine";
import { generateBuildingNames } from "../src/buildings/engine";
import { generateMonumentNames } from "../src/monuments/engine";
import { generateKit } from "../src/settlement/kit";
import { generateSettlementNames } from "../src/settlement/names";
import { ROUTE_CULTURES } from "../src/routes/engine";
import { WORLD_CULTURES } from "../src/world/engine";
import { COLONIAL_CULTURES } from "../src/places/colonialCultures";
import "../src/lensRosterSources";

const FIXTURE = "tests/fixtures/northern-europe-5b-baseline.json";
const SEEDS = [1, 42, 2024];
const COUNT = 12;
const VARIANTS: { era: string; fantastic: boolean }[] = [
  { era: "MD", fantastic: false },
  { era: "ST", fantastic: false },
  { era: "MD", fantastic: true },
];

/** The cultures that may change in this batch: the core seven and the Celtic nations (and their new keys), and Celtic. */
export const CORE = new Set(["anglo-saxon", "norman-british", "norse", "german", "welsh", "scottish", "irish", "cornish", "scandinavian", "britain"]);
/** Brief 6a: the batch's cultures (their rosters, settlement names and tables) change in this batch too. */
const MAY_CHANGE = new Set(["arabian", "westAfrican", "turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african", "steppe", "arabic-persian", "ottoman", "swahili-omani", "malay", "maritimeSEA", "phoenician", /* brief 6b: the batch's cultures change too */ ...CORE, "celtic", "french", "dutch", "italian", "roman", "slavic", "spanish", "portuguese", "greek", "byzantine", "iberian", "greek-byzantine"]);

type Texts = string[];
const textsOf = (r: unknown): Texts => ((r as { names?: unknown[] }).names ?? []).map((n) => (typeof n === "string" ? n : (n as { text: string }).text));

function record(): Record<string, Texts> {
  const out: Record<string, Texts> = {};
  const roster = ROUTE_CULTURES.map((c) => c.key);
  for (const v of VARIANTS) {
    for (const seed of SEEDS) {
      const base = { era: v.era as never, fantastic: v.fantastic, count: COUNT, seed, people: "placeholders" as const };
      for (const culture of roster) {
        for (const kind of ["streets", "squares", "districts"] as StreetKind[]) {
          out[`streetNames|${culture}|${kind}|${v.era}|${v.fantastic}|${seed}`] = textsOf(generateStreetNames({ ...base, culture, kind, size: "town" } as never));
        }
        out[`innNames|${culture}|${v.era}|${v.fantastic}|${seed}`] = textsOf(generateInnNames({ ...base, culture } as never));
        out[`buildingNames|${culture}|${v.era}|${v.fantastic}|${seed}`] = textsOf(generateBuildingNames({ ...base, culture } as never));
        out[`monumentNames|${culture}|${v.era}|${v.fantastic}|${seed}`] = textsOf(generateMonumentNames({ ...base, culture } as never));
        const kit = generateKit({ culture, era: v.era as never, fantastic: v.fantastic, seed, size: "town", people: "placeholders" } as never);
        out[`settlementKit|${culture}|${v.era}|${v.fantastic}|${seed}`] = kit.sections.flatMap((s) => s.entries.map((e) => `${s.key}: ${e.text}`));
      }
    }
  }
  // Settlement names: the native cultures (British and every world culture, at their default era and at any size) and the colonial traditions.
  for (const seed of SEEDS) {
    for (const size of ["any", "village", "city"] as const) {
      for (const culture of ["britain", ...WORLD_CULTURES.map((c) => c.id)]) {
        for (const era of culture === "britain" ? [undefined] : WORLD_CULTURES.find((c) => c.id === culture)!.eras.map((e) => e.id)) {
          out[`settlementNames|${culture}|native|${size}|${era ?? "-"}|${seed}`] = textsOf(generateSettlementNames({ setting: "native", size, culture, era, count: COUNT, seed } as never));
        }
      }
      for (const setting of ["new-lands", "settled-lands"] as const) {
        for (const tradition of COLONIAL_CULTURES.map((c) => c.key)) {
          try {
            out[`settlementNames|${tradition}|${setting}|${size}|-|${seed}`] = textsOf(generateSettlementNames({ setting, size, tradition, count: COUNT, seed } as never));
          } catch (e) {
            out[`settlementNames|${tradition}|${setting}|${size}|-|${seed}`] = [`!${(e as Error).message}`];
          }
        }
      }
    }
  }
  return out;
}

const cultureOf = (key: string) => key.split("|")[1];

test("batch 5b baseline: non-core cultures are byte-identical to B0 (brief rule 1)", () => {
  if (process.env.CAPTURE_NE5B_BASELINE === "1") {
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
  assert.ok(checked > 500, `the baseline covers ${checked} non-core states`);
  assert.deepEqual(bad.slice(0, 20), [], `${bad.length} non-core states changed`);
});
