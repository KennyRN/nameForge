import { App, Modal } from "obsidian";

export class NameWrightModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "NameWright" });
    contentEl.createEl("p", { text: "Your modal content here" });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}