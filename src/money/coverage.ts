// Coverage adapter for money and coins (shared lens brief §6.1).
import "../lexiconWiring";
import moneyData from "../data/money-names.json";
import vocabData from "../data/settlement-vocab.json";
import { type CoverageAdapter, type CoverageRow, at, listRows, profileKeys, vocabularyRows } from "../coverageRows";
import { north5cRows } from "../north5cCoverage";
import { NORTH_5C_CULTURES } from "../north5c";

const MODULE = "moneyNames";
const KINDS = (moneyData.kinds as { key: string }[]).map((k) => k.key);

function rows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  out.push(...listRows(at(moneyData, "shapes"), { module: MODULE, source: "shapes" }));
  out.push(...vocabularyRows(MODULE));
  out.push(...north5cRows(MODULE));
  return out;
}

export const moneyCoverage: CoverageAdapter = {
  module: MODULE,
  kinds: KINDS,
  // Money offers the shared roster less `notOffered`, and adds the money-only cultures.
  roster: [...(vocabData.cultures as string[]).filter((c) => !(moneyData.notOffered as string[]).includes(c)), ...NORTH_5C_CULTURES.map((c) => c.key)],
  // §6.3: `notOffered` in money-names.json.
  excluded: [{ cultures: moneyData.notOffered as string[] }],
  // `cultureMult` weights the coin, early and goods forms per culture (§11.2).
  profiles: () => profileKeys(moneyData.cultureMult),
  rows,
};
