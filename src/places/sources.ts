// Place modules split brief §4: sources. A focused place module's kind may borrow names from the
// retired engines (the British shapes with a region, the colonial patterns of part 2 or 2a), restricted
// to the generics or groups that fit the kind, or delegate whole to another engine (settlement names,
// the river engine). This is the one place that resolves a draw; no engine keeps a copy. Obsidian-free;
// every roll comes from the stream the module passes in.

import LENS from "../data/lens.json";
import { generatePlaceNames, type ResolvedSlot } from "../names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe } from "../names/recipe";
import { generateRiverNames, type RiverSetting } from "../rivers/engine";
import { generateSettlementNames, type SettlementNamesOptions } from "../settlement/names";
import type { SizeKey } from "../settlement/data";
import { INTERSTELLAR_ERA, WORLD_CULTURES } from "../world/engine";
import { isTraditionAvailable } from "../colonialShapes";
import { WILDS_DATA } from "../wilds/engine";
import lens from "../data/lens.json";
import { fillSlots, registerResolver, type FillRequest } from "../fill";
import { spaceBiomeFor } from "../biomes";
import type { SpaceScale } from "../space/scale";
import { groupsAtScale } from "./space";

export type PlaceWhere = "home" | "new" | "settled";

/** A kind's whole delegation: names come from another engine, and the shares are ignored (§4.1). */
export type KindDelegate =
  | { engine: "settlement"; sizes: SizeKey[] }
  | { engine: "rivers" };

/** The `sources` entry of a kind in a module's table (§4.1). */
export interface KindSources {
  /** Home: British generics (place-shapes.json ids) drawn with the region. */
  native?: { generics: string[] };
  /** New and settled: colonial groups (every generic of each) and generics of the part 2 or 2a patterns. */
  colonial?: { groups?: string[]; generics?: string[] };
  delegate?: KindDelegate;
  /** Stars and space (§5.5): a share for a where that replaces the shared one (every kind is all source, so 1). */
  share?: Partial<Record<"home" | "new" | "settled", number>>;
}

export interface SourceShares {
  home: { source: "native"; share: number; cultures: string[] };
  new: { source: "colonial"; part: "2"; share: number };
  settled: { source: "colonial"; part: "2a"; share: number };
}

/** The shares and the cultures the native source serves: data, in lens.json (`sourceShares`). */
export const SOURCE_SHARES = (lens as unknown as { sourceShares: SourceShares }).sourceShares;

/** What a draw needs to know about the batch it belongs to. */
export interface SourceContext {
  where: PlaceWhere;
  /** The module's culture key (a legacy key such as `norman-british`, `celtic`, `norse`). */
  culture: string;
  /** Home only: a place-shape region code for the British shapes. */
  region?: string;
  /** `invented` passes through to the source: its slots are filled as the caller resolves them (default none: built-in lists, else placeholders). */
  people?: "real" | "generated" | "placeholders" | "invented";
  /** Series mode draws from own shapes only. */
  series?: boolean;
  /** Shared tables brief §14.2: the filler will name the people, so the native source's "[personal name]" is marked as an old one ("[old personal name]"). */
  oldNames?: boolean;
  /** Stars and space: the scale this name is drawn at. The colonial source then runs under that scale's space biome, restricted to the kind's groups there. */
  scale?: SpaceScale;
  /** The batch's stream. */
  rng: () => number;
  /** Slots resolved by the caller for the source's renderer; absent is the engines' own default. */
  slots?: Record<string, ResolvedSlot>;
}

const seedFrom = (rng: () => number): number => Math.floor(rng() * 4294967296) >>> 0;

/** §3.2: a culture's colonial tradition, drawn by weight where the entry has two; `undefined` for none, "general" for the general one. */
export function colonialTraditionOf(culture: string, rng: () => number): string | undefined {
  const link = WILDS_DATA.settlementLink;
  const entry = link.cultureToColonial[culture];
  if (entry === undefined) return undefined;
  if (typeof entry === "string") return entry;
  const total = entry.reduce((sum, e) => sum + e.weight, 0);
  let roll = rng() * total;
  for (const e of entry) {
    roll -= e.weight;
    if (roll < 0) return e.tradition;
  }
  return entry[entry.length - 1].tradition;
}

/** Whether a culture has a colonial tradition at all (§3.2). */
export const hasColonialTradition = (culture: string): boolean => {
  const link = WILDS_DATA.settlementLink;
  return culture in link.cultureToColonial;
};

/** The source a kind could draw from in this state, before any roll: native at home for a British culture, colonial for new and settled for a culture with a tradition. */
export function sourceFor(kind: KindSources, ctx: Pick<SourceContext, "where" | "culture">): "native" | "colonial" | undefined {
  if (ctx.where === "home") return kind.native && SOURCE_SHARES.home.cultures.includes(ctx.culture) ? "native" : undefined;
  return kind.colonial && hasColonialTradition(ctx.culture) ? "colonial" : undefined;
}

const shareOf = (where: PlaceWhere, kind?: KindSources): number => kind?.share?.[where] ?? SOURCE_SHARES[where].share;

/** One name from a source, or undefined where it can give nothing for this kind and state. */
export function drawFromSource(kind: KindSources, source: "native" | "colonial", ctx: SourceContext): string | undefined {
  const slots = ctx.slots ?? {};
  try {
    if (source === "native") {
      const recipe = britishPlaceNamesRecipe(ctx.region);
      const result = generatePlaceNames({ recipe, slots, count: 1, seed: seedFrom(ctx.rng), only: { generics: kind.native!.generics } });
      const text = result.names[0]?.text;
      return ctx.oldNames ? text?.replace(/\[personal name\]/gi, "[old personal name]") : text;
    }
    const tradition = colonialTraditionOf(ctx.culture, ctx.rng);
    const part = ctx.where === "new" ? "new-land" : "established";
    // A tradition that exists only in the other part (Chinese, say, is a part 2a tradition) gives this part nothing.
    if (tradition !== undefined && tradition !== "general" && !isTraditionAvailable(tradition, ctx.where === "new" ? "2" : "2a")) return undefined;
    if (ctx.scale) {
      // §5.5: under a space biome of the scale, from the kind's groups that live there.
      const groups = groupsAtScale(kind, ctx.scale);
      if (groups.length === 0) return undefined;
      const recipe = colonialPlaceNamesRecipe(part, tradition === "general" ? undefined : tradition, undefined, spaceBiomeFor(ctx.scale).id);
      const result = generatePlaceNames({ recipe, slots, count: 1, seed: seedFrom(ctx.rng), only: { groups } });
      return result.names[0]?.text;
    }
    const recipe = colonialPlaceNamesRecipe(part, tradition === "general" ? undefined : tradition, undefined);
    const result = generatePlaceNames({ recipe, slots, count: 1, seed: seedFrom(ctx.rng), only: kind.colonial });
    return result.names[0]?.text;
  } catch (e) {
    // A filter that leaves nothing (no generic fits the state) gives nothing; any other error is real.
    if (e instanceof Error && e.message.startsWith("No eligible")) return undefined;
    throw e;
  }
}

/** Shared tables brief §14.3: the biome a folk fill is drawn in: the state's own, else temperate for a British culture at home, else none (the folk's homeland). */
export function biomeForFill(biome: string | undefined, where: string | undefined, culture: string | undefined): string | undefined {
  if (biome && biome !== "any") return biome;
  return (where === undefined || where === "home") && culture !== undefined && SOURCE_SHARES.home.cultures.includes(culture) ? "temperate" : undefined;
}

/** The settlement names options a delegated settlement kind runs with, from the module's where and culture. */
export function settlementDelegateOptions(delegate: Extract<KindDelegate, { engine: "settlement" }>, ctx: SourceContext, size: SizeKey, seed: number): SettlementNamesOptions | undefined {
  const base = { size, count: 1, seed, wilds: false };
  if (ctx.where !== "home") {
    const found = colonialTraditionOf(ctx.culture, ctx.rng);
    // Stars and space: a station is named whatever the culture, so a culture with no tradition takes the General one.
    const tradition = found ?? (ctx.scale ? "general" : undefined);
    if (tradition === undefined) return undefined;
    if (tradition !== "general" && !isTraditionAvailable(tradition, ctx.where === "new" ? "2" : "2a")) return ctx.scale ? { ...base, setting: ctx.where === "new" ? "new-lands" : "settled-lands", biome: spaceBiomeFor(ctx.scale).id, aliens: false } : undefined;
    return {
      ...base,
      setting: ctx.where === "new" ? "new-lands" : "settled-lands",
      tradition: tradition === "general" ? undefined : tradition,
      ...(ctx.scale ? { biome: spaceBiomeFor(ctx.scale).id, aliens: false } : {}),
    };
  }
  if (SOURCE_SHARES.home.cultures.includes(ctx.culture) || ctx.culture === "general") return { ...base, setting: "native", culture: "britain", region: SOURCE_SHARES.home.cultures.includes(ctx.culture) ? ctx.region : undefined };
  const world = WORLD_CULTURES.find((c) => c.id === ctx.culture);
  if (!world) return undefined;
  return { ...base, setting: "native", culture: world.id, era: world.eras.find((e) => e.id !== INTERSTELLAR_ERA)?.id };
}

/** The river engine's setting for the module's where (§5.4): British at home for a British culture, else new-land or established. */
export function riverSettingFor(ctx: Pick<SourceContext, "where" | "culture">): RiverSetting {
  if (ctx.where === "home" && SOURCE_SHARES.home.cultures.includes(ctx.culture)) return "british";
  return ctx.where === "new" ? "new-land" : "established";
}

function drawFromDelegate(delegate: KindDelegate, ctx: SourceContext): string | undefined {
  if (delegate.engine === "rivers") {
    const setting = riverSettingFor(ctx);
    const result = generateRiverNames({ setting, region: setting === "british" ? ctx.region : undefined, count: 1, seed: seedFrom(ctx.rng), sourced: true });
    return result.names[0]?.text;
  }
  const size = delegate.sizes[Math.floor(ctx.rng() * delegate.sizes.length)] ?? "any";
  let name: string | undefined;
  // Shared tables brief §13.2 item 3: a delegated settlement name never stacks a linking "-by-" or "-with-" ("Kiln-by-Ridge") onto a feature; drawn again.
  for (let attempt = 0; attempt < 8; attempt++) {
    const options = settlementDelegateOptions(delegate, ctx, size, seedFrom(ctx.rng));
    if (!options) return undefined;
    try {
      name = generateSettlementNames(options).names[0]?.text;
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("No eligible")) return undefined;
      throw e;
    }
    if (name === undefined || !/-(by|with)-/.test(name)) break;
  }
  return name;
}

/**
 * One name for a kind (§4.1). Series draws own shapes only; a delegated kind goes to its engine and
 * ignores the shares; otherwise the first roll picks the source by the share, and each side falls back
 * to the other when it gives nothing. `own` draws from the module's own shapes (undefined when the
 * kind has none).
 */
export function drawKind(kind: KindSources, ctx: SourceContext, own: () => string | undefined): string | undefined {
  if (ctx.series) return own();
  if (kind.delegate) return drawFromDelegate(kind.delegate, ctx) ?? own();
  const source = sourceFor(kind, ctx);
  if (!source) return own();
  if (ctx.rng() < shareOf(ctx.where, kind)) return drawFromSource(kind, source, ctx) ?? own();
  return own() ?? drawFromSource(kind, source, ctx);
}

// ── The filler's place and river sources (shared tables brief §5.2) ──────────────────────────────

/** "[place]", "[town]", "[homeland place name]": a settlement name of the state's culture at home, one word or two. */
function fillPlace(culture: string, region: string | undefined, rng: () => number): string | undefined {
  // Shared tables brief §13.2 item 2: the culture's settlement names, else those of the nearest lens-family culture that has some, else General.
  for (const candidate of placeCultures(culture)) {
    for (let attempt = 0; attempt < 6; attempt++) {
      const name = drawFromDelegate({ engine: "settlement", sizes: ["any"] }, { where: "home", culture: candidate, region, rng });
      if (name === undefined) break; // this culture has no settlement names
      if (name.split(/\s+/).length <= 2) return name;
    }
  }
  return undefined;
}

const LENS_CULTURES = LENS.cultures as { key: string; keys: string[]; family: string | null }[];
/** Northern Europe brief 5a: the Norse and Celtic lens cultures read through Scandinavian and the Celtic nations here, so another culture's nearest-family order is what it was. */
const FOLDED = new Set(["norse", "celtic"]);
/** The cultures whose settlement names fill a place, nearest first: the culture, its lens keys, its family, then General. */
export function placeCultures(culture: string): string[] {
  // Northern Europe brief 5a: German places are not Norse ones ("Ox Fjord"): its own, then the general ones, until German settlement names (batch 5b).
  if (culture === "german") return ["german", "general"];
  const keysOf = (c: { key: string; keys: string[] }) => [c.key, ...c.keys, ...(c.key === "scandinavian" ? ["norse"] : [])];
  const own = LENS_CULTURES.find((c) => !FOLDED.has(c.key) && (c.key === culture || c.keys.includes(culture) || (c.key === "scandinavian" && culture === "norse"))) ?? LENS_CULTURES.find((c) => c.key === culture);
  const mates = own?.family ? LENS_CULTURES.filter((c) => c !== own && !FOLDED.has(c.key) && c.family === own.family) : [];
  // Northern Europe brief 5a: a nation reads Celtic's settlement names (with its region) and Scandinavian reads Norse's before the family.
  const legacy = ["welsh", "scottish", "irish", "cornish"].includes(culture) ? "celtic" : culture === "scandinavian" ? "norse" : undefined;
  return [...new Set([culture, ...(legacy ? [legacy] : []), ...(own ? keysOf(own) : []), ...mates.flatMap(keysOf), "general"])];
}
/** The earlier period's culture for "[earlier or district name]": Anglo-Saxon for Norman & British, else the culture itself. */
const EARLIER: Record<string, string> = { "norman-british": "anglo-saxon" };

/** A delegated name may carry person brackets of its own ("[personal name]\'s Fleet"): they are filled here. */
const settled = (name: string | undefined, req: FillRequest): string | undefined => (name ? fillSlots(name, { culture: req.culture, era: req.era, region: req.region, mode: req.mode, rng: req.rng }) : undefined);
/** A drawn place whose own brackets are filled; one that still holds a bracket is drawn again (a few times). */
const placeFill = (draw: () => string | undefined, req: FillRequest): string | undefined => {
  let last: string | undefined;
  for (let attempt = 0; attempt < 6; attempt++) {
    last = settled(draw(), req);
    if (last !== undefined && !/\[/.test(last)) return last;
  }
  return last;
};
registerResolver("place", (req) => placeFill(() => fillPlace(req.culture, req.region, req.rng), req));
registerResolver("earlierPlace", (req) => placeFill(() => fillPlace(EARLIER[req.culture] ?? req.culture, req.region, req.rng) ?? fillPlace(req.culture, req.region, req.rng), req));
registerResolver("river", (req) => settled(drawFromDelegate({ engine: "rivers" }, { where: "home", culture: req.culture, region: req.region, rng: req.rng }), req));
