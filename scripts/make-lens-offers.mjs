// `npm run offers`: runs the probe (tests/fixtures/lensOffersProbe.ts) and writes src/data/lens-offers.json
// (one sentence brief §5.2). The engines are run for real: seeds 1, 42 and 2024, 12 names each, across every
// era, world, kind and culture a module offers. The output is generated: never edit it by hand.
import esbuild from "esbuild";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const started = Date.now();
const outdir = mkdtempSync(join(tmpdir(), "nameforge-offers-"));
try {
  const outfile = join(outdir, "probe.mjs");
  await esbuild.build({
    entryPoints: [join("tests", "fixtures", "lensOffersProbe.ts")],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    alias: { obsidian: resolve("tests", "stubs", "obsidian.ts") },
    logLevel: "warning",
  });
  const { buildOffers } = await import(pathToFileURL(outfile).href);
  writeFileSync(join("src", "data", "lens-offers.json"), `${JSON.stringify(buildOffers(), null, 1)}\n`);
  console.log(`wrote src/data/lens-offers.json in ${((Date.now() - started) / 1000).toFixed(1)} s`);
} finally {
  rmSync(outdir, { recursive: true, force: true });
}
