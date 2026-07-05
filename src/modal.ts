import { App, Editor, Modal, normalizePath, setIcon, TFile, TFolder } from "obsidian";
import {
  generateCompoundNamesDetailed,
  ListGenerator,
  MarkovModel,
  PlaceNameModel,
  PlaceEnding,
  extractNamesFromMarkdown,
  mulberry32,
} from "./markov";
import {
  createCompoundNamesFileContent,
  createNamesFileContent,
  isValidNamePackContent,
  parseNamesFileContent,
  sanitizePackNameForFilename,
} from "./nameParser";
import {
  ICON_BREAKDOWN_PACK,
  ICON_BROWSE_PACKS,
  ICON_BULLET_INSERT,
  ICON_CANCEL,
  ICON_CHECKLIST_INSERT,
  ICON_COMPOUND_BREAKDOWN_PACK,
  ICON_COMPOUND_LIST_PACK,
  ICON_CREATE_PACKS,
  ICON_DICE,
  ICON_LIST_PACK,
  ICON_PLACE_PACK,
  ICON_SAVE,
  ICON_SEED_COPY,
  ICON_SEED_LOCK,
  ICON_TEXT_INSERT,
} from "./icons";

type NamePackType = "breakdownPack" | "listPack" | "compoundPack" | "placePack";

function packTypeIconId(packType: NamePackType, compoundGenerator?: "breakdown" | "list"): string {
  if (packType === "compoundPack") {
    return compoundGenerator === "list" ? ICON_COMPOUND_LIST_PACK : ICON_COMPOUND_BREAKDOWN_PACK;
  }
  if (packType === "placePack") {
    return ICON_PLACE_PACK;
  }
  return packType === "listPack" ? ICON_LIST_PACK : ICON_BREAKDOWN_PACK;
}

interface SourceGenerationResult {
  names: string[];
  seed: number;
  /** Discovered place-name endings, present only for placePack generations. */
  endings?: PlaceEnding[];
}

function resolveSeed(seed?: number): number {
  return seed !== undefined && Number.isFinite(seed)
    ? Math.floor(seed) >>> 0
    : (Math.random() * 0xffffffff) >>> 0;
}

function generateNamesFromSource(
  namesText: string,
  packType: NamePackType,
  count: number = 6,
  settings: NameForgeSettings = {},
  seed?: number
): SourceGenerationResult {
  const names = extractNamesFromMarkdown(namesText);
  const resolvedSeed = resolveSeed(seed);
  if (names.length === 0) {
    return { names: [], seed: resolvedSeed };
  }

  if (packType === "listPack") {
    const generator = new ListGenerator();
    generator.train(names);
    return { names: generator.generateMultiple(count, mulberry32(resolvedSeed)), seed: resolvedSeed };
  }

  if (packType === "placePack") {
    const model = PlaceNameModel.build(names);
    const result = model.generateDetailed({
      count,
      faithfulness: settings.faithfulness ?? 2,
      strictness: settings.strictness ?? 3,
      seed: resolvedSeed,
    });
    return { names: result.names, seed: result.seed, endings: model.endings };
  }

  const model = MarkovModel.build(names);
  const result = model.generateDetailed({
    count,
    faithfulness: settings.faithfulness ?? 2,
    strictness: settings.strictness ?? 3,
    seed: resolvedSeed,
  });
  return { names: result.names, seed: result.seed };
}

function parseSeedInput(value?: string): number | undefined {
  if (!value || !value.trim()) return undefined;
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? Math.floor(parsed) >>> 0 : undefined;
}

function formatHistoryTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

export const MAX_HISTORY_ENTRIES = 50;

export interface GenerationHistoryEntry {
  packName: string;
  timestamp: string;
  seed: number;
}

export interface NameForgeSettings {
  namesFilePath?: string;
  packName?: string;
  folderPath?: string;
  faithfulness?: number;
  strictness?: number;
  previousGenerations?: GenerationHistoryEntry[];
}

interface NameForgePluginLike {
  app: App;
  settings: NameForgeSettings;
  saveSettings(): Promise<void>;
}

export class NameForgeModal extends Modal {
  public plugin: NameForgePluginLike;
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
  private currentSeed: number | null = null;
  private seedLocked = false;
  private seedInputEl: HTMLInputElement | null = null;
  private seedLockButton: HTMLButtonElement | null = null;

  constructor(app: App, plugin: NameForgePluginLike, settings: NameForgeSettings = {}) {
    super(app);
    this.plugin = plugin;
    this.plugin.settings = { ...this.plugin.settings, ...settings };
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("nameforge-modal");

    const optionsList = contentEl.createEl("div", { cls: "nameforge-modal__options-list" });

    const createPacksRow = optionsList.createEl("div", { cls: "nameforge-modal__option-row" });
    const browsePacksButton = this.createIconButton(createPacksRow, ICON_BROWSE_PACKS, "Refresh pack list");
    browsePacksButton.addClass("nameforge-modal__icon-button--lg");
    browsePacksButton.addEventListener("click", () => {
      void this.refreshPackDropdown();
    });
    this.packDropdownEl = createPacksRow.createEl("div", { cls: "nameforge-modal__pack-dropdown" });
    this.packDropdownTrigger = this.packDropdownEl.createEl("button", {
      cls: "nameforge-modal__pack-dropdown-trigger",
      attr: { type: "button", "aria-haspopup": "listbox", "aria-expanded": "false" },
    }) as HTMLButtonElement;
    this.packDropdownIconEl = this.packDropdownTrigger.createEl("span", { cls: "nameforge-modal__pack-dropdown-icon" });
    this.packDropdownLabelEl = this.packDropdownTrigger.createEl("span", {
      cls: "nameforge-modal__pack-dropdown-label",
      text: "No packs found",
    });
    this.packDropdownTrigger.addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.togglePackDropdown();
    });

    this.packDropdownMenuEl = this.packDropdownEl.createEl("div", { cls: "nameforge-modal__pack-dropdown-menu" });
    this.packDropdownMenuEl.hide();

    document.addEventListener("click", this.handlePackDropdownOutsideClick);
    const createPacksButton = this.createIconButton(createPacksRow, ICON_CREATE_PACKS, "Create name packs");
    createPacksButton.addClass("nameforge-modal__icon-button--lg");
    createPacksButton.addEventListener("click", () => {
      new NameForgeEditorModal(this.app, this, "", "").open();
    });

    const quantityToggle = optionsList.createEl("div", { cls: "nameforge-modal__toggle-panel nameforge-modal__quantity-toggle" });
    this.quantityButtons = [10, 15, 25, 50, 100].map((value) => {
      const button = quantityToggle.createEl("button", {
        cls: "nameforge-modal__toggle-button" + (value === this.generationCount ? " is-active" : ""),
        text: String(value),
      }) as HTMLButtonElement;
      button.setAttribute("aria-pressed", value === this.generationCount ? "true" : "false");
      button.addEventListener("click", () => {
        this.generationCount = value;
        this.updateQuantityButtons();
      });
      return button;
    });

    const generateButton = this.createIconButton(optionsList, ICON_DICE, "Generate names");
    generateButton.addClass("nameforge-modal__generate-button");
    generateButton.addEventListener("click", () => {
      void this.generateSelectedCount();
    });

    this.resultsEl = contentEl.createEl("div", { cls: "nameforge-modal__results" });
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
      setIcon(this.packDropdownIconEl, packTypeIconId(packType, compoundGenerator));
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
        cls: "nameforge-modal__pack-dropdown-empty",
        text: "No packs found",
      });
      return;
    }

    packs.forEach(({ path, packType, compoundGenerator }) => {
      const label = path.split("/").pop()?.replace(/\.md$/i, "") || path;
      const item = this.packDropdownMenuEl!.createEl("button", {
        cls: "nameforge-modal__pack-dropdown-item",
        attr: { type: "button" },
      }) as HTMLButtonElement;
      setIcon(item.createEl("span", { cls: "nameforge-modal__pack-dropdown-icon" }), packTypeIconId(packType, compoundGenerator));
      item.createEl("span", { cls: "nameforge-modal__pack-dropdown-label", text: label });
      item.addEventListener("click", () => {
        this.closePackDropdown();
        void this.loadPack(path);
      });
    });
  }

  private createIconButton(container: HTMLElement, iconId: string, title: string): HTMLButtonElement {
    const button = container.createEl("button", {
      cls: "nameforge-modal__icon-button",
      attr: { title },
    }) as HTMLButtonElement;
    setIcon(button, iconId);
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

    const normalizedFilePath = normalizePath(filePath);
    const folderPath = normalizedFilePath.includes("/")
      ? normalizedFilePath.substring(0, normalizedFilePath.lastIndexOf("/"))
      : "";
    if (folderPath && !this.app.vault.getFolderByPath(folderPath)) {
      this.setStatus(`Folder not found at ${folderPath}. Select or create it first.`);
      return;
    }

    const content = createNamesFileContent(this.plugin.settings.packName || "nameForge", names, this.currentPackType);
    try {
      const existingFile = this.app.vault.getFileByPath(normalizedFilePath);
      if (existingFile instanceof TFile) {
        await this.app.vault.modify(existingFile, content);
      } else {
        await this.app.vault.create(normalizedFilePath, content);
      }
    } catch {
      this.setStatus(`Failed to save names to ${filePath}.`);
      return;
    }
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

    const normalizedFilePath = normalizePath(filePath);
    const folderPath = normalizedFilePath.includes("/")
      ? normalizedFilePath.substring(0, normalizedFilePath.lastIndexOf("/"))
      : "";
    if (folderPath && !this.app.vault.getFolderByPath(folderPath)) {
      this.setStatus(`Folder not found at ${folderPath}. Select or create it first.`);
      return;
    }

    const content = createCompoundNamesFileContent(this.plugin.settings.packName || "nameForge", parts, generator, joining);
    try {
      const existingFile = this.app.vault.getFileByPath(normalizedFilePath);
      if (existingFile instanceof TFile) {
        await this.app.vault.modify(existingFile, content);
      } else {
        await this.app.vault.create(normalizedFilePath, content);
      }
    } catch {
      this.setStatus(`Failed to save names to ${filePath}.`);
      return;
    }
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

    const folder = this.app.vault.getFolderByPath(normalizePath(folderPath));
    if (!folder) {
      this.renderPackDropdownMenu([]);
      this.setStatus(`Folder not found at ${folderPath}.`);
      return;
    }

    const packs: { path: string; packType: NamePackType; compoundGenerator?: "breakdown" | "list" }[] = [];

    for (const child of folder.children) {
      if (!(child instanceof TFile) || child.extension !== "md") {
        continue;
      }
      try {
        const content = await this.app.vault.cachedRead(child);
        if (isValidNamePackContent(content)) {
          const parsed = parseNamesFileContent(content);
          packs.push({ path: child.path, packType: parsed.packType, compoundGenerator: parsed.compoundGenerator });
        }
      } catch {
        continue;
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
    const file = this.app.vault.getFileByPath(normalizePath(packPath));
    if (!(file instanceof TFile)) {
      this.setStatus(`Pack not found at ${packPath}.`);
      return;
    }

    let content: string;
    try {
      content = await this.app.vault.cachedRead(file);
    } catch {
      this.setStatus(`Failed to load pack ${packPath}.`);
      return;
    }

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
    const seedOverride = this.seedLocked ? parseSeedInput(this.seedInputEl?.value) : undefined;

    if (this.currentPackType === "compoundPack") {
      const result = generateCompoundNamesDetailed(this.currentCompoundParts, {
        count: this.generationCount,
        generator: this.currentCompoundGenerator,
        joining: this.currentCompoundJoining,
        faithfulness: this.plugin.settings.faithfulness,
        strictness: this.plugin.settings.strictness,
        seed: seedOverride,
      });

      if (result.names.length === 0) {
        this.renderResults([], "Select a pack with names to generate from.");
        this.setStatus("No names available to generate from.");
        return;
      }

      this.currentSeed = result.seed;
      const totalSource = this.currentCompoundParts.reduce((sum, part) => sum + part.length, 0);
      this.renderResults(result.names);
      await this.recordGenerationHistory();
      this.setStatus(`Generated ${result.names.length} name(s) from ${totalSource} source name element(s).`);
      return;
    }

    const result = generateNamesFromSource(
      this.currentNamesText,
      this.currentPackType,
      this.generationCount,
      this.plugin.settings,
      seedOverride
    );

    if (result.names.length === 0) {
      this.renderResults([], "Select a pack with names to generate from.");
      this.setStatus("No names available to generate from.");
      return;
    }

    this.currentSeed = result.seed;
    this.renderResults(result.names, undefined, result.endings);
    await this.recordGenerationHistory();
    this.setStatus(`Generated ${result.names.length} name(s) from ${extractNamesFromMarkdown(this.currentNamesText).length} source name(s).`);
  }

  /**
   * Appends the just-used seed to the config file's generation history,
   * most-recent first, capped at MAX_HISTORY_ENTRIES.
   */
  private async recordGenerationHistory() {
    if (this.currentSeed === null) return;
    const entry: GenerationHistoryEntry = {
      packName: this.plugin.settings.packName || "nameForge",
      timestamp: formatHistoryTimestamp(new Date()),
      seed: this.currentSeed,
    };
    this.plugin.settings.previousGenerations = [
      entry,
      ...(this.plugin.settings.previousGenerations ?? []),
    ].slice(0, MAX_HISTORY_ENTRIES);
    await this.plugin.saveSettings();
  }

  private async copySeedToClipboard() {
    const value = this.seedInputEl?.value?.trim();
    if (!value) {
      this.setStatus("No seed to copy yet.");
      return;
    }
    await navigator.clipboard.writeText(value);
    this.setStatus(`Copied seed ${value}.`);
  }

  private updateSeedLockButton() {
    if (!this.seedLockButton) return;
    this.seedLockButton.classList.toggle("is-active", this.seedLocked);
    this.seedLockButton.setAttribute("aria-pressed", String(this.seedLocked));
    this.seedLockButton.setAttribute(
      "title",
      this.seedLocked ? "Seed locked — Generate will reuse it" : "Seed unlocked — Generate will randomize"
    );
  }

  private buildSeedControls(container: HTMLElement) {
    this.seedInputEl = container.createEl("input", {
      cls: "nameforge-modal__seed-input",
      attr: {
        type: "text",
        placeholder: "Seed",
        title: "Seed used for the last generation. Lock it, then Generate again to reproduce that batch.",
      },
    }) as HTMLInputElement;
    this.seedInputEl.value = this.currentSeed !== null ? String(this.currentSeed) : "";

    this.seedLockButton = container.createEl("button", {
      cls: "nameforge-modal__icon-button",
      attr: { type: "button", "aria-pressed": String(this.seedLocked) },
    }) as HTMLButtonElement;
    setIcon(this.seedLockButton, ICON_SEED_LOCK);
    this.seedLockButton.addEventListener("click", () => {
      this.seedLocked = !this.seedLocked;
      this.updateSeedLockButton();
    });
    this.updateSeedLockButton();

    const copyButton = container.createEl("button", {
      cls: "nameforge-modal__icon-button",
      attr: { type: "button", title: "Copy seed" },
    }) as HTMLButtonElement;
    setIcon(copyButton, ICON_SEED_COPY);
    copyButton.addEventListener("click", () => {
      void this.copySeedToClipboard();
    });
  }

  private renderResults(names: string[], placeholderMessage?: string, endings?: PlaceEnding[]) {
    if (!this.resultsEl) {
      return;
    }

    this.resultsEl.empty();

    if (endings && endings.length > 0) {
      const endingsRow = this.resultsEl.createEl("div", { cls: "nameforge-modal__endings-row" });
      endings.forEach((ending) => {
        const label = ending.suffix === "" ? "(none)" : `-${ending.suffix}`;
        endingsRow.createEl("span", {
          cls: "nameforge-modal__ending-chip",
          text: `${label} (${ending.count})`,
        });
      });
    }

    const list = this.resultsEl.createEl("ul", { cls: "nameforge-modal__results-list" });

    const actions = this.resultsEl.createEl("div", { cls: "nameforge-modal__results-actions" });

    const seedGroup = actions.createEl("div", { cls: "nameforge-modal__seed-group" });
    this.buildSeedControls(seedGroup);

    const buttonsGroup = actions.createEl("div", { cls: "nameforge-modal__results-buttons" });
    const insertButton = buttonsGroup.createEl("button", { cls: "nameforge-modal__text-button", attr: { title: "Insert" } }) as HTMLButtonElement;
    setIcon(insertButton, ICON_TEXT_INSERT);
    const checklistButton = buttonsGroup.createEl("button", { cls: "nameforge-modal__text-button", attr: { title: "Insert checklist" } }) as HTMLButtonElement;
    setIcon(checklistButton, ICON_CHECKLIST_INSERT);
    const bulletButton = buttonsGroup.createEl("button", { cls: "nameforge-modal__text-button", attr: { title: "Insert bullet list" } }) as HTMLButtonElement;
    setIcon(bulletButton, ICON_BULLET_INSERT);

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
      list.createEl("li", { cls: "nameforge-modal__placeholder", text: placeholderMessage });
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
    contentEl.addClass("nameforge-create-folder-modal");

    contentEl.createEl("h2", { text: "Create new folder" });
    contentEl.createEl("p", {
      text: `Create a folder inside the vault root${this.parentFolder.path === "/" ? "" : ` under ${this.parentFolder.path}`}.`,
    });

    const row = contentEl.createEl("div", { cls: "nameforge-modal__pack-name-row" });
    row.createEl("label", { text: "Folder path" });
    this.inputEl = row.createEl("input", {
      cls: "nameforge-modal__pack-name-input",
      attr: {
        type: "text",
        placeholder: "namepacks",
        value: "namepacks",
      },
    }) as HTMLInputElement;

    const controls = contentEl.createEl("div", { cls: "nameforge-modal__controls" });
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
    contentEl.addClass("nameforge-folder-picker-modal");

    contentEl.createEl("h2", { text: "Choose a folder" });
    contentEl.createEl("p", {
      text: "Select an existing folder or create a new one inside the current location.",
    });

    const currentPath = contentEl.createEl("div", {
      cls: "nameforge-modal__folder-label",
      text: `Current folder: ${this.currentFolder.path === "/" ? "Vault root" : this.currentFolder.path}`,
    });

    const controls = contentEl.createEl("div", { cls: "nameforge-modal__controls" });
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

    const listContainer = contentEl.createEl("div", { cls: "nameforge-modal__pack-list" });
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

const NAME_TEXTAREA_PLACEHOLDER =
  "Paste names as CSV or one per line; or a mix of both. nameForge tidies them up.\n\nKeelin\nOsbert\nBrynn\nMarusa\n\nor\n\nKeelin, Osbert, Brynn, Marusa";
const PLACE_TEXTAREA_PLACEHOLDER =
  "Paste names as CSV or one per line; or a mix of both. nameForge tidies them up.\n\nThael\nBehem\nPresburg\nKelheim\n\nor\n\nThael, Behem, Presburg, Kelheim";

class NameForgeEditorModal extends Modal {
  private parent: NameForgeModal;
  private inputEl: HTMLTextAreaElement | null = null;
  private packNameInput: HTMLInputElement | null = null;
  private breakdownButton: HTMLButtonElement | null = null;
  private listButton: HTMLButtonElement | null = null;
  private compoundButton: HTMLButtonElement | null = null;
  private placeButton: HTMLButtonElement | null = null;
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

  constructor(app: App, parent: NameForgeModal, initialText: string, initialPackName: string) {
    super(app);
    this.parent = parent;
    this.initialText = initialText;
    this.initialPackName = initialPackName;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("nameforge-editor-modal");

    const packNameRow = contentEl.createEl("div", { cls: "nameforge-modal__pack-name-row" });
    packNameRow.createEl("label", { text: "Pack Name" });
    this.packNameInput = packNameRow.createEl("input", {
      cls: "nameforge-modal__pack-name-input",
      attr: {
        type: "text",
        placeholder: "nameForge Pack",
        value: this.initialPackName,
      },
    }) as HTMLInputElement;
    this.packNameInput.value = this.initialPackName;

    const typeToggle = contentEl.createEl("div", { cls: "nameforge-modal__toggle-panel nameforge-modal__pack-type-toggle" });
    this.breakdownButton = typeToggle.createEl("button", {
      cls: "nameforge-modal__toggle-button is-active",
      text: "Breakdown",
    }) as HTMLButtonElement;
    this.breakdownButton.addEventListener("click", () => {
      this.setPackType("breakdownPack");
    });

    this.listButton = typeToggle.createEl("button", {
      cls: "nameforge-modal__toggle-button",
      text: "List",
    }) as HTMLButtonElement;
    this.listButton.addEventListener("click", () => {
      this.setPackType("listPack");
    });

    this.compoundButton = typeToggle.createEl("button", {
      cls: "nameforge-modal__toggle-button",
      text: "Compound",
    }) as HTMLButtonElement;
    this.compoundButton.addEventListener("click", () => {
      this.setPackType("compoundPack");
    });

    this.placeButton = typeToggle.createEl("button", {
      cls: "nameforge-modal__toggle-button",
      text: "Place",
    }) as HTMLButtonElement;
    this.placeButton.addEventListener("click", () => {
      this.setPackType("placePack");
    });

    // Fixed-height stage: the plain textarea and the compound section
    // (options row + up to 3 part textareas) are both absolutely positioned
    // to fill it and shown/hidden as alternates, so neither one can ever
    // affect the stage's own box size — the stage's height is a hard
    // constant no matter which pack type is active. If the active content
    // (e.g. a 3-part compound) is taller than the stage, only that pane
    // scrolls internally. Save/cancel sit below the stage in normal flow,
    // always visible, never needing to be scrolled to.
    const stage = contentEl.createEl("div", { cls: "nameforge-editor-modal__stage" });

    this.inputEl = stage.createEl("textarea", {
      cls: "nameforge-modal__textarea nameforge-editor-modal__stage-pane",
      attr: {
        placeholder: NAME_TEXTAREA_PLACEHOLDER,
        rows: "12",
      },
    });
    this.inputEl.value = this.initialText;

    this.buildCompoundSection(stage);

    this.selectedPackType = this.parent.currentPackType;
    this.updateTypeButtons();
    this.updateCompoundControls();

    const controls = contentEl.createEl("div", { cls: "nameforge-modal__controls" });
    const saveButton = controls.createEl("button", { cls: "nameforge-modal__text-button", attr: { title: "Save names" } }) as HTMLButtonElement;
    setIcon(saveButton, ICON_SAVE);
    saveButton.addEventListener("click", () => {
      void this.saveNames();
    });

    const cancelButton = controls.createEl("button", { cls: "nameforge-modal__text-button", attr: { title: "Cancel" } }) as HTMLButtonElement;
    setIcon(cancelButton, ICON_CANCEL);
    cancelButton.addEventListener("click", () => this.close());
  }

  private buildCompoundSection(container: HTMLElement) {
    this.compoundSectionEl = container.createEl("div", {
      cls: "nameforge-modal__compound-section nameforge-editor-modal__stage-pane",
    });

    const optionsRow = this.compoundSectionEl.createEl("div", { cls: "nameforge-modal__compound-options-row" });

    const partsColumn = optionsRow.createEl("div", { cls: "nameforge-modal__compound-option-column" });
    const partsToggle = partsColumn.createEl("div", { cls: "nameforge-modal__toggle-panel" });
    this.twoPartsButton = partsToggle.createEl("button", { cls: "nameforge-modal__toggle-button", text: "2 parts" }) as HTMLButtonElement;
    this.twoPartsButton.addEventListener("click", () => this.setCompoundParts(2));
    this.threePartsButton = partsToggle.createEl("button", { cls: "nameforge-modal__toggle-button", text: "3 parts" }) as HTMLButtonElement;
    this.threePartsButton.addEventListener("click", () => this.setCompoundParts(3));
    this.partsExampleEl = partsColumn.createEl("div", { cls: "nameforge-modal__compound-example" });

    const generatorColumn = optionsRow.createEl("div", { cls: "nameforge-modal__compound-option-column" });
    const generatorToggle = generatorColumn.createEl("div", { cls: "nameforge-modal__toggle-panel" });
    this.compoundBreakdownButton = generatorToggle.createEl("button", { cls: "nameforge-modal__toggle-button", text: "Breakdown" }) as HTMLButtonElement;
    this.compoundBreakdownButton.addEventListener("click", () => this.setCompoundGenerator("breakdown"));
    this.compoundListButton = generatorToggle.createEl("button", { cls: "nameforge-modal__toggle-button", text: "List" }) as HTMLButtonElement;
    this.compoundListButton.addEventListener("click", () => this.setCompoundGenerator("list"));

    const joiningColumn = optionsRow.createEl("div", { cls: "nameforge-modal__compound-option-column" });
    const joiningToggle = joiningColumn.createEl("div", { cls: "nameforge-modal__toggle-panel" });
    this.joinedButton = joiningToggle.createEl("button", { cls: "nameforge-modal__toggle-button", text: "Joined" }) as HTMLButtonElement;
    this.joinedButton.addEventListener("click", () => this.setCompoundJoining("joined"));
    this.spacedButton = joiningToggle.createEl("button", { cls: "nameforge-modal__toggle-button", text: "Spaced" }) as HTMLButtonElement;
    this.spacedButton.addEventListener("click", () => this.setCompoundJoining("spaced"));
    this.joiningExampleEl = joiningColumn.createEl("div", { cls: "nameforge-modal__compound-example" });

    const partBoxesEl = this.compoundSectionEl.createEl("div", { cls: "nameforge-modal__part-boxes" });
    for (let i = 0; i < 3; i++) {
      const wrapper = partBoxesEl.createEl("div", { cls: "nameforge-modal__part-box" });
      wrapper.createEl("label", { cls: "nameforge-modal__part-label", text: `Part ${i + 1}` });
      const textarea = wrapper.createEl("textarea", {
        cls: "nameforge-modal__textarea",
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
    const isPlace = this.selectedPackType === "placePack";
    this.breakdownButton?.classList.toggle("is-active", isBreakdown);
    this.listButton?.classList.toggle("is-active", isList);
    this.compoundButton?.classList.toggle("is-active", isCompound);
    this.placeButton?.classList.toggle("is-active", isPlace);
    this.breakdownButton?.setAttribute("aria-pressed", String(isBreakdown));
    this.listButton?.setAttribute("aria-pressed", String(isList));
    this.compoundButton?.setAttribute("aria-pressed", String(isCompound));
    this.placeButton?.setAttribute("aria-pressed", String(isPlace));

    if (this.inputEl) {
      this.inputEl.placeholder = isPlace ? PLACE_TEXTAREA_PLACEHOLDER : NAME_TEXTAREA_PLACEHOLDER;
    }

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
    const packName = this.packNameInput?.value?.trim() || "nameForge";

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