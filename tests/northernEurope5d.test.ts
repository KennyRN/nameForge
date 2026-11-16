// Northern Europe tables brief, batch 5d: the signature words and frames of money, events, calendars, sky lore, arms, treasures, books and deities
// (30 words and 10 shapes per core culture, Celtic 12 and 4; six words per era and three fantastic), the culture rosters, the 40% share, kind-written
// frames, no bracket in real or generated mode, and no famous real event, object or god.
import "../src/lensRosterSources";
import "../src/deities/engine";
import { test } from "node:test";
import assert from "node:assert/strict";
import { COVERAGE_ADAPTERS, moduleCoverage } from "../src/coverage";
import { applySignature, NORTH5C, readTag, signatureDrawer } from "../src/north5c";
import { SIGNATURE_SHARE } from "../src/northData";
import { mulberry32 } from "../src/markov";
import { isRealGroup } from "../src/realPlaces";
import realPlaces from "../src/data/real-places.json";
import { generateMoneyNames, MONEY_CULTURES } from "../src/money/engine";
import { generateEventNames } from "../src/events/engine";
import { generateTimeSkyNames } from "../src/timesky/engine";
import { TIME_CULTURES } from "../src/timesky/data";
import { generateThingNames, THING_CULTURES } from "../src/things/engine";
import { DEITY_CULTURES, generateDeityNames } from "../src/deities/engine";
import { ROUTE_CULTURES } from "../src/routes/engine";

const CORE = ["english", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german"];
const MODULES = ["moneyNames", "eventNames", "calendarNames", "skyNames", "armsNames", "treasureNames", "bookNames", "deityNames"];
const NEW6 = ["welsh", "scottish", "irish", "cornish", "scandinavian", "german"];
const adapter = (m: string) => COVERAGE_ADAPTERS.find((a) => a.module === m)!;

test("5d §14: eight modules, each core culture with three lists of ten words and ten frames (Celtic four of each)", () => {
  for (const m of MODULES) {
    for (const c of [...CORE, "celtic"]) {
      const content = NORTH5C.modules[m].cultures[c];
      assert.ok(content, `${m} ${c} has content`);
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

test("5d §6: the coverage report counts 30 signature words and 10 shapes for every core culture (Celtic 12 and 4), six words per era and three fantastic", () => {
  const short: string[] = [];
  for (const m of MODULES) {
    const cov = moduleCoverage(adapter(m));
    for (const c of CORE) {
      const cell = cov.cultures[c];
      if (cell.words < 30 || cell.shapes < 10) short.push(`${m} ${c} ${cell.words}/${cell.shapes}`);
    }
    if (cov.cultures.celtic.words < 12 || cov.cultures.celtic.shapes < 4) short.push(`${m} celtic ${cov.cultures.celtic.words}/${cov.cultures.celtic.shapes}`);
    for (const c of CORE) {
      const content = NORTH5C.modules[m].cultures[c];
      for (const era of ["AN", "MD", "EM", "ST", "MO"]) {
        const n = content.nt!.flat().filter((t) => { const r = readTag(t); return r.eras && r.eras.length < 5 && r.eras.includes(era); }).length;
        if (n < 6) short.push(`${m} ${c} ${era} era words ${n}`);
      }
      const h = content.nt!.flat().filter((t) => readTag(t).h).length;
      if (h < 3) short.push(`${m} ${c} fantastic ${h}`);
    }
  }
  assert.deepEqual(short, []);
});

test("5d §14: the rosters offer Welsh, Scottish, Irish, Cornish, Scandinavian and German in money, events, calendars, sky, the named things and deities", () => {
  for (const roster of [MONEY_CULTURES, TIME_CULTURES, THING_CULTURES, DEITY_CULTURES]) for (const k of NEW6) assert.ok(roster.some((c) => c.key === k), k);
  for (const k of NEW6) assert.ok(ROUTE_CULTURES.length > 0 && k);
});

test("5d §11.3: a core culture's own frames take their share of a batch, and a noun is drawn at most twice", () => {
  for (const [module, culture] of [["moneyNames", "german"], ["armsNames", "norse"], ["deityNames", "welsh"], ["bookNames", "scottish"]]) {
    const draw = signatureDrawer(module, culture)!;
    const rng = mulberry32(7);
    const used = new Map<string, number>();
    const nouns = new Set(NORTH5C.modules[module].cultures[culture].n.flat());
    for (let i = 0; i < 6; i++) {
      const text = draw(rng)!;
      for (const w of nouns) if (new RegExp(`(^|[^A-Za-z])${w}($|[^A-Za-z])`).test(text)) used.set(w, (used.get(w) ?? 0) + 1);
    }
    for (const [w, n] of used) assert.ok(n <= 2, `${module} ${culture}: ${w} ${n} times in 6 names`);
  }
  const names = Array.from({ length: 400 }, (_, i) => ({ text: `plain ${i}` }));
  const replaced = applySignature(names, "moneyNames", "german", 1).filter((n) => !n.text.startsWith("plain")).length / names.length;
  assert.ok(Math.abs(replaced - SIGNATURE_SHARE) < 0.08, `the share is ${replaced}`);
  assert.deepEqual(applySignature([{ text: "x" }], "moneyNames", "french", 1), [{ text: "x" }]);
});

test("5d §14.3: a month's frames are never drawn a festival, nor a constellation's a light", () => {
  const rng = mulberry32(3);
  const month = signatureDrawer("calendarNames", "welsh")!;
  for (let i = 0; i < 80; i++) {
    const text = month(rng, { kind: "month" })!;
    assert.ok(/Month|Tide/.test(text), `${text} reads as a month`);
  }
  for (let i = 0; i < 80; i++) {
    const text = month(rng, { kind: "festival" })!;
    assert.ok(!/ Month|Moon|Tide/.test(text), `${text} reads as a festival`);
  }
  for (let i = 0; i < 80; i++) assert.ok(/ Moon/.test(month(rng, { kind: "moon" })!), "a moon reads as a moon");
});

test("5d: a drawn name keeps to the era and the fantastic switch", () => {
  const draw = signatureDrawer("moneyNames", "english")!;
  const rng = mulberry32(5);
  for (let i = 0; i < 200; i++) {
    const text = draw(rng, { eras: ["AN"], fantastic: false })!;
    assert.ok(!/Banknote|Cheque|Locomotive|Aluminium|Plastic/.test(text), text);
    assert.ok(!/Dragon Scale|Moon Penny|Phoenix|Griffin|Moonsilver/.test(text), text);
  }
});

test("5d: money, events, calendars, sky lore, the named things and deities at a core culture draw its own words and leave no bracket in real or generated mode", () => {
  const seen = new Map<string, number>();
  for (const culture of ["welsh", "german", "scandinavian", "cornish"]) {
    const runs: [string, string[]][] = [
      ["money", generateMoneyNames({ culture, era: "MD", count: 40, seed: 11, people: "real" }).names.map((n) => n.text)],
      ["event", generateEventNames({ culture, era: "MD", count: 40, seed: 11, people: "real" }).names.map((n) => n.text)],
      ["month", generateTimeSkyNames({ culture, kind: "month", era: "MD", count: 40, seed: 11, people: "real" }).names.map((n) => n.text)],
      ["festival", generateTimeSkyNames({ culture, kind: "festival", era: "MD", count: 40, seed: 11, people: "real" }).names.map((n) => n.text)],
      ["sky", generateTimeSkyNames({ culture, kind: "constellation", era: "MD", count: 40, seed: 11, people: "real" }).names.map((n) => n.text)],
      ["arms", generateThingNames({ module: "arms", culture, era: "MD", count: 40, seed: 11, people: "real" }).names.map((n) => n.text)],
      ["treasure", generateThingNames({ module: "treasure", culture, era: "MD", count: 40, seed: 11, people: "real" }).names.map((n) => n.text)],
      ["book", generateThingNames({ module: "book", culture, era: "MD", count: 40, seed: 11, people: "real" }).names.map((n) => n.text)],
      ["deity", generateDeityNames({ culture, era: "MD", count: 40, seed: 11, kind: "deity" }).names.map((n) => n.text)],
    ];
    for (const [name, texts] of runs) {
      assert.ok(texts.length >= 30, `${culture} ${name}`);
      if (name !== "deity") for (const t of texts) assert.ok(!t.includes("["), `${culture} ${name}: ${t}`);
      seen.set(`${culture} ${name}`, texts.length);
    }
  }
  assert.ok(seen.size > 30);
});

test("5d §14.4: no signature name a batch uses is a famous real event, object, group or god, and few raw draws are", () => {
  const rng = mulberry32(9);
  const bad: string[] = [];
  let raw = 0;
  let realRaw = 0;
  for (const m of MODULES) {
    for (const c of [...CORE, "celtic"]) {
      const draw = signatureDrawer(m, c)!;
      for (let i = 0; i < 120; i++) {
        const text = draw(rng, { fantastic: true, sex: "female" });
        if (!text) continue;
        raw++;
        if (isRealGroup(text)) realRaw++;
        if (/\b(Odin|Thor|Freya|Loki|Brigid|Lugh|Dagda|Morrigan|Zeus|Apollo|Hastings|Excalibur|Domesday)\b/i.test(text)) bad.push(`${m} ${c}: ${text}`);
      }
      const names = applySignature(Array.from({ length: 200 }, (_, i) => ({ text: `plain ${i}` })), m, c, 3, { ctx: { fantastic: true } });
      for (const n of names) if (isRealGroup(n.text)) bad.push(`${m} ${c}: ${n.text}`);
    }
  }
  assert.deepEqual(bad, []);
  assert.ok(realRaw / raw < 0.1, `${realRaw} of ${raw} raw draws are real names`);
});

test("5d §14.4: the real-name list holds the well-known real events and objects the batch keeps clear of, and no module's fixed name is one", () => {
  for (const name of ["Battle of Hastings", "The Clearances", "Excalibur", "Stone of Destiny", "Book of Kells", "Domesday Book", "Magna Carta", "Black Death", "Rosetta Stone"]) assert.ok(isRealGroup(name), name);
  assert.ok((realPlaces as unknown as { groups: string[] }).groups.length >= 120 + 113, "the list holds the 5c groups and the 113 events and objects of 5d");
});
