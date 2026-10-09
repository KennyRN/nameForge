// Biome packs (Land brief §9). No Obsidian imports.
//
// A biome pack starts from a base biome (built in, or another pack) and replaces whichever
// sections it lists; everything else comes from the base. Sections use the word-list format:
// `-` lines of comma-separated words with optional "(weight)" tags, word-list tables, and `//`
// pack lines. A section that matches its base as a set (word, weight and fuses, ignoring order) is
// the base's own, so `parse(biomeToText(b))` gives `b` back and saving keeps only real changes.

import { type Biome, type BiomeList, BIOMES, BRITAIN, findBiome, TERRAIN_CHOICES, type Terrain, type Weighted } from "./biomes";
import { COLONIAL_DATA } from "./colonialShapes";
import type { NameWordEntry } from "./names/engine";
import { table } from "./names/starterTemplates";
import { parseWordList, type PackLine } from "./packs/wordList";
import { PLACE_SHAPE_DATA } from "./placeShapes";

// ── Sections ────────────────────────────────────────────────────────────────

/** Biome lists in §9.3 order, with their headings and accepted aliases. */
const LIST_SECTIONS: [BiomeList, string, string[]][] = [
  ["wildAnimals", "Wild animals", ["wild animal"]],
  ["birds", "Birds", ["bird"]],
  ["creatures", "Creatures", ["fish and other creatures"]],
  ["trees", "Trees", ["tree"]],
  ["plants", "Plants", ["wild plant"]],
  ["crops", "Crops", ["crop"]],
  ["livestock", "Livestock", ["domestic animal"]],
  ["lifeways", "Lifeways", []],
  ["sacred", "Sacred", []],
  ["materials", "Materials", []],
  ["ground", "Ground", ["soil or ground"]],
  ["resources", "Resources", ["resource"]],
  ["seasons", "Seasons", ["season"]],
];
type TerrainPart = "land" | "water" | "short land" | "short water" | "shape groups" | "shape generics";
const TERRAIN_PARTS: TerrainPart[] = ["land", "water", "short land", "short water", "shape groups", "shape generics"];

const norm = (s: string) => s.trim().toLowerCase();
const kebab = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** One parsed section's lines. */
interface SectionContent {
  heading: string;
  words: Weighted[];
  /** Table rows, when the section has a table. */
  entries?: NameWordEntry[];
  packs: PackLine[];
}

export interface BiomePackFile {
  packName: string;
  /** A built-in id or a link to another pack ("[[Fen Country]]"). */
  basedOn: string;
  phrase?: string;
  universalWords: boolean;
  setting: string;
  guide: string;
  sections: SectionContent[];
}

/** A `-` line's items, each with its own optional "(weight)": "egret (2), heron". */
function weightedItems(text: string): Weighted[] {
  return text
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0)
    .map((item): Weighted => {
      const m = item.match(/^(.*?)\s*\((\d+(?:\.\d+)?)\)$/);
      return m ? [m[1].trim(), Number(m[2])] : [item, 1];
    });
}

function fusesOf(e: NameWordEntry): NameWordEntry["fuses"] {
  return e.fuses;
}

/** Parses a biome pack file: frontmatter, the guide (text before the first heading) and sections. */
export function parseBiomePackContent(content: string, fallbackName = "Biome"): BiomePackFile {
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  const frontmatter = fm ? fm[1] : "";
  const field = (key: string) => frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"))?.[1].trim().replace(/^['"]|['"]$/g, "") ?? "";
  const body = fm ? content.slice(fm[0].length) : content;
  const guideLines: string[] = [];
  const sections: SectionContent[] = [];
  let current: SectionContent | null = null;
  let tableLines: string[] = [];
  const flushTable = () => {
    if (current && tableLines.length > 0) {
      const rows = parseWordList(tableLines.join("\n")).unsectioned;
      current.entries = [
        ...(current.entries ?? []),
        ...rows.map((r) => ({
          modern: r.modern,
          ...(r.traditional ? { traditional: r.traditional } : {}),
          plural: r.plural,
          forms: r.combiningForms,
          fuses: r.fuses,
        })),
      ];
      current.words.push(...rows.map((r): Weighted => [r.modern, 1]));
    }
    tableLines = [];
  };
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    const heading = line.match(/^##\s+(.+?)\s*#*$/);
    if (heading) {
      flushTable();
      current = { heading: heading[1], words: [], packs: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      if (!/^#\s/.test(line)) guideLines.push(raw);
      continue;
    }
    if (line.startsWith("|")) {
      tableLines.push(line);
      continue;
    }
    flushTable();
    const bullet = line.match(/^[-*+]\s+(.+)$/);
    if (bullet) current.words.push(...weightedItems(bullet[1]));
    const pack = line.match(/^\/\/\s*(.+)$/);
    if (pack) {
      const parsed = parseWordList(`// ${pack[1]}`).unsectionedPacks[0];
      if (parsed) current.packs.push(parsed);
    }
  }
  flushTable();
  const universal = field("universal-words");
  return {
    packName: field("packName") || fallbackName,
    basedOn: field("based-on") || "temperate",
    ...(field("phrase") ? { phrase: field("phrase") } : {}),
    universalWords: universal !== "false",
    setting: field("setting"),
    guide: guideLines.join("\n").trim(),
    sections,
  };
}

// ── Applying a pack to its base ─────────────────────────────────────────────

const groupIds = new Map<string, string>([
  ...PLACE_SHAPE_DATA.groups.flatMap((g) => [[norm(g.id), g.id] as const, [norm(g.label), g.id] as const]),
  ...COLONIAL_DATA.groups.flatMap((g) => [[norm(g.id), g.id] as const, ...(g.label ? [[norm(g.label), g.id] as const] : [])]),
]);

/** "{Terrain}: land", "Coasts – short water" → terrain token and part. */
function terrainHeading(heading: string): { terrain: string; part: TerrainPart } | null {
  const m = heading.match(/^(.+?)\s*[:\-–]\s*(land|water|short land|short water|shape groups|shape generics)$/i);
  return m ? { terrain: m[1].trim(), part: m[2].toLowerCase() as TerrainPart } : null;
}

/** A terrain token → its id: a built-in label or id, or a custom terrain's name. */
function terrainId(token: string, custom: readonly Terrain[]): string | undefined {
  const t = norm(token);
  const builtIn = TERRAIN_CHOICES.find((x) => x.id !== "any" && (norm(x.id) === t || norm(x.label) === t));
  if (builtIn) return builtIn.id;
  return custom.find((x) => norm(x.label) === t || x.id === kebab(token))?.id;
}

const key = (words: Weighted[]) => words.map(([w, n]) => `${norm(w)}|${n}`).sort().join("\n");
const entryKey = (entries: NameWordEntry[]) => entries.map((e) => `${norm(e.modern)}|1|${fusesKey(fusesOf(e))}`).sort().join("\n");
/** Fuses as a word-list table writes them (number-fused reads back as yes). */
function fusesKey(f: NameWordEntry["fuses"]): string {
  return f === "no" || f === "number-spaced" || f === "mile" ? "no" : f === "traditional-only" ? "traditional-only" : "yes";
}
const recordKey = (r: Record<string, number>) => Object.entries(r).map(([k, v]) => `${k}|${v}`).sort().join("\n");

/**
 * Applies a parsed pack onto its base biome. Sections equal to the base's (as sets) keep the
 * base's own; unknown headings and terrains without weights are reported.
 */
export function applyBiomePack(base: Biome, pack: BiomePackFile, path?: string): { biome: Biome; problems: string[] } {
  const problems: string[] = [];
  const b: Biome = {
    ...base,
    land: { ...base.land },
    water: { ...base.water },
    short: { land: { ...base.short.land }, water: { ...base.short.water } },
    shapeMultipliers: { groups: { ...base.shapeMultipliers.groups }, generics: { ...base.shapeMultipliers.generics } },
    ...(base.entries ? { entries: { ...base.entries } } : {}),
    ...(base.customTerrains ? { customTerrains: [...base.customTerrains] } : {}),
  };
  if (path) {
    b.id = `pack:${path}`;
    b.custom = { path, base: base.custom?.path ?? base.id };
    b.label = pack.packName;
    b.phrase = pack.phrase ?? (/^the\b/i.test(pack.packName) ? pack.packName : `the ${pack.packName.toLowerCase()}`);
    b.guide = pack.guide || `Based on ${base.label}.`;
  } else {
    if (pack.phrase) b.phrase = pack.phrase;
    if (pack.guide) b.guide = pack.guide;
  }
  if (!pack.universalWords) b.universalWords = false;
  const packLines = { ...(base.packLines ?? {}) } as Record<string, PackLine[]>;

  // Terrain weights first, so custom terrains are known to the terrain sections.
  const weightsSection = pack.sections.find((s) => ["terrain weights", "terrains"].includes(norm(s.heading)));
  if (weightsSection) {
    const weights: Record<string, number> = {};
    const custom: Terrain[] = [];
    for (const [name, w] of weightsSection.words) {
      const id = terrainId(name, []);
      if (id) weights[id] = w;
      else {
        const cid = kebab(name);
        custom.push({ id: cid, label: name, phrase: `the ${name.toLowerCase()}`, shapeMultipliers: { groups: {}, generics: {} } });
        weights[cid] = w;
      }
    }
    if (recordKey(weights) !== recordKey(Object.fromEntries(Object.entries(base.terrainWeights).filter(([, w]) => w > 0)))) {
      b.terrainWeights = Object.fromEntries(TERRAIN_CHOICES.filter((t) => t.id !== "any").map((t) => [t.id, weights[t.id] ?? 0]));
      for (const t of custom) b.terrainWeights[t.id] = weights[t.id];
      if (custom.length > 0) b.customTerrains = custom;
      else delete b.customTerrains;
    }
  }
  const customTerrains = b.customTerrains ?? [];

  for (const section of pack.sections) {
    const h = norm(section.heading);
    if (section === weightsSection) continue;
    const list = LIST_SECTIONS.find(([, heading, aliases]) => norm(heading) === h || aliases.includes(h));
    if (list) {
      const [id] = list;
      if (section.packs.length > 0) packLines[id] = section.packs;
      const baseEntries = base.entries?.[id];
      if (section.entries) {
        if (!baseEntries || entryKey(section.entries) !== entryKey(baseEntries)) {
          b.entries = { ...(b.entries ?? {}), [id]: section.entries };
          b[id] = section.entries.map((e): Weighted => [e.modern, 1]);
        }
      } else if (key(section.words) !== key(base[id])) {
        b[id] = section.words;
        if (b.entries?.[id]) {
          const { [id]: _dropped, ...rest } = b.entries;
          b.entries = rest;
        }
      }
      continue;
    }
    if (h === "shape groups" || h === "shape generics") {
      const record = Object.fromEntries(section.words.map(([w, n]) => [h === "shape groups" ? (groupIds.get(norm(w)) ?? w) : w, n]));
      const target = h === "shape groups" ? "groups" : "generics";
      if (recordKey(record) !== recordKey(base.shapeMultipliers[target])) b.shapeMultipliers[target] = record;
      continue;
    }
    const th = terrainHeading(section.heading);
    if (!th) {
      problems.push(`Unknown heading “${section.heading}”.`);
      continue;
    }
    const tid = terrainId(th.terrain, customTerrains);
    if (!tid) {
      problems.push(`“${th.terrain}” has words but no weight in Terrain weights.`);
      continue;
    }
    if (th.part === "land" || th.part === "water") {
      const side = b[th.part];
      const own = (base[th.part][tid] ?? []).map(([w, n]): Weighted => [w, n]);
      if (key(section.words) !== key(own)) side[tid] = section.words;
    } else if (th.part === "short land" || th.part === "short water") {
      const kind = th.part === "short land" ? "land" : "water";
      if (base.terrainTags && section.entries) {
        // Britain-based: tagged built-ins. Equal as a set keeps the base's entries and tags.
        const listKey = kind === "land" ? "shortLand" : "shortWater";
        const baseTagged = (base.entries?.[listKey] ?? []).filter((e) => base.terrainTags![e.modern]?.includes(tid));
        if (entryKey(section.entries) !== entryKey(baseTagged)) {
          b.terrainTags = { ...b.terrainTags };
          const entries = [...(b.entries?.[listKey] ?? [])];
          for (const e of section.entries) {
            if (!entries.some((x) => norm(x.modern) === norm(e.modern))) entries.push(e);
            b.terrainTags[e.modern] = [...new Set([...(b.terrainTags[e.modern] ?? []), tid])];
          }
          for (const e of baseTagged) {
            if (!section.entries.some((x) => norm(x.modern) === norm(e.modern))) {
              b.terrainTags[e.modern] = (b.terrainTags[e.modern] ?? []).filter((t) => t !== tid);
            }
          }
          b.entries = { ...(b.entries ?? {}), [listKey]: entries };
        }
      } else if (key(section.words) !== key(base.short[kind][tid] ?? [])) {
        b.short[kind][tid] = section.words;
      }
    } else {
      // A custom terrain's shape multipliers (built-in terrains keep §2.7).
      const custom = customTerrains.find((t) => t.id === tid);
      if (!custom) continue;
      const record = Object.fromEntries(section.words.map(([w, n]) => [th.part === "shape groups" ? (groupIds.get(norm(w)) ?? w) : w, n]));
      custom.shapeMultipliers = { ...custom.shapeMultipliers, [th.part === "shape groups" ? "groups" : "generics"]: record };
    }
  }
  if (Object.keys(packLines).length > 0) b.packLines = packLines;
  for (const [, heading] of LIST_SECTIONS) {
    const s = pack.sections.find((x) => norm(x.heading) === norm(heading));
    if (s && s.words.length === 0 && s.packs.length === 0) problems.push(`“${heading}” is empty.`);
  }
  for (const t of Object.keys(b.terrainWeights).filter((t) => b.terrainWeights[t] > 0)) {
    const has = (b.land[t]?.length ?? 0) + (b.water[t]?.length ?? 0) + (b.short.land[t]?.length ?? 0) + (b.short.water[t]?.length ?? 0);
    if (has === 0 && customTerrains.some((c) => c.id === t)) problems.push(`“${customTerrains.find((c) => c.id === t)!.label}” has a weight but no words.`);
  }
  return { biome: b, problems };
}

/** Parses a self-contained pack (its base must be built in). */
export function parseBiomePack(content: string): Biome {
  const pack = parseBiomePackContent(content);
  const base = findBiome(pack.basedOn) ?? BIOMES.find((x) => x.id === "temperate")!;
  return applyBiomePack(base, pack).biome;
}

// ── Writing ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => String(Number(n.toFixed(6)));
/** `-` lines, 8 words to a line, "(weight)" where it isn't 1 (or always, for lifeways). */
function lines(words: Weighted[], alwaysWeights = false): string {
  const items = words.map(([w, n]) => (alwaysWeights || n !== 1 ? `${w} (${fmt(n)})` : w));
  const out: string[] = [];
  for (let i = 0; i < items.length; i += 8) out.push(`- ${items.slice(i, i + 8).join(", ")}`);
  return out.join("\n");
}
const terrainName = (id: string, custom: readonly Terrain[]) => TERRAIN_CHOICES.find((t) => t.id === id)?.label ?? custom.find((t) => t.id === id)?.label ?? id;

/** The sections of a biome as pack text (§9.4), in §9.3 order, without universal words. */
export function biomeSections(b: Biome): { heading: string; body: string }[] {
  const custom = b.customTerrains ?? [];
  const out: { heading: string; body: string }[] = [];
  const terrains = [...TERRAIN_CHOICES.filter((t) => t.id !== "any").map((t) => t.id), ...custom.map((t) => t.id)];
  out.push({
    heading: "Terrain weights",
    body: lines(terrains.filter((t) => (b.terrainWeights[t] ?? 0) > 0).map((t): Weighted => [terrainName(t, custom), b.terrainWeights[t]]), true),
  });
  for (const t of terrains) {
    if ((b.terrainWeights[t] ?? 0) <= 0) continue;
    const name = terrainName(t, custom);
    if (b.land[t]?.length) out.push({ heading: `${name}: land`, body: lines(b.land[t]) });
    if (b.water[t]?.length) out.push({ heading: `${name}: water`, body: lines(b.water[t]) });
    for (const kind of ["land", "water"] as const) {
      if (b.terrainTags) {
        const entries = (b.entries?.[kind === "land" ? "shortLand" : "shortWater"] ?? []).filter((e) => b.terrainTags![e.modern]?.includes(t));
        if (entries.length) out.push({ heading: `${name}: short ${kind}`, body: table(entries) });
      } else if (b.short[kind][t]?.length) out.push({ heading: `${name}: short ${kind}`, body: lines(b.short[kind][t]) });
    }
    const c = custom.find((x) => x.id === t);
    if (c && Object.keys(c.shapeMultipliers.groups).length) out.push({ heading: `${name}: shape groups`, body: lines(Object.entries(c.shapeMultipliers.groups), true) });
    if (c && Object.keys(c.shapeMultipliers.generics).length) out.push({ heading: `${name}: shape generics`, body: lines(Object.entries(c.shapeMultipliers.generics), true) });
  }
  for (const [id, heading] of LIST_SECTIONS) {
    const entries = b.entries?.[id];
    const packLines = (b.packLines?.[id] ?? []).map((p) => `// ${p.pack}${p.weight !== 1 ? ` (${fmt(p.weight)})` : ""}`).join("\n");
    const body = entries ? table(entries) : lines(b[id], id === "lifeways");
    out.push({ heading, body: [body, packLines].filter(Boolean).join("\n") });
  }
  out.push({ heading: "Shape groups", body: lines(Object.entries(b.shapeMultipliers.groups), true) });
  out.push({ heading: "Shape generics", body: lines(Object.entries(b.shapeMultipliers.generics), true) });
  return out;
}

/** The whole biome as pack text, with frontmatter (§9.4). */
export function biomeToText(b: Biome, basedOn = b.custom ? `[[${b.custom.base}]]` : b.id): string {
  const front = ["---", "type: biome", `packName: ${b.label}`, "setting: ", `based-on: "${basedOn}"`, `phrase: ${b.phrase}`];
  if (b.universalWords === false) front.push("universal-words: false");
  front.push("---");
  const sections = biomeSections(b).map((s) => `## ${s.heading}\n\n${s.body}`);
  return `${front.join("\n")}\n\n${b.guide}\n\n${sections.join("\n\n")}\n`;
}

/**
 * §9.4: keeps only the sections of `content` that differ from `base` (as sets of word, weight and
 * fuses), plus the guide text and frontmatter. Returns the trimmed text and the count of own sections.
 */
export function diffAgainstBase(content: string, base: Biome): { text: string; own: number } {
  const pack = parseBiomePackContent(content);
  const baseText = new Map(parseBiomePackContent(biomeToText(base)).sections.map((s) => [norm(s.heading), s]));
  const fm = content.match(/^---\s*\n[\s\S]*?\n---\s*/)?.[0] ?? "";
  const kept: string[] = [];
  const bodyLines = content.slice(fm.length).split(/\r?\n/);
  // Section texts as written, by heading.
  const written = new Map<string, string>();
  let current: string | null = null;
  let buffer: string[] = [];
  const flush = () => {
    if (current) written.set(current, buffer.join("\n").trim());
    buffer = [];
  };
  for (const line of bodyLines) {
    const h = line.trim().match(/^##\s+(.+?)\s*#*$/);
    if (h) {
      flush();
      current = h[1];
      continue;
    }
    if (current) buffer.push(line);
  }
  flush();
  for (const s of pack.sections) {
    const b = baseText.get(norm(s.heading));
    const same =
      b &&
      (s.entries && b.entries ? entryKey(s.entries) === entryKey(b.entries) : key(s.words) === key(b.words)) &&
      s.packs.length === b.packs.length;
    if (!same) kept.push(`## ${s.heading}\n\n${written.get(s.heading) ?? ""}`.trim());
  }
  const guide = pack.guide ? `${pack.guide}\n\n` : "";
  return { text: `${fm.trim()}\n\n${guide}${kept.join("\n\n")}\n`, own: kept.length };
}

// ── Resolving a folder of packs (§9.5) ─────────────────────────────────────

export interface BiomePackSource {
  path: string;
  content: string;
}

/** Resolves every pack's base chain (depth 5) and merges it; loops and missing bases fall back to temperate. */
export function resolveBiomePacks(files: readonly BiomePackSource[]): { biomes: Biome[]; problems: string[] } {
  const parsed = new Map(files.map((f) => [f.path, parseBiomePackContent(f.content, f.path.replace(/^.*\//, "").replace(/\.md$/, ""))]));
  const byName = new Map([...parsed].map(([path, p]) => [norm(p.packName), path]));
  const done = new Map<string, Biome>();
  const problems: string[] = [];
  const temperate = BIOMES.find((b) => b.id === "temperate")!;
  const resolve = (path: string, seen: string[]): Biome => {
    const cached = done.get(path);
    if (cached) return cached;
    const pack = parsed.get(path)!;
    const link = pack.basedOn.match(/^\[\[([^\]|]+)/)?.[1];
    let base: Biome | undefined;
    if (link) {
      const basePath = byName.get(norm(link)) ?? [...parsed.keys()].find((p) => p.replace(/\.md$/, "").endsWith(link));
      if (basePath && !seen.includes(basePath) && seen.length < 5) base = resolve(basePath, [...seen, path]);
    } else {
      base = pack.basedOn === "britain" ? BRITAIN : findBiome(pack.basedOn);
    }
    if (!base) {
      problems.push(`Biome pack “${pack.packName}” can't find its base “${link ?? pack.basedOn}”; using temperate woodland.`);
      base = temperate;
    }
    const { biome, problems: own } = applyBiomePack(base, pack, path);
    problems.push(...own.map((p) => `${pack.packName}: ${p}`));
    done.set(path, biome);
    return biome;
  };
  const biomes = [...parsed.keys()].map((p) => resolve(p, []));
  return { biomes: biomes.sort((a, b) => a.label.localeCompare(b.label)), problems };
}

export function isBiomePackContent(content: string): boolean {
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  return !!fm && /^type:\s*["']?biome["']?\s*$/m.test(fm[1]);
}
