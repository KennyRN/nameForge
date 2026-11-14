// Shared tables brief §3 (M2): the core people tables, how a culture, region and era pick one,
// and the slot forms. Names are in src/data/people.json; docs/people-tables.md is the review copy.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import PEOPLE from "../src/data/people.json";
import { mulberry32 } from "../src/markov";
import { otherCulture, PEOPLE_CULTURES, peopleCultureFor, peoplePeriod, peopleSourceFor, peopleTable, type PeopleEntry, type PeoplePeriod } from "../src/people";

const CORE = ["anglo-saxon", "norman-british", "welsh", "scottish", "irish", "cornish", "scandinavian", "german"];
const PERIODS: PeoplePeriod[] = ["historic", "modern"];
/** Periods where the culture named people by patronymic, so it has no surname list. */
const NO_SURNAMES = new Set(["anglo-saxon/historic", "welsh/historic", "scandinavian/historic"]);
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

test("list sizes meet §3.1 for the core cultures", () => {
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
        assert.equal(list?.length, n, `${c}/${p}/${k}`);
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
        const flagged = list.filter((e) => e.length > 2).length;
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
