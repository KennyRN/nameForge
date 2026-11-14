// Shared tables brief §3: the people tables and how a culture, region and era pick one.
// Obsidian-free and engine-free: it reads only its own JSON. The filler (src/fill/) draws names from
// the table this returns; nothing here draws a name itself.

import PEOPLE from "./data/people.json";

export type PeoplePeriod = "historic" | "modern";
/** [name, weight] with a third element marking a royal (`r`) or saintly (`s`) name. */
export type PeopleEntry = [string, number] | [string, number, "r" | "s"];
export type PeopleForm = [string, number];

export interface PeopleTable {
  male: PeopleEntry[];
  female: PeopleEntry[];
  /** Absent where the culture used no inherited surnames in the period (patronymic naming). */
  surnames?: PeopleEntry[];
  regnalMale: PeopleEntry[];
  regnalFemale: PeopleEntry[];
  holy: PeopleEntry[];
  holyForms: PeopleForm[];
  rulerForms: { male: PeopleForm[]; female: PeopleForm[] };
}

type CultureTables = Partial<Record<PeoplePeriod, PeopleTable>>;
const CULTURES = PEOPLE.cultures as unknown as Record<string, CultureTables>;
const FAMILIES = PEOPLE.families as Record<string, string>;

type ResolveRule = string | { even?: string[]; regions?: Record<string, string>; historic?: string; modern?: string };
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
 * A culture with no table yet (second tier, at M3) gives undefined.
 */
export function peopleCultureFor(culture: string, region: string | undefined, rng: () => number, period: PeoplePeriod = "historic"): string | undefined {
  const rule: ResolveRule | undefined = RESOLVE[culture];
  if (rule === undefined) return CULTURES[culture] ? culture : undefined;
  if (typeof rule === "string") return peopleCultureFor(rule, region, rng, period);
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
  let own = peopleCultureFor(culture, region, rng, period);
  if (!own) return undefined;
  if ((era === "NF" || era === "IS") && rng() < PEOPLE.nearFuture.otherShare) own = otherCulture(own, rng) ?? own;
  const table = peopleTable(own, period) ?? peopleTable(peopleCultureFor(own, undefined, rng, period) ?? own, period);
  return table ? { culture: own, period, table } : undefined;
}

/** In the future eras a share of names come from other cultures' modern lists, weighted towards the same family. */
export function otherCulture(own: string, rng: () => number): string | undefined {
  const family = FAMILIES[own];
  const choices = PEOPLE_CULTURES.filter((c) => c !== own && CULTURES[c].modern).map((c) => ({ c, w: FAMILIES[c] === family ? PEOPLE.nearFuture.sameFamilyWeight : PEOPLE.nearFuture.otherFamilyWeight }));
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
