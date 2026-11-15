// Coverage adapter for buildings and landmarks (shared lens brief §6.1).
import buildingData from "../data/building-names.json";
import { type CoverageAdapter, type CoverageRow, at, byCultureRows, byKindRows, listRows, vocabularyRows, NORTH_ROSTER, ownRowsOnly, northCultureShapes } from "../coverageRows";
import { NORTH5B } from "../northData5b";

const MODULE = "buildingNames";
const KINDS = (buildingData.kinds as { key: string }[]).map((k) => k.key);

function rows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  out.push(...listRows(at(buildingData, "shared"), { module: MODULE, source: "shared" }));
  out.push(...byKindRows(at(buildingData, "kindShapes"), { module: MODULE, source: "kindShapes" }));
  out.push(...byCultureRows(at(buildingData, "cultureShapes"), { module: MODULE, source: "cultureShapes" }));
  out.push(...byCultureRows(northCultureShapes(NORTH5B.buildings.cultureShapes), { module: MODULE, source: "north5b/cultureShapes" }));
  out.push(...listRows(at(buildingData, "eraShapes"), { module: MODULE, source: "eraShapes" }));
  out.push(...listRows(at(buildingData, "scifi/shapes"), { module: MODULE, source: "scifi/shapes", eras: ["NF", "IS"] }));
  out.push(...vocabularyRows(MODULE));
  return ownRowsOnly(out);
}

export const buildingCoverage: CoverageAdapter = { module: MODULE, kinds: KINDS, roster: NORTH_ROSTER, regions: true, rows };
