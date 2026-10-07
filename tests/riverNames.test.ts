// River names (river brief §6, §7).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mulberry32 } from "../src/markov";
import { NAME_WORDS } from "../src/names/engine";
import {
  generateRiverNames,
  RIVER_DATA,
  riverFill,
  riverName,
  type RiverName,
  type RiverSetting,
  waterWordWeights,
} from "../src/rivers/engine";

const SETTINGS: RiverSetting[] = ["british", "new-land", "established"];
const REGIONS: (string | undefined)[] = [undefined, ...Object.keys(RIVER_DATA.regionCorpora).filter((r) => r !== "all")];
const SCOTTISH = ["SBL", "SLO", "SHH", "NSI"];
const REAL = new Set(Object.values(RIVER_DATA.corpora).flat().map((n) => n.toLowerCase()));

const sample = (setting: RiverSetting, region: string | undefined, n: number, seed: number): RiverName[] => {
  const rng = mulberry32(seed);
  return Array.from({ length: n }, () => riverName({ setting, region }, rng));
};
const settingRegions = (setting: RiverSetting) => (setting === "british" ? REGIONS : [undefined]);

test("rivers: data matches the brief's corpora and region list", () => {
  assert.equal(RIVER_DATA.corpora.england.length, 112);
  assert.equal(RIVER_DATA.corpora.wales.length, 66);
  assert.equal(RIVER_DATA.corpora.scotland.length, 77);
  assert.equal(REGIONS.length, 13);
});

test("rivers: the same seed and inputs give an identical batch", () => {
  for (const setting of SETTINGS) {
    for (const region of settingRegions(setting)) {
      assert.deepEqual(
        generateRiverNames({ setting, region, count: 50, seed: 7 }),
        generateRiverNames({ setting, region, count: 50, seed: 7 }),
      );
    }
  }
});

test("rivers: batches are distinct (case-insensitive) and full", () => {
  for (const setting of SETTINGS) {
    const { names, notice } = generateRiverNames({ setting, count: 100, seed: 3 });
    assert.equal(names.length, 100);
    assert.equal(notice, undefined);
    assert.equal(new Set(names.map((n) => n.text.toLowerCase())).size, names.length);
  }
});

test("rivers: kind shares are within ±3 points of §6.2 over 4,000 names", () => {
  for (const setting of SETTINGS) {
    const counts = { ancient: 0, descriptive: 0, pattern: 0 };
    for (const name of sample(setting, undefined, 4000, 11)) counts[name.kind]++;
    const weights = RIVER_DATA.kindWeights[setting];
    const total = weights.ancient + weights.descriptive + weights.pattern;
    for (const kind of ["ancient", "descriptive", "pattern"] as const) {
      const share = counts[kind] / 4000;
      const expected = weights[kind] / total;
      assert.ok(Math.abs(share - expected) <= 0.03, `${setting} ${kind}: ${share.toFixed(3)} vs ${expected.toFixed(3)}`);
    }
  }
});

test("rivers: a water word with weight 0 never appears in its setting or region", () => {
  for (const setting of SETTINGS) {
    for (const region of settingRegions(setting)) {
      const weights = waterWordWeights(setting, region);
      for (const name of sample(setting, region, 1500, 5)) {
        if (name.water === undefined) continue;
        assert.ok((weights[name.water] ?? 0) > 0, `${setting} ${region ?? "all"}: ${name.water} in ${name.text}`);
        if (name.form !== "bare" || setting === "british") assert.ok(name.text.toLowerCase().includes(name.water), name.text);
      }
    }
  }
});

test("rivers: ancient names are 3–8 letters, never a real river, never colonial", () => {
  for (const region of REGIONS) {
    let ancient = 0;
    for (const name of sample("british", region, 1000, 17)) {
      if (!name.ancient) continue;
      ancient++;
      const letters = Array.from(name.ancient.replace(/[^\p{L}]/gu, "")).length;
      assert.ok(letters >= 3 && letters <= 8, name.ancient);
      assert.ok(!REAL.has(name.ancient.toLowerCase()), `${name.ancient} is a real river`);
      assert.match(name.ancient, /^\p{Lu}/u, "title-cased");
    }
    assert.ok(ancient > 200, `${region ?? "all"}: ancient names are produced`);
  }
  for (const setting of ["new-land", "established"] as const) {
    for (const name of sample(setting, undefined, 2000, 19)) {
      assert.notEqual(name.kind, "ancient");
      assert.equal(name.ancient, undefined);
    }
  }
});

test("rivers: X Water and Water of X appear only in SBL, SLO, SHH and NSI", () => {
  for (const region of REGIONS) {
    const scottish = !!region && SCOTTISH.includes(region);
    const forms = new Set(sample("british", region, 2000, 23).filter((n) => n.ancient).map((n) => n.form));
    if (scottish) {
      assert.ok(forms.has("x-water") && forms.has("water-of-x"), `${region}: Scottish forms appear`);
    } else {
      assert.ok(!forms.has("x-water") && !forms.has("water-of-x"), `${region ?? "all"}: ${[...forms]}`);
    }
  }
});

test("rivers: colonial bare forms appear only with the water word river", () => {
  for (const setting of ["new-land", "established"] as const) {
    let bare = 0;
    for (const name of sample(setting, undefined, 3000, 31)) {
      if (name.kind !== "descriptive") continue;
      if (name.form === "bare") {
        bare++;
        assert.equal(name.water, "river", name.text);
        assert.ok(!name.text.includes(" ") || !/ (River|Creek|Run|Fork|Branch|Stream)$/.test(name.text), name.text);
      } else {
        assert.match(name.text, new RegExp(` ${name.water}$`, "i"));
      }
    }
    assert.ok(bare > 0, `${setting}: bare names appear`);
  }
});

test("rivers: colonial names are always spaced; British descriptive fuse only fusing words", () => {
  for (const setting of ["new-land", "established"] as const) {
    for (const name of sample(setting, undefined, 1000, 37)) {
      if (name.kind === "descriptive" && name.form !== "bare") assert.ok(name.text.includes(" "), name.text);
    }
  }
  const fused = sample("british", undefined, 3000, 43).filter((n) => n.kind === "descriptive" && n.water && !n.text.includes(" "));
  assert.ok(fused.length > 0, "some British descriptive names fuse (Blackwater)");
});

test("rivers: patterns appear only in this module, never in fills", () => {
  const patterns = new Set(SETTINGS.flatMap((s) => RIVER_DATA.patterns[s].map((p) => p.pattern)));
  for (const setting of SETTINGS) {
    for (const region of settingRegions(setting)) {
      const rng = mulberry32(41);
      for (let i = 0; i < 300; i++) {
        const fill = riverFill({ setting, region }, rng);
        assert.ok(!patterns.has(fill), fill);
        assert.ok(!/[[\]]/.test(fill), `bracket: ${fill}`);
        assert.ok(!/\bRiver\b/.test(fill), `River: ${fill}`);
        assert.ok(!/\bWater of\b/i.test(fill), `Water of: ${fill}`);
        assert.ok(!/\bthe\b/i.test(fill), `the: ${fill}`);
      }
    }
  }
  const module = sample("new-land", undefined, 500, 47).filter((n) => n.kind === "pattern");
  assert.ok(module.length > 0 && module.every((n) => n.hasPlaceholder));
});

test("rivers: [holy person] follows §4 in patterns", () => {
  const all = SETTINGS.flatMap((s) => RIVER_DATA.patterns[s].map((p) => p.pattern)).join(" ");
  assert.ok(all.includes("[holy person]"));
  assert.ok(!all.includes("saint"));
});

test("rivers: colonial descriptive names use only colour, quality-or-condition and shape words", () => {
  const allowed = new Set(
    ["colour", "quality-or-condition", "shape"].flatMap((c) => NAME_WORDS.categories[c].map((e) => e.modern.toLowerCase())),
  );
  for (const setting of ["new-land", "established"] as const) {
    for (const name of sample(setting, undefined, 2000, 53)) {
      if (name.kind !== "descriptive") continue;
      const word = name.form === "bare" ? name.text.toLowerCase() : name.text.slice(0, -(name.water!.length + 1)).toLowerCase();
      assert.ok(allowed.has(word), `${setting}: ${name.text}`);
    }
  }
});

test("rivers: native patterns appear only in New Land and Established", () => {
  for (const name of sample("british", undefined, 3000, 59)) assert.ok(!name.text.includes("[native"), name.text);
  for (const setting of ["new-land", "established"] as const) {
    assert.ok(sample(setting, undefined, 3000, 61).some((n) => /\[native (bird|wild animal|fish or creature|tree|plant)\]/.test(n.text)));
  }
});
