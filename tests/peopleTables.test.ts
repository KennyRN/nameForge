// Shared tables brief §3 (M2): the core people tables, how a culture, region and era pick one,
// and the slot forms. Names are in src/data/people.json; docs/people-tables.md is the review copy.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import PEOPLE from "../src/data/people.json";
import { mulberry32 } from "../src/markov";
import { entryEras, entryFlag, eraWeights, otherCulture, PEOPLE_CULTURES, peopleCultureFor, peoplePeriod, peopleSourceFor, peopleTable, type PeopleEntry, type PeoplePeriod } from "../src/people";
import TEMPLATES from "../src/data/builtin-templates.json";

const CORE = ["anglo-saxon", "norman-british", "welsh", "scottish", "irish", "cornish", "scandinavian", "german"];
const PERIODS: PeoplePeriod[] = ["historic", "modern"];
/** Periods where the culture named people by patronymic, so it has no surname list. */
const NO_SURNAMES = new Set(["anglo-saxon/historic", "welsh/historic", "scandinavian/historic"]);
/** Minimums (review amendment: a list may be larger when a built-in template is). */
const SIZES = { male: 60, female: 60, surnames: 60, regnalMale: 15, regnalFemale: 15, holy: 24 } as const;

test("every core culture has the periods the brief names: Anglo-Saxon historic only, the rest both", () => {
  assert.deepEqual([...PEOPLE_CULTURES].sort(), [...CORE].sort());
  for (const c of CORE) {
    for (const p of PERIODS) {
      const expected = !(c === "anglo-saxon" && p === "modern");
      assert.equal(!!peopleTable(c, p), expected, `${c}/${p}`);
    }
  }
});

test("list sizes meet the §3.1 minimums for the core cultures", () => {
  for (const c of CORE) {
    for (const p of PERIODS) {
      const t = peopleTable(c, p);
      if (!t) continue;
      for (const [k, n] of Object.entries(SIZES)) {
        const list = (t as unknown as Record<string, PeopleEntry[] | undefined>)[k];
        if (k === "surnames" && NO_SURNAMES.has(`${c}/${p}`)) {
          assert.equal(list, undefined, `${c}/${p} has no surnames`);
          continue;
        }
        assert.ok((list?.length ?? 0) >= n, `${c}/${p}/${k}: ${list?.length} < ${n}`);
      }
      assert.ok(t.holyForms.length > 0 && t.rulerForms.male.length > 0 && t.rulerForms.female.length > 0, `${c}/${p} forms`);
    }
  }
});

test("no duplicates in a list, every weight a positive whole number, and at most a fifth royal or saintly", () => {
  for (const c of CORE) {
    for (const p of PERIODS) {
      const t = peopleTable(c, p);
      if (!t) continue;
      for (const k of ["male", "female", "surnames", "regnalMale", "regnalFemale", "holy"] as const) {
        const list = t[k];
        if (!list) continue;
        const names = list.map((e) => e[0].toLowerCase());
        assert.equal(new Set(names).size, names.length, `${c}/${p}/${k} has a duplicate`);
        for (const [name, w] of list) assert.ok(Number.isInteger(w) && w > 0, `${c}/${p}/${k}/${name} weight`);
      }
      for (const k of ["male", "female", "surnames"] as const) {
        const list = t[k];
        if (!list) continue;
        const flagged = list.filter((e) => entryFlag(e) !== "").length;
        assert.ok(flagged <= list.length / 5, `${c}/${p}/${k}: ${flagged} royal or saintly names of ${list.length}`);
      }
      for (const forms of [t.holyForms, t.rulerForms.male, t.rulerForms.female]) assert.equal(forms.reduce((s, f) => s + f[1], 0), 100, `${c}/${p} form weights`);
    }
  }
});

test("names are real-looking: no digits, brackets or blanks", () => {
  for (const c of CORE) {
    for (const p of PERIODS) {
      const t = peopleTable(c, p);
      if (!t) continue;
      for (const k of ["male", "female", "surnames", "regnalMale", "regnalFemale", "holy"] as const) {
        for (const [name] of t[k] ?? []) assert.match(name, /^[A-Za-z' -]+$/, `${c}/${p}/${k}/${name}`);
      }
    }
  }
});

test("slot forms: each form set sums to 100, with surnames and without", () => {
  const forms = PEOPLE.slotForms as unknown as Record<string, { withSurnames?: [string, number][]; withoutSurnames?: [string, number][]; forms?: [string, number][]; sexShare?: { male: number; female: number } }>;
  for (const [slot, f] of Object.entries(forms)) {
    for (const key of ["withSurnames", "withoutSurnames", "forms"] as const) {
      const set = f[key];
      if (set) assert.equal(set.reduce((s, x) => s + x[1], 0), 100, `${slot}/${key}`);
    }
    if (f.sexShare) assert.equal(f.sexShare.male + f.sexShare.female, 100, `${slot} sex share`);
  }
  // The §3.4 weights for the first slots, exactly.
  assert.deepEqual(forms.founder.withSurnames, [["{s}", 60], ["{g} {s}", 15], ["{g}", 25]]);
  assert.deepEqual(forms.founder.withoutSurnames, [["{g}", 100]]);
  assert.deepEqual(forms.official.withSurnames, [["{s}", 50], ["{t} {s}", 30], ["{g} {s}", 20]]);
  assert.deepEqual(forms.person.withSurnames, [["{g}", 85], ["{s}", 15]]);
  assert.deepEqual(forms.monarch.forms, [["{r}", 50], ["{rm}", 50]]);
  assert.deepEqual(forms.royalWoman.forms, [["{rf}", 70], ["Queen {rf}", 30]]);
  assert.deepEqual(forms.house.withSurnames, [["{s}", 70], ["House of {s}", 30]]);
  // Every slot the M1 filler knows has a form here.
  const fill = JSON.parse(readFileSync("src/data/fill.json", "utf8")) as { labels: Record<string, { source: string; slot?: string }> };
  for (const [label, info] of Object.entries(fill.labels)) {
    if (info.source === "person" || info.source === "holy") assert.ok(forms[info.slot!], `${label} → ${info.slot}`);
  }
});

test("period: AN, MD and EM read historic; ST, MO, NF and IS read modern", () => {
  for (const e of ["AN", "MD", "EM"]) assert.equal(peoplePeriod(e), "historic");
  for (const e of ["ST", "MO", "NF", "IS", "modern", "scifi"]) assert.equal(peoplePeriod(e), "modern");
});

test("resolving a culture: legacy and lens keys, the Welsh, Scottish and Cornish views, Celtic", () => {
  const rng = mulberry32(1);
  assert.equal(peopleCultureFor("general", undefined, rng), "norman-british");
  assert.equal(peopleCultureFor("norse", undefined, rng), "scandinavian");
  assert.equal(peopleCultureFor("scandinavian", undefined, rng), "scandinavian");
  assert.equal(peopleCultureFor("norman-british", "NTH", rng), "norman-british");
  assert.equal(peopleCultureFor("anglo-saxon", undefined, rng, "historic"), "anglo-saxon");
  assert.equal(peopleCultureFor("anglo-saxon", undefined, rng, "modern"), "norman-british");
  // The views.
  assert.equal(peopleCultureFor("celtic", "WAL", rng), "welsh");
  assert.equal(peopleCultureFor("celtic", "COR", rng), "cornish");
  for (const r of ["SBL", "SLO", "SHH", "NSI"]) assert.equal(peopleCultureFor("celtic", r, rng), "scottish", r);
  // The lens keys resolve to themselves.
  for (const c of ["welsh", "scottish", "irish", "cornish", "german"]) assert.equal(peopleCultureFor(c, undefined, rng), c);
  // A culture with no table yet gives nothing.
  assert.equal(peopleCultureFor("japanese", undefined, rng), undefined);
  assert.equal(peopleCultureFor("french", undefined, rng), undefined);
});

test("Celtic with no region, or another region, draws evenly from the four Celtic cultures", () => {
  for (const region of [undefined, "NTH", "SEA"]) {
    const rng = mulberry32(7);
    const counts: Record<string, number> = {};
    const n = 8000;
    for (let i = 0; i < n; i++) {
      const c = peopleCultureFor("celtic", region, rng)!;
      counts[c] = (counts[c] ?? 0) + 1;
    }
    assert.deepEqual(Object.keys(counts).sort(), ["cornish", "irish", "scottish", "welsh"], String(region));
    for (const [c, k] of Object.entries(counts)) assert.ok(Math.abs(k / n - 0.25) < 0.03, `${region} ${c} ${k / n}`);
  }
});

test("the near future: a quarter of names from other cultures' modern lists, weighted towards the same family", () => {
  const rng = mulberry32(3);
  const n = 12000;
  let own = 0;
  const others: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    const s = peopleSourceFor("welsh", undefined, "NF", rng)!;
    assert.equal(s.period, "modern");
    if (s.culture === "welsh") own++;
    else others[s.culture] = (others[s.culture] ?? 0) + 1;
  }
  assert.ok(Math.abs(own / n - 0.75) < 0.03, `own share ${own / n}`);
  // Anglo-Saxon has no modern table, so it never takes part; the British cultures outweigh the Germanic ones.
  assert.equal(others["anglo-saxon"], undefined);
  const british = ["norman-british", "scottish", "irish", "cornish"].reduce((s, c) => s + (others[c] ?? 0), 0);
  const germanic = (others.scandinavian ?? 0) + (others.german ?? 0);
  assert.ok(british > germanic * 4, `british ${british} germanic ${germanic}`);
  // In the historic eras every name is the culture's own.
  const r2 = mulberry32(5);
  for (let i = 0; i < 200; i++) assert.equal(peopleSourceFor("welsh", undefined, "MD", r2)!.culture, "welsh");
  assert.equal(otherCulture("welsh", mulberry32(1)) !== "welsh", true);
});

test("a state's table: Welsh historic and modern are different lists; Scottish Highlands read Scottish", () => {
  const rng = mulberry32(2);
  const h = peopleSourceFor("celtic", "SHH", "MD", rng)!;
  assert.equal(h.culture, "scottish");
  assert.equal(h.period, "historic");
  const w = peopleSourceFor("celtic", "WAL", "MO", rng)!;
  assert.equal(w.culture, "welsh");
  assert.equal(w.period, "modern");
  assert.notDeepEqual(peopleTable("welsh", "historic")!.male, peopleTable("welsh", "modern")!.male);
});

test("the module reads only its own data: no Obsidian, no engines", () => {
  const src = readFileSync("src/people.ts", "utf8");
  const imports = [...src.matchAll(/^import .* from "([^"]+)";/gm)].map((m) => m[1]);
  assert.deepEqual(imports, ["./data/people.json"]);
});

// ── Review amendment (brief §12): rules for every table, checked by code ─────────────────────────

type Lists = Record<string, PeopleEntry[] | undefined>;
const LISTS = ["male", "female", "surnames", "regnalMale", "regnalFemale", "holy"] as const;
/** Every table of every culture and period, with its path. */
function allTables(): { path: string; culture: string; period: PeoplePeriod; table: NonNullable<ReturnType<typeof peopleTable>> }[] {
  const out: { path: string; culture: string; period: PeoplePeriod; table: NonNullable<ReturnType<typeof peopleTable>> }[] = [];
  for (const culture of PEOPLE_CULTURES) {
    for (const period of PERIODS) {
      const table = peopleTable(culture, period);
      if (table) out.push({ path: `${culture}/${period}`, culture, period, table });
    }
  }
  return out;
}
const lists = (t: object): [string, PeopleEntry[]][] => LISTS.flatMap((k) => ((t as Lists)[k] ? [[k, (t as Lists)[k]!] as [string, PeopleEntry[]]] : []));

/** Spellings of one name that never appear together in a list (rule 1). */
const VARIANT_GROUPS: string[][] = [
  ["Edith", "Eadgyth", "Edyth"], ["Godiva", "Godgifu"], ["Ethelfleda", "Aethelflaed", "Ethelflaed"], ["Aldgyth", "Ealdgyth"], ["Edburga", "Eadburh", "Eadburg"], ["Ethelwyn", "Aethelwyn"],
  ["Gwladus", "Gwladys"], ["Eluned", "Eiluned"], ["Gwerful", "Gwerfyl"], ["Griffith", "Gruffudd"], ["David", "Dafydd"], ["Llywelyn", "Llewelyn"],
  ["Conor", "Connor"], ["Donal", "Domhnall"], ["Teigue", "Tadc"], ["Dermot", "Diarmaid"], ["Rory", "Ruaidri", "Ruairi"], ["Owen", "Eoghan"], ["Aidan", "Aedan"],
  ["Sive", "Sadb", "Sadhbh"], ["Maeve", "Medb"], ["Gormlaith", "Gormflaith"], ["Emer", "Eimhear"], ["Eileen", "Eibhlin", "Aibhilin"], ["Finola", "Fionnuala"],
  ["Elspeth", "Elspet"], ["Euphemia", "Eufemia"], ["Bride", "Brigid"], ["Mor", "Mora"], ["Isobel", "Ishbel"], ["Hector", "Eachann"], ["Donald", "Domhnall"], ["Dugald", "Dougal"],
  ["Giffard", "Gifford"], ["Walpurga", "Walburga"], ["Ottilie", "Odilia"], ["Ermentrud", "Irmentrud"], ["Margarethe", "Margret"], ["Kieran", "Ciaran"], ["Thomas", "Tomas"],
  ["Nora", "Norah"], ["Kathleen", "Cathleen"], ["Callum", "Calum"], ["Ewan", "Euan"], ["Lilian", "Lillian"], ["Lawrence", "Laurence"], ["Clarke", "Clark"], ["Davies", "Davis"],
  ["Meyer", "Meier", "Maier", "Mayer"], ["Schmidt", "Schmitt", "Schmid"], ["Hoffmann", "Hofmann"], ["Schulz", "Schulze"], ["Tremayne", "Tremain"], ["Nils", "Niels"],
];

test("rule 1: one spelling per name per list: no plain duplicate and none of the known variant groups together", () => {
  for (const { path, table } of allTables()) {
    for (const [k, list] of lists(table)) {
      const names = new Set(list.map((e) => e[0]));
      for (const group of VARIANT_GROUPS) {
        const present = group.filter((n) => names.has(n));
        assert.ok(present.length < 2, `${path}/${k} holds variants of one name: ${present.join(", ")}`);
      }
    }
  }
});

test("rule 2: Old English names in modern English forms: no Ae- or Ea- spellings in the Anglo-Saxon table", () => {
  const t = peopleTable("anglo-saxon", "historic")!;
  for (const [k, list] of lists(t)) for (const [name] of list) assert.ok(!/^(Ae|Ea)/.test(name), `anglo-saxon/${k}/${name}`);
});

test("rule 3: German umlauts as ae, oe, ue and ß as ss", () => {
  const stripped = ["Muller", "Schroder", "Kruger", "Konig", "Jager", "Forster", "Schafer", "Moller", "Kohler", "Jurgen", "Gunter", "Kramer"];
  for (const period of PERIODS) {
    const t = peopleTable("german", period)!;
    for (const [k, list] of lists(t)) {
      for (const [name] of list) {
        assert.ok(!stripped.includes(name), `german/${period}/${k}/${name} lost its umlaut`);
        assert.ok(!/ß/.test(name), name);
      }
    }
  }
  const surnames = (peopleTable("german", "modern")!.surnames ?? []).map((e) => e[0]);
  for (const n of ["Mueller", "Schroeder", "Krueger", "Koenig", "Schaefer", "Moeller", "Koehler"]) assert.ok(surnames.includes(n), n);
});

test("rule 4: right sex: no name in both a male and a female list of a table, and no known male saint among the women", () => {
  const maleSaints = ["Ethernan", "Maelrubha", "Brynach", "Cainnech", "Elwyn"];
  for (const { path, table } of allTables()) {
    const male = new Set(table.male.map((e) => e[0]));
    for (const [name] of table.female) {
      assert.ok(!male.has(name), `${path}: ${name} is in both the male and the female list`);
      assert.ok(!maleSaints.includes(name), `${path}: ${name} is a male saint in the female list`);
    }
  }
});

test("rule 5: people only: nothing from myth or a name element in a historic list, and the revived names modern only", () => {
  const notPeople = ["Rosc", "Duibh", "Cenarth", "Mac", "Gilla", "Math", "Pryderi", "Cuchulainn", "Nuadu", "Tailltiu", "Fand", "Cliodna", "Scathach", "Fingal", "Kriemhild", "Brunhild", "Eir", "Starkad", "Torf", "Cacht", "Moriath", "Mugain"];
  for (const { path, table, period } of allTables()) {
    if (period !== "historic") continue;
    for (const [k, list] of lists(table)) for (const [name] of list) assert.ok(!notPeople.includes(name), `${path}/${k}/${name}`);
  }
  const welshHistoric = peopleTable("welsh", "historic")!;
  for (const n of ["Rhiannon", "Branwen", "Olwen", "Haf", "Brynach"]) assert.ok(!welshHistoric.female.some((e) => e[0] === n), `welsh historic female ${n}`);
  const irishHistoric = peopleTable("irish", "historic")!;
  for (const n of ["Deirdre", "Niamh"]) assert.ok(!irishHistoric.female.some((e) => e[0] === n), `irish historic female ${n}`);
  assert.ok(peopleTable("welsh", "modern")!.female.some((e) => e[0] === "Rhiannon"));
});

test("rule 6: no living royals among the regnal names", () => {
  for (const { path, table } of allTables()) for (const [name] of table.regnalFemale) assert.ok(!["Silvia", "Sonja"].includes(name), `${path}: ${name}`);
  assert.ok(peopleTable("scandinavian", "modern")!.regnalFemale.some((e) => e[0] === "Margrethe"));
  assert.ok(peopleTable("scandinavian", "modern")!.regnalMale.some((e) => e[0] === "Harald"));
});

test("rule 7: English forms only in holy and ruler forms", () => {
  const foreign = /\b(Sant|Sen|Naomh|Sankt|Kaiser|Kaiserin)\b/;
  for (const { path, table } of allTables()) {
    const forms = [...table.holyForms, ...table.rulerForms.male, ...table.rulerForms.female];
    for (const [form] of forms) assert.ok(!foreign.test(form), `${path}: ${form}`);
  }
  const german = peopleTable("german", "modern")!;
  assert.ok(german.rulerForms.male.some((f) => f[0] === "Emperor {m}") && german.rulerForms.female.some((f) => f[0] === "Empress {f}"));
});

test("rule 8: royal and saintly names carry at most a fifth of a list's weight as well as of its names (Cornish historic excepted)", () => {
  for (const { path, table } of allTables()) {
    if (path === "cornish/historic") continue;
    for (const k of ["male", "female", "surnames"] as const) {
      const list = table[k];
      if (!list) continue;
      const total = list.reduce((s, e) => s + e[1], 0);
      const flagged = list.filter((e) => entryFlag(e) !== "").reduce((s, e) => s + e[1], 0);
      assert.ok(flagged <= total / 5, `${path}/${k}: flagged weight ${flagged} of ${total}`);
    }
  }
});

test("rule 9: every modern given name is tagged ST or MO, with at least 15 of each only and 12 given in the last thirty years", () => {
  for (const { path, table, period } of allTables()) {
    if (period !== "modern") continue;
    for (const sex of ["male", "female"] as const) {
      const list = table[sex];
      for (const e of list) {
        const eras = entryEras(e);
        assert.ok(eras.length > 0 && eras.every((x) => x === "ST" || x === "MO"), `${path}/${sex}/${e[0]} era tags ${eras.join(" ")}`);
      }
      const only = (tag: string) => list.filter((e) => entryEras(e).join(" ") === tag).length;
      assert.ok(only("ST") >= 15, `${path}/${sex}: ${only("ST")} tagged ST only`);
      assert.ok(only("MO") >= 15, `${path}/${sex}: ${only("MO")} tagged MO only`);
      const recent = sex === "male" ? table.recentMale : table.recentFemale;
      assert.ok((recent?.length ?? 0) >= 12, `${path}/${sex}: ${recent?.length} recent names`);
      for (const name of recent ?? []) {
        const e = list.find((x) => x[0] === name);
        assert.ok(e && entryEras(e).includes("MO"), `${path}/${sex}/${name} is a recent name not tagged MO`);
      }
    }
  }
});

test("the era draw: 80% from names tagged with the state's era, and NF and IS prefer MO", () => {
  const t = peopleTable("norman-british", "modern")!;
  for (const era of ["ST", "MO", "NF", "IS"]) {
    const w = eraWeights(t.male, era);
    assert.equal(w.length, t.male.length);
    const tag = era === "ST" ? "ST" : "MO";
    const inShare = t.male.reduce((s, e, i) => s + (entryEras(e).includes(tag) ? w[i] : 0), 0);
    assert.ok(Math.abs(inShare - 0.8) < 1e-9, `${era} ${inShare}`);
    assert.ok(Math.abs(w.reduce((a, b) => a + b, 0) - 1) < 1e-9);
  }
  // A list without era tags is left as it is.
  const hist = peopleTable("welsh", "historic")!.male;
  assert.deepEqual(eraWeights(hist, "MD"), hist.map((e) => e[1]));
});

test("Cornish historic: Kenny's Old Cornish names tagged MD at a flat weight, a later set tagged EM at 3", () => {
  const t = peopleTable("cornish", "historic")!;
  for (const sex of ["male", "female"] as const) {
    const md = t[sex].filter((e) => entryEras(e).includes("MD"));
    const em = t[sex].filter((e) => entryEras(e).join(" ") === "EM");
    assert.ok(md.length >= 40 && em.length >= 15, `${sex}: ${md.length} MD, ${em.length} EM`);
    for (const e of md) assert.equal(e[1], 5, `${sex}/${e[0]}`);
    for (const e of em) assert.equal(e[1], 3, `${sex}/${e[0]}`);
    for (const e of t[sex]) assert.ok(entryEras(e).length > 0 && entryEras(e).every((x) => x === "MD" || x === "EM"), `${sex}/${e[0]}`);
  }
  const names = t.male.map((e) => e[0]);
  for (const n of ["Jago", "Jory", "Jowan", "Pasco", "Hicca", "Peder", "Kitto"]) assert.ok(names.includes(n), n);
  const female = t.female.map((e) => e[0]);
  for (const n of ["Jenifer", "Tamsin", "Loveday"]) assert.ok(female.includes(n), n);
  // The parish forms give way to the person: Wendrona, Newlina, Endelienta, Breaca.
  for (const n of ["Wendrona", "Newlina", "Endelienta", "Breaca"]) assert.ok(female.includes(n), n);
  for (const n of ["Wendron", "Newlyn", "Endellion", "Breage"]) assert.ok(!female.includes(n), n);
  assert.ok(!t.regnalMale.some((e) => e[0] === "Kenstec") && !t.regnalFemale.some((e) => e[0] === "Tamsin"));
});

/** A built-in template name that the table spells another way: [template name, table name, list]. */
const SPELLED: Record<string, Record<string, string>> = {
  "Old Cornish": Object.fromEntries(
    ("Austol Austell,Beniamen Benjamin,Britail Brithael,Brytthael Brithael,Budock Budoc,Cemoyre Cemoere,Cenmyn Cenmin,Cingur Cengor,Cleder Clether,Comoere Cemoere,Comuyre Cemoere,Conredeu Canredeo,Crantock Carantoc,Cury Corentin,Custentin Constantine,Cybi Cuby,Dauid David,Deui David,Erth Erc,Feock Fioc,Fingar Gwinear,Freoc Fioc,Frioc Fioc,Gorran Goran,Gothian Gwithian,Grifiuth Grifiud,Guaedret Gaudreit,Guriant Gurient,Hresman Resmen,Iohann John,Iosep Joseph,Ive Ivo,Ke Kea,Leumarh Loumarch,Levan Selevan,Louenan Lowenan,Madron Madern,Marh March,Matuith Matuid,Maugan Mawgan,Medrod Modred,Mermen Mermin,Myrmen Mermin,Oysian Osian,Petrock Petroc,Ret Ryd,Ryt Ryd,Sampson Samson,Sennen Senan,Terithien Terithian,Ungust Ungost,Uny Euny,Winnow Winnoc,Winwaloe Gunwalloe,Wurcant Gurcant,Wurci Gurci,Wurcon Gurcon,Wurgent Gurient,Wurlowen Gurlouen" +
      ",Breage Breaca,Columb Columba,Crowan Crewenna,Endellion Endelienta,Hia Ia,Illcum Ilcum,Juliot Julitta,Kew Ciwa,Keyna Keyne,Mabyn Mabena,Medguistyl Medguistl,Medhuil Meduil,Medwuistel Medguistl,Minver Menefrida,Moruiw Moruith,Newlyn Newlina,Nonna Non,Ogurcen Ourcen,Onguen Onwen,Onncum Oncum,Onwean Onwen,Ourdylyc Ourdilic,Tancwoystel Tanguistl,Tancwuestel Tanguistl,Teath Tetha,Wendron Wendrona,Wenn Wenna,Wuencen Guencen,Wuennmon Guenmon,Zennor Senara")
      .split(",")
      .map((p) => p.split(" ") as [string, string]),
  ),
  "Anglo-Saxon": Object.fromEntries(
    "Byrhthelm Brihthelm,Byrhtnoth Brihtnoth,Eadbald Edbald,Eadgar Edgar,Eadmund Edmund,Eadric Edric,Eadweard Edward,Eadwine Edwin,Eormenric Ermenric,Godwine Godwin,Leofwine Leofwin,Oswine Oswin,Æthelflaed Ethelfleda,Ceolburh Ceolburga,Cuthburh Cuthburga,Cwenburh Cwenburga,Eadburg Edburga,Eanflaed Enfleda,Eawyn Ewyn,Ethelflaed Ethelfleda,Hild Hilda,Hildeburg Hildeburga,Mathilda Matilda,Mildrith Mildred"
      .split(",")
      .map((p) => p.split(" ") as [string, string]),
  ),
  "Victorian, England": Object.fromEntries(
    // Jessie and Marion are women's names, Willie a man's: each stays in its own sex's list.
    "Charley Charlie,Laurence Lawrence,Jennie Jenny,Katherine Catherine,Kathryn Catherine,Lillie Lily,Mollie Molly,Sallie Sally".split(",").map((p) => p.split(" ") as [string, string]),
  ),
};

test("the three built-in templates feed their tables: every name goes in, once, in one spelling", () => {
  const templates = (Array.isArray(TEMPLATES) ? TEMPLATES : (TEMPLATES as { templates: unknown[] }).templates) as { name: string; sections: { name: string; items: string[] }[] }[];
  const cases: [string, string, PeoplePeriod][] = [
    ["Old Cornish", "cornish", "historic"],
    ["Anglo-Saxon", "anglo-saxon", "historic"],
    ["Victorian, England", "norman-british", "modern"],
  ];
  for (const [name, culture, period] of cases) {
    const tpl = templates.find((x) => x.name === name)!;
    const table = peopleTable(culture, period)!;
    for (const sec of tpl.sections) {
      const sex = sec.name as "male" | "female";
      const have = new Set(table[sex].map((e) => e[0]));
      for (const n of sec.items) {
        if (have.has(n)) continue;
        const target = SPELLED[name][n];
        const sexMismatch = name === "Victorian, England" && ((sex === "male" && ["Jessie", "Marion"].includes(n)) || (sex === "female" && n === "Willie"));
        assert.ok(sexMismatch || (target && have.has(target)), `${name}/${sex}: "${n}" is neither in the ${culture} table nor a spelling of a name in it`);
      }
      if (name === "Victorian, England") {
        for (const e of table[sex].filter((x) => sec.items.includes(x[0]))) assert.ok(entryEras(e).includes("ST"), `${sex}/${e[0]} should carry ST`);
      }
    }
  }
  // Jessie, Marion and Willie each stay with their own sex.
  const vm = new Set(peopleTable("norman-british", "modern")!.male.map((e) => e[0]));
  const vf = new Set(peopleTable("norman-british", "modern")!.female.map((e) => e[0]));
  assert.ok(vm.has("Willie") && !vf.has("Willie") && vf.has("Jessie") && vf.has("Marion") && !vm.has("Jessie") && !vm.has("Marion"));
  // The templates themselves are untouched: the variants are still there for the Markov models.
  const old = templates.find((x) => x.name === "Old Cornish")!;
  assert.equal(old.sections.find((x) => x.name === "male")!.items.length, 149);
  assert.equal(old.sections.find((x) => x.name === "female")!.items.length, 73);
  assert.equal(templates.find((x) => x.name === "Anglo-Saxon")!.sections.find((x) => x.name === "male")!.items.length, 77);
  assert.equal(templates.find((x) => x.name === "Victorian, England")!.sections.find((x) => x.name === "female")!.items.length, 168);
});

test("Norman and British modern holds 18th-century and current names beside the Victorian ones", () => {
  const t = peopleTable("norman-british", "modern")!;
  const male = new Set(t.male.map((e) => e[0]));
  const female = new Set(t.female.map((e) => e[0]));
  for (const n of ["Samuel", "Joseph", "Benjamin", "Josiah", "Isaac", "Oliver", "Jack", "Noah", "Leo"]) assert.ok(male.has(n), n);
  for (const n of ["Hannah", "Ann", "Martha", "Susannah", "Phoebe", "Olivia", "Amelia", "Isla", "Ava"]) assert.ok(female.has(n), n);
});

test("fill.json: [battle], [ship] and [company] have a source of their own", () => {
  const fill = JSON.parse(readFileSync("src/data/fill.json", "utf8")) as { labels: Record<string, { source: string }>; stayBracketed: Record<string, string>; sources: Record<string, string> };
  for (const l of ["battle", "ship", "company"]) {
    assert.equal(fill.labels[l]?.source, l);
    assert.ok(fill.sources[l]);
    assert.equal(fill.stayBracketed[l], undefined);
  }
});
