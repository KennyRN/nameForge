// Installs the starter templates (names-reference §12) — only when the user runs the command, and
// never over an existing file.

import { App, normalizePath, Notice, stringifyYaml, TFolder } from "obsidian";
import { EnterFolderPathModal } from "./folderModal";
import { createWordListFileContent, sanitizePackNameForFilename } from "./nameParser";
import { recipeToFrontmatter } from "./names/recipe";
import { STARTER_RECIPES, STARTER_WORD_LISTS, starterWordListBody } from "./names/starterTemplates";

export function promptInstallStarterTemplates(app: App, defaultFolder: string): void {
  new EnterFolderPathModal(
    app,
    defaultFolder,
    (folder) => void installStarterTemplates(app, folder),
    "Choose a folder for the starter templates. Templates in your names folder are offered when creating packs; existing files are never replaced.",
  ).open();
}

export async function installStarterTemplates(app: App, folder: TFolder): Promise<void> {
  const files: { name: string; content: string }[] = [
    ...STARTER_RECIPES.map((t) => ({
      name: t.name,
      content: `---\n${stringifyYaml(recipeToFrontmatter({ ...t.recipe, template: true }))}---\n\n${t.description}\n`,
    })),
    ...STARTER_WORD_LISTS.map((t) => ({
      name: t.name,
      content: createWordListFileContent(t.name, starterWordListBody(t), undefined, true),
    })),
  ];
  let installed = 0;
  const skipped: string[] = [];
  for (const file of files) {
    const path = normalizePath(`${folder.path}/${sanitizePackNameForFilename(file.name)}.md`);
    if (app.vault.getAbstractFileByPath(path)) {
      skipped.push(file.name);
      continue;
    }
    try {
      await app.vault.create(path, file.content);
      installed++;
    } catch {
      skipped.push(file.name);
    }
  }
  const note = skipped.length > 0 ? ` Skipped ${skipped.length} that already exist: ${skipped.join(", ")}.` : "";
  new Notice(`nameForge: installed ${installed} starter templates in ${folder.path || "the vault root"}.${note}`);
}
