// One sentence brief M4: family B (group names, bynames, vehicles, realms) read their culture, era and
// world links from the lens clause. The era shows as one of three bands, stored as a genre; the world
// replaces the old genre and fantastic links; module rules on those links are kept.
import { test } from "node:test";
import assert from "node:assert/strict";
import { GROUP_DATA } from "../src/groups/engine";
import { chooseGroup, DEFAULT_GROUP_STATE, groupSentence } from "../src/groups/sentence";
import { bynameSentence, chooseByname, DEFAULT_BYNAME_STATE } from "../src/bynames/sentence";
import { chooseRealm, DEFAULT_REALM_STATE, realmSentence } from "../src/realms/sentence";
import { chooseVessel, defaultVesselState, vesselSentence } from "../src/vessels/sentence";

type Seg = { field: string; text: string; choices: { id?: string; label: string; heading?: string }[]; current?: string; fixed?: boolean };
const link = (segments: unknown[], field: string) => segments.find((s) => typeof s === "object" && (s as Seg).field === field) as Seg | undefined;
const family = (key: string) => GROUP_DATA.families.find((f) => f.key === key)!;
const limits = { biomes: [], findBiome: () => undefined };
const BANDS = ["pre-industrial", "industrial and modern", "future"];

test("every group family's era link is the three bands, stored as the genre; the tradition link is untouched", () => {
  for (const f of GROUP_DATA.families) {
    const segments = groupSentence(DEFAULT_GROUP_STATE, f);
    const era = link(segments, "era")!;
    assert.deepEqual(era.choices.map((c) => c.id), f.key === "supernatural" ? BANDS.slice(0, 2) : BANDS, f.key);
    assert.equal(era.current, "pre-industrial");
    assert.equal(link(segments, "genre"), undefined, "no genre link any more");
    assert.equal(link(segments, "tradition")!.choices[0].id, "general", "the tribal tradition link stays");
    const next = chooseGroup(DEFAULT_GROUP_STATE, "era", "industrial and modern", f);
    assert.equal(next.genre, "modern");
  }
});

test("science fiction: the world is plain text; the scale link follows it", () => {
  const sciFi = groupSentence({ ...DEFAULT_GROUP_STATE, genre: "scifi" }, family("mystic"));
  const world = link(sciFi, "fantastic")!;
  assert.equal(world.fixed, true);
  assert.equal(world.text, "science fiction");
  const text = sciFi.map((s) => (typeof s === "string" ? s : s.text)).join("");
  assert.match(text, /of the future era, in a science fiction world at /);
});

test("supernatural courts: a modern world is contemporary fantasy alone, and choosing it switches the fantastic world on", () => {
  const f = family("supernatural");
  const modern = chooseGroup(DEFAULT_GROUP_STATE, "era", "industrial and modern", f);
  assert.equal(modern.fantastic, true);
  const world = link(groupSentence(modern, f), "fantastic")!;
  assert.deepEqual([world.fixed, world.text], [true, "contemporary fantasy"]);
});

test("bynames: culture from the lens, era band and world replace the genre links", () => {
  for (const module of ["epithets", "titles", "familyNames"] as const) {
    const segments = bynameSentence(DEFAULT_BYNAME_STATE, module);
    assert.equal(link(segments, "genre"), undefined);
    assert.deepEqual(link(segments, "era")!.choices.map((c) => c.id), BANDS);
    const culture = link(segments, "culture")!;
    assert.equal(culture.choices[0].id, "general");
    assert.ok(culture.choices.some((c) => c.heading === "British Isles"), "headed menu");
    assert.equal(culture.choices.find((c) => c.id === "norman-british")!.label, "Norman & British");
    assert.equal(culture.choices.find((c) => c.id === "anglo-saxon")!.label, "Anglo-Saxon");
  }
  // Choosing a culture away from General keeps working, and General resets the language.
  const norse = chooseByname({ ...DEFAULT_BYNAME_STATE, culture: "norse", language: "native" }, "culture", "general", "epithets");
  assert.deepEqual([norse.culture, norse.language], ["general", "english"]);
});

test("vehicles: era band and world links; technology and style stay; spacecraft's modern band sets technology S1", () => {
  const ships = vesselSentence(defaultVesselState("ships"), "ships");
  assert.deepEqual(link(ships, "era")!.choices.map((c) => c.id), BANDS);
  assert.ok(link(ships, "technology") && link(ships, "style"));
  const modern = chooseVessel({ ...defaultVesselState("spacecraft"), technology: "S3" }, "era", "industrial and modern", "spacecraft");
  assert.deepEqual([modern.genre, modern.technology], ["modern", "S1"]);
  assert.deepEqual(link(vesselSentence(defaultVesselState("spacecraft"), "spacecraft"), "era")!.choices.map((c) => c.id), BANDS.slice(1));
  // A modern world reads "realistic" (not "of the real world") in aircraft and land vehicles.
  assert.equal(link(vesselSentence(defaultVesselState("aircraft"), "aircraft"), "fantastic")!.text, "realistic");
});

test("realms: the six eras as now; the world is read from the genre, and choosing an era sets the genre", () => {
  const segments = realmSentence(DEFAULT_REALM_STATE, limits);
  assert.deepEqual(link(segments, "era")!.choices.map((c) => c.id), ["ancient", "medieval", "earlyModern", "modern", "nearFuture", "interstellar"]);
  assert.equal(link(segments, "genre"), undefined);
  const future = chooseRealm(DEFAULT_REALM_STATE, "era", "interstellar", () => undefined);
  assert.deepEqual([future.era, future.genre], ["interstellar", "scifi"]);
  const back = chooseRealm(future, "era", "modern", () => undefined);
  assert.deepEqual([back.era, back.genre], ["modern", "modern"]);
  // A stored era and genre that disagree are shown as they are until the era is changed.
  const odd = { ...DEFAULT_REALM_STATE, era: "medieval", genre: "scifi" as const };
  assert.equal(link(realmSentence(odd, limits), "era")!.current, "medieval");
  assert.equal(chooseRealm(odd, "era", "medieval", () => undefined).genre, "scifi");
  assert.equal(chooseRealm(odd, "era", "ancient", () => undefined).genre, "fantasy");
});
