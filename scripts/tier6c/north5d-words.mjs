// Brief 6c, money, events, calendars, sky lore, arms, treasures, books and deities: three lists of ten English words per module and culture (`;` between lists), each culture written in its own
// words. A word may carry `@tag` (an era span and/or `*` for fantastic). Month and day names are never real ones and gods are invented (the deities' powers, domains and epithets are not names).
const ADJ_D = "Kind|Silent|Wise|Old|Strong|Dark|Merciful|Fierce|Fair|Faithful";
const BOOK_Q = "Black|Red|White|Great|Little|Lost|Secret|Holy|Long|Golden";
const METALS = "Silver|Gold|Copper|Bronze|Billon|Lead|Pewter|Tin|Iron|Nickel";
export const CW5D = {
  indian: {
    moneyNames: `Silver Rupee@AN-EM|Paisa@AN-EM|Anna@AN-EM|Gold Mohur@AN-EM|Pagoda@AN-EM|Fanam|Small Copper|Rupee|Copper Piece|Cowrie;${METALS};Elephant|Lotus|Tiger|Peacock|Star|Sun|Temple|Fort|Crescent|Sword`,
    eventNames: "War|Revolt|Siege|Campaign|Conquest|Rising|Truce|Peace|Raid|Reign;Famine|Plague|Flood|Drought|Fire|Cyclone|Sickness|Failed Monsoon|Failed Harvest|Earthquake;Faith|Empire|Raj|Frontier|Town|Peasants|Weavers|Cotton|Throne|Reform",
    calendarNames: "Monsoon|Dry Heat|Sowing|Blossom|Harvest|Cool Dew|Fog|Mist|Gale|Rain;Lamp Night|Procession|Spring Festival|Colour Festival|Harvest Thanks|Kite Feast|Pilgrimage Feast|Midsummer|Lantern Night|Market Fair;Harvest|Hunter's|Monsoon|Mango|Rice|Lotus|Jasmine|Cotton|Spice|Banyan",
    skyNames: "Seven Sages|Water Pot|Great Elephant|Archer|Swan|Lotus|Crown|Plough|Wheel|Bridge;Tiger|Elephant|Peacock|Stag|Serpent|Bear|Camel|Lion|Parrot|Bull;Lamp|Beacon|Caravan Star|Pole Star|Candle|Morning Star|Lantern|Torch|Spark|Banner",
    armsNames: "Tulwar|Sabre|Spear|Lance|Bow|Mace|Katar|Axe|Shield|Helm;Bright|Swift|Grim|Faithful|Keen|Righteous|Steadfast|Mighty|Bitter|True;Rakshasa|Giant|Traitor|Tyrant|Serpent|Raider|Usurper|Beast|Witch|Demon King",
    treasureNames: "Crown|Cup|Ring|Horn|Lamp|Brooch|Sceptre|Banner|Bell|Throne;Silver|Gold|Pearl|Ivory|Jade|Ruby|Bronze|Crystal|Sandalwood|Bone;Rajas|Saints|Heroes|Giants|Elders|Elephants|Mothers|Seers|Smiths|Minstrels",
    bookNames: `Book|Chronicle|Scroll|Charter|Register|Ledger|Epic|Almanac|Romance|Tale;Rajas|Kin|Tides|Stars|Law|Herbs|Saints|Wars|Towns|Pilgrims;${BOOK_Q}`,
    deityNames: `Sky Father|Earth Mother|Elephant Lord|Tiger Mother|Mountain Smith|River Keeper|Hearth Lady|Wind Rider|Sun Warden|Lotus Lord;River|Wind|Sky|Hearth|Elephant|Monsoon|Mountain|Sun|Forest|Lotus;${ADJ_D}`,
  },
  chinese: {
    moneyNames: `Cash@AN-EM|Tael@AN-EM|String of Cash@AN-EM|Silver Ingot@AN-EM|Copper Cash@AN-EM|Paper Note|Yuan|Fen|Jiao|Mace;Silver|Gold|Copper|Bronze|Iron|Paper|Jade|Tin|Lead|Nickel;Dragon|Phoenix|Tiger|Crane|Star|Sun|Pagoda|Wall|Lotus|Coin`,
    eventNames: "War|Revolt|Siege|Campaign|Conquest|Rebellion|Truce|Peace|Raid|Reign;Famine|Plague|Flood|Drought|Fire|Typhoon|Sickness|Hard Winter|Failed Harvest|Earthquake;Faith|Dynasty|Mandate|Frontier|Town|Peasants|Salt|Tea|Throne|Reform",
    calendarNames: "Frost|Thaw|Sowing|Blossom|Rain|Harvest|Cold Dew|Mist|Gale|Snow;Lantern Night|Procession|Spring Festival|Ancestors' Feast|Harvest Thanks|Dragon Boat Feast|Pilgrimage Feast|Midsummer|Moon Night|Market Fair;Harvest|Hunter's|Dragon|Peach|Rice|Plum|Lotus|Silk|Tea|Bamboo",
    skyNames: "Northern Dipper|Water Jar|Great Dragon|Archer|Swan|Lotus|Crown|Plough|Wheel|Bridge;Tiger|Dragon|Crane|Stag|Tortoise|Bear|Phoenix|Fox|Magpie|Ox;Lamp|Beacon|Silk Road Star|Pole Star|Candle|Morning Star|Lantern|Torch|Spark|Banner",
    armsNames: "Sword|Sabre|Spear|Halberd|Bow|Mace|Dagger|Axe|Shield|Helm;Bright|Swift|Grim|Faithful|Keen|Jade|Steadfast|Mighty|Bitter|True;Dragon|Giant|Traitor|Tyrant|Serpent|Raider|Usurper|Beast|Fox Witch|Ogre",
    treasureNames: "Seal|Cup|Ring|Bell|Lamp|Brooch|Sceptre|Banner|Mirror|Throne;Jade|Gold|Pearl|Ivory|Silver|Bronze|Crystal|Cedar|Lacquer|Bone;Emperors|Sages|Heroes|Dragons|Elders|Ancestors|Mothers|Seers|Smiths|Poets",
    bookNames: `Book|Annals|Scroll|Charter|Register|Ledger|Classic|Almanac|Romance|Tale;Emperors|Kin|Tides|Stars|Law|Herbs|Sages|Wars|Towns|Pilgrims;${BOOK_Q}`,
    deityNames: `Heaven Father|Earth Mother|Dragon Lord|Crane Mother|Mountain Smith|River Keeper|Hearth Lady|Wind Rider|Sun Warden|Jade Lord;River|Wind|Heaven|Hearth|Dragon|Rain|Mountain|Sun|Harvest|Jade;${ADJ_D}`,
  },
  japanese: {
    moneyNames: `Copper Coin@AN-EM|Ryo@AN-EM|Koban@AN-EM|Silver Piece@AN-EM|Silver Bar@AN-EM|Sen|Yen|Rin|Paper Note|Ingot;${METALS};Crane|Dragon|Cherry|Chrysanthemum|Star|Sun|Castle|Wave|Fan|Paulownia`,
    eventNames: "War|Revolt|Siege|Campaign|Conquest|Uprising|Truce|Peace|Raid|Reign;Famine|Plague|Flood|Drought|Fire|Typhoon|Sickness|Hard Winter|Failed Harvest|Earthquake;Faith|Shogunate|Clans|Frontier|Town|Peasants|Rice|Tea|Throne|Restoration",
    calendarNames: "Frost|Thaw|Rice Planting|Blossom|Rain|Harvest|Cold Dew|Mist|Gale|Snow;Lantern Night|Procession|Spring Festival|Cherry Viewing|Harvest Thanks|Star Feast|Pilgrimage Feast|Midsummer|Moon Viewing|Market Fair;Harvest|Hunter's|Crane|Cherry|Rice|Plum|Maple|Silk|Tea|Bamboo",
    skyNames: "Great Ladle|Water Vessel|Great Crane|Archer|Swan|Lotus|Crown|Plough|Wheel|Bridge;Fox|Crane|Tiger|Stag|Tortoise|Bear|Dragon|Boar|Heron|Ox;Lamp|Beacon|Ferry Star|Pole Star|Candle|Morning Star|Lantern|Torch|Spark|Banner",
    armsNames: "Katana|Short Blade|Spear|Naginata|Bow|Mace|Dagger|Axe|Shield|Helm;Bright|Swift|Grim|Faithful|Keen|Honourable|Steadfast|Mighty|Bitter|True;Oni|Giant|Traitor|Tyrant|Serpent|Raider|Usurper|Beast|Witch|Ogre",
    treasureNames: "Sword|Cup|Ring|Bell|Lamp|Brooch|Fan|Banner|Mirror|Throne;Jade|Gold|Pearl|Ivory|Silver|Bronze|Crystal|Cedar|Lacquer|Bone;Shoguns|Sages|Heroes|Foxes|Elders|Ancestors|Mothers|Seers|Smiths|Poets",
    bookNames: `Book|Chronicle|Scroll|Charter|Register|Ledger|Tale|Almanac|Romance|Diary;Shoguns|Kin|Tides|Stars|Law|Herbs|Monks|Wars|Towns|Pilgrims;${BOOK_Q}`,
    deityNames: `Sky Father|Earth Mother|Fox Lord|Crane Mother|Mountain Smith|River Keeper|Hearth Lady|Wind Rider|Sun Warden|Rice Lord;River|Wind|Sky|Hearth|Fox|Rain|Mountain|Sun|Rice|Sea;${ADJ_D}`,
  },
  korean: {
    moneyNames: `Brass Coin@AN-EM|Silver Bottle@AN-EM|String of Coins@AN-EM|Large Coin@AN-EM|Small Coin@AN-EM|Won|Jeon|Hwan|Paper Note|Ingot;${METALS};Tiger|Dragon|Crane|Pine|Star|Sun|Pavilion|Wall|Lotus|Magpie`,
    eventNames: "War|Revolt|Siege|Campaign|Conquest|Rebellion|Truce|Peace|Raid|Reign;Famine|Plague|Flood|Drought|Fire|Typhoon|Sickness|Hard Winter|Failed Harvest|Earthquake;Faith|Dynasty|Confucians|Frontier|Town|Peasants|Rice|Ginseng|Throne|Reform",
    calendarNames: "Frost|Thaw|Rice Planting|Blossom|Rain|Harvest|Cold Dew|Mist|Gale|Snow;Lantern Night|Procession|Spring Festival|Ancestors' Feast|Harvest Thanks|Swing Feast|Pilgrimage Feast|Midsummer|Full Moon Night|Market Fair;Harvest|Hunter's|Tiger|Azalea|Rice|Plum|Maple|Pine|Tea|Bamboo",
    skyNames: "Great Gourd|Water Pot|Great Tiger|Archer|Swan|Lotus|Crown|Plough|Wheel|Bridge;Tiger|Magpie|Crane|Stag|Tortoise|Bear|Dragon|Boar|Heron|Ox;Lamp|Beacon|Fortress Star|Pole Star|Candle|Morning Star|Lantern|Torch|Spark|Banner",
    armsNames: "Sword|Sabre|Spear|Glaive|Bow|Mace|Dagger|Axe|Shield|Helm;Bright|Swift|Grim|Faithful|Keen|Righteous|Steadfast|Mighty|Bitter|True;Trickster Goblin|Giant|Traitor|Tyrant|Serpent|Raider|Usurper|Beast|Witch|Ogre",
    treasureNames: "Seal|Cup|Ring|Bell|Lamp|Brooch|Sceptre|Banner|Mirror|Crown;Jade|Gold|Pearl|Ivory|Silver|Bronze|Celadon|Cedar|Lacquer|Bone;Kings|Sages|Heroes|Tigers|Elders|Ancestors|Mothers|Seers|Smiths|Poets",
    bookNames: `Book|Chronicle|Scroll|Charter|Register|Ledger|Tale|Almanac|Romance|Annals;Kings|Kin|Tides|Stars|Law|Herbs|Monks|Wars|Towns|Pilgrims;${BOOK_Q}`,
    deityNames: `Sky Father|Earth Mother|Tiger Lord|Magpie Mother|Mountain Smith|River Keeper|Hearth Lady|Wind Rider|Sun Warden|Pine Lord;River|Wind|Sky|Hearth|Tiger|Rain|Mountain|Sun|Rice|Sea;${ADJ_D}`,
  },
};
