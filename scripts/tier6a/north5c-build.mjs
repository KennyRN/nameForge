// Brief 6a: assembles the 5c content of the batch's cultures: the words (north5c-words*.mjs), Portuguese and Byzantine written in their own words (pt-bz-words.mjs), the mixes, adjectives, styles and ranks.
import { MIXES6, NEW6 } from "./north5c-words.mjs";
import * as A from "./north5c-words.mjs";
import { W2 } from "./north5c-words2.mjs";
import { PT5C, BZ5C } from "./pt-bz-words.mjs";

const W = { ...A.W6, ...W2 };
for (const m of Object.keys(W)) {
  if (!PT5C[m] || !BZ5C[m]) throw new Error(`no own Portuguese or Byzantine words for ${m}`);
  W[m].portuguese = PT5C[m];
  W[m].byzantine = BZ5C[m];
}
// A word is never twice in a list after the substitutions.
const dedupe = (s) => s.split(";").map((l) => { const seen = new Set(); return l.split("|").filter((w) => (seen.has(w.toLowerCase()) ? false : (seen.add(w.toLowerCase()), true))).join("|"); }).join(";");
for (const m of Object.keys(W)) for (const c of ["portuguese", "byzantine"]) W[m][c] = dedupe(W[m][c]);
// The mixes: four words per list, the first, fourth, ninth and tenth of the first half's.
const four = (s) => s.split(";").map((l) => { const w = l.split("|"); return [w[0], w[3], w[8], w[9]].join("|"); }).join(";");
for (const m of Object.keys(W)) {
  W[m].iberian = four(W[m].spanish);
  W[m]["greek-byzantine"] = four(W[m].greek);
}
const T = (a, b, c) => `${a};${b};${c}`;
const HON = "Majesty|Grace|Worship|Excellency|Honour|Reverence|Eminence|Serenity|Splendour|Renown";
W.titles.roman = T("Praetor|Magistrate|Master|Elder|Captain|Centurion|Quaestor|Censor|Curator|Pontiff", "Chamberlain|Treasurer|Warden|Bailiff|Auditor|Aedile|Procurator|Steward|Herald|Notary", HON);
W.titles.greek = T("Magistrate|Master|Elder|Captain|Strategist|Herald|Ephor|Prytanis|Judge|Steward", "Chamberlain|Treasurer|Warden|Bailiff|Auditor|Superintendent|Clerk|Courier|Sergeant|Notary", HON);
W.titles.slavic = T("Starosta|Magistrate|Master|Elder|Captain|Steward|Magnate|Sotnik|Burgher|Warden", "Chamberlain|Treasurer|Bailiff|Auditor|Coroner|Falconer|Almoner|Sergeant|Notary|Herald", HON);
for (const c of ["spanish", "french", "italian"]) W.titles[c] = W.titles[c].split("Constable").join("Sergeant");
W.titles.dutch = W.titles.dutch.split("Regent").join("Syndic").split("Dike Reeve").join("Dike Warden").split("Constable").join("Sergeant");
for (const c of ["iberian", "greek-byzantine"]) W.titles[c] = four(W.titles[c === "iberian" ? "spanish" : "greek"]);
export const WORDS6 = W;
export const ADJ6 = {
  spanish: "Old|Grey|Golden|Bright|Fair|Noble|Silent|Proud|Green|Royal", portuguese: "Old|Grey|Golden|Bright|Fair|Noble|Silent|Blessed|Green|Royal",
  french: "Old|Grey|Golden|Bright|Fair|Noble|Silent|Proud|Green|Royal", italian: "Old|Grey|Golden|Bright|Fair|Noble|Silent|Proud|Green|Great",
  dutch: "Old|Grey|Golden|Bright|Fair|Free|Silent|Stout|Green|Blue", roman: "Old|Grey|Golden|Bright|Fair|Noble|Silent|Stern|Green|Eternal",
  greek: "Old|Grey|Golden|Bright|Fair|Noble|Silent|Wise|Violet|Sacred", byzantine: "Old|Grey|Golden|Bright|Fair|Holy|Silent|Wise|Purple|Imperial",
  slavic: "Old|Grey|Golden|Bright|Fair|Free|Silent|Stout|Green|White", iberian: "Old|Grey|Golden|Noble", "greek-byzantine": "Old|Grey|Golden|Wise",
};
export const STYLE6 = { spanish: "of", portuguese: "pt", french: "of", italian: "of", dutch: "adj", roman: "of", greek: "of", byzantine: "bz", slavic: "adj", iberian: "of", "greek-byzantine": "of" };
export const RANKS6 = {
  spanish: "King/Queen|Duke/Duchess|Count/Countess|Marquis/Marquise|Hidalgo/Lady|Infante/Infanta", portuguese: "King/Queen|Duke/Duchess|Count/Countess|Marquis/Marquise|Fidalgo/Lady|Infante/Infanta",
  french: "King/Queen|Duke/Duchess|Count/Countess|Marquis/Marquise|Baron/Baroness|Dauphin/Dauphine", italian: "Doge/Dogaressa|Duke/Duchess|Count/Countess|Marquis/Marquise|Prince/Princess|Baron/Baroness",
  dutch: "Stadtholder/Lady|Duke/Duchess|Count/Countess|Baron/Baroness|Prince/Princess|Burgomaster/Lady", roman: "Emperor/Empress|Consul/Lady|Senator/Lady|Prefect/Lady|Tribune/Lady|Legate/Lady",
  greek: "King/Queen|Archon/Lady|Strategos/Lady|Tyrant/Lady|Satrap/Lady|Ephor/Lady", byzantine: "Emperor/Empress|Despot/Despina|Logothete/Lady|Exarch/Lady|Eparch/Lady|Domestic/Lady",
  slavic: "Tsar/Tsarina|Prince/Princess|Boyar/Boyarina|Voivode/Lady|Hetman/Lady|Grand Duke/Grand Duchess", iberian: "King/Queen|Duke/Duchess|Count/Countess|Marquis/Marquise", "greek-byzantine": "Emperor/Empress|King/Queen|Archon/Lady|Despot/Despina",
};
export const ALL6 = [...NEW6, ...MIXES6];
