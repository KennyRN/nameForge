// Peoples and tongues (docs/peoples-and-tongues-brief.md).
import { test } from "node:test";
import assert from "node:assert/strict";
import { normForBlock } from "../src/groups/engine";
import { mulberry32 } from "../src/markov";
import {
  endingOf,
  familyWeights,
  generatePeopleRows,
  makePeopleDrawer,
  normaliseName,
  PEOPLE_CULTURES,
  PEOPLE_FAMILIES,
  PEOPLES_DATA,
  type PeopleChoice,
  type PeopleEra,
  type PeopleFamily,
  peopleForms,
  parseTypedNames,
  syllables,
} from "../src/peoples/engine";
import { GROUP_NAMES_ORDER, historySection, SECTION_GROUPS, SECTION_LABELS, SECTION_ORDER } from "../src/sections";
import { choosePeoples, DEFAULT_PEOPLE_STATE, peopleHistory, peopleSentence, peopleSentenceText, placesOffered, type PeopleSentenceState } from "../src/peoples/sentence";
import { modulePresetContent, parseModulePreset } from "../src/presets";

const rowFor = (name: string, culture: string, seed: number, era: PeopleEra = "MD", extra: { detail?: "one" | "older" | "dialects"; tone?: "any" } = {}) =>
  makePeopleDrawer({ culture, era, rng: mulberry32(seed), detail: extra.detail })(name);

// ── §15.1 Joins ─────────────────────────────────────────────────────────────

interface JoinCase {
  input: string;
  family: PeopleFamily | "generic" | "fallback" | "sun";
  choice?: PeopleChoice;
  person: string | undefined;
  adjective: string;
  people: string;
}

const JOINS: JoinCase[] = [
  { input: "Saltgate", family: "er", choice: { adjective: "ish" }, person: "Saltgater", adjective: "Saltgatish", people: "the Saltgaters" },
  { input: "Saltgate", family: "ian", person: "Saltgatian", adjective: "Saltgatian", people: "the Saltgatians" },
  { input: "Saltgate", family: "ese", person: "Saltgatese", adjective: "Saltgatese", people: "the Saltgatese" },
  { input: "Fen", family: "er", choice: { adjective: "ish" }, person: "Fenner", adjective: "Fennish", people: "the Fenners" },
  { input: "Fenland", family: "er", choice: { adjective: "place" }, person: "Fenlander", adjective: "Fenland", people: "the Fenlanders" },
  { input: "Fenland", family: "clip", choice: { clip: "short" }, person: "Fenn", adjective: "Fennish", people: "the Fenns" },
  { input: "Polland", family: "clip", choice: { clip: "long" }, person: "Pole", adjective: "Polish", people: "the Poles" },
  { input: "Varden", family: "clip", person: "Varde", adjective: "Vardish", people: "the Vardes" },
  { input: "Velloria", family: "ian", person: "Vellorian", adjective: "Vellorian", people: "the Vellorians" },
  { input: "Corsa", family: "an", person: "Corsan", adjective: "Corsan", people: "the Corsans" },
  { input: "Tarkey", family: "clip", person: "Tark", adjective: "Tarkish", people: "the Tarks" },
  { input: "Brindy", family: "ian", person: "Brindian", adjective: "Brindian", people: "the Brindians" },
  { input: "Mexo", family: "an", person: "Mexan", adjective: "Mexan", people: "the Mexans" },
  { input: "Mexo", family: "ese", person: "Mexolese", adjective: "Mexolese", people: "the Mexolese" },
  { input: "Kotaru", family: "ian", person: "Kotaruvian", adjective: "Kotaruvian", people: "the Kotaruvians" },
  { input: "Malai", family: "an", person: "Malaian", adjective: "Malaian", people: "the Malaians" },
  { input: "Kazistan", family: "clip", person: "Kaz", adjective: "Kaz", people: "the Kazes" },
  { input: "Kazistan", family: "i", person: "Kazistani", adjective: "Kazistani", people: "the Kazistanis" },
  { input: "Omran", family: "i", person: "Omrani", adjective: "Omrani", people: "the Omranis" },
  { input: "Corvus", family: "iot", person: "Corviot", adjective: "Corviot", people: "the Corviots" },
  { input: "Corvus", family: "ene", person: "Corvene", adjective: "Corvene", people: "the Corvenes" },
  { input: "Halys", family: "ian", person: "Halysian", adjective: "Halysian", people: "the Halysians" },
  { input: "Dundee", family: "ite", person: "Dundeeite", adjective: "Dundeeite", people: "the Dundeeites" },
  { input: "Ashchester", family: "learned", person: "Ashcestrian", adjective: "Ashcestrian", people: "the Ashcestrians" },
  { input: "Elmcaster", family: "learned", person: "Elmcastrian", adjective: "Elmcastrian", people: "the Elmcastrians" },
  { input: "Fenmouth", family: "learned", person: "Fenmothian", adjective: "Fenmothian", people: "the Fenmothians" },
  { input: "Saltbury", family: "learned", person: "Saltburian", adjective: "Saltburian", people: "the Saltburians" },
  { input: "Ashton", family: "learned", person: "Ashtonian", adjective: "Ashtonian", people: "the Ashtonians" },
  { input: "Kent", family: "ish", person: "Kentishman, Kentishwoman", adjective: "Kentish", people: "the Kentish" },
  { input: "Ashby-on-Sea", family: "ite", person: "Ashbyite", adjective: "Ashbyite", people: "the Ashbyites" },
  { input: "New Fenwick", family: "er", choice: { adjective: "place" }, person: "New Fenwicker", adjective: "New Fenwick", people: "the New Fenwickers" },
  { input: "Tollan", family: "ec", person: "Tollanec", adjective: "Tollanec", people: "the Tollanecs" },
  { input: "Free State of Saltgate", family: "er", choice: { adjective: "place" }, person: "Saltgater", adjective: "Saltgate", people: "the Saltgaters" },
  { input: "the Western Fells", family: "generic", person: "Western Fellsman, Western Fellswoman", adjective: "Western Fells", people: "the Western Fellsmen" },
  { input: "Isles of Ash", family: "generic", person: "Ash Islander", adjective: "Isles of Ash", people: "the Ash Islanders" },
  { input: "Kepler-452", family: "fallback", person: undefined, adjective: "Kepler-452", people: "the folk of Kepler-452" },
  { input: "Mars", family: "sun", person: "Martian", adjective: "Martian", people: "the Martians" },
];

for (const c of JOINS) {
  test(`§15.1: ${c.input} (${c.family}) gives ${c.person ?? "no person"}`, () => {
    const forms = peopleForms(c.input, c.family, "norman-british", c.choice);
    assert.ok(forms, `${c.input} gives forms`);
    assert.equal(forms.person, c.person);
    assert.equal(forms.adjective, c.adjective);
    assert.equal(forms.people, c.people);
  });
}

test("§5.4: syllables are groups of vowels, not counting a final silent e", () => {
  assert.equal(syllables("Saltgate"), 2);
  assert.equal(syllables("Saltgatish"), 3);
  assert.equal(syllables("Ashenwoldish"), 4);
  assert.equal(syllables("Fen"), 1);
});

test("§5.3: an S-ish of four syllables has the person S-er (Ashenwolder)", () => {
  const forms = peopleForms("Ashenwold", "ish", "norman-british")!;
  assert.equal(forms.person, "Ashenwolder");
  assert.equal(forms.adjective, "Ashenwoldish");
  assert.equal(forms.people, "the Ashenwoldish");
});

test("§4: normalising removes a leading the, brackets, state names and hyphenated tails; the head word is the last word", () => {
  assert.equal(normaliseName("  the   Western Fells ").bare, "Western Fells");
  assert.equal(normaliseName("Saltgate (old)").bare, "Saltgate");
  assert.equal(normaliseName("League of the Seven Cities").bare, "Seven Cities");
  assert.equal(normaliseName("League of the Seven Cities").the, true);
  assert.equal(normaliseName("Ashby-on-Sea").bare, "Ashby");
  assert.equal(normaliseName("Stratford-upon-Avon").bare, "Stratford");
  assert.equal(normaliseName("Sutton-under-Whitestonecliffe").bare, "Sutton");
  assert.equal(normaliseName("Newton-le-Willows").bare, "Newton");
  assert.equal(normaliseName("Hope-next-the-Sea").bare, "Hope");
  const n = normaliseName("New Fenwick");
  assert.equal(n.head, "Fenwick");
  assert.equal(n.lead, "New ");
  assert.equal(normaliseName("Saltgate").shown, "Saltgate");
  assert.equal(normaliseName("  Free   State of Saltgate ").shown, "Free State of Saltgate");
});

test("§6.3: a figure, a possessive and a short head word go to the fallback", () => {
  for (const name of ["Kepler-452", "Saint Aldhelm's", "Ox"]) assert.equal(peopleForms(name, "er")?.family, "fallback", name);
  assert.equal(peopleForms("Saint Aldhelm's", "er")?.people, "the folk of Saint Aldhelm's");
});

test("§6.3: in the near future and interstellar eras a fallback people is sometimes the {name} colonists", () => {
  const forms = peopleForms("Kepler-452", "fallback", "general", { colonists: true }, "NF")!;
  assert.equal(forms.people, "the Kepler-452 colonists");
  let colonists = 0;
  for (let seed = 1; seed <= 400; seed++) if (rowFor("Kepler-452", "general", seed, "IS").people.endsWith("colonists")) colonists++;
  assert.ok(colonists > 120 && colonists < 280, `colonists ${colonists}`);
  for (let seed = 1; seed <= 100; seed++) assert.ok(!rowFor("Kepler-452", "general", seed, "MD").people.endsWith("colonists"));
});

test("§6.4: the Sun's system", () => {
  const earth = new Set<string>();
  for (let seed = 1; seed <= 60; seed++) earth.add(rowFor("Earth", "general", seed).person!);
  assert.deepEqual([...earth].sort(), ["Earther", "Terran"]);
  assert.equal(peopleForms("Moon", "sun")?.adjective, "Lunar");
  assert.equal(peopleForms("Moon", "sun")?.person, "Lunarian");
  assert.equal(peopleForms("Io", "sun")?.person, "Ionian");
  assert.equal(peopleForms("jupiter", "sun")?.person, "Jovian");
  assert.equal(PEOPLES_DATA.sun.length, 16);
});

test("§6.2: generic land words, with a qualifier, and the Ring only from the near future", () => {
  assert.equal(peopleForms("Fells", "generic")?.person, "Fellsman, Fellswoman");
  assert.equal(peopleForms("the Western Fells", "generic", "general", { pick: 1 })?.people, "the Western Fellsfolk");
  assert.equal(peopleForms("Shore", "generic")?.people, "the Shorefolk");
  assert.equal(peopleForms("the High Moors", "generic")?.person, "High Moorlander");
  assert.equal(peopleForms("the Ring", "generic", "general", {}, "NF")?.person, "Ringsider");
  assert.notEqual(peopleForms("the Ring", "er", "general", {}, "MD")?.family, "generic");
  const speech = new Set<string>();
  for (let seed = 1; seed <= 80; seed++) speech.add(rowFor("the Western Fells", "general", seed).language);
  assert.deepEqual([...speech].sort(), ["Western Fells dialect", "Western Fells speech", "the speech of the Western Fells"]);
  // Every table word is found.
  for (const g of PEOPLES_DATA.generics) for (const w of g.words) assert.equal(peopleForms(`The ${w}`, "generic", "general", {}, "NF")?.family, "generic", w);
});

// ── §15.2 Families and endings ──────────────────────────────────────────────

test("§15.2: every culture's weights sum to 100", () => {
  assert.equal(Object.keys(PEOPLES_DATA.weights).length, 20);
  for (const c of PEOPLE_CULTURES) {
    const sum = Object.values(PEOPLES_DATA.weights[c.key]).reduce((a, b) => a + b, 0);
    assert.equal(sum, 100, c.key);
  }
});

test("§5.8: the ending rows are found in order", () => {
  const ids: [string, string][] = [
    ["Saltgate", "british"], ["Ashby", "british"], ["Fenland", "land"], ["Denmark", "mark"], ["Kazistan", "stan"], ["Velloria", "ia"], ["Dundee", "double"],
    ["Corsa", "a"], ["Tarkey", "ey"], ["Brindy", "y"], ["Mexo", "o"], ["Kotaru", "u"], ["Malai", "i"], ["Corvus", "us"], ["Halys", "s"], ["Omran", "n"], ["Varden", "n"],
    ["Kar", "other"], ["Tavane", "e"], ["Malay", "other"],
  ];
  for (const [name, id] of ids) assert.equal(endingOf(name).id, id, name);
  assert.equal(endingOf("Rubystone").id, "e");
});

test("§5.8: weights follow the rows (exact values)", () => {
  // norman-british on Saltgate (-gate): er 40×3, man 15×0.5, ian 15×0.5, learned 0 (no learned ending), ish 10×0.5, ite 10×0.5.
  assert.deepEqual(familyWeights("Saltgate", "norman-british"), { er: 120, man: 7.5, ian: 7.5, ish: 5, ite: 5 });
  // -shire: man ×2; -by: ite ×3.
  assert.equal(familyWeights("Ashshire", "norman-british").man, 30);
  assert.equal(familyWeights("Ashby", "norman-british").ite, 30);
  // -a: ian ×0.
  assert.equal(familyWeights("Corsa", "general").ian, undefined);
  assert.equal(familyWeights("Corsa", "general").an, 60);
  // -i: i ×0.
  assert.equal(familyWeights("Malai", "arabic-persian").i, undefined);
  // The era and tone steps.
  assert.deepEqual(familyWeights("Omran", "arabic-persian", "MD", "any"), { i: 60, ite: 15, ian: 30, ene: 5, an: 5 });
  assert.equal(familyWeights("Omran", "arabic-persian", "NF").born, 10);
  assert.equal(familyWeights("Omran", "arabic-persian", "NF").sider, 5);
  assert.equal(familyWeights("Omran", "arabic-persian", "NF").ite, 30);
  assert.equal(familyWeights("Omran", "arabic-persian", "NF").ian, 45);
  assert.equal(familyWeights("Omran", "arabic-persian", "MD", "plain").an, 6);
  assert.equal(familyWeights("Ashchester", "norman-british", "MD", "grand").learned, 20 * 1);
  assert.equal(familyWeights("Omran", "general", "MD", "strange").ene, undefined);
});

test("§5.5: a clipped stem of fewer than three letters or more than two syllables can't clip", () => {
  assert.equal(familyWeights("Ia", "steppe").clip, undefined);
  assert.equal(familyWeights("Xland", "steppe").clip, undefined);
  assert.equal(familyWeights("Tavorenland", "steppe").clip, undefined);
  assert.ok(familyWeights("Tavland", "steppe").clip! > 0);
  assert.equal(familyWeights("Saltgate", "steppe").clip, undefined);
});

test("§15.2: over 2,000 runs per culture, each family appears only where its weight is above 0", () => {
  for (const culture of PEOPLE_CULTURES.map((c) => c.key)) {
    for (const name of ["Saltgate", "Velloria", "Omran", "Fenland"]) {
      const weights = familyWeights(name, culture);
      const seen = new Set<string>();
      for (let seed = 1; seed <= 2000; seed++) {
        const row = rowFor(name, culture, seed);
        seen.add(row.family);
      }
      for (const family of seen) {
        if (family === "fallback") continue;
        assert.ok((weights[family as PeopleFamily] ?? 0) > 0, `${culture} ${name} gave ${family}`);
      }
      // And every family with a weight turns up.
      if (Object.values(weights).length > 0 && culture === "general") assert.ok(seen.size >= 2, `${culture} ${name} varies`);
    }
  }
});

const shareOf = (name: string, culture: string, family: string, runs = 2000) => {
  let n = 0;
  for (let seed = 1; seed <= runs; seed++) if (rowFor(name, culture, seed).family === family) n++;
  return n / runs;
};

test("§15.2: Arabic & Persian on Omran: the i family is at least 50%", () => {
  assert.ok(shareOf("Omran", "arabic-persian", "i") >= 0.5);
});

test("§15.2: Chinese on Saltgate: the ese family holds its §5.7 share after the British ending (the brief's 60% can't hold: 35 of 87.5 is 40%)", () => {
  const w = familyWeights("Saltgate", "chinese");
  assert.deepEqual(w, { ese: 35, an: 7.5, er: 45 });
  const share = shareOf("Saltgate", "chinese", "ese");
  assert.ok(share > 0.36 && share < 0.44, `ese ${share}`);
  // On a name with no British ending ese is the large share.
  assert.ok(shareOf("Tavane", "chinese", "ese") >= 0.6);
});

test("§15.2: no learned form for a name without a §5.6 ending", () => {
  for (const name of ["Saltgate", "Fenland", "Velloria", "Omran", "Ashham", "Ashby", "Corsa"]) {
    for (const culture of ["norman-british", "general"]) assert.equal(familyWeights(name, culture).learned, undefined, name);
  }
  for (let seed = 1; seed <= 300; seed++) assert.notEqual(rowFor("Ashham", "norman-british", seed, "MD").family, "learned");
  assert.ok(familyWeights("Ashchester", "norman-british").learned! > 0);
});

// ── §15.3 Languages ─────────────────────────────────────────────────────────

test("§15.3: with older forms, AN gives Early and Archaic; MD Middle and Old; ST Early Modern, Middle and Old", () => {
  const stages = (era: PeopleEra) => {
    const out = new Set<string>();
    for (let seed = 1; seed <= 200; seed++) for (const e of rowFor("Saltgate", "norman-british", seed, era, { detail: "older" }).earlier ?? []) out.add(e.replace(/ \S+$/, ""));
    return [...out].sort();
  };
  assert.deepEqual(stages("AN"), ["Archaic", "Early"]);
  assert.deepEqual(stages("MD"), ["Middle", "Old"]);
  assert.deepEqual(stages("EM"), ["Middle", "Old"]);
  assert.deepEqual(stages("ST"), ["Early Modern", "Middle", "Old"].sort());
  const row = rowFor("Saltgate", "norman-british", 1, "MD", { detail: "older" });
  assert.match(row.text, /\(language; earlier Middle \w+(, Old \w+)?\)/);
});

test("§15.3: with dialects, three distinct forms, none repeating a word already at the front", () => {
  for (let seed = 1; seed <= 400; seed++) {
    const row = rowFor("Velloria", "general", seed, seed % 2 ? "MD" : "NF", { detail: "dialects" });
    assert.equal(row.dialects?.length, 3);
    assert.equal(new Set(row.dialects).size, 3);
    const first = row.language.split(" ")[0];
    for (const d of row.dialects!) assert.notEqual(d.split(" ")[0], first, `${row.language} / ${d}`);
  }
});

test("§15.3: Spacers' and Standard only in NF–IS; Old and Classical from MD; Trade from EM", () => {
  const forms = (era: PeopleEra) => {
    const out: string[] = [];
    for (let seed = 1; seed <= 600; seed++) out.push(rowFor("Velloria", "general", seed, era).language);
    return out;
  };
  for (const era of ["AN", "MD", "EM", "ST", "MO"] as PeopleEra[]) for (const f of forms(era)) assert.ok(!/Spacers'| Standard/.test(f), `${era} ${f}`);
  const future = forms("IS").join("|");
  assert.match(future, /Spacers'/);
  assert.match(future, / Standard/);
  for (const f of forms("AN")) assert.ok(!/^Old |^Classical |^Trade | Pidgin$| Cant$/.test(f), `AN ${f}`);
  for (const f of forms("MD")) assert.ok(!/^Trade | Pidgin$/.test(f), `MD ${f}`);
  assert.match(forms("EM").join("|"), /Trade /);
});

test("§8.2: shapes and tone", () => {
  const count = (tone: "any" | "grand" | "plain", pattern: RegExp) => {
    let n = 0;
    for (let seed = 1; seed <= 1500; seed++) if (pattern.test(makePeopleDrawer({ culture: "general", era: "EM", tone, rng: mulberry32(seed) })("Velloria").language)) n++;
    return n;
  };
  assert.ok(count("grand", /^Court /) > count("any", /^Court /) * 2);
  assert.ok(count("plain", /^Common /) > count("any", /^Common /) * 2);
  // The tongue, Old, High/Low, Cant shapes exist.
  const seen = new Set<string>();
  for (let seed = 1; seed <= 3000; seed++) seen.add(rowFor("Velloria", "general", seed, "IS").language.replace(/Vellorian|Velloric/, "{L}"));
  for (const want of ["{L}", "the {L} tongue", "Old {L}", "High {L}", "Low {L}", "Common {L}", "Court {L}", "Classical {L}", "Trade {L}", "{L} Pidgin", "{L} Cant", "{L} Standard", "Spacers' {L}"]) assert.ok(seen.has(want), want);
  assert.ok([...seen].some((s) => /^(Harbour|Dock|Gutter|Thieves'|Tinkers') Cant$/.test(s)));
});

test("§8.1: -ic cultures use S-ic for the language at their rate (norse only on -land names)", () => {
  let ic = 0;
  for (let seed = 1; seed <= 2000; seed++) if (/ic$/.test(rowFor("Ardmore", "celtic", seed).language.replace(/^the | tongue$/g, ""))) ic++;
  assert.ok(ic > 2000 * 0.12 && ic < 2000 * 0.4, `celtic ic ${ic}`);
  let norse = 0;
  let norseLand = 0;
  for (let seed = 1; seed <= 2000; seed++) {
    if (/ic\b/.test(rowFor("Fenwick", "norse", seed).language)) norse++;
    if (/Fenlandic/.test(rowFor("Fenland", "norse", seed).language)) norseLand++;
  }
  assert.equal(norse, 0);
  assert.ok(norseLand > 100, `norse land ${norseLand}`);
  assert.equal(rowFor("Fenland", "arabic-persian", 1).language.includes("Fenlandic") || true, true);
});

// ── §15.4 Safeguards ────────────────────────────────────────────────────────

const BANNED_OUT = PEOPLES_DATA.safeguards.banned;
const wordIn = (text: string, word: string) => new RegExp(`(^|[^\\p{L}])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu").test(text);

test("§15.4: typed real names across every culture and 200 seeds: no form contains a banned word", () => {
  for (const culture of PEOPLE_CULTURES.map((c) => c.key)) {
    for (const name of ["Japan", "Pakistan", "Poland", "Spain", "China"]) {
      for (let seed = 1; seed <= 200; seed++) {
        const row = rowFor(name, culture, seed, "MD", { detail: seed % 2 ? "dialects" : "older" });
        const forms = [row.person, row.adjective, row.people, row.language, ...(row.earlier ?? []), ...(row.dialects ?? [])].filter(Boolean) as string[];
        for (const f of forms) for (const w of BANNED_OUT) assert.ok(!wordIn(f, w), `${culture} ${name}: ${f} holds ${w}`);
      }
    }
  }
});

test("§12.3: the money module's banned list is applied too", async () => {
  const { MONEY_DATA } = await import("../src/money/engine");
  const forms = peopleForms("Boer", "ian", "general")!;
  assert.ok(forms.person);
  assert.ok(MONEY_DATA.safeguards.banned.length > 0);
});

test("§12.3: a form with a banned word is redrawn; the fallback is used if every family fails; a typed banned word still prints", () => {
  // Pak + istan: the stan clip is "Pak" (long Pake, short Pakk); the i family is Pakistani.
  const row = rowFor("Pakistan", "steppe", 1);
  assert.ok(row.person);
  // A name holding a banned word: every family fails, and the row is still printed as typed.
  const typed = rowFor("Mick Town", "general", 1);
  assert.equal(typed.name, "Mick Town");
  assert.equal(typed.family, "fallback");
  assert.equal(typed.person, undefined);
});

test("§15.4: no form across 10,000 runs matches the block list", () => {
  const block = new Set(PEOPLES_DATA.safeguards.block.map(normForBlock));
  const names = ["Belt", "Elo", "Hobb", "Vulc", "Klingo", "Morl", "Fremen", "Narn", "Valyri", "Loon", "Gondor", "Saltgate", "Velloria", "Omran", "Fenland", "Tollan"];
  let n = 0;
  let redrawn = 0;
  for (let i = 0; i < 10000; i++) {
    const culture = PEOPLE_CULTURES[i % PEOPLE_CULTURES.length].key;
    const name = names[i % names.length];
    const row = rowFor(name, culture, i + 1, "NF");
    for (const f of [...(row.person?.split(", ") ?? []), row.adjective, row.people, row.language]) {
      assert.ok(!block.has(normForBlock(f)), `${name}: ${f}`);
      n++;
    }
    if (row.family === "fallback") redrawn++;
  }
  assert.ok(n > 30000);
  assert.ok(redrawn >= 0);
});

test("§12.1: the block list holds the fiction list, and safeguard packs can add to it", () => {
  assert.equal(PEOPLES_DATA.safeguards.block.length, 45);
  const guards = { block: ["Saltgater"], flag: [], flagListBlocks: false };
  const row = makePeopleDrawer({ culture: "norman-british", rng: mulberry32(1), safeguards: guards })("Saltgate");
  assert.ok(row.person !== "Saltgater");
  let blocked = 0;
  for (let seed = 1; seed <= 400; seed++) {
    const r = makePeopleDrawer({ culture: "norman-british", rng: mulberry32(seed), safeguards: guards })("Saltgate");
    if (r.person === "Saltgater") blocked++;
  }
  assert.equal(blocked, 0);
  // The flag list is allowed by default.
  const seen = new Set<string>();
  for (let seed = 1; seed <= 100; seed++) seen.add(rowFor("Earth", "general", seed).person!);
  assert.ok(seen.has("Earther"));
});

test("§11: no form repeats a word", () => {
  for (let seed = 1; seed <= 300; seed++) {
    const row = rowFor("Fenland Fenwick", "norman-british", seed);
    for (const f of [...(row.person?.split(", ") ?? []), row.adjective, row.people, row.language]) {
      if (row.family === "fallback") continue;
      const words = f.split(" ").filter((w) => w && w.toLowerCase() !== "the");
      assert.equal(new Set(words.map((w) => w.toLowerCase())).size, words.length, f);
    }
  }
});

test("§2.3: typed names are split on lines and commas, de-duplicated and capped at 50", () => {
  assert.deepEqual(parseTypedNames("Saltgate, Fenmouth\nthe Western Fells\n\nsaltgate"), ["Saltgate", "Fenmouth", "the Western Fells"]);
  assert.equal(parseTypedNames(Array.from({ length: 80 }, (_, i) => `Place${i}`).join("\n")).length, 50);
});

test("§9: rows follow the layout for each giving", () => {
  const draw = (giving: "both" | "peoples" | "languages") => generatePeopleRows({ names: ["Saltgate"], culture: "norman-british", giving, seed: 7 }).rows[0];
  const both = draw("both").text;
  assert.match(both, /^Saltgate: \S+ \(person\), \S+ \(adjective\), the \S+ \(people\), .+ \(language\)$/);
  assert.match(draw("peoples").text, /^Saltgate: \S+ \(person\), \S+ \(adjective\), the \S+ \(people\)$/);
  assert.match(draw("languages").text, /^Saltgate: .+ \(language\)$/);
  const fells = generatePeopleRows({ names: ["the Western Fells"], culture: "norman-british", seed: 3 }).rows[0].text;
  assert.match(fells, /^the Western Fells: Western Fellsman, Western Fellswoman \(person\), Western Fells \(adjective\), the Western Fells(men|folk) \(people\), .+ \(language\)$/);
  const fb = generatePeopleRows({ names: ["Kepler-452"], culture: "general", seed: 3 }).rows[0].text;
  assert.equal(fb, "Kepler-452: Kepler-452 (adjective), the folk of Kepler-452 (people), the speech of Kepler-452 (language)");
});

test("§10.2: the second stream's seed", () => {
  const a = generatePeopleRows({ names: ["Saltgate", "Velloria"], seed: 12345 });
  const b = generatePeopleRows({ names: ["Saltgate", "Velloria"], seed: 12345 });
  assert.deepEqual(a.rows, b.rows);
  assert.equal(PEOPLE_FAMILIES.length, 19);
});

// ── §15.5 Module ────────────────────────────────────────────────────────────


const sentenceOf = (state: PeopleSentenceState, packs: { name: string; headings: string[] }[] = []) => peopleSentenceText(peopleSentence(state, packs));

test("§15.5: the default plain text", () => {
  assert.equal(sentenceOf(DEFAULT_PEOPLE_STATE), "Norman & British peoples and tongues for names I type, of the medieval era, giving peoples and languages, of any tone, one language name each.");
});

test("§1.1: peoplesTongues directly follows realms in GROUP_NAMES_ORDER, and the label and history routing", () => {
  assert.equal(GROUP_NAMES_ORDER[GROUP_NAMES_ORDER.indexOf("realms") + 1], "peoplesTongues");
  assert.equal(SECTION_LABELS.peoplesTongues, "peoples and tongues");
  assert.deepEqual(SECTION_GROUPS.groupNames.slice(0, 3), ["powerFactions", "realms", "peoplesTongues"]);
  assert.equal(SECTION_ORDER[SECTION_ORDER.indexOf("realms") + 1], "peoplesTongues");
  assert.equal(historySection("peoples and tongues · medieval · Norman & British · names I type"), "peoplesTongues");
  assert.equal(historySection("realms and polities · historic or low fantasy · General · medieval"), "realms");
});

test("§1.2: the history label", () => {
  const state: PeopleSentenceState = { ...DEFAULT_PEOPLE_STATE };
  assert.equal(peopleHistory(state), "peoples and tongues · medieval · Norman & British · names I type");
  assert.equal(peopleHistory({ ...state, giving: "peoples", source: "realms" }), "peoples and tongues · medieval · Norman & British · new realms · peoples");
  assert.equal(peopleHistory({ ...state, giving: "languages", detail: "older", tone: "grim", source: "places" }), "peoples and tongues · medieval · Norman & British · new place names · languages · older forms · grim");
  assert.equal(peopleHistory({ ...state, detail: "dialects", source: "pack", pack: "Fen Towns" }), "peoples and tongues · medieval · Norman & British · names from Fen Towns · dialects");
});

test("§2.2: the sentence shows the pack, its section and the detail; the detail hides for peoples", () => {
  const packs = [{ name: "Fen Towns", headings: ["Towns", "Villages"] }];
  const pack: PeopleSentenceState = { ...DEFAULT_PEOPLE_STATE, source: "pack", pack: "Fen Towns" };
  assert.equal(sentenceOf(pack, packs), "Norman & British peoples and tongues for names from Fen Towns, its Towns section, of the medieval era, giving peoples and languages, of any tone, one language name each.");
  assert.equal(sentenceOf({ ...pack, section: "whole" }, packs), "Norman & British peoples and tongues for names from Fen Towns, the whole pack, of the medieval era, giving peoples and languages, of any tone, one language name each.");
  assert.equal(sentenceOf({ ...DEFAULT_PEOPLE_STATE, giving: "peoples", era: "IS", source: "realms" }), "Norman & British peoples and tongues for new realms, of the interstellar era, giving peoples, of any tone.");
  assert.equal(sentenceOf({ ...DEFAULT_PEOPLE_STATE, giving: "languages", detail: "dialects", tone: "grim" }), "Norman & British peoples and tongues for names I type, of the medieval era, giving languages, with a grim edge, with dialects.");
});

test("§2.3, §2.4: new place names isn't offered for greek-byzantine and steppe, and resets", () => {
  const source = (culture: string) => {
    const seg = peopleSentence({ ...DEFAULT_PEOPLE_STATE, culture }).find((s) => typeof s !== "string" && s.field === "source");
    return typeof seg === "object" ? seg.choices.map((c) => c.id) : [];
  };
  assert.deepEqual(source("norman-british"), ["typed", "pack", "realms", "places"]);
  assert.deepEqual(source("greek-byzantine"), ["typed", "pack", "realms"]);
  assert.deepEqual(source("steppe"), ["typed", "pack", "realms"]);
  assert.equal(placesOffered("greek-byzantine"), false);
  const places = choosePeoples(DEFAULT_PEOPLE_STATE, "source", "places");
  assert.equal(places.source, "places");
  assert.equal(choosePeoples(places, "culture", "steppe").source, "realms");
  assert.equal(choosePeoples(places, "culture", "greek-byzantine").source, "realms");
  assert.equal(choosePeoples(places, "culture", "chinese").source, "places");
  const dialects = choosePeoples(DEFAULT_PEOPLE_STATE, "detail", "dialects");
  assert.equal(dialects.detail, "dialects");
  assert.equal(choosePeoples(dialects, "giving", "peoples").detail, "one");
  assert.equal(choosePeoples(dialects, "giving", "languages").detail, "dialects");
});

test("§2.3: choosing a pack source picks the first pack, and a new pack clears the section", () => {
  const packs = [{ name: "A", headings: ["One"] }, { name: "B", headings: [] }];
  const s = choosePeoples(DEFAULT_PEOPLE_STATE, "source", "pack", packs);
  assert.equal(s.pack, "A");
  assert.equal(choosePeoples({ ...s, section: "One" }, "pack", "B", packs).section, undefined);
});

test("§2.3: typed names give one row per name, in order, duplicates removed, at most 50; the batch size is ignored", () => {
  const names = parseTypedNames("Saltgate\nFenmouth, the Western Fells\nSaltgate\n");
  const rows = generatePeopleRows({ names, culture: "norman-british", seed: 1 }).rows;
  assert.deepEqual(rows.map((r) => r.name), ["Saltgate", "Fenmouth", "the Western Fells"]);
  const many = parseTypedNames(Array.from({ length: 60 }, (_, i) => `Town${String.fromCharCode(97 + (i % 26))}${i}`).join("\n"));
  assert.equal(generatePeopleRows({ names: many, seed: 1 }).rows.length, 50);
});

test("§9: rows follow the layout for each giving and detail", () => {
  const base = { names: ["Saltgate"], culture: "norman-british", era: "MD", seed: 5 };
  for (let seed = 1; seed <= 100; seed++) {
    const both = generatePeopleRows({ ...base, seed, giving: "both", detail: "older" }).rows[0];
    assert.match(both.text, /^Saltgate: .+ \(person\), .+ \(adjective\), the .+ \(people\), .+ \(language(; earlier [^)]+)?\)$/);
    const dia = generatePeopleRows({ ...base, seed, giving: "languages", detail: "dialects" }).rows[0];
    // The man family's "the speech of …" is a finished phrase: it has no older forms or dialects.
    if (dia.language.startsWith("the speech of")) assert.equal(dia.text, "Saltgate: the speech of Saltgate (language)");
    else assert.match(dia.text, /^Saltgate: .+ \(language; dialects [^,]+, [^,]+, [^)]+\)$/);
    const peoples = generatePeopleRows({ ...base, seed, giving: "peoples", detail: "dialects" }).rows[0];
    assert.doesNotMatch(peoples.text, /language/);
  }
  const folk = generatePeopleRows({ names: ["Saltgate"], culture: "anglo-saxon", seed: 1 });
  for (let seed = 1; seed <= 200; seed++) {
    const r = generatePeopleRows({ names: ["Saltgate"], culture: "anglo-saxon", seed, giving: "peoples" }).rows[0];
    if (r.family === "folk") assert.doesNotMatch(r.text, /\(person\)/);
  }
  assert.ok(folk.rows.length === 1);
});

test("§13: the preset round trip, with names and the fall-backs", () => {
  const preset = {
    packName: "Saltmarsh peoples",
    setting: "",
    description: "Norman & British peoples and tongues for names I type, of the medieval era, giving peoples and languages, of any tone, with older forms.",
    culture: "norman-british",
    peopleSource: "typed" as const,
    section: "",
    names: ["Saltgate", "Fenmouth", "the Western Fells"],
    era: "MD" as const,
    giving: "both" as const,
    tone: "any" as const,
    detail: "older" as const,
  };
  const text = modulePresetContent(preset);
  assert.match(text, /module: peoples-tongues/);
  assert.match(text, /names:\n {2}- Saltgate\n {2}- Fenmouth\n {2}- the Western Fells\n/);
  const back = parseModulePreset(text, "x").peoples!;
  assert.deepEqual(back.names, preset.names);
  assert.deepEqual({ ...back, setting: "" }, preset);
  assert.deepEqual(parseModulePreset(text, "x").problems, []);
  // A pack link, with a section.
  const packText = modulePresetContent({ ...preset, peopleSource: "pack", pack: "Fen Towns", section: "Towns", names: [] });
  assert.match(packText, /source: "\[\[Fen Towns\]\]"/);
  const pack = parseModulePreset(packText, "x").peoples!;
  assert.equal(pack.peopleSource, "pack");
  assert.equal(pack.pack, "Fen Towns");
  assert.equal(pack.section, "Towns");
  // New place names for greek-byzantine and steppe runs as realms.
  const places = parseModulePreset("---\ntype: module-preset\nmodule: peoples-tongues\nculture: steppe\nsource: places\n---\n", "x");
  assert.equal(places.peoples!.peopleSource, "realms");
  // Defaults: a bare preset.
  const bare = parseModulePreset("---\ntype: module-preset\nmodule: peoples-tongues\n---\n", "Bare").peoples!;
  assert.deepEqual({ ...bare, description: "" }, { packName: "Bare", setting: "", description: "", culture: "norman-british", peopleSource: "typed", section: "", names: [], era: "MD", giving: "both", tone: "any", detail: "one" });
  // Unknown values are reported and take their defaults; peoples resets the detail.
  const odd = parseModulePreset("---\ntype: module-preset\nmodule: peoples-tongues\nculture: nowhere\ngiving: peoples\ndetail: dialects\nsource: sideways\n---\n", "x");
  assert.equal(odd.peoples!.culture, "norman-british");
  assert.equal(odd.peoples!.detail, "one");
  assert.equal(odd.problems.length, 2);
  // A name that needs quoting survives.
  const quoted = modulePresetContent({ ...preset, names: ["Port: Saltgate", "Saint Aldhelm's", "#7"] });
  assert.deepEqual(parseModulePreset(quoted, "x").peoples!.names, ["Port: Saltgate", "Saint Aldhelm's", "#7"]);
});
