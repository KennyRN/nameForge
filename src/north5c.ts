// Northern Europe tables brief, batch 5c: the batch's own data (src/data/north5c.json, written by scripts/make-north5c.mjs) and what the
// engines and coverage adapters share: the signature names of the seven core cultures and Celtic in the group families, tribes and kin
// groups, the bynames modules, realms, peoples and tongues, ships, aircraft and land vehicles. A culture's own frames take
// `SIGNATURE_SHARE` of a batch's names (§11.3); the rest come from the module's own draw. No Obsidian imports.

import north from "./data/north5c.json";
import { mulberry32 } from "./markov";
import { SIGNATURE_SHARE } from "./northData";
import { containsRealGroup, isRealGroup } from "./realPlaces";

/** A frame: its pattern, its weight and, for a fantastic one, its tag ("*"). */
type Frame = [string, number] | [string, number, string];
interface CultureContent {
  /** The three lists of nouns, one per kind of the module. */
  n: string[][];
  /** 5d §14: each noun's tag, parallel to `n`: eras ("AN-EM", "ST-MO", "MO") and a trailing "*" for a fantastic word; "" when it has none. */
  nt?: string[][];
  /** 5d §14.2: the culture's ranks as pairs, man's form first (`{R}` in a frame); where a rank has no woman's form the woman is "Lady". */
  r?: [string, string][];
  /** The culture's adjectives. */
  a: string[];
  f: Frame[];
}
interface ModuleContent {
  kinds: string[];
  cultures: Record<string, CultureContent>;
}
interface North5c {
  modules: Record<string, ModuleContent>;
  native: Record<string, Record<string, string[]>>;
}

export const NORTH5C = north as unknown as North5c;

/** The seven core cultures of the batch and Celtic. */
export const CORE_5C = ["english", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german"] as const;
/** The four Celtic nations, drawn at a quarter weight inside Celtic (§3.2). */
export const CELTIC_NATIONS = ["welsh", "scottish", "irish", "cornish"] as const;
export const CELTIC_5C_WEIGHT = 0.25;

/** The content key a module culture key (or a tribal tradition key) reads: the two Englishes read `english`. */
export function contentKey(culture: string | undefined): string | undefined {
  if (!culture) return undefined;
  if (culture === "anglo-saxon" || culture === "norman-british") return "english";
  return culture === "celtic" || (CORE_5C as readonly string[]).includes(culture) ? culture : undefined;
}

/** Whether a module has signature content for a culture. */
export const hasSignature = (module: string, culture: string | undefined): boolean => {
  const key = contentKey(culture);
  return !!key && !!NORTH5C.modules[module]?.cultures[key];
};

/** Every (culture, content) pair a chosen culture draws: its own, and for Celtic each nation's at a quarter weight. */
function sources(module: string, key: string): { content: CultureContent; weight: number }[] {
  const m = NORTH5C.modules[module];
  if (!m) return [];
  const own = m.cultures[key];
  if (!own) return [];
  if (key !== "celtic") return [{ content: own, weight: 1 }];
  return [{ content: own, weight: 1 }, ...CELTIC_NATIONS.map((k) => ({ content: m.cultures[k], weight: CELTIC_5C_WEIGHT }))];
}

/** What a name is drawn for (5d §14.1): the eras it may sit in, whether the setting is fantastic, and the bearer's sex (for a rank). */
export interface DrawCtx {
  eras?: readonly string[];
  fantastic?: boolean;
  sex?: "male" | "female";
}
const ERA_ORDER = ["AN", "MD", "EM", "ST", "MO", "NF", "IS"];
const tagCache = new Map<string, { eras: string[] | null; h: boolean }>();
/** A tag read: its eras (null for any) and whether it is a fantastic word. */
export function readTag(tag: string | undefined): { eras: string[] | null; h: boolean } {
  const key = tag ?? "";
  let r = tagCache.get(key);
  if (!r) {
    const h = key.endsWith("*");
    const span = h ? key.slice(0, -1) : key;
    let eras: string[] | null = null;
    if (span) {
      const m = span.match(/^([A-Z]{2})(?:-([A-Z]{2}))?$/);
      if (m) {
        const from = ERA_ORDER.indexOf(m[1]);
        const to = m[2] ? ERA_ORDER.indexOf(m[2]) : from;
        eras = ERA_ORDER.slice(from, to + 1);
      }
    }
    r = { eras, h };
    tagCache.set(key, r);
  }
  return r;
}
/** Whether a tagged entry may be drawn in a context: a fantastic one only in a fantastic setting, an era one only where its eras meet the context's (unknown eras filter nothing). */
export function tagOk(tag: string | undefined, ctx: DrawCtx | undefined): boolean {
  if (!tag) return true;
  const t = readTag(tag);
  if (t.h && !ctx?.fantastic) return false;
  if (t.eras && ctx?.eras && ctx.eras.length > 0 && !t.eras.some((e) => ctx.eras!.includes(e))) return false;
  return true;
}
/** The eras a genre reads as, for the modules whose engine has no era of its own (5d §14.1). */
export const GENRE_ERAS: Readonly<Record<string, readonly string[]>> = { fantasy: ["AN", "MD", "EM"], modern: ["ST", "MO"], scifi: ["NF", "IS"] };
/** The rank of a pair for a sex. */
const rankOf = (pair: [string, string], sex: "male" | "female"): string => (sex === "female" ? pair[1] : pair[0]);
/** `{Graf/Graefin}` in a native form: the man's and the woman's. */
export function resolveSexed(text: string, sex: "male" | "female"): string {
  return text.replace(/\{([^{}/]+)\/([^{}/]+)\}/g, (_m, a: string, b: string) => (sex === "female" ? b : a));
}

const pick = <T>(list: readonly T[], rng: () => number): T => list[Math.min(list.length - 1, Math.floor(rng() * list.length))];
function pickWeighted<T>(items: readonly [T, number][], rng: () => number): T {
  let total = 0;
  for (const [, w] of items) total += w;
  let r = rng() * total;
  for (const [item, w] of items) {
    r -= w;
    if (r <= 0) return item;
  }
  return items[items.length - 1][0];
}

/** Brief 5a §11.3: a noun appears at most twice in a batch. */
const NOUN_LIMIT = 2;

/** A drawer of signature names for one module and culture, one per batch (it remembers the nouns it has used). */
export function signatureDrawer(module: string, culture: string | undefined, frameFilter?: (pattern: string) => boolean, capitalise = true): ((rng: () => number, ctx?: DrawCtx) => string | undefined) | undefined {
  const key = contentKey(culture);
  if (!key) return undefined;
  const parts = sources(module, key).map((p) => ({ ...p, content: { ...p.content, f: frameFilter ? p.content.f.filter(([f]) => frameFilter(f)) : p.content.f } })).filter((p) => p.content.f.length > 0);
  if (parts.length === 0) return undefined;
  const used = new Map<string, number>();
  return (rng, ctx) => {
    for (let attempt = 0; attempt < 12; attempt++) {
      const { content } = pickWeighted(parts.map((p) => [p, p.weight] as [typeof p, number]), rng);
      // 5d §14.1: a fantastic frame only where the setting is fantastic.
      const frames = content.f.filter((f) => tagOk(f[2], ctx));
      if (frames.length === 0) continue;
      const frame = pickWeighted(frames.map((f) => [f[0], f[1]] as [string, number]), rng);
      const chosen: string[] = [];
      let failed = false;
      const text = frame.replace(/\{(N[012]|A|R)\}/g, (_m, slot: string) => {
        if (slot === "R") {
          const pairs = content.r ?? [];
          if (pairs.length === 0) {
            failed = true;
            return "";
          }
          return rankOf(pick(pairs, rng), ctx?.sex ?? (rng() < 0.5 ? "female" : "male"));
        }
        if (slot === "A") {
          const word = pick(content.a, rng);
          chosen.push(word);
          return word;
        }
        const i = Number(slot[1]);
        const list = content.n[i];
        const tags = content.nt?.[i];
        const ok = list.filter((w, j) => tagOk(tags?.[j], ctx));
        const fresh = ok.filter((w) => (used.get(w) ?? 0) < NOUN_LIMIT);
        const pool = fresh.length ? fresh : ok;
        if (pool.length === 0) {
          failed = true;
          return "";
        }
        const word = pick(pool, rng);
        chosen.push(word);
        return word;
      });
      if (failed || text.length > 60) continue;
      for (const w of chosen) used.set(w, (used.get(w) ?? 0) + 1);
      return capitalise ? text.charAt(0).toUpperCase() + text.slice(1) : text;
    }
    return undefined;
  };
}

/**
 * Replaces about `SIGNATURE_SHARE` of a batch's names with the culture's own (§11.3). Names stay unique; a name a module's own
 * check rejects (`allowed`) isn't used. The stream is its own, so the module's draws are the same as before.
 */
export function applySignature<T extends { text: string }>(
  names: T[],
  module: string,
  culture: string | undefined,
  seed: number,
  opts: {
    /** A name a module's own check rejects (or, with the invented link, one with a bracket) isn't used. */
    allowed?: (text: string) => boolean;
    /** How a replaced name is written back (the realms' official and short forms, the vessels' prefix). */
    set?: (n: T, text: string) => T;
    /** The bynames' native forms: the share of replaced names that take one (1 for native, a half for mixed). `all`: every name is a candidate, not just the signature share. */
    native?: { forms: string[]; share: number; all?: boolean };
    /** A name that is left as it is (a registration, a prefix, a pack's). */
    keep?: (n: T) => boolean;
    /** 5d §14.1: what the batch is drawn for (eras, fantastic), and per name (a craft's technology level): the signature words are drawn to fit. */
    ctx?: DrawCtx;
    ctxOf?: (n: T) => DrawCtx | undefined;
    /** 5d §14.1: tribes and kin groups take exactly their share of the names (rounded up) instead of drawing each name's share. */
    quota?: boolean;
  } = {},
): T[] {
  const draw = signatureDrawer(module, culture);
  if (!draw || names.length === 0) return names;
  const extra = opts.allowed ?? (() => true);
  // Brief 5c §13.4: no well-known real group, realm, craft or object.
  const allowed = (text: string) => !isRealGroup(text) && !containsRealGroup(text) && extra(text);
  const set = opts.set ?? ((n: T, text: string): T => ({ ...n, text }));
  const rng = mulberry32((seed ^ 0x5c5c5c5c) >>> 0);
  const seen = new Set(names.map((n) => n.text.toLowerCase()));
  // Tribes: exactly ceil(share × batch) names, at positions the stream picks (a batch of five shows two, not "about two").
  let chosen: Set<number> | undefined;
  if (opts.quota) {
    const idx = names.map((_n, i) => i).filter((i) => !opts.keep?.(names[i]));
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    chosen = new Set(idx.slice(0, Math.min(idx.length, Math.ceil(names.length * SIGNATURE_SHARE))));
  }
  return names.map((n, index) => {
    if (opts.keep?.(n)) return n;
    const nativeAll = !!opts.native?.all && opts.native.forms.length > 0;
    if (chosen) {
      if (!chosen.has(index)) return n;
    } else if (!nativeAll && rng() >= SIGNATURE_SHARE) return n;
    const native = opts.native && opts.native.forms.length > 0 && rng() < opts.native.share;
    const gender = (n as unknown as { gender?: unknown }).gender;
    const sex: "male" | "female" = gender === "male" || gender === "female" ? gender : rng() < 0.5 ? "female" : "male";
    const ctx: DrawCtx = { ...opts.ctx, ...opts.ctxOf?.(n), sex };
    for (let attempt = 0; attempt < 6; attempt++) {
      const text = native ? resolveSexed(pick(opts.native!.forms, rng), sex) : draw(rng, ctx);
      if (!text || seen.has(text.toLowerCase()) || !allowed(text)) continue;
      seen.add(text.toLowerCase());
      return set(n, text);
    }
    return n;
  });
}

/** The module's own nouns and frames for a culture, for the coverage adapters: words per kind, and frames. */
export function signatureRows(module: string): { culture: string; kind: string; words: number; frames: number }[] {
  const m = NORTH5C.modules[module];
  if (!m) return [];
  return Object.entries(m.cultures).flatMap(([culture, c]) => [
    ...c.n.map((l, i) => ({ culture, kind: m.kinds[i], words: l.length, frames: 0 })),
    { culture, kind: "frames", words: 0, frames: c.f.length },
  ]);
}

/** Native forms of a bynames module for a culture (language setting native or mixed only). */
export const nativeForms = (module: string, culture: string | undefined): string[] => (culture ? NORTH5C.native[module]?.[culture] ?? [] : []);

/** The six cultures batch 5c adds to the bynames, realms and peoples rosters (they read the legacy keys' tables: `engineAlias`). */
export const NORTH_5C_CULTURES: { key: string; label: string; guide: string }[] = [
  { key: "welsh", label: "Welsh", guide: "" },
  { key: "scottish", label: "Scottish", guide: "" },
  { key: "irish", label: "Irish", guide: "" },
  { key: "cornish", label: "Cornish", guide: "" },
  { key: "scandinavian", label: "Scandinavian", guide: "" },
  { key: "german", label: "German", guide: "" },
];
/** The invented link leaves no bracket in a name. */
export const noBracket = (text: string): boolean => !text.includes("[");
