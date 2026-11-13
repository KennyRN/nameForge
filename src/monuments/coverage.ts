// Coverage adapter for monuments and statues (shared lens brief §6.1).
import monumentData from "../data/monument-names.json";
import { type CoverageAdapter, type CoverageRow, at, byCultureRows, byKindRows, listRows, makeRow, regionMultipliers, vocabularyRows, SHARED_ROSTER } from "../coverageRows";

const MODULE = "monumentNames";
const KINDS = (monumentData.kinds as { key: string }[]).map((k) => k.key);

function rows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  out.push(...listRows(at(monumentData, "shared"), { module: MODULE, source: "shared" }));
  out.push(...byKindRows(at(monumentData, "kindShapes"), { module: MODULE, source: "kindShapes" }));
  out.push(...byCultureRows(at(monumentData, "cultureShapes"), { module: MODULE, source: "cultureShapes" }));
  out.push(...listRows(at(monumentData, "eraShapes"), { module: MODULE, source: "eraShapes" }));
  out.push(...listRows(at(monumentData, "scifi/shapes"), { module: MODULE, source: "scifi/shapes", eras: ["NF", "IS"] }));
  // The British region multipliers, one row per monument kind (stones in Cornwall, hill figures on the chalk).
  for (const [kind, table] of Object.entries(monumentData.regionX as Record<string, Record<string, number>>)) {
    out.push(makeRow({}, { module: MODULE, source: `regionX/${kind}`, kind, type: "shape", regions: regionMultipliers(table) }));
  }
  out.push(...vocabularyRows(MODULE));
  return out;
}

export const monumentCoverage: CoverageAdapter = { module: MODULE, kinds: KINDS, roster: SHARED_ROSTER, regions: true, rows };
