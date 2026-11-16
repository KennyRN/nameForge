// Brief 6a: assembles the 5d content of the batch's cultures (see north5d-words.mjs).
import { W5D } from "./north5d-words.mjs";
const sub = (text, pairs) => pairs.reduce((t, [a, b]) => t.split(a).join(b), text);
const PT = [["Maravedi", "Cruzado"], ["Doubloon", "Dobra"], ["Peso", "Tostao"], ["Escudo", "Vintem"], ["Piece of Eight", "Portague"], ["Blanca", "Ceitil"], ["Cuarto", "Leal"], ["Peseta", "Moidore"], ["Pillars", "Armillary Sphere"], ["Pomegranate", "Cork Oak"], ["Reconquest", "Discoveries"], ["Navarre", "Brazil"], ["Inquisition", "Voyages"], ["Wool", "Cork"], ["Vintage", "Port"], ["Bull Run", "Fado Night"], ["Moors", "Navigators"], ["Moor", "Pirate"], ["Pilgrim's Road", "Pilgrim's Way"], ["Rosary", "Caravel"], ["Cedar", "Cork"], ["Romance", "Epic"]];
const BZ = [["Drachma", "Gold Coin"], ["Obol", "Miliaresion"], ["Stater", "Gold Piece"], ["Tetradrachm", "Solidus"], ["Talent", "Follis"], ["Mina", "Keration"], ["Hemiobol", "Tetarteron"], ["Didrachm", "Histamenon"], ["Oboloi", "Folleis"], ["Lepton", "Noummion"], ["Owl", "Cross"], ["Wreath", "Halo"], ["Helmet", "Throne"], ["Persians", "Saracens"], ["League", "Themes"], ["Tyrants", "Despots"], ["Tyrant", "Despot"], ["Games", "Hippodrome Games"], ["Mystery Night", "Vigil Night"], ["Lyre", "Icon"], ["Histories", "Chronicles"], ["Poets", "Hymnists"], ["Scroll", "Codex"], ["Heroes", "Martyrs"], ["Cities", "Fortresses"], ["Sacred", "Holy"]];
const dedupe = (s) => s.split(";").map((l) => { const seen = new Set(); return l.split("|").filter((w) => (seen.has(w.toLowerCase()) ? false : (seen.add(w.toLowerCase()), true))).join("|"); }).join(";");
const four = (s) => s.split(";").map((l) => { const w = l.split("|"); return [w[0], w[3], w[8], w[9]].join("|"); }).join(";");
for (const m of Object.keys(W5D)) {
  W5D[m].portuguese = dedupe(sub(W5D[m].spanish, PT));
  W5D[m].byzantine = dedupe(sub(W5D[m].greek, BZ));
  W5D[m].iberian = four(W5D[m].spanish);
  W5D[m]["greek-byzantine"] = four(W5D[m].greek);
}
export const WORDS5D = W5D;
