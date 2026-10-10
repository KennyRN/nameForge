// Ships and spacecraft (docs/ships-and-spacecraft-brief.md): vessel names from a culture, a
// technology, a function, a style and a tone. Reuses the group engine's weighted draws, setting
// tags, tone factor, invented people and places, possessives, repetition check and safeguards.
// No Obsidian imports.

import vesselData from "../data/vessels.json";
import { cultureLand, holyNamesIn, stripPlural, worldAnimals } from "../bynames/engine";
import {
  type GroupGenre,
  type GroupPeople,
  type GroupSafeguards,
  type GroupSetting,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  groupListWords,
  groupPerson,
  groupPossessive,
  groupSaint,
  groupSetting,
  groupTown,
  hasBannedWord,
  normForBlock,
  ordinalText,
  counterGap,
  seriesTokenKind,
  pickWeighted,
  repeatsContent,
  SETTING_PHRASES,
  toneFactor,
  wordTones,
} from "../groups/engine";
import { mulberry32 } from "../markov";
import { findTradition } from "../tribes/engine";
import { WORLD_CULTURES } from "../world/engine";

// ── Data ────────────────────────────────────────────────────────────────────

export type VesselModule = "ships" | "spacecraft";
type HolyType = "christian" | "gods" | "blessing" | "none";

export interface VesselEntry {
  w: string;
  x?: number;
  t?: GroupTone[];
  /** §4.1: the technology levels the word belongs to, e.g. "T5-T7". */
  k?: string;
}

export interface VesselShape {
  role: string;
  p: string;
  w: number;
  k?: string;
  s?: GroupSetting[];
  fn?: string[];
  t?: GroupTone[];
  /** §8.4: which holy types draw the shape. */
  holy?: "saint" | "blessing" | "marian" | "blessingOnly";
}

export interface VesselCulture {
  key: string;
  label: string;
  group: string;
  span: string;
  roles?: Record<string, number>;
  techRoles?: Record<string, Record<string, number>>;
  flavour?: string[] | { world: string } | { tribal: string };
  town: string;
  holy: HolyType;
  /** The saint shape's multiplier ("christian ×0.3"). */
  holyX?: number;
  /** `Our Lady of {marian}`: only where a culture says so, at this multiplier. */
  marian?: number;
  noSaints?: boolean;
  gods?: { world?: string; list?: VesselEntry[]; k?: string; shapes: { p: string; w: number }[] };
  shapes?: VesselShape[];
  lists?: Record<string, VesselEntry[]>;
  sensitive?: boolean;
  surnames?: boolean;
  womanNames?: boolean;
}

export interface VesselFunction {
  key: string;
  menu: string;
  plural: string;
  w: number;
  description: string;
  min?: string;
  noSensitive?: boolean;
}

export interface VesselStyle {
  key: string;
  label: string;
  settings: GroupSetting[];
  modules: VesselModule[];
  description: string;
  tone?: GroupTone;
  name: VesselEntry[];
  pools: Record<string, VesselEntry[]>;
  shapes: string[];
}

interface VesselData {
  modules: Record<VesselModule, string>;
  cultures: VesselCulture[];
  technology: Record<VesselModule, { code: string; label: string }[]>;
  techWords: Record<string, { techAdj: VesselEntry[]; techNoun: VesselEntry[] }>;
  hybrids: { share: { inSpan: number; outOfSpan: number }; shapes: { p: string; w: number }[] };
  functions: Record<VesselModule, { any: string; list: VesselFunction[] }>;
  roles: string[];
  roleWeights: Record<VesselModule, Record<string, Record<string, number>>>;
  roleExtras: { module: VesselModule; function: string; role: string; w: number; k: string }[];
  lists: Record<string, VesselEntry[]>;
  listTones: Record<string, GroupTone[]>;
  shapes: VesselShape[];
  styles: VesselStyle[];
  styleShare: { default: number; general: number; poolMultiplier: number };
  space: Record<"station" | "colony", { p: string; w: number }[]>;
  personLabels: Record<string, string>;
  prefixes: {
    real: { p: string; cultures?: string[]; fn: string[]; k: string; x?: number }[];
    sf: Record<string, string[]>;
  };
  safeguards: {
    block: string[];
    blockSpacecraft: string[];
    blockUnless: { w: string; culture: string; k: string }[];
    blockPrefixed: string[];
    blockPrefixes: string[];
    flag: string[];
    flagListBlocks: boolean;
    banned: string[];
    divine: string[];
    divinePhrases: string[];
    sensitiveLists: string[];
  };
}

export const VESSEL_DATA = vesselData as unknown as VesselData;
export const VESSEL_CULTURES = VESSEL_DATA.cultures;
export const VESSEL_MODULE_LABELS = VESSEL_DATA.modules;

export function findVesselCulture(key: string | undefined): VesselCulture | undefined {
  return VESSEL_CULTURES.find((c) => c.key === key);
}

// ── Technology (§4) ─────────────────────────────────────────────────────────

const levelNumber = (code: string) => parseInt(code.slice(1), 10);

/** A "T2-T5" or "T7" range as numbers. */
function range(k: string): [number, number] {
  const [lo, hi] = k.split("-");
  return [levelNumber(lo), levelNumber(hi ?? lo)];
}

/** Whether a level falls in a `k` range (untagged is every level). */
export function inRange(k: string | undefined, level: string): boolean {
  if (!k) return true;
  if (k.charAt(0) !== level.charAt(0)) return false;
  const [lo, hi] = range(k);
  const n = levelNumber(level);
  return n >= lo && n <= hi;
}

/** §4.2: a culture's native ship levels. */
export function spanLevels(culture: VesselCulture): string[] {
  const [lo, hi] = range(culture.span);
  const out: string[] = [];
  for (let n = lo; n <= hi; n++) out.push(`T${n}`);
  return out;
}

/** §4.3: the level whose customs a culture follows at L: its nearest span level; for spacecraft, its highest. */
export function customsLevel(culture: VesselCulture, level: string): string {
  const [lo, hi] = range(culture.span);
  if (level.startsWith("S")) return `T${hi}`;
  return `T${Math.min(hi, Math.max(lo, levelNumber(level)))}`;
}

export function inSpan(culture: VesselCulture, level: string): boolean {
  return level.startsWith("T") && inRange(culture.span, level);
}

export function techLabel(module: VesselModule, code: string): string {
  return VESSEL_DATA.technology[module].find((t) => t.code === code)?.label ?? code;
}

/** §2.2: the levels the technology link offers: spacecraft in modern settings have rocket age only. */
export function techChoices(module: VesselModule, setting: GroupSetting): string[] {
  const all = VESSEL_DATA.technology[module].map((t) => t.code);
  return module === "spacecraft" && setting !== "SF" ? ["S1"] : all;
}

/** §2.2: the levels "any" draws from: the culture's span for ships; the setting's levels for spacecraft. */
export function anyLevels(module: VesselModule, culture: VesselCulture, setting: GroupSetting): string[] {
  return module === "ships" ? spanLevels(culture) : techChoices(module, setting);
}

// ── Functions (§6) ──────────────────────────────────────────────────────────

export function moduleFunctions(module: VesselModule): VesselFunction[] {
  return VESSEL_DATA.functions[module].list;
}

export function functionAny(module: VesselModule): string {
  return VESSEL_DATA.functions[module].any;
}

/** §6.2: whether a function can be drawn at a level for a culture. */
export function functionAvailableAt(fn: VesselFunction, culture: VesselCulture, level: string): boolean {
  if (fn.noSensitive && culture.sensitive) return false;
  if (!fn.min) return true;
  return level.charAt(0) === fn.min.charAt(0) && levelNumber(level) >= levelNumber(fn.min);
}

/** §2.2: the functions offered for a culture and technology ("any": at some level it draws from). */
export function availableFunctions(module: VesselModule, cultureKey: string, technology: string, setting: GroupSetting): VesselFunction[] {
  const culture = findVesselCulture(cultureKey) ?? VESSEL_CULTURES[0];
  const levels = technology === "any" ? anyLevels(module, culture, setting) : [technology];
  return moduleFunctions(module).filter((f) => levels.some((l) => functionAvailableAt(f, culture, l)));
}

// ── Options and results ─────────────────────────────────────────────────────

export interface VesselOptions {
  module: VesselModule;
  culture?: string;
  /** A function key; undefined is Any. */
  function?: string;
  /** A level code, or "any" (the default). */
  technology?: string;
  genre?: GroupGenre;
  fantastic?: boolean;
  /** A style key; undefined or "none" is no style. */
  style?: string;
  tone?: GroupToneChoice;
  prefixes?: boolean;
  people?: GroupPeople;
  /** TS §3: one class instead of separate names; needs a function. */
  series?: boolean;
  count: number;
  seed?: number;
  /** §14.5: merged safeguard lists; the built-in lists when absent. */
  safeguards?: GroupSafeguards;
  /** Tests: only this role shape (its pattern) on the role route. */
  shape?: string;
}

export type VesselRoute = "style" | "hybrid" | "role";

export interface VesselName {
  /** The name with its prefix. */
  text: string;
  /** The name without its prefix. */
  name: string;
  prefix?: string;
  route: VesselRoute;
  /** The role (role route), "hybrid" or the style key. */
  role: string;
  shape: string;
  function: string;
  level: string;
  customs: string;
  tones: GroupTone[];
  /** Every list word drawn, with its list (tests). */
  words: { list: string; word: string }[];
  series?: { anchor: string | null; value: string | null; counter: string | null };
}

export interface VesselBatch {
  names: VesselName[];
  seed: number;
  notices: string[];
  seriesTone?: GroupToneChoice;
}

// ── Drawing ─────────────────────────────────────────────────────────────────

interface Ctx {
  rng: () => number;
  module: VesselModule;
  setting: GroupSetting;
  culture: VesselCulture;
  mode: GroupPeople;
  tone: GroupToneChoice;
  /** The chosen technology level and the level its customs come from (§4.3). */
  level: string;
  customs: string;
  fn: string;
  style?: VesselStyle;
  /** §10.2: on the culture routes with a style, its pools join the shared lists. */
  boost: boolean;
  /** §14.4: sensitive cultures' poetic names are kept from styles and light or grim hybrids. */
  poeticAllowed: boolean;
  drawn: Set<GroupTone>;
  words: { list: string; word: string }[];
  pools: Map<string, [{ w: string; t: GroupTone[] }, number][]>;
}

const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];

/** Lists that come from group-names.json (§8.1), with their setting tags and tones. */
const GN_LISTS = new Set(["colour", "number", "ordinalWord", "greek", "land", "spaceLand", "compass", "star", "brandRoot", "surname", "weapon", "tech", "beast"]);
/** §10.3: every style's pools by name (the colony shapes of §11.2 draw on the colony style's). */
const STYLE_POOLS = new Map(VESSEL_DATA.styles.flatMap((st) => Object.entries(st.pools)));
/** Lists only some cultures have (§8.3); empty elsewhere. */
const CULTURE_ONLY = new Set(["poetic", "menaceExtra"]);
/** GN §8.2 / TS §2.5: never tone-weighted. */
const UNTONED = new Set(["surname"]);

/** §3.3: a culture's flavour animals. */
const ANIMALS = new Map<string, string[]>();
export function flavourAnimals(culture: VesselCulture): string[] {
  let found = ANIMALS.get(culture.key);
  if (found) return found;
  const f = culture.flavour;
  if (!f) found = [];
  else if (Array.isArray(f)) found = f;
  else if ("world" in f) found = worldAnimals(f.world);
  else found = [...(findTradition(f.tribal)?.flavour.animals ?? [])];
  ANIMALS.set(culture.key, found);
  return found;
}

/** §8.1 `seaLand`: the tradition's land and water words. */
function landWords(culture: VesselCulture): string[] {
  const f = culture.flavour;
  if (f && !Array.isArray(f) && "tribal" in f) {
    const t = findTradition(f.tribal);
    return [...(t?.flavour.land ?? []), ...(t?.flavour.water ?? [])];
  }
  if (f && !Array.isArray(f) && "world" in f) return cultureLand(f.world);
  return [];
}

/** §8.4: the god names for a culture's god shapes. */
function godWords(culture: VesselCulture): VesselEntry[] {
  const gods = culture.gods;
  if (!gods) return [];
  if (gods.list) return gods.list;
  const world = WORLD_CULTURES.find((c) => c.id === gods.world);
  return (world?.lists.god ?? []).map((w) => ({ w: stripPlural(w) }));
}

/** §8.4: the holy type at the customs level (Roman and Greek gods at T2, christian after). */
function holyType(ctx: Ctx): HolyType {
  const c = ctx.culture;
  if (c.gods?.k) return inRange(c.gods.k, ctx.customs) ? "gods" : c.holy;
  return c.holy;
}

/** The words a list offers here: §8.1 shared, a culture's own (§8.3), GN lists, style pools; `k`, tone. */
function pool(ctx: Ctx, name: string): [{ w: string; t: GroupTone[] }, number][] {
  const key = `${name}|${ctx.customs}|${ctx.level}|${ctx.boost}|${ctx.tone}`;
  const cached = ctx.pools.get(key);
  if (cached) return cached;
  const weights = new Map<string, { w: number; t: GroupTone[] }>();
  const add = (word: string, w: number, t: GroupTone[]) => {
    const prev = weights.get(word);
    if (prev) prev.w += w;
    else weights.set(word, { w, t });
  };
  const addEntries = (list: string, entries: VesselEntry[] | undefined, mult = 1) => {
    for (const e of entries ?? []) {
      if (!inRange(e.k, ctx.customs)) continue;
      add(e.w, (e.x ?? 1) * mult, e.t ?? VESSEL_DATA.listTones[list] ?? []);
    }
  };
  const own = ctx.culture.lists ?? {};
  const space = ctx.module === "spacecraft";
  if (name === "techAdj" || name === "techNoun") {
    // §9: hybrids use the chosen level's words, not the customs level's.
    for (const e of VESSEL_DATA.techWords[ctx.level]?.[name] ?? []) add(e.w, e.x ?? 1, e.t ?? []);
  } else if (name === "god") {
    addEntries(name, godWords(ctx.culture));
  } else if (name === "beast") {
    for (const [w, n] of groupListWords("beast", ctx.setting)) add(w, n, wordTones("beast", w));
    for (const w of flavourAnimals(ctx.culture)) {
      const prev = weights.get(w);
      if (prev) prev.w *= 3;
      else add(w, 3, []);
    }
    addEntries("beast", own.beastExtra);
  } else if (name === "seaLand" && space) {
    // §11.3: spacecraft read spaceLand.
    for (const [w, n] of groupListWords("spaceLand", "SF")) add(w, n, wordTones("spaceLand", w));
  } else if (name === "seaLand") {
    addEntries(name, VESSEL_DATA.lists.seaLand);
    for (const w of landWords(ctx.culture)) add(stripPlural(w), 2, []);
  } else if (name === "seaAdj" && space) {
    addEntries(name, VESSEL_DATA.lists.spaceSeaAdj);
  } else if (name === "designationWord" && space) {
    addEntries(name, VESSEL_DATA.lists.spaceDesignationWord);
  } else if (name === "numberWord") {
    for (const [w, n] of groupListWords("number", ctx.setting)) add(w, n, wordTones("number", w));
  } else if (own[name]) {
    addEntries(name, own[name]);
  } else if (VESSEL_DATA.lists[name]) {
    addEntries(name, VESSEL_DATA.lists[name]);
  } else if (GN_LISTS.has(name)) {
    for (const [w, n] of groupListWords(name, ctx.setting)) add(w, n, wordTones(name, w));
  } else if (name === "name" && ctx.style) {
    addEntries(name, ctx.style.name);
  } else if (name === "colonyName") {
    // §11.2: the colony style's whole names.
    addEntries(name, VESSEL_DATA.styles.find((st) => st.key === "colony")?.name);
  } else if (STYLE_POOLS.has(name)) {
    addEntries(name, (ctx.style?.pools[name] ?? STYLE_POOLS.get(name))!);
  } else if (!CULTURE_ONLY.has(name)) {
    throw new Error(`Vessels: no list “${name}”.`);
  }
  // §10.2: the style's *Adj pools join virtueAdj and skyAdj, its *Noun pools virtue and sky, at ×3.
  if (ctx.boost && ctx.style) {
    const suffix = name === "virtueAdj" || name === "skyAdj" ? "Adj" : name === "virtue" || name === "sky" ? "Noun" : undefined;
    if (suffix) {
      for (const [pool, entries] of Object.entries(ctx.style.pools)) {
        if (!new RegExp(`${suffix}\\d*$`).test(pool)) continue;
        for (const e of entries) add(e.w, VESSEL_DATA.styleShare.poolMultiplier, ctx.style.tone ? [ctx.style.tone] : []);
      }
    }
  }
  const tone = !UNTONED.has(name) && ctx.tone !== "any";
  const out = [...weights]
    .map(([w, { w: n, t }]): [{ w: string; t: GroupTone[] }, number] => [{ w, t }, tone ? n * toneFactor(t, ctx.tone) : n])
    .filter(([, n]) => n > 0);
  ctx.pools.set(key, out);
  return out;
}

/** A word from a list, its tones noted; words holding tokens (`Pearl of {town}`) are rendered. */
function listWord(ctx: Ctx, name: string, filter?: (w: string) => boolean): string | undefined {
  const items = filter ? pool(ctx, name).filter(([e]) => filter(e.w)) : pool(ctx, name);
  const pick = pickWeighted(items, ctx.rng);
  if (!pick) return undefined;
  for (const t of pick.t) ctx.drawn.add(t);
  ctx.words.push({ list: name, word: pick.w });
  return pick.w.includes("{") ? renderPattern(ctx, pick.w) : pick.w;
}

/** §12.2: an invented place; spacecraft in SF use the GN §8.4 SF row. */
function town(ctx: Ctx): string | undefined {
  const rng = ctx.rng;
  if (ctx.module === "spacecraft" && ctx.setting === "SF") return groupTown("SF", undefined, rng);
  const source = ctx.culture.town === "compound" ? undefined : ctx.culture.town;
  // Ships in sci-fi keep their culture's places.
  const setting = ctx.setting === "SF" ? "MR" : ctx.setting;
  // §14.3: no deity or saint names in the no-gods cultures' places (bynames' rule).
  const holy = holyNamesIn(ctx.culture.key);
  for (let i = 0; i < 20; i++) {
    const t = groupTown(setting, source, rng);
    if (!holy || !holy.test(t)) return t;
  }
  return undefined;
}

/** §8.2: `{person}`'s label by function. */
const personLabel = (ctx: Ctx) => VESSEL_DATA.personLabels[ctx.fn] ?? "owner";

function inventedPerson(ctx: Ctx): string | undefined {
  return groupPerson(ctx.setting, !!ctx.culture.surnames, ctx.rng, flavourAnimals(ctx.culture));
}

const POETIC_SHORT = (w: string) => w.split(" ").length <= 5 && !/^(The|We|Where) /.test(w);

/** One token (§8, §9, §12). */
function token(ctx: Ctx, name: string): string | undefined {
  if (name.includes("+")) {
    // §13: closed compounds, the second part lower case ({wAdj+wake}: Stonewake).
    const [a, b] = name.split("+");
    const first = token(ctx, a);
    const second = VESSEL_DATA.lists[b] || STYLE_POOLS.has(b) ? token(ctx, b) : b;
    return first && second ? first + second.toLowerCase() : undefined;
  }
  return baseToken(ctx, name);
}

const withMod = (text: string, mod: string | undefined) => (mod === "poss" ? groupPossessive(text, false) : text);

function baseToken(ctx: Ctx, name: string): string | undefined {
  const rng = ctx.rng;
  const placeholders = ctx.mode === "placeholders";
  switch (name) {
    case "town":
      return placeholders ? "[place]" : town(ctx);
    case "surname":
      return placeholders ? "[surname]" : listWord(ctx, "surname");
    case "womanName":
      return placeholders ? "[woman's name]" : listWord(ctx, "womanName");
    case "person":
      return placeholders ? `[${personLabel(ctx)}]` : inventedPerson(ctx);
    case "president":
      return placeholders ? "[president]" : inventedPerson(ctx);
    case "scientist":
      return placeholders ? "[scientist]" : inventedPerson(ctx);
    case "holy":
      return placeholders ? "[holy person]" : groupSaint(ctx.setting, rng);
    case "n":
      return String(1 + Math.floor(rng() * 99));
    case "ordinal": {
      const choices: [number, number][] = [];
      for (let n = 1; n <= 99; n++) choices.push([n, n <= 12 ? 3 : n <= 30 ? 1 : 0.2]);
      return ordinalText(pickWeighted(choices, rng)!);
    }
    case "poetic":
      return ctx.poeticAllowed ? listWord(ctx, "poetic") : undefined;
    case "poeticShort":
      return ctx.poeticAllowed ? listWord(ctx, "poetic", POETIC_SHORT) : undefined;
    case "cultureNoun": {
      // §9.3: a word from the culture's beast, sky or virtue list, or a whole poetic name.
      const sources = ["beast", "sky", "virtue", ...(ctx.poeticAllowed && pool(ctx, "poetic").length > 0 ? ["poetic"] : [])];
      return listWord(ctx, pickOne(sources, rng));
    }
  }
  return listWord(ctx, name);
}

/** TS §3: a top-level token as drawn. */
interface Drawn {
  name: string;
  text: string;
}

/** TS §3: values held fixed in a class (by token position, or for the anchor's token), and the record. */
interface Hooks {
  byIndex?: Map<number, Drawn>;
  byName?: Drawn;
  record?: Drawn[];
}

/** Renders a pattern's tokens; undefined when one has nothing to offer. */
function renderPattern(ctx: Ctx, pattern: string, hooks?: Hooks): string | undefined {
  let failed = false;
  let index = -1;
  let nameUsed = false;
  const out = pattern.replace(/\{([^}]+)\}/g, (_m, raw: string, at: number) => {
    if (failed) return "";
    index++;
    const [name, mod] = raw.split(":");
    let piece: string | undefined;
    const fixed = hooks?.byIndex?.get(index);
    if (fixed) piece = fixed.text;
    else if (hooks?.byName && !nameUsed && hooks.byName.name === name) {
      piece = hooks.byName.text;
      nameUsed = true;
    } else piece = token(ctx, name);
    // "Star of the West", as §8.2's example has it: the compass word's noun after "of the".
    if (piece && name === "compass" && pattern.slice(0, at).endsWith("of the ")) piece = piece.replace(/ern$/, "");
    if (piece === undefined || piece === "") {
      failed = true;
      return "";
    }
    hooks?.record?.push({ name, text: piece });
    return withMod(piece, mod);
  });
  return failed ? undefined : out;
}

// ── Rendering (§13) ─────────────────────────────────────────────────────────

const SMALL = new Set([
  "of", "the", "and", "for", "in", "at", "by", "on", "to", "from", "over", "upon", "beyond", "beneath", "among", "across", "through",
  "between", "above", "into", "with", "before",
]);

/** §13: every word capitalised but the small words; a leading "The" is capitalised (ship names stand alone). */
export function vesselCapitals(text: string): string {
  return text
    .split(" ")
    .map((word, i) => {
      if (!word || word.startsWith("[")) return word;
      const lower = word.toLowerCase();
      if (SMALL.has(lower) && i > 0) return lower;
      return word.replace(/(^|[-–])([a-z])/g, (_m, sep: string, c: string) => sep + c.toUpperCase());
    })
    .join(" ");
}

/** §5, GN §11.2: content words, a leading "The" and the small words not counted. */
const countedWords = (text: string) => text.split(" ").filter((w, i) => w && !(i === 0 && w === "The") && !SMALL.has(w.toLowerCase()));

// ── Safeguards (§14) ────────────────────────────────────────────────────────

const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const BANNED = [...VESSEL_DATA.safeguards.banned, ...VESSEL_DATA.safeguards.divine].map(wordRe);
const DIVINE_PHRASES = VESSEL_DATA.safeguards.divinePhrases.map(wordRe);

/** §14.3: banned words (GN and vessel lists), living religions' divine names and phrases. */
export function breaksVesselWords(text: string): boolean {
  return hasBannedWord(text) || BANNED.some((re) => re.test(text)) || DIVINE_PHRASES.some((re) => re.test(text));
}

interface Guard {
  block: Set<string>;
  prefixed: Set<string>;
}

/** §14.1: the block lists for a module, merged with the safeguard packs' lists. */
function guardFor(module: VesselModule, guards: GroupSafeguards): Guard {
  const s = VESSEL_DATA.safeguards;
  const block = new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(normForBlock));
  if (module === "spacecraft") for (const w of s.blockSpacecraft) block.add(normForBlock(w));
  return { block, prefixed: new Set(s.blockPrefixed.map(normForBlock)) };
}

function blocked(ctx: Ctx, guard: Guard, name: string, prefix?: string): boolean {
  const n = normForBlock(name);
  if (guard.block.has(n)) return true;
  for (const u of VESSEL_DATA.safeguards.blockUnless) {
    if (n === normForBlock(u.w) && !(ctx.culture.key === u.culture && inRange(u.k, ctx.customs))) return true;
  }
  if (prefix && (guard.prefixed.has(normForBlock(`${prefix} ${name}`)) || VESSEL_DATA.safeguards.blockPrefixes.includes(prefix))) return true;
  return false;
}

/** §5, §13, §14: length, repetition and safeguards. */
function acceptable(ctx: Ctx, guard: Guard, name: string): boolean {
  const counted = countedWords(name);
  if (counted.length === 0 || counted.length > 8) return false;
  if (repeatsContent(counted)) return false;
  if (blocked(ctx, guard, name)) return false;
  if (breaksVesselWords(name)) return false;
  return true;
}

// ── Roles and shapes (§7, §8) ───────────────────────────────────────────────

const SENSITIVE_TOKENS = new RegExp(`\\{(${VESSEL_DATA.safeguards.sensitiveLists.join("|")})[}:]`);

/** TS §2.4: a shape's own tones plus the list tones of every list its tokens name. */
export function vesselShapeTones(p: string, own: GroupTone[] = []): GroupTone[] {
  const out = new Set<GroupTone>(own);
  for (const m of p.matchAll(/\{([^}:+]+)/g)) for (const t of VESSEL_DATA.listTones[m[1]] ?? []) out.add(t);
  return GROUP_TONES.filter((t) => out.has(t));
}

/** §7: the role weights for a function here; base × culture × techRoles at the customs level. */
function roleWeights(ctx: Ctx): [string, number][] {
  const c = ctx.culture;
  const base = { ...VESSEL_DATA.roleWeights[ctx.module][ctx.fn] };
  for (const e of VESSEL_DATA.roleExtras) {
    if (e.module === ctx.module && e.function === ctx.fn && inRange(e.k, ctx.customs)) base[e.role] = (base[e.role] ?? 0) + e.w;
  }
  // §11: stations and colony ships also draw on their own shapes, as a role beside the others.
  if (ctx.module === "spacecraft" && (ctx.fn === "station" || ctx.fn === "colony")) base[ctx.fn] = 100;
  const out: [string, number][] = [];
  for (const [role, w] of Object.entries(base)) {
    let n = w * (c.roles?.[role] ?? 1);
    for (const [k, mults] of Object.entries(c.techRoles ?? {})) if (inRange(k, ctx.customs)) n *= mults[role] ?? 1;
    if (role === "holy" && holyType(ctx) === "none") n = 0;
    // §14.4: no affection, menace or leisure names for the sensitive cultures; no poetic with a style.
    if (c.sensitive && ["affection", "menace", "leisure"].includes(role)) n = 0;
    if (role === "poetic" && !ctx.poeticAllowed) n = 0;
    if (n > 0) out.push([role, n]);
  }
  return out;
}

/** §8.2–§8.4: the live shapes for a role, weighted (k, setting, function, holy type, people, tone). */
function roleShapes(ctx: Ctx, role: string, only?: string): [VesselShape, number][] {
  const c = ctx.culture;
  const holy = holyType(ctx);
  const shapes: VesselShape[] = [...VESSEL_DATA.shapes.filter((s) => s.role === role), ...(c.shapes ?? []).filter((s) => s.role === role)];
  if (role === "station" || role === "colony") for (const sh of VESSEL_DATA.space[role]) shapes.push({ role, p: sh.p, w: sh.w });
  if (role === "holy" && holy === "gods") for (const g of c.gods?.shapes ?? []) shapes.push({ role, p: g.p, w: g.w });
  const out: [VesselShape, number][] = [];
  for (const shape of shapes) {
    if (only && shape.p !== only) continue;
    if (!inRange(shape.k, ctx.customs)) continue;
    if (shape.s && !shape.s.includes(ctx.setting)) continue;
    if (shape.fn && !shape.fn.includes(ctx.fn)) continue;
    let w = shape.w;
    if (shape.holy) {
      const saints = holy === "christian" && !c.noSaints;
      const ok =
        shape.holy === "saint" ? saints : shape.holy === "marian" ? saints && !!c.marian : shape.holy === "blessing" ? holy !== "none" : holy === "christian" || holy === "blessing";
      if (!ok) continue;
      if (shape.holy === "saint") w *= c.holyX ?? 1;
      if (shape.holy === "marian") w *= c.marian ?? 1;
    }
    if (shape.p.includes("{poetic}") && (!ctx.poeticAllowed || !(c.lists?.poetic?.length))) continue;
    // GN §8.3: invented women's names and surnames only where the culture has them.
    if (ctx.mode === "invented" && shape.p.includes("{womanName}") && !c.womanNames) continue;
    if (ctx.mode === "invented" && shape.p.includes("{surname}") && !c.surnames) continue;
    if (c.sensitive && SENSITIVE_TOKENS.test(shape.p)) continue;
    w *= toneFactor(vesselShapeTones(shape.p, shape.t), ctx.tone);
    if (w > 0) out.push([shape, w]);
  }
  return out;
}

/** §11.3: spacecraft name cities with "Pride of". */
const spacePattern = (ctx: Ctx, p: string) => (ctx.module === "spacecraft" ? p.replace(/^City of /, "Pride of ") : p);

/** A name's route, role and pattern: what a class holds fixed (TS §3). */
interface Plan {
  route: VesselRoute;
  role: string;
  p: string;
  tones: GroupTone[];
}

interface Built {
  name: string;
  plan: Plan;
  tones: GroupTone[];
  record: Drawn[];
}

function renderPlan(ctx: Ctx, plan: Plan, hooks: Hooks = {}): Built | undefined {
  ctx.drawn = new Set();
  ctx.words = [];
  const record: Drawn[] = [];
  const raw = renderPattern(ctx, plan.p, { ...hooks, record });
  if (!raw) return undefined;
  const name = vesselCapitals(raw.replace(/\s+/g, " ").trim());
  const tones = new Set<GroupTone>([...plan.tones, ...ctx.drawn]);
  return { name, plan, record, tones: GROUP_TONES.filter((t) => tones.has(t)) };
}

/** The role route's patterns (§7, §8; §11.3 in spacecraft). */
function rolePlans(ctx: Ctx, role: string, only?: string): [Plan, number][] {
  return roleShapes(ctx, role, only).map(([s, w]): [Plan, number] => [{ route: "role", role, p: spacePattern(ctx, s.p), tones: vesselShapeTones(s.p, s.t) }, w]);
}

/** §9.3: the hybrid patterns; `{techAdj} {poetic}` only with a short poetic name. */
function hybridPlans(ctx: Ctx): [Plan, number][] {
  const poetic = ctx.poeticAllowed && pool(ctx, "poetic").some(([e]) => POETIC_SHORT(e.w));
  return VESSEL_DATA.hybrids.shapes
    .filter((s) => poetic || !s.p.includes("{poetic}"))
    .map((s): [Plan, number] => [{ route: "hybrid", role: "hybrid", p: s.p.replace("{poetic}", "{poeticShort}"), tones: [] }, s.w]);
}

/** §10.3: the style's shapes, equal weights, its tone on each (§10.4); never a sensitive culture's light or grim lists. */
function stylePlans(ctx: Ctx): [Plan, number][] {
  const st = ctx.style!;
  const tones = st.tone ? [st.tone] : [];
  return st.shapes
    .filter((p) => !(ctx.culture.sensitive && SENSITIVE_TOKENS.test(p)))
    .map((p): [Plan, number] => [{ route: "style", role: st.key, p, tones: vesselShapeTones(p, tones) }, toneFactor(vesselShapeTones(p, tones), ctx.tone)])
    .filter(([, w]) => w > 0);
}

/** §10.1: the styles a module offers in a setting. */
export function availableStyles(module: VesselModule, setting: GroupSetting): VesselStyle[] {
  return VESSEL_DATA.styles.filter((st) => st.modules.includes(module) && st.settings.includes(setting));
}

/** §12.3: whether prefixes can show: the link is on in MR, MF and SF. */
export const prefixSetting = (setting: GroupSetting) => setting === "MR" || setting === "MF" || setting === "SF";

/** §12.3: the real-world prefix rows that apply to a name. */
function realPrefix(ctx: Ctx): string | undefined {
  const rows = VESSEL_DATA.prefixes.real.filter(
    (r) => (!r.cultures || r.cultures.includes(ctx.culture.key)) && r.fn.includes(ctx.fn) && inRange(r.k, ctx.level),
  );
  return pickWeighted(rows.map((r): [string, number] => [r.p, r.x ?? 1]), ctx.rng);
}

// ── Classes (TS §3) ─────────────────────────────────────────────────────────

/** Tokens that render as placeholders in placeholder mode, and tokens that are never anchors. */
const PLACEHOLDER_TOKENS = new Set(["town", "surname", "womanName", "person", "president", "scientist", "holy"]);
const NEVER_ANCHORS = new Set(["person", "president", "scientist", "holy"]);
const kindOf = (name: string) => (NEVER_ANCHORS.has(name) ? "never" : seriesTokenKind(name));

/** TS §3.4: a counter's values from its first, ascending. */
function* counterValues(ctx: Ctx, name: string, first: string): Generator<string> {
  if (name === "ordinal") {
    for (let n = parseInt(first, 10); n <= 99; n += counterGap(ctx.rng)) yield ordinalText(n);
    return;
  }
  const words = [...new Set(groupListWords(name, ctx.setting).map(([w]) => w))];
  for (let i = words.indexOf(first); i >= 0 && i < words.length; i += counterGap(ctx.rng)) yield words[i];
}

const lightOrGrim = (tone: GroupToneChoice) => tone === "light" || tone === "grim";

// ── Batches ─────────────────────────────────────────────────────────────────

/** §5: a batch of unique names. */
export function generateVesselNames(options: VesselOptions): VesselBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const module = options.module;
  const notices: string[] = [];
  const culture = findVesselCulture(options.culture) ?? VESSEL_CULTURES[0];
  const genre = options.genre ?? (module === "spacecraft" ? "scifi" : "fantasy");
  const setting = groupSetting(genre, genre === "scifi" ? false : !!options.fantastic);
  let tone = options.tone ?? "any";
  const levels = techChoices(module, setting);
  let technology = options.technology ?? "any";
  if (technology !== "any" && !levels.includes(technology)) {
    notices.push(`“${technology}” isn't available here; using any technology.`);
    technology = "any";
  }
  const functions = availableFunctions(module, culture.key, technology, setting);
  const chosenFn = options.function ? functions.find((f) => f.key === options.function) : undefined;
  if (options.function && !chosenFn) notices.push(`“${options.function}” isn't available here; using any function.`);
  let style = options.style && options.style !== "none" ? availableStyles(module, setting).find((st) => st.key === options.style) : undefined;
  if (options.style && options.style !== "none" && !style) notices.push(`Style “${options.style}” isn't available here.`);
  const guards = options.safeguards ?? { block: VESSEL_DATA.safeguards.block, flag: VESSEL_DATA.safeguards.flag, flagListBlocks: VESSEL_DATA.safeguards.flagListBlocks };
  const guard = guardFor(module, guards);
  const pools = new Map<string, [{ w: string; t: GroupTone[] }, number][]>();
  const count = Math.max(0, Math.floor(options.count));
  const prefixes = !!options.prefixes && prefixSetting(setting);
  // §12.3: in sci-fi, one prefix per function for the whole batch.
  const sfPrefixes = new Map<string, string | undefined>();
  const sfPrefix = (fn: string) => {
    if (!sfPrefixes.has(fn)) {
      const list = VESSEL_DATA.prefixes.sf[fn];
      sfPrefixes.set(fn, list ? pickOne(list, rng) : undefined);
    }
    return sfPrefixes.get(fn);
  };
  // §10.2: a style's share of names (General 85%); §14.4: oceanic never draws on a sensitive culture's lists.
  const styleShare = !style ? 0 : style.key === "oceanic" && culture.sensitive ? 1 : culture.key === "general" ? VESSEL_DATA.styleShare.general : VESSEL_DATA.styleShare.default;

  const newCtx = (level: string, fn: string): Ctx => ({
    rng,
    module,
    setting,
    culture,
    mode: options.people ?? "placeholders",
    tone,
    level,
    customs: customsLevel(culture, level),
    fn,
    style,
    boost: !!style,
    // §14.4: sensitive cultures' poetic names never go to a style or a light or grim name.
    poeticAllowed: !(culture.sensitive && (lightOrGrim(tone) || !!style)),
    drawn: new Set(),
    words: [],
    pools,
  });

  /** §5: the route and pattern for one draw. */
  const choosePlan = (ctx: Ctx): Plan | undefined => {
    if (style && !options.shape && rng() < styleShare) {
      ctx.boost = false;
      return pickWeighted(stylePlans(ctx), rng);
    }
    const role = pickWeighted(roleWeights(ctx), rng);
    if (!role) return undefined;
    // §9.1: designation and leisure names are never hybrids.
    const share = inSpan(culture, ctx.level) ? VESSEL_DATA.hybrids.share.inSpan : VESSEL_DATA.hybrids.share.outOfSpan;
    if (!options.shape && role !== "designation" && role !== "leisure" && rng() < share) return pickWeighted(hybridPlans(ctx), rng);
    return pickWeighted(rolePlans(ctx, role, options.shape), rng);
  };

  /** A finished, checked name with its prefix, or undefined. */
  const result = (ctx: Ctx, built: Built | undefined, series?: VesselName["series"]): VesselName | undefined => {
    if (!built || !acceptable(ctx, guard, built.name)) return undefined;
    let prefix: string | undefined;
    if (prefixes && !built.name.startsWith("The ")) prefix = setting === "SF" ? sfPrefix(ctx.fn) : module === "ships" ? realPrefix(ctx) : undefined;
    if (prefix && blocked(ctx, guard, built.name, prefix)) return undefined;
    return {
      text: prefix ? `${prefix} ${built.name}` : built.name,
      name: built.name,
      ...(prefix ? { prefix } : {}),
      route: built.plan.route,
      role: built.plan.role,
      shape: built.plan.p,
      function: ctx.fn,
      level: ctx.level,
      customs: ctx.customs,
      tones: built.tones,
      words: ctx.words,
      ...(series ? { series } : {}),
    };
  };

  // §2.2: "any" draws a level evenly from those it offers, keeping the chosen function possible.
  const levelPool = technology === "any" ? anyLevels(module, culture, setting).filter((l) => !chosenFn || functionAvailableAt(chosenFn, culture, l)) : [technology];
  const fnChoices = (level: string) => functions.filter((f) => functionAvailableAt(f, culture, level));

  /** One name: technology, function, route, role, shape (§5); undefined after the GN §4 failures. */
  const oneName = (): VesselName | undefined => {
    if (levelPool.length === 0) return undefined;
    for (let round = 0; round < 2; round++) {
      const level = pickOne(levelPool, rng);
      const fn = chosenFn ?? pickWeighted(fnChoices(level).map((f): [VesselFunction, number] => [f, f.w]), rng);
      if (!fn) continue;
      for (let i = 0; i < 20; i++) {
        const ctx = newCtx(level, fn.key);
        const plan = choosePlan(ctx);
        if (!plan) break;
        const name = result(ctx, renderPlan(ctx, plan));
        if (name) return name;
      }
    }
    return undefined;
  };

  const seen = new Set<string>();
  const names: VesselName[] = [];
  const add = (name: VesselName | undefined): boolean => {
    if (!name) return false;
    const key = name.text.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    names.push(name);
    return true;
  };

  if (options.series && chosenFn && levelPool.length > 0) {
    const seriesTone = drawClass();
    if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
    return { names, seed, notices, seriesTone };
  }
  if (options.series && !chosenFn) notices.push("A class needs a function.");

  for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) add(oneName());
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
  return { names, seed, notices };

  /** TS §3: one class: one technology, route and shape; a counter counts, or an anchor holds while the rest vary. */
  function drawClass(): GroupToneChoice {
    const level = pickOne(levelPool, rng);
    const fn = chosenFn!.key;
    const placeholders = (options.people ?? "placeholders") === "placeholders";
    const isPlaceholder = (d: Drawn) => placeholders && PLACEHOLDER_TOKENS.has(d.name);
    let first: { ctx: Ctx; built: Built; name: VesselName } | undefined;
    for (let i = 0; i < 40 && !first; i++) {
      const ctx = newCtx(level, fn);
      const plan = choosePlan(ctx);
      if (!plan) continue;
      const built = renderPlan(ctx, plan);
      const name = result(ctx, built);
      if (!built || !name) continue;
      // TS §3.3 step 3: redraw a shape where nothing could vary.
      if (!built.record.some((d) => kindOf(d.name) === "counter") && !built.record.some((d) => !isPlaceholder(d))) continue;
      first = { ctx, built, name };
    }
    if (!first) return tone;
    // TS §3.3 step 2: with tone Any, the first shape's first tone holds for the class.
    if (tone === "any") tone = first.built.plan.tones[0] ?? "any";
    const plan = first.built.plan;
    const rec = first.built.record;
    const draw = (hooks: Hooks, p = plan) => {
      const ctx = newCtx(level, fn);
      if (p.route === "style") ctx.boost = false;
      return result(ctx, renderPlan(ctx, p, hooks), info);
    };
    const counterAt = rec.findIndex((d) => kindOf(d.name) === "counter");
    let info: VesselName["series"];
    if (counterAt >= 0) {
      info = { anchor: null, value: null, counter: rec[counterAt].name };
      add({ ...first.name, series: info });
      const locked = new Map(rec.map((d, i) => [i, d] as const));
      let firstValue = true;
      for (const value of counterValues(first.ctx, rec[counterAt].name, rec[counterAt].text)) {
        if (names.length >= count) break;
        if (firstValue) {
          firstValue = false;
          continue;
        }
        locked.set(counterAt, { name: rec[counterAt].name, text: value });
        add(draw({ byIndex: new Map(locked) }));
      }
      return tone;
    }
    // TS §3.3 step 4: the first owner token that isn't a placeholder, else the first of two or more list tokens.
    let anchorAt = rec.findIndex((d) => kindOf(d.name) === "owner" && !isPlaceholder(d));
    const listAt = rec.map((d, i) => (kindOf(d.name) === "list" && !isPlaceholder(d) ? i : -1)).filter((i) => i >= 0);
    if (anchorAt < 0 && listAt.length >= 2) anchorAt = listAt[0];
    const anchor = anchorAt >= 0 ? rec[anchorAt] : undefined;
    info = { anchor: anchor?.name ?? null, value: anchor?.text ?? null, counter: null };
    const hold = new Map<number, Drawn>();
    if (anchor) hold.set(anchorAt, anchor);
    else if (listAt.length === 1) rec.forEach((d, i) => i !== listAt[0] && hold.set(i, d));
    add({ ...first.name, series: info });
    const fill = (next: () => VesselName | undefined) => {
      for (let idle = 0; idle < 20 && names.length < count; ) idle = add(next()) ? 0 : idle + 1;
    };
    fill(() => draw({ byIndex: hold }));
    if (!anchor || names.length >= count) return tone;
    // TS §3.5: top up from the route's other shapes with the anchor's token.
    const ctx = newCtx(level, fn);
    const others = (plan.route === "style" ? stylePlans(ctx) : plan.route === "hybrid" ? hybridPlans(ctx) : rolePlans(ctx, plan.role)).filter(
      ([p]) => p.p !== plan.p && [...p.p.matchAll(/\{([^}:]+)/g)].some((m) => m[1] === anchor.name),
    );
    if (others.length === 0) return tone;
    fill(() => draw({ byName: anchor }, pickWeighted(others, rng)!));
    return tone;
  }
}

/** §1.2: "ships and boats · historic or low fantasy · Hawaiian · steam and iron". */
export function vesselHistoryLabel(module: VesselModule, genre: GroupGenre, fantastic: boolean, culture: string, technology: string): string {
  const label = findVesselCulture(culture)?.label ?? "General";
  return [VESSEL_MODULE_LABELS[module], SETTING_PHRASES[groupSetting(genre, fantastic)], label, technology === "any" ? "any technology" : techLabel(module, technology)].join(
    " · ",
  );
}
