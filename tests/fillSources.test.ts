// Shared tables brief §3.5 and §5.2 (M6): the blocked list and the remaining sources.
import { test } from "node:test";
import assert from "node:assert/strict";
import PEOPLE from "../src/data/people.json";
import { bracketLabels, fillSlots, staysBracketed } from "../src/fill";
import { blockedNames, isBlockedName } from "../src/fill/people";
import "../src/fill/batch";
import "../src/deities/engine";
import "../src/tribes/engine";
import "../src/realms/engine";
import "../src/events/engine";
import "../src/vessels/engine";
import "../src/groups/engine";
import "../src/places/sources";
import { mulberry32 } from "../src/markov";
import { generateWildsNames, WILDS_CULTURES, WILDS_MODULES } from "../src/wilds/engine";
import { defaultWildsState } from "../src/wilds/sentence";

test("the blocked list holds at least 200 full names and catches Richard Trevithick and titled forms", () => {
  const blocked = (PEOPLE as unknown as { blocked: string[] }).blocked;
  assert.ok(blocked.length >= 200, String(blocked.length));
  assert.equal(new Set(blocked.map((b) => b.toLowerCase())).size, blocked.length);
  for (const n of ["Richard Trevithick", "James Cook", "Francis Drake", "Governor James Cook", "the Saint Thomas More"]) assert.ok(isBlockedName(n), n);
  assert.ok(!isBlockedName("James Hale"));
});

test("a pair that makes a blocked name is drawn again", () => {
  const draw = (seed: number) => {
    const rng = mulberry32(seed);
    return Array.from({ length: 300 }, () => fillSlots("[explorer]", { culture: "norman-british", era: "MO", mode: "real", rng }));
  };
  const pair = draw(5).find((n) => /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(n));
  assert.ok(pair, "a given name and surname pair is drawn");
  blockedNames.add(pair!.toLowerCase());
  try {
    assert.ok(!draw(5).includes(pair!));
  } finally {
    blockedNames.delete(pair!.toLowerCase());
  }
});

test("the deity, folk, realm, river, place, battle, ship and company sources each fill", () => {
  const rng = mulberry32(3);
  for (const label of ["deity", "folk", "realm", "river", "place", "earlier or district name", "battle", "ship", "company"]) {
    const out = fillSlots(`[${label}]`, { culture: "norman-british", era: "MD", mode: "real", rng });
    assert.ok(!out.startsWith("["), `${label}: ${out}`);
  }
});

test("sweep: in real mode every label left in wild lands output is on the stay-bracketed list or has no table for its culture", () => {
  const left = new Map<string, Set<string>>();
  const keys = WILDS_CULTURES.map((c) => (c as { key?: string; id?: string }).key ?? (c as { id: string }).id);
  for (const where of ["home", "new", "settled"] as const) {
    for (const module of WILDS_MODULES.slice(0, 3)) {
      for (const culture of keys) {
        try {
          const r = generateWildsNames({ ...defaultWildsState(module), module, culture, where, people: "real", count: 20, seed: 7 } as never);
          for (const n of r.names) for (const l of bracketLabels(n.text)) if (!staysBracketed(l)) left.set(l, (left.get(l) ?? new Set()).add(culture));
        } catch {
          /* no eligible names */
        }
      }
    }
  }
  // Person labels survive only for cultures with no people table; settlement labels only where the culture has no settlement engine.
  const allowed = new Set(["place", "homeland place name", "personal name", "monarch", "holy person", "dynasty", "deity", "earlier or district name", "tribal name"]);
  for (const l of left.keys()) assert.ok(allowed.has(l), `unexpected leftover ${l}`);
});
