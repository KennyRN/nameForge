// Inns and taverns (Inns and taverns brief §15).
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUILT_IN_VOCAB, mergeVocabularyPacks, poolEntries, SETTLEMENT_VOCAB, VOCAB_THEMES, type VocabWhere } from "../src/settlement/vocab";

// ── §15.1 Vocabulary ────────────────────────────────────────────────────────

const INN_POOLS = [
  "innCreature", "innPerson", "innItem", "innDescription", "innNumber", "innFeature", "innHome", "innWorn", "innLocation", "innFable",
  "houseWord:inn", "houseWord:tavern", "houseWord:eating", "houseWord:wayhouse", "houseWord:rest", "houseWord:club", "houseWord:bar",
  "auspicious", "welcomePhrase", "eastNature", "oasisAnchor", "indianAnchor",
];
const at = (culture: string, extra: Partial<VocabWhere> = {}): VocabWhere => ({ culture, era: "MD", fantastic: false, ...extra });

test("§15.1: the new pools exist; themes are the five", () => {
  assert.deepEqual(VOCAB_THEMES, ["rural", "urban", "maritime", "road", "magical"]);
  for (const p of INN_POOLS) assert.ok(SETTLEMENT_VOCAB.pools[p]?.entries.length > 0, p);
  // Entry validity, themes included, is checked by the shared vocabulary test.
});

test("§3: a setting's themes multiply the entries that carry them; others ignore them", () => {
  const w = (word: string, themes?: Record<string, number>) => poolEntries(BUILT_IN_VOCAB, "innItem", at("general", { themes })).find(([e]) => e.w === word)?.[1];
  assert.equal(w("Anchor"), 1);
  assert.equal(w("Anchor", { maritime: 4 }), 4);
  assert.equal(w("Barrel", { maritime: 4 }), 1);
});

test("§15.1: a pack line “- Eel Trap [maritime]” is read with its theme", () => {
  const content = "---\ntype: vocabulary\n---\n\n## innItem\n- Eel Trap [maritime]\n- Lobster Pot ×2 (light) [maritime, road]\n";
  const { vocab, notices } = mergeVocabularyPacks([{ name: "V", content }]);
  assert.deepEqual(notices, []);
  const entry = (w: string) => poolEntries(vocab, "innItem", at("general")).find(([e]) => e.w === w);
  assert.deepEqual(entry("Eel Trap")?.[0].th, ["maritime"]);
  assert.deepEqual(entry("Lobster Pot")?.[0], { w: "Lobster Pot", x: 2, t: ["light"], th: ["maritime", "road"] });
});
