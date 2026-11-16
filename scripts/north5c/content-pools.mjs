// Northern Europe tables brief, batch 5d §14.1: the pools the era and fantastic cells are filled from. For each module three pools of tagged words
// ("k:Word@tag", k the kind's number): `pre` (pre-industrial: AN-EM, MD-EM, AN-MD), `mod` (steam age and modern: ST-MO, MO) and `fant` (fantastic).
// A culture's list takes words from a pool, starting at its own place in it (so the cultures differ), until each era it offers has six
// restricted words and it has three fantastic ones (see make-north5c.mjs). A word already in a culture's list is skipped.

const p = (s) => s.split("|").map((x) => x.trim()).filter(Boolean);

export const POOLS = {
  mysticOrders: {
    pre: p("0:Abbey@MD-EM|0:Monastery@AN-EM|0:Hermit Cell@AN-EM|0:Sisters of the Well@AN-EM|0:Seers' Circle@AN-EM|0:Cloistered Order@MD-EM|0:Mystery Cult@AN-MD|0:Oracle Band@AN-MD|0:Grove Priests@AN-MD|2:Midsummer Rite@AN-EM|2:Vigil of the Stars@AN-EM|2:Holy Fire@AN-EM|2:Pilgrim Road@AN-EM|1:Sacred Oak@AN-EM|1:Silver Bough@AN-EM|1:Lamp@MD-EM"),
    mod: p("0:Spiritualist Circle@ST-MO|0:Mission Hall@ST-MO|0:Quiet Fellowship@ST-MO|0:Study Group@MO|0:Meditation Circle@MO|0:Healing Circle@MO|0:Prayer Union@ST-MO|0:Sunday Circle@ST-MO|1:Lamp Light@ST-MO|2:Seance@ST-MO|2:Inner Light@ST-MO|2:Retreat@ST-MO|2:Awakening Meeting@ST-MO"),
    fant: p("0:Coven of Shadows@*|0:Spirit Speakers@*|0:Starlit Conclave@*|1:Phoenix@*|1:Unicorn@*|2:Ley Lines@*|2:Dreamwalking@*|2:Astral Gate@*"),
  },
  martialOrders: {
    pre: p("0:Shield Bearers@AN-MD|0:Bowmen@MD-EM|0:Footmen@AN-EM|0:Horse Guard@MD-EM|0:Castle Garrison@MD-EM|0:War Band@AN-MD|0:Levy@AN-EM|0:Crossbowmen@MD-EM|1:Broadsword@MD-EM|1:War Horn@AN-MD|1:Iron Helm@AN-EM|1:Battle Axe@AN-MD|1:Quarterstaff@AN-EM|2:Warhorse@AN-EM|2:Hawk@AN-EM"),
    mod: p("0:Territorials@ST-MO|0:Home Guard@ST-MO|0:Signals@ST-MO|0:Engineers@ST-MO|0:Commandos@MO|0:Paratroopers@MO|0:Sappers@ST-MO|0:Infantry@ST-MO|1:Machine Gun@ST-MO|1:Field Gun@ST-MO|1:Carbine@ST-MO|1:Trench Spade@ST-MO|2:Bulldog@ST-MO|2:War Horse of Steel@MO"),
    fant: p("0:Dragon Riders@*|0:Griffin Knights@*|0:Spell Blades@*|0:Wyvern Wing@*|1:Runeblade@*|1:Moonsteel@*|2:Wyvern@*|2:Cave Troll@*"),
  },
  underworldGroups: {
    pre: p("0:Brigands@MD-EM|0:Bandits@AN-EM|0:Night Walkers@MD-EM|0:Forest Outlaws@AN-EM|0:Road Robbers@MD-EM|0:Cattle Thieves@AN-EM|0:Hedge Thieves@MD-EM|1:Horse Thieves@AN-EM|1:Poachers of the Deer@MD-EM|1:Toll Dodgers@MD-EM|2:Greenwood@AN-EM|2:Drove Road@AN-EM|2:Ale House Corner@MD-EM|2:Forest Track@AN-EM"),
    mod: p("0:Razor Gang@ST-MO|0:Protection Racket@MO|0:Docks Gang@ST-MO|0:Street Mob@ST-MO|0:Numbers Ring@MO|0:Chain Gang@ST-MO|1:Fences of Stolen Goods@ST-MO|1:Card Sharps@ST-MO|1:Safe Crackers@ST-MO|1:Pawnbrokers' Ring@ST-MO|2:Gaslit Alley@ST-MO|2:Billiard Hall@ST-MO|2:Railway Arches@ST-MO|2:Back Room@ST-MO"),
    fant: p("0:Shadow Thieves@*|0:Nightmare Gang@*|1:Spell Pickers@*|1:Charm Forgers@*|2:Goblin Market@*|2:Underhill Tavern@*"),
  },
  tradeGuilds: {
    pre: p("0:Cutlers@MD-EM|0:Armourers@MD-EM|0:Bowyers@MD-EM|0:Chandlers@MD-EM|0:Glaziers@MD-EM|0:Lorimers@MD-EM|0:Pewterers@MD-EM|0:Scriveners@MD-EM|0:Salters@MD-EM|0:Potters@AN-EM|0:Bronzesmiths@AN-MD|0:Salt Boilers@AN-MD|0:Amber Traders@AN-MD|0:Weavers of the Hall@AN-EM|1:Beeswax@AN-EM|1:Ale@AN-EM|1:Dyes@AN-EM|1:Hides@AN-EM|2:Market Court@MD-EM|2:Fair Ground@AN-EM|2:Toll House@MD-EM"),
    mod: p("0:Engineers@ST-MO|0:Railwaymen@ST-MO|0:Dockers@ST-MO|0:Typesetters@ST-MO|0:Telegraphists@ST-MO|0:Co-operators@ST-MO|0:Tramwaymen@ST-MO|0:Electricians@MO|1:Steel@ST-MO|1:Newsprint@ST-MO|1:Cotton@ST-MO|1:Cement@ST-MO|2:Union Hall@ST-MO|2:Co-operative Store@ST-MO|2:Works@ST-MO"),
    fant: p("0:Dwarf Smiths@*|0:Gnome Assayers@*|0:Elf Weavers@*|1:Mithril@*|1:Dragonglass@*|2:Hall Under the Mountain@*"),
  },
  adventureCompanies: {
    pre: p("0:Wayfaring Band@AN-EM|0:Questing Knights@MD-EM|0:Merchant Venture@MD-EM|0:Pilgrim Band@MD-EM|0:Hunting Party@AN-EM|0:Sea Rovers@AN-EM|0:Caravan@AN-EM|1:Grail Quest@MD-EM|1:Dragon Hunt@MD-EM|1:Lost Kingdom Search@AN-EM|2:Shield and Banner@MD-EM|2:Cog@MD-EM|2:Boar Spear@AN-EM"),
    mod: p("0:Survey Party@ST-MO|0:Relief Column@ST-MO|0:Climbing Club@ST-MO|0:Society of Explorers@ST-MO|0:Rescue Team@MO|0:Mountaineers@ST-MO|1:Polar Expedition@ST-MO|1:Mapping Trip@ST-MO|1:Summit Attempt@ST-MO|2:Compass Rose@ST-MO|2:Ice Axe@ST-MO|2:Theodolite@ST-MO"),
    fant: p("0:Dragon Slayers@*|0:Planeswalkers@*|0:Spell Hunters@*|1:Sunken City Quest@*|1:Lich Hunt@*|2:Staff and Star@*"),
  },
  powerFactions: {
    pre: p("0:Hearth Lords@AN-MD|0:Great Houses@MD-EM|0:Noble Houses@MD-EM|0:Royal Household@MD-EM|0:Church Party@MD-EM|0:Free Towns@MD-EM|0:Hundred Elders@AN-MD|1:Oath of Fealty@MD-EM|1:Succession@AN-EM|1:Blood Right@AN-EM|2:Throne Room@MD-EM|2:Moot Hill@AN-MD|2:Great Hall@AN-EM"),
    mod: p("0:Trade Union@ST-MO|0:Labour Party@ST-MO|0:Liberal Party@ST-MO|0:Home Rule League@ST|0:Chamber of Commerce@ST-MO|0:Civil Service@ST-MO|1:Suffrage@ST-MO|1:Free Trade@ST-MO|1:Home Rule@ST-MO|1:Devolution@MO|2:Town Hall@ST-MO|2:Ministry@ST-MO|2:Council House@ST-MO"),
    fant: p("0:Shadow Court@*|0:Arcane Senate@*|0:Dragon Throne@*|1:Prophecy@*|1:Blood Magic@*|2:Obsidian Tower@*"),
  },
  supernaturalCourts: {
    pre: p("0:Elder Court@AN-EM|0:Hollow Court@AN-EM|0:Moot of the Ancients@AN-MD|0:Grove Court@AN-MD|0:Barrow Court@AN-EM|1:Barrow Dweller@AN-EM|1:Hill Giant@AN-EM|1:Stone Sprite@AN-EM|1:Oak Spirit@AN-EM|2:Standing Stones@AN-MD|2:Ring Fort@AN-EM|2:Holy Well Glade@AN-EM|2:Sacred Spring@AN-EM"),
    mod: p("0:Gaslight Court@ST-MO|0:Spiritualist Court@ST-MO|0:Railway Host@ST-MO|1:Mine Knocker@ST-MO|1:Factory Ghost@ST-MO|1:Lamp Spirit@ST-MO|1:Chimney Sprite@ST-MO|1:Phantom Coach@ST-MO|2:Disused Station@ST-MO|2:Abandoned Pit@ST-MO|2:Fog Bank@ST-MO|2:Empty Mill@ST-MO|2:Ring Road Shadow@MO"),
    fant: p("0:Midnight Parliament@*|0:Court of Thorns@*|1:Frost Giant@*|1:Gryphon@*|2:Fairy Ring@*|2:Moonlit Glade@*"),
  },
  tribalNames: {
    pre: [],
    mod: [],
    fant: p("0:Troll Kin@*|0:Giant Blood@*|0:Elf Kin@*|1:Dragon Hills@*|1:Ghost Moors@*|2:Wyvern@*|2:Stone Giant@*|2:Griffin@*"),
  },
  epithets: {
    pre: p("0:Spear-Breaker@AN-MD|0:Horse-Tamer@AN-EM|0:Oath-Keeper@AN-MD|0:Dragon-Bane@AN-MD|0:Bear-Slayer@AN-EM|0:Hall-Builder@AN-MD|0:Giver of Rings@AN-MD|0:Peace-Weaver@AN-MD|0:Hawk-Master@MD-EM|0:Lord-Slayer@MD-EM|1:Stone-Eyed@AN-EM|1:Winter-Born@AN-EM|1:Long-Shanks@MD-EM|2:Brave-Hearted@AN-EM|2:Open-Handed@AN-EM"),
    mod: p("0:Engine-Maker@ST-MO|0:Pioneer@ST-MO|0:Railway-Builder@ST-MO|0:Reformer of the Poor@ST-MO|0:Orator@ST-MO|0:Campaigner@ST-MO|0:Surveyor@ST-MO|0:Aviator@MO|1:Bespectacled@ST-MO|1:Moustached@ST-MO|1:Sharp-Suited@ST-MO|2:Progressive@ST-MO|2:Level-Headed@ST-MO|2:Self-Made@ST-MO"),
    fant: p("0:Dragon-Rider@*|0:Spell-Weaver@*|0:Giant-Killer@*|1:Moon-Marked@*|1:Star-Eyed@*|2:Fey-Touched@*"),
  },
  titles: {
    pre: p("0:Thegn@AN-MD|0:Hundredman@AN-MD|0:Warden of the March@MD-EM|0:Castellan@MD-EM|0:Pursuivant@MD-EM|0:Herald@MD-EM|0:Hearth Warden@AN-MD|0:Shield Captain@AN-MD|0:Gate Warden@AN-EM|1:Bearer of the Spear@AN-MD|1:Holder of the Hall@AN-MD|1:Master of Feasts@AN-EM|1:Cupbearer@AN-EM|1:Holder of the Keys@MD-EM|1:Master of Horse@MD-EM|1:Master of the Hunt@MD-EM|1:Bearer of the Seal@MD-EM|2:Right Worshipful@MD-EM|2:Right Trusty@MD-EM|2:Noble Birth@AN-EM"),
    mod: p("0:Town Councillor@ST-MO|0:Councillor@ST-MO|0:Convener@ST-MO|0:Superintendent@ST-MO|0:Inspector@ST-MO|0:Doctor@ST-MO|1:Town Clerk@ST-MO|1:Postmaster@ST-MO|1:Stationmaster@ST-MO|1:Surveyor of Taxes@ST-MO|2:Right Honourable@ST-MO|2:Esquire@ST-MO|2:Distinguished Service@ST-MO"),
    fant: p("0:Archmage@*|0:Dragon-Warden@*|0:Spellwarden@*|1:Watcher of the Veil@*|1:Warden of the Wyrm@*|2:Star-Blessed@*"),
  },
  familyNames: {
    pre: p("0:Hundredman@AN-MD|0:Chandler@MD-EM|0:Cutler@MD-EM|0:Cartwright@MD-EM|0:Wheelwright@MD-EM|0:Bowman@MD-EM|1:Old Barrow@AN-EM|1:Thorn Hedge@MD-EM|1:Standing Stone@AN-EM|1:Mill Pond@MD-EM|2:Oathsworn@AN-MD|2:Hearthman@AN-MD|2:Thegn's Son@AN-MD|2:Villein@MD-EM"),
    mod: p("0:Engineer@ST-MO|0:Railwayman@ST-MO|0:Clerk@ST-MO|0:Docker@ST-MO|0:Telegraphist@ST-MO|0:Fitter@ST-MO|1:Terrace@ST-MO|1:Station Road@ST-MO|1:Mill Lane@ST-MO|1:Gasworks@ST-MO|2:Navvy's Son@ST-MO|2:Pitman's Son@ST-MO|2:Emigrant@ST-MO"),
    fant: p("0:Dragon-Born@*|0:Spellwright@*|1:Fey Hollow@*|1:Giant's Stair@*|2:Moon-Touched@*|2:Elf-Friend@*"),
  },
  realms: {
    pre: p("0:Kingdom of the Plains@AN-MD|0:Chiefdom@AN-MD|0:Tribal Kingdom@AN-MD|0:Fiefdom@MD-EM|0:Bishopric@MD-EM|0:Dukedom@MD-EM|0:Hundred Moot@AN-MD|1:Wasteland@AN-EM|1:Forest March@MD-EM|1:Hillfort Country@AN-MD|2:Marchmen@MD-EM|2:Hill Folk@AN-EM|2:Plainsmen@AN-EM"),
    mod: p("0:Dominion@ST-MO|0:Federation@ST-MO|0:Republic@ST-MO|0:Free State@ST-MO|0:Protectorate@ST-MO|0:Confederation@ST-MO|1:Industrial Basin@ST-MO|1:Coalfield@ST-MO|1:Shipyards@ST-MO|1:Motorway Belt@MO|2:Subjects@ST-MO|2:Nation@ST-MO|2:Republicans@ST-MO|2:Federals@MO"),
    fant: p("0:Dragon Empire@*|0:Elven Realm@*|0:Dwarf Kingdom@*|1:Shadowlands@*|1:Crystal Peaks@*|2:Giant Folk@*"),
  },
  peoplesTongues: {
    pre: p("0:Hill People@AN-EM|0:Hearth Folk@AN-EM|0:Plough Folk@AN-EM|0:Shield Folk@AN-MD|0:Forest Dwellers@AN-EM|0:Cattle Folk@AN-EM|1:Old Speech@AN-EM|1:High Speech@AN-EM|1:Hearth Talk@AN-EM|1:Court Speech@MD-EM|2:Barrow Country@AN-EM|2:Moot Land@AN-MD|2:Greenwood@AN-EM"),
    mod: p("0:Townspeople@ST-MO|0:Mill Hands@ST-MO|0:Commuters@MO|0:Emigrants@ST-MO|0:Pitmen@ST-MO|0:Railwaymen@ST-MO|1:Standard English@ST-MO|1:Wireless Talk@MO|1:Street Slang@ST-MO|1:Broadcast Speech@MO|2:Industrial Belt@ST-MO|2:Suburbs@MO|2:Terrace Streets@ST-MO"),
    fant: p("0:Tree-Speakers@*|0:Star-Folk@*|0:Mountain Giants@*|1:Dragon Tongue@*|1:Fey Speech@*|2:Elf Wood@*|2:Fey Hollow@*"),
  },
  ships: {
    pre: p("2:Fair Wind@AN-EM|2:Safe Harbour@AN-EM|2:Good Voyage@AN-EM|2:Sea Queen@AN-EM|2:Wave Dancer@AN-EM|2:Tide Runner@AN-EM|2:Blessing@MD-EM|2:Holy Cross@MD-EM|2:Our Lady's Grace@MD-EM|1:Sea Hawk@AN-EM|1:Sea Stallion@AN-EM|1:Oak Hart@AN-EM|0:Sea Galley@AN-EM|0:Oared Ship@AN-EM"),
    mod: p("2:Pioneer@ST-MO|2:Progress@ST-MO|2:Industry@ST-MO|2:Enterprise@ST-MO|2:Ocean Spray@ST-MO|2:Morning Star@ST-MO|2:Brave Endeavour@ST-MO|2:Steam Queen@ST-MO|1:Steam Lion@ST-MO|1:Iron Gannet@ST-MO|1:Silver Herring@ST-MO|0:Motor Vessel@MO|0:Tug@ST-MO"),
    fant: p("2:Deep Ghost@*|2:Mist Walker@*|1:Kraken@*|1:Leviathan@*|0:Sky Galley@*|0:Wraith Ship@*"),
  },
  aircraft: {
    pre: p("0:Kite@AN-ST|0:Man Kite@AN-ST|0:Cloud Galleon@MD-EM*|0:Sky Barge@AN-EM*|0:Wind Skiff@AN-EM*|0:Star Chariot@AN-MD*|0:Air Cog@MD-EM*|0:Aerial Cutter@EM*|0:Floating Hall@AN-MD*|1:Sky Wind@AN-EM*|1:Thunder Wind@AN-EM*|2:Griffin@AN-EM*|2:Roc@AN-EM*"),
    mod: p("0:Airliner@ST-MO|0:Autogyro@ST-MO|0:Dirigible@ST-MO|0:Triplane@ST-MO|0:Helicopter@MO|0:Jet@MO|1:Jet Stream@MO|1:Updraught@ST-MO|1:Cirrus@ST-MO|2:Skylark@ST-MO|2:Swallow@ST-MO|2:Kestrel@ST-MO"),
    fant: p("0:Cloud Ship@*|0:Sky Dragon@*|0:Storm Barge@*|1:Aether Wind@*|1:Gale Spirit@*|2:Wyvern@*|2:Phoenix@*"),
  },
  landVehicles: {
    pre: p("0:Ox Cart@AN-EM|0:Carriage@MD-ST|0:Litter@AN-EM|0:Pack Train@AN-EM|0:War Chariot@AN-MD|0:Wain@AN-EM|0:Coach@EM-ST|2:Drove Road@AN-EM|2:Pilgrim Way@MD-EM|2:Toll Gate@EM-ST|2:Ford@AN-EM|1:Ox@AN-EM|1:Draught Horse@AN-EM"),
    mod: p("0:Charabanc@ST-MO|0:Steam Roller@ST-MO|0:Traction Engine@ST-MO|0:Trolleybus@ST-MO|0:Motor Coach@MO|0:Lorry Train@MO|0:Diesel Railcar@MO|2:Goods Yard@ST-MO|2:Level Crossing@ST-MO|2:Bus Station@MO|2:Ring Road@MO|1:Steel Steed@ST-MO"),
    fant: p("0:Dragon Wagon@*|0:Siege Golem@*|0:Spell Carriage@*|1:Dire Wolf@*|1:Rune Beast@*|2:Rune Road@*"),
  },
};
