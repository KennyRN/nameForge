// Group names: orders, companies and factions (Group brief, docs/group-names-brief.md). Seven
// families of organisations for fantasy, modern and sci-fi settings, built from shapes and lists.
// No Obsidian imports.

import groupData from "../data/group-names.json";
import { pluralOf } from "../biomes";
import { mulberry32 } from "../markov";
import { generatePlaceNames } from "../names/engine";
import { britishPlaceNamesRecipe } from "../names/recipe";
import { findTradition, TRIBAL_DATA, type TribalTradition } from "../tribes/engine";
import { generateWorldPlaceNames } from "../world/engine";

// ── Data ────────────────────────────────────────────────────────────────────

/** §3.1: the five settings. */
export type GroupSetting = "FL" | "FH" | "MR" | "MF" | "SF";
export type GroupGenre = "fantasy" | "modern" | "scifi";
export type GroupForm = "any" | "formal" | "everyday";
export type GroupFront = "say" | "hide" | "may";
export type GroupPeople = "placeholders" | "invented";
type ShapeForm = "F" | "E" | "B";
/** Tone brief §2.1. */
export type GroupTone = "grand" | "plain" | "grim" | "light" | "strange";
export type GroupToneChoice = "any" | GroupTone;

export interface GroupEntry {
  w: string;
  x?: number;
  s?: GroupSetting[];
  sx?: Partial<Record<GroupSetting, number>>;
  tx?: Record<string, number>;
  only?: string[];
  types?: string[];
  noPrefix?: boolean;
  /** Tone brief §2.3: the word's tones; replaces its list's tones (an empty array is neutral). */
  t?: GroupTone[];
}

export interface GroupShape {
  p: string;
  f: ShapeForm;
  w: number;
  s?: GroupSetting[];
  sx?: Partial<Record<GroupSetting, number>>;
  /** A list narrowed to these words for this shape (§6.1: the habit shape's members). */
  filter?: Record<string, string[]>;
  /** Tone brief §2.3: the shape's own tones. */
  t?: GroupTone[];
  /** Tone brief §3.6: the series anchor, overriding the automatic choice. */
  sa?: string;
}

export interface GroupType {
  key: string;
  menu: string;
  sentence: string;
  settings: GroupSetting[];
  weight: number;
  /** §7: the front style, or null when the type never hides. */
  front: string | null;
  person: string;
  description: string;
  shapes: GroupShape[];
  listFilter?: Record<string, string[]>;
  borrow?: { share: number; types?: string[]; form?: ShapeForm; andTypes?: string[]; own?: boolean }[];
}

export interface GroupFamily {
  key: string;
  section: string;
  label: string;
  icon: string;
  any: string;
  types: GroupType[];
}

interface GroupData {
  settings: { phrases: Record<GroupSetting, string> };
  families: GroupFamily[];
  fronts: Record<string, { shapes: GroupShape[]; typeShapes?: Record<string, GroupShape[]> }>;
  lists: Record<string, GroupEntry[]>;
  /** Tone brief §2.6: every word in these lists carries the list's tones. */
  listTones: Record<string, GroupTone[]>;
  composites: Record<string, [string, number][]>;
  nickname: { p: string; w: number }[];
  traditions: {
    signatures: Record<string, Record<string, (string | [string, string])[]>>;
    typeMultipliers: Record<string, Record<string, number>>;
    shapeMultipliers: Record<string, Record<string, number>>;
    extraShapes: Record<string, Record<string, GroupShape[]>>;
    cultureMap: Record<string, [string, number][]>;
  };
  safeguards: { block: string[]; flag: string[]; flagListBlocks: boolean; banned: string[]; personNouns: string[]; blockedInitials: string[] };
  people: {
    person: { p: string; w: number }[];
    personOther: { p: string; w: number }[];
    surnameTraditions: string[];
    saintTraditions: string[];
    sfTown: { p: string; w: number }[];
  };
}

export const GROUP_DATA = groupData as unknown as GroupData;
export const GROUP_FAMILIES = GROUP_DATA.families;
export const GROUP_SETTINGS: GroupSetting[] = ["FL", "FH", "MR", "MF", "SF"];
export const SETTING_PHRASES = GROUP_DATA.settings.phrases;

/** §3.2: the tag codes. */
export const GROUP_TAGS: Record<string, GroupSetting[]> = {
  H: ["FH", "MF"],
  P: ["FL", "FH"],
  M: ["MR", "MF", "SF"],
  MO: ["MR", "MF"],
  S: ["SF"],
  PM: ["FL", "FH", "MR", "MF"],
  L: ["FL", "MR"],
};

// ── Tone (Tone brief §2) ────────────────────────────────────────────────────

export const GROUP_TONES: GroupTone[] = ["grand", "plain", "grim", "light", "strange"];

/** §2.1: the sentence text for each tone. */
export const TONE_PHRASES: Record<GroupToneChoice, string> = {
  any: "of any tone",
  grand: "with a grand air",
  plain: "with a plain, workaday feel",
  grim: "with a grim edge",
  light: "with a light touch",
  strange: "with a strange air",
};

/** §2.2: the tones each tone is opposed by. */
export const TONE_OPPOSITES: Record<GroupTone, GroupTone[]> = {
  grand: ["light", "plain"],
  plain: ["grand", "strange"],
  grim: ["light"],
  light: ["grand", "grim"],
  strange: ["plain"],
};

/** §2.4: ×4 for a match (which wins over an opposite), ×0.25 for an opposite, else ×1. */
export function toneFactor(tags: readonly string[], tone: GroupToneChoice): number {
  if (tone === "any" || tags.length === 0) return 1;
  if (tags.includes(tone)) return 4;
  return tags.some((t) => (TONE_OPPOSITES[tone] as string[]).includes(t)) ? 0.25 : 1;
}

/** §2.5: never tone-weighted. */
const UNTONED_LISTS = new Set(["surname", "house", "townPrefix", "townSuffix"]);

const WORD_TONES = new Map<string, Map<string, GroupTone[]>>();
for (const [list, entries] of Object.entries(GROUP_DATA.lists)) {
  for (const e of entries) {
    if (!e.t) continue;
    if (!WORD_TONES.has(list)) WORD_TONES.set(list, new Map());
    WORD_TONES.get(list)!.set(e.w, e.t);
  }
}

/** §2.3: a word's tones: its own, or its list's. */
export function wordTones(list: string, word: string): GroupTone[] {
  return WORD_TONES.get(list)?.get(word) ?? GROUP_DATA.listTones[list] ?? [];
}

/** §2.4: a shape's effective tones: its own plus the list tones of every list its tokens name. */
const SHAPE_TONES = new Map<string, GroupTone[]>();
export function shapeTones(shape: Pick<GroupShape, "p" | "t">): GroupTone[] {
  const key = `${shape.p}|${(shape.t ?? []).join(",")}`;
  const cached = SHAPE_TONES.get(key);
  if (cached) return cached;
  const result = computeShapeTones(shape);
  SHAPE_TONES.set(key, result);
  return result;
}

function computeShapeTones(shape: Pick<GroupShape, "p" | "t">): GroupTone[] {
  const out = new Set<GroupTone>(shape.t ?? []);
  for (const m of shape.p.matchAll(/\{([^}]+)\}/g)) {
    for (const name of m[1].split(":")[0].split("/")) for (const t of GROUP_DATA.listTones[name] ?? []) out.add(t);
  }
  return GROUP_TONES.filter((t) => out.has(t));
}

export function findFamily(key: string): GroupFamily | undefined {
  return GROUP_FAMILIES.find((f) => f.key === key);
}

export function familyForSection(section: string): GroupFamily | undefined {
  return GROUP_FAMILIES.find((f) => f.section === section);
}

/** §3.1: the setting code for a genre and the fantastic switch. */
export function groupSetting(genre: GroupGenre, fantastic: boolean): GroupSetting {
  if (genre === "scifi") return "SF";
  if (genre === "modern") return fantastic ? "MF" : "MR";
  return fantastic ? "FH" : "FL";
}

/** The family's types that exist in a setting, in order. */
export function typesInSetting(family: GroupFamily, setting: GroupSetting): GroupType[] {
  return family.types.filter((t) => t.settings.includes(setting));
}

/** §7: whether a type has front names. */
export function canFront(type: GroupType): boolean {
  return !!type.front && !!GROUP_DATA.fronts[type.front];
}

/** §2.4: supernatural courts exist in folklore, high fantasy and contemporary fantasy only. */
export function familySettings(family: GroupFamily): GroupSetting[] {
  return GROUP_SETTINGS.filter((s) => family.types.some((t) => t.settings.includes(s)));
}

// ── Rendering helpers (§11) ─────────────────────────────────────────────────

const SMALL = new Set(["of", "the", "and", "for", "in", "at", "by", "on", "to", "from"]);
const PLURALS: Record<string, string> = { Wolf: "Wolves", Knife: "Knives", Ox: "Oxen", Mouse: "Mice", Staff: "Staffs", Thief: "Thieves", Tooth: "Teeth" };
/** Lists already in the plural (§11.3): never re-pluralised; their possessive is the plural one. */
const PLURAL_LISTS = new Set([
  "soldiers", "warders", "mercs", "gear", "creatures", "starBand", "band", "arm", "tradesmen", "unionTrade", "agents", "uCreature",
  "gangMembers", "gangWear", "gangNoun", "smugglerAgents", "crewNoun", "raiders", "hunterNoun", "vocation", "compound", "members",
  "holyMembers", "covenMembers", "schoolMembers", "chivMembers", "portPlaces", "wellPlaces", "factionColour", "factionNick", "spyWord",
  "chainItem", "thiefEuph", "balancers", "nickTrait",
]);

/** §11.3: a plural, by `pluralOf` with the group names' irregulars; compounds pluralise their last part. */
export function groupPlural(word: string): string {
  const dash = word.lastIndexOf("-");
  if (dash > 0) return word.slice(0, dash + 1) + groupPlural(word.slice(dash + 1));
  if (PLURALS[word]) return PLURALS[word];
  const lower = pluralOf(word.toLowerCase());
  return word.charAt(0) + lower.slice(1);
}

/** §11.4 (OUP): 's for singulars, ' for plurals ending in s, 's for other plurals. */
export function groupPossessive(word: string, plural: boolean): string {
  if (plural && word.endsWith("s")) return `${word}'`;
  return `${word}'s`;
}

/** §11.6: the initials of a formal name: one capital per word outside the lower-case list. */
export function initialsOf(text: string): string {
  return text
    .split(/\s+/)
    .filter((w) => w && !SMALL.has(w.toLowerCase()) && /^[A-Za-z]/.test(w))
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

const ordinalText = (n: number) => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : n % 10 === 1 ? "st" : n % 10 === 2 ? "nd" : n % 10 === 3 ? "rd" : "th";
  return `${n}${s}`;
};

/** §11.1: capitals, with the small words lower case and a leading "the" kept lower case. */
function capitalise(text: string, formal: boolean): string {
  return text
    .split(" ")
    .map((word, i) => {
      if (!word || word.startsWith("[")) return word;
      const lower = word.toLowerCase();
      if (SMALL.has(lower) && (i > 0 || lower === "the" || !formal)) return lower;
      return word.replace(/(^|[-–])([a-z])/g, (_m, sep: string, c: string) => sep + c.toUpperCase());
    })
    .join(" ");
}

// ── Safeguards (§12) ────────────────────────────────────────────────────────

export interface GroupSafeguards {
  block: string[];
  flag: string[];
  flagListBlocks: boolean;
}

const norm = (s: string) => s.toLowerCase().replace(/^the /, "").replace(/\s+/g, " ").trim();
const wordRe = (w: string) => new RegExp(`(^|[^A-Za-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^A-Za-z])`, "i");
const BANNED = [...TRIBAL_DATA.safeguards.banned, ...GROUP_DATA.safeguards.banned].map(wordRe);
const PERSON_NOUNS = new Set(GROUP_DATA.safeguards.personNouns);
const COLOUR_WORDS = new Set(["colour", "colourRich", "habit"].flatMap((l) => GROUP_DATA.lists[l].map((e) => e.w)));
const NUMBER_WORDS = new Set([...GROUP_DATA.lists.number, ...GROUP_DATA.lists.ordinalWord].map((e) => e.w));
const BLOCKED_INITIALS = new Set(GROUP_DATA.safeguards.blockedInitials);

/** §12.4: a colour directly before a person noun. */
export function breaksGroupColourRule(text: string): boolean {
  const words = text.split(/\s+/);
  return words.some((w, i) => i < words.length - 1 && COLOUR_WORDS.has(w) && PERSON_NOUNS.has(words[i + 1]));
}

// ── Generation ──────────────────────────────────────────────────────────────

export interface GroupOptions {
  family: string;
  /** A tribal tradition key; "general" (the default) adds no cultural flavour. */
  tradition?: string;
  /** A type key of the family; undefined is Any. */
  type?: string;
  genre?: GroupGenre;
  fantastic?: boolean;
  form?: GroupForm;
  front?: GroupFront;
  people?: GroupPeople;
  count: number;
  seed?: number;
  /** §12.6: the merged safeguard lists; the built-in lists when absent. */
  safeguards?: GroupSafeguards;
  /** Tone brief §4: weights names towards a mood; "any" (the default) changes nothing. */
  tone?: GroupToneChoice;
}

export interface GroupName {
  /** Tone brief §3.7: the shape's effective tones plus the tones of every word drawn. */
  tones: GroupTone[];
  text: string;
  family: string;
  type: string;
  shape: string;
  front: boolean;
  form: ShapeForm;
}

export interface GroupBatch {
  names: GroupName[];
  seed: number;
  notices: string[];
}

interface Ctx {
  rng: () => number;
  setting: GroupSetting;
  family: GroupFamily;
  /** The flavour tradition (undefined for General, and for South Asian trade: §9 step 8). */
  vocab: TribalTradition | undefined;
  /** The tradition for people and places (§8). */
  people: TribalTradition | undefined;
  mode: GroupPeople;
  form: GroupForm;
  block: Set<string>;
  pools: Map<string, [string, number][]>;
  /** Tone brief §2: the tone for this draw, and the tones of the words drawn so far. */
  tone: GroupToneChoice;
  drawn: Set<GroupTone>;
}

const pickWeighted = <T>(items: [T, number][], rng: () => number): T | undefined => {
  const total = items.reduce((n, [, w]) => n + w, 0);
  if (total <= 0) return undefined;
  let r = rng() * total;
  for (const [item, w] of items) {
    r -= w;
    if (r < 0) return item;
  }
  return items[items.length - 1][0];
};

const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];

/** A list's own setting tag: the settings every entry shares, if they all carry the same one. */
function listTag(name: string): GroupSetting[] | undefined {
  const entries = GROUP_DATA.lists[name] ?? [];
  const first = entries[0]?.s;
  if (!first || entries.some((e) => !e.s || e.s.join() !== first.join())) return undefined;
  return first;
}

/** The words a list offers here, weighted: setting, type, tradition and flavour applied (§3.3, §9). */
function pool(ctx: Ctx, name: string, type: GroupType, filter?: string[]): [string, number][] {
  const key = `${name}|${type.key}|${filter?.join(",") ?? ""}|${ctx.tone}`;
  const cached = ctx.pools.get(key);
  if (cached) return cached;
  const S = ctx.setting;
  const trad = ctx.vocab;
  const weights = new Map<string, number>();
  const add = (word: string, w: number) => weights.set(word, (weights.get(word) ?? 0) + w);
  for (const e of GROUP_DATA.lists[name] ?? []) {
    if (e.s && !e.s.includes(S)) continue;
    if (e.types && !e.types.includes(type.key)) continue;
    if (e.only && (!trad || !e.only.includes(trad.key))) continue;
    add(e.w, (e.x ?? 1) * (e.sx?.[S] ?? 1) * (trad ? (e.tx?.[trad.key] ?? 1) : 1));
  }
  if (trad) {
    // §9.6: signature words ×3, or a word already in the list multiplied ×3.
    const tag = listTag(name);
    for (const sig of GROUP_DATA.traditions.signatures[trad.key]?.[name] ?? []) {
      const [word, own] = typeof sig === "string" ? [sig, undefined] : sig;
      const settings = own ? GROUP_TAGS[own] : tag;
      if (settings && !settings.includes(S)) continue;
      if (weights.has(word)) weights.set(word, weights.get(word)! * 3);
      else add(word, 3);
    }
    // §9.1–9.4: flavour animals, plants, land words and numbers.
    const boost = (words: string[] | undefined, mult: number, plural = false) => {
      for (const raw of words ?? []) {
        const word = plural ? groupPlural(raw) : raw;
        if (weights.has(word)) weights.set(word, weights.get(word)! * mult);
        else add(word, mult);
      }
    };
    if (["beast", "bird", "shifter"].includes(name)) boost(trad.flavour.animals, 3);
    if (name === "creatures") boost(trad.flavour.animals, 3, true);
    if (["plant", "tree", "feyPlant"].includes(name)) boost(trad.flavour.plants, 3);
    if (name === "knightEmblem") boost([...(trad.flavour.animals ?? []), ...(trad.flavour.plants ?? [])], 2);
    if (name === "land") boost([...(trad.flavour.land ?? []), ...(trad.flavour.water ?? [])], 3);
    if (name === "covenLand") boost(trad.flavour.land, 3);
    if (name === "number") boost(trad.numbers, 3);
    // §9.5: culture suppressions on weapons, past settings only (§9.7: not for sahul).
    if (trad.key !== "sahul" && (S === "FL" || S === "FH") && ["weapon", "gear", "uWeapon"].includes(name)) {
      for (const s of trad.suppress.filter((x) => x.kind === "culture")) {
        for (const word of [s.word, groupPlural(s.word)]) if (weights.has(word)) weights.set(word, weights.get(word)! * s.mult);
      }
    }
  }
  // Tone brief §2.4: the word factor; tone Any leaves the weights untouched.
  if (ctx.tone !== "any" && !UNTONED_LISTS.has(name)) {
    for (const [word, w] of weights) weights.set(word, w * toneFactor(wordTones(name, word), ctx.tone));
  }
  const keep = filter ?? type.listFilter?.[name];
  const out = [...weights].filter(([w, n]) => n > 0 && (!keep || keep.includes(w)));
  ctx.pools.set(key, out);
  return out;
}

/** A word from a list, noting its tones for the name (Tone brief §3.7). */
function pick(ctx: Ctx, name: string, type: GroupType, filter?: string[]): string | undefined {
  const w = pickWeighted(pool(ctx, name, type, filter), ctx.rng);
  if (w !== undefined) for (const t of wordTones(name, w)) ctx.drawn.add(t);
  return w;
}

/** A composite list (§5.5): pick a sub-list by its weight, then a word from it. */
function compositeWord(ctx: Ctx, name: string, type: GroupType): string | undefined {
  const parts = GROUP_DATA.composites[name];
  if (name === "creature") {
    const merged = parts.flatMap(([sub]) => pool(ctx, sub, type));
    const w = pickWeighted(merged, ctx.rng);
    const from = parts.find(([sub]) => w !== undefined && pool(ctx, sub, type).some(([x]) => x === w));
    if (w !== undefined && from) for (const t of wordTones(from[0], w)) ctx.drawn.add(t);
    return w;
  }
  const live = parts.filter(([sub]) => pool(ctx, sub, type).length > 0);
  const sub = pickWeighted(live, ctx.rng);
  return sub ? pick(ctx, sub, type) : undefined;
}

// Invented places (§8.4), drawn from pools made once with fixed seeds, so batches stay seed-stable.
const townPools = new Map<string, string[]>();
function townPool(key: string): string[] {
  let found = townPools.get(key);
  if (found) return found;
  const names =
    key === "britain"
      ? generatePlaceNames({ recipe: britishPlaceNamesRecipe(undefined), slots: {}, count: 300, seed: 1789 }).names.map((n) => n.text)
      : generateWorldPlaceNames({ culture: key, count: 300, seed: 1789 }).names.map((n) => n.text);
  found = names.filter((n) => !n.includes("["));
  townPools.set(key, found);
  return found;
}

const isGeneral = (t: TribalTradition | undefined) => !t || t.key === "general";

interface Piece {
  text: string;
  plural: boolean;
}

/** Renders a shape's tokens; undefined when a token has nothing to offer here (§3.3). */
function renderPattern(ctx: Ctx, pattern: string, type: GroupType, shape?: GroupShape): string | undefined {
  let out = "";
  const re = /\{([^}]+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(pattern))) {
    out += pattern.slice(last, m.index);
    last = re.lastIndex;
    const [rawName, mod] = m[1].split(":");
    const name = rawName.includes("/") ? pickOne(rawName.split("/"), ctx.rng) : rawName;
    const piece = token(ctx, name, type, shape);
    if (!piece) return undefined;
    let text = piece.text;
    // §6.5: "{compound} Company" uses the compound's singular.
    if (name === "compound" && pattern.slice(last).startsWith(" Company")) text = text.replace(/s$/, "");
    if (mod === "pl") text = piece.plural ? text : groupPlural(text);
    if (mod === "poss") text = groupPossessive(text, piece.plural);
    out += text;
  }
  out += pattern.slice(last);
  return out;
}

/** One token (§4.1, §8). */
function token(ctx: Ctx, name: string, type: GroupType, shape?: GroupShape): Piece | undefined {
  const rng = ctx.rng;
  const S = ctx.setting;
  const placeholders = ctx.mode === "placeholders";
  const word = (list: string): Piece | undefined => {
    const w = pick(ctx, list, type, shape?.filter?.[list]);
    return w === undefined ? undefined : { text: w, plural: PLURAL_LISTS.has(list) };
  };
  switch (name) {
    case "person":
      if (placeholders) return { text: `[${type.person}]`, plural: false };
      return { text: inventedPerson(ctx, type) ?? "", plural: false };
    case "holy": {
      if (placeholders) return { text: "[holy person]", plural: false };
      const saints = GROUP_DATA.people.saintTraditions.includes(ctx.people?.key ?? "general");
      if (!saints) return { text: `the ${pick(ctx, "holyTitle", type)}`, plural: false };
      const saint = pick(ctx, "saintName", type);
      return { text: S === "SF" ? `the Blessed ${saint}` : `Saint ${saint}`, plural: false };
    }
    case "town":
      if (placeholders) return { text: "[place]", plural: false };
      return { text: inventedTown(ctx, type), plural: false };
    case "surname":
      if (placeholders) return { text: "[surname]", plural: false };
      return word("surname");
    case "house":
      if (placeholders) return { text: "[house]", plural: false };
      return word("house");
    case "ordinal": {
      const choices: [number, number][] = [];
      for (let n = 1; n <= 99; n++) choices.push([n, n <= 12 ? 3 : n <= 30 ? 1 : 0.2]);
      return { text: ordinalText(pickWeighted(choices, rng)!), plural: false };
    }
    case "land": {
      if (S === "SF") {
        const w = pick(ctx, "spaceLand", type)!;
        const prefix = rng() < 0.3 ? `${pick(ctx, "spacePrefix", type)} ` : "";
        return { text: prefix + w, plural: false };
      }
      const w = pick(ctx, "land", type);
      if (!w) return undefined;
      const holds = w.includes(" ") || GROUP_DATA.lists.land.some((e) => e.w === w && e.noPrefix);
      if (!holds && rng() < 0.3) {
        const prefix = rng() < 0.5 ? pick(ctx, "landPrefix", type) : pick(ctx, "colour", type);
        return { text: `${prefix} ${w}`, plural: false };
      }
      return { text: w, plural: false };
    }
    case "street":
      if (S === "SF") {
        const n = (max: number) => 1 + Math.floor(rng() * max);
        const forms = [() => `Deck ${n(40)}`, () => `Ring ${pick(ctx, "greek", type)}`, () => `Level ${n(99)}`, () => `Sector ${n(20)}`];
        return { text: pickOne(forms, rng)(), plural: false };
      }
      return { text: `${pick(ctx, "streetFirst", type)} ${pick(ctx, "streetLast", type)}`, plural: false };
    case "nickname": {
      const shapeChoice = pickWeighted(GROUP_DATA.nickname.map((n): [string, number] => [n.p, n.w]), rng)!;
      const text = renderPattern(ctx, shapeChoice, type);
      return text ? { text, plural: true } : undefined;
    }
    case "star":
      return word("star");
    case "starNumber":
      return { text: String(1 + Math.floor(rng() * 12)), plural: false };
    case "spaceLandPrefixed":
      return { text: `${pick(ctx, "spacePrefix", type)} ${pick(ctx, "spaceLand", type)}`, plural: false };
    case "britishPlace":
      return { text: pickOne(townPool("britain"), rng), plural: false };
    case "flavourAnimal": {
      const animals = ctx.vocab?.flavour.animals;
      if (animals && animals.length > 0) return { text: pickOne(animals, rng), plural: false };
      const merged = [...pool(ctx, "beast", type), ...pool(ctx, "bird", type)];
      return { text: pickWeighted(merged, rng)!, plural: false };
    }
    case "personTitle":
      return word(ctx.family.key === "supernatural" ? "supernaturalTitle" : "personTitle");
    case "initials":
      return initialsToken(ctx, type);
  }
  if (GROUP_DATA.composites[name]) {
    const w = compositeWord(ctx, name, type);
    return w === undefined ? undefined : { text: w, plural: name === "band" };
  }
  if (!GROUP_DATA.lists[name]) throw new Error(`Group names: no list “${name}”.`);
  return word(name);
}

/** §8.2: an invented person. */
function inventedPerson(ctx: Ctx, type: GroupType): string | undefined {
  const surnames = GROUP_DATA.people.surnameTraditions.includes(ctx.people?.key ?? "general");
  const shapes = surnames ? GROUP_DATA.people.person : GROUP_DATA.people.personOther;
  const pattern = pickWeighted(shapes.map((s): [string, number] => [s.p, s.w]), ctx.rng)!;
  return renderPattern(ctx, pattern, type);
}

/** §8.4: an invented place. */
function inventedTown(ctx: Ctx, type: GroupType): string {
  const rng = ctx.rng;
  if (ctx.setting === "SF") {
    const pattern = pickWeighted(GROUP_DATA.people.sfTown.map((s): [string, number] => [s.p, s.w]), rng)!;
    return renderPattern(ctx, pattern, type) ?? "Vega";
  }
  const key = ctx.people?.key ?? "general";
  let source: string | undefined;
  if (GROUP_DATA.people.surnameTraditions.includes(key)) source = "britain";
  else {
    const cultures = GROUP_DATA.traditions.cultureMap[key];
    if (cultures) source = pickWeighted(cultures, rng);
  }
  if (source) {
    const names = townPool(source);
    if (names.length > 0) return pickOne(names, rng);
  }
  return `${pick(ctx, "townPrefix", type)}${pick(ctx, "townSuffix", type)}`;
}

/** §11.6: initials of a formal name for the same type. */
function initialsToken(ctx: Ctx, type: GroupType): Piece | undefined {
  const formal = type.shapes.filter((s) => s.f === "F" && !s.p.includes("{initials}") && shapeWeight(ctx, s) > 0);
  for (let i = 0; i < 20 && formal.length > 0; i++) {
    const shape = pickWeighted(formal.map((s): [GroupShape, number] => [s, shapeWeight(ctx, s)]), ctx.rng)!;
    const text = renderPattern(ctx, shape.p, type, shape);
    if (!text || text.includes("[")) continue;
    const letters = initialsOf(capitalise(text, true));
    if (letters.length < 3 || letters.length > 5) continue;
    if (BLOCKED_INITIALS.has(letters) || ctx.block.has(norm(letters)) || BANNED.some((re) => re.test(letters))) continue;
    return { text: letters, plural: false };
  }
  return undefined;
}

/** A shape's weight here (§3.3, §8.3, §9). */
function shapeWeight(ctx: Ctx, shape: GroupShape): number {
  if (shape.s && !shape.s.includes(ctx.setting)) return 0;
  // §8.3: invented surnames and houses only with General, Celtic and Germanic.
  if (ctx.mode === "invented" && /\{(surname|house)\}/.test(shape.p) && !GROUP_DATA.people.surnameTraditions.includes(ctx.people?.key ?? "general")) {
    return 0;
  }
  const trad = ctx.vocab ? GROUP_DATA.traditions.shapeMultipliers[ctx.vocab.key]?.[shape.p] ?? 1 : 1;
  // Tone brief §2.4: the shape factor; tone Any multiplies by nothing.
  const tone = ctx.tone === "any" ? 1 : toneFactor(shapeTones(shape), ctx.tone);
  return shape.w * (shape.sx?.[ctx.setting] ?? 1) * trad * tone;
}

/** §10: shapes for the chosen form, falling back to all of them when the form has none. */
function byForm(ctx: Ctx, shapes: GroupShape[]): [GroupShape, number][] {
  const live = shapes.map((s): [GroupShape, number] => [s, shapeWeight(ctx, s)]).filter(([, w]) => w > 0);
  const wanted = ctx.form === "formal" ? ["F", "B"] : ctx.form === "everyday" ? ["E", "B"] : ["F", "E", "B"];
  const matching = live.filter(([s]) => wanted.includes(s.f));
  return matching.length > 0 ? matching : live;
}

/** The plain shapes for a type, with tradition extras (§9). */
function plainShapes(ctx: Ctx, type: GroupType): GroupShape[] {
  const extra = ctx.vocab ? GROUP_DATA.traditions.extraShapes[ctx.vocab.key]?.[type.key] ?? [] : [];
  return [...type.shapes, ...extra];
}

function frontShapes(type: GroupType): GroupShape[] {
  const front = GROUP_DATA.fronts[type.front ?? ""];
  if (!front) return [];
  return [...front.shapes, ...(front.typeShapes?.[type.key] ?? [])];
}

/** §6.5: an adventuring company draws from borrowed shapes by share. */
function companySource(ctx: Ctx, type: GroupType): { shapes: GroupShape[]; listType: GroupType } {
  const share = pickWeighted((type.borrow ?? []).map((b): [typeof b, number] => [b, b.share]), ctx.rng);
  if (!share || share.own) return { shapes: type.shapes, listType: type };
  const family = (key: string) => GROUP_FAMILIES.flatMap((f) => f.types).find((t) => t.key === key)!;
  const source = family(share.types![0]);
  const shapes = source.shapes.filter((s) => !share.form || s.f === share.form);
  for (const extra of share.andTypes ?? []) shapes.push(...family(extra).shapes);
  return { shapes, listType: source };
}

/** One name for a type, or undefined when this draw fails (§4). */
function drawName(ctx: Ctx, type: GroupType, front: boolean): GroupName | undefined {
  let shapes: GroupShape[];
  let listType = type;
  if (front) shapes = frontShapes(type);
  else if (type.borrow) ({ shapes, listType } = companySource(ctx, type));
  else shapes = plainShapes(ctx, type);
  const choices = byForm(ctx, shapes);
  const shape = pickWeighted(choices, ctx.rng);
  if (!shape) return undefined;
  ctx.drawn = new Set();
  // Borrowed shapes keep their own lists; the person label stays the company's.
  const raw = renderPattern(ctx, shape.p, { ...listType, person: type.person }, shape);
  if (!raw) return undefined;
  if (shape.p === "{brandStart}{brandEnd}" && raw.length < 5) return undefined;
  const formal = shape.f === "F" || (shape.f === "B" && ctx.form !== "everyday");
  const text = capitalise(raw.replace(/\s+/g, " ").trim(), shape.f === "F");
  if (!acceptable(ctx, text, formal)) return undefined;
  const tones = new Set<GroupTone>([...shapeTones(shape), ...ctx.drawn]);
  return { text, family: ctx.family.key, type: type.key, shape: shape.p, front, form: shape.f, tones: GROUP_TONES.filter((t) => tones.has(t)) };
}

/** §11.2, §11.5 and §12: length, repetition and safeguards. */
function acceptable(ctx: Ctx, text: string, formal: boolean): boolean {
  const words = text.split(" ").filter((w) => w && w !== "&");
  const counted = words.filter((w, i) => !(i === 0 && w === "the") && !SMALL.has(w.toLowerCase()));
  if (counted.length > (formal ? 8 : 5)) return false;
  const content = counted.filter((w) => !w.startsWith("[")).flatMap((w) => w.split(/[-–]/));
  const seen = new Set<string>();
  let colours = 0;
  let numbers = 0;
  for (const raw of content) {
    const bare = raw.replace(/'s?$/, "").replace(/[(),.]/g, "");
    if (!bare) continue;
    const key = bare.toLowerCase().replace(/s$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    if (COLOUR_WORDS.has(bare)) colours++;
    if (NUMBER_WORDS.has(bare) || /^\d+(st|nd|rd|th)$/.test(bare)) numbers++;
  }
  if (colours > 1 || numbers > 1) return false;
  const n = norm(text);
  if (ctx.block.has(n)) return false;
  if (BANNED.some((re) => re.test(text))) return false;
  if (breaksGroupColourRule(text)) return false;
  return true;
}

/** §4: one name, with the failure rules; undefined after 40 failed draws. */
function oneName(ctx: Ctx, options: Required<Pick<GroupOptions, "front">>, chosen: GroupType | undefined, types: [GroupType, number][]): GroupName | undefined {
  const drawType = () => chosen ?? pickWeighted(types, ctx.rng);
  let type = drawType();
  const vocab = ctx.vocab;
  for (let round = 0; round < 2 && type; round++) {
    for (let i = 0; i < 20; i++) {
      const frontable = canFront(type);
      const front = frontable && (options.front === "hide" || (options.front === "may" && ctx.rng() < 0.25));
      const name = drawName(ctx, type, front);
      if (name) {
        ctx.vocab = vocab;
        return name;
      }
    }
    // After 20 failures: redraw the type, or with a chosen type retry with General flavour.
    if (chosen) {
      ctx.vocab = undefined;
      ctx.pools.clear();
    } else type = drawType();
  }
  if (ctx.vocab !== vocab) {
    ctx.vocab = vocab;
    ctx.pools.clear();
  }
  return undefined;
}

/** §4: a batch of unique names. */
export function generateGroupNames(options: GroupOptions): GroupBatch {
  const family = findFamily(options.family);
  if (!family) throw new Error(`Unknown family “${options.family}”.`);
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const genre = options.genre ?? "fantasy";
  const setting = groupSetting(genre, genre === "scifi" ? false : !!options.fantastic);
  const notices: string[] = [];
  const available = typesInSetting(family, setting);
  if (available.length === 0) throw new Error(`${family.label} aren't offered in ${SETTING_PHRASES[setting]}.`);
  const tradition = findTradition(options.tradition ?? "general");
  const people = isGeneral(tradition) ? undefined : tradition;
  // §9.8: South Asian trade uses General vocabulary.
  const vocab = people && !(people.key === "southAsian" && family.key === "trade") ? people : undefined;
  const guards = options.safeguards ?? { block: GROUP_DATA.safeguards.block, flag: GROUP_DATA.safeguards.flag, flagListBlocks: GROUP_DATA.safeguards.flagListBlocks };
  const block = new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(norm));
  const ctx: Ctx = {
    rng: mulberry32(seed),
    setting,
    family,
    vocab,
    people,
    mode: options.people ?? "placeholders",
    form: options.form ?? "any",
    block,
    pools: new Map(),
    tone: options.tone ?? "any",
    drawn: new Set(),
  };
  const chosen = options.type ? available.find((t) => t.key === options.type) : undefined;
  if (options.type && !chosen) {
    notices.push(`“${options.type}” isn't available in ${SETTING_PHRASES[setting]}; using any type.`);
  }
  const front = options.front ?? "say";
  // §10: hiding with type Any draws only front-capable types.
  const typeWeight = (t: GroupType) => t.weight * (vocab ? GROUP_DATA.traditions.typeMultipliers[vocab.key]?.[t.key] ?? 1 : 1);
  let candidates = available.filter((t) => front !== "hide" || canFront(t));
  if (candidates.length === 0) candidates = available;
  const types = candidates.map((t): [GroupType, number] => [t, typeWeight(t)]);

  const count = Math.max(0, Math.floor(options.count));
  const seen = new Set<string>();
  const names: GroupName[] = [];
  for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
    const name = oneName(ctx, { front }, chosen, types);
    if (!name) continue;
    const key = name.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
  return { names, seed, notices };
}

/** §1.2: "armies and martial orders · high or epic fantasy · Germanic & Norse". */
export function groupHistoryLabel(family: GroupFamily, genre: GroupGenre, fantastic: boolean, tradition: string): string {
  const t = findTradition(tradition);
  return [family.label, SETTING_PHRASES[groupSetting(genre, fantastic)], t && t.key !== "general" ? t.label : "General"].join(" · ");
}
