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
  /** The sex of the name's subject, where the engine knows it (a female title takes a woman's given name). */
  sex?: "male" | "female";
  /** Shared tables brief §13.2 item 6: a place module from the steam age on (and stars and space always): [person] reads the founder forms. */
  personAsFounder?: boolean;
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
  /** The sex the name's subject is known to have (see FillContext). */
  sex?: "male" | "female";
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

/** The genre band a state's era sits in: fantasy to the early modern era, modern to the modern era, sci-fi after. */
export function fillGenre(era: FillEra): "fantasy" | "modern" | "scifi" {
  return era === "NF" || era === "IS" ? "scifi" : era === "ST" || era === "MO" ? "modern" : "fantasy";
}

/** A seed for a one-name draw from another engine, taken from the batch's stream. */
export const drawSeed = (rng: () => number): number => Math.floor(rng() * 4294967296) >>> 0;

const AGAIN = 8;
/** Shared tables brief §13.2 item 1: a place fill is drawn again, up to this many times, when it repeats the feature's generic. */
const PLACE_AGAIN = 10;
const PLACE_SOURCES = new Set(["place", "earlierPlace"]);
const STOP_WORDS = new Set(["of", "the", "and", "on", "in", "at", "by", "upon", "with", "to", "a"]);

/**
 * Whether a place fill repeats the generic of the feature it names: "Valley of [place]" with "Alder Valley",
 * "[place] Hill" with "Ashhill". The fill's last word equals a word of the rest of the name, or ends with it.
 */
export function repeatsGeneric(fill: string, rest: string): boolean {
  const last = fill.trim().split(/\s+/).pop()?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
  if (last.length < 3) return false;
  return rest
    .replace(/\[[^\]]*\]/g, " ")
    .toLowerCase()
    .split(/[^a-z]+/)
    .some((w) => w.length >= 3 && !STOP_WORDS.has(w) && (last === w || (w.length >= 4 && last.endsWith(w))));
}

/** Shared tables brief §13.2 item 5: titles that need a name after them, and the sex each implies. */
const NAME_TITLES: Record<string, "male" | "female"> = { Sir: "male", Lord: "male", Sire: "male", Master: "male", Dame: "female", Lady: "female", Madam: "female", Mistress: "female" };
const BARE_TITLE = new RegExp(`^(${Object.keys(NAME_TITLES).join("|")})(?=['’]s\\b|$)`);

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
  let any = false;
  const filled = name.replace(/\[([^\]]+)\]/g, (whole: string, label: string, offset: number) => {
    const info = labelInfo(label);
    if (!info) return whole;
    const key = label.trim().toLowerCase();
    let fill = ctx.series?.get(key);
    if (fill === undefined) {
      const resolver = resolvers[info.source];
      if (!resolver) return whole;
      const avoid = used.get(key) ?? new Set<string>();
      const place = PLACE_SOURCES.has(info.source);
      const slot = ctx.personAsFounder && info.source === "person" && (key === "person" || key === "personal name") ? "founder" : info.slot;
      const rest = place ? `${name.slice(0, offset)} ${name.slice(offset + whole.length)}` : "";
      for (let attempt = 0; attempt < (place ? PLACE_AGAIN : AGAIN); attempt++) {
        fill = resolver({ label: key, source: info.source, slot, culture: ctx.culture, era, period, region: ctx.region, mode: ctx.mode, rng: ctx.rng, sex: ctx.sex, avoid });
        if (fill === undefined || (!avoid.has(fill) && !(place && repeatsGeneric(fill, rest)))) break;
      }
      if (fill === undefined) return whole;
      ctx.series?.set(key, fill);
    }
    used.set(key, (used.get(key) ?? new Set<string>()).add(fill));
    const before = name.slice(0, offset);
    const after = name.slice(offset + whole.length);
    if (/\bthe\s$/i.test(before)) fill = fill.replace(/^the\s+/i, "");
    if (/^['’]s\b/.test(after)) fill = fill.replace(/['’]s$/, "");
    any = true;
    return fill;
  });
  // A name the filler changed never starts with a lower-case "the"; one it left alone is as the engine made it.
  const out = any ? filled.replace(/^the\b/, "The") : filled;
  return completeTitles(out, ctx, era, period, resolvers);
}

/** A title that needs a name and has none ("Sir's Army Road") takes a given name of its sex, or a surname (§13.2 item 5). */
function completeTitles(text: string, ctx: FillContext, era: FillEra, period: FillPeriod, resolvers: Resolvers): string {
  return text.replace(BARE_TITLE, (whole: string, title: string) => {
    const sex = NAME_TITLES[title];
    const base = { culture: ctx.culture, era, period, region: ctx.region, mode: ctx.mode, rng: ctx.rng, sex, avoid: new Set<string>() };
    const surname = ctx.rng() < 0.3 ? resolvers.surname?.({ ...base, label: "surname", source: "surname" }) : undefined;
    const given = surname ?? resolvers.person?.({ ...base, label: "name", source: "person", slot: sex === "male" ? "givenMale" : "givenFemale" });
    return given ? `${title} ${given}` : whole;
  });
}
