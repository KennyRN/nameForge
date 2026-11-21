// Brief 6d fixes §3: the grammar sweep over every module the lens knows (`probeSpecs`, 45 modules: it had skipped the sacred places, the settlement kit, the peoples and tongues
// and the eight group families, among others) and every culture each offers, in every era the module reads, at seeds 1 to 3, with the people link on placeholders and on real.
// The five cultures of batch 6d must be clean. The other cultures still show the faults counted in `OUTSIDE_THE_BATCH` (their output is held by the baselines of earlier batches, so
// changing it needs the user's approval): the counts are printed, not asserted.
import { test } from "node:test";
import assert from "node:assert/strict";
import { sweepEveryModule } from "./helpers/everyModule";
import { generateSettlementNames } from "../src/settlement/names";
import { WORLD_CULTURES } from "../src/world/engine";

const BATCH = new Set(["aztec", "maya", "andean", "polynesian", "american"]);
const PATTERNS: Record<string, RegExp> = {
  // The lower-case rule of 6d A3, in every module: no capital "Beside" (the relation word is "near").
  beside: /\bBeside\b/,
  // A plural noun with an apostrophe and an s ("Peccaries's"); a surname such as Davies takes 's.
  pluralPossessive: /\b(?!Davies\b)[A-Z][a-z]*(?:ies|ves)'s\b/,
  // A deity title owning a place ("Sacred Stone of They Who Walk Beneath").
  titleOwner: /\b(?:of|at|from|to) (?:They Who|Those Who|the (?:Five|Seven|Nine|Three|Twelve|Many) Who|the [A-Z][a-z]+ Who)\b/,
  // A settlement name that is a phrase, inside another name ("Stela of On the Lake Cross", "Colony of Crossing to Yaxun").
  phraseInside: /\b(?:of|from|to) (?:Crossing to|Where |Place of |On the |In the |At the |Among |Beyond |Within |Mouth of )|\b(?:On|In|At) the [A-Z][a-z]+'s /,
  // A stray hyphen ("Frontier-League").
  hyphen: /\b[A-Z][a-z]+-(?:League|Alliance|Confederacy|Union|Realm|Republic|Kingdom|Territory|Domain|Province|Colony|Commonwealth)\b/,
  // A double possessive ("Thomas's Crossing's Fur Stone").
  doublePossessive: /'s [A-Z][a-z]+'s /,
};

let result: { modules: string[]; runs: number; inBatch: Map<string, string[]>; outside: Map<string, number> } | undefined;
const sweep = () => {
  if (result) return result;
  const inBatch = new Map<string, string[]>();
  const outside = new Map<string, number>();
  const { modules, runs } = sweepEveryModule([1, 2, 3], (module, culture, text) => {
    for (const [key, re] of Object.entries(PATTERNS)) {
      if (!re.test(text)) continue;
      if (BATCH.has(culture)) {
        const list = inBatch.get(key) ?? [];
        inBatch.set(key, list);
        if (list.length < 8 && !list.includes(`${module} ${culture}: ${text}`)) list.push(`${module} ${culture}: ${text}`);
      } else outside.set(key, (outside.get(key) ?? 0) + 1);
    }
  });
  return (result = { modules, runs, inBatch, outside });
};

test("grammar, every module: the sweep reaches every module the lens knows", () => {
  const { modules, runs } = sweep();
  for (const m of ["sacredPlaces", "settlementKit", "peoplesTongues", "mysticOrders", "tradeGuilds", "supernaturalCourts", "armsNames", "bookNames", "starsSpace"]) assert.ok(modules.includes(m), m);
  assert.ok(modules.length >= 45, `${modules.length} modules`);
  assert.ok(runs > 40000, `${runs} runs`);
  console.log(`grammar sweep: ${modules.length} modules, ${runs} runs; faults outside the batch (not asserted): ${JSON.stringify(Object.fromEntries(sweep().outside))}`);
});

for (const key of Object.keys(PATTERNS)) {
  test(`grammar, every module: no ${key} in the five cultures of batch 6d`, () => {
    assert.deepEqual(sweep().inBatch.get(key) ?? [], []);
  });
}

test("grammar: no calendar day sign in a settlement name of the five cultures, in any era", () => {
  const DAY = /\b(?:Cipactli|Ehecatl|Calli|Cuetzpalin|Coatl|Miquiztli|Mazatl|Tochtli|Atl|Itzcuintli|Itzcuin|Ozomatli|Malinalli|Acatl|Ocelotl|Cuauhtli|Cozcacuauhtli|Ollin|Tecpatl|Quiahuitl|Xochitl|Matlactli|Imix|Akbal|Chikchan|Kimi|Manik|Lamat|Muluk|Chuwen|Kaban|Etznab|Kawak)\b/;
  const bad: string[] = [];
  for (const culture of WORLD_CULTURES.filter((c) => BATCH.has(c.id))) {
    for (const era of culture.eras) for (const size of ["any", "village", "city"] as const) for (let seed = 1; seed <= 4; seed++) {
      for (const n of generateSettlementNames({ setting: "native", culture: culture.id, era: era.id, size, count: 20, seed, people: "invented" } as never).names) if (DAY.test(n.text)) bad.push(`${culture.id} ${era.id}: ${n.text}`);
    }
  }
  assert.deepEqual([...new Set(bad)].slice(0, 10), []);
});
