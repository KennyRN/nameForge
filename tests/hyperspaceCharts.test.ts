// Seas and coasts: hyperspace charts (Seas and coasts brief §17.4, §17.5).
import { test } from "node:test";
import assert from "node:assert/strict";
// The deities engine registers the hooks `{god}` reads, as the app loads it.
import "../src/deities/engine";
import {
  findHyperKind,
  generateWatersNames,
  HYPER_FORBIDDEN_POOLS,
  HYPER_KINDS,
  HYPER_SCALES,
  hyperKindsAt,
  WATERS_CULTURES,
  WATERS_DATA,
  WATERS_MEDIA,
  WATERS_REGISTERS,
  watersBlocked,
  type HyperMedium,
  type HyperRegister,
  type HyperShape,
  type WatersName,
  type WatersOptions,
} from "../src/waters/engine";
import { chooseWaters, defaultWatersState, watersHistoryLabel, watersSentence, watersSentenceText } from "../src/waters/sentence";
import { isModulePresetContent, modulePresetContent, parseModulePreset } from "../src/presets";
import { SETTLEMENT_VOCAB } from "../src/settlement/vocab";
import { SECTION_LABELS, historySection } from "../src/sections";
import { HYPERSPACE_GUIDE } from "../src/waters/guideText";
import { hasSpaceBlock } from "../src/space/safeguards";
import { SPACE_DATA } from "../src/space/scale";
import { groupListWords } from "../src/groups/engine";
import { dropStarWord, PROPER_STARS } from "../src/space/stars";

function many(o: Omit<WatersOptions, "module" | "count" | "seed">, n: number, per = 100): WatersName[] {
  const out: WatersName[] = [];
  for (let seed = 1; out.length < n && seed < n * 2; seed++) out.push(...generateWatersNames({ module: "hyperspaceCharts", ...o, count: per, seed }).names);
  return out.slice(0, n);
}

const shapeInfo = new Map<string, HyperShape[]>();
for (const [kind, shapes] of Object.entries(WATERS_DATA.hyper.shapes)) for (const s of shapes) shapeInfo.set(`${kind}|${s.p}`, [...(shapeInfo.get(`${kind}|${s.p}`) ?? []), s]);
const infoOf = (n: WatersName) => shapeInfo.get(`${n.kind}|${n.shape}`)![0];
const share = (names: WatersName[], pred: (n: WatersName) => boolean) => names.filter(pred).length / names.length;

test("§17.4: every shape's tokens resolve, kinds list real scales, and the counts match the brief", () => {
  const sources = new Set(["town", "star", "spaceDirection", "number", "folk", "person", "kingdom", "holy", "god", "river", "ship", "ordinal"]);
  for (const [kind, shapes] of Object.entries(WATERS_DATA.hyper.shapes)) {
    assert.ok(findHyperKind(kind), kind);
    for (const s of shapes) {
      for (const t of [...s.p.matchAll(/\{([^}:]+)/g)].map((x) => x[1])) assert.ok(sources.has(t) || SETTLEMENT_VOCAB.pools[t], `${s.p}: ${t}`);
      assert.ok(["s", "c", "v"].includes(s.reg), s.p);
      for (const sc of s.sc ?? []) assert.ok(findHyperKind(kind)!.scales.includes(sc), `${s.p}: ${sc}`);
    }
  }
  assert.equal(HYPER_KINDS.reduce((n, k) => n + k.weight, 0), 100);
  assert.equal(HYPER_KINDS.length, 9);
});

test("§17.4: the pipeline never reads spaceLand, spacePrefix or spaceHazard", () => {
  for (const scale of ["any", ...HYPER_SCALES] as const) {
    const names = many({ scale, people: "invented" }, 1500);
    const pools = new Set(names.flatMap((n) => n.words.map((w) => w.pool)));
    for (const forbidden of HYPER_FORBIDDEN_POOLS) assert.ok(!pools.has(forbidden), `${scale}: ${forbidden}`);
    assert.ok(pools.has("star"));
  }
  for (const [kind, shapes] of Object.entries(WATERS_DATA.hyper.shapes)) for (const s of shapes) for (const f of HYPER_FORBIDDEN_POOLS) assert.ok(!s.p.includes(`{${f}}`), `${kind} ${s.p}`);
});

test("§17.4: {star} is only ever a proper or possessive name, never Bayer or catalogue, and possessives drop Star", () => {
  const proper = new Set([...PROPER_STARS(), ...SPACE_DATA.stars.properExtra, ...groupListWords("star", "SF").map(([w]) => w)]);
  const real = new Set(SPACE_DATA.stars.possessiveReal.map(dropStarWord));
  for (const scale of ["any", ...HYPER_SCALES] as const) {
    for (const n of many({ scale, people: "invented" }, 1500)) {
      for (const w of n.words.filter((x) => x.pool === "star")) {
        assert.ok(!/\d/.test(w.word), `${w.word} in ${n.text}`);
        assert.ok(proper.has(w.word) || real.has(w.word) || /^[^ ].*'s$/.test(w.word), `${w.word} in ${n.text}`);
        assert.ok(!/ Star$/.test(w.word), `${w.word} in ${n.text}`);
      }
    }
  }
  assert.ok(many({ scale: "Nb", people: "invented" }, 3000).some((n) => n.words.some((w) => w.pool === "star" && /'s$/.test(w.word))));
});

test("§17.4: the scale decides the kinds: Sy has no great waters or straits, Ga no Realshore or Roads", () => {
  const sy = many({ scale: "Sy", people: "invented" }, 2000);
  assert.ok(sy.every((n) => n.kind !== "waters" && n.kind !== "strait" && n.scale === "Sy"));
  const ga = many({ scale: "Ga", people: "invented" }, 2000);
  assert.ok(ga.every((n) => !/Realshore|Roads/.test(n.shape) && n.scale === "Ga"));
  for (const k of hyperKindsAt("Ga")) assert.ok(k.scales.includes("Ga"));
  assert.equal(hyperKindsAt("any").length, 9);
  // Any scale draws all four.
  const any = many({ people: "invented" }, 2000);
  for (const sc of HYPER_SCALES) assert.ok(any.some((n) => n.scale === sc), sc);
  // A kind chosen with any scale is drawn only at its scales.
  assert.ok(many({ kind: "waters", people: "invented" }, 500).every((n) => n.scale === "Se" || n.scale === "Ga"));
});

test("§17.4: medium sea has no wind shapes; medium wind has no sea shapes; both has either", () => {
  for (const [medium, banned] of [["sea", "wind"], ["wind", "sea"]] as const) {
    const names = many({ medium, people: "invented" }, 2000);
    assert.ok(names.every((n) => infoOf(n).m !== banned), `${medium}: ${names.find((n) => infoOf(n).m === banned)?.text}`);
  }
  const both = many({ medium: "both", people: "invented" }, 3000);
  assert.ok(both.some((n) => infoOf(n).m === "sea") && both.some((n) => infoOf(n).m === "wind"));
});

test("§17.4: spacers' words have no survey shapes and under 10% chart shapes; survey words have no spacers' shapes", () => {
  const spacers = many({ register: "spacers", people: "invented" }, 2000);
  assert.ok(spacers.every((n) => infoOf(n).reg !== "v"));
  assert.ok(share(spacers, (n) => infoOf(n).reg === "c") < 0.1, `${share(spacers, (n) => infoOf(n).reg === "c")}`);
  const survey = many({ register: "survey", people: "invented" }, 2000);
  assert.ok(survey.every((n) => infoOf(n).reg !== "s"));
  assert.ok(survey.some((n) => infoOf(n).reg === "v"));
  const chart = many({ register: "chart", people: "invented" }, 2000);
  assert.ok(share(chart, (n) => infoOf(n).reg === "c") > share(spacers, (n) => infoOf(n).reg === "c"));
});

test("§17.4: no blocked phrase appears in 10,000 names across all settings", () => {
  let total = 0;
  const hyper = WATERS_DATA.safeguards.hyper;
  for (const scale of ["any", ...HYPER_SCALES] as const) {
    for (const medium of WATERS_MEDIA.map((m) => m.id) as HyperMedium[]) {
      for (const register of WATERS_REGISTERS.map((r) => r.id) as HyperRegister[]) {
        for (const culture of ["general", "norse", "japanese"]) {
          for (const n of many({ scale, medium, register, culture, people: "invented" }, 120, 20)) {
            total++;
            assert.ok(!watersBlocked(n.text, true), n.text);
            assert.ok(!hyper.some((p) => n.text.toLowerCase() === p.toLowerCase() || n.text.toLowerCase() === `the ${p.toLowerCase()}`), n.text);
            assert.ok(!hasSpaceBlock(n.text), n.text);
          }
        }
      }
    }
  }
  assert.ok(total >= 10000, `${total}`);
  assert.ok(watersBlocked("The Maelstrom", true) && watersBlocked("Maelstrom", true) && watersBlocked("roaring forties", true));
  assert.ok(!watersBlocked("The Maelstrom", false));
});

test("§12.8: culture changes the people in names, not the shapes", () => {
  const names = many({ culture: "norse", people: "invented", scale: "Nb" }, 3000);
  assert.ok(names.every((n) => !n.shape.includes("{holy")));
  assert.ok(names.some((n) => n.shape.includes("{person")));
  assert.ok(many({ culture: "norman-british", people: "invented", scale: "Nb" }, 6000).some((n) => n.shape.includes("{holy")));
  // Every culture gives names.
  for (const c of WATERS_CULTURES) assert.equal(generateWatersNames({ module: "hyperspaceCharts", culture: c.key, people: "invented", count: 15, seed: 2 }).names.length, 15, c.key);
});

test("§13: a hyperspace series shares its anchor stars in about 60% of its star names", () => {
  let withStar = 0;
  let anchored = 0;
  for (let seed = 1; seed <= 600; seed++) {
    const b = generateWatersNames({ module: "hyperspaceCharts", series: true, count: 10, seed, scale: "Nb" });
    for (const n of b.names) {
      if (!n.shape.includes("{star}")) continue;
      withStar++;
      if (n.anchored) anchored++;
    }
  }
  assert.ok(Math.abs(anchored / withStar - 0.6) <= 0.05, `${anchored / withStar}`);
});

test("every scale × medium × register × kind gives names", () => {
  for (const scale of ["any", ...HYPER_SCALES] as const) {
    for (const k of hyperKindsAt(scale)) {
      for (const medium of ["sea", "wind", "both"] as const) {
        for (const register of ["any", "spacers", "chart", "survey"] as const) {
          const b = generateWatersNames({ module: "hyperspaceCharts", scale, kind: k.key, medium, register, count: 4, seed: 6 });
          // A register can leave a kind thin (a survey-only kind needs survey shapes), but never empty with Any.
          if (register === "any") assert.ok(b.names.length >= 3, `${scale} ${k.key} ${medium}: ${b.names.length}`);
        }
      }
    }
  }
});

// ── Sentence, resets, presets, history ──────────────────────────────────────

test("§2.3: the hyperspace sentence", () => {
  assert.equal(
    watersSentenceText(watersSentence(defaultWatersState("hyperspaceCharts"), "hyperspaceCharts")),
    "General hyperspace features of any kind across any scale, where hyperspace flows like the sea, in any words, of any tone, with placeholders for people, each one separate.",
  );
  const state = { ...defaultWatersState("hyperspaceCharts"), scale: "Se" as const, medium: "both" as const, register: "survey" as const, series: true, kind: "weather" };
  assert.equal(
    watersSentenceText(watersSentence(state, "hyperspaceCharts")),
    "General weather belts across a sector, where hyperspace flows like the sea or the wind, in survey words, of any tone, with placeholders for people, on one chart.",
  );
});

test("§2.4: a kind not offered at a new scale resets to Any", () => {
  let s = { ...defaultWatersState("hyperspaceCharts"), kind: "shore" };
  s = chooseWaters(s, "scale", "Ga", "hyperspaceCharts");
  assert.equal(s.kind, undefined);
  s = chooseWaters({ ...defaultWatersState("hyperspaceCharts"), kind: "deep" }, "scale", "Sy", "hyperspaceCharts");
  assert.equal(s.kind, "deep");
  const kinds = watersSentence({ ...defaultWatersState("hyperspaceCharts"), scale: "Sy" }, "hyperspaceCharts").find((x) => typeof x !== "string" && x.field === "kind") as { choices: { id?: string }[] };
  assert.equal(kinds.choices.length - 1, hyperKindsAt("Sy").length);
  const scale = watersSentence(defaultWatersState("hyperspaceCharts"), "hyperspaceCharts").find((x) => typeof x !== "string" && x.field === "scale") as { choices: { id?: string }[] };
  assert.deepEqual(scale.choices.map((c) => c.id), ["any", "Sy", "Nb", "Se", "Ga"]);
});

test("§1.3: hyperspace history labels", () => {
  const label = (state: Parameters<typeof watersHistoryLabel>[1]) => watersHistoryLabel("hyperspaceCharts", state, SECTION_LABELS.hyperspaceCharts);
  assert.equal(label(defaultWatersState("hyperspaceCharts")), "hyperspace charts · Any scale · General");
  assert.equal(
    label({ ...defaultWatersState("hyperspaceCharts"), scale: "Nb", culture: "norse", register: "spacers", medium: "wind", kind: "calm", tone: "grim", series: true }),
    "hyperspace charts · Local stellar neighbourhood · Norse · spacers' words · like the wind · calms and anchorages · grim · series",
  );
  assert.ok(label({ ...defaultWatersState("hyperspaceCharts"), medium: "both" }).endsWith("sea or wind"));
  assert.equal(historySection(label(defaultWatersState("hyperspaceCharts"))), "hyperspaceCharts");
});

test("§15: a hyperspace preset round-trips and drops the earthly fields", () => {
  const preset = {
    packName: "Round trip",
    setting: "",
    description: "A description.",
    watersModule: "hyperspaceCharts" as const,
    culture: "norse",
    waterKind: "current",
    era: "IS" as const,
    where: "home" as const,
    fantastic: false,
    region: "all",
    biome: "any",
    tone: "strange" as const,
    people: "invented" as const,
    series: true,
    scale: "Sy" as const,
    medium: "both" as const,
    register: "chart" as const,
  };
  const content = modulePresetContent(preset);
  assert.ok(isModulePresetContent(content));
  assert.ok(!/^(era|where|fantastic|region|biome):/m.test(content));
  const { waters, problems } = parseModulePreset(content, "x");
  assert.deepEqual(problems, []);
  assert.deepEqual(waters, preset);
  const note = (...lines: string[]) => ["---", "type: module-preset", "module: waters", "watersModule: hyperspaceCharts", ...lines, "---"].join("\n");
  const bad = parseModulePreset(note("scale: Pl", "medium: gale", "register: loud"), "x");
  assert.equal(bad.waters?.scale, "any");
  assert.equal(bad.waters?.medium, "sea");
  assert.equal(bad.waters?.register, "any");
  assert.equal(bad.problems.length, 3);
  const kind = parseModulePreset(note("scale: Ga", "kind: shore"), "x");
  assert.equal(kind.waters?.waterKind, "any");
  assert.equal(kind.problems.length, 1);
});

test("§12.1: the guide explains the chart, the draw and the spill", () => {
  for (const word of ["Depth", "Set and drift", "Holding", "Hazards", "Depthwell", "Depthrise", "drift trap"]) assert.ok(HYPERSPACE_GUIDE.includes(word), word);
  assert.ok(!HYPERSPACE_GUIDE.includes(" - ") && !HYPERSPACE_GUIDE.includes("—"));
});
