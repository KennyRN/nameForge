// Name takeover section (takeover brief §6). The modal hosts it; the engine (ageing/engine.ts) and
// batch filling (takeover/batch.ts) carry no Obsidian imports.

import { normalizePath, Notice, setIcon } from "obsidian";
import { adoptName, type Adoption, prepareTakeoverTarget } from "./ageing/engine";
import {
  generateCompoundNamesDetailed,
  ListGenerator,
  MarkovModel,
  mulberry32,
  PlaceNameModel,
  buildWeightedCorpus,
  extractNamesFromMarkdown,
} from "./markov";
import { type MixPackIndexEntry, resolveMixSources } from "./nameParser";
import { samePackNotice, type TakeoverBatchResult, takeOverSteps } from "./takeover/batch";
import {
  DEFAULT_TAKEOVER_INSERT_FORMAT,
  formatAdoptedName,
  TAKEOVER_INSERT_FORMATS,
  type TakeoverInsertFormat,
} from "./takeover/format";
import { ICON_BULLET_INSERT, ICON_CHECKLIST_INSERT, ICON_TEXT_INSERT } from "./icons";
import { renderLoading, waitForPaint, waitForTask } from "./loading";
import { takeoverScorer } from "./takeover/recipe";

export interface TakeoverPackOption {
  path: string;
  label: string;
  /** Why the pack can't be used here; unset when it can. */
  reason?: string;
}

/** What the takeover view needs from the modal. */
export interface TakeoverHost {
  settings(): { faithfulness?: number; strictness?: number };
  scanFolderPacks(): Promise<MixPackIndexEntry[]>;
  /** The ageing target rules (ageing §1): the names a pack contributes, or why it can't be one. */
  targetNames(entry: MixPackIndexEntry, index: MixPackIndexEntry[]): { names: string[]; corpus: string[]; endings: string[] } | string;
  /** Why a pack can't be a target (ageing §1), or undefined. */
  targetReason(entry: MixPackIndexEntry, index: MixPackIndexEntry[]): string | undefined;
  lockedSeed(): number | undefined;
  setCurrentSeed(seed: number): void;
  buildSeedControls(container: HTMLElement): void;
  insertPlainText(text: string): void;
  insertNamesAsList(lines: string[], listType: "bullet" | "checklist"): void;
  setClearSelection(clear: () => void): void;
  setStatus(text: string): void;
  onNativeLabelChange(): void;
}

const SEED_MASK = 0x100000000;
const subSeed = (rng: () => number) => Math.floor(rng() * SEED_MASK) >>> 0;

/**
 * A one-name-at-a-time drawer for a native pack, using the generator and settings the Generate
 * view uses for that pack type (§2). Models are built once per run.
 */
export function nativeDrawer(
  entry: MixPackIndexEntry,
  index: MixPackIndexEntry[],
  settings: { faithfulness?: number; strictness?: number },
): ((rng: () => number) => string | null) | string {
  const { parsed } = entry;
  const faithfulness = settings.faithfulness ?? 2;
  const strictness = settings.strictness ?? 3;
  switch (parsed.packType) {
    case "listPack": {
      const generator = new ListGenerator();
      generator.train(extractNamesFromMarkdown(parsed.names.join("\n")));
      return (rng) => generator.generateMultiple(1, mulberry32(subSeed(rng)))[0] ?? null;
    }
    case "placePack": {
      const model = PlaceNameModel.build(extractNamesFromMarkdown(parsed.names.join("\n")));
      return (rng) => model.generateDetailed({ count: 1, faithfulness, strictness, seed: subSeed(rng) }).names[0] ?? null;
    }
    case "compoundPack": {
      const parts = parsed.parts ?? [];
      return (rng) =>
        generateCompoundNamesDetailed(parts, {
          count: 1,
          generator: parsed.compoundGenerator ?? "breakdown",
          joining: parsed.compoundJoining ?? "joined",
          faithfulness,
          strictness,
          seed: subSeed(rng),
        }).names[0] ?? null;
    }
    case "mixPack": {
      const resolved = resolveMixSources(normalizePath(entry.path), parsed, index);
      if (resolved.error) return resolved.error;
      const corpus = buildWeightedCorpus(resolved.sources.filter((s) => s.names.length > 0 && s.weight > 0));
      if (corpus.length === 0) return "the mix pack has no names";
      const model = MarkovModel.build(corpus);
      return (rng) => model.generateDetailed({ count: 1, faithfulness, strictness, seed: subSeed(rng) }).names[0] ?? null;
    }
    default: {
      const names = extractNamesFromMarkdown(parsed.names.join("\n"));
      if (names.length === 0) return "the pack has no names";
      const model = MarkovModel.build(names);
      return (rng) => model.generateDetailed({ count: 1, faithfulness, strictness, seed: subSeed(rng) }).names[0] ?? null;
    }
  }
}

const packLabel = (entry: MixPackIndexEntry) =>
  entry.parsed.packName || entry.path.split("/").pop()?.replace(/\.md$/i, "") || entry.path;

export class TakeoverView {
  nativePacks: TakeoverPackOption[] = [];
  nativePath: string | undefined;
  /** Takeover pack options; the modal shows them in the box beneath the native pack box. */
  takeoverPacks: TakeoverPackOption[] = [];
  takeoverPath: string | undefined;
  private format: TakeoverInsertFormat = DEFAULT_TAKEOVER_INSERT_FORMAT;

  constructor(private readonly host: TakeoverHost) {}

  /** Lists every pack as a native option, and marks takeover packs that fail the ageing target rules. */
  async refresh() {
    const index = await this.host.scanFolderPacks();
    const usable = index.filter((entry) => !entry.parsed.template);
    const byLabel = (a: TakeoverPackOption, b: TakeoverPackOption) => a.label.localeCompare(b.label);
    this.nativePacks = usable
      .map((entry) => ({ path: entry.path, label: packLabel(entry), reason: entry.templateError?.replace(/\.$/, "") }))
      .sort(byLabel);
    this.takeoverPacks = usable
      .map((entry) => ({ path: entry.path, label: packLabel(entry), reason: this.host.targetReason(entry, index) }))
      .sort(byLabel);
    if (this.nativePath && !this.nativePacks.some((p) => p.path === this.nativePath && !p.reason)) this.nativePath = undefined;
    if (this.takeoverPath && !this.takeoverPacks.some((p) => p.path === this.takeoverPath && !p.reason)) {
      this.takeoverPath = undefined;
    }
    this.host.onNativeLabelChange();
  }

  selectTakeover(path: string) {
    this.takeoverPath = path;
    this.host.onNativeLabelChange();
    this.showSamePackNotice();
  }

  takeoverLabel(): string {
    return this.takeoverPacks.find((p) => p.path === this.takeoverPath)?.label ?? "choose a takeover pack";
  }

  selectNative(path: string) {
    this.nativePath = path;
    this.host.onNativeLabelChange();
    this.showSamePackNotice();
  }

  nativeLabel(): string {
    return this.nativePacks.find((p) => p.path === this.nativePath)?.label ?? "choose a native pack";
  }

  private showSamePackNotice() {
    this.host.setStatus(samePackNotice(this.nativePath, this.takeoverPath) ?? "");
  }

  async run(batchSize: number) {
    if (!this.nativePath) {
      new Notice("nameForge: choose a native pack to generate names from.");
      return;
    }
    if (!this.takeoverPath) {
      new Notice("nameForge: choose a takeover pack.");
      return;
    }
    const same = samePackNotice(this.nativePath, this.takeoverPath);
    if (same) {
      this.host.setStatus(same);
      new Notice(`nameForge: ${same}`);
      return;
    }
    const index = await this.host.scanFolderPacks();
    const nativeEntry = index.find((e) => e.path === this.nativePath);
    const takeoverEntry = index.find((e) => e.path === this.takeoverPath);
    const draw = nativeEntry ? nativeDrawer(nativeEntry, index, this.host.settings()) : "the native pack was not found";
    if (typeof draw === "string") {
      new Notice(`nameForge: ${draw}.`);
      return;
    }
    const reason = takeoverEntry ? this.host.targetReason(takeoverEntry, index) : "the takeover pack was not found";
    const target = takeoverEntry && !reason ? this.host.targetNames(takeoverEntry, index) : reason;
    if (typeof target === "string" || target === undefined) {
      new Notice(`nameForge: ${target ?? "the takeover pack can't be used"}.`);
      return;
    }

    // A large batch takes seconds: show the loading dots, and yield between names so the count updates.
    this.host.setStatus("");
    renderLoading(this.resultsEl, `Taking over 0 of ${batchSize}…`);
    const loadingText = this.resultsEl?.querySelector(".nameforge-modal__loading-text");
    await waitForPaint();
    const prepared = prepareTakeoverTarget(target.corpus, takeoverScorer(this.host.settings().faithfulness ?? 2), target.endings);
    const steps = takeOverSteps({
      drawNative: draw,
      adopt: (native, rng) => adoptName({ native, target: prepared, rng }),
      batchSize,
      seed: this.host.lockedSeed(),
    });
    let result: TakeoverBatchResult;
    for (;;) {
      const next = steps.next();
      if (next.done) {
        result = next.value;
        break;
      }
      if (loadingText) loadingText.textContent = `Taking over ${next.value} of ${batchSize}…`;
      await waitForTask();
    }
    this.host.setCurrentSeed(result.seed);
    this.renderResults(this.resultsEl, result.rows);
    this.host.setStatus(result.notice ?? "");
  }

  resultsEl: HTMLElement | null = null;

  /** One row per adoption: native muted, then →, then the adopted name; selectable and insertable. */
  renderResults(container: HTMLElement | null, rows: Adoption[]) {
    if (!container) return;
    container.empty();
    const list = container.createEl("ul", { cls: "nameforge-modal__results-list nameforge-modal__takeover-results" });
    const actions = container.createDiv({ cls: "nameforge-modal__results-actions" });
    this.host.buildSeedControls(actions.createDiv({ cls: "nameforge-modal__seed-group" }));

    const buttonsGroup = actions.createDiv({ cls: "nameforge-modal__results-buttons" });
    const formatSelect = buttonsGroup.createEl("select", {
      cls: "dropdown nameforge-modal__ageing-format",
      attr: { "aria-label": "Insert as", title: "Insert as" },
    });
    for (const f of TAKEOVER_INSERT_FORMATS) {
      const option = formatSelect.createEl("option", { text: f.label, value: f.id });
      option.selected = f.id === this.format;
    }
    formatSelect.addEventListener("change", () => {
      this.format = formatSelect.value as TakeoverInsertFormat;
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

    const selected = (): Adoption[] =>
      Array.from(list.querySelectorAll("li.is-selected")).map((el) => rows[Number((el as HTMLElement).dataset.index)]);
    const update = () => {
      const n = selected().length;
      insertButton.disabled = n !== 1;
      checklistButton.disabled = n === 0;
      bulletButton.disabled = n === 0;
    };
    this.host.setClearSelection(() => {
      list.querySelectorAll("li.is-selected").forEach((el) => el.classList.remove("is-selected"));
      update();
    });

    rows.forEach((row, i) => {
      const item = list.createEl("li", { attr: { "data-index": String(i) } });
      item.createSpan({ cls: "nameforge-modal__takeover-native", text: row.native });
      item.createSpan({ cls: "nameforge-modal__takeover-arrow", text: " → " });
      item.createSpan({ cls: "nameforge-modal__takeover-adopted", text: row.adopted });
      item.addEventListener("click", () => {
        item.classList.toggle("is-selected");
        update();
      });
    });
    if (rows.length === 0) list.createEl("li", { cls: "nameforge-modal__placeholder", text: "No names were adopted." });

    const formatted = () => selected().map((r) => formatAdoptedName(r.native, r.adopted, this.format));
    insertButton.addEventListener("click", () => {
      const [text] = formatted();
      if (text) this.host.insertPlainText(text);
    });
    checklistButton.addEventListener("click", () => {
      const lines = formatted();
      if (lines.length > 0) this.host.insertNamesAsList(lines, "checklist");
    });
    bulletButton.addEventListener("click", () => {
      const lines = formatted();
      if (lines.length > 0) this.host.insertNamesAsList(lines, "bullet");
    });
    update();
  }
}
