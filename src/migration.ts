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

export async function ensureDefaultNamesFolder(app: App, settings: NameForgeSettings): Promise<NameForgeSettings> {
  const normalized = normalizeSettingsFolder(settings);
  const folderPath = normalized.folderPath || DEFAULT_NAMES_FOLDER;
  await ensureVaultFolder(app, folderPath);
  return { ...normalized, folderPath };
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
 * Detect a pack folder that still lives outside `_backstage/nameforge` so
 * settings can offer a one-click move. Checks the configured folder first,
 * then known legacy locations from earlier nameForge layouts.
 */
export async function findLegacyPackFolder(
  app: App,
  settings: NameForgeSettings
): Promise<LegacyPackFolderInfo | null> {
  const candidates = [
    resolveNamesFolderPath(settings.folderPath, settings.namesFilePath),
    ...LEGACY_FOLDER_CANDIDATES,
  ];

  const seen = new Set<string>();
  for (const candidate of candidates) {
    const path = normalizeFolderPath(candidate);
    if (!path || path === DEFAULT_NAMES_FOLDER || seen.has(path)) {
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
 * folder into `_backstage/nameforge`. Safe to re-run: skips files that would
 * collide by choosing a unique name, and no-ops when the source is already
 * the default.
 */
export async function migratePacksToDefaultFolder(
  app: App,
  settings: NameForgeSettings,
  fromFolderPath: string
): Promise<{ moved: number; settings: NameForgeSettings }> {
  const sourcePath = normalizeFolderPath(fromFolderPath);
  if (!sourcePath || sourcePath === DEFAULT_NAMES_FOLDER) {
    return { moved: 0, settings };
  }

  const source = app.vault.getFolderByPath(normalizePath(sourcePath));
  if (!(source instanceof TFolder)) {
    new Notice(`nameForge: folder not found at ${sourcePath}`);
    return { moved: 0, settings };
  }

  await ensureVaultFolder(app, DEFAULT_NAMES_FOLDER);

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

    const destination = uniqueDestinationPath(app, DEFAULT_NAMES_FOLDER, child.name);
    if (normalizePath(previousPath) === destination) {
      continue;
    }

    await app.fileManager.renameFile(child, destination);
    moved += 1;

    if (!isConfig && settings.namesFilePath && normalizePath(settings.namesFilePath) === normalizePath(previousPath)) {
      settings.namesFilePath = destination;
    }
  }

  settings.folderPath = DEFAULT_NAMES_FOLDER;
  new Notice(
    moved > 0
      ? `nameForge: moved ${moved} file(s) to ${DEFAULT_NAMES_FOLDER}`
      : `nameForge: nothing to move into ${DEFAULT_NAMES_FOLDER}`
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
