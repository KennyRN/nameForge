// Place modules split brief M6: stars and space (§5.5, §3.1).
import { test } from "node:test";
import assert from "node:assert/strict";
import { COVERAGE_ADAPTERS } from "../src/coverage";
import coloniaData from "../src/data/colonial-shapes.json";
import lensOffers from "../src/data/lens-offers.json";
import placesData from "../src/data/places.json";
import { classesOffered } from "../src/places/classes";
import { drawFromSource, type KindSources } from "../src/places/sources";
import { groupScale, groupsAtScale, kindScales, kindScalesAt, scaleForDraw } from "../src/places/space";
import { modulePresetContent, parseModulePreset, wildsPresetKey } from "../src/presets";
import { historySection, PLACE_MODULE_SECTIONS, SECTION_GROUPS, SECTION_LABELS, SECTION_ORDER } from "../src/sections";
import { mulberry32 } from "../src/markov";
import type { SpaceScale } from "../src/space/scale";
import { generateWildsNames, PLACE_MODULES, wildsEras, wildsKinds, wildsKindsAt } from "../src/wilds/engine";
import { chooseWilds, defaultWildsState, wildsHistoryLabel, wildsSentence, wildsSentenceText } from "../src/wilds/sentence";

const S = "starsSpace" as const;
type Choice = { id?: string; label: string };
const seg = (segments: unknown[], field: string) => segments.find((s) => typeof s === "object" && (s as { field: string }).field === field) as { text: string; choices: Choice[]; current?: string; fixed?: boolean } | undefined;
const kindsOf = () => wildsKinds(S);
const src = (k: string): KindSources => kindsOf().find((x) => x.key === k)!.sources!;

// ── The line-up ─────────────────────────────────────────────────────────────

test("stars and space is last in the place names group, after sacred places, with its label, preset key and history", () => {
  assert.equal(SECTION_LABELS[S], "stars and space");
  const group = SECTION_GROUPS.placeNames;
  assert.equal(group[group.length - 1], S);
  assert.ok(group.indexOf("sacredPlaces") < group.indexOf(S));
  assert.ok(SECTION_ORDER.indexOf("sacredPlaces") < SECTION_ORDER.indexOf(S));
  assert.ok(PLACE_MODULE_SECTIONS.includes(S) && (PLACE_MODULES as string[]).includes(S));
  assert.equal(wildsPresetKey(S), "stars-space-names");
  assert.equal(historySection("stars and space · interstellar · General"), S);
});

test("default sentence, series text, the where link (no home) and the eras are §5.5's", () => {
  const state = defaultWildsState(S);
  assert.deepEqual([state.era, state.where, state.culture], ["IS", "new", "general"]);
  assert.equal(
    wildsSentenceText(wildsSentence(state, S)),
    "General all space features of any kind of the interstellar era, in newly explored space, in a science fiction world, across any scale, of any tone, with placeholders for people and places, each one separate.",
  );
  assert.equal(seg(wildsSentence({ ...state, series: true }, S), "series")!.text, "in one system");
  assert.deepEqual(seg(wildsSentence(state, S), "where")!.choices.map((c) => [c.id, c.label]), [["new", "in newly explored space"], ["settled", "in settled space"]]);
  assert.equal(seg(wildsSentence({ ...state, where: "settled" }, S), "where")!.text, "in settled space");
  assert.deepEqual(wildsEras(S), ["NF", "IS"]);
  // No region and no biome link: neither belongs in space.
  assert.equal(seg(wildsSentence(state, S), "region"), undefined);
  assert.equal(seg(wildsSentence(state, S), "biome"), undefined);
});

test("a stored home country reads as newly explored space", () => {
  const state = chooseWilds({ ...defaultWildsState(S), where: "home" }, "tone", "any", S);
  assert.equal(state.where, "new");
  const names = generateWildsNames({ module: S, culture: "general", where: "home", count: 6, seed: 3 }).names;
  const again = generateWildsNames({ module: S, culture: "general", where: "new", count: 6, seed: 3 }).names;
  assert.deepEqual(names.map((n) => n.text), again.map((n) => n.text));
});

// ── Kinds, classes, groups: §5.5's table ────────────────────────────────────

test("kinds, menus, classes and colonial groups are §5.5's", () => {
  assert.deepEqual(
    kindsOf().map((k) => [k.key, k.menu, k.class]),
    [
      ["world", "Planets, moons and rings", "natural"],
      ["orbit", "Orbits, belts and boundaries", "natural"],
      ["star", "Stars and stellar neighbourhoods", "natural"],
      ["nebula", "Clouds, nebulae and clusters", "natural"],
      ["expanse", "Rifts, spurs, arms and voids", "natural"],
      ["station", "Stations and habitats", "constructed"],
    ],
  );
  assert.deepEqual(src("world").colonial, { groups: ["planet-surface", "planet-moons", "planet-rings"] });
  assert.deepEqual(src("orbit").colonial, { groups: ["planet-orbits", "system-inner", "system-belts", "system-outer", "system-boundaries", "system-binaries"] });
  assert.deepEqual(src("star").colonial, { groups: ["neighbourhood-stars", "neighbourhood-bubbles", "neighbourhood-streams"] });
  assert.deepEqual(src("nebula").colonial, { groups: ["neighbourhood-clouds", "sector-nebulae", "sector-clusters"] });
  assert.deepEqual(src("expanse").colonial, { groups: ["sector-rifts", "sector-spurs", "galaxy-arms", "galaxy-core", "galaxy-disc", "galaxy-halo", "galaxy-voids"] });
  assert.equal(src("station").delegate?.engine, "settlement");
  assert.equal(src("station").colonial, undefined);
  for (const k of kindsOf()) assert.deepEqual(src(k.key).share, { new: 1, settled: 1 }, `${k.key}: all source`);
  assert.deepEqual(classesOffered(S), ["natural", "constructed"]);
  assert.equal(wildsSentence(defaultWildsState(S), S).some((s) => typeof s === "object" && s.field === "kindClass"), true, "the class link shows");
});

test("every colonial group the brief names exists and lives at a scale", () => {
  const ids = new Set((coloniaData.groups as { id: string }[]).map((g) => g.id));
  for (const k of kindsOf()) for (const g of src(k.key).colonial?.groups ?? []) {
    assert.ok(ids.has(g), `${k.key}: ${g}`);
    assert.ok(groupScale(g), `${g} has a scale`);
  }
});

test("a kind's scales are those of its groups; the future eras offer them as route names do", () => {
  assert.deepEqual(kindScales(src("world")), ["Pl"]);
  assert.deepEqual(kindScales(src("orbit")), ["Pl", "Sy"]);
  assert.deepEqual(kindScales(src("star")), ["Nb"]);
  assert.deepEqual(kindScales(src("nebula")), ["Nb", "Se"]);
  assert.deepEqual(kindScales(src("expanse")), ["Se", "Ga"]);
  assert.deepEqual(kindScales(src("station")), ["Pl", "Sy", "Nb", "Se", "Ga"]);
  // Near future: the planetary and star systems only.
  assert.deepEqual(wildsKindsAt(S, "NF").map((k) => k.key), ["world", "orbit", "station"]);
  assert.deepEqual(wildsKindsAt(S, "IS").map((k) => k.key), ["world", "orbit", "star", "nebula", "expanse", "station"]);
  assert.deepEqual(kindScalesAt(src("orbit"), "NF"), ["Pl", "Sy"]);
  assert.deepEqual(kindScalesAt(src("expanse"), "NF"), []);
  const nf = seg(wildsSentence({ ...defaultWildsState(S), era: "NF" }, S), "scale")!;
  assert.deepEqual(nf.choices.map((c) => c.id), ["any", "Pl", "Sy"]);
  const is = seg(wildsSentence(defaultWildsState(S), S), "scale")!;
  assert.deepEqual(is.choices.map((c) => c.id), ["any", "Pl", "Sy", "Nb", "Se", "Ga"]);
});

// ── The scale link and its resets ───────────────────────────────────────────

test("choosing a scale narrows the kind menu, resets a kind without groups there, and nothing is stored for any scale", () => {
  let state = defaultWildsState(S);
  state = chooseWilds(state, "scale", "Ga", S);
  assert.equal(state.scale, "Ga");
  assert.deepEqual(seg(wildsSentence(state, S), "kind")!.choices.map((c) => c.id), [undefined, "expanse", "station"]);
  state = chooseWilds({ ...defaultWildsState(S), kind: "world" }, "scale", "Ga", S);
  assert.equal(state.kind, undefined, "a world has no group at the galaxy scale");
  assert.equal("scale" in chooseWilds(state, "scale", "any", S), false, "any scale stores nothing");
  // A scale the era lacks resets to any when the era changes.
  const nf = chooseWilds({ ...defaultWildsState(S), scale: "Ga" }, "era", "NF", S);
  assert.equal(nf.scale, undefined);
  assert.equal(nf.era, "NF");
});

test("a scale restricts every name of a kind to that scale's groups; any scale draws by the era's weights", () => {
  const rng = mulberry32(5);
  for (const k of ["world", "orbit", "star", "nebula", "expanse"]) {
    for (const scale of kindScales(src(k))) assert.ok(groupsAtScale(src(k), scale).length > 0, `${k} at ${scale}`);
  }
  assert.equal(scaleForDraw(src("star"), "IS", "Ga", rng), "Nb", "a scale the kind lacks reads as any, among the kind's own");
  assert.equal(scaleForDraw(src("star"), "NF", "any", rng), undefined, "a star has no scale in the near future");
  const counts: Record<string, number> = {};
  for (let i = 0; i < 4000; i++) {
    const s = scaleForDraw(src("orbit"), "IS", "any", rng)!;
    counts[s] = (counts[s] ?? 0) + 1;
  }
  // IS weights Pl 20 : Sy 25 over the orbit kind's two scales.
  assert.ok(Math.abs(counts.Pl / 4000 - 20 / 45) < 0.03, JSON.stringify(counts));
});

// ── Every colonial space group is reachable ─────────────────────────────────

const SPACE_GROUPS = (coloniaData.groups as { id: string; space?: boolean }[]).filter((g) => g.space && g.id !== "space-settlement").map((g) => g.id);

test("all 22 colonial space groups are named by a kind, drawn at their own scale, and give names", () => {
  assert.equal(SPACE_GROUPS.length, 22);
  const named = new Set(kindsOf().flatMap((k) => src(k.key).colonial?.groups ?? []));
  for (const g of SPACE_GROUPS) assert.ok(named.has(g), `${g} is in some kind's sources`);
  for (const where of ["new", "settled"] as const) {
    for (const g of SPACE_GROUPS) {
      const scale = groupScale(g)!;
      const rng = mulberry32(11);
      let given = 0;
      for (let i = 0; i < 40 && given === 0; i++) {
        if (drawFromSource({ colonial: { groups: [g] } }, "colonial", { where, culture: "general", rng, scale })) given++;
      }
      assert.ok(given > 0, `${g} (${scale}, ${where}) gives names`);
    }
  }
});

test("the space-settlement group is reached through stations, at every scale", () => {
  for (const scale of ["Pl", "Sy", "Nb", "Se", "Ga"] as SpaceScale[]) {
    const names = generateWildsNames({ module: S, culture: "general", kind: "station", scale, where: "new", count: 12, seed: 4 }).names;
    assert.ok(names.length >= 6, `stations at ${scale}: ${names.length}`);
    assert.ok(names.every((n) => n.shape === "source"));
  }
});

test("every kind gives names at every scale it lives at, both ways, as colonial space names", () => {
  for (const where of ["new", "settled"] as const) {
    for (const k of ["world", "orbit", "star", "nebula", "expanse", "station"]) {
      for (const scale of kindScalesAt(src(k), "IS")) {
        const r = generateWildsNames({ module: S, culture: "general", kind: k, scale, where, count: 10, seed: 9 });
        assert.ok(r.names.length >= 5, `${k} at ${scale}, ${where}: ${r.names.length} names`);
      }
    }
  }
});

// ── Sources: all source, own shapes only where the groups give nothing ──────

function ownShare(culture: string, kind: string, where: "new" | "settled"): { own: number; total: number } {
  let own = 0;
  let total = 0;
  for (let seed = 1; seed <= 400; seed++) {
    for (const n of generateWildsNames({ module: S, culture, kind, where, count: 1, seed }).names) {
      total++;
      if (n.shape !== "source") own++;
    }
  }
  return { own, total };
}

test("a culture with a colonial tradition draws every name from the source (both ways); one without uses own shapes only", () => {
  for (const where of ["new", "settled"] as const) {
    for (const k of ["world", "orbit", "star", "nebula", "expanse"]) {
      const { own, total } = ownShare("general", k, where);
      assert.ok(total > 300 && own / total < 0.06, `general ${k} ${where}: ${own}/${total} own`);
      const none = ownShare("egyptian", k, where);
      assert.equal(none.own, none.total, `egyptian ${k} ${where}: own shapes only`);
    }
  }
});

test("a station takes the General tradition when the culture has none, and a tradition the part lacks falls back, never throwing", () => {
  const r = generateWildsNames({ module: S, culture: "egyptian", kind: "station", where: "settled", count: 8, seed: 6 });
  assert.ok(r.names.length >= 4 && r.names.every((n) => n.shape === "source"));
  // Chinese is a part 2a tradition: in newly explored space the kinds fall back to their own shapes.
  const chinese = generateWildsNames({ module: S, culture: "chinese", kind: "star", where: "new", count: 8, seed: 6 });
  assert.ok(chinese.names.length >= 4 && chinese.names.every((n) => n.shape !== "source"));
  assert.ok(generateWildsNames({ module: S, culture: "chinese", kind: "station", where: "new", count: 8, seed: 6 }).names.length >= 4);
});

test("no focused place module throws for a tradition that exists only in the other part (Chinese, Japanese at newly explored)", () => {
  for (const module of PLACE_MODULES) {
    for (const culture of ["chinese", "japanese", "arabic-persian", "greek-byzantine", "slavic"]) {
      for (const where of ["new", "settled"] as const) {
        const era = module === S ? "IS" : "MD";
        assert.doesNotThrow(() => generateWildsNames({ module, culture, where, era, count: 8, seed: 42 }), `${module} ${culture} ${where}`);
      }
    }
  }
});

// ── Own shapes ──────────────────────────────────────────────────────────────

test("every non-delegated kind has at least six own shapes open to General (no culture, no era limit, not fantastic-only), in common English", () => {
  const shapes = (placesData.shapes as unknown as Record<string, Record<string, { p: string; c?: string[]; h?: boolean; e?: string[]; f: string }[]>>)[S];
  assert.deepEqual(Object.keys(shapes), ["world", "orbit", "star", "nebula", "expanse"], "stations are delegated: no own shapes");
  for (const kind of kindsOf().filter((k) => !src(k.key).delegate)) {
    const open = shapes[kind.key].filter((s) => !s.c && !s.h && !s.e);
    assert.ok(open.length >= 6, `${kind.key}: ${open.length} open shapes`);
  }
});

// ── Presets, history, probe, coverage ───────────────────────────────────────

test("a preset round-trips with its scale; any scale writes no line, and an old state reads as before", () => {
  const preset = { packName: "Far reaches", setting: "", description: "d", wildsModule: S, culture: "general", wildsKind: "nebula", era: "IS", where: "settled", wildsScale: "Se", fantastic: false, region: "all", biome: "any", tone: "any", people: "placeholders", series: false } as never;
  const text = modulePresetContent(preset);
  assert.match(text, /\nscale: Se\n/);
  const back = parseModulePreset(text, "Far reaches");
  assert.equal(back.wilds?.wildsScale, "Se");
  assert.equal(back.wilds?.where, "settled");
  assert.deepEqual(back.problems, []);
  const plain = modulePresetContent({ ...(preset as object), wildsScale: undefined } as never);
  assert.doesNotMatch(plain, /scale:/);
  // A note without a where or era line opens as the module does: newly explored space, the interstellar era.
  const bare = parseModulePreset("---\ntype: module-preset\nmodule: stars-space-names\npackName: Bare\n---\n", "Bare");
  assert.deepEqual([bare.wilds?.era, bare.wilds?.where], ["IS", "new"]);
});

test("the history label names the where and any chosen scale", () => {
  const state = { ...defaultWildsState(S), where: "settled" as const, scale: "Sy" as const, kind: "orbit" };
  assert.equal(wildsHistoryLabel(S, state, SECTION_LABELS[S]), "stars and space · interstellar · General · settled space · star system · orbits, belts and boundaries");
});

test("the probe records the two future eras apart, both worlds, no views, and two classes", () => {
  const m = (lensOffers as unknown as { modules: Record<string, { family: string; eras: string[][]; worlds: Record<string, string[]>; views?: string[]; classes?: string[] }> }).modules[S];
  assert.equal(m.family, "A");
  assert.deepEqual(m.eras, [["NF"], ["IS"]]);
  assert.deepEqual(m.worlds.IS, ["plain", "fantastic"]);
  assert.equal(m.views, undefined);
  assert.deepEqual(m.classes, ["natural", "constructed"]);
});

test("the coverage adapter exists and counts the colonial groups' generics as the module's", () => {
  const adapter = COVERAGE_ADAPTERS.find((a) => a.module === S)!;
  assert.ok(adapter);
  const rows = adapter.rows();
  const sources = rows.filter((r) => r.source.startsWith("sources/colonial/"));
  assert.ok(sources.length > 60, `${sources.length} borrowed entries`);
  assert.ok(sources.every((r) => !r.source.includes("[object")), "generic ids, not records");
  assert.ok(rows.some((r) => r.source === "sources/colonial/world/crater"));
});
