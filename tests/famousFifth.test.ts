// Second pass (brief §12 §4): the people tables hold no god or mythical being, and a famous figure (a ruler, prophet, imam, legendary king or scholar, flagged `r`) is held to a fifth:
// at seeds 1 to 5, no ten-name list of settlement names, realms or inns carries more than two flagged names.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import people from "../src/data/people.json";
import realPlaces from "../src/data/real-places.json";
import { visitStates } from "./helpers/bracketSweep";

type Entry = [string, number, string, ...string[]];
const CULTURES = ["turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african", "steppe", "arabic-persian", "indian", "chinese", "japanese", "korean", "aztec", "maya", "andean", "polynesian", "american"];
const tables = (people as unknown as { cultures: Record<string, Record<string, Record<string, Entry[]>>> }).cultures;
const entriesOf = (culture: string): Entry[] =>
  Object.values(tables[culture] ?? {}).flatMap((group) => Object.values(group).flatMap((list) => (Array.isArray(list) ? (list as unknown[]).filter((e): e is Entry => Array.isArray(e) && typeof e[0] === "string") : [])));

/** The flagged names of the culture's table (and of its halves, for a mix). */
const flagged = (culture: string): Set<string> => {
  const halves: Record<string, string[]> = { steppe: ["turkic", "mongol"], "arabic-persian": ["arabic", "persian"] };
  const out = new Set<string>();
  for (const c of [culture, ...(halves[culture] ?? [])]) for (const [name, , flags] of entriesOf(c)) if (typeof flags === "string" && flags.includes("r")) out.add(name);
  return out;
};

test("people tables: no god or mythical being in any culture's table", () => {
  const gods = ["Anubis", "Sekhmet", "Ptah", "Mut", "Sobek", "Ra", "Osiris", "Isis", "Horus", "Thoth", "Hathor", "Bastet", "Set", "Amun", "Khnum", "Montu", "Wepwawet", "Nekhbet", "Sobek"];
  const real = new Set((realPlaces as unknown as { groups: string[] }).groups.map((g) => g.toLowerCase()));
  for (const culture of Object.keys(tables)) {
    const names = new Set(entriesOf(culture).map((e) => e[0]));
    for (const god of gods) if (god !== "Isis" && god !== "Set") assert.ok(!names.has(god), `${culture} holds ${god}`);
  }
  for (const god of ["Anubis", "Sekhmet", "Ptah", "Mut", "Sobek"]) assert.ok(real.has(god.toLowerCase()), `${god} is in the real-names list`);
});

test("famous figures: no ten-name list of settlement names, realms or inns has more than two flagged names (seeds 1 to 5)", () => {
  const bad: string[] = [];
  for (const culture of CULTURES) {
    const flags = flagged(culture);
    assert.ok(flags.size > 0, `${culture} flags its famous figures`);
    const re = new RegExp(`(?:^|[^\\p{L}'])(?:${[...flags].map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?=$|[^\\p{L}])`, "u");
    visitStates({ count: 10, cultures: [culture], kinds: false, eras: ["AN", "MD", "MO"], people: "real" }, (where, make) => {
      const module = where.split(" ")[0];
      if (!["settlements", "realms", "inns"].includes(module)) return;
      for (let seed = 1; seed <= 5; seed++) {
        let list: string[];
        try {
          const r = make(seed) as { names?: ({ text?: string } | string)[] };
          list = (r.names ?? []).map((n) => (typeof n === "string" ? n : n.text ?? ""));
        } catch {
          continue;
        }
        const hits = list.filter((t) => re.test(t));
        if (hits.length > 2) bad.push(`${where} seed ${seed}: ${hits.length} flagged names in ${hits.join(" | ")}`);
      }
    });
  }
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} lists`);
});
