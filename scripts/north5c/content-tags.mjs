// Northern Europe tables brief, batch 5d §14.1: the era and fantastic tags of the 5c signature words. A tag is an era span ("AN-EM", "ST-MO", "MO")
// and/or a trailing "*" for a fantastic word (drawn only where the setting is fantastic). A word with no tag belongs to every era.
// TAGS[module]._all tags a word wherever it appears; TAGS[module][culture] overrides it for one culture.
// EXTRA[module][culture] adds words to a module's kinds: "k:Word@tag|…" (k is the kind's number, 0 to 2). Each core culture gets six words
// restricted to each era its module offers (a span of up to four eras counts for each of them) and three fantastic words; Celtic three fantastic.

/** The eras each module offers (brief §6): the five of the codes, realms without the steam age (it has no era of that name), tribes none. */
export const OFFER = {
  _default: ["AN", "MD", "EM", "ST", "MO"],
  realms: ["AN", "MD", "EM", "MO"],
  tribalNames: [],
};

const PRE = "AN-EM";
const MED = "MD-EM";
const VIK = "AN-MD";
const MOD = "ST-MO";

const t = (spec) => Object.fromEntries(spec.split("|").filter(Boolean).map((x) => { const i = x.lastIndexOf("@"); return [x.slice(0, i), x.slice(i + 1)]; }));

export const TAGS = {
  mysticOrders: {
    _all: t("Chantry@MD-EM|Priory@MD-EM|Cloister@MD-EM|Hermitage@MD-EM|Chapter@MD-EM|Convent@MD-EM|Druid Circle@AN|Druids@AN|Ovates@AN-MD|Bardic Order@AN-MD|Bardic School@AN-EM|Seeress Band@AN-MD*|Rune-Masters@AN-MD*|Temple Guild@AN-MD|Rosicrucian Brotherhood@EM-ST|Illuminated Circle@EM-ST|Pietist Circle@EM-ST|Kirk Session@EM-ST|Covenanters@EM|Secret Society@ST-MO|Lantern Society@ST-MO|Rune Society@ST-MO|Chapel Society@ST-MO|Revival@ST-MO|Pilgrims@MD-EM|Mistletoe@AN-MD|Cauldron@AN-MD|Grail@MD-EM|Pisky@*|Selkie@*|Second Sight@*|Standing Stone@AN-MD|Cairn@AN-MD|Sacrifice@AN-MD|Runes@AN-MD|Sacred Grove@AN-MD|Psalter@MD-EM|Witch Circle@MD-EM*|Cunning Folk@MD-EM|Sisterhood@MD-EM"),
  },
  martialOrders: {
    _all: t("Yeomanry@ST-MO|Militia@EM-ST|Regiment@EM-MO|Battalion@ST-MO|Brigade@ST-MO|Rifles@ST-MO|Fusiliers@EM-ST|Highlanders@EM-MO|Gunners@EM-MO|Grenadiers@EM-ST|Hussars@EM-ST|Dragoons@EM-ST|Skirmishers@ST|Jaegers@EM-ST|Landsknechts@EM|Volunteers@ST-MO|Naval Brigade@ST-MO|Warband@AN-MD|Host@AN-MD|Shield-Wall@AN-MD|Raiding Band@AN-MD|Longship Crew@AN-MD|Berserkers@AN-MD|Axemen@AN-MD|Gallowglasses@MD-EM|Kerns@MD-EM|Pikemen@MD-EM|Reivers@MD-EM|Archers@MD-EM|Spearmen@AN-MD|Lancers@MD-EM|Hero Band@AN-MD|Hosting@AN-MD|Chariot Riders@AN|Teutonic Knights@MD|Order Brethren@MD-EM|Free Company@MD-EM|Sworn Men@AN-MD|Border Riders@MD-EM|Longbow@MD-EM|Bill@MD-EM|Pike@MD-EM|Halberd@MD-EM|Lance@MD-EM|Sabre@EM-ST|Musket@EM-ST|Cannon@EM-ST|Rifle@ST-MO|Bayonet@EM-ST|Claymore@MD-EM|Targe@MD-EM|Crossbow@MD-EM|Torque@AN|Sling@AN-MD|Dart@AN|Mail@MD-EM|Spear@AN-MD|Dirk@EM-ST|Rangers@ST-MO|Coast Watch@EM-ST"),
  },
  underworldGroups: {
    _all: t("Mob@ST-MO|Syndicate@ST-MO|Firm@ST-MO|Cartel@MO|Outfit@ST-MO|Rebecca Rioters@ST|Whiteboys@EM-ST|Ribbonmen@ST|Reivers@MD-EM|Wrecking Gang@EM-ST|Smuggler Band@EM-ST|Robber Band@MD-EM|Outlaw Band@MD-EM|Free Company@MD-EM|Cattle Raiders@MD-EM|Sworn Men@AN-MD|Highwaymen@EM-ST|Footpads@EM-ST|Pickpockets@EM-ST|Cutpurses@MD-EM|Bootleggers@MO|Racketeers@MO|Smugglers@EM-ST|Wreckers@EM-ST|Body Snatchers@ST|Free Traders@EM-ST|Moonrakers@EM-ST|Illicit Distillers@EM-ST|Blackmailers@ST-MO|Hired Blades@MD-EM|Rookery@ST|Dockside@ST-MO|Warehouse@ST-MO|Back Street@ST-MO|Back Lane@ST-MO|Quarry Row@ST|Pit Head@ST-MO"),
  },
  tradeGuilds: {
    _all: t("Mercers@MD-EM|Drapers@MD-EM|Goldsmiths@MD-EM|Fishmongers@MD-EM|Grocers@MD-EM|Vintners@MD-EM|Cordwainers@MD-EM|Saddlers@MD-EM|Skinners@MD-EM|Fullers@MD-EM|Slate Quarriers@ST-MO|Coracle Men@AN-MD|Iron Masters@ST|Hanse Merchants@MD-EM|Amber Workers@AN-MD|Matches@ST-MO|Porter@EM-ST|Coal@ST-MO|Slate@ST-MO|Spices@MD-EM|Furs@AN-MD|Amber@AN-MD|Walrus Ivory@AN-MD|Tar@AN-MD|Livery Hall@MD-EM|Staple@MD-EM|Steelyard@MD-EM|Hanse Hall@MD-EM|Thing Place@AN-MD|Hillfort@AN|Stannary Hall@MD-EM|Exchange@EM-MO|Trades Hall@ST-MO|Custom House@EM-ST|Quarry Hall@ST-MO|Chapel Hall@ST-MO|Cloth Hall@MD-EM|Warehouse@ST-MO|Market Cross@MD-EM|Pilchard Curers@EM-ST"),
  },
  adventureCompanies: {
    _all: t("Free Company@MD-EM|Raiding Band@AN-MD|Longship Crew@AN-MD|Sworn Band@AN-MD|Expedition@ST-MO|Explorers@ST-MO|Venturers@EM-ST|Adventurers@EM-ST|Voyagers@EM-ST|Pilgrims@MD-EM|Rovers@EM-ST|Free Traders@EM-ST|Guild@MD-EM|Crusade@MD|Pilgrimage@MD-EM|Saga@AN-MD|Raid@AN-MD|Survey@ST-MO|Treasure Hunt@ST-MO|Rescue@ST-MO|Compass@EM-MO"),
  },
  powerFactions: {
    _all: t("Barons@MD-EM|Estates@MD-EM|Marcher Lords@MD-EM|Princes@MD-EM|Clan Chiefs@MD-EM|Kirk Party@EM-ST|Lords of the Congregation@EM|Covenanters@EM|Chapel Party@ST-MO|Union@ST-MO|Union Party@ST-MO|Cabinet@ST-MO|Volunteers@ST-MO|Miners' Parliament@MD-EM|Tinners' Council@MD-EM|Thing Assembly@AN-MD|Jarls@AN-MD|Lawspeakers@AN-MD|Kings' Men@MD-EM|Electors@MD-EM|Imperial Diet@EM-ST|Chancery@MD-EM|Free Cities@MD-EM|Crown Party@EM-ST|Parliament Party@EM-ST|League@MD-EM|Judges@AN-MD|Chieftains@AN-MD|Rebels@EM-ST|Reform@ST-MO|Independence@ST-MO|Welfare@MO|Neutrality@ST-MO|Language@ST-MO|Prayer Book@EM|Covenant@EM|Stannary Rights@MD-EM|Tribute@AN-MD|Charter@MD-EM|Parliament House@ST-MO|Thing Field@AN-MD|Law Rock@AN-MD|High Seat@AN-MD|Hill of Assembly@AN-MD|Hill Fort@AN-MD|Hillfort@AN|Sacred Grove@AN|Meeting Place@AN-MD|Imperial Court@MD-EM|Diet Hall@EM-ST|Stannary Court@MD-EM|Count House@ST"),
  },
  supernaturalCourts: { _all: t("Wild Hunt@AN-EM*|Old Barrow@AN-MD|Fairy Mound@AN-MD|Hollow Hill@AN-MD") },
  tribalNames: { _all: {} },
  epithets: {
    _all: t("Unready@MD|Lionheart@MD|Confessor@MD|Barbarossa@MD|Dragon-Slayer@AN-MD|Hostage-Taker@AN-MD|Battle-Winner@AN-MD|Reiver@MD-EM|Border-Raider@MD-EM|Navigator@EM-ST|Reformer@EM-MO|Wrecker@EM-ST|Tinner@MD-EM|Forkbeard@AN-MD|Fairhair@AN-MD|Bluetooth@AN-MD|Boneless@AN-MD|Hardrule@AN-MD|Ironside@AN-MD|Wolf-Slayer@AN-MD|Oath-Breaker@AN-MD|Sea-King@AN-MD|Shield-Breaker@AN-MD"),
  },
  titles: {
    _all: t("Knight@MD-EM|Squire@MD-EM|Baronet@EM-MO|Franklin@MD-EM|Burgess@MD-EM|Yeoman@MD-EM|Bailie@EM-ST|Skald@AN-MD|Steersman@AN-MD|Admiral@EM-MO|Burgomaster@MD-EM|Magistrate@EM-MO|Seer@AN-MD|Almoner@MD-EM|Falconer@MD-EM|Verderer@MD-EM|Justiciar@MD-EM|Harper@AN-MD|Standard-Bearer@AN-MD|Harbour-Warden@AN-MD|Lawman@AN-MD|Auditor@ST-MO|Harbour Master@ST-MO|Butler@MD-EM|Chamberlain@MD-EM|Glory@AN-MD|Fame@AN-MD|Valour@AN-MD|Might@AN-MD"),
  },
  familyNames: {
    _all: t("Fletcher@MD-EM|Thatcher@MD-EM|Miner@ST-MO|Collier@EM-ST|Harper@MD-EM|Ironside@AN-MD|Stoneson@AN-MD|Bearson@AN-MD|Wolfson@AN-MD|Ravenson@AN-MD|Hammerson@AN-MD|Axeson@AN-MD|Greyson@AN-MD|Fairson@AN-MD|Redson@AN-MD|Freeman@MD-EM"),
  },
  realms: {
    _all: t("Earldom@MD-EM|Barony@MD-EM|Lordship@MD-EM|Palatinate@MD-EM|Marcher Lordship@MD-EM|Regality@MD-EM|Thanedom@MD|Over-Kingdom@AN-MD|Jarldom@AN-MD|Thing-Land@AN-MD|Margraviate@MD-EM|Electorate@EM-ST|Prince-Bishopric@MD-EM|Free Imperial City@MD-EM|Landgraviate@MD-EM|Stannary@MD-EM|Hundred@AN-MD|Tribal Land@AN|Commonwealth@MO|Union@ST-MO|Principality@MD-EM|Imperial Free Men@MD-EM|Shield-Men@AN-MD|Tribesmen@AN|Clansmen@MD-EM|Citizens@ST-MO"),
  },
  peoplesTongues: {
    _all: t("Skaldic Verse@AN-MD|Saga-Speech@AN-MD|Rune-Speech@AN-MD|Drovers@MD-EM|Wreckers@EM-ST|Quarrymen@ST-MO|Shield-Men@AN-MD|Raiders@AN-MD|Tribesmen@AN|Bards@AN-MD"),
  },
  ships: {
    _all: t("Cog@MD-EM|Galleon@EM|Carrack@MD-EM|Cutter@EM-ST|Smack@EM-ST|Brig@EM-ST|Barque@EM-ST|Man-of-War@EM-ST|Collier@EM-ST|Packet@EM-ST|Coracle@AN-MD|Coaster@ST-MO|Schooner@EM-ST|Ketch@EM-ST|Trawler@ST-MO|Lugger@EM-ST|Slate Carrier@ST-MO|Steam Coaster@ST-MO|Drifter@ST-MO|Herring Boat@MD-ST|Fishing Smack@EM-ST|Whaler@EM-ST|Clipper@ST|Curragh@AN-MD|Hooker@EM-ST|Galley@AN-EM|Gig@EM-MO|Pilchard Driver@EM-ST|Tin Carrier@EM-ST|Longship@AN-MD|Knarr@AN-MD|Raider@AN-MD|Dragon Ship@AN-MD|Cargo Ship@MO|Steamer@ST-MO|Icebreaker@ST-MO|Frigate@EM-ST|Hulk@MD-EM|Gunboat@ST-MO|Liner@ST-MO|Longboat@AN-MD|Sea Wolf@AN-MD|Wave Rider@AN-MD|Ocean Stallion@AN-MD|Storm Bringer@AN-MD|Foam Strider@AN-MD|Sea Steed@AN-MD|Swift Wind@AN-MD|Long Reach@AN-MD|Sea Glory@AN-MD|Wave Breaker@AN-MD|Holy Ghost@MD-EM|Resolution@EM-ST|Providence@EM-ST|Neutrality@ST-MO|Union@ST-MO|Good Intent@EM-ST"),
  },
  aircraft: {
    _all: t("Airship@ST-MO|Zeppelin@ST-MO|Biplane@ST-MO|Monoplane@ST-MO|Flying Boat@ST-MO|Bomber@ST-MO|Fighter@ST-MO|Glider@ST-MO|Mailplane@ST-MO|Balloon@EM-MO|Seaplane@ST-MO|Sky Serpent@AN-EM*|Sky Ship@AN-EM*|Cloud Rider@AN-EM*|Raven Craft@AN-MD*|Dragon Wing@AN-MD*|Storm Rider@AN-EM*|Wind Steed@AN-EM*|Eagle Craft@AN-EM*|Sky Skiff@AN-EM*|Wave of Air@AN-EM*|Bush Plane@MO|Airliner@MO"),
  },
  landVehicles: {
    _all: t("Locomotive@ST-MO|Steam Engine@ST-MO|Stagecoach@EM-ST|Omnibus@ST-MO|Tram@ST-MO|Lorry@ST-MO|Motorcar@ST-MO|Tractor@ST-MO|Slate Wagon@ST-MO|Coal Truck@ST-MO|Jaunting Car@EM-ST|Mine Wagon@EM-ST|War Wagon@MD-EM|Chariot@AN|Ox Wain@AN-MD|Battle Sled@AN-MD*|Hall Wagon@AN-MD*|Snowmobile@MO|Station@ST-MO|Junction@ST-MO|Terminus@ST-MO|Halt@ST-MO|Depot@ST-MO|Viaduct@ST-MO|Cutting@ST-MO|Siding@ST-MO|Platform@ST-MO|Pit Head@ST-MO|Highland Line@ST-MO|Tunnel@ST-MO|Thing Field@AN-MD"),
  },
};

export const EXTRA = {};
