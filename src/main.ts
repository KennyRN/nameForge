import { normalizePath, Plugin, TFile } from "obsidian";
import { NameForgeSettingTab } from "./settings";
import { GenerationHistoryEntry, MAX_HISTORY_ENTRIES, NameForgeModal, NameForgeSettings } from "./modal";
import { ICON_MEEPLE, registerNameForgeIcons } from "./icons";

const DEFAULT_SETTINGS: NameForgeSettings = {
  namesFilePath: "",
  packName: "",
  folderPath: "",
  faithfulness: 2,
  strictness: 3,
};

function getSettingsFolderPath(namesFilePath?: string, folderPath?: string): string {
  const configured = (folderPath || namesFilePath || "").trim();
  if (!configured) {
    return "";
  }

  if (configured.endsWith(".md")) {
    const lastSlash = configured.lastIndexOf("/");
    return lastSlash > 0 ? configured.substring(0, lastSlash) : "";
  }

  return configured.replace(/\/+$/, "");
}

function getSettingsFilePath(settings: NameForgeSettings): string {
  const folderPath = getSettingsFolderPath(settings.namesFilePath, settings.folderPath);
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
      const value = Number(trimmedValue);
      if (!Number.isNaN(value)) {
        parsed.faithfulness = value;
      }
    } else if (key === "strictness") {
      const value = Number(trimmedValue);
      if (!Number.isNaN(value)) {
        parsed.strictness = value;
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
  const folderPath = getSettingsFolderPath(settings.namesFilePath, settings.folderPath);
  const lines = [`folder: ${folderPath || ""}`, `namesFilePath: ${settings.namesFilePath || ""}`];

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

  private async discoverSettingsFromConfigurationFile(): Promise<Partial<NameForgeSettings> | null> {
    const markdownFiles = this.app.vault.getMarkdownFiles();
    const configFiles = markdownFiles.filter((file) => file.basename === "nameForgeConfiguration");

    for (const file of configFiles) {
      try {
        const content = await this.app.vault.cachedRead(file);
        const parsed = parseSettingsMarkdownContent(content);
        if (parsed.folderPath || parsed.namesFilePath || parsed.packName) {
          return parsed;
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  async onload() {
    await this.loadSettings();

    registerNameForgeIcons();

    // Add ribbon icon
    this.addRibbonIcon(ICON_MEEPLE, "nameForge", () => {
      new NameForgeModal(this.app, this, this.settings).open();
    });

    // Add commands
    this.addCommand({
      id: "open-nameforge",
      name: "Open name generator",
      callback: () => {
        new NameForgeModal(this.app, this, this.settings).open();
      },
    });

    // Add settings tab
    this.addSettingTab(new NameForgeSettingTab(this.app, this));
  }

  onunload() {
    // Cleanup if needed
  }

  async loadSettings() {
    const legacySettings = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...legacySettings };

    const hasConfiguredLocation = Boolean(this.settings.namesFilePath || this.settings.folderPath);
    if (!hasConfiguredLocation) {
      const discoveredSettings = await this.discoverSettingsFromConfigurationFile();
      if (discoveredSettings) {
        this.settings = {
          ...this.settings,
          ...discoveredSettings,
          namesFilePath: discoveredSettings.namesFilePath || this.settings.namesFilePath,
          folderPath: discoveredSettings.folderPath || this.settings.folderPath,
        };
      }
    }

    const settingsFilePath = getSettingsFilePath(this.settings);
    if (!settingsFilePath) {
      return;
    }

    const settingsFile = this.app.vault.getFileByPath(normalizePath(settingsFilePath));
    if (!(settingsFile instanceof TFile)) {
      return;
    }

    let content: string;
    try {
      content = await this.app.vault.cachedRead(settingsFile);
    } catch {
      return;
    }

    const parsed = parseSettingsMarkdownContent(content);
    this.settings = {
      ...this.settings,
      ...parsed,
      namesFilePath: parsed.namesFilePath || this.settings.namesFilePath,
      folderPath: parsed.folderPath || this.settings.folderPath,
    };

    if (!this.settings.namesFilePath) {
      this.settings.namesFilePath = DEFAULT_SETTINGS.namesFilePath;
    }

    if (!this.settings.folderPath) {
      this.settings.folderPath = getSettingsFolderPath(this.settings.namesFilePath);
    }
  }

  async saveSettings() {
    const settingsFilePath = getSettingsFilePath(this.settings);
    if (!settingsFilePath) {
      await this.saveData(this.settings);
      return;
    }

    this.settings.folderPath = getSettingsFolderPath(this.settings.namesFilePath, this.settings.folderPath);
    const normalizedPath = normalizePath(settingsFilePath);
    const content = createSettingsMarkdownContent(this.settings);
    const existingFile = this.app.vault.getFileByPath(normalizedPath);
    if (existingFile instanceof TFile) {
      await this.app.vault.modify(existingFile, content);
    } else {
      await this.app.vault.create(normalizedPath, content);
    }
  }
}