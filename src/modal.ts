import { App, Modal, normalizePath, TFolder } from "obsidian";
import { ListGenerator, MarkovGenerator } from "./markov";
import { createNamesFileContent, isValidNamePackContent, normalizeNamesInput, parseNamesFileContent } from "./nameParser";

const FOLDER_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 3.5h4l1 1h6v6h-11z"/><path d="M1.5 5.5h11"/></svg>';
const CREATE_PACKS_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5v11"/><path d="M2.5 8h11"/></svg>';
const PACKS_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2.5" width="12" height="11" rx="1.25"/><path d="M4.5 6h7"/><path d="M4.5 8.5h7"/><path d="M4.5 11h4"/></svg>';
const GENERATE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path d="M0 0h16v16H0z" fill="none" /><path fill="currentColor" fill-rule="evenodd" d="M4.5 3h7A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3m-3 1.5a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3zm9 2.15a1.15 1.15 0 1 0 0-2.3a1.15 1.15 0 0 0 0 2.3M9.15 8a1.15 1.15 0 1 1-2.3 0a1.15 1.15 0 0 1 2.3 0M5.5 11.65a1.15 1.15 0 1 0 0-2.3a1.15 1.15 0 0 0 0 2.3m6.15-1.15a1.15 1.15 0 1 1-2.3 0a1.15 1.15 0 0 1 2.3 0M5.5 6.65a1.15 1.15 0 1 0 0-2.3a1.15 1.15 0 0 0 0 2.3" clip-rule="evenodd" /></svg>';
const DICE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15"><path d="M0 0h15v15H0z" fill="none" /><path fill="currentColor" d="M4.14 1.14c-.68.05-1.33.43-1.7 1.07L.29 5.93c-.59 1.03-.26 2.32.77 2.91l3.72 2.14c.15.09.31.19.47.24V7.47c0-1.76 1.45-3.22 3.21-3.22h1.31c-.18-.26-.41-.5-.7-.67L5.35 1.44c-.39-.22-.8-.33-1.21-.3m.33.76c.6 0 1.12.41 1.28.99c.19.72-.23 1.45-.95 1.64c-.71.19-1.44-.23-1.64-.94c-.19-.72.24-1.45.95-1.64c.12-.04.24-.05.36-.05M2.2 5.84c.6 0 1.12.41 1.28.99c.19.71-.24 1.45-.95 1.64S1.08 8.23.89 7.52s.23-1.45.95-1.64c.11-.03.24-.05.36-.04m6.26-.52c-1.18 0-2.14.96-2.14 2.15v4.28c0 1.19.96 2.15 2.14 2.15h4.29c1.19 0 2.14-.96 2.14-2.15V7.47c0-1.19-.95-2.15-2.14-2.15zm4.29.81c.35 0 .69.14.95.39a1.34 1.34 0 0 1 0 1.89c-.26.26-.6.4-.95.4a1.34 1.34 0 0 1 0-2.68m-4.29 4.28c.36 0 .7.14.95.4c.25.25.39.59.39.94a1.34 1.34 0 0 1-2.68 0c0-.35.14-.69.4-.94c.25-.26.59-.4.94-.4" /></svg>';

type NamePackType = "breakdownPack" | "listPack" | "compoundBreakdownPack" | "compoundListPack";

function generateNamesFromSource(namesText: string, packType: NamePackType, count: number = 6): string[] {
  const names = normalizeNamesInput(namesText);
  if (names.length === 0) {
    return [];
  }

  if (packType === "listPack" || packType === "compoundListPack") {
    const generator = new ListGenerator();
    generator.train(names);
    return generator.generateMultiple(count);
  }

  const generator = new MarkovGenerator(2);
  generator.train(names);
  return generator.generateMultiple(count, 12);
}

export interface NameWrightSettings {
  namesFilePath?: string;
  packName?: string;
  folderPath?: string;
}

interface NameWrightPluginLike {
  app: App;
  settings: NameWrightSettings;
  saveSettings(): Promise<void>;
}

export class NameWrightModal extends Modal {
  public plugin: NameWrightPluginLike;
  private resultsEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private packListEl: HTMLElement | null = null;
  private folderLabelEl: HTMLElement | null = null;
  private currentNamesText = "";
  public currentPackType: NamePackType = "breakdownPack";

  constructor(app: App, plugin: NameWrightPluginLike, settings: NameWrightSettings = {}) {
    super(app);
    this.plugin = plugin;
    this.plugin.settings = { ...this.plugin.settings, ...settings };
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("namewright-modal");

    contentEl.createEl("h2", { text: "NameWright" });

    const optionsList = contentEl.createEl("div", { cls: "namewright-modal__options-list" });

    const folderRow = optionsList.createEl("div", { cls: "namewright-modal__option-row" });
    const folderButton = this.createIconButton(folderRow, FOLDER_ICON, "Set name pack folder");
    folderButton.addEventListener("click", () => {
      void this.promptForFolder();
    });
    this.folderLabelEl = folderRow.createEl("span", {
      cls: "namewright-modal__folder-label",
      text: this.getFolderDisplayText(),
    });

    const createPacksRow = optionsList.createEl("div", { cls: "namewright-modal__option-row" });
    const createPacksButton = this.createIconButton(createPacksRow, CREATE_PACKS_ICON, "Create name packs");
    createPacksButton.addEventListener("click", () => {
      new NameWrightEditorModal(this.app, this, this.currentNamesText, this.plugin.settings.packName || "NameWright").open();
    });
    createPacksRow.createEl("span", { cls: "namewright-modal__option-label", text: "Create Packs" });

    const generateRow = optionsList.createEl("div", { cls: "namewright-modal__option-row" });
    const generateButton = this.createIconButton(generateRow, GENERATE_ICON, "Generate names");
    generateButton.addEventListener("click", () => {
      new NameWrightGenerateModal(this.app, this).open();
    });
    generateRow.createEl("span", { cls: "namewright-modal__option-label", text: "Generate" });

    const quickGenerateRow = optionsList.createEl("div", { cls: "namewright-modal__option-row" });
    const quickGenerateButton = this.createIconButton(quickGenerateRow, DICE_ICON, "Quick generation");
    quickGenerateButton.addEventListener("click", () => {
      void this.generateNames();
    });
    quickGenerateRow.createEl("span", { cls: "namewright-modal__option-label", text: "Quick Generation" });

    this.packListEl = contentEl.createEl("div", { cls: "namewright-modal__pack-list" });
    this.packListEl.hide();

    this.resultsEl = contentEl.createEl("div", { cls: "namewright-modal__results" });

    void this.loadFromConfiguredFile();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  private createIconButton(container: HTMLElement, icon: string, title: string): HTMLButtonElement {
    const button = container.createEl("button", {
      cls: "namewright-modal__icon-button",
      attr: { title },
    }) as HTMLButtonElement;
    button.innerHTML = icon;
    return button;
  }

  private getFolderDisplayText(): string {
    const folder = this.getFolderPath();
    if (folder) {
      return `NameWright Folder: ${folder}`;
    }

    return "NameWright Folder: choose a folder to store your packs.";
  }

  public getFolderPath(): string {
    const configured = this.plugin.settings.namesFilePath?.trim() || "";
    if (!configured) {
      return "";
    }

    if (configured.endsWith(".md")) {
      return configured.substring(0, configured.lastIndexOf("/"));
    }

    return configured;
  }

  private getResolvedFilePath(): string | null {
    const configured = this.plugin.settings.namesFilePath?.trim();
    if (!configured) {
      return null;
    }

    if (configured.endsWith(".md")) {
      return configured;
    }

    return `${configured.replace(/\/$/, "")}/names.md`;
  }

  public updateFolderLabel() {
    if (this.folderLabelEl) {
      this.folderLabelEl.textContent = this.getFolderDisplayText();
    }
  }

  private async promptForFolder() {
    const folder = await this.promptForFolderSelection();
    if (!folder) {
      return;
    }

    this.plugin.settings.namesFilePath = folder.path;
    this.plugin.settings.folderPath = folder.path;
    await this.plugin.saveSettings();
    this.updateFolderLabel();
    this.setStatus(`Folder set to ${folder.path}.`);
  }

  public async promptForFolderSelection(): Promise<TFolder | null> {
    return new Promise((resolve) => {
      const picker = new FolderPickerModal(
        this.app,
        (folder) => {
          resolve(folder);
          picker.close();
        },
        () => resolve(null)
      );
      picker.open();
    });
  }

  private async loadFromConfiguredFile() {
    const filePath = this.getResolvedFilePath();
    if (!filePath) {
      this.currentNamesText = "";
      this.updateFolderLabel();
      this.setStatus("No names file configured yet. Set a folder to store packs.");
      return;
    }

    const adapter = this.app.vault.adapter;
    if (!(await adapter.exists(filePath))) {
      this.currentNamesText = "";
      this.updateFolderLabel();
      this.setStatus(`No pack file found at ${filePath}.`);
      return;
    }

    const content = await adapter.read(filePath);
    const parsed = parseNamesFileContent(content);
    if (parsed.packName) {
      this.plugin.settings.packName = parsed.packName;
    }

    this.currentPackType = parsed.type;
    this.currentNamesText = parsed.names.join("\n");
    this.updateFolderLabel();
    this.setStatus(`Loaded ${parsed.names.length} name(s) from ${filePath}.`);
  }

  public async saveToConfiguredFile(namesText: string) {
    const filePath = this.getResolvedFilePath();
    if (!filePath) {
      this.setStatus("No folder set for name packs. Set one first.");
      return;
    }

    const names = normalizeNamesInput(namesText);
    if (names.length === 0) {
      this.setStatus("No names to save. Enter at least one name.");
      return;
    }

    const folderPath = filePath.includes("/") ? filePath.substring(0, filePath.lastIndexOf("/")) : "";
    if (folderPath) {
      const folderExists = await this.app.vault.adapter.exists(folderPath);
      if (!folderExists) {
        this.setStatus(`Folder not found at ${folderPath}. Select or create it first.`);
        return;
      }
    }

    const content = createNamesFileContent(this.plugin.settings.packName || "NameWright", names, this.currentPackType);
    await this.app.vault.adapter.write(filePath, content);
    this.currentNamesText = names.join("\n");
    this.setStatus(`Saved ${names.length} name(s) to ${filePath}.`);
  }

  private async browsePacks() {
    const folderPath = this.getFolderPath();
    if (!folderPath) {
      this.setStatus("Set a folder to store name packs before browsing them.");
      return;
    }

    const adapter = this.app.vault.adapter;
    if (!(await adapter.exists(folderPath))) {
      this.setStatus(`Folder not found at ${folderPath}.`);
      return;
    }

    const listing = await adapter.list(folderPath);
    const packs: string[] = [];

    for (const entry of listing.files.filter((item) => item.endsWith(".md"))) {
      const content = await adapter.read(entry);
      if (isValidNamePackContent(content)) {
        packs.push(entry);
      }
    }

    packs.sort((a, b) => a.localeCompare(b));
    this.renderPackList(packs);
    this.setStatus(`Found ${packs.length} pack(s) in ${folderPath}.`);
  }

  private renderPackList(packs: string[]) {
    if (!this.packListEl) {
      return;
    }

    this.packListEl.empty();
    if (packs.length === 0) {
      this.packListEl.createEl("p", { text: "No saved packs found in that folder." });
      this.packListEl.show();
      return;
    }

    const list = this.packListEl.createEl("ul");
    packs.forEach((packPath) => {
      const item = list.createEl("li");
      const button = item.createEl("button", {
        text: packPath.split("/").pop()?.replace(/\.md$/i, "") || packPath,
      });
      button.addEventListener("click", () => {
        void this.loadPack(packPath);
      });
    });

    this.packListEl.show();
  }

  private async loadPack(packPath: string) {
    const content = await this.app.vault.adapter.read(packPath);
    const parsed = parseNamesFileContent(content);
    if (parsed.packName) {
      this.plugin.settings.packName = parsed.packName;
    }

    this.currentPackType = parsed.type;
    this.currentNamesText = parsed.names.join("\n");
    this.plugin.settings.namesFilePath = packPath;
    await this.plugin.saveSettings();
    this.updateFolderLabel();
    this.setStatus(`Loaded pack ${packPath}.`);
    if (this.packListEl) {
      this.packListEl.hide();
    }
  }

  private async generateNames() {
    const generated = generateNamesFromSource(this.currentNamesText, this.currentPackType, 6);

    if (generated.length === 0) {
      this.renderResults(["Enter at least one name to generate new options."]);
      this.setStatus("No names available to generate from.");
      return;
    }

    this.renderResults(generated);
    this.setStatus(`Generated ${generated.length} name(s) from ${normalizeNamesInput(this.currentNamesText).length} source name(s).`);
  }

  private renderResults(names: string[]) {
    if (!this.resultsEl) {
      return;
    }

    this.resultsEl.empty();
    this.resultsEl.createEl("h3", { text: "Generated names" });

    if (names.length === 0) {
      this.resultsEl.createEl("p", { text: "No names were generated." });
      return;
    }

    const list = this.resultsEl.createEl("ul");
    names.forEach((name) => list.createEl("li", { text: name }));
  }

  public setStatus(message: string) {
    if (this.statusEl) {
      this.statusEl.textContent = message;
    }
  }
}

class NameWrightGenerateModal extends Modal {
  private parent: NameWrightModal;
  private packListEl: HTMLElement | null = null;
  private resultsEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private generateButton: HTMLButtonElement | null = null;
  private countSelect: HTMLSelectElement | null = null;
  private selectedPackPath: string | null = null;
  private currentNamesText = "";
  private currentPackType: NamePackType = "breakdownPack";
  private generationCount = 25;

  constructor(app: App, parent: NameWrightModal) {
    super(app);
    this.parent = parent;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("namewright-generate-modal");

    contentEl.createEl("h2", { text: "Generate names" });
    contentEl.createEl("p", {
      text: "Select a saved name pack, then generate a fresh list of names.",
    });

    this.statusEl = contentEl.createEl("p", { cls: "namewright-modal__status", text: "Loading packs..." });
    this.packListEl = contentEl.createEl("div", { cls: "namewright-modal__pack-list" });
    this.resultsEl = contentEl.createEl("div", { cls: "namewright-modal__results" });

    const controls = contentEl.createEl("div", { cls: "namewright-modal__controls" });
    const packButton = contentEl.createEl("button", {
      cls: "namewright-modal__icon-button",
      attr: { title: "Choose name pack" },
    }) as HTMLButtonElement;
    packButton.innerHTML = PACKS_ICON;
    packButton.addEventListener("click", () => {
      void this.loadPacks();
    });

    const countRow = contentEl.createEl("div", { cls: "namewright-modal__count-row" });
    countRow.createEl("label", { text: "Create" });
    this.countSelect = countRow.createEl("select", { cls: "namewright-modal__count-select" }) as HTMLSelectElement;
    [10, 15, 25, 50, 100].forEach((value) => {
      this.countSelect?.createEl("option", { text: String(value), attr: { value: String(value) } });
    });
    this.countSelect.value = String(this.generationCount);
    countRow.createEl("span", { text: "names" });
    this.countSelect.addEventListener("change", () => {
      this.generationCount = Number(this.countSelect?.value || 10);
    });

    this.generateButton = controls.createEl("button", { text: "Generate" }) as HTMLButtonElement;
    this.generateButton.setAttribute("disabled", "true");
    this.generateButton.addEventListener("click", () => {
      void this.generateFromSelection();
    });

    const cancelButton = controls.createEl("button", { text: "Cancel" });
    cancelButton.addEventListener("click", () => this.close());

    void this.loadPacks();
  }

  private async loadPacks() {
    if (!this.packListEl || !this.statusEl) {
      return;
    }

    const folderPath = this.parent.getFolderPath();
    if (!folderPath) {
      this.statusEl.textContent = "Select a folder for your name packs first.";
      this.packListEl.empty();
      this.packListEl.createEl("p", { text: "No folder selected yet." });
      return;
    }

    const adapter = this.app.vault.adapter;
    if (!(await adapter.exists(folderPath))) {
      this.statusEl.textContent = `Folder not found at ${folderPath}.`;
      this.packListEl.empty();
      this.packListEl.createEl("p", { text: "The selected folder no longer exists." });
      return;
    }

    const listing = await adapter.list(folderPath);
    const packs: string[] = [];

    for (const entry of listing.files.filter((item) => item.endsWith(".md"))) {
      const content = await adapter.read(entry);
      if (isValidNamePackContent(content)) {
        packs.push(entry);
      }
    }

    packs.sort((a, b) => a.localeCompare(b));
    this.renderPackList(packs);
    this.statusEl.textContent = packs.length > 0 ? `Found ${packs.length} pack(s).` : "No saved packs were found in that folder.";
  }

  private renderPackList(packs: string[]) {
    if (!this.packListEl) {
      return;
    }

    this.packListEl.empty();
    if (packs.length === 0) {
      this.packListEl.createEl("p", { text: "No saved packs found in that folder." });
      return;
    }

    const list = this.packListEl.createEl("ul");
    packs.forEach((packPath) => {
      const item = list.createEl("li");
      const button = item.createEl("button", {
        text: packPath.split("/").pop()?.replace(/\.md$/i, "") || packPath,
      });
      button.addEventListener("click", () => {
        void this.selectPack(packPath);
      });
    });
  }

  private async selectPack(packPath: string) {
    const content = await this.app.vault.adapter.read(packPath);
    const parsed = parseNamesFileContent(content);
    this.selectedPackPath = packPath;
    this.currentNamesText = parsed.names.join("\n");
    this.currentPackType = parsed.type;

    if (this.resultsEl) {
      this.resultsEl.empty();
      this.resultsEl.createEl("p", { text: `Selected pack: ${packPath.split("/").pop()?.replace(/\.md$/i, "") || packPath}` });
    }

    if (this.statusEl) {
      this.statusEl.textContent = `Selected ${packPath.split("/").pop()?.replace(/\.md$/i, "") || packPath}.`;
    }

    if (this.generateButton) {
      this.generateButton.removeAttribute("disabled");
    }
  }

  private async generateFromSelection() {
    if (!this.selectedPackPath) {
      if (this.statusEl) {
        this.statusEl.textContent = "Select a pack before generating names.";
      }
      return;
    }

    const generated = generateNamesFromSource(this.currentNamesText, this.currentPackType, this.generationCount);
    if (!this.resultsEl) {
      return;
    }

    this.resultsEl.empty();
    this.resultsEl.createEl("h3", { text: "Generated names" });

    if (generated.length === 0) {
      this.resultsEl.createEl("p", { text: "No names were generated." });
      if (this.statusEl) {
        this.statusEl.textContent = "No names were available to generate from.";
      }
      return;
    }

    const list = this.resultsEl.createEl("ul");
    generated.forEach((name) => list.createEl("li", { text: name }));

    if (this.statusEl) {
      this.statusEl.textContent = `Generated ${generated.length} name(s) from ${normalizeNamesInput(this.currentNamesText).length} source name(s).`;
    }
  }
}

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

    const currentPath = contentEl.createEl("div", {
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

class NameWrightEditorModal extends Modal {
  private parent: NameWrightModal;
  private inputEl: HTMLTextAreaElement | null = null;
  private packNameInput: HTMLInputElement | null = null;
  private breakdownButton: HTMLButtonElement | null = null;
  private listButton: HTMLButtonElement | null = null;
  private selectedPackType: "breakdownPack" | "listPack" = "breakdownPack";
  private initialText: string;
  private initialPackName: string;

  constructor(app: App, parent: NameWrightModal, initialText: string, initialPackName: string) {
    super(app);
    this.parent = parent;
    this.initialText = initialText;
    this.initialPackName = initialPackName;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("namewright-editor-modal");

    contentEl.createEl("h2", { text: "Name Pack Creator" });

    const packNameRow = contentEl.createEl("div", { cls: "namewright-modal__pack-name-row" });
    packNameRow.createEl("label", { text: "Pack name" });
    this.packNameInput = packNameRow.createEl("input", {
      cls: "namewright-modal__pack-name-input",
      attr: {
        type: "text",
        placeholder: "NameWright Pack",
        value: this.initialPackName,
      },
    }) as HTMLInputElement;
    this.packNameInput.value = this.initialPackName;

    const typeToggle = contentEl.createEl("div", { cls: "namewright-modal__type-toggle" });
    this.breakdownButton = typeToggle.createEl("button", {
      cls: "namewright-modal__type-button is-active",
      text: "Breakdown",
    }) as HTMLButtonElement;
    this.breakdownButton.addEventListener("click", () => {
      this.setPackType("breakdownPack");
    });

    this.listButton = typeToggle.createEl("button", {
      cls: "namewright-modal__type-button",
      text: "List",
    }) as HTMLButtonElement;
    this.listButton.addEventListener("click", () => {
      this.setPackType("listPack");
    });

    this.selectedPackType = this.parent.currentPackType === "listPack" ? "listPack" : "breakdownPack";
    this.updateTypeButtons();

    this.inputEl = contentEl.createEl("textarea", {
      cls: "namewright-modal__textarea",
      attr: {
        placeholder: "Ada\nGrace\nLinus\nor\nAda, Grace, Linus",
        rows: "12",
      },
    });
    this.inputEl.value = this.initialText;

    contentEl.createEl("p", {
      cls: "namewright-modal__helper-text",
      text: "Paste names as CSV, one per line, or a mix of both. The plugin will normalize them on save.",
    });

    const controls = contentEl.createEl("div", { cls: "namewright-modal__controls" });
    const saveButton = controls.createEl("button", { text: "Save names" });
    saveButton.addEventListener("click", () => {
      void this.saveNames();
    });

    const cancelButton = controls.createEl("button", { text: "Cancel" });
    cancelButton.addEventListener("click", () => this.close());
  }

  private setPackType(type: "breakdownPack" | "listPack") {
    this.selectedPackType = type;
    this.parent.currentPackType = type;
    this.updateTypeButtons();
  }

  private updateTypeButtons() {
    const isBreakdown = this.selectedPackType === "breakdownPack";
    this.breakdownButton?.classList.toggle("is-active", isBreakdown);
    this.listButton?.classList.toggle("is-active", !isBreakdown);
    this.breakdownButton?.setAttribute("aria-pressed", isBreakdown ? "true" : "false");
    this.listButton?.setAttribute("aria-pressed", isBreakdown ? "false" : "true");
  }

  private async saveNames() {
    const namesText = this.inputEl?.value || "";
    if (!namesText.trim()) {
      this.parent.setStatus("No names to save. Enter at least one name.");
      return;
    }

    const packName = this.packNameInput?.value?.trim() || "NameWright";
    this.parent.plugin.settings.packName = packName;
    this.parent.currentPackType = this.selectedPackType;
    await this.parent.plugin.saveSettings();

    const folderPath = this.parent.getFolderPath();
    if (!folderPath) {
      const folder = await this.parent.promptForFolderSelection();
      if (!folder) {
        return;
      }

      this.parent.plugin.settings.namesFilePath = folder.path;
      await this.parent.plugin.saveSettings();
      this.parent.updateFolderLabel();
    }

    await this.parent.saveToConfiguredFile(namesText);
    this.close();
  }
}