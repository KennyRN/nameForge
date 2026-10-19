// Settlement kit (Settlement kit brief §13).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mulberry32 } from "../src/markov";
import { buildContext, selfPatterns, unmarkedTownPatterns, type SettlementContext } from "../src/settlement/context";
import { generateRouteNames, ROUTE_CULTURES, ROUTE_ERAS, routeBlockSet, routeNorm, type RouteEra } from "../src/routes/engine";
import { generateStreetNames, streetBlockSet } from "../src/streets/engine";
import { generateInnNames, innBlockForms, innBlockSet } from "../src/inns/engine";
import { buildingBlockSet, generateBuildingNames } from "../src/buildings/engine";
import { generateMonumentNames, monumentBlockSet } from "../src/monuments/engine";
import { generateGroupNames, GROUP_DATA, normForBlock } from "../src/groups/engine";
import { generateBynames } from "../src/bynames/engine";
import { generateVesselNames } from "../src/vessels/engine";
import { inCultureGroup } from "../src/settlement/vocab";
import { engineSnapshot } from "./fixtures/engineSnapshot";

const ctxFor = (culture: string, era: RouteEra = "MD", people: "placeholders" | "invented" = "invented", seed = 7) =>
  buildContext({ culture, era, fantastic: false, people }, mulberry32(seed));

// ── §13.1 Context ───────────────────────────────────────────────────────────

test("§13.1: the same options and seed give the same context", () => {
  for (const culture of ["norman-british", "japanese", "maya"]) assert.deepEqual(ctxFor(culture, "EM", "invented", 3), ctxFor(culture, "EM", "invented", 3));
  assert.notDeepEqual(ctxFor("norman-british", "MD", "invented", 3), ctxFor("norman-british", "MD", "invented", 4));
});

test("§13.1: town and the 6 neighbours are all different, never placeholders, and pass every module's safeguards", () => {
  const route = routeBlockSet();
  const street = streetBlockSet();
  const inn = innBlockSet();
  const building = buildingBlockSet();
  const group = new Set(GROUP_DATA.safeguards.block.map(normForBlock));
  for (const c of ROUTE_CULTURES) {
    for (const { code: era } of ROUTE_ERAS) {
      for (const people of ["placeholders", "invented"] as const) {
        const ctx = ctxFor(c.key, era, people, 11);
        const all = [ctx.town, ...ctx.neighbours];
        const where = `${c.key} ${era} ${people}: ${all.join(", ")}`;
        assert.equal(ctx.neighbours.length, 6, where);
        assert.equal(new Set(all.map((t) => t.toLowerCase())).size, 7, where);
        for (const t of all) {
          assert.ok(t && !t.includes("["), where);
          assert.ok(!route.has(routeNorm(t)) && !street.has(routeNorm(t)) && !innBlockForms(t).some((f) => inn.has(f)), where);
          assert.ok(!building.has(routeNorm(t).replace(/^the /, "")) && !group.has(normForBlock(t)), where);
        }
      }
    }
  }
});

test("§13.1: holy only for christian cultures; trades null for indian and west-african; two goods", () => {
  for (const c of ROUTE_CULTURES) {
    for (const era of ["AN", "MD", "ST"] as RouteEra[]) {
      const ctx = ctxFor(c.key, era);
      if (inCultureGroup("christian", c.key, era)) assert.ok(ctx.holy?.startsWith("Saint "), `${c.key} ${era}`);
      else assert.equal(ctx.holy, null, `${c.key} ${era}`);
      if (c.key === "indian" || c.key === "west-african") assert.equal(ctx.trades, null);
      else assert.equal(ctx.trades?.length, 2, c.key);
      assert.equal(ctx.goods.length, 2, c.key);
      assert.equal(ctx.throughRoute, null);
      assert.deepEqual(ctx.landmarks, []);
    }
  }
  assert.equal(ctxFor("polynesian").vesselCulture, "hawaiian");
  assert.equal(ctxFor("andean").tradition, "andean");
});

// ── §13.2 Engines with context ──────────────────────────────────────────────

const DATA = ["route-names", "street-names", "inn-names", "building-names", "monument-names", "group-names", "bynames", "vessels"].map((f) => [f, JSON.parse(readFileSync(`src/data/${f}.json`, "utf8"))] as const);

test("§13.2: every pattern with {town} in the eight engines is marked self or not", () => {
  for (const [file, data] of DATA) assert.deepEqual(unmarkedTownPatterns(data), [], file);
});

const SELF = new Set(DATA.flatMap(([, d]) => [...selfPatterns(d)]));
const withTown = (p: string) => /\{town[}:]/.test(p);

/** The context's town in self shapes; only neighbours (never the town) in the others' {town} and {destination}. */
function checkPlaces(ctx: SettlementContext, label: string, names: { text: string; shape: string }[]) {
  let self = 0;
  let other = 0;
  for (const n of names) {
    if (SELF.has(n.shape)) {
      assert.ok(n.text.includes(ctx.town), `${label}: ${n.text} (${n.shape})`);
      self++;
    } else if (withTown(n.shape) || n.shape.includes("{destination")) {
      assert.ok(ctx.neighbours.some((t) => n.text.includes(t)), `${label}: ${n.text} (${n.shape})`);
      other++;
    }
  }
  return { self, other };
}

test("§13.2: with a context, self shapes name the settlement and the rest its neighbours", () => {
  for (const people of ["placeholders", "invented"] as const) {
    const ctx = ctxFor("norman-british", "EM", people, 21);
    const counts: Record<string, { self: number; other: number }> = {};
    const add = (label: string, names: { text: string; shape: string }[]) => {
      const c = checkPlaces(ctx, label, names);
      counts[label] = { self: (counts[label]?.self ?? 0) + c.self, other: (counts[label]?.other ?? 0) + c.other };
    };
    for (let seed = 1; seed <= 30; seed++) {
      for (const era of ["EM", "ST", "MO"] as RouteEra[]) {
        add("routes", generateRouteNames({ culture: "norman-british", era, people, count: 10, seed, context: ctx }).names);
        add("streets", generateStreetNames({ culture: "norman-british", era, people, count: 10, seed, context: ctx }).names);
        add("inns", generateInnNames({ culture: "norman-british", era, people, count: 10, seed, context: ctx }).names);
        add("buildings", generateBuildingNames({ culture: "norman-british", era, people, count: 10, seed, context: ctx }).names);
        add("monuments", generateMonumentNames({ culture: "norman-british", era, people, count: 10, seed, context: ctx }).names);
      }
      for (const family of ["martial", "trade", "power", "underworld"]) add("groups", generateGroupNames({ family, tradition: ctx.tradition, people, count: 10, seed, context: ctx }).names);
      add("bynames", generateBynames({ module: "titles", culture: "norman-british", kind: "office", count: 10, seed, context: ctx }).names);
      add("vessels", generateVesselNames({ module: "ships", culture: "norman-british", people, count: 10, seed, context: ctx }).names);
    }
    for (const label of ["routes", "inns", "buildings", "monuments", "groups", "bynames"]) assert.ok(counts[label].self > 0, `${people} ${label}: no self shapes`);
    for (const label of ["routes", "streets"]) assert.ok(counts[label].other > 0, `${people} ${label}: no neighbours`);
  }
});

test("§4: with a context, {founder} is the context's, and its saint is the commonest", () => {
  const ctx = ctxFor("norman-british", "MD", "invented", 5);
  const holy = ctx.holy!;
  let withSaint = 0;
  let saints = 0;
  for (let seed = 1; seed <= 200; seed++) {
    for (const n of generateBuildingNames({ culture: "norman-british", kind: "faith", people: "invented", count: 5, seed, context: ctx }).names) {
      if (n.text.startsWith("Saint ")) {
        saints++;
        if (n.text.startsWith(holy)) withSaint++;
      }
      if (n.shape.includes("{founder")) assert.ok(n.text.includes(ctx.founder), n.text);
    }
  }
  assert.ok(saints > 20 && withSaint / saints > 0.5, `${withSaint}/${saints}`);
});

test("§13.2: without a context, every engine's output matches the fixture exactly", () => {
  const fixture = JSON.parse(readFileSync("tests/fixtures/settlement-engines.json", "utf8"));
  assert.deepEqual(engineSnapshot(), fixture);
});

// ── §13.3–§13.6 The kit ─────────────────────────────────────────────────────

import { generateKit, KIT_DATA, KIT_DETAILS, KIT_POSITIONS, KIT_SIZES, rerollKit, rerollTargets, sectionCount, sectionsFor, type Kit, type KitSectionKey } from "../src/settlement/kit";
import { kitMarkdown } from "../src/settlement/kitFormat";
import { SETTLEMENT_VOCAB } from "../src/settlement/vocab";

const section = (kit: Kit, key: KitSectionKey) => kit.sections.find((s) => s.key === key);
const texts = (kit: Kit, key: KitSectionKey) => section(kit, key)?.entries.map((e) => e.text) ?? [];

test("§13.3: section counts follow §5.1 for every size × detail (a shortfall only with a notice)", () => {
  for (const size of KIT_SIZES) {
    for (const detail of KIT_DETAILS) {
      for (const seed of [1, 2]) {
        const kit = generateKit({ culture: "norman-british", size, detail, position: "coast", people: "invented", seed });
        for (const key of ["roads", "districts", "streets", "squares", "inns", "buildings", "monuments", "groups", "history", "ships"] as KitSectionKey[]) {
          const wanted = sectionCount(key, size, detail, "coast");
          const got = texts(kit, key).length;
          const where = `${size} ${detail} ${key}: ${got} of ${wanted}`;
          if (got !== wanted) assert.ok(got < wanted && kit.notices.some((n) => n.startsWith(section(kit, key)?.title ?? "")), where);
        }
      }
    }
  }
  assert.equal(sectionCount("streets", "town", "brief"), 4);
  assert.equal(sectionCount("streets", "town", "full"), 12);
  assert.equal(sectionCount("districts", "village", "full"), 0);
  assert.equal(sectionCount("roads", "town", "standard", "crossroads"), 4);
});

test("§13.3: a village has no districts; places only and people only; inland has no ships", () => {
  const village = generateKit({ culture: "norman-british", size: "village", seed: 4 });
  assert.equal(section(village, "districts"), undefined);
  const places = generateKit({ culture: "norman-british", position: "coast", contents: "places", seed: 4 });
  assert.equal(places.ruler, null);
  assert.equal(section(places, "groups"), undefined);
  assert.equal(section(places, "ships"), undefined);
  assert.equal(section(places, "history"), undefined);
  assert.ok(texts(places, "streets").length > 0);
  const people = generateKit({ culture: "norman-british", position: "coast", contents: "people", seed: 4 });
  assert.ok(people.ruler && texts(people, "groups").length === 4);
  assert.deepEqual(people.sections.map((s) => s.key), ["groups", "neighbours", "history"]);
  assert.equal(section(generateKit({ culture: "norman-british", seed: 4 }), "ships"), undefined);
});

const BOTH = (kit: Kit, text: string) =>
  (!!kit.context.throughRoute && text === kit.context.throughRoute) || kit.context.landmarks.some((l) => text.replace(/^the /, "") === l || text === `the ${l} Inn`);

test("§13.4: the road through town is in Roads (and Streets from 8); landmarks are buildings and monuments; the patron saint; no name twice", () => {
  for (let seed = 1; seed <= 25; seed++) {
    for (const culture of ["norman-british", "slavic", "japanese", "general"]) {
      const kit = generateKit({ culture, people: seed % 2 ? "invented" : "placeholders", position: seed % 3 ? "river" : "crossroads", seed });
      const where = `${culture} ${seed}: ${kitMarkdown(kit)}`;
      const through = kit.context.throughRoute;
      assert.ok(through, where);
      assert.ok(section(kit, "roads")!.entries.some((e) => e.text === through && e.through), where);
      if (texts(kit, "streets").length >= 8) assert.ok(texts(kit, "streets").includes(through!), where);
      const buildings = [...texts(kit, "buildings"), ...texts(kit, "monuments")].map((t) => t.replace(/^the /, ""));
      for (const l of kit.context.landmarks) assert.ok(buildings.includes(l), where);
      if (culture === "norman-british" || culture === "slavic") assert.ok(texts(kit, "buildings").some((t) => t.includes(kit.context.holy!)), where);
      const all = kit.sections.flatMap((s) => s.entries.map((e) => e.text)).filter((t) => !BOTH(kit, t));
      const keys = all.map((t) => t.toLowerCase().replace(/^the /, ""));
      assert.equal(new Set(keys).size, keys.length, where);
      assert.ok(!keys.includes(kit.context.town.toLowerCase()), where);
    }
  }
});

test("§13.4: inns' roadside shapes and streets' landmarks use the context's road and landmarks", () => {
  const kit = generateKit({ culture: "norman-british", position: "crossroads", people: "invented", seed: 8 });
  const ctx = kit.context;
  for (let seed = 1; seed <= 20; seed++) {
    for (const n of generateInnNames({ culture: "norman-british", era: "MD", people: "invented", shape: "the {route} Inn", count: 2, seed, context: ctx }).names) assert.equal(n.sign, `the ${ctx.throughRoute} Inn`);
    for (const n of generateStreetNames({ culture: "norman-british", kind: "streets", people: "invented", shape: "{landmark} {sw}", count: 2, seed, context: ctx }).names) {
      assert.ok(ctx.landmarks.some((l) => n.plain.startsWith(`${l} `)), n.text);
    }
  }
});

const MARITIME = new Set(SETTLEMENT_VOCAB.pools["buildingWord:maritime"].entries.map((e) => e.w));

test("§13.5: on the coast, maritime buildings and ships; on a river, working boats; IS on a station, spacecraft", () => {
  let maritime = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const kit = generateKit({ culture: "norman-british", size: "town", position: "coast", seed });
    if (texts(kit, "buildings").some((t) => [...MARITIME].some((w) => t.endsWith(` ${w}`)))) maritime++;
    assert.ok(texts(kit, "ships").length > 0, `${seed}`);
  }
  assert.ok(maritime >= 1, `${maritime}`);
  for (let seed = 1; seed <= 20; seed++) {
    const kit = generateKit({ culture: "norman-british", era: "EM", position: "river", seed });
    const ships = section(kit, "ships")!;
    assert.ok(ships.entries.length > 0);
    for (const e of ships.entries) assert.equal(e.kind, "working", e.text);
  }
  const station = generateKit({ culture: "general", era: "IS", position: "crossroads", seed: 3 });
  assert.equal(section(station, "ships")!.title, "Spacecraft");
  assert.ok(texts(station, "ships").length > 0);
});

test("§13.6: rerolling Roads changes the road through town and redoes streets and inns; the rest stay", () => {
  for (let seed = 1; seed <= 10; seed++) {
    const kit = generateKit({ culture: "norman-british", people: "invented", position: "river", seed });
    const { kit: next, note } = rerollKit(kit, "roads");
    assert.equal(note, "Streets and inns were redone to match.");
    assert.notEqual(next.context.throughRoute, kit.context.throughRoute, `${seed}`);
    assert.notDeepEqual(texts(next, "streets"), texts(kit, "streets"));
    for (const key of ["districts", "squares", "buildings", "monuments", "groups", "ships"] as KitSectionKey[]) assert.deepEqual(texts(next, key), texts(kit, key), `${seed} ${key}`);
    assert.equal(next.context.town, kit.context.town);
    assert.equal(next.ruler, kit.ruler);
  }
  const kit = generateKit({ culture: "norman-british", seed: 3 });
  const groups = rerollKit(kit, "groups");
  assert.equal(groups.note, undefined);
  assert.deepEqual(texts(groups.kit, "streets"), texts(kit, "streets"));
});

test("§13.6: the markdown block matches §9.1", () => {
  const kit: Kit = {
    options: { culture: "norman-british", era: "MD", fantastic: false, size: "town", position: "river", tone: "any", contents: "whole", detail: "standard", people: "invented", seed: 1 },
    rerolls: {},
    context: { ...ctxFor("norman-british"), town: "Fenwick", realm: "Kingdom of the Western Fells" },
    summary: "a town on a river, in the Kingdom of the Western Fells",
    ruler: "Reeve of Fenwick",
    sections: [
      { key: "roads", title: "Roads", wanted: 3, entries: [{ text: "Great North Road" }, { text: "Saltgate Road" }, { text: "Salt Way", through: true }] },
      { key: "districts", title: "Districts", wanted: 3, entries: [] },
      { key: "groups", title: "Groups", wanted: 2, entries: [{ text: "Brothers of the Still Water", role: "Faith" }, { text: "the Fenwick Watch", role: "Watch" }] },
      { key: "ships", title: "Ships", wanted: 1, entries: [{ text: "Good Anne" }] },
    ],
    notices: [],
  };
  assert.equal(
    kitMarkdown(kit),
    [
      "## Fenwick",
      "*A town on a river, in the Kingdom of the Western Fells.*",
      "",
      "**Ruler:** Reeve of Fenwick",
      "",
      "### Roads",
      "- Great North Road",
      "- Saltgate Road",
      "- Salt Way *(through the town)*",
      "",
      "### Groups",
      "- **Faith:** Brothers of the Still Water",
      "- **Watch:** the Fenwick Watch",
      "",
      "### Ships",
      "- Good Anne",
      "",
    ].join("\n"),
  );
});

test("§8.3: the summary line", () => {
  const kit = generateKit({ culture: "norman-british", size: "city", position: "coast", seed: 12 });
  assert.ok(/^a city on the coast(, in the .+)?$/.test(kit.summary), kit.summary);
  assert.ok(/^an outpost on a station/.test(generateKit({ culture: "general", era: "IS", size: "village", position: "crossroads", seed: 2 }).summary));
});

// ── §13.7 Module ────────────────────────────────────────────────────────────

import { chooseKit, DEFAULT_KIT_STATE, kitHistoryLabel, kitSentence, kitSentenceText } from "../src/settlement/kitSentence";
import { freeNotePath, kitHistorySection, kitNoteContent, parseKitHistory, parseKitNote } from "../src/settlement/kitFormat";
import { modulePresetContent, parseModulePreset, type KitPreset } from "../src/presets";
import { historySection, SECTION_GROUPS } from "../src/sections";

test("§13.7: the default sentence's plain text; “An” before a vowel", () => {
  assert.equal(
    kitSentenceText(kitSentence(DEFAULT_KIT_STATE)),
    "A Norman & British town of the medieval era, in a realistic world, across all of Britain, inland, of any tone, giving the whole settlement in standard detail, with placeholders for people and places.",
  );
  const arabic = [["culture", "arabic-persian"], ["size", "city"], ["position", "coast"], ["people", "invented"], ["detail", "full"]].reduce((s, [f, id]) => chooseKit(s, f as never, id), DEFAULT_KIT_STATE);
  assert.equal(
    kitSentenceText(kitSentence(arabic)),
    "An Arabic & Persian city of the medieval era, in a realistic world, on the coast, of any tone, giving the whole settlement in full detail, with invented people and places.",
  );
  const station = chooseKit(chooseKit(DEFAULT_KIT_STATE, "era", "IS"), "position", "crossroads");
  assert.ok(kitSentenceText(kitSentence(station)).includes(" colony of the interstellar era, in a "), kitSentenceText(kitSentence(station)));
  assert.ok(kitSentenceText(kitSentence(station)).includes(", on a station, "));
});

test("§1: the module closes the urban group; history label and section", () => {
  assert.equal(SECTION_GROUPS.urban.at(-1), "settlementKit");
  const label = kitHistoryLabel("Fenwick", DEFAULT_KIT_STATE);
  assert.equal(label, "settlement kit · Fenwick · town · medieval · Norman & British");
  assert.equal(historySection(label), "settlementKit");
});

test("§13.7: Create note never overwrites", () => {
  const taken = new Set(["Settlements/Fenwick.md", "Settlements/Fenwick 2.md"]);
  assert.equal(freeNotePath("Settlements/", "Fenwick", (p) => taken.has(p)), "Settlements/Fenwick 3.md");
  assert.equal(freeNotePath("Settlements", "Ashby", (p) => taken.has(p)), "Settlements/Ashby.md");
});

test("§13.7: the note's frontmatter round-trips through Regenerate to the same kit", () => {
  for (const o of [
    { culture: "norman-british", position: "river" as const, people: "invented" as const, seed: 482913 },
    { culture: "japanese", era: "EM" as RouteEra, size: "city" as const, detail: "full" as const, seed: 77 },
    { culture: "norman-british", region: "SBL", era: "EM" as RouteEra, position: "crossroads" as const, contents: "places" as const, seed: 5 },
  ]) {
    const kit = generateKit(o);
    const note = kitNoteContent(kit);
    assert.ok(note.startsWith("---\ntype: settlement\n"), note);
    assert.ok(note.includes(`\nseed: ${kit.options.seed}\n`) && note.endsWith(kitMarkdown(kit)));
    const { settings, problems } = parseKitNote(note);
    assert.deepEqual(problems, []);
    const again = generateKit({ ...settings!, region: settings!.region === "all" ? undefined : settings!.region });
    assert.equal(kitMarkdown(again), kitMarkdown(kit));
  }
  assert.deepEqual(parseKitNote("---\ntype: vocabulary\n---\n").problems, ["This note isn't a settlement."]);
});

test("§1.2: each kit's block is kept in history and read back", () => {
  const kit = generateKit({ culture: "norman-british", seed: 9 });
  const block = kitMarkdown(kit);
  const section = kitHistorySection([
    { timestamp: "20261011-120000", seed: 9, block },
    { timestamp: "20261011-110000", seed: 4 },
  ]);
  assert.ok(!/\n## /.test(section.replace("\n## Settlement Kit History", "")), section);
  const read = parseKitHistory(`## Generation History\n\n- x\n${section}\n## Ageing History\n`);
  assert.equal(read.get("20261011-120000 | 9"), block);
  assert.equal(read.size, 1);
});

test("§13.7: presets round-trip", () => {
  const preset: KitPreset = {
    packName: "Border market town",
    setting: "",
    description: "A Norman & British town of the early modern era, in a realistic world, in the Scottish Borderlands, at a crossroads, of any tone, giving the whole settlement in standard detail, with invented people and places.",
    culture: "norman-british",
    region: "SBL",
    era: "EM",
    fantastic: false,
    size: "town",
    position: "crossroads",
    tone: "any",
    contents: "whole",
    detail: "standard",
    people: "invented",
  };
  const content = modulePresetContent(preset);
  assert.ok(content.includes("module: settlement-kit\n") && content.includes("position: crossroads\n") && content.includes("detail: standard\n"));
  const parsed = parseModulePreset(content, "x");
  assert.deepEqual(parsed.kit, preset);
  assert.deepEqual(parsed.problems, []);
  const state = [["era", "EM"], ["region", "SBL"], ["position", "crossroads"], ["people", "invented"]].reduce((s, [f, id]) => chooseKit(s, f as never, id), DEFAULT_KIT_STATE);
  assert.equal(kitSentenceText(kitSentence(state)), preset.description);
  const bad = parseModulePreset(modulePresetContent({ ...preset, size: "hamlet" as never, detail: "huge" as never }), "x");
  assert.equal(bad.kit?.size, "town");
  assert.deepEqual(bad.problems, ["Unknown size “hamlet”.", "Unknown detail “huge”."]);
});

// ── Events brief §10: the History section ───────────────────────────────────

test("Events §10: History follows Groups with §5.1-style counts; a history of 3 or more opens with the founding", () => {
  const counts = { village: 2, town: 3, city: 4, great: 5 } as const;
  for (const size of KIT_SIZES) {
    for (let seed = 1; seed <= 6; seed++) {
      const kit = generateKit({ culture: "norman-british", size, position: "coast", people: seed % 2 ? "invented" : "placeholders", seed });
      const history = section(kit, "history")!;
      const where = `${size} ${seed}: ${kitMarkdown(kit)}`;
      assert.equal(sectionCount("history", size, "standard"), counts[size]);
      assert.equal(history.entries.length, counts[size], where);
      const keys = kit.sections.map((s) => s.key);
      assert.equal(keys.indexOf("history"), keys.indexOf("neighbours") + 1, where);
      assert.equal(keys.indexOf("neighbours"), keys.indexOf("groups") + 1, where);
      if (counts[size] >= 3) assert.equal(history.entries[0].text, `Founding of ${kit.context.town}`, where);
    }
  }
  assert.ok(texts(generateKit({ culture: "japanese", size: "great", detail: "full", seed: 2 }), "history").length === 8);
});

test("Events §10: rerolling History redoes only History", () => {
  const kit = generateKit({ culture: "norman-british", size: "city", people: "invented", seed: 4 });
  const { kit: next, note } = rerollKit(kit, "history");
  assert.equal(note, undefined);
  assert.notDeepEqual(texts(next, "history"), texts(kit, "history"));
  for (const s of kit.sections) if (s.key !== "history") assert.deepEqual(texts(next, s.key), texts(kit, s.key), s.key);
});

// ── Monuments brief §12: the Monuments section ──────────────────────────────

test("Monuments §12.1: counts 1, 2, 3, 4 by size (brief ×0.5, full ×1.5, rounded up); the section follows Buildings and not 'people only'", () => {
  assert.deepEqual(KIT_SIZES.map((size) => sectionCount("monuments", size, "standard")), [1, 2, 3, 4]);
  assert.deepEqual(KIT_SIZES.map((size) => sectionCount("monuments", size, "brief")), [1, 1, 2, 2]);
  assert.deepEqual(KIT_SIZES.map((size) => sectionCount("monuments", size, "full")), [2, 3, 5, 6]);
  assert.deepEqual(KIT_DATA.sections.filter((s) => ["buildings", "monuments", "groups"].includes(s.key)).map((s) => s.key), ["buildings", "monuments", "groups"]);
  assert.equal(KIT_DATA.sections.find((s) => s.key === "monuments")!.title, "Monuments");
  assert.ok(sectionsFor("whole", "inland", "MD").includes("monuments") && sectionsFor("places", "inland", "MD").includes("monuments"));
  assert.ok(!sectionsFor("people", "inland", "MD").includes("monuments"));
  for (const size of KIT_SIZES) {
    const kit = generateKit({ culture: "norman-british", era: "ST", size, people: "invented", seed: 4 });
    assert.equal(texts(kit, "monuments").length, sectionCount("monuments", size, "standard"), size);
    const keys = kit.sections.map((s) => s.key);
    assert.equal(keys[keys.indexOf("buildings") + 1], "monuments");
    assert.ok(kitMarkdown(kit).includes("### Buildings and landmarks"));
    const md = kitMarkdown(kit).split("\n").filter((l) => l.startsWith("### "));
    assert.equal(md[md.indexOf("### Buildings and landmarks") + 1], "### Monuments");
  }
  assert.equal(generateKit({ culture: "norman-british", contents: "people", seed: 2 }).sections.some((s) => s.key === "monuments"), false);
});

test("Monuments §12.1: Monuments takes sub-seed step 12 and every other section keeps its sub-seed (Roads, Groups and History as before)", () => {
  const before = JSON.parse(readFileSync("tests/fixtures/kit-before-monuments.json", "utf8")) as Record<string, { roads: string[]; groups: string[]; history: string[] }>;
  let checked = 0;
  for (const [culture, size] of [["norman-british", "town"], ["norman-british", "village"], ["chinese", "city"], ["japanese", "great"]] as const) {
    for (const seed of [1, 2, 3]) {
      const kit = generateKit({ culture, size, seed });
      const saved = before[`kit ${culture} ${size} ${seed}`];
      assert.deepEqual(texts(kit, "roads"), saved.roads, `${culture} ${size} ${seed} roads`);
      assert.deepEqual(texts(kit, "groups"), saved.groups, `${culture} ${size} ${seed} groups`);
      assert.deepEqual(texts(kit, "history"), saved.history, `${culture} ${size} ${seed} history`);
      checked++;
    }
  }
  assert.equal(checked, 12);
});

test("Monuments §12.2: a town kit has 2 monuments, as one town, passing the safeguards; its landmarks include them (3 words or fewer, without \"the\")", () => {
  const block = monumentBlockSet();
  for (let seed = 1; seed <= 25; seed++) {
    const kit = generateKit({ culture: "norman-british", era: seed % 2 ? "ST" : "MD", size: "town", people: "invented", seed });
    const monuments = texts(kit, "monuments");
    assert.equal(monuments.length, 2, `${seed}: ${monuments.join(", ")}`);
    assert.deepEqual(kit.context.monuments.map((m) => m.text), monuments);
    for (const m of kit.context.monuments) {
      assert.ok(m.site.length > 0 && typeof m.districtWorthy === "boolean");
      assert.ok(!block.has(routeNorm(m.text).replace(/^the /, "")), m.text);
      const bare = m.text.replace(/^the /, "");
      if (bare.split(" ").length <= 3) assert.ok(kit.context.landmarks.includes(bare), `${seed}: ${bare}`);
    }
    for (const l of kit.context.landmarks) assert.ok(l.split(" ").length <= 3 && !/^the /.test(l), l);
    const all = kit.sections.flatMap((s) => s.entries.map((e) => e.text)).filter((t) => !BOTH(kit, t));
    const keys = all.map((t) => t.toLowerCase().replace(/^the /, ""));
    assert.equal(new Set(keys).size, keys.length, kitMarkdown(kit));
  }
});

test("Monuments §12.2: inside a kit, districts, streets and squares take monument sites only from the context", () => {
  let used = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const kit = generateKit({ culture: "norman-british", era: "ST", size: "city", people: "invented", seed });
    const ctx = kit.context;
    const sites = ctx.monuments.map((m) => m.site);
    for (const [kind, shape] of [["streets", "{monumentSite} {sw}"], ["squares", "{monumentSite} {jw}"], ["districts", "{monumentSite}"], ["districts", "{monumentSite} {dw}"]] as const) {
      for (const n of generateStreetNames({ culture: "norman-british", era: "ST", kind, size: "city", people: "invented", shape, count: 3, seed, context: ctx }).names) {
        const site = n.words.find((w) => w.pool === "monumentSite")?.word;
        assert.ok(site && sites.includes(site), `${n.text}: ${site} not in ${sites.join(", ")}`);
        if (shape === "{monumentSite}") assert.ok(ctx.monuments.some((m) => m.site === site && m.districtWorthy), n.text);
        used++;
      }
    }
    // {landmark} is one of the settlement's own landmarks, monuments included.
    for (const n of generateStreetNames({ culture: "norman-british", era: "ST", kind: "streets", people: "invented", shape: "{landmark} {sw}", count: 3, seed, context: ctx }).names) {
      assert.ok(ctx.landmarks.some((l) => n.plain.startsWith(`${l} `)), n.text);
    }
  }
  assert.ok(used > 50, `${used}`);
});

test("Monuments §12.3: Monuments redoes Monuments, Districts, Streets, Squares and Inns; Buildings still redoes Buildings, Streets and Inns", () => {
  assert.deepEqual(rerollTargets("monuments"), ["monuments", "districts", "streets", "squares", "inns"]);
  assert.deepEqual(rerollTargets("buildings"), ["buildings", "streets", "inns"]);
  for (let seed = 1; seed <= 10; seed++) {
    const kit = generateKit({ culture: "norman-british", era: "ST", size: "city", people: "invented", position: "river", seed });
    const { kit: next, note } = rerollKit(kit, "monuments");
    assert.equal(note, "Districts, streets, squares and inns were redone to match.");
    assert.notDeepEqual(texts(next, "monuments"), texts(kit, "monuments"), `${seed}`);
    for (const key of ["roads", "buildings", "groups", "history", "ships"] as KitSectionKey[]) assert.deepEqual(texts(next, key), texts(kit, key), `${seed} ${key}`);
    assert.deepEqual(next.context.monuments.map((m) => m.text), texts(next, "monuments"));
    assert.equal(next.context.town, kit.context.town);
    const b = rerollKit(kit, "buildings");
    assert.deepEqual(texts(b.kit, "monuments"), texts(kit, "monuments"), `${seed}`);
    assert.deepEqual(texts(b.kit, "districts"), texts(kit, "districts"), `${seed}`);
    assert.deepEqual(texts(b.kit, "squares"), texts(kit, "squares"), `${seed}`);
    assert.deepEqual(b.kit.context.monuments, kit.context.monuments);
    // The landmarks are the new buildings' plus the kept monuments'.
    for (const m of kit.context.monuments) {
      const bare = m.text.replace(/^the /, "");
      if (bare.split(" ").length <= 3) assert.ok(b.kit.context.landmarks.includes(bare), bare);
    }
  }
});

test("Monuments §12.3: at a crossroads, crosses and standing stones are ×1.5; the kit's setting reaches the monuments", () => {
  const eff = KIT_POSITIONS.find((p) => p.key === "crossroads")!.effects;
  assert.deepEqual(eff.monumentKindX, { cross: 1.5, stone: 1.5 });
  assert.deepEqual(eff.buildingKindX, { crossing: 1.5 });
  assert.ok(!("monument" in (eff.buildingKindX ?? {})));
  // The effect scales the kind weights the monuments engine draws from.
  const at = (x?: Record<string, number>) => {
    const ctx = { ...ctxFor("norman-british", "MD", "invented", 3), effects: x ? { monumentKindX: x } : undefined };
    let n = 0;
    for (let seed = 1; seed <= 120; seed++) n += generateMonumentNames({ culture: "norman-british", era: "MD", people: "invented", count: 6, seed, context: ctx }).names.filter((m) => m.kind === "cross" || m.kind === "stone").length;
    return n;
  };
  assert.ok(at({ cross: 1.5, stone: 1.5 }) > at());
});
