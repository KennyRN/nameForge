// Brief 6a: the real-name list holds the batch's well-known places, events, objects, groups, realms and craft (150 or more added), and none of the batch's
// signature words or fixed names is one.
import { test } from "node:test";
import assert from "node:assert/strict";
import realPlaces from "../src/data/real-places.json";
import { NORTH5C } from "../src/north5c";
import { NORTH } from "../src/northData";
import { NORTH5B } from "../src/northData5b";
import { isRealGroup, isRealPlace } from "../src/realPlaces";
import { TIER6A_KEYS } from "../src/tier6a";

test("6a: the real-name list holds the batch's well-known names, at least 150 of them", () => {
  const added = ["Pyrenees", "Mount Vesuvius", "River Tagus", "Bosporus", "Madrid", "Lisbon", "Florence", "Constantinople", "Amsterdam", "Moscow", "Hundred Years' War", "Spanish Armada", "Dutch East India Company", "Praetorian Guard", "Mona Lisa", "Parthenon", "Divine Comedy", "Byzantine Empire", "Greek Fire", "Colosseum"];
  for (const name of added) assert.ok(isRealGroup(name) || isRealPlace(name), name);
  const lists = realPlaces as unknown as { places: string[]; towns: string[]; groups: string[] };
  assert.ok(lists.places.length + lists.towns.length + lists.groups.length >= 614 + 150, "the lists grew by 150 or more (614 before the batch)");
});

// Words the shared era and fantastic pools add to every culture's sky lore (they match a real name, as they do for the core cultures).
const SHARED_POOL = new Set(["Rocket", "Wanderer", "Evening Star"]);

test("6a: no signature word or fixed name of the batch is a real place, group, realm, craft or object", () => {
  for (const m of Object.values(NORTH5C.modules)) for (const [c, content] of Object.entries(m.cultures)) if (TIER6A_KEYS.includes(c)) for (const w of content.n.flat()) if (!SHARED_POOL.has(w)) assert.ok(!isRealGroup(w), `${c}: ${w}`);
  const pools = [...Object.values(NORTH.vocab.pools), ...Object.values(NORTH5B.vocab.pools)] as { entries?: { w: string; c?: string[] }[] }[];
  for (const pool of pools) for (const e of pool.entries ?? []) if (e.c?.some((c) => TIER6A_KEYS.includes(c))) assert.ok(!isRealGroup(e.w) && (!e.w.includes(" ") || !isRealPlace(e.w)), e.w); // a single word is a qualifier: the generator redraws a real town beside it
});
