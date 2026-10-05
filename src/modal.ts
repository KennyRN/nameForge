import { App, Editor, Modal, normalizePath, setIcon, TFile, TFolder } from "obsidian";
import {
  generateCompoundNamesDetailed,
  generateMixNamesDetailed,
  ListGenerator,
  MarkovModel,
  PlaceNameModel,
  PlaceEnding,
  extractNamesFromMarkdown,
  mulberry32,
} from "./markov";
import {
  createCompoundNamesFileContent,
  createMixNamesFileContent,
  createNamesFileContent,
  isValidNamePackContent,
  MixPackIndexEntry,
  MixSourceRef,
  parseNamesFileContent,
  resolveMixSources,
  sanitizePackNameForFilename,
} from "./nameParser";
import {
  ICON_BREAKDOWN_PACK,
  ICON_PACKS,
  ICON_BULLET_INSERT,
  ICON_CANCEL,
  ICON_CHECKLIST_INSERT,
  ICON_COMPOUND_BREAKDOWN_PACK,
  ICON_COMPOUND_LIST_PACK,
  ICON_CREATE_PACKS,
  ICON_PREVIOUS_GENERATIONS,
  ICON_DICE,
  ICON_LIST_PACK,
  ICON_MIX_PACK,
  ICON_PLACE_PACK,
  ICON_PLACE_SHAPES,
  ICON_PLUS_SQUARE,
  ICON_SAVE,
  ICON_SEED_COPY,
  ICON_SEED_LOCK,
  ICON_TEXT_INSERT,
} from "./icons";
import { EnterFolderPathModal } from "./folderModal";
import {
  generatePlaceShapesDetailed,
  PLACE_SHAPE_REGIONS,
  PLACE_SHAPES_HISTORY_NAME,
  placeShapesHistoryLabel,
} from "./placeShapes";
import { DEFAULT_NAMES_FOLDER, ensureVaultFolder, resolveNamesFolderPath } from "./paths";

type NamePackType = "breakdownPack" | "listPack" | "compoundPack" | "placePack" | "mixPack";

/** The sections reachable from the binder icon's switcher menu (renderSectionMenu) — mirrors
 * titleForge's own section switcher. "markov" is today's whole pack-driven generator and the
 * default on every open; "placeShapes" runs the built-in shape generator (placeShapes.ts);
 * "explorationPlaceShapes" is still a placeholder. */
type NameForgeSection = "markov" | "placeShapes" | "explorationPlaceShapes";

const SECTION_ORDER: NameForgeSection[] = ["markov", "placeShapes", "explorationPlaceShapes"];

// Section names are deliberately lowercase, matching titleForge's section-switcher menu.
const SECTION_LABELS: Record<NameForgeSection, string> = {
  markov: "markov generator",
  placeShapes: "place name shapes",
  explorationPlaceShapes: "exploration place name shapes",
};

// The exploration section keeps the binder glyph until it gets its own.
const SECTION_ICONS: Record<NameForgeSection, string> = {
  markov: ICON_PACKS,
  placeShapes: ICON_PLACE_SHAPES,
  explorationPlaceShapes: ICON_PACKS,
};

function packTypeIconId(packType: NamePackType, subGenerator?: "breakdown" | "list"): string {
  if (packType === "compoundPack") {
    return subGenerator === "list" ? ICON_COMPOUND_LIST_PACK : ICON_COMPOUND_BREAKDOWN_PACK;
  }
  if (packType === "mixPack") {
    return ICON_MIX_PACK;
  }
  if (packType === "placePack") {
    return ICON_PLACE_PACK;
  }
  return packType === "listPack" ? ICON_LIST_PACK : ICON_BREAKDOWN_PACK;
}

function packSubGenerator(packType: NamePackType, compoundGenerator?: "breakdown" | "list"): "breakdown" | "list" | undefined {
  if (packType === "compoundPack") return compoundGenerator;
  return undefined;
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
  count?: number;
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
  /** Never persisted — every open starts on the markov generator. */
  private activeSection: NameForgeSection = "markov";
  private sectionTriggerEl: HTMLElement | null = null;
  private sectionMenuEl: HTMLElement | null = null;
  private isSectionMenuOpen = false;
  /** The pack box shown in place of the markov pack dropdown while a placeholder section is
   * active — the only thing a section switch changes. */
  private sectionStubEl: HTMLElement | null = null;
  private sectionStubLabelEl: HTMLElement | null = null;
  /** The region dropdown shown beside the trigger in the place-shapes section. */
  private regionDropdownEl: HTMLElement | null = null;
  private regionTriggerEl: HTMLButtonElement | null = null;
  private regionLabelEl: HTMLElement | null = null;
  private regionMenuEl: HTMLElement | null = null;
  private isRegionMenuOpen = false;
  /** Region code, or undefined for All Britain. Session only — never persisted. */
  private selectedRegion: string | undefined = undefined;
  private quantityButtons: HTMLButtonElement[] = [];
  private clearResultsSelection: () => void = () => {};
  private currentNamesText = "";
  public currentPackType: NamePackType = "breakdownPack";
  private currentCompoundParts: string[][] = [];
  private currentCompoundGenerator: "breakdown" | "list" = "breakdown";
  private currentCompoundJoining: "joined" | "spaced" = "joined";
  private currentMixSources: MixSourceRef[] = [];
  private generationCount = 25;
  private currentSeed: number | null = null;
  private seedLocked = false;
  private seedInputEl: HTMLInputElement | null = null;
  private seedLockButton: HTMLButtonElement | null = null;
  /** True when mounted into a host panel (Forge) rather than opened as a Modal. */
  private panelMode = false;
  private rootEl: HTMLElement | null = null;

  constructor(app: App, plugin: NameForgePluginLike, settings: NameForgeSettings = {}) {
    super(app);
    this.plugin = plugin;
    this.plugin.settings = { ...this.plugin.settings, ...settings };
  }

  /**
   * Mount the nameForge UI into a host container (storyForge Forge panel).
   * No Modal chrome / overlay — returns a disposer for the host.
   */
  static mountPanel(containerEl: HTMLElement, app: App, plugin: NameForgePluginLike): () => void {
    const ui = new NameForgeModal(app, plugin);
    ui.panelMode = true;
    ui.mount(containerEl);
    return () => ui.unmount();
  }

  onOpen() {
    this.mount(this.contentEl);
  }

  onClose() {
    this.unmount();
  }

  private mount(root: HTMLElement) {
    this.rootEl = root;
    root.empty();
    root.addClass("nameforge-modal");
    if (this.panelMode) {
      root.addClass("nameforge-modal--panel");
    }

    const optionsList = root.createDiv({ cls: "nameforge-modal__options-list" });

    const createPacksRow = optionsList.createDiv({ cls: "nameforge-modal__option-row" });
    // The binder icon doubles as the section switcher's trigger, as in titleForge.
    const sectionTrigger = createPacksRow.createSpan({
      cls: "nameforge-modal__icon-decoration nameforge-modal__icon-decoration--lg nameforge-modal__icon-decoration--clickable",
      attr: { role: "button", tabindex: "0", "aria-label": "change section", title: "change section", "aria-expanded": "false" },
    });
    setIcon(sectionTrigger, SECTION_ICONS[this.activeSection]);
    sectionTrigger.addEventListener("click", () => this.toggleSectionMenu());
    sectionTrigger.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        this.toggleSectionMenu();
      }
    });
    this.sectionTriggerEl = sectionTrigger;
    this.packDropdownEl = createPacksRow.createDiv({ cls: "nameforge-modal__pack-dropdown" });
    this.packDropdownTrigger = this.packDropdownEl.createEl("button", {
      cls: "nameforge-modal__pack-dropdown-trigger",
      attr: { type: "button", "aria-haspopup": "listbox", "aria-expanded": "false" },
    });
    this.packDropdownIconEl = this.packDropdownTrigger.createSpan({ cls: "nameforge-modal__pack-dropdown-icon" });
    this.packDropdownLabelEl = this.packDropdownTrigger.createSpan({
      cls: "nameforge-modal__pack-dropdown-label",
      text: "No packs found",
    });
    this.packDropdownTrigger.addEventListener("click", (evt) => {
      evt.stopPropagation();
      void this.togglePackDropdown();
    });

    this.packDropdownMenuEl = this.packDropdownEl.createDiv({ cls: "nameforge-modal__pack-dropdown-menu" });
    this.packDropdownMenuEl.hide();

    // The place-shapes section's region picker — the pack dropdown's own box and menu.
    this.regionDropdownEl = createPacksRow.createDiv({ cls: "nameforge-modal__pack-dropdown" });
    this.regionTriggerEl = this.regionDropdownEl.createEl("button", {
      cls: "nameforge-modal__pack-dropdown-trigger",
      attr: { type: "button", "aria-haspopup": "listbox", "aria-expanded": "false" },
    });
    this.regionLabelEl = this.regionTriggerEl.createSpan({ cls: "nameforge-modal__pack-dropdown-label" });
    this.regionTriggerEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.setRegionMenuOpen(!this.isRegionMenuOpen);
    });
    this.regionMenuEl = this.regionDropdownEl.createDiv({ cls: "nameforge-modal__pack-dropdown-menu" });
    this.regionMenuEl.hide();
    this.regionDropdownEl.hide();
    this.updateRegionLabel();

    // Stands in for the pack dropdown while a placeholder section is active — same box, no packs yet.
    this.sectionStubEl = createPacksRow.createDiv({ cls: "nameforge-modal__pack-dropdown nameforge-modal__section-stub" });
    const stubTrigger = this.sectionStubEl.createEl("button", {
      cls: "nameforge-modal__pack-dropdown-trigger",
      attr: { type: "button", "aria-disabled": "true" },
    });
    setIcon(stubTrigger.createSpan({ cls: "nameforge-modal__pack-dropdown-icon" }), ICON_PACKS);
    this.sectionStubLabelEl = stubTrigger.createSpan({ cls: "nameforge-modal__pack-dropdown-label" });
    this.sectionStubEl.hide();

    activeDocument.addEventListener("click", this.handlePackDropdownOutsideClick);
    if (!this.panelMode) {
      const createPacksButton = createPacksRow.createEl("button", {
        cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
        attr: { type: "button", title: "Create name packs" },
      });
      setIcon(createPacksButton, ICON_CREATE_PACKS);
      createPacksButton.addEventListener("click", () => {
        new NameForgeEditorModal(this.app, this, "", "").open();
      });
    }

    // A plain flow block under the pack row, not a floating overlay — same as titleForge's.
    this.sectionMenuEl = optionsList.createDiv({ cls: "nameforge-modal__section-menu" });
    this.sectionMenuEl.hide();

    const quantityToggle = optionsList.createDiv({ cls: "nameforge-modal__toggle-panel nameforge-modal__quantity-toggle" });
    this.quantityButtons = [10, 15, 25, 50, 100].map((value) => {
      const button = quantityToggle.createEl("button", {
        cls: "nameforge-modal__toggle-button" + (value === this.generationCount ? " is-active" : ""),
        text: String(value),
      });
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

    this.resultsEl = root.createDiv({ cls: "nameforge-modal__results" });
    this.statusEl = root.createDiv({ cls: "nameforge-modal__status" });
    this.renderResults([]);

    void this.refreshPackDropdown();
  }

  private toggleSectionMenu() {
    this.setSectionMenuOpen(!this.isSectionMenuOpen);
  }

  /** Opens/closes the section switcher. While open, the results box gives up exactly the height
   * the menu adds (measured, so gaps/margins in modal vs panel mode are included) via
   * --nf-section-menu-height, so the modal itself doesn't grow. */
  private setSectionMenuOpen(open: boolean) {
    const menu = this.sectionMenuEl;
    if (!menu) return;
    this.isSectionMenuOpen = open;
    const optionsList = menu.parentElement;
    const before = optionsList?.offsetHeight ?? 0;
    if (open) {
      this.closePackDropdown();
      this.setRegionMenuOpen(false);
      this.renderSectionMenu();
    }
    menu.toggle(open);
    const added = open ? Math.max(0, (optionsList?.offsetHeight ?? 0) - before) : 0;
    this.rootEl?.style.setProperty("--nf-section-menu-height", `${added}px`);
    this.rootEl?.toggleClass("is-section-menu-open", open);
    this.sectionTriggerEl?.setAttribute("aria-expanded", String(open));
  }

  /** The section switcher, opened by clicking the binder icon — a port of titleForge's
   * renderSectionPicker. Rebuilt on each open so the active item's highlight is current. */
  private renderSectionMenu() {
    const menu = this.sectionMenuEl;
    if (!menu) return;
    menu.empty();
    for (const section of SECTION_ORDER) {
      const item = menu.createDiv({
        cls: "nameforge-modal__section-menu-item" + (section === this.activeSection ? " is-active" : ""),
        attr: { role: "button", tabindex: "0", "aria-label": SECTION_LABELS[section] },
      });
      setIcon(item.createSpan({ cls: "nameforge-modal__section-menu-icon" }), SECTION_ICONS[section]);
      item.createSpan({ text: SECTION_LABELS[section] });
      item.addEventListener("click", () => this.switchSection(section));
      item.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter" || evt.key === " ") {
          evt.preventDefault();
          this.switchSection(section);
        }
      });
    }
  }

  /** Swaps only the box beside the section trigger — the pack dropdown on "markov", the region
   * dropdown on "placeShapes", the placeholder box otherwise. Everything else is left as it is. */
  private switchSection(section: NameForgeSection) {
    this.setSectionMenuOpen(false);
    this.setRegionMenuOpen(false);
    this.activeSection = section;
    this.packDropdownEl?.toggle(section === "markov");
    this.regionDropdownEl?.toggle(section === "placeShapes");
    // The trigger wears the active section's icon, as titleForge's leading icon does.
    if (this.sectionTriggerEl) setIcon(this.sectionTriggerEl, SECTION_ICONS[section]);
    if (this.sectionStubLabelEl) this.sectionStubLabelEl.textContent = `${SECTION_LABELS[section]} — no packs yet`;
    this.sectionStubEl?.toggle(section === "explorationPlaceShapes");
  }

  private setRegionMenuOpen(open: boolean) {
    this.isRegionMenuOpen = open;
    if (open) {
      this.closePackDropdown();
      this.renderRegionMenu();
    }
    this.regionMenuEl?.toggle(open);
    this.regionTriggerEl?.setAttribute("aria-expanded", String(open));
  }

  /** All Britain first, then the regions in reference order; historic counties as tooltips. */
  private renderRegionMenu() {
    const menu = this.regionMenuEl;
    if (!menu) return;
    menu.empty();
    const options: { code: string | undefined; label: string; counties?: string }[] = [
      { code: undefined, label: "All Britain" },
      ...PLACE_SHAPE_REGIONS,
    ];
    for (const { code, label, counties } of options) {
      const item = menu.createEl("button", {
        cls: "nameforge-modal__pack-dropdown-item" + (code === this.selectedRegion ? " is-active" : ""),
        attr: { type: "button", title: counties ?? "No regional weighting" },
      });
      item.createSpan({ cls: "nameforge-modal__pack-dropdown-label", text: label });
      item.addEventListener("click", () => {
        this.selectedRegion = code;
        this.updateRegionLabel();
        this.setRegionMenuOpen(false);
      });
    }
  }

  private updateRegionLabel() {
    const region = PLACE_SHAPE_REGIONS.find((r) => r.code === this.selectedRegion);
    if (this.regionLabelEl) this.regionLabelEl.textContent = region?.label ?? "All Britain";
    this.regionTriggerEl?.setAttribute("title", region?.counties ?? "No regional weighting");
  }

  private unmount() {
    activeDocument.removeEventListener("click", this.handlePackDropdownOutsideClick);
    this.closePackDropdown();
    this.rootEl?.empty();
    this.rootEl = null;
    this.resultsEl = null;
    this.statusEl = null;
    this.packDropdownEl = null;
    this.packDropdownTrigger = null;
    this.packDropdownIconEl = null;
    this.packDropdownLabelEl = null;
    this.packDropdownMenuEl = null;
    this.sectionTriggerEl = null;
    this.sectionMenuEl = null;
    this.isSectionMenuOpen = false;
    this.sectionStubEl = null;
    this.sectionStubLabelEl = null;
    this.regionDropdownEl = null;
    this.regionTriggerEl = null;
    this.regionLabelEl = null;
    this.regionMenuEl = null;
    this.isRegionMenuOpen = false;
    this.quantityButtons = [];
    this.seedInputEl = null;
    this.seedLockButton = null;
  }

  /** Close the Modal after insert; no-op in Forge panel mode (stay mounted). */
  private dismissAfterInsert() {
    if (!this.panelMode) {
      this.close();
    }
  }

  private handlePackDropdownOutsideClick = (evt: MouseEvent) => {
    if (this.isRegionMenuOpen && this.regionDropdownEl && !this.regionDropdownEl.contains(evt.target as Node)) {
      this.setRegionMenuOpen(false);
    }
    if (this.isPackDropdownOpen && this.packDropdownEl && !this.packDropdownEl.contains(evt.target as Node)) {
      this.closePackDropdown();
    }
  };

  private async togglePackDropdown() {
    if (this.isPackDropdownOpen) {
      this.closePackDropdown();
    } else {
      await this.refreshPackDropdown({ preserveSelection: true });
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

  private updatePackDropdownTrigger(packPath: string, packType: NamePackType, subGenerator?: "breakdown" | "list") {
    if (this.packDropdownIconEl) {
      setIcon(this.packDropdownIconEl, packTypeIconId(packType, subGenerator));
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
      this.packDropdownMenuEl.createDiv({
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
      });
      setIcon(
        item.createSpan({ cls: "nameforge-modal__pack-dropdown-icon" }),
        packTypeIconId(packType, packSubGenerator(packType, compoundGenerator))
      );
      item.createSpan({ cls: "nameforge-modal__pack-dropdown-label", text: label });
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
    });
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
    return resolveNamesFolderPath(this.plugin.settings.folderPath, this.plugin.settings.namesFilePath);
  }

  private getResolvedFilePath(): string | null {
    const configured = this.plugin.settings.namesFilePath?.trim();
    if (configured?.toLowerCase().endsWith(".md")) {
      return configured;
    }

    const folderPath = this.getFolderPath();
    if (!folderPath) {
      return null;
    }

    return `${folderPath.replace(/\/$/, "")}/names.md`;
  }

  public async promptForFolderSelection(): Promise<TFolder | null> {
    return new Promise((resolve) => {
      let settled = false;
      const modal = new EnterFolderPathModal(this.app, this.getFolderPath(), (folder) => {
        settled = true;
        resolve(folder);
      });
      const originalClose = modal.close.bind(modal);
      modal.close = () => {
        originalClose();
        if (!settled) {
          resolve(null);
        }
      };
      modal.open();
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
    this.setStatus("");
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
    this.setStatus("");
  }

  public async saveMixToConfiguredFile(sources: MixSourceRef[]) {
    const filePath = this.getResolvedFilePath();
    if (!filePath) {
      this.setStatus("No folder set for name packs. Set one first.");
      return;
    }

    if (sources.length < 2) {
      this.setStatus("A mix pack needs at least two source packs.");
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

    const content = createMixNamesFileContent(this.plugin.settings.packName || "nameForge", sources);
    try {
      const existingFile = this.app.vault.getFileByPath(normalizedFilePath);
      if (existingFile instanceof TFile) {
        await this.app.vault.modify(existingFile, content);
      } else {
        await this.app.vault.create(normalizedFilePath, content);
      }
    } catch {
      this.setStatus(`Failed to save mix pack to ${filePath}.`);
      return;
    }
    this.currentMixSources = sources;
    this.setStatus("");
  }

  private async refreshPackDropdown(options: { preserveSelection?: boolean } = {}) {
    if (!this.packDropdownMenuEl) {
      return;
    }

    const folderPath = this.getFolderPath();
    if (!folderPath) {
      this.renderPackDropdownMenu([]);
      this.setStatus("Set a folder to store name packs before browsing them.");
      return;
    }

    let folder = this.app.vault.getFolderByPath(normalizePath(folderPath));
    if (!folder) {
      try {
        folder = await ensureVaultFolder(this.app, folderPath);
      } catch {
        folder = null;
      }
    }
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
          packs.push({
            path: child.path,
            packType: parsed.packType,
            compoundGenerator: parsed.compoundGenerator,
          });
        }
      } catch {
        continue;
      }
    }

    packs.sort((a, b) => a.path.localeCompare(b.path));
    this.renderPackDropdownMenu(packs);

    if (packs.length === 0) {
      return;
    }

    const paths = packs.map((pack) => pack.path);
    const lastUsed = this.plugin.settings.namesFilePath;
    const defaultPack = lastUsed && paths.includes(lastUsed) ? lastUsed : paths[0];

    if (options.preserveSelection && lastUsed && paths.includes(lastUsed)) {
      const selected = packs.find((pack) => pack.path === lastUsed);
      if (selected) {
        this.updatePackDropdownTrigger(
          selected.path,
          selected.packType,
          packSubGenerator(selected.packType, selected.compoundGenerator)
        );
      }
      return;
    }

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
      this.currentMixSources = [];
      this.currentNamesText = "";
    } else if (parsed.packType === "mixPack") {
      this.currentMixSources = parsed.mixSources ?? [];
      this.currentCompoundParts = [];
      this.currentNamesText = "";
    } else {
      this.currentNamesText = parsed.names.join("\n");
      this.currentMixSources = [];
      this.currentCompoundParts = [];
    }
    this.plugin.settings.namesFilePath = packPath;
    this.plugin.settings.folderPath = this.getFolderPath() || DEFAULT_NAMES_FOLDER;
    await this.plugin.saveSettings();
    this.updatePackDropdownTrigger(
      packPath,
      parsed.packType,
      packSubGenerator(parsed.packType, parsed.compoundGenerator)
    );
    this.setStatus("");
  }

  private async generateSelectedCount() {
    if (this.activeSection === "placeShapes") {
      const seedOverride = this.seedLocked ? parseSeedInput(this.seedInputEl?.value) : undefined;
      const result = generatePlaceShapesDetailed({
        count: this.generationCount,
        seed: seedOverride,
        region: this.selectedRegion,
      });
      this.currentSeed = result.seed;
      this.renderResults(result.names);
      await this.recordGenerationHistory(result.names.length, placeShapesHistoryLabel(this.selectedRegion));
      this.setStatus("");
      return;
    }
    if (this.activeSection !== "markov") {
      // Placeholder sections have no packs yet — leave the current results untouched.
      this.setStatus(`${SECTION_LABELS[this.activeSection]} has no packs yet.`);
      return;
    }
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
      this.renderResults(result.names);
      await this.recordGenerationHistory(result.names.length);
      this.setStatus("");
      return;
    }

    if (this.currentPackType === "mixPack") {
      const mixPath = this.plugin.settings.namesFilePath;
      if (!mixPath) {
        this.renderResults([], "Select a mix pack to generate from.");
        this.setStatus("No mix pack selected.");
        return;
      }

      const index = await this.scanFolderPacks();
      const mixEntry = index.find((entry) => entry.path === normalizePath(mixPath));
      if (!mixEntry || mixEntry.parsed.packType !== "mixPack") {
        this.renderResults([], "Select a mix pack to generate from.");
        this.setStatus("Mix pack not found. Reselect it from the pack list.");
        return;
      }

      const mixData = mixEntry.parsed;
      const resolved = resolveMixSources(normalizePath(mixPath), mixData, index);

      if (resolved.error) {
        this.renderResults([], resolved.error);
        this.setStatus(resolved.error);
        return;
      }

      const result = generateMixNamesDetailed(resolved.sources, {
        count: this.generationCount,
        faithfulness: this.plugin.settings.faithfulness,
        strictness: this.plugin.settings.strictness,
        seed: seedOverride,
      });

      if (result.names.length === 0) {
        this.renderResults([], "Select a pack with names to generate from.");
        this.setStatus("No names available to generate from the mix sources.");
        return;
      }

      this.currentSeed = result.seed;
      this.renderResults(result.names);
      await this.recordGenerationHistory(result.names.length);
      this.setStatus("");
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
    this.renderResults(result.names);
    await this.recordGenerationHistory(result.names.length);
    this.setStatus("");
  }

  /**
   * Appends the just-used seed to the config file's generation history,
   * most-recent first, capped at MAX_HISTORY_ENTRIES.
   */
  private async recordGenerationHistory(count: number, packName?: string) {
    if (this.currentSeed === null) return;
    const entry: GenerationHistoryEntry = {
      packName: packName ?? (this.plugin.settings.packName || "nameForge"),
      timestamp: formatHistoryTimestamp(new Date()),
      seed: this.currentSeed,
      count,
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
    this.setStatus("");
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
    });
    this.seedInputEl.value = this.currentSeed !== null ? String(this.currentSeed) : "";

    this.seedLockButton = container.createEl("button", {
      cls: "nameforge-modal__icon-action",
      attr: { type: "button", "aria-pressed": String(this.seedLocked) },
    });
    setIcon(this.seedLockButton, ICON_SEED_LOCK);
    this.seedLockButton.addEventListener("click", () => {
      this.seedLocked = !this.seedLocked;
      this.updateSeedLockButton();
    });
    this.updateSeedLockButton();

    const copyButton = container.createEl("button", {
      cls: "nameforge-modal__icon-action",
      attr: { type: "button", title: "Copy seed" },
    });
    setIcon(copyButton, ICON_SEED_COPY);
    copyButton.addEventListener("click", () => {
      void this.copySeedToClipboard();
    });

    const historyButton = container.createEl("button", {
      cls: "nameforge-modal__icon-action",
      attr: { type: "button", title: "Previous generations" },
    });
    setIcon(historyButton, ICON_PREVIOUS_GENERATIONS);
    historyButton.addEventListener("click", () => {
      new PreviousGenerationsModal(this.app, this).open();
    });
  }

  private renderResults(names: string[], placeholderMessage?: string) {
    if (!this.resultsEl) {
      return;
    }

    this.resultsEl.empty();

    const list = this.resultsEl.createEl("ul", { cls: "nameforge-modal__results-list" });

    const actions = this.resultsEl.createDiv({ cls: "nameforge-modal__results-actions" });

    const seedGroup = actions.createDiv({ cls: "nameforge-modal__seed-group" });
    this.buildSeedControls(seedGroup);

    const buttonsGroup = actions.createDiv({ cls: "nameforge-modal__results-buttons" });
    const insertButton = buttonsGroup.createEl("button", {
      cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
      attr: { type: "button", title: "Insert" },
    });
    setIcon(insertButton, ICON_TEXT_INSERT);
    const checklistButton = buttonsGroup.createEl("button", {
      cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
      attr: { type: "button", title: "Insert checklist" },
    });
    setIcon(checklistButton, ICON_CHECKLIST_INSERT);
    const bulletButton = buttonsGroup.createEl("button", {
      cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
      attr: { type: "button", title: "Insert bullet list" },
    });
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

    if (this.panelMode) {
      const createPack = this.resultsEl.createEl("button", {
        cls: "nameforge-modal__panel-action",
        attr: { type: "button" },
      });
      setIcon(createPack.createSpan({ cls: "nameforge-modal__panel-action-icon" }), ICON_CREATE_PACKS);
      createPack.createSpan({
        cls: "nameforge-modal__panel-action-label",
        text: "create name pack",
      });
      createPack.addEventListener("click", () => {
        new NameForgeEditorModal(this.app, this, "", "").open();
      });

      const previousGenerations = this.resultsEl.createEl("button", {
        cls: "nameforge-modal__panel-action",
        attr: { type: "button" },
      });
      setIcon(
        previousGenerations.createSpan({ cls: "nameforge-modal__panel-action-icon" }),
        ICON_PREVIOUS_GENERATIONS,
      );
      previousGenerations.createSpan({
        cls: "nameforge-modal__panel-action-label",
        text: "previous generations",
      });
      previousGenerations.addEventListener("click", () => {
        new PreviousGenerationsModal(this.app, this).open();
      });
    }

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
    this.dismissAfterInsert();
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
    this.setStatus("");
    this.clearResultsSelection();
  }

  public setStatus(message: string) {
    if (this.statusEl) {
      this.statusEl.textContent = message;
    }
  }

  /** Map packName → selector-style icon id from packs currently in the folder. */
  public async buildPackIconByName(): Promise<Map<string, string>> {
    const iconsByName = new Map<string, string>();
    const folderPath = this.getFolderPath();
    if (!folderPath) return iconsByName;

    const folder = this.app.vault.getFolderByPath(normalizePath(folderPath));
    if (!folder) return iconsByName;

    for (const child of folder.children) {
      if (!(child instanceof TFile) || child.extension !== "md") continue;
      try {
        const content = await this.app.vault.cachedRead(child);
        if (!isValidNamePackContent(content)) continue;
        const parsed = parseNamesFileContent(content);
        if (!parsed.packName) continue;
        iconsByName.set(
          parsed.packName,
          packTypeIconId(parsed.packType, packSubGenerator(parsed.packType, parsed.compoundGenerator)),
        );
      } catch {
        continue;
      }
    }

    return iconsByName;
  }

  public async scanFolderPacks(): Promise<MixPackIndexEntry[]> {
    const index: MixPackIndexEntry[] = [];
    const folderPath = this.getFolderPath();
    if (!folderPath) return index;

    const folder = this.app.vault.getFolderByPath(normalizePath(folderPath));
    if (!folder) return index;

    for (const child of folder.children) {
      if (!(child instanceof TFile) || child.extension !== "md") continue;
      try {
        const content = await this.app.vault.cachedRead(child);
        if (!isValidNamePackContent(content)) continue;
        index.push({ path: child.path, parsed: parseNamesFileContent(content) });
      } catch {
        continue;
      }
    }

    return index;
  }

  public async listFolderPacks(): Promise<{
    path: string;
    packName: string;
    packType: NamePackType;
    compoundGenerator?: "breakdown" | "list";
  }[]> {
    const index = await this.scanFolderPacks();
    return index.map((entry) => ({
      path: entry.path,
      packName: entry.parsed.packName || entry.path.split("/").pop()?.replace(/\.md$/i, "") || entry.path,
      packType: entry.parsed.packType,
      compoundGenerator: entry.parsed.compoundGenerator,
    }));
  }
}

/** Headerless list of prior generations (Forge panel only). */
class PreviousGenerationsModal extends Modal {
  constructor(
    app: App,
    private parent: NameForgeModal,
  ) {
    super(app);
  }

  onOpen() {
    this.titleEl.empty();
    this.titleEl.hide();
    this.modalEl.addClass("nameforge-history-modal");

    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("nameforge-history-modal__content");

    void this.renderList(contentEl);
  }

  onClose() {
    this.contentEl.empty();
  }

  private async renderList(container: HTMLElement) {
    const history = this.parent.plugin.settings.previousGenerations ?? [];
    if (history.length === 0) {
      container.createDiv({
        cls: "nameforge-history-modal__empty",
        text: "No previous generations yet.",
      });
      return;
    }

    const iconsByName = await this.parent.buildPackIconByName();
    const list = container.createDiv({ cls: "nameforge-history-modal__list" });

    for (const entry of history) {
      const row = list.createDiv({ cls: "nameforge-history-modal__row" });
      const iconEl = row.createSpan({ cls: "nameforge-history-modal__pack-icon" });
      setIcon(
        iconEl,
        entry.packName.startsWith(PLACE_SHAPES_HISTORY_NAME)
          ? SECTION_ICONS.placeShapes
          : iconsByName.get(entry.packName) ?? ICON_BREAKDOWN_PACK,
      );
      row.createSpan({
        cls: "nameforge-history-modal__pack-name",
        text: entry.packName || "nameForge",
      });
      row.createSpan({
        cls: "nameforge-history-modal__seed",
        text: String(entry.seed),
      });
      const copyButton = row.createEl("button", {
        cls: "nameforge-history-modal__copy",
        attr: { type: "button", title: "Copy seed" },
      });
      setIcon(copyButton, ICON_SEED_COPY);
      copyButton.addEventListener("click", (event) => {
        event.stopPropagation();
        void navigator.clipboard.writeText(String(entry.seed));
      });
    }
  }
}

const NAME_TEXTAREA_PLACEHOLDER =
  "Paste names as CSV, one per line, or space-separated; or a mix. nameForge tidies them up.\n\nKeelin\nOsbert\nBrynn\nMarusa\n\nor\n\nKeelin, Osbert, Brynn, Marusa\n\nor\n\nKeelin Osbert Brynn Marusa";
const PLACE_TEXTAREA_PLACEHOLDER =
  "Paste names as CSV, one per line, or space-separated; or a mix. nameForge tidies them up.\n\nThael\nBehem\nPresburg\nKelheim\n\nor\n\nThael, Behem, Presburg, Kelheim";

class NameForgeEditorModal extends Modal {
  private parent: NameForgeModal;
  private inputEl: HTMLTextAreaElement | null = null;
  private packNameInput: HTMLInputElement | null = null;
  private breakdownButton: HTMLButtonElement | null = null;
  private listButton: HTMLButtonElement | null = null;
  private compoundButton: HTMLButtonElement | null = null;
  private placeButton: HTMLButtonElement | null = null;
  private mixButton: HTMLButtonElement | null = null;
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

  private mixSectionEl: HTMLElement | null = null;
  private mixSourcesEl: HTMLElement | null = null;
  private mixHintEl: HTMLElement | null = null;
  private mixSources: MixSourceRef[] = [
    { packName: "", weight: 50 },
    { packName: "", weight: 50 },
  ];
  private mixAvailablePacks: { path: string; packName: string; packType: NamePackType }[] = [];

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

    const packNameRow = contentEl.createDiv({ cls: "nameforge-modal__pack-name-row" });
    packNameRow.createEl("label", { text: "Pack Name" });
    this.packNameInput = packNameRow.createEl("input", {
      cls: "nameforge-modal__pack-name-input",
      attr: {
        type: "text",
        placeholder: "nameForge Pack",
        value: this.initialPackName,
      },
    });
    this.packNameInput.value = this.initialPackName;

    const typeToggle = contentEl.createDiv({ cls: "nameforge-modal__toggle-panel nameforge-modal__pack-type-toggle" });
    this.breakdownButton = typeToggle.createEl("button", {
      cls: "nameforge-modal__toggle-button is-active",
      text: "Breakdown",
    });
    this.breakdownButton.addEventListener("click", () => {
      this.setPackType("breakdownPack");
    });

    this.listButton = typeToggle.createEl("button", {
      cls: "nameforge-modal__toggle-button",
      text: "List",
    });
    this.listButton.addEventListener("click", () => {
      this.setPackType("listPack");
    });

    this.compoundButton = typeToggle.createEl("button", {
      cls: "nameforge-modal__toggle-button",
      text: "Compound",
    });
    this.compoundButton.addEventListener("click", () => {
      this.setPackType("compoundPack");
    });

    this.placeButton = typeToggle.createEl("button", {
      cls: "nameforge-modal__toggle-button",
      text: "Place",
    });
    this.placeButton.addEventListener("click", () => {
      this.setPackType("placePack");
    });

    this.mixButton = typeToggle.createEl("button", {
      cls: "nameforge-modal__toggle-button",
      text: "Mix",
    });
    this.mixButton.addEventListener("click", () => {
      this.setPackType("mixPack");
    });

    // Fixed-height stage: the plain textarea, the compound section, and the mix
    // section are all absolutely positioned to fill it and shown/hidden as
    // alternates, so none of them can ever affect the stage's own box size.
    const stage = contentEl.createDiv({ cls: "nameforge-editor-modal__stage" });

    this.inputEl = stage.createEl("textarea", {
      cls: "nameforge-modal__textarea nameforge-editor-modal__stage-pane",
      attr: {
        placeholder: NAME_TEXTAREA_PLACEHOLDER,
        rows: "12",
      },
    });
    this.inputEl.value = this.initialText;

    this.buildCompoundSection(stage);
    this.buildMixSection(stage);

    this.selectedPackType = this.parent.currentPackType;
    this.updateTypeButtons();
    this.updateCompoundControls();
    void this.loadMixPackOptions();

    const controls = contentEl.createDiv({ cls: "nameforge-modal__controls" });
    const saveButton = controls.createEl("button", {
      cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
      attr: { type: "button", title: "Save names" },
    });
    setIcon(saveButton, ICON_SAVE);
    saveButton.addEventListener("click", () => {
      void this.saveNames();
    });

    const cancelButton = controls.createEl("button", {
      cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
      attr: { type: "button", title: "Cancel" },
    });
    setIcon(cancelButton, ICON_CANCEL);
    cancelButton.addEventListener("click", () => this.close());
  }

  private buildCompoundSection(container: HTMLElement) {
    this.compoundSectionEl = container.createDiv({
      cls: "nameforge-modal__compound-section nameforge-editor-modal__stage-pane",
    });

    const optionsRow = this.compoundSectionEl.createDiv({ cls: "nameforge-modal__compound-options-row" });

    const partsColumn = optionsRow.createDiv({ cls: "nameforge-modal__compound-option-column" });
    const partsToggle = partsColumn.createDiv({ cls: "nameforge-modal__toggle-panel" });
    this.twoPartsButton = partsToggle.createEl("button", { cls: "nameforge-modal__toggle-button", text: "2 parts" });
    this.twoPartsButton.addEventListener("click", () => this.setCompoundParts(2));
    this.threePartsButton = partsToggle.createEl("button", { cls: "nameforge-modal__toggle-button", text: "3 parts" });
    this.threePartsButton.addEventListener("click", () => this.setCompoundParts(3));
    this.partsExampleEl = partsColumn.createDiv({ cls: "nameforge-modal__compound-example" });

    const generatorColumn = optionsRow.createDiv({ cls: "nameforge-modal__compound-option-column" });
    const generatorToggle = generatorColumn.createDiv({ cls: "nameforge-modal__toggle-panel" });
    this.compoundBreakdownButton = generatorToggle.createEl("button", { cls: "nameforge-modal__toggle-button", text: "Breakdown" });
    this.compoundBreakdownButton.addEventListener("click", () => this.setCompoundGenerator("breakdown"));
    this.compoundListButton = generatorToggle.createEl("button", { cls: "nameforge-modal__toggle-button", text: "List" });
    this.compoundListButton.addEventListener("click", () => this.setCompoundGenerator("list"));

    const joiningColumn = optionsRow.createDiv({ cls: "nameforge-modal__compound-option-column" });
    const joiningToggle = joiningColumn.createDiv({ cls: "nameforge-modal__toggle-panel" });
    this.joinedButton = joiningToggle.createEl("button", { cls: "nameforge-modal__toggle-button", text: "Joined" });
    this.joinedButton.addEventListener("click", () => this.setCompoundJoining("joined"));
    this.spacedButton = joiningToggle.createEl("button", { cls: "nameforge-modal__toggle-button", text: "Spaced" });
    this.spacedButton.addEventListener("click", () => this.setCompoundJoining("spaced"));
    this.joiningExampleEl = joiningColumn.createDiv({ cls: "nameforge-modal__compound-example" });

    const partBoxesEl = this.compoundSectionEl.createDiv({ cls: "nameforge-modal__part-boxes" });
    for (let i = 0; i < 3; i++) {
      const wrapper = partBoxesEl.createDiv({ cls: "nameforge-modal__part-box" });
      wrapper.createEl("label", { cls: "nameforge-modal__part-label", text: `Part ${i + 1}` });
      const textarea = wrapper.createEl("textarea", {
        cls: "nameforge-modal__textarea",
        attr: {
          placeholder: "Paste name elements as CSV, one per line, or space-separated.\n\nWulf\nBeorht\nEad",
          rows: "6",
        },
      });
      this.partTextareas.push(textarea);
      this.partWrapperEls.push(wrapper);
    }
  }

  private buildMixSection(container: HTMLElement) {
    this.mixSectionEl = container.createDiv({
      cls: "nameforge-modal__mix-section nameforge-editor-modal__stage-pane",
    });

    this.mixHintEl = this.mixSectionEl.createDiv({
      cls: "nameforge-modal__mix-hint",
      text: "Weights are relative. 10, 40, 50 is the same as 10%, 40%, 50%.",
    });

    this.mixSourcesEl = this.mixSectionEl.createDiv({ cls: "nameforge-modal__mix-sources" });

    const addButton = this.mixSectionEl.createEl("button", {
      cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg nameforge-modal__mix-add",
      attr: { type: "button", title: "Add source" },
    });
    setIcon(addButton, ICON_PLUS_SQUARE);
    addButton.addEventListener("click", () => {
      this.mixSources.push({ packName: "", weight: 50 });
      this.renderMixSourceRows();
    });

    this.renderMixSourceRows();
    this.mixSectionEl.hide();
  }

  private async loadMixPackOptions() {
    this.mixAvailablePacks = await this.parent.listFolderPacks();
    this.renderMixSourceRows();
    this.updateMixHint();
  }

  private updateMixHint() {
    if (!this.mixHintEl) return;
    if (this.mixAvailablePacks.length < 2) {
      this.mixHintEl.textContent = "Create at least two other packs first, then mix them here.";
      return;
    }
    this.mixHintEl.textContent = "Weights are relative. 10, 40, 50 is the same as 10%, 40%, 50%.";
  }

  private mixPercents(): number[] {
    const total = this.mixSources.reduce((sum, source) => sum + Math.max(0, source.weight), 0);
    if (total <= 0) return this.mixSources.map(() => 0);
    return this.mixSources.map((source) => Math.round((Math.max(0, source.weight) / total) * 100));
  }

  private renderMixSourceRows() {
    if (!this.mixSourcesEl) return;
    this.mixSourcesEl.empty();

    const percents = this.mixPercents();
    const selectedNames = this.mixSources.map((source) => source.packName).filter(Boolean);

    this.mixSources.forEach((source, index) => {
      const row = this.mixSourcesEl!.createDiv({ cls: "nameforge-modal__mix-source-row" });

      const select = row.createEl("select", { cls: "nameforge-modal__mix-source-select" });
      select.createEl("option", { text: "Select a pack…", attr: { value: "" } });
      for (const pack of this.mixAvailablePacks) {
        if (pack.packName !== source.packName && selectedNames.includes(pack.packName)) {
          continue;
        }
        const option = select.createEl("option", {
          text: pack.packName,
          attr: { value: pack.packName },
        });
        if (pack.packName === source.packName) {
          option.selected = true;
        }
      }
      select.addEventListener("change", () => {
        this.mixSources[index].packName = select.value;
        this.renderMixSourceRows();
      });

      const weightInput = row.createEl("input", {
        cls: "nameforge-modal__mix-weight",
        attr: {
          type: "number",
          min: "1",
          step: "1",
          title: "Relative weight",
        },
      });
      weightInput.value = String(source.weight > 0 ? source.weight : 1);
      weightInput.addEventListener("input", () => {
        const parsed = Number(weightInput.value);
        this.mixSources[index].weight = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
        this.updateMixPercentLabels();
      });

      row.createSpan({
        cls: "nameforge-modal__mix-percent",
        text: `${percents[index] ?? 0}%`,
      });

      const removeButton = row.createEl("button", {
        cls: "nameforge-modal__mix-remove",
        attr: { type: "button", title: "Remove source" },
      });
      setIcon(removeButton, ICON_CANCEL);
      removeButton.disabled = this.mixSources.length <= 2;
      removeButton.addEventListener("click", () => {
        if (this.mixSources.length <= 2) return;
        this.mixSources.splice(index, 1);
        this.renderMixSourceRows();
      });
    });
  }

  private updateMixPercentLabels() {
    if (!this.mixSourcesEl) return;
    const percents = this.mixPercents();
    const labels = this.mixSourcesEl.querySelectorAll(".nameforge-modal__mix-percent");
    labels.forEach((label, index) => {
      label.textContent = `${percents[index] ?? 0}%`;
    });
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
    const isMix = this.selectedPackType === "mixPack";
    this.breakdownButton?.classList.toggle("is-active", isBreakdown);
    this.listButton?.classList.toggle("is-active", isList);
    this.compoundButton?.classList.toggle("is-active", isCompound);
    this.placeButton?.classList.toggle("is-active", isPlace);
    this.mixButton?.classList.toggle("is-active", isMix);
    this.breakdownButton?.setAttribute("aria-pressed", String(isBreakdown));
    this.listButton?.setAttribute("aria-pressed", String(isList));
    this.compoundButton?.setAttribute("aria-pressed", String(isCompound));
    this.placeButton?.setAttribute("aria-pressed", String(isPlace));
    this.mixButton?.setAttribute("aria-pressed", String(isMix));

    if (this.inputEl) {
      this.inputEl.placeholder = isPlace ? PLACE_TEXTAREA_PLACEHOLDER : NAME_TEXTAREA_PLACEHOLDER;
    }

    if (isCompound) {
      this.inputEl?.hide();
      this.compoundSectionEl?.show();
      this.mixSectionEl?.hide();
    } else if (isMix) {
      this.inputEl?.hide();
      this.compoundSectionEl?.hide();
      this.mixSectionEl?.show();
    } else {
      this.inputEl?.show();
      this.compoundSectionEl?.hide();
      this.mixSectionEl?.hide();
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

      this.parent.plugin.settings.folderPath = folderPath;
      this.parent.plugin.settings.folderPath = folderPath;
      const fileName = sanitizePackNameForFilename(packName);
      this.parent.plugin.settings.namesFilePath = normalizePath(`${folderPath}/${fileName}.md`);
      await this.parent.plugin.saveSettings();

      await this.parent.saveCompoundToConfiguredFile(parts, this.compoundGenerator, this.compoundJoining);
      this.close();
      return;
    }

    if (this.selectedPackType === "mixPack") {
      const sources = this.mixSources
        .map((source) => ({
          packName: source.packName.trim(),
          weight: source.weight > 0 ? source.weight : 1,
        }))
        .filter((source) => source.packName.length > 0);
      const unique = new Set(sources.map((source) => source.packName));
      if (sources.length < 2 || unique.size < 2) {
        this.parent.setStatus("A mix pack needs at least two different source packs.");
        return;
      }

      this.parent.plugin.settings.packName = packName;
      this.parent.currentPackType = "mixPack";
      await this.parent.plugin.saveSettings();

      let folderPath = this.parent.getFolderPath();
      if (!folderPath) {
        const folder = await this.parent.promptForFolderSelection();
        if (!folder) {
          return;
        }
        folderPath = folder.path;
      }

      this.parent.plugin.settings.folderPath = folderPath;
      const fileName = sanitizePackNameForFilename(packName);
      this.parent.plugin.settings.namesFilePath = normalizePath(`${folderPath}/${fileName}.md`);
      await this.parent.plugin.saveSettings();

      await this.parent.saveMixToConfiguredFile(sources);
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

    this.parent.plugin.settings.folderPath = folderPath;
    this.parent.plugin.settings.folderPath = folderPath;
    const fileName = sanitizePackNameForFilename(packName);
    this.parent.plugin.settings.namesFilePath = normalizePath(`${folderPath}/${fileName}.md`);
    await this.parent.plugin.saveSettings();

    await this.parent.saveToConfiguredFile(namesText);
    this.close();
  }
}