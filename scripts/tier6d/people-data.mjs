// Brief 6d B1: the people tables of Polynesian, Aztec, Maya, Andean and American, rewritten. Ordinary attested names lead each list; rulers, generals, sages and founders are flagged `^r` and held last (a fifth or less).
// People only: no god's name. An entry may carry its own era tags after `@` ("Francisco@EM ST" is a colonial baptismal name). Surnames, holy forms, ruler forms and the colonial saint list stay as they were.
// Polynesian names keep each language's standard marks (Maori macrons; Hawaiian kahako and okina written as the okina U+02BB); Spanish given names are written as the existing Spanish tables write them, without accents.
// SPECIALIST REVIEW: the Aztec, Maya and Andean historic lists (the Nahuatl, Yucatec and Quechua names, and the numeral-and-day-sign forms) and the Polynesian lists should be checked by a speaker; see docs/people-tables.md.
import { readFileSync } from "node:fs";
const old = JSON.parse(readFileSync(new URL("../../src/data/people.json", import.meta.url), "utf8")).cultures;
const names = (table) => table.map((e) => e[0]);
const colonial = (list) => list.split("|").map((n) => `${n}@EM ST`).join("|");

const NUM = ["Ce", "Ome", "Yei", "Nahui", "Macuilli", "Chicuace", "Chicome", "Chicuei", "Chiucnahui", "Matlactli"];
const day = (signs, start) => signs.split("|").map((s, i) => `${NUM[(start + i) % 10]} ${s}`).join("|");

export const POLYNESIAN = {
  historic: {
    male: "Kekoa|Hōne|Sione|Iosefa|Teiva|Makoa|Wiremu|Siaosi|Ioane|Teva|Kamaka|Rāwiri|Tevita|Filipo|Manuarii|Kalani|Hēmi|Viliami|Tavita|Heimana|Kawika|Eruera|Sāmiuela|Teiki|ʻIkaika|Pita|Mosese|Hoani|Keoni|Tāmati|Kamehameha^r|Pōmare^r|Hongi Hika^r|Taufaʻāhau^r",
    female: "Leilani|Mere|Seini|Sina|Tiare|Nalani|Aroha|Lupe|Losa|Hinano|Malia|Huia|ʻEmeli|Tala|Moeata|Pua|Kiri|Sela|Ioana|Vaiana|Keala|Rina|Kalolaine|Heiata|Noelani|Ruiha|Sisilia|Tehani|ʻAna|Ngaio|Kaʻahumanu^r|Liliʻuokalani^r|Kapiʻolani^r|Sālote^r",
    regnalMale: "Kamehameha|Liholiho|Kauikeaouli|Lunalilo|Kalākaua|Pōmare|Tāwhiao|Taufaʻāhau", regnalFemale: "Liliʻuokalani|Kapiʻolani|Emma|Sālote|Kaʻahumanu|Kīnaʻu|Kaʻiulani|Pauahi",
    holy: "Te Kooti|Te Whiti|Tohu|Rua Kenana|Wiremu Rātana|Papahurihia|Titokowaru|Damien|Marianne|Kapihe|Kamakau|Haumata",
  },
  modern: {
    male: "Kekoa|Hōne|Sione|Iosefa|Teiva|Makoa|Wiremu|Siaosi|Ioane|Teva|Kamaka|Rāwiri|Tevita|Filipo|Manuarii|Kalani|Hēmi|Viliami|Tavita|Heimana|Kawika|Eruera|Sāmiuela|Teiki|ʻIkaika|Pita|Mosese|Hoani|Keoni|Tāmati",
    female: "Leilani|Mere|Seini|Sina|Tiare|Nalani|Aroha|Lupe|Losa|Hinano|Malia|Huia|ʻEmeli|Tala|Moeata|Pua|Kiri|Sela|Ioana|Vaiana|Keala|Rina|Kalolaine|Heiata|Noelani|Ruiha|Sisilia|Tehani|ʻAna|Ngaio",
    recentMale: "Kai|Nikau|Koa|Manaia|Kaimana|Keanu|Ariki|Mahaki|Isaia|Sefa|Ihaka|Tui|Tama|Kahu|Tipene|Taika",
    recentFemale: "Moana|Mahina|Kalea|Anahera|Kahurangi|Mereana|Maia|Ailani|Hinewai|Kiele|Alana|Hana|Marama|Kaia|Pania|Awhina",
    regnalMale: "Kamehameha|Liholiho|Kauikeaouli|Lunalilo|Kalākaua|Pōmare|Tāwhiao|Taufaʻāhau", regnalFemale: "Liliʻuokalani|Kapiʻolani|Emma|Sālote|Kaʻahumanu|Kīnaʻu|Kaʻiulani|Pauahi",
    holy: "Te Kooti|Te Whiti|Tohu|Rua Kenana|Wiremu Rātana|Papahurihia|Titokowaru|Damien|Marianne|Kapihe|Kamakau|Haumata",
  },
};

const SPANISH_M = "Jose|Juan|Miguel|Angel|Luis|Pedro|Jesus|Francisco|Carlos|Antonio|Manuel|Martin|Mateo|Alejandro|Rafael|Fernando|Ricardo|Eduardo|Raul|Sergio|Javier|Marcos|Hugo|Lucas|David|Jorge|Alberto|Roberto|Daniel|Gabriel";
const SPANISH_F = "Maria|Guadalupe|Juana|Rosa|Margarita|Francisca|Teresa|Ana|Luz|Carmen|Josefa|Gloria|Patricia|Leticia|Elena|Marta|Cristina|Silvia|Raquel|Lucia|Isabel|Catalina|Veronica|Dolores|Rocio|Alicia|Beatriz|Laura|Sofia|Claudia";
const BAPT_M = "Juan|Diego|Pedro|Francisco|Miguel|Martin|Antonio|Lucas|Mateo|Gaspar|Baltasar|Melchor|Cristobal|Felipe|Andres|Lorenzo|Marcos|Domingo";
const BAPT_F = "Maria|Isabel|Ana|Juana|Catalina|Francisca|Beatriz|Magdalena|Lucia|Marta|Luisa|Ines|Leonor|Dominga|Petrona|Rosa|Josefa|Ursula|Paula|Teresa|Rosario|Clara|Antonia";

export const AZTEC = {
  historic: {
    male: `Yaotl|Tochtli|Cuauhtli|Ocelotl|Cipactli|Mazatl|Itzcuin|Tecpatl|Quiahuitl|Ollin|Ce Acatl|Ome Tochtli|Chicome Xochitl|Yei Calli|Nahui Ollin|Macuilli Coatl|Chicuace Tecpatl|Chicuei Mazatl|Chiucnahui Cuauhtli|Matlactli Ocelotl|Moctezuma^r|Cuauhtemoc^r|Nezahualcoyotl^r|${colonial(BAPT_M)}`,
    female: `Xochitl|Citlalli|Quetzalli|Ameyalli|Nenetl|Cuicatl|Yolotl|Mixtli|Tlalli|Eloxochitl|Ome Xochitl|Yei Malinalli|Nahui Xochitl|Macuilli Malinalli|Chicuace Xochitl|Chicuei Malinalli|Tecuichpo^r|Chimalxochitl^r|Atotoztli^r|${colonial(BAPT_F)}`,
    holy: "Tlacaelel|Nezahualcoyotl|Tecayehuatzin|Ayocuan|Tochihuitzin|Tlaltecatzin|Cuauhtencoztli|Aquiauhtzin|Xayacamach|Juan Diego|Chimalpahin|Ixtlilxochitl",
  },
  modern: {
    male: SPANISH_M, female: SPANISH_F,
    recentMale: "Santiago|Sebastian|Emiliano|Leonardo|Diego|Dylan|Ollin|Yolotl|Mixtli|Axel|Iker|Ian|Matias|Thiago|Gael|Bruno",
    recentFemale: "Valentina|Camila|Ximena|Regina|Fernanda|Renata|Citlali|Itzel|Xochitl|Yaretzi|Ameyalli|Frida|Mariana|Victoria|Natalia|Luciana",
  },
};

// Maya: Yucatec and K'iche' day and numeral forms for the historic names (the 260-day count), the Christian names of each region for the modern table; the surnames the prompt names stay (Pech, Chi, Canul, Uc, Chan, Cocom, Xiu and the rest).
const MAYA_NUM = ["Jun", "Ka", "Ox", "Kan", "Ho", "Wak", "Wuk", "Waxak", "Bolon", "Lajun"];
const mayaDay = (signs, start) => signs.split("|").map((s, i) => `${MAYA_NUM[(start + i) % 10]} ${s}`).join("|");
export const MAYA = {
  historic: {
    male: `Balam|Kinich|Yaxun|Chan Balam|Kan Balam|Ek Balam|${mayaDay("Ben|Chuwen|Men|Kib|Eb|Ik|Lamat|Muluk|Ok|Kawak", 0)}|Pakal^r|Yax Pasaj^r|Tecun Uman^r|Kikab^r|${colonial(BAPT_M)}`,
    female: `Nicte|Zazil|Itzel|${mayaDay("Imix|Akbal|Chikchan|Manik|Etznab|Ix|Kimi|Kaban", 2)}|Sak K'uk'^r|Yohl Ik'nal^r|K'abel^r|${colonial(BAPT_F)}`,
    holy: "Chilam Balam|Napuc Tun|Nakuk Pech|Gaspar Chi|Chi|Chel|Xiu|Pech|Cocom|Canul|Cupul|May|Couoh",
  },
  modern: {
    male: "Juan|Pedro|Diego|Manuel|Miguel|Francisco|Mateo|Domingo|Marcos|Sebastian|Lucas|Jose|Antonio|Santiago|Andres|Tomas|Felipe|Gaspar|Baltasar|Cristobal|Lorenzo|Nicolas|Jorge|Carlos|Luis|Pablo|Alonso|Rafael|Esteban|Gregorio",
    female: "Maria|Juana|Rosa|Catarina|Ana|Margarita|Petrona|Magdalena|Rosario|Lucia|Dominga|Manuela|Isabel|Francisca|Teresa|Marta|Elena|Josefa|Carmen|Luisa|Agustina|Candelaria|Concepcion|Dolores|Angelina|Silvia|Patricia|Sofia|Guadalupe|Veronica",
    recentMale: "Santiago|Mateo|Sebastian|Emiliano|Diego|Leonardo|Daniel|Balam|Kinich|Angel|Dylan|Ian|Thiago|Gael|Matias|Bruno",
    recentFemale: "Valentina|Camila|Sofia|Ximena|Itzel|Nicte|Zazil|Regina|Renata|Fernanda|Frida|Alejandra|Mariana|Natalia|Victoria|Luciana",
  },
};

export const ANDEAN = {
  historic: {
    male: `Waman|Amaru|Puma|Titu|Illari|Atoq|Kuntur|Rumi|Sinchi|Sami|Mayta|Yupanki|Atahualpa^r|Pachacuti^r|Huayna Capac^r|${colonial(BAPT_M)}`,
    female: `Sisa|Chaska|Wayra|Sumaq|Mayu|Yana|Chimpu|Cura Ocllo^r|Contarhuacho^r|Chimpu Ocllo^r|${colonial(BAPT_F)}`,
    holy: "Guaman Poma|Santacruz Pachacuti|Rose|Martin de Porres|Toribius|Francis Solano|Juan Macias|Titu Atauchi|Wari Kuri|Juan Santos|Calixto|Santiago|Miguel|Anthony",
  },
  modern: {
    male: "Juan|Jose|Luis|Carlos|Pedro|Mario|Victor|Julio|Jorge|Miguel|Cesar|Edgar|Wilfredo|Hugo|Marcos|Alberto|Javier|Walter|Roberto|Ruben|Fernando|Oscar|Rodolfo|Raul|Eduardo|Felix|Tomas|Nicolas|Percy|Elmer",
    female: "Maria|Rosa|Juana|Ana|Carmen|Julia|Gladys|Elena|Teresa|Luz|Marleni|Sonia|Norma|Flor|Marta|Lucia|Isabel|Victoria|Silvia|Paulina|Dina|Nancy|Yolanda|Edith|Margarita|Beatriz|Gloria|Felicitas|Justina|Eulalia",
    recentMale: "Mateo|Santiago|Sebastian|Thiago|Liam|Gael|Anthony|Joaquin|Diego|Illari|Amaru|Waman|Bruno|Matias|Lucas|Dylan",
    recentFemale: "Valentina|Camila|Luciana|Mia|Sofia|Isabella|Ximena|Sumaq|Chaska|Wayra|Kiara|Nayeli|Mariana|Natalia|Luna|Alessia",
  },
};

// American (the United States and Canada together): the existing lists, with the French-Canadian and other common Canadian given names and surnames added.
const keep = (t, k) => names(t[k]).join("|");
/** The names flagged famous (`^r`) and held last: a plain entry of the same name is dropped. */
const flagged = (base, more) => { const drop = new Set(more.split("|").map((x) => x.toLowerCase())); return `${base.split("|").filter((x) => !drop.has(x.replace(/\^.*/, "").toLowerCase())).join("|")}|${more.split("|").map((x) => `${x}^r`).join("|")}`; };
const plus = (base, more) => { const have = new Set(base.split("|").map((x) => x.toLowerCase())); const extra = more.split("|").filter((x) => x && !have.has(x.toLowerCase())); return extra.length ? `${base}|${extra.join("|")}` : base; };
export const AMERICAN = {
  historic: { male: flagged(keep(old.american.historic, "male"), "Ulysses|Theodore|Abraham|Woodrow"), female: flagged(keep(old.american.historic, "female"), "Dolley|Harriet|Eleanor|Clara") },
  modern: {
    male: flagged(plus(keep(old.american.modern, "male"), "Pierre|Jean|Luc|Marc|Andre|Jacques"), "Dwight|Ronald|Jimmy|Lyndon"),
    female: flagged(plus(keep(old.american.modern, "female"), "Marie|Nathalie|Julie|Chantal|Sylvie|Josee"), "Rosa|Jacqueline|Coretta|Amelia"),
    recentMale: plus(old.american.modern.recentMale.join("|"), "Mason|Logan|Hudson|Carter|Jackson|Wyatt|Grayson|Easton"),
    recentFemale: plus(old.american.modern.recentFemale.join("|"), "Harper|Evelyn|Avery|Scarlett|Aubrey|Penelope|Hazel|Nora"),
    surnames: plus(keep(old.american.modern, "surnames"), "Tremblay|Gagnon|Roy|Cote|Bouchard|Gauthier|MacDonald|Campbell|Stewart|Wong|Singh|Li"),
  },
};
