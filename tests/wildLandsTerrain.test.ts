// Wild lands brief §16.2–§16.3: the terrain modules' behaviour.
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWildsNames, showsWildsRegion, WILDS_CULTURES, WILDS_DATA, WILDS_MODULES, type WildsEra, type WildsModule, type WildsName, type WildsOptions } from "../src/wilds/engine";

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

// ── Deserts (§16.3) ────────────────────────────────────────────────────────

test("deserts: no region link, and a British culture is weighted by biome not region", () => {
  assert.equal(showsWildsRegion("desertNames", "norman-british", "home"), false);
  // Region NTH changes nothing in deserts: the same seed gives the same batch.
  const a = many({ module: "desertNames", culture: "norman-british", count: 100 }).map((n) => n.text);
  const b = many({ module: "desertNames", culture: "norman-british", region: "NTH", count: 100 }).map((n) => n.text);
  assert.deepEqual(a, b);
});

test("deserts: Mesa, Butte and Canyon wait for the steam age; Wadi belongs to four cultures", () => {
  for (const era of ["AN", "MD", "EM"] as WildsEra[]) assert.ok(!has(many({ module: "desertNames", culture: "general", era, count: 1000 }), /\b(Mesa|Butte|Canyon)\b/), era);
  assert.ok(has(many({ module: "desertNames", culture: "general", era: "ST" }), /\b(Mesa|Butte|Canyon)\b/));
  const wadi = new Set(["arabic-persian", "egyptian", "ethiopian", "west-african"]);
  for (const culture of WILDS_CULTURES) {
    const found = has(many({ module: "desertNames", culture: culture.key, count: 1500 }), /\bWadi\b/);
    if (wadi.has(culture.key)) assert.ok(found, `${culture.key} should have Wadi`);
    else assert.ok(!found, `${culture.key} shouldn't have Wadi`);
  }
});

// ── Moors and heaths (§16.3) ───────────────────────────────────────────────

test("moors: WCY gives Tor, Cleave and Combe; SHH gives Flow; NTH gives Rigg, Howe and Beck; COR never gives Muir", () => {
  const wcy = many({ module: "moorNames", culture: "norman-british", region: "WCY" });
  for (const w of ["Tor", "Cleave", "[Cc]ombe"]) assert.ok(has(wcy, new RegExp(`\\b${w}\\b|${w}\\b`)), w);
  assert.ok(has(many({ module: "moorNames", culture: "norman-british", region: "SHH" }), /\bFlow\b/));
  const nth = many({ module: "moorNames", culture: "norman-british", region: "NTH" });
  for (const w of ["Rigg", "Howe", "Beck"]) assert.ok(has(nth, new RegExp(`\\b${w}\\b|${w.toLowerCase()}\\b`)), w);
  assert.ok(!has(many({ module: "moorNames", culture: "norman-british", region: "COR" }), /\bMuir\b/));
});

// ── Wetlands (§16.3) ───────────────────────────────────────────────────────

test("wetlands: EAN gives Fen, Lode, Broad and Carr; WCY gives Rhyne and Levels", () => {
  const ean = many({ module: "wetlandNames", culture: "norman-british", region: "EAN" });
  for (const w of ["Fen", "Lode", "Broad", "Carr"]) assert.ok(has(ean, new RegExp(`\\b${w}\\b`)), w);
  const wcy = many({ module: "wetlandNames", culture: "norman-british", region: "WCY" });
  for (const w of ["Rhyne", "Levels"]) assert.ok(has(wcy, new RegExp(`\\b${w}\\b`)), w);
});

test("wetlands: the monsoon is at least 10% swamps; the boreal has no Mangroves or Bayou", () => {
  const swamps = batches({ module: "wetlandNames", culture: "general", biome: "monsoon" }).filter((n) => n.kind === "swamp").length / 2000;
  assert.ok(swamps >= 0.1, `swamps ${swamps}`);
  assert.ok(!has(many({ module: "wetlandNames", culture: "general", biome: "boreal" }), /Mangrove|Bayou/));
});

// ── Grasslands (§16.3) ─────────────────────────────────────────────────────

test("grasslands: SEA gives Down and Bourne; EMD Wold; SBL Haugh; SLO Carse", () => {
  const sea = many({ module: "grasslandNames", culture: "norman-british", region: "SEA" });
  assert.ok(has(sea, /\bDowns?\b/) && has(sea, /bourne\b|\bBourne\b/));
  assert.ok(has(many({ module: "grasslandNames", culture: "norman-british", region: "EMD" }), /\bWolds?\b|wold\b/));
  assert.ok(has(many({ module: "grasslandNames", culture: "norman-british", region: "SBL" }), /\bHaugh\b/));
  assert.ok(has(many({ module: "grasslandNames", culture: "norman-british", region: "SLO" }), /\bCarse\b/));
});

test("grasslands: the steppe gives Steppe, Camp or Wild Horse; the temperate never gives Zebra, Baobab or Waterhole", () => {
  assert.ok(has(many({ module: "grasslandNames", culture: "general", biome: "steppe" }), /Steppe|Camp|Wild Horse/));
  assert.ok(!has(many({ module: "grasslandNames", culture: "general", biome: "temperate" }), /Zebra|Baobab|Waterhole/));
});

// ── All six (§16.3) ────────────────────────────────────────────────────────

test("all: with fantastic off, no fantastic-only shape or word appears in any era", () => {
  const fantastic = new Set<string>();
  for (const [m, kinds] of Object.entries(WILDS_DATA.shapes)) for (const [kind, list] of Object.entries(kinds)) for (const s of list) if (s.h === true) fantastic.add(`${m}|${kind}|${s.p}`);
  assert.ok(fantastic.size > 20);
  for (const module of WILDS_MODULES)
    for (const era of WILDS_DATA.modules[module].eras) {
      const names = many({ module, culture: "general", era, fantastic: false, count: 400 });
      for (const n of names) {
        assert.ok(!fantastic.has(`${module}|${n.kind}|${n.shape}`), `${module} ${era}: ${n.text}`);
        assert.ok(!n.words.some((w) => w.pool === "mythBeast" || w.pool === "mythFuse"), `${module} ${era}: ${n.text}`);
      }
    }
  // And with it on, they do.
  assert.ok(WILDS_MODULES.every((m) => many({ module: m, culture: "general", era: "MD", fantastic: true, count: 600 }).some((n) => fantastic.has(`${m}|${n.kind}|${n.shape}`))));
});

test("all: alien shapes make up at least 4% of interstellar names, and never appear from the ancient age to the modern", () => {
  for (const module of WILDS_MODULES) {
    const is = share(batches({ module, culture: "general", era: "IS" }), module, "alien");
    assert.ok(is >= 0.04, `${module} IS ${is}`);
    for (const era of ["AN", "MD", "EM", "ST", "MO"] as WildsEra[]) assert.equal(share(many({ module, culture: "general", era, count: 500 }), module, "alien"), 0, `${module} ${era}`);
  }
});
