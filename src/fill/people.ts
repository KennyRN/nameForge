// Shared tables brief §3.4, §5.2 and §6: the people sources of the filler. A person slot ("[founder]",
// "[monarch]", "[holy person]", "[surname]") is said in the form its slot gives (people.json `slotForms`),
// from the people tables of the state's culture and period. In `generated` mode the given names and
// surnames come from the starter models (src/peopleGenerated.ts); regnal and holy names stay real. A
// culture with no table (a native people) gives nothing, so its bracket stays.

import "../lexiconWiring";
import BYNAMES from "../data/bynames.json";
import PEOPLE from "../data/people.json";
import { eraWeights, PERSON_SLOT_FORMS, peopleSourceFor, type PeopleEntry, type PeoplePeriod, type PeopleTable } from "../people";
import { generatedName, type GeneratedList } from "../peopleGenerated";
import { registerResolver, type FillRequest, type Resolver } from "./index";

type Form = [string, number];
interface SlotForm {
  withSurnames?: Form[];
  withoutSurnames?: Form[];
  forms?: Form[];
  sexShare?: { male: number; female: number };
}
const SLOTS = PERSON_SLOT_FORMS as unknown as Record<string, SlotForm>;

function pickWeighted<T>(items: readonly T[], weights: readonly number[], rng: () => number): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let roll = rng() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll < 0) return items[i];
  }
  return items[items.length - 1];
}
const pickForm = (forms: readonly Form[], rng: () => number): string => pickWeighted(forms.map((f) => f[0]), forms.map((f) => f[1]), rng);

/** A name from a list, weighted by the list's order and (where it carries them) the state's era. */
function draw(list: readonly PeopleEntry[], era: string, rng: () => number, avoid: ReadonlySet<string>): string {
  const w = eraWeights(list, era);
  for (let attempt = 0; attempt < 6; attempt++) {
    const name = pickWeighted(list, w, rng)[0];
    if (!avoid.has(name)) return name;
  }
  return pickWeighted(list, w, rng)[0];
}

/** Titles for officials: the bynames module's ranks in the culture's bynames culture, without the royal ones. */
const ROYAL = /king|queen|prince|emperor|empress|pharaoh|khan|sultan|shah|caliph|tsar|inca|sovereign|chief$/i;
function officialTitle(culture: string, female: boolean, rng: () => number): string | undefined {
  const map = (PEOPLE.officialTitles.bynamesCulture as Record<string, string>)[culture] ?? "general";
  const ranks = ((BYNAMES.ranks as Record<string, { m?: string | null; f?: string | null; w?: string; x?: number; s?: string[] }[]>)[map] ?? []).filter((r) => !r.s);
  const options = ranks
    .map((r) => ({ word: r.w ?? (female ? r.f ?? r.m : r.m), x: r.x ?? 1 }))
    .filter((r): r is { word: string; x: number } => !!r.word && !ROYAL.test(r.word));
  if (options.length === 0) return undefined;
  return pickWeighted(options.map((o) => o.word), options.map((o) => o.x), rng);
}

/**
 * Shared tables brief §3.5: full names of famous real people ("James Cook"). Given names and surnames are drawn
 * separately, so the filler redraws when a pair makes one. Lower case, compared whole words.
 */
export const blockedNames: Set<string> = new Set(((PEOPLE as unknown as { blocked?: string[] }).blocked ?? []).map((n) => n.toLowerCase()));

/** Whether a said name holds a blocked full name ("Governor James Cook" does). */
export function isBlockedName(text: string): boolean {
  const lower = ` ${text.toLowerCase().replace(/[^a-z' -]+/g, " ")} `;
  for (const b of blockedNames) if (lower.includes(` ${b} `)) return true;
  return false;
}

interface Ctx {
  req: FillRequest;
  culture: string;
  period: PeoplePeriod;
  table: PeopleTable;
}

/** One given name of a sex, real or generated (a list with no model falls back to the real list). */
function given(c: Ctx, sex: "male" | "female"): string {
  if (c.req.mode === "generated") {
    const g = generatedName(c.culture, c.period, sex, c.req.rng, c.req.avoid);
    if (g) return g;
  }
  return draw(c.table[sex], c.req.era, c.req.rng, c.req.avoid);
}

function surname(c: Ctx, sex: "male" | "female"): string {
  if (!c.table.surnames) return given(c, sex);
  if (c.req.mode === "generated") {
    const g = generatedName(c.culture, c.period, "surnames" satisfies GeneratedList, c.req.rng, c.req.avoid);
    if (g) return g;
  }
  return draw(c.table.surnames, c.req.era, c.req.rng, c.req.avoid);
}

const regnal = (c: Ctx, sex: "male" | "female"): string => draw(sex === "male" ? c.table.regnalMale : c.table.regnalFemale, c.req.era, c.req.rng, c.req.avoid);

/** Says one person slot in its form. */
function person(c: Ctx, slot: string): string | undefined {
  const spec = SLOTS[slot];
  if (!spec) return undefined;
  const rng = c.req.rng;
  const forms = (c.table.surnames ? spec.withSurnames : spec.withoutSurnames) ?? spec.forms ?? spec.withSurnames ?? spec.withoutSurnames;
  if (!forms) return undefined;
  const share = spec.sexShare ?? { male: 50, female: 50 };
  const sex: "male" | "female" = rng() * (share.male + share.female) < share.male ? "male" : "female";
  const form = pickForm(forms, rng);
  return form.replace(/\{(g|gm|gf|s|t|r|rm|rf)\}/g, (_w, token: string) => {
    switch (token) {
      case "g": return given(c, sex);
      case "gm": return given(c, "male");
      case "gf": return given(c, "female");
      case "s": return surname(c, sex);
      case "t": return officialTitle(c.culture, sex === "female", rng) ?? given(c, sex);
      case "r": {
        const ruler = pickForm(c.table.rulerForms.male, rng);
        return ruler.replace("{m}", regnal(c, "male"));
      }
      case "rm": return regnal(c, "male");
      default: return regnal(c, "female");
    }
  });
}

const holy = (c: Ctx): string => pickForm(c.table.holyForms, c.req.rng).replace("{n}", draw(c.table.holy, c.req.era, c.req.rng, c.req.avoid));

function context(req: FillRequest): Ctx | undefined {
  const source = peopleSourceFor(req.culture, req.region, req.era, req.rng);
  return source ? { req, culture: source.culture, period: source.period, table: source.table } : undefined;
}

export const personResolver: Resolver = (req) => {
  const c = context(req);
  if (!c || !req.slot) return undefined;
  let said = person(c, req.slot);
  // A pair that makes a famous real person is drawn again.
  for (let attempt = 0; said !== undefined && isBlockedName(said) && attempt < 12; attempt++) said = person(c, req.slot);
  return said !== undefined && isBlockedName(said) ? undefined : said;
};
export const holyResolver: Resolver = (req) => {
  const c = context(req);
  return c ? holy(c) : undefined;
};
export const surnameResolver: Resolver = (req) => {
  const c = context(req);
  return c ? surname(c, req.rng() < 0.7 ? "male" : "female") : undefined;
};

/** Registers the people sources with the filler. */
export function registerPeopleResolvers(): void {
  registerResolver("person", personResolver);
  registerResolver("holy", holyResolver);
  registerResolver("surname", surnameResolver);
}
