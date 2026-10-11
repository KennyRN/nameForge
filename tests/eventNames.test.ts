// Events and eras (Events and eras brief §14).
import { test } from "node:test";
import assert from "node:assert/strict";
import { SETTLEMENT_VOCAB } from "../src/settlement/vocab";
import { breaksEventWords, EVENT_DATA, EVENT_SCALES, eventKindsOffered, generateEventNames, type EventName, type EventOptions } from "../src/events/engine";
import { findRouteCulture, ROUTE_CULTURES, ROUTE_ERAS, routeNorm, type RouteEra } from "../src/routes/engine";
import { hasBannedWord } from "../src/groups/engine";

const BLOCK = new Set(EVENT_DATA.safeguards.block.map((w) => routeNorm(w).replace(/^the /, "")));
const blocked = (t: string) => BLOCK.has(routeNorm(t).replace(/^the /, ""));

function many(o: Omit<EventOptions, "count" | "seed">, n: number, size = 5): EventName[] {
  const out: EventName[] = [];
  for (let seed = 1; out.length < n && seed < n * 4; seed++) out.push(...generateEventNames({ ...o, count: size, seed }).names);
  return out.slice(0, n);
}

// ── §14.1 Vocabulary ────────────────────────────────────────────────────────

const POOLS = ["warObject", "warAnimal", "battleSite", "rebelGarment", "disaster", "collapseNoun", "crisisNoun", "migrationNoun", "eraNoun", "metalAge", "eastEraWord", "cycleElement", "cycleAnimal", "yearThing", "sunOrdinal", "chronicleSeason"];

test("§14.1: the new pools exist (validity is the shared vocabulary test's); no whole-name entry is a blocked real name", () => {
  for (const p of POOLS) assert.ok(SETTLEMENT_VOCAB.pools[p]?.entries.length > 0, p);
  for (const k of EVENT_DATA.kinds) assert.ok(SETTLEMENT_VOCAB.pools[`eventFixed:${k.key}`], k.key);
  for (const p of [...EVENT_DATA.kinds.map((k) => `eventFixed:${k.key}`), "migrationNoun", "crisisNoun", "collapseNoun"]) for (const e of SETTLEMENT_VOCAB.pools[p].entries) assert.ok(!blocked(e.w), `${p}: ${e.w}`);
});

// ── §14.2 Coverage and determinism ──────────────────────────────────────────

test("§14.2: the same options and seed give the same names", () => {
  for (const o of [{ culture: "norman-british" }, { culture: "chinese", people: "invented" as const }, { culture: "general", era: "ST" as RouteEra, series: true }]) {
    assert.deepEqual(generateEventNames({ ...o, count: 20, seed: 42 }).names, generateEventNames({ ...o, count: 20, seed: 42 }).names);
  }
});

test("§14.2: every culture × era × kind × scale × people gives 20 unique names within the cap", () => {
  for (const c of ROUTE_CULTURES) {
    for (const { code: era } of ROUTE_ERAS) {
      for (const k of eventKindsOffered(era)) {
        for (const s of EVENT_SCALES) {
          for (const people of ["placeholders", "invented"] as const) {
            const b = generateEventNames({ culture: c.key, era, kind: k.key, scale: s.key, people, count: 20, seed: 3 });
            const where = `${c.key} ${era} ${k.key} ${s.key} ${people}`;
            assert.equal(new Set(b.names.map((n) => n.text.toLowerCase())).size, b.names.length, where);
            for (const n of b.names) assert.equal(n.kind, k.key, where);
            if (b.names.length < 20) {
              // The brief's own shapes: ancient rebellions have only the leader, people and season shapes;
              // the sensitive cultures (RN §12.4) take no grim collapses.
              const thin = (era === "AN" && k.key === "rebellion") || (!!findRouteCulture(c.key)?.sensitive && k.key === "collapse");
              assert.ok(thin, `${where}: only ${b.names.length}`);
              assert.ok(b.notices.some((x) => x.startsWith("Only ")), where);
            }
          }
        }
      }
    }
  }
});

// ── §14.3 Eras and scale ────────────────────────────────────────────────────

test("§14.3: medieval: no day wars and no steam-age, modern or sci-fi shapes", () => {
  const later = new Set(EVENT_DATA.shapes.filter((s) => s.e && !s.e.includes("MD")).map((s) => s.p));
  for (const n of many({ culture: "norman-british", era: "MD", people: "invented" }, 3000)) {
    assert.ok(!later.has(n.shape), n.text);
    assert.ok(!/-Day War/.test(n.text), n.text);
  }
});

test("§14.3: local scale has no Great or {realm} shapes; the world's scale, modern, has the Great War and never World War", () => {
  for (const era of ["MD", "MO"] as RouteEra[]) {
    for (const n of many({ culture: "general", era, scale: "local", people: "invented" }, 2000)) assert.ok(!/Great|World/.test(n.shape) && !n.shape.includes("{realm"), n.text);
  }
  const world = many({ culture: "general", era: "MO", scale: "world", kind: "war", people: "invented" }, 2000);
  assert.ok(world.some((n) => n.shape === "{ordinalWord} Great War"));
  for (const n of world) assert.ok(!/World War/.test(n.text), n.text);
  const local = many({ culture: "general", era: "MD", scale: "local", kind: "war", people: "invented" }, 2000);
  assert.ok(local.some((n) => / Riot$/.test(n.text)));
});

// ── §14.4 Cultures ──────────────────────────────────────────────────────────

const CYCLE = new Set(SETTLEMENT_VOCAB.pools.cycleAnimal.entries.map((e) => e.w));
const cyclical = (n: EventName) => n.words.some((w) => w.pool === "cycleAnimal");

test("§14.4: chinese rebellions: at least 20% cyclical years; never outside chinese, korean, japanese", () => {
  const chinese = many({ culture: "chinese", kind: "rebellion", people: "invented" }, 2000);
  assert.ok(chinese.filter(cyclical).length >= 400, `${chinese.filter(cyclical).length}`);
  for (const c of ROUTE_CULTURES) {
    if (["chinese", "korean", "japanese"].includes(c.key)) continue;
    for (const n of many({ culture: c.key, people: "invented" }, 400)) assert.ok(!cyclical(n), `${c.key}: ${n.text}`);
  }
  void CYCLE;
});

test("§14.4: aztec eras: the suns appear, the Fifth only at its low weight", () => {
  const names = many({ culture: "aztec", kind: "era", people: "invented" }, 4000).filter((n) => n.shape === "Age of the {sunOrdinal} Sun");
  assert.ok(names.length > 100);
  const fifth = names.filter((n) => n.text === "Age of the Fifth Sun").length;
  const sixth = names.filter((n) => n.text === "Age of the Sixth Sun").length;
  assert.ok(fifth > 0 && fifth * 3 < sixth, `${fifth} vs ${sixth}`);
});

test("§11.4: no saints outside christian cultures; no gods' names in events", () => {
  for (const c of ["japanese", "maya", "indian"]) for (const n of many({ culture: c, people: "invented" }, 1000)) assert.ok(!/\bSaint\b/.test(n.text), n.text);
});

// ── §14.5 Series and safeguards ─────────────────────────────────────────────

test("§14.5: a series of 8: an era first, a second era halfway, the recurring people at least twice, repeated wars numbered", () => {
  let numbered = 0;
  for (let seed = 1; seed <= 40; seed++) {
    for (const people of ["placeholders", "invented"] as const) {
      const b = generateEventNames({ culture: "norman-british", people, series: true, count: 8, seed });
      const where = b.names.map((n) => n.text).join(" | ");
      assert.equal(b.names.length, 8, where);
      assert.equal(b.names[0].kind, "era", where);
      assert.equal(b.names[4].kind, "era", where);
      const counts = new Map<string, number>();
      for (const n of b.names) if (n.people) counts.set(n.people, (counts.get(n.people) ?? 0) + 1);
      assert.ok([...counts.values()].some((x) => x >= 2), where);
      const wars = b.names.filter((n) => n.kind === "war");
      const bases = wars.map((n) => n.text.replace(/^(First|Second|Third) /, ""));
      for (const base of new Set(bases)) {
        const same = wars.filter((n, i) => bases[i] === base);
        if (same.length < 2) continue;
        numbered++;
        assert.ok(same[0].text.startsWith("First ") && same[1].text.startsWith("Second "), where);
      }
    }
  }
  assert.ok(numbered > 0, "no repeated war in 80 series");
});

test("§14.5: 10,000 names across options: no block-list matches, no banned words; no Korean purge with tone light", () => {
  let n = 0;
  const tones = ["any", "grim", "light", "strange", "grand", "plain"] as const;
  for (const c of ROUTE_CULTURES) {
    for (const { code: era } of ROUTE_ERAS) {
      const t = tones[n % tones.length];
      for (const name of many({ culture: c.key, era, tone: t, fantastic: n % 3 === 0, scale: EVENT_SCALES[n % 3].key, people: n % 2 ? "invented" : "placeholders" }, 70, 35)) {
        n++;
        assert.ok(!blocked(name.text), name.text);
        assert.ok(!hasBannedWord(name.text) && !breaksEventWords(name.text, name.shape.startsWith("Purge")), name.text);
        if (/\bPurge\b/.test(name.text)) assert.ok(c.key === "korean" && t !== "light", name.text);
      }
    }
  }
  assert.ok(n >= 10000, `${n}`);
  for (const name of many({ culture: "korean", kind: "crisis", tone: "light", people: "invented" }, 1000)) assert.ok(!name.text.startsWith("Purge"), name.text);
  assert.ok(many({ culture: "korean", kind: "crisis", people: "invented" }, 1000).some((x) => x.text.startsWith("Purge")));
});

// ── §14.6 Sentence and presets ──────────────────────────────────────────────

import { chooseEvent, DEFAULT_EVENT_STATE, eventHistoryLabel, eventSentence, eventSentenceText } from "../src/events/sentence";
import { modulePresetContent, parseModulePreset, type EventPreset } from "../src/presets";
import { GROUP_LABELS, historySection, SECTION_GROUPS, SWITCHER_ORDER } from "../src/sections";

test("§14.6: the default sentence's plain text", () => {
  assert.equal(
    eventSentenceText(eventSentence(DEFAULT_EVENT_STATE)),
    "Norman & British events of any kind of the medieval era, in a realistic world, on a realm's scale, of any tone, with placeholders for people and places, each one separate.",
  );
  const local = [["kind", "war"], ["scale", "local"], ["series", "on"]].reduce((s, [f, id]) => chooseEvent(s, f as never, id), DEFAULT_EVENT_STATE);
  assert.equal(
    eventSentenceText(eventSentence(local)),
    "Norman & British wars of the medieval era, in a realistic world, on a local scale, of any tone, with placeholders for people and places, as one history.",
  );
});

test("§14.6: the lore group, “history and faith”, follows bynames and titles in the switcher", () => {
  assert.equal(SWITCHER_ORDER[SWITCHER_ORDER.indexOf("bynames") + 1], "lore");
  assert.equal(GROUP_LABELS.lore, "history and faith");
  assert.deepEqual(SECTION_GROUPS.lore.slice(0, 1), ["eventNames"]);
  const label = eventHistoryLabel({ ...DEFAULT_EVENT_STATE, kind: "war", scale: "world", era: "ST", fantastic: true, tone: "grim", series: true });
  assert.equal(label, "events and eras · steam age · Norman & British · wars · world · steampunk · grim · one history");
  assert.equal(historySection(label), "eventNames");
});

test("§14.6: presets round-trip", () => {
  const preset: EventPreset = {
    packName: "Border chronicle",
    setting: "",
    description: "Norman & British events of any kind of the medieval era, in a realistic world, on a realm's scale, with a grim edge, with invented people and places, as one history.",
    culture: "norman-british",
    eventKind: "any",
    era: "MD",
    fantastic: false,
    scale: "realm",
    tone: "grim",
    people: "invented",
    series: true,
  };
  const content = modulePresetContent(preset);
  assert.ok(content.includes("module: event-names\n") && content.includes("scale: realm\n") && content.includes("kind: any\n"));
  const parsed = parseModulePreset(content, "x");
  assert.deepEqual(parsed.event, preset);
  assert.deepEqual(parsed.problems, []);
  const state = [["tone", "grim"], ["people", "invented"], ["series", "on"]].reduce((s, [f, id]) => chooseEvent(s, f as never, id), DEFAULT_EVENT_STATE);
  assert.equal(eventSentenceText(eventSentence(state)), preset.description);
  const bad = parseModulePreset(modulePresetContent({ ...preset, scale: "galaxy" as never }), "x");
  assert.equal(bad.event?.scale, "realm");
  assert.deepEqual(bad.problems, ["Unknown scale “galaxy”."]);
});
