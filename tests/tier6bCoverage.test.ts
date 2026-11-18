// Brief 6b §B5: every core cell of the batch's cultures, in every module the batch has content for, meets its target or is excluded; the two mixes meet the Celtic-style target.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCoverage } from "../src/coverage";
const CULTURES = ["turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african"];
const MIXES = ["steppe", "arabic-persian"];
/** The settlement names are delegated to the world engine (their cells are not held to the kind target, as for every culture), and the styles brief owns the four modules marked `deferred`. */
const NOT_COUNTED = new Set(["settlementNames", "settlementKit", "starsSpace", "hyperspaceCharts", "spacecraft", "riverNames"]);

test("6b: the batch's cultures meet their cells in every module that offers them, or are excluded", () => {
  const report = buildCoverage();
  const short: string[] = [];
  for (const m of report.modules) {
    if (NOT_COUNTED.has(m.module)) continue;
    for (const c of [...CULTURES, ...MIXES]) {
      const cell = m.cultures[c] as { below?: boolean; words: number; shapes: number } | undefined;
      if (cell?.below) short.push(`${m.module} ${c} ${cell.words}/${cell.shapes}`);
    }
  }
  assert.ok(short.length === 0, `${short.length} cells below target: ${short.slice(0, 30).join("; ")}`);
});
