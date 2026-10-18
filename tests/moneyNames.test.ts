// Money and coins (docs/money-and-coins-brief.md §16).

import test from "node:test";
import assert from "node:assert/strict";
import { ROUTE_CULTURES } from "../src/routes/engine";
import {
  BUILT_IN_VOCAB,
  MONEY_ONLY_CULTURES,
  mergeVocabularyPacks,
  parseVocabularyPack,
  poolEntries,
  POOL_NAMES,
  SETTLEMENT_VOCAB,
  VALUE_TIERS,
  VOCAB_ALL_CULTURES,
  VOCAB_CULTURES,
} from "../src/settlement/vocab";

const NEW_POOLS = [
  "coinMetal", "coinWord", "coinEmblem", "coinFraction", "coinShapeWord", "earlyMoney", "goodsMoney", "paperWord", "tokenWord", "unitWord", "moneyNickname", "sfMoney",
  ...["coin", "early", "goods", "paper", "scrip", "currency", "nickname"].map((k) => `moneyFixed:${k}`),
];
const MONEY_CULTURES = ["french", "dutch", "iberian", "american"];

// ── §16.1 Vocabulary and cultures ───────────────────────────────────────────

test("§16.1: the new pools exist and every entry's v, ts, loan and fx are valid", () => {
  for (const name of NEW_POOLS) {
    assert.ok(POOL_NAMES.includes(name), name);
    for (const e of SETTLEMENT_VOCAB.pools[name].entries) {
      for (const v of e.v ?? []) assert.ok(VALUE_TIERS.includes(v), `${name} ${e.w}: v ${v}`);
      if (e.ts !== undefined) assert.ok(e.ts === 1 || e.ts === -1, `${name} ${e.w}: ts`);
      if (e.loan !== undefined) assert.ok(name.startsWith("moneyFixed:") && e.loan.length > 0, `${name} ${e.w}: loan`);
      if (e.fx !== undefined) assert.ok(name.startsWith("moneyFixed:") && e.fx.length > 0, `${name} ${e.w}: fx`);
    }
  }
});

test("§16.1: no other pool carries a money key", () => {
  for (const [name, pool] of Object.entries(SETTLEMENT_VOCAB.pools)) {
    if (NEW_POOLS.includes(name)) continue;
    for (const e of pool.entries) assert.ok(!("v" in e) && !("loan" in e) && !("fx" in e) && !("ts" in e), `${name} ${e.w}`);
  }
});

test("§3.2: french, dutch, iberian and american are money-only cultures", () => {
  assert.deepEqual(MONEY_ONLY_CULTURES, MONEY_CULTURES);
  for (const c of MONEY_CULTURES) {
    assert.ok(VOCAB_ALL_CULTURES.includes(c), c);
    assert.ok(!VOCAB_CULTURES.includes(c), `${c} is in the shared culture list`);
    assert.ok(!ROUTE_CULTURES.some((r) => r.key === c), `${c} is in the route-based menus`);
  }
  assert.equal(VOCAB_CULTURES.length, 22);
});

test("§3.2: french and iberian are christian cultures; dutch and american are not", () => {
  const where = (culture: string) => ({ culture, era: "EM" as const, fantastic: false });
  const has = (culture: string) => poolEntries(BUILT_IN_VOCAB, "coinEmblem", where(culture)).some(([e]) => e.w === "Cross");
  assert.ok(has("french") && has("iberian"));
  assert.ok(!has("dutch") && !has("american"));
});

test("§5: vocabulary packs can tag the money-only cultures, add loan forms and tiers", () => {
  const content = `---
type: vocabulary
---

## moneyFixed:coin · french · MD
- Little Flower [Florin] (h)
- Brass Ring ×2 (grim, l)

## moneyFixed:currency · dutch
- Fat Guilder [Gulden]

## paperWord
- Voucher [ignored as a theme] (h)
`;
  const parsed = parseVocabularyPack(content, "money");
  assert.deepEqual(parsed.problems, []);
  const [coin, currency, paper] = parsed.sections;
  assert.equal(coin.culture, "french");
  assert.equal(coin.era, "MD");
  assert.deepEqual(coin.entries[0], { w: "Little Flower", v: ["h"], loan: "Florin" });
  assert.deepEqual(coin.entries[1], { w: "Brass Ring", x: 2, t: ["grim"], v: ["l"] });
  assert.equal(currency.culture, "dutch");
  assert.deepEqual(currency.entries[0], { w: "Fat Guilder", loan: "Gulden" });
  // Money word pools read the same marks.
  assert.deepEqual(paper.entries[0], { w: "Voucher", v: ["h"], loan: "ignored as a theme" });
  const { vocab } = mergeVocabularyPacks([{ name: "money", content }]);
  const added = vocab.pools["moneyFixed:coin"].entries.find((e) => e.w === "Little Flower" && e.c?.includes("french"))!;
  assert.deepEqual(added.c, ["french"]);
  assert.deepEqual(added.e, ["MD"]);
  assert.equal(added.loan, "Florin");
});

test("§5: other pools still read square brackets as themes and ignore tiers", () => {
  const content = `---
type: vocabulary
---

## innCreature
- Golden Hare [rural] (h)
`;
  const { sections } = parseVocabularyPack(content, "inns");
  assert.deepEqual(sections[0].entries[0], { w: "Golden Hare", th: ["rural"] });
});

test("§5: the merge hands the pool to the blocked callback", () => {
  const content = `---
type: vocabulary
---

## moneyFixed:goods
- Salt Slab
- Tobacco Leaf
`;
  const { vocab } = mergeVocabularyPacks([{ name: "goods", content }], (word, pool) => pool === "moneyFixed:goods" && /tobacco/i.test(word));
  const words = vocab.pools["moneyFixed:goods"].entries.map((e) => e.w);
  assert.ok(words.includes("Salt Slab"));
  assert.ok(!words.includes("Tobacco Leaf"));
});
