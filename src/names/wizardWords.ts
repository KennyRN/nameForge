// The place name wizard's page 4 (Presets brief §4, §6): what each slot draws from, its words as
// an editable section, change detection and the recipe's word-list note. No Obsidian imports.

import { availableTerrains, type Biome, BRITAIN, biomeEntries, shortWords } from "../biomes";
import { parseWordList } from "../packs/wordList";
import { hasBuiltInList, NAME_WORDS, type NameWordEntry } from "./engine";
import { type ShapePart, type SlotSetting, type SourceRef } from "./recipe";
import { usesNativeDefault } from "./slotOptions";
import { wordTable } from "./starterTemplates";

/** What a slot on page 4 draws from (§4.1). */
export type WordsStatus = "built-in" | "biome" | "placeholder" | "edited" | "sources" | "native" | "tribal" | "river";

export interface SlotWordsView {
  id: string;
  label: string;
  status: WordsStatus;
  /** The summary row's status text: "Built-in", "Savannah list", "Word list"… */
  statusText: string;
  /** Editable sections: the baseline the text is compared with (§6.2). */
  baseline?: string;
  /** Editable sections: the text shown (the baseline, or the note's section when edited). */
  text?: string;
  /** Edited sections: what Reset returns to. */
  resetTo?: "built-in" | "placeholder" | "biome";
  /** Read-only source lines. */
  sources?: SourceRef[];
}

/** Land slots that follow the biome when unset (the engine's LAND_BIOME_SLOTS). */
const LAND_BIOME_SLOTS = new Set(["wild-animal", "bird", "fish-and-other-creatures", "tree", "wild-plant", "soil-or-ground", "resource", "season", "domestic-animal", "crop"]);
const NATIVE_PACK_SLOTS = new Set(["native-place-name", "native-people-or-tribe"]);
const SHORT_KINDS: Record<string, "land" | "water"> = { landform: "land", "water-or-wetland-feature": "water" };

const entriesOf = (pairs: [NameWordEntry, number][] | undefined) => (pairs ?? []).map(([e]) => e);

/** A biome's short land or water words for the terrain, or for every terrain it has when Any. */
function terrainWords(biome: Biome, kind: "land" | "water", terrain: string | undefined): NameWordEntry[] {
  if (terrain && terrain !== "any") return entriesOf(shortWords(biome, kind, terrain));
  const seen = new Set<string>();
  const out: NameWordEntry[] = [];
  for (const t of availableTerrains(biome)) {
    for (const [e] of shortWords(biome, kind, t.id)) {
      if (seen.has(e.modern)) continue;
      seen.add(e.modern);
      out.push(e);
    }
  }
  return out;
}

/**
 * The words an unset (or built-in, or "From the biome") slot draws, as the engine resolves them:
 * the biome's list, the built-in list, or none (a placeholder).
 */
export function slotBaselineSource(
  part: ShapePart,
  id: string,
  slot: SlotSetting | undefined,
  biome: Biome | undefined,
  terrain: string | undefined,
): { from: "built-in" | "biome" | "placeholder"; entries: NameWordEntry[] } {
  const own = biome && biome.id !== BRITAIN.id ? biome : undefined;
  const unset = !slot;
  const colonial = part !== "organic";
  if (slot?.kind === "placeholder") return { from: "placeholder", entries: [] };
  // Colonial flora and fauna: the biome's words, or native placeholders (an explicit built-in draws the British list).
  if (colonial && unset && usesNativeDefault(part, id)) {
    const entries = own ? entriesOf(biomeEntries(own, id)) : [];
    return entries.length > 0 ? { from: "biome", entries } : { from: "placeholder", entries: [] };
  }
  if (unset || slot?.kind === "biome") {
    const kind = SHORT_KINDS[id];
    if (kind && (own || (terrain && terrain !== "any"))) {
      const entries = terrainWords(own ?? BRITAIN, kind, terrain);
      if (entries.length > 0) return { from: own ? "biome" : "built-in", entries };
    }
    const followsBiome = LAND_BIOME_SLOTS.has(id) && !(colonial && (id === "domestic-animal" || id === "crop") && slot?.kind !== "biome");
    if (own && followsBiome) {
      const entries = entriesOf(biomeEntries(own, id));
      if (entries.length > 0) return { from: "biome", entries };
    }
  }
  if (hasBuiltInList(id)) return { from: "built-in", entries: NAME_WORDS.categories[id] ?? [] };
  return { from: "placeholder", entries: [] };
}

/** §6.2: a baseline as the section text page 4 shows (empty for a placeholder). */
export function baselineText(source: { entries: NameWordEntry[] }): string {
  return source.entries.length > 0 ? wordTable(source.entries) : "";
}

/** §4.1: how one slot shows on page 4, or undefined when it is left out (Ignore). */
export function slotWordsView(args: {
  part: ShapePart;
  id: string;
  label: string;
  slot: SlotSetting | undefined;
  biome: Biome | undefined;
  terrain: string | undefined;
  /** The recipe's native pack, if any. */
  native?: string;
  /** The recipe's own word-list note and its body (without frontmatter). */
  words?: string;
  wordsBody?: string;
}): SlotWordsView | undefined {
  const { part, id, label, slot, biome, terrain, native, words, wordsBody } = args;
  if (slot?.kind === "ignore") return undefined;
  const base = { id, label };
  if (slot?.kind === "tribal") return { ...base, status: "tribal", statusText: "Tribal names" };
  if (id === "river-or-stream-name" && (!slot || slot.kind === "built-in")) return { ...base, status: "river", statusText: "River names" };
  if (!slot && native && part !== "organic" && NATIVE_PACK_SLOTS.has(id)) {
    return { ...base, status: "native", statusText: "Native pack", sources: [{ pack: native, weight: 1 }] };
  }
  const describe = (source: ReturnType<typeof slotBaselineSource>) =>
    source.from === "biome" ? `${biome?.label ?? "Biome"} list` : source.from === "built-in" ? "Built-in" : "Placeholder";
  if (slot?.kind === "sources") {
    const only = slot.sources.length === 1 ? slot.sources[0] : undefined;
    if (words && only?.list !== undefined && same(only.list, words)) {
      // Edited: the note's section, with Reset returning to what the slot draws when unset.
      const source = slotBaselineSource(part, id, undefined, biome, terrain);
      const section = splitSections(wordsBody ?? "").sections.find((s) => same(s.name, label));
      return {
        ...base,
        status: "edited",
        statusText: "Edited",
        baseline: baselineText(source),
        text: section ? section.raw.replace(/^.*\n?/, "").trim() : "",
        resetTo: source.from,
      };
    }
    const lists = slot.sources.every((s) => s.list !== undefined);
    const packs = slot.sources.every((s) => s.pack !== undefined);
    const statusText = slot.sources.length > 1 ? "Sources" : lists ? "Word list" : packs ? "Name pack" : "Sources";
    return { ...base, status: "sources", statusText, sources: slot.sources };
  }
  const source = slotBaselineSource(part, id, slot, biome, terrain);
  const text = baselineText(source);
  return { ...base, status: source.from, statusText: describe(source), baseline: text, text };
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// ── Change detection (§6.2) ───────────────────────────────────────────────────

/** A section's contents as sorted keys: table rows, `-` words and `//` pack lines. */
function contentKeys(text: string): string[] {
  const list = parseWordList(text);
  const entries = [...list.unsectioned, ...list.sections.flatMap((s) => s.entries)];
  const packs = [...list.unsectionedPacks, ...list.sections.flatMap((s) => s.packs)];
  return [
    ...entries.map((e) =>
      ["w", e.modern, e.traditional ?? "", e.plural, [...e.combiningForms].sort().join(","), e.fuses, e.weight ?? 1, e.gender ?? ""].join("|").toLowerCase(),
    ),
    ...packs.map((p) => ["p", p.pack, p.weight, p.gender ?? ""].join("|").toLowerCase()),
  ].sort();
}

/** Whether a section's text differs from its baseline, by parsed contents (reformatting is no change). */
export function sectionChanged(text: string, baseline: string): boolean {
  const a = contentKeys(text);
  const b = contentKeys(baseline);
  return a.length !== b.length || a.some((k, i) => k !== b[i]);
}

// ── The recipe's word-list note (§6.3, §6.4) ──────────────────────────────────

/** Splits a note body into its description (before the first `##`) and its raw `##` sections. */
function splitSections(body: string): { description: string; sections: { name: string; raw: string }[] } {
  const lines = body.split(/\r?\n/);
  const sections: { name: string; raw: string[] }[] = [];
  const description: string[] = [];
  for (const line of lines) {
    const heading = line.trim().match(/^##\s+(.+?)\s*#*$/);
    if (heading) sections.push({ name: heading[1], raw: [line] });
    else if (sections.length > 0) sections[sections.length - 1].raw.push(line);
    else description.push(line);
  }
  return { description: description.join("\n").trim(), sections: sections.map((s) => ({ name: s.name, raw: s.raw.join("\n").trim() })) };
}

/**
 * §6.3: the note's new body. Changed sections are written (in place, or added at the end);
 * sections for shown slots that are no longer changed are dropped; the description and every
 * other section are kept as they are.
 */
export function assembleWordsNote(
  existingBody: string | undefined,
  description: string,
  shownLabels: string[],
  changed: { label: string; text: string }[],
): string {
  const { description: oldDescription, sections } = splitSections(existingBody ?? "");
  const shown = (name: string) => shownLabels.some((l) => same(l, name));
  const written = new Set<string>();
  const out: string[] = [];
  for (const s of sections) {
    const replacement = changed.find((c) => same(c.label, s.name));
    if (replacement) {
      out.push(`## ${replacement.label}\n\n${replacement.text.trim()}`);
      written.add(replacement.label.toLowerCase());
    } else if (!shown(s.name)) out.push(s.raw);
  }
  for (const c of changed) if (!written.has(c.label.toLowerCase())) out.push(`## ${c.label}\n\n${c.text.trim()}`);
  return [existingBody === undefined ? description : oldDescription, ...out].filter((x) => x.length > 0).join("\n\n");
}

/** §6.3: the slots after saving: changed ones point at the note; the rest return to their page 3 setting. */
export function applyWordsToSlots(
  slots: Record<string, SlotSetting>,
  results: { id: string; changed: boolean; previous: SlotSetting | undefined }[],
  noteName: string,
): Record<string, SlotSetting> {
  const out = { ...slots };
  for (const r of results) {
    if (r.changed) out[r.id] = { kind: "sources", sources: [{ list: noteName, weight: 100 }] };
    else if (r.previous) out[r.id] = r.previous;
    else delete out[r.id];
  }
  return out;
}

/** §6.4: "{recipe} words", or the next free "{recipe} words 2", "… 3"; the recipe's own note keeps its name. */
export function wordsNoteName(recipeName: string, exists: (name: string) => boolean, current?: string): string {
  if (current) return current;
  const base = `${recipeName} words`;
  if (!exists(base)) return base;
  for (let n = 2; ; n++) if (!exists(`${base} ${n}`)) return `${base} ${n}`;
}

/** §6.4: the description line of a new note. */
export function wordsNoteDescription(recipeName: string): string {
  return `Words for the [[${recipeName}]] recipe.`;
}
