// Name parser utilities

export interface ParsedName {
  original: string;
  parts: string[];
  pattern: string;
}

export interface NamesFileData {
  packName: string;
  names: string[];
  type: "breakdownPack" | "listPack" | "compoundBreakdownPack" | "compoundListPack";
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

export function normalizeNamesInput(input: string): string[] {
  const rawSegments = input
    .replace(/\r/g, "")
    .split(/\n+/)
    .flatMap((line) => line.split(/\s*(?:,|;|\||\/)\s*/))
    .flatMap((line) => line.split(/\s+(?:and|&)\s+/i))
    .map((segment) => segment.trim())
    .filter(Boolean)
    .filter((segment) => !/^(and|&)$/i.test(segment))
    .map((segment) => segment.replace(/^[-*•\s"'`]+|[-*•\s"'`]+$/g, ""));

  return rawSegments.filter(Boolean);
}

export function isValidNamePackContent(content: string): boolean {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  if (!frontmatterMatch) {
    return false;
  }

  const frontmatter = frontmatterMatch[1];
  return /^name:\s*(.+)$/m.test(frontmatter);
}

export function parseNamesFileContent(content: string): NamesFileData {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  let packName = "NameWright";
  let body = content;
  let type: NamesFileData["type"] = "breakdownPack";

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const packMatch = frontmatter.match(/^name:\s*(.+)$/m);
    if (packMatch) {
      packName = packMatch[1].trim().replace(/^['"]|['"]$/g, "");
    }

    const typeMatch = frontmatter.match(/^type:\s*(.+)$/m);
    if (typeMatch) {
      const rawType = typeMatch[1].trim().replace(/^['"]|['"]$/g, "");
      if (["breakdownPack", "listPack", "compoundBreakdownPack", "compoundListPack"].includes(rawType)) {
        type = rawType as NamesFileData["type"];
      }
    }

    body = content.slice(frontmatterMatch[0].length);
  }

  return {
    packName,
    names: normalizeNamesInput(body),
    type,
  };
}

export function createNamesFileContent(packName: string, names: string[], type: NamesFileData["type"] = "breakdownPack"): string {
  const safePackName = (packName || "NameWright").trim().replace(/\s+/g, " ");
  return `---\ntype: ${type}\nname: ${safePackName}\n---\n\n${names.join("\n")}\n`;
}