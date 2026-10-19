// A small helper for the wild lands tests: the data's block lists are non-empty for every module.
import type { WILDS_DATA } from "../../src/wilds/engine";

export const defaultWildsBlock = (data: typeof WILDS_DATA): boolean =>
  (["mountainNames", "forestNames", "desertNames", "moorNames", "wetlandNames", "grasslandNames"] as const).every((m) => data.safeguards[m].length > 0) && data.safeguards.bannedWords.includes("Squaw");
