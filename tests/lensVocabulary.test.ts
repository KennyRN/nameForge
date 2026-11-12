// Shared lens brief §5.1: settlement-vocab.json keeps its eras, cultures, cultureGroups and regions
// arrays (packs and tests read them), and each equals what the lens gives: one definition, checked both ways.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cultureMapping, cultureSet, cultureSetKeys, inCultureGroup, LENS_CULTURE_GROUPS, LENS_CULTURE_SET_NAMES, LENS_ERAS, LENS_REGIONS, lensCulture } from "../src/lens";
import { BRITISH_CULTURES } from "../src/routes/engine";
import { CHRISTIAN_FOR_TEST } from "./lensVocabularyHelpers";
import { inCultureGroup as vocabInCultureGroup, SETTLEMENT_VOCAB, VOCAB_ALL_CULTURES } from "../src/settlement/vocab";

test("the vocabulary's eras are the lens's eras, in order", () => {
  assert.deepEqual(SETTLEMENT_VOCAB.eras, LENS_ERAS.map((e) => e.code));
});

test("the vocabulary's cultures are the lens's 'shared' roster (both ways)", () => {
  const shared = Object.keys(cultureMapping("shared"));
  assert.deepEqual([...SETTLEMENT_VOCAB.cultures].sort(), [...shared].sort());
  assert.deepEqual([...VOCAB_ALL_CULTURES].sort(), [...shared].sort());
});

test("the vocabulary's culture groups are the lens's, key for key", () => {
  assert.deepEqual(SETTLEMENT_VOCAB.cultureGroups, LENS_CULTURE_GROUPS);
  assert.deepEqual(Object.keys(SETTLEMENT_VOCAB.cultureGroups), Object.keys(LENS_CULTURE_GROUPS));
});

test("the vocabulary's regions are the lens's live region codes, in order", () => {
  assert.deepEqual(SETTLEMENT_VOCAB.regions, LENS_REGIONS.filter((r) => r.status === "live").map((r) => r.code).sort((a, b) => SETTLEMENT_VOCAB.regions.indexOf(a) - SETTLEMENT_VOCAB.regions.indexOf(b)));
  assert.deepEqual([...SETTLEMENT_VOCAB.regions].sort(), LENS_REGIONS.filter((r) => r.status === "live").map((r) => r.code).sort());
});

test("settlement/vocab re-exports the lens's inCultureGroup", () => {
  assert.equal(vocabInCultureGroup, inCultureGroup);
});

// ── The sets the engines used to hard-code (§5.2) ───────────────────────────


test("every culture in a hard-coded set exists in the lens or is a legacy key", () => {
  for (const name of LENS_CULTURE_SET_NAMES) {
    for (const key of cultureSetKeys(name)) assert.ok(lensCulture(key) || key === "general" || ["anglo-saxon", "norman-british", "celtic", "norse"].includes(key), `${name}: ${key}`);
  }
});

test("a set that differs from the lens group of the same sort is kept as it was", () => {
  // Realms' Christian set includes general and ethiopian; the vocabulary's group doesn't.
  assert.ok(cultureSet("realmsChristian").has("general") && cultureSet("realmsChristian").has("ethiopian"));
  assert.ok(!LENS_CULTURE_GROUPS.christian.cultures.includes("general") && !LENS_CULTURE_GROUPS.christian.cultures.includes("ethiopian"));
  assert.deepEqual([...cultureSet("realmsChristian")], CHRISTIAN_FOR_TEST);
  // The British set is the group, in its order.
  assert.deepEqual(BRITISH_CULTURES, ["anglo-saxon", "celtic", "norman-british"]);
  assert.deepEqual(BRITISH_CULTURES, LENS_CULTURE_GROUPS.british.cultures);
  assert.deepEqual(cultureSetKeys("caste"), ["indian", "west-african"]);
});
