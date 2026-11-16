// Northern Europe tables brief, batch 5c: the culture menu of the group families, the signature words and frames of the sixteen modules (30 words and
// 10 shapes per core culture, Celtic 12 and 4), the 40% share, no noun more than twice in a batch, no bracket in real or generated mode, native forms
// in the native and mixed settings only, stored tradition states as they were, and no famous real group, realm or craft.
import "../src/lensRosterSources";
import "../src/deities/engine";
import { test } from "node:test";
import assert from "node:assert/strict";
import { COVERAGE_ADAPTERS, moduleCoverage } from "../src/coverage";
import { applySignature, NORTH5C, signatureDrawer } from "../src/north5c";
import { SIGNATURE_SHARE } from "../src/northData";
import { mulberry32 } from "../src/markov";
import { isRealGroup } from "../src/realPlaces";
import { generateGroupNames, GROUP_FAMILIES } from "../src/groups/engine";
import { generateRealmNames } from "../src/realms/engine";
import { generateBynames, type BynameModule } from "../src/bynames/engine";
import { generateVesselNames } from "../src/vessels/engine";
import { generateTribalNames, TRIBAL_TRADITIONS } from "../src/tribes/engine";
import { generatePeopleRows } from "../src/peoples/engine";
import { chooseGroup, cultureMenu, DEFAULT_GROUP_STATE, groupSentence } from "../src/groups/sentence";
import realPlaces from "../src/data/real-places.json";

const CORE = ["english", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german"];
const MODULES = Object.keys(NORTH5C.modules).filter((m) => !["moneyNames", "eventNames", "calendarNames", "skyNames", "armsNames", "treasureNames", "bookNames", "deityNames"].includes(m));
const adapter = (m: string) => COVERAGE_ADAPTERS.find((a) => a.module === m)!;
const cultureKey = (module: string, c: string) => (module === "tribalNames" ? c : c === "english" ? "norman-british" : c);

test("5c §6: sixteen modules, each core culture with three lists of ten words and ten frames (Celtic four of each; tribes keep Celtic as it is)", () => {
  assert.equal(MODULES.length, 16);
  for (const m of MODULES) {
    for (const c of [...CORE, "celtic"]) {
      const content = NORTH5C.modules[m].cultures[c];
      if (!content) {
        assert.ok(m === "tribalNames" && c === "celtic", `${m} ${c} has content`);
        continue;
      }
      const want = c === "celtic" ? 4 : 10;
      assert.equal(content.n.length, 3, `${m} ${c}`);
      for (const list of content.n) {
        assert.ok(list.length >= want, `${m} ${c} words`);
        assert.equal(new Set(list.map((w) => w.toLowerCase())).size, list.length, `${m} ${c} unique`);
        for (const w of list) assert.match(w, /^[A-Za-z][A-Za-z' -]*$/, `${m} ${c} ${w} is plain English`);
      }
      assert.equal(content.f.length, want, `${m} ${c} frames`);
    }
  }
});

test("5c §6: the coverage report counts 30 signature words and 10 shapes for every core culture in the sixteen modules (Celtic 12 and 4)", () => {
  const short: string[] = [];
  for (const m of MODULES) {
    const cov = moduleCoverage(adapter(m));
    for (const c of CORE) {
      const key = c === "english" ? "english" : c;
      if (cov.cultures[key].words < 30 || cov.cultures[key].shapes < 10) short.push(`${m} ${c} ${cov.cultures[key].words}/${cov.cultures[key].shapes}`);
    }
    if (m !== "tribalNames" && (cov.cultures.celtic.words < 12 || cov.cultures.celtic.shapes < 4)) short.push(`${m} celtic ${cov.cultures.celtic.words}/${cov.cultures.celtic.shapes}`);
  }
  assert.deepEqual(short, []);
  void cultureKey;
});

test("5c §11.3: a core culture's own frames take their share of a batch, and a noun is drawn at most twice", () => {
  for (const [module, culture] of [["tradeGuilds", "german"], ["ships", "norse"], ["realms", "welsh"], ["epithets", "scottish"]]) {
    const draw = signatureDrawer(module, culture)!;
    const rng = mulberry32(7);
    const used = new Map<string, number>();
    const content = NORTH5C.modules[module].cultures[culture];
    const nouns = new Set(content.n.flat());
    for (let i = 0; i < 6; i++) {
      const text = draw(rng)!;
      for (const w of nouns) if (new RegExp(`(^|[^A-Za-z])${w}($|[^A-Za-z])`).test(text)) used.set(w, (used.get(w) ?? 0) + 1);
    }
    for (const [w, n] of used) assert.ok(n <= 2, `${module} ${culture}: ${w} ${n} times in 6 names`);
  }
  const names = Array.from({ length: 4000 }, (_, i) => ({ text: `plain ${i}` }));
  const replaced = applySignature(names, "tradeGuilds", "german", 1).filter((n) => !n.text.startsWith("plain")).length / names.length;
  assert.ok(Math.abs(replaced - SIGNATURE_SHARE) < 0.04, `the share is ${replaced}`);
  // Another culture, or none: nothing replaced.
  assert.deepEqual(applySignature([{ text: "x" }], "tradeGuilds", "french", 1), [{ text: "x" }]);
});

test("5c: Celtic draws its own words and each nation's", () => {
  const draw = signatureDrawer("tradeGuilds", "celtic")!;
  const rng = mulberry32(3);
  const own = new Set(NORTH5C.modules.tradeGuilds.cultures.celtic.n.flat());
  const nation = new Set(["welsh", "scottish", "irish", "cornish"].flatMap((c) => NORTH5C.modules.tradeGuilds.cultures[c].n.flat()).filter((w) => !own.has(w)));
  let ownHits = 0;
  let nationHits = 0;
  for (let i = 0; i < 400; i++) {
    const text = draw(rng) ?? "";
    if ([...own].some((w) => text.includes(w))) ownHits++;
    if ([...nation].some((w) => text.includes(w))) nationHits++;
  }
  assert.ok(ownHits > 0 && nationHits > 0, `${ownHits} own, ${nationHits} nation`);
});

test("5c: no bracket reaches a name in real or generated mode, in any of the sixteen modules", () => {
  for (const culture of ["norman-british", "anglo-saxon", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german", "celtic"]) {
    for (const people of ["real", "generated"] as const) {
      for (const seed of [1, 2, 3]) {
        const all: string[] = [];
        for (const f of GROUP_FAMILIES) all.push(...generateGroupNames({ family: f.key, tradition: culture === "norman-british" || culture === "anglo-saxon" ? "english" : culture === "norse" ? "norse" : culture, culture, people, count: 12, seed }).names.map((n) => n.text));
        all.push(...generateRealmNames({ culture, people, count: 12, seed }).names.map((n) => n.text));
        for (const module of ["epithets", "titles", "familyNames"] as BynameModule[]) all.push(...generateBynames({ module, culture, people, count: 12, seed }).names.map((n) => n.text));
        for (const module of ["ships", "aircraft", "landVehicles"] as const) all.push(...generateVesselNames({ module, culture, people, count: 12, seed }).names.map((n) => n.text));
        for (const t of all) assert.ok(!t.includes("["), `${culture} ${people}: ${t}`);
      }
    }
  }
});

test("5c B2: the English setting renders in English; native forms come only in the native and mixed settings", () => {
  const nativeWords = /\b(Graf|Markgraf|Freiherr|von|zu|ap|ferch|Mac|Nic|Ó|Ní|Tywysog|Arglwydd|Taoiseach|Ollamh|Mormaer|Toiseach)\b/;
  for (const culture of ["welsh", "irish", "scottish", "german", "norse"]) {
    for (const module of ["titles", "familyNames"] as BynameModule[]) {
      const english = generateBynames({ module, culture, language: "english", count: 300, seed: 11 }).names.map((n) => n.text);
      for (const t of english) assert.ok(!nativeWords.test(t.replace(/\[[^\]]*\]/g, "")), `${culture} ${module} english: ${t}`);
    }
  }
  const native = generateBynames({ module: "familyNames", culture: "german", language: "native", count: 40, seed: 4 }).names.map((n) => n.text);
  assert.ok(native.some((t) => /^(von|zu|vom) /.test(t)), native.join("; "));
  const mac = generateBynames({ module: "familyNames", culture: "scottish", language: "native", count: 40, seed: 4 }).names.map((n) => n.text);
  assert.ok(mac.some((t) => /^(Mac|Nic) /.test(t)), mac.join("; "));
  const mixed = generateBynames({ module: "familyNames", culture: "norse", language: "mixed", count: 200, seed: 4 }).names.map((n) => n.text);
  assert.ok(mixed.some((t) => /(son|dottir)$/.test(t)) && mixed.some((t) => !/(son|dottir)$/.test(t)));
});

test("5c B1: the group families offer the shared culture menu; a culture is a tradition and a stored tradition runs as saved", () => {
  const family = GROUP_FAMILIES.find((f) => f.key === "trade")!;
  const menu = cultureMenu({ tradition: "general" });
  const ids = menu.map((c) => c.id);
  for (const c of ["general", "norman-british", "anglo-saxon", "welsh", "scottish", "irish", "cornish", "celtic", "norse", "scandinavian", "german", "roman", "chinese", "aztec"]) assert.ok(ids.includes(c), `${c} is in the menu`);
  assert.ok(menu.some((c) => c.heading === "British Isles") && menu.some((c) => c.heading === "Northern Europe"));
  const welsh = chooseGroup({ ...DEFAULT_GROUP_STATE }, "tradition", "welsh", family);
  assert.equal(welsh.tradition, "welsh");
  assert.equal(welsh.culture, "welsh");
  assert.equal(chooseGroup({ ...DEFAULT_GROUP_STATE }, "tradition", "norman-british", family).tradition, "english");
  // A stored `germanic` state shows its own label and keeps its draw.
  const stored = groupSentence({ ...DEFAULT_GROUP_STATE, tradition: "germanic" }, family)[0] as { text: string; choices: { id: string }[]; current: string };
  assert.equal(stored.text, TRIBAL_TRADITIONS.find((t) => t.key === "germanic")!.label);
  assert.ok(stored.choices.some((c) => c.id === "german"));
  const a = generateGroupNames({ family: "trade", tradition: "germanic", count: 12, seed: 9 }).names.map((n) => n.text);
  const b = generateGroupNames({ family: "trade", tradition: "germanic", count: 12, seed: 9, people: "placeholders" }).names.map((n) => n.text);
  assert.deepEqual(a, b);
});

test("5c B1: tribes and kin groups gain eight traditions of their own; Celtic and Germanic stay as the mixes they are", () => {
  const keys = TRIBAL_TRADITIONS.map((t) => t.key);
  for (const c of CORE) assert.ok(keys.includes(c), `${c} is a tradition`);
  assert.ok(keys.includes("celtic") && keys.includes("germanic"));
  assert.equal(keys.length, 25);
  for (const c of CORE) {
    const names = generateTribalNames({ tradition: c, count: 30, seed: 5 }).names.map((n) => n.name);
    assert.ok(names.length >= 25, `${c} gives names`);
  }
});

test("5c B2: peoples and tongues give a core culture's own people and tongue to a share of the rows", () => {
  const names = ["Dagmar", "Hrolf", "Isolde", "Brenna", "Fenwick", "Aldwin", "Gaela", "Cassius", "Jorund", "Kestrel", "Lysander", "Eskil"];
  const rows = generatePeopleRows({ names, culture: "welsh", era: "MD", seed: 12 }).rows;
  const own = new Set(NORTH5C.modules.peoplesTongues.cultures.welsh.n.flat());
  assert.ok(rows.some((r) => [...own].some((w) => r.people.includes(w))), rows.map((r) => r.text).join("\n"));
  for (const r of rows) assert.match(r.text, /\(person\)|\(adjective\)|\(people\)|\(language/);
});

test("5c §13.4: the real-place list holds at least 120 real groups, realms and craft, and no signature name is one", () => {
  assert.ok((realPlaces as unknown as { groups: string[] }).groups.length >= 120);
  for (const must of ["Hanseatic League", "Teutonic Order", "Black Watch", "Mary Rose", "Long Serpent", "Hindenburg", "Lordship of the Isles"]) assert.ok(isRealGroup(must), must);
  for (const m of MODULES) {
    for (const c of [...CORE, "celtic"]) {
      // Whatever the frames put together, a name that is a real group, realm or craft is never used.
      const names = applySignature(Array.from({ length: 600 }, (_, i) => ({ text: `plain ${i}` })), m, c, 99).map((n) => n.text);
      for (const text of names) assert.ok(!isRealGroup(text.replace(/\[[^\]]*\]/g, "").trim()), `${m} ${c}: ${text}`);
    }
  }
  // The batch's frames never put a real name together by themselves: the words are plain English nouns, no fixed whole names.
  for (const m of MODULES) for (const c of Object.values(NORTH5C.modules[m].cultures)) for (const w of c.n.flat()) assert.ok(!isRealGroup(w), `${m}: ${w}`);
});
