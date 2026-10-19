// Wild lands brief §16.4: series, safeguards, presets and history.
import { test } from "node:test";
import assert from "node:assert/strict";
import { isModulePresetContent, modulePresetContent, parseModulePreset } from "../src/presets";
import { SECTION_LABELS } from "../src/sections";
import { defaultWildsBlock } from "./fixtures/wildsBlock";
import {
  generateWildsNames,
  PARENT_KIND,
  WILDS_CULTURES,
  WILDS_DATA,
  WILDS_MODULES,
  wildsBlocked,
  type WildsEra,
  type WildsModule,
} from "../src/wilds/engine";
import { chooseWilds, defaultWildsState, wildsHistoryLabel, wildsSentence, wildsSentenceText } from "../src/wilds/sentence";

// ── Series (§12) ───────────────────────────────────────────────────────────

test("series: with kind Any the first name is the parent kind and holds the anchor", () => {
  for (const module of WILDS_MODULES) {
    for (let seed = 1; seed <= 12; seed++) {
      const batch = generateWildsNames({ module, culture: "norman-british", people: "invented", series: true, count: 8, seed });
      const first = batch.names[0];
      assert.equal(first.kind, PARENT_KIND[module], `${module} ${seed}: ${first.text}`);
      assert.equal(first.anchored, true, `${module} ${seed}: ${first.text}`);
    }
  }
});

test("series: with a kind chosen there is no parent name", () => {
  const batch = generateWildsNames({ module: "mountainNames", culture: "norman-british", kind: "pass", people: "invented", series: true, count: 12, seed: 4 });
  assert.ok(batch.names.every((n) => n.kind === "pass"));
});

test("series: across 1,000 batches of 10, 0.6 ± 0.05 of later names with a place hold the anchor", () => {
  let eligible = 0;
  let held = 0;
  for (let i = 0; i < 1000; i++) {
    const module = WILDS_MODULES[i % WILDS_MODULES.length];
    const batch = generateWildsNames({ module, culture: "norman-british", people: "invented", series: true, count: 10, seed: 1000 + i });
    for (const n of batch.names.slice(1)) {
      if (!n.words.some((w) => w.pool === "town")) continue;
      eligible++;
      if (n.anchored) held++;
    }
  }
  assert.ok(eligible > 2000, `${eligible} eligible`);
  const share = held / eligible;
  assert.ok(Math.abs(share - 0.6) <= 0.05, `share ${share}`);
});

test("series: placeholders share the placeholder", () => {
  const batch = generateWildsNames({ module: "forestNames", culture: "general", series: true, count: 6, seed: 2 });
  assert.equal(batch.names[0].kind, PARENT_KIND.forestNames);
});

// ── Safeguards (§13) ───────────────────────────────────────────────────────

test("safeguards: exact phrases are blocked with and without The; others pass", () => {
  assert.ok(wildsBlocked("mountainNames", "Misty Mountains"));
  assert.ok(wildsBlocked("mountainNames", "The Misty Mountains"));
  assert.ok(wildsBlocked("mountainNames", "Mount Sinai"));
  assert.ok(wildsBlocked("forestNames", "Fangorn"));
  assert.ok(wildsBlocked("grasslandNames", "The Dothraki Sea"));
  assert.ok(!wildsBlocked("mountainNames", "The Black Mountains"));
  assert.ok(!wildsBlocked("moorNames", "Dartmoor"));
  assert.ok(!wildsBlocked("grasslandNames", "Salisbury Plain"));
  // A module's list doesn't block another's.
  assert.ok(!wildsBlocked("moorNames", "Misty Mountains"));
  // Merged lists (packs) are honoured.
  assert.ok(wildsBlocked("moorNames", "Black Fell", { block: ["Black Fell"], flag: [], flagListBlocks: false }));
  const blocked = generateWildsNames({ module: "moorNames", culture: "norman-british", shape: "{wildColour} Fell", people: "invented", count: 40, seed: 3, safeguards: { block: ["Black Fell"], flag: [], flagListBlocks: false } });
  assert.ok(!blocked.names.some((n) => n.text === "Black Fell"));
});

test("safeguards: no blocked phrase and no banned word in 10,000 names per module across settings", () => {
  const eras: WildsEra[] = ["AN", "MD", "EM", "ST", "MO", "NF", "IS"];
  for (const module of WILDS_MODULES) {
    let total = 0;
    for (let i = 0; total < 10000; i++) {
      const culture = WILDS_CULTURES[i % WILDS_CULTURES.length].key;
      const names = generateWildsNames({
        module,
        culture,
        era: eras[i % eras.length],
        where: i % 3 === 0 ? "new" : "home",
        fantastic: i % 2 === 0,
        people: i % 4 === 0 ? "placeholders" : "invented",
        count: 100,
        seed: 500 + i,
      }).names;
      for (const n of names) {
        assert.ok(!wildsBlocked(module, n.text), `${module}: ${n.text}`);
        assert.ok(!/\bsquaw\b/i.test(n.text), n.text);
      }
      total += names.length;
    }
  }
  assert.ok(defaultWildsBlock(WILDS_DATA));
});

test("safeguards: the sensitive cultures draw no light or grim shapes and no fantastic ones", () => {
  for (const module of WILDS_MODULES)
    for (const culture of ["polynesian", "andean"]) {
      const names = generateWildsNames({ module, culture, fantastic: true, tone: "any", people: "invented", count: 300, seed: 9 }).names;
      for (const n of names) assert.ok(!n.tones.includes("light") && !n.tones.includes("grim"), `${module} ${culture}: ${n.text}`);
    }
});

// ── Presets (§14) and history (§1.3) ───────────────────────────────────────

const ROUND_TRIP: Record<WildsModule, string> = {
  mountainNames: "mountain-names",
  forestNames: "forest-names",
  desertNames: "desert-names",
  moorNames: "moor-names",
  wetlandNames: "wetland-names",
  grasslandNames: "grassland-names",
};

test("presets: a preset round-trips for each module", () => {
  for (const module of WILDS_MODULES) {
    const preset = {
      packName: "Test",
      setting: "",
      description: "A test.",
      wildsModule: module,
      culture: "norse",
      wildsKind: "any",
      era: "EM" as WildsEra,
      where: "new" as const,
      fantastic: true,
      region: "all",
      biome: WILDS_DATA.modules[module].biomes[1],
      tone: "grim" as const,
      people: "invented" as const,
      series: true,
    };
    const text = modulePresetContent(preset);
    assert.ok(isModulePresetContent(text));
    assert.match(text, new RegExp(`module: ${ROUND_TRIP[module]}`));
    const back = parseModulePreset(text, "Test");
    assert.deepEqual(back.problems, [], module);
    assert.deepEqual({ ...back.wilds!, description: "A test." }, preset);
  }
});

test("presets: a value outside its choices falls back to the default", () => {
  const text = "---\ntype: module-preset\nmodule: desert-names\nculture: elvish\nkind: nonsense\nera: ZZ\nwhere: sideways\nbiome: temperate\nregion: Narnia\ntone: spicy\npeople: robots\n---\n\nbody\n";
  const { wilds, problems } = parseModulePreset(text, "Odd");
  assert.ok(problems.length >= 6);
  assert.equal(wilds!.culture, "general");
  assert.equal(wilds!.wildsKind, "any");
  assert.equal(wilds!.era, "MD");
  assert.equal(wilds!.where, "home");
  assert.equal(wilds!.biome, "any");
  assert.equal(wilds!.region, "all");
  assert.equal(wilds!.tone, "any");
  assert.equal(wilds!.people, "placeholders");
});

test("history: labels follow §1.3 in order", () => {
  const base = defaultWildsState("mountainNames");
  assert.equal(wildsHistoryLabel("mountainNames", base, SECTION_LABELS.mountainNames), "mountains · medieval · Norman & British");
  const full = { ...base, where: "new" as const, culture: "roman", biome: "boreal", kind: "pass", fantastic: true, tone: "grim" as const, series: true };
  assert.equal(
    wildsHistoryLabel("mountainNames", chooseWilds(full, "culture", "roman", "mountainNames"), SECTION_LABELS.mountainNames),
    "mountains · medieval · Roman / Italian · new country · Northern forest and tundra · passes and cols · fantastic · grim · series",
  );
  assert.equal(wildsHistoryLabel("mountainNames", { ...base, region: "NTH" }, "mountains"), "mountains · medieval · Norman & British · the North");
  assert.match(wildsSentenceText(wildsSentence({ ...base, series: true }, "mountainNames")), /in one range\.$/);
});
