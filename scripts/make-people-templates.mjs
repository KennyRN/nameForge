// Writes the starter templates for the people tables (shared tables brief §4) into
// src/data/builtin-templates.json: one per culture and period, "Welsh (modern)", with `## Male`,
// `## Female` and, where the culture has them, `## Surnames`, in the table's order (most common
// first). The templates Kenny wrote (Victorian, England; Anglo-Saxon; Old Cornish) cover Norman & British
// modern, Anglo-Saxon historic and Cornish historic, so no template is made for those (review amendment
// §12.2). Run `node scripts/make-people-templates.mjs` after changing src/data/people.json.
import { readFileSync, writeFileSync } from "node:fs";

const people = JSON.parse(readFileSync("src/data/people.json", "utf8"));
const lens = JSON.parse(readFileSync("src/data/lens.json", "utf8"));
// The lens's "English" is two people cultures, kept under their own names.
const label = { ...Object.fromEntries(lens.cultures.map((c) => [c.key, c.label])), "anglo-saxon": "Anglo-Saxon", "norman-british": "Norman & British" };
const COVERED = new Set(["cornish/historic", "anglo-saxon/historic", "norman-british/modern"]);
const path = "src/data/builtin-templates.json";
const kept = JSON.parse(readFileSync(path, "utf8")).filter((t) => !t.fromTable);
const made = [];
for (const [culture, periods] of Object.entries(people.cultures)) {
  for (const [period, table] of Object.entries(periods)) {
    if (COVERED.has(`${culture}/${period}`)) continue;
    const sections = [
      { name: "Male", items: table.male.map((e) => e[0]) },
      { name: "Female", items: table.female.map((e) => e[0]) },
      ...(table.surnames ? [{ name: "Surnames", items: table.surnames.map((e) => e[0]) }] : []),
    ];
    made.push({ name: `${label[culture] ?? culture} (${period})`, type: "people", fromTable: true, sections });
  }
}
writeFileSync(path, JSON.stringify([...kept, ...made], null, 1));
console.log(`${made.length} people-table templates written (${kept.length} others kept)`);
