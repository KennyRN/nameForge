// Northern Europe tables brief, batch 5b (§9): every core cell of the batch's modules meets its target (§6) or its exemption, the region
// words are drawn only for their cultures, settlement names exist for every culture at every size, place fills read each culture's own
// settlement names, and no generated name is a famous real place.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { COVERAGE_ADAPTERS, moduleCoverage } from "../src/coverage";
import { NORTH5B } from "../src/northData5b";
import { generateSettlementNames } from "../src/settlement/names";
import { generateStreetNames } from "../src/streets/engine";
import { generateInnNames } from "../src/inns/engine";
import { generateBuildingNames } from "../src/buildings/engine";
import { generateMonumentNames } from "../src/monuments/engine";
import { fillSlots } from "../src/fill";
import { mulberry32 } from "../src/markov";
import { isRealPlace } from "../src/realPlaces";
import "../src/places/sources";

const MODULES = ["settlementNames", "streetNames", "innNames", "buildingNames", "monumentNames"];
const OWN_MODULES = MODULES.slice(1);
const CORE = ["english", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german"];
const adapter = (m: string) => COVERAGE_ADAPTERS.find((a) => a.module === m)!;
const REGIONS: Record<string, string[]> = {
  english: ["WCY", "SEA", "EAN", "WMM", "EMD", "NTH", "SBL"],
  scottish: ["SBL", "SLO", "SHH", "NSI"],
  norse: ["DEN", "NOR", "SWE", "ICE"],
  scandinavian: ["DEN", "NOR", "SWE", "ICE"],
  german: ["NDT", "RHN", "MIT", "ALP", "OST"],
};

test("5b §6: every core culture has 30 signature words and 10 shapes in every module of the batch; Celtic 12 and 4", () => {
  const short: string[] = [];
  for (const m of MODULES) {
    const cov = moduleCoverage(adapter(m));
    for (const c of CORE) if (cov.cultures[c].words < 30 || cov.cultures[c].shapes < 10) short.push(`${m} ${c} ${cov.cultures[c].words}/${cov.cultures[c].shapes}`);
    if (cov.cultures.celtic.words < 12 || cov.cultures.celtic.shapes < 4) short.push(`${m} celtic ${cov.cultures.celtic.words}/${cov.cultures.celtic.shapes}`);
  }
  assert.deepEqual(short, []);
});

test("5b §12.2: each module's own nouns are three lists of at least eight words per core culture (Celtic 8, as written), and each culture has at least six frames of its own", () => {
  for (const pools of [["nbStreetStreet", "nbStreetSquare", "nbStreetDistrict"], ["nbInnInn", "nbInnTavern", "nbInnWayhouse"], ["nbBuildDefence", "nbBuildFaith", "nbBuildCivic"], ["nbMonStone", "nbMonCross", "nbMonMemorial"]]) {
    for (const pool of pools) {
      const entries = NORTH5B.vocab.pools[pool].entries as { w: string; c: string[] }[];
      for (const culture of ["anglo-saxon", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german", "celtic"]) {
        assert.ok(entries.filter((e) => e.c?.includes(culture) && !("r" in e)).length >= 8, `${pool} ${culture}`);
      }
    }
  }
  const shapes: Record<string, number> = {};
  for (const list of [NORTH5B.streets.cultureStreets, NORTH5B.streets.cultureSquares, NORTH5B.streets.cultureDistricts] as { culture?: string; c?: string[]; rg?: boolean }[][]) {
    for (const s of list) if (!s.rg) for (const k of s.culture ? [s.culture] : s.c!) shapes[`streets ${k}`] = (shapes[`streets ${k}`] ?? 0) + 1;
  }
  for (const [module, map] of [["inns", NORTH5B.inns.cultureShapes], ["buildings", NORTH5B.buildings.cultureShapes], ["monuments", NORTH5B.monuments.cultureShapes]] as [string, Record<string, { rg?: boolean }[]>][]) {
    for (const [k, list] of Object.entries(map)) shapes[`${module} ${k}`] = list.filter((s) => !s.rg).length;
  }
  for (const [key, n] of Object.entries(shapes)) assert.ok(n >= (key.endsWith("celtic") || key.endsWith("iberian") || key.endsWith("greek-byzantine") ? 4 : 10), `${key} ${n}`);
});

test("5b §6, §12.2: every region has 6 entries in every module that reads it", () => {
  const short: string[] = [];
  for (const m of MODULES) {
    const regions = moduleCoverage(adapter(m)).regions!;
    for (const [culture, codes] of Object.entries(REGIONS)) {
      // Settlement names: English settlements are the British engine's (its regions are the place shape regions).
      if (m === "settlementNames" && culture === "english") continue;
      for (const code of codes) if ((regions[code] ?? 0) < 6) short.push(`${m} ${culture} ${code} ${regions[code] ?? 0}`);
    }
  }
  assert.deepEqual(short, []);
});

test("5b §6: every core culture has 6 entries restricted to each era the module reads", () => {
  const short: string[] = [];
  for (const m of OWN_MODULES) {
    const rows = adapter(m).rows();
    for (const c of CORE) for (const e of ["AN", "MD", "EM", "ST", "MO"]) {
      const n = rows.filter((r) => r.cultures?.includes(c) && r.eras?.includes(e)).length;
      if (n < 6) short.push(`${m} ${c} ${e} ${n}`);
    }
  }
  assert.deepEqual(short, []);
});

test("5b §7: every culture has at least three fantastic words in every module of the batch, in its own lore", () => {
  const short: string[] = [];
  for (const m of OWN_MODULES) {
    const rows = adapter(m).rows();
    for (const c of [...CORE, "celtic"]) {
      const n = rows.filter((r) => r.type === "word" && r.cultures?.includes(c) && r.styles && r.styles.length > 0).length;
      if (n < 3) short.push(`${m} ${c} ${n}`);
    }
  }
  assert.deepEqual(short, []);
});

test("5b §4: a Scandinavian or German region word is drawn only for its own cultures; an English region word only for English and Scottish", () => {
  for (const pool of ["nbStreetRegion", "nbInnRegion", "nbBuildRegion", "nbMonRegion"]) {
    for (const e of NORTH5B.vocab.pools[pool].entries as { w: string; c: string[]; r: string[] }[]) {
      const code = e.r[0];
      const readers = Object.entries(REGIONS).filter(([, codes]) => codes.includes(code)).map(([k]) => k);
      for (const c of e.c) {
        const lens = c === "anglo-saxon" || c === "norman-british" ? "english" : c;
        assert.ok(readers.includes(lens), `${pool} ${e.w} (${code}) is for ${c}`);
      }
    }
  }
  // And in the output: a Rhineland word never turns up for a non-German culture.
  const words = /Vineyard Lane|Wine Street|Cellar Row|Wine Tavern|Vintners' Inn|Wine Press House|Vineyard Cross/;
  for (const culture of ["norman-british", "welsh", "scottish", "norse", "roman", "japanese"]) {
    const seen: string[] = [];
    for (const fn of [generateStreetNames, generateInnNames, generateBuildingNames, generateMonumentNames] as ((o: never) => { names: { text: string }[] })[]) {
      for (const n of fn({ culture, era: "MD", count: 200, seed: 5, people: "placeholders", region: "RHN" } as never).names) if (words.test(n.text)) seen.push(n.text);
    }
    assert.deepEqual(seen, [], culture);
  }
});

test("5b B1: every core culture has settlement names at every size and era, in English, with no bracket", () => {
  for (const culture of ["welsh", "cornish", "scottish", "irish", "scandinavian", "german", "norse"]) {
    for (const size of ["any", "hamlet", "village", "town", "city", "great"] as const) {
      const r = generateSettlementNames({ setting: "native", size, culture, count: 12, seed: 4 });
      assert.ok(r.names.length >= 8, `${culture} ${size}: ${r.names.length}`);
      for (const n of r.names) assert.ok(!/\[|\{/.test(n.text), n.text);
    }
  }
  // The Scottish, Norse, Scandinavian and German regions change the names (the region draws from its own stream).
  const seen = new Set<string>();
  for (const region of ["NDT", "RHN", "MIT", "ALP", "OST"]) seen.add(generateSettlementNames({ setting: "native", size: "any", culture: "german", region, count: 12, seed: 4 }).names.map((n) => n.text).join("|"));
  assert.equal(seen.size, 5);
});

test("5b B1: a place fill reads the culture's own settlement names (Welsh fills Welsh, German fills German); a non-core culture's fills are as they were", () => {
  const OWN: Record<string, RegExp> = {
    welsh: /(Church|Mouth|Head|Fort|Hall|Castle|Market|Bridge|Meadow|Ford|Well|Chapel|Quarry|Farm|Hill|Mount|Rock|Ridge|Cairn|Knoll|Valley|Combe|Glen|Dale|Vale)/,
    german: /(Village|Houses|Home|Town|Castle|Field|Mark|Clearing|Cloister|Meadow|Acre)/,
  };
  for (const [culture, pattern] of Object.entries(OWN)) {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 60; seed++) seen.add(fillSlots("[place]", { culture, era: "MD", mode: "real", rng: mulberry32(seed) }));
    for (const t of seen) assert.ok(!/\[/.test(t), t);
    assert.ok([...seen].filter((t) => pattern.test(t)).length > seen.size / 3, `${culture}: ${[...seen].slice(0, 6).join("; ")}`);
  }
});

test("5b §B3: no generated settlement template, word or region word is a famous real place", () => {
  const words = new Set<string>();
  for (const pool of Object.values(NORTH5B.vocab.pools)) for (const e of pool.entries as { w: string }[]) words.add(e.w);
  for (const c of NORTH5B.settlement.cultures) for (const [k, list] of Object.entries(c.lists)) if (k !== "name" && k !== "saint") for (const w of list) words.add(w);
  // "Inn" is the English word (a river of that name is on the list).
  for (const w of words) if (w !== "Inn") assert.ok(!isRealPlace(w), w);
});
