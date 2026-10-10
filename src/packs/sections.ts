// Sections in List and Breakdown packs (names-reference §10). No Obsidian imports.
//
// A `##` heading starts a section; a `###` heading inside a section starts a subsection. Gender is
// a section or subsection headed "Male" or "Female". Names outside any heading are unsectioned and
// count as either gender. Packs without headings are not sectioned at all and behave as before.

import { extractNamesFromMarkdown } from "../markov";

export interface NameSubsection {
  name: string;
  names: string[];
}

export interface NameSection {
  name: string;
  /** Names in the section but outside any subsection. */
  names: string[];
  subsections: NameSubsection[];
}

export interface SectionedNames {
  /** Names before the first heading. */
  unsectioned: string[];
  sections: NameSection[];
}

export type Gender = "male" | "female";

export interface SectionRequest {
  section?: string;
  gender?: Gender;
}

export interface SectionSelection {
  names: string[];
  /** What was actually used, e.g. "Noble · Male", "Noble" or "the whole pack". */
  used: string;
  notices: string[];
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const isGender = (heading: string, gender: Gender) => same(heading, gender);

/** Parses `##` sections and `###` subsections; null when the body has no `##`/`###` headings. */
export function parseNameSections(body: string): SectionedNames | null {
  const lines = body.split(/\r?\n/);
  if (!lines.some((l) => /^#{2,3}\s+\S/.test(l.trim()))) return null;

  const result: SectionedNames = { unsectioned: [], sections: [] };
  let chunk: string[] = [];
  let section: NameSection | null = null;
  let subsection: NameSubsection | null = null;
  const flush = () => {
    const names = extractNamesFromMarkdown(chunk.join("\n"));
    chunk = [];
    if (subsection) subsection.names.push(...names);
    else if (section) section.names.push(...names);
    else result.unsectioned.push(...names);
  };

  for (const raw of lines) {
    const line = raw.trim();
    const h2 = line.match(/^##\s+(.+?)\s*#*$/);
    const h3 = line.match(/^###\s+(.+?)\s*#*$/);
    if (h2 && !h3) {
      flush();
      section = { name: h2[1], names: [], subsections: [] };
      subsection = null;
      result.sections.push(section);
    } else if (h3) {
      flush();
      if (!section) {
        // A ### heading before any ## heading is treated as a section of its own.
        section = { name: h3[1], names: [], subsections: [] };
        subsection = null;
        result.sections.push(section);
      } else {
        subsection = { name: h3[1], names: [] };
        section.subsections.push(subsection);
      }
    } else {
      chunk.push(raw);
    }
  }
  flush();
  return result;
}

function dedupe(names: string[]): string[] {
  const seen = new Set<string>();
  return names.filter((n) => {
    const key = n.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function sectionNames(section: NameSection): string[] {
  return dedupe([...section.names, ...section.subsections.flatMap((s) => s.names)]);
}

export function allSectionedNames(s: SectionedNames): string[] {
  return dedupe([...s.unsectioned, ...s.sections.flatMap(sectionNames)]);
}

export interface SectionOption {
  label: string;
  request: SectionRequest;
  /** The "whole pack" choice, always last. */
  whole?: boolean;
}

export const WHOLE_PACK_LABEL = "whole pack";

/** The sections sentence's choices (Compound brief §1.2): each `##` section in file order, then the whole pack. */
export function sectionOptions(s: SectionedNames): SectionOption[] {
  return [...headingOptions(s), wholePackOption()];
}

/** Each `##` section, without the whole-pack choice (Mix packs merge these across sources). */
export function headingOptions(s: SectionedNames): SectionOption[] {
  return s.sections.map((section) => ({ label: section.name, request: { section: section.name } }));
}

export const wholePackOption = (): SectionOption => ({ label: WHOLE_PACK_LABEL, request: {}, whole: true });

/** The lists a whole pack is drawn from when labelled (§1.3): names before the first heading (untagged), then each section. */
export function labelledLists(s: SectionedNames): { tag?: string; names: string[] }[] {
  const lists: { tag?: string; names: string[] }[] = [];
  if (s.unsectioned.length > 0) lists.push({ names: dedupe(s.unsectioned) });
  for (const section of s.sections) {
    const names = sectionNames(section);
    if (names.length > 0) lists.push({ tag: section.name, names });
  }
  return lists;
}

const labelOf = (r: SectionRequest, s: SectionedNames) => {
  if (!r.section && !r.gender) return "the whole pack";
  const section = r.section ? s.sections.find((x) => same(x.name, r.section!))?.name ?? r.section : undefined;
  const gender = r.gender ? r.gender.charAt(0).toUpperCase() + r.gender.slice(1) : undefined;
  return [section, gender].filter(Boolean).join(" · ");
};

/** Names for one step of the fallback chain, or null if that step doesn't exist in the pack. */
function namesFor(s: SectionedNames, r: SectionRequest): string[] | null {
  if (r.section) {
    const section = s.sections.find((x) => same(x.name, r.section!));
    if (!section) return null;
    if (!r.gender) return sectionNames(section);
    const sub = section.subsections.find((x) => isGender(x.name, r.gender!));
    if (!sub) return null;
    // The section's own unsubsectioned names count as either gender.
    return dedupe([...sub.names, ...section.names]);
  }
  if (r.gender) {
    const genderSection = s.sections.find((x) => isGender(x.name, r.gender!));
    const genderSubs = s.sections.flatMap((x) => x.subsections.filter((sub) => isGender(sub.name, r.gender!)));
    if (!genderSection && genderSubs.length === 0) return null;
    const names: string[] = [...s.unsectioned];
    for (const section of s.sections) {
      if (isGender(section.name, "male") || isGender(section.name, "female")) {
        if (isGender(section.name, r.gender)) names.push(...sectionNames(section));
        continue;
      }
      names.push(...section.names);
      for (const sub of section.subsections) {
        const otherGender = (isGender(sub.name, "male") || isGender(sub.name, "female")) && !isGender(sub.name, r.gender);
        if (!otherGender) names.push(...sub.names);
      }
    }
    return dedupe(names);
  }
  return allSectionedNames(s);
}

/**
 * Picks names for a request, falling back subsection → section → whole pack. A missing step, or
 * one with fewer than `minNames` names (Breakdown packs: 20), falls back one step with a notice.
 */
export function selectSectionNames(s: SectionedNames, request: SectionRequest, minNames = 0): SectionSelection {
  const steps: SectionRequest[] = [];
  if (request.section && request.gender) steps.push({ section: request.section, gender: request.gender });
  if (request.section) steps.push({ section: request.section });
  if (!request.section && request.gender) steps.push({ gender: request.gender });
  steps.push({});

  const notices: string[] = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const names = namesFor(s, step);
    const last = i === steps.length - 1;
    const next = last ? "" : labelOf(steps[i + 1], s);
    if (names === null && !last) {
      notices.push(`“${labelOf(step, s)}” not found — using ${quote(next)}.`);
      continue;
    }
    if (names !== null && names.length < minNames && !last) {
      notices.push(`“${labelOf(step, s)}” has only ${names.length} names — using ${quote(next)}.`);
      continue;
    }
    return { names: names ?? allSectionedNames(s), used: labelOf(step, s), notices };
  }
  return { names: allSectionedNames(s), used: "the whole pack", notices };
}

const quote = (label: string) => (label === "the whole pack" ? label : `“${label}”`);

/** Writes sections back as markdown (one name per line), for packs saved from the editor. */
export function serialiseNameSections(s: SectionedNames): string {
  const blocks: string[] = [];
  if (s.unsectioned.length > 0) blocks.push(s.unsectioned.join("\n"));
  for (const section of s.sections) {
    const parts = [`## ${section.name}`];
    if (section.names.length > 0) parts.push(section.names.join("\n"));
    for (const sub of section.subsections) parts.push(`### ${sub.name}`, sub.names.join("\n"));
    blocks.push(parts.join("\n\n"));
  }
  return blocks.join("\n\n");
}

/**
 * Template inheritance (§7): each list, section and subsection is inherited or replaced whole.
 * The derived pack's unsectioned names, a section's own names, and each subsection replace the
 * template's only when the derived pack has them; new sections and subsections are added.
 */
export function mergeSectionedNames(derived: SectionedNames, template: SectionedNames): SectionedNames {
  const sections: NameSection[] = template.sections.map((t) => {
    const d = derived.sections.find((x) => same(x.name, t.name));
    if (!d) return t;
    const subsections = t.subsections.map((ts) => d.subsections.find((ds) => same(ds.name, ts.name)) ?? ts);
    for (const ds of d.subsections) if (!t.subsections.some((ts) => same(ts.name, ds.name))) subsections.push(ds);
    return { name: t.name, names: d.names.length > 0 ? d.names : t.names, subsections };
  });
  for (const d of derived.sections) if (!template.sections.some((t) => same(t.name, d.name))) sections.push(d);
  return {
    unsectioned: derived.unsectioned.length > 0 ? derived.unsectioned : template.unsectioned,
    sections,
  };
}
