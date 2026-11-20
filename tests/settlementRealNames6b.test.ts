// 6c prompt Part A §3: no 6b settlement name is a real, famous place or group, and none holds a god of its culture's own lore.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSettlementNames } from "../src/settlement/names";
import { WORLD_CULTURES } from "../src/world/engine";
import { isRealGroup, isRealPlace } from "../src/realPlaces";

const GODS = ["Quetzalcoatl", "Huitzilopochtli", "Kukulkan", "Itzamna", "Inti", "Viracocha", "Pachamama", "Tangaroa", "Pele", "Tlaloc", "Chaac", "Osun", "Ogun", "Shango", "Yemoja", "Faro", "Nyame", "Olokun", "Oya", "Sakpata", "Anubis", "Sekhmet", "Ptah", "Sobek", "Antony", "Ptahhotep", "Kagemni", "Tabor", "Cyrus", "Darius", "Xerxes", "Shiva", "Vishnu", "Rama", "Krishna", "Durga", "Lakshmi", "Parvati", "Ganesha", "Surya", "Agni", "Varuna", "Kali", "Hanuman", "Hachiman", "Inari", "Tenjin", "Amaterasu", "Susanoo", "Kompira", "Ebisu", "Benten", "Kannon", "Daikoku"];
test("6b and 6c settlement names: no real foundation, famous figure or god of the culture's lore", () => {
  const bad: string[] = [];
  for (const c of ["turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african", "indian", "chinese", "japanese", "korean", "aztec", "maya", "andean", "polynesian", "american"]) {
    const world = WORLD_CULTURES.find((w) => w.id === c);
    if (!world) continue;
    for (const era of world.eras) for (let seed = 1; seed <= 60; seed++) {
      for (const n of generateSettlementNames({ setting: "native", culture: c, era: era.id, size: "any", count: 12, seed, wilds: false } as never).names as { text?: string }[]) {
        const t = n.text ?? String(n);
        if (isRealPlace(t) || isRealGroup(t) || GODS.some((g) => new RegExp(`(^|[^A-Za-z])${g}($|[^A-Za-z])`).test(t))) bad.push(`${c}: ${t}`);
      }
    }
  }
  assert.deepEqual([...new Set(bad)].slice(0, 10), []);
});
