// The lists the biome menus are built from, as plain data, so each is tested and every menu lists a
// pack that replaces a built-in once, in the built-in's place (wizard retirement brief §5.1, §5.2).
// No Obsidian imports: the modal and the Land button draw these.

import { type Biome, type BiomeCatalogue, biomeChoiceId, BIOMES, BRITAIN, SPACE_BIOMES } from "./biomes";

export interface BiomeMenuItem {
  id: string;
  label: string;
  /** "Your version: {file name}" on a pack that replaces a built-in (§5.2). */
  tip?: string;
}

/** The tooltip on a biome that is a pack's replacement for a built-in. */
export const overrideTip = (b: Pick<Biome, "custom">): { tip?: string } =>
  b.custom?.overrides ? { tip: `Your version: ${b.custom.path.replace(/^.*\//, "")}` } : {};

/**
 * The land clause's biome menu: each biome's phrase, Britain unless it's the module's default. A pack
 * that replaces a built-in is that built-in's entry, with its phrase (the built-in's own if the pack
 * gives none).
 */
export function landClauseBiomeItems(catalogue: BiomeCatalogue, britainAsDefault: boolean): BiomeMenuItem[] {
  return catalogue.all.filter((b) => !(britainAsDefault && b.id === BRITAIN.id)).map((b) => ({ id: biomeChoiceId(b), label: b.phrase, ...overrideTip(b) }));
}

/**
 * The Land button's biome menu: Britain (unless it's the default) and the 12, each replaced in place by
 * its override, then "Your biomes": the other packs.
 */
export function landButtonBiomeItems(catalogue: BiomeCatalogue, britainIsDefault: boolean): { builtIn: (BiomeMenuItem & { biome: Biome })[]; yours: (BiomeMenuItem & { biome: Biome })[] } {
  const item = (b: Biome) => ({ id: biomeChoiceId(b), label: b.label, biome: b, ...overrideTip(b) });
  return {
    builtIn: catalogue.all.filter((b) => !b.custom || b.custom.overrides).filter((b) => !britainIsDefault || b.id !== BRITAIN.id).map(item),
    yours: catalogue.all.filter((b) => b.custom && !b.custom.overrides).map(item),
  };
}

/**
 * Create Pack's "Start from": the real built-ins (a pack that replaces one is based on the real one,
 * so it's never listed under the built-in's name), then the user's packs by path. A pack that replaces
 * a built-in reads "Temperate (your version)", so the list never has two of the same name.
 */
export function startFromItems(custom: readonly Biome[]): BiomeMenuItem[] {
  return [
    ...[BRITAIN, ...BIOMES, ...SPACE_BIOMES].map((b) => ({ id: b.id, label: b.label })),
    ...custom.map((b) => ({ id: b.custom!.path, label: b.custom?.overrides ? `${b.label} (your version)` : b.label })),
  ];
}
