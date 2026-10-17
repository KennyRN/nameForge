// Stellar brief §15.3: the five space biomes in exploration and expansion.
import test from "node:test";
import assert from "node:assert/strict";
import { allBiomes, availableTerrains, BIOMES, BRITAIN, findBiome, SPACE_BIOMES } from "../src/biomes";
import { biomeChoices, spaceBiomeChoices, wizardSentenceText } from "../src/colonialSentence";
import { COLONIAL_DATA, sampleColonialShapes } from "../src/colonialShapes";
import { generatePlaceNames, NAME_WORDS } from "../src/names/engine";
import { britishPlaceNamesRecipe, colonialPlaceNamesRecipe, readRecipe, recipeToFrontmatter } from "../src/names/recipe";
import type { SpaceScale } from "../src/space/scale";

const TERRAINS: Record<string, [string, string, string, number][]> = {
  "planetary-system": [["surface", "Surface", "the surface", 30], ["moons", "Moons", "the moons", 25], ["rings", "Rings", "the rings", 20], ["orbits", "Orbits", "the orbits", 25]],
  "star-system": [["inner", "Inner system", "the inner system", 20], ["belts", "Belts", "the belts", 25], ["outer", "Outer system", "the outer system", 25], ["boundaries", "Boundaries", "the edge of the system", 20], ["binaries", "Binary stars", "the binary stars", 10]],
  "local-stars": [["stars", "Nearby stars", "the nearby stars", 35], ["clouds", "Clouds", "the clouds", 25], ["bubbles", "Bubbles and shells", "the bubbles and shells", 20], ["streams", "Stellar streams", "the stellar streams", 20]],
  sector: [["nebulae", "Nebulae", "the nebulae", 30], ["clusters", "Clusters", "the clusters", 25], ["rifts", "Rifts", "the rifts", 20], ["spurs", "Spurs and filaments", "the spurs and filaments", 25]],
  galaxy: [["arms", "Arms", "the arms", 30], ["core", "Core", "the core", 20], ["disc", "Disc", "the disc", 20], ["halo", "Halo", "the halo", 15], ["voids", "Voids", "the voids", 15]],
};
const SCALE_OF: Record<string, SpaceScale> = { "planetary-system": "Pl", "star-system": "Sy", "local-stars": "Nb", sector: "Se", galaxy: "Ga" };

test("§5.1–§5.2: the five space biomes, their scales and terrains", () => {
  assert.deepEqual(SPACE_BIOMES.map((b) => b.id), Object.keys(TERRAINS));
  for (const b of SPACE_BIOMES) {
    assert.ok(b.space, b.id);
    assert.equal(b.scale, SCALE_OF[b.id]);
    assert.deepEqual(availableTerrains(b).map((t) => [t.id, t.label, t.phrase, b.terrainWeights[t.id]]), TERRAINS[b.id]);
    assert.equal(b.universalWords, false);
    assert.equal(b.crops.length > 0, b.scale === "Pl" || b.scale === "Sy");
    assert.equal(b.wildAnimals.length + b.birds.length + b.trees.length + b.plants.length + b.livestock.length, 0);
  }
  assert.equal(findBiome("sector")?.scale, "Se");
});

test("§5.1: space biomes appear only under Space in exploration and expansion", () => {
  assert.ok(allBiomes().every((b) => !b.space));
  assert.ok(BIOMES.every((b) => !b.space));
  for (const part of ["organic", "new-land", "established"] as const) assert.ok(biomeChoices(part).every((c) => !SPACE_BIOMES.some((b) => b.id === c.id)), part);
  assert.deepEqual(spaceBiomeChoices().map((c) => c.id), Object.keys(TERRAINS));
  // An organic recipe that names one falls back to Britain, with the notice.
  const organic = generatePlaceNames({ recipe: britishPlaceNamesRecipe(undefined, "sector", "any"), slots: {}, count: 5, seed: 3 });
  assert.ok(organic.notices.some((n) => n.startsWith("Space biomes are for exploration")));
  assert.equal(organic.names.length, 5);
});

const SETTLEMENT_ALLOWED = new Set(["space-settlement", "territories", "military-and-administrative", "colonial-settlement"]);
test("§5.5: under a space biome only that scale's space groups and the few kept groups are live", () => {
  for (const [id, scale] of Object.entries(SCALE_OF)) {
    for (const part of ["2", "2a"] as const) {
      const shapes = sampleColonialShapes({ count: 2000, part, seed: 5, space: { scale, aliens: false } });
      for (const s of shapes) {
        const group = COLONIAL_DATA.groups.find((g) => g.id === s.groupId)!;
        const ok = group.space ? !group.scale || group.scale === scale : SETTLEMENT_ALLOWED.has(s.groupId) && (s.groupId !== "colonial-settlement" || scale === "Pl");
        assert.ok(ok, `${id} ${part}: ${s.groupId}`);
        if (s.groupId === "military-and-administrative") assert.ok(["garrison-camp", "frontier-post"].includes(s.genericId), s.genericId);
        if (s.genericId === "gate") assert.ok(scale !== "Pl" && scale !== "Sy");
      }
    }
  }
});

test("§5.5: outside a space biome no space generic appears", () => {
  const shapes = sampleColonialShapes({ count: 3000, part: "2", seed: 8 });
  for (const s of shapes) assert.ok(!COLONIAL_DATA.groups.find((g) => g.id === s.groupId)!.space, s.groupId);
  const exp = sampleColonialShapes({ count: 3000, part: "2a", seed: 9 });
  for (const s of exp) assert.ok(!COLONIAL_DATA.groups.find((g) => g.id === s.groupId)!.space, s.groupId);
});

test("§5.5: a chosen terrain raises its group ×4", () => {
  const env = { groups: { "star-system": 0 } as Record<string, number>, generics: {} };
  void env;
  const biome = findBiome("star-system")!;
  const terrain = biome.customTerrains!.find((t) => t.id === "belts")!;
  assert.equal(terrain.shapeMultipliers.groups["system-belts"], 4);
  const plain = sampleColonialShapes({ count: 6000, part: "2", seed: 2, space: { scale: "Sy", aliens: false } });
  const raised = sampleColonialShapes({ count: 6000, part: "2", seed: 2, space: { scale: "Sy", aliens: false }, environment: { groups: { "system-belts": 4 }, generics: {} } });
  const share = (xs: typeof plain) => xs.filter((s) => s.groupId === "system-belts").length / xs.length;
  assert.ok(share(raised) > share(plain) * 2.5, `${share(plain)} → ${share(raised)}`);
});

test("§5.8: alien life decides the native-people and local-god slots", () => {
  const run = (part: "new-land" | "established", aliens: boolean, biome = "sector") =>
    generatePlaceNames({ recipe: colonialPlaceNamesRecipe(part, undefined, undefined, biome, "any", aliens), slots: {}, count: 300, seed: 21 }).names.map((n) => n.text);
  const noAliensExploration = run("new-land", false);
  for (const t of noAliensExploration) assert.ok(!t.includes("[alien people]") && !t.includes("[native people]") && !t.includes("[earlier settlers]"), t);
  const noAliensExpansion = run("established", false);
  assert.ok(noAliensExpansion.some((t) => t.includes("[earlier settlers]")));
  for (const t of noAliensExpansion) assert.ok(!t.includes("[alien people]") && !t.includes("[alien god]"), t);
  assert.ok(run("new-land", true).some((t) => t.includes("[alien people]")));
  assert.ok(run("established", true).some((t) => t.includes("[alien people]")));
  assert.ok(run("established", true).some((t) => t.includes("[alien place]")));
  // Without aliens, no alien place at all.
  for (const t of run("new-land", false)) assert.ok(!t.includes("[alien"), t);
});

test("§5.7: native places are catalogue names, adopted as drawn or said aloud, never fused", () => {
  const names = generatePlaceNames({ recipe: colonialPlaceNamesRecipe("new-land", undefined, undefined, "sector", "any"), slots: {}, count: 600, seed: 31 }).names.map((n) => n.text);
  assert.ok(names.some((t) => /\b(Gliese|Wolf|Ross|Lalande|Groombridge|HD|HIP|LHS|Kepler|K2|TOI)[ -]\d+/.test(t)), "an adopted catalogue name");
  assert.ok(names.some((t) => /\b(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen|Sixteen|Seventeen|Eighteen|Nineteen|Twenty|Thirty|Forty|Fifty|Sixty|Seventy|Eighty|Ninety)-(Oh|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Twenty|Thirty|Forty|Fifty|Sixty|Seventy|Eighty|Ninety)/.test(t)), "a spoken catalogue name");
  for (const t of names) assert.ok(!/[a-z]\d/.test(t.replace(/\b(K2)\b/g, "")), `fused with a number: ${t}`);
});

test("§5.4: plain and full forms of a space generic", () => {
  assert.deepEqual(NAME_WORDS.colonialGenerics["roche-lobe"], ["lobe", "Roche lobe"]);
  assert.deepEqual(NAME_WORDS.colonialGenerics["trojan-camp"], ["camp", "Trojan camp"]);
  assert.deepEqual(NAME_WORDS.colonialGenerics["belt"], ["belt", "asteroid belt"]);
  for (const g of COLONIAL_DATA.groups.filter((x) => x.space)) {
    for (const entry of g.generics) {
      const id = typeof entry === "string" ? entry : entry.id;
      assert.ok(NAME_WORDS.colonialGenerics[id], id);
      assert.equal(NAME_WORDS.genericFusion[id], 0, id);
    }
  }
  const lobes = generatePlaceNames({ recipe: colonialPlaceNamesRecipe("new-land", undefined, undefined, "star-system", "binaries"), slots: {}, count: 200, seed: 4 }).names.map((n) => n.text);
  assert.ok(lobes.some((t) => /Roche Lobe/i.test(t)) && lobes.some((t) => /\bLobe\b/.test(t) && !/Roche/.test(t)));
});

test("§5.2, §5.9: the wizard sentence reads as the brief's example", () => {
  assert.equal(
    wizardSentenceText("new-land", { tradition: "general", context: "wild-and-unsettled", biome: "star-system", terrain: "belts", aliens: false }),
    "General explorers in wild and unsettled space across the belts of a star system, with no alien life, naming any feature",
  );
  assert.equal(
    wizardSentenceText("new-land", { tradition: "general", context: "contested-frontier", biome: "sector", terrain: "any", aliens: true }),
    "General explorers in a contested frontier across all of a sector, with alien life, naming any feature",
  );
  // Expansion contexts are unchanged; earthly sentences read as before.
  assert.match(wizardSentenceText("established", { tradition: "general", context: "imposition", biome: "galaxy", terrain: "arms" }), /who are ruling over the locals across the arms of the galaxy, with no alien life/);
  assert.equal(
    wizardSentenceText("new-land", { tradition: "general", context: "wild-and-unsettled" }),
    "General explorers in wild and unsettled lands across any part of unknown country, naming any feature",
  );
});

test("§5.8: aliens round-trip through the recipe, and false is never written", () => {
  const recipe = colonialPlaceNamesRecipe("new-land", undefined, undefined, "sector", "nebulae", true);
  const fm = recipeToFrontmatter(recipe) as { shape: Record<string, unknown> };
  assert.equal(fm.shape.aliens, true);
  assert.equal(fm.shape.terrain, "nebulae");
  const read = readRecipe(fm);
  assert.deepEqual(read.problems, []);
  assert.equal(read.recipe.shape?.aliens, true);
  assert.equal(read.recipe.shape?.biome, "sector");
  const off = recipeToFrontmatter(colonialPlaceNamesRecipe("new-land", undefined, undefined, "sector", "any", false)) as { shape: Record<string, unknown> };
  assert.ok(!("aliens" in off.shape));
  assert.ok(BRITAIN.id === "britain");
});
