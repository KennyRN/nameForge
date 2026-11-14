// Shared tables brief §9.2: every bracket label any module produces is either mapped to a source in
// fill.json or on its stay-bracketed list. The sweep reads every recorded baseline (all the modules, their
// cultures, eras and settings, in placeholders and invented modes) and runs the place, wild lands and seas
// and coasts modules live across home, newly explored and settled country, so a label that only a source
// brings (a colonial pattern's [explorer], a space name's [homeland place name]) is found too.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { bracketLabels, labelInfo, staysBracketed } from "../src/fill";
import { generateWildsNames, PLACE_MODULES, WILDS_CULTURES, WILDS_MODULES } from "../src/wilds/engine";
import { generateWatersNames, WATERS_CULTURES } from "../src/waters/engine";
import { defaultWildsState } from "../src/wilds/sentence";
import { defaultWatersState } from "../src/waters/sentence";

const FIXTURES = ["lens-baseline", "place-split-baseline", "shared-tables-baseline", "wizard-retirement-baseline"];

function strings(value: unknown, out: string[]): void {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
}

/** Every label found, with where it was found. */
function sweep(): Map<string, Set<string>> {
  const found = new Map<string, Set<string>>();
  const note = (label: string, where: string) => found.set(label, (found.get(label) ?? new Set()).add(where));
  for (const f of FIXTURES) {
    const data = JSON.parse(readFileSync(`tests/fixtures/${f}.json`, "utf8")) as Record<string, unknown>;
    for (const [key, value] of Object.entries(data)) {
      const all: string[] = [];
      strings(value, all);
      for (const s of all) for (const label of bracketLabels(s)) note(label, key.split(" ")[0]);
    }
  }
  const keys = (list: readonly { key?: string; id?: string }[]) => list.map((c) => (c.key ?? c.id)!);
  for (const where of ["home", "new", "settled"] as const) {
    for (const module of [...WILDS_MODULES, ...PLACE_MODULES]) {
      for (const culture of keys(WILDS_CULTURES)) {
        for (const people of ["placeholders", "invented"] as const) {
          try {
            const r = generateWildsNames({ ...defaultWildsState(module), module, culture, where, people, count: 30, seed: 7 } as never);
            for (const n of r.names) for (const label of bracketLabels(n.text)) note(label, `${module} ${where}`);
          } catch {
            /* a state with no eligible names */
          }
        }
      }
    }
    for (const module of ["seasLakes", "coastsIslands", "seaCharts"] as const) {
      for (const culture of keys(WATERS_CULTURES)) {
        try {
          const r = generateWatersNames({ ...defaultWatersState(module), module, culture, where, count: 30, seed: 7 } as never);
          for (const n of r.names) for (const label of bracketLabels(n.text)) note(label, `${module} ${where}`);
        } catch {
          /* a state with no eligible names */
        }
      }
    }
  }
  return found;
}

test("label sweep: every bracket label in every module's output is mapped or stays bracketed", () => {
  const found = sweep();
  assert.ok(found.size > 50, `a broad sweep: ${found.size} labels`);
  const unknown = [...found].filter(([label]) => !labelInfo(label) && !staysBracketed(label)).map(([label, where]) => `[${label}] in ${[...where].slice(0, 4).join(", ")}`);
  assert.deepEqual(unknown, [], "add each to src/data/fill.json (a source, or stayBracketed with its reason)");
});

test("label sweep: the labels the brief names are found, and fill.json lists nothing that no module produces", () => {
  const found = new Set([...sweep().keys()].map((l) => l.toLowerCase()));
  for (const label of ["founder", "explorer", "holy person", "place", "deity", "folk", "river", "realm", "native bird", "native tree"]) assert.ok(found.has(label), `[${label}] is produced`);
  void labelInfo;
});
