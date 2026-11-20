// Brief 6d B1: Polynesian names keep each language's standard marks (Maori macrons, Hawaiian kahako and the okina), and the marks survive the filler into the output unchanged.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { mulberry32 } from "../src/markov";
import { fillText } from "../src/fill/batch";
import { peopleTable } from "../src/people";

const MARKED = /[āēīōūĀĒĪŌŪʻ]/;

test("Polynesian marks: the tables hold the marked forms, once each", () => {
  for (const period of ["historic", "modern"] as const) {
    const t = peopleTable("polynesian", period) as unknown as { male: [string][]; female: [string][] };
    const all = [...t.male, ...t.female].map((e) => e[0]);
    assert.ok(all.some((n) => MARKED.test(n)), `${period} has marked names`);
    for (const n of all) assert.equal(n, n.normalize("NFC"), `${n} is not in composed form`);
    for (const list of [t.male, t.female]) assert.equal(new Set(list.map((e) => e[0].normalize("NFD").replace(/[̄ʻ]/g, "").toLowerCase())).size, list.length, `${period}: one spelling per name`);
  }
});

test("Polynesian marks: every name the filler gives is a table name with its marks unchanged", () => {
  const known = new Set<string>();
  for (const period of ["historic", "modern"] as const) {
    const t = peopleTable("polynesian", period) as unknown as { male: [string][]; female: [string][] };
    for (const e of [...t.male, ...t.female]) known.add(e[0]);
  }
  let marked = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const out = fillText("[personal name] of the Bay", "real", { culture: "polynesian", era: seed % 2 ? "MD" : "MO" } as never, mulberry32(seed));
    const given = out.replace(" of the Bay", "");
    assert.ok(known.has(given), `${given} is not a table name`);
    if (MARKED.test(given)) marked++;
  }
  assert.ok(marked > 20, `${marked} marked names in 200`);
});
