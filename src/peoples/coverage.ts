// Coverage adapter for peoples and tongues (shared lens brief §6.1).
import peopleData from "../data/peoples-tongues.json";
import bynameData from "../data/bynames.json";
import { type CoverageAdapter, type CoverageRow, listRows, makeRow, vocabularyRows } from "../coverageRows";
import { plainWordRows } from "../coverageUse";

const MODULE = "peoplesTongues";
const ROSTER = (bynameData.cultures as { key: string }[]).map((c) => c.key);

/**
 * The module's tables hold weights per culture (suffix choices, the share of "-ic" forms), which
 * multiply forms and add no entries, so they count nowhere; its words and patterns are open to every
 * culture. Words that belong to an era (`older`) name it.
 */
function rows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  for (const g of peopleData.generics as { words: unknown[] }[]) out.push(...plainWordRows(g.words, {}, { module: MODULE, source: "generics" }));
  for (const s of peopleData.sun as { names: unknown[] }[]) out.push(...plainWordRows(s.names, {}, { module: MODULE, source: "sun" }));
  out.push(...plainWordRows(peopleData.landWords, {}, { module: MODULE, source: "landWords" }));
  out.push(...plainWordRows(peopleData.harbourWords, {}, { module: MODULE, source: "harbourWords" }));
  out.push(...plainWordRows(peopleData.dialectWords, {}, { module: MODULE, source: "dialectWords" }));
  out.push(...plainWordRows(peopleData.dialectWordsSpace, { e: ["NF", "IS"] }, { module: MODULE, source: "dialectWordsSpace" }));
  out.push(...plainWordRows(peopleData.clipEnds, {}, { module: MODULE, source: "clipEnds" }));
  for (const [era, words] of Object.entries(peopleData.older as Record<string, unknown[]>)) out.push(...plainWordRows(words, { e: [era] }, { module: MODULE, source: `older/${era}` }));
  out.push(...listRows(peopleData.languageShapes, { module: MODULE, source: "languageShapes", type: "shape" }));
  out.push(...(peopleData.endings as unknown[]).map(() => makeRow({}, { module: MODULE, source: "endings", type: "shape" })));
  out.push(...(peopleData.learned as unknown[]).map(() => makeRow({}, { module: MODULE, source: "learned", type: "shape" })));
  out.push(...vocabularyRows(MODULE));
  return out;
}

export const peopleCoverage: CoverageAdapter = { module: MODULE, roster: ROSTER, rows };
