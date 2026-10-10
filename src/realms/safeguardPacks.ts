// Realm safeguard packs (Realms brief §12.4), read like group safeguard packs. No Obsidian imports.

export const REALM_SAFEGUARD_TYPE = "realm-safeguards";

export function isRealmSafeguardPackContent(content: string): boolean {
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  return !!fm && new RegExp(`^type:\\s*["']?${REALM_SAFEGUARD_TYPE}["']?\\s*$`, "m").test(fm[1]);
}

/** The file "Create realm safeguard list" writes. */
export const REALM_SAFEGUARD_TEMPLATE = `---
type: realm-safeguards
flag-list-blocks: false
---

## Block

Realm names never to produce. Each one is added to the built-in block list of real states and well-known fictional ones.

## Flag

Names to allow, though they echo a real or well-known state.

## Allow

Names to take off the flag list. Built-in block-list names can't be allowed.
`;
