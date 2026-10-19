// Records buildings names for every kind except monument × 3 cultures × 3 eras × 2 seeds, for the
// monuments brief's regression rule (§14.1). Run before buildings changed; the test replays them.
// Usage: node (esbuild-bundled) makeBuildingRegression.ts <out.json>
import { writeFileSync } from "node:fs";
import { BUILDING_KINDS, generateBuildingNames } from "../../src/buildings/engine";
import type { BuildingKind } from "../../src/buildings/engine";

const out: Record<string, string[]> = {};
for (const k of BUILDING_KINDS) {
  if ((k.key as string) === "monument") continue;
  for (const culture of ["norman-british", "chinese", "norse"]) {
    for (const era of ["AN", "ST", "NF"] as const) {
      for (const seed of [7, 2024]) {
        out[`${k.key} ${culture} ${era} ${seed}`] = generateBuildingNames({ culture, era, kind: k.key as BuildingKind, people: "invented", count: 12, seed }).names.map((n) => n.text);
      }
    }
  }
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
