// Stellar brief §10: franchise phrases that space words must not assemble. Exact phrases are
// blocked, whole-word and case-insensitively; single words stay in the lists. Obsidian-free.

import { SPACE_DATA } from "./scale";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const compile = (phrases: string[]) => phrases.map((p) => new RegExp(`(^|[^A-Za-z0-9])${esc(p).replace(/\s+/g, "\\s+")}($|[^A-Za-z0-9])`, "i"));

const BUILT_IN = compile(SPACE_DATA.safeguards.block);

/** A matcher over the built-in phrases plus any a user safeguard pack adds (which cannot remove them). */
export function spaceBlocker(extra: string[] = []): (text: string) => boolean {
  const all = extra.length > 0 ? [...BUILT_IN, ...compile(extra)] : BUILT_IN;
  return (text) => all.some((re) => re.test(text));
}

const DEFAULT = spaceBlocker();

/** §10: whether a name equals, or contains as whole words, a blocked phrase. */
export function hasSpaceBlock(text: string): boolean {
  return DEFAULT(text);
}

/** The built-in phrases, for modules that merge them into their own block sets. */
export const SPACE_BLOCK_PHRASES: string[] = SPACE_DATA.safeguards.block;
