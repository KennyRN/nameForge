import { App, normalizePath, TFolder } from "obsidian";

/** Default home for name packs — shared Forge `_backstage` tree. */
export const DEFAULT_NAMES_FOLDER = "_backstage/nameforge";

/** Previous default; still read and offered for one-click migration. */
export const LEGACY_NAMES_FOLDER = "_nf-backstage";

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

function isAlreadyExistsError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /already exists/i.test(message);
}

/**
 * Create a single path segment if needed. Idempotent: a folder that already
 * exists on disk must not throw. During plugin load (and for excluded `_`
 * folders) the vault index can miss a path that the adapter still sees, so
 * `createFolder` would otherwise fail with "Folder already exists".
 */
async function ensureSingleFolder(app: App, normalized: string): Promise<TFolder | null> {
  const existing = app.vault.getFolderByPath(normalized);
  if (existing) {
    return existing;
  }

  const occupied = app.vault.getAbstractFileByPath(normalized);
  if (occupied) {
    throw new Error(`A file already exists at ${normalized}`);
  }

  let existsOnDisk = false;
  try {
    existsOnDisk = await app.vault.adapter.exists(normalized);
  } catch {
    existsOnDisk = false;
  }

  if (!existsOnDisk) {
    try {
      await app.vault.createFolder(normalized);
    } catch (error) {
      if (!isAlreadyExistsError(error)) {
        throw error;
      }
    }
  }

  return app.vault.getFolderByPath(normalized);
}

/**
 * Create `folderPath` (and any missing parents) if needed.
 * Returns null when the folder is on disk but not in the vault index.
 */
export async function ensureVaultFolder(app: App, folderPath: string): Promise<TFolder | null> {
  const normalized = normalizePath(folderPath);
  if (!normalized) {
    return null;
  }

  const existing = app.vault.getFolderByPath(normalized);
  if (existing) {
    return existing;
  }

  let built = "";
  for (const part of normalized.split("/").filter(Boolean)) {
    built = built ? `${built}/${part}` : part;
    await ensureSingleFolder(app, built);
  }

  return app.vault.getFolderByPath(normalized);
}
