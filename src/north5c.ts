// Northern Europe tables brief, batch 5c: the batch's own data (src/data/north5c.json, written by scripts/make-north5c.mjs) and what the
// engines and coverage adapters share: the signature names of the seven core cultures and Celtic in the group families, tribes and kin
// groups, the bynames modules, realms, peoples and tongues, ships, aircraft and land vehicles. A culture's own frames take
// `SIGNATURE_SHARE` of a batch's names (§11.3); the rest come from the module's own draw. No Obsidian imports.

import north from "./data/north5c.json";
import { mulberry32 } from "./markov";
import { SIGNATURE_SHARE } from "./northData";
import { isRealGroup } from "./realPlaces";

type Frame = [string, number];
interface CultureContent {
  /** The three lists of nouns, one per kind of the module. */
  n: string[][];
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
export function signatureDrawer(module: string, culture: string | undefined, frameFilter?: (pattern: string) => boolean, capitalise = true): ((rng: () => number) => string | undefined) | undefined {
  const key = contentKey(culture);
  if (!key) return undefined;
  const parts = sources(module, key).map((p) => ({ ...p, content: { ...p.content, f: frameFilter ? p.content.f.filter(([f]) => frameFilter(f)) : p.content.f } })).filter((p) => p.content.f.length > 0);
  if (parts.length === 0) return undefined;
  const used = new Map<string, number>();
  return (rng) => {
    for (let attempt = 0; attempt < 12; attempt++) {
      const { content } = pickWeighted(parts.map((p) => [p, p.weight] as [typeof p, number]), rng);
      const frame = pickWeighted(content.f, rng);
      const chosen: string[] = [];
      const text = frame.replace(/\{(N[012]|A)\}/g, (_m, slot: string) => {
        const list = slot === "A" ? content.a : content.n[Number(slot[1])];
        const fresh = list.filter((w) => (used.get(w) ?? 0) < NOUN_LIMIT);
        const word = pick(fresh.length ? fresh : list, rng);
        chosen.push(word);
        return word;
      });
      if (text.length > 60) continue;
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
  } = {},
): T[] {
  const draw = signatureDrawer(module, culture);
  if (!draw || names.length === 0) return names;
  const extra = opts.allowed ?? (() => true);
  // Brief 5c §13.4: no well-known real group, realm, craft or object.
  const allowed = (text: string) => !isRealGroup(text) && extra(text);
  const set = opts.set ?? ((n: T, text: string): T => ({ ...n, text }));
  const rng = mulberry32((seed ^ 0x5c5c5c5c) >>> 0);
  const seen = new Set(names.map((n) => n.text.toLowerCase()));
  return names.map((n) => {
    if (opts.keep?.(n)) return n;
    const nativeAll = !!opts.native?.all && opts.native.forms.length > 0;
    if (!nativeAll && rng() >= SIGNATURE_SHARE) return n;
    const native = opts.native && opts.native.forms.length > 0 && rng() < opts.native.share;
    for (let attempt = 0; attempt < 6; attempt++) {
      const text = native ? pick(opts.native!.forms, rng) : draw(rng);
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
