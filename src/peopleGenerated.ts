// Shared tables brief §4 and §6: the generated mode. Names are made by the Markov generator, trained
// in memory on the same lists the real mode draws from: given names from `male` and `female`,
// surnames from `surnames`. A model is built once per culture, period and list and kept. A list too
// small for the Breakdown minimum is not offered, and the filler falls back to the real list.
//
// Where Kenny's built-in templates cover a culture and period (Old Cornish, Anglo-Saxon, Victorian,
// England) the model trains on his template, variants included, and then on the table's other names
// (review amendment §12.2); there is no second template for them.

import builtin from "./data/builtin-templates.json";
import { BREAKDOWN_MIN_NAMES, MarkovModel } from "./markov";
import { peopleTable, type PeopleEntry, type PeoplePeriod } from "./people";

export type GeneratedList = "male" | "female" | "surnames";

type Template = { name: string; sections?: { name: string; items: string[] }[] };
const TEMPLATES = builtin as Template[];

/** Kenny's own templates and the people tables they feed. */
const OWN_TEMPLATE: Record<string, string> = {
  "cornish/historic": "Old Cornish",
  "anglo-saxon/historic": "Anglo-Saxon",
  "norman-british/modern": "Victorian, England",
};

const templateNames = (template: string, list: GeneratedList): string[] =>
  TEMPLATES.find((t) => t.name === template)?.sections?.find((s) => s.name.toLowerCase() === list)?.items ?? [];

/** What a list's model learns from: Kenny's template where there is one, then the table's own names. */
export function trainingNames(culture: string, period: PeoplePeriod, list: GeneratedList): string[] {
  const table = peopleTable(culture, period);
  const entries: PeopleEntry[] = table?.[list] ?? [];
  const own = OWN_TEMPLATE[`${culture}/${period}`];
  const names = [...(own ? templateNames(own, list) : []), ...entries.map((e) => e[0])];
  const seen = new Set<string>();
  return names.filter((n) => (seen.has(n.toLowerCase()) ? false : (seen.add(n.toLowerCase()), true)));
}

/** Whether a list is big enough to train a model (the Breakdown minimum, brief §4). */
export const generationOffered = (culture: string, period: PeoplePeriod, list: GeneratedList): boolean =>
  trainingNames(culture, period, list).length >= BREAKDOWN_MIN_NAMES;

const MODELS = new Map<string, MarkovModel | null>();

/** The cached model for a list, or undefined when the list is too small. */
export function generatedModel(culture: string, period: PeoplePeriod, list: GeneratedList): MarkovModel | undefined {
  const key = `${culture}/${period}/${list}`;
  if (!MODELS.has(key)) {
    const names = trainingNames(culture, period, list);
    MODELS.set(key, names.length >= BREAKDOWN_MIN_NAMES ? MarkovModel.build(names) : null);
  }
  return MODELS.get(key) ?? undefined;
}

/** How many models are built (for the cache test). */
export const generatedModelCount = (): number => [...MODELS.values()].filter((m) => m).length;

/**
 * One generated name, drawing its seed from the batch's stream; names in `avoid` are skipped. Undefined
 * when the list has no model: the filler then uses the real list.
 */
export function generatedName(culture: string, period: PeoplePeriod, list: GeneratedList, rng: () => number, avoid: ReadonlySet<string> = new Set()): string | undefined {
  const model = generatedModel(culture, period, list);
  if (!model) return undefined;
  for (let attempt = 0; attempt < 6; attempt++) {
    const seed = Math.floor(rng() * 0x7fffffff);
    const [name] = model.generate({ count: 1, seed });
    if (name && !avoid.has(name)) return name;
  }
  return undefined;
}
