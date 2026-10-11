// Vocabulary packs in the names folder (Route names brief §3.3): every `type: vocabulary` note is
// read, as safeguard packs are, and "Create vocabulary pack" writes Vocabulary.md. The vault is
// passed in as plain functions, so this has no Obsidian imports and can be tested.

import { isVocabularyPackContent, mergeVocabularyPacks, VOCABULARY_PACK_TEMPLATE, type Vocabulary } from "./vocab";

/** A note in the names folder: its name and a way to read it. */
export interface VocabNote {
  basename: string;
  read: () => Promise<string>;
}

/** §3.3: the vocabulary packs among a folder's notes. */
export async function readVocabularyPacks(notes: readonly VocabNote[]): Promise<{ name: string; content: string }[]> {
  const packs: { name: string; content: string }[] = [];
  for (const note of notes) {
    const content = await note.read();
    if (isVocabularyPackContent(content)) packs.push({ name: note.basename, content });
  }
  return packs;
}

/** §3.3: the merged vocabulary for a folder's notes, with the packs' problems as notices. */
export async function loadVocabulary(notes: readonly VocabNote[], blocked?: (word: string) => boolean): Promise<{ vocab: Vocabulary; notices: string[] }> {
  return mergeVocabularyPacks(await readVocabularyPacks(notes), blocked);
}

export const VOCABULARY_PACK_FILE = "Vocabulary.md";

/** §3.3: "Create vocabulary pack": writes Vocabulary.md in the folder, never over an existing note. */
export async function createVocabularyPack(
  vault: { exists: (path: string) => boolean; create: (path: string, content: string) => Promise<unknown> },
  folder: string,
): Promise<"created" | "exists"> {
  const path = folder ? `${folder.replace(/\/+$/, "")}/${VOCABULARY_PACK_FILE}` : VOCABULARY_PACK_FILE;
  if (vault.exists(path)) return "exists";
  await vault.create(path, VOCABULARY_PACK_TEMPLATE);
  return "created";
}
