// Stellar brief §15.4: route names by scale, faster-than-light travel, space networks and the safeguards.
import test from "node:test";
import assert from "node:assert/strict";
import { generateGroupNames } from "../src/groups/engine";
import { generateRouteNames, kindsOffered, ROUTE_DATA, showsFtl, showsScale, type RouteOptions } from "../src/routes/engine";
import { chooseRoute, DEFAULT_ROUTE_STATE, routeHistoryLabel, routeSentence, routeSentenceText } from "../src/routes/sentence";

/** One name per seed, so uniqueness never skews a share. */
function draws(o: Omit<RouteOptions, "count" | "seed">, n: number, from = 1) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(...generateRouteNames({ ...o, count: 1, seed: from + i }).names);
  return out;
}

const shapesWithFtl = new Set(ROUTE_DATA.shapes.space.filter((s) => s.ftl).map((s) => s.p));

test("§6.3: the interstellar kind menu offers motor, rail, trade and sea again", () => {
  const keys = kindsOffered("IS", false).map((k) => k.key);
  for (const k of ["trade", "sea", "rail", "motor", "space"]) assert.ok(keys.includes(k), k);
  assert.ok(!keys.includes("road"));
  assert.deepEqual(kindsOffered("NF", false).map((k) => k.key).sort(), ["motor", "rail", "road", "sea", "space", "trade"]);
});

test("§6.3: at star-system scale only space lanes are drawn; at planetary scale the shares match the table", () => {
  for (const scale of ["Sy", "Nb", "Se", "Ga"] as const) {
    for (const n of draws({ culture: "general", era: "IS", scale }, 400)) assert.equal(n.kind, "space", `${scale}: ${n.text}`);
  }
  const names = draws({ culture: "general", era: "IS", scale: "Pl" }, 4000);
  const share = (k: string) => (names.filter((n) => n.kind === k).length / names.length) * 100;
  const table: Record<string, number> = { space: 50, motor: 25, rail: 15, trade: 5, sea: 5 };
  for (const [k, expected] of Object.entries(table)) assert.ok(Math.abs(share(k) - expected) <= 3, `${k}: ${share(k).toFixed(1)}`);
});

test("§6.3: any scale draws a scale per name at the era's weights", () => {
  const names = draws({ culture: "general", era: "IS", kind: "space" }, 4000);
  const share = (s: string) => (names.filter((n) => n.scale === s).length / names.length) * 100;
  const expected: Record<string, number> = { Pl: 20, Sy: 25, Nb: 20, Se: 20, Ga: 15 };
  for (const [s, e] of Object.entries(expected)) assert.ok(Math.abs(share(s) - e) <= 3, `${s}: ${share(s).toFixed(1)}`);
  const nf = draws({ culture: "general", era: "NF", kind: "space" }, 600);
  assert.deepEqual([...new Set(nf.map((n) => n.scale))].sort(), ["Pl", "Sy"]);
});

test("§6.1: another kind in the future eras is drawn at planetary scale, and the scale link hides", () => {
  assert.ok(showsScale("IS", undefined) && showsScale("NF", "space") && !showsScale("IS", "motor") && !showsScale("MO", undefined));
  for (const n of draws({ culture: "general", era: "IS", kind: "motor", scale: "Ga" }, 100)) assert.equal(n.scale, "Pl");
});

test("§6.2: FTL none removes every FTL shape; gate keeps only gates; none appears at Pl or Sy", () => {
  const none = draws({ culture: "general", era: "IS", kind: "space", ftl: "none" }, 3000);
  for (const n of none) assert.ok(!shapesWithFtl.has(n.shape), n.text);
  const gate = draws({ culture: "general", era: "IS", kind: "space", ftl: "gate" }, 3000);
  for (const n of gate) assert.ok(!shapesWithFtl.has(n.shape) || n.shape === "Gate Chain {greek}", n.text);
  assert.ok(gate.some((n) => n.shape === "Gate Chain {greek}"));
  for (const scale of ["Pl", "Sy"] as const) {
    for (const n of draws({ culture: "general", era: "IS", kind: "space", scale }, 1500)) assert.ok(!shapesWithFtl.has(n.shape), `${scale}: ${n.text}`);
  }
  assert.ok(showsFtl("IS", undefined, "any") && !showsFtl("IS", undefined, "Sy") && !showsFtl("NF", undefined, "any") && !showsFtl("IS", "motor", "any"));
});

test("§6.5: the borrowed share is 25% at Pl and Sy and 10% at the larger scales", () => {
  const expected: Record<string, number> = { Pl: 25, Sy: 25, Nb: 10, Se: 10, Ga: 10 };
  for (const [scale, e] of Object.entries(expected)) {
    const names = draws({ culture: "norman-british", era: "IS", kind: "space", scale: scale as "Pl" }, 3000);
    const share = (names.filter((n) => n.borrowed).length / names.length) * 100;
    assert.ok(Math.abs(share - e) <= 3, `${scale}: ${share.toFixed(1)}`);
  }
});

test("§6.6: a possessive star drops the word Star; {star}–{star} never repeats", () => {
  const runs = draws({ culture: "general", era: "IS", kind: "space", scale: "Nb", people: "invented" }, 3000);
  for (const n of runs) {
    if (n.shape === "{star} Run" || n.shape === "{star} Road") assert.ok(!/'s Star (Run|Road)$/.test(n.text), n.text);
    const lane = /^(.+)–(.+) Lane$/.exec(n.text);
    if (lane && n.shape === "{star}–{star} Lane") assert.notEqual(lane[1], lane[2], n.text);
  }
  assert.ok(runs.some((n) => (n.shape === "{star} Run" || n.shape === "{star} Road") && /'s (Run|Road)$/.test(n.text)), "a possessive run exists");
});

test("§6.7: networks - directions turn, gate chains count, cycles close", () => {
  // A direction network follows the scale's compass order.
  const dir = generateRouteNames({ culture: "general", era: "IS", kind: "space", scale: "Sy", series: true, shape: "{spaceDirection} Run", count: 5, seed: 8 }).names;
  assert.equal(dir.length, 5);
  const order = ["Sunward", "Upwell", "Outward", "Downwell", "Inward"];
  const at = dir.map((n) => order.indexOf(n.text.replace(" Run", "")));
  assert.ok(at.every((i) => i >= 0), dir.map((n) => n.text).join());
  assert.deepEqual(at, [...at].sort((a, b) => a - b));
  // A gate chain: the chain, then its gates in order.
  const chain = generateRouteNames({ culture: "general", era: "IS", kind: "space", scale: "Ga", series: true, shape: "Gate Chain {greek}", count: 4, seed: 5 }).names;
  const greek = chain[0].text.replace("Gate Chain ", "");
  assert.deepEqual(chain.slice(1).map((n) => n.text), [`${greek} Gate One`, `${greek} Gate Two`, `${greek} Gate Three`]);
  // A cycle: legs chain end to start.
  const cycle = generateRouteNames({ culture: "general", era: "IS", kind: "space", scale: "Sy", series: true, shape: "{spaceGoods} Cycle", count: 6, seed: 9 }).names;
  assert.match(cycle[0].text, / Cycle$/);
  const legs = cycle.slice(1).map((n) => /^(.+)–(.+) Cycle$/.exec(n.text)!);
  assert.equal(legs.length, 5);
  for (let i = 0; i < legs.length - 1; i++) assert.equal(legs[i][2], legs[i + 1][1]);
  assert.equal(legs[legs.length - 1][2], legs[0][1]);
});

test("§10: franchise phrases never appear in 20,000 routes and groups", () => {
  const blocked = /\b(Outer Rim|Mid Rim|Inner Rim|Core Worlds|Deep Core|Wild Space|Unknown Regions|Kessel Run|Spinward Marches|Trailing Marches|Terminus|The Expanse|Mass Relay|Halo Array)\b/i;
  const names: string[] = [];
  for (let i = 0; i < 40; i++) {
    for (const era of ["NF", "IS"] as const) names.push(...generateRouteNames({ culture: "general", era, count: 100, seed: i * 7 + 1, people: "invented" }).names.map((n) => n.text));
  }
  for (const family of ["mystic", "martial", "trade", "adventure", "power"]) {
    for (let i = 0; i < 20; i++) names.push(...generateGroupNames({ family, genre: "scifi", count: 100, seed: i + 3, people: "invented" }).names.map((n) => n.text));
  }
  assert.ok(names.length >= 10000, `${names.length}`);
  for (const n of names) assert.ok(!blocked.test(n), n);
});

test("§6.1, §6.2: the sentence shows the scale and FTL links where they apply", () => {
  const is = { ...DEFAULT_ROUTE_STATE, culture: "general", era: "IS" as const };
  const text = routeSentenceText(routeSentence(is));
  assert.match(text, /across any scale of the interstellar era/);
  assert.match(text, /with any faster-than-light travel/);
  const sy = chooseRoute(is, "scale", "Sy");
  assert.match(routeSentenceText(routeSentence(sy)), /across a star system of the interstellar era/);
  assert.ok(!/faster-than-light/.test(routeSentenceText(routeSentence(sy))));
  const motor = chooseRoute(is, "kind", "motor");
  assert.ok(!/across/.test(routeSentenceText(routeSentence(motor))));
  // Leaving the interstellar era resets FTL.
  assert.equal(chooseRoute(chooseRoute(is, "ftl", "gate"), "era", "NF").ftl, "any");
  // A scale the near future lacks resets to any.
  assert.equal(chooseRoute(chooseRoute(is, "scale", "Ga"), "era", "NF").scale, "any");
  assert.ok(routeHistoryLabel(chooseRoute(chooseRoute(is, "scale", "Sy"), "series", "on")).endsWith("star system"));
});
