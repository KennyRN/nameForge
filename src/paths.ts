import { App, normalizePath, TFolder } from "obsidian";

/** Default home for name packs — matches the Forge family `_xx-backstage` pattern. */
export const DEFAULT_NAMES_FOLDER = "_nf-backstage";

export function normalizeFolderPath(path?: string): string {
  const configured = (path || "").trim();
  if (!configured) {
    return "";
  }

  if (configured.toLowerCase().endsWith(".md")) {
    const lastSlash = configured.lastIndexOf("/");
    return lastSlash > 0 ? configured.substring(0, lastSlash) : "";
  }

  return configured.replace(/\/+$/, "");
}

export function resolveNamesFolderPath(folderPath?: string, namesFilePath?: string): string {
  return (
    normalizeFolderPath(folderPath) ||
    normalizeFolderPath(namesFilePath) ||
    DEFAULT_NAMES_FOLDER
  );
}

export async function ensureVaultFolder(app: App, folderPath: string): Promise<TFolder> {
  const normalized = normalizePath(folderPath);
  const existing = app.vault.getAbstractFileByPath(normalized);
  if (existing instanceof TFolder) {
    return existing;
  }

  await app.vault.createFolder(normalized);
  const created = app.vault.getAbstractFileByPath(normalized);
  if (!(created instanceof TFolder)) {
    throw new Error(`Failed to create folder at ${normalized}`);
  }
  return created;
}
