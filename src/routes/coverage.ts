// Coverage adapter for route names (shared lens brief §6.1): its shape tables, its culture shapes and
// the shared pools it reads, as rows. Pure: it reads data and runs nothing.
import routeData from "../data/route-names.json";
import { type CoverageAdapter, type CoverageRow, at, byKindRows, listRows, makeRow, regionMultipliers, vocabularyRows, SHARED_ROSTER } from "../coverageRows";

const MODULE = "routeNames";
const KINDS = (routeData.kinds as { key: string }[]).map((k) => k.key);

function rows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  out.push(...byKindRows(at(routeData, "shapes"), { module: MODULE, source: "shapes" }));
  // A culture's own shapes carry the culture and the kind.
  out.push(...listRows(at(routeData, "cultureShapes"), { module: MODULE, source: "cultureShapes" }));
  // The British region multipliers, one row per route family (`roman`, `drove`, `salt`…).
  for (const [family, table] of Object.entries(routeData.regions as Record<string, Record<string, number>>)) {
    out.push(makeRow({}, { module: MODULE, source: `regions/${family}`, type: "shape", regions: regionMultipliers(table) }));
  }
  out.push(...vocabularyRows(MODULE));
  return out;
}

export const routeCoverage: CoverageAdapter = {
  module: MODULE,
  kinds: KINDS, roster: SHARED_ROSTER,
  // §6.3: no pilgrim routes for Polynesian and Andean.
  excluded: [{ cultures: ["polynesian", "andean"], kind: "pilgrim" }],
  regions: true,
  rows,
};
