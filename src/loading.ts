// Loading dots (loading brief §B2): plain HTML spans animated by CSS opacity alone, so they keep
// moving while the engines block the main thread. No SVG, no SMIL and no IDs, so two open copies
// of nameForge (the storyForge sidebar and the modal) can't interfere with each other.

/** Replaces the container's contents with the loading dots and, when given, a short label. */
export function renderLoading(container: HTMLElement | null, text?: string) {
  if (!container) return;
  container.empty();
  const loading = container.createDiv({
    cls: "nameforge-modal__loading",
    attr: text ? { role: "status" } : { role: "status", "aria-label": "Working" },
  });
  const dots = loading.createSpan({ cls: "nameforge-modal__loading-dots" });
  for (let i = 0; i < 3; i++) dots.createSpan({ cls: "nameforge-modal__loading-dot" });
  if (text) loading.createSpan({ cls: "nameforge-modal__loading-text", text });
}

/** Resolves once the page has painted, so the dots are on screen before work starts. */
export function waitForPaint(): Promise<void> {
  return new Promise((resolve) => window.requestAnimationFrame(() => window.setTimeout(resolve, 0)));
}

/** Resolves on the next task, for yielding between steps of a long run. */
export function waitForTask(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}
