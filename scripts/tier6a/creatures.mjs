// Second-tier tables brief 6a: mythic creatures of the batch's cultures (12 each at core depth), written into src/data/creatures.json.
// An entry is "name|habitats|tone"; habitats are comma-separated. The five cultures that already had eight gain four; the four the splits make have twelve.
import { readFileSync, writeFileSync } from "node:fs";

const MORE = {
  french: ["tarasque|water|grim", "drac|water|strange", "korrigan|moor|strange", "dame blanche|forest|strange"],
  dutch: ["kludde|forest|grim", "aardmanneke|underground|light", "elf|forest|light", "hellhound|moor|grim"],
  italian: ["befana|home|light", "orco|mountain|grim", "folletto|home|light", "mazzamurello|home|strange"],
  roman: ["satyr|forest|light", "centaur|forest|grand", "sphinx|desert|strange", "incubus|home|grim"],
  slavic: ["kikimora|home|grim", "bannik|home|strange", "vila|forest|light", "likho|home|grim"],
  spanish: ["cuelebre|mountain|grim", "xana|water|light", "trasgu|home|light", "tarasque|water|grim", "basilisk|underground|grim", "sea monster|sea|grim", "werewolf|forest|grim", "duende|home|light", "coco|home|grim", "nuberu|sky|grand", "santa compana|moor|strange", "basajaun|forest|plain"],
  portuguese: ["moura encantada|water|strange", "lobisomem|forest|grim", "papao|home|grim", "cuca|home|grim", "headless mule|forest|strange", "sereia|sea|strange", "alma penada|home|grim", "fada|forest|light", "sea monster|sea|grim", "basilisk|underground|grim", "dragon|mountain|grand", "xana|water|light"],
  greek: ["minotaur|underground|grim", "hydra|water|grim", "siren|sea|strange", "cyclops|mountain|grim", "centaur|forest|grand", "gorgon|underground|grim", "chimera|mountain|strange", "harpy|sky|grim", "satyr|forest|light", "nymph|water|light", "sphinx|desert|strange", "cerberus|underground|grim"],
  byzantine: ["neraida|water|light", "vrykolakas|home|grim", "kallikantzaros|home|strange", "gello|home|grim", "lamia|home|grim", "dragon|mountain|grand", "basilisk|underground|grim", "siren|sea|strange", "centaur|forest|grand", "sea monster|sea|grim", "griffin|mountain|grand", "werewolf|forest|grim"],
};
const FILE = new URL("../../src/data/creatures.json", import.meta.url);
const j = JSON.parse(readFileSync(FILE, "utf8"));
const parse = (s) => {
  const [name, habitats, tone] = s.split("|");
  return { name, habitats: habitats.split(","), tones: [tone] };
};
const out = {};
for (const [k, list] of Object.entries(j.cultures)) {
  if (["spanish", "portuguese", "greek", "byzantine"].includes(k)) continue;
  const add = MORE[k]?.map(parse) ?? [];
  const have = new Set(list.map((c) => c.name));
  out[k] = [...list, ...add.filter((c) => !have.has(c.name))];
  if (k === "iberian") for (const key of ["spanish", "portuguese"]) out[key] = MORE[key].map(parse);
  if (k === "greek-byzantine") for (const key of ["greek", "byzantine"]) out[key] = MORE[key].map(parse);
}
for (const [k, list] of Object.entries(out)) if (MORE[k] && list.length < 12) throw new Error(`${k} has ${list.length} creatures`);
j.cultures = out;
writeFileSync(FILE, `${JSON.stringify(j, null, 1)}\n`);
console.log("wrote creatures for", Object.keys(MORE).join(", "));
