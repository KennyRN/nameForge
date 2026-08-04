import { App, Notice, PluginSettingTab, SettingGroup } from "obsidian";
import NameForgePlugin from "./main";
import { EnterFolderPathModal } from "./folderModal";
import { ICON_PACKS } from "./icons";
import { findLegacyPackFolder, migratePacksToDefaultFolder } from "./migration";
import { DEFAULT_NAMES_FOLDER, resolveNamesFolderPath } from "./paths";

export class NameForgeSettingTab extends PluginSettingTab {
  plugin: NameForgePlugin;

  constructor(app: App, plugin: NameForgePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    void this.renderAsync(containerEl);
  }

  private async renderAsync(containerEl: HTMLElement): Promise<void> {
    containerEl.empty();

    const folderPath = resolveNamesFolderPath(
      this.plugin.settings.folderPath,
      this.plugin.settings.namesFilePath
    );

    const namesFolderCard = new SettingGroup(containerEl);
    namesFolderCard.addSetting((setting) => {
      setting
        .setName("Names folder")
        .setDesc("Home for name packs. Use the icon to enter a different folder path.");

      setting.controlEl.createEl("div", {
        cls: "nameforge-settings__folder-path",
        text: folderPath || DEFAULT_NAMES_FOLDER,
      });

      setting.addExtraButton((button) => {
        button
          .setIcon(ICON_PACKS)
          .setTooltip("Change names folder")
          .onClick(() => {
            new EnterFolderPathModal(this.app, folderPath || DEFAULT_NAMES_FOLDER, (folder) => {
              void (async () => {
                this.plugin.settings.folderPath = folder.path;
                await this.plugin.saveSettings();
                this.display();
              })();
            }).open();
          });
        button.extraSettingsEl.addClass("nameforge-settings__icon-action");
      });
    });

    const tuningCard = new SettingGroup(containerEl);
    tuningCard.addSetting((setting) => {
      setting
        .setName("Faithfulness")
        .setDesc(
          "How closely generated names stick to your source list's letter patterns. Lower = more novel, higher = more true to source."
        )
        .addSlider((slider) =>
          slider
            .setLimits(1, 3, 1)
            .setValue(this.plugin.settings.faithfulness ?? 2)
            .setDynamicTooltip()
            .onChange(async (value) => {
              this.plugin.settings.faithfulness = value;
              await this.plugin.saveSettings();
            })
        );
    });
    tuningCard.addSetting((setting) => {
      setting
        .setName("Strictness")
        .setDesc(
          "How fussy the generator is about accepting a candidate name. Lower = more variety (including odd results), higher = only clean, plausible names."
        )
        .addSlider((slider) =>
          slider
            .setLimits(1, 5, 1)
            .setValue(this.plugin.settings.strictness ?? 3)
            .setDynamicTooltip()
            .onChange(async (value) => {
              this.plugin.settings.strictness = value;
              await this.plugin.saveSettings();
            })
        );
    });

    const legacyFolder = await findLegacyPackFolder(this.app, this.plugin.settings);
    if (!legacyFolder) {
      return;
    }

    const migrationCard = new SettingGroup(containerEl);
    migrationCard.addSetting((setting) => {
      setting
        .setName(`Move packs to ${DEFAULT_NAMES_FOLDER}`)
        .setDesc(
          `${legacyFolder.packCount} name pack(s) are still in “${legacyFolder.path}”. Move them into the Forge-family default folder.`
        )
        .addButton((button) =>
          button.setButtonText("Migrate").setCta().onClick(async () => {
            try {
              const result = await migratePacksToDefaultFolder(
                this.app,
                this.plugin.settings,
                legacyFolder.path
              );
              this.plugin.settings = result.settings;
              await this.plugin.saveSettings();
              this.display();
            } catch (error) {
              const message = error instanceof Error ? error.message : "Migration failed";
              new Notice(`nameForge: ${message}`);
            }
          })
        );
    });
  }
}
