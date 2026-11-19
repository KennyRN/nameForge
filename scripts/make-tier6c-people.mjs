// Second-tier tables brief 6c §B1: rewrites the people tables of Indian, Chinese, Japanese and Korean in src/data/people.json (ordinary names lead, famous figures flagged and last, no gods), and writes a section of docs/people-tables.md. Content: scripts/tier6c/people-data.mjs. Idempotent.
// (older header follows)
// already there (Egyptian, Ethiopian, Bantu, West African) and updates `resolve`, and writes a section of docs/people-tables.md. Content: scripts/tier6b/people-data.mjs. Idempotent.
import { readFileSync, writeFileSync } from "node:fs";
import { CHINESE, INDIAN, JAPANESE, KOREAN } from "./tier6c/people-data.mjs";
import { serialisePeople } from "./tier6a/peopleJson.mjs";

const FILE = new URL("../src/data/people.json", import.meta.url);
const DOC = new URL("../docs/people-tables.md", import.meta.url);
const people = JSON.parse(readFileSync(FILE, "utf8"));
const problems = [];

const weight = (i) => (i < 5 ? 10 : i < 10 ? 7 : i < 16 ? 5 : i < 24 ? 3 : 2);
function entries(list, { modern, recent, eras }) {
  return list.split("|").map((raw, i) => {
    const m = raw.match(/^([^^@]+)(?:\^([rs]))?(?:@(.+))?$/);
    if (!m) throw new Error(`bad entry ${raw}`);
    const [, name, flag = ""] = m;
    let tag = "";
    if (modern) tag = i < 5 ? "ST MO" : recent?.has(name) ? "MO" : "ST";
    else if (eras) tag = eras;
    return modern || eras ? [name, weight(i), flag, tag] : flag ? [name, weight(i), flag] : [name, weight(i)];
  });
}
/** A list with the recent names it lacks added at its end (a recent name is always in its list). */
const withRecent = (list, recent) => { const have = new Set(list.split("|").map((x) => x.replace(/[\^@].*/, ""))); return [list, ...(recent ?? "").split("|").filter((n) => n && !have.has(n))].join("|"); };
function table(def, period, historicEras) {
  const modern = period === "modern";
  const recentM = new Set((def.recentMale ?? "").split("|"));
  const recentF = new Set((def.recentFemale ?? "").split("|"));
  const t = {
    male: entries(withRecent(def.male, def.recentMale), { modern, recent: recentM, eras: modern ? undefined : historicEras }),
    female: entries(withRecent(def.female, def.recentFemale), { modern, recent: recentF, eras: modern ? undefined : historicEras }),
  };
  if (def.surnames) t.surnames = entries(def.surnames, {});
  t.regnalMale = entries(def.regnalMale, {});
  t.regnalFemale = entries(def.regnalFemale, {});
  t.holy = entries(def.holy, {});
  if (modern) {
    t.recentMale = def.recentMale.split("|");
    t.recentFemale = def.recentFemale.split("|");
  }
  t.holyForms = def.holyForms;
  t.rulerForms = def.rulerForms;
  return t;
}
function check(culture, period, t) {
  const where = `${culture} ${period}`;
  for (const key of ["male", "female", "surnames", "regnalMale", "regnalFemale", "holy"]) {
    if (!t[key]) continue;
    const names = t[key].map((e) => e[0].toLowerCase());
    if (new Set(names).size !== names.length) problems.push(`${where} ${key}: a name twice`);
  }
  if (t.male.length < 30 || t.female.length < 30) problems.push(`${where}: ${t.male.length} male, ${t.female.length} female`);
  if (t.regnalMale.length < 8 || t.regnalFemale.length < 8) problems.push(`${where}: regnal lists short`);
  if (t.holy.length < 12) problems.push(`${where}: ${t.holy.length} holy`);
  for (const key of ["male", "female"]) {
    const flagged = t[key].filter((e) => e[2] === "r");
    if (flagged.length * 5 > t[key].length) problems.push(`${where} ${key}: ${flagged.length} flagged of ${t[key].length}`);
    const w = flagged.reduce((a, e) => a + e[1], 0);
    if (w * 5 > t[key].reduce((a, e) => a + e[1], 0)) problems.push(`${where} ${key}: flagged weight over a fifth`);
  }
  const blocked = new Set(people.blocked.map((b) => b.toLowerCase()));
  for (const e of [...t.male, ...t.female]) if (blocked.has(e[0].toLowerCase())) problems.push(`${where}: ${e[0]} is a blocked full name`);
}

const before = {};
const built = {};
for (const [key, def] of Object.entries({ indian: INDIAN, chinese: CHINESE, japanese: JAPANESE, korean: KOREAN })) {
  built[key] = {};
  before[key] = {};
  for (const period of ["historic", "modern"]) {
    const old = people.cultures[key][period];
    before[key][period] = { male: old.male.slice(0, 10).map((e) => `${e[0]}:${e[1]}`), female: old.female.slice(0, 10).map((e) => `${e[0]}:${e[1]}`) };
    const t = table({ ...def[period] }, period, period === "historic" ? "" : undefined);
    // Kept as they are: the surnames, the forms of address and the ruler forms.
    if (old.surnames) t.surnames = old.surnames;
    t.holyForms = old.holyForms;
    t.rulerForms = old.rulerForms;
    built[key][period] = t;
    check(key, period, t);
  }
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
for (const [key, tables] of Object.entries(built)) for (const period of ["historic", "modern"]) people.cultures[key][period] = tables[period];
writeFileSync(FILE, serialisePeople(people));


const fmt = (e, withEras = false) => `${e[0]} (${e[1]}${withEras && e[3] ? `, ${e[3]}` : ""})${e[2] === "r" ? "ʳ" : e[2] === "s" ? "ˢ" : ""}`;
const lines = ["<!-- tier6c-people:start -->", "", "## Second-tier people tables, batch 6c (brief 6c §B1)", ""];
lines.push("Indian, Chinese, Japanese and Korean, rewritten: ordinary attested names lead each list; rulers, generals, sages, poets and founders are flagged (ʳ) and held last, at a fifth or less; no god's name. Chinese, Japanese and Korean full names are family name first. Romanisation: pinyin; Hepburn without macrons; Revised Romanisation. Written by `scripts/make-tier6c-people.mjs` from `scripts/tier6c/people-data.mjs`.", "");
for (const [key, label] of [["indian", "Indian"], ["chinese", "Chinese"], ["japanese", "Japanese"], ["korean", "Korean"]]) {
  lines.push(`### ${label}`, "");
  for (const period of ["historic", "modern"]) {
    const t = built[key][period];
    lines.push(`#### ${period}`, "", `**Before, first ten male:** ${before[key][period].male.join(", ")}`, "", `**After, first ten male:** ${t.male.slice(0, 10).map((e) => `${e[0]}:${e[1]}`).join(", ")}`, "", `**Before, first ten female:** ${before[key][period].female.join(", ")}`, "", `**After, first ten female:** ${t.female.slice(0, 10).map((e) => `${e[0]}:${e[1]}`).join(", ")}`, "");
    lines.push(`**Male given names** (${t.male.length}): ${t.male.map((e) => fmt(e, true)).join(", ")}`, "", `**Female given names** (${t.female.length}): ${t.female.map((e) => fmt(e, true)).join(", ")}`, "");
    lines.push(`**Regnal names, male:** ${t.regnalMale.map((e) => fmt(e)).join(", ")}`, "", `**Regnal names, female:** ${t.regnalFemale.map((e) => fmt(e)).join(", ")}`, "", `**Holy and wise:** ${t.holy.map((e) => fmt(e)).join(", ")}`, "");
  }
}
lines.push("<!-- tier6c-people:end -->", "");
let doc = readFileSync(DOC, "utf8");
const start = doc.indexOf("<!-- tier6c-people:start -->");
doc = (start >= 0 ? doc.slice(0, start) : doc).trimEnd() + "\n\n";
writeFileSync(DOC, doc + lines.join("\n"));
console.log("wrote people tables for indian, chinese, japanese, korean");
