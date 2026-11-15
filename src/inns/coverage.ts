// Coverage adapter for inns and taverns (shared lens brief §6.1).
import innData from "../data/inn-names.json";
import { type CoverageAdapter, type CoverageRow, at, byCultureRows, listRows, makeRow, vocabularyRows, NORTH_ROSTER, ownRowsOnly, northCultureShapes } from "../coverageRows";
import { NORTH5B } from "../northData5b";

const MODULE = "innNames";
const KINDS = (innData.kinds as { key: string }[]).map((k) => k.key);

function rows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  // Every sign family's shapes (`signs` is a list of { key, w, shapes }).
  for (const sign of innData.signs as { key: string; shapes: unknown[] }[]) out.push(...listRows(sign.shapes, { module: MODULE, source: `signs/${sign.key}` }));
  out.push(...byCultureRows(at(innData, "cultureShapes"), { module: MODULE, source: "cultureShapes" }));
  out.push(...byCultureRows(northCultureShapes(NORTH5B.inns.cultureShapes), { module: MODULE, source: "north5b/cultureShapes" }));
  out.push(...listRows(at(innData, "eraShapes"), { module: MODULE, source: "eraShapes" }));
  out.push(...listRows(at(innData, "fantastic"), { module: MODULE, source: "fantastic" }));
  out.push(...listRows(at(innData, "fallback"), { module: MODULE, source: "fallback" }));
  // Wales doubles the dragon signs (`regionRules.dragonDouble`).
  out.push(makeRow({}, { module: MODULE, source: "regionRules/dragonDouble", type: "shape", regions: (innData.regionRules as { dragonDouble: string[] }).dragonDouble }));
  out.push(...vocabularyRows(MODULE));
  return ownRowsOnly(out);
}

export const innCoverage: CoverageAdapter = { module: MODULE, kinds: KINDS, roster: NORTH_ROSTER, regions: true, rows };
