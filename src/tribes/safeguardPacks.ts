// Tribal safeguard packs (Land brief §10). No Obsidian imports.
//
// `type: tribal-safeguards` files with `## Block`, `## Flag` and `## Allow` sections of `-` lines.
// Every such file in the names folder applies. Packs can add to both lists and take entries off
// the flag list, but never off the built-in block list: it protects living peoples' names.

export interface SafeguardPack {
  block: string[];
  flag: string[];
  allow: string[];
  flagListBlocks: boolean;
}

export interface Safeguards {
  block: string[];
  flag: string[];
  flagBlocks: boolean;
}

export function isSafeguardPackContent(content: string): boolean {
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  return !!fm && /^type:\s*["']?tribal-safeguards["']?\s*$/m.test(fm[1]);
}

export function parseSafeguardPack(content: string): SafeguardPack {
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  const pack: SafeguardPack = { block: [], flag: [], allow: [], flagListBlocks: !!fm && /^flag-list-blocks:\s*true\s*$/m.test(fm[1]) };
  let target: string[] | null = null;
  for (const raw of (fm ? content.slice(fm[0].length) : content).split(/\r?\n/)) {
    const line = raw.trim();
    const heading = line.match(/^##\s+(.+?)\s*#*$/);
    if (heading) {
      const h = heading[1].toLowerCase();
      target = h === "block" ? pack.block : h === "flag" ? pack.flag : h === "allow" ? pack.allow : null;
      continue;
    }
    const bullet = line.match(/^[-*+]\s+(.+)$/);
    if (bullet && target) target.push(...bullet[1].split(",").map((w) => w.trim()).filter(Boolean));
  }
  return pack;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/^the /, "");

/** Land brief §10: built-in lists merged with every pack; notices for Allow entries that can't apply. */
export function mergeSafeguards(builtIn: { blockList: string[]; flagList: string[]; flagListBlocks: boolean }, packs: readonly SafeguardPack[]): Safeguards & { notices: string[] } {
  const notices: string[] = [];
  const builtInBlock = new Set(builtIn.blockList.map(norm));
  const allow = new Set<string>();
  for (const p of packs) {
    for (const a of p.allow) {
      if (builtInBlock.has(norm(a))) notices.push(`“${a}” is on the built-in block list and stays blocked.`);
      else allow.add(norm(a));
    }
  }
  const block = [...builtIn.blockList, ...packs.flatMap((p) => p.block)];
  const flag = [...builtIn.flagList, ...packs.flatMap((p) => p.flag)].filter((f) => !allow.has(norm(f)));
  return { block, flag, flagBlocks: builtIn.flagListBlocks || packs.some((p) => p.flagListBlocks), notices };
}

/** The file "Create tribal safeguard list" writes. */
export const SAFEGUARD_TEMPLATE = `---
type: tribal-safeguards
flag-list-blocks: false
---

## Block

Names never to produce. Each one is added to the built-in block list, which protects living peoples' names.

## Flag

Names to allow but mark as echoing a real historical people.

## Allow

Names to take off the flag list. Built-in block-list names can't be allowed.
`;
