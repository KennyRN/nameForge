// World place names (first release).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  findCulture,
  generateWorldPlaceNames,
  parseTemplate,
  pluralise,
  possessive,
  WORLD_CULTURES,
  WORLD_DATA,
  worldHistoryLabel,
} from "../src/world/engine";

const ERAS = WORLD_CULTURES.flatMap((c) => c.eras.map((e) => ({ culture: c, era: e })));

test("world: first and second releases: twelve cultures", () => {
  assert.deepEqual(
    WORLD_CULTURES.map((c) => c.id),
    [
      "anglo-saxon", "norse", "celtic", "roman", "chinese", "egyptian", "aztec", "bantu",
      "slavic", "arabic-persian", "indian", "japanese",
    ],
  );
  assert.equal(ERAS.length, 23);
});

test("world: every slot in every template and list entry resolves for its era", () => {
  for (const { culture, era } of ERAS) {
    const lists = { ...culture.lists, ...(era.lists ?? {}) };
    const markov = { ...(culture.markov ?? {}), ...(era.markov ?? {}) };
    const templates = [...era.templates.map(([t]) => t), ...Object.values(lists).flat().filter((e) => e.includes("{"))];
    for (const template of templates) {
      for (const token of parseTemplate(template)) {
        if (token.kind !== "slot") continue;
        const ok = token.markov ? !!markov[token.key] : (lists[token.key]?.length ?? 0) > 0;
        assert.ok(ok, `${culture.id}/${era.id}: "${template}" uses missing {${token.markov ? "#" : ""}${token.key}}`);
        if (!token.markov) assert.ok(WORLD_DATA.labels[token.key], `no label for list "${token.key}"`);
      }
    }
    for (const [, weight] of era.templates) assert.ok(weight > 0);
  }
});

test("world: the same seed and inputs give an identical batch", () => {
  for (const { culture, era } of ERAS) {
    assert.deepEqual(
      generateWorldPlaceNames({ culture: culture.id, era: era.id, count: 25, seed: 11 }),
      generateWorldPlaceNames({ culture: culture.id, era: era.id, count: 25, seed: 11 }),
    );
  }
});

test("world: every era fills a batch of distinct, placeholder-free, capitalised names", () => {
  for (const { culture, era } of ERAS) {
    const result = generateWorldPlaceNames({ culture: culture.id, era: era.id, count: 30, seed: 3 });
    assert.equal(result.names.length, 30, `${culture.id}/${era.id}: ${result.notices.join(" ")}`);
    assert.deepEqual(result.notices, []);
    const lower = result.names.map((n) => n.text.toLowerCase());
    assert.equal(new Set(lower).size, lower.length);
    for (const n of result.names) {
      assert.ok(!/[[\]{}+|~]/.test(n.text), `${culture.id}/${era.id}: "${n.text}"`);
      assert.match(n.text, /^\p{Lu}/u);
      assert.ok(!/\s{2}|^\s|\s$/.test(n.text), `spacing: "${n.text}"`);
      assert.ok(n.etymology.length > 0);
    }
  }
});

test("world: Anglo-Saxon fuses compounds; head-first cultures never do", () => {
  const as = generateWorldPlaceNames({ culture: "anglo-saxon", era: "old-english", count: 200, seed: 5 });
  assert.ok(as.names.some((n) => /^[A-Z][a-z]+(ford|field|bridge|well|brook|wood|hill)$/.test(n.text)));
  for (const n of as.names) {
    for (const word of n.text.split(/\s+/)) assert.ok(word.length <= 16, `long fusion: ${n.text}`);
  }
  for (const id of ["celtic", "roman", "chinese", "egyptian", "aztec", "bantu"]) {
    assert.equal(findCulture(id).fuseChance, 0);
  }
});

test("world: Markov names are new, and a batch's peoples are shared", () => {
  const bantu = findCulture("bantu");
  const real = new Set(bantu.markov!.people.corpus.map((n) => n.toLowerCase()));
  for (const seed of [1, 2, 3, 4, 5]) {
    const result = generateWorldPlaceNames({ culture: "bantu", count: 40, seed });
    const peoples = new Set<string>();
    for (const n of result.names) {
      const m = n.etymology.match(/\[people: ([^\]]+)\]/);
      if (m) peoples.add(m[1]);
    }
    assert.ok(peoples.size >= 1 && peoples.size <= 2, `seed ${seed}: ${[...peoples].join(", ")}`);
    for (const p of peoples) assert.ok(!real.has(p.toLowerCase()), `real people name used: ${p}`);
  }
});

test("world: plurals and possessives follow the house rules", () => {
  assert.equal(pluralise("Fox"), "Foxes");
  assert.equal(pluralise("Butterfly"), "Butterflies");
  assert.equal(pluralise("Jaguar"), "Jaguars");
  assert.equal(possessive("Ra"), "Ra's");
  assert.equal(possessive("Augustus"), "Augustus's");
  assert.equal(possessive("Hercules"), "Hercules'");
  assert.equal(possessive("King's"), "King's");
});

test("world: history labels name the culture, and the era only where there is a choice", () => {
  assert.equal(worldHistoryLabel("world place names", "egyptian", "pharaonic"), "world place names · Egyptian · Pharaonic");
  assert.equal(worldHistoryLabel("world place names", "norse"), "world place names · Norse");
  assert.equal(worldHistoryLabel("world place names", "bantu", "kingdoms"), "world place names · Bantu");
  assert.equal(worldHistoryLabel("world place names", "slavic", "soviet"), "world place names · Slavic · Soviet");
});
