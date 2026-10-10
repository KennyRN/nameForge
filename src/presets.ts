// Module presets (Presets brief §7.2, Group brief §13): a module's setup saved as a note that runs
// as-is. Tribes and kin groups and the group-name modules have their own preset type; place-name
// presets are recipes (Presets brief §7.1).
// No Obsidian imports: the frontmatter is flat `key: value` lines.

import { findBiome, TERRAIN_CHOICES } from "./biomes";
import { findTradition, TRIBAL_GROUP_TYPES, TRIBAL_PERSPECTIVES, TRIBAL_REGISTERS } from "./tribes/engine";
import { type TribalSlotFields, tribalSlotFill } from "./tribes/slotFill";
import {
  BYNAME_CULTURES,
  type BynameGender,
  type BynameLanguage,
  type BynameLength,
  type BynameModule,
  type BynameSource,
  moduleKinds,
} from "./bynames/engine";
import { findFamily, GROUP_TONES, type GroupForm, type GroupFront, type GroupGenre, type GroupPeople, type GroupToneChoice } from "./groups/engine";

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
export function parseModulePreset(
  content: string,
  fileName: string,
): { preset?: TribalPreset; group?: GroupPreset; byname?: BynamePreset; problems: string[] } {
  const parsed = fields(content);
  const problems: string[] = [];
  if (!parsed || parsed.values.type !== "module-preset") return { problems: ["This note isn't a module preset."] };
  const { values, body } = parsed;
  // Group brief §13: group-name presets sit beside tribal ones.
  if (values.module === GROUP_PRESET_MODULE) return parseGroupPreset(values, body, fileName);
  // Bynames brief §12: byname presets too.
  if (values.module === BYNAME_PRESET_MODULE) return parseBynamePreset(values, body, fileName);
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
export function modulePresetContent(preset: TribalPreset | GroupPreset | BynamePreset): string {
  if ("bynameModule" in preset) return bynamePresetContent(preset);
  if ("family" in preset) return groupPresetContent(preset);
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

// ── Group-name presets (Group brief §13) ────────────────────────────────────

export const GROUP_PRESET_MODULE = "group-names";

export interface GroupPreset {
  packName: string;
  setting: string;
  description: string;
  family: string;
  tradition: string;
  /** "any" or a type key of the family. */
  groupType: string;
  genre: GroupGenre;
  fantastic: boolean;
  form: GroupForm;
  front: GroupFront;
  people: GroupPeople;
  /** Tone brief §6.2: older presets without these keys load as "any" and false. */
  tone: GroupToneChoice;
  series: boolean;
}

function parseGroupPreset(values: Record<string, string>, body: string, fileName: string): { group?: GroupPreset; problems: string[] } {
  const problems: string[] = [];
  const family = findFamily(values.family ?? "");
  if (!family) {
    problems.push(`Unknown family “${values.family ?? ""}”.`);
    return { problems };
  }
  const pick = <T extends string>(key: string, fallback: T, ok: (v: string) => boolean): T => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v as T;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const flag = (key: string): boolean => {
    const v = values[key];
    if (v === "true" || v === "false") return v === "true";
    if (v) problems.push(`Unknown ${key} “${v}”.`);
    return false;
  };
  const groupType = pick("groupType", "any", (v) => v === "any" || family.types.some((t) => t.key === v));
  let series = flag("series");
  // Tone brief §6.2: a series needs a type; with Any the preset runs as separate names.
  if (series && groupType === "any") {
    problems.push("Series needs a type.");
    series = false;
  }
  return {
    group: {
      packName: values.packName || fileName,
      setting: values.setting ?? "",
      description: body.trim(),
      family: family.key,
      tradition: pick("tradition", "general", (v) => !!findTradition(v)),
      groupType,
      genre: pick<GroupGenre>("genre", "fantasy", (v) => ["fantasy", "modern", "scifi"].includes(v)),
      fantastic: flag("fantastic"),
      form: pick<GroupForm>("form", "any", (v) => ["any", "formal", "everyday"].includes(v)),
      front: pick<GroupFront>("front", "say", (v) => ["say", "hide", "may"].includes(v)),
      people: pick<GroupPeople>("people", "placeholders", (v) => ["placeholders", "invented"].includes(v)),
      tone: pick<GroupToneChoice>("tone", "any", (v) => v === "any" || (GROUP_TONES as string[]).includes(v)),
      series,
    },
    problems,
  };
}

function groupPresetContent(preset: GroupPreset): string {
  return [
    "---",
    "type: module-preset",
    `module: ${GROUP_PRESET_MODULE}`,
    `family: ${preset.family}`,
    `packName: ${preset.packName}`,
    `setting: ${preset.setting}`,
    `tradition: ${preset.tradition}`,
    `groupType: ${preset.groupType}`,
    `genre: ${preset.genre}`,
    `fantastic: ${preset.fantastic}`,
    `form: ${preset.form}`,
    `front: ${preset.front}`,
    `people: ${preset.people}`,
    `tone: ${preset.tone}`,
    `series: ${preset.series}`,
    "---",
    "",
    preset.description.trim(),
    "",
  ].join("\n");
}

// ── Byname presets (Bynames brief §12) ──────────────────────────────────────

export const BYNAME_PRESET_MODULE = "bynames";

export interface BynamePreset {
  packName: string;
  setting: string;
  description: string;
  bynameModule: BynameModule;
  culture: string;
  kind: string;
  genre: GroupGenre;
  fantastic: boolean;
  tone: GroupToneChoice;
  language: BynameLanguage;
  gender: BynameGender;
  length: BynameLength;
  source: BynameSource;
  /** The pack's name, with source "pack". */
  pack?: string;
  /** A heading, "gender" or "whole". */
  section: string;
}

function parseBynamePreset(values: Record<string, string>, body: string, fileName: string): { byname?: BynamePreset; problems: string[] } {
  const problems: string[] = [];
  const module = values.bynameModule as BynameModule;
  if (!["epithets", "titles", "familyNames"].includes(module)) {
    problems.push(`Unknown bynameModule “${values.bynameModule ?? ""}”.`);
    return { problems };
  }
  const pick = <T extends string>(key: string, fallback: T, ok: (v: string) => boolean): T => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v as T;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const fantasticRaw = values.fantastic;
  if (fantasticRaw && fantasticRaw !== "true" && fantasticRaw !== "false") problems.push(`Unknown fantastic “${fantasticRaw}”.`);
  const culture = pick("culture", "general", (v) => BYNAME_CULTURES.some((c) => c.key === v));
  return {
    byname: {
      packName: values.packName || fileName,
      setting: values.setting ?? "",
      description: body.trim(),
      bynameModule: module,
      culture,
      kind: pick("kind", "any", (v) => v === "any" || moduleKinds(module).some((k) => k.key === v)),
      genre: pick<GroupGenre>("genre", "fantasy", (v) => ["fantasy", "modern", "scifi"].includes(v)),
      fantastic: fantasticRaw === "true",
      tone: pick<GroupToneChoice>("tone", "any", (v) => v === "any" || (GROUP_TONES as string[]).includes(v)),
      language: pick<BynameLanguage>("language", "english", (v) => ["english", "native", "mixed"].includes(v)),
      gender: pick<BynameGender>("gender", "anyone", (v) => ["men", "women", "anyone"].includes(v)),
      length: pick<BynameLength>("length", "single", (v) => ["single", "full"].includes(v)),
      source: pick<BynameSource>("source", "placeholder", (v) => ["placeholder", "pack", "none"].includes(v)),
      ...(values.pack ? { pack: values.pack.replace(/^\[\[|\]\]$/g, "") } : {}),
      section: values.section || "gender",
    },
    problems,
  };
}

function bynamePresetContent(preset: BynamePreset): string {
  return [
    "---",
    "type: module-preset",
    `module: ${BYNAME_PRESET_MODULE}`,
    `bynameModule: ${preset.bynameModule}`,
    `packName: ${preset.packName}`,
    `setting: ${preset.setting}`,
    `culture: ${preset.culture}`,
    `kind: ${preset.kind}`,
    `genre: ${preset.genre}`,
    `fantastic: ${preset.fantastic}`,
    `tone: ${preset.tone}`,
    `language: ${preset.language}`,
    `gender: ${preset.gender}`,
    `length: ${preset.length}`,
    `source: ${preset.source}`,
    ...(preset.pack ? [`pack: ${preset.pack}`] : []),
    `section: ${preset.section}`,
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
