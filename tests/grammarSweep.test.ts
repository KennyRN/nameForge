// Second pass (brief §12 §6): the grammar faults of the first batch's output, each swept over every culture of every module at seeds 1 to 5,
// with the people link on placeholders (the default) and on real. One sweep feeds every pattern.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { visitStates } from "./helpers/bracketSweep";

interface Hit {
  module: string;
  culture: string;
  text: string;
}
const names = (r: unknown): string[] => ((r as { names?: unknown[]; rows?: unknown[] }).names ?? (r as { rows?: unknown[] }).rows ?? []).map((n) => (typeof n === "string" ? n : (n as { text?: string; name?: string }).text ?? (n as { name?: string }).name ?? ""));

const BATCH_CULTURES = new Set(["turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african", "steppe", "arabic-persian"]);
const COMMON = "Lake|Sky|Flood|Forest|Coast|Sea|Mountain|River|Storm|Harvest|Hearth|Earth|Wind|Night";
const PLACE_NOUN = "Mountain|Valley|Temple|Lake|River|Hill|Spring|Well|Isle|Island|Plain|Garden|Tower|Fort|Castle|Gate|Cape|Bay|Cave|Forest|Wood|Sea|City|Town|Camp|Citadel|Fortress|Landing|Harbour|Bridge|Pass|Peak|Ridge|Field|Stone|Dam|Mine|Quarry|Oasis|Desert|Dune|Steppe|Marsh|Mound|Pool|Fountain|Canal|Port|Village";
const FORMS = "Kingdom|Empire|Province|Sultanate|Emirate|Caliphate|Khanate|Khaganate|Duchy|Dukedom|Principality|Realm|Domain|Federation|Republic|Confederation|Confederacy|County|Lordship|Imamate|Commonwealth|Protectorate|Dominion|Shahdom|Satrapy";
const ADJECTIVES = "Generous|Swift|Noble|Wise|Bold|Brave|Great|Strong|Fair|Just|Kind|Good|Wild|Fierce|Mighty|Holy|Proud|Gentle|Humble|Clever|Cunning|Valiant|Magnificent|Fearless|Merciful|Bright|Lucky|Old|Young|Pious|Victorious";

const PATTERNS = {
  // "Spring Keeper of Lake", "Well Lady of Sky", "Warden of Forest", "The Sultanate of Coast", "Nawab of Mountain of Rashid".
  article: { modules: ["deities", "realms", "titles", "epithets", "familyNames"], re: new RegExp(`\\b(?:of|to|in|at|by|from) (?:(?:${COMMON})(?= of\\b| and\\b|,|$)|(?:${PLACE_NOUN}) of )`) },
  // "SunMare Lady", "HerdsEarth Mother", "MountainSky Father" (a Mac or Mc surname is one word by its own rule).
  glued: { modules: null, re: /[a-z]{2,}[A-Z][a-z]/, strip: /\b(?:Mac|Mc)[A-Z][a-z]+/g },
  // "Province of Sultanate of the Lowlands", "Khanate of Republic Square".
  nested: { modules: ["realms"], re: new RegExp(`(?:^|[^A-Za-z])(?:${FORMS}) of (?:the )?(?:[A-Z][A-Za-z']+ )*(?:${FORMS})(?:[^A-Za-z]|$)`) },
  // "Upper Kingdom Beyond The Islands".
  cased: { modules: null, re: /[a-z] The\b/ },
  // "Generous the Noble", "Swift the Noble": an adjective standing as the name.
  adjective: { modules: ["epithets"], re: new RegExp(`^(?:${ADJECTIVES}|Unifier|Long-Legged) the `) },
  // "Crowned Gold Piece Bright", a bare "Sword".
  money: { modules: ["money"], re: /Piece (?:Bright|Dark|Red|Blue|Grey|White|Black|Green)$|^(?:Sword|Spear|Axe|Bow|Arrow|Shield|Hammer|Mace|Dagger|Lance|Knife|Club)$/ },
  // "Pennyweight" in Arabic, "Ruble" in Mongol: an English weight or a Russian coin among the batch's own cultures.
  coin: { modules: ["money"], re: /\b(?:Pennyweight|Ruble|Rouble)\b/, only: BATCH_CULTURES },
  // "Chiefdom of At the Forest": a place that starts like a sentence, after "of".
  atthe: { modules: null, re: /\b(?:of|to|from|in) (?:At the|Where) /, only: new Set(["turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african", "steppe", "arabic-persian", "french", "italian", "spanish", "portuguese", "roman", "greek", "byzantine", "iberian", "greek-byzantine", "slavic", "dutch", "indian", "chinese", "japanese", "korean"]) },
  // "Proud Month of Mushroom Fair", "Free Dike Mending Time Month": a festival or a season's work where a month stem belongs.
  calendar: { modules: ["calendars", "sky"], re: /(?:Month|Moon) of [A-Za-z' -]*(?:Fair|Time)$|(?:Time|Fair) (?:Month|Moon)\b/, only: new Set(["turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african", "steppe", "arabic-persian", "french", "italian", "spanish", "portuguese", "roman", "greek", "byzantine", "iberian", "greek-byzantine", "slavic", "dutch", "indian", "chinese", "japanese", "korean"]) },
  // Peat cut where there is none (the four nations, English, Dutch, German, Scandinavian and Norse cut it).
  peat: { modules: ["calendars", "sky"], re: /Peat/, only: new Set(["turkic", "mongol", "arabic", "persian", "egyptian", "ethiopian", "bantu", "west-african", "steppe", "arabic-persian", "french", "italian", "spanish", "portuguese", "roman", "greek", "byzantine", "iberian", "greek-byzantine", "slavic", "indian", "chinese", "japanese", "korean"]) },
  // 6c Part A §6: no colonial authority for a culture that neither colonised nor was colonised in the batch's sense.
  colonial: { modules: ["realms"], re: /Colonial Authority/, only: new Set(["mongol", "persian", "egyptian", "bantu", "turkic", "arabic", "ethiopian", "steppe", "arabic-persian", "slavic", "roman", "greek", "byzantine"]) },
  // "Cafe Chantant".
  cafe: { modules: ["inns"], re: /Cafe Chantant/ },
} as const;
type Key = keyof typeof PATTERNS;

let found: Map<Key, Hit[]> | undefined;
const sweep = (): Map<Key, Hit[]> => {
  if (found) return found;
  found = new Map();
  for (const people of ["placeholders", "real"] as const) {
    visitStates({ count: 12, kinds: false, eras: ["AN", "MD", "MO", "NF", "IS"], people }, (where, make) => {
      const [moduleWord, culture] = where.split(" ");
      const module = moduleWord.split(".")[0];
      for (let seed = 1; seed <= 5; seed++) {
        let texts: string[];
        try {
          texts = names(make(seed));
        } catch {
          continue; // a state the module doesn't offer
        }
        for (const text of texts) {
          for (const [key, p] of Object.entries(PATTERNS) as [Key, (typeof PATTERNS)[Key]][]) {
            if (p.modules && !(p.modules as readonly string[]).includes(module)) continue;
            if ("only" in p && !p.only.has(culture)) continue;
            const checked = "strip" in p ? text.replace(p.strip, "") : text;
            if (p.re.test(checked)) {
              const list = found!.get(key) ?? [];
              found!.set(key, list);
              if (!list.some((h) => h.text === text && h.culture === culture)) list.push({ module, culture, text });
            }
          }
        }
      }
    });
  }
  return found;
};
const report = (key: Key): string => (sweep().get(key) ?? []).slice(0, 8).map((h) => `${h.module} ${h.culture}: ${h.text}`).join(" | ");

test("grammar: a common noun after of takes its article (deities, realms, titles, epithets, family names)", () => {
  assert.equal(sweep().get("article")?.length ?? 0, 0, report("article"));
});
test("grammar: words are not run together (SunMare Lady)", () => {
  assert.equal(sweep().get("glued")?.length ?? 0, 0, report("glued"));
});
test("grammar: a realm is not a realm of a realm", () => {
  assert.equal(sweep().get("nested")?.length ?? 0, 0, report("nested"));
});
test("grammar: no capital The in the middle of a name", () => {
  assert.equal(sweep().get("cased")?.length ?? 0, 0, report("cased"));
});
test("grammar: an epithet is not an adjective standing as the name", () => {
  assert.equal(sweep().get("adjective")?.length ?? 0, 0, report("adjective"));
});
test("grammar: no broken money names (a colour after the piece, a bare weapon)", () => {
  assert.equal(sweep().get("money")?.length ?? 0, 0, report("money"));
});
test("grammar: no Pennyweight, Ruble or Rouble in the batch's own cultures' money", () => {
  assert.equal(sweep().get("coin")?.length ?? 0, 0, report("coin"));
});
test("grammar: no place starting At the or Where after of", () => {
  assert.equal(sweep().get("atthe")?.length ?? 0, 0, report("atthe"));
});
test("grammar: no month named for a fair or a time", () => {
  assert.equal(sweep().get("calendar")?.length ?? 0, 0, report("calendar"));
});
test("grammar: no peat cutting outside the cultures that cut peat", () => {
  assert.equal(sweep().get("peat")?.length ?? 0, 0, report("peat"));
});
test("grammar: no colonial authority outside the cultures that colonised or were colonised", () => {
  assert.equal(sweep().get("colonial")?.length ?? 0, 0, report("colonial"));
});
test("grammar: no Cafe Chantant in any inn", () => {
  assert.equal(sweep().get("cafe")?.length ?? 0, 0, report("cafe"));
});
