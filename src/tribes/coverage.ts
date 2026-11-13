// Coverage adapter for tribes and kin groups (shared lens brief §6.1).
import tribalData from "../data/tribal-names.json";
import { type CoverageAdapter, type CoverageRow, makeRow } from "../coverageRows";

const MODULE = "tribalNames";
type R = Record<string, unknown>;
const TRADITIONS = (tribalData.traditions as { key: string }[]).map((t) => t.key);
const KINDS = (tribalData.groupTypes as { key: string }[]).map((g) => g.key);

/**
 * Tribal traditions read through the lens's tribal table. Each tradition's signature collectives are
 * its own words; the universal vocabulary is open; a word restricted to some traditions is theirs. The
 * lettered templates are the shapes (open: a tradition favours them by weight, which adds no entries).
 */
function rows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  const word = (source: string, tradition?: string, kind?: string) =>
    out.push(makeRow(tradition && tradition !== "general" ? { culture: tradition } : {}, { module: MODULE, source, type: "word", ...(kind ? { kind } : {}) }));
  for (const t of tribalData.traditions as unknown as { key: string; signatureCollectives: string[] }[]) for (const _ of t.signatureCollectives) word(`traditions/${t.key}/signatureCollectives`, t.key);
  for (const c of tribalData.collectives as { groupTypes: string[] }[]) {
    // A collective serves the group types it lists: a word of each.
    for (const kind of c.groupTypes) word("collectives", undefined, kind);
  }
  for (const _ of tribalData.lineageCollectives) word("lineageCollectives");
  for (const _ of tribalData.personCollectives) word("personCollectives");
  for (const [section, value] of Object.entries(tribalData.vocabulary as R)) {
    if (Array.isArray(value)) {
      for (const _ of value) word(`vocabulary/${section}`);
    } else if (value && typeof value === "object") {
      for (const entry of Object.values(value as R)) {
        const traditions = entry && typeof entry === "object" && !Array.isArray(entry) ? Object.keys(entry as R).filter((k) => TRADITIONS.includes(k)) : [];
        if (traditions.length === 0) word(`vocabulary/${section}`);
        else out.push(makeRow({ c: traditions }, { module: MODULE, source: `vocabulary/${section}`, type: "word" }));
      }
    }
  }
  for (const _ of Object.keys((tribalData.templates as unknown as { weights: R }).weights)) out.push(makeRow({}, { module: MODULE, source: "templates", type: "shape" }));
  return out;
}

export const tribalCoverage: CoverageAdapter = { module: MODULE, kinds: KINDS, roster: TRADITIONS, rows };
