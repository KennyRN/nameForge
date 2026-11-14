// One sentence brief §5.2, §8.2: the probe's file is current, its entries for four modules agree with the
// engines run directly, and its structure is sound. Regenerate the file with `npm run offers`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LENS_ERAS } from "../src/lens";
import { buildOffers, type ModuleOffers } from "./fixtures/lensOffersProbe";
import { generateInnNames, INN_KINDS } from "../src/inns/engine";
import { DEFAULT_INN_STATE, innFormFor } from "../src/inns/sentence";
import { generateWildsNames } from "../src/wilds/engine";
import { defaultWildsState } from "../src/wilds/sentence";
import { generateGroupNames, familyForSection } from "../src/groups/engine";
import { DEFAULT_GROUP_STATE } from "../src/groups/sentence";
import { generateVesselNames } from "../src/vessels/engine";
import { defaultVesselState } from "../src/vessels/sentence";

const FILE = "src/data/lens-offers.json";
const file = JSON.parse(readFileSync(FILE, "utf8")) as { modules: Record<string, ModuleOffers> };
const offers = file.modules;
const names = (r: { names: { text: string }[] }) => r.names.map((n) => n.text);
const SEEDS = [1, 42, 2024];
/** Two states differ if any variant (kind, type …) at any of the three seeds gives a different list: the probe's own rule. */
const differsOver = (run: (state: object, seed: number) => string[], variants: object[], a: object, b: object) => variants.some((v) => differs(run, { ...v, ...a }, { ...v, ...b }));
/** Two states differ if any of the three seeds gives a different list. */
const differs = (run: (state: object, seed: number) => string[], a: object, b: object) => SEEDS.some((seed) => JSON.stringify(run(a, seed)) !== JSON.stringify(run(b, seed)));

test("lens-offers.json is current: regenerating it gives the same file", () => {
  const fresh = JSON.parse(JSON.stringify(buildOffers()));
  assert.deepEqual(JSON.parse(readFileSync(FILE, "utf8")), fresh, "src/data/lens-offers.json is stale: run `npm run offers` and commit the result");
});

test("every family A and B module has an entry", () => {
  assert.equal(Object.keys(offers).length, 45);
  assert.equal(Object.values(offers).filter((m) => m.family === "A").length, 30);
  assert.equal(Object.values(offers).filter((m) => m.family === "B").length, 15);
});

test("family A: the era runs partition the offered eras in the lens's order, and every era has a world entry", () => {
  const order = LENS_ERAS.map((e) => e.code);
  for (const [key, m] of Object.entries(offers).filter(([, m]) => m.family === "A")) {
    const flat = (m.eras as string[][]).flat();
    assert.deepEqual(flat, order.filter((c) => flat.includes(c)), `${key}: in order, none repeated`);
    assert.deepEqual(Object.keys(m.worlds), flat, `${key}: a world entry per era`);
    for (const run of m.eras as string[][]) {
      assert.deepEqual(run, order.filter((c) => run.includes(c)));
      // Adjacent in the lens's order: a run is a stretch of the offered eras.
      assert.equal(flat.indexOf(run[run.length - 1]) - flat.indexOf(run[0]), run.length - 1, `${key}: a run is contiguous`);
    }
    for (const w of Object.values(m.worlds)) assert.ok(w[0] === "plain" && w.length <= 2, `${key}: plain first`);
    // Eras in one run share their worlds.
    for (const run of m.eras as string[][]) for (const c of run) assert.deepEqual(m.worlds[c], m.worlds[run[0]], `${key}: ${c} reads as ${run[0]}`);
  }
});

test("family B: the bands are a subset of the three, in order, with a world entry each", () => {
  const BANDS = ["pre-industrial", "industrial and modern", "future"];
  for (const [key, m] of Object.entries(offers).filter(([, m]) => m.family === "B")) {
    const bands = m.eras as string[];
    assert.deepEqual(bands, BANDS.filter((b) => bands.includes(b)), key);
    assert.deepEqual(Object.keys(m.worlds), bands, key);
  }
  assert.deepEqual(offers.supernaturalCourts.eras, ["pre-industrial", "industrial and modern"], "courts have no science fiction");
  assert.deepEqual(offers.spacecraft.eras, ["industrial and modern", "future"], "spacecraft have no fantasy genre");
});

test("views appear only on modules with a region link, and only for Welsh, Scottish and Cornish", () => {
  for (const [key, m] of Object.entries(offers)) {
    if (m.views) for (const v of m.views) assert.ok(["welsh", "scottish", "cornish"].includes(v), `${key}: ${v}`);
  }
  for (const key of ["desertNames", "eventNames", "moneyNames", "deityNames", "calendarNames", "peoplesTongues", "ships", "realms"]) assert.equal(offers[key].views, undefined, `${key} reads no region`);
  for (const key of ["routeNames", "innNames", "mountainNames", "seasLakes", "settlementKit"]) assert.ok(offers[key].views, `${key} reads a region`);
});

// ── Hand-checked entries ───────────────────────────────────────────────────
// Each is checked against the engines run directly, not through the probe: a difference found directly proves
// the probe must record it; a sameness found directly at the defaults is what a merged run needs.

test("inns and taverns: all seven eras apart; the fantastic world differs in every era; Welsh, Scottish and Cornish are real", () => {
  assert.deepEqual(offers.innNames.eras, [["AN"], ["MD"], ["EM"], ["ST"], ["MO"], ["NF"], ["IS"]]);
  for (const era of LENS_ERAS.map((e) => e.code)) assert.deepEqual(offers.innNames.worlds[era], ["plain", "fantastic"], era);
  const inn = (over: object, seed: number): string[] => {
    const state = { ...DEFAULT_INN_STATE, ...over } as typeof DEFAULT_INN_STATE;
    return names(generateInnNames({ ...state, form: innFormFor(state), count: 12, seed }));
  };
  // Directly: neighbouring eras differ, and the fantastic world differs from the realistic one, at seed 1.
  const codes = LENS_ERAS.map((e) => e.code);
  for (let i = 0; i < codes.length - 1; i++) assert.ok(differs(inn, { era: codes[i] }, { era: codes[i + 1] }), `${codes[i]} and ${codes[i + 1]} differ`);
  for (const era of codes) assert.ok(differs(inn, { era, fantastic: true }, { era, fantastic: false }), `${era}: fantastic differs`);
  // Welsh (WAL), Cornish (COR) and one Scottish region each change a Celtic inn's names.
  const kinds = [{}, ...INN_KINDS.map((k) => ({ kind: k.key }))];
  assert.ok(differsOver(inn, kinds, { culture: "celtic", region: "WAL" }, { culture: "celtic" }), "Welsh");
  assert.ok(differsOver(inn, kinds, { culture: "celtic", region: "COR" }, { culture: "celtic" }), "Cornish");
  assert.ok(["SBL", "SLO", "SHH", "NSI"].some((r) => differsOver(inn, kinds, { culture: "celtic", region: r }, { culture: "celtic" })), "Scottish");
  assert.deepEqual(offers.innNames.views, ["welsh", "scottish", "cornish"]);
});

test("mountains: the near future and interstellar are one run; Welsh, Scottish and Cornish are real; deserts read no region", () => {
  assert.deepEqual(offers.mountainNames.eras, [["AN"], ["MD"], ["EM"], ["ST"], ["MO"], ["NF", "IS"]]);
  assert.deepEqual(offers.mountainNames.worlds.IS, offers.mountainNames.worlds.NF);
  const wilds = (over: object, seed: number): string[] => names(generateWildsNames({ ...defaultWildsState("mountainNames"), module: "mountainNames", ...over, count: 12, seed } as never));
  // At the defaults the two future eras give the same names, with the world either way and at every seed: what a merge needs.
  for (const seed of SEEDS) for (const fantastic of [false, true]) assert.deepEqual(wilds({ era: "NF", fantastic }, seed), wilds({ era: "IS", fantastic }, seed), `NF = IS, ${fantastic}, ${seed}`);
  // The earlier eras differ from their neighbours.
  for (const [a, b] of [["AN", "MD"], ["MD", "EM"], ["EM", "ST"], ["ST", "MO"], ["MO", "NF"]]) assert.ok(differs(wilds, { era: a }, { era: b }), `${a} and ${b}`);
  assert.ok(differs(wilds, { culture: "celtic", region: "WAL" }, { culture: "celtic" }), "Welsh");
  assert.deepEqual(offers.mountainNames.views, ["welsh", "scottish", "cornish"]);
  assert.equal(offers.desertNames.views, undefined);
});

test("powers and factions: three bands; science fiction is realistic only; no region views", () => {
  assert.deepEqual(offers.powerFactions.eras, ["pre-industrial", "industrial and modern", "future"]);
  assert.deepEqual(offers.powerFactions.worlds, { "pre-industrial": ["plain", "fantastic"], "industrial and modern": ["plain", "fantastic"], future: ["plain"] });
  assert.equal(offers.powerFactions.views, undefined);
  const family = familyForSection("powerFactions")!;
  const group = (over: object, seed: number): string[] => names(generateGroupNames({ ...DEFAULT_GROUP_STATE, ...over, family: family.key, count: 12, seed } as never));
  const types = [{}, ...family.types.map((t) => ({ type: t.key }))];
  assert.ok(differsOver(group, types, { genre: "fantasy", fantastic: true }, { genre: "fantasy", fantastic: false }));
  assert.ok(differsOver(group, types, { genre: "modern", fantastic: true }, { genre: "modern", fantastic: false }));
  for (const seed of SEEDS) assert.deepEqual(group({ genre: "scifi", fantastic: true }, seed), group({ genre: "scifi", fantastic: false }, seed), `science fiction ignores the fantastic switch (${seed})`);
});

test("ships and boats: the fantastic switch changes nothing in any band; the bands are real", () => {
  assert.deepEqual(offers.ships.eras, ["pre-industrial", "industrial and modern", "future"]);
  assert.deepEqual(offers.ships.worlds, { "pre-industrial": ["plain"], "industrial and modern": ["plain"], future: ["plain"] });
  const ship = (over: object, seed: number): string[] => names(generateVesselNames({ ...defaultVesselState("ships"), module: "ships", ...over, count: 12, seed } as never));
  for (const seed of SEEDS) for (const genre of ["fantasy", "modern", "scifi"]) assert.deepEqual(ship({ genre, fantastic: true }, seed), ship({ genre, fantastic: false }, seed), `${genre} ${seed}`);
  // The genres themselves are different engines' worth of names.
  // The probe records the bands a module offers; it doesn't test that the genre itself changes the names
  // (for ships the technology carries the age, so at the default technology the genres can give the same names).
  assert.ok(differs(ship, { genre: "fantasy" }, { genre: "modern" }));
  assert.equal(offers.ships.views, undefined);
});
