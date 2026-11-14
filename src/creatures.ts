// Shared tables brief §8: mythic creatures per culture. Obsidian-free; reads its own JSON.
import data from "./data/creatures.json";

export type Habitat = "mountain" | "forest" | "water" | "sea" | "moor" | "desert" | "sky" | "underground" | "home";
export interface Creature {
  name: string;
  habitats: Habitat[];
  tones: string[];
}
const CULTURES = data.cultures as unknown as Record<string, Creature[]>;
/** A culture's creatures, optionally only those that live in a habitat. */
export function creaturesFor(culture: string, habitat?: Habitat): Creature[] {
  return (CULTURES[culture] ?? CULTURES.general).filter((c) => !habitat || c.habitats.includes(habitat));
}
export const CREATURE_CULTURES: readonly string[] = Object.keys(CULTURES);

const title = (s: string) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
/** Adds a culture's creatures (the General list by default) to a module's pool of creature words, with their tones (words already there are left as they are). */
export function mergeCreatures<T extends { w: string }>(pool: T[], culture = "general"): void {
  const have = new Set(pool.map((e) => e.w.toLowerCase()));
  for (const c of creaturesFor(culture)) if (!have.has(title(c.name).toLowerCase())) pool.push({ w: title(c.name), t: c.tones } as unknown as T);
}
