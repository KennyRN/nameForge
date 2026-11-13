// The culture rosters the modules offer today, by the roster name `lens.json` gives each module under
// `modules.<key>.sentence.roster`. Each sentence file registers the roster it already imports from its
// own engine, so the lens clause offers exactly the cultures a module has now, holds no culture list of
// its own, and importing a sentence file loads no engine it didn't load before (engines register
// helpers into one another when they load, which can change another engine's output).
// No Obsidian imports.

export interface RosterCulture {
  key: string;
  label: string;
}

const ROSTERS: Record<string, readonly RosterCulture[]> = {};

/** A module's sentence file registers its culture roster under the name `lens.json` gives it. */
export function registerRoster(roster: string, cultures: readonly RosterCulture[]): void {
  ROSTERS[roster] = cultures;
}

/** The cultures a roster offers, in the module's own order, with its own labels. */
export function rosterCultures(roster: string): readonly RosterCulture[] {
  const found = ROSTERS[roster];
  if (!found) throw new Error(`lens: no culture roster called “${roster}” (its sentence file registers it)`);
  return found;
}

export const rosterNames = (): string[] => Object.keys(ROSTERS);
