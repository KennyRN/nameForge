// The settlement context (docs/settlement-kit-brief.md §3–§4): one town, its neighbours, realm,
// founder, saint, trades, goods, road and landmarks, drawn once and passed to every module the kit
// runs through each engine's optional `context` option. Also the small helpers the engines share for
// it: which `{town}` is this place, and the ×4 weights for the context's words. No Obsidian imports.

import {
  type GroupPeople,
  type GroupSafeguards,
  type GroupToneChoice,
  GROUP_DATA,
  groupSaint,
  groupTown,
  hasBannedWord,
  normForBlock,
  pickWeighted,
} from "../groups/engine";
import { generateRealmNames, REALM_DATA, REALM_ERAS } from "../realms/engine";
import { holyNamesIn, townSource } from "../bynames/engine";
import { PLACE_SHAPE_REGIONS } from "../placeShapes";
import { generateSettlementNames } from "./names";
import type { SizeKey } from "./data";
import { breaksRouteWords, findRouteCulture, personNames, routeBlockSet, routeNorm, routePlace, routeSetting, type RouteEra } from "../routes/engine";
import { BUILT_IN_VOCAB, inCultureGroup, poolEntries, type Vocabulary } from "./vocab";
import type { SpaceScale } from "../space/scale";
import type { SettlementContext } from "./contextShared";
import { deityCultureOffered, deityTitle, isChristianCulture } from "../deities/engine";

export * from "./contextShared";

// ── Building the context (§3) ───────────────────────────────────────────────

export interface ContextOptions {
  culture: string;
  era: RouteEra;
  fantastic: boolean;
  region?: string;
  people: GroupPeople;
  tone?: GroupToneChoice;
  /** §3: a village skips the realm half the time. */
  village?: boolean;
  /** Urban brief §7: the kit's size, so the town and its neighbours are settlement names of that size (default a town). */
  size?: Exclude<SizeKey, "any" | "hamlet">;
  /** The settlement's place-name block lists (every module's): a town matching one is redrawn. */
  blocked?: (name: string) => boolean;
  vocab?: Vocabulary;
  realmSafeguards?: GroupSafeguards;
  /** Stellar brief §8: the scale the kit's position implies (future eras); realms read it as a space biome. */
  scale?: SpaceScale;
}

/** §7.2: the vessel culture for a route culture. */
export function vesselCultureFor(culture: string): string {
  return culture === "polynesian" ? "hawaiian" : culture;
}

/** §3: GN's tradition: realms' culture → tribal tradition map, polynesian and andean their own. */
export function groupTraditionFor(culture: string): string {
  if (culture === "polynesian" || culture === "andean") return culture;
  return REALM_DATA.tribal[culture] ?? "general";
}

/** §3: the realms era for a route era (the steam age reads as modern). */
export function realmEraFor(era: RouteEra): string {
  return (REALM_ERAS.find((e) => e.code === era) ?? REALM_ERAS.find((e) => e.code === "MO")!).key;
}

/** GN's genre for a route era: fantasy before the steam age, modern to the modern era, sci-fi after. */
export function groupGenreFor(era: RouteEra): "fantasy" | "modern" | "scifi" {
  const setting = routeSetting(era, false);
  return setting === "SF" ? "scifi" : setting === "MR" || setting === "MF" ? "modern" : "fantasy";
}

const isFuture = (era: RouteEra) => era === "NF" || era === "IS";
const CASTE = new Set(["indian", "west-african"]);

/** A module's block lists and banned words, for a drawn place name. */
function defaultBlocked(name: string): boolean {
  const n = routeNorm(name);
  return (
    routeBlockSet().has(n) ||
    GROUP_DATA.safeguards.block.some((b) => normForBlock(b) === normForBlock(name)) ||
    breaksRouteWords(name) ||
    hasBannedWord(name)
  );
}

const settlementPools = new Map<string, string[]>();

/**
 * Urban brief §7: 300 settlement names at seed 1789 for the culture's town source (British or a world
 * culture's first era), at the kit's size; cached by culture, size and region. Empty where the culture
 * has no town source or is a sensitive one, which keep the old path.
 */
export function settlementTownPool(culture: string, size: Exclude<SizeKey, "any" | "hamlet">, region?: string): string[] {
  const source = findRouteCulture(culture)?.sensitive ? undefined : townSource(culture);
  if (!source) return [];
  // British only, and only a place-shape region code; anything else is all of Britain.
  const code = source === "britain" && PLACE_SHAPE_REGIONS.some((r) => r.code === region) ? region : undefined;
  const key = `${source}|${size}|${code ?? ""}`;
  let found = settlementPools.get(key);
  if (!found) {
    // The size's fallback notices are not shown in the kit.
    found = generateSettlementNames({ setting: "native", culture: source, size, region: code, count: 300, seed: 1789 }).names.map((n) => n.text).filter((n) => !n.includes("["));
    settlementPools.set(key, found);
  }
  return found;
}

/** §3: two different words from a pool for the culture and era. */
function twoWords(vocab: Vocabulary, pool: string, o: ContextOptions, rng: () => number, extra: { w: string }[] = []): string[] {
  const items = poolEntries(vocab, pool, { culture: o.culture, era: o.era, fantastic: o.fantastic, region: o.region }).map(([e, w]): [string, number] => [e.w, w]);
  for (const e of extra) {
    const found = items.find(([w]) => w === e.w);
    if (found) found[1] *= 2;
    else items.push([e.w, 2]);
  }
  const out: string[] = [];
  for (let i = 0; i < 20 && out.length < 2; i++) {
    const w = pickWeighted(items.filter(([x]) => !out.includes(x)), rng);
    if (!w) break;
    out.push(w);
  }
  return out;
}

/** §3: the settlement context, drawn once in this order. */
export function buildContext(o: ContextOptions, rng: () => number): SettlementContext {
  const vocab = o.vocab ?? BUILT_IN_VOCAB;
  const setting = routeSetting(o.era, o.fantastic);
  const blocked = o.blocked ?? defaultBlocked;
  const taken: string[] = [];
  const pool = isFuture(o.era) ? [] : settlementTownPool(o.culture, o.size ?? "town", o.region);
  const holyWords = holyNamesIn(o.culture);
  // §3: a real name even in placeholder mode; in NF–IS, a station or colony name (GN §8.4 SF row).
  const place = (): string => {
    for (let i = 0; i < 200; i++) {
      // Urban brief §7: settlement names where the culture has them; otherwise route names' invented places.
      const t = isFuture(o.era)
        ? groupTown("SF", undefined, rng)
        : pool.length > 0
          ? ((n) => (holyWords && holyWords.test(n) ? undefined : n))(pool[Math.floor(rng() * pool.length)])
          : routePlace(o.culture, setting, rng);
      if (t && !t.includes("[") && !blocked(t) && !taken.some((x) => x.toLowerCase() === t.toLowerCase())) {
        taken.push(t);
        return t;
      }
    }
    // A culture with few places: number the last ones rather than fail.
    const t = `${taken[0] ?? "Newtown"} ${taken.length + 1}`;
    taken.push(t);
    return t;
  };
  const town = place();
  const neighbours = Array.from({ length: 6 }, place);

  // §3: a realm, official, territorial (any character in NF–IS); a village skips it half the time.
  let realm: string | null = null;
  if (!(o.village && rng() < 0.5)) {
    const r = generateRealmNames({
      culture: o.culture,
      era: realmEraFor(o.era),
      genre: groupGenreFor(o.era),
      fantastic: o.fantastic,
      character: isFuture(o.era) ? undefined : "territorial",
      // Stellar brief §8: a settlement on a planet is in a planetary system, a station in a star system.
      ...(isFuture(o.era) && o.scale === "Pl" ? { biome: "planetary-system" } : isFuture(o.era) && o.scale === "Sy" ? { biome: "star-system" } : {}),
      output: "official",
      people: "invented",
      tone: o.tone,
      count: 1,
      seed: Math.floor(rng() * 0xffffffff),
      safeguards: o.realmSafeguards,
    }).names[0];
    realm = r && !r.text.includes("[") ? r.text : null;
  }

  // §3: the founder: invented where the culture has people's names, else the placeholder.
  const people = personNames(o.culture);
  const founder = o.people === "invented" && people.length > 0 ? people[Math.floor(rng() * people.length)] : "[founder]";

  const holy = inCultureGroup("christian", o.culture, o.era) ? groupSaint(setting, rng) : null;
  const trades = CASTE.has(o.culture) ? null : twoWords(vocab, "streetTrades", o, rng);
  const goods = twoWords(vocab, "streetGoods", o, rng, vocab.pools.routeGoods?.cultureExtra?.[o.culture] ?? []);
  // Deities brief §10.4: one deity for the faith group and building (drawn last, so the rest stay put);
  // none for christian cultures in realistic worlds or for the sensitive cultures.
  const deity = deityCultureOffered(o.culture) && !(isChristianCulture(o.culture, o.era) && !o.fantastic) ? deityTitle({ culture: o.culture, era: o.era, fantastic: o.fantastic, tone: o.tone, rng, vocab }) ?? null : null;

  return {
    town,
    neighbours,
    realm,
    founder,
    holy,
    trades,
    goods,
    throughRoute: null,
    landmarks: [],
    monuments: [],
    setting,
    tradition: groupTraditionFor(o.culture),
    vesselCulture: vesselCultureFor(o.culture),
    deity,
  };
}

/** §3: whether a culture key is one of route names' cultures. */
export const isKitCulture = (key: string) => !!findRouteCulture(key);
