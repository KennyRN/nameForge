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
