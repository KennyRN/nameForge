// Batch 5b: keeps docs/vocabulary-pools.md and src/coverageReaders.ts in step with the pools the batch adds (`nb…`, one noun pool per module kind and one region pool per module).
import { readFileSync, writeFileSync } from "node:fs";
import { MODULES } from "./modules.mjs";

const PHRASE = { streetNames: "streets and districts", innNames: "inns and taverns", buildingNames: "buildings and landmarks", monumentNames: "monuments and statues" };
const rows = [];
for (const [module, m] of Object.entries(MODULES)) {
  m.pools.forEach((p, i) => rows.push([p, `a culture's own ${m.kinds[i]} nouns for ${PHRASE[module]} (batch 5b; tagged \`c\` with their cultures; counted)`, PHRASE[module]]));
  rows.push([m.region, `region words for ${PHRASE[module]}: six per region (batch 5b; tagged \`c\` and \`r\`; drawn only for the cultures that read the region; counted)`, PHRASE[module]]);
}
const docPath = new URL("../../docs/vocabulary-pools.md", import.meta.url);
const lines = readFileSync(docPath, "utf8").split("\n");
const isOurs = (l) => /^\| `nb[A-Z]\w*` \|/.test(l);
const kept = lines.filter((l) => !isOurs(l));
const last5a = kept.map((l, i) => (/^\| `n[A-Z]\w*` \|/.test(l) ? i : -1)).filter((i) => i >= 0).pop();
if (last5a === undefined) throw new Error("vocabulary-pools.md: no 5a pool rows to follow");
kept.splice(last5a + 1, 0, ...rows.map(([p, holds, readers]) => `| \`${p}\` | ${holds} | x, e, t, c, h | ${readers} |`));
writeFileSync(docPath, kept.join("\n"));

const rdPath = new URL("../../src/coverageReaders.ts", import.meta.url);
const src = readFileSync(rdPath, "utf8").split("\n").filter((l) => !/^  "nb[A-Z]/.test(l));
const at = src.findIndex((l) => l.startsWith('  "direction":'));
if (at < 0) throw new Error("coverageReaders.ts: marker not found");
src.splice(at, 0, "  // Northern Europe brief 5b: the signature words of the cultures in the batch modules.", ...rows.map(([p, , readers]) => `  "${p}": "${readers}",`));
writeFileSync(rdPath, src.join("\n"));
console.log("patched docs/vocabulary-pools.md and src/coverageReaders.ts:", rows.length, "pools");
