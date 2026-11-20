// Brief 6d A2: each core-depth culture's deities draw six of their ten frames (at least 60% of the weight) from frames of their own, written in its habits and rendered in English; the other four are shared (two plain, two fantastic).
// {N0} a power, {N1} a domain, {N2} an epithet; the literal words are the culture's own (honour, holy place, office). Deities stay invented: no real god's name.
const T = (list) => list.map(([p, w]) => [p, w]);
const HAND = {
  aztec: [["the Feather Lord of the {N1}", 3], ["the Mother of the {N1} Causeway", 3], ["{N0} of the {N1} Precinct", 2], ["the {N2} Eagle of the {N1}", 2], ["the Keeper of the {N1} Garden", 2], ["the Warden of the {N1} Reeds", 2], ["the Singer of the {N1}", 1], ["the {N2} {N0} of the Lake", 1]],
  maya: [["the Lord of the {N1} Cenote", 3], ["the Mother of the {N1} Milpa", 3], ["{N0} of the {N1} Plaza", 2], ["the {N2} Jaguar of the {N1}", 2], ["the Keeper of the {N1} Stela", 2], ["the Watcher of the {N1} Causeway", 2], ["the Reader of the {N1}", 1], ["the {N2} {N0} of the Ball Court", 1]],
  andean: [["the Lord of the {N1} Peak", 3], ["the Mother of the {N1} Terrace", 3], ["{N0} of the {N1} Pass", 2], ["the {N2} Condor of the {N1}", 2], ["the Keeper of the {N1} Lake", 2], ["the Watcher of the {N1} Herds", 2], ["the Runner of the {N1}", 1], ["the {N2} {N0} of the Four Quarters", 1]],
  polynesian: [["the Lord of the {N1} Reef", 3], ["the Mother of the {N1} Lagoon", 3], ["{N0} of the {N1} Marae", 2], ["the {N2} Navigator of the {N1}", 2], ["the Keeper of the {N1} Canoe", 2], ["the Watcher of the {N1} Passage", 2], ["the Chanter of the {N1}", 1], ["the {N2} {N0} of the Star Path", 1]],
  american: [["the Spirit of the {N1} Prairie", 3], ["the Mother of the {N1} Creek", 3], ["{N0} of the {N1} Mesa", 2], ["the {N2} Thunderbird of the {N1}", 2], ["the Keeper of the {N1} Trail", 2], ["the Watcher of the {N1} Fork", 2], ["the Drover of the {N1}", 1], ["the {N2} {N0} of the Homestead", 1]],
  egyptian: [["the Falcon-Headed {N0} of the {N1}", 3], ["the Ibis-Headed {N0} of the {N1}", 3], ["the Jackal-Headed Lord of the {N1}", 2], ["the Cat-Headed Lady of the {N1}", 2], ["the Divine {N0} of the {N1} Delta", 2], ["the Lord of the {N1} Delta", 2], ["the Lioness-Headed {N0} of the {N2} Delta", 1], ["the Ram-Headed {N0} of the {N1}", 1]],
  indian: [["the Lord of the {N1} Tank", 3], ["the Mother of the {N1} Ghat", 3], ["{N0} of the {N1} Temple", 2], ["the {N2} {N0} of the {N1} Grove", 2], ["the Great Mother of the {N1}", 2], ["the Keeper of the {N1} Stepwell", 2], ["the Lady of the {N1} Well", 1], ["the {N2} Lord of the {N1} Tank", 1]],
  chinese: [["the Jade Lady of the {N1}", 3], ["the Immortal of {N1} Peak", 3], ["the Dragon Lord of the {N1}", 2], ["{N0} of the {N1} Temple", 2], ["the {N2} Immortal of the {N1}", 2], ["the Celestial {N0} of the {N1}", 2], ["the Immortal of the {N1} Spring", 1], ["the {N2} Jade Lady of the {N1}", 1]],
  japanese: [["the Great Kami of the {N1}", 3], ["the Lord of the {N1} Shrine", 3], ["{N0} of the {N1} Shrine", 2], ["the {N2} Kami of the {N1}", 2], ["the Kami of {N1} Mountain", 2], ["the Keeper of the {N1} Gate", 2], ["the Kami of the {N1} Spring", 1], ["the {N2} Lord of the {N1} Shrine", 1]],
  korean: [["the Mountain Spirit of the {N1}", 3], ["the Lord of the {N1} Pass", 3], ["the {N2} Spirit of the {N1}", 2], ["{N0} of the {N1} Hermitage", 2], ["the Grandmother of the {N1} Hill", 2], ["the Guardian of the {N1} Fortress", 2], ["the Spirit of the {N1} Valley", 1], ["the {N2} Mountain Spirit of the {N1}", 1]],
};
// [honour, holy place, office, family]; family A is the settled lands' habit, family B the herders', merchants' and farmers' of the warm lands.
const CONF = {
  english: ["Holy", "Well", "Warden", "A"], "anglo-saxon": ["Hallowed", "Barrow", "Steward", "A"], welsh: ["Blessed", "Cairn", "Guardian", "A"], scottish: ["Sacred", "Loch", "Keeper", "A"], irish: ["Venerable", "Hill-Fort", "Watcher", "A"],
  cornish: ["Ancient", "Tor", "Herald", "A"], norse: ["High", "Hall", "Champion", "A"], scandinavian: ["Old", "Grove", "Patron", "A"], german: ["Eldest", "Spring", "Protector", "A"], french: ["Gentle", "Fountain", "Master", "A"],
  dutch: ["Silent", "Dyke", "Sentinel", "A"], spanish: ["Golden", "Courtyard", "Defender", "A"], portuguese: ["Mighty", "Cliff", "Wayfinder", "A"], italian: ["Shining", "Grotto", "Mender", "A"], roman: ["Honoured", "Cypress Grove", "Judge", "A"],
  greek: ["First", "Olive Grove", "Sower", "A"], byzantine: ["Imperial", "Cistern", "Healer", "A"], slavic: ["Elder", "Meadow", "Singer", "A"],
  turkic: ["Eternal", "Pass", "Provider", "B"], mongol: ["Blue", "Pasture", "Maker", "B"], arabic: ["Faithful", "Oasis", "Bearer", "B"], persian: ["Radiant", "Garden", "Holder", "B"],
  ethiopian: ["Wise", "Rock", "Elder", "B"], bantu: ["Ancestral", "Baobab", "Lady", "B"], "west-african": ["Great", "Lagoon", "Giver", "B"],
};
const FAM = {
  A: (H, P, R) => [[`the ${H} {N0} of the {N1}`, 3], [`the {N0} of the {N1} ${P}`, 3], [`the ${R} of the {N1}`, 2], [`{N0} of the {N2} ${P}`, 2], [`the {N2} ${R} of the {N1}`, 2], [`${R} of the ${P} of the {N1}`, 2], [`the ${R} of the ${P}`, 1], [`{N0} of the ${H} ${P}`, 1]],
  B: (H, P, R) => [[`the ${H} {N0} of the {N1}`, 3], [`the ${R} of the {N1} ${P}`, 3], [`{N0} of the ${P}`, 2], [`{N0} of the ${H} {N1}`, 2], [`${H} {N1} ${R}`, 2], [`the {N2} ${R} of the ${P}`, 2], [`the ${H} ${R} of the {N1}`, 1], [`{N0} of the ${H} ${P}`, 1]],
};
export const DEITY_OWN_CULTURES = [...Object.keys(HAND), ...Object.keys(CONF)];
/** The ten frames of a culture: its six own, two shared plain ones and the two shared fantastic ones (`shared` is the style's ten). */
export function deityFrames(culture, shared) {
  const own = HAND[culture] ? T(HAND[culture]) : CONF[culture] ? FAM[CONF[culture][3]](...CONF[culture].slice(0, 3)) : undefined;
  if (!own) return undefined;
  // Eight own frames, then the two shared fantastic frames: ten, and at least 80% of the weight is the culture's own.
  const fant = shared.filter((f) => f[2]).slice(-2);
  // The seventh frame belongs to the ancient to medieval eras and the eighth to the early modern to the steam age, so that the eras read differently.
  const tagged = own.map(([p, w], i) => (i === 6 ? [p, w, "AN-MD"] : i === 7 ? [p, w, "EM-ST"] : [p, w]));
  return [...tagged, ...fant];
}
