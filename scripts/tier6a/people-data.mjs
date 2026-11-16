// Second-tier tables brief 6a §3: the people tables of the four cultures the splits make (Spanish, Portuguese, Greek, Byzantine).
// A list is a string of names separated by "|", in weight order (5 at 10, 5 at 7, 6 at 5, 8 at 3, the rest 2); `^r` marks a name rulers bore and
// `^s` a saint's (they take their share by weight, not by frequency); an era tag follows `@`. Real people's names only, one spelling each.

export const SPANISH = {
  historic: {
    male: "Juan|Pedro|Diego|Fernando|Alonso|Garcia|Gonzalo|Rodrigo|Alvaro|Sancho|Ramiro|Alfonso^r|Hernando|Martin|Lope|Pelayo|Bermudo|Ordono|Fruela|Hernan|Francisco|Gil|Mendo|Suero|Inigo|Fortun|Jaime|Enrique|Felipe^r|Isidore^s|Munio|Velasco|Tello|Alvar|Ximeno",
    female: "Maria|Isabel|Juana|Catalina|Leonor|Urraca|Teresa|Beatriz|Elvira|Constanza|Mencia|Sancha|Blanca|Violante|Berenguela|Ines|Mayor|Sol|Aldonza|Guiomar|Mafalda|Ximena|Velasquita|Toda|Clara|Dulce|Nuna|Aurembiaix|Sancia|Petronila|Jimena|Oneca",
    surnames: "Garcia|Fernandez|Gonzalez|Rodriguez|Lopez|Martinez|Sanchez|Perez|Gomez|Diaz|Alvarez|Ruiz|Jimenez|Moreno|Munoz|Hernandez|Torres|Romero|Navarro|Castro|Mendoza|Vega|Ortega|Iglesias|Flores|Herrera|Medina|Aguilar|Cortes|Vargas",
    regnalMale: "Alfonso|Fernando|Sancho|Ramiro|Pedro|Juan|Felipe|Carlos",
    regnalFemale: "Isabel|Juana|Maria|Leonor|Urraca|Catalina|Berenguela|Blanca",
    holy: "Isidore|Ildefonsus|Dominic|Teresa|Vincent|Ignatius|Eulalia|Leander|Fructuosus|Millan|Ferdinand|James",
    holyForms: [["Saint {n}", 80], ["the Blessed {n}", 10], ["Brother {n}", 10]],
    rulerForms: { male: [["King {m}", 70], ["Emperor {m}", 10], ["Prince {m}", 20]], female: [["Queen {f}", 80], ["Infanta {f}", 10], ["Empress {f}", 10]] },
  },
  modern: {
    male: "Javier|David|Alberto|Jorge|Marcos|Jose|Hugo|Juan|Martin|Antonio|Lucas|Manuel|Mateo|Francisco|Daniel@MO|Luis|Pablo|Miguel|Alejandro|Jesus|Adrian|Pedro|Diego|Joaquin|Sergio@MO|Ramon|Leo|Fernando|Enzo|Rafael|Thiago|Angel|Gabriel|Carlos|Santiago|Ivan",
    female: "Elena|Marta|Cristina|Silvia|Raquel|Maria|Lucia|Carmen|Sofia|Dolores|Martina|Josefa|Paula|Francisca|Valeria|Antonia|Julia|Rosa|Emma|Pilar|Daniela|Concepcion|Alba|Teresa|Carla|Isabel|Sara|Ana|Noa|Manuela|Vega|Mercedes|Laura@MO|Juana|Valentina@MO",
    surnames: "Garcia|Fernandez|Gonzalez|Rodriguez|Lopez|Martinez|Sanchez|Perez|Gomez|Martin|Jimenez|Ruiz|Hernandez|Diaz|Moreno|Alvarez|Munoz|Romero|Alonso|Gutierrez|Navarro|Torres|Dominguez|Vazquez|Ramos|Gil|Ramirez|Serrano|Blanco|Suarez|Molina",
    regnalMale: "Alfonso|Carlos|Juan|Felipe|Fernando|Luis|Pedro|Ramon",
    regnalFemale: "Isabel|Maria|Victoria|Eugenia|Amelia|Carlota|Mercedes|Cristina",
    holy: "Teresa|Ignatius|John|Francis|Vincent|Rita|Joseph|Isidore|Josemaria|Dominic|Rose|Anthony",
    recentMale: "Hugo|Martin|Lucas|Mateo|Pablo|Alejandro|Adrian|Diego|Leo|Enzo|Thiago|Gabriel|Santiago",
    recentFemale: "Lucia|Sofia|Martina|Paula|Valeria|Julia|Emma|Daniela|Alba|Carla|Sara|Noa|Vega",
    holyForms: [["Saint {n}", 80], ["the Blessed {n}", 10], ["Brother {n}", 10]],
    rulerForms: { male: [["King {m}", 70], ["Emperor {m}", 10], ["Prince {m}", 20]], female: [["Queen {f}", 80], ["Infanta {f}", 10], ["Empress {f}", 10]] },
  },
};

export const PORTUGUESE = {
  historic: {
    male: "Joao|Pedro|Afonso^r|Duarte|Manuel|Nuno|Diogo|Goncalo|Rodrigo|Fernando|Henrique|Dinis|Sancho|Vasco|Bartolomeu|Martim|Egas|Paio|Mendo|Lourenco|Francisco|Antonio|Jorge|Tomas|Luis|Miguel|Gil|Estevao|Alvaro|Joaquim^s|Ruy|Garcia|Fruela|Alvar",
    female: "Maria|Isabel|Beatriz|Leonor|Teresa|Catarina|Ines|Mafalda|Filipa|Constanca|Brites|Joana|Urraca|Sancha|Dulce|Violante|Guiomar|Aldonca|Mor|Sol|Clara|Margarida|Brianda|Antonia|Luisa|Madalena|Helena|Mecia|Elvira|Sancia|Tareja|Lucia",
    surnames: "Silva|Santos|Ferreira|Pereira|Oliveira|Costa|Carvalho|Almeida|Sousa|Rodrigues|Fernandes|Gomes|Martins|Goncalves|Lopes|Marques|Alves|Ribeiro|Pinto|Teixeira|Moreira|Correia|Mendes|Nunes|Soares|Vieira|Monteiro|Cardoso|Rocha|Neves",
    regnalMale: "Afonso|Sancho|Dinis|Joao|Duarte|Manuel|Pedro|Henrique",
    regnalFemale: "Maria|Leonor|Beatriz|Isabel|Teresa|Mafalda|Filipa|Catarina",
    holy: "Anthony|Vincent|Isabel|Teotonius|Gonzalo|Nuno|John of God|Fructuosus|Martin|Rudesind|Beatriz|Mamede",
    holyForms: [["Saint {n}", 80], ["the Blessed {n}", 10], ["Brother {n}", 10]],
    rulerForms: { male: [["King {m}", 80], ["Prince {m}", 20]], female: [["Queen {f}", 80], ["Infanta {f}", 20]] },
  },
  modern: {
    male: "Joao|Jose|Manuel|Antonio|Francisco|Luis|Pedro|Miguel|Tiago@MO|Rui|Paulo|Jorge|Carlos|Nuno|Rafael|Diogo@MO|Goncalo@MO|Ricardo|Bruno|Tomas|Andre|Fernando|Vasco|Duarte|Martim|Afonso|Santiago|Lourenco|Salvador|Rodrigo|Henrique|Mateus|Dinis|Simao|Gabriel|Eduardo",
    female: "Maria|Ana|Rita|Catarina|Marta|Sofia@MO|Ines@MO|Beatriz|Mariana|Carolina|Joana|Teresa|Isabel|Helena|Filipa|Margarida|Sara@MO|Patricia|Sandra|Susana|Cristina|Paula|Raquel|Sonia|Carla|Claudia|Leonor|Matilde|Madalena|Francisca|Benedita|Alice|Laura|Diana|Eva",
    surnames: "Silva|Santos|Ferreira|Pereira|Oliveira|Costa|Rodrigues|Martins|Sousa|Fernandes|Goncalves|Gomes|Lopes|Marques|Alves|Almeida|Ribeiro|Pinto|Carvalho|Teixeira|Moreira|Correia|Mendes|Nunes|Soares|Vieira|Monteiro|Cardoso|Rocha|Neves",
    regnalMale: "Manuel|Carlos|Luis|Pedro|Miguel|Joao|Afonso|Jose",
    regnalFemale: "Maria|Amelia|Isabel|Carlota|Teresa|Leonor|Filipa|Catarina",
    holy: "Anthony|Vincent|Isabel|John of God|Nuno|Teotonius|Rose|Francis|Rita|Teresa|Joseph|Martin",
    recentMale: "Afonso|Rodrigo|Martim|Santiago|Francisco|Duarte|Tomas|Salvador|Dinis|Lourenco|Simao|Mateus|Gabriel",
    recentFemale: "Leonor|Matilde|Beatriz|Mariana|Maria|Francisca|Benedita|Carolina|Madalena|Alice|Diana|Laura|Margarida",
    holyForms: [["Saint {n}", 80], ["the Blessed {n}", 10], ["Brother {n}", 10]],
    rulerForms: { male: [["King {m}", 80], ["Prince {m}", 20]], female: [["Queen {f}", 80], ["Infanta {f}", 20]] },
  },
};

// Greek: historic only (the ancient Greek names); the modern period reads Byzantine's modern table, which is the modern Greek one.
export const GREEK = {
  historic: {
    male: "Pericles@AN|Alexander@AN|Socrates@AN|Plato@AN|Aristotle@AN|Demetrius@AN|Nicias@AN|Themistocles@AN|Leonidas@AN|Philip^r@AN|Theodorus@AN|Lysander@AN|Alcibiades@AN|Cimon@AN|Xenophon@AN|Thucydides@AN|Pythagoras@AN|Archimedes@AN|Solon@AN|Dionysius@AN|Aristides@AN|Epaminondas@AN|Pindar@AN|Hippocrates@AN|Euclid@AN|Diogenes@AN|Demosthenes@AN|Aeschylus@AN|Sophocles@AN|Herodotus@AN|Heraclitus@AN|Miltiades@AN",
    female: "Helen@AN|Penelope@AN|Antigone@AN|Aspasia@AN|Phryne@AN|Sappho@AN|Cassandra@AN|Andromache@AN|Hypatia@AN|Artemisia@AN|Berenice@AN|Cleopatra@AN|Arsinoe@AN|Olympias@AN|Thais@AN|Phila@AN|Roxana@AN|Stratonice@AN|Laodice@AN|Cynisca@AN|Agariste@AN|Xanthippe@AN|Corinna@AN|Telesilla@AN|Myia@AN|Praxilla@AN|Theano@AN|Lasthenia@AN|Aglaonice@AN|Nossis@AN",
    regnalMale: "Alexander|Philip|Pyrrhus|Leonidas|Cleomenes|Agesilaus|Antigonus|Demetrius",
    regnalFemale: "Olympias|Arsinoe|Berenice|Cleopatra|Roxana|Laodice|Stratonice|Artemisia",
    holy: "Epimenides|Empedocles|Pythagoras|Diotima|Lysimache|Theano|Themistoclea|Aglaonice|Teisamenus|Hegesistratus|Megistias|Callias",
    holyForms: [["Priest {n}", 40], ["Seer {n}", 40], ["Elder {n}", 20]],
    rulerForms: { male: [["King {m}", 70], ["Tyrant {m}", 30]], female: [["Queen {f}", 100]] },
  },
};

// Byzantine: historic (late antiquity on) and modern (modern Greek names, as the Greek-and-Byzantine table).
export const BYZANTINE = {
  historic: {
    male: "Basil@MD|Constantine^r@MD|Michael@MD|Leo@MD|John@MD|Alexius@MD|Manuel@MD|Nicephorus@MD|Theodore@MD|Andronicus@MD|Isaac@MD|Romanus@MD|Stephen@MD|George@MD|Photius@MD|Justinian^r@MD|Heraclius@MD|Maurice@MD|Phocas@MD|Anastasius@MD|Zeno@MD|Marcian@MD|Bardas@MD|Theophilus@MD|Sergius@MD|Eustathius@MD|Leontius@MD|Symeon@MD|Niketas@MD|Kosmas@MD",
    female: "Theodora^r@MD|Irene@MD|Zoe@MD|Eudocia@MD|Anna@MD|Maria@MD|Euphrosyne@MD|Theophano@MD|Helena@MD|Sophia@MD|Kassia@MD|Agatha@MD|Thekla@MD|Eudoxia@MD|Pulcheria@MD|Verina@MD|Anastasia@MD|Martina@MD|Constantina@MD|Danielis@MD|Kale@MD|Xene@MD|Eupraxia@MD|Zenonis@MD|Photeine@MD|Procopia@MD|Euphemia@MD|Theodosia@MD|Eirene@MD|Maximo@MD",
    surnames: "Komnenos|Doukas|Palaiologos|Angelos|Laskaris|Kantakouzenos|Phokas|Skleros|Choniates|Argyros|Gabras|Melissenos|Tornikes|Synadenos|Raoul|Branas|Kamateros|Kourkouas|Vatatzes|Xiphilinos|Psellos|Chrysoloras|Philanthropenos|Apokaukos|Mouzalon|Monomachos|Diogenes|Botaneiates|Bryennios|Rhangabe",
    regnalMale: "Constantine|Justinian|Basil|Leo|Heraclius|Alexius|Michael|Manuel",
    regnalFemale: "Theodora|Irene|Zoe|Eudocia|Helena|Eudoxia|Sophia|Anna",
    holy: "Nicholas|Basil|Gregory|Athanasius|Demetrius|George|Spyridon|Helena|Catherine|Barbara|Photini|Chrysostom",
    holyForms: [["Saint {n}", 80], ["Elder {n}", 10], ["Patriarch {n}", 10]],
    rulerForms: { male: [["Emperor {m}", 60], ["King {m}", 40]], female: [["Empress {f}", 60], ["Queen {f}", 40]] },
  },
  modern: "copy:greek-byzantine",
};
