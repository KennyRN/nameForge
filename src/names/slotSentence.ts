// Slot choices in the place-name sentences (wizard retirement brief §3). Plain data, no Obsidian
// imports: the closing link ("…, with ‹placeholders› for names"), the second sentence with one link
// per name slot, and the slot settings those links build. The modal draws the segments; the run
// resolves the settings into the names engine's slots through RecipeHost, as a recipe's slots are.

import { generateColonialShapesDetailed } from "../colonialShapes";
import { generatePlaceShapesDetailed } from "../placeShapes";
import { hasBuiltInList } from "./engine";
import type { SlotSetting } from "./recipe";
import { allowsLists, allowsPacks, allowsPlaceholderChoice, allowsTribal, slotCategories, slotChoices, type SlotPart } from "./slotOptions";

export type { SlotPart };

/** The slot part of a colonial part: "2" is exploration into new lands, "2a" expansion into settled lands. */
export const slotPartOf = (part: "2" | "2a"): SlotPart => (part === "2" ? "new-land" : "established");

/** §3.5: the slot sources held by each module's sentence state. */
export interface SlotSources {
  names: "placeholders" | "perSlot";
  slots: Record<string, SlotSetting>;
}

export const DEFAULT_SLOT_SOURCES: SlotSources = { names: "placeholders", slots: {} };

export const freshSlotSources = (): SlotSources => ({ names: "placeholders", slots: {} });

export interface SlotChoice {
  id: string | undefined;
  label: string;
  title?: string;
  /** A disabled heading shown before this choice (§3.3). */
  heading?: string;
  headingTip?: string;
}

export type SlotSegment = string | { field: string; text: string; title: string; choices: SlotChoice[]; current: string | undefined };

/** What the names folder offers a slot (§3.3): name packs and word lists, by name. */
export interface SlotFolderOptions {
  packs: string[];
  lists: string[];
}

export const NO_SLOT_OPTIONS: SlotFolderOptions = { packs: [], lists: [] };

// ── The slot inventory (§3.4) ───────────────────────────────────────────────

/** How each slot reads in the sentence: "‹personal names› from…". */
const SLOT_PHRASES: Record<string, string> = {
  "personal-name": "personal names",
  "earlier-or-district-name": "earlier or district names",
  "folk-group": "folk groups",
  deity: "deities",
  "saint-or-holy-person": "holy people",
  "monarch-ruler-or-dynasty": "monarchs, rulers and dynasties",
  "royal-woman": "royal women",
  "official-patron-or-sponsor": "officials, patrons and sponsors",
  "commander-or-conqueror": "commanders and conquerors",
  "explorer-or-founder": "explorers and founders",
  "native-place-name": "native place names",
  "native-people-or-tribe": "native peoples",
  "homeland-place-name": "homeland place names",
  "colonial-deity": "colonial deities",
  "local-deity": "local deities",
  "local-settlement-word": "local settlement words",
  "local-market-word": "local market words",
};

export interface SlotInfo {
  id: string;
  /** The category's label ("Personal name"). */
  label: string;
  /** Plural, lower case, as the sentence reads ("personal names"). */
  phrase: string;
}

const LOCAL_WORDS = new Set(["local-settlement-word", "local-market-word"]);

/** The categories a batch of shapes uses: the specific, the second specific, an affix's slot and the local generics. */
function categoriesUsed(shapes: { categoryId: string; genericId: string; secondCategoryId?: string; affix?: { form: { slotCategory?: string } } }[]): Set<string> {
  const used = new Set<string>();
  for (const shape of shapes) {
    used.add(shape.categoryId);
    if (shape.secondCategoryId) used.add(shape.secondCategoryId);
    if (shape.affix?.form.slotCategory) used.add(shape.affix.form.slotCategory);
    if (LOCAL_WORDS.has(shape.genericId)) used.add(shape.genericId);
  }
  return used;
}

const inventoryCache = new Map<SlotPart, SlotInfo[]>();

/**
 * §3.4: the slots that render as brackets today for a part, in the slot inventory's order. Derived
 * from the shape generators: a category counts when some shape of the part uses it, it has no
 * built-in list (those render words, not brackets) and it isn't a land slot (those stay under the
 * Land button). A fixed seed and a large batch make the answer the same every time.
 */
export function slotInventory(part: SlotPart): SlotInfo[] {
  const cached = inventoryCache.get(part);
  if (cached) return cached;
  const used = new Set<string>();
  for (const seed of [1, 2]) {
    const shapes =
      part === "organic"
        ? generatePlaceShapesDetailed({ count: 4000, seed }).shapes
        : generateColonialShapesDetailed({ count: 4000, seed, part: part === "new-land" ? "2" : "2a" }).shapes;
    for (const id of categoriesUsed(shapes)) used.add(id);
  }
  const out = slotCategories(part)
    .filter((c) => used.has(c.id) && !slotChoices(part, c.id) && !hasBuiltInList(c.id))
    .map((c) => ({ id: c.id, label: c.label, phrase: SLOT_PHRASES[c.id] ?? `${c.label.toLowerCase()}s` }));
  inventoryCache.set(part, out);
  return out;
}

// ── Choices (§3.3) ──────────────────────────────────────────────────────────

const PLACEHOLDER_ID = "placeholder";
const BUILT_IN_ID = "built-in";
const TRIBAL_ID = "tribal";
const listId = (name: string) => `list:${name}`;
const packId = (name: string) => `pack:${name}`;

/** The id a slot's setting shows as in its menu. */
export function slotChoiceId(setting: SlotSetting | undefined): string {
  if (!setting || setting.kind === "placeholder") return PLACEHOLDER_ID;
  if (setting.kind === "built-in") return BUILT_IN_ID;
  if (setting.kind === "tribal") return TRIBAL_ID;
  if (setting.kind === "sources") {
    const ref = setting.sources[0];
    if (ref?.list) return listId(ref.list);
    if (ref?.pack) return packId(ref.pack);
  }
  return PLACEHOLDER_ID;
}

/** A slot's setting from a menu id; undefined is a placeholder (no entry in the slots map). */
export function slotSettingOf(part: SlotPart, id: string | undefined): SlotSetting | undefined {
  if (!id || id === PLACEHOLDER_ID) return undefined;
  if (id === BUILT_IN_ID) return { kind: "built-in" };
  // The wizard's own default: tribal names follow the culture on the organic folk-group slot.
  if (id === TRIBAL_ID) return { kind: "tribal", tradition: part === "organic" ? "auto" : "general" };
  if (id.startsWith("list:")) return { kind: "sources", sources: [{ list: id.slice(5), weight: 1 }] };
  if (id.startsWith("pack:")) return { kind: "sources", sources: [{ pack: id.slice(5), weight: 1 }] };
  return undefined;
}

/** How a source reads in its link: "placeholders", "the built-in list", "tribes and kin groups", a list's name, a pack's name with "(pack)". */
export function slotSourceText(setting: SlotSetting | undefined): string {
  const id = slotChoiceId(setting);
  if (id === PLACEHOLDER_ID) return "placeholders";
  if (id === BUILT_IN_ID) return "the built-in list";
  if (id === TRIBAL_ID) return "tribes and kin groups";
  return id.startsWith("list:") ? `${id.slice(5)} (list)` : `${id.slice(5)} (pack)`;
}

/** §3.3: the menu for one slot, in up to three runs, each opened by a disabled heading. */
export function slotChoiceMenu(part: SlotPart, categoryId: string, options: SlotFolderOptions): SlotChoice[] {
  const out: SlotChoice[] = [];
  const run = (heading: string, choices: SlotChoice[]) => {
    if (choices.length > 0) out.push({ ...choices[0], heading }, ...choices.slice(1));
  };
  if (allowsPlaceholderChoice(part, categoryId)) run("Placeholder", [{ id: PLACEHOLDER_ID, label: "placeholders" }]);
  if (allowsLists(part, categoryId)) {
    run("Lists", [
      ...(hasBuiltInList(categoryId) ? [{ id: BUILT_IN_ID, label: "the built-in list" }] : []),
      ...options.lists.map((name) => ({ id: listId(name), label: name })),
    ]);
  }
  // The engine reads only words for the local generics (a pack draw there is skipped), so they offer no generators.
  const words = LOCAL_WORDS.has(categoryId);
  run("Generators", words ? [] : [
    ...(allowsPacks(part, categoryId) ? options.packs.map((name) => ({ id: packId(name), label: name })) : []),
    ...(allowsTribal(part, categoryId) ? [{ id: TRIBAL_ID, label: "tribes and kin groups" }] : []),
  ]);
  return out;
}

// ── The sentences (§3.2) ────────────────────────────────────────────────────

const NAMES_TITLE = "Names: placeholders show each name slot as a bracket; names chosen per slot lets you pick where each one comes from";

/** The closing link: "…, with ‹placeholders› for names" or "…, with ‹names chosen per slot›". */
export function namesClosing(state: SlotSources): SlotSegment[] {
  const perSlot = state.names === "perSlot";
  const link: SlotSegment = {
    field: "names",
    text: perSlot ? "names chosen per slot" : "placeholders",
    title: NAMES_TITLE,
    choices: [
      { id: "placeholders", label: "placeholders" },
      { id: "perSlot", label: "names chosen per slot" },
    ],
    current: state.names,
  };
  return perSlot ? [", with ", link] : [", with ", link, " for names"];
}

/**
 * The second sentence, or undefined while names are placeholders: "Personal names from ‹Anglo-Saxon
 * (pack)›; earlier or district names as ‹placeholders›; …." A slot on placeholder reads "as", any
 * other source "from".
 */
export function slotSentence(part: SlotPart, state: SlotSources, options: SlotFolderOptions = NO_SLOT_OPTIONS): SlotSegment[] | undefined {
  if (state.names !== "perSlot") return undefined;
  const out: SlotSegment[] = [];
  slotInventory(part).forEach((slot, index) => {
    const setting = state.slots[slot.id];
    const phrase = index === 0 ? slot.phrase.charAt(0).toUpperCase() + slot.phrase.slice(1) : slot.phrase;
    out.push(index === 0 ? "" : "; ", `${phrase} ${slotChoiceId(setting) === PLACEHOLDER_ID ? "as" : "from"} `, {
      field: slot.id,
      text: slotSourceText(setting),
      title: `Where ${slot.phrase} come from: ${slot.label.toLowerCase()}`,
      choices: slotChoiceMenu(part, slot.id, options),
      current: slotChoiceId(setting),
    });
  });
  if (out.length > 0) out.push(".");
  return out.filter((s) => s !== "");
}

/** The text of a sentence's segments (tests, preset descriptions). */
export function slotSegmentsText(segments: SlotSegment[]): string {
  return segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
}

// ── State ───────────────────────────────────────────────────────────────────

/** Chooses the closing link's value. */
export function chooseNames(state: SlotSources, id: string | undefined): SlotSources {
  return { ...state, names: id === "perSlot" ? "perSlot" : "placeholders" };
}

/** Chooses a slot's source; placeholders remove the entry, so nothing is mapped (§3.5). */
export function chooseSlotSource(state: SlotSources, part: SlotPart, categoryId: string, id: string | undefined): SlotSources {
  const slots = { ...state.slots };
  const setting = slotSettingOf(part, id);
  if (setting) slots[categoryId] = setting;
  else delete slots[categoryId];
  return { ...state, slots };
}

/**
 * The slots a run maps: only with names chosen per slot, only slots the part offers, and never a
 * placeholder (an unmapped slot is exactly today's behaviour, so every slot on placeholder gives the
 * same output as placeholders).
 */
export function activeSlots(part: SlotPart, state: SlotSources): Record<string, SlotSetting> {
  if (state.names !== "perSlot") return {};
  const out: Record<string, SlotSetting> = {};
  for (const slot of slotInventory(part)) {
    const setting = state.slots[slot.id];
    if (setting && setting.kind !== "placeholder") out[slot.id] = setting;
  }
  return out;
}

/** §3.5: whether any slot draws from something other than a placeholder. */
export function usesOwnNames(part: SlotPart, state: SlotSources): boolean {
  return Object.keys(activeSlots(part, state)).length > 0;
}

/** §3.5: " · own names" for the history label when a slot isn't a placeholder, else nothing. */
export function ownNamesSuffix(part: SlotPart, state: SlotSources): string {
  return usesOwnNames(part, state) ? " · own names" : "";
}
