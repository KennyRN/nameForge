// Wizard retirement brief §3: the slot sentence, its menus, the slot inventory (§3.4) and how the
// sources resolve into the names engine's slots (§3.5).
import { test } from "node:test";
import assert from "node:assert/strict";
import { TFile } from "obsidian";
import { COLONIAL_TRADITIONS, colonialContexts, isTraditionAvailable } from "../src/colonialShapes";
import { type GeneratedName, generatePlaceNames, hasBuiltInList, type ResolvedSlot } from "../src/names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe, type RecipeSettings } from "../src/names/recipe";
import {
  activeSlots,
  chooseNames,
  chooseSlotSource,
  freshSlotSources,
  namesClosing,
  ownNamesSuffix,
  slotChoiceMenu,
  slotInventory,
  type SlotChoice,
  slotSegmentsText,
  slotSentence,
  slotSettingOf,
  type SlotSources,
  usesOwnNames,
} from "../src/names/slotSentence";
import { slotCategories, slotChoices, type SlotPart } from "../src/names/slotOptions";
import { createNamesFileContent, createWordListFileContent } from "../src/nameParser";
import { PLACE_SHAPE_REGIONS } from "../src/placeShapes";
import { RecipeHost } from "../src/recipeHost";

const PARTS: SlotPart[] = ["organic", "new-land", "established"];
const ids = (part: SlotPart) => slotInventory(part).map((s) => s.id);

// ── §3.4: the slot list matches what each setting can produce ──────────────

/** A marker word per candidate slot: it shows up in a name only if that slot rendered. */
const markers = (part: SlotPart) => {
  const map = new Map<string, string>();
  const slots: Record<string, ResolvedSlot> = {};
  slotCategories(part)
    .filter((c) => !slotChoices(part, c.id) && !hasBuiltInList(c.id))
    .forEach((c, i) => {
      const token = `zq${String.fromCharCode(97 + Math.floor(i / 26))}${String.fromCharCode(97 + (i % 26))}x`;
      map.set(token, c.id);
      slots[c.id] = { kind: "sources", sources: [{ weight: 1, entries: [{ modern: token, forms: [], fuses: "no" }] }] };
    });
  return { map, slots };
};

/** The slots that rendered, found by their markers in `count` names of one setting. */
function rendered(part: SlotPart, recipe: RecipeSettings, count = 400): Set<string> {
  const { map, slots } = markers(part);
  const found = new Set<string>();
  for (const seed of [1, 2]) {
    const text = generatePlaceNames({ recipe, slots, count, seed }).names.map((n) => n.text.toLowerCase()).join("\n");
    for (const [token, id] of map) if (text.includes(token)) found.add(id);
  }
  return found;
}

test("slot inventory: British offers personal, earlier or district, folk, deity and holy-person slots", () => {
  assert.deepEqual([...ids("organic")].sort(), ["deity", "earlier-or-district-name", "folk-group", "personal-name", "saint-or-holy-person"]);
});

test("slot inventory: the colonial parts offer the person, native, homeland and (settled lands) local-word slots", () => {
  for (const id of ["personal-name", "monarch-ruler-or-dynasty", "official-patron-or-sponsor", "explorer-or-founder", "commander-or-conqueror", "royal-woman", "native-people-or-tribe", "native-place-name", "homeland-place-name"]) {
    assert.ok(ids("new-land").includes(id), `new lands: ${id}`);
  }
  for (const id of ["monarch-ruler-or-dynasty", "official-patron-or-sponsor", "explorer-or-founder", "commander-or-conqueror", "royal-woman", "native-people-or-tribe", "native-place-name", "homeland-place-name", "local-settlement-word", "local-market-word"]) {
    assert.ok(ids("established").includes(id), `settled lands: ${id}`);
  }
  assert.ok(!ids("new-land").includes("local-settlement-word"));
});

test("slot inventory: land slots and slots with built-in lists are never offered", () => {
  for (const part of PARTS) {
    for (const slot of slotInventory(part)) {
      assert.equal(slotChoices(part, slot.id), undefined, `${part} ${slot.id} is a land slot`);
      assert.equal(hasBuiltInList(slot.id), false, `${part} ${slot.id} has a built-in list`);
    }
  }
});

test("slot inventory: exactly the slots each British setting can produce as brackets", () => {
  const seen = new Set<string>();
  for (const region of [undefined, ...PLACE_SHAPE_REGIONS.map((r) => r.code)]) {
    const found = rendered("organic", britishPlaceNamesRecipe(region), 250);
    for (const id of found) assert.ok(ids("organic").includes(id), `${region ?? "all"}: ${id} rendered but isn't offered`);
    found.forEach((id) => seen.add(id));
  }
  assert.deepEqual([...seen].sort(), [...ids("organic")].sort());
});

test("slot inventory: exactly the slots each exploration and expansion setting can produce as brackets", () => {
  for (const [part, code, recipePart] of [["new-land", "2", "new-land"], ["established", "2a", "established"]] as const) {
    const seen = new Set<string>();
    for (const tradition of COLONIAL_TRADITIONS.filter((t) => isTraditionAvailable(t.id, code))) {
      for (const context of [undefined, ...colonialContexts(code).map((c) => c.id)]) {
        const found = rendered(part, colonialPlaceNamesRecipe(recipePart, tradition.id === "general" ? undefined : tradition.id, context), 150);
        for (const id of found) assert.ok(ids(part).includes(id), `${part} ${tradition.id} ${context ?? "none"}: ${id} rendered but isn't offered`);
        found.forEach((id) => seen.add(id));
      }
    }
    assert.deepEqual([...seen].sort(), [...ids(part)].sort(), part);
  }
});

// ── §3.2–§3.3: the sentences and menus ─────────────────────────────────────

test("closing link: placeholders by default, names chosen per slot when switched", () => {
  const text = (s: SlotSources) => namesClosing(s).map((x) => (typeof x === "string" ? x : x.text)).join("");
  assert.equal(text(freshSlotSources()), ", with placeholders for names");
  assert.equal(text(chooseNames(freshSlotSources(), "perSlot")), ", with names chosen per slot");
  assert.equal(slotSentence("organic", freshSlotSources()), undefined);
});

test("slot sentence: one link per offered slot, 'as' for placeholders and 'from' for the rest, joined by semicolons", () => {
  let state = chooseNames(freshSlotSources(), "perSlot");
  const plain = slotSegmentsText(slotSentence("organic", state)!);
  assert.match(plain, /^Personal names as placeholders; /);
  assert.ok(plain.endsWith("."));
  assert.equal((plain.match(/;/g) ?? []).length, 4);
  state = chooseSlotSource(state, "organic", "personal-name", "pack:Anglo-Saxon");
  state = chooseSlotSource(state, "organic", "folk-group", "tribal");
  const text = slotSegmentsText(slotSentence("organic", state, { packs: ["Anglo-Saxon"], lists: [] })!);
  assert.match(text, /^Personal names from Anglo-Saxon \(pack\); /);
  assert.match(text, /folk groups from tribes and kin groups/);
  assert.match(text, /deities as placeholders/);
});

const headings = (menu: SlotChoice[]) => menu.filter((c) => c.heading).map((c) => c.heading);

test("slot menu: Placeholder, Lists and Generators runs, each opened by a heading; empty runs are left out", () => {
  const options = { packs: ["Anglo-Saxon", "Norse"], lists: ["Starter names"] };
  const menu = slotChoiceMenu("organic", "personal-name", options);
  assert.deepEqual(headings(menu), ["Placeholder", "Lists", "Generators"]);
  assert.deepEqual(menu.map((c) => c.id), ["placeholder", "list:Starter names", "pack:Anglo-Saxon", "pack:Norse"]);
  assert.deepEqual(headings(slotChoiceMenu("organic", "personal-name", { packs: [], lists: [] })), ["Placeholder"]);
  assert.deepEqual(headings(slotChoiceMenu("organic", "personal-name", { packs: ["A"], lists: [] })), ["Placeholder", "Generators"]);
});

test("slot menu: tribes and kin groups on the folk-group and native-people slots only", () => {
  const tribal = (part: SlotPart, id: string) => slotChoiceMenu(part, id, { packs: [], lists: [] }).some((c) => c.id === "tribal");
  assert.equal(tribal("organic", "folk-group"), true);
  assert.equal(tribal("organic", "personal-name"), false);
  assert.equal(tribal("new-land", "native-people-or-tribe"), true);
  assert.equal(tribal("established", "native-people-or-tribe"), true);
  assert.equal(tribal("new-land", "personal-name"), false);
});

test("slot menu: the built-in list appears only where the engine has one", () => {
  for (const part of PARTS) {
    for (const slot of slotInventory(part)) {
      assert.equal(slotChoiceMenu(part, slot.id, { packs: [], lists: [] }).some((c) => c.id === "built-in"), false, slot.id);
    }
  }
  // A slot that does have a list offers it, under Lists.
  const withList = slotCategories("organic").find((c) => hasBuiltInList(c.id) && !slotChoices("organic", c.id))!;
  const menu = slotChoiceMenu("organic", withList.id, { packs: [], lists: [] });
  assert.equal(menu.find((c) => c.id === "built-in")?.heading, "Lists");
  assert.deepEqual(slotSettingOf("organic", "built-in"), { kind: "built-in" });
});

test("slot menu: local words take word lists only, since the engine reads no pack there", () => {
  const menu = slotChoiceMenu("established", "local-settlement-word", { packs: ["Norse"], lists: ["Local words"] });
  assert.deepEqual(menu.map((c) => c.id), ["placeholder", "list:Local words"]);
});

// ── State ───────────────────────────────────────────────────────────────────

test("state: choosing placeholder removes the entry; stale slots are never mapped", () => {
  let state = chooseNames(freshSlotSources(), "perSlot");
  state = chooseSlotSource(state, "organic", "personal-name", "pack:Norse");
  assert.deepEqual(Object.keys(state.slots), ["personal-name"]);
  assert.equal(ownNamesSuffix("organic", state), " · own names");
  // The same state under another part: personal-name still offered in exploration, not in expansion.
  assert.deepEqual(Object.keys(activeSlots("new-land", state)), ["personal-name"]);
  assert.deepEqual(activeSlots("established", state), {});
  assert.equal(ownNamesSuffix("established", state), "");
  state = chooseSlotSource(state, "organic", "personal-name", "placeholder");
  assert.deepEqual(state.slots, {});
  assert.equal(usesOwnNames("organic", state), false);
});

test("state: with names left on placeholders nothing is mapped, whatever was chosen", () => {
  const state: SlotSources = { names: "placeholders", slots: { "personal-name": { kind: "tribal", tradition: "auto" } } };
  assert.deepEqual(activeSlots("organic", state), {});
  assert.equal(ownNamesSuffix("organic", state), "");
});

test("equivalence: names chosen per slot with every slot on placeholder gives the placeholders output", () => {
  const perSlot = chooseNames(freshSlotSources(), "perSlot");
  const recipes: [SlotPart, RecipeSettings][] = [
    ["organic", britishPlaceNamesRecipe("NTH")],
    ["new-land", colonialPlaceNamesRecipe("new-land", undefined, undefined)],
    ["established", colonialPlaceNamesRecipe("established", undefined, undefined)],
  ];
  for (const [part, recipe] of recipes) {
    const texts = (slots: Record<string, ResolvedSlot>) => generatePlaceNames({ recipe, slots, count: 40, seed: 9 }).names.map((n: GeneratedName) => n.text);
    assert.deepEqual(texts(activeSlots(part, perSlot) as Record<string, ResolvedSlot>), texts({}), part);
  }
});

// ── §3.5: resolving the sources through RecipeHost ─────────────────────────

const PACK = createNamesFileContent("Anglo-Saxon", ["Alfred", "Beowulf", "Cuthbert", "Dunstan", "Edmund", "Godwin", "Harold", "Oswald"], "listPack");
const LIST = createWordListFileContent("Holy words", "## Saint or holy person\n- Saint Zq\n- Saint Yp\n");

function fakeApp(files: Record<string, string>) {
  const byName = new Map<string, TFile>();
  for (const [path, content] of Object.entries(files)) {
    const file = new TFile(path) as TFile & { basename: string };
    file.content = content;
    file.basename = path.split("/").pop()!.replace(/\.md$/, "");
    byName.set(file.basename, file);
  }
  return {
    vault: { cachedRead: async (file: TFile) => file.content },
    metadataCache: { getFirstLinkpathDest: (name: string) => byName.get(name) ?? null },
  } as never;
}

const resolve = async (files: Record<string, string>, state: SlotSources, part: SlotPart = "organic") => {
  const host = new RecipeHost(fakeApp(files), {}, []);
  const slots = await host.resolveSlotSources(britishPlaceNamesRecipe(undefined), part, state, "Names/");
  return { slots, notices: host.getNotices() };
};

test("resolve: a pack fills its slot", async () => {
  const state = chooseSlotSource(chooseNames(freshSlotSources(), "perSlot"), "organic", "personal-name", "pack:Anglo-Saxon");
  const { slots, notices } = await resolve({ "Names/Anglo-Saxon.md": PACK }, state);
  assert.deepEqual(Object.keys(slots), ["personal-name"]);
  assert.equal(slots["personal-name"].kind, "sources");
  assert.deepEqual(notices, []);
  const names = generatePlaceNames({ recipe: britishPlaceNamesRecipe(undefined), slots, count: 300, seed: 3 }).names.map((n) => n.text).join(" ");
  assert.match(names, /Alfred|Beowulf|Cuthbert|Dunstan|Edmund|Godwin|Harold|Oswald/);
});

test("resolve: a word list fills its slot", async () => {
  const state = chooseSlotSource(chooseNames(freshSlotSources(), "perSlot"), "organic", "saint-or-holy-person", "list:Holy words");
  const { slots, notices } = await resolve({ "Names/Holy words.md": LIST }, state);
  assert.equal(slots["saint-or-holy-person"]?.kind, "sources");
  assert.deepEqual(notices, []);
  const names = generatePlaceNames({ recipe: britishPlaceNamesRecipe(undefined), slots, count: 400, seed: 3 }).names.map((n) => n.text).join(" ");
  assert.match(names, /Zq|Yp/);
});

test("resolve: the built-in list maps the slot as built-in", async () => {
  const state: SlotSources = { names: "perSlot", slots: { "personal-name": { kind: "built-in" } } };
  const { slots } = await resolve({}, state);
  assert.deepEqual(slots["personal-name"], { kind: "built-in" });
});

test("resolve: tribes and kin groups fill the folk-group slot with the run's culture", async () => {
  const state = chooseSlotSource(chooseNames(freshSlotSources(), "perSlot"), "organic", "folk-group", "tribal");
  const { slots } = await resolve({}, state);
  assert.deepEqual(slots["folk-group"], { kind: "tribal", tradition: "auto" });
  const names = generatePlaceNames({ recipe: britishPlaceNamesRecipe("NTH"), slots, count: 200, seed: 4 }).names;
  assert.ok(names.every((n) => n.text.length > 0));
  const exploration = chooseSlotSource(chooseNames(freshSlotSources(), "perSlot"), "new-land", "native-people-or-tribe", "tribal");
  const colonial = await resolve({}, exploration, "new-land");
  assert.deepEqual(colonial.slots["native-people-or-tribe"], { kind: "tribal", tradition: "general" });
});

test("resolve: a missing pack or list falls back to a placeholder with a notice", async () => {
  const state = chooseSlotSource(chooseSlotSource(chooseNames(freshSlotSources(), "perSlot"), "organic", "personal-name", "pack:Gone"), "organic", "saint-or-holy-person", "list:Vanished");
  const { slots, notices } = await resolve({}, state);
  assert.deepEqual(slots["personal-name"], { kind: "placeholder" });
  assert.deepEqual(slots["saint-or-holy-person"], { kind: "placeholder" });
  assert.deepEqual(notices, ["Pack “Gone” wasn't found.", "Word list “Vanished” wasn't found."]);
});

test("resolve: placeholders map nothing, however the state came about", async () => {
  const { slots, notices } = await resolve({}, chooseNames(freshSlotSources(), "perSlot"));
  assert.deepEqual(slots, {});
  assert.deepEqual(notices, []);
});
