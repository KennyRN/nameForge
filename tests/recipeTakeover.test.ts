// Takeover in colonial recipes (recipe takeover brief §A7).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { type ColonialShape } from "../src/colonialShapes";
import { MarkovModel, mulberry32 } from "../src/markov";
import { type MixPackIndexEntry } from "../src/nameParser";
import {
  generatePlaceNames,
  type NameGenerateOptions,
  type NativeAdapter,
  NameRenderer,
  type ResolvedSlot,
} from "../src/names/engine";
import { mergeRecipe, readRecipe, recipeToFrontmatter, type RecipePartial, withDefaults } from "../src/names/recipe";
import { resolveRecipeTakeover, takeoverPackNotice } from "../src/takeover/recipe";

const pack = (file: string) =>
  readFileSync(`tests/fixtures/packs/${file}.txt`, "utf8").split("\n").map((l) => l.trim()).filter((l) => l);
const LATIN = pack("latin-towns");
const ENGLISH = pack("english-towns");
const NATIVE = pack("native-places");

const markovSlot = (names: string[]): ResolvedSlot => {
  const model = MarkovModel.build(names);
  return {
    kind: "sources",
    sources: [
      {
        weight: 1,
        draw: (_request, _mode, rng) =>
          model.generateDetailed({ count: 1, faithfulness: 2, strictness: 3, seed: Math.floor(rng() * 0x100000000) >>> 0 }).names[0] ?? null,
      },
    ],
  };
};
const colonialSlots = (): Record<string, ResolvedSlot> => ({
  "native-place-name": markovSlot(NATIVE),
  "native-people-or-tribe": markovSlot(NATIVE),
  "river-or-stream-name": markovSlot(NATIVE),
  "homeland-place-name": markovSlot(ENGLISH),
});

/** The real takeover adopter on the Latin test pack, prepared once. */
const latinEntry = { path: "Latin towns.md", parsed: { packName: "Latin towns" } } as unknown as MixPackIndexEntry;
const realAdopter = (): NativeAdapter => {
  const resolved = resolveRecipeTakeover({
    name: "Latin towns",
    entry: latinEntry,
    index: [latinEntry],
    targetReason: () => undefined,
    targetNames: () => ({ names: LATIN, corpus: LATIN, endings: [] }),
    faithfulness: 2,
  });
  assert.ok("adapt" in resolved);
  return resolved.adapt;
};

const run = (part: "new-land" | "established", seed: number, adapt?: NativeAdapter, count = 50) => {
  const options: NameGenerateOptions = {
    recipe: withDefaults({ shape: { part, tradition: part === "new-land" ? "english-speaking-settler" : "british-imperial" } }),
    slots: colonialSlots(),
    count,
    seed,
    adapt,
  };
  return generatePlaceNames(options);
};

const isAdapted = (etymology: string) => /, adapted: /.test(etymology);

// ── Batch behaviour ─────────────────────────────────────────────────────────

test("recipe takeover: the same seed and inputs give an identical batch", () => {
  const adapt = realAdopter();
  const a = run("new-land", 41, adapt, 25);
  const b = run("new-land", 41, adapt, 25);
  assert.deepEqual(
    a.names.map((n) => [n.text, n.etymology]),
    b.names.map((n) => [n.text, n.etymology]),
  );
});

test("recipe takeover: adapted slots take the adopted form; etymology keeps the native name", () => {
  const adapt = realAdopter();
  for (const part of ["new-land", "established"] as const) {
    const plain = run(part, 7);
    const taken = run(part, 7, adapt);
    const changed = plain.names.filter((n, i) => isAdapted(n.etymology) && taken.names[i].text !== n.text);
    assert.ok(changed.length > 0, `${part}: some adapted slot should change`);
    // Where the first native name adopted (no redraw), the etymology is the same native name as drawn.
    const sameEtymology = plain.names.filter((n, i) => isAdapted(n.etymology) && taken.names[i].etymology === n.etymology);
    assert.ok(sameEtymology.length > 0, `${part}: an adapted etymology should show the native name`);
  }
});

test("recipe takeover: isolation — only adapted slots change, shapes never do (stub adopter, no refills)", () => {
  // A stub that always succeeds and keeps names distinct, so no adoption fails and no duplicate refills occur.
  const adapt: NativeAdapter = (native) => `${native}ia`;
  for (const [part, seed] of [["new-land", 3], ["established", 4]] as const) {
    const plain = run(part, seed);
    const taken = run(part, seed, adapt);
    let adapted = 0;
    plain.names.forEach((n, i) => {
      assert.deepEqual(taken.names[i].shape, n.shape, "shapes are unchanged");
      if (isAdapted(n.etymology)) {
        adapted++;
        assert.equal(taken.names[i].etymology, n.etymology);
      } else {
        assert.equal(taken.names[i].text, n.text, `non-adapted name ${i} is unchanged`);
        assert.equal(taken.names[i].etymology, n.etymology);
      }
    });
    assert.ok(adapted > 0, `${part}: the seed should include adapted slots`);
  }
});

test("recipe takeover: adopted slots are identical to the no-takeover run", () => {
  const adapt: NativeAdapter = (native) => `${native}ia`;
  const plain = run("established", 11);
  const taken = run("established", 11, adapt);
  const adopted = plain.names.filter((n) => /, adopted: /.test(n.etymology));
  assert.ok(adopted.length > 0, "the seed should include adopted slots");
  plain.names.forEach((n, i) => {
    if (/, adopted: /.test(n.etymology) && !isAdapted(n.etymology)) assert.equal(taken.names[i].text, n.text);
  });
});

test("recipe takeover: organic recipes ignore the takeover pack", () => {
  const recipe = withDefaults({ shape: { part: "organic" }, takeover: "Latin towns" });
  const slots = { "personal-name": markovSlot(ENGLISH) };
  const adapt: NativeAdapter = () => {
    throw new Error("organic recipes never adapt");
  };
  const plain = generatePlaceNames({ recipe, slots, count: 25, seed: 5 });
  const taken = generatePlaceNames({ recipe, slots, count: 25, seed: 5, adapt });
  assert.deepEqual(taken, plain);
});

// ── One slot, rendered directly ─────────────────────────────────────────────

const nativeShape = (s: Partial<ColonialShape> = {}): ColonialShape => ({
  part: "2",
  groupId: "x",
  genericId: "town",
  categoryId: "native-place-name",
  structure: "bare-specific",
  wordOrder: "specific-first",
  treatments: { specific: "adapted" },
  ...s,
});

/** A native slot whose draws are counted, numbered and tagged with the stream they used. */
const countingSlot = (streams: { fill: () => number; redraw: () => number }) => {
  const calls: string[] = [];
  const slot: ResolvedSlot = {
    kind: "sources",
    sources: [
      {
        weight: 1,
        draw: (_request, _mode, rng) => {
          calls.push(rng === streams.fill ? "fill" : rng === streams.redraw ? "redraw" : "other");
          return `Native${calls.length}`;
        },
      },
    ],
  };
  return { slot, calls };
};

const renderOne = (shape: ColonialShape, adapt: NativeAdapter | undefined) => {
  let fillCalls = 0;
  const fillBase = mulberry32(1);
  const fill = () => {
    fillCalls++;
    return fillBase();
  };
  const redraw = mulberry32(2);
  const { slot, calls } = countingSlot({ fill, redraw });
  const renderer = new NameRenderer(
    withDefaults({ shape: { part: "new-land" } }),
    { "native-place-name": slot },
    undefined,
    adapt ? { adaptation: { adapt, seed: 99, redrawRng: redraw } } : {},
  );
  const name = renderer.renderColonial(shape, fill);
  return { name, calls, fillCalls };
};

test("recipe takeover: an adapted slot shows the adopted form and the native etymology", () => {
  const { name } = renderOne(nativeShape(), (native) => native.toUpperCase());
  assert.equal(name.text, "NATIVE1");
  assert.match(name.etymology, /native place name, adapted: Native1/);
});

test("recipe takeover: translated shapes and adopted treatments are not adapted", () => {
  const adapt: NativeAdapter = (native) => native.toUpperCase();
  assert.equal(renderOne(nativeShape({ translated: true }), adapt).name.text, "Native1");
  assert.equal(renderOne(nativeShape({ treatments: { specific: "adopted" } }), adapt).name.text, "Native1");
});

test("recipe takeover: a stub that always fails makes exactly 5 draws, then keeps the last native name", () => {
  const { name, calls } = renderOne(nativeShape(), () => null);
  assert.deepEqual(calls, ["fill", "redraw", "redraw", "redraw", "redraw"]);
  assert.equal(name.text, "Native5");
  assert.match(name.etymology, /adapted: Native5/);
});

test("recipe takeover: a stub that fails once redraws on the redraw stream, leaving the fill stream untouched", () => {
  let attempts = 0;
  const failOnce: NativeAdapter = (native) => (++attempts === 1 ? null : `${native}um`);
  const adapted = renderOne(nativeShape(), failOnce);
  const plain = renderOne(nativeShape(), undefined);
  assert.deepEqual(adapted.calls, ["fill", "redraw"]);
  assert.equal(adapted.name.text, "Native2um");
  assert.match(adapted.name.etymology, /adapted: Native2/);
  assert.equal(adapted.fillCalls, plain.fillCalls, "the fill stream is consumed exactly as without takeover");
});

test("recipe takeover: each adoption uses the adoption RNG, not the fill stream", () => {
  const seen: (() => number)[] = [];
  const { fillCalls } = renderOne(nativeShape(), (native, rng) => {
    seen.push(rng);
    rng();
    return native;
  });
  assert.equal(seen.length, 1);
  assert.equal(fillCalls, renderOne(nativeShape(), undefined).fillCalls);
});

// ── The recipe setting ──────────────────────────────────────────────────────

test("recipe takeover: a missing or ineligible pack gives the notice and no adopter", () => {
  const base = {
    name: "Latin towns",
    index: [latinEntry],
    targetNames: () => ({ names: LATIN, corpus: LATIN, endings: [] }),
    faithfulness: 2,
  };
  assert.deepEqual(resolveRecipeTakeover({ ...base, entry: undefined, targetReason: () => undefined }), {
    notice: "Takeover pack “Latin towns” can't be used: it wasn't found. Native names were left unchanged.",
  });
  assert.deepEqual(resolveRecipeTakeover({ ...base, entry: latinEntry, targetReason: () => "fewer than 30 names" }), {
    notice: takeoverPackNotice("Latin towns", "fewer than 30 names"),
  });
  assert.equal(
    takeoverPackNotice("Latin towns", "fewer than 30 names"),
    "Takeover pack “Latin towns” can't be used: fewer than 30 names. Native names were left unchanged.",
  );
});

test("recipe takeover: readRecipe → recipeToFrontmatter keeps takeover; mergeRecipe inherits it", () => {
  const { recipe, problems } = readRecipe({ type: "recipe", shape: { part: "new-land" }, takeover: "[[Latin towns|Latin]]" });
  assert.deepEqual(problems, []);
  assert.equal(recipe.takeover, "Latin towns");
  assert.equal(recipeToFrontmatter(recipe).takeover, "[[Latin towns]]");
  assert.equal(withDefaults(recipe).takeover, "Latin towns");

  const template: RecipePartial = { template: true, takeover: "Latin towns" };
  assert.equal(mergeRecipe({ templateOf: "Template" }, template).takeover, "Latin towns");
  assert.equal(mergeRecipe({ templateOf: "Template", takeover: "Greek towns" }, template).takeover, "Greek towns");

  // Unset stays unset: nothing is written and the defaults add nothing.
  assert.equal("takeover" in recipeToFrontmatter({ setting: "x" }), false);
  assert.equal("takeover" in withDefaults({}), false);
});
