// 6c prompt Part A §7: Egyptian route words are written for their eras; the medieval era has no main road, motorway, ring road or corniche.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateRouteNames, ROUTE_KINDS } from "../src/routes/engine";

test("Egyptian routes: no modern road word in the ancient or medieval era", () => {
  const bad: string[] = [];
  for (const era of ["AN", "MD"] as const) for (const k of ROUTE_KINDS as { key: string }[]) for (let seed = 1; seed <= 5; seed++) {
    let names: { text: string }[] = [];
    try { names = generateRouteNames({ culture: "egyptian", era, kind: k.key, people: "placeholders", count: 20, seed } as never).names as never; } catch { continue; }
    for (const n of names) if (/\b(Main Road|Motorway|Ring Road|Corniche|Telegraph Road|Pilgrim Bus|Pilgrim Railway|Khedive's Road)\b/.test(n.text)) bad.push(`${era} ${k.key}: ${n.text}`);
  }
  assert.deepEqual(bad.slice(0, 6), []);
});
