// Place modules split brief M3: rivers and inland waters (the first focused place module) and seas and bays.
import { test } from "node:test";
import assert from "node:assert/strict";
import { COVERAGE_ADAPTERS } from "../src/coverage";
import placesData from "../src/data/places.json";
import watersData from "../src/data/waters.json";
import { classesOffered } from "../src/places/classes";
import { riverSettingFor } from "../src/places/sources";
import { modulePresetContent, parseModulePreset, wildsPresetKey } from "../src/presets";
import { historySection, PLACE_MODULE_SECTIONS, SECTION_GROUPS, SECTION_LABELS, SECTION_ORDER } from "../src/sections";
import { chooseWaters, defaultWatersState, watersSentence } from "../src/waters/sentence";
import { generateWatersNames } from "../src/waters/engine";
import { generateWildsNames, wildsKinds } from "../src/wilds/engine";
import { chooseWilds, defaultWildsState, wildsHistoryLabel, wildsSentence, wildsSentenceText } from "../src/wilds/sentence";

const M = "riversInland" as const;
type Choice = { id?: string; label: string };
const seg = (segments: unknown[], field: string) => segments.find((s) => typeof s === "object" && (s as { field: string }).field === field) as { text: string; choices: Choice[]; current?: string } | undefined;

test("the module is in the line-up: label, place names group (before route names) and history", () => {
  assert.equal(SECTION_LABELS[M], "rivers and inland waters");
  assert.deepEqual(PLACE_MODULE_SECTIONS, ["farmland", "hillsValleys", M]);
  assert.ok(SECTION_ORDER.includes(M));
  const group = SECTION_GROUPS.placeNames;
  assert.ok(group.indexOf(M) > group.indexOf("empireExpansionPlaceShapes") && group.indexOf(M) < group.indexOf("routeNames"), group.join(", "));
  assert.equal(historySection("rivers and inland waters · medieval · Norman & British"), M);
  assert.equal(historySection("river names · British"), "placeShapes", "river names are not this module");
});

test("seas and lakes is seas and bays; its old history rows still belong to it", () => {
  assert.equal(SECTION_LABELS.seasLakes, "seas and bays");
  assert.equal(historySection("seas and bays · medieval · Norman & British"), "seasLakes");
  assert.equal(historySection("seas and lakes · medieval · Norman & British"), "seasLakes");
});

test("the default sentence reads as the wild lands' do, with the where link and the class link", () => {
  const text = wildsSentenceText(wildsSentence(defaultWildsState(M), M));
  assert.equal(text, "Norman & British all rivers and inland waters of any kind of the medieval era, in home country, in a historic or low fantasy world, across all of Britain, of any tone, with placeholders for people and places, each one separate.");
  const where = seg(wildsSentence(defaultWildsState(M), M), "where")!;
  assert.deepEqual(where.choices.map((c) => c.label), ["in home country", "in newly explored country", "in settled lands"]);
});

// ── Kinds, classes, shapes ──────────────────────────────────────────────────

test("kinds and classes are the brief's §5.4", () => {
  const kinds = wildsKinds(M);
  assert.deepEqual(kinds.map((k) => [k.key, k.class]), [["river", "natural"], ["stream", "natural"], ["spring", "natural"], ["pool", "natural"], ["lake", "natural"], ["falls", "natural"], ["riverland", "natural"], ["cut", "constructed"]]);
  assert.deepEqual(kinds.find((k) => k.key === "river")!.sources, { delegate: { engine: "rivers" } });
  assert.equal(kinds.find((k) => k.key === "cut")!.sources, undefined, "canals and leats are own shapes only");
  assert.deepEqual(classesOffered(M), ["natural", "constructed"]);
});

test("every non-delegated kind has at least six own shapes open to General, in common English", () => {
  const shapes = placesData.shapes[M] as Record<string, { p: string; c?: string[]; h?: boolean; f: string }[]>;
  for (const kind of wildsKinds(M)) {
    if (kind.sources?.delegate) {
      assert.equal(shapes[kind.key], undefined, `${kind.key} is delegated: no shapes of its own`);
      continue;
    }
    const open = shapes[kind.key].filter((s) => !s.c && s.h === undefined && (s.f as string) !== "fixed");
    assert.ok(open.length >= 6, `${kind.key}: ${open.length} open shapes`);
  }
});

test("lakes moved: the seas and lakes `lake` kind's shapes and culture shapes are rivers' `lake` kind's, unchanged", () => {
  const moved = (placesData.shapes[M] as Record<string, unknown[]>).lake.slice(0, watersData.shapes.seasLakes.lake.length);
  assert.deepEqual(moved, watersData.shapes.seasLakes.lake);
  const cs = (watersData.cultureShapes as { module: string; kind: string }[]).filter((c) => c.module === "seasLakes" && c.kind === "lake");
  assert.deepEqual((placesData.cultureShapes as { module: string; kind: string }[]).filter((c) => c.module === M).map((c) => ({ ...c, module: "seasLakes" })), cs);
});

test("seas and bays no longer offers lakes, but a stored lake is shown, kept and still runs", () => {
  const sea = defaultWatersState("seasLakes");
  const menu = seg(watersSentence(sea, "seasLakes"), "kind")!.choices.map((c) => c.id);
  assert.ok(!menu.includes("lake"));
  assert.ok(menu.includes("sea") && menu.includes("bay"));
  const stored = { ...sea, kind: "lake" };
  assert.ok(seg(watersSentence(stored, "seasLakes"), "kind")!.choices.some((c) => c.id === "lake"), "a stored lake is listed");
  assert.equal(chooseWaters(stored, "culture", "norman-british", "seasLakes").kind, "lake", "and kept");
  const names = generateWatersNames({ module: "seasLakes", kind: "lake", culture: "norman-british", count: 8, seed: 5 }).names;
  assert.ok(names.length > 0);
});

// ── Sources ─────────────────────────────────────────────────────────────────

/** The share of a kind's names that came from a source, over many small batches. */
function sourcedShare(where: "home" | "new" | "settled", culture: string, kind: string, extra: object = {}): { sourced: number; total: number } {
  let sourced = 0;
  let total = 0;
  for (let seed = 1; seed <= 500; seed++) {
    const batch = generateWildsNames({ module: M, culture, kind, where, count: 12, seed, ...extra });
    for (const n of batch.names) {
      total++;
      if (n.shape === "source") sourced++;
    }
  }
  return { sourced, total };
}

for (const [where, expected] of [["home", 0.4], ["new", 0.5], ["settled", 0.6]] as const) {
  test(`sources: at ${where} a British culture's stream names come from the source ${expected * 100}% of the time, within 3 points`, () => {
    const { sourced, total } = sourcedShare(where, "norman-british", "stream");
    const share = sourced / total;
    assert.ok(Math.abs(share - expected) <= 0.03, `${where}: ${(share * 100).toFixed(1)}% of ${total}`);
  });
}

test("sources: fallbacks. A culture with no source in this where uses its own shapes only; a kind with no own shapes uses the source", () => {
  // Chinese at home: no native source (British cultures only).
  assert.equal(sourcedShare("home", "chinese", "stream").sourced, 0);
  // Polynesian has no colonial tradition: own shapes in new and settled lands.
  assert.equal(sourcedShare("new", "polynesian", "stream").sourced, 0);
  assert.equal(sourcedShare("settled", "polynesian", "stream").sourced, 0);
  // A kind drawn only from a source (the delegated river) always gives source names.
  const rivers = sourcedShare("home", "norman-british", "river");
  assert.equal(rivers.sourced, rivers.total);
  // Cut has no sources: its names are always its own.
  assert.equal(sourcedShare("settled", "norman-british", "cut").sourced, 0);
});

test("sources: the river kind goes to the river engine with the setting the where gives", () => {
  assert.equal(riverSettingFor({ where: "home", culture: "norman-british" }), "british");
  assert.equal(riverSettingFor({ where: "home", culture: "celtic" }), "british");
  assert.equal(riverSettingFor({ where: "new", culture: "norman-british" }), "new-land");
  assert.equal(riverSettingFor({ where: "settled", culture: "norman-british" }), "established");
  assert.equal(riverSettingFor({ where: "home", culture: "chinese" }), "established");
  // And the names are real river names: a region's corpus shows at home.
  const names = generateWildsNames({ module: M, culture: "celtic", kind: "river", where: "home", region: "SHH", count: 12, seed: 7 }).names;
  assert.ok(names.length === 12 && names.every((n) => n.kind === "river"));
});

// ── Where, class, presets ───────────────────────────────────────────────────

test("where: settled round-trips through the sentence and reads in the history label", () => {
  const state = chooseWilds(defaultWildsState(M), "where", "settled", M);
  assert.equal(state.where, "settled");
  assert.equal(seg(wildsSentence(state, M), "where")!.text, "in settled lands");
  assert.match(wildsHistoryLabel(M, state, SECTION_LABELS[M]), /^rivers and inland waters · medieval · .*settled lands/);
  // `new` keeps its meaning.
  assert.equal(chooseWilds(state, "where", "new", M).where, "new");
});

test("class: shown (natural, constructed); constructed leaves canals, leats and reservoirs only", () => {
  const link = seg(wildsSentence(defaultWildsState(M), M), "kindClass")!;
  assert.deepEqual(link.choices.map((c) => c.id), [undefined, "natural", "constructed"]);
  const state = chooseWilds({ ...defaultWildsState(M), era: "ST" }, "kindClass", "constructed", M);
  const names = generateWildsNames({ module: M, era: "ST", kindClass: "constructed", count: 20, seed: 3 }).names;
  assert.ok(names.length > 0 && names.every((n) => n.kind === "cut"), names.map((n) => n.kind).join());
  assert.deepEqual(seg(wildsSentence(state, M), "kind")!.choices.map((c) => c.id), [undefined, "cut"]);
});

test("the cut kind is era-gated: leats from the medieval, canals and reservoirs from the steam age", () => {
  const medieval = generateWildsNames({ module: M, era: "MD", kind: "cut", count: 40, seed: 11 }).names.map((n) => n.text);
  assert.ok(medieval.length > 0 && medieval.every((t) => /Leat|Mill Race/.test(t)), medieval.join());
  const steam = generateWildsNames({ module: M, era: "ST", kind: "cut", count: 40, seed: 11 }).names.map((n) => n.text);
  assert.ok(steam.some((t) => /Canal|Reservoir|Cut|Navigation/.test(t)));
  assert.equal(generateWildsNames({ module: M, era: "AN", kind: "cut", count: 5, seed: 1 }).names.length, 0, "no cuts in the ancient world");
});

test("presets: the module saves and reads a preset like the wild lands' do", () => {
  assert.equal(wildsPresetKey(M), "inland-water-names");
  const content = modulePresetContent({ packName: "Stream test", setting: "", description: "d", wildsModule: M, culture: "norman-british", wildsKind: "stream", era: "MD", where: "settled", fantastic: false, region: "all", biome: "any", tone: "any", people: "placeholders", series: false });
  assert.match(content, /^module: inland-water-names$/m);
  const parsed = parseModulePreset(content, "Stream test");
  assert.equal(parsed.problems.length, 0);
  assert.equal(parsed.wilds?.wildsModule, M);
  assert.equal(parsed.wilds?.where, "settled");
  assert.equal(parsed.wilds?.wildsKind, "stream");
});

// ── Coverage ────────────────────────────────────────────────────────────────

test("coverage: the module reports; borrowed sources count for it, and the delegated river kind is flagged", () => {
  const adapter = COVERAGE_ADAPTERS.find((a) => a.module === M)!;
  assert.ok(adapter);
  assert.deepEqual(adapter.kindFlags, { river: "delegated" });
  const rows = adapter.rows();
  assert.ok(rows.some((r) => r.source === "sources/native/stream/clear-stream" && r.kind === "stream" && r.cultures?.includes("english")));
  assert.ok(rows.some((r) => r.source.startsWith("sources/colonial/stream/")), "colonial generics count too");
  assert.ok(rows.some((r) => r.source.startsWith("shapes/")), "own shapes count");
});
