// Byname safeguard packs (Bynames brief §11.7), read like group safeguard packs. No Obsidian imports.

export const BYNAME_SAFEGUARD_TYPE = "byname-safeguards";

export function isBynameSafeguardPackContent(content: string): boolean {
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  return !!fm && new RegExp(`^type:\\s*["']?${BYNAME_SAFEGUARD_TYPE}["']?\\s*$`, "m").test(fm[1]);
}

/** The file "Create byname safeguard list" writes. */
export const BYNAME_SAFEGUARD_TEMPLATE = `---
type: byname-safeguards
flag-list-blocks: false
---

## Block

Bynames, titles and family names never to produce. Each one is added to the built-in block list of real epithets, titles and well-known fictional names.

## Flag

Names to allow, though they echo a real or well-known person or title.

## Allow

Names to take off the flag list. Built-in block-list names can't be allowed.
`;
