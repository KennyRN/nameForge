// Brief 6a Part A §2: with the people link on `real`, no module leaves a bracket in a finished name, in any culture it offers,
// kind or era, unless fill.json says why (`stayBracketedFor`). The sweep runs every module's kinds and cultures live.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { labelInfo, stayBracketedReason } from "../src/fill";
import { stats, sweepBrackets } from "./helpers/bracketSweep";

test("real mode: every bracket label that survives in any module, kind, culture and era is mapped, and stays only where fill.json says so", () => {
  const found = sweepBrackets({ seeds: [3, 11], count: 12 });
  assert.ok([...stats.runs.values()].every((n) => n > 0), "every module ran");
  assert.ok(stats.runs.size >= 30, `a broad sweep: ${stats.runs.size} modules`);
  const loose: string[] = [];
  for (const [label, wheres] of found) {
    assert.ok(labelInfo(label), `[${label}] has a source in fill.json`);
    for (const where of wheres) {
      const [module, culture] = where.split(" ");
      if (!stayBracketedReason({ culture, module })) loose.push(`[${label}] in ${where}`);
    }
  }
  assert.deepEqual(loose.slice(0, 20), [], `${loose.length} brackets survive where nothing says they may`);
});

test("real mode: an event, a realm with a bracket of its own and a short list of blocked names all fill", () => {
  const found = sweepBrackets({ seeds: [3, 11, 6], count: 20, cultures: ["general", "roman", "ethiopian"] });
  for (const label of ["event", "dynasty", "ruler"]) assert.ok(!found.has(label), `[${label}] is filled`);
});
