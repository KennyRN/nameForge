import { addIcon, normalizePath, Plugin } from "obsidian";
import { NameWrightSettingTab } from "./settings";
import { GenerationHistoryEntry, MAX_HISTORY_ENTRIES, NameWrightModal, NameWrightSettings } from "./modal";

const NAMEWRIGHT_ICON_ID = "namewright-meeple";
// Obsidian wraps this in its own viewBox="0 0 100 100", so scale the 24-unit icon up to fill it.
const NAMEWRIGHT_ICON_SVG = '<g transform="scale(4.16667)"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20H4a1 1 0 0 1-1-1c0-2 3.378-4.907 4-6c-1 0-4-.5-4-2c0-2 4-3.5 6-4c0-1.5.5-4 3-4s3 2.5 3 4c2 .5 6 2 6 4c0 1.5-3 2-4 2c.622 1.093 4 4 4 6a1 1 0 0 1-1 1h-5c-1 0-2-4-3-4s-2 4-3 4" /></g>';

const DEFAULT_SETTINGS: NameWrightSettings = {
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

function getSettingsFilePath(settings: NameWrightSettings): string {
  const folderPath = getSettingsFolderPath(settings.namesFilePath, settings.folderPath);
  return folderPath ? normalizePath(`${folderPath}/NameWright-Configuration.md`) : "";
}

/**
 * The history line format is `- {timestamp} | {seed} | {packName}` — the
 * timestamp and seed are fixed-format tokens matched before the free-text
 * packName, so a pack name containing "|" still parses correctly (it's
 * always "everything after the second pipe").
 */
const HISTORY_LINE_PATTERN = /^-\s*(\d{8}-\d{6})\s*\|\s*(-?\d+)\s*\|\s*(.*)$/;

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
    const [, timestamp, seedText, packName] = match;
    const seed = Number(seedText);
    if (!Number.isFinite(seed)) {
      continue;
    }
    entries.push({ timestamp, seed, packName: packName.trim() });
  }

  return entries;
}

function createGenerationHistorySection(history?: GenerationHistoryEntry[]): string {
  if (!history || history.length === 0) {
    return "";
  }

  const lines = history
    .slice(0, MAX_HISTORY_ENTRIES)
    .map((entry) => `- ${entry.timestamp} | ${entry.seed} | ${entry.packName}`);
  return `\n## Generation History\n\n${lines.join("\n")}\n`;
}

function parseSettingsMarkdownContent(content: string): Partial<NameWrightSettings> {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  if (!frontmatterMatch) {
    return {};
  }

  const parsed: Partial<NameWrightSettings> = {};
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

function createSettingsMarkdownContent(settings: NameWrightSettings): string {
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

export default class NameWrightPlugin extends Plugin {
  settings: NameWrightSettings = {};

  private async discoverSettingsFromConfigurationFile(): Promise<Partial<NameWrightSettings> | null> {
    const markdownFiles = this.app.vault.getMarkdownFiles();
    const configFiles = markdownFiles.filter((file) => file.basename === "NameWright-Configuration");

    for (const file of configFiles) {
      const content = await this.app.vault.adapter.read(file.path);
      const parsed = parseSettingsMarkdownContent(content);
      if (parsed.folderPath || parsed.namesFilePath || parsed.packName) {
        return parsed;
      }
    }

    return null;
  }

  async onload() {
    await this.loadSettings();

    addIcon(NAMEWRIGHT_ICON_ID, NAMEWRIGHT_ICON_SVG);

    // Add ribbon icon
    this.addRibbonIcon(NAMEWRIGHT_ICON_ID, "NameWright", () => {
      new NameWrightModal(this.app, this, this.settings).open();
    });

    // Add commands
    this.addCommand({
      id: "open-namewright",
      name: "Open NameWright",
      callback: () => {
        new NameWrightModal(this.app, this, this.settings).open();
      },
    });

    // Add settings tab
    this.addSettingTab(new NameWrightSettingTab(this.app, this));
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

    const settingsFileExists = await this.app.vault.adapter.exists(settingsFilePath);
    if (!settingsFileExists) {
      return;
    }

    const content = await this.app.vault.adapter.read(settingsFilePath);
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
    await this.app.vault.adapter.write(settingsFilePath, createSettingsMarkdownContent(this.settings));
  }
}