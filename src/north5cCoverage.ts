// Northern Europe tables brief, batch 5c: the batch's own words and frames as coverage rows, for the sixteen modules' adapters. Each culture's
// words (three kinds) are signature words and its frames signature shapes, counted for the module's own tables only. No Obsidian imports.

import { type CoverageRow, makeRow } from "./coverageRows";
import { NORTH5C } from "./north5c";

/** The rows for a module. `cultureKey` turns the content's culture into the module's own key (a tradition for the group families and tribes; `english` is the two Englishes). */
export function north5cRows(module: string, cultureKey: (culture: string) => string = (c) => (c === "english" ? "norman-british" : c)): CoverageRow[] {
  const m = NORTH5C.modules[module];
  if (!m) return [];
  const out: CoverageRow[] = [];
  for (const [culture, c] of Object.entries(m.cultures)) {
    const key = cultureKey(culture);
    const source = `north5c/${culture}`;
    for (const list of c.n) for (const _ of list) out.push(makeRow({}, { module, source, type: "word", culture: key }));
    for (const _ of c.f) out.push(makeRow({}, { module, source, type: "shape", culture: key }));
  }
  return out;
}
