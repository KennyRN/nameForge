// Northern Europe tables brief, batch 5a (§9): every core cell of the batch's modules meets its target (§6) or its exemption, the
// region words are drawn only for their cultures, a stored Celtic state reads as the nation, and no fixed name is a famous real place.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { COVERAGE_ADAPTERS, moduleCoverage } from "../src/coverage";
import { isLandModule } from "../src/lens";
import { NORTH } from "../src/northData";
import { generateWildsNames } from "../src/wilds/engine";
import { defaultWildsState } from "../src/wilds/sentence";
import { generateWatersNames } from "../src/waters/engine";
import { defaultWatersState } from "../src/waters/sentence";
import { generateRouteNames } from "../src/routes/engine";
import { DEFAULT_ROUTE_STATE } from "../src/routes/sentence";

const MODULES = ["routeNames", "sacredPlaces", "mountainNames", "forestNames", "moorNames", "wetlandNames", "grasslandNames", "lands", "farmland", "hillsValleys", "riversInland", "seasLakes", "coastsIslands", "seaCharts"];
const CORE = ["english", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german"];
const adapter = (m: string) => COVERAGE_ADAPTERS.find((a) => a.module === m)!;
const REGIONS: Record<string, string[]> = {
  english: ["WCY", "SEA", "EAN", "WMM", "EMD", "NTH", "SBL"], scottish: ["SBL", "SLO", "SHH", "NSI"],
  norse: ["DEN", "NOR", "SWE", "ICE"], scandinavian: ["DEN", "NOR", "SWE", "ICE"], german: ["NDT", "RHN", "MIT", "ALP", "OST"],
};

test("5a §6: every core culture has 30 signature words and 10 shapes in every module of the batch; Celtic 12 and 4", () => {
  const short: string[] = [];
  for (const m of MODULES) {
    const cov = moduleCoverage(adapter(m));
    for (const c of CORE) if (cov.cultures[c].words < 30 || cov.cultures[c].shapes < 10) short.push(`${m} ${c} ${cov.cultures[c].words}/${cov.cultures[c].shapes}`);
    if (cov.cultures.celtic.words < 12 || cov.cultures.celtic.shapes < 4) short.push(`${m} celtic ${cov.cultures.celtic.words}/${cov.cultures.celtic.shapes}`);
  }
  assert.deepEqual(short, []);
});

test("5a §6: deserts are exempt but hold the words; every region of every culture that reads regions has 6 entries", () => {
  const desert = moduleCoverage(adapter("desertNames"));
  for (const c of CORE) assert.ok(desert.cultures[c].words >= 12, `desertNames ${c}`);
  const short: string[] = [];
  for (const m of MODULES.filter((x) => adapter(x).regions)) {
    const regions = moduleCoverage(adapter(m)).regions!;
    for (const [culture, codes] of Object.entries(REGIONS)) {
      // Sea charts and coasts take German only through the north German coast.
      const wanted = culture === "german" && (m === "coastsIslands" || m === "seaCharts") ? ["NDT"] : codes;
      for (const code of wanted) if ((regions[code] ?? 0) < 6) short.push(`${m} ${culture} ${code} ${regions[code] ?? 0}`);
    }
  }
  assert.deepEqual(short, []);
});

test("5a §6: every core culture has 6 entries restricted to each era the module reads (the land band as one)", () => {
  const short: string[] = [];
  for (const m of MODULES) {
    const rows = adapter(m).rows();
    const eras = isLandModule(m) ? ["AN", "MD", "EM"] : ["AN", "MD", "EM", "ST", "MO"];
    for (const c of CORE) for (const e of eras) {
      const n = rows.filter((r) => r.cultures?.includes(c) && r.eras?.includes(e)).length;
      if (n < 6) short.push(`${m} ${c} ${e} ${n}`);
    }
  }
  assert.deepEqual(short, []);
});

test("5a §7: every culture has at least three fantastic words in every module of the batch, in its own lore", () => {
  const short: string[] = [];
  for (const m of MODULES) {
    const rows = adapter(m).rows();
    for (const c of [...CORE, "celtic"]) {
      const n = rows.filter((r) => r.type === "word" && r.cultures?.includes(c) && r.styles && r.styles.length > 0).length;
      if (n < 3) short.push(`${m} ${c} ${n}`);
    }
  }
  assert.deepEqual(short, []);
});

test("5a §4: a Scandinavian or German region word is drawn only for its own cultures", () => {
  for (const group of [NORTH.wilds, NORTH.waters]) {
    for (const [tag, cultures] of Object.entries(group.regionTagFor)) {
      for (const s of group.cultureShapes as { rt?: string; culture?: string }[]) if (s.rt === tag) assert.ok(cultures.includes(s.culture!), `${tag}: ${s.culture}`);
    }
  }
  // The words only the batch's region tags give (the older tables have their own Fjord, Beech Wood and Black Sands).
  const words = /Esker|Polder|Mudflat|Avalanche|Wadden|Bird Cliff|Black Sand Beach|Hot Spring|Lava Field|\bAlps\b|Vine Terraces|Brick Harbour|Pine and Sand|Wine Country/;
  const others = ["general", "norman-british", "anglo-saxon", "welsh", "scottish", "roman", "japanese", "aztec"];
  const seen: string[] = [];
  for (const culture of others) {
    for (const module of ["mountainNames", "hillsValleys", "farmland", "grasslandNames", "forestNames"] as const) {
      for (const where of ["home", "new"] as const) {
        const names = generateWildsNames({ ...defaultWildsState(module), module, culture, where, count: 150, seed: 11, people: "placeholders" } as never).names.map((n) => n.text);
        for (const n of names) if (words.test(n)) seen.push(`${culture} ${module}: ${n}`);
      }
    }
    for (const module of ["coastsIslands", "seasLakes", "seaCharts"] as const) {
      const names = generateWatersNames({ ...defaultWatersState(module), module, culture, count: 150, seed: 11, people: "placeholders" } as never).names.map((n) => n.text);
      for (const n of names) if (words.test(n)) seen.push(`${culture} ${module}: ${n}`);
    }
  }
  assert.deepEqual(seen, []);
});

test("5a §3.1: a stored Celtic state with a nation's region runs as that nation in every module of the batch that has a region link", () => {
  const same = (a: unknown, b: unknown) => assert.deepEqual(a, b);
  for (const [region, nation] of [["WAL", "welsh"], ["COR", "cornish"], ["SLO", "scottish"], ["SHH", "scottish"]] as const) {
    for (const seed of [1, 42]) {
      const run = (culture: string) => generateWildsNames({ ...defaultWildsState("mountainNames"), module: "mountainNames", culture, region, count: 10, seed } as never).names.map((n) => n.text);
      same(run("celtic"), run(nation));
      const route = (culture: string) => generateRouteNames({ ...DEFAULT_ROUTE_STATE, culture, region, count: 10, seed } as never).names.map((n) => n.text);
      same(route("celtic"), route(nation));
      const sea = (culture: string) => generateWatersNames({ ...defaultWatersState("coastsIslands"), module: "coastsIslands", culture, region, count: 10, seed } as never).names.map((n) => n.text);
      same(sea("celtic"), sea(nation));
    }
  }
});

/** At least 150 well-known real places (British, Scandinavian and German): none may be a fixed name of the batch. */
const FAMOUS = `Land's End|Snowdon|Black Forest|Ben Nevis|Scafell Pike|Skiddaw|Helvellyn|Cader Idris|Pen y Fan|Lake District|Peak District|Dartmoor|Exmoor|Bodmin Moor|Cairngorms|Loch Ness|Loch Lomond|Isle of Skye|Isle of Man|Orkney|Shetland|Hebrides|Giant's Causeway|Slieve Donard|Mount Brandon|Carrauntoohil|Wicklow Mountains|Cliffs of Moher|Ring of Kerry|Connemara|Lough Neagh|River Thames|River Severn|River Wye|River Tyne|River Clyde|River Shannon|Hadrian's Wall|Offa's Dyke|Stonehenge|Avebury|Glastonbury Tor|White Cliffs of Dover|Cheddar Gorge|Lizard Point|St Michael's Mount|Mount's Bay|Tintagel|Fowey|Bodmin|Mousehole|Zennor|Gower|Anglesey|Snowdonia|Brecon Beacons|Black Mountains|Pembrokeshire|Fair Isle|Ben Lomond|Glencoe|Rannoch Moor|Trossachs|Jotunheimen|Galdhopiggen|Sognefjord|Geirangerfjord|Hardangervidda|Lofoten|Nordkapp|Trollstigen|Preikestolen|Oslofjord|Kattegat|Skagerrak|Oresund|Bornholm|Zealand|Jutland|Funen|Mols Bjerge|Mons Klint|Skagen|Gotland|Oland|Vattern|Vanern|Malaren|Kebnekaise|Sarek|Abisko|Laponia|Iceland|Vatnajokull|Thingvellir|Gullfoss|Geysir|Hekla|Surtsey|Snaefellsjokull|Jokulsarlon|Faroe Islands|Reykjanes|Rhine Gorge|Loreley|Mosel|Black Forest|Harz|Brocken|Thuringian Forest|Bavarian Forest|Zugspitze|Watzmann|Konigssee|Bodensee|Lake Constance|Chiemsee|Berchtesgaden|Rugen|Sylt|Wadden Sea|Heligoland|Luneburg Heath|Spreewald|Elbe Sandstone Mountains|Saxon Switzerland|Fichtelgebirge|Eifel|Taunus|Odenwald|Swabian Jura|Hohenzollern|Neuschwanstein|Drachenfels|Kyffhauser|Rothaargebirge|Teutoburg Forest|Mecklenburg Lake District|Mueritz|Frisian Islands|Wannsee|Havel|Oder|Elbe|Weser|Ems|Danube|Neckar|Main|Isar|Inn|Lech`.split("|");

test("5a §1.1 rule 5: no fixed whole name of the batch is a famous real place (the test holds 150 or more)", () => {
  assert.ok(new Set(FAMOUS).size >= 150, `the list holds ${new Set(FAMOUS).size}`);
  const famous = new Set(FAMOUS.map((n) => n.toLowerCase()));
  const fixed: string[] = [];
  const all = [...NORTH.wilds.cultureShapes, ...NORTH.waters.cultureShapes, ...NORTH.routes.cultureShapes] as { p: string; f?: string }[];
  for (const s of all) if (s.f === "fixed") fixed.push(s.p);
  for (const pool of Object.values(NORTH.vocab.pools)) for (const e of pool.entries ?? []) fixed.push(String(e.w));
  for (const p of fixed) assert.ok(!famous.has(p.toLowerCase()), `${p} is a famous real place`);
});

test("5a: the batch's pools and shapes are all English words and tags the engines read", () => {
  for (const [name, pool] of Object.entries(NORTH.vocab.pools)) {
    assert.ok((pool.entries ?? []).length > 0, name);
    for (const e of pool.entries ?? []) assert.ok(/^[A-Za-z' -]+$/.test(String(e.w)), `${name}: ${e.w} (English letters only)`);
  }
});
