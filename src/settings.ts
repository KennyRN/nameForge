import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import NameForgePlugin from "./main";
import { findLegacyPackFolder, migratePacksToDefaultFolder, type LegacyPackFolderInfo } from "./migration";
import { DEFAULT_NAMES_FOLDER, ensureVaultFolder } from "./paths";

export class NameForgeSettingTab extends PluginSettingTab {
  plugin: NameForgePlugin;
  private legacyFolder: LegacyPackFolderInfo | null = null;

  constructor(app: App, plugin: NameForgePlugin) {
    super(app, plugin);
    this.plugin = plugin;
    void this.refreshLegacyFolder();
  }

  /**
   * Persist through the plugin's markdown config writer rather than raw saveData().
   */
  async setControlValue(key: string, value: unknown): Promise<void> {
    if (key === "folderPath" && typeof value === "string") {
      this.plugin.settings.folderPath = value;
      if (value.trim()) {
        await ensureVaultFolder(this.app, value.trim());
        void this.refreshLegacyFolder();
      }
    } else if (key === "faithfulness" && typeof value === "number") {
      this.plugin.settings.faithfulness = value;
    } else if (key === "strictness" && typeof value === "number") {
      this.plugin.settings.strictness = value;
    } else {
      return;
    }
    await this.plugin.saveSettings();
  }

  getSettingDefinitions() {
    return [
      {
        name: "Names folder",
        desc: "Home for name packs.",
        control: {
          type: "folder" as const,
          key: "folderPath",
          placeholder: DEFAULT_NAMES_FOLDER,
          includeRoot: true,
          defaultValue: DEFAULT_NAMES_FOLDER,
        },
      },
      {
        name: "Faithfulness",
        desc: "How closely generated names stick to your source list's letter patterns. Lower = more novel, higher = more true to source.",
        control: {
          type: "slider" as const,
          key: "faithfulness",
          min: 1,
          max: 3,
          step: 1,
          defaultValue: 2,
        },
      },
      {
        name: "Strictness",
        desc: "How fussy the generator is about accepting a candidate name. Lower = more variety (including odd results), higher = only clean, plausible names.",
        control: {
          type: "slider" as const,
          key: "strictness",
          min: 1,
          max: 5,
          step: 1,
          defaultValue: 3,
        },
      },
      {
        name: `Move packs to ${DEFAULT_NAMES_FOLDER}`,
        desc: this.legacyFolder
          ? `${this.legacyFolder.packCount} name pack(s) are still in “${this.legacyFolder.path}”. Move them into the Forge-family default folder.`
          : `Move name packs into the Forge-family default folder (${DEFAULT_NAMES_FOLDER}).`,
        visible: () => this.legacyFolder != null,
        searchable: false,
        render: (setting: Setting) => {
          const legacy = this.legacyFolder;
          if (!legacy) {
            return;
          }
          setting.addButton((button) =>
            button.setButtonText("Migrate").setCta().onClick(async () => {
              try {
                const result = await migratePacksToDefaultFolder(
                  this.app,
                  this.plugin.settings,
                  legacy.path
                );
                this.plugin.settings = result.settings;
                await this.plugin.saveSettings();
                this.legacyFolder = null;
                this.update();
              } catch (error) {
                const message = error instanceof Error ? error.message : "Migration failed";
                new Notice(`nameForge: ${message}`);
              }
            })
          );
        },
      },
    ];
  }

  private async refreshLegacyFolder(): Promise<void> {
    this.legacyFolder = await findLegacyPackFolder(this.app, this.plugin.settings);
    this.update();
  }
}
