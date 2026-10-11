// Streets and districts (Streets and districts brief §16).
import { test } from "node:test";
import assert from "node:assert/strict";
import { PLACE_SHAPE_REGIONS } from "../src/placeShapes";
import { BUILT_IN_VOCAB, mergeVocabularyPacks, poolEntries, SETTLEMENT_VOCAB, VOCAB_REGIONS, type VocabWhere } from "../src/settlement/vocab";

// ── §16.1 Vocabulary ────────────────────────────────────────────────────────

const STREET_POOLS = [
  "compWater", "compCrossing", "compMill", "compStorage", "compMarket", "compDefence", "compFaith", "compRule", "compWaterside", "compTravel", "compLearning",
  "compDeath", "compPublic", "compSteampunk", "compSciFi", "streetWord", "alleyWord", "planned", "alleyDialect", "mainStreet", "streetTrades", "streetGoods",
  "streetFigure", "streetTree", "commemorative", "streetSteampunk", "streetFixed", "squareWord", "marketWord", "squareFixed", "districtWord", "districtFixed",
];
const where = (culture: string, region?: string, era: VocabWhere["era"] = "MD"): VocabWhere => ({ culture, era, fantastic: false, region });
const words = (vocab = BUILT_IN_VOCAB, pool: string, w: VocabWhere) => poolEntries(vocab, pool, w).map(([e]) => e.w);

test("§16.1: the new pools exist; region codes are the place-shape regions", () => {
  assert.deepEqual(VOCAB_REGIONS, PLACE_SHAPE_REGIONS.map((r) => r.code));
  for (const p of STREET_POOLS) assert.ok(SETTLEMENT_VOCAB.pools[p]?.entries.length > 0, p);
  // Every entry's validity is checked by the shared vocabulary test (RN §15.1 rules, region codes included).
});

test("§3.1: region tags apply to the British cultures only; region multipliers weight Gate", () => {
  assert.deepEqual(words(undefined, "alleyDialect", where("norman-british", "SEA")), ["Twitten"]);
  assert.ok(words(undefined, "alleyDialect", where("norman-british")).length === 13);
  assert.ok(words(undefined, "compWaterside", where("norman-british", "NTH")).includes("Staithe"));
  assert.ok(!words(undefined, "compWaterside", where("norman-british", "SEA")).includes("Staithe"));
  assert.ok(words(undefined, "compWaterside", where("japanese", "SEA")).includes("Staithe"));
  const gate = (region?: string) => poolEntries(BUILT_IN_VOCAB, "streetWord", where("norse", region)).find(([e]) => e.w === "Gate")?.[1];
  assert.equal(gate(), 3);
  assert.equal(gate("SEA"), 3);
  assert.equal(gate("NTH"), 3);
  const asGate = (region?: string) => poolEntries(BUILT_IN_VOCAB, "streetWord", where("norman-british", region)).find(([e]) => e.w === "Gate")?.[1];
  assert.equal(asGate("NTH"), 9);
  assert.equal(asGate("EAN"), 4.5);
  assert.equal(asGate(), 3);
});

test("§16.1: a pack section “## alleyDialect · SBL” adds only for SBL", () => {
  const { vocab, notices } = mergeVocabularyPacks([{ name: "V", content: "---\ntype: vocabulary\n---\n\n## alleyDialect · SBL\n- Pend\n\n## streetWord · NTH · EM · norman-british\n- Bar\n" }]);
  assert.deepEqual(notices, []);
  assert.ok(words(vocab, "alleyDialect", where("norman-british", "SBL")).includes("Pend"));
  assert.ok(!words(vocab, "alleyDialect", where("norman-british", "NTH")).includes("Pend"));
  assert.ok(words(vocab, "streetWord", where("norman-british", "NTH", "EM")).includes("Bar"));
  assert.ok(!words(vocab, "streetWord", where("norman-british", "NTH", "MD")).includes("Bar"));
  assert.ok(!words(vocab, "streetWord", where("celtic", "NTH", "EM")).includes("Bar"));
});

// ── §16.2–§16.7 Engine ──────────────────────────────────────────────────────

import {
  breaksStreetWords,
  functionsForSize,
  generateStreetNames,
  hasChristianWord,
  kindsForSize,
  STREET_DATA,
  type StreetName,
  type StreetOptions,
  type StreetSize,
} from "../src/streets/engine";
import { BRITISH_CULTURES, ROUTE_CULTURES, ROUTE_ERAS, routeNorm, type RouteEra } from "../src/routes/engine";
import { inCultureGroup } from "../src/settlement/vocab";
import { hasBannedWord } from "../src/groups/engine";

const SIZES: StreetSize[] = ["village", "town", "city", "great"];
function many(o: Omit<StreetOptions, "count" | "seed">, n: number): StreetName[] {
  const out: StreetName[] = [];
  for (let seed = 1; out.length < n && seed < n; seed++) out.push(...generateStreetNames({ ...o, count: 100, seed }).names);
  return out.slice(0, n);
}
const fromPool = (n: StreetName, pool: string) => n.words.filter((w) => w.pool === pool).map((w) => w.word);

test("§16.2: the same options and seed give the same names", () => {
  for (const o of [{ culture: "norman-british" }, { culture: "japanese", era: "EM" as RouteEra, people: "invented" as const }, { culture: "general", series: true, size: "city" as StreetSize }]) {
    assert.deepEqual(generateStreetNames({ ...o, count: 20, seed: 42 }).names, generateStreetNames({ ...o, count: 20, seed: 42 }).names);
  }
});

test("§16.2: every culture × era × kind offered × size × dialect × people gives 20 unique names within the cap", () => {
  for (const c of ROUTE_CULTURES) {
    const dialects = BRITISH_CULTURES.includes(c.key) ? (["plain", "variants", "instead"] as const) : (["plain"] as const);
    for (const { code: era } of ROUTE_ERAS) {
      for (const size of SIZES) {
        for (const k of kindsForSize(size)) {
          for (const dialect of dialects) {
            for (const people of ["placeholders", "invented"] as const) {
              const b = generateStreetNames({ culture: c.key, era, kind: k.key, size, dialect, people, count: 20, seed: 3 });
              const where = `${c.key} ${era} ${size} ${k.key} ${dialect} ${people}`;
              assert.equal(b.names.length, 20, where);
              assert.equal(new Set(b.names.map((n) => n.text.toLowerCase())).size, 20, where);
              for (const n of b.names) assert.equal(n.kind, k.key, `${where}: ${n.text}`);
            }
          }
        }
      }
    }
  }
});

test("§16.3: a village never has districts, and isn't offered them", () => {
  assert.deepEqual(kindsForSize("village").map((k) => k.key), ["streets", "squares"]);
  for (const n of many({ culture: "norman-british", size: "village", people: "invented" }, 2000)) assert.notEqual(n.kind, "districts", n.text);
  const b = generateStreetNames({ culture: "norman-british", size: "village", kind: "districts", count: 10, seed: 1 });
  assert.ok(b.notices.includes("A village has no districts."));
  for (const n of b.names) assert.equal(n.kind, "streets");
});

test("§16.3: a city's districts, 2,000 names, use every function; a town never has rule, learning, foreign or elite", () => {
  const city = new Set(many({ culture: "norman-british", size: "city", kind: "districts", people: "invented" }, 2000).map((n) => n.function));
  assert.deepEqual([...city].sort(), functionsForSize("city").map((f) => f.key).sort());
  for (const n of many({ culture: "general", size: "town", kind: "districts", people: "invented" }, 2000)) {
    assert.ok(!["rule", "learning", "foreign", "elite"].includes(n.function!), `${n.text} (${n.function})`);
  }
});

const alleys = (o: Omit<StreetOptions, "count" | "seed">) => many({ culture: "norman-british", kind: "streets", people: "invented", shape: "{component} {aw}", ...o }, 300);

test("§16.4: South East, “instead”: alleys use Twitten and no other dialect word", () => {
  const names = alleys({ region: "SEA", dialect: "instead" });
  for (const n of names) {
    assert.ok(/ Twitten$/.test(n.text), n.text);
    assert.deepEqual(fromPool(n, "alleyDialect"), ["Twitten"]);
  }
});

test("§16.4: “as variants”: at most 40% of a 20-name batch is bracketed, every bracket's word right for the region", () => {
  const dialect = new Map(SETTLEMENT_VOCAB.pools.alleyDialect.entries.map((e) => [e.w, e.r ?? []]));
  for (const region of ["NTH", "SLO", "WCY"]) {
    for (let seed = 1; seed <= 30; seed++) {
      const b = generateStreetNames({ culture: "norman-british", kind: "streets", region, dialect: "variants", people: "invented", size: "great", count: 20, seed });
      const bracketed = b.names.filter((n) => n.text.includes("("));
      assert.ok(bracketed.length <= 8, `${region} ${seed}: ${bracketed.length}`);
      for (const n of bracketed) {
        assert.equal(n.text, `${n.plain} (${n.dialect})`);
        for (const w of fromPool(n, "alleyDialect")) assert.ok(dialect.get(w)!.includes(region), `${region}: ${n.text}`);
      }
    }
  }
  // Some batches do carry variants.
  assert.ok(alleys({ region: "NTH", dialect: "variants" }).some((n) => n.text.includes("(")));
});

test("§16.4: non-British cultures get no dialect words", () => {
  for (const culture of ["japanese", "general", "norse"]) {
    for (const n of many({ culture, kind: "streets", dialect: "instead", people: "invented", size: "great" }, 1000)) {
      assert.equal(fromPool(n, "alleyDialect").length, 0, n.text);
      assert.ok(!n.text.includes("("), n.text);
    }
  }
});

test("§16.5: indian and west-african, 5,000 names: no trade words (goods instead)", () => {
  for (const culture of ["indian", "west-african"]) {
    const names = ROUTE_ERAS.flatMap(({ code: era }) => many({ culture, era, size: "great", people: "invented" }, 720));
    assert.ok(names.length >= 5000);
    for (const n of names) assert.equal(fromPool(n, "streetTrades").length, 0, `${culture}: ${n.text}`);
    assert.ok(names.some((n) => n.shape === "{streetGoods} {dw}"));
  }
});

test("§16.5: japanese squares have “-Day” markets; chinese trade streets have no possessive", () => {
  const japanese = many({ culture: "japanese", era: "EM", kind: "squares" }, 1000);
  assert.ok(japanese.some((n) => /^(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth)-Day Market$/.test(n.text)));
  const chinese = many({ culture: "chinese", era: "MD", kind: "streets", size: "city", shape: "{trade} Street" }, 100);
  assert.ok(chinese.length > 0);
  for (const n of chinese) assert.ok(!n.text.includes("'"), n.text);
});

test("§16.5: medieval, 2,000 names: no planned, commemorative or sci-fi shape", () => {
  const scifi = new Set([...STREET_DATA.scifiStreets.shapes, ...STREET_DATA.scifiDistricts.shapes].map((s) => s.p));
  for (const n of many({ culture: "norman-british", era: "MD", size: "great", people: "invented" }, 2000)) {
    for (const pool of ["planned", "commemorative", "compSciFi", "streetTree"]) assert.equal(fromPool(n, pool).length, 0, n.text);
    assert.ok(!scifi.has(n.shape), n.text);
  }
});

test("§16.5: near future and interstellar: at least 70% of streets are sci-fi", () => {
  const scifi = new Set(STREET_DATA.scifiStreets.shapes.map((s) => s.p));
  for (const era of ["NF", "IS"] as RouteEra[]) {
    // Small batches, so each batch's uniqueness doesn't crowd out the sci-fi shapes' fixed names.
    const names: StreetName[] = [];
    for (let seed = 1; names.length < 2000; seed++) names.push(...generateStreetNames({ culture: "norman-british", era, kind: "streets", people: "invented", count: 4, seed }).names);
    const sf = names.filter((n) => scifi.has(n.shape) || fromPool(n, "compSciFi").length > 0);
    assert.ok(sf.length >= 1400, `${era}: ${sf.length}`);
  }
});

test("§16.6: a one-town street series of 10: a main street first, no repeats, one route, six neighbours at most", () => {
  for (let seed = 1; seed <= 20; seed++) {
    const b = generateStreetNames({ culture: "norman-british", era: "EM", region: "NTH", kind: "streets", people: "invented", series: true, count: 10, seed });
    assert.equal(b.names.length, 10, `seed ${seed}`);
    assert.equal(fromPool(b.names[0], "mainStreet").length, 1, b.names[0].text);
    const uses = b.names.flatMap((n) => n.uses);
    assert.equal(new Set(uses).size, uses.length, b.names.map((n) => n.text).join(", "));
    assert.equal(b.names.filter((n) => n.route).length, 1, b.names.map((n) => n.text).join(", "));
    const towns = new Set(uses.filter((u) => u.startsWith("destination:")));
    assert.ok(towns.size <= 6);
  }
});

test("§16.6: a one-town district series for a city: no function twice before all are used; Old Town first", () => {
  for (let seed = 1; seed <= 20; seed++) {
    const b = generateStreetNames({ culture: "norman-british", kind: "districts", size: "city", people: "invented", series: true, count: 10, seed });
    assert.equal(b.names[0].text, "Old Town");
    const fns = b.names.map((n) => n.function);
    assert.equal(new Set(fns).size, fns.length, fns.join(", "));
  }
  assert.equal(generateStreetNames({ culture: "japanese", kind: "districts", size: "town", series: true, count: 3, seed: 1 }).names[0].text, "Castle Town");
});

test("§16.7: 5,000 names per culture: no block-list matches (variants too), no banned words, no living religions' buildings; christian words only for christian cultures", () => {
  const block = new Set(STREET_DATA.safeguards.block.map(routeNorm));
  const religious = STREET_DATA.safeguards.religious.map((w) => new RegExp(`\\b${w}\\b`, "i"));
  for (const c of ROUTE_CULTURES) {
    const names: [StreetName, RouteEra][] = [];
    for (const { code: era } of ROUTE_ERAS) {
      for (const fantastic of [false, true]) {
        for (const n of many({ culture: c.key, era, fantastic, size: "great", dialect: "variants", people: fantastic ? "invented" : "placeholders" }, 360)) names.push([n, era]);
      }
    }
    assert.ok(names.length >= 5000, `${c.key}: ${names.length}`);
    for (const [n, era] of names) {
      for (const text of [n.plain, ...(n.dialect ? [n.dialect] : [])]) {
        assert.ok(!block.has(routeNorm(text)), `${c.key}: ${text}`);
        assert.ok(!hasBannedWord(text) && !breaksStreetWords(text), `${c.key}: ${text}`);
        assert.ok(!religious.some((re) => re.test(text)), `${c.key}: ${text}`);
        if (hasChristianWord(text)) assert.ok(inCultureGroup("christian", c.key, era), `${c.key} ${era}: ${text}`);
      }
    }
  }
});

// ── §16.8 Sentence and presets ──────────────────────────────────────────────

import { chooseStreet, DEFAULT_STREET_STATE, streetHistoryLabel, streetSentence, streetSentenceText, type StreetSentenceState } from "../src/streets/sentence";
import { modulePresetContent, parseModulePreset, type StreetPreset } from "../src/presets";
import { historySection, SECTION_GROUPS } from "../src/sections";

const sField = (state: StreetSentenceState, f: string) => streetSentence(state).find((s) => typeof s !== "string" && s.field === f) as Exclude<ReturnType<typeof streetSentence>[number], string> | undefined;
const set = (state: StreetSentenceState, ...pairs: [Parameters<typeof chooseStreet>[1], string | undefined][]) => pairs.reduce((s, [f, id]) => chooseStreet(s, f, id), state);

test("§16.8: the default sentence's plain text", () => {
  assert.equal(
    streetSentenceText(streetSentence(DEFAULT_STREET_STATE)),
    "Norman & British streets, squares and districts of the medieval era, in a realistic world, across all of Britain, for a town, with dialect words as variants, of any tone, with placeholders for people and places, each one separate.",
  );
  const crafty = set(DEFAULT_STREET_STATE, ["kind", "districts"], ["function", "craft"], ["region", "NTH"], ["series", "on"]);
  assert.equal(
    streetSentenceText(streetSentence(crafty)),
    "Norman & British districts for craft of the medieval era, in a realistic world, in the North, for a town, with dialect words as variants, of any tone, with placeholders for people and places, as one town.",
  );
  assert.ok(streetSentenceText(streetSentence(set(DEFAULT_STREET_STATE, ["kind", "districts"]))).startsWith("Norman & British districts of any function of the"));
});

test("§16.8: the function link only with districts; the dialect link hidden for japanese; size labels change in the near future", () => {
  assert.equal(sField(DEFAULT_STREET_STATE, "function"), undefined);
  const districts = set(DEFAULT_STREET_STATE, ["kind", "districts"], ["function", "craft"]);
  assert.ok(sField(districts, "function"));
  assert.equal(set(districts, ["kind", "streets"]).function, undefined);
  // A town offers no rule districts; a city does, and a smaller size resets them.
  assert.ok(!sField(districts, "function")!.choices.some((c) => c.id === "rule"));
  const rule = set(districts, ["size", "city"], ["function", "rule"]);
  assert.equal(rule.function, "rule");
  assert.equal(set(rule, ["size", "town"]).function, undefined);
  assert.equal(set(rule, ["size", "village"]).kind, undefined);
  const japanese = set(DEFAULT_STREET_STATE, ["region", "NTH"], ["culture", "japanese"]);
  assert.equal(sField(japanese, "dialect"), undefined);
  assert.equal(japanese.region, undefined);
  assert.ok(!streetSentenceText(streetSentence(japanese)).includes("dialect"));
  assert.deepEqual(sField(DEFAULT_STREET_STATE, "size")!.choices.map((c) => c.label), ["village", "town", "city", "great city"]);
  const nf = set(DEFAULT_STREET_STATE, ["era", "NF"]);
  assert.deepEqual(sField(nf, "size")!.choices.map((c) => c.label), ["outpost", "colony", "station", "megacity"]);
  assert.ok(streetSentenceText(streetSentence(set(nf, ["size", "village"]))).includes("for an outpost"));
});

test("§1: the module follows route names; history label and section", () => {
  assert.deepEqual(SECTION_GROUPS.placeNames.slice(0, 3), ["placeShapes", "routeNames", "streetNames"]);
  assert.equal(streetHistoryLabel(DEFAULT_STREET_STATE), "streets and districts · medieval · Norman & British · town");
  const full = set(DEFAULT_STREET_STATE, ["era", "ST"], ["fantastic", "on"], ["kind", "districts"], ["size", "great"], ["region", "NTH"], ["tone", "grim"], ["series", "on"]);
  assert.equal(streetHistoryLabel(full), "streets and districts · steam age · Norman & British · districts and quarters · great city · the North · steampunk · grim · one town");
  assert.equal(historySection(streetHistoryLabel(full)), "streetNames");
});

test("§16.8: presets round-trip; districts with a village report and run as streets", () => {
  const preset: StreetPreset = {
    packName: "Northern market town",
    setting: "",
    description: "Norman & British streets, squares and districts of the early modern era, in a realistic world, in the North, for a town, with dialect words as variants, of any tone, with invented people and places, as one town.",
    culture: "norman-british",
    region: "NTH",
    streetKind: "any",
    function: "any",
    era: "EM",
    fantastic: false,
    size: "town",
    dialect: "variants",
    tone: "any",
    people: "invented",
    series: true,
  };
  const content = modulePresetContent(preset);
  assert.ok(content.includes("module: street-names\n") && content.includes("kind: any\n") && content.includes("dialect: variants\n"));
  const parsed = parseModulePreset(content, "x");
  assert.deepEqual(parsed.street, preset);
  assert.deepEqual(parsed.problems, []);
  const village = parseModulePreset(modulePresetContent({ ...preset, streetKind: "districts", size: "village" }), "x");
  assert.equal(village.street?.streetKind, "streets");
  assert.deepEqual(village.problems, ["A village has no districts."]);
  const odd = parseModulePreset(modulePresetContent({ ...preset, size: "hamlet" as StreetSize, dialect: "scots" as never }), "x");
  assert.equal(odd.street?.size, "town");
  assert.equal(odd.street?.dialect, "variants");
  assert.deepEqual(odd.problems, ["Unknown size “hamlet”.", "Unknown dialect “scots”."]);
});
