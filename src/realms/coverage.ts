// Coverage adapter for realms and polities (shared lens brief §6.1).
import realmData from "../data/realms.json";
import bynameData from "../data/bynames.json";
import { type CoverageAdapter, type CoverageRow, listRows, makeRow, vocabularyRows } from "../coverageRows";
import { plainWordRows, wordListRows } from "../coverageUse";

const MODULE = "realms";
type R = Record<string, unknown>;
const data = realmData as unknown as R;
const KINDS = (realmData.characters as { key: string }[]).map((c) => c.key);
const ROSTER = (bynameData.cultures as { key: string }[]).map((c) => c.key);
/** The era codes a weighted form is available in: those with a weight above nought. */
const erasOf = (era: Record<string, number>) => Object.entries(era).filter(([, w]) => w > 0).map(([e]) => e);

function rows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  // The forms (Kingdom, Republic…): words, each with the eras it has a weight in.
  for (const f of realmData.forms as { era: Record<string, number> }[]) out.push(makeRow({ e: erasOf(f.era) }, { module: MODULE, source: "forms", type: "word" }));
  // A culture's own forms, with the eras they name.
  for (const [culture, c] of Object.entries(realmData.cultures as unknown as Record<string, { forms?: { eras?: string[] }[] }>)) {
    for (const f of c.forms ?? []) out.push(makeRow({ culture, e: f.eras }, { module: MODULE, source: `cultures/${culture}/forms`, type: "word" }));
  }
  // A culture's own qualifying words and its tribal noun.
  for (const [culture, words] of Object.entries(realmData.cultQualExtra as Record<string, unknown[]>)) out.push(...plainWordRows(words, { culture }, { module: MODULE, source: `cultQualExtra/${culture}` }));
  for (const culture of Object.keys(realmData.tribal as R)) out.push(makeRow({ culture }, { module: MODULE, source: "tribal", type: "word" }));
  for (const culture of Object.keys(realmData.homeland as R)) out.push(makeRow({ culture }, { module: MODULE, source: "homeland", type: "word" }));
  out.push(...wordListRows(realmData.lists as unknown as Record<string, unknown[]>, Object.keys(realmData.lists), { module: MODULE }));
  out.push(...listRows(realmData.landIdentity, { module: MODULE, source: "landIdentity", type: "word" }));
  // Modifiers and the ideology words name the eras they sit in.
  for (const m of realmData.modifiers as { eras?: string[]; t?: string[] }[]) out.push(makeRow({ e: m.eras, t: m.t }, { module: MODULE, source: "modifiers", type: "word" }));
  const ideology = realmData.ideology as { eras: string[]; words: { t?: string[] }[] };
  for (const w of ideology.words) out.push(makeRow({ e: ideology.eras, t: w.t }, { module: MODULE, source: "ideology", type: "word" }));
  out.push(...plainWordRows(realmData.political, {}, { module: MODULE, source: "political" }));
  out.push(...plainWordRows(realmData.collQual, {}, { module: MODULE, source: "collQual" }));
  for (const [group, list] of Object.entries(realmData.honorifics as Record<string, unknown[]>)) out.push(...plainWordRows(list, {}, { module: MODULE, source: `honorifics/${group}` }));
  // Shapes by the part of the name they build, and by the character of the realm.
  for (const [source, list] of Object.entries(realmData.shapes as Record<string, unknown[]>)) out.push(...listRows(list, { module: MODULE, source: `shapes/${source}` }));
  for (const [kind, c] of Object.entries(realmData.characterShapes as unknown as Record<string, { t?: string[]; shapes: unknown[] }>)) {
    out.push(...listRows(c.shapes, { module: MODULE, source: `characterShapes/${kind}`, kind }).map((r) => (c.t && !r.tones ? { ...r, tones: [...c.t] } : r)));
  }
  out.push(...vocabularyRows(MODULE));
  return out;
}

export const realmCoverage: CoverageAdapter = { module: MODULE, kinds: KINDS, roster: ROSTER, rows };
