import { framesOf } from "./lib.mjs";
// Celtic (§3.2): a mix for fantasy and ancient settings: Iron Age Britain and Gaul (hillforts, sacred groves and springs, horse and boar, mother goddesses), 12 words and 4 shapes per module.
export default {
  key: "celtic", keys: ["celtic"], label: "Celtic",
  frames: {
    land: [["{D} of the {tree}", 4, "flora"], ["{B} {D}", 4, "work"], ["{C} {D}", 3, "myth"], ["{D} of the {beast}", 4, "crt"]],
    water: [["{D} of the {seaCreature}", 4, "crt"], ["{B} {D}", 4, "work"], ["{C} {D}", 3, "myth"], ["{D} of {holy}", 3, "sai"]],
    route: [["road", "{B} {N}", 4], ["road", "{D}", 4], ["pilgrim", "{N} to the {D}", 3], ["road", "{C} {N}", 3]],
    sacred: [["{D} of the Mother", 4], ["{B} {D}", 4], ["{C} {D}", 3], ["the {sacredQuality} {D}", 3]],
  },
  land: { B: "Horse|Boar|Oak|Mistletoe", C: "Mother Goddess|Horned God|Otherworld|Giant", D: "Hillfort;AN|Sacred Grove;AN|Sacred Spring;AN|Chariot Road;AN" },
  water: { B: "Salt|Amber|Tin|Horse", C: "Water Goddess|Drowned Land|Otherworld Isle|Sea Giant", D: "Votive Pool;AN|Sacred Lake;AN|Tidal Fort;AN|Trading Beach;AN" },
  route: { B: "Horse|Tin|Salt|Amber", C: "Mother's|Otherworld|Giants'|Phantom", D: "Chariot Way;AN|Hillfort Road;AN|Sacred Way;AN|Ford Way;AN" },
  sacred: { B: "Mother's|Horned God's|Sacred|Druids'", C: "Otherworld|Drowned|Giant's|Antlered", D: "Sacred Grove;AN|Sacred Spring;AN|Votive Pool;AN|Hilltop Shrine;AN" },
};
