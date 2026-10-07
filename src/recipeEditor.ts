// The recipe editor (names-reference §6): every §6.1 setting and per-slot sources, written as YAML
// properties. Recipes that start from a template store only their differences (§7).

import { App, Modal, normalizePath, Notice, Setting, stringifyYaml, TFile } from "obsidian";
import { sanitizePackNameForFilename } from "./nameParser";
import { hasBuiltInList } from "./names/engine";
import {
  mergeRecipe,
  type RecipePartial,
  type RecipeSettings,
  recipeToFrontmatter,
  type SlotSetting,
  withDefaults,
} from "./names/recipe";
import { COLONIAL_DATA, COLONIAL_TRADITIONS, colonialContexts } from "./colonialShapes";
import { PLACE_SHAPE_DATA, PLACE_SHAPE_REGIONS } from "./placeShapes";
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
  onSaved: (path: string) => void;
}

/** The slot categories for a part: part 1's, or the colonial inventory for parts 2 and 2a (with local generics in 2a). */
function slotCategories(part: RecipeSettings["shape"]["part"]): { id: string; label: string }[] {
  const part1 = new Map(PLACE_SHAPE_DATA.categories.map((c) => [c.id, c.label]));
  if (part === "organic") return PLACE_SHAPE_DATA.categories.filter((c) => c.id !== "empty-slot");
  const code = part === "new-land" ? "2" : "2a";
  const out = [
    ...COLONIAL_DATA.inheritedCategories.filter((c) => c.parts.includes(code) && c.id !== "empty-slot").map((c) => ({ id: c.id, label: part1.get(c.id) ?? c.id })),
    ...COLONIAL_DATA.categories.filter((c) => c.parts.includes(code)).map((c) => ({ id: c.id, label: c.label })),
  ];
  if (code === "2a") out.push({ id: "local-settlement-word", label: "Local settlement word" }, { id: "local-market-word", label: "Local market word" });
  return out;
}
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const kebab = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export class RecipeEditorModal extends Modal {
  private name = "";
  private body = "";
  private own: RecipePartial = {};
  private template: RecipePartial | undefined;
  /** The working values shown in the form. */
  private working: RecipeSettings = withDefaults({});
  /** Slots the user has set explicitly (others use §6.3 defaults or the template). */
  private explicitSlots = new Set<string>();

  constructor(
    app: App,
    private readonly options: RecipeEditorOptions,
  ) {
    super(app);
  }

  async onOpen() {
    this.titleEl.setText(this.options.file ? "Edit recipe" : "New recipe");
    this.modalEl.addClass("nameforge-recipe-editor");
    if (this.options.file) {
      this.name = this.options.file.basename;
      const content = await this.app.vault.cachedRead(this.options.file);
      const parsed = parseRecipeContent(content);
      this.own = parsed.recipe;
      this.body = parsed.body.trim();
      if (this.own.templateOf) await this.loadTemplate(this.own.templateOf);
    }
    this.rebuildWorking();
    this.render();
  }

  onClose() {
    this.contentEl.empty();
  }

  private async loadTemplate(name: string | undefined) {
    this.template = undefined;
    if (!name) return;
    const file = this.app.metadataCache.getFirstLinkpathDest(name, this.options.file?.path ?? this.options.folderPath);
    if (!(file instanceof TFile)) return;
    const content = await this.app.vault.cachedRead(file);
    if (isRecipeContent(content)) this.template = parseRecipeContent(content).recipe;
  }

  private rebuildWorking() {
    this.working = withDefaults(this.template ? mergeRecipe(this.own, this.template) : this.own);
    this.explicitSlots = new Set(Object.keys(this.own.slots ?? {}));
  }

  /** Everything in the form, rebuilt after each change. */
  private render() {
    const el = this.contentEl;
    el.empty();
    const w = this.working;

    new Setting(el).setName("Name").addText((t) =>
      t.setValue(this.name).onChange((v) => {
        this.name = v;
      }),
    );

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

    el.createEl("h3", { text: "Shape" });
    new Setting(el).setName("Part").addDropdown((d) => {
      d.addOption("organic", "Organic (part 1)").addOption("new-land", "New land (part 2)").addOption("established", "Established culture (part 2a)");
      d.setValue(w.shape.part).onChange((v) => {
        w.shape.part = v as RecipeSettings["shape"]["part"];
        this.render();
      });
    });
    if (w.shape.part === "organic") {
      new Setting(el).setName("Region").addDropdown((d) => {
        d.addOption("all-britain", "All Britain");
        for (const r of PLACE_SHAPE_REGIONS) d.addOption(kebab(r.label), r.label);
        d.setValue(kebab(w.shape.region) === "all-britain" ? "all-britain" : this.regionValue(w.shape.region)).onChange((v) => {
          w.shape.region = v;
        });
      });
    } else {
      const part = w.shape.part === "new-land" ? "2" : "2a";
      new Setting(el).setName("Tradition").addDropdown((d) => {
        for (const t of COLONIAL_TRADITIONS) if (t.parts.includes(part)) d.addOption(t.id, t.label);
        d.setValue(w.shape.tradition).onChange((v) => {
          w.shape.tradition = v;
        });
      });
      new Setting(el).setName("Context").addDropdown((d) => {
        d.addOption("none", "None");
        for (const c of colonialContexts(part)) d.addOption(c.id, c.label);
        d.setValue(w.shape.context).onChange((v) => {
          w.shape.context = v;
        });
      });
    }
    new Setting(el).setName("Feature").addDropdown((d) => {
      d.addOption("any", "Any").addOption("settlement", "Settlement").addOption("landscape", "Landscape");
      for (const g of PLACE_SHAPE_DATA.groups) d.addOption(g.id, g.label);
      d.setValue(w.shape.feature).onChange((v) => {
        w.shape.feature = v;
      });
    });

    el.createEl("h3", { text: "Words and rendering" });
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
    new Setting(el)
      .setName("Generic words")
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

    el.createEl("h3", { text: "Slots" });
    el.createEl("p", {
      cls: "setting-item-description",
      text: "Where each category's words come from. Unset categories use their built-in list, or a placeholder if there isn't one.",
    });
    for (const category of slotCategories(w.shape.part)) this.renderSlot(el, category.id, category.label);

    el.createEl("h3", { text: "Description" });
    new Setting(el).setDesc("Shown when choosing this recipe as a template.").addTextArea((t) => {
      t.setValue(this.body).onChange((v) => {
        this.body = v;
      });
      t.inputEl.rows = 3;
    });

    const buttons = el.createDiv({ cls: "nameforge-recipe-editor__buttons" });
    buttons.createEl("button", { text: "Cancel" }).addEventListener("click", () => this.close());
    const save = buttons.createEl("button", { cls: "mod-cta", text: "Save" });
    save.addEventListener("click", () => void this.save());
  }

  private regionValue(value: string): string {
    const r = PLACE_SHAPE_REGIONS.find((x) => x.code === value.toUpperCase() || kebab(x.label) === kebab(value));
    return r ? kebab(r.label) : "all-britain";
  }

  private renderSlot(el: HTMLElement, id: string, label: string) {
    const w = this.working;
    const explicit = this.explicitSlots.has(id) || (this.template?.slots?.[id] !== undefined);
    const slot: SlotSetting | undefined = explicit ? w.slots[id] : undefined;
    const fallback = hasBuiltInList(id) ? "built-in list" : "placeholder";
    const setting = new Setting(el).setName(label).addDropdown((d) => {
      d.addOption("default", `Default (${fallback})`);
      if (hasBuiltInList(id)) d.addOption("built-in", "Built-in list");
      d.addOption("sources", "Packs or word lists").addOption("placeholder", "Placeholder").addOption("ignore", "Ignore");
      d.setValue(slot ? slot.kind : "default").onChange((v) => {
        if (v === "default") {
          delete w.slots[id];
          this.explicitSlots.delete(id);
        } else if (v === "sources") {
          w.slots[id] = { kind: "sources", sources: [{ pack: this.options.packs[0], weight: 1 }] };
          this.explicitSlots.add(id);
        } else {
          w.slots[id] = { kind: v as "built-in" | "placeholder" | "ignore" };
          this.explicitSlots.add(id);
        }
        this.render();
      });
    });
    setting.settingEl.addClass("nameforge-recipe-editor__slot");
    if (!slot || slot.kind !== "sources") return;

    const box = el.createDiv({ cls: "nameforge-recipe-editor__sources" });
    slot.sources.forEach((source, i) => {
      new Setting(box)
        .addDropdown((d) =>
          d
            .addOption("pack", "Name pack")
            .addOption("list", "Word list")
            .setValue(source.list ? "list" : "pack")
            .onChange((v) => {
              slot.sources[i] = v === "list" ? { list: this.options.lists[0], weight: source.weight } : { pack: this.options.packs[0], weight: source.weight };
              this.render();
            }),
        )
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
    new Setting(box)
      .addButton((b) =>
        b.setButtonText("Add source").onClick(() => {
          slot.sources.push({ pack: this.options.packs[0], weight: 1 });
          this.render();
        }),
      )
      .addDropdown((d) =>
        d
          .addOption("", "Mode: default")
          .addOption("stem", "Mode: stem")
          .addOption("whole", "Mode: whole")
          .setValue(slot.mode ?? "")
          .onChange((v) => {
            slot.mode = v === "stem" || v === "whole" ? v : undefined;
          }),
      )
      .addText((t) =>
        t
          .setPlaceholder("Section")
          .setValue(slot.section ?? "")
          .onChange((v) => {
            slot.section = v.trim() || undefined;
          }),
      )
      .addText((t) => {
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
    };
  }

  private async save() {
    const name = this.name.trim();
    if (!name) {
      new Notice("nameForge: give the recipe a name.");
      return;
    }
    const frontmatter = recipeToFrontmatter(this.collect());
    const content = `---\n${stringifyYaml(frontmatter)}---\n\n${this.body.trim()}\n`;
    const path = normalizePath(`${this.options.folderPath}/${sanitizePackNameForFilename(name)}.md`);
    try {
      const existing = this.app.vault.getFileByPath(path);
      if (this.options.file) {
        if (this.options.file.path !== path) {
          if (existing) {
            new Notice("nameForge: a file with that name already exists.");
            return;
          }
          await this.app.fileManager.renameFile(this.options.file, path);
        }
        await this.app.vault.modify(this.options.file, content);
      } else {
        if (existing) {
          new Notice("nameForge: a file with that name already exists.");
          return;
        }
        await this.app.vault.create(path, content);
      }
    } catch {
      new Notice(`nameForge: couldn't save the recipe to ${path}.`);
      return;
    }
    this.options.onSaved(path);
    this.close();
  }
}
