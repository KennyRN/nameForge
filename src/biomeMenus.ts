// The lists the biome menus are built from, as plain data, so each is tested and every menu lists a
// pack that replaces a built-in once, in the built-in's place (wizard retirement brief §5.1, §5.2).
// No Obsidian imports: the modal and the Land button draw these.

import { type Biome, type BiomeCatalogue, biomeChoiceId, BIOMES, BRITAIN, SPACE_BIOMES } from "./biomes";


const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The file a biome pack lives in, by name. */
export const biomeFile = (b: Pick<Biome, "custom">): string => b.custom?.path.replace(/^.*\//, "") ?? "";

/** The heading before the user's own biomes in a menu. */
export const YOUR_BIOMES = "Your biomes";

/**
 * The packs whose label or phrase another biome also uses, so a menu can tell them apart by file name.
 * A pack that replaces a built-in is that built-in's entry (it isn't listed twice), so only a second
 * claimant, or a pack that reuses some other biome's words, shows up here.
 */
export function biomeClashes(biomes: readonly Biome[]): Set<Biome> {
  const out = new Set<Biome>();
  for (const b of biomes) {
    if (!b.custom) continue;
    if (biomes.some((o) => o !== b && (same(o.label, b.label) || same(o.label, b.phrase) || same(o.phrase, b.label) || same(o.phrase, b.phrase)))) out.add(b);
  }
  return out;
}

/** What a menu adds to a biome's text, and its tooltip: built-in as now; your version of one; your own. */
export function biomeMark(b: Pick<Biome, "custom">, clashes: ReadonlySet<unknown>): { suffix: string; tip?: string; own: boolean } {
  if (!b.custom) return { suffix: "", own: false };
  const file = biomeFile(b);
  const own = !b.custom.overrides;
  const clash = clashes.has(b) ? ` (${file})` : "";
  return { suffix: `${own ? "" : " (your version)"}${clash}`, tip: own ? `Your biome: ${file}` : `Your version: ${file}`, own };
}

/** The tooltip on a sentence's biome link: "Your version: {file}" when the chosen biome replaces a built-in. */
export const biomeLinkTitle = (b: Pick<Biome, "custom" | "guide"> | undefined, fallback: string): string =>
  b?.custom?.overrides ? `Your version: ${biomeFile(b)}` : b?.guide ?? fallback;

export interface BiomeMenuItem {
  id: string;
  label: string;
  tip?: string;
  /** "Your biomes", before the first biome of the user's own. */
  heading?: string;
}

/**
 * One biome menu, built the same way everywhere (brief: pack names and biome marks §3): the built-ins in
 * their places, a pack that replaces one marked "(your version)", then the user's own biomes under a
 * "Your biomes" heading. `text` is the entry's usual text (its phrase or its label).
 */
export function biomeMenuItems(biomes: readonly Biome[], text: (b: Biome) => string, clashes: ReadonlySet<unknown> = biomeClashes(biomes)): BiomeMenuItem[] {
  let headed = false;
  return biomes.map((b) => {
    const mark = biomeMark(b, clashes);
    const heading = mark.own && !headed ? YOUR_BIOMES : undefined;
    if (heading) headed = true;
    return { id: biomeChoiceId(b), label: `${text(b)}${mark.suffix}`, ...(mark.tip ? { tip: mark.tip } : {}), ...(heading ? { heading } : {}) };
  });
}

/**
 * The land clause's biome menu: each biome's phrase, Britain unless it's the module's default. A pack
 * that replaces a built-in is that built-in's entry, with its phrase (the built-in's own if the pack
 * gives none), marked "(your version)".
 */
export function landClauseBiomeItems(catalogue: BiomeCatalogue, britainAsDefault: boolean): BiomeMenuItem[] {
  const clashes = biomeClashes([...catalogue.all, ...catalogue.space]);
  return biomeMenuItems(catalogue.all.filter((b) => !(britainAsDefault && b.id === BRITAIN.id)), (b) => b.phrase, clashes);
}

/**
 * The Land button's biome menu: Britain (unless it's the default) and the 12, each replaced in place by
 * its override, then "Your biomes": the other packs.
 */
export function landButtonBiomeItems(catalogue: BiomeCatalogue, britainIsDefault: boolean): { builtIn: (BiomeMenuItem & { biome: Biome })[]; yours: (BiomeMenuItem & { biome: Biome })[] } {
  const clashes = biomeClashes([...catalogue.all, ...catalogue.space]);
  const item = (b: Biome): BiomeMenuItem & { biome: Biome } => {
    const mark = biomeMark(b, clashes);
    return { id: biomeChoiceId(b), label: `${b.label}${mark.suffix}`, biome: b, ...(mark.tip ? { tip: mark.tip } : {}) };
  };
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
