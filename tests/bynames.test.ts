// Bynames and titles (Bynames brief §15).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  availableKinds,
  BYNAME_CULTURES,
  BYNAMES_DATA,
  generateBynames,
  showsLanguage,
  type BynameEntry,
  type BynameModule,
  type BynameOptions,
} from "../src/bynames/engine";
import { GROUP_DATA, type GroupSetting, type GroupToneChoice } from "../src/groups/engine";

const SETTINGS: Record<GroupSetting, Pick<BynameOptions, "genre" | "fantastic">> = {
  FL: { genre: "fantasy", fantastic: false },
  FH: { genre: "fantasy", fantastic: true },
  MR: { genre: "modern", fantastic: false },
  MF: { genre: "modern", fantastic: true },
  SF: { genre: "scifi", fantastic: false },
};
const MODULES: BynameModule[] = ["epithets", "titles", "familyNames"];
const gen = (o: Partial<BynameOptions> & { module: BynameModule }, count = 20, seed = 1) => generateBynames({ count, seed, ...o });
const allEntries = (): [string, BynameEntry][] => [
  ...Object.entries(BYNAMES_DATA.lists).flatMap(([k, v]) => v.map((e): [string, BynameEntry] => [k, e])),
  ...Object.entries(BYNAMES_DATA.ranks).flatMap(([k, v]) => v.map((e): [string, BynameEntry] => [`rank ${k}`, e])),
  ...Object.entries(BYNAMES_DATA.styles).flatMap(([k, v]) => v.map((e): [string, BynameEntry] => [`style ${k}`, e])),
];
const texts = (e: BynameEntry) => [e.w, e.m, e.f, e.n, e.nm, e.nf].filter((x): x is string => typeof x === "string");

// §15.1 Data

test("bynames: 20 cultures in the §4.1 order", () => {
  assert.deepEqual(BYNAME_CULTURES.map((c) => c.key), [
    "general", "anglo-saxon", "norse", "celtic", "norman-british", "roman", "greek-byzantine", "slavic", "steppe", "arabic-persian",
    "indian", "chinese", "japanese", "korean", "egyptian", "ethiopian", "bantu", "west-african", "aztec", "maya",
  ]);
  assert.ok(BYNAME_CULTURES.every((c) => c.guide.length > 0), "every culture has a tooltip");
});

test("bynames: every shape token resolves, every weight is positive", () => {
  const SPECIAL = new Set(["father", "mother", "child", "town", "god", "number", "compass", "star", "epPlaceLand", "domainLand", "beast", "clanBorn", "clanStyle", "rank", "style"]);
  const patterns = [
    ...BYNAMES_DATA.epithets.shapes.map((s) => s.p),
    ...BYNAMES_DATA.titles.shapes.map((s) => s.p),
    ...Object.values(BYNAMES_DATA.family.cultures).flatMap((c) => Object.values(c.forms).flat().map((f) => f.p)),
    ...allEntries().flatMap(([, e]) => texts(e)).filter((t) => t.includes("{")),
  ];
  for (const p of patterns) {
    for (const m of p.matchAll(/\{([^}]+)\}/g)) {
      for (const name of m[1].split(":")[0].split("+")) assert.ok(SPECIAL.has(name) || BYNAMES_DATA.lists[name], `${p}: ${name}`);
    }
  }
  for (const [list, e] of allEntries()) assert.ok((e.x ?? 1) > 0, `${list}: ${texts(e)[0]}`);
  for (const s of [...BYNAMES_DATA.epithets.shapes, ...BYNAMES_DATA.titles.shapes]) assert.ok(s.w > 0, s.p);
  for (const m of MODULES) for (const c of BYNAME_CULTURES) assert.ok(availableKinds(m, c.key, "FL").length > 0, `${m} ${c.key}`);
  for (const k of ["number", "land", "spaceLand", "compass", "star"]) assert.ok(GROUP_DATA.lists[k], k);
});

test("bynames: no stray notation or note text in the data", () => {
  for (const [list, e] of allEntries()) {
    for (const t of texts(e)) {
      assert.ok(!/[()§×?]/.test(t), `${list}: ${t}`);
      assert.ok(!/\b(blocked|Drop|Remove|note)\b/.test(t), `${list}: ${t}`);
    }
  }
});

test("bynames: native forms have English forms; gender pairs have both sides", () => {
  // Chinese and Korean surnames are native names; only some have English pairs (§7.5).
  const nativeOnly = new Set(["chineseFamily", "koreanFamily"]);
  for (const [list, e] of allEntries()) {
    if ((e.n || e.nm || e.nf) && !nativeOnly.has(list)) assert.ok(e.w || e.m || e.f, `${list}: ${e.n ?? e.nm ?? e.nf}`);
    if ("m" in e || "f" in e) assert.ok("m" in e && "f" in e, `${list}: ${e.m ?? e.f}`);
    if ("nm" in e || "nf" in e) assert.ok(("nm" in e || e.n) && "nf" in e, `${list}: ${e.nm ?? e.nf}`);
  }
});

// §15.2 Determinism and coverage

test("bynames: the same options and seed give the same results", () => {
  for (const module of MODULES) assert.deepEqual(gen({ module, culture: "norse", language: "mixed" }, 20, 7), gen({ module, culture: "norse", language: "mixed" }, 20, 7));
});

test("bynames: every module, culture, setting, gender, language and source fills a batch of 20", () => {
  for (const module of MODULES) for (const c of BYNAME_CULTURES) for (const [s, setting] of Object.entries(SETTINGS)) {
    if (availableKinds(module, c.key, s as GroupSetting).length === 0) continue;
    for (const gender of ["men", "women", "anyone"] as const) {
      for (const language of (showsLanguage(module, c.key) ? ["english", "native", "mixed"] : ["english"]) as BynameOptions["language"][]) {
        for (const source of ["placeholder", "none"] as const) {
          const batch = gen({ module, culture: c.key, ...setting, gender, language, source }, 20, 3);
          assert.equal(new Set(batch.names.map((n) => n.text.toLowerCase())).size, batch.names.length);
          assert.ok(batch.names.every((n) => n.text.trim().length > 0));
          // Single small lists: English Chinese (15 pairs) and Korean (8); Ethiopian family names are
          // patronymics only, and Bantu's are patronymics or its four surnames, so with a placeholder
          // father there are only a few distinct results.
          const small = module === "familyNames" && ((["chinese", "korean"].includes(c.key) && language === "english") || ["ethiopian", "bantu"].includes(c.key));
          if (small) assert.ok(batch.notices.some((n) => n.startsWith("Only ")) || batch.names.length === 20);
          else assert.equal(batch.names.length, 20, `${module} ${c.key} ${s} ${gender} ${language} ${source}: ${batch.notices.join(" ")}`);
        }
      }
    }
  }
  const bantu = gen({ module: "familyNames", culture: "bantu", kind: "inherited" }, 20);
  assert.ok(bantu.names.length <= 4);
});

// §15.3 Epithets

const BODY_MIND = new Set([
  ...BYNAMES_DATA.lists.epBodyMind.map((e) => `the ${e.w}`),
  ...BYNAMES_DATA.lists.bodyLook.filter((e) => e.bm).map((e) => e.w!.replace("+", "").replace(/^(.)(.*)$/, (_m, a: string, b: string) => a + b.toLowerCase())),
]);
const hasBodyMind = (part: string) => [...BODY_MIND].some((w) => part.endsWith(w));

test("epithets: body-and-mind words only with tone light or grim", () => {
  for (const tone of ["any", "plain", "grand", "strange"] as GroupToneChoice[]) {
    const batch = gen({ module: "epithets", tone, source: "none", kind: "body" }, 5000, 2);
    assert.ok(!batch.names.some((n) => hasBodyMind(n.text) || n.shape === "the {epBodyMind}"), tone);
  }
  const light = Array.from({ length: 20 }, (_, i) => gen({ module: "epithets", tone: "light", source: "none" }, 100, 10 + i).names).flat();
  assert.ok(light.some((n) => hasBodyMind(n.text)), "light draws some body-and-mind epithets");
});

test("epithets: joins", () => {
  const names = Array.from({ length: 10 }, (_, i) => gen({ module: "epithets" }, 200, i + 1).names).flat();
  const by = (shape: string) => names.filter((n) => n.shape === shape).map((n) => n.text);
  assert.ok(by("the {epCharacter}").every((t) => /^\[name\] the [A-Z]/.test(t)));
  assert.ok(by("{material+bodyPart}").every((t) => /^\[name\] [A-Z][a-z]+$/.test(t)));
  assert.ok(by("{beast} of the {epPlaceLand}").every((t) => /^\[name\], the [A-Z][\w-]* of the /.test(t)));
  assert.ok(names.some((n) => n.text === "[name] the Bold"));
  assert.ok(names.some((n) => n.text === "[name] Ironhand"));
});

test("epithets: Aztec day names in English and native forms", () => {
  const english = gen({ module: "epithets", culture: "aztec", kind: "dayName", language: "english", source: "none" }, 260, 4).names.map((n) => n.text);
  const native = gen({ module: "epithets", culture: "aztec", kind: "dayName", language: "native", source: "none" }, 260, 4).names.map((n) => n.text);
  assert.ok(english.includes("One Reed"), english.slice(0, 5).join(", "));
  assert.ok(native.includes("Ce Acatl"));
  assert.equal(gen({ module: "epithets", culture: "aztec", kind: "dayName", language: "native" }, 1).names[0].text.startsWith("[name], "), true);
});
