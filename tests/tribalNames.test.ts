// Tribal names (Tribal brief §4–§17, §22.2).
import { test } from "node:test";
import assert from "node:assert/strict";
import { BIOMES, biomeWords, findBiome, TERRAINS } from "../src/biomes";
import { mulberry32 } from "../src/markov";
import tribalSnapshots from "./fixtures/tribal-snapshots.json";
import {
  breaksColourRule,
  generateTribalNames,
  PERSON_COLLECTIVES,
  TRIBAL_DATA,
  TRIBAL_REGISTERS,
  TRIBAL_TRADITIONS,
  traditionGroupTypeWeights,
  traditionThemeWeights,
  tribalHistoryLabel,
  tribalName,
  type TribalName,
  type TribalOptions,
} from "../src/tribes/engine";

const KEYS = [
  "general", "celtic", "germanic", "steppe", "arabian", "bantu", "northAmerican", "polynesian", "eastAsian",
  "mesoamerican", "andean", "maritimeSEA", "mediterranean", "northernPacific", "westAfrican", "southAsian", "sahul",
];

/** `n` single names (not batch-unique), headwords only unless histories are wanted. */
function names(options: TribalOptions, n: number, seed = 1, full = false): TribalName[] {
  const rng = mulberry32(seed);
  const opts = full ? options : { ...options, constraints: { ...options.constraints, headwordOnly: true } };
  const out: TribalName[] = [];
  for (let i = 0; i < n; i++) {
    const name = tribalName(opts, rng);
    if (name) out.push(name);
  }
  return out;
}
const has = (text: string, word: string) => new RegExp(`(^|[^A-Za-z])${word}($|[^A-Za-z])`, "i").test(text);

test("tribal: the 17 traditions, homelands and terrain multipliers", () => {
  assert.deepEqual(TRIBAL_TRADITIONS.map((t) => t.key), KEYS);
  for (const t of TRIBAL_TRADITIONS) {
    assert.equal(Object.values(t.homeland).reduce((n, w) => n + w, 0), 100, t.key);
    for (const id of Object.keys(t.homeland)) assert.ok(findBiome(id), `${t.key}: ${id}`);
    for (const terrain of Object.keys(t.terrainMultipliers)) assert.ok((TERRAINS as readonly string[]).includes(terrain), `${t.key}: ${terrain}`);
  }
});

test("tribal: the same options and seed give the same names", () => {
  const a = generateTribalNames({ tradition: "polynesian", count: 20, seed: 99 });
  const b = generateTribalNames({ tradition: "polynesian", count: 20, seed: 99 });
  assert.deepEqual(a, b);
});

test("tribal: every tradition and register fills a batch of short, English, unique names", () => {
  for (const tradition of KEYS) {
    for (const register of TRIBAL_REGISTERS) {
      const batch = generateTribalNames({ tradition, register, count: 50, seed: 3 });
      if (batch.names.length < 50) assert.ok(batch.notices.length > 0, `${tradition} ${register}: no notice`);
      const cap = TRIBAL_DATA.lengthCaps[register];
      const seen = new Set<string>();
      for (const n of batch.names) {
        assert.ok(n.name.length > 0);
        assert.ok(n.name.split(" ").length <= cap, `${tradition} ${register}: ${n.name}`);
        assert.ok(/^[A-Za-z' -]+$/.test(n.name), `${tradition}: ${n.name}`);
        for (const w of ["iwi", "ayllu", "banu", "kel", "orang", "ngati"]) assert.ok(!has(n.name, w), n.name);
        assert.ok(!seen.has(n.name.toLowerCase()));
        seen.add(n.name.toLowerCase());
        assert.ok(n.historicity.length > 0);
        assert.ok(n.origin.length > 0);
      }
    }
  }
});

test("tribal: colour rule, banned words and block list across 2,000 names per tradition", () => {
  const colours = new Set([...TRIBAL_DATA.vocabulary.colours, "Yellow"]);
  const persons = new Set(PERSON_COLLECTIVES);
  const block = new Set(TRIBAL_DATA.safeguards.blockList.map((b) => b.toLowerCase()));
  for (const tradition of KEYS) {
    const exceptions = new Set(TRIBAL_TRADITIONS.find((t) => t.key === tradition)!.special.colourCollectives ?? []);
    for (const n of names({ tradition, hostile: true, register: "plain" }, 2000, 5)) {
      const words = n.name.split(" ");
      for (let i = 0; i < words.length - 1; i++) {
        assert.ok(!(colours.has(words[i]) && persons.has(words[i + 1]) && !exceptions.has(words[i + 1])), `${tradition}: ${n.name}`);
      }
      for (const b of TRIBAL_DATA.safeguards.banned) assert.ok(!has(n.name, b), `${tradition}: ${n.name}`);
      assert.ok(!block.has(n.name.toLowerCase().replace(/^the /, "")), `${tradition}: ${n.name}`);
    }
  }
  assert.ok(breaksColourRule("Red Folk", "celtic"));
  assert.ok(!breaksColourRule("Blue Host", "steppe"));
  assert.ok(breaksColourRule("Blue Host", "celtic") === false, "Host is not a person-collective");
});

test("tribal: homeland suppressions apply at home and lift in a chosen biome", () => {
  const home = names({ tradition: "polynesian" }, 3000, 7);
  for (const n of home) {
    for (const w of ["Horse", "Mare", "Riders", "Sword"]) assert.ok(!has(n.name, w), n.name);
  }
  // Words that exist only in tropical-islands lists or the Polynesian flavour.
  const tropical = findBiome("tropical-islands")!;
  const temperate = findBiome("temperate")!;
  const lists = ["wildAnimals", "birds", "creatures", "trees", "plants", "crops", "livestock", "lifeways", "sacred", "materials"] as const;
  const wordsOf = (b: typeof tropical) => [
    ...lists.flatMap((l) => biomeWords(b, l).map(([w]) => w.toLowerCase())),
    ...TERRAINS.flatMap((t) => [...(b.land[t] ?? []), ...(b.water[t] ?? [])].map(([w]) => w.toLowerCase())),
  ];
  const poly = TRIBAL_TRADITIONS.find((t) => t.key === "polynesian")!;
  // Shared vocabulary (canoe names, sacred words…) is not biome-specific: "the Star Path Canoe".
  const sharedText = JSON.stringify([TRIBAL_DATA.vocabulary, TRIBAL_DATA.collectives, TRIBAL_DATA.safeguards]).toLowerCase();
  const temperateWords = new Set(wordsOf(temperate));
  const exclusive = [...wordsOf(tropical), ...Object.values(poly.flavour).flat().map((w) => w.toLowerCase())].filter(
    (w) => !temperateWords.has(w) && !sharedText.includes(w),
  );
  const chosen = names({ tradition: "polynesian", biome: "temperate" }, 3000, 7);
  for (const n of chosen) {
    for (const w of exclusive) assert.ok(!has(n.name, w), `${n.name} uses ${w}`);
    assert.ok(!has(n.name, "Sword"), n.name);
  }
  assert.ok(chosen.some((n) => [...temperateWords].some((w) => has(n.name, w))));
  const andean = names({ tradition: "andean", biome: "steppe" }, 3000, 7);
  assert.ok(andean.some((n) => has(n.name, "Horse") || has(n.name, "Riders") || has(n.name, "Horse Herders")));
});

test("tribal: South Asian never names a lifeway or an occupational group", () => {
  for (const biome of [undefined, ...BIOMES.map((b) => b.id)]) {
    for (const n of names({ tradition: "southAsian", biome }, biome ? 500 : 5000, 9)) {
      assert.notEqual(n.theme, "lifeway");
      assert.notEqual(n.groupType, "occupational");
    }
  }
});

test("tribal: Australia & New Guinea's sacred names use Sun, Moon, Rain or Springs only", () => {
  const sacred = names({ tradition: "sahul" }, 4000, 11).filter((n) => n.theme === "sacred");
  assert.ok(sacred.length > 0);
  for (const n of sacred) assert.ok(["Sun", "Moon", "Rain", "Springs"].includes(n.keyword), `${n.name}: ${n.keyword}`);
});

test("tribal: parity across traditions", () => {
  for (const t of TRIBAL_TRADITIONS) {
    const groupTypes = Object.values(traditionGroupTypeWeights(t)).filter((w) => w > 0).length;
    assert.ok(groupTypes >= 8, `${t.key}: ${groupTypes} group types`);
    const themes = traditionThemeWeights(t);
    assert.ok(themes.animals + themes.sacred <= 40 + 1e-9, `${t.key}: ${themes.animals + themes.sacred}`);
    for (const perspective of Object.keys(TRIBAL_DATA.perspectives)) {
      assert.ok(names({ tradition: t.key, perspective }, 30, 13).length > 0, `${t.key}: ${perspective}`);
    }
    for (const register of TRIBAL_REGISTERS) assert.ok(names({ tradition: t.key, register }, 30, 13).length > 0, `${t.key}: ${register}`);
  }
});

test("tribal: General group types follow their base weights", () => {
  const all = names({ tradition: "general", register: "plain" }, 10000, 17);
  for (const g of TRIBAL_DATA.groupTypes) {
    const pct = (all.filter((n) => n.groupType === g.key).length * 100) / all.length;
    assert.ok(Math.abs(pct - g.weight) <= 3, `${g.key}: ${pct.toFixed(1)}% against ${g.weight}%`);
  }
});

test("tribal: biome gating", () => {
  for (const n of names({ tradition: "steppe", biome: "tropical-islands" }, 2000, 19)) {
    assert.ok(!/ (Tents|Wells)$/.test(n.name) && !/(^| )(Tents|Wells)( |$)/.test(n.name.replace(/ of the .*/, "")), n.name);
  }
  // §3.8 gates sea-axis words (×0.2) where coast + islands < 10. The brief's check used the desert,
  // but its coast is exactly 10 (15 after Polynesian's ×1.5), so the gate never applies there; the
  // steppe (no coast or islands) is where it does.
  const seaShare = (biome: string) => {
    const list = names({ tradition: "polynesian", biome }, 2000, 19);
    return list.filter((n) => TRIBAL_DATA.vocabulary.directions.seaAxis.some((w) => has(n.name, w))).length / list.length;
  };
  const gated = seaShare("steppe");
  const open = seaShare("tropical-islands");
  assert.ok(gated < open / 2, `${(gated * 100).toFixed(1)}% gated against ${(open * 100).toFixed(1)}% at home`);
});

test("tribal: snapshots after the terrain split hold", () => {
  for (const tradition of ["general", "celtic", "polynesian"]) {
    for (const seed of [1, 2]) {
      assert.deepEqual(JSON.parse(JSON.stringify(generateTribalNames({ tradition, count: 20, seed }).names)), (tribalSnapshots as Record<string, unknown>)[`${tradition} ${seed}`]);
    }
  }
});

test("tribal: history labels", () => {
  assert.equal(tribalHistoryLabel("tribal names", "polynesian", "temperate", "plain"), "tribal names · Polynesian · temperate · plain");
  assert.equal(tribalHistoryLabel("tribal names", "celtic", undefined, "historical"), "tribal names · Celtic Britain & Gaul · homeland · historical");
  assert.equal(tribalHistoryLabel("tribal names", "polynesian", "britain", "plain", "coast"), "tribal names · Polynesian · British · coasts · plain");
});
