// Shared lens brief §6.1, §7.2 (M3a): the coverage framework's rules, hand-counted cells for two modules,
// and a check that the adapters read the shared pools the documented modules read.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vocabData from "../src/data/settlement-vocab.json";
import { LENS_MODULES } from "../src/lens";
import { buildCoverage, COVERAGE_ADAPTERS, moduleCoverage } from "../src/coverage";
import { type CoverageAdapter, makeRow, vocabularyRows, VOCAB_POOL_NAMES, eraReading, cultureTags, regionMultipliers } from "../src/coverageRows";
import { poolReaders, POOL_READER_TEXT, READER_PHRASES } from "../src/coverageReaders";
import { renderCoverageMarkdown } from "../src/coverageReport";

const adapterOf = (module: string) => COVERAGE_ADAPTERS.find((a) => a.module === module)!;
const cell = (module: string, culture: string) => {
  const c = moduleCoverage(adapterOf(module)).cultures[culture];
  return `${c.words}/${c.shapes}`;
};

// ── The rules (§6.1) ───────────────────────────────────────────────────────

test("an entry counts once per lens culture it is restricted to; open entries and exclusions count as open", () => {
  assert.deepEqual(cultureTags("routeNames", { c: ["anglo-saxon", "norman-british"] }), ["english"], "two legacy keys, one lens culture, counted once");
  assert.deepEqual(cultureTags("routeNames", { c: ["norse", "roman"] }), ["scandinavian", "roman"]);
  assert.equal(cultureTags("routeNames", {}), undefined, "no tag: open");
  assert.equal(cultureTags("routeNames", { c: ["!indian", "!west-african"] }), undefined, "exclusions: open, not signature");
  assert.deepEqual(cultureTags("routeNames", { c: ["!indian", "roman"] }), ["roman"], "a positive tag beside an exclusion is signature");
  assert.deepEqual(cultureTags("routeNames", { c: ["british"] }), ["english", "welsh", "scottish", "irish"], "a group expands to its lens cultures");
  assert.equal(cultureTags("routeNames", { culture: "general" }), undefined, "general is the unmarked baseline");
});

test("five or more eras read as open; a land module reads the land band as one", () => {
  assert.deepEqual(eraReading("routeNames", ["AN", "MD"]), ["AN", "MD"]);
  assert.equal(eraReading("routeNames", ["MD", "EM", "ST", "MO", "NF", "IS"]), undefined, "six eras: open");
  assert.equal(eraReading("routeNames", ["AN", "MD", "EM", "ST", "MO"]), undefined, "five eras: open");
  assert.deepEqual(eraReading("routeNames", ["EM"]), ["EM"], "an urban module keeps the three apart");
  // A land module: one band era covers EM, ST and MO, and with AN and MD that is five.
  assert.deepEqual(eraReading("mountainNames", ["ST"]), ["EM", "ST", "MO"]);
  assert.deepEqual(eraReading("mountainNames", ["AN", "ST"]), ["AN", "EM", "ST", "MO"], "AN and the band: four eras, kept");
  assert.equal(eraReading("mountainNames", ["AN", "MD", "ST"]), undefined, "AN, MD and the band: five, so open");
});

test("fixed whole names are words; a table's own culture and `cultureExtra` words are signature", () => {
  const fixed = makeRow({ f: "fixed", culture: "norse" }, { module: "mountainNames", source: "cultureShapes" });
  assert.equal(fixed.type, "word");
  assert.deepEqual(fixed.cultures, ["scandinavian"]);
  assert.equal(makeRow({}, { module: "mountainNames", source: "shapes/x" }).type, "shape");
  // routeGoods' extras for a culture are rows for that culture, counted as words.
  const rows = vocabularyRows("routeNames").filter((r) => r.source === "routeGoods/cultureExtra");
  const extras = (vocabData as unknown as { pools: Record<string, { cultureExtra: Record<string, unknown[]> }> }).pools.routeGoods.cultureExtra;
  assert.equal(rows.length, Object.values(extras).reduce((n, w) => n + w.length, 0));
  assert.ok(rows.every((r) => r.type === "word" && r.cultures && r.cultures.length > 0));
});

test("region tables read as the regions an entry is restricted to or multiplied for", () => {
  assert.deepEqual(regionMultipliers({ COR: 0, SHH: 3, NSI: 0.5, SLO: 1 }), ["SHH", "SLO"], "multiplied (×3) and, where others are barred, the unchanged one");
  assert.deepEqual(regionMultipliers({ COR: 1, SHH: 1 }), undefined, "no change: no region");
});

test("a module's cells: culture targets by tier, excluded and unoffered cultures, the land band", () => {
  const adapter: CoverageAdapter = {
    module: "mountainNames",
    kinds: ["range"],
    roster: ["general", "norse", "anglo-saxon"],
    excluded: [{ cultures: ["polynesian"] }],
    regions: true,
    rows: () => [
      { module: "mountainNames", kind: "range", type: "word", source: "w", cultures: ["scandinavian"], n: 1 },
      { module: "mountainNames", kind: "range", type: "shape", source: "s", cultures: ["scandinavian"], eras: ["EM", "ST", "MO"], tones: ["grim"], regions: ["SHH"], n: 1 },
      { module: "mountainNames", kind: "range", type: "shape", source: "s", n: 1 },
    ],
  };
  const m = moduleCoverage(adapter);
  assert.deepEqual([m.cultures.scandinavian.words, m.cultures.scandinavian.shapes], [1, 1]);
  assert.deepEqual(m.cultures.scandinavian.target, { words: 30, shapes: 10 }, "core tier");
  assert.equal(m.cultures.scandinavian.below, true);
  assert.deepEqual(m.cultures.roman.notOffered, true, "not in the roster");
  assert.equal(m.cultures.polynesian.excluded, true);
  assert.equal(m.cultures.polynesian.below, false);
  assert.equal(m.cultures.french.target?.words, 12, "second tier");
  assert.deepEqual([m.eras.EM, m.eras.ST, m.eras.MO, m.eras.AN], [1, 1, 1, 0]);
  assert.equal(m.tones.grim, 1);
  assert.equal(m.regions?.SHH, 1);
  assert.equal(m.kinds.range, 1, "only the culture-free shape is open to general");
});

// ── Hand-counted cells ─────────────────────────────────────────────────────

// Counted by hand from the data. Mountains: a culture's own wild lands shapes (`f: "fixed"` ones are words),
// the `{wildWeather} Monastery` and `Temple` settlement shapes tagged for Chinese and Indian, and the words
// of the shared pools "wild lands" reads that are tagged for the culture (Chinese 3, Indian 3, Norse 0).
test("mountains: Chinese 3 fixed names and 3 pool words, 2 settlement shapes", () => assert.equal(cell("mountainNames", "chinese"), "6/2"));
test("mountains: Indian 2 fixed names and 3 pool words, 2 settlement shapes", () => assert.equal(cell("mountainNames", "indian"), "5/2"));
test("mountains: Norse 3 fixed names, no tagged pool word, no shape", () => assert.equal(cell("mountainNames", "scandinavian"), "3/0"));

// Inns: a culture's `cultureShapes` list (Norse 4, Japanese 4, Polynesian 2) and the tagged words of the
// pools "inns and taverns" reads (Norse 3, Japanese 23, Polynesian 1).
test("inns and taverns: Norse 3 words and 4 shapes", () => assert.equal(cell("innNames", "scandinavian"), "3/4"));
test("inns and taverns: Japanese 23 words and 4 shapes", () => assert.equal(cell("innNames", "japanese"), "23/4"));
test("inns and taverns: Polynesian 1 word and 2 shapes", () => assert.equal(cell("innNames", "polynesian"), "1/2"));

// ── Adapters and the reader table ──────────────────────────────────────────

test("the reader texts agree with the document's table, pool by pool", () => {
  const rows = readFileSync("docs/vocabulary-pools.md", "utf8")
    .split("\n")
    .filter((l) => l.startsWith("| `"))
    .map((l) => l.split("|").map((c) => c.trim()))
    .filter((cells) => cells.length === 6) // the pools table: pool, holds, tags, read by (the entry-key table has three columns)
    .map((cells) => ({ pool: cells[1].replace(/`/g, ""), readers: cells[cells.length - 2] }));
  assert.equal(rows.length, VOCAB_POOL_NAMES.length, "the document lists every pool");
  for (const { pool, readers } of rows) {
    assert.equal(POOL_READER_TEXT[pool], readers, `readers of ${pool}`);
    // Every phrase the document uses is one the adapters know.
    for (const phrase of readers.split(/[,;]/).map((p) => p.trim()).filter((p) => p)) assert.ok(READER_PHRASES[phrase], `“${phrase}” (${pool}) is a known module name`);
  }
});

test("every adapter reads exactly the shared pools the document says its module reads", () => {
  const pools = (vocabData as unknown as { pools: Record<string, { entries: unknown[]; cultureExtra?: Record<string, unknown[]> }> }).pools;
  for (const adapter of COVERAGE_ADAPTERS) {
    const sources = new Set(adapter.rows().map((r) => r.source.replace(/\/cultureExtra$/, "")));
    const read = Object.keys(pools).filter((p) => poolReaders(p).includes(adapter.module));
    for (const pool of read) {
      const has = pools[pool].entries.length > 0 || Object.keys(pools[pool].cultureExtra ?? {}).length > 0;
      assert.equal(sources.has(pool), has, `${adapter.module} ${has ? "reads" : "has no entries in"} ${pool}`);
    }
    for (const pool of Object.keys(pools)) if (!read.includes(pool)) assert.ok(!sources.has(pool), `${adapter.module} reads ${pool}, which the document doesn't list for it`);
  }
});

test("every module in the lens either has an adapter or is listed as not yet reported", () => {
  const report = buildCoverage();
  const have = new Set(report.modules.map((m) => m.module));
  for (const adapter of COVERAGE_ADAPTERS) assert.ok(have.has(adapter.module));
  assert.equal(new Set(COVERAGE_ADAPTERS.map((a) => a.module)).size, COVERAGE_ADAPTERS.length, "no module twice");
  assert.equal(have.size + report.withoutAdapter.length, 47, "the 47 lens modules, reported or pending");
});

test("the report builds and reads in British English with its cells marked", () => {
  const text = renderCoverageMarkdown();
  assert.match(text, /^# Coverage report/);
  assert.match(text, /## 1\. Module × culture/);
  assert.match(text, /## 6\. Thin pools/);
  assert.doesNotMatch(text, /\b(color|neighbor|center)\b/i);
});

test("adapters are pure: running them twice gives the same rows", () => {
  for (const adapter of COVERAGE_ADAPTERS) assert.deepEqual(adapter.rows(), adapter.rows(), adapter.module);
});

// ── M3b: realms hand-counted, and every module reports ─────────────────────

test("realms: hand-counted cells (words/shapes), counted by hand from realms.json", () => {
  // A culture's own forms, its qualifying words (cultQualExtra), its tribal noun and its homeland word.
  assert.equal(cell("realms", "chinese"), "3/0", "cultQualExtra 2 + tribal 1");
  assert.equal(cell("realms", "scandinavian"), "4/0", "norse: forms 2 + cultQualExtra 1 + tribal 1");
  assert.equal(cell("realms", "egyptian"), "5/0", "forms 1 + cultQualExtra 3 + tribal 1");
  assert.equal(cell("realms", "english"), "5/0", "anglo-saxon tribal 1; norman-british forms 2 + tribal 1 + homeland 1");
  // Entries confined to an era: the weighted forms (era weights above nought), the modifiers and the
  // ideology words; ST has none because the realms have no steam age.
  assert.deepEqual(moduleCoverage(adapterOf("realms")).eras, { AN: 8, MD: 26, EM: 30, ST: 0, MO: 30, NF: 34, IS: 42 });
});

test("every module in the lens has an adapter and reports, none left 'not yet reported'", () => {
  const report = buildCoverage();
  assert.deepEqual(report.withoutAdapter, []);
  assert.equal(report.modules.length, LENS_MODULES.length);
  assert.deepEqual(report.modules.map((m) => m.module).sort(), [...LENS_MODULES].sort());
  // Only the settlement kit has no tables of its own; every other module reports rows.
  for (const m of report.modules) assert.ok(m.noTables ? m.module === "settlementKit" : m.rowCount > 0, `${m.module} has rows`);
  assert.match(renderCoverageMarkdown(report), /Realms|realms/);
  assert.doesNotMatch(renderCoverageMarkdown(report), /Not yet reported/);
});

test("the deity and money exclusions read 'excluded', and the deity pair excludes Polynesian and Andean", () => {
  for (const module of ["deityNames", "sacredPlaces"]) {
    const m = moduleCoverage(adapterOf(module));
    assert.ok(m.cultures["polynesian"].excluded && m.cultures["andean"].excluded, `${module}: excluded`);
    assert.equal(m.cultures["polynesian"].below, false);
  }
});
