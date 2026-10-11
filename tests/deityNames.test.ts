// Deities and sacred places (Deities and sacred places brief §14).
import { test } from "node:test";
import assert from "node:assert/strict";
import { SETTLEMENT_VOCAB } from "../src/settlement/vocab";
import {
  breaksDeityWords,
  DEITY_CULTURES,
  DEITY_DATA,
  DEITY_DOMAINS,
  DEITY_KINDS,
  deityTitleBlocked,
  domainsOffered,
  generateDeityNames,
  hasRealDivineName,
  type DeityName,
  type DeityOptions,
} from "../src/deities/engine";
import { ROUTE_ERAS, routeNorm, type RouteEra } from "../src/routes/engine";
import { hasBannedWord } from "../src/groups/engine";

const BLOCK = new Set(DEITY_DATA.safeguards.block.map((w) => routeNorm(w).replace(/^the /, "")));
const blocked = (t: string) => BLOCK.has(routeNorm(t).replace(/^the /, "")) || hasRealDivineName(t);
const stub = (g: string, rng: () => number) => `${g === "m" ? "Male" : g === "f" ? "Female" : "First"}${Math.floor(rng() * 100000)}`;

function many(o: Omit<DeityOptions, "count" | "seed">, n: number, size = 5): DeityName[] {
  const out: DeityName[] = [];
  for (let seed = 1; out.length < n && seed < n * 4; seed++) out.push(...generateDeityNames({ ...o, count: size, seed }).names);
  return out.slice(0, n);
}

// ── §14.1 Vocabulary ────────────────────────────────────────────────────────

const POOLS = ["divineFigure", "divineQuality", "divineVerb", "bodyNumber", "bodyPart", "divineKin", "pantheonNoun", "pantheonQuality", "sacredLand", "sacredQuality", "oracleWord", "sacredVirtue", "cultureDivineAnimal"];

test("§14.1: the new pools exist; no entry, domain word or archetype is a blocked title or a real name", () => {
  for (const p of POOLS) assert.ok(SETTLEMENT_VOCAB.pools[p]?.entries.length > 0, p);
  for (const k of DEITY_KINDS) assert.ok(SETTLEMENT_VOCAB.pools[`deityFixed:${k.key}`], k.key);
  // Words are parts of titles ("One" in "the Hidden One"); real names are checked in every word, and
  // whole-title blocks against the whole titles: fixed names and archetypes.
  for (const p of POOLS) for (const e of SETTLEMENT_VOCAB.pools[p].entries) assert.ok(!hasRealDivineName(e.w), `${p}: ${e.w}`);
  for (const e of SETTLEMENT_VOCAB.pools["deityFixed:pantheon"].entries) assert.ok(!blocked(e.w), e.w);
  for (const d of DEITY_DOMAINS) {
    for (const w of d.words) assert.ok(!hasRealDivineName(w.w), w.w);
    for (const a of d.archetypes) for (const t of [a.m, a.f, a.n, a.all]) if (t) assert.ok(!blocked(t), t);
  }
  for (const e of SETTLEMENT_VOCAB.pools.divineFigure.entries) assert.ok(["m", "f", "n"].includes(e.g!), e.w);
  assert.ok(!SETTLEMENT_VOCAB.pools.cultureDivineAnimal.entries.some((e) => e.w === "Cow" && e.c?.includes("indian")));
});

// ── §14.2 Coverage and determinism ──────────────────────────────────────────

test("§14.2: the same options and seed give the same names", () => {
  for (const o of [{ culture: "norse" }, { culture: "egyptian", names: "placeholder" as const }, { culture: "general", era: "IS" as RouteEra, series: true }]) {
    assert.deepEqual(generateDeityNames({ ...o, count: 20, seed: 42 }).names, generateDeityNames({ ...o, count: 20, seed: 42 }).names);
  }
});

test("§14.2: every culture × era × kind × domain offered × gender × names mode gives 20 unique names within the cap", () => {
  for (const c of DEITY_CULTURES) {
    for (const { code: era } of ROUTE_ERAS) {
      for (const fantastic of [false, true]) {
        for (const k of DEITY_KINDS) {
          for (const domain of ["any", ...domainsOffered(era, fantastic).map((d) => d.key)]) {
            for (const gender of (k.key === "place" ? ["any"] : ["any", "male", "female", "neither"]) as DeityOptions["gender"][]) {
              for (const names of (k.key === "deity" ? ["titles", "placeholder", "pack"] : ["titles"]) as DeityOptions["names"][]) {
                const b = generateDeityNames({ culture: c.key, era, fantastic, kind: k.key, domain, gender, names, drawName: stub, count: 20, seed: 3 });
                const where = `${c.key} ${era} ${fantastic} ${k.key} ${domain} ${gender} ${names}`;
                assert.equal(b.names.length, 20, where);
                assert.equal(new Set(b.names.map((n) => n.text.toLowerCase())).size, 20, where);
                for (const n of b.names) assert.equal(n.kind, k.key, where);
              }
            }
          }
        }
      }
    }
  }
});

// ── §14.3 Gender and names ──────────────────────────────────────────────────

const figure = (g: string) => new Set(SETTLEMENT_VOCAB.pools.divineFigure.entries.filter((e) => e.g === g).map((e) => e.w));
const kin = (g: string) => new Set(SETTLEMENT_VOCAB.pools.divineKin.entries.filter((e) => e.g === g).map((e) => e.w));
const arche = (g: "m" | "f" | "n") => new Set(DEITY_DOMAINS.flatMap((d) => d.archetypes.map((a) => a[g]).filter((x): x is string => !!x)));

test("§14.3: male, female and neither keep to their own figures, kin, archetypes and pronouns", () => {
  const other = { m: ["f", "n"], f: ["m", "n"], n: ["m", "f"] } as const;
  for (const [gender, g] of [["male", "m"], ["female", "f"], ["neither", "n"]] as const) {
    for (const n of many({ culture: "general", kind: "deity", gender }, 2000)) {
      assert.equal(n.gender, g);
      for (const w of n.words) {
        for (const o of other[g]) {
          if (w.pool === "divineFigure") assert.ok(!figure(o).has(w.word) || figure(g).has(w.word), `${gender}: ${n.text}`);
          if (w.pool === "divineKin") assert.ok(!kin(o).has(w.word) || kin(g).has(w.word), `${gender}: ${n.text}`);
          if (w.pool === "archetype") assert.ok(!arche(o).has(w.word) || arche(g).has(w.word), `${gender}: ${n.text}`);
        }
      }
      if (g === "m") assert.ok(!/^(She|They) Who/.test(n.text), n.text);
      if (g === "f") assert.ok(!/^(He|They) Who/.test(n.text), n.text);
      if (g === "n") assert.ok(!/^(He|She) Who/.test(n.text), n.text);
    }
  }
  assert.ok(many({ culture: "general", kind: "deity", gender: "neither" }, 2000).some((n) => n.text.startsWith("They Who")));
});

test("§14.3: placeholder names render “[deity], {title}” with a lower-case “the”; pack names follow the gender", () => {
  const ph = many({ culture: "general", kind: "deity", names: "placeholder" }, 1000);
  for (const n of ph) assert.ok(n.text.startsWith("[deity], ") && n.text === `[deity], ${n.title}`, n.text);
  assert.ok(ph.some((n) => n.text.startsWith("[deity], the ")));
  for (const n of many({ culture: "general", kind: "deity", names: "pack", drawName: stub }, 1000)) {
    const prefix = n.gender === "m" ? "Male" : n.gender === "f" ? "Female" : "First";
    assert.ok(n.text.startsWith(prefix), n.text);
  }
});

// ── §14.4 Culture styles and eras ───────────────────────────────────────────

test("§14.4: egyptian animal-headed forms at least 15%; norse kennings; never a real god's name", () => {
  const eg = many({ culture: "egyptian", kind: "deity" }, 2000);
  assert.ok(eg.filter((n) => /-Headed /.test(n.text)).length >= 300, `${eg.filter((n) => /-Headed /.test(n.text)).length}`);
  assert.ok(many({ culture: "norse", kind: "deity" }, 2000).some((n) => n.form === "G"));
  for (const c of DEITY_CULTURES) for (const n of many({ culture: c.key, fantastic: true }, 500)) assert.ok(!blocked(n.title), `${c.key}: ${n.text}`);
});

test("§14.4: medieval has no steampunk or machine domains; the steam age with fantastic has steampunk; IS has machines", () => {
  const md = domainsOffered("MD", true).map((d) => d.key);
  assert.ok(!md.includes("steampunk") && !md.includes("machine"));
  assert.ok(domainsOffered("ST", true).some((d) => d.key === "steampunk"));
  assert.ok(!domainsOffered("ST", false).some((d) => d.key === "steampunk"));
  assert.ok(domainsOffered("IS", false).some((d) => d.key === "machine"));
  for (const n of many({ culture: "general", era: "MD", fantastic: true, kind: "deity" }, 2000)) assert.ok(n.domain !== "steampunk" && n.domain !== "machine", n.text);
});

test("§14.4: christian cultures in a realistic world: generic deities; sacred places favour wells and springs", () => {
  const generic = new Set(DEITY_DATA.christian.genericForms);
  const deities = many({ culture: "norman-british", kind: "deity" }, 1000);
  assert.equal(deities.length, 1000);
  for (const n of deities) assert.ok(generic.has(n.form), n.text);
  const share = (culture: string) => {
    const lands = many({ culture, kind: "place" }, 3000).flatMap((n) => n.words.filter((w) => w.pool === "sacredLand").map((w) => w.word));
    return lands.filter((w) => ["Well", "Spring", "Hill"].includes(w)).length / lands.length;
  };
  assert.ok(share("norman-british") > share("general") * 1.4, `${share("norman-british")} vs ${share("general")}`);
});

// ── §14.5 Series and safeguards ─────────────────────────────────────────────

test("§14.5: a series of 8: a pantheon first; deities of different domains; genders in turn; a Form C", () => {
  for (let seed = 1; seed <= 40; seed++) {
    const b = generateDeityNames({ culture: "general", series: true, count: 8, seed });
    const where = b.names.map((n) => n.text).join(" | ");
    assert.equal(b.names.length, 8, where);
    assert.equal(b.names[0].kind, "pantheon", where);
    const deities = b.names.filter((n) => n.kind === "deity");
    const domains = deities.map((n) => n.domain).filter((d) => d);
    assert.equal(new Set(domains).size, domains.length, where);
    deities.forEach((n, i) => assert.equal(n.gender, ["m", "f", "n"][i % 3], where));
    assert.ok(deities.some((n) => n.form === "C"), where);
    // §8 rule 4: a sacred place names one of the batch's deities.
    for (const p of b.names.filter((n) => n.kind === "place" && n.form === "L1")) assert.ok(deities.some((d) => p.text.includes(d.title.replace(/^the /, ""))), where);
  }
});

test("§14.5: 10,000 titles across options: no block-list matches, no banned words; Polynesian and Andean not offered", () => {
  let n = 0;
  const tones = ["any", "grim", "light", "strange", "grand", "plain"] as const;
  for (const c of DEITY_CULTURES) {
    for (const { code: era } of ROUTE_ERAS) {
      for (const name of many({ culture: c.key, era, tone: tones[n % 6], fantastic: n % 2 === 0 }, 90, 30)) {
        n++;
        assert.ok(!blocked(name.title) && !deityTitleBlocked(name.title), name.text);
        assert.ok(!hasBannedWord(name.text) && !breaksDeityWords(name.text), name.text);
      }
    }
  }
  assert.ok(n >= 10000, `${n}`);
  for (const k of ["polynesian", "andean"]) {
    assert.ok(!DEITY_CULTURES.some((c) => c.key === k));
    assert.deepEqual(generateDeityNames({ culture: k, count: 1, seed: 1 }).notices, ["This culture isn't offered for deities."]);
  }
});
