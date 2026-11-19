// Brief 6b: assembles the 5c content of the batch's cultures: the words (north5c-words.mjs, by culture), moved into the module-by-culture layout the maker reads, the tags
// written inline (`Word@AN-MD*`) moved into the tag dictionary, the two mixes (four words per list, from the first half), adjectives, styles and rank pairs.
import { CW, MIXES6B, NEW6B } from "./north5c-words.mjs";

// The order of a list means nothing here, and two siblings drawing the same position of the same list would give the same word: each culture of a sibling group turns its lists by a step of its own.
const TURN = { turkic: 0, mongol: 3, arabic: 1, persian: 4, egyptian: 6, ethiopian: 8, bantu: 2, "west-african": 5 };
const turn = (culture, text) => text.split(";").map((l, i) => { const w = l.split("|"); const k = (TURN[culture] + 2 * i) % w.length; return [...w.slice(k), ...w.slice(0, k)].join("|"); }).join(";");
const four = (s) => s.split(";").map((l) => { const w = l.split("|"); return [w[0], w[3], w[8], w[9]].join("|"); }).join(";");
export const WORDS6B = {};
export const TAGS6B = {};
const split = (module, culture, text) => {
  const tags = {};
  const clean = text.split(";").map((l) => l.split("|").map((w) => {
    const i = w.lastIndexOf("@");
    if (i < 0) return w;
    tags[w.slice(0, i)] = w.slice(i + 1);
    return w.slice(0, i);
  }).join("|")).join(";");
  ((TAGS6B[module] ??= {})[culture] = tags);
  return clean;
};
for (const culture of NEW6B) for (const [module, text] of Object.entries(CW[culture])) (WORDS6B[module] ??= {})[culture] = turn(culture, split(module, culture, text));
for (const module of Object.keys(WORDS6B)) {
  WORDS6B[module].steppe = four(WORDS6B[module].turkic);
  WORDS6B[module]["arabic-persian"] = four(WORDS6B[module].arabic);
  // A mix carries the tags of the words it keeps.
  TAGS6B[module].steppe = TAGS6B[module].turkic;
  TAGS6B[module]["arabic-persian"] = TAGS6B[module].arabic;
}
// Words of timeless sense tagged to the three eras before the modern ones, so that each era holds six words of the culture's own without the shared pools' English ones (a bishopric, a hundred moot).
const TIMELESS = {
  realms: ["Realm", "Domain", "Province", "Heartland", "Plains", "Rivers", "Marches", "Uplands", "Lowlands", "Highlands", "Coast", "Kinsmen", "Free Men", "Shepherds", "Marchers", "Savannas", "Lakes", "Deserts", "Steppes", "Gardens", "Oases", "Delta", "Escarpment", "Mountains", "Lagoons", "Cataracts", "Nile Valley", "Sahel", "Rift", "Lakelands", "Peninsula", "Plateau"],
  powerFactions: ["Council", "Assembly", "Court", "Estates", "League", "Faction"],
  familyNames: ["Kinsman", "Heir", "Descendant", "Kindred", "Cousin"],
};
for (const [module, words] of Object.entries(TIMELESS)) {
  for (const culture of Object.keys(TAGS6B[module] ?? {})) {
    const lists = WORDS6B[module][culture].split(";").map((l) => l.split("|"));
    for (const w of lists.flat()) if (words.includes(w) && !TAGS6B[module][culture][w]) TAGS6B[module][culture][w] = "AN-EM";
  }
}
export const ADJ6B = {
  turkic: "Old|Grey|Golden|Bright|Fair|Noble|Silent|Swift|Blue|Great", mongol: "Old|Grey|Golden|Bright|Fair|Eternal|Silent|Swift|Blue|Wide",
  arabic: "Old|Grey|Golden|Bright|Fair|Noble|Silent|Blessed|Green|Great", persian: "Old|Grey|Golden|Bright|Fair|Royal|Silent|Fragrant|Turquoise|Great",
  egyptian: "Old|Grey|Golden|Bright|Fair|Sacred|Silent|Eternal|Green|Great", ethiopian: "Old|Grey|Golden|Bright|Fair|Holy|Silent|Highland|Green|Great",
  bantu: "Old|Grey|Golden|Bright|Fair|Wise|Silent|Mighty|Green|Great", "west-african": "Old|Grey|Golden|Bright|Fair|Wise|Silent|Mighty|Green|Great",
  steppe: "Old|Grey|Golden|Eternal", "arabic-persian": "Old|Grey|Golden|Blessed",
};
// Frame styles: each sibling takes a style of its own (the shapes of a name differ, so the same words do not make the same names).
export const STYLE6B = { turkic: "adj", mongol: "cp", arabic: "of", persian: "poss", egyptian: "cp", ethiopian: "of", bantu: "poss", "west-african": "adj", steppe: "of", "arabic-persian": "of" };
export const RANKS6B = {
  turkic: "Sultan/Sultana|Khan/Khatun|Bey/Khanum|Pasha/Lady|Emir/Emira|Marcher Lord/Lady", mongol: "Khan/Khatun|Great Khan/Khatun|Prince/Princess|Lord/Lady|Hero/Lady|Chieftain/Lady",
  arabic: "Caliph/Lady|Sultan/Sultana|Emir/Emira|Sheikh/Sheikha|Vizier/Lady|Imam/Lady", persian: "Shah/Shahbanu|Satrap/Lady|Prince/Princess|Khan/Khanum|Vizier/Lady|Mirza/Lady",
  egyptian: "Pharaoh/Queen|Vizier/Lady|Sultan/Sultana|Khedive/Lady|Pasha/Lady|Bey/Lady", ethiopian: "Emperor/Empress|Ras/Lady|Negus/Queen|Commander of the Gate/Lady|Vanguard Leader/Lady|Abba/Lady",
  bantu: "King/Queen|Chief/Lady|Paramount Chief/Lady|Headman/Lady|Elder/Lady|Induna/Lady", "west-african": "Emperor/Lady|Paramount King/Lady|Emir/Emira|King/Queen Mother|Warlord/Lady|Oba/Lady",
  steppe: "Sultan/Sultana|Khan/Khatun|Bey/Lady|Pasha/Lady", "arabic-persian": "Caliph/Lady|Sultan/Sultana|Emir/Emira|Sheikh/Sheikha",
};
export { MIXES6B, NEW6B };
