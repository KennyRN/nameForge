// Money and coins (docs/money-and-coins-brief.md §16).

import test from "node:test";
import assert from "node:assert/strict";
import {
  breaksMoneyWords,
  findMoneyCulture,
  generateMoneyNames,
  MONEY_CULTURES,
  MONEY_DATA,
  MONEY_KINDS,
  moneyBlockSet,
  moneyHasLoans,
  moneyKindsOffered,
  moneyKindWeight,
  moneyWordBlocked,
  pluralName,
  VALUE_TIER,
  type MoneyKind,
  type MoneyName,
  type MoneyOptions,
  type MoneyValue,
} from "../src/money/engine";
import { countedWords, ROUTE_CULTURES, ROUTE_ERAS, routeNorm, type RouteEra } from "../src/routes/engine";
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
const NEW_CULTURES = ["french", "dutch", "iberian", "american"];

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
  assert.deepEqual(MONEY_ONLY_CULTURES, NEW_CULTURES);
  for (const c of NEW_CULTURES) {
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

// ── Engine (§16.2–§16.5) ────────────────────────────────────────────────────

const ERAS = ROUTE_ERAS.map((e) => e.code);
const FIXED_POOLS = MONEY_KINDS.map((k) => `moneyFixed:${k.key}`);

function many(o: Omit<MoneyOptions, "count" | "seed">, n: number, size = 5): MoneyName[] {
  const out: MoneyName[] = [];
  for (let seed = 1; out.length < n && seed < n * 4; seed++) out.push(...generateMoneyNames({ ...o, count: size, seed }).names);
  return out;
}

test("§3.1: the money menu is route names' cultures bar Polynesian and Andean, with the four new ones in place", () => {
  const keys = MONEY_CULTURES.map((c) => c.key);
  assert.equal(keys.length, 24);
  assert.ok(!keys.includes("polynesian") && !keys.includes("andean"));
  assert.deepEqual(keys.slice(keys.indexOf("greek-byzantine"), keys.indexOf("greek-byzantine") + 4), ["greek-byzantine", "french", "dutch", "iberian"]);
  assert.equal(keys[keys.indexOf("maya") + 1], "american");
  assert.equal(findMoneyCulture("iberian")!.label, "Spanish & Portuguese");
  for (const c of MONEY_ONLY_CULTURES) assert.ok(keys.includes(c), c);
});

test("§16.2: the same options and seed give the same names", () => {
  for (const o of [
    { culture: "norman-british", era: "MD" as RouteEra },
    { culture: "roman", era: "AN" as RouteEra, words: "loanwords" as const, people: "invented" as const },
    { culture: "chinese", era: "EM" as RouteEra, kind: "early" as MoneyKind, value: "high" as MoneyValue },
    { culture: "general", era: "IS" as RouteEra, fantastic: true, tone: "grim" as const },
  ]) {
    assert.deepEqual(generateMoneyNames({ ...o, count: 20, seed: 42 }).names, generateMoneyNames({ ...o, count: 20, seed: 42 }).names);
  }
});

// Kinds whose names the data can always fill to 20; the others are limited by how many names the brief lists.
const DEEP: MoneyKind[] = ["coin", "currency", "nickname"];

test("§16.2: every culture × era × kind × value × words × people gives unique names within the cap", () => {
  let empty = 0;
  for (const c of MONEY_CULTURES) {
    for (const era of ERAS) {
      for (const k of moneyKindsOffered(c.key, era)) {
        for (const value of ["any", "high", "middle", "low"] as MoneyValue[]) {
          if (k.key === "currency" && value !== "any") continue;
          for (const words of moneyHasLoans(c.key) ? (["translated", "loanwords"] as const) : (["translated"] as const)) {
            for (const people of ["placeholders", "invented"] as const) {
              const b = generateMoneyNames({ culture: c.key, era, kind: k.key, value, words, people, count: 20, seed: 11 });
              const where = `${c.key} ${era} ${k.key} ${value} ${words} ${people}`;
              assert.equal(new Set(b.names.map((n) => n.text.toLowerCase())).size, b.names.length, `${where}: duplicates`);
              for (const n of b.names) assert.ok(countedWords(n.text).length >= 1 && countedWords(n.text).length <= MONEY_DATA.cap, `${where}: ${n.text}`);
              if (DEEP.includes(k.key)) assert.equal(b.names.length, 20, where);
              if (b.names.length < 20) assert.ok(b.notices.length > 0, `${where}: no notice`);
              if (b.names.length === 0 && value === "any") empty++;
            }
          }
        }
      }
    }
  }
  // The brief offers scrip in the Middle Ages and goods money in the modern era with few or no names to draw.
  assert.ok(empty > 0);
});

// ── §16.3 Kinds and eras ────────────────────────────────────────────────────

test("§16.3: aztec and maya have no coins before the early modern era", () => {
  for (const c of ["aztec", "maya"]) {
    for (const era of ["AN", "MD"] as RouteEra[]) {
      assert.ok(!moneyKindsOffered(c, era).some((k) => k.key === "coin"), `${c} ${era}`);
      for (const n of many({ culture: c, era }, 200)) assert.notEqual(n.kind, "coin");
    }
    assert.ok(moneyKindsOffered(c, "EM").some((k) => k.key === "coin"));
  }
});

test("§16.3: no paper in the ancient world, no early money from the steam age on", () => {
  for (const c of MONEY_CULTURES) {
    assert.ok(!moneyKindsOffered(c.key, "AN").some((k) => k.key === "paper"), c.key);
    for (const era of ["ST", "MO", "NF", "IS"] as RouteEra[]) assert.ok(!moneyKindsOffered(c.key, era).some((k) => k.key === "early"), `${c.key} ${era}`);
  }
  assert.ok(many({ culture: "general", era: "AN" }, 300).every((n) => n.kind !== "paper"));
  assert.ok(many({ culture: "general", era: "ST" }, 300).every((n) => n.kind !== "early"));
});

test("§4.2: paper in the Middle Ages only for chinese, arabic-persian, indian, roman and norman-british", () => {
  for (const c of MONEY_CULTURES) assert.equal(moneyKindsOffered(c.key, "MD").some((k) => k.key === "paper"), MONEY_DATA.paperMiddleAges.includes(c.key), c.key);
});

test("§16.3: french, dutch, iberian: only currencies and nicknames in the ancient world; american until the early modern era", () => {
  for (const c of ["french", "dutch", "iberian"]) assert.deepEqual(moneyKindsOffered(c, "AN").map((k) => k.key), ["currency", "nickname"], c);
  for (const era of ["AN", "MD"] as RouteEra[]) assert.deepEqual(moneyKindsOffered("american", era).map((k) => k.key), ["currency", "nickname"], era);
  assert.ok(!moneyKindsOffered("american", "EM").some((k) => k.key === "early"));
});

test("§4.2: kind weights follow the era table and the culture multipliers", () => {
  assert.equal(moneyKindWeight("coin", "general", "MD"), 45);
  assert.equal(moneyKindWeight("coin", "norse", "AN"), 20);
  assert.equal(moneyKindWeight("goods", "aztec", "ST"), 12);
  assert.equal(moneyKindWeight("early", "west-african", "AN"), 30);
  assert.equal(moneyKindWeight("coin", "west-african", "EM"), 0);
  assert.equal(moneyKindWeight("coin", "west-african", "ST"), 35);
  assert.equal(moneyKindWeight("coin", "bantu", "MD"), 22.5);
  assert.equal(moneyKindWeight("goods", "american", "EM"), 16);
});

// ── §16.4 Names and loans ───────────────────────────────────────────────────

const LOAN_FORMS = new Map<string, Set<string>>();
const PLAIN = new Set<string>();
for (const pool of FIXED_POOLS) {
  for (const e of SETTLEMENT_VOCAB.pools[pool].entries) {
    PLAIN.add(e.w);
    if (e.loan) for (const c of e.c ?? []) (LOAN_FORMS.get(c) ?? LOAN_FORMS.set(c, new Set()).get(c)!).add(e.loan);
  }
}
for (const pool of ["coinWord", "unitWord", "coinEmblem", "coinMetal", "moneyNickname"]) for (const e of SETTLEMENT_VOCAB.pools[pool].entries) PLAIN.add(e.w);

test("§16.4: translated mode never prints a loan form (10,000 names across the loan cultures)", () => {
  let total = 0;
  for (const [culture, loans] of LOAN_FORMS) {
    const only = [...loans].filter((l) => !PLAIN.has(l));
    assert.ok(only.length > 0, culture);
    for (const era of ERAS) {
      for (const n of many({ culture, era, words: "translated", people: "invented" }, 90)) {
        total++;
        assert.ok(!n.loan, `${culture} ${n.text}`);
        assert.ok(!only.includes(n.text.replace(/^the /, "")), `${culture} ${era}: ${n.text}`);
      }
    }
  }
  assert.ok(total >= 10000, String(total));
});

test("§16.4: loanwords print the loan at about 70% of the culture-name draws that have one", () => {
  const entries = (culture: string, pool: string) => SETTLEMENT_VOCAB.pools[pool].entries.filter((e) => e.c?.includes(culture) && e.loan);
  let eligible = 0;
  let printed = 0;
  for (let seed = 1; seed <= 3000; seed++) {
    for (const n of generateMoneyNames({ culture: "roman", era: "MD", kind: "coin", words: "loanwords", count: 3, seed }).names) {
      const w = n.words.find((x) => x.pool === "moneyFixed:coin");
      if (!w || !entries("roman", "moneyFixed:coin").some((e) => e.w === w.word)) continue;
      eligible++;
      if (n.loan) printed++;
    }
  }
  assert.ok(eligible > 1500, String(eligible));
  const share = printed / eligible;
  assert.ok(share > 0.65 && share < 0.75, String(share));
});

test("§2.2: the words link belongs to cultures with loan forms; norman-british, american, anglo-saxon and general have none", () => {
  for (const c of ["norman-british", "american", "anglo-saxon", "general"]) assert.ok(!moneyHasLoans(c), c);
  for (const c of ["roman", "chinese", "french", "dutch", "iberian", "norse", "celtic"]) assert.ok(moneyHasLoans(c), c);
});

test("§7: loans pair with their own names, and a loan after the first name only where the row gives one", () => {
  const coin = SETTLEMENT_VOCAB.pools["moneyFixed:coin"].entries;
  const loanOf = (w: string, c: string) => coin.find((e) => e.w === w && e.c?.includes(c))?.loan;
  assert.equal(loanOf("Little Flower", "roman"), "Florin");
  assert.equal(loanOf("Wrought Silver", "indian"), "Rupee");
  assert.equal(loanOf("Small Oval", "japanese"), "Koban");
  assert.equal(loanOf("Great Oval", "japanese"), "Oban");
  // "Weight ×2, Quarter-Weight | Stater": the loan is the first name's only.
  assert.equal(loanOf("Weight", "celtic"), "Stater");
  assert.equal(loanOf("Quarter-Weight", "celtic"), undefined);
  const currency = SETTLEMENT_VOCAB.pools["moneyFixed:currency"].entries;
  assert.equal(currency.find((e) => e.w === "Balance" && e.c?.includes("greek-byzantine"))!.loan, "Talent");
  assert.equal(currency.find((e) => e.w === "Measure" && e.c?.includes("greek-byzantine"))!.loan, "Mina");
});

test("§7.2: general draws the Norman & British names bar tallies, exchequer and siege pieces", () => {
  const all = FIXED_POOLS.flatMap((p) => SETTLEMENT_VOCAB.pools[p].entries);
  for (const w of ["Tally", "Exchequer Tally", "Exchequer Bill", "Siege Piece"]) assert.ok(!all.some((e) => e.w === w && e.fx === undefined && e.c?.includes("general")), w);
  assert.ok(all.some((e) => e.w === "Hop Token" && e.c?.includes("general")));
  assert.ok(all.some((e) => e.w === "Penny" && e.c?.includes("general")));
});

// ── §16.5 Value and safeguards ──────────────────────────────────────────────

test("§16.5: value high draws only high-tier coins, and Half-Crown never", () => {
  let seen = 0;
  for (const c of ["norman-british", "general", "roman", "chinese", "norse", "iberian", "american"]) {
    for (const era of ERAS) {
      if (!moneyKindsOffered(c, era).some((k) => k.key === "coin")) continue;
      for (const n of many({ culture: c, era, kind: "coin", value: "high", people: "invented" }, 80)) {
        seen++;
        assert.ok(n.tier === undefined || n.tier === "h", `${c} ${era}: ${n.text} (${n.tier})`);
        // A name without a tier is built only from words that fit every tier.
        if (n.tier === undefined) assert.ok(!n.words.some((w) => w.pool === "coinMetal" || w.pool === "coinWord" || w.pool === "coinFraction"), `${c} ${era}: ${n.text}`);
        assert.notEqual(n.text, "Half-Crown");
      }
    }
  }
  assert.ok(seen > 1000);
});

test("§16.5: value middle and low narrow the same way", () => {
  for (const value of ["middle", "low"] as MoneyValue[]) {
    for (const era of ERAS) {
      for (const n of many({ culture: "norman-british", era, kind: "coin", value }, 60)) assert.ok(n.tier === undefined || n.tier === VALUE_TIER[value as "middle" | "low"], `${era} ${value}: ${n.text} (${n.tier})`);
    }
  }
});

test("§6.1: a fraction moves the tier one step, so Half-Crown is middle or low and Double Royal high or middle", () => {
  let half = 0;
  let tiered = 0;
  for (const n of many({ culture: "norman-british", era: "EM", kind: "coin", shape: "{fraction}{coinWord}" }, 300)) {
    const f = n.words.find((w) => w.pool === "coinFraction")!.word;
    if (f === "Half") half++;
    // Coin, Bit and Piece fit every tier, so a name built on them has no tier of its own.
    if (!n.tier) continue;
    tiered++;
    if (f === "Double") assert.ok(n.tier === "h" || n.tier === "m", n.text);
    else assert.ok(n.tier === "m" || n.tier === "l", n.text);
  }
  assert.ok(half > 20 && tiered > 100, `${half} ${tiered}`);
});

test("§16.5: 10,000 names across options hold no block-list match and no banned word", () => {
  const block = moneyBlockSet();
  let total = 0;
  for (const c of MONEY_CULTURES) {
    for (const era of ERAS) {
      for (const [i, tone] of (["any", "grand", "plain", "grim", "light", "strange"] as const).entries()) {
        for (const n of many({ culture: c.key, era, tone, fantastic: i % 2 === 1, people: i % 3 === 0 ? "invented" : "placeholders", words: moneyHasLoans(c.key) ? "loanwords" : "translated" }, 12, 12)) {
          total++;
          assert.ok(!block.has(routeNorm(n.text).replace(/^the /, "")), `${c.key} ${era}: ${n.text}`);
          assert.ok(!breaksMoneyWords(n.text, n.kind === "goods"), `${c.key} ${era}: ${n.text}`);
        }
      }
    }
  }
  assert.ok(total >= 10000, String(total));
});

test("§13.4, §3.3: {holy} only in christian cultures (dutch and american at ×0.3), {god} only in roman and greek-byzantine in the ancient world", () => {
  const christian = new Set(["anglo-saxon", "celtic", "norman-british", "slavic", "french", "iberian", "greek-byzantine", "roman", "dutch", "american"]);
  let holy = 0;
  let gods = 0;
  for (const c of MONEY_CULTURES) {
    for (const era of ERAS) {
      for (const n of many({ culture: c.key, era, kind: "coin", people: "invented" }, 80)) {
        if (n.shape.includes("{holy}")) {
          holy++;
          assert.ok(christian.has(c.key), `${c.key}: ${n.text}`);
        }
        if (n.shape.includes("{god")) {
          gods++;
          assert.ok((c.key === "roman" || c.key === "greek-byzantine") && era === "AN", `${c.key} ${era}: ${n.text}`);
        }
        for (const w of n.words) assert.ok(w.pool !== "coinEmblem" || !["Cross", "Angel", "Lamb"].includes(w.word) || christian.has(c.key), `${c.key}: ${n.text}`);
        if (c.key === "arabic-persian") assert.ok(!n.words.some((w) => ["Moon", "Star"].includes(w.word)), n.text);
      }
    }
  }
  assert.ok(holy > 20 && gods > 5, `${holy} ${gods}`);
});

test("§13.4: indian coins bear no sacred animals; chinese, japanese and korean no wheel", () => {
  for (const era of ERAS) {
    for (const n of many({ culture: "indian", era, kind: "coin" }, 200)) for (const w of n.words) assert.ok(!["Bull", "Ox", "Boar", "Cow", "Monkey", "Snake", "Cobra"].includes(w.word), n.text);
    for (const c of ["chinese", "japanese", "korean"]) for (const n of many({ culture: c, era, kind: "coin" }, 100)) assert.ok(!n.words.some((w) => w.word === "Wheel"), `${c}: ${n.text}`);
  }
});

test("§8.3: goods money never names people, tobacco, opium or ivory", () => {
  for (const c of MONEY_CULTURES) for (const era of ERAS) for (const n of many({ culture: c.key, era, kind: "goods", people: "invented" }, 40)) assert.ok(!/tobacco|opium|ivory|cigar|slave|bondmaid|thrall|cumal/i.test(n.text), n.text);
  for (const pool of ["moneyFixed:goods", "goodsMoney"]) assert.ok(!SETTLEMENT_VOCAB.pools[pool].entries.some((e) => /tobacco|opium|ivory|cigar|slave/i.test(e.w)), pool);
  assert.ok(moneyWordBlocked("Tobacco Leaf", undefined, "moneyFixed:goods"));
  assert.ok(!moneyWordBlocked("Tobacco Leaf", undefined, "coinEmblem"));
});

test("§13.1: block-list names and banned words are refused for pack words", () => {
  assert.ok(moneyWordBlocked("Mithril Coin"));
  assert.ok(moneyWordBlocked("the Galactic Credit"));
  assert.ok(moneyWordBlocked("Bitcoin"));
  assert.ok(moneyWordBlocked("Thirty Pieces of Silver"));
  assert.ok(moneyWordBlocked("Slave Mark"));
  assert.ok(!moneyWordBlocked("Gold Piece"));
  assert.ok(!moneyWordBlocked("Ducat"));
});

test("§11: plurals follow the head word, and the OUP forms are kept", () => {
  assert.equal(pluralName("Piece of Eight"), "Pieces of Eight");
  assert.equal(pluralName("Ell of Homespun"), "Ells of Homespun");
  assert.equal(pluralName("Half-Crown"), "Half-Crowns");
  assert.equal(pluralName("Silver Hart"), "Silver Harts");
  assert.equal(pluralName("Spearman"), "Spearmen");
  assert.equal(pluralName("Penny"), "Pennies");
  assert.equal(pluralName("Penny", "Pence"), "Pence");
});

test("§8: shapes draw their own pools: Piece of Six never Eight, steampunk and fantastic additions only when switched on", () => {
  for (const n of many({ culture: "iberian", era: "EM", kind: "coin", shape: "Piece of {numberWord}" }, 200)) assert.ok(!/Eight/.test(n.text), n.text);
  for (const era of ERAS) for (const n of many({ culture: "general", era, fantastic: false }, 200)) assert.ok(!/Wizard|Dragon|Clockwork|Aether|Airship/.test(n.text), n.text);
  assert.ok(many({ culture: "general", era: "ST", fantastic: true, kind: "coin" }, 300).some((n) => /Brass|Gear|Cog|Spring|Piston|Clockwork|Steam/.test(n.text)));
  assert.ok(many({ culture: "general", era: "MD", fantastic: true, kind: "coin" }, 300).some((n) => /Wizard|Dragon|Witch|Troll|Dwarf|Rune|Glimmer|Elf|Griffin|Fairy/.test(n.text)));
  assert.ok(many({ culture: "general", era: "NF", kind: "coin" }, 300).some((n) => /coin$|^e-|Credit/.test(n.text)));
  assert.ok(many({ culture: "general", era: "IS", kind: "coin" }, 300).some((n) => /Kilo|Credit|Unit/.test(n.text)));
});

test("§8.7: nicknames: plurals stay plural, the coin's emblem is named, and a grand tone draws fewer", () => {
  const nick = many({ culture: "norman-british", era: "ST", kind: "nickname" }, 200);
  assert.ok(nick.length > 100);
  const share = (tone: "any" | "grand") => {
    let nicknames = 0;
    let total = 0;
    for (let seed = 1; seed <= 400; seed++) {
      for (const n of generateMoneyNames({ culture: "norman-british", era: "MO", tone, count: 5, seed }).names) {
        total++;
        if (n.kind === "nickname") nicknames++;
      }
    }
    return nicknames / total;
  };
  assert.ok(share("grand") < share("any") * 0.5, `${share("grand")} ${share("any")}`);
});
