// Compound pack layout and part settings (Compound brief §3, §4.4). No Obsidian imports.
//
// Parts are marked `# Part 1/2/3` (H1); each part's `##` headings are its titles. Old packs mark
// parts `## Part N` and have no titles. Frequencies and per-part generators live in frontmatter.

import { type CompoundGenerateOptions, extractNamesFromMarkdown, generateCompoundNamesDetailed, mulberry32 } from "../markov";
import { allSectionedNames, parseNameSections, type SectionedNames, sectionNames, serialiseNameSections } from "./sections";

export type CompoundGenerator = "breakdown" | "list" | "combined";
export type CompoundPartGenerator = "breakdown" | "list";
export type CompoundUse = "all" | "most" | "often" | "sometimes" | "rarely";

/** §0: how often a part is used, as a percentage of names. */
export const COMPOUND_USE_PERCENT: Record<CompoundUse, number> = { all: 100, most: 80, often: 50, sometimes: 20, rarely: 10 };
export const COMPOUND_USES = Object.keys(COMPOUND_USE_PERCENT) as CompoundUse[];

/** §0.1: the part sentence's wording; only the first two carry "of the time". */
export const COMPOUND_USE_PHRASES: Record<CompoundUse, string> = {
  all: "all of the time",
  most: "most of the time",
  often: "often",
  sometimes: "sometimes",
  rarely: "rarely",
};

export interface CompoundPart {
  /** Every name in the part (titles included), as `parts[i]` has always held. */
  names: string[];
  /** The part's `##` titles and their names, when it has any. */
  sectioned?: SectionedNames;
}

const unquote = (v: string) => v.trim().replace(/^['"]|['"]$/g, "");

/** §3.1: `breakdown` | `list` | `combined`; anything else is `breakdown`. */
export function parseCompoundGenerator(raw: string | undefined): CompoundGenerator {
  const v = unquote(raw ?? "");
  return v === "list" || v === "combined" ? v : "breakdown";
}

/** §3.1: one word per part; missing or unknown words mean `all`. */
export function parseCompoundUse(raw: string | undefined, count: number): CompoundUse[] {
  const words = unquote(raw ?? "").split(",").map((w) => w.trim().toLowerCase());
  return Array.from({ length: count }, (_, i) => ((COMPOUND_USES as string[]).includes(words[i] ?? "") ? (words[i] as CompoundUse) : "all"));
}

/** §3.1: `breakdown` or `list` per part; missing or unknown entries mean `breakdown`. */
export function parseCompoundPartGenerators(raw: string | undefined, count: number): CompoundPartGenerator[] {
  const words = unquote(raw ?? "").split(",").map((w) => w.trim().toLowerCase());
  return Array.from({ length: count }, (_, i) => (words[i] === "list" ? "list" : "breakdown"));
}

const H1_PART = /^#\s+Part\s*([123])\s*$/gim;
const H2_PART = /^##\s*Part\s*[123]\s*$/gm;

/** Whether the body uses the new `# Part N` layout. */
export function hasH1Parts(body: string): boolean {
  return [...body.matchAll(H1_PART)].length > 0;
}

/**
 * §3.2: each part's names and titles. `# Part N` (H1) bodies give titles from each part's `##`
 * headings; old `## Part N` bodies are split as before, with no titles.
 */
export function parseCompoundBody(body: string, partCount: 2 | 3): CompoundPart[] {
  if (!hasH1Parts(body)) {
    return splitOldParts(body, partCount).map((text) => ({ names: extractNamesFromMarkdown(text) }));
  }
  const matches = [...body.matchAll(H1_PART)];
  const texts: string[] = Array.from({ length: partCount }, () => "");
  matches.forEach((m, i) => {
    const n = Number(m[1]) - 1;
    if (n >= partCount || m.index === undefined) return;
    const end = matches[i + 1]?.index ?? body.length;
    texts[n] += body.slice(m.index + m[0].length, end);
  });
  return texts.map((text) => {
    const sectioned = parseNameSections(text);
    if (!sectioned || sectioned.sections.length === 0) return { names: extractNamesFromMarkdown(text) };
    return { names: allSectionedNames(sectioned), sectioned };
  });
}

function splitOldParts(body: string, partCount: 2 | 3): string[] {
  const matches = [...body.matchAll(H2_PART)];
  return Array.from({ length: partCount }, (_, i) => {
    const match = matches[i];
    if (!match || match.index === undefined) return "";
    const end = matches[i + 1]?.index ?? body.length;
    return body.slice(match.index + match[0].length, end);
  });
}

/** §3.3: one part's text, titles and names as typed. */
export function serialiseCompoundPart(part: CompoundPart | string[]): string {
  if (Array.isArray(part)) return part.join("\n");
  return part.sectioned ? serialiseNameSections(part.sectioned) : part.names.join("\n");
}

/** A part box's text as a part (§5.3): `## title` lines become titles. */
export function compoundPartFromText(text: string): CompoundPart {
  const sectioned = parseNameSections(text);
  if (!sectioned || sectioned.sections.length === 0) return { names: extractNamesFromMarkdown(text) };
  return { names: allSectionedNames(sectioned), sectioned };
}

/** §4.4: the titles across all parts, in order of first appearance (case-insensitive). */
export function compoundTitles(parts: CompoundPart[]): string[] {
  const seen = new Set<string>();
  const titles: string[] = [];
  for (const part of parts) {
    for (const section of part.sectioned?.sections ?? []) {
      const key = section.name.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      titles.push(section.name);
    }
  }
  return titles;
}

/**
 * §4.4: each part's names for a title. No title: every part's names. A title: a part that has it
 * uses that title's names only; a part without it uses all its names.
 */
export function compoundPartsFor(parts: CompoundPart[], title?: string): string[][] {
  if (!title) return parts.map((p) => p.names);
  const key = title.trim().toLowerCase();
  return parts.map((p) => {
    const section = p.sectioned?.sections.find((s) => s.name.trim().toLowerCase() === key);
    return section ? sectionNames(section) : p.names;
  });
}

/** Whether a part with this index is Breakdown, given the pack's generator. */
export function partIsBreakdown(generator: CompoundGenerator, partGenerators: CompoundPartGenerator[] | undefined, index: number): boolean {
  if (generator === "combined") return (partGenerators?.[index] ?? "breakdown") === "breakdown";
  return generator === "breakdown";
}

/** §4.1: part-use words as the generator's percentages. */
export function compoundUsePercents(uses: CompoundUse[] | undefined): number[] | undefined {
  return uses?.map((u) => COMPOUND_USE_PERCENT[u]);
}

/** A parsed compound pack's generator settings (§4.5: every caller passes the same ones). */
export function compoundSettings(parsed: {
  compoundGenerator?: CompoundGenerator;
  compoundJoining?: "joined" | "spaced";
  compoundPartUse?: CompoundUse[];
  compoundPartGenerators?: CompoundPartGenerator[];
}): Pick<CompoundGenerateOptions, "generator" | "joining" | "partUse" | "partGenerators"> {
  return {
    generator: parsed.compoundGenerator ?? "breakdown",
    joining: parsed.compoundJoining ?? "joined",
    partUse: compoundUsePercents(parsed.compoundPartUse),
    partGenerators: parsed.compoundPartGenerators,
  };
}

/** A pack's parts as part data: old callers that only have names get untitled parts. */
export function compoundPartData(parsed: { parts?: string[][]; compoundPartData?: CompoundPart[] }): CompoundPart[] {
  return parsed.compoundPartData ?? (parsed.parts ?? []).map((names) => ({ names }));
}

/**
 * §4.4: whole pack with labels. Each name picks a title at random (equal chance) and comes from
 * that title's resolved parts, tagged with the title. Each title's batch is generated once from a
 * sub-seed drawn in title order; titles that run dry drop out.
 */
export function generateCompoundTitled(
  parts: CompoundPart[],
  options: CompoundGenerateOptions,
): { names: { name: string; tag: string }[]; seed: number; loosened: { title: string; part: number; count: number }[] } {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const titles = compoundTitles(parts);
  const count = Math.max(0, Math.floor(options.count));
  const loosened: { title: string; part: number; count: number }[] = [];
  if (count === 0 || titles.length === 0) return { names: [], seed, loosened };
  const rng = mulberry32(seed);
  const subSeeds = titles.map(() => Math.floor(rng() * 0xffffffff) >>> 0);
  const batches: (string[] | undefined)[] = titles.map(() => undefined);
  const cursors = titles.map(() => 0);
  const batch = (i: number): string[] => {
    if (!batches[i]) {
      const resolved = compoundPartsFor(parts, titles[i]);
      const result = generateCompoundNamesDetailed(resolved, { ...options, count, seed: subSeeds[i] });
      for (const p of result.loosened ?? []) loosened.push({ title: titles[i], part: p + 1, count: resolved[p].length });
      batches[i] = result.names;
    }
    return batches[i]!;
  };
  const out: { name: string; tag: string }[] = [];
  const seen = new Set<string>();
  const live = titles.map((_, i) => i);
  while (out.length < count && live.length > 0) {
    const pick = live[Math.floor(rng() * live.length)];
    const names = batch(pick);
    if (cursors[pick] >= names.length) {
      live.splice(live.indexOf(pick), 1);
      continue;
    }
    const name = names[cursors[pick]++];
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push({ name, tag: titles[pick] });
  }
  return { names: out, seed, loosened };
}
