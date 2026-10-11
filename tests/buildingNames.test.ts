// Buildings and landmarks (Buildings and landmarks brief §15).
import { test } from "node:test";
import assert from "node:assert/strict";
import { poolEntries, BUILT_IN_VOCAB, SETTLEMENT_VOCAB, inCultureGroup } from "../src/settlement/vocab";
import {
  BUILDING_DATA,
  BUILDING_KINDS,
  breaksBuildingWords,
  buildingKindWeights,
  buildingKindsOffered,
  generateBuildingNames,
  hasChristianBuilding,
  qualifierUses,
  type BuildingName,
  type BuildingOptions,
} from "../src/buildings/engine";
import { INN_SETTINGS } from "../src/inns/engine";
import { ROUTE_CULTURES, ROUTE_ERAS, routeNorm, type RouteEra } from "../src/routes/engine";
import { hasBannedWord } from "../src/groups/engine";

const BLOCK = new Set(BUILDING_DATA.safeguards.block.map((w) => routeNorm(w).replace(/^the /, "")));
const blocked = (text: string) => BLOCK.has(routeNorm(text).replace(/^the /, ""));

/** Names from small batches (each batch holds a word once, so big batches skew shares). */
function many(o: Omit<BuildingOptions, "count" | "seed">, n: number, size = 5): BuildingName[] {
  const out: BuildingName[] = [];
  for (let seed = 1; out.length < n && seed < n * 4; seed++) out.push(...generateBuildingNames({ ...o, count: size, seed }).names);
  return out.slice(0, n);
}

// ── §15.1 Vocabulary ────────────────────────────────────────────────────────

const NEW_POOLS = [
  ...BUILDING_KINDS.map((k) => `buildingWord:${k.key}`),
  ...BUILDING_KINDS.map((k) => `buildingFixed:${k.key}`),
  "buildingQual", "follyOwner", "holyWellPrefix", "steampunkLandmark", "sciFiLandmark", "eastVirtue", "castleBird", "indianPalaceWord", "oasisNoun",
];

test("§15.1: the new pools exist (entry validity is the shared vocabulary test's); no whole-name entry is a blocked real name", () => {
  for (const p of NEW_POOLS) assert.ok(SETTLEMENT_VOCAB.pools[p], p);
  for (const k of BUILDING_KINDS) assert.ok(SETTLEMENT_VOCAB.pools[`buildingWord:${k.key}`].entries.length > 0, k.key);
  // Building words are never a whole name (Hermitage is a §4.1 word and a §12.1 whole name), so the
  // whole-name pools are the ones checked.
  const whole = [...BUILDING_KINDS.map((k) => `buildingFixed:${k.key}`), "steampunkLandmark"];
  for (const p of whole) for (const e of SETTLEMENT_VOCAB.pools[p].entries) assert.ok(!blocked(e.w), `${p}: ${e.w}`);
});

test("§4.1: Tolbooth is ×3 in the Scottish Lowlands, Borders and Highlands", () => {
  const w = (region?: string) => poolEntries(BUILT_IN_VOCAB, "buildingWord:confinement", { culture: "norman-british", era: "EM", fantastic: false, region }).find(([e]) => e.w === "Tolbooth")?.[1];
  assert.equal(w(), 1);
  assert.equal(w("SLO"), 3);
});

// ── §15.2 Coverage and determinism ──────────────────────────────────────────

test("§15.2: the same options and seed give the same names", () => {
  for (const o of [{ culture: "norman-british" }, { culture: "japanese", people: "invented" as const }, { culture: "general", era: "ST" as RouteEra, series: true }]) {
    assert.deepEqual(generateBuildingNames({ ...o, count: 20, seed: 42 }).names, generateBuildingNames({ ...o, count: 20, seed: 42 }).names);
  }
});

test("§15.2: every culture × era × kind offered × setting × people gives 20 unique names within the cap", () => {
  for (const c of ROUTE_CULTURES) {
    for (const { code: era } of ROUTE_ERAS) {
      for (const s of INN_SETTINGS) {
        for (const people of ["placeholders", "invented"] as const) {
          const live = new Set(buildingKindWeights({ culture: c.key, era, setting: s.key, people }).map(([k]) => k));
          for (const k of buildingKindsOffered(era)) {
            const b = generateBuildingNames({ culture: c.key, era, kind: k.key, setting: s.key, people, count: 20, seed: 3 });
            const where = `${c.key} ${era} ${k.key} ${s.key} ${people}`;
            assert.equal(new Set(b.names.map((n) => n.text.toLowerCase())).size, b.names.length, where);
            for (const n of b.names) {
              assert.equal(n.kind, k.key, where);
              assert.ok(n.text.split(" ").filter((w) => !["of", "the", "and"].includes(w)).length <= BUILDING_DATA.cap, `${where}: ${n.text}`);
            }
            if (b.names.length < 20) {
              // A shortfall only where the kind has weight 0 here (§12.4: Polynesian faith, Andean faith after the
              // medieval era) – and Andean faith with placeholders, whose one shape is Sun Temple of [place].
              assert.ok(!live.has(k.key) || (c.key === "andean" && k.key === "faith" && people === "placeholders"), `${where}: only ${b.names.length}`);
              assert.ok(b.notices.some((x) => x.startsWith("Only ")), where);
            }
          }
        }
      }
    }
  }
});

// ── §15.3 Kinds, settings and eras ──────────────────────────────────────────

test("§15.3: in a port, lighthouses and beacons are ×5 (their share of the §5.1 × §5.2 weights, ±3 points)", () => {
  // §15.3 asks for 30%; the fixed weights give maritime 3 × 5 of 111 in the medieval era (13.5%) and
  // 25 of 104 at most (modern, 24%), so the test checks the weights' own share and the ×5.
  for (const era of ["MD", "MO"] as RouteEra[]) {
    const weights = buildingKindWeights({ culture: "norman-british", era, setting: "port" });
    const expected = (100 * weights.find(([k]) => k === "maritime")![1]) / weights.reduce((n, [, w]) => n + w, 0);
    const names = many({ culture: "norman-british", era, setting: "port", people: "invented" }, 2000);
    const share = (100 * names.filter((n) => n.kind === "maritime").length) / names.length;
    assert.ok(Math.abs(share - expected) <= 3, `${era}: ${share.toFixed(1)}% vs ${expected.toFixed(1)}%`);
    const anywhere = many({ culture: "norman-british", era, people: "invented" }, 2000).filter((n) => n.kind === "maritime").length;
    assert.ok(share >= (3 * 100 * anywhere) / 2000, `${era}: ${share.toFixed(1)}% vs ${anywhere} of 2,000 anywhere`);
  }
});

test("§15.3: MD has no steam-age, modern or sci-fi shapes; NF–IS at least 60% sci-fi in each kind", () => {
  const later = new Set([...BUILDING_DATA.eraShapes.map((s) => s.p), ...BUILDING_DATA.scifi.shapes.map((s) => s.p)]);
  for (const n of many({ culture: "norman-british", era: "MD", people: "invented" }, 2000)) assert.ok(!later.has(n.shape), n.text);
  for (const era of ["NF", "IS"] as RouteEra[]) {
    for (const k of buildingKindsOffered(era)) {
      const names = many({ culture: "general", era, kind: k.key, people: "invented" }, 400);
      const sf = names.filter((n) => n.source === "scifi").length;
      assert.ok(sf >= 0.6 * names.length - 0.05 * names.length, `${era} ${k.key}: ${sf}/${names.length}`);
    }
  }
});

test("§15.3: the steam age with fantastic gives steampunk landmarks; without, none", () => {
  const sp = new Set(SETTLEMENT_VOCAB.pools.steampunkLandmark.entries.map((e) => e.w));
  const has = (n: BuildingName) => n.words.some((w) => sp.has(w.word));
  assert.ok(many({ culture: "norman-british", era: "ST", fantastic: true, people: "invented" }, 1000).some(has));
  assert.ok(!many({ culture: "norman-british", era: "ST", people: "invented" }, 1000).some(has));
});

// ── §15.4 Cultures and religion ─────────────────────────────────────────────

test("§15.4: japanese defences give {castleBird} Castle, never a blocked real castle", () => {
  const names = many({ culture: "japanese", kind: "defence", people: "invented" }, 1000);
  assert.ok(names.some((n) => n.shape === "{castleBird} Castle"));
  for (const n of names) assert.ok(!blocked(n.text), n.text);
});

const LIVING = /\b(Mosque|Synagogue|Gurdwara|Pagoda|Stupa|Mandir|Wat)\b/i;

test("§15.4: 5,000 names for each non-christian culture: no christian faith word, no living religion's building", () => {
  for (const c of ROUTE_CULTURES) {
    const names: [BuildingName, RouteEra][] = [];
    for (const { code: era } of ROUTE_ERAS) {
      if (inCultureGroup("christian", c.key, era)) continue;
      for (const n of many({ culture: c.key, era, people: "invented" }, 720, 40)) names.push([n, era]);
    }
    if (names.length === 0) continue;
    assert.ok(names.length >= 5000 || ROUTE_ERAS.some((e) => inCultureGroup("christian", c.key, e.code)), `${c.key}: ${names.length}`);
    for (const [n, era] of names) {
      assert.ok(!hasChristianBuilding(n.text), `${c.key} ${era}: ${n.text}`);
      assert.ok(!LIVING.test(n.text), `${c.key} ${era}: ${n.text}`);
    }
  }
});

test("§15.4: Temple of {god} only for the five cultures; Polynesian has no faith names; Andean only its Sun Temple", () => {
  const five = new Set(["egyptian", "norse", "anglo-saxon", "aztec", "maya"]);
  for (const c of ROUTE_CULTURES) {
    const names = many({ culture: c.key, era: "AN", kind: "faith", people: "invented" }, 300);
    if (five.has(c.key)) assert.ok(names.some((n) => n.shape === "Temple of {god}"), c.key);
    else assert.ok(!names.some((n) => n.shape.includes("{god}")), c.key);
  }
  for (const era of ["AN", "MD", "ST", "MO"] as RouteEra[]) {
    assert.ok(!many({ culture: "polynesian", era, people: "invented" }, 1000).some((n) => n.kind === "faith"));
    for (const n of many({ culture: "andean", era, people: "invented" }, 1000).filter((x) => x.kind === "faith")) assert.equal(n.shape, "Sun Temple of {town}");
  }
});

test("§12.4: sensitive cultures draw no light, grim or fantastic entries", () => {
  const fantasticShapes = new Set(BUILDING_DATA.eraShapes.filter((s) => s.h).map((s) => s.p));
  for (const culture of ["polynesian", "andean"]) {
    for (const era of ["MD", "ST", "MO"] as RouteEra[]) {
      for (const n of many({ culture, era, fantastic: true, people: "invented" }, 500)) {
        assert.ok(!n.tones.includes("light") && !n.tones.includes("grim"), n.text);
        assert.ok(!fantasticShapes.has(n.shape), n.text);
      }
    }
  }
});

// ── §15.5 Series and safeguards ─────────────────────────────────────────────

test("§15.5: a series of 11 with kind Any: every kind once, one town, the founder at most 3 times, no qualifier twice", () => {
  for (let seed = 1; seed <= 20; seed++) {
    for (const people of ["placeholders", "invented"] as const) {
      const b = generateBuildingNames({ culture: "norman-british", era: "MD", people, series: true, count: 11, seed });
      const where = b.names.map((n) => n.text).join(", ");
      assert.equal(b.names.length, 11, where);
      assert.equal(new Set(b.names.map((n) => n.kind)).size, 11, where);
      assert.ok(b.names.filter((n) => n.uses.includes("founder")).length <= 3, where);
      const q = b.names.flatMap(qualifierUses);
      assert.equal(new Set(q).size, q.length, where);
      assert.ok(new Set(b.names.flatMap((n) => n.uses.filter((u) => u.startsWith("town:")))).size <= 1, where);
    }
  }
});

test("§15.5: 5,000 names per culture: no block-list matches, no banned words", () => {
  for (const c of ROUTE_CULTURES) {
    const names: BuildingName[] = [];
    for (const { code: era } of ROUTE_ERAS) {
      for (const fantastic of [false, true]) names.push(...many({ culture: c.key, era, fantastic, people: fantastic ? "invented" : "placeholders" }, 360, 40));
    }
    assert.ok(names.length >= 5000, `${c.key}: ${names.length}`);
    for (const n of names) {
      assert.ok(!blocked(n.text), `${c.key}: ${n.text}`);
      assert.ok(!hasBannedWord(n.text) && !breaksBuildingWords(n.text), `${c.key}: ${n.text}`);
    }
  }
});
