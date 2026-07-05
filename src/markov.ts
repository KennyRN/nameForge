// markov.ts
//
// Markov name generator — interpolated variable-order model built at runtime
// from a plain list of source names, plus a markdown extractor that pulls
// those names out of `.md` file contents.
//
// WHAT CHANGED IN THIS REVISION (quality + speed)
// -----------------------------------------------
// The previous version had the right architecture (orders 0..3 blended per
// step, ^…$ boundary learning, perplexity gate). This revision fixes its four
// real weaknesses:
//
//   1. NATURAL ENDINGS ONLY. Before, a name that hit maxLength mid-pattern was
//      accepted as-is, producing chopped-off endings ("Aldwic" → "Aldwi").
//      Now a candidate is only accepted if the model itself chose the end
//      marker, so every name ends the way source names actually end.
//
//   2. EVIDENCE-WEIGHTED BLENDING. Before, an order-3 context seen exactly
//      once in the source got probability 1.0 at weight wbase³ (up to 343×),
//      so generation frequently traced source names verbatim. Each order's
//      weight is now scaled by a Witten–Bell confidence factor
//      tot / (tot + distinct): thin evidence defers to lower orders, rich
//      evidence dominates as before. Output is noticeably more novel while
//      still on-style.
//
//   3. NO SOURCE COPIES. Generated names identical to a source name are
//      rejected by default (set `allowSourceCopies: true` to permit them).
//
//   4. SPEED. Blended distributions are now computed once per unique context
//      and cached as flat arrays with a cumulative-sum sampler (the old code
//      re-blended maps and SORTED the distribution on every single character).
//      Rebuilding the model from the list on every call remains the intended
//      usage — build is O(total chars) and takes well under a millisecond for
//      name-list-sized corpora.
//
// INTEGRATION (Obsidian)
// ----------------------
//   1. Read the source note(s):
//        const text = await this.app.vault.cachedRead(file);
//   2. Extract names and build the model (rebuilt from the list each time —
//      cheap, no need to persist anything):
//        const names = extractNamesFromMarkdown(text);   // string | string[]
//        const model = MarkovModel.build(names);
//   3. Generate:
//        const results = model.generate({ count: 20, faithfulness: 2, strictness: 3 });
//
//   Or the one-liner convenience:
//        const results = buildModelFromMarkdown(text)
//                          .generate({ count: 20, faithfulness: 2, strictness: 3 });

// ---------------------------------------------------------------------------
// Boundary markers. These must never appear inside a real name; `^` and `$`
// are safe for onomastic data.
// ---------------------------------------------------------------------------
const START = "^";
const END = "$";
const KMAX = 3;
const UNIGRAM_KEY = "~";

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
  /**
   * If true, a generated name may be identical to a source name.
   * Default false — the whole point is usually novel names.
   */
  allowSourceCopies?: boolean;
  /**
   * 0..3. Rejects any generated name within this many edits of a source
   * name, so every result is guaranteed at least `novelty + 1` edits away.
   * Default 0 — close-to-original allowed; only exact copies are rejected
   * (and even those pass if `allowSourceCopies` is true). Set 1 to reject
   * one-letter-off names like "Aelfrid" (vs "Aelfric"); 2–3 push further
   * still. Values above 0 always reject exact copies, regardless of
   * `allowSourceCopies`.
   */
  novelty?: number;
  /**
   * RNG seed (any finite number). Same seed + same source list + same options
   * = identical output, so results are reproducible. Omit for a random seed —
   * the seed actually used is always returned by `generateDetailed`.
   */
  seed?: number;
}

export interface GenerateResult {
  names: string[];
  /**
   * The seed that produced `names`.
   *
   * UI NOTE (for whoever wires this into the plugin): render this in a
   * read-only "Seed" display box directly BENEATH the output box, with a
   * copy button, and provide an optional seed input so the user can paste a
   * seed back in to reproduce a previous batch. Pass that input through as
   * `options.seed`.
   */
  seed: number;
}

/** A blended next-character distribution, cached per context. */
interface Dist {
  chars: string[]; // candidate characters (may include END)
  cum: Float64Array; // cumulative blended scores, same length as chars
  tot: number; // total blended score
  endScore: number; // blended score of END (0 if absent)
  endProb: number; // endScore / tot
}

/**
 * A trained name model. Built with `MarkovModel.build(names)` and queried with
 * `generate(...)`. The tables live in memory for the session; rebuild whenever
 * the source list changes (it's cheap).
 */
export class MarkovModel {
  /** tables[k] : Map<context, Map<nextChar, count>>. k = 0 is the unigram. */
  private readonly tables: Array<Map<string, Map<string, number>>>;
  /** Lowercased source names, for copy rejection. */
  private readonly sourceSet: Set<string>;
  /** Source names bucketed by length, for edit-distance (novelty) checks. */
  private readonly sourceByLength: Map<number, string[]>;
  readonly minLength: number;
  readonly maxLength: number;
  /** First characters of source names — phonotactic gate. */
  private readonly initials: Set<string>;
  /** First-two-character sequences of source names — phonotactic gate. */
  private readonly startBigrams: Set<string>;
  /** Character bigrams seen anywhere inside source names — phonotactic gate. */
  private readonly bigrams: Set<string>;

  /** Blended-distribution cache. Valid only for `cacheWbase`. */
  private distCache = new Map<string, Dist | null>();
  private cacheWbase = Number.NaN;

  private constructor(
    tables: Array<Map<string, Map<string, number>>>,
    sourceSet: Set<string>,
    minLength: number,
    maxLength: number,
    initials: Set<string>,
    startBigrams: Set<string>,
    bigrams: Set<string>
  ) {
    this.tables = tables;
    this.sourceSet = sourceSet;
    this.minLength = minLength;
    this.maxLength = maxLength;
    this.sourceByLength = bucketByLength(sourceSet);
    this.initials = initials;
    this.startBigrams = startBigrams;
    this.bigrams = bigrams;
  }

  /**
   * Build the interpolated model from a list of names. Names are lowercased;
   * casing is reapplied (first letter only) at generation time.
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

    const sourceSet = new Set(lowerNames);

    let minL = Number.POSITIVE_INFINITY;
    let maxL = 0;

    const initials = new Set<string>();
    const startBigrams = new Set<string>();
    const bigrams = new Set<string>();

    for (const name of lowerNames) {
      const chars = Array.from(name); // code-point safe
      minL = Math.min(minL, chars.length);
      maxL = Math.max(maxL, chars.length);

      initials.add(chars[0]);
      if (chars.length >= 2) startBigrams.add(chars[0] + chars[1]);
      for (let i = 1; i < chars.length; i++) {
        bigrams.add(chars[i - 1] + chars[i]);
      }

      // Bracketed sequence: ^ + name + $  (as an array of single chars).
      const s = [START, ...chars, END];

      // For each position i (skipping the leading ^), record the transition
      // context -> s[i] for every order k = 0..KMAX that fits.
      for (let i = 1; i < s.length; i++) {
        const ch = s[i];
        for (let k = 0; k <= KMAX; k++) {
          if (i - k < 0) continue;
          const ctx = k === 0 ? UNIGRAM_KEY : s.slice(i - k, i).join("");
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
    return new MarkovModel(
      tables,
      sourceSet,
      minLength,
      maxLength,
      initials,
      startBigrams,
      bigrams
    );
  }

  /**
   * Generate up to `count` unique names. Returns fewer than requested only if
   * the model is too small/strict to produce them within the attempt budget.
   * Convenience wrapper — use `generateDetailed` when the UI needs the seed.
   */
  generate(options: GenerateOptions): string[] {
    return this.generateDetailed(options).names;
  }

  /**
   * As `generate`, but also returns the RNG seed that was used, so the UI can
   * display it (see the UI NOTE on `GenerateResult`) and the batch can be
   * reproduced later by passing the same seed back in.
   */
  generateDetailed(options: GenerateOptions): GenerateResult {
    const count = Math.max(0, Math.floor(options.count));
    const faithfulness = clampInt(options.faithfulness ?? 2, 1, 3);
    const strictness = clampInt(options.strictness ?? 3, 1, 5);
    const allowCopies = options.allowSourceCopies ?? false;
    const novelty = clampInt(options.novelty ?? 0, 0, 3);
    const seed =
      options.seed !== undefined && Number.isFinite(options.seed)
        ? options.seed >>> 0
        : (Math.random() * 0xffffffff) >>> 0;
    const rng = mulberry32(seed);

    const wbase = [2.5, 4.0, 7.0][faithfulness - 1];
    const [minP, maxP] = strictnessBounds(strictness);
    this.ensureCache(wbase);

    const result: string[] = [];
    const seen = new Set<string>();
    let tries = 0;
    const maxTries = Math.max(1000, count * 300);

    while (result.length < count && tries < maxTries) {
      tries++;
      const w = this.trySampleWord(rng, wbase, minP, maxP);
      if (w === null) continue;
      if (!this.validPhonotactics(w)) continue;

      if (!allowCopies && this.sourceSet.has(w)) continue;
      if (seen.has(w)) continue;

      // Novelty gate (last, as it's the dearest check): reject anything
      // within `novelty` edits of a source name.
      if (
        novelty > 0 &&
        tooCloseToAny(w, Array.from(w).length, this.sourceByLength, novelty)
      )
        continue;

      seen.add(w);
      result.push(capitaliseFirst(w));
    }

    return { names: result, seed };
  }

  /**
   * @internal Reset the blended-distribution cache if `wbase` changed.
   * Must be called before a run of `trySampleWord` calls.
   */
  ensureCache(wbase: number): void {
    if (wbase !== this.cacheWbase) {
      this.distCache.clear();
      this.cacheWbase = wbase;
    }
  }

  /**
   * @internal One sampling attempt. Returns a lowercase word that ended
   * naturally and passed the length / repeat / perplexity gates, or null.
   * Copy-rejection, batch dedupe, novelty, and capitalisation are the
   * caller's job. Call `ensureCache(wbase)` before a run of attempts.
   */
  trySampleWord(
    rng: () => number,
    wbase: number,
    minP: number,
    maxP: number
  ): string | null {
    const name: string[] = [START];
    let logp = 0;
    let ended = false;

    while (name.length - 1 < this.maxLength) {
      const dist = this.getDist(name, wbase);
      if (!dist) break;

      const len = name.length - 1;
      const mustContinue = len < this.minLength;

      if (mustContinue && dist.endScore >= dist.tot) break; // only END available

      const [ch, p] = sampleDist(dist, mustContinue, rng);

      if (ch === END) {
        ended = true; // natural, model-chosen ending
        break;
      }
      name.push(ch);
      logp += Math.log(Math.max(p, 0.0001));
    }

    // If we ran out of room, still allow a graceful stop when the model
    // says END is possible right here; otherwise the candidate is a
    // truncation and gets rejected.
    if (!ended && name.length - 1 >= this.maxLength) {
      const dist = this.getDist(name, wbase);
      if (dist && dist.endScore > 0) ended = true;
    }
    if (!ended) return null;

    const w = name.slice(1).join("");
    const wLen = name.length - 1;

    if (wLen < this.minLength) return null;
    if (hasRepeat(w)) return null;

    const perp = Math.exp(-logp / Math.max(1, wLen));
    if (!(perp <= maxP && perp >= minP)) return null;

    return w;
  }

  /**
   * Corpus phonotactics for a whole generated word: valid initial letter,
   * valid initial digraph (guards against order-1 evidence overriding the
   * order-2 start context, e.g. "^l" + "l->f" producing "Lfstan"), and every
   * adjacent character pair attested somewhere in a source name. Mirrors
   * `PlaceNameModel.validBigrams` but additionally gates the start bigram,
   * since whole-word generation (unlike stem generation) needs the start of
   * the word to be corpus-authentic too.
   */
  private validPhonotactics(w: string): boolean {
    const chars = Array.from(w);
    if (chars.length === 0 || !this.initials.has(chars[0])) return false;
    if (chars.length >= 2 && !this.startBigrams.has(chars[0] + chars[1]))
      return false;
    for (let i = 1; i < chars.length; i++) {
      if (!this.bigrams.has(chars[i - 1] + chars[i])) return false;
    }
    return true;
  }

  /**
   * Blended next-character distribution for the current context, cached per
   * unique trailing-KMAX-characters key. Each order k contributes its
   * normalised counts weighted by wbase^k × a Witten–Bell confidence factor
   * tot/(tot + distinct), so sparse high-order evidence no longer swamps the
   * blend (the main cause of verbatim source copies).
   */
  private getDist(context: string[], wbase: number): Dist | null {
    const key =
      context.length <= KMAX
        ? context.join("")
        : context.slice(-KMAX).join("");

    const cached = this.distCache.get(key);
    if (cached !== undefined) return cached;

    const scores = new Map<string, number>();
    for (let k = 0; k <= KMAX; k++) {
      if (k > context.length) break;
      const sub = k > 0 ? context.slice(-k).join("") : UNIGRAM_KEY;
      const d = this.tables[k].get(sub);
      if (!d) continue;

      let tot = 0;
      for (const v of d.values()) tot += v;
      if (tot === 0) continue;

      const confidence = tot / (tot + d.size); // Witten–Bell style
      const w = Math.pow(wbase, k) * confidence;
      for (const [ch, cnt] of d) {
        scores.set(ch, (scores.get(ch) ?? 0) + (w * cnt) / tot);
      }
    }

    let dist: Dist | null = null;
    if (scores.size > 0) {
      const chars = new Array<string>(scores.size);
      const cum = new Float64Array(scores.size);
      let running = 0;
      let endScore = 0;
      let i = 0;
      for (const [ch, s] of scores) {
        running += s;
        chars[i] = ch;
        cum[i] = running;
        if (ch === END) endScore = s;
        i++;
      }
      dist = {
        chars,
        cum,
        tot: running,
        endScore,
        endProb: endScore / running,
      };
    }

    this.distCache.set(key, dist);
    return dist;
  }
}

// ---------------------------------------------------------------------------
// Generation helpers
// ---------------------------------------------------------------------------

/**
 * Weighted random pick over a cached distribution. When `excludeEnd` is set
 * the end marker's mass is skipped without rebuilding the distribution.
 * Returns the chosen character and its normalised probability within the
 * (possibly END-excluded) distribution, for the perplexity accumulation.
 */
function sampleDist(
  dist: Dist,
  excludeEnd: boolean,
  rng: () => number
): [string, number] {
  const { chars, cum, tot, endScore } = dist;
  const effTot = excludeEnd ? tot - endScore : tot;
  if (effTot <= 0) return [END, 0.0001];

  let r = rng() * effTot;
  let prev = 0;
  for (let i = 0; i < chars.length; i++) {
    const score = cum[i] - prev;
    prev = cum[i];
    if (excludeEnd && chars[i] === END) continue;
    r -= score;
    if (r <= 0) return [chars[i], score / effTot];
  }
  // Floating-point fallthrough: return the last eligible entry.
  for (let i = chars.length - 1; i >= 0; i--) {
    if (excludeEnd && chars[i] === END) continue;
    const score = cum[i] - (i > 0 ? cum[i - 1] : 0);
    return [chars[i], score / effTot];
  }
  return [END, 0.0001];
}

/**
 * Mulberry32 — small, fast, decent-quality 32-bit PRNG. Deterministic for a
 * given seed, which is what makes reproducible batches possible. Exported so
 * callers that build their own composite generators (e.g. compound names,
 * which seed several sub-generators from one master seed) can reuse it
 * instead of hand-rolling another RNG.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Levenshtein distance with an early-exit band: returns true iff
 * dist(a, b) <= maxD. Code-point safe; O(len(a) × len(b)) worst case but
 * bails out as soon as the whole row exceeds maxD.
 */
function withinEditDistance(a: string, b: string, maxD: number): boolean {
  const A = Array.from(a);
  const B = Array.from(b);
  if (Math.abs(A.length - B.length) > maxD) return false;

  let prev = new Array<number>(B.length + 1);
  let cur = new Array<number>(B.length + 1);
  for (let j = 0; j <= B.length; j++) prev[j] = j;

  for (let i = 1; i <= A.length; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= B.length; j++) {
      const cost = A[i - 1] === B[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > maxD) return false;
    [prev, cur] = [cur, prev];
  }
  return prev[B.length] <= maxD;
}

/**
 * True if `w` (length `wLen`) is within `maxD` edits of any name in the
 * length-bucketed set. Shared by MarkovModel and PlaceNameModel.
 */
function tooCloseToAny(
  w: string,
  wLen: number,
  buckets: Map<number, string[]>,
  maxD: number
): boolean {
  for (let len = wLen - maxD; len <= wLen + maxD; len++) {
    const bucket = buckets.get(len);
    if (!bucket) continue;
    for (const s of bucket) {
      if (withinEditDistance(w, s, maxD)) return true;
    }
  }
  return false;
}

/** Bucket a set of lowercase names by code-point length. */
function bucketByLength(names: Iterable<string>): Map<number, string[]> {
  const buckets = new Map<number, string[]>();
  for (const s of names) {
    const len = Array.from(s).length;
    let bucket = buckets.get(len);
    if (!bucket) {
      bucket = [];
      buckets.set(len, bucket);
    }
    bucket.push(s);
  }
  return buckets;
}

/**
 * Reject names containing an immediately repeated block of 2 or 3 characters
 * (e.g. "anan", "abcabc").
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
//   * comma-separated lists on a line (Oxford and non-Oxford: "A, B, and C" / "A, B and C")
//   * Obsidian wikilinks and markdown links:  [[Aelfric]]  [[target|Display]]  [text](url)
//
// It strips: YAML frontmatter, fenced code blocks, headings, horizontal rules,
// blockquote/list markers, emphasis/inline-code markup, Obsidian %%comments%%,
// and trailing list conjunctions ("and"/"or"/"&"/"etc"). Prose paragraphs with
// commas will be split on those commas — keep source files as name lists, not
// running prose.

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
 * Split a cleaned block into individual names. Commas and newlines always
 * separate; a trailing non-Oxford conjunction ("Bob and Carol") is split; noise
 * tokens ("and", "&", "etc") are dropped.
 */
function parseNameTokens(text: string): string[] {
  const tokens = text
    .split(/[\n,]/)
    .flatMap((t) => splitOnJoiners(t))
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const names: string[] = [];
  for (const token of tokens) {
    const cleaned = cleanToken(stripLeadingConjunction(token));
    if (cleaned === "" || isNoise(cleaned)) continue;
    names.push(cleaned);
  }
  return dedupe(names);
}

/** Split "Cutha and Dunstan" → ["Cutha", "Dunstan"] wherever a joiner occurs. */
function splitOnJoiners(token: string): string[] {
  let parts = [token];
  for (const joiner of JOINERS) {
    const next: string[] = [];
    for (const part of parts) {
      let rest = part;
      let idx: number;
      while ((idx = rest.toLowerCase().indexOf(joiner)) >= 0) {
        next.push(rest.slice(0, idx));
        rest = rest.slice(idx + joiner.length);
      }
      next.push(rest);
    }
    parts = next;
  }
  return parts;
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
// PlaceNameModel — Markov specifics, intact generics
// ===========================================================================
//
// English place names are typically SPECIFIC + GENERIC: "Felix" + "stowe",
// "Chelms" + "ford", "Ips" + "wich". This model keeps the generic endings
// INTACT and only uses the Markov chain for the specific (first element):
//
//   1. ENDING DISCOVERY. Candidate endings of 2–7 characters are counted
//      across the corpus. An ending qualifies if it appears in at least
//      `minSuffixCount` names (default 2), or in the built-in gazetteer of
//      real British generics (-stowe, -wich, -ton, -ham, -by, -thorpe, …),
//      where a single occurrence is enough. Statistical discovery means
//      INVENTED fantasy endings qualify too, provided they recur.
//   2. SPLITTING. Each source name is split at its longest qualifying ending
//      that leaves a stem of at least `minStemLength`. Names that don't split
//      train the stem model whole and weight an empty ending, so the corpus
//      proportion of suffix-less names is preserved.
//   3. GENERATION. A stem is sampled from a MarkovModel trained on stems
//      only (same faithfulness/strictness/perplexity machinery), an ending
//      is drawn weighted by corpus frequency, and the two are joined with
//      seam smoothing (collapse a doubled letter; drop a stem-final vowel
//      before a vowel-initial ending, so "beorna" + "ing" → "beorning").
//
// Multi-word names: affix words (Great, Little, Upper, on, upon, cum, …) are
// dropped and the longest remaining word is used, so "Great Snoring"
// contributes "snoring" and "Stoke-on-Trent" contributes "stoke".
//
// Usage mirrors MarkovModel:
//   const model = PlaceNameModel.build(names);          // or with options
//   const { names: out, seed } = model.generateDetailed({ count: 20 });
//   model.endings                                       // discovered generics, for the UI
//
// UI NOTE (for whoever wires this into the plugin): alongside the output box
// and the Seed display box beneath it (see GenerateResult), show the
// discovered endings from `model.endings` — e.g. as removable chips — so the
// user can see what the model treats as generics and prune or extend them via
// `PlaceBuildOptions.knownSuffixes`.

/** Real British toponymic generics; single occurrence qualifies. */
const PLACE_SUFFIX_GAZETTEER = new Set([
  "ham", "ton", "tun", "don", "den", "dean", "ley", "leigh", "low", "hoe",
  "ford", "forth", "bury", "borough", "brough", "burgh", "by", "thorpe",
  "thorp", "thwaite", "toft", "wick", "wich", "wych", "stowe", "stow",
  "stoke", "stead", "sted", "worth", "worthy", "field", "feld", "combe",
  "coombe", "cott", "cote", "cot", "hurst", "mere", "port", "mouth",
  "bridge", "gate", "shot", "shott", "holt", "hithe", "hythe", "wold",
  "wood", "fell", "dale", "beck", "ness", "ing", "ings", "ingham",
  "ington", "chester", "caster", "cester", "minster", "hampton", "pool",
  "head", "cliffe", "cliff", "well", "bourne", "bourn", "burn", "brook",
  "hall", "hill", "moor", "marsh", "mead", "ey", "sea", "tree", "try",
]);

/** Words dropped when normalising multi-word names. */
const PLACE_AFFIX_WORDS = new Set([
  "great", "little", "much", "upper", "lower", "nether", "higher", "high",
  "east", "west", "north", "south", "new", "old", "long", "the", "le", "la",
  "cum", "on", "upon", "under", "over", "by", "next", "juxta", "in", "de",
  "st", "saint", "market", "chipping", "castle", "sible", "abbots", "kings",
  "queens", "bishops", "monks",
]);

const SUFFIX_MIN_LEN = 2;
const SUFFIX_MAX_LEN = 7;

export interface PlaceBuildOptions {
  /**
   * Extra endings to treat as gazetteer entries (single occurrence
   * qualifies). Use this for a setting's invented generics, e.g.
   * ["vael", "kir"].
   */
  knownSuffixes?: string[];
  /** Corpus occurrences required for a non-gazetteer ending. Default 2. */
  minSuffixCount?: number;
  /** Minimum stem length a split must leave. Default 2 (Ox|ford). */
  minStemLength?: number;
}

/** A discovered generic ending and how many source names carry it. */
export interface PlaceEnding {
  suffix: string; // "" = the no-ending case (whole-name stems)
  count: number;
}

/**
 * A discovered affix template — a full-name shape with "{}" marking where the
 * core name goes: "{}" (bare, the majority), "great {}", "{}-on-trent",
 * "castle {}". Kept intact, like the endings.
 */
export interface PlaceTemplate {
  template: string;
  count: number;
}

export interface PlaceGenerateOptions extends GenerateOptions {
  /**
   * Whether to apply corpus affix templates (Great …, …-on-…). Default true:
   * templates are drawn weighted by corpus frequency, so if 10% of source
   * names carry an affix, roughly 10% of output will. Set false for bare
   * cores only. Which settlement DESERVES a "Great" or sits on which river
   * remains the creator's call — this only reproduces the corpus shapes.
   */
  affixes?: boolean;
}

export class PlaceNameModel {
  private readonly stemModel: MarkovModel;
  /** Endings with cumulative weights for seeded weighted choice. */
  private readonly endingChars: string[];
  private readonly endingCum: Float64Array;
  private readonly endingTot: number;
  /** Full source names (normalised, lowercase) for copy/novelty checks. */
  private readonly sourceSet: Set<string>;
  private readonly sourceByLength: Map<number, string[]>;
  private readonly maxFullLength: number;
  /** Character bigrams seen inside source names — phonotactic gate. */
  private readonly bigrams: Set<string>;
  /** First characters of source names. */
  private readonly initials: Set<string>;
  private readonly minFullLength: number;
  /** Discovered endings, most frequent first — display these in the UI. */
  readonly endings: PlaceEnding[];
  /** Discovered affix templates, most frequent first — display in the UI. */
  readonly templates: PlaceTemplate[];
  /** Template cumulative weights for seeded weighted choice. */
  private readonly templateCum: Float64Array;
  private readonly templateTot: number;
  /** Raw multi-word source names (lowercase) for full-name copy checks. */
  private readonly rawSet: Set<string>;

  private constructor(
    stemModel: MarkovModel,
    endings: PlaceEnding[],
    templates: PlaceTemplate[],
    rawSet: Set<string>,
    sourceSet: Set<string>,
    maxFullLength: number,
    minFullLength: number,
    bigrams: Set<string>,
    initials: Set<string>
  ) {
    this.stemModel = stemModel;
    this.endings = endings;
    this.templates = templates;
    this.rawSet = rawSet;
    this.sourceSet = sourceSet;
    this.sourceByLength = bucketByLength(sourceSet);
    this.maxFullLength = maxFullLength;
    this.minFullLength = minFullLength;
    this.bigrams = bigrams;
    this.initials = initials;

    this.endingChars = new Array<string>(endings.length);
    this.endingCum = new Float64Array(endings.length);
    let running = 0;
    for (let i = 0; i < endings.length; i++) {
      running += endings[i].count;
      this.endingChars[i] = endings[i].suffix;
      this.endingCum[i] = running;
    }
    this.endingTot = running;

    this.templateCum = new Float64Array(templates.length);
    let trun = 0;
    for (let i = 0; i < templates.length; i++) {
      trun += templates[i].count;
      this.templateCum[i] = trun;
    }
    this.templateTot = trun;
  }

  static build(names: string[], options?: PlaceBuildOptions): PlaceNameModel {
    const minSuffixCount = Math.max(1, options?.minSuffixCount ?? 2);
    const minStemLength = Math.max(1, options?.minStemLength ?? 2);
    const gazetteer = new Set(PLACE_SUFFIX_GAZETTEER);
    for (const s of options?.knownSuffixes ?? []) {
      const t = s.trim().toLowerCase();
      if (t.length > 0) gazetteer.add(t);
    }

    // Normalise: lowercase, find each name's core word and affix template.
    const normalised: string[] = [];
    const templateCounts = new Map<string, number>();
    const rawSet = new Set<string>();
    for (const raw of names) {
      const n = normalisePlaceName(raw, gazetteer);
      if (n === null) continue;
      normalised.push(n.core);
      templateCounts.set(
        n.template,
        (templateCounts.get(n.template) ?? 0) + 1
      );
      rawSet.add(raw.trim().toLowerCase().replace(/\s+/g, " "));
    }
    const templates: PlaceTemplate[] = Array.from(templateCounts.entries())
      .map(([template, count]) => ({ template, count }))
      .sort((a, b) => b.count - a.count);

    const sourceSet = new Set(normalised);
    let maxFullLength = 0;
    let minFullLength = Number.POSITIVE_INFINITY;
    const bigrams = new Set<string>();
    const initials = new Set<string>();
    for (const n of sourceSet) {
      const chars = Array.from(n);
      maxFullLength = Math.max(maxFullLength, chars.length);
      minFullLength = Math.min(minFullLength, chars.length);
      initials.add(chars[0]);
      for (let i = 1; i < chars.length; i++) {
        bigrams.add(chars[i - 1] + chars[i]);
      }
    }
    if (!isFinite(minFullLength)) minFullLength = 3;

    // Pass 1: count every 2–7 character ending across the corpus.
    const endingCounts = new Map<string, number>();
    for (const name of sourceSet) {
      const chars = Array.from(name);
      for (let L = SUFFIX_MIN_LEN; L <= SUFFIX_MAX_LEN; L++) {
        if (chars.length - L < minStemLength) break;
        const suffix = chars.slice(chars.length - L).join("");
        endingCounts.set(suffix, (endingCounts.get(suffix) ?? 0) + 1);
      }
    }
    const qualifies = (suffix: string): boolean =>
      gazetteer.has(suffix) ||
      (endingCounts.get(suffix) ?? 0) >= minSuffixCount;

    // Pass 2: split each name at its longest qualifying ending.
    const stems: string[] = [];
    const chosen = new Map<string, number>(); // suffix ("" allowed) -> uses
    for (const name of sourceSet) {
      const chars = Array.from(name);
      let split = ""; // "" = no ending found
      for (let L = SUFFIX_MAX_LEN; L >= SUFFIX_MIN_LEN; L--) {
        if (chars.length - L < minStemLength) continue;
        const suffix = chars.slice(chars.length - L).join("");
        if (qualifies(suffix)) {
          split = suffix;
          break;
        }
      }
      stems.push(
        split === "" ? name : chars.slice(0, chars.length - split.length).join("")
      );
      chosen.set(split, (chosen.get(split) ?? 0) + 1);
    }

    const endings: PlaceEnding[] = Array.from(chosen.entries())
      .map(([suffix, count]) => ({ suffix, count }))
      .sort((a, b) => b.count - a.count);

    const stemModel = MarkovModel.build(stems);
    return new PlaceNameModel(
      stemModel,
      endings,
      templates,
      rawSet,
      sourceSet,
      maxFullLength,
      minFullLength,
      bigrams,
      initials
    );
  }

  /** Convenience wrapper — use `generateDetailed` when the UI needs the seed. */
  generate(options: PlaceGenerateOptions): string[] {
    return this.generateDetailed(options).names;
  }

  /**
   * Generate place names: Markov stem + intact corpus ending, optionally
   * wrapped in a corpus affix template ("Great {}", "{}-on-Trent"). Options
   * behave as on MarkovModel; copy rejection and novelty apply to the joined
   * core name, and affixed results are additionally checked against the raw
   * multi-word source names.
   */
  generateDetailed(options: PlaceGenerateOptions): GenerateResult {
    const count = Math.max(0, Math.floor(options.count));
    const faithfulness = clampInt(options.faithfulness ?? 2, 1, 3);
    const strictness = clampInt(options.strictness ?? 3, 1, 5);
    const allowCopies = options.allowSourceCopies ?? false;
    const novelty = clampInt(options.novelty ?? 0, 0, 3);
    const affixes = options.affixes ?? true;
    const seed =
      options.seed !== undefined && Number.isFinite(options.seed)
        ? options.seed >>> 0
        : (Math.random() * 0xffffffff) >>> 0;
    const rng = mulberry32(seed);

    const wbase = [2.5, 4.0, 7.0][faithfulness - 1];
    const [minP, maxP] = strictnessBounds(strictness);
    this.stemModel.ensureCache(wbase);

    const result: string[] = [];
    const seen = new Set<string>();
    let tries = 0;
    const maxTries = Math.max(1000, count * 300);

    while (result.length < count && tries < maxTries) {
      tries++;
      const stem = this.stemModel.trySampleWord(rng, wbase, minP, maxP);
      if (stem === null) continue;

      const suffix = this.pickEnding(rng);
      const [w, seam] = joinStemSuffix(stem, suffix);
      const wLen = Array.from(w).length;

      if (wLen > this.maxFullLength + 2) continue; // keep lengths corpus-like
      // A suffix-less result is a whole name in its own right, so it must be
      // at least as long as the shortest source name — kills bare fragments
      // like "Ips" that read as unfinished stems.
      if (seam === null && wLen < this.minFullLength) continue;
      // Phonotactic gates, all corpus-driven: the name must start with a
      // letter some source starts with, and every adjacent character pair
      // (including the seam) must occur inside some real source name. Keeps
      // authentic seams (Waldring|field's "gf") and rejects impossible
      // clusters ("tm", "ml") and oddities like a leading "xm".
      if (!this.validBigrams(w)) continue;
      if (hasRepeat(w)) continue;
      if (!allowCopies && this.sourceSet.has(w)) continue;
      if (seen.has(w)) continue;
      if (
        novelty > 0 &&
        tooCloseToAny(w, wLen, this.sourceByLength, novelty)
      )
        continue;

      // Corpus-proportioned affixing: draw a template (usually the bare
      // "{}") and wrap the core in it. An affixed full name must not
      // reproduce a raw source name.
      let full = capitaliseFirst(w);
      if (affixes && this.templateTot > 0) {
        const template = this.pickTemplate(rng);
        if (template !== "{}") {
          const joined = template.replace("{}", w);
          if (!allowCopies && this.rawSet.has(joined)) continue;
          full = renderPlaceName(joined);
        }
      }

      seen.add(w);
      result.push(full);
    }

    return { names: result, seed };
  }

  /** Seeded weighted pick over the affix templates ("{}" possible). */
  private pickTemplate(rng: () => number): string {
    const r = rng() * this.templateTot;
    for (let i = 0; i < this.templateCum.length; i++) {
      if (r < this.templateCum[i]) return this.templates[i].template;
    }
    return "{}";
  }

  /** Corpus phonotactics: valid initial letter + every bigram attested. */
  private validBigrams(w: string): boolean {
    const chars = Array.from(w);
    if (chars.length === 0 || !this.initials.has(chars[0])) return false;
    for (let i = 1; i < chars.length; i++) {
      if (!this.bigrams.has(chars[i - 1] + chars[i])) return false;
    }
    return true;
  }

  /** Seeded weighted pick over the discovered endings ("" possible). */
  private pickEnding(rng: () => number): string {
    if (this.endingTot <= 0) return "";
    const r = rng() * this.endingTot;
    for (let i = 0; i < this.endingCum.length; i++) {
      if (r < this.endingCum[i]) return this.endingChars[i];
    }
    return this.endingChars[this.endingChars.length - 1] ?? "";
  }
}

/** Convenience: extract names from markdown + build the place model. */
export function buildPlaceModelFromMarkdown(
  markdown: string | string[],
  options?: PlaceBuildOptions
): PlaceNameModel {
  return PlaceNameModel.build(extractNamesFromMarkdown(markdown), options);
}

/**
 * Lowercase and identify the CORE word plus the TEMPLATE — the full name
 * with the core replaced by "{}", so "great snoring" → core "snoring",
 * template "great {}", and "stoke-on-trent" → core "stoke", template
 * "{}-on-trent". The core is the word that carries a gazetteer generic
 * ending (that's the toponymically significant one: "saffron WALDEN"), or
 * failing that the longest non-affix word. Single-word names get the bare
 * template "{}". Returns null if nothing usable remains.
 */
function normalisePlaceName(
  raw: string,
  gazetteer: Set<string>
): { core: string; template: string } | null {
  const lower = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (lower === "") return null;

  // The ending must be a PROPER suffix — a word that simply IS a generic
  // ("sea", "ford") is not a settlement core in its own right.
  const hasGenericEnding = (word: string): boolean => {
    for (const suffix of gazetteer) {
      if (word.length > suffix.length && word.endsWith(suffix)) return true;
    }
    return false;
  };

  // Words in order, with their separators preserved for the template.
  const parts = lower.split(/([\s\-]+)/); // words at even indices
  let coreIdx = -1;
  let coreHasEnding = false;
  for (let i = 0; i < parts.length; i += 2) {
    const word = parts[i];
    if (word.length === 0 || PLACE_AFFIX_WORDS.has(word)) continue;
    const ending = hasGenericEnding(word);
    const better =
      coreIdx === -1 ||
      (ending && !coreHasEnding) ||
      (ending === coreHasEnding && word.length > parts[coreIdx].length);
    if (better) {
      coreIdx = i;
      coreHasEnding = ending;
    }
  }
  if (coreIdx === -1 || parts[coreIdx].length < 3) return null;

  const core = parts[coreIdx];
  const template =
    parts.length === 1
      ? "{}"
      : parts
          .map((p, i) => (i === coreIdx ? "{}" : p))
          .join("");
  return { core, template };
}

/** Connective words that stay lowercase inside a rendered place name. */
const PLACE_CONNECTIVES = new Set([
  "on", "upon", "under", "over", "by", "next", "le", "la", "cum", "de",
  "the", "in", "juxta", "super", "sub", "en",
]);

/**
 * Capitalise a lowercase multi-word place name: every word capitalised
 * except connectives ("stoke-on-trent" → "Stoke-on-Trent",
 * "great snoring" → "Great Snoring"), and the first word always capitalised.
 */
function renderPlaceName(lower: string): string {
  const parts = lower.split(/([\s\-]+)/);
  let firstWord = true;
  return parts
    .map((p, i) => {
      if (i % 2 === 1 || p.length === 0) return p; // separator
      const cap = firstWord || !PLACE_CONNECTIVES.has(p);
      firstWord = false;
      return cap ? capitaliseFirst(p) : p;
    })
    .join("");
}

const VOWELS = new Set(["a", "e", "i", "o", "u", "y"]);

/**
 * Join a Markov stem to an intact ending with seam smoothing:
 *   * doubled letter at the seam collapses once ("sutt" + "ton" → "sutton",
 *     not "suttton");
 *   * a stem-final vowel is dropped before a vowel-initial ending
 *     ("beorna" + "ing" → "beorning").
 * Returns the joined word plus the seam bigram (the last stem character and
 * first ending character after smoothing), or null seam for an empty ending.
 */
function joinStemSuffix(
  stem: string,
  suffix: string
): [string, string | null] {
  if (suffix === "") return [stem, null];
  let s = Array.from(stem);
  const first = Array.from(suffix)[0];

  if (s.length > 1 && VOWELS.has(s[s.length - 1]) && VOWELS.has(first)) {
    s = s.slice(0, -1);
  }
  if (s.length > 1 && s[s.length - 1] === first) {
    s = s.slice(0, -1);
  }
  return [s.join("") + suffix, s[s.length - 1] + first];
}

// ===========================================================================
// ListGenerator — picks whole names verbatim. Fisher–Yates partial shuffle
// (the old rejection loop degraded to O(n²) when count approached list size).
// ===========================================================================
export class ListGenerator {
  private names: string[] = [];

  train(names: string[]): void {
    this.names = names.filter((name) => name.trim().length > 0);
  }

  /**
   * `rng` defaults to `Math.random` but accepts a seeded generator (e.g.
   * `mulberry32(seed)`) so batches can be reproduced.
   */
  generateMultiple(count: number, rng: () => number = Math.random): string[] {
    const pool = Array.from(new Set(this.names));
    const n = Math.min(count, pool.length);
    for (let i = 0; i < n; i++) {
      const j = i + Math.floor(rng() * (pool.length - i));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, n);
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
  /**
   * RNG seed. Same seed + same source parts + same options = identical
   * output. Omit for a random seed — the seed actually used is always
   * returned by `generateCompoundNamesDetailed`.
   */
  seed?: number;
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
 * list per "part"/column), and return `count` unique joined results, plus
 * the seed that produced them. A single master seed is used to derive a
 * sub-seed for each part's pool (so each part's generator is itself
 * reproducible) and is then reused for the final fragment-combination
 * sampling, so the whole batch is reproducible from one number.
 */
export function generateCompoundNamesDetailed(
  parts: string[][],
  options: CompoundGenerateOptions
): GenerateResult {
  const count = Math.max(0, Math.floor(options.count));
  const seed =
    options.seed !== undefined && Number.isFinite(options.seed)
      ? options.seed >>> 0
      : (Math.random() * 0xffffffff) >>> 0;

  if (count === 0 || parts.length < 2) return { names: [], seed };

  const masterRng = mulberry32(seed);
  const nextSubSeed = (): number => Math.floor(masterRng() * 0xffffffff) >>> 0;

  const poolSize = Math.max(count, 30);
  const pools: string[][] = parts.map((part) => {
    if (part.length === 0) return [];
    if (options.generator === "list") {
      const generator = new ListGenerator();
      generator.train(part);
      return generator.generateMultiple(poolSize, mulberry32(nextSubSeed()));
    }
    const model = MarkovModel.build(part);
    return model.generateDetailed({
      count: poolSize,
      faithfulness: options.faithfulness ?? 2,
      strictness: options.strictness ?? 3,
      seed: nextSubSeed(),
    }).names;
  });

  if (pools.some((pool) => pool.length === 0)) return { names: [], seed };

  const result: string[] = [];
  const seen = new Set<string>();
  let tries = 0;
  const maxTries = Math.max(1000, count * 300);

  while (result.length < count && tries < maxTries) {
    tries++;
    const fragments = pools.map((pool) => pool[Math.floor(masterRng() * pool.length)]);
    const name = joinCompoundParts(fragments, options.joining);
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }

  return { names: result, seed };
}

/** Convenience wrapper — use `generateCompoundNamesDetailed` when the UI needs the seed. */
export function generateCompoundNames(parts: string[][], options: CompoundGenerateOptions): string[] {
  return generateCompoundNamesDetailed(parts, options).names;
}
