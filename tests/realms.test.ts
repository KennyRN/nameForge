// Realms and polities (Realms brief §15).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ALL_FORMS,
  compatibleCollQuals,
  compatibleModifiers,
  COMPOUND_FORMS,
  generateRealmNames,
  isIdeological,
  namedForOffered,
  REALM_CHARACTERS,
  REALM_CULTURES,
  REALM_DATA,
  REALM_ERAS,
  REALM_NAMED_FOR,
  type RealmName,
  type RealmOptions,
} from "../src/realms/engine";

const many = (o: Omit<RealmOptions, "count" | "seed">, n: number): RealmName[] => {
  const out: RealmName[] = [];
  for (let seed = 1; out.length < n && seed < n; seed++) out.push(...generateRealmNames({ ...o, count: 100, seed }).names);
  return out.slice(0, n);
};
const ERAS = ["AN", "MD", "EM", "MO", "NF", "IS"];
const words = (entries: { w: string }[]) => entries.map((e) => e.w);

// ── §15.1 Data ──────────────────────────────────────────────────────────────

test("§15.1: forms have plurals, groups and six era weights; culture forms' eras are valid", () => {
  for (const f of REALM_DATA.forms) {
    assert.ok(f.pl && f.g, f.w);
    assert.deepEqual(Object.keys(f.era).sort(), [...ERAS].sort(), f.w);
  }
  for (const c of Object.values(REALM_DATA.cultures)) {
    for (const f of c.forms ?? []) {
      assert.ok(f.pl && f.g && f.eras.length > 0, f.w);
      for (const e of f.eras) assert.ok(ERAS.includes(e), `${f.w} ${e}`);
    }
  }
});

test("§15.1: every list and shape named exists; no word holds ( ) § × ? or →", () => {
  const special = new Set(["form", "federalForm", "modifier", "place", "landCompound", "dynasty", "star", "spaceLand", "tribal", "holy", "beast", "number", "colour", "brandRoot", "landIdentity", "landPl"]);
  const shapes = [...Object.values(REALM_DATA.shapes).flat(), ...Object.values(REALM_DATA.characterShapes).flatMap((c) => c.shapes)];
  const patterns = [...shapes.flatMap((s) => [s.p, s.short]), ...REALM_DATA.landIdentity.map((s) => s.p)];
  for (const p of patterns) {
    for (const m of p.matchAll(/\{([^}:]+)/g)) assert.ok(special.has(m[1]) || REALM_DATA.lists[m[1]] || m[1] === "collQual" || m[1] === "collNoun", `${p}: ${m[1]}`);
  }
  const all = [
    ...Object.values(REALM_DATA.lists).flatMap(words),
    ...REALM_DATA.forms.flatMap((f) => [f.w, f.pl]),
    ...Object.values(REALM_DATA.cultures).flatMap((c) => (c.forms ?? []).flatMap((f) => [f.w, f.pl])),
    ...REALM_DATA.modifiers.map((m) => m.w),
    ...words(REALM_DATA.ideology.words),
    ...Object.values(REALM_DATA.honorifics).flatMap(words),
  ];
  for (const w of all) assert.ok(!/[()§×?→]/.test(w), w);
});

test("§15.1: compatibility lists name only existing forms and collective nouns", () => {
  const forms = new Set([...ALL_FORMS, "City"]);
  for (const m of REALM_DATA.modifiers) for (const f of m.with) assert.ok(forms.has(f), `${m.w}: ${f}`);
  for (const f of REALM_DATA.ideology.with) assert.ok(forms.has(f), f);
  const nouns = new Set(words(REALM_DATA.lists.collNoun));
  for (const q of REALM_DATA.collQual) for (const n of q.with) assert.ok(nouns.has(n), `${q.w ?? q.list}: ${n}`);
});

// ── §15.2 Determinism and coverage ──────────────────────────────────────────

test("§15.2: the same options and seed give the same names", () => {
  const o: RealmOptions = { culture: "steppe", people: "invented", count: 20, seed: 9 };
  assert.deepEqual(generateRealmNames(o).names.map((n) => n.text), generateRealmNames(o).names.map((n) => n.text));
});

test("§15.2: every culture × era × character × namedFor × length × output × people gives 20 unique names within the caps", () => {
  const short: string[] = [];
  for (const c of REALM_CULTURES) {
    for (const era of REALM_ERAS) {
      for (const character of [undefined, ...REALM_CHARACTERS.map((x) => x.key)]) {
        for (const nf of REALM_NAMED_FOR.filter((n) => namedForOffered(n.key, era.key))) {
          for (const length of ["plain", "ceremonial"] as const) {
            for (const output of ["official", "short", "both"] as const) {
              for (const people of ["placeholders", "invented"] as const) {
                const b = generateRealmNames({ culture: c.key, era: era.key, character, namedFor: nf.key, length, output, people, count: 20, seed: 5 });
                for (const n of b.names) {
                  const counted = n.official.split(" ").filter((w, i) => !(i === 0 && w === "the") && !/^(of|the|and|for|in|at|by|on|to|from)$/i.test(w));
                  assert.ok(counted.length <= REALM_DATA.caps[length], n.official);
                }
                if (b.names.length >= 20) continue;
                // A dynasty can't give 20: corporate states have no crown or imperial forms (§5.2), and a
                // placeholder dynasty ([dynasty], also every culture without invented houses, §6.1) has a
                // single short form and only a handful of official ones.
                const placeholderDynasty = people === "placeholders" || !REALM_DATA.dynastyCultures.includes(c.key);
                if (nf.key === "dynasty" && (character === "corporate" || placeholderDynasty || output === "short")) continue;
                short.push(`${c.key} ${era.key} ${character ?? "any"} ${nf.key} ${length} ${output} ${people}: ${b.names.length}`);
              }
            }
          }
        }
      }
    }
  }
  assert.deepEqual(short, []);
});

// ── §15.3 Era and culture ───────────────────────────────────────────────────

test("§15.3: medieval General: no Federation, Authority, Directorate or future compound form", () => {
  const banned = new Set(["Federation", "Authority", "Directorate", ...COMPOUND_FORMS]);
  const names = many({ era: "medieval", people: "invented" }, 2000);
  assert.equal(names.length, 2000);
  for (const n of names) assert.ok(!n.form || !banned.has(n.form), n.official);
});

test("§15.3: interstellar General: at least 30% future compound, federal or admin forms", () => {
  const names = many({ era: "interstellar", genre: "scifi", people: "invented" }, 2000);
  const hits = names.filter((n) => (n.form && COMPOUND_FORMS.includes(n.form)) || n.formGroup === "federal" || n.formGroup === "admin");
  assert.ok(hits.length >= 600, `${hits.length}`);
});

test("§15.3: steppe khanates in the middle ages; occasional in the stars", () => {
  const medieval = many({ culture: "steppe", era: "medieval", people: "invented" }, 2000);
  const steppe = medieval.filter((n) => ["Khanate", "Khaganate", "Horde"].includes(n.form ?? ""));
  assert.ok(steppe.length >= 400, `${steppe.length}`);
  const stars = many({ culture: "steppe", era: "interstellar", genre: "scifi", people: "invented" }, 2000);
  const khanates = stars.filter((n) => n.form === "Khanate");
  assert.ok(khanates.length > 0 && khanates.length < 200, `${khanates.length}`);
});

// ── §15.4 Internal logic ────────────────────────────────────────────────────

test("§15.4: 10,000 names: modifiers and qualifiers only where §7 allows; ideology from modern on", () => {
  const names: RealmName[] = [];
  let seed = 1;
  while (names.length < 10000) {
    const era = REALM_ERAS[seed % 6];
    const c = REALM_CULTURES[seed % REALM_CULTURES.length];
    const character = REALM_CHARACTERS[seed % 8].key;
    const b = generateRealmNames({ culture: c.key, era: era.key, character: seed % 3 === 0 ? undefined : character, length: seed % 2 ? "plain" : "ceremonial", people: "invented", count: 100, seed });
    for (const n of b.names) names.push({ ...n, shape: `${era.key}|${n.shape}` });
    seed++;
  }
  const code = (n: RealmName) => REALM_ERAS.find((e) => e.key === n.shape.split("|")[0])!.code;
  for (const n of names) {
    if (n.modifier && n.form) {
      if (isIdeological(n.modifier)) {
        assert.ok(REALM_DATA.ideology.with.includes(n.form), `${n.official}`);
        assert.ok(!["AN", "MD", "EM"].includes(code(n)), n.official);
      } else assert.ok(compatibleModifiers(n.form, code(n)).some((m) => m.w === n.modifier), n.official);
      // §7.3: the form's word never repeated; Free/People's never crown or imperial; Royal/Imperial never republic or federal.
      assert.ok(!n.form.split(/[\s-]/).includes(n.modifier), n.official);
      if (["Free", "People's"].includes(n.modifier)) assert.ok(!["crown", "imperial"].includes(n.formGroup ?? ""), n.official);
      if (["Royal", "Imperial"].includes(n.modifier)) assert.ok(!["republic", "federal"].includes(n.formGroup ?? ""), n.official);
    }
    if (n.collQual && n.collNoun) assert.ok(compatibleCollQuals(n.collNoun).includes(n.collQual), n.official);
    if (n.kind === "dynasty") assert.ok(!COMPOUND_FORMS.includes(n.form ?? ""), n.official);
    const content = n.official.split(" ").filter((w) => !/^(of|the|and|for|in|at|by|on|to|from)$/i.test(w) && !w.startsWith("[")).map((w) => w.toLowerCase().replace(/'s?$/, "").replace(/s$/, ""));
    assert.equal(new Set(content).size, content.length, n.official);
  }
});
