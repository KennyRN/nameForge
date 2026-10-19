// The settlement kit (docs/settlement-kit-brief.md): one press makes a whole settlement – its name,
// realm, ruler, roads, districts, streets, squares, inns, buildings, groups and ships – by building a
// settlement context once (context.ts) and running the modules already built with it, in order (§6),
// then applying the kit's rules (§8). The kit has no word lists of its own. No Obsidian imports.

import kitData from "../data/settlement-kit.json";
import { generateBuildingNames, type BuildingKind } from "../buildings/engine";
import { generateEventNames, type EventKind } from "../events/engine";
import { generateBynames } from "../bynames/engine";
import { GROUP_FAMILIES, generateGroupNames, groupSetting, type GroupPeople, type GroupSafeguards, type GroupToneChoice, typesInSetting } from "../groups/engine";
import { generateInnNames, type InnSetting } from "../inns/engine";
import { mulberry32 } from "../markov";
import { generateRouteNames, findRouteCulture, ROUTE_ERAS, type RouteEra } from "../routes/engine";
import { generateStreetNames, sizeLabel, type StreetSize } from "../streets/engine";
import { generateVesselNames, VESSEL_CULTURES, type VesselModule } from "../vessels/engine";
import { buildContext, groupGenreFor, type ContextEffects, type SettlementContext } from "./context";
import type { Vocabulary } from "./vocab";

// ── Data ────────────────────────────────────────────────────────────────────

export type KitSize = StreetSize;
export type KitPosition = "inland" | "river" | "coast" | "crossroads";
export type KitContents = "whole" | "places" | "people";
export type KitDetail = "brief" | "standard" | "full";
export type KitSectionKey = "roads" | "districts" | "streets" | "squares" | "inns" | "buildings" | "groups" | "history" | "ships";

interface PositionData {
  key: KitPosition;
  text: string;
  sf: string;
  summary: string;
  sfSummary: string;
  setting: InnSetting;
  villageSetting?: InnSetting;
  ships?: "working" | "any";
  roadsExtra?: number;
  effects: ContextEffects;
  sfStation?: { setting: InnSetting; ships: "working" | "any"; effects: ContextEffects };
}

interface KitData {
  sizes: Record<KitSectionKey, Record<KitSize, number>>;
  detail: Record<KitDetail, number>;
  sections: { key: KitSectionKey; title: string; step: number }[];
  groups: { role: string; family: string; type?: string; from: KitSize; cult?: { share: number; tones: string[] } }[];
  hideFront: string[];
  positions: PositionData[];
  vessels: Record<VesselModule, Partial<Record<RouteEra, string>>>;
  history: { localUpTo: KitSize; foundingFrom: number };
  rulerShapes: string;
  villageOfficeWords: string[];
  seedStep: number;
  rerollStep: number;
  dedupeTries: number;
}

export const KIT_DATA = kitData as unknown as KitData;
export const KIT_POSITIONS = KIT_DATA.positions;
export const KIT_SIZES: KitSize[] = ["village", "town", "city", "great"];
export const KIT_CONTENTS: Record<KitContents, string> = { whole: "the whole settlement", places: "its places only", people: "its people and groups only" };
export const KIT_DETAILS: KitDetail[] = ["brief", "standard", "full"];

const isFuture = (era: RouteEra) => era === "NF" || era === "IS";

/** §2.2: a position's text in an era (NF–IS: planet, river world, ocean world, station). */
export const positionText = (key: KitPosition, era: RouteEra) => {
  const p = KIT_POSITIONS.find((x) => x.key === key)!;
  return isFuture(era) ? p.sf : p.text;
};

// ── Options and results ─────────────────────────────────────────────────────

/** Each module's merged safeguard lists (§10); the built-in lists when absent. */
export interface KitSafeguards {
  route?: GroupSafeguards;
  street?: GroupSafeguards;
  inn?: GroupSafeguards;
  building?: GroupSafeguards;
  group?: GroupSafeguards;
  byname?: GroupSafeguards;
  vessel?: GroupSafeguards;
  realm?: GroupSafeguards;
  event?: GroupSafeguards;
}

export interface KitOptions {
  culture?: string;
  era?: RouteEra;
  fantastic?: boolean;
  region?: string;
  size?: KitSize;
  position?: KitPosition;
  tone?: GroupToneChoice;
  contents?: KitContents;
  detail?: KitDetail;
  people?: GroupPeople;
  seed?: number;
  /** §8.4: how many times each section has been rerolled. */
  rerolls?: Partial<Record<KitSectionKey, number>>;
  safeguards?: KitSafeguards;
  vocab?: Vocabulary;
  /** §6 step 4: tells the kit which place names a module's block lists hold (for the town). */
  blocked?: (name: string) => boolean;
  /** §8.4: sections kept as they are (a reroll redoes only the others), with the ruler, road and landmarks. */
  keep?: { sections: KitSection[]; ruler: string | null; throughRoute: string | null; landmarks: string[] };
}

export interface KitEntry {
  text: string;
  /** §5.2: a group's role ("Watch"). */
  role?: string;
  /** §9.1: the road through the town. */
  through?: boolean;
  /** The module's kind for the name (buildings: defence, faith…; roads: road, drove…). */
  kind?: string;
}

export interface KitSection {
  key: KitSectionKey;
  title: string;
  entries: KitEntry[];
  /** The count §5.1 asks for. */
  wanted: number;
}

/** The options as the kit read them (defaults filled in). */
export type ResolvedKitOptions = Required<Pick<KitOptions, "culture" | "era" | "fantastic" | "size" | "position" | "tone" | "contents" | "detail" | "people" | "seed">> & { region?: string };

export interface Kit {
  options: ResolvedKitOptions;
  rerolls: Partial<Record<KitSectionKey, number>>;
  context: SettlementContext;
  /** §8.3. */
  summary: string;
  ruler: string | null;
  sections: KitSection[];
  notices: string[];
}

// ── Sizes (§5) ──────────────────────────────────────────────────────────────

/** §5.1: a section's count for a size and detail (brief ×0.5, full ×1.5, rounded up; 0 stays 0). */
export function sectionCount(key: KitSectionKey, size: KitSize, detail: KitDetail, position: KitPosition = "inland"): number {
  const base = KIT_DATA.sizes[key][size];
  if (base === 0) return 0;
  const extra = key === "roads" ? KIT_POSITIONS.find((p) => p.key === position)!.roadsExtra ?? 0 : 0;
  return Math.ceil(base * KIT_DATA.detail[detail]) + extra;
}

/** §5.1: the sections a contents choice keeps. */
export function sectionsFor(contents: KitContents, position: KitPosition, era: RouteEra): KitSectionKey[] {
  const all = KIT_DATA.sections.map((s) => s.key);
  if (contents === "people") return ["groups", "history"];
  const water = shipsModule(position, era) !== undefined;
  return all.filter((k) => !(contents === "places" && (k === "groups" || k === "ships" || k === "history")) && !(k === "ships" && !water));
}

/** §7.1: the position's settings and effects (NF–IS: the station counts as the coast). */
function positionInfo(position: KitPosition, era: RouteEra, size: KitSize): { setting: InnSetting; ships?: "working" | "any"; effects: ContextEffects; roadsExtra: number } {
  const p = KIT_POSITIONS.find((x) => x.key === position)!;
  if (isFuture(era) && p.sfStation) return { ...p.sfStation, roadsExtra: 0 };
  return { setting: size === "village" && p.villageSetting ? p.villageSetting : p.setting, ships: p.ships, effects: p.effects, roadsExtra: p.roadsExtra ?? 0 };
}

/** §7.2: ships for AN–MO and NF on water; spacecraft on a station and in IS; none inland. */
export function shipsModule(position: KitPosition, era: RouteEra): VesselModule | undefined {
  if (position === "inland") return undefined;
  if (era === "IS") return "spacecraft";
  if (era === "NF" && position === "crossroads") return "spacecraft";
  if (position === "crossroads") return undefined;
  return "ships";
}

// ── Generation (§6) ─────────────────────────────────────────────────────────

const norm = (s: string) => s.toLowerCase().replace(/^the /, "").trim();
// Events brief §10: History runs after Groups and before Ships, on a step of its own.
const STEPS: Record<KitSectionKey | "context" | "ruler", number> = { context: 1, ruler: 2, roads: 3, buildings: 4, districts: 5, streets: 6, squares: 7, inns: 8, groups: 9, ships: 10, history: 11 };
const LANDMARK_KINDS: BuildingKind[] = ["defence", "crossing", "water", "monument"];
/** §3: the route kinds that run through a town. */
const THROUGH_KINDS = ["road", "drove", "trade"];

/** §6: the sub-seed for a step: step × 7919 + kit seed (and a fresh one per reroll, §8.4). */
const subSeed = (seed: number, step: number, rerolls = 0) => (step * KIT_DATA.seedStep + seed + rerolls * KIT_DATA.rerollStep) >>> 0;

export function resolveKitOptions(o: KitOptions): ResolvedKitOptions {
  const culture = findRouteCulture(o.culture)?.key ?? "norman-british";
  const era: RouteEra = ROUTE_ERAS.some((e) => e.code === o.era) ? o.era! : "MD";
  return {
    culture,
    era,
    fantastic: !!o.fantastic,
    region: ["anglo-saxon", "celtic", "norman-british"].includes(culture) && o.region && o.region !== "all" ? o.region : undefined,
    size: KIT_SIZES.includes(o.size as KitSize) ? o.size! : "town",
    position: KIT_POSITIONS.some((p) => p.key === o.position) ? o.position! : "inland",
    tone: o.tone ?? "any",
    contents: o.contents && o.contents in KIT_CONTENTS ? o.contents : "whole",
    detail: KIT_DETAILS.includes(o.detail as KitDetail) ? o.detail! : "standard",
    people: o.people ?? "placeholders",
    seed: o.seed !== undefined && Number.isFinite(o.seed) ? o.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0,
  };
}

/** §8.3: "a town on a river, in the Kingdom of the Western Fells" (options and context only). */
export function kitSummary(o: ResolvedKitOptions, realm: string | null): string {
  const size = sizeLabel(o.size, o.era);
  const p = KIT_POSITIONS.find((x) => x.key === o.position)!;
  const where = isFuture(o.era) ? p.sfSummary : p.summary;
  const the = realm && !/^the /i.test(realm) ? `the ${realm}` : realm;
  return `${/^[aeiou]/i.test(size) ? "an" : "a"} ${size}${where ? ` ${where}` : ""}${the ? `, in ${the}` : ""}`;
}

/** §6: the whole kit. Same options and seed give the same kit. */
export function generateKit(options: KitOptions): Kit {
  const o = resolveKitOptions(options);
  const rerolls = { ...(options.rerolls ?? {}) };
  const notices: string[] = [];
  const g = options.safeguards ?? {};
  const pos = positionInfo(o.position, o.era, o.size);
  const seedFor = (key: KitSectionKey | "ruler") => subSeed(o.seed, STEPS[key], key === "ruler" ? 0 : rerolls[key] ?? 0);

  // 1. Context (§3).
  const context: SettlementContext = {
    ...buildContext(
      { culture: o.culture, era: o.era, fantastic: o.fantastic, region: o.region, people: o.people, tone: o.tone, village: o.size === "village", size: o.size, blocked: options.blocked, vocab: options.vocab, realmSafeguards: g.realm, scale: isFuture(o.era) ? (o.position === "crossroads" ? "Sy" : "Pl") : undefined },
      mulberry32(subSeed(o.seed, STEPS.context)),
    ),
    effects: pos.effects,
  };
  const keep = sectionsFor(o.contents, o.position, o.era);
  // Stellar brief §8: in the future eras the position sets the scale - a station is a star system, anywhere else a planet.
  const kitScale: "Pl" | "Sy" | undefined = isFuture(o.era) ? (o.position === "crossroads" ? "Sy" : "Pl") : undefined;
  const common = { culture: o.culture, era: o.era, fantastic: o.fantastic, region: o.region, tone: o.tone, people: o.people, vocab: options.vocab, context, ...(kitScale ? { scale: kitScale } : {}) };

  // §8.1: no name twice across sections (the road through town and the landmark back-links are
  // the same places by design, §8.2).
  const used = new Set<string>([norm(context.town)]);
  const sharedOk = (text: string) => {
    const n = norm(text);
    return (!!context.throughRoute && n === norm(context.throughRoute)) || context.landmarks.some((l) => norm(l) === n || norm(`${l} Inn`) === n);
  };
  const sections = new Map<KitSectionKey, KitSection>();
  // §8.4: kept sections stay exactly; the redone ones keep clear of their names.
  const kept = new Map((options.keep?.sections ?? []).map((sec) => [sec.key, sec] as const));
  for (const sec of kept.values()) for (const e of sec.entries) used.add(norm(e.text));
  const title = (key: KitSectionKey) => (key === "ships" && shipsModule(o.position, o.era) === "spacecraft" ? "Spacecraft" : KIT_DATA.sections.find((s) => s.key === key)!.title);

  /** §8.1: a module's names, each one already used replaced by one more draw (20 tries), then dropped. */
  const run = (key: KitSectionKey, wanted: number, batch: (seed: number, count: number) => { names: { text: string; kind?: string }[]; notices: string[] }) => {
    const keptSection = kept.get(key);
    if (keptSection) {
      sections.set(key, keptSection);
      return keptSection.entries;
    }
    const seed = seedFor(key);
    const first = batch(seed, wanted);
    const entries: KitEntry[] = [];
    const local = new Set<string>();
    const take = (name: { text: string; kind?: string }) => {
      const n = norm(name.text);
      if (local.has(n) || (used.has(n) && !sharedOk(name.text))) return false;
      local.add(n);
      entries.push({ text: name.text, ...(name.kind ? { kind: name.kind } : {}) });
      return true;
    };
    let short = 0;
    for (const n of first.names) if (!take(n)) short++;
    short += Math.max(0, wanted - first.names.length);
    for (let t = 1; t <= KIT_DATA.dedupeTries && entries.length < wanted && short > 0; t++) {
      for (const n of batch((seed + t * 104729) >>> 0, wanted).names) {
        if (entries.length >= wanted) break;
        take(n);
      }
    }
    for (const e of entries) used.add(norm(e.text));
    if (entries.length < wanted && first.notices.length > 0) notices.push(`${title(key)}: ${first.notices.join(" ")}`);
    else if (entries.length < wanted) notices.push(`${title(key)}: only ${entries.length} of ${wanted}.`);
    sections.set(key, { key, title: title(key), entries, wanted });
    return entries;
  };
  const want = (key: KitSectionKey) => (keep.includes(key) ? sectionCount(key, o.size, o.detail, o.position) : 0);

  // 2. Ruler (§6 step 2): one office title "… of {town}".
  let ruler: string | null = options.keep ? options.keep.ruler : null;
  if (o.contents !== "places" && !options.keep) {
    const r = generateBynames({
      module: "titles",
      culture: o.culture,
      kind: "office",
      genre: groupGenreFor(o.era),
      fantastic: o.fantastic,
      tone: o.tone,
      language: "english",
      gender: "anyone",
      source: "none",
      count: 1,
      seed: seedFor("ruler"),
      safeguards: g.byname,
      context,
      shapeFilter: (p) => p.endsWith(KIT_DATA.rulerShapes),
      officeWords: o.size === "village" ? KIT_DATA.villageOfficeWords : undefined,
    }).names[0];
    ruler = r?.text ?? null;
  }

  // 3. Roads, then the road through town: the first road, drove or trade route.
  const roadsWanted = want("roads");
  if (roadsWanted > 0 || keep.includes("streets") || keep.includes("inns")) {
    const roads = generateRouteNames({ ...common, series: true, count: Math.max(roadsWanted, 1), seed: seedFor("roads"), safeguards: g.route });
    // Stellar brief §8: a station keeps space lanes, so its road through town is one of them.
    const throughKinds = kitScale === "Sy" ? ["space"] : THROUGH_KINDS;
    let through = roads.names.find((n) => throughKinds.includes(n.kind));
    // A network of one other kind (pilgrim ways, motorways): one road, drove or trade route drawn
    // for the town, standing in for the last road (§8.2: the road through town is in Roads).
    for (const kind of through ? [] : throughKinds) {
      through = generateRouteNames({ ...common, kind, count: 1, seed: (seedFor("roads") + 1) >>> 0, safeguards: g.route }).names.find((n) => n.kind === kind);
      if (through) break;
    }
    context.throughRoute = kept.has("roads") ? options.keep!.throughRoute : through?.text ?? null;
    if (roadsWanted > 0) {
      run("roads", roadsWanted, (seed, count) => (seed === seedFor("roads") ? roads : generateRouteNames({ ...common, series: true, count, seed, safeguards: g.route })));
      const section = sections.get("roads")!;
      // §8.2: the road through town is in Roads.
      if (context.throughRoute && !section.entries.some((e) => e.text === context.throughRoute)) section.entries[Math.min(section.entries.length, roadsWanted) - 1] = { text: context.throughRoute, kind: through!.kind };
      for (const e of section.entries) if (e.text === context.throughRoute) e.through = true;
    }
  }

  // 4. Buildings, then the landmarks streets and inns may name.
  const buildingRun = (seed: number, count: number) =>
    generateBuildingNames({ ...common, series: true, setting: pos.setting, count, seed, safeguards: g.building });
  const buildingsWanted = want("buildings");
  if (buildingsWanted > 0) {
    run("buildings", buildingsWanted, buildingRun);
    if (!kept.has("buildings")) patronSaint(sections.get("buildings")!);
    context.landmarks = kept.has("buildings") ? options.keep!.landmarks : landmarksOf(sections.get("buildings")!.entries);
  }

  // 5–7. Districts, streets, squares and markets: SD's kinds, as one town.
  const street = (kind: "districts" | "streets" | "squares") => (seed: number, count: number) =>
    generateStreetNames({ ...common, kind, size: o.size, series: true, count, seed, safeguards: g.street, routeSafeguards: g.route, landmarkSafeguards: g.building });
  if (want("districts") > 0) run("districts", want("districts"), street("districts"));
  if (want("streets") > 0) {
    const entries = run("streets", want("streets"), street("streets"));
    // §8.2: with 8 or more streets, the road through town is one of them (a street's own safeguards
    // can turn it away, as a christian word in a road named for a place).
    const through = context.throughRoute;
    if (!kept.has("streets") && through && entries.length >= 8 && !entries.some((e) => e.text === through)) {
      used.delete(norm(entries[entries.length - 1].text));
      entries[entries.length - 1] = { text: through, kind: "streets" };
    }
  }
  if (want("squares") > 0) run("squares", want("squares"), street("squares"));

  // 8. Inns: IT kind Any, as one town.
  if (want("inns") > 0)
    run("inns", want("inns"), (seed, count) =>
      generateInnNames({ ...common, series: true, setting: pos.setting, count, seed, safeguards: g.inn, routeSafeguards: g.route, landmarkSafeguards: g.building }),
    );

  // 9. Groups (§5.2).
  if (want("groups") > 0) {
    if (kept.has("groups")) sections.set("groups", kept.get("groups")!);
    else groupsSection(want("groups"));
  }

  // Events brief §10: History, as one history, local for a village or town; founded first.
  if (want("history") > 0) {
    const scale = KIT_SIZES.indexOf(o.size) <= KIT_SIZES.indexOf(KIT_DATA.history.localUpTo) ? "local" : "realm";
    const events = (seed: number, count: number, extra: { kind?: EventKind; shape?: string } = {}) =>
      generateEventNames({ ...common, scale, series: !extra.shape, count, seed, safeguards: g.event, ...extra });
    const wanted = want("history");
    const founding = wanted >= KIT_DATA.history.foundingFrom;
    run("history", wanted, (seed, count) => {
      if (!founding) return events(seed, count);
      const first = events(seed, 1, { kind: "migration", shape: "Founding of {place}" });
      const rest = events(seed, count - 1);
      return { names: [...first.names, ...rest.names], notices: [...first.notices, ...rest.notices] };
    });
  }

  // 10. Ships (§7.2).
  const module = shipsModule(o.position, o.era);
  if (module && want("ships") > 0) {
    const vesselCulture = VESSEL_CULTURES.some((c) => c.key === context.vesselCulture) ? context.vesselCulture : "general";
    const technology = KIT_DATA.vessels[module][o.era] ?? (module === "ships" ? "T7" : "S3");
    const fn = (isFuture(o.era) && o.position === "crossroads" ? "any" : pos.ships) === "working" ? "working" : undefined;
    run("ships", want("ships"), (seed, count) => {
      const b = generateVesselNames({ module, culture: vesselCulture, technology, function: fn, genre: groupGenreFor(o.era), fantastic: o.fantastic, tone: o.tone, people: o.people, count, seed, safeguards: g.vessel, context });
      return { names: b.names.map((n) => ({ text: n.text, kind: n.function })), notices: b.notices };
    });
  }

  const order = KIT_DATA.sections.map((s) => s.key).filter((k) => sections.has(k));
  return {
    options: o,
    rerolls,
    context,
    summary: kitSummary(o, context.realm),
    ruler,
    sections: order.map((k) => sections.get(k)!),
    notices,
  };

  /** §8.2: with a saint, town size and up, a building with the saint's name (the faith building redrawn once). */
  function patronSaint(section: KitSection) {
    const holy = context.holy;
    if (!holy || o.size === "village" || section.entries.some((e) => e.text.includes(holy))) return;
    for (let t = 0; t < 10; t++) {
      const n = generateBuildingNames({
        ...common,
        kind: "faith",
        setting: pos.setting,
        shape: "{holy:poss} {bw}",
        count: 1,
        seed: (seedFor("buildings") + 7 + t) >>> 0,
        safeguards: g.building,
      }).names[0];
      if (!n || !n.text.includes(holy) || used.has(norm(n.text))) continue;
      // The faith building, or (with none) the last building.
      const faith = section.entries.findIndex((e) => e.kind === "faith");
      const replace = faith >= 0 ? faith : section.entries.length - 1;
      if (replace < 0) section.entries.push({ text: n.text, kind: "faith" });
      else {
        used.delete(norm(section.entries[replace].text));
        section.entries[replace] = { text: n.text, kind: "faith" };
      }
      used.add(norm(n.text));
      return;
    }
  }

  /** §5.2: the group line-up for the size, in order, until the count is reached. */
  function groupsSection(wanted: number) {
    const genre = groupGenreFor(o.era);
    const setting = groupSetting(genre, genre === "scifi" ? false : o.fantastic);
    const sizeIndex = KIT_SIZES.indexOf(o.size);
    // The size's own line-up first, then (full detail) the rest of the list in order.
    const rows = [...KIT_DATA.groups.filter((r) => KIT_SIZES.indexOf(r.from) <= sizeIndex), ...KIT_DATA.groups.filter((r) => KIT_SIZES.indexOf(r.from) > sizeIndex)];
    const rng = mulberry32(seedFor("groups"));
    const entries: KitEntry[] = [];
    let index = 0;
    for (const row of rows) {
      if (entries.length >= wanted) break;
      index++;
      const family = GROUP_FAMILIES.find((f) => f.key === row.family)!;
      let type = row.type;
      // §5.2: a cult instead of the holy order, 20% of the time with a grim or strange tone.
      if (row.cult && row.cult.tones.includes(o.tone) && rng() < row.cult.share) type = "cult";
      const offered = typesInSetting(family, setting);
      if (offered.length === 0 || (type && !offered.some((t) => t.key === type))) continue;
      const front = KIT_DATA.hideFront.includes(row.family) || type === "secret" ? "may" : undefined;
      for (let t = 0; t <= KIT_DATA.dedupeTries; t++) {
        const n = generateGroupNames({
          family: row.family,
          type,
          tradition: context.tradition,
          genre,
          fantastic: o.fantastic,
          form: "any",
          front,
          people: o.people,
          tone: o.tone,
          count: 1,
          seed: (seedFor("groups") + index * 31 + t * 104729) >>> 0,
          safeguards: g.group,
          context,
          ...(kitScale ? { scale: kitScale } : {}),
        }).names[0];
        if (!n || used.has(norm(n.text))) continue;
        used.add(norm(n.text));
        entries.push({ text: n.text, role: row.role });
        break;
      }
    }
    if (entries.length < wanted) notices.push(`Groups: only ${entries.length} of ${wanted}.`);
    sections.set("groups", { key: "groups", title: "Groups", entries, wanted });
  }
}

/** §3: the buildings' defences, crossings, water and monuments of 3 words or fewer, without "the". */
export function landmarksOf(entries: KitEntry[]): string[] {
  return entries
    .filter((e) => LANDMARK_KINDS.includes(e.kind as BuildingKind))
    .map((e) => e.text.replace(/^the /, ""))
    .filter((t) => t.split(" ").length <= 3);
}

// ── Rerolls (§8.4) ──────────────────────────────────────────────────────────

/** §8.4: the sections a reroll redoes (Roads and Buildings also redo Streets and Inns). */
export function rerollTargets(key: KitSectionKey): KitSectionKey[] {
  if (key === "roads" || key === "buildings") return [key, "streets", "inns"];
  return [key];
}

/** §8.4: the kit with one section redone (same context, a new sub-seed), and the note. */
export function rerollKit(kit: Kit, key: KitSectionKey, options: Omit<KitOptions, keyof ResolvedKitOptions | "rerolls"> = {}): { kit: Kit; note?: string } {
  const rerolls = { ...kit.rerolls };
  for (const k of rerollTargets(key)) rerolls[k] = (rerolls[k] ?? 0) + 1;
  const redo = rerollTargets(key);
  const keep = { sections: kit.sections.filter((s) => !redo.includes(s.key)), ruler: kit.ruler, throughRoute: kit.context.throughRoute, landmarks: kit.context.landmarks };
  const next = generateKit({ ...kit.options, ...options, rerolls, keep });
  const others = rerollTargets(key).filter((k) => k !== key && next.sections.some((s) => s.key === k));
  const note = others.length > 0 ? `${others.map((k) => KIT_DATA.sections.find((s) => s.key === k)!.title.toLowerCase()).join(" and ").replace(/^./, (c) => c.toUpperCase())} were redone to match.` : undefined;
  return { kit: next, note };
}
