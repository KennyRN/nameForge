// Place modules split brief §6, M2: every kind of the wild lands and the seas and coasts modules carries a
// class (natural, managed or constructed), and a class link narrows an "any kind" draw to one class.
// With no class, nothing changes: output, states, presets and history are exactly as before.
import { test } from "node:test";
import assert from "node:assert/strict";
import { classesOffered, CLASS_TEXT, isPlaceClass, showsClassLink, type PlaceClass } from "../src/places/classes";
import { parseModulePreset, modulePresetContent, type WatersPreset, type WildsPreset } from "../src/presets";
import { generateWatersNames, WATERS_DATA, waterKinds, type WatersModule } from "../src/waters/engine";
import { chooseWaters, defaultWatersState, watersHistoryLabel, watersSentence, watersSentenceText } from "../src/waters/sentence";
import { generateWildsNames, WILDS_DATA, WILDS_MODULES, wildsKinds, type WildsModule } from "../src/wilds/engine";
import { chooseWilds, defaultWildsState, wildsHistoryLabel, wildsSentence, wildsSentenceText } from "../src/wilds/sentence";
import { probeModule, probeSpecs } from "./fixtures/lensOffersProbe";

// §6's table, word for word.
const TABLE: Record<string, Record<PlaceClass, string>> = {
  mountainNames: { natural: "range peak ridge pass gorge valley stream river tarn ice cave", managed: "", constructed: "settlement" },
  forestNames: { natural: "forest grove stream river pool tree", managed: "clearing ride walk", constructed: "settlement" },
  desertNames: { natural: "desert dune plain rock canyon oasis lake", managed: "", constructed: "route landmark settlement" },
  moorNames: { natural: "moor hill bog clough stream pool", managed: "", constructed: "stone track settlement" },
  wetlandNames: { natural: "marsh bog swamp reed water isle delta", managed: "channel", constructed: "causeway settlement" },
  grasslandNames: { natural: "plain down heath vale stream lake", managed: "meadow", constructed: "track landmark settlement" },
  // Place modules split brief §5.4: the rivers and inland waters kinds, with the classes the brief gives them.
  riversInland: { natural: "river stream spring pool lake falls riverland", managed: "", constructed: "cut" },
  // §5.1, §5.3 and §5.2.
  lands: { natural: "country", managed: "shire march province parish folk", constructed: "" },
  hillsValleys: { natural: "hill ridge valley combe ravine", managed: "terrace", constructed: "settlement" },
  farmland: { natural: "", managed: "field enclosure common", constructed: "farm moot works settlement" },
  // §5.5: stars and space.
  starsSpace: { natural: "world orbit star nebula expanse", managed: "", constructed: "station" },
  seasLakes: { natural: "ocean sea bay inlet strait lake", managed: "", constructed: "" },
  coastsIslands: { natural: "headland cliff beach cove island coast", managed: "", constructed: "" },
  seaCharts: { natural: "bank reef deep race channel", managed: "roads", constructed: "" },
};
const kindsOf = (module: string) => (([...WILDS_MODULES, "riversInland", "hillsValleys", "farmland", "lands", "starsSpace"] as readonly string[]).includes(module) ? wildsKinds(module as WildsModule) : waterKinds(module as never));
const sorted = (s: string) => s.split(" ").filter(Boolean).sort();

test("data: every kind of the nine modules has the class §6 gives it", () => {
  for (const [module, row] of Object.entries(TABLE)) {
    const kinds = kindsOf(module);
    for (const kindClass of ["natural", "managed", "constructed"] as const) {
      assert.deepEqual(kinds.filter((k) => k.class === kindClass).map((k) => k.key).sort(), sorted(row[kindClass]), `${module} ${kindClass}`);
    }
    assert.ok(kinds.every((k) => isPlaceClass(k.class)), `${module}: every kind has a class`);
  }
});

test("data: the class (and, from M7, the sources of §8.1) are the only changes to a kind (the table's other fields are as before)", () => {
  const plain = (k: object) => Object.keys(k).filter((f) => f !== "sources").sort();
  for (const module of WILDS_MODULES) for (const k of WILDS_DATA.modules[module].kinds) assert.deepEqual(plain(k), ["class", "key", "menu", "plural", "weight"]);
  for (const module of ["seasLakes", "coastsIslands", "seaCharts"] as const) for (const k of WATERS_DATA.modules[module].kinds) assert.deepEqual(plain(k), ["class", "key", "menu", "plural", "weight"]);
});

// ── The probe records the classes a module offers ───────────────────────────

test("probe: which classes each module offers, hand-checked against §6", () => {
  const offers = Object.fromEntries(probeSpecs().filter((s) => s.key in TABLE).map((s) => [s.key, probeModule(s).classes]));
  assert.deepEqual(offers, {
    mountainNames: ["natural", "constructed"],
    forestNames: ["natural", "managed", "constructed"],
    desertNames: ["natural", "constructed"],
    moorNames: ["natural", "constructed"],
    wetlandNames: ["natural", "managed", "constructed"],
    grasslandNames: ["natural", "managed", "constructed"],
    riversInland: ["natural", "constructed"],
    lands: ["natural", "managed"],
    hillsValleys: ["natural", "managed", "constructed"],
    farmland: ["managed", "constructed"],
    starsSpace: ["natural", "constructed"],
    seasLakes: [],
    coastsIslands: [],
    seaCharts: ["natural", "managed"],
  });
  // The file the sentences read says the same.
  for (const [module, classes] of Object.entries(offers)) assert.deepEqual(classesOffered(module), classes, module);
  // Modules without classes record none.
  assert.ok(probeSpecs().filter((s) => !(s.key in TABLE)).every((s) => probeModule(s).classes === undefined));
});

// ── The link ────────────────────────────────────────────────────────────────

const segmentOf = (segments: unknown[], field: string) => segments.find((s) => typeof s === "object" && (s as { field: string }).field === field) as { text: string; choices: { id?: string; label: string }[]; current?: string } | undefined;

test("link: shows only where a module has kinds in at least two classes; seas and bays and coasts and islands have none", () => {
  for (const module of WILDS_MODULES) {
    assert.ok(showsClassLink(module), module);
    const link = segmentOf(wildsSentence(defaultWildsState(module), module), "kindClass")!;
    assert.deepEqual(link.choices.map((c) => c.label), ["all", ...classesOffered(module)]);
    assert.equal(link.text, "all");
  }
  assert.equal(segmentOf(watersSentence(defaultWatersState("seasLakes"), "seasLakes"), "kindClass"), undefined);
  assert.equal(segmentOf(watersSentence(defaultWatersState("coastsIslands"), "coastsIslands"), "kindClass"), undefined);
  assert.deepEqual(segmentOf(watersSentence(defaultWatersState("seaCharts"), "seaCharts"), "kindClass")!.choices.map((c) => c.label), ["all", "natural", "managed"]);
  assert.equal(segmentOf(watersSentence(defaultWatersState("hyperspaceCharts"), "hyperspaceCharts"), "kindClass"), undefined, "hyperspace charts are untouched");
});

test("sentence: the link sits before the kind link; modules without one read as before", () => {
  assert.equal(
    wildsSentenceText(wildsSentence(defaultWildsState("mountainNames"), "mountainNames")),
    "Norman & British all mountain features of any kind of the medieval era, in home country, in a historic or low fantasy world, across all of Britain, of any tone, with placeholders for people and places, each one separate.",
  );
  assert.equal(
    watersSentenceText(watersSentence(defaultWatersState("seaCharts"), "seaCharts")),
    "Norman & British all chart features of any kind of the medieval era, on home shores, in a historic or low fantasy world, across all of Britain, of any tone, with placeholders for people and places, each one separate.",
  );
  assert.equal(
    watersSentenceText(watersSentence(defaultWatersState("coastsIslands"), "coastsIslands")),
    "Norman & British coast features of any kind of the medieval era, on home shores, in a historic or low fantasy world, across all of Britain, of any tone, with placeholders for people and places, each one separate.",
  );
  const withClass = wildsSentence({ ...defaultWildsState("forestNames"), kindClass: "managed" }, "forestNames");
  assert.match(wildsSentenceText(withClass), /^Norman & British managed forest features of any kind of the medieval era/);
});

test("kind menu: keeps the kinds of the chosen class; a stored kind outside it is shown and kept", () => {
  const module: WildsModule = "wetlandNames";
  const menu = (state: ReturnType<typeof defaultWildsState>) => segmentOf(wildsSentence(state, module), "kind")!.choices.map((c) => c.id);
  assert.deepEqual(menu(defaultWildsState(module)), [undefined, ...wildsKinds(module).map((k) => k.key)]);
  assert.deepEqual(menu({ ...defaultWildsState(module), kindClass: "managed" }), [undefined, "channel"]);
  assert.deepEqual(menu({ ...defaultWildsState(module), kindClass: "constructed" }), [undefined, "causeway", "settlement"]);
  // Stored: a bog kind with the constructed class: shown (and the sentence names it) beside the class's kinds.
  const stored = { ...defaultWildsState(module), kindClass: "constructed" as const, kind: "bog" };
  assert.deepEqual(menu(stored), [undefined, "bog", "causeway", "settlement"], "in the module's own order");
  assert.equal(segmentOf(wildsSentence(stored, module), "kind")!.current, "bog");
  assert.match(wildsSentenceText(wildsSentence(stored, module)), /constructed bog/);
  // Waters: the same rule.
  const charts = (state: ReturnType<typeof defaultWatersState>) => segmentOf(watersSentence(state, "seaCharts"), "kind")!.choices.map((c) => c.id);
  assert.deepEqual(charts({ ...defaultWatersState("seaCharts"), kindClass: "managed" }), [undefined, "roads"]);
  assert.deepEqual(charts({ ...defaultWatersState("seaCharts"), kindClass: "managed", kind: "reef" }), [undefined, "reef", "roads"]);
});

test("choose: a class resets a kind outside it to Any; all leaves the kind and drops the key", () => {
  const module: WildsModule = "mountainNames";
  const start = { ...defaultWildsState(module), kind: "peak" };
  const constructed = chooseWilds(start, "kindClass", "constructed", module);
  assert.equal(constructed.kindClass, "constructed");
  assert.equal(constructed.kind, undefined);
  const natural = chooseWilds(start, "kindClass", "natural", module);
  assert.equal(natural.kind, "peak", "a kind inside the class stays");
  const all = chooseWilds(natural, "kindClass", undefined, module);
  assert.ok(!("kindClass" in all), "all is the absence of the key");
  assert.equal(all.kind, "peak");
  // Other choices leave the class alone.
  assert.equal(chooseWilds(constructed, "era", "ST", module).kindClass, "constructed");
  // Waters.
  const charts = chooseWaters({ ...defaultWatersState("seaCharts"), kind: "reef" }, "kindClass", "managed", "seaCharts");
  assert.equal(charts.kind, undefined);
  assert.equal(charts.kindClass, "managed");
  assert.ok(!("kindClass" in chooseWaters(charts, "kindClass", undefined, "seaCharts")));
  // A module that shows no link ignores a class it is given.
  assert.ok(!("kindClass" in chooseWaters(defaultWatersState("hyperspaceCharts"), "kindClass", "natural", "hyperspaceCharts")));
});

test("history: a class with no kind is named; every other label is as before", () => {
  const state = defaultWildsState("mountainNames");
  assert.equal(wildsHistoryLabel("mountainNames", state, "mountains"), "mountains · medieval · Norman & British");
  assert.equal(wildsHistoryLabel("mountainNames", { ...state, kindClass: "natural" }, "mountains"), "mountains · medieval · Norman & British · natural");
  assert.equal(wildsHistoryLabel("mountainNames", { ...state, kindClass: "natural", kind: "peak" }, "mountains"), "mountains · medieval · Norman & British · peaks and summits");
  assert.equal(watersHistoryLabel("seaCharts", { ...defaultWatersState("seaCharts"), kindClass: "managed" }, "sea charts"), "sea charts · medieval · Norman & British · managed");
});

// ── The draw ────────────────────────────────────────────────────────────────

const SEEDS = [1, 42, 2024];

test("draw: with no class the names are exactly as before (an explicit undefined too)", () => {
  for (const module of WILDS_MODULES) {
    for (const culture of ["norman-british", "general", "japanese"]) {
      for (const seed of SEEDS) {
        const plain = generateWildsNames({ module, culture, count: 12, seed });
        assert.deepEqual(generateWildsNames({ module, culture, kindClass: undefined, count: 12, seed }).names.map((n) => n.text), plain.names.map((n) => n.text), `${module} ${culture} ${seed}`);
      }
    }
  }
  for (const module of ["seasLakes", "coastsIslands", "seaCharts"] as WatersModule[]) {
    for (const seed of SEEDS) {
      const plain = generateWatersNames({ module, count: 12, seed }).names.map((n) => n.text);
      assert.deepEqual(generateWatersNames({ module, kindClass: undefined, count: 12, seed }).names.map((n) => n.text), plain, `${module} ${seed}`);
    }
  }
});

test("draw: with a class and kind Any, every name is of a kind in that class", () => {
  for (const module of WILDS_MODULES) {
    for (const kindClass of classesOffered(module)) {
      const inClass = new Set(wildsKinds(module).filter((k) => k.class === kindClass).map((k) => k.key));
      for (const seed of SEEDS) {
        const result = generateWildsNames({ module, kindClass, count: 12, seed });
        assert.ok(result.names.length > 0, `${module} ${kindClass} gave names`);
        for (const name of result.names) assert.ok(inClass.has(name.kind), `${module} ${kindClass}: “${name.text}” is a ${name.kind}`);
      }
    }
  }
  for (const [module, kindClass] of [["seaCharts", "managed"], ["seaCharts", "natural"]] as const) {
    const inClass = new Set(waterKinds(module).filter((k) => k.class === kindClass).map((k) => k.key));
    for (const seed of SEEDS) for (const name of generateWatersNames({ module, kindClass, count: 12, seed }).names) assert.ok(inClass.has(name.kind), `${module} ${kindClass}: “${name.text}” is a ${name.kind}`);
  }
});

test("draw: a class changes the draw only; a kind that is chosen wins over the class", () => {
  const stored = generateWildsNames({ module: "mountainNames", kind: "peak", kindClass: "constructed", count: 12, seed: 42 });
  const plain = generateWildsNames({ module: "mountainNames", kind: "peak", count: 12, seed: 42 });
  assert.deepEqual(stored.names.map((n) => n.text), plain.names.map((n) => n.text));
  assert.ok(stored.names.every((n) => n.kind === "peak"));
  const natural = generateWildsNames({ module: "mountainNames", kindClass: "natural", count: 12, seed: 42 }).names.map((n) => n.text);
  assert.notDeepEqual(natural, generateWildsNames({ module: "mountainNames", count: 12, seed: 42 }).names.map((n) => n.text));
});

// ── Presets ─────────────────────────────────────────────────────────────────

const WILDS_NOTE = ["---", "type: module-preset", "module: mountain-names", "packName: Old one", "setting: ", "culture: norman-british", "kind: peak", "era: MD", "where: home", "fantastic: false", "region: all", "biome: any", "tone: any", "people: placeholders", "series: false", "---", "", "Saved before classes.", ""].join("\n");

test("presets: one saved with no class is byte-identical to before and reads as before", () => {
  const parsed = parseModulePreset(WILDS_NOTE, "Old one");
  assert.deepEqual(parsed.problems, []);
  const wilds = parsed.wilds!;
  assert.ok(!("wildsClass" in wilds), "no class key on an old preset");
  assert.equal(modulePresetContent(wilds), WILDS_NOTE);
  assert.doesNotMatch(modulePresetContent(wilds), /\nclass:/);
});

test("presets: a class is written only when chosen, and reads back", () => {
  const wilds = parseModulePreset(WILDS_NOTE, "Old one").wilds!;
  const classed: WildsPreset = { ...wilds, wildsKind: "any", wildsClass: "natural" };
  const note = modulePresetContent(classed);
  assert.match(note, /\nkind: any\nclass: natural\nera: MD\n/);
  const back = parseModulePreset(note, "Old one");
  assert.deepEqual(back.problems, []);
  assert.equal(back.wilds!.wildsClass, "natural");
  assert.equal(modulePresetContent(back.wilds!), note);
  // Unknown classes are noted and ignored; "all" is no class.
  const odd = parseModulePreset(note.replace("class: natural", "class: wild"), "x");
  assert.deepEqual(odd.problems, ["Unknown class “wild”."]);
  assert.ok(!("wildsClass" in odd.wilds!));
  assert.ok(!("wildsClass" in parseModulePreset(note.replace("class: natural", "class: all"), "x").wilds!));
});

test("presets: seas and coasts the same, and hyperspace charts never write one", () => {
  const base = ["---", "type: module-preset", "module: waters", "watersModule: seaCharts", "packName: Chart", "setting: ", "culture: norman-british", "kind: any", "era: MD", "where: home", "fantastic: false", "region: all", "biome: any", "tone: any", "people: placeholders", "series: false", "---", "", "Old.", ""].join("\n");
  const old = parseModulePreset(base, "Chart").waters!;
  assert.ok(!("waterClass" in old));
  assert.equal(modulePresetContent(old), base);
  const classed: WatersPreset = { ...old, waterClass: "managed" };
  const note = modulePresetContent(classed);
  assert.match(note, /\nkind: any\nclass: managed\nera: MD\n/);
  assert.equal(parseModulePreset(note, "Chart").waters!.waterClass, "managed");
  const hyper = parseModulePreset(["---", "type: module-preset", "module: waters", "watersModule: hyperspaceCharts", "packName: H", "setting: ", "culture: general", "kind: any", "scale: any", "medium: sea", "register: any", "tone: any", "people: placeholders", "---", "", "", ""].join("\n"), "H").waters!;
  assert.doesNotMatch(modulePresetContent({ ...hyper, waterClass: "natural" }), /\nclass:/);
});

test("text: the class words", () => {
  assert.deepEqual(CLASS_TEXT, { all: "all", natural: "natural", managed: "managed", constructed: "constructed" });
});
