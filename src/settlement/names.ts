// Settlement names (urban brief §6.3): one entry point over the three place-name engines, each run
// with its `settlement` option. No Obsidian imports; the modal and the settlement kit both call it.

import { type Biome, findBiome } from "../biomes";
import { mulberry32 } from "../markov";
import { type GeneratedName, generatePlaceNames, type NameGenerateResult } from "../names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe } from "../names/recipe";
import { SETTLEMENT_NAMES_HISTORY_NAME } from "../sections";
import { generateWildsNames, SIZE_LETTER, WILDS_DATA, wildsBiomes, wildsModulesForTerrain, type WildsEra, type WildsModule, type WildsOptions } from "../wilds/engine";
import { findCulture, generateWorldPlaceNames, INTERSTELLAR_ERA } from "../world/engine";
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
  /** Wild lands brief §10.4: false stops the wild-lands branch (the terrain modules' native branch passes it). Default true. */
  wilds?: boolean;
}

/** Test seam (§16.5): called with the options of each batch the wild-lands branch asks a terrain module for. */
export const settlementHooks: { onWildsCall?: (options: WildsOptions) => void } = {};

export interface SettlementNamesResult extends NameGenerateResult {
  /** The size actually drawn, after any fallback. */
  size: SizeKey;
  /** Where each name came from: "own" (the place-name engines) or the wild-lands module that supplied it (§10.3). */
  sources: string[];
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

/** §10.1: the biome a terrain is mapped with: the chosen one, else the setting's default (Britain, the culture's homeland, temperate). */
function biomeKeyFor(o: SettlementNamesOptions): string {
  const id = o.biome ?? o.customBiome?.id;
  if (id) return id;
  if (o.setting !== "native") return "temperate";
  if (!o.culture || o.culture === "britain") return "britain";
  return WILDS_DATA.homeland[o.culture] ?? "temperate";
}

/** §10.2: the terrain module call's culture, era and country for a settlement names setting. */
function wildsRequest(o: SettlementNamesOptions): Pick<WildsOptions, "culture" | "era" | "where" | "region"> {
  const link = WILDS_DATA.settlementLink;
  if (o.setting !== "native") {
    const mapped = link.colonialToCulture[o.tradition ?? "general"] ?? link.colonialToCulture.general;
    return { culture: mapped.culture, era: mapped.era, where: "new" };
  }
  if (!o.culture || o.culture === "britain") return { culture: "norman-british", era: "MD", where: "home", region: o.region };
  const culture = findCulture(o.culture);
  const eraId = o.era ?? culture.eras[0].id;
  const era: WildsEra = eraId === INTERSTELLAR_ERA ? "IS" : link.worldEraToRoute[o.culture]?.[eraId] ?? "MD";
  return { culture: o.culture, era, where: "home" };
}

/** §10: 60% of the names from the matching terrain module when the terrain is one of the five; the rest from the engines as before. */
function generateWithWilds(options: SettlementNamesOptions, size: SizeKey, seed: number): { result: NameGenerateResult; sources: string[] } {
  const normal = generateAt({ ...options, seed }, size);
  const modules = options.wilds === false ? undefined : wildsModulesForTerrain(options.terrain, biomeKeyFor(options));
  if (!modules) return { result: normal, sources: normal.names.map(() => "own") };
  const rng = mulberry32((seed ^ 0x57494c44) >>> 0);
  const share = WILDS_DATA.settlementLink.purposeBuiltShare;
  const queues = new Map<WildsModule, string[]>();
  const wildNext = (module: WildsModule): string | undefined => {
    let queue = queues.get(module);
    if (!queue) {
      const biome = options.biome && wildsBiomes(module).some((b) => b.id === options.biome) ? options.biome : undefined;
      const request: WildsOptions = {
        module,
        ...wildsRequest(options),
        biome,
        people: "invented",
        fantastic: false,
        tone: "any",
        series: false,
        purposeBuiltOnly: true,
        settlementSize: SIZE_LETTER[size],
        count: options.count,
        seed: Math.floor(rng() * 0x100000000) >>> 0,
      };
      settlementHooks.onWildsCall?.(request);
      queue = generateWildsNames(request).names.map((n) => n.text);
      queues.set(module, queue);
    }
    return queue.shift();
  };
  const pickModule = (): WildsModule => {
    const total = modules.reduce((n, [, w]) => n + w, 0);
    let r = rng() * total;
    for (const [m, w] of modules) if ((r -= w) < 0) return m;
    return modules[modules.length - 1][0];
  };
  const names: GeneratedName[] = [];
  const sources: string[] = [];
  const seen = new Set<string>();
  const spare = [...normal.names];
  // Normal names that would repeat a wild one are skipped, so the batch stays unique across both branches.
  const takeNormal = (): GeneratedName | undefined => {
    while (spare.length > 0) {
      const n = spare.shift()!;
      if (!seen.has(n.text.toLowerCase())) return n;
    }
    return undefined;
  };
  for (let i = 0; i < options.count; i++) {
    const want = rng() < share;
    const module = want ? pickModule() : undefined;
    let text = module ? wildNext(module) : undefined;
    while (text !== undefined && seen.has(text.toLowerCase())) text = module ? wildNext(module) : undefined;
    if (module && text !== undefined) {
      seen.add(text.toLowerCase());
      names.push({ text, hasPlaceholder: text.includes("["), etymology: "" } as GeneratedName);
      sources.push(module);
      continue;
    }
    const n = takeNormal();
    if (!n) break;
    seen.add(n.text.toLowerCase());
    names.push(n);
    sources.push("own");
  }
  return { result: { ...normal, names }, sources };
}

/**
 * Settlement names for a setting at a size. A size the engine can't fill ("No eligible …") steps
 * down the fallback order, with a notice (§4).
 */
export function generateSettlementNames(options: SettlementNamesOptions): SettlementNamesResult {
  const seed = options.seed !== undefined && Number.isFinite(options.seed) ? options.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  let failure: unknown;
  for (const size of sizesToTry(options.size)) {
    try {
      const { result, sources } = generateWithWilds(options, size, seed);
      const notices = [...result.notices];
      if (size !== options.size) {
        notices.unshift(`${cultureLabel(options)} names don't run to a ${sizeLabel(options.size)}; these are ${sizeLabel(size)} names.`);
      }
      return { ...result, notices, size, sources };
    } catch (e) {
      if (!(e instanceof Error) || !e.message.startsWith("No eligible")) throw e;
      failure = e;
    }
  }
  throw failure;
}
