// Templates in the Create Pack window: the built-in templates and which pack types each kind of
// template fills. No Obsidian imports.

import builtinData from "./data/builtin-templates.json";

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
