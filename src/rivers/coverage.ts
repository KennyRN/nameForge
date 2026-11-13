// Coverage adapter for river names (shared lens brief §6.1): the British river names by country,
// the water words that belong to regions, and the patterns that shape a name.
import riverData from "../data/river-names.json";
import { type CoverageAdapter, type CoverageRow, makeRow } from "../coverageRows";

const MODULE = "riverNames";
/** The lens culture each corpus reads as (Welsh and Scottish are planned: counted, never offered). */
const CORPUS_CULTURE: Record<string, string> = { england: "english", wales: "welsh", scotland: "scottish" };
type R = Record<string, unknown>;

function rows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  const regionsOf = (corpus: string) => Object.entries(riverData.regionCorpora as Record<string, string[]>).filter(([code, list]) => code !== "all" && list.includes(corpus)).map(([code]) => code);
  for (const [corpus, names] of Object.entries(riverData.corpora as Record<string, string[]>)) {
    for (const _ of names) out.push(makeRow({ culture: CORPUS_CULTURE[corpus] }, { module: MODULE, source: `corpora/${corpus}`, type: "word", regions: regionsOf(corpus) }));
  }
  // A region's own water words are its words; "all" is open.
  for (const [region, words] of Object.entries(riverData.waterWords.british as R)) {
    for (const _ of Object.keys(words as R)) out.push(makeRow({}, { module: MODULE, source: `waterWords/british/${region}`, type: "word", ...(region === "all" ? {} : { regions: [region] }) }));
  }
  for (const [setting, words] of Object.entries(riverData.waterWords as R)) {
    if (setting === "british") continue;
    for (const _ of Object.keys(words as R)) out.push(makeRow({}, { module: MODULE, source: `waterWords/${setting}`, type: "word" }));
  }
  for (const [setting, patterns] of Object.entries(riverData.patterns as Record<string, unknown[]>)) {
    for (const _ of patterns) out.push(makeRow({}, { module: MODULE, source: `patterns/${setting}`, type: "shape" }));
  }
  return out;
}

export const riverCoverage: CoverageAdapter = { module: MODULE, regions: true, rows };
