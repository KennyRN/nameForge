// Wizard retirement brief §5.1, §5.2: every menu that lists biomes lists a pack that replaces
// "Temperate" once, in the built-in's place, and the lists the modal draws are built the same way.
import { test } from "node:test";
import assert from "node:assert/strict";
import { biomeCatalogue, BIOMES, BUILT_IN_BIOMES } from "../src/biomes";
import { landButtonBiomeItems, landClauseBiomeItems, startFromItems } from "../src/biomeMenus";
import { resolveBiomePacks } from "../src/biomePacks";
import { biomeChoices } from "../src/colonialSentence";
import { mulberry32 } from "../src/markov";
import { TRIBAL_PRESET_DEFAULTS, tribalPresetDraw, tribalPresetSlot } from "../src/presets";
import { DEFAULT_REALM_STATE, realmSentence } from "../src/realms/sentence";
import { DEFAULT_CALENDAR_STATE, DEFAULT_SKY_STATE, timeSentence } from "../src/timesky/calendarSentence";
import { tribalSentence } from "../src/tribes/sentence";
import { defaultWatersState, watersSentence } from "../src/waters/sentence";
import { WILDS_DATA, WILDS_MODULES } from "../src/wilds/engine";
import { defaultWildsState, wildsSentence } from "../src/wilds/sentence";

const pack = (name: string, extra = "") => `---\ntype: biome\npackName: ${name}\nbased-on: "temperate"\n---\n\n## Birds\n- Bluebird\n- Wren (2)\n${extra}`;
const resolve = (files: Record<string, string>) => resolveBiomePacks(Object.entries(files).map(([path, content]) => ({ path, content })));

// The pack the issue was found with: named "Temperate", based on temperate, no Phrase.
const { biomes } = resolve({ "Names/Temperate.md": pack("Temperate") });
const catalogue = biomeCatalogue(biomes);
const limits = { biomes: catalogue.all, findBiome: (id: string | undefined) => catalogue.find(id), spaceBiomes: catalogue.space };
const BUILT_IN_PHRASE = BIOMES[0].phrase;

type Choice = { id?: string; label: string };
const menuOf = (segments: unknown[]): Choice[] | undefined => (segments.find((s) => typeof s === "object" && (s as { field: string }).field === "biome") as { choices: Choice[] } | undefined)?.choices;
/** Entries that are, or read as, temperate. */
const temperate = (choices: Choice[]) => choices.filter((c) => c.id === "temperate" || /temperate/i.test(c.label));

test("the override is the built-in's own entry: its id, label and phrase", () => {
  const mine = catalogue.find("temperate")!;
  assert.equal(mine.custom?.overrides, "temperate");
  assert.equal(mine.label, "Temperate");
  assert.equal(mine.phrase, BUILT_IN_PHRASE, "with the Phrase left empty, the built-in's phrase");
  assert.equal(catalogue.all.filter((b) => b.id === "temperate").length, 1);
  assert.equal(catalogue.all.length, 13, "Britain and the 12, nothing added");
});

const LABEL_MENUS: [string, () => Choice[] | undefined][] = [
  ["tribes", () => menuOf(tribalSentence({ tradition: "general", terrain: "any", register: "plain", hostile: false } as never, limits as never))],
  ["realms (medieval)", () => menuOf(realmSentence({ ...DEFAULT_REALM_STATE, era: "medieval" } as never, limits as never))],
  ["realms (interstellar)", () => menuOf(realmSentence({ ...DEFAULT_REALM_STATE, era: "interstellar" } as never, limits as never))],
  ["calendars (medieval)", () => menuOf(timeSentence("calendar", { ...DEFAULT_CALENDAR_STATE, era: "MD" } as never, limits as never))],
  ["calendars (interstellar)", () => menuOf(timeSentence("calendar", { ...DEFAULT_CALENDAR_STATE, era: "IS" } as never, limits as never))],
  ["sky lore (medieval)", () => menuOf(timeSentence("sky", { ...DEFAULT_SKY_STATE, era: "MD" } as never, limits as never))],
  ["sky lore (interstellar)", () => menuOf(timeSentence("sky", { ...DEFAULT_SKY_STATE, era: "IS" } as never, limits as never))],
];
for (const [label, menu] of LABEL_MENUS) {
  test(`biome menu, ${label}: exactly one temperate entry, the built-in's, by its label`, () => {
    const entries = temperate(menu()!);
    assert.deepEqual(entries.map((c) => [c.id, c.label]), [["temperate", "Temperate"]]);
  });
}

for (const module of WILDS_MODULES) {
  test(`biome menu, wild lands ${module}: one temperate entry where the module offers it, by the built-in's phrase`, () => {
    const entries = temperate(menuOf(wildsSentence({ ...defaultWildsState(module), culture: "general", where: "new" }, module, catalogue))!);
    const offered = WILDS_DATA.modules[module].biomes.includes("temperate");
    assert.deepEqual(entries.map((c) => [c.id, c.label]), offered ? [["temperate", `in ${BUILT_IN_PHRASE}`]] : []);
  });
}

for (const module of ["seasLakes", "coastsIslands", "seaCharts"] as const) {
  test(`biome menu, seas and coasts ${module}: one temperate entry, by the built-in's phrase`, () => {
    const entries = temperate(menuOf(watersSentence({ ...defaultWatersState(module), culture: "general", where: "new" }, module, catalogue))!);
    assert.deepEqual(entries.map((c) => [c.id, c.label]), [["temperate", `in ${BUILT_IN_PHRASE}`]]);
  });
}

for (const part of ["organic", "new-land", "established"] as const) {
  test(`biome menu, colonial biome choices (${part}): one temperate entry, by the built-in's phrase`, () => {
    assert.deepEqual(temperate(biomeChoices(part, catalogue)).map((c) => [c.id, c.label]), [["temperate", BUILT_IN_PHRASE]]);
  });
}

for (const britainAsDefault of [true, false]) {
  test(`biome menu, the land clause (exploration, expansion, settlement names, native British; Britain default ${britainAsDefault}): one temperate entry, by the built-in's phrase, with its tooltip`, () => {
    const items = landClauseBiomeItems(catalogue, britainAsDefault);
    assert.deepEqual(temperate(items).map((c) => [c.id, c.label]), [["temperate", BUILT_IN_PHRASE]]);
    assert.equal(items.find((c) => c.id === "temperate")!.tip, "Your version: Temperate.md");
    assert.equal(items.some((c) => c.id === "britain"), !britainAsDefault);
    // Without the pack the same entry has no tooltip: the built-in.
    assert.equal(landClauseBiomeItems(BUILT_IN_BIOMES, britainAsDefault).find((c) => c.id === "temperate")!.tip, undefined);
  });
}

for (const britainIsDefault of [true, false]) {
  test(`biome menu, the Land button (Britain default ${britainIsDefault}): temperate once among the built-ins, not under Your biomes`, () => {
    const { builtIn, yours } = landButtonBiomeItems(catalogue, britainIsDefault);
    assert.deepEqual(temperate(builtIn).map((c) => [c.id, c.label]), [["temperate", "Temperate"]]);
    assert.equal(builtIn.find((c) => c.id === "temperate")!.tip, "Your version: Temperate.md");
    assert.deepEqual(yours, []);
    assert.equal(builtIn.some((c) => c.id === "britain"), !britainIsDefault);
  });
}

test("biome menu, Create Pack's Start from: the real built-in once, and the pack as 'your version'", () => {
  const items = startFromItems(biomes);
  assert.deepEqual(items.filter((c) => c.label === "Temperate").map((c) => c.id), ["temperate"], "one entry named Temperate: the real built-in");
  assert.deepEqual(items.filter((c) => /your version/.test(c.label)).map((c) => [c.id, c.label]), [["Names/Temperate.md", "Temperate (your version)"]]);
  assert.equal(new Set(items.map((c) => c.label)).size, items.length, "no two entries share a name");
});

test("two packs claiming Temperate: the first is the built-in's entry, the other is its own entry under its own name, once each", () => {
  const two = resolve({ "A/Temperate.md": pack("Temperate"), "B/Temperate.md": pack("temperate") });
  const cat = biomeCatalogue(two.biomes);
  assert.equal(cat.all.filter((b) => b.id === "temperate").length, 1);
  assert.equal(two.problems.length, 1);
  assert.equal(cat.all.length, 14);
  assert.equal(new Set(cat.all.map((b) => b.id)).size, 14, "every entry is a different biome");
});

test("with no pack nothing is added, tooltipped or renamed", () => {
  const plain = biomeCatalogue([]);
  assert.deepEqual(landClauseBiomeItems(plain, false).map((c) => c.label), [plain.all[0], ...plain.all.slice(1)].map((b) => b.phrase));
  assert.deepEqual(landButtonBiomeItems(plain, false).yours, []);
  assert.equal(startFromItems([]).length, 1 + 12 + 5);
});

// ── tribalPresetDraw ───────────────────────────────────────────────────────

test("tribalPresetDraw: a preset's built-in biome is read through the catalogue, so an override applies", () => {
  const loud = resolve({
    "Names/Temperate.md": pack("Temperate").replace("## Birds\n- Bluebird\n- Wren (2)\n", "## Wild animals\n- Quokka\n\n## Birds\n- Quokkabird\n\n## Trees\n- Quokkatree\n\n## Plants\n- Quokkaplant\n"),
  });
  const cat = biomeCatalogue(loud.biomes);
  const preset = { ...TRIBAL_PRESET_DEFAULTS, packName: "P", setting: "", description: "", tradition: "general", biome: "temperate" };
  const draws = (c?: typeof cat) => {
    const draw = tribalPresetDraw(preset, c);
    const rng = mulberry32(4);
    return Array.from({ length: 600 }, () => draw(rng)).join(" ");
  };
  assert.match(draws(cat), /Quokka/);
  assert.doesNotMatch(draws(), /Quokka/);
  assert.equal(draws(biomeCatalogue([])), draws(), "with no override, the same names");
  assert.deepEqual(tribalPresetSlot(preset, cat), tribalPresetSlot(preset), "the slot's fields don't change: the id stays the built-in's");
});
