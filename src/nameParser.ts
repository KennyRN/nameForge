// Name parser utilities

import { buildWeightedCorpus, extractNamesFromMarkdown, MixSourceCorpus } from "./markov";

export interface ParsedName {
  original: string;
  parts: string[];
  pattern: string;
}

export interface MixSourceRef {
  packName: string;
  weight: number;
}

export interface NamesFileData {
  packName: string;
  names: string[];
  packType: "breakdownPack" | "listPack" | "compoundPack" | "placePack" | "mixPack";
  compoundParts?: 2 | 3;
  compoundGenerator?: "breakdown" | "list";
  compoundJoining?: "joined" | "spaced";
  parts?: string[][];
  mixSources?: MixSourceRef[];
  /** The fictional world/setting this pack belongs to. Reserved for future use; blank by default. */
  setting: string;
}

export interface MixPackIndexEntry {
  path: string;
  parsed: NamesFileData;
}

const PACK_TYPES = ["breakdownPack", "listPack", "compoundPack", "placePack", "mixPack"] as const;

function isPackType(value: string): value is NamesFileData["packType"] {
  return (PACK_TYPES as readonly string[]).includes(value);
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
      if (isPackType(rawPackType)) {
        packType = rawPackType;
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

    if (packType === "mixPack") {
      return {
        packName,
        names: [],
        packType,
        mixSources: parseMixSourceLines(body),
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
  const matches = [...body.matchAll(headingRegex)];

  for (let i = 0; i < partCount; i++) {
    const match = matches[i];
    if (!match || match.index === undefined) {
      sections.push("");
      continue;
    }
    const start = match.index + match[0].length;
    const nextIndex = matches[i + 1]?.index;
    const end = nextIndex === undefined ? body.length : nextIndex;
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

export function createMixNamesFileContent(packName: string, sources: MixSourceRef[]): string {
  const safePackName = (packName || "nameForge").trim().replace(/\s+/g, " ");
  const sourceLines = sources
    .map((source) => `- [[${source.packName}]] ${formatMixWeight(source.weight)}`)
    .join("\n");

  return `---\ntype: namePack\npackType: mixPack\npackName: ${safePackName}\nsetting: \n---\n\n## Sources\n\n${sourceLines}\n`;
}

function formatMixWeight(weight: number): string {
  if (!Number.isFinite(weight) || weight <= 0) return "1";
  return Number.isInteger(weight) ? String(weight) : String(weight);
}

function parseMixSourceLines(body: string): MixSourceRef[] {
  const headingMatch = body.match(/^##\s*Sources\s*$/im);
  if (!headingMatch || headingMatch.index === undefined) {
    return [];
  }

  const afterHeading = body.slice(headingMatch.index + headingMatch[0].length);
  const nextHeading = afterHeading.search(/^##\s+/m);
  const section = nextHeading >= 0 ? afterHeading.slice(0, nextHeading) : afterHeading;
  const sources: MixSourceRef[] = [];

  for (const line of section.split(/\r?\n/)) {
    const parsed = parseMixSourceLine(line);
    if (parsed) sources.push(parsed);
  }

  return sources;
}

export function parseMixSourceLine(line: string): MixSourceRef | null {
  const trimmed = line
    .trim()
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const wikiMatch = trimmed.match(/^\[\[([^\]]+)\]\]\s*(.*)$/);
  if (wikiMatch) {
    return {
      packName: mixLinkTargetToPackName(wikiMatch[1]),
      weight: parseMixWeightTail(wikiMatch[2]),
    };
  }

  const pipeMatch = trimmed.match(/^(.+?)\s*\|\s*(.*)$/);
  if (pipeMatch && pipeMatch[1].trim()) {
    return {
      packName: stripMixPackSuffix(pipeMatch[1].trim()),
      weight: parseMixWeightTail(pipeMatch[2]),
    };
  }

  const trailingNum = trimmed.match(/^(.*?)\s+(\d+(?:\.\d+)?)\s*%?\s*$/);
  if (trailingNum && trailingNum[1].trim()) {
    return {
      packName: stripMixPackSuffix(trailingNum[1].trim()),
      weight: parseMixWeightTail(trailingNum[2]),
    };
  }

  return { packName: stripMixPackSuffix(trimmed), weight: 1 };
}

function mixLinkTargetToPackName(target: string): string {
  const pipe = target.indexOf("|");
  const raw = (pipe >= 0 ? target.slice(0, pipe) : target).split("#")[0].trim();
  return stripMixPackSuffix(raw.split("/").pop() || raw);
}

function stripMixPackSuffix(value: string): string {
  return value.replace(/\.md$/i, "").trim();
}

function parseMixWeightTail(tail: string): number {
  const match = tail.trim().match(/^(\d+(?:\.\d+)?)\s*%?$/);
  if (!match) return 1;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function findPackInIndex(index: MixPackIndexEntry[], ref: string): MixPackIndexEntry | undefined {
  const normalized = stripMixPackSuffix(ref.trim());
  if (!normalized) return undefined;
  const fileName = normalized.split("/").pop() || normalized;

  return index.find((entry) => {
    if (entry.parsed.packName === normalized || entry.parsed.packName === fileName) {
      return true;
    }
    const entryFile = entry.path.split("/").pop()?.replace(/\.md$/i, "") || "";
    if (entryFile === fileName || entryFile === normalized) {
      return true;
    }
    return entry.path === normalized || entry.path.endsWith(`/${fileName}.md`);
  });
}

function namesFromParsedPack(parsed: NamesFileData): string[] {
  if (parsed.packType === "compoundPack") {
    return (parsed.parts ?? []).flat().filter((name) => name.trim().length > 0);
  }
  return parsed.names.filter((name) => name.trim().length > 0);
}

/**
 * Resolve a Mix pack's source refs into weighted name lists.
 * Nested Mix packs flatten to their weighted corpus. Cycles and missing
 * sources return `error` instead of a partial result.
 */
export function resolveMixSources(
  mixPath: string,
  mixData: NamesFileData,
  index: MixPackIndexEntry[],
  visiting: Set<string> = new Set()
): { sources: MixSourceCorpus[]; error?: string } {
  if (visiting.has(mixPath)) {
    return { sources: [], error: `Mix pack cycle involving ${mixData.packName || mixPath}.` };
  }

  visiting.add(mixPath);
  const sources: MixSourceCorpus[] = [];
  const refs = mixData.mixSources ?? [];

  for (const ref of refs) {
    const found = findPackInIndex(index, ref.packName);
    if (!found) {
      visiting.delete(mixPath);
      return { sources: [], error: `Mix source pack not found: ${ref.packName}.` };
    }
    if (found.path === mixPath) {
      visiting.delete(mixPath);
      return { sources: [], error: `Mix pack cannot include itself.` };
    }

    const nested = resolvePackToCorpus(found, index, visiting);
    if (nested.error) {
      visiting.delete(mixPath);
      return { sources: [], error: nested.error };
    }
    sources.push({ names: nested.names, weight: ref.weight });
  }

  visiting.delete(mixPath);

  if (sources.length < 2) {
    return { sources: [], error: "Mix pack needs at least two source packs." };
  }

  return { sources };
}

function resolvePackToCorpus(
  entry: MixPackIndexEntry,
  index: MixPackIndexEntry[],
  visiting: Set<string>
): { names: string[]; error?: string } {
  if (entry.parsed.packType !== "mixPack") {
    return { names: namesFromParsedPack(entry.parsed) };
  }

  const nested = resolveMixSources(entry.path, entry.parsed, index, visiting);
  if (nested.error) return { names: [], error: nested.error };
  return { names: buildWeightedCorpus(nested.sources) };
}

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;

export function sanitizePackNameForFilename(packName: string): string {
  const trimmed = (packName || "nameForge").trim().replace(/\s+/g, " ");
  const cleaned = trimmed.replace(INVALID_FILENAME_CHARS, "-").trim();
  return cleaned || "nameForge";
}