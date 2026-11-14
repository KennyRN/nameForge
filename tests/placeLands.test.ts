// Place modules split brief M5: lands and territories (§5.1).
import { test } from "node:test";
import assert from "node:assert/strict";
import { COVERAGE_ADAPTERS } from "../src/coverage";
import coloniaData from "../src/data/colonial-shapes.json";
import lensOffers from "../src/data/lens-offers.json";
import placeShapes from "../src/data/place-shapes.json";
import placesData from "../src/data/places.json";
import { classesOffered } from "../src/places/classes";
import { modulePresetContent, parseModulePreset, wildsPresetKey } from "../src/presets";
import { historySection, PLACE_MODULE_SECTIONS, SECTION_GROUPS, SECTION_LABELS, SECTION_ORDER } from "../src/sections";
import { generateWildsNames, wildsEras, wildsKinds } from "../src/wilds/engine";
import { chooseWilds, defaultWildsState, wildsHistoryLabel, wildsSentence, wildsSentenceText } from "../src/wilds/sentence";

const L = "lands" as const;
type Choice = { id?: string; label: string };
const seg = (segments: unknown[], field: string) => segments.find((s) => typeof s === "object" && (s as { field: string }).field === field) as { text: string; choices: Choice[]; current?: string } | undefined;

// ── The line-up ─────────────────────────────────────────────────────────────

test("lands and territories is first of the focused modules in the place names group, with its label and history", () => {
  assert.equal(SECTION_LABELS[L], "lands and territories");
  assert.equal(PLACE_MODULE_SECTIONS[0], L);
  const group = SECTION_GROUPS.placeNames;
  assert.ok(group.indexOf(L) < group.indexOf("farmland") && group.indexOf("farmland") < group.indexOf("hillsValleys"), group.join(", "));
  assert.ok(SECTION_ORDER.indexOf(L) < SECTION_ORDER.indexOf("farmland"));
  assert.equal(historySection("lands and territories · medieval · Norman & British"), L);
});

test("default sentence and series text are §5.1's; the where link is three-way; eras run AN to MO", () => {
  assert.equal(
    wildsSentenceText(wildsSentence(defaultWildsState(L), L)),
    "Norman & British all lands and territories of any kind of the medieval era, in home country, in a historic or low fantasy world, across all of Britain, of any tone, with placeholders for people and places, each one separate.",
  );
  assert.equal(seg(wildsSentence({ ...defaultWildsState(L), series: true }, L), "series")!.text, "in one realm");
  assert.deepEqual(seg(wildsSentence(defaultWildsState(L), L), "where")!.choices.map((c) => c.label), ["in home country", "in newly explored country", "in settled lands"]);
  assert.deepEqual(wildsEras(L), ["AN", "MD", "EM", "ST", "MO"]);
});

// ── Kinds, classes, sources, shapes: §5.1's table ───────────────────────────

test("kinds, classes, native generics and colonial generics are §5.1's", () => {
  const kinds = wildsKinds(L);
  assert.deepEqual(kinds.map((k) => [k.key, k.class]), [["country", "natural"], ["shire", "managed"], ["march", "managed"], ["province", "managed"], ["parish", "managed"], ["folk", "managed"]]);
  const src = (k: string) => kinds.find((x) => x.key === k)!.sources!;
  assert.equal(src("country").native, undefined);
  assert.deepEqual(src("country").colonial, { generics: ["plain-grassland", "desert"] });
  assert.deepEqual(src("shire").native, { generics: ["land-holding-share-of-land", "folk-group-territory"] });
  assert.deepEqual(src("shire").colonial, { generics: ["land-territory"] });
  assert.deepEqual(src("march").native, { generics: ["boundary", "dyke-boundary-earthwork"] });
  assert.deepEqual(src("march").colonial, { generics: ["frontier-march"] });
  assert.equal(src("province").native, undefined);
  assert.deepEqual(src("province").colonial, { generics: ["province-kingdom"] });
  assert.deepEqual(src("parish").native, { generics: ["estate-manor-centre", "farm-township"] });
  assert.equal(src("parish").colonial, undefined);
  assert.deepEqual(src("folk").native, { generics: ["folk-group-territory"] });
  assert.equal(src("folk").colonial, undefined);
  assert.deepEqual(classesOffered(L), ["natural", "managed"]);
  assert.deepEqual(kinds.map((k) => k.menu), ["Named countrysides", "Shires, counties and hundreds", "Marches and borderlands", "Provinces, colonies and dominions", "Parishes, townships and estates", "Lands of a people"]);
});

test("every generic the sources name exists in the retired engines' tables", () => {
  const british = new Set<string>();
  const colonial = new Set<string>();
  const walk = (o: unknown, into: Set<string>) => {
    if (Array.isArray(o)) o.forEach((x) => walk(x, into));
    else if (o && typeof o === "object") {
      const id = (o as { id?: unknown }).id;
      if (typeof id === "string") into.add(id);
      Object.values(o).forEach((x) => walk(x, into));
    }
  };
  walk(placeShapes, british);
  // Part 2 and 2a generics sit inside the colonial groups.
  walk((coloniaData as unknown as { groups: unknown }).groups, colonial);
  for (const k of wildsKinds(L)) {
    for (const g of k.sources?.native?.generics ?? []) assert.ok(british.has(g), `${k.key}: British generic ${g}`);
    for (const g of k.sources?.colonial?.generics ?? []) assert.ok(colonial.has(g), `${k.key}: colonial generic ${g}`);
  }
});

test("every kind has at least six own shapes open to General (no culture, no era limit, no fantastic-only), in common English", () => {
  const shapes = (placesData.shapes as unknown as Record<string, Record<string, { p: string; c?: string[]; h?: boolean; e?: string[]; f: string }[]>>)[L];
  for (const kind of wildsKinds(L)) {
    const open = shapes[kind.key].filter((s) => !s.c && s.h === undefined && !s.e && s.f !== "fixed");
    assert.ok(open.length >= 6, `${kind.key}: ${open.length} open shapes with no era limit`);
  }
});

// ── Sources: shares and fallbacks ───────────────────────────────────────────

function sourcedShare(where: "home" | "new" | "settled", culture: string, kind: string): { sourced: number; total: number } {
  let sourced = 0;
  let total = 0;
  // One name per batch: a batch drops repeats, and the module's own placeholder shapes repeat far more than a source's names do.
  for (let seed = 1; seed <= 3000; seed++) {
    for (const n of generateWildsNames({ module: L, culture, kind, where, count: 1, seed }).names) {
      total++;
      if (n.shape === "source") sourced++;
    }
  }
  return { sourced, total };
}

for (const [where, expected] of [["home", 0.4], ["new", 0.5], ["settled", 0.6]] as const) {
  test(`sources: shire, ${where}: a British culture's names come from the source ${expected * 100}% of the time, within 3 points`, () => {
    const { sourced, total } = sourcedShare(where, "norman-british", "shire");
    assert.ok(Math.abs(sourced / total - expected) <= 0.03, `${(100 * sourced / total).toFixed(1)}% of ${total}`);
  });
}

test("sources: kinds without a source for this where fall back to their own shapes", () => {
  // country and province have no native source; parish and folk have no colonial one.
  assert.equal(sourcedShare("home", "norman-british", "country").sourced, 0);
  assert.equal(sourcedShare("home", "norman-british", "province").sourced, 0);
  assert.equal(sourcedShare("new", "norman-british", "parish").sourced, 0);
  assert.equal(sourcedShare("settled", "norman-british", "folk").sourced, 0);
  // A culture with neither a British nor a colonial source uses own shapes only.
  assert.equal(sourcedShare("home", "chinese", "shire").sourced, 0);
  assert.equal(sourcedShare("new", "polynesian", "shire").sourced, 0);
});

test("sources: province gives colonial names in new and settled lands, and still names things at home", () => {
  assert.ok(sourcedShare("new", "norman-british", "province").sourced > 0);
  assert.ok(sourcedShare("settled", "iberian", "province").sourced > 0);
  assert.ok(generateWildsNames({ module: L, kind: "province", where: "home", count: 12, seed: 5 }).names.length > 0);
  assert.ok(generateWildsNames({ module: L, kind: "country", where: "home", count: 12, seed: 5 }).names.length > 0);
});

// ── Where, class, presets ───────────────────────────────────────────────────

test("where: settled round-trips through the sentence and reads in the history label; new keeps its meaning", () => {
  const state = chooseWilds(defaultWildsState(L), "where", "settled", L);
  assert.equal(state.where, "settled");
  assert.equal(seg(wildsSentence(state, L), "where")!.text, "in settled lands");
  assert.match(wildsHistoryLabel(L, state, SECTION_LABELS[L]), /^lands and territories · medieval · .*settled lands/);
  assert.equal(chooseWilds(state, "where", "new", L).where, "new");
});

test("class: the link shows (natural and managed); choosing one filters the kinds; a stored kind outside the class is kept", () => {
  const link = seg(wildsSentence(defaultWildsState(L), L), "kindClass")!;
  assert.deepEqual(link.choices.map((c) => c.id), [undefined, "natural", "managed"]);
  const natural = chooseWilds(defaultWildsState(L), "kindClass", "natural", L);
  assert.deepEqual(seg(wildsSentence(natural, L), "kind")!.choices.map((c) => c.id), [undefined, "country"]);
  assert.ok(generateWildsNames({ module: L, kindClass: "natural", count: 20, seed: 4 }).names.every((n) => n.kind === "country"));
  const managed = chooseWilds(defaultWildsState(L), "kindClass", "managed", L);
  assert.deepEqual(seg(wildsSentence(managed, L), "kind")!.choices.map((c) => c.id), [undefined, "shire", "march", "province", "parish", "folk"]);
  const stored = { ...defaultWildsState(L), kind: "country", kindClass: "managed" as const };
  assert.ok(seg(wildsSentence(stored, L), "kind")!.choices.some((c) => c.id === "country"));
});

test("the probe records the module: era runs AN to MO, the three views, natural and managed", () => {
  const offers = (lensOffers as unknown as { modules: Record<string, { eras: string[][]; views: string[]; classes: string[] }> }).modules;
  assert.deepEqual(offers[L].eras.flat(), ["AN", "MD", "EM", "ST", "MO"]);
  assert.deepEqual(offers[L].views, ["welsh", "scottish", "cornish"]);
  assert.deepEqual(offers[L].classes, ["natural", "managed"]);
});

test("presets: the module saves and reads a preset like the wild lands' do", () => {
  assert.equal(wildsPresetKey(L), "land-names");
  const content = modulePresetContent({ packName: "Test", setting: "", description: "d", wildsModule: L, culture: "norman-british", wildsKind: "any", era: "MD", where: "settled", fantastic: false, region: "all", biome: "any", tone: "any", people: "placeholders", series: false });
  const parsed = parseModulePreset(content, "Test");
  assert.equal(parsed.problems.length, 0);
  assert.equal(parsed.wilds?.wildsModule, L);
  assert.equal(parsed.wilds?.where, "settled");
});

// ── Coverage ────────────────────────────────────────────────────────────────

test("coverage: the module reports; borrowed British and colonial generics count, and no kind is delegated", () => {
  const adapter = COVERAGE_ADAPTERS.find((a) => a.module === L)!;
  assert.ok(adapter);
  assert.deepEqual(adapter.kindFlags ?? {}, {});
  const rows = adapter.rows();
  assert.ok(rows.some((r) => r.source.startsWith("sources/native/")), "British generics count");
  assert.ok(rows.some((r) => r.source.startsWith("sources/colonial/")), "colonial generics count");
  assert.ok(rows.some((r) => r.source.startsWith("shapes/")), "own shapes count");
});
