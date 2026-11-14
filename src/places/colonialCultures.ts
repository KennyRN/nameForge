// Place modules split brief §7: the colonial traditions that are cultures in the shared menu. They
// are offered only where a place module's where link is newly explored or settled (and only where
// the probe finds they differ), so they are not part of any module's own roster; the engines still
// resolve them by key, with no culture data of their own (the colonial source carries them).

import lens from "../data/lens.json";
import type { RouteCulture } from "../routes/engine";

interface MenuEntry {
  key?: string;
  label?: string | null;
  scope?: string;
}

/** german, italian, phoenician, belgian, hellenistic: the lens menu's colonial-scope entries, in menu order. */
export const COLONIAL_CULTURES: RouteCulture[] = (lens as unknown as { menu: { entries: MenuEntry[] }[] }).menu
  .flatMap((block) => block.entries)
  .filter((e) => e.scope === "colonial" && e.key)
  .map((e) => ({ key: e.key!, label: e.label ?? e.key!, group: "colonial" }));

export const findColonialCulture = (key: string | undefined): RouteCulture | undefined => COLONIAL_CULTURES.find((c) => c.key === key);
