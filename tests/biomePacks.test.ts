// Biome packs (Land brief §9, §13.4).
import { test } from "node:test";
import assert from "node:assert/strict";
import { allBiomes, findBiome } from "../src/biomes";
import { biomeToText, diffAgainstBase, parseBiomePack, parseBiomePackContent, resolveBiomePacks } from "../src/biomePacks";

const SALT = `---
type: biome
packName: Salt Marshes
setting:
based-on: temperate
phrase: the salt marshes
---

Low, tidal country of creeks, mudflats and grazing marsh.

## Terrain weights
- plains (15), coast (30), rivers (10), wetland (35)
- salt pans (10)

## Wetland: land
- Saltings, Mudflats, Grazing Marsh, Samphire Flats

## Wetland: short water
- creek, rill, fleet

## Salt pans: land
- Salt Pans, White Flats

## Salt pans: short land
- pan, flat

## Salt pans: shape groups
- industry-and-trade (2), wetland (1.5)

## Birds
- curlew, redshank, avocet, egret (2), marsh harrier, oystercatcher

## Shape groups
- woodland (0.2), upland-and-open-ground (0.3), wetland (2)
`;

test("biome packs: the brief's example", () => {
  const b = parseBiomePack(SALT);
  const temperate = findBiome("temperate")!;
  assert.deepEqual(
    Object.fromEntries(Object.entries(b.terrainWeights).filter(([, w]) => w > 0)),
    { plains: 15, coast: 30, rivers: 10, wetland: 35, "salt-pans": 10 },
  );
  for (const t of ["hills", "mountains", "forest", "islands"]) assert.equal(b.terrainWeights[t], 0, t);
  assert.deepEqual(b.land.wetland.map(([w]) => w), ["Saltings", "Mudflats", "Grazing Marsh", "Samphire Flats"]);
  assert.deepEqual(b.short.water.wetland.map(([w]) => w), ["creek", "rill", "fleet"]);
  assert.deepEqual(b.birds.find(([w]) => w === "egret"), ["egret", 2]);
  assert.deepEqual(b.shapeMultipliers.groups, { woodland: 0.2, "upland-and-open-ground": 0.3, wetland: 2 });
  assert.equal(b.customTerrains?.[0].id, "salt-pans");
  assert.deepEqual(b.customTerrains?.[0].shapeMultipliers.groups, { "industry-and-trade": 2, wetland: 1.5 });
  // Everything else from temperate.
  assert.deepEqual(b.trees, temperate.trees);
  assert.deepEqual(b.land.coast, temperate.land.coast);
  assert.equal(b.phrase, "the salt marshes");
});

test("biome packs: heading aliases", () => {
  const a = parseBiomePack("---\ntype: biome\nbased-on: temperate\n---\n\n## Wild animal\n- otter\n\n## Coasts: land\n- Saltings\n");
  const b = parseBiomePack("---\ntype: biome\nbased-on: temperate\n---\n\n## Wild animals\n- otter\n\n## coast: land\n- Saltings\n");
  assert.deepEqual(a.wildAnimals, [["otter", 1]]);
  assert.deepEqual(a.land.coast, b.land.coast);
});

test("biome packs: every built-in biome round-trips", () => {
  for (const b of allBiomes()) assert.deepEqual(parseBiomePack(biomeToText(b)), b, b.id);
});

test("biome packs: saving keeps only edited sections", () => {
  const desert = findBiome("desert")!;
  const text = biomeToText(desert).replace(/## Birds\n\n[^\n]*/, "## Birds\n\n- roadrunner");
  const { text: saved, own } = diffAgainstBase(text, desert);
  assert.equal(own, 1);
  assert.ok(/## Birds\n\n- roadrunner/.test(saved));
  assert.equal(parseBiomePackContent(saved).sections.length, 1);
});

test("biome packs: chains, loops, pack lines and empty sections", () => {
  const { biomes, problems } = resolveBiomePacks([
    { path: "A.md", content: "---\ntype: biome\npackName: A\nbased-on: \"[[B]]\"\n---\n\n## Birds\n- kite\n" },
    { path: "B.md", content: "---\ntype: biome\npackName: B\nbased-on: desert\n---\n\n## Trees\n- olive\n" },
    { path: "L1.md", content: "---\ntype: biome\npackName: L1\nbased-on: \"[[L2]]\"\n---\n" },
    { path: "L2.md", content: "---\ntype: biome\npackName: L2\nbased-on: \"[[L1]]\"\n---\n" },
  ]);
  const a = biomes.find((b) => b.label === "A")!;
  assert.deepEqual(a.birds, [["kite", 1]]);
  assert.deepEqual(a.trees, [["olive", 1]]);
  assert.deepEqual(a.wildAnimals, findBiome("desert")!.wildAnimals);
  assert.ok(problems.some((p) => /can't find its base/.test(p)), problems.join("; "));
  const p = parseBiomePack("---\ntype: biome\nbased-on: temperate\n---\n\n## Birds\n// Saxon Birds (2)\n\n## Trees\n");
  assert.deepEqual(p.packLines?.birds, [{ pack: "Saxon Birds", weight: 2 }]);
  assert.deepEqual(p.trees, []);
});
