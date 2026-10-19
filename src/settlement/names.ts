// Settlement names (urban brief §6.3): one entry point over the three place-name engines, each run
// with its `settlement` option. No Obsidian imports; the modal and the settlement kit both call it.

import { type Biome, findBiome } from "../biomes";
import { type GeneratedName, generatePlaceNames, type NameGenerateResult } from "../names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe } from "../names/recipe";
import { SETTLEMENT_NAMES_HISTORY_NAME } from "../sections";
import { findCulture, generateWorldPlaceNames } from "../world/engine";
import { type SizeKey, sizeLabel, sizesToTry } from "./data";

export { SETTLEMENT_NAMES_HISTORY_NAME };

export type SettlementSetting = "native" | "new-lands" | "settled-lands";

export interface SettlementNamesOptions {
  setting: SettlementSetting;
  size: SizeKey;
  count: number;
  seed?: number;
  faithfulness?: number;
  strictness?: number;
  /** Native: "britain" for the British engine, otherwise a world culture id. */
  culture?: string;
  /** Native, world culture: the era (default the culture's first). */
  era?: string;
  /** Native, British: a place-shape region code (default all Britain). */
  region?: string;
  /** New and settled lands: the colonial module's tradition and context (default General and none). */
  tradition?: string;
  context?: string;
  /** The land clause: a built-in biome id, or a resolved custom biome. */
  biome?: string;
  customBiome?: Biome;
  terrain?: string;
  /** Under a space biome, whether it has alien life. */
  aliens?: boolean;
}

export interface SettlementNamesResult extends NameGenerateResult {
  /** The size actually drawn, after any fallback. */
  size: SizeKey;
}

/** Native names: the culture's own label for the fallback notice. */
function cultureLabel(options: SettlementNamesOptions): string {
  if (options.setting !== "native") return options.setting === "new-lands" ? "Exploration" : "Expansion";
  return !options.culture || options.culture === "britain" ? "British" : findCulture(options.culture).label;
}

function generateAt(options: SettlementNamesOptions, size: SizeKey): NameGenerateResult {
  const { count, seed, faithfulness, strictness } = options;
  const settlement = { size };
  if (options.setting === "native" && options.culture && options.culture !== "britain") {
    const result = generateWorldPlaceNames({
      culture: options.culture,
      era: options.era,
      biome: options.customBiome ?? findBiome(options.biome),
      terrain: options.terrain,
      count,
      seed,
      faithfulness,
      strictness,
      settlement,
    });
    return {
      names: result.names.map((n) => ({ text: n.text, hasPlaceholder: false, etymology: n.etymology }) as GeneratedName),
      seed: result.seed,
      notices: result.notices,
    };
  }
  const recipe =
    options.setting === "native"
      ? britishPlaceNamesRecipe(options.region, options.customBiome ? undefined : options.biome, options.terrain)
      : colonialPlaceNamesRecipe(
          options.setting === "new-lands" ? "new-land" : "established",
          options.tradition,
          options.context,
          options.customBiome ? undefined : options.biome,
          options.terrain,
          options.aliens,
        );
  return generatePlaceNames({ recipe, biome: options.customBiome, slots: {}, count, seed, faithfulness, strictness, settlement });
}

/**
 * Settlement names for a setting at a size. A size the engine can't fill ("No eligible …") steps
 * down the fallback order, with a notice (§4).
 */
export function generateSettlementNames(options: SettlementNamesOptions): SettlementNamesResult {
  let failure: unknown;
  for (const size of sizesToTry(options.size)) {
    try {
      const result = generateAt(options, size);
      const notices = [...result.notices];
      if (size !== options.size) {
        notices.unshift(`${cultureLabel(options)} names don't run to a ${sizeLabel(options.size)}; these are ${sizeLabel(size)} names.`);
      }
      return { ...result, notices, size };
    } catch (e) {
      if (!(e instanceof Error) || !e.message.startsWith("No eligible")) throw e;
      failure = e;
    }
  }
  throw failure;
}
