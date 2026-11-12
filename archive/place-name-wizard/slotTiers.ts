// The place name wizard's slot tiers, archived with the wizard (wizard retirement brief §2.1).
// Moved out of src/names/slotOptions.ts; not compiled or tested by the plugin.
import { slotCategories, type SlotPart } from "../../src/names/slotOptions";

export type SlotTier = "simple" | "detailed" | "complete";

export const SLOT_TIERS: SlotTier[] = ["simple", "detailed", "complete"];

const ALL: SlotPart[] = ["organic", "new-land", "established"];
const COLONIAL: SlotPart[] = ["new-land", "established"];

/** Simple and Detailed slots, by part. Anything not listed is Complete. */
const TIER_TABLE: Record<Exclude<SlotTier, "complete">, Record<string, SlotPart[]>> = {
  simple: {
    "personal-name": ["organic", "new-land"],
    "earlier-or-district-name": ["organic"],
    "folk-group": ["organic"],
    "native-place-name": COLONIAL,
    "monarch-ruler-or-dynasty": COLONIAL,
    "official-patron-or-sponsor": COLONIAL,
    "explorer-or-founder": COLONIAL,
    "wild-animal": COLONIAL,
    bird: COLONIAL,
    "fish-and-other-creatures": COLONIAL,
  },
  detailed: {
    "saint-or-holy-person": ALL,
    deity: ["organic"],
    "river-or-stream-name": ALL,
    "status-or-role": ALL,
    "ethnic-or-cultural-group": ["organic", "new-land"],
    "supernatural-being": ALL,
    "royal-woman": COLONIAL,
    "commander-or-conqueror": COLONIAL,
    "homeland-place-name": COLONIAL,
    "native-people-or-tribe": COLONIAL,
    "colonial-deity": COLONIAL,
    "local-deity": ["established"],
    tree: COLONIAL,
    "wild-plant": COLONIAL,
    "settler-group": COLONIAL,
    "classical-biblical-or-legendary-name": COLONIAL,
    ship: ["new-land"],
    "calendar-date-or-feast": ["new-land"],
    "local-settlement-word": ["established"],
    "local-market-word": ["established"],
  },
};

/** The tier a slot first appears at for a part; any slot not in the tables is Complete. */
export function slotTier(part: SlotPart, categoryId: string): SlotTier {
  if (TIER_TABLE.simple[categoryId]?.includes(part)) return "simple";
  if (TIER_TABLE.detailed[categoryId]?.includes(part)) return "detailed";
  return "complete";
}

/** The ids each tier names for a part (Simple's and Detailed's own, not cumulative). */
export function tierTableIds(part: SlotPart, tier: Exclude<SlotTier, "complete">): string[] {
  return Object.entries(TIER_TABLE[tier])
    .filter(([, parts]) => parts.includes(part))
    .map(([id]) => id);
}

/** Whether a slot at `slot`'s tier is shown at `chosen` (tiers are cumulative). */
export function tierIncludes(chosen: SlotTier, slot: SlotTier): boolean {
  return SLOT_TIERS.indexOf(slot) <= SLOT_TIERS.indexOf(chosen);
}

