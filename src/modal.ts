import { App, Editor, Modal, normalizePath, TFolder } from "obsidian";
import { generateCompoundNames, ListGenerator, MarkovModel, extractNamesFromMarkdown } from "./markov";
import {
  createCompoundNamesFileContent,
  createNamesFileContent,
  isValidNamePackContent,
  parseNamesFileContent,
  sanitizePackNameForFilename,
} from "./nameParser";

const CREATE_PACKS_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path stroke-linejoin="round" d="M14.186 2.753v3.596c0 .487.194.955.54 1.3a1.85 1.85 0 0 0 1.306.539h4.125" /><path stroke-linejoin="round" d="M20.25 8.568v8.568a4.25 4.25 0 0 1-1.362 2.97a4.28 4.28 0 0 1-3.072 1.14h-7.59a4.3 4.3 0 0 1-3.1-1.124a4.26 4.26 0 0 1-1.376-2.986V6.862a4.25 4.25 0 0 1 1.362-2.97a4.28 4.28 0 0 1 3.072-1.14h5.714a3.5 3.5 0 0 1 2.361.905l2.96 2.722a2.97 2.97 0 0 1 1.031 2.189" /><path stroke-miterlimit="10" d="M11.57 10.424v7.116m-3.55-3.55h7.117" /></g></svg>';
const BROWSE_PACKS_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M8.593 3.217H4.698A1.95 1.95 0 0 0 2.75 5.164v13.633c0 1.075.872 1.947 1.948 1.947h3.895a1.95 1.95 0 0 0 1.947-1.947V5.164a1.95 1.95 0 0 0-1.947-1.947" /><path d="M6.645 17.379a1.503 1.503 0 1 0 0-3.007a1.503 1.503 0 0 0 0 3.007M10.54 7.93l3.116 11.685a1.95 1.95 0 0 0 2.386 1.373l3.768-.974a1.947 1.947 0 0 0 1.373-2.386L17.658 4.385a1.947 1.947 0 0 0-2.386-1.373l-3.758 1.003c-.406.111-.764.35-1.023.682" /><path d="M16.665 17.241a1.502 1.502 0 1 0 0-3.004a1.502 1.502 0 0 0 0 3.004" /></g></svg>';
const DICE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15"><path d="M0 0h15v15H0z" fill="none" /><path fill="currentColor" d="M4.14 1.14c-.68.05-1.33.43-1.7 1.07L.29 5.93c-.59 1.03-.26 2.32.77 2.91l3.72 2.14c.15.09.31.19.47.24V7.47c0-1.76 1.45-3.22 3.21-3.22h1.31c-.18-.26-.41-.5-.7-.67L5.35 1.44c-.39-.22-.8-.33-1.21-.3m.33.76c.6 0 1.12.41 1.28.99c.19.72-.23 1.45-.95 1.64c-.71.19-1.44-.23-1.64-.94c-.19-.72.24-1.45.95-1.64c.12-.04.24-.05.36-.05M2.2 5.84c.6 0 1.12.41 1.28.99c.19.71-.24 1.45-.95 1.64S1.08 8.23.89 7.52s.23-1.45.95-1.64c.11-.03.24-.05.36-.04m6.26-.52c-1.18 0-2.14.96-2.14 2.15v4.28c0 1.19.96 2.15 2.14 2.15h4.29c1.19 0 2.14-.96 2.14-2.15V7.47c0-1.19-.95-2.15-2.14-2.15zm4.29.81c.35 0 .69.14.95.39a1.34 1.34 0 0 1 0 1.89c-.26.26-.6.4-.95.4a1.34 1.34 0 0 1 0-2.68m-4.29 4.28c.36 0 .7.14.95.4c.25.25.39.59.39.94a1.34 1.34 0 0 1-2.68 0c0-.35.14-.69.4-.94c.25-.26.59-.4.94-.4" /></svg>';
const TEXT_INSERT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 56 56"><path d="M0 0h56v56H0z" fill="none" /><path fill="currentColor" d="M33.8 11.36h16.01c1.008 0 1.804-.774 1.804-1.782c0-.984-.797-1.758-1.804-1.758H33.8c-1.008 0-1.782.774-1.782 1.758c0 1.008.774 1.781 1.782 1.781M7.083 26.944c1.71 0 2.695-1.195 2.695-3.093v-4.477c0-.516.235-.82.797-.82h6.375v2.343c0 1.852 1.875 2.555 3.281 1.43l6.352-5.062c.96-.774.96-2.11 0-2.86L20.23 9.32c-1.453-1.195-3.28-.469-3.28 1.43v2.438h-6.891c-3.305 0-5.672 2.039-5.672 5.367v5.297c0 1.898.984 3.093 2.695 3.093m26.719-3.304h16.008c1.008 0 1.804-.774 1.804-1.782c0-.984-.797-1.758-1.804-1.758H33.8c-1.008 0-1.782.774-1.782 1.758c0 1.008.774 1.782 1.782 1.782M6.168 35.92h43.64a1.786 1.786 0 0 0 1.805-1.78c0-.985-.797-1.758-1.804-1.758H6.168c-1.008 0-1.781.773-1.781 1.758c0 .984.773 1.78 1.78 1.78m0 12.259h43.64c1.008 0 1.805-.774 1.805-1.758s-.797-1.781-1.804-1.781H6.168a1.766 1.766 0 0 0-1.781 1.78c0 .985.773 1.759 1.78 1.759" /></svg>';
const CHECKLIST_INSERT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M7.135 3.76a.75.75 0 0 0-.49.299L4.969 6.357l-.694-.68a.75.75 0 0 0-1.06.012a.75.75 0 0 0 .01 1.061l1.312 1.285a.75.75 0 0 0 1.131-.094l2.187-3a.75.75 0 0 0-.164-1.046a.75.75 0 0 0-.556-.135M10 5.25a.75.75 0 0 0-.75.75a.75.75 0 0 0 .75.75h10.25A.75.75 0 0 0 21 6a.75.75 0 0 0-.75-.75ZM3.75 9.5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 .75.75h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75ZM4.5 11h2v2h-2zm5.5.25a.75.75 0 0 0-.75.75a.75.75 0 0 0 .75.75h10.25A.75.75 0 0 0 21 12a.75.75 0 0 0-.75-.75ZM3.75 15.5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 .75.75h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75ZM4.5 17h2v2h-2zm5.5.25a.75.75 0 0 0-.75.75a.75.75 0 0 0 .75.75h10.25A.75.75 0 0 0 21 18a.75.75 0 0 0-.75-.75Z" /></svg>';
const BULLET_INSERT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 56 56"><path d="M0 0h56v56H0z" fill="none" /><path fill="currentColor" d="M7.34 16.762a2.936 2.936 0 0 0 2.953-2.93a2.94 2.94 0 0 0-2.953-2.953a2.956 2.956 0 0 0-2.953 2.953c0 1.617 1.336 2.93 2.953 2.93m10.36-1.055h32.015c1.078 0 1.898-.82 1.898-1.875c0-1.078-.82-1.898-1.898-1.898H17.699c-1.055 0-1.875.82-1.875 1.898a1.85 1.85 0 0 0 1.875 1.875M7.34 30.941a2.94 2.94 0 0 0 2.953-2.953a2.94 2.94 0 0 0-2.953-2.953a2.956 2.956 0 0 0-2.953 2.953a2.956 2.956 0 0 0 2.953 2.953m10.36-1.054h32.015a1.876 1.876 0 0 0 1.898-1.899c0-1.054-.82-1.875-1.898-1.875H17.699c-1.055 0-1.875.82-1.875 1.875s.82 1.899 1.875 1.899M7.34 45.12a2.956 2.956 0 0 0 2.953-2.953a2.94 2.94 0 0 0-2.953-2.953a2.956 2.956 0 0 0-2.953 2.953A2.97 2.97 0 0 0 7.34 45.12m10.36-1.078h32.015c1.078 0 1.898-.82 1.898-1.875c0-1.078-.82-1.898-1.898-1.898H17.699c-1.055 0-1.875.82-1.875 1.898a1.85 1.85 0 0 0 1.875 1.875" /></svg>';
const CANCEL_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path stroke-linejoin="round" d="M14.186 2.753v3.596c0 .487.194.955.54 1.3a1.85 1.85 0 0 0 1.306.539h4.125" /><path stroke-linejoin="round" d="M20.25 8.568v8.568a4.25 4.25 0 0 1-1.362 2.97a4.28 4.28 0 0 1-3.072 1.14h-7.59a4.3 4.3 0 0 1-3.1-1.124a4.26 4.26 0 0 1-1.376-2.986V6.862a4.25 4.25 0 0 1 1.362-2.97a4.28 4.28 0 0 1 3.072-1.14h5.714a3.5 3.5 0 0 1 2.361.905l2.96 2.722a2.97 2.97 0 0 1 1.031 2.189" /><path stroke-miterlimit="10" d="m14.51 11.513l-5.03 5.032m-.001-5.021l5.032 5.032" /></g></svg>';
const SAVE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M14.186 2.753v3.596c0 .487.194.955.54 1.3a1.85 1.85 0 0 0 1.306.539h4.125" /><path d="M20.25 8.568v8.568a4.25 4.25 0 0 1-1.362 2.97a4.28 4.28 0 0 1-3.072 1.14h-7.59a4.3 4.3 0 0 1-3.1-1.124a4.26 4.26 0 0 1-1.376-2.986V6.862a4.25 4.25 0 0 1 1.362-2.97a4.28 4.28 0 0 1 3.072-1.14h5.714a3.5 3.5 0 0 1 2.361.905l2.96 2.722a2.97 2.97 0 0 1 1.031 2.189" /><path d="m8.36 13.682l1.879 1.88a.71.71 0 0 0 1.01 0l3.787-3.787" /></g></svg>';
const BREAKDOWN_PACK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M17.755 14a2.25 2.25 0 0 1 2.248 2.25v.918a2.75 2.75 0 0 1-.512 1.598c-1.546 2.164-4.07 3.235-7.49 3.235c-3.422 0-5.945-1.072-7.487-3.236a2.75 2.75 0 0 1-.51-1.596v-.92A2.25 2.25 0 0 1 6.253 14zM12 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10" /></svg>';
const LIST_PACK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M11 15c0-.35.06-.687.171-1H4.253a2.25 2.25 0 0 0-2.25 2.25v.919c0 .572.18 1.13.511 1.596C4.056 20.929 6.58 22 10 22q.596 0 1.157-.043A3 3 0 0 1 11 21zM10 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10M12 15a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2zm2.5 1a.5.5 0 1 0 0 1h6a.5.5 0 1 0 0-1zm0 3a.5.5 0 1 0 0 1h6a.5.5 0 1 0 0-1z" /></svg>';
const COMPOUND_BREAKDOWN_PACK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M20.5 12a2.5 2.5 0 0 1 2.5 2.5v6a2.5 2.5 0 0 1-2.5 2.5h-4a2.5 2.5 0 0 1-2.5-2.5v-6a2.5 2.5 0 0 1 2.5-2.5zm-7.464 2q-.035.245-.036.5v6c0 .393.065.77.185 1.122q-1.434.377-3.185.379c-3.42 0-5.943-1.072-7.485-3.236a2.75 2.75 0 0 1-.511-1.596v-.92A2.25 2.25 0 0 1 4.253 14zM17 14a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM10 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10" /></svg>';
const COMPOUND_LIST_PACK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M20.5 12a2.5 2.5 0 0 1 2.5 2.5v6a2.5 2.5 0 0 1-2.5 2.5h-4a2.5 2.5 0 0 1-2.5-2.5v-6a2.5 2.5 0 0 1 2.5-2.5zm-7.464 2q-.035.245-.036.5v1H4.253a.75.75 0 0 0-.75.749v.578c.001.536.192 1.054.54 1.461c1.253 1.468 3.219 2.213 5.957 2.213q1.694-.002 3-.382v.381c0 .394.066.772.185 1.125Q11.752 22 10 22.001c-3.146 0-5.531-.905-7.098-2.74a3.75 3.75 0 0 1-.898-2.434v-.578A2.25 2.25 0 0 1 4.253 14zM17 14a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM10 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10m0 1.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7" /></svg>';

type NamePackType = "breakdownPack" | "listPack" | "compoundPack";

function packTypeIcon(packType: NamePackType, compoundGenerator?: "breakdown" | "list"): string {
  if (packType === "compoundPack") {
    return compoundGenerator === "list" ? COMPOUND_LIST_PACK_ICON : COMPOUND_BREAKDOWN_PACK_ICON;
  }
  return packType === "listPack" ? LIST_PACK_ICON : BREAKDOWN_PACK_ICON;
}

function generateNamesFromSource(namesText: string, packType: NamePackType, count: number = 6, settings: NameWrightSettings = {}): string[] {
  const names = extractNamesFromMarkdown(namesText);
  if (names.length === 0) {
    return [];
  }

  if (packType === "listPack") {
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
  private currentCompoundParts: string[][] = [];
  private currentCompoundGenerator: "breakdown" | "list" = "breakdown";
  private currentCompoundJoining: "joined" | "spaced" = "joined";
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
    browsePacksButton.addClass("namewright-modal__icon-button--lg");
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
    createPacksButton.addClass("namewright-modal__icon-button--lg");
    createPacksButton.addEventListener("click", () => {
      new NameWrightEditorModal(this.app, this, "", "").open();
    });

    const quantityToggle = optionsList.createEl("div", { cls: "namewright-modal__toggle-panel namewright-modal__quantity-toggle" });
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

  private updatePackDropdownTrigger(packPath: string, packType: NamePackType, compoundGenerator?: "breakdown" | "list") {
    if (this.packDropdownIconEl) {
      this.packDropdownIconEl.innerHTML = packTypeIcon(packType, compoundGenerator);
    }
    if (this.packDropdownLabelEl) {
      this.packDropdownLabelEl.textContent = packPath.split("/").pop()?.replace(/\.md$/i, "") || packPath;
    }
  }

  private renderPackDropdownMenu(packs: { path: string; packType: NamePackType; compoundGenerator?: "breakdown" | "list" }[]) {
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

    packs.forEach(({ path, packType, compoundGenerator }) => {
      const label = path.split("/").pop()?.replace(/\.md$/i, "") || path;
      const item = this.packDropdownMenuEl!.createEl("button", {
        cls: "namewright-modal__pack-dropdown-item",
        attr: { type: "button" },
      }) as HTMLButtonElement;
      item.createEl("span", { cls: "namewright-modal__pack-dropdown-icon" }).innerHTML = packTypeIcon(packType, compoundGenerator);
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

  public async saveCompoundToConfiguredFile(
    parts: string[][],
    generator: "breakdown" | "list",
    joining: "joined" | "spaced"
  ) {
    const filePath = this.getResolvedFilePath();
    if (!filePath) {
      this.setStatus("No folder set for name packs. Set one first.");
      return;
    }

    if (parts.some((part) => part.length === 0)) {
      this.setStatus("No names to save. Enter at least one name for each part.");
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

    const content = createCompoundNamesFileContent(this.plugin.settings.packName || "NameWright", parts, generator, joining);
    await this.app.vault.adapter.write(filePath, content);
    this.currentCompoundParts = parts;
    this.currentCompoundGenerator = generator;
    this.currentCompoundJoining = joining;
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    this.setStatus(`Saved ${total} name element(s) to ${filePath}.`);
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
    const packs: { path: string; packType: NamePackType; compoundGenerator?: "breakdown" | "list" }[] = [];

    for (const entry of listing.files.filter((item) => item.endsWith(".md"))) {
      const content = await adapter.read(entry);
      if (isValidNamePackContent(content)) {
        const parsed = parseNamesFileContent(content);
        packs.push({ path: entry, packType: parsed.packType, compoundGenerator: parsed.compoundGenerator });
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
    if (parsed.packType === "compoundPack") {
      this.currentCompoundParts = parsed.parts ?? [];
      this.currentCompoundGenerator = parsed.compoundGenerator ?? "breakdown";
      this.currentCompoundJoining = parsed.compoundJoining ?? "joined";
      this.currentNamesText = "";
    } else {
      this.currentNamesText = parsed.names.join("\n");
    }
    this.plugin.settings.namesFilePath = packPath;
    await this.plugin.saveSettings();
    this.updatePackDropdownTrigger(packPath, parsed.packType, parsed.compoundGenerator);
    this.setStatus(`Loaded pack ${packPath}.`);
  }

  private async generateSelectedCount() {
    if (this.currentPackType === "compoundPack") {
      const generated = generateCompoundNames(this.currentCompoundParts, {
        count: this.generationCount,
        generator: this.currentCompoundGenerator,
        joining: this.currentCompoundJoining,
        faithfulness: this.plugin.settings.faithfulness,
        strictness: this.plugin.settings.strictness,
      });

      if (generated.length === 0) {
        this.renderResults([], "Select a pack with names to generate from.");
        this.setStatus("No names available to generate from.");
        return;
      }

      const totalSource = this.currentCompoundParts.reduce((sum, part) => sum + part.length, 0);
      this.renderResults(generated);
      this.setStatus(`Generated ${generated.length} name(s) from ${totalSource} source name element(s).`);
      return;
    }

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
  private compoundButton: HTMLButtonElement | null = null;
  private selectedPackType: NamePackType = "breakdownPack";
  private initialText: string;
  private initialPackName: string;

  private compoundSectionEl: HTMLElement | null = null;
  private compoundPartsCount: 2 | 3 = 2;
  private compoundGenerator: "breakdown" | "list" = "breakdown";
  private compoundJoining: "joined" | "spaced" = "joined";
  private twoPartsButton: HTMLButtonElement | null = null;
  private threePartsButton: HTMLButtonElement | null = null;
  private compoundBreakdownButton: HTMLButtonElement | null = null;
  private compoundListButton: HTMLButtonElement | null = null;
  private joinedButton: HTMLButtonElement | null = null;
  private spacedButton: HTMLButtonElement | null = null;
  private partsExampleEl: HTMLElement | null = null;
  private joiningExampleEl: HTMLElement | null = null;
  private partTextareas: HTMLTextAreaElement[] = [];
  private partWrapperEls: HTMLElement[] = [];

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
    packNameRow.createEl("label", { text: "Pack Name" });
    this.packNameInput = packNameRow.createEl("input", {
      cls: "namewright-modal__pack-name-input",
      attr: {
        type: "text",
        placeholder: "NameWright Pack",
        value: this.initialPackName,
      },
    }) as HTMLInputElement;
    this.packNameInput.value = this.initialPackName;

    const typeToggle = contentEl.createEl("div", { cls: "namewright-modal__toggle-panel namewright-modal__pack-type-toggle" });
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

    this.compoundButton = typeToggle.createEl("button", {
      cls: "namewright-modal__toggle-button",
      text: "Compound",
    }) as HTMLButtonElement;
    this.compoundButton.addEventListener("click", () => {
      this.setPackType("compoundPack");
    });

    this.inputEl = contentEl.createEl("textarea", {
      cls: "namewright-modal__textarea",
      attr: {
        placeholder: "Paste names as CSV or one per line; or a mix of both. NameWright tidies them up.\n\nKeelin\nOsbert\nBrynn\nMarusa\n\nor\n\nKeelin, Osbert, Brynn, Marusa",
        rows: "12",
      },
    });
    this.inputEl.value = this.initialText;

    this.buildCompoundSection(contentEl);

    this.selectedPackType = this.parent.currentPackType;
    this.updateTypeButtons();
    this.updateCompoundControls();

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

  private buildCompoundSection(contentEl: HTMLElement) {
    this.compoundSectionEl = contentEl.createEl("div", { cls: "namewright-modal__compound-section" });

    const optionsRow = this.compoundSectionEl.createEl("div", { cls: "namewright-modal__compound-options-row" });

    const partsColumn = optionsRow.createEl("div", { cls: "namewright-modal__compound-option-column" });
    const partsToggle = partsColumn.createEl("div", { cls: "namewright-modal__toggle-panel" });
    this.twoPartsButton = partsToggle.createEl("button", { cls: "namewright-modal__toggle-button", text: "2 parts" }) as HTMLButtonElement;
    this.twoPartsButton.addEventListener("click", () => this.setCompoundParts(2));
    this.threePartsButton = partsToggle.createEl("button", { cls: "namewright-modal__toggle-button", text: "3 parts" }) as HTMLButtonElement;
    this.threePartsButton.addEventListener("click", () => this.setCompoundParts(3));
    this.partsExampleEl = partsColumn.createEl("div", { cls: "namewright-modal__compound-example" });

    const generatorColumn = optionsRow.createEl("div", { cls: "namewright-modal__compound-option-column" });
    const generatorToggle = generatorColumn.createEl("div", { cls: "namewright-modal__toggle-panel" });
    this.compoundBreakdownButton = generatorToggle.createEl("button", { cls: "namewright-modal__toggle-button", text: "Breakdown" }) as HTMLButtonElement;
    this.compoundBreakdownButton.addEventListener("click", () => this.setCompoundGenerator("breakdown"));
    this.compoundListButton = generatorToggle.createEl("button", { cls: "namewright-modal__toggle-button", text: "List" }) as HTMLButtonElement;
    this.compoundListButton.addEventListener("click", () => this.setCompoundGenerator("list"));

    const joiningColumn = optionsRow.createEl("div", { cls: "namewright-modal__compound-option-column" });
    const joiningToggle = joiningColumn.createEl("div", { cls: "namewright-modal__toggle-panel" });
    this.joinedButton = joiningToggle.createEl("button", { cls: "namewright-modal__toggle-button", text: "Joined" }) as HTMLButtonElement;
    this.joinedButton.addEventListener("click", () => this.setCompoundJoining("joined"));
    this.spacedButton = joiningToggle.createEl("button", { cls: "namewright-modal__toggle-button", text: "Spaced" }) as HTMLButtonElement;
    this.spacedButton.addEventListener("click", () => this.setCompoundJoining("spaced"));
    this.joiningExampleEl = joiningColumn.createEl("div", { cls: "namewright-modal__compound-example" });

    const partBoxesEl = this.compoundSectionEl.createEl("div", { cls: "namewright-modal__part-boxes" });
    for (let i = 0; i < 3; i++) {
      const wrapper = partBoxesEl.createEl("div", { cls: "namewright-modal__part-box" });
      wrapper.createEl("label", { cls: "namewright-modal__part-label", text: `Part ${i + 1}` });
      const textarea = wrapper.createEl("textarea", {
        cls: "namewright-modal__textarea",
        attr: {
          placeholder: "Paste name elements as CSV or one per line.\n\nWulf\nBeorht\nEad",
          rows: "6",
        },
      }) as HTMLTextAreaElement;
      this.partTextareas.push(textarea);
      this.partWrapperEls.push(wrapper);
    }
  }

  private setPackType(type: NamePackType) {
    this.selectedPackType = type;
    this.updateTypeButtons();
  }

  private setCompoundParts(count: 2 | 3) {
    this.compoundPartsCount = count;
    this.updateCompoundControls();
  }

  private setCompoundGenerator(generator: "breakdown" | "list") {
    this.compoundGenerator = generator;
    this.updateCompoundControls();
  }

  private setCompoundJoining(joining: "joined" | "spaced") {
    this.compoundJoining = joining;
    this.updateCompoundControls();
  }

  private updateTypeButtons() {
    const isBreakdown = this.selectedPackType === "breakdownPack";
    const isList = this.selectedPackType === "listPack";
    const isCompound = this.selectedPackType === "compoundPack";
    this.breakdownButton?.classList.toggle("is-active", isBreakdown);
    this.listButton?.classList.toggle("is-active", isList);
    this.compoundButton?.classList.toggle("is-active", isCompound);
    this.breakdownButton?.setAttribute("aria-pressed", String(isBreakdown));
    this.listButton?.setAttribute("aria-pressed", String(isList));
    this.compoundButton?.setAttribute("aria-pressed", String(isCompound));

    if (isCompound) {
      this.inputEl?.hide();
      this.compoundSectionEl?.show();
    } else {
      this.inputEl?.show();
      this.compoundSectionEl?.hide();
    }
  }

  private updateCompoundControls() {
    this.twoPartsButton?.classList.toggle("is-active", this.compoundPartsCount === 2);
    this.threePartsButton?.classList.toggle("is-active", this.compoundPartsCount === 3);
    this.twoPartsButton?.setAttribute("aria-pressed", String(this.compoundPartsCount === 2));
    this.threePartsButton?.setAttribute("aria-pressed", String(this.compoundPartsCount === 3));
    if (this.partsExampleEl) {
      this.partsExampleEl.textContent = this.compoundPartsCount === 3 ? "Julius Octavia Caesar" : "Bright Blossom";
    }

    this.compoundBreakdownButton?.classList.toggle("is-active", this.compoundGenerator === "breakdown");
    this.compoundListButton?.classList.toggle("is-active", this.compoundGenerator === "list");
    this.compoundBreakdownButton?.setAttribute("aria-pressed", String(this.compoundGenerator === "breakdown"));
    this.compoundListButton?.setAttribute("aria-pressed", String(this.compoundGenerator === "list"));

    this.joinedButton?.classList.toggle("is-active", this.compoundJoining === "joined");
    this.spacedButton?.classList.toggle("is-active", this.compoundJoining === "spaced");
    this.joinedButton?.setAttribute("aria-pressed", String(this.compoundJoining === "joined"));
    this.spacedButton?.setAttribute("aria-pressed", String(this.compoundJoining === "spaced"));
    if (this.joiningExampleEl) {
      this.joiningExampleEl.textContent = this.compoundJoining === "spaced" ? "Lofty+Tiger = Lofty Tiger" : "Wulf+stan = Wulfstan";
    }

    const thirdWrapper = this.partWrapperEls[2];
    if (this.compoundPartsCount === 3) {
      thirdWrapper?.show();
    } else {
      thirdWrapper?.hide();
    }
  }

  private async saveNames() {
    const packName = this.packNameInput?.value?.trim() || "NameWright";

    if (this.selectedPackType === "compoundPack") {
      const parts = this.partTextareas
        .slice(0, this.compoundPartsCount)
        .map((textarea) => extractNamesFromMarkdown(textarea.value || ""));

      if (parts.some((part) => part.length === 0)) {
        this.parent.setStatus("No names to save. Enter at least one name for each part.");
        return;
      }

      this.parent.plugin.settings.packName = packName;
      this.parent.currentPackType = "compoundPack";
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

      await this.parent.saveCompoundToConfiguredFile(parts, this.compoundGenerator, this.compoundJoining);
      this.close();
      return;
    }

    const namesText = this.inputEl?.value || "";
    if (!namesText.trim()) {
      this.parent.setStatus("No names to save. Enter at least one name.");
      return;
    }

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