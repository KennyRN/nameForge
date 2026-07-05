// Name parser utilities

import { extractNamesFromMarkdown } from "./markov";

export interface ParsedName {
  original: string;
  parts: string[];
  pattern: string;
}

export interface NamesFileData {
  packName: string;
  names: string[];
  packType: "breakdownPack" | "listPack" | "compoundPack" | "placePack";
  compoundParts?: 2 | 3;
  compoundGenerator?: "breakdown" | "list";
  compoundJoining?: "joined" | "spaced";
  parts?: string[][];
  /** The fictional world/setting this pack belongs to. Reserved for future use; blank by default. */
  setting: string;
}

export function parseName(name: string): ParsedName {
  const normalized = name.trim();
  const parts = normalized.split(/\s+/);
  const pattern = parts.map((part) => {
    return part.split("").map((char) => {
      if (/[aeiou]/i.test(char)) return "V";
      if (/[^a-z]/i.test(char)) return char;
      return "C";
    }).join("");
  }).join(" ");

  return {
    original: normalized,
    parts,
    pattern,
  };
}

export function namesToPattern(names: string[]): string[] {
  return names.map((name) => parseName(name).pattern);
}

export function isValidNamePackContent(content: string): boolean {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  if (!frontmatterMatch) {
    return false;
  }

  const frontmatter = frontmatterMatch[1];
  return /^type:\s*namePack\s*$/m.test(frontmatter) && /^packName:\s*(.+)$/m.test(frontmatter);
}

export function parseNamesFileContent(content: string): NamesFileData {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  let packName = "nameForge";
  let body = content;
  let packType: NamesFileData["packType"] = "breakdownPack";
  let setting = "";

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const packMatch = frontmatter.match(/^packName:\s*(.+)$/m);
    if (packMatch) {
      packName = packMatch[1].trim().replace(/^['"]|['"]$/g, "");
    }

    const packTypeMatch = frontmatter.match(/^packType:\s*(.+)$/m);
    if (packTypeMatch) {
      const rawPackType = packTypeMatch[1].trim().replace(/^['"]|['"]$/g, "");
      if (["breakdownPack", "listPack", "compoundPack", "placePack"].includes(rawPackType)) {
        packType = rawPackType as NamesFileData["packType"];
      }
    }

    const settingMatch = frontmatter.match(/^setting:\s*(.*)$/m);
    if (settingMatch) {
      setting = settingMatch[1].trim().replace(/^['"]|['"]$/g, "");
    }

    body = content.slice(frontmatterMatch[0].length);

    if (packType === "compoundPack") {
      const compoundPartsMatch = frontmatter.match(/^compoundParts:\s*(.+)$/m);
      const compoundParts = compoundPartsMatch && compoundPartsMatch[1].trim() === "3" ? 3 : 2;

      const compoundGeneratorMatch = frontmatter.match(/^compoundGenerator:\s*(.+)$/m);
      const compoundGenerator = compoundGeneratorMatch && compoundGeneratorMatch[1].trim().replace(/^['"]|['"]$/g, "") === "list" ? "list" : "breakdown";

      const compoundJoiningMatch = frontmatter.match(/^compoundJoining:\s*(.+)$/m);
      const compoundJoining = compoundJoiningMatch && compoundJoiningMatch[1].trim().replace(/^['"]|['"]$/g, "") === "spaced" ? "spaced" : "joined";

      const parts = splitCompoundPartSections(body, compoundParts).map((section) => extractNamesFromMarkdown(section));

      return {
        packName,
        names: [],
        packType,
        compoundParts,
        compoundGenerator,
        compoundJoining,
        parts,
        setting,
      };
    }
  }

  return {
    packName,
    names: extractNamesFromMarkdown(body),
    packType,
    setting,
  };
}

function splitCompoundPartSections(body: string, partCount: 2 | 3): string[] {
  const sections: string[] = [];
  const headingRegex = /^##\s*Part\s*[123]\s*$/gm;
  const matches = Array.from(body.matchAll(headingRegex));

  for (let i = 0; i < partCount; i++) {
    const match = matches[i];
    if (!match) {
      sections.push("");
      continue;
    }
    const start = match.index + match[0].length;
    const end = matches[i + 1]?.index ?? body.length;
    sections.push(body.slice(start, end));
  }

  return sections;
}

export function createNamesFileContent(packName: string, names: string[], packType: NamesFileData["packType"] = "breakdownPack"): string {
  const safePackName = (packName || "nameForge").trim().replace(/\s+/g, " ");
  return `---\ntype: namePack\npackType: ${packType}\npackName: ${safePackName}\nsetting: \n---\n\n${names.join("\n")}\n`;
}

export function createCompoundNamesFileContent(
  packName: string,
  parts: string[][],
  generator: "breakdown" | "list",
  joining: "joined" | "spaced"
): string {
  const safePackName = (packName || "nameForge").trim().replace(/\s+/g, " ");
  const partsSections = parts
    .map((partNames, index) => `## Part ${index + 1}\n\n${partNames.join("\n")}`)
    .join("\n\n");

  return `---\ntype: namePack\npackType: compoundPack\ncompoundParts: ${parts.length}\ncompoundGenerator: ${generator}\ncompoundJoining: ${joining}\npackName: ${safePackName}\nsetting: \n---\n\n${partsSections}\n`;
}

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;

export function sanitizePackNameForFilename(packName: string): string {
  const trimmed = (packName || "nameForge").trim().replace(/\s+/g, " ");
  const cleaned = trimmed.replace(INVALID_FILENAME_CHARS, "-").trim();
  return cleaned || "nameForge";
}