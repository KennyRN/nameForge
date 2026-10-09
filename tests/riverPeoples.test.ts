// Peoples in river names and native rivers in recipes (Land brief §8, §13.5).
import { test } from "node:test";
import assert from "node:assert/strict";
import snapshots from "./fixtures/land-snapshots.json";
import { type ColonialShape } from "../src/colonialShapes";
import { mulberry32 } from "../src/markov";
import { NameRenderer, type ResolvedSlot } from "../src/names/engine";
import { colonialPlaceNamesRecipe } from "../src/names/recipe";
import { generateRiverNames, riverName } from "../src/rivers/engine";

const SNAP = snapshots as Record<string, unknown>;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The people names a pattern's [tribal name] or [native people] became. */
function peoplesIn(text: string, pattern: string): string[] | null {
  const parts = pattern.split(/(\[(?:tribal name|native people)\]|\{water\}|\[[^\]]+\])/);
  const re = parts
    .map((p) => (p === "[tribal name]" || p === "[native people]" ? "(.+?)" : p === "{water}" ? ".+?" : escape(p)))
    .join("");
  const m = new RegExp(`^${re}$`).exec(text);
  return m ? m.slice(1) : null;
}

test("river peoples: as placeholders, output matches the snapshots", () => {
  for (const setting of ["british", "new-land", "established"] as const) {
    for (const seed of [1, 2, 3]) {
      const names = generateRiverNames({ setting, peoples: "placeholder", count: 20, seed }).names;
      assert.deepEqual(JSON.parse(JSON.stringify(names)), SNAP[`river ${setting} ${seed}`], `${setting} ${seed}`);
    }
  }
});

test("river peoples: British rivers name their peoples from tribal names", () => {
  const rng = mulberry32(5);
  let filled = 0;
  for (let i = 0; i < 2000; i++) {
    const n = riverName({ setting: "british", peoples: "tribal" }, rng);
    assert.ok(!n.text.includes("[tribal name]"), n.text);
    if (n.kind === "pattern" && n.form?.includes("[tribal name]")) {
      const peoples = peoplesIn(n.text, n.form) ?? [];
      for (const p of peoples) {
        filled++;
        assert.ok(p.split(" ").length <= 2 && !/^The /.test(p), p);
      }
    }
  }
  assert.ok(filled > 0);
});

test("river peoples: New Land rivers in the savannah leave no native people placeholder", () => {
  const rng = mulberry32(6);
  for (let i = 0; i < 2000; i++) {
    const n = riverName({ setting: "new-land", biome: "savannah", peoples: "tribal" }, rng);
    assert.ok(!n.text.includes("[native people]"), n.text);
  }
});

test("river peoples: colonial recipes with a native pack name some rivers natively", () => {
  const native: ResolvedSlot = { kind: "sources", sources: [{ weight: 1, draw: (_r, _m, rng) => `Zz${Math.floor(rng() * 100000)}a` }] };
  const recipe = colonialPlaceNamesRecipe("new-land", undefined, undefined);
  recipe.native = "Native places";
  recipe.render.etymology = true;
  const shape: ColonialShape = {
    part: "2",
    groupId: "x",
    genericId: "town",
    categoryId: "river-or-stream-name",
    structure: "two-part-compound",
    wordOrder: "specific-first",
    treatments: { specific: "adapted" },
  };
  const run = (adapt?: (s: string) => string) => {
    const renderer = new NameRenderer(recipe, { "native-place-name": native }, undefined, {
      adaptation: adapt ? { adapt, seed: 1, redrawRng: mulberry32(2) } : undefined,
    });
    const rng = mulberry32(7);
    return Array.from({ length: 2000 }, () => renderer.renderColonial(shape, rng));
  };
  const names = run();
  const nativeShare = names.filter((n) => /Zz\d+a/.test(n.etymology)).length / names.length;
  assert.ok(nativeShare >= 0.3 && nativeShare <= 0.5, `${(nativeShare * 100).toFixed(1)}% native rivers`);
  const adapted = run((s) => `${s}q`);
  assert.ok(adapted.some((n) => /Zz\d+aq/.test(n.text)), "a takeover pack adapts a native river");
});
