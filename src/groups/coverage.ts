// Coverage adapters for the seven group name families (shared lens brief §6.1).
import groupData from "../data/group-names.json";
import tribalData from "../data/tribal-names.json";
import { type CoverageAdapter, type CoverageRow, listRows, makeRow } from "../coverageRows";
import { lensStyleFor } from "../lens";
import { listsUsed, plainWordRows, tokensOf, wordListRows, withReadings } from "../coverageUse";

type Type = { key: string; settings: string[]; front: string; shapes: unknown[] };
type Family = { section: string; types: Type[] };
const LISTS = groupData.lists as unknown as Record<string, unknown[]>;
const SETTING_COUNT = Object.keys(groupData.settings.phrases).length;
const SIGNATURES = groupData.traditions.signatures as unknown as Record<string, Record<string, unknown[]>>;
const EXTRA = groupData.traditions.extraShapes as unknown as Record<string, Record<string, unknown[]>>;
const FRONTS = groupData.fronts as unknown as Record<string, { shapes: unknown[]; typeShapes?: Record<string, unknown[]> }>;

/** A type is offered in some of the five genre settings (§4.3: FL, FH, MR, MF, SF); read through the lens, those are its eras and styles. */
function readSettings(module: string, type: Type): { style: string; eras?: string[] }[] {
  return type.settings.flatMap((s) => lensStyleFor(module, s));
}

function rows(family: Family): CoverageRow[] {
  const module = family.section;
  const out: CoverageRow[] = [];
  const nodes: unknown[] = [];
  for (const type of family.types) {
    const readings = readSettings(module, type);
    const front = FRONTS[type.front];
    const shapes = [...type.shapes, ...(front?.shapes ?? []), ...(front?.typeShapes?.[type.key] ?? [])];
    nodes.push(shapes);
    for (const row of listRows(shapes, { module, source: `types/${type.key}`, kind: type.key })) out.push(withReadings(row, readings, SETTING_COUNT, type.settings.length));
  }
  const tokens = new Set<string>();
  tokensOf(nodes, tokens);
  out.push(...wordListRows(LISTS, listsUsed(LISTS, nodes), { module }));
  for (const [name, pairs] of Object.entries(groupData.composites as Record<string, unknown[]>)) if (tokens.has(name)) out.push(...plainWordRows(pairs, {}, { module, source: `composites/${name}` }));
  for (const c of groupData.commodities as { key: string; words: unknown[] }[]) if (module === "tradeGuilds") out.push(...plainWordRows(c.words, {}, { module, source: "commodities" }));
  // A tradition's signature words (Grove, Hounds, Band…) and its extra shapes: that tradition's.
  for (const [tradition, byName] of Object.entries(SIGNATURES)) {
    for (const [name, words] of Object.entries(byName)) if (tokens.has(name)) out.push(...plainWordRows(words, { culture: tradition }, { module, source: `signatures/${tradition}/${name}` }));
  }
  const kinds = new Set(family.types.map((t) => t.key));
  for (const [tradition, byType] of Object.entries(EXTRA)) {
    for (const [type, shapes] of Object.entries(byType)) if (kinds.has(type)) out.push(...listRows(shapes, { module, source: `extraShapes/${tradition}`, kind: type, culture: tradition }));
  }
  return out;
}

export const groupCoverage: CoverageAdapter[] = (groupData.families as unknown as Family[]).map((family) => ({
  module: family.section,
  kinds: family.types.map((t) => t.key),
  // The families draw on the tribal traditions (17), through the lens's tribal table.
  roster: (tribalData.traditions as { key: string }[]).map((t) => t.key),
  rows: () => rows(family),
}));

void makeRow;
