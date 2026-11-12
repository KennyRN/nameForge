// Shared lens brief §7.2 (M1): the lens is whole and every module's own roster, era, setting and style
// value reads in lens terms. The data tables are walked, so a value the mappings miss fails here.
import { test } from "node:test";
import assert from "node:assert/strict";
import airLandData from "../src/data/vehicles-air-land.json";
import groupData from "../src/data/group-names.json";
import lensJson from "../src/data/lens.json";
import vesselData from "../src/data/vessels.json";
import { COLONIAL_TRADITIONS } from "../src/colonialShapes";
import { BYNAME_CULTURES } from "../src/bynames/engine";
import { DEITY_CULTURES } from "../src/deities/engine";
import { MONEY_CULTURES } from "../src/money/engine";
import { REALM_ERAS } from "../src/realms/engine";
import { ROUTE_CULTURES, ROUTE_ERAS } from "../src/routes/engine";
import { SETTLEMENT_VOCAB, inCultureGroup as vocabInCultureGroup, VOCAB_ALL_CULTURES, VOCAB_ERAS, VOCAB_REGIONS } from "../src/settlement/vocab";
import { TRIBAL_TRADITIONS } from "../src/tribes/engine";
import { VESSEL_CULTURES } from "../src/vessels/engine";
import { WORLD_CULTURES } from "../src/world/engine";
import {
  cultureMapping,
  eraTable,
  inCultureGroup,
  isLandModule,
  isLocalCulture,
  LENS_CULTURE_GROUPS,
  LENS_CULTURES,
  LENS_ERAS,
  LENS_LAND_BAND,
  LENS_LEGACY,
  LENS_MODULES,
  LENS_REGIONS,
  LENS_STYLES,
  LENS_TARGETS,
  LENS_TONES,
  lensCulture,
  lensCulturesFor,
  lensErasFor,
  lensStyleFor,
  lensStyleForVocabulary,
  moduleKnowsCulture,
  offeredLensCultures,
  offeredLensCulturesFor,
  poolExemption,
  STEAMPUNK_NAMES,
  tribalCultureWeights,
  type LensEra,
} from "../src/lens";
import { WILDS_SECTIONS, WATERS_SECTIONS, GROUP_NAME_SECTIONS } from "../src/sections";

const cultureKeys = new Set(LENS_CULTURES.map((c) => c.key));
const eraCodes = LENS_ERAS.map((e) => e.code);
const styleKeys = new Set(LENS_STYLES.map((s) => s.key));
const lensJsonAny = lensJson as unknown as Record<string, unknown>;

// ── The lens as the brief writes it ─────────────────────────────────────────

test("§3.1: the cultures, tiers and statuses are the brief's", () => {
  const tier = (t: string) => LENS_CULTURES.filter((c) => c.tier === t).map((c) => c.key);
  assert.deepEqual(tier("core"), ["english", "welsh", "scottish", "irish", "scandinavian", "german"]);
  assert.deepEqual(tier("second"), [
    "french", "dutch", "iberian", "italian", "roman", "greek-byzantine", "slavic", "steppe", "arabic-persian", "egyptian", "ethiopian", "bantu", "west-african",
    "indian", "chinese", "japanese", "korean", "aztec", "maya", "andean", "polynesian", "american",
  ]);
  assert.deepEqual(tier("local").sort(), [
    "arctic", "belgian", "hawaiian", "hellenistic", "malay", "maori", "maritimeSEA", "na-woodlands", "northAmerican", "northernPacific", "nw-coast", "ottoman", "phoenician", "sahul", "swahili-omani", "w-polynesian",
  ]);
  assert.deepEqual(tier("baseline"), ["general"]);
  assert.deepEqual(LENS_CULTURES.filter((c) => c.status === "planned").map((c) => c.key), ["welsh", "scottish", "irish", "german", "italian"]);
  assert.equal(new Set(LENS_CULTURES.map((c) => c.key)).size, LENS_CULTURES.length, "keys are unique");
  assert.equal(lensCulture("english")!.keys.join(), "anglo-saxon,norman-british");
  assert.equal(lensCulture("scandinavian")!.keys.join(), "norse");
  assert.deepEqual(LENS_LEGACY, { "anglo-saxon": ["english"], "norman-british": ["english"], celtic: ["welsh", "scottish", "irish"], norse: ["scandinavian"] });
  for (const [legacy, feeds] of Object.entries(LENS_LEGACY)) for (const f of feeds) assert.ok(lensCulture(f)!.keys.includes(legacy), `${f} reads ${legacy}`);
  for (const c of LENS_CULTURES) assert.ok(c.label, `${c.key} has a label`);
});

test("§3.2: regions are shared out as the brief says, and the live codes are the vocabulary's 12", () => {
  const live = LENS_REGIONS.filter((r) => r.status === "live").map((r) => r.code);
  assert.deepEqual([...live].sort(), [...VOCAB_REGIONS].sort());
  assert.deepEqual(LENS_REGIONS.find((r) => r.code === "SBL")!.cultures, ["english", "scottish"]);
  assert.deepEqual(LENS_REGIONS.filter((r) => r.cultures.includes("english")).map((r) => r.code), ["COR", "WCY", "SEA", "EAN", "WMM", "EMD", "NTH", "SBL"]);
  assert.deepEqual(LENS_REGIONS.filter((r) => r.cultures.includes("scottish")).map((r) => r.code), ["SBL", "SLO", "SHH", "NSI"]);
  assert.deepEqual(LENS_REGIONS.filter((r) => r.cultures.includes("welsh")).map((r) => r.code), ["WAL"]);
  assert.equal(LENS_REGIONS.length, 25);
  for (const r of LENS_REGIONS) {
    assert.ok(r.cultures.length > 0 && r.cultures.every((c) => cultureKeys.has(c) && lensCulture(c)!.tier === "core"), `${r.code}: core cultures only`);
    if (r.status === "planned") assert.ok(!VOCAB_REGIONS.includes(r.code), `${r.code}: planned regions have no data`);
  }
});

test("§3.3 to §3.5: eras, land band, styles, tones and targets", () => {
  assert.deepEqual(eraCodes, ["AN", "MD", "EM", "ST", "MO", "NF", "IS"]);
  assert.deepEqual(LENS_ERAS.map((e) => e.label), ["ancient", "medieval", "early modern", "steam age", "modern", "near future", "interstellar"]);
  assert.deepEqual(LENS_ERAS.map((e) => e.span), ["to c. 500", "c. 500–1500", "c. 1500–1750", "c. 1750–1914", "c. 1914–now", null, null]);
  assert.deepEqual([...LENS_LAND_BAND], ["EM", "ST", "MO"]);
  assert.deepEqual(LENS_STYLES.map((s) => s.key), ["realistic", "low-fantasy", "high-fantasy", "contemporary-fantasy", "steampunk", "dieselpunk", "cyberpunk", "post-apocalyptic", "space-opera"]);
  const eraOf = Object.fromEntries(LENS_STYLES.map((s) => [s.key, s.eras.join()]));
  assert.equal(eraOf["realistic"], eraCodes.join());
  assert.equal(eraOf["low-fantasy"], "AN,MD,EM");
  assert.equal(eraOf["contemporary-fantasy"], "ST,MO");
  assert.equal(eraOf["steampunk"], "ST");
  assert.equal(eraOf["cyberpunk"], "NF");
  assert.equal(eraOf["post-apocalyptic"], "MO,NF,IS");
  assert.equal(eraOf["space-opera"], "IS");
  assert.deepEqual([...LENS_TONES], ["grand", "plain", "grim", "light", "strange"]);
  assert.deepEqual(LENS_TARGETS, {
    cultures: { core: { words: 30, shapes: 10 }, second: { words: 12, shapes: 4 }, local: { words: 4, shapes: 1 } },
    era: 12,
    style: { words: 16, shapes: 4 },
    tone: 8,
    toneKeys: ["grand", "grim", "light", "strange"],
    region: 6,
    kindOpenShapes: 6,
    pool: 8,
  });
  assert.deepEqual(lensJsonAny.poolExemptions, { forPacks: [], closed: [] }, "M3 fills the exemptions");
  assert.equal(poolExemption("anything"), undefined);
});

test("§3.3: the land modules are the brief's", () => {
  const land = LENS_MODULES.filter(isLandModule).sort();
  assert.deepEqual(land, [...WILDS_SECTIONS, "seasLakes", "coastsIslands", "seaCharts", "riverNames", "placeShapes"].sort());
  assert.equal(isLandModule("hyperspaceCharts"), false);
  assert.equal(isLandModule("streetNames"), false);
});

test("§3.1: the british and christian groups are the vocabulary's, and group membership agrees for every culture and era", () => {
  assert.deepEqual(LENS_CULTURE_GROUPS, SETTLEMENT_VOCAB.cultureGroups);
  assert.deepEqual(LENS_CULTURE_GROUPS["british"].cultures, ["anglo-saxon", "celtic", "norman-british"]);
  assert.deepEqual(LENS_CULTURE_GROUPS["christian"].cultures, ["anglo-saxon", "celtic", "norman-british", "slavic", "french", "iberian"]);
  assert.deepEqual(LENS_CULTURE_GROUPS["christian"].from, { "greek-byzantine": "MD", roman: "MD" });
  for (const group of [...Object.keys(LENS_CULTURE_GROUPS), "missing"]) {
    for (const culture of [...VOCAB_ALL_CULTURES, "nonsuch"]) {
      for (const era of eraCodes) assert.equal(inCultureGroup(group, culture, era as LensEra), vocabInCultureGroup(group, culture, era as LensEra), `${group} ${culture} ${era}`);
    }
  }
  for (const key of Object.values(LENS_CULTURE_GROUPS).flatMap((g) => [...g.cultures, ...Object.keys(g.from ?? {})])) {
    assert.ok(LENS_CULTURES.some((c) => c.keys.includes(key)), `group culture ${key} is a key some lens culture reads`);
  }
});

// ── Every mapping names real lens values ────────────────────────────────────

test("every culture, era and style a mapping names exists in the lens", () => {
  for (const name of ["shared", "tribal", "colonial", "vehicle", "world"]) {
    for (const [key, entry] of Object.entries(cultureMapping(name))) {
      for (const c of entry.lens) assert.ok(cultureKeys.has(c), `${name}.${key} -> ${c}`);
      if (!entry.local) assert.ok(entry.lens.length > 0, `${name}.${key} maps to something or is local`);
      for (const [c] of entry.weights ?? []) assert.ok(cultureKeys.has(c), `${name}.${key} weight ${c}`);
    }
  }
  for (const name of ["realms", "world", "ships", "spacecraft", "aircraft", "landVehicles"]) {
    for (const [key, eras] of Object.entries(eraTable(name))) for (const e of eras) assert.ok(eraCodes.includes(e as LensEra), `eras.${name}.${key} -> ${e}`);
  }
  const styles = (lensJson as unknown as { mappings: { styles: Record<string, unknown> } }).mappings.styles;
  const readings = [
    ...Object.values(styles["vessel"] as Record<string, { style: string; eras?: string[] }[]>).flat(),
    ...Object.values(styles["genreSettings"] as Record<string, { style: string; eras: string[] }>),
    ...(styles["vocabulary"] as { fantastic: { otherwise: { style: string }[] }; notFantastic: { style: string }[] }).fantastic.otherwise,
    ...(styles["vocabulary"] as { notFantastic: { style: string }[] }).notFantastic,
    ...(styles["default"] as { style: string }[]),
  ];
  for (const r of readings) {
    assert.ok(styleKeys.has(r.style), `style ${r.style}`);
    for (const e of (r as { eras?: string[] }).eras ?? []) assert.ok(eraCodes.includes(e as LensEra), `style era ${e}`);
    // §4.3 puts the fantastic vocabulary's space opera on NF and IS, though §3.4 lets space opera sit on IS alone: the mapping is kept as written.
  }
  for (const m of LENS_MODULES) {
    const mod = (lensJson as unknown as { modules: Record<string, { cultures: string; eras: string; settings?: string; styles?: string; colonialCultures?: string }> }).modules[m];
    if (mod.cultures !== "none") assert.ok(Object.keys(cultureMapping(mod.cultures)).length > 0, `${m} cultures ${mod.cultures}`);
    if (mod.colonialCultures) assert.ok(Object.keys(cultureMapping(mod.colonialCultures)).length > 0, `${m} colonial`);
    if (!["none", "codes"].includes(mod.eras)) assert.ok(Object.keys(eraTable(mod.eras)).length > 0, `${m} eras ${mod.eras}`);
  }
});

test("the lens maps every non-Markov module in the line-up, and river names", () => {
  const expected = [
    "placeShapes", "routeNames", "sacredPlaces", "riverNames", "explorationPlaceShapes", "empireExpansionPlaceShapes", "settlementNames", "streetNames", "innNames", "buildingNames", "monumentNames",
    "settlementKit", "eventNames", "moneyNames", "calendarNames", "skyNames", "armsNames", "treasureNames", "bookNames", "deityNames", "tribalNames", ...GROUP_NAME_SECTIONS, "epithets", "titles", "familyNames",
    "realms", "peoplesTongues", "ships", "spacecraft", "aircraft", "landVehicles", ...WATERS_SECTIONS, ...WILDS_SECTIONS,
  ];
  assert.deepEqual([...LENS_MODULES].sort(), [...expected].sort());
  assert.equal(LENS_MODULES.length, 47);
});

// ── The rosters in the data ─────────────────────────────────────────────────

const ROSTERS: Record<string, string[]> = {};
const shared = (keys: string[], modules: string[]) => modules.forEach((m) => (ROSTERS[m] = keys));
const routeKeys = ROUTE_CULTURES.map((c) => c.key);
shared(routeKeys, ["routeNames", "streetNames", "innNames", "buildingNames", "monumentNames", "settlementKit", "eventNames", "calendarNames", "skyNames", ...WILDS_SECTIONS, ...WATERS_SECTIONS]);
shared(BYNAME_CULTURES.map((c) => c.key), ["epithets", "titles", "familyNames", "armsNames", "treasureNames", "bookNames", "realms", "peoplesTongues"]);
shared(DEITY_CULTURES.map((c) => c.key), ["deityNames", "sacredPlaces"]);
shared(MONEY_CULTURES.map((c) => c.key), ["moneyNames"]);
shared(VESSEL_CULTURES.map((c) => c.key), ["ships", "spacecraft", "aircraft", "landVehicles"]);
shared(TRIBAL_TRADITIONS.map((t) => t.key), ["tribalNames", ...GROUP_NAME_SECTIONS]);
shared(COLONIAL_TRADITIONS.map((t) => t.id), ["explorationPlaceShapes", "empireExpansionPlaceShapes"]);
shared(WORLD_CULTURES.map((c) => c.id), ["placeShapes", "settlementNames"]);

test("every culture key a module offers maps to a lens culture or is listed as local", () => {
  for (const [module, keys] of Object.entries(ROSTERS)) {
    assert.ok(keys.length > 0, `${module} has a roster`);
    for (const key of keys) {
      assert.ok(moduleKnowsCulture(module, key), `${module}: ${key} isn't in its mapping`);
      const lens = lensCulturesFor(module, key);
      assert.ok(lens.length > 0 || isLocalCulture(module, key), `${module}: ${key} maps to nothing and isn't local`);
    }
  }
  // Settlement names also offers the colonial traditions.
  for (const t of COLONIAL_TRADITIONS) assert.ok(moduleKnowsCulture("settlementNames", t.id), `settlementNames: colonial ${t.id}`);
});

test("each mapping holds exactly its roster: no key the data lacks, none missing", () => {
  const keysOf = (name: string) => Object.keys(cultureMapping(name)).sort();
  assert.deepEqual(keysOf("tribal"), TRIBAL_TRADITIONS.map((t) => t.key).sort());
  assert.deepEqual(keysOf("colonial"), COLONIAL_TRADITIONS.map((t) => t.id).sort());
  assert.deepEqual(keysOf("shared"), [...VOCAB_ALL_CULTURES].sort(), "the shared roster is the vocabulary's 26");
  // The vehicle mapping is the shared roster plus the local extras; the vessel roster has no `polynesian` key of its own (it has hawaiian, maori and w-polynesian).
  const vehicleKeys = keysOf("vehicle");
  for (const c of VESSEL_CULTURES) assert.ok(vehicleKeys.includes(c.key), c.key);
  assert.deepEqual(vehicleKeys.filter((k) => !VESSEL_CULTURES.some((c) => c.key === k)), ["polynesian"]);
  // The 22, the 20, the 24 and the 34 are all inside the shared keys or the vehicle extras.
  for (const keys of [routeKeys, BYNAME_CULTURES.map((c) => c.key), MONEY_CULTURES.map((c) => c.key)]) for (const k of keys) assert.ok(cultureMapping("shared")[k], k);
  assert.equal(WORLD_CULTURES.length, 16);
  for (const c of WORLD_CULTURES) assert.ok(cultureMapping("world")[c.id], `world ${c.id}`);
});

test("§4.1: tribal, colonial and vehicle mappings are the brief's tables", () => {
  const m = (name: string, key: string) => cultureMapping(name)[key];
  assert.deepEqual(m("tribal", "celtic").lens, ["welsh", "scottish", "irish"]);
  assert.deepEqual(m("tribal", "germanic").lens, ["english", "scandinavian", "german", "dutch"]);
  assert.deepEqual(m("tribal", "mediterranean").lens, ["roman", "greek-byzantine", "italian"]);
  assert.deepEqual(m("tribal", "eastAsian").lens, ["chinese", "japanese", "korean"]);
  assert.deepEqual(m("tribal", "mesoamerican").lens, ["aztec", "maya"]);
  for (const k of ["northAmerican", "maritimeSEA", "northernPacific", "sahul"]) assert.deepEqual([m("tribal", k).lens, m("tribal", k).local], [[], true], k);
  assert.deepEqual(m("colonial", "british-imperial").lens, ["english"]);
  assert.deepEqual(m("colonial", "english-speaking-settler").lens, ["american"]);
  assert.deepEqual([m("colonial", "danish").lens, m("colonial", "swedish").lens], [["scandinavian"], ["scandinavian"]]);
  assert.deepEqual([m("colonial", "spanish").lens, m("colonial", "portuguese").lens], [["iberian"], ["iberian"]]);
  assert.deepEqual([m("colonial", "arab").lens, m("colonial", "ottoman").lens], [["arabic-persian"], ["arabic-persian"]]);
  assert.deepEqual(m("colonial", "russian").lens, ["slavic"]);
  for (const k of ["hellenistic", "phoenician", "belgian"]) assert.deepEqual([m("colonial", k).lens, m("colonial", k).local], [[], true], k);
  for (const k of ["hawaiian", "maori", "w-polynesian"]) assert.deepEqual([m("vehicle", k).lens, m("vehicle", k).local], [["polynesian"], true], k);
  for (const k of ["ottoman", "swahili-omani"]) assert.deepEqual([m("vehicle", k).lens, m("vehicle", k).local], [["arabic-persian"], true], k);
  for (const k of ["malay", "nw-coast", "arctic", "na-woodlands"]) assert.deepEqual([m("vehicle", k).lens, m("vehicle", k).local], [[], true], k);
  // The legacy rule.
  assert.deepEqual(lensCulturesFor("routeNames", "anglo-saxon"), ["english"]);
  assert.deepEqual(lensCulturesFor("routeNames", "norman-british"), ["english"]);
  assert.deepEqual(lensCulturesFor("routeNames", "celtic"), ["welsh", "scottish", "irish"]);
  assert.deepEqual(lensCulturesFor("routeNames", "norse"), ["scandinavian"]);
  assert.deepEqual(lensCulturesFor("ships", "hawaiian"), ["polynesian"]);
  assert.deepEqual(lensCulturesFor("routeNames", "no-such-culture"), []);
  assert.deepEqual(lensCulturesFor("no-such-module", "general"), []);
});

// The draws `traditions.cultureMap` held in group-names.json before the lens took them over (M2), frozen here.
const FORMER_CULTURE_MAP: Record<string, [string, number][]> = {
  mediterranean: [["roman", 1]],
  eastAsian: [["chinese", 50], ["japanese", 25], ["korean", 25]],
  mesoamerican: [["aztec", 60], ["maya", 40]],
  bantu: [["bantu", 1]],
  westAfrican: [["west-african", 1]],
  arabian: [["arabic-persian", 1]],
  southAsian: [["indian", 1]],
};

test("the group engine's tradition draws are the lens's weights, exactly as traditions.cultureMap had them", () => {
  for (const t of TRIBAL_TRADITIONS) assert.deepEqual(tribalCultureWeights(t.key), FORMER_CULTURE_MAP[t.key], t.key);
  assert.deepEqual(Object.keys(FORMER_CULTURE_MAP).sort(), TRIBAL_TRADITIONS.map((t) => t.key).filter((k) => tribalCultureWeights(k)).sort());
  // The map no longer lives in group-names.json.
  assert.equal((groupData as unknown as { traditions: Record<string, unknown> }).traditions.cultureMap, undefined);
  // A tradition the lens maps to more cultures than it draws from keeps drawing from the same ones.
  assert.deepEqual(tribalCultureWeights("mediterranean"), [["roman", 1]]);
});

test("no shared roster offers a planned culture, and the offered accessors never return one", () => {
  const planned = new Set(LENS_CULTURES.filter((c) => c.status === "planned").map((c) => c.key));
  const sharedModules = Object.keys(ROSTERS).filter((m) => !["explorationPlaceShapes", "empireExpansionPlaceShapes", "tribalNames", ...GROUP_NAME_SECTIONS].includes(m));
  for (const m of sharedModules) for (const k of ROSTERS[m]) assert.ok(!planned.has(k), `${m} offers the planned culture ${k}`);
  assert.ok(offeredLensCultures().every((c) => c.status === "live"));
  for (const [m, keys] of Object.entries(ROSTERS)) {
    for (const c of offeredLensCulturesFor(m, keys)) assert.ok(!planned.has(c), `${m} reaches the planned culture ${c}`);
  }
  // Every legacy key still reads as something live: `celtic` feeds only planned cultures but stays offered under its own key.
  assert.ok(routeKeys.includes("celtic"));
  assert.deepEqual(offeredLensCulturesFor("routeNames", ["celtic"]), [], "celtic reaches no live lens culture until brief 2");
  assert.deepEqual(offeredLensCulturesFor("routeNames", ["anglo-saxon", "norman-british"]), ["english"]);
});

// ── Eras ────────────────────────────────────────────────────────────────────

test("every era value in the data maps to lens eras", () => {
  assert.deepEqual([...VOCAB_ERAS], eraCodes, "the vocabulary's eras are the lens's");
  assert.deepEqual(ROUTE_ERAS.map((e) => e.code), eraCodes);
  for (const code of eraCodes) assert.deepEqual(lensErasFor("routeNames", code), [code]);
  assert.deepEqual(lensErasFor("routeNames", "XX"), []);
  // Realms: six eras, no steam age.
  assert.deepEqual(REALM_ERAS.map((e) => (e as { key: string }).key), ["ancient", "medieval", "earlyModern", "modern", "nearFuture", "interstellar"]);
  const realmCovered = REALM_ERAS.flatMap((e) => lensErasFor("realms", (e as { key: string }).key));
  assert.deepEqual(realmCovered, ["AN", "MD", "EM", "MO", "NF", "IS"]);
  assert.ok(!realmCovered.includes("ST"), "the steam age is not covered");
  // World named eras, by culture.
  for (const c of WORLD_CULTURES) for (const e of c.eras) assert.ok(lensErasFor("placeShapes", e.id, c.id).length > 0, `world ${c.id}/${e.id}`);
  assert.deepEqual(lensErasFor("placeShapes", "imperial", "roman"), ["AN"]);
  assert.deepEqual(lensErasFor("placeShapes", "imperial", "chinese"), ["MD", "EM"]);
  assert.deepEqual(lensErasFor("placeShapes", "imperial", "slavic"), ["EM", "ST"]);
  assert.deepEqual(lensErasFor("placeShapes", "modern", "japanese"), ["ST", "MO"]);
  assert.deepEqual(lensErasFor("placeShapes", "persian", "arabic-persian"), ["AN", "MD"]);
  assert.deepEqual(lensErasFor("settlementNames", "viking", "norse"), ["MD"]);
  assert.equal(Object.keys(eraTable("world")).length, WORLD_CULTURES.reduce((n, c) => n + c.eras.length, 0), "no extra world eras");
  // British place names and river names: all seven.
  assert.deepEqual((lensJson as unknown as { modules: Record<string, { britishEras?: string }> }).modules["placeShapes"].britishEras, "all");
  assert.deepEqual((lensJson as unknown as { modules: Record<string, { britishEras?: string }> }).modules["riverNames"].britishEras, "all");
});

test("vessel, spacecraft, aircraft and land vehicle technology codes all map to lens eras", () => {
  const tech = (vesselData as unknown as { technology: Record<string, { code: string }[]> }).technology;
  const airLand = (airLandData as unknown as { technology: Record<string, { code: string }[]> }).technology;
  assert.deepEqual(tech["ships"].map((t) => t.code), ["T1", "T2", "T3", "T4", "T5", "T6", "T7"]);
  assert.deepEqual(tech["spacecraft"].map((t) => t.code), ["S1", "S2", "S3"]);
  for (const t of tech["ships"]) assert.ok(lensErasFor("ships", t.code).length > 0, t.code);
  for (const t of tech["spacecraft"]) assert.ok(lensErasFor("spacecraft", t.code).length > 0, t.code);
  for (const t of airLand["aircraft"]) assert.ok(lensErasFor("aircraft", t.code).length > 0, t.code);
  for (const t of airLand["landVehicles"]) assert.ok(lensErasFor("landVehicles", t.code).length > 0, t.code);
  assert.equal(Object.keys(eraTable("ships")).length, 7);
  assert.equal(Object.keys(eraTable("aircraft")).length, airLand["aircraft"].length, "no extra aircraft codes");
  assert.equal(Object.keys(eraTable("landVehicles")).length, airLand["landVehicles"].length, "no extra land vehicle codes");
  // §4.2's table.
  assert.deepEqual(["T1", "T2", "T3", "T4", "T5", "T6", "T7"].map((c) => lensErasFor("ships", c).join("+")), ["AN", "AN", "MD", "EM", "ST", "MO", "MO"]);
  assert.deepEqual(["S1", "S2", "S3"].map((c) => lensErasFor("spacecraft", c).join("+")), ["NF", "NF", "IS"]);
});

// ── Settings and styles ─────────────────────────────────────────────────────

test("every genre setting and vessel style in the data reads as a lens style", () => {
  const settings = Object.keys((groupData as unknown as { settings: { phrases: Record<string, string> } }).settings.phrases);
  assert.deepEqual(settings, ["FL", "FH", "MR", "MF", "SF"]);
  const expected: Record<string, [string, string]> = { FL: ["MD", "low-fantasy"], FH: ["MD", "high-fantasy"], MR: ["MO", "realistic"], MF: ["MO", "contemporary-fantasy"], SF: ["IS", "realistic"] };
  for (const s of settings) assert.deepEqual(lensStyleFor("mysticOrders", s), [{ style: expected[s][1], eras: [expected[s][0]] }], s);
  for (const era of (ROUTE_ERAS as unknown as { code: string; settings: string[] }[])) for (const s of era.settings) assert.ok(settings.includes(s), `route era ${era.code} setting ${s}`);

  const vessel = (vesselData as unknown as { styles: { key: string; settings: string[] }[] }).styles;
  const airLand = Object.keys((airLandData as unknown as { styles: Record<string, unknown> }).styles);
  for (const s of vessel) {
    assert.ok(lensStyleFor("ships", s.key).length > 0 && lensStyleFor("ships", s.key).every((r) => styleKeys.has(r.style)), s.key);
    for (const g of s.settings) assert.ok(settings.includes(g), `${s.key} setting ${g}`);
  }
  for (const k of airLand) assert.ok(vessel.some((s) => s.key === k), `aircraft style ${k} is a vessel style`);
  assert.equal(Object.keys((lensJson as unknown as { mappings: { styles: { vessel: object } } }).mappings.styles.vessel).length, vessel.length, "no extra vessel styles");
  // §4.3's table.
  const names = (key: string) => lensStyleFor("ships", key).map((r) => r.style).join("+");
  for (const k of ["heroic", "elven", "dwarven", "oceanic", "fpirate"]) assert.equal(names(k), "high-fantasy", k);
  assert.equal(names("dark"), "high-fantasy+contemporary-fantasy");
  assert.equal(names("steampunk"), "steampunk");
  assert.equal(names("dieselpunk"), "dieselpunk");
  for (const k of ["postapoc", "wasteland"]) assert.equal(names(k), "post-apocalyptic", k);
  for (const k of ["sfmilitary", "sfexplore", "ai", "alien"]) assert.equal(names(k), "space-opera", k);
  for (const k of ["corporate", "colony", "outlaw"]) assert.deepEqual(lensStyleFor("ships", k), [{ style: "realistic", eras: ["NF", "IS"] }], k);
  assert.deepEqual(lensStyleFor("ships", "no-such-style"), [{ style: "realistic" }], "everything else is realistic");
});

test("§4.3: the vocabulary's fantastic flag reads as a style, and the steampunk names are listed", () => {
  assert.deepEqual(lensStyleForVocabulary({ h: false, e: ["MD"] }), [{ style: "realistic" }]);
  assert.deepEqual(lensStyleForVocabulary({ e: ["MD"] }), [{ style: "realistic" }], "no flag is not fantastic");
  assert.deepEqual(lensStyleForVocabulary({ h: true, e: ["ST"] }), [{ style: "steampunk", eras: ["ST"] }]);
  assert.deepEqual(lensStyleForVocabulary({ h: true, e: ["MD"] }), [
    { style: "high-fantasy", eras: ["AN", "MD", "EM"] },
    { style: "contemporary-fantasy", eras: ["MO"] },
    { style: "space-opera", eras: ["NF", "IS"] },
  ]);
  assert.deepEqual(STEAMPUNK_NAMES.pools, ["compSteampunk", "streetSteampunk", "steampunkLandmark", "steampunkMonument"]);
  for (const p of STEAMPUNK_NAMES.pools) assert.ok(p in SETTLEMENT_VOCAB.pools, `${p} is a real pool`);
});

// ── Walking the data ────────────────────────────────────────────────────────

import { readFileSync, readdirSync } from "node:fs";

test("every culture key in any data table is one the lens knows", () => {
  const known = new Set<string>(Object.keys({ ...cultureMapping("shared"), ...cultureMapping("tribal"), ...cultureMapping("colonial"), ...cultureMapping("vehicle") }));
  for (const c of WORLD_CULTURES) known.add(c.id);
  for (const g of Object.keys(SETTLEMENT_VOCAB.cultureGroups)) known.add(g);
  const unknown: string[] = [];
  const seen = { objects: 0 };
  const check = (ck: string, where: string) => {
    seen.objects++;
    if (!known.has(ck.replace(/^!/, ""))) unknown.push(`${where}: ${ck}`);
  };
  const walk = (value: unknown, file: string, path: string) => {
    if (Array.isArray(value)) return value.forEach((v, i) => walk(v, file, `${path}[${i}]`));
    if (!value || typeof value !== "object") return;
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // A `culture` field, a `cultures` list or map, and the `culture…` maps (cultureShapes, cultureMult, cultureExtra…) all name cultures.
      if (k === "culture" && typeof v === "string") check(v, `${file}:${path}.culture`);
      else if (k === "cultures" && Array.isArray(v)) v.forEach((c) => typeof c === "string" && check(c, `${file}:${path}.cultures`));
      else if (/^cultures?[A-Z]|^cultures$/.test(k) && v && typeof v === "object" && !Array.isArray(v) && !["cultureGroups", "cultureToColonial", "cultureDivineAnimal", "cultureRoles"].includes(k)) {
        for (const ck of Object.keys(v as object)) check(ck, `${file}:${path}.${k}`);
      } else if (k === "cultureRoles" && v && typeof v === "object") {
        // Keyed by module, then by culture.
        for (const [mod, byCulture] of Object.entries(v as Record<string, object>)) for (const ck of Object.keys(byCulture)) check(ck, `${file}:${path}.${k}.${mod}`);
      }
      walk(v, file, `${path}.${k}`);
    }
  };
  for (const f of readdirSync("src/data").filter((n) => n.endsWith(".json") && n !== "lens.json")) walk(JSON.parse(readFileSync(`src/data/${f}`, "utf8")), f, "");
  assert.ok(seen.objects > 300, `the walk found the culture keys (${seen.objects})`);
  assert.deepEqual(unknown, []);
});

test("every culture and era tag on a vocabulary entry names a lens culture, group or era", () => {
  const known = new Set<string>([...VOCAB_ALL_CULTURES, ...Object.keys(SETTLEMENT_VOCAB.cultureGroups)]);
  const bad: string[] = [];
  let tagged = 0;
  for (const [pool, p] of Object.entries(SETTLEMENT_VOCAB.pools)) {
    const entries = [...p.entries, ...Object.values(p.cultureExtra ?? {}).flat()];
    for (const e of entries) {
      for (const c of e.c ?? []) {
        tagged++;
        if (!known.has(c.replace(/^!/, ""))) bad.push(`${pool}: culture ${c}`);
      }
      for (const era of e.e ?? []) if (!eraCodes.includes(era as LensEra)) bad.push(`${pool}: era ${era}`);
    }
    for (const c of Object.keys(p.cultureExtra ?? {})) if (!known.has(c)) bad.push(`${pool}: cultureExtra ${c}`);
  }
  assert.ok(tagged > 1000);
  assert.deepEqual(bad, []);
  // Every module culture a vocabulary tag can name is in the shared mapping.
  for (const c of VOCAB_ALL_CULTURES) assert.ok(cultureMapping("shared")[c], c);
});
