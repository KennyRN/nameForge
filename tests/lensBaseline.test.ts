// Shared lens and coverage brief §7.1 (M0): every non-Markov module, each culture it offers, at its
// default settings and at one non-default era or setting, seeds 1, 42 and 2024, 12 names each, recorded
// before any change. Run with CAPTURE_LENS_BASELINE=1 to record. Never edit the fixture to fit new code.
//
// Each module is driven through its engine with the options the modal passes today: the module's
// default sentence state spread onto the engine's options, with the module's own culture roster. The
// built-in safeguard lists and vocabulary are in use (no notes), as with an empty names folder.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { buildSnapshot, type Snapshot } from "./helpers/lensSnapshot";
const FIXTURE = "tests/fixtures/lens-baseline.json";

if (process.env.CAPTURE_LENS_BASELINE) {
  writeFileSync(FIXTURE, JSON.stringify(buildSnapshot()));
}

test("lens baseline: every module, culture and seed matches what was recorded before the lens", () => {
  const expected = JSON.parse(readFileSync(FIXTURE, "utf8")) as Snapshot;
  const actual = buildSnapshot();
  assert.ok(Object.keys(expected).length > 5000, "fixture covers many states");
  assert.deepEqual(Object.keys(actual), Object.keys(expected));
  for (const key of Object.keys(expected)) assert.deepEqual(actual[key], expected[key], key);
});

test("lens baseline: the fixture covers every non-Markov module", () => {
  const expected = JSON.parse(readFileSync(FIXTURE, "utf8")) as Snapshot;
  const modules = new Set(Object.keys(expected).map((k) => k.split(" ")[0]));
  for (const module of [
    "placeShapes", "explorationPlaceShapes", "empireExpansionPlaceShapes", "routeNames", "sacredPlaces", "settlementNames", "streetNames", "innNames", "buildingNames", "monumentNames", "settlementKit",
    "seasLakes", "coastsIslands", "seaCharts", "hyperspaceCharts", "mountainNames", "forestNames", "desertNames", "moorNames", "wetlandNames", "grasslandNames",
    "powerFactions", "realms", "peoplesTongues", "tribalNames", "tradeGuilds", "martialOrders", "adventureCompanies", "mysticOrders", "underworldGroups", "supernaturalCourts", "deityNames",
    "epithets", "familyNames", "titles", "ships", "spacecraft", "aircraft", "landVehicles", "armsNames", "treasureNames", "bookNames", "eventNames", "moneyNames", "calendarNames", "skyNames", "riverNames",
  ]) {
    assert.ok(modules.has(module), `${module} is in the fixture`);
  }
});
