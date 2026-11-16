// Northern Europe tables brief, batch 5d: the frames (name shapes) of the eight modules, by class and by how a culture names. `{N0}`, `{N1}`
// and `{N2}` are the module's own nouns of its three kinds, `{A}` an adjective of the culture; `[founder]`, `[place]` and `[holy person]` are
// fill labels. A culture takes its style's frames as its own: four shared by every style and four of the style's own, with the last two of
// every set fantastic (drawn only where the setting is fantastic): ten in all. A calendar's and a sky's frames name the kind they are for
// (the fourth element), so a month is never drawn a festival's frame.
import { ADJ, STYLE } from "../north5c/content-frames.mjs";
export { ADJ, STYLE };

const T = (s) => s.split("~").map((x) => {
  const i = x.lastIndexOf("*");
  const w = x.slice(i + 1);
  const k = w.match(/^(\d+)(?::(\w+))?(!)?$/);
  const tag = k[3] ? "*" : "";
  return k[2] ? [x.slice(0, i), Number(k[1]), tag, k[2]] : tag ? [x.slice(0, i), Number(k[1]), tag] : [x.slice(0, i), Number(k[1])];
});

// class → { common, adj, of, poss, comp, fant }
const SETS = {
  money: {
    common: "{N1} {N0}*3~{N2} {N0}*3~{A} {N0}*2~{N0} of [place]*1",
    adj: "{A} {N1} {N0}*2~{N2} {N1}*1~The {N2} {N0}*1~Half-{N0}*1",
    of: "{N0} of the {N2}*2~{N0} of [holy person]*1~{N1} {N0} of [place]*1~The {A} {N0}*1",
    poss: "[founder]'s {N0}*2~{N2}'s {N0}*1~{N1} {N0} of the {N2}*1~{N0} of the {N2}*1",
    comp: "{N2} {N1} {N0}*1~{N1} {N2}*1~{N0} of [founder]*1~[place] {N0}*1",
    fant: "Dragon {N0}*1!~Enchanted {N1} {N0}*1!",
  },
  event: {
    common: "{N0} of the {N2}*3~The {N2} {N0}*3~The {N1} of {N2}*2~Year of {N1}*1",
    adj: "The {A} {N0}*2~{N2} {N0}*2~{N0} of [founder]*1~The {N0} of [place]*1",
    of: "{N0} of the {A} {N2}*1~The {N0} of {N2}*2~{N0} of [holy person]*1~The {A} {N1}*1",
    poss: "The {N2}'s {N0}*2~[founder]'s {N0}*2~{N0} of the {N1}*1~The {N1} of [place]*1",
    comp: "{N2}-{N0}*2~{N2} {N1}*1~The {A} {N0}*1~{N0} of [place]*1",
    fant: "The Dragon {N0}*1!~{N1} of the Fey {N2}*1!",
  },
  calendar: {
    common: "{N0} Month*3:month~Month of the {N0}*2:month~{N1} Night*3:festival~Feast of {N1}*3:festival~{N2} Moon*3:moon",
    adj: "{A} {N1}*1:festival~{A} {N2} Moon*1:moon~{A} {N0} Month*1:month",
    of: "{N1} of the {A} {N0}*1:festival~{N2} Moon of the {N0}*1:moon~{A} Month of {N0}*1:month",
    poss: "[founder]'s {N1}*1:festival~{N0}-Moon*1:moon~{A} Month of {N0}*1:month",
    comp: "{N0}-{N1}*1:festival~{N0} Tide*1:month~{N2}-Moon*1:moon",
    fant: "Dragon Moon*1:moon!~Night of the Fey*1:festival!",
  },
  sky: {
    common: "the {N0}*3:constellation~the {N1}*3:constellation~the {A} {N0}*2:constellation~the {N2}*3:light~the {N0} and the {N1}*1:constellation",
    adj: "the {N1}'s {N0}*1:constellation~the {A} {N2}*1:light~the {A} {N1}*1:constellation",
    of: "{N0} of the {N1}*2:constellation~the {A} {N1}*1:constellation~the {N0} of the {N2}*1:constellation",
    poss: "the {N1}'s Eyes*1:constellation~the {N2} of {N0}*1:light~the {A} {N2}*1:light",
    comp: "the {N1} {N0}*2:constellation~the {N2} Star*1:light~the {A} {N1} {N0}*1:constellation",
    fant: "the Dragon's {N0}*1:constellation!~the Fey {N2}*1:light!",
  },
  arms: {
    common: "{N2}-Bane*3~{N1} {N0}*3~{N0} of the {N2}*2~The {N1} {N0}*2",
    adj: "{N2}-Slayer*2~The {A} {N0}*1~{N0} of [founder]*1~{A} {N1}*1",
    of: "{N0} of [holy person]*1~{N0} of the {A} {N2}*1~{N2}'s Bane*2~{N1}-{N0}*1",
    poss: "[founder]'s {N0}*2~{N2}-Render*2~{N1}-Singer*1~{N0} of the {N1}*1",
    comp: "{N2}-Breaker*2~{N1}-{N2}*1~{N0} of [place]*1~The {A} {N2}-Bane*1",
    fant: "{N2}-Bane of the Moon*1!~Spellbound {N0}*1!",
  },
  treasure: {
    common: "{N1} {N0}*3~{N0} of the {N2}*3~The {N1} {N0} of [place]*1~The {A} {N0}*2",
    adj: "The {N1} {N0}*1~{A} {N1} {N0}*2~{N0} of [founder]*1~{N0} of the {A} {N2}*1",
    of: "{N0} of [holy person]*2~{N0} of the {N1} {N2}*1~The {N0} of [place]*1~The {A} {N0} of the {N2}*1",
    poss: "[founder]'s {N0}*3~The {N1} {N0} of the {N2}*1~{N0} of {N1}*1~{A} {N1}*1",
    comp: "The {N1} {N0}*2~{N0} of [place]*1~[founder] {N0}*1~{N1}-{N0}*1",
    fant: "The Enchanted {N0}*1!~{N0} of the Fey {N2}*1!",
  },
  book: {
    common: "The {N2} {N0}*3~{N0} of the {N1}*3~{N0} of [place]*1~The {N2} {N0} of the {N1}*2",
    adj: "The {N0} of {N1}*1~The {A} {N0}*1~The {N0} of [founder]*1~The {N2} {N0} of [place]*1",
    of: "{N0} of [holy person]*1~The {N0} of the {A} {N1}*1~{N0} of the {N2} {N1}*1~The {N2} {N0} of [place]*2",
    poss: "[founder]'s {N0}*2~{N1}-{N0}*1~The {A} {N0} of {N1}*1~{N1}'s {N0}*1",
    comp: "The {N1} {N0}*2~{N1}-{N2} {N0}*1~{N0} of [founder]*1~The {A} {N0}*1",
    fant: "The Enchanted {N0}*1!~{N0} of Spells*1!",
  },
  deity: {
    common: "{N0} of the {N1}*3~The {N2} {N0}*3~{N0} of {N1}*2~The {N0} of the {N1}*2",
    adj: "The {N1} {N0}*1~{N0} of the {N2} {N1}*1~The {A} {N0}*1~{N0} of the {A} {N1}*1",
    of: "The {N2} {N0} of the {N1}*2~{N0} of the {A} {N1}*1~{N0} of [place]*1~The {A} {N0} of the {N1}*1",
    poss: "{N1}-{N0}*3~{N1}-{N0} of the {N2}*1~The {N2} {N1}-{N0}*1~{N0} of the {N2} {N1}*1",
    comp: "{N1}{N0}*1~{N0} of the {N1} Hall*1~The {N2} {N0} of {N1}*1~The {A} {N0}*1",
    fant: "The Star {N0}*1!~{N0} of the Moonlit {N1}*1!",
  },
};
// The deities' epithets read "{N2}" as an adjective: no frame reads it as a noun after "of".
for (const set of Object.values(SETS)) for (const key of Object.keys(set)) set[key] = set[key].split("~").filter((x) => !x.endsWith("*0")).join("~");

/** class → style → frames (the shared four, the style's four and the two fantastic ones: ten, or the calendar's own count). */
export const FRAMES = Object.fromEntries(
  Object.entries(SETS).map(([cls, s]) => [
    cls,
    Object.fromEntries(["adj", "of", "poss", "comp"].map((style) => [style, [...T(s.common), ...T(s[style]), ...T(s.fant)]])),
  ]),
);
export const CELTIC_FRAMES = {
  money: T("{N1} {N0}*3~{N2} {N0}*3~{A} {N0}*2~{N0} of the {N2}*1"),
  event: T("{N0} of the {N2}*3~The {N2} {N0}*3~Year of {N1}*2~The {N1} of {N2}*1"),
  calendar: T("{N0} Month*3:month~{N1} Night*3:festival~Feast of {N1}*2:festival~{N2} Moon*2:moon"),
  sky: T("the {N0}*3:constellation~the {N1}*3:constellation~the {A} {N0}*2:constellation~the {N2}*3:light"),
  arms: T("{N2}-Bane*3~{N1} {N0}*3~{N0} of the {N2}*2~The {A} {N0}*1"),
  treasure: T("{N1} {N0}*3~{N0} of the {N2}*3~The {A} {N0}*2~The {N1} {N0}*1"),
  book: T("The {N2} {N0}*3~{N0} of the {N1}*3~The {A} {N0}*1~{N0} of [place]*1"),
  deity: T("{N0} of the {N1}*3~The {N2} {N0}*3~{N0} of {N1}*2~The {A} {N0}*1"),
};
export const CLASS = { moneyNames: "money", eventNames: "event", calendarNames: "calendar", skyNames: "sky", armsNames: "arms", treasureNames: "treasure", bookNames: "book", deityNames: "deity" };
