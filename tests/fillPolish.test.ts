// Shared tables brief §14: the filler's polish after a run of the real modules.
import { test } from "node:test";
import assert from "node:assert/strict";
import "../src/fill/batch";
import "../src/places/sources";
import "../src/tribes/engine";
import { fillSlots } from "../src/fill";
import { fillPeopleBatch } from "../src/fill/batch";
import { drawFromSource } from "../src/places/sources";
import { placePersonsAsFounders, generateWildsNames } from "../src/wilds/engine";
import { generateWatersNames } from "../src/waters/engine";
import { peopleSourceFor } from "../src/people";
import { mulberry32 } from "../src/markov";

const founders = (culture: string, seed = 42, count = 10): string[] =>
  fillPeopleBatch({ seed, names: Array.from({ length: count }, () => ({ text: "[founder]" })) }, "real", { culture, era: "MD" }).names.map((n) => n.text);

// ── 1. No repeats within a batch ──────────────────────────────────────────────────────────────

test("§14.1: ten Aztec, Maya and Andean founders at seed 42 repeat nothing", () => {
  for (const culture of ["aztec", "maya", "andean"]) {
    const names = founders(culture);
    assert.equal(new Set(names).size, names.length, `${culture}: ${names.join("; ")}`);
  }
});

test("§14.1: a batch longer than a short list still fills, repeating only once the list has run out", () => {
  const names = founders("aztec", 7, 60);
  assert.equal(names.length, 60);
  assert.ok(new Set(names).size >= 40, `${new Set(names).size} different`);
});

test("§14.1: series mode keeps one fill per label, as before", () => {
  const batch = fillPeopleBatch({ seed: 5, names: Array.from({ length: 6 }, () => ({ text: "[founder] Peak" })) }, "real", { culture: "aztec", era: "MD", series: true });
  assert.equal(new Set(batch.names.map((n) => n.text)).size, 1);
});

// ── 2. Old personal names in old place names ─────────────────────────────────────────────────

const male = (culture: string): Set<string> => new Set(peopleSourceFor(culture, undefined, "MD", mulberry32(1))!.table.male.map((e) => e[0]));
const oldFills = (region: string | undefined, culture = "general", era = "MO", n = 300): string[] => {
  const rng = mulberry32(11);
  return Array.from({ length: n }, () => fillSlots("[personal name]ing Tarn", { culture, era, region, mode: "real", rng }).replace(/ing Tarn$/, ""));
};

test("§14.2: a personal name before -ing, -ington or -ingham comes from the Anglo-Saxon historic table, whatever the culture and era", () => {
  const anglo = male("anglo-saxon");
  for (const [culture, era] of [["general", "MO"], ["norman-british", "ST"], ["japanese", "IS"]] as const) {
    for (const stem of oldFills(undefined, culture, era, 80)) assert.ok(anglo.has(stem), `${culture} ${era}: ${stem}`);
  }
  for (const ending of ["ington", "ingham", "ings"]) {
    const stem = fillSlots(`[personal name]${ending}`, { culture: "general", era: "MO", mode: "real", rng: mulberry32(2) }).replace(new RegExp(`${ending}$`), "");
    assert.ok(anglo.has(stem), stem);
  }
  assert.ok(!oldFills(undefined).includes("Henry"));
});

test("§14.2: the region picks the people: Scandinavian in NTH, EMD and EAN (half) and NSI (70%), Welsh, Cornish and Scottish at home", () => {
  const anglo = male("anglo-saxon");
  const norse = male("norse");
  const only = (set: Set<string>) => (n: string) => set.has(n) && !anglo.has(n);
  for (const [region, expected] of [["NTH", 0.5], ["EMD", 0.5], ["EAN", 0.5], ["NSI", 0.7]] as const) {
    const names = oldFills(region, "general", "MO", 800);
    assert.ok(names.every((n) => anglo.has(n) || norse.has(n)), region);
    const share = names.filter(only(norse)).length / names.length;
    // Names the two lists share count as Anglo-Saxon here, so the share runs a little under the weight.
    assert.ok(share > expected - 0.15 && share < expected + 0.05, `${region} ${share}`);
  }
  for (const [region, culture] of [["WAL", "welsh"], ["COR", "cornish"], ["SBL", "scottish"], ["SLO", "scottish"], ["SHH", "scottish"]] as const) {
    const table = male(culture);
    for (const n of oldFills(region, "general", "MO", 60)) assert.ok(table.has(n), `${region}: ${n}`);
  }
  assert.ok(oldFills("SEA").every((n) => anglo.has(n)));
});

test("§14.2: the British shapes source marks its personal names as old ones only when the filler follows", () => {
  const draw = (oldNames: boolean) => {
    const rng = mulberry32(9);
    const out: string[] = [];
    for (let i = 0; i < 300; i++) {
      const t = drawFromSource({ native: { generics: ["hill", "valley", "farm", "field", "ford"] } }, "native", { where: "home", culture: "norman-british", rng, oldNames });
      if (t) out.push(t);
    }
    return out;
  };
  const plain = draw(false);
  const marked = draw(true);
  assert.ok(plain.some((t) => /\[personal name\]/.test(t)), "a personal name turns up");
  assert.ok(!plain.some((t) => /\[old personal name\]/.test(t)));
  assert.ok(marked.some((t) => /\[old personal name\]/.test(t)));
  assert.ok(!marked.some((t) => /\[personal name\]/.test(t)));
});

test("§14.2: real names from the place modules carry no modern given name before -ing", () => {
  const anglo = male("anglo-saxon");
  const stems = new Set<string>();
  for (const module of ["lands", "hillsValleys", "farmland"] as const) {
    for (let seed = 1; seed <= 12; seed++) {
      const b = generateWildsNames({ module, culture: "norman-british", era: "MO", where: "home", people: "real", count: 60, seed } as never);
      for (const n of b.names) for (const m of n.text.matchAll(/\b([A-Z][a-z]+)ings?\b/g)) stems.add(m[1]);
    }
  }
  assert.ok(stems.size > 0, "some -ing names turned up");
  // A stem is an Anglo-Saxon name, or an ordinary word the shape fuses ("Hastings" is not drawn from a personal name).
  const odd = [...stems].filter((s) => !anglo.has(s) && ["Henry", "Alan", "Alice", "Harry", "Stanley", "David"].includes(s));
  assert.deepEqual(odd, []);
});

// ── 3. Folk fills stay short and suit the biome ─────────────────────────────────────────────

test("§14.3: a folk fill has at most two words after an optional 'the'", () => {
  const rng = mulberry32(4);
  for (const label of ["folk", "folk group", "tribal name", "people"]) {
    for (let i = 0; i < 40; i++) {
      const fill = fillSlots(`[${label}]`, { culture: "norman-british", era: "MD", mode: "real", rng, biome: "temperate" });
      assert.ok(fill.replace(/^the\s+/i, "").split(/\s+/).length <= 2, `${label}: ${fill}`);
    }
  }
});

test("§14.3: a temperate coast draws its folk in the temperate biome, with no mango or millet", () => {
  const seen: string[] = [];
  for (let seed = 1; seed <= 40; seed++) {
    const b = generateWatersNames({ module: "coastsIslands", culture: "norman-british", era: "MD", where: "home", people: "real", count: 40, seed } as never);
    seen.push(...b.names.map((n) => n.text));
  }
  assert.equal(seen.filter((t) => /\b(mango|millet)\b/i.test(t)).length, 0);
});

// ── 5. Founder forms in the place modules ───────────────────────────────────────────────────

test("§14.5: lands, farmland, hills and valleys, rivers and inland waters, and the wild lands use founder forms from the steam age on", () => {
  for (const module of ["lands", "farmland", "hillsValleys", "riversInland", "mountainNames", "forestNames", "desertNames", "moorNames", "wetlandNames", "grasslandNames", "starsSpace"]) {
    for (const era of ["ST", "MO", "NF", "IS"]) assert.equal(placePersonsAsFounders(module, era), true, `${module} ${era}`);
    for (const era of ["AN", "MD", "EM"]) assert.equal(placePersonsAsFounders(module, era), module === "starsSpace", `${module} ${era}`);
  }
});

test("§14.5: a [person] in a steam-age place name is said as a founder, a given name before it", () => {
  const forms = (personAsFounder: boolean) => {
    const rng = mulberry32(21);
    return Array.from({ length: 200 }, () => fillSlots("Hill of [person]", { culture: "norman-british", era: "MO", mode: "real", rng, personAsFounder }));
  };
  assert.notDeepEqual(forms(true), forms(false));
  // Founder forms carry a surname (or a title) far more often than a person's own given-name forms do.
  const given = forms(false).filter((t) => t.replace("Hill of ", "").split(" ").length === 1).length;
  const founder = forms(true).filter((t) => t.replace("Hill of ", "").split(" ").length === 1).length;
  assert.notEqual(given, founder);
});
