// Deities and sacred places (docs/deities-and-sacred-places-brief.md): invented gods, spirits,
// pantheons and holy places for the byname cultures and route names' seven eras. Every deity is
// invented: no real god's name, no living-religion title and no real sacred place is ever output (§11).
// Words come from the shared settlement pools (settlement/vocab.ts, with vocabulary packs); colours
// from group names, saints from group names, places from the route engine. No Obsidian imports.

import deityData from "../data/deity-names.json";
import { BYNAME_CULTURES } from "../bynames/engine";
import {
  type GroupSafeguards,
  type GroupSetting,
  type GroupTone,
  type GroupToneChoice,
  GROUP_TONES,
  groupListWords,
  groupStarIn,
  groupPlural,
  groupPossessive,
  groupSaint,
  hasBannedWord,
  ordinalText,
  pickWeighted,
  repeatsContent,
  toneFactor,
  wordTones,
} from "../groups/engine";
import { mulberry32 } from "../markov";
import { countedWords, ROUTE_ERAS, routeCapitals, routeNorm, routePlace, routeSetting, type RouteEra } from "../routes/engine";
import { BUILT_IN_VOCAB, cultureAllowed, inCultureGroup, poolEntries, type VocabEntry, type Vocabulary } from "../settlement/vocab";
import { setDeityHooks } from "./hook";

// ── Data ────────────────────────────────────────────────────────────────────

export type DeityKind = "deity" | "pantheon" | "place";
export type DeityGender = "any" | "male" | "female" | "neither";
export type DeityNames = "titles" | "placeholder" | "pack";
type G = "m" | "f" | "n";

interface Archetype {
  m?: string;
  f?: string;
  n?: string;
  all?: string;
  c?: string[];
  pantheon?: boolean;
}

interface Domain {
  key: string;
  label: string;
  e?: RouteEra[];
  h?: boolean;
  words: { w: string; sg: string; x?: number; c?: string[] }[];
  archetypes: Archetype[];
}

export interface DeityShape {
  p: string;
  w: number;
  kind: DeityKind;
  form?: string;
  variant?: string;
  e?: RouteEra[];
  c?: string[];
  t?: GroupTone[];
  h?: boolean;
  christian?: boolean;
  domain?: string;
  gender?: G;
}

interface Style {
  formX?: Record<string, number>;
  fVariant?: string;
  domainX?: Record<string, number>;
  kindX?: Record<string, number>;
  archetypeX?: Record<string, number>;
  eastHonour?: boolean;
  tripleThree?: boolean;
  extra?: DeityShape[];
}

interface DeityData {
  any: string;
  kinds: { key: DeityKind; menu: string; plural: string; w: number; description: string }[];
  domains: Domain[];
  shapes: DeityShape[];
  styles: Record<string, Style>;
  christian: { cultures: string[]; genericForms: string[]; placeX: Record<string, number> };
  unoffered: string[];
  lists: {
    kennWord: string[];
    eastHonour: [string, number][];
    spiritWord: string[];
    underAbove: string[];
    number: [string, number][];
    strangeNumber: string[];
    pronoun: Record<G, string>;
    steppeNoColour: string[];
    livingTricksters: string[];
  };
  series: { from: number };
  /** §10.3: group names' traditions as a culture, the christian ones, and the sensitive ones. */
  traditionCulture: Record<string, string>;
  christianTraditions: string[];
  sensitiveTraditions: string[];
  cap: number;
  safeguards: { block: string[]; names: string[]; flag: string[]; flagListBlocks: boolean; banned: string[] };
}

export const DEITY_DATA = deityData as unknown as DeityData;
export const DEITY_KINDS = DEITY_DATA.kinds;
export const DEITY_DOMAINS = DEITY_DATA.domains;
export const DEITY_ANY = DEITY_DATA.any;
/** §0: the byname cultures, without the sensitive ones. */
export const DEITY_CULTURES = BYNAME_CULTURES.filter((c) => !DEITY_DATA.unoffered.includes(c.key));
export const deityCultureOffered = (key: string) => DEITY_CULTURES.some((c) => c.key === key);

/** §4.1: the domains offered in an era (steampunk: the steam age with fantastic). */
export const domainsOffered = (era: RouteEra, fantastic: boolean) => DEITY_DOMAINS.filter((d) => (!d.e || d.e.includes(era)) && (d.h === undefined || d.h === fantastic));

/** §6: the christian cultures (the vocabulary's group, and Ethiopian). */
export const isChristianCulture = (culture: string, era: RouteEra) => inCultureGroup("christian", culture, era) || DEITY_DATA.christian.cultures.includes(culture);

export const defaultDeitySafeguards = (): GroupSafeguards => ({ block: DEITY_DATA.safeguards.block, flag: DEITY_DATA.safeguards.flag, flagListBlocks: DEITY_DATA.safeguards.flagListBlocks });

// ── Options and results ─────────────────────────────────────────────────────

export interface DeityOptions {
  culture?: string;
  kind?: DeityKind;
  domain?: string;
  gender?: DeityGender;
  era?: RouteEra;
  fantastic?: boolean;
  tone?: GroupToneChoice;
  names?: DeityNames;
  /** §7.1: a pack name for the gender (BT §2.4); null when the pack gives nothing. */
  drawName?: (gender: G, rng: () => number) => string | null;
  /** §8: as one pantheon. */
  series?: boolean;
  /** Line-up brief §2.2: with kind Any, draw only these kinds (the deities module leaves places out). */
  kinds?: DeityKind[];
  count: number;
  seed?: number;
  safeguards?: GroupSafeguards;
  vocab?: Vocabulary;
  /** Tests and back-links: only these forms, or only this shape. */
  forms?: string[];
  shape?: string;
}

export interface DeityName {
  text: string;
  /** The title alone (without a name). */
  title: string;
  kind: DeityKind;
  shape: string;
  form: string;
  domain?: string;
  gender?: G;
  tones: GroupTone[];
  words: { pool: string; word: string }[];
}

export interface DeityBatch {
  names: DeityName[];
  seed: number;
  notices: string[];
}

// ── Drawing ─────────────────────────────────────────────────────────────────

interface Ctx {
  rng: () => number;
  culture: string;
  era: RouteEra;
  setting: GroupSetting;
  fantastic: boolean;
  tone: GroupToneChoice;
  vocab: Vocabulary;
  style: Style;
  christian: boolean;
  gender: G;
  domain: Domain;
  shape?: DeityShape;
  /** §8 rule 4: a deity of the batch for a sacred place. */
  deityRef?: string;
  drawn: Set<GroupTone>;
  words: { pool: string; word: string }[];
  safeguards?: GroupSafeguards;
}

const pickOne = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];
const GENDERS: G[] = ["m", "f", "n"];
const GENDER_OF: Record<Exclude<DeityGender, "any">, G> = { male: "m", female: "f", neither: "n" };

function vocabPool(ctx: Ctx, pool: string, keep?: (e: VocabEntry) => boolean): [VocabEntry, number][] {
  return poolEntries(ctx.vocab, pool, { culture: ctx.culture, era: ctx.era, fantastic: ctx.fantastic })
    .filter(([e]) => !keep || keep(e))
    .map(([e, w]): [VocabEntry, number] => [e, w * toneFactor(e.t ?? [], ctx.tone)])
    .filter(([, w]) => w > 0);
}

function fromPool(ctx: Ctx, pool: string, keep?: (e: VocabEntry) => boolean, x?: (e: VocabEntry) => number): string | undefined {
  const items = vocabPool(ctx, pool, keep).map(([e, w]): [VocabEntry, number] => [e, w * (x?.(e) ?? 1)]);
  const e = pickWeighted(items, ctx.rng);
  if (!e) return undefined;
  for (const t of e.t ?? []) ctx.drawn.add(t);
  ctx.words.push({ pool, word: e.w });
  return e.w;
}

/** §5: a gendered word (unmarked entries read as neither). */
const gendered = (ctx: Ctx, pool: string) => fromPool(ctx, pool, (e) => (e.g ?? "n") === ctx.gender);

/** §4.2: the domain's archetypes for the gender and culture (pantheon-only ones for pantheons). */
function archetypes(ctx: Ctx, domain: Domain, pantheon: boolean): [string, number][] {
  const out: [string, number][] = [];
  for (const a of domain.archetypes) {
    if (a.c && !a.c.includes(ctx.culture)) continue;
    if (a.pantheon && !pantheon) continue;
    const text = a.all ?? a[ctx.gender];
    if (!text) continue;
    // §11.4: the living traditions' tricksters and ancestors never with a light tone.
    if (ctx.tone === "light" && DEITY_DATA.lists.livingTricksters.includes(text)) continue;
    out.push([text, ctx.style.archetypeX?.[text] ?? 1]);
  }
  return out;
}

/** §4.1: a domain word here (culture-limited words, like Maize), with its singular. */
function domainWord(ctx: Ctx): { w: string; sg: string } | undefined {
  const items = ctx.domain.words.filter((w) => !w.c || w.c.includes(ctx.culture)).map((w): [typeof w, number] => [w, w.x ?? 1]);
  const w = pickWeighted(items, ctx.rng);
  if (w) ctx.words.push({ pool: "domainWord", word: w.w });
  return w;
}

/** §7.3: `{deity}` for a sacred place: the batch's deity, or a title (archetype, A, B, C or D, any gender). */
function deityRef(ctx: Ctx): string | undefined {
  const title = ctx.deityRef ?? deityTitleIn(ctx, ["archetype", "A", "B", "C", "D"]);
  if (!title) return undefined;
  // "Grove of She Who Remembers"; "Mountain of the Storm Bringer".
  if (/^(He|She|They) Who /.test(title)) return title;
  return `the ${title.replace(/^the /, "")}`;
}

function token(ctx: Ctx, name: string): string | undefined {
  const rng = ctx.rng;
  const L = DEITY_DATA.lists;
  switch (name) {
    case "figure":
      return gendered(ctx, "divineFigure");
    case "kin":
      return gendered(ctx, "divineKin");
    case "pronoun":
      return L.pronoun[ctx.gender];
    case "domainWord":
      return domainWord(ctx)?.w;
    case "domainSg":
      return domainWord(ctx)?.sg;
    case "archetype": {
      const pantheon = ctx.shape?.kind === "pantheon";
      const a = pickWeighted(archetypes(ctx, ctx.domain, pantheon).filter(([t]) => !pantheon || !/^the /.test(t) || true), rng);
      if (a) ctx.words.push({ pool: "archetype", word: a });
      return pantheon ? a?.replace(/^the /, "") : a;
    }
    case "animal":
      return fromPool(ctx, "cultureDivineAnimal");
    case "colour": {
      const items = groupListWords("colour", ctx.setting).filter(([w]) => !(ctx.shape?.p.includes("Eternal") && L.steppeNoColour.includes(w)));
      const w = pickWeighted(items.map(([w, n]): [string, number] => [w, n * toneFactor(wordTones("colour", w), ctx.tone)]), rng);
      if (w) ctx.words.push({ pool: "colour", word: w });
      return w;
    }
    case "kennWord":
    case "spiritWord":
    case "underAbove":
      return pickOne(L[name], rng);
    case "eastHonour":
      return pickWeighted(L.eastHonour, rng);
    case "number":
      return pickWeighted(L.number.map(([w, n]): [string, number] => [w, n * toneFactor(L.strangeNumber.includes(w) ? ["strange"] : [], ctx.tone)]), rng);
    case "ordinal": {
      const w = pickWeighted(groupListWords("ordinalWord", ctx.setting), rng);
      return w ?? ordinalText(1 + Math.floor(rng() * 12));
    }
    case "divineVerb": {
      // "They Who Watch", "the Nine Who Wait": the verb agrees with a plural subject.
      const v = fromPool(ctx, name);
      const plural = ctx.gender === "n" || ctx.shape?.kind === "pantheon";
      return v && plural ? v.replace(/^(\w+)/, (w) => (/ies$/.test(w) ? w.replace(/ies$/, "y") : /(ch|sh|ss|x)es$/.test(w) ? w.slice(0, -2) : w.replace(/s$/, ""))) : v;
    }
    case "deityRef":
      return deityRef(ctx);
    case "place":
      return isFuture(ctx.era) ? groupStarIn("any", "invented", rng) : routePlace(ctx.culture, ctx.setting, rng);
    case "holy":
      return groupSaint(ctx.setting, rng);
    case "fixed":
      return fromPool(ctx, `deityFixed:${ctx.shape!.kind}`);
    case "sacredLand":
      // §6: the christian cultures' sacred places favour wells, springs and hills.
      return fromPool(ctx, name, undefined, (e) => (ctx.christian ? DEITY_DATA.christian.placeX[e.w] ?? 1 : 1));
  }
  return fromPool(ctx, name);
}

const isFuture = (era: RouteEra) => era === "NF" || era === "IS";

function renderPattern(ctx: Ctx, pattern: string): string | undefined {
  let failed = false;
  const colours: string[] = [];
  const out = pattern.replace(/\{([^}]+)\}/g, (_m, raw: string) => {
    if (failed) return "";
    const [name, mod] = raw.split(":");
    let piece = token(ctx, name);
    if (name === "colour" && piece && colours.includes(piece)) piece = token(ctx, name);
    if (!piece || (name === "colour" && colours.includes(piece))) {
      failed = true;
      return "";
    }
    if (name === "colour") colours.push(piece);
    if (mod === "poss") return groupPossessive(piece, false);
    if (mod === "pl") return groupPlural(piece);
    return piece;
  });
  // "{animal} of the {domainWord}" with "the Forge": one "the".
  return failed ? undefined : out.replace(/\bthe the\b/gi, "the");
}

/** §9: capitals after hyphens too; a leading "the" lower case. */
export const deityCapitals = (text: string) => routeCapitals(text).replace(/^The /, "the ");

// ── Safeguards (§11) ────────────────────────────────────────────────────────

const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");
const NAMES = DEITY_DATA.safeguards.names.map(wordRe);
const BANNED = DEITY_DATA.safeguards.banned.map(wordRe);
const bare = (text: string) => routeNorm(text).replace(/^the /, "");

/** §11.1: a real deity's name or a real sacred place anywhere in a title. */
export const hasRealDivineName = (text: string) => NAMES.some((re) => re.test(text));

/** §11.3: banned words (GN's and the module's). */
export const breaksDeityWords = (text: string) => hasBannedWord(text) || BANNED.some((re) => re.test(text));

export function deityBlockSet(guards: GroupSafeguards = defaultDeitySafeguards()): Set<string> {
  return new Set([...guards.block, ...(guards.flagListBlocks ? guards.flag : [])].map(bare));
}

/** §11: whether a title may be used here and in the back-links. */
export function deityTitleBlocked(text: string, guards?: GroupSafeguards): boolean {
  return deityBlockSet(guards).has(bare(text)) || hasRealDivineName(text) || breaksDeityWords(text);
}

/** RN §3.3: a pack word the deity safeguards drop. */
export const deityWordBlocked = (word: string, guards?: GroupSafeguards) => deityTitleBlocked(word, guards);

// ── Shapes (§6, §7) ─────────────────────────────────────────────────────────

function styleFor(culture: string, era: RouteEra): Style {
  const base = DEITY_DATA.styles[culture] ?? {};
  const ancient = era === "AN" ? DEITY_DATA.styles[`${culture}:AN`] : undefined;
  if (!ancient) return base;
  return { ...base, formX: { ...(base.formX ?? {}), ...(ancient.formX ?? {}) } };
}

function shapeWeight(ctx: Ctx, s: DeityShape): number {
  if (s.e && !s.e.includes(ctx.era)) return 0;
  if (!cultureAllowed(s.c, ctx.culture, ctx.era)) return 0;
  if (s.h !== undefined && s.h !== ctx.fantastic) return 0;
  if (s.christian && !ctx.christian) return 0;
  if (s.domain && s.domain !== ctx.domain.key) return 0;
  if (s.gender && s.gender !== ctx.gender) return 0;
  const form = s.form ?? "";
  // §6: the christian cultures' deities and pantheons take the generic forms only.
  if (ctx.christian && s.kind !== "place" && !DEITY_DATA.christian.genericForms.includes(form) && form !== "culture" && !/^P\d$/.test(form) && form !== "triple") return 0;
  if (form === "F" && ctx.style.fVariant && s.variant !== ctx.style.fVariant) return 0;
  if (s.p === "{archetype}" && archetypes(ctx, ctx.domain, false).length === 0) return 0;
  if (s.p === "{fixed}" && vocabPool(ctx, `deityFixed:${s.kind}`).length === 0) return 0;
  let w = s.w * (ctx.style.formX?.[form] ?? 1) * (form === "F" && ctx.style.fVariant ? 2 : 1);
  return w * toneFactor(s.t ?? [], ctx.tone);
}

/** §6: Form A with the East Asian honour before the figure. */
const honourPattern = (ctx: Ctx, s: DeityShape) => (ctx.style.eastHonour && s.form === "A" ? "the {eastHonour} {figure} of {domainWord}" : ctx.style.tripleThree && s.form === "triple" ? "the Three {figure:pl} of the {sacredLand}" : s.p);

function shapesFor(ctx: Ctx, kind: DeityKind, forms?: string[], only?: string): [DeityShape, number][] {
  return [...DEITY_DATA.shapes, ...(ctx.style.extra ?? [])]
    .filter((s) => s.kind === kind && (!forms || forms.includes(s.form ?? "")) && (!only || s.p === only))
    .map((s): [DeityShape, number] => [s, shapeWeight({ ...ctx, shape: s }, s)])
    .filter(([, w]) => w > 0);
}

/** One deity title with these forms (back-links, sacred places). */
function deityTitleIn(ctx: Ctx, forms: string[]): string | undefined {
  for (let i = 0; i < 20; i++) {
    const sub: Ctx = { ...ctx, gender: pickOne(GENDERS, ctx.rng), deityRef: undefined };
    sub.domain = pickWeighted(domainWeights(sub), ctx.rng) ?? sub.domain;
    const s = pickWeighted(shapesFor(sub, "deity", forms), ctx.rng);
    if (!s) return undefined;
    sub.shape = s;
    const raw = renderPattern(sub, honourPattern(sub, s));
    if (!raw) continue;
    const text = deityCapitals(raw);
    if (!titleOk(text, sub)) continue;
    return text;
  }
  return undefined;
}

function titleOk(text: string, ctx: Ctx): boolean {
  const counted = countedWords(text);
  if (counted.length === 0 || counted.length > DEITY_DATA.cap) return false;
  if (repeatsContent(counted)) return false;
  return !deityTitleBlocked(text, ctx.safeguards);
}

/** §6: the domains here, by the culture's weights. */
function domainWeights(ctx: Ctx): [Domain, number][] {
  return domainsOffered(ctx.era, ctx.fantastic).map((d): [Domain, number] => [d, ctx.style.domainX?.[d.key] ?? 1]);
}

// ── Batches ─────────────────────────────────────────────────────────────────

/** §0: the culture the module runs as (Polynesian and Andean run as General, with a notice). */
export function deityCulture(key: string | undefined): { culture: string; notice?: string } {
  if (key && DEITY_DATA.unoffered.includes(key)) return { culture: "general", notice: "This culture isn't offered for deities." };
  return { culture: DEITY_CULTURES.some((c) => c.key === key) ? key! : "general" };
}

/** §7: a batch of unique deity, pantheon and sacred place names; with series on, one pantheon (§8). */
export function generateDeityNames(options: DeityOptions): DeityBatch {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const notices: string[] = [];
  const { culture, notice } = deityCulture(options.culture);
  if (notice) notices.push(notice);
  const era: RouteEra = ROUTE_ERAS.some((e) => e.code === options.era) ? options.era! : "MD";
  const fantastic = !!options.fantastic;
  const count = Math.max(0, Math.floor(options.count));
  const offered = domainsOffered(era, fantastic);
  const chosenDomain = options.domain && options.domain !== "any" ? offered.find((d) => d.key === options.domain) : undefined;
  if (options.domain && options.domain !== "any" && !chosenDomain) notices.push(`The domain “${options.domain}” isn't offered here.`);
  const style = styleFor(culture, era);
  const names = options.names ?? "titles";

  const base: Ctx = {
    rng,
    culture,
    era,
    setting: routeSetting(era, fantastic),
    fantastic,
    tone: options.tone ?? "any",
    vocab: options.vocab ?? BUILT_IN_VOCAB,
    style,
    christian: isChristianCulture(culture, era),
    gender: "n",
    domain: offered[0],
    drawn: new Set(),
    words: [],
    safeguards: options.safeguards,
  };
  const allows = (k: DeityKind) => !options.kinds || options.kinds.includes(k);
  const kindWeights = DEITY_KINDS.filter((k) => allows(k.key)).map((k): [DeityKind, number] => [k.key, k.w * (style.kindX?.[k.key] ?? 1)]);
  const genderFixed = options.gender && options.gender !== "any" ? GENDER_OF[options.gender] : undefined;

  const build = (kind: DeityKind, extra: Partial<Ctx> = {}): DeityName | undefined => {
    for (let i = 0; i < 20; i++) {
      const ctx: Ctx = { ...base, drawn: new Set(), words: [], gender: genderFixed ?? pickOne(GENDERS, rng), ...extra };
      if (!extra.domain) ctx.domain = chosenDomain ?? pickWeighted(domainWeights(ctx), rng)!;
      const s = pickWeighted(shapesFor(ctx, kind, options.forms, options.shape), rng);
      if (!s) return undefined;
      ctx.shape = s;
      const raw = renderPattern(ctx, honourPattern(ctx, s));
      if (!raw) continue;
      const title = deityCapitals(raw);
      if (!titleOk(title, ctx)) continue;
      let text = title;
      if (kind === "deity" && names !== "titles") {
        // §7.1: "[deity], Lady of Ash"; "[deity], the Hidden One" keeps its lower-case "the".
        const name = names === "placeholder" ? "[deity]" : options.drawName?.(ctx.gender, rng);
        if (!name) continue;
        text = `${name}, ${title}`;
      }
      const tones = new Set<GroupTone>([...(s.t ?? []), ...ctx.drawn]);
      const usesDomain = /\{(domainWord|domainSg|archetype)\}/.test(s.p) || s.form === "A" || !!s.domain;
      return {
        text,
        title,
        kind,
        shape: s.p,
        form: s.form ?? "",
        ...(usesDomain ? { domain: ctx.domain.key } : {}),
        ...(kind === "deity" ? { gender: ctx.gender } : {}),
        tones: GROUP_TONES.filter((t) => tones.has(t)),
        words: ctx.words,
      };
    }
    return undefined;
  };

  const seen = new Set<string>();
  const out: DeityName[] = [];
  const add = (n: DeityName | undefined): boolean => {
    if (!n || seen.has(n.text.toLowerCase())) return false;
    // §8 rule 5: with a pack, names don't repeat.
    if (names === "pack" && n.text !== n.title && out.some((x) => x.text.split(", ")[0] === n.text.split(", ")[0])) return false;
    seen.add(n.text.toLowerCase());
    out.push(n);
    return true;
  };
  const drawKind = () => options.kind ?? pickWeighted(kindWeights, rng)!;

  if (options.series) pantheon();
  else for (let attempt = 0; attempt < count * 50 && out.length < count; attempt++) add(build(drawKind()));
  if (out.length < count) notices.push(`Only ${out.length} names could be generated.`);
  return { names: out, seed, notices };

  /** §8: one pantheon: its name, then deities of different domains, genders in turn. */
  function pantheon() {
    const domainsLeft = () => offered.filter((d) => !out.some((n) => n.kind === "deity" && n.domain === d.key));
    let turn = 0;
    if (!options.kind || options.kind === "pantheon") for (let t = 0; t < 20 && out.length === 0; t++) add(build("pantheon"));
    for (let idle = 0; idle < 80 && out.length < count; ) {
      let kind: DeityKind = options.kind ?? (rng() < 25 / 85 && allows("place") ? "place" : "deity");
      if (kind === "pantheon" && options.kind !== "pantheon") kind = "deity";
      // §8 rule 4: a sacred place names one of the batch's deities, so it waits for one.
      if (kind === "place" && !options.kind && !out.some((n) => n.kind === "deity")) kind = "deity";
      const extra: Partial<Ctx> = {};
      if (kind === "deity") {
        const left = domainsLeft();
        extra.domain = chosenDomain ?? (left.length > 0 ? pickOne(left, rng) : pickOne(offered, rng));
        if (!genderFixed) extra.gender = GENDERS[turn % 3];
      }
      if (kind === "place") {
        const deities = out.filter((n) => n.kind === "deity");
        if (deities.length > 0) extra.deityRef = pickOne(deities, rng).title;
      }
      const forms = kind === "deity" ? deityForms() : kind === "place" && extra.deityRef ? ["L1"] : undefined;
      const n = forms ? buildWith(kind, extra, forms) : build(kind, extra);
      if (n && add(n)) {
        if (kind === "deity") turn++;
        idle = 0;
      } else idle++;
    }
  }

  /** §8 rule 3: one archetype per domain; a Form C deity in a batch of 6 or more (the last chance). */
  function deityForms(): string[] | undefined {
    const deities = out.filter((n) => n.kind === "deity");
    const needC = count >= DEITY_DATA.series.from && !deities.some((n) => n.form === "C") && (deities.length >= 2 || out.length >= count - 2);
    if (needC) return ["C"];
    return undefined;
  }

  function buildWith(kind: DeityKind, extra: Partial<Ctx>, forms: string[]): DeityName | undefined {
    const saved = options.forms;
    options.forms = forms;
    try {
      return build(kind, extra);
    } finally {
      options.forms = saved;
    }
  }
}

/** §10: one deity title for the back-links (archetype, A, B or D; any gender; the culture's style). */
export function deityTitle(o: { culture?: string; era?: RouteEra; fantastic?: boolean; tone?: GroupToneChoice; rng: () => number; safeguards?: GroupSafeguards; vocab?: Vocabulary }): string | undefined {
  if (o.culture && DEITY_DATA.unoffered.includes(o.culture)) return undefined;
  const b = generateDeityNames({ ...o, kind: "deity", forms: ["archetype", "A", "B", "D"], count: 1, seed: Math.floor(o.rng() * 0xffffffff) });
  return b.names[0]?.title;
}

/** §10.2: one sacred place for pilgrim roads ("Mountain of the Storm Lord", "Holy Mountain"), without "the". */
export function sacredPlace(o: { culture?: string; era?: RouteEra; fantastic?: boolean; tone?: GroupToneChoice; rng: () => number; safeguards?: GroupSafeguards; vocab?: Vocabulary }): string | undefined {
  if (o.culture && DEITY_DATA.unoffered.includes(o.culture)) return undefined;
  const b = generateDeityNames({ ...o, kind: "place", forms: ["L1", "L2"], count: 1, seed: Math.floor(o.rng() * 0xffffffff) });
  return b.names[0]?.title.replace(/^the /, "");
}

/** §11.4: a deity title passes this module's safeguards (back-link tests). */
export const deityTitlePasses = (text: string) => !deityTitleBlocked(text);

/** §10.3: one deity title for a group-names tradition and setting (sensitive traditions: none). */
export function deityTitleForTradition(tradition: string, setting: GroupSetting, rng: () => number, tone?: GroupToneChoice): string | undefined {
  if (DEITY_DATA.sensitiveTraditions.includes(tradition)) return undefined;
  const era: RouteEra = setting === "SF" ? "IS" : setting === "MR" || setting === "MF" ? "MO" : "MD";
  return deityTitle({ culture: DEITY_DATA.traditionCulture[tradition] ?? "general", era, fantastic: setting === "FH" || setting === "MF", tone, rng });
}

// §10: the back-links' helpers, registered for the engines that can't import this one (hook.ts).
setDeityHooks({
  deityTitle,
  sacredPlace,
  deityTitleForTradition,
  cultureOffered: deityCultureOffered,
  isChristianCulture,
  sensitiveTraditions: DEITY_DATA.sensitiveTraditions,
  christianTraditions: DEITY_DATA.christianTraditions,
});
