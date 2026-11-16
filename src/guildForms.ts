// Northern Europe brief 5d §14.1 item 6: English livery forms ("Worshipful Company of …", "Honourable Company of …") are for English only, and no name
// is all but the name of a real London livery company. A German, Scottish, Welsh… guild takes a form of its own in English ("Guild of the …",
// "Brotherhood of the …", "… Hall"). No Obsidian imports.

/** The trades of the real London livery companies: "Honourable Company of Spectacle Makers" is all but a real name. */
const LIVERY_TRADES = new Set(
  [
    "Mercers", "Grocers", "Drapers", "Fishmongers", "Goldsmiths", "Skinners", "Merchant Taylors", "Haberdashers", "Salters", "Ironmongers", "Vintners", "Clothworkers", "Dyers", "Brewers", "Leathersellers",
    "Pewterers", "Barbers", "Cutlers", "Bakers", "Wax Chandlers", "Tallow Chandlers", "Armourers", "Girdlers", "Butchers", "Saddlers", "Carpenters", "Cordwainers", "Painter-Stainers", "Curriers", "Masons",
    "Plumbers", "Innholders", "Founders", "Poulters", "Cooks", "Coopers", "Tylers and Bricklayers", "Bowyers", "Fletchers", "Blacksmiths", "Joiners", "Weavers", "Woolmen", "Scriveners", "Fruiterers",
    "Plaisterers", "Stationers", "Broderers", "Upholsterers", "Musicians", "Turners", "Basketmakers", "Glaziers", "Horners", "Farriers", "Paviors", "Loriners", "Apothecaries", "Shipwrights", "Spectacle Makers",
    "Clockmakers", "Glovers", "Feltmakers", "Framework Knitters", "Needlemakers", "Gardeners", "Tobacco Pipe Makers", "Wheelwrights", "Distillers", "Pattenmakers", "Glass Sellers", "Coachmakers", "Gunmakers",
    "Fanmakers", "Carmen", "Master Mariners", "Solicitors", "Farmers", "Air Pilots", "Engineers", "Arbitrators", "Insurers", "Actuaries", "Surveyors", "Launderers", "Lightmongers", "Makers of Playing Cards",
  ].map((t) => t.toLowerCase()),
);
const LIVERY = /^(?:The )?(Worshipful|Honourable|Honorable|Livery|Chartered|Royal|Ancient|Loyal) (Company|Society|Fellowship|Guild) of (?:the )?(.+)$/i;
const NON_ENGLISH_CORE = new Set(["welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german"]);

const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
const possessive = (x: string): string => (/s$/i.test(x) ? `${x}'` : `${x}'s`);

/** Whether a name is a real London livery company, or all but one: a livery prefix and a real company's trade. */
export function isLiveryNearMatch(text: string): boolean {
  const m = text.trim().match(LIVERY);
  return !!m && LIVERY_TRADES.has(m[3].toLowerCase());
}

/**
 * A guild name in the form its culture uses. A non-English core culture's livery forms become its own ("Guild of the Spectacle Makers",
 * "Brotherhood of the Spectacle Makers", "Spectacle Makers' Hall"); an English one keeps its form unless it all but names a real livery company.
 */
export function guildForm(text: string, culture: string | undefined): string {
  const m = text.trim().match(LIVERY);
  if (!m) return text;
  const trade = m[3];
  if (culture && NON_ENGLISH_CORE.has(culture)) {
    const forms = [`Guild of the ${trade}`, `Brotherhood of the ${trade}`, `${possessive(trade)} Hall`];
    return forms[hash(text) % forms.length];
  }
  return isLiveryNearMatch(text) ? `Fellowship of the ${trade}` : text;
}
