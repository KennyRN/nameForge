// Second-tier 6b §B4: the people tables of Turkic, Mongol, Arabic and Persian, written for each culture (not cut from the steppe and arabic-persian tables, which stay as the mixes).
// Ordinary attested names lead each list; famous figures (rulers, conquerors, poets, philosophers, scholars) are flagged `^r` and held to a fifth of a list's weight: they sit last,
// at most six of thirty. A name is one spelling, the right sex, people only (no gods), no living royals. Modern lists carry the era tags; the recent lists are the names given
// most in the last thirty years. Format as scripts/tier6a/people-data.mjs.
const L = (s) => s;
const forms = {
  turkic: { holyForms: [["Elder {n}", 50], ["Father {n}", 30], ["Sheikh {n}", 20]], rulerForms: { male: [["Sultan {m}", 40], ["Khan {m}", 30], ["Bey {m}", 30]], female: [["Sultana {f}", 50], ["Khatun {f}", 30], ["Princess {f}", 20]] } },
  mongol: { holyForms: [["Lama {n}", 60], ["Holy {n}", 20], ["Wise {n}", 20]], rulerForms: { male: [["Khan {m}", 60], ["Prince {m}", 40]], female: [["Khatun {f}", 50], ["Queen {f}", 30], ["Princess {f}", 20]] } },
  arabic: { holyForms: [["Sheikh {n}", 60], ["Imam {n}", 25], ["Sufi {n}", 15]], rulerForms: { male: [["Caliph {m}", 35], ["Sultan {m}", 35], ["Emir {m}", 30]], female: [["Queen {f}", 50], ["Sultana {f}", 30], ["Princess {f}", 20]] } },
  persian: { holyForms: [["Sheikh {n}", 50], ["Sufi {n}", 30], ["Dervish {n}", 20]], rulerForms: { male: [["Shah {m}", 50], ["Satrap {m}", 30], ["Prince {m}", 20]], female: [["Queen {f}", 70], ["Princess {f}", 30]] } },
};

export const TURKIC = {
  historic: {
    male: L("Alp|Arslan|Bilge|Kutlug|Tegin|Tarkan|Bogra|Kara|Yigit|Tuman|Toghan|Ozan|Tekin|Saruhan|Karaman|Aydin|Menteshe|Germiyan|Hamid|Eretna|Sungur|Kaan|Orhan|Murad|Ertugrul|Tughril^r|Alp Arslan^r|Mehmed^r|Suleiman^r|Bayezid^r"),
    female: L("Altun|Sevinch|Gulbahar|Nigar|Halime|Hatice|Fatma|Ayse|Aytolun|Dilber|Nergis|Gulnar|Turkan|Mahperi|Gevher|Saray|Kutlu|Ulker|Yildiz|Gul|Nur|Sultan|Hunat|Arzu|Hurrem^r|Kosem^r|Nurbanu^r|Safiye^r|Turhan^r|Terken^r"),
    regnalMale: "Mehmed|Murad|Bayezid|Suleiman|Osman|Orhan|Selim|Ahmed", regnalFemale: "Hurrem|Kosem|Nurbanu|Safiye|Turhan|Gevher|Mahperi|Terken",
    holy: "Yunus|Bektash|Yasawi|Mevlana|Bayram|Akshemsettin|Hizir|Ilyas|Sari Saltik|Ahi Evran|Abdal Musa|Seyyid Gazi", ...forms.turkic,
  },
  modern: {
    male: "Murat|Hakan|Serkan|Emre|Cem|Mehmet|Emir|Mustafa|Eymen|Ahmet|Yigit|Ali|Kerem|Huseyin|Berat|Hasan|Alp|Ibrahim|Arda|Ismail|Emirhan|Osman|Ege|Yusuf|Mert|Hamza|Burak|Omer|Baran|Kemal|Kaan|Ismet|Efe|Recep|Batuhan",
    female: "Elif|Seda|Esra|Merve|Burcu|Fatma|Defne|Ayse|Asya|Hatice|Nehir|Emine|Ecrin|Zeynep|Ela|Hanife|Nisa|Meryem|Azra|Zehra|Melisa|Sultan|Irem|Hacer|Duru|Hava|Ceylin|Gulsum|Eylul|Halime|Nil|Safiye|Ada|Rabia|Mira",
    recentMale: "Yigit|Eymen|Kerem|Berat|Alp|Arda|Emirhan|Ege|Mert|Burak|Baran|Kaan|Efe|Batuhan|Emir", recentFemale: "Defne|Asya|Nehir|Ecrin|Ela|Nisa|Azra|Melisa|Irem|Duru|Ceylin|Eylul|Nil|Ada|Mira",
    surnames: "Yilmaz|Kaya|Demir|Sahin|Celik|Yildiz|Yildirim|Ozturk|Aydin|Ozdemir|Arslan|Dogan|Kilic|Aslan|Cetin|Kara|Koc|Kurt|Ozkan|Simsek|Polat|Korkmaz|Ozcan|Cakir|Erdogan|Yavuz|Can|Acar|Sen|Aksoy",
    regnalMale: "Mehmed|Murad|Bayezid|Suleiman|Osman|Orhan|Selim|Ahmed", regnalFemale: "Hurrem|Kosem|Nurbanu|Safiye|Turhan|Gevher|Mahperi|Terken",
    holy: "Yunus|Bektash|Yasawi|Mevlana|Bayram|Akshemsettin|Hizir|Ilyas|Sari Saltik|Ahi Evran|Abdal Musa|Seyyid Gazi", ...forms.turkic,
  },
};
export const MONGOL = {
  historic: {
    male: L("Bayan|Bold|Baatar|Tsogt|Altan|Naran|Dorj|Ochir|Sukh|Tseren|Nergui|Erdene|Tumur|Munkh|Chuluun|Gan|Dalai|Sodnom|Jargal|Lkhagva|Khorloo|Tserendorj|Damdin|Namjil|Temujin^r|Ogedei^r|Kublai^r|Hulagu^r|Subutai^r|Jebe^r"),
    female: L("Narantuya|Oyun|Sarnai|Bolormaa|Gerel|Khulan|Saran|Tsetseg|Enkhtuya|Munkhtsetseg|Uyanga|Dolgor|Ariunaa|Odval|Sukhee|Chimeg|Nandin|Baigal|Doljin|Yesui|Tuya|Zaya|Sarantuya|Oyuntsetseg|Borte^r|Hoelun^r|Sorghaghtani^r|Toregene^r|Khutulun^r|Mandukhai^r"),
    regnalMale: "Temujin|Ogedei|Kublai|Mongke|Hulagu|Batu|Berke|Guyuk", regnalFemale: "Borte|Hoelun|Toregene|Doquz|Sorghaghtani|Chabi|Mandukhai|Khutulun",
    holy: "Zanabazar|Tsongkhapa|Sakya|Phagpa|Ochirvani|Jebtsundamba|Gombo|Danzan|Dorjiev|Zaya|Tsedenbal|Natsagdorj", ...forms.mongol,
  },
  modern: {
    male: "Bat|Enkhbat|Munkh|Tuvshin|Ganbold|Batbayar|Amarsanaa|Erdene|Tumurbaatar|Otgonbayar|Bayarsaikhan|Ganzorig|Dorj|Battulga|Nyamdorj|Sukhbaatar|Tsogtbaatar|Ulziibayar|Altankhuyag|Enkhbayar|Davaa|Bold|Batsaikhan|Lkhagvasuren|Munkhbat|Odkhuu|Tserendorj|Gantulga|Nomin|Choijil|Sarangerel|Khuderchuluun|Baatar|Naran|Temuulen",
    female: "Oyun|Sarnai|Bolormaa|Enkhtuya|Narantuya|Uyanga|Munkhtsetseg|Tsetseg|Altantsetseg|Ariunaa|Odval|Saruul|Tuul|Anu|Misheel|Khulan|Tungalag|Batjargal|Gerel|Zaya|Enkhjargal|Dolgor|Undraa|Sukhee|Chimeg|Nandin|Baigal|Narmandakh|Oyuntuya|Bayarmaa|Ganchimeg|Tsolmon|Handaa",
    recentMale: "Temuulen|Nomin|Anand|Ariunbold|Tuguldur|Munkh-Erdene|Enkh-Amgalan|Bilguun|Dulguun|Zolboo|Gan-Erdene|Tamir|Erkhes|Batbayar|Amarsanaa", recentFemale: "Misheel|Anu|Saruul|Nomuun|Khulan|Narantsetseg|Enkhtsetseg|Ariunzaya|Tselmeg|Soyol|Munkhzul|Zaya|Tuul|Uyanga|Munkhtsetseg",
    surnames: "Borjigin|Khalkha|Dorj|Bat|Tsogt|Bold|Naran|Ochir|Sukh|Tseren|Erdene|Tumur|Gan|Dalai|Jargal|Batbayar|Munkh|Chuluun|Baatar|Altan|Nergui|Damdin|Sodnom|Lkhagva|Namjil|Bayan|Davaa|Odkhuu|Enkh|Ganbat",
    regnalMale: "Temujin|Ogedei|Kublai|Mongke|Hulagu|Batu|Berke|Guyuk", regnalFemale: "Borte|Hoelun|Toregene|Doquz|Sorghaghtani|Chabi|Mandukhai|Khutulun",
    holy: "Zanabazar|Tsongkhapa|Sakya|Phagpa|Ochirvani|Jebtsundamba|Gombo|Danzan|Dorjiev|Zaya|Tsedenbal|Natsagdorj", ...forms.mongol,
  },
};
export const ARABIC = {
  historic: {
    male: L("Muhammad|Ali|Hasan|Husayn|Khalid|Ahmad|Hamza|Salim|Idris|Ibrahim|Ismail|Yusuf|Mahmud|Jafar|Tariq|Musa|Isa|Yahya|Zayd|Abdullah|Amr|Sulayman|Hisham|Walid|Umar^r|Uthman^r|Abu Bakr^r|Harun^r|Mansur^r|Saladin^r"),
    female: L("Fatima|Aisha|Khadija|Zaynab|Maryam|Hafsa|Ruqayya|Umm Kulthum|Sumayya|Asma|Layla|Safiya|Hind|Sakina|Rabia|Atika|Amina|Halima|Salma|Nadia|Samira|Hala|Najwa|Sabah|Zubayda^r|Shajar al-Durr^r|Khayzuran^r|Buran^r|Arwa^r|Zenobia^r"),
    regnalMale: "Harun|Mansur|Mahmud|Saladin|Umar|Hisham|Walid|Sulayman", regnalFemale: "Zubayda|Shajar al-Durr|Khayzuran|Buran|Arwa|Zenobia|Sitt al-Mulk|Asma",
    holy: "Abdul Qadir|Rabia|Junayd|Hallaj|Ghazali|Ahmad Rifai|Bishr|Shibli|Dhul-Nun|Hasan al-Basri|Ibn Arabi|Jalal", ...forms.arabic,
  },
  modern: {
    male: "Ali|Hassan|Khaled|Hamad|Muhammad|Yazan|Ahmad|Ayman|Mahmoud|Hadi|Mustafa|Majid|Abdullah|Tariq|Ibrahim|Ziad|Khalil|Karim|Hamid|Nabil|Hussein|Samir|Salim|Rami|Fouad|Sami|Nasser|Fadi|Farouk|Walid|Abbas|Bilal|Rashid|Adam|Zayd|Amir|Hamza|Omar|Yusuf",
    female: "Huda|Dalia|Leila|Aya|Fatima|Lina|Khadija|Sara|Aisha|Rania|Zaynab|Yasmin|Maryam|Noor|Amina|Dana|Halima|Maya|Hafsa|Jana|Layla|Hala|Zubayda|Lara|Safiya|Layan|Nadia|Rama|Samira|Tala|Salma|Ayla|Hind|Mira|Reem",
    recentMale: "Yazan|Adam|Zayd|Amir|Hamza|Omar|Yusuf|Ayman|Hadi|Majid|Bilal|Tariq|Ziad|Rami|Karim", recentFemale: "Lina|Sara|Rania|Yasmin|Noor|Dana|Maya|Jana|Hala|Lara|Layan|Rama|Tala|Ayla|Mira",
    surnames: "Haddad|Khoury|Nasser|Mansour|Saleh|Hamdan|Khalil|Sabbagh|Najjar|Said|Yousef|Awad|Darwish|Jaber|Salem|Rahman|Hijazi|Barakat|Amin|Farah|Habib|Issa|Kassab|Masri|Naim|Qasim|Shami|Tamimi|Zahran|Zaid",
    regnalMale: "Harun|Mansur|Mahmud|Saladin|Umar|Hisham|Walid|Sulayman", regnalFemale: "Zubayda|Shajar al-Durr|Khayzuran|Buran|Arwa|Zenobia|Sitt al-Mulk|Asma",
    holy: "Abdul Qadir|Rabia|Junayd|Hallaj|Ghazali|Ahmad Rifai|Bishr|Shibli|Dhul-Nun|Hasan al-Basri|Ibn Arabi|Jalal", ...forms.arabic,
  },
};
export const PERSIAN = {
  historic: {
    male: L("Arash|Babak|Behzad|Farhad|Kaveh|Mehrdad|Bijan|Piruz|Shahin|Tahmasp|Hormoz|Vahid|Parviz|Bizhan|Farrokh|Sohrab|Rostam|Zal|Siavash|Jamshid|Manuchehr|Kayvan|Navid|Hushang|Cyrus^r|Darius^r|Xerxes^r|Ardashir^r|Shapur^r|Khosrow^r"),
    female: L("Shirin|Farah|Roxana|Parisa|Mahin|Azadeh|Banu|Dilara|Gulnar|Shahrbanu|Laleh|Nahid|Soraya|Mahtab|Golnar|Yasamin|Roya|Simin|Zarrin|Mina|Pari|Nasrin|Fereshteh|Mehri|Pourandokht^r|Azarmidokht^r|Atossa^r|Amestris^r|Parysatis^r|Stateira^r"),
    regnalMale: "Cyrus|Darius|Xerxes|Ardashir|Shapur|Khosrow|Bahram|Kavad", regnalFemale: "Pourandokht|Azarmidokht|Atossa|Amestris|Parysatis|Stateira|Shirin|Roxana",
    holy: "Rumi|Hafez|Saadi|Attar|Shams|Khayyam|Bayazid|Sanai|Jami|Nezami|Ferdowsi|Sohravardi", ...forms.persian,
  },
  modern: {
    male: "Reza|Hossein|Mohammad|Ali|Mehdi|Amir|Hamid|Saeed|Majid|Davoud|Ebrahim|Kamran|Farhad|Babak|Behnam|Arash|Payam|Mojtaba|Sina|Pouya|Parsa|Arman|Ehsan|Navid|Shahram|Mostafa|Kian|Omid|Nima|Kaveh|Hadi|Morteza|Bahman|Farzad|Siamak",
    female: "Maryam|Zahra|Fatemeh|Narges|Sara|Leila|Mina|Parisa|Shirin|Nasrin|Mahsa|Neda|Elham|Samira|Azadeh|Golnaz|Shabnam|Yasaman|Niloufar|Atefeh|Roya|Setareh|Negar|Pegah|Sepideh|Tannaz|Ladan|Mitra|Farzaneh|Homa|Haniyeh|Raha|Baran|Dorsa|Hasti",
    recentMale: "Parsa|Arman|Kian|Sina|Pouya|Arad|Radin|Ariya|Amir-Ali|Armin|Bardia|Dariush|Kasra|Shayan|Navid", recentFemale: "Dorsa|Hasti|Baran|Raha|Yasna|Avina|Elnaz|Ghazal|Diana|Kiana|Melika|Nika|Romina|Tara|Mina",
    surnames: "Hosseini|Mohammadi|Ahmadi|Karimi|Rezaei|Moradi|Hashemi|Jafari|Ebrahimi|Rahimi|Sadeghi|Mousavi|Kazemi|Ghorbani|Rostami|Abbasi|Tehrani|Esfahani|Shirazi|Tabrizi|Mashhadi|Kermani|Yazdi|Gilani|Khorasani|Mazandarani|Zand|Farahani|Bakhtiari|Qashqai",
    regnalMale: "Cyrus|Darius|Xerxes|Ardashir|Shapur|Khosrow|Bahram|Kavad", regnalFemale: "Pourandokht|Azarmidokht|Atossa|Amestris|Parysatis|Stateira|Shirin|Roxana",
    holy: "Rumi|Hafez|Saadi|Attar|Shams|Khayyam|Bayazid|Sanai|Jami|Nezami|Ferdowsi|Sohravardi", ...forms.persian,
  },
};
