// Urban brief §9 test 6: the urban group's line-up.
import { test } from "node:test";
import assert from "node:assert/strict";
import { GROUP_LABELS, SECTION_GROUPS, SWITCHER_ORDER } from "../src/sections";

test("urban group lists exactly the five modules, in order", () => {
  assert.deepEqual(SECTION_GROUPS.urban, ["settlementNames", "streetNames", "innNames", "buildingNames", "settlementKit"]);
  assert.equal(GROUP_LABELS.urban, "urban");
});

test("place names and advanced no longer list the moved modules", () => {
  for (const m of ["streetNames", "innNames", "buildingNames", "settlementKit"] as const) {
    assert.ok(!SECTION_GROUPS.placeNames.includes(m), m);
    assert.ok(!SECTION_GROUPS.advanced.includes(m), m);
  }
  assert.deepEqual(SECTION_GROUPS.placeNames, ["placeShapes", "explorationPlaceShapes", "empireExpansionPlaceShapes", "routeNames", "sacredPlaces"]);
});

test("switcher order puts urban straight after place names", () => {
  assert.equal(SWITCHER_ORDER.indexOf("urban"), SWITCHER_ORDER.indexOf("placeNames") + 1);
});
