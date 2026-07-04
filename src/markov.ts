// markov.ts
//
// Markov name generator — a faithful TypeScript port of the Swift
// `MarkovModel` (Models.swift), designed to build its model at runtime from a
// plain list of source names, and a markdown extractor that pulls those names
// out of `.md` file contents.
//
// WHY THIS IS BETTER THAN THE OLD markov.ts
// -----------------------------------------
// The previous port was a single fixed order-2 chain with a broken (empty)
// end-of-name sentinel and blunt heuristic filtering. This version reproduces
// the Swift model's actual quality levers:
//
//   * Interpolated variable-order model. Tables for orders k = 0..3 are built
//     at once and blended per step, each order weighted by wbase^k. This is a
//     smoothed, back-off style model rather than a brittle single order.
//   * Real boundary learning. Every name is bracketed with ^ … $, so the model
//     learns how names start AND where they genuinely end (no fixed-length cap
//     doing the job by accident).
//   * Perplexity band. Each candidate's per-character perplexity is computed
//     from real probabilities and must fall inside a min/max window. This
//     rejects gibberish (too improbable) and bland/near-copy names (too
//     predictable) — the single biggest driver of "good" output.
//   * Two control axes: `faithfulness` (how strongly higher orders dominate)
//     and `strictness` (the perplexity window). Both come straight from Swift.
//
// INTEGRATION (Obsidian) — for whoever wires this into the plugin
// ---------------------------------------------------------------
//   1. Read the source note(s):
//        const text = await this.app.vault.cachedRead(file);      // one file
//        // or gather several files' contents into a string[].
//   2. Extract names and build the model (rebuilt from the list each time —
//      cheap for name-sized lists, no need to persist the model):
//        const names = extractNamesFromMarkdown(text);            // string | string[]
//        const model = MarkovModel.build(names);
//   3. Generate:
//        const results = model.generate({ count: 20, faithfulness: 2, strictness: 3 });
//
//   Or the one-liner convenience:
//        const results = buildModelFromMarkdown(text)
//                          .generate({ count: 20, faithfulness: 2, strictness: 3 });
//
// API MAPPING from the old markov.ts
// ----------------------------------
//   old: new MarkovGenerator(2).train(names);
//        gen.generateMultiple(count, maxLength, strictness, sourceNames)
//   new: MarkovModel.build(names)
//        model.generate({ count, faithfulness, strictness })
//
//   `maxLength` is no longer a caller argument — it's derived from the source
//   names (like Swift), which is part of why the output feels right.
//
//   `ListGenerator` (the "pick whole names" generator) is carried over
//   unchanged at the bottom; it was already correct.

// ---------------------------------------------------------------------------
// Boundary markers. These must never appear inside a real name; `^` and `$`
// are safe for onomastic data.
// ---------------------------------------------------------------------------
const START = "^";
const END = "$";
const KMAX = 3;

export interface GenerateOptions {
  /** How many names to return. */
  count: number;
  /**
   * 1..3. Higher = higher-order context dominates, so output hugs the source
   * style more closely. Maps to wbase = [2.5, 4.0, 7.0]. Default 2.
   */
  faithfulness?: number;
  /**
   * 1..5. Widens/narrows the perplexity acceptance window. Higher = fussier
   * (rejects both odd and over-generic names). Default 3.
   */
  strictness?: number;
}

/**
 * A trained name model. Built with `MarkovModel.build(names)` and queried with
 * `generate(...)`. The tables live in memory for the session; rebuild whenever
 * the source list changes (it's cheap).
 */
export class MarkovModel {
  /** tables[k] : Map<context, Map<nextChar, count>>. k = 0 is the unigram. */
  private readonly tables: Array<Map<string, Map<string, number>>>;
  readonly minLength: number;
  readonly maxLength: number;
  private readonly kmax = KMAX;

  private constructor(
    tables: Array<Map<string, Map<string, number>>>,
    minLength: number,
    maxLength: number
  ) {
    this.tables = tables;
    this.minLength = minLength;
    this.maxLength = maxLength;
  }

  /**
   * Build the interpolated model from a list of names. Names are lowercased;
   * casing is reapplied (first letter only) at generation time, matching Swift.
   */
  static build(names: string[]): MarkovModel {
    const tables: Array<Map<string, Map<string, number>>> = [
      new Map(),
      new Map(),
      new Map(),
      new Map(),
    ];

    const lowerNames = names
      .map((n) => n.trim().toLowerCase())
      .filter((n) => n.length > 0);

    let minL = Number.POSITIVE_INFINITY;
    let maxL = 0;

    for (const name of lowerNames) {
      const chars = Array.from(name); // code-point safe
      minL = Math.min(minL, chars.length);
      maxL = Math.max(maxL, chars.length);

      // Bracketed sequence: ^ + name + $  (as an array of single chars).
      const s = [START, ...chars, END];

      // For each position i (skipping the leading ^), record the transition
      // context -> s[i] for every order k = 0..3 that fits.
      for (let i = 1; i < s.length; i++) {
        const ch = s[i];
        for (let k = 0; k <= KMAX; k++) {
          if (i - k < 0) continue;
          const ctx = k === 0 ? "~" : s.slice(i - k, i).join("");
          let table = tables[k].get(ctx);
          if (!table) {
            table = new Map();
            tables[k].set(ctx, table);
          }
          table.set(ch, (table.get(ch) ?? 0) + 1);
        }
      }
    }

    if (!isFinite(minL)) minL = 3; // empty input — harmless defaults
    const minLength = Math.max(2, minL);
    const maxLength = Math.min(15, maxL + 1);
    return new MarkovModel(tables, minLength, maxLength);
  }

  /**
   * Generate up to `count` unique names. Returns fewer than requested only if
   * the model is too small/strict to produce them within the attempt budget.
   */
  generate(options: GenerateOptions): string[] {
    const count = Math.max(0, Math.floor(options.count));
    const faithfulness = clampInt(options.faithfulness ?? 2, 1, 3);
    const strictness = clampInt(options.strictness ?? 3, 1, 5);

    const wbase = [2.5, 4.0, 7.0][faithfulness - 1];
    const [minP, maxP] = strictnessBounds(strictness);

    const result: string[] = [];
    const seen = new Set<string>();
    let tries = 0;
    const maxTries = count * 300;

    while (result.length < count && tries < maxTries) {
      tries++;
      const name: string[] = [START];
      let logp = 0;

      while (name.length - 1 < this.maxLength) {
        const distribution = this.buildDistribution(name, wbase);
        if (distribution.size === 0) break;
        const [ch, p] = pickWeighted(distribution);

        if (ch === END) {
          if (name.length - 1 < this.minLength) {
            // Too short to stop — resample excluding the end marker.
            const noEnd = new Map(distribution);
            noEnd.delete(END);
            if (noEnd.size === 0) break;
            const [ch2, p2] = pickWeighted(noEnd);
            name.push(ch2);
            logp += Math.log(p2);
          } else {
            break; // accept the end
          }
        } else {
          name.push(ch);
          logp += Math.log(Math.max(p, 0.0001));
        }
      }

      // Strip the leading ^ and any stray $.
      const w = name
        .slice(1)
        .filter((c) => c !== END)
        .join("");
      const wLen = Array.from(w).length;

      if (wLen < this.minLength) continue;
      if (hasRepeat(w)) continue;

      const perp = Math.exp(-logp / Math.max(1, wLen));
      if (!(perp <= maxP && perp >= minP)) continue;
      if (seen.has(w)) continue;

      seen.add(w);
      result.push(capitaliseFirst(w));
    }

    return result;
  }

  /**
   * Blend the k = 0..3 tables for the current context into a single
   * next-character distribution, each order weighted by wbase^k. Missing
   * higher-order contexts simply drop out (back-off).
   */
  private buildDistribution(
    context: string[],
    wbase: number
  ): Map<string, number> {
    const scores = new Map<string, number>();
    for (let k = 0; k <= this.kmax; k++) {
      const sub = k > 0 ? context.slice(-k).join("") : "~";
      const d = this.tables[k].get(sub);
      if (!d) continue;

      let tot = 0;
      for (const v of d.values()) tot += v;
      if (tot === 0) continue;

      const w = Math.pow(wbase, k);
      for (const [ch, cnt] of d) {
        scores.set(ch, (scores.get(ch) ?? 0) + w * (cnt / tot));
      }
    }
    return scores;
  }
}

// ---------------------------------------------------------------------------
// Generation helpers (ports of the Swift privates)
// ---------------------------------------------------------------------------

/**
 * Weighted random pick over a score map. Returns the chosen character and its
 * normalised probability (used for the perplexity accumulation). Entries are
 * sorted by key for stable, reproducible draws.
 */
function pickWeighted(dist: Map<string, number>): [string, number] {
  let tot = 0;
  for (const v of dist.values()) tot += v;

  const entries = Array.from(dist.entries()).sort((a, b) =>
    a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
  );

  let r = Math.random() * tot;
  for (const [ch, score] of entries) {
    r -= score;
    if (r <= 0) return [ch, score / tot];
  }
  const first = entries[0];
  return [first ? first[0] : END, 0.001];
}

/**
 * Reject names containing an immediately repeated block of 2 or 3 characters
 * (e.g. "anan", "abcabc"). Stricter than the old triple-single-char check.
 */
function hasRepeat(w: string): boolean {
  const chars = Array.from(w);
  const n = chars.length;
  for (let L = 2; L <= 3; L++) {
    if (n < 2 * L) continue;
    for (let i = 0; i <= n - 2 * L; i++) {
      let equal = true;
      for (let j = 0; j < L; j++) {
        if (chars[i + j] !== chars[i + L + j]) {
          equal = false;
          break;
        }
      }
      if (equal) return true;
    }
  }
  return false;
}

/** Per-character perplexity window keyed by strictness (1..5). */
function strictnessBounds(s: number): [number, number] {
  const minP = [1.0, 1.15, 1.3, 1.45, 1.6][s - 1];
  const maxP = [9.0, 7.5, 6.5, 5.5, 4.8][s - 1];
  return [minP, maxP];
}

function clampInt(x: number, lo: number, hi: number): number {
  const r = Math.round(x);
  return Math.max(lo, Math.min(hi, r));
}

export function capitaliseFirst(w: string): string {
  const arr = Array.from(w);
  if (arr.length === 0) return w;
  return arr[0].toUpperCase() + arr.slice(1).join("");
}

// ===========================================================================
// Markdown — names
// ===========================================================================
//
// Reads a clean list of source names out of markdown content. Handles the
// layouts you'd actually keep name lists in:
//
//   * one name per line
//   * bullet / numbered / checklist items:  - Name   * Name   1. Name   - [ ] Name
//   * comma/semicolon/pipe/slash-separated lists on a line, plus "and"/"or"/
//     "nor"/"&"/"+"-joined names anywhere in the text (not just at the end)
//   * Obsidian wikilinks and markdown links:  [[Aelfric]]  [[target|Display]]  [text](url)
//
// It strips: YAML frontmatter, fenced code blocks, headings, horizontal rules,
// blockquote/list markers, emphasis/inline-code markup, Obsidian %%comments%%,
// and joiner words ("and"/"or"/"&"/"etc"). Prose paragraphs with commas will be
// split on those commas — keep source files as name lists, not running prose.

const NOISE = new Set([
  "and",
  "or",
  "nor",
  "&",
  "+",
  "etc",
  "etcetera",
  "&c",
]);
const JOINERS = [" and ", " or ", " nor ", " & ", " + "];
const LEADERS = ["and ", "or ", "nor ", "& ", "+ "];

/**
 * Extract names from one markdown string, or from several (their results are
 * concatenated and de-duplicated case-insensitively).
 */
export function extractNamesFromMarkdown(markdown: string | string[]): string[] {
  const sources = Array.isArray(markdown) ? markdown : [markdown];
  const all: string[] = [];
  for (const src of sources) all.push(...extractFromSingle(src));
  return dedupe(all);
}

/** Convenience: extract + build in one call. */
export function buildModelFromMarkdown(
  markdown: string | string[]
): MarkovModel {
  return MarkovModel.build(extractNamesFromMarkdown(markdown));
}

function extractFromSingle(markdown: string): string[] {
  const withoutFrontmatter = stripFrontmatter(markdown);
  const withoutCode = stripFencedCode(withoutFrontmatter);
  const lines = withoutCode.split(/\r?\n/);

  const cleanedLines: string[] = [];
  for (const rawLine of lines) {
    let line = rawLine.trim();
    if (line === "") continue;

    if (/^#{1,6}\s/.test(line)) continue; // heading
    if (/^([-*_])(\s*\1){2,}$/.test(line)) continue; // horizontal rule
    if (/^[\s|:\-]+$/.test(line) && line.includes("-")) continue; // table separator

    line = line.replace(/^>+\s?/, ""); // blockquote
    line = line.replace(/^(?:[-*+]|\d+[.)])\s+/, ""); // list bullet / number
    line = line.replace(/^\[[ xX]\]\s+/, ""); // checkbox
    line = stripInlineMarkup(line);
    line = line.trim();

    if (line !== "") cleanedLines.push(line);
  }

  return parseNameTokens(cleanedLines.join("\n"));
}

function stripFrontmatter(md: string): string {
  const m = md.match(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? md.slice(m[0].length) : md;
}

function stripFencedCode(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/~~~[\s\S]*?~~~/g, "");
}

function stripInlineMarkup(s: string): string {
  let t = s;
  t = t.replace(/%%[\s\S]*?%%/g, ""); // Obsidian comments
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ""); // images
  // Wikilinks: [[target|display]] -> display, [[target]] -> target
  t = t.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_m, target: string, display?: string) => (display ?? target)
  );
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"); // [text](url) -> text
  t = t.replace(/`([^`]*)`/g, "$1"); // inline code
  t = t.replace(/(\*\*|__|\*|_|~~)/g, ""); // bold / italic / strike
  return t;
}

/**
 * Split a cleaned block into individual names. Commas, newlines, semicolons,
 * pipes, and slashes always separate; any "and"/"or"/"nor"/"&"/"+" joiner is
 * split wherever it appears (not just at the end of a line); noise tokens
 * ("and", "&", "etc") are dropped.
 */
function parseNameTokens(text: string): string[] {
  const rawTokens = text
    .split(/[\n,;|\/]/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const tokens: string[] = [];
  for (const token of rawTokens) {
    tokens.push(...splitOnJoiners(token));
  }

  const names: string[] = [];
  for (const token of tokens) {
    const cleaned = cleanToken(stripLeadingConjunction(token));
    if (cleaned === "" || isNoise(cleaned)) continue;
    names.push(cleaned);
  }
  return dedupe(names);
}

/**
 * Recursively split a token on every joiner occurrence ("and"/"or"/"nor"/"&"/"+"),
 * e.g. "Alice and Bob and Carol" -> ["Alice", "Bob", "Carol"]. Applied to every
 * token (not just the last one), matching the old normalizeNamesInput's
 * per-line splitting behavior.
 */
function splitOnJoiners(token: string): string[] {
  const lower = token.toLowerCase();
  for (const joiner of JOINERS) {
    const idx = lower.indexOf(joiner);
    if (idx >= 0) {
      const left = token.slice(0, idx).trim();
      const right = token.slice(idx + joiner.length).trim();
      const parts: string[] = [];
      if (left !== "") parts.push(...splitOnJoiners(left));
      if (right !== "") parts.push(...splitOnJoiners(right));
      if (parts.length > 0) return parts;
    }
  }
  return [token];
}

function stripLeadingConjunction(token: string): string {
  const lower = token.toLowerCase();
  for (const lead of LEADERS) {
    if (lower.startsWith(lead)) return token.slice(lead.length).trim();
  }
  return token;
}

/**
 * Trim whitespace, trailing list punctuation, and matched surrounding quotes.
 * Apostrophes inside a name (O'Donovan) are preserved.
 */
function cleanToken(s: string): string {
  let t = s.trim();
  while (t.length > 0 && (t.endsWith(";") || t.endsWith(","))) {
    t = t.slice(0, -1);
  }
  t = t.trim();

  const quotePairs: Array<[string, string]> = [
    ['"', '"'],
    ["“", "”"],
    ["'", "'"],
  ];
  for (const [open, close] of quotePairs) {
    if (t.length >= 2 && t.startsWith(open) && t.endsWith(close)) {
      t = t.slice(open.length, t.length - close.length);
      break;
    }
  }
  return t.trim();
}

function isNoise(s: string): boolean {
  const t = s.toLowerCase().replace(/^[.\s…]+|[.\s…]+$/g, "");
  return t === "" || t === "..." || NOISE.has(t);
}

function dedupe(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of names) {
    const key = n.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(n);
    }
  }
  return out;
}

// ===========================================================================
// ListGenerator — carried over unchanged (picks whole names verbatim).
// Kept here so this file is a drop-in replacement for the old markov.ts.
// ===========================================================================
export class ListGenerator {
  private names: string[] = [];

  train(names: string[]): void {
    this.names = names.filter((name) => name.trim().length > 0);
  }

  generateMultiple(count: number): string[] {
    const uniqueNames = Array.from(new Set(this.names));
    if (uniqueNames.length === 0) return [];

    const generated: string[] = [];
    while (generated.length < count && generated.length < uniqueNames.length) {
      const name =
        uniqueNames[Math.floor(Math.random() * uniqueNames.length)];
      if (!generated.includes(name)) generated.push(name);
    }
    return generated;
  }
}

// ===========================================================================
// Compound names — 2 or 3 independently-generated parts, joined either fused
// into one word ("joined") or kept as separate words ("spaced").
// ===========================================================================
export interface CompoundGenerateOptions {
  count: number;
  generator: "breakdown" | "list";
  joining: "joined" | "spaced";
  faithfulness?: number;
  strictness?: number;
}

function joinCompoundParts(fragments: string[], joining: "joined" | "spaced"): string {
  if (joining === "spaced") {
    return fragments.map((f) => capitaliseFirst(f)).join(" ");
  }
  return fragments
    .map((f, i) => (i === 0 ? capitaliseFirst(f.toLowerCase()) : f.toLowerCase()))
    .join("");
}

/**
 * Build a compound-name generator from 2 or 3 lists of name fragments (one
 * list per "part"/column), and return `count` unique joined results.
 */
export function generateCompoundNames(parts: string[][], options: CompoundGenerateOptions): string[] {
  const count = Math.max(0, Math.floor(options.count));
  if (count === 0 || parts.length < 2) return [];

  const poolSize = Math.max(count, 30);
  const pools: string[][] = parts.map((part) => {
    if (part.length === 0) return [];
    if (options.generator === "list") {
      const generator = new ListGenerator();
      generator.train(part);
      return generator.generateMultiple(poolSize);
    }
    const model = MarkovModel.build(part);
    return model.generate({
      count: poolSize,
      faithfulness: options.faithfulness ?? 2,
      strictness: options.strictness ?? 3,
    });
  });

  if (pools.some((pool) => pool.length === 0)) return [];

  const result: string[] = [];
  const seen = new Set<string>();
  let tries = 0;
  const maxTries = count * 300;

  while (result.length < count && tries < maxTries) {
    tries++;
    const fragments = pools.map((pool) => pool[Math.floor(Math.random() * pool.length)]);
    const name = joinCompoundParts(fragments, options.joining);
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }

  return result;
}
