// Save as preset (Presets brief §8.2): a small dialogue for the preset's name and description,
// and the "Replace preset?" question (§8.3).

import { App, Modal, setIcon } from "obsidian";
import { ICON_CANCEL, ICON_SAVE } from "./icons";

export class PresetSaveModal extends Modal {
  constructor(
    app: App,
    private readonly name: string,
    private readonly description: string,
    /** Writes the preset; true closes the dialogue. */
    private readonly onSave: (name: string, description: string) => Promise<boolean>,
  ) {
    super(app);
  }

  onOpen() {
    this.titleEl.setText("Save as preset");
    this.contentEl.addClass("nameforge-editor-modal", "nameforge-preset-modal");
    const nameRow = this.contentEl.createDiv({ cls: "nameforge-modal__pack-name-row" });
    nameRow.createEl("label", { text: "Name" });
    const name = nameRow.createEl("input", { cls: "nameforge-modal__pack-name-input", attr: { type: "text" } });
    name.value = this.name;
    const description = this.contentEl.createEl("textarea", { cls: "nameforge-modal__textarea nameforge-preset-modal__description", attr: { rows: "4" } });
    description.value = this.description;
    const controls = this.contentEl.createDiv({ cls: "nameforge-modal__controls" });
    const save = controls.createEl("button", { cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg", attr: { type: "button", title: "Save preset" } });
    setIcon(save, ICON_SAVE);
    save.addEventListener("click", () => {
      void this.onSave(name.value.trim(), description.value.trim()).then((done) => {
        if (done) this.close();
      });
    });
    const cancel = controls.createEl("button", { cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg", attr: { type: "button", title: "Cancel" } });
    setIcon(cancel, ICON_CANCEL);
    cancel.addEventListener("click", () => this.close());
    name.focus();
  }

  onClose() {
    this.contentEl.empty();
  }
}

/** A yes-or-no question; resolves true on Replace. */
export function confirmReplace(app: App, question: string): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = new (class extends Modal {
      private answered = false;
      onOpen() {
        this.contentEl.createEl("p", { text: question });
        const row = this.contentEl.createDiv({ cls: "modal-button-container" });
        const yes = row.createEl("button", { cls: "mod-warning", text: "Replace" });
        yes.addEventListener("click", () => {
          this.answered = true;
          resolve(true);
          this.close();
        });
        const no = row.createEl("button", { text: "Cancel" });
        no.addEventListener("click", () => this.close());
      }
      onClose() {
        if (!this.answered) resolve(false);
        this.contentEl.empty();
      }
    })(app);
    modal.open();
  });
}
