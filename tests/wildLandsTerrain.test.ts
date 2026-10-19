// Wild lands brief §16.2–§16.3: the terrain modules' behaviour.
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWildsNames, WILDS_DATA, WILDS_MODULES, type WildsEra, type WildsModule, type WildsName, type WildsOptions } from "../src/wilds/engine";

const many = (o: Partial<WildsOptions> & { module: WildsModule }, count = 2000, seed = 7): WildsName[] =>
  generateWildsNames({ people: "invented", count, seed, ...o }).names;
/** 2,000 names as ten batches of 200: a batch is unique, so a module with few shapes of one family can't fill 2,000 alone. */
const batches = (o: Partial<WildsOptions> & { module: WildsModule }): WildsName[] => Array.from({ length: 10 }, (_, i) => many(o, 200, 100 + i)).flat();
/** A name's text without its `{town}` part: the region words under test belong to the shape, not to a British place. */
const shapeText = (n: WildsName) => n.words.filter((w) => w.pool === "town").reduce((t, w) => t.replace(w.word, ""), n.text);
const has = (names: WildsName[], re: RegExp) => names.some((n) => re.test(shapeText(n)));
const shapeFamily = new Map<string, string>();
for (const [m, kinds] of Object.entries(WILDS_DATA.shapes)) for (const list of Object.values(kinds)) for (const s of list) shapeFamily.set(`${m}|${s.p}`, s.f);
const share = (names: WildsName[], module: WildsModule, family: string) => names.filter((n) => shapeFamily.get(`${module}|${n.shape}`) === family).length / names.length;

// ── Mountains (§16.2) ──────────────────────────────────────────────────────

test("mountains: NTH gives Fell, Pike, Beck and Force, and never Cwm, Ben, Lochan or Linn", () => {
  const names = many({ module: "mountainNames", culture: "norman-british", region: "NTH" });
  for (const w of ["Fell", "Pike", "Beck", "Force"]) assert.ok(has(names, new RegExp(`\\b${w}\\b`)), w);
  for (const w of ["Cwm", "Ben", "Lochan", "Linn"]) assert.ok(!has(names, new RegExp(`\\b${w}\\b`)), w);
});

test("mountains: SHH gives Ben, Corrie and Lochan, and never Tor, Fell or Hause", () => {
  const names = many({ module: "mountainNames", culture: "norman-british", region: "SHH" });
  for (const w of ["Ben", "Corrie", "Lochan"]) assert.ok(has(names, new RegExp(`\\b${w}\\b`)), w);
  for (const w of ["Tor", "Fell", "Hause"]) assert.ok(!has(names, new RegExp(`\\b${w}\\b`)), w);
});

test("mountains: WAL gives Cwm; WCY and COR give Tor and Combe", () => {
  assert.ok(has(many({ module: "mountainNames", culture: "norman-british", region: "WAL" }), /\bCwm\b/));
  for (const region of ["WCY", "COR"]) {
    const names = many({ module: "mountainNames", culture: "norman-british", region });
    assert.ok(has(names, /\bTor\b/) && has(names, /combe\b/i), region);
  }
});

test("mountains: British home country never draws glaciers; highland draws at least 3%", () => {
  assert.ok(!many({ module: "mountainNames", culture: "norman-british" }).some((n) => n.kind === "ice"));
  const ice = batches({ module: "mountainNames", culture: "general", biome: "highland" }).filter((n) => n.kind === "ice").length / 2000;
  assert.ok(ice >= 0.03, `ice ${ice}`);
});

test("mountains: the rainforest has no Ptarmigan, Ibex, Chamois or Snow Leopard", () => {
  const names = many({ module: "mountainNames", culture: "general", biome: "rainforest" });
  assert.ok(!has(names, /Ptarmigan|Ibex|Chamois|Snow Leopard/));
});

// ── Forests (§16.2) ────────────────────────────────────────────────────────

test("forests: walks are medieval to modern only", () => {
  for (const era of ["AN", "NF", "IS"] as WildsEra[]) assert.ok(!many({ module: "forestNames", culture: "general", era, count: 600 }).some((n) => n.kind === "walk"), era);
  assert.ok(many({ module: "forestNames", culture: "general", era: "MD", kind: "walk", count: 60 }).length > 0);
});

test("forests: SEA gives Hanger and -hurst; EAN gives Holt and Carr; SHH never gives Hanger", () => {
  const sea = many({ module: "forestNames", culture: "norman-british", region: "SEA" });
  assert.ok(has(sea, /\bHanger\b/) && has(sea, /hurst\b/));
  const ean = many({ module: "forestNames", culture: "norman-british", region: "EAN" });
  assert.ok(has(ean, /\bHolt\b|holt\b/) && has(ean, /\bCarr\b/));
  assert.ok(!has(many({ module: "forestNames", culture: "norman-british", region: "SHH" }), /\bHanger\b/));
});

test("forests: the boreal forest has no Teak, Mahogany, Tiger or Monkey", () => {
  assert.ok(!has(many({ module: "forestNames", culture: "general", biome: "boreal" }), /Teak|Mahogany|Tiger|Monkey/));
});

// ── Both (§16.2) ───────────────────────────────────────────────────────────

test("references: a {@kind} result is at most two words, never begins The and never holds 'of'", () => {
  let seen = 0;
  for (const module of WILDS_MODULES) {
    for (const n of many({ module, kind: "settlement", culture: "norman-british", count: 300 })) {
      for (const w of n.words.filter((x) => x.pool.startsWith("@"))) {
        seen++;
        assert.ok(w.word.split(" ").length <= 2, w.word);
        assert.ok(!/^The /.test(w.word) && !/\bof\b/i.test(w.word), w.word);
      }
    }
  }
  assert.ok(seen > 200, `${seen} references`);
});

test("explorer's mood: at least 4% in new country (early modern, any land), under 1.5% at home, in every module", () => {
  for (const module of WILDS_MODULES) {
    const fresh = share(batches({ module, culture: "general", era: "EM", where: "new" }), module, "mood");
    const home = share(batches({ module, culture: "general", era: "EM", where: "home" }), module, "mood");
    assert.ok(fresh >= 0.04, `${module} new ${fresh}`);
    assert.ok(home < 0.015, `${module} home ${home}`);
  }
});
