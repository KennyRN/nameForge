// Shared tables brief §3: the people tables and how a culture, region and era pick one.
// Obsidian-free and engine-free: it reads only its own JSON. The filler (src/fill/) draws names from
// the table this returns; nothing here draws a name itself.

import PEOPLE from "./data/people.json";

export type PeoplePeriod = "historic" | "modern";
/**
 * [name, weight, flag?, eras?]. The flag marks a name kept mainly for a royal (`r`) or saintly (`s`)
 * bearer ("" for none). The eras are space-separated tags: `ST` and `MO` on every modern given name,
 * `MD` and `EM` on the Cornish historic names (review amendment, brief §12).
 */
export type PeopleEntry = [string, number] | [string, number, "r" | "s" | ""] | [string, number, "r" | "s" | "", string];
export type PeopleForm = [string, number];

export interface PeopleTable {
  male: PeopleEntry[];
  female: PeopleEntry[];
  /** Absent where the culture used no inherited surnames in the period (patronymic naming). */
  surnames?: PeopleEntry[];
  regnalMale: PeopleEntry[];
  regnalFemale: PeopleEntry[];
  holy: PeopleEntry[];
  /** Holy names that only ever take the "Saint {n}" form (colonial saints beside a culture's own sages and priests). */
  saintOnly?: string[];
  /** Modern given names that are given now (the last thirty years), all tagged `MO`. */
  recentMale?: string[];
  recentFemale?: string[];
  holyForms: PeopleForm[];
  rulerForms: { male: PeopleForm[]; female: PeopleForm[] };
}

type CultureTables = Partial<Record<PeoplePeriod, PeopleTable>>;
const CULTURES = PEOPLE.cultures as unknown as Record<string, CultureTables>;
const FAMILIES = PEOPLE.families as Record<string, string>;

type ResolveRule = string | { even?: string[]; regions?: Record<string, string>; historic?: string; modern?: string; as?: string; extra?: string };
const RESOLVE = PEOPLE.resolve as unknown as Record<string, ResolveRule>;

/** The cultures that have a table of their own (the others resolve to one of these). */
export const PEOPLE_CULTURES: readonly string[] = Object.keys(CULTURES);

/** The period a state's era reads: historic to the early modern era, modern from the steam age on (the future eras read modern). */
export function peoplePeriod(era: string): PeoplePeriod {
  return era === "AN" || era === "MD" || era === "EM" || era === "fantasy" ? "historic" : "modern";
}

/** A culture's table for a period, if it has one. */
export function peopleTable(culture: string, period: PeoplePeriod): PeopleTable | undefined {
  return CULTURES[culture]?.[period];
}

/**
 * The people culture a module's culture (and region) reads. `celtic` with no region draws evenly
 * from Welsh, Scottish, Irish and Cornish; WAL, COR and the Scottish regions pick their view's table.
 * A culture with no table and no nearer one (the native peoples with no second-tier culture) gives undefined.
 */
export function peopleCultureFor(culture: string, region: string | undefined, rng: () => number, period: PeoplePeriod = "historic"): string | undefined {
  const rule: ResolveRule | undefined = RESOLVE[culture];
  if (rule === undefined) return CULTURES[culture] ? culture : undefined;
  if (typeof rule === "string") return peopleCultureFor(rule, region, rng, period);
  if (rule.as) return peopleCultureFor(rule.as, region, rng, period);
  if (rule.even) {
    const picked = region ? rule.regions?.[region] : undefined;
    if (picked) return picked;
    return rule.even[Math.min(rule.even.length - 1, Math.floor(rng() * rule.even.length))];
  }
  const next = rule[period] ?? culture;
  if (next === culture) return CULTURES[culture] ? culture : undefined;
  return peopleCultureFor(next, region, rng, period);
}

/** One draw's culture and period for a state: the culture's own table, or another's in the future eras. */
export function peopleSourceFor(culture: string, region: string | undefined, era: string, rng: () => number): { culture: string; period: PeoplePeriod; table: PeopleTable } | undefined {
  const period = peoplePeriod(era);
  const base = peopleCultureFor(culture, region, rng, period);
  if (!base) return undefined;
  let own = base;
  if ((era === "NF" || era === "IS") && rng() < PEOPLE.nearFuture.otherShare) own = otherCulture(own, rng) ?? own;
  let table = peopleTable(own, period) ?? peopleTable(peopleCultureFor(own, undefined, rng, period) ?? own, period);
  if (!table) return undefined;
  const extra = own === base ? extraFor(culture) : undefined;
  if (extra) table = withExtra(table, extra);
  return { culture: own, period, table };
}

type ExtraSet = { male?: PeopleEntry[]; female?: PeopleEntry[]; surnames?: PeopleEntry[] };
const EXTRAS = (PEOPLE as unknown as { extras: Record<string, ExtraSet> }).extras;
/** The short extra set a local culture adds to its nearest culture's lists (the Ottoman's Turkish names), if it has one. */
function extraFor(culture: string): ExtraSet | undefined {
  const rule = RESOLVE[culture];
  return rule && typeof rule === "object" && rule.extra ? EXTRAS[rule.extra] : undefined;
}
const withExtra = (table: PeopleTable, extra: ExtraSet): PeopleTable => ({
  ...table,
  male: [...table.male, ...(extra.male ?? [])],
  female: [...table.female, ...(extra.female ?? [])],
  surnames: table.surnames ? [...table.surnames, ...(extra.surnames ?? [])] : table.surnames,
});

const SPLIT_TABLES = ["spanish", "portuguese", "greek", "byzantine", "turkic", "mongol", "arabic", "persian"];
/** In the future eras a share of names come from other cultures' modern lists, weighted towards the same family. */
export function otherCulture(own: string, rng: () => number): string | undefined {
  const family = FAMILIES[own];
  // Brief 6a: the four tables the splits add are not drawn here (they repeat Iberian and Greek-and-Byzantine), so no other culture's future names move.
  const choices = PEOPLE_CULTURES.filter((c) => c !== own && CULTURES[c].modern && !SPLIT_TABLES.includes(c)).map((c) => ({ c, w: FAMILIES[c] === family ? PEOPLE.nearFuture.sameFamilyWeight : PEOPLE.nearFuture.otherFamilyWeight }));
  const total = choices.reduce((sum, x) => sum + x.w, 0);
  if (total === 0) return undefined;
  let roll = rng() * total;
  for (const x of choices) {
    roll -= x.w;
    if (roll < 0) return x.c;
  }
  return choices[choices.length - 1].c;
}

/** How each person slot is said (brief §3.4), for the filler. */
export const PERSON_SLOT_FORMS = PEOPLE.slotForms;

/** The era tags on an entry. */
export const entryEras = (e: PeopleEntry): string[] => (e[3] ? e[3].split(" ") : []);

/** The flag on an entry: `r`, `s` or none. */
export const entryFlag = (e: PeopleEntry): "r" | "s" | "" => (e[2] as "r" | "s" | "" | undefined) ?? "";

/**
 * A list's weights for a state's era: names tagged with the era carry 80% of the draw and the rest
 * 20% (the near and far future, NF and IS, prefer `MO`). A list with no era tags, or none for this era
 * (or all of them), is left as it is.
 */
export function eraWeights(list: readonly PeopleEntry[], era: string): number[] {
  const tag = era === "NF" || era === "IS" ? "MO" : era;
  const has = list.map((e) => entryEras(e).includes(tag));
  const inN = has.filter(Boolean).length;
  if (inN === 0 || inN === list.length) return list.map((e) => e[1]);
  const inW = list.reduce((s, e, i) => s + (has[i] ? e[1] : 0), 0);
  const outW = list.reduce((s, e, i) => s + (has[i] ? 0 : e[1]), 0);
  return list.map((e, i) => (has[i] ? (e[1] / inW) * 0.8 : (e[1] / outW) * 0.2));
}
