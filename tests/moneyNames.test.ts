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

// ── §16.6 Series ────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";
import { countText, findMoneyLadder, MONEY_LADDERS, moneyHasLadder, moneyLaddersFor, SERIES_KINDS } from "../src/money/engine";

const TIER_ORDER = ["h", "m", "l"];

test("§16.6: a coinage has 3 to 5 coins, tiers that never rise, and no emblem twice", () => {
  const sizes = new Set<number>();
  for (const [culture, era] of [["norman-british", "EM"], ["norman-british", "MD"], ["greek-byzantine", "AN"], ["chinese", "MD"], ["general", "ST"], ["norse", "AN"], ["iberian", "EM"]] as const) {
    for (let seed = 1; seed <= 60; seed++) {
      const b = generateMoneyNames({ culture, era, kind: "coin", series: "coinage", people: "invented", count: 8, seed });
      assert.equal(b.notices.length, 0, `${culture} ${era} ${seed}: ${b.notices}`);
      const coins = b.names;
      assert.ok(coins.length >= 3 && coins.length <= 5, `${culture} ${era} ${seed}: ${coins.map((n) => n.text)}`);
      sizes.add(coins.length);
      const tiers = coins.map((n) => TIER_ORDER.indexOf(n.tier!));
      assert.ok(tiers.every((t) => t >= 0), coins.map((n) => n.text).join(", "));
      assert.deepEqual(tiers, [...tiers].sort(), `${culture} ${era} ${seed}: ${coins.map((n) => `${n.text} ${n.tier}`)}`);
      assert.equal(coins[0].tier, "h");
      assert.equal(coins[coins.length - 1].tier, "l");
      const emblems = coins.flatMap((n) => n.words.filter((w) => w.pool === "coinEmblem").map((w) => w.word));
      assert.equal(new Set(emblems).size, emblems.length, coins.map((n) => n.text).join(", "));
      assert.equal(new Set(coins.map((n) => n.text.toLowerCase())).size, coins.length);
    }
  }
  assert.deepEqual([...sizes].sort(), [3, 4, 5]);
});

test("§9: a coinage never has more coins than the batch allows", () => {
  for (const count of [1, 2, 3, 4]) {
    for (let seed = 1; seed <= 20; seed++) assert.ok(generateMoneyNames({ culture: "general", era: "EM", kind: "coin", series: "coinage", count, seed }).names.length <= count);
  }
});

test("§16.6: the place theme draws one town for the whole coinage", () => {
  let places = 0;
  for (let seed = 1; seed <= 400 && places < 12; seed++) {
    const b = generateMoneyNames({ culture: "norman-british", era: "MD", kind: "coin", series: "coinage", people: "invented", count: 8, seed });
    if (b.theme !== "place") continue;
    places++;
    const towns = new Set(b.names.flatMap((n) => n.words.filter((w) => w.pool === "coinWord").map(() => n.text.split(" ")[0])));
    // A step that took a real name has no town; every other step opens with the same one.
    const generated = b.names.filter((n) => n.shape === "{town} {coinWord}");
    assert.ok(generated.length >= 2, b.names.map((n) => n.text).join(", "));
    assert.equal(new Set(generated.map((n) => n.text.replace(/ \S+$/, ""))).size, 1, b.names.map((n) => n.text).join(", "));
    assert.ok(towns.size > 0);
  }
  assert.ok(places >= 12);
});

test("§9: a placeholder town reads [place] on every step", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const b = generateMoneyNames({ culture: "norman-british", era: "MD", kind: "coin", series: "coinage", count: 8, seed });
    if (b.theme === "place") {
      assert.ok(b.names.some((n) => n.text.startsWith("[place] ")));
      return;
    }
  }
  assert.fail("no place theme in 200 seeds");
});

test("§16.6: kind Any, batch 8: a currency first, then the coins, a note or token (early modern on) and a nickname", () => {
  for (const [culture, era] of [["norman-british", "ST"], ["norman-british", "EM"], ["general", "MO"], ["chinese", "EM"], ["roman", "EM"]] as const) {
    for (let seed = 1; seed <= 40; seed++) {
      const b = generateMoneyNames({ culture, era, series: "coinage", count: 8, seed });
      const kinds = b.names.map((n) => n.kind);
      assert.equal(kinds[0], "currency", `${culture} ${era} ${seed}: ${kinds}`);
      assert.equal(kinds[kinds.length - 1], "nickname", `${culture} ${era} ${seed}: ${b.names.map((n) => n.text)}`);
      const coins = kinds.filter((k) => k === "coin").length;
      assert.ok(coins >= 3 && coins <= 5, `${kinds}`);
      assert.deepEqual(kinds.slice(1, 1 + coins), Array(coins).fill("coin"));
      assert.ok(["paper", "scrip"].includes(kinds[kinds.length - 2]), `${culture} ${era} ${seed}: ${kinds}`);
      assert.ok(b.names.length <= 8);
    }
  }
});

test("§9: before the early modern era a kind-Any coinage has no note or token; under 6 names, no currency", () => {
  for (let seed = 1; seed <= 30; seed++) {
    const b = generateMoneyNames({ culture: "roman", era: "AN", series: "coinage", count: 8, seed });
    assert.ok(!b.names.some((n) => n.kind === "paper" || n.kind === "scrip"));
    assert.equal(b.names[0].kind, "currency");
    assert.equal(b.names[b.names.length - 1].kind, "nickname");
    assert.ok(!generateMoneyNames({ culture: "roman", era: "EM", series: "coinage", count: 5, seed }).names.some((n) => n.kind === "currency"));
  }
});

test("§9: series is for Any, coins, early and goods money; other kinds stay each one separate", () => {
  assert.deepEqual(SERIES_KINDS, [undefined, "coin", "early", "goods"]);
  for (const kind of ["paper", "scrip", "currency", "nickname"] as MoneyKind[]) {
    const a = generateMoneyNames({ culture: "norman-british", era: "ST", kind, series: "coinage", count: 6, seed: 3 });
    const b = generateMoneyNames({ culture: "norman-british", era: "ST", kind, series: "separate", count: 6, seed: 3 });
    assert.deepEqual(a.names, b.names, kind);
  }
});

test("§9: early and goods money make a coinage from their own shapes", () => {
  for (const [culture, era, kind] of [["norse", "AN", "early"], ["chinese", "MD", "early"], ["west-african", "EM", "goods"], ["aztec", "EM", "goods"]] as const) {
    const b = generateMoneyNames({ culture, era, kind, series: "coinage", count: 8, seed: 4 });
    assert.ok(b.names.length >= 2 && b.names.every((n) => n.kind === kind), `${culture}: ${b.names.map((n) => n.text)}`);
  }
});

test("§9: the value choice is for separate names; a coinage spans every tier", () => {
  const b = generateMoneyNames({ culture: "norman-british", era: "EM", kind: "coin", series: "coinage", value: "high", count: 8, seed: 9 });
  assert.ok(b.names.some((n) => n.tier === "l"));
});

// ── §16.7 Values ────────────────────────────────────────────────────────────

const BRIEF = readFileSync("docs/money-and-coins-brief.md", "utf8").split("\n");
const section = BRIEF.slice(BRIEF.findIndex((l) => l.startsWith("### 10.2")), BRIEF.findIndex((l) => l.startsWith("### 10.3")));
const BRIEF_ROWS = new Map<string, { source: string; parts: string[] }>();
const BRIEF_V = new Map<string, number[]>();
for (const l of section) {
  const row = l.match(/^\| `([a-z0-9-]+)` \| (.+?) \| (.+) \|$/);
  if (row && row[1] !== "Key") BRIEF_ROWS.set(row[1], { source: row[2].trim(), parts: row[3].split(" · ") });
  const v = l.match(/^\| ([a-z0-9-]+) \| ([0-9, ]+) \|$/);
  if (v) BRIEF_V.set(v[1], v[2].split(",").map((x) => Number(x)));
}

test("§16.7: the ladder table is the brief's: 42 ladders, their sources, step names, loans and v values", () => {
  assert.equal(MONEY_LADDERS.length, 42);
  assert.equal(BRIEF_ROWS.size, 42);
  for (const l of MONEY_LADDERS) {
    const row = BRIEF_ROWS.get(l.key)!;
    assert.ok(row, l.key);
    assert.equal(l.source, row.source, l.key);
    assert.deepEqual(l.steps.map((s) => s.v), BRIEF_V.get(l.key), l.key);
    assert.equal(l.steps.length, row.parts.length, l.key);
    row.parts.forEach((part, i) => {
      const m = part.match(/^([^[=(]+?)(?: \[([^\]]+)\])?(?: \([^)]*\))?(?: = .+)?$/)!;
      assert.equal(l.steps[i].n, m[1].trim(), `${l.key} step ${i}`);
      // A loan written on the step, or inline in the tail above ("100 Ounces [Ore]").
      const above = i > 0 ? row.parts[i - 1].match(/ = [\d,]+ .+? \[([^\]]+)\]$/)?.[1] : undefined;
      assert.equal(l.steps[i].loan, m[2] ?? above, `${l.key} step ${i}`);
    });
  }
});

test("§16.7: every ladder: v strictly decreasing, the lowest is 1, every printed value a whole number, tiers never rise", () => {
  for (const l of MONEY_LADDERS) {
    const v = l.steps.map((s) => s.v);
    assert.equal(v[v.length - 1], 1, l.key);
    for (let i = 0; i < v.length - 1; i++) {
      assert.ok(v[i] > v[i + 1], `${l.key} step ${i}`);
      // The unit is the next step down when it divides, else the largest lower one that does.
      let j = i + 1;
      while (v[i] % v[j] !== 0) j++;
      assert.ok(Number.isInteger(v[i] / v[j]) && v[i] / v[j] >= 2, `${l.key} step ${i}`);
    }
    const t = l.steps.map((s) => TIER_ORDER.indexOf(s.tier));
    assert.deepEqual(t, [...t].sort(), l.key);
  }
});

/** The (culture, era) cell a ladder lives in, and a kind that serves it. */
function cellOf(key: string): { culture: string; era: RouteEra } {
  // The decimal ladder's own names appear before the near future; take its generated cell.
  if (key === "decimal") return { culture: "general", era: "NF" };
  for (const [culture, eras] of Object.entries(MONEY_DATA.ladderCells)) for (const [era, keys] of Object.entries(eras)) if (keys.includes(key)) return { culture, era: era as RouteEra };
  throw new Error(`no cell for ${key}`);
}

test("§16.7: the printed values match the brief exactly when every step takes its real name", () => {
  for (const l of MONEY_LADDERS) {
    const row = BRIEF_ROWS.get(l.key)!;
    // The brief's own text: "Name = n Plural".
    const expected = row.parts.map((part) => {
      const m = part.match(/^([^[=(]+?)(?: \[[^\]]+\])?(?: \([^)]*\))?(?: = ([\d,]+) (.+?)(?: \[[^\]]+\])?)?$/)!;
      return m[2] ? `${m[1].trim()} (${m[2]} ${m[3]})` : m[1].trim();
    });
    const { culture, era } = cellOf(l.key);
    const b = generateMoneyNames({ culture, era, series: "values", ladder: l.key, realShare: 1, words: "translated", count: 12, seed: 5 });
    assert.equal(b.ladder, l.key);
    const lines = b.names.filter((n) => n.step !== undefined).map((n) => n.text);
    assert.deepEqual(lines, expected, l.key);
    assert.equal(b.notices[0], `Values: ${l.source}.`);
  }
});

test("§10.5: the example: Gold Lion (20 Silver Harts), with the ladder's source under the batch", () => {
  const b = generateMoneyNames({ culture: "norman-british", era: "MD", series: "values", ladder: "english-md", realShare: 1, kind: "coin", count: 8, seed: 1 });
  assert.deepEqual(
    b.names.map((n) => n.text),
    ["Noble (20 Groats)", "Groat (4 Pence)", "Penny (4 Farthings)", "Farthing"],
  );
  assert.deepEqual(b.notices, ["Values: Medieval English coinage (1351–1464)."]);
});

test("§10.5: a generated step's name is used in the value of the step above it", () => {
  let checked = 0;
  for (const l of MONEY_LADDERS) {
    const { culture, era } = cellOf(l.key);
    if (l.decimal) continue;
    for (let seed = 1; seed <= 6; seed++) {
      const b = generateMoneyNames({ culture, era, series: "values", ladder: l.key, realShare: 0, count: 12, seed });
      const steps = b.names.filter((n) => n.step !== undefined);
      assert.equal(steps.length, l.steps.length, `${l.key}: ${b.names.map((n) => n.text)}`);
      steps.forEach((n, i) => {
        assert.ok(!n.real, l.key);
        if (i === steps.length - 1) return assert.equal(n.value, undefined);
        let j = i + 1;
        while (l.steps[i].v % l.steps[j].v !== 0) j++;
        assert.equal(n.value, `${countText(l.steps[i].v / l.steps[j].v)} ${pluralName(steps[j].name)}`, `${l.key}: ${n.text}`);
        assert.equal(n.text, `${n.name} (${n.value})`);
        checked++;
      });
    }
  }
  assert.ok(checked > 200);
});

test("§10.4: a generated step takes the ladder's tier and metal", () => {
  const seen = new Set<string>();
  for (let seed = 1; seed <= 60; seed++) {
    const b = generateMoneyNames({ culture: "norman-british", era: "ST", kind: "coin", series: "values", ladder: "english-st", realShare: 0, people: "invented", count: 8, seed });
    const tiers = b.names.map((n) => n.tier);
    assert.deepEqual(tiers, ["h", "m", "m", "l", "l"]);
    b.names.forEach((n) => {
      const metals = n.words.filter((w) => w.pool === "coinMetal").map((w) => w.word);
      for (const m of metals) seen.add(m);
      if (n.tier === "h" && metals.length > 0) assert.equal(metals[0], "Gold", n.text);
      if (n.tier === "m" && metals.length > 0) assert.equal(metals[0], "Silver", n.text);
    });
  }
  assert.ok(seen.has("Gold") && seen.has("Silver"));
});

test("§10.3: real names share is about 40% of a valued coinage's steps", () => {
  let real = 0;
  let total = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const b = generateMoneyNames({ culture: "norman-british", era: "ST", kind: "coin", series: "values", ladder: "english-st", count: 8, seed });
    for (const n of b.names) {
      total++;
      if (n.real) real++;
    }
  }
  assert.ok(real / total > 0.34 && real / total < 0.46, String(real / total));
});

test("§10.3: loanwords print a ladder step's loan form 70% of the time", () => {
  let loans = 0;
  let eligible = 0;
  for (let seed = 1; seed <= 400; seed++) {
    const b = generateMoneyNames({ culture: "roman", era: "AN", kind: "coin", series: "values", ladder: "roman-augustan", realShare: 1, words: "loanwords", count: 8, seed });
    // The lowest step, Quarter, has no loan form.
    for (const n of b.names.filter((x) => x.step !== undefined && x.step < 4)) {
      eligible++;
      if (n.loan) loans++;
      if (n.loan) assert.ok(["Aureus", "Denarius", "Sesterce", "As"].includes(n.name), n.name);
    }
  }
  assert.ok(loans / eligible > 0.62 && loans / eligible < 0.78, String(loans / eligible));
  // Translated names never show a loan.
  const t = generateMoneyNames({ culture: "roman", era: "AN", kind: "coin", series: "values", ladder: "roman-augustan", realShare: 1, count: 8, seed: 2 });
  assert.deepEqual(t.names.map((n) => n.name), ["Golden", "Ten-Piece", "Two-and-a-Half", "Unit", "Quarter"]);
});

test("§10.3: which ladder: the cell table, 50/50 where a cell holds two, and none where a dash stands", () => {
  const cells = MONEY_DATA.ladderCells;
  assert.deepEqual(cells["norman-british"].ST, ["english-st"]);
  assert.deepEqual(cells["norman-british"].MO, ["english-st", "uk-decimal"]);
  assert.deepEqual(cells.roman.AN, ["roman-augustan", "roman-late"]);
  assert.deepEqual(cells.slavic.AN, []);
  assert.deepEqual(cells.chinese.NF, ["decimal"]);
  assert.deepEqual(cells.chinese.IS, ["decimal"]);
  const picks = new Map<string, number>();
  for (let seed = 1; seed <= 400; seed++) {
    const key = generateMoneyNames({ culture: "norman-british", era: "MO", series: "values", count: 8, seed }).ladder!;
    picks.set(key, (picks.get(key) ?? 0) + 1);
  }
  assert.ok((picks.get("english-st") ?? 0) > 150 && (picks.get("uk-decimal") ?? 0) > 150, JSON.stringify([...picks]));
});

test("§16.7: for every culture × era × kind cell marked – in the ladder table, 'with values' is not offered and runs as a coinage", () => {
  let dashes = 0;
  for (const c of MONEY_CULTURES) {
    for (const era of ERAS) {
      const cell = MONEY_DATA.ladderCells[c.key][era];
      for (const kind of [undefined, "coin", "early", "goods"] as (MoneyKind | undefined)[]) {
        const ladders = moneyLaddersFor(c.key, era, kind);
        assert.equal(moneyHasLadder(c.key, era, kind), ladders.length > 0);
        if (cell.length === 0) {
          dashes++;
          assert.equal(ladders.length, 0, `${c.key} ${era} ${kind}`);
          const b = generateMoneyNames({ culture: c.key, era, kind, series: "values", count: 8, seed: 2 });
          assert.equal(b.ladder, undefined);
          assert.ok(!b.notices.some((n) => n.startsWith("Values:")), `${c.key} ${era} ${kind}`);
        }
      }
    }
  }
  assert.ok(dashes > 20);
});

test("§10.3: the ladder serves its kinds: coin ladders Any and coins, goods ladders Any and goods, ingot ladders Any, coins and early", () => {
  const serves = (key: string) => findMoneyLadder(key)!.serves;
  assert.deepEqual(serves("english-st"), ["any", "coin"]);
  for (const k of ["deben-kite", "irish-cattle", "icelandic-homespun", "cowrie-lagos", "aztec-cacao", "japanese-rice"]) assert.deepEqual(serves(k), ["any", "goods"], k);
  for (const k of ["mesopotamian", "yuan-ingot"]) assert.deepEqual(serves(k), ["any", "coin", "early"], k);
  assert.deepEqual(moneyLaddersFor("egyptian", "AN", "coin").map((l) => l.key), []);
  assert.deepEqual(moneyLaddersFor("egyptian", "AN", "goods").map((l) => l.key), ["deben-kite"]);
  assert.deepEqual(moneyLaddersFor("arabic-persian", "AN", "early").map((l) => l.key), ["mesopotamian"]);
  assert.deepEqual(moneyLaddersFor("arabic-persian", "AN", "coin").map((l) => l.key), ["achaemenid", "mesopotamian"]);
  assert.deepEqual(moneyLaddersFor("norman-british", "ST", "paper"), []);
});

test("§10.3: a goods ladder in a valued coinage uses goods shapes; an ingot ladder early shapes", () => {
  const goods = generateMoneyNames({ culture: "west-african", era: "EM", kind: "goods", series: "values", realShare: 0, count: 8, seed: 3 });
  assert.equal(goods.ladder, "cowrie-lagos");
  assert.ok(goods.names.every((n) => n.kind === "goods"));
  assert.deepEqual(goods.names.map((n) => n.tier), ["h", "m", "l", "l"]);
  const ingots = generateMoneyNames({ culture: "steppe", era: "MD", kind: "early", series: "values", realShare: 0, count: 8, seed: 3 });
  assert.equal(ingots.ladder, "yuan-ingot");
  assert.ok(ingots.names.every((n) => n.kind === "early"));
});

test("§10.3: decimal ladders take the culture's own names, the near future and beyond generate them", () => {
  const bantu = generateMoneyNames({ culture: "bantu", era: "MO", kind: "coin", series: "values", ladder: "decimal", realShare: 1, count: 8, seed: 1 });
  assert.ok(["Mountain", "River"].some((u) => bantu.names[0].name === u) || bantu.names[0].name === "Shilling" || bantu.names[0].name === "Dawn" || bantu.names[0].name === "Rain", bantu.names[0].text);
  const french = generateMoneyNames({ culture: "french", era: "MO", kind: "coin", series: "values", ladder: "decimal", realShare: 1, count: 8, seed: 1 });
  assert.equal(french.names[2].name, "Hundredth");
  const nf = generateMoneyNames({ culture: "general", era: "NF", kind: "coin", series: "values", ladder: "decimal", realShare: 1, count: 8, seed: 1 });
  assert.deepEqual(nf.names.map((n) => n.text), ["Unit (10 Tenths)", "Tenth (10 Hundredths)", "Hundredth"]);
});

test("§10.1: no ratio is invented: every printed count comes from a ladder's v values", () => {
  const allowed = new Set<number>();
  for (const l of MONEY_LADDERS) for (let i = 0; i < l.steps.length - 1; i++) for (let j = i + 1; j < l.steps.length; j++) if (l.steps[i].v % l.steps[j].v === 0) allowed.add(l.steps[i].v / l.steps[j].v);
  for (const c of MONEY_CULTURES) {
    for (const era of ERAS) {
      for (let seed = 1; seed <= 3; seed++) {
        const b = generateMoneyNames({ culture: c.key, era, series: "values", count: 10, seed });
        for (const n of b.names) {
          if (n.value === undefined) continue;
          const count = Number(n.value.split(" ")[0].replace(/,/g, ""));
          assert.ok(allowed.has(count), `${c.key} ${era}: ${n.text}`);
        }
      }
    }
  }
});

test("§10.5: the source line is a notice, never a name", () => {
  const b = generateMoneyNames({ culture: "norman-better" as never, era: "ST", series: "values", count: 8, seed: 1 });
  assert.ok(!b.names.some((n) => n.text.startsWith("Values:")));
  assert.equal(b.notices.filter((n) => n.startsWith("Values:")).length, 1);
});

test("§10.5: figures take a comma for thousands", () => {
  assert.equal(countText(1000), "1,000");
  assert.equal(countText(24000), "24,000");
  assert.equal(countText(648000), "648,000");
  assert.equal(countText(999), "999");
});
