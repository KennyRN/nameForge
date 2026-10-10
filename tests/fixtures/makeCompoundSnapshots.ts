// Records compound pack batches from old-layout packs (## Part N, no new keys) before the
// Compound brief's layout change (§6). Run against commit f36c6c1.
import { writeFileSync } from "node:fs";
import { generateCompoundNamesDetailed } from "../../src/markov";
import { parseNamesFileContent } from "../../src/nameParser";
import { COMPOUND_FIXTURE_PACKS } from "./compoundPacks";

const out: Record<string, string[]> = {};
for (const [key, content] of Object.entries(COMPOUND_FIXTURE_PACKS)) {
  const parsed = parseNamesFileContent(content);
  for (const seed of [1, 2, 99]) {
    out[`${key} ${seed}`] = generateCompoundNamesDetailed(parsed.parts ?? [], {
      count: 25,
      generator: parsed.compoundGenerator ?? "breakdown",
      joining: parsed.compoundJoining ?? "joined",
      seed,
    }).names;
  }
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
