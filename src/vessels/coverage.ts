// Coverage adapters for ships and boats, spacecraft and stations, aircraft and airships, and land vehicles
// (shared lens brief §6.1). The two vehicle data files share one shape: the vessels' and the air and land
// modules'. Technology codes read through the lens's eras (T1–T7, S1–S3, A1–AF, L1–LF), styles through its
// style table, and a shared list or shape counts in every module of its file.
import airLandData from "../data/vehicles-air-land.json";
import vesselData from "../data/vessels.json";
import { type CoverageAdapter, type CoverageRow, listRows, makeRow } from "../coverageRows";
import { lensStyleFor } from "../lens";
import { plainWordRows, wordListRows } from "../coverageUse";

type R = Record<string, unknown>;
type StyleDef = { key: string; modules: string[]; name: { w: string }[]; pools: Record<string, unknown[]>; shapes: string[] };

/** The lens styles (other than realistic) a style key reads as, with the eras it is confined to. */
function styleRow(module: string, key: string, row: CoverageRow): CoverageRow {
  const readings = lensStyleFor(module, key);
  const styles = [...new Set(readings.map((r) => r.style).filter((s) => s !== "realistic"))];
  const eras = [...new Set(readings.flatMap((r) => r.eras ?? []))];
  return { ...row, ...(styles.length > 0 ? { styles } : {}), ...(eras.length > 0 && eras.length < 5 ? { eras } : {}) };
}

/** Technology words, keyed by code (T1…, A1…): each word carries its code's eras. */
function techRows(module: string, techWords: R, prefix: string): CoverageRow[] {
  const out: CoverageRow[] = [];
  for (const [code, lists] of Object.entries(techWords)) {
    if (!code.startsWith(prefix)) continue;
    for (const list of Object.values(lists as R)) out.push(...plainWordRows(list, { e: [code] }, { module, source: `techWords/${code}` }));
  }
  return out;
}

function vesselRows(module: "ships" | "spacecraft"): CoverageRow[] {
  const out: CoverageRow[] = [];
  out.push(...listRows(vesselData.shapes, { module, source: "shapes" }));
  out.push(...listRows(vesselData.hybrids.shapes, { module, source: "hybrids" }));
  out.push(...listRows(vesselData.roleExtras.filter((r) => r.module === module), { module, source: "roleExtras" }));
  if (module === "spacecraft") {
    out.push(...listRows(vesselData.space.station, { module, source: "space/station" }));
    out.push(...listRows(vesselData.space.colony, { module, source: "space/colony" }));
  }
  out.push(...wordListRows(vesselData.lists as unknown as Record<string, unknown[]>, Object.keys(vesselData.lists), { module }));
  out.push(...techRows(module, vesselData.techWords, module === "ships" ? "T" : "S"));
  for (const style of vesselData.styles as unknown as StyleDef[]) {
    if (!style.modules.includes(module)) continue;
    for (const _ of style.name) out.push(styleRow(module, style.key, makeRow({}, { module, source: `styles/${style.key}`, type: "word" })));
    for (const pool of Object.values(style.pools)) for (const _ of pool) out.push(styleRow(module, style.key, makeRow({}, { module, source: `styles/${style.key}`, type: "word" })));
    for (const _ of style.shapes) out.push(styleRow(module, style.key, makeRow({}, { module, source: `styles/${style.key}`, type: "shape" })));
  }
  return out;
}

function airLandRows(module: "aircraft" | "landVehicles"): CoverageRow[] {
  const out: CoverageRow[] = [];
  out.push(...listRows((airLandData.shapes as { mod?: string[] }[]).filter((s) => !s.mod || s.mod.includes(module)), { module, source: "shapes" }));
  out.push(...wordListRows(airLandData.lists as unknown as Record<string, unknown[]>, Object.keys(airLandData.lists), { module }));
  out.push(...wordListRows((airLandData.moduleLists as unknown as Record<string, Record<string, unknown[]>>)[module], Object.keys((airLandData.moduleLists as unknown as Record<string, R>)[module]), { module }, `moduleLists/${module}`));
  out.push(...techRows(module, airLandData.techWords, module === "aircraft" ? "A" : "L"));
  // A culture's own words for one module (the British aircraft virtues).
  for (const add of airLandData.cultureAdds as { culture: string; module: string; words: unknown[] }[]) {
    if (add.module === module) out.push(...plainWordRows(add.words, { culture: add.culture }, { module, source: "cultureAdds" }));
  }
  // Styles the module offers: one shape each (a string, or a list of them).
  for (const [key, byModule] of Object.entries(airLandData.styles as unknown as Record<string, R>)) {
    const value = byModule[module];
    if (value === undefined) continue;
    for (const _ of Array.isArray(value) ? value : [value]) out.push(styleRow(module, key, makeRow({}, { module, source: `styles/${key}`, type: "shape" })));
  }
  return out;
}

const VESSEL_ROSTER = (vesselData.cultures as { key: string }[]).map((c) => c.key);
const AIRLAND_ROSTER = Object.keys(airLandData.spans);
const kindsOf = (list: { key: string }[]) => list.map((k) => k.key);

export const vesselCoverage: CoverageAdapter[] = [
  { module: "ships", kinds: kindsOf(vesselData.functions.ships.list), roster: VESSEL_ROSTER, rows: () => vesselRows("ships") },
  { module: "spacecraft", kinds: kindsOf(vesselData.functions.spacecraft.list), roster: VESSEL_ROSTER, rows: () => vesselRows("spacecraft") },
  { module: "aircraft", kinds: kindsOf(airLandData.functions.aircraft.list), roster: AIRLAND_ROSTER, rows: () => airLandRows("aircraft") },
  { module: "landVehicles", kinds: kindsOf(airLandData.functions.landVehicles.list), roster: AIRLAND_ROSTER, rows: () => airLandRows("landVehicles") },
];
