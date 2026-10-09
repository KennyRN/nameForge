// Recipe packs (names-reference §6–§7). No Obsidian imports: the host parses the frontmatter YAML
// into a plain object and hands it here.

import { findBiome } from "../biomes";

export type Register = "modern" | "mixed" | "traditional";
export type Joining = "fused" | "balanced" | "spaced";
export type ShapePart = "organic" | "new-land" | "established";
export type NameMode = "stem" | "whole";

export interface SourceRef {
  /** A name pack link target (without brackets). */
  pack?: string;
  /** A word-list pack link target (without brackets). */
  list?: string;
  weight: number;
}

export type SlotSetting =
  | { kind: "built-in" }
  | { kind: "ignore" }
  | { kind: "placeholder" }
  | {
      kind: "sources";
      sources: SourceRef[];
      mode?: NameMode;
      gender?: { male: number; female: number };
      section?: string;
    };

export interface RecipeSettings {
  setting: string;
  template: boolean;
  templateOf?: string;
  /** `biome` (Tribal brief §19.1): a biome id, or "unknown" for native placeholders. */
  shape: { part: ShapePart; region: string; tradition: string; context: string; biome: string; feature: string };
  slots: Record<string, SlotSetting>;
  generics: Record<string, string>;
  register: Register;
  render: { joining: Joining; linkingHyphens: boolean; etymology: boolean };
  /** The takeover pack (link target): the coloniser's language that adapts native names. Colonial parts only. */
  takeover?: string;
  /** The native pack (link target): native place and people slots left unset draw from it. Colonial parts only. */
  native?: string;
}

/** A recipe as written: every setting optional, so a derived recipe can inherit per setting. */
export interface RecipePartial {
  setting?: string;
  template?: boolean;
  templateOf?: string;
  shape?: Partial<RecipeSettings["shape"]>;
  slots?: Record<string, SlotSetting>;
  generics?: Record<string, string>;
  register?: Register;
  render?: Partial<RecipeSettings["render"]>;
  takeover?: string;
  native?: string;
}

export const RECIPE_DEFAULTS: RecipeSettings = {
  setting: "",
  template: false,
  shape: { part: "organic", region: "all-britain", tradition: "general", context: "none", biome: "unknown", feature: "any" },
  slots: {},
  generics: {},
  register: "mixed",
  render: { joining: "balanced", linkingHyphens: true, etymology: false },
};

const PARTS: ShapePart[] = ["organic", "new-land", "established"];
const REGISTERS: Register[] = ["modern", "mixed", "traditional"];
const JOININGS: Joining[] = ["fused", "balanced", "spaced"];

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : undefined);
const bool = (v: unknown) => (typeof v === "boolean" ? v : v === "true" ? true : v === "false" ? false : undefined);

/** "[[Saxon names]]" or "[[Saxon names|alias]]" → "Saxon names". */
export function linkTarget(v: unknown): string | undefined {
  const s = str(v);
  if (!s) return undefined;
  const target = s.replace(/^\[\[|\]\]$/g, "").split("|")[0].trim();
  return target || undefined;
}

function readSlot(v: unknown, problems: string[], id: string): SlotSetting | undefined {
  if (v === "built-in" || v === "ignore" || v === "placeholder") return { kind: v };
  if (!isObject(v)) {
    problems.push(`Slot “${id}” isn't built-in, ignore, placeholder or a list of sources.`);
    return undefined;
  }
  const raw = Array.isArray(v.sources) ? v.sources : [];
  const sources: SourceRef[] = [];
  for (const item of raw) {
    if (!isObject(item)) continue;
    const pack = linkTarget(item.pack);
    const list = linkTarget(item.list);
    if (!pack && !list) continue;
    const weight = Number(item.weight);
    sources.push({ ...(pack ? { pack } : {}), ...(list ? { list } : {}), weight: Number.isFinite(weight) && weight > 0 ? weight : 1 });
  }
  if (sources.length === 0) {
    problems.push(`Slot “${id}” has no usable sources.`);
    return undefined;
  }
  const slot: SlotSetting = { kind: "sources", sources };
  if (v.mode === "stem" || v.mode === "whole") slot.mode = v.mode;
  if (isObject(v.gender)) {
    const male = Number(v.gender.male);
    const female = Number(v.gender.female);
    if (Number.isFinite(male) && Number.isFinite(female) && male + female > 0) slot.gender = { male, female };
  }
  const section = str(v.section);
  if (section) slot.section = section;
  return slot;
}

/** Reads a recipe's frontmatter object. Unknown or invalid values are reported and skipped. */
export function readRecipe(fm: Record<string, unknown>): { recipe: RecipePartial; problems: string[] } {
  const problems: string[] = [];
  const recipe: RecipePartial = {};
  const setting = str(fm.setting);
  if (setting !== undefined) recipe.setting = setting;
  const template = bool(fm.template);
  if (template !== undefined) recipe.template = template;
  const templateOf = linkTarget(fm["template-of"]);
  if (templateOf) recipe.templateOf = templateOf;

  if (isObject(fm.shape)) {
    const shape: Partial<RecipeSettings["shape"]> = {};
    const part = str(fm.shape.part);
    if (part && PARTS.includes(part as ShapePart)) shape.part = part as ShapePart;
    else if (part) problems.push(`Unknown shape part “${part}”.`);
    for (const key of ["region", "tradition", "context", "feature"] as const) {
      const value = str(fm.shape[key]);
      if (value) shape[key] = value;
    }
    // Tribal brief §19.1: a biome id or "unknown"; anything else is reported and skipped.
    const biome = str(fm.shape.biome);
    if (biome && (biome === "unknown" || findBiome(biome))) shape.biome = biome;
    else if (biome) problems.push(`Unknown biome “${biome}”.`);
    recipe.shape = shape;
  }
  if (isObject(fm.slots)) {
    recipe.slots = {};
    for (const [id, value] of Object.entries(fm.slots)) {
      const slot = readSlot(value, problems, id);
      if (slot) recipe.slots[id] = slot;
    }
  }
  if (isObject(fm.generics)) {
    recipe.generics = {};
    for (const [word, replacement] of Object.entries(fm.generics)) {
      const r = str(replacement);
      if (r) recipe.generics[word.trim().toLowerCase()] = r;
    }
  }
  const takeover = linkTarget(fm.takeover);
  if (takeover) recipe.takeover = takeover;
  const native = linkTarget(fm.native);
  if (native) recipe.native = native;
  const register = str(fm.register);
  if (register && REGISTERS.includes(register as Register)) recipe.register = register as Register;
  else if (register) problems.push(`Unknown register “${register}”.`);
  if (isObject(fm.render)) {
    const render: Partial<RecipeSettings["render"]> = {};
    const joining = str(fm.render.joining);
    if (joining && JOININGS.includes(joining as Joining)) render.joining = joining as Joining;
    else if (joining) problems.push(`Unknown joining “${joining}”.`);
    const hyphens = bool(fm.render["linking-hyphens"]);
    if (hyphens !== undefined) render.linkingHyphens = hyphens;
    const etymology = bool(fm.render.etymology);
    if (etymology !== undefined) render.etymology = etymology;
    recipe.render = render;
  }
  return { recipe, problems };
}

/**
 * §7: every setting the derived recipe leaves unset comes from the template — each shape and
 * render setting, each slot and each generic override separately.
 */
export function mergeRecipe(derived: RecipePartial, template: RecipePartial): RecipePartial {
  return {
    setting: derived.setting ?? template.setting,
    template: derived.template,
    templateOf: derived.templateOf,
    shape: { ...template.shape, ...derived.shape },
    slots: { ...template.slots, ...derived.slots },
    generics: { ...template.generics, ...derived.generics },
    register: derived.register ?? template.register,
    render: { ...template.render, ...derived.render },
    takeover: derived.takeover ?? template.takeover,
    native: derived.native ?? template.native,
  };
}

export function withDefaults(r: RecipePartial): RecipeSettings {
  return {
    setting: r.setting ?? RECIPE_DEFAULTS.setting,
    template: r.template ?? false,
    ...(r.templateOf ? { templateOf: r.templateOf } : {}),
    shape: { ...RECIPE_DEFAULTS.shape, ...r.shape },
    slots: { ...r.slots },
    generics: { ...r.generics },
    register: r.register ?? RECIPE_DEFAULTS.register,
    render: { ...RECIPE_DEFAULTS.render, ...r.render },
    ...(r.takeover ? { takeover: r.takeover } : {}),
    ...(r.native ? { native: r.native } : {}),
  };
}

/** §7 checks, then the merge. A missing template, a chain, or a template with template-of stops generation. */
export function applyRecipeTemplate(
  derived: RecipePartial,
  template: RecipePartial | undefined,
  name: string,
): { recipe: RecipePartial; error?: string } {
  if (!derived.templateOf) return { recipe: derived };
  if (derived.template) return { recipe: derived, error: `“${name}” is a template, so it can't use template-of.` };
  if (!template) return { recipe: derived, error: `Template “${derived.templateOf}” is missing.` };
  if (template.templateOf) {
    return { recipe: derived, error: `Template “${derived.templateOf}” has its own template; only one level is allowed.` };
  }
  return { recipe: mergeRecipe(derived, template) };
}

/** Writes a recipe back to a frontmatter object (only the settings present). */
export function recipeToFrontmatter(r: RecipePartial): Record<string, unknown> {
  const out: Record<string, unknown> = { type: "recipe", setting: r.setting ?? "" };
  if (r.template) out.template = true;
  if (r.templateOf) out["template-of"] = `[[${r.templateOf}]]`;
  if (r.shape && Object.keys(r.shape).length > 0) {
    // Tribal brief §19.1: "unknown" is the default and is never written.
    const { biome, ...rest } = r.shape;
    out.shape = biome && biome !== "unknown" ? { ...rest, biome } : rest;
  }
  if (r.slots && Object.keys(r.slots).length > 0) {
    out.slots = Object.fromEntries(
      Object.entries(r.slots).map(([id, slot]) => {
        if (slot.kind !== "sources") return [id, slot.kind];
        const value: Record<string, unknown> = {
          sources: slot.sources.map((s) => ({
            ...(s.pack ? { pack: `[[${s.pack}]]` } : {}),
            ...(s.list ? { list: `[[${s.list}]]` } : {}),
            weight: s.weight,
          })),
        };
        if (slot.mode) value.mode = slot.mode;
        if (slot.section) value.section = slot.section;
        if (slot.gender) value.gender = { ...slot.gender };
        return [id, value];
      }),
    );
  }
  if (r.generics && Object.keys(r.generics).length > 0) out.generics = { ...r.generics };
  if (r.register) out.register = r.register;
  if (r.render && Object.keys(r.render).length > 0) {
    const render: Record<string, unknown> = {};
    if (r.render.joining) render.joining = r.render.joining;
    if (r.render.linkingHyphens !== undefined) render["linking-hyphens"] = r.render.linkingHyphens;
    if (r.render.etymology !== undefined) render.etymology = r.render.etymology;
    out.render = render;
  }
  if (r.takeover) out.takeover = `[[${r.takeover}]]`;
  if (r.native) out.native = `[[${r.native}]]`;
  return out;
}

/**
 * The british place names module's fixed built-in recipe (river brief §2): organic shapes in the
 * chosen region (a region code, or undefined for All Britain), modern words, balanced joining,
 * linking hyphens, no slots mapped.
 */
export function britishPlaceNamesRecipe(region: string | undefined): RecipeSettings {
  return withDefaults({
    shape: { part: "organic", region: region ?? "all-britain", feature: "any" },
    register: "modern",
    render: { joining: "balanced", linkingHyphens: true, etymology: false },
  });
}

/**
 * The exploration and empire expansion place names modules' fixed built-in recipe (river brief §3):
 * colonial part 2 (`new-land`) or 2a (`established`) with the module's tradition and context
 * (undefined for General and none), modern words, balanced joining, linking hyphens, no slots.
 * A biome (Tribal brief §19.4) fills native wildlife and plants; undefined leaves placeholders.
 */
export function colonialPlaceNamesRecipe(
  part: "new-land" | "established",
  tradition: string | undefined,
  context: string | undefined,
  biome?: string,
): RecipeSettings {
  return withDefaults({
    shape: { part, tradition: tradition ?? "general", context: context ?? "none", biome: biome ?? "unknown", feature: "any" },
    register: "modern",
    render: { joining: "balanced", linkingHyphens: true, etymology: false },
  });
}
