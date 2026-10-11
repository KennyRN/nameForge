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
