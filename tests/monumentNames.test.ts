// Monuments and statues (docs/monuments-and-statues-brief.md §15).
import { test } from "node:test";
import assert from "node:assert/strict";
import { SETTLEMENT_VOCAB, VOCAB_CULTURE_GROUPS, VOCAB_REGIONS, inCultureGroup } from "../src/settlement/vocab";
import { unmarkedTownPatterns } from "../src/settlement/contextShared";
import {
  MONUMENT_DATA,
  MONUMENT_KINDS,
  breaksMonumentWords,
  defaultMonumentSafeguards,
  generateMonumentNames,
  monumentBlockSet,
  monumentHonourees,
  monumentKindWeights,
  monumentKindsOffered,
  monumentName,
  monumentUses,
  type MonumentKind,
  type MonumentName,
  type MonumentOptions,
} from "../src/monuments/engine";
import { STREET_DATA, breaksStreetWords, monumentNeighbours, streetBlockSet } from "../src/streets/engine";
import { ROUTE_CULTURES, ROUTE_ERAS, routeNorm, type RouteEra } from "../src/routes/engine";
import { mulberry32 } from "../src/markov";
import monumentData from "../src/data/monument-names.json";

/** Names from small batches (each batch holds a word once, so big batches skew shares). */
function many(o: Omit<MonumentOptions, "count" | "seed">, n: number, size = 10): MonumentName[] {
  const out: MonumentName[] = [];
  for (let seed = 1; out.length < n && seed < n * 4; seed++) out.push(...generateMonumentNames({ ...o, count: size, seed }).names);
  return out.slice(0, n);
}

const bare = (text: string) => routeNorm(text).replace(/^the /, "");
const ERAS = ROUTE_ERAS.map((e) => e.code);
const CULTURE_KEYS = ROUTE_CULTURES.map((c) => c.key);

// ── §15.1 Vocabulary ────────────────────────────────────────────────────────

const KIND_KEYS = MONUMENT_KINDS.map((k) => k.key);
const WORD_KINDS = KIND_KEYS.filter((k) => k !== "figure");
const FIXED_KINDS: MonumentKind[] = ["cross", "column", "statue", "stone", "folly", "figure"];
const NEW_POOLS = [
  ...WORD_KINDS.map((k) => `monumentWord:${k}`),
  ...FIXED_KINDS.map((k) => `monumentFixed:${k}`),
  "monumentQual", "monumentEvent", "monumentFallen", "monumentVirtue", "statueMaterial", "stoneFolk", "figureColour", "figureBeast",
  "junctionWord", "steampunkMonument", "sfMonumentWord", "sfRelic", "follyOwner",
];

/** Every shape in the data, with where it sits. */
function allShapes() {
  const d = MONUMENT_DATA;
  return [
    ...d.shared,
    ...Object.values(d.kindShapes).flat(),
    ...Object.values(d.cultureShapes).flat(),
    ...d.eraShapes,
    ...d.scifi.shapes,
  ];
}

/** The tokens the engine reads itself; every other token names a pool. */
const SPECIAL_TOKENS = new Set([
  "mw", "fixed", "town", "founder", "owner", "patron", "surname", "dynasty", "holy", "deity", "figure", "god", "creature", "colour",
  "number", "quality", "brandRoot", "star", "greek", "ordinalWord", "ordinal", "trade", "goods", "weekday", "discovery", "headland", "n",
  "monarch", "hero", "benefactor", "battle", "bird", "sfmw", "event", "fallen", "virtue", "material", "stoneFolk", "figureColour", "figureBeast",
]);

test("§15.1: every pool and token in §4–§7 exists; every c names a route culture or group; every e, kind and region is real", () => {
  for (const p of NEW_POOLS) assert.ok(SETTLEMENT_VOCAB.pools[p], p);
  for (const k of WORD_KINDS) assert.ok(SETTLEMENT_VOCAB.pools[`monumentWord:${k}`].entries.length > 0, k);
  const groups = new Set([...VOCAB_CULTURE_GROUPS, ...CULTURE_KEYS]);
  for (const s of allShapes()) {
    for (const m of (s.p + (s.s ?? "")).matchAll(/\{([^}:]+)[}:]/g)) {
      assert.ok(SPECIAL_TOKENS.has(m[1]) || SETTLEMENT_VOCAB.pools[m[1]], `${s.p}: {${m[1]}}`);
    }
    for (const c of s.c ?? []) assert.ok(groups.has(c.replace(/^!/, "")), `${s.p}: ${c}`);
    for (const e of s.e ?? []) assert.ok(ERAS.includes(e), `${s.p}: ${e}`);
    for (const k of [...(s.kinds ?? []), ...(s.kind ? [s.kind] : [])]) assert.ok(KIND_KEYS.includes(k), `${s.p}: ${k}`);
  }
  // Every culture shape is of a real culture; the site patterns use tokens the shape itself has.
  for (const c of Object.keys(MONUMENT_DATA.cultureShapes)) assert.ok(CULTURE_KEYS.includes(c), c);
  for (const s of allShapes().filter((x) => x.s)) for (const m of s.s!.matchAll(/\{([^}]+)\}/g)) assert.ok(s.p.includes(`{${m[1]}`), `${s.p}: site {${m[1]}}`);
  for (const [kind, byRegion] of Object.entries(MONUMENT_DATA.regionX)) for (const r of Object.keys(byRegion!)) assert.ok(VOCAB_REGIONS.includes(r), `${kind}: ${r}`);
  // Settlement kit §4: every {town} pattern says whether it is the settlement or a neighbour.
  assert.deepEqual(unmarkedTownPatterns(monumentData), []);
});

test("§15.1: the {fixed} pools hold no blocked real name (the Hermitage is buildings' block-listed whole name, so it is never drawn)", () => {
  const block = monumentBlockSet({ block: MONUMENT_DATA.safeguards.block, flag: [], flagListBlocks: false });
  for (const k of FIXED_KINDS) for (const e of SETTLEMENT_VOCAB.pools[`monumentFixed:${k}`].entries) assert.ok(!block.has(bare(e.w)), e.w);
  const all = monumentBlockSet();
  for (const n of many({ culture: "norman-british", era: "EM", kind: "folly", people: "invented" }, 200)) assert.ok(!all.has(bare(n.text)), n.text);
});

test("§15.1: the kind line-up and era weights are the brief's", () => {
  const table: Record<string, number[]> = {
    cross: [0, 15, 12, 6, 3, 1, 1], column: [8, 4, 8, 15, 10, 6, 6], obelisk: [6, 1, 4, 12, 8, 4, 4], arch: [8, 3, 6, 12, 8, 5, 5],
    statue: [10, 4, 8, 20, 18, 10, 10], stone: [20, 10, 4, 3, 1, 2, 2], tomb: [15, 8, 6, 6, 3, 2, 2], memorial: [2, 3, 6, 15, 20, 12, 12],
    folly: [0, 0, 12, 10, 2, 0, 0], figure: [6, 4, 3, 4, 1, 0, 0],
  };
  assert.deepEqual(KIND_KEYS, Object.keys(table));
  for (const k of MONUMENT_KINDS) assert.deepEqual(ERAS.map((e) => k.era[e]), table[k.key], k.key);
  assert.equal(monumentKindsOffered("AN").some((k) => k.key === "cross"), false);
});

// ── §15.2 Coverage and determinism ──────────────────────────────────────────

test("§15.2: each kind gives names in each era it's offered; the same seed gives the same names", () => {
  for (const era of ERAS) {
    for (const k of monumentKindsOffered(era)) {
      // Norman & British is a christian British culture, so it serves crosses, follies and hill figures too.
      for (const people of ["placeholders", "invented"] as const) {
        const b = generateMonumentNames({ culture: "norman-british", era, kind: k.key, people, count: 10, seed: 3 });
        assert.ok(b.names.length >= 5, `${era} ${k.key} ${people}: ${b.names.length}`);
        for (const n of b.names) assert.equal(n.kind, k.key);
        assert.equal(new Set(b.names.map((n) => n.text.toLowerCase())).size, b.names.length);
      }
    }
  }
  for (const o of [{ culture: "norman-british" }, { culture: "japanese", people: "invented" as const }, { culture: "general", era: "ST" as RouteEra, series: true, nearby: true }]) {
    assert.deepEqual(generateMonumentNames({ ...o, count: 20, seed: 42 }), generateMonumentNames({ ...o, count: 20, seed: 42 }));
  }
  // What's named after them never changes the names themselves.
  const plain = generateMonumentNames({ culture: "norman-british", era: "ST", people: "invented", count: 12, seed: 9 }).names.map((n) => n.text);
  const near = generateMonumentNames({ culture: "norman-british", era: "ST", people: "invented", nearby: true, count: 12, seed: 9 }).names.map((n) => n.text);
  assert.deepEqual(near, plain);
});

test("§15.2: every name is within the cap, and General gives follies and hill figures", () => {
  for (const c of ["general", "norman-british", "chinese", "norse", "egyptian"]) {
    for (const n of many({ culture: c, era: "EM", people: "invented" }, 200)) {
      assert.ok(n.text.split(" ").filter((w) => !["of", "the", "and"].includes(w)).length <= MONUMENT_DATA.cap, n.text);
    }
  }
  for (const k of ["folly", "figure"] as const) {
    const era: RouteEra = k === "folly" ? "EM" : "MD";
    assert.ok(many({ culture: "general", era, kind: k, people: "invented" }, 30).length >= 20, k);
  }
});

// ── §15.3 Kinds, settings, regions ──────────────────────────────────────────

test("§15.3: in a town no hill figure is drawn; by the road crosses and stones rise; WCY raises figures over SLO", () => {
  for (const era of ["AN", "MD", "EM", "ST"] as RouteEra[]) {
    assert.ok(!monumentKindWeights({ culture: "norman-british", era, setting: "town" }).some(([k]) => k === "figure"), era);
    assert.ok(!many({ culture: "norman-british", era, setting: "town", people: "invented" }, 300).some((n) => n.kind === "figure"), era);
    const share = (setting: "anywhere" | "road", kinds: MonumentKind[]) => {
      const w = monumentKindWeights({ culture: "norman-british", era, setting });
      return w.filter(([k]) => kinds.includes(k)).reduce((n, [, x]) => n + x, 0) / w.reduce((n, [, x]) => n + x, 0);
    };
    assert.ok(share("road", ["cross", "stone"]) > share("anywhere", ["cross", "stone"]), era);
  }
  const weight = (region: string, kind: MonumentKind) => monumentKindWeights({ culture: "norman-british", era: "MD", region }).find(([k]) => k === kind)?.[1] ?? 0;
  assert.ok(weight("WCY", "figure") > weight("SLO", "figure") * 10);
  assert.equal(weight("WCY", "figure") / weight("NTH", "figure"), 3 / 0.5);
  assert.equal(weight("COR", "stone") / weight("EAN", "stone"), 3 / 0.5);
  // A region only matters to the British cultures.
  assert.deepEqual(monumentKindWeights({ culture: "norse", era: "MD", region: "COR" }), monumentKindWeights({ culture: "norse", era: "MD" }));
});

// ── §15.4 Cultures ──────────────────────────────────────────────────────────

test("§15.4: no cross for a non-christian culture; no statue for Arabic & Persian in MD–ST; Polynesian and Andean never draw stone, tomb or figure", () => {
  for (const c of ROUTE_CULTURES) {
    for (const era of ERAS) {
      const kinds = monumentKindWeights({ culture: c.key, era }).map(([k]) => k);
      if (!inCultureGroup("christian", c.key, era)) assert.ok(!kinds.includes("cross"), `${c.key} ${era}`);
      if (c.key === "arabic-persian" && ["MD", "EM", "ST"].includes(era)) assert.ok(!kinds.includes("statue"), `${c.key} ${era}`);
      if (c.sensitive) for (const k of ["stone", "tomb", "figure"] as const) assert.ok(!kinds.includes(k), `${c.key} ${era} ${k}`);
      if (c.key !== "arabic-persian" || era === "AN" || era === "MO") assert.ok(kinds.length > 0, `${c.key} ${era}`);
    }
  }
  for (const c of ["polynesian", "andean"]) {
    for (const era of ["AN", "MD", "ST"] as RouteEra[]) {
      for (const n of many({ culture: c, era, people: "invented" }, 120)) {
        assert.ok(!["stone", "tomb", "figure"].includes(n.kind), `${c}: ${n.text}`);
        assert.ok(!n.tones.includes("light") && !n.tones.includes("grim"), `${c}: ${n.text}`);
      }
    }
  }
  assert.ok(many({ culture: "arabic-persian", era: "AN", kind: "statue", people: "invented" }, 20).length > 0);
});

test("§7.3: the Chinese Memorial Gate and Ethiopian Stele moved here from buildings", () => {
  assert.ok(many({ culture: "chinese", kind: "arch" }, 100).some((n) => n.shape === "Memorial Gate of {founder}"));
  assert.ok(many({ culture: "ethiopian", era: "AN", kind: "stone" }, 100).some((n) => n.shape === "{founder:poss} Stele"));
  assert.ok(many({ culture: "roman", era: "AN", kind: "tomb" }, 100).some((n) => n.shape === "Mausoleum of {monarch}"));
});

test("§7.4: steampunk statues only in the steam age with fantastic on; fantastic shapes only with it on", () => {
  const sp = new Set(SETTLEMENT_VOCAB.pools.steampunkMonument.entries.map((e) => e.w));
  const has = (n: MonumentName) => n.words.some((w) => sp.has(w.word));
  assert.ok(many({ culture: "norman-british", era: "ST", fantastic: true, kind: "statue", people: "invented" }, 400).some(has));
  assert.ok(!many({ culture: "norman-british", era: "ST", kind: "statue", people: "invented" }, 400).some(has));
  const fantasticShapes = new Set(MONUMENT_DATA.eraShapes.filter((s) => s.h).map((s) => s.p));
  for (const n of many({ culture: "norman-british", era: "MD", people: "invented" }, 400)) assert.ok(!fantasticShapes.has(n.shape), n.text);
  assert.ok(many({ culture: "norman-british", era: "MD", fantastic: true, kind: "statue", people: "invented" }, 600).some((n) => fantasticShapes.has(n.shape)));
});

test("§7.4: in NF–IS about half the names of a kind with sci-fi shapes are sci-fi shapes", () => {
  for (const k of ["memorial", "stone"] as const) {
    const names = many({ culture: "general", era: "NF", kind: k, people: "invented" }, 600);
    const sf = names.filter((n) => n.source === "scifi").length / names.length;
    assert.ok(sf > 0.4 && sf < 0.6, `${k}: ${sf}`);
  }
});

// ── §15.5 Sites ─────────────────────────────────────────────────────────────

test("§15.5: Statue of {hero} gives the hero as site; a shape without s gives its name without \"the\"; \" of \" names are never district-worthy", () => {
  for (const n of many({ culture: "norman-british", era: "ST", kind: "statue", people: "invented", shape: "Statue of {hero}" }, 40)) {
    assert.equal(n.site, n.text.replace(/^Statue of /, ""));
    assert.equal(n.districtWorthy, false);
  }
  const placeholder = generateMonumentNames({ culture: "norman-british", era: "ST", kind: "statue", shape: "Statue of {hero}", count: 1, seed: 1 }).names[0];
  assert.equal(placeholder.text, "Statue of [hero]");
  assert.equal(placeholder.site, "[hero]");

  const leaning = generateMonumentNames({ culture: "norman-british", era: "MD", kind: "obelisk", shape: "the {monumentQual} {mw}", count: 5, seed: 2 }).names;
  for (const n of leaning) {
    assert.ok(n.text.startsWith("the "));
    assert.equal(n.site, n.text.slice(4));
    assert.equal(n.districtWorthy, n.site.split(" ").length <= 3);
  }
  for (const n of many({ culture: "general", era: "EM", people: "invented" }, 600)) {
    const shape = [...MONUMENT_DATA.shared, ...Object.values(MONUMENT_DATA.kindShapes).flat(), ...Object.values(MONUMENT_DATA.cultureShapes).flat(), ...MONUMENT_DATA.eraShapes, ...MONUMENT_DATA.scifi.shapes].find((s) => s.p === n.shape)!;
    if (/ of /.test(n.text)) assert.equal(n.districtWorthy, false, n.text);
    if (shape.s) assert.equal(n.districtWorthy, false, n.text);
    else assert.equal(n.site, n.text.replace(/^the /, ""), n.text);
  }
});

// ── §15.6 Nearby ────────────────────────────────────────────────────────────

const wordsOf = (pool: string) => SETTLEMENT_VOCAB.pools[pool].entries.map((e) => e.w);
function neighbourKind(text: string, site: string): string {
  if (text.startsWith("the ")) return "inn";
  if (text.toLowerCase() === site.toLowerCase()) return "district";
  const last = text.split(" ").pop()!;
  if (wordsOf("junctionWord").includes(last)) return "junction";
  if (wordsOf("streetWord").includes(last)) return "street";
  if (wordsOf("districtWord").includes(last)) return "district";
  return "?";
}

test("§15.6: nearby gives two names of two different kinds; no bare district or inn for a site that isn't district-worthy; every one passes the street safeguards", () => {
  const streetBlock = streetBlockSet();
  for (const era of ["AN", "MD", "ST", "MO", "NF"] as RouteEra[]) {
    for (const worthy of [true, false]) {
      const rng = mulberry32(era.charCodeAt(0) * 7 + (worthy ? 1 : 2));
      for (let i = 0; i < 80; i++) {
        const site = ["Fenwick", "Market Cross", "Leaning Obelisk", "[hero]"][i % 4];
        const out = monumentNeighbours(site, worthy, { culture: "norman-british", era, rng, village: i % 5 === 0 });
        assert.equal(out.length, 2, `${era} ${site}`);
        const kinds = out.map((t) => neighbourKind(t, site));
        assert.ok(!kinds.includes("?"), out.join(" / "));
        assert.notEqual(kinds[0], kinds[1], out.join(" / "));
        for (const t of out) {
          assert.ok(t.toLowerCase().includes(site.toLowerCase()), t);
          assert.ok(!streetBlock.has(routeNorm(t)) && !breaksStreetWords(t), t);
          if (!worthy) assert.ok(t.toLowerCase() !== site.toLowerCase() && !t.startsWith("the "), `${site}: ${t}`);
          if (era === "AN") assert.ok(!["junction", "inn"].includes(neighbourKind(t, site)), t);
          if (i % 5 === 0) assert.ok(t.toLowerCase() !== site.toLowerCase(), `village: ${t}`);
        }
      }
    }
  }
  // Placeholders stay placeholders; the module's nearby field renders them after the name.
  const b = generateMonumentNames({ culture: "norman-british", era: "ST", kind: "statue", shape: "Statue of {hero}", nearby: true, count: 1, seed: 4 });
  assert.equal(b.names[0].nearby.length, 2);
  for (const t of b.names[0].nearby) assert.ok(t.startsWith("[hero]") || t.startsWith("the [hero]"), t);
});

// ── §15.7 Safeguards ────────────────────────────────────────────────────────

test("§15.7: 2,000 names for each culture: no blocked name, no real honouree, no banned word", () => {
  const block = monumentBlockSet(defaultMonumentSafeguards());
  const honourees = monumentHonourees();
  for (const c of ROUTE_CULTURES) {
    const names: MonumentName[] = [];
    for (const era of ERAS) {
      for (const people of ["placeholders", "invented"] as const) names.push(...many({ culture: c.key, era, people, fantastic: era === "ST" || era === "AN" }, 150, 30));
    }
    assert.ok(names.length > 1000, `${c.key}: ${names.length}`);
    for (const n of names) {
      assert.ok(!block.has(bare(n.text)), `${c.key}: ${n.text}`);
      assert.ok(!honourees.some((re) => re.test(n.text)), `${c.key}: ${n.text}`);
      assert.ok(!breaksMonumentWords(n.text), `${c.key}: ${n.text}`);
    }
  }
});

test("§15.7: the block, flag and honouree lists are the brief's; a pack can extend the honourees", () => {
  const block = monumentBlockSet(defaultMonumentSafeguards());
  for (const w of ["Nelson's Column", "Stonehenge", "the Cenotaph", "Trajan's Column", "Argonath", "Tower of London"]) assert.ok(block.has(bare(w)), w);
  assert.ok(MONUMENT_DATA.safeguards.flag.includes("Market Cross"));
  assert.equal(MONUMENT_DATA.safeguards.flagListBlocks, false);
  assert.ok(monumentHonourees().some((re) => re.test("King Alfred")));
  assert.ok(monumentHonourees().some((re) => re.test("Boudicca")));
  assert.ok(!monumentHonourees().some((re) => re.test("Edwin")));
  assert.ok(monumentHonourees(["Edwin"]).some((re) => re.test("King Edwin's Cross")));
  for (const w of ["Confederate", "Slaver", "Slave", "Swastika", "Lynching"]) assert.ok(breaksMonumentWords(`Old ${w} Stone`), w);
  // A pack that adds a real honouree keeps him out of the names.
  const names = many({ culture: "norman-british", era: "MD", people: "invented", honourees: ["Edwin"] }, 300);
  assert.ok(!names.some((n) => /\bEdwin\b/.test(n.text)));
});

// ── §15.8 Series ────────────────────────────────────────────────────────────

test("§15.8: as one town no honouree, qualifier or event twice; one of each kind offered before a repeat", () => {
  for (const era of ["EM", "ST", "MO"] as RouteEra[]) {
    const offered = monumentKindWeights({ culture: "norman-british", era, people: "invented" }).length;
    for (let seed = 1; seed <= 12; seed++) {
      const b = generateMonumentNames({ culture: "norman-british", era, people: "invented", series: true, count: 12, seed });
      const used = b.names.flatMap(monumentUses);
      assert.equal(new Set(used).size, used.length, `${era} ${seed}: ${used.join(", ")}`);
      const firstRound = b.names.slice(0, offered).map((n) => n.kind);
      assert.equal(new Set(firstRound).size, firstRound.length, `${era} ${seed}: ${firstRound.join(", ")}`);
      const founders = b.names.filter((n) => n.uses.includes("founder")).length;
      assert.ok(founders <= MONUMENT_DATA.series.founderUses, `${era} ${seed}`);
      const towns = new Set(b.names.flatMap((n) => n.uses.filter((u) => u.startsWith("town:"))));
      assert.ok(towns.size <= 1, `${era} ${seed}: ${[...towns].join(", ")}`);
    }
  }
});

// ── Back-link function (§11) ────────────────────────────────────────────────

test("§11: monumentName gives one monument of 3 words or fewer (without \"the\"), with its site", () => {
  const rng = mulberry32(5);
  for (let i = 0; i < 100; i++) {
    const m = monumentName({ culture: "norman-british", era: "ST", people: "invented", rng });
    assert.ok(m);
    assert.ok(m.text.replace(/^the /, "").split(" ").length <= 3, m.text);
    assert.ok(m.site.length > 0);
  }
  const rng2 = mulberry32(5);
  for (let i = 0; i < 30; i++) {
    const m = monumentName({ culture: "norman-british", era: "MD", people: "invented", kinds: ["cross", "stone"], rng: rng2 });
    assert.ok(m, "a cross or a stone");
  }
});

test("street data: the neighbour shapes are the brief's", () => {
  const shapes = STREET_DATA.monumentNeighbours;
  assert.deepEqual(shapes.map((s) => [s.kind, s.p, s.w]), [
    ["junction", "{site} {jw}", 30], ["street", "{site} {sw}", 25], ["district", "{site}", 20], ["district", "{site} {dw}", 10], ["inn", "the {site}", 10],
  ]);
});
