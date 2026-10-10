// Vessel safeguard packs (Ships brief §14.5), read like group safeguard packs. No Obsidian imports.

export const VESSEL_SAFEGUARD_TYPE = "vessel-safeguards";

export function isVesselSafeguardPackContent(content: string): boolean {
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  return !!fm && new RegExp(`^type:\\s*["']?${VESSEL_SAFEGUARD_TYPE}["']?\\s*$`, "m").test(fm[1]);
}

/** The file "Create vessel safeguard list" writes. */
export const VESSEL_SAFEGUARD_TEMPLATE = `---
type: vessel-safeguards
flag-list-blocks: false
---

## Block

Ship and spacecraft names never to produce. Each one is added to the built-in block list of famous real ships, spacecraft and fictional vessels.

## Flag

Names to allow, though they echo a real or well-known vessel.

## Allow

Names to take off the flag list. Built-in block-list names can't be allowed.
`;
