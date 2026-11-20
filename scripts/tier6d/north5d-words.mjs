// Brief 6d, the 5d modules (money, events, calendars, sky, arms, treasures, books, deities): the words of Aztec, Maya, Andean, Polynesian and American, each written fresh. Three lists of ten words per module; `@` is an era span.
// The deities are invented: no real god's name (Quetzalcoatl, Huitzilopochtli, Kukulkan, Inti, Viracocha, Pachamama, Tangaroa, Pele and the rest are on the real-names list).
const ADJ_D = "Kind|Silent|Wise|Old|Strong|Dark|Merciful|Fierce|Fair|Faithful";
const BOOK_Q = "Black|Red|White|Great|Little|Lost|Secret|Holy|Long|Golden";
const METALS = "Silver|Gold|Copper|Bronze|Billon|Lead|Pewter|Tin|Iron|Nickel";
export const CW5D = {
  aztec: {
    moneyNames: `Cacao Bean@AN-MD|Cotton Cloak@AN-MD|Quill of Gold Dust@AN-MD|Copper Axe@AN-MD|Real@AN-EM|Peso@AN-EM|Centavo|Tlaco|Peso Note|Silver Dollar;${METALS};Eagle|Feather|Jaguar|Marigold|Star|Sun|Temple|Serpent|Obsidian|Cactus`,
    eventNames: "War|Revolt|Siege|Campaign|Conquest|Rising|Truce|Peace|Raid|Reign;Famine|Plague|Flood|Drought|Fire|Eruption|Sickness|Failed Rains|Failed Harvest|Earthquake;Faith|Empire|Republic|Frontier|Town|Peasants|Weavers|Maize|Throne|Reform",
    calendarNames: "Reed Month|Water Month|Flower Month|Harvest Month|Rain Month|Dry Month|Dust Month|Frost Month|Warm Month|Wind Month;Flower Festival|Procession|Spring Festival|Maize Festival|Harvest Thanks|Lake Feast|Pilgrimage Feast|Midsummer|Lantern Night|Market Fair;Harvest|Hunter's|Rain|Maize|Flower|Reed|Marigold|Cacao|Lake|Eagle",
    skyNames: "Eagle|Jaguar|Hummingbird|Rabbit|Reed|Drum|Plough|Serpent|Net|Bridge;Eagle|Jaguar|Rabbit|Stag|Serpent|Bear|Turkey|Coyote|Heron|Dog;Lamp|Beacon|Traveller's Star|Pole Star|Candle|Morning Star|Lantern|Torch|Spark|Banner",
    armsNames: "Obsidian Sword|Sabre|Spear|Lance|Bow|Club|Atlatl|Axe|Shield|Helm;Bright|Swift|Grim|Faithful|Keen|Righteous|Steadfast|Mighty|Bitter|True;Giant|Traitor|Tyrant|Serpent|Raider|Usurper|Beast|Witch|Ogre|Jaguar Lord",
    treasureNames: "Crown|Cup|Ring|Feather Cloak|Lamp|Brooch|Sceptre|Banner|Bell|Throne;Gold|Jade|Turquoise|Obsidian|Feather|Ruby|Bronze|Crystal|Shell|Bone;Lords|Saints|Heroes|Giants|Elders|Eagles|Mothers|Seers|Smiths|Singers",
    bookNames: `Codex|Chronicle|Scroll|Charter|Register|Ledger|Epic|Almanac|Romance|Tale;Lords|Kin|Tides|Stars|Law|Herbs|Saints|Wars|Towns|Pilgrims;${BOOK_Q}`,
    deityNames: `Lake Warden|Sky Mother|Maize Mother|Rain Bringer|Mountain Smith|Eagle Lord|Hearth Lady|Wind Rider|Flower Maiden|Reed Keeper;Lake|Maize|Rain|Sky|Hearth|Eagle|Mountain|Sun|Forest|Flower;${ADJ_D}`,
  },
  maya: {
    moneyNames: `Cacao Bean@AN-MD|Cotton Cloak@AN-MD|Jade Bead@AN-MD|Copper Bell@AN-MD|Real@AN-EM|Peso@AN-EM|Centavo|Quetzal|Quetzal Note|Silver Dollar;${METALS};Jaguar|Macaw|Quetzal|Maize|Star|Sun|Temple|Serpent|Jade|Cenote`,
    eventNames: "War|Revolt|Siege|Campaign|Conquest|Rising|Truce|Peace|Raid|Reign;Famine|Plague|Flood|Drought|Fire|Windstorm|Sickness|Failed Rains|Failed Harvest|Collapse;Faith|Kingdom|Republic|Frontier|Town|Peasants|Weavers|Maize|Throne|Reform",
    calendarNames: "Maize Month|Water Month|Flower Month|Harvest Month|Rain Month|Dry Month|Smoke Month|Frost Month|Warm Month|Wind Month;Flower Festival|Procession|Spring Festival|Maize Festival|Harvest Thanks|Cenote Feast|Pilgrimage Feast|Midsummer|Lantern Night|Market Fair;Harvest|Hunter's|Rain|Maize|Flower|Reed|Honey|Cacao|Cenote|Jaguar",
    skyNames: "Jaguar|Macaw|Turtle|Peccary|Reed|Drum|Plough|Serpent|Net|Bridge;Jaguar|Macaw|Turtle|Stag|Serpent|Bear|Turkey|Coati|Heron|Dog;Lamp|Beacon|Traveller's Star|Pole Star|Candle|Morning Star|Lantern|Torch|Spark|Banner",
    armsNames: "Obsidian Blade|Sabre|Spear|Lance|Bow|Club|Atlatl|Axe|Shield|Helm;Bright|Swift|Grim|Faithful|Keen|Righteous|Steadfast|Mighty|Bitter|True;Giant|Traitor|Tyrant|Serpent|Raider|Usurper|Beast|Witch|Ogre|Bat Lord",
    treasureNames: "Crown|Cup|Ring|Jade Mask|Lamp|Brooch|Sceptre|Banner|Bell|Throne;Gold|Jade|Shell|Obsidian|Feather|Ruby|Bronze|Crystal|Cacao|Bone;Lords|Saints|Heroes|Giants|Elders|Jaguars|Mothers|Seers|Smiths|Scribes",
    bookNames: `Codex|Chronicle|Scroll|Charter|Register|Ledger|Epic|Almanac|Romance|Tale;Lords|Kin|Tides|Stars|Law|Herbs|Saints|Wars|Towns|Pilgrims;${BOOK_Q}`,
    deityNames: `Maize Warden|Sky Mother|Rain Bringer|Cenote Keeper|Forest Smith|Jaguar Lord|Hearth Lady|Wind Rider|Flower Maiden|Moon Weaver;Cenote|Maize|Rain|Sky|Hearth|Jaguar|Forest|Sun|Moon|Flower;${ADJ_D}`,
  },
  andean: {
    moneyNames: `Silver Bar@AN-MD|Cloth Bundle@AN-MD|Coca Bag@AN-MD|Copper Axe@AN-MD|Real@AN-EM|Sol@AN-EM|Centavo|Llama Note|Sol Note|Silver Dollar;${METALS};Condor|Llama|Puma|Alpaca|Star|Sun|Temple|Serpent|Terrace|Peak`,
    eventNames: "War|Revolt|Siege|Campaign|Conquest|Rising|Truce|Peace|Raid|Reign;Famine|Plague|Flood|Drought|Frost|Earthquake|Sickness|Failed Rains|Failed Harvest|Landslide;Faith|Empire|Republic|Frontier|Town|Peasants|Weavers|Silver|Throne|Reform",
    calendarNames: "Frost Month|Water Month|Flower Month|Harvest Month|Rain Month|Dry Month|Sowing Month|Planting Month|Warm Month|Wind Month;Flower Festival|Procession|Spring Festival|Potato Festival|Harvest Thanks|Lake Feast|Pilgrimage Feast|Midwinter|Lantern Night|Market Fair;Harvest|Herder's|Rain|Potato|Flower|Reed|Quinoa|Maize|Lake|Condor",
    skyNames: "Llama|Condor|Southern Cross|Serpent|Fox|Toad|Plough|Partridge|Net|Bridge;Condor|Llama|Puma|Stag|Serpent|Bear|Fox|Alpaca|Heron|Dog;Lamp|Beacon|Traveller's Star|Pole Star|Candle|Morning Star|Lantern|Torch|Spark|Banner",
    armsNames: "Sling|Sabre|Spear|Lance|Bow|Club|Bolas|Axe|Shield|Helm;Bright|Swift|Grim|Faithful|Keen|Righteous|Steadfast|Mighty|Bitter|True;Giant|Traitor|Tyrant|Serpent|Raider|Usurper|Beast|Witch|Ogre|Condor Lord",
    treasureNames: "Crown|Cup|Ring|Silver Mask|Lamp|Brooch|Sceptre|Banner|Bell|Throne;Gold|Silver|Feather|Obsidian|Wool|Ruby|Bronze|Crystal|Shell|Bone;Lords|Saints|Heroes|Giants|Elders|Condors|Mothers|Seers|Smiths|Weavers",
    bookNames: `Quipu Record|Chronicle|Scroll|Charter|Register|Ledger|Epic|Almanac|Romance|Tale;Lords|Kin|Tides|Stars|Law|Herbs|Saints|Wars|Towns|Pilgrims;${BOOK_Q}`,
    deityNames: `Mountain Warden|Sky Mother|Potato Mother|Rain Bringer|Silver Smith|Condor Lord|Hearth Lady|Wind Rider|Terrace Maiden|Lake Keeper;Mountain|Potato|Rain|Sky|Hearth|Condor|Lake|Sun|Terrace|Silver;${ADJ_D}`,
  },
  polynesian: {
    moneyNames: `Whale Tooth@AN-MD|Tapa Roll@AN-MD|Feather Girdle@AN-MD|Shell Strand@AN-MD|Pound@AN-EM|Dollar@AN-EM|Cent|Tala|Pa'anga Note|Silver Dollar;${METALS};Shark|Turtle|Tern|Coconut|Star|Sun|Marae|Serpent|Shell|Canoe`,
    eventNames: "War|Revolt|Siege|Campaign|Conquest|Rising|Truce|Peace|Raid|Reign;Famine|Plague|Flood|Drought|Cyclone|Tidal Wave|Sickness|Failed Rains|Failed Harvest|Eruption;Faith|Kingdom|Republic|Frontier|Town|Fishers|Weavers|Taro|Throne|Reform",
    calendarNames: "Taro Month|Water Month|Flower Month|Harvest Month|Rain Month|Dry Month|Breadfruit Month|Fishing Month|Warm Month|Wind Month;Flower Festival|Procession|Spring Festival|First Fruits|Harvest Thanks|Reef Feast|Pilgrimage Feast|Midsummer|Lantern Night|Market Fair;Harvest|Fisher's|Rain|Taro|Flower|Reef|Coconut|Breadfruit|Lagoon|Shark",
    skyNames: "Canoe|Frigatebird|Fishhook|Turtle|Reef|Drum|Plough|Serpent|Net|Bridge;Shark|Turtle|Tern|Stag|Serpent|Whale|Dolphin|Gecko|Heron|Dog;Lamp|Beacon|Voyager's Star|Pole Star|Candle|Morning Star|Lantern|Torch|Spark|Banner",
    armsNames: "War Club|Sabre|Spear|Lance|Bow|Sling|Shark-Tooth Sword|Axe|Shield|Helm;Bright|Swift|Grim|Faithful|Keen|Righteous|Steadfast|Mighty|Bitter|True;Giant|Traitor|Tyrant|Serpent|Raider|Usurper|Beast|Witch|Ogre|Shark Lord",
    treasureNames: "Crown|Cup|Ring|Feather Cloak|Lamp|Brooch|Sceptre|Banner|Bell|Throne;Gold|Pearl|Feather|Whale Ivory|Shell|Ruby|Bronze|Crystal|Coral|Bone;Chiefs|Saints|Heroes|Giants|Elders|Sharks|Mothers|Seers|Carvers|Navigators",
    bookNames: `Chant Book|Chronicle|Scroll|Charter|Register|Ledger|Epic|Almanac|Romance|Tale;Chiefs|Kin|Tides|Stars|Law|Herbs|Saints|Wars|Towns|Voyages;${BOOK_Q}`,
    deityNames: `Reef Warden|Sky Mother|Taro Mother|Rain Bringer|Canoe Smith|Shark Lord|Hearth Lady|Wind Rider|Lagoon Maiden|Star Weaver;Reef|Taro|Rain|Sky|Hearth|Shark|Lagoon|Sun|Voyage|Star;${ADJ_D}`,
  },
  american: {
    moneyNames: `Wampum Belt@AN-MD|Beaver Pelt@AN-MD|Shilling@AN-MD|Pine Tree Shilling@AN-MD|Dollar@AN-EM|Eagle@AN-EM|Cent|Nickel|Greenback|Silver Dollar;${METALS};Eagle|Buffalo|Liberty|Beaver|Star|Sun|Capitol|Rattlesnake|Oak|Compass`,
    eventNames: "War|Revolt|Siege|Campaign|Rebellion|Rising|Truce|Peace|Raid|Presidency;Famine|Plague|Flood|Drought|Fire|Blizzard|Sickness|Dust Bowl|Failed Harvest|Panic;Faith|Union|Republic|Frontier|Town|Settlers|Farmers|Cotton|Gold|Reform",
    calendarNames: "Planting Month|Mud Month|Blossom Month|Harvest Month|Rain Month|Dry Month|Haying Month|Frost Month|Warm Month|Wind Month;Founders' Day|Procession|Spring Festival|Corn Festival|Harvest Thanks|County Fair|Revival Meeting|Midsummer|Lantern Night|Market Fair;Harvest|Hunter's|Rain|Corn|Flower|Maple|Cherry|Wheat|Lake|Eagle",
    skyNames: "Eagle|Buffalo|Plough|Wagon|Beaver|Drum|Dipper|Serpent|Net|Bridge;Eagle|Buffalo|Bear|Stag|Serpent|Beaver|Turkey|Coyote|Heron|Dog;Lamp|Beacon|Traveller's Star|Pole Star|Candle|Morning Star|Lantern|Torch|Spark|Banner",
    armsNames: "Musket|Sabre|Spear@AN-MD|Lance@AN-MD|Rifle|Tomahawk|Bowie Knife|Axe|Shield@AN-MD|Helm@AN-MD;Bright|Swift|Grim|Faithful|Keen|Righteous|Steadfast|Mighty|Bitter|True;Giant|Traitor|Tyrant|Serpent|Raider|Usurper|Beast|Witch|Ogre|Outlaw",
    treasureNames: "Crown|Cup|Ring|Liberty Bell|Lamp|Brooch|Sceptre|Banner|Bell|Throne;Gold|Silver|Feather|Iron|Wool|Ruby|Bronze|Crystal|Shell|Bone;Founders|Saints|Heroes|Giants|Elders|Eagles|Mothers|Pioneers|Smiths|Fiddlers",
    bookNames: `Almanac|Chronicle|Scroll|Charter|Register|Ledger|Epic|Journal|Romance|Tale;Founders|Kin|Tides|Stars|Law|Herbs|Saints|Wars|Towns|Pioneers;${BOOK_Q}`,
    deityNames: `Prairie Warden|Sky Mother|Corn Mother|Storm Bringer|River Smith|Thunder Lord|Hearth Lady|Wind Rider|Forest Maiden|Lake Keeper;Prairie|Corn|Storm|Sky|Hearth|Thunder|Forest|Sun|River|Lake;${ADJ_D}`,
  },
};
