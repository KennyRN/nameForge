// Wild lands brief §16.1: the line-up, the data, the pools, and the engine's basics.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vocab from "../src/data/settlement-vocab.json";
import { GROUP_LABELS, historySection, SECTION_GROUPS, SECTION_LABELS, SECTION_ORDER, SWITCHER_ORDER, WATERS_SECTIONS, WILDS_SECTIONS } from "../src/sections";
import { generateWildsNames, WILDS_CULTURES, WILDS_DATA, WILDS_MODULES, type WildsShape } from "../src/wilds/engine";
import { chooseWilds, defaultWildsState, wildsHistoryLabel, wildsSentence, wildsSentenceText } from "../src/wilds/sentence";

const pools = (vocab as unknown as { pools: Record<string, { entries: unknown[] }> }).pools;
const SOURCES = new Set(["town", "number", "folk", "person", "kingdom", "holy", "god", "river", "beast", "tree", "stock"]);
const CULTURE_KEYS = new Set(WILDS_CULTURES.map((c) => c.key));
const FUSE_POOLS = new Set(["wildFuse", "lakeFuse", "mythFuse"]);

const allShapes = (): { module: string; kind: string; shape: WildsShape }[] => [
  ...Object.entries(WILDS_DATA.shapes).flatMap(([module, kinds]) => Object.entries(kinds).flatMap(([kind, shapes]) => shapes.map((shape) => ({ module, kind, shape })))),
  ...WILDS_DATA.cultureShapes.map((s) => ({ module: s.module as string, kind: s.kind, shape: s })),
];

// ── Line-up (§1.1) ─────────────────────────────────────────────────────────

test("line-up: the wild lands group holds the six modules, straight after seas and coasts", () => {
  assert.deepEqual(WILDS_SECTIONS, ["mountainNames", "forestNames", "desertNames", "moorNames", "wetlandNames", "grasslandNames"]);
  assert.deepEqual(WILDS_MODULES, WILDS_SECTIONS);
  assert.deepEqual(SECTION_GROUPS.wildLands, WILDS_SECTIONS);
  assert.equal(GROUP_LABELS.wildLands, "wild lands");
  assert.deepEqual(
    SWITCHER_ORDER,
    ["markov", "placeNames", "urban", "seasCoasts", "wildLands", "groupNames", "bynames", "vehicles", "namedThings", "advanced"],
  );
  const order = SECTION_ORDER;
  assert.equal(order.indexOf("mountainNames"), order.indexOf(WATERS_SECTIONS.at(-1)!) + 1);
  assert.deepEqual(WILDS_SECTIONS.map((s) => SECTION_LABELS[s]), ["mountains", "forests and woods", "deserts", "moors and heaths", "wetlands", "grasslands"]);
});

test("history: each module's label routes to its own section, and no other label is mistaken for one", () => {
  for (const s of WILDS_SECTIONS) assert.equal(historySection(`${SECTION_LABELS[s]} · medieval · Norman & British`), s);
  for (const [label, section] of [["mountains · medieval · General", "mountainNames"], ["moors and heaths · medieval · General", "moorNames"]] as const) assert.equal(historySection(label), section);
  assert.equal(historySection("seas and lakes · medieval · General"), "seasLakes");
  assert.equal(historySection("british place names · North"), "placeShapes");
  assert.equal(historySection("settlement names · town · British"), "settlementNames");
  assert.equal(historySection("Mountain Hamlets"), "markov");
});

// ── Data (§16.1) ───────────────────────────────────────────────────────────

test("data: every token of every shape is a source, a pool or a {@kind} of its own module", () => {
  for (const { module, kind, shape } of allShapes()) {
    for (const m of shape.p.matchAll(/\{([^}:]+)(?::(pl|poss))?\}/g)) {
      const t = m[1];
      if (t.startsWith("@")) {
        const target = t.slice(1);
        const kinds = WILDS_DATA.modules[module as keyof typeof WILDS_DATA.modules].kinds.map((k) => k.key);
        assert.ok(kinds.includes(target) && target !== "settlement", `${module}/${kind}: ${shape.p}`);
        assert.equal(kind, "settlement", `${shape.p}: only settlements refer to features`);
      } else assert.ok(SOURCES.has(t) || pools[t], `${module}/${kind}: ${shape.p} → ${t}`);
    }
  }
});

test("data: tags, cultures and sizes are valid", () => {
  for (const { module, kind, shape } of allShapes()) {
    const where = `${module}/${kind}: ${shape.p}`;
    if (shape.rt) assert.ok(WILDS_DATA.regionTags[shape.rt], `${where} rt ${shape.rt}`);
    if (shape.bt) assert.ok(WILDS_DATA.biomeTags[shape.bt], `${where} bt ${shape.bt}`);
    for (const c of shape.c ?? []) assert.ok(CULTURE_KEYS.has(c.replace(/^!/, "")) || ["british", "christian"].includes(c.replace(/^!/, "")), `${where} c ${c}`);
    for (const c of Object.keys(shape.cx ?? {})) assert.ok(CULTURE_KEYS.has(c), `${where} cx ${c}`);
    if (shape.sz) assert.match(shape.sz, /^[hvtcg]+$/, where);
    if (shape.st) assert.match(shape.st, /^[hvtcg]+$/, where);
    if (shape.sz) assert.equal(kind, "settlement", `${where}: sz only on settlement shapes`);
    if (shape.st) assert.notEqual(kind, "settlement", `${where}: st only on feature shapes`);
    assert.ok(WILDS_DATA.cultureMult.general && (shape.f in { ...WILDS_DATA.where, ...Object.fromEntries(["qual", "twn", "col", "dir", "ppl", "per", "god", "crt", "flora", "shp", "sai", "unc", "work", "fixed", "mood", "myth", "alien", "riv", "set"].map((f) => [f, 1])) }), `${where} family ${shape.f}`);
  }
  for (const [tag, row] of Object.entries(WILDS_DATA.regionTags)) assert.deepEqual(Object.keys(row), WILDS_DATA.regions, tag);
  for (const [tag, row] of Object.entries(WILDS_DATA.biomeTags)) assert.deepEqual(Object.keys(row), WILDS_DATA.modules.mountainNames.biomes, tag);
});

test("data: fusion only ever follows wildFuse, lakeFuse or mythFuse", () => {
  for (const { module, kind, shape } of allShapes())
    for (const m of shape.p.matchAll(/\{([^}:]+)\}([a-z])/g)) assert.ok(FUSE_POOLS.has(m[1]), `${module}/${kind}: ${shape.p}`);
});

test("data: beast pools, kind multipliers and homelands exist", () => {
  for (const m of WILDS_MODULES) {
    assert.ok(pools[WILDS_DATA.beastPools[m]], m);
    assert.ok(WILDS_DATA.modules[m].biomes.includes(WILDS_DATA.modules[m].defaultBiome), m);
    assert.equal(WILDS_DATA.modules[m].kinds.at(-1)!.key, "settlement", m);
    assert.ok(Object.keys(WILDS_DATA.shapes[m]).every((k) => WILDS_DATA.modules[m].kinds.some((x) => x.key === k)), m);
  }
  for (const id of [...Object.keys(WILDS_DATA.kindMult.britishHome), ...Object.keys(WILDS_DATA.kindMult.biome)]) {
    const [m, k] = id.split(".");
    assert.ok(WILDS_DATA.modules[m as keyof typeof WILDS_DATA.modules].kinds.some((x) => x.key === k), id);
  }
  for (const c of WILDS_CULTURES) assert.ok(WILDS_DATA.homeland[c.key], c.key);
});

// ── Pools (§5) ─────────────────────────────────────────────────────────────

test("pools: every pool of wilds-pools.json is in settlement-vocab.json, unchanged, and no other pool was added", () => {
  const added = JSON.parse(readFileSync("tests/fixtures/wilds-pools.json", "utf8")).pools as Record<string, { entries: unknown[] }>;
  assert.equal(Object.keys(added).length, 51);
  for (const [name, pool] of Object.entries(added)) assert.deepEqual(pools[name].entries, pool.entries, name);
  // 253 earlier pools, the 51 wild pools, and monuments and statues' 27 (docs/monuments-and-statues-brief.md §4).
  assert.equal(Object.keys(pools).length, 253 + 51 + 27);
  for (const name of ["direction", "directionAdj", "explorerMood", "folkUncanny", "devilFeature", "gateWord", "lakeQuality", "lakeCreature", "lakeFuse", "lakeShape", "stackGroup", "fordBeast", "mariaWord"]) assert.ok(pools[name], name);
});

test("pools: mythBeast and mythFuse entries are fantastic-only", () => {
  for (const name of ["mythBeast", "mythFuse"]) for (const e of pools[name].entries as { h?: boolean }[]) assert.equal(e.h, true, name);
});

// ── Engine basics ──────────────────────────────────────────────────────────

test("engine: same options and seed give the same batch; names are unique and within the cap", () => {
  for (const module of WILDS_MODULES) {
    const a = generateWildsNames({ module, culture: "norman-british", people: "invented", count: 40, seed: 3 });
    const b = generateWildsNames({ module, culture: "norman-british", people: "invented", count: 40, seed: 3 });
    assert.deepEqual(a.names.map((n) => n.text), b.names.map((n) => n.text), module);
    assert.equal(a.names.length, 40, module);
    assert.equal(new Set(a.names.map((n) => n.text.toLowerCase())).size, 40, module);
    for (const n of a.names) assert.ok(n.text.split(/\s+/).length <= WILDS_DATA.cap, n.text);
  }
});

test("engine: every culture and era gives names in every module", () => {
  for (const module of WILDS_MODULES)
    for (const culture of WILDS_CULTURES)
      for (const era of WILDS_DATA.modules[module].eras) {
        const batch = generateWildsNames({ module, culture: culture.key, era, count: 8, seed: 11, people: "invented" });
        assert.ok(batch.names.length >= 4, `${module} ${culture.key} ${era}: ${batch.names.length}`);
      }
});

test("sentence: the default reads as the brief's example, and resets follow §2.3", () => {
  const state = defaultWildsState("mountainNames");
  assert.equal(
    wildsSentenceText(wildsSentence(state, "mountainNames")),
    "Norman & British mountain features of any kind of the medieval era, in home country, in a realistic world, across all of Britain, of any tone, with placeholders for people and places, each one separate.",
  );
  assert.equal(defaultWildsState("desertNames").culture, "general");
  // Biome shows instead of region for other cultures and for new country, and never offers a biome the module doesn't.
  const roman = chooseWilds(state, "culture", "roman", "mountainNames");
  assert.match(wildsSentenceText(wildsSentence(roman, "mountainNames")), /in any land/);
  assert.equal(chooseWilds({ ...roman, biome: "highland" }, "biome", "desert", "forestNames").biome, undefined);
  // Region survives a culture change (it just stops applying).
  assert.equal(chooseWilds({ ...state, region: "NTH" }, "culture", "roman", "mountainNames").region, "NTH");
  // Walks aren't live in the ancient era: the kind resets.
  assert.equal(chooseWilds({ ...defaultWildsState("forestNames"), kind: "walk" }, "era", "AN", "forestNames").kind, undefined);
  assert.match(wildsHistoryLabel("mountainNames", { ...state, where: "new", region: "NTH", kind: "pass", tone: "grim", series: true }, "mountains"), /^mountains · medieval · Norman & British · new country · .*passes and cols · grim · series$/);
});

// ── Town stems (§4.1) ──────────────────────────────────────────────────────

import { biomeStems, resolveWildsBiome, stemSourceOf, stemWeight, wildsStemPool } from "../src/wilds/engine";

const STOP = new Set(
  "Hill Hills Ridge Edge Island Isle Isles Marsh Marshes Fen Fens Moor Moors Lake Mere Pool Pond Water Waters River Brook Beck Burn Dale Valley Vale Wood Woods Forest Heath Down Downs Pass Gap Bank Bay Shore Cape Point Head Ness Cliff Cliffs Crag Rock Rocks Stone Stones Holm Spring Springs Well Wells Mound Knoll Slope Spur Top Moss Mount Mountain Mountains Peak Glen Combe Fell Tor Gorge Field Fields Meadow Meadows Plain Plains Common Wash Creek Sands Dune Dunes Oasis Grove Copse Clearing Glade Lawn Hollow Cove Sound Bottom Bottoms Barrow Cave Caves Fjord Waterfall Falls Paddy Mouth Source Village Town City Market Manor Farm Cottages Cottage Enclosure County District Prefecture Fort Fortress Camp Homestead Estate Court Hall House Houses Temple Church Chapel Minster Abbey Priory Castle Palace Mansion Seat Station Post Harbour Port Haven Landing"
    .toLowerCase()
    .split(" "),
);
const townFills = (names: { words: { pool: string; word: string }[] }[]) => names.flatMap((n) => n.words.filter((w) => w.pool === "town").map((w) => w.word));

test("stems: across 5,000 invented names per module and every culture, a fill is one or two capitalised words with no apostrophe, never ends in a stop word and never repeats its generic", () => {
  const eras: WildsEra[] = ["AN", "MD", "EM", "ST", "MO", "NF", "IS"];
  for (const module of WILDS_MODULES) {
    let total = 0;
    let fills = 0;
    for (let i = 0; total < 5000; i++) {
      const culture = WILDS_CULTURES[i % WILDS_CULTURES.length].key;
      const names = generateWildsNames({ module, culture, era: eras[i % eras.length], where: i % 3 === 0 ? "new" : "home", people: "invented", count: 100, seed: 4000 + i }).names;
      total += names.length;
      for (const n of names) {
        for (const w of n.words.filter((x) => x.pool === "town")) {
          fills++;
          const words = w.word.split(/\s+/);
          const where = `${module} ${culture}: ${w.word} in ${n.text}`;
          assert.ok(words.length <= 2, where);
          assert.ok(!/['’]/.test(w.word), where);
          assert.ok(words.every((x) => /^\p{Lu}/u.test(x)), where);
          assert.ok(!STOP.has(words[words.length - 1].toLowerCase()), where);
        }
        if (n.words.some((x) => x.pool.startsWith("@"))) continue;
        // The generic: the pattern's literal words.
        const generics = n.shape.replace(/\{[^}]*\}/g, " ").toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
        for (const w of n.words.filter((x) => x.pool === "town")) {
          const last = w.word.toLowerCase().split(/\s+/).pop()!;
          for (const g of generics) assert.ok(last !== g && !(g.length >= 3 && last.endsWith(g)), `${module}: ${n.text}`);
        }
      }
    }
    assert.ok(fills > 500, `${module}: ${fills} fills`);
  }
});

test("stems: the all-Britain stem pool holds at least 80 names, Norse at least 150 and Japanese at least 40, before any fallback", () => {
  assert.ok(wildsStemPool("norse").length >= 150, `norse ${wildsStemPool("norse").length}`);
  assert.ok(wildsStemPool("japanese").length >= 40, `japanese ${wildsStemPool("japanese").length}`);
  assert.ok(wildsStemPool("britain").length >= 80, `britain ${wildsStemPool("britain").length}`);
  // Weights: one word ×3, two words ×1 (non-British only); three words, apostrophes and the generics never.
  assert.equal(stemWeight("Oxdale", true), 3);
  assert.equal(stemWeight("Wide Bridge", false), 1);
  assert.equal(stemWeight("Wide Bridge", true), 0);
  assert.equal(stemWeight("Moots", true), 0);
  assert.equal(stemWeight("Baths", true), 0);
  for (const bad of ["Badger Edge Hill", "Lord's Ford", "Fort", "Hills", "Moot", "Hartvillage", "Peacock City", "The Ford", "Wide hill", "Overlongname1", "Longestname"]) assert.equal(stemWeight(bad, false), 0, bad);
  // Greek & Byzantine, steppe, Polynesian and Andean have no stem source.
  for (const key of ["greek-byzantine", "steppe", "polynesian", "andean"]) assert.equal(stemSourceOf(WILDS_CULTURES.find((c) => c.key === key)!), undefined, key);
});

test("stems: no pool holds a duplicate, Moot, Moots, Bath, Baths or Isthmus", () => {
  for (const [source, region] of [["britain", undefined], ["britain", "NTH"], ["norse", undefined], ["japanese", undefined], ["maya", undefined], ["korean", undefined], ["chinese", undefined]] as const) {
    const names = wildsStemPool(source, region).map(([n]) => n.toLowerCase());
    assert.equal(new Set(names).size, names.length, `${source} ${region ?? ""}: duplicates`);
    assert.ok(!names.some((n) => /^(moots?|baths?|isthmus)$/.test(n)), `${source} ${region ?? ""}`);
  }
});

test("stems: Roman has no usable stems so every fill is a biome animal or tree; Norse's are its own", () => {
  const biome = resolveWildsBiome("mountainNames", "roman", "home", "mediterranean").biome;
  const extras = new Set(biomeStems(biome));
  const roman = townFills(generateWildsNames({ module: "mountainNames", culture: "roman", biome: "mediterranean", people: "invented", count: 300, seed: 5 }).names);
  assert.ok(roman.length > 50);
  assert.ok(roman.every((f) => extras.has(f)), roman.filter((f) => !extras.has(f)).join(", "));
  const boreal = new Set(biomeStems(resolveWildsBiome("mountainNames", "norse", "home", "boreal").biome));
  const norse = townFills(generateWildsNames({ module: "mountainNames", culture: "norse", biome: "boreal", people: "invented", count: 300, seed: 5 }).names);
  assert.ok(norse.length > 50);
  assert.ok(norse.every((f) => !boreal.has(f)), norse.filter((f) => boreal.has(f)).join(", "));
});

test("stems: placeholders mode still gives [place]", () => {
  const fills = townFills(generateWildsNames({ module: "mountainNames", culture: "norman-british", people: "placeholders", count: 200, seed: 6 }).names);
  assert.ok(fills.length > 20);
  assert.ok(fills.every((f) => f === "[place]"));
});

test("stems: the series anchor comes from the stem pool", () => {
  const pool = new Set(wildsStemPool("norse").map(([n]) => n));
  for (let seed = 1; seed <= 20; seed++) {
    const first = generateWildsNames({ module: "mountainNames", culture: "norse", people: "invented", series: true, count: 3, seed }).names[0];
    const fill = first.words.find((w) => w.pool === "town")!.word;
    assert.ok(pool.has(fill), `${seed}: ${first.text}`);
  }
});
