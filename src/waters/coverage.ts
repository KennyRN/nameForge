// Coverage adapters for seas and lakes, coasts and islands, sea charts and hyperspace charts (shared lens brief §6.1).
import watersData from "../data/waters.json";
import { type CoverageAdapter, type CoverageRow, at, byKindRows, listRows, makeRow, regionMultipliers, vocabularyRows, SHARED_ROSTER } from "../coverageRows";

type EarthlyModule = "seasLakes" | "coastsIslands" | "seaCharts";
const EARTHLY = Object.keys(watersData.modules) as EarthlyModule[];
const kindsOf = (module: EarthlyModule) => ((watersData.modules as Record<string, { kinds: { key: string }[] }>)[module].kinds).map((k) => k.key);

function earthlyRows(module: EarthlyModule): CoverageRow[] {
  const out: CoverageRow[] = [];
  out.push(...byKindRows(at(watersData, `shapes/${module}`), { module, source: `shapes/${module}` }));
  const own = (watersData.cultureShapes as { module: string }[]).filter((s) => s.module === module);
  out.push(...listRows(own, { module, source: "cultureShapes" }));
  // The British region tags (`ness`, `naze`, `bill`…).
  for (const [word, table] of Object.entries(watersData.regionTags as Record<string, Record<string, number>>)) {
    out.push(makeRow({}, { module, source: `regionTags/${word}`, type: "word", regions: regionMultipliers(table) }));
  }
  out.push(...vocabularyRows(module));
  return out;
}

function hyperRows(): CoverageRow[] {
  const out = byKindRows(at(watersData, "hyper/shapes"), { module: "hyperspaceCharts", source: "hyper/shapes", eras: ["NF", "IS"] });
  out.push(...vocabularyRows("hyperspaceCharts"));
  return out;
}

export const watersCoverage: CoverageAdapter[] = [
  ...EARTHLY.map((module) => ({ module, kinds: kindsOf(module), roster: SHARED_ROSTER, regions: true, rows: () => earthlyRows(module) })),
  { module: "hyperspaceCharts", kinds: (watersData.hyper.kinds as { key: string }[]).map((k) => k.key), rows: hyperRows },
];
