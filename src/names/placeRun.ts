// The place-name modules' setups as plain states, how presets map to them (Wizard retirement brief
// §4) and the engine calls a run makes. No Obsidian imports. The modal keeps the vault work (reading
// biome packs, resolving slot sources) and hands the results in; a preset run and a module run take
// exactly the same path, so a preset gives the names its module gives for the same state and seed.

import type { Biome } from "../biomes";
import { type NameGenerateResult, generatePlaceNames, type ResolvedSlot } from "./engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe, type RecipeSettings } from "./recipe";
import type { ColonialPart } from "../colonialShapes";
import { type ColonialPlacePreset, type NativePlacePreset } from "../presets";
import { generateWorldPlaceNames, type WorldBatchResult } from "../world/engine";
import { chooseSlotSource, freshSlotSources, slotChoiceId, slotInventory, type SlotPart, slotPartOf, type SlotSources, slotSettingOf } from "./slotSentence";

/** A module's land choice: a built-in biome id or a pack's path, and a terrain id. */
export interface PlaceLand {
  biome: string | undefined;
  terrain: string;
}

export interface BritishPlaceState {
  /** A place-shape region code; undefined is all of Britain. */
  region: string | undefined;
  land: PlaceLand;
  sources: SlotSources;
}

export interface WorldPlaceState {
  culture: string;
  era: string | undefined;
  land: PlaceLand;
}

export interface ColonialPlaceState {
  /** A tradition id; undefined is General. */
  tradition: string | undefined;
  context: string | undefined;
  aliens: boolean;
  land: PlaceLand;
  sources: SlotSources;
}

export interface PlaceRun {
  count: number;
  seed?: number;
  faithfulness?: number;
  strictness?: number;
}

// ── Runs ────────────────────────────────────────────────────────────────────

/** The recipe a British run uses: a built-in biome by id, a pack's biome through the engine's `biome` option. */
export function britishRecipe(state: BritishPlaceState, biome: Biome | undefined): RecipeSettings {
  return britishPlaceNamesRecipe(state.region, biome?.custom ? undefined : state.land.biome, state.land.terrain);
}

/** `biome` is the land's biome with its pack lines resolved, when it is a pack's. */
export function generateBritishPlace(state: BritishPlaceState, biome: Biome | undefined, slots: Record<string, ResolvedSlot>, run: PlaceRun): NameGenerateResult {
  return generatePlaceNames({ recipe: britishRecipe(state, biome), biome: biome?.custom ? biome : undefined, slots, ...run });
}

/** The recipe a colonial run uses. `found` is the land's biome; `custom` the same with its pack lines resolved, when it is a pack's. */
export function colonialRecipe(part: ColonialPart, state: ColonialPlaceState, found: Biome | undefined, custom: Biome | undefined): RecipeSettings {
  return colonialPlaceNamesRecipe(part === "2" ? "new-land" : "established", state.tradition, state.context, custom ? undefined : state.land.biome, state.land.terrain, !!found?.space && state.aliens);
}

export function generateColonialPlace(part: ColonialPart, state: ColonialPlaceState, found: Biome | undefined, custom: Biome | undefined, slots: Record<string, ResolvedSlot>, run: PlaceRun): NameGenerateResult {
  return generatePlaceNames({ recipe: colonialRecipe(part, state, found, custom), biome: custom, slots, ...run });
}

export function generateWorldPlace(state: WorldPlaceState, biome: Biome | undefined, run: PlaceRun): WorldBatchResult {
  return generateWorldPlaceNames({ culture: state.culture, era: state.era, biome, terrain: state.land.terrain, ...run });
}

// ── Presets ─────────────────────────────────────────────────────────────────

/** A preset's slot choices as sentence state. */
export function sourcesOfPreset(placeNames: "placeholders" | "perSlot", placeSlots: Record<string, string>, part: SlotPart): SlotSources {
  let sources: SlotSources = { ...freshSlotSources(), names: placeNames };
  for (const [id, choice] of Object.entries(placeSlots)) {
    if (slotSettingOf(part, choice)) sources = chooseSlotSource(sources, part, id, choice);
  }
  return sources;
}

/** A state's slot choices for a preset: only offered slots that aren't placeholders. */
export function slotsForPreset(sources: SlotSources, part: SlotPart): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of slotInventory(part)) {
    const choice = slotChoiceId(sources.slots[slot.id]);
    if (choice !== "placeholder") out[slot.id] = choice;
  }
  return out;
}

const landOfPreset = (p: { biome: string; terrain: string }): PlaceLand => ({ biome: p.biome || undefined, terrain: p.terrain });

/** A native place names preset as the module's state; a pack biome stays a "[[link]]" for the host to resolve. */
export function nativePresetState(p: NativePlacePreset): { british: BritishPlaceState } | { world: WorldPlaceState } {
  if (p.placeCulture === "britain") {
    return { british: { region: p.region === "all" ? undefined : p.region, land: landOfPreset(p), sources: sourcesOfPreset(p.placeNames, p.placeSlots, "organic") } };
  }
  return { world: { culture: p.placeCulture, era: p.era || undefined, land: landOfPreset(p) } };
}

export function colonialPresetState(p: ColonialPlacePreset): ColonialPlaceState {
  return {
    tradition: p.tradition === "general" ? undefined : p.tradition,
    context: p.context,
    aliens: p.aliens,
    land: landOfPreset(p),
    sources: sourcesOfPreset(p.placeNames, p.placeSlots, slotPartOf(p.colonialPart)),
  };
}

/** The pieces a saved preset needs besides the state: its name, description and the land's biome as the note writes it. */
export interface PresetMeta {
  packName: string;
  description: string;
  /** A built-in id, "[[Pack name]]" for a biome pack, or "" for the default land. */
  biome: string;
}

export function britishPresetOf(state: BritishPlaceState, meta: PresetMeta): NativePlacePreset {
  return {
    ...meta,
    setting: "",
    terrain: state.land.terrain || "any",
    placeNames: state.sources.names,
    placeSlots: slotsForPreset(state.sources, "organic"),
    placeCulture: "britain",
    region: state.region ?? "all",
    era: "",
  };
}

export function worldPresetOf(state: WorldPlaceState, eraId: string, meta: PresetMeta): NativePlacePreset {
  return { ...meta, setting: "", terrain: state.land.terrain || "any", placeNames: "placeholders", placeSlots: {}, placeCulture: state.culture, region: "all", era: eraId };
}

export function colonialPresetOf(part: ColonialPart, state: ColonialPlaceState, contextId: string, meta: PresetMeta): ColonialPlacePreset {
  return {
    ...meta,
    setting: "",
    terrain: state.land.terrain || "any",
    placeNames: state.sources.names,
    placeSlots: slotsForPreset(state.sources, slotPartOf(part)),
    colonialPart: part,
    tradition: state.tradition ?? "general",
    context: contextId,
    aliens: state.aliens,
  };
}
