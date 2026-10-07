// Obsidian side of recipe packs: reads recipe files, resolves templates and linked packs, and
// builds the name drawers the names engine needs. The engine itself (names/engine.ts) has no
// Obsidian imports.

import { App, parseYaml, TFile } from "obsidian";
import { buildWeightedCorpus, extractNamesFromMarkdown, generateCompoundNamesDetailed, MarkovModel, PlaceNameModel } from "./markov";
import {
  applyTemplate,
  isWordListContent,
  mergeWordListWithTemplate,
  type MixPackIndexEntry,
  type NamesFileData,
  parseNamesFileContent,
  parseWordListFileContent,
  resolveMixSources,
  type WordListFileData,
} from "./nameParser";
import { selectSectionNames, type SectionRequest } from "./packs/sections";
import { wordListEntries } from "./packs/wordList";
import { NAME_WORDS, type NameWordEntry, type NativeAdapter, type ResolvedSlot, type ResolvedSource } from "./names/engine";
import { applyRecipeTemplate, type NameMode, readRecipe, type RecipePartial, type RecipeSettings, withDefaults } from "./names/recipe";
import { PLACE_SHAPE_DATA } from "./placeShapes";
import { COLONIAL_DATA } from "./colonialShapes";
import { type RecipeTakeoverInput, resolveRecipeTakeover } from "./takeover/recipe";

/** The takeover module's target rules, supplied by the modal (the same ones the takeover section uses). */
export type TakeoverTargets = Pick<RecipeTakeoverInput, "targetReason" | "targetNames">;

const FRONTMATTER = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

export function isRecipeContent(content: string): boolean {
  const fm = content.match(FRONTMATTER);
  return !!fm && /^type:\s*["']?recipe["']?\s*$/m.test(fm[1]);
}

/** A recipe file's own settings (no template applied), its body, and any problems reading it. */
export function parseRecipeContent(content: string): { recipe: RecipePartial; body: string; problems: string[] } {
  const fm = content.match(FRONTMATTER);
  if (!fm) return { recipe: {}, body: content, problems: ["The recipe has no properties."] };
  let raw: unknown;
  try {
    raw = parseYaml(fm[1]);
  } catch {
    return { recipe: {}, body: content.slice(fm[0].length), problems: ["The recipe's properties aren't valid YAML."] };
  }
  const { recipe, problems } = readRecipe((raw ?? {}) as Record<string, unknown>);
  return { recipe, body: content.slice(fm[0].length), problems };
}

/** Labels used to match word-list sections (§9.2), including colonial categories and local generics (§9.3). */
const categoryLabels = new Map<string, string>([
  ...PLACE_SHAPE_DATA.categories.map((c) => [c.id, c.label] as const),
  ...COLONIAL_DATA.categories.map((c) => [c.id, c.label] as const),
  ["local-settlement-word", "Local settlement word"],
  ["local-market-word", "Local market word"],
]);

export interface LoadedRecipe {
  recipe: RecipeSettings;
  /** The recipe's own settings, before the template. */
  own: RecipePartial;
  /** The template's settings, if the recipe has one. */
  template?: RecipePartial;
  error?: string;
  problems: string[];
}

export class RecipeHost {
  private readonly notices = new Set<string>();

  constructor(
    private readonly app: App,
    private readonly settings: { faithfulness?: number; strictness?: number },
    private readonly index: MixPackIndexEntry[],
    private readonly targets?: TakeoverTargets,
  ) {}

  getNotices(): string[] {
    return [...this.notices];
  }

  private async read(file: TFile): Promise<string | null> {
    try {
      return await this.app.vault.cachedRead(file);
    } catch {
      return null;
    }
  }

  private resolveLink(target: string, from: string): TFile | null {
    const file = this.app.metadataCache.getFirstLinkpathDest(target, from);
    return file instanceof TFile ? file : null;
  }

  /** Reads a recipe and applies its template (§7). */
  async loadRecipe(file: TFile): Promise<LoadedRecipe> {
    const content = await this.read(file);
    if (content === null) return { recipe: withDefaults({}), own: {}, error: `Couldn't read “${file.basename}”.`, problems: [] };
    const { recipe: own, problems } = parseRecipeContent(content);
    let template: RecipePartial | undefined;
    if (own.templateOf) {
      const templateFile = this.resolveLink(own.templateOf, file.path);
      const templateContent = templateFile ? await this.read(templateFile) : null;
      if (templateContent !== null && isRecipeContent(templateContent)) template = parseRecipeContent(templateContent).recipe;
    }
    const applied = applyRecipeTemplate(own, template, file.basename);
    return { recipe: withDefaults(applied.recipe), own, template, error: applied.error, problems };
  }

  /**
   * Recipe takeover §A2: the recipe's takeover pack, prepared once for this run, as an adopter.
   * Undefined for organic recipes (the setting is ignored) and when none is set; a missing or
   * ineligible pack adds a notice and generation goes ahead as if none were set.
   */
  resolveTakeover(recipe: RecipeSettings, recipePath: string): NativeAdapter | undefined {
    if (!recipe.takeover || recipe.shape.part === "organic" || !this.targets) return undefined;
    const file = this.resolveLink(recipe.takeover, recipePath);
    const resolved = resolveRecipeTakeover({
      name: recipe.takeover,
      entry: file ? this.index.find((e) => e.path === file.path) : undefined,
      index: this.index,
      ...this.targets,
      faithfulness: this.settings.faithfulness ?? 2,
    });
    if ("notice" in resolved) {
      this.notices.add(resolved.notice);
      return undefined;
    }
    return resolved.adapt;
  }

  /** Resolves every slot setting to engine-ready sources (§6.2). */
  async resolveSlots(recipe: RecipeSettings, recipePath: string): Promise<Record<string, ResolvedSlot>> {
    const out: Record<string, ResolvedSlot> = {};
    for (const [categoryId, slot] of Object.entries(recipe.slots)) {
      if (slot.kind !== "sources") {
        out[categoryId] = { kind: slot.kind };
        continue;
      }
      const sources: ResolvedSource[] = [];
      for (const ref of slot.sources) {
        if (ref.list) {
          const entries = await this.wordListSource(ref.list, recipePath, categoryId);
          if (entries) sources.push({ weight: ref.weight, entries });
        } else if (ref.pack) {
          const draw = await this.packSource(ref.pack, recipePath);
          if (draw) sources.push({ weight: ref.weight, draw });
        }
      }
      out[categoryId] =
        sources.length > 0
          ? { kind: "sources", sources, mode: slot.mode, gender: slot.gender, section: slot.section }
          : NAME_WORDS.categories[categoryId]?.length
            ? { kind: "built-in" }
            : { kind: "placeholder" };
    }
    return out;
  }

  /** §9.2: the matching section, the whole list if it has none, else the built-in list with a notice. */
  private async wordListSource(target: string, from: string, categoryId: string): Promise<NameWordEntry[] | null> {
    const file = this.resolveLink(target, from);
    const content = file ? await this.read(file) : null;
    if (!file || content === null || !isWordListContent(content)) {
      this.notices.add(`Word list “${target}” wasn't found.`);
      return null;
    }
    let list: WordListFileData = parseWordListFileContent(content, file.basename);
    if (list.templateOf) {
      const templateFile = this.resolveLink(list.templateOf, file.path);
      const templateContent = templateFile ? await this.read(templateFile) : null;
      if (templateContent !== null && isWordListContent(templateContent)) {
        list = mergeWordListWithTemplate(list, parseWordListFileContent(templateContent));
      } else {
        this.notices.add(`Template “${list.templateOf}” for word list “${target}” is missing.`);
      }
    }
    const label = categoryLabels.get(categoryId) ?? categoryId;
    const entries = wordListEntries(list.list, label);
    if (entries === null) {
      this.notices.add(`“${target}” has no “${label}” section; using the built-in list.`);
      return NAME_WORDS.categories[categoryId] ?? null;
    }
    return entries.map((e) => ({
      modern: e.modern,
      ...(e.traditional ? { traditional: e.traditional } : {}),
      plural: e.plural,
      forms: e.combiningForms,
      fuses: e.fuses,
    }));
  }

  /** A drawer for one name pack: stem or whole names (§5), honouring section and gender (§10). */
  private async packSource(target: string, from: string): Promise<ResolvedSource["draw"] | null> {
    const file = this.resolveLink(target, from);
    const content = file ? await this.read(file) : null;
    if (!file || content === null) {
      this.notices.add(`Pack “${target}” wasn't found.`);
      return null;
    }
    let parsed: NamesFileData = parseNamesFileContent(content);
    if (parsed.templateOf) {
      const templateFile = this.resolveLink(parsed.templateOf, file.path);
      const templateContent = templateFile ? await this.read(templateFile) : null;
      const applied = applyTemplate(parsed, templateContent !== null ? parseNamesFileContent(templateContent) : undefined);
      if (applied.error) {
        this.notices.add(applied.error);
        return null;
      }
      parsed = applied.parsed;
    }
    const faithfulness = this.settings.faithfulness ?? 2;
    const strictness = this.settings.strictness ?? 3;
    const seedFrom = (rng: () => number) => Math.floor(rng() * 0x100000000) >>> 0;
    const pick = <T>(items: T[], rng: () => number) => (items.length > 0 ? items[Math.floor(rng() * items.length)] : null);
    const cache = new Map<string, unknown>();
    const cached = <T>(key: string, build: () => T): T => {
      if (!cache.has(key)) cache.set(key, build());
      return cache.get(key) as T;
    };
    const namesFor = (request: SectionRequest): string[] => {
      if (parsed.sectioned && (request.section || request.gender)) {
        const selection = selectSectionNames(parsed.sectioned, request, parsed.packType === "breakdownPack" ? 20 : 0);
        for (const n of selection.notices) this.notices.add(`${parsed.packName}: ${n}`);
        return selection.names;
      }
      return parsed.names;
    };
    const markovName = (names: string[], key: string, rng: () => number) => {
      if (names.length === 0) return null;
      const model = cached(key, () => MarkovModel.build(names));
      return model.generateDetailed({ count: 1, faithfulness, strictness, seed: seedFrom(rng) }).names[0] ?? pick(names, rng);
    };
    const requestKey = (r: SectionRequest) => `${r.section ?? ""}|${r.gender ?? ""}`;

    switch (parsed.packType) {
      case "listPack":
        return (request, _mode, rng) => pick(namesFor(request), rng);
      case "breakdownPack":
        return (request, _mode, rng) => markovName(namesFor(request), requestKey(request), rng);
      case "placePack": {
        const names = extractNamesFromMarkdown(parsed.names.join("\n"));
        return (_request, mode: NameMode, rng) => {
          const model = cached("place", () => PlaceNameModel.build(names));
          if (mode === "stem") return model.sampleStem(rng, faithfulness, strictness);
          return model.generateDetailed({ count: 1, faithfulness, strictness, seed: seedFrom(rng) }).names[0] ?? null;
        };
      }
      case "compoundPack": {
        const parts = parsed.parts ?? [];
        return (_request, mode: NameMode, rng) => {
          if (mode === "stem") {
            const first = parts[0] ?? [];
            return parsed.compoundGenerator === "list" ? pick(first, rng) : markovName(first, "part1", rng);
          }
          return (
            generateCompoundNamesDetailed(parts, {
              count: 1,
              generator: parsed.compoundGenerator ?? "breakdown",
              joining: parsed.compoundJoining ?? "joined",
              faithfulness,
              strictness,
              seed: seedFrom(rng),
            }).names[0] ?? null
          );
        };
      }
      case "mixPack":
        return (request, _mode, rng) => {
          const resolved = resolveMixSources(file.path, parsed, this.index, undefined, request);
          if (resolved.error) {
            this.notices.add(resolved.error);
            return null;
          }
          return markovName(buildWeightedCorpus(resolved.sources), `mix|${requestKey(request)}`, rng);
        };
    }
  }
}
