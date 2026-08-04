/**
 * Minimal storyForge host API surface for Forge companion panels (version >= 3).
 *
 * Local types only — no compile-time dependency on the storyForge package.
 * Runtime access: `app.plugins.getPlugin("storyforge")?.api`.
 */

import type { App } from "obsidian";

export interface StoryForgeCompanionPanelOpt {
  id: string;
  orderHint?: number;
  icon: string;
  label: string;
  renderPanel: (containerEl: HTMLElement) => () => void;
}

export interface StoryForgeHostApi {
  version: number;
  registerCompanionPanel?: (opt: StoryForgeCompanionPanelOpt) => () => void;
}

/**
 * Returns the storyForge host API when loaded at version >= 3 with
 * `registerCompanionPanel`; otherwise null (soft no-op for callers).
 */
export function getStoryForgeHostApi(app: App): StoryForgeHostApi | null {
  const anyApp = app as unknown as {
    plugins: { getPlugin(id: string): { api?: StoryForgeHostApi } | null | undefined };
  };
  const sf = anyApp.plugins.getPlugin("storyforge");
  if (
    !sf?.api ||
    sf.api.version < 3 ||
    typeof sf.api.registerCompanionPanel !== "function"
  ) {
    return null;
  }
  return sf.api;
}
