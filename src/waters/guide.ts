// The hyperspace charts guide (Seas and coasts brief §12.1), opened from the information icon.
// The text is markdown, drawn with Obsidian's own renderer, as the word list guide is.

import { App, Component, MarkdownRenderer, Modal } from "obsidian";
import { HYPERSPACE_GUIDE } from "./guideText";

export class HyperspaceGuideModal extends Modal {
  private readonly component = new Component();

  constructor(app: App) {
    super(app);
  }

  onOpen() {
    this.titleEl.setText("Hyperspace charts");
    this.modalEl.addClass("nameforge-guide-modal", "nameforge-word-list-guide");
    this.component.load();
    void MarkdownRenderer.render(this.app, HYPERSPACE_GUIDE, this.contentEl.createDiv({ cls: "markdown-rendered" }), "", this.component);
  }

  onClose() {
    this.component.unload();
    this.contentEl.empty();
  }
}
