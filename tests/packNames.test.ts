// Pack names and biome marks brief: every pack needs a real name, "nameForge" is reserved, no two
// notes share a name or a biome phrase, and every biome menu says whether a biome is the built-in,
// your version of it, or your own.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { biomeCatalogue, BIOMES, BUILT_IN_BIOMES } from "../src/biomes";
import { biomeClashes, biomeLinkTitle, landButtonBiomeItems, landClauseBiomeItems, YOUR_BIOMES } from "../src/biomeMenus";
import { resolveBiomePacks } from "../src/biomePacks";
import { biomeChoices } from "../src/colonialSentence";
import { clashMessage, folderNameProblems, nameClash, nameProblem, newNameProblem, NO_NAME_MESSAGE, type NoteName, packNameOfNote, phraseClashMessage, phraseProblem, RESERVED_MESSAGE } from "../src/noteNames";
import { DEFAULT_REALM_STATE, realmSentence } from "../src/realms/sentence";
import { DEFAULT_CALENDAR_STATE, DEFAULT_SKY_STATE, timeSentence } from "../src/timesky/calendarSentence";
import { tribalSentence } from "../src/tribes/sentence";
import { defaultWatersState, watersSentence } from "../src/waters/sentence";
import { WILDS_MODULES } from "../src/wilds/engine";
import { defaultWildsState, wildsSentence } from "../src/wilds/sentence";

// ── 1. Every pack needs a real name ────────────────────────────────────────

test("an empty name, 'nameForge' and ' NameForge ' are refused, whatever the save", () => {
  assert.equal(nameProblem(""), NO_NAME_MESSAGE);
  assert.equal(nameProblem("   "), NO_NAME_MESSAGE);
  assert.equal(nameProblem(undefined), NO_NAME_MESSAGE);
  assert.equal(NO_NAME_MESSAGE, "Give the pack a name.");
  for (const bad of ["nameForge", " NameForge ", "NAMEFORGE", "nameforge"]) assert.equal(nameProblem(bad), RESERVED_MESSAGE, bad);
  assert.equal(RESERVED_MESSAGE, "“nameForge” is reserved – choose another name.");
  assert.equal(nameProblem("nameForge Pack"), undefined, "a different name is fine");
  // The same check sits in front of every save path: new-name checks, which the saves all call.
  for (const bad of ["", "nameForge", " NameForge "]) assert.ok(newNameProblem(bad, []), `newNameProblem(${JSON.stringify(bad)})`);
});

test("no save path falls back to 'nameForge' for a missing name", () => {
  for (const file of ["src/modal.ts", "src/nameParser.ts"]) {
    const text = readFileSync(file, "utf8");
    // The history label for a run with no pack chosen is not a pack's name; saves and names are.
    assert.doesNotMatch(text, /(?:boxName|pastedName|FileContent\(\s*[\w.]*packName)\s*\|\|\s*"nameForge"/, `${file}: a pack's name falls back to "nameForge"`);
    assert.doesNotMatch(text, /\(packName \|\| "nameForge"\)|cleaned \|\| "nameForge"/, `${file}: a name falls back to "nameForge"`);
    assert.doesNotMatch(text, /packName \|\| "nameForge"[^)]*\)\s*;?\s*\n\s*(?:const|try)/, `${file}: a save falls back to "nameForge"`);
  }
});

// ── 2. No two notes with the same name ─────────────────────────────────────

const notes: NoteName[] = [
  { path: "Names/temperate.md", basename: "temperate", packName: "temperate" },
  { path: "Names/Orcs file.md", basename: "Orcs file", packName: "Orc clans" },
  { path: "Names/nameForge.md", basename: "nameForge" },
];

test("a new name clashes with a file name or a packName, ignoring case and surrounding spaces", () => {
  assert.ok(nameClash("Temperate", notes));
  assert.ok(nameClash("temperate ", notes));
  assert.ok(nameClash(" TEMPERATE", notes));
  assert.equal(nameClash("distant shores temperate", notes), undefined, "a longer name is a different name");
  assert.equal(nameClash("Orcs file", notes)?.path, "Names/Orcs file.md", "by file name");
  assert.equal(nameClash("orc clans", notes)?.path, "Names/Orcs file.md", "by packName under a different file name");
  assert.equal(newNameProblem("Temperate", notes), clashMessage("Temperate"));
  assert.equal(clashMessage("Temperate"), "There's already a note called “Temperate” in the names folder – choose another name.");
});

test("editing a note under its own name is allowed; another note's name is not", () => {
  assert.equal(newNameProblem("temperate", notes, "Names/temperate.md"), undefined);
  assert.equal(newNameProblem("Orc clans", notes, "Names/temperate.md"), clashMessage("Orc clans"));
});

test("a packName is read from the frontmatter", () => {
  assert.equal(packNameOfNote("---\ntype: biome\npackName: Orc clans\n---\n"), "Orc clans");
  assert.equal(packNameOfNote('---\npackName: "Quoted"\n---\n'), "Quoted");
  assert.equal(packNameOfNote("no frontmatter"), undefined);
});

test("the biome save only writes over the note being edited", () => {
  const text = readFileSync("src/modal.ts", "utf8");
  assert.match(text, /existing instanceof TFile && path !== this\.biomeEditing/, "saveBiome refuses an existing file that isn't the one being edited");
});

// ── 2.1 Biome phrases ──────────────────────────────────────────────────────

const pack = (name: string, extra = "") => `---\ntype: biome\npackName: ${name}\nbased-on: "temperate"\n${extra}---\n\n## Birds\n- Bluebird\n`;
const resolve = (files: Record<string, string>) => resolveBiomePacks(Object.entries(files).map(([path, content]) => ({ path, content })));
const withAll = (cat: ReturnType<typeof biomeCatalogue>) => [...cat.all, ...cat.space];

test("a phrase matching a built-in's label or phrase, or another pack's, is refused", () => {
  const { biomes } = resolve({ "Names/Mine.md": pack("Mine", "phrase: the mine lands\n") });
  const all = withAll(biomeCatalogue(biomes));
  assert.equal(phraseProblem("Temperate", all), phraseClashMessage("Temperate", "Temperate"), "a built-in's label");
  assert.equal(phraseProblem(" the TEMPERATE lands ", all), phraseClashMessage("the TEMPERATE lands", "Temperate"), "a built-in's phrase, case and spaces ignored");
  assert.equal(phraseProblem("The Mine Lands", all), phraseClashMessage("The Mine Lands", "Mine"), "another pack's phrase");
  assert.equal(phraseClashMessage("Temperate", "Temperate"), "The phrase “Temperate” is already used by Temperate – choose another.");
  assert.equal(phraseProblem("the distant shores", all), undefined);
  assert.equal(phraseProblem("", all), undefined);
});

test("an override may keep its built-in's phrase; the pack being edited may keep its own", () => {
  const { biomes } = resolve({ "Names/Temperate.md": pack("Temperate") });
  const all = withAll(biomeCatalogue(biomes));
  const builtIn = BIOMES.find((b) => b.id === "temperate")!;
  // New: the replacement keeps the built-in's phrase, or its label.
  assert.equal(phraseProblem(builtIn.phrase, withAll(BUILT_IN_BIOMES), { replaces: builtIn }), undefined);
  assert.equal(phraseProblem(builtIn.phrase, all, { replaces: builtIn }), undefined);
  // Editing: the pack's own phrase.
  assert.equal(phraseProblem(builtIn.phrase, all, { editingPath: "Names/Temperate.md" }), undefined);
  // But a replacement of Temperate may not take Moorland's phrase.
  assert.equal(phraseProblem("the moors", all, { replaces: builtIn }), phraseClashMessage("the moors", "Moorland"));
});

// ── 2.2 Clashes already in the folder ──────────────────────────────────────

test("a folder that already clashes is described once, never changed", () => {
  const files = { "Names/temperate.md": pack("temperate"), "Names/nameForge.md": pack("nameForge", "phrase: Temperate\n") };
  const { biomes } = resolve(files);
  const folder: NoteName[] = [
    { path: "Names/temperate.md", basename: "temperate", packName: "temperate" },
    { path: "Names/nameForge.md", basename: "nameForge", packName: "nameForge" },
  ];
  const problems = folderNameProblems(folder, withAll(biomeCatalogue(biomes)));
  assert.ok(problems.includes("Names folder: “nameForge.md” uses the phrase “Temperate”, which the Temperate biome also uses – rename one."), problems.join("\n"));
  assert.ok(problems.some((p) => /“nameForge\.md” is called “nameForge”, which is reserved/.test(p)));
  // Two notes with one name.
  const dup = folderNameProblems(
    [
      { path: "A/x.md", basename: "x", packName: "Shared" },
      { path: "A/y.md", basename: "Shared" },
    ],
    [],
  );
  assert.equal(dup.length, 1);
  assert.match(dup[0], /“x\.md” and “Shared\.md” share the name “shared”|“Shared\.md” and “x\.md” share the name “shared”/);
  // A clean folder says nothing.
  assert.deepEqual(folderNameProblems([{ path: "A/z.md", basename: "z" }], withAll(BUILT_IN_BIOMES)), []);
});

// ── 3. Showing where a biome comes from ────────────────────────────────────

const SCENARIOS: Record<string, Record<string, string>> = {
  "no packs": {},
  "a Temperate override": { "Names/Temperate.md": pack("Temperate") },
  "the override and Distant shores temperate": { "Names/Temperate.md": pack("Temperate"), "Names/Distant shores temperate.md": pack("Distant shores temperate") },
  "the user's folder": { "Names/temperate.md": pack("temperate"), "Names/nameForge.md": pack("nameForge", "phrase: Temperate\n") },
};
const catalogueOf = (name: string) => biomeCatalogue(resolve(SCENARIOS[name]).biomes);

type Choice = { id?: string; label: string; tip?: string; heading?: string };
const menuOf = (segments: unknown[]): Choice[] => (segments.find((s) => typeof s === "object" && (s as { field: string }).field === "biome") as { choices: Choice[] }).choices;

function menus(cat: ReturnType<typeof biomeCatalogue>): Record<string, Choice[]> {
  const limits = { biomes: cat.all, findBiome: (id: string | undefined) => cat.find(id), spaceBiomes: cat.space };
  const out: Record<string, Choice[]> = {
    tribes: menuOf(tribalSentence({ tradition: "general", terrain: "any", register: "plain", hostile: false } as never, limits as never)),
    realms: menuOf(realmSentence({ ...DEFAULT_REALM_STATE, era: "medieval" } as never, limits as never)),
    "calendars": menuOf(timeSentence("calendar", { ...DEFAULT_CALENDAR_STATE, era: "MD" } as never, limits as never)),
    "sky lore": menuOf(timeSentence("sky", { ...DEFAULT_SKY_STATE, era: "MD" } as never, limits as never)),
    "colonial biome choices": biomeChoices("new-land", cat),
    "land clause": landClauseBiomeItems(cat, false),
  };
  for (const m of WILDS_MODULES) out[`wild lands ${m}`] = menuOf(wildsSentence({ ...defaultWildsState(m), culture: "general", where: "new" }, m, cat));
  for (const m of ["seasLakes", "coastsIslands", "seaCharts"] as const) out[`seas and coasts ${m}`] = menuOf(watersSentence({ ...defaultWatersState(m), culture: "general", where: "new" }, m, cat));
  const land = landButtonBiomeItems(cat, false);
  out["Land button"] = [...land.builtIn, ...land.yours];
  return out;
}

test("every biome menu marks an override '(your version)' in its usual place, with its tooltip", () => {
  const cat = catalogueOf("a Temperate override");
  for (const [name, items] of Object.entries(menus(cat))) {
    const entry = items.filter((c) => c.id === "temperate");
    // A module that doesn't offer temperate (wild deserts) offers no override either.
    if (!menus(BUILT_IN_BIOMES)[name].some((c) => c.id === "temperate")) {
      assert.equal(entry.length, 0, `${name}: not offered`);
      continue;
    }
    assert.equal(entry.length, 1, `${name}: one temperate entry`);
    assert.match(entry[0].label, / \(your version\)$/, `${name}: marked`);
    assert.equal(entry[0].tip, "Your version: Temperate.md", `${name}: tooltip`);
    assert.equal(items.filter((c) => c.heading === YOUR_BIOMES).length, 0, `${name}: an override isn't under Your biomes`);
    // In its usual place: where the built-in is without the pack.
    const plain = menus(BUILT_IN_BIOMES)[name].map((c) => c.id);
    assert.equal(items.map((c) => c.id).indexOf("temperate"), plain.indexOf("temperate"), `${name}: same place`);
  }
  // Without a pack nothing is marked.
  for (const [name, items] of Object.entries(menus(BUILT_IN_BIOMES))) {
    assert.ok(items.every((c) => !/your version/.test(c.label) && !c.tip && !c.heading), `${name}: built-ins as before`);
  }
});

test("every biome menu lists your own biomes under 'Your biomes' after the built-ins, with their tooltip", () => {
  const cat = catalogueOf("the override and Distant shores temperate");
  for (const [name, items] of Object.entries(menus(cat))) {
    const at = items.findIndex((c) => c.heading === YOUR_BIOMES);
    // A pack rooted in temperate shows only where temperate does.
    if (!menus(BUILT_IN_BIOMES)[name].some((c) => c.id === "temperate")) {
      assert.equal(at, -1, `${name}: not offered`);
      continue;
    }
    const isLand = name === "Land button";
    if (isLand) {
      // The Land button draws its own "Your biomes" heading above its second list.
      const own = items.find((c) => /Distant shores temperate/.test(c.label))!;
      assert.equal(own.tip, "Your biome: Distant shores temperate.md");
      assert.equal(items.indexOf(own), items.length - 1);
      continue;
    }
    assert.ok(at > 0, `${name}: has a Your biomes heading`);
    assert.equal(items.filter((c) => c.heading === YOUR_BIOMES).length, 1, `${name}: one heading`);
    assert.match(items[at].label, /distant shores temperate/i, `${name}: the heading is on the pack's entry`);
    assert.equal(items[at].tip, "Your biome: Distant shores temperate.md", `${name}: tooltip`);
    assert.ok(items.slice(0, at).every((c) => !c.heading), `${name}: built-ins come first`);
    assert.equal(items.filter((c) => c.id === "temperate").length, 1, `${name}: still one temperate`);
  }
});

test("a menu entry in a clash shows its file name", () => {
  const cat = catalogueOf("the user's folder");
  assert.equal(biomeClashes([...cat.all, ...cat.space]).size, 2, "the override and nameForge.md");
  const items = landClauseBiomeItems(cat, false);
  assert.ok(items.some((c) => c.label === "Temperate (nameForge.md)"), items.map((c) => c.label).join(" | "));
  const override = items.find((c) => c.id === "temperate")!;
  assert.equal(override.label, "the temperate lands (your version) (temperate.md)");
  // Without a clash there are no file names in the text.
  const quiet = landClauseBiomeItems(catalogueOf("the override and Distant shores temperate"), false);
  assert.ok(quiet.every((c) => !/\.md\)/.test(c.label)));
});

test("the sentence link's text doesn't change, but its tooltip names the file for an override", () => {
  const cat = catalogueOf("a Temperate override");
  const biome = cat.find("temperate")!;
  assert.equal(biome.phrase, BIOMES[0].phrase, "the link still reads the built-in's phrase");
  assert.equal(biomeLinkTitle(biome, "x"), "Your version: Temperate.md");
  assert.equal(biomeLinkTitle(BUILT_IN_BIOMES.find("temperate"), "x"), BIOMES[0].guide, "the built-in: as now");
  const own = catalogueOf("the override and Distant shores temperate").all.find((b) => b.label === "Distant shores temperate")!;
  assert.equal(biomeLinkTitle(own, "x"), own.guide);
  const limits = { biomes: cat.all, findBiome: (id: string | undefined) => cat.find(id), spaceBiomes: cat.space };
  const segment = realmSentence({ ...DEFAULT_REALM_STATE, era: "medieval", biome: "temperate" } as never, limits as never).find((s) => typeof s === "object" && (s as { field: string }).field === "biome") as { text: string; title: string };
  assert.equal(segment.text, BIOMES[0].phrase);
  assert.equal(segment.title, "Your version: Temperate.md");
});
