// Coverage adapters for the six wild lands modules (shared lens brief §6.1).
import wildsData from "../data/wilds.json";
import { mergeRegionColumns, NORTH } from "../northData";
import { type CoverageAdapter, type CoverageRow, at, byKindRows, listRows, makeRow, profileKeys, regionMultipliers, vocabularyRows, NORTH_ROSTER } from "../coverageRows";

type WildsModuleKey = "mountainNames" | "forestNames" | "desertNames" | "moorNames" | "wetlandNames" | "grasslandNames";
const MODULES = Object.keys(wildsData.modules) as WildsModuleKey[];
const kindsOf = (module: string) => ((wildsData.modules as Record<string, { kinds: { key: string }[] }>)[module].kinds).map((k) => k.key);

const readsRegions = (module: string) => (wildsData.modules as Record<string, { region?: boolean }>)[module].region === true;

function rows(module: WildsModuleKey): CoverageRow[] {
  const out: CoverageRow[] = [];
  // The module's shapes by kind; a `f: "fixed"` shape is a whole name, so a word.
  out.push(...byKindRows(at(wildsData, `shapes/${module}`), { module, source: `shapes/${module}` }));
  const own = [...(wildsData.cultureShapes as { module: string }[]), ...(NORTH.wilds.cultureShapes as { module: string }[])].filter((s) => s.module === module).filter((s) => !(s as { grp?: boolean }).grp);
  out.push(...listRows(own, { module, source: "cultureShapes" }));
  // The British region tags (`ben`, `corrie`, `glen`…) multiply words in every wild lands module that reads regions.
  if (readsRegions(module)) {
    for (const [word, table] of Object.entries(mergeRegionColumns(wildsData.regionTags as Record<string, Record<string, number>>, NORTH.wilds.regionColumns, NORTH.wilds.regionTags))) {
      out.push({ ...makeRow({}, { module, source: `regionTags/${word}`, type: "word", regions: regionMultipliers(table) }), notPool: true });
    }
  }
  out.push(...vocabularyRows(module));
  return out;
}

/** Brief 6a §4: deserts are excluded for the batch's cultures (and mountains for the Dutch): none of them has the landscape. */
const BATCH_NO_DESERT = ["french", "dutch", "italian", "spanish", "portuguese", "roman", "greek", "byzantine", "slavic", "iberian", "greek-byzantine"];
const excludedFor = (module: string): CoverageAdapter["excluded"] => (module === "desertNames" ? [{ cultures: BATCH_NO_DESERT }] : module === "mountainNames" ? [{ cultures: ["dutch"] }] : undefined);
export const wildsCoverage: CoverageAdapter[] = MODULES.map((module) => ({ module, kinds: kindsOf(module), roster: NORTH_ROSTER, excluded: excludedFor(module), regions: readsRegions(module), profiles: () => profileKeys(wildsData.cultureMult), rows: () => rows(module) }));
