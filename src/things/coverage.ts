// Coverage adapters for arms and armour, treasures and regalia, and books and writings (shared lens brief §6.1).
import thingData from "../data/named-things.json";
import bynameData from "../data/bynames.json";
import { type CoverageAdapter, type CoverageRow, makeRow, profileKeys, vocabularyRows } from "../coverageRows";
import { listsUsed, wordListRows } from "../coverageUse";

const LISTS = thingData.lists as unknown as Record<string, unknown[]>;
const ROSTER = (bynameData.cultures as { key: string }[]).map((c) => c.key);
type Shape = { m: string; k: string[] | string; e?: string };
type KindSet = { k: string; c: string[]; e?: string };

function rows(moduleKey: string, section: string): CoverageRow[] {
  const out: CoverageRow[] = [];
  const shapes = (thingData.shapes as unknown as Shape[]).filter((s) => s.m === moduleKey);
  for (const s of shapes) {
    const eras = s.e && s.e !== "all" ? s.e : undefined;
    // A pattern serves the kinds it lists ("*": every kind, so open).
    const kinds = Array.isArray(s.k) ? s.k : [undefined];
    for (const kind of kinds) out.push(makeRow({ e: eras }, { module: section, source: "shapes", type: "shape", ...(kind ? { kind } : {}) }));
  }
  // Kinds only some cultures have (bells in China and Korea, mirrors in the Americas): culture-restricted whole kinds.
  const kinds = new Set((thingData.kinds as { module: string; key: string }[]).filter((k) => k.module === moduleKey).map((k) => k.key));
  for (const set of (thingData.kindSet as unknown as KindSet[]).filter((x) => kinds.has(x.k))) {
    out.push(makeRow({ c: set.c, e: set.e }, { module: section, source: "kindSet", type: "word", kind: set.k }));
  }
  out.push(...wordListRows(LISTS, listsUsed(LISTS, shapes), { module: section }));
  out.push(...vocabularyRows(section));
  return out;
}

export const thingCoverage: CoverageAdapter[] = (thingData.modules as { key: string; section: string }[]).map((m) => ({
  module: m.section,
  kinds: (thingData.kinds as { module: string; key: string }[]).filter((k) => k.module === m.key).map((k) => k.key),
  roster: ROSTER,
  // §11.2: `leanings` weights each culture's kinds of name.
  profiles: () => profileKeys(thingData.leanings),
  rows: () => rows(m.key, m.section),
}));
