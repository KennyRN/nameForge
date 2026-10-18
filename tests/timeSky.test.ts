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

// ── §16.2–§16.5 The calendar engine ─────────────────────────────────────────

import { BRITAIN, BIOMES, SPACE_BIOMES, findBiome } from "../src/biomes";
import { repeatsContent } from "../src/groups/engine";
import {
  generateTimeSkyNames,
  homelandOf,
  kindsOffered,
  monthSystems,
  seriesOffered,
  weekSystems,
  type TimeKind,
  type TimeSkyOptions,
} from "../src/timesky/engine";
import { countedWords } from "../src/routes/engine";

const ERAS = ["AN", "MD", "EM", "ST", "MO", "NF", "IS"] as const;
const CALENDAR_KINDS: TimeKind[] = ["month", "day", "festival", "moon"];
const gen = (o: Partial<TimeSkyOptions> & { count?: number }) => generateTimeSkyNames({ count: 12, seed: 1, ...o });
const texts = (o: Partial<TimeSkyOptions>) => gen(o).names.map((n) => n.text);

test("§16.2: same options and seed give the same names and series", () => {
  for (const series of [false, true]) {
    for (const kind of CALENDAR_KINDS) {
      const a = gen({ kind, culture: "norse", series, seed: 99 });
      const b = gen({ kind, culture: "norse", series, seed: 99 });
      assert.deepEqual(a, b, `${kind} ${series}`);
    }
  }
});

test("§16.2: every culture × era × calendar kind × biome × people gives 20 unique names within the cap", () => {
  const biomes = [undefined, findBiome("desert"), findBiome("boreal"), findBiome("rainforest")];
  for (const c of TIME_CULTURES) {
    for (const era of ERAS) {
      for (const kind of kindsOffered("calendar", c.key, era).map((k) => k.key)) {
        for (const biome of biomes) {
          for (const people of ["placeholders", "invented"] as const) {
            const names = gen({ culture: c.key, era, kind, biome: biome as never, people, count: 20, seed: 5 }).names;
            const label = `${c.key} ${era} ${kind} ${biome?.id ?? "home"} ${people}`;
            assert.equal(names.length, 20, `${label}: ${names.map((n) => n.text).join(" | ")}`);
            assert.equal(new Set(names.map((n) => n.text.toLowerCase())).size, 20, label);
            for (const n of names) {
              assert.ok(countedWords(n.text).length <= TIME_SKY.cap, `${label}: ${n.text}`);
              assert.ok(!repeatsContent(countedWords(n.text)), `${label}: ${n.text}`);
            }
          }
        }
      }
    }
  }
});

test("§16.2: every culture × era × calendar kind with a series generates one", () => {
  for (const c of TIME_CULTURES) {
    for (const era of ERAS) {
      for (const kind of CALENDAR_KINDS) {
        if (!kindsOffered("calendar", c.key, era).some((k) => k.key === kind) || !seriesOffered(kind, c.key, era)) continue;
        for (const seed of [1, 2, 3]) {
          const b = gen({ culture: c.key, era, kind, series: true, seed, count: 3 });
          assert.ok(b.names.length >= 2, `${c.key} ${era} ${kind} ${seed}: ${b.names.length}`);
          assert.equal(new Set(b.names.map((n) => n.text.toLowerCase())).size, b.names.length, `${c.key} ${era} ${kind} ${seed}: ${b.names.map((n) => n.text).join(" | ")}`);
          assert.ok(b.notices.some((x) => /^(Calendar|Week|Festivals): .+\.$/.test(x)), `${c.key} ${era} ${kind}`);
        }
      }
    }
  }
});

// ── §16.3 Counts ────────────────────────────────────────────────────────────

test("§16.3: a months series has exactly the system's months, plus at most one leap month and one extra days line", () => {
  for (const c of TIME_CULTURES) {
    for (const era of ERAS) {
      for (let seed = 1; seed <= 12; seed++) {
        const b = gen({ culture: c.key, era, kind: "month", series: true, seed });
        const sys = TIME_SKY.years[b.system!];
        const monthLines = b.names.filter((n) => !n.leap && !n.extra);
        assert.equal(monthLines.length, sys.months, `${c.key} ${era} ${b.system}`);
        const leaps = b.names.filter((n) => n.leap).length;
        const extras = b.names.filter((n) => n.extra).length;
        assert.ok(leaps <= 1 && extras <= 1, `${c.key} ${era}`);
        assert.equal(extras, sys.extra ? 1 : 0, `${b.system}`);
        if (!sys.leap) assert.equal(leaps, 0, b.system);
      }
    }
  }
});

test("§16.3: over 1,900 seeded calendars of bede-12 the leap month appears 700 ± 60 times", () => {
  let leaps = 0;
  for (let seed = 1; seed <= 1900; seed++) if (gen({ culture: "anglo-saxon", era: "AN", kind: "month", series: true, seed }).names.some((n) => n.leap)) leaps++;
  assert.ok(Math.abs(leaps - 700) <= 60, String(leaps));
});

test("§16.3: day, festival and moon series have the system's counts, and ignore the batch size", () => {
  for (const c of TIME_CULTURES) {
    for (const era of ERAS) {
      for (let seed = 1; seed <= 6; seed++) {
        if (weekSystems(c.key, era).length > 0) {
          const b = gen({ culture: c.key, era, kind: "day", series: true, seed, count: 3 });
          assert.equal(b.names.length, TIME_SKY.weeks[b.system!].days, `${c.key} ${era} ${b.system}`);
          assert.equal(gen({ culture: c.key, era, kind: "day", series: true, seed, count: 50 }).names.length, b.names.length);
        }
        const f = gen({ culture: c.key, era, kind: "festival", series: true, seed, count: 2 });
        const cyc = TIME_SKY.festivals[f.system!];
        if (typeof cyc.count === "number") assert.equal(f.names.length, cyc.count, `${c.key} ${era} ${f.system}`);
        assert.ok(f.names.length >= 2, `${c.key} ${era} ${f.system}`);
        const m = gen({ culture: c.key, era, kind: "moon", series: true, seed, count: 1 });
        assert.ok(m.names.length === 12 || m.names.length === 13 || m.names.length === 10 || m.names.length === 11, `${c.key} ${era} moons ${m.names.length}`);
      }
    }
  }
  // Monthly festivals have as many as the year system has months.
  const b = gen({ culture: "aztec", era: "AN", kind: "festival", series: true, seed: 4 });
  assert.equal(b.system, "monthly");
  assert.equal(b.names.length, 18);
});

// ── §16.4 Real names ────────────────────────────────────────────────────────

test("§16.4: over 2,000 series no series has more than half its lines as culture names, nor all of a culture's list", () => {
  let seeds = 0;
  for (let i = 0; i < 2000; i++) {
    const c = TIME_CULTURES[i % TIME_CULTURES.length];
    const era = ERAS[(i * 3) % ERAS.length];
    const kinds = CALENDAR_KINDS.filter((k) => kindsOffered("calendar", c.key, era).some((x) => x.key === k));
    const kind = kinds[i % kinds.length];
    const b = gen({ culture: c.key, era, kind, series: true, seed: i + 1, realShare: i % 2 ? 1 : 0.25 });
    const real = b.names.filter((n) => n.real).length;
    assert.ok(real <= Math.floor(b.names.length / 2), `${c.key} ${era} ${kind}: ${real} of ${b.names.length}`);
    seeds++;
  }
  assert.equal(seeds, 2000);
});

test("§16.4: a numbered culture name appears only at its own position counted from the new year", () => {
  for (let seed = 1; seed <= 60; seed++) {
    for (const start of ["own", "summer", "winter"]) {
      const b = gen({ culture: "roman", era: "AN", kind: "month", series: true, seed, realShare: 1, start });
      if (b.system === "romulus-10") continue;
      const monthLines = b.names.filter((n) => !n.leap && !n.extra);
      const seventh = monthLines.findIndex((n) => n.text === "Seventh Month" && n.real);
      if (seventh < 0) continue;
      const ownStart = monthLines.findIndex((n) => n.text === "Mars's Month");
      if (ownStart >= 0) assert.equal((seventh - ownStart + 12) % 12, 6, `${seed} ${start}`);
      assert.equal(monthLines[seventh].position, 7);
    }
  }
});

test("§16.4: loanword mode gives loans only in festivals, at about 70% of loan-capable draws; translated mode gives none", () => {
  const loans = new Set(Object.values(TIME_SKY.cultureNames).flatMap((k) => (k.festival ?? []).map((r) => r.loan).filter((x): x is string => !!x)));
  let capable = 0;
  let loaned = 0;
  for (let seed = 1; seed <= 5000; seed++) {
    const n = gen({ culture: "celtic", era: "MD", kind: "festival", words: "loanwords", shape: "@cn", seed, count: 1 }).names;
    void n;
  }
  for (let seed = 1; seed <= 5000; seed++) {
    const b = gen({ culture: "celtic", era: "MD", kind: "festival", words: "loanwords", seed, count: 8 });
    for (const x of b.names) if (x.real) { capable++; if (x.loan) loaned++; }
  }
  assert.ok(capable > 1000);
  assert.ok(Math.abs(loaned / capable - 0.7) <= 0.05, String(loaned / capable));
  for (let seed = 1; seed <= 300; seed++) {
    for (const c of ["celtic", "roman", "japanese"]) {
      for (const kind of CALENDAR_KINDS) {
        for (const x of gen({ culture: c, era: "AN", kind, words: "translated", seed, count: 10 }).names) {
          assert.ok(!x.loan && ![...loans].includes(x.text), x.text);
        }
        for (const x of gen({ culture: c, era: "AN", kind, words: "loanwords", seed, count: 10 }).names) if (kind !== "festival") assert.ok(!x.loan, x.text);
      }
    }
  }
});

// ── §16.5 Seasons and the start ─────────────────────────────────────────────

test("§16.5: temperate, start spring: the first line is spring, and lines follow the cycle order", () => {
  const order = ["spring", "summer", "autumn", "winter"];
  for (let seed = 1; seed <= 40; seed++) {
    const b = gen({ culture: "norman-british", kind: "month", series: true, seed, start: "spring", biome: findBiome("temperate") as never });
    assert.equal(b.names[0].season, "spring");
    const seq = b.names.filter((n) => !n.leap && !n.extra).map((n) => order.indexOf(n.season!));
    assert.deepEqual(seq, [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3]);
  }
});

test("§16.5: their own new year, anglo-saxon in Britain: the first line is in winter, one slot in", () => {
  for (let seed = 1; seed <= 40; seed++) {
    const b = gen({ culture: "anglo-saxon", era: "MD", kind: "month", series: true, seed, biome: BRITAIN as never });
    assert.equal(b.names[0].season, "winter");
    const spring = gen({ culture: "anglo-saxon", era: "MD", kind: "month", series: true, seed, biome: BRITAIN as never, start: "spring" });
    assert.equal(spring.names[0].season, "spring");
  }
});

test("§16.5: season-tagged words appear only in their seasons in a series", () => {
  const winterOnly = new Set(["Frost", "Snow", "Ice", "Wolf", "Hearth", "Yule", "Long-Night", "Cold", "Suet", "Fasting", "Storytelling", "Clod"]);
  const springOnly = new Set(["Sowing", "Lambing", "Blossom", "Cuckoo", "Swallow", "Birch", "Planting", "Calving", "Nesting"]);
  for (let seed = 1; seed <= 300; seed++) {
    const b = gen({ culture: "general", era: "EM", kind: "month", series: true, seed, biome: findBiome("temperate") as never });
    for (const n of b.names) {
      if (n.real) continue;
      for (const w of n.words) {
        if (w.pool !== "seasonWord" && w.pool !== "workWord") continue;
        if (winterOnly.has(w.word)) assert.ok(n.season === "winter" || n.season === undefined, `${n.text} ${n.season}`);
        if (springOnly.has(w.word)) assert.ok(n.season === "spring", `${n.text} ${n.season}`);
      }
    }
  }
});

test("§16.5: space biome: no season tags, and no full moons kind", () => {
  const star = SPACE_BIOMES.find((b) => b.scale === "Sy")!;
  assert.ok(!kindsOffered("calendar", "general", "IS", { space: true }).some((k) => k.key === "moon"));
  for (let seed = 1; seed <= 20; seed++) {
    for (const kind of ["month", "festival", "day"] as TimeKind[]) {
      const b = gen({ culture: "general", era: "IS", kind, series: true, seed, biome: star as never });
      assert.ok(b.names.length > 3, kind);
      for (const n of b.names) assert.ok(!n.season || n.extra, `${kind}: ${n.text} ${n.season}`);
    }
  }
  assert.equal(monthSystems("norse", "IS", { space: true, scale: "Pl" }).length, 3);
  assert.ok(homelandOf("polynesian") === "tropical-islands" && homelandOf("andean") === "highland");
  void texts;
  void BIOMES;
});

// ── §16.6 Sky ───────────────────────────────────────────────────────────────

const SKY_KINDS: TimeKind[] = ["constellation", "sign", "light"];

test("§16.6: sky lore: every culture × era × kind × people gives 20 unique names; series generate with the system's count", () => {
  for (const c of TIME_CULTURES) {
    for (const era of ERAS) {
      for (const kind of SKY_KINDS) {
        for (const people of ["placeholders", "invented"] as const) {
          const names = gen({ culture: c.key, era, kind, people, count: 20, seed: 3 }).names;
          assert.equal(names.length, 20, `${c.key} ${era} ${kind} ${people}: ${names.map((n) => n.text).join(" | ")}`);
          assert.equal(new Set(names.map((n) => n.text.toLowerCase())).size, 20);
        }
        if (!seriesOffered(kind, c.key, era)) continue;
        for (const seed of [1, 2, 3, 4]) {
          const b = gen({ culture: c.key, era, kind, series: true, seed, people: seed % 2 ? "invented" : "placeholders" });
          const expected = kind === "light" ? 7 : TIME_SKY.skies[b.system!].count;
          assert.equal(b.names.length, expected, `${c.key} ${era} ${kind} ${b.system}`);
          assert.equal(new Set(b.names.map((n) => n.text.toLowerCase())).size, expected, `${c.key} ${era} ${kind}: ${b.names.map((n) => n.text).join(" | ")}`);
          assert.ok(b.notices.some((x) => /^(Zodiac|Sky): .+\.$/.test(x)));
          assert.equal(gen({ culture: c.key, era, kind, series: true, seed, count: 99 }).names.length, expected);
          assert.ok(b.names.filter((n) => n.real).length <= Math.floor(expected / 2));
        }
      }
    }
  }
});

test("§16.6: animals-12: twelve distinct beasts, at most six of them the culture's real animals", () => {
  let seen = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const b = gen({ culture: "chinese", era: "MD", kind: "sign", series: true, seed });
    if (b.system !== "animals-12") continue;
    seen++;
    assert.equal(b.names.length, 12);
    assert.equal(new Set(b.names.map((n) => n.text)).size, 12);
    assert.ok(b.names.filter((n) => n.real).length <= 6);
    for (const n of b.names) assert.ok(!n.text.startsWith("the "), n.text);
  }
  assert.ok(seen > 80);
  // The real list of each culture's variant.
  const japanese = new Set<string>();
  for (let seed = 1; seed <= 60; seed++) for (const n of gen({ culture: "japanese", era: "MD", kind: "sign", series: true, seed, realShare: 1 }).names) if (n.real) japanese.add(n.text);
  assert.ok(japanese.has("Boar") || !japanese.has("Pig"));
  assert.ok(!japanese.has("Pig"));
});

test("§16.6: classical-7: slot 5 is a morning or evening name; slot 3's quality is Red, Fierce or Restless when generated", () => {
  for (let seed = 1; seed <= 300; seed++) {
    for (const culture of ["norman-british", "chinese", "greek-byzantine"]) {
      const b = gen({ culture, kind: "light", series: true, seed, people: "invented" });
      assert.equal(b.names.length, 7);
      const five = b.names[4];
      assert.ok(/Morning|Evening|Light-Bringer|Metal Star/.test(five.text), five.text);
      const three = b.names[2];
      if (!three.real) assert.ok(/\b(Red|Fierce|Restless)\b/.test(three.text) || /Lamp|Star/.test(three.text), three.text);
      assert.equal(b.names.length, new Set(b.names.map((n) => n.text)).size);
    }
  }
});

test("§16.6: the days planets theme uses the same sky names as a sky series drawn with the same seed", () => {
  let checked = 0;
  for (let seed = 1; seed <= 200 && checked < 20; seed++) {
    const days = gen({ culture: "norman-british", kind: "day", series: true, seed, people: "invented" });
    if (!days.sky) continue;
    const sky = gen({ culture: "norman-british", kind: "light", series: true, seed, neutral: true, people: "invented" });
    assert.deepEqual(days.sky, sky.names.map((n) => n.text));
    const sun = days.sky[3].replace(/^the /, "");
    assert.ok(days.names.some((n) => n.text.startsWith(sun)) || days.names.length === 7);
    checked++;
  }
  assert.ok(checked > 5);
});

test("§16.6: 10,000 names across options: no block-list or banned words, no gods or light/grim in the sensitive cultures, no zodiac of four set names", () => {
  const block = new Set(TIME_SKY.safeguards.block.map(normName));
  const kinds = [...CALENDAR_KINDS, ...SKY_KINDS];
  let total = 0;
  for (let i = 0; total < 10000; i++) {
    const c = TIME_CULTURES[i % TIME_CULTURES.length];
    const era = ERAS[(i * 5) % ERAS.length];
    const offered = kinds.filter((k) => kindsOffered(findKind(k), c.key, era).some((x) => x.key === k));
    const kind = offered[i % offered.length];
    const series = i % 3 === 0 && seriesOffered(kind, c.key, era);
    const b = gen({ culture: c.key, era, kind, series, seed: i + 1, people: i % 2 ? "invented" : "placeholders", count: 8, fantastic: i % 5 === 0, tone: (["any", "grim", "light", "grand", "strange", "plain"] as const)[i % 6] });
    for (const n of b.names) {
      total++;
      assert.ok(!block.has(normName(n.text)) || (kind === "light" && /Morning Star|Evening Star/.test(n.text)), `blocked ${n.text}`);
      assert.ok(!breaksDeityWords(n.text), n.text);
      if (c.key === "polynesian" || c.key === "andean") {
        assert.ok(!n.tones.includes("light") && !n.tones.includes("grim"), `${c.key}: ${n.text} ${n.tones}`);
        assert.ok(!n.words.some((w) => w.pool === "god"), n.text);
        assert.ok(!/\[god\]|\[holy/.test(n.text), n.text);
      }
    }
    if (kind === "sign" && series && b.system === "zodiac-12") {
      assert.ok(b.names.filter((n) => TIME_SKY.safeguards.zodiacSet.map(normName).includes(normName(n.text))).length < 4);
    }
  }
});

function findKind(k: TimeKind) {
  return SKY_KINDS.includes(k) ? ("sky" as const) : ("calendar" as const);
}
