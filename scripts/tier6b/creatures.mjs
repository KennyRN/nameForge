// Second-tier tables brief 6b: mythic creatures of the batch's cultures (12 each at core depth), written into src/data/creatures.json.
// An entry is "name|habitats|tone"; habitats are comma-separated. Egyptian, Ethiopian, Bantu and West African gain four each; Turkic, Mongol, Arabic and Persian have twelve of their own.
import { readFileSync, writeFileSync } from "node:fs";

const NEW = {
  turkic: ["bozkurt|forest|grand", "tepegoz|mountain|grim", "shahmaran|underground|strange", "dev|mountain|grim", "tulpar|sky|grand", "su anasi|water|strange", "karakoncolos|home|grim", "peri|forest|light", "ejderha|mountain|grand", "hortlak|home|grim", "zumrud anka|sky|grand", "cin|desert|strange"],
  mongol: ["blue wolf|forest|grand", "khangarid|sky|grand", "lus|water|grand", "mangus|mountain|grim", "albin|home|grim", "chotgor|home|grim", "almas|mountain|strange", "ongon|home|strange", "khiimori|sky|grand", "olgoi khorkhoi|desert|grim", "tsagaan ebugen|mountain|light", "shulmus|home|grim"],
  arabic: ["ghul|desert|grim", "marid|sea|grand", "silat|desert|grim", "nasnas|desert|strange", "anqa|sky|grand", "hamah|home|grim", "bahamut|sea|grand", "rukh|sky|grand", "qutrub|desert|grim", "shiqq|desert|strange", "jinniyah|home|strange", "afrit|desert|grim"],
  persian: ["azhdaha|mountain|grim", "karkadann|desert|grand", "huma|sky|grand", "nasu|home|grim", "gandarewa|water|grim", "pairika|forest|light", "shirdal|desert|grand", "div-e sefid|mountain|grim", "nahang|water|grim", "mardkhora|desert|grim", "karshipta|sky|strange", "druj|home|grim"],
};
const MORE = {
  egyptian: ["sha|desert|strange", "medjed|home|strange", "nile serpent|water|grim", "phoenix of heliopolis|sky|grand"],
  ethiopian: ["ark guardian|mountain|grand", "debtera's spirit|home|strange", "serpent of the lake|water|grim", "abyssinian ibis|sky|light"],
  bantu: ["nyami nyami|water|grand", "popobawa|home|grim", "chipfalamfula|water|strange", "mngwa|forest|grim"],
  "west-african": ["obayifo|home|grim", "abada|forest|strange", "mmuo|home|strange", "iroko spirit|forest|grand"],
};
const FILE = new URL("../../src/data/creatures.json", import.meta.url);
const j = JSON.parse(readFileSync(FILE, "utf8"));
const parse = (s) => {
  const [name, habitats, tone] = s.split("|");
  return { name, habitats: habitats.split(","), tones: [tone] };
};
for (const [k, list] of Object.entries(MORE)) {
  const have = new Set(j.cultures[k].map((c) => c.name));
  j.cultures[k] = [...j.cultures[k], ...list.map(parse).filter((c) => !have.has(c.name))];
}
for (const [k, list] of Object.entries(NEW)) j.cultures[k] = list.map(parse);
for (const k of [...Object.keys(NEW), ...Object.keys(MORE)]) if (j.cultures[k].length < 12) throw new Error(`${k} has ${j.cultures[k].length} creatures`);
writeFileSync(FILE, `${JSON.stringify(j, null, 1)}\n`);
console.log("wrote creatures for", [...Object.keys(NEW), ...Object.keys(MORE)].join(", "));
