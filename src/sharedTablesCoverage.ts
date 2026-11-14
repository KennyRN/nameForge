// Shared tables brief §9.2: the coverage report's shared tables section, per culture: people list sizes against
// §3.1 and creatures against §8. Module cells are not credited with the shared tables.
import { creaturesFor, CREATURE_CULTURES } from "./creatures";
import { peopleTable, PEOPLE_CULTURES } from "./people";
import lens from "./data/lens.json";

const SECOND = new Set((lens.cultures as { key: string; tier: string }[]).filter((c) => c.tier === "second").map((c) => c.key));
export function sharedTablesMarkdown(): string {
  const rows = ["", "## Shared tables", "", "People lists against brief §3.1 (core 60/60/60/15/15/24, second tier 30/30/30/8/8/12) and creatures against §8 (core 12, second tier 8, General 30).", "", "| Culture | Periods | Given m/f | Surnames | Regnal m/f | Holy | Creatures |", "|---|---|---|---|---|---|---|"];
  for (const c of PEOPLE_CULTURES) {
    const periods = (["historic", "modern"] as const).filter((p) => peopleTable(c, p));
    const t = peopleTable(c, periods[0])!;
    const m = peopleTable(c, periods[periods.length - 1])!;
    const want = SECOND.has(c) ? 12 : 12;
    rows.push(`| ${c} | ${periods.join(", ")} | ${t.male.length}/${t.female.length} | ${m.surnames?.length ?? "–"} | ${t.regnalMale.length}/${t.regnalFemale.length} | ${t.holy.length} | ${creaturesFor(c).length}/${want === 12 && !SECOND.has(c) ? 12 : 8} |`);
  }
  rows.push(`| general | – | – | – | – | – | ${creaturesFor("general").length}/30 |`, "", `Creature lists: ${CREATURE_CULTURES.length} cultures.`);
  return rows.join("\n");
}
