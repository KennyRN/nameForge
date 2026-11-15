// Coverage adapter for streets and districts (shared lens brief §6.1).
import streetData from "../data/street-names.json";
import { type CoverageAdapter, type CoverageRow, at, listRows, vocabularyRows, NORTH_ROSTER, ownRowsOnly } from "../coverageRows";
import { NORTH5B } from "../northData5b";

const MODULE = "streetNames";
const KINDS = (streetData.kinds as { key: string }[]).map((k) => k.key);

function rows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  const list = (path: string, kind: string, extra: { steampunk?: boolean; eras?: string[] } = {}) => out.push(...listRows(at(streetData, path), { module: MODULE, source: path, kind, ...extra }));
  list("streets", "streets");
  list("cultureStreets", "streets");
  out.push(...listRows(NORTH5B.streets.cultureStreets, { module: MODULE, source: "north5b/cultureStreets", kind: "streets" }));
  out.push(...listRows(NORTH5B.streets.cultureSquares, { module: MODULE, source: "north5b/cultureSquares", kind: "squares" }));
  out.push(...listRows(NORTH5B.streets.cultureDistricts, { module: MODULE, source: "north5b/cultureDistricts", kind: "districts" }));
  list("scifiStreets/shapes", "streets", { eras: ["NF", "IS"] });
  list("squares", "squares");
  for (const fn of Object.keys(streetData.districts)) list(`districts/${fn}`, "districts");
  list("cultureDistricts", "districts");
  list("steampunkDistricts", "districts", { steampunk: true });
  list("scifiDistricts/shapes", "districts", { eras: ["NF", "IS"] });
  list("monumentDistricts", "districts");
  out.push(...vocabularyRows(MODULE));
  return ownRowsOnly(out);
}

export const streetCoverage: CoverageAdapter = { module: MODULE, kinds: KINDS, roster: NORTH_ROSTER, regions: true, rows };
