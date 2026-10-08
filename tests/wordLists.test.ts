// Word lists: plain `-` lists and `//` pack lines (word lists brief §E).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mulberry32 } from "../src/markov";
import { NameRenderer, type NameWordEntry, type ResolvedListItem, type ResolvedSlot } from "../src/names/engine";
import { withDefaults } from "../src/names/recipe";
import { needsItems, resolveWordListItems, toNameWordEntry } from "../src/names/wordListSource";
import { mergeWordLists, parseWordList, wordListSection } from "../src/packs/wordList";

// ── Parser ──────────────────────────────────────────────────────────────────

test("parser: -, * and + bullets split on commas into Modern-only entries", () => {
  const list = parseWordList("## Status or role\n- Knight, Earl,  Baron ,\n* Thegn\n+ King");
  const entries = list.sections[0].entries;
  assert.deepEqual(entries.map((e) => e.modern), ["Knight", "Earl", "Baron", "Thegn", "King"]);
  assert.deepEqual(entries[0], { modern: "Knight", plural: "Knights", combiningForms: ["Knight"], fuses: "yes" });
});

test("parser: tags on both line types, combined, and case-insensitive", () => {
  const list = parseWordList("## Monarch\n- Æthelflæd, Emma (Female)\n// Saxon Kings (3)\n// Saxon Women (female, 2)");
  const { entries, packs } = list.sections[0];
  assert.deepEqual(entries.map((e) => [e.modern, e.gender, e.weight]), [["Æthelflæd", "female", undefined], ["Emma", "female", undefined]]);
  assert.deepEqual(packs, [
    { pack: "Saxon Kings", weight: 3 },
    { pack: "Saxon Women", weight: 2, gender: "female" },
  ]);
});

test("parser: an unrecognised final group stays as text", () => {
  const list = parseWordList("## Monarch\n- Ælle (of Sussex)\n- Offa (male, great)");
  assert.deepEqual(list.sections[0].entries.map((e) => [e.modern, e.gender]), [["Ælle (of Sussex)", undefined], ["Offa (male", undefined], ["great)", undefined]]);
});

test("parser: bare and wikilink // names, including [[Name|alias]]", () => {
  const list = parseWordList("## Saint\n// Saxon Saints\n// [[Saxon Men]]\n//[[Saxon Women|women]] (female)");
  assert.deepEqual(list.sections[0].packs, [
    { pack: "Saxon Saints", weight: 1 },
    { pack: "Saxon Men", weight: 1 },
    { pack: "Saxon Women", weight: 1, gender: "female" },
  ]);
});

test("parser: lines before the first heading are unsectioned; prose is ignored", () => {
  const list = parseWordList("A word list for the north.\n\n- oak, ash\n// Trees\n\n## Bird\nSome prose here.\n- crane");
  assert.deepEqual(list.unsectioned.map((e) => e.modern), ["oak", "ash"]);
  assert.deepEqual(list.unsectionedPacks.map((p) => p.pack), ["Trees"]);
  assert.deepEqual(list.sections[0].entries.map((e) => e.modern), ["crane"]);
  assert.deepEqual(list.sections[0].packs, []);
});

test("parser: tables parse as before, mixed with - and // lines", () => {
  const list = parseWordList("## Wild animal\n| Modern | Plural |\n|---|---|\n| wolf | wolves |\n- bear\n// Beasts\n| Modern |\n|---|\n| lynx |");
  const s = list.sections[0];
  assert.deepEqual(s.entries[0], { modern: "wolf", plural: "wolves", combiningForms: ["wolf"], fuses: "yes" });
  assert.deepEqual(s.entries.map((e) => e.modern), ["wolf", "bear", "lynx"]);
  assert.deepEqual(s.packs.map((p) => p.pack), ["Beasts"]);
  assert.equal(needsItems(s), true);
  assert.equal(needsItems(parseWordList("## Bird\n| Modern |\n|---|\n| crane |\n- heron").sections[0]), false);
});

// ── Resolving ───────────────────────────────────────────────────────────────

test("resolving: missing packs and non-name packs are dropped with notices", async () => {
  const section = parseWordList("## Saint\n- Cuthbert\n// Saxon Saints (2)\n// Gone\n// Fauna").sections[0];
  const draw = () => "Aidan";
  const { items, notices } = await resolveWordListItems(section, "Northmarch People", async (pack) =>
    pack === "Saxon Saints" ? { draw } : pack === "Fauna" ? { notPack: true } : { missing: true },
  );
  assert.equal(items.length, 2);
  assert.equal(items[0].entry?.modern, "Cuthbert");
  assert.equal(items[1].draw, draw);
  assert.equal(items[1].weight, 2);
  assert.deepEqual(notices, [
    "Pack “Gone” in word list “Northmarch People” wasn't found.",
    "“Fauna” in word list “Northmarch People” isn't a name pack.",
  ]);
});

test("resolving: template inheritance keeps mixed sections whole", () => {
  const template = parseWordList("// Base pack\n\n## Saint\n- Cuthbert\n// Saxon Saints\n\n## Bird\n- crane");
  const derived = parseWordList("## Bird\n- emu (2)\n// Birds of the South");
  const merged = mergeWordLists(derived, template);
  assert.deepEqual(wordListSection(merged, "saint")!.packs.map((p) => p.pack), ["Saxon Saints"]);
  const bird = wordListSection(merged, "Bird")!;
  assert.deepEqual([bird.entries.map((e) => e.modern), bird.packs.map((p) => p.pack)], [["emu"], ["Birds of the South"]]);
  assert.deepEqual(merged.unsectionedPacks.map((p) => p.pack), ["Base pack"]);
});

// ── Engine ──────────────────────────────────────────────────────────────────

const word = (modern: string): NameWordEntry => ({ modern, forms: [modern], fuses: "yes" });
const items = (list: ResolvedListItem[], extra: Partial<Extract<ResolvedSlot, { kind: "sources" }>> = {}): ResolvedSlot => ({
  kind: "sources",
  sources: [{ weight: 1, items: list, itemsLabel: "“People” › “Saint”" }],
  ...extra,
});
const renderer = (slots: Record<string, ResolvedSlot>) => new NameRenderer(withDefaults({}), slots, undefined);

test("engine: item weights are respected", () => {
  const r = renderer({ colour: items([{ weight: 9, entry: word("red") }, { weight: 1, entry: word("blue") }]) });
  const rng = mulberry32(3);
  let red = 0;
  for (let i = 0; i < 2000; i++) {
    const fill = r.fill("colour", rng);
    if (fill.kind === "word" && fill.entry.modern === "red") red++;
  }
  assert.ok(red > 1700 && red < 1900, `red ${red}`);
});

test("engine: gender filters tagged items; empty after filtering falls back with one notice", () => {
  const r = renderer({
    "personal-name": items([{ weight: 1, gender: "male", entry: word("Alfred") }, { weight: 1, gender: "female", entry: word("Emma") }], { gender: { male: 0, female: 100 } }),
    "saint-or-holy-person": items([{ weight: 1, gender: "male", entry: word("Cuthbert") }], { gender: { male: 0, female: 100 } }),
  });
  const rng = mulberry32(5);
  for (let i = 0; i < 50; i++) {
    const fill = r.fill("personal-name", rng);
    assert.equal(fill.kind === "name" && fill.text, "Emma");
  }
  for (let i = 0; i < 5; i++) {
    const fill = r.fill("saint-or-holy-person", rng);
    assert.equal(fill.kind === "name" && fill.text, "Cuthbert");
  }
  assert.deepEqual(r.getNotices(), ["“People” › “Saint” has no female entries; ignoring gender."]);
});

test("engine: a pack item gives a name fill and receives the drawn gender", () => {
  let seen: string | undefined;
  const r = renderer({
    "saint-or-holy-person": items(
      [
        {
          weight: 1,
          draw: (request) => {
            seen = request.gender;
            return "Hild";
          },
        },
      ],
      { gender: { male: 0, female: 100 } },
    ),
  });
  const fill = r.fill("saint-or-holy-person", mulberry32(1));
  assert.deepEqual(fill, { kind: "name", text: "Hild", mode: "stem" });
  assert.equal(seen, "female");
});

test("engine: a word in a name slot is a name fill that follows whole/stem; in a word slot it's a word", () => {
  const r = renderer({
    "monarch-ruler-or-dynasty": items([{ weight: 1, entry: word("Alfred") }], { mode: "whole" }),
    "personal-name": items([{ weight: 1, entry: word("Offa") }]),
    colour: items([{ weight: 1, entry: word("red") }]),
  });
  const rng = mulberry32(2);
  assert.deepEqual(r.fill("monarch-ruler-or-dynasty", rng), { kind: "name", text: "Alfred", mode: "whole" });
  assert.deepEqual(r.fill("personal-name", rng), { kind: "name", text: "Offa", mode: "stem" });
  const colour = r.fill("colour", rng);
  assert.equal(colour.kind, "word");
});

test("engine: a table-only list gives identical output through entries or equal-weight items", () => {
  const entries = ["red", "blue", "green", "black", "white"].map(word);
  const viaEntries = renderer({ colour: { kind: "sources", sources: [{ weight: 1, entries }] } });
  const viaItems = renderer({ colour: items(entries.map((entry) => ({ weight: 1, entry }))) });
  const a = mulberry32(11);
  const b = mulberry32(11);
  for (let i = 0; i < 200; i++) assert.deepEqual(viaItems.fill("colour", b), viaEntries.fill("colour", a));
});

test("toNameWordEntry keeps the table fields", () => {
  assert.deepEqual(toNameWordEntry({ modern: "brock", traditional: "broc", plural: "brocks", combiningForms: ["Brock"], fuses: "no" }), {
    modern: "brock",
    traditional: "broc",
    plural: "brocks",
    forms: ["Brock"],
    fuses: "no",
  });
});
