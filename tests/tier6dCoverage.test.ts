// Brief 6d §B4: every core cell of the five cultures of batch 6d, in every module the batch has content for, meets its target or is excluded.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCoverage } from "../src/coverage";
import { LENS_CULTURES } from "../src/lens";
const CULTURES = ["aztec", "maya", "andean", "polynesian", "american"];
/** The settlement names are delegated to the world engine (their cells are not held to the kind target, as for every culture), and the styles brief owns the four modules marked `deferred`. */
const NOT_COUNTED = new Set(["settlementNames", "settlementKit"]);
const DEFERRED = new Set(["starsSpace", "hyperspaceCharts", "spacecraft", "riverNames"]);

test("6d: the five cultures are core tier, and meet their cells in every module that offers them, or are excluded", () => {
  for (const c of CULTURES) assert.equal(LENS_CULTURES.find((x) => x.key === c)?.tier, "core", c);
  const report = buildCoverage();
  const short: string[] = [];
  for (const m of report.modules) {
    if (NOT_COUNTED.has(m.module)) continue;
    for (const c of CULTURES) {
      const cell = m.cultures[c] as { below?: boolean; words: number; shapes: number } | undefined;
      if ((cell as { deferred?: string } | undefined)?.deferred) assert.ok(DEFERRED.has(m.module), `${m.module} ${c} is deferred but is not a styles module`);
      if (cell?.below) short.push(`${m.module} ${c} ${cell.words}/${cell.shapes}`);
    }
  }
  assert.ok(short.length === 0, `${short.length} cells below target: ${short.slice(0, 30).join("; ")}`);
});

test("6d: the only exemptions are Polynesian deserts and moors and the sensitive modules of Polynesian and Andean; Aztec, Maya, Andean and American deserts are written at target", () => {
  const report = buildCoverage();
  for (const [module, culture] of [["desertNames", "polynesian"], ["moorNames", "polynesian"]]) {
    const cell = report.modules.find((x) => x.module === module)!.cultures[culture] as { excluded?: boolean; below?: boolean };
    assert.ok(cell.excluded && !cell.below, `${module} ${culture} should be excluded`);
  }
  const desert = report.modules.find((x) => x.module === "desertNames")!;
  for (const c of ["aztec", "maya", "andean", "american"]) {
    const cell = desert.cultures[c] as { excluded?: boolean; below?: boolean; words: number };
    assert.ok(!cell.excluded && !cell.below, `desertNames ${c}`);
  }
  // Brief 6d §15: the sensitive cultures stay closed in deities, sacred places, calendars, sky lore and money (exempt: sensitive).
  const SENSITIVE = ["deityNames", "sacredPlaces", "calendarNames", "skyNames", "moneyNames"];
  for (const m of report.modules) for (const c of CULTURES) {
    const cell = m.cultures[c] as { excluded?: boolean; exempt?: string } | undefined;
    const sensitive = (c === "polynesian" || c === "andean") && SENSITIVE.includes(m.module);
    const allowed = sensitive || (c === "polynesian" && (m.module === "desertNames" || m.module === "moorNames"));
    if (sensitive) assert.ok(cell?.excluded && cell.exempt === "sensitive", `${m.module} ${c} is exempt: sensitive`);
    else if (!allowed) assert.ok(!cell?.excluded && !cell?.exempt, `${m.module} ${c} must not be exempt`);
  }
});
