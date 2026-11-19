// Second pass (brief §12 §4): famous figures (rulers, prophets, imams, legendary kings) that stood unflagged at the head of a list are replaced by ordinary attested names, or flagged (held to a fifth).
// Applied to src/data/people.json with the layout the file has; run again without effect.
import { readFileSync, writeFileSync } from "node:fs";
import { serialisePeople } from "../tier6a/peopleJson.mjs";
const F = new URL("../../src/data/people.json", import.meta.url);
const j = JSON.parse(readFileSync(F, "utf8"));
const R = (list, ordinary) => { const o = ordinary.split("|"); return Object.fromEntries(list.split("|").map((n, i) => [n, o[i % o.length]])); };
/** culture/period/sex → { famous name: ordinary name } */
const REPLACE = {
  "egyptian/historic/male": R("Seti|Khafre|Menkaure|Djoser|Senusret|Amenemhat|Ahmose|Merneptah|Psamtik|Necho|Taharqa|Piye|Horemheb|Imhotep", "Amenemope|Paneb|Kha|Userhat|Nebamun|Ipuy|Rekhmire|Ramose|Pay|Amenemhab|Meryre|Neferhotep|Tjay|Pahery"),
  "egyptian/historic/female": R("Meritaten|Sobekneferu|Nitocris|Merneith|Khentkaus|Ahhotep|Mutnodjmet|Henutmire|Tuya|Bintanath|Arsinoe|Berenice|Tausret|Meresankh|Hetepheres|Nofret|Neferura|Satiah|Kiya|Henutsen", "Nebet|Henut|Tabes|Takhat|Meryt|Tentamun|Nubkhas|Webkhet|Taimhotep|Isetweret|Wabet|Senebhenas|Tamit|Shepset|Nubemhat|Tanefret|Meret|Rennefer|Amenemipet|Ankhet"),
  "ethiopian/historic/male": R("Yohannes|Susenyos|Fasilides|Iyasu|Naod|Eskender|Lebna Dengel|Amda Seyon|Yekuno Amlak|Sarsa Dengel|Baeda Maryam|Gebre Mesqel|Tekle Haymanot", "Alemayehu|Ayele|Bereket|Berhanu|Fikre|Gashaw|Habtamu|Kebede|Lemma|Melaku|Negash|Sisay|Teshome"),
  "bantu/historic/male": R("Mpande|Dinuzulu|Sekhukhune|Khama|Sobhuza|Lobengula|Mswati|Mwanga|Kamanya|Chwa|Kimera|Hintsa|Sandile|Maqoma|Ngqika|Phalo|Mohlomi|Lerotholi|Letsie|Makaba|Sechele|Soshangane|Zwangendaba|Mzila|Mutota", "Themba|Mandla|Bheki|Mduduzi|Sifiso|Zolani|Thabo|Tshepo|Kabelo|Kato|Wasswa|Mukasa|Nsubuga|Mulenga|Chanda|Kasonde|Banda|Phiri|Tendai|Farai|Kudzai|Tafara|Nhamo|Simba|Chengetai"),
  "west-african/historic/male": R("Agaja|Ghezo|Glele|Behanzin|Ewuare|Esigie|Orhogbua|Prempeh|Ahmadu", "Adebayo|Babatunde|Olumide|Chukwuemeka|Ifeanyi|Nwankwo|Okonkwo|Obiora|Seydou"),
  "arabic/historic/male": { Harun: "Rashid", Mansur: "Nasser" },
  "persian/historic/male": { Khosrow: "Kamran" },
};
/** culture/period/sex → names to flag as famous (they take the place at the end of the list) */
const FLAG = { "arabic/historic/male": ["Muhammad", "Husayn"], "persian/historic/male": ["Jamshid"] };
let changed = 0;
for (const [key, map] of Object.entries(REPLACE)) {
  const [c, p, s] = key.split("/");
  const list = j.cultures[c][p][s];
  const have = new Set(list.map((e) => e[0].toLowerCase()));
  for (const e of list) if (map[e[0]] && !have.has(map[e[0]].toLowerCase())) { have.add(map[e[0]].toLowerCase()); e[0] = map[e[0]]; changed++; }
}
for (const [key, names] of Object.entries(FLAG)) {
  const [c, p, s] = key.split("/");
  const list = j.cultures[c][p][s];
  const take = list.filter((e) => names.includes(e[0]));
  const rest = list.filter((e) => !names.includes(e[0]));
  for (const e of take) { e[2] = "r"; e[1] = Math.min(e[1], 2); }
  j.cultures[c][p][s] = [...rest, ...take];
  changed += take.length;
}
// The flagged names at the end stay at most a fifth of a list (the rule of the people tables): the oldest flagged are demoted to ordinary names if there are more.
for (const [c, per] of Object.entries(j.cultures)) for (const [p, t] of Object.entries(per)) for (const s of ["male", "female"]) {
  const list = t[s];
  while (list.filter((e) => e[2] === "r").length * 5 > list.length) { const e = list.find((x) => x[2] === "r"); e[2] = ""; if (e.length === 3 && !e[2]) e.length = 2; }
}
writeFileSync(F, serialisePeople(j));
console.log("changed", changed);
