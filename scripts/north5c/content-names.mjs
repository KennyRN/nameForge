// Northern Europe tables brief, batch 5c: the signature words of the three bynames modules, realms and polities, and peoples and tongues.
// Ten English words per kind and culture; `;` between the three lists, `|` between words. Native forms (ap, Mac, -son, von…) stay in the
// bynames modules' native and mixed language settings (see NATIVE below); the English setting renders them in English (brief 5c B2).

export const KINDS = {
  epithets: ["deeds", "bodies", "virtues"],
  titles: ["ranks", "offices", "honours"],
  familyNames: ["trades", "land", "kin"],
  realms: ["realms", "lands", "peoples"],
  peoplesTongues: ["folk", "tongues", "lands"],
};

export const WORDS = {
  epithets: {
    english: "Unready|Peaceful|Conqueror|Lionheart|Confessor|Magnificent|Bold|Good|Fair|Victorious;Tall|Short|Red|Fair-Haired|Stout|Lame|Hardy|Grey|Broad|Bald;Wise|Just|Pious|Gentle|Honest|Steadfast|Careful|Kind|Faithful|Noble",
    welsh: "Dragon-Slayer|Bold|Great|Victorious|Fortunate|Harper|Lawgiver|Peacemaker|Defender|Conqueror;Tall|Fair|Red|Dark|Stout|Lame|Hardy|Grey|Broad|Golden;Wise|Just|Generous|Gentle|Faithful|Steadfast|Careful|Kind|Noble|Eloquent",
    scottish: "Bold|Great|Victorious|Maiden|Defender|Border-Raider|Conqueror|Lion|Peacemaker|Reiver;Tall|Fair|Red|Dark|Stout|Lame|Hardy|Grey|Broad|Black;Wise|Just|Pious|Gentle|Faithful|Steadfast|Careful|Kind|Noble|Canny",
    irish: "Battle-Winner|Bold|Great|Victorious|Poet|Hostage-Taker|Defender|Conqueror|Peacemaker|Raider;Tall|Fair|Red|Dark|Stout|Lame|Hardy|Grey|Broad|Golden;Wise|Just|Generous|Gentle|Faithful|Steadfast|Hospitable|Kind|Noble|Pious",
    cornish: "Tinner|Bold|Great|Victorious|Pilot|Defender|Wrecker|Pilgrim|Peacemaker|Fisher;Tall|Fair|Red|Dark|Stout|Lame|Hardy|Grey|Broad|Weathered;Wise|Just|Pious|Gentle|Faithful|Steadfast|Careful|Kind|Noble|Stubborn",
    norse: "Forkbeard|Fairhair|Bluetooth|Boneless|Hardrule|Ironside|Wolf-Slayer|Oath-Breaker|Sea-King|Shield-Breaker;Tall|Fair-Haired|Red|One-Eyed|Stout|Lame|Hardy|Grey|Broad|Black;Wise|Just|Generous|Bold|Faithful|Steadfast|Careful|Kind|Noble|Stern",
    scandinavian: "Peaceful|Bold|Great|Victorious|Navigator|Defender|Reformer|Builder|Seafarer|Conqueror;Tall|Fair|Red|Dark|Stout|Lame|Hardy|Grey|Broad|Golden;Wise|Just|Pious|Gentle|Faithful|Steadfast|Careful|Kind|Noble|Prudent",
    german: "Barbarossa|Great|Bold|Victorious|Pious|Conqueror|Builder|Peacemaker|Lion|Defender;Tall|Fair|Red|Dark|Stout|Lame|Hardy|Grey|Broad|Stammerer;Wise|Just|Pious|Gentle|Faithful|Steadfast|Careful|Kind|Noble|Thrifty",
    celtic: "Bold|Great|Victorious|Defender;Tall|Fair|Red|Dark;Wise|Just|Generous|Noble",
  },
  titles: {
    english: "Knight|Squire|Baronet|Yeoman|Burgess|Master|Captain|Provost|Franklin|Elder;Steward|Chamberlain|Treasurer|Bailiff|Warden|Almoner|Falconer|Butler|Verderer|Coroner;Majesty|Grace|Worship|Excellency|Honour|Reverence|Eminence|Serenity|Splendour|Renown",
    welsh: "Squire|Judge|Seer|Master|Captain|Elder|Burgess|Franklin|Provost|Yeoman;Steward|Chamberlain|Treasurer|Bailiff|Warden|Harper|Falconer|Verderer|Coroner|Almoner;Majesty|Grace|Worship|Excellency|Honour|Reverence|Eminence|Serenity|Splendour|Renown",
    scottish: "Provost|Bailie|Captain|Master|Elder|Burgess|Franklin|Squire|Yeoman|Knight;Steward|Chamberlain|Treasurer|Warden|Justiciar|Falconer|Almoner|Coroner|Verderer|Piper;Majesty|Grace|Worship|Excellency|Honour|Reverence|Eminence|Serenity|Splendour|Renown",
    irish: "Judge|Poet|Captain|Master|Elder|Squire|Yeoman|Burgess|Provost|Seer;Steward|Chamberlain|Treasurer|Warden|Harper|Falconer|Bailiff|Almoner|Coroner|Verderer;Majesty|Grace|Worship|Excellency|Honour|Reverence|Eminence|Serenity|Splendour|Renown",
    cornish: "Captain|Master|Elder|Squire|Yeoman|Burgess|Provost|Pilot|Knight|Mayor;Steward|Chamberlain|Treasurer|Warden|Bailiff|Harbour Master|Coroner|Falconer|Almoner|Verderer;Majesty|Grace|Worship|Excellency|Honour|Reverence|Eminence|Serenity|Splendour|Renown",
    norse: "Steersman|Skald|Captain|Master|Elder|Yeoman|Burgess|Provost|Shipmaster|Seer;Steward|Treasurer|Warden|Standard-Bearer|Harbour-Warden|Chamberlain|Bailiff|Coroner|Falconer|Almoner;Renown|Glory|Honour|Fame|Valour|Might|Worship|Reverence|Splendour|Majesty",
    scandinavian: "Admiral|Captain|Master|Elder|Burgess|Provost|Yeoman|Knight|Squire|Pilot;Steward|Chamberlain|Treasurer|Warden|Bailiff|Harbour Master|Coroner|Falconer|Almoner|Lawman;Majesty|Grace|Worship|Excellency|Honour|Reverence|Eminence|Serenity|Splendour|Renown",
    german: "Burgomaster|Knight|Master|Elder|Captain|Burgess|Provost|Squire|Yeoman|Magistrate;Steward|Chamberlain|Treasurer|Warden|Bailiff|Auditor|Coroner|Falconer|Almoner|Verderer;Majesty|Grace|Worship|Excellency|Honour|Reverence|Eminence|Serenity|Splendour|Renown",
    celtic: "Judge|Seer|Elder|Squire;Steward|Warden|Harper|Treasurer;Majesty|Honour|Grace|Renown",
  },
  familyNames: {
    english: "Smith|Miller|Weaver|Cooper|Tanner|Fletcher|Baker|Carter|Mason|Thatcher;Hill|Brook|Wood|Field|Marsh|Ford|Dale|Moor|Heath|Combe;Kinsman|Heir|Cousin|Freeman|Younger|Elder|Goodchild|Newman|Neighbour|Brotherly",
    welsh: "Smith|Miller|Weaver|Cooper|Drover|Harper|Carter|Mason|Collier|Fuller;Hill|Brook|Wood|Field|Rock|Ford|Valley|Moor|Lake|Mount;Son of the Wolf|Son of the Hill|Son of the Smith|Son of the Bard|Son of the Oak|Heir|Kinsman|Descendant|Kindred|Cousin",
    scottish: "Smith|Miller|Weaver|Cooper|Fisher|Shepherd|Carter|Mason|Tailor|Wright;Hill|Burn|Wood|Field|Glen|Ford|Dale|Moor|Loch|Craig;Son of the Wolf|Clansman|Son of the Smith|Son of the Priest|Son of the Hill|Kinsman|Heir|Descendant|Kindred|Cousin",
    irish: "Smith|Miller|Weaver|Cooper|Fisher|Shepherd|Carter|Mason|Tailor|Wright;Hill|Brook|Wood|Field|Lake|Ford|Dale|Bog|Rock|Mount;Grandson of the Raven|Son of the Hound|Son of the Hill|Descendant|Kinsman|Heir|Kindred|Cousin|Son of the Poet|Descendant of the Salmon",
    cornish: "Smith|Miller|Weaver|Cooper|Fisher|Tinner|Carter|Mason|Tailor|Miner;Hill|Cove|Wood|Field|Rock|Ford|Valley|Moor|Cliff|Tor;Son of the Tinner|Son of the Hill|Kinsman|Heir|Descendant|Kindred|Cousin|Son of the Cove|Son of the Moor|Son of the Smith",
    norse: "Smith|Shipwright|Weaver|Cooper|Fisher|Farmer|Carter|Carver|Tailor|Skipper;Hill|Brook|Wood|Field|Fjord|Ford|Dale|Isle|Strand|Mount;Ironside|Stoneson|Bearson|Wolfson|Ravenson|Hammerson|Axeson|Greyson|Fairson|Redson",
    scandinavian: "Smith|Miller|Weaver|Cooper|Fisher|Farmer|Carter|Mason|Tailor|Skipper;Hill|Brook|Wood|Field|Lake|Ford|Dale|Isle|Strand|Mount;Son of the Smith|Son of the Wolf|Son of the Farm|Kinsman|Heir|Descendant|Kindred|Cousin|Son of the Isle|Son of the Hill",
    german: "Smith|Miller|Weaver|Cooper|Fisher|Farmer|Carter|Mason|Tailor|Baker;Hill|Brook|Wood|Field|Lake|Ford|Dale|Marsh|Castle|Mount;Son of the Wolf|Son of the Hill|Kinsman|Heir|Descendant|Kindred|Cousin|Son of the Forest|Son of the Smith|Son of the Mill",
    celtic: "Smith|Weaver|Cooper|Fisher;Hill|Brook|Wood|Ford;Kinsman|Freeman|Younger|Cousins",
  },
  realms: {
    english: "Kingdom|Earldom|Shire|Duchy|Barony|Lordship|Commonwealth|Realm|March|Palatinate;Weald|Fens|Wolds|Downs|Dales|Moors|Marches|Heartland|Uplands|Lowlands;Anglia|Mercia|Northmen|Southrons|Fenlanders|Highlanders|Islanders|Borderers|Commons|Freemen",
    welsh: "Principality|Lordship|Kingdom|Marcher Lordship|Barony|Earldom|Shire|Realm|Dominion|Hundred;Hills|Valleys|Mountains|Marches|Uplands|Coast|Lakes|Moors|Heartland|Lowlands;Hill-Men|Valley-Men|Mountain-Folk|Marchers|Islanders|Border-Folk|Coast-Folk|Highlanders|Free Men|Kinsmen",
    scottish: "Kingdom|Earldom|Lordship|Burgh|Barony|Regality|Realm|Dominion|Shire|Thanedom;Highlands|Lowlands|Isles|Borders|Glens|Uplands|Moors|Coast|Heartland|Straths;Highlanders|Lowlanders|Islanders|Borderers|Clansmen|Burghers|Northmen|Glen-Folk|Free Men|Kinsmen",
    irish: "Over-Kingdom|Kingdom|Lordship|Earldom|Province|Realm|Dominion|Hundred|Palatine|Territory;Plains|Hills|Bogs|Isles|Coast|Uplands|Lakes|Lowlands|Heartland|Western Shore;Hill-Men|Plain-Folk|Islanders|Coast-Folk|Border-Folk|Kinsmen|Free Men|Highlanders|Boggers|Clansmen",
    cornish: "Duchy|Kingdom|Earldom|Stannary|Hundred|Lordship|Shire|Realm|Dominion|Barony;Moors|Coast|Cliffs|Valleys|Tors|Isles|Uplands|Heartland|Downs|Peninsula;Tinners|Miners|Fishermen|Coast-Folk|Moor-Folk|Islanders|Borderers|Seafarers|Free Men|Kinsmen",
    norse: "Jarldom|Kingdom|Thing-Land|Lordship|Realm|Dominion|Hundred|Shire|Earldom|Holding;Fjords|Isles|Fells|Dales|Coast|Forests|Steadings|Heartland|Uplands|Northern Sea;Northmen|Sea-Folk|Fjord-Folk|Islanders|Free Farmers|Kinsmen|Seafarers|Dalesmen|Shield-Men|Sons",
    scandinavian: "Kingdom|Union|Jarldom|Duchy|Realm|Lordship|Dominion|County|Province|Commonwealth;Fjords|Isles|Forests|Lakes|Coast|Heartland|Lowlands|Uplands|Straits|Northern Sea;Northmen|Seafarers|Islanders|Forest-Folk|Free Farmers|Kinsmen|Lake-Folk|Highlanders|Coast-Folk|Commons",
    german: "Duchy|Margraviate|Electorate|Prince-Bishopric|Free Imperial City|League|Empire|County|Landgraviate|Kingdom;Forests|Marches|Uplands|Plains|Rivers|Heartland|Alps|Coast|Lowlands|Heath;Imperial Free Men|Burghers|Forest-Folk|Mountain-Folk|Marchers|Citizens|Plainsmen|Kinsmen|River-Folk|Free Men",
    celtic: "Kingdom|Tribal Land|Territory|Realm;Hills|Forests|Plains|Isles;Tribesmen|Hill-Men|Free Folk|Kinsmen",
  },
  peoplesTongues: {
    english: "Englishmen|Northerners|Southrons|Fenlanders|Wealdmen|Dalesmen|Borderers|Islanders|Moormen|Townsfolk;Speech|Tongue|Dialect|Cant|Lingo|Talk|Parlance|Jargon|Burr|Drawl;Marsh|Weald|Fen|Dale|Moor|Down|Wold|Heath|Shore|Border",
    welsh: "Hill Welsh|Valley-Men|Marchers|Mountain-Folk|Islanders|Coast-Folk|Drovers|Bards|Quarrymen|Borderers;Speech|Tongue|Dialect|Cant|Lilt|Talk|Parlance|Jargon|Burr|Song;Valley|Hill|Mountain|Coast|Moor|Lake|Forest|Border|Island|Mist",
    scottish: "Highlanders|Lowlanders|Islanders|Borderers|Clansmen|Glen-Folk|Burghers|Northmen|Fishers|Crofters;Speech|Tongue|Dialect|Cant|Lilt|Talk|Parlance|Burr|Doric|Broad Scots;Glen|Loch|Strath|Isle|Moor|Coast|Border|Highland|Lowland|Hill",
    irish: "Islanders|Hill-Men|Plain-Folk|Coast-Folk|Border-Folk|Clansmen|Bog-Folk|Western Folk|Fishers|Drovers;Speech|Tongue|Dialect|Cant|Lilt|Talk|Parlance|Brogue|Song|Burr;Plain|Hill|Bog|Coast|Isle|Lake|Forest|Border|Mountain|Shore",
    cornish: "Tinners|Miners|Fishermen|Coast-Folk|Moor-Folk|Islanders|Borderers|Seafarers|Cornishmen|Wreckers;Speech|Tongue|Dialect|Cant|Lilt|Talk|Parlance|Burr|Drawl|Song;Moor|Cove|Cliff|Valley|Tor|Isle|Coast|Down|Peninsula|Border",
    norse: "Northmen|Sea-Folk|Fjord-Folk|Islanders|Dalesmen|Seafarers|Shield-Men|Free Farmers|Sons|Raiders;Speech|Tongue|Dialect|Cant|Talk|Parlance|Burr|Skaldic Verse|Saga-Speech|Rune-Speech;Fjord|Isle|Fell|Dale|Coast|Forest|Strand|Steading|Skerry|Mountain",
    scandinavian: "Northmen|Seafarers|Islanders|Forest-Folk|Lake-Folk|Highlanders|Coast-Folk|Free Farmers|Fishers|Townsfolk;Speech|Tongue|Dialect|Cant|Lilt|Talk|Parlance|Burr|Drawl|Song;Fjord|Isle|Forest|Lake|Coast|Heath|Strait|Mountain|Valley|Skerry",
    german: "Highlanders|Lowlanders|Forest-Folk|Mountain-Folk|River-Folk|Burghers|Marchers|Plainsmen|Townsfolk|Coast-Folk;Speech|Tongue|Dialect|Cant|Lilt|Talk|Parlance|Jargon|Burr|Drawl;Forest|Mountain|Marsh|Heath|River|Valley|Coast|Hill|Lake|Plain",
    celtic: "Hill-Men|Free Folk|Islanders|Tribesmen;Speech|Tongue|Dialect|Cant;Hill|Forest|River|Isle",
  },
};

/** Native forms of the bynames modules (language setting native or mixed), as patterns; {x} is the word drawn. Kept to those settings only. */
export const NATIVE = {
  titles: {
    welsh: ["Tywysog of [place]", "Arglwydd of [place]", "Brenin of [place]", "Tywysog [name]", "Arglwydd [name]", "Brenin [name]"],
    irish: ["Ard Rí", "Taoiseach of [place]", "Ollamh of [place]", "Rí of [place]", "Taoiseach [name]", "Ollamh [name]"],
    scottish: ["Mormaer of [place]", "Thane of [place]", "Toiseach of [place]", "Mormaer [name]", "Toiseach [name]", "Thane [name]"],
    norse: ["Jarl of [place]", "Hersir of [place]", "Lawspeaker of [place]", "Jarl [name]", "Hersir [name]", "Lawspeaker [name]"],
    german: ["Graf von [place]", "Markgraf von [place]", "Kurfürst von [place]", "Freiherr von [place]", "Graf [name]", "Freiherr [name]"],
  },
  familyNames: {
    welsh: ["ap [father]", "ferch [father]", "ap [father] of [place]", "ferch [father] of [place]", "ap [father] ap [child]", "[place] ap [father]"],
    irish: ["Mac [father]", "Ó [father]", "Ní [father]", "Mac [father] of [place]", "Ó [father] of [place]", "Ní [father] of [place]"],
    scottish: ["Mac [father]", "Nic [father]", "Mac [father] of [place]", "Nic [father] of [place]", "Mac [father] Mac [child]", "[place] Mac [father]"],
    norse: ["[father]son", "[father]dottir", "[father]son of [place]", "[father]dottir of [place]", "[father]sson", "[place] [father]son"],
    german: ["von [place]", "zu [place]", "von und zu [place]", "von [place] zu [place]", "vom [place]", "von der [place]"],
  },
};
