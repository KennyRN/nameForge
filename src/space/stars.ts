// Stellar brief §4: how stars are named. Five kinds - proper, possessive, Bayer, catalogue and planet.
// Obsidian-free; the proper-name list is the group names' own `star` list.

import groupData from "../data/group-names.json";
import { SPACE_DATA, type ScaleChoice } from "./scale";

const STARS = SPACE_DATA.stars;
const LISTS = (groupData as unknown as { lists: Record<string, { w: string }[]> }).lists;

export type StarKind = "proper" | "possessive" | "bayer" | "catalogue";

const weighted = <T>(items: [T, number][], rng: () => number): T => {
  const total = items.reduce((n, [, w]) => n + w, 0);
  let r = rng() * total;
  for (const [item, w] of items) {
    r -= w;
    if (r < 0) return item;
  }
  return items[items.length - 1][0];
};

/** §4.2: the proper names. */
export const PROPER_STARS = (): string[] => LISTS.star.map((e) => e.w);

/** §4.5: a catalogue name, e.g. "Gliese 581" or "Kepler-452". */
export function catalogueName(rng: () => number): string {
  const row = weighted(STARS.catalogue.map((c): [(typeof STARS.catalogue)[number], number] => [c, c.w]), rng);
  const n = row.min + Math.floor(rng() * (row.max - row.min + 1));
  return `${row.prefix}${row.joiner}${n}`;
}

/** §4.6: " d" - a planet letter, lower case, with its leading space. */
export function planetLetter(rng: () => number): string {
  return ` ${weighted(Object.entries(STARS.planetLetters), rng)}`;
}

/** §4.6: a catalogue name that names a world or settlement takes a letter 30% of the time. */
export function catalogueWorld(rng: () => number, letters = true): string {
  const name = catalogueName(rng);
  return letters && rng() < STARS.planetLetterChance ? name + planetLetter(rng) : name;
}

/** §4.4: Greek letter + constellation genitive. */
export function bayerName(rng: () => number): string {
  const greek = LISTS.greek.map((e): [string, number] => [e.w, STARS.greekHeavy.letters.includes(e.w) ? STARS.greekHeavy.weight : STARS.greekHeavy.other]);
  return `${weighted(greek, rng)} ${STARS.genitives[Math.floor(rng() * STARS.genitives.length)]}`;
}

export interface DrawStarOptions {
  /** The drawing module's own person token; without it only the real possessives are used. */
  person?: () => string | undefined;
}

/** §4.3: a possessive star: a real one half the time, otherwise "{person}'s Star". */
export function possessiveName(rng: () => number, opts?: DrawStarOptions): string {
  const real = STARS.possessiveReal;
  const person = opts?.person;
  if (!person || rng() < STARS.possessiveRealShare) return real[Math.floor(rng() * real.length)];
  const who = person()?.replace(/^the /i, "");
  if (!who) return real[Math.floor(rng() * real.length)];
  return `${who}'s Star`;
}

/** §4.7: a star name for a scale. `pickProper` supplies the proper-name draw (the list is tone/setting-aware in the group engine). */
export function drawStarOfKind(kind: StarKind, rng: () => number, pickProper: () => string, opts?: DrawStarOptions): string {
  switch (kind) {
    case "proper":
      return pickProper();
    case "possessive":
      return possessiveName(rng, opts);
    case "bayer":
      return bayerName(rng);
    case "catalogue":
      return catalogueName(rng);
  }
}

export function drawStarKind(scale: ScaleChoice, rng: () => number): StarKind {
  const row = STARS.kindWeights[scale] ?? STARS.kindWeights.any;
  return weighted(Object.entries(row).filter(([, w]) => w > 0) as [StarKind, number][], rng);
}

export function drawStar(scale: ScaleChoice, rng: () => number, pickProper?: () => string, opts?: DrawStarOptions): string {
  const proper = pickProper ?? (() => PROPER_STARS()[Math.floor(rng() * PROPER_STARS().length)]);
  return drawStarOfKind(drawStarKind(scale, rng), rng, proper, opts);
}

/** §6.6: "Barnard's Star" + Run reads "Barnard's Run". */
export function dropStarWord(star: string): string {
  return star.replace(/('s) Star$/, "$1");
}

// ── §4.8 spoken catalogue names ─────────────────────────────────────────────

const ONES = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

/** 1–99 in title case: "Seven", "Twelve", "Twenty-Two". */
function small(n: number): string {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  return n % 10 === 0 ? TENS[tens] : `${TENS[tens]}-${ONES[n % 10]}`;
}

/** A two-digit pair as read in a catalogue number: 07 is "Oh-Seven". */
function pair(n: number): string {
  return n < 10 ? `Oh-${ONES[n]}` : small(n);
}

/** §4.8: a catalogue number read aloud. */
export function spokenNumber(n: number): string {
  if (n >= 10000) return spokenNumber(n % 1000 === 0 ? 1000 : n % 1000);
  if (n <= 99) return small(n);
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    return rest === 0 ? `${ONES[hundreds]} Hundred` : `${ONES[hundreds]}-${pair(rest)}`;
  }
  const high = Math.floor(n / 100);
  const low = n % 100;
  if (n % 1000 === 0) return `${ONES[n / 1000]} Thousand`;
  if (low === 0) return `${small(high)} Hundred`;
  return `${small(high)}-${pair(low)}`;
}

/** §4.8: the clipped form colonists would say aloud: "Gliese 581 d" → "Five-Eighty-One Dee". */
export function spokenCatalogue(name: string): string {
  const m = /^.*?[ -](\d+)(?: ([b-h]))?$/.exec(name.trim());
  if (!m) return name;
  const base = spokenNumber(Number(m[1]));
  return m[2] ? `${base} ${STARS.letterWords[m[2]] ?? m[2]}` : base;
}
