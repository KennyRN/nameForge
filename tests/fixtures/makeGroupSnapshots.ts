// Records group-name batches before the tone and series brief's engine changes (tone Any must match, §9.2).
import { writeFileSync } from "node:fs";
import { GROUP_FAMILIES, GROUP_SETTINGS, generateGroupNames, typesInSetting } from "../../src/groups/engine";

const genreOf = { FL: ["fantasy", false], FH: ["fantasy", true], MR: ["modern", false], MF: ["modern", true], SF: ["scifi", false] } as const;
const out: Record<string, string[]> = {};
for (const f of GROUP_FAMILIES) {
  for (const s of GROUP_SETTINGS) {
    if (typesInSetting(f, s).length === 0) continue;
    const [genre, fantastic] = genreOf[s];
    for (const [i, extra] of [{}, { people: "invented", front: "may", tradition: "celtic" }, { form: "everyday", front: "hide" }].entries()) {
      out[`${f.key} ${s} ${i}`] = generateGroupNames({ family: f.key, genre, fantastic, count: 30, seed: 100 + i, ...(extra as object) }).names.map((n) => n.text);
    }
  }
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
