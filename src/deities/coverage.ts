// Coverage adapters for deities and for sacred places (shared lens brief §6.1).
import deityData from "../data/deity-names.json";
import bynameData from "../data/bynames.json";
import { type CoverageAdapter, type CoverageRow, listRows, makeRow, profileKeys, vocabularyRows } from "../coverageRows";
import { plainWordRows, wordListRows } from "../coverageUse";

const ROSTER = (bynameData.cultures as { key: string }[]).map((c) => c.key);
/** §6.3: `unoffered` in deity-names.json (Polynesian and Andean) is excluded, not short. */
const EXCLUDED = [{ cultures: deityData.unoffered as string[] }];
type Shape = { kind: string };

/** The deity kinds belong to deities; the sacred place kind to sacred places. */
const DEITY_KINDS = ["deity", "pantheon"];
const PLACE_KINDS = ["place"];

function rows(module: string, kinds: readonly string[]): CoverageRow[] {
  const out: CoverageRow[] = [];
  out.push(...listRows((deityData.shapes as Shape[]).filter((s) => kinds.includes(s.kind)), { module, source: "shapes" }));
  // A culture's own extra shapes (the Feathered Serpent, a Norse tripling…) read as that culture's.
  for (const [culture, style] of Object.entries(deityData.styles as unknown as Record<string, { extra?: Shape[] }>)) {
    out.push(...listRows((style.extra ?? []).filter((s) => kinds.includes(s.kind)), { module, source: `styles/${culture}/extra`, culture }));
  }
  if (module === "deityNames") {
    for (const d of deityData.domains as { words: unknown[]; archetypes: unknown[] }[]) {
      out.push(...plainWordRows(d.words, {}, { module, source: "domains/words" }));
      out.push(...plainWordRows(d.archetypes, {}, { module, source: "domains/archetypes" }));
    }
    out.push(...wordListRows(deityData.lists as unknown as Record<string, unknown[]>, Object.keys(deityData.lists), { module }));
  }
  out.push(...vocabularyRows(module));
  return out;
}

const kindKeys = (wanted: readonly string[]) => (deityData.kinds as { key: string }[]).map((k) => k.key).filter((k) => wanted.includes(k));

/** §11.2: a culture's form, domain and kind multipliers (`styles[culture]` `formX`, `domainX`, `kindX`) are its profile. */
const profiles = () => profileKeys(Object.fromEntries(Object.entries(deityData.styles as unknown as Record<string, { formX?: unknown; domainX?: unknown; kindX?: unknown }>).map(([k, v]) => [k, { f: v.formX ?? {}, d: v.domainX ?? {}, k: v.kindX ?? {} }])));

export const deityCoverage: CoverageAdapter[] = [
  { module: "deityNames", kinds: kindKeys(DEITY_KINDS), roster: ROSTER, excluded: EXCLUDED, profiles, rows: () => rows("deityNames", DEITY_KINDS) },
  { module: "sacredPlaces", kinds: kindKeys(PLACE_KINDS), roster: ROSTER, excluded: EXCLUDED, profiles, rows: () => rows("sacredPlaces", PLACE_KINDS) },
];

void makeRow;
