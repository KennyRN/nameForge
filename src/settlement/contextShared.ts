// The settlement context's type and the helpers the engines share for it (docs/settlement-kit-brief.md
// §4): which `{town}` is this place, and the ×4 weights for the context's words. No imports, so every
// engine can read it without an import cycle; buildContext() is in context.ts.

import type { GroupSetting } from "../groups/engine";

export interface SettlementContext {
  /** The settlement: every `{town}` that means this place. */
  town: string;
  /** Six other places: every `{destination}`, and every `{town}` that names somewhere else. */
  neighbours: string[];
  realm: string | null;
  founder: string;
  /** A GN §8.2 saint ("Saint Osyth") for christian cultures. */
  holy: string | null;
  trades: string[] | null;
  goods: string[];
  /** §6 step 3: the road, drove or trade route through the town. */
  throughRoute: string | null;
  /** §6 step 4: the buildings section's defences, crossings, water and monuments. */
  landmarks: string[];
  setting: GroupSetting;
  /** GN's tribal tradition for the culture. */
  tradition: string;
  vesselCulture: string;
  /** §7.1: the position's multipliers (buildings' kinds, streets' components, inns' roadside houses). */
  effects?: ContextEffects;
}

export interface ContextEffects {
  buildingKindX?: Record<string, number>;
  componentX?: Record<string, number>;
  roadsideX?: number;
}

/** §4: the ×4 weight of the context's own saint, trades and goods. */
export const CONTEXT_WEIGHT = 4;

// ── Which {town} is which (§4) ──────────────────────────────────────────────

/** §4: patterns marked `"self": true`, and the `townSelf.self` words, in an engine's data. */
export function selfPatterns(data: unknown): Set<string> {
  const out = new Set<string>();
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (typeof o.p === "string" && o.self === true) out.add(o.p);
      const ts = o.townSelf as { self?: string[] } | undefined;
      if (ts?.self) for (const p of ts.self) out.add(p);
      Object.values(o).forEach(walk);
    }
  };
  walk(data);
  return out;
}

/** §13.2: every string with `{town}` in an engine's data that is marked neither way. */
export function unmarkedTownPatterns(data: unknown): string[] {
  const listed = new Set<string>();
  const out: string[] = [];
  const has = (s: string) => /\{town[}:]/.test(s);
  const collect = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(collect);
    else if (v && typeof v === "object") {
      const ts = (v as Record<string, unknown>).townSelf as { self?: string[]; other?: string[] } | undefined;
      for (const p of [...(ts?.self ?? []), ...(ts?.other ?? [])]) listed.add(p);
      Object.values(v as object).forEach(collect);
    }
  };
  collect(data);
  const walk = (v: unknown, key?: string) => {
    if (typeof v === "string") {
      if (has(v) && key !== "townSelf" && !listed.has(v)) out.push(v);
    } else if (Array.isArray(v)) v.forEach((x) => walk(x, key));
    else if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      for (const [k, x] of Object.entries(o)) {
        if (k === "townSelf") continue;
        if (k === "p" && typeof x === "string") {
          if (has(x) && typeof o.self !== "boolean") out.push(x);
        } else walk(x, k);
      }
    }
  };
  walk(data);
  return out;
}

/** §4: one `{town}`: the settlement for the first `{town}` of a self pattern, otherwise a neighbour. */
export function contextTown(context: SettlementContext, self: boolean, rng: () => number, avoid: string[] = []): string {
  if (self) return context.town;
  const free = context.neighbours.filter((n) => !avoid.includes(n));
  const from = free.length > 0 ? free : context.neighbours;
  return from[Math.floor(rng() * from.length)];
}

/** Tracks the `{town}` tokens of one rendered pattern: only the first of a self pattern is this place. */
export class TownTurn {
  private selfDone = false;
  private used: string[] = [];
  constructor(
    private readonly context: SettlementContext,
    private readonly self: boolean,
  ) {}
  /** `{destination}`: always a neighbour. */
  other(rng: () => number): string {
    const t = contextTown(this.context, false, rng, this.used);
    this.used.push(t);
    return t;
  }
  next(rng: () => number): string {
    const isSelf = this.self && !this.selfDone;
    if (isSelf) this.selfDone = true;
    const t = contextTown(this.context, isSelf, rng, this.used);
    this.used.push(t);
    return t;
  }
}

/** §4: ×4 for the words the context chose; words it chose that the list lacks join at ×4. */
export function boostContext<T>(items: [T, number][], words: readonly string[] | null | undefined, wordOf: (t: T) => string, make?: (w: string) => T): [T, number][] {
  if (!words || words.length === 0) return items;
  const out = items.map(([t, n]): [T, number] => [t, words.includes(wordOf(t)) ? n * CONTEXT_WEIGHT : n]);
  if (make) for (const w of words) if (!out.some(([t]) => wordOf(t) === w)) out.push([make(w), CONTEXT_WEIGHT]);
  return out;
}

/** §4: the pools whose words the context chose (×4 there). */
export const CONTEXT_POOLS: Record<string, "trades" | "goods"> = { streetTrades: "trades", streetGoods: "goods", routeGoods: "goods" };

/** §4: a shared pool's entries with the context's words at ×4. */
export function boostPool<E extends { w: string }>(context: SettlementContext | undefined, pool: string, items: [E, number][]): [E, number][] {
  const which = context && CONTEXT_POOLS[pool];
  if (!which) return items;
  return boostContext(items, context[which], (e) => e.w, (w) => ({ w }) as E);
}

/** §4: `{holy}`: the context's saint at ×4 beside one other saint at ×1. */
export function contextSaint(context: SettlementContext, other: () => string, rng: () => number): string {
  if (!context.holy) return other();
  return rng() < CONTEXT_WEIGHT / (CONTEXT_WEIGHT + 1) ? context.holy : other();
}

/** §4: `{landmark}`: one of the context's landmarks (no fresh building names). */
export function contextLandmark(context: SettlementContext, rng: () => number): string | undefined {
  return context.landmarks.length > 0 ? context.landmarks[Math.floor(rng() * context.landmarks.length)] : undefined;
}

