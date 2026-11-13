// Coverage adapters for calendars and festivals and for sky lore (shared lens brief §6.1).
import timeData from "../data/time-sky.json";
import { type CoverageAdapter, type CoverageRow, at, listRows, makeRow, vocabularyRows, SHARED_ROSTER } from "../coverageRows";

const CALENDAR = "calendarNames";
const SKY = "skyNames";
const KIND_MODULE = new Map((timeData.kinds as { key: string; module: string }[]).map((k) => [k.key, k.module]));
const kindsOf = (module: "calendar" | "sky") => (timeData.kinds as { key: string; module: string }[]).filter((k) => k.module === module).map((k) => k.key);
const SENSITIVE = timeData.sensitive as string[];

/** The shapes whose kind belongs to this module. */
function shapeRows(module: string, which: "calendar" | "sky"): CoverageRow[] {
  const shapes = (at(timeData, "shapes") as { k: string }[]).filter((s) => KIND_MODULE.get(s.k) === which);
  return listRows(shapes.map((s) => ({ ...s, kind: s.k })), { module, source: "shapes" });
}

function calendarRows(): CoverageRow[] {
  const out = shapeRows(CALENDAR, "calendar");
  // A culture's own months, days and festivals: whole names, so words.
  for (const [culture, kinds] of Object.entries(timeData.cultureNames as Record<string, Record<string, { e?: string }[]>>)) {
    for (const [kind, names] of Object.entries(kinds)) {
      for (const name of names) out.push(makeRow({ culture, e: name.e }, { module: CALENDAR, source: `cultureNames/${culture}/${kind}`, kind, type: "word" }));
    }
  }
  out.push(...vocabularyRows(CALENDAR));
  return out;
}

function skyRows(): CoverageRow[] {
  const out = shapeRows(SKY, "sky");
  // Constellation names by culture, and the culture's own names for planets and lights.
  for (const [culture, names] of Object.entries(timeData.constellations as Record<string, string[]>)) {
    for (let i = 0; i < names.length; i++) out.push(makeRow({ culture }, { module: SKY, source: `constellations/${culture}`, kind: "constellation", type: "word" }));
  }
  for (const [culture, lights] of Object.entries(timeData.lights as unknown as Record<string, { planets?: Record<string, unknown> } & Record<string, unknown>>)) {
    const count = Object.keys(lights.planets ?? {}).length + Object.keys(lights).filter((k) => k !== "planets").length;
    for (let i = 0; i < count; i++) out.push(makeRow({ culture }, { module: SKY, source: `lights/${culture}`, kind: "light", type: "word" }));
  }
  out.push(...vocabularyRows(SKY));
  return out;
}

export const calendarCoverage: CoverageAdapter = { module: CALENDAR, kinds: kindsOf("calendar"), roster: SHARED_ROSTER, excluded: [{ cultures: SENSITIVE }], rows: calendarRows };
export const skyCoverage: CoverageAdapter = { module: SKY, kinds: kindsOf("sky"), kindFlags: { sign: "closed" }, roster: SHARED_ROSTER, excluded: [{ cultures: SENSITIVE }], rows: skyRows };
