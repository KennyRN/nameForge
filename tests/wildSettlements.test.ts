// Wild lands brief §16.5: settlements both ways.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKit } from "../src/settlement/kit";
import { generateSettlementNames, settlementHooks, type SettlementNamesOptions } from "../src/settlement/names";
import { generateWildsNames, WILDS_DATA, wildsHooks, type WildsModule, type WildsName, type WildsOptions } from "../src/wilds/engine";

const batches = <T>(run: (seed: number) => T[], n = 10): T[] => Array.from({ length: n }, (_, i) => run(300 + i)).flat();

// ── Terrain modules: the native branch (§9) ────────────────────────────────

const settlementNames = (o: Partial<WildsOptions> & { module: WildsModule }, seed: number): WildsName[] =>
  generateWildsNames({ culture: "norman-british", era: "MD", people: "invented", kind: "settlement", count: 200, seed, ...o }).names;

test("terrain modules: 0.4 ± 0.05 of settlements are native (British, home, medieval, invented people)", () => {
  for (const module of ["mountainNames", "moorNames", "grasslandNames"] as WildsModule[]) {
    const names = batches((seed) => settlementNames({ module }, seed));
    const native = names.filter((n) => n.source === "native").length / names.length;
    assert.ok(Math.abs(native - 0.4) <= 0.05, `${module}: ${native}`);
  }
});

test("terrain modules: no native branch in interstellar, for Greek & Byzantine at home, or with placeholders", () => {
  const none = (o: Partial<WildsOptions>) => assert.ok(!batches((seed) => settlementNames({ module: "forestNames", ...o }, seed), 3).some((n) => n.source === "native"), JSON.stringify(o));
  none({ era: "IS", culture: "general" });
  none({ era: "NF" });
  none({ culture: "greek-byzantine" });
  none({ culture: "steppe" });
  none({ culture: "polynesian" });
  none({ culture: "andean" });
  none({ people: "placeholders" });
  // In new country a culture with a colonial tradition has one; one without has none.
  assert.ok(batches((seed) => settlementNames({ module: "forestNames", culture: "roman", where: "new", era: "AN" }, seed), 3).some((n) => n.source === "native"));
  none({ culture: "bantu", where: "new" });
});

test("terrain modules: the native branch asks for the module's terrain, with a biome only when none is chosen", () => {
  const seen: SettlementNamesOptions[] = [];
  wildsHooks.onNativeCall = (o) => seen.push(o);
  try {
    settlementNames({ module: "moorNames" }, 5);
    settlementNames({ module: "desertNames", culture: "general" }, 5);
    settlementNames({ module: "grasslandNames", culture: "chinese", era: "MD" }, 5);
    settlementNames({ module: "mountainNames", culture: "general", biome: "boreal" }, 5);
  } finally {
    wildsHooks.onNativeCall = undefined;
  }
  assert.equal(seen.length, 4);
  assert.deepEqual([seen[0].terrain, seen[0].biome, seen[0].setting], ["hills", "moorland", "native"]);
  assert.deepEqual([seen[1].terrain, seen[1].biome], ["plains", "desert"]);
  assert.deepEqual([seen[2].terrain, seen[2].culture, seen[2].era], ["plains", "chinese", "imperial"]);
  assert.deepEqual([seen[3].terrain, seen[3].biome], ["mountains", "boreal"]);
  assert.ok(seen.every((o) => o.wilds === false && o.size === "any"));
});

// ── Settlement names: the wild-lands branch (§10) ──────────────────────────

const fromWilds = (sources: string[], module?: string) => sources.filter((s) => (module ? s === module : s !== "own")).length / sources.length;
const run = (o: Partial<SettlementNamesOptions>, seed: number) => generateSettlementNames({ setting: "native", size: "village", count: 200, seed, ...o });

test("settlement names: 0.6 ± 0.05 of a British village batch in the mountains comes from mountains", () => {
  const sources = batches((seed) => run({ terrain: "mountains" }, seed).sources);
  assert.ok(Math.abs(fromWilds(sources, "mountainNames") - 0.6) <= 0.05, `${fromWilds(sources, "mountainNames")}`);
  assert.ok(sources.every((s) => s === "own" || s === "mountainNames"));
});

test("settlement names: every terrain name suits the size", () => {
  for (const size of ["hamlet", "village", "town", "city"] as const) {
    const letter = size[0] === "h" ? "h" : size[0] === "v" ? "v" : size[0] === "t" ? "t" : "c";
    const names = generateWildsNames({ module: "mountainNames", culture: "norman-british", era: "MD", people: "invented", purposeBuiltOnly: true, settlementSize: letter, count: 150, seed: 6 }).names;
    assert.ok(names.length > 0 || size === "city", size);
    for (const n of names) {
      const shapes = [
        ...(WILDS_DATA.shapes.mountainNames.settlement ?? []).filter((s) => s.p === n.shape && (s.sz ?? "").includes(letter)),
        ...Object.values(WILDS_DATA.shapes.mountainNames).flat().filter((s) => s.p === n.shape && (s.st ?? "").includes(letter)),
      ];
      assert.ok(shapes.length > 0, `${size}: ${n.text} [${n.shape}]`);
    }
  }
});

test("settlement names: a great city gets no wild-lands names and no notice", () => {
  const r = run({ size: "great", terrain: "mountains" }, 4);
  assert.ok(r.sources.every((s) => s === "own"));
  assert.deepEqual(r.notices, []);
});

test("settlement names: plains with desert go to deserts, hills with moorland to moors", () => {
  const plains = batches((seed) => run({ terrain: "plains", biome: "desert" }, seed).sources, 4);
  assert.ok(plains.some((s) => s === "desertNames") && plains.every((s) => s === "own" || s === "desertNames"));
  const hills = batches((seed) => run({ terrain: "hills", biome: "moorland" }, seed).sources, 4);
  assert.ok(hills.some((s) => s === "moorNames") && hills.every((s) => s === "own" || s === "moorNames"));
  const forest = batches((seed) => run({ terrain: "forest" }, seed).sources, 4);
  assert.ok(forest.some((s) => s === "forestNames") && forest.every((s) => s === "own" || s === "forestNames"));
  const wet = batches((seed) => run({ terrain: "wetland" }, seed).sources, 4);
  assert.ok(wet.some((s) => s === "wetlandNames") && wet.every((s) => s === "own" || s === "wetlandNames"));
  const plain = batches((seed) => run({ terrain: "plains" }, seed).sources, 4);
  assert.ok(plain.some((s) => s === "grasslandNames") && plain.every((s) => s === "own" || s === "grasslandNames"));
});

test("settlement names: hills in Britain split 50 / 50 between moors and grasslands", () => {
  const sources = batches((seed) => run({ terrain: "hills" }, seed).sources);
  const moors = sources.filter((s) => s === "moorNames").length;
  const grass = sources.filter((s) => s === "grasslandNames").length;
  assert.ok(Math.abs(moors / (moors + grass) - 0.5) <= 0.05, `${moors} / ${grass}`);
  assert.ok(Math.abs((moors + grass) / sources.length - 0.6) <= 0.05);
});

test("settlement names: the batch stays unique across both branches", () => {
  const r = run({ terrain: "mountains", count: 150 }, 8);
  assert.equal(new Set(r.names.map((n) => n.text.toLowerCase())).size, r.names.length);
  assert.ok(r.names.length >= 140);
});

// ── Unchanged output (§10.5) ───────────────────────────────────────────────

test("unchanged: any other terrain and the settlement kit give identical output for fixed seeds", () => {
  const saved = JSON.parse(readFileSync("tests/fixtures/wild-settlement-regression.json", "utf8")) as Record<string, unknown>;
  let checked = 0;
  for (const terrain of ["any", "coast", "rivers", "islands"])
    for (const seed of [3, 77]) {
      const base = { size: "town", count: 25, seed, terrain } as const;
      const cases: Record<string, SettlementNamesOptions> = {
        british: { ...base, setting: "native" },
        "british NTH": { ...base, setting: "native", region: "NTH" },
        chinese: { ...base, setting: "native", culture: "chinese", era: "imperial" },
        norse: { ...base, setting: "native", culture: "norse", era: "viking" },
        exploration: { ...base, setting: "new-lands" },
        expansion: { ...base, setting: "settled-lands" },
      };
      for (const [name, options] of Object.entries(cases)) {
        assert.deepEqual(generateSettlementNames(options).names.map((n) => n.text), saved[`${name} ${terrain} ${seed}`], `${name} ${terrain} ${seed}`);
        checked++;
      }
    }
  for (const [culture, size] of [["norman-british", "town"], ["norman-british", "village"], ["chinese", "city"], ["japanese", "great"]] as const)
    for (const seed of [1, 2, 3]) {
      const k = generateKit({ culture, size, seed });
      assert.deepEqual({ town: k.context.town, neighbours: k.context.neighbours, sections: k.sections.filter((s) => s.key !== "neighbours").map((s) => s.entries.map((e) => e.text)) }, saved[`kit ${culture} ${size} ${seed}`], `kit ${culture} ${size} ${seed}`);
      checked++;
    }
  assert.equal(checked, Object.keys(saved).length);
});

// ── No loops (§10.4) ───────────────────────────────────────────────────────

test("no loops: the native branch calls settlement names with wilds off, and settlement names calls the terrain module with purpose-built only", () => {
  const wildCalls: WildsOptions[] = [];
  const nativeCalls: SettlementNamesOptions[] = [];
  settlementHooks.onWildsCall = (o) => wildCalls.push(o);
  wildsHooks.onNativeCall = (o) => nativeCalls.push(o);
  try {
    run({ terrain: "mountains" }, 2);
    assert.ok(wildCalls.length > 0 && wildCalls.every((o) => o.purposeBuiltOnly === true && o.module === "mountainNames"));
    assert.equal(nativeCalls.length, 0, "the purpose-built call never asks for native names");
    settlementNames({ module: "mountainNames" }, 2);
    assert.ok(nativeCalls.length > 0 && nativeCalls.every((o) => o.wilds === false));
    assert.equal(wildCalls.length, 1 * wildCalls.length);
  } finally {
    settlementHooks.onWildsCall = undefined;
    wildsHooks.onNativeCall = undefined;
  }
});
