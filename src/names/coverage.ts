// Coverage adapters for exploration into new lands and expansion into settled lands (shared lens
// brief §6.1): the colonial shape tables of colonial-shapes.json.
import colonialData from "../data/colonial-shapes.json";
import { type CoverageAdapter, type CoverageRow, makeRow } from "../coverageRows";

type R = Record<string, unknown>;
type Part = "2" | "2a";
const MODULES: { module: string; part: Part }[] = [
  { module: "explorationPlaceShapes", part: "2" },
  { module: "empireExpansionPlaceShapes", part: "2a" },
];
const inPart = (parts: string[] | undefined, part: Part) => !parts || parts.includes(part);
const traditions = colonialData.traditions as unknown as { id: string; parts: string[] }[];

/**
 * A part's categories and structures are its open shapes, and each context of the part is a kind. A
 * tradition is one signature shape for its lens culture (its set of multipliers): the colonial tables
 * hold weights for traditions, not word lists of their own.
 */
function rows(module: string, part: Part): CoverageRow[] {
  const out: CoverageRow[] = [];
  for (const c of colonialData.categories as { parts: string[] }[]) if (inPart(c.parts, part)) out.push(makeRow({}, { module, source: "categories", type: "shape" }));
  for (const c of colonialData.inheritedCategories as { parts: string[] }[]) if (inPart(c.parts, part)) out.push(makeRow({}, { module, source: "inheritedCategories", type: "shape" }));
  for (const _ of Object.keys(colonialData.structures as R)) out.push(makeRow({}, { module, source: "structures", type: "shape" }));
  for (const c of (colonialData.contexts as unknown as Record<string, { id: string }[]>)[part] ?? []) out.push(makeRow({}, { module, source: "contexts", type: "shape", kind: c.id }));
  for (const t of traditions) if (inPart(t.parts, part)) out.push(makeRow({ culture: t.id }, { module, source: "traditions", type: "shape" }));
  return out;
}

const contextKinds = (part: Part) => ((colonialData.contexts as unknown as Record<string, { id: string }[]>)[part] ?? []).map((c) => c.id);

export const colonialCoverage: CoverageAdapter[] = MODULES.map(({ module, part }) => ({
  module,
  kinds: contextKinds(part),
  roster: traditions.filter((t) => inPart(t.parts, part)).map((t) => t.id),
  rows: () => rows(module, part),
}));
