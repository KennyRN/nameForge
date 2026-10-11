// Settlement kit (Settlement kit brief §13).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mulberry32 } from "../src/markov";
import { buildContext, selfPatterns, unmarkedTownPatterns, type SettlementContext } from "../src/settlement/context";
import { generateRouteNames, ROUTE_CULTURES, ROUTE_ERAS, routeBlockSet, routeNorm, type RouteEra } from "../src/routes/engine";
import { generateStreetNames, streetBlockSet } from "../src/streets/engine";
import { generateInnNames, innBlockForms, innBlockSet } from "../src/inns/engine";
import { buildingBlockSet, generateBuildingNames } from "../src/buildings/engine";
import { generateGroupNames, GROUP_DATA, normForBlock } from "../src/groups/engine";
import { generateBynames } from "../src/bynames/engine";
import { generateVesselNames } from "../src/vessels/engine";
import { inCultureGroup } from "../src/settlement/vocab";
import { engineSnapshot } from "./fixtures/engineSnapshot";

const ctxFor = (culture: string, era: RouteEra = "MD", people: "placeholders" | "invented" = "invented", seed = 7) =>
  buildContext({ culture, era, fantastic: false, people }, mulberry32(seed));

// ── §13.1 Context ───────────────────────────────────────────────────────────

test("§13.1: the same options and seed give the same context", () => {
  for (const culture of ["norman-british", "japanese", "maya"]) assert.deepEqual(ctxFor(culture, "EM", "invented", 3), ctxFor(culture, "EM", "invented", 3));
  assert.notDeepEqual(ctxFor("norman-british", "MD", "invented", 3), ctxFor("norman-british", "MD", "invented", 4));
});

test("§13.1: town and the 6 neighbours are all different, never placeholders, and pass every module's safeguards", () => {
  const route = routeBlockSet();
  const street = streetBlockSet();
  const inn = innBlockSet();
  const building = buildingBlockSet();
  const group = new Set(GROUP_DATA.safeguards.block.map(normForBlock));
  for (const c of ROUTE_CULTURES) {
    for (const { code: era } of ROUTE_ERAS) {
      for (const people of ["placeholders", "invented"] as const) {
        const ctx = ctxFor(c.key, era, people, 11);
        const all = [ctx.town, ...ctx.neighbours];
        const where = `${c.key} ${era} ${people}: ${all.join(", ")}`;
        assert.equal(ctx.neighbours.length, 6, where);
        assert.equal(new Set(all.map((t) => t.toLowerCase())).size, 7, where);
        for (const t of all) {
          assert.ok(t && !t.includes("["), where);
          assert.ok(!route.has(routeNorm(t)) && !street.has(routeNorm(t)) && !innBlockForms(t).some((f) => inn.has(f)), where);
          assert.ok(!building.has(routeNorm(t).replace(/^the /, "")) && !group.has(normForBlock(t)), where);
        }
      }
    }
  }
});

test("§13.1: holy only for christian cultures; trades null for indian and west-african; two goods", () => {
  for (const c of ROUTE_CULTURES) {
    for (const era of ["AN", "MD", "ST"] as RouteEra[]) {
      const ctx = ctxFor(c.key, era);
      if (inCultureGroup("christian", c.key, era)) assert.ok(ctx.holy?.startsWith("Saint "), `${c.key} ${era}`);
      else assert.equal(ctx.holy, null, `${c.key} ${era}`);
      if (c.key === "indian" || c.key === "west-african") assert.equal(ctx.trades, null);
      else assert.equal(ctx.trades?.length, 2, c.key);
      assert.equal(ctx.goods.length, 2, c.key);
      assert.equal(ctx.throughRoute, null);
      assert.deepEqual(ctx.landmarks, []);
    }
  }
  assert.equal(ctxFor("polynesian").vesselCulture, "hawaiian");
  assert.equal(ctxFor("andean").tradition, "andean");
});

// ── §13.2 Engines with context ──────────────────────────────────────────────

const DATA = ["route-names", "street-names", "inn-names", "building-names", "group-names", "bynames", "vessels"].map((f) => [f, JSON.parse(readFileSync(`src/data/${f}.json`, "utf8"))] as const);

test("§13.2: every pattern with {town} in the seven engines is marked self or not", () => {
  for (const [file, data] of DATA) assert.deepEqual(unmarkedTownPatterns(data), [], file);
});

const SELF = new Set(DATA.flatMap(([, d]) => [...selfPatterns(d)]));
const withTown = (p: string) => /\{town[}:]/.test(p);

/** The context's town in self shapes; only neighbours (never the town) in the others' {town} and {destination}. */
function checkPlaces(ctx: SettlementContext, label: string, names: { text: string; shape: string }[]) {
  let self = 0;
  let other = 0;
  for (const n of names) {
    if (SELF.has(n.shape)) {
      assert.ok(n.text.includes(ctx.town), `${label}: ${n.text} (${n.shape})`);
      self++;
    } else if (withTown(n.shape) || n.shape.includes("{destination")) {
      assert.ok(ctx.neighbours.some((t) => n.text.includes(t)), `${label}: ${n.text} (${n.shape})`);
      other++;
    }
  }
  return { self, other };
}

test("§13.2: with a context, self shapes name the settlement and the rest its neighbours", () => {
  for (const people of ["placeholders", "invented"] as const) {
    const ctx = ctxFor("norman-british", "EM", people, 21);
    const counts: Record<string, { self: number; other: number }> = {};
    const add = (label: string, names: { text: string; shape: string }[]) => {
      const c = checkPlaces(ctx, label, names);
      counts[label] = { self: (counts[label]?.self ?? 0) + c.self, other: (counts[label]?.other ?? 0) + c.other };
    };
    for (let seed = 1; seed <= 30; seed++) {
      for (const era of ["EM", "ST", "MO"] as RouteEra[]) {
        add("routes", generateRouteNames({ culture: "norman-british", era, people, count: 10, seed, context: ctx }).names);
        add("streets", generateStreetNames({ culture: "norman-british", era, people, count: 10, seed, context: ctx }).names);
        add("inns", generateInnNames({ culture: "norman-british", era, people, count: 10, seed, context: ctx }).names);
        add("buildings", generateBuildingNames({ culture: "norman-british", era, people, count: 10, seed, context: ctx }).names);
      }
      for (const family of ["martial", "trade", "power", "underworld"]) add("groups", generateGroupNames({ family, tradition: ctx.tradition, people, count: 10, seed, context: ctx }).names);
      add("bynames", generateBynames({ module: "titles", culture: "norman-british", kind: "office", count: 10, seed, context: ctx }).names);
      add("vessels", generateVesselNames({ module: "ships", culture: "norman-british", people, count: 10, seed, context: ctx }).names);
    }
    for (const label of ["routes", "inns", "buildings", "groups", "bynames"]) assert.ok(counts[label].self > 0, `${people} ${label}: no self shapes`);
    for (const label of ["routes", "streets"]) assert.ok(counts[label].other > 0, `${people} ${label}: no neighbours`);
  }
});

test("§4: with a context, {founder} is the context's, and its saint is the commonest", () => {
  const ctx = ctxFor("norman-british", "MD", "invented", 5);
  const holy = ctx.holy!;
  let withSaint = 0;
  let saints = 0;
  for (let seed = 1; seed <= 200; seed++) {
    for (const n of generateBuildingNames({ culture: "norman-british", kind: "faith", people: "invented", count: 5, seed, context: ctx }).names) {
      if (n.text.startsWith("Saint ")) {
        saints++;
        if (n.text.startsWith(holy)) withSaint++;
      }
      if (n.shape.includes("{founder")) assert.ok(n.text.includes(ctx.founder), n.text);
    }
  }
  assert.ok(saints > 20 && withSaint / saints > 0.5, `${withSaint}/${saints}`);
});

test("§13.2: without a context, every engine's output matches the fixture exactly", () => {
  const fixture = JSON.parse(readFileSync("tests/fixtures/settlement-engines.json", "utf8"));
  assert.deepEqual(engineSnapshot(), fixture);
});
