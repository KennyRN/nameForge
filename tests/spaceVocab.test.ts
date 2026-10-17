// Stellar brief §11: the smaller vocabulary passes.
import test from "node:test";
import assert from "node:assert/strict";
import { generateStreetNames } from "../src/streets/engine";
import { SETTLEMENT_VOCAB } from "../src/settlement/vocab";
import { generateVesselNames } from "../src/vessels/engine";

const entries = (pool: string) => SETTLEMENT_VOCAB.pools[pool].entries.map((e) => e.w);

test("§11.1: station names gain space-land, Lagrange, body-ring, anchorage and star-haven patterns", () => {
  const names: string[] = [];
  for (let seed = 1; seed <= 400; seed++) names.push(...generateVesselNames({ module: "spacecraft", function: "station", genre: "scifi", people: "invented", count: 20, seed }).names.map((n) => n.name));
  assert.ok(names.some((n) => /^Ell-(One|Two|Three|Four|Five) Station$/.test(n)), "Ell-Five Station");
  assert.ok(names.some((n) => / Anchorage$/.test(n)), "an anchorage");
  assert.ok(names.some((n) => / Ring$/.test(n)), "a ring");
  assert.ok(names.some((n) => / Haven$/.test(n)), "a haven");
  for (const n of names) assert.ok(!/'s Star Haven$/.test(n), n);
  // Ell-Four and Ell-Five weigh 3 against 1.
  const ell = names.filter((n) => n.startsWith("Ell-"));
  const heavy = ell.filter((n) => /Four|Five/.test(n)).length;
  assert.ok(heavy > ell.length * 0.55, `${heavy}/${ell.length}`);
});

test("§11.2: stations name their walks, concourses and sectors by direction", () => {
  const names: string[] = [];
  for (let seed = 1; seed <= 200; seed++) names.push(...generateStreetNames({ culture: "general", era: "IS", people: "invented", count: 30, seed }).names.map((n) => n.text));
  for (const dir of ["Spinward", "Antispinward", "Hubward", "Rimward"]) assert.ok(names.some((n) => n.startsWith(`${dir} `)), dir);
  assert.ok(names.some((n) => / Concourse$/.test(n)));
  assert.ok(names.some((n) => n === "Hubward Lift"));
  assert.ok(names.some((n) => /^(Spinward|Antispinward|Hubward|Rimward) Sector$/.test(n)));
});

test("§11.3–§11.5: landmarks, sacred places and event names", () => {
  for (const w of ["Relay Mast", "Beacon", "Dock Ring", "Ice Works", "Refinery", "Shipyard", "Array", "Tether Head", "Ladder Foot"]) assert.ok(entries("sciFiLandmark").includes(w), w);
  for (const w of ["Comet", "Star", "Ring", "Wreck", "Beacon"]) {
    const e = SETTLEMENT_VOCAB.pools.sacredLand.entries.find((x) => x.w === w);
    assert.deepEqual(e?.e, ["NF", "IS"], w);
  }
  const fixed = (pool: string, w: string) => SETTLEMENT_VOCAB.pools[pool].entries.find((x) => x.w === w);
  assert.deepEqual(fixed("eventFixed:war", "Belt War")?.e, ["NF", "IS"]);
  assert.deepEqual(fixed("eventFixed:war", "Ring War")?.e, ["NF", "IS"]);
  assert.deepEqual(fixed("eventFixed:collapse", "Gate Fall")?.e, ["IS"]);
  assert.deepEqual(fixed("eventFixed:collapse", "Gate Fall")?.t, ["strange"]);
  assert.deepEqual(fixed("eventFixed:migration", "Great Crossing")?.e, ["IS"]);
  assert.ok(entries("spaceGoods").includes("Deuterium") && entries("spaceGoods").includes("Platinum") && entries("spaceGoods").includes("Nickel"));
});
