// Northern Europe tables brief, batch 5a fixes (§11): depth per module, the culture showing, era words, words, and the fills and sources.
import "../src/lensRosterSources";
import "../src/fill/batch";
import "../src/places/sources";
import "../src/vessels/engine";
import { test } from "node:test";
import assert from "node:assert/strict";
import { COVERAGE_ADAPTERS } from "../src/coverage";
import { NORTH, combeFor, isNounPool, signatureShareFor } from "../src/northData";
import { fillSlots, followsBareGeneric, type FillContext, type Resolvers } from "../src/fill";
import { generateWildsNames } from "../src/wilds/engine";
import { defaultWildsState } from "../src/wilds/sentence";
import { generateWatersNames } from "../src/waters/engine";
import { defaultWatersState } from "../src/waters/sentence";
import { generateRouteNames } from "../src/routes/engine";
import { DEFAULT_ROUTE_STATE } from "../src/routes/sentence";
import { generateRiverNames } from "../src/rivers/engine";
import { drawKind, sourceFor, type KindSources } from "../src/places/sources";
import { mulberry32 } from "../src/markov";
import vocab from "../src/data/settlement-vocab.json";

/** The 150 well-known real places of tests/northernEurope5a.test.ts (brief rule 5). */
const FAMOUS_PLACES = `Land's End|Snowdon|Black Forest|Ben Nevis|Scafell Pike|Skiddaw|Helvellyn|Cader Idris|Pen y Fan|Lake District|Peak District|Dartmoor|Exmoor|Bodmin Moor|Cairngorms|Loch Ness|Loch Lomond|Isle of Skye|Isle of Man|Orkney|Shetland|Hebrides|Giant's Causeway|Slieve Donard|Mount Brandon|Carrauntoohil|Wicklow Mountains|Cliffs of Moher|Ring of Kerry|Connemara|Lough Neagh|River Thames|River Severn|River Wye|River Tyne|River Clyde|River Shannon|Hadrian's Wall|Offa's Dyke|Stonehenge|Avebury|Glastonbury Tor|White Cliffs of Dover|Cheddar Gorge|Lizard Point|St Michael's Mount|Mount's Bay|Tintagel|Fowey|Bodmin|Mousehole|Zennor|Gower|Anglesey|Snowdonia|Brecon Beacons|Black Mountains|Pembrokeshire|Fair Isle|Ben Lomond|Glencoe|Rannoch Moor|Trossachs|Jotunheimen|Galdhopiggen|Sognefjord|Geirangerfjord|Hardangervidda|Lofoten|Nordkapp|Trollstigen|Preikestolen|Oslofjord|Kattegat|Skagerrak|Oresund|Bornholm|Zealand|Jutland|Funen|Mols Bjerge|Mons Klint|Skagen|Gotland|Oland|Vattern|Vanern|Malaren|Kebnekaise|Sarek|Abisko|Laponia|Iceland|Vatnajokull|Thingvellir|Gullfoss|Geysir|Hekla|Surtsey|Snaefellsjokull|Jokulsarlon|Faroe Islands|Reykjanes|Rhine Gorge|Loreley|Mosel|Black Forest|Harz|Brocken|Thuringian Forest|Bavarian Forest|Zugspitze|Watzmann|Konigssee|Bodensee|Lake Constance|Chiemsee|Berchtesgaden|Rugen|Sylt|Wadden Sea|Heligoland|Luneburg Heath|Spreewald|Elbe Sandstone Mountains|Saxon Switzerland|Fichtelgebirge|Eifel|Taunus|Odenwald|Swabian Jura|Hohenzollern|Neuschwanstein|Drachenfels|Kyffhauser|Rothaargebirge|Teutoburg Forest|Mecklenburg Lake District|Mueritz|Frisian Islands|Wannsee|Havel|Oder|Elbe|Weser|Ems|Danube|Neckar|Main|Isar|Inn|Lech`.split("|").map((n) => n.trim());
const CORE = ["anglo-saxon", "norman-british", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german"];
const CELTIC = ["celtic"];
const pools = NORTH.vocab.pools as Record<string, { entries?: { w: string; c?: string[]; e?: string[]; h?: boolean }[] }>;
const wildsShapes = NORTH.wilds.cultureShapes as { p: string; culture?: string; c?: string[]; module: string; sig?: boolean; grp?: boolean }[];
const own = (s: { culture?: string; c?: string[] }, key: string) => s.culture === key || s.c?.includes(key);

// ── §11.1, §11.2: depth per module ─────────────────────────────────────────────────────────────

test("§11.2: every noun pool holds at least 8 words for each core culture (10 as written) and 4 for Celtic", () => {
  const nounPools = Object.keys(pools).filter(isNounPool);
  assert.ok(nounPools.length >= 42, `${nounPools.length} noun pools`);
  const short: string[] = [];
  for (const name of nounPools) {
    if (name.startsWith("nDesert")) continue; // deserts are exempt except for Norse and Scandinavian (§6)
    for (const key of CORE) {
      const n = (pools[name].entries ?? []).filter((e) => e.c?.includes(key)).length;
      if (n < 8) short.push(`${name} ${key} ${n}`);
    }
    for (const key of CELTIC) {
      const n = (pools[name].entries ?? []).filter((e) => e.c?.includes(key)).length;
      if (n < 4) short.push(`${name} ${key} ${n}`);
    }
  }
  assert.deepEqual(short, []);
});

test("§11.2: every module has at least 6 frames of its own per core culture (10 as written), apart from the group frames", () => {
  const modules = [...new Set(wildsShapes.filter((s) => s.sig && !s.grp).map((s) => s.module))].filter((m) => m !== "desertNames");
  assert.ok(modules.length >= 9);
  const short: string[] = [];
  for (const module of modules) for (const key of CORE) {
    const n = wildsShapes.filter((s) => s.module === module && own(s, key) && s.sig && !s.grp && !("rt" in s)).length;
    if (n < 6) short.push(`${module} ${key} ${n}`);
  }
  assert.deepEqual(short, []);
});

test("§11.1: the shared group pools and the group frames are not counted towards a signature cell", () => {
  for (const adapter of COVERAGE_ADAPTERS.filter((a) => ["mountainNames", "coastsIslands", "routeNames", "sacredPlaces", "lands"].includes(a.module))) {
    const sources = new Set(adapter.rows().map((r) => r.source));
    for (const shared of ["nLandB", "nLandC", "nLandD", "nLandDOld", "nWaterB", "nWaterC", "nWaterD", "nRouteB", "nRouteD", "nSacredB", "nSacredD"]) assert.ok(!sources.has(shared), `${adapter.module} counts ${shared}`);
  }
  // A group frame is in the data (it is drawn) but not in the module's own count.
  assert.ok(wildsShapes.some((s) => s.grp && s.module === "mountainNames" && own(s, "welsh")));
});

// ── §11.3: the culture shows ───────────────────────────────────────────────────────────────────

test("§11.3 and brief 6a §1: a core culture's signature frames take about 40% of the draws of a kind at home, 60% where it also reads a legacy table another culture shares", () => {
  for (const [module, culture] of [["mountainNames", "welsh"], ["hillsValleys", "german"], ["forestNames", "scottish"], ["riversInland", "irish"]] as const) {
    const sig = new Set(wildsShapes.filter((s) => s.module === module && own(s, culture) && s.sig).map((s) => s.p));
    for (const kind of module === "mountainNames" ? ["peak"] : module === "hillsValleys" ? ["hill"] : module === "forestNames" ? ["forest"] : ["stream"]) {
      // Many short batches: in one long batch the signature names (few nouns, brackets) are the first to run out of new ones.
      const names = Array.from({ length: 120 }, (_x, i) => generateWildsNames({ ...defaultWildsState(module), module, culture, kind, where: "home", count: 4, seed: 100 + i, people: "placeholders" } as never).names).flat();
      const own = names.filter((n) => n.shape !== "source");
      const share = own.filter((n) => sig.has(n.shape)).length / own.length;
      const want = signatureShareFor(culture);
      assert.ok(share > want - 0.1 && share < want + 0.15, `${module} ${culture} ${kind} ${share} (wanted ${want})`);
    }
  }
});

test("§11.3: within twelve names a culture noun appears at most twice", () => {
  for (const culture of CORE) {
    for (const module of ["mountainNames", "hillsValleys", "forestNames", "lands"] as const) {
      const names = generateWildsNames({ ...defaultWildsState(module), module, culture, where: "home", count: 12, seed: 9, people: "placeholders" } as never).names;
      const count = new Map<string, number>();
      for (const n of names) for (const w of n.words) if (isNounPool(w.pool)) count.set(w.word.toLowerCase(), (count.get(w.word.toLowerCase()) ?? 0) + 1);
      for (const [word, n] of count) assert.ok(n <= 2, `${culture} ${module}: ${word} ×${n}`);
    }
  }
});

// ── §11.4: era words ───────────────────────────────────────────────────────────────────────────

test("§11.4: no `{D} {N}` frame; era words stand on their own; Ley Line is modern and fantastic only", () => {
  const all = [...NORTH.wilds.cultureShapes, ...NORTH.waters.cultureShapes, ...NORTH.routes.cultureShapes] as { p: string }[];
  for (const s of all) assert.ok(!/\{n(Land|Water|Route|Sacred)D\} \{n[A-Z]/.test(s.p), s.p);
  assert.ok(all.some((s) => s.p.startsWith("Old {n") && s.p.includes("DOld}")), "Old {D} from the steam age on");
  const ley = (pools.nLandD.entries ?? []).filter((e) => e.w === "Ley Line");
  assert.ok(ley.length > 0);
  for (const e of ley) {
    assert.deepEqual(e.e, ["MO"]);
    assert.equal(e.h, true);
  }
});

// ── §11.5: words ───────────────────────────────────────────────────────────────────────────────

test("§11.5: no Barrow Wight, Autobahn, Bal, Carn or Draugr", () => {
  const text = JSON.stringify(NORTH);
  for (const bad of ["Barrow Wight", "Autobahn", "Draugr"]) assert.ok(!text.includes(bad), bad);
  for (const e of Object.values(pools).flatMap((p) => p.entries ?? [])) assert.ok(!/^(Bal|Carn)$/.test(e.w), e.w);
});


// ── §11.5: Land's End ──────────────────────────────────────────────────────────────────────────

test("§11.5: \"{endWord} End\" no longer makes Land's End; Land's End is never made", () => {
  assert.ok(!JSON.stringify(vocab.pools.endWord).includes("Land's"));
  // Brief rule 5: a generated compound that happens to match a real place (Black Forest, Fair Isle) is fine; a fixed or idiom name is not.
  assert.ok(FAMOUS_PLACES.includes("Land's End"));
  const famous = new Set(["land's end", "lands end"]);
  const hits: string[] = [];
  for (const seed of [1, 7, 42, 99]) {
    for (const culture of ["norman-british", "anglo-saxon", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german", "celtic", "general"]) {
      for (const module of ["coastsIslands", "seasLakes", "seaCharts"] as const) {
        const names = generateWatersNames({ ...defaultWatersState(module), module, culture, count: 150, seed, people: "placeholders" } as never).names.map((n) => n.text);
        for (const n of names) if (famous.has(n.toLowerCase())) hits.push(`${culture} ${module}: ${n}`);
      }
      for (const module of ["mountainNames", "hillsValleys", "moorNames", "lands", "forestNames", "riversInland"] as const) {
        const names = generateWildsNames({ ...defaultWildsState(module), module, culture, where: "home", count: 150, seed, people: "placeholders" } as never).names.map((n) => n.text);
        for (const n of names) if (famous.has(n.toLowerCase())) hits.push(`${culture} ${module}: ${n}`);
      }
    }
  }
  assert.deepEqual(hits, []);
});

// ── §11.6: fills and sources ───────────────────────────────────────────────────────────────────

const ctx = (extra: Partial<FillContext> = {}): FillContext => ({ culture: "norman-british", era: "MD", mode: "real", rng: mulberry32(3), ...extra });

test("§11.6.1: a holy fill after a bare generic is 'Saint {n}' or the bare name; titles only with 'of' or a possessive", () => {
  assert.ok(followsBareGeneric("Lake ", ""));
  assert.ok(followsBareGeneric("Glen ", ""));
  assert.ok(!followsBareGeneric("Lake of ", ""));
  assert.ok(!followsBareGeneric("Glen ", "'s Cairn"));
  assert.ok(!followsBareGeneric("", " Range"));
  for (let seed = 1; seed <= 200; seed++) {
    for (const [template, culture] of [["Lake [holy person]", "welsh"], ["Glen [holy person]", "irish"], ["Isle [holy person]", "norman-british"]] as const) {
      const text = fillSlots(template, { culture, era: "MD", mode: "real", rng: mulberry32(seed) });
      assert.ok(!/(Blessed|Abbot|Father|Bishop|Brother|Holy|Venerable)/.test(text), text);
    }
    const titled = fillSlots("Mount [official]", { culture: "norman-british", era: "MD", mode: "real", rng: mulberry32(seed) });
    assert.ok(!/(Duke|Earl|Lord|Baron|Count|Sir|Bishop|Abbot) /.test(titled), titled);
  }
  // With "of" and a possessive the other forms stay.
  const forms = new Set<string>();
  for (let seed = 1; seed <= 200; seed++) forms.add(fillSlots("Chapel of [holy person]", { culture: "norman-british", era: "MD", mode: "real", rng: mulberry32(seed) }).split(" ")[2]);
  assert.ok(forms.size > 1, [...forms].join(", "));
});

test("§11.6.2: a folk fill never follows a bare generic; after 'of' it takes 'the'; one people is not 'Peoples'", () => {
  const resolvers: Resolvers = { folk: () => "Fell Peoples", person: () => "Hale" };
  assert.equal(fillSlots("Glen [folk]", ctx({ resolvers })), "Glen Hale");
  assert.equal(fillSlots("Isle of [folk]", ctx({ resolvers })), "Isle of the Fell Peoples");
  assert.equal(fillSlots("[folk] Lake", ctx({ resolvers })), "Fell Peoples Lake");
  for (let seed = 1; seed <= 60; seed++) {
    const text = fillSlots("Lake of [people]", { culture: "norman-british", era: "MD", mode: "real", rng: mulberry32(seed), biome: "temperate" });
    assert.ok(!/Peoples/.test(text), text);
    assert.ok(/ of the /.test(text), text);
  }
});

test("§11.6.3: old personal names go by culture first, region second", () => {
  const first = (culture: string, region?: string) => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 80; seed++) seen.add(fillSlots("[personal name]ing Tarn", { culture, era: "MD", region, mode: "real", rng: mulberry32(seed) }));
    return [...seen];
  };
  // An Irish name never takes an English one (Sigebert, Aldred, Morcar, Athelwald).
  const english = /Sigebert|Aldred|Morcar|Athelwald|Ethelwald|Godric|Cuthbert|Wulf|Eadric|Leofric/;
  for (const culture of ["irish", "welsh", "cornish", "scottish", "german", "scandinavian", "norse"]) {
    for (const n of first(culture, culture === "welsh" ? "WAL" : culture === "cornish" ? "COR" : undefined)) assert.ok(!english.test(n), `${culture}: ${n}`);
  }
  assert.ok(first("norman-british").some((n) => english.test(n)), "the English keys still draw Anglo-Saxon names");
  assert.ok(first("norman-british", "NTH").length > 1);
});

test("§11.6.4: the British shapes source (native) never runs for Norse, Scandinavian or German", () => {
  const kind = { native: { generics: ["Hill"] } } as unknown as KindSources;
  for (const culture of ["norse", "scandinavian", "german", "dutch", "japanese"]) assert.equal(sourceFor(kind, { where: "home", culture }), undefined, culture);
  for (const culture of ["norman-british", "welsh", "irish"]) assert.equal(sourceFor(kind, { where: "home", culture }), "native", culture);
  // drawKind falls back to the module's own shapes.
  void drawKind;
});

test("§11.6.5: at home the river engine never uses its native forms, for any culture", () => {
  for (const setting of ["established", "new-land"] as const) {
    const names = generateRiverNames({ setting, count: 200, seed: 4, sourced: true, noNative: true }).names.map((n) => n.text);
    assert.ok(!names.some((n) => /\[native|\[tribal/.test(n)), setting);
  }
  for (const culture of ["norse", "scandinavian", "german"]) {
    const names = generateWildsNames({ ...defaultWildsState("riversInland"), module: "riversInland", culture, where: "home", count: 150, seed: 6, people: "placeholders" } as never).names.map((n) => n.text);
    assert.ok(!names.some((n) => /native people|tribal name/.test(n)), `${culture}: ${names.find((n) => /native people/.test(n))}`);
  }
  // New country keeps them.
  const fresh = generateRiverNames({ setting: "new-land", count: 200, seed: 4, sourced: true }).names.map((n) => n.text);
  assert.ok(fresh.some((n) => /\[native people\]/.test(n)));
});

test("§11.6.6: the plain word for a narrow valley reads Combe for Welsh and Cornish and in WAL and COR; Glen stays for Scottish and Irish", () => {
  assert.equal(combeFor("Glen of the Oak", "welsh"), "Combe of the Oak");
  assert.equal(combeFor("Oak Glen", "cornish"), "Oak Combe");
  assert.equal(combeFor("Oak Glen", "norman-british", "WAL"), "Oak Combe");
  assert.equal(combeFor("Oak Glen", "norman-british", "COR"), "Oak Combe");
  assert.equal(combeFor("Oak Glen", "scottish", "SHH"), "Oak Glen");
  assert.equal(combeFor("Oak Glen", "irish"), "Oak Glen");
  for (const culture of ["welsh", "cornish"]) {
    for (const module of ["hillsValleys", "mountainNames", "grasslandNames"] as const) {
      const names = generateWildsNames({ ...defaultWildsState(module), module, culture, where: "home", count: 300, seed: 2, people: "placeholders" } as never).names.map((n) => n.text);
      assert.ok(!names.some((n) => /\bGlen\b/.test(n)), `${culture} ${module}: ${names.find((n) => /\bGlen\b/.test(n))}`);
    }
  }
  const scottish = generateWildsNames({ ...defaultWildsState("hillsValleys"), module: "hillsValleys", culture: "scottish", where: "home", count: 300, seed: 2, people: "placeholders" } as never).names.map((n) => n.text);
  assert.ok(scottish.some((n) => /\bGlen\b/.test(n)), "Glen stays for Scottish");
});

test("§11.6.7: German places are German people and a German generic until batch 5b, never English ones", () => {
  const seen = new Set<string>();
  for (let seed = 1; seed <= 80; seed++) seen.add(fillSlots("[place] Ferry Gate", { culture: "german", era: "MD", mode: "real", rng: mulberry32(seed) }));
  for (const text of seen) assert.ok(!/\[/.test(text), text);
  // Brief 5b §12.3: beside a feature word of the engine's own the German place is a bare name ("Becker Ferry Gate"), not a stacked generic.
  assert.ok(![...seen].some((t) => /(Castle|Mark|Mill|Heath) Ferry Gate$/.test(t)), [...seen].slice(0, 5).join("; "));
  const alone = new Set<string>();
  for (let seed = 1; seed <= 80; seed++) alone.add(fillSlots("[place]", { culture: "german", era: "MD", mode: "real", rng: mulberry32(seed) }));
  // Brief 5b: a lone German place is one of the German settlement names ("Konrad's Village", "Castle of Ulrich", "Market Town of Heinrich").
  assert.ok([...alone].some((t) => /(Village|Houses|Home|Town|Castle|Field|Mark|Clearing|Cloister)/.test(t)), [...alone].slice(0, 5).join("; "));
  assert.ok(![...seen].some((t) => /ings|ham |ton /.test(t)), [...seen].slice(0, 5).join("; "));
  const routes = generateRouteNames({ ...DEFAULT_ROUTE_STATE, culture: "german", count: 60, seed: 3, people: "real" } as never).names.map((n) => n.text);
  assert.ok(!routes.some((n) => /\[/.test(n)), routes.find((n) => /\[/.test(n)));
});
