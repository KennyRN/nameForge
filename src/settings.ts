import { App, Modal, normalizePath, PluginSettingTab, Setting, TFolder } from "obsidian";
import NameWrightPlugin from "./main";

const FOLDER_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMTYgMTYiPgoJPHBhdGggZD0iTTAgMGgxNnYxNkgweiIgZmlsbD0ibm9uZSIgLz4KCTxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTExIDVhMyAzIDAgMSAxLTYgMGEzIDMgMCAwIDEgNiAwTTggN2EyIDIgMCAxIDAgMC00YTIgMiAwIDAgMCAwIDRtLjI1NiA3YTQuNSA0LjUgMCAwIDEtLjIyOS0xLjAwNEgzYy4wMDEtLjI0Ni4xNTQtLjk4Ni44MzItMS42NjRDNC40ODQgMTAuNjggNS43MTEgMTAgOCAxMHEuMzkgMCAuNzQuMDI1Yy4yMjYtLjM0MS40OTYtLjY1LjgwNC0uOTE4UTguODQ0IDkuMDAyIDggOWMtNSAwLTYgMy02IDRzMSAxIDEgMXptMy42My00LjU0Yy4xOC0uNjEzIDEuMDQ4LS42MTMgMS4yMjkgMGwuMDQzLjE0OGEuNjQuNjQgMCAwIDAgLjkyMS4zODJsLjEzNi0uMDc0Yy41NjEtLjMwNiAxLjE3NS4zMDguODcuODY5bC0uMDc1LjEzNmEuNjQuNjQgMCAwIDAgLjM4Mi45MmwuMTQ5LjA0NWMuNjEyLjE4LjYxMiAxLjA0OCAwIDEuMjI5bC0uMTUuMDQzYS42NC42NCAwIDAgMC0uMzguOTIxbC4wNzQuMTM2Yy4zMDUuNTYxLS4zMDkgMS4xNzUtLjg3Ljg3bC0uMTM2LS4wNzVhLjY0LjY0IDAgMCAwLS45Mi4zODJsLS4wNDUuMTQ5Yy0uMTguNjEyLTEuMDQ4LjYxMi0xLjIyOSAwbC0uMDQzLS4xNWEuNjQuNjQgMCAwIDAtLjkyMS0uMzhsLS4xMzYuMDc0Yy0uNTYxLjMwNS0xLjE3NS0uMzA5LS44Ny0uODdsLjA3NS0uMTM2YS42NC42NCAwIDAgMCAuOTItLjM4MnpNMTQgMTIuNWExLjUgMS41IDAgMSAwLTMgMGExLjUgMS41IDAgMCAwIDMgMCIgLz4KPC9zdmc+Cg==";

class CreateFolderModal extends Modal {
  private parentFolder: TFolder;
  private onCreate: (folder: TFolder) => void;
  private inputEl: HTMLInputElement | null = null;

  constructor(app: App, parentFolder: TFolder, onCreate: (folder: TFolder) => void) {
    super(app);
    this.parentFolder = parentFolder;
    this.onCreate = onCreate;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("namewright-create-folder-modal");

    contentEl.createEl("h2", { text: "Create new folder" });
    contentEl.createEl("p", {
      text: `Create a folder inside the vault root${this.parentFolder.path === "/" ? "" : ` under ${this.parentFolder.path}`}.`,
    });

    const row = contentEl.createEl("div", { cls: "namewright-modal__pack-name-row" });
    row.createEl("label", { text: "Folder path" });
    this.inputEl = row.createEl("input", {
      cls: "namewright-modal__pack-name-input",
      attr: {
        type: "text",
        placeholder: "namepacks",
        value: "namepacks",
      },
    }) as HTMLInputElement;

    const controls = contentEl.createEl("div", { cls: "namewright-modal__controls" });
    const createButton = controls.createEl("button", { text: "Create folder" });
    createButton.addEventListener("click", () => {
      void this.createFolder();
    });

    const cancelButton = controls.createEl("button", { text: "Cancel" });
    cancelButton.addEventListener("click", () => this.close());
  }

  private async createFolder() {
    const rawValue = this.inputEl?.value?.trim() || "";
    if (!rawValue) {
      return;
    }

    const cleaned = rawValue.replace(/^\/+|\/+$/g, "");
    if (!cleaned) {
      return;
    }

    const basePath = this.parentFolder.path === "/" ? "" : this.parentFolder.path;
    const targetPath = normalizePath(basePath ? `${basePath}/${cleaned}` : cleaned);
    const existing = this.app.vault.getAbstractFileByPath(targetPath);

    if (existing instanceof TFolder) {
      this.onCreate(existing);
      this.close();
      return;
    }

    await this.app.vault.createFolder(targetPath);
    const created = this.app.vault.getAbstractFileByPath(targetPath);
    if (created instanceof TFolder) {
      this.onCreate(created);
      this.close();
    }
  }
}

class FolderPickerModal extends Modal {
  private onChooseFolder: (folder: TFolder) => void;
  private onCancel: () => void;
  private currentFolder: TFolder;

  constructor(app: App, onChooseFolder: (folder: TFolder) => void, onCancel: () => void = () => undefined) {
    super(app);
    this.onChooseFolder = onChooseFolder;
    this.onCancel = onCancel;
    this.currentFolder = this.app.vault.getRoot();
  }

  onOpen() {
    this.render();
  }

  onClose(): void {
    super.onClose();
    this.onCancel();
  }

  private render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("namewright-folder-picker-modal");

    contentEl.createEl("h2", { text: "Choose a folder" });
    contentEl.createEl("p", {
      text: "Select an existing folder or create a new one inside the current location.",
    });

    contentEl.createEl("div", {
      cls: "namewright-modal__folder-label",
      text: `Current folder: ${this.currentFolder.path === "/" ? "Vault root" : this.currentFolder.path}`,
    });

    const controls = contentEl.createEl("div", { cls: "namewright-modal__controls" });
    const chooseButton = controls.createEl("button", { text: "Use this folder" });
    chooseButton.addEventListener("click", () => {
      this.onChooseFolder(this.currentFolder);
      this.close();
    });

    const createButton = controls.createEl("button", { text: "Create folder here" });
    createButton.addEventListener("click", () => {
      new CreateFolderModal(this.app, this.currentFolder, (folder) => {
        this.onChooseFolder(folder);
        this.close();
      }).open();
    });

    if (this.currentFolder.parent instanceof TFolder) {
      const upButton = controls.createEl("button", { text: "Up a level" });
      upButton.addEventListener("click", () => {
        this.currentFolder = this.currentFolder.parent as TFolder;
        this.render();
      });
    }

    const folders = this.app.vault.getAllLoadedFiles()
      .filter((file): file is TFolder => file instanceof TFolder)
      .filter((folder) => folder.parent?.path === this.currentFolder.path)
      .sort((a, b) => a.path.localeCompare(b.path));

    const listContainer = contentEl.createEl("div", { cls: "namewright-modal__pack-list" });
    if (folders.length === 0) {
      listContainer.createEl("p", { text: "No subfolders found in this location." });
      return;
    }

    const list = listContainer.createEl("ul");
    folders.forEach((folder) => {
      const item = list.createEl("li");
      const button = item.createEl("button", {
        text: folder.path.split("/").pop() || folder.path,
      });
      button.addEventListener("click", () => {
        this.currentFolder = folder;
        this.render();
      });
    });
  }
}

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

    const namesFileSetting = new Setting(containerEl)
      .setName("Names file")
      .setDesc("Markdown file to save and load names from, relative to the vault root.")
      .addText((text) =>
        text
          .setPlaceholder("namewright/names.md")
          .setValue(this.plugin.settings.namesFilePath || "")
          .onChange(async (value) => {
            this.plugin.settings.namesFilePath = value.trim();
            await this.plugin.saveSettings();
          })
      );

    const folderButton = namesFileSetting.controlEl.createEl("button", {
      cls: "namewright-settings__icon-button",
      attr: { title: "Choose a names folder" },
    }) as HTMLButtonElement;
    folderButton.style.backgroundImage = `url("${FOLDER_ICON}")`;
    folderButton.addEventListener("click", () => {
      new FolderPickerModal(this.app, async (folder) => {
        this.plugin.settings.namesFilePath = folder.path;
        await this.plugin.saveSettings();
        this.display();
      }).open();
    });

    new Setting(containerEl)
      .setName("Faithfulness")
      .setDesc("How closely generated names stick to your source list's letter patterns. Lower = more novel, higher = more true to source.")
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

    new Setting(containerEl)
      .setName("Strictness")
      .setDesc("How fussy the generator is about accepting a candidate name. Lower = more variety (including odd results), higher = only clean, plausible names.")
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

  }
}