import { normalizePath, Plugin } from "obsidian";
import { NameWrightSettingTab } from "./settings";
import { NameWrightModal, NameWrightSettings } from "./modal";

const DEFAULT_SETTINGS: NameWrightSettings = {
  namesFilePath: "",
  packName: "",
  folderPath: "",
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
    }
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

  return `---\ntype: configurationFile\n${lines.join("\n")}\n---\n`;
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

    // Add ribbon icon
    this.addRibbonIcon("dice", "NameWright", () => {
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