// Templates in the Create Pack window: the built-in templates and which pack types each kind of
// template fills. No Obsidian imports.

import builtinData from "./data/builtin-templates.json";

export type TemplateType = "people" | "people-compound" | "place";

export interface BuiltinTemplate {
  name: string;
  type: TemplateType;
  /** People and place templates: the names. */
  items?: string[];
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
