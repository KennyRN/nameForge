// Monuments brief §14.1: buildings gives the same names for every kind it keeps. The fixtures were recorded
// (tests/fixtures/makeBuildingRegression.ts) before the monument kind left buildings and the shared helpers
// were factored out. This file imports no module that registers the deity hooks, as the recording had none.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BUILDING_KINDS, generateBuildingNames, type BuildingKind } from "../src/buildings/engine";

test("§14.1: buildings gives identical names for every remaining kind × 3 cultures × 3 eras at the recorded seeds", () => {
  const saved = JSON.parse(readFileSync("tests/fixtures/building-regression.json", "utf8")) as Record<string, string[]>;
  let checked = 0;
  for (const k of BUILDING_KINDS) {
    for (const culture of ["norman-british", "chinese", "norse"]) {
      for (const era of ["AN", "ST", "NF"] as const) {
        for (const seed of [7, 2024]) {
          const key = `${k.key} ${culture} ${era} ${seed}`;
          const names = generateBuildingNames({ culture, era, kind: k.key as BuildingKind, people: "invented", count: 12, seed }).names.map((n) => n.text);
          assert.deepEqual(names, saved[key], key);
          checked++;
        }
      }
    }
  }
  assert.equal(checked, Object.keys(saved).length);
});

