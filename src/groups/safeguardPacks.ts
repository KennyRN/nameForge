// Group safeguard packs (Group brief §12.6), read like the tribal ones. No Obsidian imports.

export const GROUP_SAFEGUARD_TYPE = "group-safeguards";

export function isGroupSafeguardPackContent(content: string): boolean {
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  return !!fm && new RegExp(`^type:\\s*["']?${GROUP_SAFEGUARD_TYPE}["']?\\s*$`, "m").test(fm[1]);
}

/** The file "Create group safeguard list" writes. */
export const GROUP_SAFEGUARD_TEMPLATE = `---
type: group-safeguards
flag-list-blocks: false
---

## Block

Names never to produce. Each one is added to the built-in block list of real orders, armies, gangs, companies and movements.

## Flag

Names to allow, though they echo a real or well-known group.

## Allow

Names to take off the flag list. Built-in block-list names can't be allowed.
`;
