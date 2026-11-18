// Brief 6b §B5: the real-name list holds the batch's well-known places, events, objects, groups, realms and craft (150 or more added); the signature words and fixed names of
// the batch are checked against it by tests/tier6aRealNames.test.ts (the batch's keys are in TIER6A_KEYS).
import { test } from "node:test";
import assert from "node:assert/strict";
import realPlaces from "../src/data/real-places.json";
import { isRealGroup, isRealPlace } from "../src/realPlaces";

test("6b: the real-name list holds the batch's well-known names, at least 150 of them", () => {
  const added = ["Anatolia", "Gobi Desert", "Lake Baikal", "Empty Quarter", "Wadi Rum", "Persian Gulf", "Mount Damavand", "Valley of the Kings", "Danakil Depression", "Lake Victoria", "Okavango Delta", "Fouta Djallon",
    "Istanbul", "Samarkand", "Karakorum", "Mecca", "Isfahan", "Persepolis", "Luxor", "Lalibela", "Great Zimbabwe", "Timbuktu", "Kumasi",
    "Ottoman Empire", "Golden Horde", "Mongol Empire", "Sassanid Empire", "Mali Empire", "Zulu Kingdom", "Battle of Manzikert", "Battle of Adwa", "Hagia Sophia", "Peacock Throne", "Rosetta Stone", "Kebra Nagast", "Golden Stool", "Benin Bronzes"];
  for (const name of added) assert.ok(isRealGroup(name) || isRealPlace(name), name);
  const lists = realPlaces as unknown as { places: string[]; towns: string[]; groups: string[] };
  assert.ok(lists.places.length + lists.towns.length + lists.groups.length >= 614 + 238 + 150, "the lists grew by 150 or more since 6a (852 before the batch)");
});
