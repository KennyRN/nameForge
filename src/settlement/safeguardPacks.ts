// Settlement safeguard packs (Route names brief §12.6), read like group safeguard packs. They apply
// to route names and to every later settlement module. No Obsidian imports.

export const SETTLEMENT_SAFEGUARD_TYPE = "settlement-safeguards";

export function isSettlementSafeguardPackContent(content: string): boolean {
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  return !!fm && new RegExp(`^type:\\s*["']?${SETTLEMENT_SAFEGUARD_TYPE}["']?\\s*$`, "m").test(fm[1]);
}

/** The file "Create settlement safeguard list" writes. */
export const SETTLEMENT_SAFEGUARD_TEMPLATE = `---
type: settlement-safeguards
flag-list-blocks: false
---

## Block

Route, street and other settlement names never to produce. Each one is added to the built-in block list of real and fictional roads and routes.

## Flag

Names to allow, though they echo a real or well-known route.

## Allow

Names to take off the flag list. Built-in block-list names can't be allowed.
`;
