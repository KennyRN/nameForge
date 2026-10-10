// A place pack as a recipe source (Place generators brief §2.4, §0.1): one name or stem per draw,
// by the pack's generator. No Obsidian imports.

import { extractNamesFromMarkdown, generateCompoundNamesDetailed, ListGenerator, mulberry32, PlaceNameModel } from "../markov";
import type { NamesFileData } from "../nameParser";
import type { NameMode } from "../names/recipe";
import { compoundPartData, compoundPartsFor, compoundSettings, partIsBreakdown } from "./compound";
import { breakdownSettingsFor, selectSectionNames, smallListNotice, type SectionRequest } from "./sections";

export type PlaceDraw = (request: SectionRequest, mode: NameMode, rng: () => number) => string | null;

const seedFrom = (rng: () => number) => Math.floor(rng() * 0x100000000) >>> 0;
const pick = <T>(items: T[], rng: () => number) => (items.length > 0 ? items[Math.floor(rng() * items.length)] : null);

/**
 * Breakdown: the place model (sampleStem in stem mode, as before). List: names as written.
 * Compound: as people compound packs, with breakdown parts on the place model; stem mode uses
 * part 1, through sampleStem when part 1 is breakdown. Sections and gender draws pick a list (or
 * a title in compound packs); a small breakdown section is loosened with a notice.
 */
export function placePackDraw(
  parsed: NamesFileData,
  settings: { faithfulness?: number; strictness?: number },
  notice: (message: string) => void = () => {},
): PlaceDraw {
  const faithfulness = settings.faithfulness ?? 2;
  const strictness = settings.strictness ?? 3;
  const models = new Map<string, PlaceNameModel>();
  const model = (key: string, names: string[]) => {
    if (!models.has(key)) models.set(key, PlaceNameModel.build(names));
    return models.get(key)!;
  };
  const keyOf = (r: SectionRequest) => `${r.section ?? ""}|${r.gender ?? ""}`;

  if (parsed.placeGenerator === "compound") {
    const data = compoundPartData(parsed);
    const options = { ...compoundSettings(parsed), breakdownModel: "place" as const, faithfulness, strictness };
    return (request, mode, rng) => {
      const parts = compoundPartsFor(data, request.section ?? request.gender);
      if (mode === "stem") {
        const first = parts[0] ?? [];
        if (first.length === 0) return null;
        return partIsBreakdown(options.generator, parsed.compoundPartGenerators, 0)
          ? model(`part1|${keyOf(request)}`, first).sampleStem(rng, faithfulness, strictness)
          : pick(first, rng);
      }
      return generateCompoundNamesDetailed(parts, { count: 1, ...options, seed: seedFrom(rng) }).names[0] ?? null;
    };
  }

  const wholeNames = extractNamesFromMarkdown(parsed.names.join("\n"));
  // Sections narrow the names; the whole pack (no section or gender) draws exactly as before.
  const namesFor = (request: SectionRequest): { names: string[]; label?: string } => {
    if (parsed.sectioned && (request.section || request.gender)) {
      const selection = selectSectionNames(parsed.sectioned, request);
      for (const n of selection.notices) notice(`${parsed.packName}: ${n}`);
      return { names: selection.names, label: selection.used };
    }
    return { names: wholeNames };
  };

  if (parsed.placeGenerator === "list") {
    const generator = new ListGenerator();
    return (request, _mode, rng) => {
      const { names } = namesFor(request);
      generator.train(names);
      return generator.generateMultiple(1, mulberry32(seedFrom(rng)))[0] ?? null;
    };
  }

  return (request, mode, rng) => {
    const { names, label } = namesFor(request);
    if (names.length === 0) return null;
    const m = model(keyOf(request), names);
    if (mode === "stem") return m.sampleStem(rng, faithfulness, strictness);
    const loosened = label ? breakdownSettingsFor(names.length, strictness) : { allowSourceCopies: false, strictness };
    if (label && loosened.allowSourceCopies) notice(`${parsed.packName}: ${smallListNotice(label, names.length)}`);
    return m.generateDetailed({ count: 1, faithfulness, ...loosened, seed: seedFrom(rng) }).names[0] ?? null;
  };
}
