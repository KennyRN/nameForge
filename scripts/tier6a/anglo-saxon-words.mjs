// Anglo-Saxon (sibling-distinctness brief, 17 November 2026): the early English in words of its own for the 5c and 5d modules, beside Norman and British.
// The hundred and the moot, minsters and wics, thegns and ealdormen in English, shield-walls and mead-halls, the old gods (never named) and the wyrm. Three lists of ten
// words per module (`;` between lists).
const HON = "Majesty|Grace|Worship|Excellency|Honour|Reverence|Eminence|Serenity|Splendour|Renown";
export const ADJ_AS = "Old|Grey|Golden|Bold|Fair|Wise|Holy|Stout|Green|Dark";
export const RANKS_AS = "King/Queen|Ealdorman/Lady|Thegn/Lady|Earl/Countess|Bishop/Abbess|Reeve/Lady";

export const AS5C = {
  mysticOrders: "Minster Brethren|Brotherhood|Hermits|Anchorites|Gild|Order|Seers|Cunning-Folk|Sisters|Wise Women;Cross|Rood|Lamp|Dove|Star|Candle|Book|Bell|Flame|Well;Visions|Psalms|Vigils|Wonders|Silence|Charms|Sanctuary|Fasting|Pilgrimage|Healing",
  martialOrders: "Shield-Wall|Housecarls|Fyrd|Thegns|Hearth-Guard|War-Band|Retinue|Ship-Fyrd|Brotherhood|Levy;Spear|Shield|Sword|Banner|Axe|Seax|Helm|Bow|Mail|Dragon-Standard;Boar|Wolf|Raven|Stag|Horse|Eagle|Bear|Hound|Falcon|Dragon",
  underworldGroups: "Outlaws|Wolf's-Heads|Reavers|Gang|Poachers|Smugglers|Brigands|Cutpurses|Thieves|Ring;Cattle-Thieves|Poachers|Highwaymen|Wreckers|Forgers|Cutpurses|Brigands|Fences|Footpads|Raiders;Fen Edge|Forest Path|Ford|Moot Hill|Ferry|Crossroads|Alehouse|Wharf|Barrow|Marsh",
  tradeGuilds: "Wool Merchants|Weavers|Goldsmiths|Brewers|Bakers|Smiths|Wic Traders|Tanners|Salt Merchants|Potters;Wool|Salt|Mead|Iron|Grain|Honey|Leather|Cloth|Amber|Silver;Moot Hall|Wic|Market Place|Fair|Staple|Toll House|Warehouse|Wharf|Cheapside|Guildhall",
  adventureCompanies: "Wayfarers|War-Band|Fellowship|Band|Company|Wanderers|Seekers|Pilgrims|Guild|Crew;Quest|Pilgrimage|Hunt|Journey|Raid|Voyage|Rescue|Search|Errand|Venture;Boar|Wolf|Raven|Stag|Hawk|Star|Oak|Sword|Sun|Ship",
  powerFactions: "Witan|Council|Moot|Hundred|Shire Court|Brotherhood|Assembly|Court|Chapter|League;Crown|Faith|Law|Kinship|Trade|Land|Peace|Wergild|Order|Folk;Moot Barrow|Hall|Minster|Hundred Court|Burh|Council Chamber|Fort|Mead-Hall|Monastery|Court",
  supernaturalCourts: "Wild Hunt|Elf Court|Dark Court|Host|Court|Conclave|Circle|Assembly|Throne|Brood;Elf|Dwarf|Wyrm|Troll|Giant|Wight|Hag|Nicker|Forest Spirit|Water Spirit;Barrow|Fen|Mist|Hall Under Hill|Standing Stones|Mere|Deep Wood|Crossroads|Hollow Hill|Marsh",
  tribalNames: "Kin|Folk|Kindred|House|Clan|Fellows|Households|Line|Neighbours|Host;Hundred|Fen|Wold|Marsh|River|Weald|Shore|Hill|Dale|Heath;Boar|Wolf|Raven|Stag|Horse|Eagle|Bear|Hound|Oak|Dragon",
  epithets: "Great|Bold|Victorious|Pious|Elder|Ready|Wise|Peaceful|Lion|Defender;Tall|Fair|Red|Dark|Stout|Lame|Hardy|Grey|Broad|Bald;Wise|Just|Holy|Faithful|Steadfast|Careful|Kind|Noble|Proud|Generous",
  titles: `Thegn|Shire-Elder|Moot-Elder|Elder|Captain|Steward|Shire-Moot|Warden|Bishop|Abbot;Chamberlain|Treasurer|Warden|Bailiff|Gate-Ward|Hundredman|Clerk|Horse-Master|Sergeant|Writer;${HON}`,
  familyNames: "Smith|Miller|Weaver|Shepherd|Fisher|Farmer|Carter|Mason|Tailor|Baker;Hill|Brook|Wood|Field|Mere|Ford|Dale|Marsh|Barrow|Down;Son of the Wolf|Son of the Hill|Kinsman|Heir|Descendant|Kindred|Cousin|Son of the Wood|Son of the Smith|Son of the Mill",
  realms: "Kingdom|Earldom|Shire|Hundred|Mark|Lordship|Bishopric|Dominion|Thegnage|Realm;Marches|Fens|Wolds|Plains|Rivers|Heartland|Weald|Coast|Lowlands|Islands;Angles|Saxons|Men of the Fen|Marchers|Shire-Men|Fenlanders|Wealdmen|Kinsmen|River-Folk|Free Men",
  peoplesTongues: "Fenlanders|Wealdmen|Marchers|Dalesmen|Shire-Folk|Hillmen|Coast-Folk|Plainsmen|Townsfolk|River-Folk;Speech|Tongue|Dialect|Cant|Lilt|Talk|Burr|Jargon|Drawl|Brogue;Fen|Wold|Weald|Shire|Dale|Marsh|Coast|Down|Heath|Moor",
  ships: "Longship|Keel|Cog|Merchantman|Ketch|Barque|Steamer|Lugger|Gunboat|Liner;Boar|Raven|Dragon|Stag|Eagle|Wave-Horse|Hawk|Wolf|Seahorse|Swan;Faith|Hope|Providence|Fortune|Concord|Peace|Wayfarer|Unity|Prosperity|Endeavour",
  aircraft: "Airship|Biplane|Monoplane|Glider|Balloon|Mailplane|Fighter|Bomber|Airliner|Helicopter;West Wind|North Wind|South Wind|East Wind|Gale|Breeze|Fen Wind|Squall|Mist|Storm;Eagle|Falcon|Hawk|Raven|Lark|Kestrel|Owl|Swallow|Wren|Buzzard",
  landVehicles: "Ox Cart|Wain|Stagecoach|Wagon|Omnibus|Tram|Lorry|Motorcar|Tractor|Cart;Boar|Wolf|Stag|Horse|Hound|Falcon|Ox|Bull|Raven|Eagle;Station|Junction|Crossing|Terminus|Halt|Depot|Viaduct|Cutting|Siding|Tunnel",
};

export const AS5D = {
  moneyNames: "Penny|Shilling|Halfpenny|Pound|Farthing|Mark|Ounce|Scale-Weight|Cut Silver|Hoard Piece;Silver|Gold|Copper|Bronze|Electrum|Lead|Pewter|Tin|Iron|Nickel;Dragon|Cross|King's Head|Bird|Wheel|Boar|Ship|Moneyer|Oak|Sun",
  eventNames: "War|Rising|Siege|Raid|Feud|Invasion|Truce|Peace|Conquest|Reign;Famine|Plague|Flood|Frost|Fire|Drought|Murrain|Storm|Sickness|Comet;Crown|Danes|Corn|Succession|Tithe|Church|Tax|Earls|Forest|Moot",
  calendarNames: "Ice|Mire|Sap|Lenten|Milking|Mowing|Haying|Reaping|Fallen-Leaf|Slaughter;Midwinter|Harvest Home|Lammas|Hocktide|Candlemas|Shearing|Haymaking|Wakes|Moot Day|Mayday;Hunter's|Wolf|Ice|Corn|Hay|Fox|Barley|Oak|Thorn|Mead",
  skyNames: "Wain|Fire-Dragon|Mead-Cup|Hunter|Sword|Spear|Burh|Helm|Hall|Ring;Hound|Boar|Hare|Hawk|Raven|Stag|Bear|Wolf|Bull|Eagle;Beacon|Wanderer|Sky-Candle|Pole Star|Dusk Star|Dawn Star|Rushlight|Torch|Spark|Ember",
  armsNames: "Sword|Seax|Spear|Axe|Bow|Dagger|Shield|Helm|Mail|Lance;Bright|Swift|Grim|Faithful|Keen|Holy|Steadfast|Mighty|Bitter|True;Dragon|Giant|Wyrm|Traitor|Tyrant|Serpent|Raider|Dane|Beast|Witch",
  treasureNames: "Crown|Cup|Ring|Horn|Torque|Brooch|Sceptre|Banner|Bell|Throne;Silver|Gold|Garnet|Ivory|Amber|Jet|Bronze|Crystal|Cedar|Bone;Kings|Saints|Heroes|Giants|Elders|Smiths|Mothers|Seers|Monks|Minstrels",
  bookNames: "Book|Chronicle|Gospel|Charter|Psalter|Roll|Ledger|Register|Herbal|Homily;Kings|Kin|Saints|Stars|Law|Herbs|Wars|Towns|Pilgrims|Healing;Black|Red|White|Great|Little|Lost|Secret|Holy|Long|Golden",
  deityNames: "Thunderer|Wanderer|Sky Father|Earth Mother|Dawn Lady|Hammer Lord|Corn Mother|Smith|Hunter|Warden;Harvest|Hearth|Grove|Well|Thunder|Barrow|Hill|Mist|Storm|Crossroads;Kind|Silent|Wise|Old|Strong|Dark|Merciful|Fierce|Fair|Faithful",
};

// The `as` frames (5c: eight of ten and two fantastic from the `of` style; 5d: eight, the two fantastic added): owners, kennings and the hundred.
export const AS_FRAMES_5C = {
  group: "[founder]'s {N0}*3~The {N1} {N0}*3~{N0} of the {N2}*2~{N1}-{N0}*2~{N0} of [place]*2~The {A} {N0}*1~{N2} {N0}*2~{N0} of the {N1}*1",
  tribe: "The {N1} {N0}*3~{N0} of {N1}*3~{N1}-{N0}*2~{N2} {N0}*2~The {A} {N0}*1~[founder]'s {N0}*1~{N0} of the {N2}*2~The {N0} of [place]*2",
  vessel: "{N1}*3~The {N2}*3~[founder]'s {N1}*2~{N1} of [place]*2~{A} {N2}*2~{N2} of the {N1}*1~The {A} {N1}*2~{N2}*3",
  epithet: "the {N0}*3~the {N1}*3~the {N2}*3~{N1}-{N0}*2~the {A} {N0}*1~{N0} the {N1}*1~the {N1} and {N2}*1~the {A} {N2}*1",
  title: "{N0} of [place]*3~{N1} of [place]*3~{R} [name]*3~{N0}*2~{N1}*2~{A} {N0}*1~{N1} to the {N0}*1~{R} of [place]*2",
  family: "{N0}*3~{N2}*2~{N1}*3~{N1} {N0}*2~{N0}-{N1}*1~{A} {N0}*1~{N2} of the {N0}*1~{N0} of [place]*1",
  realm: "{N0} of the {N1}*3~The {N1} {N0}*3~{N0} of [place]*2~{N2} {N0}*2~The {A} {N0}*1~{N0} of {N1}*2~{N1}-{N0}*1~{N0} of the {N2}*1",
  people: "the {N0}*3~the {N1} {N0}*3~the {A} {N1}*2~the {N2}*2~the {N0} of the {N1}*1~the {N2} {N0}*2~the {A} {N0}*2~the {N1}*1",
};
export const AS_FRAMES_5D = {
  money: "{N0} of the {N2}*3~{N1} {N0}*3~[founder]'s {N0}*2~{N2} {N0}*2~The {A} {N0}*1~{N0} of [place]*1~{N1} {N2}*1~{N0} of [holy person]*1",
  event: "The {N2} {N0}*3~{N0} of the {N1}*3~The {N0} of [founder]*2~{N0} of [place]*2~Year of the {N2}*1~The {N1} of {N2}*2~{N2}-{N0}*1~{N0} of [holy person]*1",
  calendar: "{N1} Tide*3:festival~{N0}-Month*3:month~{N2} Moon*3:moon~Month of the {N0}*2:month~{N1} Feast*3:festival~{A} {N0} Month*1:month~Moon of {N2}*1:moon~Feast of {N1}*1:festival",
  sky: "the {N0}*3:constellation~the {N1}'s {N0}*2:constellation~the {A} {N0}*2:constellation~the {N2}*3:light~the {N1}*3:constellation~the {N0} of the {N1}*1:constellation~the {A} {N2}*1:light~{N2}-Light*1:light",
  arms: "{N1}-{N0}*3~{N0} of the {N2}*3~The {N1} {N0}*2~{N2}-Bane*3~[founder]'s {N0}*1~The {A} {N0}*2~{N0} of [holy person]*1~{N2}-Slayer*1",
  treasure: "{N0} of the {N2}*3~The {N1} {N0}*3~[founder]'s {N0}*2~{A} {N1} {N0}*1~{N0} of [place]*1~{N1}-{N0}*2~The {A} {N0}*2~{N0} of [holy person]*1",
  book: "The {N0} of {N1}*3~{N0} of the {N2}*3~[founder]'s {N0}*2~{N1}-{N0}*1~The {A} {N0}*2~{N0} of [place]*1~{N0} of [holy person]*1~The {N2} {N0}*2",
  deity: "The {N2} {N0}*3~{N0} of the {N1}*3~{N1}-{N0}*2~The {A} {N0}*2~{N0} of [place]*1~{N0} of {N1}*2~The {N1} {N0}*1~{N0} of the {N2} {N1}*1",
};
