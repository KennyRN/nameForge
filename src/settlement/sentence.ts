// The settlement names sentence as plain data (urban brief §3), so it can be tested and reused by
// presets. The clauses after the colon are the source module's own (colonialSentence.ts).

import type { Biome } from "../biomes";
import { wizardSentenceText } from "../colonialSentence";
import { SETTLEMENT_SIZES, type SizeKey, sizeLabel } from "./data";
import type { SettlementSetting } from "./names";

export const SETTLEMENT_SETTINGS: { id: SettlementSetting; label: string }[] = [
  { id: "native", label: "native" },
  { id: "new-lands", label: "in new lands" },
  { id: "settled-lands", label: "in settled lands" },
];

export const settingLabel = (setting: SettlementSetting): string => SETTLEMENT_SETTINGS.find((s) => s.id === setting)!.label;

/** The size link: capitalised as the sentence's first word. */
export const sizeChoices = (): { id: SizeKey; label: string }[] =>
  SETTLEMENT_SIZES.map((s) => ({ id: s.key, label: s.label.charAt(0).toUpperCase() + s.label.slice(1) }));

export interface SettlementSentenceSettings {
  size: SizeKey;
  setting: SettlementSetting;
  region?: string;
  tradition?: string;
  context?: string;
  biome?: string;
  terrain?: string;
  aliens?: boolean;
}

/**
 * "Village names, in new lands: General explorers in wild and unsettled lands across any part of unknown country".
 * British native: "Settlement names, native: British from all of Britain, set in any part of Britain".
 */
export function settlementSentenceText(settings: SettlementSentenceSettings, custom: readonly Biome[] = []): string {
  const first = sizeLabel(settings.size);
  const lead = `${first.charAt(0).toUpperCase()}${first.slice(1)} names, ${settingLabel(settings.setting)}: `;
  if (settings.setting === "native") return lead + wizardSentenceText("organic", settings, custom).replace(/^[^,]*? from /, "British from ");
  const part = settings.setting === "new-lands" ? "new-land" : "established";
  return lead + wizardSentenceText(part, settings, custom).replace(/, naming .*$/, "");
}
