// The culture rosters the modules offer today, by the roster name `lens.json` gives each module under
// `modules.<key>.sentence.roster`. One thin table over the engines' own exports, so the lens clause
// (src/lensView.ts) offers exactly the cultures a module has now and holds no culture list of its own.
// No Obsidian imports.

import { BYNAME_CULTURES } from "./bynames/engine";
import { DEITY_CULTURES } from "./deities/engine";
import { MONEY_CULTURES } from "./money/engine";
import { PEOPLE_CULTURES } from "./peoples/engine";
import { REALM_CULTURES } from "./realms/engine";
import { ROUTE_CULTURES } from "./routes/engine";
import { THING_CULTURES } from "./things/engine";
import { TIME_CULTURES } from "./timesky/data";
import { VESSEL_CULTURES } from "./vessels/engine";
import { WATERS_CULTURES } from "./waters/engine";
import { WILDS_CULTURES } from "./wilds/engine";

export interface RosterCulture {
  key: string;
  label: string;
}

const ROSTERS: Record<string, readonly RosterCulture[]> = {
  route: ROUTE_CULTURES,
  money: MONEY_CULTURES,
  thing: THING_CULTURES,
  deity: DEITY_CULTURES,
  people: PEOPLE_CULTURES,
  time: TIME_CULTURES,
  wilds: WILDS_CULTURES,
  waters: WATERS_CULTURES,
  byname: BYNAME_CULTURES,
  vessel: VESSEL_CULTURES,
  realm: REALM_CULTURES,
};

/** The cultures a roster offers, in the module's own order, with its own labels. */
export function rosterCultures(roster: string): readonly RosterCulture[] {
  const found = ROSTERS[roster];
  if (!found) throw new Error(`lens: no culture roster called “${roster}”`);
  return found;
}

export const ROSTER_NAMES: readonly string[] = Object.keys(ROSTERS);
