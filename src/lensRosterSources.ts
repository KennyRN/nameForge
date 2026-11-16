// Registers every module's culture roster in one place, for the tests and scripts that read the lens
// clause for all modules at once. The plugin doesn't import this: each sentence file registers its own.
// No Obsidian imports.

import { BYNAME_CULTURES_5C } from "./bynames/engine";
import { DEITY_CULTURES, DEITY5A_CULTURES } from "./deities/engine";
import { MONEY_CULTURES } from "./money/engine";
import { PEOPLE_CULTURES } from "./peoples/engine";
import { REALM_CULTURES } from "./realms/engine";
import { NORTH_CULTURES, ROUTE_CULTURES } from "./routes/engine";
import { THING_CULTURES } from "./things/engine";
import { TIME_CULTURES } from "./timesky/data";
import { VESSEL_BASE_CULTURES, VESSEL_CULTURES } from "./vessels/engine";
import { WATERS_CULTURES } from "./waters/engine";
import { WILDS_CULTURES } from "./wilds/engine";
import { registerRoster } from "./lensRosters";

registerRoster("route", ROUTE_CULTURES);
registerRoster("route5a", NORTH_CULTURES);
registerRoster("money", MONEY_CULTURES);
registerRoster("thing", THING_CULTURES);
registerRoster("deity", DEITY_CULTURES);
registerRoster("deity5a", DEITY5A_CULTURES);
registerRoster("people", PEOPLE_CULTURES);
registerRoster("time", TIME_CULTURES);
registerRoster("wilds", ROUTE_CULTURES);
registerRoster("wilds5a", WILDS_CULTURES);
registerRoster("waters", WATERS_CULTURES);
registerRoster("waters5a", WATERS_CULTURES);
registerRoster("byname", BYNAME_CULTURES_5C);
registerRoster("vessel", VESSEL_CULTURES);
registerRoster("vesselSpace", VESSEL_BASE_CULTURES);
registerRoster("realm", REALM_CULTURES);
