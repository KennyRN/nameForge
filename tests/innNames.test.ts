// Inns and taverns (Inns and taverns brief §15).
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUILT_IN_VOCAB, mergeVocabularyPacks, poolEntries, SETTLEMENT_VOCAB, VOCAB_THEMES, type VocabWhere } from "../src/settlement/vocab";

// ── §15.1 Vocabulary ────────────────────────────────────────────────────────

const INN_POOLS = [
  "innCreature", "innPerson", "innItem", "innDescription", "innNumber", "innFeature", "innHome", "innWorn", "innLocation", "innFable",
  "houseWord:inn", "houseWord:tavern", "houseWord:eating", "houseWord:wayhouse", "houseWord:rest", "houseWord:club", "houseWord:bar",
  "auspicious", "welcomePhrase", "eastNature", "oasisAnchor", "indianAnchor",
];
const at = (culture: string, extra: Partial<VocabWhere> = {}): VocabWhere => ({ culture, era: "MD", fantastic: false, ...extra });

test("§15.1: the new pools exist; themes are the five", () => {
  assert.deepEqual(VOCAB_THEMES, ["rural", "urban", "maritime", "road", "magical"]);
  for (const p of INN_POOLS) assert.ok(SETTLEMENT_VOCAB.pools[p]?.entries.length > 0, p);
  // Entry validity, themes included, is checked by the shared vocabulary test.
});

test("§3: a setting's themes multiply the entries that carry them; others ignore them", () => {
  const w = (word: string, themes?: Record<string, number>) => poolEntries(BUILT_IN_VOCAB, "innItem", at("general", { themes })).find(([e]) => e.w === word)?.[1];
  assert.equal(w("Anchor"), 1);
  assert.equal(w("Anchor", { maritime: 4 }), 4);
  assert.equal(w("Barrel", { maritime: 4 }), 1);
});

test("§15.1: a pack line “- Eel Trap [maritime]” is read with its theme", () => {
  const content = "---\ntype: vocabulary\n---\n\n## innItem\n- Eel Trap [maritime]\n- Lobster Pot ×2 (light) [maritime, road]\n";
  const { vocab, notices } = mergeVocabularyPacks([{ name: "V", content }]);
  assert.deepEqual(notices, []);
  const entry = (w: string) => poolEntries(vocab, "innItem", at("general")).find(([e]) => e.w === w);
  assert.deepEqual(entry("Eel Trap")?.[0].th, ["maritime"]);
  assert.deepEqual(entry("Lobster Pot")?.[0], { w: "Lobster Pot", x: 2, t: ["light"], th: ["maritime", "road"] });
});

// ── §15.2–§15.6 Engine ──────────────────────────────────────────────────────

import { englishShare, generateInnNames, hasChristianSign, hasSignTradition, INN_DATA, INN_SETTINGS, innBlockForms, innKindsOffered, breaksInnWords, type InnName, type InnOptions } from "../src/inns/engine";
import { ROUTE_CULTURES, ROUTE_DATA, ROUTE_ERAS, routeNorm, type RouteEra } from "../src/routes/engine";
import { inCultureGroup } from "../src/settlement/vocab";
import { hasBannedWord } from "../src/groups/engine";

/** Names from small batches (each batch holds a word once, so big batches skew shares). */
function many(o: Omit<InnOptions, "count" | "seed">, n: number, size = 5): InnName[] {
  const out: InnName[] = [];
  for (let seed = 1; out.length < n && seed < n * 4; seed++) out.push(...generateInnNames({ ...o, count: size, seed }).names);
  return out.slice(0, n);
}

test("§15.2: the same options and seed give the same names", () => {
  for (const o of [{ culture: "norman-british" }, { culture: "chinese", people: "invented" as const }, { culture: "general", era: "ST" as RouteEra, series: true }]) {
    assert.deepEqual(generateInnNames({ ...o, count: 20, seed: 42 }).names, generateInnNames({ ...o, count: 20, seed: 42 }).names);
  }
});

/** §8.1's anchors for these pairs can't make 20 different names even with invented people. */
const THIN = new Set(["arabic-persian eating", "chinese eating", "chinese inn", "chinese rest", "japanese eating"]);

test("§15.2: every culture × era × kind offered × setting × form × people gives 20 unique names within the cap", () => {
  for (const c of ROUTE_CULTURES) {
    const forms = hasSignTradition(c.key) ? (["signs", "house", "either"] as const) : (["either"] as const);
    for (const { code: era } of ROUTE_ERAS) {
      for (const k of innKindsOffered(era)) {
        for (const s of INN_SETTINGS) {
          for (const form of forms) {
            for (const people of ["placeholders", "invented"] as const) {
              const b = generateInnNames({ culture: c.key, era, kind: k.key, setting: s.key, form, people, count: 20, seed: 3 });
              const where = `${c.key} ${era} ${k.key} ${s.key} ${form} ${people}`;
              assert.equal(new Set(b.names.map((n) => n.text.toLowerCase())).size, b.names.length, where);
              for (const n of b.names) assert.equal(n.kind, k.key, where);
              if (b.names.length < 20) {
                // Placeholders fold the culture shapes' places and owners into [place] and [owner].
                const allowed = englishShare(c.key, era) < 1 && (people === "placeholders" || THIN.has(`${c.key} ${k.key}`));
                assert.ok(allowed, `${where}: only ${b.names.length}`);
                assert.ok(b.notices.some((x) => x.startsWith("Only ")), where);
              }
            }
          }
        }
      }
    }
  }
});

test("§15.3: Norman & British medieval signs follow the Book of Names' table within ±3 points", () => {
  const names = many({ culture: "norman-british", era: "MD", form: "signs" }, 10000);
  assert.equal(names.length, 10000);
  const total = INN_DATA.signs.reduce((n, a) => n + (a.key === "roadside" ? INN_SETTINGS[0].roadside : a.w), 0);
  for (const a of INN_DATA.signs) {
    if (a.key === "roadside") continue;
    const share = (100 * names.filter((n) => n.anchor === a.key).length) / names.length;
    assert.ok(Math.abs(share - (100 * a.w) / total) <= 3, `${a.key}: ${share.toFixed(1)}%`);
  }
});

test("§15.3: no Arms or owner shapes in the ancient era; Arms never take a house word; “the” is lower case", () => {
  for (const n of many({ culture: "norman-british", era: "AN", people: "invented" }, 2000)) assert.ok(n.anchor !== "arms" && n.anchor !== "owner", n.text);
  const names = many({ culture: "norman-british", era: "EM", form: "house", people: "invented", setting: "town" }, 3000);
  const arms = names.filter((n) => n.anchor === "arms");
  assert.ok(arms.length > 0);
  for (const n of arms) assert.ok(!n.house && / Arms$/.test(n.text), n.text);
  for (const n of names) assert.ok(!n.text.startsWith("The "), n.text);
});

const MARITIME = new Set(
  ["innCreature", "innPerson", "innItem", "innLocation", "innFable"].flatMap((p) => SETTLEMENT_VOCAB.pools[p].entries.filter((e) => e.th?.includes("maritime")).map((e) => e.w)),
);
const maritimeCount = (names: InnName[]) => names.flatMap((n) => n.words).filter((w) => MARITIME.has(w.word)).length;

test("§15.4: in a port, maritime words appear at least 3× as often as anywhere", () => {
  const port = maritimeCount(many({ culture: "norman-british", setting: "port", form: "signs" }, 3000));
  const anywhere = maritimeCount(many({ culture: "norman-british", setting: "anywhere", form: "signs" }, 3000));
  assert.ok(port >= 3 * anywhere, `${port} vs ${anywhere}`);
});

test("§15.4: by the road, at least 20% are roadside shapes or way stations; every route passes the route safeguards", () => {
  const names = many({ culture: "norman-british", setting: "road", people: "invented" }, 2000);
  const roadside = names.filter((n) => n.anchor === "roadside" || n.kind === "wayhouse");
  assert.ok(roadside.length >= 400, `${roadside.length}`);
  const block = new Set(ROUTE_DATA.safeguards.block.map(routeNorm));
  const routes = names.filter((n) => n.route);
  assert.ok(routes.length > 0);
  for (const n of routes) {
    const route = n.sign.replace(/^the /, "").replace(/ Inn$/, "");
    assert.ok(!block.has(routeNorm(route)), n.text);
  }
});

test("§15.5: chinese, japanese, arabic-persian, indian and west-african use no English signs", () => {
  for (const culture of ["chinese", "japanese", "arabic-persian", "indian", "west-african"]) {
    for (const era of ["MD", "ST"] as RouteEra[]) for (const n of many({ culture, era, people: "invented" }, 500)) assert.notEqual(n.tradition, "english", `${culture}: ${n.text}`);
  }
});

test("§15.5: steam-age clubs use the era shapes; interstellar houses are mostly bars", () => {
  const club = many({ culture: "norman-british", era: "ST", kind: "club", people: "invented" }, 500);
  assert.ok(club.some((n) => n.tradition === "era"));
  const is = many({ culture: "general", era: "IS", people: "invented" }, 2000);
  assert.ok(is.filter((n) => n.kind === "bar").length >= 1000);
});

test("§15.5: sensitive cultures draw no light, grim or fantastic entries", () => {
  const fantasticShapes = new Set([...INN_DATA.fantastic, ...INN_DATA.eraShapes.filter((s) => s.h)].map((s) => s.p));
  for (const culture of ["polynesian", "andean"]) {
    for (const era of ["MD", "ST", "MO"] as RouteEra[]) {
      for (const n of many({ culture, era, fantastic: true, people: "invented" }, 500)) {
        assert.ok(!n.tones.includes("light") && !n.tones.includes("grim"), n.text);
        assert.ok(!fantasticShapes.has(n.shape), n.text);
      }
    }
  }
});

test("§15.6: a one-town series of 8: no word twice, one roadside and one location house, at most one Arms", () => {
  for (let seed = 1; seed <= 20; seed++) {
    const b = generateInnNames({ culture: "norman-british", era: "EM", people: "invented", series: true, count: 8, seed });
    const where = b.names.map((n) => n.text).join(", ");
    assert.equal(b.names.length, 8, where);
    const uses = b.names.flatMap((n) => n.uses);
    assert.equal(new Set(uses).size, uses.length, where);
    assert.equal(b.names.filter((n) => n.anchor === "roadside").length, 1, where);
    assert.equal(b.names.filter((n) => n.anchor === "location").length, 1, where);
    assert.ok(b.names.filter((n) => n.anchor === "arms").length <= 1, where);
  }
});

test("§15.6: 5,000 names per culture: no block-list matches, no banned words or persons; christian signs only for christian cultures", () => {
  const block = new Set(INN_DATA.safeguards.block.map((w) => routeNorm(w).replace(/^the /, "")));
  for (const c of ROUTE_CULTURES) {
    const names: [InnName, RouteEra][] = [];
    for (const { code: era } of ROUTE_ERAS) {
      for (const fantastic of [false, true]) {
        for (const n of many({ culture: c.key, era, fantastic, people: fantastic ? "invented" : "placeholders" }, 360, 50)) names.push([n, era]);
      }
    }
    assert.ok(names.length >= 5000, `${c.key}: ${names.length}`);
    for (const [n, era] of names) {
      assert.ok(!innBlockForms(n.text).some((f) => block.has(f)), `${c.key}: ${n.text}`);
      assert.ok(!hasBannedWord(n.text) && !breaksInnWords(n.text), `${c.key}: ${n.text}`);
      if (hasChristianSign(n.text)) assert.ok(inCultureGroup("christian", c.key, era), `${c.key} ${era}: ${n.text}`);
    }
  }
});

// ── §15.7 Sentence and presets ──────────────────────────────────────────────

import { chooseInn, DEFAULT_INN_STATE, innHistoryLabel, innSentence, innSentenceText, type InnSentenceState } from "../src/inns/sentence";
import { modulePresetContent, parseModulePreset, type InnPreset } from "../src/presets";
import { historySection, SECTION_GROUPS } from "../src/sections";

const iField = (state: InnSentenceState, f: string) => innSentence(state).find((s) => typeof s !== "string" && s.field === f);

test("§15.7: the default sentence's plain text", () => {
  assert.equal(
    innSentenceText(innSentence(DEFAULT_INN_STATE)),
    "Norman & British houses of any kind of the medieval era, in a realistic world, across all of Britain, anywhere, as signs or with a house word, of any tone, with placeholders for people and places, each one separate.",
  );
  const port = [["kind", "tavern"], ["era", "EM"], ["setting", "port"], ["people", "invented"], ["series", "on"]].reduce((s, [f, id]) => chooseInn(s, f as never, id), DEFAULT_INN_STATE);
  assert.equal(
    innSentenceText(innSentence(port)),
    "Norman & British taverns of the early modern era, in a realistic world, across all of Britain, in a port, as signs or with a house word, of any tone, with invented people and places, as one town.",
  );
});

test("§15.7: the form link is hidden for chinese; kinds reset with the era", () => {
  const chinese = chooseInn(DEFAULT_INN_STATE, "culture", "chinese");
  assert.equal(iField(chinese, "form"), undefined);
  assert.equal(iField(chinese, "region"), undefined);
  assert.ok(iField(chooseInn(DEFAULT_INN_STATE, "culture", "roman"), "form"));
  const bar = chooseInn(chooseInn(DEFAULT_INN_STATE, "era", "IS"), "kind", "bar");
  assert.equal(bar.kind, "bar");
  assert.equal(chooseInn(bar, "era", "MD").kind, undefined);
});

test("§1: the module follows streets and districts; history label and section", () => {
  assert.deepEqual(SECTION_GROUPS.placeNames.slice(0, 4), ["placeShapes", "routeNames", "streetNames", "innNames"]);
  assert.equal(innHistoryLabel(DEFAULT_INN_STATE), "inns and taverns · medieval · Norman & British");
  const full: InnSentenceState = { ...DEFAULT_INN_STATE, era: "ST", kind: "club", setting: "road", region: "NTH", fantastic: true, tone: "grim", series: true };
  assert.equal(innHistoryLabel(full), "inns and taverns · steam age · Norman & British · clubs and hotels · by the road · the North · steampunk · grim · one town");
  assert.equal(historySection(innHistoryLabel(full)), "innNames");
});

test("§15.7: presets round-trip", () => {
  const preset: InnPreset = {
    packName: "Harbour taverns",
    setting: "",
    description: "Norman & British taverns of the early modern era, in a realistic world, across all of Britain, in a port, as signs or with a house word, of any tone, with invented people and places, as one town.",
    culture: "norman-british",
    region: "all",
    innKind: "tavern",
    era: "EM",
    fantastic: false,
    innSetting: "port",
    form: "either",
    tone: "any",
    people: "invented",
    series: true,
  };
  const content = modulePresetContent(preset);
  assert.ok(content.includes("module: inn-names\n") && content.includes("setting: port\n") && content.includes("kind: tavern\n"));
  const parsed = parseModulePreset(content, "x");
  assert.deepEqual(parsed.inn, preset);
  assert.deepEqual(parsed.problems, []);
  const bad = parseModulePreset(modulePresetContent({ ...preset, innKind: "bar", form: "sign" as never }), "x");
  assert.equal(bad.inn?.innKind, "any");
  assert.deepEqual(bad.problems, ["Kind “bar” isn't offered in the early modern era.", "Unknown form “sign”."]);
});

// ── Buildings brief §11.3: landmark signs ───────────────────────────────────

import { buildingWordBlocked } from "../src/buildings/engine";

test("Buildings §11.3: {landmark} signs: at most 3 words before the house word, passing the building safeguards", () => {
  let location = 0;
  let road = 0;
  for (let seed = 1; seed <= 60; seed++) {
    for (const shape of ["the {landmark}", "the {roadLandmark} Inn"]) {
      for (const n of generateInnNames({ culture: "norman-british", era: "EM", people: "invented", shape, count: 4, seed }).names) {
        const lm = n.words.find((w) => w.pool === "landmark");
        assert.ok(lm, n.text);
        if (shape === "the {landmark}") location++;
        else road++;
        assert.ok(n.sign === `the ${lm!.word}` || n.sign === `the ${lm!.word} Inn`, n.text);
        assert.ok(lm!.word.split(" ").length <= 3, n.text);
        assert.ok(!buildingWordBlocked(lm!.word), n.text);
      }
    }
  }
  assert.ok(location > 50 && road > 50, `${location} ${road}`);
});

test("Buildings §11.2: the landmark is a fifth of location draws", () => {
  const loc = INN_DATA.signs.find((a) => a.key === "location")!.shapes;
  const total = loc.reduce((n, s) => n + s.w, 0);
  assert.equal(loc.find((s) => s.p === "the {landmark}")!.w / total, 0.2);
  assert.equal(INN_DATA.signs.find((a) => a.key === "roadside")!.shapes.find((s) => s.p === "the {roadLandmark} Inn")?.w, 3);
});
