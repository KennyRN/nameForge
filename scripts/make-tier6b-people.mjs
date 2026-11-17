// Second-tier tables brief 6b §B4: writes the people tables of Turkic, Mongol, Arabic and Persian into src/data/people.json, flags the famous figures of the four cultures
// already there (Egyptian, Ethiopian, Bantu, West African) and updates `resolve`, and writes a section of docs/people-tables.md. Content: scripts/tier6b/people-data.mjs. Idempotent.
import { readFileSync, writeFileSync } from "node:fs";
import { ARABIC, MONGOL, PERSIAN, TURKIC } from "./tier6b/people-data.mjs";
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

const built = {};
for (const [key, def] of Object.entries({ turkic: TURKIC, mongol: MONGOL, arabic: ARABIC, persian: PERSIAN })) {
  built[key] = {};
  for (const period of ["historic", "modern"]) {
    built[key][period] = table(def[period], period, period === "historic" ? "" : undefined);
    check(key, period, built[key][period]);
  }
}

// §B4 (6a fixes §4): the famous figures of the four cultures already there are flagged and moved last; at most a fifth of a list.
const FLAG = {
  "egyptian.historic.male": ["Ramesses", "Tutankhamun", "Akhenaten", "Thutmose", "Amenhotep", "Khufu", "Ptolemy"],
  "egyptian.historic.female": ["Nefertiti", "Hatshepsut", "Cleopatra", "Nefertari", "Hypatia", "Ankhesenamun", "Tiye"],
  "ethiopian.historic.male": ["Lalibela", "Menelik", "Tewodros", "Ezana", "Kaleb", "Zara Yaqob"],
  "ethiopian.historic.female": ["Mentewab", "Taytu", "Zewditu", "Menen", "Judith", "Sabla Wengel"],
  "ethiopian.modern.male": ["Menelik", "Tewodros"],
  "ethiopian.modern.female": ["Taytu", "Zewditu", "Menen"],
  "bantu.historic.male": ["Shaka", "Dingane", "Cetshwayo", "Moshoeshoe", "Mzilikazi", "Mutesa"],
  "bantu.historic.female": ["Nandi", "Mnkabayi", "Manthatisi", "Nzinga", "Kimpa Vita", "Nehanda"],
  "west-african.historic.male": ["Sundiata", "Sunni Ali", "Askia", "Osei Tutu", "Samori", "Opoku Ware"],
  "west-african.historic.female": ["Yaa Asantewaa", "Nana Asma'u", "Sarraounia", "Idia", "Ahebi Ugbabe", "Ndate Yalla"],
};
for (const [path, names] of Object.entries(FLAG)) {
  const [c, period, sex] = path.split(".");
  const t = people.cultures[c][period];
  const mark = new Set(names);
  const keep = t[sex].map((e) => [...e]);
  const ordered = [...keep.filter((e) => !mark.has(e[0])), ...keep.filter((e) => mark.has(e[0])).map((e) => { const x = [...e]; x[2] = "r"; return x; })];
  const hasEra = keep.some((e) => e[3] !== undefined);
  t[sex] = ordered.map((e, i) => {
    const w = weight(i);
    return hasEra ? [e[0], w, e[2] ?? "", e[3] ?? ""] : e[2] ? [e[0], w, e[2]] : [e[0], w];
  });
  check(c, period, t.male ? { ...t, regnalMale: t.regnalMale ?? [], regnalFemale: t.regnalFemale ?? [], holy: t.holy ?? [] } : t);
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

// Insert the new cultures after their legacy mixes.
const out = {};
for (const [k, v] of Object.entries(people.cultures)) {
  if (["turkic", "mongol", "arabic", "persian"].includes(k)) continue;
  out[k] = v;
  if (k === "steppe") Object.assign(out, { turkic: built.turkic, mongol: built.mongol });
  if (k === "arabic-persian") Object.assign(out, { arabic: built.arabic, persian: built.persian });
}
people.cultures = out;
Object.assign(people.families, { turkic: "steppe", mongol: "steppe", arabic: "near-east", persian: "near-east" });
Object.assign(people.officialTitles.bynamesCulture, { turkic: "steppe", mongol: "steppe", arabic: "arabic-persian", persian: "arabic-persian" });
// Mappings (§B4): ottoman to Turkic (the Turkish extra is no longer needed), swahili-omani, phoenician, modern Egyptian, Malay and maritime South-East Asia to Arabic.
Object.assign(people.resolve, {
  ottoman: "turkic",
  "swahili-omani": "arabic",
  malay: { historic: "indian", modern: "arabic" },
  maritimeSEA: { historic: "indian", modern: "arabic" },
  phoenician: "arabic",
  egyptian: { historic: "egyptian", modern: "arabic" },
});
delete people.extras.turkish;
writeFileSync(FILE, serialisePeople(people));

// The document section.
const fmt = (e, withEras = false) => `${e[0]} (${e[1]}${withEras && e[3] ? `, ${e[3]}` : ""})${e[2] === "r" ? "ʳ" : e[2] === "s" ? "ˢ" : ""}`;
const lines = ["<!-- tier6b-people:start -->", "", "## Second-tier splits (brief 6b §B4)", ""];
lines.push("Turkic and Mongol are written for each culture (the steppe table stays, as the mix); Arabic and Persian likewise (arabic-persian stays, as the mix). Written by `scripts/make-tier6b-people.mjs` from `scripts/tier6b/people-data.mjs`. Famous figures (rulers, conquerors, poets, philosophers, scholars) are flagged ʳ, listed last and held to a fifth of a list's weight; ordinary attested names lead. The famous figures of Egyptian, Ethiopian, Bantu and West African are flagged the same way.", "");
for (const [key, label] of [["turkic", "Turkic"], ["mongol", "Mongol"], ["arabic", "Arabic"], ["persian", "Persian"]]) {
  lines.push(`### ${label}`, "");
  for (const period of ["historic", "modern"]) {
    const t = built[key][period];
    lines.push(`#### ${period}`, "", `**Male given names** (${t.male.length}): ${t.male.map((e) => fmt(e, true)).join(", ")}`, "", `**Female given names** (${t.female.length}): ${t.female.map((e) => fmt(e, true)).join(", ")}`, "");
    if (t.surnames) lines.push(`**Surnames** (${t.surnames.length}): ${t.surnames.map((e) => fmt(e)).join(", ")}`, "");
    lines.push(`**Regnal names, male** (${t.regnalMale.length}): ${t.regnalMale.map((e) => fmt(e)).join(", ")}`, "", `**Regnal names, female** (${t.regnalFemale.length}): ${t.regnalFemale.map((e) => fmt(e)).join(", ")}`, "", `**Holy names** (${t.holy.length}): ${t.holy.map((e) => fmt(e)).join(", ")}`, "");
    if (t.recentMale) lines.push(`**Given in the last thirty years:** ${t.recentMale.join(", ")}; ${t.recentFemale.join(", ")}`, "");
  }
}
lines.push("### Mappings", "", "`ottoman` reads Turkic; `swahili-omani` and `phoenician` read Arabic; `malay` and `maritimeSEA` read Indian historic and Arabic modern; `egyptian` reads Egyptian historic and Arabic modern.", "", "<!-- tier6b-people:end -->", "");
let doc = readFileSync(DOC, "utf8");
const start = doc.indexOf("<!-- tier6b-people:start -->");
doc = (start >= 0 ? doc.slice(0, start) : doc).trimEnd() + "\n\n";
writeFileSync(DOC, doc + lines.join("\n"));
console.log("wrote people tables for turkic, mongol, arabic, persian");
