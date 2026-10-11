// The settlement kit's output (docs/settlement-kit-brief.md §9): the markdown block, the note's
// frontmatter and reading it back for "Regenerate settlement from note". No Obsidian imports.

import { ROUTE_ERAS, type RouteEra } from "../routes/engine";
import { PLACE_SHAPE_REGIONS } from "../placeShapes";
import { GROUP_TONES, type GroupPeople, type GroupToneChoice } from "../groups/engine";
import { KIT_CONTENTS, KIT_DETAILS, KIT_POSITIONS, KIT_SIZES, type Kit, type KitContents, type KitDetail, type KitPosition, type KitSize } from "./kit";
import { findRouteCulture } from "../routes/engine";

/** §9.1: the block: the settlement at H2, its sections at H3, empty sections left out. */
export function kitMarkdown(kit: Kit): string {
  const lines: string[] = [`## ${kit.context.town}`, `*${kit.summary.charAt(0).toUpperCase()}${kit.summary.slice(1)}.*`, ""];
  if (kit.ruler) lines.push(`**Ruler:** ${kit.ruler}`, "");
  for (const section of kit.sections) {
    if (section.entries.length === 0) continue;
    lines.push(`### ${section.title}`);
    for (const e of section.entries) {
      if (e.role) lines.push(`- **${e.role}:** ${e.text}`);
      else lines.push(`- ${e.text}${e.through ? " *(through the town)*" : ""}`);
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

/** §9.3: the settings a settlement note keeps, so the same kit can be made again. */
export interface KitNoteSettings {
  culture: string;
  era: RouteEra;
  fantastic: boolean;
  region: string;
  size: KitSize;
  position: KitPosition;
  tone: GroupToneChoice;
  contents: KitContents;
  detail: KitDetail;
  people: GroupPeople;
  seed: number;
}

export const SETTLEMENT_NOTE_TYPE = "settlement";

/** §9.3: the note: frontmatter, then the block. */
export function kitNoteContent(kit: Kit): string {
  const o = kit.options;
  return [
    "---",
    `type: ${SETTLEMENT_NOTE_TYPE}`,
    `culture: ${o.culture}`,
    `era: ${o.era}`,
    `fantastic: ${o.fantastic}`,
    `region: ${o.region ?? "all"}`,
    `size: ${o.size}`,
    `position: ${o.position}`,
    `tone: ${o.tone}`,
    `contents: ${o.contents}`,
    `detail: ${o.detail}`,
    `people: ${o.people}`,
    `seed: ${o.seed}`,
    ...(kit.context.realm ? [`realm: ${kit.context.realm}`] : []),
    "---",
    "",
    kitMarkdown(kit),
  ].join("\n");
}

/** §9.3: a settlement note's settings; problems name what was unknown (and took its default). */
export function parseKitNote(content: string): { settings?: KitNoteSettings; problems: string[] } {
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return { problems: ["This note has no frontmatter."] };
  const values: Record<string, string> = {};
  for (const line of fm[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (m) values[m[1]] = m[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
  if (values.type !== SETTLEMENT_NOTE_TYPE) return { problems: ["This note isn't a settlement."] };
  const problems: string[] = [];
  const pick = <T extends string>(key: string, fallback: T, ok: (v: string) => boolean): T => {
    const v = values[key];
    if (v === undefined || v === "") return fallback;
    if (ok(v)) return v as T;
    problems.push(`Unknown ${key} “${v}”.`);
    return fallback;
  };
  const seed = Number(values.seed);
  if (!Number.isInteger(seed) || seed < 0) problems.push(`Unknown seed “${values.seed ?? ""}”.`);
  const fantastic = values.fantastic === "true";
  if (values.fantastic && values.fantastic !== "true" && values.fantastic !== "false") problems.push(`Unknown fantastic “${values.fantastic}”.`);
  return {
    settings: {
      culture: pick("culture", "norman-british", (v) => !!findRouteCulture(v)),
      era: pick<RouteEra>("era", "MD", (v) => ROUTE_ERAS.some((e) => e.code === v)),
      fantastic,
      region: pick("region", "all", (v) => v === "all" || PLACE_SHAPE_REGIONS.some((r) => r.code === v)),
      size: pick<KitSize>("size", "town", (v) => KIT_SIZES.includes(v as KitSize)),
      position: pick<KitPosition>("position", "inland", (v) => KIT_POSITIONS.some((p) => p.key === v)),
      tone: pick<GroupToneChoice>("tone", "any", (v) => v === "any" || (GROUP_TONES as string[]).includes(v)),
      contents: pick<KitContents>("contents", "whole", (v) => v in KIT_CONTENTS),
      detail: pick<KitDetail>("detail", "standard", (v) => KIT_DETAILS.includes(v as KitDetail)),
      people: pick<GroupPeople>("people", "placeholders", (v) => v === "placeholders" || v === "invented"),
      seed: Number.isInteger(seed) && seed >= 0 ? seed : 0,
    },
    problems,
  };
}

/** §9.3: "{town}.md", or "{town} 2.md", "{town} 3.md" … when the name is taken; never overwrites. */
export function freeNotePath(folder: string, town: string, exists: (path: string) => boolean): string {
  const base = town.replace(/[\\/:*?"<>|#^[\]]/g, "").trim() || "Settlement";
  const dir = folder.replace(/\/+$/, "");
  const at = (name: string) => (dir ? `${dir}/${name}.md` : `${name}.md`);
  if (!exists(at(base))) return at(base);
  for (let n = 2; ; n++) if (!exists(at(`${base} ${n}`))) return at(`${base} ${n}`);
}
