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
  /** Shared tables brief §14.3: the state's biome id, which folk fills are drawn in (a British home is temperate). */
  biome?: string;
  mode: FillMode;
  /** The batch's seeded stream: the filler draws from it, never from Math.random. */
  rng: () => number;
  /** The sex of the name's subject, where the engine knows it (a female title takes a woman's given name). */
  sex?: "male" | "female";
  /** Shared tables brief §13.2 item 6: a place module from the steam age on (and stars and space always): [person] reads the founder forms. */
  personAsFounder?: boolean;
  /** Series mode: each label is filled once per batch and reused. Pass the same map for every name in a batch. */
  series?: Map<string, string>;
  /** Shared tables brief §14.1: the fills already used in this batch, by label. Outside series mode a fill isn't reused while the list has others. Pass the same map for every name in a batch. */
  batchSeen?: Map<string, Set<string>>;
  /** Northern Europe brief 5c §13.1: when set, only brackets with these labels (lower case) are filled. */
  onlyLabels?: ReadonlySet<string>;
  /** Brief 5d §14.1 item 3: a `[place]` is filled from settlement names only, never a person's name (the group, bynames, realms and craft modules). */
  settlementPlaces?: boolean;
  /** Brief 6a Part A §2: set on the second pass over a fill that holds a bracket of its own. */
  nested?: boolean;
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
  biome?: string;
  mode: FillMode;
  rng: () => number;
  /** The sex the name's subject is known to have (see FillContext). */
  sex?: "male" | "female";
  /** Northern Europe brief 5a §11.6: the fill follows a bare generic ("Lake [holy person]"): a holy fill takes "Saint {n}" or the bare name, a person fill no title. */
  plain?: boolean;
  /** Brief 5b §12.3: the rest of the name around the bracket, other brackets left out ("Coast of", "Hanse Quay"); only for place sources. */
  rest?: string;
  /** Brief 5b §12.3: the name already holds a place fill: a name takes at most one, so this one is a single word. */
  placeBefore?: boolean;
  /** Brief 5d §14.1 item 3: the place comes from settlement names only. */
  settlementPlaces?: boolean;
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

const STAY_FOR = (FILL as unknown as { stayBracketedFor: { cultures: Record<string, string>; modules: Record<string, string> } }).stayBracketedFor;
/** Brief 6a Part A §2: why a bracket may survive in `real` mode for this culture or module, if it may. */
export const stayBracketedReason = (opts: { culture?: string; module?: string }): string | undefined => (opts.culture ? STAY_FOR.cultures[opts.culture] : undefined) ?? (opts.module ? STAY_FOR.modules[opts.module] : undefined);

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
/** Shared tables brief §14.1: tries to find a fill not yet used in the batch before accepting a repeat (a short list has run out). */
const BATCH_AGAIN = 40;
/** Shared tables brief §13.2 item 1: a place fill is drawn again, up to this many times, when it repeats the feature's generic. */
const PLACE_AGAIN = 10;
const PLACE_SOURCES = new Set(["place", "earlierPlace"]);
/** Brief 5b §12.3: the sources whose fill must not repeat the generic it follows or precedes ("Lake of Alder Valley", "River River Mother"). */
const GUARDED_SOURCES = new Set(["place", "earlierPlace", "deity", "folk"]);
/** Shared tables brief §14.2: the endings that make a personal name an old one ("Godricing", "Cuthbertington", "Wulfingham"). */
/** Northern Europe brief 5a §11.6: words after which a fill is not following a generic ("Isle of [folk]", "Hall in [place]"). */
const NOT_GENERIC = new Set(["of", "the", "and", "on", "in", "at", "by", "upon", "with", "to", "a", "from", "for", "near"]);
/** Whether the text before a fill ends in a bare generic: a capitalised word that isn't a joining word ("Lake ", "Glen "). */
export function followsBareGeneric(before: string, after: string): boolean {
  if (/^['’]s\b/.test(after)) return false;
  const m = before.match(/(?:^|\s)([A-Z][\w'’-]*)\s$/);
  return !!m && !NOT_GENERIC.has(m[1].toLowerCase());
}

const OLD_ENDING = /^(ing|ings|ington|ingham|inghams)\b/i;
const STOP_WORDS = new Set(["of", "the", "and", "on", "in", "at", "by", "upon", "with", "to", "a"]);

/**
 * Whether a place fill repeats the generic of the feature it names: "Valley of [place]" with "Alder Valley",
 * "[place] Hill" with "Ashhill". The fill's last word equals a word of the rest of the name, or ends with it.
 */
/** Second pass (brief §12 §6): a place that is itself "X of Y" takes its article after a preposition ("Nawab of the Mountain of Rashid"). */
const PLACE_NOUN = "Mountain|Valley|Temple|Lake|River|Hill|Spring|Well|Isle|Island|Plain|Garden|Tower|Fort|Castle|Gate|Cape|Bay|Cave|Forest|Wood|Sea|City|Town|Camp|Citadel|Fortress|Landing|Harbour|Bridge|Pass|Peak|Ridge|Field|Stone|Dam|Mine|Quarry|Oasis|Desert|Dune|Steppe|Marsh|Mound|Pool|Fountain|Canal|Port|Village|Waters|Fields|Hills|Mountains";
const NESTED_PLACE = new RegExp(`\\b(of|to|from|over|above|beyond|beside|behind|near|in|at|by|off) (?=(?:${PLACE_NOUN}) of )`, "g");
export const withArticles = (text: string): string => text.replace(NESTED_PLACE, "$1 the ").replace(/\b(of|to|from|in) At the /g, "$1 the ");
const REALM_FORM = /(^|[^A-Za-z])(Kingdom|Empire|Province|Sultanate|Emirate|Caliphate|Khanate|Khaganate|Duchy|Dukedom|Principality|Realm|Domain|Federation|Republic|Confederation|Confederacy|County|Lordship|Imamate|Commonwealth|Protectorate|Dominion|Shahdom|Satrapy)([^A-Za-z]|$)/;
export function repeatsGeneric(fill: string, rest: string): boolean {
  // Second pass (brief §12 §6): a realm is not a realm of a realm ("Khanate of Republic Square").
  if (REALM_FORM.test(fill) && REALM_FORM.test(rest.replace(/\[[^\]]*\]/g, " "))) return true;
  const words = fill.trim().split(/\s+/);
  const clean = (w: string | undefined) => w?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
  const last = clean(words[words.length - 1]);
  // Brief 5b §12.3: a fill that starts with the generic it follows ("River" + "River Mother") repeats it too.
  const first = clean(words[0].toLowerCase() === "the" ? words[1] : words[0]);
  const around = rest
    .replace(/\[[^\]]*\]/g, " ")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
  if (first.length >= 3 && words.length > 1 && around.includes(first)) return true;
  if (last.length < 3) return false;
  return around.some((w) => last === w || (w.length >= 4 && last.endsWith(w)));
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
  let placeDone = 0;
  const filled = name.replace(/\[([^\]]+)\]/g, (whole: string, label: string, offset: number) => {
    let info = labelInfo(label);
    if (!info) return whole;
    const key = label.trim().toLowerCase();
    // Northern Europe brief 5c §13.1: a per-slot run fills only the labels of the slots set to real-world or generated names.
    if (ctx.onlyLabels && !ctx.onlyLabels.has(key)) return whole;
    // Shared tables brief §14.2: a personal name that an "-ing", "-ington" or "-ingham" ending follows was coined by an early people.
    if (info.source === "person" && key === "personal name" && OLD_ENDING.test(name.slice(offset + whole.length))) info = labelInfo("old personal name") ?? info;
    // Northern Europe brief 5a §11.6: a holy or person fill straight after a bare generic is plain; a folk fill never is (a person takes its place).
    const plain = (info.source === "holy" || info.source === "person" || info.source === "folk") && followsBareGeneric(name.slice(0, offset), name.slice(offset + whole.length));
    if (plain && info.source === "folk") info = { source: "person", slot: "founder" };
    let fill = ctx.series?.get(key);
    if (fill === undefined) {
      const resolver = resolvers[info.source];
      if (!resolver) return whole;
      const inName = used.get(key) ?? new Set<string>();
      const seen = ctx.series ? undefined : ctx.batchSeen?.get(key);
      const avoid = seen && seen.size > 0 ? new Set([...inName, ...seen]) : inName;
      const place = PLACE_SOURCES.has(info.source);
      const guarded = GUARDED_SOURCES.has(info.source);
      const slot = ctx.personAsFounder && info.source === "person" && (key === "person" || key === "personal name") ? "founder" : info.slot;
      const rest = guarded ? `${name.slice(0, offset)} ${name.slice(offset + whole.length)}` : "";
      const tries = seen && seen.size > 0 ? BATCH_AGAIN : guarded ? PLACE_AGAIN : AGAIN;
      // Brief 5b §12.3: a name takes at most one place fill; a second is a single word.
      const placeBefore = place && placeDone > 0;
      // Brief 6d A3: where a culture's personal name is a common English word or a famous place, a possessive fill ("Park's Tea House", "Fuji's Eating House") takes another.
      const possessive = POSSESSIVE_GUARD.has(ctx.culture) && /^['’]s\b/.test(name.slice(offset + whole.length));
      for (let attempt = 0; attempt < tries; attempt++) {
        fill = resolver({ label: key, source: info.source, slot, culture: ctx.culture, era, period, region: ctx.region, biome: ctx.biome, mode: ctx.mode, rng: ctx.rng, sex: ctx.sex, ...(plain ? { plain } : {}), ...(place ? { rest: rest.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim(), ...(placeBefore ? { placeBefore } : {}), ...(ctx.settlementPlaces ? { settlementPlaces: true } : {}) } : {}), avoid });
        if (fill === undefined || (!avoid.has(fill) && !/\[/.test(fill) && !(guarded && repeatsGeneric(fill, rest)) && !(possessive && READS_AS_WORD.has(fill.toLowerCase())))) break;
      }
      if (fill === undefined) return whole;
      // Brief 6a Part A §2: a fill that is itself a drawn name with a bracket of its own (a realm "of [dynasty]") has that bracket filled once; one that still has a bracket leaves the label as it was.
      if (/\[/.test(fill)) {
        if (ctx.nested) return whole;
        fill = fillSlots(fill, { ...ctx, nested: true, series: undefined, batchSeen: undefined, onlyLabels: undefined });
        if (/\[/.test(fill)) return whole;
      }
      if (place) placeDone++;
      ctx.series?.set(key, fill);
      if (ctx.batchSeen && !ctx.series) ctx.batchSeen.set(key, (ctx.batchSeen.get(key) ?? new Set<string>()).add(fill));
    }
    used.set(key, (used.get(key) ?? new Set<string>()).add(fill));
    const before = name.slice(0, offset);
    const after = name.slice(offset + whole.length);
    if (/\bthe\s$/i.test(before)) fill = fill.replace(/^the\s+/i, "");
    // A folk fill after "of" takes "the" ("Isle of the Fell People").
    else if (info.source === "folk" && /\bof\s$/i.test(before) && !/^the\s/i.test(fill)) fill = `the ${fill}`;
    // Brief 5b §12.3: a deity fill is an epithet ("Keeper of Masks"): after "of" it takes "the" ("Valley of the Keeper of Masks").
    else if (info.source === "deity" && /\bof\s$/i.test(before) && !/^(the|she|he|they|one)\s/i.test(fill)) fill = `the ${fill}`;
    // Second pass (brief §12 §6): a fill that starts with "The" is "the" in the middle of a name ("Inn of the Three Taverns").
    if (/\S\s$/.test(before) && /^The\s/.test(fill)) fill = `the${fill.slice(3)}`;
    if (/^['’]s\b/.test(after)) fill = fill.replace(/['’]s$/, "");
    any = true;
    return fill;
  });
  // A name the filler changed never starts with a lower-case "the"; one it left alone is as the engine made it.
  const out = any ? withArticles(filled.replace(/^the\b/, "The")) : filled;
  return ctx.onlyLabels ? out : completeTitles(out, ctx, era, period, resolvers);
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

/** Brief 6d A3: the cultures whose personal names read as English words or famous places in a possessive ("Fuji\'s Eating House"), and those names. */
const POSSESSIVE_GUARD = new Set(["indian", "chinese", "japanese", "korean"]);
const READS_AS_WORD = new Set(["man", "park", "moon", "song", "sun", "son", "fuji", "hong"]);
