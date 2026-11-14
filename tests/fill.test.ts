// Shared tables brief §5: the filler's rules, with a test resolver (the real sources come with their tables).
import { test } from "node:test";
import assert from "node:assert/strict";
import { fillEra, fillPeriod, fillSlots, labelInfo, PERSON_SLOTS, staysBracketed, type FillContext, type Resolvers } from "../src/fill";
import FILL from "../src/data/fill.json";
import { mulberry32 } from "../src/markov";

const ctx = (extra: Partial<FillContext> = {}): FillContext => ({ culture: "norman-british", era: "MD", mode: "real", rng: mulberry32(1), ...extra });

/** A resolver that gives each source's names in turn, so two fills in one name differ. */
const test_resolvers = (names: Record<string, string[]>): Resolvers => {
  const next: Record<string, number> = {};
  return Object.fromEntries(
    Object.entries(names).map(([source, list]) => [
      source,
      (request: { avoid: ReadonlySet<string> }) => {
        for (let i = 0; i < list.length; i++) {
          const pick = list[((next[source] ?? 0) + i) % list.length];
          if (!request.avoid.has(pick)) {
            next[source] = ((next[source] ?? 0) + i + 1) % list.length;
            return pick;
          }
        }
        return list[0];
      },
    ]),
  );
};

test("with no resolver every bracket stays as the engine made it", () => {
  assert.equal(fillSlots("[founder] Peak", ctx()), "[founder] Peak");
  assert.equal(fillSlots("Lands of [holy person]", ctx({ resolvers: {} })), "Lands of [holy person]");
});

test("a bracket is filled from the source its label maps to", () => {
  const resolvers = test_resolvers({ person: ["Hale"], place: ["Wick"] });
  assert.equal(fillSlots("[founder] Peak above [place]", ctx({ resolvers })), "Hale Peak above Wick");
});

test("labels with no source and labels that stay bracketed are left alone", () => {
  const resolvers = test_resolvers({ person: ["Hale"] });
  assert.equal(fillSlots("[native bird] Cove by [mystery] Head", ctx({ resolvers })), "[native bird] Cove by [mystery] Head");
});

test("possessives: '[founder]'s' takes the fill's possessive once", () => {
  const resolvers = test_resolvers({ person: ["Hale", "Botolph's"] });
  assert.equal(fillSlots("[founder]'s Peak", ctx({ resolvers })), "Hale's Peak");
  assert.equal(fillSlots("[founder]'s Peak", ctx({ resolvers })), "Botolph's Peak", "a fill that is already possessive isn't doubled");
});

test("articles: 'of the [folk]' drops a doubled 'the'; a result never starts with a lower-case 'the'", () => {
  const resolvers = test_resolvers({ folk: ["The Ash Folk"], place: ["the Weald"] });
  assert.equal(fillSlots("Valley of the [folk]", ctx({ resolvers })), "Valley of the Ash Folk");
  assert.equal(fillSlots("[place] Hill", ctx({ resolvers })), "The Weald Hill");
});

test("within one name two brackets with the same label get different fills", () => {
  const resolvers = test_resolvers({ person: ["Hale", "Brand", "Cole"] });
  assert.equal(fillSlots("[founder] and [founder]", ctx({ resolvers })), "Hale and Brand");
});

test("series mode: each label is filled once per batch and reused", () => {
  const resolvers = test_resolvers({ person: ["Hale", "Brand", "Cole"], place: ["Wick", "Ford"] });
  const series = new Map<string, string>();
  const names = ["[founder] Peak", "[founder] Pass", "North [place]", "South [place]"].map((n) => fillSlots(n, ctx({ resolvers, series })));
  assert.deepEqual(names, ["Hale Peak", "Hale Pass", "North Wick", "South Wick"]);
  // Without a series each name draws again.
  const plain = ["[founder] Peak", "[founder] Pass"].map((n) => fillSlots(n, ctx({ resolvers: test_resolvers({ person: ["Hale", "Brand"] }) })));
  assert.deepEqual(plain, ["Hale Peak", "Hale Pass"].map((n, i) => (i === 0 ? n : "Hale Pass")));
});

test("era: a band reads its middle era; the period follows the era", () => {
  assert.equal(fillEra("fantasy"), "MD");
  assert.equal(fillEra("modern"), "MO");
  assert.equal(fillEra("scifi"), "IS");
  assert.equal(fillEra("EM"), "EM");
  assert.equal(fillPeriod("EM"), "historic");
  assert.equal(fillPeriod("ST"), "modern");
  assert.equal(fillPeriod("IS"), "modern");
  let seen: unknown;
  fillSlots("[founder]", ctx({ era: "scifi", resolvers: { person: (r) => ((seen = [r.era, r.period]), "X") } }));
  assert.deepEqual(seen, ["IS", "modern"]);
});

test("a resolver gets the label, slot, culture, region and a way to draw from the batch's stream", () => {
  let request: Record<string, unknown> = {};
  fillSlots("[explorer]", ctx({ culture: "celtic", region: "WAL", resolvers: { person: (r) => ((request = { ...r }), "X") } }));
  assert.equal(request.label, "explorer");
  assert.equal(request.slot, "founder");
  assert.equal(request.culture, "celtic");
  assert.equal(request.region, "WAL");
  assert.equal(typeof request.rng, "function");
});

test("fill.json: every label's source exists, every person slot is a known form, and no label is both mapped and left bracketed", () => {
  const sources = Object.keys(FILL.sources);
  for (const [label, info] of Object.entries(FILL.labels as Record<string, { source: string; slot?: string }>)) {
    assert.ok(sources.includes(info.source), `${label}: source ${info.source}`);
    if (info.source === "person" || info.source === "holy") assert.ok((PERSON_SLOTS as readonly string[]).includes(info.slot ?? ""), `${label}: slot ${info.slot}`);
    assert.ok(!staysBracketed(label), `${label} is both mapped and left bracketed`);
    assert.deepEqual(labelInfo(label.toUpperCase())?.source, info.source, "matching ignores case");
  }
});
