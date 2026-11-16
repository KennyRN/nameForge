// Northern Europe tables brief, batch 5c: the batch's own words and frames as coverage rows, for the sixteen modules' adapters. Each culture's
// words (three kinds) are signature words and its frames signature shapes, counted for the module's own tables only. No Obsidian imports.
// 5d §14.1 item 7: a culture's rows count for that culture alone (Scandinavian does not read Norse's rows, nor a Celtic nation Celtic's), and a
// word's era and fantastic tags are its row's eras and styles.

import { type CoverageRow, makeRow } from "./coverageRows";
import { NORTH5C } from "./north5c";
import { readTag } from "./north5c";

/** The lens cultures a content culture counts for: itself (the lens counts Anglo-Saxon and Norman & British together as `english`). */
const countsFor = (culture: string, key: string): string[] => (culture === "english" ? ["english"] : [key]);

/** The rows for a module. `cultureKey` turns the content's culture into the module's own key (a tradition for the group families and tribes; `english` is the two Englishes). */
export function north5cRows(module: string, cultureKey: (culture: string) => string = (c) => (c === "english" ? "norman-british" : c)): CoverageRow[] {
  const m = NORTH5C.modules[module];
  if (!m) return [];
  const out: CoverageRow[] = [];
  for (const [culture, c] of Object.entries(m.cultures)) {
    const key = cultureKey(culture);
    const source = `north5c/${culture}`;
    const own = countsFor(culture, key);
    c.n.forEach((list, i) =>
      list.forEach((_w, j) => {
        const tag = readTag(c.nt?.[i]?.[j]);
        const row = makeRow({ ...(tag.eras ? { e: tag.eras } : {}), ...(tag.h ? { h: true } : {}) }, { module, source, type: "word", culture: key });
        row.cultures = own;
        out.push(row);
      }),
    );
    for (const f of c.f) {
      const tag = readTag(f[2]);
      const row = makeRow({ ...(tag.h ? { h: true } : {}) }, { module, source, type: "shape", culture: key });
      row.cultures = own;
      out.push(row);
    }
  }
  return out;
}
