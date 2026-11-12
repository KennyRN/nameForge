// Wizard retirement brief §5.2, §6.2: a biome pack named like a built-in replaces it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BIOMES, BRITAIN, biomeCatalogue, SPACE_BIOMES } from "../src/biomes";
import { builtInForPackName, resolveBiomePacks } from "../src/biomePacks";
import { generatePlaceNames } from "../src/names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe } from "../src/names/recipe";
import { generateTribalNames, TRIBAL_TRADITIONS } from "../src/tribes/engine";
import { generateWatersNames } from "../src/waters/engine";
import { watersBiomeText } from "../src/waters/sentence";
import { resolveWildsBiome, wildsBiomes, WILDS_DATA } from "../src/wilds/engine";
import { wildsBiomeText } from "../src/wilds/sentence";

/** A biome pack note: every animal, bird and plant list reduced to one made-up word, so it shows where it is used. */
const note = (name: string, basedOn: string, word = "Quokka") =>
  `---\ntype: biome\npackName: ${name}\nbased-on: "${basedOn}"\n---\n\n## Wild animals\n- ${word}\n\n## Birds\n- ${word}bird\n\n## Trees\n- ${word}tree\n\n## Plants\n- ${word}plant\n\n## Fish and other creatures\n- ${word}fish\n`;

const resolve = (files: Record<string, string>) => resolveBiomePacks(Object.entries(files).map(([path, content]) => ({ path, content })));

test("override: a pack's name matches a built-in's label or id, ignoring case, spaces and .md", () => {
  for (const [name, id] of [
    ["Temperate", "temperate"], ["temperate", "temperate"], ["  TEMPERATE ", "temperate"], ["temperate.md", "temperate"],
    ["Northern forest and tundra", "boreal"], ["boreal", "boreal"], ["Britain", "britain"], ["British", "britain"], ["britain", "britain"],
    ["Sector", "sector"], ["Tropical archipelago", "tropical-islands"],
  ] as const) assert.equal(builtInForPackName(name)?.id, id, name);
  for (const name of ["", "Temperate woodland", "Salt Marshes", "Temp"]) assert.equal(builtInForPackName(name), undefined, name);
});

test("override: it takes the built-in's id, label and place, and is the one in the catalogue", () => {
  const { biomes, problems } = resolve({ "Names/Temperate.md": note("Temperate", "temperate"), "Names/Salt Marshes.md": note("Salt Marshes", "desert") });
  assert.deepEqual(problems, []);
  const mine = biomes.find((b) => b.custom?.overrides);
  assert.ok(mine);
  assert.equal(mine.id, "temperate");
  assert.equal(mine.label, "Temperate");
  assert.equal(mine.custom!.path, "Names/Temperate.md");
  const catalogue = biomeCatalogue(biomes);
  assert.equal(catalogue.all[1], mine, "first of the 12, where temperate is");
  assert.equal(catalogue.all.length, 14, "plus the other pack");
  assert.equal(catalogue.all[13].label, "Salt Marshes");
  assert.deepEqual(catalogue.find("temperate")!.birds, [["Quokkabird", 1]]);
  assert.deepEqual(biomeCatalogue([]).find("temperate")!.birds, BIOMES[0].birds, "without it, the built-in");
});

test("override: based on the built-in it replaces, the base is the real built-in, not the pack itself", () => {
  for (const basedOn of ["temperate", "[[Temperate]]"]) {
    const { biomes, problems } = resolve({ "Names/Temperate.md": `---\ntype: biome\npackName: Temperate\nbased-on: "${basedOn}"\n---\n\n## Birds\n- Bluebird\n` });
    assert.deepEqual(problems, [], basedOn);
    const mine = biomes[0];
    assert.equal(mine.custom!.base, "temperate", basedOn);
    // What it doesn't change comes from the real built-in.
    assert.deepEqual(mine.trees, BIOMES[0].trees, basedOn);
    assert.deepEqual(mine.birds, [["Bluebird", 1]], basedOn);
    assert.equal(biomeCatalogue(biomes).rootOf(mine), "temperate");
  }
});

test("override: another pack based on the overridden built-in's name is based on the override", () => {
  const { biomes } = resolve({ "Names/Temperate.md": note("Temperate", "temperate"), "Names/Cold.md": `---\ntype: biome\npackName: Cold\nbased-on: "[[Temperate]]"\n---\n\n## Trees\n- Pine\n` });
  const cold = biomes.find((b) => b.label === "Cold")!;
  assert.deepEqual(cold.birds, [["Quokkabird", 1]]);
  assert.equal(biomeCatalogue(biomes).rootOf(cold), "temperate");
});

test("override: two packs claiming one built-in: the first by path wins, the other is listed under its own name", () => {
  const { biomes, problems } = resolve({ "B/temperate.md": note("temperate", "temperate", "Second"), "A/Temperate.md": note("Temperate", "temperate", "First") });
  const catalogue = biomeCatalogue(biomes);
  assert.deepEqual(catalogue.find("temperate")!.birds, [["Firstbird", 1]]);
  const other = catalogue.all.find((b) => b.custom?.path === "B/temperate.md")!;
  assert.ok(other && !other.custom!.overrides);
  assert.equal(other.id, "pack:B/temperate.md");
  assert.equal(problems.length, 1);
  assert.match(problems[0], /also claims the built-in Temperate biome; “A\/Temperate.md” is used/);
});

test("override: renaming or removing the pack brings the built-in back", () => {
  const files = { "Names/Temperate.md": note("Temperate", "temperate") };
  assert.equal(biomeCatalogue(resolve(files).biomes).find("temperate")!.custom?.overrides, "temperate");
  assert.equal(biomeCatalogue(resolve({ "Names/Warm.md": files["Names/Temperate.md"].replace("packName: Temperate", "packName: Warm") }).biomes).find("temperate"), BIOMES[0]);
  assert.equal(biomeCatalogue(resolve({}).biomes).find("temperate"), BIOMES[0]);
});

test("override: Britain and a space biome can be replaced too", () => {
  const { biomes } = resolve({ "N/British.md": note("British", "britain"), "N/Sector.md": note("Sector", "sector") });
  const catalogue = biomeCatalogue(biomes);
  assert.equal(catalogue.all[0].custom?.overrides, "britain");
  assert.equal(catalogue.space.find((b) => b.id === "sector")?.custom?.overrides, "sector");
  assert.ok(SPACE_BIOMES.length === catalogue.space.length && !catalogue.all.some((b) => b.id === "sector"));
});

// ── Saved ids ──────────────────────────────────────────────────────────────

test("saved ids: a state naming the built-in's id picks up its override; a pack's path or pack: id keeps working", () => {
  const { biomes } = resolve({ "Names/Temperate.md": note("Temperate", "temperate"), "Names/Salt Marshes.md": note("Salt Marshes", "savannah") });
  const catalogue = biomeCatalogue(biomes);
  const temperate = catalogue.find("temperate")!;
  assert.equal(temperate.custom?.overrides, "temperate");
  // The override by its path or its old pack: id, and the ordinary pack the same ways.
  assert.equal(catalogue.find("Names/Temperate.md"), temperate);
  assert.equal(catalogue.find("pack:Names/Temperate.md"), temperate);
  const marshes = catalogue.find("Names/Salt Marshes.md")!;
  assert.equal(marshes.label, "Salt Marshes");
  assert.equal(catalogue.find("pack:Names/Salt Marshes.md"), marshes);
  assert.equal(catalogue.find(marshes.id), marshes);
  // Menus and states read the same.
  assert.equal(watersBiomeText("temperate", catalogue), `in ${temperate.phrase}`);
  assert.equal(watersBiomeText("Names/Salt Marshes.md", catalogue), `in ${marshes.phrase}`);
  // A wild lands module offers the pack where it offers its root (savannah), and reads a saved path the same way.
  for (const module of ["desertNames", "mountainNames", "forestNames", "moorNames", "wetlandNames", "grasslandNames"] as const) {
    const offered = WILDS_DATA.modules[module].biomes.includes("savannah");
    assert.equal(wildsBiomeText(module, "Names/Salt Marshes.md", catalogue), offered ? `in ${marshes.phrase}` : "in any land", module);
  }
});

// ── Used wherever the built-in is ──────────────────────────────────────────

test("used everywhere: a recipe or state naming the built-in draws from the override", () => {
  const { biomes } = resolve({ "Names/Desert.md": note("Desert", "desert") });
  const catalogue = biomeCatalogue(biomes);
  const text = (cat?: typeof catalogue) =>
    generatePlaceNames({ recipe: colonialPlaceNamesRecipe("new-land", undefined, undefined, "desert"), slots: {}, count: 400, seed: 5, catalogue: cat }).names.map((n) => n.text).join(" ");
  assert.match(text(catalogue), /Quokka/);
  assert.doesNotMatch(text(), /Quokka/);
});

test("used everywhere: a tradition's home biome is the override", () => {
  const { biomes } = resolve({ "Names/Temperate.md": note("Temperate", "temperate") });
  const catalogue = biomeCatalogue(biomes);
  const tradition = TRIBAL_TRADITIONS.find((t) => (t.homeland.temperate ?? 0) >= 80)!;
  const names = (cat?: typeof catalogue) => generateTribalNames({ tradition: tradition.id, count: 300, seed: 9, catalogue: cat }).names.map((n) => n.name).join(" ");
  assert.match(names(catalogue), /Quokka/);
  assert.doesNotMatch(names(), /Quokka/);
});

test("used everywhere: a wild lands module's default is the override", () => {
  const { biomes } = resolve({ "Names/Desert.md": note("Desert", "desert") });
  const catalogue = biomeCatalogue(biomes);
  assert.equal(WILDS_DATA.modules.desertNames.defaultBiome, "desert");
  const resolved = resolveWildsBiome("desertNames", "general", "new", undefined, catalogue);
  assert.equal(resolved.biome.custom?.overrides, "desert");
  assert.equal(resolveWildsBiome("desertNames", "general", "new", undefined).biome.custom, undefined);
  assert.ok(wildsBiomes("desertNames", catalogue).some((b) => b.custom?.overrides === "desert"));
});

test("used everywhere: seas and coasts at the built-in's id use its tags; a pack uses its root's", () => {
  const { biomes } = resolve({ "Names/Desert.md": note("Desert", "desert"), "Names/Dunes.md": note("Dunes", "desert") });
  const catalogue = biomeCatalogue(biomes);
  const run = (biome: string, cat?: typeof catalogue) => generateWatersNames({ module: "seasLakes", culture: "general", where: "new", biome, count: 30, seed: 4, catalogue: cat }).names.map((n) => n.text);
  // The built-in's tags apply to the override and to a pack rooted in it, so all three agree.
  assert.deepEqual(run("desert", catalogue), run("desert"));
  assert.deepEqual(run("Names/Dunes.md", catalogue), run("desert"));
});

test("used everywhere: with Britain replaced, British place names set in Britain use it", () => {
  const { biomes } = resolve({ "N/British.md": note("British", "britain") });
  const catalogue = biomeCatalogue(biomes);
  const text = (cat?: typeof catalogue) => generatePlaceNames({ recipe: britishPlaceNamesRecipe(undefined), slots: {}, count: 500, seed: 2, catalogue: cat }).names.map((n) => n.text).join(" ");
  assert.match(text(catalogue), /Quokka/);
  assert.doesNotMatch(text(), /Quokka/);
  assert.ok(BRITAIN.id === "britain");
});
