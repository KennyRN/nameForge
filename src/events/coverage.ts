// Coverage adapter for events and eras (shared lens brief §6.1).
import eventData from "../data/event-names.json";
import { type CoverageAdapter, type CoverageRow, at, listRows, vocabularyRows, NORTH_ROSTER } from "../coverageRows";
import { north5cRows } from "../north5cCoverage";

const MODULE = "eventNames";
const KINDS = (eventData.kinds as { key: string }[]).map((k) => k.key);

function rows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  out.push(...listRows(at(eventData, "shapes"), { module: MODULE, source: "shapes" }));
  out.push(...listRows(at(eventData, "cultureShapes"), { module: MODULE, source: "cultureShapes" }));
  out.push(...listRows(at(eventData, "steampunk"), { module: MODULE, source: "steampunk", steampunk: true }));
  out.push(...vocabularyRows(MODULE));
  out.push(...north5cRows(MODULE));
  return out;
}

export const eventCoverage: CoverageAdapter = { module: MODULE, kinds: KINDS, roster: NORTH_ROSTER, rows };
