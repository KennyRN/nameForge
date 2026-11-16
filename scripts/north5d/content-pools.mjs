// Northern Europe tables brief, batch 5d §14: the era and fantastic tags of the batch's words and the pools the era and fantastic cells are filled
// from. A tag is an era span ("AN-EM", "ST-MO", "MO") and/or a trailing "*" for a fantastic word (drawn only where the setting is fantastic); a word
// with no tag belongs to every era. For each module three pools of tagged words ("k:Word@tag", k the kind's number): `pre` (pre-industrial),
// `mod` (steam age and modern) and `fant` (fantastic). A culture's lists take words from the pools, starting at their own place in them (so the
// cultures differ), until each era the module offers holds six restricted words and the culture has three fantastic ones.

/** The eras every 5d module offers (brief §6): ancient, medieval, early modern, steam age and modern. */
export const OFFER = ["AN", "MD", "EM", "ST", "MO"];

const p = (s) => s.split("|").map((x) => x.trim()).filter(Boolean);
const t = (spec) => Object.fromEntries(spec.split("|").filter(Boolean).map((x) => { const i = x.lastIndexOf("@"); return [x.slice(0, i), x.slice(i + 1)]; }));

export const TAGS = {
  moneyNames: { _all: t("Guinea@EM-ST|Sovereign@ST-MO|Angel@MD-EM|Noble@MD-EM|Groat@MD-EM|Cut Silver@AN-MD|Armring@AN-MD|Stater@AN|Thaler@EM-ST|Guilder@EM-ST|Ducat@MD-EM|Plate Money@EM-ST|Nickel@ST-MO|Zinc@ST-MO|Heller@MD-ST|Halfpenny@MD-MO|Florin@MD-ST|Mine Token@ST|Mine Scrip@ST|Tin Token@ST|Electrum@AN-MD|Ring Money@AN-MD|Bawbee@EM-ST|Merk@EM-ST|Scots Pound@MD-ST|Torc Money@AN|Cross Penny@MD-EM|Dollar@EM-ST") },
  eventNames: { _all: t("Strike@ST-MO|Union@ST-MO|Railway@ST-MO|Crop Failure@EM-ST|Cattle Plague@EM-ST|Blight@ST|Clearance@EM-ST|Thing Judgement@AN-MD|Longship@AN-MD|Landing@AN-MD|Mine Collapse@ST-MO|Pilchard Failure@ST|Ash Fall@AN-MD|Siege@AN-EM|Feud@AN-EM|Tithe@MD-EM|Heresy@MD-EM|Barons@MD-EM") },
  calendarNames: { _all: t("Candlemas@MD-EM|Light Festival@MO|Crayfish Night@MO|Hocktide@MD-EM|Guise Dancing@EM-ST|Pilchard Feast@EM-ST|Tin Feast@ST|Harvest Thanks@EM-MO|Carnival@MD-MO|Shooting Feast@EM-ST|Midwinter Sacrifice@AN-MD|Winter Nights@AN-MD|Assembly Days@AN-MD") },
  skyNames: { _all: t("Pole Star@AN-EM|Lantern@ST-MO|Spark@ST-MO|Candle@AN-EM|Torch@AN-EM") },
  armsNames: { _all: t("Rifle@ST-MO|Pike@EM-ST|Sabre@EM-ST|Halberd@MD-EM|Dirk@MD-EM|Targe@MD-EM|Short Sword@AN-MD|Lance@MD-EM|Sling@AN-MD|Pick@ST-MO|Bow@AN-EM|Reiver@MD-EM") },
  treasureNames: { _all: t("Torc@AN|Armring@AN-MD|Quaich@EM-ST|Crozier@MD-EM|Shrine@MD-EM|Throne@MD-EM|Walrus Tooth@AN-EM|Chalice@MD-EM|Sceptre@MD-EM") },
  bookNames: { _all: t("Hymnal@EM-MO|Atlas@EM-MO|Almanac@EM-MO|Gospel@AN-EM|Psalter@MD-EM|Rune Staff@AN-MD|Annals@AN-EM|Law Book@MD-EM|Chapbook@EM-ST|Guild Book@MD-EM|Songbook@EM-MO|Triads@MD-EM|Genealogy@AN-EM|Miracle Play@MD-EM|Mine Book@ST-MO") },
  deityNames: { _all: t("") },
};
/** Words added to a culture's lists beyond the ten per kind (none: the pools do it). */
export const EXTRA = {};

export const POOLS = {
  moneyNames: {
    pre: p("0:Pennyweight@AN-EM|0:Tally@MD-EM|0:Token@MD-EM|0:Pilgrim Badge@MD-EM|0:Hoard Piece@AN-MD|0:Clipping@MD-EM|1:Hammered@AN-EM|1:Wrought@AN-EM|1:Cast@AN-EM|1:Beaten@AN-EM|2:Crowned@MD-EM|2:Mounted@MD-EM|2:Cross-Marked@AN-EM|2:Pelleted@AN-EM"),
    mod: p("0:Banknote@ST-MO|0:Cheque@ST-MO|0:Sixpence@ST-MO|0:Savings Stamp@ST-MO|0:Money Order@ST-MO|0:Postal Order@ST-MO|0:Pay Packet@ST-MO|1:Steel@ST-MO|1:Aluminium@ST-MO|1:Plastic@MO|1:Paper@ST-MO|2:Locomotive@ST-MO|2:Factory@ST-MO|2:Lighthouse@ST-MO|2:Bridge@ST-MO"),
    fant: p("0:Moon Penny@*|0:Dragon Scale@*|0:Fairy Coin@*|1:Moonsilver@*|1:Starsilver@*|2:Phoenix@*|2:Griffin@*"),
  },
  eventNames: {
    pre: p("0:Border Raid@AN-EM|0:Cattle Raid@AN-EM|0:Castle Siege@MD-EM|0:Crusade@MD-EM|0:Peasant Rising@MD-EM|0:Blood Feud@AN-EM|0:Shield Wall@AN-MD|1:Great Dying@MD-EM|1:Hard Winter@AN-EM|1:Sweating Sickness@EM|1:Murrain@AN-EM|2:Holy Land@MD-EM|2:Cattle@AN-EM|2:Tribute@AN-EM"),
    mod: p("0:Lockout@ST-MO|0:Mutiny@ST-MO|0:Air Raid@ST-MO|0:Railway Strike@ST-MO|1:Pit Disaster@ST-MO|1:Mine Flood@ST-MO|1:Cholera@ST|1:Gas Leak@MO|1:Power Failure@MO|2:Coal@ST-MO|2:Steam@ST-MO|2:Oil@MO|2:Election@ST-MO"),
    fant: p("0:Dragon War@*|0:Wizard War@*|1:Curse@*|1:Blight of Shadows@*|2:Elf-King@*|2:Sleeping Giant@*"),
  },
  calendarNames: {
    pre: p("0:Ploughing@AN-EM|0:Lambing@AN-EM|0:Threshing@AN-EM|0:Mead-Brewing@AN-MD|0:Cider-Pressing@MD-EM|0:Peat-Cutting@AN-EM|1:Tithe Day@MD-EM|1:Saint's Day@MD-EM|1:Fasting@MD-EM|1:Hiring Fair@MD-EM|1:Bonfire@AN-EM|1:Wake Night@AN-EM|2:Rye@AN-EM|2:Sheaf@AN-EM|2:Plough@AN-EM"),
    mod: p("0:Gaslight@ST-MO|0:Railway@ST-MO|0:Holiday@ST-MO|0:Allotment@ST-MO|1:Bank Holiday@ST-MO|1:Works Outing@ST-MO|1:Carnival Day@ST-MO|1:Fireworks Night@ST-MO|1:Remembrance@ST-MO|2:Neon@MO|2:Smoke@ST-MO|2:Streetlamp@ST-MO"),
    fant: p("0:Spirit@*|0:Dream@*|1:Fairy Night@*|1:Night of Wisps@*|2:Dragon@*|2:Sprite@*"),
  },
  skyNames: {
    pre: p("0:Great Bear@AN-EM|0:Seven Sisters@AN-EM|0:Hunter's Belt@AN-EM|0:Northern Crown@AN-EM|0:Wheel@AN-EM|0:Gate@AN-EM|1:Sea Serpent@AN-EM|1:Water Snake@AN-EM|1:Fish@AN-EM|1:Dragon@AN-EM|2:Herdsman's Star@AN-EM|2:Dog Star@AN-EM|2:Shepherd's Star@AN-EM|2:Wanderer's Light@AN-EM"),
    mod: p("0:Telescope@ST-MO|0:Satellite@MO|0:Observatory@ST-MO|0:Orrery@ST-MO|1:Space Dog@MO|1:Rocket@MO|2:Satellite Light@MO|2:Comet of the Year@ST-MO|2:Searchlight@ST-MO|2:Beacon Light@ST-MO"),
    fant: p("0:Dragon's Coil@*|0:Wizard's Hat@*|1:Moon Hare@*|1:Star Wolf@*|2:Elf-Light@*|2:Spirit Lamp@*"),
  },
  armsNames: {
    pre: p("0:Broadsword@MD-EM|0:Longsword@MD-EM|0:Battleaxe@AN-EM|0:Warhammer@MD-EM|0:Longbow@MD-EM|0:Pike@EM|1:Ironclad@MD-EM|1:Hammered@AN-EM|1:Forged@AN-EM|2:Knight@MD-EM|2:Brigand@MD-EM|2:Invader@AN-EM|2:Outlaw@AN-EM"),
    mod: p("0:Rifle@ST-MO|0:Revolver@ST-MO|0:Musket@EM-ST|0:Cannon@EM-MO|0:Bayonet@EM-MO|1:Rapid@ST-MO|1:Rifled@ST-MO|2:Redcoat@EM-ST|2:Conqueror@ST-MO|2:Poacher@ST|2:Smuggler@EM-ST"),
    fant: p("0:Spellblade@*|0:Moonblade@*|1:Enchanted@*|1:Starforged@*|2:Wyrm@*|2:Lich@*"),
  },
  treasureNames: {
    pre: p("0:Reliquary@MD-EM|0:Gold Torc@AN|0:Drinking Horn@AN-MD|0:Ring of Oaths@AN-MD|0:Crozier@MD-EM|0:Mazer@MD-EM|1:Whalebone@AN-EM|1:Walrus Ivory@AN-EM|1:Hammered Gold@AN-EM|2:Abbots@MD-EM|2:Chieftains@AN-MD|2:Knights@MD-EM|2:Pilgrims@MD-EM"),
    mod: p("0:Pocket Watch@ST-MO|0:Trophy@ST-MO|0:Medal@ST-MO|0:Locket@ST-MO|1:Chrome@MO|1:Steel@ST-MO|1:Porcelain@ST-MO|2:Explorers@ST-MO|2:Engineers@ST-MO|2:Collectors@ST-MO"),
    fant: p("0:Wishing Ring@*|0:Dragon Hoard@*|1:Moonstone@*|1:Starglass@*|2:Wizards@*|2:Fey Queens@*"),
  },
  bookNames: {
    pre: p("0:Illuminated Bible@MD-EM|0:Cartulary@MD-EM|0:Rune Roll@AN-MD|0:Psalm Book@MD-EM|0:Bestiary@MD-EM|0:Herbal@MD-EM|1:Penance@MD-EM|1:Pilgrimage@MD-EM|1:Heraldry@MD-EM|2:Illuminated@MD-EM|2:Vellum@MD-EM|2:Ancient@AN-EM|2:Chained@MD-EM|0:Wax Tablet@AN-MD|0:Scroll@AN-MD|0:Tally Roll@AN-MD|1:Ancestors@AN-MD|1:Origins@AN-MD|2:Ancestral@AN-MD|2:Oral@AN-MD|2:Hallowed@AN-MD"),
    mod: p("0:Pamphlet@EM-MO|0:Newspaper@ST-MO|0:Timetable@ST-MO|0:Census Return@ST-MO|0:Yearbook@ST-MO|0:Manual@ST-MO|1:Railways@ST-MO|1:Industry@ST-MO|1:Emigration@ST-MO|2:Printed@EM-MO|2:Illustrated@ST-MO|2:Official@ST-MO"),
    fant: p("0:Grimoire@*|0:Spellbook@*|1:Dragon Lore@*|1:Dreams@*|2:Enchanted@*|2:Forbidden@*"),
  },
  deityNames: {
    pre: p("0:Sun Lord@AN-EM|0:Earth Mother@AN-EM|0:Sky Father@AN-EM|0:Spring Maiden@AN-EM|0:Grove Spirit@AN-EM|0:Well Lady@AN-EM|1:Sacred Grove@AN-EM|1:Stone Circle@AN-EM|1:Sacred Spring@AN-EM|2:Ancient@AN-EM|2:Sacred@AN-EM|2:Ever-Living@AN-EM"),
    mod: p("0:Light-Bringer@ST-MO|0:Engine Spirit@ST-MO|0:Machine Mother@ST-MO|1:Steam@ST-MO|1:Iron Road@ST-MO|1:Factory@ST-MO|2:Industrial@ST-MO|2:Electric@MO|2:Silent@ST-MO"),
    fant: p("0:Dragon Lord@*|0:Star Lady@*|1:Moonlit Realm@*|1:Elder Wood@*|2:Eternal@*|2:Starborn@*"),
  },
};
