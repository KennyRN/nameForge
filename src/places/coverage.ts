// Coverage adapters for the focused place modules (place modules split brief §10.2; shared lens brief §6.1).
// A module's own shapes and the shared pools it reads are counted as the wild lands' are; so are the
// entries it borrows from a retired engine (the British generics and the colonial groups a kind's
// `sources` name), which count for the module that borrows them, as shared pools do.
import coloniaData from "../data/colonial-shapes.json";
import placesData from "../data/places.json";
import wildsData from "../data/wilds.json";
import { type CoverageAdapter, type CoverageRow, at, byKindRows, listRows, makeRow, profileKeys, regionMultipliers, vocabularyRows, SHARED_ROSTER } from "../coverageRows";
import type { KindSources } from "./sources";

type Kind = { key: string; sources?: KindSources };
const MODULES = Object.keys(placesData.modules);
const kindsOf = (module: string): Kind[] => (placesData.modules as unknown as Record<string, { kinds: Kind[] }>)[module].kinds;
const readsRegions = (module: string) => (placesData.modules as unknown as Record<string, { region?: boolean }>)[module].region === true;

/** The generics of the colonial groups a source names, and the generics it names itself, once each. */
function colonialGenerics(source: NonNullable<KindSources["colonial"]>): string[] {
  // A new group (the space groups) holds full generic records; an inherited one holds ids.
  const groups = coloniaData.groups as unknown as { id: string; generics?: (string | { id: string })[] }[];
  const out = new Set<string>(source.generics ?? []);
  for (const id of source.groups ?? []) for (const g of groups.find((x) => x.id === id)?.generics ?? []) out.add(typeof g === "string" ? g : g.id);
  return [...out];
}

/** The borrowed entries: British generics (read for the British cultures) and colonial generics (open to every culture), one shape each. */
function sourceRows(module: string): CoverageRow[] {
  const out: CoverageRow[] = [];
  for (const kind of kindsOf(module)) {
    const s = kind.sources;
    if (!s || s.delegate) continue;
    for (const generic of s.native?.generics ?? []) out.push(makeRow({ c: ["anglo-saxon", "norman-british", "celtic"] }, { module, kind: kind.key, source: `sources/native/${kind.key}/${generic}`, type: "shape" }));
    if (s.colonial) for (const generic of colonialGenerics(s.colonial)) out.push(makeRow({}, { module, kind: kind.key, source: `sources/colonial/${kind.key}/${generic}`, type: "shape" }));
  }
  return out;
}

function rows(module: string): CoverageRow[] {
  const out: CoverageRow[] = [];
  out.push(...byKindRows(at(placesData, `shapes/${module}`), { module, source: `shapes/${module}` }));
  const own = (placesData.cultureShapes as { module: string }[]).filter((s) => s.module === module);
  out.push(...listRows(own, { module, source: "cultureShapes" }));
  if (readsRegions(module)) {
    const tags = { ...(wildsData.regionTags as Record<string, Record<string, number>>), ...(placesData.regionTags as Record<string, Record<string, number>>) };
    for (const [word, table] of Object.entries(tags)) out.push({ ...makeRow({}, { module, source: `regionTags/${word}`, type: "word", regions: regionMultipliers(table) }), notPool: true });
  }
  out.push(...sourceRows(module));
  out.push(...vocabularyRows(module));
  return out;
}

/** Kinds that take their names wholly from another engine are not held to the kind target. */
const delegated = (module: string): Record<string, "delegated"> => Object.fromEntries(kindsOf(module).filter((k) => k.sources?.delegate).map((k) => [k.key, "delegated" as const]));

export const placeCoverage: CoverageAdapter[] = MODULES.map((module) => ({
  module,
  kinds: kindsOf(module).map((k) => k.key),
  kindFlags: delegated(module),
  roster: SHARED_ROSTER,
  regions: readsRegions(module),
  profiles: () => profileKeys(wildsData.cultureMult),
  rows: () => rows(module),
}));
