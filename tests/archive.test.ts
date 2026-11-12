// Wizard retirement brief §6.2: the archive is never imported, compiled or bundled.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith(".ts") ? [path] : [];
  });

test("archive: nothing in src/ or tests/ imports from archive/", () => {
  for (const file of [...walk("src"), ...walk("tests")]) {
    if (file === join("tests", "archive.test.ts")) continue;
    assert.doesNotMatch(readFileSync(file, "utf8"), /from\s+["'][^"']*\barchive\//, file);
  }
});

test("archive: tsconfig excludes it and the test runner reads only tests/", () => {
  assert.match(readFileSync("tsconfig.json", "utf8"), /"exclude":\s*\[[^\]]*"archive"/);
  assert.match(readFileSync("scripts/run-tests.mjs", "utf8"), /readdirSync\("tests"\)/);
});

test("archive: the wizard's files are archived, not in src/", () => {
  for (const file of ["src/recipeEditor.ts", "src/names/wizardWords.ts", "src/wordListGuide.ts", "src/contextGuide.ts"]) {
    assert.throws(() => statSync(file), file);
  }
  for (const file of ["recipeEditor.ts", "wizardWords.ts", "wordListGuide.ts", "contextGuide.ts", "slotTiers.ts", "README.md"]) {
    assert.ok(statSync(join("archive", "place-name-wizard", file)).isFile(), file);
  }
});
