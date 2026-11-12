// The place-name modules' setups as plain states, how presets map to them (Wizard retirement brief
// §4) and the engine calls a run makes. No Obsidian imports. The modal keeps the vault work (reading
// biome packs, resolving slot sources) and hands the results in; a preset run and a module run take
// exactly the same path, so a preset gives the names its module gives for the same state and seed.

import type { Biome, BiomeCatalogue } from "../biomes";
import { type NameGenerateResult, generatePlaceNames, type ResolvedSlot } from "./engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe, type RecipeSettings, type SlotSetting } from "./recipe";
import type { ColonialPart } from "../colonialShapes";
import { type ColonialPlacePreset, type NativePlacePreset } from "../presets";
import { generateWorldPlaceNames, type WorldBatchResult } from "../world/engine";
import { activeSlots, chooseSlotSource, freshSlotSources, slotChoiceAllowed, slotChoiceId, slotInventory, type SlotPart, slotPartOf, type SlotSources, slotSettingOf } from "./slotSentence";

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
  /** Wizard retirement brief §5: the biome lists and lookups (a pack can replace a built-in). */
  catalogue?: BiomeCatalogue;
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

// ── Settlement names presets (recipe notes; Wizard retirement brief §4) ─────

/** What a settlement names preset saves: the setting it is saved with and that setting's slot sources. */
export interface SettlementPresetInput {
  size: string;
  /** The colonial part; undefined is British native names. */
  part: ColonialPart | undefined;
  region?: string;
  tradition?: string;
  context?: string;
  /** A built-in biome id, or "[[Pack name]]" for a biome pack. */
  biome?: string;
  terrain: string;
  aliens: boolean;
  sources: SlotSources;
}

/**
 * The recipe a settlement names preset is saved as: the source module's recipe with the size. Its one
 * `slots` field holds the saved setting's slot sources (only non-placeholders, only with names chosen
 * per slot); with none, the note is exactly what it was before slot choices.
 */
export function settlementPresetRecipe(i: SettlementPresetInput): RecipeSettings {
  const recipe = i.part
    ? colonialPlaceNamesRecipe(i.part === "2" ? "new-land" : "established", i.tradition, i.context, i.biome, i.terrain, i.aliens)
    : britishPlaceNamesRecipe(i.region, i.biome, i.terrain);
  recipe.shape.settlement = i.size;
  const slots = activeSlots(i.part ? slotPartOf(i.part) : "organic", i.sources);
  if (Object.keys(slots).length > 0) recipe.slots = slots;
  return recipe;
}

/** A recipe slot the sentence can show: one source, a built-in list, or tribal names at the slot's defaults. */
function choiceOfRecipeSlot(setting: SlotSetting, part: SlotPart): string | undefined {
  if (setting.kind === "built-in") return "built-in";
  if (setting.kind === "tribal") {
    const { kind: _kind, tradition, preset, ...fields } = setting;
    const plain = !preset && tradition === (part === "organic" ? "auto" : "general") && Object.values(fields).every((v) => v === undefined || v === "" || v === "any");
    return plain ? "tribal" : undefined;
  }
  if (setting.kind === "sources" && setting.sources.length === 1 && setting.sources[0].weight === 1 && !setting.mode && !setting.gender && !setting.section) {
    const ref = setting.sources[0];
    if (ref.list) return `list:${ref.list}`;
    if (ref.pack) return `pack:${ref.pack}`;
  }
  return undefined;
}

/**
 * A loaded settlement names preset's slots as the sentence's sources for the setting it was saved
 * with. A slot the sentence can't show (several sources, a gender or section, an ignore, one the
 * setting doesn't offer) stays a placeholder, and is named in `unsupported` for the status line.
 */
export function sourcesOfRecipeSlots(slots: Record<string, SlotSetting> | undefined, part: SlotPart): { sources: SlotSources; unsupported: string[] } {
  let sources = freshSlotSources();
  const unsupported: string[] = [];
  for (const [id, setting] of Object.entries(slots ?? {})) {
    const choice = choiceOfRecipeSlot(setting, part);
    if (choice && slotChoiceAllowed(part, id, choice)) sources = chooseSlotSource(sources, part, id, choice);
    else unsupported.push(id);
  }
  if (Object.keys(sources.slots).length > 0) sources = { ...sources, names: "perSlot" };
  return { sources, unsupported };
}

/** The settlement setting each source set belongs to. */
export type SettlementSlotSources<K extends string = string> = Record<K, SlotSources>;

/** A loaded preset's sources replace those of the setting it was saved with; the other settings keep theirs. */
export function withPresetSources<K extends string>(all: SettlementSlotSources<K>, setting: K, sources: SlotSources): SettlementSlotSources<K> {
  return { ...all, [setting]: sources };
}
