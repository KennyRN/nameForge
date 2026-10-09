// The recipe editor, shown as the place name wizard (names-reference §6): every §6.1 setting and per-slot sources, written as YAML
// properties. Recipes that start from a template store only their differences (§7).

import { App, Menu, Modal, normalizePath, Notice, Setting, setIcon, stringifyYaml, TFile } from "obsidian";
import { ContextGuideModal } from "./contextGuide";
import { WordListGuideModal } from "./wordListGuide";
import { CONTEXT_PHRASES, traditionLabel } from "./colonialWording";
import { availableTerrains, type Biome, BIOMES, BRITAIN, findBiome, TERRAIN_CHOICES } from "./biomes";
import { chooseTribal, type TribalSentenceState, tribalSentence } from "./tribes/sentence";
import { tribalSlotConstraints } from "./tribes/slotFill";
import { type TribalPreset, tribalPresetSlot } from "./presets";
import { TRIBAL_TRADITIONS } from "./tribes/engine";
import { biomeChoices, biomePhrase, explorersPhrase, FEATURES, incomersPhrase, terrainPhrase } from "./colonialSentence";
import { ICON_CANCEL, ICON_EMPIRE_EXPANSION_PLACE_SHAPES, ICON_INFO, ICON_EXPLORATION_PLACE_SHAPES, ICON_RECIPE, ICON_SAVE } from "./icons";
import { createWordListFileContent, sanitizePackNameForFilename } from "./nameParser";
import {
  applyWordsToSlots,
  assembleWordsNote,
  sectionChanged,
  type SlotWordsView,
  slotWordsView,
  wordsNoteDescription,
  wordsNoteName,
} from "./names/wizardWords";
import { defaultNameMode, hasBuiltInList } from "./names/engine";
import {
  allowsLists,
  allowsTribal,
  slotChoices,
  slotDefaultLabel,
  allowsPacks,
  allowsPlaceholderChoice,
  NAME_SLOTS,
  showsGender,
  SLOT_TIERS,
  slotCategories,
  type SlotTier,
  slotTier,
  tierIncludes,
  usesNativeDefault,
} from "./names/slotOptions";
import {
  mergeRecipe,
  type RecipePartial,
  type RecipeSettings,
  recipeToFrontmatter,
  type SlotSetting,
  withDefaults,
} from "./names/recipe";
import { COLONIAL_DATA, COLONIAL_TRADITIONS, colonialContexts } from "./colonialShapes";
import { PLACE_SHAPE_REGIONS } from "./placeShapes";
import { isRecipeContent, parseRecipeContent } from "./recipeHost";

export interface RecipeEditorOptions {
  folderPath: string;
  /** The recipe being edited; omitted when creating one. */
  file?: TFile;
  /** Name packs (basenames) and word lists available as sources. */
  packs: string[];
  lists: string[];
  /** Recipe templates for "Start from template". */
  templates: { name: string; description: string }[];
  /** Packs offered as the takeover pack (basenames), with why each ineligible one can't be used. */
  takeoverPacks: { name: string; reason?: string }[];
  /** The user's biome packs, resolved (Land brief §9.5). */
  biomes?: Biome[];
  /** Presets brief §5.1: the tribal presets in the names folder, for page 4's "Use preset". */
  tribalPresets?: { name: string; preset: TribalPreset }[];
  onSaved: (path: string) => void;
  /** Presets brief §3.1: runs the host's own save (and closes it), for page 3's Save icon. Set by the host. */
  requestSave?: () => void;
}

/** Each colonial part's contexts, as they read in the wizard's sentence (shared with the modules). */
const NEW_LANDS_CONTEXTS = CONTEXT_PHRASES["2"];
const EXPANSION_CONTEXTS = CONTEXT_PHRASES["2a"];
/** Regions that read without "the" in the place names sentence ("from Wales", but "from the North"). */
const NO_THE_REGIONS = new Set(["Cornwall", "East Anglia", "Wales"]);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const kebab = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The wizard's pages, in order. */
const PAGES = ["Template", "Shape and rendering", "Slots and generic words", "Word lists"];
/** Presets brief §3: the first three pages are the wizard; page 4 is optional. */
const MAIN_PAGES = 3;

/**
 * The recipe form as a three-page wizard, drawn into `hostEl`: a scrollable page and Back/Next
 * beneath it. Used inside the pack editor (which supplies the name) and by RecipeEditorModal.
 */
/** The slot tiers' labels and descriptions on the slots page. */
const TIER_TEXT: Record<SlotTier, [string, string]> = {
  simple: ["Simple", "The slots most names need."],
  detailed: ["Detailed", "Adds rarer people, beliefs and setting flavour."],
  complete: ["Complete", "Every slot."],
};

export class RecipeWizard {
  private page = 0;
  /** The slots page's level of detail: a view setting only, never saved; Simple each time the wizard opens. */
  private tier: SlotTier = "simple";
  private pageEl: HTMLElement | null = null;
  private name = "";
  private body = "";
  private own: RecipePartial = {};
  private template: RecipePartial | undefined;
  /** The working values shown in the form. */
  private working: RecipeSettings = withDefaults({});
  /** Slots the user has set explicitly (others use §6.3 defaults or the template). */
  private explicitSlots = new Set<string>();
  /** Presets brief §4: page 4's section texts by slot id, kept while the wizard is open. */
  private wordsEdits = new Map<string, string>();
  /** Page 4's open sections, kept across re-renders. */
  private openWords = new Set<string>();
  /** The recipe's word-list note's body (without frontmatter), when it has one. */
  private wordsBody: string | undefined;

  constructor(
    private readonly app: App,
    private readonly options: RecipeEditorOptions,
    private readonly hostEl: HTMLElement,
    /** Where the name comes from when the host shows its own name field; otherwise page 1 has one. */
    private readonly nameSource?: () => string,
  ) {
    hostEl.addClass("nameforge-recipe-editor");
  }

  async load() {
    if (this.options.file) {
      this.name = this.options.file.basename;
      const content = await this.app.vault.cachedRead(this.options.file);
      const parsed = parseRecipeContent(content);
      this.own = parsed.recipe;
      this.body = parsed.body.trim();
      if (this.own.templateOf) await this.loadTemplate(this.own.templateOf);
      if (this.own.words) await this.loadWords(this.own.words);
    }
    this.rebuildWorking();
    this.render();
  }

  private async loadTemplate(name: string | undefined) {
    this.template = undefined;
    if (!name) return;
    const file = this.app.metadataCache.getFirstLinkpathDest(name, this.options.file?.path ?? this.options.folderPath);
    if (!(file instanceof TFile)) return;
    const content = await this.app.vault.cachedRead(file);
    if (isRecipeContent(content)) this.template = parseRecipeContent(content).recipe;
  }

  /** Presets brief §6.1: the recipe's word-list note's body, for page 4's edited sections. */
  private async loadWords(name: string) {
    this.wordsBody = undefined;
    const file = this.app.metadataCache.getFirstLinkpathDest(name, this.options.file?.path ?? this.options.folderPath);
    if (!(file instanceof TFile)) return;
    const content = await this.app.vault.cachedRead(file);
    const fm = content.match(/^---\s*\n[\s\S]*?\n---\s*/);
    this.wordsBody = fm ? content.slice(fm[0].length) : content;
  }

  private rebuildWorking() {
    this.working = withDefaults(this.template ? mergeRecipe(this.own, this.template) : this.own);
    this.explicitSlots = new Set(Object.keys(this.own.slots ?? {}));
  }

  /** The current page and the Back/Next row, rebuilt after each change (keeping the scroll position). */
  private render() {
    const scrollTop = this.pageEl?.scrollTop ?? 0;
    this.hostEl.empty();
    // Page 2's part buttons stay above the scrolling page.
    if (this.page === 1) this.renderPartButtons(this.hostEl.createDiv({ cls: "nameforge-recipe-editor__parts" }));
    // Page 3's heading and tier control stay above the scrolling slots too.
    if (this.page === 2) this.renderSlotsHeader(this.hostEl.createDiv({ cls: "nameforge-recipe-editor__parts" }));
    this.pageEl = this.hostEl.createDiv({ cls: "nameforge-recipe-editor__page" });
    if (this.page === 0) this.renderTemplatePage(this.pageEl);
    else if (this.page === 1) {
      this.pageEl.addClass("nameforge-recipe-editor__page--shape");
      this.renderShapePage(this.pageEl);
    }
    else if (this.page === 2) this.renderSlotsPage(this.pageEl);
    else this.renderWordsPage(this.pageEl);
    this.pageEl.scrollTop = scrollTop;

    // Presets brief §3.1: "n of 3" on the wizard's pages, "4 of 4" on the optional word lists page.
    const nav = this.hostEl.createDiv({ cls: "nameforge-recipe-editor__nav" });
    const back = nav.createEl("button", { text: "Back" });
    back.disabled = this.page === 0;
    back.addEventListener("click", () => this.goTo(this.page - 1));
    const total = this.page < MAIN_PAGES ? MAIN_PAGES : PAGES.length;
    nav.createSpan({ cls: "nameforge-recipe-editor__step", text: `${this.page + 1} of ${total} · ${PAGES[this.page]}` });
    if (this.page < MAIN_PAGES - 1) {
      const next = nav.createEl("button", { text: "Next" });
      next.addEventListener("click", () => this.goTo(this.page + 1));
    } else if (this.page === MAIN_PAGES - 1) {
      const actions = nav.createDiv({ cls: "nameforge-recipe-editor__nav-actions" });
      const save = actions.createEl("button", {
        cls: "nameforge-modal__icon-action",
        attr: { type: "button", title: "Save and use as-is", "aria-label": "Save and use as-is" },
      });
      setIcon(save, ICON_SAVE);
      save.addEventListener("click", () => this.options.requestSave?.());
      const words = actions.createEl("button", { cls: "nameforge-recipe-editor__words-button", attr: { type: "button" } });
      setIcon(words.createSpan({ cls: "nameforge-recipe-editor__words-icon" }), ICON_RECIPE);
      words.createSpan({ text: "Optional: edit word lists" });
      words.addEventListener("click", () => this.goTo(this.page + 1));
    }
  }

  private goTo(page: number) {
    this.page = Math.max(0, Math.min(PAGES.length - 1, page));
    if (this.pageEl) this.pageEl.scrollTop = 0;
    this.render();
  }

  /** Page 1: name (when the host has no name field), description, template and starting template. */
  private renderTemplatePage(el: HTMLElement) {
    const w = this.working;
    if (!this.nameSource) {
      new Setting(el).setName("Name").addText((t) =>
        t.setValue(this.name).onChange((v) => {
          this.name = v;
        }),
      );
    }

    new Setting(el)
      .setName("Description")
      .setDesc("Shown when choosing this recipe as a template.")
      .addTextArea((t) => {
        t.setValue(this.body).onChange((v) => {
          this.body = v;
        });
        t.inputEl.rows = 3;
      });

    new Setting(el)
      .setName("Template")
      .setDesc("Templates are hidden from the generate view and offered when creating recipes.")
      .addToggle((t) =>
        t.setValue(w.template).onChange((v) => {
          w.template = v;
          if (v) w.templateOf = undefined;
          this.render();
        }),
      );

    if (!w.template) {
      new Setting(el)
        .setName("Start from template")
        .setDesc(this.options.templates.find((t) => t.name === w.templateOf)?.description ?? "Settings you leave alone come from the template.")
        .addDropdown((d) => {
          d.addOption("", "None");
          for (const t of this.options.templates) d.addOption(t.name, t.name);
          d.setValue(w.templateOf ?? "").onChange(async (v) => {
            this.own = { ...this.collect(), templateOf: v || undefined };
            await this.loadTemplate(v || undefined);
            this.rebuildWorking();
            this.render();
          });
        });
    }
  }

  /** Page 2: shape, then rendering. */
  /** The part: one of three, each with its module's icon (place names use the wizard's own). */
  private renderPartButtons(header: HTMLElement) {
    const w = this.working;
    const parts = header.createDiv({ cls: "nameforge-modal__toggle-panel nameforge-modal__pack-type-toggle" });
    for (const [part, label, icon] of [
      ["organic", "Place names", ICON_RECIPE],
      ["new-land", "Exploration in new lands", ICON_EXPLORATION_PLACE_SHAPES],
      ["established", "Expansion into settled lands", ICON_EMPIRE_EXPANSION_PLACE_SHAPES],
    ] as const) {
      const active = w.shape.part === part;
      const button = parts.createEl("button", { cls: "nameforge-modal__toggle-button", attr: { type: "button", "aria-pressed": String(active) } });
      button.toggleClass("is-active", active);
      setIcon(button.createSpan({ cls: "nameforge-modal__toggle-button-icon" }), icon);
      button.createSpan({ text: label });
      button.addEventListener("click", () => {
        if (w.shape.part === part) return;
        w.shape.part = part;
        this.render();
      });
    }
  }

  private renderShapePage(el: HTMLElement) {
    const w = this.working;
    if (w.shape.part === "organic") {
      this.renderPlaceNamesSentence(el);
    } else if (w.shape.part === "new-land") {
      this.renderNewLandsSentence(el);
    } else {
      this.renderExpansionSentence(el);
    }
    if (w.shape.part !== "organic") {
      // Recipe takeover §A2: the coloniser's language, which reshapes adapted native names.
      new Setting(el)
        .setName(w.shape.part === "new-land" ? "Explorers pack" : "Incomers pack")
        .setDesc("Adapted native names are reshaped into this pack's language.")
        .addDropdown((d) => {
          d.addOption("", "None");
          for (const pack of this.options.takeoverPacks) {
            d.addOption(pack.name, pack.reason ? `${pack.name} — ${pack.reason}` : pack.name);
            const option = d.selectEl.options[d.selectEl.options.length - 1];
            if (pack.reason) {
              option.disabled = true;
              option.title = pack.reason;
            }
          }
          // A recipe may name a pack this folder doesn't list; keep it rather than dropping it silently.
          if (w.takeover && !this.options.takeoverPacks.some((p) => p.name === w.takeover)) d.addOption(w.takeover, w.takeover);
          d.setValue(w.takeover ?? "").onChange((v) => {
            w.takeover = v || undefined;
          });
        });
      // Native names come from the native slots on the slots page.
      new Setting(el).setName("Native packs should be chosen on the next page").settingEl.addClass("nameforge-recipe-editor__note");
    }

    el.createEl("h3", { text: "Rendering" });
    new Setting(el).setName("Register").setDesc("Balance of modern and traditional words.").addDropdown((d) =>
      d
        .addOption("modern", "Modern")
        .addOption("mixed", "Mixed")
        .addOption("traditional", "Traditional")
        .setValue(w.register)
        .onChange((v) => {
          w.register = v as RecipeSettings["register"];
        }),
    );
    new Setting(el).setName("Joining").setDesc("How readily parts fuse into one word.").addDropdown((d) =>
      d
        .addOption("fused", "Fused")
        .addOption("balanced", "Balanced")
        .addOption("spaced", "Spaced")
        .setValue(w.render.joining)
        .onChange((v) => {
          w.render.joining = v as RecipeSettings["render"]["joining"];
        }),
    );
    new Setting(el).setName("Hyphenate linking affixes").setDesc("Ashford-upon-Severn rather than Ashford upon Severn.").addToggle((t) =>
      t.setValue(w.render.linkingHyphens).onChange((v) => {
        w.render.linkingHyphens = v;
      }),
    );
    new Setting(el).setName("Show etymology").setDesc("Show the shape beside each name by default.").addToggle((t) =>
      t.setValue(w.render.etymology).onChange((v) => {
        w.render.etymology = v;
      }),
    );
  }

  /** Page 3's fixed top: the Slots heading, its description, and Simple · Detailed · Complete. */
  private renderSlotsHeader(el: HTMLElement) {
    el.createEl("h3", { text: "Slots" });
    el.createEl("p", {
      cls: "setting-item-description",
      text: "Where each category's words come from. Unset categories use their built-in list (river names use the river name module), or a placeholder if there isn't one.",
    });
    // Simple · Detailed · Complete: which slots are drawn. Hidden unset slots still use their defaults.
    const tiers = el.createDiv({ cls: "nameforge-modal__toggle-panel nameforge-modal__pack-type-toggle nameforge-recipe-editor__tiers" });
    for (const tier of SLOT_TIERS) {
      const active = this.tier === tier;
      const button = tiers.createEl("button", { cls: "nameforge-modal__toggle-button", text: TIER_TEXT[tier][0], attr: { type: "button", "aria-pressed": String(active) } });
      button.toggleClass("is-active", active);
      button.addEventListener("click", () => {
        if (this.tier === tier) return;
        this.tier = tier;
        this.render();
      });
    }
    el.createEl("p", { cls: "setting-item-description", text: TIER_TEXT[this.tier][1] });
  }

  /** Page 3: the slots (generic words are on page 4). */
  private renderSlotsPage(el: HTMLElement) {
    const w = this.working;
    for (const category of slotCategories(w.shape.part)) {
      const inTier = tierIncludes(this.tier, slotTier(w.shape.part, category.id));
      // A slot that is set (here or in the template) is never hidden.
      if (inTier || this.isSlotSet(category.id)) this.renderSlot(el, category.id, category.label, !inTier);
    }

  }

  /** The slots page 3 shows: those in the tier, plus any set outside it. */
  private shownSlots(): { id: string; label: string }[] {
    const part = this.working.shape.part;
    return slotCategories(part).filter((c) => tierIncludes(this.tier, slotTier(part, c.id)) || this.isSlotSet(c.id));
  }

  /** Presets brief §4.1: page 4's view of one slot, or undefined when it is ignored. */
  private wordsView(id: string, label: string): SlotWordsView | undefined {
    const w = this.working;
    return slotWordsView({
      part: w.shape.part,
      id,
      label,
      slot: this.isSlotSet(id) ? w.slots[id] : undefined,
      biome: this.currentBiome(),
      terrain: w.shape.terrain,
      native: w.native,
      words: w.words,
      wordsBody: this.wordsBody,
    });
  }

  /** Presets brief §4: every slot from page 3 as what it draws from; editable ones as text. */
  private renderWordsPage(el: HTMLElement) {
    const intro = el.createEl("p", {
      cls: "setting-item-description",
      text: "What each slot draws from. Edit a list to give this recipe its own words; only the sections you change are saved, to the recipe's word list. ",
    });
    const help = intro.createSpan({ cls: "clickable-icon nameforge-editor-modal__help", attr: { role: "button", "aria-label": "How to write a word list" } });
    setIcon(help, "circle-help");
    help.addEventListener("click", () => new WordListGuideModal(this.app).open());
    for (const { id, label } of this.shownSlots()) {
      const view = this.wordsView(id, label);
      if (!view) continue;
      const details = el.createEl("details", { cls: "nameforge-recipe-editor__words" });
      details.open = this.openWords.has(id);
      details.addEventListener("toggle", () => (details.open ? this.openWords.add(id) : this.openWords.delete(id)));
      const summary = details.createEl("summary");
      summary.createSpan({ cls: "nameforge-recipe-editor__words-label", text: label });
      const status = summary.createSpan({ cls: "nameforge-recipe-editor__words-status", text: view.statusText });
      this.renderWordsBody(details, view, status);
    }
    this.renderGenericWords(el);
  }

  /** Generic words (on page 4, after the slots): replacements for the generic part of a name. */
  private renderGenericWords(el: HTMLElement) {
    const w = this.working;
    el.createEl("h3", { text: "Generic words" });
    new Setting(el)
      .setDesc("One per line, e.g. “church: kirk”.")
      .addTextArea((t) => {
        t.setValue(Object.entries(w.generics).map(([k, v]) => `${k}: ${v}`).join("\n")).onChange((v) => {
          w.generics = Object.fromEntries(
            v
              .split("\n")
              .map((line) => line.split(":").map((x) => x.trim()))
              .filter(([k, r]) => k && r)
              .map(([k, r]) => [k.toLowerCase(), r]),
          );
        });
        t.inputEl.rows = 3;
      });
  }

  /** One page 4 section's body (§4.1). */
  private renderWordsBody(el: HTMLElement, view: SlotWordsView, status: HTMLElement) {
    const body = el.createDiv({ cls: "nameforge-recipe-editor__words-body" });
    if (view.status === "tribal") {
      body.addClass("is-stacked");
      this.renderTribalSentence(body.createDiv({ cls: "nameforge-recipe-editor__sentence" }), view.id);
      return;
    }
    if (view.status === "river") {
      body.createDiv({ cls: "setting-item-description", text: "From the river name module, following this recipe's shape." });
      return;
    }
    if (view.status === "native") {
      const line = body.createDiv({ cls: "setting-item-description", text: "From the native pack " });
      this.noteLink(line, view.sources![0].pack!);
      return;
    }
    if (view.status === "sources") {
      const line = body.createDiv({ cls: "setting-item-description", text: "From " });
      view.sources!.forEach((s, i) => {
        if (i > 0) line.appendText(", ");
        this.noteLink(line, s.list ?? s.pack ?? "");
        if (view.sources!.length > 1) line.appendText(` (${s.weight})`);
      });
      line.appendText(". Edit these on the slots page.");
      return;
    }
    const textarea = body.createEl("textarea", { cls: "nameforge-modal__textarea nameforge-recipe-editor__words-text", attr: { rows: "8" } });
    textarea.value = this.wordsEdits.get(view.id) ?? view.text ?? "";
    if (view.status === "placeholder") textarea.placeholder = "Leave empty to keep the placeholder. Add a table, - words or // pack lines.";
    textarea.addEventListener("input", () => this.wordsEdits.set(view.id, textarea.value));
    if (view.status === "edited") {
      const reset = body.createEl("button", {
        cls: "clickable-icon nameforge-recipe-editor__words-reset",
        attr: { type: "button", title: view.resetTo === "placeholder" ? "Back to the placeholder" : "Back to the built-in list" },
      });
      setIcon(reset, "rotate-ccw");
      reset.addEventListener("click", () => {
        textarea.value = view.baseline ?? "";
        this.wordsEdits.set(view.id, textarea.value);
        status.setText(view.resetTo === "placeholder" ? "Placeholder" : view.resetTo === "biome" ? `${this.currentBiome()?.label ?? "Biome"} list` : "Built-in");
      });
    }
  }

  /**
   * Presets brief §5.1: a tribal slot's sentence, the tribal module's own, limited to what the slot
   * can use (§20.2): its group types and registers, and no insults.
   */
  private renderTribalSentence(el: HTMLElement, id: string) {
    const w = this.working;
    const slot = w.slots[id];
    if (slot?.kind !== "tribal") return;
    const part = w.shape.part;
    const constraints = tribalSlotConstraints(part);
    // Presets brief §5.1: "Use preset" – a preset's values read-only, or the editable sentence.
    const presets = this.options.tribalPresets ?? [];
    const linked = slot.preset ? presets.find((p) => p.name.toLowerCase() === slot.preset!.toLowerCase()) : undefined;
    new Setting(el.parentElement ?? el).setName("Use preset").addDropdown((d) => {
      d.addOption("", "None");
      for (const p of presets) d.addOption(p.name, p.name);
      if (slot.preset && !linked) d.addOption(slot.preset, `${slot.preset} (missing)`);
      d.setValue(slot.preset ?? "").onChange((v) => {
        const chosen = presets.find((p) => p.name === v);
        if (chosen) w.slots[id] = { kind: "tribal", tradition: chosen.preset.tradition, preset: chosen.name };
        // None returns to the editable sentence, starting from the preset's values.
        else w.slots[id] = linked ? { kind: "tribal", ...tribalPresetSlot(linked.preset) } : { kind: "tribal", tradition: slot.tradition };
        this.explicitSlots.add(id);
        this.render();
      });
    }).settingEl.addClass("nameforge-recipe-editor__preset");
    // The sentence goes after the preset row.
    el.parentElement?.appendChild(el);
    const fields = linked ? tribalPresetSlot(linked.preset) : slot;
    const state: TribalSentenceState = {
      tradition: part !== "organic" && fields.tradition === "auto" ? "general" : fields.tradition,
      groupType: fields.groupType,
      biome: fields.biome,
      terrain: fields.terrain ?? "any",
      register: fields.register ?? Object.keys(constraints.registers ?? { plain: 1 })[0],
      perspective: fields.perspective,
    };
    const segments = tribalSentence(state, {
      biomes: [BRITAIN, ...BIOMES],
      findBiome: (b) => findBiome(b),
      defaultBiome: part === "organic" ? "their original" : "the recipe's",
      extraTraditions: part === "organic" ? [{ id: "auto", label: "Regional" }] : [],
      groupTypes: constraints.groupTypes,
      registers: Object.keys(constraints.registers ?? { plain: 1 }),
    });
    for (const segment of segments) {
      if (typeof segment === "string") {
        el.appendText(segment);
        continue;
      }
      if (slot.preset) {
        el.createSpan({ cls: "nameforge-recipe-editor__sentence-fixed", text: segment.text, attr: { title: segment.title } });
        continue;
      }
      const a = el.createEl("a", { cls: "nameforge-recipe-editor__sentence-link", text: segment.text, attr: { href: "#", role: "button", title: segment.title } });
      a.addEventListener("click", (event) => {
        event.preventDefault();
        const menu = new Menu();
        for (const c of segment.choices) {
          menu.addItem((item) =>
            item
              .setTitle(c.label)
              .setChecked(c.id === segment.current)
              .onClick(() => {
                const next = chooseTribal(state, segment.field, c.id, (b) => findBiome(b));
                // Only what differs from the slot's defaults is kept (§5.1).
                w.slots[id] = {
                  kind: "tribal",
                  tradition: next.tradition,
                  ...(next.groupType ? { groupType: next.groupType } : {}),
                  ...(next.biome ? { biome: next.biome } : {}),
                  ...(next.terrain && next.terrain !== "any" ? { terrain: next.terrain } : {}),
                  ...(slot.register || segment.field === "register" ? { register: next.register } : {}),
                  ...(next.perspective ? { perspective: next.perspective } : {}),
                };
                this.explicitSlots.add(id);
                this.render();
              }),
          );
        }
        menu.showAtMouseEvent(event);
      });
    }
  }

  /** A note name as a link that opens the note in a new tab. */
  private noteLink(el: HTMLElement, name: string) {
    const a = el.createEl("a", { cls: "internal-link", text: name, attr: { href: "#" } });
    a.addEventListener("click", (event) => {
      event.preventDefault();
      void this.app.workspace.openLinkText(name, this.options.file?.path ?? this.options.folderPath, "tab");
    });
  }

  /** A slot dropdown's choice, applied to the working recipe. */
  private setSlotChoice(id: string, part: string, v: string) {
    const w = this.working;
    if (v === "default") {
      delete w.slots[id];
      this.explicitSlots.delete(id);
    } else if (v === "tribal") {
      // Tribal brief §20.3: organic slots start on the regional choice, colonial ones on General.
      w.slots[id] = { kind: "tribal", tradition: part === "organic" ? "auto" : "general" };
      this.explicitSlots.add(id);
    } else if (v === "packs" || v === "lists") {
      w.slots[id] = { kind: "sources", sources: [this.newSource(v === "lists")] };
      this.explicitSlots.add(id);
    } else {
      w.slots[id] = { kind: v as "built-in" | "placeholder" | "ignore" | "biome" };
      this.explicitSlots.add(id);
    }
    this.render();
  }

  /** Land brief §5.2: the muted line under a land slot. */
  private landSlotDescription(part: string, id: string, fromBiome: boolean): string {
    if (id === "river-or-stream-name") return "";
    const biome = this.currentBiome();
    const colonial = part !== "organic";
    const shown = biome ?? (colonial ? undefined : BRITAIN);
    if (id === "landform" || id === "water-or-wetland-feature") {
      const terrain = [...TERRAIN_CHOICES, ...(biome?.customTerrains ?? [])].find((t) => t.id === (this.working.shape.terrain || "any"));
      return `${(shown ?? BRITAIN).label} · ${terrain?.label ?? "Any terrain"}`;
    }
    if (colonial && (id === "domestic-animal" || id === "crop")) {
      if (!fromBiome) return "The incomers' own animals and crops (Britain list)";
      return biome ? `${biome.label} list` : "Britain list until a biome is chosen";
    }
    if (shown) return `${shown.label} list`;
    if (["wild-animal", "bird", "fish-and-other-creatures", "tree", "wild-plant"].includes(id)) return "Native placeholder until a biome is chosen";
    return "Britain list until a biome is chosen";
  }

  /** Tribal brief §20.3: the Tribal names slot's one dropdown, Tradition. */
  private renderTribalFooter(el: HTMLElement, slot: { kind: "tribal"; tradition: string; preset?: string }, part: string) {
    const box = el.createDiv({ cls: "nameforge-recipe-editor__sources" });
    if (slot.preset) {
      new Setting(box).setName("Preset").setDesc(`${slot.preset} – change it on the word lists page.`);
      return;
    }
    new Setting(box).setName("Tradition").addDropdown((d) => {
      if (part === "organic") d.addOption("auto", "Regional (auto)");
      for (const t of TRIBAL_TRADITIONS) d.addOption(t.key, t.label);
      const current = part !== "organic" && slot.tradition === "auto" ? "general" : slot.tradition;
      d.setValue(current).onChange((v) => (slot.tradition = v));
    });
  }

  /** One underlined phrase in a wizard sentence; clicking it opens a menu of `choices`. */
  private sentenceLink(sentence: HTMLElement, text: string, choices: { id: string; label: string }[], current: string, choose: (id: string) => void) {
    const a = sentence.createEl("a", { cls: "nameforge-recipe-editor__sentence-link", text, attr: { href: "#", role: "button" } });
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
              this.render();
            }),
        );
      }
      menu.showAtMouseEvent(event);
    });
  }

  /** The feature phrase: "Any feature" at the start of a sentence, "any feature" within one. */
  private featureLink(sentence: HTMLElement, start: boolean) {
    const w = this.working;
    const feature = FEATURES.find((f) => f.id === w.shape.feature) ?? FEATURES[0];
    const text = start ? feature.label : feature.label.charAt(0).toLowerCase() + feature.label.slice(1);
    this.sentenceLink(sentence, text, FEATURES, feature.id, (id) => (w.shape.feature = id));
  }

  /** Place names: "‹Any feature› from ‹all of Britain›" ("the" added where a region needs it). */
  private renderPlaceNamesSentence(el: HTMLElement) {
    const w = this.working;
    const sentence = el.createDiv({ cls: "nameforge-recipe-editor__sentence" });
    this.featureLink(sentence, true);
    sentence.appendText(" from ");
    const regions = [{ id: "all-britain", label: "All of Britain" }, ...PLACE_SHAPE_REGIONS.map((r) => ({ id: kebab(r.label), label: r.label }))];
    const current = kebab(w.shape.region) === "all-britain" ? "all-britain" : this.regionValue(w.shape.region);
    const region = regions.find((r) => r.id === current) ?? regions[0];
    const text = region.id === "all-britain" ? "all of Britain" : NO_THE_REGIONS.has(region.label) ? region.label : `the ${region.label}`;
    this.sentenceLink(sentence, text, regions, region.id, (id) => (w.shape.region = id));
    sentence.appendText(", set in ");
    this.landLinks(sentence);
    this.guideIcon(sentence, false);
  }

  /**
   * Exploration in new lands: "‹General explorers› in ‹wild and unsettled lands›, naming ‹any feature›",
   * each underlined phrase opening a menu of its choices.
   */
  private renderNewLandsSentence(el: HTMLElement) {
    const w = this.working;
    const traditions = COLONIAL_TRADITIONS.filter((t) => t.parts.includes("2"));
    if (!traditions.some((t) => t.id === w.shape.tradition)) w.shape.tradition = traditions[0].id;
    const contexts = NEW_LANDS_CONTEXTS.filter(([id]) => colonialContexts("2").some((c) => c.id === id));
    if (!contexts.some(([id]) => id === w.shape.context)) w.shape.context = contexts[0][0];

    const sentence = el.createDiv({ cls: "nameforge-recipe-editor__sentence" });
    const tradition = traditions.find((t) => t.id === w.shape.tradition)!;
    this.sentenceLink(
      sentence,
      explorersPhrase(tradition.id, tradition.label),
      traditions.map((t) => ({ id: t.id, label: traditionLabel("2", t.id, t.label) })),
      tradition.id,
      (id) => (w.shape.tradition = id),
    );
    sentence.appendText(" in ");
    this.sentenceLink(
      sentence,
      contexts.find(([id]) => id === w.shape.context)![1],
      contexts.map(([id, label]) => ({ id, label })),
      w.shape.context,
      (id) => (w.shape.context = id),
    );
    sentence.appendText(" across ");
    this.landLinks(sentence);
    sentence.appendText(", naming ");
    this.featureLink(sentence, false);
    this.guideIcon(sentence, false);
  }

  /** Expansion into settled lands: "‹General incomers› who are ‹ruling over the locals›, naming ‹any feature›". */
  private renderExpansionSentence(el: HTMLElement) {
    const w = this.working;
    const traditions = COLONIAL_TRADITIONS.filter((t) => t.parts.includes("2a"));
    if (!traditions.some((t) => t.id === w.shape.tradition)) w.shape.tradition = traditions[0].id;
    const contexts = EXPANSION_CONTEXTS.filter(([id]) => colonialContexts("2a").some((c) => c.id === id));
    if (!contexts.some(([id]) => id === w.shape.context)) w.shape.context = contexts[0][0];

    const sentence = el.createDiv({ cls: "nameforge-recipe-editor__sentence" });
    const tradition = traditions.find((t) => t.id === w.shape.tradition)!;
    this.sentenceLink(
      sentence,
      incomersPhrase(tradition.id, tradition.label),
      traditions.map((t) => ({ id: t.id, label: traditionLabel("2a", t.id, t.label) })),
      tradition.id,
      (id) => (w.shape.tradition = id),
    );
    sentence.appendText(" who are ");
    this.sentenceLink(
      sentence,
      contexts.find(([id]) => id === w.shape.context)![1],
      contexts.map(([id, label]) => ({ id, label })),
      w.shape.context,
      (id) => (w.shape.context = id),
    );
    sentence.appendText(" across ");
    this.landLinks(sentence);
    sentence.appendText(", naming ");
    this.featureLink(sentence, false);
    this.guideIcon(sentence, true);
  }

  /** The user's biome packs (Land brief §9), as the host resolved them. */
  private get customBiomes(): Biome[] {
    return this.options.biomes ?? [];
  }

  /** The current biome setting as a Biome, if it is one (built in or a pack). */
  private currentBiome(): Biome | undefined {
    const b = this.working.shape.biome;
    if (b?.startsWith("[[")) return this.customBiomes.find((x) => x.label === b.slice(2, -2));
    return findBiome(b);
  }

  /**
   * Land brief §4.2: "‹any part› of ‹Britain›". The terrain menu offers Any, then the biome's
   * terrains (all eight with no biome); the biome menu the part's default, Britain, the 12 biomes
   * and the user's packs. A biome without the current terrain resets it to Any.
   */
  private landLinks(sentence: HTMLElement) {
    const w = this.working;
    const part = w.shape.part;
    const custom = this.customBiomes;
    const menuLink = (text: string, build: (menu: Menu) => void) => {
      const a = sentence.createEl("a", { cls: "nameforge-recipe-editor__sentence-link", text, attr: { href: "#", role: "button" } });
      a.addEventListener("click", (event) => {
        event.preventDefault();
        const menu = new Menu();
        build(menu);
        menu.showAtMouseEvent(event);
      });
    };
    const choose = (menu: Menu, label: string, checked: boolean, apply: () => void) =>
      menu.addItem((item) =>
        item
          .setTitle(label)
          .setChecked(checked)
          .onClick(() => {
            apply();
            this.render();
          }),
      );
    const biome = this.currentBiome();
    menuLink(terrainPhrase(w.shape.terrain, custom), (menu) => {
      choose(menu, "any part", !w.shape.terrain || w.shape.terrain === "any", () => (w.shape.terrain = "any"));
      menu.addSeparator();
      const terrains = biome ? availableTerrains(biome) : TERRAIN_CHOICES.filter((t) => t.id !== "any");
      for (const t of terrains) choose(menu, t.phrase, w.shape.terrain === t.id, () => (w.shape.terrain = t.id));
    });
    sentence.appendText(" of ");
    menuLink(biomePhrase(w.shape.biome, part, custom), (menu) => {
      const [first, ...rest] = biomeChoices(part);
      const set = (id: string) => () => {
        w.shape.biome = id;
        const next = this.currentBiome();
        if (next && w.shape.terrain !== "any" && !availableTerrains(next).some((t) => t.id === w.shape.terrain)) w.shape.terrain = "any";
      };
      choose(menu, first.label, !w.shape.biome || w.shape.biome === "unknown", set("unknown"));
      menu.addSeparator();
      for (const c of rest) choose(menu, c.label, w.shape.biome === c.id, set(c.id));
      if (custom.length > 0) {
        menu.addSeparator();
        for (const b of [...custom].sort((x, y) => x.label.localeCompare(y.label))) {
          choose(menu, b.phrase, w.shape.biome === `[[${b.label}]]`, set(`[[${b.label}]]`));
        }
      }
    });
  }

  /** The guide icon at the end of a colonial sentence: the contexts (expansion only), then biomes. */
  private guideIcon(sentence: HTMLElement, contexts: boolean) {
    const info = sentence.createSpan({ cls: "clickable-icon nameforge-recipe-editor__info", attr: { role: "button", "aria-label": contexts ? "Context and biome guide" : "Biome guide" } });
    setIcon(info, ICON_INFO);
    info.addEventListener("click", () => new ContextGuideModal(this.app, contexts, this.customBiomes).open());
  }

  private regionValue(value: string): string {
    const r = PLACE_SHAPE_REGIONS.find((x) => x.code === value.toUpperCase() || kebab(x.label) === kebab(value));
    return r ? kebab(r.label) : "all-britain";
  }

  /** Whether a slot is set explicitly, in the recipe or its template. */
  private isSlotSet(id: string): boolean {
    return this.explicitSlots.has(id) || this.template?.slots?.[id] !== undefined;
  }

  private renderSlot(el: HTMLElement, id: string, label: string, outsideTier = false) {
    const w = this.working;
    const part = w.shape.part;
    const slot: SlotSetting | undefined = this.isSlotSet(id) ? w.slots[id] : undefined;
    // River brief §6.9: an unset (or built-in) river slot is drawn from the river name module,
    // which follows the shape's part and region.
    const river = id === "river-or-stream-name";
    const fallback = river || hasBuiltInList(id) ? "built-in" : "placeholder";
    // Colonial flora and fauna render native placeholders when unset; an explicit built-in list draws the British one.
    const nativeDefault = usesNativeDefault(part, id);
    // Land brief §5.1: the land slots' short dropdowns.
    const choices = slotChoices(part, id);
    const setting = new Setting(el).setName(label).addDropdown((d) => {
      if (choices) {
        const shown = !slot ? "default" : slot.kind === "sources" ? (slot.sources[0]?.list !== undefined ? "lists" : "packs") : slot.kind;
        const legacy = (value: string, text: string) => {
          if (shown === value) d.addOption(value, `${text} (not recommended)`);
        };
        d.addOption("default", slotDefaultLabel(part, id));
        d.selectEl.appendChild(createEl("hr"));
        if (choices.includes("biome")) d.addOption("biome", "From the biome");
        else legacy("biome", "From the biome");
        legacy("built-in", "Built-in list");
        legacy("packs", "Name packs");
        legacy("lists", "Word lists");
        legacy("tribal", "Tribal names");
        if (choices.includes("placeholder")) d.addOption("placeholder", "Placeholder");
        else legacy("placeholder", "Placeholder");
        d.addOption("ignore", "Ignore");
        d.setValue(shown).onChange((v) => this.setSlotChoice(id, part, v));
        return;
      }
      // A slot mixing packs and lists (written by hand) shows as whichever its first source is.
      const shown =
        !slot || (slot.kind === fallback && !(nativeDefault && slot.kind === "built-in"))
          ? "default"
          : slot.kind === "sources"
            ? slot.sources[0]?.list !== undefined
              ? "lists"
              : "packs"
            : slot.kind;
      // An option this slot doesn't offer still shows when the recipe already uses it.
      const offer = (value: string, text: string, allowed: boolean) => {
        if (allowed) d.addOption(value, text);
        else if (shown === value) d.addOption(value, `${text} (not recommended)`);
      };
      // The unset choice leads, labelled as what it resolves to, with a separator before the rest.
      // Tribal brief §19.3: with a biome set, unset native flora and fauna draw its list.
      const biome = nativeDefault ? findBiome(w.shape.biome) : undefined;
      const nativeLabel = biome ? `${biome.label} list` : "Native placeholder";
      d.addOption("default", river ? "River name module" : nativeDefault ? nativeLabel : fallback === "built-in" ? "Built-in list" : "Placeholder");
      d.selectEl.appendChild(createEl("hr"));
      offer("built-in", "Built-in list", nativeDefault);
      offer("packs", "Name packs", allowsPacks(part, id));
      offer("lists", "Word lists", allowsLists(part, id));
      offer("tribal", "Tribal names", allowsTribal(part, id));
      offer("placeholder", "Placeholder", fallback !== "placeholder" && allowsPlaceholderChoice(part, id));
      d.addOption("ignore", "Ignore");
      d.setValue(shown).onChange((v) => this.setSlotChoice(id, part, v));
    });
    setting.settingEl.addClass("nameforge-recipe-editor__slot");
    // Land brief §5.2: what a land slot's default resolves to, then the tier note.
    const desc = [choices && (!slot || slot.kind === "biome") ? this.landSlotDescription(part, id, slot?.kind === "biome") : "", outsideTier ? "Set – shown outside this tier" : ""];
    if (desc.some(Boolean)) setting.setDesc(desc.filter(Boolean).join(" · "));
    if (slot?.kind === "tribal") {
      this.renderTribalFooter(el, slot, part);
      return;
    }
    if (!slot || slot.kind !== "sources") return;

    const box = el.createDiv({ cls: "nameforge-recipe-editor__sources" });
    const lists = slot.sources[0]?.list !== undefined;
    const mixed = slot.sources.some((source) => (source.list !== undefined) !== lists);
    slot.sources.forEach((source, i) => {
      const row = new Setting(box);
      // Only a hand-written mixed slot keeps the per-source type choice, so it can be tidied up.
      if (mixed) {
        row.addDropdown((d) =>
          d
            .addOption("pack", "Name pack")
            .addOption("list", "Word list")
            .setValue(source.list !== undefined ? "list" : "pack")
            .onChange((v) => {
              slot.sources[i] = { ...this.newSource(v === "list"), weight: source.weight };
              this.render();
            }),
        );
      }
      row
        .addDropdown((d) => {
          const options = source.list !== undefined ? this.options.lists : this.options.packs;
          for (const o of options) d.addOption(o, o);
          const current = source.list ?? source.pack ?? "";
          if (current && !options.includes(current)) d.addOption(current, `${current} (missing)`);
          d.setValue(current).onChange((v) => {
            if (source.list !== undefined) source.list = v;
            else source.pack = v;
          });
        })
        .addText((t) => {
          t.setPlaceholder("weight").setValue(String(source.weight)).onChange((v) => {
            const n = Number(v);
            source.weight = Number.isFinite(n) && n > 0 ? n : 1;
          });
          t.inputEl.type = "number";
          t.inputEl.addClass("nameforge-recipe-editor__weight");
        })
        .addExtraButton((b) =>
          b.setIcon("x").setTooltip("Remove source").onClick(() => {
            slot.sources.splice(i, 1);
            if (slot.sources.length === 0) {
              delete w.slots[id];
              this.explicitSlots.delete(id);
            }
            this.render();
          }),
        );
    });
    const footer = new Setting(box).addButton((b) =>
      b.setButtonText(lists ? "Add word list" : "Add name pack").onClick(() => {
        slot.sources.push(this.newSource(lists));
        this.render();
      }),
    );
    // Mode and gender shape names: drawn from packs, or listed in a word list on a name slot (whose
    // words become names). Section is for packs only.
    const listsOnly = lists && !mixed;
    if (listsOnly && !NAME_SLOTS.has(id)) return;
    footer.addDropdown((d) => {
        const unset = defaultNameMode(id);
        const other = unset === "stem" ? "whole" : "stem";
        d.addOption("", `Mode: ${unset}`);
        d.selectEl.appendChild(createEl("hr"));
        d.addOption(other, `Mode: ${other}`)
          .setValue(slot.mode === other ? other : "")
          .onChange((v) => {
            slot.mode = v === other ? other : undefined;
          });
      });
    if (!listsOnly) {
      footer.addText((t) =>
        t
          .setPlaceholder("Section")
          .setValue(slot.section ?? "")
          .onChange((v) => {
            slot.section = v.trim() || undefined;
          }),
      );
    }
    // Male % only where gender means something; a saved ratio elsewhere still shows so it can be changed.
    if (showsGender(id) || slot.gender) {
      footer.addText((t) => {
        t.setPlaceholder("Male %")
          .setValue(slot.gender ? String(slot.gender.male) : "")
          .onChange((v) => {
            const male = Number(v);
            slot.gender = v.trim() && Number.isFinite(male) ? { male, female: Math.max(0, 100 - male) } : undefined;
          });
        t.inputEl.type = "number";
        t.inputEl.addClass("nameforge-recipe-editor__weight");
      });
    }
  }

  /** A new source of the given type, starting on the first available pack or list. */
  private newSource(list: boolean) {
    return list ? { list: this.options.lists[0], weight: 1 } : { pack: this.options.packs[0], weight: 1 };
  }

  /**
   * The settings to write: everything for a standalone recipe; only differences from the
   * template for a derived one (§7).
   */
  private collect(): RecipePartial {
    const w = this.working;
    const slots: Record<string, SlotSetting> = {};
    for (const id of this.explicitSlots) if (w.slots[id]) slots[id] = w.slots[id];
    const full: RecipePartial = {
      setting: w.setting,
      template: w.template || undefined,
      templateOf: w.template ? undefined : this.own.templateOf ?? w.templateOf,
      shape: { ...w.shape },
      slots,
      generics: { ...w.generics },
      register: w.register,
      render: { ...w.render },
      takeover: w.takeover,
      native: w.native,
      words: w.words,
    };
    if (!full.templateOf || !this.template) return full;

    const base = withDefaults(this.template);
    const diff = <T extends object>(mine: T, theirs: T): Partial<T> =>
      Object.fromEntries(Object.entries(mine).filter(([k, v]) => !same(v, (theirs as Record<string, unknown>)[k]))) as Partial<T>;
    return {
      setting: w.setting !== base.setting ? w.setting : undefined,
      templateOf: full.templateOf,
      shape: diff(w.shape, base.shape),
      slots: diff(slots, base.slots) as Record<string, SlotSetting>,
      generics: diff(w.generics, base.generics) as Record<string, string>,
      register: w.register !== base.register ? w.register : undefined,
      render: diff(w.render, base.render),
      takeover: w.takeover !== base.takeover ? w.takeover : undefined,
      native: w.native !== base.native ? w.native : undefined,
      // Presets brief §6.1: the word-list note is the recipe's own, never the template's.
      words: w.words,
    };
  }

  /**
   * Presets brief §6.3: writes page 4's changed sections to the recipe's word-list note (before
   * the recipe, so the link resolves) and points those slots at it; unchanged or reset sections
   * return to their page 3 setting. False when the note couldn't be written.
   */
  private async saveWords(name: string): Promise<boolean> {
    const w = this.working;
    const views = this.shownSlots()
      .map(({ id, label }) => this.wordsView(id, label))
      .filter((v): v is SlotWordsView => !!v && v.baseline !== undefined);
    const results = views.map((v) => {
      const text = this.wordsEdits.get(v.id) ?? v.text ?? "";
      const previous = v.status === "edited" || !this.isSlotSet(v.id) ? undefined : w.slots[v.id];
      return { view: v, text, changed: sectionChanged(text, v.baseline ?? ""), previous };
    });
    const changed = results.filter((r) => r.changed);
    if (changed.length === 0) {
      // §6.3 (5, 6): nothing to write; an existing note is left alone and unlinked.
      if (results.some((r) => r.view.status === "edited")) this.applyWords(results, w.words ?? "");
      if (w.words) new Notice(`nameForge: no words changed, so “${w.words}” is no longer linked to this recipe. The note is kept.`);
      w.words = undefined;
      return true;
    }
    const folder = this.options.file?.parent?.path ?? this.options.folderPath;
    const exists = (n: string) => !!this.app.vault.getFileByPath(normalizePath(`${folder}/${sanitizePackNameForFilename(n)}.md`));
    const own = w.words && this.app.metadataCache.getFirstLinkpathDest(w.words, this.options.file?.path ?? folder);
    const noteName = wordsNoteName(name, exists, own instanceof TFile ? w.words : undefined);
    const body = assembleWordsNote(
      own instanceof TFile ? this.wordsBody : undefined,
      wordsNoteDescription(name),
      results.map((r) => r.view.label),
      changed.map((r) => ({ label: r.view.label, text: r.text })),
    );
    try {
      if (own instanceof TFile) {
        const content = await this.app.vault.read(own);
        const fm = content.match(/^---\s*\n[\s\S]*?\n---\s*/);
        await this.app.vault.modify(own, `${fm ? fm[0].trimEnd() : "---\ntype: word-list\n---"}\n\n${body.trim()}\n`);
      } else {
        await this.app.vault.create(normalizePath(`${folder}/${sanitizePackNameForFilename(noteName)}.md`), createWordListFileContent(noteName, body));
      }
    } catch {
      new Notice(`nameForge: couldn't save the word list “${noteName}”.`);
      return false;
    }
    this.wordsBody = body;
    this.applyWords(results, noteName);
    w.words = noteName;
    return true;
  }

  /** §6.3: the slots after a words save, kept in step with the set of explicit slots. */
  private applyWords(results: { view: SlotWordsView; changed: boolean; previous: SlotSetting | undefined }[], noteName: string) {
    const w = this.working;
    w.slots = applyWordsToSlots(w.slots, results.map((r) => ({ id: r.view.id, changed: r.changed, previous: r.previous })), noteName);
    for (const r of results) {
      if (w.slots[r.view.id]) this.explicitSlots.add(r.view.id);
      else this.explicitSlots.delete(r.view.id);
    }
    this.wordsEdits.clear();
  }

  /** Writes the recipe; the saved path, or null when it couldn't be saved (a notice says why). */
  async save(): Promise<string | null> {
    const name = (this.nameSource ? this.nameSource() : this.name).trim();
    if (!name) {
      new Notice("nameForge: give the recipe a name.");
      return null;
    }
    const path = normalizePath(`${this.options.folderPath}/${sanitizePackNameForFilename(name)}.md`);
    // Checked before the word list is written, so a refused save leaves nothing behind.
    if (this.app.vault.getFileByPath(path) && this.options.file?.path !== path) {
      new Notice("nameForge: a file with that name already exists.");
      return null;
    }
    if (!(await this.saveWords(name))) return null;
    const frontmatter = recipeToFrontmatter(this.collect());
    const content = `---\n${stringifyYaml(frontmatter)}---\n\n${this.body.trim()}\n`;
    try {
      const existing = this.app.vault.getFileByPath(path);
      if (this.options.file) {
        if (this.options.file.path !== path) {
          if (existing) {
            new Notice("nameForge: a file with that name already exists.");
            return null;
          }
          await this.app.fileManager.renameFile(this.options.file, path);
        }
        await this.app.vault.modify(this.options.file, content);
      } else {
        if (existing) {
          new Notice("nameForge: a file with that name already exists.");
          return null;
        }
        await this.app.vault.create(path, content);
      }
    } catch {
      new Notice(`nameForge: couldn't save the recipe to ${path}.`);
      return null;
    }
    this.options.onSaved(path);
    return path;
  }
}

/** Editing an existing recipe on its own: the wizard with its own name field, save and cancel. */
export class RecipeEditorModal extends Modal {
  constructor(
    app: App,
    private readonly options: RecipeEditorOptions,
  ) {
    super(app);
  }

  async onOpen() {
    this.titleEl.setText(this.options.file ? "Edit place name wizard" : "Place name wizard");
    this.contentEl.addClass("nameforge-editor-modal");
    const stage = this.contentEl.createDiv({ cls: "nameforge-editor-modal__stage" });
    const wizard = new RecipeWizard(this.app, this.options, stage.createDiv({ cls: "nameforge-editor-modal__stage-pane nameforge-editor-modal__wizard" }));
    // The pack editor's controls: save then cancel, as large icons.
    const controls = this.contentEl.createDiv({ cls: "nameforge-modal__controls" });
    const save = controls.createEl("button", {
      cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
      attr: { type: "button", title: "Save recipe" },
    });
    setIcon(save, ICON_SAVE);
    const run = () => {
      void wizard.save().then((path) => {
        if (path) this.close();
      });
    };
    save.addEventListener("click", run);
    // Presets brief §3.1: page 3's Save icon runs the same save.
    this.options.requestSave = run;
    const cancel = controls.createEl("button", {
      cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
      attr: { type: "button", title: "Cancel" },
    });
    setIcon(cancel, ICON_CANCEL);
    cancel.addEventListener("click", () => this.close());
    await wizard.load();
  }

  onClose() {
    this.contentEl.empty();
  }
}
