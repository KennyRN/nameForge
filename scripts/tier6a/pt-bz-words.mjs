// Second-tier 6a fixes §1: Portuguese and Byzantine written fresh, in their own habits, for the 5c and 5d modules (no substitution from Spanish or Greek).
// Portuguese: the Atlantic and the sea (quays, salt pans, cork oak, tile works, caravels and carracks, the saints of Lisbon and Porto, Brazilian and African
// trading ports in the early modern era, fado houses and tram lines from the steam age). Byzantine: the Christian Roman east (themes, monasteries and lavras,
// cisterns and hippodromes, icons and relics, dromons and fire-ships, court titles in English). Three lists of ten words per module (`;` between lists).
const HON = "Majesty|Grace|Worship|Excellency|Honour|Reverence|Eminence|Serenity|Splendour|Renown";

export const PT5C = {
  mysticOrders: "Brotherhood|Mercy Brethren|Order|Hermits|Penitents|Chapter|Third Order|Seers|Mystics|Fatima Pilgrims;Sea Star|Cross|Lamb|Dove|Lily|Candle|Pelican|Anchor|Flame|Shell;Mysteries|Vision|Vigil|Procession|Rosary|Silence|Veil|Miracle|Apparition|Pilgrimage",
  martialOrders: "Navigators|Crusaders|Lancers|Marines|Guards|Free Company|Regiment|Gunners|Brotherhood|Legion;Lance|Cutlass|Boarding Axe|Sword|Banner|Shield|Cannon|Musket|Crossbow|Pike;Lion|Eagle|Caravel|Wolf|Falcon|Horse|Dolphin|Hound|Stag|Anchor",
  underworldGroups: "Smugglers|Gang|Crew|Brotherhood|Syndicate|Pirates|Outfit|Ring|Mob|Pack;Smugglers|Wreckers|Pirates|Pickpockets|Forgers|Cutpurses|Racketeers|Fences|Poachers|Bootleggers;Quayside|Back Alley|Dockside|Cellar|Crossroads|Tavern|Market|Wharf|Fado House|Salt Pan",
  tradeGuilds: "Cork Merchants|Weavers|Goldsmiths|Vintners|Bakers|Tilemakers|Salt Merchants|Tanners|Spice Merchants|Fishmongers;Cork|Salt|Wine|Olive Oil|Spice|Sugar|Cod|Leather|Tile|Pepper;Guildhall|Exchange|Quay|Fair|Counting House|Customs House|Warehouse|Fish Market|Spice House|Cloth Hall",
  adventureCompanies: "Navigators|Free Company|Fellowship|Band|Company|Wanderers|Adventurers|Seekers|Guild|Crew;Voyage|Pilgrimage|Hunt|Journey|Discovery|Rescue|Raid|Venture|Errand|Search;Caravel|Compass|Star|Cross|Sun|Shell|Anchor|Dolphin|Lion|Eagle",
  powerFactions: "Council|Crown|Estates|Chamber|Faction|League|Assembly|Court|Chancery|Brotherhood;Crown|Faith|Discoveries|Empire|Law|Trade|Union|Liberty|Order|Peace;Royal Court|Palace|Cathedral|Town Hall|Quay|Council Chamber|Exchange|Customs House|Monastery|Parliament",
  supernaturalCourts: "Procession of Souls|Fair Court|Dark Court|Host|Court|Conclave|Circle|Assembly|Throne|Brood;Enchanted Maid|Sea Serpent|Werewolf|Goblin|Giant|Mermaid|Sprite|Witch|Forest Spirit|Water Spirit;Enchanted Cave|Mist|Dark Hall|Moonlit Strand|Lost Fleet|Mere|Enchanted Wood|Cairn|Underhill|Frozen Lake",
  tribalNames: "Kin|Folk|House|Family|Clan|Brethren|Households|Line|Neighbours|Hosts;Mountain|Plain|Estuary|Heath|River|Valley|Coast|Hill|Cape|Island;Eagle|Wolf|Dolphin|Stag|Horse|Boar|Lion|Hound|Oak|Falcon",
  epithets: "Navigator|Great|Bold|Victorious|Fortunate|Conqueror|Wise|Peacemaker|Lion|Discoverer;Tall|Fair|Red|Dark|Stout|Lame|Hardy|Grey|Broad|Stammerer;Wise|Just|Pious|Gentle|Faithful|Steadfast|Careful|Kind|Noble|Patient",
  titles: `Fidalgo|Magistrate|Master|Elder|Captain|Burgess|Provost|Squire|Yeoman|Steward;Chamberlain|Treasurer|Warden|Bailiff|Auditor|Harbourmaster|Pilot|Almoner|Sergeant|Notary;${HON}`,
  familyNames: "Smith|Miller|Weaver|Fisher|Shepherd|Farmer|Sailor|Cooper|Tailor|Baker;Hill|Brook|Wood|Field|Cape|Ford|Valley|Marsh|Castle|Mount;Son of the Wolf|Son of the Hill|Kinsman|Heir|Descendant|Kindred|Cousin|Son of the Sea|Son of the Smith|Son of the Mill",
  realms: "Kingdom|Crown|Captaincy|Overseas Empire|County|Marquisate|Empire|Lordship|Colony|Principality;Coasts|Marches|Uplands|Plains|Rivers|Heartland|Archipelago|Cape|Lowlands|Islands;Lusitanians|Burghers|Mountain-Folk|Seafarers|Marchers|Citizens|Plainsmen|Kinsmen|River-Folk|Free Men",
  peoplesTongues: "Highlanders|Lowlanders|Fisherfolk|Mountain-Folk|River-Folk|Burghers|Seafarers|Plainsmen|Townsfolk|Coast-Folk;Speech|Tongue|Dialect|Cant|Lilt|Talk|Parlance|Jargon|Burr|Drawl;Mountain|Plain|Estuary|Heath|River|Valley|Coast|Hill|Island|Cape",
  ships: "Caravel|Carrack|Galleon|Frigate|Schooner|Barque|Steamer|Lugger|Gunboat|Liner;Lion|Eagle|Dolphin|Whale|Swan|Stag|Falcon|Hawk|Horse|Seahorse;Saint Anthony|Saint Vincent|Saint John|Good Hope|Providence|Hope|Faith|Unity|Prosperity|Discovery",
  aircraft: "Airship|Biplane|Monoplane|Seaplane|Balloon|Mailplane|Fighter|Bomber|Airliner|Helicopter;Atlantic Wind|North Wind|Trade Wind|East Wind|Gale|Sea Breeze|Mountain Wind|Squall|Mist|Storm;Gull|Falcon|Hawk|Swan|Albatross|Raven|Kestrel|Owl|Tern|Petrel",
  landVehicles: "Locomotive|Steam Engine|Stagecoach|Ox Cart|Omnibus|Tram|Lorry|Motorcar|Tractor|Funicular;Lion|Eagle|Bull|Wolf|Stag|Horse|Boar|Hound|Falcon|Ox;Station|Junction|Crossing|Terminus|Halt|Depot|Viaduct|Cutting|Siding|Tunnel",
};

export const BZ5C = {
  mysticOrders: "Brotherhood|Monks|Order|Hermits|Stylites|Holy Fools|Hermit Colony|Chapter|Seers|Mystics;Icon|Cross|Lamb|Dove|Star|Candle|Pelican|Lily|Flame|Lamp;Mysteries|Vision|Vigil|Liturgy|Fasting|Silence|Veil|Light|Ecstasy|Pilgrimage",
  martialOrders: "Varangians|Cataphracts|Battalion|Imperial Guard|Border Guard|Marines|Brotherhood|Cavalry|Archers|Legion;Spear|Shield|Sword|Standard|Lance|Helmet|Trumpet|Bow|Mace|Dromon;Lion|Eagle|Bear|Wolf|Bull|Boar|Horse|Hound|Stag|Falcon",
  underworldGroups: "Brigands|Gang|Crew|Brotherhood|Syndicate|Smugglers|Outfit|Ring|Mob|Pack;Pirates|Smugglers|Brigands|Pickpockets|Forgers|Cutpurses|Racketeers|Fences|Footpads|Relic Thieves;Harbour|Back Street|Dockside|Cistern|Crossroads|Tavern|Market|Wharf|Hippodrome|Alley",
  tradeGuilds: "Silk Merchants|Weavers|Goldsmiths|Spice Merchants|Bakers|Smiths|Shipowners|Tanners|Perfumers|Money Changers;Silk|Wine|Icons|Silver|Spice|Grain|Gold|Leather|Purple Dye|Incense;Guildhall|Forum|Market Place|Warehouse|Counting House|Customs House|Granary|Harbour|Bazaar|Exchange",
  adventureCompanies: "Varangians|Fellowship|Band|Company|Wanderers|Pilgrims|Adventurers|Seekers|Guild|Crew;Quest|Pilgrimage|Hunt|Journey|Campaign|Rescue|Raid|Venture|Errand|Search;Eagle|Cross|Lion|Wolf|Star|Compass|Laurel|Sun|Dolphin|Dove",
  powerFactions: "Senate|Council|Court|Synod|Faction|Patriarchate|League|Chancery|Assembly|Throne;Orthodoxy|Faith|Empire|Law|Trade|Union|Liberty|Order|Peace|Crown;Palace|Cathedral|Monastery|Hippodrome|Camp|Council Chamber|Exchange|Great Church|Citadel|Assembly Hall",
  supernaturalCourts: "Host of Saints|Fair Court|Dark Court|Host|Court|Conclave|Circle|Assembly|Throne|Brood;Angel|Demon|Dragon|Harpy|Giant|Siren|Sprite|Witch|Forest Spirit|Water Spirit;Underworld|Enchanted Cave|Mist|Dark Hall|Holy Mountain|Mere|Enchanted Wood|Cairn|Cistern|Frozen Lake",
  tribalNames: "Kin|Folk|House|Family|Clan|Brethren|Households|Line|Neighbours|Hosts;Mountain|Plain|Marsh|Island|River|Valley|Coast|Hill|Theme|Sea;Eagle|Wolf|Lion|Stag|Horse|Boar|Bear|Hound|Olive|Falcon",
  epithets: "Great|Bold|Victorious|Pious|Orthodox|Fortunate|Wise|Peacemaker|Lion|Defender;Tall|Fair|Red|Dark|Stout|Lame|Hardy|Grey|Broad|Bald;Wise|Just|Holy|Faithful|Steadfast|Careful|Kind|Noble|Proud|Purple",
  titles: `Magistrate|Master|Elder|Captain|Registrar|First Swordbearer|Judge|Steward|Archivist|Venerable;Chamberlain|Treasurer|Abbot|Bailiff|Auditor|Steward of the Court|Clerk|Courier|Sergeant|Notary;${HON}`,
  familyNames: "Smith|Miller|Weaver|Monk|Fisher|Farmer|Carter|Mason|Tailor|Baker;Hill|Brook|Wood|Field|Lake|Ford|Valley|Marsh|Castle|Mount;Son of the Wolf|Son of the Hill|Kinsman|Heir|Descendant|Kindred|Cousin|Son of the Forest|Son of the Priest|Son of the Mill",
  realms: "Empire|Theme|Exarchate|Despotat|Patriarchate|Duchy|Principality|Kingdom|Commonwealth|Province;Themes|Marches|Uplands|Plains|Rivers|Heartland|Islands|Coast|Lowlands|Straits;Romans|Citizens|Islanders|Mountain-Folk|Marchers|Townsfolk|Plainsmen|Kinsmen|Sea-Folk|Free Men",
  peoplesTongues: "Romans|Highlanders|Lowlanders|Monks|Mountain-Folk|River-Folk|Citizens|Marchers|Townsfolk|Coast-Folk;Speech|Tongue|Dialect|Cant|Liturgy|Talk|Chant|Jargon|Burr|Drawl;Mountain|Plain|Marsh|Theme|River|Valley|Coast|Hill|Lake|Sea",
  ships: "Dromon|Fire-Ship|Galley|Merchantman|Schooner|Barque|Steamer|Skiff|Gunboat|Liner;Lion|Eagle|Dolphin|Dove|Stag|Falcon|Hawk|Horse|Seahorse|Swan;Providence|Concord|Hope|Triumph|Faith|Unity|Prosperity|Peace|Glory|Mercy",
  aircraft: "Airship|Biplane|Monoplane|Glider|Balloon|Mailplane|Fighter|Bomber|Airliner|Helicopter;West Wind|North Wind|South Wind|East Wind|Gale|Breeze|Bosphorus Wind|Squall|Mist|Storm;Eagle|Falcon|Hawk|Dove|Raven|Kestrel|Phoenix|Swallow|Kite|Buzzard",
  landVehicles: "Chariot|Cart|Stagecoach|Wagon|Omnibus|Tram|Lorry|Motorcar|Tractor|Litter;Lion|Eagle|Mule|Wolf|Stag|Horse|Boar|Hound|Falcon|Camel;Station|Junction|Crossing|Terminus|Halt|Depot|Viaduct|Cutting|Siding|Tunnel",
};

export const PT5D = {
  moneyNames: "Real|Cruzado|Moidore|Escudo|Dobra|Testoon|Cent|Farthing|Crown|Groat;Silver|Gold|Copper|Bronze|Billon|Lead|Pewter|Tin|Iron|Nickel;Caravel|Cross|Crown|Shield|Anchor|Cork Oak|Star|Shell|Compass|Lion",
  eventNames: "War|Revolt|Siege|Discoveries|Campaign|Rising|Truce|Peace|Conquest|Reign;Famine|Plague|Flood|Earthquake|Fire|Storm|Sickness|Great Hunger|Failed Harvest|Shipwreck;Crown|Faith|Empire|Spice|Town|Peasants|Guild|Cod|Sea|Brazil",
  calendarNames: "Frost|Thaw|Sowing|Blossom|Hay|Harvest|Vintage|Fog|Mist|Gale;Fair Night|Procession|Carnival|Saint's Feast|Harvest Thanks|Sardine Feast|Pilgrimage Feast|Midsummer|Lantern Night|Market Fair;Harvest|Hunter's|Sardine|Frost|Corn|Salt|Cork|Barley|Fisher's|Vintage",
  skyNames: "Great Wagon|Harp|Ship|Hunter|Swan|Cup|Crown|Plough|Wheel|Bridge;Hen and Chicks|Hound|Fox|Hawk|Raven|Stag|Bear|Whale|Eagle|Dove;Lamp|Beacon|Mariner's Star|Pole Star|Candle|Morning Star|Lantern|Torch|Spark|Compass",
  armsNames: "Sword|Blade|Spear|Lance|Bow|Cutlass|Dagger|Harpoon|Shield|Helm;Bright|Swift|Grim|Faithful|Keen|Holy|Steadfast|Mighty|Bitter|True;Dragon|Giant|Sea Serpent|Traitor|Tyrant|Serpent|Raider|Usurper|Beast|Witch",
  treasureNames: "Crown|Cup|Ring|Horn|Chalice|Brooch|Sceptre|Banner|Bell|Throne;Silver|Gold|Pearl|Ivory|Jet|Garnet|Coral|Crystal|Tile|Cork;Kings|Saints|Navigators|Giants|Elders|Mariners|Mothers|Seers|Smiths|Minstrels",
  bookNames: "Book|Chronicle|Roll|Charter|Psalter|Register|Ledger|Gospel|Almanac|Logbook;Kings|Kin|Tides|Stars|Law|Herbs|Saints|Voyages|Towns|Pilgrims;Black|Red|White|Great|Little|Lost|Secret|Holy|Long|Golden",
  deityNames: "Mother|Father|Lady|Lord|Maiden|Smith|Hunter|Weaver|Keeper|Warden;Harvest|Hearth|Forest|Well|Mountain|Sea|Moor|Mist|Storm|Estuary;Kind|Silent|Wise|Old|Strong|Dark|Merciful|Fierce|Fair|Faithful",
};

export const BZ5D = {
  moneyNames: "Solidus|Follis|Gold Piece|Silver Piece|Gold Coin|Silver Coin|Copper Piece|Half Follis|Double Solidus|Small Copper;Silver|Gold|Copper|Bronze|Electrum|Lead|Pewter|Tin|Iron|Nickel;Cross|Eagle|Halo|Virgin|Saint|Crown|Shield|Star|Orb|Lion",
  eventNames: "War|Revolt|Siege|Schism|Campaign|Rising|Truce|Peace|Conquest|Reign;Famine|Plague|Flood|Earthquake|Fire|Drought|Storm|Sickness|Great Hunger|Locusts;Empire|Faith|Icons|Emperors|Town|Monks|Guild|Grain|Arabs|Crusaders",
  calendarNames: "Frost|Thaw|Sowing|Blossom|Hay|Harvest|Vintage|Fog|Mist|Gale;Easter Night|Procession|Carnival|Feast of Saints|Harvest Thanks|Lenten Fair|Vigil Night|Midsummer|Lantern Night|Market Fair;Harvest|Hunter's|Wolf|Frost|Corn|Hay|Fox|Barley|Olive|Vintage",
  skyNames: "Great Wagon|Harp|Ship|Hunter|Swan|Cup|Crown|Plough|Wheel|Bridge;Hen and Chicks|Hound|Fox|Hawk|Raven|Stag|Bear|Lamb|Eagle|Dove;Lamp|Beacon|Cross|Pole Star|Candle|Morning Star|Lantern|Torch|Spark|Icon Lamp",
  armsNames: "Sword|Blade|Spear|Lance|Bow|Mace|Dagger|Axe|Shield|Helm;Bright|Swift|Grim|Faithful|Keen|Holy|Steadfast|Mighty|Bitter|True;Dragon|Giant|Heretic|Traitor|Tyrant|Serpent|Raider|Usurper|Beast|Witch",
  treasureNames: "Crown|Cup|Ring|Cross|Chalice|Reliquary|Sceptre|Banner|Bell|Throne;Silver|Gold|Enamel|Ivory|Jet|Garnet|Porphyry|Crystal|Marble|Mosaic;Emperors|Saints|Martyrs|Giants|Elders|Patriarchs|Mothers|Seers|Monks|Minstrels",
  bookNames: "Book|Chronicle|Roll|Charter|Lectionary|Register|Ledger|Gospel|Hymnal|Psalter;Emperors|Kin|Saints|Stars|Law|Herbs|Fathers|Councils|Cities|Pilgrims;Black|Red|White|Great|Little|Lost|Secret|Holy|Long|Golden",
  deityNames: "Mother|Father|Lady|Lord|Maiden|Smith|Shepherd|Weaver|Keeper|Warden;Harvest|Hearth|Cloister|Spring|Mountain|Sea|Desert|Mist|Storm|Crossroads;Kind|Silent|Wise|Old|Strong|Dark|Merciful|Fierce|Fair|Faithful",
};
