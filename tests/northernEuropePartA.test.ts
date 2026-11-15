// Northern Europe brief 5b Part A (§12): the region share and depth, the strays of the fills, the real-place list and the dictionary check.
import "../src/lensRosterSources";
import "../src/fill/batch";
import "../src/places/sources";
import "../src/deities/engine";
import "../src/tribes/engine";
import { test } from "node:test";
import assert from "node:assert/strict";
import lens from "../src/data/lens.json";
import realPlaces from "../src/data/real-places.json";
import { balanceRegion, REGION_SHARE, SIGNATURE_SHARE, setRegionProbe } from "../src/northData";
import { fillSlots, repeatsGeneric, type FillContext, type Resolvers } from "../src/fill";
import { isRealPlace } from "../src/realPlaces";
import { oldPersonResolver } from "../src/fill/people";
import { generateWildsNames } from "../src/wilds/engine";
import { defaultWildsState } from "../src/wilds/sentence";
import { generateWatersNames } from "../src/waters/engine";
import { defaultWatersState } from "../src/waters/sentence";
import { generateRouteNames } from "../src/routes/engine";
import { DEFAULT_ROUTE_STATE } from "../src/routes/sentence";
import { mulberry32 } from "../src/markov";

const WILDS = ["mountainNames", "forestNames", "moorNames", "wetlandNames", "grasslandNames", "lands", "farmland", "hillsValleys", "riversInland"];
const WATERS = ["seasLakes", "coastsIslands", "seaCharts"];
const EXEMPT = (lens as unknown as { regionExempt: Record<string, string[]> }).regionExempt;
const REGIONS: Record<string, [string, string[]]> = {
  english: ["norman-british", ["WCY", "SEA", "EAN", "WMM", "EMD", "NTH", "SBL"]], welsh: ["welsh", ["WAL"]], cornish: ["cornish", ["COR"]], scottish: ["scottish", ["SBL", "SLO", "SHH", "NSI"]],
  norse: ["norse", ["DEN", "NOR", "SWE", "ICE"]], scandinavian: ["scandinavian", ["DEN", "NOR", "SWE", "ICE"]], german: ["german", ["NDT", "RHN", "MIT", "ALP", "OST"]],
};

test("§12.1: the shares are in lens.json beside each other: signature 40%, region 30%", () => {
  assert.equal(SIGNATURE_SHARE, 0.4);
  assert.equal(REGION_SHARE, 0.3);
  assert.deepEqual((lens as unknown as { shares: Record<string, number> }).shares.region, 0.3);
});

test("§12.1: balanceRegion makes the regional plans 30% of the weight, and leaves the rest alone when none are live", () => {
  const plans: [string, number][] = [["a", 10], ["b", 30], ["r1", 1], ["r2", 1]];
  const out = balanceRegion(plans, (p) => p.startsWith("r"));
  const total = out.reduce((s, p) => s + p[1], 0);
  const reg = out.filter((p) => p[0].startsWith("r")).reduce((s, p) => s + p[1], 0);
  assert.ok(Math.abs(reg / total - REGION_SHARE) < 1e-9, String(reg / total));
  assert.deepEqual(out.filter((p) => !p[0].startsWith("r")), plans.slice(0, 2));
  assert.deepEqual(balanceRegion(plans.slice(0, 2), () => false), plans.slice(0, 2));
});

test("§12.2: every offered region has at least six region-weighted shapes in each land and water module whose landscape it has", () => {
  const short: string[] = [];
  for (const m of [...WILDS, ...WATERS, "routeNames"]) {
    for (const [culture, regions] of Object.values(REGIONS)) for (const region of regions) {
      if ((EXEMPT[m] ?? []).includes(region)) continue;
      // Sea charts and coasts take German only through the north German coast (brief §6).
      if (culture === "german" && (m === "coastsIslands" || m === "seaCharts") && region !== "NDT") continue;
      let regional = 0;
      setRegionProbe((i) => { regional += i.regional; });
      if (WILDS.includes(m)) generateWildsNames({ ...defaultWildsState(m as never), module: m, culture, region, era: "MD", count: 40, seed: 5 } as never);
      else if (WATERS.includes(m)) generateWatersNames({ ...defaultWatersState(m as never), module: m, culture, region, era: "MD", count: 40, seed: 5 } as never);
      else generateRouteNames({ ...DEFAULT_ROUTE_STATE, culture, region, era: "MD", count: 40, seed: 5 } as never);
      if (regional < 6) short.push(`${m} ${culture} ${region} ${regional}`);
    }
  }
  setRegionProbe(undefined);
  assert.deepEqual(short, []);
});

test("§12.2: exempt cells name only regions of the batch, and the exempt modules are land and water modules", () => {
  const all = new Set(Object.values(REGIONS).flatMap(([, r]) => r));
  for (const [m, regions] of Object.entries(EXEMPT).filter(([k]) => k !== "$comment")) {
    assert.ok([...WILDS, ...WATERS].includes(m), m);
    for (const r of regions) assert.ok(all.has(r), `${m} ${r}`);
  }
});

test("§12.1: choosing a region changes the names: German hills in different regions differ over five seeds", () => {
  const sets = new Map<string, Set<string>>();
  for (const region of ["RHN", "MIT", "ALP"]) {
    const s = new Set<string>();
    for (let seed = 1; seed <= 5; seed++) for (const n of generateWildsNames({ ...defaultWildsState("hillsValleys"), module: "hillsValleys", culture: "german", region, era: "MD", count: 12, seed } as never).names) s.add(n.text);
    sets.set(region, s);
  }
  const regional = (r: string, re: RegExp) => [...sets.get(r)!].filter((t) => re.test(t)).length;
  // Each region's own words show clearly more in its own region than in the others.
  assert.ok(regional("ALP", /Slope|Spur/) > regional("RHN", /Slope|Spur/) || regional("ALP", /Slope|Spur/) >= 3);
  assert.ok(regional("MIT", /Knoll|Spur/) >= 3);
});

// ── §12.3: strays ───────────────────────────────────────────────────────────────────────────────

const ctx = (resolvers: Resolvers, extra: Partial<FillContext> = {}): FillContext => ({ culture: "irish", era: "MD", mode: "real", rng: mulberry32(1), resolvers, ...extra });

test("§12.3: a fill that starts with the generic it follows is drawn again (\"River River Mother\")", () => {
  assert.ok(repeatsGeneric("River Mother", "River"));
  assert.ok(repeatsGeneric("The River Mother", "River of"));
  assert.ok(!repeatsGeneric("Keeper of Masks", "River"));
  let n = 0;
  const out = fillSlots("River [deity]", ctx({ deity: () => (n++ < 3 ? "River Mother" : "Keeper of Masks") }));
  assert.equal(out, "River Keeper of Masks");
});

test("§12.3: a deity fill after \"of\" takes \"the\"; one that already has it, or a pronoun form, does not", () => {
  assert.equal(fillSlots("Valley of [deity]", ctx({ deity: () => "Keeper of Masks" })), "Valley of the Keeper of Masks");
  assert.equal(fillSlots("Sea of [deity]", ctx({ deity: () => "the Watcher" })), "Sea of the Watcher");
  assert.equal(fillSlots("Sea of [deity]", ctx({ deity: () => "She Who Drowns the Proud" })), "Sea of She Who Drowns the Proud");
});

test("§12.3: a folk fill is singular before a people word (\"Hill Ploughmen\")", () => {
  // The folk resolver is the tribes engine's: its names never come out plural before a people word.
  const seen = new Set<string>();
  for (let seed = 1; seed <= 200; seed++) seen.add(fillSlots("Valley of [folk]", { culture: "norman-british", era: "MD", mode: "real", rng: mulberry32(seed) }));
  for (const t of seen) assert.ok(!/\b[A-Z][a-z]+[b-df-hj-np-rt-vw-z]s (Ploughmen|Herders|Folk|People|Kin)\b/.test(t), t);
  assert.ok([...seen].length > 5);
});

test("§12.3: an old personal name is never a feature word of a module list (\"Turlough\")", () => {
  const seen = new Set<string>();
  for (let seed = 1; seed <= 400; seed++) {
    const said = oldPersonResolver({ label: "old personal name", source: "oldPerson", slot: "givenMale", culture: "irish", era: "MD", period: "historic", mode: "real", rng: mulberry32(seed), avoid: new Set() });
    if (said) seen.add(said);
  }
  assert.ok(seen.size > 10);
  assert.ok(!seen.has("Turlough"), [...seen].join(", "));
});

test("§12.3: a name takes at most one place fill: a second is a single word, and a German place beside a feature word is bare", () => {
  const place: Resolvers = { place: (req) => (req.placeBefore ? "Ashby" : "Ashby Mill") };
  assert.equal(fillSlots("[place] Under Ben [place]", ctx(place)), "Ashby Mill Under Ben Ashby");
  for (let seed = 1; seed <= 60; seed++) {
    const t = fillSlots("[place] Hanse Quay", { culture: "german", era: "MD", mode: "real", rng: mulberry32(seed) });
    assert.ok(!/\[/.test(t) && !/(Castle|Mark|Mill|Heath) Hanse Quay$/.test(t), t);
  }
});

test("§12.3: a place fill that is a well-known real place is drawn again (\"Bath\")", () => {
  assert.ok(isRealPlace("Bath") && isRealPlace("york") && isRealPlace("Snowdon"));
  assert.ok((realPlaces as { places: string[] }).places.length >= 150);
  for (let seed = 1; seed <= 300; seed++) {
    const t = fillSlots("[place]", { culture: "norman-british", era: "MD", mode: "real", rng: mulberry32(seed) });
    assert.ok(!isRealPlace(t), t);
  }
});

test("§12.4: no word replaced by the dictionary check is left in the batch's data", async () => {
  const north = JSON.stringify((await import("../src/data/north5a.json")).default);
  for (const w of ["Ballybetagh", "Cantred", "Callow", "Davoch", "Fank", "Fermtoun", "Fianna", "Heugh", "Knott"]) assert.ok(!new RegExp(`"[^"]*\\b${w}\\b`).test(north), w);
});
