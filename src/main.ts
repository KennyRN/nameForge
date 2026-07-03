import { Plugin } from "obsidian";
import { NameWrightSettingTab } from "./settings";
import { NameWrightModal } from "./modal";

interface NameWrightSettings {
  // Add your settings here
}

const DEFAULT_SETTINGS: NameWrightSettings = {
  // Default values
}

export default class NameWrightPlugin extends Plugin {
  settings: NameWrightSettings;

  async onload() {
    await this.loadSettings();

    // Add ribbon icon
    this.addRibbonIcon("text", "NameWright", () => {
      new NameWrightModal(this.app, this.settings).open();
    });

    // Add commands
    this.addCommand({
      id: "open-namewright",
      name: "Open NameWright",
      callback: () => {
        new NameWrightModal(this.app, this.settings).open();
      },
    });

    // Add settings tab
    this.addSettingTab(new NameWrightSettingTab(this.app, this));
  }

  onunload() {
    // Cleanup if needed
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}