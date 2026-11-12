// Names of the notes nameForge writes (pack names and biome marks brief §1, §2): every pack needs a
// real name, "nameForge" is reserved, and no two notes in the names folder share a name or a biome
// phrase. Pure: the host reads the folder and passes the notes in.

import type { Biome } from "./biomes";
import { biomeFile } from "./biomeMenus";
import { sanitizePackNameForFilename } from "./nameParser";

/** The name nameForge keeps for itself. */
export const RESERVED_NAME = "nameForge";

/** Names are compared ignoring case and surrounding spaces. */
export const normaliseName = (s: string | undefined): string => (s ?? "").trim().toLowerCase();

export const NO_NAME_MESSAGE = "Give the pack a name.";
export const RESERVED_MESSAGE = `“${RESERVED_NAME}” is reserved – choose another name.`;
export const clashMessage = (name: string): string => `There's already a note called “${name}” in the names folder – choose another name.`;
export const phraseClashMessage = (phrase: string, label: string): string => `The phrase “${phrase}” is already used by ${label} – choose another.`;

/** What a note in the names folder is called: its file name and, if it has one, its `packName`. */
export interface NoteName {
  path: string;
  basename: string;
  packName?: string;
}

/** A new name's first problem: empty, or the reserved name. */
export function nameProblem(raw: string | undefined): string | undefined {
  const name = (raw ?? "").trim();
  if (!name) return NO_NAME_MESSAGE;
  if (normaliseName(name) === normaliseName(RESERVED_NAME)) return RESERVED_MESSAGE;
  return undefined;
}

/** The `packName` in a note's frontmatter, if it has one. */
export function packNameOfNote(text: string): string | undefined {
  const fm = text.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  const line = fm?.[1].match(/^packName:[ \t]*(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
  return line || undefined;
}

/** The note a new name would clash with: one whose file name or `packName` is the same (the note being edited excepted). */
export function nameClash(name: string, notes: readonly NoteName[], editingPath?: string): NoteName | undefined {
  const wanted = new Set([normaliseName(name), normaliseName(sanitizePackNameForFilename(name))]);
  return notes.find((n) => n.path !== editingPath && (wanted.has(normaliseName(n.basename)) || (n.packName !== undefined && wanted.has(normaliseName(n.packName)))));
}

/** Everything wrong with saving a new note under this name, as the message to show; undefined when it's free. */
export function newNameProblem(raw: string | undefined, notes: readonly NoteName[], editingPath?: string): string | undefined {
  const problem = nameProblem(raw);
  if (problem) return problem;
  const name = raw!.trim();
  return nameClash(name, notes, editingPath) ? clashMessage(name) : undefined;
}

/**
 * §2.1: a biome pack's phrase must not be another biome's label or phrase. A pack that replaces a
 * built-in may keep that built-in's phrase (or leave it empty); the pack being edited is excepted.
 */
export function phraseProblem(phrase: string | undefined, biomes: readonly Biome[], opts: { editingPath?: string; replaces?: Pick<Biome, "id"> } = {}): string | undefined {
  const wanted = normaliseName(phrase);
  if (!wanted) return undefined;
  const other = biomes.find(
    (b) => !(opts.editingPath && b.custom?.path === opts.editingPath) && !(opts.replaces && b.id === opts.replaces.id) && (normaliseName(b.label) === wanted || normaliseName(b.phrase) === wanted),
  );
  return other ? phraseClashMessage(phrase!.trim(), other.label) : undefined;
}

/**
 * §2.2: what's already wrong in the folder, one message each, never changing a note: a note called
 * "nameForge", two notes with one name, and a biome whose label or phrase another biome also uses.
 */
export function folderNameProblems(notes: readonly NoteName[], biomes: readonly Biome[]): string[] {
  const out: string[] = [];
  const file = (n: NoteName) => `${n.basename}.md`;
  for (const n of notes) {
    if (normaliseName(n.basename) === normaliseName(RESERVED_NAME) || normaliseName(n.packName) === normaliseName(RESERVED_NAME)) {
      out.push(`Names folder: “${file(n)}” is called “${RESERVED_NAME}”, which is reserved – rename it.`);
    }
  }
  const byName = new Map<string, NoteName[]>();
  for (const n of notes) {
    for (const key of new Set([normaliseName(n.basename), ...(n.packName ? [normaliseName(n.packName)] : [])])) {
      byName.set(key, [...(byName.get(key) ?? []), n]);
    }
  }
  for (const [key, group] of byName) {
    if (group.length > 1 && key !== normaliseName(RESERVED_NAME)) {
      out.push(`Names folder: ${group.map((n) => `“${file(n)}”`).join(" and ")} share the name “${key}” – rename one.`);
    }
  }
  // Each pair once. The biome whose phrase is the other's label or phrase is the one that "uses" it; only a pack is named.
  const uses = (x: Biome, y: Biome) => !!x.custom && (normaliseName(x.phrase) === normaliseName(y.label) || normaliseName(x.phrase) === normaliseName(y.phrase));
  for (let i = 0; i < biomes.length; i++) {
    for (let j = i + 1; j < biomes.length; j++) {
      const x = biomes[i];
      const y = biomes[j];
      if (!x.custom && !y.custom) continue;
      if (uses(x, y) || uses(y, x)) {
        const [pack, other] = uses(x, y) ? [x, y] : [y, x];
        out.push(`Names folder: “${biomeFile(pack)}” uses the phrase “${pack.phrase}”, which the ${other.label} biome also uses – rename one.`);
      } else if (normaliseName(x.label) === normaliseName(y.label)) {
        const [pack, other] = x.custom ? [x, y] : [y, x];
        out.push(`Names folder: “${biomeFile(pack)}” is called “${pack.label}”, which the ${other.label} biome also uses – rename one.`);
      }
    }
  }
  return out;
}
