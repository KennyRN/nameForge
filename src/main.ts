import { normalizePath, Plugin, TFile } from "obsidian";
import { NameForgeSettingTab } from "./settings";
import { GenerationHistoryEntry, MAX_HISTORY_ENTRIES, NameForgeModal, NameForgeSettings } from "./modal";
import { ICON_MEEPLE, registerNameForgeIcons } from "./icons";
import { ensureDefaultNamesFolder, legacySettingsFileCandidates, normalizeSettingsFolder } from "./migration";
import { DEFAULT_NAMES_FOLDER, ensureVaultFolder, resolveNamesFolderPath } from "./paths";
import { softConnectWithRetry } from "./hostConnectRetry";
import { getStoryForgeHostApi } from "./storyforgeBridge";

const DEFAULT_SETTINGS: NameForgeSettings = {
  namesFilePath: "",
  packName: "",
  folderPath: DEFAULT_NAMES_FOLDER,
  faithfulness: 2,
  strictness: 3,
};

function getSettingsFilePath(settings: NameForgeSettings): string {
  const folderPath = resolveNamesFolderPath(settings.folderPath, settings.namesFilePath);
  return folderPath ? normalizePath(`${folderPath}/nameForgeConfiguration.md`) : "";
}

/**
 * The history line format is `- {timestamp} | {seed} | {packName} ({count})` —
 * the timestamp and seed are fixed-format tokens matched before the free-text
 * packName, so a pack name containing "|" still parses correctly (it's
 * always "everything after the second pipe"). The trailing "(count)" is
 * optional so lines written before this field existed still parse.
 */
const HISTORY_LINE_PATTERN = /^-\s*(\d{8}-\d{6})\s*\|\s*(-?\d+)\s*\|\s*(.*)$/;
const HISTORY_COUNT_SUFFIX_PATTERN = /^(.*)\s\((\d+)\)$/;

function parseGenerationHistory(body: string): GenerationHistoryEntry[] {
  const headingIndex = body.indexOf("## Generation History");
  if (headingIndex === -1) {
    return [];
  }

  const entries: GenerationHistoryEntry[] = [];
  for (const line of body.slice(headingIndex).split(/\r?\n/)) {
    const match = line.match(HISTORY_LINE_PATTERN);
    if (!match) {
      continue;
    }
    const [, timestamp, seedText, rest] = match;
    const seed = Number(seedText);
    if (!Number.isFinite(seed)) {
      continue;
    }
    const countMatch = rest.match(HISTORY_COUNT_SUFFIX_PATTERN);
    const packName = (countMatch ? countMatch[1] : rest).trim();
    const count = countMatch ? Number(countMatch[2]) : undefined;
    entries.push({ timestamp, seed, packName, count });
  }

  return entries;
}

function createGenerationHistorySection(history?: GenerationHistoryEntry[]): string {
  if (!history || history.length === 0) {
    return "";
  }

  const lines = history
    .slice(0, MAX_HISTORY_ENTRIES)
    .map((entry) => `- ${entry.timestamp} | ${entry.seed} | ${entry.packName}${entry.count !== undefined ? ` (${entry.count})` : ""}`);
  return `\n## Generation History\n\n${lines.join("\n")}\n`;
}

function parseSettingsMarkdownContent(content: string): Partial<NameForgeSettings> {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  if (!frontmatterMatch) {
    return {};
  }

  const parsed: Partial<NameForgeSettings> = {};
  for (const line of frontmatterMatch[1].split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, value] = match;
    const trimmedValue = value.trim().replace(/^['"]|['"]$/g, "");

    if (key === "folder") {
      parsed.folderPath = trimmedValue;
    } else if (key === "namesFilePath") {
      parsed.namesFilePath = trimmedValue;
    } else if (key === "packName") {
      parsed.packName = trimmedValue;
    } else if (key === "faithfulness") {
      const numeric = Number(trimmedValue);
      if (!Number.isNaN(numeric)) {
        parsed.faithfulness = numeric;
      }
    } else if (key === "strictness") {
      const numeric = Number(trimmedValue);
      if (!Number.isNaN(numeric)) {
        parsed.strictness = numeric;
      }
    }
  }

  const history = parseGenerationHistory(content.slice(frontmatterMatch[0].length));
  if (history.length > 0) {
    parsed.previousGenerations = history;
  }

  return parsed;
}

function createSettingsMarkdownContent(settings: NameForgeSettings): string {
  const folderPath = resolveNamesFolderPath(settings.folderPath, settings.namesFilePath);
  const lines = [`folder: ${folderPath || DEFAULT_NAMES_FOLDER}`, `namesFilePath: ${settings.namesFilePath || ""}`];

  const trimmedPackName = (settings.packName || "").trim().replace(/\s+/g, " ");
  if (trimmedPackName) {
    lines.push(`packName: ${trimmedPackName}`);
  }

  lines.push(`faithfulness: ${settings.faithfulness ?? DEFAULT_SETTINGS.faithfulness}`);
  lines.push(`strictness: ${settings.strictness ?? DEFAULT_SETTINGS.strictness}`);

  const frontmatter = `---\ntype: configurationFile\n${lines.join("\n")}\n---\n`;
  return frontmatter + createGenerationHistorySection(settings.previousGenerations);
}

export default class NameForgePlugin extends Plugin {
  settings: NameForgeSettings = {};
  private unregisterCompanionPanel: (() => void) | null = null;
  /** Identity of the storyForge `api` object we last registered with (detects host hot-reload). */
  private storyForgeApiRef: object | null = null;

  async onload() {
    registerNameForgeIcons();
    this.addRibbonIcon(ICON_MEEPLE, "nameForge", () => {
      this.openNameGenerator();
    });

    this.addCommand({
      id: "open-name-generator",
      name: "Open name generator",
      callback: () => {
        this.openNameGenerator();
      },
    });

    try {
      await this.loadSettings();
    } catch (error) {
      console.error("nameForge: failed to load settings", error);
    }

    this.addSettingTab(new NameForgeSettingTab(this.app, this));
    this.connectToStoryForge();
  }

  onunload() {
    try {
      this.unregisterCompanionPanel?.();
    } catch {
      /* host may already be gone */
    }
    this.unregisterCompanionPanel = null;
    this.storyForgeApiRef = null;
  }

  openNameGenerator(): void {
    new NameForgeModal(this.app, this, this.settings).open();
  }

  /**
   * Soft-connect: register the nameForge companion panel on storyForge Forge
   * when host API version >= 3 is available. Rebinds when the host hot-reloads
   * (new `api` object identity).
   */
  private connectToStoryForge(): void {
    const tryConnect = (): boolean => {
      const api = getStoryForgeHostApi(this.app);
      if (!api?.registerCompanionPanel) {
        this.unregisterCompanionPanel = null;
        this.storyForgeApiRef = null;
        return false;
      }

      if (this.unregisterCompanionPanel && this.storyForgeApiRef === api) {
        return true;
      }

      try {
        this.unregisterCompanionPanel?.();
      } catch {
        /* old host may already be dead */
      }

      registerNameForgeIcons();
      this.unregisterCompanionPanel = api.registerCompanionPanel({
        id: "nameforge",
        orderHint: 100,
        icon: ICON_MEEPLE,
        label: "nameForge",
        renderPanel: (containerEl) => NameForgeModal.mountPanel(containerEl, this.app, this),
      });
      this.storyForgeApiRef = api;
      return true;
    };

    softConnectWithRetry(tryConnect, {
      registerInterval: (id) => this.registerInterval(id),
      onLayoutChange: (cb) => {
        this.registerEvent(this.app.workspace.on("layout-change", cb));
      },
    });
  }

  async loadSettings() {
    const legacySettings = (await this.loadData()) as Partial<NameForgeSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...legacySettings };
    this.settings = normalizeSettingsFolder(this.settings);

    const candidates = legacySettingsFileCandidates(this.settings);
    const seen = new Set<string>();
    for (const settingsFilePath of candidates) {
      if (seen.has(settingsFilePath)) {
        continue;
      }
      seen.add(settingsFilePath);

      const settingsFile = this.app.vault.getFileByPath(normalizePath(settingsFilePath));
      if (!(settingsFile instanceof TFile)) {
        continue;
      }

      let content: string;
      try {
        content = await this.app.vault.cachedRead(settingsFile);
      } catch {
        continue;
      }

      const parsed = parseSettingsMarkdownContent(content);
      this.settings = normalizeSettingsFolder({
        ...this.settings,
        ...parsed,
        namesFilePath: parsed.namesFilePath || this.settings.namesFilePath,
        folderPath: parsed.folderPath || this.settings.folderPath,
      });
      break;
    }

    this.settings = await ensureDefaultNamesFolder(this.app, this.settings);
  }

  async saveSettings() {
    this.settings = normalizeSettingsFolder(this.settings);
    const settingsFilePath = getSettingsFilePath(this.settings);
    if (!settingsFilePath) {
      await this.saveData(this.settings);
      return;
    }

    const normalizedPath = normalizePath(settingsFilePath);
    const content = createSettingsMarkdownContent(this.settings);
    const existingFile = this.app.vault.getFileByPath(normalizedPath);
    if (existingFile instanceof TFile) {
      await this.app.vault.modify(existingFile, content);
    } else {
      const folderPath = resolveNamesFolderPath(this.settings.folderPath, this.settings.namesFilePath);
      if (folderPath) {
        await ensureVaultFolder(this.app, folderPath);
      }
      await this.app.vault.create(normalizedPath, content);
    }
  }
}
