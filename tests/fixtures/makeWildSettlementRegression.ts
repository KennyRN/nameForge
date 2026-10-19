// Records settlement names (terrains outside the five wild-lands ones) and settlement kits for the wild lands regression (§16.5).
import { writeFileSync } from "node:fs";
import { generateKit } from "../../src/settlement/kit";
import { generateSettlementNames, type SettlementNamesOptions } from "../../src/settlement/names";

const out: Record<string, unknown> = {};
const TERRAINS = ["any", "coast", "rivers", "islands"];
for (const terrain of TERRAINS)
  for (const seed of [3, 77]) {
    const base = { size: "town", count: 25, seed, terrain } as const;
    const cases: Record<string, SettlementNamesOptions> = {
      british: { ...base, setting: "native" },
      "british NTH": { ...base, setting: "native", region: "NTH" },
      chinese: { ...base, setting: "native", culture: "chinese", era: "imperial" },
      norse: { ...base, setting: "native", culture: "norse", era: "viking" },
      exploration: { ...base, setting: "new-lands" },
      expansion: { ...base, setting: "settled-lands" },
    };
    for (const [name, options] of Object.entries(cases)) {
      const r = generateSettlementNames(options);
      out[`${name} ${terrain} ${seed}`] = r.names.map((n) => n.text);
    }
  }
for (const [culture, size] of [["norman-british", "town"], ["norman-british", "village"], ["chinese", "city"], ["japanese", "great"]] as const)
  for (const seed of [1, 2, 3]) {
    const k = generateKit({ culture, size, seed });
    out[`kit ${culture} ${size} ${seed}`] = { town: k.context.town, neighbours: k.context.neighbours, sections: k.sections.filter((s) => s.key !== "neighbours").map((s) => s.entries.map((e) => e.text)) };
  }
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
