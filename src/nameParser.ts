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
  packType: "breakdownPack" | "listPack" | "compoundBreakdownPack" | "compoundListPack";
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
  let packName = "NameWright";
  let body = content;
  let packType: NamesFileData["packType"] = "breakdownPack";

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const packMatch = frontmatter.match(/^packName:\s*(.+)$/m);
    if (packMatch) {
      packName = packMatch[1].trim().replace(/^['"]|['"]$/g, "");
    }

    const packTypeMatch = frontmatter.match(/^packType:\s*(.+)$/m);
    if (packTypeMatch) {
      const rawPackType = packTypeMatch[1].trim().replace(/^['"]|['"]$/g, "");
      if (["breakdownPack", "listPack", "compoundBreakdownPack", "compoundListPack"].includes(rawPackType)) {
        packType = rawPackType as NamesFileData["packType"];
      }
    }

    body = content.slice(frontmatterMatch[0].length);
  }

  return {
    packName,
    names: extractNamesFromMarkdown(body),
    packType,
  };
}

export function createNamesFileContent(packName: string, names: string[], packType: NamesFileData["packType"] = "breakdownPack"): string {
  const safePackName = (packName || "NameWright").trim().replace(/\s+/g, " ");
  return `---\ntype: namePack\npackType: ${packType}\npackName: ${safePackName}\n---\n\n${names.join("\n")}\n`;
}

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;

export function sanitizePackNameForFilename(packName: string): string {
  const trimmed = (packName || "NameWright").trim().replace(/\s+/g, " ");
  const cleaned = trimmed.replace(INVALID_FILENAME_CHARS, "-").trim();
  return cleaned || "NameWright";
}