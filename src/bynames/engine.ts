// Bynames and titles (Bynames brief, docs/bynames-and-titles-brief.md): epithets, titles and family
// names for twenty cultures, built from shapes and lists. Reuses the group engine's weighted draws,
// setting tags, tone factor, invented places and safeguards. No Obsidian imports.

import bynamesData from "../data/bynames.json";
import {
  type GroupGenre,
  type GroupSafeguards,
  type GroupSetting,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  groupListWords,
  groupSetting,
  groupTown,
  hasBannedWord,
  normForBlock,
  pickWeighted,
  prefixedLand,
  SETTING_PHRASES,
  toneFactor,
} from "../groups/engine";
import { mulberry32 } from "../markov";
import { WORLD_CULTURES } from "../world/engine";

// ── Data ────────────────────────────────────────────────────────────────────

export type BynameModule = "epithets" | "titles" | "familyNames";
export type BynameLanguage = "english" | "native" | "mixed";
export type BynameGender = "men" | "women" | "anyone";
export type BynameSource = "placeholder" | "pack" | "none";
export type BynameLength = "single" | "full";
type Sex = "male" | "female";

/** A list entry: `w` (one form), or `m`/`f` (a gender pair; null is "—"); `n` or `nm`/`nf` native. */
export interface BynameEntry {
  w?: string;
  m?: string | null;
  f?: string | null;
  n?: string;
  nm?: string | null;
  nf?: string | null;
  x?: number;
  s?: GroupSetting[];
  t?: GroupTone[];
  g?: "m" | "f";
  pos?: "after";
  /** Body-and-mind: drawn only when the tone is light or grim (§5.2, §8). */
  bm?: boolean;
  /** Culture multipliers (Steppe ×5 for steppe). */
  cx?: Record<string, number>;
}

interface Kind {
  key: string;
  menu: string;
  plural: string;
  w?: number;
  s?: GroupSetting[];
  cultures?: string[];
  t?: GroupTone[];
}

interface Shape {
  kind: string;
  p: string;
  w: number;
  join?: "the" | "of" | "bare" | "comma";
  s?: GroupSetting[];
  t?: GroupTone[];
  gate?: boolean;
}

interface Form {
  p: string;
  l: "e" | "n" | "both";
  g?: "m" | "f";
  w: number;
  t?: GroupTone[];
}

interface BynamesData {
  cultures: { key: string; label: string; guide?: string }[];
  cultureAnimals: Record<string, string[]>;
  familyFirst: string[];
  clanBornSuffixes: string[];
  clanStyleSuffixes: string[];
  ranks: Record<string, BynameEntry[]>;
  styles: Record<string, BynameEntry[]>;
  lists: Record<string, BynameEntry[]>;
  epithets: { any: string; kinds: Kind[]; shapes: Shape[] };
  titles: { any: string; kinds: Kind[]; shapes: Shape[]; nativeOf: Record<string, string> };
  family: { any: string; kinds: Kind[]; cultures: Record<string, { w: Record<string, number>; forms: Record<string, Form[]> }> };
  safeguards: {
    block: string[];
    blockPatterns: string[];
    flag: string[];
    flagListBlocks: boolean;
    banned: string[];
    bannedEpithets: string[];
    sacred: string[];
    noGods: string[];
    casteWords: string[];
  };
}

export const BYNAMES_DATA = bynamesData as unknown as BynamesData;

/** §4.1: the twenty cultures, General first. */
export const BYNAME_CULTURES = BYNAMES_DATA.cultures.map((c) => {
  const world = WORLD_CULTURES.find((w) => w.id === c.key);
  return { key: c.key, label: c.label, guide: c.guide ?? world?.guide ?? "" };
});

export const BYNAME_MODULE_LABELS: Record<BynameModule, string> = {
  epithets: "epithets and bynames",
  titles: "titles and honorifics",
  familyNames: "family names",
};

/** §2.2: the module's "any" phrase. */
export function moduleAny(module: BynameModule): string {
  return module === "epithets" ? BYNAMES_DATA.epithets.any : module === "titles" ? BYNAMES_DATA.titles.any : BYNAMES_DATA.family.any;
}

export function moduleKinds(module: BynameModule): Kind[] {
  return module === "epithets" ? BYNAMES_DATA.epithets.kinds : module === "titles" ? BYNAMES_DATA.titles.kinds : BYNAMES_DATA.family.kinds;
}

/** The kinds a module offers for a culture and setting, with their weights (§5.1, §6.1, §7.1). */
export function availableKinds(module: BynameModule, culture: string, setting: GroupSetting): { kind: Kind; weight: number }[] {
  const kinds = moduleKinds(module).filter((k) => (!k.s || k.s.includes(setting)) && (!k.cultures || k.cultures.includes(culture)));
  if (module === "familyNames") {
    const system = BYNAMES_DATA.family.cultures[culture];
    return kinds.filter((k) => system?.w[k.key]).map((kind) => ({ kind, weight: system.w[kind.key] }));
  }
  const shapes = module === "epithets" ? BYNAMES_DATA.epithets.shapes : BYNAMES_DATA.titles.shapes;
  return kinds.filter((k) => shapes.some((s) => s.kind === k.key && (!s.s || s.s.includes(setting)))).map((kind) => ({ kind, weight: kind.w ?? 1 }));
}

/** §2.2: whether the language link shows (titles and family names with a culture; epithets only for Aztec). */
export function showsLanguage(module: BynameModule, culture: string): boolean {
  if (culture === "general") return false;
  return module !== "epithets" || culture === "aztec";
}

// ── Options and results ─────────────────────────────────────────────────────

/** Who a drawn name belongs to: the person, or a parent or child in a family name (§3.1). */
export type NameRole = "self" | "father" | "mother" | "child";

export interface BynameOptions {
  module: BynameModule;
  culture?: string;
  /** A kind key of the module; undefined is Any. */
  kind?: string;
  genre?: GroupGenre;
  fantastic?: boolean;
  tone?: GroupToneChoice;
  language?: BynameLanguage;
  gender?: BynameGender;
  length?: BynameLength;
  source?: BynameSource;
  /** §2.4: draws a name from the chosen pack, or null; only used with source "pack". */
  draw?: (role: NameRole, sex: Sex, rng: () => number) => string | null;
  /** The pack's name, for the notice when it gives nothing. */
  packName?: string;
  count: number;
  seed?: number;
  /** §11.7: merged safeguard lists; the built-in lists when absent. */
  safeguards?: GroupSafeguards;
}

export interface BynameResult {
  text: string;
  module: BynameModule;
  culture: string;
  kind: string;
  shape: string;
  gender: Sex;
  language: "english" | "native";
  tones: GroupTone[];
}

export interface BynameBatch {
  names: BynameResult[];
  seed: number;
  notices: string[];
}

// ── Drawing ─────────────────────────────────────────────────────────────────

interface Ctx {
  rng: () => number;
  setting: GroupSetting;
  culture: string;
  tone: GroupToneChoice;
  sex: Sex;
  native: boolean;
  drawn: Set<GroupTone>;
  source: BynameSource;
  draw?: BynameOptions["draw"];
  packFailed: boolean;
  /** The last rank drawn: its position and whether it came out native (§10.2, §10.4). */
  rankAfter: boolean;
  rankNative: boolean;
}

const lightOrGrim = (tone: GroupToneChoice) => tone === "light" || tone === "grim";

/** The entry's form for this sex and language; undefined when it isn't drawn (§3, §6.2). */
export function entryForm(e: BynameEntry, sex: Sex, native: boolean): { text: string; native: boolean } | undefined {
  if (e.g && e.g !== (sex === "male" ? "m" : "f")) return undefined;
  if (native) {
    if ("nm" in e || "nf" in e) {
      // A missing gender form falls back to the shared native form; null is "—" (not drawn).
      const v = sex === "male" ? (e.nm !== undefined ? e.nm : e.n) : e.nf !== undefined ? e.nf : e.n;
      return v ? { text: v, native: true } : undefined;
    }
    if (e.n !== undefined) return { text: e.n, native: true };
  }
  if ("m" in e || "f" in e) {
    const v = sex === "male" ? e.m : e.f;
    return v ? { text: v, native: false } : undefined;
  }
  return e.w !== undefined ? { text: e.w, native: false } : undefined;
}

/** One weighted entry from a list, its tones noted; setting, gender, gating, culture and tone applied. */
function drawEntries(ctx: Ctx, entries: BynameEntry[], opts: { nativeOnly?: boolean; englishOnly?: boolean } = {}): { text: string; entry: BynameEntry; native: boolean } | undefined {
  const live: [{ text: string; entry: BynameEntry; native: boolean }, number][] = [];
  for (const e of entries) {
    if (e.s && !e.s.includes(ctx.setting)) continue;
    if (e.bm && !lightOrGrim(ctx.tone)) continue;
    const form = entryForm(e, ctx.sex, opts.englishOnly ? false : ctx.native || !!opts.nativeOnly);
    if (!form) continue;
    if (opts.nativeOnly && !form.native) continue;
    const w = (e.x ?? 1) * (e.cx?.[ctx.culture] ?? 1) * toneFactor(e.t ?? [], ctx.tone);
    if (w > 0) live.push([{ ...form, entry: e }, w]);
  }
  const pick = pickWeighted(live, ctx.rng);
  if (pick) for (const t of pick.entry.t ?? []) ctx.drawn.add(t);
  return pick;
}

export const stripPlural = (raw: string) => raw.split("|")[0].replace(/~$/, "");

/** §4.3: the culture's animals, ×3 in `beast`. */
export function cultureAnimals(culture: string): string[] {
  if (BYNAMES_DATA.cultureAnimals[culture]) return BYNAMES_DATA.cultureAnimals[culture];
  return worldAnimals(culture);
}

/** A world culture's `animal` list (`beast` for Chinese), with `{domestic}`-style references expanded. */
export function worldAnimals(culture: string): string[] {
  const world = WORLD_CULTURES.find((c) => c.id === culture);
  if (!world) return [];
  const raw = world.lists.animal ?? world.lists.beast ?? [];
  return raw.flatMap((w) => {
    const ref = w.match(/^\{(\w+)\}$/);
    return ref ? (world.lists[ref[1]] ?? []).filter((x) => !x.includes("{")) : [w];
  }).map(stripPlural);
}

/** The culture's own land words (world `land` lists), for `epPlaceLand` (§5.2). */
export function cultureLand(culture: string): string[] {
  const world = WORLD_CULTURES.find((c) => c.id === culture);
  return (world?.lists.land ?? []).filter((w) => !w.includes("{")).map(stripPlural);
}

/** §11.4: the deity and saint names each no-gods culture's places may draw on. */
const HOLY_NAMES = new Map(
  BYNAMES_DATA.safeguards.noGods.flatMap((key) => {
    const world = WORLD_CULTURES.find((c) => c.id === key);
    const words = [...(world?.lists.god ?? []), ...(world?.lists.saint ?? [])].map(stripPlural).filter((w) => !w.includes("{"));
    return words.length > 0 ? [[key, new RegExp(`(^|[^\\p{L}])(${words.join("|")})($|[^\\p{L}])`, "u")] as const] : [];
  }),
);

/** §11.4: the pattern for a no-gods culture's deity and saint names, if it has any. */
export function holyNamesIn(culture: string): RegExp | undefined {
  return HOLY_NAMES.get(culture);
}

/** §4.3: where invented places come from. */
export function townSource(culture: string): string | undefined {
  if (["general", "anglo-saxon", "celtic", "norman-british"].includes(culture)) return "britain";
  if (culture === "greek-byzantine" || culture === "steppe") return undefined;
  return culture;
}

const PLACEHOLDERS: Record<NameRole, string> = { self: "[name]", father: "[father]", mother: "[mother]", child: "[child]" };

/** §2.4: a name for a role: the placeholder, or a pack draw (20 tries, then the placeholder). */
function personName(ctx: Ctx, role: NameRole): string {
  if (ctx.source !== "pack" || !ctx.draw) return PLACEHOLDERS[role];
  const sex: Sex = role === "father" ? "male" : role === "mother" ? "female" : role === "child" ? (ctx.rng() < 0.5 ? "male" : "female") : ctx.sex;
  for (let i = 0; i < 20; i++) {
    const name = ctx.draw(role, sex, ctx.rng);
    if (name) return name;
  }
  ctx.packFailed = true;
  return PLACEHOLDERS[role];
}

// Parent-name forms (§7.3, §7.4).

/** §7.4: Slavic patronymic endings. */
export function slavicPatronymic(father: string, sex: Sex): string {
  const lower = father.toLowerCase();
  const male = sex === "male";
  const drop = (n: number) => father.slice(0, father.length - n);
  for (const end of ["iy", "ei", "y", "i"]) if (lower.endsWith(end)) return drop(end.length) + (male ? "evich" : "evna");
  // -a and -ya drop the final a (Ilya → Ilyich, as §15.5 has it).
  if (lower.endsWith("a")) return drop(1) + (male ? "ich" : "ichna");
  return father + (male ? "ovich" : "ovna");
}

/** §7.3: Norse: Sigurdsson, Sigurdsdóttir; a name ending in s takes no extra s (Hansson, Hansdóttir). */
export function norsePatronymic(parent: string, sex: Sex): string {
  const s = parent.toLowerCase().endsWith("s") ? "" : "s";
  return parent + s + (sex === "male" ? "son" : "dóttir");
}

/** §7.3: Welsh: ap Rhys, ab Owain (before a vowel). */
export function welshPatronymic(father: string): string {
  return `${/^[aeiouAEIOU]/.test(father) ? "ab" : "ap"} ${father}`;
}

/** §7.3: Greek: the father's name with -ides, a final vowel dropped first. */
export function greekPatronymic(father: string): string {
  return (/[aeiouAEIOU]$/.test(father) ? father.slice(0, -1) : father) + "ides";
}

/** §10.4: a native rank's "of": Norman de, or d' before a vowel. */
export function nativeOf(culture: string, place: string): string {
  const word = BYNAMES_DATA.titles.nativeOf[culture];
  if (!word) return `of ${place}`;
  return word === "de" && /^[AEIOUaeiouÆæ]/.test(place) ? `d'${place}` : `${word} ${place}`;
}

/** Renders a pattern's tokens; undefined when one has nothing to offer. */
function render(ctx: Ctx, pattern: string): string | undefined {
  let failed = false;
  const out = pattern.replace(/\{([^}]+)\}/g, (_m, raw: string) => {
    if (failed) return "";
    const piece = token(ctx, raw);
    if (piece === undefined) failed = true;
    return piece ?? "";
  });
  return failed ? undefined : out;
}

const joinClosed = (a: string, b: string) => a + b.toLowerCase();
const closeUp = (w: string) => (w.includes("+") ? w.split("+").reduce((x, y) => joinClosed(x, y)) : w);

function listWord(ctx: Ctx, name: string, opts: { nativeOnly?: boolean; englishOnly?: boolean } = {}): string | undefined {
  const entries = BYNAMES_DATA.lists[name];
  if (!entries) throw new Error(`Bynames: no list “${name}”.`);
  return drawEntries(ctx, entries, opts)?.text;
}

function token(ctx: Ctx, raw: string): string | undefined {
  const [name, mod] = raw.split(":");
  if (name.includes("+")) {
    const [a, b] = name.split("+");
    const first = token(ctx, a);
    const second = token(ctx, b);
    return first && second ? joinClosed(first, second) : undefined;
  }
  const rng = ctx.rng;
  switch (name) {
    case "father":
    case "mother": {
      const parent = personName(ctx, name);
      if (mod === "norseSon") return norsePatronymic(parent, "male");
      if (mod === "norseDaughter") return norsePatronymic(parent, "female");
      if (mod === "welsh") return welshPatronymic(parent);
      if (mod === "greek") return greekPatronymic(parent);
      if (mod === "slavic") return slavicPatronymic(parent, ctx.sex);
      return parent;
    }
    case "child":
      return personName(ctx, "child");
    case "town": {
      // §11.4: no deity or saint names in these cultures' places (Ganesha's Plain, Saint George's).
      const holy = HOLY_NAMES.get(ctx.culture);
      for (let i = 0; i < 20; i++) {
        const town = groupTown(ctx.setting, townSource(ctx.culture), rng);
        if (!holy || !holy.test(town)) return town;
      }
      return undefined;
    }
    case "god": {
      if (BYNAMES_DATA.safeguards.noGods.includes(ctx.culture)) return undefined;
      const gods = WORLD_CULTURES.find((c) => c.id === ctx.culture)?.lists.god ?? [];
      return gods.length > 0 ? stripPlural(gods[Math.floor(rng() * gods.length)]) : undefined;
    }
    case "number":
    case "compass":
    case "star": {
      return pickWeighted(groupListWords(name, ctx.setting), rng);
    }
    case "epPlaceLand":
    case "domainLand":
      return placeLand(ctx);
    case "beast": {
      const extra = cultureAnimals(ctx.culture).map((w): BynameEntry => ({ w, x: 3 }));
      return drawEntries(ctx, ctx.culture === "general" ? BYNAMES_DATA.lists.beast : [...BYNAMES_DATA.lists.beast, ...extra])?.text;
    }
    case "clanBorn": {
      const half = rng() < 0.5 ? listWord(ctx, "material") : listWord(ctx, "element");
      const suffix = BYNAMES_DATA.clanBornSuffixes[Math.floor(rng() * BYNAMES_DATA.clanBornSuffixes.length)];
      return half ? joinClosed(half, suffix) : undefined;
    }
    case "clanStyle": {
      // §7.2: the clanBorn list, material + heart/blood/shield/fist/bane, and (S) the fixed words.
      const choices: [string, number][] = [["material", 40]];
      if (["FH", "MF"].includes(ctx.setting)) choices.push(["clanBorn", 40]);
      if (ctx.setting === "SF") choices.push(["sf", 20]);
      const which = pickWeighted(choices, rng);
      if (which === "clanBorn") return token(ctx, "clanBorn");
      if (which === "sf") return listWord(ctx, "clanStyleSF");
      const half = listWord(ctx, "material");
      const suffix = BYNAMES_DATA.clanStyleSuffixes[Math.floor(rng() * BYNAMES_DATA.clanStyleSuffixes.length)];
      return half ? joinClosed(half, suffix) : undefined;
    }
    case "rank": {
      const pick = drawEntries(ctx, BYNAMES_DATA.ranks[ctx.culture] ?? []);
      if (!pick) return undefined;
      ctx.rankAfter = pick.entry.pos === "after";
      ctx.rankNative = pick.native;
      return pick.text;
    }
    case "style": {
      const pick = drawEntries(ctx, BYNAMES_DATA.styles[ctx.culture] ?? []);
      return pick ? render(ctx, pick.text) : undefined;
    }
  }
  if (!BYNAMES_DATA.lists[name]) throw new Error(`Bynames: no list “${name}”.`);
  const word = listWord(ctx, name, mod === "native" ? { nativeOnly: true } : mod === "E" ? { englishOnly: true } : {});
  return word === undefined ? undefined : closeUp(word);
}

/** §5.2: the land list with its prefix rule, the culture's land words and the extras; in SF, space lands. */
function placeLand(ctx: Ctx): string | undefined {
  const rng = ctx.rng;
  const extras = (name: string): [{ word: string; gn: boolean }, number][] =>
    BYNAMES_DATA.lists[name].map((e) => [{ word: e.w!, gn: false }, (e.x ?? 1) * (e.cx?.[ctx.culture] ?? 1)]);
  if (ctx.setting === "SF") {
    const pool = [...groupListWords("spaceLand", "SF").map(([w, n]): [{ word: string; gn: boolean }, number] => [{ word: w, gn: false }, n]), ...extras("epPlaceSpaceExtra")];
    return pickWeighted(pool, rng)?.word;
  }
  const pool: [{ word: string; gn: boolean }, number][] = [
    ...groupListWords("land", ctx.setting).map(([w, n]): [{ word: string; gn: boolean }, number] => [{ word: w, gn: true }, n]),
    ...cultureLand(ctx.culture).map((w): [{ word: string; gn: boolean }, number] => [{ word: w, gn: false }, 1]),
    ...extras("epPlaceLandExtra"),
  ];
  const pick = pickWeighted(pool, rng);
  if (!pick) return undefined;
  return pick.gn ? prefixedLand(pick.word, ctx.setting, rng) : pick.word;
}

// ── Shapes, joins and safeguards ────────────────────────────────────────────

const SMALL = new Set(["of", "the", "and", "a", "an", "de", "le"]);
const contentWords = (text: string) =>
  text
    .replace(/[“”",.]/g, "")
    .split(/[\s-]+/)
    .map((w) => w.toLowerCase())
    .filter((w) => w && !SMALL.has(w) && !w.startsWith("["));

interface Built {
  /** The byname, title or family name alone. */
  part: string;
  /** The whole result with the name. */
  text: string;
  kind: string;
  shape: string;
  tones: GroupTone[];
}

interface Guard {
  block: Set<string>;
  patterns: RegExp[];
}

const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const BANNED_WORDS = BYNAMES_DATA.safeguards.banned.map(wordRe);
const BANNED_EPITHETS = new Set(BYNAMES_DATA.safeguards.bannedEpithets.map((w) => w.toLowerCase()));
const SACRED = BYNAMES_DATA.safeguards.sacred.map((w) => w.toLowerCase());

/** §11: block list (whole result and the byname alone), banned words, sacred forms, word caps. */
function acceptable(guard: Guard, built: Built, cap: number): boolean {
  const name = built.text.replace(/\[(name|father|mother|child)\]/g, "").trim();
  for (const candidate of [built.text, built.part, name]) {
    const n = normForBlock(candidate.replace(/^,\s*/, "").replace(/[“”]/g, ""));
    if (n && guard.block.has(n)) return false;
    if (guard.patterns.some((re) => re.test(candidate))) return false;
  }
  if (hasBannedWord(built.text) || BANNED_WORDS.some((re) => re.test(built.text))) return false;
  if (BANNED_EPITHETS.has(built.part.toLowerCase())) return false;
  const lower = built.text.toLowerCase();
  if (SACRED.some((w) => lower.includes(w))) return false;
  if (contentWords(built.part).length > cap) return false;
  const words = contentWords(built.part);
  if (new Set(words).size !== words.length) return false;
  return true;
}

function newCtx(base: Omit<Ctx, "drawn" | "sex" | "native" | "rankAfter" | "rankNative">, sex: Sex, native: boolean): Ctx {
  return { ...base, sex, native, drawn: new Set(), rankAfter: false, rankNative: false };
}

const tonesOf = (shapeTones: GroupTone[] | undefined, drawn: Set<GroupTone>) => {
  const all = new Set<GroupTone>([...(shapeTones ?? []), ...drawn]);
  return GROUP_TONES.filter((t) => all.has(t));
};

/** A weighted shape for the kind; setting, gate and tone applied (§3, §5.4, §8). */
function pickShape(ctx: Ctx, shapes: Shape[], kind: string): Shape | undefined {
  const live = shapes
    .filter((s) => s.kind === kind && (!s.s || s.s.includes(ctx.setting)) && (!s.gate || lightOrGrim(ctx.tone)))
    .map((s): [Shape, number] => [s, s.w * toneFactor(s.t ?? [], ctx.tone)]);
  return pickWeighted(live, ctx.rng);
}

const NUMBER_WORDS = new Set(BYNAMES_DATA.lists.dayNumber.flatMap((e) => [e.w!, e.n!]));

/** §10.1: an epithet beside its name. */
function joinEpithet(name: string | undefined, part: string, join: Shape["join"]): string {
  if (!name) return part;
  if (join === "comma") return NUMBER_WORDS.has(part.split(" ")[0]) ? `${name}, ${part}` : `${name}, the ${part}`;
  return `${name} ${part}`;
}

function buildEpithet(ctx: Ctx, kind: string): Built | undefined {
  const shape = pickShape(ctx, BYNAMES_DATA.epithets.shapes, kind);
  if (!shape) return undefined;
  const part = render(ctx, shape.p);
  if (!part) return undefined;
  const name = ctx.source === "none" ? undefined : personName(ctx, "self");
  return { part, text: joinEpithet(name, part, shape.join), kind, shape: shape.p, tones: tonesOf(shape.t, ctx.drawn) };
}

/** One title (§6.3, §6.6): its text, whether it's a rank, and the rank's position. */
function oneTitle(ctx: Ctx, kind: string, forceShape?: string): { text: string; shape: Shape; rank: boolean; after: boolean } | undefined {
  const shapes = BYNAMES_DATA.titles.shapes;
  const shape = forceShape ? shapes.find((s) => s.p === forceShape)! : pickShape(ctx, shapes, kind);
  if (!shape) return undefined;
  ctx.rankAfter = false;
  ctx.rankNative = false;
  let text: string | undefined;
  if (shape.p === "{rank} of {town}") {
    const rank = token(ctx, "rank");
    const town = token(ctx, "town");
    if (!rank || !town) return undefined;
    // §10.4: a native rank with a place takes the culture's own "of".
    text = `${rank} ${ctx.rankNative ? nativeOf(ctx.culture, town) : `of ${town}`}`;
  } else text = render(ctx, shape.p);
  if (!text) return undefined;
  return { text, shape, rank: shape.p === "{rank}" || shape.p === "{rank} of {town}", after: ctx.rankAfter };
}

function buildTitle(ctx: Ctx, kind: string, length: BynameLength): Built | undefined {
  const name = ctx.source === "none" ? undefined : personName(ctx, "self");
  if (length === "single") {
    const title = oneTitle(ctx, kind);
    if (!title) return undefined;
    const bare = title.shape.p === "{rank}";
    const text = !name ? title.text : bare ? (title.after ? `${name} ${title.text}` : `${title.text} ${name}`) : `${name}, ${title.text}`;
    return { part: title.text, text, kind, shape: title.shape.p, tones: tonesOf(title.shape.t, ctx.drawn) };
  }
  // §6.5: 2 (40%), 3 (40%) or 4 (20%) titles; a rank first; at most one office; no shared content word.
  const r = ctx.rng();
  const size = r < 0.4 ? 2 : r < 0.8 ? 3 : 4;
  const firstShape = pickWeighted<string>([["{rank}", 100], ["{rank} of {town}", 15]], ctx.rng)!;
  const first = oneTitle(ctx, "rank", firstShape);
  if (!first) return undefined;
  const parts = [first.text];
  const used = new Set(contentWords(first.text));
  let offices = 0;
  const shapeTones = new Set<GroupTone>(first.shape.t ?? []);
  for (let tries = 0; parts.length < size && tries < 40; tries++) {
    const kindPick = offices > 0 ? "style" : pickWeighted<string>([["style", 20], ["office", 40]], ctx.rng)!;
    const next = oneTitle(ctx, kindPick);
    if (!next || next.rank) continue;
    const words = contentWords(next.text);
    if (parts.includes(next.text) || words.some((w) => used.has(w))) continue;
    parts.push(next.text);
    words.forEach((w) => used.add(w));
    if (kindPick === "office") offices++;
    for (const t of next.shape.t ?? []) shapeTones.add(t);
  }
  if (parts.length < size) return undefined;
  const rest = parts.slice(1).join(", ");
  let head = first.text;
  if (name) {
    const ofAt = firstShape === "{rank} of {town}" ? first.text.search(/ (of|de|d') ?/) : -1;
    const rank = ofAt >= 0 ? first.text.slice(0, ofAt) : first.text;
    const place = ofAt >= 0 ? first.text.slice(ofAt) : "";
    head = (first.after ? `${name} ${rank}` : `${rank} ${name}`) + place;
  }
  return { part: parts.join(", "), text: `${head}, ${rest}`, kind: "full", shape: "full style", tones: tonesOf([...shapeTones], ctx.drawn) };
}

const SON_OF = /^(son|daughter|grandson|father|mother) of /;

function buildFamily(ctx: Ctx, kind: string): Built | undefined {
  const system = BYNAMES_DATA.family.cultures[ctx.culture];
  const forms = (system?.forms[kind] ?? []).filter(
    (f) => (f.l === "both" || f.l === (ctx.native ? "n" : "e")) && (!f.g || f.g === (ctx.sex === "male" ? "m" : "f")),
  );
  const kindTones = BYNAMES_DATA.family.kinds.find((k) => k.key === kind)?.t ?? [];
  const form = pickWeighted(
    forms.map((f): [Form, number] => [f, f.w * toneFactor([...kindTones, ...(f.t ?? [])], ctx.tone)]),
    ctx.rng,
  );
  if (!form) return undefined;
  const part = render(ctx, form.p);
  if (!part) return undefined;
  const name = ctx.source === "none" ? undefined : personName(ctx, "self");
  let text = part;
  if (name) {
    if (BYNAMES_DATA.familyFirst.includes(ctx.culture)) text = `${part} ${name}`;
    else if (SON_OF.test(part)) text = `${name}, ${part}`;
    else text = `${name} ${part}`;
  }
  return { part, text, kind, shape: form.p, tones: tonesOf([...kindTones, ...(form.t ?? [])], ctx.drawn) };
}

// ── Batches ─────────────────────────────────────────────────────────────────

/** §3: a batch of unique names. */
export function generateBynames(options: BynameOptions): BynameBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const module = options.module;
  const culture = BYNAME_CULTURES.some((c) => c.key === options.culture) ? options.culture! : "general";
  const genre = options.genre ?? "fantasy";
  const setting = groupSetting(genre, genre === "scifi" ? false : !!options.fantastic);
  const tone = options.tone ?? "any";
  const language: BynameLanguage = showsLanguage(module, culture) ? options.language ?? "english" : "english";
  const gender = options.gender ?? "anyone";
  const length = module === "titles" ? options.length ?? "single" : "single";
  const notices: string[] = [];
  const kinds = availableKinds(module, culture, setting);
  const chosen = options.kind ? kinds.find((k) => k.kind.key === options.kind) : undefined;
  if (options.kind && !chosen) notices.push(`“${options.kind}” isn't available here; using any kind.`);
  const guards = options.safeguards ?? { block: BYNAMES_DATA.safeguards.block, flag: BYNAMES_DATA.safeguards.flag, flagListBlocks: BYNAMES_DATA.safeguards.flagListBlocks };
  const guard: Guard = {
    block: new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(normForBlock)),
    patterns: BYNAMES_DATA.safeguards.blockPatterns.map((p) => new RegExp(p, "i")),
  };
  const base = { rng, setting, culture, tone, source: options.source ?? "placeholder", draw: options.draw, packFailed: false };
  const kindChoices = kinds.map(({ kind, weight }): [string, number] => [kind.key, weight]);
  const count = Math.max(0, Math.floor(options.count));
  const seen = new Set<string>();
  const names: BynameResult[] = [];
  let packFailed = false;

  const oneName = (): BynameResult | undefined => {
    const sex: Sex = gender === "men" ? "male" : gender === "women" ? "female" : rng() < 0.5 ? "male" : "female";
    const native = language === "native" || (language === "mixed" && rng() < 0.5);
    let kind = chosen?.kind.key ?? (length === "full" ? "rank" : pickWeighted(kindChoices, rng));
    for (let round = 0; round < 2 && kind; round++) {
      for (let i = 0; i < 20; i++) {
        const ctx = newCtx(base, sex, native);
        const built =
          module === "epithets" ? buildEpithet(ctx, kind) : module === "titles" ? buildTitle(ctx, kind, length) : buildFamily(ctx, kind);
        if (ctx.packFailed) packFailed = true;
        if (!built || !acceptable(guard, built, length === "full" ? 24 : 8)) continue;
        return { text: built.text, module, culture, kind: built.kind, shape: built.shape, gender: sex, language: native ? "native" : "english", tones: built.tones };
      }
      if (!chosen) kind = pickWeighted(kindChoices, rng);
    }
    return undefined;
  };

  if (kindChoices.length > 0) {
    for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
      const name = oneName();
      if (!name) continue;
      const key = name.text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      names.push(name);
    }
  }
  if (packFailed) notices.push(`Pack “${options.packName ?? ""}” gave no names; placeholders used.`);
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
  return { names, seed, notices };
}

/** §1.2: "titles and honorifics · high or epic fantasy · Norse · grim · native". */
export function bynameHistoryLabel(module: BynameModule, genre: GroupGenre, fantastic: boolean, culture: string, tone: GroupToneChoice = "any", language: BynameLanguage = "english"): string {
  const label = BYNAME_CULTURES.find((c) => c.key === culture)?.label ?? "General";
  return [
    BYNAME_MODULE_LABELS[module],
    SETTING_PHRASES[groupSetting(genre, fantastic)],
    label,
    ...(tone !== "any" ? [tone] : []),
    ...(language !== "english" && showsLanguage(module, culture) ? [language] : []),
  ].join(" · ");
}

