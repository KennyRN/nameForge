// Brief 5a §11: keeps docs/vocabulary-pools.md and src/coverageReaders.ts in step with the pools the batch adds (one noun pool per module kind,
// the shared B/C/D and "old" pools). Called by make-north5a.mjs; replaces every `n<Capital>…` pool line.
import { readFileSync, writeFileSync } from "node:fs";
import { LAND_MODULES, ROUTE_MODULE, SACRED_MODULE, WATER_MODULES } from "./lib.mjs";

const PHRASE = { mountainNames: "mountains", forestNames: "forests", moorNames: "moors", wetlandNames: "wetlands", desertNames: "deserts", grasslandNames: "grasslands", lands: "lands and territories", farmland: "farmland and countryside", hillsValleys: "hills and valleys", riversInland: "rivers and inland waters", seasLakes: "seas and lakes", coastsIslands: "coasts and islands", seaCharts: "sea charts" };
const rows = []; // [pool, holds, readers]
for (const [module, m] of Object.entries({ ...LAND_MODULES, ...WATER_MODULES })) m.pools.forEach((p, i) => rows.push([p, `a culture's own ${m.kinds[i]} nouns for ${PHRASE[module]} (batch 5a; tagged \`c\` with their culture; counted)`, PHRASE[module]]));
ROUTE_MODULE.pools.forEach((p, i) => rows.push([p, `a culture's own ${ROUTE_MODULE.kinds[i]} route nouns (batch 5a; tagged \`c\`; counted)`, "route names"]));
const SITES = ["water (springs, wells, pools)", "stone and ground (stones, hills, barrows)", "built places (chapels, shrines, temples)"];
SACRED_MODULE.pools.forEach((p, i) => rows.push([p, `a culture's own sacred place nouns: ${SITES[i]} (batch 5a; tagged \`c\`; counted)`, "sacred places"]));
const GROUPS = [
  ["nLandB", "land-use and material words (Slate, Peat, Shieling)", "wild lands, lands and territories, farmland and countryside, hills and valleys, rivers and inland waters"],
  ["nLandC", "lore words of the land (fantastic only)", "the same"], ["nLandD", "words of the land by era (Hillfort, Quarry)", "the same"], ["nLandDOld", "the older eras' words of the land, for \"Old {D}\" from the steam age on", "the same"],
  ["nWaterB", "water-use words (Herring, Slate)", "seas and coasts, rivers and inland waters"], ["nWaterC", "lore words of the water (fantastic only)", "the same"], ["nWaterD", "words of the water by era", "the same"], ["nWaterDOld", "the older eras' words of the water, for \"Old {D}\"", "the same"],
  ["nRouteB", "goods and users of a route", "route names"], ["nRouteC", "lore words of a route (fantastic only)", "route names"], ["nRouteD", "route words by era (Turnpike, Branch Line)", "route names"], ["nRouteDOld", "the older eras' route words, for \"Old {D}\"", "route names"],
  ["nSacredB", "qualifiers of a sacred place", "sacred places"], ["nSacredC", "lore words of a sacred place (fantastic only)", "sacred places"], ["nSacredD", "sacred place words by era", "sacred places"], ["nSacredDOld", "the older eras' sacred place words, for \"Old {D}\"", "sacred places"],
];
let last = "";
for (const [p, holds, readers] of GROUPS) {
  const r = readers === "the same" ? last : readers;
  last = r;
  rows.push([p, `${holds} (batch 5a; tagged \`c\`; read by ${r}, shared by the group and not counted towards a signature cell, §11.1)`, "–"]);
}

// docs/vocabulary-pools.md
const docPath = new URL("../../docs/vocabulary-pools.md", import.meta.url);
const lines = readFileSync(docPath, "utf8").split("\n");
const isOurs = (l) => /^\| `n[A-Z]\w*` \|/.test(l);
const at = lines.findIndex(isOurs);
if (at < 0) throw new Error("vocabulary-pools.md: no 5a pool rows to replace");
const kept = lines.filter((l) => !isOurs(l));
kept.splice(at, 0, ...rows.map(([p, holds, readers]) => `| \`${p}\` | ${holds} | x, e, t, c, h | ${readers} |`));
writeFileSync(docPath, kept.join("\n"));

// src/coverageReaders.ts
const rdPath = new URL("../../src/coverageReaders.ts", import.meta.url);
const src = readFileSync(rdPath, "utf8").split("\n");
const from = src.findIndex((l) => l.includes("Northern Europe brief 5a: the signature words"));
const to = src.findIndex((l, i) => i > from && l.startsWith('  "direction":'));
if (from < 0 || to < 0) throw new Error("coverageReaders.ts: markers not found");
src.splice(from + 1, to - from - 1, ...rows.map(([p, , readers]) => `  "${p}": "${readers}",`));
writeFileSync(rdPath, src.join("\n"));
console.log("patched docs/vocabulary-pools.md and src/coverageReaders.ts:", rows.length, "pools");
