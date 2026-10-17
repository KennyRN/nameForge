// Stellar brief §15.5: the Interstellar era in world place names.
import test from "node:test";
import assert from "node:assert/strict";
import { findBiome, pluralOf, SPACE_BIOMES } from "../src/biomes";
import { hasSpaceBlock } from "../src/space/safeguards";
import { eraUsesLand, findCulture, generateWorldPlaceNames, INTERSTELLAR_ERA, parseTemplate, WORLD_CULTURES, worldHistoryLabel } from "../src/world/engine";

/** One name per seed, so the batch's de-duplication never skews a share. */
function draws(culture: string, n: number, extra: Partial<Parameters<typeof generateWorldPlaceNames>[0]> = {}, from = 1) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(...generateWorldPlaceNames({ culture, era: INTERSTELLAR_ERA, count: 1, seed: from + i, ...extra }).names);
  return out;
}

const FIRST_ERAS: Record<string, string> = {
  "anglo-saxon": "old-english", norse: "viking", celtic: "pagan", roman: "imperial", chinese: "imperial", egyptian: "pharaonic", aztec: "mexica", bantu: "kingdoms",
  slavic: "rus", "arabic-persian": "arabic", indian: "ancient", japanese: "samurai", "west-african": "sahel-and-forest", maya: "classic", korean: "joseon", ethiopian: "aksum-and-abyssinia",
};

test("§12.2: every culture's last era is Interstellar, and its default era is unchanged", () => {
  for (const c of WORLD_CULTURES) {
    assert.equal(c.eras[c.eras.length - 1].id, INTERSTELLAR_ERA, c.id);
    assert.equal(c.eras[0].id, FIRST_ERAS[c.id], c.id);
    assert.ok(c.eras.length >= 2, c.id);
  }
});

test("§12.2: history labels keep their old form, and the Interstellar era always shows", () => {
  assert.equal(worldHistoryLabel("world place names", "norse"), "world place names · Norse");
  assert.equal(worldHistoryLabel("world place names", "norse", "interstellar"), "world place names · Norse · Interstellar");
  assert.equal(worldHistoryLabel("world place names", "anglo-saxon", "modern"), "world place names · Anglo-Saxon · Modern");
  assert.equal(worldHistoryLabel("world place names", "anglo-saxon"), "world place names · Anglo-Saxon · Old English");
});

test("§12.3: eraUsesLand", () => {
  assert.equal(eraUsesLand("egyptian", "interstellar"), true);
  assert.equal(eraUsesLand("egyptian", "pharaonic"), false);
  assert.equal(eraUsesLand("norse", "viking"), true);
  assert.equal(eraUsesLand("norse", undefined), true);
});

test("§12.5–§12.6: 2,000 names per culture: no placeholder, no franchise phrase, space words only from the tokens", () => {
  for (const c of WORLD_CULTURES) {
    const batch = generateWorldPlaceNames({ culture: c.id, era: INTERSTELLAR_ERA, count: 300, seed: 17 });
    assert.ok(batch.names.length >= 100, `${c.id}: ${batch.names.length}`);
    assert.deepEqual(batch.notices.filter((n) => !n.startsWith("Only ")), [], c.id);
    for (const n of [...batch.names, ...draws(c.id, 1700, {}, 5000)]) {
      assert.ok(!n.text.includes("[") && !n.text.includes("{"), `${c.id}: ${n.text}`);
      assert.ok(/^\p{Lu}/u.test(n.text), `${c.id}: ${n.text}`);
      assert.ok(!hasSpaceBlock(n.text), `${c.id}: ${n.text}`);
      assert.ok(n.scale, c.id);
    }
  }
});

test("§12.4: no biome swaps in space - an earthly biome changes nothing, and says so", () => {
  for (const c of WORLD_CULTURES) {
    const plain = generateWorldPlaceNames({ culture: c.id, era: INTERSTELLAR_ERA, count: 60, seed: 5 });
    const swapped = generateWorldPlaceNames({ culture: c.id, era: INTERSTELLAR_ERA, biome: findBiome("desert"), terrain: "mountains", count: 60, seed: 5 });
    assert.deepEqual(swapped.names, plain.names, c.id);
    assert.ok(swapped.notices.includes("The Interstellar era is set in space."), c.id);
  }
});

test("§12.3: a chosen space biome and terrain fix every {@land} word to that terrain's short words", () => {
  for (const biome of SPACE_BIOMES) {
    for (const terrain of biome.customTerrains!) {
      const allowed = new Set(biome.short.land[terrain.id].flatMap(([w]) => [w.toLowerCase(), pluralOf(w.toLowerCase())]));
      let seen = 0;
      for (const culture of ["anglo-saxon", "japanese", "norse"]) {
        const names = generateWorldPlaceNames({ culture, era: INTERSTELLAR_ERA, biome, terrain: terrain.id, count: 150, seed: 3 }).names;
        for (const n of names) {
          assert.equal(n.scale, biome.scale);
          for (const m of n.etymology.matchAll(/\[space feature: ([^\]]+)\]/g)) {
            seen++;
            assert.ok(allowed.has(m[1].toLowerCase()), `${biome.id}/${terrain.id}: ${m[1]} in ${n.text}`);
          }
        }
      }
      assert.ok(seen > 0, `${biome.id}/${terrain.id}`);
    }
  }
});

test("§12.3: all of space draws scales at 20/25/20/20/15 within ±3 points", () => {
  const batch = draws("chinese", 4000, {}, 100);
  const share = (s: string) => (batch.filter((n) => n.scale === s).length / batch.length) * 100;
  const expected: Record<string, number> = { Pl: 20, Sy: 25, Nb: 20, Se: 20, Ga: 15 };
  for (const [s, e] of Object.entries(expected)) assert.ok(Math.abs(share(s) - e) <= 3, `${s}: ${share(s).toFixed(1)}`);
});

test("§12.5: a space slot outside the Interstellar era renders its key with a notice", () => {
  const norse = findCulture("norse");
  norse.eras.push({ id: "temp", label: "Temp", templates: [["{@land}", 1]] });
  try {
    const batch = generateWorldPlaceNames({ culture: "norse", era: "temp", count: 3, seed: 1 });
    assert.equal(batch.names[0].text, "[@land]");
    assert.ok(batch.notices.some((n) => n.includes("only used in the Interstellar era")));
  } finally {
    norse.eras.pop();
  }
  assert.deepEqual(parseTemplate("{@land:pl}")[0], { kind: "slot", key: "land", form: "pl", markov: false, space: true });
});

test("§15.5: pinned examples - Anglo-Saxon fuses; Roman counts Lagrange points First to Fifth at planetary scale", () => {
  const anglo = draws("anglo-saxon", 800, {}, 12);
  assert.ok(anglo.some((n) => n.template === "{spec}+{@land}" && /^\p{Lu}\p{Ll}+$/u.test(n.text)), "a fused compound");
  const roman = draws("roman", 3000, {}, 14);
  const points = roman.filter((n) => n.template === "At the {@ordinal} Point");
  assert.ok(points.length > 50);
  for (const n of points.filter((x) => x.scale === "Pl")) assert.match(n.text, /^At the (First|Second|Third|Fourth|Fifth) Point$/);
  assert.ok(points.some((n) => /Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth/.test(n.text)), "larger scales go to Twelfth");
});
