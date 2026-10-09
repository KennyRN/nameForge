import { App, Editor, Menu, Modal, normalizePath, Notice, setIcon, TFile, TFolder } from "obsidian";
import {
  generateCompoundNamesDetailed,
  generateMixNamesDetailed,
  ListGenerator,
  MarkovModel,
  PlaceNameModel,
  PlaceEnding,
  extractNamesFromMarkdown,
  buildWeightedCorpus,
  mulberry32,
} from "./markov";
import {
  createCompoundNamesFileContent,
  createMixNamesFileContent,
  createNamesFileContent,
  createWordListFileContent,
  isWordListContent,
  applyTemplate,
  parseTemplateFields,
  parseWordListFileContent,
  type NamesFileData,
  isValidNamePackContent,
  MixPackIndexEntry,
  MixSourceRef,
  parseNamesFileContent,
  findPackInIndex,
  resolveMixSources,
  sanitizePackNameForFilename,
} from "./nameParser";
import {
  ICON_BREAKDOWN_PACK,
  ICON_INFO,
  ICON_PACKS,
  ICON_RIVER_NAMES,
  ICON_TRIBAL_NAMES,
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
  ICON_WORD_LIST,
  ICON_PLACE_SHAPES,
  ICON_GENERIC_PLACE_NAMES,
  ICON_RECIPE,
  ICON_EXPLORATION_PLACE_SHAPES,
  ICON_EMPIRE_EXPANSION_PLACE_SHAPES,
  ICON_NAME_AGEING,
  ICON_NAME_TAKEOVER,
  ICON_PLUS_SQUARE,
  ICON_SAVE,
  ICON_SEED_COPY,
  ICON_SEED_LOCK,
  ICON_TEXT_INSERT,
} from "./icons";
import { EnterFolderPathModal } from "./folderModal";
import { type GeneratedName, generatePlaceNames, generatePlaceNamesSteps, type NameGenerateResult } from "./names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe } from "./names/recipe";
import { type Biome, BIOMES, BRITAIN, findBiome } from "./biomes";
import { DEFAULT_LAND, LandButton, landHistorySuffix, type LandState } from "./landMenu";
import {
  findTradition,
  generateTribalNames,
  homelandSummary,
  TRIBAL_DATA,
  TRIBAL_GROUP_TYPES,
  TRIBAL_PERSPECTIVES,
  TRIBAL_REGISTERS,
  TRIBAL_TRADITIONS,
  tribalDetailsLine,
  tribalHistoryLabel,
  type TribalRegister,
} from "./tribes/engine";
import { generateRiverNames, RIVER_SETTINGS, type RiverSetting } from "./rivers/engine";
import { cultureUsesBiomes, findCulture, findEra, generateWorldPlaceNames, WORLD_CULTURES, worldHistoryLabel } from "./world/engine";
import { isRecipeContent, parseRecipeContent, RecipeHost } from "./recipeHost";
import { WordListGuideModal } from "./wordListGuide";
import { CONTEXT_PHRASES, partsNote, traditionLabel } from "./colonialWording";
import { RecipeEditorModal, type RecipeEditorOptions, RecipeWizard } from "./recipeEditor";
import {
  parseNameSections,
  type SectionedNames,
  sectionOptions,
  type SectionRequest,
  selectSectionNames,
} from "./packs/sections";
import { parseWordList } from "./packs/wordList";
import { AGEING, type AgeingCandidate, ageName, validateSource } from "./ageing/engine";
import { TakeoverView } from "./takeoverView";
import { renderLoading, waitForPaint, waitForTask } from "./loading";
import { AGEING_INSERT_FORMATS, type AgeingInsertFormat, DEFAULT_AGEING_INSERT_FORMAT, formatAgedName, TRAIL_SEPARATOR } from "./ageing/format";
import {
  GENERIC_PLACE_NAMES_HISTORY_NAME,
  PLACE_SHAPE_REGIONS,
} from "./placeShapes";
import {
  type ColonialPart,
  colonialContexts,
  colonialHistoryLabel,
  COLONIAL_TRADITIONS,
  isTraditionAvailable,
} from "./colonialShapes";
import { DEFAULT_NAMES_FOLDER, ensureVaultFolder, resolveNamesFolderPath } from "./paths";

type NamePackType = "breakdownPack" | "listPack" | "compoundPack" | "placePack" | "mixPack" | "recipePack";

import {
  BRITISH_PLACE_NAMES_HISTORY_NAME,
  historySection,
  type NameForgeSection,
  RIVER_NAMES_HISTORY_NAME,
  SECTION_LABELS,
  WORLD_PLACE_NAMES_HISTORY_NAME,
  SECTION_ORDER,
} from "./sections";

/** History label for british place names runs; older "place name shapes" entries keep theirs. */

/** The colonial shape generators (colonialShapes.ts): part 2 and part 2a. */
const COLONIAL_SECTION_PART: Partial<Record<NameForgeSection, ColonialPart>> = {
  explorationPlaceShapes: "2",
  empireExpansionPlaceShapes: "2a",
};

/** "label · Region label" when a region is chosen; the label alone for All Britain. */
const withRegion = (label: string, regionCode: string | undefined) => {
  const region = PLACE_SHAPE_REGIONS.find((r) => r.code === regionCode);
  return region ? `${label} · ${region.label}` : label;
};



// Each section's icon, shown on the section trigger and in the switcher menu.
const SECTION_ICONS: Record<NameForgeSection, string> = {
  markov: ICON_PACKS,
  placeShapes: ICON_PLACE_SHAPES,
  riverNames: ICON_RIVER_NAMES,
  explorationPlaceShapes: ICON_EXPLORATION_PLACE_SHAPES,
  empireExpansionPlaceShapes: ICON_EMPIRE_EXPANSION_PLACE_SHAPES,
  nameAgeing: ICON_NAME_AGEING,
  nameTakeover: ICON_NAME_TAKEOVER,
  tribalNames: ICON_TRIBAL_NAMES,
};

/** Shown in the pack box on the first open of each Obsidian session; the arrow points at the
 * section trigger. */
/** Place names' first-box choice for the British generator; every other choice is a world culture id. */
const PLACE_BRITAIN = "britain";
/** Place names' first-box choice for British river names (the river engine's British setting). */
const PLACE_BRITISH_RIVERS = "british-rivers";

const SESSION_HINT = "← click here for specialist modules, or here for your name packs";
let sessionHintShown = false;


function packTypeIconId(packType: NamePackType, subGenerator?: "breakdown" | "list"): string {
  if (packType === "recipePack") {
    return ICON_RECIPE;
  }
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

/** One name-ageing run, kept in its own history (never in generation history). */
export interface AgeingHistoryEntry {
  timestamp: string;
  seed: number;
  /** e.g. "Londinium → Old English (depth 3, count 5)". */
  label: string;
}

export interface NameForgeSettings {
  namesFilePath?: string;
  packName?: string;
  folderPath?: string;
  faithfulness?: number;
  strictness?: number;
  previousGenerations?: GenerationHistoryEntry[];
  ageingHistory?: AgeingHistoryEntry[];
}

interface NameForgePluginLike {
  app: App;
  settings: NameForgeSettings;
  saveSettings(): Promise<void>;
}

/** One module's own results area, seed state and status line (see NameForgeModal.sectionViews). */
interface SectionView {
  resultsEl: HTMLElement;
  currentSeed: number | null;
  seedLocked: boolean;
  seedInputEl: HTMLInputElement | null;
  seedLockButton: HTMLButtonElement | null;
  status: string;
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
  /** The region dropdown shown beside the trigger in both shape sections. */
  private regionDropdownEl: HTMLElement | null = null;
  private regionTriggerEl: HTMLButtonElement | null = null;
  private regionLabelEl: HTMLElement | null = null;
  private regionMenuEl: HTMLElement | null = null;
  private isRegionMenuOpen = false;
  /** Region code, or undefined for All Britain. Session only — never persisted. */
  private selectedRegion: string | undefined = undefined;
  /** River names (river brief §6.8): setting and, for British, region. Session only. */
  private riverSetting: RiverSetting = "british";
  private riverRegion: string | undefined = undefined;
  /** Tribal brief §19.5: the river module's colonial settings' biome; undefined is Unknown country. */
  /** Land brief §6: each module's biome and terrain, kept for the session. */
  private landStates: Record<string, LandState> = {};
  private landButton: LandButton | null = null;
  /** The user's biome packs, as last resolved (Land brief §9.5). */
  private customBiomes: Biome[] = [];
  /** Tribal names' choices (Tribal brief §18.2), kept for the session like the colonial modules'. */
  private tribal: {
    tradition: string;
    register: TribalRegister;
    groupType: string | undefined;
    perspective: string | undefined;
    hostile: boolean;
  } = { tradition: "general", register: "plain", groupType: undefined, perspective: undefined, hostile: false };
  private tribalOptionsButton: HTMLButtonElement | null = null;
  /** Place names: Britain (PLACE_BRITAIN) or a world culture, and the era chosen for each culture. Session only. */
  private worldCulture: string = PLACE_BRITAIN;
  private worldEras: Record<string, string> = {};
  private secondBoxRowEl: HTMLElement | null = null;
  private secondBoxDropdownEl: HTMLElement | null = null;
  private secondBoxTriggerEl: HTMLElement | null = null;
  private secondBoxLabelEl: HTMLElement | null = null;
  private isSecondBoxMenuOpen = false;
  private setSecondBoxMenuOpen: (open: boolean) => void = () => {};
  private secondBoxObserver: ResizeObserver | null = null;
  /** The place-name modules' etymology toggle: off by default (river brief §2, §3). Session only. */
  private moduleEtymology = false;
  /** Colonial tradition and context per part; undefined = General / None. Session only. */
  private selectedTradition: Record<ColonialPart, string | undefined> = { "2": undefined, "2a": undefined };
  /** Each part's context, starting on its first (as the wizard does): wild and unsettled lands, ruling over the locals. */
  private selectedContext: Record<ColonialPart, string | undefined> = { "2": CONTEXT_PHRASES["2"][0][0], "2a": CONTEXT_PHRASES["2a"][0][0] };
  private contextRowEl: HTMLElement | null = null;
  private quantityToggleEl: HTMLElement | null = null;
  private generateButtonEl: HTMLButtonElement | null = null;
  /** Name ageing controls and state. Session only. */
  private ageingControlsEl: HTMLElement | null = null;
  private ageingSourceInput: HTMLInputElement | null = null;
  private ageingDepth: number = AGEING.depth.default;
  private ageingCount: number = AGEING.count.default;
  private ageingFormat: AgeingInsertFormat = DEFAULT_AGEING_INSERT_FORMAT;
  private ageingTargetPath: string | undefined = undefined;
  private ageingPacks: { path: string; label: string; reason?: string }[] = [];
  /** Name takeover section (takeoverView.ts). Session only. */
  private readonly takeoverView = new TakeoverView({
    settings: () => this.plugin.settings,
    scanFolderPacks: () => this.scanFolderPacks(),
    targetNames: (entry, index) => this.ageingTargetNames(entry, index),
    targetReason: (entry, index) => this.targetPackReason(entry, index),
    lockedSeed: () => (this.seedLocked ? parseSeedInput(this.seedInputEl?.value) : undefined),
    setCurrentSeed: (seed) => {
      this.currentSeed = seed;
    },
    buildSeedControls: (container) => this.buildSeedControls(container),
    insertPlainText: (text) => this.insertPlainText(text),
    insertNamesAsList: (lines, listType) => this.insertNamesAsList(lines, listType),
    setClearSelection: (clear) => {
      this.clearResultsSelection = clear;
    },
    setStatus: (text) => this.setStatus(text),
    onNativeLabelChange: () => {
      this.updateRegionLabel();
      this.updateSecondBoxLabel();
    },
  });
  private guideButton: HTMLButtonElement | null = null;
  private quantityButtons: HTMLButtonElement[] = [];
  private createPacksButton: HTMLButtonElement | null = null;
  /** True while the once-per-session hint covers the pack box label. */
  private showSessionHint = false;
  private packTrigger: { path: string; type: NamePackType; sub?: "breakdown" | "list" } | null = null;
  private clearResultsSelection: () => void = () => {};
  private currentNamesText = "";
  public currentPackType: NamePackType = "breakdownPack";
  private currentCompoundParts: string[][] = [];
  private currentCompoundGenerator: "breakdown" | "list" = "breakdown";
  private currentCompoundJoining: "joined" | "spaced" = "joined";
  private currentMixSources: MixSourceRef[] = [];
  /** §10: the loaded pack's sections (List/Breakdown), section options, and the chosen section. */
  private currentSectioned: SectionedNames | undefined = undefined;
  private sectionChoices: { label: string; request: SectionRequest }[] = [];
  private currentSectionRequest: SectionRequest | undefined = undefined;
  private sectionSelectEl: HTMLSelectElement | null = null;
  /** §7: set when the loaded pack's template couldn't be applied. */
  private currentTemplateError: string | undefined = undefined;
  /** Recipe packs: the loaded recipe, the session's etymology toggle, and the edit button. */
  private currentRecipePath: string | undefined = undefined;
  private recipeEtymology: boolean | undefined = undefined;
  private editRecipeButton: HTMLButtonElement | null = null;
  private generationCount = 25;
  private currentSeed: number | null = null;
  private seedLocked = false;
  private seedInputEl: HTMLInputElement | null = null;
  private seedLockButton: HTMLButtonElement | null = null;
  /**
   * Each module keeps its own results, seed, seed lock and status line; switching modules parks the
   * current set here and brings back the other module's. Session only.
   */
  private sectionViews = new Map<NameForgeSection, SectionView>();
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
    if (!sessionHintShown) {
      sessionHintShown = true;
      this.showSessionHint = true;
      this.renderPackTrigger();
    }

    // The shape sections' option picker — regions for part 1, traditions for the colonial
    // sections — built from the pack dropdown's own box and menu.
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
      const createPacksButton = (this.createPacksButton = createPacksRow.createEl("button", {
        cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
        attr: { type: "button", title: "Create name packs" },
      }));
      setIcon(createPacksButton, ICON_CREATE_PACKS);
      createPacksButton.addEventListener("click", () => {
        new NameForgeEditorModal(this.app, this, "", "").open();
      });
    }
    // Recipe packs: edit the loaded recipe.
    this.editRecipeButton = createPacksRow.createEl("button", {
      cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
      attr: { type: "button", title: "Edit recipe" },
    });
    setIcon(this.editRecipeButton, "pencil");
    this.editRecipeButton.addEventListener("click", () => void this.openRecipeEditor(this.currentRecipePath));
    this.editRecipeButton.hide();

    // The colonial sections' tradition guide, in the slot the create-pack button keeps.
    this.guideButton = createPacksRow.createEl("button", {
      cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
      attr: { type: "button", title: "Tradition guide" },
    });
    setIcon(this.guideButton, ICON_INFO);
    this.guideButton.addEventListener("click", () => {
      const part = COLONIAL_SECTION_PART[this.activeSection];
      if (!part) return;
      new TraditionGuideModal(this.app, part, (id) => {
        this.selectedTradition[part] = id;
        this.updateRegionLabel();
      }).open();
    });
    this.guideButton.hide();

    // Tribal names' options (Tribal brief §18.2): group type, perspective and hostile names.
    this.tribalOptionsButton = createPacksRow.createEl("button", {
      cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
      attr: { type: "button", title: "Options" },
    });
    setIcon(this.tribalOptionsButton, "sliders-horizontal");
    this.tribalOptionsButton.addEventListener("click", (evt) => this.openTribalOptions(evt));
    this.tribalOptionsButton.hide();

    // Land brief §6.1: biome and terrain, beside the guide button.
    this.landButton = new LandButton(createPacksRow, {
      state: () => {
        const key = this.landKey();
        return key ? this.land(key) : undefined;
      },
      set: (state) => {
        const key = this.landKey();
        if (key) this.landStates[key] = state;
      },
      defaultLabel: () => this.landDefaultLabel(),
      terrain: () => this.landKey() !== "river",
      customBiomes: () => this.loadCustomBiomes(),
      onChange: () => this.renderContextRow(),
    });

    // A plain flow block under the pack row, not a floating overlay — same as titleForge's.
    this.sectionMenuEl = optionsList.createDiv({ cls: "nameforge-modal__section-menu" });
    this.sectionMenuEl.hide();

    // §10: the pack's sections, for List, Breakdown and Mix packs that have them.
    this.sectionSelectEl = optionsList.createEl("select", {
      cls: "dropdown nameforge-modal__pack-section-select",
      attr: { "aria-label": "Section", title: "Section" },
    });
    this.sectionSelectEl.addEventListener("change", () => {
      const i = Number(this.sectionSelectEl?.value ?? -1);
      this.currentSectionRequest = i >= 0 ? this.sectionChoices[i]?.request : undefined;
    });
    this.sectionSelectEl.hide();

    this.buildSecondBox(optionsList);

    const quantityToggle = optionsList.createDiv({ cls: "nameforge-modal__toggle-panel nameforge-modal__quantity-toggle" });
    this.quantityToggleEl = quantityToggle;
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

    // Colonial context (frontier type or accommodation level), filled per section.
    this.contextRowEl = optionsList.createDiv({ cls: "nameforge-modal__toggle-panel nameforge-modal__context-toggle" });
    this.contextRowEl.hide();

    this.buildAgeingControls(optionsList);

    const generateButton = this.createIconButton(optionsList, ICON_DICE, "Generate names");
    this.generateButtonEl = generateButton;
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
   * dropdown on the shape sections, the placeholder box otherwise. Everything else is left as it is. */
  private switchSection(section: NameForgeSection) {
    // Prefill: leaving the markov generator with exactly one result selected carries it over.
    if (section === "nameAgeing" && this.activeSection === "markov") {
      const selected = this.resultsEl?.querySelectorAll("li.is-selected") ?? [];
      if (selected.length === 1 && this.ageingSourceInput) {
        this.ageingSourceInput.value = selected[0].textContent ?? "";
      }
    }
    this.setSectionMenuOpen(false);
    this.setRegionMenuOpen(false);
    this.setSecondBoxMenuOpen(false);
    this.swapSectionView(section);
    this.activeSection = section;
    this.packDropdownEl?.toggle(section === "markov");
    this.sectionSelectEl?.toggle(section === "markov" && this.sectionChoices.length > 0);
    this.editRecipeButton?.toggle(section === "markov" && this.currentPackType === "recipePack");
    // Pack creation belongs to the markov generator; elsewhere the button keeps its space so the
    // box beside the trigger stays the same size.
    const colonialPart = COLONIAL_SECTION_PART[section];
    this.createPacksButton?.toggleClass("is-placeholder", section !== "markov");
    // In the colonial sections the guide button takes the create button's slot instead.
    const tribal = section === "tribalNames";
    this.createPacksButton?.toggle(!colonialPart && !tribal);
    this.tribalOptionsButton?.toggle(tribal);
    this.landButton?.refresh();
    this.guideButton?.toggle(!!colonialPart);
    this.clearSessionHint();
    const takeover = section === "nameTakeover";
    const river = section === "riverNames";
    this.regionDropdownEl?.toggle(section === "placeShapes" || river || !!colonialPart || section === "nameAgeing" || takeover || tribal);
    this.showSecondBox((river && this.riverSetting === "british") || (section === "placeShapes" && this.placeHasSecondBox()) || takeover || tribal);
    this.updateSecondBoxLabel();
    this.updateRegionLabel();
    this.renderContextRow();
    const ageing = section === "nameAgeing";
    this.quantityToggleEl?.toggle(!ageing);
    this.ageingControlsEl?.toggle(ageing);
    const action = ageing ? "Age" : takeover ? "Take over" : "Generate names";
    this.generateButtonEl?.setAttribute("title", action);
    this.generateButtonEl?.setAttribute("aria-label", action);
    if (ageing) void this.enterAgeingSection();
    if (takeover) void this.takeoverView.refresh();
    // The trigger wears the active section's icon, as titleForge's leading icon does.
    if (this.sectionTriggerEl) setIcon(this.sectionTriggerEl, SECTION_ICONS[section]);
    if (this.sectionStubLabelEl) this.sectionStubLabelEl.textContent = `${SECTION_LABELS[section]} — no packs yet`;
    this.sectionStubEl?.toggle(
      section !== "markov" && section !== "placeShapes" && !river && !colonialPart && section !== "nameAgeing" && !takeover && !tribal,
    );
  }

  /** Place names: whether Britain is chosen rather than British rivers or a world culture. */
  private placeIsBritain(): boolean {
    return this.worldCulture === PLACE_BRITAIN;
  }

  /** Place names: whether British river names are chosen. */
  private placeIsRivers(): boolean {
    return this.worldCulture === PLACE_BRITISH_RIVERS;
  }

  /** Place names: whether a world culture is chosen. */
  private placeIsWorld(): boolean {
    return !this.placeIsBritain() && !this.placeIsRivers();
  }

  /** Place names: the second box shows Britain's regions (for places or rivers), or a culture's eras when it has more than one. */
  private placeHasSecondBox(): boolean {
    return !this.placeIsWorld() || findCulture(this.worldCulture).eras.length > 1;
  }

  /**
   * The box beneath the box beside the section trigger: the region for river names' British setting
   * (river brief §6.8), the takeover pack for name takeover. The same dropdown box as the one above,
   * given that box's measured left edge and width (alignSecondBox) so it sits exactly beneath it, 4px
   * below; the results box gives up its height so the modal keeps its size (showSecondBox).
   */
  private buildSecondBox(container: HTMLElement) {
    const row = (this.secondBoxRowEl = container.createDiv({ cls: "nameforge-modal__second-box" }));
    const dropdown = (this.secondBoxDropdownEl = row.createDiv({ cls: "nameforge-modal__pack-dropdown" }));
    const trigger = (this.secondBoxTriggerEl = dropdown.createEl("button", {
      cls: "nameforge-modal__pack-dropdown-trigger",
      attr: { type: "button", "aria-haspopup": "listbox", "aria-expanded": "false" },
    }));
    this.secondBoxLabelEl = trigger.createSpan({ cls: "nameforge-modal__pack-dropdown-label" });
    const menu = dropdown.createDiv({ cls: "nameforge-modal__pack-dropdown-menu" });
    menu.hide();
    this.setSecondBoxMenuOpen = (open: boolean) => {
      this.isSecondBoxMenuOpen = open;
      if (open) {
        this.setRegionMenuOpen(false);
        this.renderSecondBoxMenu(menu);
      }
      menu.toggle(open);
      trigger.setAttribute("aria-expanded", String(open));
    };
    trigger.addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.setSecondBoxMenuOpen(!this.isSecondBoxMenuOpen);
    });
    this.updateSecondBoxLabel();
    row.hide();
    // Re-align whenever the box above changes size (window resize, sidebar width).
    this.secondBoxObserver?.disconnect();
    this.secondBoxObserver = new ResizeObserver(() => this.alignSecondBox());
    if (this.regionDropdownEl) this.secondBoxObserver.observe(this.regionDropdownEl);
    this.secondBoxObserver.observe(row);
  }

  /** The second box's label and tooltip for the active module. */
  private updateSecondBoxLabel() {
    const label = this.secondBoxLabelEl;
    const trigger = this.secondBoxTriggerEl;
    if (!label || !trigger) return;
    if (this.activeSection === "nameTakeover") {
      label.textContent = this.takeoverView.takeoverLabel();
      trigger.setAttribute("title", "Takeover pack: the language that adopts the names");
      return;
    }
    if (this.activeSection === "tribalNames") {
      const g = TRIBAL_GROUP_TYPES.find((x) => x.key === this.tribal.groupType);
      label.textContent = g?.label ?? "Any group type";
      trigger.setAttribute("title", "Group type: what kind of group is being named");
      return;
    }
    if (this.activeSection === "placeShapes" && this.placeIsWorld()) {
      const era = findEra(findCulture(this.worldCulture), this.worldEras[this.worldCulture]);
      label.textContent = era.label;
      trigger.setAttribute("title", `Era: ${era.guide ?? era.label}`);
      return;
    }
    const regionCode = this.activeSection === "placeShapes" ? this.selectedRegion : this.riverRegion;
    const region = PLACE_SHAPE_REGIONS.find((r) => r.code === regionCode);
    label.textContent = region?.label ?? "All Britain";
    trigger.setAttribute("title", `Region: ${region?.counties ?? "no regional weighting"}`);
  }

  /**
   * River names and place names' Britain: All Britain, then the regions. Place names' world cultures:
   * the culture's eras. Name takeover: the eligible takeover packs.
   */
  private renderSecondBoxMenu(menu: HTMLElement) {
    menu.empty();
    const choose = () => {
      this.updateSecondBoxLabel();
      this.setSecondBoxMenuOpen(false);
    };
    if (this.activeSection === "nameTakeover") {
      const packs = this.takeoverView.takeoverPacks.filter((pack) => !pack.reason);
      if (packs.length === 0) menu.createDiv({ cls: "nameforge-modal__pack-dropdown-empty", text: "No packs found" });
      for (const pack of packs) {
        const item = menu.createEl("button", {
          cls:
            "nameforge-modal__pack-dropdown-item" +
            (pack.path === this.takeoverView.takeoverPath ? " is-active" : "") +
            (pack.reason ? " is-unavailable" : ""),
          attr: { type: "button", "aria-disabled": String(!!pack.reason), ...(pack.reason ? { title: pack.reason } : {}) },
        });
        item.createSpan({ cls: "nameforge-modal__pack-dropdown-label", text: pack.label });
        if (pack.reason) item.createSpan({ cls: "nameforge-modal__pack-dropdown-note", text: pack.reason });
        item.addEventListener("click", () => {
          if (pack.reason) return;
          this.takeoverView.selectTakeover(pack.path);
          choose();
        });
      }
      return;
    }
    if (this.activeSection === "tribalNames") {
      // Tribal names: the group type, which the sentence below mirrors.
      for (const g of [{ key: undefined, label: "Any group type" }, ...TRIBAL_GROUP_TYPES]) {
        const item = menu.createEl("button", {
          cls: "nameforge-modal__pack-dropdown-item" + (g.key === this.tribal.groupType ? " is-active" : ""),
          attr: { type: "button" },
        });
        item.createSpan({ cls: "nameforge-modal__pack-dropdown-label", text: g.label });
        item.addEventListener("click", () => {
          this.tribal.groupType = g.key;
          this.renderContextRow();
          choose();
        });
      }
      return;
    }
    if (this.activeSection === "placeShapes" && this.placeIsWorld()) {
      const culture = findCulture(this.worldCulture);
      const current = findEra(culture, this.worldEras[culture.id]);
      for (const era of culture.eras) {
        const item = menu.createEl("button", {
          cls: "nameforge-modal__pack-dropdown-item" + (era.id === current.id ? " is-active" : ""),
          attr: { type: "button", title: era.guide ?? era.label },
        });
        item.createSpan({ cls: "nameforge-modal__pack-dropdown-label", text: era.label });
        item.addEventListener("click", () => {
          this.worldEras[culture.id] = era.id;
          choose();
        });
      }
      return;
    }
    const options: { code: string | undefined; label: string; counties?: string }[] = [
      { code: undefined, label: "All Britain" },
      ...PLACE_SHAPE_REGIONS,
    ];
    const place = this.activeSection === "placeShapes";
    const current = place ? this.selectedRegion : this.riverRegion;
    for (const { code, label: text, counties } of options) {
      const item = menu.createEl("button", {
        cls: "nameforge-modal__pack-dropdown-item" + (code === current ? " is-active" : ""),
        attr: { type: "button", title: counties ?? "No regional weighting" },
      });
      item.createSpan({ cls: "nameforge-modal__pack-dropdown-label", text });
      item.addEventListener("click", () => {
        if (place) this.selectedRegion = code;
        else this.riverRegion = code;
        choose();
      });
    }
  }

  /**
   * Land brief §6.2: the active module's land key (per part for the colonial modules, per culture
   * for world place names), or undefined where there is no Land button.
   */
  private landKey(): string | undefined {
    const part = COLONIAL_SECTION_PART[this.activeSection];
    if (part) return `colonial:${part}`;
    if (this.activeSection === "tribalNames") return "tribal";
    if (this.activeSection === "riverNames") return this.riverSetting === "british" ? undefined : "river";
    if (this.activeSection === "placeShapes") {
      if (this.placeIsBritain()) return "britain";
      if (this.placeIsWorld() && cultureUsesBiomes(this.worldCulture)) return `world:${this.worldCulture}`;
    }
    return undefined;
  }

  /** A module's land choice (session only). */
  private land(key: string): LandState {
    return this.landStates[key] ?? DEFAULT_LAND;
  }

  /** The module's default biome as the Land menu shows it. */
  private landDefaultLabel(): string {
    const key = this.landKey() ?? "";
    if (key === "britain") return "Britain";
    if (key === "tribal" || key.startsWith("world:")) return "Homeland";
    return "Unknown country";
  }

  /** Land brief §3: a land-driven batch, or undefined (with a status) when nothing fits. */
  private tryLand<T>(run: () => T): T | undefined {
    try {
      return run();
    } catch (error) {
      if (error instanceof Error && /^No eligible/.test(error.message)) {
        this.setStatus("No place names fit this biome and terrain.");
        return undefined;
      }
      throw error;
    }
  }

  /** Land brief §9.5: the user's biome packs (resolved by the host). */
  private async loadCustomBiomes(): Promise<Biome[]> {
    return this.customBiomes;
  }

  /** Gives the region box the setting box's exact left edge and width. */
  private alignSecondBox() {
    const row = this.secondBoxRowEl;
    const box = this.secondBoxDropdownEl;
    const setting = this.regionDropdownEl;
    if (!row || !box || !setting || !row.isShown() || !setting.isShown()) return;
    const rowRect = row.getBoundingClientRect();
    const settingRect = setting.getBoundingClientRect();
    box.style.marginLeft = `${settingRect.left - rowRect.left}px`;
    box.style.width = `${settingRect.width}px`;
  }

  /**
   * Shows the region row (British setting only) and aligns it. The modal keeps its size: the results
   * box gives up exactly the height the row adds (measured), via --nf-second-box-height.
   */
  private showSecondBox(show: boolean) {
    const row = this.secondBoxRowEl;
    if (!row) return;
    const optionsList = row.parentElement;
    const wasShown = row.isShown();
    const before = optionsList?.offsetHeight ?? 0;
    row.toggle(show);
    if (show && !wasShown) {
      const added = Math.max(0, (optionsList?.offsetHeight ?? 0) - before);
      this.rootEl?.style.setProperty("--nf-second-box-height", `${added}px`);
    }
    if (!show) this.rootEl?.style.setProperty("--nf-second-box-height", "0px");
    this.rootEl?.toggleClass("is-second-box-open", show);
    if (show) this.alignSecondBox();
  }

  private setRegionMenuOpen(open: boolean) {
    this.isRegionMenuOpen = open;
    if (open) {
      this.setSecondBoxMenuOpen(false);
      this.closePackDropdown();
      this.renderRegionMenu();
    }
    this.regionMenuEl?.toggle(open);
    this.regionTriggerEl?.setAttribute("aria-expanded", String(open));
  }

  /** Part 1 sections: All Britain, then the regions, with historic counties as tooltips.
   * Colonial sections: General, then every tradition; ones not in this part are greyed out. */
  private renderRegionMenu() {
    const menu = this.regionMenuEl;
    if (!menu) return;
    menu.empty();
    if (this.activeSection === "nameTakeover") {
      const packs = this.takeoverView.nativePacks.filter((pack) => !pack.reason);
      if (packs.length === 0) menu.createDiv({ cls: "nameforge-modal__pack-dropdown-empty", text: "No packs found" });
      for (const pack of packs) {
        const item = menu.createEl("button", {
          cls:
            "nameforge-modal__pack-dropdown-item" +
            (pack.path === this.takeoverView.nativePath ? " is-active" : "") +
            (pack.reason ? " is-unavailable" : ""),
          attr: { type: "button", "aria-disabled": String(!!pack.reason), ...(pack.reason ? { title: pack.reason } : {}) },
        });
        item.createSpan({ cls: "nameforge-modal__pack-dropdown-label", text: pack.label });
        if (pack.reason) item.createSpan({ cls: "nameforge-modal__pack-dropdown-note", text: pack.reason });
        item.addEventListener("click", () => {
          if (pack.reason) return;
          this.takeoverView.selectNative(pack.path);
          this.setRegionMenuOpen(false);
        });
      }
      return;
    }
    if (this.activeSection === "nameAgeing") {
      const packs = this.ageingPacks.filter((pack) => !pack.reason);
      if (packs.length === 0) {
        menu.createDiv({ cls: "nameforge-modal__pack-dropdown-empty", text: "No packs found" });
      }
      for (const pack of packs) {
        const item = menu.createEl("button", {
          cls:
            "nameforge-modal__pack-dropdown-item" +
            (pack.path === this.ageingTargetPath ? " is-active" : "") +
            (pack.reason ? " is-unavailable" : ""),
          attr: { type: "button", "aria-disabled": String(!!pack.reason), ...(pack.reason ? { title: pack.reason } : {}) },
        });
        item.createSpan({ cls: "nameforge-modal__pack-dropdown-label", text: pack.label });
        if (pack.reason) item.createSpan({ cls: "nameforge-modal__pack-dropdown-note", text: pack.reason });
        item.addEventListener("click", () => {
          if (pack.reason) {
            new Notice(`nameForge: ${pack.label} can't be a target — ${pack.reason}.`);
            return;
          }
          this.ageingTargetPath = pack.path;
          this.updateRegionLabel();
          this.setRegionMenuOpen(false);
        });
      }
      return;
    }
    if (this.activeSection === "riverNames") {
      for (const setting of RIVER_SETTINGS) {
        const item = menu.createEl("button", {
          cls: "nameforge-modal__pack-dropdown-item" + (setting.id === this.riverSetting ? " is-active" : ""),
          attr: { type: "button" },
        });
        item.createSpan({ cls: "nameforge-modal__pack-dropdown-label", text: setting.label });
        item.addEventListener("click", () => {
          this.riverSetting = setting.id;
          this.showSecondBox(setting.id === "british");
          this.landButton?.refresh();
          this.updateRegionLabel();
          this.setRegionMenuOpen(false);
        });
      }
      return;
    }
    if (this.activeSection === "placeShapes") {
      const choices = [
        { id: PLACE_BRITAIN, label: "Britain", guide: "British place names, weighted by region" },
        { id: PLACE_BRITISH_RIVERS, label: "British river names", guide: "British river names, weighted by region" },
        ...WORLD_CULTURES,
      ];
      for (const culture of choices) {
        const item = menu.createEl("button", {
          cls: "nameforge-modal__pack-dropdown-item" + (culture.id === this.worldCulture ? " is-active" : ""),
          attr: { type: "button", title: culture.guide },
        });
        item.createSpan({ cls: "nameforge-modal__pack-dropdown-label", text: culture.label });
        item.addEventListener("click", () => {
          this.worldCulture = culture.id;
          this.showSecondBox(this.placeHasSecondBox());
          this.landButton?.refresh();
          this.updateSecondBoxLabel();
          this.updateRegionLabel();
          this.setRegionMenuOpen(false);
        });
      }
      return;
    }
    if (this.activeSection === "tribalNames") {
      for (const tradition of TRIBAL_TRADITIONS) {
        const item = menu.createEl("button", {
          cls: "nameforge-modal__pack-dropdown-item" + (tradition.key === this.tribal.tradition ? " is-active" : ""),
          attr: { type: "button", title: tradition.drawsOn },
        });
        item.createSpan({ cls: "nameforge-modal__pack-dropdown-label", text: tradition.label });
        item.addEventListener("click", () => {
          this.tribal.tradition = tradition.key;
          this.updateRegionLabel();
          this.renderContextRow();
          this.setRegionMenuOpen(false);
        });
      }
      return;
    }
    const part = COLONIAL_SECTION_PART[this.activeSection];
    if (part) {
      for (const tradition of COLONIAL_TRADITIONS) {
        const id = tradition.id === "general" ? undefined : tradition.id;
        const available = isTraditionAvailable(tradition.id, part);
        if (!available) continue;
        const item = menu.createEl("button", {
          cls:
            "nameforge-modal__pack-dropdown-item" +
            (id === this.selectedTradition[part] ? " is-active" : "") +
            (available ? "" : " is-unavailable"),
          attr: { type: "button", title: tradition.guide, "aria-disabled": String(!available) },
        });
        item.createSpan({ cls: "nameforge-modal__pack-dropdown-label", text: traditionLabel(part, tradition.id, tradition.label) });
        if (!available) item.createSpan({ cls: "nameforge-modal__pack-dropdown-note", text: partsNote(tradition.parts) });
        item.addEventListener("click", () => {
          if (!available) return;
          this.selectedTradition[part] = id;
          this.updateRegionLabel();
          this.setRegionMenuOpen(false);
        });
      }
      return;
    }
  }

  private updateRegionLabel() {
    if (this.activeSection === "nameTakeover") {
      if (this.regionLabelEl) this.regionLabelEl.textContent = this.takeoverView.nativeLabel();
      this.regionTriggerEl?.setAttribute("title", "Native pack: the names to be taken over");
      return;
    }
    if (this.activeSection === "nameAgeing") {
      const pack = this.ageingPacks.find((p) => p.path === this.ageingTargetPath);
      if (this.regionLabelEl) this.regionLabelEl.textContent = pack ? pack.label : "choose a target pack";
      this.regionTriggerEl?.setAttribute("title", "Target pack: the language the name ages towards");
      return;
    }
    if (this.activeSection === "riverNames") {
      if (this.regionLabelEl) this.regionLabelEl.textContent = RIVER_SETTINGS.find((s) => s.id === this.riverSetting)!.label;
      this.regionTriggerEl?.setAttribute("title", "Setting: British rivers, or New Land or Established colonial rivers");
      return;
    }
    if (this.activeSection === "placeShapes" && this.placeIsWorld()) {
      const culture = findCulture(this.worldCulture);
      if (this.regionLabelEl) this.regionLabelEl.textContent = culture.label;
      this.regionTriggerEl?.setAttribute("title", `Culture: ${culture.guide}`);
      return;
    }
    if (this.activeSection === "tribalNames") {
      const tradition = findTradition(this.tribal.tradition) ?? TRIBAL_TRADITIONS[0];
      if (this.regionLabelEl) this.regionLabelEl.textContent = tradition.label;
      this.regionTriggerEl?.setAttribute("title", tradition.drawsOn);
      return;
    }
    const part = COLONIAL_SECTION_PART[this.activeSection];
    if (part) {
      const tradition = COLONIAL_TRADITIONS.find((t) => t.id === (this.selectedTradition[part] ?? "general"))!;
      if (this.regionLabelEl) this.regionLabelEl.textContent = traditionLabel(part, tradition.id, tradition.label);
      this.regionTriggerEl?.setAttribute("title", tradition.guide);
      return;
    }
    if (this.activeSection === "placeShapes" && this.placeIsRivers()) {
      if (this.regionLabelEl) this.regionLabelEl.textContent = "British river names";
      this.regionTriggerEl?.setAttribute("title", "British river names, weighted by region");
      return;
    }
    if (this.regionLabelEl) this.regionLabelEl.textContent = "Britain";
    this.regionTriggerEl?.setAttribute("title", "Culture: British place names, weighted by region");
  }

  /** The context toggle row: None plus the part's frontier types or accommodation levels. */
  private renderContextRow() {
    const row = this.contextRowEl;
    if (!row) return;
    const part = COLONIAL_SECTION_PART[this.activeSection];
    row.empty();
    row.toggleClass("is-sentence", this.activeSection === "tribalNames");
    if (this.activeSection === "tribalNames") {
      this.renderTribalSentence(row);
      return;
    }
    row.toggle(!!part);
    if (!part) return;
    // The wizard's context phrases, in its order; there is no "none".
    const options = CONTEXT_PHRASES[part]
      .filter(([id]) => colonialContexts(part).some((c) => c.id === id))
      .map(([id, phrase]) => ({ id, phrase, label: colonialContexts(part).find((c) => c.id === id)!.label }));
    for (const option of options) {
      const active = option.id === this.selectedContext[part];
      const button = row.createEl("button", {
        cls: "nameforge-modal__toggle-button" + (active ? " is-active" : ""),
        text: option.phrase,
        attr: { type: "button", title: option.label, "aria-pressed": String(active) },
      });
      button.addEventListener("click", () => {
        this.selectedContext[part] = option.id;
        this.renderContextRow();
      });
    }
  }

  /** Tribal names (Tribal brief §18.3): headwords, with the two-line details as etymology. */
  private async runTribalNames() {
    const t = this.tribal;
    const seedOverride = this.seedLocked ? parseSeedInput(this.seedInputEl?.value) : undefined;
    const result = generateTribalNames({
      tradition: t.tradition,
      biome: this.land("tribal").biome,
      register: t.register,
      groupType: t.groupType,
      perspective: t.perspective,
      hostile: t.hostile,
      count: this.generationCount,
      seed: seedOverride,
    });
    this.currentSeed = result.seed;
    this.renderRecipeResults(
      result.names.map((n) => {
        const also = n.alternativeNames.length > 0 ? ` Also: ${n.alternativeNames.join(" · ")}` : "";
        const echo = n.echoesReal ? " Echoes a real historical name." : "";
        return { text: n.name, hasPlaceholder: false, etymology: `${tribalDetailsLine(n)}\n${n.origin}${also}${echo}` } as GeneratedName;
      }),
      "module",
    );
    await this.recordGenerationHistory(result.names.length, tribalHistoryLabel(SECTION_LABELS.tribalNames, t.tradition, this.land("tribal").biome, t.register, this.land("tribal").terrain, this.customBiomes));
    this.setStatus(result.notices.join(" "));
  }

  /**
   * Tribal names' sentence, read like the place name wizard's: "‹Polynesian›-themed kin groups in
   * ‹their original› environment using ‹plain› names". The underlined phrases open menus; the group
   * type mirrors the box above.
   */
  private renderTribalSentence(row: HTMLElement) {
    const t = this.tribal;
    row.show();
    const sentence = row.createDiv({ cls: "nameforge-modal__tribal-sentence" });
    const link = (text: string, title: string, choices: { id: string | undefined; label: string }[], current: string | undefined, choose: (id: string | undefined) => void) => {
      const a = sentence.createEl("a", { cls: "nameforge-recipe-editor__sentence-link", text, attr: { href: "#", role: "button", title } });
      a.addEventListener("click", (event) => {
        event.preventDefault();
        const menu = new Menu();
        for (const c of choices) {
          menu.addItem((item) =>
            item
              .setTitle(c.label)
              .setChecked(c.id === current)
              .onClick(() => {
                choose(c.id);
                this.updateRegionLabel();
                this.renderContextRow();
              }),
          );
        }
        menu.showAtMouseEvent(event);
      });
    };
    const tradition = findTradition(t.tradition) ?? TRIBAL_TRADITIONS[0];
    link(
      tradition.label,
      tradition.drawsOn,
      TRIBAL_TRADITIONS.map((x) => ({ id: x.key, label: x.label })),
      t.tradition,
      (id) => (t.tradition = id ?? "general"),
    );
    const group = TRIBAL_GROUP_TYPES.find((g) => g.key === t.groupType);
    sentence.appendText(`-themed ${group ? group.label.toLowerCase() : "groups of any kind"} in `);
    const land = this.land("tribal");
    const biome = findBiome(land.biome, this.customBiomes);
    const biomeText = biome ? `${/^[aeiou]/i.test(biome.label) ? "an" : "a"} ${biome.label.toLowerCase()}` : "their original";
    link(
      biomeText,
      biome?.guide ?? homelandSummary(t.tradition),
      [{ id: undefined, label: "Their original" }, ...[BRITAIN, ...BIOMES].map((b) => ({ id: b.id, label: b.label }))],
      land.biome,
      (id) => {
        this.landStates.tribal = { ...land, biome: id };
        this.landButton?.refresh();
      },
    );
    sentence.appendText(" environment using ");
    link(
      t.register,
      TRIBAL_DATA.registerLabels[t.register],
      TRIBAL_REGISTERS.map((r) => ({ id: r, label: TRIBAL_DATA.registerLabels[r] })),
      t.register,
      (id) => (t.register = (id ?? "plain") as TribalRegister),
    );
    sentence.appendText(" names");
  }

  /** Tribal names' options menu: perspective and hostile names. */
  private openTribalOptions(evt: MouseEvent) {
    const t = this.tribal;
    const menu = new Menu();
    const heading = (title: string) => menu.addItem((item) => item.setTitle(title).setDisabled(true));
    heading("Perspective");
    menu.addItem((item) => item.setTitle("Any").setChecked(!t.perspective).onClick(() => (t.perspective = undefined)));
    for (const p of TRIBAL_PERSPECTIVES) {
      const label = TRIBAL_DATA.perspectiveLabels[p];
      menu.addItem((item) =>
        item
          .setTitle(label.charAt(0).toUpperCase() + label.slice(1))
          .setChecked(t.perspective === p)
          .onClick(() => (t.perspective = p)),
      );
    }
    menu.addSeparator();
    menu.addItem((item) =>
      item
        .setTitle("Hostile names")
        .setChecked(t.hostile)
        .onClick(() => {
          t.hostile = !t.hostile;
          if (t.hostile) new Notice("Hostile names are on: some results will be insults one people used for another.");
        }),
    );
    menu.showAtMouseEvent(evt);
  }

  /** Source field with the depth buttons (new 1, moderate 3, ancient 5) beside it, then the count row. */
  private buildAgeingControls(container: HTMLElement) {
    const controls = (this.ageingControlsEl = container.createDiv({ cls: "nameforge-modal__ageing-controls" }));
    // The source field and the depth buttons share one row.
    const sourceRow = controls.createDiv({ cls: "nameforge-modal__ageing-source-row" });
    this.ageingSourceInput = sourceRow.createEl("input", {
      cls: "nameforge-modal__ageing-source",
      attr: { type: "text", placeholder: "Old name, e.g. Londinium", "aria-label": "Source name", spellcheck: "false" },
    });

    // Three depths only: 1, 3 and 5 eras.
    const depthRow = sourceRow.createDiv({ cls: "nameforge-modal__toggle-panel nameforge-modal__ageing-toggle" });
    const depthOptions: [number, string][] = [
      [1, "new"],
      [3, "moderate"],
      [5, "ancient"],
    ];
    const depthButtons = depthOptions.map(([d, label]) => {
      const button = depthRow.createEl("button", {
        cls: "nameforge-modal__toggle-button",
        text: label,
        attr: { type: "button", title: `${d} era${d === 1 ? "" : "s"}` },
      });
      button.addEventListener("click", () => {
        this.ageingDepth = d;
        sync();
      });
      return button;
    });

    const countRow = controls.createDiv({ cls: "nameforge-modal__toggle-panel nameforge-modal__ageing-toggle" });
    const countButtons = AGEING.count.options.map((c) => {
      const button = countRow.createEl("button", {
        cls: "nameforge-modal__toggle-button",
        text: String(c),
        attr: { type: "button", title: `${c} candidates` },
      });
      button.addEventListener("click", () => {
        this.ageingCount = c;
        sync();
      });
      return button;
    });

    const sync = () => {
      depthButtons.forEach((b, i) => {
        const on = depthOptions[i][0] === this.ageingDepth;
        b.toggleClass("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      countButtons.forEach((b, i) => {
        const on = AGEING.count.options[i] === this.ageingCount;
        b.toggleClass("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
    };
    sync();
    controls.hide();
  }

  /** Lists the folder's packs for the target dropdown, marking ineligible ones with a reason. */
  private async enterAgeingSection() {
    const index = await this.scanFolderPacks();
    this.ageingPacks = index
      .filter((entry) => !entry.parsed.template)
      .map((entry) => {
        const label = entry.parsed.packName || entry.path.split("/").pop()?.replace(/\.md$/i, "") || entry.path;
        return { path: entry.path, label, reason: this.targetPackReason(entry, index) };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    if (this.ageingTargetPath && !this.ageingPacks.some((p) => p.path === this.ageingTargetPath && !p.reason)) {
      this.ageingTargetPath = undefined;
    }
    this.updateRegionLabel();
  }

  /** Why a pack can't be an ageing target or a takeover pack (ageing §1), or undefined if it can. */
  private targetPackReason(entry: MixPackIndexEntry, index: MixPackIndexEntry[]): string | undefined {
    if (entry.templateError) return entry.templateError.replace(/\.$/, "");
    if (entry.parsed.packType === "compoundPack") return "compound packs hold name parts, not whole names";
    const names = this.ageingTargetNames(entry, index);
    if (typeof names === "string") return names;
    if (new Set(names.names.map((n) => n.toLowerCase())).size < AGEING.minTargetNames) {
      return `fewer than ${AGEING.minTargetNames} names`;
    }
    return undefined;
  }

  /**
   * The names a target pack contributes, built as the Generate view builds that pack: the pack's
   * names for Breakdown, List and Place; the weighted blend for Mix. Returns a reason on failure.
   */
  private ageingTargetNames(
    entry: MixPackIndexEntry,
    index: MixPackIndexEntry[],
  ): { names: string[]; corpus: string[]; endings: string[] } | string {
    const { parsed } = entry;
    if (parsed.packType === "mixPack") {
      const resolved = resolveMixSources(normalizePath(entry.path), parsed, index);
      if (resolved.error) return resolved.error;
      const distinct = [...new Set(resolved.sources.flatMap((source) => source.names))];
      return { names: distinct, corpus: buildWeightedCorpus(resolved.sources), endings: [] };
    }
    const names = extractNamesFromMarkdown(parsed.names.join("\n"));
    const endings =
      parsed.packType === "placePack" ? PlaceNameModel.build(names).endings.map((e) => e.suffix).filter((x) => x) : [];
    return { names, corpus: names, endings };
  }

  private async runAgeing() {
    const source = this.ageingSourceInput?.value.trim() ?? "";
    const problem = validateSource(source);
    if (problem) {
      new Notice(`nameForge: ${problem}`);
      return;
    }
    if (!this.ageingTargetPath) {
      new Notice("nameForge: choose a target pack to age the name towards.");
      return;
    }
    const index = await this.scanFolderPacks();
    const entry = index.find((e) => e.path === this.ageingTargetPath);
    const target = entry ? this.ageingTargetNames(entry, index) : "the target pack was not found";
    if (typeof target === "string") {
      new Notice(`nameForge: ${target}.`);
      return;
    }
    if (new Set(target.names.map((n) => n.toLowerCase())).size < AGEING.minTargetNames) {
      new Notice(`nameForge: the target pack needs at least ${AGEING.minTargetNames} names.`);
      return;
    }

    const seedOverride = this.seedLocked ? parseSeedInput(this.seedInputEl?.value) : undefined;
    const seed = resolveSeed(seedOverride);
    const faithfulness = this.plugin.settings.faithfulness ?? 2;
    // Let the loading dots paint before the search starts.
    renderLoading(this.resultsEl, "Ageing…");
    await waitForPaint();
    const result = ageName({
      source,
      targetNames: target.corpus,
      extraEndings: target.endings,
      buildScorer: (names) => {
        const model = MarkovModel.build(names);
        return (word) => model.scoreWord(word, faithfulness);
      },
      depth: this.ageingDepth,
      count: this.ageingCount,
      rng: mulberry32(seed),
    });

    this.currentSeed = seed;
    this.renderAgeingResults(result.candidates);
    const packLabel = this.ageingPacks.find((p) => p.path === this.ageingTargetPath)?.label ?? "target pack";
    await this.recordAgeingHistory(`${source} → ${packLabel} (depth ${this.ageingDepth}, count ${this.ageingCount})`);
    this.setStatus(result.notice ?? "");
  }

  private async recordAgeingHistory(label: string) {
    if (this.currentSeed === null) return;
    const entry: AgeingHistoryEntry = { timestamp: formatHistoryTimestamp(new Date()), seed: this.currentSeed, label };
    this.plugin.settings.ageingHistory = [entry, ...(this.plugin.settings.ageingHistory ?? [])].slice(0, MAX_HISTORY_ENTRIES);
    await this.plugin.saveSettings();
  }

  /** Ageing results: final name with its trail beneath, selectable and insertable like Generate's. */
  private renderAgeingResults(candidates: AgeingCandidate[]) {
    if (!this.resultsEl) return;
    this.resultsEl.empty();
    const list = this.resultsEl.createEl("ul", { cls: "nameforge-modal__results-list nameforge-modal__ageing-results" });
    const actions = this.resultsEl.createDiv({ cls: "nameforge-modal__results-actions" });
    this.buildSeedControls(actions.createDiv({ cls: "nameforge-modal__seed-group" }));

    const buttonsGroup = actions.createDiv({ cls: "nameforge-modal__results-buttons" });
    const formatSelect = buttonsGroup.createEl("select", {
      cls: "dropdown nameforge-modal__ageing-format",
      attr: { "aria-label": "Insert as", title: "Insert as" },
    });
    for (const f of AGEING_INSERT_FORMATS) {
      const option = formatSelect.createEl("option", { text: f.label, value: f.id });
      option.selected = f.id === this.ageingFormat;
    }
    formatSelect.addEventListener("change", () => {
      this.ageingFormat = formatSelect.value as AgeingInsertFormat;
    });
    const button = (icon: string, title: string) => {
      const b = buttonsGroup.createEl("button", {
        cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
        attr: { type: "button", title },
      });
      setIcon(b, icon);
      return b;
    };
    const insertButton = button(ICON_TEXT_INSERT, "Insert");
    const checklistButton = button(ICON_CHECKLIST_INSERT, "Insert checklist");
    const bulletButton = button(ICON_BULLET_INSERT, "Insert bullet list");

    const selectedTrails = (): string[][] =>
      Array.from(list.querySelectorAll("li.is-selected")).map((el) => candidates[Number((el as HTMLElement).dataset.index)].trail);
    const update = () => {
      const n = selectedTrails().length;
      insertButton.disabled = n !== 1;
      checklistButton.disabled = n === 0;
      bulletButton.disabled = n === 0;
    };
    this.clearResultsSelection = () => {
      list.querySelectorAll("li.is-selected").forEach((el) => el.classList.remove("is-selected"));
      update();
    };

    candidates.forEach((c, i) => {
      const item = list.createEl("li", { attr: { "data-index": String(i) } });
      item.createDiv({ cls: "nameforge-modal__ageing-name", text: c.name });
      item.createDiv({ cls: "nameforge-modal__ageing-trail", text: c.trail.join(TRAIL_SEPARATOR) });
      item.addEventListener("click", () => {
        item.classList.toggle("is-selected");
        update();
      });
    });
    if (candidates.length === 0) list.createEl("li", { cls: "nameforge-modal__placeholder", text: "No candidates survived." });

    const formatted = () => selectedTrails().map((t) => formatAgedName(t, this.ageingFormat));
    insertButton.addEventListener("click", () => {
      const [text] = formatted();
      if (text) this.insertPlainText(text);
    });
    checklistButton.addEventListener("click", () => {
      const lines = formatted();
      if (lines.length > 0) this.insertNamesAsList(lines, "checklist");
    });
    bulletButton.addEventListener("click", () => {
      const lines = formatted();
      if (lines.length > 0) this.insertNamesAsList(lines, "bullet");
    });

    if (this.panelMode) {
      const history = this.resultsEl.createEl("button", { cls: "nameforge-modal__panel-action", attr: { type: "button" } });
      setIcon(history.createSpan({ cls: "nameforge-modal__panel-action-icon" }), ICON_PREVIOUS_GENERATIONS);
      history.createSpan({ cls: "nameforge-modal__panel-action-label", text: "ageing history" });
      history.addEventListener("click", () => new AgeingHistoryModal(this.app, this).open());
    }
    update();
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
    this.createPacksButton = null;
    this.sectionSelectEl = null;
    this.editRecipeButton = null;
    this.guideButton = null;
    this.tribalOptionsButton = null;
    this.contextRowEl = null;
    this.secondBoxRowEl = null;
    this.secondBoxDropdownEl = null;
    this.secondBoxTriggerEl = null;
    this.secondBoxLabelEl = null;
    this.isSecondBoxMenuOpen = false;
    this.setSecondBoxMenuOpen = () => {};
    this.secondBoxObserver?.disconnect();
    this.secondBoxObserver = null;
    this.quantityToggleEl = null;
    this.generateButtonEl = null;
    this.ageingControlsEl = null;
    this.ageingSourceInput = null;
    this.seedInputEl = null;
    this.seedLockButton = null;
    this.sectionViews.clear();
  }

  /** Parks the active module's results, seed and status, then shows `section`'s (empty the first time). */
  private swapSectionView(section: NameForgeSection) {
    if (!this.rootEl || !this.resultsEl || section === this.activeSection) return;
    this.sectionViews.set(this.activeSection, {
      resultsEl: this.resultsEl,
      currentSeed: this.currentSeed,
      seedLocked: this.seedLocked,
      seedInputEl: this.seedInputEl,
      seedLockButton: this.seedLockButton,
      status: this.statusEl?.textContent ?? "",
    });
    this.resultsEl.hide();
    const view = this.sectionViews.get(section);
    if (view) {
      this.resultsEl = view.resultsEl;
      this.currentSeed = view.currentSeed;
      this.seedLocked = view.seedLocked;
      this.seedInputEl = view.seedInputEl;
      this.seedLockButton = view.seedLockButton;
      this.resultsEl.show();
      this.setStatus(view.status);
      return;
    }
    const resultsEl = createDiv({ cls: "nameforge-modal__results" });
    this.rootEl.insertBefore(resultsEl, this.statusEl);
    this.resultsEl = resultsEl;
    this.currentSeed = null;
    this.seedLocked = false;
    this.seedInputEl = null;
    this.seedLockButton = null;
    this.setStatus("");
    this.renderResults([]);
  }

  /** Close the Modal after insert; no-op in Forge panel mode (stay mounted). */
  private dismissAfterInsert() {
    if (!this.panelMode) {
      this.close();
    }
  }

  private handlePackDropdownOutsideClick = (evt: MouseEvent) => {
    if (this.isSecondBoxMenuOpen && this.secondBoxDropdownEl && !this.secondBoxDropdownEl.contains(evt.target as Node)) {
      this.setSecondBoxMenuOpen(false);
    }
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
    this.packTrigger = { path: packPath, type: packType, sub: subGenerator };
    this.renderPackTrigger();
  }

  /** The pack box label: the session hint while it is showing, otherwise the loaded pack. */
  private renderPackTrigger() {
    this.packDropdownIconEl?.toggle(!this.showSessionHint);
    if (this.showSessionHint) {
      if (this.packDropdownLabelEl) this.packDropdownLabelEl.textContent = SESSION_HINT;
      return;
    }
    const pack = this.packTrigger;
    if (!pack) return;
    if (this.packDropdownIconEl) setIcon(this.packDropdownIconEl, packTypeIconId(pack.type, pack.sub));
    if (this.packDropdownLabelEl) {
      this.packDropdownLabelEl.textContent = pack.path.split("/").pop()?.replace(/\.md$/i, "") || pack.path;
    }
  }

  private clearSessionHint() {
    if (!this.showSessionHint) return;
    this.showSessionHint = false;
    this.renderPackTrigger();
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
        this.clearSessionHint();
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

  public async saveToConfiguredFile(namesText: string, templateOf?: string) {
    const filePath = this.getResolvedFilePath();
    if (!filePath) {
      this.setStatus("No folder set for name packs. Set one first.");
      return;
    }

    const names = extractNamesFromMarkdown(namesText);
    if (names.length === 0 && !templateOf) {
      this.setStatus("No names to save. Enter at least one name.");
      return;
    }
    // §10: List and Breakdown packs keep their ## sections; packs without headings save as before.
    const sectioned =
      this.currentPackType === "listPack" || this.currentPackType === "breakdownPack"
        ? parseNameSections(namesText) ?? undefined
        : undefined;

    const normalizedFilePath = normalizePath(filePath);
    const folderPath = normalizedFilePath.includes("/")
      ? normalizedFilePath.substring(0, normalizedFilePath.lastIndexOf("/"))
      : "";
    if (folderPath && !this.app.vault.getFolderByPath(folderPath)) {
      this.setStatus(`Folder not found at ${folderPath}. Select or create it first.`);
      return;
    }

    const packType = this.currentPackType;
    if (packType === "recipePack") {
      this.setStatus("Recipes are saved from the recipe editor.");
      return;
    }
    const content = createNamesFileContent(this.plugin.settings.packName || "nameForge", names, packType, {
      templateOf,
      sectioned,
    });
    try {
      const existingFile = this.app.vault.getFileByPath(normalizedFilePath);
      if (existingFile instanceof TFile) {
        if (await this.isTemplateFile(existingFile)) {
          this.setStatus("A template already has that name. Choose another pack name.");
          return;
        }
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
    joining: "joined" | "spaced",
    templateOf?: string,
  ) {
    const filePath = this.getResolvedFilePath();
    if (!filePath) {
      this.setStatus("No folder set for name packs. Set one first.");
      return;
    }

    if (!templateOf && parts.some((part) => part.length === 0)) {
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

    const content = createCompoundNamesFileContent(this.plugin.settings.packName || "nameForge", parts, generator, joining, templateOf);
    try {
      const existingFile = this.app.vault.getFileByPath(normalizedFilePath);
      if (existingFile instanceof TFile) {
        if (await this.isTemplateFile(existingFile)) {
          this.setStatus("A template already has that name. Choose another pack name.");
          return;
        }
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

  public async saveMixToConfiguredFile(sources: MixSourceRef[], templateOf?: string) {
    const filePath = this.getResolvedFilePath();
    if (!filePath) {
      this.setStatus("No folder set for name packs. Set one first.");
      return;
    }

    if (!templateOf && sources.length < 2) {
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

    const content = createMixNamesFileContent(this.plugin.settings.packName || "nameForge", sources, templateOf);
    try {
      const existingFile = this.app.vault.getFileByPath(normalizedFilePath);
      if (existingFile instanceof TFile) {
        if (await this.isTemplateFile(existingFile)) {
          this.setStatus("A template already has that name. Choose another pack name.");
          return;
        }
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
        if (isRecipeContent(content)) {
          if (!parseRecipeContent(content).recipe.template) packs.push({ path: child.path, packType: "recipePack" });
          continue;
        }
        if (isValidNamePackContent(content)) {
          const parsed = parseNamesFileContent(content);
          if (parsed.template) continue; // §7: templates never appear in the generate view
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

    if (isRecipeContent(content)) {
      await this.loadRecipePack(file);
      return;
    }
    this.currentRecipePath = undefined;
    this.editRecipeButton?.hide();

    const resolved = await this.resolvePackTemplate(packPath, parseNamesFileContent(content));
    const parsed = resolved.parsed;
    this.currentTemplateError = resolved.error;
    if (parsed.packName) {
      this.plugin.settings.packName = parsed.packName;
    }

    this.currentPackType = parsed.packType;
    this.currentSectioned = parsed.sectioned;
    await this.updateSectionChoices(parsed);
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
    this.setStatus(resolved.error ?? "");
  }

  /**
   * §7: applies a pack's template. A missing template, a template that itself has a template, or
   * one of a different pack type stops generation with a message naming the template.
   */
  /** §7: saving never overwrites a template (e.g. a derived pack given its template's name). */
  public async isTemplateFile(file: TFile): Promise<boolean> {
    try {
      const frontmatter = (await this.app.vault.cachedRead(file)).match(/^---\s*\n([\s\S]*?)\n---/);
      return !!frontmatter && !!parseTemplateFields(frontmatter[1]).template;
    } catch {
      return false;
    }
  }

  public async resolvePackTemplate(path: string, parsed: NamesFileData): Promise<{ parsed: NamesFileData; error?: string }> {
    if (!parsed.templateOf) return { parsed };
    const file = this.app.metadataCache.getFirstLinkpathDest(parsed.templateOf, path);
    let template: NamesFileData | undefined;
    if (file instanceof TFile) {
      try {
        template = parseNamesFileContent(await this.app.vault.cachedRead(file));
      } catch {
        template = undefined;
      }
    }
    return applyTemplate(parsed, template);
  }

  /** A recipe pack (§6): no names of its own; it generates place names from shapes. */
  private async loadRecipePack(file: TFile) {
    this.currentPackType = "recipePack";
    this.currentRecipePath = file.path;
    this.recipeEtymology = undefined;
    this.currentNamesText = "";
    this.currentSectioned = undefined;
    this.currentTemplateError = undefined;
    this.sectionChoices = [];
    this.sectionSelectEl?.hide();
    this.editRecipeButton?.toggle(this.activeSection === "markov");
    this.plugin.settings.packName = file.basename;
    this.plugin.settings.namesFilePath = file.path;
    this.plugin.settings.folderPath = this.getFolderPath() || DEFAULT_NAMES_FOLDER;
    await this.plugin.saveSettings();
    this.updatePackDropdownTrigger(file.path, "recipePack");
    const { problems } = parseRecipeContent(await this.app.vault.cachedRead(file));
    this.setStatus(problems.join(" "));
  }

  private async runRecipe() {
    const file = this.currentRecipePath ? this.app.vault.getFileByPath(this.currentRecipePath) : null;
    if (!(file instanceof TFile)) {
      this.setStatus("Recipe not found. Reselect it from the pack list.");
      return;
    }
    const host = new RecipeHost(this.app, this.plugin.settings, await this.scanFolderPacks(), {
      targetReason: (entry, index) => this.targetPackReason(entry, index),
      targetNames: (entry, index) => this.ageingTargetNames(entry, index),
    });
    const loaded = await host.loadRecipe(file);
    if (loaded.error) {
      this.setStatus(loaded.error);
      return;
    }
    const slots = await host.resolveSlots(loaded.recipe, file.path);
    const seedOverride = this.seedLocked ? parseSeedInput(this.seedInputEl?.value) : undefined;
    // A takeover pack makes each adapted native name take a fraction of a second: show the dots
    // (no text) and yield between names so they keep moving (recipe takeover §A6).
    renderLoading(this.resultsEl);
    await waitForPaint();
    let result: NameGenerateResult;
    try {
      const adapt = host.resolveTakeover(loaded.recipe, file.path);
      const steps = generatePlaceNamesSteps({ recipe: loaded.recipe, slots, count: this.generationCount, seed: seedOverride, adapt });
      for (;;) {
        const next = steps.next();
        if (next.done) {
          result = next.value;
          break;
        }
        await waitForTask();
      }
    } catch (error) {
      this.renderResults([]);
      this.setStatus(error instanceof Error ? error.message : "Couldn't generate names from this recipe.");
      return;
    }
    if (this.recipeEtymology === undefined) this.recipeEtymology = loaded.recipe.render.etymology;
    this.currentSeed = result.seed;
    this.renderRecipeResults(result.names);
    await this.recordGenerationHistory(result.names.length);
    this.setStatus([...loaded.problems, ...result.notices, ...host.getNotices()].join(" "));
  }

  /** Recipe results: placeholders muted, etymology beneath each name when the toggle is on. */
  /**
   * Recipe-style results: placeholders muted, etymology beneath each name when its toggle is on.
   * `etymology` picks whose toggle: recipe packs, the place-name modules (off by default), or none
   * (river names: no etymology button at all).
   */
  private renderRecipeResults(names: GeneratedName[], etymology: "recipe" | "module" | "none" = "recipe") {
    if (!this.resultsEl) return;
    this.resultsEl.empty();
    const shown = () => (etymology === "module" ? this.moduleEtymology : etymology === "recipe" ? !!this.recipeEtymology : false);
    const list = this.resultsEl.createEl("ul", { cls: "nameforge-modal__results-list nameforge-modal__recipe-results" });
    list.toggleClass("is-etymology-hidden", !shown());
    const actions = this.resultsEl.createDiv({ cls: "nameforge-modal__results-actions" });
    this.buildSeedControls(actions.createDiv({ cls: "nameforge-modal__seed-group" }));
    const buttonsGroup = actions.createDiv({ cls: "nameforge-modal__results-buttons" });
    const button = (icon: string, title: string) => {
      const b = buttonsGroup.createEl("button", { cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg", attr: { type: "button", title } });
      setIcon(b, icon);
      return b;
    };
    if (etymology !== "none") {
      const etymologyButton = button("list-tree", "Etymology");
      const updateEtymology = () => {
        etymologyButton.toggleClass("is-active", shown());
        etymologyButton.setAttribute("aria-pressed", String(shown()));
        list.toggleClass("is-etymology-hidden", !shown());
      };
      etymologyButton.addEventListener("click", () => {
        if (etymology === "module") this.moduleEtymology = !this.moduleEtymology;
        else this.recipeEtymology = !this.recipeEtymology;
        updateEtymology();
      });
      updateEtymology();
    }
    const insertButton = button(ICON_TEXT_INSERT, "Insert");
    const checklistButton = button(ICON_CHECKLIST_INSERT, "Insert checklist");
    const bulletButton = button(ICON_BULLET_INSERT, "Insert bullet list");

    const selected = (): string[] =>
      Array.from(list.querySelectorAll("li.is-selected")).map((el) => names[Number((el as HTMLElement).dataset.index)].text);
    const update = () => {
      const n = selected().length;
      insertButton.disabled = n !== 1;
      checklistButton.disabled = n === 0;
      bulletButton.disabled = n === 0;
    };
    this.clearResultsSelection = () => {
      list.querySelectorAll("li.is-selected").forEach((el) => el.classList.remove("is-selected"));
      update();
    };
    names.forEach((n, i) => {
      const item = list.createEl("li", { attr: { "data-index": String(i) } });
      const nameEl = item.createDiv({ cls: "nameforge-modal__recipe-name" });
      // Placeholders are shown muted (§8).
      for (const part of n.text.split(/(\[[^\]]+\])/)) {
        if (!part) continue;
        if (part.startsWith("[")) nameEl.createSpan({ cls: "nameforge-modal__placeholder-part", text: part });
        else nameEl.appendText(part);
      }
      if (etymology !== "none") item.createDiv({ cls: "nameforge-modal__recipe-etymology", text: n.etymology });
      item.addEventListener("click", () => {
        item.classList.toggle("is-selected");
        update();
      });
    });
    if (names.length === 0) list.createEl("li", { cls: "nameforge-modal__placeholder", text: "No names generated." });
    insertButton.addEventListener("click", () => {
      const [text] = selected();
      if (text) this.insertPlainText(text);
    });
    checklistButton.addEventListener("click", () => {
      const lines = selected();
      if (lines.length > 0) this.insertNamesAsList(lines, "checklist");
    });
    bulletButton.addEventListener("click", () => {
      const lines = selected();
      if (lines.length > 0) this.insertNamesAsList(lines, "bullet");
    });
    if (this.panelMode) {
      const history = this.resultsEl.createEl("button", { cls: "nameforge-modal__panel-action", attr: { type: "button" } });
      setIcon(history.createSpan({ cls: "nameforge-modal__panel-action-icon" }), ICON_PREVIOUS_GENERATIONS);
      history.createSpan({ cls: "nameforge-modal__panel-action-label", text: "previous generations" });
      history.addEventListener("click", () => new PreviousGenerationsModal(this.app, this).open());
    }
    update();
  }

  /** Opens the recipe editor for the recipe at `path` (new recipes are made in the pack editor's wizard). */
  public async openRecipeEditor(path?: string) {
    new RecipeEditorModal(this.app, await this.recipeEditorOptions(path)).open();
  }

  /** What the place name wizard needs: this folder's packs, lists, recipe templates and takeover packs. */
  public async recipeEditorOptions(path?: string): Promise<RecipeEditorOptions> {
    const folderPath = this.getFolderPath() || DEFAULT_NAMES_FOLDER;
    const folder = this.app.vault.getFolderByPath(normalizePath(folderPath));
    const packs: string[] = [];
    const lists: string[] = [];
    const templates: { name: string; description: string }[] = [];
    // Takeover packs for colonial recipes: the takeover section's own eligibility rules (ageing §1).
    const index = await this.scanFolderPacks();
    const takeoverPacks = index
      .filter((entry) => !entry.parsed.template)
      .map((entry) => ({
        name: entry.path.split("/").pop()?.replace(/\.md$/i, "") || entry.path,
        reason: this.targetPackReason(entry, index),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const child of folder?.children ?? []) {
      if (!(child instanceof TFile) || child.extension !== "md") continue;
      const content = await this.app.vault.cachedRead(child);
      if (isRecipeContent(content)) {
        const parsed = parseRecipeContent(content);
        if (parsed.recipe.template) templates.push({ name: child.basename, description: parsed.body.trim().split("\n")[0] || "No description" });
      } else if (isWordListContent(content)) {
        lists.push(child.basename);
      } else if (isValidNamePackContent(content) && !parseNamesFileContent(content).template) {
        packs.push(child.basename);
      }
    }
    const file = path ? this.app.vault.getFileByPath(path) : null;
    return {
      folderPath,
      file: file instanceof TFile ? file : undefined,
      packs: packs.sort(),
      lists: lists.sort(),
      templates: templates.sort((a, b) => a.name.localeCompare(b.name)),
      takeoverPacks,
      onSaved: (saved) => {
        this.plugin.settings.namesFilePath = saved;
        void this.refreshPackDropdown().then(() => this.loadPack(saved));
      },
    };
  }

  /** Fills the Section selector for List and Breakdown packs with sections, and Mix packs whose sources have them. */
  private async updateSectionChoices(parsed: NamesFileData) {
    let choices: { label: string; request: SectionRequest }[] = [];
    if (parsed.sectioned) {
      choices = sectionOptions(parsed.sectioned);
    } else if (parsed.packType === "mixPack") {
      const index = await this.scanFolderPacks();
      const seen = new Set<string>();
      for (const ref of parsed.mixSources ?? []) {
        const source = findPackInIndex(index, ref.packName);
        for (const option of source?.parsed.sectioned ? sectionOptions(source.parsed.sectioned) : []) {
          if (seen.has(option.label.toLowerCase())) continue;
          seen.add(option.label.toLowerCase());
          choices.push(option);
        }
      }
    }
    this.sectionChoices = choices;
    this.currentSectionRequest = undefined;
    const select = this.sectionSelectEl;
    if (!select) return;
    select.empty();
    select.createEl("option", { text: "whole pack", value: "-1" });
    choices.forEach((c, i) => select.createEl("option", { text: c.label, value: String(i) }));
    select.value = "-1";
    select.toggle(this.activeSection === "markov" && choices.length > 0);
  }

  private async generateSelectedCount() {
    if (this.activeSection === "placeShapes" && this.placeIsBritain()) {
      // River brief §2: rendered names from the fixed built-in recipe, shown as recipe results.
      const seedOverride = this.seedLocked ? parseSeedInput(this.seedInputEl?.value) : undefined;
      const land = this.land("britain");
      const biome = findBiome(land.biome, this.customBiomes);
      const result = this.tryLand(() => generatePlaceNames({
        recipe: britishPlaceNamesRecipe(this.selectedRegion, biome?.custom ? undefined : land.biome, land.terrain),
        biome: biome?.custom ? biome : undefined,
        slots: {},
        count: this.generationCount,
        seed: seedOverride,
        faithfulness: this.plugin.settings.faithfulness,
        strictness: this.plugin.settings.strictness,
      }));
      if (!result) return;
      this.currentSeed = result.seed;
      this.renderRecipeResults(result.names, "module");
      await this.recordGenerationHistory(
        result.names.length,
        withRegion(BRITISH_PLACE_NAMES_HISTORY_NAME, this.selectedRegion) + landHistorySuffix(land, this.customBiomes),
      );
      this.setStatus(result.notices.join(" "));
      return;
    }
    // Place names' British river names: the river engine's British setting, with the place names region.
    const placeRivers = this.activeSection === "placeShapes" && this.placeIsRivers();
    if (this.activeSection === "riverNames" || placeRivers) {
      const seedOverride = this.seedLocked ? parseSeedInput(this.seedInputEl?.value) : undefined;
      const setting: RiverSetting = placeRivers ? "british" : this.riverSetting;
      const british = setting === "british";
      const region = placeRivers ? this.selectedRegion : this.riverRegion;
      const biome = british ? undefined : findBiome(this.land("river").biome, this.customBiomes);
      const result = generateRiverNames({
        setting,
        region: british ? region : undefined,
        biome: biome?.id,
        count: this.generationCount,
        seed: seedOverride,
        faithfulness: this.plugin.settings.faithfulness,
        strictness: this.plugin.settings.strictness,
      });
      this.currentSeed = result.seed;
      this.renderRecipeResults(
        result.names.map((n) => ({ text: n.text, hasPlaceholder: n.hasPlaceholder, etymology: "" }) as GeneratedName),
        "none",
      );
      // History keeps the brief's short setting names ("river names · British"), not the menu label.
      const settingLabel = british ? "British" : RIVER_SETTINGS.find((s) => s.id === setting)!.label;
      // Tribal brief §19.5: "river names · New Land · savannah" when a biome is set.
      const label = `${RIVER_NAMES_HISTORY_NAME} · ${settingLabel}${biome ? ` · ${biome.label.toLowerCase()}` : ""}`;
      await this.recordGenerationHistory(result.names.length, british ? withRegion(label, region) : label);
      this.setStatus(result.notice ?? "");
      return;
    }
    if (this.activeSection === "placeShapes") {
      const seedOverride = this.seedLocked ? parseSeedInput(this.seedInputEl?.value) : undefined;
      const era = this.worldEras[this.worldCulture];
      // Land brief §7: the culture's own land choice (Homeland and Any terrain change nothing).
      const land = cultureUsesBiomes(this.worldCulture) ? this.land(`world:${this.worldCulture}`) : DEFAULT_LAND;
      const result = generateWorldPlaceNames({
        culture: this.worldCulture,
        era,
        biome: findBiome(land.biome, this.customBiomes),
        terrain: land.terrain,
        count: this.generationCount,
        seed: seedOverride,
        faithfulness: this.plugin.settings.faithfulness,
        strictness: this.plugin.settings.strictness,
      });
      this.currentSeed = result.seed;
      this.renderRecipeResults(
        result.names.map((n) => ({ text: n.text, hasPlaceholder: false, etymology: n.etymology }) as GeneratedName),
        "module",
      );
      await this.recordGenerationHistory(
        result.names.length,
        worldHistoryLabel(WORLD_PLACE_NAMES_HISTORY_NAME, this.worldCulture, era) + landHistorySuffix(land, this.customBiomes),
      );
      this.setStatus(result.notices.join(" "));
      return;
    }
    if (this.activeSection === "nameAgeing") {
      await this.runAgeing();
      return;
    }
    if (this.activeSection === "nameTakeover") {
      this.takeoverView.resultsEl = this.resultsEl;
      await this.takeoverView.run(this.generationCount);
      return;
    }
    if (this.activeSection === "tribalNames") {
      await this.runTribalNames();
      return;
    }
    const colonialPart = COLONIAL_SECTION_PART[this.activeSection];
    if (colonialPart) {
      const seedOverride = this.seedLocked ? parseSeedInput(this.seedInputEl?.value) : undefined;
      const tradition = this.selectedTradition[colonialPart];
      const context = this.selectedContext[colonialPart];
      const land = this.land(`colonial:${colonialPart}`);
      const custom = findBiome(land.biome, this.customBiomes)?.custom ? findBiome(land.biome, this.customBiomes) : undefined;
      const biome = custom ? undefined : land.biome;
      // River brief §3: rendered names from the fixed built-in recipe, shown as recipe results.
      const result = this.tryLand(() => generatePlaceNames({
        recipe: colonialPlaceNamesRecipe(colonialPart === "2" ? "new-land" : "established", tradition, context, biome, land.terrain),
        biome: custom,
        slots: {},
        count: this.generationCount,
        seed: seedOverride,
        faithfulness: this.plugin.settings.faithfulness,
        strictness: this.plugin.settings.strictness,
      }));
      if (!result) return;
      this.currentSeed = result.seed;
      this.renderRecipeResults(result.names, "module");
      await this.recordGenerationHistory(
        result.names.length,
        colonialHistoryLabel(SECTION_LABELS[this.activeSection], colonialPart, tradition, context, custom ? undefined : biome) +
          landHistorySuffix(land, this.customBiomes, !!custom),
      );
      this.setStatus("");
      return;
    }
    if (this.activeSection !== "markov") {
      // Placeholder sections have no packs yet — leave the current results untouched.
      this.setStatus(`${SECTION_LABELS[this.activeSection]} has no packs yet.`);
      return;
    }
    if (this.currentPackType === "recipePack") {
      await this.runRecipe();
      return;
    }
    if (this.currentTemplateError) {
      this.setStatus(this.currentTemplateError);
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
      if (mixEntry.templateError) {
        this.renderResults([], mixEntry.templateError);
        this.setStatus(mixEntry.templateError);
        return;
      }
      const resolved = resolveMixSources(normalizePath(mixPath), mixData, index, undefined, this.currentSectionRequest);

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

    // §10: a chosen section narrows the names; Breakdown sections under 20 names fall back.
    let namesText = this.currentNamesText;
    let sectionNotices: string[] = [];
    if (this.currentSectionRequest && this.currentSectioned) {
      const selection = selectSectionNames(
        this.currentSectioned,
        this.currentSectionRequest,
        this.currentPackType === "breakdownPack" ? 20 : 0,
      );
      namesText = selection.names.join("\n");
      sectionNotices = selection.notices;
    }
    const result = generateNamesFromSource(
      namesText,
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
    this.setStatus(sectionNotices.join(" "));
  }

  /**
   * Appends the just-used seed to the config file's generation history,
   * most-recent first, capped at MAX_HISTORY_ENTRIES.
   */
  /** The module whose history the previous generations list shows: the active one. */
  public historySectionShown(): NameForgeSection {
    return this.activeSection;
  }

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
      if (this.activeSection === "nameAgeing") new AgeingHistoryModal(this.app, this).open();
      else new PreviousGenerationsModal(this.app, this).open();
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
        if (isRecipeContent(content)) {
          iconsByName.set(child.basename, packTypeIconId("recipePack"));
          continue;
        }
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

    for (const entry of index) {
      if (!entry.parsed.templateOf) continue;
      const resolved = await this.resolvePackTemplate(entry.path, entry.parsed);
      entry.parsed = resolved.parsed;
      if (resolved.error) entry.templateError = resolved.error;
    }
    return index;
  }

  /** Template packs of one type (or word lists), for "Start from template" in the editor. */
  public async listTemplates(kind: NamePackType | "wordList"): Promise<{ name: string; description: string }[]> {
    const folderPath = this.getFolderPath();
    const folder = folderPath ? this.app.vault.getFolderByPath(normalizePath(folderPath)) : null;
    if (!folder) return [];
    const out: { name: string; description: string }[] = [];
    for (const child of folder.children) {
      if (!(child instanceof TFile) || child.extension !== "md") continue;
      try {
        const content = await this.app.vault.cachedRead(child);
        if (kind === "wordList") {
          if (!isWordListContent(content)) continue;
          const parsed = parseWordListFileContent(content, child.basename);
          if (!parsed.template) continue;
          const sections = parsed.list.sections.map((s) => s.name);
          out.push({ name: child.basename, description: sections.length > 0 ? sections.join(", ") : "No sections" });
        } else {
          if (!isValidNamePackContent(content)) continue;
          const parsed = parseNamesFileContent(content);
          if (!parsed.template || parsed.packType !== kind) continue;
          const sections = parsed.sectioned?.sections.map((s) => s.name) ?? [];
          const count = parsed.packType === "mixPack" ? `${parsed.mixSources?.length ?? 0} sources` : `${parsed.names.length} names`;
          out.push({ name: child.basename, description: sections.length > 0 ? `${count}; sections: ${sections.join(", ")}` : count });
        }
      } catch {
        continue;
      }
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }

  public async listFolderPacks(): Promise<{
    path: string;
    packName: string;
    packType: NamePackType;
    compoundGenerator?: "breakdown" | "list";
  }[]> {
    const index = await this.scanFolderPacks();
    return index.filter((entry) => !entry.parsed.template).map((entry) => ({
      path: entry.path,
      packName: entry.parsed.packName || entry.path.split("/").pop()?.replace(/\.md$/i, "") || entry.path,
      packType: entry.parsed.packType,
      compoundGenerator: entry.parsed.compoundGenerator,
    }));
  }
}

/** Read-only guide to the colonial traditions usable for this part; clicking one selects it. */
class TraditionGuideModal extends Modal {
  constructor(
    app: App,
    private readonly part: ColonialPart,
    private readonly onSelect: (traditionId: string | undefined) => void,
  ) {
    super(app);
  }

  onOpen() {
    this.titleEl.setText("Tradition guide");
    this.modalEl.addClass("nameforge-guide-modal");
    const list = this.contentEl.createDiv({ cls: "nameforge-guide-modal__list" });
    for (const tradition of COLONIAL_TRADITIONS) {
      const available = tradition.parts.includes(this.part);
      if (!available) continue;
      const entry = list.createDiv({
        cls: "nameforge-guide-modal__entry" + (available ? "" : " is-unavailable"),
        attr: available ? { role: "button", tabindex: "0" } : {},
      });
      const heading = entry.createDiv({ cls: "nameforge-guide-modal__heading" });
      heading.createSpan({ cls: "nameforge-guide-modal__name", text: traditionLabel(this.part, tradition.id, tradition.label) });
      heading.createSpan({ cls: "nameforge-guide-modal__parts", text: partsNote(tradition.parts) });
      entry.createDiv({ cls: "nameforge-guide-modal__text", text: tradition.guide });
      if (available) {
        entry.addEventListener("click", () => {
          this.onSelect(tradition.id === "general" ? undefined : tradition.id);
          this.close();
        });
      }
    }
    this.contentEl.createEl("p", { cls: "nameforge-guide-modal__credit", text: "Above text created by Claude.ai" });
  }

  onClose() {
    this.contentEl.empty();
  }
}

/** The ageing run history — separate from generation history, reached from the ageing section. */
class AgeingHistoryModal extends Modal {
  constructor(
    app: App,
    private parent: NameForgeModal,
  ) {
    super(app);
  }

  onOpen() {
    this.titleEl.setText("Ageing history");
    this.modalEl.addClass("nameforge-history-modal");
    const { contentEl } = this;
    contentEl.addClass("nameforge-history-modal__content");
    const history = this.parent.plugin.settings.ageingHistory ?? [];
    if (history.length === 0) {
      contentEl.createDiv({ cls: "nameforge-history-modal__empty", text: "No ageing runs yet." });
      return;
    }
    const list = contentEl.createDiv({ cls: "nameforge-history-modal__list" });
    for (const entry of history) {
      const row = list.createDiv({ cls: "nameforge-history-modal__row" });
      setIcon(row.createSpan({ cls: "nameforge-history-modal__pack-icon" }), SECTION_ICONS.nameAgeing);
      row.createSpan({ cls: "nameforge-history-modal__pack-name", text: entry.label });
      row.createSpan({ cls: "nameforge-history-modal__seed", text: String(entry.seed) });
      const copy = row.createEl("button", { cls: "nameforge-history-modal__copy", attr: { type: "button", title: "Copy seed" } });
      setIcon(copy, ICON_SEED_COPY);
      copy.addEventListener("click", (event) => {
        event.stopPropagation();
        void navigator.clipboard.writeText(String(entry.seed));
      });
    }
  }

  onClose() {
    this.contentEl.empty();
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
    // Each module shows only its own history (river names only in river names, and so on).
    const section = this.parent.historySectionShown();
    const history = (this.parent.plugin.settings.previousGenerations ?? []).filter(
      (entry) => historySection(entry.packName) === section,
    );
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
      const entrySection = historySection(entry.packName);
      setIcon(
        iconEl,
        entrySection === "markov"
          ? iconsByName.get(entry.packName) ?? ICON_BREAKDOWN_PACK
          : entry.packName.startsWith(GENERIC_PLACE_NAMES_HISTORY_NAME)
          ? ICON_GENERIC_PLACE_NAMES
          : SECTION_ICONS[entrySection],
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
const WORD_LIST_TEXTAREA_PLACEHOLDER =
  "One ## section per slot category, each with a table, - lines of words, and // lines naming packs.\n\n## Wild animal\n| Modern | Traditional | Plural | Combining forms | Fuses |\n|---|---|---|---|---|\n| kangaroo | — | kangaroos | Kangaroo- | No |\n| emu | — | emus | Emu- | Yes |\n\n## Status or role\n- Knight, Earl, Baron, King\n\n## Saint or holy person\n// Saxon Men (male)\n// Saxon Women (female)";
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
  private wordListButton: HTMLButtonElement | null = null;
  /** §9: the editor is creating a word list rather than a name pack. */
  private wordListMode = false;
  /** The place name wizard replaces the stage's text box; it is built the first time it's chosen. */
  private wizardMode = false;
  private wizardButton: HTMLButtonElement | null = null;
  private wizardPaneEl: HTMLElement | null = null;
  private wizard: RecipeWizard | null = null;
  private templateRowEl: HTMLElement | null = null;
  /** The word list guide's help icon, shown while the Word list tab is selected. */
  private wordListHelpEl: HTMLElement | null = null;
  private stageEl: HTMLElement | null = null;
  /** §7: "Start from template" — the chosen template's note name, if any. */
  private templateOf: string | undefined = undefined;
  private templateSelectEl: HTMLSelectElement | null = null;
  private templateHintEl: HTMLElement | null = null;
  private templateOptions: { name: string; description: string }[] = [];
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
    const addTypeButton = (label: string, iconId: string): HTMLButtonElement => {
      const button = typeToggle.createEl("button", { cls: "nameforge-modal__toggle-button" });
      setIcon(button.createSpan({ cls: "nameforge-modal__toggle-button-icon" }), iconId);
      button.createSpan({ text: label });
      return button;
    };
    this.breakdownButton = addTypeButton("Breakdown", ICON_BREAKDOWN_PACK);
    this.breakdownButton.addEventListener("click", () => {
      this.setPackType("breakdownPack");
    });

    this.listButton = addTypeButton("List", ICON_LIST_PACK);
    this.listButton.addEventListener("click", () => {
      this.setPackType("listPack");
    });

    this.compoundButton = addTypeButton("Compound", ICON_COMPOUND_BREAKDOWN_PACK);
    this.compoundButton.addEventListener("click", () => {
      this.setPackType("compoundPack");
    });

    this.mixButton = addTypeButton("Mix", ICON_MIX_PACK);
    this.mixButton.addEventListener("click", () => {
      this.setPackType("mixPack");
    });
    // Place, Recipe and Word list sit on a second line.
    typeToggle.createDiv({ cls: "nameforge-modal__toggle-break" });
    this.placeButton = addTypeButton("Place", ICON_PLACE_PACK);
    this.placeButton.addEventListener("click", () => {
      this.setPackType("placePack");
    });

    this.wizardButton = addTypeButton("Place name wizard", packTypeIconId("recipePack"));
    this.wizardButton.addEventListener("click", () => {
      this.wizardMode = true;
      this.wordListMode = false;
      this.updateTypeButtons();
      void this.openWizard();
    });

    this.wordListButton = addTypeButton("Word list", ICON_WORD_LIST);
    this.wordListButton.addEventListener("click", () => {
      this.wordListMode = true;
      this.wizardMode = false;
      this.updateTypeButtons();
      void this.loadTemplateOptions();
    });

    // §7: start from a template of the chosen type; the new pack stores only its differences.
    const templateRow = contentEl.createDiv({ cls: "nameforge-editor-modal__template-row" });
    this.templateRowEl = templateRow;
    templateRow.createSpan({ cls: "nameforge-editor-modal__template-label", text: "Start from template" });
    this.templateSelectEl = templateRow.createEl("select", { cls: "dropdown", attr: { "aria-label": "Start from template" } });
    this.wordListHelpEl = templateRow.createSpan({
      cls: "clickable-icon nameforge-editor-modal__help",
      attr: { role: "button", "aria-label": "How to write a word list" },
    });
    setIcon(this.wordListHelpEl, "circle-help");
    this.wordListHelpEl.addEventListener("click", () => new WordListGuideModal(this.app).open());
    this.templateSelectEl.addEventListener("change", () => {
      const value = this.templateSelectEl?.value ?? "";
      this.templateOf = value || undefined;
      this.updateTemplateHint();
    });
    this.templateHintEl = contentEl.createDiv({ cls: "nameforge-editor-modal__template-hint" });

    // Fixed-height stage: the plain textarea, the compound section, and the mix
    // section are all absolutely positioned to fill it and shown/hidden as
    // alternates, so none of them can ever affect the stage's own box size.
    const stage = contentEl.createDiv({ cls: "nameforge-editor-modal__stage" });
    this.stageEl = stage;

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
    // The wizard's pane: its page scrolls inside the stage, so the modal keeps its size.
    this.wizardPaneEl = stage.createDiv({ cls: "nameforge-editor-modal__stage-pane nameforge-editor-modal__wizard" });
    this.wizardPaneEl.hide();

    this.selectedPackType = this.parent.currentPackType;
    this.updateTypeButtons();
    this.updateCompoundControls();
    void this.loadMixPackOptions();
    void this.loadTemplateOptions();

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
    this.wordListMode = false;
    this.wizardMode = false;
    this.updateTypeButtons();
    void this.loadTemplateOptions();
  }

  /** Lists templates of the chosen type, each with a short description. */
  private async loadTemplateOptions() {
    this.templateOptions = await this.parent.listTemplates(this.wordListMode ? "wordList" : this.selectedPackType);
    const select = this.templateSelectEl;
    if (!select) return;
    select.empty();
    select.createEl("option", { text: this.templateOptions.length > 0 ? "None" : "No templates of this type", value: "" });
    for (const t of this.templateOptions) select.createEl("option", { text: t.name, value: t.name });
    if (!this.templateOptions.some((t) => t.name === this.templateOf)) this.templateOf = undefined;
    select.value = this.templateOf ?? "";
    select.disabled = this.templateOptions.length === 0;
    this.updateTemplateHint();
  }

  private updateTemplateHint() {
    const chosen = this.templateOptions.find((t) => t.name === this.templateOf);
    if (!this.templateHintEl) return;
    this.templateHintEl.setText(
      chosen ? `${chosen.description}. Anything you leave empty comes from the template.` : "",
    );
    this.templateHintEl.toggle(!!chosen);
  }

  /** §9: saves the textarea as a word-list pack (tables under ## sections). */
  private async saveWordList(packName: string) {
    const body = this.inputEl?.value ?? "";
    const list = parseWordList(body);
    // Table rows, `-` words and `//` pack lines all count.
    const entries =
      list.unsectioned.length + list.unsectionedPacks.length + list.sections.reduce((n, s) => n + s.entries.length + s.packs.length, 0);
    if (entries === 0 && !this.templateOf) {
      this.parent.setStatus("No words to save. Add a table, a - list or a // pack line.");
      return;
    }
    let folderPath = this.parent.getFolderPath();
    if (!folderPath) {
      const folder = await this.parent.promptForFolderSelection();
      if (!folder) return;
      folderPath = folder.path;
    }
    const path = normalizePath(`${folderPath}/${sanitizePackNameForFilename(packName)}.md`);
    const content = createWordListFileContent(packName, body, this.templateOf);
    try {
      const existing = this.app.vault.getFileByPath(path);
      if (existing instanceof TFile && (await this.parent.isTemplateFile(existing))) {
        this.parent.setStatus("A template already has that name. Choose another name.");
        return;
      }
      if (existing instanceof TFile) await this.app.vault.modify(existing, content);
      else await this.app.vault.create(path, content);
    } catch {
      this.parent.setStatus(`Failed to save the word list to ${path}.`);
      return;
    }
    new Notice(`nameForge: word list “${packName}” saved.`);
    this.close();
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
    const isWizard = this.wizardMode;
    const isWordList = !isWizard && this.wordListMode;
    const other = isWizard || isWordList;
    const isBreakdown = !other && this.selectedPackType === "breakdownPack";
    const isList = !other && this.selectedPackType === "listPack";
    const isCompound = !other && this.selectedPackType === "compoundPack";
    const isPlace = !other && this.selectedPackType === "placePack";
    const isMix = !other && this.selectedPackType === "mixPack";
    this.wizardButton?.classList.toggle("is-active", isWizard);
    this.wizardButton?.setAttribute("aria-pressed", String(isWizard));
    // The wizard has its own template choice on its first page. Its pane takes over the template
    // row's height as well, so the modal doesn't change size.
    if (isWizard && this.stageEl && this.templateRowEl?.isShown()) {
      const outer = (el: HTMLElement | null) => {
        if (!el || !el.isShown()) return 0;
        const style = getComputedStyle(el);
        return el.getBoundingClientRect().height + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
      };
      const extra = outer(this.templateRowEl) + outer(this.templateHintEl);
      this.stageEl.style.setProperty("--nf-wizard-extra-height", `${extra}px`);
    } else if (!isWizard) {
      this.stageEl?.style.setProperty("--nf-wizard-extra-height", "0px");
    }
    this.templateRowEl?.toggle(!isWizard);
    this.wordListHelpEl?.toggle(isWordList);
    this.templateHintEl?.toggle(!isWizard);
    this.wizardPaneEl?.toggle(isWizard);
    this.wordListButton?.classList.toggle("is-active", isWordList);
    this.wordListButton?.setAttribute("aria-pressed", String(isWordList));
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
      this.inputEl.placeholder = isWordList
        ? WORD_LIST_TEXTAREA_PLACEHOLDER
        : isPlace
          ? PLACE_TEXTAREA_PLACEHOLDER
          : NAME_TEXTAREA_PLACEHOLDER;
    }

    if (isWizard) {
      this.inputEl?.hide();
      this.compoundSectionEl?.hide();
      this.mixSectionEl?.hide();
    } else if (isCompound) {
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

  /** Builds the place name wizard in its pane the first time it's chosen; it keeps its answers after. */
  private async openWizard() {
    if (this.wizard || !this.wizardPaneEl) return;
    const pane = this.wizardPaneEl;
    this.wizard = new RecipeWizard(this.app, await this.parent.recipeEditorOptions(), pane, () => this.packNameInput?.value ?? "");
    await this.wizard.load();
  }

  private async saveNames() {
    if (this.wizardMode) {
      if (this.wizard && (await this.wizard.save())) this.close();
      return;
    }
    const packName = this.packNameInput?.value?.trim() || "nameForge";
    const templateOf = this.templateOf;
    if (this.wordListMode) {
      await this.saveWordList(packName);
      return;
    }

    if (this.selectedPackType === "compoundPack") {
      const parts = this.partTextareas
        .slice(0, this.compoundPartsCount)
        .map((textarea) => extractNamesFromMarkdown(textarea.value || ""));

      if (!templateOf && parts.some((part) => part.length === 0)) {
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

      await this.parent.saveCompoundToConfiguredFile(parts, this.compoundGenerator, this.compoundJoining, templateOf);
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
      if (!templateOf && (sources.length < 2 || unique.size < 2)) {
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

      await this.parent.saveMixToConfiguredFile(sources, templateOf);
      this.close();
      return;
    }

    const namesText = this.inputEl?.value || "";
    if (!namesText.trim() && !templateOf) {
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

    await this.parent.saveToConfiguredFile(namesText, templateOf);
    this.close();
  }
}