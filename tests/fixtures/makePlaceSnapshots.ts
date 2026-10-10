// Records place pack batches (no placeGenerator, no headings) before the place generators brief (§3).
import { readFileSync, writeFileSync } from "node:fs";
import { PlaceNameModel } from "../../src/markov";
import { parseNamesFileContent } from "../../src/nameParser";

const out: Record<string, { names: string[]; endings: string[] }> = {};
for (const pack of ["english-towns", "latin-towns", "native-places"]) {
  const body = readFileSync(`tests/fixtures/packs/${pack}.txt`, "utf8");
  const parsed = parseNamesFileContent(`---\ntype: namePack\npackType: placePack\npackName: ${pack}\nsetting: \n---\n\n${body}`);
  for (const seed of [1, 2, 99]) {
    const model = PlaceNameModel.build(parsed.names);
    const names = model.generateDetailed({ count: 25, faithfulness: 2, strictness: 3, seed }).names;
    out[`${pack} ${seed}`] = { names, endings: model.endings.map((e) => JSON.stringify(e)) };
  }
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
