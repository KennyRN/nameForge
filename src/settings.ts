import { App, Modal, Notice, PluginSettingTab, Setting } from "obsidian";
import NameForgePlugin from "./main";
import { findLegacyPackFolder, migratePacksToConfiguredFolder, type LegacyPackFolderInfo } from "./migration";
import { cleanFolderInput, commitFolderChoice, DEFAULT_NAMES_FOLDER, resolveNamesFolderPath } from "./paths";

type FolderKey = "folderPath" | "settlementsFolder";

/** Small yes/no prompt; resolves true only on "Create". */
class ConfirmCreateFolderModal extends Modal {
  private answered = false;

  constructor(app: App, private readonly path: string, private readonly onAnswer: (create: boolean) => void) {
    super(app);
  }

  onOpen(): void {
    this.setTitle(`Create folder ‘${this.path}’?`);
    this.contentEl.createEl("p", { text: "It does not exist yet." });
    new Setting(this.contentEl)
      .addButton((button) => button.setButtonText("Create").setCta().onClick(() => this.answer(true)))
      .addButton((button) => button.setButtonText("Cancel").onClick(() => this.answer(false)));
  }

  onClose(): void {
    this.answer(false);
    this.contentEl.empty();
  }

  private answer(create: boolean): void {
    if (this.answered) {
      return;
    }
    this.answered = true;
    this.onAnswer(create);
    this.close();
  }
}

export class NameForgeSettingTab extends PluginSettingTab {
  plugin: NameForgePlugin;
  private legacyFolder: LegacyPackFolderInfo | null = null;

  constructor(app: App, plugin: NameForgePlugin) {
    super(app, plugin);
    this.plugin = plugin;
    void this.refreshLegacyFolder();
  }

  /** Folder text typed but not yet committed with "Use folder". Never touches the vault. */
  private pendingFolders: Partial<Record<FolderKey, string>> = {};

  getControlValue(key: string): unknown {
    if (key === "folderPath" || key === "settlementsFolder") {
      return this.pendingFolders[key] ?? this.plugin.settings[key] ?? "";
    }
    return super.getControlValue(key);
  }

  /**
   * Persist through the plugin's markdown config writer rather than raw saveData().
   * Folder boxes only remember what was typed; "Use folder" commits it.
   */
  async setControlValue(key: string, value: unknown): Promise<void> {
    if ((key === "folderPath" || key === "settlementsFolder") && typeof value === "string") {
      this.pendingFolders[key] = value;
      return;
    }
    if (key === "faithfulness" && typeof value === "number") {
      this.plugin.settings.faithfulness = value;
    } else if (key === "strictness" && typeof value === "number") {
      this.plugin.settings.strictness = value;
    } else {
      return;
    }
    await this.plugin.saveSettings();
  }

  private confirmCreate(path: string): Promise<boolean> {
    return new Promise((resolve) => new ConfirmCreateFolderModal(this.app, path, resolve).open());
  }

  /** Commit the typed folder: use it if it exists, create it only after confirmation. */
  private async useFolder(key: FolderKey): Promise<void> {
    const typed = this.pendingFolders[key];
    if (typed === undefined) {
      new Notice("nameForge: type or pick a folder first.");
      return;
    }
    try {
      let chosen: string | null;
      if (key === "settlementsFolder" && !typed.trim()) {
        // Empty: back to the names folder plus /Settlements, created when a note is first written.
        chosen = "";
      } else {
        chosen = await commitFolderChoice(this.app, typed, (path) => this.confirmCreate(path));
      }
      if (chosen === null) {
        return;
      }
      this.plugin.settings[key] = chosen;
      delete this.pendingFolders[key];
      await this.plugin.saveSettings();
      if (key === "folderPath") {
        await this.refreshLegacyFolder();
      }
      this.update();
      new Notice(`nameForge: using ${chosen || "the default settlements folder"}.`);
    } catch (error) {
      new Notice(`nameForge: ${error instanceof Error ? error.message : "could not use that folder"}`);
    }
  }

  private useFolderRow(key: FolderKey) {
    return {
      name: "Use folder",
      desc: "Typing above changes nothing until you press this.",
      searchable: false,
      render: (setting: Setting) => {
        setting.addButton((button) => button.setButtonText("Use folder").onClick(() => void this.useFolder(key)));
      },
    };
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
      this.useFolderRow("folderPath"),
      {
        name: "Settlements folder",
        desc: "Where the settlement kit's Create note writes settlement notes. Empty: the names folder plus /Settlements.",
        control: {
          type: "folder" as const,
          key: "settlementsFolder",
          placeholder: `${DEFAULT_NAMES_FOLDER}/Settlements`,
          includeRoot: true,
          defaultValue: "",
        },
      },
      this.useFolderRow("settlementsFolder"),
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
        name: `Move packs to ${this.configuredFolder()}`,
        desc: this.legacyFolder
          ? `${this.legacyFolder.packCount} name pack(s) are still in “${this.legacyFolder.path}”. Move them into your names folder.`
          : `Move name packs into your names folder (${this.configuredFolder()}).`,
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
                const result = await migratePacksToConfiguredFolder(
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

  private configuredFolder(): string {
    return cleanFolderInput(resolveNamesFolderPath(this.plugin.settings.folderPath, this.plugin.settings.namesFilePath));
  }

  private async refreshLegacyFolder(): Promise<void> {
    this.legacyFolder = await findLegacyPackFolder(this.app, this.plugin.settings);
    this.update();
  }
}
