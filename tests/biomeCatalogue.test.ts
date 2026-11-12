// Wizard retirement brief §5.1: the one biome catalogue.
import { test } from "node:test";
import assert from "node:assert/strict";
import { type Biome, BIOMES, BRITAIN, BUILT_IN_BIOMES, biomeCatalogue, findBiome, SPACE_BIOMES } from "../src/biomes";
import { applyBiomePack, parseBiomePackContent } from "../src/biomePacks";

/** A biome pack made the way the host does: parsed, then applied onto its base. */
function pack(path: string, base: Biome, name: string, overrides?: string): Biome {
  const file = parseBiomePackContent(`---\ntype: biome\nbased-on: ${base.id}\n---\n\n## Birds\n- Bluebird\n`, name);
  const biome = applyBiomePack(base, { ...file, packName: name }, path).biome;
  return overrides ? { ...biome, id: overrides, custom: { ...biome.custom!, overrides } } : biome;
}

test("catalogue: with no packs it is exactly the built-ins", () => {
  const catalogue = biomeCatalogue([]);
  assert.deepEqual(catalogue.all, [BRITAIN, ...BIOMES]);
  assert.deepEqual(catalogue.space, [...SPACE_BIOMES]);
  assert.equal(catalogue.find("temperate"), BIOMES[0]);
  assert.equal(catalogue.find("britain"), BRITAIN);
  assert.equal(catalogue.find("sector"), SPACE_BIOMES.find((b) => b.id === "sector"));
  assert.equal(catalogue.find(undefined), undefined);
  assert.equal(catalogue.find("nowhere"), undefined);
  assert.deepEqual(BUILT_IN_BIOMES.all, catalogue.all);
  assert.equal(findBiome("desert"), BIOMES.find((b) => b.id === "desert"));
});

test("catalogue: packs come after the built-ins, A–Z, and are found by path", () => {
  const zed = pack("Names/Zed.md", BIOMES[0], "Zed");
  const ash = pack("Names/Ash.md", BIOMES[1], "Ash");
  const catalogue = biomeCatalogue([zed, ash]);
  assert.deepEqual(catalogue.all.slice(0, 13), [BRITAIN, ...BIOMES]);
  assert.deepEqual(catalogue.all.slice(13).map((b) => b.label), ["Ash", "Zed"]);
  assert.equal(catalogue.find("Names/Ash.md"), ash);
  assert.equal(catalogue.find("pack:Names/Zed.md"), zed);
  assert.equal(findBiome("pack:Names/Zed.md", [zed]), zed);
});

test("catalogue: an override takes the built-in's id and place, and its label", () => {
  const mine = pack("Names/Temperate.md", BIOMES[0], "Temperate", "temperate");
  const other = pack("Names/Aardvark.md", BIOMES[0], "Aardvark");
  const catalogue = biomeCatalogue([other, mine]);
  assert.equal(catalogue.all[1], mine, "in place, first after Britain");
  assert.equal(catalogue.all.length, 14, "not listed a second time");
  assert.equal(catalogue.all[13], other);
  assert.equal(catalogue.find("temperate"), mine);
  assert.equal(catalogue.find("Names/Temperate.md"), mine);
  assert.equal(mine.id, "temperate");
  assert.deepEqual(mine.birds, [["Bluebird", 1]]);
});

test("catalogue: Britain and the space biomes can be overridden in place", () => {
  const britain = pack("Names/British.md", BRITAIN, "British", "britain");
  const sector = pack("Names/Sector.md", SPACE_BIOMES.find((b) => b.id === "sector")!, "Sector", "sector");
  const catalogue = biomeCatalogue([britain, sector]);
  assert.equal(catalogue.all[0], britain);
  assert.equal(catalogue.find("britain"), britain);
  assert.equal(catalogue.space.find((b) => b.id === "sector"), sector);
  assert.equal(catalogue.space.indexOf(sector), SPACE_BIOMES.findIndex((b) => b.id === "sector"));
  assert.ok(!catalogue.all.includes(sector), "space biomes stay out of the general list");
  assert.equal(catalogue.find("sector"), sector);
});

test("catalogue: two overrides of one built-in leave the first listed; the other is an ordinary pack", () => {
  const first = pack("A/Temperate.md", BIOMES[0], "Temperate", "temperate");
  const second = pack("B/Temperate.md", BIOMES[0], "Temperate");
  assert.equal(biomeCatalogue([first, second]).find("temperate"), first);
  assert.ok(biomeCatalogue([first, second]).all.includes(second));
});

test("catalogue: rootOf follows the base chain to a built-in", () => {
  const desert = BIOMES.find((b) => b.id === "desert")!;
  const a = pack("Names/A.md", desert, "A");
  const b = pack("Names/B.md", a, "B");
  const catalogue = biomeCatalogue([a, b]);
  assert.equal(catalogue.rootOf(desert), "desert");
  assert.equal(catalogue.rootOf(a), "desert");
  assert.equal(catalogue.rootOf(b), "desert");
  assert.equal(catalogue.rootOf(BRITAIN), "britain");
  // An override of its own base is rooted at that built-in.
  const mine = pack("Names/Desert.md", desert, "Desert", "desert");
  assert.equal(biomeCatalogue([mine]).rootOf(mine), "desert");
});

test("catalogue: it is pure — building one never changes another or the built-ins", () => {
  const mine = pack("Names/Temperate.md", BIOMES[0], "Temperate", "temperate");
  biomeCatalogue([mine]);
  assert.equal(biomeCatalogue([]).find("temperate"), BIOMES[0]);
  assert.equal(BUILT_IN_BIOMES.find("temperate"), BIOMES[0]);
});

// ── The lists the catalogue feeds (§5.1) ───────────────────────────────────

import { biomeChoices, spaceBiomeChoices } from "../src/colonialSentence";
import { wildsBiomes } from "../src/wilds/engine";
import { watersBiomeText, watersSentence, defaultWatersState } from "../src/waters/sentence";
import { defaultWildsState, wildsSentence } from "../src/wilds/sentence";

test("lists: a biome pack shows in the colonial biome choices; without packs they are the built-ins", () => {
  const desert = BIOMES.find((b) => b.id === "desert")!;
  const salt = pack("Names/Salt Marshes.md", desert, "Salt Marshes");
  const withPack = biomeChoices("new-land", biomeCatalogue([salt]));
  assert.deepEqual(withPack.slice(0, -1), biomeChoices("new-land"));
  assert.deepEqual(withPack[withPack.length - 1], { id: "Names/Salt Marshes.md", label: salt.phrase });
  assert.deepEqual(spaceBiomeChoices(), SPACE_BIOMES.map((b) => ({ id: b.id, label: b.phrase, title: b.guide })));
});

test("lists: a pack shows in a wild lands module when its root built-in does", () => {
  const desert = BIOMES.find((b) => b.id === "desert")!;
  const dunes = pack("Names/Dunes.md", desert, "Dunes");
  const catalogue = biomeCatalogue([dunes]);
  for (const module of ["desertNames", "mountainNames", "forestNames", "moorNames", "wetlandNames", "grasslandNames"] as const) {
    const plain = wildsBiomes(module).map((b) => b.id);
    const shown = wildsBiomes(module, catalogue).map((b) => b.id);
    assert.deepEqual(shown.filter((id) => id !== dunes.id), plain, module);
    assert.equal(shown.includes(dunes.id), plain.includes("desert"), `${module}: the pack follows its root`);
  }
  // The menu offers it by its path, and a state naming the path reads back.
  const segments = wildsSentence({ ...defaultWildsState("desertNames"), biome: "Names/Dunes.md" }, "desertNames", catalogue);
  const link = segments.find((s) => typeof s === "object" && s.field === "biome") as { text: string; choices: { id: string | undefined }[] };
  assert.equal(link.text, `in ${dunes.phrase}`);
  assert.ok(link.choices.some((c) => c.id === "Names/Dunes.md"));
});

test("lists: a pack shows in seas and coasts and reads back by its path", () => {
  const savannah = BIOMES.find((b) => b.id === "savannah")!;
  const grass = pack("Names/Long Grass.md", savannah, "Long Grass");
  const catalogue = biomeCatalogue([grass]);
  assert.equal(watersBiomeText("Names/Long Grass.md", catalogue), `in ${grass.phrase}`);
  assert.equal(watersBiomeText("Names/Long Grass.md"), "in any land", "not without the pack");
  const segments = watersSentence({ ...defaultWatersState("seasLakes"), culture: "general", where: "new" }, "seasLakes", catalogue);
  const link = segments.find((s) => typeof s === "object" && s.field === "biome") as { choices: { id: string | undefined }[] } | undefined;
  assert.ok(link?.choices.some((c) => c.id === "Names/Long Grass.md"));
});

// ── No packs: nothing changes ──────────────────────────────────────────────

import { generatePlaceNames } from "../src/names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe } from "../src/names/recipe";
import { generateRealmNames } from "../src/realms/engine";
import { generateRiverNames } from "../src/rivers/engine";
import { generateTribalNames } from "../src/tribes/engine";
import { generateVesselNames } from "../src/vessels/engine";
import { generateTimeSkyNames } from "../src/timesky/engine";
import { generateWatersNames } from "../src/waters/engine";
import { generateWildsNames } from "../src/wilds/engine";
import { generateWorldPlaceNames } from "../src/world/engine";
import { generateSettlementNames } from "../src/settlement/names";

test("no packs: every engine gives the same names with the built-ins catalogue as with none", () => {
  const catalogue = biomeCatalogue([]);
  const names = (r: { names: ({ text: string } | { name: string })[] }) => r.names.map((n) => ("text" in n ? n.text : n.name));
  const pairs: [string, (c?: typeof catalogue) => string[]][] = [
    ["british", (c) => names(generatePlaceNames({ recipe: britishPlaceNamesRecipe("NTH", "desert", "hills"), slots: {}, count: 20, seed: 3, catalogue: c }))],
    ["colonial", (c) => names(generatePlaceNames({ recipe: colonialPlaceNamesRecipe("new-land", undefined, undefined, "savannah"), slots: {}, count: 20, seed: 3, catalogue: c }))],
    ["world", (c) => names(generateWorldPlaceNames({ culture: "norse", terrain: "coast", count: 20, seed: 3, catalogue: c }))],
    ["tribal", (c) => names(generateTribalNames({ tradition: "bantu", count: 20, seed: 3, catalogue: c }))],
    ["realms", (c) => names(generateRealmNames({ culture: "norse", count: 20, seed: 3, catalogue: c }))],
    ["rivers", (c) => names(generateRiverNames({ setting: "new-land", biome: "desert", count: 20, seed: 3, catalogue: c }))],
    ["waters", (c) => names(generateWatersNames({ module: "seasLakes", culture: "general", where: "new", biome: "desert", count: 20, seed: 3, catalogue: c }))],
    ["wilds", (c) => names(generateWildsNames({ module: "desertNames", culture: "general", where: "new", count: 20, seed: 3, catalogue: c }))],
    ["time", (c) => names(generateTimeSkyNames({ culture: "norse", count: 20, seed: 3, catalogue: c }))],
    ["vessels", (c) => names(generateVesselNames({ module: "aircraft", culture: "general", count: 20, seed: 3, catalogue: c }))],
    ["settlement", (c) => names(generateSettlementNames({ setting: "new-lands", size: "any", count: 20, seed: 3, catalogue: c }))],
  ];
  for (const [label, run] of pairs) assert.deepEqual(run(catalogue), run(), label);
});
