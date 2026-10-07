// Name ageing engine (part 3).
//
// Ages an old name through a number of eras towards a target language, represented only by the
// target pack's names and a scoring function from its Markov model. Small, language-neutral edits
// ("moves") propose changes; the target model judges them. No Obsidian imports, so it can be
// tested under Node and later ported.

import { mulberry32 } from "../markov";

// ── Fixed values from the brief (to be tuned later) ─────────────────────────

export const AGEING = {
  /** §1: minimum names in a target pack. */
  minTargetNames: 30,
  /** §1: minimum letters per source word. */
  minWordLetters: 3,
  /** §1: depth range and default; count options and default. */
  depth: { min: 1, max: 5, default: 3 },
  count: { options: [3, 4, 5] as const, default: 5 },
  /** §2.2: multi-letter consonant units, longest match first. */
  consonantUnits: ["sch", "th", "sh", "ch", "gh", "ph", "wh", "ck", "ng", "qu"],
  /** §2.4: target inventories. */
  vowelRunInventorySize: 20,
  endingLengths: [2, 3, 4],
  endingMinNames: 3,
  endingMinShare: 0.02,
  endingInventorySize: 30,
  /** §4: every move leaves at least this many vowel runs and letters. */
  minVowelRuns: 1,
  minLetters: 3,
  /** §4.1 M9: maximum weighted distance between replaced letters and the ending. */
  endingSnapMaxDistance: 1.5,
  /** §5.2: weighted Levenshtein costs. */
  cost: { insertDelete: 1.0, deleteDoubled: 0.2, vowelVowel: 0.5, consonantSameClass: 0.4, other: 1.0 },
  /** §5.3: w(e) = base + span × (e ÷ D). */
  eraWeight: { base: 0.2, span: 0.6 },
  /** §5.4: step limit against the previous era's form; R floor per depth at final filtering. */
  stepLimit: 0.5,
  depthFloor: { 1: 0.7, 2: 0.55, 3: 0.4, 4: 0.3, 5: 0.15 } as Record<number, number>,
  /** §5.1 (deviation, approved): target names are scored by models that did not see them, in
   *  this many held-out folds, so the reference reflects how a new name scores. */
  heldOutFolds: 10,
  /** §6: search. */
  runs: 4,
  beamWidth: 12,
  stepsPerEra: 2,
  temperature: 0.05,
  /** §7.1: minimum plausibility of a final candidate. */
  minPlausibility: 0.15,
  /** §7.2: diversity thresholds (normalised distance), first pass then fallback. */
  diversity: [0.25, 0.15],
  /** §7.2: fewer survivors than this triggers the notice. */
  noticeBelow: 3,
} as const;

/** Takeover profile (takeover brief). A second profile of this engine; no ageing value changes. */
export const TAKEOVER = {
  /** §3: words with fewer letters than this pass through unchanged. */
  passthroughBelow: 3,
  /** §4.2: search — one era, no step limit. */
  eras: 1,
  stepsPerEra: 3,
  runs: 4,
  beamWidth: 12,
  temperature: 0.05,
  /** §4.3: score = pWeight × P + (1 − pWeight) × R. */
  pWeight: 0.7,
  /** §4.4: filters. */
  minRecognisability: 0.6,
  minPlausibility: 0.15,
  /** §5: per-word limits for M10 and M11 in one adoption. */
  maxEndingAdditions: 1,
  maxVowelInsertions: 2,
  /** §2.1: native names generated at most this many times the batch size. */
  nativeCapFactor: 3,
} as const;

/** §2.1: vowel letters. */
const VOWELS = new Set(Array.from("aeiouyáàâäãåæéèêëíìîïóòôöõøœúùûüýÿ"));

/** §3: consonant classes. */
const CONSONANT_CLASSES: string[][] = [
  ["p", "b", "f", "v", "m", "w", "ph"],
  ["t", "d", "th", "n", "l", "r", "s", "z"],
  ["s", "z", "sh", "ch", "j", "x", "sch"],
  ["c", "k", "g", "q", "ck", "gh", "ch", "qu", "x", "ng"],
  ["w", "y", "h", "wh"],
];

/** §4.2: alphabet fit, era 1 only. */
const ALPHABET_FIT: Record<string, string> = {
  ð: "th", þ: "th", æ: "a", œ: "e", ø: "o", ö: "o",
  å: "a", ä: "a", á: "a", à: "a", â: "a", ã: "a",
  é: "e", è: "e", ê: "e", ë: "e", í: "i", ì: "i", î: "i", ï: "i",
  ó: "o", ò: "o", ô: "o", õ: "o", ú: "u", ù: "u", û: "u", ü: "u", ý: "y", ÿ: "y",
};

const SEPARATOR = /[ \-']/;

function sameClass(a: string, b: string): boolean {
  return CONSONANT_CLASSES.some((c) => c.includes(a) && c.includes(b));
}

// ── Tokenisation (§2) ───────────────────────────────────────────────────────

interface Segment {
  vowel: boolean;
  /** Vowel runs: one letter per unit. Consonant clusters: consonant units. */
  units: string[];
}

function isVowelAt(chars: string[], i: number): boolean {
  const ch = chars[i];
  if (!VOWELS.has(ch)) return false;
  // y is a consonant when word-initial and followed by a vowel letter.
  if (ch === "y" && i === 0 && i + 1 < chars.length && VOWELS.has(chars[i + 1])) return false;
  return true;
}

export function segment(word: string): Segment[] {
  const chars = Array.from(word);
  const segments: Segment[] = [];
  const push = (vowel: boolean, unit: string) => {
    const last = segments[segments.length - 1];
    if (last && last.vowel === vowel) last.units.push(unit);
    else segments.push({ vowel, units: [unit] });
  };
  for (let i = 0; i < chars.length; ) {
    if (isVowelAt(chars, i)) {
      push(true, chars[i]);
      i++;
      continue;
    }
    const multi = AGEING.consonantUnits.find((u) => chars.slice(i, i + u.length).join("") === u);
    const unit = multi ?? chars[i];
    push(false, unit);
    i += Array.from(unit).length;
  }
  return segments;
}

const join = (segments: Segment[]) => segments.map((s) => s.units.join("")).join("");
const letterCount = (s: string) => Array.from(s.replace(/[ \-']/g, "")).length;

/** Splits a form into words and separators, e.g. "stoke-on-trent" → ["stoke","-","on","-","trent"]. */
function splitForm(form: string): string[] {
  return form.split(/([ \-'])/).filter((p) => p.length > 0);
}

// ── Distance (§5.2) ─────────────────────────────────────────────────────────

const isVowelLetter = (ch: string) => VOWELS.has(ch);

/** Weighted Levenshtein over letters (separators excluded), editing `a` into `b`. */
export function weightedDistance(a: string, b: string): number {
  const x = Array.from(a.replace(/[ \-']/g, ""));
  const y = Array.from(b.replace(/[ \-']/g, ""));
  const c = AGEING.cost;
  const del = (i: number) =>
    (i > 0 && x[i - 1] === x[i]) || (i + 1 < x.length && x[i + 1] === x[i]) ? c.deleteDoubled : c.insertDelete;
  const sub = (p: string, q: string) => {
    if (p === q) return 0;
    if (isVowelLetter(p) && isVowelLetter(q)) return c.vowelVowel;
    if (!isVowelLetter(p) && !isVowelLetter(q) && sameClass(p, q)) return c.consonantSameClass;
    return c.other;
  };
  let prev = new Array<number>(y.length + 1);
  prev[0] = 0;
  for (let j = 1; j <= y.length; j++) prev[j] = prev[j - 1] + c.insertDelete;
  for (let i = 1; i <= x.length; i++) {
    const row = new Array<number>(y.length + 1);
    row[0] = prev[0] + del(i - 1);
    for (let j = 1; j <= y.length; j++) {
      row[j] = Math.min(prev[j] + del(i - 1), row[j - 1] + c.insertDelete, prev[j - 1] + sub(x[i - 1], y[j - 1]));
    }
    prev = row;
  }
  return prev[y.length];
}

export function normalisedDistance(a: string, b: string): number {
  const longer = Math.max(letterCount(a), letterCount(b));
  return longer === 0 ? 0 : weightedDistance(a, b) / longer;
}

/** Recognisability of `b` against `a`: 1 − normalised distance, floored at 0. */
export function recognisability(a: string, b: string): number {
  return Math.max(0, 1 - normalisedDistance(a, b));
}

// ── Target inventories (§2.4) ───────────────────────────────────────────────

export interface TargetInventory {
  vowelRuns: string[];
  consonantUnits: Set<string>;
  letters: Set<string>;
  endings: string[];
}

export function buildInventory(targetNames: string[], extraEndings: string[] = []): TargetInventory {
  const names = targetNames.map((n) => n.trim().toLowerCase()).filter((n) => n.length > 0);
  const vowelCounts = new Map<string, number>();
  const consonantUnits = new Set<string>();
  const letters = new Set<string>();
  const endingCounts = new Map<string, number>();

  for (const name of names) {
    for (const ch of Array.from(name)) if (!SEPARATOR.test(ch)) letters.add(ch);
    const words = splitForm(name).filter((p) => !SEPARATOR.test(p));
    for (const word of words) {
      for (const seg of segment(word)) {
        if (seg.vowel) {
          const run = seg.units.join("");
          vowelCounts.set(run, (vowelCounts.get(run) ?? 0) + 1);
        } else {
          for (const u of seg.units) consonantUnits.add(u);
        }
      }
    }
    const last = Array.from(words[words.length - 1] ?? "");
    const seen = new Set<string>();
    for (const len of AGEING.endingLengths) {
      if (last.length < len) continue;
      const ending = last.slice(-len).join("");
      if (seen.has(ending)) continue;
      seen.add(ending);
      endingCounts.set(ending, (endingCounts.get(ending) ?? 0) + 1);
    }
  }

  const byCount = (m: Map<string, number>) => [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const vowelRuns = byCount(vowelCounts).slice(0, AGEING.vowelRunInventorySize).map(([r]) => r);
  const minNames = Math.max(AGEING.endingMinNames, AGEING.endingMinShare * names.length);
  const endings = byCount(endingCounts)
    .filter(([, n]) => n >= minNames)
    .slice(0, AGEING.endingInventorySize)
    .map(([e]) => e);
  for (const e of extraEndings.map((x) => x.toLowerCase())) if (!endings.includes(e)) endings.push(e);
  return { vowelRuns, consonantUnits, letters, endings };
}

// ── Moves (§4) ──────────────────────────────────────────────────────────────

export type MoveId = "M1" | "M2" | "M3" | "M4" | "M5" | "M6" | "M7" | "M8" | "M9" | "M10" | "M11";

/** The ageing profile's moves (ageing §4.1). Never includes M10 or M11. */
export const AGEING_MOVES: ReadonlySet<MoveId> = new Set<MoveId>(["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9"]);
/** The takeover profile's moves (takeover §4.1): no erosion (M1–M3), plus M10 and M11. */
export const TAKEOVER_MOVES: ReadonlySet<MoveId> = new Set<MoveId>(["M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11"]);

function firstUnit(segments: Segment[]): string {
  return segments[0]?.units[0] ?? "";
}

/** §4 constraints; `firstMayChange` allows a substitution (M4, M6) or M7 at the first unit. */
function valid(before: Segment[], after: string, firstMayChange: boolean): boolean {
  if (Array.from(after).length < AGEING.minLetters) return false;
  const segs = segment(after);
  if (segs.filter((s) => s.vowel).length < AGEING.minVowelRuns) return false;
  return firstMayChange || firstUnit(segs) === firstUnit(before);
}

const clone = (segments: Segment[]) => segments.map((s) => ({ vowel: s.vowel, units: [...s.units] }));

/** All single-move variants of one word, constraint-checked and distinct. */
export function wordVariants(word: string, inv: TargetInventory, moves: ReadonlySet<MoveId> = AGEING_MOVES): Map<string, MoveId> {
  const segs = segment(word);
  const out = new Map<string, MoveId>();
  const add = (move: MoveId, result: string, firstMayChange = false) => {
    if (!moves.has(move)) return;
    if (result !== word && !out.has(result) && valid(segs, result, firstMayChange)) out.set(result, move);
  };
  const vowelIdx = segs.map((s, i) => (s.vowel ? i : -1)).filter((i) => i >= 0);

  // M1 apocope, M2 final-syllable loss.
  add("M1", join(segs.slice(0, -1)));
  add("M2", join(segs.slice(0, -2)));

  // M3 syncope: delete a vowel run that is neither the first nor the last.
  for (const i of vowelIdx.slice(1, -1)) add("M3", join(segs.filter((_, j) => j !== i)));

  // M4 vowel shift.
  for (const i of vowelIdx) {
    const run = segs[i].units.join("");
    for (const r of inv.vowelRuns) {
      if (r === run) continue;
      const next = clone(segs);
      next[i].units = Array.from(r);
      add("M4", join(next), i === 0);
    }
  }

  // M5 vowel shortening.
  for (const i of vowelIdx) {
    if (segs[i].units.length < 2) continue;
    for (let k = 0; k < segs[i].units.length; k++) {
      const next = clone(segs);
      next[i].units.splice(k, 1);
      add("M5", join(next));
    }
  }

  // M6 consonant shift (same class, from the target inventory); M7 cluster simplification.
  segs.forEach((s, i) => {
    if (s.vowel) return;
    s.units.forEach((unit, k) => {
      for (const other of inv.consonantUnits) {
        if (other === unit || !sameClass(unit, other)) continue;
        const next = clone(segs);
        next[i].units[k] = other;
        add("M6", join(next), i === 0 && k === 0);
      }
      if (s.units.length >= 2) {
        const next = clone(segs);
        next[i].units.splice(k, 1);
        add("M7", join(next), i === 0 && k === 0);
      }
    });
  });

  // M8 degemination: two identical adjacent consonant letters.
  const chars = Array.from(word);
  for (let i = 1; i < chars.length; i++) {
    if (chars[i] === chars[i - 1] && !isVowelAt(chars, i)) add("M8", [...chars.slice(0, i), ...chars.slice(i + 1)].join(""));
  }

  // M9 ending snap: replace the final 1–3 segments with a target ending close enough to them.
  for (let n = 1; n <= 3 && n <= segs.length; n++) {
    const replaced = join(segs.slice(-n));
    const stem = join(segs.slice(0, -n));
    for (const ending of inv.endings) {
      if (ending === replaced) continue;
      if (weightedDistance(replaced, ending) <= AGEING.endingSnapMaxDistance) add("M9", stem + ending);
    }
  }

  // M10 ending addition (takeover §5): a shared boundary letter appears once.
  if (moves.has("M10")) {
    for (const ending of inv.endings) {
      if (word.endsWith(ending)) continue;
      const last = chars[chars.length - 1];
      add("M10", last === Array.from(ending)[0] ? word + Array.from(ending).slice(1).join("") : word + ending);
    }
  }

  // M11 vowel insertion (takeover §5): (a) inside a cluster of 2+ units; (b) before a word-initial
  // cluster of 2+ units — the one exception to the first-unit rule.
  if (moves.has("M11")) {
    segs.forEach((s, i) => {
      if (s.vowel || s.units.length < 2) return;
      for (let k = 1; k < s.units.length; k++) {
        for (const run of inv.vowelRuns) {
          add("M11", join(segs.slice(0, i)) + s.units.slice(0, k).join("") + run + s.units.slice(k).join("") + join(segs.slice(i + 1)));
        }
      }
    });
    if (segs.length > 0 && !segs[0].vowel && segs[0].units.length >= 2) {
      for (const run of inv.vowelRuns) add("M11", run + word, true);
    }
  }
  return out;
}

interface FormVariant {
  form: string;
  /** Index of the changed word in `splitForm(form)`. */
  part: number;
  move: MoveId;
}

/** Every single-move variant of a whole form: one move applied to one word, first move kept. */
function formVariantsDetailed(
  form: string,
  inv: TargetInventory,
  moves: ReadonlySet<MoveId>,
  skipWord?: (word: string) => boolean,
  allow?: (part: number, move: MoveId) => boolean,
  variantsOf: (word: string) => Map<string, MoveId> = (word) => wordVariants(word, inv, moves),
): FormVariant[] {
  const parts = splitForm(form);
  const out = new Map<string, FormVariant>();
  parts.forEach((part, i) => {
    if (SEPARATOR.test(part) || skipWord?.(part)) return;
    for (const [variant, move] of variantsOf(part)) {
      if (allow && !allow(i, move)) continue;
      const next = [...parts];
      next[i] = variant;
      const joined = next.join("");
      if (!out.has(joined)) out.set(joined, { form: joined, part: i, move });
    }
  });
  return [...out.values()];
}

/** The ageing profile's variants of a whole form. */
function formVariants(form: string, inv: TargetInventory): string[] {
  return formVariantsDetailed(form, inv, AGEING_MOVES).map((v) => v.form);
}

/** §4.2: replace letters missing from the target set, where the replacement letters are present. */
export function alphabetFit(form: string, letters: Set<string>): string {
  return Array.from(form)
    .map((ch) => {
      if (SEPARATOR.test(ch) || letters.has(ch)) return ch;
      const to = ALPHABET_FIT[ch];
      return to && Array.from(to).every((t) => letters.has(t)) ? to : ch;
    })
    .join("");
}

// ── Validation (§1) ─────────────────────────────────────────────────────────

/** Returns a notice if the source name is unusable, otherwise null. */
export function validateSource(source: string): string | null {
  const s = source.trim();
  if (!s) return "Enter a name to age.";
  if (!/^[\p{L} \-']+$/u.test(s)) return "Use letters, spaces, hyphens and apostrophes only.";
  const words = s.split(/[ \-']+/).filter((w) => w.length > 0);
  if (words.some((w) => Array.from(w).length < AGEING.minWordLetters)) {
    return `Each word needs at least ${AGEING.minWordLetters} letters.`;
  }
  return null;
}

// ── Search and selection (§5–§7) ────────────────────────────────────────────

export interface AgeingInput {
  source: string;
  targetNames: string[];
  /** Extra endings for the ending inventory (Place packs: the endings the Place model recognises). */
  extraEndings?: string[];
  /**
   * Builds a scorer from a list of names: the returned function gives the per-character
   * log-probability of one lowercase word, end token included. Called once with all target names
   * (to score candidates) and once per held-out fold (to score the target names themselves).
   */
  buildScorer: (names: string[]) => (word: string) => number;
  depth: number;
  count: number;
  /** The run's RNG; four independent search streams are drawn from it. */
  rng: () => number;
}

export interface AgeingCandidate {
  /** Title-cased final form. */
  name: string;
  /** Title-cased trail, source first, consecutive repeats collapsed. */
  trail: string[];
  score: number;
  plausibility: number;
  recognisability: number;
}

export interface AgeingResult {
  candidates: AgeingCandidate[];
  notice?: string;
}

interface BeamItem {
  form: string;
  trail: string[];
}

/** Title case: first letter of each word upper, the rest lower; separators kept. */
export function titleCase(form: string): string {
  return splitForm(form)
    .map((p) => (SEPARATOR.test(p) ? p : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()))
    .join("");
}

export function eraWeight(era: number, depth: number): number {
  return AGEING.eraWeight.base + AGEING.eraWeight.span * (era / depth);
}

/** Samples `k` items without replacement, with probability ∝ exp(score ÷ τ). */
function sampleBeam<T>(items: [T, number][], k: number, rng: () => number, temperature: number): T[] {
  if (items.length <= k) return items.map(([t]) => t);
  const max = Math.max(...items.map(([, s]) => s));
  const pool = items.map(([t, s]): [T, number] => [t, Math.exp((s - max) / temperature)]);
  const chosen: T[] = [];
  for (let n = 0; n < k; n++) {
    const total = pool.reduce((sum, [, w]) => sum + w, 0);
    let r = rng() * total;
    let idx = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i][1];
      if (r < 0) {
        idx = i;
        break;
      }
    }
    chosen.push(pool[idx][0]);
    pool.splice(idx, 1);
  }
  return chosen;
}

/**
 * §5.1: plausibility is the share of target names scoring no higher than a form. Each target name
 * is scored by a model built without its fold, so memorised names don't set the bar.
 */
function plausibilityScorer(targetNames: string[], buildScorer: AgeingInput["buildScorer"]): (form: string) => number {
  const meanScore = (scoreWord: (w: string) => number, form: string) => {
    const words = splitForm(form).filter((p) => !SEPARATOR.test(p));
    return words.reduce((sum, w) => sum + scoreWord(w), 0) / Math.max(1, words.length);
  };
  const fullScorer = buildScorer(targetNames);
  const formScore = (form: string) => meanScore(fullScorer, form);
  const lowerTargets = targetNames.map((n) => n.trim().toLowerCase());
  const targetScores: number[] = [];
  for (let fold = 0; fold < AGEING.heldOutFolds; fold++) {
    const held = lowerTargets.filter((_, i) => i % AGEING.heldOutFolds === fold);
    if (held.length === 0) continue;
    const scorer = buildScorer(targetNames.filter((_, i) => i % AGEING.heldOutFolds !== fold));
    for (const name of held) targetScores.push(meanScore(scorer, name));
  }
  targetScores.sort((a, b) => a - b);
  const pCache = new Map<string, number>();
  return (form: string) => {
    let p = pCache.get(form);
    if (p === undefined) {
      const s = formScore(form);
      let lo = 0;
      let hi = targetScores.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (targetScores[mid] <= s) lo = mid + 1;
        else hi = mid;
      }
      p = lo / targetScores.length;
      pCache.set(form, p);
    }
    return p;
  };
}

// ── Shared search (ageing §6) ───────────────────────────────────────────────

interface SearchItem<S> {
  form: string;
  trail: string[];
  state: S;
}

/** The profile-specific parts of the search. */
interface SearchProfile<S> {
  eras: number;
  stepsPerEra: number;
  runs: number;
  beamWidth: number;
  temperature: number;
  /** Score weight w for an era: score = w × P + (1 − w) × R. */
  weight: (era: number) => number;
  /** Minimum R between an era's start and end forms; undefined applies none. */
  stepLimit?: number;
  /** Applied to each beam form at the start of era 1 (alphabet fit). */
  startForm: (form: string) => string;
  /** Single-move successors of a form, with their search state. */
  expand: (form: string, state: S) => { form: string; state: S }[];
  score: (form: string, w: number) => number;
}

/** Independent stochastic beam searches; returns every surviving end-of-search item. */
function beamSearch<S>(source: string, initial: S, profile: SearchProfile<S>, inputRng: () => number): SearchItem<S>[] {
  const pool: SearchItem<S>[] = [];
  for (let run = 0; run < profile.runs; run++) {
    const rng = mulberry32(Math.floor(inputRng() * 0x100000000) >>> 0);
    let beam: SearchItem<S>[] = [{ form: source, trail: [source], state: initial }];
    for (let era = 1; era <= profile.eras && beam.length > 0; era++) {
      const w = profile.weight(era);
      type Entry = { item: SearchItem<S>; form: string; state: S };
      let working: Entry[] = beam.map((b) => ({ item: b, form: era === 1 ? profile.startForm(b.form) : b.form, state: b.state }));
      for (let step = 0; step < profile.stepsPerEra; step++) {
        const seen = new Map<string, Entry>();
        for (const entry of working) {
          for (const next of [{ form: entry.form, state: entry.state }, ...profile.expand(entry.form, entry.state)]) {
            if (!seen.has(next.form)) seen.set(next.form, { item: entry.item, form: next.form, state: next.state });
          }
        }
        const scored = [...seen.values()].map((e): [Entry, number] => [e, profile.score(e.form, w)]);
        working = sampleBeam(scored, profile.beamWidth, rng, profile.temperature);
      }
      // Ageing §5.4 step limit, then record each survivor's era-end form.
      const limit = profile.stepLimit;
      beam = working
        .filter((e) => limit === undefined || recognisability(e.item.form, e.form) >= limit)
        .map((e) => ({ form: e.form, trail: [...e.item.trail, e.form], state: e.state }));
    }
    pool.push(...beam);
  }
  return pool;
}

export function ageName(input: AgeingInput): AgeingResult {
  const sourceError = validateSource(input.source);
  if (sourceError) throw new Error(sourceError);
  if (input.targetNames.length < AGEING.minTargetNames) {
    throw new Error(`A target pack needs at least ${AGEING.minTargetNames} names.`);
  }
  const depth = Math.min(AGEING.depth.max, Math.max(AGEING.depth.min, Math.floor(input.depth)));
  const count = Math.floor(input.count);
  const source = input.source.trim().toLowerCase().replace(/\s+/g, " ");
  const inv = buildInventory(input.targetNames, input.extraEndings);
  const plausibility = plausibilityScorer(input.targetNames, input.buildScorer);
  const rCache = new Map<string, number>();
  const rSource = (form: string) => {
    let r = rCache.get(form);
    if (r === undefined) {
      r = recognisability(source, form);
      rCache.set(form, r);
    }
    return r;
  };
  const score = (form: string, w: number) => w * plausibility(form) + (1 - w) * rSource(form);
  const variantCache = new Map<string, string[]>();
  const variants = (form: string) => {
    let v = variantCache.get(form);
    if (!v) {
      v = formVariants(form, inv);
      variantCache.set(form, v);
    }
    return v;
  };

  // §6: four independent stochastic beam searches.
  const pool: BeamItem[] = beamSearch<undefined>(
    source,
    undefined,
    {
      eras: depth,
      stepsPerEra: AGEING.stepsPerEra,
      runs: AGEING.runs,
      beamWidth: AGEING.beamWidth,
      temperature: AGEING.temperature,
      weight: (era) => eraWeight(era, depth),
      stepLimit: AGEING.stepLimit,
      startForm: (form) => alphabetFit(form, inv.letters),
      expand: (form) => variants(form).map((f) => ({ form: f, state: undefined })),
      score,
    },
    input.rng,
  );

  // §7.1 filtering.
  const finalW = eraWeight(depth, depth);
  const floor = AGEING.depthFloor[depth];
  const best = new Map<string, BeamItem & { score: number }>();
  for (const item of pool) {
    if (item.form === source) continue;
    if (rSource(item.form) < floor) continue;
    if (plausibility(item.form) < AGEING.minPlausibility) continue;
    if (Array.from(item.form).some((ch) => !SEPARATOR.test(ch) && !inv.letters.has(ch))) continue;
    const s = score(item.form, finalW);
    const existing = best.get(item.form);
    if (!existing || s > existing.score) best.set(item.form, { ...item, score: s });
  }

  // §7.2 ranking and diversity.
  const ranked = [...best.values()].sort((a, b) => b.score - a.score || a.form.localeCompare(b.form));
  const selected: typeof ranked = [];
  for (const threshold of AGEING.diversity) {
    for (const c of ranked) {
      if (selected.length >= count) break;
      if (selected.includes(c)) continue;
      if (selected.every((s) => normalisedDistance(s.form, c.form) >= threshold)) selected.push(c);
    }
  }
  for (const c of ranked) {
    if (selected.length >= count) break;
    if (!selected.includes(c)) selected.push(c);
  }

  // §7.3 trail tidy-up.
  const candidates = selected.map((c) => ({
    name: titleCase(c.form),
    trail: c.trail.filter((f, i) => i === 0 || f !== c.trail[i - 1]).map(titleCase),
    score: c.score,
    plausibility: plausibility(c.form),
    recognisability: rSource(c.form),
  }));
  const notice =
    candidates.length < AGEING.noticeBelow
      ? `Only ${candidates.length} candidates survived. Try a lower depth or a different target pack.`
      : undefined;
  return { candidates, notice };
}

// ── Takeover profile (takeover brief) ───────────────────────────────────────

/** The takeover pack's inventories and plausibility reference, built once and shared by a batch. */
export interface TakeoverTarget {
  inv: TargetInventory;
  plausibility: (form: string) => number;
  /** Takeover-profile variants of one word, cached for the batch. */
  wordVariants: (word: string) => Map<string, MoveId>;
}

export function prepareTakeoverTarget(
  targetNames: string[],
  buildScorer: AgeingInput["buildScorer"],
  extraEndings?: string[],
): TakeoverTarget {
  if (targetNames.length < AGEING.minTargetNames) {
    throw new Error(`A takeover pack needs at least ${AGEING.minTargetNames} names.`);
  }
  const inv = buildInventory(targetNames, extraEndings);
  const cache = new Map<string, Map<string, MoveId>>();
  const variantsOf = (word: string) => {
    let v = cache.get(word);
    if (!v) {
      v = wordVariants(word, inv, TAKEOVER_MOVES);
      cache.set(word, v);
    }
    return v;
  };
  return { inv, plausibility: plausibilityScorer(targetNames, buildScorer), wordVariants: variantsOf };
}

export interface AdoptionInput {
  /** The generated native name. */
  native: string;
  /** From prepareTakeoverTarget, or the pack itself (prepared on each call). */
  target: TakeoverTarget | { targetNames: string[]; extraEndings?: string[]; buildScorer: AgeingInput["buildScorer"] };
  /** This adoption's RNG; four independent search streams are drawn from it. */
  rng: () => number;
}

export interface Adoption {
  native: string;
  adopted: string;
  score: number;
  plausibility: number;
  recognisability: number;
  /** Moves applied, in order (alphabet fit not included). */
  moves: MoveId[];
}

interface TakeoverState {
  /** M10 and M11 counts per word, indexed by `splitForm` part. */
  added: number[];
  inserted: number[];
  moves: MoveId[];
}

/** §3: a word under three letters passes through untouched (de, Ó, ibn). */
export function isPassthroughWord(word: string): boolean {
  return !SEPARATOR.test(word) && Array.from(word).length < TAKEOVER.passthroughBelow;
}

/**
 * Adopts one native name into the takeover pack's language in a single event (§4): the best
 * candidate passing every §4.4 filter, or null if none does (or the name has no word of 3+ letters).
 */
export function adoptName(input: AdoptionInput): Adoption | null {
  const target =
    "inv" in input.target
      ? input.target
      : prepareTakeoverTarget(input.target.targetNames, input.target.buildScorer, input.target.extraEndings);
  const native = input.native.trim().replace(/\s+/g, " ");
  if (!/^[\p{L} \-']+$/u.test(native)) return null;
  const nativeParts = splitForm(native);
  const isContent = (p: string) => !SEPARATOR.test(p) && !isPassthroughWord(p);
  if (!nativeParts.some(isContent)) return null;

  const source = native.toLowerCase();
  const { inv, plausibility: plausibilityOf } = target;
  // §4.3: P and R are taken over the words that aren't passthrough.
  const content = (form: string) => splitForm(form).filter(isContent).join(" ");
  const sourceContent = content(source);
  const P = (form: string) => plausibilityOf(content(form));
  const rCache = new Map<string, number>();
  const R = (form: string) => {
    let r = rCache.get(form);
    if (r === undefined) {
      r = recognisability(sourceContent, content(form));
      rCache.set(form, r);
    }
    return r;
  };
  const score = (form: string, w: number) => w * P(form) + (1 - w) * R(form);

  const zeros = () => nativeParts.map(() => 0);
  const pool = beamSearch<TakeoverState>(
    source,
    { added: zeros(), inserted: zeros(), moves: [] },
    {
      eras: TAKEOVER.eras,
      stepsPerEra: TAKEOVER.stepsPerEra,
      runs: TAKEOVER.runs,
      beamWidth: TAKEOVER.beamWidth,
      temperature: TAKEOVER.temperature,
      weight: () => TAKEOVER.pWeight,
      stepLimit: undefined,
      // §4.1: alphabet fit once, before the first move step; passthrough words untouched.
      startForm: (form) =>
        splitForm(form)
          .map((p) => (isContent(p) ? alphabetFit(p, inv.letters) : p))
          .join(""),
      expand: (form, state) =>
        formVariantsDetailed(form, inv, TAKEOVER_MOVES, isPassthroughWord, (part, move) =>
          move === "M10"
            ? state.added[part] < TAKEOVER.maxEndingAdditions
            : move === "M11"
              ? state.inserted[part] < TAKEOVER.maxVowelInsertions
              : true,
          target.wordVariants,
        ).map((v) => {
          const added = v.move === "M10" ? state.added.map((n, i) => (i === v.part ? n + 1 : n)) : state.added;
          const inserted = v.move === "M11" ? state.inserted.map((n, i) => (i === v.part ? n + 1 : n)) : state.inserted;
          return { form: v.form, state: { added, inserted, moves: [...state.moves, v.move] } };
        }),
      score,
    },
    input.rng,
  );

  // §4.4 filtering, then the single highest-scoring candidate.
  let best: SearchItem<TakeoverState> | null = null;
  let bestScore = -Infinity;
  for (const item of pool) {
    if (item.form === source) continue;
    if (R(item.form) < TAKEOVER.minRecognisability) continue;
    if (P(item.form) < TAKEOVER.minPlausibility) continue;
    if (Array.from(content(item.form)).some((ch) => !SEPARATOR.test(ch) && !inv.letters.has(ch))) continue;
    const s = score(item.form, TAKEOVER.pWeight);
    if (s > bestScore || (s === bestScore && best && item.form.localeCompare(best.form) < 0)) {
      best = item;
      bestScore = s;
    }
  }
  if (!best) return null;

  // Ageing §7.3 casing; passthrough words keep their generated casing.
  const adopted = splitForm(best.form)
    .map((p, i) => (SEPARATOR.test(p) ? p : isPassthroughWord(p) ? nativeParts[i] : titleCase(p)))
    .join("");
  return {
    native,
    adopted,
    score: bestScore,
    plausibility: P(best.form),
    recognisability: R(best.form),
    moves: best.state.moves,
  };
}
