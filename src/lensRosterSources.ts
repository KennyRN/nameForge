// Registers every module's culture roster in one place, for the tests and scripts that read the lens
// clause for all modules at once. The plugin doesn't import this: each sentence file registers its own.
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
import { registerRoster } from "./lensRosters";

registerRoster("route", ROUTE_CULTURES);
registerRoster("money", MONEY_CULTURES);
registerRoster("thing", THING_CULTURES);
registerRoster("deity", DEITY_CULTURES);
registerRoster("people", PEOPLE_CULTURES);
registerRoster("time", TIME_CULTURES);
registerRoster("wilds", WILDS_CULTURES);
registerRoster("waters", WATERS_CULTURES);
registerRoster("byname", BYNAME_CULTURES);
registerRoster("vessel", VESSEL_CULTURES);
registerRoster("realm", REALM_CULTURES);
