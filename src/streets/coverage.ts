// Coverage adapter for streets and districts (shared lens brief §6.1).
import streetData from "../data/street-names.json";
import { type CoverageAdapter, type CoverageRow, at, listRows, vocabularyRows, SHARED_ROSTER } from "../coverageRows";

const MODULE = "streetNames";
const KINDS = (streetData.kinds as { key: string }[]).map((k) => k.key);

function rows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  const list = (path: string, kind: string, extra: { steampunk?: boolean; eras?: string[] } = {}) => out.push(...listRows(at(streetData, path), { module: MODULE, source: path, kind, ...extra }));
  list("streets", "streets");
  list("cultureStreets", "streets");
  list("scifiStreets/shapes", "streets", { eras: ["NF", "IS"] });
  list("squares", "squares");
  for (const fn of Object.keys(streetData.districts)) list(`districts/${fn}`, "districts");
  list("cultureDistricts", "districts");
  list("steampunkDistricts", "districts", { steampunk: true });
  list("scifiDistricts/shapes", "districts", { eras: ["NF", "IS"] });
  list("monumentDistricts", "districts");
  out.push(...vocabularyRows(MODULE));
  return out;
}

export const streetCoverage: CoverageAdapter = { module: MODULE, kinds: KINDS, roster: SHARED_ROSTER, regions: true, rows };
