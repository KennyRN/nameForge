// Shared tables brief §3.4, §5.2 and §6: the people sources of the filler. A person slot ("[founder]",
// "[monarch]", "[holy person]", "[surname]") is said in the form its slot gives (people.json `slotForms`),
// from the people tables of the state's culture and period. In `generated` mode the given names and
// surnames come from the starter models (src/peopleGenerated.ts); regnal and holy names stay real. A
// culture with no table (a native people) gives nothing, so its bracket stays.

import "../lexiconWiring";
import BYNAMES from "../data/bynames.json";
import FILL from "../data/fill.json";
import PEOPLE from "../data/people.json";
import { NORTH } from "../northData";
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

/**
 * A name from a list, weighted by the list's order and (where it carries them) the state's era. Names in
 * `avoid` are skipped while the list has others (shared tables brief §14.1); when it has none left a repeat is allowed.
 */
function draw(list: readonly PeopleEntry[], era: string, rng: () => number, avoid: ReadonlySet<string>): string {
  const free = avoid.size > 0 ? list.filter((e) => !avoid.has(e[0])) : list;
  const from = free.length > 0 ? free : list;
  return pickWeighted(from, eraWeights(from, era), rng)[0];
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
function person(c: Ctx, slot: string, known?: "male" | "female", plain = false): string | undefined {
  const spec = SLOTS[slot];
  if (!spec) return undefined;
  const rng = c.req.rng;
  const all = (c.table.surnames ? spec.withSurnames : spec.withoutSurnames) ?? spec.forms ?? spec.withSurnames ?? spec.withoutSurnames;
  if (!all) return undefined;
  // Northern Europe brief 5a §11.6: straight after a bare generic a person takes no title ("Lake Duke Hale"): only the forms without one.
  const untitled = plain ? all.filter((f) => !/\{(t|r)\}/.test(f[0])) : all;
  const forms = untitled.length > 0 ? untitled : all;
  const share = spec.sexShare ?? { male: 50, female: 50 };
  const rolled: "male" | "female" = rng() * (share.male + share.female) < share.male ? "male" : "female";
  // Shared tables brief §13.2 item 4: a name whose subject has a known sex (a female title) takes a given name of that sex.
  const sex = known ?? rolled;
  const form = pickForm(forms, rng);
  return form.replace(/\{(g|gm|gf|s|t|r|rm|rf)\}/g, (_w, token: string) => {
    switch (token) {
      case "g": return given(c, sex);
      case "gm": return given(c, "male");
      case "gf": return given(c, "female");
      case "s": return surname(c, sex);
      case "t": return officialTitle(c.culture, sex === "female", rng) ?? given(c, sex);
      case "r": {
        let ruler = pickForm(c.table.rulerForms.male, rng);
        const name = regnal(c, "male");
        // Shared tables brief §13.4: "Inca {m}" is never put on a name that already holds Inca ("Manco Inca", "Inca Roca").
        if (/\bInca\b/.test(ruler) && /\bInca\b/.test(name)) ruler = c.table.rulerForms.male.map((f) => f[0]).find((f) => !/\bInca\b/.test(f)) ?? ruler;
        return ruler.replace("{m}", name);
      }
      case "rm": return regnal(c, "male");
      default: return regnal(c, "female");
    }
  });
}

function holy(c: Ctx, plain = false): string {
  const form = plain ? (c.req.rng() < 0.7 ? "Saint {n}" : "{n}") : pickForm(c.table.holyForms, c.req.rng);
  const name = draw(c.table.holy, c.req.era, c.req.rng, c.req.avoid);
  // Shared tables brief §13.4: a colonial saint ("Rose", "Martin de Porres") only ever takes the "Saint {n}" form.
  return (c.table.saintOnly?.includes(name) ? "Saint {n}" : form).replace("{n}", name);
}

function context(req: FillRequest): Ctx | undefined {
  const source = peopleSourceFor(req.culture, req.region, req.era, req.rng);
  return source ? { req, culture: source.culture, period: source.period, table: source.table } : undefined;
}

export const personResolver: Resolver = (req) => {
  const c = context(req);
  if (!c || !req.slot) return undefined;
  let said = person(c, req.slot, req.sex, req.plain);
  // A pair that makes a famous real person is drawn again.
  for (let attempt = 0; said !== undefined && isBlockedName(said) && attempt < 12; attempt++) said = person(c, req.slot, req.sex, req.plain);
  return said !== undefined && isBlockedName(said) ? undefined : said;
};
export const holyResolver: Resolver = (req) => {
  const c = context(req);
  return c ? holy(c, req.plain) : undefined;
};
export const surnameResolver: Resolver = (req) => {
  const c = context(req);
  return c ? surname(c, req.rng() < 0.7 ? "male" : "female") : undefined;
};

/**
 * Shared tables brief §14.2: the people who coined old place names ("Godricing Tarn"). The culture is drawn by the
 * `oldNames` weights in fill.json (Anglo-Saxon by default, Scandinavian, Welsh, Cornish or Scottish by region), and the
 * name is a man's given name from that culture's historic table, whatever the state's culture or era.
 * Northern Europe brief 5a §11.6: the culture first (Irish names are Irish, Welsh Welsh, Norse and Scandinavian Scandinavian, German German;
 * Celtic by its region, else evenly the four nations), the region second, and only the English keys (and the rest) draw Anglo-Saxon, with the Danelaw share.
 */
const OLD_NAMES = (FILL as unknown as { oldNames: { default: [string, number][]; regions: Record<string, [string, number][]>; cultures: Record<string, [string, number][]> } }).oldNames;
/**
 * Brief 5b §12.3: a name that is also a feature word of a module list ("Turlough", a seasonal lake) is not drawn for an old personal name
 * ("Turloughing Tarn"): the names come from the people tables, but never one that reads as a landscape word.
 */
let featureWords: Set<string> | undefined;
function featureWordSet(): Set<string> {
  if (featureWords) return featureWords;
  featureWords = new Set<string>();
  const add = (w: unknown) => { if (typeof w === "string") featureWords!.add(w.trim()); };
  for (const pool of Object.values(NORTH.vocab.pools)) {
    for (const e of pool.entries ?? []) add(e.w);
    for (const list of Object.values(pool.cultureExtra ?? {})) for (const e of list) add(e.w);
  }
  for (const tag of [...Object.keys(NORTH.wilds.regionTags), ...Object.keys(NORTH.waters.regionTags)]) add(tag.charAt(0).toUpperCase() + tag.slice(1));
  return featureWords;
}
export const oldPersonResolver: Resolver = (req) => {
  const byCulture = OLD_NAMES.cultures[req.culture];
  const weights = (req.culture === "celtic" && req.region ? OLD_NAMES.regions[req.region] : undefined) ?? byCulture ?? (req.region ? OLD_NAMES.regions[req.region] : undefined) ?? OLD_NAMES.default;
  const culture = pickWeighted(weights.map((w) => w[0]), weights.map((w) => w[1]), req.rng);
  const c = context({ ...req, culture, era: "MD", period: "historic", region: undefined });
  if (!c) return undefined;
  return given({ ...c, req: { ...c.req, avoid: new Set([...c.req.avoid, ...featureWordSet()]) } }, "male");
};

/** Registers the people sources with the filler. */
export function registerPeopleResolvers(): void {
  registerResolver("person", personResolver);
  registerResolver("holy", holyResolver);
  registerResolver("surname", surnameResolver);
  registerResolver("oldPerson", oldPersonResolver);
}
