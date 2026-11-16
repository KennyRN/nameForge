// Second-tier tables brief 6a §3: writes the people tables of Spanish, Portuguese, Greek and Byzantine into src/data/people.json and a section of docs/people-tables.md.
// Run with `node scripts/make-tier6a-people.mjs`. Content: scripts/tier6a/people-data.mjs. Idempotent.
import { readFileSync, writeFileSync } from "node:fs";
import { BYZANTINE, GREEK, PORTUGUESE, SPANISH } from "./tier6a/people-data.mjs";
import { serialisePeople } from "./tier6a/peopleJson.mjs";

const FILE = new URL("../src/data/people.json", import.meta.url);
const DOC = new URL("../docs/people-tables.md", import.meta.url);
const people = JSON.parse(readFileSync(FILE, "utf8"));
const problems = [];

const weight = (i) => (i < 5 ? 10 : i < 10 ? 7 : i < 16 ? 5 : i < 24 ? 3 : 2);
/** "Name^r@MD" to a table entry [name, weight, flag, eras]. */
function entries(list, { tagged, modern, recent }) {
  return list.split("|").map((raw, i) => {
    const m = raw.match(/^([^^@]+)(?:\^([rs]))?(?:@(.+))?$/);
    if (!m) throw new Error(`bad entry ${raw}`);
    const [, name, flag = "", eras = ""] = m;
    let tag = eras;
    if (modern) tag = i < 5 ? "ST MO" : recent?.has(name) || eras === "MO" ? "MO" : "ST";
    return tagged || modern ? [name, weight(i), flag, tag] : flag ? [name, weight(i), flag] : [name, weight(i)];
  });
}
function table(def, period) {
  const modern = period === "modern";
  const t = {};
  const recentM = new Set((def.recentMale ?? "").split("|"));
  const recentF = new Set((def.recentFemale ?? "").split("|"));
  t.male = entries(def.male, { tagged: !modern && /@/.test(def.male), modern, recent: recentM });
  t.female = entries(def.female, { tagged: !modern && /@/.test(def.female), modern, recent: recentF });
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
  const seen = (list, label) => {
    const names = list.map((e) => e[0].toLowerCase());
    if (new Set(names).size !== names.length) problems.push(`${where} ${label}: a name twice`);
  };
  for (const key of ["male", "female", "surnames", "regnalMale", "regnalFemale", "holy"]) if (t[key]) seen(t[key], key);
  if (t.male.length < 30 || t.female.length < 30) problems.push(`${where}: ${t.male.length} male, ${t.female.length} female`);
  if (t.surnames && t.surnames.length < 30) problems.push(`${where}: ${t.surnames.length} surnames`);
  if (t.regnalMale.length < 8 || t.regnalFemale.length < 8) problems.push(`${where}: regnal lists short`);
  if (t.holy.length < 12) problems.push(`${where}: ${t.holy.length} holy`);
  const blocked = new Set(people.blocked.map((b) => b.toLowerCase()));
  for (const e of [...t.male, ...t.female]) if (blocked.has(e[0].toLowerCase())) problems.push(`${where}: ${e[0]} is a blocked full name`);
}

const built = {};
for (const [key, def] of Object.entries({ spanish: SPANISH, portuguese: PORTUGUESE, greek: GREEK, byzantine: BYZANTINE })) {
  built[key] = {};
  for (const period of ["historic", "modern"]) {
    if (!def[period]) continue;
    if (def[period] === "copy:greek-byzantine") {
      built[key][period] = JSON.parse(JSON.stringify(people.cultures["greek-byzantine"].modern));
    } else {
      built[key][period] = table(def[period], period);
    }
    check(key, period, built[key][period]);
  }
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

// Insert the new cultures after their legacy mixes, in the file's order.
const out = {};
for (const [k, v] of Object.entries(people.cultures)) {
  if (["spanish", "portuguese", "greek", "byzantine"].includes(k)) continue;
  out[k] = v;
  if (k === "iberian") Object.assign(out, { spanish: built.spanish, portuguese: built.portuguese });
  if (k === "greek-byzantine") Object.assign(out, { greek: built.greek, byzantine: built.byzantine });
}
people.cultures = out;
Object.assign(people.families, { spanish: "romance", portuguese: "romance", greek: "classical", byzantine: "classical" });
people.resolve.greek = { historic: "greek", modern: "byzantine" };
Object.assign(people.officialTitles.bynamesCulture, { spanish: "general", portuguese: "general", greek: "greek-byzantine", byzantine: "greek-byzantine" });
writeFileSync(FILE, serialisePeople(people));

// The document section.
const fmt = (e, withEras = false) => `${e[0]} (${e[1]}${withEras && e[3] ? `, ${e[3]}` : ""})${e[2] === "r" ? "ʳ" : e[2] === "s" ? "ˢ" : ""}`;
const lines = [];
lines.push("<!-- tier6a-people:start -->", "", "## Second-tier splits (brief 6a §3)", "");
lines.push("Spanish and Portuguese are cut from the Iberian tables (which stay, as the mix); Greek and Byzantine from the Greek-and-Byzantine tables (which stay, as the mix). Written by `scripts/make-tier6a-people.mjs` from `scripts/tier6a/people-data.mjs`; same rules as the shared tables brief §3 and its review amendments (one spelling per name, right sex, people only, rulers' and saints' share by weight, era tags, no living royals).", "");
lines.push("- **Spanish and Portuguese:** each has historic and modern tables; the modern lists carry the era tags `ST`, `MO` or both and the thirteen names given most in the last thirty years. Portuguese surnames and given names (Joao, Duarte, Goncalo, Silva, Pereira) are Portuguese only; the Iberian table keeps both.");
lines.push("- **Greek:** historic only (the ancient Greek names, tagged `AN`); the modern period reads Byzantine's modern table, which is the modern Greek one. No gods; seers and priestesses in the holy list.");
lines.push("- **Byzantine:** historic (tagged `MD`; the Byzantine families as surnames) and modern (the modern Greek names, as the Greek-and-Byzantine table).", "");
for (const [key, label] of [["spanish", "Spanish"], ["portuguese", "Portuguese"], ["greek", "Greek"], ["byzantine", "Byzantine"]]) {
  lines.push(`### ${label}`, "");
  for (const period of ["historic", "modern"]) {
    const t = built[key][period];
    if (!t) {
      lines.push(`**${period}:** reads Byzantine's modern table.`, "");
      continue;
    }
    lines.push(`#### ${period}`, "");
    lines.push(`**Male given names** (${t.male.length}): ${t.male.map((e) => fmt(e, true)).join(", ")}`, "");
    lines.push(`**Female given names** (${t.female.length}): ${t.female.map((e) => fmt(e, true)).join(", ")}`, "");
    if (t.surnames) lines.push(`**Surnames** (${t.surnames.length}): ${t.surnames.map((e) => fmt(e)).join(", ")}`, "");
    lines.push(`**Regnal names, male** (${t.regnalMale.length}): ${t.regnalMale.map((e) => fmt(e)).join(", ")}`, "");
    lines.push(`**Regnal names, female** (${t.regnalFemale.length}): ${t.regnalFemale.map((e) => fmt(e)).join(", ")}`, "");
    lines.push(`**Holy names** (${t.holy.length}): ${t.holy.map((e) => fmt(e)).join(", ")}`, "");
    if (t.recentMale) lines.push(`**Given in the last thirty years:** ${t.recentMale.join(", ")}; ${t.recentFemale.join(", ")}`, "");
  }
}
lines.push("<!-- tier6a-people:end -->", "");
let doc = readFileSync(DOC, "utf8");
const start = doc.indexOf("<!-- tier6a-people:start -->");
if (start >= 0) doc = doc.slice(0, start).trimEnd() + "\n\n";
else doc = doc.trimEnd() + "\n\n";
writeFileSync(DOC, doc + lines.join("\n"));
console.log("wrote people tables for spanish, portuguese, greek, byzantine");
