import { App, PluginSettingTab, Setting } from "obsidian";
import NameWrightPlugin from "./main";

export class NameWrightSettingTab extends PluginSettingTab {
  plugin: NameWrightPlugin;

  constructor(app: App, plugin: NameWrightPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "NameWright Settings" });

    // Add your settings here
    new Setting(containerEl)
      .setName("Setting Name")
      .setDesc("Setting description")
      .addText((text) =>
        text
          .setPlaceholder("Enter value")
          .setValue(this.plugin.settings.settingName || "")
          .onChange(async (value) => {
            this.plugin.settings.settingName = value;
            await this.plugin.saveSettings();
          })
      );
  }
}