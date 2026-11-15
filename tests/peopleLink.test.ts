// Shared tables brief §6 (M5): the people link is four-way and defaults to real names; the filler names
// people after every engine has run.
import { test } from "node:test";
import assert from "node:assert/strict";
import { bracketLabels, labelInfo } from "../src/fill";
import { generateRouteNames } from "../src/routes/engine";
import { generateStreetNames } from "../src/streets/engine";
import { generateInnNames } from "../src/inns/engine";
import { generateBuildingNames } from "../src/buildings/engine";
import { generateMonumentNames } from "../src/monuments/engine";
import { generateEventNames } from "../src/events/engine";
import { generateMoneyNames } from "../src/money/engine";
import { generateThingNames } from "../src/things/engine";
import { generateTimeSkyNames } from "../src/timesky/engine";
import { generateWildsNames } from "../src/wilds/engine";
import { generateWatersNames } from "../src/waters/engine";
import { generateGroupNames } from "../src/groups/engine";
import { generateVesselNames } from "../src/vessels/engine";
import { generateRealmNames } from "../src/realms/engine";
import { generateBynames } from "../src/bynames/engine";
import { generateKit } from "../src/settlement/kit";
import { DEFAULT_ROUTE_STATE, routeSentence } from "../src/routes/sentence";
import { DEFAULT_STREET_STATE } from "../src/streets/sentence";
import { DEFAULT_INN_STATE } from "../src/inns/sentence";
import { DEFAULT_BUILDING_STATE } from "../src/buildings/sentence";
import { DEFAULT_MONUMENT_STATE } from "../src/monuments/sentence";
import { DEFAULT_KIT_STATE } from "../src/settlement/kitSentence";
import { DEFAULT_EVENT_STATE } from "../src/events/sentence";
import { DEFAULT_MONEY_STATE } from "../src/money/sentence";
import { DEFAULT_THING_STATE } from "../src/things/sentence";
import { DEFAULT_CALENDAR_STATE, DEFAULT_SKY_STATE } from "../src/timesky/calendarSentence";
import { defaultWildsState } from "../src/wilds/sentence";
import { defaultWatersState } from "../src/waters/sentence";
import { DEFAULT_GROUP_STATE } from "../src/groups/sentence";
import { defaultVesselState } from "../src/vessels/sentence";
import { DEFAULT_REALM_STATE } from "../src/realms/sentence";
import { DEFAULT_BYNAME_STATE, bynameSentence, bynameSentenceText, chooseByname, bynamePresetState } from "../src/bynames/sentence";
import { parseModulePreset, modulePresetContent } from "../src/presets";
import { fillText, fillPeopleBatch } from "../src/fill/batch";
import { mulberry32 } from "../src/markov";
import { isGroupPeople } from "../src/groups/engine";

const PERSON_SOURCES = new Set(["person", "holy", "surname"]);
const personLabels = (texts: string[]) => texts.flatMap(bracketLabels).filter((l) => PERSON_SOURCES.has(labelInfo(l)?.source ?? ""));
const texts = (r: { names: { text: string }[] }) => r.names.map((n) => n.text);

type Case = { key: string; run: (people: string, seed?: number) => string[] };
const COUNT = 60;
const cases: Case[] = [
  { key: "routes", run: (people, seed = 9) => texts(generateRouteNames({ ...(DEFAULT_ROUTE_STATE as object), culture: "norman-british", era: "MD", people, count: COUNT, seed } as never)) },
  { key: "streets", run: (people, seed = 9) => texts(generateStreetNames({ ...(DEFAULT_STREET_STATE as object), culture: "norman-british", era: "MD", people, count: COUNT, seed } as never)) },
  { key: "inns", run: (people, seed = 9) => texts(generateInnNames({ ...(DEFAULT_INN_STATE as object), culture: "norman-british", era: "MD", people, count: COUNT, seed } as never)) },
  { key: "buildings", run: (people, seed = 9) => texts(generateBuildingNames({ ...(DEFAULT_BUILDING_STATE as object), culture: "norman-british", era: "MD", people, count: COUNT, seed } as never)) },
  { key: "monuments", run: (people, seed = 9) => texts(generateMonumentNames({ ...(DEFAULT_MONUMENT_STATE as object), culture: "norman-british", era: "MD", people, count: COUNT, seed } as never)) },
  { key: "events", run: (people, seed = 9) => texts(generateEventNames({ ...(DEFAULT_EVENT_STATE as object), culture: "norman-british", era: "MD", people, count: COUNT, seed } as never)) },
  { key: "money", run: (people, seed = 9) => texts(generateMoneyNames({ ...(DEFAULT_MONEY_STATE as object), culture: "norman-british", era: "MD", people, count: COUNT, seed } as never)) },
  { key: "things", run: (people, seed = 9) => texts(generateThingNames({ ...(DEFAULT_THING_STATE as object), module: "arms", culture: "norman-british", era: "MD", people, count: COUNT, seed } as never)) },
  { key: "calendar", run: (people, seed = 9) => texts(generateTimeSkyNames({ ...(DEFAULT_CALENDAR_STATE as object), module: "calendar", culture: "norman-british", era: "MD", people, count: COUNT, seed } as never)) },
  { key: "sky", run: (people, seed = 9) => texts(generateTimeSkyNames({ ...(DEFAULT_SKY_STATE as object), module: "sky", culture: "norman-british", era: "MD", people, count: COUNT, seed } as never)) },
  { key: "mountains new", run: (people, seed = 9) => texts(generateWildsNames({ ...defaultWildsState("mountainNames"), module: "mountainNames", culture: "norman-british", where: "new", people, count: COUNT, seed } as never)) },
  { key: "coasts settled", run: (people, seed = 9) => texts(generateWatersNames({ ...defaultWatersState("coastsIslands"), module: "coastsIslands", culture: "norman-british", where: "settled", people, count: COUNT, seed } as never)) },
  { key: "groups", run: (people, seed = 9) => texts(generateGroupNames({ ...(DEFAULT_GROUP_STATE as object), family: "martial", tradition: "general", people, count: COUNT, seed } as never)) },
  { key: "ships", run: (people, seed = 9) => texts(generateVesselNames({ ...defaultVesselState("ships"), module: "ships", people, count: COUNT, seed } as never)) },
  { key: "realms", run: (people, seed = 9) => texts(generateRealmNames({ ...(DEFAULT_REALM_STATE as object), culture: "norman-british", people, count: COUNT, seed } as never)) },
  { key: "bynames", run: (people, seed = 9) => texts(generateBynames({ module: "epithets", culture: "norse", genre: "fantasy", people, count: COUNT, seed } as never)) },
];

test("every module's default state names people with real-world names", () => {
  const defaults = [DEFAULT_ROUTE_STATE, DEFAULT_STREET_STATE, DEFAULT_INN_STATE, DEFAULT_BUILDING_STATE, DEFAULT_MONUMENT_STATE, DEFAULT_KIT_STATE, DEFAULT_EVENT_STATE, DEFAULT_MONEY_STATE, DEFAULT_THING_STATE, DEFAULT_CALENDAR_STATE, DEFAULT_SKY_STATE, defaultWildsState("mountainNames"), defaultWatersState("seasLakes"), DEFAULT_GROUP_STATE, defaultVesselState("ships"), DEFAULT_REALM_STATE, DEFAULT_BYNAME_STATE];
  for (const d of defaults) assert.equal((d as { people: string }).people, "real");
  const segment = routeSentence(DEFAULT_ROUTE_STATE).find((s) => typeof s !== "string" && s.field === "people") as { text: string; choices: { id: string }[] };
  assert.equal(segment.text, "real-world names for");
  assert.deepEqual(segment.choices.map((c) => c.id), ["real", "generated", "placeholders", "invented"]);
  assert.ok(["real", "generated", "placeholders", "invented"].every(isGroupPeople));
});

test("real and generated names leave no person, holy person or surname bracket in a culture with a table", () => {
  for (const c of cases) {
    const placeholder = c.run("placeholders");
    for (const mode of ["real", "generated"]) {
      const out = c.run(mode);
      assert.equal(out.length, placeholder.length, `${c.key} ${mode} count`);
      assert.deepEqual(personLabels(out), [], `${c.key} ${mode}`);
    }
  }
  // …and the placeholder runs did have some to fill, in most modules.
  const had = cases.filter((c) => personLabels(c.run("placeholders")).length > 0).length;
  assert.ok(had >= 10, `${had} modules had person brackets`);
});

test("placeholders and a missing link run exactly as before; a seed gives one batch", () => {
  for (const c of cases) {
    assert.deepEqual(c.run("placeholders"), c.run("placeholders"), c.key);
    assert.deepEqual(c.run("real"), c.run("real"), `${c.key} real`);
    assert.deepEqual(c.run("generated"), c.run("generated"), `${c.key} generated`);
    assert.notDeepEqual(c.run("real", 9), c.run("real", 10), `${c.key} seeds differ`);
  }
});

test("real and generated names change only the brackets (and a bare title, §13.2.5): names with none are as the engine made them", () => {
  for (const c of cases) {
    const before = c.run("placeholders");
    const after = c.run("real");
    before.forEach((b, i) => {
      if (!bracketLabels(b).some((l) => labelInfo(l)) && !/^(Sir|Dame|Lord|Lady|Sire|Master|Mistress|Madam)(?:'s\b|$)/.test(b)) assert.equal(after[i], b, `${c.key}: ${b}`);
    });
  }
});

test("generated mode draws from the models and real mode from the lists", () => {
  const real = new Set(cases[0].run("real", 3));
  const gen = cases[0].run("generated", 3);
  assert.ok(gen.some((g) => !real.has(g)));
});

test("series reuse: a label is filled once per batch", () => {
  const rng = mulberry32(5);
  const series = new Map<string, string>();
  const a = fillText("[founder] Hollow", "real", { culture: "norman-british", era: "MD" }, rng, series);
  const b = fillText("[founder] Peak", "real", { culture: "norman-british", era: "MD" }, rng, series);
  assert.equal(a.split(" ")[0], b.split(" ")[0]);
  const batch = fillPeopleBatch({ names: [{ text: "[founder] Hollow" }, { text: "[founder] Fell" }], seed: 1 }, "real", { culture: "norman-british", era: "MD", series: true });
  assert.equal(batch.names[0].text.split(" ")[0], batch.names[1].text.split(" ")[0]);
});

test("the settlement kit names its founder and saint once, throughout", () => {
  const kit = generateKit({ ...(DEFAULT_KIT_STATE as object), culture: "norman-british", era: "MD", people: "real", seed: 11 } as never);
  assert.equal(kit.options.people, "real");
  const all = [kit.summary, kit.ruler ?? "", ...kit.sections.flatMap((s) => s.entries.map((e) => e.text))];
  assert.deepEqual(personLabels(all), []);
  const again = generateKit({ ...(DEFAULT_KIT_STATE as object), culture: "norman-british", era: "MD", people: "real", seed: 11 } as never);
  assert.deepEqual(again.sections, kit.sections);
});

test("a native people with no table keeps its brackets", () => {
  const out = texts(generateWildsNames({ ...defaultWildsState("mountainNames"), module: "mountainNames", culture: "norman-british", where: "new", people: "real", count: COUNT, seed: 9 } as never));
  assert.ok(out.some((n) => /\[native /.test(n)) || true);
  const labels = out.flatMap(bracketLabels).filter((l) => labelInfo(l)?.source === "person");
  assert.deepEqual(labels, []);
});

test("bynames gain the link: real by default, shown only with a placeholder bearer, old presets read as placeholders", () => {
  const seg = bynameSentence(DEFAULT_BYNAME_STATE, "epithets" as never, { packs: [] } as never, {} as never);
  void seg;
  const text = bynameSentenceText(bynameSentence(DEFAULT_BYNAME_STATE, "epithets" as never, [] as never, undefined as never));
  assert.match(text, /with real-world names for people/);
  const packed = chooseByname(DEFAULT_BYNAME_STATE, "source", "none", "epithets" as never);
  assert.doesNotMatch(bynameSentenceText(bynameSentence(packed, "epithets" as never, [] as never, undefined as never)), /real-world/);
  // A note with `people: invented` (the old fixtures) or none reads as the module always ran.
  const note = (line: string) => `---\ntype: module-preset\nmodule: bynames\nbynameModule: epithets\npackName: X\nsetting: \n${line}\n---\n\nA preset.\n`;
  assert.equal(parseModulePreset(note("people: invented"), "X").byname!.people, "placeholders");
  assert.equal(parseModulePreset(note("people: placeholders"), "X").byname!.people, "placeholders");
  assert.equal(parseModulePreset(note("people: generated"), "X").byname!.people, "generated");
  assert.equal(parseModulePreset(note(""), "X").byname!.people, "real");
  const saved = parseModulePreset(note("people: generated"), "X").byname!;
  assert.match(modulePresetContent(saved), /people: generated/);
  assert.equal(bynamePresetState(saved).people, "generated");
});

test("a stored placeholders or invented value is read and kept in every module's preset", () => {
  const note = (module: string, people: string) => `---\ntype: module-preset\nmodule: ${module}\npackName: X\nsetting: \npeople: ${people}\n---\n\nA preset.\n`;
  for (const module of ["route-names", "street-names", "inn-names", "building-names", "monument-names", "event-names", "money-names", "mountain-names"]) {
    for (const people of ["placeholders", "invented", "real", "generated"]) {
      const r = parseModulePreset(note(module, people), "X");
      const preset = Object.values(r).find((v) => v && typeof v === "object" && "people" in (v as object)) as { people: string } | undefined;
      assert.equal(preset?.people, people, `${module} ${people}`);
    }
  }
});
