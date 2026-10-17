import { App, normalizePath, Notice, TFile, TFolder } from "obsidian";
import { isValidNamePackContent } from "./nameParser";
import {
  DEFAULT_NAMES_FOLDER,
  ensureVaultFolder,
  LEGACY_NAMES_FOLDER,
  normalizeFolderPath,
  resolveNamesFolderPath,
} from "./paths";
import type { NameForgeSettings } from "./modal";

const CONFIG_FILENAME = "nameForgeConfiguration.md";

/** Older pack homes we still look for when offering migration. */
const LEGACY_FOLDER_CANDIDATES = [
  LEGACY_NAMES_FOLDER,
  "Settings/Name Packs",
  "namepacks",
  "nameForge",
  "Name Packs",
];

export interface LegacyPackFolderInfo {
  path: string;
  packCount: number;
}

/**
 * Normalize legacy settings that stored a pack .md path in `namesFilePath`
 * into an explicit `folderPath`, defaulting to `_backstage/nameforge`.
 */
export function normalizeSettingsFolder(settings: NameForgeSettings): NameForgeSettings {
  const folderPath = resolveNamesFolderPath(settings.folderPath, settings.namesFilePath);
  return {
    ...settings,
    folderPath,
  };
}

/** Folder choices live in data.json so loading never has to find them inside the folder itself. */
export function folderSettingsData(settings: NameForgeSettings): { folderPath: string; settlementsFolder: string } {
  return {
    folderPath: resolveNamesFolderPath(settings.folderPath, settings.namesFilePath),
    settlementsFolder: (settings.settlementsFolder || "").trim(),
  };
}

/**
 * Combine data.json with a configuration note. The folders in data.json win;
 * a note's folders are used only when data.json has none (settings saved
 * before the folders were stored there).
 */
export function mergeFolderSettings(
  stored: Partial<NameForgeSettings> | null | undefined,
  note: Partial<NameForgeSettings>,
  current: NameForgeSettings
): NameForgeSettings {
  const hasStoredFolder = !!stored?.folderPath?.trim();
  const hasStoredSettlements = stored != null && typeof stored.settlementsFolder === "string" && "settlementsFolder" in stored;
  return normalizeSettingsFolder({
    ...current,
    ...note,
    namesFilePath: note.namesFilePath || current.namesFilePath,
    folderPath: hasStoredFolder ? current.folderPath : note.folderPath || current.folderPath,
    settlementsFolder: hasStoredSettlements ? current.settlementsFolder : note.settlementsFolder ?? current.settlementsFolder,
  });
}

async function countPacksInFolder(app: App, folder: TFolder): Promise<number> {
  let packCount = 0;
  for (const child of folder.children) {
    if (!(child instanceof TFile) || child.extension !== "md") {
      continue;
    }
    if (child.name === CONFIG_FILENAME) {
      continue;
    }
    try {
      const content = await app.vault.cachedRead(child);
      if (isValidNamePackContent(content)) {
        packCount += 1;
      }
    } catch {
      continue;
    }
  }
  return packCount;
}

/**
 * Detect a pack folder left over from an earlier nameForge layout so settings
 * can offer a one-click move. Only the known legacy locations qualify, and
 * never the folder the user has configured.
 */
export async function findLegacyPackFolder(
  app: App,
  settings: NameForgeSettings
): Promise<LegacyPackFolderInfo | null> {
  const configured = normalizeFolderPath(resolveNamesFolderPath(settings.folderPath, settings.namesFilePath));

  const seen = new Set<string>();
  for (const candidate of LEGACY_FOLDER_CANDIDATES) {
    const path = normalizeFolderPath(candidate);
    if (!path || path === configured || seen.has(path)) {
      continue;
    }
    seen.add(path);

    const folder = app.vault.getFolderByPath(normalizePath(path));
    if (!(folder instanceof TFolder)) {
      continue;
    }

    const packCount = await countPacksInFolder(app, folder);
    if (packCount > 0) {
      return { path, packCount };
    }
  }

  return null;
}

function uniqueDestinationPath(app: App, folderPath: string, fileName: string): string {
  const base = normalizePath(`${folderPath}/${fileName}`);
  if (!app.vault.getAbstractFileByPath(base)) {
    return base;
  }

  const dot = fileName.lastIndexOf(".");
  const stem = dot > 0 ? fileName.slice(0, dot) : fileName;
  const ext = dot > 0 ? fileName.slice(dot) : "";
  let n = 2;
  while (app.vault.getAbstractFileByPath(normalizePath(`${folderPath}/${stem} ${n}${ext}`))) {
    n += 1;
  }
  return normalizePath(`${folderPath}/${stem} ${n}${ext}`);
}

/**
 * Move name packs (and the configuration note, if present) from a legacy
 * folder into the configured names folder. Safe to re-run: skips files that
 * would collide by choosing a unique name, and no-ops when the source is the
 * configured folder. The configured folder is left as it was.
 */
export async function migratePacksToConfiguredFolder(
  app: App,
  settings: NameForgeSettings,
  fromFolderPath: string
): Promise<{ moved: number; settings: NameForgeSettings }> {
  const sourcePath = normalizeFolderPath(fromFolderPath);
  const targetPath = normalizeFolderPath(resolveNamesFolderPath(settings.folderPath, settings.namesFilePath));
  if (!sourcePath || sourcePath === targetPath) {
    return { moved: 0, settings };
  }

  const source = app.vault.getFolderByPath(normalizePath(sourcePath));
  if (!(source instanceof TFolder)) {
    new Notice(`nameForge: folder not found at ${sourcePath}`);
    return { moved: 0, settings };
  }

  await ensureVaultFolder(app, targetPath);

  let moved = 0;
  const children = [...source.children];
  for (const child of children) {
    if (!(child instanceof TFile) || child.extension !== "md") {
      continue;
    }

    const isConfig = child.name === CONFIG_FILENAME;
    const previousPath = child.path;
    if (!isConfig) {
      try {
        const content = await app.vault.cachedRead(child);
        if (!isValidNamePackContent(content)) {
          continue;
        }
      } catch {
        continue;
      }
    }

    const destination = uniqueDestinationPath(app, targetPath, child.name);
    if (normalizePath(previousPath) === destination) {
      continue;
    }

    await app.fileManager.renameFile(child, destination);
    moved += 1;

    if (!isConfig && settings.namesFilePath && normalizePath(settings.namesFilePath) === normalizePath(previousPath)) {
      settings.namesFilePath = destination;
    }
  }

  new Notice(
    moved > 0
      ? `nameForge: moved ${moved} file(s) to ${targetPath}`
      : `nameForge: nothing to move into ${targetPath}`
  );

  return { moved, settings };
}

/** Known places an older configuration note might still live. */
export function legacySettingsFileCandidates(settings: NameForgeSettings): string[] {
  const folders = [
    resolveNamesFolderPath(settings.folderPath, settings.namesFilePath),
    ...LEGACY_FOLDER_CANDIDATES,
    DEFAULT_NAMES_FOLDER,
  ];
  const paths: string[] = [];
  const seen = new Set<string>();
  for (const folder of folders) {
    const normalized = normalizeFolderPath(folder);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    paths.push(normalizePath(`${normalized}/${CONFIG_FILENAME}`));
  }
  return paths;
}
