// Realms and polities (docs/realms-and-polities-brief.md): names for states, from kingdoms and
// duchies to leagues, colonies, corporate authorities and interstellar unions. Reuses the group
// engine's weighted draws, tone factor, plurals, possessives and safeguards, the bynames engine's
// places and culture animals, the biomes' terrain words and the tribal engine's peoples.
// No Obsidian imports.

import realmData from "../data/realms.json";
import { availableTerrains, type Biome, biomeTitleCase, findBiome, pluralOf, terrainWords } from "../biomes";
import { BYNAME_CULTURES, cultureAnimals, holyNamesIn, townSource } from "../bynames/engine";
import {
  breaksGroupColourRule,
  type GroupGenre,
  type GroupPeople,
  type GroupSafeguards,
  type GroupSetting,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  groupListWords,
  groupPlural,
  groupPossessive,
  groupSaint,
  groupSetting,
  groupTown,
  hasBannedWord,
  normForBlock,
  pickWeighted,
  repeatsContent,
  SETTING_PHRASES,
  toneFactor,
  wordTones as gnWordTones,
} from "../groups/engine";
import { mulberry32 } from "../markov";
import { generateTribalNames } from "../tribes/engine";
import { VESSEL_DATA } from "../vessels/engine";
import { WORLD_CULTURES } from "../world/engine";

// ── Data ────────────────────────────────────────────────────────────────────

export type EraCode = "AN" | "MD" | "EM" | "MO" | "NF" | "IS";
export type RealmNamedFor = "anything" | "land" | "place" | "dynasty" | "people" | "stars";
export type RealmLength = "plain" | "ceremonial";
export type RealmOutput = "official" | "short" | "both";
type FormGroup = "crown" | "imperial" | "republic" | "federal" | "admin" | "tribal";

export interface RealmEntry {
  w: string;
  x?: number;
  t?: GroupTone[];
  cx?: Record<string, number>;
  eras?: EraCode[];
  biome?: string;
  character?: string;
}

export interface RealmForm {
  w: string;
  pl: string;
  g: FormGroup;
  era: Record<EraCode, number>;
  t?: GroupTone[];
  compound?: boolean;
  peoplesOnly?: boolean;
}

export interface RealmShape {
  p: string;
  w: number;
  /** §11: the short form: "same", or a template over the tokens drawn. */
  short: string;
  /** The form group of a shape with no `{form}` token (for its honorific, §8). */
  g?: FormGroup;
  t?: GroupTone[];
  eras?: EraCode[];
  /** §8: the token an "and" pair repeats; whether "Upper and Lower" can apply. */
  pair?: string;
  upperLower?: boolean;
  ceremonialOnly?: boolean;
  /** The shape carries its own honorific (Most Serene Republic of …). */
  honorific?: boolean;
  /** Forms limited to these groups (Temple {form}). */
  groups?: FormGroup[];
  /** The collective qualifier a literal word stands for (the Merchant {collNoun}). */
  collQual?: string;
}

interface RealmData {
  eras: { key: string; label: string; code: EraCode }[];
  forms: RealmForm[];
  cultures: Record<
    string,
    {
      mult: Record<string, number>;
      forms?: { w: string; pl: string; g: FormGroup; eras: EraCode[]; x: number }[];
      eraMult?: Partial<Record<EraCode, Record<string, number>>>;
      peoplesMult?: number;
    }
  >;
  characters: { key: string; menu: string; plural: string; w: number; description: string; eraMult?: Partial<Record<EraCode, number>> }[];
  characterMult: Record<string, { forms: Record<string, number>; groups: Partial<Record<FormGroup, number>> }>;
  namedFor: { key: RealmNamedFor; label: string; eras?: EraCode[] }[];
  namedForWeights: Record<string, Record<Exclude<RealmNamedFor, "anything">, number>>;
  lists: Record<string, RealmEntry[]>;
  cultQualExtra: Record<string, string[]>;
  wordTones: Record<string, Record<string, GroupTone[]>>;
  landIdentity: { p: string; w: number }[];
  shapes: Record<"land" | "place" | "dynasty" | "stars" | "collective" | "people", RealmShape[]>;
  collectiveShare: number;
  characterShapes: Record<string, { share: number; t?: GroupTone[]; shapes: RealmShape[] }>;
  modifiers: { w: string; with: string[]; eras: EraCode[]; t?: GroupTone[] }[];
  ideology: { with: string[]; eras: EraCode[]; share: number; words: RealmEntry[] };
  political: string[];
  collQual: { w?: string; list?: string; with: string[] }[];
  honorifics: Record<FormGroup, RealmEntry[]>;
  ceremonial: { pair: number; upperLower: number; t: GroupTone[] };
  homeland: Record<string, string>;
  tribal: Record<string, string>;
  dynastyCultures: string[];
  safeguards: { block: string[]; flag: string[]; flagListBlocks: boolean; banned: string[]; religious: string[] };
  caps: Record<RealmLength, number>;
}

export const REALM_DATA = realmData as unknown as RealmData;
export const REALM_ERAS = REALM_DATA.eras;
export const REALM_CHARACTERS = REALM_DATA.characters;
export const REALM_NAMED_FOR = REALM_DATA.namedFor;
/** §0: the 20 byname cultures. */
export const REALM_CULTURES = BYNAME_CULTURES;

export const eraCode = (era: string): EraCode => REALM_ERAS.find((e) => e.key === era)?.code ?? "MD";
const ERA_ORDER: EraCode[] = ["AN", "MD", "EM", "MO", "NF", "IS"];

/** §2.2: whether a namedFor is offered in an era ("the stars": near future and interstellar). */
export function namedForOffered(key: RealmNamedFor, era: string): boolean {
  const n = REALM_NAMED_FOR.find((x) => x.key === key);
  return !!n && (!n.eras || n.eras.includes(eraCode(era)));
}

/** §2.2: a culture's homeland biome id. */
export function homelandBiome(culture: string): string {
  return WORLD_CULTURES.find((c) => c.id === culture)?.homelandBiome ?? REALM_DATA.homeland[culture] ?? "temperate";
}

// ── Forms (§3, §5.2) ────────────────────────────────────────────────────────

interface FormChoice {
  w: string;
  pl: string;
  g: FormGroup;
  t: GroupTone[];
  compound: boolean;
  peoplesOnly: boolean;
  culture: boolean;
}

/** Every form a culture can draw in an era, with its weight before the character (§3.2–§3.4). */
const FORM_CACHE = new Map<string, [FormChoice, number][]>();
function cultureForms(culture: string, era: EraCode): [FormChoice, number][] {
  const key = `${culture}|${era}`;
  const cached = FORM_CACHE.get(key);
  if (cached) return cached;
  const c = REALM_DATA.cultures[culture];
  const out: [FormChoice, number][] = [];
  for (const f of REALM_DATA.forms) {
    let w = f.era[era] * (c?.mult[f.w] ?? 1) * (c?.eraMult?.[era]?.[f.w] ?? 1);
    out.push([{ w: f.w, pl: f.pl, g: f.g, t: f.t ?? [], compound: !!f.compound, peoplesOnly: !!f.peoplesOnly, culture: false }, w]);
  }
  // §3.3–§3.4: culture forms at 15 × their multiplier, ×0.3 outside their eras.
  for (const f of c?.forms ?? []) {
    out.push([{ w: f.w, pl: f.pl, g: f.g, t: [], compound: false, peoplesOnly: false, culture: true }, 15 * f.x * (f.eras.includes(era) ? 1 : 0.3)]);
  }
  const live = out.filter(([, w]) => w > 0);
  FORM_CACHE.set(key, live);
  return live;
}

/** §5.2: a form's character multiplier: its own, else its group's. */
function characterMult(character: string, form: FormChoice): number {
  const m = REALM_DATA.characterMult[character];
  if (!m) return 1;
  return m.forms[form.w] ?? m.groups[form.g] ?? 1;
}

/** The form names a culture can ever draw (tests, compatibility). */
export const ALL_FORMS = [...new Set([...REALM_DATA.forms.map((f) => f.w), ...Object.values(REALM_DATA.cultures).flatMap((c) => (c.forms ?? []).map((f) => f.w))])];
export const COMPOUND_FORMS = REALM_DATA.forms.filter((f) => f.compound).map((f) => f.w);
export const formGroup = (w: string): FormGroup | undefined =>
  REALM_DATA.forms.find((f) => f.w === w)?.g ?? Object.values(REALM_DATA.cultures).flatMap((c) => c.forms ?? []).find((f) => f.w === w)?.g;

// ── Modifiers (§7) ──────────────────────────────────────────────────────────

const eraAtLeast = (era: EraCode, from: EraCode) => ERA_ORDER.indexOf(era) >= ERA_ORDER.indexOf(from);
export const isIdeological = (w: string) => REALM_DATA.ideology.words.some((e) => e.w === w);

/** §7.1, §7.3: the modifiers that may go with a form in an era. */
export function compatibleModifiers(form: string, era: EraCode): RealmEntry[] {
  const g = formGroup(form);
  const out: RealmEntry[] = [];
  for (const m of REALM_DATA.modifiers) {
    if (!m.with.includes(form) || !m.eras.includes(era)) continue;
    if (form.split(/[\s-]/).includes(m.w)) continue;
    if (m.w === "Free" && (g === "crown" || g === "imperial")) continue;
    if ((m.w === "Royal" || m.w === "Imperial") && (g === "republic" || g === "federal")) continue;
    out.push({ w: m.w, t: m.t });
  }
  return out;
}

const ideologyFor = (form: string, era: EraCode) => REALM_DATA.ideology.with.includes(form) && REALM_DATA.ideology.eras.includes(era);

/** §7.2: the collective qualifiers that may go with a collective noun. */
export function compatibleCollQuals(noun: string): string[] {
  const out: string[] = [];
  for (const q of REALM_DATA.collQual) {
    if (!q.with.includes(noun)) continue;
    if (q.w) out.push(q.w);
    else out.push(...REALM_DATA.lists[q.list!].map((e) => e.w));
  }
  return out;
}

// ── Options and results ─────────────────────────────────────────────────────

export interface RealmOptions {
  culture?: string;
  /** A character key; undefined is Any. */
  character?: string;
  era?: string;
  genre?: GroupGenre;
  fantastic?: boolean;
  namedFor?: RealmNamedFor;
  /** A biome id; undefined or "homeland" is the culture's homeland. */
  biome?: string;
  /** A resolved biome (a user pack), used in place of `biome`. */
  biomeData?: Biome;
  terrain?: string;
  tone?: GroupToneChoice;
  length?: RealmLength;
  output?: RealmOutput;
  people?: GroupPeople;
  count: number;
  seed?: number;
  safeguards?: GroupSafeguards;
}

export interface RealmName {
  /** The name as the output link asks for it. */
  text: string;
  official: string;
  short: string;
  character: string;
  namedFor: string;
  /** "land", "place", …, "collective" or "character". */
  kind: string;
  shape: string;
  form?: string;
  formGroup?: string;
  modifier?: string;
  honorific?: string;
  collQual?: string;
  collNoun?: string;
  tones: GroupTone[];
}

export interface RealmBatch {
  names: RealmName[];
  seed: number;
  notices: string[];
}

// ── Drawing ─────────────────────────────────────────────────────────────────

interface Ctx {
  rng: () => number;
  setting: GroupSetting;
  era: EraCode;
  culture: string;
  character: string;
  tone: GroupToneChoice;
  mode: GroupPeople;
  biome: Biome;
  lists: Map<string, [RealmEntry, number][]>;
  pools: Map<string, [RealmEntry, number][]>;
  tribal: () => string | undefined;
  drawn: Set<GroupTone>;
  /** The values drawn this name, by token (first occurrence), and the form and qualifiers. */
  values: Map<string, string>;
  form?: FormChoice;
  modifier?: string;
  collNoun?: string;
  collQual?: string;
}

const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];

/** §6.1: the identity lists, with the biome's terrain words ×3 (and only those for a chosen terrain). */
const LIST_CACHE = new Map<Biome, Map<string, Map<string, [RealmEntry, number][]>>>();
function identityLists(biome: Biome, terrain: string): Map<string, [RealmEntry, number][]> {
  let byTerrain = LIST_CACHE.get(biome);
  if (!byTerrain) LIST_CACHE.set(biome, (byTerrain = new Map()));
  const cached = byTerrain.get(terrain);
  if (cached) return cached;
  const lists = new Map<string, [RealmEntry, number][]>();
  for (const [name, entries] of Object.entries(REALM_DATA.lists)) lists.set(name, entries.map((e): [RealmEntry, number] => [e, e.x ?? 1]));
  const terrains = terrain && terrain !== "any" ? [terrain] : availableTerrains(biome).map((t) => t.id);
  const add = { landPl: [] as string[], waterPl: [] as string[], waterSg: [] as string[] };
  for (const t of terrains) {
    for (const [w] of terrainWords(biome, "land", t)) {
      if (w.includes("{")) continue;
      add.landPl.push(/s$/.test(w) ? w : biomeTitleCase(pluralOf(w.toLowerCase())));
    }
    for (const [w] of terrainWords(biome, "water", t)) {
      if (w.includes("{")) continue;
      (/s$/.test(w) ? add.waterPl : add.waterSg).push(w);
    }
  }
  const chosen = terrain && terrain !== "any";
  for (const [name, words] of Object.entries(add)) {
    const unique = [...new Set(words)];
    if (unique.length === 0) continue;
    const biomeWords = unique.map((w): [RealmEntry, number] => [{ w }, 3]);
    // A chosen terrain's own words replace the base list (landPl, waterPl) where it gives some.
    if (chosen && name !== "waterSg") lists.set(name, biomeWords);
    else lists.set(name, [...lists.get(name)!.filter(([e]) => !unique.includes(e.w)), ...biomeWords]);
  }
  byTerrain.set(terrain, lists);
  return lists;
}

const wordToneOf = (list: string, e: RealmEntry) => REALM_DATA.wordTones[list]?.[e.w] ?? e.t ?? [];

/** A list's words here: era, biome and character gating, culture multipliers, tone. */
function listPool(ctx: Ctx, name: string): [RealmEntry, number][] {
  const key = `${name}|${ctx.character}`;
  const cached = ctx.pools.get(key);
  if (cached) return cached;
  const result = buildListPool(ctx, name);
  ctx.pools.set(key, result);
  return result;
}

function buildListPool(ctx: Ctx, name: string): [RealmEntry, number][] {
  const out: [RealmEntry, number][] = [];
  for (const [e, w] of ctx.lists.get(name) ?? []) {
    if (e.eras && !e.eras.includes(ctx.era)) continue;
    if (e.biome && e.biome !== ctx.biome.id) continue;
    if (e.character && e.character !== ctx.character) continue;
    out.push([e, w * (e.cx?.[ctx.culture] ?? 1)]);
  }
  if (name === "cultQual") {
    for (const w of REALM_DATA.cultQualExtra[ctx.culture] ?? []) {
      const found = out.find(([e]) => e.w === w);
      if (found) found[1] *= 3;
      else out.push([{ w }, 3]);
    }
  }
  if (name === "peopleQual") {
    for (const w of cultureAnimals(ctx.culture)) {
      const found = out.find(([e]) => e.w === w);
      if (found) found[1] *= 2;
      else out.push([{ w }, 2]);
    }
    // Colour words at ×0.3 (never before Peoples, Folk or Kin: checked on the name).
    for (const [w, n] of groupListWords("colour", ctx.setting)) out.push([{ w, t: gnWordTones("colour", w) }, n * 0.3]);
  }
  return out.map(([e, w]): [RealmEntry, number] => [e, w * toneFactor(wordToneOf(name, e), ctx.tone)]).filter(([, w]) => w > 0);
}

function listWord(ctx: Ctx, name: string, keep?: (w: string) => boolean): string | undefined {
  const pool = keep ? listPool(ctx, name).filter(([e]) => keep(e.w)) : listPool(ctx, name);
  const e = pickWeighted(pool, ctx.rng);
  if (!e) return undefined;
  for (const t of wordToneOf(name, e)) ctx.drawn.add(t);
  return e.w;
}

/** GN lists with their setting tags and tones. */
function gnWord(ctx: Ctx, name: string, keep?: (w: string) => boolean, setting = ctx.setting): string | undefined {
  const pool = groupListWords(name, setting)
    .filter(([w]) => !keep || keep(w))
    .map(([w, n]): [string, number] => [w, n * toneFactor(gnWordTones(name, w), ctx.tone)])
    .filter(([, n]) => n > 0);
  const w = pickWeighted(pool, ctx.rng);
  if (w !== undefined) for (const t of gnWordTones(name, w)) ctx.drawn.add(t);
  return w;
}

/** §3, §5.2: a form, weighted by era, culture, character and tone; `keep` limits the forms. */
function drawForm(ctx: Ctx, keep: (f: FormChoice) => boolean): FormChoice | undefined {
  const pool = cultureForms(ctx.culture, ctx.era)
    .filter(([f]) => keep(f))
    .map(([f, w]): [FormChoice, number] => [f, w * characterMult(ctx.character, f) * toneFactor(f.t, ctx.tone)])
    .filter(([, w]) => w > 0);
  const f = pickWeighted(pool, ctx.rng);
  if (f) for (const t of f.t) ctx.drawn.add(t);
  return f;
}

/** §7.1: a modifier for the drawn form: ideology instead at 25% where it may go. */
function drawModifier(ctx: Ctx): string | undefined {
  const form = ctx.form?.w;
  if (!form) return undefined;
  const plain = compatibleModifiers(form, ctx.era);
  const ideology = ideologyFor(form, ctx.era);
  const fromIdeology = ideology && (plain.length === 0 || ctx.rng() < REALM_DATA.ideology.share);
  const entries = fromIdeology ? REALM_DATA.ideology.words : plain;
  const pool = entries.map((e): [RealmEntry, number] => [e, (e.x ?? 1) * toneFactor(e.t ?? [], ctx.tone)]).filter(([, w]) => w > 0);
  const e = pickWeighted(pool, ctx.rng);
  if (!e) return undefined;
  for (const t of e.t ?? []) ctx.drawn.add(t);
  return e.w;
}

const DYNASTY = (f: FormChoice) => (f.g === "crown" || f.g === "imperial") && !f.compound && !f.peoplesOnly;
const PEOPLES = (f: FormChoice) => f.g === "federal" || f.g === "tribal" || ["Kingdom", "Realm", "Nation"].includes(f.w);
const PLAIN_FORM = (f: FormChoice) => !f.peoplesOnly;
const CHRISTIAN = new Set(["general", "anglo-saxon", "celtic", "norman-british", "roman", "greek-byzantine", "slavic", "ethiopian"]);

/** §6.1: a place for the culture, without a leading "The", without deity or saint names in the no-gods cultures. */
function place(ctx: Ctx): string | undefined {
  if (ctx.mode === "placeholders") return "[place]";
  const holy = holyNamesIn(ctx.culture);
  for (let i = 0; i < 20; i++) {
    const t = groupTown(ctx.setting, townSource(ctx.culture), ctx.rng).replace(/^The /, "");
    if (!holy || !holy.test(t)) return t;
  }
  return undefined;
}

/** One token (§6). `formKeep` limits `{form}` in this shape. */
function token(ctx: Ctx, name: string, shape: RealmShape, kind: string): string | undefined {
  const rng = ctx.rng;
  switch (name) {
    case "form":
    case "federalForm":
      return ctx.form?.w;
    case "modifier":
      return (ctx.modifier = drawModifier(ctx));
    case "collNoun":
      return ctx.collNoun;
    case "collQual": {
      const ok = compatibleCollQuals(ctx.collNoun ?? "");
      const pool = ok.map((w): [string, number] => {
        const t: GroupTone[] = w === "Free" && ctx.collNoun === "Ports" ? ["light"] : [];
        return [w, toneFactor(t, ctx.tone)];
      });
      const q = pickWeighted(pool, rng);
      if (q === "Free" && ctx.collNoun === "Ports") ctx.drawn.add("light");
      return (ctx.collQual = q);
    }
    case "landIdentity": {
      const p = pickWeighted(REALM_DATA.landIdentity.map((s): [string, number] => [s.p, s.w]), rng)!;
      return renderTokens(ctx, p, shape, kind);
    }
    case "place":
      return place(ctx);
    case "landCompound":
      return ctx.mode === "placeholders" ? "[place]" : groupTown("FL", undefined, rng);
    case "dynasty":
      if (ctx.mode === "placeholders" || !REALM_DATA.dynastyCultures.includes(ctx.culture)) return "[dynasty]";
      return gnWord(ctx, "house");
    case "star":
      // §6.1: GN stars, plus Sol ×0.3; never a placeholder.
      return rng() < 0.3 / (groupListWords("star", "SF").length + 0.3) ? "Sol" : gnWord(ctx, "star", undefined, "SF");
    case "spaceLand": {
      const w = gnWord(ctx, "spaceLand", undefined, "SF");
      return w && rng() < 0.3 ? `${gnWord(ctx, "spacePrefix", undefined, "SF")} ${w}` : w;
    }
    case "tribal": {
      if (ctx.mode === "placeholders") return "[people]";
      const t = ctx.tribal();
      return t ? (/^the /i.test(t) ? t : `the ${t}`) : undefined;
    }
    case "holy":
      if (ctx.mode === "placeholders") return "[holy person]";
      return CHRISTIAN.has(ctx.culture) ? groupSaint(ctx.setting, rng) : `the ${gnWord(ctx, "holyTitle")}`;
    case "beast": {
      const animals = cultureAnimals(ctx.culture);
      const pool: [string, number][] = [...groupListWords("beast", ctx.setting), ...animals.map((a): [string, number] => [a, 3])];
      return pickWeighted(pool, rng);
    }
    case "number":
      return gnWord(ctx, "number", (w) => !["Two", "Hundred", "Thousand"].includes(w));
    case "colour":
    case "brandRoot":
      return gnWord(ctx, name);
  }
  return listWord(ctx, name);
}

/** Renders a pattern's tokens, recording each token's first value. */
function renderTokens(ctx: Ctx, pattern: string, shape: RealmShape, kind: string): string | undefined {
  let failed = false;
  const out = pattern.replace(/\{([^}]+)\}/g, (_m, raw: string) => {
    if (failed) return "";
    const [name, mod] = raw.split(":");
    const text = token(ctx, name, shape, kind);
    if (!text) {
      failed = true;
      return "";
    }
    if (!ctx.values.has(name)) ctx.values.set(name, text);
    if (mod === "poss") return groupPossessive(text, false);
    if (mod === "pl") return text.startsWith("[") ? text : groupPlural(text);
    return text;
  });
  return failed ? undefined : out;
}

// ── Rendering (§10) ─────────────────────────────────────────────────────────

const SMALL = new Set(["of", "the", "and", "for", "in", "at", "by", "on", "to", "from"]);

/** §10: capitals, a lower-case leading "the", no doubled "the". */
export function realmCapitals(text: string): string {
  return text
    .replace(/\bthe the\b/gi, "the")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word, i) => {
      if (!word || word.startsWith("[")) return word;
      const lower = word.toLowerCase();
      if (SMALL.has(lower) && (i > 0 || lower === "the")) return lower;
      return word.replace(/(^|[-–])([a-z])/g, (_m, sep: string, c: string) => sep + c.toUpperCase());
    })
    .join(" ");
}

/** GN §11.2: content words, a leading "the" and the small words not counted. */
const counted = (text: string) => text.split(" ").filter((w, i) => w && !(i === 0 && w.toLowerCase() === "the") && !SMALL.has(w.toLowerCase()));

// ── Safeguards (§12) ────────────────────────────────────────────────────────

const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const BANNED = [...REALM_DATA.safeguards.banned, ...REALM_DATA.safeguards.religious, ...VESSEL_DATA.safeguards.divine, ...VESSEL_DATA.safeguards.divinePhrases].map(wordRe);

/** §12.3: banned words, living religions' names and terms. */
export function breaksRealmWords(text: string): boolean {
  return hasBannedWord(text) || BANNED.some((re) => re.test(text));
}

/** §6.4 / GN §12.4: no colour before Peoples, Folk or Kin. */
const COLOUR_BEFORE_PEOPLE = new RegExp(`\\b(${groupListWords("colour", "FL").map(([w]) => w).join("|")}) (Peoples|Folk|Kin)\\b`);

// ── Batches ─────────────────────────────────────────────────────────────────

const TRIBAL_POOLS = new Map<string, string[]>();
function tribalPool(tradition: string, biome: Biome, terrain: string, custom?: Biome): string[] {
  const key = `${tradition}|${custom ? custom.custom?.path ?? biome.id : biome.id}|${terrain}`;
  let found = TRIBAL_POOLS.get(key);
  if (!found) {
    found = generateTribalNames({ tradition, ...(custom ? { biomeData: custom } : { biome: biome.id }), terrain, count: 120, seed: 1789 })
      .names.map((n) => n.name)
      .filter((n) => !n.includes("["));
    TRIBAL_POOLS.set(key, found);
  }
  return found;
}

type ShapeKind = "land" | "place" | "dynasty" | "stars" | "collective" | "people" | "character";

/** §4: a batch of unique names. */
export function generateRealmNames(options: RealmOptions): RealmBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const notices: string[] = [];
  const culture = REALM_CULTURES.some((c) => c.key === options.culture) ? options.culture! : "general";
  const era = eraCode(options.era ?? "medieval");
  const genre = options.genre ?? "fantasy";
  const setting = groupSetting(genre, genre === "scifi" ? false : !!options.fantastic);
  const tone = options.tone ?? "any";
  const length = options.length ?? "plain";
  const output = options.output ?? "official";
  const mode = options.people ?? "placeholders";
  let namedFor = options.namedFor ?? "anything";
  if (namedFor === "stars" && !namedForOffered("stars", options.era ?? "medieval")) {
    notices.push("“The stars” needs the near-future or interstellar era.");
    namedFor = "anything";
  }
  const biome =
    options.biomeData ?? findBiome(!options.biome || options.biome === "homeland" ? homelandBiome(culture) : options.biome) ?? findBiome("temperate")!;
  const terrain = options.terrain ?? "any";
  const lists = identityLists(biome, terrain);
  const chosen = options.character ? REALM_CHARACTERS.find((c) => c.key === options.character) : undefined;
  if (options.character && !chosen) notices.push(`“${options.character}” isn't a realm character; using any.`);
  const characters = REALM_CHARACTERS.map((c): [string, number] => [c.key, c.w * (c.eraMult?.[era] ?? 1)]).filter(([, w]) => w > 0);
  const guards = options.safeguards ?? { block: REALM_DATA.safeguards.block, flag: REALM_DATA.safeguards.flag, flagListBlocks: REALM_DATA.safeguards.flagListBlocks };
  const pools = new Map<string, [RealmEntry, number][]>();
  const block = new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(normForBlock));

  // §6.4: the peoples, from a pool made once per tradition and land with a fixed seed (as GN towns are).
  const tribal = () => {
    const pool = tribalPool(REALM_DATA.tribal[culture] ?? "general", biome, terrain, options.biomeData);
    return pool.length > 0 ? pickOne(pool, rng) : undefined;
  };

  const namedForWeights = (character: string): [RealmNamedFor, number][] =>
    (Object.entries(REALM_DATA.namedForWeights[character]) as [RealmNamedFor, number][])
      .filter(([k]) => namedForOffered(k, REALM_ERAS.find((e) => e.code === era)!.key))
      .map(([k, w]): [RealmNamedFor, number] => [k, w * (k === "people" ? REALM_DATA.cultures[culture]?.peoplesMult ?? 1 : 1)])
      .filter(([, w]) => w > 0);

  /** §4: the shape for a name: character shapes, collectives or the namedFor's. */
  const chooseShape = (character: string, nf: RealmNamedFor): { shape: RealmShape; kind: ShapeKind; nf: string; t: GroupTone[] } | undefined => {
    const weigh = (shapes: RealmShape[], extra: GroupTone[] = []) =>
      shapes
        .filter((s) => (!s.eras || s.eras.includes(era)) && (!s.ceremonialOnly || length === "ceremonial"))
        .map((s): [RealmShape, number] => [s, s.w * toneFactor([...extra, ...(s.t ?? [])], tone)])
        .filter(([, w]) => w > 0);
    const own = REALM_DATA.characterShapes[character];
    if (namedFor === "anything" && own && rng() < own.share) {
      const s = pickWeighted(weigh(own.shapes, own.t), rng);
      if (s) return { shape: s, kind: "character", nf: "character", t: [...(own.t ?? []), ...(s.t ?? [])] };
    }
    const resolved = nf === "anything" ? pickWeighted(namedForWeights(character), rng) : nf;
    if (!resolved || resolved === "anything") return undefined;
    // §6.3: land and place take a collective 15% of the time.
    const kind: ShapeKind = (resolved === "land" || resolved === "place") && rng() < REALM_DATA.collectiveShare ? "collective" : resolved;
    const s = pickWeighted(weigh(REALM_DATA.shapes[kind]), rng);
    return s ? { shape: s, kind, nf: resolved, t: s.t ?? [] } : undefined;
  };

  const oneName = (): RealmName | undefined => {
    for (let round = 0; round < 2; round++) {
      const character = chosen?.key ?? pickWeighted(characters, rng);
      if (!character) return undefined;
      for (let i = 0; i < 20; i++) {
        const choice = chooseShape(character, namedFor);
        if (!choice) continue;
        const built = build(character, choice);
        if (built) return built;
      }
    }
    return undefined;
  };

  function build(character: string, choice: { shape: RealmShape; kind: ShapeKind; nf: string; t: GroupTone[] }): RealmName | undefined {
    const { shape, kind } = choice;
    const ctx: Ctx = { rng, setting, era, culture, character, tone, mode, biome, lists, pools, tribal, drawn: new Set(), values: new Map() };
    // Forms and collective nouns first: modifiers and qualifiers must suit them (§7).
    if (/\{(form|federalForm)\}/.test(shape.p)) {
      const keep = shape.p.includes("{federalForm}")
        ? (f: FormChoice) => f.g === "federal" && !f.peoplesOnly
        : kind === "dynasty"
          ? DYNASTY
          : kind === "people"
            ? PEOPLES
            : shape.groups
              ? (f: FormChoice) => shape.groups!.includes(f.g) && PLAIN_FORM(f)
              : shape.p.includes("{modifier}")
                ? (f: FormChoice) => PLAIN_FORM(f) && (compatibleModifiers(f.w, era).length > 0 || ideologyFor(f.w, era))
                : PLAIN_FORM;
      ctx.form = drawForm(ctx, keep);
      if (!ctx.form) return undefined;
    }
    if (shape.p.includes("{collNoun}")) {
      const keep = shape.collQual ? (w: string) => compatibleCollQuals(w).includes(shape.collQual!) : (w: string) => compatibleCollQuals(w).length > 0 || !shape.p.includes("{collQual}");
      ctx.collNoun = listWord(ctx, "collNoun", keep);
      if (!ctx.collNoun) return undefined;
    }
    const ceremonial = length === "ceremonial";
    let pattern = shape.p;
    // §8: "Upper and Lower" (land identities), else an "and" pair.
    let pairToken: string | undefined;
    if (ceremonial) {
      if (shape.upperLower && rng() < REALM_DATA.ceremonial.upperLower) pattern = pattern.replace("{landIdentity}", "Upper and Lower {landPl}");
      else if (shape.pair && rng() < REALM_DATA.ceremonial.pair) pairToken = shape.pair;
    }
    let raw = renderTokens(ctx, pattern, shape, kind);
    if (!raw) return undefined;
    // §11: the plain name underneath a ceremonial one (without an "and" pair).
    const plainOfficial = realmCapitals(raw);
    if (pattern !== shape.p) ctx.values.set("landIdentity", raw.slice(raw.indexOf("Upper and Lower")));
    if (pairToken) {
      const first = ctx.values.get(pairToken)!;
      const second = token(ctx, pairToken, shape, kind);
      if (!second || second === first) return undefined;
      const the = new RegExp(`of the ${first.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(raw);
      raw = raw.replace(first, `${first} and ${the ? "the " : ""}${second.replace(/^the /, "")}`);
    }
    let official = realmCapitals(raw);
    // §8: an honorific for the form's group, always, in ceremonial names.
    let honorific: string | undefined;
    if (ceremonial && !shape.honorific) {
      const group = ctx.form?.g ?? shape.g ?? "federal";
      const pool = REALM_DATA.honorifics[group].map((e): [RealmEntry, number] => [e, (e.x ?? 1) * toneFactor(e.t ?? [], tone)]).filter(([, w]) => w > 0);
      const h = pickWeighted(pool, rng);
      if (!h) return undefined;
      honorific = h.w;
      for (const t of h.t ?? []) ctx.drawn.add(t);
      official = realmCapitals(`${honorific} ${official.replace(/^the /, "")}`);
    } else if (shape.honorific) honorific = "Most Serene";
    const short = realmCapitals(renderShort(ctx, shape.short, plainOfficial));
    // Caps, repetition, safeguards (§4, §7.3, §12).
    const words = counted(official);
    if (words.length === 0 || words.length > REALM_DATA.caps[length]) return undefined;
    if (repeatsContent(words)) return undefined;
    for (const n of [official, short]) if (block.has(normForBlock(n))) return undefined;
    if (breaksRealmWords(official) || breaksGroupColourRule(official) || COLOUR_BEFORE_PEOPLE.test(official)) return undefined;
    const text = output === "official" ? official : output === "short" ? short : official.toLowerCase() === short.toLowerCase() ? official : `${official} (${short})`;
    const tones = new Set<GroupTone>([...choice.t, ...ctx.drawn, ...(ceremonial ? REALM_DATA.ceremonial.t : [])]);
    return {
      text,
      official,
      short,
      character,
      namedFor: choice.nf,
      kind,
      shape: shape.p,
      ...(ctx.form ? { form: ctx.form.w, formGroup: ctx.form.g } : shape.g ? { formGroup: shape.g } : {}),
      ...(ctx.modifier ? { modifier: ctx.modifier } : {}),
      ...(honorific ? { honorific } : {}),
      ...(ctx.collQual ? { collQual: ctx.collQual } : shape.collQual ? { collQual: shape.collQual } : {}),
      ...(ctx.collNoun ? { collNoun: ctx.collNoun } : {}),
      tones: GROUP_TONES.filter((t) => tones.has(t)),
    };
  }

  const seen = new Set<string>();
  const names: RealmName[] = [];
  const count = Math.max(0, Math.floor(options.count));
  for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
    const name = oneName();
    if (!name) continue;
    const key = name.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
  return { names, seed, notices };
}

/** §11: a short form from the shape's template and the values drawn ("same": the plain name). */
function renderShort(ctx: Ctx, template: string, plain: string): string {
  if (template === "same") return plain;
  const keepThe = template.startsWith("the ");
  const out = template.replace(/\{([^}]+)\}/g, (_m, raw: string) => {
    const [name, mod] = raw.split(":");
    const v = ctx.values.get(name) ?? "";
    if (mod === "poss") return groupPossessive(v, false);
    if (mod === "pl") return v.startsWith("[") ? v : groupPlural(v);
    return v;
  });
  return keepThe ? out : out.replace(/^the /i, "");
}

/** §1.2: "realms and polities · historic or low fantasy · Steppe · medieval", then character and tone. */
export function realmHistoryLabel(genre: GroupGenre, fantastic: boolean, culture: string, era: string, character?: string, tone: GroupToneChoice = "any"): string {
  const label = REALM_CULTURES.find((c) => c.key === culture)?.label ?? "General";
  return [
    "realms and polities",
    SETTING_PHRASES[groupSetting(genre, genre === "scifi" ? false : fantastic)],
    label,
    REALM_ERAS.find((e) => e.key === era)?.label ?? era,
    ...(character ? [character] : []),
    ...(tone !== "any" ? [tone] : []),
  ].join(" · ");
}
