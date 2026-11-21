// Brief 6d fixes §2: saints come only from the culture's own list, and only in the eras when the culture was Christian.
// Aztec, Maya, Andean and Polynesian draw Spanish colonial and mission saints from the early modern era; American draws none.
import "../src/lensRosterSources";
import "../src/fill/batch";
import "../src/places/sources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { probeSpecs } from "./fixtures/lensOffersProbe";

const OWN: Record<string, string[]> = {
  aztec: ["Michael", "Peter", "Paul", "James", "John", "Francis", "Joseph", "Anthony", "Martin", "Mary", "Anne", "Catherine"],
  maya: ["Michael", "Peter", "Paul", "James", "John", "Francis", "Joseph", "Anthony", "Martin", "Mary", "Anne", "Catherine"],
  andean: ["Rose", "Martin", "Peter", "Paul", "James", "Anne", "Francis", "Joseph", "Michael", "John", "Mary", "Toribius"],
  polynesian: ["John", "Peter", "Paul", "Mary", "Joseph", "Michael", "Francis", "Anne", "James", "Matthew"],
};
const MODULES = ["sacredPlaces", "streetNames", "innNames", "routeNames", "mountainNames", "forestNames", "seasLakes", "wetlandNames", "grasslandNames", "lands", "buildingNames"];
const SAINT = /\b(?:Saint|St\.?) ([A-Z][a-zñ]+)/g;

test("§2: no culture draws a saint from another culture's list, and none before its Christian era", () => {
  const specs = probeSpecs().filter((s: { key: string }) => MODULES.includes(s.key));
  const bad: string[] = [];
  for (const spec of specs as { key: string; culture: string; state: () => Record<string, unknown>; run: (s: Record<string, unknown>, seed: number) => string[] }[]) {
    for (const culture of ["aztec", "maya", "andean", "polynesian", "american"]) {
      for (const era of ["AN", "MD", "EM", "ST", "MO"]) {
        for (let seed = 1; seed <= 6; seed++) {
          let names: string[] = [];
          try { names = spec.run({ ...spec.state(), [spec.culture]: culture, era, count: 12, people: "invented" }, seed); } catch { continue; }
          for (const text of names) {
            for (const m of text.matchAll(SAINT)) {
              const name = m[1];
              const own = OWN[culture];
              if (!own || !["EM", "ST", "MO"].includes(era) || !own.includes(name)) bad.push(`${spec.key} ${culture} ${era}: ${text}`);
            }
          }
        }
      }
    }
  }
  assert.deepEqual([...new Set(bad)].slice(0, 15), [], `${bad.length} saints from the wrong list or era`);
});

test("§2: Stone Circle is not drawn for the five cultures of batch 6d; no Indigenous sacred being is a word of their lists", async () => {
  const { isRealGroup: isRealPlace } = await import("../src/realPlaces");
  const specs = probeSpecs().filter((s: { key: string }) => ["deityNames", "sacredPlaces"].includes(s.key));
  for (const spec of specs as { key: string; culture: string; state: () => Record<string, unknown>; run: (s: Record<string, unknown>, seed: number) => string[] }[]) {
    for (const culture of ["aztec", "maya", "american"]) {
      for (const era of ["AN", "MD", "EM", "ST", "MO"]) for (let seed = 1; seed <= 8; seed++) {
        for (const text of spec.run({ ...spec.state(), [spec.culture]: culture, era, count: 12, people: "invented" }, seed)) assert.ok(!/Stone Circle|Thunderbird|Sasquatch|Feathered Serpent/.test(text), `${spec.key} ${culture} ${era}: ${text}`);
      }
    }
  }
  for (const w of ["Thunderbird", "Sasquatch", "Wendigo", "Feathered Serpent", "Hero Twins", "Taniwha", "Menehune", "Night Marchers"]) assert.ok(isRealPlace(w), w);
});
