// Time and sky (docs/time-and-sky-brief.md): calendars and festivals, and sky lore.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cultureRows,
  eraSpan,
  layoutRing,
  parseCell,
  parseCycle,
  TIME_CULTURES,
  TIME_SKY,
  tableSystems,
  type TimeKind,
} from "../src/timesky/data";
import { breaksDeityWords } from "../src/deities/engine";
import { hasBannedWord } from "../src/groups/engine";
import { MONEY_DATA } from "../src/money/engine";
import { BUILT_IN_VOCAB, SEASON_KEYS } from "../src/settlement/vocab";

const normName = (s: string) => s.toLowerCase().replace(/[’]/g, "'").replace(/^the /, "").replace(/\s+/g, " ").trim();
const ALL_ROWS = () =>
  Object.entries(TIME_SKY.cultureNames).flatMap(([culture, kinds]) =>
    Object.entries(kinds).flatMap(([kind, rows]) => (rows ?? []).map((row) => ({ culture, kind: kind as TimeKind, row }))),
  );

// ── §16.1 Data ──────────────────────────────────────────────────────────────

test("§16.1: every system of §5 is present with the counts given, and no other", () => {
  const years: Record<string, number> = { "julian-12": 12, "romulus-10": 10, "numa-12": 12, "attic-12": 12, "bede-12": 12, "coligny-12": 12, "icelandic-12": 12, "egyptian-civil": 12, "ethiopian-13": 13, "lunar-12": 12, "persian-solar": 12, "babylonian-12": 12, "chinese-lunisolar": 12, "indian-lunisolar": 12, "lunar-12-13": 12, "aztec-18": 18, "maya-haab": 18, "fixed-13": 13, "darian-24": 24 };
  assert.deepEqual(Object.keys(TIME_SKY.years).sort(), Object.keys(years).sort());
  for (const [k, n] of Object.entries(years)) assert.equal(TIME_SKY.years[k].months, n, k);
  const weeks: Record<string, number> = { "week-7": 7, "nundinal-8": 8, "decade-10": 10, "market-4": 4, "rokuyo-6": 6, "day-signs-20": 20, "moon-nights-30": 30, "soviet-5": 5 };
  assert.deepEqual(Object.keys(TIME_SKY.weeks).sort(), Object.keys(weeks).sort());
  for (const [k, n] of Object.entries(weeks)) assert.equal(TIME_SKY.weeks[k].days, n, k);
  const cycles: Record<string, number | string> = { "quarters-4": 4, "season-starts-4": 4, seasons: "seasons", monthly: "months", "sekku-5": 5, "ritu-6": 6, "solar-terms-24": 24, "egyptian-3": 3 };
  assert.deepEqual(Object.keys(TIME_SKY.festivals).sort(), Object.keys(cycles).sort());
  for (const [k, n] of Object.entries(cycles)) assert.equal(TIME_SKY.festivals[k].count, n, k);
  const skies: Record<string, number> = { "zodiac-12": 12, "animals-12": 12, "mansions-28": 28, "nakshatras-27": 27, "day-signs-20": 20, "decans-36": 36, "classical-7": 7 };
  assert.deepEqual(Object.keys(TIME_SKY.skies).sort(), Object.keys(skies).sort());
  for (const [k, n] of Object.entries(skies)) assert.equal(TIME_SKY.skies[k].count, n, k);
  // The extra days and leap months of §5.1.
  assert.deepEqual(TIME_SKY.years["egyptian-civil"].extra, { count: 5 });
  assert.deepEqual(TIME_SKY.years["icelandic-12"].extra, { count: 4 });
  assert.deepEqual(TIME_SKY.years["bede-12"].leap, { after: [7] });
  assert.deepEqual(TIME_SKY.years["coligny-12"].leap, { after: [0, 6] });
  assert.deepEqual(TIME_SKY.years["chinese-lunisolar"].leap, { uniform: true });
  assert.deepEqual(TIME_SKY.leapShare, [7, 19]);
});

test("§16.1: every cell of the §5.5 tables names a listed system, and shares sum to 100", () => {
  const known = new Set([...Object.keys(TIME_SKY.years), ...Object.keys(TIME_SKY.weeks), ...Object.keys(TIME_SKY.festivals), ...Object.keys(TIME_SKY.skies)]);
  for (const key of tableSystems()) assert.ok(known.has(key), key);
  const cells: string[] = [
    ...Object.values(TIME_SKY.cells.months).flat(),
    ...Object.values(TIME_SKY.cells.days).flat(),
    ...Object.values(TIME_SKY.cells.festivals),
    ...Object.values(TIME_SKY.cells.signs).flat(),
    TIME_SKY.cells.monthsFuture,
    TIME_SKY.cells.monthsPlanetary,
  ];
  for (const cell of cells) {
    const parsed = parseCell(cell);
    if (parsed.length > 0) assert.equal(parsed.reduce((n, [, share]) => n + share, 0), 100, cell);
  }
  for (const c of TIME_CULTURES) {
    assert.equal(TIME_SKY.cells.months[c.key]?.length, 5, `months ${c.key}`);
    assert.equal(TIME_SKY.cells.days[c.key]?.length, 6, `days ${c.key}`);
    assert.ok(TIME_SKY.cells.festivals[c.key], `festivals ${c.key}`);
    assert.equal(TIME_SKY.cells.signs[c.key]?.length, 2, `signs ${c.key}`);
  }
  // Spot checks against the brief.
  assert.deepEqual(parseCell(TIME_SKY.cells.months.roman[0]), [["romulus-10", 20], ["numa-12", 40], ["julian-12", 40]]);
  assert.deepEqual(parseCell(TIME_SKY.cells.signs.egyptian[0]), [["decans-36", 100]]);
  assert.deepEqual(parseCell(TIME_SKY.cells.signs.bantu[1]), []);
});

test("§16.1: season cycles sum to 12, and every new-year season exists in the homeland cycle or carries into one", () => {
  for (const [biome, text] of Object.entries(TIME_SKY.seasonCycles)) {
    const cycle = parseCycle(text);
    assert.equal(cycle.reduce((n, [, s]) => n + s, 0), 12, biome);
    for (const [season] of cycle) assert.ok(SEASON_KEYS.includes(season), `${biome} ${season}`);
  }
  for (const [culture, text] of Object.entries(TIME_SKY.homelandCycles)) assert.equal(parseCycle(text).reduce((n, [, s]) => n + s, 0), 12, culture);
  for (const [culture, spec] of Object.entries(TIME_SKY.newYear)) {
    for (const text of typeof spec === "string" ? [spec] : Object.values(spec)) {
      const [season, offset] = text.split(" ");
      assert.ok(SEASON_KEYS.includes(season), `${culture} ${text}`);
      assert.ok(Number.isInteger(Number(offset)), `${culture} ${text}`);
    }
  }
  // §6.2: slots by largest remainder, at least one a season.
  assert.deepEqual(layoutRing(12, parseCycle("spring 3 · summer 3 · autumn 3 · winter 3")).map((s) => s.season).join(), "spring,spring,spring,summer,summer,summer,autumn,autumn,autumn,winter,winter,winter");
  assert.equal(layoutRing(10, parseCycle("spring 3 · summer 3 · autumn 3 · winter 3")).length, 10);
  assert.equal(layoutRing(13, parseCycle("rain 7 · flood 5")).length, 13);
  assert.equal(layoutRing(3, parseCycle("spring 3 · summer 3 · autumn 3 · winter 3")).filter((s) => s.season).length, 3);
  assert.deepEqual(layoutRing(12, parseCycle("flood 4 · winter 4 · harvest 4")).map((s) => s.season).join(), "flood,flood,flood,flood,winter,winter,winter,winter,harvest,harvest,harvest,harvest");
});

test("§16.1: every culture-name row's position is within its system's count, and every season tag is a key", () => {
  const counts = (sys: string) => TIME_SKY.years[sys]?.months ?? TIME_SKY.weeks[sys]?.days ?? 0;
  for (const { culture, kind, row } of ALL_ROWS()) {
    assert.ok(row.n.length > 0);
    for (const sys of row.sys ?? []) assert.ok(TIME_SKY.years[sys] || TIME_SKY.weeks[sys], `${culture} ${row.n}: ${sys}`);
    if (row.s) assert.ok(SEASON_KEYS.includes(row.s), `${culture} ${row.n}: ${row.s}`);
    if (typeof row.p === "number") {
      if (row.cyc) assert.ok(row.p <= (typeof TIME_SKY.festivals[row.cyc].count === "number" ? (TIME_SKY.festivals[row.cyc].count as number) : 18), `${culture} ${row.n}`);
      else for (const sys of row.sys ?? []) assert.ok(row.p <= counts(sys), `${culture} ${kind} ${row.n} ${row.p} in ${sys}`);
    }
    if (row.p === "leap") assert.ok((row.sys ?? []).every((s) => TIME_SKY.years[s]?.leap), `${culture} ${row.n}`);
    if (row.p === "extra") assert.ok((row.sys ?? []).every((s) => TIME_SKY.years[s]?.extra), `${culture} ${row.n}`);
    eraSpan(row.e);
  }
});

test("§16.1: no culture-name row matches the block list or a banned word", () => {
  const block = new Set(TIME_SKY.safeguards.block.map(normName));
  const banned = [...TIME_SKY.safeguards.banned, ...(TIME_SKY.safeguards.bannedFromMoney ? MONEY_DATA.safeguards.banned : [])].map((w) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu"));
  const names = [
    ...ALL_ROWS().flatMap(({ row }) => [row.n, ...(row.loan ? [row.loan] : [])]),
    ...Object.values(TIME_SKY.constellations).flat(),
    ...Object.values(TIME_SKY.lights).flatMap((l) => [...Object.values(l.planets ?? {}).flat(), l.milky, l.comet, l.nova].filter((x): x is string => !!x)),
    ...Object.values(TIME_SKY.daySigns).flat(),
  ];
  for (const name of names) {
    assert.ok(!block.has(normName(name)), `blocked: ${name}`);
    assert.ok(!hasBannedWord(name) && !banned.some((re) => re.test(name)), `banned: ${name}`);
  }
});

test("§16.1: DS's breaksDeityWords accepts every culture name of §8", () => {
  const names = [
    ...ALL_ROWS().flatMap(({ row }) => [row.n, ...(row.loan ? [row.loan] : [])]),
    ...Object.values(TIME_SKY.constellations).flat(),
    ...Object.values(TIME_SKY.lights).flatMap((l) => [...Object.values(l.planets ?? {}).flat(), l.milky, l.comet, l.nova].filter((x): x is string => !!x)),
    ...Object.values(TIME_SKY.daySigns).flat(),
    ...JSON.stringify(TIME_SKY.signNames).match(/"[^"]+"/g)!.map((s) => s.slice(1, -1)),
  ];
  for (const name of names) assert.ok(!breaksDeityWords(name), name);
});

test("§16.1: the omitted rows of §8 are absent", () => {
  const names = new Set(ALL_ROWS().map(({ row }) => normName(row.n)));
  for (const omitted of ["Flaying of Men", "Godless Month", "Mehregan", "Sadeh", "Inti Raymi", "Matariki", "Makahiki", "Muharram", "Nisan"]) assert.ok(!names.has(normName(omitted)), omitted);
  assert.equal(cultureRows("arabic-persian", "month").length, 0);
  assert.equal(cultureRows("indian", "day").length, 0);
  assert.ok(!cultureRows("japanese", "day").some((r) => r.p === 4 && r.sys?.includes("rokuyo-6")));
  assert.ok(!cultureRows("aztec", "month").some((r) => r.p === 2));
  assert.ok(!cultureRows("japanese", "month").some((r) => r.p === 10 && (r.e ?? "").startsWith("AN")));
  assert.equal(TIME_SKY.constellations.indian, undefined);
});

test("§16.1: the new pools exist, with season tags; other modules' pools are untouched", () => {
  for (const pool of ["seasonWord", "workWord", "dayWork", "dayElement", "skyFigure", "skyObject", "skyBodyPart", "skyQuality", "skyKin", "skyRiver", "skyHeaven", "festNoun", "festBlessing", "extraDays"]) {
    assert.ok(BUILT_IN_VOCAB.pools[pool]?.entries.length > 0, pool);
  }
  for (const e of BUILT_IN_VOCAB.pools.seasonWord.entries) for (const s of e.s ?? []) assert.ok(SEASON_KEYS.includes(s), `${e.w}: ${s}`);
  for (const e of BUILT_IN_VOCAB.pools.workWord.entries) assert.ok(e.wk && e.s && e.s.length > 0, e.w);
  const harvest = BUILT_IN_VOCAB.pools.seasonWord.entries.filter((e) => e.w === "Harvest");
  assert.deepEqual(harvest.map((e) => [e.s, e.x]), [[["autumn"], 3], [["harvest"], 3]]);
});
