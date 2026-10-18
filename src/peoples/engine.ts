// Peoples and tongues (docs/peoples-and-tongues-brief.md): from a place or realm name, the name for its
// people, the adjective and the language, by the rules English itself uses. A set of rules, not a list
// of real demonyms (the Sun's system apart). Reuses the group engine's weighted draws, tone factor and
// repetition check, the money module's banned words, and `pluralOf`. No Obsidian imports.

import peoplesData from "../data/peoples-tongues.json";
import { pluralOf } from "../biomes";
import { BYNAME_CULTURES } from "../bynames/engine";
import { type GroupSafeguards, type GroupToneChoice, normForBlock, pickWeighted, repeatsContent, toneFactor } from "../groups/engine";
import { mulberry32 } from "../markov";
import { breaksMoneyWords } from "../money/engine";
import { ALL_FORMS } from "../realms/engine";
import { ROUTE_ERAS } from "../routes/engine";

// ── Data ────────────────────────────────────────────────────────────────────

export type PeopleFamily = "an" | "ian" | "er" | "ish" | "ese" | "i" | "ite" | "ine" | "iot" | "ene" | "itan" | "ec" | "clip" | "man" | "folk" | "ings" | "learned" | "born" | "sider";
export type PeopleEra = "AN" | "MD" | "EM" | "ST" | "MO" | "NF" | "IS";
export type PeopleGiving = "both" | "peoples" | "languages";
export type PeopleDetail = "one" | "older" | "dialects";

interface EndingRow {
  id: string;
  ends: string[];
  mult: Partial<Record<PeopleFamily, number>>;
  others: number;
  endMult?: Record<string, Partial<Record<PeopleFamily, number>>>;
}

interface LanguageShape {
  p: string;
  w: number;
  from?: PeopleEra;
  t?: string[];
}

interface PeoplesData {
  weights: Record<string, Partial<Record<PeopleFamily, number>>>;
  suffixes: Record<string, string>;
  ic: Record<string, number>;
  icLandOnly: string[];
  adjectiveIc: number;
  erAdjective: { place: number; ish: number; ic: number };
  endings: EndingRow[];
  clipEnds: string[];
  learned: { ends: string[]; add: string; strip: boolean }[];
  eraBoost: { add: Partial<Record<PeopleFamily, number>>; mult: Partial<Record<PeopleFamily, number>> };
  toneMult: Record<string, Partial<Record<PeopleFamily, number>>>;
  generics: { words: string[]; person: string; people: string[]; eras?: PeopleEra[] }[];
  genericLanguage: { p: string; w: number }[];
  landWords: string[];
  colonistShare: number;
  sun: { names: string[]; person: string[]; adjective: string; people: string[]; language: string }[];
  languageShapes: LanguageShape[];
  harbourWords: string[];
  older: Record<PeopleEra, string[]>;
  dialectWords: string[];
  dialectWordsSpace: string[];
  safeguards: { block: string[]; flag: string[]; flagListBlocks: boolean; banned: string[] };
}

export const PEOPLES_DATA = peoplesData as unknown as PeoplesData;
/** BT's twenty cultures (§3), in BT's order. */
export const PEOPLE_CULTURES = BYNAME_CULTURES;
export const PEOPLE_ERAS = ROUTE_ERAS;
export const PEOPLE_FAMILIES: PeopleFamily[] = ["an", "ian", "er", "ish", "ese", "i", "ite", "ine", "iot", "ene", "itan", "ec", "clip", "man", "folk", "ings", "learned", "born", "sider"];

const ERA_ORDER: PeopleEra[] = ["AN", "MD", "EM", "ST", "MO", "NF", "IS"];
const eraFrom = (era: PeopleEra, from?: PeopleEra) => !from || ERA_ORDER.indexOf(era) >= ERA_ORDER.indexOf(from);
const isFuture = (era: PeopleEra) => era === "NF" || era === "IS";
const asEra = (era: string | undefined): PeopleEra => (ROUTE_ERAS.some((e) => e.code === era) ? (era as PeopleEra) : "MD");

// ── Letters ─────────────────────────────────────────────────────────────────

const SMALL = new Set(["of", "the", "and", "for", "in", "at", "by", "on", "to", "from"]);
const silentE = (w: string) => /[^aeiouy]e$/i.test(w);
const startsWithVowel = (s: string) => /^[aeiouy]/i.test(s);
/** §5.4 rule 4: groups of vowels, not counting a final silent e. */
export function syllables(word: string): number {
  const s = silentE(word) ? word.slice(0, -1) : word;
  return (s.toLowerCase().match(/[aeiouy]+/g) ?? []).length;
}
/** §5.4 rule 2, §5.5: one vowel and one consonant at the end (the consonant not h, w, x or y). */
const endsVC = (w: string) => /(?:^|[^aeiouy])[aeiou][bcdfgjklmnpqrstvz]$/i.test(w);

/** §5.4: a suffix on a stem: the silent e goes before a vowel, and a one-syllable vowel–consonant stem doubles. */
export function attach(stem: string, suffix: string): string {
  if (!startsWithVowel(suffix)) return stem + suffix;
  if (silentE(stem)) return stem.slice(0, -1) + suffix;
  if (syllables(stem) === 1 && endsVC(stem)) return stem + stem.slice(-1) + suffix;
  return stem + suffix;
}

/** Plurals by `pluralOf`, with -es after s, x, z, ch and sh. */
const plural = (w: string) => (/(s|x|z|ch|sh)$/i.test(w) ? `${w}es` : pluralOf(w));

const capitalWords = (text: string) =>
  text
    .split(" ")
    .map((w, i) => (w && /^[a-z]/.test(w) && !(i > 0 && SMALL.has(w)) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");

// ── Normalising (§4) ────────────────────────────────────────────────────────

export interface NameParts {
  /** The name as it was given (step 1). */
  shown: string;
  /** The name after steps 2–4, without "the". */
  bare: string;
  /** Whether the name was given with a leading "the". */
  the: boolean;
  /** The words before the head word, with a trailing space (or empty). */
  lead: string;
  head: string;
}

const FORM_WORDS = ALL_FORMS.map((f) => f.toLowerCase());
const endsWithForm = (text: string) => {
  const t = text.toLowerCase();
  return FORM_WORDS.some((f) => t === f || t.endsWith(` ${f}`));
};

export function normaliseName(raw: string): NameParts {
  const shown = raw.trim().replace(/\s+/g, " ");
  let s = shown.replace(/\([^)]*\)|\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
  let the = false;
  const stripThe = () => {
    const m = s.match(/^the\s+(.+)$/i);
    if (m) {
      s = m[1];
      the = true;
    }
  };
  stripThe();
  for (let i = 0; i < 3; i++) {
    const m = s.match(/^(.+?) of (.+)$/i);
    if (!m || !endsWithForm(m[1])) break;
    s = m[2];
    stripThe();
  }
  s = s.replace(/-(?:on|upon|by|under|in|le|next-the)-.+$/i, "");
  s = capitalWords(s);
  const words = s.split(" ");
  const head = words[words.length - 1] ?? "";
  return { shown, bare: s, the, lead: words.length > 1 ? `${words.slice(0, -1).join(" ")} ` : "", head };
}

const displayName = (p: NameParts) => (p.the ? `the ${p.bare}` : p.bare);

// ── Endings (§5.8) ──────────────────────────────────────────────────────────

const lower = (s: string) => s.toLowerCase();

/** The §5.8 row the head word falls under, and the literal ending it matched. */
export function endingOf(head: string): { id: string; ending: string } {
  const h = lower(head);
  const consonantBefore = (n: number) => h.length > n && !/[aeiouy]/.test(h[h.length - n - 1]);
  for (const row of PEOPLES_DATA.endings) {
    for (const end of row.ends) {
      if (!h.endsWith(end)) continue;
      if (row.id === "y" && !consonantBefore(1)) continue;
      if (row.id === "e" && !consonantBefore(1)) continue;
      return { id: row.id, ending: end };
    }
  }
  return { id: "other", ending: "" };
}

const endingRow = (id: string) => PEOPLES_DATA.endings.find((r) => r.id === id)!;

// ── Learned forms (§5.6) ────────────────────────────────────────────────────

function learnedForm(head: string): string | undefined {
  const h = lower(head);
  for (const row of PEOPLES_DATA.learned) {
    const end = row.ends.find((e) => h.endsWith(e));
    if (!end) continue;
    return (row.strip ? head.slice(0, head.length - end.length) : head) + row.add;
  }
  return undefined;
}

// ── Clipping (§5.5) ─────────────────────────────────────────────────────────

function clipStem(head: string, id: string): string | undefined {
  const h = lower(head);
  let cut = 0;
  if (id === "land") cut = 4;
  else if (id === "mark") cut = 4;
  else if (id === "stan") cut = h.endsWith("istan") ? 5 : 4;
  else if (id === "ia") cut = 2;
  else if (id === "ey") cut = 2;
  else if (id === "y" || id === "a") cut = 1;
  else if (id === "n" && h.endsWith("en")) cut = 1;
  else return undefined;
  const stem = head.slice(0, head.length - cut);
  if (stem.length < 3 || syllables(stem) > 2) return undefined;
  return stem;
}

// ── Weights (§5.7–§5.9) ─────────────────────────────────────────────────────

export type FamilyWeights = Partial<Record<PeopleFamily, number>>;

/** The family weights for a head word: culture weights, then endings, era and tone. */
export function familyWeights(name: string, culture: string, era: PeopleEra = "MD", tone: GroupToneChoice = "any"): FamilyWeights {
  const parts = normaliseName(name);
  return weightsFor(parts.head, culture, era, tone);
}

function weightsFor(head: string, culture: string, era: PeopleEra, tone: GroupToneChoice): FamilyWeights {
  const base: FamilyWeights = { ...(PEOPLES_DATA.weights[culture] ?? PEOPLES_DATA.weights.general) };
  if (isFuture(era)) for (const [f, w] of Object.entries(PEOPLES_DATA.eraBoost.add) as [PeopleFamily, number][]) base[f] = (base[f] ?? 0) + w;
  const { id, ending } = endingOf(head);
  const row = endingRow(id);
  const mult = { ...row.mult, ...(row.endMult?.[ending] ?? {}) };
  const out: FamilyWeights = {};
  for (const f of Object.keys(base) as PeopleFamily[]) {
    let w = base[f]! * (mult[f] ?? row.others);
    if (isFuture(era)) w *= PEOPLES_DATA.eraBoost.mult[f] ?? 1;
    if (tone !== "any") w *= PEOPLES_DATA.toneMult[tone]?.[f] ?? 1;
    // The families a name can't take.
    if (f === "learned" && !learnedForm(head)) w = 0;
    if (f === "clip" && !clipStem(head, id)) w = 0;
    if (w > 0) out[f] = w;
  }
  return out;
}

const isIcCulture = (culture: string, id: string) => culture in PEOPLES_DATA.ic && (!PEOPLES_DATA.icLandOnly.includes(culture) || id === "land");

// ── Joining ─────────────────────────────────────────────────────────────────

/** The word a suffix family builds on the head word (§5.4, §5.8 joins). */
function suffixed(head: string, id: string, suffix: string): string {
  const cut = (n: number) => head.slice(0, head.length - n);
  switch (id) {
    case "mark":
      return attach(cut(4), suffix);
    case "ia":
      if (suffix === "an" || suffix === "ian") return `${head}n`;
      if (suffix === "ite") return `${cut(2)}ite`;
      return attach(head, suffix);
    case "stan":
      return suffix === "i" ? `${head}i` : attach(head, suffix);
    case "double":
      return head + suffix;
    case "a":
      if (suffix === "an") return `${head}n`;
      if (suffix === "ese" || suffix === "i") return cut(1) + suffix;
      return attach(head, suffix);
    case "y":
      return suffix === "ian" || suffix === "an" ? cut(1) + suffix : attach(head, suffix);
    case "o":
      if (suffix === "an") return cut(1) + suffix;
      if (suffix === "ese") return `${head}lese`;
      if (suffix === "ite") return `${head}ite`;
      return attach(head, suffix);
    case "u":
      if (suffix === "ian") return `${head}vian`;
      if (suffix === "an") return `${head}an`;
      return attach(head, suffix);
    case "i":
      return suffix === "an" ? `${head}an` : attach(head, suffix);
    case "us":
      return ["ian", "iot", "ene", "an"].includes(suffix) ? cut(2) + suffix : attach(head, suffix);
    default:
      return attach(head, suffix);
  }
}

/** S-ish: the -land, -ey and -mark stems lose their ending (Fennish, Tarkish). */
function ishWord(head: string, id: string): string {
  if (id === "land") return attach(head.slice(0, -4), "ish");
  if (id === "ey") return attach(head.slice(0, -2), "ish");
  if (id === "mark") return attach(head.slice(0, -4), "ish");
  return attach(head, "ish");
}

/** S-ic: a final vowel goes before it (Corsic), as the -ey and -mark stems do. */
function icWord(head: string, id: string): string {
  if (id === "land") return attach(head, "ic");
  if (id === "ey") return attach(head.slice(0, -2), "ic");
  if (id === "mark") return attach(head.slice(0, -4), "ic");
  if (id === "ia") return attach(head.slice(0, -2), "ic");
  if (id === "a" || id === "o" || id === "u" || id === "i" || id === "y") return attach(head.slice(0, -1), "ic");
  return attach(head, "ic");
}

/** The word S-er, S-man and the like are built on. */
const erWord = (head: string, id: string) => suffixed(head, id, "er");
const stemFor = (head: string, id: string) => (id === "mark" ? head.slice(0, -4) : head);

// ── Forms ───────────────────────────────────────────────────────────────────

export interface PeopleChoice {
  /** The 50% long or short clipped person. */
  clip?: "long" | "short";
  /** The `er` adjective. */
  adjective?: "place" | "ish" | "ic";
  /** Whether the language base is the S-ic form. */
  ic?: boolean;
  /** Which of a pair of people or person forms (Fellsmen or Fellsfolk, Terran or Earther). */
  pick?: number;
  /** Which generic or fallback language form: 0 "the speech of", 1 "speech", 2 "dialect". */
  speech?: number;
  /** Whether a fallback people reads "the {name} colonists". */
  colonists?: boolean;
}

export interface PeopleForms {
  family: PeopleFamily | "generic" | "fallback" | "sun";
  /** The person form; two forms (man and woman) are joined with a comma. Undefined: none. */
  person?: string;
  adjective: string;
  people: string;
  /** The language base L (§8.1), or the whole language phrase where `phrase` is set. */
  language: string;
  /** The language is a finished phrase (the speech of …) and takes no §8.2 shape. */
  phrase?: boolean;
  /** The S-ic base the language may use instead (§8.1). */
  ic?: string;
}

const sunForms = (parts: NameParts, choice: PeopleChoice): PeopleForms | undefined => {
  const key = lower(parts.bare);
  const row = PEOPLES_DATA.sun.find((s) => s.names.includes(key));
  if (!row) return undefined;
  const i = Math.min(choice.pick ?? 0, row.person.length - 1);
  return { family: "sun", person: row.person[i], adjective: row.adjective, people: row.people[i], language: row.language };
};

function genericRow(parts: NameParts, era: PeopleEra) {
  const words = parts.bare.split(" ");
  const ofAt = words.indexOf("of");
  const rows = PEOPLES_DATA.generics.filter((g) => !g.eras || g.eras.includes(era));
  if (ofAt > 0) {
    const row = rows.find((g) => g.words.includes(lower(words[ofAt - 1])));
    if (!row) return undefined;
    const name = words.slice(ofAt + 1).join(" ").replace(/^the /i, "");
    return { row, qualifier: [...words.slice(0, ofAt - 1), name].filter(Boolean).join(" ") };
  }
  const row = rows.find((g) => g.words.includes(lower(parts.head)));
  return row ? { row, qualifier: parts.lead.trim() } : undefined;
}

const womanOf = (person: string) => person.replace(/man$/, "woman");

function genericForms(parts: NameParts, era: PeopleEra, choice: PeopleChoice): PeopleForms | undefined {
  const found = genericRow(parts, era);
  if (!found) return undefined;
  const { row, qualifier } = found;
  const q = qualifier ? `${qualifier} ` : "";
  const person = /man$/.test(row.person) ? `${q}${row.person}, ${q}${womanOf(row.person)}` : `${q}${row.person}`;
  const peopleWord = row.people[Math.min(choice.pick ?? 0, row.people.length - 1)];
  const speech = displaySpeech(parts, choice.speech ?? 0);
  return { family: "generic", person, adjective: parts.bare, people: `the ${q}${peopleWord}`, language: speech, phrase: true };
}

function displaySpeech(parts: NameParts, which: number): string {
  const name = displayName(parts);
  return which === 1 ? `${parts.bare} speech` : which === 2 ? `${parts.bare} dialect` : `the speech of ${name}`;
}

/** §6.3: a name the rules can't take. */
function fallbackForms(parts: NameParts, choice: PeopleChoice): PeopleForms {
  const name = displayName(parts);
  return {
    family: "fallback",
    adjective: parts.bare,
    people: choice.colonists ? `the ${parts.bare} colonists` : `the folk of ${name}`,
    language: `the speech of ${name}`,
    phrase: true,
  };
}

/** §4 step 6: the name that goes to the fallback before any ending rule. */
function needsFallback(parts: NameParts): boolean {
  if (/\d/.test(parts.bare)) return true;
  if (/\w['’]s(\s|$)|s['’](\s|$)/.test(parts.bare)) return true;
  if (parts.head.replace(/[^\p{L}]/gu, "").length < 3) return true;
  return PEOPLES_DATA.landWords.includes(lower(parts.head));
}

/** The forms one family builds from a normalised name (§5.1); undefined where the family can't. */
function familyForms(parts: NameParts, family: PeopleFamily, culture: string, choice: PeopleChoice): PeopleForms | undefined {
  const { head, lead } = parts;
  const { id } = endingOf(head);
  const E = (w: string) => lead + w;
  const place = parts.bare;
  const ishW = ishWord(head, id);
  const icW = icWord(head, id);
  const ic = isIcCulture(culture, id) ? E(icW) : undefined;
  const suffix = PEOPLES_DATA.suffixes[family];
  if (suffix !== undefined) {
    const word = suffixed(head, id, suffix);
    return { family, person: E(word), adjective: E(word), people: `the ${E(family === "ese" ? word : plural(word))}`, language: E(word), ic };
  }
  switch (family) {
    case "er": {
      const word = erWord(head, id);
      const adj = choice.adjective ?? "place";
      const adjective = adj === "place" ? place : adj === "ic" ? E(icW) : E(ishW);
      return { family, person: E(word), adjective, people: `the ${E(plural(word))}`, language: adj === "place" ? E(ishW) : adjective, ic };
    }
    case "ish": {
      const man = syllables(ishW) <= 3;
      const person = man ? `${E(ishW)}man, ${E(ishW)}woman` : E(erWord(head, id));
      return { family, person, adjective: E(ishW), people: `the ${E(ishW)}`, language: E(ishW), ic };
    }
    case "clip": {
      const stem = clipStem(head, id);
      if (!stem) return undefined;
      let person = stem;
      if (id !== "stan" && endsVC(stem)) person = (choice.clip ?? "long") === "long" ? `${stem}e` : stem + stem.slice(-1);
      const adjective = id === "stan" ? person : choice.adjective === "ic" ? attach(person, "ic") : attach(person, "ish");
      return { family, person: E(person), adjective: E(adjective), people: `the ${E(plural(person))}`, language: E(adjective), ic };
    }
    case "man": {
      const stem = stemFor(head, id);
      return { family, person: `${E(stem)}man, ${E(stem)}woman`, adjective: place, people: `the ${E(stem)}men`, language: `the speech of ${displayName(parts)}`, phrase: true };
    }
    case "folk": {
      const stem = stemFor(head, id);
      return { family, adjective: place, people: `the ${E(stem)}folk`, language: E(ishW), ic };
    }
    case "ings": {
      const word = attach(stemFor(head, id), "ing");
      return { family, person: E(word), adjective: place, people: `the ${E(word)}s`, language: E(ishW), ic };
    }
    case "learned": {
      const word = learnedForm(head);
      if (!word) return undefined;
      return { family, person: E(word), adjective: E(word), people: `the ${E(plural(word))}`, language: E(attach(head, "ish")), ic };
    }
    case "born": {
      const word = `${stemFor(head, id)}born`;
      return { family, person: E(word), adjective: place, people: `the ${E(word)}`, language: E(ishW), ic };
    }
    case "sider": {
      const word = `${stemFor(head, id)}sider`;
      return { family, person: E(word), adjective: place, people: `the ${E(word)}s`, language: E(ishW), ic };
    }
  }
  return undefined;
}

/**
 * The forms for a name by a fixed family (§15.1), with no randomness: `choice` fixes the long or short clip
 * and the `er` adjective. A name with a special case (the Sun's system, a generic land word, the fallback) uses
 * its own forms whatever the family.
 */
export function peopleForms(name: string, family: PeopleFamily | "generic" | "fallback" | "sun", culture = "norman-british", choice: PeopleChoice = {}, era: PeopleEra = "MD"): PeopleForms | undefined {
  const parts = normaliseName(name);
  const special = specialForms(parts, era, choice);
  if (special) return special;
  if (family === "fallback" || family === "generic" || family === "sun") return fallbackForms(parts, choice);
  return familyForms(parts, family, culture, choice);
}

function specialForms(parts: NameParts, era: PeopleEra, choice: PeopleChoice): PeopleForms | undefined {
  return sunForms(parts, choice) ?? genericForms(parts, era, choice) ?? (needsFallback(parts) ? fallbackForms(parts, choice) : undefined);
}

// ── Safeguards (§12) ────────────────────────────────────────────────────────

const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const BANNED = PEOPLES_DATA.safeguards.banned.map(wordRe);

/** §12.3: the money module's banned words (and group names'), and the module's own. */
export function breaksPeopleWords(text: string): boolean {
  return breaksMoneyWords(text) || BANNED.some((re) => re.test(text));
}

export const defaultPeopleSafeguards = (): GroupSafeguards => ({ block: PEOPLES_DATA.safeguards.block, flag: PEOPLES_DATA.safeguards.flag, flagListBlocks: PEOPLES_DATA.safeguards.flagListBlocks });

const counted = (text: string) => text.split(" ").filter((w, i) => w && !(i === 0 && lower(w) === "the") && !SMALL.has(lower(w)));

function makeFormCheck(guards: GroupSafeguards) {
  const block = new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(normForBlock));
  /** Whether a form may stand: not on the block list, no banned word, no repeated word. */
  return (form: string | undefined): boolean => {
    if (!form) return true;
    for (const part of form.split(", ")) {
      if (block.has(normForBlock(part)) || breaksPeopleWords(part) || repeatsContent(counted(part))) return false;
    }
    return true;
  };
}

// ── Language names (§8) ─────────────────────────────────────────────────────

export interface LanguageResult {
  current: string;
  earlier?: string[];
  dialects?: string[];
}

function drawLanguage(base: PeopleForms, ic: boolean, era: PeopleEra, tone: GroupToneChoice, detail: PeopleDetail, rng: () => number, ok: (f: string) => boolean): LanguageResult {
  if (base.phrase) return { current: base.language };
  const L = ic && base.ic ? base.ic : base.language;
  const harbour = () => PEOPLES_DATA.harbourWords[Math.floor(rng() * PEOPLES_DATA.harbourWords.length)];
  const shapes = PEOPLES_DATA.languageShapes
    .filter((s) => eraFrom(era, s.from) && (s.from !== "NF" || isFuture(era)))
    .map((s): [LanguageShape, number] => [s, s.w * toneFactor(s.t ?? [], tone)])
    .filter(([, w]) => w > 0);
  let current = L;
  for (let i = 0; i < 20; i++) {
    const shape = pickWeighted(shapes, rng);
    if (!shape) break;
    const text = shape.p.replace("{L}", L).replace("{harbourWord}", shape.p.includes("{harbourWord}") ? harbour() : "");
    if (ok(text)) {
      current = text;
      break;
    }
  }
  if (detail === "older") {
    const earlier = PEOPLES_DATA.older[era].map((p) => p.replace("{L}", L)).filter((f) => f !== current && ok(f));
    return { current, earlier };
  }
  if (detail === "dialects") {
    const words = [...PEOPLES_DATA.dialectWords, ...(isFuture(era) ? PEOPLES_DATA.dialectWordsSpace : [])];
    const first = current.split(" ")[0];
    const pool = words.filter((w) => w !== first && ok(`${w} ${L}`));
    const dialects: string[] = [];
    while (dialects.length < 3 && pool.length > 0) {
      const w = pool.splice(Math.floor(rng() * pool.length), 1)[0];
      dialects.push(`${w} ${L}`);
    }
    return { current, dialects };
  }
  return { current };
}

// ── Rows (§9) ───────────────────────────────────────────────────────────────

export interface PeopleRow {
  /** The name as it was given. */
  name: string;
  /** The row, one name for display, insertion and starring. */
  text: string;
  family: string;
  person?: string;
  adjective: string;
  people: string;
  language: string;
  earlier?: string[];
  dialects?: string[];
}

/** §9: the row for one name's forms. */
export function formatPeopleRow(row: Omit<PeopleRow, "text">, giving: PeopleGiving): string {
  const parts: string[] = [];
  if (giving !== "languages") {
    if (row.person) parts.push(`${row.person} (person)`);
    parts.push(`${row.adjective} (adjective)`);
    parts.push(`${row.people} (people)`);
  }
  if (giving !== "peoples") {
    const more = row.earlier?.length ? `; earlier ${row.earlier.join(", ")}` : row.dialects?.length ? `; dialects ${row.dialects.join(", ")}` : "";
    parts.push(`${row.language} (language${more})`);
  }
  return `${row.name}: ${parts.join(", ")}`;
}

export interface PeopleDrawerOptions {
  culture?: string;
  era?: string;
  tone?: GroupToneChoice;
  giving?: PeopleGiving;
  detail?: PeopleDetail;
  safeguards?: GroupSafeguards;
  rng: () => number;
}

/** A drawer of rows for names, on the given stream (the second stream for the realms link, §10.2). */
export function makePeopleDrawer(options: PeopleDrawerOptions): (name: string) => PeopleRow {
  const culture = PEOPLE_CULTURES.some((c) => c.key === options.culture) ? options.culture! : "general";
  const era = asEra(options.era);
  const tone = options.tone ?? "any";
  const giving = options.giving ?? "both";
  const detail = giving === "peoples" ? "one" : options.detail ?? "one";
  const rng = options.rng;
  const ok = makeFormCheck(options.safeguards ?? defaultPeopleSafeguards());
  const formsOk = (f: PeopleForms) => ok(f.person) && ok(f.adjective) && ok(f.people) && ok(f.language);

  const draw = (raw: string): PeopleRow => {
    const parts = normaliseName(raw);
    const colonists = isFuture(era) && rng() < PEOPLES_DATA.colonistShare;
    let forms: PeopleForms | undefined;
    const sun = sunForms(parts, { pick: Math.floor(rng() * 2) });
    if (sun) forms = sun;
    else {
      const generic = genericRow(parts, era);
      if (generic) {
        const speech = pickWeighted(PEOPLES_DATA.genericLanguage.map((l, i): [number, number] => [i, l.w]), rng) ?? 0;
        forms = genericForms(parts, era, { pick: Math.floor(rng() * generic.row.people.length), speech });
      } else if (!needsFallback(parts)) {
        const weights = weightsFor(parts.head, culture, era, tone);
        const pool = Object.entries(weights) as [PeopleFamily, number][];
        const { id } = endingOf(parts.head);
        while (pool.length > 0 && !forms) {
          const family = pickWeighted(pool, rng)!;
          pool.splice(pool.findIndex(([f]) => f === family), 1);
          const choice: PeopleChoice = {};
          if (family === "clip") {
            choice.clip = rng() < 0.5 ? "long" : "short";
            if (isIcCulture(culture, id) && id !== "stan" && rng() < PEOPLES_DATA.adjectiveIc / 100) choice.adjective = "ic";
          }
          if (family === "er") {
            const e = PEOPLES_DATA.erAdjective;
            const ic = isIcCulture(culture, id);
            const options: ["place" | "ish" | "ic", number][] = [["place", e.place], ["ish", e.ish + (ic ? 0 : e.ic)], ["ic", ic ? e.ic : 0]];
            choice.adjective = pickWeighted(options.filter(([, w]) => w > 0), rng);
          }
          const built = familyForms(parts, family, culture, choice);
          if (built && formsOk(built)) forms = built;
        }
      }
    }
    if (forms && !formsOk(forms)) forms = undefined;
    // §12.1: if every family fails, the fallback (which never adds a banned word).
    const final = forms ?? fallbackForms(parts, { colonists });
    const icRate = isIcCulture(culture, endingOf(parts.head).id) ? (PEOPLES_DATA.ic[culture] ?? 0) / 100 : 0;
    const useIc = !final.phrase && final.ic !== undefined && rng() < icRate;
    const lang = giving === "peoples" ? { current: final.language } : drawLanguage(final, useIc, era, tone, detail, rng, ok);
    const row: Omit<PeopleRow, "text"> = {
      name: parts.shown,
      family: final.family,
      ...(final.person ? { person: final.person } : {}),
      adjective: final.adjective,
      people: final.people,
      language: lang.current,
      ...(lang.earlier ? { earlier: lang.earlier } : {}),
      ...(lang.dialects ? { dialects: lang.dialects } : {}),
    };
    return { ...row, text: formatPeopleRow(row, giving) };
  };
  return draw;
}

// ── Batches ─────────────────────────────────────────────────────────────────

export interface PeopleOptions {
  names: string[];
  culture?: string;
  era?: string;
  tone?: GroupToneChoice;
  giving?: PeopleGiving;
  detail?: PeopleDetail;
  seed?: number;
  safeguards?: GroupSafeguards;
}

export interface PeopleBatch {
  rows: PeopleRow[];
  seed: number;
  notices: string[];
}

/** §10.2: the second stream's seed. */
export const peopleStreamSeed = (seed: number) => (seed + 0x9e3779b9) >>> 0;

/** §2.3: one row per name, in order, drawn on the second stream. */
export function generatePeopleRows(options: PeopleOptions): PeopleBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const draw = makePeopleDrawer({ ...options, rng: mulberry32(peopleStreamSeed(seed)) });
  return { rows: options.names.map(draw), seed, notices: [] };
}

/** §2.3: the typed names: one per line or separated by commas, duplicates removed, at most 50. */
export function parseTypedNames(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/[\n,]/)) {
    const name = raw.trim().replace(/\s+/g, " ");
    if (!name || seen.has(lower(name))) continue;
    seen.add(lower(name));
    out.push(name);
    if (out.length === 50) break;
  }
  return out;
}

/** §1.2: "peoples and tongues · {era} · {culture} · {source}", then giving, detail and tone. */
export function peoplesHistoryLabel(era: string, culture: string, source: string, giving: PeopleGiving, detail: PeopleDetail, tone: GroupToneChoice, withPeoples = false): string {
  return [
    "peoples and tongues",
    ROUTE_ERAS.find((e) => e.code === era)?.label ?? era,
    PEOPLE_CULTURES.find((c) => c.key === culture)?.label ?? "General",
    source,
    ...(giving === "peoples" ? ["peoples"] : giving === "languages" ? ["languages"] : []),
    ...(giving !== "peoples" && detail === "older" ? ["older forms"] : giving !== "peoples" && detail === "dialects" ? ["dialects"] : []),
    ...(tone !== "any" ? [tone] : []),
    ...(withPeoples ? ["with peoples"] : []),
  ].join(" · ");
}
