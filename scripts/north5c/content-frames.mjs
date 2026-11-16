// Northern Europe tables brief, batch 5c: the frames (name shapes) of the batch, by class of module and by how a culture names, and the
// adjectives each culture draws on. `{N0}`, `{N1}` and `{N2}` are the module's own nouns of its three kinds, `{A}` an adjective of the
// culture; `[founder]`, `[place]` and `[holy person]` are fill labels. Ten frames per style and class; a culture takes its style's frames
// as its own (brief §7: Welsh, Cornish, Irish and Scottish put the generic first; Norse and Scandinavian name by owners and kin; German
// by stacked compounds; English by adjective and noun).

export const STYLE = { english: "adj", welsh: "of", cornish: "of", irish: "of", scottish: "of", norse: "poss", scandinavian: "poss", german: "comp" };

export const ADJ = {
  english: "Old|Grey|Golden|Bright|Fair|Noble|Silent|Stout|Green|Silver",
  welsh: "Old|Grey|Golden|Bright|Fair|Wild|Silent|Hidden|Green|Red",
  scottish: "Old|Grey|Golden|Bright|Fair|Wild|Silent|Stout|Green|Black",
  irish: "Old|Grey|Golden|Bright|Fair|Wild|Silent|Holy|Green|Red",
  cornish: "Old|Grey|Golden|Bright|Fair|Wild|Silent|Hidden|Green|Salt",
  norse: "Old|Grey|Golden|Bold|Fair|Wild|Stern|Black|Iron|Frost",
  scandinavian: "Old|Grey|Golden|Bright|Fair|Northern|Silent|Stout|Green|Blue",
  german: "Old|Grey|Golden|Bright|Fair|Free|Silent|Black|Green|Holy",
  celtic: "Old|Grey|Golden|Wild",
};

const T = (s) => s.split("~").map((x) => { const i = x.lastIndexOf("*"); return [x.slice(0, i), Number(x.slice(i + 1))]; });

// class → style → frames, written `pattern*weight` and separated by `~`.
export const FRAMES = {
  group: {
    adj: T("{A} {N0}*3~{N0} of the {N1}*3~The {N1} {N0}*2~{N0} of the {A} {N2}*1~{A} {N0} of [place]*1~{N2} {N0}*2~The {A} {N2}*1~[founder]'s {N0}*1~{N0} of {N2}*2~The {N0} of [place]*1"),
    of: T("{N0} of the {N1}*4~{N0} of the {A} {N1}*2~The {N0} of {N2}*2~{N0} of [holy person]*1~{A} {N0} of the {N2}*1~{N0} of the {N2}*2~{N0} of [place]*1~The {A} {N0}*1~{N0} of the {N1} and the {N2}*1~{N0} of [founder]*1"),
    poss: T("[founder]'s {N0}*3~The {N1} {N0}*3~{N0} of the {N1}*2~{A} {N1} {N0}*1~{N2} {N0}*2~The {N0} of the {N2}*2~{N1}-{N0}*1~The {A} {N0}*1~{N0} of [place]*1~{N1} {N0} of [place]*1"),
    comp: T("{N2} {N1} {N0}*2~{N0} of the {N1}*3~{A} {N1} {N0}*2~{N1} and {N2} {N0}*1~The {N0} of {N2}*2~{N1} {N0}*3~{N2} {N0}*2~{N0} of [place]*1~The {A} {N1}*1~{N1}-{N2} {N0}*1"),
  },
  tribe: {
    adj: T("{A} {N0}*3~The {N0} of the {N1}*3~{N1} {N0}*2~The {N2} {N0}*2~{N0} of the {A} {N1}*1~{A} {N1} {N0}*2~The {N0} of {N1}*1~{N2} {N0} of the {N1}*1~The {A} {N2}*1~{N0} of the {N2}*2"),
    of: T("{N0} of the {N1}*4~{N0} of the {A} {N1}*2~The {N0} of {N2}*2~{A} {N0} of the {N2}*1~{N0} of the {N2}*2~The {A} {N0}*1~{N0} of the {N1} and the {N2}*1~The {N0} of the {N1}*2~{N2} {N0}*1~{N0} of {N1}*1"),
    poss: T("The {N1} {N0}*3~{N0} of the {N1}*3~{N2} {N0}*2~{A} {N1} {N0}*1~The {N0} of the {N2}*2~{N1}-{N0}*1~The {A} {N0}*1~{N1} {N0} of the {N2}*1~{A} {N0}*1~{N1}-{N2} {N0}*1"),
    comp: T("{N2} {N1} {N0}*2~{N0} of the {N1}*3~{A} {N1} {N0}*2~{N1} and {N2} {N0}*1~The {N0} of {N2}*2~{N1} {N0}*3~{N2} {N0}*2~The {A} {N1} {N0}*1~The {A} {N1}*1~{N1}-{N2} {N0}*1"),
  },
  vessel: {
    adj: T("{N1}*3~The {N1}*2~{A} {N1}*3~{N2}*3~{A} {N2}*2~The {N2}*1~{N1} of [place]*1~[founder]'s {N1}*1~{N2} of [place]*1~{N1} of the {N2}*2"),
    of: T("{N1} of the {N2}*3~{N2} of the {N1}*2~{N1} of [place]*2~{N2}*3~The {N1}*2~{A} {N1}*2~{N2} of [holy person]*1~[holy person]*1~{N1} of the {A} {N2}*1~The {A} {N2}*1"),
    poss: T("{N1}*3~[founder]'s {N1}*3~{N2}*3~{A} {N1}*2~{N1} of the {N2}*2~The {N1}*2~{N2} of [place]*1~{A} {N2}*2~{N1}-{N2}*1~[founder]'s {N2}*1"),
    comp: T("{N1}*3~{A} {N1}*3~{N2}*3~The {N1}*2~{N1} of the {N2}*2~{N2} {N1}*2~{A} {N2}*2~{N1} of [place]*1~[holy person]*1~The {A} {N2}*1"),
  },
  epithet: {
    adj: T("the {N0}*3~the {N1}*3~the {N2}*3~{N0} the {N1}*1~the {N1} {N0}*1~the {A} {N0}*1~{N1}-{N0}*1~the {N1} and {N2}*1~the {A} {N2}*1~the {N2} {N0}*1"),
    of: T("the {N0}*3~the {N1}*3~the {N2}*3~the {A} {N1}*1~the {N0} of the {N1}*1~{N0} the {N2}*1~{N1}-{N0}*1~the {N1} and {N2}*1~the {A} {N2}*1~the {N2} {N0}*1"),
    poss: T("{N0}*3~the {N1}*3~the {N2}*3~{N1}-{N0}*2~the {A} {N0}*1~{N0} the {N1}*1~the {N1} and {N2}*1~the {A} {N2}*1~the {N2} {N0}*1~{N1}{N0}*1"),
    comp: T("the {N0}*3~the {N1}*3~the {N2}*3~{N1}-{N0}*1~the {A} {N0}*1~{N0} the {N1}*1~the {N1} and {N2}*1~the {A} {N2}*1~the {N2} {N0}*1~the {N0} {N2}*1"),
  },
  title: {
    adj: T("{N0} of [place]*3~{N1} of [place]*3~{N0}*2~{N1}*2~{R} of [place]*3~{N1} to the {N0}*1~{R} [name]*2~{A} {N0}*1~Your {N2}*1~{N1} to {R} [name]*1"),
    of: T("{N0} of [place]*3~{N1} of [place]*3~{N0}*2~{N1}*2~{R} of [place]*3~{N1} of the {A} {N0}*1~{R} [name]*2~{A} {N0}*1~Your {N2}*1~{N1} to {R} [name]*1"),
    poss: T("{N0} of [place]*3~{N1} of [place]*3~{N0}*2~{N1}*2~{R} of [place]*3~{N1} to the {N0}*1~{R} [name]*2~{A} {N0}*1~Your {N2}*1~{A} {N1}*1"),
    comp: T("{N0} of [place]*3~{N1} of [place]*3~{N0}*2~{N1}*2~{R} of [place]*3~{N1} to the {N0}*1~{R} [name]*2~{A} {N0}*1~Your {N2}*1~{A} {N1} of [place]*1"),
  },
  family: {
    adj: T("{N0}*3~{N1}*2~{N2}*2~{A} {N0}*1~{N1} {N0}*2~{N0} of {N1}*1~{A} {N1}*1~{N2} of the {N0}*1~{N0}-{N1}*1~{N1}side*1"),
    of: T("{N0}*3~{N1}*2~{N2}*3~{N0} of the {N1}*2~{A} {N0}*1~{N2} of the {N0}*1~{N1} {N0}*1~{A} {N1}*1~{N0}-{N1}*1~{N0} of [place]*1"),
    poss: T("{N0}*3~{N1}*2~{N2}*3~{N1} {N0}*2~{A} {N0}*1~{N0} of {N1}*1~{A} {N1}*1~{N2} of the {N0}*1~{N0}-{N1}*1~{N1}side*1"),
    comp: T("{N0}*3~{N1}*2~{N2}*2~{N1} {N0}*3~{A} {N0}*1~{N0} of {N1}*1~{A} {N1}*1~{N2} of the {N0}*1~{N1}-{N0}*2~{N1}side*1"),
  },
  realm: {
    adj: T("{N0} of the {N1}*3~The {A} {N0}*2~{N0} of {N1}*2~The {N1} {N0}*2~{N0} of the {N2}*2~{A} {N0}*1~{N0} of [place]*1~The {N0} of the {A} {N1}*1~{N1} {N0}*2~{N0} of [founder]*1"),
    of: T("{N0} of the {N1}*4~{N0} of the {N2}*2~The {N0} of {N1}*2~{N0} of [place]*2~{N0} of the {A} {N1}*1~The {A} {N0}*1~{N0} of [founder]*1~{N0} of the {N1} and the {N2}*1~The {N0} of the {N2}*1~{N0} of [holy person]*1"),
    poss: T("{N0} of the {N1}*3~[founder]'s {N0}*2~The {N1} {N0}*3~{N0} of the {N2}*2~The {A} {N0}*1~{N0} of [place]*2~{N1}-{N0}*1~The {N0} of {N1}*1~{N1} and {N2} {N0}*1~{A} {N1} {N0}*1"),
    comp: T("{N1} {N0}*3~{N0} of the {N1}*3~{N2} {N0}*2~{A} {N1} {N0}*1~The {N0} of {N1}*2~{N0} of [place]*2~{N1}-{N2} {N0}*1~The {A} {N0}*1~{N0} of the {N2}*2~{N1} and {N2} {N0}*1"),
  },
  people: {
    adj: T("the {N0}*3~the {A} {N0}*2~the {N2} {N0}*2~the {A} {N1}*2~the {N2} {N1}*2~the {A} {N2} {N1}*1~the {N0} of the {N2}*1~the {A} {N0} of the {N2}*1~the {N1} of the {N0}*1~the {A} {N2} {N0}*1"),
    of: T("the {N0}*3~the {A} {N0}*2~the {N2} {N0}*2~the {A} {N1}*2~the {N2} {N1}*2~the {N1} of the {N2}*1~the {N0} of the {N2}*2~the {A} {N0} of the {N2}*1~the {N1} of the {N0}*1~the {A} {N2} {N0}*1"),
    poss: T("the {N0}*3~the {A} {N0}*2~the {N2} {N0}*2~the {A} {N1}*2~the {N2} {N1}*2~the {A} {N2} {N1}*1~the {N0} of the {N2}*1~the {A} {N0} of the {N2}*1~the {N1} of the {N0}*1~the {A} {N2} {N0}*1"),
    comp: T("the {N0}*3~the {A} {N0}*2~the {N2} {N0}*2~the {A} {N1}*2~the {N2} {N1}*2~the {A} {N2} {N1}*1~the {N0} of the {N2}*1~the {A} {N0} of the {N2}*1~the {N1} of the {N0}*1~the {N2}-{N0}*1"),
  },
};

/** The class of each module. */
export const CLASS = {
  mysticOrders: "group", martialOrders: "group", underworldGroups: "group", tradeGuilds: "group", adventureCompanies: "group", powerFactions: "group", supernaturalCourts: "group", tribalNames: "tribe",
  epithets: "epithet", titles: "title", familyNames: "family", realms: "realm", peoplesTongues: "people",
  ships: "vessel", aircraft: "vessel", landVehicles: "vessel",
};

/** Celtic's own four frames per module class (brief §3.2: the Iron Age mix). */
export const CELTIC_FRAMES = {
  group: T("{N0} of the {N1}*3~The {A} {N0}*2~{N0} of the {N2}*2~The {N1} {N0}*1"),
  vessel: T("{N1}*3~The {N1}*2~{A} {N2}*2~{N2}*2"),
  epithet: T("the {N0}*3~the {N1}*3~the {N2}*3~the {A} {N0}*1"),
  title: T("{N0} of [place]*3~{N1} of [place]*3~{N0}*2~{A} {N0}*1"),
  family: T("{N0}*3~{N1}*2~{N2}*2~{A} {N0}*1"),
  realm: T("{N0} of the {N1}*3~The {A} {N0}*2~{N0} of [place]*2~The {N1} {N0}*1"),
  people: T("the {N0}*3~the {A} {N0}*2~the {A} {N1}*2~the {N2} {N0}*1"),
  tribe: T("{N0} of the {N1}*3~The {A} {N0}*2~{N0} of the {N2}*2~The {N1} {N0}*1"),
};

// 5d §14.1: the last two frames of every class and style are fantastic ones (drawn only where the setting is fantastic), so each module's
// fantastic style cells have shapes as well as words. A frame is [pattern, weight] or [pattern, weight, tag].
const FANT = {
  group: [["The Spellbound {N0}", 1, "*"], ["{N0} of the Starlit {N1}", 1, "*"]],
  tribe: [["The Spirit {N0}", 1, "*"], ["{N0} of the Moonlit {N1}", 1, "*"]],
  vessel: [["Ghost {N1}", 1, "*"], ["Spellbound {N1}", 1, "*"]],
  epithet: [["the Starborn", 1, "*"], ["the Moon-Touched", 1, "*"]],
  title: [["Spellwarden of [place]", 1, "*"], ["Dragon-Warden of [place]", 1, "*"]],
  family: [["{N1} Moonborn", 1, "*"], ["Starborn {N0}", 1, "*"]],
  realm: [["The Dragon {N0}", 1, "*"], ["{N0} of the Fey {N1}", 1, "*"]],
  people: [["the Fey {N0}", 1, "*"], ["the Moonlit {N0}", 1, "*"]],
};
for (const [cls, styles] of Object.entries(FRAMES)) {
  for (const style of Object.keys(styles)) styles[style] = [...styles[style].slice(0, 8), ...FANT[cls]];
}
