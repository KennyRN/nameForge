// Coverage adapter for native place names (shared lens brief §6.1): the British place names
// (place-shapes.json and its words), and each world culture's named eras, templates and word lists.
import placeShapeData from "../data/place-shapes.json";
import placeWordData from "../data/place-shape-words.json";
import worldData from "../data/world-place-names.json";
import { type CoverageAdapter, type CoverageRow, makeRow } from "../coverageRows";
import { lensErasFor } from "../lens";

const MODULE = "placeShapes";
type WorldCulture = { id: string; eras: { id: string; templates: unknown[] }[]; lists: Record<string, unknown[]> };
const WORLD = worldData.cultures as unknown as WorldCulture[];
type R = Record<string, unknown>;

function rows(): CoverageRow[] {
  const out: CoverageRow[] = [];
  // British place names are English-based: the plain words of every generic, the variants that belong to
  // regions, and the structures, word orders and affixes that shape a name. No era of their own.
  for (const _ of Object.keys(placeWordData.words as R)) out.push(makeRow({ culture: "english" }, { module: MODULE, source: "place-shape-words/words", type: "word" }));
  for (const v of placeWordData.variants as { regions?: string[] }[]) out.push(makeRow({ culture: "english" }, { module: MODULE, source: "place-shape-words/variants", type: "word", regions: v.regions }));
  for (const _ of placeShapeData.structures) out.push(makeRow({ culture: "english" }, { module: MODULE, source: "place-shapes/structures", type: "shape" }));
  for (const _ of placeShapeData.wordOrders) out.push(makeRow({ culture: "english" }, { module: MODULE, source: "place-shapes/wordOrders", type: "shape" }));
  for (const _ of placeShapeData.affixes) out.push(makeRow({ culture: "english" }, { module: MODULE, source: "place-shapes/affixes", type: "shape" }));
  // A world culture's eras (read through the lens's world table) carry its templates; its lists are its words.
  for (const c of WORLD) {
    for (const era of c.eras) {
      const eras = lensErasFor(MODULE, era.id, c.id);
      for (const _ of era.templates) out.push(makeRow({ culture: c.id, e: eras }, { module: MODULE, source: `world/${c.id}/eras/${era.id}`, type: "shape" }));
    }
    for (const [list, words] of Object.entries(c.lists)) for (const _ of words) out.push(makeRow({ culture: c.id }, { module: MODULE, source: `world/${c.id}/lists/${list}`, type: "word" }));
  }
  return out;
}

export const placeShapesCoverage: CoverageAdapter = { module: MODULE, regions: true, roster: WORLD.map((c) => c.id), rows };
