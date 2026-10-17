import assert from "node:assert/strict";
import { test } from "node:test";
import { App, TFile, TFolder } from "obsidian";
import { cleanFolderInput, commitFolderChoice, DEFAULT_NAMES_FOLDER, resolveNamesFolderPath } from "../src/paths";
import {
  findLegacyPackFolder,
  folderSettingsData,
  legacySettingsFileCandidates,
  mergeFolderSettings,
  migratePacksToConfiguredFolder,
} from "../src/migration";

const CYRILLIC = "0. Ширма мастера/Генераторы/Имена";
const PACK = "---\ntype: namePack\npackName: Test\n---\n\n- Anna\n- Boris\n- Clara\n";

/** A tiny in-memory vault that records every creation. */
function fakeApp(folders: string[], files: Record<string, string> = {}) {
  const calls: string[] = [];
  const folderMap = new Map<string, TFolder>();
  const fileMap = new Map<string, TFile>();
  const ensure = (path: string) => {
    let built = "";
    for (const part of path.split("/")) {
      built = built ? `${built}/${part}` : part;
      if (!folderMap.has(built)) folderMap.set(built, new TFolder(built));
    }
  };
  folders.forEach(ensure);
  for (const [path, content] of Object.entries(files)) {
    const file = new TFile(path);
    file.content = content;
    fileMap.set(path, file);
    folderMap.get(path.slice(0, path.lastIndexOf("/")))?.children.push(file);
  }
  const app = {
    vault: {
      getFolderByPath: (p: string) => folderMap.get(p) ?? null,
      getAbstractFileByPath: (p: string) => folderMap.get(p) ?? fileMap.get(p) ?? null,
      createFolder: async (p: string) => {
        calls.push(`createFolder ${p}`);
        ensure(p);
      },
      create: async (p: string) => {
        calls.push(`create ${p}`);
      },
      modify: async (p: string) => {
        calls.push(`modify ${p}`);
      },
      adapter: { exists: async (p: string) => folderMap.has(p) || fileMap.has(p) },
      cachedRead: async (f: TFile) => f.content,
    },
    fileManager: { renameFile: async (f: TFile, to: string) => void calls.push(`rename ${f.path} -> ${to}`) },
  };
  return { app: app as unknown as App, calls };
}

test("cleanFolderInput trims, normalises and strips trailing slashes", () => {
  assert.equal(cleanFolderInput(`  ${CYRILLIC}/  `), CYRILLIC);
  assert.equal(cleanFolderInput("a//b///"), "a/b");
  assert.equal(cleanFolderInput("/"), "/");
  assert.equal(cleanFolderInput("   "), "");
  assert.equal(cleanFolderInput("Имена"), "Имена");
});

test("committing an existing Cyrillic folder creates nothing", async () => {
  const { app, calls } = fakeApp([CYRILLIC]);
  const chosen = await commitFolderChoice(app, `${CYRILLIC}/`, async () => assert.fail("should not ask"));
  assert.equal(chosen, CYRILLIC);
  assert.deepEqual(calls, []);
});

test("committing the vault root needs no folder", async () => {
  const { app, calls } = fakeApp([]);
  assert.equal(await commitFolderChoice(app, "/", async () => assert.fail("no prompt")), "/");
  assert.deepEqual(calls, []);
});

test("a missing folder is created only after confirmation", async () => {
  const declined = fakeApp([]);
  assert.equal(await commitFolderChoice(declined.app, "имен", async () => false), null);
  assert.deepEqual(declined.calls, []);

  const accepted = fakeApp([]);
  let asked = "";
  const chosen = await commitFolderChoice(accepted.app, "Имена/Новая", async (p) => ((asked = p), true));
  assert.equal(chosen, "Имена/Новая");
  assert.equal(asked, "Имена/Новая");
  assert.deepEqual(accepted.calls, ["createFolder Имена", "createFolder Имена/Новая"]);
});

test("an empty value commits nothing", async () => {
  const { app, calls } = fakeApp([]);
  assert.equal(await commitFolderChoice(app, "  ", async () => true), null);
  assert.deepEqual(calls, []);
});

test("a file at the path is refused", async () => {
  const { app } = fakeApp(["a"], { "a/b": "x" });
  await assert.rejects(commitFolderChoice(app, "a/b", async () => true), /already exists/);
});

test("typing letter by letter is not a commit: no vault calls without commitFolderChoice", () => {
  // The settings tab only stores typed text; only commitFolderChoice touches the vault.
  const { calls } = fakeApp([CYRILLIC]);
  for (const partial of ["и", "им", "име", "имен", "имена"]) cleanFolderInput(partial);
  assert.deepEqual(calls, []);
});

test("findLegacyPackFolder ignores the configured folder", async () => {
  const { app } = fakeApp([CYRILLIC, "Name Packs"], {
    [`${CYRILLIC}/Pack.md`]: PACK,
    "Name Packs/Old.md": PACK,
  });
  const found = await findLegacyPackFolder(app, { folderPath: CYRILLIC });
  assert.deepEqual(found, { path: "Name Packs", packCount: 1 });

  const none = await findLegacyPackFolder(app, { folderPath: "Name Packs" });
  assert.equal(none, null);

  const custom = fakeApp([CYRILLIC], { [`${CYRILLIC}/Pack.md`]: PACK });
  assert.equal(await findLegacyPackFolder(custom.app, { folderPath: CYRILLIC }), null);
});

test("migration moves into the configured folder and keeps it configured", async () => {
  const { app, calls } = fakeApp([CYRILLIC, "Name Packs"], { "Name Packs/Old.md": PACK });
  const settings = { folderPath: CYRILLIC };
  const result = await migratePacksToConfiguredFolder(app, settings, "Name Packs");
  assert.equal(result.moved, 1);
  assert.equal(result.settings.folderPath, CYRILLIC);
  assert.deepEqual(calls, [`rename Name Packs/Old.md -> ${CYRILLIC}/Old.md`]);
});

test("a custom folderPath survives a save, JSON and load round trip", () => {
  const saved = { folderPath: CYRILLIC, settlementsFolder: "0. Ширма мастера/Поселения", faithfulness: 3 };
  const data = JSON.parse(JSON.stringify(folderSettingsData(saved)));
  assert.deepEqual(data, { folderPath: CYRILLIC, settlementsFolder: "0. Ширма мастера/Поселения" });

  // Load: data.json first, then the configuration note found from that folder.
  const current = { folderPath: DEFAULT_NAMES_FOLDER, ...data };
  assert.equal(legacySettingsFileCandidates(current)[0], `${CYRILLIC}/nameForgeConfiguration.md`);
  // A stale note elsewhere naming another folder must not override data.json.
  const merged = mergeFolderSettings(data, { folderPath: "Name Packs", faithfulness: 3 }, current);
  assert.equal(merged.folderPath, CYRILLIC);
  assert.equal(merged.settlementsFolder, "0. Ширма мастера/Поселения");
  assert.equal(merged.faithfulness, 3);
});

test("settings from before data.json held folders still come from the note", () => {
  const current = { folderPath: DEFAULT_NAMES_FOLDER };
  const merged = mergeFolderSettings({}, { folderPath: "Name Packs", settlementsFolder: "S" }, current);
  assert.equal(merged.folderPath, "Name Packs");
  assert.equal(merged.settlementsFolder, "S");
  assert.equal(resolveNamesFolderPath("", ""), DEFAULT_NAMES_FOLDER);
});
