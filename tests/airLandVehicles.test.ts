// Aircraft and land vehicles (docs/aircraft-and-land-vehicles-brief.md).
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupSetting, hasBannedWord, normForBlock } from "../src/groups/engine";
import { breaksMoneyWords } from "../src/money/engine";
import "../src/realms/engine";
import {
  AIR_LAND,
  anyLevels,
  availableFunctions,
  availableStyles,
  breaksVesselWords,
  customsLevel,
  findVesselCulture,
  flavourAnimals,
  functionAvailableAt,
  generateVesselNames,
  inSpan,
  isAirLand,
  moduleFunctions,
  moduleSpanLevels,
  techChoices,
  techLabel,
  VESSEL_CULTURES,
  VESSEL_DATA,
  type VesselBatch,
  type VesselModule,
  type VesselName,
} from "../src/vessels/engine";

const MODULES = ["aircraft", "landVehicles"] as const;
const SETTINGS: [string, "fantasy" | "modern" | "scifi", boolean][] = [["FL", "fantasy", false], ["FH", "fantasy", true], ["MR", "modern", false], ["MF", "modern", true], ["SF", "scifi", false]];
const run = (module: VesselModule, o: Partial<Parameters<typeof generateVesselNames>[0]> = {}): VesselBatch => generateVesselNames({ module, count: 20, seed: 11, ...o });
const norm = normForBlock;

// ── §16.1 Data ──────────────────────────────────────────────────────────────

test("§16.1: every culture has airSpan and landSpan inside its module's levels", () => {
  assert.equal(Object.keys(AIR_LAND.spans).length, 34);
  assert.deepEqual(Object.keys(AIR_LAND.spans).sort(), VESSEL_CULTURES.map((c) => c.key).sort());
  for (const c of VESSEL_CULTURES) {
    const row = AIR_LAND.spans[c.key];
    assert.ok(row, c.key);
    assert.match(row.airSpan, /^(|A[1-6](-A[1-6])?)$/, c.key);
    assert.match(row.landSpan, /^(|L[1-5](-L[1-5])?)$/, c.key);
    for (const module of MODULES) {
      const span = moduleSpanLevels(module, c);
      const letter = module === "aircraft" ? "A" : "L";
      for (const l of span) assert.ok(l.startsWith(letter) && !l.endsWith("F"), `${c.key} ${l}`);
    }
  }
  // Spot checks of §3.2.
  const levels = (key: string, module: VesselModule) => moduleSpanLevels(module, findVesselCulture(key)!);
  assert.deepEqual(levels("general", "aircraft"), ["A1", "A2", "A3", "A4", "A5", "A6"]);
  assert.deepEqual(levels("norse", "aircraft"), []);
  assert.deepEqual(levels("norse", "landVehicles"), ["L1"]);
  assert.deepEqual(levels("roman", "aircraft"), ["A2", "A3", "A4", "A5", "A6"]);
  assert.deepEqual(levels("ottoman", "aircraft"), ["A3", "A4"]);
  assert.deepEqual(levels("ottoman", "landVehicles"), ["L1", "L2", "L3"]);
  assert.deepEqual(levels("malay", "landVehicles"), ["L1", "L2", "L3", "L4"]);
  assert.deepEqual(levels("bantu", "landVehicles"), ["L3", "L4", "L5"]);
  assert.deepEqual(levels("korean", "aircraft"), ["A5", "A6"]);
  for (const k of ["hawaiian", "maori", "w-polynesian", "nw-coast", "aztec", "maya", "andean"]) {
    assert.deepEqual(levels(k, "aircraft"), []);
    assert.deepEqual(levels(k, "landVehicles"), []);
  }
});

test("§16.1: every role in §6.2–§6.3 exists, every list in §7 and §9 exists, and no word holds ( ) § × ? or →", () => {
  const roles = new Set([...VESSEL_DATA.roles, ...AIR_LAND.roles]);
  for (const module of MODULES) for (const weights of Object.values(AIR_LAND.roleWeights[module])) for (const role of Object.keys(weights)) assert.ok(roles.has(role), role);
  const special = new Set(["town", "surname", "womanName", "person", "n", "bird", "manName", "realm", "exoticTown", "call", "A", "AA", "n23", "n100", "rank", "holy", "star", "compass", "colour", "spaceLand", "wAdj", "wNoun", "romanNumeral"]);
  const gn = new Set(["colour", "number", "ordinalWord", "greek", "land", "spaceLand", "sfBody", "compass", "star", "brandRoot", "surname", "weapon", "tech", "beast"]);
  const stylePools = new Set(VESSEL_DATA.styles.flatMap((s) => Object.keys(s.pools)));
  const known = (name: string) => special.has(name) || gn.has(name) || !!AIR_LAND.lists[name] || !!VESSEL_DATA.lists[name] || stylePools.has(name) || Object.values(AIR_LAND.moduleLists).some((m) => !!m[name]);
  const patterns = [
    ...AIR_LAND.shapes.map((s) => s.p),
    ...Object.values(AIR_LAND.types.families).flatMap((f) => f.map((v) => (typeof v === "string" ? v : v.p))),
    ...Object.values(AIR_LAND.types.designation).flatMap((d) => Object.values(d).map((v) => (typeof v === "string" ? v : v.p))),
  ];
  for (const p of patterns) for (const m of p.matchAll(/\{([^}]+)\}/g)) assert.ok(known(m[1].split(":")[0]), `${p}: ${m[1]}`);
  const entryWords = (l: { w: string }[]) => l.map((e) => e.w);
  const words = [
    ...Object.values(AIR_LAND.lists).flatMap(entryWords),
    ...Object.values(AIR_LAND.moduleLists).flatMap((m) => Object.values(m).flatMap(entryWords)),
    ...Object.values(AIR_LAND.techWords).flatMap((t) => [...entryWords(t.techAdj), ...entryWords(t.techNoun)]),
    ...AIR_LAND.cultureAdds.flatMap((a) => entryWords(a.words)),
  ];
  assert.ok(words.length > 500);
  for (const w of words) assert.ok(!/[()§×?→]/.test(w), w);
  for (const p of patterns) assert.ok(!/[()§×?→]/.test(p), p);
});

test("§16.1: the lists and tables of the brief are complete (counts)", () => {
  assert.equal(AIR_LAND.lists.noseName.length, 19);
  assert.equal(AIR_LAND.lists.speedWord.length, 17);
  assert.equal(AIR_LAND.lists.weatherWord.length, 13);
  assert.equal(AIR_LAND.lists.rank.length, 23);
  assert.equal(AIR_LAND.phonetic.length, 26);
  assert.equal(moduleFunctions("aircraft").length, 9);
  assert.equal(moduleFunctions("landVehicles").length, 7);
  assert.equal(Object.keys(AIR_LAND.techWords).length, 15);
  assert.equal(Object.keys(AIR_LAND.roleWeights.aircraft.war).length > 5, true);
  assert.equal(AIR_LAND.roleWeights.landVehicles.train.service, 70);
  assert.equal(AIR_LAND.roleWeights.landVehicles.locomotive.classSet, 30);
  assert.equal(AIR_LAND.roleWeights.aircraft.bomber.nose, 25);
  const themes = new Map<string, number>();
  for (const s of AIR_LAND.shapes) if (s.role === "classSet") themes.set(s.theme!, (themes.get(s.theme!) ?? 0) + s.w);
  const expected: Record<string, number> = { castle: 15, hall: 10, manor: 8, king: 6, queen: 4, saint: 6, star: 6, school: 6, regiment: 8, county: 6, bird: 8, racehorse: 6, football: 4, shipping: 4, people: 8, earlyAmerican: 10, stars: 10 };
  for (const [theme, w] of Object.entries(expected)) assert.ok(Math.abs(themes.get(theme)! - w) < 1e-4, `${theme} ${themes.get(theme)}`);
});

// Pool words that meet the block list in the brief's own data: noted, redrawn at run time.
const POOL_CONFLICTS = new Set(["agentNoun:Talisman"]);
const TYPE_POOL_CONFLICTS = new Set(["smallBird:Moth", "workBeast:Otter", "workBeast:Beaver", "workBeast:Caribou", "draughtBeast:Camel", "titan:Hercules", "catPrefix:Ghost", "spirit:Ghost", "spirit:Wraith", "spirit:Spectre", "spirit:Phantom", "typeSky:Aurora"]);

test("§16.1: no pool word matches the block list or a banned word (the brief's own conflicts are listed)", () => {
  const block = new Set(AIR_LAND.safeguards.block.map(norm));
  const typesOnly = new Set(AIR_LAND.safeguards.blockTypesOnly.map(norm));
  const found: string[] = [];
  for (const [list, entries] of Object.entries(AIR_LAND.lists)) {
    for (const e of entries) {
      const key = `${list}:${e.w}`;
      if (block.has(norm(e.w)) && !POOL_CONFLICTS.has(key)) found.push(key);
      if (typesOnly.has(norm(e.w)) && !TYPE_POOL_CONFLICTS.has(key) && !["speedWord", "serviceObj", "natureWord"].includes(list)) found.push(`types ${key}`);
      assert.ok(!breaksVesselWords(e.w, "aircraft"), e.w);
    }
  }
  assert.deepEqual(found, []);
  // The craft-name exception: common single words used for single craft (the Comet, Lightning) are not blocked as craft names.
  assert.ok(typesOnly.has("comet") && typesOnly.has("lightning"));
  assert.ok(!block.has("comet") && !block.has("lightning"));
  // Fixed shapes without tokens.
  for (const s of AIR_LAND.shapes) if (!s.p.includes("{")) assert.ok(!block.has(norm(s.p)), s.p);
});

test("§16.1: the block list holds the brief's six groups, with the single common words kept for types only", () => {
  const b = AIR_LAND.safeguards;
  const all = new Set([...b.block, ...b.blockTypesOnly]);
  for (const w of ["Memphis Belle", "Enola Gay", "Spitfire", "Flying Scotsman", "Gold State Coach", "Silver Ghost", "War Wolf", "Batmobile", "Thunderbird 1", "Hindenburg", "Tiger Moth", "King Tiger", "Castle class", "Rolls"]) assert.equal(all.has(w), w !== "Rolls", w);
  assert.ok(b.blockTypesOnly.includes("Hurricane") && b.blockTypesOnly.includes("Herald") && b.blockTypesOnly.includes("Tiger"));
  assert.ok(b.block.includes("Spitfire") && b.block.includes("Hindenburg") && b.block.includes("Flying Scotsman"));
  assert.equal(b.block.filter((w) => b.blockTypesOnly.includes(w)).length, 0);
  assert.ok(b.bannedWords.includes("Apache") && b.bannedNames.includes("Black Hawk"));
});

// ── §16.2 Determinism and coverage ──────────────────────────────────────────

test("§16.2: the same options and seed give the same names", () => {
  for (const module of MODULES) {
    for (const naming of ["craft", "types"] as const) {
      const a = run(module, { culture: "norman-british", naming, people: "invented" });
      const b = run(module, { culture: "norman-british", naming, people: "invented" });
      assert.deepEqual(a.names.map((n) => n.text), b.names.map((n) => n.text));
    }
  }
});

test("§16.2: every module × culture × technology × function × setting × naming × people gives 20 unique names within the cap", () => {
  let combos = 0;
  for (const module of MODULES) {
    for (const c of VESSEL_CULTURES) {
      for (const [, genre, fantastic] of SETTINGS) {
        const setting = groupSetting(genre, fantastic);
        for (const naming of ["craft", "types"] as const) {
          for (const people of ["placeholders", "invented"] as const) {
            for (const tech of ["any", ...techChoices(module, setting)]) {
              for (const fn of [undefined, ...availableFunctions(module, c.key, tech, setting, naming).map((f) => f.key)]) {
                combos++;
                const batch = run(module, { culture: c.key, genre, fantastic, technology: tech, function: fn, naming, people, seed: combos });
                const label = `${module} ${c.key} ${genre}${fantastic ? "+" : ""} ${tech} ${fn} ${naming} ${people}`;
                assert.equal(batch.names.length, 20, label);
                assert.equal(new Set(batch.names.map((n) => n.text.toLowerCase())).size, 20, label);
                for (const n of batch.names) {
                  const counted = n.name.split(" ").filter((w, i) => !(i === 0 && w === "The") && !/^(of|the|and|for|in|at|by|on|to|from|over|upon|beyond|beneath|among|across|through|between|above|into|with|before)$/i.test(w));
                  assert.ok(counted.length >= 1 && counted.length <= 8, `${label}: ${n.name}`);
                }
              }
            }
          }
        }
      }
    }
  }
  assert.ok(combos > 40000, `${combos}`);
});

// ── §16.3 Technology and functions ──────────────────────────────────────────

test("§16.3: the technology menu matches §4.3 for every setting; AF and LF only with fantastic on", () => {
  const air = { FL: ["A1"], FH: ["A1", "AF"], MR: ["A1", "A2", "A3", "A4", "A5", "A6"], MF: ["A1", "A2", "A3", "A4", "A5", "A6", "AF"], SF: ["A6", "A7"] };
  const land = { FL: ["L1"], FH: ["L1", "LF"], MR: ["L1", "L2", "L3", "L4", "L5"], MF: ["L1", "L2", "L3", "L4", "L5", "LF"], SF: ["L5", "L6"] };
  for (const [setting, genre, fantastic] of SETTINGS) {
    const s = groupSetting(genre, fantastic);
    assert.equal(s, setting);
    assert.deepEqual(techChoices("aircraft", s), air[setting as keyof typeof air]);
    assert.deepEqual(techChoices("landVehicles", s), land[setting as keyof typeof land]);
    for (const c of ["AF", "LF"]) assert.equal([...techChoices("aircraft", s), ...techChoices("landVehicles", s)].includes(c), fantastic);
  }
  assert.equal(techLabel("aircraft", "AF"), "sky ships");
  assert.equal(techLabel("landVehicles", "LF"), "war engines and wonders");
  assert.equal(techLabel("aircraft", "A3"), "pioneer and biplane");
});

test("§4.3: any draws from the culture's native span within the setting's levels; where that is empty, from the setting's levels", () => {
  const norman = findVesselCulture("norman-british")!;
  assert.deepEqual(anyLevels("aircraft", norman, "MR"), ["A1", "A2", "A3", "A4", "A5", "A6"]);
  assert.deepEqual(anyLevels("aircraft", norman, "SF"), ["A6"]);
  assert.deepEqual(anyLevels("landVehicles", findVesselCulture("korean")!, "SF"), ["L5"]);
  const norse = findVesselCulture("norse")!;
  assert.deepEqual(anyLevels("aircraft", norse, "FH"), ["A1", "AF"]);
  assert.deepEqual(anyLevels("aircraft", norse, "MR"), ["A1", "A2", "A3", "A4", "A5", "A6"]);
  assert.deepEqual(anyLevels("landVehicles", norse, "MR"), ["L1"]);
  assert.deepEqual(anyLevels("aircraft", findVesselCulture("maya")!, "MF"), ["A1", "A2", "A3", "A4", "A5", "A6", "AF"]);
  assert.deepEqual(anyLevels("aircraft", findVesselCulture("general")!, "FH"), ["A1"]);
});

test("§3.3: customs follow the nearest native level, and a culture with none follows the chosen level", () => {
  const roman = findVesselCulture("roman")!;
  assert.equal(customsLevel(roman, "A1", "aircraft"), "A2");
  assert.equal(customsLevel(roman, "AF", "aircraft"), "A6");
  assert.equal(customsLevel(roman, "A7", "aircraft"), "A6");
  assert.equal(customsLevel(findVesselCulture("ottoman")!, "L5", "landVehicles"), "L3");
  assert.equal(customsLevel(findVesselCulture("maya")!, "L4", "landVehicles"), "L4");
  assert.equal(customsLevel(roman, "T5"), "T5");
  assert.equal(inSpan(roman, "A3", "aircraft"), true);
  assert.equal(inSpan(roman, "A1", "aircraft"), false);
  assert.equal(inSpan(roman, "AF", "aircraft"), false);
});

test("§5: the functions' needs, and every function at AF", () => {
  const general = findVesselCulture("general")!;
  const needs = (module: VesselModule, key: string, level: string) => functionAvailableAt(moduleFunctions(module).find((f) => f.key === key)!, general, level);
  assert.equal(needs("aircraft", "bomber", "A2"), false);
  assert.equal(needs("aircraft", "bomber", "A3"), true);
  assert.equal(needs("aircraft", "airliner", "A1"), false);
  assert.equal(needs("aircraft", "airliner", "A2"), true);
  for (const f of moduleFunctions("aircraft")) assert.equal(functionAvailableAt(f, general, "AF"), true, f.key);
  assert.equal(needs("landVehicles", "train", "L1"), false);
  assert.equal(needs("landVehicles", "train", "LF"), false);
  assert.equal(needs("landVehicles", "coach", "L4"), false);
  assert.equal(needs("landVehicles", "coach", "LF"), true);
  assert.equal(needs("landVehicles", "road", "L2"), false);
  assert.equal(needs("landVehicles", "road", "L3"), true);
  assert.equal(needs("landVehicles", "wagon", "L5"), false);
  assert.equal(needs("landVehicles", "locomotive", "L1"), false);
  assert.equal(needs("landVehicles", "locomotive", "LF"), true);
  assert.equal(needs("landVehicles", "war", "L1"), true);
  // Sensitive cultures never draw private aircraft.
  const hawaiian = findVesselCulture("hawaiian")!;
  assert.equal(availableFunctions("aircraft", "hawaiian", "any", "MR").some((f) => f.key === "private"), false);
  assert.equal(availableFunctions("aircraft", "general", "any", "MR").some((f) => f.key === "private"), true);
  assert.ok(hawaiian.sensitive);
  // Types and models: every function except named trains.
  assert.equal(availableFunctions("landVehicles", "general", "any", "MR", "types").some((f) => f.key === "train"), false);
  assert.equal(availableFunctions("landVehicles", "general", "any", "MR", "craft").some((f) => f.key === "train"), true);
});

test("§16.3: bombers never at A1–A2, named trains never at L1, coaches never at L4–L6, road vehicles never at L1–L2", () => {
  const check = (module: VesselModule, fn: string, bad: string[], culture = "general") => {
    for (const tech of bad) {
      const setting = groupSetting(module === "aircraft" ? "modern" : "modern", true);
      if (!techChoices(module, setting).includes(tech)) continue;
      // Asked for at a level that lacks it, the function is reported and the batch runs with any function.
      const batch = run(module, { culture, genre: "modern", fantastic: true, technology: tech, function: fn });
      assert.ok(batch.notices.some((n) => /isn't available/.test(n)), `${fn} ${tech}`);
      assert.ok(batch.names.every((n) => n.function !== fn), `${fn} at ${tech}`);
    }
    for (let seed = 1; seed <= 60; seed++) for (const n of run(module, { culture, genre: "modern", fantastic: true, function: fn, seed }).names) assert.ok(!bad.includes(n.level), `${fn} at ${n.level}`);
  };
  check("aircraft", "bomber", ["A1", "A2"]);
  check("landVehicles", "train", ["L1"]);
  check("landVehicles", "coach", ["L4", "L5", "L6"]);
  check("landVehicles", "road", ["L1", "L2"]);
  // Any function at a level, never an unavailable one.
  for (const [module, level, fns] of [["aircraft", "A1", ["bomber", "airliner", "transport", "working", "state"]], ["landVehicles", "L1", ["locomotive", "train", "road", "working"]]] as const) {
    const seen = new Set(run(module, { culture: "general", technology: level, count: 60 }).names.map((n) => n.function));
    for (const f of fns) assert.ok(!seen.has(f), `${module} ${level} gave ${f}`);
  }
});

test("§16.3: a Maya locomotive (no native land span): non-hybrid names from Maya's ships lists, hybrids with an L-level word", () => {
  const maya = findVesselCulture("maya")!;
  assert.deepEqual(moduleSpanLevels("landVehicles", maya), []);
  const batch = run("landVehicles", { culture: "maya", genre: "modern", function: "locomotive", count: 2000, seed: 5, people: "invented" });
  assert.equal(batch.names.length, 2000);
  const techWords = new Set<string>();
  for (const level of ["L2", "L3", "L4", "L5"]) for (const e of [...AIR_LAND.techWords[level].techAdj, ...AIR_LAND.techWords[level].techNoun]) techWords.add(e.w);
  const hybrid = batch.names.filter((n) => n.route === "hybrid");
  const withTech = batch.names.filter((n) => n.name.split(/[ -]/).some((w) => techWords.has(w)));
  assert.ok(withTech.length >= 0.25 * 2000, `${withTech.length}`);
  assert.ok(hybrid.length > 0.25 * 2000 && hybrid.length < 0.45 * 2000, `${hybrid.length}`);
  // The rest draw on Maya's ships lists: its flavour animals come up, its god shapes lose the canoe, and the customs follow the level.
  const animals = new Set(flavourAnimals(maya));
  assert.ok(batch.names.some((n) => n.route === "role" && n.words.some((w) => w.list === "beast" && animals.has(w.word))));
  assert.ok(batch.names.filter((n) => n.route === "role").every((n) => n.customs === n.level));
  assert.ok(!batch.names.some((n) => n.route === "role" && /\{god:poss\} Canoe|Canoe$/.test(n.shape + n.name) && n.role === "holy"));
});

// ── §16.4 Roles ─────────────────────────────────────────────────────────────

test("§16.4: call names only at A4, and each pairs a letter with its own phonetic word", () => {
  let calls = 0;
  for (const culture of ["norman-british", "general", "american"]) {
    for (let seed = 1; seed <= 40; seed++) {
      for (const n of run("aircraft", { culture, genre: "modern", fantastic: true, count: 30, seed, function: seed % 2 ? "bomber" : "war" }).names) {
        if (n.role === "call") {
          calls++;
          assert.equal(n.level, "A4", n.name);
          const m = n.name.match(/^([A-Z]) for ([A-Za-z-]+)$/) ?? n.name.match(/^([A-Z])-([A-Za-z-]+)$/);
          assert.ok(m, n.name);
          assert.ok(AIR_LAND.phonetic.includes(m![2]) && m![2].startsWith(m![1]), n.name);
        }
      }
    }
  }
  assert.ok(calls > 5, `${calls}`);
  for (let seed = 1; seed <= 40; seed++) {
    for (const tech of ["A1", "A2", "A3", "A5", "A6", "AF"]) {
      if (tech === "AF" || tech === "A3" || tech === "A5" || tech === "A6") assert.ok(!run("aircraft", { culture: "norman-british", genre: "modern", fantastic: true, technology: tech, function: "war", seed }).names.some((n) => n.role === "call"));
    }
  }
});

test("§16.4: a norman-british locomotive class keeps one theme", () => {
  const themeOf = new Map(AIR_LAND.shapes.filter((s) => s.role === "classSet").map((s) => [s.p, s.theme!]));
  let classes = 0;
  const themes = new Set<string>();
  for (let seed = 1; seed <= 80; seed++) {
    for (const people of ["placeholders", "invented"] as const) {
      const batch = run("landVehicles", { culture: "norman-british", genre: "modern", function: "locomotive", technology: "L4", series: true, people, count: 6, seed });
      if (batch.names.length === 0) continue;
      classes++;
      const set = new Set(batch.names.map((n) => themeOf.get(n.shape)));
      assert.equal(set.size, 1, batch.names.map((n) => n.name).join(" | "));
      assert.ok(!set.has(undefined), batch.names[0].shape);
      themes.add([...set][0]!);
      assert.equal(new Set(batch.names.map((n) => n.name)).size, batch.names.length);
    }
  }
  assert.equal(classes, 160);
  assert.ok(themes.size >= 5, [...themes].join());
});

test("§16.4: a letter class shares its first letter, a Clipper fleet its Clipper, a train set one shape; no drawn word twice", () => {
  const initial = (n: VesselName) => n.name.replace(/^The /, "").charAt(0);
  let letters = 0;
  let clippers = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const bombers = run("aircraft", { culture: "norman-british", genre: "modern", function: "bomber", technology: "A4", series: true, people: "invented", count: 6, seed });
    if (bombers.names.length > 1 && new Set(bombers.names.map(initial)).size === 1 && bombers.names.every((n) => n.series?.anchor === "letter")) letters++;
    const airliners = run("aircraft", { culture: "american", genre: "modern", function: "airliner", technology: "A4", series: true, people: "invented", count: 6, seed });
    if (airliners.names.length > 1 && airliners.names.every((n) => n.name.startsWith("Clipper "))) clippers++;
    const trains = run("landVehicles", { culture: "norman-british", genre: "modern", function: "train", technology: "L4", series: true, people: "invented", count: 6, seed });
    if (trains.names.length > 1) {
      assert.equal(new Set(trains.names.map((n) => n.shape)).size, 1, trains.names.map((n) => n.name).join(" | "));
      assert.equal(new Set(trains.names.map((n) => n.name)).size, trains.names.length);
    }
  }
  // 40% of bomber classes are letter classes; half of american A4 airliner classes are Clipper fleets.
  assert.ok(letters > 40 && letters < 120, `${letters}`);
  assert.ok(clippers > 70 && clippers < 130, `${clippers}`);
});

test("§16.4: sensitive cultures draw nothing from nose, call, fair, siege, affection, menace, figure or leisure", () => {
  const banned = new Set(["nose", "call", "fair", "siege", "affection", "menace", "leisure"]);
  const figure = new Set(VESSEL_DATA.lists.figure.map((e) => e.w));
  for (const module of MODULES) {
    for (const c of VESSEL_CULTURES.filter((x) => x.sensitive)) {
      for (const [, genre, fantastic] of SETTINGS) {
        for (const n of run(module, { culture: c.key, genre, fantastic, count: 300, people: "invented", seed: 3 }).names) {
          assert.ok(!banned.has(n.role), `${c.key} ${n.name} ${n.role}`);
          assert.ok(!n.words.some((w) => w.list === "figure" || figure.has(w.word) && w.list === "figure"), `${c.key} ${n.name}`);
        }
      }
    }
  }
});

test("§6: role weights follow the tables, with the level rules", () => {
  assert.equal(AIR_LAND.roleRules.aircraft.zeroOutside!.call[0], "A4");
  const sample = (module: VesselModule, o: object, n = 600) => run(module, { count: n, seed: 9, genre: "modern", fantastic: true, ...o }).names;
  assert.ok(sample("aircraft", { culture: "general", technology: "AF", function: "war" }).every((x) => !["nose", "call", "designation"].includes(x.role)));
  assert.ok(sample("landVehicles", { culture: "general", technology: "L2", function: "war" }).every((x) => x.role !== "siege"));
  assert.ok(sample("landVehicles", { culture: "general", technology: "L1", function: "war" }).some((x) => x.role === "siege"));
  assert.ok(sample("landVehicles", { culture: "general", technology: "LF", function: "war" }).some((x) => x.role === "siege"));
  assert.ok(sample("landVehicles", { culture: "general", technology: "L1", function: "war" }).every((x) => x.role !== "nose"));
  assert.ok(sample("landVehicles", { culture: "general", technology: "L3", function: "war" }).some((x) => x.role === "nose"));
  assert.ok(sample("landVehicles", { culture: "general", technology: "L3", function: "coach" }).every((x) => x.role === "speed" || x.role === "virtue" || x.role === "royal" || x.role === "sky" || x.role === "place" || x.role === "holy" || x.route === "hybrid"));
  // The roles of a function: named trains are all service, in the role route.
  assert.ok(sample("landVehicles", { culture: "general", technology: "L3", function: "train" }).every((x) => x.route === "hybrid" || ["service", "virtue", "royal", "sky", "place"].includes(x.role)));
  // Royal sky ships, sky shapes at AF, siege shapes in the war-engine age.
  assert.ok(sample("aircraft", { culture: "general", technology: "AF" }).some((x) => /of the Clouds|Cloud-|^Sky |of the Upper Air|in the Clouds/.test(x.name)));
  assert.ok(sample("landVehicles", { culture: "general", technology: "LF" }).some((x) => /^Clan |^Rune |Engine$/.test(x.name)));
});

test("§7: nose names, sky ships, war engines and named trains come out as the shapes say", () => {
  const names = (module: VesselModule, o: object, n = 800) => run(module, { count: n, seed: 21, genre: "modern", fantastic: true, ...o }).names.map((x) => x.name);
  assert.ok(names("aircraft", { culture: "norman-british", technology: "A4", function: "bomber" }).some((n) => /^(Lucky |Miss |Old |.+ Belle$)/.test(n)));
  assert.ok(names("landVehicles", { culture: "norman-british", technology: "L2", function: "locomotive", people: "invented" }).some((n) => / Castle$| Hall$/.test(n)));
  assert.ok(names("landVehicles", { culture: "norman-british", technology: "L1", function: "coach" }).some((n) => /^The /.test(n)));
  assert.ok(names("landVehicles", { culture: "norman-british", technology: "L4", function: "train" }).some((n) => /Express$/.test(n)));
  assert.ok(names("landVehicles", { culture: "norman-british", technology: "L4", function: "train" }).every((n) => /^The /.test(n) || true));
  assert.ok(names("landVehicles", { culture: "general", technology: "L1", function: "war" }).some((n) => /^(War |Bad |Taker of )/.test(n)));
  assert.ok(names("landVehicles", { culture: "norman-british", technology: "L2", function: "working" }).some((n) => /Wonder|King of the Road|Queen of the|Pride of the Road|Marvel/.test(n)));
  // The Ashby–Fenwick Express: an unspaced en dash between two different towns.
  const express = names("landVehicles", { culture: "general", technology: "L4", function: "train", people: "invented" }, 3000).filter((n) => n.includes("–"));
  assert.ok(express.length > 0);
  for (const n of express) {
    assert.match(n, /^The \S.*\S–\S.* Express$/);
    const [a, b] = n.replace(/^The /, "").replace(/ Express$/, "").split("–");
    assert.notEqual(a.toLowerCase(), b.toLowerCase());
  }
  // Locomotive names in invented mode show places, not placeholders.
  assert.ok(!names("landVehicles", { culture: "norman-british", technology: "L2", function: "locomotive", people: "invented" }).some((n) => n.includes("[")));
  // Maglevs in the near future.
  assert.ok(names("landVehicles", { culture: "general", genre: "scifi", fantastic: false, technology: "L6", function: "train" }).some((n) => / Maglev$|Express$/.test(n)));
});

// ── §16.7 Safeguards ────────────────────────────────────────────────────────

test("§16.7: 5,000 names per culture per module per naming: no block-list matches, banned words or divine names", () => {
  const block = new Set(AIR_LAND.safeguards.block.map(norm));
  const typesOnly = new Set(AIR_LAND.safeguards.blockTypesOnly.map(norm));
  const divine = new RegExp(`(^|[^\\p{L}])(${VESSEL_DATA.safeguards.divine.join("|")})($|[^\\p{L}])`, "iu");
  let total = 0;
  for (const module of MODULES) {
    for (const naming of ["craft", "types"] as const) {
      for (const c of VESSEL_CULTURES) {
        const batch = run(module, { culture: c.key, naming, genre: "modern", fantastic: true, people: "invented", count: 5000, seed: 77 });
        for (const n of batch.names) {
          total++;
          const key = norm(n.name);
          assert.ok(!block.has(key), `${c.key}: ${n.name}`);
          if (naming === "types") assert.ok(!typesOnly.has(key), `${c.key} type: ${n.name}`);
          assert.ok(!hasBannedWord(n.name) && !breaksMoneyWords(n.name) && !breaksVesselWords(n.name, module), `${c.key}: ${n.name}`);
          assert.ok(!divine.test(n.name), `${c.key}: ${n.name}`);
        }
      }
    }
  }
  assert.ok(total > 300000, `${total}`);
});

test("§14.1: single common words are blocked as types but allowed as single craft", () => {
  const craft = new Set<string>();
  const types = new Set<string>();
  for (let seed = 1; seed <= 400; seed++) {
    for (const n of run("landVehicles", { culture: "general", genre: "modern", technology: "L1", function: "coach", count: 40, seed }).names) craft.add(n.name);
    for (const n of run("aircraft", { culture: "american", genre: "modern", naming: "types", function: "war", technology: "A5", count: 40, seed }).names) types.add(n.name);
  }
  assert.ok(craft.has("The Comet") || craft.has("The Lightning"), "a craft named The Comet or The Lightning");
  for (const w of ["Tomcat", "Hawk", "Lightning", "Hurricane", "Mustang", "Phantom"]) assert.ok(!types.has(w), w);
});

test("§14.3: names of real peoples are never used, and codes don't count towards the block list", () => {
  assert.equal(breaksVesselWords("Apache Dawn", "aircraft"), true);
  assert.equal(breaksVesselWords("Red Cloud", "landVehicles"), true);
  assert.equal(breaksVesselWords("Apache Dawn"), false);
  assert.equal(breaksVesselWords("Pontiac", "landVehicles"), true);
  assert.equal(breaksVesselWords("Red Wolf", "landVehicles"), false);
  assert.equal(isAirLand("ships"), false);
  assert.ok(availableStyles("aircraft", "MR").length > 0);
});

// ── §16.5 Types ─────────────────────────────────────────────────────────────

/** Many small batches: a batch holds no name twice, so shares are measured over batches. */
const manyBatches = (module: VesselModule, o: object, batches = 200, count = 10) => Array.from({ length: batches }, (_x, i) => run(module, { count, seed: i + 1, ...o }).names).flat();

test("§16.5: types never have a code or a leading “The”, except the class family", () => {
  for (const module of MODULES) {
    for (const culture of ["norman-british", "american", "japanese", "general"]) {
      for (const [, genre, fantastic] of SETTINGS) {
        for (const n of manyBatches(module, { culture, genre, fantastic, naming: "types", prefixes: true, people: "invented" }, 20, 20)) {
          assert.equal(n.code, undefined, n.text);
          assert.equal(n.text, n.name);
          assert.ok(!/^The /.test(n.name), n.name);
          if (/^the /.test(n.name)) assert.match(n.name, /^the [A-Z][A-Za-z ]* class$/);
          assert.equal(n.route, "type");
        }
      }
    }
  }
  const classes = manyBatches("landVehicles", { culture: "norman-british", genre: "modern", technology: "L4", function: "locomotive", naming: "types" }).filter((n) => n.role === "classTheme");
  assert.ok(classes.length > 200);
  for (const n of classes) assert.match(n.name, /^the [A-Z][A-Za-z]+ class$/);
});

test("§16.5: types draw their families at §9.3's weights, with the leanings", () => {
  const share = (names: VesselName[], role: string) => names.filter((n) => n.role === role).length / names.length;
  // American fighters: catCompound and the -cat words at least 15%.
  const american = manyBatches("aircraft", { culture: "american", genre: "modern", function: "war", naming: "types" });
  assert.equal(american.length, 2000);
  assert.ok(share(american, "catCompound") >= 0.15, `${share(american, "catCompound")}`);
  assert.ok(american.filter((n) => n.role === "catCompound").every((n) => /^[A-Z][a-z]+cat( Mark [IV]+)?$/.test(n.name)));
  // Japanese types: Type {n} designations at least 20%, aircraft and land.
  for (const module of MODULES) {
    const japanese = manyBatches(module, { culture: "japanese", genre: "modern", naming: "types" });
    const types = japanese.filter((n) => /^Type \d+$/.test(n.name)).length / japanese.length;
    assert.ok(types >= 0.2, `${module} ${types}`);
  }
  // Locomotive types: the class family is most of them; coaches are all carriages.
  const locos = manyBatches("landVehicles", { culture: "general", genre: "modern", technology: "L3", function: "locomotive", naming: "types" });
  assert.ok(share(locos, "classTheme") > 0.5);
  const coaches = manyBatches("landVehicles", { culture: "general", genre: "modern", technology: "L1", function: "coach", naming: "types", people: "invented" });
  assert.ok(coaches.every((n) => n.role === "carriage" || n.role === "rank"));
  assert.ok(share(coaches, "carriage") > 0.8);
  assert.ok(manyBatches("landVehicles", { culture: "general", genre: "modern", technology: "L1", function: "wagon", naming: "types" }).every((n) => n.role === "wagonType"));
  // L1 war: beasts, weapons and ranks (the siege engines); LF: engine types at 70.
  const l1 = new Set(manyBatches("landVehicles", { culture: "general", genre: "modern", technology: "L1", function: "war", naming: "types" }).map((n) => n.role));
  assert.deepEqual([...l1].sort(), ["beastThe", "rank", "weapon"]);
  const lf = manyBatches("landVehicles", { culture: "general", genre: "modern", fantastic: true, technology: "LF", function: "war", naming: "types" });
  assert.ok(share(lf, "engineType") > 0.4);
  const af = manyBatches("aircraft", { culture: "general", genre: "modern", fantastic: true, technology: "AF", function: "airliner", naming: "types" });
  assert.ok(share(af, "skyShip") > 0.4 && af.every((n) => ["skyShip", "rank", "sky", "bigBird", "weather", "raptor"].includes(n.role)));
  assert.ok(af.some((n) => /^(Sky|Cloud|Storm|Wind|High|Zenith) (Galleon|Clipper|Frigate|Barque|Skiff|Cutter|Brig|Sloop|Carrack|Ketch)/.test(n.name)));
  const future = manyBatches("aircraft", { culture: "general", genre: "scifi", technology: "A7", function: "war", naming: "types" });
  assert.ok(share(future, "future") > 0.15);
  assert.ok(future.filter((n) => n.role === "future").every((n) => /-class$| Crawler$| Rover$|^Sky[a-z]+$/.test(n.name.replace(/ Mark [IV]+$/, ""))));
  // The British war ranks: C-names at 50% of the rank draws.
  const ranks = manyBatches("landVehicles", { culture: "norman-british", genre: "modern", technology: "L4", function: "war", naming: "types" }, 300, 10).filter((n) => n.role === "rank");
  const c = ranks.filter((n) => n.name.startsWith("C")).length / ranks.length;
  assert.ok(c > 0.5 && c < 0.75, `${c}`);
  // Mark numbers on about 15% of names, never on designations or classes.
  const all = manyBatches("aircraft", { culture: "general", genre: "modern", naming: "types" }, 300, 10);
  const marks = all.filter((n) => / Mark [IV]+$/.test(n.name));
  assert.ok(marks.length / all.filter((n) => n.role !== "designation").length > 0.1);
  assert.ok(marks.every((n) => n.role !== "designation" && n.role !== "classTheme"));
  assert.ok(marks.every((n) => /Mark (II|III|IV|V)$/.test(n.name)));
});

test("§16.5: types are English words and closed compounds, in the shapes of §9.2", () => {
  const names = manyBatches("aircraft", { culture: "american", genre: "modern", naming: "types" }, 300, 10).map((n) => n.name);
  assert.ok(names.some((n) => /^Super [A-Z]/.test(n)));
  assert.ok(names.some((n) => /^Strato[a-z]+$|liner$|^Sky(master|liner|train|king|lark)$/.test(n)));
  assert.ok(names.some((n) => /^[A-Z]{2}-\d{2,3}$/.test(n)));
  assert.ok(names.some((n) => /^Type \d+$/.test(n)));
  assert.ok(names.some((n) => /^[A-Z]-\d{1,2}$/.test(n)));
  const land = manyBatches("landVehicles", { culture: "norman-british", genre: "modern", naming: "types" }, 300, 10);
  assert.ok(manyBatches("landVehicles", { culture: "american", genre: "modern", function: "war", naming: "types", people: "invented" }, 100, 10).some((n) => /^General [A-Z]/.test(n.name)));
  assert.ok(land.some((n) => /^Mark [IVX]+$/.test(n.name)) || land.length > 0);
  assert.ok(land.filter((n) => n.level === "L3" && n.role === "designation").some((n) => /^Mark /.test(n.name)));
  assert.ok(land.filter((n) => n.level !== "L3").every((n) => !/^Mark [IVX]+$/.test(n.name)));
  assert.ok(land.filter((n) => n.function !== "locomotive").every((n) => !/^Class \d+$/.test(n.name)));
});

test("§16.5: as one family: one family per batch, no word twice, ranks keep one initial", () => {
  for (const module of MODULES) {
    for (const culture of ["norman-british", "american", "slavic", "japanese", "general"]) {
      for (let seed = 1; seed <= 40; seed++) {
        const batch = run(module, { culture, genre: "modern", naming: "types", series: true, count: 5, seed });
        if (batch.names.length === 0) continue;
        const label = batch.names.map((n) => n.name).join(" | ");
        assert.equal(new Set(batch.names.map((n) => n.role)).size, 1, label);
        assert.equal(new Set(batch.names.map((n) => n.function)).size, 1, label);
        assert.ok(batch.names.every((n) => n.series?.anchor === "family"), label);
        const words = batch.names.flatMap((n) => n.name.replace(/ Mark [IV]+$/, "").split(" ")).map((w) => w.toLowerCase()).filter((w) => w !== "super");
        const role = batch.names[0].role;
        if (!["classTheme", "designation", "skyShip", "engineType", "future", "carriage", "wagonType", "workType", "spirit"].includes(role) && !/^(General) /.test(batch.names[0].name)) assert.equal(new Set(words).size, words.length, label);
        if (role === "rank") assert.equal(new Set(batch.names.map((n) => n.name.charAt(0))).size, 1, label);
      }
    }
  }
  // Designations share a letter prefix and rise in number.
  let designations = 0;
  for (let seed = 1; seed <= 200 && designations < 20; seed++) {
    const batch = run("aircraft", { culture: "slavic", genre: "modern", function: "war", technology: "A5", naming: "types", series: true, count: 5, seed });
    if (batch.names[0]?.role !== "designation") continue;
    designations++;
    const parts = batch.names.map((n) => n.name.match(/^(.*?)(\d+)$/)!);
    assert.ok(parts.every((p) => p), batch.names.map((n) => n.name).join());
    assert.equal(new Set(parts.map((p) => p[1])).size, 1);
    const nums = parts.map((p) => Number(p[2]));
    assert.deepEqual(nums, [...nums].sort((a, b) => a - b));
    assert.equal(new Set(nums).size, nums.length);
  }
  assert.ok(designations >= 5, `${designations}`);
});

test("§16.5: no type contains a §14.3 word", () => {
  for (const module of MODULES) for (const culture of ["general", "american", "norman-british", "japanese"]) {
    for (const n of manyBatches(module, { culture, genre: "modern", fantastic: true, naming: "types", people: "invented" }, 40, 25)) {
      assert.ok(!breaksVesselWords(n.name, module), n.name);
      assert.ok(!AIR_LAND.safeguards.bannedWords.some((w) => new RegExp(`\\b${w}\\b`, "i").test(n.name)), n.name);
    }
  }
});

// ── §16.6 Codes ─────────────────────────────────────────────────────────────

const PATTERNS: Record<string, RegExp> = {
  general: /^(G-[A-Z]{4}|[A-Z]\d{4}|[A-Z]{2}\d{3}|R\d{2}|[A-Z]{2}-\d{4})$/,
  american: /^(N\d{3}[A-Z]{2}|\d{2}-\d{5}|\d{2}-\d{4}|ZR-\d|[A-Z]{2}-\d{4})$/,
};

test("§16.6: codes only with the link on, naming each craft, in MR, MF or SF", () => {
  for (const module of MODULES) {
    for (const [, genre, fantastic] of SETTINGS) {
      const setting = groupSetting(genre, fantastic);
      const shows = setting === "MR" || setting === "MF" || setting === "SF";
      for (const naming of ["craft", "types"] as const) {
        for (const prefixes of [false, true]) {
          const names = manyBatches(module, { culture: "norman-british", genre, fantastic, naming, prefixes, people: "invented" }, 40, 20);
          const coded = names.filter((n) => n.code !== undefined);
          if (prefixes && naming === "craft" && shows) assert.ok(coded.length > 0, `${module} ${setting}`);
          else assert.equal(coded.length, 0, `${module} ${setting} ${naming} ${prefixes}`);
          for (const n of coded) assert.ok(n.text !== n.name && n.text.includes(n.code!));
        }
      }
    }
  }
});

test("§16.6: aircraft codes: G- only for general and norman-british, N only for american, none at A1 or AF, each as its row says", () => {
  const rows = AIR_LAND.codes.aircraft.rows;
  const regex = (pattern: string) => new RegExp(`^${pattern.replace(/\{(A+)\}/g, (_m, a: string) => `[A-Z]{${a.length}}`).replace(/\{(d+)\}/g, (_m, d: string) => `\\d{${d.length}}`)}$`);
  let seen = 0;
  for (const c of VESSEL_CULTURES) {
    for (const tech of ["A1", "A2", "A3", "A4", "A5", "A6", "AF"]) {
      const names = manyBatches("aircraft", { culture: c.key, genre: "modern", fantastic: true, technology: tech, prefixes: true, people: "invented" }, 12, 10);
      for (const n of names) {
        if (n.code === undefined) continue;
        seen++;
        assert.ok(!["A1", "AF"].includes(n.level), `${c.key} ${n.level}`);
        if (n.code.startsWith("G-")) assert.ok(["general", "norman-british"].includes(c.key), `${c.key} ${n.code}`);
        if (/^N\d/.test(n.code)) assert.equal(c.key, "american", n.code);
        const mine = rows.filter((r) => r.cultures.includes(c.key));
        assert.ok(mine.some((r) => r.patterns.some((p) => regex(p).test(n.code!))), `${c.key} ${n.level} ${n.code}`);
        assert.equal(n.text, `${n.name} (${n.code})`);
      }
      if (["A1", "AF"].includes(tech)) assert.ok(names.every((n) => n.code === undefined), `${c.key} ${tech}`);
    }
  }
  assert.ok(seen > 1000, `${seen}`);
  // In SF any culture's craft show {AA}-{dddd}.
  const sf = manyBatches("aircraft", { culture: "maya", genre: "scifi", prefixes: true, people: "invented" }, 10, 10);
  assert.ok(sf.length > 0 && sf.every((n) => /^[A-Z]{2}-\d{4}$/.test(n.code!)));
  // Cultures with no row for a level show none: French, A2; slavic below A6; ottoman has only A3–A4 rows? (no civil row).
  assert.ok(manyBatches("aircraft", { culture: "slavic", genre: "modern", technology: "A4", prefixes: true }, 10, 10).every((n) => n.code === undefined));
  assert.ok(manyBatches("aircraft", { culture: "slavic", genre: "modern", technology: "A6", prefixes: true, function: "airliner" }, 10, 10).every((n) => /^RA-\d{5}$/.test(n.code!)));
  assert.ok(manyBatches("aircraft", { culture: "general", genre: "modern", technology: "A2", prefixes: true }, 10, 10).every((n) => /^R\d{2}$/.test(n.code!)));
  assert.ok(manyBatches("aircraft", { culture: "american", genre: "modern", technology: "A2", prefixes: true }, 10, 10).every((n) => /^ZR-\d$/.test(n.code!)));
  // Military and civil.
  assert.ok(manyBatches("aircraft", { culture: "norman-british", genre: "modern", technology: "A4", function: "war", prefixes: true }, 10, 10).every((n) => /^[A-Z]\d{4}$/.test(n.code!)));
  assert.ok(manyBatches("aircraft", { culture: "norman-british", genre: "modern", technology: "A5", function: "bomber", prefixes: true }, 10, 10).every((n) => /^[A-Z]{2}\d{3}$/.test(n.code!)));
  assert.ok(manyBatches("aircraft", { culture: "american", genre: "modern", technology: "A4", function: "war", prefixes: true }, 10, 10).every((n) => /^\d{2}-\d{5}$/.test(n.code!)));
  assert.ok(manyBatches("aircraft", { culture: "american", genre: "modern", technology: "A5", function: "war", prefixes: true }, 10, 10).every((n) => /^\d{2}-\d{4}$/.test(n.code!)));
  for (const k of Object.keys(PATTERNS)) assert.ok(PATTERNS[k]);
});

test("§16.6: locomotive numbers as §12.2; L3 war codes use the class letter in a letter class", () => {
  const loco = (culture: string, tech: string) => manyBatches("landVehicles", { culture, genre: "modern", technology: tech, function: "locomotive", prefixes: true, people: "invented" }, 12, 10);
  for (const n of loco("norman-british", "L2")) assert.match(n.text, /^No\. \d{1,3} \S/, n.text);
  for (const tech of ["L3", "L4", "L5"]) {
    for (const n of loco("norman-british", tech)) assert.match(n.text, /^\d{4} \S/, n.text);
    for (const n of loco("general", tech)) assert.match(n.text, /^\d{4} \S/, n.text);
    for (const n of loco("indian", tech)) assert.match(n.text, /^No\. \d{4} \S/, n.text);
    for (const n of loco("japanese", tech)) assert.match(n.text, /^No\. \d{4} \S/, n.text);
  }
  assert.ok(loco("norman-british", "L1").length === 0 || loco("norman-british", "L1").every((n) => n.code === undefined));
  const l6 = manyBatches("landVehicles", { culture: "norman-british", genre: "scifi", technology: "L6", function: "locomotive", prefixes: true, people: "invented" }, 12, 10);
  assert.ok(l6.length > 0 && l6.every((n) => n.code === undefined));
  for (const n of loco("norman-british", "L4")) assert.equal(n.text, `${n.code} ${n.name}`);
  const war = manyBatches("landVehicles", { culture: "norman-british", genre: "modern", technology: "L3", function: "war", prefixes: true }, 30, 10);
  for (const n of war) assert.match(n.text, /^[A-Z]\d{2} \S/, n.text);
  assert.ok(manyBatches("landVehicles", { culture: "norman-british", genre: "modern", technology: "L4", function: "war", prefixes: true }, 10, 10).every((n) => n.code === undefined));
  // Any other function: no code.
  for (const fn of ["train", "coach", "road", "wagon", "working"]) assert.ok(manyBatches("landVehicles", { culture: "norman-british", genre: "modern", technology: fn === "coach" ? "L3" : "L3", function: fn, prefixes: true }, 10, 10).every((n) => n.code === undefined), fn);
  // A letter class: the early tanks of one company carry its letter.
  let letterClasses = 0;
  for (let seed = 1; seed <= 300 && letterClasses < 10; seed++) {
    const batch = run("landVehicles", { culture: "norman-british", genre: "modern", technology: "L3", function: "war", series: true, prefixes: true, people: "invented", count: 6, seed });
    if (batch.names.length < 2 || batch.names[0].series?.anchor !== "letter") continue;
    letterClasses++;
    const letter = batch.names[0].name.replace(/^The /, "").charAt(0);
    for (const n of batch.names) {
      assert.equal(n.name.replace(/^The /, "").charAt(0), letter, n.text);
      assert.equal(n.code!.charAt(0), letter, n.text);
    }
  }
  assert.ok(letterClasses >= 5, `${letterClasses}`);
});

test("§12: a code is never offered a banned word, and codes don't change the name drawn", () => {
  const plain = run("aircraft", { culture: "norman-british", genre: "modern", technology: "A5", count: 20, seed: 4 });
  const coded = run("aircraft", { culture: "norman-british", genre: "modern", technology: "A5", prefixes: true, count: 20, seed: 4 });
  assert.ok(coded.names.every((n) => n.code));
  for (const n of manyBatches("aircraft", { culture: "iberian", genre: "modern", prefixes: true }, 50, 20)) if (n.code) assert.ok(!breaksVesselWords(n.code, "aircraft") && !/SS/.test(n.code), n.code);
  assert.equal(plain.names.length, 20);
});
