// Place modules split brief M4: hills and valleys, and farmland and countryside (§5.2, §5.3).
import { test } from "node:test";
import assert from "node:assert/strict";
import { COVERAGE_ADAPTERS } from "../src/coverage";
import coloniaData from "../src/data/colonial-shapes.json";
import lensOffers from "../src/data/lens-offers.json";
import placeShapes from "../src/data/place-shapes.json";
import placesData from "../src/data/places.json";
import { classesOffered } from "../src/places/classes";
import { settlementDelegateOptions } from "../src/places/sources";
import { modulePresetContent, parseModulePreset, wildsPresetKey } from "../src/presets";
import { historySection, PLACE_MODULE_SECTIONS, SECTION_GROUPS, SECTION_LABELS, SECTION_ORDER } from "../src/sections";
import { generateWildsNames, wildsKinds } from "../src/wilds/engine";
import { chooseWilds, defaultWildsState, wildsHistoryLabel, wildsSentence, wildsSentenceText } from "../src/wilds/sentence";

const H = "hillsValleys" as const;
const F = "farmland" as const;
type Choice = { id?: string; label: string };
const seg = (segments: unknown[], field: string) => segments.find((s) => typeof s === "object" && (s as { field: string }).field === field) as { text: string; choices: Choice[]; current?: string } | undefined;

// ── The line-up ─────────────────────────────────────────────────────────────

test("both modules are in the line-up, in the place names group in the brief's order, with their labels and history", () => {
  assert.equal(SECTION_LABELS[H], "hills and valleys");
  assert.equal(SECTION_LABELS[F], "farmland and countryside");
  assert.deepEqual(PLACE_MODULE_SECTIONS, ["lands", F, H, "riversInland"]);
  const group = SECTION_GROUPS.placeNames;
  assert.ok(group.indexOf(F) < group.indexOf(H) && group.indexOf(H) < group.indexOf("riversInland") && group.indexOf("riversInland") < group.indexOf("routeNames"), group.join(", "));
  assert.ok(SECTION_ORDER.indexOf(F) < SECTION_ORDER.indexOf(H) && SECTION_ORDER.indexOf(H) < SECTION_ORDER.indexOf("riversInland"));
  assert.equal(historySection("hills and valleys · medieval · Norman & British"), H);
  assert.equal(historySection("farmland and countryside · medieval · Norman & British"), F);
});

test("default sentences read as the other place modules' do, with the where, class and series words of the brief", () => {
  assert.equal(
    wildsSentenceText(wildsSentence(defaultWildsState(H), H)),
    "Norman & British all hill and valley features of any kind of the medieval era, in home country, in a historic or low fantasy world, across all of Britain, of any tone, with placeholders for people and places, each one separate.",
  );
  assert.equal(
    wildsSentenceText(wildsSentence(defaultWildsState(F), F)),
    "Norman & British all fields and farmland of any kind of the medieval era, in home country, in a historic or low fantasy world, across all of Britain, of any tone, with placeholders for people and places, each one separate.",
  );
  assert.equal(seg(wildsSentence({ ...defaultWildsState(H), series: true }, H), "series")!.text, "in one vale");
  assert.equal(seg(wildsSentence({ ...defaultWildsState(F), series: true }, F), "series")!.text, "on one estate");
  for (const m of [H, F]) assert.deepEqual(seg(wildsSentence(defaultWildsState(m), m), "where")!.choices.map((c) => c.label), ["in home country", "in newly explored country", "in settled lands"]);
});

// ── Kinds, classes, sources, shapes: the brief's tables ─────────────────────

test("hills and valleys: kinds, classes and native generics are §5.3's", () => {
  const kinds = wildsKinds(H);
  assert.deepEqual(kinds.map((k) => [k.key, k.class]), [["hill", "natural"], ["ridge", "natural"], ["valley", "natural"], ["combe", "natural"], ["ravine", "natural"], ["terrace", "managed"], ["settlement", "constructed"]]);
  const native = (k: string) => kinds.find((x) => x.key === k)!.sources!.native!.generics;
  assert.deepEqual(native("hill"), ["low-level-topped-hill", "hill", "knoll", "rounded-hill-mound", "summit-top", "wooded-hill"]);
  assert.deepEqual(native("ridge"), ["ridge", "back-low-ridge", "flat-topped-ridge", "heel-shaped-spur", "edge-escarpment", "steep-slope-bank", "slope", "upper-end-head"]);
  assert.deepEqual(native("valley"), ["long-valley", "dale", "broad-valley", "short-bowl-shaped-valley", "small-enclosed-side-valley", "shallow-damp-valley"]);
  assert.deepEqual(native("combe"), ["hollow", "valley-bottom", "valley-head", "nook", "corner-projecting-piece-of-land", "corner-angle", "bend-crook"]);
  assert.deepEqual(native("ravine"), ["ravine", "steep-bank-ravine-side", "river-cut-gorge"]);
  assert.deepEqual(native("terrace"), ["terrace-lynchet"]);
  // The three colonial groups of the brief are all used, each by the kinds whose generics it holds.
  const groups = new Set(kinds.flatMap((k) => k.sources?.colonial?.groups ?? []));
  assert.deepEqual([...groups].sort(), ["hills-and-slopes", "hollows-and-corners", "valleys"]);
  assert.deepEqual(classesOffered(H), ["natural", "managed", "constructed"]);
});

test("farmland: kinds, classes, native generics and colonial groups are §5.2's", () => {
  const kinds = wildsKinds(F);
  assert.deepEqual(kinds.map((k) => [k.key, k.class]), [["field", "managed"], ["enclosure", "managed"], ["farm", "constructed"], ["common", "managed"], ["moot", "constructed"], ["works", "constructed"], ["settlement", "constructed"]]);
  const native = (k: string) => kinds.find((x) => x.key === k)!.sources!.native!.generics;
  assert.deepEqual(native("field"), ["open-country", "level-field", "hay-meadow", "pasture", "arable-field", "arable-unit", "furlong"]);
  assert.deepEqual(native("enclosure"), ["animal-fold", "hedged-enclosure", "orchard", "small-enclosed-field-by-a-house"]);
  assert.deepEqual(native("farm"), ["enclosed-farmstead", "home-farm-of-an-estate", "outlying-grain-farm", "specialised-farm", "cattle-farm", "monastic-outlying-farm", "shieling-summer-pasture-hut"]);
  assert.deepEqual(native("common"), ["assembly-field", "place-for-games-or-sport"]);
  assert.deepEqual(native("moot"), ["assembly-mound", "speech-place", "meeting-place", "execution-site"]);
  assert.deepEqual(native("works"), ["mill", "kiln", "pit-quarry", "salt-works", "salt-house", "fish-weir"]);
  for (const k of kinds.filter((k) => k.key !== "settlement")) assert.deepEqual(k.sources!.colonial!.groups, ["open-and-farmed-land", "colonial-settlement"], k.key);
  assert.deepEqual(classesOffered(F), ["managed", "constructed"]);
});

test("the settlement kinds are delegated to settlement names with the brief's sizes, and have no shapes of their own", () => {
  assert.deepEqual(wildsKinds(F).find((k) => k.key === "settlement")!.sources, { delegate: { engine: "settlement", sizes: ["hamlet", "village"] } });
  assert.deepEqual(wildsKinds(H).find((k) => k.key === "settlement")!.sources!.delegate, { engine: "settlement", sizes: ["hamlet", "village", "town"] });
  for (const m of [H, F]) assert.equal((placesData.shapes as Record<string, Record<string, unknown>>)[m].settlement, undefined);
});

test("every generic and group the sources name exists in the retired engines' tables", () => {
  const ids = new Set<string>();
  const walk = (o: unknown) => {
    if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === "object") {
      const id = (o as { id?: unknown }).id;
      if (typeof id === "string") ids.add(id);
      Object.values(o).forEach(walk);
    }
  };
  walk(placeShapes);
  const groups = new Set((coloniaData.groups as { id: string }[]).map((g) => g.id));
  for (const m of [H, F]) {
    for (const k of wildsKinds(m)) {
      for (const g of k.sources?.native?.generics ?? []) assert.ok(ids.has(g), `${m}.${k.key}: generic ${g}`);
      for (const g of k.sources?.colonial?.groups ?? []) assert.ok(groups.has(g), `${m}.${k.key}: group ${g}`);
    }
  }
});

test("every non-delegated kind has at least six own shapes open to General (and unrestricted by era), in common English", () => {
  for (const m of [H, F]) {
    const shapes = (placesData.shapes as unknown as Record<string, Record<string, { p: string; c?: string[]; h?: boolean; e?: string[]; f: string }[]>>)[m];
    for (const kind of wildsKinds(m)) {
      if (kind.sources?.delegate) continue;
      const open = shapes[kind.key].filter((s) => !s.c && s.h === undefined && (s.f as string) !== "fixed");
      assert.ok(open.length >= 6, `${m}.${kind.key}: ${open.length} open shapes`);
      assert.ok(open.filter((s) => !s.e).length >= 6, `${m}.${kind.key}: ${open.filter((s) => !s.e).length} open shapes with no era limit`);
    }
  }
});

// ── Sources: shares, fallbacks, delegation ──────────────────────────────────

function sourcedShare(module: typeof H | typeof F, where: "home" | "new" | "settled", culture: string, kind: string): { sourced: number; total: number } {
  let sourced = 0;
  let total = 0;
  // One name per batch: a batch drops repeats, and the module's own placeholder shapes repeat far more than a source's names do.
  for (let seed = 1; seed <= 3000; seed++) {
    for (const n of generateWildsNames({ module, culture, kind, where, count: 1, seed }).names) {
      total++;
      if (n.shape === "source") sourced++;
    }
  }
  return { sourced, total };
}

for (const [module, kind] of [[H, "hill"], [F, "field"]] as const) {
  for (const [where, expected] of [["home", 0.4], ["new", 0.5], ["settled", 0.6]] as const) {
    test(`sources: ${module} ${kind}, ${where}: a British culture's names come from the source ${expected * 100}% of the time, within 3 points`, () => {
      const { sourced, total } = sourcedShare(module, where, "norman-british", kind);
      assert.ok(Math.abs(sourced / total - expected) <= 0.03, `${(100 * sourced / total).toFixed(1)}% of ${total}`);
    });
  }
}

test("sources: fallbacks. No source for a culture in this where means own shapes only", () => {
  for (const m of [H, F]) {
    const kind = m === H ? "hill" : "field";
    assert.equal(sourcedShare(m, "home", "chinese", kind).sourced, 0, "no native source for a non-British culture");
    assert.equal(sourcedShare(m, "new", "polynesian", kind).sourced, 0, "no colonial tradition for Polynesian");
  }
});

test("sources: the new cultures' traditions draw from the colonial source in new and settled lands", () => {
  for (const culture of ["iberian", "french", "dutch", "norse"]) {
    const { sourced } = sourcedShare(H, "settled", culture, "valley");
    assert.ok(sourced > 0, culture);
  }
});

test("delegation: the settlement kind goes to settlement names with the options the where gives", () => {
  const rng = () => 0.5;
  const farm = (wildsKinds(F).find((k) => k.key === "settlement")!.sources!.delegate as { engine: "settlement"; sizes: never[] });
  const home = settlementDelegateOptions(farm, { where: "home", culture: "celtic", region: "SHH", rng }, "hamlet", 1)!;
  assert.deepEqual({ setting: home.setting, culture: home.culture, region: home.region, size: home.size }, { setting: "native", culture: "britain", region: "SHH", size: "hamlet" });
  const fresh = settlementDelegateOptions(farm, { where: "new", culture: "iberian", rng }, "village", 1)!;
  assert.equal(fresh.setting, "new-lands");
  assert.ok(["spanish", "portuguese"].includes(fresh.tradition!), String(fresh.tradition));
  const settled = settlementDelegateOptions(farm, { where: "settled", culture: "dutch", rng }, "village", 1)!;
  assert.deepEqual({ setting: settled.setting, tradition: settled.tradition }, { setting: "settled-lands", tradition: "dutch" });
  // And through the module: every settlement name in new lands is the source's, and sizes are only the delegate's.
  for (const m of [H, F]) {
    const names = generateWildsNames({ module: m, culture: "iberian", where: "new", kind: "settlement", count: 12, seed: 3 }).names;
    assert.ok(names.length > 0 && names.every((n) => n.kind === "settlement" && n.shape === "source"), m);
  }
});

// ── Where, class, presets ───────────────────────────────────────────────────

test("where: settled round-trips through the sentence and reads in the history label; new keeps its meaning", () => {
  for (const m of [H, F]) {
    const state = chooseWilds(defaultWildsState(m), "where", "settled", m);
    assert.equal(state.where, "settled");
    assert.equal(seg(wildsSentence(state, m), "where")!.text, "in settled lands");
    assert.match(wildsHistoryLabel(m, state, SECTION_LABELS[m]), new RegExp(`^${SECTION_LABELS[m]} · medieval · .*settled lands`));
    assert.equal(chooseWilds(state, "where", "new", m).where, "new");
  }
});

test("class: the link shows where two classes are offered; choosing one filters the kinds", () => {
  const link = seg(wildsSentence(defaultWildsState(H), H), "kindClass")!;
  assert.deepEqual(link.choices.map((c) => c.id), [undefined, "natural", "managed", "constructed"]);
  const farmLink = seg(wildsSentence(defaultWildsState(F), F), "kindClass")!;
  assert.deepEqual(farmLink.choices.map((c) => c.id), [undefined, "managed", "constructed"]);
  const managed = chooseWilds(defaultWildsState(H), "kindClass", "managed", H);
  assert.deepEqual(seg(wildsSentence(managed, H), "kind")!.choices.map((c) => c.id), [undefined, "terrace"]);
  assert.ok(generateWildsNames({ module: H, kindClass: "managed", count: 20, seed: 4 }).names.every((n) => n.kind === "terrace"));
  const constructed = chooseWilds(defaultWildsState(F), "kindClass", "constructed", F);
  assert.deepEqual(seg(wildsSentence(constructed, F), "kind")!.choices.map((c) => c.id), [undefined, "farm", "moot", "works", "settlement"]);
  // A stored kind outside the chosen class is shown and kept.
  const stored = { ...defaultWildsState(H), kind: "hill", kindClass: "managed" as const };
  assert.ok(seg(wildsSentence(stored, H), "kind")!.choices.some((c) => c.id === "hill"));
});

test("the probe records both modules: era runs, worlds, the three views and their classes", () => {
  const offers = (lensOffers as unknown as { modules: Record<string, { eras: string[][]; views: string[]; classes: string[] }> }).modules;
  for (const m of [H, F]) {
    assert.deepEqual(offers[m].eras.flat(), ["AN", "MD", "EM", "ST", "MO", "NF", "IS"], m);
    assert.deepEqual(offers[m].views, ["welsh", "scottish", "cornish"], m);
  }
  assert.deepEqual(offers[H].classes, ["natural", "managed", "constructed"]);
  assert.deepEqual(offers[F].classes, ["managed", "constructed"]);
});

test("presets: both modules save and read a preset like the wild lands' do", () => {
  assert.equal(wildsPresetKey(H), "hills-valleys-names");
  assert.equal(wildsPresetKey(F), "farmland-names");
  for (const m of [H, F]) {
    const content = modulePresetContent({ packName: "Test", setting: "", description: "d", wildsModule: m, culture: "norman-british", wildsKind: "any", era: "MD", where: "settled", fantastic: false, region: "all", biome: "any", tone: "any", people: "placeholders", series: false });
    const parsed = parseModulePreset(content, "Test");
    assert.equal(parsed.problems.length, 0, m);
    assert.equal(parsed.wilds?.wildsModule, m);
    assert.equal(parsed.wilds?.where, "settled");
  }
});

// ── Coverage ────────────────────────────────────────────────────────────────

test("coverage: both modules report; borrowed sources count for them and the settlement kinds are flagged delegated", () => {
  for (const m of [H, F]) {
    const adapter = COVERAGE_ADAPTERS.find((a) => a.module === m)!;
    assert.ok(adapter, m);
    assert.deepEqual(adapter.kindFlags, { settlement: "delegated" });
    const rows = adapter.rows();
    assert.ok(rows.some((r) => r.source.startsWith("sources/native/")), `${m}: British generics count`);
    assert.ok(rows.some((r) => r.source.startsWith("sources/colonial/")), `${m}: colonial generics count`);
    assert.ok(rows.some((r) => r.source.startsWith("shapes/")), `${m}: own shapes count`);
  }
});
