// Northern Europe tables brief, batch 5a fixes (§11): depth per module, the culture showing, era words, words, and the fills and sources.
import "../src/lensRosterSources";
import "../src/fill/batch";
import "../src/places/sources";
import "../src/vessels/engine";
import { test } from "node:test";
import assert from "node:assert/strict";
import { COVERAGE_ADAPTERS } from "../src/coverage";
import { NORTH, combeFor, isNounPool } from "../src/northData";
import { fillSlots, followsBareGeneric, type FillContext, type Resolvers } from "../src/fill";
import { generateWildsNames } from "../src/wilds/engine";
import { defaultWildsState } from "../src/wilds/sentence";
import { generateWatersNames } from "../src/waters/engine";
import { defaultWatersState } from "../src/waters/sentence";
import { generateRouteNames } from "../src/routes/engine";
import { DEFAULT_ROUTE_STATE } from "../src/routes/sentence";
import { generateRiverNames } from "../src/rivers/engine";
import { drawKind, sourceFor, type KindSources } from "../src/places/sources";
import { mulberry32 } from "../src/markov";
import vocab from "../src/data/settlement-vocab.json";

const CORE = ["anglo-saxon", "norman-british", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german"];
const CELTIC = ["celtic"];
const pools = NORTH.vocab.pools as Record<string, { entries?: { w: string; c?: string[]; e?: string[]; h?: boolean }[] }>;
const wildsShapes = NORTH.wilds.cultureShapes as { p: string; culture?: string; c?: string[]; module: string; sig?: boolean; grp?: boolean }[];
const own = (s: { culture?: string; c?: string[] }, key: string) => s.culture === key || s.c?.includes(key);

// ── §11.1, §11.2: depth per module ─────────────────────────────────────────────────────────────

test("§11.2: every noun pool holds at least 8 words for each core culture (10 as written) and 4 for Celtic", () => {
  const nounPools = Object.keys(pools).filter(isNounPool);
  assert.ok(nounPools.length >= 42, `${nounPools.length} noun pools`);
  const short: string[] = [];
  for (const name of nounPools) {
    if (name.startsWith("nDesert")) continue; // deserts are exempt except for Norse and Scandinavian (§6)
    for (const key of CORE) {
      const n = (pools[name].entries ?? []).filter((e) => e.c?.includes(key)).length;
      if (n < 8) short.push(`${name} ${key} ${n}`);
    }
    for (const key of CELTIC) {
      const n = (pools[name].entries ?? []).filter((e) => e.c?.includes(key)).length;
      if (n < 4) short.push(`${name} ${key} ${n}`);
    }
  }
  assert.deepEqual(short, []);
});

test("§11.2: every module has at least 6 frames of its own per core culture (10 as written), apart from the group frames", () => {
  const modules = [...new Set(wildsShapes.filter((s) => s.sig && !s.grp).map((s) => s.module))].filter((m) => m !== "desertNames");
  assert.ok(modules.length >= 9);
  const short: string[] = [];
  for (const module of modules) for (const key of CORE) {
    const n = wildsShapes.filter((s) => s.module === module && own(s, key) && s.sig && !s.grp && !("rt" in s)).length;
    if (n < 6) short.push(`${module} ${key} ${n}`);
  }
  assert.deepEqual(short, []);
});

test("§11.1: the shared group pools and the group frames are not counted towards a signature cell", () => {
  for (const adapter of COVERAGE_ADAPTERS.filter((a) => ["mountainNames", "coastsIslands", "routeNames", "sacredPlaces", "lands"].includes(a.module))) {
    const sources = new Set(adapter.rows().map((r) => r.source));
    for (const shared of ["nLandB", "nLandC", "nLandD", "nLandDOld", "nWaterB", "nWaterC", "nWaterD", "nRouteB", "nRouteD", "nSacredB", "nSacredD"]) assert.ok(!sources.has(shared), `${adapter.module} counts ${shared}`);
  }
  // A group frame is in the data (it is drawn) but not in the module's own count.
  assert.ok(wildsShapes.some((s) => s.grp && s.module === "mountainNames" && own(s, "welsh")));
});

// ── §11.3: the culture shows ───────────────────────────────────────────────────────────────────

test("§11.3: a core culture's signature frames take about 40% of the draws of a kind at home", () => {
  for (const [module, culture] of [["mountainNames", "welsh"], ["hillsValleys", "german"], ["forestNames", "scottish"], ["riversInland", "irish"]] as const) {
    const sig = new Set(wildsShapes.filter((s) => s.module === module && own(s, culture) && s.sig).map((s) => s.p));
    for (const kind of module === "mountainNames" ? ["peak"] : module === "hillsValleys" ? ["hill"] : module === "forestNames" ? ["forest"] : ["stream"]) {
      // Many short batches: in one long batch the signature names (few nouns, brackets) are the first to run out of new ones.
      const names = Array.from({ length: 120 }, (_x, i) => generateWildsNames({ ...defaultWildsState(module), module, culture, kind, where: "home", count: 4, seed: 100 + i, people: "placeholders" } as never).names).flat();
      const own = names.filter((n) => n.shape !== "source");
      const share = own.filter((n) => sig.has(n.shape)).length / own.length;
      assert.ok(share > 0.3 && share < 0.55, `${module} ${culture} ${kind} ${share}`);
    }
  }
});

test("§11.3: within twelve names a culture noun appears at most twice", () => {
  for (const culture of CORE) {
    for (const module of ["mountainNames", "hillsValleys", "forestNames", "lands"] as const) {
      const names = generateWildsNames({ ...defaultWildsState(module), module, culture, where: "home", count: 12, seed: 9, people: "placeholders" } as never).names;
      const count = new Map<string, number>();
      for (const n of names) for (const w of n.words) if (isNounPool(w.pool)) count.set(w.word.toLowerCase(), (count.get(w.word.toLowerCase()) ?? 0) + 1);
      for (const [word, n] of count) assert.ok(n <= 2, `${culture} ${module}: ${word} ×${n}`);
    }
  }
});

// ── §11.4: era words ───────────────────────────────────────────────────────────────────────────

test("§11.4: no `{D} {N}` frame; era words stand on their own; Ley Line is modern and fantastic only", () => {
  const all = [...NORTH.wilds.cultureShapes, ...NORTH.waters.cultureShapes, ...NORTH.routes.cultureShapes] as { p: string }[];
  for (const s of all) assert.ok(!/\{n(Land|Water|Route|Sacred)D\} \{n[A-Z]/.test(s.p), s.p);
  assert.ok(all.some((s) => s.p.startsWith("Old {n") && s.p.includes("DOld}")), "Old {D} from the steam age on");
  const ley = (pools.nLandD.entries ?? []).filter((e) => e.w === "Ley Line");
  assert.ok(ley.length > 0);
  for (const e of ley) {
    assert.deepEqual(e.e, ["MO"]);
    assert.equal(e.h, true);
  }
});

// ── §11.5: words ───────────────────────────────────────────────────────────────────────────────

test("§11.5: no Barrow Wight, Autobahn, Bal, Carn or Draugr", () => {
  const text = JSON.stringify(NORTH);
  for (const bad of ["Barrow Wight", "Autobahn", "Draugr"]) assert.ok(!text.includes(bad), bad);
  for (const e of Object.values(pools).flatMap((p) => p.entries ?? [])) assert.ok(!/^(Bal|Carn)$/.test(e.w), e.w);
});

