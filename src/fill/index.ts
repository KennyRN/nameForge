// Shared tables brief §5: the one filler every module uses after its engine has run. Engines keep
// producing brackets ("[founder] Peak"); `fillSlots` replaces each bracket it knows, from a source
// the label maps to in fill.json. Obsidian-free: it draws only from the batch's seeded stream.
//
// The sources themselves arrive with their tables (people tables at M2, the engines' places, deities,
// folk, realms and rivers at M6). Until a source has a resolver the bracket is left as the engine made it,
// so the filler can be wired in module by module without changing any output on the way.

import FILL from "../data/fill.json";

export type FillMode = "real" | "generated";
export type FillPeriod = "historic" | "modern";

/** The lens era codes, and the three bands the group, byname and vehicle modules store as a genre. */
export type FillEra = "AN" | "MD" | "EM" | "ST" | "MO" | "NF" | "IS";

/** How a person slot is said (brief §3.4); the people resolver reads these. */
export const PERSON_SLOTS = ["founder", "official", "person", "givenMale", "givenFemale", "given", "monarch", "royalWoman", "dynasty", "house", "holy"] as const;
export type PersonSlot = (typeof PERSON_SLOTS)[number];

export interface FillContext {
  /** The state's lens culture (a module's own key is fine: resolvers read it through the lens). */
  culture: string;
  /** An era code, or a band's genre (`fantasy`, `modern`, `scifi`) for the modules that store only a band. */
  era: string;
  region?: string;
  mode: FillMode;
  /** The batch's seeded stream: the filler draws from it, never from Math.random. */
  rng: () => number;
  /** Series mode: each label is filled once per batch and reused. Pass the same map for every name in a batch. */
  series?: Map<string, string>;
  /** The sources' resolvers; the registered ones when absent. */
  resolvers?: Resolvers;
}

/** What a resolver is asked for. */
export interface FillRequest {
  label: string;
  source: string;
  slot?: string;
  culture: string;
  era: FillEra;
  period: FillPeriod;
  region?: string;
  mode: FillMode;
  rng: () => number;
  /** Fills already used for this label in this name: a resolver should avoid them. */
  avoid: ReadonlySet<string>;
}

/** A source's resolver: the fill, or undefined when it has none (the bracket stays). */
export type Resolver = (request: FillRequest) => string | undefined;
export type Resolvers = Partial<Record<string, Resolver>>;

/** The resolvers registered so far. Empty at M1: every bracket stays as the engine made it. */
const REGISTERED: Resolvers = {};

/** Adds a source's resolver (each later milestone registers its own). */
export function registerResolver(source: string, resolver: Resolver): void {
  REGISTERED[source] = resolver;
}

export interface LabelInfo {
  source: string;
  slot?: string;
}

const LABELS = new Map<string, LabelInfo>(Object.entries(FILL.labels).map(([label, info]) => [label.toLowerCase(), info as LabelInfo]));
const STAYS = new Set(Object.keys(FILL.stayBracketed).map((l) => l.toLowerCase()));

/** The source a label maps to, or undefined for a label that stays bracketed or isn't known. */
export function labelInfo(label: string): LabelInfo | undefined {
  return LABELS.get(label.trim().toLowerCase());
}

/** Whether a label is on the stay-bracketed list (native flora and fauna, recipe labels, and the rest). */
export function staysBracketed(label: string): boolean {
  return STAYS.has(label.trim().toLowerCase());
}

/** Every label in a name, in order, without the brackets. */
export function bracketLabels(name: string): string[] {
  return [...name.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
}

const BAND_ERA: Record<string, FillEra> = { fantasy: "MD", modern: "MO", scifi: "IS" };
const ERAS: readonly string[] = ["AN", "MD", "EM", "ST", "MO", "NF", "IS"];

/** The era the filler reads: the state's era, or the middle era of a band (MD, MO, IS) for the modules that store only a genre. */
export function fillEra(era: string): FillEra {
  if (ERAS.includes(era)) return era as FillEra;
  return BAND_ERA[era] ?? "MD";
}

/** The people tables' period: historic to the early modern era, modern from the steam age (brief §3.1). */
export function fillPeriod(era: FillEra): FillPeriod {
  return era === "AN" || era === "MD" || era === "EM" ? "historic" : "modern";
}

/** Whether a result needs a share of names from other cultures: the near future and interstellar eras (brief §3.1). */
export function drawsFromOtherCultures(era: FillEra): boolean {
  return era === "NF" || era === "IS";
}

const AGAIN = 8;

/**
 * Replaces each bracket in a name that a registered source can fill, by the rules of brief §5.3:
 * - "[founder]'s" takes the fill's possessive once; "of the [folk]" drops a doubled "the";
 * - a result never starts with a lower-case "the";
 * - in series mode a label is filled once per batch and reused;
 * - within one name two brackets with the same label get different fills;
 * - labels with no source, no resolver, or on the stay-bracketed list are left as they are.
 */
export function fillSlots(name: string, ctx: FillContext): string {
  const resolvers = ctx.resolvers ?? REGISTERED;
  const era = fillEra(ctx.era);
  const period = fillPeriod(era);
  const used = new Map<string, Set<string>>();
  const filled = name.replace(/\[([^\]]+)\]/g, (whole: string, label: string, offset: number) => {
    const info = labelInfo(label);
    if (!info) return whole;
    const key = label.trim().toLowerCase();
    let fill = ctx.series?.get(key);
    if (fill === undefined) {
      const resolver = resolvers[info.source];
      if (!resolver) return whole;
      const avoid = used.get(key) ?? new Set<string>();
      for (let attempt = 0; attempt < AGAIN; attempt++) {
        fill = resolver({ label: key, source: info.source, slot: info.slot, culture: ctx.culture, era, period, region: ctx.region, mode: ctx.mode, rng: ctx.rng, avoid });
        if (fill === undefined || !avoid.has(fill)) break;
      }
      if (fill === undefined) return whole;
      ctx.series?.set(key, fill);
    }
    used.set(key, (used.get(key) ?? new Set<string>()).add(fill));
    const before = name.slice(0, offset);
    const after = name.slice(offset + whole.length);
    if (/\bthe\s$/i.test(before)) fill = fill.replace(/^the\s+/i, "");
    if (/^['’]s\b/.test(after)) fill = fill.replace(/['’]s$/, "");
    return fill;
  });
  return filled.replace(/^the\b/, "The");
}
