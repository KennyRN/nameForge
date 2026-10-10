// Ships and spacecraft (Ships and spacecraft brief §16).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  availableFunctions,
  flavourAnimals,
  generateVesselNames,
  inRange,
  techChoices,
  VESSEL_CULTURES,
  VESSEL_DATA,
  type VesselEntry,
  type VesselModule,
  type VesselName,
  type VesselOptions,
} from "../src/vessels/engine";
import { GROUP_DATA, type GroupSetting } from "../src/groups/engine";

const SETTINGS: Record<GroupSetting, Pick<VesselOptions, "genre" | "fantastic">> = {
  FL: { genre: "fantasy", fantastic: false },
  FH: { genre: "fantasy", fantastic: true },
  MR: { genre: "modern", fantastic: false },
  MF: { genre: "modern", fantastic: true },
  SF: { genre: "scifi", fantastic: false },
};
const MODULE_SETTINGS: Record<VesselModule, GroupSetting[]> = { ships: ["FL", "FH", "MR", "MF", "SF"], spacecraft: ["MR", "MF", "SF"] };

/** Up to n names from batches of 100 (one batch can't hold 2,000 unique names for every culture). */
function many(o: Omit<VesselOptions, "count" | "seed">, n: number): VesselName[] {
  const out: VesselName[] = [];
  for (let seed = 1; out.length < n && seed < n; seed++) out.push(...generateVesselNames({ ...o, count: 100, seed }).names);
  return out.slice(0, n);
}

const entryWords = (entries: VesselEntry[] | undefined) => (entries ?? []).map((e) => e.w);
const culture = (key: string) => VESSEL_CULTURES.find((c) => c.key === key)!;
const hasWord = (text: string, word: string) => new RegExp(`(^|[^A-Za-z])${word}($|[^A-Za-z])`).test(text);

// ── §16.1 Data ──────────────────────────────────────────────────────────────

test("§16.1: 34 cultures in §3.1 order, spans inside T1–T7", () => {
  assert.deepEqual(
    VESSEL_CULTURES.map((c) => c.key),
    [
      "general", "anglo-saxon", "norse", "celtic", "norman-british", "french", "dutch", "iberian", "roman", "greek-byzantine", "slavic", "steppe",
      "arabic-persian", "ottoman", "swahili-omani", "egyptian", "ethiopian", "bantu", "west-african", "indian", "malay", "chinese", "japanese",
      "korean", "hawaiian", "maori", "w-polynesian", "american", "nw-coast", "arctic", "na-woodlands", "aztec", "maya", "andean",
    ],
  );
  for (const c of VESSEL_CULTURES) {
    const [lo, hi] = c.span.split("-").map((l) => parseInt(l.slice(1), 10));
    assert.ok(c.span.startsWith("T") && lo >= 1 && hi <= 7 && lo <= hi, `${c.key} span ${c.span}`);
  }
});

test("§16.1: every role and list named exists; weights are positive but for §7.3's zeros", () => {
  const roles = new Set(VESSEL_DATA.roles);
  for (const module of ["ships", "spacecraft"] as VesselModule[]) {
    for (const weights of Object.values(VESSEL_DATA.roleWeights[module])) for (const role of Object.keys(weights)) assert.ok(roles.has(role), role);
  }
  const shapes = [...VESSEL_DATA.shapes, ...VESSEL_CULTURES.flatMap((c) => c.shapes ?? [])];
  for (const s of shapes) assert.ok(roles.has(s.role) && s.w > 0, `${s.role} ${s.p}`);
  const special = new Set(["town", "surname", "womanName", "person", "president", "scientist", "holy", "n", "ordinal", "poetic", "god", "cultureNoun", "techAdj", "techNoun", "name", "colonyName", "numberWord", "menaceExtra"]);
  const gn = new Set(["colour", "number", "ordinalWord", "greek", "land", "spaceLand", "compass", "star", "brandRoot", "surname", "weapon", "tech", "beast"]);
  const stylePools = new Set(VESSEL_DATA.styles.flatMap((s) => Object.keys(s.pools)));
  const patterns = [
    ...shapes.map((s) => s.p),
    ...VESSEL_DATA.hybrids.shapes.map((s) => s.p),
    ...VESSEL_DATA.styles.flatMap((s) => s.shapes),
    ...VESSEL_DATA.space.station.map((s) => s.p),
    ...VESSEL_DATA.space.colony.map((s) => s.p),
    ...VESSEL_CULTURES.flatMap((c) => c.gods?.shapes.map((s) => s.p) ?? []),
  ];
  for (const p of patterns) {
    for (const m of p.matchAll(/\{([^}:]+)/g)) {
      for (const name of m[1].split("+").filter((x) => !/^[a-z]+$/.test(x) || special.has(x) || gn.has(x))) {
        const known = special.has(name) || gn.has(name) || !!VESSEL_DATA.lists[name] || stylePools.has(name);
        assert.ok(known, `${p}: {${name}}`);
        if (gn.has(name)) assert.ok(GROUP_DATA.lists[name], `GN list ${name}`);
      }
    }
  }
  for (const c of VESSEL_CULTURES) {
    for (const [role, x] of Object.entries(c.roles ?? {})) {
      assert.ok(roles.has(role), `${c.key} ${role}`);
      if (x === 0) assert.ok(["menace", "leisure", "holy"].includes(role), `${c.key} ${role} ×0`);
      else assert.ok(x > 0);
    }
  }
  const lists = [...Object.values(VESSEL_DATA.lists), ...VESSEL_CULTURES.flatMap((c) => [...Object.values(c.lists ?? {}), c.gods?.list ?? []])];
  for (const entries of lists) for (const e of entries) assert.ok((e.x ?? 1) > 0, e.w);
});

test("§16.1: no word holds ( ) § × ? or →", () => {
  const words = [
    ...Object.values(VESSEL_DATA.lists).flatMap(entryWords),
    ...VESSEL_CULTURES.flatMap((c) => [...Object.values(c.lists ?? {}).flatMap(entryWords), ...entryWords(c.gods?.list), ...flavourAnimals(c)]),
    ...Object.values(VESSEL_DATA.techWords).flatMap((t) => [...entryWords(t.techAdj), ...entryWords(t.techNoun)]),
    ...VESSEL_DATA.styles.flatMap((s) => [...entryWords(s.name), ...Object.values(s.pools).flatMap(entryWords)]),
  ];
  for (const w of words) assert.ok(!/[()§×?→]/.test(w), w);
});

test("§16.1: Ottoman and Swahili & Omani flavour animals", () => {
  assert.deepEqual(flavourAnimals(culture("ottoman")), ["Lion", "Falcon", "Eagle", "Horse"]);
  assert.deepEqual(flavourAnimals(culture("swahili-omani")), ["Dolphin", "Turtle", "Falcon", "Heron", "Kingfisher"]);
});

// ── §16.2 Determinism and coverage ──────────────────────────────────────────

test("§16.2: the same options and seed give the same names", () => {
  const o: VesselOptions = { module: "ships", culture: "norse", people: "invented", count: 20, seed: 42 };
  assert.deepEqual(generateVesselNames(o).names.map((n) => n.text), generateVesselNames(o).names.map((n) => n.text));
});

test("§16.2: every module × culture × technology × function × setting × people mode gives 20 unique names within the cap", () => {
  const short: string[] = [];
  for (const module of ["ships", "spacecraft"] as VesselModule[]) {
    for (const c of VESSEL_CULTURES) {
      for (const setting of MODULE_SETTINGS[module]) {
        for (const technology of ["any", ...techChoices(module, setting)]) {
          for (const fn of [undefined, ...availableFunctions(module, c.key, technology, setting).map((f) => f.key)]) {
            for (const people of ["placeholders", "invented"] as const) {
              const batch = generateVesselNames({ module, culture: c.key, technology, function: fn, people, ...SETTINGS[setting], count: 20, seed: 5 });
              const texts = batch.names.map((n) => n.text.toLowerCase());
              if (batch.names.length < 20 || new Set(texts).size !== texts.length) short.push(`${module} ${c.key} ${setting} ${technology} ${fn ?? "any"} ${people}: ${batch.names.length}`);
              for (const n of batch.names) {
                const counted = n.name.split(" ").filter((w, i) => !(i === 0 && w === "The") && !/^(of|the|and|for|in|at|by|on|to|from|over|upon|beyond|beneath|among|across|through|between|above|into|with|before)$/i.test(w));
                assert.ok(counted.length <= 8, n.text);
              }
            }
          }
        }
      }
    }
  }
  assert.deepEqual(short, []);
});

// ── §16.3 Technology ────────────────────────────────────────────────────────

test("§16.3: British at T4: Age of Sail virtues, none of the modern ones", () => {
  const virtues = culture("norman-british").lists!.virtue;
  const t4 = virtues.filter((e) => e.k === "T4").map((e) => e.w);
  const t7 = virtues.filter((e) => e.k === "T7").map((e) => e.w);
  const names = many({ module: "ships", culture: "norman-british", technology: "T4", function: "war" }, 2000);
  assert.equal(names.length, 2000);
  assert.ok(names.some((n) => n.words.some((w) => w.list === "virtue" && t4.includes(w.word))));
  for (const n of names) for (const w of t7) assert.ok(!hasWord(n.text, w), `${n.text} has ${w}`);
});

test("§16.3: Hawaiian at T5 (out of span): steam words in a quarter of names, Hawaiian customs of T3 in the rest", () => {
  const t5 = [...VESSEL_DATA.techWords.T5.techAdj, ...VESSEL_DATA.techWords.T5.techNoun].map((e) => e.w);
  const names = many({ module: "ships", culture: "hawaiian", technology: "T5" }, 2000);
  assert.equal(names.length, 2000);
  const steam = names.filter((n) => t5.some((w) => hasWord(n.text, w)));
  assert.ok(steam.length >= 500, `${steam.length} of 2000`);
  const own = culture("hawaiian").lists!;
  for (const n of names.filter((x) => x.route !== "hybrid")) {
    assert.equal(n.customs, "T3", n.text);
    for (const w of n.words) {
      if (w.list === "poetic") assert.ok(entryWords(own.poetic).includes(w.word), w.word);
      if (w.list === "sky") assert.ok(entryWords(own.sky).includes(w.word), w.word);
    }
  }
});

test("§16.3: passenger never offered at T1–T3; yacht never for sensitive cultures", () => {
  for (const c of VESSEL_CULTURES) {
    for (const level of ["T1", "T2", "T3"]) assert.ok(!availableFunctions("ships", c.key, level, "FL").some((f) => f.key === "passenger"), `${c.key} ${level}`);
    for (const level of ["any", "T1", "T4", "T7"]) {
      const yacht = availableFunctions("ships", c.key, level, "MR").some((f) => f.key === "yacht");
      if (c.sensitive) assert.ok(!yacht, `${c.key} ${level}`);
    }
  }
  assert.ok(availableFunctions("ships", "general", "T4", "MR").some((f) => f.key === "passenger"));
});

test("§16.3: arctic spacecraft at S3: hybrids use S3 words, the rest arctic lists", () => {
  const s3 = [...VESSEL_DATA.techWords.S3.techAdj, ...VESSEL_DATA.techWords.S3.techNoun].map((e) => e.w);
  const poetic = entryWords(culture("arctic").lists!.poetic);
  const names = many({ module: "spacecraft", culture: "arctic", technology: "S3" }, 1000);
  const hybrids = names.filter((n) => n.route === "hybrid");
  assert.ok(hybrids.length > 0);
  for (const n of hybrids) assert.ok(n.words.some((w) => (w.list === "techAdj" || w.list === "techNoun") && s3.includes(w.word)), n.text);
  for (const n of names.filter((x) => x.route !== "hybrid")) {
    assert.equal(n.customs, "T1");
    for (const w of n.words) if (w.list === "poetic") assert.ok(poetic.includes(w.word), w.word);
  }
  assert.ok(names.every((n) => inRange("S3", n.level)));
});
