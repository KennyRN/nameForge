// World place names (first release). No Obsidian imports.
//
// Each culture builds names its own way — its templates and word lists — and writes them in
// modern English: "New Town", "House of Bastet", "Place of Deer". Proper names stay as proper
// names: gods, saints, founders, and rivers or peoples invented by a Markov model trained on the
// culture's own names. All randomness comes from one seeded stream; Markov models take sub-seeds
// from it, as the river engine does.

import worldData from "../data/world-place-names.json";
import { MarkovModel, mulberry32 } from "../markov";
import { smoothJoin } from "../names/engine";

// ── Data ────────────────────────────────────────────────────────────────────

export interface MarkovSource {
  corpus: string[];
  min: number;
  max: number;
  /** When set, this many names are drawn once per batch and reused, so a batch reads as one region. */
  batch?: number;
  label?: string;
}

export interface WorldEra {
  id: string;
  label: string;
  guide?: string;
  /** Weighted templates: [template, weight]. */
  templates: [string, number][];
  /** Lists that replace the culture's lists of the same name for this era. */
  lists?: Record<string, string[]>;
  markov?: Record<string, MarkovSource>;
}

export interface WorldCulture {
  id: string;
  label: string;
  guide: string;
  /** Chance a "+" compound is fused into one word (when the join is clean and short enough). */
  fuseChance: number;
  lists: Record<string, string[]>;
  markov?: Record<string, MarkovSource>;
  eras: WorldEra[];
}

export interface WorldData {
  version: number;
  labels: Record<string, string>;
  cultures: WorldCulture[];
}

export const WORLD_DATA = worldData as unknown as WorldData;
export const WORLD_CULTURES: readonly WorldCulture[] = WORLD_DATA.cultures;

export const WORLD_PLACE_NAMES = {
  /** Longest fused compound, in letters (matches the names engine). */
  maxFusedLetters: 13,
  /** Draws before a Markov slot gives up on a new name. */
  markovDraws: 20,
  /** Nested list templates deeper than this are not expanded. */
  maxDepth: 4,
} as const;

export function findCulture(id: string | undefined): WorldCulture {
  return WORLD_CULTURES.find((c) => c.id === id) ?? WORLD_CULTURES[0];
}

export function findEra(culture: WorldCulture, eraId: string | undefined): WorldEra {
  return culture.eras.find((e) => e.id === eraId) ?? culture.eras[0];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const pickUniform = <T>(items: readonly T[], rng: () => number): T => items[Math.floor(rng() * items.length)];

function pickWeighted<T>(entries: readonly [T, number][], rng: () => number): T {
  const live = entries.filter(([, w]) => w > 0);
  const total = live.reduce((n, [, w]) => n + w, 0);
  let r = rng() * total;
  for (const [item, w] of live) {
    r -= w;
    if (r < 0) return item;
  }
  return live[live.length - 1][0];
}

const letterCount = (w: string) => Array.from(w.replace(/[^\p{L}]/gu, "")).length;

/** A list entry: "Ox|Oxen" gives an irregular plural; a trailing "~" means it never fuses. */
interface Entry {
  word: string;
  plural?: string;
  noFuse: boolean;
}

function parseEntry(raw: string): Entry {
  const noFuse = raw.endsWith("~");
  const body = noFuse ? raw.slice(0, -1) : raw;
  const [word, plural] = body.split("|");
  return { word, plural, noFuse };
}

/** Regular English plural of the last word: -es after sibilants, -ies after consonant + y. */
export function pluralise(word: string): string {
  if (/(s|x|z|ch|sh)$/i.test(word)) return `${word}es`;
  if (/[^aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
}

/** New Hart's Rules: 's throughout, but an apostrophe alone after names ending -es (Hercules'). */
export function possessive(word: string): string {
  if (/'s?$/.test(word)) return word;
  return /es$/.test(word) && /^\p{Lu}/u.test(word) ? `${word}'` : `${word}'s`;
}

// ── Templates ───────────────────────────────────────────────────────────────

type Token = { kind: "slot"; key: string; form?: "pl" | "pos"; markov: boolean } | { kind: "text"; text: string } | { kind: "fuse" };

const templateCache = new Map<string, Token[]>();

/** "{a}+Ford upon {#river}" → slot, fuse, text, slot. */
export function parseTemplate(template: string): Token[] {
  let tokens = templateCache.get(template);
  if (tokens) return tokens;
  tokens = [];
  for (const m of template.matchAll(/\{(#?)([\w-]+)(?::(pl|pos))?\}|\+|[^{+]+/g)) {
    if (m[0] === "+") tokens.push({ kind: "fuse" });
    else if (m[2] !== undefined) {
      tokens.push({ kind: "slot", key: m[2], form: m[3] as "pl" | "pos" | undefined, markov: m[1] === "#" });
    } else tokens.push({ kind: "text", text: m[0] });
  }
  templateCache.set(template, tokens);
  return tokens;
}

/** One rendered piece: its text, its etymology, and whether it may take part in a fusion. */
interface Piece {
  text: string;
  etym: string;
  fusable: boolean;
}

// ── Markov sources ──────────────────────────────────────────────────────────

const modelCache = new Map<string, MarkovModel>();
function modelFor(source: MarkovSource): MarkovModel {
  const key = source.corpus.join("|");
  let model = modelCache.get(key);
  if (!model) {
    model = MarkovModel.build(source.corpus);
    modelCache.set(key, model);
  }
  return model;
}

const titleWord = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

export interface WorldOptions {
  culture: string;
  era?: string;
  faithfulness?: number;
  strictness?: number;
}

/** Renders names for one culture and era. Holds the batch-level Markov pools. */
export class WorldRenderer {
  readonly culture: WorldCulture;
  readonly era: WorldEra;
  private readonly lists: Record<string, string[]>;
  private readonly markov: Record<string, MarkovSource>;
  private readonly pools = new Map<string, string[]>();
  private readonly notices = new Set<string>();

  constructor(private readonly options: WorldOptions) {
    this.culture = findCulture(options.culture);
    this.era = findEra(this.culture, options.era);
    this.lists = { ...this.culture.lists, ...(this.era.lists ?? {}) };
    this.markov = { ...(this.culture.markov ?? {}), ...(this.era.markov ?? {}) };
  }

  getNotices(): string[] {
    return [...this.notices];
  }

  /** One name: a template by weight, rendered. */
  name(rng: () => number): { text: string; etymology: string; template: string } {
    const template = pickWeighted(this.era.templates, rng);
    const piece = this.render(template, rng, 0);
    const text = piece.text.charAt(0).toUpperCase() + piece.text.slice(1);
    return { text, etymology: piece.etym, template };
  }

  private label(key: string): string {
    return (this.markov[key]?.label ?? WORLD_DATA.labels[key] ?? key).toLowerCase();
  }

  /** A new proper name from a Markov corpus, never one of the corpus's own names. */
  private markovName(key: string, rng: () => number): string {
    const source = this.markov[key];
    if (!source) {
      this.notices.add(`No name source "${key}" for ${this.culture.label}.`);
      return `[${key}]`;
    }
    if (source.batch) {
      let pool = this.pools.get(key);
      if (!pool) {
        pool = [];
        for (let i = 0; i < source.batch; i++) pool.push(this.drawMarkov(source, rng, pool));
        this.pools.set(key, pool);
      }
      return pickUniform(pool, rng);
    }
    return this.drawMarkov(source, rng, []);
  }

  private drawMarkov(source: MarkovSource, rng: () => number, avoid: string[]): string {
    const real = new Set(source.corpus.map((n) => n.toLowerCase()));
    const model = modelFor(source);
    for (let i = 0; i < WORLD_PLACE_NAMES.markovDraws; i++) {
      const seed = Math.floor(rng() * 0x100000000) >>> 0;
      const raw = model.generateDetailed({
        count: 1,
        faithfulness: this.options.faithfulness ?? 2,
        strictness: this.options.strictness ?? 3,
        seed,
      }).names[0];
      if (!raw) continue;
      const name = titleWord(raw.trim());
      const letters = letterCount(name);
      if (letters < source.min || letters > source.max) continue;
      if (real.has(name.toLowerCase()) || avoid.includes(name)) continue;
      return name;
    }
    // Nothing new after every draw: a corpus name stands in (rare; still a real-sounding name).
    return pickUniform(source.corpus, rng);
  }

  /** A list word, expanding any template held in the entry. */
  private slot(token: Extract<Token, { kind: "slot" }>, rng: () => number, depth: number): Piece {
    if (token.markov) {
      const name = this.markovName(token.key, rng);
      const text = token.form === "pos" ? possessive(name) : name;
      return { text, etym: `[${this.label(token.key)}: ${name}]${token.form === "pos" ? possessiveTail(name) : ""}`, fusable: false };
    }
    const list = this.lists[token.key];
    if (!list || list.length === 0) {
      this.notices.add(`No word list "${token.key}" for ${this.culture.label}.`);
      return { text: `[${token.key}]`, etym: `[${token.key}]`, fusable: false };
    }
    const entry = parseEntry(pickUniform(list, rng));
    if (entry.word.includes("{") && depth < WORLD_PLACE_NAMES.maxDepth) {
      const inner = this.render(entry.word, rng, depth + 1);
      const single = /^\{[^}]+\}$/.test(entry.word);
      const text = token.form === "pos" ? possessive(inner.text) : inner.text;
      const etym = single ? inner.etym : `[${this.label(token.key)}: ${inner.text}]`;
      return { text, etym: token.form === "pos" ? `${etym}${possessiveTail(inner.text)}` : etym, fusable: single && inner.fusable };
    }
    let text = entry.word;
    if (token.form === "pl") text = entry.plural ?? pluralise(entry.word);
    if (token.form === "pos") text = possessive(entry.word);
    const shown = token.form === "pos" ? entry.word : text;
    return {
      text,
      etym: `[${this.label(token.key)}: ${shown}]${token.form === "pos" ? possessiveTail(entry.word) : ""}`,
      fusable: !entry.noFuse && token.form !== "pos",
    };
  }

  /** Renders a template: slots filled, "+" groups fused or spaced. */
  private render(template: string, rng: () => number, depth: number): Piece {
    const tokens = parseTemplate(template);
    // Group pieces joined by "+" so each group can fuse as a whole.
    const out: Piece[] = [];
    let group: Piece[] = [];
    let joinNext = false;
    const flush = () => {
      if (group.length === 0) return;
      out.push(group.length === 1 ? group[0] : this.fuse(group, rng));
      group = [];
    };
    for (const token of tokens) {
      if (token.kind === "fuse") {
        joinNext = true;
        continue;
      }
      let piece: Piece;
      if (token.kind === "text") piece = { text: token.text, etym: token.text.toLowerCase(), fusable: !/\s/.test(token.text) };
      else piece = this.slot(token, rng, depth);
      if (!joinNext) flush();
      group.push(piece);
      joinNext = false;
    }
    flush();
    return {
      text: out.map((p) => p.text).join(""),
      etym: out.map((p) => p.etym).join(""),
      fusable: out.length === 1 && out[0].fusable,
    };
  }

  /** "Ox" + "Ford" → "Oxford" when the culture fuses and the join is clean; otherwise "Ox Ford". */
  private fuse(group: Piece[], rng: () => number): Piece {
    const etym = group.map((p) => p.etym).join(" + ");
    const roll = rng();
    const canFuse =
      roll < this.culture.fuseChance &&
      group.every((p) => p.fusable && /^[\p{L}]+$/u.test(p.text));
    if (canFuse) {
      let joined: string | null = group[0].text;
      for (const p of group.slice(1)) {
        joined = joined === null ? null : smoothJoin(joined, p.text);
      }
      if (joined !== null && letterCount(joined) <= WORLD_PLACE_NAMES.maxFusedLetters) {
        return { text: joined.charAt(0).toUpperCase() + joined.slice(1).toLowerCase(), etym, fusable: false };
      }
    }
    return { text: group.map((p) => p.text).join(" "), etym, fusable: false };
  }
}

const possessiveTail = (word: string) => possessive(word).slice(word.length);

// ── Public ──────────────────────────────────────────────────────────────────

export interface WorldName {
  text: string;
  etymology: string;
  template: string;
}

export interface WorldBatchResult {
  names: WorldName[];
  seed: number;
  notices: string[];
}

/** `count` distinct names (case-insensitive), at most count × 50 attempts. Same seed = same batch. */
export function generateWorldPlaceNames(options: WorldOptions & { count: number; seed?: number }): WorldBatchResult {
  const seed =
    options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  const renderer = new WorldRenderer(options);
  const count = Math.max(0, Math.floor(options.count));
  const seen = new Set<string>();
  const names: WorldName[] = [];
  for (let attempt = 0; attempt < count * 50 && names.length < count; attempt++) {
    const name = renderer.name(rng);
    const key = name.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  const notices = renderer.getNotices();
  if (names.length < count) notices.push(`Only ${names.length} names could be generated.`);
  return { names, seed, notices };
}

/** History label: "world place names · Egyptian · Pharaonic" (the era only where there is a choice). */
export function worldHistoryLabel(base: string, cultureId: string, eraId?: string): string {
  const culture = findCulture(cultureId);
  const era = findEra(culture, eraId);
  return culture.eras.length > 1 ? `${base} · ${culture.label} · ${era.label}` : `${base} · ${culture.label}`;
}
