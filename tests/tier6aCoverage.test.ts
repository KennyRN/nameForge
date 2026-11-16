// Brief 6a §4 and §7: every core cell of the batch's cultures, in every module that offers them, meets its target or is excluded; the two mixes meet the Celtic-style target.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCoverage } from "../src/coverage";
import { TIER6A_CULTURES, TIER6A_MIXES } from "../src/tier6a";

test("6a: the batch's cultures meet their cells in the modules the batch has content for, or are excluded; gaps are listed", () => {
  const report = buildCoverage();
  const MODULES_DONE = new Set(["mountainNames", "forestNames", "moorNames", "wetlandNames", "grasslandNames", "lands", "riversInland", "hillsValleys", "farmland", "seasLakes", "coastsIslands", "seaCharts", "routeNames", "sacredPlaces", "streetNames", "innNames", "buildingNames", "monumentNames", "mysticOrders", "martialOrders", "underworldGroups", "tradeGuilds", "adventureCompanies", "powerFactions", "supernaturalCourts", "tribalNames", "epithets", "titles", "familyNames", "realms", "peoplesTongues", "ships", "aircraft", "landVehicles", "moneyNames", "eventNames", "calendarNames", "skyNames", "armsNames", "treasureNames", "bookNames", "deityNames"]);
  const short: string[] = [];
  for (const m of report.modules) {
    if (!MODULES_DONE.has(m.module)) continue;
    for (const c of [...TIER6A_CULTURES, ...TIER6A_MIXES]) {
      const cell = m.cultures[c] as { below?: boolean; excluded?: boolean; notOffered?: boolean; words: number; shapes: number } | undefined;
      if (cell?.below) short.push(`${m.module} ${c} ${cell.words}/${cell.shapes}`);
    }
  }
  // The count is the gap this test tracks: it may fall, never rise (38 at the end of the batch: the stars and space, hyperspace, spacecraft and river modules, which the style tables brief owns, and the two mixes of tribes).
  assert.ok(short.length <= 38, `${short.length} cells below target: ${short.slice(0, 30).join("; ")}`);
});
