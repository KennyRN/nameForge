// Records tribal names snapshots after the terrain split (Land brief §12 M1).
import { writeFileSync } from "node:fs";
import { generateTribalNames } from "../../src/tribes/engine";

const out: Record<string, unknown> = {};
for (const tradition of ["general", "celtic", "polynesian"]) {
  for (const seed of [1, 2]) out[`${tradition} ${seed}`] = JSON.parse(JSON.stringify(generateTribalNames({ tradition, count: 20, seed }).names));
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
