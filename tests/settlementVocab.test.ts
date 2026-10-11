// Shared settlement vocabulary and vocabulary packs (Route names brief §15.1–§15.2).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  BUILT_IN_VOCAB,
  mergeVocabularyPacks,
  POOL_NAMES,
  poolEntries,
  SETTLEMENT_VOCAB,
  VOCAB_CULTURE_GROUPS,
  VOCAB_CULTURES,
  VOCAB_ERAS,
  VOCAB_REGION_TAGS,
  VOCABULARY_PACK_TEMPLATE,
  type VocabEntry,
  type Vocabulary,
  type VocabWhere,
} from "../src/settlement/vocab";
import { createVocabularyPack, readVocabularyPacks } from "../src/settlement/vocabPacks";
import { GROUP_TONES } from "../src/groups/engine";

const where = (culture: string, era: VocabWhere["era"] = "MD", fantastic = false): VocabWhere => ({ culture, era, fantastic });
const words = (vocab: Vocabulary, pool: string, w: VocabWhere) => poolEntries(vocab, pool, w).map(([e]) => e.w);
const weightOf = (vocab: Vocabulary, pool: string, w: VocabWhere, word: string) => poolEntries(vocab, pool, w).find(([e]) => e.w === word)?.[1];
const entryOf = (vocab: Vocabulary, pool: string, w: VocabWhere, word: string) => poolEntries(vocab, pool, w).find(([e]) => e.w === word)?.[0];

// ── §15.1 Vocabulary ────────────────────────────────────────────────────────

test("§15.1: every entry has w; tones, eras, cultures and region tags are valid; no stray characters", () => {
  const cultureKeys = new Set([...VOCAB_CULTURES, ...VOCAB_CULTURE_GROUPS]);
  const check = (pool: string, e: VocabEntry) => {
    assert.ok(typeof e.w === "string" && e.w.length > 0, `${pool}: entry without w`);
    assert.ok(!/[()§×?→]/.test(e.w), `${pool}: “${e.w}”`);
    for (const t of e.t ?? []) assert.ok(GROUP_TONES.includes(t), `${pool} ${e.w}: tone ${t}`);
    for (const era of e.e ?? []) assert.ok(VOCAB_ERAS.includes(era), `${pool} ${e.w}: era ${era}`);
    for (const c of e.c ?? []) assert.ok(cultureKeys.has(c.replace(/^!/, "")), `${pool} ${e.w}: culture ${c}`);
    if (e.r) assert.ok(VOCAB_REGION_TAGS.includes(e.r), `${pool} ${e.w}: region ${e.r}`);
    if (e.x !== undefined) assert.ok(e.x > 0, `${pool} ${e.w}: weight`);
    if (e.h !== undefined) assert.equal(typeof e.h, "boolean");
  };
  for (const [name, pool] of Object.entries(SETTLEMENT_VOCAB.pools)) {
    for (const e of pool.entries) check(name, e);
    for (const [culture, entries] of Object.entries(pool.cultureExtra ?? {})) {
      assert.ok(VOCAB_CULTURES.includes(culture), `${name}: cultureExtra ${culture}`);
      for (const e of entries) check(name, e);
    }
  }
  assert.equal(VOCAB_CULTURES.length, 22);
});

test("§6: the pools exist, with the fixed whole-name pool for every kind", () => {
  for (const p of ["direction", "directionAdj", "travellers", "routeFeature", "routeMaterial", "routeLandform", "routeGoods", "holySite", "holySitePl", "dayNumber", "jFeature", "romanRoadNomen", "spaceGoods", "skyPath"]) {
    assert.ok(POOL_NAMES.includes(p), p);
  }
  for (const k of ["road", "trade", "pilgrim", "military", "drove", "sea", "rail", "motor", "space"]) assert.ok(POOL_NAMES.includes(`routeFixed:${k}`), k);
});

test("§3.4: the pool register lists every pool", () => {
  const register = readFileSync("docs/vocabulary-pools.md", "utf8");
  for (const p of POOL_NAMES) assert.ok(register.includes(`| \`${p}\` |`), p);
});

test("§3.1, §6: eras, cultures and culture extras filter and weight the pools", () => {
  // Colliers in the steam age only; Monks for christian cultures (greek-byzantine from MD).
  assert.ok(words(BUILT_IN_VOCAB, "travellers", where("general", "ST")).includes("Colliers"));
  assert.ok(!words(BUILT_IN_VOCAB, "travellers", where("general", "MD")).includes("Colliers"));
  assert.ok(words(BUILT_IN_VOCAB, "travellers", where("slavic")).includes("Monks"));
  assert.ok(!words(BUILT_IN_VOCAB, "travellers", where("japanese")).includes("Monks"));
  assert.ok(!words(BUILT_IN_VOCAB, "travellers", where("greek-byzantine", "AN")).includes("Monks"));
  assert.ok(words(BUILT_IN_VOCAB, "travellers", where("greek-byzantine", "MD")).includes("Monks"));
  // Culture extras ×3: new words at 3, words already there tripled.
  assert.equal(weightOf(BUILT_IN_VOCAB, "routeGoods", where("chinese"), "Tea"), 3);
  assert.equal(weightOf(BUILT_IN_VOCAB, "routeGoods", where("chinese"), "Silk"), 3);
  assert.equal(weightOf(BUILT_IN_VOCAB, "routeGoods", where("roman"), "Salt"), 9);
  assert.equal(weightOf(BUILT_IN_VOCAB, "routeGoods", where("general"), "Tea"), undefined);
});

// ── §15.2 Vocabulary packs ──────────────────────────────────────────────────

const PACK = `---
type: vocabulary
---

## travellers
- Tinsmiths
- Salt-Wives ×0.5
- Corpse Bearers (grim)
- Lantern Men ×2 (strange)

## routeGoods · japanese
- Lacquer

## routeGoods · MD
- Wax Candles

## routeGoods · japanese · EM
- Fans
`;

test("§15.2: a pack's words join the pool, narrowed by culture and era, with weights and tones read", () => {
  const { vocab, notices } = mergeVocabularyPacks([{ name: "Vocabulary", content: PACK }]);
  assert.deepEqual(notices, []);
  assert.ok(words(vocab, "travellers", where("general")).includes("Tinsmiths"));
  assert.equal(weightOf(vocab, "travellers", where("general"), "Salt-Wives"), 0.5);
  assert.deepEqual(entryOf(vocab, "travellers", where("general"), "Corpse Bearers")?.t, ["grim"]);
  assert.equal(weightOf(vocab, "travellers", where("general"), "Lantern Men"), 2);
  assert.deepEqual(entryOf(vocab, "travellers", where("general"), "Lantern Men")?.t, ["strange"]);
  // · japanese applies only to japanese; · MD only in MD; both together need both.
  assert.ok(words(vocab, "routeGoods", where("japanese")).includes("Lacquer"));
  assert.ok(!words(vocab, "routeGoods", where("chinese")).includes("Lacquer"));
  assert.ok(words(vocab, "routeGoods", where("chinese", "MD")).includes("Wax Candles"));
  assert.ok(!words(vocab, "routeGoods", where("chinese", "EM")).includes("Wax Candles"));
  assert.ok(words(vocab, "routeGoods", where("japanese", "EM")).includes("Fans"));
  assert.ok(!words(vocab, "routeGoods", where("japanese", "MD")).includes("Fans"));
  assert.ok(!words(vocab, "routeGoods", where("korean", "EM")).includes("Fans"));
  // The built-in pools are untouched.
  assert.ok(!words(BUILT_IN_VOCAB, "travellers", where("general")).includes("Tinsmiths"));
});

test("§15.2: an unknown pool or culture is reported and its section skipped", () => {
  const content = `---\ntype: vocabulary\n---\n\n## wagons\n- Carts\n\n## travellers · elvish\n- Wanderers\n\n## travellers\n- Hawkers\n`;
  const { vocab, notices } = mergeVocabularyPacks([{ name: "Odd words", content }]);
  assert.deepEqual(notices, ["Unknown pool “wagons” in vocabulary pack “Odd words”.", "Unknown culture “elvish” in vocabulary pack “Odd words”."]);
  assert.ok(!words(vocab, "travellers", where("general")).includes("Wanderers"));
  assert.ok(words(vocab, "travellers", where("general")).includes("Hawkers"));
});

test("§15.2: a pack can't remove a built-in word; a blocked or banned word is dropped", () => {
  const content = `---\ntype: vocabulary\n---\n\n## travellers\n- Slaves\n- Watchmen\n\n## routeFixed:road\n- Watling Street\n- Long Causey\n`;
  const blocked = (w: string) => w.toLowerCase() === "watling street";
  const { vocab } = mergeVocabularyPacks([{ name: "V", content }], blocked);
  const travellers = words(vocab, "travellers", where("general"));
  for (const w of words(BUILT_IN_VOCAB, "travellers", where("general"))) assert.ok(travellers.includes(w), w);
  assert.ok(travellers.includes("Watchmen"));
  assert.ok(!travellers.includes("Slaves"));
  const fixed = words(vocab, "routeFixed:road", where("general"));
  assert.ok(fixed.includes("Long Causey"));
  assert.ok(!fixed.includes("Watling Street"));
});

test("§15.2: only vocabulary notes are read as packs", async () => {
  const notes = [
    { basename: "Vocabulary", read: async () => PACK },
    { basename: "Group safeguards", read: async () => "---\ntype: group-safeguards\n---\n" },
  ];
  assert.deepEqual((await readVocabularyPacks(notes)).map((p) => p.name), ["Vocabulary"]);
});

test("§15.2: “Create vocabulary pack” lists every pool as a heading and never overwrites", async () => {
  for (const p of POOL_NAMES) assert.ok(VOCABULARY_PACK_TEMPLATE.includes(`\n## ${p}\n`), p);
  assert.ok(VOCABULARY_PACK_TEMPLATE.startsWith("---\ntype: vocabulary\n---\n"));
  // The template is itself a valid, empty pack.
  assert.deepEqual(mergeVocabularyPacks([{ name: "Vocabulary", content: VOCABULARY_PACK_TEMPLATE }]).notices, []);
  const files = new Map<string, string>();
  const vault = { exists: (p: string) => files.has(p), create: async (p: string, c: string) => void files.set(p, c) };
  assert.equal(await createVocabularyPack(vault, "Names"), "created");
  assert.equal(files.get("Names/Vocabulary.md"), VOCABULARY_PACK_TEMPLATE);
  files.set("Names/Vocabulary.md", "mine");
  assert.equal(await createVocabularyPack(vault, "Names"), "exists");
  assert.equal(files.get("Names/Vocabulary.md"), "mine");
});
