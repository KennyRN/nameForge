// Named things (docs/named-things-brief.md): arms and armour, treasures and regalia, books and writings.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BUILT_IN_VOCAB, POOL_NAMES, SETTLEMENT_VOCAB, THING_KINDS } from "../src/settlement/vocab";
import { hasBannedWord, GROUP_TONES } from "../src/groups/engine";
import { MONEY_DATA } from "../src/money/engine";
import thingsData from "../src/data/named-things.json";

interface Shape { m: string; fam: string; w: number; p: (string | { p: string; k?: string[]; e?: string; fam?: string })[]; k: string[] | "*"; e: string; t?: string[]; c?: string[]; fixed?: boolean }
const DATA = thingsData as unknown as {
  modules: { key: string }[];
  kinds: { module: string; key: string; era: number[] }[];
  families: string[];
  leanings: Record<string, Record<string, number>>;
  shapes: Shape[];
  safeguards: { block: string[]; banned: string[]; gunBrands: string[]; bannedFromMoney: boolean };
};

/** Whole-name match: case, spaces, hyphens, apostrophes and a leading "the" ignored (so Leg-Biter meets Legbiter). */
const squash = (s: string) => s.toLowerCase().replace(/^the\s+/, "").replace(/[\s\-'’]/g, "");
const BLOCK = new Set(DATA.safeguards.block.map(squash));
const BANNED_RE = [...DATA.safeguards.banned, ...(DATA.safeguards.bannedFromMoney ? MONEY_DATA.safeguards.banned : [])].map((w) => new RegExp(`(^|[^\\p{L}])${w}($|[^\\p{L}])`, "iu"));
const KINDS_OF = (module: string) => DATA.kinds.filter((k) => k.module === module).map((k) => k.key);
const ALL_KINDS = DATA.kinds.map((k) => k.key);
const THING_POOLS = ["thingObject", "deedTarget", "deedVerb", "thingAgent", "thingMood", "kenningFirst", "kenningSecond", "thingBodyPart", "thingQuality", "thingVirtue", "lightPlace", "thingSound", "thingFate", "thingPlenty", "thingFlower", "thingGiven", "thingTemper", "thingDomain", "scholarGroup", "bookSubject", "bookPlace", "bookTreasure", "bookOpening", "sageWord", "bookSecret", "officeWord"];

// ── §16.1 Data ──────────────────────────────────────────────────────────────

test("§16.1: the kinds are the brief's thirty, with their era weights", () => {
  assert.deepEqual(KINDS_OF("arms"), ["sword", "axe", "spear", "bow", "mace", "knife", "shield", "armour", "gun", "cannon"]);
  assert.equal(KINDS_OF("treasure").length, 12);
  assert.equal(KINDS_OF("book").length, 8);
  assert.deepEqual(THING_KINDS, ALL_KINDS);
  assert.deepEqual(DATA.kinds.find((k) => k.key === "cannon")!.era, [0, 4, 19, 40, 45, 25, 25]);
  assert.deepEqual(DATA.kinds.find((k) => k.key === "paper")!.era, [0, 0, 8, 25, 25, 15, 15]);
});

test("§16.1: every pool entry is valid, and every k names a kind", () => {
  for (const pool of THING_POOLS) {
    assert.ok(POOL_NAMES.includes(pool), pool);
    const entries = SETTLEMENT_VOCAB.pools[pool].entries;
    assert.ok(entries.length > 0, pool);
    for (const e of entries) {
      assert.ok(e.w.length > 0 && !/[()§×?→]/.test(e.w), `${pool}: ${e.w}`);
      for (const t of e.t ?? []) assert.ok(GROUP_TONES.includes(t), `${pool} ${e.w}: ${t}`);
      for (const k of e.k ?? []) assert.ok(ALL_KINDS.includes(k), `${pool} ${e.w}: kind ${k}`);
      if (pool === "thingObject") assert.ok(e.k && e.k.length === 1, `${e.w}: one kind`);
      if (e.g) assert.ok(["m", "f"].includes(e.g));
    }
  }
  // Every kind but relic has object words.
  const withObjects = new Set(SETTLEMENT_VOCAB.pools.thingObject.entries.flatMap((e) => e.k ?? []));
  for (const k of ALL_KINDS) assert.equal(withObjects.has(k), k !== "relic", k);
  // Spot checks: the multipliers and the restrictions.
  const horn = BUILT_IN_VOCAB.pools.thingObject.entries.filter((e) => e.w === "Horn" && e.k![0] === "cup");
  assert.deepEqual(horn.map((e) => e.x), [2, 4]);
  assert.deepEqual(BUILT_IN_VOCAB.pools.thingObject.entries.filter((e) => e.w === "Torc").map((e) => [e.c, e.x, e.e]), [[["celtic"], 3, ["AN", "MD"]]]);
});

test("§16.1: every shape's kinds exist, and every family is in §8.1", () => {
  for (const s of DATA.shapes) {
    assert.ok(DATA.families.includes(s.fam), `${s.p}: ${s.fam}`);
    assert.ok(DATA.modules.some((m) => m.key === s.m));
    const kinds = s.k === "*" ? KINDS_OF(s.m) : s.k;
    for (const k of kinds) assert.ok(KINDS_OF(s.m).includes(k), `${s.p[0]}: ${k}`);
    for (const p of s.p) {
      const pat = typeof p === "string" ? p : p.p;
      assert.ok(pat.length > 0);
      if (typeof p !== "string") {
        if (p.fam) assert.ok(DATA.families.includes(p.fam));
        for (const k of p.k ?? []) assert.ok(KINDS_OF(s.m).includes(k), `${pat}: ${k}`);
      }
    }
  }
  for (const fam of Object.values(DATA.leanings).flatMap((l) => Object.keys(l))) assert.ok(DATA.families.includes(fam), fam);
  assert.equal(Object.keys(DATA.leanings).length, 20);
});

test("§16.1: no fixed shape and no pool entry matches the block list or a banned word", () => {
  // The brief also blocks Answerer and Widowmaker (agent words) whole: the shape redraws them, so they are never output.
  const KNOWN = new Set(["Answerer", "Widowmaker"]);
  for (const s of DATA.shapes) {
    for (const p of s.p) {
      const pat = typeof p === "string" ? p : p.p;
      if (!pat.includes("{")) assert.ok(!BLOCK.has(squash(pat)), `blocked fixed shape ${pat}`);
      assert.ok(!hasBannedWord(pat) && !BANNED_RE.some((re) => re.test(pat)), pat);
    }
  }
  // A pool word is a whole name only where a shape uses it alone (thingMood, bookOpening, and thingAgent after "the");
  // elsewhere it is part of a longer name (Sting in Wasp's Sting).
  const ALONE = ["thingMood", "bookOpening", "thingAgent"];
  for (const pool of THING_POOLS) {
    for (const e of SETTLEMENT_VOCAB.pools[pool].entries) {
      if (ALONE.includes(pool) && BLOCK.has(squash(e.w))) assert.ok(pool === "thingAgent" && KNOWN.has(e.w), `${pool}: ${e.w}`);
      assert.ok(!hasBannedWord(e.w) && !BANNED_RE.some((re) => re.test(e.w)), `${pool}: ${e.w}`);
      // DS's deity words run on every generated name (a rejected word, such as the Demon target, is simply never output).
    }
  }
});

test("§16.1: the pool register lists every new pool", () => {
  const register = readFileSync("docs/vocabulary-pools.md", "utf8");
  for (const p of THING_POOLS) assert.ok(register.includes(`| \`${p}\` |`), p);
});
