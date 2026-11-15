// Shared tables brief §13.2: the filler's fixes after a run of the real modules.
import { test } from "node:test";
import assert from "node:assert/strict";
import "../src/fill/batch";
import "../src/places/sources";
import "../src/vessels/engine";
import { fillSlots, repeatsGeneric, type FillContext, type Resolvers } from "../src/fill";
import { placeCultures } from "../src/places/sources";
import { generateRouteNames } from "../src/routes/engine";
import { generateBynames } from "../src/bynames/engine";
import { generateWildsNames } from "../src/wilds/engine";
import { generateWatersNames } from "../src/waters/engine";
import { peopleSourceFor } from "../src/people";
import { mulberry32 } from "../src/markov";

const ctx = (extra: Partial<FillContext> = {}): FillContext => ({ culture: "norman-british", era: "MD", mode: "real", rng: mulberry32(3), ...extra });
const cycle = (names: string[]): Resolvers => {
  let i = 0;
  return { place: () => names[i++ % names.length] };
};

// ── 1. Place fills keep their plain form; only a repeated generic is redrawn ──────────────────

test("§13.2.1: a plain place fill is kept (Moot, Grove, Edge Hut, Alder Valley)", () => {
  for (const fill of ["Moot", "Grove", "Hollow", "Edge Hut", "Alder Valley"]) {
    assert.equal(fillSlots("Siege of [place]", ctx({ resolvers: cycle([fill]) })), `Siege of ${fill}`);
  }
  assert.equal(fillSlots("[place] Cairn", ctx({ resolvers: cycle(["Moot"]) })), "Moot Cairn");
});

test("§13.2.1: a fill that ends in the feature's own generic is redrawn, up to ten times", () => {
  assert.ok(repeatsGeneric("Alder Valley", "Valley of "));
  assert.ok(repeatsGeneric("Ashhill", " Hill"));
  assert.ok(!repeatsGeneric("Moot", "Valley of "));
  assert.ok(!repeatsGeneric("Alder Valley", "Siege of "));
  assert.equal(fillSlots("Valley of [place]", ctx({ resolvers: cycle(["Alder Valley", "Moot"]) })), "Valley of Moot");
  assert.equal(fillSlots("[place] Hill", ctx({ resolvers: cycle(["Ashhill", "Grove"]) })), "Grove Hill");
  // Ten redraws and then the last is kept: no endless loop.
  assert.equal(fillSlots("Valley of [place]", ctx({ resolvers: cycle(["Alder Valley"]) })), "Valley of Alder Valley");
});

// ── 2. No unfilled [place] in real mode ───────────────────────────────────────────────────────

test("§13.2.2: German and Andean (no settlement names) fill through the family, then General", () => {
  assert.deepEqual(placeCultures("german").slice(-1), ["general"]);
  // Northern Europe brief 5a: German places skip the Scandinavian settlement names the family would give ("Ox Fjord") until German settlement names arrive (batch 5b).
  assert.deepEqual(placeCultures("german"), ["german", "general"]);
  assert.ok(placeCultures("dutch").includes("scandinavian"), "the other Germanic cultures keep the family order");
  for (const culture of ["german", "andean", "french", "roman", "polynesian", "steppe"]) {
    for (const label of ["place", "homeland place name", "town"]) {
      for (let seed = 1; seed <= 12; seed++) {
        const text = fillSlots(`[${label}] Ferry Gate`, { culture, era: "MD", mode: "real", rng: mulberry32(seed) });
        assert.ok(!/\[/.test(text), `${culture} ${label} ${seed}: ${text}`);
      }
    }
  }
});

// ── 3. No affix stacking after a fill ─────────────────────────────────────────────────────────

test("§13.2.3: under a source filter a feature never takes the linking -by- or -with- affix", () => {
  const stacked = /-(by|with)-/;
  for (const module of ["mountainNames", "lands", "hillsValleys", "starsSpace", "farmland"] as const) {
    for (const where of ["home", "new", "settled"] as const) {
      for (let seed = 1; seed <= 12; seed++) {
        const names = generateWildsNames({ module, culture: "norman-british", era: "MD", where, people: "placeholders", count: 20, seed } as never).names;
        for (const n of names) assert.ok(!stacked.test(n.text), `${module} ${where}: ${n.text}`);
      }
    }
  }
});

// ── 4. Titles match the person's sex ──────────────────────────────────────────────────────────

test("§13.2.4: a female title takes a woman's given name, a male one a man's", () => {
  const table = peopleSourceFor("norman-british", undefined, "MD", () => 0.5)!.table;
  const women = new Set(table.female.map((e) => e[0]));
  const men = new Set(table.male.map((e) => e[0]));
  for (const [gender, own, other] of [["women", women, men], ["men", men, women]] as const) {
    let checked = 0;
    for (let seed = 1; seed <= 30; seed++) {
      for (const n of generateBynames({ module: "titles", culture: "norman-british", genre: "fantasy", gender, people: "real", count: 20, seed } as never).names) {
        const given = n.text.match(/^(?:Sir |Dame |Lady |Lord )?([A-Z][a-z]+)\b/)?.[1];
        if (!given || !(own.has(given) || other.has(given))) continue;
        checked++;
        assert.ok(own.has(given) || !other.has(given), `${gender}: ${n.text}`);
      }
    }
    assert.ok(checked > 100, `${gender}: ${checked}`);
  }
});

// ── 5. Bare title slots ───────────────────────────────────────────────────────────────────────

test("§13.2.5: a title with no name takes a given name of its sex, or a surname", () => {
  for (let seed = 1; seed <= 20; seed++) {
    const c = ctx({ rng: mulberry32(seed) });
    assert.match(fillSlots("Sir's Army Road", c), /^Sir [A-Z][a-z]+'s Army Road$/);
    assert.match(fillSlots("Dame's Gate", c), /^Dame [A-Z][a-z]+'s Gate$/);
    assert.match(fillSlots("Lord", c), /^Lord [A-Z]/);
  }
  const c = ctx();
  assert.equal(fillSlots("Sir Hugh's Road", c), "Sir Hugh's Road");
  assert.equal(fillSlots("Lord Lieutenant Street", c), "Lord Lieutenant Street");
  assert.equal(fillSlots("Chapel of Our Lady", c), "Chapel of Our Lady");
  assert.equal(fillSlots("House of the Lord", c), "House of the Lord");
  assert.equal(fillSlots("[name], Lady of Reed Farm", ctx({ resolvers: { person: () => "Edith" } })), "Edith, Lady of Reed Farm");
  assert.equal(fillSlots("Duke's Army Road", c), "Duke's Army Road");
});

test("§13.2.5: the routes module never gives a bare title in real mode", () => {
  let named = 0;
  for (let seed = 1; seed <= 80; seed++) {
    for (const n of generateRouteNames({ culture: "norman-british", era: "MD", people: "real", count: 20, seed } as never).names) {
      assert.ok(!/\b(Sir|Dame|Lady|Lord)('s)?$|\b(Sir|Dame|Lady|Lord)'s\b/.test(n.text), n.text);
      if (/\b(Sir|Dame|Lady|Lord) [A-Z][a-z]+'s/.test(n.text)) named++;
    }
  }
  assert.ok(named > 0, "title plus name does occur");
});

// ── 6. Person slots in place names from the steam age on ──────────────────────────────────────

test("§13.2.6: from the steam age on, [person] in a place name is surname-led; before it, a given name", () => {
  const surnames = new Set(peopleSourceFor("norman-british", undefined, "ST", () => 0.5)!.table.surnames!.map((e) => e[0]));
  const share = (era: string, founder: boolean) => {
    let led = 0;
    let n = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const t = fillSlots("[person] Peak", { culture: "norman-british", era, mode: "real", rng: mulberry32(seed), personAsFounder: founder });
      n++;
      if (surnames.has(t.replace(/ Peak$/, "").split(" ").pop()!)) led++;
    }
    return led / n;
  };
  assert.ok(share("ST", true) > 0.6, `${share("ST", true)}`);
  assert.ok(share("MD", false) < 0.3, `${share("MD", false)}`);
  // Through the modules: wild lands and seas and coasts from ST, stars and space always.
  const led = (names: { text: string }[]) => names.filter((n) => /^[A-Z][a-z]+ [A-Z]/.test(n.text)).length;
  assert.ok(generateWildsNames({ module: "starsSpace", culture: "norman-british", era: "MD", where: "new", people: "real", count: 5, seed: 1 } as never).names.length > 0);
  assert.ok(led([]) === 0);
  assert.ok(generateWatersNames({ module: "coastsIslands", culture: "norman-british", era: "MO", where: "home", people: "real", count: 5, seed: 1 } as never).names.length > 0);
});
