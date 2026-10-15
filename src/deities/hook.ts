// Deities brief §10: the deity helpers the earlier engines read for their back-links. The deities
// engine imports bynames, groups and routes, so those engines can't import it back without an import
// cycle; instead it registers these helpers when it loads (the modal and the kit always load it), and
// an engine without them leaves its deity shapes out. No imports.

import type { GroupSafeguards, GroupSetting, GroupToneChoice } from "../groups/engine";
import type { RouteEra } from "../routes/engine";
import type { Vocabulary } from "../settlement/vocab";

export interface DeityLookup {
  culture?: string;
  era?: RouteEra;
  fantastic?: boolean;
  tone?: GroupToneChoice;
  rng: () => number;
  safeguards?: GroupSafeguards;
  vocab?: Vocabulary;
}

export interface DeityHooks {
  deityTitle(o: DeityLookup): string | undefined;
  sacredPlace(o: DeityLookup): string | undefined;
  deityTitleForTradition(tradition: string, setting: GroupSetting, rng: () => number, tone?: GroupToneChoice): string | undefined;
  cultureOffered(culture: string): boolean;
  isChristianCulture(culture: string, era: RouteEra): boolean;
  sensitiveTraditions: string[];
  christianTraditions: string[];
}

let hooks: DeityHooks | undefined;

export function setDeityHooks(h: DeityHooks): void {
  hooks = h;
}

export const deityHooks = (): DeityHooks | undefined => hooks;
