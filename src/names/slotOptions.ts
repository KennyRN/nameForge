// The slot rules: which options each name slot offers (the slot sentence's menus).
// The wizard's tiers live in archive/place-name-wizard/slotTiers.ts. No Obsidian imports, so the rules can be unit tested. Nothing here changes what generates.

import { COLONIAL_DATA } from "../colonialShapes";
import { PLACE_SHAPE_DATA } from "../placeShapes";
import { hasGenderDefault, NAME_SLOTS } from "./engine";
import { type RecipeSettings } from "./recipe";

export type SlotPart = RecipeSettings["shape"]["part"];

/** The slot categories for a part: part 1's, or the colonial inventory for parts 2 and 2a (with local generics in 2a). */
export function slotCategories(part: SlotPart): { id: string; label: string }[] {
  const part1 = new Map(PLACE_SHAPE_DATA.categories.map((c) => [c.id, c.label]));
  if (part === "organic") return PLACE_SHAPE_DATA.categories.filter((c) => c.id !== "empty-slot");
  const code = part === "new-land" ? "2" : "2a";
  const out = [
    ...COLONIAL_DATA.inheritedCategories
      .filter((c) => c.parts.includes(code) && c.id !== "empty-slot")
      .map((c) => ({ id: c.id, label: part1.get(c.id) ?? c.id })),
    ...COLONIAL_DATA.categories.filter((c) => c.parts.includes(code)).map((c) => ({ id: c.id, label: c.label })),
  ];
  if (code === "2a") out.push({ id: "local-settlement-word", label: "Local settlement word" }, { id: "local-market-word", label: "Local market word" });
  return out;
}

// ── Options ─────────────────────────────────────────────────────────────────

/** Native flora and fauna: words in Place names, native placeholders in the colonial parts. */
const FLORA_AND_FAUNA = new Set(["wild-animal", "bird", "fish-and-other-creatures", "tree", "wild-plant"]);

/** Slots that take words, not names: no Name packs. */
const WORD_ONLY = new Set([
  "status-or-role",
  "ethnic-or-cultural-group",
  "settler-group",
  "supernatural-being",
  "domestic-animal",
  "crop",
  "landform",
  "water-or-wetland-feature",
  "soil-or-ground",
  "built-feature",
  "colour",
  "size",
  "age",
  "position-or-direction",
  "shape",
  "quality-or-condition",
  "number",
  "activity",
  "produce",
  "religious-association",
  "assembly-or-law",
  "season",
  "honorific-title",
  "emotion-or-aspiration",
  "event-or-incident",
  "imperial-claim",
  "resource",
  "distance-or-survey-mark",
  "calendar-date-or-feast",
]);

/** Slots that take proper names (a listed word there becomes a name): the engine's set. */
export { NAME_SLOTS };

/** Bare descriptive slots: a bracketed adjective is never wanted, so no Placeholder choice. */
const NO_PLACEHOLDER = new Set(["colour", "size", "age", "position-or-direction", "shape", "quality-or-condition", "number", "season"]);

// ── Two-choice slots (Land brief §5.1) ─────────────────────────────────────

export type SlotChoice = "default" | "biome" | "placeholder" | "ignore";

const NATURE = new Set(["wild-animal", "bird", "fish-and-other-creatures", "tree", "wild-plant"]);

/** Land brief §5.1: the choices for a land slot, or undefined for slots that keep today's dropdown. */
export function slotChoices(part: SlotPart, categoryId: string): SlotChoice[] | undefined {
  if (NATURE.has(categoryId) || categoryId === "landform" || categoryId === "water-or-wetland-feature") return ["default", "placeholder", "ignore"];
  if (categoryId === "soil-or-ground" || categoryId === "river-or-stream-name") return ["default", "placeholder", "ignore"];
  if (categoryId === "resource" && part === "new-land") return ["default", "placeholder", "ignore"];
  if (categoryId === "season") return ["default", "ignore"];
  if (categoryId === "domestic-animal" || categoryId === "crop") return part === "organic" ? ["default", "ignore"] : ["default", "biome", "ignore"];
  return undefined;
}

/** The label of a land slot's unset choice (Land brief §5.1). */
export function slotDefaultLabel(part: SlotPart, categoryId: string): string {
  if (categoryId === "river-or-stream-name") return "River name module";
  if (categoryId === "landform" || categoryId === "water-or-wetland-feature") return "From the terrain";
  if ((categoryId === "domestic-animal" || categoryId === "crop") && part !== "organic") return "Incomers' own";
  return "From the biome";
}

/** Whether a slot offers Name packs. Colonial flora and fauna keep them: a native pack can invent creature words. */
export function allowsPacks(part: SlotPart, categoryId: string): boolean {
  if (slotChoices(part, categoryId)) return false;
  if (FLORA_AND_FAUNA.has(categoryId)) return part !== "organic";
  return !WORD_ONLY.has(categoryId);
}

/** Whether a slot offers Word lists: every slot, now that lists can hold names and `//` pack lines. */
export function allowsLists(part: SlotPart, categoryId: string): boolean {
  return !slotChoices(part, categoryId);
}

/** Tribal brief §20.3: Tribal names on the organic folk-group slot and the colonial native-people slot only. */
export function allowsTribal(part: SlotPart, categoryId: string): boolean {
  if (part === "organic") return categoryId === "folk-group";
  return categoryId === "native-people-or-tribe";
}

/** Whether a slot offers an explicit Placeholder choice (still only when its default isn't one). */
export function allowsPlaceholderChoice(part: SlotPart, categoryId: string): boolean {
  if (slotChoices(part, categoryId)) return false;
  return !NO_PLACEHOLDER.has(categoryId);
}

/** Whether a slot's pack footer shows Male %: slots with a default ratio, except the always-female royal woman. */
export function showsGender(categoryId: string): boolean {
  return categoryId !== "royal-woman" && hasGenderDefault(categoryId);
}

/**
 * Colonial flora and fauna: unset, they render native placeholders, so the default reads "Native
 * placeholder" and an explicit "Built-in list" option draws the British list.
 */
export function usesNativeDefault(part: SlotPart, categoryId: string): boolean {
  return part !== "organic" && FLORA_AND_FAUNA.has(categoryId);
}
