// Bundles tests/*.test.ts with esbuild and runs them with Node's built-in test runner.
// `obsidian` resolves to tests/stubs/obsidian.ts, a minimal stand-in.
import esbuild from "esbuild";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const entryPoints = readdirSync("tests")
  .filter((file) => file.endsWith(".test.ts"))
  .map((file) => join("tests", file));
const outdir = mkdtempSync(join(tmpdir(), "nameforge-tests-"));

try {
  await esbuild.build({
    entryPoints,
    outdir,
    bundle: true,
    platform: "node",
    format: "esm",
    alias: { obsidian: resolve("tests", "stubs", "obsidian.ts") },
    outExtension: { ".js": ".mjs" },
    logLevel: "warning",
  });
  const files = readdirSync(outdir).map((file) => join(outdir, file));
  const { status } = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
  process.exitCode = status ?? 1;
} finally {
  rmSync(outdir, { recursive: true, force: true });
}
