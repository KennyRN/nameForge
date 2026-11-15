// Coverage adapters for settlement names and the settlement kit (shared lens brief §6.1).
import settlementData from "../data/settlement-names.json";
import { SETTLEMENT_DATA } from "./data";
import { NORTH5B } from "../northData5b";
import { type CoverageAdapter, type CoverageRow, makeRow } from "../coverageRows";
import { lensErasFor } from "../lens";

const NAMES = "settlementNames";
const SIZE_KINDS = ["hamlet", "village", "town", "city", "great"];

type WorldCulture = { eras: Record<string, Record<string, string>>; lists: Record<string, Record<string, string>> };

/**
 * Settlement names: each world culture's era templates are shapes (era read through the lens's world
 * table), its lists are words, and the generics are open words. Size codes are the kinds a template serves.
 */
function namesRows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  const kindsOf = (codes: string) => SIZE_KINDS.filter((_, i) => codes.includes("hvtcg"[i]));
  const push = (row: CoverageRow, codes: string) => {
    const kinds = kindsOf(codes);
    if (kinds.length === 0) out.push(row);
    for (const kind of kinds) out.push({ ...row, kind });
  };
  for (const [culture, data] of Object.entries(SETTLEMENT_DATA.world as unknown as Record<string, WorldCulture>)) {
    for (const [era, templates] of Object.entries(data.eras)) {
      const eras = lensErasFor(NAMES, era, culture);
      for (const [, codes] of Object.entries(templates)) {
        push(makeRow({ culture, e: eras }, { module: NAMES, source: `world/${culture}/eras/${era}`, type: "shape" }), codes);
      }
    }
    for (const [list, words] of Object.entries(data.lists)) {
      for (const [, codes] of Object.entries(words)) push(makeRow({ culture }, { module: NAMES, source: `world/${culture}/lists/${list}`, type: "word" }), codes);
    }
  }
  // Brief 5b §12.2: a region's own templates and words (Scottish, Norse, Scandinavian and German regions), each a shape or word restricted to the region.
  type Regions = Record<string, { templates: [string, number][]; lists: Record<string, string[]> }>;
  const regional: { culture: string; regions: Regions; sizes: (template: string) => string }[] = [
    ...NORTH5B.settlement.cultures
      .filter((c) => c.regions)
      .map((c) => ({ culture: c.id, regions: c.regions as Regions, sizes: (t: string) => NORTH5B.settlement.sizes[c.id].eras[c.eras[0].id][t] ?? "hvt" })),
    { culture: "norse", regions: NORTH5B.settlement.norseRegions as Regions, sizes: (t) => NORTH5B.settlement.norseSizes[t] ?? "hvt" },
  ];
  for (const { culture, regions, sizes } of regional) {
    for (const [region, r] of Object.entries(regions)) {
      for (const [template] of r.templates) push(makeRow({ culture, r: [region] }, { module: NAMES, source: `north5b/${culture}/regions/${region}`, type: "shape" }), sizes(template));
      for (const words of Object.values(r.lists)) for (let i = 0; i < words.length; i++) push(makeRow({ culture, r: [region] }, { module: NAMES, source: `north5b/${culture}/regions/${region}`, type: "word" }), "hvt");
    }
  }
  for (const codes of Object.values(settlementData.generics as unknown as Record<string, string>)) {
    push(makeRow({}, { module: NAMES, source: "generics", type: "word" }), codes);
  }
  return out;
}

export const settlementNamesCoverage: CoverageAdapter = { module: NAMES, kinds: SIZE_KINDS, kindFlags: Object.fromEntries(SIZE_KINDS.map((k) => [k, "delegated" as const])), regions: true, roster: Object.keys(SETTLEMENT_DATA.world), rows: namesRows };

/** The settlement kit has no word lists or shapes of its own (its data file says so): it draws on the other modules. */
export const settlementKitCoverage: CoverageAdapter = { module: "settlementKit", noTables: true, rows: () => [] };
