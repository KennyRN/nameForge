// The names folder's notes by name, for the checks that keep every note's name its own (pack names
// and biome marks brief §2). The Obsidian side: it lists and reads; the rules are in noteNames.ts.

import { App, normalizePath, TFile } from "obsidian";
import { type NoteName, nameClash, packNameOfNote } from "./noteNames";

/** Every markdown note directly in the folder, by file name and `packName`. */
export async function folderNoteNames(app: App, folder: string): Promise<NoteName[]> {
  const dir = app.vault.getFolderByPath(normalizePath(folder || "/"));
  const out: NoteName[] = [];
  for (const file of (dir?.children ?? []).filter((c): c is TFile => c instanceof TFile && c.extension === "md")) {
    let packName: string | undefined;
    try {
      packName = packNameOfNote(await app.vault.cachedRead(file));
    } catch {
      packName = undefined;
    }
    out.push({ path: file.path, basename: file.basename, packName });
  }
  return out;
}

/** The note in the folder that already has this name (its file name or `packName`), if any. */
export async function nameTakenIn(app: App, folder: string, name: string): Promise<NoteName | undefined> {
  return nameClash(name, await folderNoteNames(app, folder));
}
