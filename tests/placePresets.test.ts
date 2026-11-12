// Wizard retirement brief §4, §6.2: the native place names, exploration and expansion presets
// round-trip (save → parse → same state) and run with the same output as their module.
import { test } from "node:test";
import assert from "node:assert/strict";
import { TFile } from "obsidian";
import { generatePlaceNames } from "../src/names/engine";
import {
  type BritishPlaceState,
  britishPresetOf,
  britishRecipe,
  colonialRecipe,
  type ColonialPlaceState,
  colonialPresetOf,
  colonialPresetState,
  generateBritishPlace,
  generateColonialPlace,
  generateWorldPlace,
  nativePresetState,
  type WorldPlaceState,
  worldPresetOf,
} from "../src/names/placeRun";
import { chooseNames, chooseSlotSource, freshSlotSources, slotChoiceId } from "../src/names/slotSentence";
import { createNamesFileContent } from "../src/nameParser";
import { isModulePresetContent, modulePresetContent, parseModulePreset } from "../src/presets";
import { RecipeHost } from "../src/recipeHost";
import { findBiome } from "../src/biomes";
import { COLONIAL_TRADITIONS, colonialContexts, isTraditionAvailable } from "../src/colonialShapes";

const RUN = { count: 25, seed: 7, faithfulness: 2, strictness: 3 };
const meta = (packName: string, biome = "") => ({ packName, description: "A sentence.", biome });
const texts = (r: { names: { text: string }[] }) => r.names.map((n) => n.text);

const perSlot = (part: "organic" | "new-land" | "established", picks: Record<string, string>) =>
  Object.entries(picks).reduce((s, [id, choice]) => chooseSlotSource(s, part, id, choice), chooseNames(freshSlotSources(), "perSlot"));

/** A pack made of fixed names, standing in for a resolved slot source. */
const slotsFor = async (part: "organic" | "new-land" | "established", state: BritishPlaceState | ColonialPlaceState, recipe: Parameters<RecipeHost["resolveSlotSources"]>[0], files: Record<string, string> = {}) => {
  const byName = new Map<string, TFile>();
  for (const [path, content] of Object.entries(files)) {
    const file = new TFile(path) as TFile & { basename: string };
    file.content = content;
    file.basename = path.split("/").pop()!.replace(/\.md$/, "");
    byName.set(file.basename, file);
  }
  const app = { vault: { cachedRead: async (f: TFile) => f.content }, metadataCache: { getFirstLinkpathDest: (n: string) => byName.get(n) ?? null } } as never;
  const host = new RecipeHost(app, {}, []);
  const slots = await host.resolveSlotSources(recipe, part, state.sources, "Names/");
  return { slots, notices: host.getNotices() };
};

const PACK = createNamesFileContent("Anglo-Saxon", ["Alfred", "Beowulf", "Cuthbert", "Dunstan", "Edmund", "Godwin", "Harold", "Oswald"], "listPack");

// ── Native place names ─────────────────────────────────────────────────────

test("native place names preset: British round-trips with region, land and slot sources", async () => {
  const state: BritishPlaceState = {
    region: "NTH",
    land: { biome: "desert", terrain: "hills" },
    sources: perSlot("organic", { "personal-name": "pack:Anglo-Saxon", "folk-group": "tribal" }),
  };
  const content = modulePresetContent(britishPresetOf(state, meta("British north", "desert")));
  assert.ok(isModulePresetContent(content));
  const parsed = parseModulePreset(content, "x");
  assert.deepEqual(parsed.problems, []);
  assert.ok(parsed.nativePlace);
  const back = nativePresetState(parsed.nativePlace!);
  assert.deepEqual("british" in back && back.british, state);

  // Same state, same seed: the same names as the module gives.
  const files = { "Names/Anglo-Saxon.md": PACK };
  const biome = findBiome("desert");
  const own = await slotsFor("organic", state, britishRecipe(state, biome), files);
  const restored = (back as { british: BritishPlaceState }).british;
  const own2 = await slotsFor("organic", restored, britishRecipe(restored, biome), files);
  assert.deepEqual(texts(generateBritishPlace(restored, biome, own2.slots, RUN)), texts(generateBritishPlace(state, biome, own.slots, RUN)));
  assert.ok(texts(generateBritishPlace(state, biome, own.slots, RUN)).join(" ").match(/Alfred|Beowulf|Cuthbert|Dunstan|Edmund|Godwin|Harold|Oswald/), "the pack's names appear");
});

test("native place names preset: the note holds the closing choice, land and each slot by name", () => {
  const state: BritishPlaceState = { region: undefined, land: { biome: undefined, terrain: "any" }, sources: perSlot("organic", { "personal-name": "pack:Anglo-Saxon", deity: "list:Holy words" }) };
  const content = modulePresetContent(britishPresetOf(state, meta("British", "")));
  assert.match(content, /^module: native-place-names$/m);
  assert.match(content, /^culture: britain$/m);
  assert.match(content, /^region: all$/m);
  assert.match(content, /^placeNames: perSlot$/m);
  assert.match(content, /^slot-personal-name: "pack:Anglo-Saxon"$/m);
  assert.match(content, /^slot-deity: "list:Holy words"$/m);
  assert.doesNotMatch(content, /slot-folk-group/);
});

test("native place names preset: placeholders save as placeholders, with no slot lines", () => {
  const state: BritishPlaceState = { region: undefined, land: { biome: undefined, terrain: "any" }, sources: chooseNames(freshSlotSources(), "perSlot") };
  const content = modulePresetContent(britishPresetOf(state, meta("British")));
  assert.match(content, /^placeNames: perSlot$/m);
  assert.doesNotMatch(content, /slot-/);
  const back = nativePresetState(parseModulePreset(content, "x").nativePlace!);
  assert.deepEqual("british" in back && back.british, state);
});

test("native place names preset: a world culture round-trips with its era and land, and takes no slots", () => {
  const state: WorldPlaceState = { culture: "norse", era: "viking", land: { biome: "savannah", terrain: "coast" } };
  const preset = worldPresetOf(state, "viking", meta("Norse", "savannah"));
  const parsed = parseModulePreset(modulePresetContent(preset), "x");
  assert.deepEqual(parsed.problems, []);
  const back = nativePresetState(parsed.nativePlace!);
  assert.deepEqual("world" in back && back.world, state);
  const world = "world" in back ? back.world : state;
  assert.deepEqual(texts(generateWorldPlace(world, findBiome("savannah"), RUN)), texts(generateWorldPlace(state, findBiome("savannah"), RUN)));
  // Slot lines in a world culture's note are reported and ignored.
  const noisy = parseModulePreset(modulePresetContent(preset).replace("terrain:", "slot-personal-name: built-in\nterrain:"), "x");
  assert.equal(noisy.problems.length, 1);
  assert.deepEqual(noisy.nativePlace!.placeSlots, {});
});

// ── Exploration and expansion ──────────────────────────────────────────────

for (const [part, key] of [["2", "exploration"], ["2a", "expansion"]] as const) {
  const slotPart = part === "2" ? "new-land" : "established";
  test(`${key} preset: round-trips with tradition, context, land and slot sources, and runs like the module`, async () => {
    const tradition = COLONIAL_TRADITIONS.find((t) => t.id !== "general" && isTraditionAvailable(t.id, part))!.id;
    const context = colonialContexts(part)[1].id;
    const state: ColonialPlaceState = {
      tradition,
      context,
      aliens: false,
      land: { biome: "savannah", terrain: "any" },
      sources: perSlot(slotPart, { "native-people-or-tribe": "tribal", "explorer-or-founder": "pack:Anglo-Saxon" }),
    };
    const content = modulePresetContent(colonialPresetOf(part, state, context, meta("Preset", "savannah")));
    assert.match(content, new RegExp(`^module: ${key}-place-names$`, "m"));
    const parsed = parseModulePreset(content, "x");
    assert.deepEqual(parsed.problems, []);
    const preset = (part === "2" ? parsed.exploration : parsed.expansion)!;
    assert.ok(preset);
    assert.equal(part === "2" ? parsed.expansion : parsed.exploration, undefined);
    const back = colonialPresetState(preset);
    assert.deepEqual(back, state);

    const files = { "Names/Anglo-Saxon.md": PACK };
    const biome = findBiome("savannah");
    const run = async (s: ColonialPlaceState) => {
      const own = await slotsFor(slotPart, s, colonialRecipe(part, s, biome, undefined), files);
      return texts(generateColonialPlace(part, s, biome, undefined, own.slots, RUN));
    };
    assert.deepEqual(await run(back), await run(state));
    // And it is the module's own output: the engine called directly with the same recipe and slots.
    const own = await slotsFor(slotPart, state, colonialRecipe(part, state, biome, undefined), files);
    assert.deepEqual(texts(generatePlaceNames({ recipe: colonialRecipe(part, state, biome, undefined), slots: own.slots, ...RUN })), await run(state));
  });

  test(`${key} preset: defaults leave the note short and read back as General with the part's first context`, () => {
    const state: ColonialPlaceState = { tradition: undefined, context: undefined, aliens: false, land: { biome: undefined, terrain: "any" }, sources: freshSlotSources() };
    const content = modulePresetContent(colonialPresetOf(part, state, part === "2" ? "wild-and-unsettled" : "imposition", meta("Defaults")));
    assert.doesNotMatch(content, /slot-|aliens/);
    const back = colonialPresetState((part === "2" ? parseModulePreset(content, "x").exploration : parseModulePreset(content, "x").expansion)!);
    assert.equal(back.tradition, undefined);
    assert.equal(back.context, part === "2" ? "wild-and-unsettled" : "imposition");
    assert.equal(back.sources.names, "placeholders");
  });
}

test("place presets: aliens and a pack biome link round-trip", () => {
  const state: ColonialPlaceState = { tradition: undefined, context: "wild-and-unsettled", aliens: true, land: { biome: "[[Salt Marshes]]", terrain: "any" }, sources: freshSlotSources() };
  const content = modulePresetContent(colonialPresetOf("2", state, "wild-and-unsettled", meta("Alien", "[[Salt Marshes]]")));
  assert.match(content, /^biome: "\[\[Salt Marshes\]\]"$/m);
  assert.match(content, /^aliens: true$/m);
  const back = colonialPresetState(parseModulePreset(content, "x").exploration!);
  assert.deepEqual(back, state);
});

// ── Problems and missing sources ───────────────────────────────────────────

test("place presets: unknown values are reported and take their defaults", () => {
  const parsed = parseModulePreset(
    ["---", "type: module-preset", "module: exploration-place-names", "tradition: nowhere", "context: elsewhere", "biome: nothing", "terrain: Bad Terrain", "placeNames: sometimes", "slot-colour: built-in", "slot-explorer-or-founder: tribal", "---", "", "x", ""].join("\n"),
    "x",
  );
  assert.equal(parsed.problems.length, 7);
  const preset = parsed.exploration!;
  assert.equal(preset.tradition, "general");
  assert.equal(preset.biome, "");
  assert.equal(preset.placeNames, "placeholders");
  assert.deepEqual(preset.placeSlots, {});
});

test("place presets: a pack or list that's gone falls back to a placeholder with the notice", async () => {
  const state = { region: undefined, land: { biome: undefined, terrain: "any" }, sources: perSlot("organic", { "personal-name": "pack:Gone", deity: "list:Vanished" }) } as BritishPlaceState;
  const content = modulePresetContent(britishPresetOf(state, meta("Gone")));
  const back = nativePresetState(parseModulePreset(content, "x").nativePlace!);
  const restored = (back as { british: BritishPlaceState }).british;
  const own = await slotsFor("organic", restored, britishRecipe(restored, undefined));
  assert.deepEqual(own.slots["personal-name"], { kind: "placeholder" });
  assert.deepEqual(own.slots.deity, { kind: "placeholder" });
  assert.deepEqual(own.notices, ["Pack “Gone” wasn't found.", "Word list “Vanished” wasn't found."]);
  assert.equal(slotChoiceId(restored.sources.slots["personal-name"]), "pack:Gone");
});
