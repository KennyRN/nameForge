// Stellar brief §7–§8: realms under a space biome, and the settlement kit's derived scale.
import test from "node:test";
import assert from "node:assert/strict";
import { findBiome, SPACE_BIOMES } from "../src/biomes";
import { generateRealmNames, REALM_DATA, type RealmName } from "../src/realms/engine";
import { chooseRealm, DEFAULT_REALM_STATE, realmSentence } from "../src/realms/sentence";
import { generateKit } from "../src/settlement/kit";

const WATER = /\b(Rivers|Lakes|Shores|Isles|Islands|Straits|Lagoons|Reefs|Waters|Coast|Delta|Bay|Sound|Strand|Gulf)\b/;
function many(o: Parameters<typeof generateRealmNames>[0], n: number, from = 1): RealmName[] {
  const out: RealmName[] = [];
  for (let seed = from; out.length < n && seed < from + n; seed++) out.push(...generateRealmNames({ ...o, count: 50, seed }).names);
  return out.slice(0, n);
}

test("§7.1: a space biome gives space land phrases and directions, and no water", () => {
  const pl = findBiome("planetary-system")!;
  const phrases = new Set(Object.values(pl.land).flat().map(([w]) => w));
  const names = many({ era: "interstellar", genre: "scifi", biome: "planetary-system", namedFor: "land", length: "plain", output: "short", people: "invented", count: 0 }, 800);
  assert.ok(names.length >= 700);
  // Collective names ("the Eastern Cities") have their own qualifier lists; the land identity is what changes.
  const land = names.filter((n) => n.kind !== "collective");
  for (const n of land) assert.ok(!WATER.test(n.text), n.text);
  assert.ok(land.some((n) => [...phrases].some((p) => n.text.includes(p))), "a planetary-system land phrase");
  const directions = ["Upwell", "Downwell", "Polar", "Equatorial"];
  assert.ok(land.some((n) => directions.some((d) => n.text.includes(d))), "a planetary direction");
  for (const n of land) assert.ok(!/\b(Northern|Southern|Eastern|Western|Coreward|Rimward)\b/.test(n.text), n.text);
});

test("§7.2: the form multipliers by scale rule forms out where they weigh 0", () => {
  const forms = (biome: string) => new Set(many({ era: "interstellar", genre: "scifi", biome, namedFor: "land", people: "invented", count: 0 }, 1500).map((n) => n.form));
  const ga = forms("galaxy");
  assert.ok(!ga.has("Orbital Republic"));
  const pl = forms("planetary-system");
  for (const f of ["Interstellar Federation", "Stellar Commonwealth", "Sector Government"]) assert.ok(!pl.has(f), f);
  const se = forms("sector");
  assert.ok(se.has("Sector Government"));
  assert.equal(REALM_DATA.spaceForms.Empire.Ga, 3);
});

test("§7.1: an earthly biome in the future eras behaves as it did - no scale, no space words", () => {
  const a = generateRealmNames({ era: "interstellar", genre: "scifi", biome: "desert", count: 40, seed: 9 }).names.map((n) => n.text);
  const b = generateRealmNames({ era: "interstellar", genre: "scifi", biome: "desert", terrain: "any", count: 40, seed: 9 }).names.map((n) => n.text);
  assert.deepEqual(a, b);
  assert.ok(a.length > 0);
});

test("§7.1: a space biome outside the future eras falls back to the homeland, with a notice", () => {
  const batch = generateRealmNames({ era: "medieval", biome: "sector", count: 20, seed: 4 });
  assert.ok(batch.notices.some((n) => n.startsWith("Space biomes need")));
  assert.ok(batch.names.length > 0);
});

test("§7.1: the sentence lists the Space heading in NF and IS, and a lost era resets the biome", () => {
  const limits = { biomes: [], findBiome: (id: string | undefined) => findBiome(id) };
  const choices = (era: string) => {
    const link = realmSentence({ ...DEFAULT_REALM_STATE, era }, limits).find((s) => typeof s !== "string" && s.field === "biome");
    return link && typeof link !== "string" ? link.choices : [];
  };
  assert.ok(!choices("medieval").some((c) => c.heading));
  assert.deepEqual(choices("nearFuture").filter((c) => SPACE_BIOMES.some((b) => b.id === c.id)).map((c) => c.id), ["planetary-system", "star-system"]);
  assert.equal(choices("nearFuture").find((c) => c.heading)?.heading, "Space");
  assert.equal(choices("interstellar").filter((c) => SPACE_BIOMES.some((b) => b.id === c.id)).length, 5);
  const inSpace = { ...DEFAULT_REALM_STATE, era: "interstellar", biome: "galaxy", terrain: "arms" };
  const back = chooseRealm(inSpace, "era", "medieval", (id) => findBiome(id));
  assert.equal(back.biome, undefined);
  assert.equal(back.terrain, "any");
  assert.equal(chooseRealm(inSpace, "era", "nearFuture", (id) => findBiome(id)).biome, undefined);
  assert.equal(chooseRealm({ ...inSpace, biome: "star-system", terrain: "belts" }, "era", "nearFuture", (id) => findBiome(id)).biome, "star-system");
});

test("§8: a settlement on a planet gets ordinary roads in the interstellar era; a station keeps space lanes", () => {
  const roadKinds = (position: "inland" | "crossroads") => {
    const kinds = new Set<string>();
    for (let seed = 1; seed <= 25; seed++) {
      const kit = generateKit({ culture: "general", era: "IS", position, size: "town", detail: "rich", people: "invented", seed });
      for (const e of kit.sections.find((s) => s.key === "roads")?.entries ?? []) if (e.kind) kinds.add(e.kind);
    }
    return kinds;
  };
  const planet = roadKinds("inland");
  assert.ok([...planet].some((k) => k !== "space"), `planet kinds: ${[...planet]}`);
  assert.deepEqual([...roadKinds("crossroads")], ["space"]);
});
