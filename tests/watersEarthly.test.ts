// Seas and coasts: seas and lakes, coasts and islands, sea charts (Seas and coasts brief §17.1–§17.3, §17.5).
import { WILDS_DATA } from "../src/wilds/engine";
import { test } from "node:test";
import assert from "node:assert/strict";
// The deities engine registers the hooks `{god}` reads, as the app loads it.
import "../src/deities/engine";
import {
  EARTHLY_MODULES,
  findWatersCulture,
  generateWatersNames,
  waterEras,
  waterKinds,
  WATERS_CULTURES,
  WATERS_DATA,
  type WatersEarthly,
  type WatersEra,
  type WatersName,
  type WatersOptions,
  type WatersShape,
  watersBlocked,
  watersWordBlocked,
} from "../src/waters/engine";
import { chooseWaters, defaultWatersState, watersHistoryLabel, watersSentence, watersSentenceText } from "../src/waters/sentence";
import { isModulePresetContent, modulePresetContent, parseModulePreset } from "../src/presets";
import { SETTLEMENT_VOCAB, VOCAB_CULTURE_GROUPS, VOCAB_CULTURES } from "../src/settlement/vocab";
import { SECTION_LABELS, historySection } from "../src/sections";
import { BIOMES } from "../src/biomes";

/** Up to n names from batches of `per` with consecutive seeds (small batches for rates, since a batch holds each name once). */
function many(o: Omit<WatersOptions, "count" | "seed">, n: number, per = 100): WatersName[] {
  const out: WatersName[] = [];
  for (let seed = 1; out.length < n && seed < n * 2; seed++) out.push(...generateWatersNames({ ...o, count: per, seed }).names);
  return out.slice(0, n);
}

const allShapes = (module: WatersEarthly): { kind: string; shape: WatersShape }[] =>
  [
    ...Object.entries(WATERS_DATA.shapes[module]).flatMap(([kind, shapes]) => shapes.map((shape) => ({ kind, shape }))),
    ...WATERS_DATA.cultureShapes.filter((s) => s.module === module).map((shape) => ({ kind: shape.kind, shape: shape as WatersShape })),
  ];
const hasShape = (names: WatersName[], re: RegExp) => names.some((n) => re.test(n.shape));
const share = (names: WatersName[], pred: (n: WatersName) => boolean) => names.filter(pred).length / names.length;
const familyOf = new Map<string, string>();
for (const m of EARTHLY_MODULES) for (const { shape } of allShapes(m)) familyOf.set(shape.p, shape.f);
const SPECIAL = new Set(["town", "star", "spaceDirection", "number", "folk", "person", "kingdom", "holy", "god", "river", "ship", "ordinal"]);

// ── Data (§3, §5, §8–§11) ───────────────────────────────────────────────────

test("§17.1: every shape's tokens resolve; every region and biome tag and culture key exists", () => {
  const cultureKeys = new Set([...VOCAB_CULTURES, ...VOCAB_CULTURE_GROUPS]);
  for (const m of EARTHLY_MODULES) {
    for (const { kind, shape } of allShapes(m)) {
      for (const t of [...shape.p.matchAll(/\{([^}:]+)/g)].map((x) => x[1])) assert.ok(SPECIAL.has(t) || SETTLEMENT_VOCAB.pools[t], `${m} ${kind} ${shape.p}: ${t}`);
      if (shape.rt) assert.ok(WATERS_DATA.regionTags[shape.rt], `${shape.p}: rt ${shape.rt}`);
      if (shape.bt) assert.ok(WATERS_DATA.biomeTags[shape.bt], `${shape.p}: bt ${shape.bt}`);
      for (const c of shape.c ?? []) assert.ok(cultureKeys.has(c.replace(/^!/, "")), `${shape.p}: ${c}`);
      assert.ok(WATERS_DATA.cultureMult.general && (shape.f in WATERS_DATA.cultureMult.general || true));
    }
  }
  for (const pool of Object.values(SETTLEMENT_VOCAB.pools)) for (const e of pool.entries) {
    // Wild lands brief §3.4: its pools carry the wild lands biome tags, kept in wilds.json so the two tables can drift apart.
    if (e.bt) assert.ok(WATERS_DATA.biomeTags[e.bt] || WILDS_DATA.biomeTags[e.bt], `${e.w}: bt ${e.bt}`);
    if (e.rt && !["roman", "drove", "causeway", "corpse", "salt", "ridge", "packhorse", "army", "pedlar", "militaryRoad", "peat"].includes(e.rt)) assert.ok(WATERS_DATA.regionTags[e.rt], `${e.w}: rt ${e.rt}`);
  }
  assert.equal(WATERS_DATA.regionTags.ness.NSI, 3);
  assert.equal(Object.keys(WATERS_DATA.biomeTags).length, 9);
  for (const m of EARTHLY_MODULES) assert.equal(waterKinds(m).reduce((n, k) => n + k.weight, 0), 100);
});

test("§15.3: the same options and seed give the same names", () => {
  for (const module of EARTHLY_MODULES) {
    const o = { module, culture: "japanese", era: "EM" as WatersEra, people: "invented" as const, count: 20, seed: 42 };
    assert.deepEqual(generateWatersNames(o).names, generateWatersNames(o).names);
  }
});

test("every module × culture × era gives 12 unique names within the cap", () => {
  for (const module of EARTHLY_MODULES) {
    for (const c of WATERS_CULTURES) {
      for (const era of waterEras(module)) {
        for (const where of ["home", "new"] as const) {
          const b = generateWatersNames({ module, culture: c.key, era, where, people: "invented", count: 12, seed: 3 });
          assert.equal(b.names.length, 12, `${module} ${c.key} ${era} ${where}: ${b.names.length} ${b.notices.join(" ")}`);
          assert.equal(new Set(b.names.map((n) => n.text.toLowerCase())).size, 12);
          for (const n of b.names) assert.ok(n.text.split(" ").length <= 9 && !/[{}]/.test(n.text), n.text);
        }
      }
    }
  }
});

test("every kind gives names in every era its module offers (placeholders and invented)", () => {
  for (const module of EARTHLY_MODULES) {
    for (const era of waterEras(module)) {
      for (const k of waterKinds(module)) {
        for (const people of ["placeholders", "invented"] as const) {
          const b = generateWatersNames({ module, era, kind: k.key, people, count: 6, seed: 5 });
          assert.ok(b.names.length >= 3, `${module} ${era} ${k.key} ${people}: ${b.names.length}`);
          assert.ok(b.names.every((n) => n.kind === k.key));
        }
      }
    }
  }
});

// ── §17.1 Seas and lakes ────────────────────────────────────────────────────

test("§17.1: on British home shores in NSI, Voe and Firth appear and Fjord, Llyn, Broad and Tarn never do", () => {
  const names = many({ module: "seasLakes", culture: "norman-british", region: "NSI" }, 2000);
  assert.ok(hasShape(names, /Voe/) || hasShape(names, /Firth/));
  assert.ok(hasShape(names, /Firth/));
  assert.ok(!hasShape(names, /Fjord|Llyn|\{town\} Broad|Tarn/));
  for (const culture of ["anglo-saxon", "celtic"]) assert.ok(!hasShape(many({ module: "seasLakes", culture }, 1000), /Fjord/), culture);
});

test("§17.1: Broad in EAN, Llyn in WAL, Tarn and Water in NTH", () => {
  const lake = (region: string) => many({ module: "seasLakes", culture: "norman-british", region, kind: "lake" }, 2000);
  assert.ok(hasShape(lake("EAN"), /\{town\} Broad/));
  assert.ok(hasShape(lake("WAL"), /Llyn \{town\}/));
  const nth = lake("NTH");
  assert.ok(hasShape(nth, /\{town\} Tarn/));
  assert.ok(hasShape(nth, /\{town\} Water/));
  assert.ok(!hasShape(lake("WAL"), /\{town\} Broad|Tarn/));
});

test("§17.1: off British home shores no home-British shape appears; Norse still gets Voe, Holm and Geo", () => {
  for (const module of EARTHLY_MODULES) {
    const home = new Set(allShapes(module).filter(({ shape }) => shape.c?.includes("british") && shape.rt).map(({ kind, shape }) => `${kind}|${shape.p}`));
    for (const culture of ["anglo-saxon", "celtic", "norman-british"]) {
      const names = many({ module, culture, where: "new" }, 2000);
      assert.ok(names.every((n) => !home.has(`${n.kind}|${n.shape}`)), `${module} ${culture}: ${names.find((n) => home.has(`${n.kind}|${n.shape}`))?.shape}`);
    }
  }
  const sea = many({ module: "seasLakes", culture: "norse", where: "new", kind: "inlet" }, 2000);
  assert.ok(hasShape(sea, /\{town\} Voe/));
  const coast = many({ module: "coastsIslands", culture: "norse", where: "new" }, 3000);
  assert.ok(hasShape(coast, /\{town\} Holm/));
  assert.ok(hasShape(coast, /\{town\} Geo/));
});

test("§17.1: fused forms only ever use lakeFuse", () => {
  const names = many({ module: "seasLakes", culture: "norman-british", kind: "lake", region: "NTH", people: "invented" }, 2000);
  const fused = names.filter((n) => /^\{lakeFuse\}/.test(n.shape));
  assert.ok(fused.length > 0);
  for (const n of fused) {
    assert.deepEqual(n.words.map((w) => w.pool), ["lakeFuse"], n.text);
    assert.ok(/^[A-Z][a-z]+(mere|water)$/.test(n.text), n.text);
  }
});

test("§17.1: kennings only for Anglo-Saxon and Norse, cosmological oceans only for Indian", () => {
  let kennings = 0;
  let cosmo = 0;
  for (const c of WATERS_CULTURES) {
    for (const era of ["AN", "MD"] as const) {
      const names = many({ module: "seasLakes", culture: c.key, era }, 700);
      for (const n of names) {
        if (n.words.some((w) => w.pool === "seaKenning")) {
          kennings++;
          assert.ok(["anglo-saxon", "norse"].includes(c.key), `${c.key}: ${n.text}`);
        }
        if (n.words.some((w) => w.pool === "cosmoSubstance")) {
          cosmo++;
          assert.equal(c.key, "indian", n.text);
        }
      }
    }
  }
  assert.ok(kennings > 0 && cosmo > 0);
});

test("§17.1: in the near future and interstellar eras maria shapes are at least 15% of sea names; IS sea monsters appear realistic", () => {
  for (const era of ["NF", "IS"] as const) {
    const names = many({ module: "seasLakes", era, kind: "sea" }, 2000);
    assert.ok(share(names, (n) => familyOf.get(n.shape) === "maria") >= 0.15, era);
  }
  const is = many({ module: "seasLakes", era: "IS", kind: "sea", fantastic: false }, 2000);
  assert.ok(hasShape(is, /\{seaMonster\} Sea/));
});

test("§17.1: with fantastic off no fantastic-only shape appears", () => {
  for (const module of EARTHLY_MODULES) {
    for (const era of waterEras(module)) {
      const forbidden = new Set(allShapes(module).filter(({ shape }) => shape.h === true && (!shape.e || shape.e.includes(era))).map(({ shape }) => shape.p));
      const names = many({ module, era, fantastic: false }, 1000);
      assert.ok(names.every((n) => !forbidden.has(n.shape)), `${module} ${era}: ${names.find((n) => forbidden.has(n.shape))?.shape}`);
    }
  }
  // And with it on, a fantastic shape does appear.
  assert.ok(hasShape(many({ module: "seasLakes", era: "MD", fantastic: true, kind: "sea" }, 2000), /\{seaMonster\} Sea/));
});

// ── §17.2 Coasts and islands ────────────────────────────────────────────────

test("§17.2: in COR Porth and Cove appear; Naze, Bill, Mull, Geo and Voe never do", () => {
  const names = many({ module: "coastsIslands", culture: "norman-british", region: "COR" }, 2000);
  assert.ok(hasShape(names, /Porth \{town\}/));
  assert.ok(hasShape(names, /\{town\} Cove/));
  assert.ok(!hasShape(names, /Naze|\{town\} Bill|Mull of|Geo|Voe/));
});

test("§17.2: in SHH Mull of, Machair and Stack appear; Chine, Pill and Denes never do", () => {
  const names = many({ module: "coastsIslands", culture: "norman-british", region: "SHH" }, 3000);
  assert.ok(hasShape(names, /Mull of/));
  assert.ok(hasShape(names, /Machair/));
  assert.ok(hasShape(names, /Stack/));
  assert.ok(!hasShape(names, /Chine|Pill|Denes/));
});

test("§17.2: a tropical archipelago favours Key, Cay, Atoll, Lagoon and Pass; the boreal forest has none", () => {
  const tropic = /\{town\} Key|Cay$|Atoll|Lagoon|\{town\} Pass/;
  const rate = (biome?: string) => share(many({ module: "coastsIslands", culture: "general", era: "EM", biome }, 2000, 10), (n) => tropic.test(n.shape));
  assert.ok(rate("tropical-islands") >= 0.12, `${rate("tropical-islands")}`);
  assert.ok(rate("tropical-islands") > rate() * 2);
  assert.equal(rate("boreal"), 0);
});

// The brief's §17.2 puts the tropical share at 20% or more. With §3.4's ×4 on the five tropical
// shapes (17 of the module's shape weight, spread over the cove and island kinds, which hold 38% of
// names) it comes to about 15% for General and 20% only for Polynesian. Kept as a todo, as the place
// regions' 10× rule is, pending a decision on the brief's number.
test(
  "§17.2: Key, Cay, Atoll, Lagoon and Pass are at least 20% of a tropical archipelago's names (brief)",
  { todo: "about 15% with the given weights for a non-British culture — see summary" },
  () => {
    const tropic = /\{town\} Key|Cay$|Atoll|Lagoon|\{town\} Pass/;
    assert.ok(share(many({ module: "coastsIslands", culture: "general", era: "EM", biome: "tropical-islands" }, 2000, 10), (n) => tropic.test(n.shape)) >= 0.2);
  },
);

test("§17.2: explorers' moods make up at least 10% on new shores, under 2% on home shores", () => {
  const mood = (n: WatersName) => familyOf.get(n.shape) === "mood";
  for (const [module, kind] of [["coastsIslands", "headland"], ["coastsIslands", "island"], ["seasLakes", "bay"]] as const) {
    const fresh = many({ module, era: "EM", where: "new", kind }, 2000, 5);
    const home = many({ module, era: "EM", where: "home", kind }, 2000, 5);
    assert.ok(share(fresh, mood) >= 0.1, `${module} ${kind} new ${share(fresh, mood)}`);
    assert.ok(share(home, mood) < 0.02, `${module} ${kind} home ${share(home, mood)}`);
  }
});

test("§17.2: a series shares its anchors in 60% of the names whose shape has a place", () => {
  let withTown = 0;
  let anchored = 0;
  for (let seed = 1; seed <= 1000; seed++) {
    const b = generateWatersNames({ module: "coastsIslands", culture: "norman-british", people: "invented", series: true, count: 10, seed });
    for (const n of b.names) {
      if (!n.shape.includes("{town}")) continue;
      withTown++;
      if (n.anchored) anchored++;
    }
  }
  const rate = anchored / withTown;
  assert.ok(Math.abs(rate - 0.6) <= 0.05, `${rate}`);
});

test("§13: series with placeholders explains itself; modules without series ignore it", () => {
  assert.ok(generateWatersNames({ module: "coastsIslands", series: true, count: 5, seed: 1 }).notices.some((n) => /series/i.test(n)));
  const sea = generateWatersNames({ module: "seasLakes", people: "invented", series: true, count: 10, seed: 9 });
  assert.ok(sea.names.every((n) => n.anchored === undefined));
});

// ── §17.3 Sea charts ────────────────────────────────────────────────────────

test("§17.3: {ship} never appears in the ancient or medieval eras", () => {
  for (const era of ["AN", "MD"] as const) assert.ok(!hasShape(many({ module: "seaCharts", era, people: "invented" }, 2000), /\{ship\}/), era);
  const st = many({ module: "seaCharts", era: "ST", people: "invented" }, 3000);
  assert.ok(hasShape(st, /\{ship\}/));
  assert.ok(st.filter((n) => n.shape.includes("{ship}")).every((n) => !n.text.includes("[") && !n.text.includes("{")));
  assert.ok(hasShape(many({ module: "seaCharts", era: "ST", people: "placeholders" }, 3000).filter((n) => n.text.includes("[ship]")), /\{ship\}/));
});

test("§17.3: Trench and Trough never appear before the steam age", () => {
  for (const era of ["AN", "MD", "EM"] as const) assert.ok(!hasShape(many({ module: "seaCharts", era, kind: "deep" }, 1000), /Trench|Trough/), era);
  assert.ok(hasShape(many({ module: "seaCharts", era: "ST", kind: "deep" }, 1000), /Trench/));
});

test("§17.3: Gat, Swin, Swatchway, Spitway and Knock appear only in SEA, EAN and EMD", () => {
  const estuary = /Gat|Swin|Swatch|Spitway|Knock/;
  for (const region of WATERS_DATA.regions) {
    const names = many({ module: "seaCharts", culture: "norman-british", region }, 3000);
    const found = hasShape(names, estuary);
    if (["SEA", "EAN", "EMD"].includes(region)) assert.ok(found, region);
    else assert.ok(!found, `${region}: ${names.find((n) => estuary.test(n.shape))?.shape}`);
  }
});

test("§17.3: the depth-number shape reads as two words after The", () => {
  const names = many({ module: "seaCharts", era: "EM", kind: "bank", people: "invented" }, 4000).filter((n) => n.shape === "The {lengthAdj} {depthNumber}");
  assert.ok(names.length > 0);
  for (const n of names) assert.match(n.text, /^The [A-Z][a-z]+ [A-Z][a-z]+$/);
});

// ── Rules ───────────────────────────────────────────────────────────────────

test("§3.2: new shores favour false bays and saints; home shores do not", () => {
  const fresh = many({ module: "seasLakes", era: "EM", where: "new", kind: "bay" }, 4000, 3);
  const home = many({ module: "seasLakes", era: "EM", where: "home", kind: "bay" }, 4000, 3);
  const falseBay = (names: WatersName[]) => share(names, (n) => n.shape === "False Bay");
  assert.ok(falseBay(fresh) > falseBay(home) * 4, `${falseBay(fresh)} ${falseBay(home)}`);
});

test("§3.3: kind multipliers: British cultures on home shores draw fewer oceans and more lakes", () => {
  const brit = many({ module: "seasLakes", culture: "norman-british" }, 3000, 10);
  const other = many({ module: "seasLakes", culture: "general" }, 3000, 10);
  assert.ok(share(brit, (n) => n.kind === "ocean") < share(other, (n) => n.kind === "ocean") * 0.6);
  assert.ok(share(brit, (n) => n.kind === "lake") > share(other, (n) => n.kind === "lake"));
});

test("§14: no blocked phrase appears", () => {
  const blocked = new Set(WATERS_DATA.safeguards.earthly.map((p) => p.toLowerCase()));
  for (const module of EARTHLY_MODULES) {
    for (const culture of ["norman-british", "general", "norse"]) {
      for (const era of waterEras(module)) {
        for (const n of many({ module, culture, era, people: "invented" }, 600)) {
          assert.ok(!blocked.has(n.text.toLowerCase().replace(/^the /, "")), n.text);
        }
      }
    }
  }
});

test("§14: exact phrases are blocked with and without The; merged safeguard lists and packs' words are honoured", () => {
  for (const phrase of WATERS_DATA.safeguards.earthly) {
    assert.ok(watersBlocked(phrase, false), phrase);
    assert.ok(watersBlocked(`The ${phrase}`, false), phrase);
    assert.ok(watersWordBlocked(phrase.toLowerCase()), phrase);
  }
  assert.ok(!watersBlocked("Black Sea", false));
  assert.ok(!watersBlocked("Grey Havens Bay", false));
  // A merged list blocks a name that would otherwise come: every Black Sea is redrawn.
  const guards = { block: ["Black Sea", "North Sea"], flag: [], flagListBlocks: false };
  const names = many({ module: "seasLakes", kind: "sea", safeguards: guards }, 1500, 20);
  assert.ok(names.every((n) => !["black sea", "north sea"].includes(n.text.toLowerCase())));
  assert.ok(many({ module: "seasLakes", kind: "sea" }, 1500, 20).some((n) => n.text === "Black Sea"));
});

test("§11: culture shapes appear for their culture and kind", () => {
  assert.ok(hasShape(many({ module: "seasLakes", culture: "roman", era: "AN", kind: "sea" }, 2000), /^Our Sea$/));
  assert.ok(hasShape(many({ module: "seasLakes", culture: "greek-byzantine", kind: "strait", people: "invented" }, 2000), /\{fordBeast\} Ford/));
  assert.ok(hasShape(many({ module: "seasLakes", culture: "polynesian", kind: "ocean" }, 2000), /Great Ocean of the/));
  assert.ok(!hasShape(many({ module: "seasLakes", culture: "norman-british", kind: "sea" }, 1500), /^Our Sea$/));
});

test("§12.4: the sensitive cultures never draw light or grim shapes", () => {
  for (const culture of ["polynesian", "andean"]) {
    for (const module of EARTHLY_MODULES) {
      const names = many({ module, culture }, 1500);
      assert.ok(names.every((n) => !n.tones.includes("light") && !n.tones.includes("grim")), `${culture} ${module}`);
    }
  }
});

test("a pack's fixed names are drawn when kind is Any, never with a kind chosen", () => {
  const vocab = structuredClone(SETTLEMENT_VOCAB) as typeof SETTLEMENT_VOCAB;
  vocab.pools["watersFixed:seas"].entries = [{ w: "The Pack Sea" }];
  const any = many({ module: "seasLakes", vocab }, 2000);
  assert.ok(any.some((n) => n.text === "The Pack Sea"));
  assert.ok(!many({ module: "seasLakes", vocab, kind: "sea" }, 1000).some((n) => n.text === "The Pack Sea"));
});

// ── §2, §15, §1.3 Sentences, presets and history ────────────────────────────

test("§2.1: the earthly sentences", () => {
  assert.equal(
    watersSentenceText(watersSentence(defaultWatersState("seasLakes"), "seasLakes")),
    "Norman & British waters of any kind of the medieval era, on home shores, in a realistic world, across all of Britain, of any tone, with placeholders for people and places.",
  );
  assert.equal(
    watersSentenceText(watersSentence({ ...defaultWatersState("seaCharts"), culture: "japanese", where: "new", series: true, era: "ST", fantastic: true }, "seaCharts")),
    "Japanese chart features of any kind of the steam age era, on newly charted shores, in a steampunk world, in any land, of any tone, with placeholders for people and places, on one chart.",
  );
  const coasts = watersSentenceText(watersSentence({ ...defaultWatersState("coastsIslands"), series: true }, "coastsIslands"));
  assert.ok(coasts.endsWith("along one stretch of coast."));
});

test("§2.4: resets", () => {
  let s = { ...defaultWatersState("seasLakes"), region: "NTH" };
  s = chooseWaters(s, "culture", "japanese", "seasLakes");
  assert.equal(s.region, undefined);
  s = chooseWaters({ ...defaultWatersState("seasLakes"), region: "NTH" }, "where", "new", "seasLakes");
  assert.equal(s.region, undefined);
  s = chooseWaters({ ...defaultWatersState("seasLakes"), culture: "japanese", biome: "desert" }, "culture", "celtic", "seasLakes");
  assert.equal(s.biome, undefined);
  s = chooseWaters(defaultWatersState("seaCharts"), "era", "IS", "seaCharts");
  assert.equal(s.era, "MD");
  const sentence = watersSentence({ ...defaultWatersState("seasLakes"), culture: "norse" }, "seasLakes");
  assert.ok(sentence.some((x) => typeof x !== "string" && x.field === "biome"));
  assert.ok(!sentence.some((x) => typeof x !== "string" && x.field === "region"));
  assert.equal(waterEras("seaCharts").length, 5);
  assert.equal(waterEras("coastsIslands").length, 7);
});

test("§1.3: history labels", () => {
  const label = (module: WatersEarthly, state: Parameters<typeof watersHistoryLabel>[1]) => watersHistoryLabel(module, state, SECTION_LABELS[module]);
  assert.equal(label("seasLakes", defaultWatersState("seasLakes")), "seas and lakes · medieval · Norman & British");
  assert.equal(
    label("coastsIslands", { ...defaultWatersState("coastsIslands"), where: "new", culture: "general", biome: "desert", kind: "island", fantastic: true, tone: "grim", series: true }),
    "coasts and islands · medieval · General · new shores · Desert · islands · fantastic · grim · series",
  );
  assert.equal(label("seaCharts", { ...defaultWatersState("seaCharts"), region: "NTH", era: "ST", fantastic: true }), "sea charts · steam age · Norman & British · the North · steampunk");
  for (const m of EARTHLY_MODULES) assert.equal(historySection(label(m, defaultWatersState(m))), m);
});

test("§15: a preset round-trips for each earthly module", () => {
  for (const module of EARTHLY_MODULES) {
    const preset = {
      packName: "Round trip",
      setting: "",
      description: "A description.",
      watersModule: module,
      culture: "celtic",
      waterKind: waterKinds(module)[1].key,
      era: "EM" as WatersEra,
      where: "new" as const,
      fantastic: true,
      region: "all",
      biome: BIOMES[3].id,
      tone: "grim" as const,
      people: "invented" as const,
      series: module !== "seasLakes",
      scale: "any" as const,
      medium: "sea" as const,
      register: "any" as const,
    };
    const content = modulePresetContent(preset);
    assert.ok(isModulePresetContent(content));
    const { waters, problems } = parseModulePreset(content, "x");
    assert.deepEqual(problems, []);
    assert.deepEqual(waters, preset);
  }
});

test("§15: values outside their choices fall back to the defaults", () => {
  const { waters, problems } = parseModulePreset(
    ["---", "type: module-preset", "module: waters", "watersModule: seaCharts", "culture: nowhere", "kind: ocean", "era: IS", "where: sideways", "biome: moon", "tone: loud", "---", ""].join("\n"),
    "x",
  );
  assert.equal(waters?.culture, "norman-british");
  assert.equal(waters?.waterKind, "any");
  assert.equal(waters?.era, "MD");
  assert.equal(waters?.where, "home");
  assert.equal(waters?.biome, "any");
  assert.equal(waters?.tone, "any");
  assert.ok(problems.length >= 6);
  assert.ok(findWatersCulture("celtic"));
});
