import { App, Modal, normalizePath, Notice, TFolder } from "obsidian";
import { DEFAULT_NAMES_FOLDER, ensureVaultFolder } from "./paths";

/** Hand-enter a vault-relative folder path for name packs. */
export class EnterFolderPathModal extends Modal {
  private currentPath: string;
  private onSubmit: (folder: TFolder) => void;
  private inputEl: HTMLInputElement | null = null;

  constructor(app: App, currentPath: string, onSubmit: (folder: TFolder) => void) {
    super(app);
    this.currentPath = currentPath;
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("nameforge-enter-folder-modal");

    contentEl.createEl("p", {
      text: "Enter a vault-relative folder path. Packs will be read from and saved to this folder.",
    });

    const row = contentEl.createDiv({ cls: "nameforge-modal__pack-name-row" });
    row.createEl("label", { text: "Folder" });
    this.inputEl = row.createEl("input", {
      cls: "nameforge-modal__pack-name-input",
      attr: {
        type: "text",
        placeholder: DEFAULT_NAMES_FOLDER,
        value: this.currentPath || DEFAULT_NAMES_FOLDER,
      },
    });
    this.inputEl.focus();
    this.inputEl.select();
    this.inputEl.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter") {
        evt.preventDefault();
        void this.submit();
      }
    });

    const controls = contentEl.createDiv({ cls: "nameforge-modal__controls" });
    const saveButton = controls.createEl("button", { text: "Use folder", cls: "mod-cta" });
    saveButton.addEventListener("click", () => {
      void this.submit();
    });

    const cancelButton = controls.createEl("button", { text: "Cancel" });
    cancelButton.addEventListener("click", () => this.close());
  }

  private async submit() {
    const rawValue = this.inputEl?.value?.trim() || "";
    const cleaned = rawValue.replace(/^\/+|\/+$/g, "");
    const targetPath = normalizePath(cleaned || DEFAULT_NAMES_FOLDER);

    try {
      const folder = await ensureVaultFolder(this.app, targetPath);
      this.onSubmit(folder);
      this.close();
    } catch {
      new Notice(`nameForge: could not use folder ${targetPath}`);
    }
  }
}
