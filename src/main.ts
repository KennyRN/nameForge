import { normalizePath, Notice, Plugin, TFile } from "obsidian";
import { NameForgeSettingTab } from "./settings";
import { AgeingHistoryEntry, GenerationHistoryEntry, MAX_HISTORY_ENTRIES, NameForgeModal, NameForgeSettings } from "./modal";
import { ICON_MEEPLE, registerNameForgeIcons } from "./icons";
import { ensureDefaultNamesFolder, legacySettingsFileCandidates, normalizeSettingsFolder } from "./migration";
import { DEFAULT_NAMES_FOLDER, ensureVaultFolder, resolveNamesFolderPath } from "./paths";
import { softConnectWithRetry } from "./hostConnectRetry";
import { getStoryForgeHostApi } from "./storyforgeBridge";
import { promptInstallStarterTemplates } from "./starterInstall";
import { SAFEGUARD_TEMPLATE } from "./tribes/safeguardPacks";
import { BYNAME_SAFEGUARD_TEMPLATE } from "./bynames/safeguardPacks";
import { VESSEL_SAFEGUARD_TEMPLATE } from "./vessels/safeguardPacks";
import { REALM_SAFEGUARD_TEMPLATE } from "./realms/safeguardPacks";
import { GROUP_SAFEGUARD_TEMPLATE } from "./groups/safeguardPacks";

const DEFAULT_SETTINGS: NameForgeSettings = {
  namesFilePath: "",
  packName: "",
  folderPath: DEFAULT_NAMES_FOLDER,
  faithfulness: 2,
  strictness: 3,
};

function getSettingsFilePath(settings: NameForgeSettings): string {
  const folderPath = resolveNamesFolderPath(settings.folderPath, settings.namesFilePath);
  return folderPath ? normalizePath(`${folderPath}/nameForgeConfiguration.md`) : "";
}

/**
 * The history line format is `- {timestamp} | {seed} | {packName} ({count})` —
 * the timestamp and seed are fixed-format tokens matched before the free-text
 * packName, so a pack name containing "|" still parses correctly (it's
 * always "everything after the second pipe"). The trailing "(count)" is
 * optional so lines written before this field existed still parse.
 */
const HISTORY_LINE_PATTERN = /^-\s*(\d{8}-\d{6})\s*\|\s*(-?\d+)\s*\|\s*(.*)$/;
const HISTORY_COUNT_SUFFIX_PATTERN = /^(.*)\s\((\d+)\)$/;

/** The lines of one `## Heading` section, up to the next `## ` heading or the end. */
function sectionLines(body: string, heading: string): string[] | null {
  const headingIndex = body.indexOf(heading);
  if (headingIndex === -1) {
    return null;
  }
  const rest = body.slice(headingIndex + heading.length);
  const next = rest.search(/\n## /);
  return (next === -1 ? rest : rest.slice(0, next)).split(/\r?\n/);
}

function parseGenerationHistory(body: string): GenerationHistoryEntry[] {
  const lines = sectionLines(body, "## Generation History");
  if (!lines) {
    return [];
  }

  const entries: GenerationHistoryEntry[] = [];
  for (const line of lines) {
    const match = line.match(HISTORY_LINE_PATTERN);
    if (!match) {
      continue;
    }
    const [, timestamp, seedText, rest] = match;
    const seed = Number(seedText);
    if (!Number.isFinite(seed)) {
      continue;
    }
    const countMatch = rest.match(HISTORY_COUNT_SUFFIX_PATTERN);
    const packName = (countMatch ? countMatch[1] : rest).trim();
    const count = countMatch ? Number(countMatch[2]) : undefined;
    entries.push({ timestamp, seed, packName, count });
  }

  return entries;
}

/** Ageing history lines share the generation history's `- {timestamp} | {seed} | {label}` shape. */
function parseAgeingHistory(body: string): AgeingHistoryEntry[] {
  const lines = sectionLines(body, "## Ageing History");
  if (!lines) {
    return [];
  }
  const entries: AgeingHistoryEntry[] = [];
  for (const line of lines) {
    const match = line.match(HISTORY_LINE_PATTERN);
    if (!match) {
      continue;
    }
    const seed = Number(match[2]);
    if (Number.isFinite(seed)) {
      entries.push({ timestamp: match[1], seed, label: match[3].trim() });
    }
  }
  return entries;
}

function createAgeingHistorySection(history?: AgeingHistoryEntry[]): string {
  if (!history || history.length === 0) {
    return "";
  }
  const lines = history.slice(0, MAX_HISTORY_ENTRIES).map((entry) => `- ${entry.timestamp} | ${entry.seed} | ${entry.label}`);
  return `\n## Ageing History\n\n${lines.join("\n")}\n`;
}

function createGenerationHistorySection(history?: GenerationHistoryEntry[]): string {
  if (!history || history.length === 0) {
    return "";
  }

  const lines = history
    .slice(0, MAX_HISTORY_ENTRIES)
    .map((entry) => `- ${entry.timestamp} | ${entry.seed} | ${entry.packName}${entry.count !== undefined ? ` (${entry.count})` : ""}`);
  return `\n## Generation History\n\n${lines.join("\n")}\n`;
}

function parseSettingsMarkdownContent(content: string): Partial<NameForgeSettings> {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  if (!frontmatterMatch) {
    return {};
  }

  const parsed: Partial<NameForgeSettings> = {};
  for (const line of frontmatterMatch[1].split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, value] = match;
    const trimmedValue = value.trim().replace(/^['"]|['"]$/g, "");

    if (key === "folder") {
      parsed.folderPath = trimmedValue;
    } else if (key === "namesFilePath") {
      parsed.namesFilePath = trimmedValue;
    } else if (key === "packName") {
      parsed.packName = trimmedValue;
    } else if (key === "faithfulness") {
      const numeric = Number(trimmedValue);
      if (!Number.isNaN(numeric)) {
        parsed.faithfulness = numeric;
      }
    } else if (key === "strictness") {
      const numeric = Number(trimmedValue);
      if (!Number.isNaN(numeric)) {
        parsed.strictness = numeric;
      }
    }
  }

  const body = content.slice(frontmatterMatch[0].length);
  const history = parseGenerationHistory(body);
  if (history.length > 0) {
    parsed.previousGenerations = history;
  }
  const ageing = parseAgeingHistory(body);
  if (ageing.length > 0) {
    parsed.ageingHistory = ageing;
  }

  return parsed;
}

function createSettingsMarkdownContent(settings: NameForgeSettings): string {
  const folderPath = resolveNamesFolderPath(settings.folderPath, settings.namesFilePath);
  const lines = [`folder: ${folderPath || DEFAULT_NAMES_FOLDER}`, `namesFilePath: ${settings.namesFilePath || ""}`];

  const trimmedPackName = (settings.packName || "").trim().replace(/\s+/g, " ");
  if (trimmedPackName) {
    lines.push(`packName: ${trimmedPackName}`);
  }

  lines.push(`faithfulness: ${settings.faithfulness ?? DEFAULT_SETTINGS.faithfulness}`);
  lines.push(`strictness: ${settings.strictness ?? DEFAULT_SETTINGS.strictness}`);

  const frontmatter = `---\ntype: configurationFile\n${lines.join("\n")}\n---\n`;
  return (
    frontmatter +
    createGenerationHistorySection(settings.previousGenerations) +
    createAgeingHistorySection(settings.ageingHistory)
  );
}

export default class NameForgePlugin extends Plugin {
  settings: NameForgeSettings = {};
  private unregisterCompanionPanel: (() => void) | null = null;
  /** Identity of the storyForge `api` object we last registered with (detects host hot-reload). */
  private storyForgeApiRef: object | null = null;

  async onload() {
    registerNameForgeIcons();
    this.addRibbonIcon(ICON_MEEPLE, "nameForge", () => {
      this.openNameGenerator();
    });

    this.addCommand({
      id: "open-name-generator",
      name: "Open name generator",
      callback: () => {
        this.openNameGenerator();
      },
    });

    // Land brief §10: a tribal safeguard list to edit, never written over an existing one.
    this.addCommand({
      id: "create-tribal-safeguard-list",
      name: "Create tribal safeguard list",
      callback: async () => {
        const folder = resolveNamesFolderPath(this.settings.folderPath, this.settings.namesFilePath) || DEFAULT_NAMES_FOLDER;
        await ensureVaultFolder(this.app, folder);
        const path = normalizePath(`${folder}/Tribal safeguards.md`);
        if (this.app.vault.getFileByPath(path)) {
          new Notice("nameForge: “Tribal safeguards” already exists.");
          return;
        }
        await this.app.vault.create(path, SAFEGUARD_TEMPLATE);
        new Notice("nameForge: “Tribal safeguards” created.");
      },
    });

    // Group brief §12.6: a group safeguard list to edit, never written over an existing one.
    this.addCommand({
      id: "create-group-safeguard-list",
      name: "Create group safeguard list",
      callback: async () => {
        const folder = resolveNamesFolderPath(this.settings.folderPath, this.settings.namesFilePath) || DEFAULT_NAMES_FOLDER;
        await ensureVaultFolder(this.app, folder);
        const path = normalizePath(`${folder}/Group safeguards.md`);
        if (this.app.vault.getFileByPath(path)) {
          new Notice("nameForge: “Group safeguards” already exists.");
          return;
        }
        await this.app.vault.create(path, GROUP_SAFEGUARD_TEMPLATE);
        new Notice("nameForge: “Group safeguards” created.");
      },
    });

    // Bynames brief §11.7: a byname safeguard list to edit, never written over an existing one.
    this.addCommand({
      id: "create-byname-safeguard-list",
      name: "Create byname safeguard list",
      callback: async () => {
        const folder = resolveNamesFolderPath(this.settings.folderPath, this.settings.namesFilePath) || DEFAULT_NAMES_FOLDER;
        await ensureVaultFolder(this.app, folder);
        const path = normalizePath(`${folder}/Byname safeguards.md`);
        if (this.app.vault.getFileByPath(path)) {
          new Notice("nameForge: “Byname safeguards” already exists.");
          return;
        }
        await this.app.vault.create(path, BYNAME_SAFEGUARD_TEMPLATE);
        new Notice("nameForge: “Byname safeguards” created.");
      },
    });

    // Realms brief §12.4: a realm safeguard list to edit, never written over an existing one.
    this.addCommand({
      id: "create-realm-safeguard-list",
      name: "Create realm safeguard list",
      callback: async () => {
        const folder = resolveNamesFolderPath(this.settings.folderPath, this.settings.namesFilePath) || DEFAULT_NAMES_FOLDER;
        await ensureVaultFolder(this.app, folder);
        const path = normalizePath(`${folder}/Realm safeguards.md`);
        if (this.app.vault.getFileByPath(path)) {
          new Notice("nameForge: “Realm safeguards” already exists.");
          return;
        }
        await this.app.vault.create(path, REALM_SAFEGUARD_TEMPLATE);
        new Notice("nameForge: “Realm safeguards” created.");
      },
    });

    // Ships brief §14.5: a vessel safeguard list to edit, never written over an existing one.
    this.addCommand({
      id: "create-vessel-safeguard-list",
      name: "Create vessel safeguard list",
      callback: async () => {
        const folder = resolveNamesFolderPath(this.settings.folderPath, this.settings.namesFilePath) || DEFAULT_NAMES_FOLDER;
        await ensureVaultFolder(this.app, folder);
        const path = normalizePath(`${folder}/Vessel safeguards.md`);
        if (this.app.vault.getFileByPath(path)) {
          new Notice("nameForge: “Vessel safeguards” already exists.");
          return;
        }
        await this.app.vault.create(path, VESSEL_SAFEGUARD_TEMPLATE);
        new Notice("nameForge: “Vessel safeguards” created.");
      },
    });

    this.addCommand({
      id: "install-starter-templates",
      name: "Install starter templates",
      callback: () => {
        promptInstallStarterTemplates(
          this.app,
          resolveNamesFolderPath(this.settings.folderPath, this.settings.namesFilePath) || DEFAULT_NAMES_FOLDER,
        );
      },
    });

    try {
      await this.loadSettings();
    } catch (error) {
      console.error("nameForge: failed to load settings", error);
    }

    this.addSettingTab(new NameForgeSettingTab(this.app, this));
    this.connectToStoryForge();
  }

  onunload() {
    try {
      this.unregisterCompanionPanel?.();
    } catch {
      /* host may already be gone */
    }
    this.unregisterCompanionPanel = null;
    this.storyForgeApiRef = null;
  }

  openNameGenerator(): void {
    new NameForgeModal(this.app, this, this.settings).open();
  }

  /**
   * Soft-connect: register the nameForge companion panel on storyForge Forge
   * when host API version >= 3 is available. Rebinds when the host hot-reloads
   * (new `api` object identity).
   */
  private connectToStoryForge(): void {
    const tryConnect = (): boolean => {
      const api = getStoryForgeHostApi(this.app);
      if (!api?.registerCompanionPanel) {
        this.unregisterCompanionPanel = null;
        this.storyForgeApiRef = null;
        return false;
      }

      if (this.unregisterCompanionPanel && this.storyForgeApiRef === api) {
        return true;
      }

      try {
        this.unregisterCompanionPanel?.();
      } catch {
        /* old host may already be dead */
      }

      registerNameForgeIcons();
      this.unregisterCompanionPanel = api.registerCompanionPanel({
        id: "nameforge",
        orderHint: 100,
        icon: ICON_MEEPLE,
        label: "nameForge",
        renderPanel: (containerEl) => NameForgeModal.mountPanel(containerEl, this.app, this),
      });
      this.storyForgeApiRef = api;
      return true;
    };

    softConnectWithRetry(tryConnect, {
      registerInterval: (id) => this.registerInterval(id),
      onLayoutChange: (cb) => {
        this.registerEvent(this.app.workspace.on("layout-change", cb));
      },
    });
  }

  async loadSettings() {
    const legacySettings = (await this.loadData()) as Partial<NameForgeSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...legacySettings };
    this.settings = normalizeSettingsFolder(this.settings);

    const candidates = legacySettingsFileCandidates(this.settings);
    const seen = new Set<string>();
    for (const settingsFilePath of candidates) {
      if (seen.has(settingsFilePath)) {
        continue;
      }
      seen.add(settingsFilePath);

      const settingsFile = this.app.vault.getFileByPath(normalizePath(settingsFilePath));
      if (!(settingsFile instanceof TFile)) {
        continue;
      }

      let content: string;
      try {
        content = await this.app.vault.cachedRead(settingsFile);
      } catch {
        continue;
      }

      const parsed = parseSettingsMarkdownContent(content);
      this.settings = normalizeSettingsFolder({
        ...this.settings,
        ...parsed,
        namesFilePath: parsed.namesFilePath || this.settings.namesFilePath,
        folderPath: parsed.folderPath || this.settings.folderPath,
      });
      break;
    }

    this.settings = await ensureDefaultNamesFolder(this.app, this.settings);
  }

  async saveSettings() {
    this.settings = normalizeSettingsFolder(this.settings);
    const settingsFilePath = getSettingsFilePath(this.settings);
    if (!settingsFilePath) {
      await this.saveData(this.settings);
      return;
    }

    const normalizedPath = normalizePath(settingsFilePath);
    const content = createSettingsMarkdownContent(this.settings);
    const existingFile = this.app.vault.getFileByPath(normalizedPath);
    if (existingFile instanceof TFile) {
      await this.app.vault.modify(existingFile, content);
    } else {
      const folderPath = resolveNamesFolderPath(this.settings.folderPath, this.settings.namesFilePath);
      if (folderPath) {
        await ensureVaultFolder(this.app, folderPath);
      }
      await this.app.vault.create(normalizedPath, content);
    }
  }
}
