// Place modules split brief §4: sources. A focused place module's kind may borrow names from the
// retired engines (the British shapes with a region, the colonial patterns of part 2 or 2a), restricted
// to the generics or groups that fit the kind, or delegate whole to another engine (settlement names,
// the river engine). This is the one place that resolves a draw; no engine keeps a copy. Obsidian-free;
// every roll comes from the stream the module passes in.

import { generatePlaceNames, type ResolvedSlot } from "../names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe } from "../names/recipe";
import { generateRiverNames, type RiverSetting } from "../rivers/engine";
import { generateSettlementNames, type SettlementNamesOptions } from "../settlement/names";
import type { SizeKey } from "../settlement/data";
import { INTERSTELLAR_ERA, WORLD_CULTURES } from "../world/engine";
import { isTraditionAvailable } from "../colonialShapes";
import { WILDS_DATA } from "../wilds/engine";
import lens from "../data/lens.json";
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
  people?: "placeholders" | "invented";
  /** Series mode draws from own shapes only. */
  series?: boolean;
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
  const entry: string | { tradition: string; weight: number }[] | undefined = (link.cultureToColonial as Record<string, string | undefined>)[culture] ?? link.cultureToColonialAdded?.[culture];
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
  return culture in link.cultureToColonial || !!link.cultureToColonialAdded && culture in link.cultureToColonialAdded;
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
      return result.names[0]?.text;
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
    const result = generateRiverNames({ setting, region: setting === "british" ? ctx.region : undefined, count: 1, seed: seedFrom(ctx.rng) });
    return result.names[0]?.text;
  }
  const size = delegate.sizes[Math.floor(ctx.rng() * delegate.sizes.length)] ?? "any";
  const options = settlementDelegateOptions(delegate, ctx, size, seedFrom(ctx.rng));
  if (!options) return undefined;
  try {
    return generateSettlementNames(options).names[0]?.text;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("No eligible")) return undefined;
    throw e;
  }
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
