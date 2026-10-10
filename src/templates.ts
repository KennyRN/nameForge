// Templates in the Create Pack window: the built-in templates and which pack types each kind of
// template fills. No Obsidian imports.

import builtinData from "./data/builtin-templates.json";
import { createCompoundNamesFileContent, createNamesFileContent } from "./nameParser";
import { compoundPartFromText } from "./packs/compound";
import { parseNameSections } from "./packs/sections";

export type TemplateType = "people" | "people-compound" | "place";

export interface BuiltinTemplate {
  name: string;
  type: TemplateType;
  /** People and place templates: the names. */
  items?: string[];
  /** People templates split into `##` lists (e.g. male and female), each with its names. */
  sections?: { name: string; items: string[] }[];
  /** People compound templates: the parts, each a list of name elements. */
  parts?: string[][];
  /** Compound templates: a part's `##` titles and their elements, where the part has titles. */
  partSections?: ({ name: string; items: string[] }[] | null)[];
}

export const BUILTIN_TEMPLATES = builtinData as BuiltinTemplate[];

/** The kind of template a pack type takes: none for mix packs, the wizard and biomes. */
export function templateTypeFor(packType: string): TemplateType | undefined {
  if (packType === "breakdownPack" || packType === "listPack") return "people";
  if (packType === "compoundPack") return "people-compound";
  if (packType === "placePack") return "place";
  return undefined;
}

export function builtinTemplates(type: TemplateType): BuiltinTemplate[] {
  return BUILTIN_TEMPLATES.filter((t) => t.type === type);
}

/** A template's text for the box: its names, or each section under its `##` heading. */
export function templateText(t: BuiltinTemplate): string {
  if (t.sections) return t.sections.map((s) => `## ${s.name}\n${s.items.join("\n")}`).join("\n\n");
  return (t.items ?? []).join("\n");
}

/** How many names a template holds, across its sections. */
export function templateNameCount(t: BuiltinTemplate): number {
  return t.sections ? t.sections.reduce((n, s) => n + s.items.length, 0) : t.items?.length ?? 0;
}

/** A compound template's part boxes: each part's elements, or its titles with their elements. */
export function templatePartTexts(t: BuiltinTemplate): string[] | undefined {
  return t.parts?.map((part, i) => {
    const sections = t.partSections?.[i];
    return sections ? sections.map((s) => `## ${s.name}\n${s.items.join("\n")}`).join("\n\n") : part.join("\n");
  });
}

// ── Example packs (shown in the pack list until the user has packs of their own) ──

/** Example packs' paths start with this, so they can never match a vault file. */
export const EXAMPLE_PACK_PREFIX = "nameforge-example:/";

export interface ExamplePack {
  path: string;
  content: string;
}

const builtin = (name: string) => BUILTIN_TEMPLATES.find((t) => t.name === name)!;

/**
 * Victorian, England as a List pack and as a Breakdown pack, and Orc as a combined compound pack
 * (part 2 used sometimes). Each keeps its titles, so the sections sentence offers male, female
 * and (for Orc) child.
 */
export function examplePacks(): ExamplePack[] {
  const victorian = builtin("Victorian, England");
  const sectioned = parseNameSections(templateText(victorian)) ?? undefined;
  const names = (victorian.sections ?? []).flatMap((s) => s.items);
  const orc = builtin("Orc");
  return [
    { path: `${EXAMPLE_PACK_PREFIX}Victorian, England (list)`, content: createNamesFileContent("Victorian, England (list)", names, "listPack", { sectioned }) },
    { path: `${EXAMPLE_PACK_PREFIX}Victorian, England (breakdown)`, content: createNamesFileContent("Victorian, England (breakdown)", names, "breakdownPack", { sectioned }) },
    {
      path: `${EXAMPLE_PACK_PREFIX}Orc`,
      content: createCompoundNamesFileContent("Orc", (templatePartTexts(orc) ?? []).map(compoundPartFromText), "combined", "joined", undefined, {
        partUse: ["all", "sometimes", "all"],
        partGenerators: ["breakdown", "breakdown", "list"],
      }),
    },
  ];
}

export const isExamplePackPath = (path: string | undefined) => !!path && path.startsWith(EXAMPLE_PACK_PREFIX);
