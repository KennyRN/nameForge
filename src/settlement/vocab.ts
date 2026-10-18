// Shared settlement vocabulary (Route names brief §3): the pools in settlement-vocab.json, filtered
// by culture, era and the fantastic switch, and vocabulary packs (`type: vocabulary` notes) that add
// words to them. Route names reads these pools, and every later settlement module will too.
// No Obsidian imports.

import vocabData from "../data/settlement-vocab.json";
import { GROUP_TONES, type GroupTone, hasBannedWord } from "../groups/engine";
import { scaleAllows, type ScaleChoice, type SpaceScale } from "../space/scale";

// ── Data ────────────────────────────────────────────────────────────────────

export type SettlementEra = "AN" | "MD" | "EM" | "ST" | "MO" | "NF" | "IS";

/** §3.1: one word in a pool. */
export interface VocabEntry {
  w: string;
  /** Weight (1). */
  x?: number;
  /** Tone tags. */
  t?: GroupTone[];
  /** Eras where it's used (all). */
  e?: SettlementEra[];
  /** Cultures where it's used (all); `!key` excludes; "british" and "christian" name groups. */
  c?: string[];
  /** true: fantastic only; false: realistic only (both). */
  h?: boolean;
  /** Plural, where `pluralOf` would be wrong. */
  pl?: string;
  /** Streets brief §3.1: region codes where the entry is used (British cultures only; all regions). */
  r?: string[];
  /** Region multipliers for the British cultures ("Gate: NTH EMD ×3, EAN ×1.5"). */
  rx?: Record<string, number>;
  /** Route names §4.4: a route region tag on a fixed whole name. */
  rt?: string;
  /** Seas and coasts brief §3.4: a biome tag, weighted by the chosen biome (and the region tag `rt` by region). */
  bt?: string;
  /** Streets brief §7.2: the district functions a fixed district name serves ("any": every one). */
  fn?: string[];
  /** Inns brief §3: themes (rural, urban, maritime, road, magical). */
  th?: string[];
  /** Deities brief §5: the gender a divine figure or kin word is for (m, f, n; unmarked reads as n). */
  g?: "m" | "f" | "n";
  /** Stellar brief §2.4: the space scales the entry is used at (all). */
  sc?: SpaceScale[];
  /** Money brief §5: the value tiers the entry fits (h high, m middle, l low; all three). Other modules ignore it. */
  v?: ValueTier[];
  /** Money brief §7: the familiar English loanword for a culture's translated coin name (`Little Flower` → `Florin`). */
  loan?: string;
  /** Money brief §5: the fixed row of money shapes the entry belongs to; none is a culture's own name. */
  fx?: string;
  /** Money brief §5: a fraction word's move along the tiers (1 lowers one step, -1 raises one). */
  ts?: number;
}

export type ValueTier = "h" | "m" | "l";
export const VALUE_TIERS: ValueTier[] = ["h", "m", "l"];

export interface VocabPool {
  entries: VocabEntry[];
  /** §3.1: words added for a culture at ×3. */
  cultureExtra?: Record<string, VocabEntry[]>;
}

interface VocabData {
  eras: SettlementEra[];
  cultures: string[];
  /** Money brief §3.2: cultures only the money module offers (they are in `cultures` so packs can tag them). */
  moneyOnly?: string[];
  cultureGroups: Record<string, { cultures: string[]; from?: Record<string, SettlementEra> }>;
  regionTags: string[];
  regions: string[];
  themes: string[];
  pools: Record<string, VocabPool>;
}

export const SETTLEMENT_VOCAB = vocabData as unknown as VocabData;
export const VOCAB_ERAS = SETTLEMENT_VOCAB.eras;
/** Money brief §3.2: the four cultures only money and coins offers; no other module's menu lists them. */
export const MONEY_ONLY_CULTURES = SETTLEMENT_VOCAB.moneyOnly ?? [];
/** The 22 cultures every settlement module offers. */
export const VOCAB_CULTURES = SETTLEMENT_VOCAB.cultures.filter((c) => !MONEY_ONLY_CULTURES.includes(c));
/** Every culture a vocabulary pack heading can name, the money-only ones too. */
export const VOCAB_ALL_CULTURES = SETTLEMENT_VOCAB.cultures;
export const VOCAB_CULTURE_GROUPS = Object.keys(SETTLEMENT_VOCAB.cultureGroups);
export const VOCAB_REGION_TAGS = SETTLEMENT_VOCAB.regionTags;
/** Streets brief §3.1: the place-shape region codes. */
export const VOCAB_REGIONS = SETTLEMENT_VOCAB.regions;
/** Inns brief §3: the themes an entry can carry. */
export const VOCAB_THEMES = SETTLEMENT_VOCAB.themes;
/** Every pool name, in file order. */
export const POOL_NAMES = Object.keys(SETTLEMENT_VOCAB.pools);

const eraIndex = (era: SettlementEra) => VOCAB_ERAS.indexOf(era);

/** §4.1: whether a culture belongs to a named group in an era (christian: greek-byzantine and roman from MD). */
export function inCultureGroup(group: string, culture: string, era: SettlementEra): boolean {
  const g = SETTLEMENT_VOCAB.cultureGroups[group];
  if (!g) return false;
  if (g.cultures.includes(culture)) return true;
  const from = g.from?.[culture];
  return !!from && eraIndex(era) >= eraIndex(from);
}

/** §3.1: whether a `c` list allows a culture: no positive keys is every culture; `!key` excludes. */
export function cultureAllowed(c: readonly string[] | undefined, culture: string, era: SettlementEra): boolean {
  if (!c || c.length === 0) return true;
  const matches = (key: string) => key === culture || inCultureGroup(key, culture, era);
  const positive = c.filter((k) => !k.startsWith("!"));
  if (c.some((k) => k.startsWith("!") && matches(k.slice(1)))) return false;
  return positive.length === 0 || positive.some(matches);
}

/** Where a pool is read: a culture, an era and the fantastic switch. */
export interface VocabWhere {
  culture: string;
  era: SettlementEra;
  fantastic: boolean;
  /** Streets brief §3.1: a region code; only the British cultures read it. */
  region?: string;
  /** Inns brief §3: theme multipliers a module asks for (the inn setting); other modules leave it out. */
  themes?: Record<string, number>;
  /** Stellar brief §2.4: a space scale; entries tagged for other scales are left out. */
  scale?: ScaleChoice;
}

/** Streets brief §3.1: the region a culture reads entries for (British cultures only). */
const regionFor = (where: VocabWhere) => (where.region && inCultureGroup("british", where.culture, where.era) ? where.region : undefined);

/** §3.1: whether an entry is used here (era, culture, fantastic, region). */
export function entryAllowed(e: VocabEntry, where: VocabWhere): boolean {
  if (e.e && !e.e.includes(where.era)) return false;
  if (e.h !== undefined && e.h !== where.fantastic) return false;
  if (where.scale && !scaleAllows(e, where.scale)) return false;
  const region = regionFor(where);
  if (region && e.r && !e.r.includes(region)) return false;
  return cultureAllowed(e.c, where.culture, where.era);
}

/** Streets brief §5.2: an entry's region multiplier here. */
const regionX = (e: VocabEntry, where: VocabWhere) => {
  const region = regionFor(where);
  return region ? e.rx?.[region] ?? 1 : 1;
};

/** Inns brief §3: an entry's theme multiplier here (each of its themes the module asks for). */
const themeX = (e: VocabEntry, where: VocabWhere) => (e.th ?? []).reduce((n, t) => n * (where.themes?.[t] ?? 1), 1);

// ── Merged vocabularies ─────────────────────────────────────────────────────

/** The pools as modules read them: built-in words plus every vocabulary pack's. */
export interface Vocabulary {
  pools: Record<string, VocabPool>;
}

export const BUILT_IN_VOCAB: Vocabulary = { pools: SETTLEMENT_VOCAB.pools };

/** §3.1: a pool's words here, weighted; the culture's extra words ×3 (a word already there is tripled). */
export function poolEntries(vocab: Vocabulary, name: string, where: VocabWhere): [VocabEntry, number][] {
  const pool = vocab.pools[name];
  if (!pool) throw new Error(`Settlement vocabulary: no pool “${name}”.`);
  const out: [VocabEntry, number][] = [];
  const at = new Map<string, number>();
  const add = (e: VocabEntry, w: number) => {
    const i = at.get(e.w);
    if (i !== undefined) out[i][1] += w;
    else {
      at.set(e.w, out.length);
      out.push([e, w]);
    }
  };
  for (const e of pool.entries) if (entryAllowed(e, where)) add(e, (e.x ?? 1) * regionX(e, where) * themeX(e, where));
  for (const e of pool.cultureExtra?.[where.culture] ?? []) {
    if (!entryAllowed(e, where)) continue;
    const i = at.get(e.w);
    if (i !== undefined) out[i][1] *= 3;
    else add(e, (e.x ?? 1) * 3);
  }
  return out.filter(([, w]) => w > 0);
}

// ── Vocabulary packs (§3.3) ─────────────────────────────────────────────────

export const VOCABULARY_TYPE = "vocabulary";

export function isVocabularyPackContent(content: string): boolean {
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  return !!fm && new RegExp(`^type:\\s*["']?${VOCABULARY_TYPE}["']?\\s*$`, "m").test(fm[1]);
}

export interface VocabPackSection {
  pool: string;
  culture?: string;
  era?: SettlementEra;
  region?: string;
  entries: VocabEntry[];
}

/** Money brief §5: the pools that read `[loan]` and `(h)`, `(m)`, `(l)` in a pack line. */
const isMoneyPool = (pool: string) => pool.startsWith("moneyFixed:") || MONEY_WORD_POOLS.includes(pool);
const MONEY_WORD_POOLS = ["coinMetal", "coinWord", "coinEmblem", "coinFraction", "coinShapeWord", "earlyMoney", "goodsMoney", "paperWord", "tokenWord", "unitWord", "moneyNickname", "sfMoney"];

/** §3.3: a pack line: `- word`, then ` ×n`, ` (tone, tone)` and (Inns brief §3) ` [theme]`, in any order.
 * In the money pools (Money brief §5) the brackets hold a loan form and the round brackets may hold tiers. */
function parseLine(text: string, pool = ""): VocabEntry | undefined {
  const money = isMoneyPool(pool);
  let rest = text.trim();
  let x: number | undefined;
  let t: GroupTone[] | undefined;
  let th: string[] | undefined;
  let loan: string | undefined;
  let v: ValueTier[] | undefined;
  for (let i = 0; i < 3; i++) {
    const themes = rest.match(/\s*\[([^[\]]*)\]$/);
    if (themes && money && loan === undefined) {
      loan = themes[1].trim();
      rest = rest.slice(0, themes.index).trim();
      continue;
    }
    if (themes && !money && th === undefined) {
      th = themes[1].split(/[,\s]+/).map((x) => x.trim().toLowerCase()).filter((x) => VOCAB_THEMES.includes(x));
      rest = rest.slice(0, themes.index).trim();
      continue;
    }
    const weight = rest.match(/\s*×\s*(\d+(?:\.\d+)?)$/);
    if (weight && x === undefined) {
      x = parseFloat(weight[1]);
      rest = rest.slice(0, weight.index).trim();
      continue;
    }
    const tones = rest.match(/\s*\(([^()]*)\)$/);
    if (tones && t === undefined) {
      const words = tones[1].split(/[,\s]+/).map((s) => s.trim().toLowerCase());
      t = words.filter((s): s is GroupTone => (GROUP_TONES as string[]).includes(s));
      if (money) v = words.filter((s): s is ValueTier => (VALUE_TIERS as string[]).includes(s));
      rest = rest.slice(0, tones.index).trim();
    }
  }
  if (!rest) return undefined;
  return {
    w: rest,
    ...(x !== undefined ? { x } : {}),
    ...(t && t.length > 0 ? { t } : {}),
    ...(th && th.length > 0 ? { th } : {}),
    ...(v && v.length > 0 ? { v } : {}),
    ...(loan ? { loan } : {}),
  };
}

/** §3.3: a pack's sections; an unknown pool or culture is reported and its section skipped. */
export function parseVocabularyPack(content: string, note: string): { sections: VocabPackSection[]; problems: string[] } {
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  const body = fm ? content.slice(fm[0].length) : content;
  const sections: VocabPackSection[] = [];
  const problems: string[] = [];
  let current: VocabPackSection | null = null;
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    const heading = line.match(/^##\s+(.+?)\s*#*$/);
    if (heading) {
      current = null;
      const [pool, ...parts] = heading[1].split(/\s*·\s*/).map((p) => p.trim());
      if (!SETTLEMENT_VOCAB.pools[pool]) {
        problems.push(`Unknown pool “${pool}” in vocabulary pack “${note}”.`);
        continue;
      }
      const section: VocabPackSection = { pool, entries: [] };
      let bad = false;
      for (const part of parts) {
        if ((VOCAB_ERAS as string[]).includes(part)) section.era = part as SettlementEra;
        else if (VOCAB_ALL_CULTURES.includes(part)) section.culture = part;
        else if (VOCAB_REGIONS.includes(part)) section.region = part;
        else {
          problems.push(`Unknown culture “${part}” in vocabulary pack “${note}”.`);
          bad = true;
        }
      }
      if (bad) continue;
      sections.push(section);
      current = section;
      continue;
    }
    const bullet = line.match(/^[-*+]\s+(.+)$/);
    if (!bullet || !current) continue;
    const entry = parseLine(bullet[1], current.pool);
    if (entry) current.entries.push(entry);
  }
  return { sections, problems };
}

/** §3.3: the built-in pools with every pack's words added; packs never remove a word, and a word
 * the safeguards block (banned words, and `blocked` when given) is dropped. */
export function mergeVocabularyPacks(
  packs: readonly { name: string; content: string }[],
  blocked: (word: string, pool?: string) => boolean = () => false,
): { vocab: Vocabulary; notices: string[] } {
  const notices: string[] = [];
  if (packs.length === 0) return { vocab: BUILT_IN_VOCAB, notices };
  const pools: Record<string, VocabPool> = {};
  for (const [name, pool] of Object.entries(SETTLEMENT_VOCAB.pools)) pools[name] = { ...pool, entries: [...pool.entries] };
  for (const pack of packs) {
    const { sections, problems } = parseVocabularyPack(pack.content, pack.name);
    notices.push(...problems);
    for (const s of sections) {
      for (const e of s.entries) {
        if (hasBannedWord(e.w) || blocked(e.w, s.pool)) continue;
        pools[s.pool].entries.push({ ...e, ...(s.culture ? { c: [s.culture] } : {}), ...(s.era ? { e: [s.era] } : {}), ...(s.region ? { r: [s.region] } : {}) });
      }
    }
  }
  return { vocab: { pools }, notices };
}

/** §3.3: the note "Create vocabulary pack" writes: every pool as an empty heading. */
export const VOCABULARY_PACK_TEMPLATE = [
  "---",
  `type: ${VOCABULARY_TYPE}`,
  "---",
  "",
  "Words added here join nameForge's shared pools: add `- word` lines under a pool, optionally with ` ×0.5`, ` (grim)` or ` [maritime]`, and narrow a heading with ` · japanese`, ` · MD` or ` · NTH`.",
  "",
  ...POOL_NAMES.flatMap((p) => [`## ${p}`, ""]),
].join("\n");
