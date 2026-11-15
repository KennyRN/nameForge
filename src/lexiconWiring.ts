// Shared tables brief §7 and §13.1: every module list that is one of the shared lexicon's kinds reads the shared
// list plus its own extras (the words already in it). Imported, for its effect, before any of these JSON files is
// used, so the merge has always happened by the time an engine reads a list. Closed sets stay closed: the compass
// and the other direction lists, the weekday ordinals, calendar names, the deities' sacred numbers, the sci-fi
// metals and spirit metals, the settlement size codes, the temperance virtues of inns and the faction, business and
// trade-activity words of group names are the modules' own.
import groupData from "./data/group-names.json";
import bynamesData from "./data/bynames.json";
import moneyData from "./data/money-names.json";
import tribalData from "./data/tribal-names.json";
import airLandData from "./data/vehicles-air-land.json";
import vesselData from "./data/vessels.json";
import { mergeLexicon, type LexiconKind } from "./lexicon";

type Pool = { w: string }[] | string[];

/** Which module list reads which shared kinds. */
export const LEXICON_WIRING: { file: string; list: string; kinds: LexiconKind[]; single?: boolean }[] = [
  { file: "group-names.json", list: "lists.colour", kinds: ["colours"] },
  { file: "group-names.json", list: "lists.colourRich", kinds: ["colours", "gems"] },
  { file: "group-names.json", list: "lists.resGoodsMetal", kinds: ["metals"] },
  { file: "group-names.json", list: "lists.number", kinds: ["numbers"] },
  { file: "group-names.json", list: "lists.ordinalWord", kinds: ["ordinals"] },
  { file: "group-names.json", list: "lists.weather", kinds: ["weather"] },
  { file: "group-names.json", list: "lists.season", kinds: ["seasons"] },
  { file: "group-names.json", list: "lists.tradesmen", kinds: ["trades"] },
  { file: "group-names.json", list: "lists.unionTrade", kinds: ["trades"] },
  { file: "bynames.json", list: "lists.colourNick", kinds: ["colours"] },
  { file: "money-names.json", list: "lists.colourShort", kinds: ["colours"] },
  { file: "tribal-names.json", list: "vocabulary.colours", kinds: ["colours"] },
  { file: "tribal-names.json", list: "vocabulary.numbers", kinds: ["numbers"] },
  { file: "vehicles-air-land.json", list: "lists.metal", kinds: ["metals"] },
  { file: "vehicles-air-land.json", list: "lists.weatherWord", kinds: ["weather"], single: true },
  { file: "vessels.json", list: "lists.virtue", kinds: ["virtues"] },
  { file: "vessels.json", list: "lists.virtueAdj", kinds: ["virtues"] },
  { file: "vessels.json", list: "lists.season", kinds: ["seasons"] },
];

const FILES: Record<string, unknown> = {
  "group-names.json": groupData,
  "bynames.json": bynamesData,
  "money-names.json": moneyData,
  "tribal-names.json": tribalData,
  "vehicles-air-land.json": airLandData,
  "vessels.json": vesselData,
};

for (const { file, list, kinds, single } of LEXICON_WIRING) {
  const pool = list.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], FILES[file]) as Pool | undefined;
  if (!Array.isArray(pool)) throw new Error(`Lexicon wiring: no list “${list}” in ${file}.`);
  for (const kind of kinds) mergeLexicon(pool as { w: string }[], kind, { single });
}
