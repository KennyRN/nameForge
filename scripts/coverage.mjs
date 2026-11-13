// `npm run coverage`: bundles src/coverageReport.ts with esbuild, runs it and writes docs/coverage.md
// and docs/coverage.json (shared lens brief §6.2). Nothing here runs a name generator.
import esbuild from "esbuild";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const outdir = mkdtempSync(join(tmpdir(), "nameforge-coverage-"));
try {
  const outfile = join(outdir, "coverageReport.mjs");
  await esbuild.build({
    entryPoints: [join("src", "coverageReport.ts")],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    alias: { obsidian: resolve("tests", "stubs", "obsidian.ts") },
    logLevel: "warning",
  });
  const { coverageFiles } = await import(pathToFileURL(outfile).href);
  const { markdown, json } = coverageFiles();
  writeFileSync(join("docs", "coverage.md"), `${markdown}\n`);
  writeFileSync(join("docs", "coverage.json"), json);
  console.log("wrote docs/coverage.md and docs/coverage.json");
} finally {
  rmSync(outdir, { recursive: true, force: true });
}
