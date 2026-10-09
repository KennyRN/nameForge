// Module presets (Presets brief §7.2): a module's setup saved as a note that runs as-is. Tribal
// names is the only module with its own preset type; place-name presets are recipes (§7.1).
// No Obsidian imports: the frontmatter is flat `key: value` lines.

import { findBiome, TERRAIN_CHOICES } from "./biomes";
import { findTradition, TRIBAL_GROUP_TYPES, TRIBAL_PERSPECTIVES, TRIBAL_REGISTERS } from "./tribes/engine";
import { type TribalSlotFields, tribalSlotFill } from "./tribes/slotFill";

export const TRIBAL_PRESET_MODULE = "tribal-names";

export interface TribalPreset {
  packName: string;
  setting: string;
  description: string;
  tradition: string;
  /** "homeland", a built-in biome id, or a biome pack link "[[Salt Marshes]]". */
  biome: string;
  /** The local tribal sentence's terrain choice (§7.2: "store them too"). */
  terrain: string;
  register: string;
  groupType: string;
  perspective: string;
  hostile: boolean;
}

export const TRIBAL_PRESET_DEFAULTS: Omit<TribalPreset, "packName" | "setting" | "description"> = {
  tradition: "general",
  biome: "homeland",
  terrain: "any",
  register: "plain",
  groupType: "any",
  perspective: "any",
  hostile: false,
};

const FRONTMATTER = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

/** The frontmatter's flat fields, unquoted. */
function fields(content: string): { values: Record<string, string>; body: string } | undefined {
  const fm = content.match(FRONTMATTER);
  if (!fm) return undefined;
  const values: Record<string, string> = {};
  for (const line of fm[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (m) values[m[1]] = m[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
  return { values, body: content.slice(fm[0].length) };
}

export function isModulePresetContent(content: string): boolean {
  return fields(content)?.values.type === "module-preset";
}

/** §7.2: a preset's values; unknown values are reported and take their defaults. */
export function parseModulePreset(content: string, fileName: string): { preset?: TribalPreset; problems: string[] } {
  const parsed = fields(content);
  const problems: string[] = [];
  if (!parsed || parsed.values.type !== "module-preset") return { problems: ["This note isn't a module preset."] };
  const { values, body } = parsed;
  if (values.module !== TRIBAL_PRESET_MODULE) {
    problems.push(`Unknown module “${values.module ?? ""}”.`);
    return { problems };
  }
  const d = TRIBAL_PRESET_DEFAULTS;
  const pick = (key: string, fallback: string, ok: (v: string) => boolean): string => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const hostileRaw = values.hostile;
  let hostile = d.hostile;
  if (hostileRaw === "true" || hostileRaw === "false") hostile = hostileRaw === "true";
  else if (hostileRaw) problems.push(`Unknown hostile “${hostileRaw}”.`);
  return {
    preset: {
      packName: values.packName || fileName,
      setting: values.setting ?? "",
      description: body.trim(),
      tradition: pick("tradition", d.tradition, (v) => !!findTradition(v)),
      biome: pick("biome", d.biome, (v) => v === "homeland" || !!findBiome(v) || /^\[\[.+\]\]$/.test(v)),
      terrain: pick("terrain", d.terrain, (v) => TERRAIN_CHOICES.some((t) => t.id === v) || /^[a-z0-9-]+$/.test(v)),
      register: pick("register", d.register, (v) => (TRIBAL_REGISTERS as readonly string[]).includes(v)),
      groupType: pick("groupType", d.groupType, (v) => v === "any" || TRIBAL_GROUP_TYPES.some((g) => g.key === v)),
      perspective: pick("perspective", d.perspective, (v) => v === "any" || TRIBAL_PERSPECTIVES.includes(v)),
      hostile,
    },
    problems,
  };
}

/** §7.2: the note for a preset, every key written. */
export function modulePresetContent(preset: TribalPreset): string {
  const quote = (v: string) => (/^\[\[|[:#]/.test(v) ? `"${v}"` : v);
  return [
    "---",
    "type: module-preset",
    `module: ${TRIBAL_PRESET_MODULE}`,
    `packName: ${preset.packName}`,
    `setting: ${preset.setting}`,
    `tradition: ${preset.tradition}`,
    `biome: ${quote(preset.biome)}`,
    `terrain: ${preset.terrain}`,
    `register: ${preset.register}`,
    `groupType: ${preset.groupType}`,
    `perspective: ${preset.perspective}`,
    `hostile: ${preset.hostile}`,
    "---",
    "",
    preset.description.trim(),
    "",
  ].join("\n");
}

// ── Presets as sources (§10) ─────────────────────────────────────────────────

/**
 * §10.1: what a tribal preset gives a recipe slot. The slot keeps its templates, length and
 * article (Tribal brief §20.2); the preset's group type and register apply only where the slot
 * allows them (slotFill checks), and hostile names are always off. A biome pack link can't be
 * used in a slot, so it falls back to the recipe's biome, as homeland does.
 */
export function tribalPresetSlot(preset: TribalPreset): { tradition: string } & TribalSlotFields {
  return {
    tradition: preset.tradition,
    ...(preset.biome !== "homeland" && findBiome(preset.biome) ? { biome: preset.biome } : {}),
    ...(preset.terrain !== "any" ? { terrain: preset.terrain } : {}),
    ...(preset.groupType !== "any" ? { groupType: preset.groupType } : {}),
    ...(preset.perspective !== "any" ? { perspective: preset.perspective } : {}),
    ...(preset.register === "plain" || preset.register === "administrative" ? { register: preset.register } : {}),
  };
}

/** §10.1: a linked preset's note, or why it can't be used (the slot then renders its placeholder). */
export function readTribalPresetSource(name: string, content: string | null): { preset: TribalPreset } | { notice: string } {
  if (content === null) return { notice: `Preset “${name}” is missing.` };
  const parsed = isModulePresetContent(content) ? parseModulePreset(content, name).preset : undefined;
  if (!parsed) return { notice: `“${name}” isn't a tribes and kin groups preset.` };
  return { preset: parsed };
}

/** §10.2: a `//` line's draw from a preset: the colonial column of §20.2, with the preset's settings. */
export function tribalPresetDraw(preset: TribalPreset): (rng: () => number) => string {
  const { tradition, ...fields } = tribalPresetSlot(preset);
  return (rng) => tribalSlotFill({ tradition, part: "new-land", fields }, rng).text;
}
