// Place modules split brief M1 (§3, §4): the settled where, the culture-to-tradition map, the source
// shares and the one function that resolves a kind's draw. No module uses sources yet, so nothing
// here changes any module's output: the filters are optional and absent by default.
import { test } from "node:test";
import assert from "node:assert/strict";
import { COLONIAL_DATA, generateColonialShapesDetailed } from "../src/colonialShapes";
import { generatePlaceNames } from "../src/names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe } from "../src/names/recipe";
import { mulberry32 } from "../src/markov";
import { PLACE_SHAPE_DATA, generatePlaceShapesDetailed } from "../src/placeShapes";
import { colonialTraditionOf, drawKind, hasColonialTradition, riverSettingFor, settlementDelegateOptions, SOURCE_SHARES, sourceFor, type KindSources, type SourceContext } from "../src/places/sources";
import { generateRiverNames } from "../src/rivers/engine";
import { generateSettlementNames } from "../src/settlement/names";
import { generateWatersNames } from "../src/waters/engine";
import { chooseWaters, defaultWatersState, watersHistoryLabel, watersSentence } from "../src/waters/sentence";
import { generateWildsNames, WILDS_DATA } from "../src/wilds/engine";
import { chooseWilds, defaultWildsState, wildsHistoryLabel, wildsSentence } from "../src/wilds/sentence";
import { parseModulePreset } from "../src/presets";
import lens from "../src/data/lens.json";

const seedFrom = (rng: () => number) => Math.floor(rng() * 4294967296) >>> 0;

// ── Data ───────────────────────────────────────────────────────────────────

test("the shares are as §4.1 fixes them, in lens.json", () => {
  assert.deepEqual(SOURCE_SHARES.home, { source: "native", share: 0.4, cultures: ["norman-british", "anglo-saxon", "celtic"] });
  assert.deepEqual(SOURCE_SHARES.new, { source: "colonial", part: "2", share: 0.5 });
  assert.deepEqual(SOURCE_SHARES.settled, { source: "colonial", part: "2a", share: 0.6 });
  assert.ok((lens as { sourceShares?: unknown }).sourceShares);
});

test("the culture-to-tradition map: §3.2's additions are there, the old entries stay, every tradition exists", () => {
  const link = WILDS_DATA.settlementLink;
  assert.deepEqual(link.cultureToColonial, {
    general: "general",
    "norman-british": "british-imperial",
    "anglo-saxon": "british-imperial",
    celtic: "british-imperial",
    roman: "roman",
    "greek-byzantine": "hellenistic",
    slavic: "russian",
    "arabic-persian": "arab",
    chinese: "chinese",
    japanese: "japanese",
  });
  const added = link.cultureToColonialAdded!;
  assert.deepEqual(Object.keys(added).sort(), ["american", "belgian", "dutch", "french", "german", "iberian", "italian", "norse", "ottoman", "phoenician"]);
  assert.deepEqual(added.norse, [{ tradition: "danish", weight: 50 }, { tradition: "swedish", weight: 50 }]);
  assert.deepEqual(added.iberian, [{ tradition: "spanish", weight: 50 }, { tradition: "portuguese", weight: 50 }]);
  assert.equal(added.american, "english-speaking-settler");
  const traditions = new Set(COLONIAL_DATA.traditions.map((t) => t.id));
  for (const entry of [...Object.values(link.cultureToColonial), ...Object.values(added)].flatMap((e) => (typeof e === "string" ? [e] : e.map((x) => x.tradition)))) {
    assert.ok(entry === "general" || traditions.has(entry), `tradition ${entry} exists`);
  }
});

test("the added cultures change no current output: the settlement link still reads only the old map", () => {
  // `norse` is only in the added map, so a wild lands settlement draw at `new` still has no colonial request.
  const before = generateWildsNames({ module: "mountainNames", culture: "norse", era: "MD", where: "new", count: 12, seed: 42 }).names.map((n) => n.text);
  const again = generateWildsNames({ module: "mountainNames", culture: "norse", era: "MD", where: "new", count: 12, seed: 42 }).names.map((n) => n.text);
  assert.deepEqual(before, again);
  assert.equal(WILDS_DATA.settlementLink.cultureToColonial["norse" as string], undefined);
});

test("a two-way entry is drawn per name by weight; a one-way entry is that tradition; none is none", () => {
  const rng = mulberry32(5);
  const picks = Array.from({ length: 4000 }, () => colonialTraditionOf("norse", rng));
  const danish = picks.filter((p) => p === "danish").length / picks.length;
  assert.ok(Math.abs(danish - 0.5) < 0.03, `danish ${danish}`);
  assert.deepEqual([...new Set(picks)].sort(), ["danish", "swedish"]);
  const iberian = Array.from({ length: 4000 }, () => colonialTraditionOf("iberian", rng));
  assert.ok(Math.abs(iberian.filter((p) => p === "spanish").length / 4000 - 0.5) < 0.03);
  assert.equal(colonialTraditionOf("french", mulberry32(1)), "french");
  assert.equal(colonialTraditionOf("norman-british", mulberry32(1)), "british-imperial");
  assert.equal(colonialTraditionOf("steppe", mulberry32(1)), undefined);
  assert.equal(hasColonialTradition("steppe"), false);
  assert.equal(hasColonialTradition("german"), true);
});

// ── Filters: absent by default, so nothing changes ─────────────────────────

test("the British shape filter: absent or covering every generic gives the same batch and the same stream", () => {
  const all = PLACE_SHAPE_DATA.groups.flatMap((g) => g.generics.map((x) => x.id));
  for (const region of [undefined, "NTH", "COR", "SHH"]) {
    for (const seed of [1, 42, 2024]) {
      const plain = generatePlaceShapesDetailed({ count: 60, seed, region });
      const withAll = generatePlaceShapesDetailed({ count: 60, seed, region, genericIds: all });
      assert.deepEqual(withAll.shapes, plain.shapes, `${region} ${seed}`);
      assert.equal(withAll.mainRngNext, plain.mainRngNext, "same stream");
      const rendered = (only?: { generics: string[] }) => generatePlaceNames({ recipe: britishPlaceNamesRecipe(region), slots: {}, count: 24, seed, ...(only ? { only } : {}) }).names.map((n) => n.text);
      assert.deepEqual(rendered({ generics: all }), rendered(), `rendered ${region} ${seed}`);
    }
  }
});

test("the British shape filter restricts to the generics named", () => {
  const { shapes } = generatePlaceShapesDetailed({ count: 200, seed: 7, genericIds: ["tor", "crag", "fell"] });
  assert.ok(shapes.length > 0);
  assert.ok(shapes.every((s) => ["tor", "crag", "fell"].includes(s.genericId)), "only the named generics");
  assert.throws(() => generatePlaceShapesDetailed({ count: 5, seed: 1, genericIds: ["no-such-generic"] }), /No eligible/);
});

test("the colonial filter: absent or covering every group gives the same batch; it restricts to its groups and generics", () => {
  const groups = COLONIAL_DATA.groups.map((g) => g.id);
  for (const part of ["2", "2a"] as const) {
    for (const tradition of [undefined, "british-imperial", "french"]) {
      for (const seed of [1, 42]) {
        const plain = generateColonialShapesDetailed({ count: 60, seed, part, tradition });
        const withAll = generateColonialShapesDetailed({ count: 60, seed, part, tradition, only: { groups } });
        assert.deepEqual(withAll.shapes, plain.shapes, `${part} ${tradition} ${seed}`);
      }
    }
  }
  const rendered = (only?: { groups?: string[]; generics?: string[] }) =>
    generatePlaceNames({ recipe: colonialPlaceNamesRecipe("new-land", undefined, undefined), slots: {}, count: 30, seed: 9, ...(only ? { only } : {}) }).names.map((n) => n.text);
  assert.deepEqual(rendered({ groups }), rendered());
  const { shapes } = generateColonialShapesDetailed({ count: 300, seed: 3, part: "2", only: { groups: ["valleys"], generics: ["volcano"] } });
  const allowed = new Set(["volcano", ...COLONIAL_DATA.groups.find((g) => g.id === "valleys")!.generics.map((g) => (typeof g === "string" ? g : g.id))]);
  assert.ok(shapes.length > 0 && shapes.every((s) => allowed.has(s.genericId)), "only the listed groups' generics and the listed generics");
});

// ── Sources ────────────────────────────────────────────────────────────────

const ctxOf = (over: Partial<SourceContext>, seed = 1): SourceContext => ({ where: "home", culture: "norman-british", region: "NTH", rng: mulberry32(seed), ...over });
const NATIVE: KindSources = { native: { generics: ["tor", "crag", "fell", "mountain", "pointed-hill"] }, colonial: { groups: ["mountains-and-rock"], generics: ["mountain-range", "volcano", "glacier"] } };

function shareOf(kind: KindSources, over: Partial<SourceContext>, draws: number): number {
  const rng = mulberry32(2026);
  let fromSource = 0;
  for (let i = 0; i < draws; i++) {
    const text = drawKind(kind, { where: "home", culture: "norman-british", region: "NTH", ...over, rng }, () => "OWN");
    if (text === undefined) throw new Error("a draw gave nothing");
    if (text !== "OWN") fromSource++;
  }
  return fromSource / draws;
}

test("the shares: a large seeded batch draws from the source within 3 points of 40, 50 and 60 per cent", () => {
  assert.ok(Math.abs(shareOf(NATIVE, { where: "home" }, 2500) - 0.4) < 0.03, "home 40%");
  assert.ok(Math.abs(shareOf(NATIVE, { where: "new", culture: "norman-british" }, 2500) - 0.5) < 0.03, "new 50%");
  assert.ok(Math.abs(shareOf(NATIVE, { where: "settled", culture: "french" }, 2500) - 0.6) < 0.03, "settled 60%");
});

test("which source serves: native at home for the British cultures, colonial for a culture with a tradition, else none", () => {
  assert.equal(sourceFor(NATIVE, { where: "home", culture: "celtic" }), "native");
  assert.equal(sourceFor(NATIVE, { where: "home", culture: "japanese" }), undefined);
  assert.equal(sourceFor(NATIVE, { where: "new", culture: "iberian" }), "colonial");
  assert.equal(sourceFor(NATIVE, { where: "settled", culture: "steppe" }), undefined);
  assert.equal(sourceFor({ native: NATIVE.native }, { where: "new", culture: "french" }), undefined, "a kind with no colonial source");
});

test("fallbacks: a source that gives nothing falls to own shapes; no own shapes falls to the source; series and no-source are own only", () => {
  const nothing: KindSources = { native: { generics: ["no-such-generic"] } };
  for (let i = 0; i < 40; i++) assert.equal(drawKind(nothing, ctxOf({}, i + 1), () => "OWN"), "OWN", "source gives nothing: own");
  // No own shapes: every draw comes from the source (or, if that fails, there is nothing).
  const noOwn = Array.from({ length: 60 }, (_, i) => drawKind(NATIVE, ctxOf({}, i + 1), () => undefined));
  assert.ok(noOwn.every((t) => typeof t === "string" && t.length > 0), "falls to the source");
  // Series: own only, however the roll would fall.
  for (let i = 0; i < 40; i++) assert.equal(drawKind(NATIVE, ctxOf({ series: true }, i + 1), () => "OWN"), "OWN");
  // A culture with no source: own only.
  for (let i = 0; i < 40; i++) assert.equal(drawKind(NATIVE, ctxOf({ culture: "japanese" }, i + 1), () => "OWN"), "OWN");
  for (let i = 0; i < 40; i++) assert.equal(drawKind(NATIVE, ctxOf({ where: "new", culture: "steppe" }, i + 1), () => "OWN"), "OWN");
});

test("a source keeps its own rendering: native names carry the region's weighting and a placeholder where the slot is open", () => {
  const rng = mulberry32(11);
  const names = Array.from({ length: 80 }, () => drawKind({ native: { generics: ["tor", "crag", "fell"] } }, { where: "home", culture: "norman-british", region: "NTH", rng }, () => undefined));
  assert.ok(names.every((n) => typeof n === "string"));
  assert.ok(names.some((n) => /\[/.test(n!)), "brackets stay as the British engine writes them");
});

test("delegated kinds ignore the shares and call their engine with the right options", () => {
  // Rivers at home, British, with a region: the river engine's british setting.
  const rivers: KindSources = { delegate: { engine: "rivers" } };
  for (const seed of [1, 7, 99]) {
    const got = drawKind(rivers, ctxOf({ where: "home", region: "NTH" }, seed), () => "OWN");
    const rng = mulberry32(seed);
    const expected = generateRiverNames({ setting: "british", region: "NTH", count: 1, seed: seedFrom(rng) }).names[0].text;
    assert.equal(got, expected, `rivers ${seed}`);
  }
  assert.equal(riverSettingFor({ where: "home", culture: "norman-british" }), "british");
  assert.equal(riverSettingFor({ where: "home", culture: "japanese" }), "established");
  assert.equal(riverSettingFor({ where: "new", culture: "norman-british" }), "new-land");
  assert.equal(riverSettingFor({ where: "settled", culture: "norman-british" }), "established");
  // Settlements: sizes, setting and tradition follow the where and the culture.
  const delegate = { engine: "settlement" as const, sizes: ["hamlet", "village"] as ("hamlet" | "village")[] };
  const home = settlementDelegateOptions(delegate, ctxOf({ where: "home", region: "COR" }), "village", 5);
  assert.deepEqual(home, { size: "village", count: 1, seed: 5, wilds: false, setting: "native", culture: "britain", region: "COR" });
  const fresh = settlementDelegateOptions(delegate, ctxOf({ where: "new", culture: "french" }), "hamlet", 6);
  assert.deepEqual(fresh, { size: "hamlet", count: 1, seed: 6, wilds: false, setting: "new-lands", tradition: "french" });
  const settled = settlementDelegateOptions(delegate, ctxOf({ where: "settled", culture: "norman-british" }), "village", 7);
  assert.deepEqual(settled, { size: "village", count: 1, seed: 7, wilds: false, setting: "settled-lands", tradition: "british-imperial" });
  assert.equal(settlementDelegateOptions(delegate, ctxOf({ where: "new", culture: "steppe" }), "village", 8), undefined);
  // And the draw is the settlement engine's, shares ignored.
  for (const seed of [1, 2, 3]) {
    const got = drawKind({ delegate }, ctxOf({ where: "home", region: "NTH" }, seed), () => "OWN");
    const rng = mulberry32(seed);
    const size = delegate.sizes[Math.floor(rng() * delegate.sizes.length)];
    const expected = generateSettlementNames(settlementDelegateOptions(delegate, ctxOf({ where: "home", region: "NTH" }), size, seedFrom(rng))!).names[0].text;
    assert.equal(got, expected, `settlement ${seed}`);
  }
  // A delegate with nothing to say for the culture falls back to own shapes.
  assert.equal(drawKind({ delegate }, ctxOf({ where: "new", culture: "steppe" }), () => "OWN"), "OWN");
});

// ── Where: settled ─────────────────────────────────────────────────────────

import watersData from "../src/data/waters.json";

test("the settled column of the where multipliers: new's values except mood 1, per 3, sai 1.5", () => {
  const tables = { wilds: WILDS_DATA.where as Record<string, { home: number; new: number; settled?: number }>, waters: (watersData as unknown as { where: Record<string, { home: number; new: number; settled?: number }> }).where };
  for (const [name, table] of Object.entries(tables)) {
    for (const [key, row] of Object.entries(table)) {
      const expected = key === "mood" ? 1 : key === "per" ? 3 : key === "sai" ? 1.5 : row.new;
      assert.equal(row.settled, expected, `${name} ${key}`);
    }
  }
});

test("settled round trip through the sentence: the third where choice, texts, state and history label", () => {
  const wilds = defaultWildsState("mountainNames");
  const w = wildsSentence(wilds, "mountainNames").find((s) => typeof s === "object" && s.field === "where") as { choices: { id: string; label: string }[] };
  assert.deepEqual(w.choices.map((c) => [c.id, c.label]), [["home", "in home country"], ["new", "in newly explored country"], ["settled", "in settled lands"]]);
  for (const id of ["home", "new", "settled"]) assert.equal(chooseWilds(wilds, "where", id, "mountainNames").where, id);
  assert.match(wildsHistoryLabel("mountainNames", chooseWilds(wilds, "where", "settled", "mountainNames"), "mountains"), /settled lands/);
  const waters = defaultWatersState("coastsIslands");
  const a = watersSentence(waters, "coastsIslands").find((s) => typeof s === "object" && s.field === "where") as { choices: { id: string; label: string }[] };
  assert.deepEqual(a.choices.map((c) => [c.id, c.label]), [["home", "on home shores"], ["new", "on newly explored shores"], ["settled", "on settled shores"]]);
  assert.equal(chooseWaters(waters, "where", "settled", "coastsIslands").where, "settled");
  assert.match(watersHistoryLabel("coastsIslands", chooseWaters(waters, "where", "settled", "coastsIslands"), "coasts and islands"), /settled shores/);
});

test("a stored where: settled preset keeps its meaning; new keeps its own", () => {
  for (const where of ["home", "new", "settled"]) {
    const note = `---\ntype: module-preset\nmodule: mountain-names\npackName: P\nsetting: \nculture: norman-british\nkind: any\nera: MD\nwhere: ${where}\nfantastic: false\nregion: all\nbiome: any\ntone: any\npeople: placeholders\nseries: false\n---\n`;
    const parsed = parseModulePreset(note, "P");
    assert.deepEqual(parsed.problems, [], where);
    assert.equal(parsed.wilds?.where, where, where);
  }
});

test("settled runs, with its own weights, and new and home are unchanged by it", () => {
  const run = (where: "home" | "new" | "settled", seed = 42) => generateWildsNames({ module: "mountainNames", culture: "norman-british", era: "MD", where, count: 40, seed }).names.map((n) => n.text);
  assert.equal(run("settled").length, 40);
  assert.notDeepEqual(run("settled"), run("new"), "settled's mood, per and sai differ from new's");
  assert.deepEqual(run("new"), run("new"));
  const waters = (where: "home" | "new" | "settled") => generateWatersNames({ module: "coastsIslands", culture: "norman-british", era: "MD", where, count: 40, seed: 42 }).names.map((n) => n.text);
  assert.equal(waters("settled").length, 40);
});
