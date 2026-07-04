import { App, Editor, Modal, normalizePath, TFolder } from "obsidian";
import { ListGenerator, MarkovModel, extractNamesFromMarkdown } from "./markov";
import { createNamesFileContent, isValidNamePackContent, parseNamesFileContent, sanitizePackNameForFilename } from "./nameParser";

const CREATE_PACKS_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M17 14h2v3h3v2h-3v3h-2v-3h-3v-2h3zM5 3h14c1.11 0 2 .89 2 2v7.8c-.61-.35-1.28-.6-2-.72V5H5v14h7.08c.12.72.37 1.39.72 2H5c-1.11 0-2-.89-2-2V5c0-1.11.89-2 2-2m2 4h10v2H7zm0 4h10v1.08c-.85.14-1.63.46-2.32.92H7zm0 4h5v2H7z" /></svg>';
const BROWSE_PACKS_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M5 3c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 2h14v14H5zm2 2v2h10V7zm0 4v2h10v-2zm0 4v2h7v-2z" /></svg>';
const DICE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15"><path d="M0 0h15v15H0z" fill="none" /><path fill="currentColor" d="M4.14 1.14c-.68.05-1.33.43-1.7 1.07L.29 5.93c-.59 1.03-.26 2.32.77 2.91l3.72 2.14c.15.09.31.19.47.24V7.47c0-1.76 1.45-3.22 3.21-3.22h1.31c-.18-.26-.41-.5-.7-.67L5.35 1.44c-.39-.22-.8-.33-1.21-.3m.33.76c.6 0 1.12.41 1.28.99c.19.72-.23 1.45-.95 1.64c-.71.19-1.44-.23-1.64-.94c-.19-.72.24-1.45.95-1.64c.12-.04.24-.05.36-.05M2.2 5.84c.6 0 1.12.41 1.28.99c.19.71-.24 1.45-.95 1.64S1.08 8.23.89 7.52s.23-1.45.95-1.64c.11-.03.24-.05.36-.04m6.26-.52c-1.18 0-2.14.96-2.14 2.15v4.28c0 1.19.96 2.15 2.14 2.15h4.29c1.19 0 2.14-.96 2.14-2.15V7.47c0-1.19-.95-2.15-2.14-2.15zm4.29.81c.35 0 .69.14.95.39a1.34 1.34 0 0 1 0 1.89c-.26.26-.6.4-.95.4a1.34 1.34 0 0 1 0-2.68m-4.29 4.28c.36 0 .7.14.95.4c.25.25.39.59.39.94a1.34 1.34 0 0 1-2.68 0c0-.35.14-.69.4-.94c.25-.26.59-.4.94-.4" /></svg>';
const TEXT_INSERT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 56 56"><path d="M0 0h56v56H0z" fill="none" /><path fill="currentColor" d="M33.8 11.36h16.01c1.008 0 1.804-.774 1.804-1.782c0-.984-.797-1.758-1.804-1.758H33.8c-1.008 0-1.782.774-1.782 1.758c0 1.008.774 1.781 1.782 1.781M7.083 26.944c1.71 0 2.695-1.195 2.695-3.093v-4.477c0-.516.235-.82.797-.82h6.375v2.343c0 1.852 1.875 2.555 3.281 1.43l6.352-5.062c.96-.774.96-2.11 0-2.86L20.23 9.32c-1.453-1.195-3.28-.469-3.28 1.43v2.438h-6.891c-3.305 0-5.672 2.039-5.672 5.367v5.297c0 1.898.984 3.093 2.695 3.093m26.719-3.304h16.008c1.008 0 1.804-.774 1.804-1.782c0-.984-.797-1.758-1.804-1.758H33.8c-1.008 0-1.782.774-1.782 1.758c0 1.008.774 1.782 1.782 1.782M6.168 35.92h43.64a1.786 1.786 0 0 0 1.805-1.78c0-.985-.797-1.758-1.804-1.758H6.168c-1.008 0-1.781.773-1.781 1.758c0 .984.773 1.78 1.78 1.78m0 12.259h43.64c1.008 0 1.805-.774 1.805-1.758s-.797-1.781-1.804-1.781H6.168a1.766 1.766 0 0 0-1.781 1.78c0 .985.773 1.759 1.78 1.759" /></svg>';
const CHECKLIST_INSERT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M7.135 3.76a.75.75 0 0 0-.49.299L4.969 6.357l-.694-.68a.75.75 0 0 0-1.06.012a.75.75 0 0 0 .01 1.061l1.312 1.285a.75.75 0 0 0 1.131-.094l2.187-3a.75.75 0 0 0-.164-1.046a.75.75 0 0 0-.556-.135M10 5.25a.75.75 0 0 0-.75.75a.75.75 0 0 0 .75.75h10.25A.75.75 0 0 0 21 6a.75.75 0 0 0-.75-.75ZM3.75 9.5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 .75.75h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75ZM4.5 11h2v2h-2zm5.5.25a.75.75 0 0 0-.75.75a.75.75 0 0 0 .75.75h10.25A.75.75 0 0 0 21 12a.75.75 0 0 0-.75-.75ZM3.75 15.5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 .75.75h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75ZM4.5 17h2v2h-2zm5.5.25a.75.75 0 0 0-.75.75a.75.75 0 0 0 .75.75h10.25A.75.75 0 0 0 21 18a.75.75 0 0 0-.75-.75Z" /></svg>';
const BULLET_INSERT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 56 56"><path d="M0 0h56v56H0z" fill="none" /><path fill="currentColor" d="M7.34 16.762a2.936 2.936 0 0 0 2.953-2.93a2.94 2.94 0 0 0-2.953-2.953a2.956 2.956 0 0 0-2.953 2.953c0 1.617 1.336 2.93 2.953 2.93m10.36-1.055h32.015c1.078 0 1.898-.82 1.898-1.875c0-1.078-.82-1.898-1.898-1.898H17.699c-1.055 0-1.875.82-1.875 1.898a1.85 1.85 0 0 0 1.875 1.875M7.34 30.941a2.94 2.94 0 0 0 2.953-2.953a2.94 2.94 0 0 0-2.953-2.953a2.956 2.956 0 0 0-2.953 2.953a2.956 2.956 0 0 0 2.953 2.953m10.36-1.054h32.015a1.876 1.876 0 0 0 1.898-1.899c0-1.054-.82-1.875-1.898-1.875H17.699c-1.055 0-1.875.82-1.875 1.875s.82 1.899 1.875 1.899M7.34 45.12a2.956 2.956 0 0 0 2.953-2.953a2.94 2.94 0 0 0-2.953-2.953a2.956 2.956 0 0 0-2.953 2.953A2.97 2.97 0 0 0 7.34 45.12m10.36-1.078h32.015c1.078 0 1.898-.82 1.898-1.875c0-1.078-.82-1.898-1.898-1.898H17.699c-1.055 0-1.875.82-1.875 1.898a1.85 1.85 0 0 0 1.875 1.875" /></svg>';
const CANCEL_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="m12 13.4l2.9 2.9q.275.275.7.275t.7-.275t.275-.7t-.275-.7L13.4 12l2.9-2.9q.275-.275.275-.7t-.275-.7t-.7-.275t-.7.275L12 10.6L9.1 7.7q-.275-.275-.7-.275t-.7.275t-.275.7t.275.7l2.9 2.9l-2.9 2.9q-.275.275-.275.7t.275.7t.7.275t.7-.275zm0 8.6q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8" /></svg>';
const SAVE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48"><path d="M0 0h48v48H0z" fill="none" /><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"><path d="M36.756 4.347a5.56 5.56 0 0 0-3.234-1.172A242 242 0 0 0 24 3c-7.364 0-12.515.277-15.743.539c-2.555.208-4.51 2.163-4.718 4.718C3.277 11.485 3 16.636 3 24s.277 12.515.539 15.743c.208 2.555 2.163 4.51 4.718 4.718C11.485 44.723 16.636 45 24 45s12.515-.277 15.743-.539c2.555-.208 4.51-2.163 4.718-4.718C44.723 36.515 45 31.364 45 24c0-3.729-.071-6.89-.175-9.522a5.56 5.56 0 0 0-1.173-3.234c-.86-1.09-1.988-2.428-3.229-3.668c-1.24-1.24-2.578-2.368-3.667-3.229" /><path d="M31.293 3.1c.034.705.056 1.544.056 2.526a52 52 0 0 1-.064 2.687c-.088 1.694-1.412 2.938-3.107 3.01c-1.063.044-2.446.078-4.179.078s-3.115-.034-4.178-.079c-1.695-.07-3.019-1.315-3.107-3.009a52 52 0 0 1-.065-2.687c0-.982.023-1.821.057-2.526m19.656 41.59c.126-2.013.237-4.851.237-8.615c0-4.47-.156-7.635-.31-9.662c-.128-1.704-1.425-3.013-3.128-3.15c-1.95-.156-4.953-.313-9.162-.313s-7.212.157-9.161.314c-1.704.136-3 1.445-3.129 3.15c-.153 2.026-.31 5.191-.31 9.661c0 3.764.111 6.602.238 8.615M19 31h10m-10 6h6" /></g></svg>';
const BREAKDOWN_PACK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M17.755 14a2.25 2.25 0 0 1 2.248 2.25v.918a2.75 2.75 0 0 1-.512 1.598c-1.546 2.164-4.07 3.235-7.49 3.235c-3.422 0-5.945-1.072-7.487-3.236a2.75 2.75 0 0 1-.51-1.596v-.92A2.25 2.25 0 0 1 6.253 14zM12 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10" /></svg>';
const LIST_PACK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M11 15c0-.35.06-.687.171-1H4.253a2.25 2.25 0 0 0-2.25 2.25v.919c0 .572.18 1.13.511 1.596C4.056 20.929 6.58 22 10 22q.596 0 1.157-.043A3 3 0 0 1 11 21zM10 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10M12 15a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2zm2.5 1a.5.5 0 1 0 0 1h6a.5.5 0 1 0 0-1zm0 3a.5.5 0 1 0 0 1h6a.5.5 0 1 0 0-1z" /></svg>';

type NamePackType = "breakdownPack" | "listPack" | "compoundBreakdownPack" | "compoundListPack";

function packTypeIcon(packType: NamePackType): string {
  return packType === "listPack" || packType === "compoundListPack" ? LIST_PACK_ICON : BREAKDOWN_PACK_ICON;
}

function generateNamesFromSource(namesText: string, packType: NamePackType, count: number = 6, settings: NameWrightSettings = {}): string[] {
  const names = extractNamesFromMarkdown(namesText);
  if (names.length === 0) {
    return [];
  }

  if (packType === "listPack" || packType === "compoundListPack") {
    const generator = new ListGenerator();
    generator.train(names);
    return generator.generateMultiple(count);
  }

  const model = MarkovModel.build(names);
  return model.generate({ count, faithfulness: settings.faithfulness ?? 2, strictness: settings.strictness ?? 3 });
}

export interface NameWrightSettings {
  namesFilePath?: string;
  packName?: string;
  folderPath?: string;
  faithfulness?: number;
  strictness?: number;
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
  private packDropdownEl: HTMLElement | null = null;
  private packDropdownTrigger: HTMLButtonElement | null = null;
  private packDropdownIconEl: HTMLElement | null = null;
  private packDropdownLabelEl: HTMLElement | null = null;
  private packDropdownMenuEl: HTMLElement | null = null;
  private isPackDropdownOpen = false;
  private quantityButtons: HTMLButtonElement[] = [];
  private clearResultsSelection: () => void = () => {};
  private currentNamesText = "";
  public currentPackType: NamePackType = "breakdownPack";
  private generationCount = 25;

  constructor(app: App, plugin: NameWrightPluginLike, settings: NameWrightSettings = {}) {
    super(app);
    this.plugin = plugin;
    this.plugin.settings = { ...this.plugin.settings, ...settings };
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("namewright-modal");

    const optionsList = contentEl.createEl("div", { cls: "namewright-modal__options-list" });

    const createPacksRow = optionsList.createEl("div", { cls: "namewright-modal__option-row" });
    const browsePacksButton = this.createIconButton(createPacksRow, BROWSE_PACKS_ICON, "Refresh pack list");
    browsePacksButton.addEventListener("click", () => {
      void this.refreshPackDropdown();
    });
    this.packDropdownEl = createPacksRow.createEl("div", { cls: "namewright-modal__pack-dropdown" });
    this.packDropdownTrigger = this.packDropdownEl.createEl("button", {
      cls: "namewright-modal__pack-dropdown-trigger",
      attr: { type: "button", "aria-haspopup": "listbox", "aria-expanded": "false" },
    }) as HTMLButtonElement;
    this.packDropdownIconEl = this.packDropdownTrigger.createEl("span", { cls: "namewright-modal__pack-dropdown-icon" });
    this.packDropdownLabelEl = this.packDropdownTrigger.createEl("span", {
      cls: "namewright-modal__pack-dropdown-label",
      text: "No packs found",
    });
    this.packDropdownTrigger.addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.togglePackDropdown();
    });

    this.packDropdownMenuEl = this.packDropdownEl.createEl("div", { cls: "namewright-modal__pack-dropdown-menu" });
    this.packDropdownMenuEl.hide();

    document.addEventListener("click", this.handlePackDropdownOutsideClick);
    const createPacksButton = this.createIconButton(createPacksRow, CREATE_PACKS_ICON, "Create name packs");
    createPacksButton.addEventListener("click", () => {
      new NameWrightEditorModal(this.app, this, "", "").open();
    });

    const quantityToggle = optionsList.createEl("div", { cls: "namewright-modal__toggle-panel" });
    this.quantityButtons = [10, 15, 25, 50, 100].map((value) => {
      const button = quantityToggle.createEl("button", {
        cls: "namewright-modal__toggle-button" + (value === this.generationCount ? " is-active" : ""),
        text: String(value),
      }) as HTMLButtonElement;
      button.setAttribute("aria-pressed", value === this.generationCount ? "true" : "false");
      button.addEventListener("click", () => {
        this.generationCount = value;
        this.updateQuantityButtons();
      });
      return button;
    });

    const generateButton = this.createIconButton(optionsList, DICE_ICON, "Generate names");
    generateButton.addClass("namewright-modal__generate-button");
    generateButton.addEventListener("click", () => {
      void this.generateSelectedCount();
    });

    this.resultsEl = contentEl.createEl("div", { cls: "namewright-modal__results" });
    this.renderResults([]);

    void this.refreshPackDropdown();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    document.removeEventListener("click", this.handlePackDropdownOutsideClick);
  }

  private handlePackDropdownOutsideClick = (evt: MouseEvent) => {
    if (this.isPackDropdownOpen && this.packDropdownEl && !this.packDropdownEl.contains(evt.target as Node)) {
      this.closePackDropdown();
    }
  };

  private togglePackDropdown() {
    if (this.isPackDropdownOpen) {
      this.closePackDropdown();
    } else {
      this.openPackDropdown();
    }
  }

  private openPackDropdown() {
    this.isPackDropdownOpen = true;
    this.packDropdownMenuEl?.show();
    this.packDropdownTrigger?.setAttribute("aria-expanded", "true");
  }

  private closePackDropdown() {
    this.isPackDropdownOpen = false;
    this.packDropdownMenuEl?.hide();
    this.packDropdownTrigger?.setAttribute("aria-expanded", "false");
  }

  private updatePackDropdownTrigger(packPath: string, packType: NamePackType) {
    if (this.packDropdownIconEl) {
      this.packDropdownIconEl.innerHTML = packTypeIcon(packType);
    }
    if (this.packDropdownLabelEl) {
      this.packDropdownLabelEl.textContent = packPath.split("/").pop()?.replace(/\.md$/i, "") || packPath;
    }
  }

  private renderPackDropdownMenu(packs: { path: string; packType: NamePackType }[]) {
    if (!this.packDropdownMenuEl) {
      return;
    }

    this.packDropdownMenuEl.empty();

    if (packs.length === 0) {
      this.packDropdownMenuEl.createEl("div", {
        cls: "namewright-modal__pack-dropdown-empty",
        text: "No packs found",
      });
      return;
    }

    packs.forEach(({ path, packType }) => {
      const label = path.split("/").pop()?.replace(/\.md$/i, "") || path;
      const item = this.packDropdownMenuEl!.createEl("button", {
        cls: "namewright-modal__pack-dropdown-item",
        attr: { type: "button" },
      }) as HTMLButtonElement;
      item.createEl("span", { cls: "namewright-modal__pack-dropdown-icon" }).innerHTML = packTypeIcon(packType);
      item.createEl("span", { cls: "namewright-modal__pack-dropdown-label", text: label });
      item.addEventListener("click", () => {
        this.closePackDropdown();
        void this.loadPack(path);
      });
    });
  }

  private createIconButton(container: HTMLElement, icon: string, title: string): HTMLButtonElement {
    const button = container.createEl("button", {
      cls: "namewright-modal__icon-button",
      attr: { title },
    }) as HTMLButtonElement;
    button.innerHTML = icon;
    return button;
  }

  private updateQuantityButtons() {
    this.quantityButtons.forEach((button) => {
      const isActive = Number(button.textContent) === this.generationCount;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
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

  public async saveToConfiguredFile(namesText: string) {
    const filePath = this.getResolvedFilePath();
    if (!filePath) {
      this.setStatus("No folder set for name packs. Set one first.");
      return;
    }

    const names = extractNamesFromMarkdown(namesText);
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

  private async refreshPackDropdown() {
    if (!this.packDropdownMenuEl) {
      return;
    }

    const folderPath = this.getFolderPath();
    if (!folderPath) {
      this.renderPackDropdownMenu([]);
      this.setStatus("Set a folder to store name packs before browsing them.");
      return;
    }

    const adapter = this.app.vault.adapter;
    if (!(await adapter.exists(folderPath))) {
      this.renderPackDropdownMenu([]);
      this.setStatus(`Folder not found at ${folderPath}.`);
      return;
    }

    const listing = await adapter.list(folderPath);
    const packs: { path: string; packType: NamePackType }[] = [];

    for (const entry of listing.files.filter((item) => item.endsWith(".md"))) {
      const content = await adapter.read(entry);
      if (isValidNamePackContent(content)) {
        const parsed = parseNamesFileContent(content);
        packs.push({ path: entry, packType: parsed.packType });
      }
    }

    packs.sort((a, b) => a.path.localeCompare(b.path));
    this.renderPackDropdownMenu(packs);

    if (packs.length === 0) {
      this.setStatus(`No packs found in ${folderPath}.`);
      return;
    }

    const paths = packs.map((pack) => pack.path);
    const lastUsed = this.plugin.settings.namesFilePath;
    const defaultPack = lastUsed && paths.includes(lastUsed) ? lastUsed : paths[0];
    await this.loadPack(defaultPack);
  }

  private async loadPack(packPath: string) {
    const content = await this.app.vault.adapter.read(packPath);
    const parsed = parseNamesFileContent(content);
    if (parsed.packName) {
      this.plugin.settings.packName = parsed.packName;
    }

    this.currentPackType = parsed.packType;
    this.currentNamesText = parsed.names.join("\n");
    this.plugin.settings.namesFilePath = packPath;
    await this.plugin.saveSettings();
    this.updatePackDropdownTrigger(packPath, parsed.packType);
    this.setStatus(`Loaded pack ${packPath}.`);
  }

  private async generateSelectedCount() {
    const generated = generateNamesFromSource(this.currentNamesText, this.currentPackType, this.generationCount, this.plugin.settings);

    if (generated.length === 0) {
      this.renderResults([], "Select a pack with names to generate from.");
      this.setStatus("No names available to generate from.");
      return;
    }

    this.renderResults(generated);
    this.setStatus(`Generated ${generated.length} name(s) from ${extractNamesFromMarkdown(this.currentNamesText).length} source name(s).`);
  }

  private renderResults(names: string[], placeholderMessage?: string) {
    if (!this.resultsEl) {
      return;
    }

    this.resultsEl.empty();

    const list = this.resultsEl.createEl("ul", { cls: "namewright-modal__results-list" });

    const actions = this.resultsEl.createEl("div", { cls: "namewright-modal__results-actions" });
    const insertButton = actions.createEl("button", { cls: "namewright-modal__text-button", attr: { title: "Insert" } }) as HTMLButtonElement;
    insertButton.innerHTML = TEXT_INSERT_ICON;
    const checklistButton = actions.createEl("button", { cls: "namewright-modal__text-button", attr: { title: "Insert checklist" } }) as HTMLButtonElement;
    checklistButton.innerHTML = CHECKLIST_INSERT_ICON;
    const bulletButton = actions.createEl("button", { cls: "namewright-modal__text-button", attr: { title: "Insert bullet list" } }) as HTMLButtonElement;
    bulletButton.innerHTML = BULLET_INSERT_ICON;

    const getSelectedNames = (): string[] =>
      Array.from(list.querySelectorAll("li.is-selected")).map((el) => el.textContent ?? "");

    const updateInsertButtons = () => {
      const selected = getSelectedNames();
      insertButton.disabled = selected.length !== 1;
      checklistButton.disabled = selected.length === 0;
      bulletButton.disabled = selected.length === 0;
    };

    this.clearResultsSelection = () => {
      list.querySelectorAll("li.is-selected").forEach((el) => el.classList.remove("is-selected"));
      updateInsertButtons();
    };

    if (placeholderMessage) {
      list.createEl("li", { cls: "namewright-modal__placeholder", text: placeholderMessage });
    } else {
      names.forEach((name) => {
        const item = list.createEl("li", { text: name });
        item.addEventListener("click", () => {
          item.classList.toggle("is-selected");
          updateInsertButtons();
        });
      });
    }

    insertButton.addEventListener("click", () => {
      const [name] = getSelectedNames();
      if (name) this.insertPlainText(name);
    });
    checklistButton.addEventListener("click", () => {
      const selected = getSelectedNames();
      if (selected.length > 0) this.insertNamesAsList(selected, "checklist");
    });
    bulletButton.addEventListener("click", () => {
      const selected = getSelectedNames();
      if (selected.length > 0) this.insertNamesAsList(selected, "bullet");
    });

    updateInsertButtons();
  }

  private getActiveEditor(): Editor | undefined {
    return this.app.workspace.activeEditor?.editor;
  }

  private insertPlainText(name: string) {
    const editor = this.getActiveEditor();
    if (!editor) {
      this.setStatus("No active note to insert into. Click into a note first.");
      return;
    }

    editor.replaceSelection(name);
    editor.focus();
    this.close();
  }

  private insertNamesAsList(names: string[], listType: "bullet" | "checklist") {
    if (names.length === 0) {
      return;
    }

    const editor = this.getActiveEditor();
    if (!editor) {
      this.setStatus("No active note to insert into. Click into a note first.");
      return;
    }

    const marker = listType === "checklist" ? "- [ ] " : "- ";
    const emptyMarkerPattern = listType === "checklist"
      ? /^(\s*)[-*+]\s\[ \]\s$/
      : /^(\s*)[-*+]\s$/;

    const cursor = editor.getCursor();
    const lineText = editor.getLine(cursor.line);

    let from = cursor;
    let insertion: string;

    if (/^\s*$/.test(lineText)) {
      // Blank line: insert directly, no leading newline.
      insertion = names.map((name) => `${marker}${name}`).join("\n");
    } else if (cursor.ch === lineText.length && emptyMarkerPattern.test(lineText)) {
      // Cursor right after an empty, type-matching marker: reuse it for the first name.
      const indent = lineText.match(emptyMarkerPattern)?.[1] ?? "";
      const [first, ...rest] = names;
      insertion = first + rest.map((name) => `\n${indent}${marker}${name}`).join("");
    } else {
      // Real content on the line: insert at the END of the line, then newline + list,
      // so mid-line text is never split.
      from = { line: cursor.line, ch: lineText.length };
      insertion = "\n" + names.map((name) => `${marker}${name}`).join("\n");
    }

    editor.replaceRange(insertion, from);
    this.setStatus(`Inserted ${names.length} name(s) as a ${listType}.`);
    this.clearResultsSelection();
  }

  public setStatus(message: string) {
    if (this.statusEl) {
      this.statusEl.textContent = message;
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

    const typeToggle = contentEl.createEl("div", { cls: "namewright-modal__toggle-panel" });
    this.breakdownButton = typeToggle.createEl("button", {
      cls: "namewright-modal__toggle-button is-active",
      text: "Breakdown",
    }) as HTMLButtonElement;
    this.breakdownButton.addEventListener("click", () => {
      this.setPackType("breakdownPack");
    });

    this.listButton = typeToggle.createEl("button", {
      cls: "namewright-modal__toggle-button",
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
        placeholder: "Paste names as CSV or one per line; or a mix of both. NameWright tidies them up.\n\nKeelin\nOsbert\nBrynn\nMarusa\n\nor\n\nKeelin, Osbert, Brynn, Marusa",
        rows: "12",
      },
    });
    this.inputEl.value = this.initialText;

    const controls = contentEl.createEl("div", { cls: "namewright-modal__controls" });
    const saveButton = controls.createEl("button", { cls: "namewright-modal__text-button", attr: { title: "Save names" } }) as HTMLButtonElement;
    saveButton.innerHTML = SAVE_ICON;
    saveButton.addEventListener("click", () => {
      void this.saveNames();
    });

    const cancelButton = controls.createEl("button", { cls: "namewright-modal__text-button", attr: { title: "Cancel" } }) as HTMLButtonElement;
    cancelButton.innerHTML = CANCEL_ICON;
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

    let folderPath = this.parent.getFolderPath();
    if (!folderPath) {
      const folder = await this.parent.promptForFolderSelection();
      if (!folder) {
        return;
      }
      folderPath = folder.path;
    }

    const fileName = sanitizePackNameForFilename(packName);
    this.parent.plugin.settings.namesFilePath = normalizePath(`${folderPath}/${fileName}.md`);
    await this.parent.plugin.saveSettings();

    await this.parent.saveToConfiguredFile(namesText);
    this.close();
  }
}